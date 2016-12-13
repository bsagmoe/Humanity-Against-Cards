var express = require('express');
var app = express();
var server = require('http').Server(app);

var constants = require('./js/constants.js');
var cards = require('./js/cards.js');
var deck = require('./js/deck.js');
var game = require('./js/game.js');
var utils = require('./js/utils.js');

var io = require('socket.io')(server);

var testSettings = new game.GameSettings(false, constants.GAME_MODES.NORMAL, 6, 20, 10, 30, true);
var defaultDeck = new deck.Deck(cards.WHITE_CARDS, cards.BLACK_CARDS);
var testGame = new game.HumanityAgainstCards(testSettings, utils.makeId(20), "testGame", defaultDeck);

let games = [];
games.push(testGame);

server.listen(3000, function(){
  console.log("Listening on port 3000");
});

let i = 0;
io.on('connection', function(socket){

  // TODO: insert database code to get the players name and id
  let playerName = "player" + i;
  let playerId = utils.makeId(20);
  let player = new game.Player(playerName, playerId);
  i++;

  // if(testGame.gameStatus == constants.GAME_STATUS.PLAYING){
  //   io.to(socket.id).emit('initialize', JSON.stringify(player), JSON.stringify(testGame.roundInfo), JSON.stringify(testGame.gameStatus));
  // }

  testGame.registerEventHandler(constants.GAME_EVENTS.GAME_STARTED_EVENT, function(roundInfo, gameStatus){
    io.to(socket.id).emit('initialize', JSON.stringify(player), JSON.stringify(roundInfo), JSON.stringify(gameStatus))
  });

  testGame.addPlayer(player);

  // tell all the players that a card has been submitted
  socket.on('submitCardEvent', function(playerString){
    let player = JSON.parse(playerString);
    if(player.submittedCard == null){
      testGame.signalNotReadyForSubmission(player);
    } else {
      testGame.signalReadyForSubmission(player);
    }
  });

  // tell all the players that a card has been judged
  socket.on('cardsJudgedEvent', function(winningCard){
    testGame.judge(winningCard);
  });


  testGame.registerEventHandler(constants.GAME_EVENTS.SUBMITTED_CARD_CHANGED_EVENT, function(numSubmitted, numPlayers){
    io.to(socket.id).emit('submittedCardChangedEvent', numSubmitted, numPlayers);
  });

  testGame.registerEventHandler(constants.GAME_EVENTS.CARDS_COLLECTED_EVENT, function(playerString, roundInfoString, gameStatsString){
    io.to(socket.id).emit('cardsCollectedEvent', playerString, roundInfoString, gameStatsString);
  });

  testGame.registerEventHandler(constants.GAME_EVENTS.ROUND_CHANGE_EVENT, function(playerString, roundInfoString, gameStatsString){
    io.to(socket.id).emit('roundChangedEvent', playerString, roundInfoString, gameStatsString);
  });

  testGame.registerEventHandler(constants.GAME_EVENTS.GAME_OVER_EVENT, function(winnerString, gameStatsString){
    io.to(socket.id).emit('gameOverEvent', numSubmitted, numPlayers);
  });

  socket.on('disconnect', function(){
    testGame.removePlayer(player);
  })
});

app.set('views', './views');
app.set('view engine', 'pug');

// allows access to the static files we need for the game to run
app.use(express.static('public'));

// the home page
app.get('/', function(req, res){
  res.render('index');
});

app.get('/game', function(req, res){
  res.sendFile(__dirname + "/views/game-board.html");
});

app.get('/login', function(req, res){
  res.send("login will go here");
});

app.get('/prefrences', function(req, res){
  let name = "testPlayer";
  let titleString = name + "'s game preferences"
  let firstName = "Test"
  let lastName = "Player"



  let realName = lastName + ", " + firstName;
  res.render('preferences', {title: titleString,
                             screenName: name,
                             realName: realName});
});

app.post('/preferences', function(req, res){
  console.log()
});

app.get('/statistics', function(req, res){
  res.send("stats will go here");
});
