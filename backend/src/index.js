require("dotenv").config();
const connectDB = require("./db/index.js");
const { app } = require("./app.js");

connectDB()
    .then(function () {
        app.listen(process.env.PORT || 8000, function () {
            console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
        });
    })
    .catch(function (err) {
        console.log("MONGO db connection failed !!! ", err);
    });
