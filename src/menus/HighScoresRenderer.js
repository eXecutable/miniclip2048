import Renderer from "../render/Renderer.js";

export default class HighScoresRenderer extends Renderer {

	constructor(gl, renderManager){
		super(gl);

		this.textHelper = renderManager.getGlobalHelper("Text");

		this.dateOptions = { weekday: "long", year: "numeric", month: "numeric", day: "numeric" };
		this.boundRenderFunction = this.render.bind(this);
	}

	isLoaded() {
		return this.textHelper.isLoaded();
	}
	
	update(highScoreList) {
		this.highScoreList = highScoreList;
		this.animationFrameRequestID = window.requestAnimationFrame(this.boundRenderFunction);
	}

	render() {
		let gl = this.gl;

		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
		gl.clearColor(0.5, 0.8, 0.4, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT);

		this.textHelper.render(50, 70, "date");
		this.textHelper.render(320 - this.textHelper.getSize("score").x, 70, "score");
		if (this.highScoreList) {
			let y = 100;
			for (let index = 0; index < this.highScoreList.length; index++) {
				let scoreItem = this.highScoreList[index];
				this.textHelper.render(50, y, scoreItem.when);
				const scoreText = String(scoreItem.score);
				this.textHelper.render(320 - this.textHelper.getSize(scoreText).x, y, scoreText);
				y += 12;
			}
		}
	}

	/**
	 * Release WebGL resources used. Invalidates object, should be called before unreferencing.
	 * @memberof HighScoresRenderer
	 */
	releaseGL() {
	}
}