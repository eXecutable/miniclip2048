import Tile from "./Tile.js";

export default class Grid {
	/**
	 * Creates an instance of Grid
	 * @param {Number} size Number of tiles a row of the grid square has
	 * @param {Object} previousState 
	 * @memberof Grid
	 */
	constructor (size, previousState) {
		if (previousState && size !== previousState.length) {
			throw "Grid size does not match previousState data";
		}
		this.size = size;
		this.cells = [];
		if(previousState) {
			this.fromState(previousState);
		} else {
			this.empty();
		}
	}
  
	/**
	 * Build an empty grid of the Grid's size
	 * @memberof Grid
	 */
	empty() {
		for (let x = 0; x < this.size; x++) {
			let row = this.cells[x] = [];
  
			for (let y = 0; y < this.size; y++) {
				row.push(null);
			}
		}
	}
  
	/**
	 * Build a grid with Tiles according to the information in state
	 * @param {Array} state Array of Arrays, all of size equal this.size
	 * @memberof Grid
	 */
	fromState (state) {
		for (let x = 0; x < this.size; x++) {
			let row = this.cells[x] = [];
  
			for (let y = 0; y < this.size; y++) {
				let tile = state[x][y];
				row.push(tile ? new Tile(tile.position, tile.value) : null);
			}
		}
	}
  
	/**
	 * Find a random empty cell position
	 * @returns {Object|null} An object with x and y or null if frid is full.
	 * @memberof Grid
	 */
	randomAvailableCell () {
		let cellPositions = this.availableCells();
		if (cellPositions.length) {
			return cellPositions[Math.floor(Math.random() * cellPositions.length)];
		}
		return null;
	}

	/**
	 * Gets all empty cell positions
	 * @returns {Array} Array with objects with x and y
	 * @memberof Grid
	 */
	availableCells () {
		let cellPositions = [];
		this.eachCell(function (x, y, tile) {
			if (!tile) {
				cellPositions.push({ x: x, y: y });
			}
		});
		return cellPositions;
	}
  
	/**
	 * Call callback for every cell
	 * @param {Function} callback
	 * @memberof Grid
	 */
	eachCell(callback) {
		for (let x = 0; x < this.size; x++) {
			for (let y = 0; y < this.size; y++) {
				callback(x, y, this.cells[x][y]);
			}
		}
	}
  
	/**
	 * Check if there are any cells empty
	 * @returns {Boolean} True if there is at least 1 empty cell
	 * @memberof Grid
	 */
	cellsAvailable() {
		return !!this.availableCells().length;
	}

	/**
	 * Check if the specified cell is empty
	 * @param {Object} cell Object with x and y
	 * @returns {Boolean} True if there is cell is empty
	 * @memberof Grid
	 */
	cellAvailable(cell) {
		return !this.cellOccupied(cell);
	}

	/**
	 * Check if the specified cell is taken
	 * @param {Object} cell Object with x and y
	 * @returns {Boolean} True if there is cell is taken
	 * @memberof Grid
	 */
	cellOccupied(cell) {
		return !!this.cellContent(cell);
	}

	/**
	 * Get the Tile at given position
	 * @param {Object} cell Object with x and y
	 * @returns {Tile|null} The tile at specified position, null if empty
	 * @memberof Grid
	 */
	cellContent(cell) {
		if (this.withinBounds(cell)) {
			return this.cells[cell.x][cell.y];
		} else {
			return null;
		}
	}
  
	/**
	 * Inserts a {@link Tile} in the grid on the Tile's position
	 * @param {Tile} tile Item to be placed at it's position
	 * @memberof Grid
	 */
	insertTile(tile) {
		this.cells[tile.x][tile.y] = tile;
	}

	/**
	 * Removes a {@link Tile} in the grid from the Tile's position
	 * @param {Object} tile Object with x and y
	 * @memberof Grid
	 */
	removeTile(tile) {
		this.cells[tile.x][tile.y] = null;
	}

	/**
	 * Check position against Grid's size
	 * @param {Object} position Object with x and y
	 * @returns {Boolean} True if x and y are within the Grid size
	 * @memberof Grid
	 */
	withinBounds(position) {
		return position.x >= 0 && position.x < this.size &&
           position.y >= 0 && position.y < this.size;
	}
	
	/**
	 * Get data to persist. Read-only method.
	 * @returns {Object} With the size and an array grid of serialized {@link Tile}
	 * @memberof Grid
	 */
	serialize() {
		let cellState = [];
  
		for (let x = 0; x < this.size; x++) {
			let row = cellState[x] = [];
  
			for (let y = 0; y < this.size; y++) {
				row.push(this.cells[x][y] ? this.cells[x][y].serialize() : null);
			}
		}
  
		return {
			size: this.size,
			cells: cellState
		};
	}
}