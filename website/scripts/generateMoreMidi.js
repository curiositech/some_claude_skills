"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var midi_writer_js_1 = require("midi-writer-js");
/**
 * SYNTHWAVE/OUTRUN - Fast paced 80s nostalgia with DX7-style sounds
 * 128 BPM driving beat with arpeggios and pulsing bass
 */
function generateOutrunNights() {
    var tempo = 128;
    // Lead synth - DX7 style brass lead
    var leadTrack = new midi_writer_js_1.default.Track();
    leadTrack.setTempo(tempo);
    leadTrack.addInstrumentName('Synth Lead');
    leadTrack.addEvent(new midi_writer_js_1.default.ProgramChangeEvent({ instrument: 81 })); // Lead 2 (sawtooth)
    // Catchy synthwave melody
    var melody = [
        'A4', 'A4', 'C5', 'D5', 'E5', 'D5', 'C5', 'A4',
        'A4', 'A4', 'C5', 'D5', 'E5', 'E5', 'E5', 'E5',
        'G4', 'G4', 'A4', 'C5', 'D5', 'C5', 'A4', 'G4',
        'F4', 'F4', 'A4', 'C5', 'D5', 'D5', 'D5', 'D5',
    ];
    melody.forEach(function (note) {
        leadTrack.addEvent(new midi_writer_js_1.default.NoteEvent({
            pitch: note,
            duration: '8',
            velocity: 100,
        }));
    });
    // Arpeggio - Classic 80s arp pattern
    var arpTrack = new midi_writer_js_1.default.Track();
    arpTrack.setTempo(tempo);
    arpTrack.addInstrumentName('Arp Synth');
    arpTrack.addEvent(new midi_writer_js_1.default.ProgramChangeEvent({ instrument: 82 })); // Lead 3 (calliope)
    var arpPattern = ['A3', 'C4', 'E4', 'A4', 'E4', 'C4', 'A3', 'C4'];
    for (var i = 0; i < 8; i++) {
        arpPattern.forEach(function (note) {
            arpTrack.addEvent(new midi_writer_js_1.default.NoteEvent({
                pitch: note,
                duration: '16',
                velocity: 85,
            }));
        });
    }
    // Pulsing bass
    var bassTrack = new midi_writer_js_1.default.Track();
    bassTrack.setTempo(tempo);
    bassTrack.addInstrumentName('Synth Bass');
    bassTrack.addEvent(new midi_writer_js_1.default.ProgramChangeEvent({ instrument: 38 })); // Synth Bass 1
    var bassLine = ['A2', 'A2', 'A2', 'A2', 'G2', 'G2', 'G2', 'G2',
        'F2', 'F2', 'F2', 'F2', 'D2', 'D2', 'D2', 'D2'];
    bassLine.forEach(function (note) {
        bassTrack.addEvent(new midi_writer_js_1.default.NoteEvent({
            pitch: note,
            duration: '4',
            velocity: 110,
        }));
    });
    // Pad - Lush DX7 pad
    var padTrack = new midi_writer_js_1.default.Track();
    padTrack.setTempo(tempo);
    padTrack.addInstrumentName('Synth Pad');
    padTrack.addEvent(new midi_writer_js_1.default.ProgramChangeEvent({ instrument: 89 }));
    var pads = [
        ['A3', 'C4', 'E4', 'A4'],
        ['G3', 'B3', 'D4', 'G4'],
        ['F3', 'A3', 'C4', 'F4'],
        ['D3', 'F3', 'A3', 'D4'],
    ];
    pads.forEach(function (chord) {
        for (var i = 0; i < 2; i++) {
            padTrack.addEvent(new midi_writer_js_1.default.NoteEvent({
                pitch: chord,
                duration: '1',
                velocity: 70,
            }));
        }
    });
    var write = new midi_writer_js_1.default.Writer([leadTrack, arpTrack, bassTrack, padTrack]);
    return new Uint8Array(write.buildFile());
}
/**
 * WITCH HOUSE - Dark, slowed trap with eerie synths
 * 70 BPM with heavy reverb vibes, distorted sounds
 */
