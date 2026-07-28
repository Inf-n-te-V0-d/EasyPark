require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// routers
const userSignInRouter = require("./routes/User/userSigninRoutes");
const userSignUpRouter = require("./routes/User/userSignupRoutes");

// middleware
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log("Middleware executed!");
  console.log(`Method: ${req.method}`);
  console.log(`Path: ${req.path}`);
  next();
});


// Routes
app.use("/signin", userSignInRouter);
app.use("/signup", userSignUpRouter);




// DB Connection
/*mongoose
  .connect(process.env.MONGO_LOCAL)
  .then(() => {
    // Listen on the PORT
    app.listen(process.env.PORT, () => {
      console.log(`Connected to database!`);
      console.log(`Listening on PORT ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log(`An error occured, ${error}`);
  });*/

// DB connection (Most suitable)
async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_LOCAL);
    console.log("Connected to Database!");

    app.listen(process.env.PORT, () => {
      console.log(`Listening on PORT ${process.env.PORT}.`);
    });
  } catch (error) {
    console.error(`An error occurred, ${error}`);
    process.exit(1);
  }
}

startServer();
