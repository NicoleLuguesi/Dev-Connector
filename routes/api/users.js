// ROUTE FILE
const express = require('express');
const router = express.Router();


// Imported Models
const User = require('../../models/User');

// Gravatar
const gravatar = require('gravatar');

// Bcryptjs - library to hash passwords
const bcrypt = require('bcryptjs');

// JWT
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator/check');

// @route  POST api/users
// @desc   Register user
// @access Public
router.post(
  '/', 
[
  check('name', 'Name is required')
  .not()
  .isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6})
], 
async (req, res) => {
    const errors = validationResult(req);
    if( !errors.isEmpty()){
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password} = req.body;

    try{
          // See if user exists
          let user = await User.findOne({ email});

          if(user) {
            return res.status(400).json({ errors: [{ msg: 'User already exists' }]});
          }

    // Get users gravatar
    const avatar = gravatar.url(email, {
      s: '200',
      r: 'pg',
      d: 'mm'
    })

    // Encrypt password with bcrypt
    user = new User({
      name,
      email,
      avatar,
      password
    });

    const salt = await bcrypt.genSalt(10);

    user.password = await bcrypt.hash(password, salt);

    await User.create(user);
    
    const payload = {
      user: {
        id: user.id
      }
    }

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