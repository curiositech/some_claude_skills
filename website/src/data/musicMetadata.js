"use strict";
/**
 * Track Metadata with Fake Bands, Albums, and Vaporwave Aesthetics
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GENRE_COLORS = exports.MUSIC_LIBRARY = void 0;
exports.getTrackById = getTrackById;
exports.getGenreColors = getGenreColors;
exports.MUSIC_LIBRARY = [
    // Charli XCX & Troye Sivan - 1999 (Lo-Fi)
    {
        id: '1999-lofi',
        title: '1999 (Lo-Fi)',
        artist: 'Charli XCX & Troye Sivan',
        album: 'PROGRAM.EXE',
        year: 2018,
        genre: 'Synth-Pop',
        file: '/audio/1999-lofi.mp3',
        coverArt: '/img/covers/1999-lofi.png',
        duration: '03:03',
        bpm: 105,
        mood: 'Nostalgic, Euphoric',
        description: 'Y2K nostalgia through a lo-fi haze'
    },
    // Blank Banshee - MIDImorphosis
    {
        id: 'bb-ovum',
        title: 'OVUM',
        artist: 'Blank Banshee',
        album: 'MIDImorphosis',
        year: 2019,
        genre: 'Vaporwave',
        file: '/audio/01 OVUM.mid',
        coverArt: '/img/covers/blank-banshee-midimorphosis.png',
        duration: '01:45',
        bpm: 140,
        mood: 'Ethereal, Birth',
        description: 'The genesis - digital embryo awakening'
    },
    {
        id: 'bb-spawn',
        title: 'SPAWN',
        artist: 'Blank Banshee',
        album: 'MIDImorphosis',
        year: 2019,
        genre: 'Vaporwave',
        file: '/audio/02 SPAWN.mid',
        coverArt: '/img/covers/blank-banshee-midimorphosis.png',
        duration: '02:30',
        bpm: 138,
        mood: 'Energetic, Emergence',
        description: 'Breaking through the digital membrane'
    },
    {
        id: 'bb-larva',
        title: 'LARVA',
        artist: 'Blank Banshee',
        album: 'MIDImorphosis',
        year: 2019,
        genre: 'Vaporwave',
        file: '/audio/03 LARVA.mid',
        coverArt: '/img/covers/blank-banshee-midimorphosis.png',
        duration: '02:15',
        bpm: 135,
        mood: 'Crawling, Evolution',
        description: 'First movements in the data stream'
    },
    {
        id: 'bb-web',
        title: 'WEB',
        artist: 'Blank Banshee',
        album: 'MIDImorphosis',
        year: 2019,
        genre: 'Vaporwave',
        file: '/audio/04 WEB.mid',
        coverArt: '/img/covers/blank-banshee-midimorphosis.png',
        duration: '02:45',
        bpm: 142,
        mood: 'Tangled, Network',
        description: 'Weaving through internet protocols'
    },
    {
        id: 'bb-worm',
        title: 'WORM',
        artist: 'Blank Banshee',
        album: 'MIDImorphosis',
        year: 2019,
        genre: 'Vaporwave',
        file: '/audio/05 WORM.mid',
        coverArt: '/img/covers/blank-banshee-midimorphosis.png',
        duration: '02:00',
        bpm: 128,
        mood: 'Slithering, Code',
        description: 'Burrowing through corrupted data'
    },
    {
        id: 'bb-apolysis',
        title: 'APOLYSIS',
        artist: 'Blank Banshee',
        album: 'MIDImorphosis',
        year: 2019,
        genre: 'Vaporwave',
        file: '/audio/06 APOLYSIS.mid',
        coverArt: '/img/covers/blank-banshee-midimorphosis.png',
        duration: '03:00',
        bpm: 140,
        mood: 'Shedding, Transition',
        description: 'Molting the old program shell'
    },
    {
        id: 'bb-pupa',
        title: 'PUPA',
        artist: 'Blank Banshee',
        album: 'MIDImorphosis',
        year: 2019,
        genre: 'Vaporwave',
        file: '/audio/07 PUPA.mid',
        coverArt: '/img/covers/blank-banshee-midimorphosis.png',
        duration: '01:50',
        bpm: 132,
        mood: 'Dormant, Transformation',
        description: 'Suspended in the chrysalis buffer'
    },
    {
        id: 'bb-fluid',
        title: 'FLUID',
        artist: 'Blank Banshee',
        album: 'MIDImorphosis',
        year: 2019,
        genre: 'Vaporwave',
        file: '/audio/08 FLUID.mid',
        coverArt: '/img/covers/blank-banshee-midimorphosis.png',
        duration: '02:40',
        bpm: 136,
        mood: 'Flowing, Liquid',
        description: 'Dissolving into pure information'
    },
    {
        id: 'bb-mezo',
        title: 'MEZO',
        artist: 'Blank Banshee',
        album: 'MIDImorphosis',
        year: 2019,
        genre: 'Vaporwave',
        file: '/audio/09 MEZO.mid',
        coverArt: '/img/covers/blank-banshee-midimorphosis.png',
        duration: '03:20',
        bpm: 144,
        mood: 'Ancient, Primordial',
        description: 'Echoes from the Mesozoic net'
    },
    {
        id: 'bb-marsh',
        title: 'MARSH',
        artist: 'Blank Banshee',
        album: 'MIDImorphosis',
        year: 2019,
        genre: 'Vaporwave',
        file: '/audio/10 MARSH .mid',
        coverArt: '/img/covers/blank-banshee-midimorphosis.png',
        duration: '02:10',
        bpm: 130,
        mood: 'Murky, Swamp',
        description: 'Wading through data swamps'
    },
    {
        id: 'bb-swarm',
        title: 'SWARM',
        artist: 'Blank Banshee',
        album: 'MIDImorphosis',
        year: 2019,
        genre: 'Vaporwave',
        file: '/audio/11 SWARM.mid',
        coverArt: '/img/covers/blank-banshee-midimorphosis.png',
        duration: '03:10',
        bpm: 148,
        mood: 'Chaotic, Multiplicative',
        description: 'Exponential replication cascade'
    },
    {
        id: 'bb-exdysis',
        title: 'EXDYSIS',
        artist: 'Blank Banshee',
        album: 'MIDImorphosis',
        year: 2019,
        genre: 'Vaporwave',
        file: '/audio/12 EXDYSIS.mid',
        coverArt: '/img/covers/blank-banshee-midimorphosis.png',
        duration: '03:00',
        bpm: 142,
        mood: 'Emerging, Breaking Free',
        description: 'Final molt before ascension'
    },
    {
        id: 'bb-imago',
        title: 'IMAGO',
        artist: 'Blank Banshee',
        album: 'MIDImorphosis',
        year: 2019,
        genre: 'Vaporwave',
        file: '/audio/13 IMAGO.mid',
        coverArt: '/img/covers/blank-banshee-midimorphosis.png',
        duration: '01:40',
        bpm: 138,
        mood: 'Perfect, Complete',
        description: 'Fully realized digital being'
    },
    {
        id: 'bb-petrify',
        title: 'PETRIFY',
        artist: 'Blank Banshee',
        album: 'MIDImorphosis',
        year: 2019,
        genre: 'Vaporwave',
        file: '/audio/14 PETRIFY.mid',
        coverArt: '/img/covers/blank-banshee-midimorphosis.png',
        duration: '01:30',
        bpm: 125,
        mood: 'Stone, Frozen',
        description: 'Crystallized in amber code'
    },
    {
        id: 'bb-opalized',
        title: 'OPALIZED',
        artist: 'Blank Banshee',
        album: 'MIDImorphosis',
        year: 2019,
        genre: 'Vaporwave',
        file: '/audio/15 OPALIZED.mid',
        coverArt: '/img/covers/blank-banshee-midimorphosis.png',
        duration: '01:15',
        bpm: 120,
        mood: 'Iridescent, Eternal',
        description: 'Fossilized in rainbow ROM'
    },
    // AI-Generated Vaporwave/Synthwave tracks
    {
        id: 'blank-banshee-flow',
        title: 'Blank Banshee Flow',
        artist: '████ DIGITAL',
        album: 'MEGA',
        year: 1995,
        genre: 'Vaporwave',
        file: '/audio/blank-banshee-flow.mid',
        coverArt: '/img/covers/blank-banshee-flow.png',
        duration: '03:24',
        bpm: 75,
        mood: 'Dreamy, Nostalgic',
        description: 'Slowed samples from a mall that never existed'
    },
    {
        id: 'neon-dreams',
        title: 'Neon Dreams',
        artist: 'CYBER LOTUS',
        album: 'Digital Paradise',
        year: 1998,
        genre: 'Vaporwave',
        file: '/audio/neon-dreams.mid',
        coverArt: '/img/covers/neon-dreams.png',
        duration: '03:45',
        bpm: 85,
        mood: 'Uplifting, Ethereal',
        description: 'Pastel skies over chrome oceans'
    },
    {
        id: 'outrun-nights',
        title: 'Outrun Nights',
        artist: 'MIAMI REWIND',
        album: 'Neon Highway',
        year: 1984,
        genre: 'Synthwave',
        file: '/audio/outrun-nights.mid',
        coverArt: '/img/covers/outrun-nights.png',
        duration: '04:12',
        bpm: 128,
        mood: 'Energetic, Driving',
        description: 'DX7 arpeggios racing through digital sunsets'
    },
    {
        id: 'dark-ritual',
        title: 'Dark Ritual',
        artist: '△SALEM△',
        album: 'King Night',
        year: 2010,
        genre: 'Witch House',
        file: '/audio/dark-ritual.mid',
        coverArt: '/img/covers/dark-ritual.png',
        duration: '05:18',
        bpm: 70,
        mood: 'Dark, Hypnotic',
        description: 'Haunted trap beats from the void'
    },
    {
        id: 'vapor-trap',
        title: 'Vapor Trap',
        artist: 'LUXURY ELITE',
        album: 'With Love',
        year: 2013,
        genre: 'Vaportrap',
        file: '/audio/vapor-trap.mid',
        coverArt: '/img/covers/vapor-trap.png',
        duration: '03:56',
        bpm: 85,
        mood: 'Smooth, Chill',
        description: 'Jazz keys meet 808s in a digital lounge'
    },
    {
        id: 'chip-dreams',
        title: 'Chip Dreams',
        artist: 'DEMOSCENE LEGENDS',
        album: 'FastTracker Forever',
        year: 1996,
        genre: 'Chiptune',
        file: '/audio/chip-dreams.mid',
        coverArt: '/img/covers/chip-dreams.png',
        duration: '02:48',
        bpm: 150,
        mood: 'Energetic, Nostalgic',
        description: 'Pure tracker magic from the Amiga era'
    },
    {
        id: 'mall-soft',
        title: 'Mall Soft',
        artist: 'ESPRIT 空想',
        album: 'Virtua.zip',
        year: 1992,
        genre: 'Vaporwave',
        file: '/audio/mall-soft.mid',
        coverArt: '/img/covers/mall-soft.png',
        duration: '04:32',
        bpm: 72,
        mood: 'Relaxed, Nostalgic',
        description: 'Smooth jazz echoing through empty corridors'
    },
    // ElevenLabs AI-Generated Tracks (MP3)
    {
        id: 'nineties-nostalgia',
        title: 'Nineties Nostalgia',
        artist: 'CRYSTAL REWIND',
        album: 'Y2K Dreams',
        year: 1999,
        genre: 'Synth-Pop',
        file: '/audio/nineties-nostalgia.mp3',
        coverArt: '/img/covers/nineties-nostalgia.png',
        duration: '03:00',
        bpm: 118,
        mood: 'Euphoric, Carefree',
        description: 'Bright shimmering synths and summer disco vibes'
    },
    {
        id: 'midnight-mall',
        title: 'Midnight Mall',
        artist: 'PLAZA DREAMS',
        album: 'After Hours',
        year: 1991,
        genre: 'Vaporwave',
        file: '/audio/midnight-mall.mp3',
        coverArt: '/img/covers/midnight-mall.png',
        duration: '03:00',
        bpm: 70,
        mood: 'Hazy, Nostalgic',
        description: 'VHS memories of empty corridors and distant saxophones'
    },
    {
        id: 'neon-noir',
        title: 'Neon Noir',
        artist: 'MIDNIGHT RUNNER',
        album: 'Dark Highway',
        year: 1984,
        genre: 'Synthwave',
        file: '/audio/neon-noir.mp3',
        coverArt: '/img/covers/neon-noir.png',
        duration: '03:00',
        bpm: 95,
        mood: 'Dark, Cinematic',
        description: 'Rain-soaked streets and ominous pulsing arpeggios'
    },
    {
        id: 'tokyo-sunset',
        title: 'Tokyo Sunset',
        artist: 'PLASTIC LOVE',
        album: 'City Pop Forever',
        year: 1985,
        genre: 'Future Funk',
        file: '/audio/tokyo-sunset.mp3',
        coverArt: '/img/covers/tokyo-sunset.png',
        duration: '03:00',
        bpm: 120,
        mood: 'Energetic, Funky',
        description: 'Disco strings and slap bass at golden hour'
    },
    {
        id: 'coastal-haze',
        title: 'Coastal Haze',
        artist: 'TORO Y MOI 2',
        album: 'Beach Memories',
        year: 2011,
        genre: 'Chillwave',
        file: '/audio/coastal-haze.mp3',
        coverArt: '/img/covers/coastal-haze.png',
        duration: '03:00',
        bpm: 80,
        mood: 'Dreamy, Peaceful',
        description: 'Reverb-drenched guitars through sunset fog'
    },
    {
        id: 'sugar-glitch',
        title: 'Sugar Glitch',
        artist: 'CRYSTAL CASTLES 2.0',
        album: 'Digital Overload',
        year: 2023,
        genre: 'Hyperpop',
        file: '/audio/sugar-glitch.mp3',
        coverArt: '/img/covers/sugar-glitch.png',
        duration: '02:30',
        bpm: 140,
        mood: 'Chaotic, Energetic',
        description: 'Maximum sensory overload with glitchy 808s'
    },
];
/**
 * Genre color themes for UI
 */
