class Sigil {
    constructor(name, sigilCost, sigilGrowth, manaCost, manaGrowth) {
        this.name = name;
        this.sigilCost = sigilCost;
        this.sigilGrowth = sigilGrowth;
        this.manaCost = manaCost;
        this.manaGrowth = manaGrowth;
    }

    calculateSigilCost(sequenceLength) {
        return this.sigilCost + this.sigilGrowth * sequenceLength;
    }

    calculateManaCost(sequenceLength) {
        return this.manaCost + this.manaGrowth * sequenceLength;
    }
}

class SigilSlot {
    constructor(name, sigilCost, manaCost) {
        this.name = name;
        this.sigilCost = sigilCost;
        this.manaCost = manaCost;
    }
}

class SigilManager {
    constructor(spellcounters, sigils) {
        this.sigilCounterIncrement = Number(spellcounters);
        var arrSigils = new Map();
        for (var i_sigil in sigils) {
            var sigil = sigils[i_sigil];
            var conSigil = new Sigil(sigil[0], sigil[1], sigil[2], sigil[3], sigil[4]);
            arrSigils.set(sigil[0], conSigil);
        }
        this.sigils = arrSigils;
        this.sequenceLength = 0;
        this.currentSequence = [];
        this.commitedSequence = "";
        this.currentManaCost = 0;
        this.currentSigilCost = 0;
        this.sigilCounters = 0;
    }

    serializeCurrentSequence() {
        var stringbuilder = "";
        for (var i in this.currentSequence) {
            var sigilSlot = this.currentSequence[i];
            if (i != 0) stringbuilder += ",";
            stringbuilder += sigilSlot.name + "_" + sigilSlot.manaCost + "_" + sigilSlot.sigilCost;
        }
        localStorage.setItem("sm_currentSequence", stringbuilder);
    }

    deserializeCurrentSequence() {
        this.currentSequence = [];
        var text_sequence = localStorage.getItem("sm_currentSequence");
        if (text_sequence === null) {
            return;
        } else {
            const sigilSlots = text_sequence.split(",");
            for (var i in sigilSlots) {
                var sigilSlot = sigilSlots[i].split("_");
                this.currentSequence.push(new SigilSlot(sigilSlot[0], Number(sigilSlot[1]), Number(sigilSlot[2])));
            }
        }
    }

    hardReset() {
        this.sequenceLength = 0;
        this.currentSequence = [];
        this.commitedSequence = "";
        this.currentManaCost = 0;
        this.currentSigilCost = 0;
        this.sigilCounters = 0;
        this.updateLocalStorage();
        this.updateCounterGraphic();
        this.recomputeSigils();
        this.updateTrackerGraphic();
        this.updateCommitTable();
    }

    updateLocalStorage() {
        localStorage.setItem("sm_sigilIncrement", this.sigilCounterIncrement);
        localStorage.setItem("sm_sequenceLength", this.sequenceLength);
        localStorage.setItem("sm_currentManaCost", this.currentManaCost);
        localStorage.setItem("sm_currentSigilCost", this.currentSigilCost);
        localStorage.setItem("sm_sigilCounters", this.sigilCounters);
        localStorage.setItem("sm_commitedSequence", this.commitedSequence);
        this.serializeCurrentSequence();
    }

    updateFromLocalStorage() {
        if (localStorage.getItem("sm_sequenceLength") === null) {
            localStorage.setItem("sm_sequenceLength", this.sequenceLength);
        }
        if (localStorage.getItem("sm_currentManaCost") === null) {
            localStorage.setItem("sm_currentManaCost", this.currentManaCost);
        }
        if (localStorage.getItem("sm_currentSigilCost") === null) {
            localStorage.setItem("sm_currentSigilCost", this.currentSigilCost);
        }
        if (localStorage.getItem("sm_sigilCounters") === null) {
            localStorage.setItem("sm_sigilCounters", this.sigilCounters);
        }
        if (localStorage.getItem("sm_commitedSequence") === null) {
            localStorage.getItem("sm_commitedSequence", this.commitedSequence);
        }

        this.sequenceLength = Number(localStorage.getItem("sm_sequenceLength"));
        this.currentManaCost = Number(localStorage.getItem("sm_currentManaCost"));
        this.currentSigilCost = Number(localStorage.getItem("sm_currentSigilCost"));
        this.sigilCounters = Number(localStorage.getItem("sm_sigilCounters"));
        this.deserializeCurrentSequence();
        this.commitedSequence = localStorage.getItem("sm_commitedSequence");
    }

