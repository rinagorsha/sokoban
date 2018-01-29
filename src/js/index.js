import levels from './levels.js';

const terminal = document.querySelector('[data-console]');
const canvas = document.getElementById('js-sokoban-canvas');
const currentLevelEl = document.getElementById('js-sokoban-level');

let currentScreen;
let currentMenu = 'main';

let currentLevel = 1;
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

openScreen('mainmenu');
setLevel(1);


function menuHandler(e) {
	// Esc
	if(e.keyCode === 27) {
		openScreen('mainmenu');
		setLevel(1);
	}
	if(currentScreen === 'game') return;

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
			if(level) setLevel(level);
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
	var reTarget = new RegExp(`\\${targetChar}`, 'g');
	var reActive = new RegExp(`\\${activeChar}`, 'g');

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

function move(e) {
	if(currentScreen !== 'game') return;
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

	if(score === winCount) {
		console.log('win!')
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