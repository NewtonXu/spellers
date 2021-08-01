// Initialize button with user's preferred color
const regex = /(.+)_(.+)/g
var decrements = document.getElementsByClassName("decrement");
var increments = document.getElementsByClassName("add");
var resets = document.getElementsByClassName("reset");

const dndJSON = JSON.parse(localStorage.getItem("dndJSON"));

var spellLevel = dndJSON['spellLevel'];
var spellSlots = dndJSON['spellSlots'];
var sorcPoints = dndJSON['sorcPoints'];

var generatedTable = "<table>"
for(var i = 1; i<= spellLevel; i++){
	generatedTable+=`<tr>
		    <td><button class="decrement" id="level${i}_dec">Level ${i} spells</button></td>
		    <td id="level${i}_num">${spellSlots[i-1]}</td>
		    <td><button class="add" id="level${i}_add">[+]</button></td>
		</tr>`
}
generatedTable += `<tr>
		    <td><button class="decrement" id="sorcPoints_dec">Sorcerer Points</button></td>
		    <td id="sorcPoints_num">${sorcPoints}</td>
		    <td><button class="add" id="sorcPoints_add">[+]</button></td>
		</tr>`
generatedTable += `<tr><td><button class="reset">Reset</button></td></tr></table>`
document.getElementById("slots").innerHTML = generatedTable;
updateSlots();

resets[0].addEventListener("click", (event) => {
	for(var i = 1; i <= spellLevel; ++i){
		if(localStorage.getItem("level" + i + "max") === null){
			localStorage.setItem("level" + i + "max", spellSlots[i-1]);
		}
		localStorage.setItem("level" + i + "cur", localStorage.getItem("level" + i + "max"));
	}
	localStorage.setItem("sorcPointscur", localStorage.getItem("sorcPointsmax"));
	updateSlots();
})

for (var i = 0; i < decrements.length; i++) {
	decrements[i].addEventListener("click", (event) => {
		decreaseSlot(regex.exec(event.target.id)[1]);
		regex.lastIndex = 0;
	});
}

for (var i = 0; i < increments.length; i++) {
	increments[i].addEventListener("click", (event) => {
		increaseSlot(regex.exec(event.target.id)[1]);
		regex.lastIndex = 0;
	});
}

function updateSlots() {
	for(var i = 1; i<=spellLevel; ++i){
		document.getElementById("level"+i+"_num").innerHTML = localStorage.getItem("level" + i + "cur");
	}
	document.getElementById("sorcPoints_num").innerHTML = localStorage.getItem("sorcPointscur");
}

function decreaseSlot(name) {
	var max_name = name.concat("cur");
	var delta = parseInt(localStorage.getItem(max_name))-1;
	if(delta >= 0) {
		document.getElementById(name.concat("_num")).innerHTML = delta;
		localStorage.setItem(max_name, delta);
	}
}

function increaseSlot(name) {
	var max_name = name.concat("cur");
	var delta = parseInt(localStorage.getItem(max_name))+1;
	document.getElementById(name.concat("_num")).innerHTML = delta;
	localStorage.setItem(max_name, delta);
	/*
	chrome.storage.local.get(max_name,  function(result) {
		delta = result[max_name]-1;
		document.getElementById(name.concat("_num")).innerHTML = delta;
		chrome.storage.local.set({max_name: delta}, function() {
			console.log("Set to " + delta);
		});
	});
	*/
}

