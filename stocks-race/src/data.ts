// Precios mensuales APROXIMADOS (ajustados por splits). Índice: mes 0 = enero 2020.
// Puntos clave de cierre; entre ellos se interpola (hermite monótono en escala log).
export type Co = {id: string; name: string; color: string; unit: string; pts: [number, number][]};

export const COMPANIES: Co[] = [
  {id: 'NVDA', name: 'NVIDIA', color: '#76B900', unit: '$', pts: [[0,5.9],[2,6.0],[5,9.8],[8,13.5],[11,13.1],[14,13.2],[17,18.7],[20,22],[23,30],[26,24],[29,15.1],[32,12.1],[35,14.6],[38,27.7],[41,42.3],[44,43.5],[47,49.5],[50,90],[53,123],[56,121],[59,134],[62,108],[65,158],[68,177],[71,187],[77,200],[82,170]]},
  {id: 'MSFT', name: 'Microsoft', color: '#00A4EF', unit: '$', pts: [[0,160],[2,158],[5,203],[8,203],[11,222],[14,232],[17,271],[20,300],[23,336],[26,288],[29,257],[32,232],[35,239],[38,288],[41,340],[44,315],[47,376],[50,420],[53,446],[56,430],[59,421],[62,375],[65,497],[68,520],[71,485],[77,480],[82,450]]},
  {id: 'AAPL', name: 'Apple', color: '#D8DEE9', unit: '$', pts: [[0,75],[2,62],[5,91],[8,115],[11,132],[14,121],[17,136],[20,141],[23,178],[26,165],[29,137],[32,150],[35,129],[38,165],[41,193],[44,172],[47,192],[50,171],[53,210],[56,222],[59,250],[62,223],[63,200],[65,200],[68,258],[71,272],[77,270],[82,255]]},
  {id: 'BTC', name: 'Bitcoin', color: '#F7931A', unit: '$', pts: [[0,9300],[2,6400],[5,9100],[8,13800],[11,29000],[14,58700],[17,35000],[20,43800],[22,57000],[23,46000],[26,38000],[29,19800],[35,16500],[38,28400],[41,30500],[44,27000],[47,42300],[50,71300],[53,62700],[56,63300],[59,93400],[62,82500],[65,107000],[69,120000],[70,91000],[71,88000],[77,70000],[82,60000]]},
  {id: 'TSLA', name: 'Tesla', color: '#E5384F', unit: '$', pts: [[0,28.7],[2,35],[5,72],[8,150],[11,235],[14,200],[17,226],[20,260],[22,381],[23,352],[26,300],[29,227],[32,100],[35,123],[38,200],[41,261],[44,260],[47,249],[50,175],[53,198],[56,250],[59,404],[62,260],[65,317],[68,440],[71,450],[77,400],[82,380]]},
  {id: 'AMZN', name: 'Amazon', color: '#B28DFF', unit: '$', pts: [[0,94],[2,97],[5,137],[8,157],[11,163],[14,155],[17,177],[20,168],[23,169],[26,162],[29,107],[32,122],[35,84],[38,103],[41,130],[44,127],[47,151],[50,180],[53,193],[56,186],[59,220],[62,190],[65,219],[68,222],[71,230],[77,240],[82,225]]},
];

export const MONTHS = 83; // ene 2020 .. nov 2026
export const LAST = MONTHS - 1;

function monthly(pts: [number, number][]): number[] {
  const x = pts.map((p) => p[0]);
  const y = pts.map((p) => Math.log(p[1]));
  const n = x.length;
  const d: number[] = new Array(n).fill(0);
  const h = (i: number) => x[i + 1] - x[i];
  const s = (i: number) => (y[i + 1] - y[i]) / h(i);
  d[0] = s(0); d[n - 1] = s(n - 2);
  for (let i = 1; i < n - 1; i++) d[i] = s(i - 1) * s(i) <= 0 ? 0 : (s(i - 1) + s(i)) / 2;
  const out: number[] = [];
  for (let m = 0; m < MONTHS; m++) {
    let i = 0; while (i < n - 2 && m > x[i + 1]) i++;
    const t = (m - x[i]) / h(i);
    const h00 = 2*t**3 - 3*t**2 + 1, h10 = t**3 - 2*t**2 + t, h01 = -2*t**3 + 3*t**2, h11 = t**3 - t**2;
    out.push(Math.exp(h00*y[i] + h10*h(i)*d[i] + h01*y[i+1] + h11*h(i)*d[i+1]));
  }
  return out;
}

// valor de $100 invertidos en enero 2020
export const SERIES: number[][] = COMPANIES.map((c) => {
  const m = monthly(c.pts);
  return m.map((v) => (v / m[0]) * 100);
});
export const PRICES: number[][] = COMPANIES.map((c) => monthly(c.pts));

export const valueAt = (ci: number, p: number) => {
  const a = Math.max(0, Math.min(LAST, Math.floor(p)));
  const b = Math.min(LAST, a + 1);
  const f = p - a;
  return Math.exp(Math.log(SERIES[ci][a]) * (1 - f) + Math.log(SERIES[ci][b]) * f);
};

export const leaderAt = (m: number) => {
  let best = 0;
  for (let i = 1; i < COMPANIES.length; i++) if (SERIES[i][m] > SERIES[best][m]) best = i;
  return best;
};
// cambios de líder (mes, nuevo líder)
export const LEADER_CHANGES: {m: number; ci: number}[] = (() => {
  const r: {m: number; ci: number}[] = [];
  let prev = -1;
  for (let m = 1; m < MONTHS; m++) {
    const l = leaderAt(m);
    if (l !== prev) { if (prev !== -1 || m > 0) r.push({m, ci: l}); prev = l; }
  }
  return r;
})();

const MES = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
export const monthLabel = (p: number) => {
  const m = Math.max(0, Math.min(LAST, Math.round(p)));
  return `${MES[m % 12]} ${2020 + Math.floor(m / 12)}`;
};

export const EVENTS: {m: number; text: string}[] = [
  {m: 2, text: 'COVID-19: desplome mundial'},
  {m: 11, text: 'Tesla y Bitcoin se disparan'},
  {m: 22, text: 'Bitcoin y Tesla, máximos de 2021'},
  {m: 34, text: 'Nace ChatGPT → la IA lo cambia todo'},
  {m: 50, text: 'NVIDIA rompe todos los récords'},
  {m: 69, text: 'Bitcoin: máximo histórico ~126.000 $'},
  {m: 77, text: 'Últimos meses: caída generalizada'},
];
