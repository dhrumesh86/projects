/* ============================================================================
   BrightMind AI — Rexy Learn · demo app (self-contained, session-only)
   No server, no accounts, no tracking. All progress lives in memory and
   clears when this page closes. The tutor is a built-in helper with
   scripted, guided steps — it never just hands out the answer.
   The planned live tutor (OmniRoute AI first, local LLM on the family PC
   as the automatic fallback) is described as planned, never as live here.
   ============================================================================ */
'use strict';

/* ============================== DATA ============================== */
var CHILDREN = {
  dhyey: { id:'dhyey', name:'Dhyey Patel', first:'Dhyey', level:'Grade 2, Ontario', jk:false, avatar:'Dy' },
  dhyan: { id:'dhyan', name:'Dhyan Patel', first:'Dhyan', level:'Junior Kindergarten, age 4', jk:true, avatar:'Dn' }
};
var SKILLS = {
  dhyey: [
    {id:'placeValue', name:'Place Value (tens & ones, to 200)', icon:'🔢', world:'Number Island', mins:5, short:'Place Value'},
    {id:'addSub', name:'Addition & Subtraction (2-digit)', icon:'➕', world:'Number Island', mins:5, short:'Adding & Subtracting'},
    {id:'patterning', name:'Patterning (2s, 5s, 10s & shapes)', icon:'🔷', world:'Number Island', mins:4, short:'Patterning'},
    {id:'reading', name:'Reading Comprehension', icon:'📖', world:'Reading Forest', mins:4, short:'Reading'}
  ],
  dhyan: [
    {id:'counting', name:'Counting to 10', icon:'🍎', world:'Number Island', mins:3, short:'Counting'},
    {id:'numberRecog', name:'Number Recognition (1–10)', icon:'🔟', world:'Number Island', mins:3, short:'Finding Numbers'},
    {id:'letterSounds', name:'Letter Sounds', icon:'🔤', world:'Reading Forest', mins:3, short:'Letter Sounds'}
  ]
};
var PATHS = {
  dhyey: { course:'Number Island — Grade 2 Math', term:'Term 1 • Built around the Wed Nov 11 math quiz (30 marks)', goals:[
    {id:'goal-placeValue', skill:'placeValue', title:'Place Value', detail:'Tens & ones to 200, hundreds, 10 more, comparing numbers.', align:'Quiz Part A — Place Value'},
    {id:'goal-addSub', skill:'addSub', title:'Addition & Subtraction', detail:'2-digit adding and taking away, ones first then tens, plus word problems.', align:'Quiz Part B — Addition & Subtraction'},
    {id:'goal-patterning', skill:'patterning', title:'Patterning', detail:'Counting by 2s, 5s and 10s, backwards by 10s, and shape patterns.', align:'Quiz Part C — Patterning'}
  ]},
  dhyan: { course:'JK Foundations — Numbers & Letters', term:'Junior Kindergarten • Tiny goals, picture-led, one step at a time', goals:[
    {id:'goal-counting', skill:'counting', title:'Counting to 10', detail:'Touch each picture, count out loud, and know how many there are.', align:'JK foundations — numbers'},
    {id:'goal-numberRecog', skill:'numberRecog', title:'Number Recognition', detail:'Spot and tap the numbers 1 to 10 by their shape and name.', align:'JK foundations — numbers'},
    {id:'goal-letterSounds', skill:'letterSounds', title:'Letter Sounds', detail:'Hear the first sound of a word and match it to its letter.', align:'JK foundations — language'}
  ]}
};
var EXPLAIN_BACK = {
  placeValue:{prompt:'Explain it back to Rexy: how do you know 47 has 4 tens?', choices:['The first digit, 4, lives in the Tens house — so 47 is 4 tens and 7 ones','Because 47 is a big number','You just guess the first number'], answer:'The first digit, 4, lives in the Tens house — so 47 is 4 tens and 7 ones', praise:'Yes! You explained the Tens house — that is real place-value thinking.'},
  addSub:{prompt:'Explain it back to Rexy: when you add 34 + 25, what do you do first — and why?', choices:['Add the ones first (4 + 5), then the tens (3 + 2) — ones first keeps each house tidy','Add any digits you like, in any order','Start with the answer and work backwards'], answer:'Add the ones first (4 + 5), then the tens (3 + 2) — ones first keeps each house tidy', praise:'Exactly — ones first, then tens. You explained Rexy\u2019s secret back perfectly.'},
  patterning:{prompt:'Explain it back to Rexy: the pattern is 5, 10, 15, ___. How do you know what comes next?', choices:['Find the jump: each number is +5, so 15 + 5 = 20 comes next','Pick your favourite number','Count the words in the question'], answer:'Find the jump: each number is +5, so 15 + 5 = 20 comes next', praise:'Yes! Finding the jump is how pattern detectives work.'},
  reading:{prompt:'Explain it back to Rexy: why did Milo run home with his boat?', choices:['Dark clouds came and rain was about to start','He was tired of the creek','The duck wanted the boat'], answer:'Dark clouds came and rain was about to start', praise:'Right — you remembered the story and the reason. Great explaining!'},
  counting:{prompt:'Explain it back to Rexy: how do you know how many apples there are?', choices:['Touch each apple and count out loud — the last number I say is how many','Close my eyes and guess','Only count the red ones twice'], answer:'Touch each apple and count out loud — the last number I say is how many', praise:'Yes! Touch, count, and the last number tells you how many.'},
  numberRecog:{prompt:'Explain it back to Rexy: how do you find the number 7?', choices:['Say its name and look carefully for the shape that matches 7','Tap any big button fast','Look for a letter instead'], answer:'Say its name and look carefully for the shape that matches 7', praise:'Exactly — name it, look at its shape, then tap. Great explaining!'},
  letterSounds:{prompt:'Explain it back to Rexy: how do you know “Ball” starts with B?', choices:['Say it slowly — the first sound is “buh”, and B says “buh”','Ball is round like the letter O','It is the longest word'], answer:'Say it slowly — the first sound is “buh”, and B says “buh”', praise:'Yes! First sound first — that is how letter detectives listen.'}
};
var TEACH = {
  placeValue:{title:'Place Value', rexy:'Numbers live in houses: Ones, Tens, Hundreds. Let\u2019s visit them together.'},
  addSub:{title:'Addition & Subtraction', rexy:'Ones first, then tens. One small step at a time.'},
  patterning:{title:'Patterning', rexy:'Patterns are puzzles with a secret jump. Let\u2019s find it!'},
  reading:{title:'Reading', rexy:'Read slowly, picture the story, and tell it back in your own words.'},
  counting:{title:'Counting', rexy:'Touch each picture and count out loud. The last number is how many!'},
  numberRecog:{title:'Finding Numbers', rexy:'Say the number\u2019s name, then look for its shape.'},
  letterSounds:{title:'Letter Sounds', rexy:'Say the word slowly. The first sound is the letter\u2019s sound.'}
};
/* Sample baselines shown on the dashboard (labelled as sample in the UI).
   Session answers move them up or down — real behaviour, this visit only. */
var SKILL_BASE = {
  dhyey:{placeValue:84, addSub:76, patterning:88, reading:81},
  dhyan:{counting:80, numberRecog:72, letterSounds:68}
};
/* Deterministic question bank — answers are computed/checked in code. */
var QUIZ_BANK = {
  placeValue:[
    {q:'What is the value of 4 in 147?', choices:['4','40','400'], answer:'40', hint:'The 4 lives in the Tens house. One ten is worth 10, so 4 tens is 40.', blocks:[['100',1],['10',4],['1',7]], praise:'Yes! 4 tens is 40.'},
    {q:'What is the value of 7 in 73?', choices:['7','70','700'], answer:'70', hint:'The 7 lives in the Tens house. 7 tens is 70.', blocks:[['10',7],['1',3]], praise:'Right! 7 tens is 70.'},
    {q:'Which number is 1 hundred, 4 tens and 7 ones?', choices:['147','174','417'], answer:'147', hint:'Hundreds first, then tens, then ones: 100 + 40 + 7.', blocks:[['100',1],['10',4],['1',7]], praise:'You built it! 147!'},
    {q:'What is 10 more than 56?', choices:['66','57','60'], answer:'66', hint:'Add one more ten: 5 tens becomes 6 tens.', blocks:[['10',5],['1',6]], praise:'Yes! 56 + 10 = 66.'},
    {q:'Which is bigger: 129 or 192?', choices:['129','192'], answer:'192', hint:'Look at the Hundreds house first: 1 hundred each. Then the Tens house: 2 tens beats 9 tens? No — wait, look again!', blocks:[['100',1],['10',9],['1',2]], praise:'192 is bigger — 9 tens beats 2 tens.'}
  ],
  addSub:[
    {q:'47 + 25 = ?', choices:['62','72','73'], answer:'72', hint:'Add the ones first: 7 + 5 = 12. Write 2, carry 1 ten.', blocks:[['10',4],['1',7]], praise:'Yes! 47 + 25 = 72.'},
    {q:'34 + 25 = ?', choices:['59','69','58'], answer:'59', hint:'Ones first: 4 + 5 = 9. Then tens: 3 + 2 = 5.', blocks:[['10',3],['1',4]], praise:'Right! 34 + 25 = 59.'},
    {q:'58 − 21 = ?', choices:['37','39','77'], answer:'37', hint:'Take away the ones first: 8 − 1 = 7. Then the tens: 5 − 2 = 3.', blocks:[['10',5],['1',8]], praise:'Yes! 58 − 21 = 37.'},
    {q:'63 + 14 = ?', choices:['77','67','78'], answer:'77', hint:'Ones: 3 + 4 = 7. Tens: 6 + 1 = 7.', blocks:[['10',6],['1',3]], praise:'Correct! 63 + 14 = 77.'},
    {q:'90 − 30 = ?', choices:['60','120','30'], answer:'60', hint:'Count back by tens: 90, 80, 70, 60. Three tens gone.', blocks:[['10',9]], praise:'Yes! 90 − 30 = 60.'}
  ],
  patterning:[
    {q:'5, 10, 15, ___?', choices:['18','20','25'], answer:'20', hint:'Find the jump: each number goes up by 5.', blocks:null, praise:'You found the jump! 15 + 5 = 20.'},
    {q:'2, 4, 6, ___?', choices:['7','8','10'], answer:'8', hint:'Counting by 2s. What is 6 + 2?', blocks:null, praise:'Right! 6 + 2 = 8.'},
    {q:'10, 20, 30, ___?', choices:['35','40','45'], answer:'40', hint:'Counting by 10s. What is 30 + 10?', blocks:null, praise:'Yes! 30 + 10 = 40.'},
    {q:'What comes next? 🔺 🔵 🔺 🔵 ___', choices:['🔺','🔵','🟧'], answer:'🔺', hint:'The pattern repeats: triangle, circle, triangle, circle…', blocks:null, praise:'You spotted the repeat! Triangle comes next.'},
    {q:'Count back by 10s: 80, 70, ___?', choices:['60','65','50'], answer:'60', hint:'Take away one ten: 70 − 10 = 60.', blocks:null, praise:'Correct! 80, 70, 60.'}
  ],
  reading:[
    {q:'Where did Milo take his toy boat?', choices:['To the creek','To the park','To school'], answer:'To the creek', hint:'The story starts at the creek, where the water runs fast.', story:'Milo took his toy boat to the creek. The water ran fast and the boat bobbed along. Dark clouds came, so Milo ran home before the rain.', praise:'Yes! Milo went to the creek.'},
    {q:'Why did Milo run home?', choices:['Dark clouds came','He was hungry','A duck wanted the boat'], answer:'Dark clouds came', hint:'Look at the sky in the story. What was coming?', story:'Milo took his toy boat to the creek. The water ran fast and the boat bobbed along. Dark clouds came, so Milo ran home before the rain.', praise:'Right! The dark clouds meant rain was coming.'},
    {q:'What was Milo\u2019s toy?', choices:['A boat','A kite','A ball'], answer:'A boat', hint:'It floats on the water!', story:'Milo took his toy boat to the creek. The water ran fast and the boat bobbed along. Dark clouds came, so Milo ran home before the rain.', praise:'Yes — a little boat!'},
    {q:'What came before the rain?', choices:['Dark clouds','Bright sunshine','Snow'], answer:'Dark clouds', hint:'The sky changed first.', story:'Milo took his toy boat to the creek. The water ran fast and the boat bobbed along. Dark clouds came, so Milo ran home before the rain.', praise:'Correct! Dark clouds came first.'},
    {q:'How did Milo feel when he got home safe and dry?', choices:['Happy','Angry','Sleepy'], answer:'Happy', hint:'He kept his boat safe and stayed dry. That feels good!', story:'Milo took his toy boat to the creek. The water ran fast and the boat bobbed along. Dark clouds came, so Milo ran home before the rain.', praise:'Yes! Happy and dry at home.'}
  ],
  counting:[
    {q:'How many apples? 🍎🍎🍎', choices:['2','3','4'], answer:'3', hint:'Touch each apple and count: 1, 2, 3.', blocks:null, praise:'Yes! 3 apples!'},
    {q:'How many stars? ⭐⭐', choices:['1','2','3'], answer:'2', hint:'Touch each star: 1, 2.', blocks:null, praise:'Right! 2 stars!'},
    {q:'How many ducks? 🦆🦆🦆🦆', choices:['3','4','5'], answer:'4', hint:'Count slowly: 1, 2, 3, 4.', blocks:null, praise:'Yes! 4 ducks!'}
  ],
  numberRecog:[
    {q:'Tap the number 7.', choices:['1','7','3'], answer:'7', hint:'Seven looks like a roof with a stick. Say “seven” and look!', blocks:null, praise:'You found 7!'},
    {q:'Which one is 5?', choices:['2','5','9'], answer:'5', hint:'Five has a flat top and a round belly.', blocks:null, praise:'Yes! That is 5!'},
    {q:'Tap the number 2.', choices:['2','8','4'], answer:'2', hint:'Two curves like a swan.', blocks:null, praise:'You found 2!'}
  ],
  letterSounds:[
    {q:'Which letter does “Ball” start with?', choices:['B','D','M'], answer:'B', hint:'Say it slowly: “buh-all”. The first sound is “buh”.', blocks:null, praise:'Yes! Ball starts with B!'},
    {q:'“Sun” starts with…?', choices:['S','T','C'], answer:'S', hint:'Say it slowly: “sss-un”. The first sound is “sss”.', blocks:null, praise:'Right! Sun starts with S!'},
    {q:'Which letter does “Cat” start with?', choices:['K','C','T'], answer:'C', hint:'Say it slowly: “kuh-at”. The first sound is “kuh”.', blocks:null, praise:'Yes! Cat starts with C!'}
  ]
};
/* ---- Auto-published content (BEGIN) ---- */
/* content.js (generated by publish.py from the approved question bank)
   is loaded before this file. Its items are appended after the
   built-in ones for their skill, so built-in order never changes.
   Grading, hints and read-aloud work exactly as before. If
   content.js is absent, this block is a no-op. */
