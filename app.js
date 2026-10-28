/**
 * ============================================================================
 * PETIT FOUR — ARTISAN BAKERY INTERACTIVE 3D APP
 * ============================================================================
 * Tác giả: Senior Full-Stack / Three.js Engineer
 * Công nghệ: Three.js r128, Web Audio API, Vanilla ES6+, Google Sheets Backend
 * ============================================================================
 */

(function () {
  'use strict';

  // --- CẤU HÌNH HỆ THỐNG ---
  const CONFIG = {
    // Dán URL Web App triển khai từ Google Apps Script (đuôi /exec) vào đây:
    API_BASE_URL: 'https://script.google.com/macros/s/AKfycbw8D_zJ66eeD0JDTDVYXPnW3pEoRGKS5RTSmVIX_u28ACkTUB3RDX4XKShlPJSvickJ/exec',
    USE_DEMO_FALLBACK: true,
    ENABLE_SOUND: true,
    MOUSE_SENSITIVITY: 0.0022,
    MOVE_SPEED: 0.1,
    COLLISION_RADIUS: 0.45
  };

  // --- DỮ LIỆU DEMO DỰ PHÒNG CHẤT LƯỢNG CAO ---
  const FALLBACK_CATEGORIES = [
    { id: 'cat_signature', name: 'Signature Cakes' },
    { id: 'cat_pastry', name: 'Croissant & Pastry' },
    { id: 'cat_bread', name: 'Artisan Bread' },
    { id: 'cat_cookies', name: 'Macaron & Tart' },
    { id: 'cat_drinks', name: 'Specialty Drinks' }
  ];

  const FALLBACK_PRODUCTS = [
    {
      id: 'prod_01',
      name: 'Butter Croissant Cổ Điển',
      category: 'cat_pastry',
      price: 45000,
      description: 'Bánh sừng bò truyền thống với hàng trăm lớp bơ Pháp thơm lừng giòn rụm.',
      ingredients: 'Bơ lạt Pháp Elle & Vire, Bột mì T55, Men tươi',
      flavor: 'Thơm bơ béo nhẹ, vỏ giòn ruột xốp',
      weight: '85g',
      image_url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80',
      model_type: 'croissant'
    },
    {
      id: 'prod_02',
      name: 'Almond Croissant Nướng Giòn',
      category: 'cat_pastry',
      price: 65000,
      description: 'Croissant ngập kem hạnh nhân frangipane, rắc hạnh nhân lát nướng thơm.',
      ingredients: 'Bột hạnh nhân Mỹ, Trứng gà tươi, Bơ Pháp, Rượu rum',
      flavor: 'Ngọt dịu, bùi béo hạnh nhân',
      weight: '120g',
      image_url: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=800&q=80',
      model_type: 'croissant'
    },
    {
      id: 'prod_04',
      name: 'Strawberry Shortcake Nhật Bản',
      category: 'cat_signature',
      price: 85000,
      description: 'Cốt chiffon mịn mượt như mây kết hợp kem tươi Hokkaido và dâu tây ngọt mát.',
      ingredients: 'Dâu tây Đà Lạt, Kem sữa Hokkaido, Trứng tươi',
      flavor: 'Chua ngọt thanh tao, kem mát mịn',
      weight: '140g',
      image_url: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=80',
      model_type: 'strawberry_cake'
    },
    {
      id: 'prod_05',
      name: 'Bánh Kem Chocolate Truffle',
      category: 'cat_signature',
      price: 90000,
      description: 'Cốt bánh ẩm mọng socola Bỉ phủ lớp kem ganache bóng mượt sánh mịn.',
      ingredients: 'Chocolate Bỉ 70%, Bột ca cao nguyên chất, Bơ Pháp',
      flavor: 'Đậm vị ca cao, ngọt vừa sâu lắng',
      weight: '150g',
      image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
      model_type: 'chocolate_cake'
    },
    {
      id: 'prod_07',
      name: 'Éclair Chocolate Hạt Phỉ',
      category: 'cat_pastry',
      price: 58000,
      description: 'Bánh vỏ choux dài giòn nhẹ với nhân kem custard socola praline bùi béo.',
      ingredients: 'Vỏ choux bơ tươi, Kem custard hạt phỉ, Socola glaze',
      flavor: 'Bùi béo giòn nhẹ bùng nổ hương vị',
      weight: '90g',
      image_url: 'https://images.unsplash.com/photo-1612203985729-70726954388c?auto=format&fit=crop&w=800&q=80',
      model_type: 'eclair'
    },
    {
      id: 'prod_09',
      name: 'Tart Trái Cây Tươi Mùa Hạ',
      category: 'cat_cookies',
      price: 75000,
      description: 'Đế tart bơ giòn rụm ngập kem vani Madagascar và quả mọng nhiệt đới.',
      ingredients: 'Vani Madagascar, Quả mâm xôi, Việt quất, Bột hạnh nhân',
      flavor: 'Vỏ giòn béo, hoa quả chua mọng thanh thoát',
      weight: '110g',
      image_url: 'https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=800&q=80',
      model_type: 'tart'
    },
    {
      id: 'prod_11',
      name: 'Bánh Mì Sourdough Men Rừng',
      category: 'cat_bread',
      price: 70000,
      description: 'Ổ bánh men tự nhiên ủ chậm 36h, vỏ giòn lò nướng đá, ruột ẩm dai mềm.',
      ingredients: 'Bột mì nguyên cám hữu cơ, Men mẹ tự nhiên 6 năm tuổi',
      flavor: 'Chua nhẹ hậu vị ngọt lúa mì',
      weight: '500g',
      image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
      model_type: 'bread'
    },
    {
      id: 'prod_14',
      name: 'Donut Chocolate Caramel Muối',
      category: 'cat_pastry',
      price: 38000,
      description: 'Bánh vòng chiên vàng bông xốp phủ chocolate đen và sốt caramel mặn.',
      ingredients: 'Bột mì mềm, Socola đen phủ, Muối biển Fleur de Sel',
      flavor: 'Mặn ngọt hòa quyện, cốt bánh mềm mại',
      weight: '80g',
      image_url: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=800&q=80',
      model_type: 'donut'
    },
    {
      id: 'prod_16',
      name: 'Cupcake Hồng Nhung Red Velvet',
      category: 'cat_pastry',
      price: 48000,
      description: 'Cốt bánh đỏ nhung bí ẩn kết hợp kem phô mai Cream Cheese béo ngậy.',
      ingredients: 'Cream cheese Anchor, Bột cacao, Giấm táo',
      flavor: 'Chua béo phô mai cân bằng cốt bánh ẩm',
      weight: '100g',
      image_url: 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&w=800&q=80',
      model_type: 'cupcake'
    },
    {
      id: 'prod_18',
      name: 'Hộp Macaron Tinh Hoa (6 Vị)',
      category: 'cat_cookies',
      price: 160000,
      description: 'Set 6 chiếc macaron giòn rỗng vỏ: Vani, Matcha, Phúc bồn tử, Socola, Hạt dẻ.',
      ingredients: 'Bột hạnh nhân Pháp, Trứng gà sạch, Ganache hoa quả',
      flavor: 'Vỏ giòn tan lập tức tan chảy cùng nhân',
      weight: '150g',
      image_url: 'https://images.unsplash.com/photo-1569864321390-38435d67e6b7?auto=format&fit=crop&w=800&q=80',
      model_type: 'macaron'
    }
  ];

  const FALLBACK_SETTINGS = {
    brand_name: 'PETIT FOUR',
    brand_subtitle: 'Artisan Bakery & Tea House',
    currency: 'VND',
    shipping_fee_default: '25000',
    bank_name: 'Vietcombank - CN Hoàn Kiếm',
    bank_account_number: '0011004567890',
    bank_account_holder: 'PETIT FOUR ARTISAN BAKERY',
    bank_qr_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80'
  };

  // --- AUDIO SYNTHESIZER (Web Audio API - Không cần file ngoài) ---
  class SoundManager {
    constructor() {
      this.ctx = null;
      this.enabled = true;
    }
    init() {
      if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      }
    }
    playDoorBell() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      // Ting... Tong...
      this.createBeep(880, now, 0.4);
      this.createBeep(587.33, now + 0.25, 0.6);
    }
    playChime() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      this.createBeep(523.25, now, 0.15); // C5
      this.createBeep(659.25, now + 0.08, 0.2); // E5
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

  // --- HỆ THỐNG DỰNG BÁNH PROCEDURAL 3D MỸ THUẬT CAO ---
  class BakeryMeshBuilder {
    static getPastryMaterial(color, roughness = 0.5) {
      return new THREE.MeshStandardMaterial({
        color: color,
        roughness: roughness,
        metalness: 0.05
      });
    }

    // 1. Croissant thân cong nhiều lớp nướng
    static createCroissant() {
      const group = new THREE.Group();
      const crustMat = this.getPastryMaterial(0xC68642, 0.45);
      const centerTorus = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.11, 10, 24, Math.PI), crustMat);
      centerTorus.rotation.x = Math.PI / 2;
      group.add(centerTorus);

      const tipMat = this.getPastryMaterial(0xA0652D, 0.5);
      const leftTip = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.24, 8), tipMat);
      leftTip.position.set(-0.25, 0, 0.06);
      leftTip.rotation.z = Math.PI / 2.6;
      group.add(leftTip);

      const rightTip = leftTip.clone();
      rightTip.position.set(0.25, 0, 0.06);
      rightTip.rotation.z = -Math.PI / 2.6;
      group.add(rightTip);

      group.scale.set(1.2, 0.9, 1.2);
      return group;
    }

    // 2. Donut tráng men glaze dâu & rắc cốm
    static createDonut() {
      const group = new THREE.Group();
      const doughMat = this.getPastryMaterial(0xE5B887, 0.6);
      const dough = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.12, 14, 28), doughMat);
      dough.rotation.x = Math.PI / 2;
      group.add(dough);

      const glazeMat = new THREE.MeshStandardMaterial({
        color: 0xDE5D83, // Glaze dâu hồng
        roughness: 0.15,
        metalness: 0.1
      });
      const glaze = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.125, 14, 28, Math.PI * 1.8), glazeMat);
      glaze.rotation.x = Math.PI / 2;
      glaze.position.y = 0.015;
      group.add(glaze);

      return group;
    }

    // 3. Cupcake với xoắn kem ngọt ngào
    static createCupcake() {
      const group = new THREE.Group();
      // Đế ly giấy
      const cupMat = this.getPastryMaterial(0x8D5B4C, 0.8);
      const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.13, 0.2, 16), cupMat);
      group.add(cup);

      // Kem xoắn 3 tầng
      const creamMat = new THREE.MeshStandardMaterial({ color: 0xFDFBF7, roughness: 0.3 });
      const l1 = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.21, 0.08, 16), creamMat);
      l1.position.y = 0.12;
      const l2 = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 0.08, 14), creamMat);
      l2.position.y = 0.18;
      const l3 = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.12, 12), creamMat);
      l3.position.y = 0.26;
      group.add(l1, l2, l3);

      // Quả cherry đỏ trên đỉnh
      const cherryMat = new THREE.MeshStandardMaterial({ color: 0xB31B1B, roughness: 0.1 });
      const cherry = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 12), cherryMat);
      cherry.position.y = 0.33;
      group.add(cherry);

      return group;
    }

    // 4. Strawberry Shortcake lát bánh kem dâu
    static createStrawberryCake() {
      const group = new THREE.Group();
      const spongeMat = this.getPastryMaterial(0xF7E4B2, 0.6); // Chiffon vàng nhạt
      const creamMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.2 });

      // Cốt bánh 3 tầng
      const s1 = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.08, 0.36), spongeMat);
      const c1 = new THREE.Mesh(new THREE.BoxGeometry(0.37, 0.04, 0.37), creamMat);
      c1.position.y = 0.06;
      const s2 = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.08, 0.36), spongeMat);
      s2.position.y = 0.12;
      const c2 = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.05, 0.38), creamMat);
      c2.position.y = 0.18;
      group.add(s1, c1, s2, c2);

      // Quả dâu tây trang trí
      const strawMat = new THREE.MeshStandardMaterial({ color: 0xDC2626, roughness: 0.2 });
      const strawberry = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.11, 10), strawMat);
      strawberry.position.set(0, 0.26, 0);
      group.add(strawberry);

      return group;
    }

    // 5. Chocolate Cake lát bánh truffle nhiều tầng
    static createChocolateCake() {
      const group = new THREE.Group();
      const chocoSponge = this.getPastryMaterial(0x382017, 0.7);
      const chocoCream = new THREE.MeshStandardMaterial({ color: 0x22110B, roughness: 0.2, metalness: 0.1 });

      const s1 = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.1, 0.38), chocoSponge);
      const c1 = new THREE.Mesh(new THREE.BoxGeometry(0.39, 0.04, 0.39), chocoCream);
      c1.position.y = 0.07;
      const s2 = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.1, 0.38), chocoSponge);
      s2.position.y = 0.14;
      const glaze = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.03, 0.4), chocoCream);
      glaze.position.y = 0.2;
      group.add(s1, c1, s2, glaze);

      return group;
    }

    // 6. Macaron hai vỏ tròn kẹp nhân
    static createMacaron() {
      const group = new THREE.Group();
      const shellMat = new THREE.MeshStandardMaterial({ color: 0x85BB65, roughness: 0.35 }); // Matcha
      const fillingMat = new THREE.MeshStandardMaterial({ color: 0x382017, roughness: 0.2 });

      const topShell = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.17, 0.06, 20), shellMat);
      topShell.position.y = 0.05;
      const botShell = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.18, 0.06, 20), shellMat);
      botShell.position.y = -0.05;
      const filling = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.04, 20), fillingMat);

      group.add(topShell, filling, botShell);
      group.scale.set(1, 1, 1);
      return group;
    }

    // 7. Bánh mì Sourdough / Loaf nướng nâu bóng
    static createBreadLoaf() {
      const group = new THREE.Group();
      const crustMat = this.getPastryMaterial(0x8B4513, 0.7);
      const bread = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.14, 0.48, 14), crustMat);
      bread.rotation.z = Math.PI / 2;
      bread.scale.set(1, 0.75, 1);
      group.add(bread);
      return group;
    }

    // 8. Éclair thon dài phủ socola
    static createEclair() {
      const group = new THREE.Group();
      const doughMat = this.getPastryMaterial(0xD29A5B, 0.5);
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.44, 12), doughMat);
      base.rotation.z = Math.PI / 2;
      group.add(base);

      const glazeMat = new THREE.MeshStandardMaterial({ color: 0x2A1810, roughness: 0.15 });
      const glaze = new THREE.Mesh(new THREE.CylinderGeometry(0.092, 0.092, 0.38, 12, 1, false, 0, Math.PI), glazeMat);
      glaze.rotation.z = Math.PI / 2;
      glaze.rotation.x = -Math.PI / 2;
      glaze.position.y = 0.01;
      group.add(glaze);
      return group;
    }

    // 9. Tart hoa quả
    static createTart() {
      const group = new THREE.Group();
      const crustMat = this.getPastryMaterial(0xC68642, 0.6);
      const crust = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.19, 0.08, 20), crustMat);
      group.add(crust);

      const fillingMat = new THREE.MeshStandardMaterial({ color: 0xFDEE87, roughness: 0.2 });
      const filling = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.21, 0.03, 18), fillingMat);
      filling.position.y = 0.04;
      group.add(filling);

      const berryMat = new THREE.MeshStandardMaterial({ color: 0x7E1946, roughness: 0.2 });
      for (let i = 0; i < 5; i++) {
        const ang = (i / 5) * Math.PI * 2;
        const berry = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), berryMat);
        berry.position.set(Math.cos(ang) * 0.11, 0.07, Math.sin(ang) * 0.11);
        group.add(berry);
      }
      return group;
    }

    // Phương thức Factory tạo bánh theo model_type
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
        default: pastry = this.createCroissant();
      }

      // Đặt bánh lên đĩa sứ ceramic sang trọng
      const plateGroup = new THREE.Group();
      const plateMat = new THREE.MeshStandardMaterial({ color: 0xFAF8F5, roughness: 0.2, metalness: 0.05 });
      const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.26, 0.025, 24), plateMat);
      plate.position.y = -0.012;
      plate.receiveShadow = true;
      plateGroup.add(plate);

      plateGroup.add(pastry);
      return plateGroup;
    }
  }

  // --- QUẢN LÝ KHÔNG GIAN 3D CỬA HÀNG (BakeryWorld) ---
  class BakeryWorld {
    constructor(scene) {
      this.scene = scene;
      this.colliders = []; // Mảng hộp va chạm vật lý
      this.interactiveObjects = []; // Mảng đối tượng có thể raycast tương tác
      this.buildArchitecture();
      this.buildFurniture();
      this.buildLighting();
    }

    buildArchitecture() {
      // 1. Sàn gỗ sồi sáng ấm (Oak wood warm floor)
      const floorGeo = new THREE.PlaneGeometry(16, 20);
      const floorMat = new THREE.MeshStandardMaterial({
        color: 0xDAC0A3,
        roughness: 0.4,
        metalness: 0.02
      });
      const floor = new THREE.Mesh(floorGeo, floorMat);
      floor.rotation.x = -Math.PI / 2;
      floor.receiveShadow = true;
      this.scene.add(floor);

      // 2. Trần tiệm thạch cao kem trắng
      const ceilingGeo = new THREE.PlaneGeometry(16, 20);
      const ceilingMat = new THREE.MeshStandardMaterial({ color: 0xF7F4ED, roughness: 0.9 });
      const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
      ceiling.position.y = 4.2;
      ceiling.rotation.x = Math.PI / 2;
      this.scene.add(ceiling);

      // 3. Tường xung quanh
      const wallMat = new THREE.MeshStandardMaterial({ color: 0xF4ECE1, roughness: 0.8 });
      const woodTrimMat = new THREE.MeshStandardMaterial({ color: 0x5C382A, roughness: 0.4 });

      // Tường sau (Back Wall)
      const backWall = new THREE.Mesh(new THREE.BoxGeometry(16, 4.2, 0.4), wallMat);
      backWall.position.set(0, 2.1, -10);
      backWall.receiveShadow = true;
      this.scene.add(backWall);
      this.addCollider(backWall);

      // Tường trái & Tường phải
      const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.4, 4.2, 20), wallMat);
      leftWall.position.set(-8, 2.1, 0);
      this.scene.add(leftWall);
      this.addCollider(leftWall);

      const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.4, 4.2, 20), wallMat);
      rightWall.position.set(8, 2.1, 0);
      this.scene.add(rightWall);
      this.addCollider(rightWall);

      // Tường trước có vách kính nhìn ra phố Paris
      const frontLeft = new THREE.Mesh(new THREE.BoxGeometry(5.5, 4.2, 0.4), wallMat);
      frontLeft.position.set(-5.25, 2.1, 10);
      const frontRight = new THREE.Mesh(new THREE.BoxGeometry(5.5, 4.2, 0.4), wallMat);
      frontRight.position.set(5.25, 2.1, 10);
      this.scene.add(frontLeft, frontRight);
      this.addCollider(frontLeft);
      this.addCollider(frontRight);

      // Cửa kính lớn phía trước
      const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0xE8F1F5,
        transparent: true,
        opacity: 0.35,
        roughness: 0.1,
        transmission: 0.8
      });
      const frontGlass = new THREE.Mesh(new THREE.BoxGeometry(5, 3.8, 0.1), glassMat);
      frontGlass.position.set(0, 1.9, 10);
      this.scene.add(frontGlass);
      this.addCollider(frontGlass);

      // Phào chỉ chân tường gỗ sang trọng
      const baseboard = new THREE.Mesh(new THREE.BoxGeometry(15.8, 0.25, 0.05), woodTrimMat);
      baseboard.position.set(0, 0.125, -9.78);
      this.scene.add(baseboard);
    }

    buildFurniture() {
      const woodMat = new THREE.MeshStandardMaterial({ color: 0x4A2E25, roughness: 0.4 });
      const marbleMat = new THREE.MeshStandardMaterial({ color: 0xFDFBF7, roughness: 0.25 });
      const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0xFFFFFF,
        transparent: true,
        opacity: 0.4,
        roughness: 0.1
      });

      // --- TỦ BÁNH KÍNH TRUNG TÂM (L-Shape hoặc Dãy dài) ---
      const displayBase = new THREE.Mesh(new THREE.BoxGeometry(7.0, 0.9, 1.4), woodMat);
      displayBase.position.set(0, 0.45, -2);
      displayBase.castShadow = true;
      displayBase.receiveShadow = true;
      this.scene.add(displayBase);
      this.addCollider(displayBase);

      const glassCase = new THREE.Mesh(new THREE.BoxGeometry(6.9, 0.75, 1.35), glassMat);
      glassCase.position.set(0, 1.28, -2);
      this.scene.add(glassCase);

      // Đèn LED chiếu ấm bên trong tủ kính
      const caseLight = new THREE.PointLight(0xFFE5B4, 1.2, 5);
      caseLight.position.set(0, 1.4, -2);
      this.scene.add(caseLight);

      // --- QUẦY THU NGÂN (Cashier Counter bên phải) ---
      const cashier = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.1, 1.2), woodMat);
      cashier.position.set(5.5, 0.55, -2.5);
      cashier.castShadow = true;
      this.scene.add(cashier);
      this.addCollider(cashier);

      const cashierTop = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.08, 1.3), marbleMat);
      cashierTop.position.set(5.5, 1.14, -2.5);
      this.scene.add(cashierTop);

      // Máy POS / Tablet trên quầy thu ngân
      const posBase = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.05, 0.25), new THREE.MeshStandardMaterial({ color: 0x222 }));
      posBase.position.set(5.2, 1.2, -2.5);
      const posScreen = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.22, 0.02), new THREE.MeshStandardMaterial({ color: 0x111 }));
      posScreen.position.set(5.2, 1.32, -2.44);
      posScreen.rotation.x = -Math.PI / 6;
      posScreen.userData = { isCashierTrigger: true };
      this.scene.add(posBase, posScreen);
      this.interactiveObjects.push(posScreen);

      // Biển QR để bàn thanh toán
      const qrStand = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.24, 0.04), new THREE.MeshStandardMaterial({ color: 0xFFFFFF }));
      qrStand.position.set(6.0, 1.28, -2.4);
      qrStand.rotation.y = -Math.PI / 7;
      qrStand.userData = { isCashierTrigger: true };
      this.scene.add(qrStand);
      this.interactiveObjects.push(qrStand);

      // --- BẢNG MENU GIÁ TREO TƯỜNG (Menu Board) ---
      const menuBoardGeo = new THREE.BoxGeometry(4.2, 1.8, 0.08);
      const menuBoardMat = new THREE.MeshStandardMaterial({ color: 0x241611, roughness: 0.6 });
      const menuBoard = new THREE.Mesh(menuBoardGeo, menuBoardMat);
      menuBoard.position.set(0, 2.6, -9.75);
      menuBoard.userData = { isMenuTrigger: true };
      this.scene.add(menuBoard);
      this.interactiveObjects.push(menuBoard);

      // Đèn rọi menu
      const menuSpot = new THREE.SpotLight(0xFFE0B2, 1.5, 8, Math.PI / 4, 0.3);
      menuSpot.position.set(0, 3.8, -8);
      menuSpot.target = menuBoard;
      this.scene.add(menuSpot);

      // --- KỆ BÁNH MÌ GỖ SÁT TƯỜNG TRÁI ---
      const shelf = new THREE.Mesh(new THREE.BoxGeometry(1.0, 3.0, 5.0), woodMat);
      shelf.position.set(-7.3, 1.5, -4);
      shelf.castShadow = true;
      this.scene.add(shelf);
      this.addCollider(shelf);

      // --- KHU VỰC BÀN CAFE THƯ GIÃN (Bên phải gần cửa sổ) ---
      this.buildCoffeeTable(4.8, 4.5);
      this.buildCoffeeTable(-4.8, 4.5);

      // --- CÂY XANH TRANG TRÍ BOUTIQUE ---
      this.buildPlant(-6.8, 0, 7.5);
      this.buildPlant(6.8, 0, 7.5);
    }

    buildCoffeeTable(x, z) {
      const woodMat = new THREE.MeshStandardMaterial({ color: 0x4A2E25, roughness: 0.4 });
      const legGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.72, 8);
      const legMat = new THREE.MeshStandardMaterial({ color: 0x1A1A1A, metalness: 0.8 });

      // Mặt bàn tròn
      const top = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.04, 24), woodMat);
      top.position.set(x, 0.74, z);
      top.castShadow = true;
      this.scene.add(top);
      this.addCollider(top);

      // Chân bàn
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(x, 0.36, z);
      this.scene.add(leg);

      // 2 Ghế tựa hai bên
      [-0.75, 0.75].forEach(offset => {
        const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.04, 16), woodMat);
        seat.position.set(x + offset, 0.45, z);
        const seatLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.44, 8), legMat);
        seatLeg.position.set(x + offset, 0.22, z);
        this.scene.add(seat, seatLeg);
      });
    }

    buildPlant(x, y, z) {
      const potMat = new THREE.MeshStandardMaterial({ color: 0xD8C4B6, roughness: 0.5 });
      const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.22, 0.55, 16), potMat);
      pot.position.set(x, y + 0.275, z);
      pot.castShadow = true;
      this.scene.add(pot);
      this.addCollider(pot);

      // Tán lá xanh sage
      const leafMat = new THREE.MeshStandardMaterial({ color: 0x4F6F52, roughness: 0.7 });
      for (let i = 0; i < 4; i++) {
        const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 8), leafMat);
        leaf.position.set(x + (Math.random() - 0.5) * 0.25, y + 0.65 + i * 0.18, z + (Math.random() - 0.5) * 0.25);
        this.scene.add(leaf);
      }
    }

    buildLighting() {
      // Ánh sáng Ambient ấm dịu
      const ambientLight = new THREE.AmbientLight(0xFFF2E2, 0.65);
      this.scene.add(ambientLight);

      // Ánh sáng tự nhiên từ cửa sổ phía trước
      const sunLight = new THREE.DirectionalLight(0xFFF6EB, 0.9);
      sunLight.position.set(3, 8, 12);
      sunLight.castShadow = true;
      sunLight.shadow.mapSize.width = 1024;
      sunLight.shadow.mapSize.height = 1024;
      sunLight.shadow.bias = -0.001;
      this.scene.add(sunLight);

      // 4 Đèn trần thả ấm áp
      const ceilingLightsPos = [
        [-2.5, 3.4, -2],
        [2.5, 3.4, -2],
        [-3.0, 3.4, 4],
        [3.0, 3.4, 4]
      ];

      ceilingLightsPos.forEach(pos => {
        const pLight = new THREE.PointLight(0xFFD699, 0.8, 7);
        pLight.position.set(pos[0], pos[1], pos[2]);
        this.scene.add(pLight);

        // Chao đèn hình nón sang trọng
        const fixtureMat = new THREE.MeshStandardMaterial({ color: 0xB98252, metalness: 0.7, roughness: 0.2 });
        const shade = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.2, 16, 1, true), fixtureMat);
        shade.position.set(pos[0], pos[1] + 0.1, pos[2]);
        this.scene.add(shade);
      });
    }

    addCollider(mesh) {
      mesh.geometry.computeBoundingBox();
      const box = new THREE.Box3();
      box.setFromObject(mesh);
      this.colliders.push(box);
    }
  }

  // --- HỆ THỐNG DI CHUYỂN FIRST-PERSON & VA CHẠM (PlayerController) ---
  class PlayerController {
    constructor(camera, domElement, colliders) {
      this.camera = camera;
      this.domElement = domElement;
      this.colliders = colliders;

      this.camera.position.set(0, 1.65, 8.5); // Vị trí đứng ngay cửa ra vào
      this.camera.rotation.order = 'YXZ';

      this.keys = { forward: false, backward: false, left: false, right: false };
      this.euler = new THREE.Euler(0, 0, 0, 'YXZ');
      this.isLocked = false;
      this.joystickDelta = { x: 0, y: 0 };

      this.setupKeyboard();
      this.setupMouse();
    }

    setupKeyboard() {
      window.addEventListener('keydown', (e) => {
        switch (e.code) {
          case 'KeyW': case 'ArrowUp': this.keys.forward = true; break;
          case 'KeyS': case 'ArrowDown': this.keys.backward = true; break;
          case 'KeyA': case 'ArrowLeft': this.keys.left = true; break;
          case 'KeyD': case 'ArrowRight': this.keys.right = true; break;
        }
      });
      window.addEventListener('keyup', (e) => {
        switch (e.code) {
          case 'KeyW': case 'ArrowUp': this.keys.forward = false; break;
          case 'KeyS': case 'ArrowDown': this.keys.backward = false; break;
          case 'KeyA': case 'ArrowLeft': this.keys.left = false; break;
          case 'KeyD': case 'ArrowRight': this.keys.right = false; break;
        }
      });
    }

    setupMouse() {
      document.addEventListener('pointerlockchange', () => {
        this.isLocked = (document.pointerLockElement === this.domElement);
      });

      this.domElement.addEventListener('click', () => {
        if (!this.isLocked && !BakeryApp.isAnyModalOpen()) {
          this.domElement.requestPointerLock();
        }
      });

      window.addEventListener('mousemove', (e) => {
        if (!this.isLocked || BakeryApp.isAnyModalOpen()) return;
        const movementX = e.movementX || 0;
        const movementY = e.movementY || 0;

        this.euler.setFromQuaternion(this.camera.quaternion);
        this.euler.y -= movementX * CONFIG.MOUSE_SENSITIVITY;
        this.euler.x -= movementY * CONFIG.MOUSE_SENSITIVITY;
        this.euler.x = Math.max(-Math.PI / 2.3, Math.min(Math.PI / 2.3, this.euler.x));
        this.camera.quaternion.setFromEuler(this.euler);
      });
    }

    update() {
      if (BakeryApp.isAnyModalOpen()) return;

      const moveVector = new THREE.Vector3();
      // Phím cứng WASD
      if (this.keys.forward) moveVector.z -= 1;
      if (this.keys.backward) moveVector.z += 1;
      if (this.keys.left) moveVector.x -= 1;
      if (this.keys.right) moveVector.x += 1;

      // Phím ảo Mobile Joystick
      if (Math.abs(this.joystickDelta.x) > 0.05 || Math.abs(this.joystickDelta.y) > 0.05) {
        moveVector.x += this.joystickDelta.x;
        moveVector.z += this.joystickDelta.y;
      }

      if (moveVector.lengthSq() > 0) {
        moveVector.normalize();
        moveVector.multiplyScalar(CONFIG.MOVE_SPEED);

        // Chuyển vector hướng theo góc nhìn camera
        const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.camera.rotation.y);
        const side = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.camera.rotation.y);

        const deltaPos = new THREE.Vector3()
          .addScaledVector(forward, -moveVector.z)
          .addScaledVector(side, moveVector.x);

        // Tính vị trí mới & Kiểm tra va chạm (Collision Detection)
        const targetPos = this.camera.position.clone().add(deltaPos);

        if (!this.checkCollision(targetPos)) {
          this.camera.position.copy(targetPos);
        } else {
          // Thử trượt theo trục X
          const posX = this.camera.position.clone();
          posX.x = targetPos.x;
          if (!this.checkCollision(posX)) {
            this.camera.position.x = targetPos.x;
          } else {
            // Thử trượt theo trục Z
            const posZ = this.camera.position.clone();
            posZ.z = targetPos.z;
            if (!this.checkCollision(posZ)) {
              this.camera.position.z = targetPos.z;
            }
          }
        }

        // Khóa giới hạn trong phạm vi sàn tiệm bánh
        this.camera.position.x = Math.max(-7.2, Math.min(7.2, this.camera.position.x));
        this.camera.position.z = Math.max(-9.2, Math.min(9.2, this.camera.position.z));
      }
    }

    checkCollision(pos) {
      const playerBox = new THREE.Box3(
        new THREE.Vector3(pos.x - CONFIG.COLLISION_RADIUS, 0, pos.z - CONFIG.COLLISION_RADIUS),
        new THREE.Vector3(pos.x + CONFIG.COLLISION_RADIUS, 2.0, pos.z + CONFIG.COLLISION_RADIUS)
      );
      for (let i = 0; i < this.colliders.length; i++) {
        if (playerBox.intersectsBox(this.colliders[i])) {
          return true;
        }
      }
      return false;
    }
  }

  // --- QUẢN LÝ TƯƠNG TÁC SẢN PHẨM & RAYCASTING ---
  class InteractionManager {
    constructor(camera, interactiveObjects, onSelectProduct, onSelectMenu, onSelectCashier) {
      this.camera = camera;
      this.interactiveObjects = interactiveObjects;
      this.onSelectProduct = onSelectProduct;
      this.onSelectMenu = onSelectMenu;
      this.onSelectCashier = onSelectCashier;

      this.raycaster = new THREE.Raycaster();
      this.center = new THREE.Vector2(0, 0); // Tâm màn hình
      this.hoveredObject = null;

      this.crosshair = document.getElementById('crosshair');
      this.prompt = document.getElementById('interaction-prompt');

      this.setupTriggers();
    }

    setupTriggers() {
      // Nhấn E tương tác trên bàn phím
      window.addEventListener('keydown', (e) => {
        if (e.code === 'KeyE') {
          this.triggerActive();
        }
      });

      // Nhấp chuột trái khi đang trỏ vào vật thể
      window.addEventListener('mousedown', (e) => {
        if (e.button === 0 && document.pointerLockElement) {
          this.triggerActive();
        }
      });

      // Nút E trên Mobile
      const mobBtn = document.getElementById('mobile-interact-btn');
      if (mobBtn) {
        mobBtn.addEventListener('click', () => this.triggerActive());
      }
    }

    triggerActive() {
      if (!this.hoveredObject || BakeryApp.isAnyModalOpen()) return;

      const data = this.hoveredObject.userData;
      if (data.product) {
        this.onSelectProduct(data.product);
      } else if (data.isMenuTrigger) {
        this.onSelectMenu();
      } else if (data.isCashierTrigger) {
        this.onSelectCashier();
      }
    }

    update() {
      if (BakeryApp.isAnyModalOpen()) {
        this.clearHover();
        return;
      }

      this.raycaster.setFromCamera(this.center, this.camera);
      // Khoảng cách tương tác tối đa: 3.5 mét
      this.raycaster.far = 3.5;
      const intersects = this.raycaster.intersectObjects(this.interactiveObjects, true);

      if (intersects.length > 0) {
        // Tìm đối tượng có dữ liệu userData
        let obj = intersects[0].object;
        while (obj && !obj.userData.product && !obj.userData.isMenuTrigger && !obj.userData.isCashierTrigger && obj.parent) {
          obj = obj.parent;
        }

        if (obj && (obj.userData.product || obj.userData.isMenuTrigger || obj.userData.isCashierTrigger)) {
          this.setHover(obj);
          return;
        }
      }
      this.clearHover();
    }

    setHover(obj) {
      if (this.hoveredObject === obj) return;
      this.hoveredObject = obj;
      if (this.crosshair) this.crosshair.classList.add('active');

      if (this.prompt) {
        if (obj.userData.product) {
          const p = obj.userData.product;
          this.prompt.textContent = `[E] Xem ${p.name} — ${Number(p.price).toLocaleString('vi-VN')} đ`;
        } else if (obj.userData.isMenuTrigger) {
          this.prompt.textContent = `[E] Mở Thực Đơn Bảng Giá`;
        } else if (obj.userData.isCashierTrigger) {
          this.prompt.textContent = `[E] Đến Quầy Thu Ngân & Đặt Hàng`;
        }
        this.prompt.style.display = 'block';
      }
    }

    clearHover() {
      if (!this.hoveredObject) return;
      this.hoveredObject = null;
      if (this.crosshair) this.crosshair.classList.remove('active');
      if (this.prompt) this.prompt.style.display = 'none';
    }
  }

  // --- QUẢN LÝ ỨNG DỤNG TỔNG THỂ (BakeryApp) ---
  class BakeryApp {
    constructor() {
      this.products = [];
      this.categories = [];
      this.settings = {};
      this.cart = this.loadCart();
      this.selectedProduct = null;
      this.activeQuantity = 1;

      this.sound = new SoundManager();

      this.initThree();
      this.initUI();
      this.initMobileControls();
      this.loadBackendData();
      this.animate();
    }

    static isAnyModalOpen() {
      return !!document.querySelector('.modal-overlay.open');
    }

    initThree() {
      this.canvas = document.getElementById('webgl-canvas');
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0xF7F1E8);
      this.scene.fog = new THREE.FogExp2(0xF7F1E8, 0.035);

      this.camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 40);
      this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, powerPreference: 'high-performance' });
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      this.renderer.outputEncoding = THREE.sRGBEncoding;

      // Xây dựng cửa hàng
      this.world = new BakeryWorld(this.scene);
      this.controller = new PlayerController(this.camera, this.canvas, this.world.colliders);

      this.interaction = new InteractionManager(
        this.camera,
        this.world.interactiveObjects,
        (product) => this.openProductModal(product),
        () => this.openCatalogModal(),
        () => this.openCheckoutModal()
      );

      window.addEventListener('resize', () => {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
      });
    }

    // Tải dữ liệu từ Google Apps Script Web App
    async loadBackendData() {
      let loaded = false;
      if (CONFIG.API_BASE_URL && !CONFIG.API_BASE_URL.includes('AKfycbwYyY7JbXo8JzRk0L0VpUf3eYc7wFvP6mGqH')) {
        try {
          const resp = await fetch(`${CONFIG.API_BASE_URL}?action=bootstrap`);
          if (resp.ok) {
            const data = await resp.json();
            if (data.success) {
              this.products = data.products || [];
              this.categories = data.categories || [];
              this.settings = data.settings || {};
              loaded = true;
              this.showToast('Đã đồng bộ thực đơn từ Google Sheets');
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
        this.showToast('Đang chạy chế độ Demo chuẩn bị sẵn');
      }

      this.applySettingsToDOM();
      this.spawnProductsInShowcase();
      this.renderCatalogTabs();
      this.updateCartUI();
    }

    applySettingsToDOM() {
      const brand = this.settings.brand_name || 'PETIT FOUR';
      const sub = this.settings.brand_subtitle || 'Artisan Bakery';

      const hudTitle = document.getElementById('hud-brand-title');
      const introName = document.getElementById('intro-brand-name');
      const introSub = document.getElementById('intro-brand-sub');

      if (hudTitle) hudTitle.textContent = brand;
      if (introName) introName.textContent = brand;
      if (introSub) introSub.textContent = sub;
    }

    // Đặt các mô hình bánh lên tủ kính trưng bày
    spawnProductsInShowcase() {
      const displaySlots = [
        // Hàng trên tủ kính trung tâm
        { x: -2.6, y: 1.05, z: -2.0 },
        { x: -1.9, y: 1.05, z: -2.0 },
        { x: -1.2, y: 1.05, z: -2.0 },
        { x: -0.5, y: 1.05, z: -2.0 },
        { x: 0.2, y: 1.05, z: -2.0 },
        { x: 0.9, y: 1.05, z: -2.0 },
        { x: 1.6, y: 1.05, z: -2.0 },
        { x: 2.3, y: 1.05, z: -2.0 },
        // Kệ bên trái
        { x: -6.8, y: 1.35, z: -3.5 },
        { x: -6.8, y: 1.35, z: -4.5 }
      ];

      for (let i = 0; i < Math.min(this.products.length, displaySlots.length); i++) {
        const prod = this.products[i];
        const slot = displaySlots[i];
        const modelType = prod.model_type || 'croissant';
        const meshGroup = BakeryMeshBuilder.build(modelType);

        meshGroup.position.set(slot.x, slot.y, slot.z);
        meshGroup.userData = { product: prod };

        this.scene.add(meshGroup);
        this.world.interactiveObjects.push(meshGroup);
      }
    }

    // --- UI CONTROLS & MODALS ---
    initUI() {
      // 1. Nút "Bước vào tiệm bánh"
      const enterBtn = document.getElementById('btn-enter-store');
      const intro = document.getElementById('intro-screen');
      if (enterBtn && intro) {
        enterBtn.addEventListener('click', () => {
          intro.classList.add('hidden');
          this.sound.playDoorBell();
          if (window.innerWidth > 768) {
            this.canvas.requestPointerLock();
          }
        });
      }

      // 2. HUD Buttons
      document.getElementById('btn-open-menu').addEventListener('click', () => this.openCatalogModal());
      document.getElementById('btn-open-cart').addEventListener('click', () => this.openCheckoutModal());
      
      const soundBtn = document.getElementById('btn-toggle-sound');
      const soundIcon = document.getElementById('sound-icon');
      soundBtn.addEventListener('click', () => {
        const isEnabled = this.sound.toggle();
        soundIcon.textContent = isEnabled ? '🔊' : '🔇';
        this.showToast(isEnabled ? 'Đã bật âm thanh' : 'Đã tắt âm thanh');
      });

      // 3. Đóng modal
      document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const modalId = e.currentTarget.getAttribute('data-close');
          this.closeModal(modalId);
        });
      });

      // 4. Modal Chi tiết bánh: Tăng giảm số lượng
      document.getElementById('qty-minus').addEventListener('click', () => {
        if (this.activeQuantity > 1) {
          this.activeQuantity--;
          this.updateDetailQty();
        }
      });
      document.getElementById('qty-plus').addEventListener('click', () => {
        this.activeQuantity++;
        this.updateDetailQty();
      });

      // 5. Thêm vào giỏ
      document.getElementById('btn-add-to-cart').addEventListener('click', () => {
        if (!this.selectedProduct) return;
        this.addToCart(this.selectedProduct, this.activeQuantity);
        this.closeModal('modal-product');
        this.sound.playChime();
        this.showToast(`Đã thêm ${this.activeQuantity}x ${this.selectedProduct.name} vào giỏ`);
      });

      // 6. Checkout Delivery Method Switch
      const delivMethod = document.getElementById('cust-delivery-method');
      const addressGrp = document.getElementById('address-group');
      delivMethod.addEventListener('change', () => {
        addressGrp.style.display = (delivMethod.value === 'delivery') ? 'block' : 'none';
        this.renderCheckoutSummary();
      });

      // 7. Gửi Đơn Hàng Form Submit
      const form = document.getElementById('checkout-form');
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.submitOrder();
      });

      // 8. Nút quay lại tiệm bánh từ modal success
      document.getElementById('btn-back-to-bakery').addEventListener('click', () => {
        this.closeModal('modal-success');
      });

      // Nút Checkout nhanh trên Mobile
      const mobCheckout = document.getElementById('mobile-checkout-btn');
      if (mobCheckout) {
        mobCheckout.addEventListener('click', () => this.openCheckoutModal());
      }
    }

    initMobileControls() {
      const zone = document.getElementById('joystick-zone');
      const knob = document.getElementById('joystick-knob');
      if (!zone || !knob) return;

      let touching = false;
      let center = { x: 0, y: 0 };

      const handleStart = (e) => {
        touching = true;
        const rect = zone.getBoundingClientRect();
        center = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
        handleMove(e);
      };

      const handleMove = (e) => {
        if (!touching) return;
        const touch = e.touches ? e.touches[0] : e;
        const dx = touch.clientX - center.x;
        const dy = touch.clientY - center.y;
        const dist = Math.min(45, Math.hypot(dx, dy));
        const angle = Math.atan2(dy, dx);

        const knobX = Math.cos(angle) * dist;
        const knobY = Math.sin(angle) * dist;

        knob.style.transform = `translate(${knobX}px, ${knobY}px)`;
        this.controller.joystickDelta = {
          x: (knobX / 45),
          y: (knobY / 45)
        };
      };

      const handleEnd = () => {
        touching = false;
        knob.style.transform = 'translate(0px, 0px)';
        this.controller.joystickDelta = { x: 0, y: 0 };
      };

      zone.addEventListener('touchstart', handleStart, { passive: false });
      window.addEventListener('touchmove', handleMove, { passive: false });
      window.addEventListener('touchend', handleEnd);
    }

    // Mở modal chi tiết bánh
    openProductModal(product) {
      if (document.pointerLockElement) document.exitPointerLock();
      this.selectedProduct = product;
      this.activeQuantity = 1;

      document.getElementById('detail-img').src = product.image_url || 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80';
      document.getElementById('detail-name').textContent = product.name;
      document.getElementById('detail-price').textContent = `${Number(product.price).toLocaleString('vi-VN')} đ`;
      document.getElementById('detail-desc').textContent = product.description || 'Hương vị hảo hạng được chăm chút bởi bếp trưởng tiệm Petit Four.';
      document.getElementById('detail-flavor').textContent = product.flavor || 'Thơm béo, ngọt dịu thanh tao';
      document.getElementById('detail-ingredients').textContent = product.ingredients || 'Nguyên liệu nhập khẩu chất lượng cao';
      document.getElementById('detail-weight').textContent = product.weight || 'Tiêu chuẩn';

      const catObj = this.categories.find(c => c.id === product.category);
      document.getElementById('detail-category').textContent = catObj ? catObj.name : 'ARTISAN';

      this.updateDetailQty();
      this.openModal('modal-product');
    }

    updateDetailQty() {
      document.getElementById('qty-count').textContent = this.activeQuantity;
      const total = (Number(this.selectedProduct.price) || 0) * this.activeQuantity;
      document.getElementById('detail-btn-price').textContent = `${total.toLocaleString('vi-VN')} đ`;
    }

    // Modal Menu Bảng Giá
    openCatalogModal() {
      if (document.pointerLockElement) document.exitPointerLock();
      this.renderCatalogProducts(null);
      this.openModal('modal-catalog');
    }

    renderCatalogTabs() {
      const container = document.getElementById('catalog-category-tabs');
      if (!container) return;
      container.innerHTML = `<button class="cat-tab-btn active" data-cat="all">Tất Cả Món</button>`;

      this.categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'cat-tab-btn';
        btn.setAttribute('data-cat', cat.id);
        btn.textContent = cat.name;
        btn.addEventListener('click', () => {
          document.querySelectorAll('.cat-tab-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.renderCatalogProducts(cat.id);
        });
        container.appendChild(btn);
      });

      container.querySelector('[data-cat="all"]').addEventListener('click', (e) => {
        document.querySelectorAll('.cat-tab-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.renderCatalogProducts(null);
      });
    }

    renderCatalogProducts(catId) {
      const grid = document.getElementById('catalog-products-grid');
      if (!grid) return;
      grid.innerHTML = '';

      const list = catId ? this.products.filter(p => p.category === catId) : this.products;

      list.forEach(p => {
        const card = document.createElement('div');
        card.className = 'catalog-card';
        card.innerHTML = `
          <div class="catalog-card-img">
            <img src="${p.image_url || ''}" alt="${p.name}" loading="lazy">
          </div>
          <div class="catalog-card-body">
            <div class="catalog-card-title">${p.name}</div>
            <div class="catalog-card-price">${Number(p.price).toLocaleString('vi-VN')} đ</div>
          </div>
        `;
        card.addEventListener('click', () => {
          this.closeModal('modal-catalog');
          this.openProductModal(p);
        });
        grid.appendChild(card);
      });
    }

    // Modal Giỏ Hàng & Checkout
    openCheckoutModal() {
      if (document.pointerLockElement) document.exitPointerLock();
      this.renderCartItems();
      this.renderCheckoutSummary();
      this.openModal('modal-checkout');
    }

    renderCartItems() {
      const container = document.getElementById('cart-items-container');
      if (!container) return;
      if (this.cart.length === 0) {
        container.innerHTML = `<p style="text-align:center; padding:24px; color:#999;">Giỏ hàng của bạn đang trống. Hãy dạo quanh tiệm và chọn bánh nhé!</p>`;
        return;
      }

      container.innerHTML = '';
      this.cart.forEach((item, idx) => {
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
          <img class="cart-item-img" src="${item.product.image_url || ''}">
          <div class="cart-item-details">
            <div class="cart-item-name">${item.product.name}</div>
            <div class="cart-item-price">${Number(item.product.price).toLocaleString('vi-VN')} đ x ${item.quantity}</div>
          </div>
          <button class="cart-remove-btn" title="Xóa">&times;</button>
        `;
        div.querySelector('.cart-remove-btn').addEventListener('click', () => {
          this.removeFromCart(idx);
          this.renderCartItems();
          this.renderCheckoutSummary();
        });
        container.appendChild(div);
      });
    }

    renderCheckoutSummary() {
      const subtotal = this.cart.reduce((acc, i) => acc + (Number(i.product.price) || 0) * i.quantity, 0);
      const isDelivery = document.getElementById('cust-delivery-method').value === 'delivery';
      const shipping = isDelivery && subtotal > 0 ? (Number(this.settings.shipping_fee_default) || 25000) : 0;
      const total = subtotal + shipping;

      document.getElementById('summary-subtotal').textContent = `${subtotal.toLocaleString('vi-VN')} đ`;
      document.getElementById('summary-shipping').textContent = `${shipping.toLocaleString('vi-VN')} đ`;
      document.getElementById('summary-total').textContent = `${total.toLocaleString('vi-VN')} đ`;
    }

    // Gửi đơn hàng lên Apps Script
    async submitOrder() {
      if (this.cart.length === 0) {
        this.showToast('Giỏ hàng trống! Hãy chọn ít nhất một chiếc bánh.');
        return;
      }

      const name = document.getElementById('cust-name').value.trim();
      const phone = document.getElementById('cust-phone').value.trim();
      const method = document.getElementById('cust-delivery-method').value;
      const address = document.getElementById('cust-address').value.trim();
      const note = document.getElementById('cust-note').value.trim();
      const payment = document.getElementById('cust-payment-method').value;

      if (!name || !phone) {
        this.showToast('Vui lòng điền họ tên và số điện thoại liên hệ.');
        return;
      }

      if (method === 'delivery' && !address) {
        this.showToast('Vui lòng nhập địa chỉ để tiệm giao bánh tận nơi.');
        return;
      }

      const submitBtn = document.getElementById('btn-submit-order');
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span>Đang kết nối lò nướng...</span>`;

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
        items: this.cart.map(i => ({ id: i.product.id, quantity: i.quantity }))
      };

      try {
        let orderResult = null;

        // Gửi POST tới Apps Script Web App
        if (CONFIG.API_BASE_URL && !CONFIG.API_BASE_URL.includes('AKfycbwYyY7JbXo8JzRk0L0VpUf3eYc7wFvP6mGqH')) {
          const resp = await fetch(CONFIG.API_BASE_URL, {
            method: 'POST',
            body: JSON.stringify(orderPayload),
            headers: { 'Content-Type': 'text/plain;charset=utf-8' }
          });
          if (resp.ok) {
            orderResult = await resp.json();
          }
        }

        // Fallback demo nếu API chưa setup
        if (!orderResult || !orderResult.success) {
          const sub = this.cart.reduce((acc, i) => acc + (Number(i.product.price) || 0) * i.quantity, 0);
          const ship = method === 'delivery' ? 25000 : 0;
          orderResult = {
            success: true,
            order: {
              order_id: 'PF-' + Math.floor(100000 + Math.random() * 900000),
              total: sub + ship,
              payment_method: payment
            }
          };
        }

        if (orderResult.success) {
          this.closeModal('modal-checkout');
          this.clearCart();
          this.showOrderSuccess(orderResult.order);
        } else {
          this.showToast(orderResult.error || 'Có lỗi xảy ra khi tạo đơn.');
        }
      } catch (err) {
        console.error('Lỗi Submit Order:', err);
        this.showToast('Không thể gửi đơn hàng do lỗi mạng. Vui lòng thử lại!');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<span>Gửi Đơn Đặt Bánh</span><span>➔</span>`;
      }
    }

    showOrderSuccess(order) {
      document.getElementById('success-order-id').textContent = order.order_id;
      document.getElementById('success-total-val').textContent = `${Number(order.total).toLocaleString('vi-VN')} đ`;
      document.getElementById('success-transfer-memo').textContent = order.order_id;

      document.getElementById('success-bank-name').textContent = this.settings.bank_name || 'Vietcombank';
      document.getElementById('success-bank-acc').textContent = this.settings.bank_account_number || '0011004567890';
      document.getElementById('success-bank-holder').textContent = this.settings.bank_account_holder || 'PETIT FOUR';

      const qrImg = document.getElementById('success-qr-img');
      qrImg.src = this.settings.bank_qr_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80';

      this.openModal('modal-success');
    }

    // --- GIỎ HÀNG (Cart Operations & LocalStorage) ---
    addToCart(product, qty) {
      const existing = this.cart.find(i => i.product.id === product.id);
      if (existing) {
        existing.quantity += qty;
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
        return saved ? JSON.parse(saved) : [];
      } catch (e) {
        return [];
      }
    }

    updateCartUI() {
      const count = this.cart.reduce((acc, i) => acc + i.quantity, 0);
      const badge = document.getElementById('cart-counter');
      if (badge) badge.textContent = count;
    }

    // Modal Helpers
    openModal(id) {
      const el = document.getElementById(id);
      if (el) el.classList.add('open');
    }

    closeModal(id) {
      const el = document.getElementById(id);
      if (el) el.classList.remove('open');
    }

    showToast(msg) {
      const t = document.getElementById('toast');
      if (!t) return;
      t.textContent = msg;
      t.classList.add('show');
      clearTimeout(this.toastTimer);
      this.toastTimer = setTimeout(() => {
        t.classList.remove('show');
      }, 3200);
    }

    // Main Game Loop
    animate() {
      requestAnimationFrame(() => this.animate());

      // Cập nhật bước đi vật lý người chơi
      this.controller.update();

      // Cập nhật tương tác Raycast
      this.interaction.update();

      // Khẽ xoay nhẹ các đĩa bánh tạo điểm nhấn lung linh
      this.world.interactiveObjects.forEach(obj => {
        if (obj.userData && obj.userData.product) {
          obj.rotation.y += 0.004;
        }
      });

      this.renderer.render(this.scene, this.camera);
    }
  }

  // Khởi động khi DOM đã tải xong
  window.addEventListener('DOMContentLoaded', () => {
    window.bakeryAppInstance = new BakeryApp();
  });
})();