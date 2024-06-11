// Sample note data
const notes = [
  { key: "C4", weight: 1 },
  { key: "D4", weight: 1 },
  { key: "E4", weight: 1 },
  // add more notes as needed
];

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
  renderer.resize(200, 200);
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
  renderNote(note);
  const synth = new Tone.Synth().toDestination();
  synth.triggerAttackRelease(note.key, "8n");
  // Update note weight logic
  note.weight += 1; // Increase weight for practice
  localStorage.setItem("notes", JSON.stringify(notes));
}

document.getElementById("play-note").addEventListener("click", playNote);
playNote();
