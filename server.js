const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = 21000;

app.use(cors());
app.use(bodyParser.json());

app.get("/api", (req, res) => {
  res.json({
    message: "Welcome to Meta Logistics application ♣",
  });
});

app.use('/api', require('./routes/auth.route'));
app.use('/api', require('./routes/monitoring.route'));
app.use('/api', require('./routes/vehicle.route'));

app.use(function (req, res, next) {
  res.status(404).json({
    message: "not found",
  });
});

app.use(function (err, req, res, next) {
  res.status(500).json({
    message: err.message
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});