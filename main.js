let X = 25, Y = 25, tick = 60;
let area = [...Array(Y)].map(e => Array(X)); //get 2d array
const field = document.getElementsByClassName("field")[0];
const startBtn = document.getElementsByClassName("starter")[0];
const goalkeep = document.getElementsByClassName("goalkeeper")[0];
let lastDir = -2, started = false, running = false, bodyparts = [], fruits = [];
const icon = ["#", "║", "■", "•"], icorners = ["╚", "╝", "╔", "╗", "═"], alphabet = "abcdefghijklmnopqrstuvwxyz";

class Tile {
    constructor(src, isBorder, occupiedBy, opened, index) {
        this.src = src;
        this.isBorder = isBorder;
        this.occupiedBy = occupiedBy;
        this.opened = opened;
        this.index = index;
    }
    occupy(x = 0) {
        this.occupiedBy = x;
        this.src.innerHTML = icon[x];
    }
}

const plr = {
    click: undefined,
    flags: undefined
}

function drawMap(X, Y) {
    area = [...Array(Y)].map(e => Array(X));
    field.textContent = '';
    for (let i = Y-1; i >= 0; i--) {
        for (let j = 0; j < X; j++) {
            let patrol = i == 0 || i == Y - 1 || j == 0 || j == X - 1 ? true : false;
            let occupation = patrol ? 1 : 0;
            let appendix = patrol ? icon[1] : icon[0];
            area[i][j] = new Tile(document.createElement("span"), patrol, occupation, false, 0);
            area[i][j].src.appendChild(document.createTextNode(appendix));
            if (!patrol)
                area[i][j].src.addEventListener("click", () => {
                    area[i][j].opened = true;
                    switch(area[i][j].occupiedBy) {
                        case 0:
                            /////////////////////////////////////////////////////////////////////////////////////// need some expanding mechanic
                            break;
                        case 2:
                            area[i][j].src.innerHTML = area[i][j].index;
                            break;
                    }
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

function generateMine(count = 1) {
    for (let j = 0; j < count; j++)
        for (let i = 0; i < 30; i++) {
            let r = getRandInBounds();
            let bomb = area[r[0]][r[1]];
            if (bomb.occupiedBy == 1 || bomb.occupiedBy == 3) {
                (i == 29) ? console.error(`failed 2 spawn mine after ${i+1} tries`) : '';
                continue;
            }
            bomb.occupy(3);
            for (let i = -1; i < 2; i++)
                for (let k = -1; k < 2; k++)
                    if (area[r[0]+i][r[1]+k] != bomb && (area[r[0]+i][r[1]+k].occupiedBy == 2 || area[r[0]+i][r[1]+k].occupiedBy == 0)) {
                        area[r[0]+i][r[1]+k].index++;
                        area[r[0]+i][r[1]+k].occupiedBy = 2;
                        area[r[0]+i][r[1]+k].src.innerHTML = area[r[0]+i][r[1]+k].index;
                    }
            break;
        }
}

function spawnPlayer(v, h) {
    if (area[v][h].isBorder) return;
    try {area[plr.v][plr.h].occupy()}
    catch (e) {};
    area[v][h].occupy(2);
    plr.v = v;
    plr.h = h;
}

function startGame(r = false, startSeed = undefined) {
    generateMine(70);
}

function tickForward() {
    if (replaySys.isReplay) {
        lastDir = replaySys.queue[replaySys.str.charAt][0];
        if (replaySys.queue[replaySys.str.charAt][1] > 0) {
            replaySys.queue[replaySys.str.charAt][1]--;
        }
        replaySys.str.charAt += 1+replaySys.queue[replaySys.str.charAt][1].length;
        return;
    }
    else if (lastDir == plr.dir) replaySys.count++;
    else {
        replaySys.update();
        lastDir = plr.dir;
    }
    switch(lastDir) {
        case -2:
            movePlayer(0, -1);
            break;
        case -1:
            movePlayer(-1, 0);
            break;
        case 1:
            movePlayer(1, 0);
            break;
        case 2:
            movePlayer(0, 1);
            break;
    }
}

function endGame(noSign = false) {
    console.log(replaySys.str.value);
    let center = Math.floor(X/2), count = 0;
    const sign = noSign ? `` : `GAME${icon[0]}OVER`;
    const cycle = setInterval(() => {
        if (running) clearInterval(cycle);
        if (count < sign.length) {
            area[Y-2][center+count-4].src.innerHTML = sign[count];
            count++;
            return;
        }
        clearInterval(cycle);
    }, 100);
}

function init() {
    resolve = started ? startGame(true) : startGame();
    started = true;
}

document.addEventListener('keydown', (e) => {
    if ((!running && e.key != ' ') || replaySys.isReplay) return;
    switch(e.key) {
        case 'ArrowDown':
            e.preventDefault();
            if (lastDir == 1) return;
            plr.dir = -1;
            break;
        case 'ArrowLeft':
            e.preventDefault();
            if (lastDir == 2) return;
            plr.dir = -2;
            break;
        case 'ArrowUp':
            e.preventDefault();
            if (lastDir == -1) return;
            plr.dir = 1;
            break;
        case 'ArrowRight':
            e.preventDefault();
            if (lastDir == -2) return;
            plr.dir = 2;
            break;
        case ' ':
            e.preventDefault();
            init();
            break;
    }
})

startBtn.addEventListener('click', init);