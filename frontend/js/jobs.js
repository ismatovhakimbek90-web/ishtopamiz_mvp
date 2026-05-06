// ============================================================
// JOBS.JS — Job listings, matching, applications
// ============================================================

// Jaccard-based matching algorithm
function matchScore(userSkills, jobSkills) {
  if (!userSkills || userSkills.length === 0 || !jobSkills || jobSkills.length === 0) return 0;
  const uSet = new Set(userSkills.map(s => s.toLowerCase().trim()));
  const jSet = new Set(jobSkills.map(s => s.toLowerCase().trim()));
  let intersection = 0;
  uSet.forEach(s => { if (jSet.has(s)) intersection++; });
  const union = uSet.size + jSet.size - intersection;
  return union === 0 ? 0 : Math.round((intersection / union) * 100);
}

function getMatchedSkills(userSkills, jobSkills) {
  if (!userSkills || !jobSkills) return [];
  const uSet = new Set(userSkills.map(s => s.toLowerCase().trim()));
  return jobSkills.filter(s => uSet.has(s.toLowerCase().trim()));
}

function locationLabel(loc) {
  return { remote: '🌐 Masofaviy', office: '🏢 Ofis', hybrid: '🔄 Gibrid' }[loc] || loc;
}

function locationClass(loc) {
  return { remote: 'remote', office: 'office', hybrid: '' }[loc] || '';
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Bugun';
  if (days === 1) return 'Kecha';
  return days + ' kun oldin';
}

// ── RENDER JOB CARD (for seeker with match) ──
function renderJobCard(job, userSkills, showMatch) {
  const score = showMatch ? matchScore(userSkills, job.skills) : null;
  const matched = showMatch ? getMatchedSkills(userSkills, job.skills) : [];
  const matchedSet = new Set(matched.map(s => s.toLowerCase()));
  const badgeClass = score !== null && score >= 50 ? 'match-badge' : 'match-badge low';

  const skillsHTML = job.skills.map(s =>
    `<span class="skill-tag ${matchedSet.has(s.toLowerCase()) ? 'matched' : ''}">${s}</span>`
  ).join('');

  const hasApplied = currentUser && currentUser.role === 'seeker'
    ? DB.getArr('applications').some(a => a.jobId === job.id && a.seekerId === currentUser.id)
    : false;

  let actionsHTML = '';
  if (!currentUser) {
    actionsHTML = `<button class="btn-primary btn-sm" onclick="navigate('login')">Kirish kerak</button>`;
  } else if (currentUser.role === 'seeker') {
    actionsHTML = hasApplied
      ? `<span class="status-badge status-pending">Ariza yuborilgan ✓</span>`
      : `<button class="btn-primary btn-sm" onclick="applyJob('${job.id}')">Ariza yuborish</button>`;
  } else if (currentUser.role === 'employer' && job.employerId === currentUser.id) {
    const appCount = DB.getArr('applications').filter(a => a.jobId === job.id).length;
    actionsHTML = `
      <button class="btn-outline btn-sm" onclick="navigate('applications','${job.id}')">📋 Arizalar (${appCount})</button>
      <button class="btn-outline btn-sm" onclick="editJob('${job.id}')">✏️ Tahrir</button>
      <button class="btn-danger btn-sm" onclick="deleteJob('${job.id}')">🗑️</button>`;
  }

  return `
    <div class="job-card" onclick="openJobDetail('${job.id}')">
      <div class="job-card-header">
        <div>
          <div class="job-title">${job.title}</div>
          <div class="job-company">${job.company}</div>
        </div>
        ${score !== null ? `<span class="${badgeClass}">${score}% mos</span>` : ''}
      </div>
      <div class="job-meta">
        <span class="meta-pill ${locationClass(job.location)}">${locationLabel(job.location)}</span>
        <span class="meta-pill">💰 ${job.salary}</span>
        ${job.deadline ? `<span class="meta-pill">📅 ${job.deadline}</span>` : ''}
      </div>
      <div class="skills-wrap">${skillsHTML}</div>
      <div class="job-footer">
        <span class="job-date">${timeAgo(job.createdAt)}</span>
      </div>
      <div class="job-actions" onclick="event.stopPropagation()">${actionsHTML}</div>
    </div>`;
}

// ── JOB PAGES ──
function renderJobsPage() {
  const jobs = DB.getArr('jobs');
  const addBtn = document.getElementById('addJobBtn');
  if (addBtn) addBtn.style.display = (currentUser && currentUser.role === 'employer') ? 'inline-flex' : 'none';
  filterJobs();
}

