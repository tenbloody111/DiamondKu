/* Logika utama: harga, alur top up, pembayaran simulasi, riwayat */
(function () {
  const F = CONFIG.flashSale, S = { uid: "", dia: null, pay: null, bank: null };
  let cur = null, lastSale = null, END = 0;
  if (F.endsAt) END = new Date(F.endsAt).getTime() || 0;
  if (!END) { const k = "dk_end_" + F.durationHours; try { END = +localStorage.getItem(k); } catch (e) {}
    if (!END) { END = Date.now() + F.durationHours * 36e5; try { localStorage.setItem(k, END); } catch (e) {} } }
  const saleOn = () => F.enabled && Date.now() < END;
  const prods = () => CONFIG.products.filter(p => p.enabled !== false);
  const pays = () => CONFIG.payments.filter(p => p.enabled !== false);
  function fin(p) { let x = p.price * (1 - (p.discountPercent || 0) / 100);
    if (saleOn() && (!F.onlyProductIds.length || F.onlyProductIds.includes(p.id))) x *= 1 - F.discountPercent / 100;
    return Math.max(0, Math.round(x)); }
  const mName = () => !S.pay ? "" : S.pay.banks && S.bank ? S.pay.name + " - " + S.bank : S.pay.name;
  const total = () => S.dia ? fin(S.dia) + (S.pay ? S.pay.fee : 0) : 0;

  function go(v) { document.querySelectorAll(".view").forEach(e => e.classList.toggle("on", e.id === v));
    document.querySelectorAll("nav button").forEach(b => b.classList.toggle("act", b.dataset.view === v));
    if (v === "orders") renderOrders(); scrollTo({ top: 0 }); }
  document.addEventListener("click", e => { const b = e.target.closest("[data-view]"); if (b) { e.preventDefault(); go(b.dataset.view); } });

  function renderProducts() { const q = $("q").value.trim(), box = $("dia"); box.textContent = "";
    const l = prods().filter(p => !q || String(p.diamonds).includes(q));
    if (!l.length) { box.innerHTML = '<div class="empty">Nominal tidak ditemukan.</div>'; return; }
    l.forEach(p => { const b = document.createElement("button"); b.type = "button"; b.className = "opt" + (S.dia && S.dia.id === p.id ? " sel" : "");
      const f = fin(p), off = f < p.price;
      b.innerHTML = (p.badge ? `<span class="tag">${esc(p.badge)}</span>` : "") + `<b>💎 ${p.diamonds}${p.bonus ? ` <small>+${p.bonus} bonus</small>` : ""}</b><small>Free Fire</small><div class="pr">${off ? `<s class="old">${rp(p.price)}</s> ` : ""}${f === 0 ? '<span class="free">Gratis</span>' : rp(f)}</div>`;
      b.onclick = () => { S.dia = p; renderProducts(); upd(); }; box.appendChild(b); }); }
  function renderPays() { const box = $("pay"); box.textContent = ""; let g = "";
    pays().forEach(p => { if (p.group !== g) { g = p.group; const h = document.createElement("div"); h.className = "pgroup"; h.textContent = g; box.appendChild(h); }
      const sel = S.pay && S.pay.name === p.name, b = document.createElement("button"); b.type = "button"; b.className = "opt pay" + (sel ? " sel" : "");
      b.innerHTML = (p.logo ? `<span class="plogo${p.banks ? " wide" : ""}"><img src="${esc(p.logo)}" alt="" loading="lazy"></span>` : "") + `<span class="pn"><b>${esc(p.name)}</b><small>Biaya ${rp(p.fee)}</small></span>`;
      b.onclick = () => { if (!sel) { S.pay = p; S.bank = null; } renderPays(); upd(); }; box.appendChild(b);
      if (sel && p.banks) { const r = document.createElement("div"); r.className = "banks"; r.setAttribute("role", "group"); r.setAttribute("aria-label", "Pilih bank");
        p.banks.forEach(k => { const x = document.createElement("button"); x.type = "button"; x.className = "chip" + (S.bank === k ? " sel" : ""); x.textContent = k; x.onclick = () => { S.bank = k; renderPays(); upd(); }; r.appendChild(x); }); box.appendChild(r); } }); }
  function upd() { $("sU").textContent = S.uid || "-";
    $("sI").textContent = S.dia ? S.dia.diamonds + " Diamond (" + (fin(S.dia) === 0 ? "Gratis" : rp(fin(S.dia))) + ")" : "-";
    $("sP").textContent = S.pay ? mName() + " (+" + rp(S.pay.fee) + ")" : "-"; $("sT").textContent = rp(total());
    const ok = S.uid && S.dia && S.pay && (!S.pay.banks || S.bank); $("buy").disabled = !ok;
    $("hint").textContent = ok ? "Siap dibeli." : !S.uid ? "Cek User ID dulu di langkah 1." : !S.dia ? "Pilih nominal di langkah 2." : !S.pay ? "Pilih pembayaran di langkah 3." : "Pilih bank di langkah 3."; }

  /* Langkah 1: validasi format ID */
  const idHint = () => { $("idmsg").className = "msg"; $("idmsg").textContent = "User ID terdiri dari 8-12 angka."; };
  $("uid").oninput = e => { e.target.value = e.target.value.replace(/\D/g, ""); S.uid = ""; idHint(); upd(); };
  function cekId() { const v = $("uid").value, m = $("idmsg");
    if (v.length < 8) { m.className = "msg err"; m.textContent = "User ID harus 8-12 angka."; return; }
    S.uid = v; m.className = "msg ok"; m.textContent = "Format ID valid."; upd(); }
  $("cek").onclick = cekId; $("uid").onkeydown = e => { if (e.key === "Enter") cekId(); };
  $("q").oninput = () => { if (!$("home").classList.contains("on")) go("home"); renderProducts(); };

  /* Beli -> konfirmasi -> pesanan -> pembayaran simulasi */
  $("buy").onclick = () => { $("cBody").innerHTML = `ID ${esc(S.uid)}<br>${S.dia.diamonds} Diamond via ${esc(mName())}<br><b class="acc big">${rp(total())}</b>`; openModal("mConfirm"); $("cYes").focus(); };
  $("cNo").onclick = () => closeModal("mConfirm");
  $("cYes").onclick = () => { closeModal("mConfirm");
    const o = { code: "FF" + Date.now().toString().slice(-8), date: Date.now(), uid: S.uid, diamonds: S.dia.diamonds, price: fin(S.dia), fee: S.pay.fee, total: total(),
      method: mName(), status: "Menunggu Pembayaran", expiresAt: Date.now() + CONFIG.qris.timeoutMinutes * 6e4 };
    Hist.add(o); showPay(o.code); };
  function showPay(code) { const o = Hist.get(code); if (!o) return; cur = code;
    $("pTitle").textContent = "Pembayaran " + o.method;
    const digits = o.code.replace(/\D/g, "");
    $("pBody").innerHTML = (o.method === "QRIS" ? `<img class="qr" src="${esc(CONFIG.qris.image)}" alt="Kode QRIS contoh">` : `<div class="vacode">8808${digits}</div>`) +
      `<p class="c">Total <b class="acc big">${rp(o.total)}</b></p><p class="c mut">Kode pesanan ${o.code}<br>Sisa waktu <b id="pcd">${fmt((o.expiresAt - Date.now()) / 1e3)}</b></p>`;
    openModal("mPay"); }
  $("pCopy").onclick = () => cur && copyText(cur);
  $("pClose").onclick = () => closeModal("mPay");
  $("pCancel").onclick = () => { Hist.update(cur, { status: "Dibatalkan" }); closeModal("mPay"); toast("Pesanan dibatalkan"); refreshOrders(); };
  $("pPaid").onclick = () => { const o = Hist.update(cur, { status: "Berhasil", paidAt: Date.now() }); closeModal("mPay"); tone([[440, .1], [660, .15]]);
    if (!RM) setTimeout(() => tone([[659, .12], [784, .12], [1047, .3]]), 250);
    $("dNo").textContent = "No. pesanan " + o.code; $("dSum").textContent = `${o.diamonds} Diamond untuk ID ${o.uid} - ${rp(o.total)} (simulasi)`; go("done"); };
  $("again").onclick = () => { S.uid = ""; S.dia = S.pay = S.bank = null; $("uid").value = ""; idHint(); renderProducts(); renderPays(); upd(); go("home"); };
  document.addEventListener("keydown", e => { if (e.key === "Escape") { closeModal("mConfirm"); closeModal("mPay"); } });

  /* Riwayat */
  const stc = { "Menunggu Pembayaran": "w", "Berhasil": "ok", "Kedaluwarsa": "x", "Dibatalkan": "x" };
  function renderOrders() { const q = $("oq").value.trim().toLowerCase(), st = $("of").value;
    const l = Hist.sweep().filter(o => (!st || o.status === st) && (!q || o.code.toLowerCase().includes(q) || o.uid.includes(q))), box = $("olist");
    if (!l.length) { box.innerHTML = '<div class="empty">' + (Hist.all().length ? "Tidak ada pesanan yang cocok." : "Belum ada pesanan. Mulai top up pertamamu di Beranda.") + "</div>"; return; }
    box.innerHTML = l.map(o => `<article class="oc"><div class="oh"><b>${o.code}</b><span class="st s-${stc[o.status]}">${o.status}</span></div>
      <div class="mut">${new Date(o.date).toLocaleString("id-ID")} - ID ${o.uid}</div>
      <div><b>💎 ${o.diamonds}</b> via ${esc(o.method)} <b class="acc">${rp(o.total)}</b></div>
      <details><summary>Detail</summary><div class="mut">Harga item ${rp(o.price)}<br>Biaya ${rp(o.fee)}<br>${o.paidAt ? "Dibayar " + new Date(o.paidAt).toLocaleString("id-ID") : "Batas bayar " + new Date(o.expiresAt).toLocaleString("id-ID")}</div></details>
      <div class="row">${o.status === "Menunggu Pembayaran" ? `<button class="btn sm" data-act="pay" data-c="${o.code}">Bayar</button>` : ""}<button class="btn ghost sm" data-act="copy" data-c="${o.code}">Salin Kode</button><button class="btn danger sm" data-act="del" data-c="${o.code}">Hapus</button></div></article>`).join(""); }
  const refreshOrders = () => { if ($("orders").classList.contains("on")) renderOrders(); };
  $("oq").oninput = renderOrders; $("of").onchange = renderOrders;
  $("olist").addEventListener("click", e => { const b = e.target.closest("button[data-act]"); if (!b) return; const c = b.dataset.c, a = b.dataset.act;
    if (a === "pay") showPay(c); else if (a === "copy") copyText(c);
    else if (b.dataset.arm) { Hist.remove(c); renderOrders(); }
    else { b.dataset.arm = 1; b.textContent = "Yakin?"; setTimeout(() => { if (b.isConnected) { delete b.dataset.arm; b.textContent = "Hapus"; } }, 3000); } });

  /* Timer 1 detik: flash sale + hitung mundur pembayaran */
  function tick() { const on = saleOn(), f = $("flash");
    if (on !== lastSale) { lastSale = on; f.hidden = !F.enabled;
      if (on) { f.className = "flash"; f.innerHTML = `<b>⚡ Flash Sale diskon ${F.discountPercent}%</b><span class="cd" id="cd"></span>`; }
      else { f.className = "flash end"; f.innerHTML = "<b>Promo berakhir</b><span>Harga kembali normal</span>"; }
      renderProducts(); upd(); }
    if (on) $("cd").textContent = fmt((END - Date.now()) / 1e3);
    if ($("mPay").classList.contains("on") && cur) { const o = Hist.get(cur);
      if (o && o.status === "Menunggu Pembayaran") { const r = (o.expiresAt - Date.now()) / 1e3;
        if (r <= 0) { Hist.update(cur, { status: "Kedaluwarsa" }); closeModal("mPay"); toast("Waktu pembayaran habis"); refreshOrders(); } else $("pcd").textContent = fmt(r); } } }

  document.title = CONFIG.storeName + " - Top Up Free Fire (Simulasi)";
  $("brand").textContent = $("fBrand").textContent = CONFIG.storeName;
  $("faqTime").textContent = "Batas bayar " + CONFIG.qris.timeoutMinutes + " menit sejak pesanan dibuat.";
  document.querySelectorAll(".wa").forEach(a => a.href = "https://wa.me/" + CONFIG.whatsappAdmin);
  initTheme(); initCarousel(); idHint(); renderPays(); tick(); setInterval(tick, 1000);
})();
