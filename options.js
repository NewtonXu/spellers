if(localStorage.getItem("dndJSON") === null) {
  document.getElementById("test").value = `
  {
    "spellLevel": 4,
    "spellSlots": [4,3,3],
    "sorcPoints": 5
  }
  `
} else {
  document.getElementById("test").value = localStorage.getItem("dndJSON");
}

document.getElementById("test").addEventListener("change", (event) => {
    document.getElementById("test").style.setProperty("outline", "1px solid black")
});

document.getElementById("submit").addEventListener("click", (event) => {
    console.log(document.getElementById("test").value);
    localStorage.setItem("dndJSON", document.getElementById("test").value);
    document.getElementById("test").style.setProperty("outline", "5px solid green")

    const dndJSON = JSON.parse(localStorage.getItem("dndJSON"));
    var spellLevel = dndJSON['spellLevel'];
    var spellSlots = dndJSON['spellSlots'];
    for(var i = 1; i<= spellLevel; ++i){
      localStorage.setItem("level"+i+"max", spellSlots[i-1]);
    }
    var sorcPoints = dndJSON['sorcPoints'];
    localStorage.setItem("sorcPointsmax", sorcPoints);
});