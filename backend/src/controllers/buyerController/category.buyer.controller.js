const { asyncHandler } = require("../../utils/asyncHandler.js");
const { ApiResponse } = require("../../utils/ApiResponse.js");
const { Category } = require("../../models/categoryModel/category.Model.js");

const getAllCategories = asyncHandler(async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 1000;
        const skip = (page - 1) * limit;
        const categoriesQuery = Category.find()
            .select("-createdBy -createdAt -updatedAt -__v")
            .skip(skip)
            .limit(limit);
        const categories = await categoriesQuery;
        const totalCategories = await Category.countDocuments();
        const categoriesWithImageUrl = await Promise.all(
            categories.map(async (category) => {
                const imageUrl = await category.categoryImageUrl;
                return {
                    ...category.toObject(),
                    categoryImage: imageUrl,
                };
            })
        );
        res.status(200).json(
            new ApiResponse(
                200,
                {
                    categories: categoriesWithImageUrl,
                    totalCategories,
                    page,
                    limit,
                },
                "Categories retrieved successfully"
            )
        );
    } catch (error) {
        res.status(400).json(
            new ApiResponse(
                400,
                null,
                "Failed to retrieve categories",
                error.message
            )
        );
    }
});

const getCategoryById = asyncHandler(async (req, res) => {
    const categoryId = req.params.id;
    try {
        const category = await Category.findById(categoryId).select(
            "-createdBy -createdAt -updatedAt -__v"
        );
        if (!category) {
            return res
                .status(404)
                .json(new ApiResponse(404, null, "Category not found"));
        }
        const imageUrl = await category.categoryImageUrl;
        const categoryWithImageUrl = {
            ...category.toObject(),
            categoryImage: imageUrl,
        };
        res.status(200).json(
            new ApiResponse(
                200,
                categoryWithImageUrl,
                "Category retrieved successfully"
            )
        );
    } catch (error) {
        res.status(400).json(
            new ApiResponse(
                400,
                null,
                "Failed to retrieve category",
                error.message
            )
        );
    }
});

module.exports = {
    getAllCategories,
    getCategoryById,
};
