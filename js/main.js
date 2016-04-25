var BLOCKWIDTH = 35;
var BLOCKHEIGHT = 35;
var LINEWIDTH = 4;
var ROWCOUNT = 20;
var COLCOUNT = 10;

// I , L, J, S, Z, O, T
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

var levelColors = [
    ['red', 'blue', 'green'],
    ['cyan', 'brown', 'yellow']
];

var currentLevel = 5;

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


function updateCanvas() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
    for (var x = 0; x < COLCOUNT; x++) {
        for (var y = 0; y < ROWCOUNT; y++) {
            var squareColor = board[x][y];
            if (squareColor != -1) {
                drawSquare(x, y, levelColors[currentLevel][squareColor]);
            }
        }
    }

    if (currentShape) {
        currentShape.getSquares().forEach(function(squareCoord) {
            drawSquare(squareCoord[0], squareCoord[1], levelColors[currentLevel % levelColors.length][currentShape.colorIndex]);
        })
    }
}

window.onload = function() {
    document.addEventListener('keydown', function(event) {
        switch (event.keyCode) {
            // z
            case 90:
                currentShape.rotateCounterClockwise();
                break;
            // x
            case 88:
                currentShape.rotateClockwise();
                break;
            // left arrow
            case 37:
                currentShape.moveLeft();
                break;
            // right arrow
            case 39:
                currentShape.moveRight();
                break;
            // down arrow
            case 40:
                currentShape.moveDown();
                break;
        }
    });


    gameCanvas = document.getElementById('gameCanvas');
    ctx = gameCanvas.getContext('2d');
    currentShape = new Shape(0, 0, Math.floor(Math.random()*3));
    var frameCount = 0;
    timer = setInterval(function() {
        frameCount++;
        updateCanvas();
        if (frameCount % LEVEL_FRAMES_PER_DROP[currentLevel] == 0) {
            currentShape.dropCell();
        }
    }, 17);
};
