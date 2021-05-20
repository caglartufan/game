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
            y: game.height-20
        },
        speed: {
            x: 0,
            y: 0
        },
        isGrounded: true,
        jump: {
            active: false,
            start: 0,
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