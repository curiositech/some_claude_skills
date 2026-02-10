/**
 * Track Metadata - Vaporwave/Synthwave Music Library
 */

export interface TrackMetadata {
  id: string;
  title: string;
  artist: string;
  album: string;
  year: number;
  genre: string;
  file: string;
  coverArt: string;
  duration: string;
  bpm: number;
  mood: string;
  description: string;
}

export const MUSIC_LIBRARY: TrackMetadata[] = [
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

export const GENRE_COLORS = {
  'Vaporwave': { primary: '#FFAFEF', secondary: '#7DE0FF', gradient: ['#FFAFEF', '#7DE0FF', '#B595FF'] },
  'Synthwave': { primary: '#FF3BAE', secondary: '#00EDFF', gradient: ['#FF3BAE', '#FF006E', '#00EDFF'] },
  'Synth-Pop': { primary: '#FF69B4', secondary: '#87CEEB', gradient: ['#FF69B4', '#DDA0DD', '#87CEEB'] },
  'Future Funk': { primary: '#FF8C00', secondary: '#FF1493', gradient: ['#FF8C00', '#FFD700', '#FF1493'] },
  'Chillwave': { primary: '#98D8C8', secondary: '#F7DC6F', gradient: ['#98D8C8', '#F5B7B1', '#F7DC6F'] },
  'Hyperpop': { primary: '#FF00FF', secondary: '#00FFFF', gradient: ['#FF00FF', '#00FF00', '#00FFFF'] }
};

export function getTrackById(id: string): TrackMetadata | undefined {
  return MUSIC_LIBRARY.find(track => track.id === id);
}

export function getGenreColors(genre: string) {
  return GENRE_COLORS[genre as keyof typeof GENRE_COLORS] || GENRE_COLORS.Vaporwave;
}
