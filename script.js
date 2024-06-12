let notes = [
  { key: "A3", weight: 100, clef: "treble" },
  { key: "G3", weight: 100, clef: "treble" },
  { key: "B3", weight: 100, clef: "treble" },
  { key: "A4", weight: 100, clef: "treble" },
  { key: "B4", weight: 100, clef: "treble" },
  { key: "C4", weight: 100, clef: "treble" },
  { key: "D4", weight: 100, clef: "treble" },
  { key: "E4", weight: 100, clef: "treble" },
  { key: "F4", weight: 100, clef: "treble" },
  { key: "G4", weight: 100, clef: "treble" },
  { key: "A5", weight: 100, clef: "treble" },
  { key: "B5", weight: 100, clef: "treble" },
  { key: "C5", weight: 100, clef: "treble" },
  { key: "D5", weight: 100, clef: "treble" },
  { key: "E5", weight: 100, clef: "treble" },
  { key: "F5", weight: 100, clef: "treble" },
  { key: "A2", weight: 100, clef: "bass" },
  { key: "F2", weight: 100, clef: "bass" },
  { key: "E2", weight: 100, clef: "bass" },
  { key: "D2", weight: 100, clef: "bass" },
  { key: "C2", weight: 100, clef: "bass" },
  { key: "B1", weight: 100, clef: "bass" },
  { key: "G2", weight: 100, clef: "bass" },
  { key: "B2", weight: 100, clef: "bass" },
  { key: "A3", weight: 100, clef: "bass" },
  { key: "B3", weight: 100, clef: "bass" },
  { key: "C3", weight: 100, clef: "bass" },
  { key: "D3", weight: 100, clef: "bass" },
  { key: "E3", weight: 100, clef: "bass" },
  { key: "F3", weight: 100, clef: "bass" },
  { key: "G3", weight: 100, clef: "bass" },
  { key: "C4", weight: 100, clef: "bass" },
  { key: "D4", weight: 100, clef: "bass" },
  { key: "E4", weight: 100, clef: "bass" },
  { key: "F4", weight: 100, clef: "bass" },
];

let clef = "treble";

clef = JSON.parse(localStorage.getItem("clef")) || clef;

notes = JSON.parse(localStorage.getItem("notes")) || notes;

let lastNote = "C4"; // Last played note for guessing on button press

// Keep track of the currently playing note
let currentNotePlayer = null;

let reward = 0;
let punishment = 1.6;

reward = JSON.parse(localStorage.getItem("reward")) || reward;
punishment = JSON.parse(localStorage.getItem("punishment")) || punishment;

function getCorrectNotes() {
  if (clef === "treble") {
    return notes.filter((note) => note.clef === "treble");
  } else if (clef === "bass") {
    return notes.filter((note) => note.clef === "bass");
  }
}

// Function to get a note with higher weight more frequently
function getweightedRandomNote() {
  const correctNotes = getCorrectNotes();
  let totalWeight = correctNotes.reduce((sum, note) => sum + note.weight, 0);
  let random = Math.random() * totalWeight;
  for (let note of correctNotes) {
    if (random < note.weight) {
      return note;
    }
    random -= note.weight;
  }
}

// Function to render a note using VexFlow
function renderNote(note) {
  const VF = Vex.Flow;
  const div = document.getElementById("notation");
  div.innerHTML = "";
  const width = div.clientWidth;
  const height = div.clientHeight;
  const renderer = new VF.Renderer(div, VF.Renderer.Backends.SVG);
  renderer.resize(width, height);
  const context = renderer.getContext();
  context.setFont("Arial", 10, "").setBackgroundFillStyle("#eed");
  const scale = window.innerWidth > 1000 ? 4 : 2;

  context.scale(scale, scale);

  const staveWidth = (width / scale) * 0.5;
  const staveHeight = (height / scale) * 0.8;
  const staveX = (width / scale - staveWidth) / 2; // Center the stave horizontally
  const staveY = (height / scale - staveHeight) / 2; // Center the stave vertically

  const stave = new VF.Stave(staveX, staveY, staveWidth);
  stave.addClef(clef).setContext(context).draw();
  const formattedNote =
    note.key.toLowerCase().slice(0, -1) + "/" + note.key.slice(-1);
  const vfNote = new VF.StaveNote({
    clef: clef,
    keys: [formattedNote],
    duration: "w",
  });
  const voice = new VF.Voice({ num_beats: 4, beat_value: 4 });
  voice.addTickables([vfNote]);
  new VF.Formatter().joinVoices([voice]).format([voice], 100);
  voice.draw(context, stave);
}

// Function to play a note using Tone.js
function playNote() {
  const note = getweightedRandomNote();
  lastNote = note;
  renderNote(note);
  const synth = new Tone.Synth().toDestination();

  // Stop the previously playing note (if any)
  if (currentNotePlayer) {
    currentNotePlayer.stop();
  }

  // Play the note multiple times with a loop
  let counter = 0;
  currentNotePlayer = new Tone.Loop(() => {
    if (counter < 4) {
      synth.triggerAttackRelease(note.key, "8n");
      counter++;
    } else {
      currentNotePlayer.stop(); // Stop the loop when the desired number of times is reached
    }
  }, "4n").start();

  // Start Tone.Transport to play the loop
  Tone.Transport.start();
}

function guessNote(pressed) {
  const correctNote = notes.find(
    (note) => note === lastNote && note.clef === clef
  );
  if (pressed === correctNote.key.slice(0, -1)) {
    const oldWeight = correctNote.weight;
    correctNote.weight = Math.max(correctNote.weight * reward, 0);

    document.getElementById("currentNote").innerHTML =
      "Correct! (" +
      correctNote.key +
      " -" +
      Math.trunc(oldWeight - correctNote.weight) +
      " weight)";
  } else {
    const oldWeight = correctNote.weight;

    correctNote.weight = Math.min(correctNote.weight * punishment, 1000);
    document.getElementById("currentNote").innerHTML =
      "Incorrect! (" +
      correctNote.key +
      " +" +
      Math.trunc(correctNote.weight - oldWeight) +
      " weight)";
  }

  localStorage.setItem("notes", JSON.stringify(notes));
  playNote();
}

function switchClef() {
  clef = clef === "bass" ? "treble" : "bass";
  localStorage.setItem("clef", JSON.stringify(clef));
  playNote();
}

function deleteStorage() {
  localStorage.clear();
  location.reload();
}

// Get all the noteButton divs
const noteButtons = document.getElementsByClassName("noteButton");

// Add event listener to each noteButton div
Array.from(noteButtons).forEach((noteButton) => {
  noteButton.addEventListener("click", () => {
    guessNote(noteButton.innerHTML);
  });
});

document
  .getElementById("deleteStorage")
  .addEventListener("click", deleteStorage);
document.getElementById("switchClef").addEventListener("click", switchClef);

const rewardPercentageSelect = document.getElementById("rewardPercentage");
const punishmentPercentageSelect = document.getElementById(
  "punishmentPercentage"
);

rewardPercentageSelect.value = reward;
punishmentPercentageSelect.value = punishment;

// Add a change listener to the reward dropdown
rewardPercentageSelect.addEventListener("change", function () {
  reward = this.value;
});

// Add a change listener to the punishment dropdown
punishmentPercentageSelect.addEventListener("change", function () {
  punishment = this.value;
});

document.getElementById("clearWeights").addEventListener("click", function () {
  notes.forEach((note) => {
    note.weight = 100;
  });
  localStorage.setItem("notes", JSON.stringify(notes));
  playNote();
});

playNote();
