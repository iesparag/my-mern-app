const { asyncHandler } = require("../../utils/asyncHandler.js");
const { ApiResponse } = require("../../utils/ApiResponse.js");
const {
    SubCategory,
} = require("../../models/subCategoryModel/subCategory.Model.js");

const getAllSubCategories = asyncHandler(async (req, res) => {
    try {
        const { categoryId, page, limit } = req.query;
        const pageNumber = parseInt(page, 10) || 1;
        const limitNumber = parseInt(limit, 10) || 1000;
        const skip = (pageNumber - 1) * limitNumber;

        let filter = {};
        if (categoryId) {
            filter = { categoryId };
        }
        const subCategoriesQuery = SubCategory.find(filter)
            .select("-createdBy -createdAt -updatedAt -__v")
            .skip(skip)
            .limit(limitNumber);
        const subCategories = await subCategoriesQuery;
        const totalSubCategories = await SubCategory.countDocuments(filter);
        const subCategoriesWithImageUrl = await Promise.all(
            subCategories.map(async (subCategory) => {
                const imageUrl = await subCategory.subCategoryImageUrl;
                return {
                    ...subCategory.toObject(),
                    subCategoryImage: imageUrl,
                };
            })
        );
        res.status(200).json(
            new ApiResponse(
                200,
                {
                    subCategories: subCategoriesWithImageUrl,
                    totalSubCategories,
                    page: pageNumber,
                    limit: limitNumber,
                },
                "SubCategories retrieved successfully"
            )
        );
    } catch (error) {
        res.status(400).json(
            new ApiResponse(
                400,
                null,
                "Failed to retrieve subcategories",
                error.message
            )
        );
    }
});

const getSubCategoryById = asyncHandler(async (req, res) => {
    const subCategoryId = req.params.id;
    try {
        const subCategory = await SubCategory.findById(subCategoryId).select(
            "-createdBy -createdAt -updatedAt -__v"
        );
        if (!subCategory) {
            return res
                .status(404)
                .json(new ApiResponse(404, null, "SubCategory not found"));
        }
        const imageUrl = await subCategory.subCategoryImageUrl;
        const subCategoryWithImageUrl = {
            ...subCategory.toObject(),
            subCategoryImage: imageUrl,
        };

        res.status(200).json(
            new ApiResponse(
                200,
                subCategoryWithImageUrl,
                "SubCategory retrieved successfully"
            )
        );
    } catch (error) {
        res.status(400).json(
            new ApiResponse(
                400,
                null,
                "Failed to retrieve subcategory",
                error.message
            )
        );
    }
});

module.exports = {
    getAllSubCategories,
    getSubCategoryById,
};
