let X = 25, Y = 25, tick = 60, end = false, started = false, flags = 50;
let area = [...Array(Y)].map(e => Array(X)); //get 2d array
const field = document.getElementsByClassName("field")[0];
const startBtn = document.getElementsByClassName("starter")[0];
const goalkeep = document.getElementsByClassName("goalkeeper")[0];
const icon = ["#", "║", ".", "•", "F"], icorners = ["╚", "╝", "╔", "╗", "═"], alphabet = "abcdefghijklmnopqrstuvwxyz", mineMap = []
    ,colorSet = ['#000000', '#0049FF', '#1C8200', '#820000', '#001282', '#670000', '#00887E', '#000000', '#C2C2C2', '#DF5C5C'];

class Tile {
    constructor(src, isBorder, occupiedBy, opened, index, flagged) {
        this.src = src;
        this.isBorder = isBorder;
        this.occupiedBy = occupiedBy;
        this.opened = opened;
        this.index = index;
        this.flagged = flagged;
    }
    occupy(x = 0, silent = false) {
        this.occupiedBy = x;
        this.src.innerHTML = silent ? this.src.innerHTML : this.index !== 0 ? this.index : icon[x];
    }
}

function revealTile(v, h) {
    if (area[v][h].occupiedBy == 1 || area[v][h].opened || !started || end || area[v][h].flagged) return;
    if (area[v][h].occupiedBy == 3) {
        area[v][h].occupy(3);
        endGame();
        return;
    }
        area[v][h].opened = true;
        area[v][h].src.innerHTML = icon[2];
        if (area[v][h].occupiedBy == 2) {
            area[v][h].src.innerHTML = area[v][h].index;
            area[v][h].src.style.color = colorSet[area[v][h].index];
            return;
        }
        if (area[v][h].occupiedBy == 0) area[v][h].occupy(2);
        for (let i = -1; i < 2; i++)
            for (let j = -1; j < 2; j++)
                if (i !== 0 || j !== 0) {
                    revealTile(v+i, h+j);
                }
}

function flagTile(v, h) {
    if (!started) return;
    if (area[v][h].flagged == true) {
        area[v][h].src.innerHTML = icon[0];
        area[v][h].flagged = false;
        flags++;
        goalkeep.innerHTML = `left: `+flags;
        area[v][h].src.style.color = colorSet[0];
        return;
    }
    if (area[v][h].src.innerHTML !== icon[0]) return;
    area[v][h].src.innerHTML = icon[4];
    area[v][h].flagged = true;
    flags--;
    goalkeep.innerHTML = `left: `+flags;
    area[v][h].src.style.color = colorSet[9];
}

function drawMap(X, Y) {
    area = [...Array(Y)].map(e => Array(X));
    field.textContent = '';
    for (let i = Y-1; i >= 0; i--) {
        for (let j = 0; j < X; j++) {
            let patrol = i == 0 || i == Y - 1 || j == 0 || j == X - 1 ? true : false;
            let occupation = patrol ? 1 : 0;
            let appendix = patrol ? icon[1] : icon[0];
            area[i][j] = new Tile(document.createElement("span"), patrol, occupation, false, 0, false);
            area[i][j].src.appendChild(document.createTextNode(appendix));
            if (!patrol)
                area[i][j].src.addEventListener("click", () => {
                    revealTile(i, j);
                });
                area[i][j].src.addEventListener("contextmenu", (e) => {
                    e.preventDefault();
                    if (e.which == 3)
                        flagTile(i, j);
                });
            field.appendChild(area[i][j].src);
            if ( i == 0 || i == Y - 1) area[i][j].src.innerHTML = icorners[4];
        }
        field.appendChild(document.createElement("br"));
    }
}

drawMap(X, Y);

area[0][0].src.innerHTML = icorners[0];
area[0][X-1].src.innerHTML = icorners[1];
area[Y-1][0].src.innerHTML = icorners[2];
area[Y-1][X-1].src.innerHTML = icorners[3];

function getRandomString(n = 6) {
    if (n < 1) return;
    let randomString = [];
    for (let i = 0; i < n; i++) {
        randomString[i] = alphabet[Math.floor(Math.random() * 26)]
    }
    let r = randomString.join('');
    return r;
}

function cyrb128(str) {                     // 128-bit hash generator
    let h1 = 1779033703, h2 = 3144134277,
        h3 = 1013904242, h4 = 2773480762;
    for (let i = 0, k; i < str.length; i++) {
        k = str.charCodeAt(i);
        h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
        h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
        h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
        h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
    }
    h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
    h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
    h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
    h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
    h1 ^= (h2 ^ h3 ^ h4), h2 ^= h1, h3 ^= h1, h4 ^= h1;
    return [h1>>>0, h2>>>0, h3>>>0, h4>>>0];
}

function splitmix32(a) {                    // PRNG
    return function() {
      a |= 0; a = a + 0x9e3779b9 | 0;
      var t = a ^ a >>> 16; t = Math.imul(t, 0x21f0aaad);
          t = t ^ t >>> 15; t = Math.imul(t, 0x735a2d97);
      return ((t = t ^ t >>> 15) >>> 0) / 4294967296;
    }
}

let randStr = getRandomString(), seed = cyrb128(randStr);
const rand = splitmix32(seed[0]);
console.log('seed: '+randStr);

function getRandInBounds(margin = 0) {
    let rH = Math.floor(rand() * ((X - margin) - (margin+1)) + (margin+1));
    let rV = Math.floor(rand() * ((Y - margin) - (margin+1)) + (margin+1));
    return [rV, rH];
}

function generateMine(count) {
    for (let j = 0; j < count; j++)
        for (let i = 0; i < 30; i++) {
            let r = getRandInBounds();
            let bomb = area[r[0]][r[1]];
            if (bomb.occupiedBy == 1 || bomb.occupiedBy == 3) {
                (i == 29) ? console.error(`failed 2 spawn mine after ${i+1} tries`) : null;
                continue;
            }
            bomb.index = 0;
            bomb.occupy(3, true);
            mineMap.push(bomb);
            for (let i = -1; i < 2; i++)
                for (let k = -1; k < 2; k++)
                    if (area[r[0]+i][r[1]+k] != bomb && area[r[0]+i][r[1]+k].occupiedBy != 1 && area[r[0]+i][r[1]+k].occupiedBy != 3) {
                        area[r[0]+i][r[1]+k].index++;
                        area[r[0]+i][r[1]+k].occupiedBy = 2;
                        //area[r[0]+i][r[1]+k].src.innerHTML = area[r[0]+i][r[1]+k].index;
                    }
            break;
        }
}

function startGame() {
    end = false;
    started = true;
    generateMine(flags);
    goalkeep.innerHTML = `left: `+flags;
}

function endGame() {
    end = true;
    for (let i = Y-2; i >= 1; i--)
        for (let j = 1; j < X-1; j++) {
            if (area[i][j].occupiedBy == 3) area[i][j].occupy(3);
    }
}

startBtn.addEventListener('click', startGame, false);