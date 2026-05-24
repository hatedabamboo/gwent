"use strict"

// Handles notifications and client interration with menus
class UI {
	constructor() {
		this.carousels = [];
		this.notif_elem = document.getElementById("notification-bar");
		this.preview = document.getElementsByClassName("card-preview")[0];
		this.previewCard = null;
		this.lastRow = null;
		document.getElementById("pass-button").addEventListener("click", () => { player_me.passRound(); sfx.pass(); }, false);
		document.getElementById("click-background").addEventListener("click", () => ui.cancel(), false);
		this.youtube = null;
		this.ytActive = false;
		this.musicEnabled = true;
		this.toggleMusic_elem = document.getElementById("toggle-music");
		this.toggleMusic_elem.addEventListener("click", () => this.toggleMusic(), false);

		this.notificationsEnabled = true;
		this.toggleNotif_elem = document.getElementById("toggle-notifications");
		this.toggleNotif_elem.addEventListener("click", () => this.toggleNotifications(), false);

		this.toggleSFX_elem = document.getElementById("toggle-sfx");
		this.toggleSFX_elem.addEventListener("click", () => this.toggleSFX(), false);

		// Card hover SFX via event delegation
		document.querySelector("main").addEventListener("mouseover", e => {
			if (e.target.closest(".card"))
				sfx.cardHover();
		}, false);
	}

	// Enables or disables client interration
	enablePlayer(enable){
		let main = document.getElementsByTagName("main")[0].classList;
		if (enable) main.remove("noclick"); else main.add("noclick");
	}

	// Initializes the youtube background music object
	initYouTube(){
		this.youtube = new YT.Player('youtube', {
			videoId: "UE9fPWy1_o4",
			playerVars:  { "autoplay" : 1, "controls" : 0, "loop" : 1, "playlist" : "UE9fPWy1_o4", "rel" : 0, "version" : 3, "modestbranding" : 1 },
			events: { 'onStateChange': initButton }
		});

		function initButton(){
			if (ui.ytActive)
				return;
			ui.ytActive = true;
			if (ui.musicEnabled)
				ui.youtube.playVideo();
			let timer = setInterval( () => {
				if (ui.musicEnabled && ui.youtube.getPlayerState() !== YT.PlayerState.PLAYING)
					ui.youtube.playVideo();
				else
					clearInterval(timer);
			}, 500);
		}
	}

	// Called when client toggles notifications
	toggleNotifications(){
		this.notificationsEnabled = !this.notificationsEnabled;
		this.toggleNotif_elem.classList.toggle("fade", !this.notificationsEnabled);
	}

	// Called when client toggles sound effects
	toggleSFX(){
		const enabled = sfx.toggle();
		this.toggleSFX_elem.classList.toggle("fade", !enabled);
	}

	// Called when client toggles the music
	toggleMusic(){
		this.musicEnabled = !this.musicEnabled;
		this.toggleMusic_elem.classList.toggle("fade", !this.musicEnabled);
		if (!this.youtube)
			return;
		if (this.musicEnabled)
			this.youtube.playVideo();
		else
			this.youtube.pauseVideo();
	}

	// Enables or disables background music
	setYouTubeEnabled(enable){
		this.musicEnabled = enable;
		this.toggleMusic_elem.classList.toggle("fade", !enable);
		if (!this.youtube)
			return;
		if (enable)
			this.youtube.playVideo();
		else
			this.youtube.pauseVideo();
	}

	// Called when the player selects a selectable card
	async selectCard(card) {
		let row = this.lastRow;
		let pCard = this.previewCard;
		if (card === pCard)
			return;
		if (pCard === null || card.holder.hand.cards.includes(card)) {
			this.setSelectable(null, false);
			this.showPreview(card);
		} else if (pCard.name === "Decoy") {
			this.hidePreview(card);
			this.enablePlayer(false);
			board.toHand(card, row);
			await board.moveTo(pCard, row, pCard.holder.hand);
			pCard.holder.endTurn();
		}
	}

