import Renderer from "../render/Renderer.js";
import TilesHelper from "../render/shaders/TilesHelper.js";

export default class GameRenderer extends Renderer {
	/**
	 *Creates an instance of GameRenderer.
	* @param {WebGLRenderingContext} gl
	* @param {RenderManager} renderManager
	* @memberof GameRenderer
	*/
	constructor(gl, renderManager){
		super(gl);

		this.tilesHelper = new TilesHelper(gl, renderManager);
		this.textHelper = renderManager.getGlobalHelper("Text");
		
		this.highscoreLabel = "highscore: ";
		this.textHelper.init(this.highscoreLabel);
		this.textHighScoreSize = this.textHelper.getSize(this.highscoreLabel);
		this.scoreLabel = "score: ";
		this.textHelper.init(this.scoreLabel);
		this.textScoreSize = this.textHelper.getSize(this.scoreLabel);

		this.RtoRestartLabel = "press r to restart";
		this.textHelper.init(this.RtoRestartLabel);
		this.BackspaceToMenuLabel = "press backspace to go to menu";
		this.textHelper.init(this.BackspaceToMenuLabel);

		this.winLabel = "you win";
		this.textHelper.init(this.winLabel);
		this.textWinSize = this.textHelper.getSize(this.winLabel);

		this.gameoverLabel = "game over";
		this.textHelper.init(this.gameoverLabel);
		this.textGameoverSize = this.textHelper.getSize(this.gameoverLabel);

		this.gameInfo = {};

		this.boundRenderFunction = this.render.bind(this);
		this.winBlinkAnim = {
			lastBlinkTime: 0,
			IsOn: false,
		};
	}

	/**
	 * Is game ready to render
	 * @returns {Boolean} 
	 * @memberof GameRenderer
	 */
	isLoaded() {
		return this.textHelper.isLoaded();
	}

	/**
	 * Update the game variables. Will schedule a render() call.
	 * @param {Grid} grid 
	 * @param {Object} scoreDetails Game score details to display on top of the game
	 * @memberof GameRenderer
	 */
	updateGameState(grid, scoreDetails) {
		this.gameInfo.grid = grid;
		this.gameInfo.scoreDetails = scoreDetails;
		this.tilesHelper.update(100, 90, grid);

		if(!this.animationFrameRequestID) {
			this.animationFrameRequestID = window.requestAnimationFrame(this.boundRenderFunction);
		}
	}
	
	/**
	 * Draw game on the canvas
	 * @param {Number} msTime
	 * @memberof GameRenderer
	 */
	render(msTime) {
		let gl = this.gl;
		this.animationFrameRequestID = null;

		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
		gl.clearColor(0.8, 0.9, 0.9, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT);

		this.renderHighScore(110, 60, 70, this.gameInfo.scoreDetails.score, this.gameInfo.scoreDetails.bestScore);

		let animating = this.tilesHelper.render(msTime);
		if(animating && !this.animationFrameRequestID) {
			this.animationFrameRequestID = window.requestAnimationFrame(this.boundRenderFunction);
		}
		

		if (this.gameInfo.scoreDetails.won) {
			if(!this.winBlinkAnim.IsOn && this.winBlinkAnim.lastBlinkTime + 500 < msTime) {
				this.winBlinkAnim.IsOn = true;
				this.winBlinkAnim.lastBlinkTime = msTime;
			}
			if(this.winBlinkAnim.IsOn){
				this.textHelper.render(gl.canvas.width/2 - this.textWinSize.x/2, 290, this.winLabel);
				if(this.winBlinkAnim.lastBlinkTime + 500 < msTime) {
					this.winBlinkAnim.IsOn = false;
					this.winBlinkAnim.lastBlinkTime = msTime;
				}
			}
			if(!this.animationFrameRequestID) {
				this.animationFrameRequestID = window.requestAnimationFrame(this.boundRenderFunction);
			}
		}
		if (this.gameInfo.scoreDetails.over) {
			this.textHelper.render(gl.canvas.width/2 - this.textGameoverSize.x/2, 300, this.gameoverLabel);
		}

		this.textHelper.render(110, 350, this.RtoRestartLabel);
		this.textHelper.render(110, 360, this.BackspaceToMenuLabel);
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
		this.gl.deleteProgram(this.shaderProgram);
		this.gl.deleteVertexArray(this.squareVertexArray);
		this.gl.deleteBuffer(this.squareVertexBuffer);
		this.gl.deleteBuffer(this.translationsBuffer);
		this.gl.deleteBuffer(this.backgroundColorsBuffer);
	}
}