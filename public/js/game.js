
// https://s3.amazonaws.com/cah/CAH_Rules.pdf
// We can choose which ones to allow by only allowing the few we want on the
// game creation page
const GAME_MODES = {
  NORMAL: 1,
  HAPPY_ENDING: 2,
  REBOOTING_THE_UNIVERSE: 3,
  PACKING_HEAT: 4,
  RANDO: 5
}

class GameSettings {
  constructor(isNSFW, gameMode, handSize, numRounds, pointLimit, submitTimeLimit, autoSubmit) {
    this.isNSFW = isNSFW;
    this.gameMode = gameMode;               // THe game mode (see above)
    this.handSize = handSize;               // The number of cards that should go in each player's hand
    this.numRound = numRounds;              // The max number of rounds to play
    this.pointLimit = pointLimit;           // End the game if someone gets this many victoryPoints
    this.submitTimeLimit = submitTimeLimit; // The amount of time everybody has till their cards are submitted
    this.autoSubmit = autoSubmit;           // If the player hasn't chosen anything, a random card will be submitted for them
  }
}

class RoundInfo {
  constructor(roundNumber, blackCard, isSubmitTwo, cardCzar){
    this.roundNumber = roundNumber;
    this.blackCard = blackCard;
    this.isSubmitTwo = isSubmitTwo;
    this.cardCzar = cardCzar;
  }

  incrementRound(){
    this.roundNumber++;
  }

  // set blackCard (blackCard)     {this.blackCard = blackCard;}
  // set isSubmitTwo (isSubmitTwo) {this.isSubmitTwo = isSubmitTwo;}
  // set cardCzar (cardCzar)       {this.cardCzar = cardCzar;}
  //
  // get blackCard ()              {return this.blackCard};
  // get isSubmitTwo ()            {return this.isSubmitTwo};
  // get cardCzar ()               {return this.cardCzar};

}

class Player {
  constructor(name) {
    this.name = name;
    this.hand = [];
    this.cardsWon = [];
    this.victoryPoints = 0;
    this.isCardCzar = false;
    this.submitCard = null;
  }

  makeCardCzar(){
    console.log("making", this.name, "the card czar");
    this.isCardCzar = true;
  }

  makeProletariat(){
    console.log("making", this.name, "a prole");
    this.isCardCzar = false;
  }

  // called by the client code when the card is placed in the "submit" location on screen
  setSubmitCard(card){
    this.submitCard = card;
  }

  // called by the game logic code during turn changes
  submitCard(){
    removeWhiteCard(temp);
    var temp = submitCard;
    this.submitCard = null;
    return temp;
  }

  addWhiteCard(card){
    this.hand.push(card);
  }

  removeWhiteCard(card){
    var index = this.hand.indexOf(card);
    if(index > -1){
      this.hand.splice(index, 1);
      hand.length -= 1; // JS is stupid sometimes
    }
  }

  addBlackCard(card){
    this.cardsWon.push(card);
    this.victoryPoints++;
  }

  // should only be used in a few of the game modes
  // we don't actually remove a card from the array (otherwise, you couldn't see which cards you won!)
  // instead we change the percieved size of the cards won;
  removeBlackCard(){
    if(victoryPoints < 0){
      return false;
    } else {
      victoryPoints--;
      return true;
    }
  }
}

const GAME_STATUS = {
  INITIALIZING: 0,
  SUBMITTING: 1,
  JUDGING: 2,
  DEALING: 3,
  OUT_OF_CARDS: 4,
  FINISHED: 5
};

class HumanityAgainstCards {
  constructor(gameSettings, host) {
    this.host = host;    // Player object, starts as card czar
    this.gameId = makeKey(20);
    this.gameSettings = gameSettings; // GameSettings object
    console.log(this.gameSettings);

    this.players = [];
    this.cardCzar = null;
    this.roundInfo = new RoundInfo(0, null, null, null);

    // Setup the deck depending on the user options
    if(!this.gameSettings.isNSFW){
      this.deck = new Deck(WHITE_CARDS, BLACK_CARDS);
    } else {
      this.deck = new Deck(SFW_WHITE_CARDS, SFW_BLACK_CARDS);
    }

    this.status = GAME_STATUS.INITIALIZING;

  }

  addPlayer(player){
    this.players.push(player);
    console.log("adding player: ", player.name);
    console.log(player);
  }

  addPlayerToFront(player){
    this.players = [player].concat(this.players);
    console.log("adding player: ", player.name);
    console.log(player);
  }

  // TODO: change to compare based off of unique ids
  removePlayer(player){
    let index = this.players.indexOf(player);
    if(index < 0){
      return false;
    } else {
      this.players.splice(index, 0);
      return true;
    }
  }

  startGame(){
    if(this.status != GAME_STATUS.INITIALIZING){
      return false;
    } else {

      if(this.gameSettings.gameMode == GAME_MODES.RANDO){
        let rando = new Player("Rando Cardrissian");
        this.addPlayerToFront(rando);
      }

      // Deal the starting cards
      for(let i = 0; i < this.players.length; i++){
        let hand = this.deck.drawStartingHand(this.gameSettings.handSize);
        if(hand){
          this.players[i].hand = hand;
        } else {
          alert("Too few cards remaining!");
          return false;
        }
      }

      let cardCzarIndex = -1;
      // choose someone as the starting card czar
      if(this.gameSettings.gameMode == GAME_MODES.RANDO){
        // Rando is always the first player in the array;
        cardCzarIndex = getRandomInt(1, this.players.length);
      } else {
        cardCzarIndex = getRandomInt(0, this.players.length);
      }

      this.players[cardCzarIndex].makeCardCzar();
      this.cardCzar = this.players[cardCzarIndex];

      // get the starting black card
      this.roundInfo.blackCard = this.deck.drawBlackCard();
      this.roundInfo.isSubmitTwo = isSubmitTwo(this.roundInfo.blackCard);
      this.roundInfo.cardCzar = this.cardCzar;
      console.log(this.roundInfo);

      // TODO: the network code to send out messages telling people who's got what

    }
  }

  // dealCards(){
  //   for(let i = 0; i < this.players.length; i++){
  //     players.h
  //   }
  // }
}
