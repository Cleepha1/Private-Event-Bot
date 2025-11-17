const SKYBLOCK_YEAR_MS = 446400000;
const SKYBLOCK_MONTH_MS = 37200000;
const SKYBLOCK_DAY_MS = 1200000;
const SKYBLOCK_HOUR_MS = 50000;
const SKYBLOCK_MINUTE_MS = 833.33;

const SKYBLOCK_EPOCH = 1560275700000;

export const EVENT_TYPES = {
  MINING_FIESTA: {
    id: 'mining_fiesta',
    name: 'Mining Fiesta',
    description: 'Increased mining speed and double ores',
    duration: SKYBLOCK_DAY_MS * 3,
    interval: SKYBLOCK_MONTH_MS
  },
  SPOOKY_FESTIVAL: {
    id: 'spooky_festival',
    name: 'Spooky Festival',
    description: 'Halloween-themed event with special drops',
    duration: SKYBLOCK_DAY_MS * 3,
    startMonth: 7,
    startDay: 29
  },
  WINTER_ISLAND: {
    id: 'winter_island',
    name: 'Season of Jerry',
    description: 'Winter island access with special events',
    duration: SKYBLOCK_MONTH_MS,
    startMonth: 12,
    startDay: 1
  },
  NEW_YEAR: {
    id: 'new_year',
    name: 'New Year Celebration',
    description: 'New year festivities',
    duration: SKYBLOCK_DAY_MS * 3,
    startMonth: 12,
    startDay: 29
  },
  TRAVELING_ZOO: {
    id: 'traveling_zoo',
    name: 'Traveling Zoo',
    description: 'Oringo visits with special pets',
    duration: SKYBLOCK_DAY_MS * 3,
    interval: SKYBLOCK_MONTH_MS
  },
  DARK_AUCTION: {
    id: 'dark_auction',
    name: 'Dark Auction',
    description: 'Special auction with rare items',
    duration: SKYBLOCK_MINUTE_MS * 10,
    interval: SKYBLOCK_DAY_MS * 3
  }
};

export function getSkyBlockTime(timestamp = Date.now()) {
  const elapsed = timestamp - SKYBLOCK_EPOCH;
  
  const years = Math.floor(elapsed / SKYBLOCK_YEAR_MS);
  const months = Math.floor((elapsed % SKYBLOCK_YEAR_MS) / SKYBLOCK_MONTH_MS);
  const days = Math.floor((elapsed % SKYBLOCK_MONTH_MS) / SKYBLOCK_DAY_MS);
  const hours = Math.floor((elapsed % SKYBLOCK_DAY_MS) / SKYBLOCK_HOUR_MS);
  const minutes = Math.floor((elapsed % SKYBLOCK_HOUR_MS) / SKYBLOCK_MINUTE_MS);
  
  return {
    year: years + 1,
    month: months + 1,
    day: days + 1,
    hour: hours,
    minute: minutes,
    elapsed
  };
}

export function formatDuration(ms) {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  
  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    return `${minutes}m`;
  }
}

