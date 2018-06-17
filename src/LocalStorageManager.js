export default class LocalStorageManager{
	/**
	 * Creates an instance of LocalStorageManager.
	 * @memberof LocalStorageManager
	 */
	constructor(){
		this.bestScoreKey = "bestScore";
		this.gameStateKey = "gameState";
		this.scoreHistoryKey = "scoreHistory";
  
		this.storage =  window.localStorage;
	}
  
	/**
	 * Get the biggest score. Default is 0.
	 * @returns {Number} Value of the biggest score
	 * @memberof LocalStorageManager
	 */
	getBestScore() {
		return this.storage.getItem(this.bestScoreKey) || 0;
	}

	/**
	 * Gets the saved highscore list
	 * @returns {Array} An array of pairs date and score value
	 * @memberof LocalStorageManager
	 */
	getHighScoreList() {
		let scoresJSON = this.storage.getItem(this.scoreHistoryKey);
		return scoresJSON ? JSON.parse(scoresJSON) : null;
	}

	/**
	 * Retrieve the current saved game state.
	 * @returns {Object} The GameState object.
	 * @memberof LocalStorageManager
	 */
	getGameState() {
		let stateJSON = this.storage.getItem(this.gameStateKey);
		return stateJSON ? JSON.parse(stateJSON) : null;
	}

	/**
	 * Saves the object passed into local storage.
	 * Will update the best score if save score is bigger.
	 * @param {Object} gameState
	 * @memberof LocalStorageManager
	 */
	setGameState(gameState) {
		if (this.getBestScore() < gameState.score) {
			this.storage.setItem(this.bestScoreKey, gameState.score);
		}

		this.storage.setItem(this.gameStateKey, JSON.stringify(gameState));
	}

	/**
	 * Erase the current state from localStorage.
	 * Will try to add result to high score list.
	 * @memberof LocalStorageManager
	 */
	clearGameState() {
		const currentGameState = this.getGameState();
		if(currentGameState) {
			const now = new Date();
			const itemToInsert = {
				when: now,
				score: currentGameState.score
			};

			const stateHistoryJSON = this.storage.getItem(this.scoreHistoryKey);
			let highScoreList = stateHistoryJSON ? JSON.parse(stateHistoryJSON) : null;
			if (highScoreList) {
				if (highScoreList.length < 20 
				|| (highScoreList.length >= 20 && highScoreList[19].score < currentGameState.score)) {
					let insertPosition = 0;
					while (insertPosition < highScoreList.length && highScoreList[insertPosition].score > currentGameState.score) {
						insertPosition++;
					}
					highScoreList.splice(insertPosition, 0, itemToInsert);
					if(highScoreList.length >= 20 ) {
						highScoreList.pop();
					}
				}
			} else {
				highScoreList = [itemToInsert];
			}

			this.storage.setItem(this.scoreHistoryKey, JSON.stringify(highScoreList));
			this.storage.removeItem(this.gameStateKey);
		}
	}
}