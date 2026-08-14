// ==========================================
// PRACTICE MOCK EXAM LOGIC
// ==========================================

let practiceState = {
  currentChapter: null,
  questions: [],
  currentIndex: 0,
  timerInterval: null,
  timeSpentSeconds: 0,
  answers: {}
};

window.showPracticeDashboard = function() {
  document.querySelectorAll('.sh-nav li').forEach(li => li.classList.remove('active'));
  const navPractice = document.getElementById('nav-practice');
  if (navPractice) navPractice.classList.add('active');
  window.hideAllStudyHubTabs();
  
  const frBanner = document.getElementById('fr-exam-banner');
  if (frBanner) frBanner.style.display = 'none';

  const pds = document.getElementById('practice-dashboard-screen');
  if (pds) {
    pds.classList.remove('hidden');
    pds.style.display = 'block';
  }

  window.renderPracticeDashboard();
};

window.renderPracticeDashboard = function() {
  let practiceHistory = JSON.parse(localStorage.getItem('practiceHistory') || '{}');
  
  let totalTaken = 0;
  let totalCorrect = 0;
  let totalTime = 0;
  
  Object.values(practiceHistory).forEach(record => {
    totalTaken++;
    if (record.isCorrect) totalCorrect++;
    totalTime += (record.timeSpent || 0);
  });
  
  const totalAvailable = typeof practiceQuestions !== 'undefined' ? practiceQuestions.length : 0;
  const percentComplete = totalAvailable > 0 ? Math.round((totalTaken / totalAvailable) * 100) : 0;
  const correctPercent = totalTaken > 0 ? Math.round((totalCorrect / totalTaken) * 100) : 0;
  const avgTime = totalTaken > 0 ? Math.round(totalTime / totalTaken) : 0;
  
  const pb = document.getElementById('practice-progress-bar');
  if (pb) pb.style.width = percentComplete + '%';
  
  document.getElementById('stat-taken').textContent = totalTaken + ' of ' + totalAvailable;
  document.getElementById('stat-correct').textContent = totalCorrect + ' of ' + totalTaken;
  document.getElementById('stat-percent').textContent = correctPercent + '%';
  
  document.getElementById('stat-total-time').textContent = window.formatTimePr(totalTime);
  document.getElementById('stat-avg-time').textContent = window.formatTimePr(avgTime);
  
  const catList = document.getElementById('practice-categories-list');
  if (catList && typeof courseStructure !== 'undefined' && courseStructure['acca']) {
    let html = '';
    courseStructure['acca'].forEach(ch => {
      const chQuestions = typeof practiceQuestions !== 'undefined' ? practiceQuestions.filter(q => q.chapter === ch) : [];
      const totalInCh = chQuestions.length;
      let completedInCh = 0;
      chQuestions.forEach(q => {
        if (practiceHistory[q.id]) completedInCh++;
      });
      
      html += `
        <tr style="border-bottom: 1px solid #eee; transition: background 0.2s;">
          <td style="padding: 15px 5px;">
            <a href="javascript:void(0)" onclick="window.startPractice('${ch}')" style="color: var(--acca-red); text-decoration: none; font-weight: 500;">
              Exam Style and Standard OT Revision Questions ${ch}
            </a>
          </td>
          <td style="text-align: right; padding: 15px 5px; color: #666; font-size: 13px;">
            ${completedInCh} of ${totalInCh}
          </td>
        </tr>
      `;
    });
    catList.innerHTML = html;
  }
};

window.filterPracticeCategories = function(query) {
  const trs = document.querySelectorAll('#practice-categories-list tr');
  const q = query.toLowerCase();
  trs.forEach(tr => {
    const text = tr.innerText.toLowerCase();
    if (text.includes(q)) {
      tr.style.display = '';
    } else {
      tr.style.display = 'none';
    }
  });
};

window.formatTimePr = function(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map(v => v < 10 ? "0" + v : v).join(":");
};

window.startPractice = function(chapterTitle) {
  if (typeof practiceQuestions === 'undefined') {
    alert("Practice questions not loaded!");
    return;
  }
  
  practiceState.questions = practiceQuestions.filter(q => q.chapter === chapterTitle);
  if (practiceState.questions.length === 0) {
    alert("No practice questions available for this chapter yet.");
    return;
  }
  
  practiceState.currentChapter = chapterTitle;
  practiceState.currentIndex = 0;
  practiceState.answers = {};
  
  window.hideAllStudyHubTabs();
  const examScreen = document.getElementById('exam-screen');
  if (examScreen) {
    examScreen.classList.remove('hidden');
    examScreen.style.display = 'flex';
  }
  
  const sidebar = document.querySelector('.sh-sidebar');
  if (sidebar) sidebar.style.display = 'none';
  const header = document.querySelector('.sh-header');
  if (header) header.style.display = 'none';
  const shMain = document.querySelector('.sh-main');
  if (shMain) shMain.style.padding = '0';
  
  window.loadPracticeQuestion();
};

