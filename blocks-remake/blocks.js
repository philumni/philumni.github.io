/*
 * © Copyright 2018 Phillip Walters, All Rights Reserved.
 * HTML, CSS, and Javascript programmed by Phillip Walters.
 * Refactored 2025.
 */

"use strict";

// ─── Config ───────────────────────────────────────────────────────────────────

var CONFIG = {
  boardWidth:    10,
  boardHeight:   20,
  previewSize:   4,  // preview boards show a cropped 4x4 view of the 5x5 shape
  previewCount:  4,
  initialDelay:  800,
  minDelay:      20,
  deltaDelay:    20,
  speedInterval: 7000,
  cheatPenalty:  50,
  gridSize:      5,  // all shapes live in a fixed 5x5 bounding box; center cell is (2,2)
  // Score per number of lines cleared simultaneously (index = lines cleared)
  lineScores:    [0, 100, 300, 900, 2700],
};

// Block type constants — correspond to .tStyleN in blocks.css
var BLOCK = {
  RED:    1,
  BLUE:   2,
  GREEN:  3,
  PURPLE: 4,
  ORANGE: 5,
  YELLOW: 6,
  BROWN:  7,
  DOTTED: 8,
  EMPTY:  9,
};

// ─── Tetrad shapes ────────────────────────────────────────────────────────────
// Each shape is an array of rotations.
// Each rotation is an array of strings — digits are block colors, spaces are empty.

// Every rotation is exactly 5 rows of exactly 5 characters.
// Each piece's natural pivot block sits on center cell (2,2).
// Rotation formula CW: new_col = (4 - old_row), new_row = old_col.
// All rotations are mathematically derived — 4 rotations always cycle back to rot0.
// O-piece: 2x2 has no single integer center; all 4 rotations drift by 1 cell.
//   Using a single rotation since all orientations are visually identical.
// I-piece: 4 blocks have no integer center in a 5x5; horizontal orientations
//   drift by 1 cell left/right. This is an inherent limitation of the piece geometry.
var TETRAD_SHAPES = {
  type1: [       // S-piece — 2 rotations (symmetric after 180°)
    ["     ",
     "  11 ",
     " 11  ",
     "     ",
     "     "],
    ["     ",
     "  1  ",
     "  11 ",
     "   1 ",
     "     "],
  ],
  type2: [       // I-piece — 2 rotations (symmetric after 180°); rot0 vertical for preview
    ["  1  ",
     "  1  ",
     "  1  ",
     "  1  ",
     "     "],
    ["     ",
     "     ",
     "1111 ",
     "     ",
     "     "],
  ],
  type3: [       // Z-piece — 2 rotations (symmetric after 180°)
    ["     ",
     " 33  ",
     "  33 ",
     "     ",
     "     "],
    ["     ",
     "   3 ",
     "  33 ",
     "  3  ",
     "     "],
  ],
  type4: [       // T-piece — pivot = center of bar (2,2); stem orbits it
    ["     ",
     "  4  ",
     " 444 ",
     "     ",
     "     "],
    ["     ",
     "  4  ",
     "  44 ",
     "  4  ",
     "     "],
    ["     ",
     "     ",
     " 444 ",
     "  4  ",
     "     "],
    ["     ",
     "  4  ",
     " 44  ",
     "  4  ",
     "     "],
  ],
  type5: [       // O-piece — single rotation (all 4 orientations are identical)
    ["     ",
     " 55  ",
     " 55  ",
     "     ",
     "     "],
  ],
  type6: [       // J-piece — foot top-right, pivot = center of bar (2,2)
    ["     ",
     "   6 ",
     " 666 ",
     "     ",
     "     "],
    ["     ",
     "  6  ",
     "  6  ",
     "  66 ",
     "     "],
    ["     ",
     "     ",
     " 666 ",
     " 6   ",
     "     "],
    ["     ",
     " 66  ",
     "  6  ",
     "  6  ",
     "     "],
  ],
  type7: [       // L-piece — foot top-left, pivot = center of bar (2,2)
    ["     ",
     " 7   ",
     " 777 ",
     "     ",
     "     "],
    ["     ",
     "  77 ",
     "  7  ",
     "  7  ",
     "     "],
    ["     ",
     "     ",
     " 777 ",
     "   7 ",
     "     "],
    ["     ",
     "  7  ",
     "  7  ",
     " 77  ",
     "     "],
  ],
};

