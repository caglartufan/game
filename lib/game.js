const randomNumberInRange = require('../helpers/randomNumberInRange');

const game = {
    height: 700,
    width: 700,
    cookieRadius: 10,
    startDate: Date.now(),
    players: []
}

game.cookies = Array.from({ length: 45 }, () => generateCookies());

function generateCookies() {
    return {
        x: randomNumberInRange(game.width-game.cookieRadius),
        y: randomNumberInRange(game.height-game.cookieRadius),
        color: '#FFB444'
    };
}

module.exports = game;