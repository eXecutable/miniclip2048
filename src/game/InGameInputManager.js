export default class InGameInputManager{
	/**
	 * Creates an instance of InGameInputManager, also registers on event listeners.
	 * @memberof InGameInputManager
	 */
	constructor() {
		this.events = {};

		this.eventKeyDown		= "keydown";

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

		this.boundKeydownfunction = this.eventKeyDownFunction.bind(this);
	}

	/**
	 * Register a callback on an event
	 * @param {String} event name of the event
	 * @param {Function} callback function to be called once the named event is fired
	 * @memberof InGameInputManager
	 */
	on(event, callback) {
		if (!this.events[event]) {
			this.events[event] = [];
		}
		this.events[event].push(callback);
	}

	/**
	 * Call all callbacks registered on an event (by order of registration).
	 * @param {String} event name of the event
	 * @param {*} data payload of the event
	 * @memberof InGameInputManager
	 */
	emit(event, data) {
		let callbacks = this.events[event];
		if (callbacks) {
			callbacks.forEach(function (callback) {
				callback(data);
			});
		}
	}
  
	/**
	 * Callback registered on key down event.
	 * @param {KeyboardEvent} event
	 * @memberof InGameInputManager
	 */
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
	/**
	 * Register on document event keydown
	 * @memberof InGameInputManager
	 */
	listen() {
		document.addEventListener(this.eventKeyDown, this.boundKeydownfunction);
	}
	/**
	 * Stop listening to document event keydown
	 * @memberof InGameInputManager
	 */
	unlisten() {
		document.removeEventListener(this.eventKeyDown, this.boundKeydownfunction);
	}
}