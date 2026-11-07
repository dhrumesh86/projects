/* Grade-independent catalogue inside the existing Rexy Learn application. */
(async function () {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g,
    c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
  let catalogue;
  try {
    const response = await fetch('catalog.json');
    if (!response.ok) throw new Error('Catalogue unavailable');
    catalogue = await response.json();
  } catch { return; }
  let stage = '2', subject = 'All subjects', lesson = null;
  const view = document.createElement('section');
  view.id = 'view-explore'; view.className = 'view';
  document.querySelector('.wrap').appendChild(view);
  VIEW_META.explore = {t: 'Explore every learning stage', sec: 'explore'};
  const nav = document.createElement('button');
  nav.className = 'rail-tab'; nav.dataset.sec = 'explore';
  nav.setAttribute('aria-label', 'Explore all grades');
  nav.innerHTML = '<span class="ric" aria-hidden="true">🌍</span><span class="rail-label">All grades</span>';
  nav.onclick = () => { openExplore(); if (document.getElementById('app-rail').classList.contains('expanded')) toggleRail(false); };
  document.getElementById('app-rail').insertBefore(nav, document.querySelector('.rail-tab'));
  const home = document.createElement('div');
  home.className = 'card explore-intro';
  home.innerHTML = '<span class="tag">A WORLD OF POSSIBILITIES</span><h2 class="display">Learning has no single starting line.</h2>' +
    '<p>Explore preschool through Grade 12: Mathematics, Science, English &amp; Literacy, and Computing. Find your level. Follow your curiosity.</p>' +
    '<button class="btn primary big" id="explore-home">🌍 Explore all grades &amp; subjects</button>';
  document.getElementById('view-home').prepend(home);
  document.getElementById('explore-home').onclick = () => openExplore();
  window.openExplore = function () { render(); showView('explore'); };

  function render() {
    const subjects = ['All subjects', ...new Set(catalogue.lessons.map(l => l.subject))];
    view.innerHTML = '<span class="tag">GLOBAL TOPICS · ORIGINAL STARTER SAMPLES</span>' +
      '<h1 class="display">Your next discovery starts here.</h1><p>Choose a stage, then explore a subject. Grade labels vary between countries; use the topics to find the right challenge.</p>' +
      '<div class="explore-filters"><label for="explore-stage">Learning stage<select id="explore-stage">' +
      catalogue.stages.map(s => '<option value="' + s.id + '"' + (s.id === stage ? ' selected' : '') + '>' + esc(s.label) + '</option>').join('') +
      '</select></label><label for="explore-subject">Subject<select id="explore-subject">' +
      subjects.map(s => '<option' + (s === subject ? ' selected' : '') + '>' + esc(s) + '</option>').join('') +
      '</select></label></div><p class="notice">These are introductory samples, not a complete syllabus or verified national-curriculum alignment. Sample results last for this visit; your family’s saved backend practice remains in Lessons.</p><div class="lesson-grid" id="explore-cards"></div><div id="explore-workspace" aria-live="polite"></div>';
    document.getElementById('explore-stage').onchange = e => { stage = e.target.value; lesson = null; render(); };
    document.getElementById('explore-subject').onchange = e => { subject = e.target.value; lesson = null; render(); };
    const box = document.getElementById('explore-cards');
    catalogue.lessons.filter(l => l.stage === stage && (subject === 'All subjects' || l.subject === subject)).forEach(l => {
      const card = document.createElement('button');
      card.className = 'card lesson-card'; card.setAttribute('aria-label', 'Try sample: ' + l.title);
      const art = l.subject === 'Computing' ? 'loops' : l.subject === 'Science' ? 'variables' : l.subject === 'Mathematics' ? 'sequencing' : 'events';
      card.innerHTML = '<img class="cq-art" src="assets/code-quest-' + art + '.svg" alt="" width="720" height="360" loading="lazy">' +
        '<div class="world-body"><span class="world-tag">' + esc(l.subject) + '</span><h3>' + esc(l.title) + '</h3><p>' +
        esc(l.level) + ' · ' + l.questions.length + ' starter question' + (l.questions.length === 1 ? '' : 's') + '</p><span class="btn primary">Try this sample →</span></div>';
      card.onclick = () => startSample(l);
      box.appendChild(card);
    });
  }

  function startSample(next) {
    lesson = next;
    const host = document.getElementById('explore-workspace');
    host.innerHTML = '<div class="card"><h2 class="display">' + esc(next.title) + '</h2><p>Try it first. Then check the explanation.</p><form id="explore-answer-form">' +
      next.questions.map((q, index) => '<div class="qbox"><label class="qprompt" for="explore-answer-' + index + '">' + (index + 1) + '. ' + esc(q.prompt) + '</label>' +
        (q.choices ? '<select id="explore-answer-' + index + '" required><option value="">Choose an answer</option>' +
          q.choices.map(c => '<option>' + esc(c) + '</option>').join('') + '</select>' :
          '<input class="numinput" id="explore-answer-' + index + '" inputmode="decimal" type="text" maxlength="100" required>') +
        '<p id="explore-feedback-' + index + '" role="status"></p></div>').join('') +
      '<button type="submit" class="btn primary">Check my sample answers</button><p id="explore-score" role="status"></p></form></div>';
    document.getElementById('explore-answer-form').onsubmit = event => {
      event.preventDefault(); let score = 0;
      next.questions.forEach((q, index) => {
        const given = document.getElementById('explore-answer-' + index).value.trim();
        const correct = q.choices ? given === q.answer : given !== '' && Number.isFinite(Number(given)) && Number(given) === Number(q.answer);
        if (correct) score++;
        document.getElementById('explore-feedback-' + index).textContent =
          (correct ? '✓ Correct. ' : 'Keep exploring. ') + q.explanation;
      });
      document.getElementById('explore-score').textContent = score + ' of ' + next.questions.length +
        ' correct. This sample is practice for this visit and does not change your saved family progress.';
    };
    scrollInPanel(host, 'start');
  }
})();
