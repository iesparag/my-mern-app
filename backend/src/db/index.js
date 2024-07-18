const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        const env = process.env.NODE_ENV || "development";
        let mongoUri;

        if (env === "development") {
            mongoUri = `${process.env.MONGODB_URI}`;
        } else if (env === "production") {
            mongoUri = `${process.env.MONGODB_URI}`;
        } else {
            mongoUri = `${process.env.MONGODB_URI}`;
        }

        const connectionInstance = await mongoose.connect(mongoUri);

        console.log(
            `\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`
        );
    } catch (error) {
        console.log("MONGODB connection FAILED ", error);
        process.exit(1);
    }
};

module.exports = connectDB;
