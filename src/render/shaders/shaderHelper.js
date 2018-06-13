export default class ShaderHelper {

	constructor() {}

	/**
	 * Loads a shader.
	 * @param {WebGLRenderingContext} gl The WebGLRenderingContext to use.
	 * @param {string} shaderSource The shader source.
	 * @param {number} shaderType The type of shader.
	 * @return {WebGLShader} The created shader.
	 * @memberof ShaderHelper
	 */
	static loadShader(gl, shaderSource, shaderType) {
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
	 * @returns {WebGLProgram} The program created with the shaders.
	 * @memberof ShaderHelper
	 */
	static createProgram(gl, shaders) {
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
   * @return {WebGLProgram} The created program.
   * @memberof ShaderHelper
   */
	static createProgramFromSources(gl, shaderSources) {
		const defaultShaderType = [
			"VERTEX_SHADER",
			"FRAGMENT_SHADER",
		];
		let shaders = [];
		for (let i = 0; i < shaderSources.length; ++i) {
			shaders.push(this.loadShader(gl, shaderSources[i], gl[defaultShaderType[i]]));
		}
		return this.createProgram(gl, shaders);
	}

}