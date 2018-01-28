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

	const char = mapArr[nextPos.y][nextPos.x];
	if(char === wallChar) return false;
	if(char === itemChar || char === activeChar) {
		const nextBlockPos = getNextPos(nextPos, e.keyCode);
		const char2 = mapArr[nextBlockPos.y][nextBlockPos.x];
		if(char2 === wallChar || char2 === itemChar || char2 === activeChar)
			return false;
		moveItem(char, nextBlockPos, nextPos);
	}
	
	moveItem(playerChar, nextPos, playerPos);
	playerPos = {...nextPos};

	drawMap();
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

function moveItem(char, nextPos, oldPos) {
	let nextChar = char;
	let oldChar = emptyChar;
	const originalOldChar = originalMapAr[oldPos.y][oldPos.x];
	let next = mapArr[nextPos.y][nextPos.x];

	mapArr[nextPos.y][nextPos.x] = nextChar;

	if(originalOldChar === targetChar) {
		mapArr[oldPos.y][oldPos.x] = targetChar;
	} else {
		mapArr[oldPos.y][oldPos.x] = emptyChar;
	}
}

function drawMap() {
	const renderedMap = mapArr.map(row => (row.join('')));
	canvas.innerHTML = renderedMap.join('\n');
}