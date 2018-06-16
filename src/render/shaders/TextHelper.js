import fontImage from "8x8-font.png";
import ShaderHelper from "./ShaderHelper";

export default class TextHelper {
	/**
	 * Creates an instance of TextHelper.
	 * @param {WebGLRenderingContext} gl
	 * @memberof TextHelper
	 */
	constructor(gl) {
		this.gl = gl;
		if(!gl){
			throw "No graphic context passed to TextHelper";
		}

		this.loaded = false;
		
		this.locations = Object.freeze({
			/**
			 * Returns the location of the vertex in buffer
			 * @returns {Integer} The location
			 */
			POSITION_LOCATION: function() { return 0; },
			/**
			 * Returns the location of tint color vec4 uniform
			 * @param {WebGLProgram} program the instance to find in
			 * @returns {Integer} The location
			 */
			COLOR_LOCATION: function(program) {
				return gl.getUniformLocation(program, "inColor");
			},
			/**
			 * Returns the location of the translation position uniform
			 * @param {WebGLProgram} program the instance to find in
			 * @returns {Integer} The location
			 */
			TRANSLATE_LOCATION:  function(program) {
				return gl.getUniformLocation(program, "translate");
			},
			/**
			 * Returns the location of the projection uniform
			 * @param {WebGLProgram} program the instance to find in
			 * @returns {Integer} The location
			 */
			PROJECTION_LOCATION: function(program) {
				return gl.getUniformLocation(program, "projection");
			},
			/**
			 * TODO:
			 */
			TEXT_COORDS_LOCATION: function() { return 4; },
		});

		this.vertShaderString = `#version 300 es
								#define POSITION_LOCATION 0
								#define TEXT_COORDS_LOCATION 4

								precision mediump float;

								layout(location = POSITION_LOCATION) in vec2 pos;
								layout(location = TEXT_COORDS_LOCATION) in vec2 inTexcoord;
								
								uniform vec2 translate;
								uniform vec2 projection;
								uniform vec4 inColor;

								flat out vec4 fragColor;
								out vec2 fragTexcoord;

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
									
									// Pass the texcoord to the fragment shader.
									fragTexcoord = inTexcoord;
								}`;

		this.fragShaderString = `#version 300 es

								precision mediump float;

								flat in vec4 fragColor;
								in vec2 fragTexcoord;
								uniform sampler2D glyphTexture;

								out vec4 outColor;

								void main() {
									outColor = texture(glyphTexture, fragTexcoord) * fragColor;
								}`;
		this.shaderProgram = ShaderHelper.createProgramFromSources(gl, [this.vertShaderString,this.fragShaderString]);
		
		this.inObjVertexXY = this.locations.POSITION_LOCATION(this.shaderProgram);
		this.textureCoordenatesUV = this.locations.TEXT_COORDS_LOCATION(this.shaderProgram);
		this.inTranslationXY = this.locations.TRANSLATE_LOCATION(this.shaderProgram);
		this.inColor = this.locations.COLOR_LOCATION(this.shaderProgram);
		this.uResolutionXY = this.locations.PROJECTION_LOCATION(this.shaderProgram);
		
		
		// -- Init Vertex Array
		this.textVertexArray = gl.createVertexArray();
		gl.bindVertexArray(this.textVertexArray);

		this.vertexPositionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionBuffer);
		gl.enableVertexAttribArray(this.inObjVertexXY);
		gl.vertexAttribPointer(this.inObjVertexXY, 2, gl.FLOAT, false, 0, 0);