function filterJobs() {
  const query = (document.getElementById('jobSearch')?.value || '').toLowerCase().trim();
  const locFilter = document.getElementById('locationFilter')?.value || '';
  let jobs = DB.getArr('jobs');

  if (query) {
    jobs = jobs.filter(j =>
      j.title.toLowerCase().includes(query) ||
      j.company.toLowerCase().includes(query) ||
      j.skills.some(s => s.toLowerCase().includes(query))
    );
  }
  if (locFilter) jobs = jobs.filter(j => j.location === locFilter);

  const userSkills = currentUser?.skills || [];
  const showMatch = !!(currentUser && currentUser.role === 'seeker' && userSkills.length > 0);

  const el = document.getElementById('jobsList');
  if (!el) return;
  if (jobs.length === 0) {
    el.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">🔍</div><h3>Hech narsa topilmadi</h3><p>Qidiruv so'rovini o'zgartiring</p></div>`;
    return;
  }
  el.innerHTML = jobs.map(j => renderJobCard(j, userSkills, showMatch)).join('');
}

// ── HOME DASHBOARD ──
function renderHomeDashboards() {
  const seekerEl = document.getElementById('seekerDashboard');
  const employerEl = document.getElementById('employerDashboard');
  const guestEl = document.getElementById('guestHome');

  seekerEl.style.display = 'none';
  employerEl.style.display = 'none';
  guestEl.style.display = 'none';

  // Update stats
  const jobs = DB.getArr('jobs');
  const users = DB.getArr('users');
  document.getElementById('statJobs').textContent = jobs.length;
  document.getElementById('statUsers').textContent = users.length;

  if (!currentUser) { guestEl.style.display = 'block'; return; }

  if (currentUser.role === 'seeker') {
    seekerEl.style.display = 'block';
    renderMatchedJobs();
  } else {
    employerEl.style.display = 'block';
    renderMyJobs();
  }
}

function renderMatchedJobs() {
  const el = document.getElementById('matchedJobs');
  const userSkills = currentUser?.skills || [];
  if (userSkills.length === 0) {
    el.innerHTML = `<div class="alert-info" style="grid-column:1/-1">
      <div style="font-size:2rem;margin-bottom:12px">💡</div>
      <strong>Skillaringizni profilingizga qo'shing!</strong>
      <p style="margin-top:8px">Sizga mos ish o'rinlarini ko'rsatish uchun ro'yxatdan o'tishda skill qo'shishingiz kerak edi. Yangi hisob yarating yoki <a href="#" onclick="navigate('jobs')">barcha e'lonlarni ko'ring</a>.</p>
    </div>`;
    return;
  }

  const jobs = DB.getArr('jobs');
  const scored = jobs
    .map(j => ({ ...j, score: matchScore(userSkills, j.skills) }))
    .sort((a, b) => b.score - a.score);

  el.innerHTML = scored.map(j => renderJobCard(j, userSkills, true)).join('');
}

function renderMyJobs() {
  const el = document.getElementById('myJobsList');
  const jobs = DB.getArr('jobs').filter(j => j.employerId === currentUser.id);
  if (jobs.length === 0) {
    el.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
      <div class="empty-icon">📋</div>
      <h3>E'lonlar yo'q</h3>
      <p>Birinchi ish e'lonini qo'shing</p>
      <button class="btn-primary" style="margin-top:16px" onclick="navigate('post-job')">+ E'lon qo'shish</button>
    </div>`;
    return;
  }
  el.innerHTML = jobs.map(j => renderJobCard(j, [], false)).join('');
}

// ── JOB DETAIL ──
function openJobDetail(jobId) {
  navigate('job-detail', jobId);
}

function renderJobDetail(jobId) {
  const job = DB.findById('jobs', jobId);
  const el = document.getElementById('jobDetailContent');
  if (!job) { el.innerHTML = '<p>E\'lon topilmadi.</p>'; return; }

  const userSkills = currentUser?.skills || [];
  const score = (currentUser && currentUser.role === 'seeker' && userSkills.length > 0)
    ? matchScore(userSkills, job.skills) : null;

  const hasApplied = currentUser && currentUser.role === 'seeker'
    ? DB.getArr('applications').some(a => a.jobId === job.id && a.seekerId === currentUser.id)
    : false;

  let actionBtn = '';
  if (!currentUser) {
    actionBtn = `<button class="btn-primary" onclick="navigate('login')">Ariza yuborish uchun kiring</button>`;
  } else if (currentUser.role === 'seeker') {
    actionBtn = hasApplied
      ? `<span class="status-badge status-pending" style="padding:10px 20px;font-size:.9rem">✓ Ariza yuborilgan</span>`
      : `<button class="btn-primary" onclick="applyJob('${job.id}')">🚀 Ariza yuborish</button>`;
  } else if (currentUser.id === job.employerId) {
    const appCount = DB.getArr('applications').filter(a => a.jobId === job.id).length;
    actionBtn = `
      <button class="btn-primary" onclick="navigate('applications','${job.id}')">📋 Arizalar (${appCount})</button>
      <button class="btn-outline" onclick="editJob('${job.id}')">✏️ Tahrirlash</button>
      <button class="btn-danger" onclick="deleteJob('${job.id}')">🗑️ O'chirish</button>`;
  }

  el.innerHTML = `
    <div class="job-detail-card">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:16px;margin-bottom:20px">
        <div>
          <div class="job-detail-title">${job.title}</div>
          <div class="job-detail-company">${job.company}</div>
        </div>
        ${score !== null ? `<span class="match-badge ${score>=50?'':'low'}" style="font-size:1rem;padding:8px 18px">${score}% mos</span>` : ''}
      </div>
      <div class="job-meta" style="margin-bottom:20px">
        <span class="meta-pill ${locationClass(job.location)}">${locationLabel(job.location)}</span>
        <span class="meta-pill">💰 ${job.salary}</span>
        ${job.deadline ? `<span class="meta-pill">📅 ${job.deadline}</span>` : ''}
      </div>
      <hr class="section-divider">
      <h3 style="font-weight:700;margin-bottom:12px">Talab qilinadigan skilllar</h3>
      <div class="skills-wrap" style="margin-bottom:20px">
        ${job.skills.map(s => {
          const isMatched = userSkills.map(u=>u.toLowerCase()).includes(s.toLowerCase());
          return `<span class="skill-tag ${isMatched?'matched':''}">${s}${isMatched?' ✓':''}</span>`;
        }).join('')}
      </div>
      <hr class="section-divider">
      <h3 style="font-weight:700;margin-bottom:12px">Batafsil ma'lumot</h3>
      <div class="job-desc">${job.description || 'Tavsif kiritilmagan.'}</div>
      <hr class="section-divider">
      <div style="display:flex;gap:12px;flex-wrap:wrap">${actionBtn}</div>
    </div>`;
}