exports.GENRE_COLORS = {
    'Vaporwave': {
        primary: '#FFAFEF', // Vaporwave pink
        secondary: '#7DE0FF', // Vaporwave blue
        gradient: ['#FFAFEF', '#7DE0FF', '#B595FF']
    },
    'Synthwave': {
        primary: '#FF3BAE', // Hot pink
        secondary: '#00EDFF', // Cyan
        gradient: ['#FF3BAE', '#FF006E', '#00EDFF']
    },
    'Witch House': {
        primary: '#8B00FF', // Dark purple
        secondary: '#FF1744', // Dark red
        gradient: ['#2E2E38', '#8B00FF', '#FF1744']
    },
    'Vaportrap': {
        primary: '#ABFFE3', // Mint
        secondary: '#FFC48A', // Orange
        gradient: ['#ABFFE3', '#7DE0FF', '#FFC48A']
    },
    'Chiptune': {
        primary: '#00FF00', // Green
        secondary: '#00FFFF', // Cyan
        gradient: ['#00FF00', '#00FFFF', '#FF00FF']
    },
    'Synth-Pop': {
        primary: '#FF69B4', // Hot pink
        secondary: '#87CEEB', // Sky blue
        gradient: ['#FF69B4', '#DDA0DD', '#87CEEB']
    },
    'Future Funk': {
        primary: '#FF8C00', // Orange
        secondary: '#FF1493', // Deep pink
        gradient: ['#FF8C00', '#FFD700', '#FF1493']
    },
    'Chillwave': {
        primary: '#98D8C8', // Seafoam
        secondary: '#F7DC6F', // Warm yellow
        gradient: ['#98D8C8', '#F5B7B1', '#F7DC6F']
    },
    'Hyperpop': {
        primary: '#FF00FF', // Magenta
        secondary: '#00FFFF', // Cyan
        gradient: ['#FF00FF', '#00FF00', '#00FFFF']
    }
};
/**
 * Get track by ID
 */
function getTrackById(id) {
    return exports.MUSIC_LIBRARY.find(function (track) { return track.id === id; });
}
/**
 * Get genre color theme
 */
function getGenreColors(genre) {
    return exports.GENRE_COLORS[genre] || exports.GENRE_COLORS.Vaporwave;
}
