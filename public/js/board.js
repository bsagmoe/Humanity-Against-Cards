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

  // TODO: make everything have pretty animations so transitions aren't jittery
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
    this.boardElement.children(".white").remove();
    this.drawBlackCard(this.roundInfo.blackCard);
    this.boardElement.prepend('<div class="submit-counter" id=' + this.player.id + '-submit-counter></div>');
    $("#" + this.player.id + "-submit-counter").text("No cards submitted");
  }

  updateNumSubmitted(numSubmitted, numPlayers){
    if(numSubmitted == 0){
      $("#" + this.player.id + "-submit-counter").text("No cards submitted");
    } else {
      $("#" + this.player.id + "-submit-counter").text(numSubmitted + " of " + numPlayers + " submitted");
    }
  }

  drawSubmittingProletariatView(){
    this.boardElement.children(".white").remove();
    this.boardElement.prepend('<div class="submit-counter" id=' + this.player.id + '-submit-counter></div>');
    $("#" + this.player.id + "-submit-counter").text("No cards submitted");

    this.drawBlackCard(this.roundInfo.blackCard);
    this.drawHand(this.player.hand);
  }

  drawJudgingCzarView(){
    // Should probably only have to change some of the CSS attributes
    // the black card will be the same, can use
    this.boardElement.prepend("Judging Czar view");
    $("#" + this.player.id + "-submit-counter").remove();
    this.drawHand(this.roundInfo.submittedCards);
  }

  drawJudgingProletariatView(){
    this.boardElement.empty();
    this.boardElement.prepend("Judging Prole view");
    this.drawHand(this.roundInfo.submittedCards);
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
        // TODO: refactor this into a function that goes somewhere else
        stop: function(){
          let pos = $(this).position();
          // will only need to be ".black" when in production
          let otherPos = $("#" + that.player.id).position();

          if(Math.abs(pos.left - otherPos.left) <= CARD_WIDTH/4 && Math.abs(pos.top - otherPos.top) <= CARD_HEIGHT/4){

            if(that.roundInfo.roundStatus == ROUND_STATUS.SUBMITTING) {
              that.player.submittedCard = cards[i];

              let handlers = that.registeredEventHandlers[GAME_EVENTS.SUBMITTED_CARD_CHANGED_EVENT];
            	if (handlers != null) {
            	    for (let i = 0; i < handlers.length; i++) {
            		      handlers[i](that.player);
            	    }
            	}
            } else if(that.roundInfo.roundStatus == ROUND_STATUS.JUDGING){
              console.log("Submitting judged card: " + cards[i]);
              let winningCard = cards[i];
              let handlers = that.registeredEventHandlers[GAME_EVENTS.CARDS_JUDGED_EVENT];
            	if (handlers != null) {
            	    for (let i = 0; i < handlers.length; i++) {
                    console.log(winningCard);
            		      handlers[i](winningCard);
            	    }
            	}
            }

            // The card doesn't intersect the submit location, so we check if it's the one already there or not
          } else if(that.roundInfo.roundStatus == ROUND_STATUS.SUBMITTING && that.player.submittedCard == cards[i]) {
            that.player.submittedCard = null;


            let handlers = that.registeredEventHandlers[GAME_EVENTS.SUBMITTED_CARD_CHANGED_EVENT];
          	if (handlers != null) {
          	    for (let i = 0; i < handlers.length; i++) {
          		      handlers[i](that.player);
          	    }
          	}
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
    card.attr("id", this.player.id);

    let text = document.createElement("span");
    text.innerHTML = blackCard;
    card.append(text);

    card.css("position", "absolute");
    card.css("left", this.boardElement.width()/2 - CARD_WIDTH/2 + this.boardElement.position().left);

    // TODO: Make this better, haha
    card.css("top", 100);
    this.boardElement.prepend(card);
  }

  drawGameOver(winnerString){
    this.boardElement.empty();
    this.boardElement.prepend("<div>Game Over</div>");
    let winner = JSON.parse(winnerString);
    if(winner.id == this.player.id){
      this.boardElement.prepend("<div>You won with " + winner.victoryPoints + " victory points!</div>");
    } else {
      this.boardElement.prepend("<div>" + winner.name + " won with " + winner.victoryPoints + " victory points!</div>");
    }
  }
}


// Dummy data to test that everything works as expected
$(document).ready(function(){
    let settings = new GameSettings(true, GAME_MODES.NORMAL, 3, 1, 1, 30);
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

    game.registerEventHandler(GAME_EVENTS.SUBMITTED_CARD_CHANGED_EVENT, controller1.createCardSubmittedChangeHandler(board1));
    game.registerEventHandler(GAME_EVENTS.SUBMITTED_CARD_CHANGED_EVENT, controller2.createCardSubmittedChangeHandler(board2));
    game.registerEventHandler(GAME_EVENTS.SUBMITTED_CARD_CHANGED_EVENT, controller3.createCardSubmittedChangeHandler(board3));

    game.registerEventHandler(GAME_EVENTS.ROUND_CHANGE_EVENT, controller1.createRoundChangedHandler(board1));
    game.registerEventHandler(GAME_EVENTS.ROUND_CHANGE_EVENT, controller2.createRoundChangedHandler(board2));
    game.registerEventHandler(GAME_EVENTS.ROUND_CHANGE_EVENT, controller3.createRoundChangedHandler(board3));

    game.registerEventHandler(GAME_EVENTS.GAME_OVER_EVENT, controller1.createGameOverHandler(board1));
    game.registerEventHandler(GAME_EVENTS.GAME_OVER_EVENT, controller2.createGameOverHandler(board2));
    game.registerEventHandler(GAME_EVENTS.GAME_OVER_EVENT, controller3.createGameOverHandler(board3));

    board1.registerEventHandler(GAME_EVENTS.SUBMITTED_CARD_CHANGED_EVENT, controller1.createSubmitToGameHandler(game));
    board2.registerEventHandler(GAME_EVENTS.SUBMITTED_CARD_CHANGED_EVENT, controller2.createSubmitToGameHandler(game));
    board3.registerEventHandler(GAME_EVENTS.SUBMITTED_CARD_CHANGED_EVENT, controller3.createSubmitToGameHandler(game));

    board1.registerEventHandler(GAME_EVENTS.CARDS_JUDGED_EVENT, controller1.createJudgeToGameHandler(game));
    board2.registerEventHandler(GAME_EVENTS.CARDS_JUDGED_EVENT, controller2.createJudgeToGameHandler(game));
    board3.registerEventHandler(GAME_EVENTS.CARDS_JUDGED_EVENT, controller3.createJudgeToGameHandler(game));

    board1.drawBoard();
    board2.drawBoard();
    board3.drawBoard();
  }
);
