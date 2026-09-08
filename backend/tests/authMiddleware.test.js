require("dotenv").config();

const test = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");

const { createToken } = require("../middleware/authMiddleware");
const { isStrongPassword } = require("../controllers/authenticationController");

test("password strength validation requires all character categories", () => {
  assert.equal(isStrongPassword("Weakpass1"), false);
  assert.equal(isStrongPassword("weakpass1!"), false);
  assert.equal(isStrongPassword("Weakpass!"), false);
  assert.equal(isStrongPassword("Weakpass1!"), true);
});

test("createToken should issue a valid JWT for the user id", () => {
  const userId = "64d4cb2e4f33d7a1b3c1f4a2";

  const token = createToken(userId);

  const payload = jwt.verify(token, process.env.AUTH_SECRET);

  assert.equal(payload.sub, userId);
  assert.equal(typeof payload.exp, "number");
  assert.equal(payload.iat > 0, true);
});
