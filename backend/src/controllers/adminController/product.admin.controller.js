const { asyncHandler } = require("../../utils/asyncHandler");
const { ApiResponse } = require("../../utils/ApiResponse");
const { Product } = require("../../models/productModel/product.Model");
const { getSignedAccessUrl, deleteFileFromS3 } = require("../../utils/s3Utils");
const {
    handleFileUploadProduct,
    getSignedUrls,
} = require("../../utils/commonFunctions");

const createProduct = async (req, res) => {
    const {
        name,
        description,
        price,
        MRP,
        discount,
        categoryId,
        brand,
        stockQuantity,
        isFeatured,
        subCategoryId,
    } = req.body;
    const userId = req.user._id;
    const images = [];
    const videos = [];
    const createdBy = req.user._id;
    try {
        if (req.files.images) {
            const uploadedImages = await handleFileUploadProduct(
                req.files.images,
                userId,
                "images"
            );
            console.log("🚀 ~ createProduct ~ uploadedImages:", uploadedImages);
            images.push(...uploadedImages);
        }
        if (req.files.videos) {
            const uploadedVideos = await handleFileUploadProduct(
                req.files.videos,
                userId,
                "videos"
            );
            videos.push(...uploadedVideos);
        }
        const newProduct = await Product.create({
            name,
            description,
            price,
            MRP,
            discount,
            categoryId,
            brand,
            images,
            videos,
            stockQuantity,
            isFeatured,
            createdBy,
            subCategoryId,
        });

        const productWithSignedUrls = {
            ...newProduct.toObject(),
            images: await getSignedUrls(newProduct.images),
            videos: await getSignedUrls(newProduct.videos),
        };

        res.status(201).json(
            new ApiResponse(
                200,
                productWithSignedUrls,
                "Product Created successfully",
                productWithSignedUrls
            )
        );
    } catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({ error: "Failed to create product" });
    }
};

const updateProduct = asyncHandler(async (req, res) => {
    const productId = req.params.id;
    const updates = req.body;
    const userId = req.user._id;
    const newImages = [];
    const newVideos = [];
    try {
        if (req.files && req.files.images) {
            const uploadedImages = await handleFileUploadProduct(
                req.files.images,
                userId,
                "images"
            );
            newImages.push(...uploadedImages);
        }
        if (req.files && req.files.videos) {
            const uploadedVideos = await handleFileUploadProduct(
                req.files.videos,
                userId,
                "videos"
            );
            newVideos.push(...uploadedVideos);
        }
        const product = await Product.findById(productId);
        if (!product) {
            return res
                .status(404)
                .json(new ApiResponse(404, null, "Product not found"));
        }
        if (newImages.length > 0) {
            product.images.forEach(async (image) => {
                await deleteFileFromS3(image);
            });
            product.images = newImages;
        }
        if (newVideos.length > 0) {
            product.videos.forEach(async (video) => {
                await deleteFileFromS3(video);
            });
            product.videos = newVideos;
        }
        Object.assign(product, updates);

        await product.save();

        const updatedProductWithSignedUrls = {
            ...product.toObject(),
            images: await getSignedUrls(product.images),
            videos: await getSignedUrls(product.videos),
        };

        res.status(200).json(
            new ApiResponse(
                200,
                updatedProductWithSignedUrls,
                "Product updated successfully"
            )
        );
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ error: "Failed to update product" });
    }
});

// Delete a product
const deleteProduct = asyncHandler(async (req, res) => {
    const productId = req.params.id;

    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res
                .status(404)
                .json(new ApiResponse(404, null, "Product not found"));
        }
        const productData = product.toObject();
        await Promise.all(
            [...product.images, ...product.videos].map(async (s3FileName) => {
                try {
                    await deleteFileFromS3(s3FileName);
                } catch (error) {
                    console.error(
                        `Error deleting file ${s3FileName} from S3:`,
                        error
                    );
                    throw new Error(
                        `Error deleting file ${s3FileName} from S3`
                    );
                }
            })
        );
        await Product.findByIdAndDelete(productId);
        res.status(200).json(
            new ApiResponse(200, productData, "Product deleted successfully")
        );
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ error: "Failed to delete product" });
    }
});

const uploadProductMedia = asyncHandler(async (req, res) => {
    const productId = req.params.id;
    const userId = req.user._id;

    try {
        const newImages = await handleFileUploadProduct(
            req.files.images,
            userId,
            "images"
        );
        const newVideos = await handleFileUploadProduct(
            req.files.videos,
            userId,
            "videos"
        );

        const product = await Product.findById(productId);
        if (!product) {
            return res
                .status(404)
                .json(new ApiResponse(404, null, "Product not found"));
        }

        product.images.push(...newImages);
        product.videos.push(...newVideos);

        await product.save();

        const signedImages = await Promise.all(
            product.images.map(async (s3FileName) => {
                const signedUrl = await getSignedAccessUrl(s3FileName);
                return signedUrl;
            })
        );

        const signedVideos = await Promise.all(
            product.videos.map(async (s3FileName) => {
                const signedUrl = await getSignedAccessUrl(s3FileName);
                return signedUrl;
            })
        );

        const productWithSignedUrls = {
            ...product.toObject(),
            images: signedImages,
            videos: signedVideos,
        };

        res.status(200).json(
            new ApiResponse(
                200,
                productWithSignedUrls,
                "Media uploaded successfully"
            )
        );
    } catch (error) {
        console.error("Error uploading media:", error);
        res.status(500).json({ error: "Failed to upload media" });
    }
});

const deleteProductMedia = asyncHandler(async (req, res) => {
    const productId = req.params.id;
    const userId = req.user._id;
    const { imageKeys = [], videoKeys = [] } = req.body;
    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res
                .status(404)
                .json(new ApiResponse(404, null, "Product not found"));
        }
        const deletedImages = [];
        const deletedVideos = [];
        await Promise.all(
            imageKeys.map(async (imageKey) => {
                try {
                    await deleteFileFromS3(imageKey);
                    deletedImages.push(imageKey);
                } catch (error) {
                    console.error(
                        `Error deleting image ${imageKey} from S3:`,
                        error
                    );
                    throw new Error(`Error deleting image ${imageKey} from S3`);
                }
            })
        );
        await Promise.all(
            videoKeys.map(async (videoKey) => {
                try {
                    await deleteFileFromS3(videoKey);
                    deletedVideos.push(videoKey);
                } catch (error) {
                    console.error(
                        `Error deleting video ${videoKey} from S3:`,
                        error
                    );
                    throw new Error(`Error deleting video ${videoKey} from S3`);
                }
            })
        );

        product.images = product.images.filter(
            (image) => !deletedImages.includes(image)
        );

        product.videos = product.videos.filter(
            (video) => !deletedVideos.includes(video)
        );

        await product.save();

        res.status(200).json(
            new ApiResponse(200, null, "Media deleted successfully")
        );
    } catch (error) {
        console.error("Error deleting media:", error);
        res.status(500).json({ error: "Failed to delete media" });
    }
});

module.exports = {
    createProduct,
    updateProduct,
    deleteProduct,
    uploadProductMedia,
    deleteProductMedia,
};
