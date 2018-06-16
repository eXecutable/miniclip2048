import Renderer from "../render/Renderer.js";
import TextHelper from "../render/shaders/TextHelper.js";

export default class MainMenuRenderer extends Renderer {

	constructor(gl){
		super(gl);

		this.textHelper = new TextHelper(gl);

		this.textHelper.init("game");
		this.textHelper.init("highscores");
	}
	
	isLoaded() {
		return this.textHelper.isLoaded();
	}

	render(buttonIndex) {
		let gl = this.gl;

		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
		gl.clearColor(0.8, 0.5, 1.0, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT);

		if(buttonIndex === 0) {
			this.textHelper.render(100, 100, "game selected");
			this.textHelper.render(100, 300, "highscores");
		} else {
			this.textHelper.render(100, 100, "game");
			this.textHelper.render(100, 300, "highscores selected");
		}
		

		// gl.useProgram(this.shaderProgram);
		// // Pass in the canvas resolution so we can convert from pixels to clipspace in the shader
		// gl.uniform2fv(this.uResolutionXY, [gl.canvas.width, gl.canvas.height]);

		// //Set translation buffer as active
		// gl.bindBuffer(gl.ARRAY_BUFFER, this.translationsBuffer);
		// //Copy data in
		// gl.bufferData(gl.ARRAY_BUFFER, translations, gl.STATIC_DRAW);

		// //Set colors buffer as active
		// gl.bindBuffer(gl.ARRAY_BUFFER, this.backgroundColorsBuffer);
		// //Copy data in
		// gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
		
		// //Set the square as active
		// gl.bindVertexArray(this.squareVertexArray);

		// gl.drawArraysInstanced(gl.TRIANGLES, 0, this.squareVertexArrayXYCount, translations.length/2);
	}

	releaseGL() {
		this.textHelper.releaseGL();
	}
}