// Route File
const express = require('express');
const router = express.Router();
// Bcrypt
const bcrypt = require('bcryptjs');

//Middleware
const auth = require('../../middleware/auth');

// JWT
const jwt = require('jsonwebtoken');
const config = require('config');

// Express validator
const { check, validationResult } = require('express-validator/check');

// Models
const User = require('../../models/User');

// @route  GET api/auth
// @desc   TEST route
// @access Public
router.get('/', auth,  async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch(err) {
    console.error(err.message);
    res.status(500).send('Server Error')
  }
});

// @route  POST api/auth
// @desc   Authenticate user & get token
// @access Public
router.post(
  '/', 
[
  check('email', 'Please include a valid email').isEmail(),
  check(
        'password', 'Password is required').exists()
], 
async (req, res) => {
    const errors = validationResult(req);
    if( !errors.isEmpty()){
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password} = req.body;

    try{
          // See if user exists
          let user = await User.findOne({ email});
          //If user does not exist, then there is no way to login
          if(!user) {
            return res
            .status(400)
            .json({ errors: [{ msg: 'Invalid Credentials' }]});
          }

    // Return jsonwebtoken

    const isMatch = await bcrypt.compare(password, user.password);
    // If there is no match between passwords
    if(!isMatch) {
      return res
            .status(400)
            .json({ errors: [{ msg: 'Invalid Credentials' }]});
    }
    // Create the payload for the token
    const payload = {
      user: {
        id: user.id
      }
    };
    // Sign the token, set expiration, and callback and return either error
    jwt.sign(
            payload, 
            config.get('jwtSecret'),
            { expiresIn: 360000 },
            (err, token) => {
              if(err) throw err;
              res.json({ token })
            });
    // Return jsonwebtoken
  } catch(err) {
      console.error(err.message);
      res.status(500).send('Server error')
    }
  }
);

module.exports = router;