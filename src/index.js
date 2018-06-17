import LocalStorageManager from "./LocalStorageManager.js";
import RenderManager from "./render/RenderManager";
import MainMenuScreen from "./menus/MainMenuScreen.js";

window.addEventListener("load", function(){
	
	//Global objects of our game
	window.GAME = {
		renderManager: new RenderManager(),
		localStorage: new LocalStorageManager(),
	};

	//game entry point
	window.GAME.MainMenuScreen = new MainMenuScreen();

	function isLoadingComplete() {
		if(!window.GAME.renderManager.isLoaded()) {
			setTimeout(isLoadingComplete, 100);
		} else {
			document.getElementById("loading").remove();
			window.GAME.MainMenuScreen.show();
		}
	}
	setTimeout(isLoadingComplete, 100);

}, false);
