import { addShow } from './db';

export async function seedDatabase() {
  const shows = [
    {
      orgId: 'play-dead-mgmt',
      tourId: 'fall-2025',
      artistId: 'bryan-martin',
      status: 'Confirmed' as const,
      date: new Date('2025-10-10T19:00:00'),
      location: { city: 'Orlando', state: 'FL', country: 'USA' },
      venue: {
        name: 'The Plaza Live',
        address: '425 North Bumby Avenue, Orlando, FL 32803',
        phone: '407-228-1220',
        website: 'www.plazaliveorlando.com',
        capacity: 1330,
      },
      financials: { guarantee: 7500, currency: 'USD' },
      buyer: { 
        company: 'AEG Presents SE, LLC',
        signatoryName: 'Nathan',
      },
      production: [{ role: 'Prod', name: 'Zach', phone: '+1 407-555-0123' }],
      attachments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      orgId: 'play-dead-mgmt',
      tourId: 'fall-2025',
      artistId: 'bryan-martin',
      status: 'Confirmed' as const,
      date: new Date('2025-10-11T20:00:00'),
      location: { city: 'Largo', state: 'FL', country: 'USA' },
      venue: {
        name: 'Cowboys Dance Hall',
        address: '12333 66th Street North, Largo, FL 33773',
        phone: '+1 727-418-7106',
        capacity: 800,
      },
      financials: { guarantee: 6000, currency: 'USD' },
      buyer: { company: 'Cowboys Dance Hall LLC' },
      production: [],
      attachments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      orgId: 'play-dead-mgmt',
      tourId: 'fall-2025',
      artistId: 'bryan-martin',
      status: 'Pending' as const,
      date: new Date('2025-10-16T20:00:00'),
      location: { city: 'Starkville', state: 'MS', country: 'USA' },
      venue: {
        name: "Rick's Cafe",
        address: '319B Highway 182 East, Starkville, MS 39759',
        phone: '601-324-7425',
        capacity: 800,
      },
      financials: { guarantee: 5000, currency: 'USD' },
      buyer: { company: "Rick's Cafe" },
      production: [],
      attachments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  for (const show of shows) {
    await addShow(show);
  }
  
  console.log('Database seeded with', shows.length, 'shows');
}