'use strict';

// Maps user-typed city names/aliases → Craigslist subdomain
const CITY_MAP = {
  // New York
  'new york':       'newyork',
  'new york city':  'newyork',
  'nyc':            'newyork',
  'ny':             'newyork',

  // Los Angeles
  'los angeles':    'losangeles',
  'la':             'losangeles',

  // Chicago
  'chicago':        'chicago',

  // Houston
  'houston':        'houston',

  // Phoenix
  'phoenix':        'phoenix',

  // Philadelphia
  'philadelphia':   'philadelphia',
  'philly':         'philadelphia',

  // San Antonio
  'san antonio':    'sanantonio',

  // San Diego
  'san diego':      'sandiego',

  // Dallas
  'dallas':         'dallas',

  // San Jose
  'san jose':       'sanjose',

  // Austin
  'austin':         'austin',

  // Jacksonville
  'jacksonville':   'jacksonville',

  // Fort Worth
  'fort worth':     'fortworth',

  // Columbus
  'columbus':       'columbus',

  // Charlotte
  'charlotte':      'charlotte',

  // Indianapolis
  'indianapolis':   'indianapolis',
  'indy':           'indianapolis',

  // San Francisco / Bay Area
  'san francisco':  'sfbay',
  'sf':             'sfbay',
  'bay area':       'sfbay',
  'sfbay':          'sfbay',

  // Seattle
  'seattle':        'seattle',

  // Denver
  'denver':         'denver',

  // Nashville
  'nashville':      'nashville',

  // Oklahoma City
  'oklahoma city':  'oklahomacity',
  'okc':            'oklahomacity',

  // El Paso
  'el paso':        'elpaso',

  // Washington DC
  'washington':     'washingtondc',
  'washington dc':  'washingtondc',
  'dc':             'washingtondc',

  // Las Vegas
  'las vegas':      'lasvegas',
  'vegas':          'lasvegas',

  // Louisville
  'louisville':     'louisville',

  // Memphis
  'memphis':        'memphis',

  // Portland
  'portland':       'portland',

  // Atlanta
  'atlanta':        'atlanta',

  // Miami
  'miami':          'miami',

  // Baltimore
  'baltimore':      'baltimore',

  // Minneapolis
  'minneapolis':    'minneapolis',

  // Boston
  'boston':         'boston',

  // Detroit
  'detroit':        'detroit',

  // Tucson
  'tucson':         'tucson',

  // Fresno
  'fresno':         'fresno',

  // Sacramento
  'sacramento':     'sacramento',

  // Kansas City
  'kansas city':    'kansascity',

  // Raleigh
  'raleigh':        'raleigh',

  // Omaha
  'omaha':          'omaha',

  // Cleveland
  'cleveland':      'cleveland',

  // Tampa
  'tampa':          'tampa',

  // St. Louis
  'st louis':       'stlouis',
  'saint louis':    'stlouis',
  'st. louis':      'stlouis',

  // Pittsburgh
  'pittsburgh':     'pittsburgh',

  // Richmond
  'richmond':       'richmond',

  // Orlando
  'orlando':        'orlando',

  // Cincinnati
  'cincinnati':     'cincinnati',

  // Salt Lake City
  'salt lake city': 'saltlakecity',
  'slc':            'saltlakecity',

  // New Orleans
  'new orleans':    'neworleans',
  'nola':           'neworleans',

  // Buffalo
  'buffalo':        'buffalo',
};

function getSubdomain(cityInput) {
  return CITY_MAP[cityInput.toLowerCase().trim()] || null;
}

// Unique subdomains sorted alphabetically for /cities display
function listSubdomains() {
  return [...new Set(Object.values(CITY_MAP))].sort();
}

// Human-readable alias list for /cities
function listAliases() {
  return Object.keys(CITY_MAP).sort();
}

module.exports = { getSubdomain, listSubdomains, listAliases };
