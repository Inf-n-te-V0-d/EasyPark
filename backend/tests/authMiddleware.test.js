require("dotenv").config();

const test = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");

const { createToken } = require("../middleware/authMiddleware");
const { addParking, updateParking, deleteParking } = require("../controllers/parkingController");

test("createToken should issue a valid JWT for the user id", () => {
  const userId = "64d4cb2e4f33d7a1b3c1f4a2";

  const token = createToken(userId);

  const payload = jwt.verify(token, process.env.AUTH_SECRET);

  assert.equal(payload.sub, userId);
  assert.equal(typeof payload.exp, "number");
  assert.equal(payload.iat > 0, true);
});

const createResponse = () => {
  const response = { statusCode: null, body: null };
  response.status = (code) => {
    response.statusCode = code;
    return response;
  };
  response.json = (body) => {
    response.body = body;
    return response;
  };
  return response;
};

test("parking slot management controllers reject a regular user", async () => {
  const regularUser = { user: { role: "user" }, body: {}, params: { id: "64d4cb2e4f33d7a1b3c1f4a2" } };

  for (const controller of [addParking, updateParking, deleteParking]) {
    const response = createResponse();
    await controller(regularUser, response);
    assert.equal(response.statusCode, 403);
    assert.equal(response.body.message, "Administrator access is required to manage parking slots.");
  }
});
