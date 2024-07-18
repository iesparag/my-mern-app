const { Router } = require("express");
const router = Router();
const {
    createNewUserForAdminDashboard,
    updateManagerOrEditor,
    updateRoleByAdmin,
    blockUserByAdmin,
    unblockUserByAdmin,
    googleAuth,
    loginUser,
    logoutUser,
    registerUser,
    forgotPassword,
    verifyOTP,
    setNewPassword,
    refreshAccessToken,
    changeCurrentPassword,
    getAllUsers,
    getManagersAndEditors,
    getManagerOrEditorById,
    getCurrentUser,
    updateUserAvatar,
    updateUserCoverImage,
    updateAccountDetails,
} = require("../../controllers/users/users.controller.js");
const { upload } = require("../../middlewares/multer.middleware.js");
const { verifyJWT } = require("../../middlewares/auth.middleware");
const {
    checkRole,
    checkPermission,
} = require("../../middlewares/roleMiddleware");

router.route("/register").post(registerUser);
router.route("/auth/google").post(googleAuth);
router.route("/login").post(loginUser);
router.route("/forgot-password").post(forgotPassword);
router.route("/verify-otp").post(verifyOTP);
router.route("/reset-password").post(setNewPassword);

// Secured routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/update-account").patch(verifyJWT, updateAccountDetails);
router
    .route("/avatar")
    .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);
router
    .route("/cover-image")
    .patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage);
// Admin Routes
router
    .route("/admin/all-users")
    .get(verifyJWT, checkRole(["admin"]), getAllUsers);
router
    .route("/admin/managers-editors/:id")
    .get(verifyJWT, checkRole(["admin"]), getManagerOrEditorById);
router
    .route("/admin/managers-editors")
    .get(verifyJWT, checkRole(["admin"]), getManagersAndEditors);
router
    .route("/admin/managers-editors/:id")
    .patch(verifyJWT, checkRole(["admin"]), updateManagerOrEditor);
router
    .route("/admin/create-user")
    .post(verifyJWT, checkRole(["admin"]), createNewUserForAdminDashboard);
router
    .route("/admin/update-role")
    .patch(verifyJWT, checkRole(["admin"]), updateRoleByAdmin);
router
    .route("/admin/block/:userId")
    .patch(verifyJWT, checkRole(["admin"]), blockUserByAdmin);
router
    .route("/admin/unblock/:userId")
    .patch(verifyJWT, checkRole(["admin"]), unblockUserByAdmin);

module.exports = router;
