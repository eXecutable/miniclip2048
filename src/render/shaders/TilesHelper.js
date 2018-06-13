import ShaderHelper from "./ShaderHelper";

export default class TilesHelper {

	constructor(gl) {
		this.gl = gl;
		if(!gl){
			throw "No graphic context passed to TextHelper";
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

									gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
								}`;

		this.fragShaderString = `#version 300 es

								precision mediump float;

								flat in vec4 fragColor;
								out vec4 outColor;

								void main() {
									outColor = fragColor;
								}`;
		this.shaderProgram = ShaderHelper.createProgramFromSources(gl, [this.vertShaderString,this.fragShaderString]);
	}
}