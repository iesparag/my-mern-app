const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const routesArray = require("./routes");
const app = express();

// app.use(cors("*"));
app.use(
    cors({
        origin: "*",
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        allowedHeaders: "Content-Type, Authorization",
    })
);
// app.use(
//     bodyParser.json({
//         verify: (req, res, buf) => {
//             req.rawBody = buf;
//         },
//     })
// );
app.use(morgan("dev"));
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

routesArray.forEach(({ path, handler }) => {
    app.use(path, handler);
});

module.exports = { app };