function generateDarkRitual() {
    var tempo = 70;
    // Eerie lead
    var leadTrack = new midi_writer_js_1.default.Track();
    leadTrack.setTempo(tempo);
    leadTrack.addInstrumentName('Dark Lead');
    leadTrack.addEvent(new midi_writer_js_1.default.ProgramChangeEvent({ instrument: 98 })); // FX 3 (crystal)
    // Haunting, sparse melody
    var melody = [
        { note: 'E5', duration: '2', wait: '4' },
        { note: 'D5', duration: '4', wait: '4' },
        { note: 'C5', duration: '2', wait: '2' },
        { note: 'B4', duration: '1', wait: '1' },
        { note: 'E5', duration: '4', wait: '4' },
        { note: 'G5', duration: '2', wait: '2' },
        { note: 'E5', duration: '2', wait: '4' },
        { note: 'C5', duration: '1', wait: '1' },
    ];
    melody.forEach(function (_a) {
        var note = _a.note, duration = _a.duration, wait = _a.wait;
        leadTrack.addEvent(new midi_writer_js_1.default.NoteEvent({
            pitch: note,
            duration: duration,
            velocity: 60,
        }));
        if (wait) {
            leadTrack.addEvent(new midi_writer_js_1.default.NoteEvent({
                pitch: 'C0',
                duration: wait,
                velocity: 0,
            }));
        }
    });
    // Distorted pad
    var padTrack = new midi_writer_js_1.default.Track();
    padTrack.setTempo(tempo);
    padTrack.addInstrumentName('Dark Pad');
    padTrack.addEvent(new midi_writer_js_1.default.ProgramChangeEvent({ instrument: 95 })); // FX 8 (sci-fi)
    var darkChords = [
        ['E3', 'G3', 'B3'],
        ['C3', 'E3', 'G3'],
        ['A2', 'C3', 'E3'],
        ['E3', 'G3', 'B3'],
    ];
    darkChords.forEach(function (chord) {
        for (var i = 0; i < 2; i++) {
            padTrack.addEvent(new midi_writer_js_1.default.NoteEvent({
                pitch: chord,
                duration: '1',
                velocity: 80,
            }));
        }
    });
    // Deep trap-style bass
    var bassTrack = new midi_writer_js_1.default.Track();
    bassTrack.setTempo(tempo);
    bassTrack.addInstrumentName('Sub Bass');
    bassTrack.addEvent(new midi_writer_js_1.default.ProgramChangeEvent({ instrument: 39 }));
    var bass = ['E1', 'E1', 'C1', 'C1', 'A1', 'A1', 'E1', 'E1'];
    bass.forEach(function (note) {
        bassTrack.addEvent(new midi_writer_js_1.default.NoteEvent({
            pitch: note,
            duration: '1',
            velocity: 120,
        }));
    });
    // High-pitched glitchy effects
    var fxTrack = new midi_writer_js_1.default.Track();
    fxTrack.setTempo(tempo);
    fxTrack.addInstrumentName('Glitch FX');
    fxTrack.addEvent(new midi_writer_js_1.default.ProgramChangeEvent({ instrument: 102 })); // FX 7 (echoes)
    var glitches = ['C7', 'D7', 'E7', 'C7', 'G6', 'A6', 'C7', 'E7'];
    glitches.forEach(function (note) {
        fxTrack.addEvent(new midi_writer_js_1.default.NoteEvent({
            pitch: note,
            duration: '16',
            velocity: 40,
        }));
        fxTrack.addEvent(new midi_writer_js_1.default.NoteEvent({
            pitch: 'C0',
            duration: '8',
            velocity: 0,
        }));
    });
    var write = new midi_writer_js_1.default.Writer([leadTrack, padTrack, bassTrack, fxTrack]);
    return new Uint8Array(write.buildFile());
}
/**
 * VAPORTRAP - Vaporwave meets trap with 808s
 * 85 BPM with slowed samples feel and trap hi-hats
 */
