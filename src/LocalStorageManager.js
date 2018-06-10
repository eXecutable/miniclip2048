export default class LocalStorageManager{
	constructor(){
		this.bestScoreKey = "bestScore";
		this.gameStateKey = "gameState";
  
		this.storage =  window.localStorage;
	}
  
	// Best score getters/setters
	getBestScore() {
		return this.storage.getItem(this.bestScoreKey) || 0;
	}
  
	setBestScore(score) {
		this.storage.setItem(this.bestScoreKey, score);
	}
  
	// Game state getters/setters and clearing
	getGameState() {
		let stateJSON = this.storage.getItem(this.gameStateKey);
		return stateJSON ? JSON.parse(stateJSON) : null;
	}
  
	setGameState(gameState) {
		this.storage.setItem(this.gameStateKey, JSON.stringify(gameState));
	}
  
	clearGameState() {
		this.storage.removeItem(this.gameStateKey);
	}
}