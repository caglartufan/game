const createError = require('http-errors');
const express = require('express');
const http = require('http');
const path = require('path');
const cookieParser = require('cookie-parser');
const debug = require('debug')('game:app');
const helmet = require('helmet');
const cors = require('cors');
const logger = require('morgan');

const indexRouter = require('./routes/index');

const app = express();

app.use(helmet());

const server = http.createServer(app);
const { Server } = require('socket.io');
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

io.on('connection', (socket) => {
    debug(`${socket.id} connected!`);

    socket.on('player joined', (player) => {
        players.push(player);
        io.emit('player joined', player);
        socket.emit('init players', players);
    });

    socket.on('update', (player) => {
        let index = players.findIndex((p) => p.id === player.id);
        players[index] = player;
        io.emit('update', players);
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