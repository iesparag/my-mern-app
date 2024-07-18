const mongoose = require("mongoose");
const { Schema } = mongoose;
const { getSignedAccessUrl } = require("../../utils/s3Utils"); // Import your S3 utility functions

const productSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        MRP: {
            type: Number,
            required: true,
            min: 0,
        },
        discount: {
            type: Number,
            min: 0,
            max: 100,
            default: 0,
        },
        priceAfterDiscount: {
            type: Number,
            default: function () {
                return this.price * (1 - this.discount / 100);
            },
        },
        categoryId: {
            type: Schema.Types.ObjectId,
            ref: "Category",
            required: true,
        },
        brand: {
            type: String,
            trim: true,
        },
        images: [
            {
                type: String,
                required: true,
            },
        ],
        videos: [
            {
                type: String,
                required: false,
            },
        ],
        stockQuantity: {
            type: Number,
            default: 0,
            required: true,
        },
        isFeatured: {
            type: Boolean,
            default: false,
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        subCategoryId: {
            type: Schema.Types.ObjectId,
            ref: "SubCategory",
            required: true,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
    }
);

productSchema.virtual("imageUrls").get(async function () {
    const urls = await Promise.all(
        this.images.map(async (image) => {
            return await getSignedAccessUrl(image);
        })
    );

    return urls;
});

productSchema.virtual("videoUrls").get(async function () {
    if (!this.videos || this.videos.length === 0) {
        return [];
    }
    const urls = await Promise.all(
        this.videos.map(async (video) => {
            return await getSignedAccessUrl(video);
        })
    );

    return urls;
});

const Product = mongoose.model("Product", productSchema);

module.exports = {
    Product,
};