if (typeof window !== 'undefined' && window.BRIGHTMIND_CONTENT && window.BRIGHTMIND_CONTENT.items) {
  Object.keys(window.BRIGHTMIND_CONTENT.items).forEach(function(skill){
    if (QUIZ_BANK[skill]) QUIZ_BANK[skill] = QUIZ_BANK[skill].concat(window.BRIGHTMIND_CONTENT.items[skill]);
  });
}
/* ---- Auto-published content (END) ---- */
var JK_LESSONS = [
  {type:'count', prompt:'Tap 3 apples.', speak:'Tap three apples.', items:['🍎','🍎','🍎'], answers:['2','3','4'], answer:'3'},
  {type:'count', prompt:'Tap 5 stars.', speak:'Tap five stars.', items:['⭐','⭐','⭐','⭐','⭐'], answers:['4','5','6'], answer:'5'},
  {type:'find', prompt:'Tap the number 7.', speak:'Tap the number seven.', items:['3','7','9'], answers:['3','7','9'], answer:'7'}
];
var CODE_PROJECTS = {
  star:{name:'Reach the star', goal:'Help Rexy Learn move to the star in 3 steps!', hint:'💡 Hint: Try Repeat 3!', cols:4, rows:3, start:[0,1], goalCell:[3,1], walls:[]},
  square:{name:'Draw a square', goal:'Make Rexy walk a square and come back home!', hint:'💡 Hint: Up, right, down, left — back where you started.', cols:4, rows:4, start:[1,1], goalCell:[1,1], walls:[], needLoop:true},
  garden:{name:'Visit the garden', goal:'Walk around the rocks to the sunflower!', hint:'💡 Hint: Go around the rocks — right first, then up.', cols:4, rows:4, start:[0,3], goalCell:[3,0], walls:[[2,2],[1,1]]}
};

/* ============================== STATE ============================== */
function emptyProgress(childId){
  var p={ stars:0, totalSeconds:0, sessions:[], skills:{}, goals:{}, code:{ runs:0, successes:0, done:{}, projRuns:{} } };
  SKILLS[childId].forEach(function(s){ p.skills[s.id]={attempts:0,correct:0,completed:0,hintsUsed:0}; });
  PATHS[childId].goals.forEach(function(g){ p.goals[g.id]={confirmed:false,confirmedAt:'',explainAttempts:0,explainPassed:false}; });
  return p;
}
var progress = { dhyey: emptyProgress('dhyey'), dhyan: emptyProgress('dhyan') };
var skillPct = JSON.parse(JSON.stringify(SKILL_BASE));
var currentChild='dhyey', dashChild='dhyey', setChildId='dhyey';
var currentLesson=null, lessonStart=0;
var setupDone=false, setupName='Explorer', setupGrade='2', setupInterests=['Space','Animals','Stories'];
var settings={ bigText:false, lowMotion:false, voice:'rexy', mic:false, theme:'space' };
var avatarChoice=0;
var AVATARS=['assets/4f7d81a3ebfaecf6.webp','assets/bcf985346b945dbf.svg','assets/26d92b55ee3453b5.svg'];
var navHistory=[];
var sessionStart=Date.now();
var journeyDone={ math:true, stories:false, science:false };
var plannerEdit=false;
var PLANNER_CYCLE=['math','read','code','draw','break'];
var PLANNER_LABEL={ math:'🔢 Math', read:'📖 Reading', code:'🧩 Code Quest', draw:'✏️ Drawing', break:'☕ Break (5 min)' };

