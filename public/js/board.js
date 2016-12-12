// TODO: let these constants be defined in init.js instead of having to be fixed values

// NOTE: change these back to regular for the full thing
const CARD_WIDTH = 250/2
const CARD_HEIGHT = 350/2
const CARD_OFFSET = 150/2
const SPACING = 50/2
const BOTTOM_OFFSET = -50/2

// this is the the client side code
// using some of the nice ES6 syntax!
class Board {

  // TODO: implement the GameStats classes
  constructor(boardElement, player, roundInfo, gameStats) {
    this.boardElement = boardElement; // boardElement is the jQuery object representing the HTML element in which the board will be drawn
    this.player = player;
    this.roundInfo = roundInfo;
    this.gameStats = gameStats;
    this.registeredEventHandlers = {};
  }

  registerEventHandler(eventType, handler) {
    if (this.registeredEventHandlers[eventType] == null) {
        this.registeredEventHandlers[eventType] = new Array();
    }

    this.registeredEventHandlers[eventType].push(handler);
  }

  updateAll(playerString, roundInfoString, gameStatsString){
    this.updatePlayer(playerString);
    this.updateRoundInfo(roundInfoString);
    this.updateGameStats(gameStatsString);
  }

  updatePlayer(playerString){
    // used to update the player each time it is sent from the server (i.e. each new round)
    this.player = JSON.parse(playerString);
  }

  updateRoundInfo(roundInfoString){
    this.roundInfo = JSON.parse(roundInfoString);
  }

  // Used to update the in-game dashboard (about who's winning, etc.)
  updateGameStats(gameStatsString){
    this.gameStats = JSON.parse(gameStatsString);
  }

  // TODO: make everything have pretty animations so transitions aren't so quick
  // NOTE: look into what jQuery has available!
  drawBoard(){
    if(this.roundInfo.roundStatus == ROUND_STATUS.SUBMITTING){
      if(this.player.isCardCzar){
        this.drawSubmittingCzarView();
      } else {
        this.drawSubmittingProletariatView();
      }
    } else if(this.roundInfo.roundStatus == ROUND_STATUS.JUDGING){
      if(this.player.isCardCzar){
        this.drawJudgingCzarView();
      } else {
        this.drawJudgingProletariatView();
      }
    } else if(this.roundInfo.roundStatus = ROUND_STATUS.END_OF_ROUND){

    }
  }

  drawSubmittingCzarView(){
    this.drawBlackCard(this.roundInfo.blackCard);
    // TODO: add a view showing how many people have submitted their cards so far

  }

  drawSubmittingProletariatView(){
    this.drawBlackCardAndSubmitLocation(this.roundInfo.blackCard);
    this.drawHand(this.player.hand);
  }

  drawJudgingCzarView(){
    // Should probably only have to change some of the CSS attributes
    // the black card will be the same, can use
    this.boardElement.prepend("Judging Czar view");
    this.drawHand(this.roundInfo.submittedCards);
  }

  drawJudgingProletariatView(){
    this.boardElement.empty();
    this.boardElement.prepend("Judging Prole view");
  }