		this.textureCoordsBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.textureCoordsBuffer);
		gl.enableVertexAttribArray(this.textureCoordenatesUV);
		gl.vertexAttribPointer(this.textureCoordenatesUV, 2, gl.FLOAT, false, 0, 0);

		// Create a texture.
		this.glyphTex = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, this.glyphTex);
		// Fill the texture with a 1x1 blue pixel, to use as a no crash fallback while loading the image
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

		// Asynchronously load an image
		this.image = new Image();
		this.image.addEventListener("load", () => {
			if (this.image.naturalWidth === 0) {
				console.error( this.image.src + " image failed to load.");
				return;
			}

			this.loaded = true;
		});
		this.image.src = fontImage;

		//for 8x8-font.png
		this.fontInfo = Object.freeze({
			letterHeight: 8,
			spaceWidth: 8,
			spacing: -1,
			textureWidth: 64,
			textureHeight: 40,
			glyphInfos: Object.freeze({
				"a": { x:  0, y:  0, width: 8, },
				"b": { x:  8, y:  0, width: 8, },
				"c": { x: 16, y:  0, width: 8, },
				"d": { x: 24, y:  0, width: 8, },
				"e": { x: 32, y:  0, width: 8, },
				"f": { x: 40, y:  0, width: 8, },
				"g": { x: 48, y:  0, width: 8, },
				"h": { x: 56, y:  0, width: 8, },
				"i": { x:  0, y:  8, width: 8, },
				"j": { x:  8, y:  8, width: 8, },
				"k": { x: 16, y:  8, width: 8, },
				"l": { x: 24, y:  8, width: 8, },
				"m": { x: 32, y:  8, width: 8, },
				"n": { x: 40, y:  8, width: 8, },
				"o": { x: 48, y:  8, width: 8, },
				"p": { x: 56, y:  8, width: 8, },
				"q": { x:  0, y: 16, width: 8, },
				"r": { x:  8, y: 16, width: 8, },
				"s": { x: 16, y: 16, width: 8, },
				"t": { x: 24, y: 16, width: 8, },
				"u": { x: 32, y: 16, width: 8, },
				"v": { x: 40, y: 16, width: 8, },
				"w": { x: 48, y: 16, width: 8, },
				"x": { x: 56, y: 16, width: 8, },
				"y": { x:  0, y: 24, width: 8, },
				"z": { x:  8, y: 24, width: 8, },
				"0": { x: 16, y: 24, width: 8, },
				"1": { x: 24, y: 24, width: 8, },
				"2": { x: 32, y: 24, width: 8, },
				"3": { x: 40, y: 24, width: 8, },
				"4": { x: 48, y: 24, width: 8, },
				"5": { x: 56, y: 24, width: 8, },
				"6": { x:  0, y: 32, width: 8, },
				"7": { x:  8, y: 32, width: 8, },
				"8": { x: 16, y: 32, width: 8, },
				"9": { x: 24, y: 32, width: 8, },
				"-": { x: 32, y: 32, width: 8, },
				"*": { x: 40, y: 32, width: 8, },
				"!": { x: 48, y: 32, width: 8, },
				"?": { x: 56, y: 32, width: 8, },
			}),
		});

		this.knownStrings = {};
	}

	/**
	 * Query if the text atlas is loaded.
	 * @return {Boolean} true if it's ready to render
	 * @memberof TextHelper
	 */
	isLoaded(){
		return this.loaded;
	}

	/**
	 * Calculate the vertex position and UV coordinates for a given text.
	 * @param {String} s The text to display
	 * @returns {Object} Vertex and texture buffers
	 * @memberof TextHelper
	 */
	makeVerticesForString(s) {
		const len = s.length;
		let numVertices = len * 6;
		let positions = new Float32Array(numVertices * 2);
		let texcoords = new Float32Array(numVertices * 2);
		let offset = 0;
		let x = 0;
		let maxX = this.fontInfo.textureWidth;
		let maxY = this.fontInfo.textureHeight;
		for (let ii = 0; ii < len; ++ii) {
			let letter = s[ii];
			let glyphInfo = this.fontInfo.glyphInfos[letter];
			if (glyphInfo) {
				let x2 = x + glyphInfo.width;
				let u1 = glyphInfo.x / maxX;
				let v1 = (glyphInfo.y + this.fontInfo.letterHeight - 1) / maxY;
				let u2 = (glyphInfo.x + glyphInfo.width - 1) / maxX;
				let v2 = glyphInfo.y / maxY;
	
				// 6 vertices per letter
				positions[offset + 0] = x;
				positions[offset + 1] = 0;
				texcoords[offset + 0] = u1;
				texcoords[offset + 1] = v1;
	
				positions[offset + 2] = x2;
				positions[offset + 3] = 0;
				texcoords[offset + 2] = u2;
				texcoords[offset + 3] = v1;
	
				positions[offset + 4] = x;
				positions[offset + 5] = this.fontInfo.letterHeight;
				texcoords[offset + 4] = u1;
				texcoords[offset + 5] = v2;
	
				positions[offset + 6] = x;
				positions[offset + 7] = this.fontInfo.letterHeight;
				texcoords[offset + 6] = u1;
				texcoords[offset + 7] = v2;
	
				positions[offset + 8] = x2;
				positions[offset + 9] = 0;
				texcoords[offset + 8] = u2;
				texcoords[offset + 9] = v1;
	
				positions[offset + 10] = x2;
				positions[offset + 11] = this.fontInfo.letterHeight;
				texcoords[offset + 10] = u2;
				texcoords[offset + 11] = v2;
	
				x += glyphInfo.width + this.fontInfo.spacing;
				offset += 12;
			} else {
				//Don't have this character so just advance
				x += this.fontInfo.spaceWidth;
			}
		}

		return {
			arrays: {
				position: new Float32Array(positions.buffer, 0, offset),
				texcoord: new Float32Array(texcoords.buffer, 0, offset),
			},
			numVertices: offset / 2,
			width: x,
			height: this.fontInfo.letterHeight,
		};
	}
	/**
	 * Get the size of target text in pixels
	 * @param {String} text target to get the width and height
	 * @returns {Object} x and y for width and height of the texture 
	 * @memberof TextHelper
	 */
	getSize(text){
		if(this.knownStrings[text] === undefined) {
			this.init(text);
		}
		return {x: this.knownStrings[text].width, y: this.knownStrings[text].height};
	}

	/**
	 * Cache the calculation of vertex and uv for this text
	 * @param {String} text target text to initialize
	 * @memberof TextHelper
	 */
	init(text) {
		if(this.knownStrings[text] === undefined){
			this.knownStrings[text] = this.makeVerticesForString(text);
		}
	}

	/**
	 * Draw the text into the canvas
	 * @param {Number} x Target position pixels from the left of the canvas
	 * @param {Number} y Target position pixels from the top of the canvas
	 * @param {Sring} text String of caracters to be rendered
	 * @param {Array} tintColor RGBA vec4 color, with Float32s between 0 and 1
	 * @memberof TextHelper
	 */
	render(x, y, text, tintColor) {
		let gl = this.gl;

		if(!this.knownStrings[text]) {
			this.init(text);
		}
	
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
	
		gl.useProgram(this.shaderProgram);
		gl.bindVertexArray(this.textVertexArray);

		// Pass in the canvas resolution so we can convert from pixels to clipspace in the shader
		gl.uniform2fv(this.uResolutionXY, [gl.canvas.width, gl.canvas.height]);
		//x,y in canvas space where the text should be placed
		gl.uniform2fv(this.inTranslationXY, [x, y]);
		//set tint color
		gl.uniform4fv(this.inColor, tintColor || [1.0, 1.0, 1.0, 1.0]);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, this.knownStrings[text].arrays.position, gl.DYNAMIC_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.textureCoordsBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, this.knownStrings[text].arrays.texcoord, gl.DYNAMIC_DRAW);

		gl.bindTexture(gl.TEXTURE_2D, this.glyphTex);
		gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image);

		// Draw the text
		gl.drawArrays(gl.TRIANGLES, 0, this.knownStrings[text].numVertices);

		gl.disable(gl.BLEND);
	}

	/**
	 * Release WebGL resources used. Invalidates object, should be called before unreferencing.
	 * @memberof TextHelper
	 */
	releaseGL(){
		this.gl.deleteBuffer(this.vertexPositionBuffer);
		this.gl.deleteBuffer(this.textureCoordsBuffer);
		this.gl.deleteTexture(this.glyphTex);
		this.gl.deleteVertexArray(this.textVertexArray);
		this.gl.deleteProgram(this.shaderProgram);
	}
}