function generateVaporTrap() {
    var tempo = 85;
    // Slowed jazz sample feel
    var jazzTrack = new midi_writer_js_1.default.Track();
    jazzTrack.setTempo(tempo);
    jazzTrack.addInstrumentName('Jazz Keys');
    jazzTrack.addEvent(new midi_writer_js_1.default.ProgramChangeEvent({ instrument: 4 })); // Electric Piano 1
    var jazzMelody = [
        'F#4', 'A4', 'C#5', 'E5', 'C#5', 'A4',
        'F#4', 'A4', 'D5', 'F#5', 'D5', 'A4',
        'E4', 'G#4', 'B4', 'D5', 'B4', 'G#4',
        'E4', 'G#4', 'C#5', 'E5', 'C#5', 'G#4',
    ];
    jazzMelody.forEach(function (note) {
        jazzTrack.addEvent(new midi_writer_js_1.default.NoteEvent({
            pitch: note,
            duration: '8',
            velocity: 75,
        }));
    });
    // 808 Bass
    var bassTrack = new midi_writer_js_1.default.Track();
    bassTrack.setTempo(tempo);
    bassTrack.addInstrumentName('808 Bass');
    bassTrack.addEvent(new midi_writer_js_1.default.ProgramChangeEvent({ instrument: 39 }));
    var trapBass = [
        { note: 'F#1', duration: '4' },
        { note: 'F#1', duration: '8' },
        { note: 'F#1', duration: '8' },
        { note: 'E1', duration: '4' },
        { note: 'E1', duration: '4' },
    ];
    for (var i = 0; i < 4; i++) {
        trapBass.forEach(function (_a) {
            var note = _a.note, duration = _a.duration;
            bassTrack.addEvent(new midi_writer_js_1.default.NoteEvent({
                pitch: note,
                duration: duration,
                velocity: 115,
            }));
        });
    }
    // Dreamy pad
    var padTrack = new midi_writer_js_1.default.Track();
    padTrack.setTempo(tempo);
    padTrack.addInstrumentName('Dream Pad');
    padTrack.addEvent(new midi_writer_js_1.default.ProgramChangeEvent({ instrument: 89 }));
    var chords = [
        ['F#3', 'A3', 'C#4', 'F#4'],
        ['E3', 'G#3', 'B3', 'E4'],
    ];
    chords.forEach(function (chord) {
        for (var i = 0; i < 4; i++) {
            padTrack.addEvent(new midi_writer_js_1.default.NoteEvent({
                pitch: chord,
                duration: '1',
                velocity: 65,
            }));
        }
    });
    var write = new midi_writer_js_1.default.Writer([jazzTrack, bassTrack, padTrack]);
    return new Uint8Array(write.buildFile());
}
/**
 * CHIPTUNE/DEMOSCENE - Fast tracker-style music
 * 150 BPM with square wave leads and arpeggios
 */
function generateChipDreams() {
    var tempo = 150;
    // Square wave lead
    var leadTrack = new midi_writer_js_1.default.Track();
    leadTrack.setTempo(tempo);
    leadTrack.addInstrumentName('Chip Lead');
    leadTrack.addEvent(new midi_writer_js_1.default.ProgramChangeEvent({ instrument: 80 })); // Lead 1 (square)
    // Fast chiptune melody
    var chipMelody = [
        'C5', 'E5', 'G5', 'C6', 'G5', 'E5', 'C5', 'E5',
        'D5', 'F5', 'A5', 'D6', 'A5', 'F5', 'D5', 'F5',
        'E5', 'G5', 'B5', 'E6', 'B5', 'G5', 'E5', 'G5',
        'C5', 'E5', 'G5', 'C6', 'G5', 'E5', 'C5', 'C5',
    ];
    chipMelody.forEach(function (note) {
        leadTrack.addEvent(new midi_writer_js_1.default.NoteEvent({
            pitch: note,
            duration: '16',
            velocity: 100,
        }));
    });
    // Arpeggio
    var arpTrack = new midi_writer_js_1.default.Track();
    arpTrack.setTempo(tempo);
    arpTrack.addInstrumentName('Chip Arp');
    arpTrack.addEvent(new midi_writer_js_1.default.ProgramChangeEvent({ instrument: 80 }));
    var arp = ['C4', 'E4', 'G4', 'C5'];
    for (var i = 0; i < 32; i++) {
        arpTrack.addEvent(new midi_writer_js_1.default.NoteEvent({
            pitch: arp[i % 4],
            duration: '16',
            velocity: 85,
        }));
    }
    // Bass
    var bassTrack = new midi_writer_js_1.default.Track();
    bassTrack.setTempo(tempo);
    bassTrack.addInstrumentName('Chip Bass');
    bassTrack.addEvent(new midi_writer_js_1.default.ProgramChangeEvent({ instrument: 38 }));
    var bass = ['C2', 'C2', 'D2', 'D2', 'E2', 'E2', 'C2', 'C2'];
    bass.forEach(function (note) {
        for (var i = 0; i < 2; i++) {
            bassTrack.addEvent(new midi_writer_js_1.default.NoteEvent({
                pitch: note,
                duration: '4',
                velocity: 110,
            }));
        }
    });
    var write = new midi_writer_js_1.default.Writer([leadTrack, arpTrack, bassTrack]);
    return new Uint8Array(write.buildFile());
}
/**
 * MORE VAPORWAVE - Slowed jazz with heavy reverb vibes
 * 72 BPM, ultra chill
 */
