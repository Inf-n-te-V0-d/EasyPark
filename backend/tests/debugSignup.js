require('dotenv').config();
const axios = require('axios');
const User = require('../models/User');
const { signup } = require('../controllers/authenticationController');

const originalPost = axios.post;
const originalFindOne = User.findOne;
const originalSave = User.prototype.save;
axios.post = async () => ({ data: { success: true } });
User.findOne = async () => null;
User.prototype.save = async function saveUser() {
  console.log('save called with', this.name, this.email, this.password, this.telephone, this.vehicleDetails);
  return {
    toObject() {
      return {
        _id: 'user-123',
        name: this.name,
        email: this.email,
        password: this.password,
        telephone: this.telephone,
        vehicleDetails: this.vehicleDetails,
      };
    },
  };
};

const req = {
  body: {
    name: 'Jane Doe',
    email: 'jane@example.com',
    password: 'Strongpass1!',
    telephone: '0771234567',
    vehicleDetails: { prefix: 'ABC', suffix: '1234' },
    turnstileToken: 'valid-token',
  },
};
const res = {
  statusCode: null,
  body: null,
  status(code) { this.statusCode = code; return this; },
  json(payload) { this.body = payload; return this; },
};

signup(req, res).then(() => {
  console.log('response', res.statusCode, res.body);
}).catch((error) => {
  console.error('signup error', error);
}).finally(() => {
  axios.post = originalPost;
  User.findOne = originalFindOne;
  User.prototype.save = originalSave;
});
