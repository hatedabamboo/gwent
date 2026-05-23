"use strict"

var ui = new UI();
var board = new Board();
var weather = new Weather();
var game = new Game();
var player_me, player_op;

ui.enablePlayer(false);
var dm = new DeckMaker();

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
