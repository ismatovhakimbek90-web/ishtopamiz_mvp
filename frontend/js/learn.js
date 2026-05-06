// ============================================================
// LEARN.JS — Courses database & filtering
// ============================================================

const COURSES_DB = [
  // PYTHON
  { id:'c1', skill:'Python', title:'Python dasturlash — noldan professional darajagacha', channel:'Najot Ta\'lim', url:'https://www.youtube.com/watch?v=_uQrJ0TkZlc', level:'beginner' },
  { id:'c2', skill:'Python', title:'Python for Everybody — To\'liq kurs', channel:'Dr. Chuck (freeCodeCamp)', url:'https://www.youtube.com/watch?v=8DvywoWv6fI', level:'beginner' },
  { id:'c3', skill:'Python', title:'Django Web Framework — To\'liq tutorial', channel:'Traversy Media', url:'https://www.youtube.com/watch?v=OTmQOjsl0eg', level:'intermediate' },
  { id:'c4', skill:'Python', title:'Python Advanced — OOP, Decorators, Generators', channel:'Tech With Tim', url:'https://www.youtube.com/watch?v=Ej_02ICOIgs', level:'advanced' },

  // UI/UX
  { id:'c5', skill:'UI/UX', title:'UI/UX Dizayn noldan — Figma tutorial', channel:'DesignCourse', url:'https://www.youtube.com/watch?v=68w2VwalD5w', level:'beginner' },
  { id:'c6', skill:'UI/UX', title:'Figma UI Design — To\'liq boshlang\'ich kurs', channel:'Flux Academy', url:'https://www.youtube.com/watch?v=jk1T0CdLxwU', level:'beginner' },
  { id:'c7', skill:'UI/UX', title:'UX Research Methods — Professional ustuliyblik', channel:'AJ&Smart', url:'https://www.youtube.com/watch?v=6J7R3BKo3S4', level:'intermediate' },

  // SMM
  { id:'c8', skill:'SMM', title:'Social Media Marketing 2024 — To\'liq strategiya', channel:'HubSpot Marketing', url:'https://www.youtube.com/watch?v=8Vn0DvdGGiU', level:'beginner' },
  { id:'c9', skill:'SMM', title:'Instagram Marketing — Organik o\'sish sirlari', channel:'Later', url:'https://www.youtube.com/watch?v=SomG4dSLq_4', level:'beginner' },
  { id:'c10', skill:'SMM', title:'Content Marketing Strategiya — Ekspert darajasi', channel:'Neil Patel', url:'https://www.youtube.com/watch?v=lBUFzpUFbcE', level:'intermediate' },

  // 1C
  { id:'c11', skill:'1C', title:'1C:Buxgalteriya 8.3 — Boshlang\'ichlar uchun', channel:'1C Kompaniya', url:'https://www.youtube.com/watch?v=3Y6B2HJqJLM', level:'beginner' },
  { id:'c12', skill:'1C', title:'1C dasturlash asoslari — 8.3 konfiguratsiya', channel:'Infostart', url:'https://www.youtube.com/watch?v=cjUoLGFvDJ8', level:'intermediate' },
  { id:'c13', skill:'1C', title:'1C Trade Management — Savdo boshqaruvi', channel:'1C Uchebnyy tsentr', url:'https://www.youtube.com/watch?v=Rr4ZS_KxPpM', level:'intermediate' },

  // INGLIZ TILI
  { id:'c14', skill:'Ingliz tili', title:'Ingliz tili noldan A1-B2 darajagacha', channel:'EnglishClass101', url:'https://www.youtube.com/watch?v=hnHLe8X3KoI', level:'beginner' },
  { id:'c15', skill:'Ingliz tili', title:'Business English — Ish uchun ingliz tili', channel:'BBC Learning English', url:'https://www.youtube.com/watch?v=AmNgpNR_2CE', level:'intermediate' },
  { id:'c16', skill:'Ingliz tili', title:'IELTS preparation — To\'liq tayyorlov kursi', channel:'IELTS Liz', url:'https://www.youtube.com/watch?v=g2hkUhSsHQ4', level:'advanced' },

  // JAVASCRIPT
  { id:'c17', skill:'JavaScript', title:'JavaScript noldan — To\'liq kurs', channel:'Bro Code', url:'https://www.youtube.com/watch?v=8dWL3wF_OMw', level:'beginner' },
  { id:'c18', skill:'JavaScript', title:'JavaScript Advanced Concepts', channel:'Akshay Saini', url:'https://www.youtube.com/watch?v=pN18jNDDua4', level:'advanced' },

  // PHOTOSHOP
  { id:'c19', skill:'Photoshop', title:'Adobe Photoshop — Boshlang\'ichlar uchun to\'liq kurs', channel:'Piximperfect', url:'https://www.youtube.com/watch?v=IyR_uYssometime', level:'beginner' },
  { id:'c20', skill:'Photoshop', title:'Photoshop for Graphic Design', channel:'Envato Tuts+', url:'https://www.youtube.com/watch?v=YdHEPmHMFX4', level:'intermediate' },
];

const ALL_SKILLS = [...new Set(COURSES_DB.map(c => c.skill))];

function levelLabel(l) {
  return { beginner: 'Boshlang\'ich', intermediate: 'O\'rta', advanced: 'Yuqori' }[l] || l;
}

function renderLearnPage() {
  // Skill filter buttons
  const tagsEl = document.getElementById('skillTagsLearn');
  if (tagsEl) {
    tagsEl.innerHTML = ['Barchasi', ...ALL_SKILLS].map(s =>
      `<button class="skill-filter-btn ${s==='Barchasi'?'active':''}" onclick="filterBySkillTag('${s}',this)">${s}</button>`
    ).join('');
  }
  renderCourses(COURSES_DB);
}

function filterBySkillTag(skill, btn) {
  document.querySelectorAll('.skill-filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('learnSearch').value = skill === 'Barchasi' ? '' : skill;
  filterCourses();
}

function filterCourses() {
  const query = (document.getElementById('learnSearch')?.value || '').toLowerCase().trim();
  if (!query) { renderCourses(COURSES_DB); return; }
  const filtered = COURSES_DB.filter(c =>
    c.skill.toLowerCase().includes(query) ||
    c.title.toLowerCase().includes(query) ||
    c.channel.toLowerCase().includes(query)
  );
  renderCourses(filtered);
}

function renderCourses(courses) {
  const el = document.getElementById('coursesList');
  if (!el) return;
  if (courses.length === 0) {
    el.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">📚</div><h3>Kurslar topilmadi</h3><p>Boshqa skill bo'yicha qidiring</p></div>`;
    return;
  }
  el.innerHTML = courses.map(c => `
    <div class="course-card">
      <div class="course-skill">⚡ ${c.skill}</div>
      <div class="course-title">${c.title}</div>
      <div class="course-channel">📺 ${c.channel}</div>
      <div class="course-meta">
        <span class="level-badge ${c.level}">${levelLabel(c.level)}</span>
        <a href="${c.url}" target="_blank" rel="noopener" class="youtube-btn" onclick="event.stopPropagation()">
          ▶ YouTube
        </a>
      </div>
    </div>`).join('');
}
