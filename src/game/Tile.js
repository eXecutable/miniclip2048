export default class Tile {
	/**
	 * Tile used inside a {@link Grid}.
	 * @param {Object} position with x and y values
	 * @param {Number} value 2 by default
	 * @memberof Tile
	 */
	constructor(position, value) {
		this.x                = position.x;
		this.y                = position.y;
		this.value            = value || 2;
  
		this.previousPosition = null;
		this.mergedFrom       = null; //Stores the 2 tiles that merged together to form this one
	}
	/**
	 * Fill previousPosition property with x and y
	 * @memberof Tile
	 */
	savePosition() {
		this.previousPosition = { x: this.x, y: this.y };
	}
	/**
	 * Set x and y
	 * @param {Object} position x and y to apply to this instance
	 * @memberof Tile
	 */
	updatePosition(position) {
		this.x = position.x;
		this.y = position.y;
	}
	/**
	 * Get data to persist. Read-only method.
	 * @returns {Object} With current position and value
	 * @memberof Tile
	 */
	serialize() {
		return {
			position: {
				x: this.x,
				y: this.y
			},
			value: this.value
		};
	}
}