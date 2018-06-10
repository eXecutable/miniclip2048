export default class InGameInputManager{
//TODO: move to game folder
	constructor() {
		this.events = {};

		this.eventKeyDown		= "keydown";
		this.eventTouchstart    = "touchstart";
		this.eventTouchmove     = "touchmove";
		this.eventTouchend      = "touchend";

		this.listen();
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
  
	listen() {
		let self = this;
  
		const map = Object.freeze({
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
			65: 3  // A
		});
  
		// Respond to direction keys
		this.eventKeyDownFunction = function (event) {
			let modifiers = event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;
			let mapped    = map[event.which];

			if (!modifiers) {
				if (mapped !== undefined) {
					event.preventDefault();
					self.emit("move", mapped);
				}
			}

			// R key restarts the game
			if (!modifiers && event.which === 82) {
				self.restart.call(self, event);
			}
		};
		document.addEventListener(this.eventKeyDown, this.eventKeyDownFunction);
  
		// Respond to button presses
		// this.bindButtonPress(".retry-button", this.restart);
		// this.bindButtonPress(".restart-button", this.restart);
		// this.bindButtonPress(".keep-playing-button", this.keepPlaying);
  
		// Respond to swipe events
		let touchStartClientX, touchStartClientY;
		let gameContainer = document.getElementById("canvas");
  
		this.eventTouchstartFunction = function (event) {
			if ((!window.navigator.msPointerEnabled && event.touches.length > 1) || event.targetTouches.length > 1) {
				return; // Ignore if touching with more than 1 finger
			}

			if (window.navigator.msPointerEnabled) {
				touchStartClientX = event.pageX;
				touchStartClientY = event.pageY;
			} else {
				touchStartClientX = event.touches[0].clientX;
				touchStartClientY = event.touches[0].clientY;
			}

			event.preventDefault();
		};
		gameContainer.addEventListener(this.eventTouchstart, this.eventTouchstartFunction);

		this.eventTouchmoveFunction = function (event) {
			event.preventDefault();
		};
		gameContainer.addEventListener(this.eventTouchmove, this.eventTouchmoveFunction);


		this.eventTouchendFunction = function (event) {
			if ((!window.navigator.msPointerEnabled && event.touches.length > 0) || event.targetTouches.length > 0) {
				return; // Ignore if still touching with one or more fingers
			}

			let touchEndClientX, touchEndClientY;

			if (window.navigator.msPointerEnabled) {
				touchEndClientX = event.pageX;
				touchEndClientY = event.pageY;
			} else {
				touchEndClientX = event.changedTouches[0].clientX;
				touchEndClientY = event.changedTouches[0].clientY;
			}

			let dx = touchEndClientX - touchStartClientX;
			let absDx = Math.abs(dx);

			let dy = touchEndClientY - touchStartClientY;
			let absDy = Math.abs(dy);

			if (Math.max(absDx, absDy) > 10) {
				// (right : left) : (down : up)
				self.emit("move", absDx > absDy ? (dx > 0 ? 1 : 3) : (dy > 0 ? 2 : 0));
			}
		};
		gameContainer.addEventListener(this.eventTouchend, this.eventTouchendFunction);
	}

	unlisten() {
		document.removeEventListener(this.eventKeyDown, this.eventKeyDownFunction);
		document.removeEventListener(this.eventTouchstart, this.eventTouchstartFunction);
		document.removeEventListener(this.eventTouchmove, this.eventTouchmoveFunction);
		document.removeEventListener(this.eventTouchend, this.eventTouchendFunction);
	}

	restart(event) {
		event.preventDefault();
		this.emit("restart");
	}
  
	keepPlaying(event) {
		event.preventDefault();
		this.emit("keepPlaying");
	}
  
	// bindButtonPress(selector, fn) {
	// 	let button = document.querySelector(selector);
	// 	button.addEventListener("click", fn.bind(this));
	// 	button.addEventListener(this.eventTouchend, fn.bind(this));
	// }
}