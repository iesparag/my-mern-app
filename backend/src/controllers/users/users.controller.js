const { OAuth2Client } = require("google-auth-library");
const bcrypt = require("bcrypt");
const { asyncHandler } = require("../../utils/asyncHandler.js");
const { ApiError } = require("../../utils/ApiError.js");
const { ApiResponse } = require("../../utils/ApiResponse.js");
const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);
const jwt = require("jsonwebtoken");
const {
    getSignedAccessUrl,
    uploadFile,
    deleteFileFromS3,
} = require("../../utils/s3Utils.js");
const { User } = require("../../models/userModel/user.model.js");
const {
    generateOTP,
    generateRandomPassword,
} = require("../../utils/commonFunctions.js");
const { sendEmail } = require("../../utils/emailService.js");

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            return new ApiResponse(404, null, "User not found");
        }
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        console.error("Error generating tokens:", error);
        return new ApiResponse(
            500,
            null,
            "Something went wrong while generating refresh and access tokens"
        );
    }
};

function validatePassword(password) {
    const errors = [];
    if (password?.length < 6 || password?.length > 10) {
        errors.push("Password must be 6-10 characters long");
    }

    if (!/[a-z]/.test(password)) {
        errors.push("Password must contain at least one lowercase letter");
    }

    if (!/[A-Z]/.test(password)) {
        errors.push("Password must contain at least one uppercase letter");
    }

    if (!/\d/.test(password)) {
        errors.push("Password must contain at least one digit");
    }

    if (!/[^a-zA-Z0-9]/.test(password)) {
        errors.push("Password must contain at least one special character");
    }

    if (errors.length > 0) {
        throw new ApiResponse(400, null, errors.join("; "));
    }

    return true;
}
// admin Access function start
const createNewUserForAdminDashboard = asyncHandler(async (req, res) => {
    const { firstName, lastName, email, password, idNumber, role } = req.body;

    if (!["manager", "editor"].includes(role)) {
        return res.status(400).json(new ApiResponse(400, null, "Invalid role"));
    }

    try {
        validatePassword(password);
    } catch (error) {
        return res.status(400).json(new ApiResponse(400, null, error.message));
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
        return res
            .status(409)
            .json(
                new ApiResponse(
                    409,
                    null,
                    "Email already exists. Please update the role of the existing user."
                )
            );
    }

    const newUser = await User.create({
        firstName,
        lastName,
        email,
        password,
        idNumber,
        role,
        permissions: [],
    });

    const createdUser = await User.findById(newUser._id).select(
        "-password -createdAt -updatedAt -__v"
    );

    if (!createdUser) {
        return res
            .status(500)
            .json(
                new ApiResponse(
                    500,
                    null,
                    "Something went wrong while registering the user"
                )
            );
    }

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                createdUser,
                `${createdUser.role} registered successfully`
            )
        );
});

const updateManagerOrEditor = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { firstName, lastName, email, idNumber, blocked, role } = req.body;

    if (req.user.role !== "admin") {
        return res
            .status(403)
            .json(new ApiResponse(403, null, "Access denied"));
    }

    try {
        const user = await User.findById(id);
        if (!user) {
            return res
                .status(404)
                .json(new ApiResponse(404, null, "User not found"));
        }

        // Check for unique email
        if (email && email !== user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res
                    .status(409)
                    .json(new ApiResponse(409, null, "Email already exists"));
            }
        }

        if (role && !["manager", "editor", "user"].includes(role)) {
            return res
                .status(400)
                .json(new ApiResponse(400, null, "Invalid role"));
        }

        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (email) user.email = email;
        if (idNumber) user.idNumber = idNumber;
        if (blocked !== undefined) user.blocked = blocked;
        if (role) user.role = role;

        await user.save();

        const updatedUser = await User.findById(id).select(
            "-password -createdAt -updatedAt -__v -wishlist -cart -refreshToken"
        );

        res.status(200).json(
            new ApiResponse(
                200,
                updatedUser,
                `${updatedUser.role} updated successfully`
            )
        );
    } catch (error) {
        console.error("Error updating manager/editor:", error);
        res.status(500).json({ error: "Error updating manager/editor" });
    }
});

