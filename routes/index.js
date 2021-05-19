const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
    res.render('index', { title: 'Game' });
});

/* GET game page. */
router.get('/game', (req, res, next) => {
    res.render('game');
});

module.exports = router;