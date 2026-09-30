/**
 * Hardcoded geo metadata for Tamil Nadu water bodies. Shared by the live
 * Supabase store (coords are not in the DB) and the offline fallback store.
 */
const geoCache = {
  "Chembarambakkam Lake": { "lat": 13.0081524, "lon": 80.055375, "area": 15.32, "district": "Kancheepuram" },
  "Puzhal (Red Hills) Lake": { "lat": 13.1594, "lon": 80.1747, "area": 18.0, "district": "Tiruvallur" },
  "Poondi Reservoir": { "lat": 13.2372, "lon": 79.8456, "area": 32.0, "district": "Tiruvallur" },
  "Pulicat Lake": { "lat": 13.640242, "lon": 80.1671589, "area": 450.0, "district": "Tiruvallur" },
  "Ooty Lake": { "lat": 11.4034171, "lon": 76.6916789, "area": 0.65, "district": "Nilgiris" },
  "Kodaikanal Lake": { "lat": 10.234003, "lon": 77.4865229, "area": 0.24, "district": "Dindigul" },
  "Yercaud Lake": { "lat": 11.7832744, "lon": 78.2104687, "area": 0.11, "district": "Salem" },
  "Singanallur Lake": { "lat": 10.9911946, "lon": 77.0233434, "area": 1.15, "district": "Coimbatore" },
  "Valankulam Lake": { "lat": 10.9922, "lon": 76.9744, "area": 0.65, "district": "Coimbatore" },
  "Bhavanisagar Reservoir (Lower Bhavani)": { "lat": 11.4705, "lon": 77.1264, "area": 87.0, "district": "Erode" },
  "Mettur Dam Reservoir": { "lat": 11.8016, "lon": 77.8019, "area": 155.0, "district": "Salem" },
  "Vaigai Dam Reservoir": { "lat": 10.0538, "lon": 77.5894, "area": 24.0, "district": "Theni" },
  "Kaliveli Lake (Kazhuveli Wetland)": { "lat": 12.0620, "lon": 79.8252, "area": 74.0, "district": "Villupuram" },
  "Vembannur Wetland Complex": { "lat": 8.1691, "lon": 77.3887, "area": 0.20, "district": "Kanyakumari" },
  "Cauvery River (TN Stretch)": { "lat": 11.3503, "lon": 77.8344, "area": 50.0, "district": "Erode" },
  "Vaigai River": { "lat": 9.8808298, "lon": 78.1864627, "area": 25.0, "district": "Madurai" },
  "Tamiraparani River": { "lat": 8.7183539, "lon": 77.5359567, "area": 15.0, "district": "Tirunelveli" },
  "Noyyal River": { "lat": 11.1078792, "lon": 77.2994439, "area": 10.0, "district": "Tiruppur" }
};

const TN_CENTER = { lat: 11.1271, lon: 78.6569 };

/** Coordinates for a water body; unknown names get a deterministic offset
 *  from the TN centroid so pins don't stack on top of each other. */
function coordsFor(name, id) {
  const c = geoCache[name];
  if (c) return { lat: c.lat, lon: c.lon, area: c.area };
  return {
    lat: TN_CENTER.lat + (id * 0.08) - 0.5,
    lon: TN_CENTER.lon + ((id % 7) * 0.08) - 0.25,
    area: 10.0
  };
}

module.exports = { geoCache, coordsFor };
