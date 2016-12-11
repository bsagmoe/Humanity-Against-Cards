// TODO: let these constants be defined in init.js instead of having to be fixed values

const CARD_WIDTH = 250
const CARD_HEIGHT = 350
const CARD_OFFSET = 150
const SPACING = 50
const BOTTOM_OFFSET = -50

// this is the the client side code
// using some of the nice ES6 syntax!
class Board {

  // TODO: implement the GameStats classes
  constructor(boardElement, player, roundInfo, gameStats) {
    this.boardElement = boardElement; // boardElement is the jQuery object representing the HTML element in which the board will be drawn
    this.player = player;
    this.roundInfo = roundInfo;
    this.gameStats = gameStats;
  }

  // draws the correct board for the given player
  // playerId is the unique id of the current player in the current game session
  //   - not necessairly the one stored in the Player database, as we want to allow for
  //     anonymous players
  //   - only needs to be unique within the context of the HACGame object
  drawBoard(){
    if(this.player.isCardCzar){
      this.drawCzarView();
    } else {
      this.drawProletariatView();
    }
  }

  drawCzarView(){
    this.drawBlackCard(this.roundInfo.blackCard);
    // TODO: add a view showing how many people have submitted their cards so far

  }

  // draws the card in the center of the page (unlike )
  drawCzarBlackCard(blackCard){

  }

  drawProletariatView(){
    this.drawHand(this.player.hand);
    this.drawBlackCard(this.roundInfo.blackCard);
  }

  drawHand(cards){
    let handWidth = CARD_WIDTH + (cards.length - 1) * CARD_OFFSET;
    let handLeft = this.boardElement.width()/2 - handWidth/2 + this.boardElement.position().left;
    // let handLeft = window.innerWidth/2 - handWidth/2;

    for(let i = 0; i < cards.length; i++){
      let card = $(document.createElement("div"));
      card.addClass("white card");

      let text = document.createElement("span");
      text.innerHTML = cards[i];
      card.append(text);

      card.draggable({
        scroll: false
      });

      card.css("zIndex", i);
      card.css("left", handLeft + i * CARD_OFFSET);
      card.css("bottom", BOTTOM_OFFSET);
      card.css("position", "absolute");
      this.boardElement.append(card);
    }

    $(".white").mouseenter(function(event){
      $(".white").css("zIndex", "-=1");
      $(this).css("zIndex", cards.length * 10);
    });

    // TODO: add listeners to check if the card is in one of the submit locations

  }

  drawBlackCard(blackCard){
    let card = $(document.createElement("div"));
    card.addClass("black card");

    let text = document.createElement("span");
    text.innerHTML = blackCard;
    card.append(text);

    card.css("position", "absolute");
    card.css("left", this.boardElement.width()/2 - CARD_WIDTH/2 + this.boardElement.position().left);
    // card.css("left", window.innerWidth/2 - CARD_WIDTH/2);
    // TODO: Make this better, haha
    card.css("top", 100);
    this.boardElement.prepend(card);
  }
}


// Dummy data to test that everything works as expected
$(document).ready(function(){
    let settings = new GameSettings(true, GAME_MODES.NORMAL, 3, 25, 10, 30);
    let player1 = new Player("bsagmoe");
    let player2 = new Player("davidwc");
    let game = new HumanityAgainstCards(settings);

    game.addPlayer(player1);
    game.addPlayer(player2);

    game.startGame();

    let board1 = new Board($("#player1"), player1, game.roundInfo);
    let board2 = new Board($("#player2"), player2, game.roundInfo);

    board1.drawBoard();
    board2.drawBoard();

  }
);
