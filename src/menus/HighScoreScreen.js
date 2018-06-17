
export default class HighScoreScreen {
	/**
	 * Creates an instance of HighScoreScreen.
	 * @memberof HighScoreScreen
	 */
	constructor() {
		this.storage = window.GAME.localStorage;

		this.renderer = window.GAME.renderManager.highscoresRenderer;

		this.boundKeydownfunction = this.eventKeyDownFunction.bind(this);
	}

	/**
	 * Callback from key down event
	 * @param {KeyboardEvent} event
	 * @memberof HighScoreScreen
	 */
	eventKeyDownFunction(event) {
		let modifiers = event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;

		if (!modifiers) {
			if (event.which === 8) {
				//backspace
				event.preventDefault();
				this.goBack();
			}
		}
	}

	/**
	 * Register on document event keydown
	 * @memberof HighScoreScreen
	 */
	listen() {
		document.addEventListener("keydown", this.boundKeydownfunction);
	}

	/**
	 * Stop listening to document event keydown
	 * @memberof HighScoreScreen
	 */
	unlisten() {
		document.removeEventListener("keydown", this.boundKeydownfunction);
	}

	/**
	 * Display this screen
	 * @memberof HighScoreScreen
	 */
	show(previousScreen) {
		this.previousScreen = previousScreen;
		//TODO: this.storage.get

		this.renderer.update();
		this.listen();
	}

	/**
	 * Stop answering keys and display the previous screen.
	 * @memberof GameScreen
	 */
	goBack() {
		this.unlisten();
		this.previousScreen.show();
	}
}