const { asyncHandler } = require("../utils/asyncHandler.js");
const { ApiResponse } = require("../utils/ApiResponse.js");

const checkRole = (roles) => {
    return asyncHandler((req, res, next) => {
        const allowedRoles = Array.isArray(roles) ? roles : [roles];
        if (req.user.role === "admin") {
            return next();
        }
        if (!allowedRoles.includes(req.user.role)) {
            return res
                .status(403)
                .json(new ApiResponse(403, null, "Access denied"));
        }
        next();
    });
};

const checkPermission = (permissions) => {
    return (req, res, next) => {
        const userPermissions = req.user.permissions;
        const hasPermission = permissions.every((permission) =>
            userPermissions.includes(permission)
        );
        if (hasPermission) {
            return next();
        }
        res.status(403).json(
            new ApiResponse(
                403,
                null,
                "Forbidden: You don't have permission to access this resource"
            )
        );
    };
};

module.exports = {
    checkRole,
    checkPermission,
};
