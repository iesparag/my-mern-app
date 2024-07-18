const { asyncHandler } = require("../../utils/asyncHandler.js");
const { ApiResponse } = require("../../utils/ApiResponse.js");
const { Category } = require("../../models/categoryModel/category.Model.js");
const {
    SubCategory,
} = require("../../models/subCategoryModel/subCategory.Model.js");
const { uploadFile, deleteFileFromS3 } = require("../../utils/s3Utils.js");
const { Product } = require("../../models/productModel/product.Model.js");

const createCategory = asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    const filePath = req.file?.path;
    const fieldname = req.file?.fieldname;
    const filename = req.file?.filename;
    const contentType = req.file?.mimetype;
    const allowedRoles = ["admin", "manager", "editor"];
    if (!allowedRoles.includes(req.user.role)) {
        return res
            .status(400)
            .json(
                new ApiResponse(
                    400,
                    null,
                    "You do not have permission to create a category"
                )
            );
    }
    const createdBy = req.user._id;
    if (!filePath) {
        return res
            .status(400)
            .json(new ApiResponse(400, null, `${fieldname} file is missing`));
    }
    const s3FileName = `${fieldname}/${filename}`;
    try {
        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            return res
                .status(400)
                .json(new ApiResponse(400, null, "Category already exists"));
        }
        let categoryImage = null;
        if (req.file) {
            const response = await uploadFile(
                filePath,
                s3FileName,
                contentType
            );
            const url = response.url;
            const keyStartIndex = url.indexOf(fieldname);
            const keyEndIndex = url.indexOf("?");
            categoryImage = url.substring(keyStartIndex, keyEndIndex);
        }
        const newCategory = new Category({
            name,
            description,
            createdBy,
            categoryImage,
        });
        await newCategory.save();
        const signedUrl = await newCategory.categoryImageUrl;
        res.status(201).json(
            new ApiResponse(
                201,
                { ...newCategory.toObject(), categoryImage: signedUrl },
                "Category created successfully"
            )
        );
    } catch (error) {
        res.status(400).json(
            new ApiResponse(
                400,
                null,
                "Failed to create category",
                error.message
            )
        );
    }
});

const updateCategory = asyncHandler(async (req, res) => {
    const categoryId = req.params.id;
    const { name, description } = req.body;
    const filePath = req.file?.path;
    const fieldname = req.file?.fieldname;
    const filename = req.file?.filename;
    const contentType = req.file?.mimetype;
    const allowedRoles = ["admin", "manager", "editor"];
    if (!allowedRoles.includes(req.user.role)) {
        return res
            .status(400)
            .json(
                new ApiResponse(
                    400,
                    null,
                    "You do not have permission to update a category"
                )
            );
    }
    try {
        const existingCategory = await Category.findOne({ name });
        if (
            existingCategory &&
            existingCategory._id.toString() !== categoryId
        ) {
            return res
                .status(400)
                .json(
                    new ApiResponse(
                        400,
                        null,
                        "Category with this name already exists"
                    )
                );
        }
        const category = await Category.findById(categoryId);
        if (!category) {
            return res
                .status(404)
                .json(new ApiResponse(404, null, "Category not found"));
        }
        category.name = name || category.name;
        category.description = description || category.description;
        if (req.file) {
            if (category.categoryImage) {
                await deleteFileFromS3(category.categoryImage);
            }
            const s3FileName = `${fieldname}/${filename}`;
            const response = await uploadFile(
                filePath,
                s3FileName,
                contentType
            );
            const url = response.url;
            const keyStartIndex = url.indexOf(fieldname);
            const keyEndIndex = url.indexOf("?");
            category.categoryImage = url.substring(keyStartIndex, keyEndIndex);
        }
        await category.save();
        const signedUrl = await category.categoryImageUrl;
        res.status(200).json(
            new ApiResponse(
                200,
                { ...category.toObject(), categoryImage: signedUrl },
                "Category updated successfully"
            )
        );
    } catch (error) {
        res.status(400).json(
            new ApiResponse(
                400,
                null,
                "Failed to update category",
                error.message
            )
        );
    }
});

const deleteCategory = asyncHandler(async (req, res) => {
    const categoryId = req.params.id;
    const allowedRoles = ["admin"];
    if (!allowedRoles.includes(req.user.role)) {
        return res
            .status(403)
            .json(
                new ApiResponse(
                    403,
                    null,
                    "You do not have permission to delete a category"
                )
            );
    }

    try {
        const category = await Category.findById(categoryId);
        if (!category) {
            return res
                .status(404)
                .json(new ApiResponse(404, null, "Category not found"));
        }
        const subCategories = await SubCategory.find({
            categoryId: categoryId,
        });
        const subCategoryIds = subCategories.map(
            (subCategory) => subCategory._id
        );
        const products = await Product.find({
            subCategoryId: { $in: subCategoryIds },
        });
        await Promise.all(
            products.map(async (product) => {
                await Promise.all(
                    product.images.map(async (image) => {
                        await deleteFileFromS3(image);
                    })
                );
                await Promise.all(
                    product.videos.map(async (video) => {
                        await deleteFileFromS3(video);
                    })
                );
                await Product.findByIdAndDelete(product._id);
            })
        );
        await Promise.all(
            subCategories.map(async (subCategory) => {
                if (subCategory.subCategoryImage) {
                    await deleteFileFromS3(subCategory.subCategoryImage);
                }
                await SubCategory.findByIdAndDelete(subCategory._id);
            })
        );
        if (category.categoryImage) {
            await deleteFileFromS3(category.categoryImage);
        }
        await Category.findByIdAndDelete(categoryId);
        res.status(200).json(
            new ApiResponse(
                200,
                { category, subCategories, products },
                "Category and associated data deleted successfully"
            )
        );
    } catch (error) {
        res.status(500).json(
            new ApiResponse(
                500,
                null,
                "Failed to delete category and associated data",
                error.message
            )
        );
    }
});

module.exports = {
    createCategory,
    updateCategory,
    deleteCategory,
};
