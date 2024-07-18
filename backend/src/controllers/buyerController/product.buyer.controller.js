const { asyncHandler } = require("../../utils/asyncHandler");
const { ApiResponse } = require("../../utils/ApiResponse");
const { Product } = require("../../models/productModel/product.Model");

const getAllProducts = asyncHandler(async (req, res) => {
    try {
        const { categoryId, subCategoryId, page, limit } = req.query;
        const pageNumber = parseInt(page, 10) || 1;
        const limitNumber = parseInt(limit, 10) || 1000;
        const skip = (pageNumber - 1) * limitNumber;

        let filter = {};
        if (categoryId && subCategoryId) {
            filter = { categoryId, subCategoryId };
        } else if (categoryId) {
            filter = { categoryId };
        }
        const productsQuery = Product.find(filter)
            .skip(skip)
            .limit(limitNumber);
        const products = await productsQuery;
        const totalProducts = await Product.countDocuments(filter);
        const productsWithUrls = await Promise.all(
            products.map(async (product) => {
                const imageUrls = await product.imageUrls;
                const videoUrls = await product.videoUrls;
                return {
                    ...product.toObject(),
                    images: imageUrls,
                    videos: videoUrls,
                };
            })
        );
        res.status(200).json({
            statusCode: 200,
            data: {
                products: productsWithUrls,
                totalProducts,
                page: pageNumber,
                limit: limitNumber,
            },
            message: "Products retrieved successfully",
            success: true,
        });
    } catch (error) {
        res.status(400).json({
            statusCode: 400,
            message: "Failed to retrieve products",
            error: error.message,
            success: false,
        });
    }
});

const getProductById = asyncHandler(async (req, res) => {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (!product) {
        return res
            .status(404)
            .json(new ApiResponse(404, null, "Product not found"));
    }
    const productWithUrls = {
        ...product.toObject(),
        images: await product.imageUrls,
        videos: await product.videoUrls,
    };
    res.status(200).json(
        new ApiResponse(200, productWithUrls, "Product retrieved successfully")
    );
});

module.exports = {
    getAllProducts,
    getProductById,
};
