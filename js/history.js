/* Riwayat pesanan di localStorage (aman jika storage diblokir) */
const Hist = {
  K: "diamondku_orders_v1", mem: [],
  all() { try { return JSON.parse(localStorage.getItem(this.K) || "[]"); } catch (e) { return this.mem; } },
  save(l) { l = l.slice(0, CONFIG.history.maxOrders); this.mem = l; try { localStorage.setItem(this.K, JSON.stringify(l)); } catch (e) {} },
  add(o) { const l = this.all(); l.unshift(o); this.save(l); },
  get(c) { return this.all().find(o => o.code === c); },
  update(c, p) { const l = this.all(), o = l.find(x => x.code === c); if (o) { Object.assign(o, p); this.save(l); } return o; },
  remove(c) { this.save(this.all().filter(o => o.code !== c)); },
  sweep() { const l = this.all(); let ch = false;
    l.forEach(o => { if (o.status === "Menunggu Pembayaran" && o.expiresAt < Date.now()) { o.status = "Kedaluwarsa"; ch = true; } });
    if (ch) this.save(l); return l; }
};
