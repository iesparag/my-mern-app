const { asyncHandler } = require("../../utils/asyncHandler.js");
const { ApiResponse } = require("../../utils/ApiResponse.js");
const { User } = require("../../models/userModel/user.model.js");
const {Product} = require("../../models/productModel/product.Model.js")

const getUserWishlist = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const user = await User.findById(userId).populate('wishlist');
    if (!user) {
        return res.status(404).json(new ApiResponse(404, null, "User not found"));
    }
    const filteredWishlist = user.wishlist.filter(product => product!== undefined);
    const products = await Promise.all(filteredWishlist.map(async (productId) => {
        const product = await Product.findById(productId);
        if (!product) {
            return null;
        }
        const imageUrls = await product.imageUrls;
        const videoUrls = await product.videoUrls;
        return {
           ...product.toObject(),
            images: imageUrls,
            videos: videoUrls,
        };
    }));
    const finalProducts = products.filter(product => product!== null);
    res.status(200).json(new ApiResponse(200, finalProducts, "Wishlist retrieved successfully"));
});


const addItemToWishlist = asyncHandler(async (req, res) => {
    const { productId } = req.body;
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json(new ApiResponse(404, null, "User not found"));
    }
    const productIndex = user.wishlist.findIndex(item => item.toString() === productId);
    if (productIndex < 0) {
        user.wishlist.push(productId);
    } else {
        return res.status(200).json(new ApiResponse(200, null, "Item already in wishlist"));
    }
    await user.save();
    const product = await Product.findById(productId);
    if (!product) {
        return res.status(404).json(new ApiResponse(404, null, "Product not found"));
    }
    const imageUrls = await product.imageUrls;
    const videoUrls = await product.videoUrls;
    const detailedProduct = {
        ...product.toObject(),
        images: imageUrls,
        videos: videoUrls,
    };
    res.status(200).json(new ApiResponse(200, detailedProduct, "Item added to wishlist successfully"));
});

// Remove item from wishlist
const removeItemFromWishlist = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json(new ApiResponse(404, null, "User not found"));
    }
    const productIndex = user.wishlist.findIndex(item => item.toString() === productId);
    if (productIndex < 0) {
        return res.status(404).json(new ApiResponse(404, null, "Product not found in wishlist"));
    }
    const product = await Product.findById(productId);
    if (!product) {
        return res.status(404).json(new ApiResponse(404, null, "Product not found"));
    }
    const imageUrls = await product.imageUrls;
    const videoUrls = await product.videoUrls;
    const removedProductDetails = {
        ...product.toObject(),
        images: imageUrls,
        videos: videoUrls,
    };
    user.wishlist.splice(productIndex, 1);
    await user.save();
    res.status(200).json(new ApiResponse(200, removedProductDetails, "Item removed from wishlist successfully"));
});

const moveToCart = asyncHandler(async (req, res) => {
    const { productId } = req.body; 
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json(new ApiResponse(404, null, "User not found"));
    }
    const productIndexInWishlist = user.wishlist.findIndex(item => item.toString() === productId);
    if (productIndexInWishlist < 0) {
        return res.status(404).json(new ApiResponse(404, null, "Product not found in wishlist"));
    }
    const product = await Product.findById(productId);
    if (!product) {
        return res.status(404).json(new ApiResponse(404, null, "Product not found"));
    }
    const imageUrls = await product.imageUrls;
    const videoUrls = await product.videoUrls;
    const productDetails = {
        ...product.toObject(),
        images: imageUrls,
        videos: videoUrls,
    };
    user.wishlist.splice(productIndexInWishlist, 1);
    const productIndexInCart = user.cart.findIndex(item => item.product.toString() === productId);
    if (productIndexInCart >= 0) {
        user.cart[productIndexInCart].quantity++;
    } else {
        user.cart.push({ product: productId, quantity: 1 });
    }
    await user.save();
    res.status(200).json(new ApiResponse(200, productDetails, "Item moved to cart successfully"));
});

module.exports = {
    getUserWishlist,
    addItemToWishlist,
    removeItemFromWishlist,
    moveToCart
};
