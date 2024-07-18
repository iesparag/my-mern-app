const { Router } = require("express");
const router = Router();
const {
    getUserCart,
    addItemToCart,
    updateCartItemQuantity,
    removeItemFromCart,
    moveToWishlist
} = require("../../controllers/buyerController/cart.buyer.controller");
const { verifyJWT } = require("../../middlewares/auth.middleware");

router.use(verifyJWT);
router.get("/", getUserCart);
router.post("/", addItemToCart);
router.post("/:productId", moveToWishlist);
router.patch("/", updateCartItemQuantity);
router.delete("/:productId", removeItemFromCart);

module.exports = router;
