import ShaderHelper from "./ShaderHelper";

export default class SquareTextureHelper {

	/**
	 * Creates an instance of SquareTextureHelper.
	 * @param {WebGLRenderingContext} gl
	 * @param {RenderManager} renderManager
	 * @param {String} imageSrc path to the image to use
	 * @memberof SquareTextureHelper
	 */
	constructor(gl, renderManager, imageSrc) {
		this.gl = gl;
		if (!gl) {
			throw "No graphic context passed to SquareTextureHelper";
		} 
		if (!imageSrc) {
			throw "No imageSrc to SquareTextureHelper";
		}
		this.loaded = false;

		this.locations = Object.freeze({
			/**
			 * Returns the location of the vertex in buffer
			 * @returns {Integer} The location
			 */
			POSITION_LOCATION: function() { return 0; },
			/**
			 * Returns the location of the translation position uniform
			 * @returns {Integer} The location
			 */
			TRANSLATE_LOCATION: function(program) {
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
			 * Returns the location of the texture coordenates in buffer
			 * @returns {Integer} The location
			 */
			TEXT_COORDS_LOCATION: function() { return 4; },
			/**
			 * Returns the location of the texture
			 * @param {WebGLProgram} program the instance to find in
			 * @returns {Integer} The location
			 */
			TEXTURE_LOCATION: function(program) {
				return gl.getUniformLocation(program, "sourceTexture");
			},
		});

		this.vertShaderString = `#version 300 es
								#define POSITION_LOCATION 0
								#define TEXT_COORDS_LOCATION 4

								precision mediump float;

								layout(location = POSITION_LOCATION) in vec2 pos;
								layout(location = TEXT_COORDS_LOCATION) in vec2 inTexcoord;

								uniform vec2 translate;
								uniform vec2 projection;

								out vec2 fragTexcoord;

								// all shaders have a main function
								void main() {
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

								in vec2 fragTexcoord;
								uniform sampler2D sourceTexture;

								out vec4 outColor;

								void main() {
									outColor = texture(sourceTexture, fragTexcoord);
								}`;
		this.shaderProgram = ShaderHelper.createProgramFromSources(gl, [this.vertShaderString,this.fragShaderString]);
		
		this.inObjVertexXY = this.locations.POSITION_LOCATION(this.shaderProgram);
		this.textureCoordenatesUV = this.locations.TEXT_COORDS_LOCATION(this.shaderProgram);
		this.inTranslationXY = this.locations.TRANSLATE_LOCATION(this.shaderProgram);
		this.uResolutionXY = this.locations.PROJECTION_LOCATION(this.shaderProgram);
		this.uTextureSampler  = this.locations.TEXTURE_LOCATION(this.shaderProgram);

		// -- Init Vertex Array
		this.VAO = gl.createVertexArray();
		gl.bindVertexArray(this.VAO);

		this.vertexPositionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionBuffer);
		gl.enableVertexAttribArray(this.inObjVertexXY);
		gl.vertexAttribPointer(this.inObjVertexXY, 2, gl.FLOAT, false, 0, 0);

		this.textureCoordsBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.textureCoordsBuffer);

		// //Square 4 distinct vertexes, 2 triangles with 2 shared vertices
		let fullTextureCoordenates = new Float32Array([
			0, 1, 
			1, 1,  
			1, 0,

			0, 1, 
			1, 0, 
			0, 0
		]);
		gl.bufferData(gl.ARRAY_BUFFER, fullTextureCoordenates, gl.STATIC_DRAW);
		gl.enableVertexAttribArray(this.textureCoordenatesUV);
		gl.vertexAttribPointer(this.textureCoordenatesUV, 2, gl.FLOAT, false, 0, 0);

		this.textureUnit = renderManager.getNextTextureUnit();
		this.texture = gl.createTexture();
		gl.activeTexture(gl.TEXTURE0 + this.textureUnit);
		gl.bindTexture(gl.TEXTURE_2D, this.texture);
		// Fill the texture with a 1x1 pixel, to use as a no crash fallback while loading the image
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 255, 0, 255]));
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);//Remove mip maps, go nearest since we are aiming for pixel perfect
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		//Asynchronously load an image
		this.image = new Image();
		this.image.addEventListener("load", () => {
			if (this.image.naturalWidth === 0) {
				console.error( this.image.src + " image failed to load.");
				return;
			}

			gl.activeTexture(gl.TEXTURE0 + this.textureUnit);
			gl.bindTexture(gl.TEXTURE_2D, this.texture);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image);

			//Square 4 distinct vertexes, 2 triangles with 2 shared vertices
			let squareVertexArr = new Float32Array([
				0, -this.image.naturalHeight, 
				this.image.naturalWidth,  -this.image.naturalHeight,  
				this.image.naturalWidth, 0,

				0, -this.image.naturalHeight, 
				this.image.naturalWidth, 0, 
				0, 0
			]);
			gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, squareVertexArr, gl.STATIC_DRAW);

			this.loaded = true;
		});
		this.image.src = imageSrc;
	}

	/**
	 * Query if the image is loaded.
	 * @return {Boolean} true if it's ready to render
	 * @memberof SquareTextureHelper
	 */
	isLoaded(){
		return this.loaded;
	}

	render(x, y) {
		let gl = this.gl;
	
		gl.useProgram(this.shaderProgram);
		gl.bindVertexArray(this.VAO);

		// Pass in the canvas resolution so we can convert from pixels to clipspace in the shader
		gl.uniform2fv(this.uResolutionXY, [gl.canvas.width, gl.canvas.height]);
		//x,y in canvas space where the text should be placed
		gl.uniform2fv(this.inTranslationXY, [x, y]);
		//set texture unit to sampler
		gl.uniform1i(this.uTextureSampler, this.textureUnit);

		gl.activeTexture(gl.TEXTURE0 + this.textureUnit);
		gl.bindTexture(gl.TEXTURE_2D, this.texture);

		gl.drawArrays(gl.TRIANGLES, 0, 6);
	}

	/**
	 * Release WebGL resources used. Invalidates object, should be called before unreferencing.
	 * @memberof SquareTextureHelper
	 */
	releaseGL(){

		this.gl.deleteBuffer(this.vertexPositionBuffer);
		this.gl.deleteBuffer(this.textureCoordsBuffer);
		this.gl.deleteTexture(this.texture);
		this.gl.deleteVertexArray(this.VAO);
		this.gl.deleteProgram(this.shaderProgram);
	}
}