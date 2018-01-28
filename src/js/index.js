import level1 from './levels.js';

const canvas = document.getElementById('js-sokoban-canvas');
let map = level1;
let playerPos = { x: null, y: null };

const emptyChar = ' ';
const playerChar = '@';
const itemChar = '*';
const activeChar = '&';
const wallChar = 'X';
const targetChar = '.';


let originalMapAr = map.split('\n').map(row => (row.split('')));
let mapArr = map.split('\n').map(row => (row.split('')));

// init playerPos
for (let posY = 0; posY < mapArr.length; posY++) {
	const posX = mapArr[posY].indexOf(playerChar);
	if (posX !== -1) {
		playerPos.x = posX;
		playerPos.y = posY;
		break;
	}
}

drawMap();



document.body.addEventListener('keydown', move);

function move(e) {
	let nextPos = getNextPos(playerPos, e.keyCode);
	if(!nextPos) return;

	mapArr[playerPos.y][playerPos.x] = emptyChar;
	mapArr[nextPos.y][nextPos.x] = playerChar;
	
	drawMap();
	playerPos = {...nextPos};
}

function getNextPos(pos, directonKey) {
	let nextPos = {...pos};
	switch(directonKey) {
		case 37: // Left
			nextPos.x--;
			break;
		case 38: // Up
			nextPos.y--;
			break;
		case 39: // Right
			nextPos.x++;
			break;
		case 40: // Down
			nextPos.y++;
			break;
		default:
			return false;
	}
	return nextPos;
}

function drawMap() {
	const renderedMap = mapArr.map(row => (row.join('')));
	canvas.innerHTML = renderedMap.join('\n');
}