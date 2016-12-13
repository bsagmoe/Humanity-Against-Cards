// TODO: let these constants be defined in init.js instead of having to be fixed values
const CARD_WIDTH = 250
const CARD_HEIGHT = 350
const CARD_OFFSET = 150
const SPACING = 50
const BOTTOM_OFFSET = -50

class Board {

  // TODO: implement the GameStats classes
  // NOTE: player is just a JSON object, it does not have the methods defined in the Player Class on the server side code
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
    this.boardElement.empty();
    // this.boardElement.children(".white").remove();
    this.drawBlackCard(this.roundInfo.blackCard);
    this.boardElement.prepend('<div class="submit-counter"></div>');
    $(".submit-counter").text("No cards submitted");
  }

  updateNumSubmitted(numSubmitted, numPlayers){
    if(numSubmitted == 0){
      $(".submit-counter").text("No cards submitted");
    } else {
      $(".submit-counter").text(numSubmitted + " of " + numPlayers + " submitted");
    }
  }

  drawSubmittingProletariatView(){
    this.boardElement.empty();
    this.boardElement.prepend('<div class="submit-counter"></div>');
    $(".submit-counter").text("No cards submitted");

    this.drawBlackCard(this.roundInfo.blackCard);
    this.drawHand(this.player.hand);
  }

  drawJudgingCzarView(){
    // Should probably only have to change some of the CSS attributes
    // the black card will be the same, can use
    $(".submit-counter").remove();
    this.drawHand(this.roundInfo.submittedCards);
  }

  drawJudgingProletariatView(){
    this.boardElement.empty();
    this.drawSubmittedCards(this.roundInfo.submittedCards);
  }

  drawSubmittedCards(cards){
    let handWidth = cards.length * CARD_WIDTH + (cards.length - 1) * SPACING;
    let handLeft = this.boardElement.width()/2 - handWidth/2 + this.boardElement.position().left;

    for(let i = 0; i < cards.length; i++){
      let card = $(document.createElement("div"));
      card.addClass("white card");

      let text = document.createElement("span");
      text.innerHTML = cards[i];
      card.append(text);

      card.css("left", handLeft + i * (SPACING + CARD_WIDTH));
      card.css("top", window.innerHeight/2 - CARD_HEIGHT/2);
      card.css("position", "absolute");
      this.boardElement.append(card);
    }
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

      card.css("zIndex", cards.length * 10 + i);
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
