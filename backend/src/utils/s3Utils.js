const {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const fs = require("fs");
const fetch = require("node-fetch");
require("dotenv").config();

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const bucketName = process.env.AWS_S3_BUCKET;

const getSignedUploadUrl = async (fileName, contentType) => {
    const params = {
        Bucket: bucketName,
        Key: fileName,
        ContentType: contentType,
        ACL: "private",
    };

    try {
        const command = new PutObjectCommand(params);
        const signedUrl = await getSignedUrl(s3, command);
        return signedUrl;
    } catch (error) {
        console.error("Error generating signed URL for upload:", error);
        throw new Error("Error generating signed URL for upload");
    }
};

const uploadFile = async (filePath, fileName, contentType) => {
    console.log("filePath: ", filePath);
    const signedUrl = await getSignedUploadUrl(fileName, contentType);
    const fileContent = fs.readFileSync(filePath);

    try {
        const response = await fetch(signedUrl, {
            method: "PUT",
            headers: {
                "Content-Type": contentType,
            },
            body: fileContent,
        });
        return response;
    } catch (error) {
        console.error("Error uploading file to S3:", error);
        throw new Error("Error uploading file to S3");
    } finally {
        fs.unlinkSync(filePath);
    }
};

const getSignedAccessUrl = async (fileName) => {
    const contentType = getFileType(fileName);
    const params = {
        Bucket: bucketName,
        Key: fileName,
        ResponseContentType: contentType,
        ResponseContentDisposition: "inline",
    };

    try {
        const command = new GetObjectCommand(params);
        const signedUrl = await getSignedUrl(s3, command);
        return signedUrl;
    } catch (error) {
        console.error("Error generating signed URL for access:", error);
        throw new Error("Error generating signed URL for access");
    }
};

const deleteFileFromS3 = async (fileName) => {
    const params = {
        Bucket: bucketName,
        Key: fileName,
    };

    try {
        const command = new DeleteObjectCommand(params);
        const data = await s3.send(command);
        console.log("data: ", data);
        console.log(`File ${fileName} deleted successfully from S3.`);
    } catch (error) {
        console.error(`Error deleting file ${fileName} from S3:`, error);
        throw new Error(`Error deleting file ${fileName} from S3`);
    }
};

const getFileType = (fileName) => {
    const ext = fileName.split(".").pop();
    switch (ext) {
        case "jpeg":
        case "jpg":
        case "png":
        case "gif":
            return `image/${ext}`;
        case "mp4":
        case "mov":
        case "avi":
            return `video/${ext}`;
        default:
            throw new Error("Unsupported file type");
    }
};

module.exports = {
    uploadFile,
    getSignedUploadUrl,
    getSignedAccessUrl,
    deleteFileFromS3,
    getFileType,
};
