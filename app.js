const createError = require('http-errors');
const express = require('express');
const http = require('http');
const path = require('path');
const cookieParser = require('cookie-parser');
const debug = require('debug')('game:app');
const helmet = require('helmet');
const cors = require('cors');
const logger = require('morgan');
const _ = require('lodash');
const game = require('./lib/game');
const newPlayer = require('./lib/newPlayer');

const indexRouter = require('./routes/index');

const app = express();

app.use(helmet());

const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

// view engine setup
app.set('views', path.join(process.cwd(), 'views'));
app.set('view engine', 'pug');

app.use(cors());
//app.use(logger('dev'));
app.use(cookieParser());
app.use(express.static(path.join(process.cwd(), 'public')));

app.use('/', indexRouter);

io.on('connection', (socket) => {
    debug(`${socket.id} connected!`);

    socket.on('player joined', (callback) => {
        let player = newPlayer(socket.id);
        game.players.push(player);
        io.emit('update', _.omit(game, ['startDate', 'cookieRadius', 'cookies']));
        callback(true);
    });

    socket.on('keydown', (playerId, direction) => {
        let player = game.players.find((p) => p.id === playerId);
        player.pressedKeys[direction] = true;
        io.emit('update', _.omit(game, ['startDate', 'cookieRadius', 'cookies']));
    });

    socket.on('keyup', (playerId, direction) => {
        let player = game.players.find((p) => p.id === playerId);
        player.pressedKeys[direction] = false;
        io.emit('update', _.omit(game, ['startDate', 'cookieRadius', 'cookies']));
    });

    socket.on('get current frame', (callback) => {
        game.players.forEach((player) => {
            let progress = (Date.now() - player.lastRender)*0.4;
            player.lastRender = Date.now();
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
        
            if(player.state.x > game.width) {
                player.state.x -= game.width;
            } else if(player.state.x < 0) {
                player.state.x += game.width;
            } else if(player.state.y > game.height) {
                player.state.y -= game.height;
            } else if(player.state.y < 0) {
                player.state.y += game.height;
            }
        });
        callback(_.omit(game, ['startDate', 'cookieRadius', 'cookies']));
    });

    socket.on('disconnect', (reason) => {
        debug(`${socket.id} disconnected!`);
        game.players = game.players.filter((player) => player.id !== socket.id);
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