// Capitalización bursátil APROXIMADA en miles de millones de $ (puntos clave; se interpola).
// Mes 0 = dic 2015. Dic Y = (Y-2015)*12 ; jun Y = (Y-2016)*12+6.
export type Co = {id: string; name: string; color: string; pts: [number, number][]};
const D = (y: number) => (y - 2015) * 12;
const J = (y: number) => (y - 2016) * 12 + 6;

export const COMPANIES: Co[] = [
  {id: 'NVDA', name: 'NVIDIA', color: '#76B900', pts: [[0,17],[J(2016),35],[D(2016),60],[J(2017),97],[D(2017),116],[J(2018),150],[D(2018),81],[J(2019),120],[D(2019),144],[J(2020),235],[D(2020),328],[J(2021),470],[D(2021),735],[J(2022),380],[D(2022),364],[J(2023),1050],[D(2023),1220],[J(2024),3000],[D(2024),3290],[J(2025),3860],[D(2025),4550],[J(2026),4700],[131,4100]]},
  {id: 'MSFT', name: 'Microsoft', color: '#2DB5FF', pts: [[0,440],[J(2016),400],[D(2016),483],[J(2017),510],[D(2017),660],[J(2018),750],[D(2018),780],[J(2019),1040],[D(2019),1200],[J(2020),1550],[D(2020),1680],[J(2021),2060],[D(2021),2520],[J(2022),1920],[D(2022),1790],[J(2023),2530],[D(2023),2790],[J(2024),3320],[D(2024),3130],[J(2025),3700],[D(2025),3600],[J(2026),3500],[131,3200]]},
  {id: 'AAPL', name: 'Apple', color: '#E3E8F0', pts: [[0,586],[J(2016),520],[D(2016),617],[J(2017),750],[D(2017),868],[J(2018),920],[D(2018),746],[J(2019),880],[D(2019),1290],[J(2020),1580],[D(2020),2255],[J(2021),2260],[D(2021),2913],[J(2022),2200],[D(2022),2066],[J(2023),3000],[D(2023),2994],[J(2024),3400],[D(2024),3785],[J(2025),2990],[D(2025),4000],[J(2026),3900],[131,3600]]},
  {id: 'GOOGL', name: 'Alphabet', color: '#FF5C5C', pts: [[0,531],[J(2016),490],[D(2016),539],[J(2017),650],[D(2017),729],[J(2018),780],[D(2018),724],[J(2019),800],[D(2019),921],[J(2020),1000],[D(2020),1186],[J(2021),1700],[D(2021),1920],[J(2022),1450],[D(2022),1145],[J(2023),1600],[D(2023),1750],[J(2024),2200],[D(2024),2330],[J(2025),2100],[D(2025),3800],[J(2026),3900],[131,3500]]},
  {id: 'AMZN', name: 'Amazon', color: '#FFA11F', pts: [[0,318],[J(2016),360],[D(2016),356],[J(2017),470],[D(2017),566],[J(2018),830],[D(2018),734],[J(2019),850],[D(2019),920],[J(2020),1400],[D(2020),1630],[J(2021),1740],[D(2021),1690],[J(2022),1080],[D(2022),855],[J(2023),1330],[D(2023),1570],[J(2024),2000],[D(2024),2300],[J(2025),2330],[D(2025),2450],[J(2026),2500],[131,2300]]},
  {id: 'META', name: 'Meta', color: '#B794FF', pts: [[0,295],[J(2016),320],[D(2016),332],[J(2017),450],[D(2017),512],[J(2018),500],[D(2018),375],[J(2019),520],[D(2019),585],[J(2020),650],[D(2020),780],[J(2021),900],[D(2021),935],[J(2022),380],[D(2022),315],[J(2023),720],[D(2023),910],[J(2024),1280],[D(2024),1500],[J(2025),1850],[D(2025),1650],[J(2026),1700],[131,1500]]},
];

export const MONTHS = 132; // dic 2015 .. nov 2026
export const LAST = MONTHS - 1;

function monthly(pts: [number, number][]): number[] {
  const x = pts.map((p) => p[0]), y = pts.map((p) => Math.log(p[1])), n = x.length;
  const h = (i: number) => x[i + 1] - x[i];
  const s = (i: number) => (y[i + 1] - y[i]) / h(i);
  const d: number[] = new Array(n).fill(0);
  d[0] = s(0); d[n - 1] = s(n - 2);
  for (let i = 1; i < n - 1; i++) d[i] = s(i - 1) * s(i) <= 0 ? 0 : (s(i - 1) + s(i)) / 2;
  const out: number[] = [];
  for (let m = 0; m < MONTHS; m++) {
    let i = 0; while (i < n - 2 && m > x[i + 1]) i++;
    const t = (m - x[i]) / h(i);
    const a = 2*t**3 - 3*t**2 + 1, b = t**3 - 2*t**2 + t, c = -2*t**3 + 3*t**2, e = t**3 - t**2;
    out.push(Math.exp(a*y[i] + b*h(i)*d[i] + c*y[i+1] + e*h(i)*d[i+1]));
  }
  return out;
}
export const SERIES: number[][] = COMPANIES.map((c) => monthly(c.pts));

export const valueAt = (ci: number, p: number) => {
  const a = Math.max(0, Math.min(LAST, Math.floor(p))), b = Math.min(LAST, a + 1), f = p - a;
  return Math.exp(Math.log(SERIES[ci][a]) * (1 - f) + Math.log(SERIES[ci][b]) * f);
};
export const leaderAt = (m: number) => {
  let best = 0;
  for (let i = 1; i < COMPANIES.length; i++) if (SERIES[i][m] > SERIES[best][m]) best = i;
  return best;
};
export const LEADER_CHANGES: {m: number; ci: number}[] = (() => {
  const r: {m: number; ci: number}[] = []; let prev = leaderAt(0);
  for (let m = 1; m < MONTHS; m++) { const l = leaderAt(m); if (l !== prev) { r.push({m, ci: l}); prev = l; } }
  return r;
})();

const MES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
export const monthLabel = (p: number) => {
  const m = Math.max(0, Math.min(LAST, Math.round(p))) + 11; // mes 0 = dic 2015
  return {mon: MES[m % 12], year: 2015 + Math.floor(m / 12)};
};
export const fmtCap = (b: number) => (b >= 1000 ? `$${(b / 1000).toFixed(2)}T` : `$${Math.round(b)}B`);