function generateMallSoft() {
    var tempo = 72;
    // Slowed smooth jazz
    var jazzTrack = new midi_writer_js_1.default.Track();
    jazzTrack.setTempo(tempo);
    jazzTrack.addInstrumentName('Smooth Jazz');
    jazzTrack.addEvent(new midi_writer_js_1.default.ProgramChangeEvent({ instrument: 25 })); // Acoustic Guitar (nylon)
    var jazzChords = [
        ['D4', 'F#4', 'A4', 'C5'], // Dmaj7
        ['G3', 'B3', 'D4', 'F#4'], // Gmaj7
        ['C4', 'E4', 'G4', 'B4'], // Cmaj7
        ['F3', 'A3', 'C4', 'E4'], // Fmaj7
    ];
    jazzChords.forEach(function (chord) {
        for (var i = 0; i < 2; i++) {
            jazzTrack.addEvent(new midi_writer_js_1.default.NoteEvent({
                pitch: chord,
                duration: '1',
                velocity: 70,
            }));
        }
    });
    // Saxo phone-like lead
    var saxTrack = new midi_writer_js_1.default.Track();
    saxTrack.setTempo(tempo);
    saxTrack.addInstrumentName('Sax Lead');
    saxTrack.addEvent(new midi_writer_js_1.default.ProgramChangeEvent({ instrument: 65 })); // Alto Sax
    var saxMelody = [
        'F#5', 'E5', 'D5', 'C5', 'D5', 'A4', 'D5', 'F#5',
        'G5', 'F#5', 'E5', 'D5', 'B4', 'D5', 'G5', 'B5',
    ];
    saxMelody.forEach(function (note) {
        saxTrack.addEvent(new midi_writer_js_1.default.NoteEvent({
            pitch: note,
            duration: '4',
            velocity: 85,
        }));
    });
    // Pad
    var padTrack = new midi_writer_js_1.default.Track();
    padTrack.setTempo(tempo);
    padTrack.addInstrumentName('Vapor Pad');
    padTrack.addEvent(new midi_writer_js_1.default.ProgramChangeEvent({ instrument: 89 }));
    var pads = [
        ['D3', 'F#3', 'A3'],
        ['G3', 'B3', 'D4'],
        ['C3', 'E3', 'G3'],
        ['F3', 'A3', 'C4'],
    ];
    pads.forEach(function (chord) {
        for (var i = 0; i < 2; i++) {
            padTrack.addEvent(new midi_writer_js_1.default.NoteEvent({
                pitch: chord,
                duration: '1',
                velocity: 60,
            }));
        }
    });
    var write = new midi_writer_js_1.default.Writer([jazzTrack, saxTrack, padTrack]);
    return new Uint8Array(write.buildFile());
}
// Generate all tracks
var outputDir = path.join(__dirname, '..', 'static', 'audio');
console.log('Generating MORE vaporwave/synthwave/witch house MIDI files...\n');
var tracks = [
    { name: 'outrun-nights.mid', data: generateOutrunNights(), genre: 'Synthwave/Outrun' },
    { name: 'dark-ritual.mid', data: generateDarkRitual(), genre: 'Witch House' },
    { name: 'vapor-trap.mid', data: generateVaporTrap(), genre: 'Vaportrap' },
    { name: 'chip-dreams.mid', data: generateChipDreams(), genre: 'Chiptune/Demoscene' },
    { name: 'mall-soft.mid', data: generateMallSoft(), genre: 'Vaporwave' },
];
tracks.forEach(function (_a) {
    var name = _a.name, data = _a.data, genre = _a.genre;
    var filePath = path.join(outputDir, name);
    fs.writeFileSync(filePath, Buffer.from(data));
    console.log("\u2713 Generated ".concat(name, " (").concat(genre, ")"));
});
console.log("\n\uD83C\uDFB5 ALL TRACKS GENERATED! \uD83C\uDFB5");
console.log("Output: ".concat(outputDir));
