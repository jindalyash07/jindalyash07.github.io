// Hand-plotted hero chart. Data: PanSense speed test on unseen dishes (MAE, lower is better).
// Update these two arrays when the PanSense results change.
const SPEEDS = [0.5, 0.75, 1.0, 1.5, 2.0];
const TIMER = [0.277, 0.230, 0.198, 0.210, 0.235];
const FUSION = [0.225, 0.196, 0.183, 0.174, 0.175];

(function draw() {
  const svg = document.getElementById("plot");
  if (!svg) return;
  const NS = "http://www.w3.org/2000/svg";
  const W = 520, H = 340, L = 64, R = 26, T = 34, B = 58;
  const xs = (s) => L + (Math.log2(s) - Math.log2(0.5)) / (Math.log2(2) - Math.log2(0.5)) * (W - L - R);
  const Y0 = 0.15, Y1 = 0.30;
  const ys = (v) => T + (Y1 - v) / (Y1 - Y0) * (H - T - B);

  const el = (tag, attrs, parent = svg) => {
    const n = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    parent.appendChild(n);
    return n;
  };
  const text = (str, attrs, parent) => { const t = el("text", attrs, parent); t.textContent = str; return t; };

  // Slight, deterministic wobble so lines read as hand-drawn, not plotted by a library.
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647 - 0.5);
  const wobbly = (pts) => {
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
      const mx = (x0 + x1) / 2 + rnd() * 3, my = (y0 + y1) / 2 + rnd() * 3;
      d += ` Q${mx},${my} ${x1},${y1}`;
    }
    return d;
  };

  // axes
  el("path", { class: "axis", d: `M${L},${T - 8} L${L},${H - B} L${W - R + 6},${H - B}` });
  const xt = el("g", { class: "tick" });
  SPEEDS.forEach((s) => {
    const x = xs(s);
    el("line", { x1: x, x2: x, y1: H - B, y2: H - B + 6 }, xt);
    text(s === 1 ? "normal" : `×${s}`, { x, y: H - B + 22, "text-anchor": "middle" }, xt);
  });
  text("Cooking speed", { class: "label", x: (L + W - R) / 2, y: H - 10, "text-anchor": "middle" });
  const yt = el("g", { class: "tick" });
  [0.15, 0.20, 0.25, 0.30].forEach((v) => {
    const y = ys(v);
    el("line", { x1: L - 6, x2: L, y1: y, y2: y }, yt);
    text(v.toFixed(2), { x: L - 10, y: y + 4, "text-anchor": "end" }, yt);
  });
  text("Error", { class: "label", x: L - 10, y: T - 16, "text-anchor": "end" });

  // series
  const tp = SPEEDS.map((s, i) => [xs(s), ys(TIMER[i])]);
  const fp = SPEEDS.map((s, i) => [xs(s), ys(FUSION[i])]);
  const timer = el("path", { class: "timer late", d: wobbly(tp) });
  const fusion = el("path", { class: "fusion draw", d: wobbly(fp) });
  fusion.style.setProperty("--len", Math.ceil(fusion.getTotalLength()));
  tp.forEach(([x, y]) => el("circle", { class: "dot-timer late", cx: x, cy: y, r: 4.5 }));
  fp.forEach(([x, y]) => el("circle", { class: "dot-fusion late", cx: x, cy: y, r: 4.5 }));

  const last = SPEEDS.length - 1;
  text("Timer", { class: "series-label late", x: tp[last][0] - 4, y: tp[last][1] - 12, "text-anchor": "end", fill: "currentColor" })
    .setAttribute("style", "fill: var(--graphite)");
  text("Camera + clock", { class: "series-label late", x: fp[last][0] - 4, y: fp[last][1] + 26, "text-anchor": "end" })
    .setAttribute("style", "fill: var(--ink)");

  // red-pencil annotation: a bracket on the widest gap (half speed), note in the empty space above
  const [ax, ayT] = tp[0], ayF = fp[0][1];
  const g = el("g", { class: "late" });
  el("path", { class: "note-stroke", d: `M${ax + 9},${ayT + 3} C${ax + 24},${ayT + 12} ${ax + 24},${ayF - 12} ${ax + 9},${ayF - 3}` }, g);
  const nx = xs(0.75) - 8, ny = ys(0.292);
  el("path", { class: "note-stroke", d: `M${ax + 22},${(ayT + ayF) / 2 - 4} Q${ax + 34},${ny - 2} ${nx - 6},${ny - 5}` }, g);
  text("a timer drifts when", { class: "note", x: nx, y: ny }, g);
  text("the heat changes", { class: "note", x: nx, y: ny + 19 }, g);
})();
