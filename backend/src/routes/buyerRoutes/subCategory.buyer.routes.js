const { Router } = require("express");
const {
    getAllSubCategories,
    getSubCategoryById,
} = require("../../controllers/buyerController/subCategory.buyer.controller");
const router = Router();

router.get("/", getAllSubCategories);
router.get("/:id", getSubCategoryById);

module.exports = router;
