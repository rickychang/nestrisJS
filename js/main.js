var BLOCKWIDTH = 35;
var BLOCKHEIGHT = 35;
var LINEWIDTH = 4;
var ROWCOUNT = 20;
var COLCOUNT = 10;
var ANIMATION_FRAME_RATE = 5;

var CLEAR_ANIMATION_STATES = [
  [4, 5],
  [3, 4, 5, 6],
  [2, 3, 4, 5, 6, 7],
  [1, 2, 3, 4, 5, 6, 7, 8],
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
]

// I, L, J, S, Z, O, T
var SHAPE_ROTATIONS = [
    // I
    [
        [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0]
        ],
        [
            [0, 0, 1, 0],
            [0, 0, 1, 0],
            [0, 0, 1, 0],
            [0, 0, 1, 0]
        ]
    ],
    // L
    [
        [
            [0, 0, 0, 0],
            [1, 1, 1, 0],
            [1, 0, 0, 0],
            [0, 0, 0, 0]
        ],
        [
            [1, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 0, 0]
        ],
        [
            [0, 0, 1, 0],
            [1, 1, 1, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ],
        [
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 1, 0],
            [0, 0, 0, 0]
        ]
    ],
    // J
    [
        [
            [0, 0, 0, 0],
            [1, 1, 1, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 0]
        ],
        [
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [1, 1, 0, 0],
            [0, 0, 0, 0]
        ],
        [
            [1, 0, 0, 0],
            [1, 1, 1, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ],
        [
            [0, 1, 1, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 0, 0]
        ]
    ]
];

var LEVEL_FRAMES_PER_DROP = {
    0: 48,
    1: 43,
    2: 38,
    3: 33,
    4: 28,
    5: 23,
    6: 18,
    7: 13,
    8: 8,
    9: 6,
    10: 5,
    11: 5,
    12: 5,
    13: 4,
    14: 4,
    15: 4,
    16: 3,
    17: 3,
    18: 3,
    19: 2,
    20: 2,
    21: 2,
    22: 2,
    23: 2,
    24: 2,
    25: 2,
    26: 2,
    27: 2,
    28: 2,
    29: 1
};

var currentShape;
var rowsToClear = [];
var rowClearAnimationState = 0;
var frameCount = 0;
var clearAnimFrameCount = 1;

var levelColors = [
    ['red', 'blue', 'green'],
    ['cyan', 'brown', 'yellow']
];

var currentLevel = 6;

var ctx, gameCanvas;

var board = new Array(COLCOUNT);
for (var i = 0; i < COLCOUNT; i++) {
    board[i] = new Array(ROWCOUNT).fill(-1);
}

function drawSquare(x, y, color) {
    ctx.beginPath();
    ctx.fillStyle = 'black';
    ctx.rect(x * BLOCKWIDTH, y * BLOCKHEIGHT, BLOCKWIDTH, BLOCKHEIGHT);
    ctx.fill();
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.rect(x * BLOCKWIDTH + LINEWIDTH, y * BLOCKHEIGHT + LINEWIDTH, BLOCKWIDTH - LINEWIDTH, BLOCKHEIGHT - LINEWIDTH);
    ctx.fill();
}

function Shape(originX, originY, type) {
    this.originX = originX;
    this.originY = originY;
    this.rotations = SHAPE_ROTATIONS[type];
    this.currentRotation = 0;
    this.type = type;
    this.colorIndex = this.type % 3;
}

Shape.prototype.rotateClockwise = function() {
    var newRotation = this.currentRotation + 1;
    if (newRotation == this.rotations.length) { newRotation -= this.rotations.length; }

    if (this.isValidPosition(this.originX, this.originY, newRotation)) {
        this.currentRotation = newRotation;
    }
};

Shape.prototype.rotateCounterClockwise = function() {
    var newRotation = this.currentRotation - 1;
    if (newRotation == -1) { newRotation += this.rotations.length; }
    if (this.isValidPosition(this.originX, this.originY, newRotation)) {
        this.currentRotation = newRotation;
    }
};

Shape.prototype.moveLeft = function() {
    var newOriginX = this.originX - 1;

    if (this.isValidPosition(newOriginX, this.originY, this.currentRotation)) {
        this.originX = newOriginX;
    }
};

Shape.prototype.moveRight = function() {
    var newOriginX = this.originX + 1;

    if (this.isValidPosition(newOriginX, this.originY, this.currentRotation)) {
        this.originX = newOriginX;
    }
};

Shape.prototype.moveDown = function() {
    console.log('move down');
};

Shape.prototype.dropCell = function() {
  var newOriginY = this.originY + 1;

  if (this.isValidPosition(this.originX, newOriginY, this.currentRotation)) {
    this.originY = newOriginY;
  } else {
    lockShape();
  }
};

