const mongoose = require("mongoose");
const { Schema } = mongoose;
const { getSignedAccessUrl } = require("../../utils/s3Utils");

const categorySchema = new Schema(
    {
        name: {
            type: String,
            required: [true, "*unique category"],
            unique: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        subCategories: [
            {
                type: Schema.Types.ObjectId,
                ref: "SubCategory",
            },
        ],
        categoryImage: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
    }
);

categorySchema.virtual("categoryImageUrl").get(async function () {
    if (this.categoryImage) {
        return await getSignedAccessUrl(this.categoryImage);
    }
    return null;
});

const Category = mongoose.model("Category", categorySchema);

module.exports = {
    Category,
};
