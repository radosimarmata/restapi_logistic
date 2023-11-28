const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');

router.get('/monitoring', authMiddleware, async (req, res) => {
  try {
    const userData = req.userData;
    const knex = req.userConn;
    res.json({
      message: 'Retrieved monitoring data'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/monitoring/detail', authMiddleware, async (req, res) => {
  try {
    const userData = req.userData;
    const knex = req.userConn;
    const vehicle = await knex('vehicle')
      .where('imei', userData.gps_tracking.imei)
      .first();
    const operator = await knex('operators')
      .whereIn('nrp', [userData.nrp_1, 'OPR0124']);

    const data = {
      driver1 : operator[0].name,
      driver2 : operator[1] ? operator[1].name : '',
      nopol : vehicle.nopol
    };

    res.json({
      message: 'Retrieved monitoring detail data',
      data: data,
      vehicle: vehicle
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
