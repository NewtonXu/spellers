if (localStorage.getItem("dndJSON") === null) {
    document.getElementById("test").value = `
  {
    "discipline": 12,
    "sigils": [
        ["Water", 80, 10, 3, 1],
        ["Air", 80, 10, 3, 1],
        ["Project", 40, 10, 2, 1],
        ["Conjure", 60, 10, 4, 1]
    ]
  }`;
} else {
  document.getElementById("test").value = localStorage.getItem("dndJSON");
}

document.getElementById("test").addEventListener("change", (event) => {
    document.getElementById("test").style.setProperty("outline", "1px solid black")
});

document.getElementById("submit").addEventListener("click", (event) => {
    document.getElementById("test").style.setProperty("outline", "1px solid red")

    localStorage.setItem("dndJSON", document.getElementById("test").value);
    const dndJSON = JSON.parse(localStorage.getItem("dndJSON"));
    document.getElementById("test").style.setProperty("outline", "5px solid green")
});