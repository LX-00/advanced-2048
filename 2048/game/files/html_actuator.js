function HTMLActuator(id) {
  this.tileContainer     = document.querySelectorAll(".tile-container")[id];
  this.scoreContainer    = document.querySelector(".score-container");
  this.bestContainer     = document.querySelector(".best-container");
  this.worstContainer    = document.querySelector(".worst-container");
  this.largestContainer  = document.querySelector(".largest-container");
  this.smallestContainer = document.querySelector(".smallest-container");
  this.messageContainer  = document.querySelectorAll(".game-message")[id];

  this.score = 0n;
}

HTMLActuator.prototype.actuate = function (grid, metadata) {
  var self = this;

  window.requestAnimationFrame(function () {
    self.clearContainer(self.tileContainer);

    grid.cells.forEach(function (column) {
      column.forEach(function (cell) {
        if (cell) {
          self.addTile(cell);
        }
      });
    });

    self.updateScore(metadata.score);
    self.updateBestScore(metadata.bestScore);
    self.updateWorstScore(metadata.worstScore);
    self.updateLargestScore(metadata.largestScore);
    self.updateSmallestScore(metadata.smallestScore);

    if (metadata.terminated) {
      if (metadata.over) {
        self.message(false); // You lose
      } else if (metadata.won) {
        self.message(true); // You win!
      }
    }

  });
};

// Continues the game (both restart and keep playing)
HTMLActuator.prototype.continue = function (restart) {
  if (typeof ga !== "undefined") {
    ga("send", "event", window.gameName || "game", restart ? "restart" : "keep playing");
  }
  this.clearMessage();
};

HTMLActuator.prototype.clearContainer = function (container) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
};

HTMLActuator.prototype.addTile = function (tile) {
  var self = this;

  var wrapper   = document.createElement("div");
  var inner     = document.createElement("div");
  var position  = tile.previousPosition || { x: tile.x, y: tile.y };
  var positionClass = this.positionClass(position);

  // We can't use classlist because it somehow glitches when replacing classes
  var classes = ["tile", "tile-" + (tile.value >= 0n ? tile.value : -tile.value), positionClass];
  var value = tile.value;

  if (value > 11 || value < -11) classes.push("tile-super");

  this.applyClasses(wrapper, classes);

  inner.classList.add("tile-inner");
  inner.textContent = tile.type === 'number' ? value : ((tile.type === 'operator' ? (value >= 0 ? '+=' + value : '-=' + (-value)) : tile.type + value));

  if (tile.previousPosition) {
    // Make sure that the tile gets rendered in the previous position first
    window.requestAnimationFrame(function () {
      classes[2] = self.positionClass({ x: tile.x, y: tile.y });
      self.applyClasses(wrapper, classes); // Update the position
    });
  } else if (tile.mergedFrom) {
    classes.push("tile-merged");
    this.applyClasses(wrapper, classes);

    // Render the tiles that merged
    tile.mergedFrom.forEach(function (merged) {
      self.addTile(merged);
    });
  } else {
    classes.push("tile-new");
    this.applyClasses(wrapper, classes);
  }

  // Add the inner part of the tile to the wrapper
  wrapper.appendChild(inner);

  // Put the tile on the board
  this.tileContainer.appendChild(wrapper);
};

HTMLActuator.prototype.applyClasses = function (element, classes) {
  element.setAttribute("class", classes.join(" "));
};

HTMLActuator.prototype.normalizePosition = function (position) {
  return { x: position.x + 1, y: position.y + 1 };
};

HTMLActuator.prototype.positionClass = function (position) {
  position = this.normalizePosition(position);
  return "tile-position-" + position.x + "-" + position.y;
};

function changestyle (_score) {
  var flg = "";
  if (_score < 0) flg = "-", _score *= -1n;
  function cha (s) {
    if (s >= 100n) return s;
    if (s >= 10n) return '0' + s;
    return '00' + s;
  }
  var show = "";
  var Intscore = _score;
  if (Intscore == 0n) show = "0";
  while (1) {
    if (Intscore == 0n) break;
    if (show != "") show = "," + show;
    if (Intscore / 1000n != 0) 
    show = cha (Intscore % 1000n) + show;
    else show = (Intscore % 1000n) + show;
    Intscore = Intscore / 1000n;
  }
  return flg + show;
}

HTMLActuator.prototype.updateScore = function (_score) {
  this.clearContainer(this.scoreContainer);

  var difference = _score - this.score;
  this.score = _score;

  this.scoreContainer.textContent = changestyle (_score);
  if (difference != 0n) {
    var addition = document.createElement("div");
    addition.classList.add("score-addition");
    if (difference > 0n) addition.textContent = "+" + changestyle (difference);
    else addition.textContent = changestyle (-difference);
    this.scoreContainer.appendChild(addition);
  }
};

HTMLActuator.prototype.updateBestScore = function (bestScore) {
  this.bestContainer.textContent = changestyle (bestScore);
};

HTMLActuator.prototype.updateWorstScore = function (worstScore) {
  this.worstContainer.textContent = changestyle (worstScore);
};

HTMLActuator.prototype.updateLargestScore = function (largestScore) {
  this.largestContainer.textContent = changestyle (largestScore);
};

HTMLActuator.prototype.updateSmallestScore = function (smallestScore) {
  this.smallestContainer.textContent = changestyle (smallestScore);
};

HTMLActuator.prototype.message = function (won) {
  var type    = won ? "game-won" : "game-over";
  var message = won ? "You win!" : "Game over!";
  if (typeof ga !== "undefined") {
    ga("send", "event", window.gameName || "game", "end", type, this.score);
  }

  this.messageContainer.classList.add(type);
  this.messageContainer.getElementsByTagName("p")[0].textContent = message;
};

HTMLActuator.prototype.clearMessage = function () {
  // IE only takes one value to remove at a time.
  this.messageContainer.classList.remove("game-won");
  this.messageContainer.classList.remove("game-over");
};