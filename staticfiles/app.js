// ============================================================
// APP.JS — Router, navigation, toasts
// ============================================================

let _currentJobId = null;
let _toastTimer = null;

// ── ROUTER ──
function navigate(page, param) {
  _currentJobId = param || null;

  // Hide all pages
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

  // Activate target
  const el = document.getElementById('page-' + page);
  if (!el) return;
  el.classList.add('active');

  // Update nav active state
  document.querySelectorAll('.nav-link').forEach(l => {
    l.classList.toggle('active', l.dataset.page === page);
  });

  // Close mobile menu
  document.getElementById('navLinks')?.classList.remove('open');

  // Run page init
  switch (page) {
    case 'home':          renderHomeDashboards(); break;
    case 'jobs':          renderJobsPage(); break;
    case 'learn':         renderLearnPage(); break;
    case 'profile':       renderProfilePage(); break;
    case 'post-job':
      if (!currentUser || currentUser.role !== 'employer') { navigate('login'); return; }
      renderPostJobPage(param);
      break;
    case 'job-detail':    renderJobDetail(param); break;
    case 'applications':
      if (!currentUser || currentUser.role !== 'employer') { navigate('login'); return; }
      renderApplicationsPage(param);
      break;
    case 'my-applications':
      if (!currentUser || currentUser.role !== 'seeker') { navigate('login'); return; }
      renderMyApplications();
      break;
    case 'login':
      document.getElementById('loginEmail').value = '';
      document.getElementById('loginPassword').value = '';
      document.getElementById('loginError').style.display = 'none';
      if (currentUser) { navigate('home'); return; }
      break;
    case 'register':
      if (currentUser) { navigate('home'); return; }
      regSkills = [];
      selectedRole = 'seeker';
      selectRole('seeker');
      document.getElementById('registerError').style.display = 'none';
      break;
  }

  // Scroll top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── TOAST ──
function showToast(msg, type) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = 'toast show' + (type ? ' ' + type : '');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => { toast.classList.remove('show'); }, 3000);
}

// ── HAMBURGER ──
function toggleMenu() {
  document.getElementById('navLinks')?.classList.toggle('open');
}

// ── INIT ──
document.addEventListener('DOMContentLoaded', () => {
  initAuth();
  navigate('home');

  // Skill input enter key
  document.getElementById('skillInput')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); addSkillChip(); }
  });
  document.getElementById('jobSkillInput')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); addJobSkillChip(); }
  });
  document.getElementById('learnSearch')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') filterCourses();
  });
});