var TETRAD_TYPES = Object.keys(TETRAD_SHAPES); // ["type1" … "type7"]

function getShape(type, rotationIndex) {
  return TETRAD_SHAPES[type][rotationIndex];
}

// Crop a 5x5 shape down to a 4x4 grid for preview rendering.
// Finds the bounding box of filled pixels and centers it in a 4x4 frame.
function cropTo4x4(shape) {
  var minRow = 4, maxRow = 0, minCol = 4, maxCol = 0;
  for (var r = 0; r < shape.length; r++) {
    for (var c = 0; c < shape[r].length; c++) {
      if (shape[r][c] !== ' ') {
        if (r < minRow) minRow = r;
        if (r > maxRow) maxRow = r;
        if (c < minCol) minCol = c;
        if (c > maxCol) maxCol = c;
      }
    }
  }
  // Extract just the occupied rows/cols, then pad to 4x4
  var h = maxRow - minRow + 1;
  var w = maxCol - minCol + 1;
  var padTop  = Math.floor((4 - h) / 2);
  var padLeft = Math.floor((4 - w) / 2);
  var out = [];
  for (var row = 0; row < 4; row++) {
    var srcRow = row - padTop + minRow;
    var rowStr = '';
    for (var col = 0; col < 4; col++) {
      var srcCol = col - padLeft + minCol;
      if (srcRow >= minRow && srcRow <= maxRow && srcCol >= minCol && srcCol <= maxCol) {
        rowStr += (shape[srcRow] && shape[srcRow][srcCol]) || ' ';
      } else {
        rowStr += ' ';
      }
    }
    out.push(rowStr);
  }
  return out;
}

// ─── Board prototype ──────────────────────────────────────────────────────────

var boardProto = Object.create(null);

boardProto.table  = null;
boardProto.width  = 0;
boardProto.height = 0;

// Write a single pixel by (col, row).
boardProto.writePixel = function(col, row, blockType) {
  this.table.rows[row].cells[col].className = "tStyle" + blockType;
};

// Read a single pixel's block type by (col, row).
// Parses the numeric suffix — handles multi-digit block types correctly.
boardProto.readPixel = function(col, row) {
  var cls = this.table.rows[row].cells[col].className;
  return parseInt(cls.replace("tStyle", ""), 10);
};

// Fill the entire board with one block type.
boardProto.fill = function(blockType) {
  for (var col = 0; col < this.width; col++) {
    for (var row = 0; row < this.height; row++) {
      this.writePixel(col, row, blockType);
    }
  }
};

boardProto.erase = function() {
  this.fill(BLOCK.EMPTY);
};

// Write or erase a shape at offset (a, b).
// Uses shape[row].length so it works for both 5x5 gameplay and 4x4 preview shapes.
boardProto.renderShape = function(a, b, shape, erase) {
  for (var row = 0; row < shape.length; row++) {
    for (var col = 0; col < shape[row].length; col++) {
      var pixel = shape[row][col];
      if (pixel === " ") continue;
      this.writePixel(a + col, b + row, erase ? BLOCK.EMPTY : parseInt(pixel, 10));
    }
  }
};

// ─── GameBoard prototype ──────────────────────────────────────────────────────
// Inherits from boardProto; adds "reserved" flag per cell to distinguish the
// active falling piece from already-landed blocks.

var gameBoardProto = Object.create(boardProto);

gameBoardProto._cell = function(col, row) {
  return this.table.rows[row].cells[col];
};

gameBoardProto.setReserved = function(col, row, value) {
  this._cell(col, row).dataset.reserved = value ? "true" : "false";
};

gameBoardProto.isReserved = function(col, row) {
  return this._cell(col, row).dataset.reserved === "true";
};

gameBoardProto._applyReserved = function(a, b, shape, value) {
  for (var row = 0; row < shape.length; row++) {
    for (var col = 0; col < CONFIG.gridSize; col++) {
      if (shape[row][col] === " ") continue;
      var gc = a + col;
      var gr = b + row;
      if (gc < this.width && gr < this.height) {
        this.setReserved(gc, gr, value);
      }
    }
  }
};

