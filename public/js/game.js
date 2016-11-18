const CARD_WIDTH = 250
const CARD_HEIGHT = 350
const CARD_OFFSET = 150

function drawHand(cards){
  let cardContainer = [];

  let handWidth = 350 + (cards.length - 1) * CARD_OFFSET;
  let handLeft = window.innerWidth/2 - handWidth/2;
  let handTop = window.innerHeight - CARD_HEIGHT/8;

  for(let i = 0; i < cards.length; i++){
    card = $(document.createElement("div"));
    card.addClass("white card");

    text = document.createElement("span");
    text.innerHTML = cards[i];
    card.append(text);

    card.draggable({
      scroll: false
    });

    card.css("zIndex", i);
    card.css("left", handLeft + i * CARD_OFFSET);
    console.log(handWidth);
    console.log(handLeft + i * CARD_OFFSET);
    card.css("bottom", -50);
    card.css("position", "absolute");
    $("body").append(card);
  }

}

function drawBlackCard(blackCard){
  card = $(document.createElement("div"));
  card.addClass("black card");

  text = document.createElement("span");
  text.innerHTML = blackCard;
  card.append(text);

  card.css("position", "absolute");
  card.css("left", window.innerWidth/2 - CARD_WIDTH/2);
  card.css("top", 200);
  $("body").prepend(card);
}

$(document).ready(function(){
    var dummyCards = []
    for(let i = 0; i < 6; i++){
      // Should actually check if the same card is added twice in the real thing
      dummyCards.push(whiteCards[getRandomInt(0, whiteCards.length)]);
    }

    var card = blackCards[getRandomInt(0, blackCards.length)];

    drawHand(dummyCards);
    drawBlackCard(card);

    // TODO: better way to implement this would be to keep track of all the cards,
    //       after they have been dynamically created by the game (with the correct z-indicies for it to look right),
    //       subtract one from each one, then set the card that is being enterd as the highest z-index (like the number of cards)
    $(".white").mouseenter(function(event){
      $(".white").css("zIndex", "0");
      $(this).css("zIndex", "1");
    });

  }
);
