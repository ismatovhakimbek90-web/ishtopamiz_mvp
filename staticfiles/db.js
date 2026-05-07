// ============================================================
// DB.JS — LocalStorage wrapper + seed data
// ============================================================

const DB = {
  get(key) {
    try { return JSON.parse(localStorage.getItem(key)) || null; } catch { return null; }
  },
  set(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
  },
  getArr(key) {
    return this.get(key) || [];
  },
  push(key, item) {
    const arr = this.getArr(key);
    arr.push(item);
    this.set(key, arr);
    return item;
  },
  update(key, id, updates) {
    const arr = this.getArr(key);
    const idx = arr.findIndex(x => x.id === id);
    if (idx !== -1) { arr[idx] = { ...arr[idx], ...updates }; this.set(key, arr); return arr[idx]; }
    return null;
  },
  remove(key, id) {
    const arr = this.getArr(key).filter(x => x.id !== id);
    this.set(key, arr);
  },
  findById(key, id) {
    return this.getArr(key).find(x => x.id === id) || null;
  }
};

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function hashPass(p) {
  return btoa(unescape(encodeURIComponent(p + '_ishtop_salt')));
}

// ============================================================
// SEED DATA
// ============================================================
function seedData() {
  if (DB.get('seeded')) return;

  // --- USERS ---
  const users = [
    {
      id: 'u1', email: 'ali@test.uz', password: hashPass('123456'),
      role: 'seeker', name: 'Ali Karimov', age: 24, city: 'Toshkent',
      bio: 'Python va UI/UX bo\'yicha tajribali dasturchi. Kreativ va muammolarni hal qilishni yaxshi ko\'raman.',
      skills: ['Python', 'UI/UX', 'Django', 'Figma'],
      createdAt: new Date().toISOString()
    },
    {
      id: 'u2', email: 'malika@test.uz', password: hashPass('123456'),
      role: 'seeker', name: 'Malika Yusupova', age: 22, city: 'Samarqand',
      bio: 'SMM va digital marketing sohasida 2 yil tajribam bor. Ingliz tilini mukammal bilaman.',
      skills: ['SMM', 'Ingliz tili', 'Photoshop', 'Copywriting'],
      createdAt: new Date().toISOString()
    },
    {
      id: 'u3', email: 'techcorp@test.uz', password: hashPass('123456'),
      role: 'employer', name: 'Bobur Rahimov', age: 35, city: 'Toshkent',
      bio: 'TechCorp kompaniyasi HR menejeri',
      company: 'TechCorp LLC', industry: 'IT / Software', website: 'https://techcorp.uz',
      createdAt: new Date().toISOString()
    },
    {
      id: 'u4', email: 'digital@test.uz', password: hashPass('123456'),
      role: 'employer', name: 'Nodira Xasanova', age: 30, city: 'Toshkent',
      bio: 'DigitalPro agentligining asoschisi',
      company: 'DigitalPro Agency', industry: 'Marketing / SMM', website: 'https://digitalpro.uz',
      createdAt: new Date().toISOString()
    }
  ];
  DB.set('users', users);

  // --- JOBS ---
  const jobs = [
    {
      id: 'j1', employerId: 'u3',
      title: 'Python Backend Dasturchi',
      company: 'TechCorp LLC',
      salary: '5,000,000 — 8,000,000 so\'m',
      skills: ['Python', 'Django', 'PostgreSQL', 'REST API'],
      location: 'remote',
      deadline: '2025-08-01',
      description: 'Bizning jamoamizga tajribali Python dasturchi kerak.\n\nVazifalar:\n• Django/FastAPI yordamida backend tizimlar yaratish\n• REST API loyihalash va qo\'llab-quvvatlash\n• Ma\'lumotlar bazasi optimizatsiyasi\n\nTalablar:\n• 2+ yil Python tajribasi\n• Django yoki FastAPI bilimi\n• PostgreSQL bilimi\n• Git bilan ishlash tajribasi\n\nShart-sharoitlar:\n• To\'liq masofaviy ish\n• 5 kunlik ish haftasi\n• Korporativ o\'qitish imkoniyati',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: 'j2', employerId: 'u4',
      title: 'SMM Mutaxassisi',
      company: 'DigitalPro Agency',
      salary: '2,500,000 — 4,000,000 so\'m',
      skills: ['SMM', 'Ingliz tili', 'Photoshop', 'Copywriting'],
      location: 'office',
      deadline: '2025-07-15',
      description: 'Ijtimoiy tarmoqlar bo\'yicha kreativ mutaxassis izlaymiz.\n\nVazifalar:\n• Instagram, Telegram, Facebook sahifalarini boshqarish\n• Kontent-reja tuzish va amalga oshirish\n• Kreativ postlar va stories tayyorlash\n• Audience engagement oshirish\n\nTalablar:\n• SMM sohasida 1+ yil tajriba\n• Photoshop / Canva bilimi\n• Ingliz tilini bilish (B2+)\n• Kreativ fikrlash qobiliyati\n\nShart-sharoitlar:\n• Ofisda ishlash (Toshkent, Chilonzor)\n• Dushanba-Juma, 09:00-18:00\n• Bonus tizimi mavjud',
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
    },
    {
      id: 'j3', employerId: 'u3',
      title: 'UI/UX Dizayner',
      company: 'TechCorp LLC',
      salary: '4,000,000 — 6,000,000 so\'m',
      skills: ['UI/UX', 'Figma', 'Prototyping', 'Adobe XD'],
      location: 'hybrid',
      deadline: '2025-07-30',
      description: 'Mahsulotlarimizni yanada chiroyliroq va foydalanuvchilarga qulay qilish uchun UI/UX dizayner qidirmoqdamiz.\n\nVazifalar:\n• Mobil va web ilovalar uchun UI dizayn yaratish\n• Foydalanuvchi tadqiqotlari o\'tkazish\n• Prototyplar va wireframelar tayyorlash\n• Dasturchilar bilan yaqin hamkorlik\n\nTalablar:\n• Figma yoki Adobe XD ustasi\n• Portfolio taqdim etish shart\n• 1+ yil tajriba',
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
    },
    {
      id: 'j4', employerId: 'u4',
      title: '1C Dasturchi',
      company: 'DigitalPro Agency',
      salary: '3,500,000 — 5,500,000 so\'m',
      skills: ['1C', 'Buxgalteriya', 'SQL'],
      location: 'office',
      deadline: '2025-08-10',
      description: '1C:Korxona tizimini sozlash va qo\'llab-quvvatlash bo\'yicha mutaxassis kerak.\n\nVazifalar:\n• 1C:Buxgalteriya va 1C:Trade Management sozlash\n• Konfiguratsiya o\'zgartirish va yangi modullar qo\'shish\n• Foydalanuvchilarni o\'qitish\n• Texnik qo\'llab-quvvatlash\n\nTalablar:\n• 1C platformasi bilimi (8.3)\n• SQL asoslarini bilish\n• Buxgalteriya asoslarini tushunish',
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString()
    }
  ];
  DB.set('jobs', jobs);

  // --- APPLICATIONS ---
  DB.set('applications', []);

  DB.set('seeded', true);
  console.log('✅ Seed data loaded');
}

// Run seed on load
seedData();
