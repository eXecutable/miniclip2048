
import HighScoreScreen from "./HighScoreScreen";
import GameScreen from "../game/GameScreen.js";


export default class MainMenuScreen {
    
	constructor() {
		this.buttonsIdx = Object.freeze({
			start: 0,
			highscores: 1,
			length: 2,
		});
		this.renderer = window.GAME.renderManager.menuRenderer;

		this.currentButtonIdx = this.buttonsIdx.start;

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
		this.boundRenderFunction = this.render.bind(this);
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
						this.update();
					}
					break;
				case 2://Up
					if (this.currentButtonIdx < this.buttonsIdx.length - 1) {
						++this.currentButtonIdx;
						this.update();
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
		window.requestAnimationFrame(this.boundRenderFunction);
	}
	
	render(){
		this.renderer.render(this.currentButtonIdx);
	}

	/**
	 * TODO:
	 *
	 * @memberof MainMenuScreen
	 */
	startGame() {
		this.unlisten();
		new GameScreen(4).show(this);
	}

	/**
	 * TODO:
	 *
	 * @memberof MainMenuScreen
	 */
	showHighScores() {
		this.unlisten();
		new HighScoreScreen().show(this);
	}

	/**
	 * TODO:
	 *
	 * @memberof MainMenuScreen
	 */
	exit() {
		window.GAME.renderManager.releaseGL();
	}
}