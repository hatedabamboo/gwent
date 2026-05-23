"use strict"

var notificationText = {
	"me-coin": "You will go first",
	"op-coin": "Your opponent will go first",
	"me-first": "You will go first",
	"op-first": "Your opponent will go first",
	"round-start": "Round Start",
	"me-pass": "Round passed",
	"op-pass": "Your opponent has passed",
	"win-round": "You won the round!",
	"lose-round": "Your opponent won the round",
	"draw-round": "The round ended in a draw",
	"me-turn": "Your turn!",
	"op-turn": "Opponent's turn",
	"north": "Northern Realms faction ability triggered - North draws an additional card.",
	"monsters": "Monsters faction ability triggered - one randomly-chosen Monster Unit Card stays on the board",
	"scoiatael": "Opponent used the Scoia'tael faction perk to go first.",
	"skellige-op": "Opponent Skellige Ability Triggered!",
	"skellige-me": "Skellige Ability Triggered!",
};

//      Get Image paths
function iconURL(name, ext = "png"){
	return imgURL("icons/" + name, ext);
}
function largeURL(name, ext="jpg"){
	return imgURL("lg/" + name, ext)
}
function smallURL(name, ext="jpg"){
	return imgURL("sm/" + name, ext);
}
function imgURL(path, ext) {
	return "url('assets/img/" + path + "." + ext + "')";
}

// Returns true if n is an Number
function isNumber(n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
}

// Returns true if s is a String
function isString(s){
	return typeof(s) === 'string' || s instanceof String;
}

// Returns a random integer in the range [0,n)
function randomInt(n)  {
	return Math.floor(Math.random() * n);
}

// Pauses execution until the passed number of milliseconds as expired
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
  //return new Promise(resolve => setTimeout(() => {if (func) func(); return resolve();}, ms));
}

// Suspends execution until the predicate condition is met, checking every ms milliseconds
function sleepUntil(predicate, ms) {
	return new Promise(resolve => {
		let timer = setInterval( function () {
			if (predicate()) {
				clearInterval(timer);
				resolve();
			}
		}, ms)
	});
}

function getLocalizedAbility(key, field) {
	var ab = ability_dict[key];
	return ab && ab[field] ? ab[field] : "";
}

function getLocalizedAbilityDesc(card) {
	return card.desc;
}
