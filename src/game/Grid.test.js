import Grid from "./Grid.js";

describe("Grid", function () {
	
	it("should be have cells to match size", function () {
		let grid = new Grid(2);
		expect(grid.cells).to.have.lengthOf(2);
		expect(grid.cells[0]).to.have.lengthOf(2);
		expect(grid.cells[1]).to.have.lengthOf(2);
		let grid2 = new Grid(1, [[
			{
				position: {
					x: 0,
					y: 0,
				},
				value: 2
			}]]);
		expect(grid2.cells).to.have.lengthOf(1);
		expect(grid2.cells[0]).to.have.lengthOf(1);
		
		expect(() => new Grid(1, [
			[{
				position: {
					x: 0,
					y: 0,
				},
				value: 2
			}],
			[{
				position: {
					x: 1,
					y: 2,
				},
				value: 2
			}]
		])).to.throw("Grid size does not match previousState data");
	});

	it("randomAvailableCell finds an empty cell", function () {
		let grid = new Grid(4);			
		expect(grid.randomAvailableCell()).to.have.all.keys("x","y");
	});

	it("randomAvailableCell return null when the grid full", function () {
		let grid = new Grid(1, [[
			{
				position: {
					x: 0,
					y: 0,
				},
				value: 2
			}]]);
		expect(grid.randomAvailableCell()).to.not.exist;
	});
	
	it("randomAvailableCell finds an empty cell", function () {
		let grid = new Grid(4);			
		expect(grid.randomAvailableCell()).to.have.all.keys("x","y");
	});

	it("eachCell callback is called once per cell", function () {
		let grid = new Grid(4);
		let count = 0;
		grid.eachCell(() => count++);
		expect(count).equal(4*4);
	});
	
	it("cellsAvailable with empty cells", function () {
		let grid = new Grid(4);
		expect(grid.cellsAvailable()).to.be.true;
		grid.insertTile({x:0, y:0});
		expect(grid.cellsAvailable()).to.be.true;
	});
	
	it("cellsAvailable without empty cells", function () {
		let grid = new Grid(1);
		grid.insertTile({x:0, y:0});
		expect(grid.cellsAvailable()).to.be.false;
	});

	it("cellAvailable", function () {
		let grid = new Grid(1);
		expect(grid.cellAvailable({x:0, y:0})).to.be.true;
		grid.insertTile({x:0, y:0});
		expect(grid.cellAvailable({x:0, y:0})).to.be.false;
	});

	it("cellOccupied", function () {
		let grid = new Grid(1);
		expect(grid.cellOccupied({x:0, y:0})).to.be.false;
		grid.insertTile({x:0, y:0});
		expect(grid.cellOccupied({x:0, y:0})).to.be.true;
	});
	
	it("insertTile adds object and cellContent gets it", function () {
		let grid = new Grid(1);
		expect(grid.cellContent({x:0, y:0})).not.exist;
		let fakeTile = {x:0, y:0};
		grid.insertTile(fakeTile);
		expect(grid.cellContent({x:0, y:0})).equal(fakeTile);
	});

	it("removeTile removes object", function () {
		let grid = new Grid(1);
		expect(grid.cellContent({x:0, y:0})).not.exist;
		let fakeTile = {x:0, y:0};
		grid.insertTile(fakeTile);
		grid.removeTile({x:0, y:0});
		expect(grid.cellContent({x:0, y:0})).not.exist;
	});

	it("withinBounds", function () {
		let grid = new Grid(10);
		expect(grid.withinBounds({x:5, y:5})).to.be.true;
		expect(grid.withinBounds({x:11, y:1})).to.be.false;
		expect(grid.withinBounds({x:5, y:10})).to.be.false;
		expect(grid.withinBounds({x:11, y:10})).to.be.false;
	});
	
	it("serialize size matches", function () {
		let grid = new Grid(2);
		let serialized = grid.serialize();
		expect(serialized.size).to.be.equal(2);
		expect(serialized.cells).to.have.lengthOf(2);
		expect(serialized.cells[0]).to.have.lengthOf(2);
		expect(serialized.cells[1]).to.have.lengthOf(2);
	});

});