// Place a shape on the board and mark its cells as reserved.
gameBoardProto.placeShape = function(a, b, shape) {
  this.renderShape(a, b, shape, false);
  this._applyReserved(a, b, shape, true);
};

// Remove a shape from the board and clear its reserved flags.
gameBoardProto.removeShape = function(a, b, shape) {
  this.renderShape(a, b, shape, true);
  this._applyReserved(a, b, shape, false);
};

// Returns true if placing `shape` at (a, b) would be out-of-bounds or
// collide with a non-reserved (i.e. landed) block.
gameBoardProto.isCollision = function(a, b, shape) {
  for (var row = 0; row < shape.length; row++) {
    for (var col = 0; col < CONFIG.gridSize; col++) {
      if (shape[row][col] === " ") continue;
      var gc = a + col;
      var gr = b + row;
      if (gc >= this.width || gr >= this.height || gc < 0) return true;
      var occupied = this.readPixel(gc, gr) !== BLOCK.EMPTY;
      if (occupied && !this.isReserved(gc, gr)) return true;
    }
  }
  return false;
};

// Build the table DOM for the game board.
gameBoardProto.init = function() {
  for (var row = 0; row < this.height; row++) {
    var tr = this.table.insertRow(row);
    for (var col = 0; col < this.width; col++) {
      var td = tr.insertCell(col);
      td.className = "tStyle" + BLOCK.EMPTY;
      td.dataset.reserved = "false";
    }
  }
};

// Check rows in [startRow, endRow] and clear any complete ones.
// Returns the number of rows cleared.
gameBoardProto.clearCompleteRows = function(startRow, endRow) {
  var cleared     = 0;
  var row         = Math.min(endRow, this.height - 1);
  var rowsToCheck = endRow - startRow + 1;

  for (var checked = 0; checked < rowsToCheck; checked++) {
    if (this._isRowFull(row)) {
      this._removeRow(row);
      cleared++;
      // Don't decrement row — the row above just fell into this slot.
    } else {
      row--;
    }
  }
  return cleared;
};

gameBoardProto._isRowFull = function(row) {
  for (var col = 0; col < this.width; col++) {
    if (this.readPixel(col, row) === BLOCK.EMPTY) return false;
  }
  return true;
};

// Shift everything above `row` down by one, clearing the top row.
gameBoardProto._removeRow = function(row) {
  for (var r = row; r >= 0; r--) {
    for (var col = 0; col < this.width; col++) {
      var blockType = r === 0 ? BLOCK.EMPTY : this.readPixel(col, r - 1);
      this.writePixel(col, r, blockType);
    }
  }
};

// ─── Cursor prototype (active tetrad) ────────────────────────────────────────

var cursorProto = Object.create(null);

cursorProto.col         = 0;
cursorProto.row         = 0;
cursorProto.type        = "type1";
cursorProto.rotationIdx = 0;
cursorProto.typeQueue   = null; // initialized in makeCursor()

cursorProto.getShape = function() {
  return getShape(this.type, this.rotationIdx);
};

// The next rotation of the current type, without advancing.
cursorProto.peekNextRotation = function() {
  var rotations = TETRAD_SHAPES[this.type];
  var nextIdx   = (this.rotationIdx + 1) % rotations.length;
  return rotations[nextIdx];
};

cursorProto.rotate = function() {
  var rotations    = TETRAD_SHAPES[this.type];
  this.rotationIdx = (this.rotationIdx + 1) % rotations.length;
};

// Advance to the next random type from the queue.
cursorProto.nextRandom = function() {
  this.type        = this._dequeue();
  this.rotationIdx = 0;
};

// Advance to the next type in order (cheat mode).
cursorProto.nextOrdered = function() {
  var idx      = TETRAD_TYPES.indexOf(this.type);
  this.type    = TETRAD_TYPES[(idx + 1) % TETRAD_TYPES.length];
  this.rotationIdx = 0;
};

// The shape that would appear after nextOrdered(), without advancing.
cursorProto.peekOrderedShape = function() {
  var idx      = TETRAD_TYPES.indexOf(this.type);
  var nextType = TETRAD_TYPES[(idx + 1) % TETRAD_TYPES.length];
  return getShape(nextType, 0);
};

