const KNOWN_ARTISTS = [
  // Classic Rock & Rock
  'The Beatles', 'Rolling Stones', 'Led Zeppelin', 'Pink Floyd', 'Eagles',
  'Fleetwood Mac', 'Queen', 'AC/DC', 'Aerosmith', 'The Who', 'Bob Dylan',
  'Bruce Springsteen', 'Elton John', 'Billy Joel',
  'Def Leppard', 'Journey', 'Bon Jovi', 'Guns N Roses', "Guns N' Roses",
  'Metallica', 'U2', 'Pearl Jam', 'Red Hot Chili Peppers',
  'Foo Fighters', 'Black Sabbath', 'Ozzy Osbourne', 'KISS', 'Deep Purple',
  'Lynyrd Skynyrd', 'ZZ Top', 'Tom Waits',
  'Talking Heads', 'David Byrne', 'R.E.M.',
  'The Police', 'Sting', 'Eric Clapton', 'Santana',
  'Van Morrison', 'Rod Stewart', 'Paul McCartney', 'Mick Jagger',
  'Ringo Starr', 'Roger Waters',
  'Neil Young', 'Simon & Garfunkel', 'Paul Simon',
  'James Taylor', 'Carole King', 'Joni Mitchell', 'Cat Stevens',
  'Steve Miller Band', 'Steely Dan', 'Doobie Brothers', 'Creedence Clearwater Revival',
  'CCR', 'Heart', 'Pat Benatar', 'Joan Jett', 'Blondie', 'Debbie Harry',
  'Cheap Trick', 'REO Speedwagon', 'Foreigner', 'Kansas', 'Boston',
  'Styx', 'Chicago', 'Three Dog Night', 'America',
  'The Pretenders', 'Elvis Costello', 'Sex Pistols',
  'Iggy Pop', 'Patti Smith', 'Sonic Youth', 'Pixies',
  'Radiohead', 'Thom Yorke', 'Oasis', 'Liam Gallagher', 'Noel Gallagher',
  'The Verve', 'Blur', 'Pulp', 'Suede', 'Muse', 'Coldplay',
  'Linkin Park', 'Green Day', 'Blink-182', 'The Offspring', 'Weezer',
  'Smashing Pumpkins', 'No Doubt', 'Nine Inch Nails', 'Trent Reznor', 'Marilyn Manson',
  'Tool', 'Rage Against the Machine',
  'Alice in Chains', 'Stone Temple Pilots', 'Beck', 'Jack White',
  'The White Stripes', 'The Black Keys', 'Arctic Monkeys', 'Franz Ferdinand',
  'Interpol', 'The Strokes', 'Yeah Yeah Yeahs', 'Arcade Fire',
  'Kings of Leon', 'Imagine Dragons', 'OneRepublic', 'Maroon 5',
  'Train', 'Matchbox Twenty', 'Rob Thomas', 'Dave Matthews Band',
  'Counting Crows', 'Hootie & the Blowfish', 'Barenaked Ladies',
  'Goo Goo Dolls', 'Third Eye Blind', 'Semisonic',
  // Pop
  'Madonna', 'Mariah Carey', 'Celine Dion', 'Britney Spears',
  'Justin Timberlake', 'Beyonce', 'Beyoncé',
  'Lady Gaga', 'Adele', 'Taylor Swift', 'Ed Sheeran', 'Katy Perry',
  'Rihanna', 'Ariana Grande', 'Justin Bieber', 'Bruno Mars', 'Dua Lipa',
  'The Weeknd', 'Harry Styles', 'Billie Eilish', 'Olivia Rodrigo',
  'Post Malone', 'Halsey', 'Lizzo', 'Meghan Trainor', 'Sam Smith',
  'Shawn Mendes', 'Charlie Puth', 'Camila Cabello', 'Selena Gomez',
  'Miley Cyrus', 'Demi Lovato', 'Nick Jonas', 'Jonas Brothers',
  'One Direction', 'Niall Horan', 'Zayn', 'Louis Tomlinson', 'Backstreet Boys',
  'Lorde', 'Lana Del Rey', 'Sia', 'P!nk', 'Pink', 'Nelly Furtado',
  'Duran Duran', 'Culture Club', 'Boy George',
  'Pet Shop Boys', 'Erasure', 'Depeche Mode', 'New Order', 'The Cure', 'Siouxsie',
  'Michael Buble', 'Michael Bublé', 'Josh Groban', 'Andrea Bocelli',
  'Barry Manilow', 'Neil Diamond', 'Lionel Richie', 'Kenny Loggins',
  'Christopher Cross', 'Air Supply',
  // Hip-Hop & R&B
  'Jay-Z', 'Eminem', 'Kanye West', 'Drake', 'Kendrick Lamar',
  'Nicki Minaj', 'Cardi B', 'Lil Wayne', 'Snoop Dogg', 'Dr. Dre',
  '50 Cent', 'Usher', 'Alicia Keys', 'John Legend', 'Mary J. Blige',
  'Ne-Yo', 'Chris Brown', 'Ludacris', 'T.I.', 'Lil Uzi Vert',
  'Travis Scott', 'Future', 'Megan Thee Stallion', 'DaBaby',
  'Roddy Ricch', 'Jack Harlow', 'Lil Baby', 'Gunna', 'Young Thug',
  'A$AP Rocky', 'ASAP Rocky', 'Tyler the Creator', 'Logic', 'J. Cole',
  'Big Sean', 'Wale', 'Meek Mill', 'Rick Ross', 'Wiz Khalifa',
  'Chance the Rapper', 'Childish Gambino', 'Donald Glover',
  'Outkast', 'Andre 3000', 'Big Boi', 'Missy Elliott', 'Timbaland',
  'Pharrell Williams', 'Ice Cube',
  'Nas', 'Wu-Tang Clan', 'Rakim', 'LL Cool J', 'Run-DMC', 'Public Enemy', 'Salt-N-Pepa',
  'TLC', "Destiny's Child", 'En Vogue', 'Boyz II Men', 'New Edition',
  'Bobby Brown', 'Keith Sweat', 'Brian McKnight',
  'Maxwell', "D'Angelo", 'Erykah Badu', 'Lauryn Hill',
  'The Fugees', 'Wyclef Jean', 'Pras',
  // Country
  'Garth Brooks', 'Dolly Parton', 'Willie Nelson', 'Shania Twain',
  'Tim McGraw', 'Faith Hill', 'Blake Shelton', 'Luke Bryan',
  'Kenny Chesney', 'Carrie Underwood', 'Keith Urban', 'Miranda Lambert',
  'Zac Brown Band', 'Jason Aldean', 'Eric Church', 'Luke Combs',
  'Morgan Wallen', 'Chris Stapleton', 'Kacey Musgraves', 'Maren Morris',
  'Thomas Rhett', 'Sam Hunt', 'Florida Georgia Line', 'Dan + Shay',
  'Lady Antebellum', 'Lady A', 'Darius Rucker', 'Brad Paisley',
  'Alan Jackson', 'George Strait', 'Reba McEntire',
  'Zac Brown', 'Dierks Bentley', 'Brett Eldredge',
  // Soul & Jazz
  'Stevie Wonder', 'Diana Ross', 'Al Green',
  'Herbie Hancock', 'Wynton Marsalis', 'Diana Krall', 'Norah Jones',
  // EDM & Electronic
  'David Guetta', 'Calvin Harris', 'Tiesto', 'Tiësto', 'Deadmau5',
  'Skrillex', 'Martin Garrix', 'Zedd', 'Marshmello', 'The Chainsmokers',
  'DJ Khaled', 'Diplo', 'Major Lazer', 'Swedish House Mafia',
  'Daft Punk', 'Chemical Brothers', 'Prodigy', 'Fatboy Slim',
  'Moby', 'Aphex Twin', 'Underworld', 'Basement Jaxx', 'Groove Armada',
  'Kygo', 'Illenium', 'Alesso', 'Afrojack', 'Hardwell', 'Armin van Buuren',
  'Paul van Dyk', 'Ferry Corsten', 'Above & Beyond', 'Infected Mushroom',
  // Latin
  'Shakira', 'Jennifer Lopez', 'Marc Anthony', 'Enrique Iglesias',
  'Bad Bunny', 'J Balvin', 'Maluma', 'Daddy Yankee', 'Pitbull',
  'Gloria Estefan', 'Ricky Martin', 'Luis Miguel', 'Julio Iglesias',
  'Alejandro Fernandez', 'Romeo Santos', 'Prince Royce',
  'Ozuna', 'Anuel AA', 'Karol G', 'Becky G', 'Natti Natasha',
  'Rauw Alejandro', 'Myke Towers',
  // Vegas Staples
  'Wayne Newton', 'Tom Jones', 'Engelbert Humperdinck',
  'Cirque du Soleil', 'Donny Osmond', 'Marie Osmond', 'Donny & Marie',
  'Las Vegas Philharmonic',
]

function normalise(str: string): string {
  return str
    .toLowerCase()
    .replace(/[''`]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const normalisedKnown = KNOWN_ARTISTS.map(normalise)

export function isKnownArtist(attractionName: string): boolean {
  if (!attractionName) return false
  const norm = normalise(attractionName)
  return normalisedKnown.some((known) => {
    if (norm === known) return true
    if (norm.includes(known)) return true
    if (known.includes(norm)) return true
    return false
  })
}
