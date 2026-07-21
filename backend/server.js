require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());

// middleware
app.use(express.json());
app.use((req, res, next) => {
    console.log("Middleware executed!");
    console.log(`Method: ${req.method}`);
    console.log(`Path: ${req.path}`);
    next();
})




// DB Connection
mongoose
.connect(process.env.MONGO_LOCAL)
.then(() => {
    // Listen on the PORT
    app.listen(process.env.PORT, () => {
        console.log(`Connected to database!`);
        console.log(`Listening on PORT ${process.env.PORT}`)
    })
})
.catch((error) => {
    console.log(`An error occured, ${error}`);
})