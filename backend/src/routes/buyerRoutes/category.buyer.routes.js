const { Router } = require("express");
const router = Router();
const {
    getAllCategories,
    getCategoryById,
} = require("../../controllers/buyerController/category.buyer.controller");

router.get("/", getAllCategories);
router.get("/:id", getCategoryById);

module.exports = router;