const updateRoleByAdmin = asyncHandler(async (req, res) => {
    const { userId, role } = req.body;
    if (!["admin", "manager", "editor", "user"].includes(role)) {
        return res.status(400).json(new ApiResponse(400, null, "Invalid role"));
    }
    const user = await User.findById(userId);
    if (!user) {
        return res
            .status(404)
            .json(new ApiResponse(404, null, "User not found"));
    }
    user.role = role;
    await user.save();
    const updatedUser = await User.findById(userId).select(
        "-password -createdAt -updatedAt -__v"
    );
    res.status(200).json(
        new ApiResponse(200, updatedUser, "User role updated successfully")
    );
});

const blockUserByAdmin = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
        return res
            .status(404)
            .json(new ApiResponse(404, null, "User not found"));
    }
    user.blocked = true;
    await user.save();
    const updatedUser = await User.findById(userId).select(
        "-password -createdAt -updatedAt -__v"
    );
    res.status(200).json(
        new ApiResponse(200, updatedUser, "User has been blocked")
    );
});

const unblockUserByAdmin = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
        return res
            .status(404)
            .json(new ApiResponse(404, null, "User not found"));
    }
    user.blocked = false;
    await user.save();
    const updatedUser = await User.findById(userId).select(
        "-password -createdAt -updatedAt -__v"
    );
    res.status(200).json(
        new ApiResponse(200, updatedUser, "User has been unblocked")
    );
});

// Admin Access function End

const registerUser = asyncHandler(async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            password,
            idNumber,
            agreeToTerms,
            agreeToReceiveUpdates,
        } = req.body;
        try {
            validatePassword(password);
        } catch (error) {
            return res
                .status(400)
                .json(new ApiResponse(400, null, error.message));
        }

        if (
            [firstName, email, password].some(
                (field) => !field || field.trim() === ""
            )
        ) {
            return res
                .status(400)
                .json(
                    new ApiResponse(
                        400,
                        null,
                        "First name, email, and password are required"
                    )
                );
        }

        const existedUser = await User.findOne({ email });

        if (existedUser) {
            return res
                .status(409)
                .json(
                    new ApiResponse(409, null, "User with email already exists")
                );
        }

        const newUser = await User.create({
            firstName,
            lastName,
            email,
            password,
            idNumber,
            agreeToTerms,
            agreeToReceiveUpdates,
        });
        const createdUser = await User.findById(newUser._id).select(
            "-password -createdAt -updatedAt -__v"
        );

        if (!createdUser) {
            return res
                .status(500)
                .json(
                    new ApiResponse(
                        500,
                        null,
                        "Something went wrong while registering the user"
                    )
                );
        }

        return res
            .status(201)
            .json(
                new ApiResponse(
                    201,
                    createdUser,
                    "User registered successfully"
                )
            );
    } catch (error) {
        console.error("Error registering user:", error);
        return res
            .status(500)
            .json(new ApiResponse(500, null, "Failed to register user"));
    }
});