export function getCurrentEvents() {
  const now = Date.now();
  const skyBlockTime = getSkyBlockTime(now);
  const events = [];

  const miningFiestaStart = skyBlockTime.elapsed - (skyBlockTime.elapsed % SKYBLOCK_MONTH_MS);
  const miningFiestaEnd = miningFiestaStart + EVENT_TYPES.MINING_FIESTA.duration;
  if (now >= SKYBLOCK_EPOCH + miningFiestaStart && now < SKYBLOCK_EPOCH + miningFiestaEnd) {
    events.push({
      ...EVENT_TYPES.MINING_FIESTA,
      endsAt: SKYBLOCK_EPOCH + miningFiestaEnd
    });
  }

  if (skyBlockTime.month === 7 && skyBlockTime.day >= 29 && skyBlockTime.day <= 31) {
    const spookyStart = SKYBLOCK_EPOCH + 
      (skyBlockTime.year - 1) * SKYBLOCK_YEAR_MS + 
      (7 - 1) * SKYBLOCK_MONTH_MS + 
      (29 - 1) * SKYBLOCK_DAY_MS;
    const spookyEnd = spookyStart + EVENT_TYPES.SPOOKY_FESTIVAL.duration;
    
    if (now >= spookyStart && now < spookyEnd) {
      events.push({
        ...EVENT_TYPES.SPOOKY_FESTIVAL,
        endsAt: spookyEnd
      });
    }
  }

  if (skyBlockTime.month === 12) {
    const winterStart = SKYBLOCK_EPOCH + 
      (skyBlockTime.year - 1) * SKYBLOCK_YEAR_MS + 
      (12 - 1) * SKYBLOCK_MONTH_MS;
    const winterEnd = winterStart + EVENT_TYPES.WINTER_ISLAND.duration;
    
    if (now >= winterStart && now < winterEnd) {
      events.push({
        ...EVENT_TYPES.WINTER_ISLAND,
        endsAt: winterEnd
      });
    }
  }

  const zooStart = skyBlockTime.elapsed - (skyBlockTime.elapsed % SKYBLOCK_MONTH_MS);
  const zooEnd = zooStart + EVENT_TYPES.TRAVELING_ZOO.duration;
  if (now >= SKYBLOCK_EPOCH + zooStart && now < SKYBLOCK_EPOCH + zooEnd) {
    events.push({
      ...EVENT_TYPES.TRAVELING_ZOO,
      endsAt: SKYBLOCK_EPOCH + zooEnd
    });
  }

  const darkAuctionCycle = skyBlockTime.elapsed % EVENT_TYPES.DARK_AUCTION.interval;
  if (darkAuctionCycle < EVENT_TYPES.DARK_AUCTION.duration) {
    const darkAuctionStart = skyBlockTime.elapsed - darkAuctionCycle;
    events.push({
      ...EVENT_TYPES.DARK_AUCTION,
      endsAt: SKYBLOCK_EPOCH + darkAuctionStart + EVENT_TYPES.DARK_AUCTION.duration
    });
  }

  return events;
}

export function getUpcomingEvents() {
  const now = Date.now();
  const skyBlockTime = getSkyBlockTime(now);
  const events = [];

  const currentMonthStart = skyBlockTime.elapsed - (skyBlockTime.elapsed % SKYBLOCK_MONTH_MS);
  const nextMiningFiesta = SKYBLOCK_EPOCH + currentMonthStart + SKYBLOCK_MONTH_MS;
  if (nextMiningFiesta > now) {
    events.push({
      ...EVENT_TYPES.MINING_FIESTA,
      startsAt: nextMiningFiesta
    });
  }

  for (let i = 0; i < 12; i++) {
    const checkYear = skyBlockTime.year + Math.floor((skyBlockTime.month - 1 + i) / 12);
    const checkMonth = ((skyBlockTime.month - 1 + i) % 12) + 1;
    
    if (checkMonth === 7) {
      const spookyStart = SKYBLOCK_EPOCH + 
        (checkYear - 1) * SKYBLOCK_YEAR_MS + 
        (7 - 1) * SKYBLOCK_MONTH_MS + 
        (29 - 1) * SKYBLOCK_DAY_MS;
      
      if (spookyStart > now) {
        events.push({
          ...EVENT_TYPES.SPOOKY_FESTIVAL,
          startsAt: spookyStart
        });
        break;
      }
    }
  }

  for (let i = 0; i < 12; i++) {
    const checkYear = skyBlockTime.year + Math.floor((skyBlockTime.month - 1 + i) / 12);
    const checkMonth = ((skyBlockTime.month - 1 + i) % 12) + 1;
    
    if (checkMonth === 12) {
      const winterStart = SKYBLOCK_EPOCH + 
        (checkYear - 1) * SKYBLOCK_YEAR_MS + 
        (12 - 1) * SKYBLOCK_MONTH_MS;
      
      if (winterStart > now) {
        events.push({
          ...EVENT_TYPES.WINTER_ISLAND,
          startsAt: winterStart
        });
        break;
      }
    }
  }

  const nextZoo = SKYBLOCK_EPOCH + currentMonthStart + SKYBLOCK_MONTH_MS;
  if (nextZoo > now) {
    events.push({
      ...EVENT_TYPES.TRAVELING_ZOO,
      startsAt: nextZoo
    });
  }

  const darkAuctionCycle = skyBlockTime.elapsed % EVENT_TYPES.DARK_AUCTION.interval;
  const nextDarkAuction = SKYBLOCK_EPOCH + skyBlockTime.elapsed - darkAuctionCycle + EVENT_TYPES.DARK_AUCTION.interval;
  events.push({
    ...EVENT_TYPES.DARK_AUCTION,
    startsAt: nextDarkAuction
  });

  return events.sort((a, b) => a.startsAt - b.startsAt);
}

