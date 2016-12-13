// This lives on the client side, but is responsible for sending all of the updates
// to the server side (only takes game as a paramter right now for local testing)
// Allows for the board code and game code to be independent of one another.

class Controller {
  constructor() {

  }

  createSubmitToGameHandler(game){
    return function(player){
      if(player.submittedCard == null){
        game.signalNotReadyForSubmission(JSON.stringify(player));
      } else {
        game.signalReadyForSubmission(JSON.stringify(player));
      }
    }
  }

  createJudgeToGameHandler(game){
    return function(winningCard){
      console.log("winning card:", winningCard);
      game.judge(winningCard);
    }
  }

  createCardsCollectedHandler(board){
    return function(playerString, roundInfoString, gameStatsString){
      if(JSON.parse(playerString).id == board.player.id){
        console.log(roundInfoString);
        board.updateAll(playerString, roundInfoString, gameStatsString);
        board.drawBoard();
      }
    }
  }

  createCardSubmittedChangeHandler(board){
    return function(numSubmitted, numPlayers){
      board.updateNumSubmitted(numSubmitted, numPlayers);
    }
  }

  createRoundChangedHandler(board){
    return function(playerString, roundInfoString, gameStatsString){
      if(JSON.parse(playerString).id == board.player.id){
        console.log(roundInfoString);
        board.updateAll(playerString, roundInfoString, gameStatsString);
        board.drawBoard();
      }
    }
  }

  createGameOverHandler(board){
    return function(winnerString, gameStatsString){
      board.updateGameStats(gameStatsString);
      board.drawGameOver(winnerString);
    }
  }


}
