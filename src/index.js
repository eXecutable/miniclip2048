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

	document.getElementById("loading").remove();

	window.GAME.mainMenuManager.show();
	
}, false);