// ── APPLY ──
function applyJob(jobId) {
  if (!currentUser || currentUser.role !== 'seeker') { navigate('login'); return; }
  const apps = DB.getArr('applications');
  if (apps.some(a => a.jobId === jobId && a.seekerId === currentUser.id)) {
    showToast('Siz allaqachon ariza yuborgansiz!', 'error'); return;
  }
  const job = DB.findById('jobs', jobId);
  DB.push('applications', {
    id: uid(), jobId, seekerId: currentUser.id,
    seekerName: currentUser.name, seekerEmail: currentUser.email,
    seekerSkills: currentUser.skills || [],
    status: 'pending', createdAt: new Date().toISOString()
  });
  showToast('Ariza muvaffaqiyatli yuborildi! 🎉', 'success');
  // Re-render current page
  const activePage = document.querySelector('.page.active')?.id;
  if (activePage === 'page-job-detail') renderJobDetail(jobId);
  if (activePage === 'page-home') renderMatchedJobs();
  if (activePage === 'page-jobs') filterJobs();
}

// ── POST / EDIT JOB ──
function renderPostJobPage(editId) {
  jobSkills = [];
  document.getElementById('editJobId').value = '';
  document.getElementById('jobTitle').value = '';
  document.getElementById('jobSalary').value = '';
  document.getElementById('jobLocation').value = 'remote';
  document.getElementById('jobDeadline').value = '';
  document.getElementById('jobDesc').value = '';
  document.getElementById('jobSkillChips').innerHTML = '';
  document.getElementById('postJobTitle').textContent = 'Yangi E\'lon';

  if (editId) {
    const job = DB.findById('jobs', editId);
    if (!job || job.employerId !== currentUser?.id) return;
    jobSkills = [...(job.skills || [])];
    document.getElementById('editJobId').value = editId;
    document.getElementById('jobTitle').value = job.title;
    document.getElementById('jobSalary').value = job.salary;
    document.getElementById('jobLocation').value = job.location;
    document.getElementById('jobDeadline').value = job.deadline || '';
    document.getElementById('jobDesc').value = job.description || '';
    document.getElementById('postJobTitle').textContent = 'E\'lonni Tahrirlash';
    renderSkillChips('jobSkillChips', jobSkills, removeJobSkill);
  }
}

function editJob(jobId) {
  navigate('post-job', jobId);
}

