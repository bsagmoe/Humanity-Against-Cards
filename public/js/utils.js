function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

makeKey = function(len) {
	var key = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
	for (var i=0; i<len; i++) {
	    key += possible.charAt(Math.floor(Math.random()*possible.length));
	}
	return key;
    };

// Does some string processing to check for two sets of __________ in a black card
function isSubmitTwo(blackCard){
  return blackCard.includes("__________") && blackCard.includes("__________", blackCard.indexOf("__________") + "__________".length);
}
