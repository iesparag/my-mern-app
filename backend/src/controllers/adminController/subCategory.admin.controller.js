const { asyncHandler } = require("../../utils/asyncHandler.js");
const { ApiResponse } = require("../../utils/ApiResponse.js");
const {
    SubCategory,
} = require("../../models/subCategoryModel/subCategory.Model.js");
const { Category } = require("../../models/categoryModel/category.Model.js");
const { uploadFile, deleteFileFromS3 } = require("../../utils/s3Utils");
const { Product } = require("../../models/productModel/product.Model.js");

const createSubCategory = asyncHandler(async (req, res) => {
    const { name, description, categoryId } = req.body;
    const createdBy = req.user._id;
    let subCategoryImage;
    if (!req.file) {
        return res
            .status(400)
            .json(new ApiResponse(400, null, "SubCategory image is required"));
    }
    const { path, fieldname, filename, mimetype } = req.file;
    const s3FileName = `${fieldname}/${filename}`;
    const response = await uploadFile(path, s3FileName, mimetype);
    const url = response.url;
    const keyStartIndex = url.indexOf(fieldname);
    const keyEndIndex = url.indexOf("?");
    subCategoryImage = url.substring(keyStartIndex, keyEndIndex);
    const existingSubCategory = await SubCategory.findOne({ name });
    if (existingSubCategory) {
        return res
            .status(400)
            .json(
                new ApiResponse(400, null, "SubCategory name must be unique")
            );
    }
    const newSubCategory = new SubCategory({
        name,
        description,
        categoryId,
        createdBy,
        subCategoryImage,
    });
    await newSubCategory.save();
    const signedUrl = await newSubCategory.subCategoryImageUrl;
    await Category.findByIdAndUpdate(categoryId, {
        $push: { subCategories: newSubCategory._id },
    });
    res.status(201).json(
        new ApiResponse(
            201,
            { ...newSubCategory.toObject(), subCategoryImage: signedUrl },
            "SubCategory created successfully"
        )
    );
});

const updateSubCategory = asyncHandler(async (req, res) => {
    const subCategoryId = req.params.id;
    const updates = req.body;
    if (updates._id) {
        return res
            .status(400)
            .json(
                new ApiResponse(
                    400,
                    null,
                    "Updating the _id field is not allowed"
                )
            );
    }
    const existingSubCategory = await SubCategory.findById(subCategoryId);
    if (!existingSubCategory) {
        return res
            .status(404)
            .json(new ApiResponse(404, null, "SubCategory not found"));
    }
    if (
        updates.categoryId &&
        updates.categoryId.toString() !==
            existingSubCategory.categoryId.toString()
    ) {
        return res
            .status(400)
            .json(
                new ApiResponse(
                    400,
                    null,
                    "Updating the categoryId field is not allowed"
                )
            );
    }
    let subCategoryImage;
    if (req.file) {
        const { path, fieldname, filename, mimetype } = req.file;
        const s3FileName = `${fieldname}/${filename}`;
        const response = await uploadFile(path, s3FileName, mimetype);
        const url = response.url;
        const keyStartIndex = url.indexOf(fieldname);
        const keyEndIndex = url.indexOf("?");
        subCategoryImage = url.substring(keyStartIndex, keyEndIndex);
        updates.subCategoryImage = subCategoryImage;
        if (existingSubCategory.subCategoryImage) {
            const oldKey = existingSubCategory.subCategoryImage;
            await deleteFileFromS3(oldKey);
        }
    }
    const nameConflictSubCategory = await SubCategory.findOne({
        name: updates.name,
    });
    if (
        nameConflictSubCategory &&
        nameConflictSubCategory._id.toString() !== subCategoryId
    ) {
        return res
            .status(400)
            .json(
                new ApiResponse(400, null, "SubCategory name must be unique")
            );
    }
    const subCategory = await SubCategory.findByIdAndUpdate(
        subCategoryId,
        updates,
        {
            new: true,
            runValidators: true,
        }
    );
    if (!subCategory) {
        return res
            .status(404)
            .json(new ApiResponse(404, null, "SubCategory not found"));
    }
    const signedUrl = await subCategory.subCategoryImageUrl;
    res.status(200).json(
        new ApiResponse(
            200,
            { ...subCategory.toObject(), subCategoryImage: signedUrl },
            "SubCategory updated successfully"
        )
    );
});

// Delete a subcategory
const deleteSubCategory = asyncHandler(async (req, res) => {
    const subCategoryId = req.params.id;
    try {
        const subCategory = await SubCategory.findById(subCategoryId);
        if (!subCategory) {
            return res
                .status(404)
                .json(new ApiResponse(404, null, "SubCategory not found"));
        }
        const products = await Product.find({ subCategoryId: subCategoryId });
        const deletedProducts = await Promise.all(
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
                return Product.findByIdAndDelete(product._id);
            })
        );
        await Category.findByIdAndUpdate(subCategory.categoryId, {
            $pull: { subCategories: subCategoryId },
        });
        if (subCategory.subCategoryImage) {
            await deleteFileFromS3(subCategory.subCategoryImage);
        }
        await SubCategory.findByIdAndDelete(subCategoryId);
        res.status(200).json(
            new ApiResponse(
                200,
                { deletedProducts },
                "SubCategory and associated products deleted successfully"
            )
        );
    } catch (error) {
        console.error("Error deleting subcategory and products:", error);
        res.status(500).json(
            new ApiResponse(
                500,
                null,
                "Failed to delete subcategory and products."
            )
        );
    }
});

module.exports = {
    createSubCategory,
    updateSubCategory,
    deleteSubCategory,
};
