// server/routes/users.js
const express = require('express');
const router = express.Router();

router.get('/:id', (req, res) => {
  res.status(200).json({ success: true, message: 'Get user route' });
});

module.exports = router;