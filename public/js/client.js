let board = null;

socket.on('connect', function(){
  socket.emit('addPlayer', prompt("What screen name do you want to use?"), window.location.href.slice(27));
});

socket.on('initialize', function(playerString, roundInfoString, gameStatsString){
  board = new Board($("body"), JSON.parse(playerString), JSON.parse(roundInfoString), JSON.parse(gameStatsString));
  board.drawBoard();

  board.registerEventHandler(GAME_EVENTS.SUBMITTED_CARD_CHANGED_EVENT, function(player){
      socket.emit('submitCardEvent', JSON.stringify(player));
    });

  board.registerEventHandler(GAME_EVENTS.CARDS_JUDGED_EVENT, function(winningCard){
      socket.emit('cardsJudgedEvent', winningCard);
    });

  socket.on('submittedCardChangedEvent', function(numSubmitted, numPlayers){
    board.updateNumSubmitted(numSubmitted, numPlayers);
  });

  socket.on('cardsCollectedEvent', function(playerString, roundInfoString, gameStatsString){
    if(JSON.parse(playerString).id == board.player.id){
      board.updateAll(playerString, roundInfoString, gameStatsString);
      board.drawBoard();
    }
  });

  socket.on('roundChangedEvent', function(playerString, roundInfoString, gameStatsString){
    if(JSON.parse(playerString).id == board.player.id){
      board.updateAll(playerString, roundInfoString, gameStatsString);
      board.drawBoard();
    }
  });

  socket.on('gameOverEvent', function(winnerString, gameStatsString){
    board.updateGameStats(gameStatsString);
    board.drawGameOver(winnerString);
  });

});
