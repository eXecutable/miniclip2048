import ShaderHelper from "./ShaderHelper";

export default class TilesHelper {

	/**
	 * Creates an instance of TilesHelper.
	 * @param {WebGLRenderingContext} gl
	 * @param {RenderManager} renderManager
	 * @param {Number} tileSquareWidth pixel size of the square size
	 * @param {Number} tileGapWidth pixel size of the gap between squares
	 * @memberof TilesHelper
	 */
	constructor(gl, renderManager, tileSquareWidth, tileGapWidth){
		this.gl = gl;
		if(!gl){
			throw "No graphic context passed to TextHelper";
		}

		this.locations = Object.freeze({
			/**
			 * Returns the location of the vertex in buffer
			 * @returns {Integer} The location
			 */
			POSITION_LOCATION: function() { return 0; },
			/**
			 * Returns the location of background color in vec4
			 * @returns {Integer} The location
			 */
			COLOR_LOCATION: function() { return 1; },
			/**
			 * Returns the location of translation in vec2
			 * @returns {Integer} The location
			 */
			TRANSLATE_LOCATION: function() { return 2; },
			/**
			 * Returns the location of the projection uniform
			 * @param {WebGLProgram} program the instance to find in
			 * @returns {Integer} The location
			 */
			PROJECTION_LOCATION: function(program) {
				return gl.getUniformLocation(program, "projection");
			}
		});

		//Value to backgorund color converter
		this.backgrounds = Object.freeze({
			2: Object.freeze([0.9333, 0.8941, 0.8549]),
			4: Object.freeze([0.9294, 0.8784, 0.7843]),
			8: Object.freeze([0.9490, 0.6941, 0.4745]),
			16: Object.freeze([0.9607, 0.5843, 0.3882]),
			32: Object.freeze([0.9647, 0.4862, 0.3725]),
			64: Object.freeze([0.9647058824,	0.368627451,	0.231372549]),
			128: Object.freeze([0.9294117647,	0.8117647059,	0.4470588235]),
			256: Object.freeze([0.9294117647,	0.8,			0.3803921569]),
			512: Object.freeze([0.9294117647,	0.7843137255,	0.3137254902]),
			1024: Object.freeze([0.9294117647,	0.7725490196,	0.2470588235]),
			2048: Object.freeze([0.9294117647,	0.7607843137,	0.1803921569]),
			9000: Object.freeze([0.2352941176,	0.2274509804,	0.1960784314]),
		});

		this.vertShaderString = `#version 300 es
								#define POSITION_LOCATION 0
								#define COLOR_LOCATION 1
								#define TRANSLATE_LOCATION 2
								
								precision mediump float;

								layout(location = POSITION_LOCATION) in vec2 pos;
								layout(location = COLOR_LOCATION) in vec4 inColor;
								layout(location = TRANSLATE_LOCATION) in vec2 translate;
								
								uniform vec2 projection;

								flat out vec4 fragColor;

								// all shaders have a main function
								void main() {
									fragColor = inColor;
									
									// Add in the translation
									// convert the position from pixels to 0.0 to 1.0
									vec2 position = (pos + vec2(translate.x, projection.y - translate.y)) / projection;
									// convert from 0->1 to 0->2
									// convert from 0->2 to -1->+1 (clipspace)
									vec2 clipSpace = (position * 2.0) - 1.0;

									gl_Position = vec4(clipSpace, 0, 1);
								}`;

		this.fragShaderString = `#version 300 es

								precision mediump float;

								flat in vec4 fragColor;
								out vec4 outColor;

								void main() {
									outColor = fragColor;
								}`;
		this.shaderProgram = ShaderHelper.createProgramFromSources(gl, [this.vertShaderString,this.fragShaderString]);

		this.textHelper = renderManager.getGlobalHelper("Text");
		this.textHelper.init("2");
		this.textHelper.init("4");
		this.textHelper.init("8");
		this.textHelper.init("16");
		this.textHelper.init("32");
		this.textHelper.init("64");
		this.textHelper.init("128");
		this.textHelper.init("256");
		this.textHelper.init("512");
		this.textHelper.init("1024");
		this.textHelper.init("2048");
		
		this.inObjVertexXY = this.locations.POSITION_LOCATION(this.shaderProgram);
		this.inTranslationXY = this.locations.TRANSLATE_LOCATION(this.shaderProgram);
		this.inColor = this.locations.COLOR_LOCATION(this.shaderProgram);
		this.uResolutionXY = this.locations.PROJECTION_LOCATION(this.shaderProgram);
    
		this.VAO = gl.createVertexArray();
		gl.bindVertexArray(this.VAO);

		this.tileSquareWidth = tileSquareWidth || 40;
		this.tileGapWidth = tileGapWidth || 2;
		this.tileAndGapWidth = 2*this.tileGapWidth + this.tileSquareWidth;
		this.tileCenter = this.tileSquareWidth / 2;

		//Square 4 distinct vertexes, 2 triangles with 2 shared vertices
		let squareVertexArr = new Float32Array([
			0, this.tileSquareWidth, 
			this.tileSquareWidth,  this.tileSquareWidth,  
			this.tileSquareWidth, 0,

			0, this.tileSquareWidth, 
			this.tileSquareWidth, 0, 
			0, 0
		]);
		this.numberOfVertexes = squareVertexArr.length / 2;

		this.squareVertexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.squareVertexBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, squareVertexArr, gl.STATIC_DRAW);

