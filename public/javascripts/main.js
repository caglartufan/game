const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
var width, height;
var lastRender;
const keyMap = {
    65: 'left',
    68: 'right',
    87: 'up',
    83: 'down'
};
const speedCoefficient = 0.4;
var players = [];

const socket = io();

socket.on('connect', () => {
    newPlayer(socket.id);
});

socket.on('update', (playersConnected) => {
    players = playersConnected;
});

socket.on('player left', (playerId) => {
    players = players.filter((player) => player.id !== playerId);
    console.log(playerId + ' left!');
});

const resize = function() {
    //width = window.innerWidth;
    //height = window.innerHeight;
    width = 700;
    height = 700;
    canvas.width = width;
    canvas.height = height;
}

function keydown(event) {
    let key = keyMap[event.keyCode];
    if(key) {
        let player = players.find((p) => p.id === socket.id);
        player.pressedKeys[key] = true;
        socket.emit('update', player);
    }
}

function keyup(event) {
    let key = keyMap[event.keyCode];
    if(key) {
        let player = players.find((p) => p.id === socket.id);
        player.pressedKeys[key] = false;
        socket.emit('update', player);
    }
}

window.onresize = resize;
window.addEventListener('keydown', keydown, false);
window.addEventListener('keyup', keyup, false);

resize();

function newPlayer(id) {
    let player = {
        id: id,
        colors: Array.from({ length: 3 }, () => Math.floor(Math.random()*256)),
        state: {
            x: Math.floor(Math.random()*676),
            y: Math.floor(Math.random()*676)
        },
        pressedKeys: {
            left: false,
            right: false,
            up: false,
            down: false
        }
    };
    socket.emit('player joined', player, (isClientReady) => {
        console.log(isClientReady);
        if(isClientReady) {
            lastRender = 0;
            window.requestAnimationFrame(loop);
        }
    });
}

function draw() {
    ctx.clearRect(0, 0, width, height);
    players.forEach((player) => {
        ctx.fillStyle = `rgb(${player.colors[0]}, ${player.colors[1]}, ${player.colors[2]})`;
        ctx.fillRect(player.state.x, player.state.y, 10, 10);
    });
}

function update(progress) {
    let player = players.find((p) => p.id === socket.id);
    progress = speedCoefficient*progress;
    if(player.pressedKeys.left) {
        player.state.x -= progress;
    }
    if(player.pressedKeys.right) {
        player.state.x += progress;
    }
    if(player.pressedKeys.up) {
        player.state.y -= progress;
    }
    if(player.pressedKeys.down) {
        player.state.y += progress;
    }

    if(player.state.x > width) {
        player.state.x -= width;
    } else if(player.state.x < 0) {
        player.state.x += width;
    } else if(player.state.y > height) {
        player.state.y -= height;
    } else if(player.state.y < 0) {
        player.state.y += height;
    }

    socket.emit('update', player);
}

function loop(timestamp) {
    let progress = timestamp - lastRender;
    if(socket.connected) {
        update(progress);
        draw();
    }
    lastRender = timestamp;
    window.requestAnimationFrame(loop);
}