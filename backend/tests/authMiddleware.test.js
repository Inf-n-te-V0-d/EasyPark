require("dotenv").config();

const test = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const axios = require("axios");

const User = require("../models/User");
const Reservation = require("../models/Reservation");
const Parking = require("../models/Parking");
const {
  createToken,
  requireAuth,
  requireAdmin,
} = require("../middleware/authMiddleware");
const {
  isStrongPassword,
  signup,
  signin,
  verifyTurnstile,
} = require("../controllers/authenticationController");
const { addReservation } = require("../controllers/reservationController");

const makeResponse = () => {
  return {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
};

// Password Strength Test
test("password strength validation requires all character categories", () => {
  assert.equal(isStrongPassword("Weakpass1"), false);
  assert.equal(isStrongPassword("weakpass1!"), false);
  assert.equal(isStrongPassword("Weakpass!"), false);
  assert.equal(isStrongPassword("Weakpass1!"), true);
});

// JWT Authentication Test
test("createToken should issue a valid JWT for the user id", () => {
  const userId = "64d4cb2e4f33d7a1b3c1f4a2";

  const token = createToken(userId);

  const payload = jwt.verify(token, process.env.AUTH_SECRET);

  assert.equal(payload.sub, userId);
  assert.equal(typeof payload.exp, "number");
  assert.equal(payload.iat > 0, true);
});

// User Registration Test
test("user registration creates a user when turnstile validation and password rules pass", async () => {
  const originalFindOne = User.findOne;
  const originalSave = User.prototype.save;
  const originalPost = axios.post;

  axios.post = async () => ({ data: { success: true } });
  User.findOne = async () => null;
  User.prototype.save = async function saveUser() {
    return {
      toObject() {
        return {
          _id: "user-123",
          name: this.name,
          email: this.email,
          password: this.password,
          telephone: this.telephone,
          vehicleDetails: this.vehicleDetails,
        };
      },
    };
  };

  try {
    const req = {
      body: {
        name: "Jane Doe",
        email: "jane@example.com",
        password: "Strongpass1!",
        telephone: "0771234567",
        vehicleDetails: { prefix: "ABC", suffix: "1234" },
        turnstileToken: "valid-token",
      },
    };
    const res = makeResponse();

    await signup(req, res);

    assert.equal(res.statusCode, 201);
    assert.equal(typeof res.body, "object");
    assert.equal("password" in res.body, false);
  } finally {
    User.findOne = originalFindOne;
    User.prototype.save = originalSave;
    axios.post = originalPost;
  }
});

// User Login Test
test("user login returns a token when credentials and turnstile validation are valid", async () => {
  const originalFindOne = User.findOne;
  const originalPost = axios.post;
  const hashedPassword = await bcrypt.hash("Strongpass1!", 10);

  axios.post = async () => ({ data: { success: true } });
  User.findOne = async () => ({
    _id: "64d4cb2e4f33d7a1b3c1f4a2",
    name: "Jane Doe",
    email: "jane@example.com",
    telephone: "0771234567",
    password: hashedPassword,
    toObject() {
      return {
        _id: this._id,
        name: this.name,
        email: this.email,
        telephone: this.telephone,
      };
    },
  });

  try {
    const req = {
      body: {
        identifier: "jane@example.com",
        password: "Strongpass1!",
        turnstileToken: "valid-token",
      },
    };
    const res = makeResponse();

    await signin(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.message, "Signin Successful.");
    assert.equal(typeof res.body.token, "string");
    assert.equal(res.body.user.email, "jane@example.com");
    assert.equal("password" in res.body.user, false);
  } finally {
    User.findOne = originalFindOne;
    axios.post = originalPost;
  }
});

// Slot Reservation Test
test("slot reservation is created when the parking space is available", async () => {
  const originalUserExists = User.exists;
  const originalReservationExists = Reservation.exists;
  const originalFindById = Parking.findById;
  const originalFindOneAndUpdate = Parking.findOneAndUpdate;
  const originalSave = Reservation.prototype.save;

  User.exists = async () => true;
  Reservation.exists = async () => null;
  Parking.findById = async () => ({
    _id: "slot-1",
    status: "available",
    vehicleType: "light",
  });
  Parking.findOneAndUpdate = async () => ({
    _id: "slot-1",
    status: "occupied",
    vehicleNumber: "ABC-1234",
  });
  Reservation.prototype.save = async function saveReservation() {
    return {
      ...this,
      populate() {
        return {
          _id: "reservation-1",
          user: this.user,
          parkingSlot: { _id: "slot-1", status: "occupied" },
          vehicleDetails: this.vehicleDetails,
          status: "confirmed",
        };
      },
    };
  };

  try {
    const req = {
      user: { _id: "64d4cb2e4f33d7a1b3c1f4a2" },
      body: {
        parkingSlot: "64d4cb2e4f33d7a1b3c1f4a3",
        startTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        source: "scheduled",
        vehicleDetails: {
          vehicleNumber: "ABC-1234",
          vehicleType: "light",
        },
        totalAmount: 150,
      },
    };
    const res = makeResponse();

    await addReservation(req, res);

    assert.equal(res.statusCode, 201);
    assert.equal(typeof res.body, "object");
    assert.equal(res.body.status, "confirmed");
  } finally {
    User.exists = originalUserExists;
    Reservation.exists = originalReservationExists;
    Parking.findById = originalFindById;
    Parking.findOneAndUpdate = originalFindOneAndUpdate;
    Reservation.prototype.save = originalSave;
  }
});

// QR check-in Test
test("QR check-in requires a valid bearer token before access is granted", async () => {
  const userId = "64d4cb2e4f33d7a1b3c1f4a2";
  const token = createToken(userId);
  const originalFindById = User.findById;

  User.findById = () => ({
    select() {
      return {
        _id: userId,
        role: "user",
        name: "Jane Doe",
        email: "jane@example.com",
      };
    },
  });

  try {
    const validReq = {
      headers: { authorization: `Bearer ${token}` },
    };
    const validRes = makeResponse();
    const validNext = () => {
      validRes.nextCalled = true;
    };

    await requireAuth(validReq, validRes, validNext);

    assert.equal(validRes.statusCode, null);
    assert.equal(validReq.user.email, "jane@example.com");
    assert.equal(validRes.nextCalled, true);

    const missingTokenReq = { headers: {} };
    const missingTokenRes = makeResponse();
    await requireAuth(missingTokenReq, missingTokenRes, () => {});
    assert.equal(missingTokenRes.statusCode, 401);
    assert.equal(missingTokenRes.body.message, "Authentication is required.");
  } finally {
    User.findById = originalFindById;
  }
});

// Admin Route Access Test
test("admin route access is rejected for regular users and allowed for admins", () => {
  const regularUserRes = makeResponse();
  const adminRes = makeResponse();

  requireAdmin({ user: { role: "user" } }, regularUserRes, () => {});
  assert.equal(regularUserRes.statusCode, 403);
  assert.equal(regularUserRes.body.message, "Administrator access is required.");

  let called = false;
  requireAdmin({ user: { role: "admin" } }, adminRes, () => {
    called = true;
  });

  assert.equal(adminRes.statusCode, null);
  assert.equal(called, true);
});

// Cloudflare Turnstile Verification Test
test("turnstile verification accepts trusted tokens and rejects missing or failed validation", async () => {
  const originalPost = axios.post;

  axios.post = async () => ({ data: { success: true } });
  try {
    assert.equal(await verifyTurnstile("trusted-token"), true);
  } finally {
    axios.post = originalPost;
  }

  axios.post = async () => ({ data: { success: false } });
  try {
    assert.equal(await verifyTurnstile("bad-token"), false);
  } finally {
    axios.post = originalPost;
  }

  assert.equal(await verifyTurnstile(null), false);
});

// Double Booking Test
test("double booking is rejected when an overlapping reservation already exists", async () => {
  const originalUserExists = User.exists;
  const originalReservationExists = Reservation.exists;

  User.exists = async () => true;
  Reservation.exists = async () => ({ _id: "reservation-9" });

  try {
    const req = {
      user: { _id: "64d4cb2e4f33d7a1b3c1f4a2" },
      body: {
        parkingSlot: "64d4cb2e4f33d7a1b3c1f4a3",
        startTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        source: "scheduled",
        vehicleDetails: {
          vehicleNumber: "ABC-1234",
          vehicleType: "light",
        },
        totalAmount: 150,
      },
    };
    const res = makeResponse();

    await addReservation(req, res);

    assert.equal(res.statusCode, 409);
    assert.equal(res.body.message, "That parking space is already reserved for this time.");
  } finally {
    User.exists = originalUserExists;
    Reservation.exists = originalReservationExists;
  }
});