Shape.prototype.getSquares = function(originX, originY, rotation) {
    if (originX === undefined) { originX = this.originX; }
    if (originY === undefined) { originY = this.originY; }
    if (rotation === undefined) { rotation = this.currentRotation; }

    var squaresGrid = this.rotations[rotation];
    var squareCoords = [];
    for (var x = 0; x < 4; x++) {
        for (var y = 0; y < 4; y++) {
            if (squaresGrid[y][x]) {
                squareCoords.push([originX + x, originY + y])
            }
        }
    }
    return squareCoords;
};

Shape.prototype.isValidPosition = function(newOriginX, newOriginY, newRotation) {
    var squaresToOccupy = this.getSquares(newOriginX, newOriginY, newRotation);
    for (var i = 0; i < squaresToOccupy.length; i++) {
        var coord = squaresToOccupy[i];
        // if column index is off board, return false
        if (coord[0] < 0 || coord[0] >= COLCOUNT) { return false;  }
        // if row index is off board, return false
        else if (coord[1] < 0 || coord[1] >= ROWCOUNT) { return false; }
        // if coordinate is already occupied, return false
        else if (board[coord[0]][coord[1]] != -1) { return false; }
    }
    return true;
};

function createShape() {
  currentShape = new Shape(0, 0, Math.floor(Math.random()*3));
}

function lockShape() {
  var rowIndices = {};
  currentShape.getSquares().forEach(function(square) {
    rowIndices[square[1]] = square[1];
    board[square[0]][square[1]] = currentShape.colorIndex;
  });
  rows = Object.keys(rowIndices).map(function(i) {return parseInt(i)});
  // Sort rows in ascending order for processing top-to-bottom.
  rows = rows.sort();
  findFullRows(rows);
  currentShape = null;
}

function findFullRows(rows) {
  rows.forEach(function(row) {
    var clearRow = true;
    for (var col = 0; col < COLCOUNT; col++) {
      if (board[col][row] === -1) {
        clearRow = false;
      }
    }
    if (clearRow) { rowsToClear.push(row); }
  });
}

function updateBoardAfterRowClear() {
  rowsToClear.forEach(function(rowToClear) {
    for (var row = rowToClear; row >= 0; row--) {
      for (var col = 0; col < COLCOUNT; col++) {
        var colorAbove = board[col][row - 1]
        if (colorAbove === undefined) {
          colorAbove = -1;
        }
        board[col][row] = colorAbove;
      }
    }
  });
  rowsToClear = [];
  clearAnimFrameCount = 1;
  rowClearAnimationState = 0;
}

function updateCanvas() {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
  for (var x = 0; x < COLCOUNT; x++) {
    for (var y = 0; y < ROWCOUNT; y++) {
      var squareColor = board[x][y];
      if (squareColor != -1) {
        drawSquare(x, y, levelColors[currentLevel % levelColors.length][squareColor]);
      }
    }
  }

  // Draw clearing lines if a row is full.
  if (rowsToClear.length) {
    var animationFinished = false;
    if (rowClearAnimationState === 4) { animationFinished = true; }
    // Draw black squares that move out from the middle of the full rows.
    rowsToClear.forEach(function(row) {
      CLEAR_ANIMATION_STATES[rowClearAnimationState].forEach(function(col) {
        drawSquare(col, row, 'black');
      })
    });
    // With slight delay, move to next frame for clearing anim.
    if (!animationFinished) {
      if (clearAnimFrameCount % ANIMATION_FRAME_RATE === 0) { rowClearAnimationState++; }
      clearAnimFrameCount++;
    }
    // If the animation is finished, move the rows down.
    else {
      updateBoardAfterRowClear();
    }
  }

  // Draw current shape.
  if (currentShape) {
    currentShape.getSquares().forEach(function(squareCoord) {
      drawSquare(squareCoord[0], squareCoord[1], levelColors[currentLevel % levelColors.length][currentShape.colorIndex]);
    });
  }
}

window.onload = function() {
    document.addEventListener('keydown', function(event) {
        switch (event.keyCode) {
            // z
            case 90:
                if (currentShape) { currentShape.rotateCounterClockwise(); }
                break;
            // x
            case 88:
                if (currentShape) { currentShape.rotateClockwise(); }
                break;
            // left arrow
            case 37:
                if (currentShape) { currentShape.moveLeft(); }
                break;
            // right arrow
            case 39:
                if (currentShape) { currentShape.moveRight(); }
                break;
            // down arrow
            case 40:
                if (currentShape) { currentShape.moveDown(); }
                break;
        }
    });


    gameCanvas = document.getElementById('gameCanvas');
    ctx = gameCanvas.getContext('2d');
    createShape();
    timer = setInterval(function() {
        frameCount++;
        updateCanvas();

        if (!currentShape && !rowsToClear.length) { createShape(); }

        if (currentShape && frameCount % LEVEL_FRAMES_PER_DROP[currentLevel] == 0) {
            currentShape.dropCell();
        }
    }, 17);
};
