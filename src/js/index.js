import levels from './levels.js';

const terminal = document.querySelector('[data-console]');
const canvas = document.getElementById('js-sokoban-canvas');
const currentLevelEl = document.getElementById('js-sokoban-level');
const winLevelEl = document.getElementById('js-socoban-win');

const MAIN_MENU_SCREEN = 'mainmenu';
const GAME_SCREEN = 'game';

let currentLevel = 1;
let currentScreen;

let scoreMoves = 0;
const movesEl = document.getElementById('js-sokoban-moves');

let scorePushes = 0;
const pushesEl = document.getElementById('js-sokoban-pushes');

let scoreTime = 0;
const timeEl = document.getElementById('js-sokoban-time');
let timeInterval;

let score = 0;
let winCount;
let playerPos = { x: null, y: null };
let originalMapAr;
let mapArr;

const emptyChar = ' ';
const playerChar = '@';
const itemChar = '+';
const activeChar = '&';
const wallChar = 'X';
const targetChar = '.';


document.body.addEventListener('keydown', menuHandler);
document.body.addEventListener('keydown', move);

openScreen(MAIN_MENU_SCREEN);


function menuHandler(e) {
	
	// Esc
	if(e.keyCode === 27) {
		openScreen(MAIN_MENU_SCREEN);
	}

	if(currentScreen === GAME_SCREEN) return;

	const menu = document.querySelector(`[data-screen=${currentScreen}]`);
	const menuItems = menu.querySelectorAll('[data-action]');
	const menuActiveItem = menu.querySelector('[data-menu-item-active]');
	let index;

	if(!menuActiveItem) {
		index = 0;
	} else {
		index = Array.prototype.indexOf.call(menuItems, menuActiveItem);
	}

	switch(e.keyCode) {
		case 13: // Enter
			let level = menuItems[index].getAttribute('data-level');
			if(level) setLevel(+level);
			openScreen(menuItems[index].getAttribute('data-action'));

			break;
		case 38: // Up
			index--;
			if(index < 0) {
				index = menuItems.length - 1;
				terminal.scrollTop = terminal.scrollHeight;
			} else if(index === 0) {
				terminal.scrollTop = 0;
			}
			if(menuItems[index].offsetTop < terminal.scrollTop) {
				terminal.scrollTop -= menuItems[index].offsetHeight;
			}
			break;
		case 40: // Down
			index++;
			
			if(index > menuItems.length - 1) {
				index = 0;
				terminal.scrollTop = 0;
			} else if(menuItems[index].offsetTop + menuItems[index].offsetHeight > terminal.offsetHeight + terminal.scrollTop) {
				terminal.scrollTop += menuItems[index].offsetHeight;
			}

			break;
		default:
			return false;
	}

	setActiveMenuIndex(index, menu);
}

function setLevel(level) {
	currentLevel = level;
	currentLevelEl.innerText = currentLevel;
	initMap(level);
}

function setActiveMenuIndex(index, menu) {
	const menuItems = menu.querySelectorAll('[data-action]');

	for(let item of menuItems) {
		item.removeAttribute('data-menu-item-active')
		item.classList.remove('active');
	}

	menuItems[index].setAttribute('data-menu-item-active', true);
	menuItems[index].classList.add('active');
}

function openScreen(data) {
	terminal.scrollTop = 0;
	currentScreen = data;
	const screens = document.querySelectorAll('[data-screen]');
	let activeScreen;
	for(let screen of screens) {
		if(screen.getAttribute('data-screen') == data) {
			activeScreen = screen;
			screen.classList.remove('hidden');
		} else {
			screen.classList.add('hidden');
		}
	}

	const menu = activeScreen.querySelector('[data-menu]');
	if(menu) {
		setActiveMenuIndex(0, menu);
	}
}


// Game
function initMap() {
	score = 0;
	setScoreMove(0);
	setScorePush(0);
	clearInterval(timeInterval);
	setTime(0);
	timeInterval = setInterval(() => {
		setTime(scoreTime + 1);
	}, 1000);

	winLevelEl.classList.add('hidden');

	const reTarget = new RegExp(`\\${targetChar}`, 'g');
	const reActive = new RegExp(`\\${activeChar}`, 'g');

	// If some cubes are already active
	let map = levels[currentLevel];
	winCount = (map.match(reTarget)||[]).length + (map.match(reActive)||[]).length;

	originalMapAr = map.split('\n').map(row => (row.split('')));
	mapArr = map.split('\n').map(row => (row.split('')));

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
}

function setTime(time) {
	scoreTime = time;
	let hh = Math.floor(scoreTime / 3600);
	let mm = Math.floor((scoreTime % 3600) / 60);
	let ss = Math.floor(scoreTime % 60);

	hh = hh.toString().padStart(2, '0');
	mm = mm.toString().padStart(2, '0');
	ss = ss.toString().padStart(2, '0');
	
	timeEl.innerText = `${hh}:${mm}:${ss}`;
}

function setScorePush(point) {
	scorePushes = point;
	pushesEl.innerText = scorePushes.toString().padStart(4, '0');
}
function setScoreMove(point) {
	scoreMoves = point;
	movesEl.innerText = scoreMoves.toString().padStart(4, '0');
}

function move(e) {
	if(currentScreen !== GAME_SCREEN) return;

	if(score === winCount) {
		if(e.keyCode === 13) {
			setLevel(currentLevel + 1)
		}
		return;
	}
	
	// debug
	if(e.keyCode === 32) {
		setLevel(currentLevel + 1)
		return;
	}

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
		setScorePush(scorePushes + 1);
	}
	
	moveItem(playerChar, nextPos, playerPos);
	setScoreMove(scoreMoves + 1);
	playerPos = {...nextPos};

	drawMap();

	if(score === winCount) {
		winLevelEl.classList.remove('hidden');
		clearInterval(timeInterval);
	}
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

	if(char === itemChar && next === targetChar) {
		nextChar = activeChar; // activate the cube
		score++;
	} else if(char === activeChar && next !== targetChar) {
		nextChar = itemChar; // deactivate the cube
		score--;
	}

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