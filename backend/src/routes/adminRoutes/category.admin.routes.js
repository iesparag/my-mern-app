const { Router } = require("express");
const router = Router();
const {
    createCategory,
    updateCategory,
    deleteCategory,
} = require("../../controllers/adminController/category.admin.controller");
const { upload } = require("../../middlewares/multer.middleware");
const { verifyJWT } = require("../../middlewares/auth.middleware");
const { checkRole } = require("../../middlewares/roleMiddleware");
router.use(verifyJWT);

router.post(
    "/",
    upload.single("categoryImage"),
    checkRole(["admin", "manager", "editor"]),
    createCategory
);
router.patch(
    "/:id",
    upload.single("categoryImage"),
    checkRole(["admin", "manager", "editor"]),
    updateCategory
);
router.delete("/:id", checkRole(["admin"]), deleteCategory);

module.exports = router;