function saveJob() {
  if (!currentUser || currentUser.role !== 'employer') { showToast('Ruxsat yo\'q!', 'error'); return; }
  const title = document.getElementById('jobTitle').value.trim();
  const salary = document.getElementById('jobSalary').value.trim();
  const location = document.getElementById('jobLocation').value;
  const deadline = document.getElementById('jobDeadline').value;
  const desc = document.getElementById('jobDesc').value.trim();
  const editId = document.getElementById('editJobId').value;

  if (!title || !salary) { showToast('Sarlavha va maosh kiritilishi shart!', 'error'); return; }
  if (jobSkills.length === 0) { showToast('Kamida 1 ta skill kiriting!', 'error'); return; }

  if (editId) {
    DB.update('jobs', editId, { title, salary, location, deadline, description: desc, skills: jobSkills });
    showToast('E\'lon yangilandi! ✅', 'success');
  } else {
    DB.push('jobs', {
      id: uid(), employerId: currentUser.id,
      company: currentUser.company || currentUser.name,
      title, salary, location, deadline, description: desc,
      skills: jobSkills, createdAt: new Date().toISOString()
    });
    showToast('E\'lon muvaffaqiyatli qo\'shildi! 🎉', 'success');
  }
  jobSkills = [];
  navigate('home');
}

function deleteJob(jobId) {
  if (!confirm('E\'lonni o\'chirishni tasdiqlaysizmi?')) return;
  DB.remove('jobs', jobId);
  // also remove related apps
  const apps = DB.getArr('applications').filter(a => a.jobId !== jobId);
  DB.set('applications', apps);
  showToast('E\'lon o\'chirildi', 'success');
  navigate('home');
}

// ── APPLICATIONS (employer view) ──
function renderApplicationsPage(jobId) {
  const el = document.getElementById('applicationsList');
  const apps = DB.getArr('applications').filter(a => a.jobId === jobId);
  const job = DB.findById('jobs', jobId);

  if (!el) return;
  if (!job) { el.innerHTML = '<p>E\'lon topilmadi.</p>'; return; }

  document.querySelector('#page-applications .page-title').textContent = `"${job.title}" — Arizalar`;

  if (apps.length === 0) {
    el.innerHTML = `<div class="empty-state"><div class="empty-icon">📭</div><h3>Arizalar yo'q</h3><p>Hali hech kim ariza yuborishmagan</p></div>`;
    return;
  }

  el.innerHTML = apps.map(app => `
    <div class="app-card" id="appcard-${app.id}">
      <div class="profile-avatar" style="width:50px;height:50px;font-size:1.2rem">${app.seekerName.charAt(0)}</div>
      <div class="app-info">
        <div class="app-name">${app.seekerName}</div>
        <div class="app-detail">${app.seekerEmail}</div>
        <div class="skills-wrap" style="margin-top:6px">
          ${(app.seekerSkills||[]).map(s=>`<span class="skill-tag">${s}</span>`).join('')}
        </div>
        <div style="font-size:.78rem;color:var(--gray-500);margin-top:4px">${timeAgo(app.createdAt)}</div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px">
        <span class="status-badge status-${app.status}">${statusLabel(app.status)}</span>
        ${app.status === 'pending' ? `
          <div class="app-actions">
            <button class="btn-success btn-sm" onclick="updateAppStatus('${app.id}','accepted')">✓ Qabul</button>
            <button class="btn-danger btn-sm" onclick="updateAppStatus('${app.id}','rejected')">✗ Rad</button>
          </div>` : ''}
      </div>
    </div>`).join('');
}

function updateAppStatus(appId, status) {
  DB.update('applications', appId, { status });
  const app = DB.findById('applications', appId);
  if (app) {
    const card = document.getElementById('appcard-' + appId);
    if (card) {
      const badge = card.querySelector('.status-badge');
      if (badge) { badge.className = `status-badge status-${status}`; badge.textContent = statusLabel(status); }
      const actionsDiv = card.querySelector('.app-actions');
      if (actionsDiv) actionsDiv.remove();
    }
  }
  showToast(status === 'accepted' ? 'Ariza qabul qilindi ✓' : 'Ariza rad etildi', status === 'accepted' ? 'success' : 'error');
}

// ── MY APPLICATIONS (seeker view) ──
function renderMyApplications() {
  const el = document.getElementById('myApplicationsList');
  if (!el || !currentUser) return;
  const apps = DB.getArr('applications').filter(a => a.seekerId === currentUser.id);
  if (apps.length === 0) {
    el.innerHTML = `<div class="empty-state"><div class="empty-icon">📄</div><h3>Arizalar yo'q</h3><p>Hali hech qanday ish o'rniga ariza bermadingiz</p><button class="btn-primary" style="margin-top:16px" onclick="navigate('jobs')">E'lonlarni ko'rish</button></div>`;
    return;
  }
  el.innerHTML = apps.map(app => {
    const job = DB.findById('jobs', app.jobId);
    if (!job) return '';
    return `<div class="app-card">
      <div class="app-info">
        <div class="app-name">${job.title}</div>
        <div class="app-detail">${job.company} · ${locationLabel(job.location)}</div>
        <div style="font-size:.78rem;color:var(--gray-500);margin-top:4px">Yuborilgan: ${timeAgo(app.createdAt)}</div>
      </div>
      <span class="status-badge status-${app.status}">${statusLabel(app.status)}</span>
    </div>`;
  }).join('');
}
