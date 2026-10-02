/* Helper tampilan: format, toast, modal, carousel, tema, suara */
const $ = id => document.getElementById(id);
const rp = n => "Rp" + Math.round(n).toLocaleString("id-ID");
const p2 = n => String(n).padStart(2, "0");
const fmt = s => { s = Math.max(0, Math.floor(s)); return p2(Math.floor(s / 3600)) + ":" + p2(Math.floor(s % 3600 / 60)) + ":" + p2(s % 60); };
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const RM = matchMedia("(prefers-reduced-motion:reduce)").matches;
let muted = false, AC;
function tone(q) { if (muted) return; try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); let t = AC.currentTime;
  q.forEach(([f, d]) => { const o = AC.createOscillator(), g = AC.createGain(); o.type = "triangle"; o.frequency.value = f;
    g.gain.setValueAtTime(.15, t); g.gain.exponentialRampToValueAtTime(.001, t + d); o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t + d); t += d * .8; }); } catch (e) {} }
function toast(t) { const e = $("toast"); e.textContent = t; e.classList.add("on"); clearTimeout(toast.t); toast.t = setTimeout(() => e.classList.remove("on"), 2500); }
const openModal = id => { $(id).classList.add("on"); };
const closeModal = id => { $(id).classList.remove("on"); };
function copyText(t) { const done = () => toast("Disalin: " + t);
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(done, () => toast("Gagal menyalin"));
  else { const a = document.createElement("textarea"); a.value = t; document.body.appendChild(a); a.select(); try { document.execCommand("copy"); done(); } catch (e) { toast("Gagal menyalin"); } a.remove(); } }
function initCarousel() { const sl = $("slides"), dt = $("dots"); let cur = 0;
  CONFIG.banners.forEach((b, i) => { const s = document.createElement("div"); s.className = "slide"; s.style.background = b.gradient;
    s.innerHTML = `<b>${esc(b.title)}</b><span>${esc(b.subtitle)}</span>`; sl.appendChild(s);
    const d = document.createElement("i"); d.onclick = () => show(i); dt.appendChild(d); });
  function show(i) { cur = i; sl.style.transform = `translateX(-${i * 100}%)`; [...dt.children].forEach((d, k) => d.classList.toggle("on", k === i)); }
  show(0); if (!RM) setInterval(() => show((cur + 1) % CONFIG.banners.length), 4000); }
function initTheme() { const r = document.documentElement, tg = $("theme"), sn = $("snd"), btn = $("setBtn"), pn = $("setPanel"); let t, m;
  try { t = localStorage.getItem("dk_theme"); m = localStorage.getItem("dk_muted") === "1"; } catch (e) {}
  r.dataset.theme = t || "dark"; tg.checked = r.dataset.theme === "dark"; muted = !!m; sn.checked = !muted;
  tg.onchange = () => { r.dataset.theme = tg.checked ? "dark" : "light"; try { localStorage.setItem("dk_theme", r.dataset.theme); } catch (e) {} };
  sn.onchange = () => { muted = !sn.checked; try { localStorage.setItem("dk_muted", muted ? "1" : "0"); } catch (e) {} };
  const set = o => { pn.hidden = !o; btn.setAttribute("aria-expanded", o); };
  btn.onclick = e => { e.stopPropagation(); set(pn.hidden); };
  document.addEventListener("click", e => { if (!pn.hidden && !pn.contains(e.target)) set(false); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !pn.hidden) { set(false); btn.focus(); } }); }
