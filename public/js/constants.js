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

const ROUND_STATUS = {
  SUBMITTING: 0,  // The proles submit their cards (and everybody sees how many are left to submit)
  JUDGING: 1,     // The judge picks which one they like the most
  END_OF_ROUND: 2 // The judge's pick is diplayed to everybody
}

const GAME_STATUS = {
  INITIALIZING: 0,
  PLAYING: 1,
  FINISHED: 2
};

const GAME_EVENTS = {
  CARDS_DEALT_EVENT: 0,
  SUBMITTED_CARD_CHANGED_EVENT: 1,
  CARDS_COLLECTED_EVENT: 2,
  CARDS_JUDGED_EVENT: 3,
  ROUND_CHANGE_EVENT: 4,
  GAME_OVER_EVENT: 5,
}
