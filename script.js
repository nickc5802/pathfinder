let algo = "bfs";
let tool = "start";
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let boxWidth, boxHeight;
let numBoxesX = 25, numBoxesY = 15;
let startX = 0, startY = 0, endX = numBoxesX - 1, endY = numBoxesY - 1;
let grid;

let objects = {
    empty: 0,
    start: 1,
    end: 2,
    wall: 3,
    visited: 4,
    current: 5,
    path: 6
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function setUpGrid() {
    grid = new Array(numBoxesX); 
    for (let i = 0; i < grid.length; i++) { 
        grid[i] = new Array(numBoxesY); 
        for (let j = 0; j < grid.length; j++) {
            grid[i][j] = objects.empty;
        }
    }
    grid[startX][startY] = objects.start;
    grid[endX][endY] = objects.end;
}
setUpGrid();

function setAlgo(newAlgo) {
    document.getElementById(algo).classList.remove("active");
    algo = newAlgo;
    document.getElementById(algo).classList.add("active");
}

function setTool(newTool) {
    document.getElementById(tool).classList.remove("active");
    tool = newTool;
    document.getElementById(tool).classList.add("active");
}

function setCanvasSize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight-46;
        boxWidth = canvas.width/numBoxesX;
        boxHeight = canvas.height/numBoxesY;
}
setCanvasSize();

function drawGrid() {
    ctx.fillStyle = "#000000";
    for (i = boxHeight; i < canvas.height; i += boxHeight) {
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
    }
    for (i = boxWidth; i < canvas.width; i += boxWidth) {
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
    }
    ctx.stroke();
}

function drawBackground() {
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawObjects() {
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            if (grid[i][j] == objects.start) {
                ctx.fillStyle = "#00FF00";
            } else if (grid[i][j] == objects.end) {
                ctx.fillStyle = "#FF0000";
            } else if (grid[i][j] == objects.wall) {
                ctx.fillStyle = "#000000";
            } else if (grid[i][j] == objects.visited) {
                ctx.fillStyle = "#0000FF";
            } else if (grid[i][j] == objects.current) {
                ctx.fillStyle = "#00FFDD";
            } else if (grid[i][j] == objects.path) {
                ctx.fillStyle = "#FFFF00";
            }
            if (grid[i][j] != objects.empty) {
                ctx.fillRect(i*boxWidth, j*boxHeight, boxWidth, boxHeight);
            }
        }
    }
}

function draw() {
    drawBackground();
    drawObjects();
    drawGrid();
}
draw();

function placeObject(event) {
    posX = Math.floor(event.clientX/boxWidth);
    posY = Math.floor((event.clientY-46)/boxHeight);
    if (tool == "start") {
        grid[startX][startY] = objects.empty;
        startX = posX;
        startY = posY;
        grid[startX][startY] = objects.start;
    } else if (tool == "end") {
        grid[endX][endY] = objects.empty;
        endX = posX;
        endY = posY;
        grid[endX][endY] = objects.end;
    } else if (tool == "wall") {
        if (grid[posX][posY] == objects.wall) {
            grid[posX][posY] = objects.empty;
        } else {
            grid[posX][posY] = objects.wall;
        }
    }
    draw();
}

function run() {
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            if (grid[i][j] == objects.path || grid[i][j] == objects.visited) {
                grid[i][j] = objects.empty;
            }
        }
    }
    if (algo == "bfs") {
        bfs();
    } else if (algo == "dfs") {
        dfs();
    } else if (algo == "astar") {
        astar();
    } else if (algo == "greedy") {
        greedy();
    }
}

async function bfs() {
    let predecessor = {};
    predecessor[[startX,startY].toString()] = null;
    
    let toVisit = [];
    getNeighbors(startX, startY).forEach(nbr => {
        predecessor[nbr.toString()] = [startX,startY];
        toVisit.push(nbr);
    });

    while (toVisit.length != 0 && !(toVisit[0][0] == endX && toVisit[0][1] == endY)) {
        let pos = toVisit.shift();
        if (grid[pos[0]][pos[1]] != objects.start) {
            grid[pos[0]][pos[1]] = objects.current;
        }
        draw();
        await sleep(50);
        if (grid[pos[0]][pos[1]] != objects.start) {
            grid[pos[0]][pos[1]] = objects.visited;
        }
        getNeighbors(pos[0], pos[1]).forEach(nbr => {
            if (!predecessor.hasOwnProperty(nbr.toString())) {
                predecessor[nbr.toString()] = pos;
                toVisit.push(nbr);
            }
        })
    }

    if (toVisit.length == 0) {
        return false;
    } else {
        let pos = predecessor[[endX,endY].toString()];
        while (pos != null) {
            if (grid[pos[0]][pos[1]] != objects.start) {
                grid[pos[0]][pos[1]] = objects.path;
                draw();
                await sleep(50);
            }
            pos = predecessor[pos.toString()];
        }
        return true;
    }
}

function dfs() {
    let visited = new Set();
    visited.add([startX, startY].toString());
    dfsHelper(startX, startY, visited);
}

