const express = require('express');
const router = express.Router();
const config = require("../config/auth.config.js");
const db = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const JWT_SECRET = config.secret; 
const authMiddleware = require('../middleware/auth.middleware');

// Function to generate JWT token
const generateToken = (userData) => {
  return jwt.sign(userData, JWT_SECRET, { expiresIn: '1h' });
};

// User login
router.post('/login', async (req, res) => {
  const { nrp_1, nrp_2, nopol, hmkm, shift } = req.body;
  try {
    const requiredFields = ['nrp_1', 'nopol', 'hmkm', 'shift'];
    const missingFields = requiredFields.filter(field => !req.body[field]);

    requiredFields.forEach(field => {
      if (!req.body[field]) {
        missingFields.push(field);
      } else if (field === 'hmkm' && isNaN(req.body[field])) {
        missingFields.push(`${field} must be a valid number and`);
      }
    });
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `${missingFields.join(', ')} are required.`,
      });
    }

    const vehicle = await db('gps_tracking')
      .select('gps_tracking.imei', 'jobsite.port_redis')
      .select(
        db.raw("concat('db_', jobsite.id, '_', gps_tracking.\"jobsiteId\") as db_name")
      )
      .select('jobsite.port_redis')
      .join('jobsite', 'jobsite.id', 'gps_tracking.jobsiteId')
      .where('imei', nopol)
      .first();
    if (!vehicle) {
      return res.status(404).json({ message: 'Nopol not registered' });
    }

    const userData = { 
      nrp_1: nrp_1, 
      nrp_2: nrp_2,
      hmkm: hmkm,
      shift: shift,
      vehicle
    };
    const token = generateToken(userData);

    res.json({ message: 'Login successful', token, expires_in: 3600, data: vehicle });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/logout', authMiddleware, async (req, res) => {
  try {
    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


module.exports = router;
