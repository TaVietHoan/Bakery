/**
 * ============================================================================
 * PETIT FOUR — ARTISAN BAKERY · 3D SHOWROOM
 * ============================================================================
 * Công nghệ: Three.js r128, Web Audio API, Vanilla ES6+, Google Sheets Backend
 * Trải nghiệm: chọn món -> xoay 360° bằng chuột / chạm -> thêm giỏ -> đặt hàng
 * (không có di chuyển góc nhìn thứ nhất như bản cũ)
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
    DRAG_SENSITIVITY: 0.009,
    AUTO_ROTATE_SPEED: 0.35, // rad / giây
    AUTO_ROTATE_DELAY_MS: 2200,
    MODEL_SCALE: 3.6
  };

  // --- DỮ LIỆU DEMO DỰ PHÒNG ---
  const FALLBACK_CATEGORIES = [
    { id: 'cat_signature', name: 'Signature Cakes' },
    { id: 'cat_pastry', name: 'Croissant & Pastry' },
    { id: 'cat_bread', name: 'Artisan Bread' },
    { id: 'cat_cookies', name: 'Macaron & Tart' },
    { id: 'cat_drinks', name: 'Specialty Drinks' }
  ];

  const FALLBACK_PRODUCTS = [
    {
      id: 'prod_01', name: 'Butter Croissant Cổ Điển', category: 'cat_pastry', price: 45000,
      description: 'Bánh sừng bò truyền thống với hàng trăm lớp bơ Pháp thơm lừng giòn rụm.',
      ingredients: 'Bơ lạt Pháp Elle & Vire, Bột mì T55, Men tươi',
      flavor: 'Thơm bơ béo nhẹ, vỏ giòn ruột xốp', weight: '85g',
      image_url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80',
      model_type: 'croissant'
    },
    {
      id: 'prod_02', name: 'Almond Croissant Nướng Giòn', category: 'cat_pastry', price: 65000,
      description: 'Croissant ngập kem hạnh nhân frangipane, rắc hạnh nhân lát nướng thơm.',
      ingredients: 'Bột hạnh nhân Mỹ, Trứng gà tươi, Bơ Pháp, Rượu rum',
      flavor: 'Ngọt dịu, bùi béo hạnh nhân', weight: '120g',
      image_url: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=800&q=80',
      model_type: 'croissant'
    },
    {
      id: 'prod_04', name: 'Strawberry Shortcake Nhật Bản', category: 'cat_signature', price: 85000,
      description: 'Cốt chiffon mịn mượt như mây kết hợp kem tươi Hokkaido và dâu tây ngọt mát.',
      ingredients: 'Dâu tây Đà Lạt, Kem sữa Hokkaido, Trứng tươi',
      flavor: 'Chua ngọt thanh tao, kem mát mịn', weight: '140g',
      image_url: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=80',
      model_type: 'strawberry_cake'
    },
    {
      id: 'prod_05', name: 'Bánh Kem Chocolate Truffle', category: 'cat_signature', price: 90000,
      description: 'Cốt bánh ẩm mọng socola Bỉ phủ lớp kem ganache bóng mượt sánh mịn.',
      ingredients: 'Chocolate Bỉ 70%, Bột ca cao nguyên chất, Bơ Pháp',
      flavor: 'Đậm vị ca cao, ngọt vừa sâu lắng', weight: '150g',
      image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
      model_type: 'chocolate_cake'
    },
    {
      id: 'prod_07', name: 'Éclair Chocolate Hạt Phỉ', category: 'cat_pastry', price: 58000,
      description: 'Bánh vỏ choux dài giòn nhẹ với nhân kem custard socola praline bùi béo.',
      ingredients: 'Vỏ choux bơ tươi, Kem custard hạt phỉ, Socola glaze',
      flavor: 'Bùi béo giòn nhẹ bùng nổ hương vị', weight: '90g',
      image_url: 'https://images.unsplash.com/photo-1612203985729-70726954388c?auto=format&fit=crop&w=800&q=80',
      model_type: 'eclair'
    },
    {
      id: 'prod_09', name: 'Tart Trái Cây Tươi Mùa Hạ', category: 'cat_cookies', price: 75000,
      description: 'Đế tart bơ giòn rụm ngập kem vani Madagascar và quả mọng nhiệt đới.',
      ingredients: 'Vani Madagascar, Quả mâm xôi, Việt quất, Bột hạnh nhân',
      flavor: 'Vỏ giòn béo, hoa quả chua mọng thanh thoát', weight: '110g',
      image_url: 'https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=800&q=80',
      model_type: 'tart'
    },
    {
      id: 'prod_11', name: 'Bánh Mì Sourdough Men Rừng', category: 'cat_bread', price: 70000,
      description: 'Ổ bánh men tự nhiên ủ chậm 36h, vỏ giòn lò nướng đá, ruột ẩm dai mềm.',
      ingredients: 'Bột mì nguyên cám hữu cơ, Men mẹ tự nhiên 6 năm tuổi',
      flavor: 'Chua nhẹ hậu vị ngọt lúa mì', weight: '500g',
      image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
      model_type: 'bread'
    },
    {
      id: 'prod_14', name: 'Donut Chocolate Caramel Muối', category: 'cat_pastry', price: 38000,
      description: 'Bánh vòng chiên vàng bông xốp phủ chocolate đen và sốt caramel mặn.',
      ingredients: 'Bột mì mềm, Socola đen phủ, Muối biển Fleur de Sel',
      flavor: 'Mặn ngọt hòa quyện, cốt bánh mềm mại', weight: '80g',
      image_url: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=800&q=80',
      model_type: 'donut'
    },
    {
      id: 'prod_16', name: 'Cupcake Hồng Nhung Red Velvet', category: 'cat_pastry', price: 48000,
      description: 'Cốt bánh đỏ nhung bí ẩn kết hợp kem phô mai Cream Cheese béo ngậy.',
      ingredients: 'Cream cheese Anchor, Bột cacao, Giấm táo',
      flavor: 'Chua béo phô mai cân bằng cốt bánh ẩm', weight: '100g',
      image_url: 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&w=800&q=80',
      model_type: 'cupcake'
    },
    {
      id: 'prod_18', name: 'Hộp Macaron Tinh Hoa (6 Vị)', category: 'cat_cookies', price: 160000,
      description: 'Set 6 chiếc macaron giòn rỗng vỏ: Vani, Matcha, Phúc bồn tử, Socola, Hạt dẻ.',
      ingredients: 'Bột hạnh nhân Pháp, Trứng gà sạch, Ganache hoa quả',
      flavor: 'Vỏ giòn tan lập tức tan chảy cùng nhân', weight: '150g',
      image_url: 'https://images.unsplash.com/photo-1569864321390-38435d67e6b7?auto=format&fit=crop&w=800&q=80',
      model_type: 'macaron'
    },
    {
      id: 'prod_19', name: 'Cà Phê Latte Hạt Phỉ Thủ Công', category: 'cat_drinks', price: 55000,
      description: 'Cà phê đặc sản Espresso hòa cùng sữa tươi đánh bông và siro hạt phỉ nướng.',
      ingredients: 'Arabica Cầu Đất sơ chế ướt, Sữa thanh trùng tươi, Hạt phỉ rang xay',
      flavor: 'Thơm nồng nàn, êm dịu béo ngậy', weight: '320ml',
      image_url: 'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=800&q=80',
      model_type: 'drink'
    },
    {
      id: 'prod_20', name: 'Trà Hoa Bá Tước Kem Sữa Đào', category: 'cat_drinks', price: 60000,
      description: 'Trà Earl Grey đẫm hương cam Bergamot, đào ngâm và lớp milkfoam sánh mịn.',
      ingredients: 'Trà đen Earl Grey, Tinh dầu Bergamot, Đào miếng giòn, Kem béo',
      flavor: 'Thơm ngát thư giãn, chua ngọt êm ái', weight: '450ml',
      image_url: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80',
      model_type: 'drink'
    }
  ];

  const FALLBACK_SETTINGS = {
    brand_name: 'PETIT FOUR',
    brand_subtitle: 'Artisan Bakery & Tea House',
    currency: 'VND',
    store_address: 'Số 12 Tràng Tiền, Hoàn Kiếm, Hà Nội',
    store_phone: '0988 123 456',
    store_open_hours: '07:30 - 21:30 Mỗi ngày',
    shipping_fee_default: '25000',
    bank_name: 'Vietcombank - CN Hoàn Kiếm',
    bank_code: 'VCB',
    bank_account_number: '0011004567890',
    bank_account_holder: 'PETIT FOUR ARTISAN BAKERY',
    bank_qr_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    facebook_url: 'https://facebook.com',
    zalo_url: 'https://zalo.me',
    instagram_url: 'https://instagram.com',
    grabfood_url: '',
    shopeefood_url: '',
    befood_url: '',
    xanhsm_url: ''
  };

  // Màu nền sân khấu theo loại bánh
  const MODEL_TINTS = {
    croissant: '#F6DFB9',
    donut: '#F9D2DD',
    cupcake: '#F7D3E3',
    strawberry_cake: '#FBD6DA',
    chocolate_cake: '#E8D3C5',
    macaron: '#E3D8F2',
    bread: '#EADCC1',
    eclair: '#E4D5C6',
    tart: '#F9E6B0',
    drink: '#D6E6D8'
  };

  // Các app giao hàng (thứ tự hiển thị)
  const DELIVERY_APPS = [
    { key: 'befood_url', id: 'dl-be', label: 'beFood', cls: 'dl-be' },
    { key: 'grabfood_url', id: 'dl-grab', label: 'GrabFood', cls: 'dl-grab' },
    { key: 'shopeefood_url', id: 'dl-shopee', label: 'ShopeeFood', cls: 'dl-shopee' },
    { key: 'xanhsm_url', id: 'dl-xanh', label: 'Xanh SM', cls: 'dl-xanh' }
  ];

  // --- TIỆN ÍCH ---
  const $ = (id) => document.getElementById(id);
  const fmt = (n) => Number(n || 0).toLocaleString('vi-VN') + ' đ';
  const esc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isSafeUrl = (u) => /^https?:\/\//i.test(String(u || '').trim());

  function resolveModelType(p) {
    const t = p.model_type;
    if (p.category === 'cat_drinks' && (!t || t === 'bread')) return 'drink';
    return t || 'croissant';
  }

  // --- AUDIO SYNTHESIZER (Web Audio API - không cần file ngoài) ---
  class SoundManager {
    constructor() {
      this.ctx = null;
      this.enabled = false; // mặc định tắt, người dùng chủ động bật
    }
    init() {
      if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    }
    playDoorBell() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      this.createBeep(880, now, 0.4);
      this.createBeep(587.33, now + 0.25, 0.6);
    }
    playChime() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      this.createBeep(523.25, now, 0.15);
      this.createBeep(659.25, now + 0.08, 0.2);
    }
    createBeep(freq, time, dur) {
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

  // --- DỰNG MÔ HÌNH BÁNH PROCEDURAL ---
  // Quy ước: đáy mỗi món nằm ở y = 0 (mặt đĩa), kích thước khoảng 0.5 đơn vị.
  class BakeryMeshBuilder {
    static mat(color, roughness = 0.5, metalness = 0.05) {
      return new THREE.MeshStandardMaterial({ color: color, roughness: roughness, metalness: metalness });
    }

    static pseudo(seed) {
      const x = Math.sin(seed * 127.1) * 43758.5453;
      return x - Math.floor(x);
    }

    // 1. Croissant: các đốt bơ nối thành hình lưỡi liềm
    static createCroissant() {
      const group = new THREE.Group();
      const N = 9;
      const segGeo = new THREE.SphereGeometry(1, 18, 12);
      for (let i = 0; i < N; i++) {
        const t = i / (N - 1);
        const a = (t - 0.5) * 2.2;
        const s = 0.05 + 0.075 * Math.sin(Math.PI * t);
        const seg = new THREE.Mesh(segGeo, this.mat(i % 2 ? 0xC9894A : 0xDB9D5C, 0.4));
        seg.scale.set(0.088, s, s * 1.05);
        seg.position.set(Math.sin(a) * 0.27, s * 0.95, -Math.cos(a) * 0.2 + 0.19);
        seg.rotation.y = -a;
        group.add(seg);
      }
      return group;
    }

    // 2. Donut tráng men hồng + cốm màu
    static createDonut() {
      const group = new THREE.Group();
      const dough = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.1, 16, 32), this.mat(0xE2AE72, 0.6));
      dough.rotation.x = Math.PI / 2;
      dough.position.y = 0.1;
      group.add(dough);

      const glaze = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.104, 16, 32), this.mat(0xDE5D83, 0.15, 0.1));
      glaze.rotation.x = Math.PI / 2;
      glaze.scale.set(1, 1, 0.55);
      glaze.position.y = 0.145;
      group.add(glaze);

      const colors = [0xFFFFFF, 0xFFD34D, 0x6FC3E8, 0x8AD18A, 0xFFF0B3];
      const sprinkleGeo = new THREE.BoxGeometry(0.05, 0.012, 0.014);
      for (let i = 0; i < 18; i++) {
        const ang = this.pseudo(i + 1) * Math.PI * 2;
        const r = 0.22 + (this.pseudo(i + 40) - 0.5) * 0.1;
        const sp = new THREE.Mesh(sprinkleGeo, this.mat(colors[i % colors.length], 0.4));
        sp.position.set(Math.cos(ang) * r, 0.196, Math.sin(ang) * r);
        sp.rotation.y = this.pseudo(i + 80) * Math.PI;
        group.add(sp);
      }
      return group;
    }

    // 3. Cupcake với kem xoắn và cherry
    static createCupcake() {
      const group = new THREE.Group();
      const inner = new THREE.Group();
      const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.13, 0.2, 20), this.mat(0xB35C6A, 0.8));
      inner.add(cup);

      const creamMat = new THREE.MeshStandardMaterial({ color: 0xFDFBF7, roughness: 0.3 });
      const l1 = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.21, 0.08, 20), creamMat);
      l1.position.y = 0.12;
      const l2 = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 0.08, 18), creamMat);
      l2.position.y = 0.18;
      const l3 = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.12, 16), creamMat);
      l3.position.y = 0.26;
      inner.add(l1, l2, l3);

      const cherry = new THREE.Mesh(new THREE.SphereGeometry(0.045, 14, 14), this.mat(0xB31B1B, 0.1));
      cherry.position.y = 0.33;
      inner.add(cherry);

      inner.position.y = 0.1;
      group.add(inner);
      return group;
    }

    // 4. Strawberry shortcake
    static createStrawberryCake() {
      const group = new THREE.Group();
      const inner = new THREE.Group();
      const spongeMat = this.mat(0xF7E4B2, 0.6);
      const creamMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.2 });

      const s1 = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.08, 0.36), spongeMat);
      const c1 = new THREE.Mesh(new THREE.BoxGeometry(0.37, 0.04, 0.37), creamMat);
      c1.position.y = 0.06;
      const s2 = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.08, 0.36), spongeMat);
      s2.position.y = 0.12;
      const c2 = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.05, 0.38), creamMat);
      c2.position.y = 0.18;
      inner.add(s1, c1, s2, c2);

      const strawMat = this.mat(0xDC2626, 0.2);
      const leafMat = this.mat(0x3F8F4A, 0.6);
      [[-0.08, -0.04], [0.09, 0.06]].forEach((p, i) => {
        const berry = new THREE.Mesh(new THREE.SphereGeometry(0.06, 14, 12), strawMat);
        berry.scale.set(1, 1.15, 1);
        berry.position.set(p[0], 0.25, p[1]);
        const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.03, 6), leafMat);
        leaf.position.set(p[0], 0.325 - i * 0.0, p[1]);
        inner.add(berry, leaf);
      });

      inner.position.y = 0.04;
      group.add(inner);
      return group;
    }

    // 5. Chocolate cake nhiều tầng
    static createChocolateCake() {
      const group = new THREE.Group();
      const inner = new THREE.Group();
      const chocoSponge = this.mat(0x382017, 0.7);
      const chocoCream = new THREE.MeshStandardMaterial({ color: 0x22110B, roughness: 0.2, metalness: 0.1 });

      const s1 = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.1, 0.38), chocoSponge);
      const c1 = new THREE.Mesh(new THREE.BoxGeometry(0.39, 0.04, 0.39), chocoCream);
      c1.position.y = 0.07;
      const s2 = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.1, 0.38), chocoSponge);
      s2.position.y = 0.14;
      const glaze = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.03, 0.4), chocoCream);
      glaze.position.y = 0.2;
      inner.add(s1, c1, s2, glaze);

      const curlMat = this.mat(0x6A3F2B, 0.35);
      for (let i = 0; i < 4; i++) {
        const curl = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.12, 8), curlMat);
        curl.rotation.z = Math.PI / 2;
        curl.rotation.y = i * 0.7;
        curl.position.set(-0.06 + i * 0.05, 0.235, -0.03 + (i % 2) * 0.06);
        inner.add(curl);
      }
      const gold = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.006, 0.04), this.mat(0xD4AF37, 0.25, 0.8));
      gold.position.set(0.1, 0.221, 0.1);
      gold.rotation.y = 0.5;
      inner.add(gold);

      inner.position.y = 0.05;
      group.add(inner);
      return group;
    }

    // 6. Macaron: ba chiếc nhiều màu
    static createMacaron() {
      const group = new THREE.Group();
      const makeMac = (shellColor) => {
        const m = new THREE.Group();
        const shellMat = new THREE.MeshStandardMaterial({ color: shellColor, roughness: 0.35 });
        const top = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.17, 0.06, 24), shellMat);
        top.position.y = 0.05;
        const bot = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.18, 0.06, 24), shellMat);
        bot.position.y = -0.05;
        const fill = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.04, 24), new THREE.MeshStandardMaterial({ color: 0xFFF3E0, roughness: 0.3 }));
        m.add(top, fill, bot);
        m.position.y = 0.08;
        return m;
      };
      const spots = [
        [-0.14, 0.08, 0xF4A7B9],
        [0.14, 0.08, 0x9CCB86],
        [0, -0.13, 0xB9A3E3]
      ];
      spots.forEach((s) => {
        const wrap = new THREE.Group();
        wrap.add(makeMac(s[2]));
        wrap.scale.setScalar(0.7);
        wrap.position.set(s[0], 0.0, s[1]);
        group.add(wrap);
      });
      return group;
    }

    // 7. Bánh mì nướng nâu có đường rạch
    static createBreadLoaf() {
      const group = new THREE.Group();
      const bread = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 18), this.mat(0xA8602A, 0.7));
      bread.scale.set(0.3, 0.13, 0.17);
      bread.position.y = 0.12;
      group.add(bread);

      const slashMat = this.mat(0xF1DFC2, 0.8);
      [-0.1, 0, 0.1].forEach((x) => {
        const slash = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.012, 0.022), slashMat);
        slash.position.set(x, 0.12 + 0.13 * Math.sqrt(1 - Math.pow(x / 0.3, 2)) - 0.002, 0);
        slash.rotation.y = 0.9;
        group.add(slash);
      });
      return group;
    }

    // 8. Éclair phủ socola
    static createEclair() {
      const group = new THREE.Group();
      const body = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 16), this.mat(0xD9A566, 0.5));
      body.scale.set(0.27, 0.085, 0.092);
      body.position.y = 0.085;
      group.add(body);

      const glaze = new THREE.Mesh(
        new THREE.SphereGeometry(1, 28, 12, 0, Math.PI * 2, 0, Math.PI / 2),
        new THREE.MeshStandardMaterial({ color: 0x2A1810, roughness: 0.15 })
      );
      glaze.scale.set(0.262, 0.065, 0.098);
      glaze.position.y = 0.11;
      group.add(glaze);
      return group;
    }

    // 9. Tart hoa quả
    static createTart() {
      const group = new THREE.Group();
      const inner = new THREE.Group();
      const crust = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.19, 0.08, 28), this.mat(0xC68642, 0.6));
      inner.add(crust);

      const filling = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.21, 0.03, 24), new THREE.MeshStandardMaterial({ color: 0xFDEE87, roughness: 0.2 }));
      filling.position.y = 0.04;
      inner.add(filling);

      const berryMat = this.mat(0x9E1B4A, 0.2);
      for (let i = 0; i < 6; i++) {
        const ang = (i / 6) * Math.PI * 2;
        const berry = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 10), berryMat);
        berry.position.set(Math.cos(ang) * 0.12, 0.075, Math.sin(ang) * 0.12);
        inner.add(berry);
      }
      const blue = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 10), this.mat(0x3B4B9A, 0.25));
      blue.position.set(0, 0.078, 0);
      const mint = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.05, 6), this.mat(0x4F8F5A, 0.6));
      mint.position.set(0.04, 0.105, 0.03);
      mint.rotation.z = -0.8;
      inner.add(blue, mint);

      inner.position.y = 0.04;
      group.add(inner);
      return group;
    }

    // 10. Đồ uống: tách cà phê latte
    static createDrink() {
      const group = new THREE.Group();
      const ceramic = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.2, side: THREE.DoubleSide });

      const saucer = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.22, 0.02, 32), ceramic);
      saucer.position.y = 0.01;
      group.add(saucer);

      const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.12, 0.2, 32, 1, true), ceramic);
      cup.position.y = 0.12;
      group.add(cup);
      const cupBottom = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.01, 32), ceramic);
      cupBottom.position.y = 0.025;
      group.add(cupBottom);

      const coffee = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.01, 32), this.mat(0x7A4A2B, 0.3));
      coffee.position.y = 0.19;
      group.add(coffee);

      const art = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.022, 10, 28), this.mat(0xF5E6D0, 0.4));
      art.rotation.x = Math.PI / 2;
      art.position.y = 0.197;
      const artDot = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.004, 20), this.mat(0xF5E6D0, 0.4));
      artDot.position.y = 0.196;
      group.add(art, artDot);

      const handle = new THREE.Mesh(new THREE.TorusGeometry(0.065, 0.017, 10, 20, Math.PI), ceramic);
      handle.position.set(0.17, 0.125, 0);
      handle.rotation.z = -Math.PI / 2;
      group.add(handle);
      return group;
    }

    // Factory theo model_type, đặt trên đĩa sứ
    static build(modelType) {
      let pastry;
      switch (modelType) {
        case 'croissant': pastry = this.createCroissant(); break;
        case 'donut': pastry = this.createDonut(); break;
        case 'cupcake': pastry = this.createCupcake(); break;
        case 'strawberry_cake': pastry = this.createStrawberryCake(); break;
        case 'chocolate_cake': pastry = this.createChocolateCake(); break;
        case 'macaron': pastry = this.createMacaron(); break;
        case 'bread': pastry = this.createBreadLoaf(); break;
        case 'eclair': pastry = this.createEclair(); break;
        case 'tart': pastry = this.createTart(); break;
        case 'drink': pastry = this.createDrink(); break;
        default: pastry = this.createCroissant();
      }

      const holder = new THREE.Group();
      if (modelType !== 'drink') {
        const plate = new THREE.Mesh(
          new THREE.CylinderGeometry(0.34, 0.26, 0.025, 36),
          new THREE.MeshStandardMaterial({ color: 0xFAF8F5, roughness: 0.2, metalness: 0.05 })
        );
        plate.position.y = -0.0125;
        holder.add(plate);
      }
      holder.add(pastry);
      holder.traverse((o) => {
        if (o.isMesh) {
          o.castShadow = true;
          o.receiveShadow = true;
        }
      });
      return holder;
    }
  }

  // --- SÂN KHẤU 3D: xoay bằng kéo chuột / chạm, tự xoay khi rảnh ---
  class ShowcaseStage {
    constructor(canvas, wrap) {
      this.canvas = canvas;
      this.wrap = wrap;
      this.ok = false;
      this.visible = true;
      this.model = null;
      this.currentType = null;
      this.pending = null;
      this.trans = null;
      this.curScale = 0.001;
      this.rotY = 0.7;
      this.rotX = 0.14;
      this.velY = 0;
      this.dragging = false;
      this.zoom = 1;
      this.lastInteract = performance.now() - CONFIG.AUTO_ROTATE_DELAY_MS;
      this.onFirstInteract = null;
      this.time = 0;

      if (typeof THREE === 'undefined') return;
      try {
        this.renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
      } catch (e) {
        return;
      }

      const r = this.renderer;
      r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      r.shadowMap.enabled = true;
      r.shadowMap.type = THREE.PCFSoftShadowMap;
      r.outputEncoding = THREE.sRGBEncoding;
      r.toneMapping = THREE.ACESFilmicToneMapping;
      r.toneMappingExposure = 1.05;
      r.setClearColor(0x000000, 0);

      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(34, 1, 0.1, 60);
      this.camTarget = new THREE.Vector3(0, 0.55, 0);

      this.buildScene();
      this.bindEvents();
      this.resize();
      this.ok = true;
      this.clock = new THREE.Clock();
      this.loop();
    }

    buildScene() {
      const hemi = new THREE.HemisphereLight(0xffffff, 0xf0d9e0, 0.85);
      this.scene.add(hemi);

      const key = new THREE.DirectionalLight(0xfff4e6, 1.15);
      key.position.set(3, 5.5, 3.5);
      key.castShadow = true;
      key.shadow.mapSize.set(1024, 1024);
      key.shadow.camera.left = -3;
      key.shadow.camera.right = 3;
      key.shadow.camera.top = 3;
      key.shadow.camera.bottom = -3;
      key.shadow.camera.near = 1;
      key.shadow.camera.far = 14;
      key.shadow.bias = -0.0006;
      this.scene.add(key);

      const rim = new THREE.DirectionalLight(0xdfe9ff, 0.55);
      rim.position.set(-4, 3, -3);
      this.scene.add(rim);

      // Bục trưng bày
      const podiumMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.45 });
      const podium = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.3, 64), podiumMat);
      podium.position.y = -0.15;
      podium.receiveShadow = true;
      this.scene.add(podium);

      const base = new THREE.Mesh(
        new THREE.CylinderGeometry(1.72, 1.72, 0.08, 64),
        new THREE.MeshStandardMaterial({ color: 0xEFE3E6, roughness: 0.6 })
      );
      base.position.y = -0.34;
      base.receiveShadow = true;
      this.scene.add(base);

      const shadowPlane = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.ShadowMaterial({ opacity: 0.16 }));
      shadowPlane.rotation.x = -Math.PI / 2;
      shadowPlane.position.y = -0.381;
      shadowPlane.receiveShadow = true;
      this.scene.add(shadowPlane);

      // Nhóm xoay chứa món bánh
      this.pivot = new THREE.Group();
      this.scene.add(this.pivot);

      // Hạt lấp lánh nhẹ (bột đường / bụi bột)
      const count = 60;
      const pos = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        pos[i * 3] = (Math.random() - 0.5) * 6;
        pos[i * 3 + 1] = Math.random() * 3;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 4;
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      this.dust = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.045, transparent: true, opacity: 0.75, depthWrite: false }));
      this.scene.add(this.dust);
    }

    bindEvents() {
      const c = this.canvas;
      c.addEventListener('pointerdown', (e) => {
        this.dragging = true;
        this.lastX = e.clientX;
        this.lastY = e.clientY;
        this.velY = 0;
        this.markInteract();
        try { c.setPointerCapture(e.pointerId); } catch (err) {}
        c.classList.add('grabbing');
      });
      c.addEventListener('pointermove', (e) => {
        if (!this.dragging) return;
        const dx = e.clientX - this.lastX;
        const dy = e.clientY - this.lastY;
        this.lastX = e.clientX;
        this.lastY = e.clientY;
        const delta = dx * CONFIG.DRAG_SENSITIVITY;
        this.rotY += delta;
        this.velY = delta;
        if (e.pointerType === 'mouse') {
          this.rotX = clamp(this.rotX + dy * CONFIG.DRAG_SENSITIVITY * 0.6, -0.12, 0.65);
        }
        this.markInteract();
      });
      const end = () => {
        this.dragging = false;
        c.classList.remove('grabbing');
        this.markInteract();
      };
      c.addEventListener('pointerup', end);
      c.addEventListener('pointercancel', end);
      c.addEventListener('lostpointercapture', end);

      // Phím mũi tên khi canvas đang focus (hỗ trợ bàn phím)
      c.setAttribute('tabindex', '0');
      c.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft' && e.shiftKey) { this.rotY -= 0.2; this.markInteract(); }
        if (e.key === 'ArrowRight' && e.shiftKey) { this.rotY += 0.2; this.markInteract(); }
      });

      if ('ResizeObserver' in window) {
        new ResizeObserver(() => this.resize()).observe(this.wrap);
      } else {
        window.addEventListener('resize', () => this.resize());
      }
      if ('IntersectionObserver' in window) {
        new IntersectionObserver((entries) => {
          this.visible = entries[0].isIntersecting;
        }, { threshold: 0.01 }).observe(this.wrap);
      }
    }

    markInteract() {
      this.lastInteract = performance.now();
      if (this.onFirstInteract) {
        this.onFirstInteract();
        this.onFirstInteract = null;
      }
    }

    resize() {
      const w = this.wrap.clientWidth;
      const h = this.wrap.clientHeight;
      if (!w || !h) return;
      this.renderer.setSize(w, h, false);
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.frameCamera();
    }

    frameCamera() {
      const aspect = this.camera.aspect || 1;
      // Đảm bảo bục luôn lọt khung hình, kể cả màn hình dọc của điện thoại
      const baseDist = Math.max(5.4, 3.5 / (0.611 * aspect));
      const d = baseDist * this.zoom;
      this.camera.position.set(0, this.camTarget.y + d * 0.24, d);
      this.camera.lookAt(this.camTarget);
    }

    setZoom(delta) {
      this.zoom = clamp(this.zoom + delta, 0.6, 1.3);
      this.frameCamera();
      this.markInteract();
    }

    setModel(type) {
      if (!this.ok) return;
      if (!this.trans && this.currentType === type) return;
      this.pending = type;
      if (!this.model) {
        this.swap();
        this.trans = { phase: 'in', t: 0 };
      } else if (!this.trans || this.trans.phase === 'in') {
        this.trans = { phase: 'out', t: 0, from: this.curScale };
      }
    }

    swap() {
      if (this.model) {
        this.pivot.remove(this.model);
        this.disposeObject(this.model);
      }
      this.model = BakeryMeshBuilder.build(this.pending);
      this.currentType = this.pending;
      this.curScale = 0.001;
      this.model.scale.setScalar(this.curScale);
      this.pivot.add(this.model);
    }

    disposeObject(obj) {
      obj.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) {
          if (Array.isArray(o.material)) o.material.forEach((m) => m.dispose());
          else o.material.dispose();
        }
      });
    }

    easeOutBack(x) {
      const c1 = 1.70158;
      const c3 = c1 + 1;
      return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
    }

    update(dt) {
      this.time += dt;

      // Chuyển món: thu nhỏ món cũ -> đổi -> phóng ra món mới
      if (this.trans && this.model) {
        const tr = this.trans;
        tr.t += dt;
        if (tr.phase === 'out') {
          const dur = prefersReducedMotion ? 0.01 : 0.2;
          const k = Math.min(tr.t / dur, 1);
          this.curScale = Math.max(0.001, tr.from * (1 - k * k));
          this.model.scale.setScalar(this.curScale);
          if (k >= 1) {
            this.swap();
            this.trans = { phase: 'in', t: 0 };
            if (!prefersReducedMotion) this.velY += 0.12;
          }
        } else {
          const dur = prefersReducedMotion ? 0.01 : 0.6;
          const k = Math.min(tr.t / dur, 1);
          this.curScale = Math.max(0.001, this.easeOutBack(k) * CONFIG.MODEL_SCALE);
          this.model.scale.setScalar(this.curScale);
          if (k >= 1) {
            this.curScale = CONFIG.MODEL_SCALE;
            this.model.scale.setScalar(this.curScale);
            this.trans = null;
          }
        }
      }

      // Xoay: quán tính sau khi thả, rồi tự xoay khi rảnh
      if (!this.dragging) {
        if (Math.abs(this.velY) > 0.0004) {
          this.rotY += this.velY;
          this.velY *= 0.93;
        } else if (!prefersReducedMotion && performance.now() - this.lastInteract > CONFIG.AUTO_ROTATE_DELAY_MS) {
          this.rotY += CONFIG.AUTO_ROTATE_SPEED * dt;
        }
        if (this.rotX > 0.14) this.rotX = Math.max(0.14, this.rotX - dt * 0.15);
      }
      this.pivot.rotation.y = this.rotY;
      this.pivot.rotation.x = this.rotX * 0.55;

      // Hạt bay nhẹ
      if (this.dust && !prefersReducedMotion) {
        const p = this.dust.geometry.attributes.position;
        for (let i = 0; i < p.count; i++) {
          let y = p.getY(i) + dt * (0.04 + (i % 5) * 0.012);
          if (y > 3) y = 0;
          p.setY(i, y);
        }
        p.needsUpdate = true;
      }
    }

    loop() {
      requestAnimationFrame(() => this.loop());
      const dt = Math.min(this.clock.getDelta(), 0.05);
      if (!this.visible || document.hidden) return;
      this.update(dt);
      this.renderer.render(this.scene, this.camera);
    }
  }

  // --- ỨNG DỤNG CHÍNH ---
  class BakeryApp {
    constructor() {
      this.products = [];
      this.categories = [];
      this.settings = {};
      this.cart = this.loadCart();
      this.selectedIndex = 0;
      this.activeQuantity = 1;
      this.activeCat = null;
      this.apiConnected = false;
      this.lastFocus = null;
      this.sound = new SoundManager();
      this.sound.enabled = false;

      this.stage = new ShowcaseStage($('stage-canvas'), $('stage-wrap'));
      if (!this.stage.ok) {
        $('stage-wrap').classList.add('no-webgl');
      } else {
        this.stage.onFirstInteract = () => $('stage-hint').classList.add('gone');
        setTimeout(() => $('stage-hint').classList.add('gone'), 7000);
      }

      this.initUI();
      this.loadBackendData();
    }

    isApiConfigured() {
      return !!CONFIG.API_BASE_URL && CONFIG.API_BASE_URL.indexOf(CONFIG.API_PLACEHOLDER_MARK) === -1;
    }

    isAnyModalOpen() {
      return !!document.querySelector('.modal-overlay.open');
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
        this.products = FALLBACK_PRODUCTS;
        this.categories = FALLBACK_CATEGORIES;
        this.settings = FALLBACK_SETTINGS;
        this.showToast(this.isApiConfigured()
          ? 'Chưa kết nối được thực đơn trực tuyến, đang hiển thị thực đơn mẫu'
          : 'Đang chạy chế độ Demo');
      }

      // Sắp xếp theo sort_order
      this.products = this.products.slice().sort((a, b) => (Number(a.sort_order) || 999) - (Number(b.sort_order) || 999));
      this.categories = this.categories.slice().sort((a, b) => (Number(a.sort_order) || 999) - (Number(b.sort_order) || 999));

      this.reconcileCart();
      this.applySettings();
      this.renderRail();
      this.renderCatalogTabs();
      this.renderCatalogProducts(null);
      this.updateCartUI();
      if (this.products.length) {
        this.selectProduct(0);
      } else {
        $('p-name').textContent = 'Thực đơn đang được cập nhật';
      }
    }

    // Đồng bộ giá / món trong giỏ cũ với dữ liệu mới nhất
    reconcileCart() {
      this.cart = this.cart.map((item) => {
        const fresh = this.products.find((p) => String(p.id) === String(item.product && item.product.id));
        return fresh ? { product: fresh, quantity: Math.max(1, parseInt(item.quantity, 10) || 1) } : null;
      }).filter(Boolean);
      this.saveCart();
    }

    // Đổ thông tin thương hiệu, liên hệ và link app giao hàng
    applySettings() {
      const s = this.settings;
      const brand = s.brand_name || 'PETIT FOUR';
      const sub = s.brand_subtitle || 'Artisan Bakery';
      document.querySelectorAll('[data-brand]').forEach((el) => { el.textContent = brand; });
      document.querySelectorAll('[data-brand-sub]').forEach((el) => { el.textContent = sub; });
      document.title = `${brand} — ${sub}`;

      // Liên hệ
      const phone = String(s.store_phone || '').trim();
      const tel = phone.replace(/[^\d+]/g, '');
      const phoneLink = tel ? `tel:${tel}` : '#contact';
      ['ct-phone', 'ct-phone-text', 'bar-call'].forEach((id) => {
        const el = $(id);
        if (el) el.setAttribute('href', phoneLink);
      });
      $('ct-phone-text').textContent = phone || 'Chưa cập nhật';
      if (!tel) $('ct-phone').classList.add('hidden');

      $('ct-address').textContent = s.store_address || 'Đang cập nhật';
      $('ct-hours').textContent = s.store_open_hours || 'Đang cập nhật';
      const mapLink = $('ct-map');
      if (s.store_address) {
        mapLink.href = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(s.store_address);
      } else {
        mapLink.style.display = 'none';
      }

      [['ct-zalo', 'zalo_url'], ['ct-facebook', 'facebook_url'], ['ct-instagram', 'instagram_url']].forEach((pair) => {
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
      const row = $('checkout-delivery');
      row.innerHTML = DELIVERY_APPS.map((app) => {
        const url = s[app.key];
        return isSafeUrl(url)
          ? `<a class="alt-chip ${app.cls}" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${app.label}</a>`
          : `<span class="alt-chip disabled">${app.label} (sắp có)</span>`;
      }).join('');

      // Cập nhật nhãn giao hàng theo phí cấu hình
      const fee = Number(s.shipping_fee_default) || 25000;
      const opt = $('cust-delivery-method').querySelector('option[value="delivery"]');
      if (opt) opt.textContent = `Giao tận nơi (+${fee.toLocaleString('vi-VN')} đ)`;
    }

    // --- CHỌN MÓN TRÊN SÂN KHẤU 3D ---
    selectProduct(index) {
      if (!this.products.length) return;
      const n = this.products.length;
      this.selectedIndex = ((index % n) + n) % n;
      const p = this.products[this.selectedIndex];
      this.activeQuantity = 1;

      const catObj = this.categories.find((c) => c.id === p.category);
      $('p-category').textContent = catObj ? catObj.name : 'Artisan';
      $('p-name').textContent = p.name;
      $('p-price').textContent = fmt(p.price);
      $('p-desc').textContent = p.description || 'Hương vị hảo hạng được chăm chút bởi thợ bánh của tiệm.';
      $('p-flavor').textContent = p.flavor || 'Thơm béo, ngọt dịu thanh tao';
      $('p-ingredients').textContent = p.ingredients || 'Nguyên liệu nhập khẩu chất lượng cao';
      $('p-weight').textContent = p.weight || 'Tiêu chuẩn';
      $('p-counter').textContent = `${this.selectedIndex + 1} / ${n}`;
      this.updateDetailQty();

      // Chữ mờ phía sau mô hình
      const ghost = $('stage-ghost');
      ghost.classList.add('swap');
      setTimeout(() => {
        ghost.textContent = String(p.name).split(' ').slice(0, 2).join(' ');
        ghost.classList.remove('swap');
      }, 140);

      const type = resolveModelType(p);
      $('stage-wrap').style.setProperty('--tint', MODEL_TINTS[type] || '#F6DCE2');
      $('stage-wrap').style.backgroundColor = MODEL_TINTS[type] || '#F6DCE2';
      const fb = $('stage-fallback-img');
      fb.src = p.image_url || '';
      fb.alt = p.name;
      if (this.stage.ok) this.stage.setModel(type);

      // Đánh dấu thumbnail đang chọn
      document.querySelectorAll('.thumb').forEach((t, i) => {
        const active = i === this.selectedIndex;
        t.classList.toggle('active', active);
        t.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      const activeThumb = document.querySelectorAll('.thumb')[this.selectedIndex];
      const rail = $('rail');
      if (activeThumb && rail) {
        const left = activeThumb.offsetLeft - (rail.clientWidth - activeThumb.clientWidth) / 2;
        rail.scrollTo({ left: Math.max(0, left), behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      }
    }

    renderRail() {
      const rail = $('rail');
      rail.innerHTML = this.products.map((p, i) => `
        <button class="thumb" role="option" aria-selected="false" data-index="${i}" title="${esc(p.name)}">
          <img src="${esc(p.image_url || '')}" alt="" loading="lazy" width="72" height="72">
          <span>${esc(p.name)}</span>
        </button>
      `).join('');
    }

    updateDetailQty() {
      const p = this.products[this.selectedIndex];
      $('qty-count').textContent = this.activeQuantity;
      const total = (Number(p ? p.price : 0) || 0) * this.activeQuantity;
      $('detail-btn-price').textContent = fmt(total);
    }

    // --- UI CONTROLS ---
    initUI() {
      // Thanh điều hướng 3D
      $('btn-prev').addEventListener('click', () => this.selectProduct(this.selectedIndex - 1));
      $('btn-next').addEventListener('click', () => this.selectProduct(this.selectedIndex + 1));
      $('btn-zoom-in').addEventListener('click', () => this.stage.ok && this.stage.setZoom(-0.12));
      $('btn-zoom-out').addEventListener('click', () => this.stage.ok && this.stage.setZoom(0.12));
      $('rail').addEventListener('click', (e) => {
        const btn = e.target.closest('.thumb');
        if (btn) this.selectProduct(Number(btn.dataset.index));
      });

      // Bàn phím: mũi tên đổi món khi không đang nhập liệu / mở hộp thoại
      window.addEventListener('keydown', (e) => {
        if (this.isAnyModalOpen()) {
          if (e.key === 'Escape') this.closeTopModal();
          return;
        }
        const tag = (e.target && e.target.tagName) || '';
        if (/INPUT|SELECT|TEXTAREA/.test(tag) || e.shiftKey) return;
        if (e.key === 'ArrowLeft') this.selectProduct(this.selectedIndex - 1);
        if (e.key === 'ArrowRight') this.selectProduct(this.selectedIndex + 1);
      });

      // Số lượng + thêm giỏ
      $('qty-minus').addEventListener('click', () => {
        if (this.activeQuantity > 1) {
          this.activeQuantity--;
          this.updateDetailQty();
        }
      });
      $('qty-plus').addEventListener('click', () => {
        if (this.activeQuantity < 99) {
          this.activeQuantity++;
          this.updateDetailQty();
        }
      });
      $('btn-add-to-cart').addEventListener('click', () => {
        const p = this.products[this.selectedIndex];
        if (!p) return;
        this.addToCart(p, this.activeQuantity);
        this.sound.playChime();
        this.showToast(`Đã thêm ${this.activeQuantity} × ${p.name} vào giỏ`);
        this.activeQuantity = 1;
        this.updateDetailQty();
      });

      // Header
      $('btn-open-cart').addEventListener('click', () => this.openCheckoutModal());
      $('bar-cart').addEventListener('click', () => this.openCheckoutModal());
      $('btn-toggle-sound').addEventListener('click', () => {
        const on = this.sound.toggle();
        $('btn-toggle-sound').setAttribute('aria-pressed', on ? 'true' : 'false');
        if (on) this.sound.playDoorBell();
        this.showToast(on ? 'Đã bật âm thanh' : 'Đã tắt âm thanh');
      });
      const header = $('site-header');
      const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();

      // Menu: xem 3D / thêm giỏ (ủy quyền sự kiện)
      $('catalog-products-grid').addEventListener('click', (e) => {
        const btn = e.target.closest('[data-act]');
        if (!btn) return;
        const idx = this.products.findIndex((p) => String(p.id) === String(btn.dataset.id));
        if (idx < 0) return;
        if (btn.dataset.act === 'view') {
          this.selectProduct(idx);
          $('hero').scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
        } else if (btn.dataset.act === 'add') {
          const p = this.products[idx];
          this.addToCart(p, 1);
          this.sound.playChime();
          this.showToast(`Đã thêm 1 × ${p.name} vào giỏ`);
        }
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

      // Giỏ hàng: tăng giảm / xóa (ủy quyền sự kiện)
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
      const addressGrp = $('address-group');
      delivMethod.addEventListener('change', () => {
        addressGrp.style.display = (delivMethod.value === 'delivery') ? 'block' : 'none';
        this.renderCheckoutSummary();
      });

      // Gửi đơn
      $('checkout-form').addEventListener('submit', (e) => {
        e.preventDefault();
        this.submitOrder();
      });

      $('btn-back-to-bakery').addEventListener('click', () => this.closeModal('modal-success'));

      // Sao chép thông tin chuyển khoản
      document.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-copy]');
        if (!btn) return;
        const text = $(btn.dataset.copy).textContent.trim();
        this.copyText(text).then(() => this.showToast('Đã sao chép'));
      });
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

    // --- MENU ---
    renderCatalogTabs() {
      const container = $('catalog-category-tabs');
      if (!container) return;
      const tabs = [{ id: null, name: 'Tất cả' }].concat(this.categories);
      container.innerHTML = tabs.map((c) =>
        `<button class="tab${c.id === this.activeCat ? ' active' : ''}" role="tab" data-cat="${c.id === null ? '' : esc(c.id)}">${esc(c.name)}</button>`
      ).join('');
      container.querySelectorAll('.tab').forEach((btn) => {
        btn.addEventListener('click', () => {
          container.querySelectorAll('.tab').forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          this.activeCat = btn.dataset.cat || null;
          this.renderCatalogProducts(this.activeCat);
        });
      });
    }

    renderCatalogProducts(catId) {
      const grid = $('catalog-products-grid');
      if (!grid) return;
      const list = catId ? this.products.filter((p) => p.category === catId) : this.products;
      if (!list.length) {
        grid.innerHTML = '<p class="empty">Danh mục này chưa có món. Hãy chọn danh mục khác nhé.</p>';
        return;
      }
      grid.innerHTML = list.map((p) => {
        const featured = (p.is_featured === true || p.is_featured === 'TRUE' || p.is_featured === 1);
        return `
        <article class="m-card">
          <button class="m-img" data-act="view" data-id="${esc(p.id)}" aria-label="Xem ${esc(p.name)} dạng 3D">
            <img src="${esc(p.image_url || '')}" alt="${esc(p.name)}" loading="lazy">
            ${featured ? '<span class="m-badge">Bán chạy</span>' : ''}
          </button>
          <div class="m-body">
            <div class="m-name">${esc(p.name)}</div>
            <div class="m-flavor">${esc(p.flavor || p.description || '')}</div>
            <div class="m-foot">
              <span class="m-price">${fmt(p.price)}</span>
              <span class="m-actions">
                <button class="m-view" data-act="view" data-id="${esc(p.id)}">Xem 3D</button>
                <button class="m-add" data-act="add" data-id="${esc(p.id)}" aria-label="Thêm ${esc(p.name)} vào giỏ">+</button>
              </span>
            </div>
          </div>
        </article>`;
      }).join('');
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
        container.innerHTML = '<p class="cart-empty">Giỏ hàng đang trống. Chọn một chiếc bánh ở màn hình 3D rồi bấm “Thêm vào giỏ” nhé.</p>';
        return;
      }
      container.innerHTML = this.cart.map((item, idx) => `
        <div class="cart-item">
          <img src="${esc(item.product.image_url || '')}" alt="">
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

    calcTotals() {
      const subtotal = this.cart.reduce((acc, i) => acc + (Number(i.product.price) || 0) * i.quantity, 0);
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

        if (this.isApiConfigured()) {
          // Gửi POST tới Apps Script Web App (text/plain để tránh preflight CORS)
          const resp = await this.fetchWithTimeout(CONFIG.API_BASE_URL, {
            method: 'POST',
            body: JSON.stringify(orderPayload),
            headers: { 'Content-Type': 'text/plain;charset=utf-8' }
          });
          if (!resp.ok) throw new Error('HTTP ' + resp.status);
          orderResult = await resp.json();
        } else {
          // Chế độ demo: chỉ khi CHƯA cấu hình API thật
          const t = this.calcTotals();
          orderResult = {
            success: true,
            order: {
              order_id: 'PF-DEMO-' + Math.floor(1000 + Math.random() * 9000),
              total: t.total,
              payment_method: payment
            }
          };
        }

        if (orderResult && orderResult.success) {
          this.closeModal('modal-checkout');
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
      $('success-order-id').textContent = order.order_id;
      $('success-total-val').textContent = fmt(order.total);
      $('success-transfer-memo').textContent = order.order_id;
      $('cod-total').textContent = fmt(order.total);

      const isCod = order.payment_method === 'cod';
      $('transfer-instruction-box').style.display = isCod ? 'none' : 'block';
      $('cod-note').style.display = isCod ? 'block' : 'none';

      const acc = s.bank_account_number || '0011004567890';
      const holder = s.bank_account_holder || 'PETIT FOUR';
      $('success-bank-name').textContent = s.bank_name || 'Vietcombank';
      $('success-bank-acc').textContent = acc;
      $('success-bank-holder').textContent = holder;

      // Có bank_code -> tạo VietQR đúng số tiền và nội dung; nếu không dùng ảnh QR tĩnh
      const qrImg = $('success-qr-img');
      qrImg.style.display = '';
      if (s.bank_code) {
        qrImg.src = `https://img.vietqr.io/image/${encodeURIComponent(s.bank_code)}-${encodeURIComponent(acc)}-compact2.png`
          + `?amount=${encodeURIComponent(Math.round(Number(order.total) || 0))}`
          + `&addInfo=${encodeURIComponent(order.order_id)}`
          + `&accountName=${encodeURIComponent(holder)}`;
        qrImg.onerror = () => {
          if (s.bank_qr_url && qrImg.src !== s.bank_qr_url) {
            qrImg.onerror = () => { qrImg.style.display = 'none'; };
            qrImg.src = s.bank_qr_url;
          } else {
            qrImg.style.display = 'none';
          }
        };
      } else {
        qrImg.onerror = () => { qrImg.style.display = 'none'; };
        qrImg.src = s.bank_qr_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80';
      }

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
        localStorage.setItem('petit_four_cart', JSON.stringify(this.cart));
      } catch (e) {}
    }

    loadCart() {
      try {
        const saved = localStorage.getItem('petit_four_cart');
        const parsed = saved ? JSON.parse(saved) : [];
        return Array.isArray(parsed) ? parsed.filter((i) => i && i.product && i.product.id != null) : [];
      } catch (e) {
        return [];
      }
    }

    updateCartUI() {
      const count = this.cart.reduce((acc, i) => acc + i.quantity, 0);
      ['cart-counter', 'bar-cart-counter'].forEach((id) => {
        const badge = $(id);
        if (badge) badge.textContent = count;
      });
      const barBadge = $('bar-cart-counter');
      if (barBadge) barBadge.style.display = count > 0 ? 'inline-flex' : 'none';
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
      if (!this.isAnyModalOpen()) {
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
