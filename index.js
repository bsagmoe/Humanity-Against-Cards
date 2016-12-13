var constants = require('./js/constants.js');
var cards = require('./js/cards.js');
var deck = require('./js/deck.js');
var game = require('./js/game.js');
var utils = require('./js/utils.js');

var bodyParser = require('body-parser');
var morgan = require('morgan');

// var express = require('express');
// var app = express();
// var server = require('http').Server(app);
// var io = require('socket.io')(server);

var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server);

var mysql      = require('mysql');
var connection = mysql.createConnection('mysql://bd632d41d876cd:b148fc87@us-cdbr-iron-east-04.cleardb.net/heroku_04b9ab8da01eb10?reconnect=true');

connection.connect(function(err) {
  if(err){console.log (err); return;}

  console.log("Connection Success")

});

// connection.query('CREATE TABLE users(id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(30))', function(err){
//   if (err) throw err;
//
//   console.log('Succeeded');
// });

connection.end();

const PORT = process.argv[2];
server.listen(PORT || 3000);

// allows access to the static files we need for the game to run
app.set('views', './views');
app.set('view engine', 'pug');
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static('public'));

var usernames = {};
var rooms = [];

io.sockets.on('connection', function(socket){
  // TODO: if the user is logged in, that will be their ID

  let playerId = utils.makeId(20);
  let player = null;

  console.log("somebody connected");

  socket.on('addPlayer', function(username, gameId){
    console.log(username + " added to " + gameId);
    socket.username = username;
    socket.room = gameId;

    // connection.connect(function(err){
    // 
    // });
    //
    // connection.query('INSERT INTO users(name), VALUES("'+username+'")', function(err){
    //   if(err){
    //     console.log(err);
    //   } else {
    //     console.log(username + " inserted into users");
    //   }
    // });
    //
    // connection.end();

    usernames[username] = username;

    player = new game.Player(username, playerId);

    socket.join(gameId);
    socket.emit('playerAdded', "you have connected to game: " + gameId);
    socket.broadcast.to(gameId).emit('playerAdded', username + ' has joined the game');

    console.log(games);

    games[gameId].registerEventHandler(constants.GAME_EVENTS.SUBMITTED_CARD_CHANGED_EVENT, function(numSubmitted, numPlayers){
      io.to(socket.id).emit('submittedCardChangedEvent', numSubmitted, numPlayers);
    });

    games[gameId].registerEventHandler(constants.GAME_EVENTS.CARDS_COLLECTED_EVENT, function(playerString, roundInfoString, gameStatsString){
      io.to(socket.id).emit('cardsCollectedEvent', playerString, roundInfoString, gameStatsString);
    });

    games[gameId].registerEventHandler(constants.GAME_EVENTS.ROUND_CHANGE_EVENT, function(playerString, roundInfoString, gameStatsString){
      io.to(socket.id).emit('roundChangedEvent', playerString, roundInfoString, gameStatsString);
    });

    games[gameId].registerEventHandler(constants.GAME_EVENTS.GAME_OVER_EVENT, function(winnerString, gameStatsString){
      io.to(socket.id).emit('gameOverEvent', winnerString, gameStatsString);
    });

    if(games[gameId].gameStatus == constants.GAME_STATUS.INITIALIZING){
      games[gameId].registerEventHandler(constants.GAME_EVENTS.GAME_STARTED_EVENT, function(roundInfo, gameStats){
        io.to(socket.id).emit('initialize', JSON.stringify(player), JSON.stringify(roundInfo), JSON.stringify(gameStats))
      });
    } else if(games[gameId].gameStatus == constants.GAME_STATUS.PLAYING){
      console.log("adding player after game started")
      games[gameId].registerEventHandler(constants.GAME_EVENTS.PLAYER_ADDED_AFTER_START_EVENT, function(roundInfo, gameStats){
        io.to(socket.id).emit('initialize', JSON.stringify(player), JSON.stringify(roundInfo), JSON.stringify(gameStats))
      });
    } else {
      // the game's over!
    }

    games[gameId].addPlayer(player);

    // tell all the players that a card has been submitted
    socket.on('submitCardEvent', function(playerString){
      let player = JSON.parse(playerString);
      if(player.submittedCard == null){
        games[gameId].signalNotReadyForSubmission(player);
      } else {
        games[gameId].signalReadyForSubmission(player);
      }
    });

    // tell all the players that a card has been judged
    socket.on('cardsJudgedEvent', function(winningCard){
      games[gameId].judge(winningCard);
    });

    socket.on('disconnect', function(){
      console.log(socket.username + " disconnected");
      delete usernames[socket.username];
      games[socket.room].removePlayer(player);
      socket.leave(socket.room);
    });

  });




  // socket.on('disconnect', function(){
  //   delete usernames[socket.username];
  //   games[socket.room].removePlayer(player);
  //   socket.leave(socket.room);
  // });

});

var testSettings = new game.GameSettings(true, constants.GAME_MODES.NORMAL, 6, 1, 10, 30, true);
var defaultDeck = new deck.Deck(cards.WHITE_CARDS, cards.BLACK_CARDS);
var testGame = new game.HumanityAgainstCards(testSettings, utils.makeId(20), "testGame", defaultDeck);

let games = {};
games[testGame.gameId] = testGame;


// const PORT = process.argv[2] || 3000;
//
// server.listen(PORT, function(){
//   console.log("Listening on port " + PORT);
// });

// the home page
app.get('/', function(req, res){
  res.render('index');
});

app.get('/game', function(req, res){
  // res.sendFile(__dirname + "/views/game-board.html");
  let openGames = [];

  for(var key in games){
    openGames.push(games[key]);
  }
  res.render('game-select', {openGames: openGames});
});


// Used to create new games
app.post('/game', function(req, res){
  let nsfw = true;
  let autoSubmit = true;
  if(!req.body.isNSFW){
    nsfw = false;
  }

  if(!req.body.autoSubmit){
    autoSubmit = false;
  }

  let newSettings = new game.GameSettings(nsfw,
                                       constants.GAME_MODES.NORMAL,
                                       parseInt(req.body.handSize),
                                       parseInt(req.body.numRounds),
                                       Math.floor(parseInt(req.body.numRounds)/2),
                                       parseInt(req.body.submitTimeLimit),
                                       autoSubmit);
  let newDeck = null;
  if(nsfw){
    newDeck = new deck.Deck(cards.WHITE_CARDS, cards.BLACK_CARDS);
  } else {
    newDeck = new deck.Deck(cards.SFW_WHITE_CARDS, cards.SFW_BLACK_CARDS);
  }

  let newId = utils.makeId(20);
  let newGame = new game.HumanityAgainstCards(newSettings, newId, req.body.gameName, newDeck);
  games[newGame.gameId] = newGame;
  res.redirect("/game/" + newId);
});

app.get('/game/:gameId', function(req, res){
  let currentGame = games[req.params.gameId];
  if(currentGame){
    // res.sendFile(__dirname + "/views/game-board.html");
    res.render('game-board', {port: PORT});
  } else {
    res.redirect('/game');
  }
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
