document.addEventListener('DOMContentLoaded', () => {

  const firebaseConfig = {
    apiKey: "AIzaSyCnL8zEma0QfE0GIUsTilPI096d9KhFCvQ",
    authDomain: "accahub-587a4.firebaseapp.com",
    projectId: "accahub-587a4",
    storageBucket: "accahub-587a4.firebasestorage.app",
    messagingSenderId: "86306342854",
    appId: "1:86306342854:web:46b1625c44e5aae69b14c7",
    measurementId: "G-HL9M8NWKJK"
  };

  // Initialize Firebase (v8)
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  
  // Initialize Firebase App Check with reCAPTCHA Enterprise
  // NOTE: Disabled for local development to allow login without domain whitelisting
  /*
  const appCheck = firebase.appCheck();
  appCheck.activate(
    new firebase.appCheck.ReCaptchaEnterpriseProvider('6LcRySgtAAAAADDwDo2z-_MKx5FKaapKYAFhdH8O'),
    true // isTokenAutoRefreshEnabled
  );
  */

  const auth = firebase.auth();
  const db = firebase.firestore();

  lucide.createIcons();

  // Global toggle function for Study Hub Accordion
  window.toggleAccordion = function(headerElement) {
    const parentItem = headerElement.closest('.sh-acc-item');
    if (!parentItem) return;
    const bodyElement = parentItem.querySelector('.sh-acc-body');
    const icon = parentItem.querySelector('.sh-acc-header-right i');
    
    if (bodyElement && bodyElement.style.display === 'block') {
       bodyElement.style.display = 'none';
       parentItem.classList.remove('active');
       if (icon) icon.setAttribute('data-lucide', 'chevron-down');
    } else if (bodyElement) {
       bodyElement.style.display = 'block';
       parentItem.classList.add('active');
       if (icon) icon.setAttribute('data-lucide', 'chevron-up');
    }
    if (window.lucide) window.lucide.createIcons();
  };

  window.toggleFilterMenu = function() {
     const menu = document.getElementById('filter-dropdown');
     if (menu) {
        menu.classList.toggle('hidden');
     }
  };

  window.applyFilters = function() {
     const onlyBookmarked = document.getElementById('filter-bookmarked').checked;
     const items = document.querySelectorAll('.sh-acc-item');
     
     items.forEach(item => {
        const isBookmarked = item.dataset.bookmarked === 'true';
        if (onlyBookmarked && !isBookmarked) {
           item.style.display = 'none';
        } else {
           item.style.display = 'block';
        }
     });
  };

  window.expandAllChapters = function() {
     document.querySelectorAll('.sh-acc-item').forEach(item => {
        item.classList.add('active');
        const body = item.querySelector('.sh-acc-body');
        if (body) body.style.display = 'block';
        
        const icon = item.querySelector('.sh-acc-header-right i');
        if (icon) icon.setAttribute('data-lucide', 'chevron-up');
     });
     if (window.lucide) window.lucide.createIcons();
  };

  window.collapseAllChapters = function() {
     document.querySelectorAll('.sh-acc-item').forEach(item => {
        item.classList.remove('active');
        const body = item.querySelector('.sh-acc-body');
        if (body) body.style.display = 'none';
        
        const icon = item.querySelector('.sh-acc-header-right i');
        if (icon) icon.setAttribute('data-lucide', 'chevron-down');
     });
     if (window.lucide) window.lucide.createIcons();
  };

  // Switch Sub-Tabs in Study Hub
  window.switchShTab = function(clickedTab) {
    const tabs = document.querySelectorAll('.sh-tab');
    tabs.forEach(t => t.classList.remove('active'));
    clickedTab.classList.add('active');
    
    const tabName = clickedTab.textContent.trim();
    if (tabName === 'Table of Contents' && window.closeReaderView) {
       window.closeReaderView();
    }
    
    // Apply filtering logic
    const items = document.querySelectorAll('.sh-acc-item');
    
    items.forEach(item => {
      let show = true;
      if (tabName === 'Bookmarks') {
        show = item.dataset.bookmarked === 'true';
      } else if (tabName === 'Notes') {
        const rtd = item.querySelector('.rich-text-display');
        const hasNotes = rtd && rtd.textContent.trim().length > 0;
        const hasLinks = item.querySelectorAll('.sh-link-item').length > 0;
        show = hasNotes || hasLinks;
      } else if (tabName === 'Confidence Levels') {
        // Keep all visible for this tab, maybe we sort later
        show = true;
      } else if (tabName === 'Highlights') {
        // We can hide all if not implemented, or just show all
        show = true;
      }
      
      item.style.display = show ? 'block' : 'none';
    });
  };

  // Toggle My Account
  window.toggleMyAccount = function() {
    const profileTab = document.getElementById('tab-profile');
    const contentWrapper = document.getElementById('sh-content-wrapper');
    const qbTab = document.getElementById('tab-qb');
    
    if (!profileTab) return;
    
    const isProfileVisible = profileTab.style.display === 'block';
    
    // Clear sidebar active states if we are showing profile
    if (!isProfileVisible) {
        document.querySelectorAll('.sh-nav li').forEach(li => li.classList.remove('active'));
    } else {
        const navCh = document.getElementById('nav-chapters');
        if(navCh) navCh.classList.add('active');
    }
    
    if (isProfileVisible) {
      profileTab.classList.add('hidden');
      profileTab.style.display = 'none';
      if (qbTab) { qbTab.classList.add('hidden'); qbTab.style.display = 'none'; }
      if (contentWrapper) {
        contentWrapper.classList.remove('hidden');
        contentWrapper.style.display = 'block';
      }
    } else {
      if (contentWrapper) {
        contentWrapper.classList.add('hidden');
        contentWrapper.style.display = 'none';
      }
      if (qbTab) { qbTab.classList.add('hidden'); qbTab.style.display = 'none'; }
      
      profileTab.classList.remove('hidden');
      profileTab.style.display = 'block';
      profileTab.style.opacity = '1';
      profileTab.style.visibility = 'visible';
    }
  };

  window.toggleMyAccountFromML = function() {
      if (!window.currentCourse) {
          window.startStudy('acca');
      } else {
          window.showScreen('study');
      }
      
      const profileTab = document.getElementById('tab-profile');
      const contentWrapper = document.getElementById('sh-content-wrapper');
      const qbTab = document.getElementById('tab-qb');
      
      document.querySelectorAll('.sh-nav li').forEach(li => li.classList.remove('active'));
      
      if (contentWrapper) {
         contentWrapper.classList.add('hidden');
         contentWrapper.style.display = 'none';
      }
      if (qbTab) {
         qbTab.classList.add('hidden');
         qbTab.style.display = 'none';
      }
      if (profileTab) {
         profileTab.classList.remove('hidden');
         profileTab.style.display = 'block';
         profileTab.style.visibility = 'visible';
         profileTab.style.opacity = '1';
      }
  };

  window.showStudyChapters = function() {
    document.querySelectorAll('.sh-nav li').forEach(li => li.classList.remove('active'));
    const navCh = document.getElementById('nav-chapters');
    if(navCh) navCh.classList.add('active');
    
    const profileTab = document.getElementById('tab-profile');
    const contentWrapper = document.getElementById('sh-content-wrapper');
    const qbTab = document.getElementById('tab-qb');
    
    if (profileTab) { profileTab.classList.add('hidden'); profileTab.style.display = 'none'; }
    if (qbTab) { qbTab.classList.add('hidden'); qbTab.style.display = 'none'; }
    if (contentWrapper) { contentWrapper.classList.remove('hidden'); contentWrapper.style.display = 'block'; }
  };

  window.showQuestionBanks = function() {
    document.querySelectorAll('.sh-nav li').forEach(li => li.classList.remove('active'));
    const navQb = document.getElementById('nav-qb');
    if(navQb) navQb.classList.add('active');
    
    const profileTab = document.getElementById('tab-profile');
    const contentWrapper = document.getElementById('sh-content-wrapper');
    const qbTab = document.getElementById('tab-qb');
    
    if (profileTab) { profileTab.classList.add('hidden'); profileTab.style.display = 'none'; }
    if (contentWrapper) { contentWrapper.classList.add('hidden'); contentWrapper.style.display = 'none'; }
    if (qbTab) { qbTab.classList.remove('hidden'); qbTab.style.display = 'block'; }
    
    renderQuestionBanks();
  };

  function renderQuestionBanks() {
     const qbList = document.getElementById('qb-list');
     if (!qbList) return;
     qbList.innerHTML = '';
     
     if (currentCourse === 'acca') {
        qbList.innerHTML = `
          <div class="hub-card" style="display: flex; flex-direction: column; align-items: flex-start;">
             <h3 style="margin-top:0;">Kaplan Kit</h3>
             <p style="color: var(--text-light); flex-grow: 1;">Practice questions and exam kits from Kaplan.</p>
             <a href="https://drive.google.com/file/d/1aKP08wdJQT0vQMCSDk4eRq7Rf9FAHLnC/view?usp=drive_link" target="_blank" class="sh-btn" style="background: var(--acca-red); color: white; text-decoration: none; width: 100%; text-align: center; display: inline-block;">Open Kaplan Kit</a>
          </div>
          <div class="hub-card" style="display: flex; flex-direction: column; align-items: flex-start;">
             <h3 style="margin-top:0;">BPP Kit</h3>
             <p style="color: var(--text-light); flex-grow: 1;">Practice questions and exam kits from BPP.</p>
             <a href="https://drive.google.com/file/d/1yguhn00XCrSdiDlYxGPKAie0EECaq01l/view?usp=drive_link" target="_blank" class="sh-btn" style="background: var(--acca-red); color: white; text-decoration: none; width: 100%; text-align: center; display: inline-block;">Open BPP Kit</a>
          </div>
        `;
     } else {
        qbList.innerHTML = `<p style="grid-column: span 2; color: var(--text-light);">No question banks available for this course yet.</p>`;
     }
  }

  // --- DOM Elements ---
  const screens = {
    login: document.getElementById('login-screen'),
    register: document.getElementById('register-screen'),
    forgot: document.getElementById('forgot-screen'),
    mylearning: document.getElementById('mylearning-screen'),
    study: document.getElementById('study-screen'),
    exam: document.getElementById('exam-screen'),
    result: document.getElementById('result-screen')
  };

  const loginForm = document.getElementById('login-form');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const loginBtn = document.getElementById('login-btn');
  const togglePassword = document.getElementById('toggle-password');

  // Register Logic
  const registerForm = document.getElementById('register-form');
  const regEmailInput = document.getElementById('reg-email');
  const regPasswordInput = document.getElementById('reg-password');
  const regConfirmInput = document.getElementById('reg-confirm');
  const registerBtn = document.getElementById('register-btn');

  // Forgot Password Logic
  const forgotForm = document.getElementById('forgot-form');
  const forgotEmailInput = document.getElementById('forgot-email');
  const forgotBtn = document.getElementById('forgot-btn');

  // Links
  const linkCreateAccount = document.getElementById('link-create-account');
  const linkForgotPassword = document.getElementById('link-forgot-password');
  const linkBackLogin1 = document.getElementById('link-back-login-1');
  const linkBackLogin2 = document.getElementById('link-back-login-2');



  const navLogout = document.getElementById('nav-logout');
  const exitResultBtn = document.getElementById('exit-result-btn');
  const startExamBtn = document.getElementById('start-exam-btn');

  // Exam Elements
  const submitExamBtn = document.getElementById('submit-exam-btn');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const currentQNumDisplay = document.getElementById('current-q-num');
  const questionTextContainer = document.getElementById('question-text');
  const optionsContainer = document.getElementById('options-container');
  const timerDisplay = document.getElementById('timer-display');

  // Tools
  const calcTool = document.getElementById('calc-tool');
  const highlightTool = document.getElementById('highlight-tool');
  const strikethroughTool = document.getElementById('strikethrough-tool');
  const flagTool = document.getElementById('flag-tool');
  const symbolTool = document.getElementById('symbol-tool');
  const symbolWidget = document.getElementById('symbol-widget');
  const closeSymbol = document.getElementById('close-symbol');
  const calcWidget = document.getElementById('calculator-widget');
  const closeCalc = document.getElementById('close-calc');
  const scratchpadTool = document.getElementById('scratchpad-tool');
  const scratchpadWidget = document.getElementById('scratchpad-widget');
  const closeScratchpad = document.getElementById('close-scratchpad');

  // Layouts
  const mcqLayout = document.getElementById('mcq-layout');
  const sectionBLayout = document.getElementById('section-b-layout');
  const crLayout = document.getElementById('cr-layout');

  // Results Output
  const reviewListContainer = document.getElementById('review-list');

  // --- State ---
  let currentQuestionIndex = 0;
  let userAnswers = [];
  let userInterpretations = [];
  let timeRemaining = 36 * 60; // 36 minutes default
  let timerInterval;
  let currentMockId = null;
  let isPracticeMode = false;
  
  // Define questions as empty initially, will be populated on startMock
  let questions = [];
  let isHighlightMode = false;
  let isStrikethroughMode = false;
  let flaggedQuestions = [];
  let userDataCache = { history: [], topics: {} };

  // --- View Management ---
  function showScreen(screenName) {
    Object.values(screens).forEach(s => {
      if(s) s.classList.add('hidden');
    });
    if(screens[screenName]) screens[screenName].classList.remove('hidden');
    lucide.createIcons();
  }
  window.showScreen = showScreen;

  // Exposed for inline onClick attributes
  window.startStudy = function(courseId) {
    if(window.switchCourse) {
      window.switchCourse(courseId);
    }
    
    // Ensure dashboard is visible and account/qb profiles are hidden
    const profileTab = document.getElementById('tab-profile');
    const contentWrapper = document.getElementById('sh-content-wrapper');
    const qbTab = document.getElementById('tab-qb');
    
    if (profileTab) {
       profileTab.classList.add('hidden');
       profileTab.style.display = 'none';
    }
    if (qbTab) {
       qbTab.classList.add('hidden');
       qbTab.style.display = 'none';
    }
    if (contentWrapper) {
       contentWrapper.classList.remove('hidden');
       contentWrapper.style.display = 'block';
    }
    
    document.querySelectorAll('.sh-nav li').forEach(li => li.classList.remove('active'));
    const navCh = document.getElementById('nav-chapters');
    if (navCh) navCh.classList.add('active');
    
    showScreen('study');
  };

  window.switchMLTab = function(tabName) {
    document.querySelectorAll('.ml-tab').forEach(tab => {
      tab.style.color = 'var(--text-light)';
      tab.style.borderBottom = 'none';
      tab.classList.remove('active');
    });
    
    const activeTab = document.getElementById('tab-ml-' + tabName);
    if(activeTab) {
      activeTab.style.color = '#E3000F';
      activeTab.style.borderBottom = '2px solid #E3000F';
      activeTab.classList.add('active');
    }
    
    const inProgressContent = document.getElementById('ml-inprogress-content');
    const emptyContent = document.getElementById('ml-empty-content');
    
    if(tabName === 'inprogress' || tabName === 'dashboard') {
      inProgressContent.style.display = 'block';
      emptyContent.style.display = 'none';
      const headerTitle = document.querySelector('#ml-inprogress-content h2');
      if (headerTitle) {
        headerTitle.textContent = tabName === 'dashboard' ? 'Dashboard Overview' : 'In Progress';
      }
    } else {
      inProgressContent.style.display = 'none';
      emptyContent.style.display = 'block';
      emptyContent.innerHTML = `<div style="font-size: 14px;">No courses found in ${tabName.toUpperCase()}.</div>`;
    }
  };

  async function updateDashboardData() {
    const user = auth.currentUser;
    if (!user) return;
    
    const displayNameElem = document.getElementById('user-display-name');
    const profileNameElem = document.getElementById('profile-name-display');
    const profileInputElem = document.getElementById('profile-name-input');
    const profileAvatar = document.getElementById('profile-avatar');
    
    const displayName = user.displayName || user.email.split('@')[0];
    
    if(displayNameElem) displayNameElem.textContent = displayName;
    if(profileNameElem) profileNameElem.textContent = displayName;
    if(profileInputElem) profileInputElem.value = displayName;
    if(profileAvatar) {
      // Get up to two initials
      const initials = displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      profileAvatar.textContent = initials || 'U';
    }
    
    // Fetch Firestore Data
    try {
      const userDoc = await db.collection("users").doc(user.uid).get();
      if (userDoc.exists) {
        userDataCache = userDoc.data();
        if (!userDataCache.history) userDataCache.history = [];
        if (!userDataCache.topics) userDataCache.topics = {};
      } else {
        userDataCache = { history: [], topics: {} };
      }
      renderAnalytics();
    } catch (err) {
      console.error("Error fetching user data:", err);
    }
  }

  // --- Course Structure ---
  const courseStructure = {
    acca: [
      "Chapter 1: International Financial Reporting Standards",
      "Chapter 2: Conceptual Framework",
      "Chapter 3: IFRS 18 Presentation and Disclosure in Financial Statements",
      "Chapter 4: IAS 8 Basis of Preparation of Financial Statements",
      "Chapter 5: IFRS 15 Revenue from Contracts with Customers",
      "Chapter 6: Inventories and Agriculture",
      "Chapter 7: IAS 16 Property, Plant and Equipment",
      "Chapter 8: IAS 23 Borrowing Costs",
      "Chapter 9: Government grants",
      "Chapter 10: IAS 40 Investment Property",
      "Chapter 11: IAS 38 Intangible Assets",
      "Chapter 12: IFRS 5 Non-current Assets Held for Sale and Discontinued Operations",
      "Chapter 13: IAS 36 Impairment of Assets",
      "Chapter 14: IFRS 16 Leases",
      "Chapter 15: IAS 37 Provisions, Contingent Liabilities and Contingent Assets",
      "Chapter 16: IAS 10 Events after the Reporting Period",
      "Chapter 17: IAS 12 Income Taxes",
      "Chapter 18: Financial Instruments",
      "Chapter 19: Foreign Currency Transactions",
      "Chapter 20: IAS 33 Earnings per Share",
      "Chapter 21: Conceptual Principles of Groups",
      "Chapter 22: Consolidated Statement of Financial Position",
      "Chapter 23: Goodwill",
      "Chapter 24: Consolidated Statement of Profit or Loss",
      "Chapter 25: Investments in Associates",
      "Chapter 26: Analysis and Interpretation",
      "Chapter 27: IAS 7 Statement of Cash Flows",
      "Glossary"
    ],
    cseb: [
      "Banking",
      "Reasoning",
      "Accountancy",
      "Cooperation",
      "KCS Act and Rules",
      "English"
    ]
  };
  
  let currentCourse = 'acca';

  // --- Modals and Toggles ---
  window.switchCourse = function(courseValue) {
    if (courseValue) {
      currentCourse = courseValue;
      const topSel = document.getElementById('course-selector-top');
      const mainSel = document.getElementById('course-selector-main');
      if (topSel) topSel.value = courseValue;
      if (mainSel) mainSel.value = courseValue;
    }
    renderChapters();
  };

  let quill;
  const initQuill = () => {
    const qlContainer = document.getElementById('quill-editor');
    if (qlContainer && window.Quill && !quill) {
      quill = new Quill('#quill-editor', {
        theme: 'snow',
        placeholder: 'Write your notes here...',
        modules: {
          toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['clean']
          ]
        }
      });
    }
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initQuill);
  } else {
    initQuill();
  }

  window.calcAppend = function(val) { document.getElementById('calc-display').value += val; };
  window.calcClear = function() { document.getElementById('calc-display').value = ''; };
  window.calcCalculate = function() {
    try {
      const result = eval(document.getElementById('calc-display').value);
      document.getElementById('calc-display').value = result;
    } catch(e) { document.getElementById('calc-display').value = 'Error'; }
  };

  let currentModalChapterId = null;
  let currentModalLinks = [];

  window.openNotesModal = function(chapterId, htmlContent, linksArray, titleString) {
    currentModalChapterId = chapterId;
    currentModalLinks = linksArray ? [...linksArray] : [];
    document.getElementById('notes-modal-title').textContent = "Edit Notes - " + chapterId.replace('_', ' ').toUpperCase();
    document.getElementById('notes-modal-custom-title').value = titleString || '';
    if (quill) quill.root.innerHTML = htmlContent || '';
    renderModalLinks();
    document.getElementById('notes-modal').classList.remove('hidden');
  };

  window.closeNotesModal = function() {
    document.getElementById('notes-modal').classList.add('hidden');
    currentModalChapterId = null;
  };

  window.renderModalLinks = function() {
    const list = document.getElementById('modal-links-list');
    list.innerHTML = '';
    currentModalLinks.forEach((l, idx) => {
       const li = document.createElement('li');
       li.className = 'sh-link-item';
       li.innerHTML = `<a href="${l.url}" target="_blank">${l.title}</a>`;
       const delBtn = document.createElement('button');
       delBtn.innerHTML = '<i data-lucide="trash-2"></i>';
       delBtn.className = 'sh-del-btn';
       delBtn.onclick = () => {
         currentModalLinks.splice(idx, 1);
         renderModalLinks();
       };
       li.appendChild(delBtn);
       list.appendChild(li);
    });
    if (window.lucide) window.lucide.createIcons();
  };

  window.addModalLink = function() {
    const t = document.getElementById('modal-link-title').value;
    const u = document.getElementById('modal-link-url').value;
    if(t && u) {
      currentModalLinks.push({title: t, url: u});
      document.getElementById('modal-link-title').value = '';
      document.getElementById('modal-link-url').value = '';
      renderModalLinks();
    } else {
      alert("Provide title and URL");
    }
  };

  window.setSyncStatus = function(status) {
    const textEl = document.getElementById('sync-status');
    const containerEl = document.getElementById('sync-status-container');
    if (!textEl || !containerEl) return;
    
    if (status === 'Syncing...') {
      containerEl.innerHTML = '<i data-lucide="upload-cloud" style="width: 20px; height: 20px; margin-bottom: 3px;"></i><span id="sync-status" style="font-size: 11px; color: var(--text-light);">Syncing...</span>';
    } else {
      containerEl.innerHTML = '<i data-lucide="cloud-check" style="width: 20px; height: 20px; margin-bottom: 3px;"></i><span id="sync-status" style="font-size: 11px; color: var(--text-light);">Synced</span>';
    }
    if (window.lucide) window.lucide.createIcons({ root: containerEl });
  };

  window.saveNotesModal = async function() {
    if (!currentModalChapterId) return;
    const btn = document.getElementById('modal-save-btn');
    btn.textContent = "Saving...";
    setSyncStatus("Syncing...");
    const htmlContent = quill ? quill.root.innerHTML : '';
    const customTitle = document.getElementById('notes-modal-custom-title').value.trim();
    try {
      await db.collection("course_content").doc(currentModalChapterId).set({
        notesHtml: htmlContent,
        notesTitle: customTitle,
        links: currentModalLinks,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      btn.textContent = "Saved!";
      setSyncStatus("Saved");
      setTimeout(() => {
        btn.textContent = "Save Changes";
        closeNotesModal();
        renderChapters(); 
      }, 1000);
    } catch(e) {
      console.error(e);
      alert("Failed to save.");
      btn.textContent = "Save Changes";
      setSyncStatus("Saved");
    }
  };

  window.toggleSearch = function() {
    const m = document.getElementById('search-modal');
    m.classList.toggle('hidden');
    if (!m.classList.contains('hidden')) {
      document.getElementById('search-input').focus();
      window.performSearch();
    }
  };

  window.toggleNotifications = function() {
    const m = document.getElementById('notif-modal');
    m.classList.toggle('hidden');
  };

  window.performSearch = function() {
    const query = document.getElementById('search-input').value.toLowerCase();
    const resultsUl = document.getElementById('search-results');
    resultsUl.innerHTML = '';
    
    if (!query) return;

    courseStructure[currentCourse].forEach((ch, idx) => {
      if (ch.toLowerCase().includes(query)) {
        const li = document.createElement('li');
        li.style.padding = '8px';
        li.style.borderBottom = '1px solid var(--border-color)';
        li.style.cursor = 'pointer';
        li.textContent = ch;
        li.onclick = () => {
          window.toggleSearch();
          const accs = document.querySelectorAll('.sh-acc-item');
          if (accs[idx]) {
            const header = accs[idx].querySelector('.sh-acc-header');
            if (header) {
                const bodyElement = header.nextElementSibling;
                if (bodyElement && bodyElement.style.display !== 'block') {
                    toggleAccordion(header);
                }
            }
            accs[idx].scrollIntoView({behavior: 'smooth'});
          }
        };
        resultsUl.appendChild(li);
      }
    });
  };

  window.toggleBookmark = async function(e, chapterId, btn) {
    e.stopPropagation();
    if (!auth.currentUser) return alert("Please login to save progress.");
    
    setSyncStatus("Syncing...");
    const item = btn.closest('.sh-acc-item');
    const isBookmarked = item.dataset.bookmarked === 'true';
    const newState = !isBookmarked;
    
    item.dataset.bookmarked = newState;
    
    if (newState) {
      btn.classList.add('active');
      btn.innerHTML = '<i data-lucide="star" fill="currentColor" style="width: 18px;"></i>';
    } else {
      btn.classList.remove('active');
      btn.innerHTML = '<i data-lucide="star" style="width: 18px;"></i>';
    }
    lucide.createIcons();
    
    // Save to Firebase
    db.collection("users").doc(auth.currentUser.uid).collection("progress").doc(chapterId).set({
      bookmarked: newState
    }, { merge: true }).then(() => setSyncStatus("Saved"));
  };

  window.setConfidence = async function(chapterId, level, dotElement) {
    if (!auth.currentUser) return alert("Please login to save progress.");
    
    setSyncStatus("Syncing...");
    const container = dotElement.parentElement;
    container.querySelectorAll('.conf-dot').forEach(d => d.classList.remove('active'));
    dotElement.classList.add('active');
    
    const item = dotElement.closest('.sh-acc-item');
    item.dataset.confidence = level;
    
    // Save to Firebase
    db.collection("users").doc(auth.currentUser.uid).collection("progress").doc(chapterId).set({
      confidence: level
    }, { merge: true }).then(() => setSyncStatus("Saved"));
  };
  
  async function loadUserProgress() {
    if (!auth.currentUser) return;
    
    const em = document.getElementById('profile-email-display');
    if (em) em.textContent = auth.currentUser.email || "No email";
    
    try {
      const snap = await db.collection("users").doc(auth.currentUser.uid).collection("progress").get();
      
      let bookmarkCount = 0;
      let highConfCount = 0;
      
      snap.forEach(doc => {
        const chapterId = doc.id;
        const data = doc.data();
        
        if (data.bookmarked) bookmarkCount++;
        if (data.confidence === 'green') highConfCount++;
        
        const item = document.querySelector(`.sh-acc-item[data-chapter-id="${chapterId}"]`);
        if (item) {
          if (data.bookmarked) {
            item.dataset.bookmarked = 'true';
            const btn = item.querySelector('.bookmark-btn');
            if (btn) {
              btn.classList.add('active');
              btn.innerHTML = '<i data-lucide="star" fill="currentColor" style="width: 18px;"></i>';
            }
          }
          if (data.confidence) {
            item.dataset.confidence = data.confidence;
            const dot = item.querySelector(`.conf-dot.${data.confidence}`);
            if (dot) dot.classList.add('active');
          }
        }
      });
      
      const bEl = document.getElementById('stat-bookmarks');
      const cEl = document.getElementById('stat-confidence');
      if (bEl) bEl.textContent = bookmarkCount;
      if (cEl) cEl.textContent = highConfCount;
      
      if (window.lucide) window.lucide.createIcons();
    } catch (e) {
      console.error("Error loading progress:", e);
    }
  }

  window.renderChapters = async function() {
    const container = document.getElementById('chapters-accordion');
    if (!container) return;
    
    container.innerHTML = '<div style="padding:20px; color:var(--text-light);">Loading syllabus...</div>';
    
    let notesData = {};
    try {
       const snapshot = await db.collection("course_content").get();
       snapshot.forEach(doc => { notesData[doc.id] = doc.data(); });
    } catch(e) {
       console.error("Error fetching notes data for syllabus", e);
    }

    container.innerHTML = '';
    const chapters = courseStructure[currentCourse];
    
    chapters.forEach((chTitle, i) => {
      const chapterId = currentCourse === 'acca' ? 'chapter_' + (i + 1) : currentCourse + '_chapter_' + (i + 1);
      
      let htmlContent = "";
      let localLinks = [];
      let localTitle = "";
      
      if (notesData[chapterId]) {
         const data = notesData[chapterId];
         htmlContent = data.notesHtml || "";
         if (!htmlContent && data.notes) htmlContent = `<p>${data.notes}</p>`; // legacy
         localTitle = data.notesTitle || "";
         localLinks = data.links || [];
      } else {
         if (currentUserIsAdmin) {
             htmlContent = "<p style='color: var(--text-light);'>No notes or resources present. Press 'Edit Notes' to add them.</p>";
         } else {
             htmlContent = "<p style='color: var(--text-light);'>No content available for this chapter yet.</p>";
         }
      }
      
      let finalHtml = htmlContent;
      if (!finalHtml || finalHtml.trim() === '' || finalHtml.trim() === '<p><br></p>') {
         if (currentUserIsAdmin) {
             finalHtml = "<p style='color: var(--text-light); font-style: italic;'>No notes or resources present. Press 'Edit Notes' to add them.</p>";
         } else {
             finalHtml = "<p style='color: var(--text-light); font-style: italic;'>No content available for this chapter yet.</p>";
         }
      }
      
      if (localTitle) {
         finalHtml = `<h3 style="margin-top:0; color: var(--text-main); font-size: 18px; font-weight: 600;">${localTitle}</h3>` + finalHtml;
      }
      
      let linksHtml = "";
      if (localLinks && localLinks.length > 0) {
         linksHtml = '<h4 style="margin-top: 25px; margin-bottom: 10px; font-size: 16px; color: var(--text-main);">Resources & Links</h4><ul class="sh-links-list" style="list-style-type: none; padding-left: 0;">';
         localLinks.forEach(l => {
            linksHtml += `<li class="sh-link-item" style="margin-bottom: 10px;"><a href="${l.url}" target="_blank" style="color: #E3000F; text-decoration: none; display: flex; align-items: center; gap: 8px;"><i data-lucide="external-link" style="width: 16px;"></i> ${l.title}</a></li>`;
         });
         linksHtml += '</ul>';
      }
      
      // Register global cache for chapter data
      window.chapterDataCache = window.chapterDataCache || {};
      window.chapterDataCache[chapterId] = { htmlContent, localLinks, localTitle };

      const editBtnHtml = currentUserIsAdmin ? `<button class="sh-btn" style="margin-top: 20px;" onclick="window.triggerEditNotes('${chapterId}')">Edit Notes</button>` : '';

      const html = `
        <div class="sh-acc-item" data-chapter-id="${chapterId}" data-bookmarked="false" data-confidence="none">
          <div class="sh-acc-header" onclick="toggleAccordion(this)" tabindex="0" onkeydown="if(event.key === 'Enter' || event.key === ' ') { event.preventDefault(); toggleAccordion(this); }">
            <div class="sh-acc-header-left">
              <button class="bookmark-btn" onclick="toggleBookmark(event, '${chapterId}', this)" title="Bookmark important chapter" style="margin-right: 10px; background: none; border: none; cursor: pointer; padding: 0;">
                <i data-lucide="bookmark" style="width: 18px; color: var(--text-light);"></i>
              </button>
              <span><strong>${chTitle}</strong></span>
            </div>
            <div class="sh-acc-header-right">
              <i data-lucide="chevron-down" style="cursor: pointer;"></i>
            </div>
          </div>
          <div class="sh-acc-body">
            <div class="sh-notes-section" style="padding: 20px;">
               ${finalHtml}
               ${linksHtml}
               ${editBtnHtml}
            </div>
          </div>
        </div>
      `;
      container.insertAdjacentHTML('beforeend', html);
    });
    
    if (window.lucide) {
      window.lucide.createIcons();
    }
    loadUserProgress();
  }
  
  window.triggerEditNotes = function(chapterId) {
     const data = window.chapterDataCache[chapterId];
     if (data) {
        openNotesModal(chapterId, data.htmlContent, data.localLinks, data.localTitle);
     }
  };
  
  // --- Global State ---
  let currentUserIsAdmin = false;
  
  // --- Time Tracking ---
  let studyTimerInterval = null;
  let totalStudyMinutes = 0;
  
  function startStudyTimer() {
    if (studyTimerInterval) clearInterval(studyTimerInterval);
    
    db.collection("users").doc(auth.currentUser.uid).collection("analytics").doc("time").get().then(doc => {
      if (doc.exists) {
        totalStudyMinutes = doc.data().totalMinutes || 0;
        updateTimeUI();
      }
    });

    studyTimerInterval = setInterval(() => {
      totalStudyMinutes++;
      updateTimeUI();
      db.collection("users").doc(auth.currentUser.uid).collection("analytics").doc("time").set({
        totalMinutes: totalStudyMinutes,
        lastActive: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    }, 60000);
  }
  
  function stopStudyTimer() {
    if (studyTimerInterval) {
      clearInterval(studyTimerInterval);
      studyTimerInterval = null;
    }
  }

  function updateTimeUI() {
    const timeEl = document.getElementById('stat-time');
    if (timeEl) {
      const hrs = Math.floor(totalStudyMinutes / 60);
      const mins = totalStudyMinutes % 60;
      timeEl.textContent = `${hrs}h ${mins}m`;
    }
  }

  // --- Auth State Observer ---
  auth.onAuthStateChanged(async (user) => {
    if (user) {
      if (user.email && user.email.toLowerCase().trim() === 'abhishekoac10@gmail.com') {
        currentUserIsAdmin = true;
      } else {
        currentUserIsAdmin = false;
      }
      
      updateDashboardData(); // Update user profile name and email
      renderChapters();
      showScreen('mylearning');
      startStudyTimer();
    } else {
      currentUserIsAdmin = false;
      showScreen('login');
      stopStudyTimer();
    }
  });


  // --- Login Form Logic ---
  function validateForm() {
    if (usernameInput.value.trim() !== '' && passwordInput.value.trim() !== '') {
      loginBtn.disabled = false;
      loginBtn.classList.add('active');
    } else {
      loginBtn.disabled = true;
      loginBtn.classList.remove('active');
    }
  }

  usernameInput.addEventListener('input', validateForm);
  passwordInput.addEventListener('input', validateForm);

  togglePassword.addEventListener('click', () => {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    
    if (type === 'text') {
      togglePassword.setAttribute('data-lucide', 'eye-off');
    } else {
      togglePassword.setAttribute('data-lucide', 'eye');
    }
    lucide.createIcons();
  });

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = usernameInput.value.trim();
    const pass = passwordInput.value.trim();
    
    if (email && pass) {
      try {
        loginBtn.textContent = 'Signing in...';
        loginBtn.disabled = true;
        await auth.signInWithEmailAndPassword(email, pass);
        // onAuthStateChanged will handle navigation
      } catch (error) {
        alert("Invalid credentials. Please try again or create an account.");
        console.error(error);
      } finally {
        loginBtn.textContent = 'Sign in';
        loginBtn.disabled = false;
      }
    }
  });

  // --- Auth Navigation ---
  linkCreateAccount.addEventListener('click', (e) => {
    e.preventDefault();
    showScreen('register');
  });

  linkForgotPassword.addEventListener('click', (e) => {
    e.preventDefault();
    showScreen('forgot');
  });

  linkBackLogin1.addEventListener('click', (e) => {
    e.preventDefault();
    showScreen('login');
  });

  linkBackLogin2.addEventListener('click', (e) => {
    e.preventDefault();
    showScreen('login');
  });

  // --- Register Form Logic ---
  function validateRegisterForm() {
    if (regEmailInput.value.trim() && regPasswordInput.value.trim() && regConfirmInput.value.trim()) {
      registerBtn.disabled = false;
      registerBtn.classList.add('active');
    } else {
      registerBtn.disabled = true;
      registerBtn.classList.remove('active');
    }
  }

  regEmailInput.addEventListener('input', validateRegisterForm);
  regPasswordInput.addEventListener('input', validateRegisterForm);
  regConfirmInput.addEventListener('input', validateRegisterForm);

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (regPasswordInput.value !== regConfirmInput.value) {
      alert("Passwords do not match!");
      return;
    }
    const email = regEmailInput.value.trim();
    const password = regPasswordInput.value.trim();
    const displayName = email.split('@')[0];
    
    try {
      registerBtn.textContent = 'Creating...';
      registerBtn.disabled = true;
      
      // Create Auth User
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;
      
      // Update Profile Name
      await user.updateProfile({ displayName: displayName });
      
      // Create initial Firestore Document
      await db.collection("users").doc(user.uid).set({
        email: email,
        displayName: displayName,
        history: [],
        topics: {}
      });
      
      // onAuthStateChanged will handle navigation
    } catch (error) {
      alert(error.message);
      console.error(error);
    } finally {
      registerBtn.textContent = 'Create Account';
      registerBtn.disabled = false;
    }
  });

  // --- Forgot Password Logic ---
  function validateForgotForm() {
    if (forgotEmailInput.value.trim()) {
      forgotBtn.disabled = false;
      forgotBtn.classList.add('active');
    } else {
      forgotBtn.disabled = true;
      forgotBtn.classList.remove('active');
    }
  }

  forgotEmailInput.addEventListener('input', validateForgotForm);

  forgotForm.addEventListener('submit', (e) => {
    e.preventDefault();
    alert(`Password reset link sent to ${forgotEmailInput.value}`);
    showScreen('login');
  });

  // --- Sidebar Navigation ---
  const navTabs = document.querySelectorAll('.nav-tab');
  const hubTabs = document.querySelectorAll('.hub-tab');

  navTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Update active nav link
      navTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Hide all panels
      hubTabs.forEach(panel => panel.classList.add('hidden'));

      // Show target panel
      const targetId = tab.getAttribute('data-target');
      document.getElementById(targetId).classList.remove('hidden');

      if (targetId === 'tab-profile') {
        renderAnalytics();
      }
    });
  });

  if(navLogout) {
    navLogout.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        await auth.signOut();
        usernameInput.value = '';
        passwordInput.value = '';
        validateForm();
        showScreen('login');
      } catch (error) {
        console.error('Error signing out', error);
      }
    });
  }

  // --- Profile Name Editing ---
  const editNameBtn = document.getElementById('edit-name-btn');
  const saveNameBtn = document.getElementById('save-name-btn');
  const profileNameDisplay = document.getElementById('profile-name-display');
  const profileNameEdit = document.getElementById('profile-name-edit');
  const profileNameInput = document.getElementById('profile-name-input');
  const userDisplayName = document.getElementById('user-display-name');

  if(editNameBtn) {
    editNameBtn.addEventListener('click', () => {
      profileNameDisplay.classList.add('hidden');
      profileNameEdit.classList.remove('hidden');
      editNameBtn.classList.add('hidden');
    });
  }

  if(saveNameBtn) {
    saveNameBtn.addEventListener('click', async () => {
      const newName = profileNameInput.value.trim();
      const user = auth.currentUser;
      
      if(newName && user) {
        try {
          saveNameBtn.textContent = 'Saving...';
          await user.updateProfile({ displayName: newName });
          await db.collection("users").doc(user.uid).update({ displayName: newName });
          
          profileNameDisplay.textContent = newName;
          userDisplayName.textContent = newName;
        } catch (error) {
          console.error("Error updating profile", error);
          alert("Failed to update name.");
        } finally {
          saveNameBtn.textContent = 'Save Name';
        }
      }
      
      profileNameDisplay.classList.remove('hidden');
      profileNameEdit.classList.add('hidden');
      editNameBtn.classList.remove('hidden');
    });
  }

  exitResultBtn.addEventListener('click', () => {
    showScreen('study');
  });

});
