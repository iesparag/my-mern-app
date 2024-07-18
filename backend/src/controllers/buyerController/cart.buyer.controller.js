const { asyncHandler } = require("../../utils/asyncHandler.js");
const { ApiResponse } = require("../../utils/ApiResponse.js");
const { User } = require("../../models/userModel/user.model.js");
const { validateQuantity, validateObjectId, validateUserId } = require("../../utils/commonFunctions.js");
const { Product } = require("../../models/productModel/product.Model.js");


const getUserCart = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    try {
        validateUserId(userId);
    } catch (error) {
        return res.status(400).json(new ApiResponse(400, null, error.message));
    }

    const user = await User.findById(userId).populate({
        path: 'cart.product',
        model: 'Product'
    });
    if (!user) {
        return res.status(404).json(new ApiResponse(404, null, "User not found"));
    }

    const cartItems = await Promise.all(user.cart.map(async (item) => {
        const product = item.product;
        if (!product) {
            return null;
        }
        const imageUrls = await product.imageUrls;
        const videoUrls = await product.videoUrls;
        console.log('product: ', product);
        const productData = {
            productId: product._id,
            name: product.name,
            price: product.price,
            images: imageUrls,
            videos: videoUrls,
        };
        return {
            product: productData,
            quantity: item.quantity
        };
    }));

    res.status(200).json(new ApiResponse(200, { cart: cartItems }, "Cart retrieved successfully"));
});

const addItemToCart = asyncHandler(async (req, res) => {
    const { productId, quantity } = req.body; 
    const userId = req.user._id;
    try {
        validateQuantity(quantity);
        validateObjectId(productId);
        validateUserId(userId);
    } catch (error) {
        return res.status(400).json(new ApiResponse(400, null, error.message));
    }

    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json(new ApiResponse(404, null, "User not found"));
    }

    let product = await Product.findById(productId);
    if (!product) {
        return res.status(404).json(new ApiResponse(404, null, "Product not found"));
    }

    const productIndex = user.cart.findIndex(item => item.product.toString() === productId);
    if (productIndex >= 0) {
        user.cart[productIndex].quantity += quantity;
    } else {
        user.cart.push({ product: productId, quantity });
    }
    await user.save();

    const imageUrls = await product.imageUrls; 
    const videoUrls = await product.videoUrls; 

    const updatedCartItem = {
        product: {
            productId: product._id,
            name: product.name,
            price: product.price,
            images: imageUrls,
            videos: videoUrls,
        },
        quantity: user.cart[productIndex >= 0 ? productIndex : user.cart.length - 1].quantity
    };
    res.status(200).json(new ApiResponse(200, updatedCartItem, "Item added to cart successfully"));
});

const removeItemFromCart = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const userId = req.user._id;
    try {
        validateObjectId(productId);
        validateUserId(userId);
    } catch (error) {
        return res.status(400).json(new ApiResponse(400, false, error.message));
    }

    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json(new ApiResponse(404, false, "User not found"));
    }

    const productIndex = user.cart.findIndex(item => item.product.toString() === productId);
    if (productIndex >= 0) {
        const removedProduct = user.cart.splice(productIndex, 1)[0];
        await user.save();

        const product = await Product.findById(removedProduct.product);
        if (!product) {
            return res.status(404).json(new ApiResponse(404, false, "Product not found"));
        }

        const imageUrls = await product.imageUrls; 
        const videoUrls = await product.videoUrls;

        const response = new ApiResponse(200, {
            product: {
                productId: product._id,
                name: product.name,
                price: product.price,
                images: imageUrls,
                videos: videoUrls,
            },
            quantity: removedProduct.quantity
        }, "Item removed from cart successfully");
        res.status(200).json(response);
    } else {
        return res.status(404).json(new ApiResponse(404, false, "Product not found in cart"));
    }
});


const updateCartItemQuantity = asyncHandler(async (req, res) => {
    const { productId, quantity } = req.body;
    const userId = req.user._id;
    try {
        validateQuantity(quantity);
        validateObjectId(productId);
        validateUserId(userId);
    } catch (error) {
        return res.status(400).json(new ApiResponse(400, null, error.message));
    }

    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json(new ApiResponse(404, null, "User not found"));
    }

    const productIndex = user.cart.findIndex(item => item.product.toString() === productId);
    if (productIndex >= 0) {
        user.cart[productIndex].quantity = quantity;
    } else {
        return res.status(404).json(new ApiResponse(404, null, "Product not found in cart"));
    }
    await user.save();

    const product = await Product.findById(productId);
    if (!product) {
        return res.status(404).json(new ApiResponse(404, null, "Product not found"));
    }

    const imageUrls = await product.imageUrls; 
    const videoUrls = await product.videoUrls;

    const response = new ApiResponse(200, {
        product: {
            productId: product._id,
            name: product.name,
            price: product.price,
            images: imageUrls,
            videos: videoUrls,
        },
        quantity: user.cart[productIndex].quantity
    }, "Quantity updated successfully");

    res.status(200).json(response);
});




const moveToWishlist = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const userId = req.user._id;
    try {
        validateObjectId(productId);
        validateUserId(userId);
    } catch (error) {
        return res.status(400).json(new ApiResponse(400, null, error.message));
    }

    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json(new ApiResponse(404, null, "User not found"));
    }

    const productIndexInCart = user.cart.findIndex(item => item.product.toString() === productId);
    if (productIndexInCart < 0) {
        return res.status(404).json(new ApiResponse(404, null, "Product not found in cart"));
    }

    const itemQuantity = user.cart[productIndexInCart].quantity;
    user.cart.splice(productIndexInCart, 1);

    const productExistsInWishlist = user.wishlist.some(item => item.toString() === productId);
    if (!productExistsInWishlist) {
        user.wishlist.push(productId);
    }
    await user.save();

    const product = await Product.findById(productId); 
    if (!product) {
        return res.status(404).json(new ApiResponse(404, null, "Product not found"));
    }

    const imageUrls = await product.imageUrls; 
    const videoUrls = await product.videoUrls;

    const response = new ApiResponse(200, {
        product: {
            productId: product._id,
            name: product.name,
            price: product.price,
            images: imageUrls,
            videos: videoUrls,
        },
        quantity: itemQuantity, 
    }, "Item moved to wishlist successfully");

    res.status(200).json(response);
});



module.exports = {
    getUserCart,
    addItemToCart,
    removeItemFromCart,
    updateCartItemQuantity,
    moveToWishlist
};
