export type CatalogKind = 'airport' | 'flight' | 'airline';

export type CatalogItem = {
  id: string;
  kind: CatalogKind;
  title: string;
  subtitle: string;
  /** Lowercased, spaces removed, so "SK 412" matches "sk412". */
  key: string;
};

const airports: CatalogItem[] = [
  { id: 'TIA', kind: 'airport', title: 'Tirana International', subtitle: 'Airport · TIA · Albania', key: 'tiranainternationaltiaalbania' },
  { id: 'FCO', kind: 'airport', title: 'Rome Fiumicino', subtitle: 'Airport · FCO · Italy', key: 'romefiumicinofcoitaly' },
  { id: 'OSL', kind: 'airport', title: 'Oslo Gardermoen', subtitle: 'Airport · OSL · Norway', key: 'oslogardermoenoslnorway' },
  { id: 'ARN', kind: 'airport', title: 'Stockholm Arlanda', subtitle: 'Airport · ARN · Sweden', key: 'stockholmarlandaarnsweden' },
  { id: 'FRA', kind: 'airport', title: 'Frankfurt', subtitle: 'Airport · FRA · Germany', key: 'frankfurtfragermany' },
  { id: 'LHR', kind: 'airport', title: 'London Heathrow', subtitle: 'Airport · LHR · United Kingdom', key: 'londonheathrowlhrunitedkingdom' },
  { id: 'CDG', kind: 'airport', title: 'Paris Charles de Gaulle', subtitle: 'Airport · CDG · France', key: 'parischarlesdegaullecdgfrance' },
  { id: 'AMS', kind: 'airport', title: 'Amsterdam Schiphol', subtitle: 'Airport · AMS · Netherlands', key: 'amsterdamschipholamsnetherlands' },
];

const flights: CatalogItem[] = [
  { id: 'AZ507', kind: 'flight', title: 'AZ 507', subtitle: 'Flight · Tirana to Rome', key: 'az507az507tiranatorome' },
  { id: 'SK412', kind: 'flight', title: 'SK 412', subtitle: 'Flight · Oslo to Stockholm', key: 'sk412sk412oslotostockholm' },
  { id: 'LH800', kind: 'flight', title: 'LH 800', subtitle: 'Flight · Frankfurt to London', key: 'lh800lh800frankfurttolondon' },
  { id: 'AF1240', kind: 'flight', title: 'AF 1240', subtitle: 'Flight · Paris to Amsterdam', key: 'af1240af1240paristoamsterdam' },
  { id: 'AY912', kind: 'flight', title: 'AY 912', subtitle: 'Flight · Helsinki to Copenhagen', key: 'ay912ay912helsinkitocopenhagen' },
  { id: 'BA456', kind: 'flight', title: 'BA 456', subtitle: 'Flight · London to Rome', key: 'ba456ba456londontorome' },
];

const airlines: CatalogItem[] = [
  { id: 'AZ', kind: 'airline', title: 'ITA Airways', subtitle: 'Airline · AZ', key: 'itaairwaysaz' },
  { id: 'SK', kind: 'airline', title: 'SAS', subtitle: 'Airline · SK', key: 'sasskscandinavianairlines' },
  { id: 'LH', kind: 'airline', title: 'Lufthansa', subtitle: 'Airline · LH', key: 'lufthansalh' },
  { id: 'AF', kind: 'airline', title: 'Air France', subtitle: 'Airline · AF', key: 'airfranceaf' },
  { id: 'AY', kind: 'airline', title: 'Finnair', subtitle: 'Airline · AY', key: 'finnairay' },
  { id: 'BA', kind: 'airline', title: 'British Airways', subtitle: 'Airline · BA', key: 'britishairwaysba' },
];

const CATALOG: CatalogItem[] = [...airports, ...flights, ...airlines];

/** Nothing until two characters. A one-letter query would match half the catalog. */
const MIN_QUERY = 2;
const MAX_RESULTS = 24;

export function searchCatalog(query: string): CatalogItem[] {
  const q = query.trim().toLowerCase().replace(/\s+/g, '');
  if (q.length < MIN_QUERY) return [];
  const hits: CatalogItem[] = [];
  for (const item of CATALOG) {
    if (!item.key.includes(q)) continue;
    hits.push(item);
    if (hits.length === MAX_RESULTS) break;
  }
  return hits;
}
