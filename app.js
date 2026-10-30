/**
 * ============================================================================
 * TIỆM BÁNH NHÀ LÀM — WEB ĐẶT BÁNH
 * ============================================================================
 * Chủ tiệm: Trịnh Thanh Thảo · 0833 236 698
 * Trải nghiệm:
 *   - Dải ảnh thật 3D (coverflow): vuốt / kéo ngang để lướt qua từng món
 *   - Thực đơn dạng cuốn sách: bấm "Thực đơn" rồi lật từng trang
 *   - Đặt hàng nhanh, đặt qua app giao hàng, nhắn đơn qua Zalo
 * Công nghệ: Vanilla ES6+, CSS 3D, Web Audio API, Google Sheets Backend
 * ============================================================================
 */

(function () {
  'use strict';

  // --- CẤU HÌNH HỆ THỐNG ---
  const CONFIG = {
    // URL Web App triển khai từ Google Apps Script (đuôi /exec):
    API_BASE_URL: 'https://script.google.com/macros/s/AKfycbw8D_zJ66eeD0JDTDVYXPnW3pEoRGKS5RTSmVIX_u28ACkTUB3RDX4XKShlPJSvickJ/exec',
    // Chuỗi nhận diện URL mẫu chưa được thay bằng URL thật
    API_PLACEHOLDER_MARK: 'AKfycbwYyY7JbXo8JzRk0L0VpUf3eYc7wFvP6mGqH',
    USE_DEMO_FALLBACK: true,
    ENABLE_SOUND: true,
    API_TIMEOUT_MS: 15000,
    LOW_STOCK_LIMIT: 10, // hiện nhãn "Chỉ còn N chiếc" khi stock <= giá trị này (stock phải > 0)
    BOOK_PAGE_RATIO: 0.72 // tỉ lệ rộng / cao của một trang sách
  };

  // --- DỮ LIỆU DEMO DỰ PHÒNG (chỉ dùng khi không kết nối được Google Sheets) ---
  const FALLBACK_CATEGORIES = [
    { id: 'cat_signature', name: 'Bánh kem' },
    { id: 'cat_pastry', name: 'Bánh ngàn lớp & bánh ngọt' },
    { id: 'cat_bread', name: 'Bánh mì' },
    { id: 'cat_cookies', name: 'Macaron & Tart' },
    { id: 'cat_drinks', name: 'Đồ uống' }
  ];

  const FALLBACK_PRODUCTS = [
    { id: 'prod_01', name: 'Butter Croissant Cổ Điển', category: 'cat_pastry', price: 45000, description: 'Bánh sừng bò truyền thống với hàng trăm lớp bơ Pháp thơm lừng giòn rụm.', ingredients: 'Bơ lạt Pháp Elle & Vire, Bột mì T55, Men tươi', flavor: 'Thơm bơ béo nhẹ, vỏ giòn ruột xốp', weight: '85g', image_url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80', is_featured: true, stock: 50 },
    { id: 'prod_02', name: 'Almond Croissant Nướng Giòn', category: 'cat_pastry', price: 65000, description: 'Croissant ngập kem hạnh nhân frangipane, rắc hạnh nhân lát nướng thơm.', ingredients: 'Bột hạnh nhân Mỹ, Trứng gà tươi, Bơ Pháp, Rượu rum', flavor: 'Ngọt dịu, bùi béo hạnh nhân', weight: '120g', image_url: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=800&q=80', is_featured: true, stock: 30 },
    { id: 'prod_04', name: 'Strawberry Shortcake Nhật Bản', category: 'cat_signature', price: 85000, description: 'Cốt chiffon mịn mượt như mây kết hợp kem tươi Hokkaido và dâu tây ngọt mát.', ingredients: 'Dâu tây Đà Lạt, Kem sữa Hokkaido, Trứng tươi', flavor: 'Chua ngọt thanh tao, kem mát mịn', weight: '140g', image_url: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=80', is_featured: true, stock: 25 },
    { id: 'prod_05', name: 'Bánh Kem Chocolate Truffle', category: 'cat_signature', price: 90000, description: 'Cốt bánh ẩm mọng socola Bỉ phủ lớp kem ganache bóng mượt sánh mịn.', ingredients: 'Chocolate Bỉ 70%, Bột ca cao nguyên chất, Bơ Pháp', flavor: 'Đậm vị ca cao, ngọt vừa sâu lắng', weight: '150g', image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80', is_featured: true, stock: 20 },
    { id: 'prod_07', name: 'Éclair Chocolate Hạt Phỉ', category: 'cat_pastry', price: 58000, description: 'Bánh vỏ choux dài giòn nhẹ với nhân kem custard socola praline bùi béo.', ingredients: 'Vỏ choux bơ tươi, Kem custard hạt phỉ, Socola glaze', flavor: 'Bùi béo giòn nhẹ bùng nổ hương vị', weight: '90g', image_url: 'https://images.unsplash.com/photo-1612203985729-70726954388c?auto=format&fit=crop&w=800&q=80', stock: 35 },
    { id: 'prod_09', name: 'Tart Trái Cây Tươi Mùa Hạ', category: 'cat_cookies', price: 75000, description: 'Đế tart bơ giòn rụm ngập kem vani Madagascar và quả mọng nhiệt đới.', ingredients: 'Vani Madagascar, Quả mâm xôi, Việt quất, Bột hạnh nhân', flavor: 'Vỏ giòn béo, hoa quả chua mọng thanh thoát', weight: '110g', image_url: 'https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=800&q=80', is_featured: true, stock: 20 },
    { id: 'prod_11', name: 'Bánh Mì Sourdough Men Rừng', category: 'cat_bread', price: 70000, description: 'Ổ bánh men tự nhiên ủ chậm 36h, vỏ giòn lò nướng đá, ruột ẩm dai mềm.', ingredients: 'Bột mì nguyên cám hữu cơ, Men mẹ tự nhiên 6 năm tuổi', flavor: 'Chua nhẹ hậu vị ngọt lúa mì', weight: '500g', image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80', is_featured: true, stock: 15 },
    { id: 'prod_14', name: 'Donut Chocolate Caramel Muối', category: 'cat_pastry', price: 38000, description: 'Bánh vòng chiên vàng bông xốp phủ chocolate đen và sốt caramel mặn.', ingredients: 'Bột mì mềm, Socola đen phủ, Muối biển Fleur de Sel', flavor: 'Mặn ngọt hòa quyện, cốt bánh mềm mại', weight: '80g', image_url: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=800&q=80', stock: 40 },
    { id: 'prod_16', name: 'Cupcake Hồng Nhung Red Velvet', category: 'cat_pastry', price: 48000, description: 'Cốt bánh đỏ nhung bí ẩn kết hợp kem phô mai Cream Cheese béo ngậy.', ingredients: 'Cream cheese Anchor, Bột cacao, Giấm táo', flavor: 'Chua béo phô mai cân bằng cốt bánh ẩm', weight: '100g', image_url: 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&w=800&q=80', is_featured: true, stock: 30 },
    { id: 'prod_18', name: 'Hộp Macaron Tinh Hoa (6 Vị)', category: 'cat_cookies', price: 160000, description: 'Set 6 chiếc macaron giòn rỗng vỏ: Vani, Matcha, Phúc bồn tử, Socola, Hạt dẻ.', ingredients: 'Bột hạnh nhân Pháp, Trứng gà sạch, Ganache hoa quả', flavor: 'Vỏ giòn tan lập tức tan chảy cùng nhân', weight: '150g', image_url: 'https://images.unsplash.com/photo-1569864321390-38435d67e6b7?auto=format&fit=crop&w=800&q=80', is_featured: true, stock: 20 },
    { id: 'prod_19', name: 'Cà Phê Latte Hạt Phỉ Thủ Công', category: 'cat_drinks', price: 55000, description: 'Cà phê đặc sản Espresso hòa cùng sữa tươi đánh bông và siro hạt phỉ nướng.', ingredients: 'Arabica Cầu Đất sơ chế ướt, Sữa thanh trùng tươi, Hạt phỉ rang xay', flavor: 'Thơm nồng nàn, êm dịu béo ngậy', weight: '320ml', image_url: 'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=800&q=80', is_featured: true, stock: 100 },
    { id: 'prod_20', name: 'Trà Hoa Bá Tước Kem Sữa Đào', category: 'cat_drinks', price: 60000, description: 'Trà Earl Grey đẫm hương cam Bergamot, đào ngâm và lớp milkfoam sánh mịn.', ingredients: 'Trà đen Earl Grey, Tinh dầu Bergamot, Đào miếng giòn, Kem béo', flavor: 'Thơm ngát thư giãn, chua ngọt êm ái', weight: '450ml', image_url: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80', stock: 100 }
  ];

  const FALLBACK_SETTINGS = {
    brand_name: 'Tiệm bánh nhà làm',
    brand_subtitle: 'Bánh làm tại nhà, nướng theo đơn',
    owner_name: 'Trịnh Thanh Thảo',
    currency: 'VND',
    store_address: '',
    store_phone: '0833 236 698',
    store_open_hours: '',
    shipping_fee_default: '25000',
    bank_name: '',
    bank_code: '',
    bank_account_number: '',
    bank_account_holder: 'TRINH THANH THAO',
    bank_qr_url: '',
    facebook_url: '',
    zalo_url: 'https://zalo.me/0833236698',
    instagram_url: '',
    grabfood_url: '',
    shopeefood_url: '',
    befood_url: '',
    xanhsm_url: ''
  };

  // Các app giao hàng (thứ tự hiển thị)
  const DELIVERY_APPS = [
    { key: 'befood_url', id: 'dl-be', label: 'beFood', cls: 'dl-be' },
    { key: 'grabfood_url', id: 'dl-grab', label: 'GrabFood', cls: 'dl-grab' },
    { key: 'shopeefood_url', id: 'dl-shopee', label: 'ShopeeFood', cls: 'dl-shopee' },
    { key: 'xanhsm_url', id: 'dl-xanh', label: 'Xanh SM', cls: 'dl-xanh' }
  ];

  // Ảnh thay thế khi ảnh sản phẩm lỗi / bị chặn
  const PLACEHOLDER_IMG = 'data:image/svg+xml;utf8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 250"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
    '<stop offset="0" stop-color="#FBD9C9"/><stop offset="1" stop-color="#F3E3A9"/></linearGradient></defs>' +
    '<rect width="200" height="250" fill="url(#g)"/><text x="100" y="145" font-size="84" text-anchor="middle">🧁</text></svg>'
  );

  // --- TIỆN ÍCH ---
  const $ = (id) => document.getElementById(id);
  const fmt = (n) => Number(n || 0).toLocaleString('vi-VN') + ' đ';
  const esc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isSafeUrl = (u) => /^https?:\/\//i.test(String(u || '').trim());
  const isTruthy = (v) => v === true || v === 'TRUE' || v === 'true' || v === 1;
  const cssUrl = (u) => 'url("' + String(u).replace(/["\\\n\r]/g, '') + '")';

  // Chuyển link chia sẻ Google Drive thành link ảnh hiển thị được
  function normImg(u) {
    u = String(u || '').trim();
    if (!u) return '';
    const m = u.match(/drive\.google\.com\/file\/d\/([\w-]+)/) ||
      u.match(/drive\.google\.com\/(?:open|uc)\?(?:[^#]*&)?id=([\w-]+)/);
    if (m) return 'https://lh3.googleusercontent.com/d/' + m[1] + '=w1200';
    return u;
  }

  // image_url có thể chứa nhiều ảnh, ngăn cách bằng dấu |
  function getImages(p) {
    return String(p.image_url || '').split(/[|\n]/).map(normImg).filter(Boolean);
  }

  // Ảnh lỗi -> dùng ảnh thay thế (bắt ở pha capture vì sự kiện error không nổi bọt)
  document.addEventListener('error', (e) => {
    const t = e.target;
    if (t && t.tagName === 'IMG' && !t.dataset.fallbackApplied) {
      t.dataset.fallbackApplied = '1';
      t.src = PLACEHOLDER_IMG;
    }
  }, true);

  // --- ÂM THANH (Web Audio API, không cần file ngoài) ---
  class SoundManager {
    constructor() {
      this.ctx = null;
      this.enabled = false; // mặc định tắt, khách chủ động bật
    }
    init() {
      if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    }
    playChime() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      this.beep(523.25, now, 0.15);
      this.beep(659.25, now + 0.08, 0.2);
    }
    playBell() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      this.beep(880, now, 0.4);
      this.beep(587.33, now + 0.25, 0.6);
    }
    // Tiếng sột soạt khi lật trang sách
    playFlip() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      try {
        const ctx = this.ctx;
        const len = Math.floor(ctx.sampleRate * 0.28);
        const buf = ctx.createBuffer(1, len, ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2);
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const f = ctx.createBiquadFilter();
        f.type = 'highpass';
        f.frequency.value = 1800;
        const g = ctx.createGain();
        g.gain.value = 0.14;
        src.connect(f);
        f.connect(g);
        g.connect(ctx.destination);
        src.start();
      } catch (e) {}
    }
    beep(freq, time, dur) {
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);
        gain.gain.setValueAtTime(0.08, time);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(time);
        osc.stop(time + dur);
      } catch (e) {}
    }
    toggle() {
      this.enabled = !this.enabled;
      return this.enabled;
    }
  }

  // --- DẢI ẢNH 3D (COVERFLOW) ---
  // Ảnh thật xếp trên một vòng cung có chiều sâu; kéo / vuốt ngang để lướt, thả tay tự căn vào giữa.
  class Coverflow {
    constructor(root, handlers) {
      this.root = root;
      this.h = handlers;
      this.items = [];
      this.cards = [];
      this.pos = 0;
      this.target = 0;
      this.cur = -1;
      this.pressed = false;
      this.dragging = false;
      this.moved = false;
      this.raf = 0;
      this.lastT = 0;
      this.cw = 280;
      this.ch = 350;
      this.spacing = 200;
      this.wheelAcc = 0;
      this.lastWheel = 0;
      this.bind();
      this.layout();
      if ('ResizeObserver' in window) new ResizeObserver(() => this.layout()).observe(root);
      else window.addEventListener('resize', () => this.layout());
    }

    setItems(items, startIndex) {
      this.items = items;
      this.root.innerHTML = items.map((it, i) => `
        <div class="cf-card" data-i="${i}" role="option" aria-label="${esc(it.name)}" style="--img:${cssUrl(it.img)}">
          <div class="cf-inner">
            <img src="${esc(it.img)}" alt="${esc(it.name)}" draggable="false" ${i < 6 ? '' : 'loading="lazy"'}>
            ${it.featured ? '<span class="cf-badge">Bán chạy</span>' : ''}
            <span class="cf-glare"></span>
          </div>
          <div class="cf-reflect"></div>
        </div>`).join('');
      this.cards = Array.prototype.slice.call(this.root.querySelectorAll('.cf-card'));
      const start = clamp(startIndex || 0, 0, Math.max(0, items.length - 1));
      this.pos = this.target = start;
      this.cur = -1;
      this.render();
    }

    layout() {
      const w = this.root.clientWidth;
      const h = this.root.clientHeight;
      if (!w || !h) return;
      const tall = h > 470;
      let ch = Math.min(h * (tall ? 0.7 : 0.86), 540);
      let cw = ch * 0.8;
      if (cw > w * 0.74) {
        cw = w * 0.74;
        ch = cw / 0.8;
      }
      this.cw = cw;
      this.ch = ch;
      this.spacing = cw * 0.72;
      this.root.style.setProperty('--cw', cw + 'px');
      this.root.style.setProperty('--ch', ch + 'px');
      this.root.style.setProperty('--cy', (tall ? 44 : 50) + '%');
      this.root.classList.toggle('tall', tall);
      this.render();
    }

    goTo(i) {
      if (!this.items.length) return;
      this.target = clamp(i, 0, this.items.length - 1);
      if (this.h.onInteract) this.h.onInteract();
      this.kick();
    }
    next() { this.goTo(Math.round(this.target) + 1); }
    prev() { this.goTo(Math.round(this.target) - 1); }
    get index() { return this.cur; }

    kick() {
      if (this.raf) return;
      this.lastT = performance.now();
      this.raf = requestAnimationFrame((t) => this.tick(t));
    }

    tick(t) {
      const dt = Math.min((t - this.lastT) / 1000, 0.05);
      this.lastT = t;
      this.raf = 0;
      if (!this.dragging) {
        const k = 1 - Math.exp(-dt * (prefersReducedMotion ? 60 : 9));
        this.pos += (this.target - this.pos) * k;
        if (Math.abs(this.target - this.pos) < 0.001) this.pos = this.target;
      }
      this.render();
      if (this.dragging || this.pos !== this.target) this.kick();
    }

    render() {
      const N = this.items.length;
      if (!N) return;
      for (let i = 0; i < N; i++) {
        const card = this.cards[i];
        if (!card) continue;
        const o = i - this.pos;
        const ao = Math.abs(o);
        const sgn = o < 0 ? -1 : 1;
        const near = Math.min(ao, 1);
        const far = Math.max(ao - 1, 0);
        const tx = sgn * (near * this.cw * 0.74 + far * this.cw * 0.3);
        const tz = -(near * 170 + far * 80);
        const ry = -sgn * near * 52;
        const opacity = ao > 3.6 ? 0 : (ao > 2.3 ? 1 - (ao - 2.3) / 1.3 : 1);
        card.style.transform = `translate3d(${tx.toFixed(1)}px, 0, ${tz.toFixed(1)}px) rotateY(${ry.toFixed(1)}deg)`;
        card.style.opacity = opacity.toFixed(2);
        card.style.zIndex = String(100 - Math.round(ao * 10));
        card.style.visibility = opacity <= 0 ? 'hidden' : 'visible';
        card.style.pointerEvents = ao > 3 ? 'none' : 'auto';
        card.style.setProperty('--dim', (near * 0.42).toFixed(2));
      }
      const idx = clamp(Math.round(this.pos), 0, N - 1);
      if (idx !== this.cur) {
        if (this.cards[this.cur]) this.cards[this.cur].classList.remove('is-center');
        this.cur = idx;
        this.cards[idx].classList.add('is-center');
        if (this.h.onChange) this.h.onChange(idx);
      }
    }

    bind() {
      const root = this.root;
      let startX = 0, startPos = 0, lastX = 0, lastTime = 0, vel = 0, downCard = null;

      root.addEventListener('pointerdown', (e) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        this.pressed = true;
        this.moved = false;
        this.dragging = false;
        startX = lastX = e.clientX;
        startPos = this.pos;
        lastTime = performance.now();
        vel = 0;
        downCard = e.target.closest ? e.target.closest('.cf-card') : null;
      });

      root.addEventListener('pointermove', (e) => {
        if (!this.pressed) {
          this.tilt(e);
          return;
        }
        const dx = e.clientX - startX;
        if (!this.moved && Math.abs(dx) > 6) {
          this.moved = true;
          this.dragging = true;
          root.classList.add('dragging');
          try { root.setPointerCapture(e.pointerId); } catch (err) {}
          if (this.h.onInteract) this.h.onInteract();
        }
        if (this.dragging) {
          const now = performance.now();
          const dt = Math.max(1, now - lastTime);
          const inst = -((e.clientX - lastX) / this.spacing) / (dt / 1000);
          vel = vel * 0.7 + inst * 0.3;
          lastX = e.clientX;
          lastTime = now;
          this.pos = clamp(startPos - dx / this.spacing, -0.35, this.items.length - 0.65);
          this.kick();
        }
      });

      const end = () => {
        if (!this.pressed) return;
        this.pressed = false;
        root.classList.remove('dragging');
        if (this.dragging) {
          this.dragging = false;
          const projected = this.pos + vel * 0.2;
          this.target = clamp(Math.round(projected), 0, this.items.length - 1);
          this.kick();
        } else if (!this.moved && downCard) {
          const i = Number(downCard.dataset.i);
          if (i === this.cur) {
            if (this.h.onOpen) this.h.onOpen(i);
          } else {
            this.goTo(i);
          }
        }
        downCard = null;
      };
      root.addEventListener('pointerup', end);
      root.addEventListener('pointercancel', end);
      root.addEventListener('lostpointercapture', end);

      root.addEventListener('pointerleave', () => this.resetTilt());

      // Cuộn ngang bằng touchpad / chuột có con lăn ngang
      root.addEventListener('wheel', (e) => {
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 2) {
          e.preventDefault();
          this.wheelAcc += e.deltaX;
          const now = performance.now();
          if (Math.abs(this.wheelAcc) > 50 && now - this.lastWheel > 180) {
            this.goTo(Math.round(this.target) + (this.wheelAcc > 0 ? 1 : -1));
            this.wheelAcc = 0;
            this.lastWheel = now;
          }
        }
      }, { passive: false });
    }

    // Nghiêng nhẹ tấm ảnh ở giữa theo con trỏ chuột, có ánh phản chiếu
    tilt(e) {
      if (e.pointerType !== 'mouse' || prefersReducedMotion) return;
      const card = this.cards[this.cur];
      if (!card) return;
      const inner = card.querySelector('.cf-inner');
      const r = card.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) {
        this.resetTilt();
        return;
      }
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      inner.style.transform = `rotateX(${((0.5 - py) * 8).toFixed(2)}deg) rotateY(${((px - 0.5) * 10).toFixed(2)}deg)`;
      inner.style.setProperty('--gx', (px * 100).toFixed(0) + '%');
      inner.style.setProperty('--gy', (py * 100).toFixed(0) + '%');
    }

    resetTilt() {
      this.cards.forEach((c) => {
        const inner = c.firstElementChild;
        if (inner && inner.style.transform) inner.style.transform = '';
      });
    }
  }

  // --- THỰC ĐƠN DẠNG CUỐN SÁCH ---
  // Máy tính: hai trang một lần mở. Điện thoại: một trang, lật từng trang.
  class MenuBook {
    constructor(app) {
      this.app = app;
      this.overlay = $('book-overlay');
      this.stage = $('bk-stage');
      this.book = $('book');
      this.pages = [];
      this.leaves = [];
      this.toc = [];
      this.s = 0;
      this.L = 0;
      this.maxS = 0;
      this.mode = 'double';
      this.pw = 300;
      this.ph = 420;
      this.isOpen = false;
      this.autoTimer = 0;
      this.bind();
    }

    get wantDouble() { return window.innerWidth >= 900; }

    bind() {
      $('bk-close').addEventListener('click', () => this.close());
      $('bk-prev').addEventListener('click', () => this.setState(this.s - 1, true));
      $('bk-next').addEventListener('click', () => this.setState(this.s + 1, true));
      $('bk-toc').addEventListener('click', () => this.jumpToPage(1));
      $('bk-cart').addEventListener('click', () => this.app.openCheckoutModal());

      // Thao tác bên trong các trang sách
      this.book.addEventListener('click', (e) => {
        const addBtn = e.target.closest('[data-add]');
        if (addBtn) {
          this.app.addById(addBtn.dataset.add, 1, addBtn, true);
          return;
        }
        const detailBtn = e.target.closest('[data-detail]');
        if (detailBtn) {
          this.app.openDetail(detailBtn.dataset.detail);
          return;
        }
        const jump = e.target.closest('[data-jump]');
        if (jump) {
          this.jumpToPage(Number(jump.dataset.jump));
          return;
        }
        if (e.target.closest('[data-flip="next"]')) {
          this.setState(this.s + 1, true);
          return;
        }
        if (e.target.closest('[data-act="open-cart"]')) {
          this.app.openCheckoutModal();
        }
      });

      // Vuốt ngang để lật trang
      let sx = 0, sy = 0, st = 0, tracking = false;
      this.stage.addEventListener('pointerdown', (e) => {
        tracking = true;
        sx = e.clientX;
        sy = e.clientY;
        st = performance.now();
      });
      this.stage.addEventListener('pointerup', (e) => {
        if (!tracking) return;
        tracking = false;
        const dx = e.clientX - sx;
        const dy = e.clientY - sy;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4 && performance.now() - st < 900) {
          this.setState(this.s + (dx < 0 ? 1 : -1), true);
        }
      });
      this.stage.addEventListener('pointercancel', () => { tracking = false; });

      let rt = 0;
      window.addEventListener('resize', () => {
        clearTimeout(rt);
        rt = setTimeout(() => {
          if (!this.isOpen) return;
          if ((this.wantDouble ? 'double' : 'single') !== this.mode) {
            const p = this.currentPage();
            this.build();
            this.layout();
            this.jumpToPageInstant(p);
          } else {
            this.layout();
            this.applyBookTransform();
          }
        }, 160);
      });
    }

    open(pageIndex) {
      this.build();
      this.isOpen = true;
      this.overlay.classList.add('open');
      document.body.classList.add('modal-open');
      this.layout();
      if (typeof pageIndex === 'number') {
        this.jumpToPageInstant(pageIndex);
      } else {
        this.setStateInstant(0);
        // Mở bìa ra sau một nhịp để khách thấy cuốn sách "mở"
        clearTimeout(this.autoTimer);
        this.autoTimer = setTimeout(() => {
          if (this.isOpen && this.s === 0) this.setState(1, true);
        }, prefersReducedMotion ? 100 : 750);
      }
      setTimeout(() => { const c = $('bk-close'); if (c) c.focus({ preventScroll: true }); }, 60);
    }

    close() {
      if (!this.isOpen) return;
      this.isOpen = false;
      clearTimeout(this.autoTimer);
      this.overlay.classList.remove('open');
      if (!this.app.isAnyModalOpen()) document.body.classList.remove('modal-open');
      this.app.onBookClosed();
    }

    // --- Dựng danh sách trang ---
    buildPages() {
      const app = this.app;
      const s = app.settings;
      const brand = s.brand_name || 'Tiệm bánh nhà làm';
      const owner = s.owner_name || '';
      const pages = [];

      // 0: Bìa
      pages.push(`<div class="pg pg-cover"><div class="cover-label">
        <div class="cover-kicker">Thực đơn</div>
        <div class="cover-brand">${esc(brand)}</div>
        <div class="cover-sub">${esc(s.brand_subtitle || '')}</div>
        ${owner ? `<div class="cover-owner">Chủ tiệm ${esc(owner)}</div>` : ''}
        <button type="button" class="cover-open" data-flip="next">Mở thực đơn</button>
      </div></div>`);

      // 1: Mục lục (điền sau khi biết số trang)
      pages.push('');

      // Nhóm sản phẩm theo danh mục
      const groups = [];
      const known = {};
      app.categories.forEach((c) => {
        known[c.id] = true;
        const items = app.products.filter((p) => p.category === c.id);
        if (items.length) groups.push({ name: c.name, items: items });
      });
      const others = app.products.filter((p) => !known[p.category]);
      if (others.length) groups.push({ name: 'Món khác', items: others });

      this.toc = [];
      groups.forEach((g) => {
        this.toc.push({ name: g.name, page: pages.length, count: g.items.length });
        g.items.forEach((p) => {
          const n = pages.length;
          pages.push(`<div class="pg">
            <div class="pg-cat">${esc(g.name)}</div>
            <div class="pg-photo"><span class="tape"></span><img src="${esc(p._img)}" alt="${esc(p.name)}">${isTruthy(p.is_featured) ? '<span class="tag">Bán chạy</span>' : ''}</div>
            <div class="pg-name">${esc(p.name)}</div>
            <p class="pg-desc">${esc(p.description || p.flavor || '')}</p>
            <div class="pg-foot">
              <span class="pg-price">${fmt(p.price)}</span>
              <span class="pg-btns"><button type="button" class="pg-more" data-detail="${esc(p.id)}">Chi tiết</button><button type="button" class="pg-add" data-add="${esc(p.id)}">+ Thêm</button></span>
            </div>
            <span class="pg-num">${n}</span></div>`);
        });
      });

      // Trang mục lục
      pages[1] = `<div class="pg">
        <div class="pg-title">Mục lục</div>
        <p class="pg-lead">${owner ? `Bánh làm tại nhà bởi ${esc(owner)}. ` : ''}Chạm vào tên danh mục để lật nhanh tới trang.</p>
        <ul class="toc-list">${this.toc.map((t) => `
          <li><button type="button" class="toc-item" data-jump="${t.page}"><span class="toc-name">${esc(t.name)}</span><span class="toc-count">${t.count} món</span><span class="toc-page">tr. ${t.page}</span></button></li>`).join('')}
        </ul><span class="pg-num">1</span></div>`;

      // Nếu số trang cuối (gồm 2 trang đặt hàng) là lẻ ở chế độ 2 trang, thêm 1 trang cảm ơn
      const tail = 2;
      if (this.wantDouble && (pages.length + tail) % 2 === 1) {
        const n = pages.length;
        pages.push(`<div class="pg"><div class="pg-note"><div class="big">Cảm ơn bạn<br>đã ghé tiệm</div><p class="pg-lead" style="margin-top:.6em">Mỗi chiếc bánh đều được làm ra từ sự chăm chút.</p></div><span class="pg-num">${n}</span></div>`);
      }

      // Trang liên hệ
      const phone = String(s.store_phone || '').trim();
      const tel = phone.replace(/[^\d+]/g, '');
      let n = pages.length;
      pages.push(`<div class="pg">
        <div class="pg-title">Liên hệ</div>
        <p class="pg-lead">Cần tư vấn bánh sinh nhật, bánh theo yêu cầu hay đơn số lượng lớn? Gọi hoặc nhắn Zalo cho tiệm nhé.</p>
        <div class="pg-stack">
          ${tel ? `<a class="pbtn" href="tel:${esc(tel)}">Gọi ${esc(phone)}</a>` : ''}
          <a class="pbtn alt" href="${esc(app.zaloUrl())}" target="_blank" rel="noopener noreferrer">Nhắn Zalo</a>
          ${s.store_address ? `<p class="pg-lead" style="margin:.4em 0 0">Địa chỉ: ${esc(s.store_address)}</p>` : ''}
          ${s.store_open_hours ? `<p class="pg-lead" style="margin:0">Giờ nhận đơn: ${esc(s.store_open_hours)}</p>` : ''}
        </div><span class="pg-num">${n}</span></div>`);

      // Trang đặt hàng (cập nhật theo giỏ)
      n = pages.length;
      pages.push(`<div class="pg" id="bk-order-page">${this.orderPageInner(n)}</div>`);

      return pages;
    }

    orderPageInner(n) {
      const app = this.app;
      const count = app.cartCount();
      const total = app.cartSubtotal();
      const apps = DELIVERY_APPS.filter((a) => isSafeUrl(app.settings[a.key]));
      return `<div class="pg-title">Đặt bánh</div>
        <div class="pg-sum" id="bk-order-sum">${count > 0
          ? `Giỏ của bạn có <strong>${count}</strong> món · <strong>${fmt(total)}</strong>`
          : 'Giỏ hàng đang trống. Lật lại các trang trước và bấm “+ Thêm” nhé.'}</div>
        <div class="pg-stack">
          <button type="button" class="pbtn" data-act="open-cart">${count > 0 ? 'Xem giỏ & gửi đơn' : 'Xem giỏ hàng'}</button>
          ${apps.length ? `<p class="pg-lead" style="margin:.5em 0 0">Hoặc đặt qua app giao hàng:</p><div class="pg-grid2">${apps.map((a) => `<a class="pbtn dl ${a.cls}" href="${esc(app.settings[a.key])}" target="_blank" rel="noopener noreferrer">${a.label}</a>`).join('')}</div>` : ''}
        </div><span class="pg-num">${n}</span>`;
    }

    refreshOrderPage() {
      const el = document.getElementById('bk-order-page');
      if (!el || !this.pages.length) return;
      el.innerHTML = this.orderPageInner(this.pages.length - 1);
    }

    build() {
      this.mode = this.wantDouble ? 'double' : 'single';
      this.pages = this.buildPages();
      const double = this.mode === 'double';
      let html = '';
      if (double) {
        this.L = this.pages.length / 2;
        this.maxS = this.L;
        for (let k = 0; k < this.L; k++) {
          html += `<div class="leaf" data-k="${k}" style="z-index:${this.L - k}"><div class="face front">${this.pages[2 * k]}</div><div class="face back">${this.pages[2 * k + 1]}</div></div>`;
        }
      } else {
        this.L = this.pages.length;
        this.maxS = this.L - 1;
        for (let k = 0; k < this.L; k++) {
          html += `<div class="leaf" data-k="${k}" style="z-index:${this.L - k}"><div class="face front">${this.pages[k]}</div><div class="face back"><div class="pg pg-blank"></div></div></div>`;
        }
      }
      this.book.className = 'book ' + this.mode;
      this.book.innerHTML = html;
      this.leaves = Array.prototype.slice.call(this.book.querySelectorAll('.leaf'));
      this.s = 0;
    }

    layout() {
      const sw = this.stage.clientWidth;
      const sh = this.stage.clientHeight;
      if (!sw || !sh) return;
      const r = CONFIG.BOOK_PAGE_RATIO;
      const double = this.mode === 'double';
      let ph = Math.min(sh - 18, 700);
      let pw = ph * r;
      if (double) {
        if (pw * 2 > sw - 40) {
          pw = (sw - 40) / 2;
          ph = pw / r;
        }
      } else if (pw > sw - 28) {
        pw = sw - 28;
        ph = pw / r;
      }
      this.pw = pw;
      this.ph = ph;
      this.book.style.setProperty('--pw', pw + 'px');
      this.book.style.setProperty('--ph', ph + 'px');
      this.applyBookTransform();
    }

    applyBookTransform() {
      if (this.mode !== 'double') {
        this.book.style.transform = '';
        return;
      }
      let x = 0;
      if (this.s === 0) x = -this.pw / 2;
      else if (this.s >= this.maxS) x = this.pw / 2;
      this.book.style.transform = `translateX(${x}px)`;
    }

    // Trang đang hiển thị (dùng khi đổi giữa chế độ 1 trang / 2 trang)
    currentPage() {
      if (this.mode === 'double') return this.s === 0 ? 0 : Math.min(this.pages.length - 1, this.s * 2 - 1);
      return this.s;
    }

    pageToState(p) {
      p = clamp(p, 0, this.pages.length - 1);
      return this.mode === 'double' ? Math.ceil(p / 2) : p;
    }

    jumpToPage(p) {
      this.setState(this.pageToState(p), true);
    }

    jumpToPageInstant(p) {
      this.setStateInstant(this.pageToState(p));
    }

    setStateInstant(s) {
      this.book.classList.add('no-anim');
      this.setState(s, false);
      void this.book.offsetWidth;
      this.book.classList.remove('no-anim');
    }

    setState(s, animate) {
      s = clamp(s, 0, this.maxS);
      const prev = this.s;
      this.s = s;
      const fwd = s > prev;
      const changed = [];
      this.leaves.forEach((leaf, k) => {
        if (leaf.classList.contains('flipped') !== (k < s)) changed.push(k);
      });
      changed.sort((a, b) => (fwd ? a - b : b - a));
      const step = changed.length > 6 ? 40 : 70;
      const L = this.L;

      this.leaves.forEach((leaf, k) => {
        if (changed.indexOf(k) === -1) {
          clearTimeout(leaf._zt);
          leaf.style.zIndex = String(k < s ? k + 1 : L - k);
        }
      });

      changed.forEach((k, idx) => {
        const leaf = this.leaves[k];
        const should = k < s;
        const delay = animate ? idx * step : 0;
        clearTimeout(leaf._zt);
        leaf.style.transitionDelay = delay + 'ms';
        leaf.style.zIndex = String(1000 + (fwd ? k : L - k));
        leaf.classList.toggle('flipped', should);
        leaf._zt = setTimeout(() => { leaf.style.zIndex = String(should ? k + 1 : L - k); }, animate ? delay + 1000 : 0);
      });

      this.applyBookTransform();
      this.updateNav();
      if (animate && changed.length) this.app.sound.playFlip();
    }

    updateNav() {
      let label;
      if (this.mode === 'double') {
        if (this.s === 0) label = 'Bìa';
        else if (this.s * 2 >= this.pages.length) label = 'Trang ' + (this.s * 2 - 1);
        else label = 'Trang ' + (this.s * 2 - 1) + '–' + (this.s * 2);
      } else {
        label = this.s === 0 ? 'Bìa' : 'Trang ' + this.s + ' / ' + (this.pages.length - 1);
      }
      $('bk-pos').textContent = label;
      $('bk-prev').disabled = this.s <= 0;
      $('bk-next').disabled = this.s >= this.maxS;
    }

    // Phím tắt khi sách đang mở
    onKey(e) {
      if (e.key === 'ArrowRight') this.setState(this.s + 1, true);
      else if (e.key === 'ArrowLeft') this.setState(this.s - 1, true);
      else if (e.key === 'Escape') this.close();
    }
  }

  // --- ỨNG DỤNG CHÍNH ---
  class BakeryApp {
    constructor() {
      this.products = [];
      this.categories = [];
      this.settings = {};
      this.view = [];
      this.viewIndex = 0;
      this.activeCat = null;
      this.cart = this.loadCart();
      this.detailProduct = null;
      this.detailQty = 1;
      this.apiConnected = false;
      this.lastFocus = null;
      this.ambFlag = false;
      this.ambToken = 0;
      this.sound = new SoundManager();

      this.cf = new Coverflow($('cf-stage'), {
        onChange: (i) => this.showItem(i),
        onOpen: (i) => this.view[i] && this.openDetail(this.view[i].id),
        onInteract: () => $('swipe-hint').classList.add('gone')
      });
      this.book = new MenuBook(this);

      this.initUI();
      this.bindScroll();
      this.loadBackendData();
      setTimeout(() => $('swipe-hint').classList.add('gone'), 9000);
    }

    isApiConfigured() {
      return !!CONFIG.API_BASE_URL && CONFIG.API_BASE_URL.indexOf(CONFIG.API_PLACEHOLDER_MARK) === -1;
    }

    isAnyModalOpen() {
      return !!document.querySelector('.modal-overlay.open');
    }

    // Header trong suốt trên hero, đổi sang nền sáng khi cuộn qua hero
    bindScroll() {
      let ticking = false;
      const run = () => {
        ticking = false;
        const rect = $('hero').getBoundingClientRect();
        $('site-header').classList.toggle('scrolled', rect.bottom <= 70);
      };
      window.addEventListener('scroll', () => {
        if (!ticking) { ticking = true; requestAnimationFrame(run); }
      }, { passive: true });
      run();
    }

    // --- TẢI DỮ LIỆU TỪ GOOGLE APPS SCRIPT ---
    async fetchWithTimeout(url, options) {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), CONFIG.API_TIMEOUT_MS);
      try {
        return await fetch(url, Object.assign({}, options || {}, { signal: ctrl.signal }));
      } finally {
        clearTimeout(timer);
      }
    }

    async loadBackendData() {
      let loaded = false;
      if (this.isApiConfigured()) {
        try {
          const resp = await this.fetchWithTimeout(`${CONFIG.API_BASE_URL}?action=bootstrap`);
          if (resp.ok) {
            const data = await resp.json();
            if (data.success && Array.isArray(data.products) && data.products.length) {
              this.products = data.products;
              this.categories = data.categories || [];
              this.settings = data.settings || {};
              loaded = true;
              this.apiConnected = true;
            }
          }
        } catch (e) {
          console.warn('Lỗi kết nối API Google Sheets, chuyển sang chế độ Demo Fallback:', e);
        }
      }

      if (!loaded && CONFIG.USE_DEMO_FALLBACK) {
        this.products = FALLBACK_PRODUCTS.map((p) => Object.assign({}, p));
        this.categories = FALLBACK_CATEGORIES;
        this.settings = FALLBACK_SETTINGS;
        this.showToast(this.isApiConfigured()
          ? 'Chưa kết nối được thực đơn trực tuyến, đang hiển thị thực đơn mẫu'
          : 'Đang chạy chế độ Demo');
      }

      // Chuẩn hóa sản phẩm
      this.products.forEach((p) => {
        p.id = String(p.id);
        p.price = Number(p.price) || 0;
        p._imgs = getImages(p);
        p._img = p._imgs[0] || PLACEHOLDER_IMG;
      });
      this.products = this.products.slice().sort((a, b) => (Number(a.sort_order) || 999) - (Number(b.sort_order) || 999));
      this.categories = this.categories.slice().sort((a, b) => (Number(a.sort_order) || 999) - (Number(b.sort_order) || 999));

      this.reconcileCart();
      this.applySettings();
      this.renderChips();
      this.setCategory(null);
      this.updateCartUI();
    }

    // Đồng bộ giá / món trong giỏ cũ với dữ liệu mới nhất
    reconcileCart() {
      this.cart = this.cart.map((item) => {
        const fresh = this.products.find((p) => String(p.id) === String(item.product && item.product.id));
        return fresh ? { product: fresh, quantity: Math.max(1, parseInt(item.quantity, 10) || 1) } : null;
      }).filter(Boolean);
      this.saveCart();
    }

    zaloUrl() {
      const s = this.settings;
      if (isSafeUrl(s.zalo_url)) return s.zalo_url;
      const tel = String(s.store_phone || '').replace(/[^\d]/g, '');
      return tel ? 'https://zalo.me/' + tel : 'https://zalo.me';
    }

    // Đổ thông tin thương hiệu, liên hệ và link app giao hàng
    applySettings() {
      const s = this.settings;
      const brand = s.brand_name || 'Tiệm bánh nhà làm';
      const sub = s.brand_subtitle || '';
      document.querySelectorAll('[data-brand]').forEach((el) => { el.textContent = brand; });
      document.querySelectorAll('[data-brand-sub]').forEach((el) => { el.textContent = sub; });
      document.title = sub ? `${brand} — ${sub}` : brand;

      // Chủ tiệm & liên hệ
      const owner = s.owner_name || '';
      $('ct-owner').textContent = owner || brand;
      const initials = (owner || brand).split(/\s+/).filter(Boolean).slice(-2).map((w) => w.charAt(0).toUpperCase()).join('');
      $('ct-avatar').textContent = initials || 'TT';

      const phone = String(s.store_phone || '').trim();
      const tel = phone.replace(/[^\d+]/g, '');
      const phoneLink = tel ? `tel:${tel}` : '#contact';
      ['ct-phone', 'ct-phone-text', 'ct-call', 'fab-call', 'success-call'].forEach((id) => {
        const el = $(id);
        if (el) el.setAttribute('href', phoneLink);
      });
      $('ct-phone-text').textContent = phone || 'Đang cập nhật';
      if (!tel) {
        $('ct-phone').classList.add('hidden');
        $('ct-call').style.display = 'none';
        $('fab-call').style.display = 'none';
        $('success-call').style.display = 'none';
      }

      const zalo = this.zaloUrl();
      ['ct-zalo', 'ct-zalo-btn', 'fab-zalo'].forEach((id) => { const el = $(id); if (el) el.setAttribute('href', zalo); });

      const addrRow = $('row-address');
      if (s.store_address) {
        $('ct-address').textContent = s.store_address;
        $('ct-map').href = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(s.store_address);
        addrRow.hidden = false;
      } else {
        addrRow.hidden = true;
      }
      const hoursRow = $('row-hours');
      if (s.store_open_hours) {
        $('ct-hours').textContent = s.store_open_hours;
        hoursRow.hidden = false;
      } else {
        hoursRow.hidden = true;
      }

      [['ct-facebook', 'facebook_url'], ['ct-instagram', 'instagram_url']].forEach((pair) => {
        const el = $(pair[0]);
        const url = s[pair[1]];
        if (isSafeUrl(url)) {
          el.href = url;
          el.classList.remove('hidden');
        } else {
          el.classList.add('hidden');
        }
      });

      // App giao hàng
      DELIVERY_APPS.forEach((app) => {
        const el = $(app.id);
        if (!el) return;
        const url = s[app.key];
        const text = el.querySelector('.dl-text');
        if (isSafeUrl(url)) {
          el.href = url;
          el.classList.remove('disabled');
          el.removeAttribute('aria-disabled');
        } else {
          el.removeAttribute('href');
          el.classList.add('disabled');
          el.setAttribute('aria-disabled', 'true');
          if (text) text.textContent = 'Sắp có mặt';
        }
      });

      // Hàng chip app trong giỏ hàng
      $('checkout-delivery').innerHTML = DELIVERY_APPS.map((app) => {
        const url = s[app.key];
        return isSafeUrl(url)
          ? `<a class="alt-chip ${app.cls}" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${app.label}</a>`
          : `<span class="alt-chip disabled">${app.label} (sắp có)</span>`;
      }).join('');

      // Nhãn giao hàng theo phí cấu hình
      const fee = Number(s.shipping_fee_default) || 25000;
      const opt = $('cust-delivery-method').querySelector('option[value="delivery"]');
      if (opt) opt.textContent = `Giao tận nơi (+${fee.toLocaleString('vi-VN')} đ)`;
    }

    // --- HERO: lọc danh mục + dải ảnh ---
    renderChips() {
      const cats = this.categories.filter((c) => this.products.some((p) => p.category === c.id));
      const chips = [{ id: null, name: 'Tất cả' }].concat(cats);
      const box = $('cat-chips');
      box.innerHTML = chips.map((c) =>
        `<button type="button" class="chip${c.id === this.activeCat ? ' active' : ''}" role="tab" data-cat="${c.id === null ? '' : esc(c.id)}">${esc(c.name)}</button>`
      ).join('');
      box.querySelectorAll('.chip').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.setCategory(btn.dataset.cat || null);
          box.querySelectorAll('.chip').forEach((b) => b.classList.toggle('active', b === btn));
        });
      });
    }

    setCategory(catId) {
      this.activeCat = catId;
      this.view = catId ? this.products.filter((p) => p.category === catId) : this.products.slice();
      this.cf.setItems(this.view.map((p) => ({
        id: p.id, name: p.name, img: p._img, featured: isTruthy(p.is_featured)
      })), 0);
      if (!this.view.length) {
        $('hi-name').textContent = 'Thực đơn đang được cập nhật';
        $('hi-flavor').textContent = '';
        $('hi-price').textContent = '';
      }
    }

    showItem(i) {
      const p = this.view[i];
      if (!p) return;
      this.viewIndex = i;
      const catObj = this.categories.find((c) => c.id === p.category);
      $('hi-cat').textContent = catObj ? catObj.name : 'Bánh';
      $('hi-counter').textContent = `${i + 1} / ${this.view.length}`;
      $('hi-name').textContent = p.name;
      $('hi-flavor').textContent = p.flavor || p.description || '';
      $('hi-price').textContent = fmt(p.price);

      const stock = Number(p.stock);
      const stockEl = $('hi-stock');
      if (stock > 0 && stock <= CONFIG.LOW_STOCK_LIMIT) {
        stockEl.textContent = `Chỉ còn ${stock} chiếc`;
        stockEl.hidden = false;
      } else {
        stockEl.hidden = true;
      }

      const info = $('hero-info');
      info.classList.remove('swap');
      void info.offsetWidth;
      info.classList.add('swap');

      this.setAmbient(p._img);
    }

    // Nền hero mờ ảo lấy từ chính ảnh món đang chọn
    setAmbient(url) {
      const token = ++this.ambToken;
      const apply = (u) => {
        if (token !== this.ambToken) return;
        const next = $(this.ambFlag ? 'amb-a' : 'amb-b');
        const prev = $(this.ambFlag ? 'amb-b' : 'amb-a');
        next.style.backgroundImage = cssUrl(u);
        next.classList.add('on');
        prev.classList.remove('on');
        this.ambFlag = !this.ambFlag;
      };
      const img = new Image();
      img.onload = () => apply(url);
      img.onerror = () => apply(PLACEHOLDER_IMG);
      img.src = url;
    }

    // --- CHI TIẾT MÓN ---
    findProduct(id) {
      return this.products.find((p) => String(p.id) === String(id));
    }

    openDetail(id) {
      const p = this.findProduct(id);
      if (!p) return;
      this.detailProduct = p;
      this.detailQty = 1;
      const img = $('dt-img');
      delete img.dataset.fallbackApplied;
      img.src = p._img;
      img.alt = p.name;
      const thumbs = $('dt-thumbs');
      if (p._imgs.length > 1) {
        thumbs.innerHTML = p._imgs.map((u, i) => `<button type="button" class="${i === 0 ? 'active' : ''}" data-src="${esc(u)}" aria-label="Ảnh ${i + 1}"><img src="${esc(u)}" alt=""></button>`).join('');
      } else {
        thumbs.innerHTML = '';
      }
      const catObj = this.categories.find((c) => c.id === p.category);
      $('dt-cat').textContent = catObj ? catObj.name : 'Bánh';
      $('dt-name').textContent = p.name;
      $('dt-price').textContent = fmt(p.price);
      $('dt-desc').textContent = p.description || 'Bánh làm tại nhà, nướng theo đơn.';
      $('dt-flavor').textContent = p.flavor || '—';
      $('dt-ingredients').textContent = p.ingredients || '—';
      $('dt-weight').textContent = p.weight || '—';
      this.updateDetailQty();
      this.openModal('modal-detail');
    }

    updateDetailQty() {
      $('dt-qty-count').textContent = this.detailQty;
      const p = this.detailProduct;
      $('dt-add-price').textContent = fmt((p ? p.price : 0) * this.detailQty);
    }

    // --- UI CONTROLS ---
    initUI() {
      // Điều hướng dải ảnh
      $('cf-prev').addEventListener('click', () => this.cf.prev());
      $('cf-next').addEventListener('click', () => this.cf.next());

      // Nút thêm vào giỏ / chi tiết ở hero
      $('hi-add').addEventListener('click', () => {
        const p = this.view[this.viewIndex];
        if (!p) return;
        const card = document.querySelector('.cf-card.is-center .cf-inner');
        this.addToCart(p, 1);
        this.flyToCart(card || $('hi-add'), p._img);
        this.sound.playChime();
        this.showToast(`Đã thêm 1 × ${p.name} vào giỏ`);
      });
      $('hi-detail').addEventListener('click', () => {
        const p = this.view[this.viewIndex];
        if (p) this.openDetail(p.id);
      });

      // Mở thực đơn dạng sách
      document.querySelectorAll('[data-open-book], #btn-open-book').forEach((el) => {
        el.addEventListener('click', (e) => { e.preventDefault(); this.openBook(); });
      });

      // Giỏ hàng
      $('btn-open-cart').addEventListener('click', () => this.openCheckoutModal());
      $('cart-pill').addEventListener('click', () => this.openCheckoutModal());

      // Âm thanh
      $('btn-toggle-sound').addEventListener('click', () => {
        const on = this.sound.toggle();
        $('btn-toggle-sound').setAttribute('aria-pressed', on ? 'true' : 'false');
        if (on) this.sound.playBell();
        this.showToast(on ? 'Đã bật âm thanh' : 'Đã tắt âm thanh');
      });

      // Bàn phím
      window.addEventListener('keydown', (e) => {
        if (this.isAnyModalOpen()) {
          if (e.key === 'Escape') this.closeTopModal();
          return;
        }
        if (this.book.isOpen) {
          this.book.onKey(e);
          return;
        }
        const tag = (e.target && e.target.tagName) || '';
        if (/INPUT|SELECT|TEXTAREA/.test(tag)) return;
        if (window.scrollY > $('hero').offsetHeight * 0.6) return;
        if (e.key === 'ArrowLeft') this.cf.prev();
        if (e.key === 'ArrowRight') this.cf.next();
      });

      // Modal chi tiết
      $('dt-qty-minus').addEventListener('click', () => {
        if (this.detailQty > 1) { this.detailQty--; this.updateDetailQty(); }
      });
      $('dt-qty-plus').addEventListener('click', () => {
        if (this.detailQty < 99) { this.detailQty++; this.updateDetailQty(); }
      });
      $('dt-thumbs').addEventListener('click', (e) => {
        const b = e.target.closest('button[data-src]');
        if (!b) return;
        const img = $('dt-img');
        delete img.dataset.fallbackApplied;
        img.src = b.dataset.src;
        $('dt-thumbs').querySelectorAll('button').forEach((x) => x.classList.toggle('active', x === b));
      });
      $('dt-add').addEventListener('click', () => {
        const p = this.detailProduct;
        if (!p) return;
        const qty = this.detailQty;
        this.addToCart(p, qty);
        this.flyToCart($('dt-img'), p._img);
        this.sound.playChime();
        this.showToast(`Đã thêm ${qty} × ${p.name} vào giỏ`);
        this.closeModal('modal-detail');
      });

      // Đóng modal
      document.querySelectorAll('.modal-close').forEach((btn) => {
        btn.addEventListener('click', (e) => this.closeModal(e.currentTarget.getAttribute('data-close')));
      });
      document.querySelectorAll('.modal-overlay').forEach((ov) => {
        ov.addEventListener('mousedown', (e) => {
          if (e.target === ov) this.closeModal(ov.id);
        });
      });

      // Giỏ hàng: tăng giảm / xóa
      $('cart-items-container').addEventListener('click', (e) => {
        const btn = e.target.closest('[data-op]');
        if (!btn) return;
        const idx = Number(btn.dataset.idx);
        const item = this.cart[idx];
        if (!item) return;
        if (btn.dataset.op === 'inc') item.quantity = Math.min(99, item.quantity + 1);
        if (btn.dataset.op === 'dec') item.quantity = Math.max(1, item.quantity - 1);
        if (btn.dataset.op === 'remove') this.cart.splice(idx, 1);
        this.saveCart();
        this.updateCartUI();
        this.renderCartItems();
        this.renderCheckoutSummary();
      });

      // Phương thức nhận bánh
      const delivMethod = $('cust-delivery-method');
      delivMethod.addEventListener('change', () => {
        $('address-group').style.display = (delivMethod.value === 'delivery') ? 'block' : 'none';
        this.renderCheckoutSummary();
      });

      // Gửi đơn / nhắn đơn qua Zalo
      $('checkout-form').addEventListener('submit', (e) => {
        e.preventDefault();
        this.submitOrder();
      });
      $('btn-zalo-order').addEventListener('click', () => this.zaloOrder());

      $('btn-back-to-bakery').addEventListener('click', () => this.closeModal('modal-success'));

      // Sao chép thông tin chuyển khoản
      document.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-copy]');
        if (!btn) return;
        const text = $(btn.dataset.copy).textContent.trim();
        this.copyText(text).then(() => this.showToast('Đã sao chép'));
      });
    }

    openBook(pageIndex) {
      this.book.open(pageIndex);
    }

    onBookClosed() {
      this.updateCartUI();
    }

    // Thêm theo mã món (dùng cho các nút trong sách)
    addById(id, qty, fromEl, inBook) {
      const p = this.findProduct(id);
      if (!p) return;
      this.addToCart(p, qty);
      this.sound.playChime();
      this.showToast(`Đã thêm ${qty} × ${p.name} vào giỏ`);
      this.flyToCart(fromEl, p._img, inBook ? 'bk-cart' : 'btn-open-cart');
    }

    // Ảnh bánh bay vào giỏ hàng
    flyToCart(fromEl, imgUrl, targetId) {
      const pop = () => {
        ['cart-counter', 'bk-cart-counter'].forEach((id) => {
          const b = $(id);
          if (!b) return;
          b.classList.remove('pop');
          void b.offsetWidth;
          b.classList.add('pop');
        });
      };
      const target = $(targetId || (this.book.isOpen ? 'bk-cart' : 'btn-open-cart'));
      if (!fromEl || !target || prefersReducedMotion || !fromEl.getBoundingClientRect || !target.animate) {
        pop();
        return;
      }
      const a = fromEl.getBoundingClientRect();
      const b = target.getBoundingClientRect();
      if (!a.width || !b.width) { pop(); return; }
      const img = document.createElement('img');
      img.className = 'fly';
      img.alt = '';
      img.src = imgUrl || PLACEHOLDER_IMG;
      img.style.left = (a.left + a.width / 2 - 26) + 'px';
      img.style.top = (a.top + a.height / 2 - 26) + 'px';
      document.body.appendChild(img);
      const dx = (b.left + b.width / 2) - (a.left + a.width / 2);
      const dy = (b.top + b.height / 2) - (a.top + a.height / 2);
      const anim = img.animate([
        { transform: 'translate(0, 0) scale(1)', opacity: 1 },
        { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 60}px) scale(0.8)`, opacity: 1, offset: 0.45 },
        { transform: `translate(${dx}px, ${dy}px) scale(0.2)`, opacity: 0.5 }
      ], { duration: 750, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' });
      anim.onfinish = () => { img.remove(); pop(); };
      anim.oncancel = () => { img.remove(); pop(); };
    }

    copyText(text) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text).catch(() => this.legacyCopy(text));
      }
      this.legacyCopy(text);
      return Promise.resolve();
    }

    legacyCopy(text) {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(ta);
    }

    // --- GIỎ HÀNG & CHECKOUT ---
    openCheckoutModal() {
      this.renderCartItems();
      this.renderCheckoutSummary();
      this.openModal('modal-checkout');
    }

    renderCartItems() {
      const container = $('cart-items-container');
      if (!container) return;
      if (this.cart.length === 0) {
        container.innerHTML = '<p class="cart-empty">Giỏ hàng đang trống. Vuốt xem bánh rồi bấm “Thêm vào giỏ” nhé.</p>';
        return;
      }
      container.innerHTML = this.cart.map((item, idx) => `
        <div class="cart-item">
          <img src="${esc(item.product._img || PLACEHOLDER_IMG)}" alt="">
          <div class="ci-info">
            <div class="ci-name">${esc(item.product.name)}</div>
            <div class="ci-price">${fmt(item.product.price)} × ${item.quantity}</div>
          </div>
          <div class="ci-qty">
            <button type="button" data-op="dec" data-idx="${idx}" aria-label="Giảm số lượng">&minus;</button>
            <span>${item.quantity}</span>
            <button type="button" data-op="inc" data-idx="${idx}" aria-label="Tăng số lượng">+</button>
          </div>
          <button type="button" class="ci-remove" data-op="remove" data-idx="${idx}" aria-label="Xóa khỏi giỏ">&times;</button>
        </div>
      `).join('');
    }

    cartCount() {
      return this.cart.reduce((acc, i) => acc + i.quantity, 0);
    }

    cartSubtotal() {
      return this.cart.reduce((acc, i) => acc + (Number(i.product.price) || 0) * i.quantity, 0);
    }

    calcTotals() {
      const subtotal = this.cartSubtotal();
      const isDelivery = $('cust-delivery-method').value === 'delivery';
      const shipping = isDelivery && subtotal > 0 ? (Number(this.settings.shipping_fee_default) || 25000) : 0;
      return { subtotal: subtotal, shipping: shipping, total: subtotal + shipping };
    }

    renderCheckoutSummary() {
      const t = this.calcTotals();
      $('summary-subtotal').textContent = fmt(t.subtotal);
      $('summary-shipping').textContent = fmt(t.shipping);
      $('summary-total').textContent = fmt(t.total);
    }

    // Soạn nội dung đơn dạng chữ để nhắn Zalo
    buildOrderText() {
      const t = this.calcTotals();
      const name = $('cust-name').value.trim();
      const phone = $('cust-phone').value.trim();
      const method = $('cust-delivery-method').value;
      const address = $('cust-address').value.trim();
      const note = $('cust-note').value.trim();
      const lines = [];
      lines.push(`ĐƠN ĐẶT BÁNH — ${this.settings.brand_name || 'Tiệm bánh nhà làm'}`);
      if (name) lines.push(`Tên: ${name}`);
      if (phone) lines.push(`SĐT: ${phone}`);
      lines.push(`Nhận bánh: ${method === 'delivery' ? 'Giao tận nơi' : 'Đến lấy tại tiệm'}`);
      if (method === 'delivery' && address) lines.push(`Địa chỉ: ${address}`);
      lines.push('Món đã chọn:');
      this.cart.forEach((i) => {
        lines.push(`- ${i.quantity} × ${i.product.name}: ${fmt((Number(i.product.price) || 0) * i.quantity)}`);
      });
      if (t.shipping > 0) lines.push(`Phí giao: ${fmt(t.shipping)}`);
      lines.push(`TỔNG: ${fmt(t.total)}`);
      if (note) lines.push(`Ghi chú: ${note}`);
      return lines.join('\n');
    }

    // Đặt qua Zalo: sao chép đơn rồi mở khung chat Zalo của tiệm để dán gửi
    zaloOrder() {
      if (this.cart.length === 0) {
        this.showToast('Giỏ hàng trống. Hãy chọn ít nhất một chiếc bánh.');
        return;
      }
      const text = this.buildOrderText();
      window.open(this.zaloUrl(), '_blank', 'noopener');
      this.copyText(text).then(() => this.showToast('Đã sao chép đơn. Dán vào Zalo rồi gửi cho tiệm nhé!'));
    }

    // Gửi đơn hàng lên Apps Script
    async submitOrder() {
      if (this.cart.length === 0) {
        this.showToast('Giỏ hàng trống. Hãy chọn ít nhất một chiếc bánh.');
        return;
      }

      const name = $('cust-name').value.trim();
      const phone = $('cust-phone').value.trim();
      const method = $('cust-delivery-method').value;
      const address = $('cust-address').value.trim();
      const note = $('cust-note').value.trim();
      const payment = $('cust-payment-method').value;

      if (!name || !phone) {
        this.showToast('Vui lòng điền họ tên và số điện thoại liên hệ.');
        return;
      }
      const cleanPhone = phone.replace(/[\s.\-]/g, '');
      if (!/^(\+?84|0)\d{8,10}$/.test(cleanPhone)) {
        this.showToast('Số điện thoại chưa đúng. Ví dụ: 0988123456');
        $('cust-phone').focus();
        return;
      }
      if (method === 'delivery' && !address) {
        this.showToast('Vui lòng nhập địa chỉ để tiệm giao bánh tận nơi.');
        $('cust-address').focus();
        return;
      }

      const submitBtn = $('btn-submit-order');
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Đang gửi đơn…</span>';

      const orderPayload = {
        action: 'createOrder',
        customer: {
          name: name,
          phone: phone,
          delivery_method: method,
          address: address,
          note: note,
          payment_method: payment
        },
        items: this.cart.map((i) => ({ id: i.product.id, quantity: i.quantity }))
      };

      try {
        let orderResult = null;

        if (this.isApiConfigured() && this.apiConnected) {
          // Gửi POST tới Apps Script Web App (text/plain để tránh preflight CORS)
          const resp = await this.fetchWithTimeout(CONFIG.API_BASE_URL, {
            method: 'POST',
            body: JSON.stringify(orderPayload),
            headers: { 'Content-Type': 'text/plain;charset=utf-8' }
          });
          if (!resp.ok) throw new Error('HTTP ' + resp.status);
          orderResult = await resp.json();
        } else if (this.isApiConfigured()) {
          // Đã cấu hình API nhưng đang xem thực đơn mẫu: không nhận đơn giả
          this.showToast('Chưa kết nối được hệ thống nhận đơn. Vui lòng thử lại hoặc nhắn Zalo cho tiệm.');
          return;
        } else {
          // Chế độ demo: chỉ khi CHƯA cấu hình API thật
          const t = this.calcTotals();
          orderResult = {
            success: true,
            order: {
              order_id: 'DEMO-' + Math.floor(1000 + Math.random() * 9000),
              total: t.total,
              payment_method: payment
            }
          };
        }

        if (orderResult && orderResult.success) {
          this.closeModal('modal-checkout');
          if (this.book.isOpen) this.book.close();
          this.clearCart();
          $('checkout-form').reset();
          $('address-group').style.display = 'none';
          this.showOrderSuccess(orderResult.order);
        } else {
          this.showToast((orderResult && orderResult.error) || 'Có lỗi xảy ra khi tạo đơn. Vui lòng thử lại.');
        }
      } catch (err) {
        console.error('Lỗi Submit Order:', err);
        this.showToast('Chưa gửi được đơn do lỗi mạng. Đơn chưa được ghi nhận, vui lòng thử lại hoặc gọi hotline.');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Gửi đơn đặt bánh</span>';
      }
    }

    showOrderSuccess(order) {
      const s = this.settings;
      const total = fmt(order.total);
      $('success-order-id').textContent = order.order_id;
      $('success-total-val').textContent = total;
      $('success-transfer-memo').textContent = order.order_id;
      $('nobank-total').textContent = total;
      $('cod-total').textContent = total;

      const isCod = order.payment_method === 'cod';
      const acc = String(s.bank_account_number || '').trim();
      const hasBank = !!acc;

      $('cod-note').style.display = isCod ? 'block' : 'none';
      $('transfer-instruction-box').style.display = (!isCod && hasBank) ? 'block' : 'none';
      $('no-bank-note').style.display = (!isCod && !hasBank) ? 'block' : 'none';

      if (!isCod && hasBank) {
        const holder = s.bank_account_holder || '';
        $('success-bank-name').textContent = s.bank_name || '—';
        $('success-bank-acc').textContent = acc;
        $('success-bank-holder').textContent = holder || '—';

        // Có bank_code -> tạo VietQR đúng số tiền và nội dung; nếu không dùng ảnh QR tĩnh
        const qrImg = $('success-qr-img');
        qrImg.style.display = '';
        delete qrImg.dataset.fallbackApplied;
        const staticQr = isSafeUrl(s.bank_qr_url) ? s.bank_qr_url : '';
        if (s.bank_code) {
          qrImg.src = `https://img.vietqr.io/image/${encodeURIComponent(s.bank_code)}-${encodeURIComponent(acc)}-compact2.png`
            + `?amount=${encodeURIComponent(Math.round(Number(order.total) || 0))}`
            + `&addInfo=${encodeURIComponent(order.order_id)}`
            + (holder ? `&accountName=${encodeURIComponent(holder)}` : '');
          qrImg.onerror = () => {
            if (staticQr && qrImg.src !== staticQr) {
              qrImg.onerror = () => { qrImg.style.display = 'none'; };
              qrImg.src = staticQr;
            } else {
              qrImg.style.display = 'none';
            }
          };
        } else if (staticQr) {
          qrImg.onerror = () => { qrImg.style.display = 'none'; };
          qrImg.src = staticQr;
        } else {
          qrImg.style.display = 'none';
        }
      }

      this.sound.playBell();
      this.openModal('modal-success');
    }

    // --- GIỎ HÀNG (Cart Operations & LocalStorage) ---
    addToCart(product, qty) {
      const existing = this.cart.find((i) => String(i.product.id) === String(product.id));
      if (existing) {
        existing.quantity = Math.min(99, existing.quantity + qty);
      } else {
        this.cart.push({ product: product, quantity: qty });
      }
      this.saveCart();
      this.updateCartUI();
    }

    removeFromCart(idx) {
      this.cart.splice(idx, 1);
      this.saveCart();
      this.updateCartUI();
    }

    clearCart() {
      this.cart = [];
      this.saveCart();
      this.updateCartUI();
    }

    saveCart() {
      try {
        localStorage.setItem('tiem_banh_nha_lam_cart', JSON.stringify(this.cart));
      } catch (e) {}
    }

    loadCart() {
      try {
        const saved = localStorage.getItem('tiem_banh_nha_lam_cart');
        const parsed = saved ? JSON.parse(saved) : [];
        return Array.isArray(parsed) ? parsed.filter((i) => i && i.product && i.product.id != null) : [];
      } catch (e) {
        return [];
      }
    }

    updateCartUI() {
      const count = this.cartCount();
      const total = this.cartSubtotal();
      ['cart-counter', 'bk-cart-counter'].forEach((id) => {
        const badge = $(id);
        if (badge) badge.textContent = count;
      });
      const pill = $('cart-pill');
      pill.classList.toggle('show', count > 0);
      $('pill-count').textContent = count;
      $('pill-total').textContent = fmt(total);
      if (this.book) this.book.refreshOrderPage();
    }

    // --- MODAL HELPERS ---
    openModal(id) {
      const el = $(id);
      if (!el) return;
      this.lastFocus = document.activeElement;
      el.classList.add('open');
      document.body.classList.add('modal-open');
      const closeBtn = el.querySelector('.modal-close');
      if (closeBtn) setTimeout(() => closeBtn.focus({ preventScroll: true }), 60);
    }

    closeModal(id) {
      const el = $(id);
      if (!el) return;
      el.classList.remove('open');
      if (!this.isAnyModalOpen() && !this.book.isOpen) {
        document.body.classList.remove('modal-open');
        if (this.lastFocus && this.lastFocus.focus) this.lastFocus.focus({ preventScroll: true });
      }
    }

    closeTopModal() {
      const open = document.querySelectorAll('.modal-overlay.open');
      if (open.length) this.closeModal(open[open.length - 1].id);
    }

    showToast(msg) {
      const t = $('toast');
      if (!t) return;
      t.textContent = msg;
      t.classList.add('show');
      clearTimeout(this.toastTimer);
      this.toastTimer = setTimeout(() => t.classList.remove('show'), 3400);
    }
  }

  // Khởi động khi DOM đã tải xong
  window.addEventListener('DOMContentLoaded', () => {
    window.bakeryAppInstance = new BakeryApp();
  });
})();