async function dfsHelper(x, y, visited) {
    if (x == endX && y == endY) {
        return true;
    }

    let neighbors = getNeighbors(x, y);
    for (let i = 0; i < neighbors.length; i++) {
        let nbr = neighbors[i]
        if (!visited.has(nbr.toString())) {
            if (grid[nbr[0]][nbr[1]] != objects.start && grid[nbr[0]][nbr[1]] != objects.end) {
                grid[nbr[0]][nbr[1]] = objects.current;
            }
            visited.add(nbr.toString());
            draw();
            await sleep(50);
            if (grid[nbr[0]][nbr[1]] != objects.start && grid[nbr[0]][nbr[1]] != objects.end) {
                grid[nbr[0]][nbr[1]] = objects.visited;
            }
            let found = await dfsHelper(nbr[0], nbr[1], visited);
            if (found) {
                if (grid[x][y] != objects.start) {
                    grid[x][y] = objects.path;
                    draw();
                    await sleep(50);
                }
                return found;
            }
        }
    }
    return false;
}

async function astar() {
    let openSet = new Set();
    let predecessor = {};
    let gValues = {};
    let fValues = {};

    openSet.add([startX, startY].toString());
    gValues[[startX, startY].toString()] = 0;
    fValues[[startX, startY].toString()] = astarH(startX, startY);

    while (openSet.size != 0) {
        let pos;
        let bestF = -1;
        openSet.forEach(node => {
            if (bestF == -1 || fValues[node] < bestF) {
                bestF = fValues[node];
                pos = node.split(",");
            }
        });

        pos[0] = parseInt(pos[0]);
        pos[1] = parseInt(pos[1]);

        if (pos[0] == endX && pos[1] == endY) {
            break;
        }

        if (grid[pos[0]][pos[1]] != objects.start && grid[pos[0]][pos[1]] != objects.end) {
            grid[pos[0]][pos[1]] = objects.current;
        }
        draw();
        await sleep(50);
        if (grid[pos[0]][pos[1]] != objects.start && grid[pos[0]][pos[1]] != objects.end) {
            grid[pos[0]][pos[1]] = objects.visited;
        }
        openSet.delete(pos.toString());
        getNeighbors(pos[0], pos[1]).forEach(nbrPos => {
            nbr = nbrPos.toString();
            let newG = gValues[pos.toString()] + 1;
            if (!gValues.hasOwnProperty(nbr) || newG < gValues[nbr]) {
                predecessor[nbr] = pos;
                gValues[nbr] = newG;
                console.log(pos + " " + nbrPos);
                fValues[nbr] = newG + astarH(nbrPos[0], nbrPos[1]);
                if (!openSet.has(nbr)) {
                    openSet.add(nbr);
                }
            }
        })
    }
    if (openSet.size == 0) {
        return false;
    } else {
        let pos = predecessor[[endX,endY].toString()];
        while (pos != null) {
            grid[pos[0]][pos[1]] = objects.path;
            draw();
            await sleep(50);
            if (predecessor.hasOwnProperty(pos.toString()) && !(predecessor[pos.toString()][0] == startX && predecessor[pos.toString()][1] == startY)) {
                pos = predecessor[pos.toString()];
            } else {
                pos = null;
            }
        }
        return true;
    }
}

function astarH(x, y) {
    return Math.abs(endX - x) + Math.abs(endY - y);
}

async function greedy() {
    let openSet = new Set();
    let predecessor = {};
    let hValues = {};

    openSet.add([startX, startY].toString());
    hValues[[startX, startY].toString()] = astarH(startX, startY);

    while (openSet.size != 0) {
        let pos;
        let bestH = -1;
        openSet.forEach(node => {
            if (bestH == -1 || hValues[node] < bestH) {
                bestH = hValues[node];
                pos = node.split(",");
            }
        });

        pos[0] = parseInt(pos[0]);
        pos[1] = parseInt(pos[1]);

        if (pos[0] == endX && pos[1] == endY) {
            break;
        }

        if (grid[pos[0]][pos[1]] != objects.start && grid[pos[0]][pos[1]] != objects.end) {
            grid[pos[0]][pos[1]] = objects.current;
        }
        draw();
        await sleep(50);
        if (grid[pos[0]][pos[1]] != objects.start && grid[pos[0]][pos[1]] != objects.end) {
            grid[pos[0]][pos[1]] = objects.visited;
        }
        openSet.delete(pos.toString());
        getNeighbors(pos[0], pos[1]).forEach(nbrPos => {
            nbr = nbrPos.toString();
            if (!hValues.hasOwnProperty(nbr)) {
                predecessor[nbr] = pos
                hValues[nbr] = astarH(nbrPos[0], nbrPos[1]);
                openSet.add(nbr);
            }
        })
    }
    if (openSet.size == 0) {
        return false;
    } else {
        let pos = predecessor[[endX,endY].toString()];
        while (pos != null) {
            grid[pos[0]][pos[1]] = objects.path;
            draw();
            await sleep(50);
            if (predecessor.hasOwnProperty(pos.toString()) && !(predecessor[pos.toString()][0] == startX && predecessor[pos.toString()][1] == startY)) {
                pos = predecessor[pos.toString()];
            } else {
                pos = null;
            }
        }
        return true;
    }
}

function getNeighbors(x, y) {
    result = [[x, y-1], [x-1, y], [x+1, y], [x, y+1]]
    for (let i = 0; i < result.length; i++) {
        let x = result[i][0];
        let y = result[i][1];
        if (x < 0 || y < 0 || x == numBoxesX || y == numBoxesY || grid[x][y] == objects.wall) {
            result.splice(i, 1);
            i--;
        }
    }
    return result;
}