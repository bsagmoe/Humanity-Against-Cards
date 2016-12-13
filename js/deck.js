function getRandomInt(min, max){
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function isSubmitTwo (blackCard){
  return blackCard.includes("__________") && blackCard.includes("__________", blackCard.indexOf("__________") + "__________".length);
}


class Deck {
	// By passing in a deck here, we can modify the local copy and also allow for
	// subsets of WHITE_CARDS and BLACK_CARDS below to be passed in (e.g. NSFW vs SFW)
	constructor(whiteCards, blackCards) {
		this.whiteCards = whiteCards.slice();	// slice() with no params is the same as copy()
		this.blackCards = blackCards.slice();
	}

	drawStartingHand(handSize){
		let hand = [];
		if(handSize > this.whiteCards.length){
			return false;
		} else {
			for(let i = 0; i < handSize; i++){
				hand.push(this.drawWhiteCard());
			}

			return hand;
		}
	}

	drawWhiteCard(){
		if(this.whiteCards.length < 1){
			return false;
		} else {
			let index = getRandomInt(0, this.whiteCards.length);
			let card = this.whiteCards[index];
			this.whiteCards.splice(index, 1); // remove the card from the deck
			return card;
		}
	}

	drawBlackCard(){
		if(this.blackCards.length < 1){
			return false;
		} else {
			let index = getRandomInt(0, this.blackCards.length);
			let card = this.blackCards[index];
			this.blackCards.splice(index, 1); // remove the card from the deck
			return card;
		}
	}
}

module.exports.Deck = Deck;