/* ============================== UTILS ============================== */
function $(id){ return document.getElementById(id); }
function esc(v){ return String(v==null?'':v).replace(/[&<>"']/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
function reducedMotion(){
  if(settings.lowMotion) return true;
  return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
}
function say(msg){
  var t=$('toast'); if(!t) return;
  t.textContent=msg; t.classList.add('show');
  var sr=$('sr-status'); if(sr) sr.textContent=msg;
  clearTimeout(say._t); say._t=setTimeout(function(){ t.classList.remove('show'); },2600);
}
function speak(text){
  try{
    if(!('speechSynthesis' in window)){ say('Read-aloud is not available in this browser — the words stay on screen.'); return false; }
    window.speechSynthesis.cancel();
    var u=new SpeechSynthesisUtterance(text);
    u.rate = settings.voice==='calm' ? 0.85 : 0.95;
    u.pitch = settings.voice==='calm' ? 0.9 : 1.1;
    window.speechSynthesis.speak(u);
    return true;
  }catch(e){ return false; }
}
function stopSpeak(){ try{ if('speechSynthesis' in window) window.speechSynthesis.cancel(); }catch(e){} }
function addStars(n, why){
  var p=progress[currentChild]; p.stars+=n;
  renderHomeProgress(); syncPanel();
  if(why) say('⭐ +' + n + ' star' + (n===1?'':'s') + ' — ' + why);
}
function sessionMinutes(){ return Math.floor((Date.now()-sessionStart)/60000); }

/* ============================== NAVIGATION ==============================
   One rail on desktop, one bottom tab bar on mobile — identical on every
   screen. Every screen has a Back button and the rail/tabs, so Home is
   never more than 2 taps away from anywhere. */
var VIEW_META={
  welcome:{t:'Welcome', sec:'home'},
  home:{t:'Hello, explorer!', sec:'home'},
  path:{t:'My Learning Path', sec:'path'},
  subjects:{t:'Subjects', sec:'subjects'},
  tutor:{t:'Rexy Learn — Live Tutor', sec:'rexy'},
  whiteboard:{t:'Shared Whiteboard', sec:'rexy'},
  homework:{t:'Homework Helper', sec:'rexy'},
  quiz:{t:'Practice & Quiz', sec:'rexy'},
  workbook:{t:'My Workbook', sec:'rexy'},
  code:{t:'Code Quest', sec:'create'},
  draw:{t:'Drawing Pad — Scratch Paper', sec:'create'},
  dashboard:{t:'Parent Dashboard', sec:'progress'},
  review:{t:'Goal Evidence Review', sec:'progress'},
  planner:{t:'Family Learning Planner', sec:'progress'},
  settings:{t:'Family Settings & Accessibility', sec:'progress'},
  help:{t:'Help & Rexy Learn Guide', sec:'rexy'},
  jk:{t:'First Lessons: Counting', sec:'subjects'}
};
var SECTION_LANDING={ home:'home', path:'path', subjects:'subjects', rexy:'tutor', create:'code', progress:'dashboard' };
var _popping=false; /* true while goBack is unwinding, so showView doesn't re-push */
var lastView='home', currentView='welcome';
function panelBody(){ return document.getElementById('panel-body'); }
function scrollPanelTop(){ var pb=panelBody(); if(pb){ try{ pb.scrollTo({top:0,behavior:reducedMotion()?'auto':'smooth'}); }catch(e){ pb.scrollTop=0; } } }
function scrollInPanel(el,block,off){
  if(!el) return;
  var pb=panelBody();
  if(!pb){ try{ el.scrollIntoView({behavior:reducedMotion()?'auto':'smooth',block:block||'start'}); }catch(e){} return; }
  var er=el.getBoundingClientRect(), pr=pb.getBoundingClientRect();
  try{ pb.scrollTo({top: pb.scrollTop + (er.top - pr.top) - (typeof off==='number'?off:10), behavior:reducedMotion()?'auto':'smooth'}); }catch(e){}
}
function showView(v){
  if(!$('view-'+v)) return;
  if(v==='jk' && currentChild!=='dhyan'){ pickChild('dhyan'); say('First Lessons are Dhyan’s — switched to Dhyan! 🌱'); }
  if(!_popping && currentView && currentView!==v){ lastView=currentView; navHistory.push(currentView); if(navHistory.length>20) navHistory.shift(); }
  currentView=v;
  document.querySelectorAll('.view').forEach(function(el){ el.classList.remove('active'); });
  $('view-'+v).classList.add('active');
  scrollPanelTop();
  closeChildMenu();
  if(v==='dashboard') renderDashboard();
  if(v==='path') renderPath();
  if(v==='home') renderHomeProgress();
  if(v==='subjects') renderSubjects();
  if(v==='jk') renderJK();
  if(v==='review') renderReview();
  syncPanel(v);
}
function syncPanel(v){
  v=v||currentView;
  var meta=VIEW_META[v]||VIEW_META.home;
  document.querySelectorAll('.rail-tab[data-sec]').forEach(function(b){
    b.classList.toggle('sel', b.getAttribute('data-sec')===meta.sec);
  });
  var c=CHILDREN[currentChild];
  var av=$('ph-avatar'), ti=$('ph-title'), su=$('ph-sub'), st=$('ph-stars'), pr=$('ph-progress');
  if(!ti) return;
  if(v==='welcome'){
    if(av) av.innerHTML='<img src="assets/4f7d81a3ebfaecf6.webp" alt="Rexy">';
    ti.textContent='Welcome to BrightMind!';
    if(su) su.textContent='BrightMind AI — Rexy Learn • Let\u2019s set up your adventure';
  } else if(v==='home'){
    if(av) av.innerHTML='<img src="assets/4f7d81a3ebfaecf6.webp" alt="Rexy">';
    ti.textContent='Hello, ' + (setupDone?setupName:'explorer') + '!';
    if(su) su.textContent=c.name+' • '+c.level;
  } else {
    if(av){ av.textContent=c.avatar; av.style.background = currentChild==='dhyan' ? 'linear-gradient(145deg,#FF9E7A,#FF6B5E)' : 'linear-gradient(145deg,#47CDF3,#2267F3)'; }
    ti.textContent=(v==='dashboard'?'Parent Dashboard':(c.first+' — '+meta.t));
    if(su) su.textContent=c.name+' • '+c.level;
  }
  var p=progress[currentChild];
  if(st) st.textContent='⭐ '+p.stars+' star'+(p.stars===1?'':'s')+' • '+c.first;
  if(pr){
    if(v==='quiz' && currentLesson) pr.textContent='🎯 Question '+((window._qCur||0)+1)+' of '+currentLesson.questions.length;
    else if(v==='code') pr.textContent='🧩 Code Quest — Level 1';
    else if(v==='draw') pr.textContent='✏️ Your question stays beside your drawing';
    else if(v==='dashboard') pr.textContent='📊 '+p.sessions.length+' lesson'+(p.sessions.length===1?'':'s')+' finished this visit';
    else if(v==='path'){ var ps=pathSummary(currentChild); pr.textContent='🗺️ Path: '+ps.confirmed+' of '+ps.totalGoals+' goals complete • '+ps.exDone+' of '+ps.totalEx+' exercises'; }
    else if(v==='subjects') pr.textContent='📚 Pick a world to start';
    else if(v==='jk') pr.textContent='🌱 First Lessons • '+c.first;
    else pr.textContent='⭐ Pick a learner to start';
  }
  var cl=$('ph-child-label');
  if(cl) cl.textContent = currentChild==='dhyan' ? 'JK Explorer' : 'Grade 2 Explorer';
  var rn=$('rail-profile-name');
  if(rn) rn.textContent = currentChild==='dhyan' ? 'JK' : 'Grade 2';
  syncMobileNav();
}
function toggleRail(force){
  var r=$('app-rail'); if(!r) return;
  var open=(typeof force==='boolean') ? force : !r.classList.contains('expanded');
  r.classList.toggle('expanded', open);
  document.body.classList.toggle('rail-open', open);
  var t=$('rail-toggle'); if(t) t.setAttribute('aria-expanded', open?'true':'false');
}
function railGo(sec,btn){
  if(sec==='home'){ showView(setupDone?'home':'welcome'); }
  else if(sec==='path'){ openPath(currentChild); }
  else if(sec==='subjects'){ showView('subjects'); }
  else if(sec==='rexy'){ showView('tutor'); }
  else if(sec==='create'){ showView('code'); }
  else if(sec==='progress'){ showView('dashboard'); }
  else if(sec==='lesson'){ window._lessonMode='quiz'; if(currentLesson){ showView('quiz'); setTimeout(function(){ focusQuestion(window._qCur||0); },60); } else { showView('subjects'); } }
  else if(sec==='workbook'){ showView('workbook'); }
  else if(sec==='code'){ showView('code'); }
  else if(sec==='draw'){ openDraw(); }
  else if(sec==='dashboard'){ showView('dashboard'); }
  else if(sec==='planner'){ showView('planner'); }
  else if(sec==='settings'){ showView('settings'); }
  else if(sec==='help'){ showView('help'); }
  else if(sec==='jk'){ showView('jk'); }
  if(window.innerWidth<=860) toggleRail(false);
}
function mobileGo(sec,btn){ railGo(sec,btn); }
function syncMobileNav(){
  var sec=(VIEW_META[currentView]||VIEW_META.home).sec;
  document.querySelectorAll('.mobile-nav button[data-mnav]').forEach(function(b){
    var k=b.getAttribute('data-mnav');
    var on = (k==='home'&&sec==='home') || (k==='learn'&&sec==='subjects') || (k==='rexy'&&sec==='rexy') || (k==='create'&&sec==='create') || (k==='parent'&&sec==='progress');
    if(on) b.setAttribute('aria-current','page'); else b.removeAttribute('aria-current');
  });
}
function goBack(){
  if(currentView==='draw' && drawReturn){ var r=drawReturn; drawReturn=null; _popping=true; showView(r); _popping=false; return; }
  var prev=navHistory.pop();
  if(prev && $('view-'+prev)){ _popping=true; showView(prev); _popping=false; return; }
  var landing=SECTION_LANDING[(VIEW_META[currentView]||{}).sec]||'home';
  showView(landing===currentView?'home':landing);
}
function goHome(){ navHistory=[]; showView(setupDone?'home':'welcome'); }
function pickChild(id){
  if(!CHILDREN[id]) return;
  currentChild=id; dashChild=id;
  closeChildMenu();
  renderHomeProgress(); renderPath(); renderSubjects();
  var cards=document.querySelectorAll('#home-profiles .profile-card');
  cards.forEach(function(el){ el.classList.toggle('sel', el.getAttribute('data-child')===id); });
  syncPanel();
  say('Hello, '+CHILDREN[id].first+'! 👋');
}
function setChild(id){ pickChild(id); showView('home'); }
function toggleChildMenu(ev){
  if(ev) ev.stopPropagation();
  var m=$('child-menu'), b=$('ph-child');
  var open=m.hidden;
  m.hidden=!open;
  b.setAttribute('aria-expanded', open?'true':'false');
}
function closeChildMenu(){ var m=$('child-menu'); if(m) m.hidden=true; var b=$('ph-child'); if(b) b.setAttribute('aria-expanded','false'); }
function takeBreak(){
  var o=$('break-overlay'); if(!o) return;
  o.hidden=false;
  var left=300, el=$('break-count');
  stopSpeak();
  clearInterval(takeBreak._t);
  takeBreak._t=setInterval(function(){
    left-=1;
    if(left<=0){ endBreak(); return; }
    if(el) el.textContent=Math.floor(left/60)+':'+String(left%60).padStart(2,'0');
  },1000);
  if(el) el.textContent='5:00';
}
function endBreak(){
  var o=$('break-overlay'); if(o) o.hidden=true;
  clearInterval(takeBreak._t);
  say('Welcome back! Ready when you are. 🌟');
}

/* ============================== SETUP / HOME / PATH / SUBJECTS ============================== */
function finishSetup(){
  setupName=($('setup-name')||{}).value||'Explorer';
  setupGrade=($('setup-grade')||{}).value||'2';
  setupInterests=[];
  document.querySelectorAll('#setup-interests .chip-toggle.sel').forEach(function(b){ setupInterests.push(b.getAttribute('data-interest')); });
  if(setupGrade==='JK' && currentChild!=='dhyan') currentChild='dhyan';
  if(setupGrade==='2' && currentChild!=='dhyey') currentChild='dhyey';
  setupDone=true;
  say('Welcome, '+setupName+'! Let\u2019s explore! 🚀');
  showView('home');
}
function renderHomeProgress(){
  var p=progress[currentChild], c=CHILDREN[currentChild];
  var mins=sessionMinutes();
  var done=Object.keys(journeyDone).filter(function(k){ return journeyDone[k]; }).length;
  var hs=$('home-stars'); if(hs) hs.textContent=p.stars;
  var hm=$('home-mins'); if(hm) hm.textContent=mins;
  var hd=$('home-done'); if(hd) hd.textContent=done;
  var rm=$('time-ring-mins'); if(rm) rm.textContent=mins;
  var ring=$('time-ring'); if(ring) ring.style.setProperty('--pct', Math.min(100, Math.round(mins/60*100)));
  var bm=$('break-mins'); if(bm) bm.textContent=mins;
  var ct=$('continue-title'), cs=$('continue-sub');
  if(ct && cs){
    if(currentChild==='dhyan'){ ct.textContent='Counting — Tap the apples'; cs.textContent='First Lessons • 3 short games'; }
    else { ct.textContent='Math — Add and make ten'; cs.textContent='3 of 5 activities'; }
  }
  var pill=$('home-pill'); if(pill) pill.textContent = currentChild==='dhyan' ? 'JK Explorer' : 'Grade 2 Explorer';
  var dm=$('dash-mins'); if(dm) dm.textContent=mins;
}
function nextStepAction(child){
  var goals=PATHS[child].goals;
  for(var i=0;i<goals.length;i++){
    var g=progress[child].goals[goals[i].id];
    if(!g.confirmed) return {kind:'lesson', goal:goals[i]};
  }
  return {kind:'review'};
}
function continueAdventure(){
  if(currentChild==='dhyan'){ showView('jk'); return; }
  var step=nextStepAction(currentChild);
  if(step.kind==='review'){ openPath(currentChild); say('All goals are done — time for a grown-up review! 🎉'); }
  else if(step.goal){ startLesson(step.goal.skill); }
  else openPath(currentChild);
}
function pathSummary(child){
  var goals=PATHS[child].goals, confirmed=0, exDone=0, totalEx=goals.length*3;
  goals.forEach(function(g){
    var rec=progress[child].goals[g.id];
    if(rec.confirmed) confirmed++;
    var sk=progress[child].skills[g.skill];
    if(sk.completed>0) exDone+=1;
    if(rec.explainPassed) exDone+=1;
    if(sk.completed>0 && rec.explainPassed) exDone+=1;
  });
  return {confirmed:confirmed, totalGoals:goals.length, exDone:Math.min(totalEx,exDone), totalEx:totalEx};
}
function openPath(child){ if(child) currentChild=child; showView('path'); }
function renderPath(){
  var host=$('path-goals'); if(!host) return;
  var c=CHILDREN[currentChild];
  var html='<p class="muted">'+esc(PATHS[currentChild].course)+' • '+esc(PATHS[currentChild].term)+'</p>';
  PATHS[currentChild].goals.forEach(function(g){
    var rec=progress[currentChild].goals[g.id];
    var sk=progress[currentChild].skills[g.skill];
    var done=rec.confirmed;
    html+='<div class="card goal-card'+(done?' done':'')+'"><div class="row between"><h2>'+esc(g.title)+'</h2><span class="chip '+(done?'ok':'violet')+'">'+(done?'✓ Complete':'In progress')+'</span></div>'+
      '<p>'+esc(g.detail)+'</p><p class="goal-meta">'+esc(g.align)+' • '+(sk.completed||0)+' lesson'+((sk.completed||0)===1?'':'s')+' finished this visit</p>'+
      '<div class="row"><button class="btn primary" type="button" onclick="startLesson(\''+g.skill+'\')">▶ Start lesson</button>'+
      '<button class="btn" type="button" onclick="startExplainBack(\''+g.skill+'\')">💬 Explain it back</button></div></div>';
  });
  host.innerHTML=html;
}
function startExplainBack(skill){
  var eb=EXPLAIN_BACK[skill]; if(!eb){ showView('subjects'); return; }
  currentLesson={skill:skill, questions:[{prompt:eb.prompt, choices:eb.choices, answer:eb.answer, hint:'Think about what Rexy taught you, then pick the best answer.', praise:eb.praise}], answers:{}, hintUsed:{}, index:0, mode:'explain'};
  window._qCur=0;
  renderQuizShell();
  showView('quiz');
}
function renderSubjects(){
  var host=$('subjects-grid'); if(!host) return;
  var worlds=[
    {name:'Number Island', tag:'Math • Grade 2', color:'linear-gradient(180deg,#7cc4f7,#4a90f0)', img:'assets/623977fee4e47e00.webp', pos:'0% 50%', desc:'Place value, adding and taking away, patterns.', skills:['placeValue','addSub','patterning']},
    {name:'Reading Forest', tag:'Stories • Grade 2 & JK', color:'linear-gradient(180deg,#9edc83,#51baa2)', img:'assets/623977fee4e47e00.webp', pos:'50% 50%', desc:'Short stories, reading and letter sounds.', skills:['reading','letterSounds']},
    {name:'Science Valley', tag:'Science • Explore', color:'linear-gradient(180deg,#ffd876,#f5a623)', img:'assets/623977fee4e47e00.webp', pos:'100% 50%', desc:'Animal habitats and plants around us.', skills:[]},
    {name:'Code Quest', tag:'Computing • Level 1', color:'linear-gradient(180deg,#b07ef2,#7d39d4)', img:'assets/code-quest-sequencing.svg', pos:'50% 50%', desc:'Build with blocks. Run, debug and explore!', skills:[]}
  ];
  var html='';
  worlds.forEach(function(w){
    html+='<div class="card world"><span class="world-scene" style="background-image:url(\''+w.img+'\');background-position:'+w.pos+'"></span><div class="world-body"><span class="world-tag">'+esc(w.tag)+'</span><h3>'+esc(w.name)+'</h3><p>'+esc(w.desc)+'</p>';
    if(w.name==='Code Quest'){ html+='<button type="button" class="lesson-link" onclick="railGo(\'code\',this)"><span>🧩</span> Open Code Quest <span class="go">→</span></button>'; }
    else if(w.name==='Science Valley'){ html+='<button type="button" class="lesson-link" onclick="scienceLesson()"><span>🔬</span> Animal habitats <span class="go">→</span></button>'; }
    else{
      w.skills.forEach(function(sid){
        var sk=null;
        SKILLS.dhyey.concat(SKILLS.dhyan).forEach(function(s){ if(s.id===sid) sk=s; });
        if(!sk) return;
        if(currentChild==='dhyan' && ['placeValue','addSub','patterning','reading'].indexOf(sid)>=0) return;
        if(currentChild==='dhyey' && ['letterSounds'].indexOf(sid)>=0) return;
        html+='<button type="button" class="lesson-link" onclick="startLesson(\''+sid+'\')"><span>'+sk.icon+'</span> '+esc(sk.name)+' <span class="go">→</span></button>';
      });
    }
    html+='</div></div>';
  });
  if(currentChild==='dhyan'){
    html+='<div class="card world"><span class="world-scene" style="background-image:url(\'assets/623977fee4e47e00.webp\');background-position:0% 50%"></span><div class="world-body"><span class="world-tag">JK • First Lessons</span><h3>First Lessons: Counting</h3><p>Tap, count and play — three tiny lessons for Dhyan.</p><button type="button" class="lesson-link" onclick="showView(\'jk\')"><span>🍎</span> Start counting <span class="go">→</span></button></div></div>';
  }
  host.innerHTML=html;
}
function scienceLesson(){
  say('Science is coming soon — for now, try a Math or Reading lesson! 🔬');
  showView('subjects');
}

/* ============================== PRACTICE & QUIZ ============================== */
function startLesson(skill){
  var bank=QUIZ_BANK[skill];
  if(!bank){ showView('subjects'); return; }
  currentLesson={skill:skill, questions:bank.slice(), answers:{}, hintUsed:{}, index:0, mode:'quiz'};
  lessonStart=Date.now();
  window._qCur=0;
  renderQuizShell();
  showView('quiz');
}
function renderQuizShell(){
  var tabs=$('quiz-skill-tabs'); if(!tabs) return;
  var html='';
  SKILLS[currentChild].forEach(function(s){
    var sel = currentLesson && currentLesson.skill===s.id;
    html+='<button type="button" class="skill-tab'+(sel?' sel':'')+'" role="tab" aria-selected="'+(sel?'true':'false')+'" onclick="startLesson(\''+s.id+'\')">'+s.icon+' '+esc(s.short)+'</button>';
  });
  tabs.innerHTML=html;
  renderQuestion();
}
function blockHtml(blocks){
  if(!blocks) return '';
  var out='<div class="blocks-row" aria-hidden="true">';
  var labels={'100':'100','10':'40','1':'7'};
  blocks.forEach(function(b){
    var kind=b[0], n=b[1];
    var cls= kind==='100'?'b100':(kind==='10'?'b10':'b1');
    var val= kind==='100'?100*n : (kind==='10'?10*n : n);
    out+='<span class="blocks-group">';
    for(var i=0;i<n;i++) out+='<span class="blk '+cls+'"></span>';
    out+='<span class="blk-count">'+val+'</span></span>';
    if(b!==blocks[blocks.length-1]) out+='<span class="plus">+</span>';
  });
  return out+'</div>';
}
function renderQuestion(){
  var host=$('quiz-body'); if(!host||!currentLesson) return;
  var q=currentLesson.questions[window._qCur||0];
  var idx=window._qCur||0;
  var sk=TEACH[currentLesson.skill]||{title:'Practice'};
  var rl=$('quiz-rexy-line'), rs=$('quiz-rexy-sub');
  if(rl) rl.textContent = currentLesson.mode==='explain' ? 'Explain it back to Rexy!' : 'Let\u2019s practice '+sk.title.toLowerCase()+'!';
  if(rs) rs.textContent = currentLesson.mode==='explain' ? 'Show Rexy you really understand it.' : 'One question at a time — hint first if you like.';
  var qp=$('quiz-progress'); if(qp) qp.textContent='Question '+(idx+1)+' of '+currentLesson.questions.length;
  var qc=$('quiz-count'); if(qc) qc.textContent=idx+' / '+currentLesson.questions.length+' Questions';
  var nx=$('quiz-next'); if(nx) nx.disabled=true;
  var done=$('quiz-done'); if(done) done.hidden=true;
  var html='<div class="qbox current-q" id="qbox-'+idx+'"><span class="qprompt">'+(idx+1)+'. '+esc(q.q)+'</span>';
  if(q.story) html+='<p class="storybox">'+esc(q.story)+'</p>';
  html+=blockHtml(q.blocks);
  html+='<div class="choices" role="group" aria-label="Answer choices">';
  q.choices.forEach(function(c){
    html+='<button type="button" onclick="quizAnswer('+idx+',this)">'+esc(c)+'</button>';
  });
  html+='</div><div class="hintbox" id="hint-'+idx+'">'+esc(q.hint)+'</div><p class="qfeedback" id="qfb-'+idx+'" role="status"></p></div>';
  host.innerHTML=html;
  syncPanel();
}
function quizAnswer(idx, btn){
  var q=currentLesson.questions[idx];
  var box=$('qbox-'+idx); if(!box) return;
  var buttons=box.querySelectorAll('.choices button');
  buttons.forEach(function(b){ b.disabled=true; });
  var chosen=btn.textContent.trim();
  var correct = chosen===q.answer;
  btn.classList.add(correct?'correct':'wrong');
  if(!correct){
    buttons.forEach(function(b){ if(b.textContent.trim()===q.answer) b.classList.add('correct'); });
  }
  var p=progress[currentChild], st=p.skills[currentLesson.skill];
  if(st){ st.attempts++; if(correct) st.correct++; }
  var pct=skillPct[currentChild];
  if(pct && pct[currentLesson.skill]!=null){
    pct[currentLesson.skill]=Math.max(40, Math.min(98, pct[currentLesson.skill]+(correct?1:-1)));
  }
  currentLesson.answers[idx]=correct;
  var fb=$('qfb-'+idx);
  if(fb) fb.textContent = correct ? '✓ '+q.praise : 'Not quite — the answer is '+q.answer+'. '+q.hint;
  if(correct) addStars(1, 'great answer');
  var nx=$('quiz-next'); if(nx) nx.disabled=false;
  var qc=$('quiz-count'); if(qc) qc.textContent=(idx+1)+' / '+currentLesson.questions.length+' Questions';
  var qp=$('quiz-progress'); if(qp) qp.textContent='Question '+(idx+1)+' of '+currentLesson.questions.length+' ✓';
}
function quizHint(){
  var idx=window._qCur||0;
  var h=$('hint-'+idx); if(!h) return;
  h.classList.add('show');
  var st=progress[currentChild].skills[currentLesson.skill];
  if(st) st.hintsUsed++;
  scrollInPanel(h,'start');
  say('Hint shown — take your time. 💡');
}
function quizReadAloud(){
  var q=currentLesson.questions[window._qCur||0]; if(!q) return;
  speak(q.q+' Choices: '+q.choices.join(', ')+'.');
}
function toggleHint(i){ var h=$('hint-'+i); if(h) h.classList.toggle('show'); }
function focusQuestion(i){
  window._qCur=i||0;
  var box=$('qbox-'+(window._qCur||0));
  if(box) scrollInPanel(box,'start');
}
function quizNext(){
  var idx=window._qCur||0;
  if(idx+1<currentLesson.questions.length){
    window._qCur=idx+1;
    renderQuestion();
    scrollInPanel($('quiz-body'),'start');
  } else {
    quizFinish();
  }
}
function quizFinish(){
  var total=currentLesson.questions.length;
  var correct=0;
  for(var k in currentLesson.answers) if(currentLesson.answers[k]) correct++;
  var st=progress[currentChild].skills[currentLesson.skill];
  if(st) st.completed++;
  var mins=Math.max(1, Math.round((Date.now()-lessonStart)/60000));
  progress[currentChild].sessions.push({skill:currentLesson.skill, correct:correct, total:total, seconds:Math.round((Date.now()-lessonStart)/1000), when:new Date().toLocaleTimeString()});
  if(currentLesson.mode==='explain'){
    var rec=progress[currentChild].goals['goal-'+currentLesson.skill];
    if(rec){ rec.explainAttempts++; if(correct===total) rec.explainPassed=true; }
  }
  var starsEarned = correct>=total-1 ? 2 : (correct>0 ? 1 : 0);
  if(starsEarned) addStars(starsEarned, 'finishing the lesson');
  var host=$('quiz-done');
  host.hidden=false;
  host.innerHTML='<div class="card quiz-done-card"><h2>🎉 '+(correct===total?'Perfect!':'Well done!')+'</h2>'+
    '<p class="big-num">'+correct+' of '+total+' correct</p>'+
    '<p>'+(correct===total?'You got them all! Rexy is so proud of you.':(correct>0?'Good work! Try again to get them all.':'That was tricky — try again with hints. Rexy believes in you!'))+'</p>'+
    '<div class="row center"><button class="btn primary" type="button" onclick="startLesson(\''+currentLesson.skill+'\')">↻ Try again</button>'+
    '<button class="btn" type="button" onclick="railGo(\'subjects\',this)">📚 Back to lessons</button>'+
    '<button class="btn" type="button" onclick="showView(\'workbook\')">📓 Open my workbook</button></div></div>';
  scrollInPanel(host,'start');
  renderHomeProgress();
}
function submitLesson(){ /* local alias: finish the open quiz */ if(currentLesson) quizFinish(); }

/* ============================== WORKBOOK (real content) ============================== */
var wbTarget={h:1,t:4,o:7}, wbHave={h:0,t:0,o:0}, wbSkillId='placeValue';
function wbSkill(skill, btn){
  wbSkillId=skill;
  document.querySelectorAll('.lesson-chip').forEach(function(b){ b.classList.toggle('sel', b===btn); });
  if(skill==='placeValue'){ wbTarget={h:1,t:4,o:7}; }
  else if(skill==='addSub'){ wbTarget={h:0,t:5,o:8}; }
  else { wbTarget={h:0,t:2,o:0}; }
  wbReset();
  var titles={placeValue:['Build 147','Use the base-ten blocks to make 147. Tap the blocks to put them in the right place-value columns.'],
    addSub:['Build 58','Use the base-ten blocks to make 58. How many tens and ones do you need?'],
    patterning:['Build 20','Use the base-ten blocks to make 20. How many tens is that?']};
  var t=titles[skill]||titles.placeValue;
  var et=$('wb-ex-title'); if(et) et.textContent=t[0];
  var es=$('wb-ex-sub'); if(es) es.textContent=t[1];
}
function wbReset(){ wbHave={h:0,t:0,o:0}; wbRender(); var f=$('wb-feedback'); if(f) f.textContent=''; }
function wbRender(){
  [['h','wb-h','wb-h-count'],['t','wb-t','wb-t-count'],['o','wb-o','wb-o-count']].forEach(function(cfg){
    var kind=cfg[0], host=$(cfg[1]), cnt=$(cfg[2]);
    if(!host) return;
    var cls= kind==='h'?'b100':(kind==='t'?'b10':'b1');
    var html='';
    for(var i=0;i<wbHave[kind];i++) html+='<span class="blk '+cls+'"></span>';
    host.innerHTML=html;
    if(cnt) cnt.textContent=wbHave[kind];
  });
  var total=wbHave.h*100+wbHave.t*10+wbHave.o;
  var tt=$('wb-total'); if(tt) tt.innerHTML='Your number: <b>'+total+'</b>';
}
function wbAdd(kind){
  if(wbHave[kind]>=9){ say('That column is full — 9 is the most in one column!'); return; }
  wbHave[kind]++; wbRender();
}
function wbClear(){ wbReset(); say('Fresh page — build it again!'); }
function wbCheck(){
  var total=wbHave.h*100+wbHave.t*10+wbHave.o;
  var target=wbTarget.h*100+wbTarget.t*10+wbTarget.o;
  var f=$('wb-feedback'); if(!f) return;
  if(total===target){
    f.textContent='✓ Yes! '+target+' is '+wbTarget.h+' hundred'+(wbTarget.h===1?'':'s')+', '+wbTarget.t+' tens and '+wbTarget.o+' ones. Brilliant building!';
    addStars(2,'building '+target+' correctly');
    var st=progress[currentChild].skills[wbSkillId]; if(st) st.completed++;
  } else if(total===0){
    f.textContent='Tap the blocks below to start building. How many hundreds do you need?';
  } else {
    var diff=total<target?'You need a little more.':'You have a little too much.';
    f.textContent='Not yet — you built '+total+', and the goal is '+target+'. '+diff+' Check each column: hundreds, tens, ones.';
  }
}
function wbListen(){
  var target=wbTarget.h*100+wbTarget.t*10+wbTarget.o;
  speak('Build '+target+'. Use the base ten blocks to make '+target+'. Tap a block to add it to the right column.');
}
function wbDrawAnswer(){ openDraw({question:'Show '+ (wbTarget.h*100+wbTarget.t*10+wbTarget.o) +' in tens and ones.', hint:'Hint: draw the hundreds flat, the tens rods, and the ones squares.'}); }
function wbNewTarget(){
  var n=20+Math.floor(Math.random()*180);
  wbTarget={h:Math.floor(n/100), t:Math.floor((n%100)/10), o:n%10};
  wbReset();
  var et=$('wb-ex-title'); if(et) et.textContent='Build '+n;
  var es=$('wb-ex-sub'); if(es) es.textContent='Use the base-ten blocks to make '+n+'. Tap the blocks to put them in the right place-value columns.';
  say('New number to build: '+n+'!');
}

/* ============================== SHARED DRAWING ENGINE ============================== */
var PALETTE=['#7434da','#2267f3','#0e9aa8','#22a06b','#f5c518','#ff8a3d','#ff7a9e','#3a2a63'];
function makePad(canvas){
  var pad={ canvas:canvas, ctx:canvas.getContext('2d'), strokes:[], redo:[], color:PALETTE[0], size:7, tool:'pen', drawing:false, cur:null };
  pad.ctx.lineCap='round'; pad.ctx.lineJoin='round';
  function pos(e){
    var r=canvas.getBoundingClientRect();
    var t=e.touches?e.touches[0]:e;
    return { x:(t.clientX-r.left)*(canvas.width/r.width), y:(t.clientY-r.top)*(canvas.height/r.height) };
  }
  function drawStroke(s){
    var ctx=pad.ctx;
    ctx.save();
    ctx.globalCompositeOperation = s.tool==='eraser' ? 'destination-out' : 'source-over';
    ctx.strokeStyle=s.color; ctx.lineWidth=s.size;
    ctx.beginPath();
    s.pts.forEach(function(p,i){ if(i===0) ctx.moveTo(p.x,p.y); else ctx.lineTo(p.x,p.y); });
    ctx.stroke();
    ctx.restore();
  }
  pad.redraw=function(){
    pad.ctx.clearRect(0,0,canvas.width,canvas.height);
    pad.strokes.forEach(drawStroke);
  };
  pad.undo=function(){ if(!pad.strokes.length) return; pad.redo.push(pad.strokes.pop()); pad.redraw(); };
  pad.redoFn=function(){ if(!pad.redo.length) return; pad.strokes.push(pad.redo.pop()); pad.redraw(); };
  pad.clear=function(){ pad.strokes=[]; pad.redo=[]; pad.redraw(); };
  canvas.addEventListener('pointerdown', function(e){
    e.preventDefault();
    pad.drawing=true;
    pad.cur={tool:pad.tool, color:pad.color, size:pad.size, pts:[pos(e)]};
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', function(e){
    if(!pad.drawing||!pad.cur) return;
    pad.cur.pts.push(pos(e));
    drawStroke(pad.cur);
  });
  function finish(e){
    if(!pad.drawing) return;
    pad.drawing=false;
    if(pad.cur && pad.cur.pts.length>1){ pad.strokes.push(pad.cur); pad.redo=[]; }
    pad.cur=null;
  }
  canvas.addEventListener('pointerup', finish);
  canvas.addEventListener('pointercancel', finish);
  return pad;
}
var drawPad=null, boardPad=null, drawReturn=null;

/* ============================== WHITEBOARD ============================== */
var boardProblem={a:7,b:3}, boardStep=-1;
function boardRenderFrame(){
  var host=$('board-tenframe'); if(!host) return;
  var html='';
  for(var i=0;i<10;i++){
    var cls='tf-cell';
    if(i<boardProblem.a) cls+=' fill';
    else if(i<boardProblem.a+boardProblem.b && boardStep>=1) cls+=' fill2';
    html+='<span class="'+cls+'"></span>';
  }
  host.innerHTML=html;
  var sum=$('board-sum');
  if(sum) sum.textContent = boardStep>=2 ? (boardProblem.a+' + '+boardProblem.b+' = '+(boardProblem.a+boardProblem.b)) : (boardProblem.a+' + '+boardProblem.b+' = ?');
}
function boardTool(tool, btn){
  if(!boardPad) return;
  if(tool==='undo'){ boardPad.undo(); return; }
  if(tool==='redo'){ boardPad.redoFn(); return; }
  if(tool==='clear'){ boardPad.clear(); say('Whiteboard cleared.'); return; }
  boardPad.tool=tool;
  document.querySelectorAll('#view-whiteboard .tool-btn[data-btool]').forEach(function(b){
    b.classList.toggle('sel', b===btn); b.setAttribute('aria-pressed', b===btn?'true':'false');
  });
}
function boardUndo(){ if(boardPad) boardPad.undo(); }
function boardRedo(){ if(boardPad) boardPad.redoFn(); }
function boardClear(){ if(boardPad){ boardPad.clear(); say('Whiteboard cleared.'); } }
function boardStepTo(n){
  boardStep=n;
  document.querySelectorAll('#board-steps li').forEach(function(li){
    li.classList.toggle('active-step', Number(li.getAttribute('data-step'))===n);
  });
  boardRenderFrame();
}
function boardReplay(){
  boardStepTo(0);
  var steps=[
    function(){ boardStepTo(0); },
    function(){ boardStepTo(1); speak('Add '+boardProblem.b+' more to make 10.'); },
    function(){ boardStepTo(2); speak('So, '+boardProblem.a+' plus '+boardProblem.b+' is '+(boardProblem.a+boardProblem.b)+'!'); }
  ];
  if(reducedMotion()){ steps.forEach(function(s){ s(); }); return; }
  steps.forEach(function(s,i){ setTimeout(s, i*1400); });
}
function boardAnother(){
  var a=2+Math.floor(Math.random()*7);
  boardProblem={a:a,b:10-a};
  boardStep=-1;
  var steps=$('board-steps');
  steps.innerHTML='<li data-step="0">Start with '+a+'.</li><li data-step="1">Add '+(10-a)+' more to make 10.</li><li data-step="2">So, '+a+' + '+(10-a)+' = 10!</li>';
  boardRenderFrame();
  say('New problem: '+a+' + '+(10-a)+' = ?');
}

/* ============================== CODE QUEST ============================== */
var cqProjectId='star', cqProgram=[], cqRunning=false, cqGridEl=null;
function cqProject(id){
  cqProjectId=id; cqProgram=[]; cqRunning=false;
  var p=CODE_PROJECTS[id];
  var g=$('cq-goal'); if(g) g.textContent=p.goal;
  var h=$('cq-hint'); if(h) h.textContent=p.hint;
  var n=$('cq-task-no'); if(n) n.textContent = id==='star'?'1':(id==='square'?'2':'3');
  var c=$('cq-celebrate'); if(c) c.hidden=true;
  var t=$('cq-trace'); if(t) t.innerHTML='<li class="muted">Press Run to see Rexy follow your blocks.</li>';
  renderCqStack(); renderCqGrid();
}
function cqTab(tab, btn){
  document.querySelectorAll('.cq-tab').forEach(function(b){
    var on=b===btn; b.classList.toggle('sel',on); b.setAttribute('aria-selected',on?'true':'false');
  });
  $('cq-blocks').hidden = tab!=='blocks';
  $('cq-events').hidden = tab!=='events';
}
function cqGroup(id, btn){
  var body=$('cq-group-'+id); if(!body) return;
  var open=body.style.display!=='none';
  body.style.display=open?'none':'';
  btn.setAttribute('aria-expanded', open?'false':'true');
  btn.textContent=(open?'▸ ':'▾ ')+btn.textContent.replace(/^[▾▸]\s*/,'');
}
function cqAdd(kind){
  if(cqRunning) return;
  cqProgram.push({kind:kind});
  renderCqStack();
}
function cqRemove(i){
  if(cqRunning) return;
  cqProgram.splice(i,1);
  renderCqStack();
}
function cqClear(){ if(cqRunning) return; cqProgram=[]; renderCqStack(); say('Program cleared — build it again!'); }
var CQ_LABEL={ start:'🚩 Start', right:'Move right →', left:'Move left ←', up:'Move up ↑', down:'Move down ↓', repeat3:'🔁 Repeat 3 times' };
function renderCqStack(){
  var host=$('cq-stack'); if(!host) return;
  if(!cqProgram.length){
    host.innerHTML='<li class="empty-note">Your program is empty. Tap a block on the left to add it — start with Start!</li>';
    return;
  }
  host.innerHTML=cqProgram.map(function(b,i){
    var cls=b.kind==='start'?'event':(b.kind==='repeat3'?'repeat':'motion');
    return '<li class="'+cls+'"><span>'+CQ_LABEL[b.kind]+'</span><button type="button" class="rm" aria-label="Remove ' + esc(CQ_LABEL[b.kind]) + '" onclick="cqRemove('+i+')">✕</button></li>';
  }).join('');
}
function renderCqGrid(pos){
  var host=$('cq-grid'); if(!host) return;
  var p=CODE_PROJECTS[cqProjectId];
  var here=pos||{x:p.start[0], y:p.start[1]};
  var html='';
  for(var y=0;y<p.rows;y++){
    for(var x=0;x<p.cols;x++){
      var cls='cq-cell';
      var wall=p.walls.some(function(w){ return w[0]===x&&w[1]===y; });
      if(wall) cls+=' wall';
      if(x===p.goalCell[0]&&y===p.goalCell[1]) cls+=' goal';
      var inner='';
      if(wall) inner='🪨';
      else if(x===p.goalCell[0]&&y===p.goalCell[1]) inner = cqProjectId==='garden' ? '🌻' : '⭐';
      if(x===here.x&&y===here.y) inner='<span class="rexy-token"><img src="assets/4f7d81a3ebfaecf6.webp" alt="Rexy"></span>';
      html+='<div class="'+cls+'">'+inner+'</div>';
    }
  }
  host.innerHTML=html;
}
function cqExpand(program){
  var steps=[];
  for(var i=0;i<program.length;i++){
    var b=program[i];
    if(b.kind==='start'){ steps.push({label:'Start', move:null}); continue; }
    if(b.kind==='repeat3'){
      var next=program[i+1];
      if(!next || next.kind==='start' || next.kind==='repeat3'){
        steps.push({label:'Repeat 3 times — but there is no move after it!', move:null, bad:true});
        continue;
      }
      for(var r=0;r<3;r++) steps.push({label:CQ_LABEL[next.kind]+' (repeat '+(r+1)+' of 3)', move:next.kind});
      i++;
      continue;
    }
    steps.push({label:CQ_LABEL[b.kind], move:b.kind});
  }
  return steps;
}
function cqRun(){
  if(cqRunning) return;
  var p=CODE_PROJECTS[cqProjectId];
  if(!cqProgram.length){ say('Your program is empty — add some blocks first!'); return; }
  if(cqProgram[0].kind!=='start'){ say('Tip: every program starts with the Start block.'); }
  cqRunning=true;
  var steps=cqExpand(cqProgram);
  var pos={x:p.start[0], y:p.start[1]};
  var visited=new Set([pos.x+','+pos.y]);
  var trace=$('cq-trace'); trace.innerHTML='';
  var delay=reducedMotion()?0:650;
  var i=0, failed=false;
  function step(){
    if(i>=steps.length){
      cqRunning=false;
      finishRun(pos, visited);
      return;
    }
    var s=steps[i];
    var li=document.createElement('li');
    if(s.bad){
      li.innerHTML='<span class="t-num">!</span><span>'+esc(s.label)+'</span><span class="t-bad">✕</span>';
      trace.appendChild(li);
      i++;
      setTimeout(step, delay);
      return;
    }
    if(s.move){
      var nx=pos.x, ny=pos.y;
      if(s.move==='right') nx++; if(s.move==='left') nx--;
      if(s.move==='up') ny--; if(s.move==='down') ny++;
      var wall=p.walls.some(function(w){ return w[0]===nx&&w[1]===ny; });
      if(nx<0||ny<0||nx>=p.cols||ny>=p.rows||wall){
        li.innerHTML='<span class="t-num">'+(i+1)+'</span><span>'+esc(s.label)+' — Rexy bumped into '+(wall?'a rock':'the edge')+'!</span><span class="t-bad">✕</span>';
        trace.appendChild(li);
        scrollInPanel(li,'start');
        failed=true; cqRunning=false;
        say('Oops! Rexy bumped into '+(wall?'a rock':'the edge')+'. Press Debug to see where.');
        return;
      }
      pos={x:nx,y:ny}; visited.add(nx+','+ny);
      renderCqGrid(pos);
    }
    li.innerHTML='<span class="t-num">'+(i+1)+'</span><span>'+esc(s.label)+'</span><span class="t-ok">✓</span>';
    trace.appendChild(li);
    scrollInPanel(li,'start');
    i++;
    setTimeout(step, delay);
  }
  function finishRun(endPos, visitedSet){
    var p2=CODE_PROJECTS[cqProjectId];
    var reached = endPos.x===p2.goalCell[0] && endPos.y===p2.goalCell[1];
    var ok = reached && (!p2.needLoop || visitedSet.size>=4);
    var prog=progress[currentChild].code;
    prog.runs++;
    if(ok){
      prog.successes++;
      prog.done[cqProjectId]=true;
      var cel=$('cq-celebrate'); if(cel) cel.hidden=false;
      addStars(3,'finishing Code Quest!');
      say('⭐ Rexy did it! Your program works!');
    } else {
      say(reached ? 'Rexy is back home, but did not visit enough squares. Try a loop!' : 'Rexy did not reach the goal yet. Check the trace and try again!');
    }
    renderHomeProgress();
  }
  step();
}
function cqReset(){
  cqRunning=false;
  var cel=$('cq-celebrate'); if(cel) cel.hidden=true;
  var t=$('cq-trace'); if(t) t.innerHTML='<li class="muted">Press Run to see Rexy follow your blocks.</li>';
  renderCqGrid();
}
function cqDebug(){
  var trace=$('cq-trace');
  var bad=trace.querySelector('.t-bad');
  if(bad){
    var li=bad.closest('li');
    scrollInPanel(li,'start');
    say('Debug: the step with ✕ is where Rexy stopped. Change the block before it and Run again.');
  } else if(!cqProgram.length){
    say('Debug: your program is empty. Add a Start block, then some moves.');
  } else {
    say('Debug: the last run finished without a bump. Check the goal — did Rexy end on the star?');
  }
}

/* ============================== DRAWING PAD ============================== */
var DRAW_COLORS=PALETTE;
function drawTool(tool, btn){
  if(!drawPad) return;
  if(tool==='undo'){ drawPad.undo(); return; }
  if(tool==='redo'){ drawPad.redoFn(); return; }
  if(tool==='clear'){ drawPad.clear(); say('Drawing cleared.'); return; }
  drawPad.tool=tool;
  document.querySelectorAll('#view-draw .tool-btn[data-dtool]').forEach(function(b){
    b.classList.toggle('sel', b===btn); b.setAttribute('aria-pressed', b===btn?'true':'false');
  });
}
function drawUndo(){ if(drawPad) drawPad.undo(); }
function drawRedo(){ if(drawPad) drawPad.redoFn(); }
function drawClear(){ if(drawPad){ drawPad.clear(); say('Drawing cleared.'); } }
function drawSize(size, btn){
  if(drawPad) drawPad.size=size;
  document.querySelectorAll('.size-btn').forEach(function(b){ b.classList.toggle('sel', b===btn); });
}
function drawColor(color, btn){
  if(drawPad) drawPad.color=color;
  document.querySelectorAll('#draw-swatches .swatch').forEach(function(b){ b.classList.toggle('sel', b===btn); });
}
function openDraw(ctx){
  if(ctx && ctx.question){
    var qt=$('draw-q-text'); if(qt) qt.textContent=ctx.question;
    var qh=$('draw-q-hint'); if(qh) qh.textContent=ctx.hint||'';
    drawReturn=ctx.returnView||currentView;
  } else {
    var qt2=$('draw-q-text'); if(qt2) qt2.textContent='Show 14 in tens and ones.';
    var qh2=$('draw-q-hint'); if(qh2) qh2.textContent='Hint: one ten is a tall rod of 10. Four ones are four little squares.';
    drawReturn=currentView==='draw'?null:currentView;
  }
  var ex=$('draw-explain'); if(ex) ex.hidden=true;
  var fb=$('draw-explain-feedback'); if(fb) fb.textContent='';
  showView('draw');
}
function drawBack(){ goBack(); }
function drawExplain(){
  var ex=$('draw-explain'); if(!ex) return;
  ex.hidden=false;
  scrollInPanel(ex,'start');
  var inp=$('draw-explain-input'); if(inp) inp.focus();
}
function drawExplainSend(){
  var inp=$('draw-explain-input');
  var text=(inp?inp.value:'').trim().toLowerCase();
  var fb=$('draw-explain-feedback'); if(!fb) return;
  if(!text){ fb.textContent='Tell Rexy a little about your drawing first!'; return; }
  var hasTen=text.indexOf('ten')>=0, hasFour=text.indexOf('four')>=0||text.indexOf('4')>=0;
  if(hasTen&&hasFour){
    fb.textContent='✓ Yes! One ten and four ones — that is 14. You explained it like a real mathematician!';
    addStars(2,'explaining your drawing');
  } else if(hasTen||hasFour){
    fb.textContent='Good start! Can you tell Rexy about both parts — the ten and the ones?';
  } else {
    fb.textContent='Nice drawing! How many tens did you draw? How many ones?';
  }
}

/* ============================== TUTOR (built-in helper) ============================== */
var tutorState={ topic:null, stage:0, pending:null, greeted:false };
var museLearner='dhyey';
function openMuseChat(child){
  museLearner=child||currentChild;
  showView('tutor');
  if(!tutorState.greeted){
    tutorState.greeted=true;
    addMuseMsg('Hi! I\u2019m Rexy. Let\u2019s learn together! 🌟 We can do a make-ten question, place value, or a practice question. What sounds fun?', 'muse');
  }
  setTimeout(function(){ var inp=$('tutor-input'); if(inp) inp.focus(); },80);
}
function addMuseMsg(text, who){
  var chat=$('tutor-chat'); if(!chat) return;
  var div=document.createElement('div');
  div.className='msg '+(who==='user'?'user':'rexy');
  if(who==='user'){
    div.innerHTML='<span class="m-av" aria-hidden="true">'+esc(CHILDREN[currentChild].first.slice(0,2))+'</span><div class="m-body">'+esc(text)+'</div>';
  } else {
    div.innerHTML='<span class="m-av"><img src="assets/4f7d81a3ebfaecf6.webp" alt=""></span><div class="m-body">'+esc(text)+'</div>';
  }
  chat.appendChild(div);
  scrollInPanel(div,'start');
}
function tutorAbout(){
  say('This helper is built into the page — it is not live AI. The planned live tutor uses OmniRoute AI first, with the local LLM on your family PC as the fallback.');
  addMuseMsg('I\u2019m the built-in Rexy helper. I give hints and ask questions — I never just tell you the answer! One day, the live Rexy tutor will talk with you using OmniRoute AI first, and the local LLM on your family PC if that is not available. For now, I\u2019m right here on this page. 💜', 'muse');
}
function tutorVoiceDemo(){
  var st=$('tutor-status');
  if(st) st.textContent='♪ Rexy is reading an example out loud…';
  speak('Hi! I\u2019m Rexy. Let\u2019s make ten together. Start with seven. How many more make ten?');
  setTimeout(function(){ if(st) st.textContent='Ready when you are — tap Hint, or type a question below.'; },4000);
  addMuseMsg('Let\u2019s make ten! Start with 7. How many more make 10?', 'muse');
  tutorState.pending={kind:'maketen', a:7, b:3, stage:'ask'};
}
function tutorMic(){
  say('Voice chat is planned — OmniRoute AI first, local LLM as fallback. For now, type or tap Hint!');
  addMuseMsg('Voice chat is still being built, so I can\u2019t listen yet. But I can read everything you type! Try typing “47 + 25” and we will solve it together.', 'muse');
}
function tutorPause(){
  stopSpeak();
  say('Reading paused.');
}
function tutorEnd(){
  stopSpeak();
  tutorState.pending=null;
  addMuseMsg('Great learning today! Come back anytime — I\u2019ll be right here. 🌟', 'muse');
  setTimeout(function(){ showView('home'); },900);
}
function tutorQuick(kind){
  if(kind==='hint'){
    if(tutorState.pending && tutorState.pending.kind==='maketen'){
      addMuseMsg('Hint: 7 needs 3 more to reach 10. Count up: 8, 9, 10 — that is 3 more!', 'muse');
    } else if(tutorState.pending && tutorState.pending.kind==='sum'){
      var p=tutorState.pending;
      addMuseMsg('Hint: add the ones first. '+p.a%10+' + '+p.b%10+' = ? Then add the tens.', 'muse');
    } else {
      addMuseMsg('Hint: let\u2019s start small. Try “7 + 3” — what number do we add to 7 to make 10?', 'muse');
      tutorState.pending={kind:'maketen', a:7, b:3, stage:'ask'};
    }
  } else if(kind==='show'){
    addMuseMsg('Watch: 7 blocks, then 3 more blocks, fill the ten frame. 7 + 3 = 10! Now you try one: what is 6 + 4?', 'muse');
    tutorState.pending={kind:'maketen', a:6, b:4, stage:'ask'};
  } else if(kind==='draw'){
    openDraw({question:'Show 7 + 3 with blocks or dots.', hint:'Hint: draw 7 dots, then 3 more dots. How many altogether?', returnView:'tutor'});
  } else if(kind==='question'){
    addMuseMsg('Here is a fresh one: what is 8 + 5? Remember — ones first, then tens. Take your time!', 'muse');
    tutorState.pending={kind:'sum', a:8, b:5, stage:'ones'};
  }
}
function sendMuseText(text){
  if(!text || !text.trim()) return;
  addMuseMsg(text.trim(), 'user');
  var low=text.trim().toLowerCase();
  var sumMatch=low.match(/(\d{1,3})\s*\+\s*(\d{1,3})/);
  var pending=tutorState.pending;
  /* Awaiting a number for the pending guided question */
  if(pending && /^\d+$/.test(low)){
    var n=Number(low);
    if(pending.kind==='maketen'){
      if(n===pending.b){
        addMuseMsg('Yes! '+pending.a+' + '+pending.b+' = 10. You did it! Want another one?', 'muse');
        addStars(1,'answering with Rexy');
        tutorState.pending=null;
      } else {
        addMuseMsg('Good try! Count up from '+pending.a+': '+(pending.a+1)+', '+(pending.a+2)+' … how many steps to 10?', 'muse');
      }
      return;
    }
    if(pending.kind==='sum'){
      if(pending.stage==='ones'){
        var ones=(pending.a%10)+(pending.b%10);
        if(n===ones){
          addMuseMsg('Exactly! '+pending.a%10+' + '+pending.b%10+' = '+ones+'. Now add the tens: '+Math.floor(pending.a/10)+' + '+Math.floor(pending.b/10)+' = ?', 'muse');
          pending.stage='tens';
        } else {
          addMuseMsg('Not quite — add the ones: '+pending.a%10+' + '+pending.b%10+'. Count them up!', 'muse');
        }
        return;
      }
      if(pending.stage==='tens'){
        var tens=Math.floor(pending.a/10)+Math.floor(pending.b/10)+ ( ((pending.a%10)+(pending.b%10))>=10 ? 1:0 );
        if(n===tens){
          var total=pending.a+pending.b;
          addMuseMsg('Yes! So '+pending.a+' + '+pending.b+' = '+total+'. You solved it step by step! 🎉', 'muse');
          addStars(1,'solving with Rexy');
          tutorState.pending=null;
        } else {
          addMuseMsg('Almost! The tens are '+Math.floor(pending.a/10)+' + '+Math.floor(pending.b/10)+', plus 1 ten carried over. Try again!', 'muse');
        }
        return;
      }
    }
    if(pending.kind==='placecheck'){
      if(n===pending.answer){
        addMuseMsg('Yes! '+pending.answer+' is right. '+pending.praise, 'muse');
        addStars(1,'answering with Rexy');
        tutorState.pending=null;
      } else {
        addMuseMsg('Good try! '+pending.hint, 'muse');
      }
      return;
    }
  }
  if(sumMatch){
    var a=Number(sumMatch[1]), b=Number(sumMatch[2]);
    addMuseMsg('Let\u2019s solve '+a+' + '+b+' together! First, add the ones: '+a%10+' + '+b%10+' = ?', 'muse');
    tutorState.pending={kind:'sum', a:a, b:b, stage:'ones'};
    return;
  }
  if(/place value/.test(low)){
    addMuseMsg('Place value is easy when you know the houses! In 147, the 1 lives in the Hundreds house (100), the 4 lives in the Tens house (40), and the 7 lives in the Ones house (7). Quick check: what is the value of 4 in 147?', 'muse');
    tutorState.pending={kind:'placecheck', answer:40, hint:'The 4 is in the Tens house — 4 tens is 40.', praise:'4 tens is 40! You know your houses!'};
    return;
  }
  if(/practice|question/.test(low)){
    addMuseMsg('Here is one: what is 6 + 4? Ones first — you can do it!', 'muse');
    tutorState.pending={kind:'maketen', a:6, b:4, stage:'ask'};
    return;
  }
  if(/hello|hi\b/.test(low)){
    addMuseMsg('Hi! I\u2019m so glad you are here. Ask me a maths question, or tap “New question” below!', 'muse');
    return;
  }
  addMuseMsg('Good thinking! Let\u2019s take it one small step at a time. Can you tell me a little more — or try a make-ten question with me?', 'muse');
}

/* ============================== HOMEWORK ============================== */
var hwTaken=0, hwApproved=false, hwProblem={a:12,b:4}, hwRot=0;
function hwApprove(){
  hwApproved=!hwApproved;
  var btn=$('hw-approve-btn');
  if(btn) btn.textContent = hwApproved ? '✓ Approved by Parent' : 'Ask a grown-up to approve';
  var note=$('hw-approve-note');
  if(note) note.textContent = hwApproved ? '✓ A grown-up approved this upload for this visit.' : 'Uploads stay on this device for this visit only. Nothing is sent anywhere.';
  say(hwApproved ? 'Approved by a grown-up. ✓' : 'Approval removed.');
}
function hwClearPhoto(){
  var ph=$('hw-photo');
  if(ph) ph.innerHTML='<span class="muted">Sample problem removed. Upload your own schoolwork, or tap Replace for a new sample.</span>';
}
function hwCrop(){
  var ph=$('hw-photo');
  if(!ph) return;
  ph.style.transform = ph.style.transform.indexOf('scale')>=0 ? '' : 'scale(1.06)';
  say('Cropped view — zoomed in a little.');
}
function hwRotate(){
  hwRot=(hwRot+90)%360;
  var ph=$('hw-photo');
  if(ph) ph.style.transform='rotate('+hwRot+'deg) scale('+(hwRot%180===0?'1':'0.85')+')';
}
function hwReplace(){
  hwProblem = (hwProblem.a===12) ? {a:15,b:7} : {a:12,b:4};
  var ph=$('hw-photo');
  if(ph){
    ph.style.transform='';
    ph.innerHTML='<span class="hw-crop" aria-hidden="true"></span><span class="hw-sum">'+hwProblem.a+' − '+hwProblem.b+' = ?</span><button class="hw-x" type="button" onclick="hwClearPhoto()" aria-label="Remove sample problem">✕</button>';
  }
  var hint=$('hw-hint');
  if(hint) hint.textContent='The problem is '+hwProblem.a+' − '+hwProblem.b+'. Instead of just telling the answer, let\u2019s think it through. Can you show '+hwProblem.a+' using counters, and then take away '+hwProblem.b+'? What do you notice?';
  hwResetCounters();
  say('New sample problem: '+hwProblem.a+' − '+hwProblem.b+' = ?');
}
function hwResetCounters(){
  hwTaken=0;
  var host=$('hw-counters'); if(!host) return;
  host.innerHTML='';
  for(var i=0;i<hwProblem.a;i++){
    var b=document.createElement('button');
    b.type='button'; b.className='counter'; b.textContent='●';
    b.setAttribute('aria-label','Counter '+(i+1));
    b.onclick=(function(idx){ return function(ev){ hwTake(idx, ev.currentTarget); }; })(i);
    host.appendChild(b);
  }
  var note=$('hw-counter-note');
  if(note) note.textContent=hwProblem.a+' counters. Tap a counter to take it away — watch what is left.';
}
function hwTake(idx, btn){
  if(btn.classList.contains('taken')) return;
  btn.classList.add('taken'); btn.textContent='○'; btn.disabled=true;
  hwTaken++;
  var left=hwProblem.a-hwTaken;
  var note=$('hw-counter-note');
  if(note) note.textContent = left+' left. '+hwProblem.a+' take away '+hwTaken+' is '+left+'.';
  if(hwTaken===hwProblem.b){
    if(note) note.textContent='✓ You took away '+hwProblem.b+'! '+hwProblem.a+' − '+hwProblem.b+' = '+left+'. Well done!';
    addStars(1,'solving with counters');
  }
}
function hwClue(){
  var left=hwProblem.a-hwTaken;
  var hint=$('hw-hint');
  if(hint) hint.textContent='Clue: start at '+hwProblem.a+' and count back '+hwProblem.b+' steps: '+(hwProblem.a-1)+', '+(hwProblem.a-2)+' … where do you land? There are '+left+' counters left.';
}
function hwShowCounters(){ hwResetCounters(); say('Counters reset — '+hwProblem.a+' fresh counters.'); }
function hwDrawIt(){ openDraw({question:'Show '+hwProblem.a+' − '+hwProblem.b+' with counters.', hint:'Hint: draw '+hwProblem.a+' dots, then cross out '+hwProblem.b+' of them. How many are left?', returnView:'homework'}); }

/* ============================== PARENT DASHBOARD ============================== */
function renderDashboard(){
  var host=$('dash-content'); if(!host) return;
  var c=CHILDREN[dashChild];
  var hn=$('dash-hero-name'); if(hn) hn.textContent=c.first+'\u2019s Learning Progress';
  var skills=SKILLS[dashChild];
  var html='<div class="card"><h2>'+esc(c.first)+'\u2019s skills</h2>';
  skills.forEach(function(s){
    var pct=skillPct[dashChild][s.id];
    var st=progress[dashChild].skills[s.id];
    html+='<div class="skill-row"><span class="sk-name">'+s.icon+' '+esc(s.short)+'</span><div class="skillbar"><div class="skillbar-fill'+(s.id==='addSub'?' violet':'')+'" style="--w:'+pct+'%"></div></div><span class="sk-pct">'+pct+'%</span></div>'+
      '<p class="muted small">'+esc(s.name)+' • '+(st?st.correct:0)+' correct of '+(st?st.attempts:0)+' this visit</p>';
  });
  html+='<p class="fineprint">Bars start from sample data and move with this visit\u2019s practice. No sibling comparison, no leaderboard — each child is measured against their own past work.</p></div>';
  var sess=progress[dashChild].sessions;
  html+='<div class="card"><h2>📚 This visit</h2>';
  if(!sess.length){ html+='<p class="muted">No lessons finished yet this visit. Start one from Home or Subjects!</p>'; }
  else{
    html+='<ul>';
    sess.slice(-5).reverse().forEach(function(s){
      html+='<li>'+esc((TEACH[s.skill]||{}).title||s.skill)+' — '+s.correct+' of '+s.total+' correct • '+s.when+'</li>';
    });
    html+='</ul>';
  }
  html+='</div>';
  host.innerHTML=html;
  var rc=$('dash-review-count');
  if(rc){
    var ready=PATHS[dashChild].goals.filter(function(g){ return !progress[dashChild].goals[g.id].confirmed; }).length;
    rc.textContent=ready+' goal'+(ready===1?'':'s')+' ready for your review';
  }
  var dn=$('dash-next');
  if(dn) dn.textContent = dashChild==='dhyan' ? 'Count to 10 with Rexy — touch each picture and count out loud.' : 'Build and read numbers to 200 using tens and ones.';
  renderHomeProgress();
}
function dashPick(id){
  dashChild=id;
  document.querySelectorAll('[data-dash-child]').forEach(function(b){ b.classList.toggle('sel', b.getAttribute('data-dash-child')===id); });
  renderDashboard();
}
function dashStartActivity(){
  if(dashChild==='dhyan'){ showView('jk'); return; }
  startLesson('placeValue');
}

/* ============================== GOAL EVIDENCE REVIEW ============================== */
var REVIEW_ATTEMPTS=[{n:142,note:'not yet'},{n:146,note:'close'},{n:147,note:'correct'}];
var reviewSel=2;
function reviewBlocks(n){
  var h=Math.floor(n/100), t=Math.floor((n%100)/10), o=n%10;
  var html='';
  for(var i=0;i<h;i++) html+='<span class="blk b100"></span>';
  for(var j=0;j<t;j++) html+='<span class="blk b10"></span>';
  for(var k=0;k<o;k++) html+='<span class="blk b1"></span>';
  return html;
}
function renderReview(){
  var host=$('review-attempts'); if(!host) return;
  host.innerHTML=REVIEW_ATTEMPTS.map(function(a,i){
    return '<li class="'+(i===reviewSel?'sel':'')+'"><button type="button" class="linklike" style="display:flex;gap:10px;align-items:center;width:100%;text-decoration:none;color:inherit" onclick="reviewAttempt('+i+')"><span class="a-num">'+(i+1)+'</span><strong>'+a.n+'</strong><span class="a-note">'+(a.n===147?'✓ correct':a.note)+'</span></button></li>';
  }).join('');
  var att=REVIEW_ATTEMPTS[reviewSel];
  var rb=$('review-blocks'); if(rb) rb.innerHTML=reviewBlocks(att.n);
  var rn=$('review-num'); if(rn) rn.textContent=att.n;
  var rs=$('review-status');
  if(rs){ rs.textContent = att.n===147 ? '✓ Correct — 147' : (att.n===146 ? 'Close — 146' : 'Not yet — 142'); }
}
function reviewAttempt(i){
  reviewSel=i;
  renderReview();
  var att=REVIEW_ATTEMPTS[i];
  say('Attempt '+(i+1)+': '+att.n+' — '+(att.n===147?'correct!':att.note+'.'));
}
var reviewSpeaking=false;
function reviewFullSize(btn){
  var c=$('review-exercise'); if(!c) return;
  var on=c.classList.toggle('zoomed');
  btn.textContent = on ? '⤢ Show smaller' : '⤢ View work full size';
}
function reviewPlay(){
  var btn=$('review-play'), wave=$('review-wave'), time=$('review-time');
  if(reviewSpeaking){ stopSpeak(); reviewSpeaking=false; if(btn) btn.textContent='▶'; if(wave) wave.classList.remove('playing'); if(time) time.textContent='0:00 / 0:18'; return; }
  reviewSpeaking=true;
  if(btn) btn.textContent='⏸';
  if(wave) wave.classList.add('playing');
  speak('I made one hundred, four tens, and seven ones. That is one hundred forty-seven.');
  var s=0;
  clearInterval(reviewPlay._t);
  reviewPlay._t=setInterval(function(){
    s++;
    if(time) time.textContent='0:'+String(Math.min(18,s)).padStart(2,'0')+' / 0:18';
    if(s>=18){ clearInterval(reviewPlay._t); reviewSpeaking=false; if(btn) btn.textContent='▶'; if(wave) wave.classList.remove('playing'); }
  },1000);
}
function reviewConfirm(){
  var yes=$('mastery-yes');
  var note=$('review-note');
  progress[currentChild].goals['goal-placeValue'].confirmed=true;
  progress[currentChild].goals['goal-placeValue'].confirmedAt=new Date().toLocaleTimeString();
  if(note) note.textContent='✓ Goal complete! Thank you for reviewing — Dhyey can move on to the next goal.';
  addStars(3,'a goal confirmed by a grown-up');
  say('✓ Goal confirmed complete!');
  renderPath(); renderDashboard();
}
function reviewPractise(){ showView('workbook'); }

/* ============================== PLANNER ============================== */
function plannerAdjust(){
  plannerEdit=!plannerEdit;
  document.querySelectorAll('.tt-cell').forEach(function(c){ c.classList.toggle('editing', plannerEdit); });
  var note=$('planner-note');
  if(note) note.textContent = plannerEdit ? 'Editing: tap any box to change it. Tap “Adjust my plan” again when you are done.' : 'Tap a box to change it. Changes last for this visit only.';
  say(plannerEdit ? 'Editing the plan — tap a box to change it.' : 'Plan saved for this visit.');
}
function plannerCycle(cell){
  if(!plannerEdit){
    say('Tap “Adjust my plan” first, then tap a box to change it.');
    return;
  }
  var cur=PLANNER_CYCLE.findIndex(function(k){ return cell.classList.contains(k); });
  var next=PLANNER_CYCLE[(cur+1)%PLANNER_CYCLE.length];
  PLANNER_CYCLE.forEach(function(k){ cell.classList.remove(k); });
  cell.classList.add(next);
  cell.textContent=PLANNER_LABEL[next];
}
function plannerWeek(){
  var host=$('planner-week'); if(!host) return;
  var counts={};
  document.querySelectorAll('.tt-cell').forEach(function(c){
    var k=PLANNER_CYCLE.find(function(k2){ return c.classList.contains(k2); })||'math';
    counts[k]=(counts[k]||0)+1;
  });
  host.hidden=!host.hidden;
  if(!host.hidden){
    host.innerHTML='<div class="card"><h2>Week at a glance</h2><p>'+
      Object.keys(counts).map(function(k){ return PLANNER_LABEL[k]+': '+counts[k]+' slots'; }).join(' • ')+
      '</p><p class="muted">60 minutes a day, with two 5-minute breaks. Nice and balanced!</p></div>';
  }
}

/* ============================== SETTINGS ============================== */
function setPick(id){
  setChildId=id;
  document.querySelectorAll('[data-set-child]').forEach(function(b){ b.classList.toggle('sel', b.getAttribute('data-set-child')===id); });
  var c=CHILDREN[id];
  var n1=$('set-child-name'); if(n1) n1.textContent=c.first+'\u2019s';
  var n2=$('set-child-name2'); if(n2) n2.textContent=c.first;
  var dn=$('set-display-name'); if(dn) dn.value=c.first;
  var gd=$('set-grade'); if(gd) gd.value = c.jk ? 'JK' : '2';
}
function setTab(tab, btn){
  document.querySelectorAll('.set-tab').forEach(function(b){
    var on=b===btn; b.classList.toggle('sel',on); b.setAttribute('aria-selected',on?'true':'false');
  });
  var map={profile:'set-profile', access:'set-access', voice:'set-voice-panel', grownup:'set-grownup'};
  Object.keys(map).forEach(function(k){ var el=$(map[k]); if(el) el.hidden = k!==tab; });
}
function toggleSetting(key, btn){
  var on=btn.getAttribute('aria-checked')!=='true';
  btn.setAttribute('aria-checked', on?'true':'false');
  settings[key]=on;
  if(key==='bigText') document.documentElement.classList.toggle('big-text', on);
  if(key==='lowMotion'){ document.documentElement.classList.toggle('low-motion', on); if(on) stopSpeak(); }
  if(key==='mic') say(on ? 'Microphone: ready for when voice chat arrives. (Voice chat is planned.)' : 'Microphone off. Rexy will read and type with you instead.');
  if(key==='bigText') say(on ? 'Bigger text on — easier to read!' : 'Text back to normal size.');
  if(key==='lowMotion') say(on ? 'Low motion on — calmer animations.' : 'Motion back to normal.');
}
function setVoice(v){
  settings.voice=v;
  say(v==='calm' ? 'Read-aloud voice: Calm.' : 'Read-aloud voice: Rexy (Friendly).');
}
function changeAvatar(){
  avatarChoice=(avatarChoice+1)%AVATARS.length;
  var img=document.querySelector('.set-avatar img');
  if(img) img.src=AVATARS[avatarChoice];
  say('Avatar changed!');
}
function saveProfile(){
  var name=($('set-display-name')||{}).value||'';
  var grade=($('set-grade')||{}).value||'2';
  var theme=($('set-theme')||{}).value||'space';
  var c=CHILDREN[setChildId];
  if(name.trim()){ c.first=name.trim(); c.name=name.trim()+' '+(setChildId==='dhyey'?'Patel':'Patel'); }
  c.jk = grade==='JK';
  c.level = c.jk ? 'Junior Kindergarten, age 4' : 'Grade 2, Ontario';
  settings.theme=theme;
  document.documentElement.setAttribute('data-theme', theme);
  syncPanel(); renderHomeProgress();
  say('Profile saved for '+c.first+'!');
}
function addChild(){
  var n=$('add-child-note');
  if(n) n.textContent='Adding a child is planned for the family version — this demo has Dhyey and Dhyan.';
  say('Adding a child is planned — this demo has Dhyey and Dhyan.');
}
function clearProgress(){
  progress={ dhyey: emptyProgress('dhyey'), dhyan: emptyProgress('dhyan') };
  skillPct=JSON.parse(JSON.stringify(SKILL_BASE));
  sessionStart=Date.now();
  renderHomeProgress(); renderDashboard(); renderPath();
  say('This visit\u2019s progress is cleared. Fresh start!');
}

/* ============================== HELP ============================== */
function faqToggle(btn){
  var ans=btn.nextElementSibling;
  var open=btn.getAttribute('aria-expanded')==='true';
  btn.setAttribute('aria-expanded', open?'false':'true');
  if(ans) ans.hidden=open;
}
function helpGuide(value, btn){
  var sel=$('help-guide'); if(sel) sel.value=value;
  document.querySelectorAll('[data-guide]').forEach(function(b){ b.classList.toggle('sel', b.getAttribute('data-guide')===value); });
  var texts={
    '2':'Grade 2 guide: Place Value, Addition & Subtraction, and Patterning — with hints first, always.',
    'JK':'JK guide: Counting to 10, finding numbers, and letter sounds — tiny steps, big cheers.',
    'grownups':'Grown-ups guide: progress is session-only, the helper is built-in (not live AI), and the planned live tutor uses OmniRoute AI first with the local LLM on your family PC as the fallback.'
  };
  var t=$('help-guide-text'); if(t) t.textContent=texts[value]||texts['2'];
}

/* ============================== JK LESSONS ============================== */
var jkIndex=0, jkTapped=new Set(), jkDone=false;
function renderJK(){
  var L=JK_LESSONS[jkIndex];
  var c=$('jk-count'); if(c) c.textContent=(jkIndex+1)+' of '+JK_LESSONS.length;
  var p=$('jk-prompt'); if(p) p.textContent=L.prompt;
  var stage=$('jk-stage'); if(stage){
    stage.innerHTML='';
    L.items.forEach(function(item,i){
      var b=document.createElement('button');
      b.type='button'; b.className='jk-item'; b.textContent=item;
      b.setAttribute('aria-label','Item '+(i+1));
      b.onclick=function(){ jkTapItem(i, b); };
      stage.appendChild(b);
    });
  }
  var ans=$('jk-answers'); if(ans){
    ans.innerHTML='';
    L.answers.forEach(function(a){
      var b=document.createElement('button');
      b.type='button'; b.textContent=a;
      b.onclick=function(){ jkAnswer(a, b); };
      ans.appendChild(b);
    });
  }
  var nx=$('jk-next'); if(nx) nx.disabled=true;
  var fb=$('jk-feedback'); if(fb) fb.textContent='';
  jkTapped=new Set();
}
function jkTapItem(i, btn){
  var L=JK_LESSONS[jkIndex];
  if(L.type==='find'){
    if(L.items[i]===L.answer){
      btn.classList.add('correct');
      jkCorrect('You found '+L.answer+'! Great eyes! 👀');
    } else {
      btn.classList.add('wrong');
      var fb=$('jk-feedback'); if(fb) fb.textContent='That is '+L.items[i]+'. Look for '+L.answer+' — say its name and look carefully!';
    }
    return;
  }
  if(jkTapped.has(i)){ jkTapped.delete(i); btn.classList.remove('tapped'); }
  else { jkTapped.add(i); btn.classList.add('tapped'); }
  var n=jkTapped.size;
  speak(n===0?'':(''+n));
}
function jkAnswer(a, btn){
  var L=JK_LESSONS[jkIndex];
  var fb=$('jk-feedback');
  if(L.type==='count' && jkTapped.size!==Number(L.answer) && jkTapped.size>0){
    if(fb) fb.textContent='You tapped '+jkTapped.size+'. Count again — touch each one!';
    return;
  }
  if(String(a)===String(L.answer)){
    btn.classList.add('correct');
    jkCorrect('Yes! '+L.answer+' is right! 🎉');
  } else {
    btn.classList.add('wrong');
    if(fb) fb.textContent='Good try! Count again — touch each picture and count out loud.';
  }
}
function jkCorrect(msg){
  var fb=$('jk-feedback'); if(fb) fb.textContent=msg;
  var nx=$('jk-next'); if(nx) nx.disabled=false;
  addStars(1,'counting with Rexy');
  speak(msg);
}
function jkListen(){
  var L=JK_LESSONS[jkIndex];
  speak(L.speak);
}
function jkNext(){
  if(jkIndex+1<JK_LESSONS.length){ jkIndex++; renderJK(); return; }
  var stage=$('jk-stage');
  if(stage) stage.innerHTML='<p class="big-num">🎉 You did all 3 lessons!</p><p>Counting superstar! Rexy is so proud of you.</p><div class="row center"><button class="btn primary" type="button" onclick="jkRestart()">↻ Play again</button><button class="btn" type="button" onclick="showView(\'home\')">🏠 Home</button></div>';
  var ans=$('jk-answers'); if(ans) ans.innerHTML='';
  var nx=$('jk-next'); if(nx) nx.disabled=true;
  addStars(2,'finishing First Lessons');
}
function jkRestart(){ jkIndex=0; renderJK(); }

/* ============================== INIT ============================== */
function init(){
  if(_inited) return;
  _inited=true;
  /* Compatibility hooks for the parent site's scripts (kept, but this
     demo loads none of them — it is fully self-contained). */
  window.VIEW_META=VIEW_META;
  window.showView=showView; window.railGo=railGo; window.toggleRail=toggleRail;
  window.scrollInPanel=scrollInPanel; window.openMuseChat=openMuseChat; window.addMuseMsg=addMuseMsg;
  window.toggleHint=toggleHint; window.startLesson=startLesson; window.submitLesson=submitLesson;
  window.renderHomeProgress=renderHomeProgress; window.renderDashboard=renderDashboard;
  window.sendMuseText=sendMuseText; window.openExplore=function(){ showView('subjects'); };
  window.openPath=openPath; window.openCodeQuest=function(){ showView('code'); };
  window.openDraw=openDraw; window.openHelper=function(){ showView('help'); };
  window.openLearner=function(){ showView('subjects'); };
  window.CHILDREN=CHILDREN; window.TEACH=TEACH;
  window.currentChild=currentChild; window.progress=progress; window.dashChild=dashChild;
  window.currentLesson=currentLesson; window.museLearner=museLearner;

  /* Welcome interest chips */
  document.querySelectorAll('#setup-interests .chip-toggle').forEach(function(b){
    b.addEventListener('click', function(){
      b.classList.toggle('sel');
      b.setAttribute('aria-pressed', b.classList.contains('sel')?'true':'false');
    });
  });
  /* Journey checklist */
  document.querySelectorAll('.journey-item').forEach(function(b){
    b.addEventListener('click', function(){
      var on=b.classList.toggle('done');
      b.setAttribute('aria-pressed', on?'true':'false');
      journeyDone[b.getAttribute('data-journey')]=on;
      renderHomeProgress();
      if(on) say('Nice! One more done. ✅');
    });
  });
  /* Planner cells */
  document.querySelectorAll('.tt-cell').forEach(function(c){
    c.addEventListener('click', function(){ plannerCycle(c); });
  });
  /* Swatches */
  [['draw-swatches', drawColor], ['board-swatches', function(col, btn){ if(boardPad) boardPad.color=col; document.querySelectorAll('#board-swatches .swatch').forEach(function(b){ b.classList.toggle('sel', b===btn); }); }]].forEach(function(pair){
    var host=$(pair[0]); if(!host) return;
    PALETTE.forEach(function(col,i){
      var b=document.createElement('button');
      b.type='button'; b.className='swatch'+(i===0?' sel':''); b.style.background=col;
      b.setAttribute('aria-label','Colour '+col);
      b.onclick=function(){ pair[1](col, b); };
      host.appendChild(b);
    });
  });
  /* Tutor form */
  var tf=$('tutor-form');
  if(tf) tf.addEventListener('submit', function(e){
    e.preventDefault();
    var inp=$('tutor-input');
    var v=inp.value; inp.value='';
    sendMuseText(v);
  });
  /* Homework upload */
  var hf=$('hw-file');
  if(hf) hf.addEventListener('change', function(){
    var f=hf.files && hf.files[0];
    var fn=$('hw-filename');
    if(!f) return;
    if(fn) fn.textContent='Chosen: '+f.name+' — waiting for grown-up approval.';
    if(f.type && f.type.indexOf('image/')===0){
      var ph=$('hw-photo');
      if(ph){
        var url=URL.createObjectURL(f);
        ph.innerHTML='<img src="'+url+'" alt="Uploaded schoolwork" style="max-width:100%;max-height:220px;border-radius:12px"><button class="hw-x" type="button" onclick="hwClearPhoto()" aria-label="Remove upload">✕</button>';
      }
    }
    say('File chosen. Ask a grown-up to approve it.');
  });
  /* Bell */
  var bell=$('bell-btn');
  if(bell) bell.addEventListener('click', function(e){
    e.stopPropagation();
    var pop=$('bell-pop');
    var open=pop.hidden;
    pop.hidden=!open;
    bell.setAttribute('aria-expanded', open?'true':'false');
  });
  var bok=$('bell-ok');
  if(bok) bok.addEventListener('click', function(){ $('bell-pop').hidden=true; });
  document.addEventListener('click', function(e){
    var pop=$('bell-pop');
    if(pop && !pop.hidden && !e.target.closest('.mobile-top')) pop.hidden=true;
    if(!e.target.closest('#ph-child') && !e.target.closest('#child-menu')) closeChildMenu();
  });
  document.addEventListener('keydown', function(e){
    if(e.key==='Escape'){ closeChildMenu(); var pop=$('bell-pop'); if(pop) pop.hidden=true; endBreakIfOpen(); }
  });
  /* Rail brand → home */
  var brand=$('rail-brand');
  if(brand) brand.addEventListener('click', function(){ goHome(); });
  /* Pads */
  var dc=$('draw-canvas'); if(dc) drawPad=makePad(dc);
  var bc=$('board-canvas'); if(bc) boardPad=makePad(bc);
  /* Defaults */
  boardRenderFrame();
  hwResetCounters();
  cqProject('star');
  renderQuizShell();
  wbRender();
  renderReview();
  renderPath();
  renderHomeProgress();
  if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    settings.lowMotion=true;
    document.documentElement.classList.add('low-motion');
    var tgl=$('tg-lowmotion'); if(tgl) tgl.setAttribute('aria-checked','true');
  }
  /* Session timer: refresh the minutes display every 30 seconds */
  setInterval(function(){ renderHomeProgress(); }, 30000);
  showView('welcome');
}
function endBreakIfOpen(){ var o=$('break-overlay'); if(o && !o.hidden) endBreak(); }
var _inited=false;
document.addEventListener('DOMContentLoaded', init);
if(document.readyState!=='loading') init();
