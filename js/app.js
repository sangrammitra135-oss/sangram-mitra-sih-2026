/**
 * Sangram-Mitra Core Application Logic
 * Comprehensive Platform Controller & State Management
 */

(function () {
  'use strict';

  // Master State Object
  const state = {
    currentRole: 'student', // 'student' | 'employer' | 'admin'
    currentPage: 'dashboard',
    theme: 'light',
    student: null,
    employer: null,
    admin: null,
    districts: [],
    assessment: {
      currentQuestionIdx: 0,
      userAnswers: {},
      isFinished: false,
      score: 0
    },
    consent: {
      aadhaar: true,
      employer: true,
      retention: true,
      research: true
    }
  };

  // Helper selector functions
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => document.querySelectorAll(selector);

  // Initialize Application
  function initApp() {
    loadStateFromStorage();
    setupWelcomeTimer();
    setupAuthEvents();
    setupNavigation();
    setupThemeToggle();
    setupAssessmentEvents();
    setupProfileEvents();
    setupEmploymentEvents();
    setupEmployerVerificationEvents();
    setupDistrictAnalyticsEvents();
    setupConsentEvents();
    setupModalEvents();

    renderCurrentRoleView();
  }

  // --------------------------------------------------------------------------
  // Storage & State Persistence
  // --------------------------------------------------------------------------
  function loadStateFromStorage() {
    const saved = localStorage.getItem('sangram_mitra_state_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        state.student = parsed.student || JSON.parse(JSON.stringify(MOCK_DATA.roles.student));
        state.employer = parsed.employer || JSON.parse(JSON.stringify(MOCK_DATA.roles.employer));
        state.admin = parsed.admin || JSON.parse(JSON.stringify(MOCK_DATA.roles.admin));
        state.districts = parsed.districts || JSON.parse(JSON.stringify(MOCK_DATA.districts));
        state.theme = parsed.theme || 'light';
        state.consent = parsed.consent || state.consent;
      } catch (e) {
        console.error('Failed to parse saved state, using mock data defaults:', e);
        resetStateToDefaults();
      }
    } else {
      resetStateToDefaults();
    }

    applyTheme(state.theme);
  }

  function resetStateToDefaults() {
    state.student = JSON.parse(JSON.stringify(MOCK_DATA.roles.student));
    state.employer = JSON.parse(JSON.stringify(MOCK_DATA.roles.employer));
    state.admin = JSON.parse(JSON.stringify(MOCK_DATA.roles.admin));
    state.districts = JSON.parse(JSON.stringify(MOCK_DATA.districts));
    saveStateToStorage();
  }

  function saveStateToStorage() {
    localStorage.setItem('sangram_mitra_state_v1', JSON.stringify({
      student: state.student,
      employer: state.employer,
      admin: state.admin,
      districts: state.districts,
      theme: state.theme,
      consent: state.consent
    }));
  }

  // --------------------------------------------------------------------------
  // Welcome Splash Screen Logic
  // --------------------------------------------------------------------------
  let welcomeTimerInterval = null;
  function setupWelcomeTimer() {
    let timeLeft = 5;
    const countdownEl = $('#countdownSec');

    const advanceToAuth = () => {
      if (welcomeTimerInterval) clearInterval(welcomeTimerInterval);
      $('#welcomeScreen').style.display = 'none';
      $('#authScreen').classList.remove('hidden');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    welcomeTimerInterval = setInterval(() => {
      timeLeft--;
      if (countdownEl) countdownEl.textContent = timeLeft;
      if (timeLeft <= 0) {
        advanceToAuth();
      }
    }, 1000);

    $('#enterPortalBtn').addEventListener('click', advanceToAuth);
    $('#directDemoBtn').addEventListener('click', () => {
      if (welcomeTimerInterval) clearInterval(welcomeTimerInterval);
      $('#welcomeScreen').style.display = 'none';
      loginAsRole('student');
    });
  }

  // --------------------------------------------------------------------------
  // Authentication & Role Management
  // --------------------------------------------------------------------------
  function setupAuthEvents() {
    // Role Tab Switching
    $$('.role-tabs button').forEach((btn) => {
      btn.addEventListener('click', () => {
        $$('.role-tabs button').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        state.currentRole = btn.dataset.role;
        updateAuthFormForRole(state.currentRole);
      });
    });

    // 1-Click Demo Buttons in Auth Card
    $('#demoStudentBtn').addEventListener('click', () => loginAsRole('student'));
    $('#demoEmployerBtn').addEventListener('click', () => loginAsRole('employer'));
    $('#demoAdminBtn').addEventListener('click', () => loginAsRole('admin'));

    // Toggle forms
    $('#showRegister').addEventListener('click', () => {
      $('#loginForm').classList.add('hidden');
      $('#registerForm').classList.remove('hidden');
    });
    $('#backLogin').addEventListener('click', () => {
      $('#registerForm').classList.add('hidden');
      $('#loginForm').classList.remove('hidden');
    });

    // Eye Password Toggles
    setupPasswordToggle('#eyeLogin', '#loginPassword');
    setupPasswordToggle('#eyeReg', '#regPassword');
    setupPasswordToggle('#eyeRegConfirm', '#regConfirmPassword');

    // OTP Simulator
    let generatedOtp = '';
    $('#sendOtpBtn').addEventListener('click', () => {
      const phone = $('#regPhone').value.trim();
      if (!/^\d{10}$/.test(phone)) {
        $('#otpMessage').innerHTML = '<span class="error">Please enter a valid 10-digit mobile number.</span>';
        return;
      }
      generatedOtp = String(Math.floor(100000 + Math.random() * 900000));
      $('#otpMessage').innerHTML = `<span class="success">Demo Verification OTP: <b>${generatedOtp}</b> (Valid for 5 mins)</span>`;
      $('#regOtp').value = generatedOtp;
    });

    // Register Button
    $('#registerBtn').addEventListener('click', () => {
      const firstName = $('#regFirstName').value.trim();
      const lastName = $('#regLastName').value.trim();
      const phone = $('#regPhone').value.trim();
      const email = $('#regEmail').value.trim();
      const pass = $('#regPassword').value;
      const confirmPass = $('#regConfirmPassword').value;
      const enteredOtp = $('#regOtp').value.trim();

      if (!firstName || !lastName || !phone || !email || !pass) {
        $('#registerMsg').innerHTML = '<span class="error">All fields are required.</span>';
        return;
      }
      if (pass !== confirmPass) {
        $('#registerMsg').innerHTML = '<span class="error">Passwords do not match.</span>';
        return;
      }
      if (generatedOtp && enteredOtp !== generatedOtp) {
        $('#registerMsg').innerHTML = '<span class="error">Invalid OTP entered.</span>';
        return;
      }

      state.student.name = `${firstName} ${lastName}`;
      state.student.email = email;
      state.student.phone = phone;
      saveStateToStorage();

      $('#registerMsg').innerHTML = '<span class="success">Account created successfully! Redirecting...</span>';
      setTimeout(() => {
        loginAsRole('student');
      }, 700);
    });

    // Login Form Submit
    $('#loginBtn').addEventListener('click', () => {
      const loginId = $('#loginId').value.trim();
      const loginPass = $('#loginPassword').value.trim();

      if (!loginId || !loginPass) {
        $('#loginMsg').innerHTML = '<span class="error">Please provide both Login ID and Password.</span>';
        return;
      }
      loginAsRole(state.currentRole);
    });

    // Topbar Role Switcher dropdown
    $('#roleSwitcherSelect').addEventListener('change', (e) => {
      loginAsRole(e.target.value);
    });

    // Sign out button
    $('#logoutBtn').addEventListener('click', () => {
      $('#app').style.display = 'none';
      $('#authScreen').classList.remove('hidden');
      showToast('Signed out of session');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  function setupPasswordToggle(btnSelector, inputSelector) {
    const btn = $(btnSelector);
    const input = $(inputSelector);
    if (!btn || !input) return;
    btn.addEventListener('click', () => {
      const isPass = input.type === 'password';
      input.type = isPass ? 'text' : 'password';
      btn.textContent = isPass ? '🙈' : '👁️';
    });
  }

  function updateAuthFormForRole(role) {
    const titles = {
      student: 'Student Sign In',
      employer: 'Employer & HR Partner Sign In',
      admin: 'State/District Admin Sign In'
    };
    $('#loginTitle').textContent = titles[role] || 'Sign In';

    if (role === 'student') {
      $('#loginId').value = state.student.email;
      $('#studentSignupArea').style.display = 'block';
    } else if (role === 'employer') {
      $('#loginId').value = state.employer.email;
      $('#studentSignupArea').style.display = 'none';
      $('#registerForm').classList.add('hidden');
      $('#loginForm').classList.remove('hidden');
    } else if (role === 'admin') {
      $('#loginId').value = 'srinivas.rao@apssdc.gov.in';
      $('#studentSignupArea').style.display = 'none';
      $('#registerForm').classList.add('hidden');
      $('#loginForm').classList.remove('hidden');
    }
  }

  function loginAsRole(role) {
    state.currentRole = role;
    $('#authScreen').classList.add('hidden');
    $('#app').style.display = 'block';

    // Sync topbar dropdown
    $('#roleSwitcherSelect').value = role;

    renderCurrentRoleView();
    showToast(`Logged in as ${getRoleDisplayName(role)}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function getRoleDisplayName(role) {
    if (role === 'student') return `Student: ${state.student.name}`;
    if (role === 'employer') return `Employer: ${state.employer.name}`;
    return `Admin: ${state.admin.name}`;
  }

  // --------------------------------------------------------------------------
  // Navigation Router
  // --------------------------------------------------------------------------
  function setupNavigation() {
    $$('#sidebarNav button[data-page]').forEach((btn) => {
      btn.addEventListener('click', () => {
        navigateTo(btn.dataset.page);
      });
    });
  }

  function navigateTo(pageId) {
    state.currentPage = pageId;

    // Update active page container
    $$('.page-view').forEach((p) => p.classList.remove('active'));
    const targetPage = $(`#${pageId}`);
    if (targetPage) {
      targetPage.classList.add('active');
    }

    // Update sidebar buttons
    $$('#sidebarNav button[data-page]').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.page === pageId);
    });

    // Refresh views if needed
    if (pageId === 'dashboard') renderDashboard();
    if (pageId === 'skillgap') renderSkillGap();
    if (pageId === 'training') renderTraining();
    if (pageId === 'employment') renderEmployment();
    if (pageId === 'verification') renderVerification();
    if (pageId === 'followup') renderFollowup();
    if (pageId === 'why') renderWhyNotPlaced();
    if (pageId === 'analytics') renderDistrictAnalytics();
    if (pageId === 'recommend') renderJobRecommendations();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // --------------------------------------------------------------------------
  // Theme Toggle (All Screens: Welcome, Auth, and Dashboard)
  // --------------------------------------------------------------------------
  function setupThemeToggle() {
    const toggleTheme = () => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      applyTheme(state.theme);
      saveStateToStorage();
      showToast(`Switched to ${state.theme.toUpperCase()} mode`);
    };

    ['#themeToggleBtn', '#welcomeThemeToggleBtn', '#authThemeToggleBtn'].forEach((selector) => {
      const btn = $(selector);
      if (btn) {
        btn.addEventListener('click', toggleTheme);
      }
    });
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const icon = theme === 'light' ? '🌓' : '☀️';
    ['#themeToggleBtn', '#welcomeThemeToggleBtn', '#authThemeToggleBtn'].forEach((selector) => {
      const btn = $(selector);
      if (btn) btn.textContent = icon;
    });
  }

  // --------------------------------------------------------------------------
  // Persona & Role Customization Renderer
  // --------------------------------------------------------------------------
  function renderCurrentRoleView() {
    const role = state.currentRole;
    const badgeEl = $('#sidebarRoleBadge');
    const nameEl = $('#topbarUserName');
    const avatarEl = $('#userAvatarBadge');

    if (role === 'student') {
      badgeEl.textContent = '🎓 Student Portal';
      nameEl.textContent = state.student.name;
      avatarEl.textContent = getInitials(state.student.name);
      navigateTo('dashboard');
    } else if (role === 'employer') {
      badgeEl.textContent = '🏢 Employer Portal';
      nameEl.textContent = state.employer.contactPerson;
      avatarEl.textContent = 'HR';
      navigateTo('verification');
    } else if (role === 'admin') {
      badgeEl.textContent = '🛡️ Govt Admin Portal';
      nameEl.textContent = state.admin.name;
      avatarEl.textContent = 'AD';
      navigateTo('analytics');
    }
  }

  function getInitials(name) {
    if (!name) return 'SM';
    const parts = name.split(' ');
    return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
  }

  // --------------------------------------------------------------------------
  // Dashboard Renderer
  // --------------------------------------------------------------------------
  function renderDashboard() {
    const stu = state.student;

    // Recalculate average skill score
    const skillValues = Object.values(stu.skills);
    const avgScore = Math.round(skillValues.reduce((a, b) => a + b, 0) / skillValues.length);
    stu.skillScore = avgScore;

    $('#dashSkillScore').textContent = `${stu.skillScore}/100`;
    $('#dashCoursesCount').textContent = `${stu.courses.length} Active`;
    $('#dashEmpStatus').textContent = stu.employmentStatus;

    // Render Skill List
    const skillsContainer = $('#dashSkillsList');
    skillsContainer.innerHTML = '';
    Object.entries(stu.skills).forEach(([skillName, score]) => {
      const row = document.createElement('div');
      row.className = 'metric-row';
      row.innerHTML = `
        <div style="flex:1; margin-right:15px;">
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
            <b>${skillName}</b>
            <span style="font-weight:700; color:${getScoreColor(score)};">${score}%</span>
          </div>
          <div class="progress-container" style="margin:0;">
            <div class="progress-fill" style="width: ${score}%; background:${getScoreGradient(score)};"></div>
          </div>
        </div>
      `;
      skillsContainer.appendChild(row);
    });

    // Render Mini Courses
    const courseContainer = $('#dashCourseMiniList');
    courseContainer.innerHTML = '';
    stu.courses.forEach((c) => {
      const box = document.createElement('div');
      box.className = 'metric-row';
      box.innerHTML = `
        <div style="flex:1;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <b style="font-size:13px;">${c.title}</b>
            <span class="badge ${c.progress >= 70 ? 'blue' : 'orange'}">${c.progress}%</span>
          </div>
          <small style="color:var(--text-muted);">${c.provider} &bull; ${c.duration}</small>
        </div>
      `;
      courseContainer.appendChild(box);
    });
  }

  function getScoreColor(score) {
    if (score >= 75) return '#059669';
    if (score >= 60) return '#2563eb';
    if (score >= 45) return '#d97706';
    return '#dc2626';
  }

  function getScoreGradient(score) {
    if (score >= 75) return 'linear-gradient(90deg, #10b981, #059669)';
    if (score >= 60) return 'linear-gradient(90deg, #38bdf8, #2563eb)';
    if (score >= 45) return 'linear-gradient(90deg, #fbbf24, #f59e0b)';
    return 'linear-gradient(90deg, #f87171, #dc2626)';
  }

  // --------------------------------------------------------------------------
  // Profile Controller
  // --------------------------------------------------------------------------
  function setupProfileEvents() {
    $('#saveProfileBtn').addEventListener('click', () => {
      state.student.name = $('#profName').value.trim();
      state.student.email = $('#profEmail').value.trim();
      state.student.phone = $('#profPhone').value.trim();
      state.student.targetRole = $('#profTargetRole').value;
      state.student.district = $('#profDistrict').value;
      state.student.college = $('#profCollege').value.trim();
      state.student.education = $('#profEducation').value.trim();
      state.student.gradYear = Number($('#profGradYear').value);

      saveStateToStorage();
      renderDashboard();
      showToast('Candidate profile updated & cryptographic credential re-signed!');
    });
  }

  // --------------------------------------------------------------------------
  // Skill Assessment Quiz Engine
  // --------------------------------------------------------------------------
  function setupAssessmentEvents() {
    $('#startQuizBtn').addEventListener('click', startAssessment);
    $('#quizNextBtn').addEventListener('click', handleNextQuizQuestion);
    $('#quizPrevBtn').addEventListener('click', handlePrevQuizQuestion);
    $('#retakeQuizBtn').addEventListener('click', startAssessment);
  }

  function startAssessment() {
    state.assessment.currentQuestionIdx = 0;
    state.assessment.userAnswers = {};
    state.assessment.isFinished = false;

    $('#quizStartView').classList.add('hidden');
    $('#quizResultView').classList.add('hidden');
    $('#quizActiveView').classList.remove('hidden');

    renderQuizQuestion();
  }

  function renderQuizQuestion() {
    const qIdx = state.assessment.currentQuestionIdx;
    const questions = MOCK_DATA.assessmentQuestions;
    const currentQ = questions[qIdx];

    $('#quizProgressLabel').textContent = `Question ${qIdx + 1} of ${questions.length}`;
    $('#quizCategoryBadge').textContent = currentQ.category;
    $('#quizQuestionText').textContent = currentQ.question;

    const optContainer = $('#quizOptionsContainer');
    optContainer.innerHTML = '';

    currentQ.options.forEach((optText, optIdx) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-option-btn';
      if (state.assessment.userAnswers[currentQ.id] === optIdx) {
        btn.classList.add('selected');
      }

      btn.innerHTML = `
        <span style="display:inline-block; width:24px; height:24px; border-radius:50%; background:rgba(148,163,184,0.2); text-align:center; line-height:24px; font-size:12px;">
          ${String.fromCharCode(65 + optIdx)}
        </span>
        <span>${optText}</span>
      `;

      btn.addEventListener('click', () => {
        state.assessment.userAnswers[currentQ.id] = optIdx;
        $$('.quiz-option-btn').forEach((b) => b.classList.remove('selected'));
        btn.classList.add('selected');

        // Show instant explanation feedback
        const explBox = $('#quizExplanationBox');
        explBox.classList.remove('hidden');
        $('#quizExplanationText').innerHTML = `<b>Correct answer:</b> ${currentQ.options[currentQ.correct]}<br><small>${currentQ.explanation}</small>`;
      });

      optContainer.appendChild(btn);
    });

    // Toggle Previous button
    $('#quizPrevBtn').disabled = qIdx === 0;

    // Update Next / Submit button text
    $('#quizNextBtn').textContent = qIdx === questions.length - 1 ? 'Submit Assessment &rarr;' : 'Next Question &rarr;';

    // Hide explanation if question wasn't answered yet
    if (state.assessment.userAnswers[currentQ.id] === undefined) {
      $('#quizExplanationBox').classList.add('hidden');
    }
  }

  function handleNextQuizQuestion() {
    const qIdx = state.assessment.currentQuestionIdx;
    const questions = MOCK_DATA.assessmentQuestions;

    if (qIdx < questions.length - 1) {
      state.assessment.currentQuestionIdx++;
      renderQuizQuestion();
    } else {
      finishAssessment();
    }
  }

  function handlePrevQuizQuestion() {
    if (state.assessment.currentQuestionIdx > 0) {
      state.assessment.currentQuestionIdx--;
      renderQuizQuestion();
    }
  }

  function finishAssessment() {
    const questions = MOCK_DATA.assessmentQuestions;
    let correctCount = 0;

    // Category tracking to recalculate student skills
    const categoryScores = {};

    questions.forEach((q) => {
      const userAns = state.assessment.userAnswers[q.id];
      const isCorrect = userAns === q.correct;
      if (isCorrect) correctCount++;

      if (!categoryScores[q.category]) {
        categoryScores[q.category] = { correct: 0, total: 0 };
      }
      categoryScores[q.category].total++;
      if (isCorrect) categoryScores[q.category].correct++;
    });

    const scorePct = Math.round((correctCount / questions.length) * 100);
    state.assessment.score = scorePct;
    state.assessment.isFinished = true;

    // Recalibrate student skill state
    Object.entries(categoryScores).forEach(([cat, data]) => {
      const catPct = Math.round((data.correct / data.total) * 100);
      if (state.student.skills[cat] !== undefined) {
        state.student.skills[cat] = Math.round((state.student.skills[cat] + catPct) / 2);
      }
    });

    saveStateToStorage();

    // Show Results View
    $('#quizActiveView').classList.add('hidden');
    $('#quizResultView').classList.remove('hidden');

    const ringCircle = $('#resultRingCircle');
    ringCircle.style.setProperty('--score-pct', `${scorePct}%`);
    ringCircle.setAttribute('data-score', `${scorePct}%`);

    $('#quizResultDetails').innerHTML = `
      <div class="metric-row">
        <span>Correct Responses:</span>
        <b>${correctCount} / ${questions.length} Questions</b>
      </div>
      <div class="metric-row">
        <span>Verified AI Skill Level:</span>
        <b style="color:#059669;">${scorePct >= 70 ? 'Advanced Employability' : 'Intermediate (Needs Gap Plan)'}</b>
      </div>
      <div class="metric-row">
        <span>Digest Hash:</span>
        <code>0x9C33F1...21F0A</code>
      </div>
    `;

    showToast(`Assessment submitted! Score: ${scorePct}%`);
  }

  // --------------------------------------------------------------------------
  // AI Skill-Gap Detector
  // --------------------------------------------------------------------------
  function renderSkillGap() {
    const targetRole = $('#gapTargetRoleSelect').value || state.student.targetRole;
    const benchmark = MOCK_DATA.benchmarks[targetRole] || MOCK_DATA.benchmarks["Junior Data & AI Engineer"];
    const candidateSkills = state.student.skills;

    const tbody = $('#skillGapTableBody');
    tbody.innerHTML = '';

    let maxGapSkill = '';
    let maxGapVal = 0;

    Object.entries(benchmark).forEach(([skill, targetScore]) => {
      const candidateScore = candidateSkills[skill] !== undefined ? candidateSkills[skill] : 40;
      const delta = candidateScore - targetScore;

      if (delta < maxGapVal) {
        maxGapVal = delta;
        maxGapSkill = skill;
      }

      let statusBadge = '';
      if (delta >= 0) {
        statusBadge = '<span class="badge">Benchmark Met</span>';
      } else if (delta >= -15) {
        statusBadge = '<span class="badge orange">Moderate Gap</span>';
      } else {
        statusBadge = '<span class="badge rose">Critical Deficit</span>';
      }

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><b>${skill}</b></td>
        <td><span style="font-weight:700; color:${getScoreColor(candidateScore)};">${candidateScore}%</span></td>
        <td>${targetScore}%</td>
        <td><b style="color:${delta >= 0 ? '#059669' : '#dc2626'};">${delta >= 0 ? '+' + delta : delta}%</b></td>
        <td>${statusBadge}</td>
      `;
      tbody.appendChild(tr);
    });

    $('#gapAiSummaryText').innerHTML = `
      <b>Target Role: ${targetRole}</b><br>
      Candidate meets or exceeds benchmark in <b>Python</b> and <b>Git</b>. Primary critical gap lies in <b>${maxGapSkill || 'SQL & Data Modeling'} (${Math.abs(maxGapVal)}% below required benchmark)</b>. Bridging this specific deficit boosts your verified job matching rate to <b>92%</b>.
    `;

    $('#gapTargetRoleSelect').onchange = (e) => {
      renderSkillGap();
    };

    $('#exportPassportBtn').onclick = () => {
      openModal(
        '📄 Candidate Verified Skill Passport',
        `
          <div style="text-align:center; margin-bottom:15px;">
            <img src="assets/logo.svg" alt="Sangram-Mitra Official Logo" style="width:72px; height:72px; margin-bottom:6px;">
            <h3 style="margin-top:2px;">Government of Andhra Pradesh &bull; APSSDC</h3>
            <p style="color:var(--text-muted); font-size:12px;">Verified Digital Skill Passport &amp; Outcome Transcript</p>
          </div>
          <div class="metric-row"><span>Candidate Name:</span><b>${state.student.name}</b></div>
          <div class="metric-row"><span>Student ID:</span><b>${state.student.id}</b></div>
          <div class="metric-row"><span>Overall Skill Score:</span><b>${state.student.skillScore}/100</b></div>
          <div class="metric-row"><span>Target Competency:</span><b>${targetRole}</b></div>
          <div class="metric-row"><span>Verification Ledger Hash:</span><code>0x8F9C2B4E1D780299AC31</code></div>
          <div class="callout-box" style="margin-top:15px;">
            <span class="callout-icon">✅</span>
            <p>This digital passport is cryptographically signed and valid for direct placement across 180+ partner employer portals.</p>
          </div>
        `
      );
    };
  }

  // --------------------------------------------------------------------------
  // Training & Course Tracking
  // --------------------------------------------------------------------------
  function renderTraining() {
    const tbody = $('#coursesTableBody');
    tbody.innerHTML = '';

    state.student.courses.forEach((c, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><b>${c.title}</b><br><small class="badge blue">${c.badge}</small></td>
        <td>${c.provider}</td>
        <td>${c.duration}</td>
        <td style="min-width:140px;">
          <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:3px;">
            <span>Progress</span><b>${c.progress}%</b>
          </div>
          <div class="progress-container" style="margin:0;">
            <div class="progress-fill" style="width: ${c.progress}%;"></div>
          </div>
        </td>
        <td><span class="badge ${c.progress >= 70 ? '' : 'orange'}">${c.status}</span></td>
        <td>
          <button class="btn-secondary" style="padding:6px 12px; font-size:12px;" onclick="app.advanceCourseProgress(${idx})">
            ${c.progress >= 100 ? '✓ Completed' : 'Resume +15%'}
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    $('#browseCoursesBtn').onclick = () => {
      openModal(
        '📚 Explore Accredited Skill India & APSSDC Courses',
        `
          <p style="color:var(--text-muted); margin-bottom:15px;">Select a course to add directly to your personalized gap-bridging roadmap:</p>
          <div class="card" style="margin-bottom:10px; background:rgba(241,245,249,0.5);">
            <b>Cloud Architect & Kubernetes in Production</b><br>
            <small style="color:var(--text-muted);">NASSCOM FutureSkills &bull; 45 Hours</small>
            <button class="btn-primary" style="width:auto; margin-top:8px; padding:6px 14px;" onclick="app.addNewCourse('Cloud Architect & Kubernetes', 'NASSCOM FutureSkills', '45 Hours')">Enroll Now</button>
          </div>
          <div class="card" style="margin-bottom:10px; background:rgba(241,245,249,0.5);">
            <b>Enterprise Spring Boot & Microservices</b><br>
            <small style="color:var(--text-muted);">Skill India Digital &bull; 60 Hours</small>
            <button class="btn-primary" style="width:auto; margin-top:8px; padding:6px 14px;" onclick="app.addNewCourse('Enterprise Spring Boot', 'Skill India Digital', '60 Hours')">Enroll Now</button>
          </div>
        `
      );
    };
  }

  function advanceCourseProgress(idx) {
    const course = state.student.courses[idx];
    if (!course) return;

    course.progress = Math.min(100, course.progress + 15);
    if (course.progress >= 100) {
      course.status = 'Completed';
    }
    saveStateToStorage();
    renderTraining();
    renderDashboard();
    showToast(`Progress updated for ${course.title} (+15%)`);
  }

  function addNewCourse(title, provider, duration) {
    state.student.courses.push({
      id: `C${100 + state.student.courses.length + 1}`,
      title,
      provider,
      duration,
      progress: 10,
      status: 'In Progress',
      badge: 'Skill Gap Plan'
    });
    saveStateToStorage();
    closeModal();
    renderTraining();
    showToast(`Successfully enrolled in ${title}!`);
  }

  // --------------------------------------------------------------------------
  // Employment Outcome Tracker & Timeline
  // --------------------------------------------------------------------------
  function setupEmploymentEvents() {
    $('#saveEmploymentBtn').addEventListener('click', () => {
      state.student.employmentStatus = $('#empStatusSelect').value;
      state.student.currentCompany = $('#empCompany').value.trim();
      state.student.currentRole = $('#empRole').value.trim();
      state.student.monthlySalary = Number($('#empSalary').value);
      state.student.joiningDate = $('#empJoiningDate').value.trim();

      saveStateToStorage();
      renderDashboard();
      renderEmployment();
      showToast('Employment outcome updated and logged into verification ledger!');
    });
  }

  function renderEmployment() {
    const stu = state.student;
    $('#empStatusSelect').value = stu.employmentStatus;
    $('#empCompany').value = stu.currentCompany;
    $('#empRole').value = stu.currentRole;
    $('#empSalary').value = stu.monthlySalary;
    $('#empJoiningDate').value = stu.joiningDate;

    // Render Timeline
    const timelineContainer = $('#employmentTimelineTrack');
    timelineContainer.innerHTML = `
      <div class="timeline-item verified">
        <b>1. Skilling &amp; Assessment Certified</b><br>
        <small style="color:var(--text-muted);">Python for AI &amp; DSA &bull; APSSDC Hub &bull; 15 Jul 2026</small>
      </div>
      <div class="timeline-item verified">
        <b>2. Campus Interview &amp; Selection</b><br>
        <small style="color:var(--text-muted);">${stu.currentCompany} &bull; 22 Jul 2026</small>
      </div>
      <div class="timeline-item verified">
        <b>3. Confirmed Job Offer</b><br>
        <small style="color:var(--text-muted);">${stu.currentRole} &bull; ₹${stu.monthlySalary.toLocaleString()}/month &bull; Joined: ${stu.joiningDate}</small>
      </div>
      <div class="timeline-item verified">
        <b>4. Employer Dual-Handshake Verification</b><br>
        <small style="color:var(--text-muted);">Verified by ${stu.verifiedBy} &bull; Hash: <code>${stu.verificationHash}</code></small>
      </div>
      <div class="timeline-item upcoming">
        <b>5. 6-Month Retention Check-in Scheduled</b><br>
        <small style="color:var(--text-muted);">Due Jan 2027 &bull; Expected wage progression to ₹32,000/mo</small>
      </div>
    `;
  }

  function requestEmployerReverification() {
    openModal(
      '🏢 Request Employer Re-Verification',
      `
        <p>A notification will be dispatched to <b>${state.student.currentCompany}</b> talent acquisition desk to re-authenticate candidate employment and EPFO seeding.</p>
        <div class="form-group" style="margin-top:14px;">
          <label>HR Verification Contact Email</label>
          <input type="email" value="campus.verification@infosys.com">
        </div>
        <button class="btn-primary" style="margin-top:10px;" onclick="app.confirmReverificationSent()">Confirm &amp; Send Verification Ping</button>
      `
    );
  }

  function confirmReverificationSent() {
    closeModal();
    showToast('Verification request dispatched to employer portal!');
  }

  // --------------------------------------------------------------------------
  // Employer Verification Portal (Dual-Handshake)
  // --------------------------------------------------------------------------
  function setupEmployerVerificationEvents() {
    // Dynamic events handled via inline onclick
  }

  function renderVerification() {
    const queue = MOCK_DATA.employerVerificationsQueue;
    const tbody = $('#employerVerificationBody');
    tbody.innerHTML = '';

    let pendingCount = 0;
    queue.forEach((item) => {
      if (item.status.includes('Pending')) pendingCount++;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><code>${item.id}</code></td>
        <td><b>${item.studentName}</b><br><small style="color:var(--text-muted);">${item.studentId}</small></td>
        <td>${item.role}</td>
        <td><b>${item.offeredSalary}</b></td>
        <td>${item.joiningDate}</td>
        <td><span class="badge ${item.status === 'Verified' ? '' : 'orange'}">${item.status}</span></td>
        <td>
          ${
            item.status === 'Verified'
              ? '<span style="font-size:12px; color:#059669; font-weight:700;">✓ Verified</span>'
              : `<button class="btn-primary" style="padding:6px 14px; font-size:12px; width:auto;" onclick="app.approveVerification('${item.id}')">Approve &amp; Sign</button>`
          }
        </td>
      `;
      tbody.appendChild(tr);
    });

    $('#verQueueCount').textContent = `${pendingCount} In Queue`;
  }

  function approveVerification(verId) {
    const item = MOCK_DATA.employerVerificationsQueue.find((x) => x.id === verId);
    if (item) {
      item.status = 'Verified';
      item.verifiedDate = 'Today (Just now)';
      item.verifier = 'Priya Sharma (Lead HR)';
      renderVerification();
      showToast(`Verification ${verId} for ${item.studentName} approved!`);
    }
  }

  // --------------------------------------------------------------------------
  // 3 / 6 / 12-Month Retention & Wage Progression
  // --------------------------------------------------------------------------
  function renderFollowup() {
    const container = $('#retentionMilestonesGrid');
    container.innerHTML = '';

    state.student.milestones.forEach((m) => {
      const card = document.createElement('div');
      card.className = 'card';
      card.style.background = m.status === 'Completed' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(241, 245, 249, 0.5)';
      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
          <strong style="font-size:14px;">${m.month}</strong>
          <span class="badge ${m.status === 'Completed' ? '' : m.status === 'Upcoming' ? 'orange' : 'purple'}">${m.status}</span>
        </div>
        <h4 style="font-size:20px; color:var(--text-main); margin-bottom:4px;">₹${m.salary.toLocaleString()} <small style="font-size:11px; color:var(--text-muted);">/mo</small></h4>
        <p style="font-size:12px; color:var(--text-muted); line-height:1.4;">${m.notes}</p>
        <div style="margin-top:12px; font-size:11px; color:var(--text-light);">Scheduled: <b>${m.date}</b></div>
      `;
      container.appendChild(card);
    });
  }

  function submitFollowupCheckin() {
    openModal(
      '🗓️ Complete 6-Month Retention Check-in',
      `
        <p style="color:var(--text-muted); margin-bottom:15px;">Confirm active employment status and wage progression details:</p>
        <div class="form-group">
          <label>Current Employer Confirmation</label>
          <input type="text" value="${state.student.currentCompany}" readonly>
        </div>
        <div class="form-group">
          <label>Updated Monthly Wage (INR)</label>
          <input id="checkinSalary" type="number" value="32000">
        </div>
        <div class="form-group">
          <label>Role / Promotion Designation</label>
          <input id="checkinRole" type="text" value="Associate AI Engineer Level-2">
        </div>
        <button class="btn-primary" style="margin-top:10px;" onclick="app.confirmCheckinSubmitted()">Submit Verified Check-in</button>
      `
    );
  }

  function confirmCheckinSubmitted() {
    const updatedSalary = Number($('#checkinSalary').value) || 32000;
    const updatedRole = $('#checkinRole').value.trim() || 'Associate AI Engineer';

    const m6 = state.student.milestones.find((x) => x.month.includes('6th Month'));
    if (m6) {
      m6.status = 'Completed';
      m6.salary = updatedSalary;
      m6.verified = true;
      m6.notes = `Confirmed 6-Month retention with wage hike to ₹${updatedSalary.toLocaleString()}/mo.`;
    }

    state.student.monthlySalary = updatedSalary;
    state.student.currentRole = updatedRole;

    saveStateToStorage();
    closeModal();
    renderFollowup();
    renderDashboard();
    showToast('6-Month milestone check-in recorded successfully!');
  }

  // --------------------------------------------------------------------------
  // "Why Not Placed?" Diagnostic Root Cause Analyzer
  // --------------------------------------------------------------------------
  function renderWhyNotPlaced() {
    const tbody = $('#whyNotPlacedBody');
    tbody.innerHTML = '';

    MOCK_DATA.whyNotPlacedDiagnostics.forEach((item) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><b>${item.factor}</b></td>
        <td><span style="font-weight:700; color:#d97706;">${item.score}</span></td>
        <td style="max-width:280px; font-size:13px; color:var(--text-muted);">${item.findings}</td>
        <td><span class="badge ${item.status === 'Optimized' ? '' : item.status === 'Critical Need' ? 'rose' : 'orange'}">${item.status}</span></td>
        <td style="font-size:13px; font-weight:600;">${item.action}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  // --------------------------------------------------------------------------
  // District-Level Skill Demand & Placement Analytics
  // --------------------------------------------------------------------------
  function setupDistrictAnalyticsEvents() {
    $('#districtFilterSelect').addEventListener('change', (e) => {
      renderDistrictAnalytics(e.target.value);
    });

    $('#exportDistrictDataBtn').addEventListener('click', () => {
      const selectedId = $('#districtFilterSelect').value;
      const district = state.districts.find((d) => d.id === selectedId) || state.districts[0];

      const csvContent =
        'data:text/csv;charset=utf-8,' +
        `District,Assessed,Trained,Placed,Retention,AvgSalary\n` +
        `"${district.name}",${district.youthAssessed},${district.trainedCandidates},${district.placedCandidates},"${district.retentionRate}","${district.avgSalary}"\n`;

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `${district.name}_Skill_Outcome_Report.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast(`Exported report for ${district.name}`);
    });
  }

  function renderDistrictAnalytics(districtId = 'AP-VSKP') {
    const district = state.districts.find((d) => d.id === districtId) || state.districts[0];

    // Render KPI Cards
    const kpiGrid = $('#districtKpiGrid');
    kpiGrid.innerHTML = `
      <div class="card stat-card">
        <div class="stat-info">
          <p>Youth Assessed</p>
          <h4>${district.youthAssessed.toLocaleString()}</h4>
          <span class="badge blue">${district.region}</span>
        </div>
        <div class="stat-icon">👥</div>
      </div>
      <div class="card stat-card purple">
        <div class="stat-info">
          <p>Trained Candidates</p>
          <h4>${district.trainedCandidates.toLocaleString()}</h4>
          <span class="stat-trend up">77.6% conversion</span>
        </div>
        <div class="stat-icon">📚</div>
      </div>
      <div class="card stat-card emerald">
        <div class="stat-info">
          <p>Placed &amp; Verified</p>
          <h4>${district.placedCandidates.toLocaleString()}</h4>
          <span class="stat-trend up">${district.retentionRate} Retention</span>
        </div>
        <div class="stat-icon">💼</div>
      </div>
      <div class="card stat-card amber">
        <div class="stat-info">
          <p>Avg Placed Salary</p>
          <h4>${district.avgSalary}</h4>
          <span class="badge orange">${district.employersActive} Employers</span>
        </div>
        <div class="stat-icon">📈</div>
      </div>
    `;

    // Render Bar Chart Pillars
    const chartContainer = $('#districtBarChart');
    chartContainer.innerHTML = '';
    state.districts.forEach((d) => {
      const placementPct = Math.round((d.placedCandidates / d.trainedCandidates) * 100);
      const col = document.createElement('div');
      col.className = 'chart-bar-col';
      col.innerHTML = `
        <b style="font-size:12px; color:var(--primary);">${placementPct}%</b>
        <div class="chart-bar-pillar" style="height: ${placementPct}%;" title="${d.name}: ${placementPct}% placement rate"></div>
        <span class="chart-bar-label">${d.name.split(' ')[0]}</span>
      `;
      chartContainer.appendChild(col);
    });

    // Render Top Demand Sectors
    const demandList = $('#districtDemandSectorsList');
    demandList.innerHTML = '';
    district.topDemandSectors.forEach((sec) => {
      const row = document.createElement('div');
      row.className = 'metric-row';
      row.innerHTML = `
        <span><b>${sec}</b></span>
        <span class="badge blue">High Demand</span>
      `;
      demandList.appendChild(row);
    });

    // Render Acute Local Skill Shortages
    const shortageList = $('#districtSkillShortagesList');
    shortageList.innerHTML = '';
    district.primarySkillGaps.forEach((gap) => {
      const row = document.createElement('div');
      row.className = 'metric-row';
      row.innerHTML = `
        <span>${gap.skill}</span>
        <span class="badge rose">${gap.gapPct}% Regional Deficit</span>
      `;
      shortageList.appendChild(row);
    });
  }

  // --------------------------------------------------------------------------
  // AI Career & Job Opportunity Matcher
  // --------------------------------------------------------------------------
  function renderJobRecommendations() {
    const container = $('#jobOpportunitiesList');
    container.innerHTML = '';

    MOCK_DATA.jobOpportunities.forEach((job) => {
      const card = document.createElement('div');
      card.className = 'card';
      card.style.marginBottom = '16px';
      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:10px;">
          <div>
            <h3 style="font-size:18px; margin-bottom:4px;">${job.title}</h3>
            <p style="color:var(--primary); font-weight:700; font-size:14px; margin-bottom:8px;">${job.company} &bull; <span style="color:var(--text-muted); font-weight:500;">${job.location}</span></p>
            <div style="display:flex; gap:6px; flex-wrap:wrap; margin-bottom:10px;">
              ${job.requiredSkills.map((s) => `<span class="badge blue">${s}</span>`).join('')}
            </div>
            <div style="font-size:12.5px; color:var(--text-muted);">
              Salary: <b>${job.salary}</b> &bull; Vacancies: <b>${job.vacancies} Openings</b> &bull; Posted: ${job.posted}
            </div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:24px; font-weight:900; color:#059669;">${job.matchScore}%</div>
            <small style="color:var(--text-muted); display:block; margin-bottom:8px;">AI Skill Match</small>
            <button class="btn-primary" style="width:auto; padding:8px 18px;" onclick="app.applyForJob('${job.id}', '${job.title}', '${job.company}')">
              1-Click Apply &rarr;
            </button>
          </div>
        </div>
      `;
      container.appendChild(card);
    });
  }

  function applyForJob(jobId, title, company) {
    openModal(
      '🚀 Application Dispatched',
      `
        <div style="text-align:center; padding:15px 0;">
          <div style="font-size:42px; margin-bottom:10px;">📨</div>
          <h3>Application Submitted for ${title}</h3>
          <p style="color:var(--text-muted); font-size:14px; margin-top:8px;">
            Your verified skill passport (Score: <b>${state.student.skillScore}/100</b>) and institutional credential hash have been securely forwarded to <b>${company}</b> recruitment desk.
          </p>
        </div>
      `
    );
  }

  // --------------------------------------------------------------------------
  // Consent & DPDP Privacy Controller
  // --------------------------------------------------------------------------
  function setupConsentEvents() {
    $('#saveConsentBtn').addEventListener('click', () => {
      state.consent.aadhaar = $('#consentAadhaar').checked;
      state.consent.employer = $('#consentEmployer').checked;
      state.consent.retention = $('#consentRetention').checked;
      state.consent.research = $('#consentResearch').checked;

      saveStateToStorage();
      showToast('Consent preferences cryptographically updated & saved.');
    });
  }

  // --------------------------------------------------------------------------
  // Modal & Toast Notification Helpers
  // --------------------------------------------------------------------------
  function setupModalEvents() {
    $('#modalCloseBtn').addEventListener('click', closeModal);
    $('#modalDismissBtn').addEventListener('click', closeModal);
    $('#modalOverlay').addEventListener('click', (e) => {
      if (e.target.id === 'modalOverlay') closeModal();
    });
    $('#notifyBtn').addEventListener('click', () => {
      openModal(
        '🔔 Platform Notification Center',
        `
          <div class="metric-row">
            <span><b>Infosys Verified Your Placement</b><br><small style="color:var(--text-muted);">Cryptographic verification complete.</small></span>
            <span class="badge">2h ago</span>
          </div>
          <div class="metric-row">
            <span><b>New Skill Gap Identified: SQL Window Functions</b><br><small style="color:var(--text-muted);">Recommended course added to your plan.</small></span>
            <span class="badge orange">1d ago</span>
          </div>
          <div class="metric-row">
            <span><b>6-Month Retention Check-in Due in 90 Days</b><br><small style="color:var(--text-muted);">Scheduled wage progression review.</small></span>
            <span class="badge purple">3d ago</span>
          </div>
        `
      );
    });
  }

  function openModal(title, htmlContent) {
    $('#modalTitle').textContent = title;
    $('#modalBody').innerHTML = htmlContent;
    $('#modalOverlay').classList.add('active');
  }

  function closeModal() {
    $('#modalOverlay').classList.remove('active');
  }

  function showToast(message) {
    const toast = $('#toast');
    if (!toast) return;
    toast.textContent = message;
    toast.style.display = 'block';
    clearTimeout(window._toastTimeout);
    window._toastTimeout = setTimeout(() => {
      toast.style.display = 'none';
    }, 2600);
  }

  // --------------------------------------------------------------------------
  // Global API Hook for Inline Event Handlers
  // --------------------------------------------------------------------------
  window.app = {
    navigateTo,
    startAssessment,
    advanceCourseProgress,
    addNewCourse,
    requestEmployerReverification,
    confirmReverificationSent,
    approveVerification,
    submitFollowupCheckin,
    confirmCheckinSubmitted,
    applyForJob,
    resetDemoData: () => {
      resetStateToDefaults();
      showToast('Platform reset to demo defaults');
      location.reload();
    }
  };

  // Run on DOM ready
  document.addEventListener('DOMContentLoaded', initApp);
})();