export function getNextEventOccurrence(eventId) {
  const now = Date.now();
  const skyBlockTime = getSkyBlockTime(now);

  if (eventId === 'mining_fiesta') {
    const currentMonthStart = skyBlockTime.elapsed - (skyBlockTime.elapsed % SKYBLOCK_MONTH_MS);
    const thisMiningFiesta = SKYBLOCK_EPOCH + currentMonthStart;
    const nextMiningFiesta = thisMiningFiesta + SKYBLOCK_MONTH_MS;
    
    return {
      ...EVENT_TYPES.MINING_FIESTA,
      startsAt: thisMiningFiesta > now ? thisMiningFiesta : nextMiningFiesta,
      endsAt: (thisMiningFiesta > now ? thisMiningFiesta : nextMiningFiesta) + EVENT_TYPES.MINING_FIESTA.duration
    };
  }

  if (eventId === 'spooky_festival') {
    for (let i = 0; i < 12; i++) {
      const checkYear = skyBlockTime.year + Math.floor((skyBlockTime.month - 1 + i) / 12);
      const spookyStart = SKYBLOCK_EPOCH + 
        (checkYear - 1) * SKYBLOCK_YEAR_MS + 
        (7 - 1) * SKYBLOCK_MONTH_MS + 
        (29 - 1) * SKYBLOCK_DAY_MS;
      
      if (spookyStart > now) {
        return {
          ...EVENT_TYPES.SPOOKY_FESTIVAL,
          startsAt: spookyStart,
          endsAt: spookyStart + EVENT_TYPES.SPOOKY_FESTIVAL.duration
        };
      }
    }
  }

  if (eventId === 'winter_island') {
    for (let i = 0; i < 12; i++) {
      const checkYear = skyBlockTime.year + Math.floor((skyBlockTime.month - 1 + i) / 12);
      const winterStart = SKYBLOCK_EPOCH + 
        (checkYear - 1) * SKYBLOCK_YEAR_MS + 
        (12 - 1) * SKYBLOCK_MONTH_MS;
      
      if (winterStart > now) {
        return {
          ...EVENT_TYPES.WINTER_ISLAND,
          startsAt: winterStart,
          endsAt: winterStart + EVENT_TYPES.WINTER_ISLAND.duration
        };
      }
    }
  }

  if (eventId === 'traveling_zoo') {
    const currentMonthStart = skyBlockTime.elapsed - (skyBlockTime.elapsed % SKYBLOCK_MONTH_MS);
    const thisZoo = SKYBLOCK_EPOCH + currentMonthStart;
    const nextZoo = thisZoo + SKYBLOCK_MONTH_MS;
    
    return {
      ...EVENT_TYPES.TRAVELING_ZOO,
      startsAt: thisZoo > now ? thisZoo : nextZoo,
      endsAt: (thisZoo > now ? thisZoo : nextZoo) + EVENT_TYPES.TRAVELING_ZOO.duration
    };
  }

  if (eventId === 'dark_auction') {
    const darkAuctionCycle = skyBlockTime.elapsed % EVENT_TYPES.DARK_AUCTION.interval;
    const thisDarkAuction = SKYBLOCK_EPOCH + skyBlockTime.elapsed - darkAuctionCycle;
    const nextDarkAuction = thisDarkAuction + EVENT_TYPES.DARK_AUCTION.interval;
    
    return {
      ...EVENT_TYPES.DARK_AUCTION,
      startsAt: thisDarkAuction > now ? thisDarkAuction : nextDarkAuction,
      endsAt: (thisDarkAuction > now ? thisDarkAuction : nextDarkAuction) + EVENT_TYPES.DARK_AUCTION.duration
    };
  }

  return null;
}
