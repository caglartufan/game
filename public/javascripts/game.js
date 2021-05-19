const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const width, height;
const lastRender;

const resize = function() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
}

window.onresize = resize;
resize();

const state = {
    x: (width / 2),
    y: (height / 2),
    velocity: {
        x: 0,
        y: 0
    },
    print: function() { console.log("x: " + this.x + ", y: " + this.y); }
};

function update(progress) {
    state.velocity.y = gravity*lastRender/1000;
    state.y += state.velocity.y;
    if(state.y > height) {
        state.velocity.y = 0;
        state.y = height - 10;
    }
}

function draw() {
    ctx.fillStyle = "red";
    ctx.clearRect(0, 0, width, height);
    ctx.fillRect(state.x - 10, state.y - 10, 20, 20);
}

function loop(timestamp) {
    let progress = timestamp - lastRender;

    update(progress);
    draw();

    lastRender = timestamp;
    if(lastRender < 5000) window.requestAnimationFrame(loop);
}

var lastRender = 0;
window.requestAnimationFrame(loop);