const googleAuth = async (req, res) => {
    const { tokenId } = req.body;
    try {
        const ticket = await client.verifyIdToken({
            idToken: tokenId,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const { email, sub, given_name, family_name, name } =
            ticket.getPayload();
        let user = await User.findOne({ email });
        if (user && user.blocked) {
            return res
                .status(403)
                .json(
                    new ApiResponse(403, null, "Your account has been blocked")
                );
        }
        if (!user) {
            const newPassword = generateRandomPassword();
            user = new User({
                email,
                firstName: given_name,
                lastName: family_name,
                googleId: sub,
                password: newPassword,
            });
            await sendEmail({
                to: email,
                subject: "Your HBHS Account Details",
                html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5;">
            <h2>Welcome to HBHS!</h2>
            <p>Hi ${name},</p>
            <p>Thank you for logging in to HBHS with Google. We have created an account for you on our platform.</p>
            <p>Your login details are as follows:</p>
            <ul>
                <li><strong>Email:</strong> ${email}</li>
                <li><strong>Password:</strong> ${newPassword}</li>
            </ul>
            <p>You can use these credentials to log in to HBHS using email and password.</p>
            <p>For security reasons, we recommend changing your password after your first login.</p>
            <p>Best regards,</p>
            <p>The HBHS Team</p>
        </div>
    `,
            });
        }
        const { accessToken, refreshToken } =
            await generateAccessAndRefreshTokens(user._id);
        user.refreshToken = refreshToken;
        await user.save();
        const loggedInUser = await User.findById(user._id).select(
            "-password -refreshToken -createdAt -updatedAt -__v"
        );
        const options = {
            httpOnly: true,
            secure: true,
        };
        res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json({
                user: loggedInUser,
                accessToken,
                refreshToken,
                message: "User logged in successfully with Google",
            });
    } catch (error) {
        console.error("Error during Google authentication:", error);
        res.status(500).json(
            new ApiResponse(
                500,
                null,
                "Failed to authenticate user with Google"
            )
        );
    }
};

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email) {
        return res
            .status(400)
            .json(new ApiResponse(400, null, "Email is required"));
    }
    const user = await User.findOne({ email });
    if (!user) {
        return res
            .status(404)
            .json(new ApiResponse(404, null, "User does not exist"));
    }
    if (user.blocked) {
        return res
            .status(403)
            .json(new ApiResponse(403, null, "Your account has been blocked"));
    }
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        return res
            .status(401)
            .json(new ApiResponse(401, null, "Invalid user credentials"));
    }
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
        user._id
    );
    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken -createdAt -updatedAt -__v"
    );
    if (loggedInUser.avatar) {
        loggedInUser.avatar = await getSignedAccessUrl(loggedInUser.avatar);
    }
    if (loggedInUser.coverImage) {
        loggedInUser.coverImage = await getSignedAccessUrl(
            loggedInUser.coverImage
        );
    }

    const options = {
        httpOnly: true,
        secure: true,
    };
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                { user: loggedInUser, accessToken, refreshToken },
                "User logged in successfully"
            )
        );
});

const getCurrentUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select(
        "-password -refreshToken -createdAt -updatedAt -__v"
    );
    if (!user) {
        return res
            .status(404)
            .json(new ApiResponse(404, null, "User not found"));
    }
    if (user.avatar) {
        user.avatar = await getSignedAccessUrl(user.avatar);
    }
    if (user.coverImage) {
        user.coverImage = await getSignedAccessUrl(user.coverImage);
    }
    return res
        .status(200)
        .json(new ApiResponse(200, user, "User details fetched successfully"));
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1,
            },
        },
        {
            new: true,
        }
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged Out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken =
        req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) {
        return res
            .status(401)
            .json(new ApiResponse(401, null, "Unauthorized request"));
    }
    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );
        const user = await User.findById(decodedToken?._id);
        if (!user) {
            return res
                .status(401)
                .json(new ApiResponse(401, null, "Invalid refresh token"));
        }
        if (incomingRefreshToken !== user?.refreshToken) {
            return res
                .status(401)
                .json(
                    new ApiResponse(
                        401,
                        null,
                        "Refresh token is expired or used"
                    )
                );
        }
        const options = {
            httpOnly: true,
            secure: true,
        };
        const { accessToken, refreshToken } =
            await generateAccessAndRefreshTokens(user._id);
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: refreshToken },
                    "Access token refreshed"
                )
            );
    } catch (error) {
        return res
            .status(401)
            .json(
                new ApiResponse(
                    401,
                    null,
                    error?.message || "Invalid refresh token"
                )
            );
    }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    try {
        validatePassword(newPassword);
    } catch (error) {
        return res.status(400).json(new ApiResponse(400, null, error.message));
    }
    const user = await User.findById(req.user?._id);
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
    if (!isPasswordCorrect) {
        return res
            .status(400)
            .json(new ApiResponse(400, null, "Invalid old password"));
    }
    user.password = newPassword;
    await user.save({ validateBeforeSave: false });
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getAllUsers = asyncHandler(async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * limit;
        const totalCount = await User.countDocuments({
            _id: { $ne: req.user._id },
            role: { $nin: ["admin", "manager", "editor"] },
        });

        let usersQuery = await User.find(
            {
                _id: { $ne: req.user._id },
                role: { $nin: ["admin", "manager", "editor"] },
            },
            "-password -refreshToken -__v -createdAt -updatedAt -isOTPVerified -forgotPasswordOTP -forgotPasswordOTPExpiry"
        )
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        usersQuery = await Promise.all(
            usersQuery.map(async (user) => {
                if (user.avatar) {
                    user.avatar = await getSignedAccessUrl(user.avatar);
                }
                if (user.coverImage) {
                    user.coverImage = await getSignedAccessUrl(user.coverImage);
                }
                return user;
            })
        );
        const usersData = {
            users: usersQuery,
            totalCount: totalCount,
        };
        res.status(200).json(
            new ApiResponse(200, usersData, "Users retrieved successfully")
        );
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: "Error fetching users" });
    }
});

const getManagersAndEditors = asyncHandler(async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * limit;
        const filter = {
            _id: { $ne: req.user._id },
            role: { $in: ["manager", "editor"] },
        };
        const totalCount = await User.countDocuments(filter);
        let usersQuery = await User.find(
            filter,
            "-password -refreshToken -__v -createdAt -updatedAt -isOTPVerified -forgotPasswordOTP -forgotPasswordOTPExpiry"
        )
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        if (!usersQuery.length) {
            return res
                .status(200)
                .json(
                    new ApiResponse(200, null, "No Manager and Editor Found")
                );
        }
        usersQuery = await Promise.all(
            usersQuery.map(async (user) => {
                if (user.avatar) {
                    user.avatar = await getSignedAccessUrl(user.avatar);
                }
                if (user.coverImage) {
                    user.coverImage = await getSignedAccessUrl(user.coverImage);
                }
                return user;
            })
        );
        const usersData = {
            users: usersQuery,
            totalCount: totalCount,
        };
        res.status(200).json(
            new ApiResponse(
                200,
                usersData,
                "Managers and editors retrieved successfully"
            )
        );
    } catch (error) {
        console.error("Error fetching managers and editors:", error);
        res.status(500).json({ error: "Error fetching managers and editors" });
    }
});

const getManagerOrEditorById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (req.user.role !== "admin") {
        return res
            .status(403)
            .json(new ApiResponse(403, null, "Access denied"));
    }
    try {
        const user = await User.findById(
            id,
            "-password -refreshToken -__v -createdAt -updatedAt -isOTPVerified -forgotPasswordOTP -forgotPasswordOTPExpiry"
        );
        if (!user) {
            return res
                .status(404)
                .json(new ApiResponse(404, null, "User not found"));
        }
        if (!["manager", "editor"].includes(user.role)) {
            return res
                .status(403)
                .json(new ApiResponse(403, null, "Access denied"));
        }
        if (user.avatar) {
            user.avatar = await getSignedAccessUrl(user.avatar);
        }
        if (user.coverImage) {
            user.coverImage = await getSignedAccessUrl(user.coverImage);
        }

        res.status(200).json(
            new ApiResponse(
                200,
                user,
                "Manager or editor retrieved successfully"
            )
        );
    } catch (error) {
        console.error("Error fetching manager/editor:", error);
        res.status(500).json({ error: "Error fetching manager/editor" });
    }
});

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body;

    if (!fullName || !email) {
        throw new ApiError(400, "All fields are required");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email: email,
            },
        },
        { new: true }
    ).select("-password -createdAt -updatedAt -__v");

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "Account details updated successfully")
        );
});

const updateUserAvatar = asyncHandler(async (req, res) => {
    const filePath = req.file?.path;
    const contentType = req.file?.mimetype;
    const originalName = req.file?.originalname;
    const userId = req.user._id;
    if (!filePath) {
        return res
            .status(400)
            .json(new ApiResponse(400, null, "Avatar file is missing"));
    }
    const s3FileName = `users/${userId}/avatar/${originalName}`;
    try {
        const currentUser = await User.findById(userId);

        if (!currentUser) {
            return res
                .status(404)
                .json(new ApiResponse(404, null, "User not found."));
        }

        if (currentUser.avatar) {
            await deleteFileFromS3(currentUser.avatar);
        }
        const response = await uploadFile(filePath, s3FileName, contentType);
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                $set: {
                    avatar: s3FileName,
                },
            },
            { new: true }
        );
        if (updatedUser.avatar) {
            updatedUser.avatar = await getSignedAccessUrl(updatedUser.avatar);
        }
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { avatar: updatedUser.avatar },
                    "Avatar updated successfully."
                )
            );
    } catch (error) {
        console.error("Failed to upload file:", error);
        return res
            .status(500)
            .json(new ApiResponse(500, null, "Failed to update avatar."));
    }
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const filePath = req.file?.path;
    const contentType = req.file?.mimetype;
    const originalName = req.file?.originalname;
    const userId = req.user._id;
    if (!filePath) {
        return res
            .status(400)
            .json(new ApiResponse(400, null, "Avatar file is missing"));
    }
    const s3FileName = `users/${userId}/coverImage/${originalName}`;
    try {
        const currentUser = await User.findById(userId);

        if (!currentUser) {
            return res
                .status(404)
                .json(new ApiResponse(404, null, "User not found."));
        }

        if (currentUser.coverImage) {
            await deleteFileFromS3(currentUser.coverImage);
        }
        const response = await uploadFile(filePath, s3FileName, contentType);
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                $set: {
                    coverImage: s3FileName,
                },
            },
            { new: true }
        );
        if (updatedUser.coverImage) {
            updatedUser.coverImage = await getSignedAccessUrl(
                updatedUser.coverImage
            );
        }
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { coverImage: updatedUser.coverImage },
                    "Avatar updated successfully."
                )
            );
    } catch (error) {
        console.error("Failed to upload file:", error);
        return res
            .status(500)
            .json(new ApiResponse(500, null, "Failed to update avatar."));
    }
});

// forgot by Otp
const forgotPassword = asyncHandler(async (req, res) => {
    try {
        const { email } = req.body;
        console.log("🚀 ~ forgotPassword ~ email:", email);
        if (!email) {
            return res
                .status(400)
                .json(
                    new ApiResponse(
                        400,
                        null,
                        "Please add email inside the payload"
                    )
                );
        }
        const user = await User.findOne({ email });

        if (!user) {
            return res
                .status(404)
                .json(new ApiResponse(404, null, "User not found"));
        }

        const otp = generateOTP();
        console.log("🚀 ~ forgotPassword ~ otp:", otp);
        const otpExpiry = Date.now() + 60 * 60 * 1000; // 1 hour expiry

        // Hash the OTP using bcrypt
        const salt = await bcrypt.genSalt(10);
        const hashedOTP = await bcrypt.hash(otp, salt);
        console.log("🚀 ~ forgotPassword ~ hashedOTP:", hashedOTP);

        user.forgotPasswordOTP = hashedOTP;
        user.forgotPasswordOTPExpiry = otpExpiry;
        user.isOTPVerified = false;
        await user.save();

        await sendEmail({
            to: email,
            subject: "Your Password Reset OTP",
            html: `<p>Your OTP for password reset is: <strong>${otp}</strong></p>`,
        });

        res.status(200).json(new ApiResponse(200, null, "OTP sent to email"));
    } catch (error) {
        res.status(500).json(new ApiResponse(500, null, error.message));
    }
});

// forgot by link
// const forgotPassword = asyncHandler(async (req, res) => {
//     try {
//         const { email } = req.body;

//         if (!email) {
//             return res.status(400).json(new ApiResponse(400, null, 'Email is required'));
//         }

//         const user = await User.findOne({ email });

//         if (!user) {
//             return res.status(404).json(new ApiResponse(404, null, 'User not found'));
//         }

//         const otp = generateOTP();
//         const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
//         user.forgotPasswordOTPExpiry = otpExpiry;
//         user.forgotPasswordOTP = otp;
//         await user.save();
//         // Create JWT token with OTP and email
//         const token = jwt.sign({ email, otp }, process.env.hsbs_gmail_token_secret, { expiresIn: '10m' });

//         // Send email with link containing token
//         const resetLink = `https://hbhs.vercel.app/verify-token?token=${token}`;
//         await sendEmail({
//             to: email,
//             subject: 'Your Password Reset Link',
//             html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`,
//         });

//         res.status(200).json(new ApiResponse(200, null, 'Password reset link sent to email'));
//     } catch (error) {
//         console.error('Forgot password error:', error);
//         res.status(500).json(new ApiResponse(500, null, 'Failed to send password reset link'));
//     }
// });

// verify by otp
const verifyOTP = asyncHandler(async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res
                .status(404)
                .json(new ApiResponse(404, null, "User not found"));
        }
        if (Date.now() > user.forgotPasswordOTPExpiry) {
            return res
                .status(400)
                .json(new ApiResponse(400, null, "OTP has expired"));
        }
        const isMatch = await bcrypt.compare(otp, user.forgotPasswordOTP);
        if (!isMatch) {
            return res
                .status(400)
                .json(new ApiResponse(400, null, "Invalid OTP"));
        }
        user.isOTPVerified = true;
        await user.save();
        res.status(200).json(new ApiResponse(200, null, "OTP verified"));
    } catch (error) {
        res.status(500).json(new ApiResponse(500, null, error.message));
    }
});

const setNewPassword = asyncHandler(async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res
                .status(404)
                .json(new ApiResponse(404, null, "User not found"));
        }

        if (!user.isOTPVerified) {
            return res
                .status(400)
                .json(new ApiResponse(400, null, "OTP not verified"));
        }

        user.password = newPassword;
        user.forgotPasswordOTP = undefined;
        user.forgotPasswordOTPExpiry = undefined;
        user.isOTPVerified = false;
        await user.save();

        res.status(200).json(
            new ApiResponse(200, null, "Password has been reset")
        );
    } catch (error) {
        res.status(500).json(new ApiResponse(500, null, error.message));
    }
});

// verify by link
// const verifyOTP = asyncHandler(async (req, res) => {
//     try {
//         const { token, newPassword } = req.body;
//         if (!token) {
//             return res.status(400).json(new ApiResponse(400, null, 'Token is required'));
//         }
//         const decoded = jwt.verify(token, process.env.hsbs_gmail_token_secret);
//         console.log('decoded: ', decoded);
//         const { email, otp } = decoded;
//         const user = await User.findOne({ email });

//         if (!user) {
//             return res.status(404).json(new ApiResponse(404, null, 'User not found'));
//         }
//         if (user.forgotPasswordOTP !== otp || Date.now() > user.forgotPasswordOTPExpiry) {
//             return res.status(400).json(new ApiResponse(400, null, 'Invalid or expired token'));
//         }
//         user.password = newPassword;
//         user.forgotPasswordOTP = undefined;
//         user.forgotPasswordOTPExpiry = undefined;
//         await user.save();

//         res.status(200).json(new ApiResponse(200, null, 'Password has been reset successfully'));
//     } catch (error) {
//         console.error('Verify token error:', error);
//         res.status(500).json(new ApiResponse(500, null, 'Failed to verify token'));
//     }
// });

module.exports = {
    createNewUserForAdminDashboard,
    updateManagerOrEditor,
    updateRoleByAdmin,
    blockUserByAdmin,
    unblockUserByAdmin,
    googleAuth,
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getAllUsers,
    getManagersAndEditors,
    getManagerOrEditorById,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    forgotPassword,
    verifyOTP,
    setNewPassword,
};
