
import HighScoreManager from "./HighScoreManager.js";
import GameManager from "../game/GameManager.js";


export default class MainMenuManager {
    
	constructor() {
		this.buttonsIdx = Object.freeze({
			start: 0,
			highscores: 1,
			length: 2,
		});
		this.renderer = window.GAME.renderManager.menuRenderer;

		this.currentButtonIdx = 0;
	}

	listen() {
		const map = Object.freeze({
			38: 0, // Up
			39: 1, // Right
			40: 2, // Down
			37: 3, // Left
			75: 0, // Vim up
			76: 1, // Vim right
			74: 2, // Vim down
			72: 3, // Vim left
			87: 0, // W
			68: 1, // D
			83: 2, // S
			65: 3, // A
			13: 4  //Enter
		});

		// Respond to direction keys
		this.eventKeyDownFunction = function (event) {
			let modifiers = event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;
			let mapped    = map[event.which];

			if (!modifiers) {
				if (mapped !== undefined) {
					event.preventDefault();
					
					switch (mapped) {
					case 0://Down
						if (this.currentButtonIdx > 0) {
							--this.currentButtonIdx;
							this.renderer.render(this.currentButtonIdx);
						}
						break;
					case 2://Up
						if (this.currentButtonIdx < this.buttonsIdx.length) {
							++this.currentButtonIdx;
							this.renderer.render(this.currentButtonIdx);
						}
						break;
					
					case 4://Enter
						if (this.currentButtonIdx === this.buttonsIdx.start) {
							this.startGame();
						}
						break;
					default:
						break;
					}
				}
			}
		};
		document.addEventListener("keydown", this.eventKeyDownFunction.bind(this));
	}

	unlisten() {
		document.removeEventListener("keydown", this.eventKeyDownFunction);
	}

	
	show() {
		this.update();
		this.listen();
	}

	update() {
		this.renderer.render(this.buttonsIdx.start);
		
		//window.requestAnimationFrame(this.update.bind(this));
	}

	startGame() {
		this.unlisten();
		new GameManager(4).show(this);
	}

	showHighScores() {
		this.unlisten();
		new HighScoreManager().show(this);
	}

	exit() {
		window.GAME.renderManager.releaseGL();
	}
}