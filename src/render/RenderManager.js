import shaderHelper from "./shaders/shaderHelper.js";

export default class RenderManager {

	constructor(){
		let gl = document.getElementById("canvas").getContext("webgl2");
		if (!gl) {
			throw "Webgl2 not found.";
		}
		this.gl = gl;

		this.shaderProgram = (new shaderHelper(gl)).getProgram();

		this.uResolutionXY = gl.getUniformLocation(this.shaderProgram, "uResolutionXY");
		this.uTranslationXY = gl.getUniformLocation(this.shaderProgram, "uTranslationXY");
		this.uGlobalColor = gl.getUniformLocation(this.shaderProgram, "uGlobalColor");
    
		// -- Init Vertex Array
		this.squareVertexArray = gl.createVertexArray();
		gl.bindVertexArray(this.squareVertexArray);

		// -- Init Buffers
		//Square 4 distinct vertexes, 2 triangles with 2 shared vertices
		let squareVertexArray = new Float32Array([
			-10, 10, 
			10,  10,  
			10, -10,

			-10, 10, 
			10, -10, 
			-10, -10
		]);
		let vertexNumTriangles = 2;
		this.squareVertexArrayTrianglesCount = squareVertexArray.length / vertexNumTriangles;

		this.squareVertexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.squareVertexBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, squareVertexArray, gl.STATIC_DRAW);

		let aVertexPosition = gl.getAttribLocation(this.shaderProgram, "aVertexPosition");
		gl.enableVertexAttribArray(aVertexPosition);
		gl.vertexAttribPointer(aVertexPosition, vertexNumTriangles, gl.FLOAT, false, 0, 0);
		gl.bindVertexArray(null);

	}
	
	update(grid) {

		let tileArray = [];

		for (let indexCol = 0; indexCol < grid.cells.length; indexCol++) {
			const column = grid.cells[indexCol];
			for (let indexRow = 0; indexRow < column.length; indexRow++) {
				const tile = column[indexRow];
				if (tile) {
					tileArray.push({
						x: tile.x / grid.cells.length,
						y: tile.y / column.length
					});
					
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
		
		this.animateScene(tileArray);
	}


	animateScene(tileArray) {
		let gl = this.gl;

		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
		gl.clearColor(0.8, 0.9, 1.0, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT);

		gl.useProgram(this.shaderProgram);

		//TODO: list all square positions & colors
		//gl.vertexAttribPointer(this.uTranslationXY, 3, gl.FLOAT, false, 0, 0);
		//gl.vertexAttribDivisor(this.uTranslationXY, 1); // attribute used once per instance
		
		//Set the square as active
		gl.bindVertexArray(this.squareVertexArray);

		// Pass in the canvas resolution so we can convert from pixels to clipspace in the shader
		gl.uniform2fv(this.uResolutionXY, [gl.canvas.width, gl.canvas.height]);
		gl.uniform4fv(this.uGlobalColor, [0.5, 0.2, 0.2, 1.0]);

		
		tileArray.forEach(tile => {
			gl.uniform2fv(this.uTranslationXY, [50 + (tile.x * (gl.canvas.width-100)), 50 + (tile.y * (gl.canvas.height-100))]); //TODO: set position

			//gl.drawArraysInstanced(gl.TRIANGLES, 0, this.squareVertexArrayTrianglesCount, 2);
			gl.drawArrays(gl.TRIANGLES, 0, this.squareVertexArrayTrianglesCount);
		});


		// window.requestAnimationFrame(function(/*currentTime*/) {
		// 	this.animateScene();
		// }.bind(this));
	}

	releaseGL() {
		// -- Delete WebGL resources
		this.gl.deleteProgram(this.shaderProgram);
		this.gl.deleteVertexArray(this.squareVertexArray);
		this.gl.deleteBuffer(this.squareVertexBuffer);
	}
}