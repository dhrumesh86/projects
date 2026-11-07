/* Additive concept refresh; use existing navigation and saved learning state. */
(function () {
  'use strict';
  const home = document.getElementById('view-home');
  if (!home) return;
  const section = document.createElement('section');
  section.className = 'concept-journey';
  section.setAttribute('aria-labelledby', 'concept-journey-title');
  section.innerHTML = '<h2 id="concept-journey-title">A little learning. A lot of possibility.</h2><div class="concept-actions"></div>';
  const actions = [
    ['📚', 'Find your next discovery', 'Preschool to Grade 12 starter lessons', () => window.openExplore && window.openExplore()],
    ['🧩', 'Build something brilliant', 'Run, debug and explore in Code Quest', () => railGo('code')],
    ['✏️', 'Show your thinking', 'Sketch an idea on your drawing pad', () => railGo('draw')]
  ];
  for (const [icon, title, description, action] of actions) {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'concept-action';
    button.innerHTML = '<span class="concept-icon" aria-hidden="true">' + icon + '</span><span><strong>' + title + '</strong><small>' + description + '</small></span>';
    button.addEventListener('click', action);
    section.querySelector('.concept-actions').appendChild(button);
  }
  home.querySelector('.hero').after(section);
  const secondary = home.querySelector('.hero button:nth-child(2)');
  if (secondary) secondary.classList.add('hero-secondary');
})();
