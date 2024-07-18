const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const { Schema } = mongoose;

const userSchema = new Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        firstName: {
            type: String,
            required: true,
            trim: true,
        },
        lastName: {
            type: String,
            trim: true,
        },
        idNumber: {
            type: String,
        },
        googleId: {
            type: String,
        },
        agreeToTerms: {
            type: Boolean,
            default: false,
        },
        agreeToReceiveUpdates: {
            type: Boolean,
            default: false,
        },
        avatar: {
            type: String,
        },
        coverImage: {
            type: String,
        },
        password: {
            type: String,
            required: [true, "Password is required"],
        },
        refreshToken: {
            type: String,
        },
        role: {
            type: String,
            enum: ["admin", "user", "manager", "editor"],
            default: "user",
        },
        permissions: {
            type: [String],
            default: [],
        },
        blocked: { type: Boolean, default: false },
        wishlist: [
            {
                type: Schema.Types.ObjectId,
                ref: "Product",
            },
        ],
        cart: [
            {
                product: {
                    type: Schema.Types.ObjectId,
                    ref: "Product",
                },
                quantity: {
                    type: Number,
                    min: 1,
                    default: 1,
                },
            },
        ],
        forgotPasswordOTP: String,
        isOTPVerified: {
            type: Boolean,
            default: false,
        },
        forgotPasswordOTPExpiry: Date,
        verifyOTP: String,
        verifyOTPExpiry: Date,
    },
    {
        timestamps: true,
    }
);

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    );
};

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    );
};

const User = mongoose.model("User", userSchema);

module.exports = {
    User,
};
