import Renderer from "../render/Renderer.js";
import TilesHelper from "../render/shaders/TilesHelper.js";
import TextHelper from "../render/shaders/TextHelper.js";

export default class GameRenderer extends Renderer {
	/**
	 *Creates an instance of GameRenderer.
	* @param {*} gl
	* @memberof GameRenderer
	*/
	constructor(gl){
		super(gl);

		this.tilesHelper = new TilesHelper(gl);
		this.textHelper = new TextHelper(gl);
		
		this.highscoreLabel = "highscore: ";
		this.textHighScoreSize = this.textHelper.getSize(this.highscoreLabel);
		this.scoreLabel = "score: ";
		this.textScoreSize = this.textHelper.getSize(this.scoreLabel);
	}
	/**
	 * Is game ready to render
	 * @returns {Boolean} 
	 * @memberof GameRenderer
	 */
	isLoaded() {
		return true;
	}
	/**
	 * Draw
	 * @param {Grid} grid 
	 * @param {Object} scoreDetails Game score details to display on top of the game
	 * @memberof GameRenderer
	 */
	updateGameState(grid, scoreDetails) {
		let gl = this.gl;

		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
		gl.clearColor(0.8, 0.9, 0.9, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT);

		this.tilesHelper.render(100,100, grid);
		this.renderHighScore(110, 100, 110, scoreDetails.score, scoreDetails.bestScore);
	}

	/**
	 * Display the score
	 * @param {Number} x Number of pixels from the left to draw titles
	 * @param {Number} highScoreY Number of pixels from the top to draw high score
	 * @param {Number} currentScoreY Number of pixels from the top to draw current score
	 * @param {Number} currentScore Current game score
	 * @param {Number} bestScore Best score stored
	 * @memberof GameRenderer
	*/
	renderHighScore(x, highScoreY, currentScoreY, currentScore, bestScore) {
		this.textHelper.render(x, highScoreY, this.highscoreLabel);
		this.textHelper.render(x + this.textHighScoreSize.x, highScoreY, String(bestScore));

		this.textHelper.render(x, currentScoreY, this.scoreLabel);
		this.textHelper.render(x + this.textScoreSize.x, currentScoreY, String(currentScore));
	}

	/**
	 * Release WebGL resources used. Invalidates object, should be called before unreferencing.
	 * @memberof GameRenderer
	 */
	releaseGL() {
		this.textHelper.releaseGL();
		this.gl.deleteProgram(this.shaderProgram);
		this.gl.deleteVertexArray(this.squareVertexArray);
		this.gl.deleteBuffer(this.squareVertexBuffer);
		this.gl.deleteBuffer(this.translationsBuffer);
		this.gl.deleteBuffer(this.backgroundColorsBuffer);
	}
}