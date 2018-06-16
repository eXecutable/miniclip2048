import Renderer from "../render/Renderer.js";
import TilesHelper from "../render/shaders/TilesHelper.js";
import TextHelper from "../render/shaders/TextHelper.js";

export default class GameRenderer extends Renderer {

	constructor(gl, x, y, tileSquareWidth, tileGapWidth){
		super(gl);

		this.tilesHelper = new TilesHelper(gl);
		this.textHelper = new TextHelper(gl);
		this.shaderProgram = this.tilesHelper.shaderProgram;

		this.inObjVertexXY = this.tilesHelper.locations.POSITION_LOCATION(this.shaderProgram);
		this.inTranslationXY = this.tilesHelper.locations.TRANSLATE_LOCATION(this.shaderProgram);
		this.inColor = this.tilesHelper.locations.COLOR_LOCATION(this.shaderProgram);
		this.uResolutionXY = this.tilesHelper.locations.PROJECTION_LOCATION(this.shaderProgram);
    
		this.squareVertexArray = gl.createVertexArray();
		gl.bindVertexArray(this.squareVertexArray);


		this.x = x || 100;
		this.y = y || 100;
		this.yTableOffset = 75;
		this.tileSquareWidth = tileSquareWidth || 40;
		this.tileGapWidth = tileGapWidth || 2;
		this.tileAndGapWidth = 2*this.tileGapWidth + this.tileSquareWidth;
		this.tileCenter = this.tileSquareWidth / 2;
		
		this.highscoreLabel = "highscore: ";
		this.textHighScoreSize = this.textHelper.getSize(this.highscoreLabel);
		this.yHighScoreOffset = 0;
		this.scoreLabel = "score: ";
		this.textScoreSize = this.textHelper.getSize(this.scoreLabel);
		this.yScoreOffset = 10;


		//Square 4 distinct vertexes, 2 triangles with 2 shared vertices
		let squareVertexArr = new Float32Array([
			0, this.tileSquareWidth, 
			this.tileSquareWidth,  this.tileSquareWidth,  
			this.tileSquareWidth, 0,

			0, this.tileSquareWidth, 
			this.tileSquareWidth, 0, 
			0, 0
		]);
		let vertexNumTriangles = 2;
		this.squareVertexArrayXYCount = squareVertexArr.length / vertexNumTriangles;

		this.squareVertexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.squareVertexBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, squareVertexArr, gl.STATIC_DRAW);

		gl.enableVertexAttribArray(this.inObjVertexXY);
		gl.vertexAttribPointer(this.inObjVertexXY, vertexNumTriangles, gl.FLOAT, false, 0, 0);

