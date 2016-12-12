// This lives on the client side, but is responsible for sending all of the updates
// to the server side (only takes game as a paramter right now for local testing)
// Allows for the board code and game code to be independent of one another.

class Controller {
  constructor(game, board) {
    this.game = game;
    this.board = board;
  }

  createSubmitHandler(game){
    return function(player){
      game.updateSubmission(player);
    }
  }

  createCardsCollectedHandler(board){
    return function(playerString, roundInfoString, gameStatsString){
      if(JSON.parse(playerString).id == board.player.id){
        board.updateAll(playerString, roundInfoString, gameStatsString);
        board.drawBoard();
      }
    }
  }


}
