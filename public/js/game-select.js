$(document).ready(function(){
  console.log("ready!");
  let handSizeInput = $("#hand-size-input");
  let numRoundsInput = $("#num-rounds-input");
  let submitTimeInput = $("#submit-limit-input");

  let handSize = $("#hand-size-input-display");
  let numRounds = $("#num-rounds-input-display");
  let submitLimit = $("#submit-time-limit-display");

  handSize.text(handSizeInput.val() + " cards");
  numRounds.text(numRoundsInput.val() + " rounds");
  submitLimit.text(submitTimeInput.val() + "s");

  handSizeInput.on('input change', function(event){
    handSize.text($(this).val() + " cards");
  });

  numRoundsInput.on('input change', function(event){
    numRounds.text($(this).val() + " rounds");
  });

  submitTimeInput.on('input change', function(event){
    submitLimit.text($(this).val() + "s");
  });

});