// Override showPracticeDashboard to reset sidebar
const originalShowPracticeDashboard = window.showPracticeDashboard;
window.showPracticeDashboard = function() {
  const sidebar = document.querySelector('.sh-sidebar');
  if (sidebar) sidebar.style.display = 'flex';
  const header = document.querySelector('.sh-header');
  if (header) header.style.display = 'flex';
  const shMain = document.querySelector('.sh-main');
  if (shMain) shMain.style.padding = '30px';
  
  originalShowPracticeDashboard();
};

window.loadPracticeQuestion = function() {
  const q = practiceState.questions[practiceState.currentIndex];
  document.getElementById('exam-chapter-title').textContent = q.chapter;
  document.getElementById('exam-question-counter').textContent = `Question ${practiceState.currentIndex + 1} of ${practiceState.questions.length}`;
  document.getElementById('exam-question-text').innerHTML = q.text;
  
  const bookmarkBtn = document.getElementById('exam-bookmark-btn');
  if (bookmarkBtn) {
    if (practiceState.flags && practiceState.flags[practiceState.currentIndex]) {
      bookmarkBtn.style.color = 'var(--acca-red)';
      bookmarkBtn.style.fill = 'var(--acca-red)';
    } else {
      bookmarkBtn.style.color = '#6c757d';
      bookmarkBtn.style.fill = 'none';
    }
  }

  const optionsHtml = q.options.map((opt, idx) => {
    return `
      <label id="opt-lbl-${idx}" style="display: flex; align-items: flex-start; gap: 15px; padding: 18px 20px; border: 1px solid #e1e4e8; border-radius: 10px; cursor: pointer; transition: all 0.2s; background: white;" onmouseover="this.style.background='#f8f9fa'; this.style.borderColor='#cbd5e1'" onmouseout="this.style.background='white'; this.style.borderColor='#e1e4e8'" onclick="window.selectPracticeOption(${idx})">
        <input type="radio" name="practice_opt" value="${idx}" style="margin-top: 5px; width: 16px; height: 16px; cursor: pointer;">
        <span style="font-size: 15px; color: #2d3748; line-height: 1.6;">${opt}</span>
      </label>
    `;
  }).join('');
  document.getElementById('exam-options-container').innerHTML = optionsHtml;
  
  document.getElementById('exam-explanation-area').classList.add('hidden');
  document.getElementById('exam-result-badge').classList.add('hidden');
  
  const skipBtn = document.getElementById('exam-skip-btn');
  const nextBtn = document.getElementById('exam-next-btn');
  
  if (skipBtn) {
    skipBtn.classList.remove('hidden');
    if (practiceState.currentIndex >= practiceState.questions.length - 1) {
      skipBtn.textContent = 'Finish Practice';
    } else {
      skipBtn.textContent = 'Skip Question';
    }
  }
  if (nextBtn) nextBtn.classList.add('hidden');
  
  const prevBtn = document.getElementById('exam-prev-btn');
  if (prevBtn) {
    if (practiceState.currentIndex === 0) {
      prevBtn.style.opacity = '0.5';
      prevBtn.style.pointerEvents = 'none';
    } else {
      prevBtn.style.opacity = '1';
      prevBtn.style.pointerEvents = 'auto';
    }
  }
  
  clearInterval(practiceState.timerInterval);
  practiceState.timeSpentSeconds = 0;
  window.updateTimerDisplayPr();
  practiceState.timerInterval = setInterval(() => {
    practiceState.timeSpentSeconds++;
    window.updateTimerDisplayPr();
  }, 1000);

  if (practiceState.answers[practiceState.currentIndex]) {
    window.selectPracticeOption(practiceState.answers[practiceState.currentIndex].selectedIdx, true);
  }
};

window.updateTimerDisplayPr = function() {
  const m = Math.floor(practiceState.timeSpentSeconds / 60);
  const s = practiceState.timeSpentSeconds % 60;
  document.getElementById('exam-timer-display').textContent = `${m} min ${s} secs`;
};

