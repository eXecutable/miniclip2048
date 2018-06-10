
export default class HighScoreManager {
    
	constructor() {
		if(!window.GAME.localStorage)
			throw "No localStorage found";

		this.storage = window.GAME.localStorage;
	}

	show(previousScreen) {
		this.previousScreen = previousScreen;
		//TODO: this.storage.get
	}

	goBack(){
		//TODO: previousScreen.show();
	}
}