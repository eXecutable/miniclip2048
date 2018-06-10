export default class ShaderHelper {

	constructor(gl) {
		this.gl = gl;
		if(!gl){
			throw "No graphic context passed to shaderHelper";
		}

		this.locations = Object.freeze({
			/**
			 * TODO:
			 */
			POSITION_LOCATION: function() { return 0; },
			/**
			 * TODO:
			 */
			COLOR_LOCATION: function() { return 1; },
			/**
			 * TODO:
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

		this.vertShaderString = `#version 300 es
								#define POSITION_LOCATION 0
								#define COLOR_LOCATION 1
								#define TRANSFORMS_LOCATION 2
								#define SCALE_LOCATION 3

								precision mediump float;

								layout(location = POSITION_LOCATION) in vec2 pos;
								layout(location = COLOR_LOCATION) in vec4 inColor;
								layout(location = TRANSFORMS_LOCATION) in vec2 translate;
								layout(location = SCALE_LOCATION) in vec2 scale;
								
								uniform vec2 projection;

								flat out vec4 fragColor;

								// all shaders have a main function
								void main() {
									fragColor = inColor;
									
									// Add in the translation
									// convert the position from pixels to 0.0 to 1.0
									vec2 position = (pos + translate) / projection;
									// convert from 0->1 to 0->2
									// convert from 0->2 to -1->+1 (clipspace)
									vec2 clipSpace = (position * 2.0) - 1.0;

									gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
								}`;

		this.fragShaderString = `#version 300 es

								precision mediump float;

								flat in vec4 fragColor;
								out vec4 outColor;

								void main() {
									outColor = fragColor;
								}`;

		// this.vertShaderString =  `#version 300 es
		// 						// an attribute is an input (in) to a vertex shader.
		// 						// It will receive data from a buffer
		// 						in vec2 aVertexPosition;
								
		// 						// Used to pass in the resolution of the canvas
		// 						uniform vec2 uResolutionXY;
								
		// 						// translation to add to position
		// 						uniform vec2 uTranslationXY;
								
		// 						void main() {
		// 							// Add in the translation
		// 							vec2 position = aVertexPosition + uTranslationXY;
								
		// 							// convert the position from pixels to 0.0 to 1.0
		// 							vec2 zeroToOne = position / uResolutionXY;
								
		// 							// convert from 0->1 to 0->2
		// 							vec2 zeroToTwo = zeroToOne * 2.0;
								
		// 							// convert from 0->2 to -1->+1 (clipspace)
		// 							vec2 clipSpace = zeroToTwo - 1.0;
								
		// 							gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
		// 						}`;

		// this.squareShaderString =  `#version 300 es
		// 						// an attribute is an input (in) to a vertex shader.
		// 						// It will receive data from a buffer
		// 						uniform vec2 aVertexPosition;
								
		// 						// Used to pass in the resolution of the canvas
		// 						uniform vec2 uResolutionXY;
								
		// 						// translation to add to position
		// 						in vec2 uTranslationXY;
								
		// 						void main() {
		// 							// Add in the translation
		// 							vec2 position = aVertexPosition + uTranslationXY;
								
		// 							// convert the position from pixels to 0.0 to 1.0
		// 							vec2 zeroToOne = position / uResolutionXY;
								
		// 							// convert from 0->1 to 0->2
		// 							vec2 zeroToTwo = zeroToOne * 2.0;
								
		// 							// convert from 0->2 to -1->+1 (clipspace)
		// 							vec2 clipSpace = zeroToTwo - 1.0;
								
		// 							gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
		// 						}`;

		// this.fragShaderString = `#version 300 es
		// 						precision mediump float;
								
		// 						uniform vec4 uGlobalColor;
								
		// 						out vec4 outColor;
								
		// 						void main() {
		// 							outColor = uGlobalColor;
		// 						}`;
	}

	/**
	 * @returns the program with the standard shaders
	 * @memberof shaderHelper
	 */
	getProgram() {
		return this.createProgramFromSources(this.gl, [this.vertShaderString,this.fragShaderString], null, null);
	}
  

	/**
   * Loads a shader.
   * @param {WebGLRenderingContext} gl The WebGLRenderingContext to use.
   * @param {string} shaderSource The shader source.
   * @param {number} shaderType The type of shader.
   * @return {WebGLShader} The created shader.
   * @memberof shaderHelper
   */
	loadShader(gl, shaderSource, shaderType) {
		// Create the shader object
		let shader = gl.createShader(shaderType);
		// Load the shader source
		gl.shaderSource(shader, shaderSource);
		// Compile the shader
		gl.compileShader(shader);

		// Check the compile status
		let compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
		if (!compiled) {
			// Something went wrong during compilation; get the error
			let lastError = gl.getShaderInfoLog(shader);
			gl.deleteShader(shader);
			console.error("*** Error compiling shader '" + shader + "':" + lastError);
			return null;
		}
		return shader;
	}

	/**
   * Creates a program, attaches shaders, binds attrib locations, links the
   * program and calls useProgram.
   * @param {WebGLShader[]} shaders The shaders to attach
   * @param {string[]} [opt_attribs] An array of attribs names. Locations will be assigned by index if not passed in
   * @param {number[]} [opt_locations] The locations for the. A parallel array to opt_attribs letting you assign locations.
   * @returns {WebGLProgram} The program created with the shaders.
   * @memberof shaderHelper
   */
	createProgram(gl, shaders) {
		let program = gl.createProgram();
		shaders.forEach(function(shader) {
			gl.attachShader(program, shader);
		});
		gl.linkProgram(program);

		// Check the link status
		let linked = gl.getProgramParameter(program, gl.LINK_STATUS);
		if (!linked) {
			// something went wrong with the link
			let lastError = gl.getProgramInfoLog(program);
			console.error("Error in program linking:" + lastError);
			gl.deleteProgram(program);
			return null;
		}
		return program;
	}

	/**
   * Creates a program from 2 sources.
   *
   * @param {WebGLRenderingContext} gl The WebGLRenderingContext
   *        to use.
   * @param {string[]} shaderSourcess Array of sources for the
   *        shaders. The first is assumed to be the vertex shader,
   *        the second the fragment shader.
   * @param {string[]} [opt_attribs] An array of attribs names. Locations will be assigned by index if not passed in
   * @param {number[]} [opt_locations] The locations for the. A parallel array to opt_attribs letting you assign locations.
   * @return {WebGLProgram} The created program.
   * @memberof shaderHelper
   */
	createProgramFromSources(gl, shaderSources, opt_attribs, opt_locations) {
		const defaultShaderType = [
			"VERTEX_SHADER",
			"FRAGMENT_SHADER",
		];
		let shaders = [];
		for (let i = 0; i < shaderSources.length; ++i) {
			shaders.push(this.loadShader(gl, shaderSources[i], gl[defaultShaderType[i]]));
		}
		return this.createProgram(gl, shaders, opt_attribs, opt_locations);
	}

	/**
   * Resize a canvas to match the size its displayed.
   * @param {HTMLCanvasElement} canvas The canvas to resize.
   * @param {number} [multiplier] amount to multiply by.
   *    Pass in window.devicePixelRatio for native pixels.
   * @return {boolean} true if the canvas was resized.
   * @memberof shaderHelper
   */
	resizeCanvasToDisplaySize(canvas, multiplier) {
		multiplier = multiplier || 1;
		var width  = canvas.clientWidth  * multiplier | 0;
		var height = canvas.clientHeight * multiplier | 0;
		if (canvas.width !== width ||  canvas.height !== height) {
			canvas.width  = width;
			canvas.height = height;
			return true;
		}
		return false;
	}

}