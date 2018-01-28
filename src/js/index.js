const canvas = document.getElementById('js-socoban-canvas');

const player = '@';
const map =
`    XXXXX             
    X   X             
    X*  X             
  XXX  *XXX           
  X  *  * X           
XXX X XXX X     XXXXXX
X   X XXX XXXXXXX  ..X
X *  *             ..X
XXXXX XXXX X@XXXX  ..X
    X      XXX  XXXXXX
    XXXXXXXX          `;

drawMap();


document.body.addEventListener('keydown', move);

function move(e) {
	switch(e.keyCode) {
		case 38: // Up
			moveUp();
	}
}


function moveUp(position) {
	getPlayerPosition();
}

function getPlayerPosition() {
	let map = canvas.innerHTML;

	let pos = map.indexOf(player);
	pos = {
		x: 0,
		y: 0
	}

	return pos;
}

function drawMap() {
	let mapArr = map.split('\n');

	let strLength = 0;
	mapArr.map(item => {
		if(item.length > strLength)
			strLength = item.length;
	});

	mapArr = mapArr.map(item => {
		item = item + new Array(strLength).join(' ');
		item = item.slice(0, strLength);
		return item;
	});

	canvas.innerHTML = mapArr.join('\n');
}