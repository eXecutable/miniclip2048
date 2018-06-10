import GameManager from "./game/GameManager.js";
import InputManager from "./InputManager";
import LocalStorageManager from "./LocalStorageManager.js";
import RenderManager from "./render/RenderManager";


window.addEventListener("load", function(){
	window.GAME = {
		renderManager: new RenderManager()
	};
	window.GAME.gameManager = new GameManager(4, new InputManager(), new LocalStorageManager(), window.GAME.renderManager);

}, false);