	// Called when the player selects a selectable CardContainer
	async selectRow(row){
		this.lastRow = row;
		if (this.previewCard === null) {
			await ui.viewCardsInContainer(row);
			return;
		}
		if (this.previewCard.name === "Decoy")
			return;
		let card = this.previewCard;
		let holder = card.holder;
		this.hidePreview();
		this.enablePlayer(false);
		if (card.name === "Scorch"){
			this.hidePreview();
			await ability_dict["scorch"].activated(card);
		} else if (card.name === "Decoy") {
			return;
		} else {
			await board.moveTo(card, row, card.holder.hand);
		}
		holder.endTurn();
	}

	// Called when the client cancels out of a card-preview
	cancel(){
		this.hidePreview();
	}

	// Displays a card preview then enables and highlights potential card destinations
	showPreview(card) {
		this.showPreviewVisuals(card);
		this.setSelectable(card, true);
		document.getElementById("click-background").classList.remove("noclick");
	}

	// Sets up the graphics and description for a card preview
	showPreviewVisuals(card){
		this.previewCard = card;
		this.preview.classList.remove("hide");
		this.preview.getElementsByClassName("card-lg")[0].style.backgroundImage = largeURL(card.faction+"_"+card.filename);
		let desc_elem = this.preview.getElementsByClassName("card-description")[0];
		this.setDescription(card, desc_elem);
	}

	// Hides the card preview then disables and removes highlighting from card destinations
	hidePreview(){
		document.getElementById("click-background").classList.add("noclick");
		player_me.hand.cards.forEach( c => c.elem.classList.remove("noclick") );

		this.preview.classList.add("hide");
		this.setSelectable(null, false);
		this.previewCard = null;
		this.lastRow = null;
	}

	// Sets up description window for a card
	setDescription(card, desc){
		if (card.hero || card.row === "agile" || card.abilities.length > 0 || card.faction === "faction") {
			desc.classList.remove("hide");
			let str = card.row === "agile" ? "agile" : "";
			if (card.abilities.length)
				str = card.abilities[card.abilities.length-1];
			if (str === "cerys")
				str = "muster";
			if (str.startsWith("avenger"))
				str = "avenger";
			if (str === "scorch_c" || str === "scorch_r" || str === "scorch_s")
				str = "scorch";
			if (!str && card.hero)
				str = "hero";
			if (card.row === "leader" || card.faction === "faction" || card.abilities.length === 0 && card.row !== "agile")
				desc.children[0].style.backgroundImage = "";
			else
				desc.children[0].style.backgroundImage = iconURL("card_ability_" + str);
			desc.children[1].innerHTML = getLocalizedAbility(str, "name") || card.desc_name;
			desc.children[2].innerHTML = getLocalizedAbilityDesc(card);
		} else {
			desc.classList.add("hide");
		}
	}

	// Displayed a timed notification to the client
	async notification(name, duration){
		if      (name === 'me-turn')    sfx.turn('me');
		else if (name === 'op-turn')    sfx.turn('op');
		else if (name === 'op-leader')  sfx.turn('op');
		else if (name === 'nilfgaard-wins-draws') sfx.turn('op');
		else if (name === 'round-start') sfx._play('round1_start');
		else if (name === 'win-round')   sfx._play('round_win');
		else if (name === 'lose-round')  sfx._play('round_lose');
		else if (name === 'me-pass' || name === 'op-pass') sfx._play('pass');

		if (!this.notificationsEnabled) return;

		const fadeSpeed = 150;
		var notifDiv = this.notif_elem.children[0];
		notifDiv.id = "notif-" + name;
		const text = notificationText[name] || name;
		notifDiv.setAttribute("data-notif-text", text);

		// Dynamic duration based on text length (feature 18)
		const chars = text.length;
		const words = text.split(" ").length;
		duration = Math.round(0.7454878 * Math.max(Math.round((1000/17) * chars), Math.round((60000/300) * words)) + 211.653152) + 1;
		duration = Math.max(400, duration);

		// Notification cache bonus for online play (feature 19)
		const bonus = playingOnline && duration < 1000 && !cache_notif.includes(name) ? 800 : 0;
		cache_notif.push(name);
		duration += bonus;

		fadeIn(this.notif_elem, fadeSpeed);
		fadeOut(this.notif_elem, fadeSpeed, duration - fadeSpeed);
		await sleep(duration);
	}