window.selectPracticeOption = function(idx, isRestore = false) {
  if (!isRestore && practiceState.answers[practiceState.currentIndex]) return; // already answered
  
  if (practiceState.timerInterval) {
    clearInterval(practiceState.timerInterval);
    practiceState.timerInterval = null;
  }
  
  const q = practiceState.questions[practiceState.currentIndex];
  const isCorrect = (idx === q.correctAnswerIndex);
  
  if (!isRestore) {
    practiceState.answers[practiceState.currentIndex] = { answered: true, selectedIdx: idx };
    
    let practiceHistory = JSON.parse(localStorage.getItem('practiceHistory') || '{}');
    practiceHistory[q.id] = {
      isCorrect: isCorrect,
      timeSpent: practiceState.timeSpentSeconds,
      timestamp: Date.now()
    };
    localStorage.setItem('practiceHistory', JSON.stringify(practiceHistory));
  }
  
  const lbls = document.querySelectorAll('[id^="opt-lbl-"]');
  lbls.forEach((lbl, i) => {
    lbl.style.pointerEvents = 'none';
    if (i === q.correctAnswerIndex) {
      lbl.style.border = '2px solid #84cc5c';
      lbl.style.background = '#eef2eb';
    } else if (i === idx && !isCorrect) {
      lbl.style.border = '2px solid var(--acca-red)';
      lbl.style.background = '#fef2f2';
    }
  });
  
  const badge = document.getElementById('exam-result-badge');
  const icon = document.getElementById('exam-result-icon');
  const text = document.getElementById('exam-result-text');
  badge.classList.remove('hidden');
  badge.style.display = 'flex';
  if (isCorrect) {
    icon.style.color = '#84cc5c';
    icon.setAttribute('data-lucide', 'check-circle');
    text.style.color = '#84cc5c';
    text.textContent = 'Correct';
  } else {
    icon.style.color = 'var(--acca-red)';
    icon.setAttribute('data-lucide', 'x-circle');
    text.style.color = 'var(--acca-red)';
    text.textContent = 'Incorrect';
  }
  if (window.lucide) window.lucide.createIcons();
  
  const expArea = document.getElementById('exam-explanation-area');
  expArea.innerHTML = q.explanation;
  expArea.classList.remove('hidden');
  
  const skipBtn = document.getElementById('exam-skip-btn');
  const nextBtn = document.getElementById('exam-next-btn');
  
  if (skipBtn) skipBtn.classList.add('hidden');
  if (nextBtn) {
    nextBtn.classList.remove('hidden');
    if (practiceState.currentIndex >= practiceState.questions.length - 1) {
      nextBtn.textContent = 'Finish Practice';
    } else {
      nextBtn.textContent = 'Next Question';
    }
  }
};

window.prevPracticeQuestion = function() {
  if (practiceState.currentIndex > 0) {
    practiceState.currentIndex--;
    window.loadPracticeQuestion();
  }
};

window.nextPracticeQuestion = function(isSkip = false) {
  if (practiceState.currentIndex >= practiceState.questions.length - 1) {
    let correct = 0;
    let wrong = 0;
    let skipped = 0;
    
    practiceState.questions.forEach((q, idx) => {
      const ans = practiceState.answers[idx];
      if (!ans || !ans.answered) {
        skipped++;
      } else {
        if (ans.selectedIdx === q.correctAnswerIndex) correct++;
        else wrong++;
      }
    });
    
    document.getElementById('pr-modal-score').textContent = `${correct} / ${practiceState.questions.length}`;
    document.getElementById('pr-modal-correct').textContent = correct;
    document.getElementById('pr-modal-wrong').textContent = wrong;
    document.getElementById('pr-modal-skipped').textContent = skipped;
    
    // Re-initialize lucide icons inside the modal in case they were added dynamically
    if (window.lucide) window.lucide.createIcons();
    
    document.getElementById('practice-result-modal').classList.remove('hidden');
  } else {
    practiceState.currentIndex++;
    window.loadPracticeQuestion();
  }
};

window.resetAllPracticeStats = function() {
  if(confirm("Are you sure you want to reset all your practice progress?")) {
    localStorage.removeItem('practiceHistory');
    window.renderPracticeDashboard();
  }
};

window.togglePracticeFlag = function() {
  if (!practiceState.flags) practiceState.flags = {};
  practiceState.flags[practiceState.currentIndex] = !practiceState.flags[practiceState.currentIndex];
  
  const bookmarkBtn = document.getElementById('exam-bookmark-btn');
  if (bookmarkBtn) {
    if (practiceState.flags[practiceState.currentIndex]) {
      bookmarkBtn.style.color = 'var(--acca-red)';
      bookmarkBtn.style.fill = 'var(--acca-red)';
    } else {
      bookmarkBtn.style.color = '#333';
      bookmarkBtn.style.fill = 'none';
    }
  }
};
