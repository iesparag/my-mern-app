const { asyncHandler } = require("../utils/asyncHandler.js");
const { ApiResponse } = require("../utils/ApiResponse.js");
const jwt = require("jsonwebtoken");
const { User } = require("../models/userModel/user.model.js");

const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token =
            (req.cookies && req.cookies.accessToken) ||
            (req.header("Authorization") &&
                req.header("Authorization").replace("Bearer ", ""));
        if (!token) {
            return res
                .status(401)
                .json(new ApiResponse(401, null, "Unauthorized request"));
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(
            decodedToken && decodedToken._id
        ).select("-password -refreshToken");

        if (!user) {
            return res
                .status(401)
                .json(new ApiResponse(401, null, "Invalid Access Token"));
        }

        if (user.blocked) {
            return res
                .status(403)
                .json(
                    new ApiResponse(403, null, "Your account has been blocked")
                );
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Error verifying JWT:", error);
        return res
            .status(401)
            .json(
                new ApiResponse(
                    401,
                    null,
                    error.message || "Invalid access token"
                )
            );
    }
});

module.exports = {
    verifyJWT,
};
