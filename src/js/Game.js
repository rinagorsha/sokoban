export default class Game {
	constructor(levels) {
		this.levels = levels;

		this.map;
		this.stats;
		this.currentLevel;
		this.currentLevelEl = document.getElementById('js-sokoban-level');

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
		this.currentLevelEl.innerText = this.currentLevel;

		this.map = new GameMap(this.levels[level]);
		if(this.stats) this.stats.stopTime();
		this.stats = new GameStats();

		this.winCount = this.map.count(this.targetChar) + this.map.count(this.activeChar);
		this.score = this.map.count(this.activeChar);

		this.playerPos = this.map.findChar(this.playerChar);
	}

	move(keyCode) {
		if(this.score === this.winCount) {
			return;
		}

		// debug
		if(keyCode === 32) {
			this.stats.stopTime();
			this.setLevel(this.currentLevel + 1);
			return;
		}

		let nextPos = this.getNextPos(this.playerPos.x, this.playerPos.y, keyCode);
		if(!nextPos) return;

		const char = this.map.currentMap[nextPos.y][nextPos.x];
		if(char === this.wallChar) return false;
		if(char === this.itemChar || char === this.activeChar) {
			const nextBlockPos = this.getNextPos(nextPos.x, nextPos.y, keyCode);
			const char2 = this.map.currentMap[nextBlockPos.y][nextBlockPos.x];
			if(char2 === this.wallChar || char2 === this.itemChar || char2 === this.activeChar)
				return false;
			this.moveItem(char, nextBlockPos.x, nextBlockPos.y, nextPos.x, nextPos.y);
			this.stats.setScorePush(this.stats.scorePushes + 1);
		}
		
		this.moveItem(this.playerChar, nextPos.x, nextPos.y, this.playerPos.x, this.playerPos.y);
		this.stats.setScoreMove(this.stats.scoreMoves + 1);

		this.playerPos = {...nextPos};
		
		if(this.score === this.winCount) {
			this.stats.stopTime();
		}
	}

	moveItem(char, nextPosX, nextPosY, oldPosX, oldPosY) {
		let nextChar = char;
		const originalOldChar = this.map.originalMap[oldPosY][oldPosX];
		let next = this.map.currentMap[nextPosY][nextPosX];

		if(char === this.itemChar && next === this.targetChar) {
			nextChar = this.activeChar; // activate the cube
			this.score++;
		} else if(char === this.activeChar && next !== this.targetChar) {
			nextChar = this.itemChar; // deactivate the cube
			this.score--;
		}

		let oldChar = originalOldChar === this.targetChar ? this.targetChar : this.emptyChar;
		this.map.drawItem(nextChar, nextPosX, nextPosY, oldChar, oldPosX, oldPosY);
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

}

export class GameStats {
	constructor(initScore, winCount) {
		this.playerScore;
		
		this.scoreTime;
		this.timeInterval = null;
		this.timeEl = document.getElementById('js-sokoban-time');
		
		this.scorePushes;
		this.pushesEl = document.getElementById('js-sokoban-pushes');
		
		this.scoreMoves;
		this.movesEl = document.getElementById('js-sokoban-moves');

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
}


export class GameMap {
	constructor(map) {
		this.canvas = document.getElementById('js-sokoban-canvas');
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
			if (posX !== -1) {
				return {
					x: posX,
					y: posY,
				}
				break;
			}
		}
	}

	count(char) {
		let charCount = 0;
		this.currentMap.map(row => {
			row.map(item => {
				if(item === char) charCount++;
			});
		});
		return charCount;
	}
}