const cors = require("cors");

const allowedOrigins = [
    "*",
    "http://localhost:3000", // Development frontend
    "http://localhost:3001", // Development frontend
    "http://localhost:3002", // Development frontend
    "http://localhost:3003", // Development frontend
    "http://localhost:3004", // Development frontend
    "http://localhost:3005", // Development frontend
    "https://6779-43-228-96-0.ngrok-free.app", // Production frontend
    "https://hbhs.vercel.app",
    "http://3.68.101.238:8081",
    "http://3.68.101.238:8080",
    "http://localhost:8081",
    "http://localhost:8080",
];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            var msg =
                "The CORS policy for this site does not allow access from the specified Origin.";
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true, // If you're using cookies
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
};

const corsMiddleware = cors(corsOptions);

module.exports = {
    corsMiddleware,
};