  drawHand(cards){
    let handWidth = CARD_WIDTH + (cards.length - 1) * CARD_OFFSET;
    let handLeft = this.boardElement.width()/2 - handWidth/2 + this.boardElement.position().left;

    let that = this;
    for(let i = 0; i < cards.length; i++){
      let card = $(document.createElement("div"));
      card.addClass("white card");

      let text = document.createElement("span");
      text.innerHTML = cards[i];
      card.append(text);

      card.draggable({
        scroll: false,
        stop: function(){
          let pos = $(this).position();
          let otherPos = null;

          // When we're submitting cards, we're looking for it to be on the submit location
          if(that.roundInfo.roundStatus == ROUND_STATUS.SUBMITTING){
            otherPos = $("#" + that.player.id + "submit").position();

          // When we're judging cards, we're looking for it to be on the black card
          } else if(that.roundInfo.roundStatus == ROUND_STATUS.JUDGING){
            otherPos = $(".black").position();
          }

          if(Math.abs(pos.left - otherPos.left) <= CARD_WIDTH/4 && Math.abs(pos.top - otherPos.top) <= CARD_HEIGHT/4){

            if(that.roundInfo.roundStatus == ROUND_STATUS.SUBMITTING) {
              that.player.setSubmittedCard(cards[i]);

              let handlers = that.registeredEventHandlers[GAME_EVENTS.CARD_SUBMITTED_EVENT];
            	if (handlers != null) {
            	    for (let i = 0; i < handlers.length; i++) {
            		      handlers[i](that.player);
            	    }
            	}
            } else if(that.roundInfo.roundStatus == ROUND_STATUS.JUDGING){
              let handlers = that.registeredEventHandlers[GAME_EVENTS.CARDS_JUDGED_EVENT];
            	if (handlers != null) {
            	    for (let i = 0; i < handlers.length; i++) {

                    //TODO: implement the handler for Cards judged event
            		      handlers[i]();
            	    }
            	}
            }

            // The card doesn't intersect the submit location, so we check if it's the one already there or not
          } else if(that.roundInfo.roundStatus == ROUND_STATUS.SUBMITTING && that.player.getSubmittedCard() == cards[i]) {
            that.player.setSubmittedCard(null);
          }
        }
      });

      card.css("zIndex", i);
      card.css("left", handLeft + i * CARD_OFFSET);
      card.css("bottom", BOTTOM_OFFSET);
      card.css("position", "absolute");
      this.boardElement.append(card);
    }

    $(".white").mouseenter(function(event){
      $(".white").css("zIndex", "-=1");
      // 10 *  cards.length makes it so that it's very unlikely the bottomost cards
      // will have a negative z-index (i.e. it won't likely show up behind the black card)
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

    // TODO: Make this better, haha
    card.css("top", 100);
    this.boardElement.prepend(card);
  }

  drawBlackCardAndSubmitLocation(blackCard){
    let card = $(document.createElement("div"));
    let submit = $(document.createElement("div"));
    card.addClass("black card");
    submit.addClass("submit card");
    submit.attr("id", this.player.id + "submit");  // useful for one screen testing

    let text = document.createElement("span");
    text.innerHTML = blackCard;
    card.append(text);

    let submitText = document.createElement("span");
    submitText.innerHTML = "Submit card";
    submit.append(submitText);

    card.css("position", "absolute");
    submit.css("position", "absolute");

    card.css("left", this.boardElement.width()/2 - CARD_WIDTH - 10 + this.boardElement.position().left);
    submit.css("left", this.boardElement.width()/2 + 10 + this.boardElement.position().left);

    card.css("top", 100);   // Make the top value adaptive instead of hardcoded
    submit.css("top", 100);

    this.boardElement.prepend(card);
    this.boardElement.prepend(submit);
  }
}


// Dummy data to test that everything works as expected
$(document).ready(function(){
    let settings = new GameSettings(true, GAME_MODES.NORMAL, 3, 25, 10, 30);
    let player1 = new Player("bsagmoe");
    let player2 = new Player("davidwc");
    let player3 = new Player("zackwd");

    let game = new HumanityAgainstCards(settings);

    game.addPlayer(player1);
    game.addPlayer(player2);
    game.addPlayer(player3);

    game.startGame();

    let board1 = new Board($("#player1"), player1, game.roundInfo);
    let board2 = new Board($("#player2"), player2, game.roundInfo);
    let board3 = new Board($("#player3"), player3, game.roundInfo);


    let controller1 = new Controller(game, board1);
    let controller2 = new Controller(game, board2);
    let controller3 = new Controller(game, board3);


    game.registerEventHandler(GAME_EVENTS.CARDS_COLLECTED_EVENT, controller1.createCardsCollectedHandler(board1));
    game.registerEventHandler(GAME_EVENTS.CARDS_COLLECTED_EVENT, controller2.createCardsCollectedHandler(board2));
    game.registerEventHandler(GAME_EVENTS.CARDS_COLLECTED_EVENT, controller3.createCardsCollectedHandler(board3));

    board1.registerEventHandler(GAME_EVENTS.CARD_SUBMITTED_EVENT, controller1.createSubmitHandler(game));
    board2.registerEventHandler(GAME_EVENTS.CARD_SUBMITTED_EVENT, controller2.createSubmitHandler(game));
    board3.registerEventHandler(GAME_EVENTS.CARD_SUBMITTED_EVENT, controller3.createSubmitHandler(game));


    board1.drawBoard();
    board2.drawBoard();
    board3.drawBoard();
  }
);
