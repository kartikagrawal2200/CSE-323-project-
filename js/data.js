/**
 * AeroSim Aviation - Mock Baggage Database & State Manager (js/data.js)
 */

(function () {
  'use strict';

  // Master Initial Database of Bags
  const SEED_BAGS = {
    'LHR-123456': {
      tagId: 'LHR-123456',
      airline: 'Lufthansa',
      flight: 'LH247',
      originCode: 'LHR',
      originCity: 'London Heathrow',
      destCode: 'FRA',
      destCity: 'Frankfurt',
      passenger: 'R*** S.',
      weightKg: 23.5,
      bagColor: 'Navy Blue',
      departureTime: '08:30 GMT',
      arrivalTime: '11:15 CET',
      gate: 'B22',
      carousel: 'Belt 4',
      currentStepIndex: 0, // 0 = Check-in complete
      timestamps: [
        'Today, 06:45 GMT - Check-in Counter 14',
        null, null, null, null, null
      ]
    },
    'JFK-882194': {
      tagId: 'JFK-882194',
      airline: 'Delta Air Lines',
      flight: 'DL402',
      originCode: 'JFK',
      originCity: 'New York JFK',
      destCode: 'CDG',
      destCity: 'Paris Charles de Gaulle',
      passenger: 'A*** M.',
      weightKg: 21.0,
      bagColor: 'Black Hardshell',
      departureTime: '18:45 EST',
      arrivalTime: '07:50 CET (+1)',
      gate: 'T4-Gate 31',
      carousel: 'Belt 7',
      currentStepIndex: 3, // Flight in transit
      timestamps: [
        'Yesterday, 16:15 EST - Terminal 4 Check-in',
        'Yesterday, 17:05 EST - Automated Sortation Hub',
        'Yesterday, 18:10 EST - Lower Deck Cargo AFT',
        'Yesterday, 19:15 EST - En-route at FL370',
        null, null
      ]
    },
    'DXB-309481': {
      tagId: 'DXB-309481',
      airline: 'Emirates',
      flight: 'EK512',
      originCode: 'DXB',
      originCity: 'Dubai Intl',
      destCode: 'SIN',
      destCity: 'Singapore Changi',
      passenger: 'K*** P.',
      weightKg: 28.2,
      bagColor: 'Crimson Red',
      departureTime: '03:20 GST',
      arrivalTime: '14:40 SGT',
      gate: 'Concourse A12',
      carousel: 'Belt 32',
      currentStepIndex: 4, // Aircraft unloading
      timestamps: [
        'Today, 01:10 GST - First Class Check-in',
        'Today, 02:00 GST - High-speed Conveyor T3',
        'Today, 02:45 GST - Loaded Container AKE-44812',
        'Today, 03:50 GST - In Transit Arabian Sea',
        'Today, 14:55 SGT - Offloading Ramp Bay 4',
        null
      ]
    },
    'DEL-557201': {
      tagId: 'DEL-557201',
      airline: 'Air India',
      flight: 'AI101',
      originCode: 'DEL',
      originCity: 'Delhi IGI',
      destCode: 'JFK',
      destCity: 'New York JFK',
      passenger: 'S*** V.',
      weightKg: 22.8,
      bagColor: 'Silver Titanium',
      departureTime: '01:40 IST',
      arrivalTime: '07:15 EST',
      gate: 'Gate 28B',
      carousel: 'Belt 9',
      currentStepIndex: 1, // Baggage handling
      timestamps: [
        'Today, 22:30 IST - Terminal 3 Counter E',
        'Today, 23:45 IST - X-Ray In-line Screening Bay 2',
        null, null, null, null
      ]
    },
    'SIN-440918': {
      tagId: 'SIN-440918',
      airline: 'Singapore Airlines',
      flight: 'SQ322',
      originCode: 'SIN',
      originCity: 'Singapore Changi',
      destCode: 'LHR',
      destCity: 'London Heathrow',
      passenger: 'E*** T.',
      weightKg: 19.5,
      bagColor: 'Olive Green',
      departureTime: '23:30 SGT',
      arrivalTime: '06:10 GMT (+1)',
      gate: 'T3-B7',
      carousel: 'Belt 5',
      currentStepIndex: 2, // Aircraft loading
      timestamps: [
        'Yesterday, 21:00 SGT - Early Check-in Jewel',
        'Yesterday, 21:50 SGT - Changi Inter-terminal Shuttle',
        'Yesterday, 22:40 SGT - Stowed in Forward Hold 1',
        null, null, null
      ]
    },
    'IDR-100245': {
      tagId: 'IDR-100245',
      airline: 'IndiGo',
      flight: '6E5311',
      originCode: 'IDR',
      originCity: 'Indore Devi Ahilya',
      destCode: 'BOM',
      destCity: 'Mumbai T2',
      passenger: 'P*** K.',
      weightKg: 15.2,
      bagColor: 'Charcoal Grey',
      departureTime: '09:15 IST',
      arrivalTime: '10:45 IST',
      gate: 'Gate 4',
      carousel: 'Belt 2',
      currentStepIndex: 5, // Arrival Claim Stage - Completed
      timestamps: [
        'Today, 07:45 IST - Counter 7 Check-in',
        'Today, 08:20 IST - Manual Sortation & Tagging',
        'Today, 08:50 IST - Loaded onto A320neo',
        'Today, 09:25 IST - Cruise at 31,000 ft',
        'Today, 10:55 IST - Transferred to Arrival Belt',
        'Today, 11:05 IST - Bag ready on Carousel 2'
      ]
    },
    'HND-771239': {
      tagId: 'HND-771239',
      airline: 'ANA',
      flight: 'NH205',
      originCode: 'HND',
      originCity: 'Tokyo Haneda',
      destCode: 'VIE',
      destCity: 'Vienna Intl',
      passenger: 'Y*** T.',
      weightKg: 24.0,
      bagColor: 'Sapphire Blue',
      departureTime: '11:20 JST',
      arrivalTime: '16:45 CET',
      gate: 'T3-Gate 114',
      carousel: 'Belt 6',
      currentStepIndex: 2,
      timestamps: [
        'Today, 08:50 JST - Smart Bag Drop T3',
        'Today, 09:30 JST - Automated Baggage Tray',
        'Today, 10:40 JST - B787 Bulk Cargo Container 2',
        null, null, null
      ]
    },
    'SYD-654321': {
      tagId: 'SYD-654321',
      airline: 'Qantas',
      flight: 'QF1',
      originCode: 'SYD',
      originCity: 'Sydney Kingsford Smith',
      destCode: 'LHR',
      destCity: 'London Heathrow',
      passenger: 'L*** B.',
      weightKg: 26.5,
      bagColor: 'Matte Black',
      departureTime: '15:55 AEST',
      arrivalTime: '06:35 GMT (+1)',
      gate: 'Gate 8',
      carousel: 'Belt 11',
      currentStepIndex: 3,
      timestamps: [
        'Today, 13:10 AEST - T1 International Check-in',
        'Today, 14:00 AEST - Security Scanned & Verified',
        'Today, 15:15 AEST - A380 Cargo Bay Loaded',
        'Today, 16:30 AEST - In Transit across Indian Ocean',
        null, null
      ]
    }
  };

  // Standard 6 Stage Definitions
  const STAGES = [
    { num: 1, title: 'CHECK-IN COMPLETE', desc: 'Your bag has been checked in and tagged with a unique IATA barcode.', icon: 'file-check', duration: '15–30 mins' },
    { num: 2, title: 'BAGGAGE HANDLING', desc: 'Baggage passes automated security X-rays and conveyor sortation hubs.', icon: 'conveyor', duration: '20–45 mins' },
    { num: 3, title: 'AIRCRAFT LOADING', desc: 'Secured inside Unit Load Devices (ULD) and hoisted into the cargo hold.', icon: 'plane-load', duration: '30–50 mins' },
    { num: 4, title: 'FLIGHT IN TRANSIT', desc: 'Baggage is safely in flight cruise towards the destination airport.', icon: 'plane-fly', duration: 'Flight duration' },
    { num: 5, title: 'AIRCRAFT UNLOADING', desc: 'Ground crew transfers containers to the arrival apron and sorting facility.', icon: 'plane-unload', duration: '15–25 mins' },
    { num: 6, title: 'ARRIVAL CLAIM STAGE', desc: 'Your baggage has arrived on the carousel and is ready for collection.', icon: 'bag-claim', duration: '10–20 mins' }
  ];

  // Initialize or load map from localStorage
  function getAllBags() {
    try {
      const stored = localStorage.getItem('aerosim_bags');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge in any seeds that might be missing
        let updated = false;
        for (const key of Object.keys(SEED_BAGS)) {
          if (!parsed[key]) {
            parsed[key] = JSON.parse(JSON.stringify(SEED_BAGS[key]));
            updated = true;
          }
        }
        if (updated) localStorage.setItem('aerosim_bags', JSON.stringify(parsed));
        return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    const copy = JSON.parse(JSON.stringify(SEED_BAGS));
    localStorage.setItem('aerosim_bags', JSON.stringify(copy));
    return copy;
  }

  function saveAllBags(bagsMap) {
    localStorage.setItem('aerosim_bags', JSON.stringify(bagsMap));
  }

  function getBagByTag(tagId) {
    if (!tagId) return null;
    const cleanTag = tagId.trim().toUpperCase();
    const bags = getAllBags();
    return bags[cleanTag] || null;
  }

  function saveBag(bag) {
    if (!bag || !bag.tagId) return;
    const cleanTag = bag.tagId.trim().toUpperCase();
    const bags = getAllBags();
    bags[cleanTag] = bag;
    saveAllBags(bags);

    // If this bag is currently the active bag, update aerosim_bag_data as well
    const active = getActiveBagData();
    if (active && active.tagId === cleanTag) {
      syncToActiveBagData(bag);
    }
  }

  function syncToActiveBagData(bag) {
    if (!bag) return null;
    const formatted = {
      tagId: bag.tagId,
      bagId: bag.tagId,
      flight: bag.flight || 'LH247',
      airline: bag.airline || 'Lufthansa',
      originCode: bag.originCode || (bag.origin ? bag.origin.split('-')[0].trim() : 'LHR'),
      originCity: bag.originCity || (bag.origin && bag.origin.includes('-') ? bag.origin.split('-')[1].trim() : 'London'),
      destCode: bag.destCode || (bag.destination ? bag.destination.split('-')[0].trim() : 'FRA'),
      destCity: bag.destCity || (bag.destination && bag.destination.includes('-') ? bag.destination.split('-')[1].trim() : 'Frankfurt'),
      origin: bag.origin || `${bag.originCode || 'LHR'} - ${bag.originCity || 'London'}`,
      destination: bag.destination || `${bag.destCode || 'FRA'} - ${bag.destCity || 'Frankfurt'}`,
      passenger: bag.passenger || 'Passenger',
      weightKg: bag.weightKg || 23.0,
      bagColor: bag.bagColor || 'Navy Blue',
      departureTime: bag.departureTime || '08:30 GMT',
      arrivalTime: bag.arrivalTime || '11:15 CET',
      gate: bag.gate || 'B22',
      carousel: bag.carousel || 'Belt 4',
      currentStepIndex: (typeof bag.currentStepIndex === 'number') ? bag.currentStepIndex : 0,
      status: (bag.currentStepIndex >= 5) ? 'Completed' : 'In Progress',
      timestamps: bag.timestamps || [],
      steps: STAGES.map((s, idx) => ({
        num: s.num,
        title: s.title,
        desc: (bag.timestamps && bag.timestamps[idx]) ? `${s.desc} (${bag.timestamps[idx]})` : s.desc,
        status: (idx < (bag.currentStepIndex || 0)) ? 'Completed' : (idx === (bag.currentStepIndex || 0) ? 'In Progress' : 'Pending'),
        icon: s.icon,
        timestamp: (bag.timestamps && bag.timestamps[idx]) ? bag.timestamps[idx] : null
      }))
    };
    localStorage.setItem('aerosim_bag_data', JSON.stringify(formatted));
    return formatted;
  }

  function getActiveBagData() {
    try {
      const saved = localStorage.getItem('aerosim_bag_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        const tag = parsed.tagId || parsed.bagId;
        const fullBag = getBagByTag(tag);
        if (fullBag) {
          return syncToActiveBagData({ ...fullBag, ...parsed });
        }
        return syncToActiveBagData(parsed);
      }
    } catch (e) {
      console.error(e);
    }
    // Default to LHR-123456
    const bag = getBagByTag('LHR-123456') || SEED_BAGS['LHR-123456'];
    return syncToActiveBagData(bag);
  }

  function advanceBagStage(tagId) {
    const bag = getBagByTag(tagId);
    if (!bag) return null;
    if (bag.currentStepIndex < 5) {
      bag.currentStepIndex++;
      if (!bag.timestamps) bag.timestamps = [];
      const now = new Date();
      const timeStr = `Today, ${now.toTimeString().split(' ')[0].substring(0, 5)} - Stage ${bag.currentStepIndex + 1} Confirmed`;
      bag.timestamps[bag.currentStepIndex] = timeStr;
      saveBag(bag);
      syncToActiveBagData(bag);
      return bag;
    }
    return bag;
  }

  function resetBagStage(tagId) {
    const bag = getBagByTag(tagId);
    if (!bag) return null;
    bag.currentStepIndex = 0;
    saveBag(bag);
    syncToActiveBagData(bag);
    return bag;
  }

  // Tag validation helper: ^[A-Z]{3}-\d{6}$
  function isValidTagFormat(tag) {
    if (!tag) return false;
    return /^[A-Z]{3}-\d{6}$/i.test(tag.trim());
  }

  // Export to window
  window.AeroSimData = {
    STAGES,
    SEED_BAGS,
    getAllBags,
    saveAllBags,
    getBagByTag,
    saveBag,
    getActiveBagData,
    syncToActiveBagData,
    advanceBagStage,
    resetBagStage,
    isValidTagFormat
  };

  // Seed data on initial load
  getAllBags();
})();
