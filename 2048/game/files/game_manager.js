function GameManager(size, InputManager, Actuator, ScoreManager, id, mainlines, cores, op, metadata, Saver) {
  this.size         = size; // Size of the grid
  this.inputManager = new InputManager;
  scoreManager = ScoreManager;
  this.actuator     = new Actuator (id);
  this.saver = Saver;
  this.id = id;

  this.startTiles   = mainlines + 1 - (op == 1);

  this.inputManager.on("move", this.move.bind(this));
  this.inputManager.on("restart", this.restart.bind(this));
  this.inputManager.on("keepPlaying", this.keepPlaying.bind(this));

  console.log (id);
  if (metadata === '') console.log('setup'), this.setup();
  else console.log('load'),this.load (metadata);
  console.log (id,'end');
}

// Restart the game
GameManager.prototype.restart = function () {
  this.actuator.continue(true);
  this.setup();
};

// Keep playing after winning
GameManager.prototype.keepPlaying = function () {
  this.keepPlaying = true;
  this.actuator.continue();
};

GameManager.prototype.isGameTerminated = function () {
  if (this.over || (this.won && !this.keepPlaying)) {
    return true;
  } else {
    return false;
  }
};

// Set up the game
GameManager.prototype.setup = function () {
  console.log ('setting up');
  this.grid        = new Grid(this.size);
  score  = 0n;
  this.over        = false;
  this.won         = false;
  this.keepPlaying = false;
console.log ('stt');
  // Add the initial tiles
  this.addStartTiles();
console.log ('ssstp');
  // Update the actuator
  this.actuate(true);
  console.log ('ste up down');
};

var MyTileTypes = ['operator', 'number', 'a', 'b', 'c', 'd'];

// Set up the initial tiles to start the game with
GameManager.prototype.addStartTiles = function () {
  var tile;
  for (var i = (op == 1); i < this.startTiles; i++) {
    if (this.grid.cellsAvailable()) {
      let type = MyTileTypes[i % MyTileTypes.length];
      tile = new Tile(this.grid.randomAvailableCell(), (type == 'operator' && op == 4 ? -2 : 2), type);
      this.grid.insertTile(tile);
    }
  }
  if (scoreManager.get ('largest') < 2) scoreManager.set ('largest', 2);
  if (scoreManager.get ('smallest') > 2) scoreManager.set ('smallest', 2);
};

// Adds a tile in a random position
GameManager.prototype.addRandomTile = function () {
  if (this.grid.cellsAvailable()) {
    var type = Math.random() < 0.9 ? 'number' : 'operator';
    if (op == 1) type = 'number';
    if (type == 'number' && Math.random () > 0.8) {
      var ran = Math.random ();
      var division = 1.0 / (mainlines - 1);
      for (var i = 1; i < mainlines; i++) if (ran <= division * i) {type = MyTileTypes[i + 1]; break;}
    }
    var rd = Math.random();
    var value  = null;
    if (op == 1) value = (rd < 0.4 ? 1 : (rd < 0.75 ? 2 : 0));
    else if (op == 3) value = (type != 'operator' ? (rd < 0.4 ? 1 : (rd < 0.75 ? 2 : 0)) : (rd < 0.4 ? 1 : (rd < 0.7 ? -1 : (rd < 0.85 ? 2 : (rd < 0.95 ? -2 : (rd < 0.99 ? 3 : -3))))));
    else if (op == 2) value = (type != 'operator' ? (rd < 0.4 ? 1 : (rd < 0.75 ? 2 : 0)) : (rd < 0.7 ? 1 : (rd < 0.95 ? 2 : 3)));
    else if (op == 4) value = (type != 'operator' ? (rd < 0.4 ? 1 : (rd < 0.75 ? 2 : 0)) : (rd < 0.7 ? -1 : (rd < 0.95 ? -2 : -3)));
    if (type != 'operator') {
      if (scoreManager.get ('largest') < value) scoreManager.set ('largest', value);
      if (scoreManager.get ('smallest') > value) scoreManager.set ('smallest', value);
    }
    var tile = new Tile(this.grid.randomAvailableCell(), value, type);
    this.grid.insertTile(tile);
  }
};

// Sends the updated grid to the actuator
GameManager.prototype.actuate = function (settedup = false) {
  if (scoreManager.get('best') < score) scoreManager.set('best', score);
  if (scoreManager.get('worst') > score) scoreManager.set('worst', score);

  this.actuator.actuate(this.grid, {
    score:      score,
    over:       this.over,  
    won:        this.won,
    bestScore:  BigInt (scoreManager.get('best')),
    worstScore: BigInt (scoreManager.get('worst')),
    largestScore: BigInt (scoreManager.get('largest')),
    smallestScore: BigInt (scoreManager.get('smallest')),
    terminated: this.isGameTerminated()
  });

  if (!settedup) this.saver ();
};

// Save all tile positions and remove merger info
GameManager.prototype.prepareTiles = function () {
  this.grid.eachCell(function (x, y, tile) {
    if (tile) {
      tile.mergedFrom = null;
      tile.savePosition();
    }
  });
};

// Move a tile and its representation
GameManager.prototype.moveTile = function (tile, cell) {
  this.grid.cells[tile.x][tile.y] = null;
  this.grid.cells[cell.x][cell.y] = tile;
  tile.updatePosition(cell);
};

