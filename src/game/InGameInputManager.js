export default class InGameInputManager{

	constructor() {
		this.events = {};

		this.eventKeyDown		= "keydown";
		this.eventTouchstart    = "touchstart";
		this.eventTouchmove     = "touchmove";
		this.eventTouchend      = "touchend";

		this.map = Object.freeze({
			38: 0, // Up
			39: 1, // Right
			40: 2, // Down
			37: 3, // Left
			75: 0, // Vim up
			76: 1, // Vim right
			74: 2, // Vim down
			72: 3, // Vim left
			87: 0, // W
			68: 1, // D
			83: 2, // S
			65: 3, // A
			8:  4, //Backspace, go back
			82: 5, //R, restart
		});

		this.listen();

		this.boundKeydownfunction = this.eventKeyDownFunction.bind(this);
	}
  
	on(event, callback) {
		if (!this.events[event]) {
			this.events[event] = [];
		}
		this.events[event].push(callback);
	}
  
	emit(event, data) {
		let callbacks = this.events[event];
		if (callbacks) {
			callbacks.forEach(function (callback) {
				callback(data);
			});
		}
	}
  
	// Respond to direction keys
	eventKeyDownFunction(event) {
		let modifiers = event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;
		let mapped    = this.map[event.which];

		if (!modifiers) {
			if (mapped !== undefined) {
				event.preventDefault();
				if( mapped <= 3 ){
					this.emit("move", mapped);
				} else if (event.which === 82) {// R key restarts the game
					this.emit("restart");
				} else if (event.which === 8) {// Backspace key restarts the game
					this.emit("goBack");
				}
			}
		}
	}

	listen() {
		document.addEventListener(this.eventKeyDown, this.eventKeyDownFunction.bind(this));
	}

	unlisten() {
		document.removeEventListener(this.eventKeyDown, this.eventKeyDownFunction.bind(this));
	}
}