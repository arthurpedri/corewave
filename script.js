let notes = [
  { key: "G3", weight: 100 },
  { key: "A3", weight: 100 },
  { key: "B3", weight: 100 },
  { key: "A4", weight: 100 },
  { key: "B4", weight: 100 },
  { key: "C4", weight: 100 },
  { key: "D4", weight: 100 },
  { key: "E4", weight: 100 },
  { key: "F4", weight: 100 },
  { key: "G4", weight: 100 },
  { key: "A5", weight: 100 },
  { key: "B5", weight: 100 },
  { key: "C5", weight: 100 },
  { key: "D5", weight: 100 },
  { key: "E5", weight: 100 },
  { key: "F5", weight: 100 },
];

notes = JSON.parse(localStorage.getItem("notes")) || notes;

let lastNote = "C4"; // Last played note for guessing on button press

// const notes = [
//   { key: "C4", weight: 100 },
//   { key: "D4", weight: 100 },
// ];

// Function to get a note with higher weight more frequently
function getWeightedRandomNote() {
  let totalWeight = notes.reduce((sum, note) => sum + note.weight, 0);
  let random = Math.random() * totalWeight;
  for (let note of notes) {
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
  const renderer = new VF.Renderer(div, VF.Renderer.Backends.SVG);
  renderer.resize(400, 200);
  const context = renderer.getContext();
  context.setFont("Arial", 10, "").setBackgroundFillStyle("#eed");
  const stave = new VF.Stave(10, 40, 150);
  stave.addClef("treble").setContext(context).draw();
  const formattedNote =
    note.key.toLowerCase().slice(0, -1) + "/" + note.key.slice(-1);
  const vfNote = new VF.StaveNote({
    clef: "treble",
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
  const note = getWeightedRandomNote();
  lastNote = note;
  renderNote(note);
  const synth = new Tone.Synth().toDestination();
  synth.triggerAttackRelease(note.key, "8n");
}

function guessNote(pressed) {
  const correctNote = notes.find((note) => note === lastNote);
  if (pressed === correctNote.key.slice(0, -1)) {
    correctNote.weight = Math.max(correctNote.weight * 0.8, 10);

    document.getElementById("currentNote").innerHTML = "Correct!";
  } else {
    correctNote.weight = Math.min(correctNote.weight * 1.25, 1000);
    document.getElementById("currentNote").innerHTML = "Incorrect!";
  }

  localStorage.setItem("notes", JSON.stringify(notes));
  playNote();
}

// Get all the noteButton divs
const noteButtons = document.getElementsByClassName("noteButton");

// Add event listener to each noteButton div
Array.from(noteButtons).forEach((noteButton) => {
  noteButton.addEventListener("click", () => {
    guessNote(noteButton.innerHTML);
  });
});

playNote();