// The type queue as cropped 4x4 shapes for preview boards, index 0 = next up.
cursorProto.getQueueShapes = function() {
  return this.typeQueue.slice().reverse().map(function(type) {
    return cropTo4x4(getShape(type, 0));
  });
};

cursorProto._randomType = function() {
  return TETRAD_TYPES[Math.floor(Math.random() * TETRAD_TYPES.length)];
};

cursorProto._dequeue = function() {
  var next = this.typeQueue.pop();
  this.typeQueue.unshift(this._randomType());
  return next;
};

function makeCursor() {
  var c = Object.create(cursorProto);
  c.typeQueue = [];
  for (var i = 0; i < CONFIG.previewCount; i++) {
    c.typeQueue.push(TETRAD_TYPES[Math.floor(Math.random() * TETRAD_TYPES.length)]);
  }
  return c;
}

// ─── Game prototype ───────────────────────────────────────────────────────────

var gameProto = Object.create(null);

gameProto.board         = null;
gameProto.cursor        = null;
gameProto.previewBoards = null;
gameProto.caption       = null;
gameProto.score         = 0;
gameProto.delay         = 0;
gameProto.started       = false;
gameProto.paused        = false;
gameProto.over          = false;

gameProto.init = function() {
  this._initPreviewBoards();
  this.board.init();
  this._bindKeys();

  var self = this;
  this.caption.addEventListener("click", function(e) { self._onCaptionClick(e); });
  this.board.table.addEventListener("click", function() { self._onBoardClick(); });
};

// ── Preview boards ──

gameProto._initPreviewBoards = function() {
  for (var i = 1; i <= CONFIG.previewCount; i++) {
    var table = document.getElementById("typeBoard" + i);
    var pb    = Object.create(boardProto);
    pb.table  = table;
    pb.width  = CONFIG.previewSize;
    pb.height = CONFIG.previewSize;

    // Build DOM rows/cells for each preview board.
    for (var row = 0; row < CONFIG.previewSize; row++) {
      var tr = table.insertRow(row);
      for (var col = 0; col < CONFIG.previewSize; col++) {
        tr.insertCell(col).className = "tStyle" + BLOCK.DOTTED;
      }
    }

    this.previewBoards.push(pb);
  }
};

gameProto._updatePreviews = function() {
  var shapes = this.cursor.getQueueShapes();
  for (var i = 0; i < this.previewBoards.length; i++) {
    this.previewBoards[i].fill(BLOCK.DOTTED);
    this.previewBoards[i].renderShape(0, 0, shapes[i], false);
  }
};

// ── Input ──

gameProto._bindKeys = function() {
  var self = this;
  addEventListener("keydown", function(e) {
    if (self.over) return;
    switch (e.code) {
      case "ArrowUp":      self._rotate();      break;
      case "ArrowDown":    self._move(0,  1);   break;
      case "ArrowLeft":    self._move(-1, 0);   break;
      case "ArrowRight":   self._move(1,  0);   break;
      case "Space":        self._togglePause(); break;
      case "ControlLeft":
      case "ControlRight": self._cheat();       break;
    }
  });
};

gameProto._onCaptionClick = function(e) {
  e.stopPropagation();
  if (this.started) { this._togglePause(); return; }
  this._startGame();
};

gameProto._onBoardClick = function() {
  if (this.started) { this._togglePause(); return; }
  this.caption.textContent = "Click the score bar to start.";
};

// ── Game flow ──

gameProto._startGame = function() {
  this.started = true;
  this._writeScore(0);
  this._addTetrad();
  this._scheduleMainLoop();
  this._scheduleSpeedUp();
};

gameProto._scheduleMainLoop = function() {
  var self = this;
  var tick = function() {
    if (self.paused) { setTimeout(tick, 20); return; }
    if (self.over)   { return; }

    var shape = self.cursor.getShape();
    var col   = self.cursor.col;
    var row   = self.cursor.row;

    if (self.board.isCollision(col, row + 1, shape)) {
      // Piece has landed — unmark reserved so row-clear sees it as solid.
      self.board._applyReserved(col, row, shape, false);
      self._clearRows();
      self._addTetrad();
    } else {
      self._move(0, 1);
    }

    setTimeout(tick, self.delay);
  };
  setTimeout(tick, this.delay);
};

