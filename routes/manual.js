const express = require('express');

const router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('.\\manual\\manual', { title: 'Manual Commands' });
});

module.exports = router;
