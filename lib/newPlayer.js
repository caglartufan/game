const game = require('./game');
const randomNumberInRange = require('../helpers/randomNumberInRange');

function newPlayer(id) {
    return {
        id: id,
        colors: Array.from({ length: 3 }, () => randomNumberInRange(255)),
        height: 20,
        width: 20,
        state: {
            x: randomNumberInRange(700-(game.width/2)),
            y: randomNumberInRange(700-(game.height/2))
        },
        pressedKeys: {
            left: false,
            right: false,
            up: false,
            down: false
        },
        lastRender: Date.now()
    }
}

module.exports = newPlayer;