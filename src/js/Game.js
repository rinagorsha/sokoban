export default class Game {
	constructor(levels, mapCanvas, movesEl, pushesEl, timeEl) {
		this.levels = levels;
		this.theme = {
			player: '@',
			empty: ' ',
			wall: 'X',
			target: '.',
			item: '+',
			active: '&',
		};

		this.mapCanvas = mapCanvas;
		this.movesEl = movesEl;
		this.pushesEl = pushesEl;
		this.timeEl = timeEl;

		this.map;
		this.stats;
		this.currentLevel;

		this.playerPos = {x: null, y: null};
		this.winCount;
		this.score = 0;
	}

	setLevel(level) {
		this.currentLevel = level;
		this.map = new GameMap(
			this.levels[level], this.mapCanvas, this.theme);

		if(this.stats) {
			this.stats.stopTime();
		}
		this.stats = new GameStats(this.movesEl, this.pushesEl, this.timeEl);

		this.winCount = this.map.countChar(this.theme.target) + this.getScore();
		this.playerPos = this.map.findChar(this.theme.player);
		this.stats.logging(this.playerPos.x, this.playerPos.y);
	}

	move(keyCode) {
		if(this.getScore() === this.winCount) return;

		let nextPos = this.getNextPos(this.playerPos.x, this.playerPos.y, keyCode);
		if(!nextPos) return;

		const nextChar = this.map.currentMap[nextPos.y][nextPos.x];
		if(nextChar === this.theme.wall) return false;

		let nextBlockPos = {x: null, y: null};
		if(nextChar === this.theme.item || nextChar === this.theme.active) {
			nextBlockPos = this.getNextPos(nextPos.x, nextPos.y, keyCode);
			
			const blockNextChar = this.map.currentMap[nextBlockPos.y][nextBlockPos.x];
			if (blockNextChar === this.theme.wall ||
				blockNextChar === this.theme.item ||
				blockNextChar === this.theme.active) {
					return false;
			}

			this.moveItem(nextChar, nextBlockPos.x, nextBlockPos.y, nextPos.x, nextPos.y);
			this.stats.setScorePush(this.stats.scorePushes + 1);
		}
		
		this.moveItem(this.theme.player, nextPos.x, nextPos.y, this.playerPos.x, this.playerPos.y);
		this.stats.setScoreMove(this.stats.scoreMoves + 1);

		this.stats.logging(this.playerPos.x, this.playerPos.y, nextBlockPos.x, nextBlockPos.y);
		
		this.playerPos = {...nextPos};
		
		if(this.getScore() === this.winCount) {
			this.stats.stopTime();
		}
	}

	moveItem(char, nextPosX, nextPosY, oldPosX, oldPosY) {
		let nextChar = char;
		if(char !== this.theme.player) {
			nextChar = this.toggleActiveChar(
				nextPosX, nextPosY, this.theme.active, this.theme.item);
		}

		const oldChar = this.toggleActiveChar(
			oldPosX, oldPosY, this.theme.target, this.theme.empty);

		this.map.drawItem(nextChar, nextPosX, nextPosY, oldChar, oldPosX, oldPosY);
	}

	getScore() {
		return this.map.countChar(this.theme.active);
	}
	
	undo() {
		const pos = this.stats.undo();
		if(!pos) return false;

		const oldChar = this.toggleActiveChar(
			this.playerPos.x, this.playerPos.y, this.theme.target, this.theme.empty);

		this.map.drawItem(
			this.theme.player, pos.x, pos.y,
			oldChar, this.playerPos.x, this.playerPos.y);

		if(pos.moved) {
			const newCharBlock = this.toggleActiveChar(
				this.playerPos.x, this.playerPos.y, this.theme.active, this.theme.item);
			const oldCharBlock = this.toggleActiveChar(
				pos.moved.x, pos.moved.y, this.theme.target, this.theme.empty);

			this.map.drawItem(
				newCharBlock, this.playerPos.x, this.playerPos.y,
				oldCharBlock, pos.moved.x, pos.moved.y);
		}

		this.playerPos = {x: pos.x, y: pos.y};
	}

	setTheme(theme) {
		this.theme = Object.assign({}, this.theme, theme);
	}

	getNextPos(posX, posY, directonKey) {
		let nextPos = {x: posX, y: posY};
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

	toggleActiveChar(posX, posY, activeChar, deactiveChar) {
		const originalChar = this.map.originalMap[posY][posX];
		if(originalChar === this.theme.target || originalChar === this.theme.active) {
			return activeChar; // activate an item
		} else {
			return deactiveChar; // deactivate an item
		}
	}
}


export class GameStats {
	constructor(movesEl, pushesEl, timeEl) {
		this.playerScore;
		
		this.scoreMoves;
		this.movesEl = movesEl;

		this.scorePushes;
		this.pushesEl = pushesEl;

		this.scoreTime;
		this.timeInterval = null;
		this.timeEl = timeEl;
		
		this.log = [];
		this.logMaxLength = 200;

		this.init();
	}

	init() {
		this.setScoreMove(0);
		this.setScorePush(0);
		this.setTime(0);
		this.timeInterval = setInterval(() => {
			this.setTime(this.scoreTime + 1);
		}, 1000);
	}

	setScoreMove(point) {
		this.scoreMoves = point;
		this.movesEl.innerText = this.scoreMoves.toString().padStart(4, '0');
	}

	setScorePush(point) {
		this.scorePushes = point;
		this.pushesEl.innerText = this.scorePushes.toString().padStart(4, '0');
	}

	setTime(time) {
		this.scoreTime = time;
		let hh = Math.floor(time / 3600);
		let mm = Math.floor((time % 3600) / 60);
		let ss = Math.floor(time % 60);

		hh = hh.toString().padStart(2, '0');
		mm = mm.toString().padStart(2, '0');
		ss = ss.toString().padStart(2, '0');
		
		this.timeEl.innerText = `${hh}:${mm}:${ss}`;
	}

	stopTime() {
		clearInterval(this.timeInterval);
	}

	logging(posX, posY, blockPosX, blockPosY) {
		let moved = null;
		if(blockPosX && blockPosY) {
			moved = {
				x: blockPosX,
				y: blockPosY,
			}
		}
		this.log.push({
			x: posX,
			y: posY,
			moved
		});

		this.log = this.log.slice(-1 * this.logMaxLength);
	}

	undo() {
		if(this.log.length <= 1) return null;
		return this.log.pop();
	}
}


export class GameMap {
	constructor(map, canvas, theme) {
		this.canvas = canvas;
		this.standardLevelEncoding = {
			'@': 'player',
			' ': 'empty',
			'X': 'wall',
			'.': 'target',
			'+': 'item',
			'&': 'active',
		};

		this.parseMap(map, theme);
		this.drawMap();
	}

	parseMap(mapString, theme) {
		let map = mapString.split('\n').map(row => (row.split('')));

		if(theme && Object.keys(theme).length !== 0 && theme.constructor === Object) {
			map = map.map(row => {
				return row.map(char => {
					const key = this.standardLevelEncoding[char];
					return theme[key];
				});
			});
		}

		this.originalMap = map.map(row => [...row]);
		this.currentMap = map.map(row => [...row]);
	}

	drawMap() {
		const renderedMap = this.currentMap.map(row => (row.join('')));
		this.canvas.innerHTML = renderedMap.join('\n');
	}

	drawItem(char, posX, posY, oldChar, oldPosX, oldPosY) {
		this.currentMap[oldPosY][oldPosX] = oldChar;
		this.currentMap[posY][posX] = char;
		this.drawMap();
	}

	findChar(char) {
		for (let posY = 0; posY < this.currentMap.length; posY++) {
			const posX = this.currentMap[posY].indexOf(char);
			if(posX !== -1) {
				return {
					x: posX,
					y: posY,
				}
			}
		}
		return null;
	}

	countChar(char) {
		let charCount = 0;
		this.currentMap.map(row => {
			row.map(item => {
				if(item === char) charCount++;
			});
		});
		return charCount;
	}
}