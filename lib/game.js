const randomNumberInRange = require('../helpers/randomNumberInRange');

const game = {
    height: 700,
    width: 700,
    startDate: Date.now(),
    jumpHeight: 150,
    gravity: 100/3,
    players: []
}

module.exports = game;