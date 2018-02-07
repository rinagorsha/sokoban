import levels from './levels.js';
import themes from './themes.js';
import Game from './Game';

const MAIN_MENU_SCREEN = 'mainmenu';
const GAME_SCREEN = 'game';

let currentScreen;
let currentTheme = null;

const terminal = document.querySelector('[data-console]');
const canvas = document.getElementById('js-sokoban-canvas');
const currentLevelEl = document.getElementById('js-sokoban-level');
const winLevelEl = document.getElementById('js-socoban-win');
const finishGameEl = document.getElementById('js-socoban-finish');
const movesEl = document.getElementById('js-sokoban-moves');
const pushesEl = document.getElementById('js-sokoban-pushes');
const timeEl = document.getElementById('js-sokoban-time');

const playerIcon = document.getElementById('js-icon-player');
const targetIcon = document.getElementById('js-icon-target');
const itemIcon = document.getElementById('js-icon-item');
const activeIcon = document.getElementById('js-icon-active');
const wallIcon = document.getElementById('js-icon-wall');

const game = new Game(levels, canvas, movesEl, pushesEl, timeEl);

document.body.addEventListener('keydown', menuHandler);
document.body.addEventListener('keydown', moveController);

openScreen(MAIN_MENU_SCREEN);

function moveController(e) {
	if(currentScreen !== GAME_SCREEN) return;

	if(game.getScore() === game.winCount) {
		if(e.keyCode === 13) {
			// if last level
			if(!levels[game.currentLevel + 1]) {
				return;
			}
			winLevelEl.classList.add('hidden');
			game.setLevel(game.currentLevel + 1);
			currentLevelEl.innerText = game.currentLevel;
		}
		return;
	}

	// Debug
	if(e.keyCode === 32) {
		game.setLevel(game.currentLevel + 1);
		currentLevelEl.innerText = game.currentLevel;

		return;
	}

	// Restart
	if(e.keyCode === 82) {
		game.setLevel(game.currentLevel);
		return;
	}

	// Undo
	if(e.keyCode === 90 && e.ctrlKey === true) {
		game.undo();
		return;
	}

	game.move(e.keyCode);
	
	if(game.getScore() === game.winCount) {
		if(!levels[game.currentLevel + 1]) {
			finishGameEl.classList.remove('hidden');
			return;
		}
		winLevelEl.classList.remove('hidden');
	}

}

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
			const level = menuItems[index].getAttribute('data-level');
			if(level) {
				winLevelEl.classList.add('hidden');
				finishGameEl.classList.add('hidden');
				game.setLevel(+level);
			}

			const theme = menuItems[index].getAttribute('data-theme');
			if(theme && themes[theme]) {
				setTheme(theme);
			}

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

	let activeScreen;
	const screens = document.querySelectorAll('[data-screen]');
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

function setTheme(theme) {
	currentTheme = themes[theme];
	game.setTheme(currentTheme);
	
	if(theme !== 'symbols') {
		canvas.classList.add('iconed');
		[playerIcon, wallIcon, targetIcon, itemIcon, activeIcon].map(item => {
			item.classList.add('icon');
		});
	} else {
		canvas.classList.remove('iconed');
		[playerIcon, wallIcon, targetIcon, itemIcon, activeIcon].map(item => {
			item.classList.remove('icon');
		});
	}

	if(playerIcon) playerIcon.innerText = currentTheme.player;
	if(wallIcon) wallIcon.innerText = currentTheme.wall;
	if(targetIcon) targetIcon.innerText = currentTheme.target;
	if(itemIcon) itemIcon.innerText = currentTheme.item;
	if(activeIcon) activeIcon.innerText = currentTheme.active;

}