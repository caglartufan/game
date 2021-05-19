const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
var width, height;
const keyMap = {
    65: 'left',
    68: 'right',
    87: 'up',
    83: 'down'
};
var players = [];

const socket = io();

socket.on('connect', () => {
    newPlayer();
});

socket.on('update', (playersConnected) => {
    players = playersConnected;
});

socket.on('player left', (playerId) => {
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

function newPlayer() {
    socket.emit('player joined', (isClientReady) => {
        if(isClientReady) {
            window.requestAnimationFrame(loop);
        }
    });
}

function draw() {
    ctx.clearRect(0, 0, width, height);
    players.forEach((player) => {
        ctx.fillStyle = `rgb(${player.colors[0]}, ${player.colors[1]}, ${player.colors[2]})`;
        ctx.fillRect(player.state.x, player.state.y, player.width, player.height);
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
    if(socket.connected) {
        update();
        draw();
    }
    window.requestAnimationFrame(loop);
}