    incrementSigilCounters() {
        this.sigilCounters = this.sigilCounters + this.sigilCounterIncrement;
        this.updateLocalStorage();
    }

    decrementSigilCounters() {
        this.sigilCounters = this.sigilCounters - this.sigilCounterIncrement;
        this.updateLocalStorage();
    }

    updateSpellSequenceTracker(sigilName, freeSigil) {
        var freeSigilMultiplier = 1;
        if (freeSigil) freeSigilMultiplier = 0;
        var sigil = sigilManager.sigils.get(sigilName);
        var sigilCost = freeSigilMultiplier * sigil.calculateSigilCost(sigilManager.sequenceLength);
        var manaCost = freeSigilMultiplier * sigil.calculateManaCost(sigilManager.sequenceLength);

        this.currentSequence.push(new SigilSlot(sigil.name,
            sigilCost,
            manaCost));
        this.currentManaCost += manaCost;
        this.currentSigilCost += sigilCost;
        this.sequenceLength++;
        this.recomputeSigils();
        this.updateLocalStorage();
        this.updateCounterGraphic();
        this.updateTrackerGraphic();
    }

    rollbackSequence() {
        if (this.currentSequence.length < 1) {
            return;
        }; 
        var sigilSlot = this.currentSequence.pop();
        this.sequenceLength--;
        this.currentManaCost -= sigilSlot.manaCost;
        this.currentSigilCost -= sigilSlot.sigilCost;
        this.updateLocalStorage();
        this.recomputeSigils();
        this.updateCounterGraphic();
        this.updateTrackerGraphic();
    }

    updateTrackerGraphic() {
        var sequenceString = "";
        for (var i in this.currentSequence) {
            var sigilSlot = this.currentSequence[i];
            sequenceString += sigilSlot.name + ",";
        }
        document.getElementById("currentSequence").innerHTML = sequenceString;
        document.getElementById("currentSigilCost").innerHTML = "Sigil cost = " + this.currentSigilCost;
        document.getElementById("currentManaCost").innerHTML = "Mana cost = " + this.currentManaCost;
    }

    recomputeSigils() {
        for (const [key, value] of sigilManager.sigils) {
            var sigil = sigilManager.sigils.get(key);
            document.getElementById("sigilCost" + sigil.name).innerHTML = "Sigil=" + sigil.calculateSigilCost(sigilManager.sequenceLength);
            document.getElementById("manaCost" + sigil.name).innerHTML = "Mana=" + sigil.calculateManaCost(sigilManager.sequenceLength);
        }
    }

    updateCounterGraphic() {
        document.getElementById("channelMagicRemaining").style.setProperty("outline", "");
        document.getElementById("channelMagicCounter").innerHTML = sigilManager.sigilCounters;
        document.getElementById("channelMagicRemaining").innerHTML = sigilManager.sigilCounters - sigilManager.currentSigilCost;
    }

    initialGraphic() {
        this.recomputeSigils();
        this.updateTrackerGraphic();
        this.updateCounterGraphic();
        this.updateCommitTable();
    }

    attemptCommit() {
        if (this.sequenceLength < 1) return;
        if (this.currentSigilCost > this.sigilCounters) {
            document.getElementById("channelMagicRemaining").style.setProperty("outline", "1px solid red");
            return;
        }
        var sequenceString = "";
        for (var i in this.currentSequence) {
            var sigilSlot = this.currentSequence[i];
            sequenceString += sigilSlot.name + ",";
        }
        var sigilCost = "Sigil cost = " + this.currentSigilCost;
        var manaCost = "Mana cost = " + this.currentManaCost;

        this.commitedSequence += "<tr><td>Spell=" + sequenceString + "</td>";
        this.commitedSequence += "<td>" + sigilCost + "</td>";
        this.commitedSequence += "<td>" + manaCost + "</td></tr>";
        console.log(this.commitedSequence);
        this.currentSequence = [];
        this.sigilCounters = this.sigilCounters - this.currentSigilCost;
        this.sequenceLength = 0;
        this.currentManaCost = 0;
        this.currentSigilCost = 0;
        this.updateLocalStorage();
        this.initialGraphic();
    }

