// ============================================================
// AUTH.JS — Login, Register, Session management
// ============================================================

let currentUser = null;
let selectedRole = 'seeker';
let regSkills = [];
let jobSkills = [];

function initAuth() {
  const token = localStorage.getItem('session_token');
  const userId = localStorage.getItem('session_user');
  if (token && userId) {
    const user = DB.findById('users', userId);
    if (user) {
      currentUser = user;
      updateNavForUser();
    } else {
      localStorage.removeItem('session_token');
      localStorage.removeItem('session_user');
    }
  }
}

function updateNavForUser() {
  const navAuth = document.getElementById('navAuth');
  const navUser = document.getElementById('navUser');
  const userBadge = document.getElementById('userBadge');
  const profileLink = document.getElementById('profileNavLink');
  const addJobBtn = document.getElementById('addJobBtn');

  if (currentUser) {
    navAuth.style.display = 'none';
    navUser.style.display = 'flex';
    userBadge.textContent = currentUser.name + (currentUser.role === 'employer' ? ' 🏢' : ' 👤');
    profileLink.style.display = 'block';
    if (addJobBtn) addJobBtn.style.display = currentUser.role === 'employer' ? 'inline-flex' : 'none';
  } else {
    navAuth.style.display = 'flex';
    navUser.style.display = 'none';
    profileLink.style.display = 'none';
    if (addJobBtn) addJobBtn.style.display = 'none';
  }
}

function login() {
  const email = document.getElementById('loginEmail').value.trim().toLowerCase();
  const password = document.getElementById('loginPassword').value;
  const errEl = document.getElementById('loginError');
  errEl.style.display = 'none';

  if (!email || !password) {
    errEl.textContent = 'Email va parolni kiriting!';
    errEl.style.display = 'block'; return;
  }

  const users = DB.getArr('users');
  const user = users.find(u => u.email === email && u.password === hashPass(password));

  if (!user) {
    errEl.textContent = 'Email yoki parol noto\'g\'ri!';
    errEl.style.display = 'block'; return;
  }

  currentUser = user;
  const token = btoa(user.id + ':' + Date.now());
  localStorage.setItem('session_token', token);
  localStorage.setItem('session_user', user.id);
  updateNavForUser();
  showToast('Xush kelibsiz, ' + user.name + '! 👋', 'success');
  navigate('home');
}

function logout() {
  currentUser = null;
  localStorage.removeItem('session_token');
  localStorage.removeItem('session_user');
  updateNavForUser();
  showToast('Tizimdan chiqildi');
  navigate('home');
}

function selectRole(role) {
  selectedRole = role;
  document.getElementById('role-seeker').classList.toggle('active', role === 'seeker');
  document.getElementById('role-employer').classList.toggle('active', role === 'employer');
  document.getElementById('seekerFields').style.display = role === 'seeker' ? 'block' : 'none';
  document.getElementById('employerFields').style.display = role === 'employer' ? 'block' : 'none';
}

function addSkillChip() {
  const input = document.getElementById('skillInput');
  const val = input.value.trim();
  if (!val) return;
  if (regSkills.includes(val)) { input.value = ''; return; }
  regSkills.push(val);
  renderSkillChips('regSkillChips', regSkills, removeRegSkill);
  input.value = '';
}

function removeRegSkill(skill) {
  regSkills = regSkills.filter(s => s !== skill);
  renderSkillChips('regSkillChips', regSkills, removeRegSkill);
}

function renderSkillChips(containerId, skills, removeFn) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = skills.map(s =>
    `<span class="chip">${s}<button type="button" onclick="${removeFn.name}('${s}')">×</button></span>`
  ).join('');
}

// Job skill chips
function addJobSkillChip() {
  const input = document.getElementById('jobSkillInput');
  const val = input.value.trim();
  if (!val) return;
  if (jobSkills.includes(val)) { input.value = ''; return; }
  jobSkills.push(val);
  renderSkillChips('jobSkillChips', jobSkills, removeJobSkill);
  input.value = '';
}

function removeJobSkill(skill) {
  jobSkills = jobSkills.filter(s => s !== skill);
  renderSkillChips('jobSkillChips', jobSkills, removeJobSkill);
}

// Enter key support for skill inputs
document.addEventListener('DOMContentLoaded', () => {
  const si = document.getElementById('skillInput');
  if (si) si.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); addSkillChip(); } });
  const ji = document.getElementById('jobSkillInput');
  if (ji) ji.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); addJobSkillChip(); } });
});

function register() {
  const name = document.getElementById('regName').value.trim();
  const age = document.getElementById('regAge').value;
  const email = document.getElementById('regEmail').value.trim().toLowerCase();
  const city = document.getElementById('regCity').value.trim();
  const password = document.getElementById('regPassword').value;
  const bio = document.getElementById('regBio').value.trim();
  const errEl = document.getElementById('registerError');
  errEl.style.display = 'none';

  if (!name || !email || !password || !city) {
    errEl.textContent = 'Barcha majburiy maydonlarni to\'ldiring!';
    errEl.style.display = 'block'; return;
  }
  if (password.length < 6) {
    errEl.textContent = 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak!';
    errEl.style.display = 'block'; return;
  }

  const users = DB.getArr('users');
  if (users.find(u => u.email === email)) {
    errEl.textContent = 'Bu email allaqachon ro\'yxatdan o\'tgan!';
    errEl.style.display = 'block'; return;
  }

  const newUser = {
    id: uid(), email, password: hashPass(password),
    role: selectedRole, name, age: parseInt(age) || 0,
    city, bio, createdAt: new Date().toISOString()
  };

  if (selectedRole === 'seeker') {
    newUser.skills = regSkills;
  } else {
    newUser.company = document.getElementById('regCompany').value.trim();
    newUser.industry = document.getElementById('regIndustry').value.trim();
    newUser.website = document.getElementById('regWebsite').value.trim();
  }

  DB.push('users', newUser);
  currentUser = newUser;
  const token = btoa(newUser.id + ':' + Date.now());
  localStorage.setItem('session_token', token);
  localStorage.setItem('session_user', newUser.id);
  regSkills = [];
  updateNavForUser();
  showToast('Muvaffaqiyatli ro\'yxatdan o\'tdingiz! 🎉', 'success');
  navigate('home');
}

