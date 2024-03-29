const createError = require('http-errors');
const express = require('express');
const http = require('http');
const path = require('path');
const cookieParser = require('cookie-parser');
const debug = require('debug')('game:app');
const helmet = require('helmet');
const cors = require('cors');
const logger = require('morgan');
const newPlayer = require('./lib/newPlayer');

const indexRouter = require('./routes/index');

const app = express();

app.use(helmet());

const server = http.createServer(app);
const { Server } = require('socket.io');
const game = require('./lib/game');
const io = new Server(server);

var players = [];

// view engine setup
app.set('views', path.join(process.cwd(), 'views'));
app.set('view engine', 'pug');

app.use(cors());
//app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(process.cwd(), 'public')));

app.use('/', indexRouter);

let gameConfig = {
    startTime: Date.now(),
    height: 700,
    width: 700
}

function updateVelocity(progress, player) {
    if(player.pressedKeys.left) {
        player.speed.x -= 0.3*progress;
    }
    else if(player.pressedKeys.right) {
        player.speed.x += 0.3*progress;
    }
    if(player.pressedKeys.up) {
        player.speed.y -= 0.3*progress;
    }
    else if(player.pressedKeys.down) {
        player.speed.y += 0.3*progress;
    }

    if(player.speed.x > 8) {
        player.speed.x = 8;
    } else if(player.speed.x < -8) {
        player.speed.x = -8;
    }
    if(player.speed.y > 8) {
        player.speed.y = 8;
    } else if(player.speed.y < -8) {
        player.speed.y = -8;
    }
}

function updatePosition(player) {
    player.state.x += player.speed.x;
    player.state.y += player.speed.y;
    
    if(player.state.x > gameConfig.width) {
        player.state.x -= gameConfig.width;
    } else if(player.state.x < 0) {
        player.state.x += gameConfig.width;
    } else if(player.state.y > gameConfig.height) {
        player.state.y -= gameConfig.height;
    } else if(player.state.y < 0) {
        player.state.y += gameConfig.height;
    }
}

io.on('connection', (socket) => {
    debug(`${socket.id} connected!`);

    socket.on('player joined', (callback) => {
        let player = newPlayer(socket.id);
        players.push(player);
        io.emit('update', players);
        callback(true);
    });

    socket.on('keydown', (playerId, direction) => {
        let player = players.find((p) => p.id === playerId);
        player.pressedKeys[direction] = true;
        io.emit('update', players);
    });

    socket.on('keyup', (playerId, direction) => {
        let player = players.find((p) => p.id === playerId);
        player.pressedKeys[direction] = false;
        io.emit('update', players);
    });

    socket.on('get current frame', (callback) => {
        players.forEach((player) => {
            let timeElapsed = Date.now()-player.lastRender;
            let progress = timeElapsed/16;

            updateVelocity(progress, player);
            updatePosition(player);

            player.lastRender = Date.now();
        });
        callback(players);
    });

    socket.on('disconnect', (reason) => {
        debug(`${socket.id} disconnected!`);
        players = players.filter((player) => player.id !== socket.id);
        io.emit('player left', socket.id);
    });
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
    next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = {
    app,
    server
};