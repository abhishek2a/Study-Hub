// Hide splash screen if already shown this session
if (sessionStorage.getItem('splashShown')) {
  const splash = document.getElementById('splash-screen');
  if (splash) {
    splash.style.display = 'none';
  }
}

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js').then(reg => {
      reg.onupdatefound = () => {
        const installingWorker = reg.installing;
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
            const toast = document.getElementById('update-toast');
            if (toast) toast.classList.remove('hidden');
          }
        };
      };
    }).catch(err => console.log('Service worker registration failed: ', err));
  });
}

document.addEventListener('DOMContentLoaded', async () => { try {

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
  
  // --- Session Tracking Logic ---
  async function loadSessionHistory() {
    const container = document.getElementById('study-history-container');
    if (!container || !auth.currentUser) return;
    
    try {
      const snap = await db.collection('users').doc(auth.currentUser.uid).collection('sessions').get({ source: 'server' });
      
      if (snap.empty) {
        container.innerHTML = '<p style="color: var(--text-light); text-align: center; padding: 20px; margin: 0;">No study history available.</p>';
        return;
      }
      
      const allSessions = [];
      snap.forEach(doc => allSessions.push(doc.data()));
      
      // Sort in memory (descending by loginTime)
      allSessions.sort((a, b) => {
        const timeA = a.loginTime ? a.loginTime.toMillis() : 0;
        const timeB = b.loginTime ? b.loginTime.toMillis() : 0;
        return timeB - timeA;
      });
      
      // Group by date and sum total time
      let sumAllMinutes = 0;
      const grouped = {};
      allSessions.forEach(data => {
        sumAllMinutes += (data.durationMinutes || 0);
        const dateStr = data.date || 'Unknown Date';
        if (!grouped[dateStr]) grouped[dateStr] = { totalMinutes: 0, sessions: [] };
        grouped[dateStr].totalMinutes += (data.durationMinutes || 0);
        grouped[dateStr].sessions.push(data);
      });
      
      // Keep global tracker in sync
      if (typeof totalStudyMinutes !== 'undefined') {
          totalStudyMinutes = sumAllMinutes;
          if (typeof updateTimeUI === 'function') updateTimeUI();
      }
      
      let html = '<div style="overflow-x: auto;"><table style="width: 100%; border-collapse: separate; border-spacing: 0; margin-top: 5px;">';
      html += '<thead><tr style="background: var(--bg-color);"><th style="padding: 12px 15px; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid var(--border-color); color: var(--text-light); font-weight: 600; border-radius: 6px 0 0 0;">Date</th><th style="padding: 12px 15px; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid var(--border-color); color: var(--text-light); font-weight: 600;">Total Duration</th><th style="padding: 12px 15px; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid var(--border-color); color: var(--text-light); font-weight: 600;">Sessions Logged</th><th style="padding: 12px 15px; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid var(--border-color); color: var(--text-light); font-weight: 600; border-radius: 0 6px 0 0;">Status</th></tr></thead><tbody>';
      
      let rowCount = 0;
      for (const [date, group] of Object.entries(grouped)) {
        const formattedDate = new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
        
        let durationStr = '0 mins';
        const hrs = Math.floor(group.totalMinutes / 60);
        const mins = group.totalMinutes % 60;
        if (hrs > 0 && mins > 0) durationStr = `${hrs} hr ${mins} mins`;
        else if (hrs > 0) durationStr = `${hrs} hr`;
        else durationStr = `${mins} mins`;
        
        const hasActive = group.sessions.some(s => !s.logoutTime && s.sessionId === currentSessionId);
        const statusHTML = hasActive 
          ? '<span style="color: #F59E0B; background: rgba(245, 158, 11, 0.1); padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600;">Active Session</span>'
          : '<span style="color: #10B981; background: rgba(16, 185, 129, 0.1); padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600;">Completed</span>';
          
        const rowStyle = "transition: background 0.2s ease; cursor: default;";
        
        html += `<tr style="${rowStyle}" onmouseover="this.style.background='var(--bg-color)'" onmouseout="this.style.background='transparent'">
                   <td style="padding: 15px; font-size: 14px; font-weight: 500; color: var(--text-main); border-bottom: 1px solid var(--border-color);"><div style="display:flex;align-items:center;gap:8px;"><i data-lucide="calendar" style="width:16px;height:16px;color:var(--acca-red);"></i> ${formattedDate}</div></td>
                   <td style="padding: 15px; font-size: 14px; font-weight: 600; color: var(--acca-red); border-bottom: 1px solid var(--border-color);">${durationStr}</td>
                   <td style="padding: 15px; font-size: 14px; color: var(--text-light); border-bottom: 1px solid var(--border-color);">${group.sessions.length} Session${group.sessions.length > 1 ? 's' : ''}</td>
                   <td style="padding: 15px; font-size: 14px; border-bottom: 1px solid var(--border-color);">${statusHTML}</td>
                 </tr>`;
        rowCount++;
      }
      
      if (rowCount === 0) {
          html += `<tr><td colspan="4" style="padding: 30px; text-align: center; color: var(--text-light);">No study history available yet.</td></tr>`;
      }
      
      html += '</tbody></table></div>';
      container.innerHTML = html;
      if (typeof lucide !== 'undefined') lucide.createIcons();
    } catch (error) {
      console.error('Error loading session history:', error);
      container.innerHTML = `<p style="color: var(--conf-red); text-align: center; padding: 20px; margin: 0;">Failed to load study history: ${error.message}</p>`;
    }
  }

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
    if (!profileTab) return;
    const isProfileVisible = profileTab.style.display === 'block';
    
    if (!isProfileVisible) {
      document.querySelectorAll('.sh-nav li').forEach(li => li.classList.remove('active'));
      if (typeof hideAllStudyHubTabs === 'function') {
        hideAllStudyHubTabs();
      } else {
        ['sh-content-wrapper', 'tab-qb', 'tab-planner', 'tab-examchart', 'tab-tracker'].forEach(id => {
          const el = document.getElementById(id);
          if (el) { el.classList.add('hidden'); el.style.display = 'none'; }
        });
      }
      profileTab.classList.remove('hidden');
      profileTab.style.display = 'block';
      profileTab.style.opacity = '1';
      profileTab.style.visibility = 'visible';
      loadSessionHistory();
    } else {
      const navCh = document.getElementById('nav-chapters');
      if(navCh) navCh.classList.add('active');
      if (typeof window.showStudyChapters === 'function') {
        window.showStudyChapters();
      } else {
        profileTab.classList.add('hidden');
        profileTab.style.display = 'none';
        const cw = document.getElementById('sh-content-wrapper');
        if (cw) { cw.classList.remove('hidden'); cw.style.display = 'block'; }
      }
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
      const plannerTab = document.getElementById('tab-planner');
      
      document.querySelectorAll('.sh-nav li').forEach(li => li.classList.remove('active'));
      
      if (contentWrapper) {
         contentWrapper.classList.add('hidden');
         contentWrapper.style.display = 'none';
      }
       const trackerTab = document.getElementById('tab-tracker');
       const examTab = document.getElementById('tab-examchart');
       if (trackerTab) { trackerTab.classList.add('hidden'); trackerTab.style.display = 'none'; }
       if (plannerTab) { plannerTab.classList.add('hidden'); plannerTab.style.display = 'none'; }
       if (examTab) { examTab.classList.add('hidden'); examTab.style.display = 'none'; }
       if (qbTab) {
         qbTab.classList.add('hidden');
         qbTab.style.display = 'none';
      }
      if (profileTab) {
         profileTab.classList.remove('hidden');
         profileTab.style.display = 'block';
         profileTab.style.visibility = 'visible';
         profileTab.style.opacity = '1';
         loadSessionHistory();
      }
  };

  function hideAllStudyHubTabs() {
    ['sh-content-wrapper', 'tab-qb', 'tab-planner', 'tab-examchart', 'tab-tracker', 'tab-profile'].forEach(id => {
      const el = document.getElementById(id);
      if (el) { el.classList.add('hidden'); el.style.display = 'none'; }
    });
  }

  window.showStudyChapters = function() {
    document.querySelectorAll('.sh-nav li').forEach(li => li.classList.remove('active'));
    const navCh = document.getElementById('nav-chapters');
    if(navCh) navCh.classList.add('active');
    hideAllStudyHubTabs();
    const el = document.getElementById('sh-content-wrapper');
    if (el) { el.classList.remove('hidden'); el.style.display = 'block'; }
    const frBanner = document.getElementById('fr-exam-banner');
    if (frBanner) frBanner.style.display = (typeof currentCourse !== 'undefined' && currentCourse === 'cseb') ? 'none' : 'flex';
  };

  window.showQuestionBanks = function() {
    document.querySelectorAll('.sh-nav li').forEach(li => li.classList.remove('active'));
    const navQb = document.getElementById('nav-qb');
    if(navQb) navQb.classList.add('active');
    hideAllStudyHubTabs();
    const el = document.getElementById('tab-qb');
    if (el) { el.classList.remove('hidden'); el.style.display = 'block'; }
    renderQuestionBanks();
  };

  window.showDayPlanner = function() {
    document.querySelectorAll('.sh-nav li').forEach(li => li.classList.remove('active'));
    const navPl = document.getElementById('nav-planner');
    if(navPl) navPl.classList.add('active');
    hideAllStudyHubTabs();
    const el = document.getElementById('tab-planner');
    if (el) { el.classList.remove('hidden'); el.style.display = 'block'; }
    if (window.renderPlannerDays) {
      const container = document.getElementById('planner-pills-container');
      if (container && container.children.length === 0) {
        window.renderPlannerDays();
        if (window.switchPlannerDay) window.switchPlannerDay(1);
      }
    }
    if (window.lucide) window.lucide.createIcons();
  };

  window.showExamChart = function() {
    document.querySelectorAll('.sh-nav li').forEach(li => li.classList.remove('active'));
    const navEx = document.getElementById('nav-examchart');
    if(navEx) navEx.classList.add('active');
    hideAllStudyHubTabs();
    const el = document.getElementById('tab-examchart');
    if (el) { el.classList.remove('hidden'); el.style.display = 'block'; }
    if (window.lucide) window.lucide.createIcons();
    updateExamCountdown();
  };

  window.switchExamChartTab = function(tabNumber) {
    [1, 2, 3].forEach(num => {
      const el = document.getElementById(`chart-content-${num}`);
      const btn = document.getElementById(`chart-tab-btn-${num}`);
      if (el) {
        if (num === tabNumber) {
          el.classList.remove('hidden');
          el.style.display = 'block';
        } else {
          el.classList.add('hidden');
          el.style.display = 'none';
        }
      }
      if (btn) {
        if (num === tabNumber) {
          btn.style.background = 'var(--acca-red)';
          btn.style.color = 'white';
          btn.style.border = 'none';
        } else {
          btn.style.background = 'var(--panel-bg)';
          btn.style.color = 'var(--text-main)';
          btn.style.border = '1px solid var(--border-color)';
        }
      }
    });
    if (window.lucide) window.lucide.createIcons();
  };

  function updateExamCountdown() {
    const target = new Date('2026-12-10T09:00:00');
    const now = new Date();
    const diffDays = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    const text = diffDays > 0 ? `${diffDays} Days Remaining` : 'Exam Day / Completed';
    const badge = document.getElementById('chart-countdown-text');
    if (badge) badge.textContent = text;
    document.querySelectorAll('.exam-countdown-badge').forEach(b => {
      b.textContent = `â³ ${text} to Dec 10 Exam`;
    });
  }
  setTimeout(updateExamCountdown, 1000);

  window.renderPlannerDays = function() {
    const container = document.getElementById('planner-pills-container');
    if (!container || !window.fr30DayPlan) return;
    container.innerHTML = '';
    window.fr30DayPlan.forEach(dayData => {
      const btn = document.createElement('button');
      btn.id = `planner-btn-${dayData.day}`;
      btn.className = 'sh-btn';
      btn.textContent = `Day ${dayData.day} Plan`;
      btn.style.background = 'var(--panel-bg)';
      btn.style.color = 'var(--text-main)';
      btn.style.border = '1px solid var(--border-color)';
      btn.style.fontWeight = '600';
      btn.onclick = () => window.switchPlannerDay(dayData.day);
      container.appendChild(btn);
    });
  };

  window.switchPlannerDay = function(dayNumber) {
    if (!window.fr30DayPlan) return;
    const titleEl = document.getElementById('planner-header-title');
    if (titleEl) titleEl.textContent = `Day ${dayNumber} Plan`;

    // Update buttons
    window.fr30DayPlan.forEach(dayData => {
      const btnEl = document.getElementById(`planner-btn-${dayData.day}`);
      if (btnEl) {
        if (dayData.day === dayNumber) {
          btnEl.style.background = 'var(--acca-red)';
          btnEl.style.color = 'white';
          btnEl.style.border = '1px solid var(--acca-red)';
        } else {
          btnEl.style.background = 'var(--panel-bg)';
          btnEl.style.color = 'var(--text-main)';
          btnEl.style.border = '1px solid var(--border-color)';
        }
      }
    });

    // Render Content
    const contentContainer = document.getElementById('planner-content-container');
    if (!contentContainer) return;
    
    const dayData = window.fr30DayPlan.find(d => d.day === dayNumber);
    if (!dayData) return;

    let areasHtml = '';
    dayData.areas.forEach(area => {
      areasHtml += `<li><strong>${area}</strong></li>`;
    });

    let tasksHtml = '';
    dayData.tasks.forEach(task => {
      tasksHtml += `
        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 14px; color: var(--text-main);">
          <input type="checkbox" style="width: 16px; height: 16px; cursor: pointer;"> ${task}
        </label>
      `;
    });

    contentContainer.innerHTML = `
      <div class="sh-grid-2" style="gap: 20px; margin-bottom: 30px;">
        <div class="hub-card" style="border-top: 4px solid #3b82f6;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px; color: #3b82f6;">
            <i data-lucide="target" style="width: 22px; height: 22px;"></i>
            <h3 style="margin: 0; font-size: 16px; color: var(--text-main);">Day ${dayData.day} Focus</h3>
          </div>
          <p style="font-size: 17px; font-weight: 600; margin: 0; color: var(--text-main);">${dayData.focus}</p>
        </div>

        <div class="hub-card" style="border-top: 4px solid #10b981;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px; color: #10b981;">
            <i data-lucide="book" style="width: 22px; height: 22px;"></i>
            <h3 style="margin: 0; font-size: 16px; color: var(--text-main);">Topic / Chapter</h3>
          </div>
          <p style="font-size: 16px; font-weight: 600; margin: 0; color: var(--text-main);">${dayData.topic}</p>
        </div>

        <div class="hub-card" style="border-top: 4px solid #f59e0b;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px; color: #f59e0b;">
            <i data-lucide="clock" style="width: 22px; height: 22px;"></i>
            <h3 style="margin: 0; font-size: 16px; color: var(--text-main);">Study Hours</h3>
          </div>
          <p style="font-size: 18px; font-weight: bold; margin: 0; color: var(--text-main);">${dayData.hours}</p>
        </div>

        <div class="hub-card" style="border-top: 4px solid #8b5cf6;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px; color: #8b5cf6;">
            <i data-lucide="check-circle-2" style="width: 22px; height: 22px;"></i>
            <h3 style="margin: 0; font-size: 16px; color: var(--text-main);">Practice Target</h3>
          </div>
          <p style="font-size: 16px; margin: 0; color: var(--text-main);"><strong>${dayData.practice}</strong> <span style="color: var(--text-light); font-size: 14px;">(Numericals: ${dayData.numericals})</span></p>
        </div>

        <div class="hub-card" style="border-top: 4px solid #ec4899;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px; color: #ec4899;">
            <i data-lucide="star" style="width: 22px; height: 22px;"></i>
            <h3 style="margin: 0; font-size: 16px; color: var(--text-main);">Key Areas to Focus</h3>
          </div>
          <ul style="margin: 0; padding-left: 20px; color: var(--text-main); font-size: 15px; line-height: 1.6;">
            ${areasHtml}
          </ul>
        </div>

        <div class="hub-card" style="border-top: 4px solid #06b6d4;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px; color: #06b6d4;">
            <i data-lucide="file-text" style="width: 22px; height: 22px;"></i>
            <h3 style="margin: 0; font-size: 16px; color: var(--text-main);">Study Material & Tasks</h3>
          </div>
          <p style="font-size: 14px; margin: 0 0 10px 0; color: var(--text-light);">Material: <strong>${dayData.material}</strong></p>
          <div style="display: flex; flex-direction: column; gap: 8px; border-top: 1px solid var(--border-color); padding-top: 10px;">
            <strong style="font-size: 13px; color: var(--text-main); text-transform: uppercase;">End of Day Task List:</strong>
            ${tasksHtml}
          </div>
        </div>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
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
  const regNameInput = document.getElementById('reg-name');
  const regEmailInput = document.getElementById('reg-email');
  const regPasswordInput = document.getElementById('reg-password');
  const regConfirmInput = document.getElementById('reg-confirm');
  const registerBtn = document.getElementById('register-btn');
  const regCourseAcca = document.getElementById('reg-course-acca');
  const regCourseCseb = document.getElementById('reg-course-cseb');

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
  
    // Global click listeners for dropdowns
    document.addEventListener('click', (e) => {
      // Course dropdown
      const courseContainer = document.getElementById('course-dropdown-container');
      const courseMenu = document.getElementById('course-dropdown-menu');
      if (courseContainer && courseMenu && !courseContainer.contains(e.target)) {
        courseMenu.classList.add('hidden');
      }
      
      // Filter dropdown
      const filterBtn = document.querySelector('.sh-filter-btn');
      const filterMenu = document.getElementById('filter-dropdown');
      if (filterBtn && filterMenu && !filterBtn.contains(e.target) && !filterMenu.contains(e.target)) {
        filterMenu.classList.add('hidden');
      }
    });
    
    let isTracking = false;
  
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
    
    // UI Course Enrollment Check
    if (window.userProfile && window.userProfile.enrolledCourses) {
       const isCSEBEnrolled = window.userProfile.enrolledCourses.includes('cseb');
       const csebCard = document.getElementById('cseb-card');
       const availableContainer = document.getElementById('available-courses-container');
       const inprogressContainer = document.getElementById('ml-inprogress-content').querySelector('div');
       const availableSection = document.getElementById('ml-available-content');
       
       if (csebCard) {
         if (isCSEBEnrolled) {
            inprogressContainer.appendChild(csebCard);
            availableSection.style.display = 'none';
            document.getElementById('cseb-status-badge').textContent = 'Enrolled';
            document.getElementById('cseb-status-badge').style.background = 'var(--panel-bg)';
            document.getElementById('cseb-status-badge').style.color = 'var(--text-main)';
            const dropdownBtn = document.getElementById('cseb-dropdown-btn');
           if (dropdownBtn) dropdownBtn.style.display = 'flex';
           document.getElementById('cseb-actions').innerHTML = `
              <button onclick="openCourseDetails('cseb')"  style="width: 100%; padding: 10px; background: transparent; border: 1px solid #E3000F; color: #E3000F; font-size: 14px; cursor: pointer; border-radius: 6px; transition: all 0.2s;" onmouseover="this.style.background='#E3000F'; this.style.color='#fff'" onmouseout="this.style.background='transparent'; this.style.color='#E3000F'">View Course Details</button>
              <button onclick="startStudy('cseb')" style="width: 100%; padding: 10px; background: #E3000F; border: none; color: white; font-size: 14px; font-weight: 600; cursor: pointer; border-radius: 6px; transition: background 0.2s;" onmouseover="this.style.background='#B8000C'" onmouseout="this.style.background='#E3000F'">Study</button>
            `;
         } else {
            availableContainer.appendChild(csebCard);
            availableSection.style.display = 'block';
            document.getElementById('cseb-status-badge').textContent = 'Available';
            document.getElementById('cseb-status-badge').style.background = '#10B981';
            document.getElementById('cseb-status-badge').style.color = '#fff';
            const dropdownBtn = document.getElementById('cseb-dropdown-btn');
           if (dropdownBtn) dropdownBtn.style.display = 'none';
           if (window.currentCourse === 'cseb') window.switchCourse('acca');
           document.getElementById('cseb-actions').innerHTML = `
              <button onclick="window.enrollCourse('cseb')"  style="width: 100%; padding: 10px; background: #10B981; border: none; color: white; font-size: 14px; font-weight: 600; cursor: pointer; border-radius: 6px; transition: background 0.2s;" onmouseover="this.style.background='#059669'" onmouseout="this.style.background='#10B981'">Enroll Now (Free)</button>
            `;
         }
       }
    }
    
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
          const data = userDoc.data();
          if (profileEmailElem) profileEmailElem.textContent = data.email || user.email;
          userDataCache = data;
          if (!userDataCache.history) userDataCache.history = [];
          if (!userDataCache.topics) userDataCache.topics = {};
        }
        loadSessionHistory();
      } catch (err) {
        console.error("Error fetching user data", err);
      }
      renderAnalytics();
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
      
      const titleStr = courseValue === 'acca' ? 'For Exams from September 2026 to June 2027 - (FR) Financial Reporting' : 'Kerala Co-operative Service Examination Board (CSEB)';
      const headingDisplay = document.getElementById('course-heading-display');
      const titleDisplay = document.getElementById('course-title-display');
      
      if (headingDisplay) headingDisplay.textContent = titleStr;
      if (titleDisplay) titleDisplay.textContent = titleStr;
      window.currentCourse = courseValue;
      
      // Hide ACCA FR-specific navigation items (Tracker, Exam Chart Strategy, Planner) & discovery banner for CSEB
      const navTracker = document.getElementById('nav-tracker');
      const navExamChart = document.getElementById('nav-examchart');
      const navPlanner = document.getElementById('nav-planner');
      const frExamBanner = document.getElementById('fr-exam-banner');

      if (courseValue === 'cseb') {
        if (navTracker) navTracker.style.display = 'none';
        if (navExamChart) navExamChart.style.display = 'none';
        if (navPlanner) navPlanner.style.display = 'none';
        if (frExamBanner) frExamBanner.style.display = 'none';

        // If currently viewing an ACCA-specific tab, automatically switch to Chapters view
        const tabExamChart = document.getElementById('tab-examchart');
        const tabTracker = document.getElementById('tab-tracker');
        const tabPlanner = document.getElementById('tab-planner');
        if ((tabExamChart && !tabExamChart.classList.contains('hidden')) ||
            (tabTracker && !tabTracker.classList.contains('hidden')) ||
            (tabPlanner && !tabPlanner.classList.contains('hidden'))) {
          if (typeof window.showStudyChapters === 'function') window.showStudyChapters();
        }
      } else {
        if (navTracker) navTracker.style.display = 'flex';
        if (navExamChart) navExamChart.style.display = 'flex';
        if (navPlanner) navPlanner.style.display = 'flex';
        if (frExamBanner) frExamBanner.style.display = 'flex';
      }
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

  window.editingLinkIdx = -1;

  window.renderModalLinks = function() {
    const list = document.getElementById('modal-links-list');
    list.innerHTML = '';
    currentModalLinks.forEach((l, idx) => {
       const li = document.createElement('li');
       li.className = 'sh-link-item';
       li.style.display = 'flex';
       li.style.justifyContent = 'space-between';
       li.style.alignItems = 'center';
       
       const titleLink = document.createElement('a');
       titleLink.href = l.url;
       titleLink.target = '_blank';
       titleLink.textContent = l.title;
       titleLink.style.flex = '1';
       titleLink.style.marginRight = '10px';
       titleLink.style.overflow = 'hidden';
       titleLink.style.textOverflow = 'ellipsis';
       
       const btnGroup = document.createElement('div');
       btnGroup.style.display = 'flex';
       btnGroup.style.gap = '5px';
       
       const upBtn = document.createElement('button');
       upBtn.innerHTML = '<i data-lucide="arrow-up" style="width:16px;height:16px;"></i>';
       upBtn.className = 'sh-del-btn';
       upBtn.style.padding = '5px';
       upBtn.onclick = () => window.moveModalLinkUp(idx);
       if (idx === 0) upBtn.style.visibility = 'hidden';
       
       const downBtn = document.createElement('button');
       downBtn.innerHTML = '<i data-lucide="arrow-down" style="width:16px;height:16px;"></i>';
       downBtn.className = 'sh-del-btn';
       downBtn.style.padding = '5px';
       downBtn.onclick = () => window.moveModalLinkDown(idx);
       if (idx === currentModalLinks.length - 1) downBtn.style.visibility = 'hidden';
       
       const editBtn = document.createElement('button');
       editBtn.innerHTML = '<i data-lucide="edit-2" style="width:16px;height:16px;"></i>';
       editBtn.className = 'sh-del-btn';
       editBtn.style.padding = '5px';
       editBtn.onclick = () => window.editModalLink(idx);
       
       const delBtn = document.createElement('button');
       delBtn.innerHTML = '<i data-lucide="trash-2" style="width:16px;height:16px;"></i>';
       delBtn.className = 'sh-del-btn';
       delBtn.style.color = '#ef4444';
       delBtn.style.padding = '5px';
       delBtn.onclick = () => {
         currentModalLinks.splice(idx, 1);
         if(window.editingLinkIdx === idx) {
            window.editingLinkIdx = -1;
            const btn = document.getElementById('add-link-btn');
            if(btn) btn.textContent = "Add Link";
            document.getElementById('modal-link-title').value = '';
            document.getElementById('modal-link-url').value = '';
         } else if (window.editingLinkIdx > idx) {
            window.editingLinkIdx--;
         }
         renderModalLinks();
       };
       
       btnGroup.appendChild(upBtn);
       btnGroup.appendChild(downBtn);
       btnGroup.appendChild(editBtn);
       btnGroup.appendChild(delBtn);
       
       li.appendChild(titleLink);
       li.appendChild(btnGroup);
       list.appendChild(li);
    });
    if (window.lucide) window.lucide.createIcons();
  };

  window.moveModalLinkUp = function(idx) {
    if (idx > 0) {
      const temp = currentModalLinks[idx];
      currentModalLinks[idx] = currentModalLinks[idx - 1];
      currentModalLinks[idx - 1] = temp;
      if (window.editingLinkIdx === idx) window.editingLinkIdx--;
      else if (window.editingLinkIdx === idx - 1) window.editingLinkIdx++;
      renderModalLinks();
    }
  };

  window.moveModalLinkDown = function(idx) {
    if (idx < currentModalLinks.length - 1) {
      const temp = currentModalLinks[idx];
      currentModalLinks[idx] = currentModalLinks[idx + 1];
      currentModalLinks[idx + 1] = temp;
      if (window.editingLinkIdx === idx) window.editingLinkIdx++;
      else if (window.editingLinkIdx === idx + 1) window.editingLinkIdx--;
      renderModalLinks();
    }
  };

  window.editModalLink = function(idx) {
    window.editingLinkIdx = idx;
    const l = currentModalLinks[idx];
    document.getElementById('modal-link-title').value = l.title;
    document.getElementById('modal-link-url').value = l.url;
    const btn = document.getElementById('add-link-btn');
    if(btn) btn.textContent = "Update Link";
  };

  window.addModalLink = function() {
    const t = document.getElementById('modal-link-title').value.trim();
    const u = document.getElementById('modal-link-url').value.trim();
    if(t && u) {
      if (window.editingLinkIdx !== -1) {
        currentModalLinks[window.editingLinkIdx] = {title: t, url: u};
        window.editingLinkIdx = -1;
        const btn = document.getElementById('add-link-btn');
        if(btn) btn.textContent = "Add Link";
      } else {
        currentModalLinks.push({title: t, url: u});
      }
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
      alert("Failed to save: " + e.message + "\nIf it says missing permissions, please update your Firestore Rules in the Firebase Console using the firestore.rules file.");
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

  window.clearNotifications = function() {
    const list = document.getElementById('notif-list');
    const badgeD = document.getElementById('notif-badge-desktop');
    const badgeM = document.getElementById('notif-badge-mobile');
    if(list) list.innerHTML = '<li style="padding: 10px 0; color: var(--text-light); text-align: center;">You have no new notifications.</li>';
    if(badgeD) badgeD.style.display = 'none';
    if(badgeM) badgeM.style.display = 'none';
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

    let found = false;
    courseStructure[currentCourse].forEach((ch, idx) => {
      if (ch.toLowerCase().includes(query)) {
        found = true;
        const li = document.createElement('li');
        li.style.padding = '8px';
        li.style.borderBottom = '1px solid var(--border-color)';
        li.style.cursor = 'pointer';
        li.textContent = ch;
        li.onclick = () => {
          window.toggleSearch();
          window.showStudyChapters();
          setTimeout(() => {
            const accs = document.querySelectorAll('.sh-acc-item');
            if (accs[idx]) {
              const header = accs[idx].querySelector('.sh-acc-header');
              if (header) {
                  const bodyElement = header.nextElementSibling;
                  if (bodyElement && bodyElement.style.display !== 'block') {
                      window.toggleAccordion(header);
                  }
              }
              accs[idx].scrollIntoView({behavior: 'smooth', block: 'center'});
            }
          }, 150);
        };
        resultsUl.appendChild(li);
      }
    });
    
    if (!found) {
      resultsUl.innerHTML = '<li style="padding: 12px; color: var(--text-light); text-align: center;">No chapters found.</li>';
    }
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
      let accaMastered = 0;
      let csebMastered = 0;
      
      snap.forEach(doc => {
        const chapterId = doc.id;
        const data = doc.data();
        
        if (data.bookmarked) bookmarkCount++;
        if (data.confidence === 'green') {
           highConfCount++;
           if (chapterId.startsWith('cseb_')) csebMastered++;
           else if (chapterId.startsWith('chapter_')) accaMastered++;
        }
        
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
      
      // Update progress percentages
      const accaTotal = typeof courseStructure !== 'undefined' && courseStructure.acca ? courseStructure.acca.length : 1;
      const csebTotal = typeof courseStructure !== 'undefined' && courseStructure.cseb ? courseStructure.cseb.length : 1;
      
      const accaPercent = Math.floor((accaMastered / accaTotal) * 100);
      const csebPercent = Math.floor((csebMastered / csebTotal) * 100);
      
      const pAcca = document.getElementById('progress-acca');
      const pCseb = document.getElementById('progress-cseb');
      if (pAcca) pAcca.textContent = accaPercent + '% Completed';
      if (pCseb) pCseb.textContent = csebPercent + '% Completed';
      
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
  let currentSessionId = null;
  
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

      // Update current session duration
      if (currentSessionId) {
        db.collection("users").doc(auth.currentUser.uid).collection("sessions").doc(currentSessionId).update({
          durationMinutes: firebase.firestore.FieldValue.increment(1)
        }).catch(() => {});
      }
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
      
      // Setup session tracking
      if (!currentSessionId) {
        currentSessionId = Date.now().toString();
        const dateStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
        db.collection("users").doc(user.uid).collection("sessions").doc(currentSessionId).set({
          sessionId: currentSessionId,
          loginTime: firebase.firestore.FieldValue.serverTimestamp(),
          logoutTime: null,
          durationMinutes: 0,
          date: dateStr
        }, { merge: true }).catch(console.error);
      }
      
      updateDashboardData(); // Update user profile name and email
      renderChapters();
      showScreen('mylearning');
      startStudyTimer();
    } else {
      currentUserIsAdmin = false;
      currentSessionId = null;
      showScreen('login');
      stopStudyTimer();
    }
    
    // Hide Splash Screen
    setTimeout(() => {
      const splash = document.getElementById('splash-screen');
      if (splash) {
        splash.style.opacity = '0';
        splash.style.visibility = 'hidden';
        setTimeout(() => splash.style.display = 'none', 500); // Fully hide after fade
        sessionStorage.setItem('splashShown', 'true');
      }
    }, 1000);
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

  document.addEventListener('click', (e) => {
    const toggleIcon = e.target.closest('#toggle-password');
    if (toggleIcon) {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      
      if (type === 'text') {
        toggleIcon.setAttribute('data-lucide', 'eye-off');
      } else {
        toggleIcon.setAttribute('data-lucide', 'eye');
      }
      lucide.createIcons();
    }
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

  window.signOutUser = async function() {
    try {
      if (auth.currentUser && currentSessionId) {
        await db.collection("users").doc(auth.currentUser.uid).collection("sessions").doc(currentSessionId).update({
          logoutTime: firebase.firestore.FieldValue.serverTimestamp()
        }).catch(console.error);
        currentSessionId = null;
      }
    } catch (err) {
      console.error("Error updating session on logout:", err);
    }
    try {
      await auth.signOut();
    } catch (error) {
      console.error("Sign out error:", error);
      alert("Error signing out: " + error.message);
    }
  };

  if (navLogout) {
    navLogout.addEventListener('click', (e) => {
      e.preventDefault();
      window.signOutUser();
    });
  }

  // --- Auth Navigation ---
  if (linkCreateAccount) {
    linkCreateAccount.addEventListener('click', (e) => {
      e.preventDefault();
      showScreen('register');
    });
  }
  if (linkForgotPassword) {
    linkForgotPassword.addEventListener('click', (e) => {
      e.preventDefault();
      showScreen('forgot');
    });
  }
  if (linkBackLogin1) {
    linkBackLogin1.addEventListener('click', (e) => {
      e.preventDefault();
      showScreen('login');
    });
  }
  if (linkBackLogin2) {
    linkBackLogin2.addEventListener('click', (e) => {
      e.preventDefault();
      showScreen('login');
    });
  }
  function validateRegisterForm() { if (registerBtn && regEmailInput && regPasswordInput && regConfirmInput) { registerBtn.disabled = !(regEmailInput.value.trim() !== '' && regPasswordInput.value.trim() !== '' && regConfirmInput.value.trim() !== ''); } }
  if (regEmailInput) regEmailInput.addEventListener('input', validateRegisterForm);
  if (regPasswordInput) regPasswordInput.addEventListener('input', validateRegisterForm);
  if (regConfirmInput) regConfirmInput.addEventListener('input', validateRegisterForm);

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (regPasswordInput.value !== regConfirmInput.value) {
      alert("Passwords do not match!");
      return;
    }
    const email = regEmailInput.value.trim();
    const password = regPasswordInput.value.trim();
    const displayName = regNameInput ? regNameInput.value.trim() : email.split('@')[0];
    
    const selectedCourses = [];
    if (regCourseAcca && regCourseAcca.checked) selectedCourses.push('acca');
    if (regCourseCseb && regCourseCseb.checked) selectedCourses.push('cseb');
    if (selectedCourses.length === 0) {
       alert("Please select at least one course to enroll in.");
       return;
    }
    
    try {
      registerBtn.textContent = 'Creating...';
      registerBtn.disabled = true;
      
      // Create Auth User
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;
      
      // Update Profile Name
      await user.updateProfile({ displayName: displayName });
      
      // Initialize Profile Document
      await db.collection('users').doc(user.uid).set({
        email: user.email,
        displayName: displayName,
        enrolledCourses: selectedCourses,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        history: [],
        topics: {}
      });
      
      alert('Registration successful! Please log in.');
      showScreen('login');
      registerForm.reset();
    } catch (error) {
      console.error(error);
      alert('Registration Failed: ' + error.message);
    } finally {
      if (registerBtn) {
        registerBtn.textContent = 'Create Account';
        registerBtn.disabled = false;
      }
    }
  });

  if (forgotForm) {
    forgotForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = forgotEmailInput ? forgotEmailInput.value.trim() : '';
      if (!email) {
        alert('Please enter your registered email.');
        return;
      }
      try {
        if (forgotBtn) {
          forgotBtn.textContent = 'Sending...';
          forgotBtn.disabled = true;
        }
        await auth.sendPasswordResetEmail(email);
        alert('Password reset email sent! Please check your inbox.');
        showScreen('login');
        forgotForm.reset();
      } catch (err) {
        console.error(err);
        alert('Reset Failed: ' + err.message);
      } finally {
        if (forgotBtn) {
          forgotBtn.textContent = 'Send Reset Link';
          forgotBtn.disabled = false;
        }
      }
    });
  }

  // --- Study Tracker Logic ---
  let trackerData = [];
  let trackerSortCol = 'date';
  let trackerSortAsc = false;

  window.toggleTracker = function() {
    try {
      const trackerTab = document.getElementById('tab-tracker');
      const profileTab = document.getElementById('tab-profile');
      const qbTab = document.getElementById('tab-qb');
      const plannerTab = document.getElementById('tab-planner');
      const contentWrapper = document.getElementById('sh-content-wrapper');
      
      if (!trackerTab) { alert('Tracker tab not found in DOM'); return; }
      
      const isVisible = trackerTab.style.display === 'block';
      
      if (!isVisible) {
        document.querySelectorAll('.sh-nav li').forEach(li => li.classList.remove('active'));
        const navTr = document.getElementById('nav-tracker');
        if (navTr) navTr.classList.add('active');
      } else {
        const navCh = document.getElementById('nav-chapters');
        if(navCh) navCh.classList.add('active');
      }
      
      if (isVisible) {
        trackerTab.classList.add('hidden');
        trackerTab.style.display = 'none';
        if (contentWrapper) {
          contentWrapper.classList.remove('hidden');
          contentWrapper.style.display = 'block';
          contentWrapper.style.opacity = '1';
          contentWrapper.style.visibility = 'visible';
        }
      } else {
        if (contentWrapper) { contentWrapper.classList.add('hidden'); contentWrapper.style.display = 'none'; }
        if (qbTab) { qbTab.classList.add('hidden'); qbTab.style.display = 'none'; }
        if (profileTab) { profileTab.classList.add('hidden'); profileTab.style.display = 'none'; }
        if (plannerTab) { plannerTab.classList.add('hidden'); plannerTab.style.display = 'none'; }
        const examTab = document.getElementById('tab-examchart');
        if (examTab) { examTab.classList.add('hidden'); examTab.style.display = 'none'; }
        
        trackerTab.classList.remove('hidden');
        trackerTab.style.display = 'block';
        trackerTab.style.opacity = '1';
        trackerTab.style.visibility = 'visible';
        
        const subjectEl = document.getElementById('track-subject');
        if (subjectEl) subjectEl.value = currentCourse === 'acca' ? 'Financial Reporting (FR)' : 'Kerala Co-operative Service Examination Board (CSEB)';
        
        const chapterEl = document.getElementById('track-chapter');
        if (chapterEl && typeof courseStructure !== 'undefined' && courseStructure[currentCourse]) {
            chapterEl.innerHTML = '<option value="">Select Chapter</option>';
            courseStructure[currentCourse].forEach(ch => {
                chapterEl.innerHTML += '<option value="' + ch + '">' + ch + '</option>';
            });
        }
        
        const dateInput = document.getElementById('track-date');
        if (dateInput && !dateInput.value) {
           const d = new Date();
           dateInput.value = d.toISOString().split('T')[0];
        }
        
        window.loadTrackerData();
      }
    } catch(err) {
      alert('Toggle Tracker Error: ' + err.message);
    }
  };

  window.submitTracker = async function(e) {
    e.preventDefault();
    if (!auth.currentUser) return;
    
    const btn = document.getElementById('track-submit-btn');
    btn.textContent = 'Saving...';
    btn.disabled = true;
    
    const data = {
      subject: document.getElementById('track-subject').value,
      chapter: document.getElementById('track-chapter').value,
      source: document.getElementById('track-source').value,
      section: document.getElementById('track-section').value,
      qty: document.getElementById('track-qty').value.trim(),
      timeMins: parseInt(document.getElementById('track-time').value, 10),
      dateStr: document.getElementById('track-date').value,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    try {
      await db.collection('users').doc(auth.currentUser.uid).collection('studyTracker').add(data);
      document.getElementById('tracker-form').reset();
      document.getElementById('track-date').valueAsDate = new Date();
      if (window.currentCourse) {
         document.getElementById('track-subject').value = window.currentCourse.title || window.currentCourse.id || '';
      }
      await window.loadTrackerData();
    } catch (err) {
      console.error("Error saving tracker entry", err);
      alert("Failed to save entry: " + err.message);
    } finally {
      btn.textContent = 'Log Session';
      btn.disabled = false;
    }
  };

  window.loadTrackerData = async function() {
    const tbody = document.getElementById('tracker-table-body');
    if (!auth.currentUser || !tbody) return;
    
    try {
      const snap = await db.collection('users').doc(auth.currentUser.uid).collection('studyTracker').get();
      trackerData = [];
      snap.forEach(doc => {
        trackerData.push({ id: doc.id, ...doc.data() });
      });
      
      window.renderTrackerTable();
    } catch (err) {
      console.error("Error loading tracker data", err);
      tbody.innerHTML = `<tr><td colspan="8" style="color: var(--conf-red); text-align: center; padding: 20px;">Failed to load data: ${err.message}</td></tr>`;
    }
  };

  window.sortTracker = function(col) {
    if (trackerSortCol === col) {
      trackerSortAsc = !trackerSortAsc;
    } else {
      trackerSortCol = col;
      trackerSortAsc = true;
    }
    window.renderTrackerTable();
  };
  
  window.searchTracker = function() {
    window.renderTrackerTable();
  };

  window.renderTrackerTable = function() {
    const tbody = document.getElementById('tracker-table-body');
    if (!tbody) return;
    
    const query = (document.getElementById('track-search').value || '').toLowerCase();
    
    const d = new Date();
    const pad = (n) => (n < 10 ? '0' + n : n);
    const todayStr = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
    
    const isSpecificSearch = query && (query.length > 3 || /\d/.test(query));

    let filtered = trackerData.filter(item => {
      
      if (!isSpecificSearch) {
        return item.dateStr === todayStr;
      }
      
      const subj = (item.subject || '').toLowerCase();
      const chap = (item.chapter || '').toLowerCase();
      return subj.includes(query) || chap.includes(query);
    });
    
    filtered.sort((a, b) => {
      let valA, valB;
      if (trackerSortCol === 'date') {
        valA = a.dateStr || ''; valB = b.dateStr || '';
      } else if (trackerSortCol === 'subject') {
        valA = (a.subject || '').toLowerCase(); valB = (b.subject || '').toLowerCase();
      } else if (trackerSortCol === 'chapter') {
        valA = (a.chapter || '').toLowerCase(); valB = (b.chapter || '').toLowerCase();
      } else if (trackerSortCol === 'source') {
        valA = (a.source || '').toLowerCase(); valB = (b.source || '').toLowerCase();
      } else {
        valA = a[trackerSortCol]; valB = b[trackerSortCol];
      }
      
      if (valA < valB) return trackerSortAsc ? -1 : 1;
      if (valA > valB) return trackerSortAsc ? 1 : -1;
      return 0;
    });
    
    if (filtered.length === 0) {
      const emptyMsg = isSpecificSearch 
        ? "No practice sessions found for this search." 
        : (query ? "Keep typing to search full history..." : "No practice sessions logged today.");
      tbody.innerHTML = `<tr><td colspan="8" style="padding: 20px; text-align: center; color: var(--text-light);">${emptyMsg}</td></tr>`;
      return;
    }
    
    let html = '';
    filtered.forEach(item => {
      html += `<tr style="border-bottom: 1px solid var(--border-color); background: var(--bg-main);">
        <td style="padding: 12px; font-size: 13px; color: var(--text-main);">${item.dateStr || '-'}</td>
        <td style="padding: 12px; font-size: 13px; color: var(--text-main); font-weight: 500;">${item.subject || '-'}</td>
        <td style="padding: 12px; font-size: 13px; color: var(--text-main);">${item.chapter || '-'}</td>
        <td style="padding: 12px; font-size: 13px;"><span style="background: rgba(0,0,0,0.05); padding: 2px 6px; border-radius: 4px;">${item.source || '-'}</span></td>
        <td style="padding: 12px; font-size: 13px; color: var(--text-light);">${item.section || '-'}</td>
        <td style="padding: 12px; font-size: 13px; font-weight: 600; text-align: right; color: var(--acca-red);">${item.qty || 0}</td>
        <td style="padding: 12px; font-size: 13px; color: var(--text-light); text-align: right;">${item.timeMins || 0}m</td>
        <td style="padding: 12px; font-size: 13px; text-align: center;">
          <button onclick="window.deleteTrackerEntry('${item.id}')" style="background: none; border: none; color: #DC2626; cursor: pointer; padding: 4px; border-radius: 4px;" title="Delete Entry" onmouseover="this.style.background='#FEE2E2'" onmouseout="this.style.background='none'">
            <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
          </button>
        </td>
      </tr>`;
    });
    tbody.innerHTML = html;
    if (window.lucide) window.lucide.createIcons();
  };

  window.deleteTrackerEntry = async function(id) {
    if (!confirm("Are you sure you want to delete this study session? This cannot be undone.")) return;
    try {
      await db.collection('users').doc(auth.currentUser.uid).collection('studyTracker').doc(id).delete();
      await window.loadTrackerData();
    } catch(err) {
      console.error(err);
      alert('Failed to delete: ' + err.message);
    }
  };

} catch (err) { alert('Init Crash: ' + err.stack); } });
window.openCourseDetails = function(courseId) {
  const modal = document.getElementById('course-details-modal');
  const title = document.getElementById('cd-modal-title');
  const content = document.getElementById('cd-modal-content');
  const startBtn = document.getElementById('cd-modal-start-btn');
  
  if (!modal) return;
  
  if(courseId === 'acca') {
    title.textContent = 'ACCA Financial Reporting (FR)';
    content.innerHTML = `
      <h3 style="margin-top: 0; color: #E3000F;">Overview</h3>
      <p style="color: var(--text-light);">The Financial Reporting (FR) syllabus develops knowledge and skills in understanding and applying accounting standards and the theoretical framework in the preparation of financial statements of entities, including groups and how to analyze and interpret those financial statements.</p>
      
      <h3 style="color: #E3000F;">Exam Format</h3>
      <ul style="padding-left: 20px; color: var(--text-light);">
        <li><strong>Section A:</strong> 15 objective test questions (30 marks)</li>
        <li><strong>Section B:</strong> 3 objective test cases with 5 questions each (30 marks)</li>
        <li><strong>Section C:</strong> 2 constructed response questions (40 marks)</li>
      </ul>
      
      <div style="background: rgba(227, 0, 15, 0.05); padding: 15px; border-left: 4px solid #E3000F; border-radius: 4px; margin-top: 20px;">
        <div style="display: flex; gap: 20px; color: var(--text-main);">
           <div><strong>Duration:</strong> 3 Hours</div>
           <div><strong>Pass Mark:</strong> 50%</div>
        </div>
      </div>
    `;
    startBtn.onclick = function() {
       modal.classList.add('hidden');
       startStudy('acca');
    };
  } else if (courseId === 'cseb') {
    title.textContent = 'Kerala Cooperative Service Examination Board (CSEB)';
    content.innerHTML = `
      <h3 style="margin-top: 0; color: #E3000F;">Overview</h3>
      <p style="color: var(--text-light);">The KSCEB conducts written examinations for the recruitment of various positions within co-operative societies in Kerala, including roles such as Junior Clerk/Cashier, Secretary, Assistant Secretary, and System Administrator.</p>
      
      <h3 style="color: #E3000F;">Syllabus Core Areas</h3>
      <ul style="padding-left: 20px; color: var(--text-light);">
        <li><strong>Co-operation:</strong> Principles and practices of cooperation, Co-operative Act and Rules.</li>
        <li><strong>Banking & Accounting:</strong> Fundamentals of banking, accounting principles, auditing.</li>
        <li><strong>General Knowledge & English:</strong> Grammar, vocabulary, and Kerala current affairs.</li>
        <li><strong>Mathematics & Reasoning:</strong> Numerical ability and logical reasoning skills.</li>
      </ul>
      
      <div style="background: rgba(227, 0, 15, 0.05); padding: 15px; border-left: 4px solid #E3000F; border-radius: 4px; margin-top: 20px;">
        <div style="display: flex; flex-direction: column; gap: 5px; color: var(--text-main);">
           <div><strong>Selection Process:</strong> Written exam (objective type) + Interview</div>
           <div><strong>Target Posts:</strong> Clerks, Cashiers, Administrators</div>
        </div>
      </div>
    `;
    startBtn.onclick = function() {
       modal.classList.add('hidden');
       startStudy('cseb');
    };
  }
  
  modal.classList.remove('hidden');
  if (window.lucide) window.lucide.createIcons();
};
















