
import HighScoreScreen from "./HighScoreScreen";
import GameScreen from "../game/GameScreen.js";


export default class MainMenuScreen {
	/**
	 * Creates an instance of MainMenuScreen.
	 * @memberof MainMenuScreen
	 */
	constructor() {
		this.buttonsIdx = Object.freeze({
			start: 0,
			highscores: 1,
			exit: 2,
			length: 3,
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
	}

	/**
	 * Callback from key down event
	 * @param {KeyboardEvent} event
	 * @memberof MainMenuScreen
	 */
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
						this.renderer.update(this.currentButtonIdx);
					}
					break;
				case 2://Up
					if (this.currentButtonIdx < this.buttonsIdx.length - 1) {
						++this.currentButtonIdx;
						this.renderer.update(this.currentButtonIdx);
					}
					break;
				
				case 4://Enter
					if (this.currentButtonIdx === this.buttonsIdx.start) {
						this.startGame();
					} else if (this.currentButtonIdx === this.buttonsIdx.highscores) {
						this.showHighScores();
					} else if (this.currentButtonIdx === this.buttonsIdx.exit) {
						this.exit();
					}
					break;
				default:
					break;
				}
			}
		}
	}

	/**
	 * Register on document event keydown
	 * @memberof MainMenuScreen
	 */
	listen() {
		document.addEventListener("keydown", this.boundKeydownfunction);
	}

	/**
	 * Stop listening to document event keydown
	 * @memberof MainMenuScreen
	 */
	unlisten() {
		document.removeEventListener("keydown", this.boundKeydownfunction);
	}

	/**
	 * Display this screen
	 * @memberof MainMenuScreen
	 */
	show() {
		this.renderer.update(this.currentButtonIdx);
		this.listen();
	}

	/**
	 * Launch the main game screen
	 * @memberof MainMenuScreen
	 */
	startGame() {
		this.unlisten();
		new GameScreen(4).show(this);
	}

	/**
	 * Display the highscore screen
	 * @memberof MainMenuScreen
	 */
	showHighScores() {
		this.unlisten();
		new HighScoreScreen().show(this);
	}

	/**
	 * Shut everything down
	 * @memberof MainMenuScreen
	 */
	exit() {
		this.unlisten();
		window.GAME.renderManager.releaseGL();
	}
}