// INPUT
const lat1 = 54.34416;
const lat2 = 54.08789;
const lon1 = 11.55484;
const lon2 = 12.06726;

const R = 6371e3; // metres

const φ1 = (lat1 * Math.PI) / 180; // φ, λ in radians
const φ2 = (lat2 * Math.PI) / 180;

const Δφ = ((lat2 - lat1) * Math.PI) / 180;
const Δλ = ((lon2 - lon1) * Math.PI) / 180;

const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
const d = R * c; // in metres

const d_km = d / 1000;
const d_sm = d_km / 1.852;

console.log(d_sm);
