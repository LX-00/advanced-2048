function KeyboardInputManager() {
    this.events = {},
    this.listen()
}
function LocalDataManager() {
    this.key = {};
    this.key['best'] = (window.gameName || "") + "-bestScore";
    this.key['worst'] = (window.gameName || "") + "-worstScore";
    this.key['smallest'] = (window.gameName || "") + "-smallestTile";
    this.key['largest'] = (window.gameName || "") + "-largestTile";
    this.key['save'] = (window.gameName || "") + "-save";
    this.basevalue = {
        'best' : 0n,
        'worst' : 0n,
        'largest' : 2n,
        'smallest' : 2n,
        'save' : '',
    };
    var a = this.localStorageSupported();
    this.storage = a ? window.localStorage : window.fakeStorage
}
function Grid(a) {
    this.size = a,
    this.cells = [],
    this.build()
}
function Tile(a, b, c) {
    this.x = a.x,
    this.y = a.y,
    this.value = b,
    this.type = c,
    this.previousPosition = null,
    this.mergedFrom = null
}
!function() {
    for (var a = 0, b = ["webkit", "moz"], c = 0; c < b.length && !window.requestAnimationFrame; ++c)
        window.requestAnimationFrame = window[b[c] + "RequestAnimationFrame"],
        window.cancelAnimationFrame = window[b[c] + "CancelAnimationFrame"] || window[b[c] + "CancelRequestAnimationFrame"];
    window.requestAnimationFrame || (window.requestAnimationFrame = function(b) {
        var d = (new Date).getTime()
          , e = Math.max(0, 16 - (d - a))
          , f = window.setTimeout(function() {
            b(d + e)
        }, e);
        return a = d + e,
        f
    }
    ),
    window.cancelAnimationFrame || (window.cancelAnimationFrame = function(a) {
        clearTimeout(a)
    }
    )
}(),
KeyboardInputManager.prototype.on = function(a, b) {
    this.events[a] || (this.events[a] = []),
    this.events[a].push(b)
}
,
KeyboardInputManager.prototype.emit = function(a, b) {
    var c = this.events[a];
    c && c.forEach(function(a) {
        a(b)
    })
}
,
KeyboardInputManager.prototype.listen = function() {
    var a = this
      , b = {
        //direction
        38: 0,
        39: 1,
        40: 2,
        37: 3,
        //iklj
        73: 0,
        76: 1,
        75: 2,
        74: 3,
        //thgf
        84: 0,
        72: 1,
        71: 2,
        70: 3,
        //wsda
        87: 0,
        68: 1,
        83: 2,
        65: 3
    };
    document.addEventListener("keydown", function(c) {
        var d = c.altKey || c.ctrlKey || c.metaKey || c.shiftKey
          , e = b[c.which];
        d || (void 0 !== e && (c.preventDefault(),
        a.emit("move", e)),
        32 === c.which && a.restart.bind(a)(c))
    });
    var myc = document.querySelectorAll(".retry-button");
    for (var c of myc)
        c.addEventListener("click", this.restart.bind(this));
    var myd = document.querySelectorAll(".keep-playing-button");
    for (var d of myd)
        d.addEventListener("click", this.keepPlaying.bind(this));

    //swipe
    var touchStartClientX, touchStartClientY;
    var gameContainer = document.querySelector(".game-body");

    gameContainer.addEventListener("touchstart", function (event) {
        if (event.touches.length > 1) return;

        touchStartClientX = event.touches[0].clientX;
        touchStartClientY = event.touches[0].clientY;
        event.preventDefault();
    });

    gameContainer.addEventListener("touchmove", function (event) {
        event.preventDefault();
    });

    gameContainer.addEventListener("touchend", function (event) {
        if (event.touches.length > 0) return;

        var dx = event.changedTouches[0].clientX - touchStartClientX;
        var absDx = Math.abs(dx);

        var dy = event.changedTouches[0].clientY - touchStartClientY;
        var absDy = Math.abs(dy);

        if (Math.max(absDx, absDy) > 10) {
        // (right : left) : (down : up)
        a.emit("move", absDx > absDy ? (dx > 0 ? 1 : 3) : (dy > 0 ? 2 : 0));
        }
    });
}
,
KeyboardInputManager.prototype.restart = function(a) {
    a.preventDefault(),
    this.emit("restart")
}
KeyboardInputManager.prototype.keepPlaying = function(a) {
    a.preventDefault(),
    this.emit("keepPlaying")
}
,
window.fakeStorage = {
    _data: {},
    setItem: function(a, b) {
        return this._data[a] = String(b)
    },
    getItem: function(a) {
        return this._data.hasOwnProperty(a) ? this._data[a] : void 0
    },
    removeItem: function(a) {
        return delete this._data[a]
    },
    clear: function() {
        return this._data = {}
    }
},
LocalDataManager.prototype.localStorageSupported = function() {
    var a = "test"
      , b = window.localStorage;
    try {
        return b.setItem(a, "1"),
        b.removeItem(a),
        !0
    } catch (c) {
        return !1
    }
}
,
LocalDataManager.prototype.get = function(a) {
    return this.storage.getItem(this.key[a]) || this.basevalue[a]
}
,
LocalDataManager.prototype.set = function(a, b) {
    this.storage.setItem(this.key[a], b)
}
,
Grid.prototype.build = function() {
    for (var a = 0; a < this.size; a++)
        for (var b = this.cells[a] = [], c = 0; c < this.size; c++)
            b.push(null)
}
,
Grid.prototype.getGrid = function () {
    return this.cells;
}
,
Grid.prototype.randomAvailableCell = function() {
    var a = this.availableCells();
    return a.length ? a[Math.floor(Math.random() * a.length)] : void 0
}
,
Grid.prototype.availableCells = function() {
    var a = [];
    return this.eachCell(function(b, c, d) {
        d || a.push({
            x: b,
            y: c
        })
    }),
    a
}
,
Grid.prototype.eachCell = function(a) {
    for (var b = 0; b < this.size; b++)
        for (var c = 0; c < this.size; c++)
            a(b, c, this.cells[b][c])
}
,
Grid.prototype.cellsAvailable = function() {
    return !!this.availableCells().length
}
,
Grid.prototype.cellAvailable = function(a) {
    return !this.cellOccupied(a)
}
,
Grid.prototype.cellOccupied = function(a) {
    return !!this.cellContent(a)
}
,
Grid.prototype.cellContent = function(a) {
    return this.withinBounds(a) ? this.cells[a.x][a.y] : null
}
,
Grid.prototype.insertTile = function(a) {
    this.cells[a.x][a.y] = a
}
,
Grid.prototype.removeTile = function(a) {
    this.cells[a.x][a.y] = null
}
,
Grid.prototype.withinBounds = function(a) {
    return a.x >= 0 && a.x < this.size && a.y >= 0 && a.y < this.size
}
,
Tile.prototype.savePosition = function() {
    this.previousPosition = {
        x: this.x,
        y: this.y
    }
}
,
Tile.prototype.updatePosition = function(a) {
    this.x = a.x,
    this.y = a.y
}
;