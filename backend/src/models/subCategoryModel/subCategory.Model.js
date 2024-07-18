const mongoose = require("mongoose");
const { Schema } = mongoose;
const { getSignedAccessUrl } = require("../../utils/s3Utils");

const subCategorySchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        categoryId: {
            type: Schema.Types.ObjectId,
            ref: "Category",
            required: true,
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        subCategoryImage: {
            type: String,
            required: true,
            trim: true,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
    }
);

subCategorySchema.virtual("subCategoryImageUrl").get(async function () {
    if (this.subCategoryImage) {
        return await getSignedAccessUrl(this.subCategoryImage);
    }
    return null;
});

const SubCategory = mongoose.model("SubCategory", subCategorySchema);

module.exports = {
    SubCategory,
};
