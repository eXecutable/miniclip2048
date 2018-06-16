
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

		this.map = Object.freeze({
			38: 0, // Up
			40: 2, // Down
			75: 0, // Vim up
			74: 2, // Vim down
			87: 0, // W
			83: 2, // S
			13: 4  //Enter
		});

		this.boundKeydownfunction = this.eventKeyDownFunction.bind(this);
	}

	eventKeyDownFunction(event) {
		let modifiers = event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;
		let mapped    = this.map[event.which];

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
					if (this.currentButtonIdx < this.buttonsIdx.length - 1) {
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
	}

	listen() {
		document.addEventListener("keydown", this.boundKeydownfunction);
	}

	unlisten() {
		document.removeEventListener("keydown", this.boundKeydownfunction);
	}

	
	show() {
		this.update();
		this.listen();
	}

	update() {
		this.renderer.render(this.buttonsIdx.start);
		
		//window.requestAnimationFrame(this.update.bind(this));
	}
	
	/**
	 *
	 *
	 * @memberof MainMenuManager
	 */
	startGame() {
		this.unlisten();
		new GameManager(4).show(this);
	}

	/**
	 *
	 *
	 * @memberof MainMenuManager
	 */
	showHighScores() {
		this.unlisten();
		new HighScoreManager().show(this);
	}

	/**
	 *
	 *
	 * @memberof MainMenuManager
	 */
	exit() {
		window.GAME.renderManager.releaseGL();
	}
}