		gl.enableVertexAttribArray(this.inObjVertexXY);
		gl.vertexAttribPointer(this.inObjVertexXY, 2, gl.FLOAT, false, 0, 0);

		this.translationsBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.translationsBuffer);
		gl.enableVertexAttribArray(this.inTranslationXY);
		gl.vertexAttribPointer(this.inTranslationXY, 2, gl.FLOAT, false, 0, 0);
		gl.vertexAttribDivisor(this.inTranslationXY, 1); // attribute used once per instance

		this.backgroundColorsBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.backgroundColorsBuffer);
		gl.enableVertexAttribArray(this.inColor);
		gl.vertexAttribPointer(this.inColor, 3, gl.FLOAT, false, 0, 0);
		gl.vertexAttribDivisor(this.inColor, 1); // attribute used once per instance
	}

	/**
	 * Draw the tiles for the Grid
	 * @param {Number} x Number of pixels from the left of canvas to start drawing
	 * @param {Number} y Number of pixels from the top of canvas to start drawing
	 * @param {Grid} grid {@link Grid} Tile positions and values
	 * @memberof TilesHelper
	 */
	update(x, y, grid) {

		let tileArray = [];
		for (let indexCol = 0; indexCol < grid.cells.length; indexCol++) {
			const column = grid.cells[indexCol];
			for (let indexRow = 0; indexRow < column.length; indexRow++) {
				const tile = column[indexRow];
				if (tile) {
					tileArray.push(tile);
					
					// if (tile.previousPosition) {
					// 	//TODO: tween
					// } else if (tile.mergedFrom) {
					// 	//TODO: Animate Merging
					// 	// tile1 = mergedFrom[0]
					// 	// tile2 = mergedFrom[1]
					// 	// draw()
					// } else {
					// 	//No movement, simple render
					// }
				}
			}
		}

		this.translationsArr = new Float32Array(tileArray.length*2);
		let translationIndex = 0;
		this.colorsArr = new Float32Array(tileArray.length*3);
		let colorsIndex = 0;
		this.tileValueStrings = [];
		tileArray.forEach(tile => {
			this.translationsArr.set([
				x + (tile.x / grid.size) * this.tileAndGapWidth * grid.size,
				y + this.tileAndGapWidth + (tile.y / grid.size) * this.tileAndGapWidth * grid.size
			], translationIndex);
			translationIndex += 2;
			this.tileValueStrings.push(String(tile.value));
			const backgroundColor = tile.value > 2048 ? this.backgrounds[9000] : this.backgrounds[tile.value];
			this.colorsArr.set(backgroundColor, colorsIndex);
			colorsIndex += 3;
		});
	}
	
	render(msTime) {
		this.renderTiles(this.translationsArr, this.colorsArr);
		this.renderValues(this.translationsArr, this.tileValueStrings);
	}

	/**
	 * Render the background of the Tiles
	 * @param {Float32Array} translationsArr Array of positions of the tiles [x,y,x,y...]
	 * @param {Float32Array} color Array of colors of the tiles [r,g,b,r,g,b,r...]
	 * @memberof TilesHelper
	 */
	renderTiles(translationsArr, colors) {
		let gl = this.gl;

		gl.useProgram(this.shaderProgram);
		gl.bindVertexArray(this.VAO);

		gl.uniform2fv(this.uResolutionXY, [gl.canvas.width, gl.canvas.height]);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.translationsBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, translationsArr, gl.STATIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.backgroundColorsBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);

		gl.drawArraysInstanced(gl.TRIANGLES, 0, this.numberOfVertexes, translationsArr.length/2);
	}

	/**
	 * Render the text inside the tile
	 * @param {Float32Array} translationsArr Array of positions of the tiles [x,y,x,y...]
	 * @param {Array} values Array of Strings to display in the tiles
	 * @memberof TilesHelper
	 */
	renderValues(translationsArr, values) {
		for (let index = 0; index < translationsArr.length; index+=2) {
			const textSize = this.textHelper.getSize(values[index/2]);
			this.textHelper.render(
				translationsArr[index]   + this.tileCenter - textSize.x/2,
				translationsArr[index+1] - this.tileCenter + textSize.y/2,
				values[index/2]);	
		}
	}

	/**
	 * Release WebGL resources used. Invalidates object, should be called before unreferencing.
	 * @memberof TilesHelper
	 */
	releaseGL() {
		this.gl.deleteProgram(this.shaderProgram);
		this.gl.deleteVertexArray(this.VAO);
		this.gl.deleteBuffer(this.squareVertexBuffer);
		this.gl.deleteBuffer(this.translationsBuffer);
		this.gl.deleteBuffer(this.backgroundColorsBuffer);
	}
}