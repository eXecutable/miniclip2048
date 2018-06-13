import LocalStorageManager from "./LocalStorageManager.js";
import RenderManager from "./render/RenderManager";
import MainMenuManager from "./menus/MainMenuManager.js";

window.addEventListener("load", function(){
	
	//Global objects of our game
	window.GAME = {
		renderManager: new RenderManager(),
		localStorage: new LocalStorageManager(),
	};

	//game entry point
	window.GAME.mainMenuManager = new MainMenuManager();

	function isLoadingComplete() {
		if(!window.GAME.renderManager.isLoaded()) {
			setTimeout(isLoadingComplete, 100);
		} else {
			document.getElementById("loading").remove();
			window.GAME.mainMenuManager.show();
		}
	}
	setTimeout(isLoadingComplete, 100);

}, false);
