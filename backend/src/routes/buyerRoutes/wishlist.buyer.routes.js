const { Router } = require("express");
const router = Router();
const {
    getUserWishlist,
    addItemToWishlist,
    removeItemFromWishlist,
    moveToCart
} = require("../../controllers/buyerController/wishlist.buyer.controller");
const { verifyJWT } = require("../../middlewares/auth.middleware");

router.use(verifyJWT);
router.get("/", getUserWishlist);
router.post("/", addItemToWishlist);
router.post("/move-to-cart", moveToCart);
router.delete("/:productId", removeItemFromWishlist);

module.exports = router;