gameProto._scheduleSpeedUp = function() {
  var self = this;
  var speedUp = function() {
    if (self.paused) { setTimeout(speedUp, 20); return; }
    if (self.delay > CONFIG.minDelay) {
      self.delay -= CONFIG.deltaDelay;
    }
    setTimeout(speedUp, CONFIG.speedInterval);
  };
  setTimeout(speedUp, CONFIG.speedInterval);
};

gameProto._addTetrad = function() {
  if (this.over) return;

  this.cursor.nextRandom();
  var shape    = this.cursor.getShape();
  var startCol = Math.floor((CONFIG.boardWidth - CONFIG.gridSize) / 2);
  var startRow = 0;

  if (this.board.isCollision(startCol, startRow, shape)) {
    this._gameOver();
    return;
  }

  this._updatePreviews();
  this.cursor.col = startCol;
  this.cursor.row = startRow;
  this.board.placeShape(startCol, startRow, shape);
};

gameProto._gameOver = function() {
  this.over = true;
  this.caption.textContent = "Game Over - Score: " + this.score;
};

// ── Piece movement ──

gameProto._move = function(dCol, dRow) {
  if (this.paused || this.over) return;

  var col    = this.cursor.col;
  var row    = this.cursor.row;
  var shape  = this.cursor.getShape();
  var newCol = col + dCol;
  var newRow = row + dRow;

  if (this.board.isCollision(newCol, newRow, shape)) return;

  this.board.removeShape(col, row, shape);
  this.board.placeShape(newCol, newRow, shape);
  this.cursor.col = newCol;
  this.cursor.row = newRow;
};

gameProto._rotate = function() {
  if (this.paused || this.over) return;

  var col          = this.cursor.col;
  var row          = this.cursor.row;
  var shape        = this.cursor.getShape();
  var nextRotation = this.cursor.peekNextRotation();

  if (this.board.isCollision(col, row, nextRotation)) return;

  this.board.removeShape(col, row, shape);
  this.cursor.rotate();
  this.board.placeShape(col, row, this.cursor.getShape());
};

gameProto._cheat = function() {
  if (this.paused || this.over || !this.started) return;

  var col              = this.cursor.col;
  var row              = this.cursor.row;
  var shape            = this.cursor.getShape();
  var nextOrderedShape = this.cursor.peekOrderedShape();

  if (this.board.isCollision(col, row, nextOrderedShape)) return;

  this.board.removeShape(col, row, shape);
  this.cursor.nextOrdered();
  this.board.placeShape(col, row, this.cursor.getShape());

  this.score = Math.max(0, this.score - CONFIG.cheatPenalty);
  this._writeScore(this.score);
};

// ── Row clearing & scoring ──

gameProto._clearRows = function() {
  var row      = this.cursor.row;
  var shape    = this.cursor.getShape();
  var startRow = row;
  var endRow   = row + shape.length - 1;
  var cleared  = this.board.clearCompleteRows(startRow, endRow);
  if (cleared > 0) this._addScore(cleared);
};

gameProto._addScore = function(linesCleared) {
  this.score += CONFIG.lineScores[linesCleared] || 0;
  this._writeScore(this.score);
};

gameProto._writeScore = function(value) {
  this.caption.textContent = "Score: " + value;
};

gameProto._togglePause = function() {
  if (this.over || !this.started) return;
  this.paused = !this.paused;
  this.caption.textContent = this.paused
    ? "Paused - Score: " + this.score
    : "Score: " + this.score;
};

function makeGame() {
  var g          = Object.create(gameProto);
  g.board        = Object.create(gameBoardProto);
  g.board.table  = document.getElementById("board");
  g.board.width  = CONFIG.boardWidth;
  g.board.height = CONFIG.boardHeight;
  g.cursor       = makeCursor();
  g.previewBoards = [];
  g.caption      = document.getElementById("caption");
  g.score        = 0;
  g.delay        = CONFIG.initialDelay;
  g.started      = false;
  g.paused       = false;
  g.over         = false;
  return g;
}

// ─── Boot ─────────────────────────────────────────────────────────────────────

window.addEventListener("load", function() {
  var game = makeGame();
  game.init();
});
