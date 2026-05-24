"use strict"

var sfx = new SFX();
var ui = new UI();
var board = new Board();
var weather = new Weather();
var game = new Game();
var player_me, player_op;

var playingOnline = window.location.href.includes("github.io");
var nilfgaard_wins_draws = false;
var cache_notif = [];
var statistics = [[0,0],[0,0],[0,0]];
var series = [];

ui.enablePlayer(false);
var dm = new DeckMaker();

document.addEventListener("contextmenu", e => e.preventDefault());

document.onkeydown = function(e) {
	if (e.keyCode === 123) return false;

	if (document.getElementById("carousel").className !== "hide" && Carousel.curr) {
		switch (e.keyCode) {
			case 13: Carousel.curr.select(e); break;
			case 37: Carousel.curr.shift(e, -1); break;
			case 39: Carousel.curr.shift(e, 1); break;
		}
		return;
	}

	if (Popup.curr) {
		switch (e.keyCode) {
			case 69: Popup.curr.selectYes(); break;
			case 81: Popup.curr.selectNo(); break;
		}
		return;
	}

	let passBtn = document.getElementById("pass-button");
	if (passBtn && !passBtn.classList.contains("noclick")) {
		if (e.keyCode === 32) {
			e.preventDefault();
			player_me.passRound();
			sfx.pass();
		} else if (e.keyCode === 88 && player_me && player_me.leaderAvailable) {
			ui.viewCard(player_me.leader, async () => await player_me.activateLeader());
		}
	}
};

function onYouTubeIframeAPIReady() {
	ui.initYouTube();
}

// Scale the board to fit viewport height on screens wider than 16:9,
// keeping all internal vw-based coordinates correct.
(function() {
	var main = document.querySelector("main");
	function applyUWScale() {
		var w = window.innerWidth, h = window.innerHeight;
		if (w * 9 > h * 16) {
			var scale = 16 * h / (9 * w);
			main.style.transform = "scale(" + scale + ")";
			main.style.transformOrigin = "0 0";
			main.style.left = (w * (1 - scale) / 2) + "px";
			main.style.top = "0";
			main.style.overflow = "hidden";
		} else {
			main.style.transform = "";
			main.style.transformOrigin = "";
			main.style.left = "";
			main.style.top = "";
			main.style.overflow = "";
		}
	}
	window.addEventListener("resize", applyUWScale);
	applyUWScale();
}());