    updateCommitTable() {
        document.getElementById("commitTable").innerHTML = this.commitedSequence;
    }
}

const dndJSON = JSON.parse(localStorage.getItem("dndJSON"));
console.log(dndJSON);
var sigilManager = new SigilManager(dndJSON["discipline"] * 10, dndJSON["sigils"]);
sigilManager.updateFromLocalStorage();
var generatedTable = "<table>"
generatedTable += `<tr>
                    <td><button class="increment" id="channelMagic">Channel Magic</button></td>
                    <td id="channelMagicCounter">0</td>
                    <td id="channelMagicRemaining">0</td>
                    <td><button class="decrement" id="undoChannelMagic">[Undo]</button></td>
                   </tr>
                    `;
generatedTable += `<tr><td>Sigils</td></tr>`
var spellLengthCounter = sigilManager.sequenceLength;
for (const [key, value] of sigilManager.sigils) {
    var sigil = sigilManager.sigils.get(key);
    generatedTable += `<tr>
                        <td><button class="increment" id="sigil${sigil.name}">${sigil.name}</button></td>
                        <td id="sigilCost${sigil.name}">Sigil=${sigil.calculateSigilCost(spellLengthCounter)}</td>
                        <td id="manaCost${sigil.name}">Mana=${sigil.calculateManaCost(spellLengthCounter)}</td>
                        <td><button class="increment" id="sigilNoCost${sigil.name}">Add free ${sigil.name}</button></td>
                       </tr>`;
}
generatedTable += `<tr>
                       <td id="currentSequence">Current sequence = </td>
                       <td id="currentSigilCost">Sigil cost = </td>
                       <td id="currentManaCost">Mana cost = </td>
                   </tr>`
generatedTable += `<tr><td><button class="reset" id="hardreset">Hard Reset</button></td>
                       <td><button id="commit">Commit</button></td>
                       <td><button id="undoSequence">Rollback Last</button></td>
                   </tr>`
generatedTable += "</table>";
generatedTable += `<table id="commitTable"></table>`;
document.getElementById("slots").innerHTML = generatedTable;

sigilManager.initialGraphic();
// Channel magic
var channelMagicButton = document.getElementById("channelMagic");
channelMagicButton.addEventListener("click", (event) => {
    sigilManager.incrementSigilCounters();
    sigilManager.updateCounterGraphic(); 
});

var undoButton = document.getElementById("undoChannelMagic");
undoButton.addEventListener("click", (event) => {
    sigilManager.decrementSigilCounters(); 
    sigilManager.updateCounterGraphic();
});

// Sigil activation
const regex1 = /^sigil(.+)/g;
const regex2 = /^sigilNoCost(.+)/g;
for (const [key, value] of sigilManager.sigils) {
    var sigil = sigilManager.sigils.get(key);
    var sigilButton = document.getElementById("sigil" + sigil.name);
    sigilButton.addEventListener("click", (event) => {
        var sigilName = regex1.exec(event.target.id)[1];
        regex1.lastIndex = 0;
        sigilManager.updateSpellSequenceTracker(sigilName, false);
        sigilManager.recomputeSigils();
    });
    var freeSigilButton = document.getElementById("sigilNoCost" + sigil.name);
    freeSigilButton.addEventListener("click", (event) => {
        var sigilName = regex2.exec(event.target.id)[1];
        regex2.lastIndex = 0;
        sigilManager.updateSpellSequenceTracker(sigilName, true);
        sigilManager.recomputeSigils();
    });
}

// Hard reset
var hardResetButton = document.getElementById("hardreset");
hardResetButton.addEventListener("click", (event) => {
    sigilManager.hardReset();
});

// Commit sequence
var commitButton = document.getElementById("commit");
commitButton.addEventListener("click", (event) => {
    sigilManager.attemptCommit();
});

var sequenceButton = document.getElementById("undoSequence");
sequenceButton.addEventListener("click", (event) => {
    sigilManager.rollbackSequence();
});

