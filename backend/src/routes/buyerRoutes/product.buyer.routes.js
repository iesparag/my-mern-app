const { Router } = require("express");
const router = Router();
const {
    getAllProducts,
    getProductById,
} = require("../../controllers/buyerController/product.buyer.controller");

router.get("/", getAllProducts);
router.get("/:id", getProductById);

module.exports = router;
