import Grid from "./Grid.js";
import Tile from "./Tile.js";
import InGameInputManager from "./InGameInputManager";

export default class GameScreen {
    
	constructor(size) {
		this.size           = size; // Size of the grid
		this.inputManager   = new InGameInputManager();
		this.storageManager = window.GAME.localStorage;
		this.renderer  		= window.GAME.renderManager.gameRenderer;
  
		this.startTiles     = 2;
  
		this.inputManager.on("move", this.move.bind(this));
		this.inputManager.on("restart", this.restart.bind(this));
		this.inputManager.on("keepPlaying", this.keepPlaying.bind(this));
		this.inputManager.on("goBack", this.goBack.bind(this));
	}
  
	//TODO: DerivefromScreenManager
	show(previousScreen) {
		this.previousScreen = previousScreen;
		
		this.setup();
		this.inputManager.listen();
	}

	/**
	 * Stop answering keys and display the previous screen. Callback on "goBack" input
	 * @memberof GameScreen
	 */
	goBack(){
		this.inputManager.unlisten();
		this.previousScreen.show();
	}

	/**
	 * Restart the game. Callback on "restart" input
	 * @memberof GameScreen
	 */
	restart() {
		this.storageManager.clearGameState();
		//TODO: this.actuator.continueGame(); // Clear the game won/lost message
		this.setup();
	}
  
	// Keep playing after winning (allows going over 2048)
	keepPlaying() {
		this.keepPlaying = true;
		//TODO: this.actuator.continueGame(); // Clear the game won/lost message
	}
  
	// Return true if the game is lost, or has won and the user hasn't kept playing
	isGameTerminated() {
		return this.over;
	}
  
	// Create the game
	setup() {
		let previousState = this.storageManager.getGameState();
  
		// Reload the game from a previous game if present
		if (previousState && !previousState.over) {
			this.grid        = new Grid(previousState.grid.size, previousState.grid.cells); // Reload grid
			this.score       = previousState.score;
			this.over        = previousState.over;
			this.won         = previousState.won;
		} else {
			this.grid        = new Grid(this.size);
			this.score       = 0;
			this.over        = false;
			this.won         = false;
  
			// Add the initial tiles
			this.addStartTiles();
		}
  
		// Update the actuator
		this.actuate();
	}
  
	/**
	 * Set up the initial tiles to start the game with
	 * @memberof GameScreen
	 */
	addStartTiles() {
		for (let i = 0; i < this.startTiles; i++) {
			this.addRandomTile();
		}
	}
  
	/**
	 * Adds a tile in a random position
	 * @memberof GameScreen
	 */
	addRandomTile() {
		if (this.grid.cellsAvailable()) {
			let value = Math.random() < 0.9 ? 1024 : 4;
			let tile = new Tile(this.grid.randomAvailableCell(), value);
  
			this.grid.insertTile(tile);
		}
	}
  
	// Sends the updated grid to the actuator
	actuate() {
		if (this.storageManager.getBestScore() < this.score) {
			this.storageManager.setBestScore(this.score);
		}
  
		// Clear the state when the game is over (game over only, not win)
		if (this.over) {
			this.storageManager.clearGameState();
		} else {
			this.storageManager.setGameState(this.serialize());
		}

		this.renderer.updateGameState(this.grid, {
			score:      this.score,
			bestScore:  this.storageManager.getBestScore(),
			over:       this.over,
			won:        this.won,
		});
	}
  
	/**
	 * Get data to persist. Read-only method.
	 * @returns {Object} With current position and value
	 * @memberof Tile
	 */
	serialize() {
		return {
			grid:        this.grid.serialize(),
			score:       this.score,
			over:        this.over,
			won:         this.won
		};
	}
  
	// Save all tile positions and remove merger info
	prepareTiles() {
		this.grid.eachCell(function (x, y, tile) {
			if (tile) {
				tile.mergedFrom = null;
				tile.savePosition();
			}
		});
	}
  
	// Move a tile and its representation
	moveTile(tile, cell) {
		//TODO: fix access to grid.cells
		this.grid.cells[tile.x][tile.y] = null;
		this.grid.cells[cell.x][cell.y] = tile;
		tile.updatePosition(cell);
	}
  
