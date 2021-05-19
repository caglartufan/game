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
        socket.emit('keydown', socket.id, key);
    }
}

function keyup(event) {
    let key = keyMap[event.keyCode];
    if(key) {
        socket.emit('keyup', socket.id, key);
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

function update() {
    socket.emit('get current frame', (connectedPlayers) => {
        if(connectedPlayers && connectedPlayers.length) {
            players = connectedPlayers;
        }
    });
}

function loop(timestamp) {
    let progress = timestamp - lastRender;
    if(socket.connected) {
        update();
        draw();
    }
    lastRender = timestamp;
    window.requestAnimationFrame(loop);
}