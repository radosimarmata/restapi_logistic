const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const db = require('../config/db');

router.get('/vehicle', authMiddleware, async (req, res) => {
  try {
    const userData = req.userData;
    const knex = req.userConn;
    const vehicle = await knex('vehicle')
      .where('imei', userData.vehicle.imei)
      .first();

    res.json({
      message: 'Retrieved vehicle data',
      userData: userData,
      vehicle : vehicle
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
router.get('/vehicle/detail', authMiddleware, async (req, res) => {
  try {
    const userData = req.userData;
    const knex = req.userConn;
    const vehicle = await knex('vehicle')
      .where('imei', userData.vehicle.imei)
      .first();

    res.json({
      message: 'Retrieved vehicle data',
      userData: userData,
      vehicle : vehicle
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
