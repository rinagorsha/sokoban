export default class Game {
	constructor(levels, mapCanvas, movesEl, pushesEl, timeEl) {
		this.levels = levels;
		this.mapCanvas = mapCanvas;
		this.movesEl = movesEl;
		this.pushesEl = pushesEl;
		this.timeEl = timeEl;

		this.map;
		this.stats;
		this.currentLevel;

		this.emptyChar = ' ';
		this.playerChar = '@';
		this.itemChar = '+';
		this.activeChar = '&';
		this.wallChar = 'X';
		this.targetChar = '.';

		this.playerPos = {x: null, y: null};
		this.winCount;
		this.score;
	}

	setLevel(level) {
		this.currentLevel = level;
		this.map = new GameMap(this.levels[level], this.mapCanvas);

		if(this.stats) {
			this.stats.stopTime();
		}
		this.stats = new GameStats(this.movesEl, this.pushesEl, this.timeEl);

		this.winCount = this.map.countChar(this.targetChar) + this.map.countChar(this.activeChar);
		this.score = this.map.countChar(this.activeChar);

		this.playerPos = this.map.findChar(this.playerChar);
		this.stats.logging(this.playerPos.x, this.playerPos.y);
	}

	move(keyCode) {
		if(this.score === this.winCount) return;

		let nextPos = this.getNextPos(this.playerPos.x, this.playerPos.y, keyCode);
		if(!nextPos) return;

		const nextChar = this.map.currentMap[nextPos.y][nextPos.x];
		if(nextChar === this.wallChar) return false;

		let nextBlockPos = {x: null, y: null};
		if(nextChar === this.itemChar || nextChar === this.activeChar) {
			nextBlockPos = this.getNextPos(nextPos.x, nextPos.y, keyCode);
			
			const blockNextChar = this.map.currentMap[nextBlockPos.y][nextBlockPos.x];
			if (blockNextChar === this.wallChar ||
				blockNextChar === this.itemChar ||
				blockNextChar === this.activeChar) {
					return false;
			}

			this.moveItem(nextChar, nextBlockPos.x, nextBlockPos.y, nextPos.x, nextPos.y);
			this.stats.setScorePush(this.stats.scorePushes + 1);
		}
		
		this.moveItem(this.playerChar, nextPos.x, nextPos.y, this.playerPos.x, this.playerPos.y);
		this.stats.setScoreMove(this.stats.scoreMoves + 1);

		this.stats.logging(this.playerPos.x, this.playerPos.y, nextBlockPos.x, nextBlockPos.y);
		
		this.playerPos = {...nextPos};
		
		if(this.score === this.winCount) {
			this.stats.stopTime();
		}
	}

	moveItem(char, nextPosX, nextPosY, oldPosX, oldPosY) {
		let nextChar = char;
		if(char !== this.playerChar) {
			nextChar = this.toggleActiveChar(nextPosX, nextPosY, this.activeChar, this.itemChar);
		}

		const oldChar = this.toggleActiveChar(oldPosX, oldPosY, this.targetChar, this.emptyChar);

		this.map.drawItem(nextChar, nextPosX, nextPosY, oldChar, oldPosX, oldPosY);
		this.calcScore();
	}

	calcScore() {
		this.score = this.map.countChar(this.activeChar);
	}
	
	undo() {
		const pos = this.stats.undo();
		if(!pos) return false;

		const oldChar = this.toggleActiveChar(
			this.playerPos.x, this.playerPos.y, this.targetChar, this.emptyChar);

		this.map.drawItem(
			this.playerChar, pos.x, pos.y,
			oldChar, this.playerPos.x, this.playerPos.y);

		if(pos.moved) {
			const newCharBlock = this.toggleActiveChar(
				this.playerPos.x, this.playerPos.y, this.activeChar, this.itemChar);
			const oldCharBlock = this.toggleActiveChar(
				pos.moved.x, pos.moved.y, this.targetChar, this.emptyChar);

			this.map.drawItem(
				newCharBlock, this.playerPos.x, this.playerPos.y,
				oldCharBlock, pos.moved.x, pos.moved.y);
		}

		this.playerPos = {x: pos.x, y: pos.y};
		this.calcScore();
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
		if(originalChar === this.targetChar || originalChar === this.activeChar) {
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

	setScorePush(point) {
		this.scorePushes = point;
		this.pushesEl.innerText = this.scorePushes.toString().padStart(4, '0');
	}

	setScoreMove(point) {
		this.scoreMoves = point;
		this.movesEl.innerText = this.scoreMoves.toString().padStart(4, '0');
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
		if(this.log.length <= 1) return false;

		const move = this.log.pop();
		return move;
	}
}


export class GameMap {
	constructor(map, canvas) {
		this.canvas = canvas;
		this.originalMap = map.split('\n').map(row => (row.split('')));
		this.currentMap = map.split('\n').map(row => (row.split('')));

		this.drawMap();
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