	// Move tiles on the grid in the specified direction
	move(direction) {
		// 0: up, 1: right, 2: down, 3: left

		if (this.isGameTerminated()) return; // Don't do anything if the game's over
  
		let cell, tile;
  
		let vector     = GameScreen.getVector(direction);
		let traversals = this.buildTraversals(vector);
		let moved      = false;
  
		// Save the current tile positions and remove merger information
		this.prepareTiles();
  
		// Traverse the grid in the right direction and move tiles
		traversals.x.forEach((x) => {
			traversals.y.forEach((y) => {
				cell = { x: x, y: y };
				tile = this.grid.cellContent(cell);
  
				if (tile) {
					let positions = this.findFarthestPosition(cell, vector);
					let nextTile  = this.grid.cellContent(positions.next);
  
					if (nextTile && nextTile.value === tile.value && !nextTile.mergedFrom) {
						let merged = new Tile(positions.next, tile.value * 2);
						merged.mergedFrom = [tile, nextTile];
  
						this.grid.insertTile(merged);
						this.grid.removeTile(tile);
  
						// Converge the two tiles' positions
						tile.updatePosition(positions.next);
  
						// Update the score
						this.score += merged.value;
  
						// The mighty 2048 tile
						if (merged.value === 2048) this.won = true;
					} else {
						this.moveTile(tile, positions.farthest);
					}
  
					if (!GameScreen.positionsEqual(cell, tile)) {
						moved = true; // The tile moved from its original cell!
					}
				}
			});
		});
  
		if (moved) {
			this.addRandomTile();
  
			if (!this.movesAvailable()) {
				this.over = true; // Game over!
			}
  
			this.actuate();
		}
	}
  
	/**
	 * Get the vector representing the chosen direction
	 * @static
	 * @param {Number} direction 0-Up, 1-Right, 2-Down, 3-Left
	 * @returns
	 * @memberof GameScreen
	 */
	static getVector(direction) {
		// Vectors representing tile movement
		const map = Object.freeze({
			0: Object.freeze({ x: 0,  y: -1 }), // Up
			1: Object.freeze({ x: 1,  y: 0 }),  // Right
			2: Object.freeze({ x: 0,  y: 1 }),  // Down
			3: Object.freeze({ x: -1, y: 0 })   // Left
		});
		return map[direction];
	}
  
	/**
	 * Build a list of positions to traverse in the right order
	 * @param {Object} vector x and y unitary vector
	 * @returns {Object} traversals, x and y arrays
	 * @memberof GameScreen
	 */
	buildTraversals(vector) {
		let traversals = { x: [], y: [] };
  
		for (let pos = 0; pos < this.size; pos++) {
			traversals.x.push(pos);
			traversals.y.push(pos);
		}
  
		// Always traverse from the farthest cell in the chosen direction
		if (vector.x === 1) traversals.x = traversals.x.reverse();
		if (vector.y === 1) traversals.y = traversals.y.reverse();
  
		return traversals;
	}
  
	findFarthestPosition(cell, vector) {
		let previous;
  
		// Progress towards the vector direction until an obstacle is found
		do {
			previous = cell;
			cell     = { x: previous.x + vector.x, y: previous.y + vector.y };
		} while (this.grid.withinBounds(cell) && this.grid.cellAvailable(cell));
  
		return {
			farthest: previous,
			next: cell // Used to check if a merge is required
		};
	}
	
	/**
	 * Check if it is Game Over
	 * @returns true if there are available plays
	 * @memberof GameScreen
	 */
	movesAvailable() {
		return this.grid.cellsAvailable() || this.tileMatchesAvailable();
	}
  
	/**
	 * Check for available matches between tiles and their neighbours.
	 * @returns true if there are tiles that can be merged with their neighbours
	 * @memberof GameScreen
	 */
	tileMatchesAvailable() {
		let tile;
		//For every tile
		for (let x = 0; x < this.size; x++) {
			for (let y = 0; y < this.size; y++) {
				tile = this.grid.cellContent({ x: x, y: y });
				if (tile) {
					for (let direction = 0; direction < 4; direction++) {
						//For all directions
						let vector = GameScreen.getVector(direction);
						let cell   = { x: x + vector.x, y: y + vector.y };
						let other  = this.grid.cellContent(cell);
						
						//Try to find a mergable tile
						if (other && other.value === tile.value) {
							return true; // These two tiles can be merged
						}
					}
				}
			}
		}
		return false;
	}

	/**
	 * Helper function to compare positions
	 * @static
	 * @param {Object} first x and y position
	 * @param {Object} second x and y position
	 * @returns True if the position's Numbers are equal
	 * @memberof GameScreen
	 */
	static positionsEqual(first, second) {
		return first.x === second.x && first.y === second.y;
	}
}