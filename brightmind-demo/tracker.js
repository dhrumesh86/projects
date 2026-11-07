(async function () {
  const response = await fetch('project-status.json');
  if (!response.ok) return;
  const status = await response.json();
  VIEW_META.tracker = {t:'Project tracker', sec:'tracker'};
  const view = document.createElement('section'); view.className='view'; view.id='view-tracker';
  document.querySelector('.wrap').appendChild(view);
  const h = document.createElement('h1'); h.className='display'; h.textContent='Rexy Learn · Project tracker'; view.appendChild(h);
  const intro = document.createElement('p'); intro.textContent=status.direction+' Updated '+status.updated+'.'; view.appendChild(intro);
  for (const [title, items] of [['Completed',status.completed],['Next in the plan',status.next]]) {
    const card=document.createElement('div'); card.className='card';
    const heading=document.createElement('h2'); heading.textContent=title;card.appendChild(heading);
    const list=document.createElement('ul');for(const text of items){const li=document.createElement('li');li.textContent=text;list.appendChild(li);}card.appendChild(list);view.appendChild(card);
  }
  const title=document.createElement('h2');title.textContent='Ad hoc enquiry register';view.appendChild(title);
  for(const enquiry of status.enquiries){const card=document.createElement('div');card.className='card';const heading=document.createElement('h3');heading.textContent=enquiry.id+' · '+enquiry.request;const p=document.createElement('p');p.textContent=enquiry.status;card.append(heading,p);view.appendChild(card);}
  const nav=document.createElement('button');nav.className='rail-tab';nav.setAttribute('aria-label','Project tracker');nav.dataset.sec='tracker';nav.innerHTML='<span class="ric" aria-hidden="true">☑</span><span class="rail-label">Project tracker</span>';
  nav.onclick=()=>{showView('tracker');if(document.getElementById('app-rail').classList.contains('expanded'))toggleRail(false);};
  document.getElementById('app-rail').insertBefore(nav,document.getElementById('rail-toggle'));
})();
