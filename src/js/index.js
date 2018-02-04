import levels from './levels.js';
import Game from './Game';

const terminal = document.querySelector('[data-console]');
const canvas = document.getElementById('js-sokoban-canvas');
const winLevelEl = document.getElementById('js-socoban-win');
const finishGameEl = document.getElementById('js-socoban-finish');

const MAIN_MENU_SCREEN = 'mainmenu';
const GAME_SCREEN = 'game';

let currentScreen;

const game = new Game(levels);

document.body.addEventListener('keydown', menuHandler);
document.body.addEventListener('keydown', moveController);

openScreen(MAIN_MENU_SCREEN);

function moveController(e) {
	if(currentScreen !== GAME_SCREEN) return;

	if(game.score === game.winCount) {
		if(e.keyCode === 13) {
			// if last level
			if(!levels[game.currentLevel + 1]) {
				return;
			}
			winLevelEl.classList.add('hidden');
			game.setLevel(game.currentLevel + 1);
		}
		return;
	}

	// Restart
	if(e.keyCode === 82) {
		game.setLevel(game.currentLevel);
		return;
	}

	game.move(e.keyCode);
	
	if(game.score === game.winCount) {
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