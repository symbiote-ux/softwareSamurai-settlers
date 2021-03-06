const express = require('express');
const cookieParser = require('cookie-parser');
const { Game } = require('./models/game');
const { GameList } = require('./models/gameList');
const { Sessions } = require('./models/sessions');
const { catanRouter } = require('./catanRouter');

const {
  hostNewGame,
  serveJoinPage,
  joinGame,
  ensureSession
} = require('./handlers');

const app = express();

app.locals.game = new Game();
app.locals.gameList = new GameList();
app.locals.sessions = new Sessions();

app.set('view engine', 'pug');
app.set('views', './templates');

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/catan', catanRouter);

app.use(ensureSession);
app.use(express.static('public'));

app.get('/join.html', serveJoinPage);
app.post('/host', hostNewGame);
app.post('/join', joinGame);

module.exports = { app };
