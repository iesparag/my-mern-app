const { Router } = require("express");
const router = Router();
const {
    createProduct,
    updateProduct,
    deleteProduct,
} = require("../../controllers/adminController/product.admin.controller");
const { upload } = require("../../middlewares/multer.middleware");
const { verifyJWT } = require("../../middlewares/auth.middleware");
const { checkRole } = require("../../middlewares/roleMiddleware");

router.use(verifyJWT, checkRole("admin"));

router.post(
    "/",
    upload.fields([
        { name: "images", maxCount: 12 },
        { name: "videos", maxCount: 12 },
    ]),
    createProduct
);

router.patch(
    "/:id",
    upload.fields([
        { name: "images", maxCount: 12 },
        { name: "videos", maxCount: 12 },
    ]),
    updateProduct
);

router.delete("/:id", deleteProduct);

module.exports = router;
