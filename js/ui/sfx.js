"use strict"

class SFX {
	constructor() {
		this.enabled = true;
		this._sources = {};
		this._lastSound = "";
		this._lastSoundTime = 0;
		[
			'turn_me', 'turn_op', 'ui_card', 'ui_card_bank', 'open', 'draw',
			'clear', 'fog', 'frost', 'rain',
			'horn', 'spy', 'medic', 'morale', 'scorch', 'bond', 'decoy',
			'hero', 'common_close', 'common_ranged', 'common_siege', 'pass',
			'game_start', 'round1_start', 'round_win', 'round_lose', 'game_lose', 'game_win'
		].forEach(name => this._sources[name] = new Audio('assets/sfx/' + name + '.mp3'));
	}

	_play(key) {
		if (!this.enabled) return;
		const audio = this._sources[key];
		if (!audio) return;
		const now = Date.now();
		if (this._lastSound === key && now - this._lastSoundTime < 50) return;
		this._lastSound = key;
		this._lastSoundTime = now;
		setTimeout(() => { if (this._lastSound === key) this._lastSound = ""; }, 50);
		if (audio.currentTime > 0 && !audio.paused && !audio.ended) {
			audio.pause();
			audio.currentTime = 0;
		}
		audio.play().catch(() => {});
	}

	// Mirrors source's Row.playPlacementAudio logic using card.row
	cardPlay(card) {
		if (!card) return;
		if (card.abilities && card.abilities.includes('decoy'))
			return this._play('decoy');
		if (card.hero)
			return this._play('hero');
		const keyMap = { close: 'common_close', ranged: 'common_ranged', siege: 'common_siege', agile: 'common_close' };
		const key = keyMap[card.row];
		if (key) this._play(key);
	}

	cardHover() { this._play('ui_card'); }
	pass()      { this._play('pass'); }
	turn(tag)   { this._play(tag === 'me' ? 'turn_me' : 'turn_op'); }

	toggle() {
		this.enabled = !this.enabled;
		return this.enabled;
	}
}
