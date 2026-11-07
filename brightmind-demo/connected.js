/* One Rexy Learn interface. Static hosting keeps fictional demo mode;
 * the existing Python services activate canonical lessons and saved progress.
 * No credential, backend URL or paid provider is enabled by this file.
 */
(async function () {
  'use strict';
  if (!['localhost', '127.0.0.1', '::1'].includes(location.hostname) &&
      !window.BRIGHTMIND_CONNECTED) return;

  const escape = value => String(value ?? '').replace(/[&<>"']/g,
    c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
  const skills = {
    placeValue: ['g2_place_value'], addSub: ['g2_add_2digit', 'g2_sub_2digit'],
    patterning: ['g2_patterns'], reading: ['g2_reading'],
    counting: ['jk_counting'], numberRecog: ['jk_counting'], letterSounds: ['jk_letters']
  };
  let profiles = {}, activeLesson = null, loading = 0, csrfToken = '';
  let loginPending = null;

  function parentSignIn(reloadAfter = false) {
    if (loginPending) return loginPending;
    loginPending = new Promise(resolve => {
      const dialog = document.createElement('dialog');
      dialog.setAttribute('aria-labelledby', 'family-login-title');
      dialog.style.cssText = 'border:0;border-radius:22px;padding:28px;max-width:min(440px,92vw);color:#10194d';
      dialog.innerHTML = '<h2 id="family-login-title">Welcome to your family workspace</h2>' +
        '<p>A parent signs in before saved student records can be opened.</p>' +
        '<form id="family-login-form"><label for="family-login-pin">Parent PIN</label>' +
        '<input id="family-login-pin" type="password" autocomplete="current-password" required maxlength="256" style="display:block;width:100%;padding:12px;margin:12px 0;font:inherit">' +
        '<button class="btn primary" type="submit">Sign in</button><p id="family-login-message" role="status"></p></form>';
      document.body.appendChild(dialog);
      dialog.addEventListener('cancel', event => event.preventDefault());
      dialog.showModal();
      dialog.querySelector('input').focus();
      dialog.querySelector('form').addEventListener('submit', async event => {
        event.preventDefault();
        const input = dialog.querySelector('input'), button = dialog.querySelector('button');
        const pin = input.value;
        input.value = ''; button.disabled = true;
        try {
          const data = await api('/api/auth/login', {pin});
          csrfToken = data.csrf_token;
          dialog.close(); dialog.remove(); loginPending = null;
          resolve();
          if (reloadAfter) location.reload();
        } catch (error) {
          dialog.querySelector('#family-login-message').textContent = error.message;
          button.disabled = false; input.focus();
        }
      });
    });
    return loginPending;
  }
  async function api(route, body, headers = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(route, {method: body ? 'POST' : 'GET',
        headers: {'Content-Type': 'application/json', ...(body && csrfToken ? {'X-CSRF-Token': csrfToken} : {}), ...headers},
        credentials: 'same-origin',
        body: body ? JSON.stringify(body) : undefined,
        cache: 'no-store', signal: controller.signal});
      const data = await response.json();
      if (response.status === 401 && route !== '/api/auth/login') {
        csrfToken = '';
        void parentSignIn(true);
      }
      if (!response.ok) throw new Error(data.error || 'The server could not complete this request.');
      return data;
    } finally { clearTimeout(timer); }
  }

  try {
    const health = await api('/api/health');
    if (health.authentication_required) {
      const session = await api('/api/auth/session');
      if (session.authenticated) csrfToken = session.csrf_token;
      else await parentSignIn();
      const logout = document.createElement('button');
      logout.className = 'rail-tab'; logout.setAttribute('aria-label', 'Sign out family device');
      logout.innerHTML = '<span class="ric" aria-hidden="true">↪</span><span class="rail-label">Sign out</span>';
      logout.onclick = async () => {
        await api('/api/auth/logout', {});
        csrfToken = ''; location.reload();
      };
      document.getElementById('app-rail').insertBefore(logout, document.getElementById('rail-toggle'));
    }
    const data = await api('/api/students');
    for (const [ui, grade] of [['aarav', '2'], ['meera', 'JK']]) {
      const match = Object.entries(data.students).find(([, child]) => String(child.grade) === grade);
      if (!match) throw new Error('Both student profiles must be configured.');
      profiles[ui] = match[0];
      const first = match[1].name.split(' ')[0];
      // Render the real profile's first name only; static demos retain fictional names.
      CHILDREN[ui].name = match[1].name;
      CHILDREN[ui].first = first;
    }
  } catch (error) {
    document.body.firstElementChild.textContent =
      'Family backend is not connected. These are reference test profiles; results stay in this visit.';
    return;
  }

  document.title = 'BrightMind AI — Rexy Learn';
  document.body.firstElementChild.textContent =
    'Connected learning • Practice answers are saved. Coding projects and learning paths last for this visit only.';
  // Preserve the existing artwork, navigation, accessibility labels and aliases.
  function refreshNames() {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (['SCRIPT', 'STYLE'].includes(node.parentElement?.tagName)) continue;
      if (node.textContent.trim() === 'Aa') node.textContent = CHILDREN.aarav.first.slice(0, 2);
      if (node.textContent.trim() === 'Me') node.textContent = CHILDREN.meera.first.slice(0, 2);
      node.textContent = node.textContent
        .replace(/Aarav(?: Sharma)?/g, CHILDREN.aarav.first)
        .replace(/Meera(?: Sharma)?/g, CHILDREN.meera.first);
    }
    document.querySelectorAll('[aria-label]').forEach(el => {
      el.setAttribute('aria-label', el.getAttribute('aria-label')
        .replace(/Aarav(?: Sharma)?/g, CHILDREN.aarav.first)
        .replace(/Meera(?: Sharma)?/g, CHILDREN.meera.first));
    });
  }
  refreshNames();
  const originalShow = showView;
  window.showView = function (view) {
    if (view !== 'lesson') loading++;
    originalShow(view);
    refreshNames();
  };

  window.startLesson = async function (skill) {
    const request = ++loading, child = currentChild;
    activeLesson = null;
    currentLesson = null;
    document.getElementById('lesson-content').innerHTML = '<div class="card" role="status">Preparing your lesson…</div>';
    showView('lesson');
    try {
      const lessons = await Promise.all((skills[skill] || []).map(id =>
        api('/api/lesson/' + profiles[child] + '/' + id)));
      if (request !== loading || child !== currentChild) return;
      const questions = lessons.flatMap(lesson => lesson.questions.map(q => ({...q, hint: lesson.hint})));
      if (!questions.length) throw new Error('This lesson is not available yet.');
      activeLesson = {skill, child, questions, started: Date.now(), results: [], busy: false, done: false};
      // Existing Drawing Pad and navigation refer to currentLesson, so share its state.
      currentLesson = {skill, questions: questions.map(q => ({...q, hint: q.hint})), answers: {}, hintUsed: {}};
      let html = '<div class="rexy"><div class="bubble"><strong>One small step at a time.</strong><p>' +
        escape(TEACH[skill].rexy) + '</p><button class="btn muse" onclick="openMuseChat(currentChild)">Ask Rexy</button></div></div>' +
        '<h2 class="display">' + escape(TEACH[skill].title) + '</h2>' +
        '<p class="muted">' + escape(CHILDREN[child].first) + ' • Server-checked practice</p>';
      questions.forEach((q, index) => {
        html += '<div class="qbox" id="qbox-' + index + '"><label class="qprompt" for="connected-answer-' + index + '">' +
          (index + 1) + '. ' + escape(q.prompt) + '</label>' +
          (q.story ? '<p class="storybox">' + escape(q.story) + '</p>' : '') +
          '<input class="numinput" type="text" inputmode="' +
          (['reading_recall', 'letter_sound', 'tens_ones', 'pattern_extend', 'count_by'].includes(q.type) ? 'text' : 'numeric') +
          '" maxlength="200" id="connected-answer-' + index + '" autocomplete="off">' +
          '<div><button class="btn amber" onclick="toggleHint(' + index + ')">💡 Hint</button></div>' +
          '<div class="hintbox" id="hint-' + index + '">' + escape(q.hint) + '</div>' +
          '<div id="connected-result-' + index + '" role="status"></div></div>';
      });
      html += '<button class="btn primary big" id="connected-submit" onclick="submitLesson()">Check and save my work</button>' +
        '<div id="lesson-result" role="status"></div>';
      document.getElementById('lesson-content').innerHTML = html;
    } catch (error) {
      if (request === loading) document.getElementById('lesson-content').innerHTML =
        '<div class="card" role="alert">' + escape(error.message) + '</div>';
    }
  };

  window.submitLesson = async function () {
    const lesson = activeLesson;
    if (!lesson || lesson.busy || lesson.done) return;
    lesson.busy = true;
    const button = document.getElementById('connected-submit');
    button.disabled = true;
    const result = document.getElementById('lesson-result');
    result.textContent = 'Checking and saving…';
    try {
      for (let index = lesson.results.length; index < lesson.questions.length; index++) {
        const q = lesson.questions[index];
        const answer = document.getElementById('connected-answer-' + index).value;
        const response = await api('/api/attempt', {
          student_id: profiles[lesson.child], question: {id: q.id}, answer,
          attempt: 1, hints_used: currentLesson.hintUsed[index] ? 1 : 0,
          seconds: Math.round((Date.now() - lesson.started) / 1000), want_llm: false
        });
        lesson.results.push(response);
        document.getElementById('connected-result-' + index).textContent =
          (response.correct ? '✓ Correct. ' : 'Try this next time: ') + response.explanation;
      }
      lesson.done = true;
      const correct = lesson.results.filter(r => r.correct).length;
      const stats = progress[lesson.child].skills[lesson.skill];
      stats.attempts += lesson.questions.length;
      stats.correct += correct;
      stats.completed++;
      progress[lesson.child].sessions.push({skill: lesson.skill, correct,
        total: lesson.questions.length, seconds: Math.round((Date.now() - lesson.started) / 1000),
        when: new Date().toLocaleTimeString()});
      result.textContent = 'Saved to this server: ' + correct + ' of ' + lesson.questions.length +
        ' correct. Your grown-up can review the saved attempts in Parent Dashboard.';
      button.textContent = '✓ Work saved';
      renderHomeProgress();
    } catch (error) {
      // No automatic retry: transaction/idempotency hardening is still required.
      result.textContent = 'Saving stopped. ' + error.message +
        ' Ask a parent before retrying; some earlier answers may already be saved.';
      button.textContent = 'Saving paused — ask a parent';
    } finally { lesson.busy = false; }
  };

  window.renderDashboard = function () {
    document.getElementById('dash-path').textContent = '';
    document.getElementById('dash-code').textContent = '';
    const host = document.getElementById('dash-content');
    host.innerHTML = '<div class="card"><h3>Parent review</h3><p>Open saved progress for ' +
      escape(CHILDREN[dashChild].first) + '.</p><form id="connected-parent-form">' +
      '<label for="connected-pin">Parent PIN</label><input id="connected-pin" type="password" autocomplete="off" required>' +
      '<button class="btn primary" type="submit">View saved progress</button></form>' +
      '<div id="connected-parent-result" role="status"></div></div>';
    document.getElementById('connected-parent-form').addEventListener('submit', async event => {
      event.preventDefault();
      const child = dashChild, input = document.getElementById('connected-pin'), pin = input.value;
      input.value = '';
      const output = document.getElementById('connected-parent-result');
      output.textContent = 'Opening saved progress…';
      try {
        const data = await api('/api/parent/dashboard/' + profiles[child], null, {'X-Parent-PIN': pin});
        if (child !== dashChild) return;
        output.innerHTML = '<h3>' + escape(CHILDREN[child].first) + '’s saved progress</h3>' +
          '<p><strong>' + data.attempts_total + '</strong> answers saved.</p>' +
          data.mastery.map(item => '<div class="card"><strong>' + escape(item.skill_id.replaceAll('_', ' ')) +
            '</strong><p>' + escape(item.level) + ' • ' + Math.round(Number(item.accuracy) * 100) +
            '% correct across ' + Number(item.total) + ' answers</p></div>').join('');
      } catch (error) { output.textContent = error.message; }
    });
  };

  window.sendMuseText = async function (text) {
    if (!text?.trim()) return;
    addMuseMsg(text, 'user');
    const child = museLearner === 'parent' ? currentChild : museLearner;
    const q = activeLesson?.questions[window._qCur || 0];
    try {
      const data = await api('/api/chat', {student_id: profiles[child], message: text.slice(0, 500),
        context: {skill_id: q?.skill || '', question_prompt: q?.prompt || ''}});
      addMuseMsg(data.reply, 'muse');
    } catch (error) { addMuseMsg('Rexy is unavailable. Try the lesson hint, or ask a grown-up.', 'muse'); }
  };
})();