function renderProfilePage() {
  if (!currentUser) { navigate('login'); return; }
  const el = document.getElementById('profileContent');
  const apps = DB.getArr('applications');

  if (currentUser.role === 'seeker') {
    const myApps = apps.filter(a => a.seekerId === currentUser.id);
    el.innerHTML = `
      <div class="profile-header">
        <div class="profile-avatar">${currentUser.name.charAt(0)}</div>
        <div class="profile-info">
          <h2>${currentUser.name} <span style="font-size:.8rem;background:#dbeafe;color:#1e40af;padding:2px 10px;border-radius:20px;font-weight:600">Ish Qidiruvchi</span></h2>
          <p>${currentUser.email} · ${currentUser.city}</p>
          <p style="margin-top:8px;color:var(--gray-700)">${currentUser.bio || ''}</p>
        </div>
      </div>
      <div class="profile-sections">
        <div class="profile-section">
          <h3>📋 Shaxsiy ma'lumotlar</h3>
          <div class="info-grid">
            <div class="info-item"><label>Ism</label><span>${currentUser.name}</span></div>
            <div class="info-item"><label>Yosh</label><span>${currentUser.age || '—'}</span></div>
            <div class="info-item"><label>Shahar</label><span>${currentUser.city}</span></div>
            <div class="info-item"><label>Email</label><span>${currentUser.email}</span></div>
          </div>
        </div>
        <div class="profile-section">
          <h3>⚡ Mening Skilllarim</h3>
          ${currentUser.skills && currentUser.skills.length > 0
            ? `<div class="skills-wrap">${currentUser.skills.map(s => `<span class="skill-tag matched">${s}</span>`).join('')}</div>`
            : '<div class="alert-info">Hali skill qo\'shilmagan. <a href="#" onclick="navigate(\'learn\')">Kurs ko\'ring</a> va o\'rganing!</div>'
          }
        </div>
        <div class="profile-section">
          <h3>📄 Arizalarim <span style="background:var(--gray-100);padding:2px 10px;border-radius:20px;font-size:.82rem">${myApps.length}</span></h3>
          <button class="btn-outline btn-sm" onclick="navigate('my-applications')" style="margin-bottom:12px">Barcha arizalarni ko'rish</button>
          ${myApps.slice(0,3).map(a => {
            const job = DB.findById('jobs', a.jobId);
            return job ? `<div class="app-card">
              <div class="app-info">
                <div class="app-name">${job.title}</div>
                <div class="app-detail">${job.company}</div>
              </div>
              <span class="status-badge status-${a.status}">${statusLabel(a.status)}</span>
            </div>` : '';
          }).join('')}
        </div>
      </div>`;
  } else {
    const myJobs = DB.getArr('jobs').filter(j => j.employerId === currentUser.id);
    const allApps = apps.filter(a => myJobs.some(j => j.id === a.jobId));
    el.innerHTML = `
      <div class="profile-header">
        <div class="profile-avatar">${currentUser.name.charAt(0)}</div>
        <div class="profile-info">
          <h2>${currentUser.name} <span style="font-size:.8rem;background:#d1fae5;color:#065f46;padding:2px 10px;border-radius:20px;font-weight:600">Ish Beruvchi</span></h2>
          <p>${currentUser.email} · ${currentUser.city}</p>
          <p style="margin-top:6px;font-weight:600;color:var(--blue)">${currentUser.company || ''}</p>
        </div>
      </div>
      <div class="profile-sections">
        <div class="profile-section">
          <h3>🏢 Kompaniya ma'lumotlari</h3>
          <div class="info-grid">
            <div class="info-item"><label>Kompaniya</label><span>${currentUser.company || '—'}</span></div>
            <div class="info-item"><label>Soha</label><span>${currentUser.industry || '—'}</span></div>
            <div class="info-item"><label>Sayt</label><span>${currentUser.website ? `<a href="${currentUser.website}" target="_blank">${currentUser.website}</a>` : '—'}</span></div>
            <div class="info-item"><label>Shahar</label><span>${currentUser.city}</span></div>
          </div>
        </div>
        <div class="profile-section">
          <h3>📊 Statistika</h3>
          <div class="info-grid">
            <div class="info-item"><label>Jami e'lonlar</label><span>${myJobs.length}</span></div>
            <div class="info-item"><label>Jami arizalar</label><span>${allApps.length}</span></div>
            <div class="info-item"><label>Qabul qilingan</label><span>${allApps.filter(a=>a.status==='accepted').length}</span></div>
            <div class="info-item"><label>Rad etilgan</label><span>${allApps.filter(a=>a.status==='rejected').length}</span></div>
          </div>
        </div>
      </div>`;
  }
}

function statusLabel(s) {
  return { pending: 'Ko\'rib chiqilmoqda', accepted: 'Qabul qilindi', rejected: 'Rad etildi' }[s] || s;
}