	// Displays a cancellable Carousel for a single card
	async viewCard(card, action) {
		if (card === null)
			return;
		let container = new CardContainer();
		container.cards.push(card);
		await this.viewCardsInContainer(container, action);
	}

	// Displays a cancellable Carousel for all cards in a container
	async viewCardsInContainer(container, action) {
		action = action ? action : function() {return this.cancel();};
		await this.queueCarousel(container, 1, action, () => true, false, true);
	}

	// Displays a Carousel menu of filtered container items that match the predicate.
	// Suspends gameplay until the Carousel is closed. Automatically picks random card if activated for AI player
	async queueCarousel(container, count, action, predicate, bSort, bQuit, title){
		if (game.currPlayer === player_op) {
			if (player_op.controller instanceof ControllerAI)
				for (let i=0; i<count; ++i){
					let cards = container.cards.reduce((a,c,i) => !predicate || predicate(c) ? a.concat([i]) : a, []);
					await action(container, cards[randomInt(cards.length)]);
				}
			return;
		}
		let carousel = new Carousel(container, count, action, predicate, bSort, bQuit, title);
		if (Carousel.curr === undefined || Carousel.curr === null)
			carousel.start();
		else {
			this.carousels.push(carousel);
			return;
		}
		await sleepUntil( () => this.carousels.length === 0 && !Carousel.curr, 100);
	}

	// Starts the next queued Carousel
	quitCarousel(){
		if (this.carousels.length > 0) {
			this.carousels.shift().start();
		}
	}

	// Displays a custom confirmation menu
	async popup(yesName, yes, noName, no, title, description) {
		let p = new Popup(yesName, yes, noName, no, title, description);
		await sleepUntil( () => !Popup.curr)
	}

	// Enables or disables selection and highlighting of rows specific to the card
	setSelectable(card, enable){
		if(!enable) {
			for (let row of board.row){
				row.elem.classList.remove("row-selectable");
				row.elem.classList.remove("noclick");
				row.elem_special.classList.remove("row-selectable");
				row.elem_special.classList.remove("noclick");
				row.elem.classList.add("card-selectable");

				for (let card of row.cards) {
					card.elem.classList.add("noclick");
				}
			}
			weather.elem.classList.remove("row-selectable");
			weather.elem.classList.remove("noclick");
			return;
		}
		if (card.faction === "weather") {
			for (let row of board.row){
				row.elem.classList.add("noclick");
				row.elem_special.classList.add("noclick");
			}
			weather.elem.classList.add("row-selectable");
			return;
		}

		weather.elem.classList.add("noclick");

		if (card.name === "Scorch") {
			for (let r of board.row){
				r.elem.classList.add("row-selectable");
				r.elem_special.classList.add("row-selectable");
			}
			return;
		}
		if (card.isSpecial()){
			for (let i=0; i<6; i++){
				let r = board.row[i];
				if (i < 3 || r.special !== null){
					r.elem.classList.add("noclick");
					r.elem_special.classList.add("noclick");
				} else {
					r.elem_special.classList.add("row-selectable");
				}
			}
			return;
		}

		board.row.forEach( r => r.elem_special.classList.add("noclick") );

		if (card.name === "Decoy"){
			for (let i=0; i<6; ++i) {
				let r = board.row[i];
				let units = r.cards.filter(c => c.isUnit());
				if (i < 3 || units.length === 0) {
					r.elem.classList.add("noclick");
					r.elem_special.classList.add("noclick");
					r.elem.classList.remove("card-selectable");
				} else {
					r.elem.classList.add("row-selectable");
					units.forEach( c => c.elem.classList.remove("noclick") );
				}
			}
			return;
		}

		let currRows = card.row === "agile" ? [board.getRow(card, "close", card.holder), board.getRow(card, "ranged", card.holder)] : [board.getRow(card, card.row, card.holder)];
		for (let i=0; i<6; i++){
			let row = board.row[i];
			if (currRows.includes(row)) {
				row.elem.classList.add("row-selectable");
			} else {
				row.elem.classList.add("noclick");
			}
		}

	}
}