		// -- Init Translations buffer
		this.translationsBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.translationsBuffer);
		gl.enableVertexAttribArray(this.inTranslationXY);
		gl.vertexAttribPointer(this.inTranslationXY, 2, gl.FLOAT, false, 0, 0);
		gl.vertexAttribDivisor(this.inTranslationXY, 1); // attribute used once per instance

		// -- Init Colors buffer
		this.backgroundColorsBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.backgroundColorsBuffer);
		gl.enableVertexAttribArray(this.inColor);
		gl.vertexAttribPointer(this.inColor, 3, gl.FLOAT, false, 0, 0);
		gl.vertexAttribDivisor(this.inColor, 1); // attribute used once per instance
	}
	
	isLoaded() {
		return true;
	}
	
	update(grid, scoreDetails) {

		let tileArray = [];

		for (let indexCol = 0; indexCol < grid.cells.length; indexCol++) {
			const column = grid.cells[indexCol];
			for (let indexRow = 0; indexRow < column.length; indexRow++) {
				const tile = column[indexRow];
				if (tile) {
					tileArray.push(tile);
					
					if (tile.previousPosition) {
						//tween
					} else if (tile.mergedFrom) {
						//TODO: Animate Merging
						// tile1 = mergedFrom[0]
						// tile2 = mergedFrom[1]
						// draw()
					} else {
						//No movement, simple render
						
					}
				}
			}
		}
		
		const backgrounds = Object.freeze({
			2: Object.freeze({r:0.9333, g: 0.8941, b: 0.8549}),
			4: Object.freeze({r:0.9294, g: 0.8784, b: 0.7843}),
			8: Object.freeze({r:0.9490, g: 0.6941, b: 0.4745}),
			16: Object.freeze({r:0.9607, g: 0.5843, b: 0.3882}),
			32: Object.freeze({r:0.9647, g: 0.4862, b: 0.3725}),
			64: Object.freeze({r:0.9647058824,	g: 0.368627451,	b: 0.231372549}),
			128: Object.freeze({r:0.9294117647,	g: 0.8117647059,	b: 0.4470588235}),
			256: Object.freeze({r:0.9294117647,	g: 0.8,			b: 0.3803921569}),
			512: Object.freeze({r:0.9294117647,	g: 0.7843137255,	b: 0.3137254902}),
			1024: Object.freeze({r:0.9294117647,	g: 0.7725490196,	b: 0.2470588235}),
			2048: Object.freeze({r:0.9294117647,	g: 0.7607843137,	b: 0.1803921569}),
			9000: Object.freeze({r:0.2352941176,	g: 0.2274509804,	b: 0.1960784314}),
		});

		let translations = [];
		let colors = [];
		let values = [];
		tileArray.forEach(tile => {
			translations.push(this.x + (tile.x / grid.size) * this.tileAndGapWidth * grid.size);
			translations.push(this.y + this.yTableOffset + (tile.y / grid.size) * this.tileAndGapWidth * grid.size);
			const value = tile.value > 2048 ? 9000 : tile.value;
			colors.push(backgrounds[value].r);
			colors.push(backgrounds[value].g);
			colors.push(backgrounds[value].b);
			values.push(String(tile.value));
		});

		let translationsArr = new Float32Array(translations);
		this.renderTiles(translationsArr, new Float32Array(colors));
		this.renderValues(translationsArr, values);
		this.renderHighScore(scoreDetails.score, scoreDetails.bestScore);
	}


	renderTiles(translationsArr, colors) {
		let gl = this.gl;

		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
		gl.clearColor(0.8, 0.9, 1.0, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT);

		gl.useProgram(this.shaderProgram);
		// Pass in the canvas resolution so we can convert from pixels to clipspace in the shader
		gl.uniform2fv(this.uResolutionXY, [gl.canvas.width, gl.canvas.height]);

		//Set translation buffer as active
		gl.bindBuffer(gl.ARRAY_BUFFER, this.translationsBuffer);
		//Copy data in
		gl.bufferData(gl.ARRAY_BUFFER, translationsArr, gl.STATIC_DRAW);

		//Set colors buffer as active
		gl.bindBuffer(gl.ARRAY_BUFFER, this.backgroundColorsBuffer);
		//Copy data in
		gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
		
		//Set the square as active
		gl.bindVertexArray(this.squareVertexArray);
		gl.drawArraysInstanced(gl.TRIANGLES, 0, this.squareVertexArrayXYCount, translationsArr.length/2);
	}

	renderValues(translationsArr, values) {
		for (let index = 0; index < translationsArr.length; index+=2) {
			const textSize = this.textHelper.getSize(values[index/2]);
			this.textHelper.render(translationsArr[index] + this.tileCenter - textSize.x/2, translationsArr[index+1] - this.tileCenter + textSize.y/2, values[index/2]);	
		}
	}

	renderHighScore(currentScore, bestScore) {
		
		this.textHelper.render(this.x, this.y + this.yHighScoreOffset, this.highscoreLabel);
		this.textHelper.render(this.x + this.textHighScoreSize.x, this.y + this.yHighScoreOffset, String(bestScore));

		this.textHelper.render(this.x, this.y + this.yScoreOffset, this.scoreLabel);
		this.textHelper.render(this.x + this.textScoreSize.x, this.y + this.yScoreOffset, String(currentScore));
	}

	releaseGL() {
		// -- Delete WebGL resources
		this.textHelper.releaseGL();
		this.gl.deleteProgram(this.shaderProgram);
		this.gl.deleteVertexArray(this.squareVertexArray);
		this.gl.deleteBuffer(this.squareVertexBuffer);
		this.gl.deleteBuffer(this.translationsBuffer);
		this.gl.deleteBuffer(this.backgroundColorsBuffer);
	}
}