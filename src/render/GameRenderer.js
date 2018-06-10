export default class GameRenderer {

	constructor(gl, shaderHelper){
		this.gl = gl;

		this.shaderProgram = shaderHelper.getProgram();

		this.inObjVertexXY = shaderHelper.locations.POSITION_LOCATION(this.shaderProgram);
		this.inTranslationXY = shaderHelper.locations.TRANSLATE_LOCATION(this.shaderProgram);
		this.inColor = shaderHelper.locations.COLOR_LOCATION(this.shaderProgram);
		this.uResolutionXY = shaderHelper.locations.PROJECTION_LOCATION(this.shaderProgram);
    
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
		this.squareVertexArrayXYCount = squareVertexArray.length / vertexNumTriangles;

		this.squareVertexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.squareVertexBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, squareVertexArray, gl.STATIC_DRAW);

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
	
	update(grid) {

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
		
		const backgrounds = {
			2: {r:0.9333, g: 0.8941, b: 0.8549},
			4: {r:0.9294, g: 0.8784, b: 0.7843},
			8: {r:0.9490, g: 0.6941, b: 0.4745},
			16: {r:0.9607, g: 0.5843, b: 0.3882},
			32: {r:0.9647, g: 0.4862, b: 0.3725},
			//TODO: 64: #f65e3b,
			// 128: #edcf72,
			// 256: #edcc61,
			// 512: #edc850,
			// 1024: #edc53f,
			// 2048: #edc22e,
			// 9000: #3c3a32
		};

// 		var eee4da =  rgb(238, 228, 218);
// ede0c8 rgb(237, 224, 200)
// f2b179 rgb(242, 177, 121)
// f59563 rgb(245, 149, 99)
// f67c5f rgb(246, 124, 95)

// f65e3b rgb(246, 94, 59)
// edcf72 rgb(237, 207, 114)
// edcc61 rgb(237, 204, 97)
// edc850 rgb(237, 200, 80)
// edc53f rgb(237, 197, 63)
// edc22e rgb(237, 194, 46)
// 3c3a32 rgb(60, 58, 50)


		let translations = [];
		let colors = [];
		tileArray.forEach(tile => {
			translations.push(50 + ((tile.x / grid.size) * (this.gl.canvas.width-100)));
			translations.push(50 + ((tile.y / grid.size) * (this.gl.canvas.height-100)));
			let value = tile.value > 2048 ? 9000 : tile.value;
			colors.push(backgrounds[value].r);
			colors.push(backgrounds[value].g);
			colors.push(backgrounds[value].b);
		});

		this.animateScene(new Float32Array(translations), new Float32Array(colors));
	}


	animateScene(translations, colors) {
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
		gl.bufferData(gl.ARRAY_BUFFER, translations, gl.STATIC_DRAW);

		//Set colors buffer as active
		gl.bindBuffer(gl.ARRAY_BUFFER, this.backgroundColorsBuffer);
		//Copy data in
		gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
		
		//Set the square as active
		gl.bindVertexArray(this.squareVertexArray);

		gl.drawArraysInstanced(gl.TRIANGLES, 0, this.squareVertexArrayXYCount, translations.length/2);

		// window.requestAnimationFrame(function(/*currentTime*/) {
		// 	this.animateScene();
		// }.bind(this));
	}

	releaseGL() {
		// -- Delete WebGL resources
		this.gl.deleteProgram(this.shaderProgram);
		this.gl.deleteVertexArray(this.squareVertexArray);
		this.gl.deleteBuffer(this.squareVertexBuffer);
		this.gl.deleteBuffer(this.translationsBuffer);
		this.gl.deleteBuffer(this.backgroundColorsBuffer);
	}
}