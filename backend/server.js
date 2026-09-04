require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// routers
// USER routes
const userRouter = require("./routes/user/userRoutes");
const userSignInRouter = require("./routes/user/userSigninRoutes");
const userSignUpRouter = require("./routes/user/userSignupRoutes");

// RESERVATION routes
const reservationRouter = require("./routes/reservation/reservationRoutes");

// Parkings routes
const parkingRouter = require("./routes/parking/parkingRoutes")

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
app.use("/users", userRouter);
app.use("/signin", userSignInRouter);
app.use("/signup", userSignUpRouter);
app.use("/reservation", reservationRouter);
app.use("/parking", parkingRouter);




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