// Move tiles on the grid in the specified direction
GameManager.prototype.move = function (direction) {
  // 0: up, 1: right, 2:down, 3: left
  var self = this;

  if (this.isGameTerminated()) return; // Don't do anything if the game's over

  var cell, tile;

  var vector     = this.getVector(direction);
  var traversals = this.buildTraversals(vector);
  var moved      = false;

  // Save the current tile positions and remove merger information
  this.prepareTiles();

  // Traverse the grid in the right direction and move tiles
  traversals.x.forEach(function (x) {
    traversals.y.forEach(function (y) {
      cell = { x: x, y: y };
      tile = self.grid.cellContent(cell);

      if (tile) {
        var positions = self.findFarthestPosition(cell, vector);
        var next      = self.grid.cellContent(positions.next);

        // Only one merger per row traversal?
        if (next && (next.type === 'operator' || tile.type === 'operator' || next.type === tile.type && next.value === tile.value) && !next.mergedFrom) {
          var value, type = (tile.type === 'operator' ? next.type : tile.type);
          if (next.type === 'operator' || tile.type === 'operator') {
            value = tile.value + next.value;
            if (next.type === 'operator' && tile.type === 'operator') {
              type = 'operator';
            }
          } else {
            value = tile.value + 1;
          }
          var merged = new Tile(positions.next, value, type);
          merged.mergedFrom = [tile, next];

          self.grid.insertTile(merged);
          self.grid.removeTile(tile);

          // Converge the two tiles' positions
          tile.updatePosition(positions.next);

          // Update the score
          if (merged.value >= 0n) score += 2n ** BigInt (merged.value);
          else score -= 2n ** BigInt (-merged.value);

          // Update largest / smallest
          if (merged.type != 'operator') {
            if (scoreManager.get ('largest') < merged.value) scoreManager.set ('largest', merged.value);
            if (scoreManager.get ('smallest') > merged.value) scoreManager.set ('smallest', merged.value);
          }
        } else {
          self.moveTile(tile, positions.farthest);
        }

        if (!self.positionsEqual(cell, tile)) {
          moved = true; // The tile moved from its original cell!
        }
      }
    });
  });

  if (moved) {
    for (let i = 1; i <= cores; i++) this.addRandomTile();

    if (!this.movesAvailable()) {
      this.over = true; // Game over!
    }

    this.actuate();
  }
};

// Get the vector representing the chosen direction
GameManager.prototype.getVector = function (direction) {
  // Vectors representing tile movement
  var map = {
    0: { x: 0,  y: -1 }, // up
    1: { x: 1,  y: 0 },  // right
    2: { x: 0,  y: 1 },  // down
    3: { x: -1, y: 0 }   // left
  };

  return map[direction];
};

// Build a list of positions to traverse in the right order
GameManager.prototype.buildTraversals = function (vector) {
  var traversals = { x: [], y: [] };

  for (var pos = 0; pos < this.size; pos++) {
    traversals.x.push(pos);
    traversals.y.push(pos);
  }

  // Always traverse from the farthest cell in the chosen direction
  if (vector.x === 1) traversals.x = traversals.x.reverse();
  if (vector.y === 1) traversals.y = traversals.y.reverse();

  return traversals;
};

GameManager.prototype.findFarthestPosition = function (cell, vector) {
  var previous;

  // Progress towards the vector direction until an obstacle is found
  do {
    previous = cell;
    cell     = { x: previous.x + vector.x, y: previous.y + vector.y };
  } while (this.grid.withinBounds(cell) &&
           this.grid.cellAvailable(cell));

  return {
    farthest: previous,
    next: cell // Used to check if a merge is required
  };
};

GameManager.prototype.movesAvailable = function () {
  return this.grid.cellsAvailable() || this.tileMatchesAvailable();
};

// Check for available matches between tiles (more expensive check)
GameManager.prototype.tileMatchesAvailable = function () {
  var self = this;

  var tile;

  for (var x = 0; x < this.size; x++) {
    for (var y = 0; y < this.size; y++) {
      tile = this.grid.cellContent({ x: x, y: y });

      if (tile) {
        for (var direction = 0; direction < 4; direction++) {
          var vector = self.getVector(direction);
          var cell   = { x: x + vector.x, y: y + vector.y };

          var other  = self.grid.cellContent(cell);

          if (other && (other.type === 'operator' || tile.type === 'operator' || other.type === tile.type && other.value === tile.value)) {
            return true; // These two tiles can be merged
          }
        }
      }
    }
  }

  return false;
};

GameManager.prototype.positionsEqual = function (first, second) {
  return first.x === second.x && first.y === second.y;
};

GameManager.prototype.load = function (data) {
  this.grid = new Grid (this.size);
  for (var i = 0; i < this.size; i++)
    for (var j = 0; j < this.size; j++)
      if (data[i][j] != null) {
        var tile = data[i][j];
        this.grid.insertTile (new Tile ({
          x: tile.x,
          y: tile.y,
        }, tile.value, tile.type));
      }
  if (!this.movesAvailable ()) this.over = true;
  this.actuate (true);
};

GameManager.prototype.save = function () {
  return this.grid.getGrid ();
};