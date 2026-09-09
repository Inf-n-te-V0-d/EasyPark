require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Parking = require("./models/Parking");

const app = express();

// routers
// USER routes
const userRouter = require("./routes/User/userRoutes");
const userSignInRouter = require("./routes/User/userSigninRoutes");
const userSignUpRouter = require("./routes/User/userSignupRoutes");

// RESERVATION routes
const reservationRouter = require("./routes/reservation/reservationRoutes");

//Reservation Time counter
const startReservationScheduler = require("./services/reservationScheduler");

// Parkings routes
const parkingRouter = require("./routes/parking/parkingRoutes")

// middleware
app.use(cors({ origin: process.env.FRONTEND_URL || true }));
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

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});




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
    const getMongoUri = () => {
      if(!process.env.MONGO_LOCAL){
        throw new Error("MONGO_LOCAL is not configured.");
      }
      return process.env.MONGO_LOCAL;
    }

    const getPort = () => {
      if(!process.env.PORT){
        throw new Error("PORT is not configured.");
      }
      return process.env.PORT;
    }
    //const mongoUri = process.env.MONGO_URI || process.env.MONGO_LOCAL || "mongodb://127.0.0.1:27017/easypark";
    //const port = Number(process.env.PORT) || 5000;

    await mongoose.connect(getMongoUri());

    if (await Parking.countDocuments() === 0) {
      await Parking.insertMany(
        ["A-01", "A-02", "A-03", "A-04", "B-01", "B-02", "B-03", "B-04", "C-01", "C-02", "C-03", "C-04"].map((slot, index) => ({
          slot,
          floor: 1,
          latitude: "6.9271",
          longitude: "79.8612",
          status: index % 4 === 2 ? "occupied" : "available",
        })),
      );
      console.log("Seeded default parking slots.");
    }

    console.log("Connected to Database!");

    //Start Reservation time scheduler
    startReservationScheduler();

    app.listen(getPort(), () => {
      console.log(`Listening on PORT ${getPort()}.`);
    });
  } catch (error) {
    console.error(`An error occurred, ${error}`);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
