const { Router } = require("express");
const {
    createSubCategory,
    updateSubCategory,
    deleteSubCategory,
} = require("../../controllers/adminController/subCategory.admin.controller");
const { upload } = require("../../middlewares/multer.middleware");
const { verifyJWT } = require("../../middlewares/auth.middleware");
const { checkRole } = require("../../middlewares/roleMiddleware");
const router = Router();

router.use(verifyJWT);
router.post(
    "/",
    upload.single("subCategoryImage"),
    checkRole(["admin", "manager", "editor"]),
    createSubCategory
);
router.patch(
    "/:id",
    upload.single("subCategoryImage"),
    checkRole(["admin", "manager", "editor"]),
    updateSubCategory
);
router.delete("/:id", checkRole(["admin"]), deleteSubCategory);

module.exports = router;
