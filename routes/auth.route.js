const express = require('express');
const router = express.Router();
const config = require("../config/auth.config.js");
const db = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const knex = require('knex');
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

    const missingData = [];

    const gps_tracking = await db('gps_tracking')
      .select('gps_tracking.imei', 'jobsite.port_redis')
      .select(
        db.raw("concat('db_', jobsite.\"companyId\", '_', gps_tracking.\"jobsiteId\") as db_name")
      )
      .select('jobsite.port_redis')
      .join('jobsite', 'jobsite.id', 'gps_tracking.jobsiteId')
      .where('imei', nopol)
      .first();
    if (!gps_tracking) {
      missingData.push({ nopol :'Nopol not registered' })
      return res.status(404).json({ message: missingData });
    }
    
    const dynamicDbConfig = {
      development: {
        client: 'pg',
        connection: {
          host: '45.13.132.226', 
          port: 5432,
          user: 'fms',
          password: 'fms', 
          database: gps_tracking.db_name,
        },
        dialect: 'postgres',
        pool: {
          min: 1,
          max: 3
        },
        logging: false,
      },
    };
    const dbuser = knex(dynamicDbConfig['development']);
    
    const operator1 = await dbuser('operators').where('nrp', nrp_1).first();
    const operator2 = nrp_2 ? await dbuser('operators').where('nrp', nrp_2).first() : true
    const shifts = await dbuser('shift').select('id', 'name', 'description').where('id', shift).first();
    const vehicle = await dbuser('vehicle').select('id', 'name', 'nopol', 'imei').where('imei', nopol).first();
    if(!shifts)missingData.push({ shift :'Shift not valid' });
    if(!operator1)missingData.push({ nrp_1 :'NRP 1 not registered' });
    if(!operator2)missingData.push({ nrp_2 :'NRP 2 not registered' });
    if(!vehicle)missingData.push({ nopol :'Nopol not registered' });
    if(missingData.length > 0){
      return res.status(404).json({ message: missingData });
    }

    const userData = {
      driver: {
        nrp_1: nrp_1,
        driver_1: operator1.name,
        nrp_2: nrp_2,
        driver_2: nrp_2 ? operator2.name : null,
      },
      shifts,
      vehicle,
      hmkm: hmkm,
      gps_tracking,
    };
    const token = generateToken(userData);

    res.json({ message: 'Login successful', token, expires_in: 3600 });

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
