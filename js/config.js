/* ===== PENGATURAN DIAMONDKU - edit file ini saja =====
   Tambah nominal baru = tambah satu objek di "products".
   Harga akhir = price - discountPercent - diskon flash sale + fee pembayaran. */
const CONFIG = {
  storeName: "DiamondKu",
  whatsappAdmin: "6281234567890",          // format internasional tanpa +

  qris: { image: "assets/qris.svg", timeoutMinutes: 15 },   // ganti dengan gambar QR milikmu

  // id harus unik. badge: teks label (kosongkan jika tidak perlu). enabled:false = sembunyikan
  products: [
    { id: "d5",    diamonds: 5,    bonus: 0,  price: 1000,   discountPercent: 0,  badge: "",            enabled: true },
    { id: "d12",   diamonds: 12,   bonus: 0,  price: 2000,   discountPercent: 0,  badge: "",            enabled: true },
    { id: "d50",   diamonds: 50,   bonus: 0,  price: 7500,   discountPercent: 0,  badge: "",            enabled: true },
    { id: "d70",   diamonds: 70,   bonus: 5,  price: 10000,  discountPercent: 0,  badge: "Best Seller", enabled: true },
    { id: "d140",  diamonds: 140,  bonus: 10, price: 20000,  discountPercent: 0,  badge: "",            enabled: true },
    { id: "d355",  diamonds: 355,  bonus: 25, price: 50000,  discountPercent: 0,  badge: "Best Seller", enabled: true },
    { id: "d720",  diamonds: 720,  bonus: 50, price: 100000, discountPercent: 5,  badge: "-5%",         enabled: true },
    { id: "d1450", diamonds: 1450, bonus: 100,price: 200000, discountPercent: 8,  badge: "-8%",         enabled: true }
  ],

  // logo: path gambar (opsional). banks: daftar bank untuk "Bank Transfer", pembeli memilih salah satu.
  // Item dengan "group" sama harus berurutan. fee = biaya admin (Rp)
  payments: [
    { group: "QRIS",          name: "QRIS",          fee: 0,    logo: "assets/pay/qris.webp",      enabled: true },
    { group: "E-Wallet",      name: "GoPay",         fee: 1500, logo: "assets/pay/gopay.webp",     enabled: true },
    { group: "E-Wallet",      name: "ShopeePay",     fee: 1500, logo: "assets/pay/shopeepay.webp",  enabled: true },
    { group: "E-Wallet",      name: "DANA",          fee: 1000, logo: "assets/pay/dana.webp",      enabled: true },
    { group: "Transfer Bank", name: "Bank Transfer", fee: 2500, logo: "assets/pay/bank.webp", banks: ["BCA", "Mandiri"], enabled: true },
    { group: "Minimarket",    name: "Indomaret",     fee: 3000, logo: "assets/pay/indomaret.webp", enabled: true },
    { group: "Minimarket",    name: "Alfamart",      fee: 3000, logo: "assets/pay/alfamart.webp",  enabled: true }
  ],


  // enabled:false = matikan. discountPercent 100 = gratis.
  // endsAt: isi "2026-12-31T23:59:00" untuk waktu tetap, atau kosongkan dan pakai durationHours.
  // onlyProductIds: [] = semua produk, atau ["d70","d140"] = hanya itu.
  flashSale: { enabled: true, durationHours: 24, endsAt: "", discountPercent: 100, onlyProductIds: [] },

  banners: [
    { title: "Bonus Diamond hingga 10%", subtitle: "Khusus top up pertama hari ini", gradient: "linear-gradient(120deg,#ff6a00,#c2185b)" },
    { title: "Simulasi pembayaran QRIS",  subtitle: "Coba alur bayar lengkap tanpa risiko", gradient: "linear-gradient(120deg,#5b2bd9,#1f8fff)" },
    { title: "Riwayat pesanan tersimpan",  subtitle: "Cek kapan saja di menu Cek Pesanan", gradient: "linear-gradient(120deg,#0f9d6e,#0a5a8a)" }
  ],

  history: { maxOrders: 50 }
};
