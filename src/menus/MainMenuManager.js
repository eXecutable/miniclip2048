
import HighScoreManager from "./HighScoreManager.js";
import GameManager from "../game/GameManager.js";


export default class MainMenuManager {
    
	constructor() {
		this.buttonsIdx = Object.freeze({
			start: 1,
			highscores: 2
		});
		this.renderer = window.GAME.renderManager.menuRenderer;
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
					case 4://Enter
						this.startGame();
						break;
					//TODO: select buttons
					//this.renderer.render(this.buttonsIdx.start);
					//this.renderer.render(this.buttonsIdx.highscores);
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