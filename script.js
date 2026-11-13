(function(){
var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var $=function(s,c){return (c||document).querySelector(s)};
var $$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};
var CHECK='<svg viewBox="0 0 24 24" class="ok"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg><svg viewBox="0 0 24 24" class="x"><path d="M7 7l10 10M17 7L7 17"/></svg>';

/* Theme */
var root=document.documentElement;
function isDark(){var t=root.getAttribute('data-theme');return t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches}
try{var saved=localStorage.getItem('meditrack-theme');if(saved)root.setAttribute('data-theme',saved)}catch(e){}
$('#themeBtn').addEventListener('click',function(){
  var next=isDark()?'light':'dark';root.setAttribute('data-theme',next);
  try{localStorage.setItem('meditrack-theme',next)}catch(e){}
});

/* Toast */
var toastEl=$('#toast'),toastT;
function toast(m){toastEl.textContent=m;toastEl.classList.add('show');clearTimeout(toastT);toastT=setTimeout(function(){toastEl.classList.remove('show')},3200)}

/* Nav, progress, back to top, scroll spy */
var nav=$('#nav'),prog=$('#scrollP'),totop=$('#totop');
function onScroll(){
  var y=window.scrollY,h=document.documentElement.scrollHeight-window.innerHeight;
  nav.classList.toggle('scrolled',y>12);
  prog.style.setProperty('--p',h>0?Math.min(y/h,1):0);
  totop.classList.toggle('show',y>700);
}
onScroll();window.addEventListener('scroll',onScroll,{passive:true});
totop.addEventListener('click',function(){window.scrollTo({top:0,behavior:reduce?'auto':'smooth'})});

var toggle=$('#navToggle'),links=$('#navLinks');
toggle.addEventListener('click',function(){var o=links.classList.toggle('open');toggle.setAttribute('aria-expanded',o)});
$$('a',links).forEach(function(a){a.addEventListener('click',function(){links.classList.remove('open');toggle.setAttribute('aria-expanded','false')})});

var spyLinks=$$('a[href^="#"]:not(.btn)',links);
var spy=new IntersectionObserver(function(es){es.forEach(function(e){
  if(e.isIntersecting){spyLinks.forEach(function(a){a.classList.toggle('active',a.getAttribute('href')==='#'+e.target.id)})}
})},{rootMargin:'-45% 0px -50% 0px'});
spyLinks.forEach(function(a){var s=$(a.getAttribute('href'));if(s)spy.observe(s)});

/* Reveal */
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12});
$$('.reveal').forEach(function(el){io.observe(el)});

/* Count up */
function countUp(el){
  var to=+el.dataset.count,pre=el.dataset.prefix||'',suf=el.dataset.suffix||'';
  if(reduce){return}
  var t0=performance.now(),dur=1300;
  (function f(t){var p=Math.min((t-t0)/dur,1),e=1-Math.pow(1-p,3);el.textContent=pre+Math.round(to*e)+suf;if(p<1)requestAnimationFrame(f)})(t0);
}
var cio=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){countUp(e.target);cio.unobserve(e.target)}})},{threshold:.6});
$$('[data-count]').forEach(function(el){cio.observe(el)});

/* Button ripple */
document.addEventListener('pointerdown',function(e){
  var b=e.target.closest&&e.target.closest('.btn');if(!b||reduce)return;
  var r=b.getBoundingClientRect(),s=Math.max(r.width,r.height)*2,sp=document.createElement('span');
  sp.className='ripple';sp.style.width=sp.style.height=s+'px';
  sp.style.left=(e.clientX-r.left-s/2)+'px';sp.style.top=(e.clientY-r.top-s/2)+'px';
  b.appendChild(sp);setTimeout(function(){sp.remove()},700);
});

/* Card spotlight */
$$('.tile,.feature').forEach(function(c){
  c.addEventListener('pointermove',function(e){var r=c.getBoundingClientRect();c.style.setProperty('--mx',(e.clientX-r.left)+'px');c.style.setProperty('--my',(e.clientY-r.top)+'px')});
});

/* Interactive phone */
var take=$('#takeBtn'),takeLabel=$('#takeLabel'),taken=$('#taken'),pbar=$('#phoneBar'),pprog=$('#phoneProg'),chipA=$('#chipA'),done=false;
take.addEventListener('click',function(){
  done=!done;
  take.classList.toggle('done',done);take.setAttribute('aria-pressed',done);
  takeLabel.textContent=done?'Taken':'Take now';
  taken.textContent=done?'2/2':'1/2';
  pbar.style.width=done?'100%':'50%';
  pprog.setAttribute('aria-valuenow',done?2:1);
  chipA.textContent=done?'Dose logged just now':'Time to take your medicine';
  if(done)toast('Dose logged. Family has been told.');
});

/* Feature modal */
var dlg=$('#modal'),lastTrigger=null;
function openModal(card,trigger){
  lastTrigger=trigger;
  $('#mIcon').innerHTML=$('.icon',card).innerHTML;
  $('#mTitle').textContent=$('h3',card).textContent;
  $('#mText').textContent=card.dataset.long;
  var ul=$('#mList');ul.innerHTML='';
  card.dataset.points.split('|').forEach(function(p){var li=document.createElement('li');li.innerHTML='<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';var s=document.createElement('span');s.textContent=p;li.appendChild(s);ul.appendChild(li)});
  if(typeof dlg.showModal==='function'){dlg.showModal()}else{dlg.setAttribute('open','')}
  requestAnimationFrame(function(){dlg.classList.add('show')});
}
function closeModal(){
  dlg.classList.remove('show');
  setTimeout(function(){if(dlg.open){dlg.close()}if(lastTrigger)lastTrigger.focus()},reduce?0:260);
}
$$('.feature .more').forEach(function(b){b.addEventListener('click',function(){openModal(b.closest('.feature'),b)})});
$('#mClose').addEventListener('click',closeModal);
$('#mCta').addEventListener('click',function(){lastTrigger=null;closeModal()});
dlg.addEventListener('click',function(e){if(e.target===dlg)closeModal()});
dlg.addEventListener('cancel',function(e){e.preventDefault();closeModal()});

/* Pill-box lab */
var days=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],times=['Morning','Noon','Night'];
var longDays=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
var preset=['taken','taken','taken','taken','taken','taken','taken','missed','taken','taken','pending','pending'];
var state=[];for(var i=0;i<21;i++){state.push('pending')}
// day-major preset: index = day*3+time
var presetMap={0:'taken',1:'taken',2:'taken',3:'taken',4:'taken',5:'taken',6:'taken',7:'missed',8:'taken',9:'taken'};
function resetState(){state=[];for(var i=0;i<21;i++){state.push(presetMap[i]||'pending')}}
resetState();
var box=$('#pillbox'),slots=[];
box.appendChild(document.createElement('span'));
days.forEach(function(d){var s=document.createElement('span');s.className='pillbox__day';s.textContent=d;box.appendChild(s)});
times.forEach(function(t,ti){
  var l=document.createElement('span');l.className='pillbox__time';l.textContent=t;box.appendChild(l);
  days.forEach(function(d,di){
    var idx=di*3+ti,b=document.createElement('button');
    b.type='button';b.className='slot';b.innerHTML=CHECK;
    b.addEventListener('click',function(){state[idx]=state[idx]==='taken'?'pending':'taken';render()});
    box.appendChild(b);slots[idx]=b;
  });
});
var ringFg=$('#ringFg'),ringNum=$('#ringNum'),labMsg=$('#labMsg');
function render(){
  var n=0,m=0;
  state.forEach(function(s,idx){
    var b=slots[idx];b.dataset.state=s;
    b.setAttribute('aria-label',longDays[Math.floor(idx/3)]+' '+times[idx%3].toLowerCase()+', '+s);
    if(s==='taken')n++;if(s==='missed')m++;
  });
  ringFg.style.strokeDashoffset=327*(1-n/21);
  ringNum.textContent=n;
  var msg;
  if(n===21)msg='<b>Full week completed.</b> Every dose is accounted for.';
  else if(m>0)msg='<b>'+m+' missed dose flagged.</b> Tap it to mark it taken, as a caregiver would be told.';
  else msg='<b>'+n+' of 21 doses taken.</b> Keep going through the week.';
  labMsg.innerHTML=msg;
}
$('#labReset').addEventListener('click',function(){resetState();render();toast('Example week reset.')});
render();

/* Stepper */
var tabs=$$('.tab'),panels=$$('.panel'),stepBar=$('#stepBar');
function selectTab(i,focus){
  tabs.forEach(function(t,j){t.setAttribute('aria-selected',j===i);t.tabIndex=j===i?0:-1});
  panels.forEach(function(p,j){p.hidden=j!==i;p.classList.remove('in');if(j===i){void p.offsetWidth;p.classList.add('in')}});
  stepBar.style.width=((i+1)*25)+'%';
  if(focus)tabs[i].focus();
}
tabs.forEach(function(t,i){
  t.addEventListener('click',function(){selectTab(i)});
  t.addEventListener('keydown',function(e){
    if(e.key==='ArrowDown'||e.key==='ArrowRight'){e.preventDefault();selectTab((i+1)%4,true)}
    if(e.key==='ArrowUp'||e.key==='ArrowLeft'){e.preventDefault();selectTab((i+3)%4,true)}
  });
});

/* FAQ */
$$('.qa').forEach(function(q){
  var btn=$('button',q);
  btn.addEventListener('click',function(){
    var open=!q.classList.contains('open');
    $$('.qa').forEach(function(o){o.classList.remove('open');$('button',o).setAttribute('aria-expanded','false')});
    if(open){q.classList.add('open');btn.setAttribute('aria-expanded','true')}
  });
});

/* Form (front end only: connect to your backend or a form service) */
var form=$('#contactForm'),msgEl=$('#formMsg'),sBtn=$('#submitBtn'),sLabel=$('#submitLabel');
function setErr(id,eid,text){var f=$(id);f.classList.toggle('err',!!text);$(eid).textContent=text||''}
form.addEventListener('submit',function(e){
  e.preventDefault();
  var name=form.elements.name.value.trim(),email=form.elements.email.value.trim();
  var okName=name.length>0,okEmail=/^\S+@\S+\.\S+$/.test(email);
  setErr('#fld-name','#e-name',okName?'':'Please enter your name.');
  setErr('#fld-email','#e-email',okEmail?'':'Please enter a valid email address.');
  if(!okName||!okEmail){msgEl.textContent='';return}
  sBtn.disabled=true;sLabel.textContent='Sending';
  var sp=document.createElement('span');sp.className='spinner';sBtn.insertBefore(sp,sLabel);
  setTimeout(function(){
    sp.remove();sBtn.disabled=false;sLabel.textContent='Request updates';
    msgEl.textContent='Thank you, '+name.split(' ')[0]+'. We will be in touch soon.';
    toast('Thank you. We will be in touch soon.');
    form.reset();
  },900);
});
['#f-name','#f-email'].forEach(function(s){$(s).addEventListener('input',function(){var f=$(s).closest('.field');f.classList.remove('err');$('.e',f).textContent=''})});

/* ================= LIVE DEMO (start) =================
   A small simulation of the MediTrack loop:
   schedule -> reminder (text, voice, beep) -> confirm / skip / miss -> family message -> refill alert.
   A sped-up clock stands in for real time so a whole day can be seen in about a minute. */
(function liveDemo(){
var root=$('#demoApp');if(!root)return;

var GRACE=60;     // minutes after the due time before a dose counts as missed
var REFILL_AT=3;  // tell the family when this many doses (or fewer) are left
var MAX_MEDS=6;

// Reminder wording per language. The same text is shown on screen and spoken aloud.
var TXT={
  en:{title:'Time for your medicine',take:'Take now',skip:'Skip',sample:'Time to take your medicine.',
      remind:function(m){return 'Time to take '+m.name+(m.dose?' ('+m.dose+')':'')+'.'}},
  hi:{title:'दवा लेने का समय',take:'अभी लें',skip:'छोड़ें',sample:'दवा लेने का समय हो गया है।',
      remind:function(m){return m.name+(m.dose?' ('+m.dose+')':'')+' लेने का समय हो गया है।'}},
  mr:{title:'औषधाची वेळ',take:'आता घ्या',skip:'वगळा',sample:'औषध घेण्याची वेळ झाली आहे.',
      remind:function(m){return m.name+(m.dose?' ('+m.dose+')':'')+' घेण्याची वेळ झाली आहे.'}}
};
var VOICE={en:'en-IN',hi:'hi-IN',mr:'mr-IN'};

var S;                       // demo state: {clock (minutes since midnight), day, meds[], msgs[]}
var speed=5, lang='en', voiceOn=true, unlocked=false;
var timer=null, uid=0, actx=null, drawnMsgs=0, alertKey='', changed=false, spoken=[];

var el={time:$('#dTime'),day:$('#dDay'),play:$('#dPlay'),playLabel:$('#dPlayLabel'),jump:$('#dJump'),reset:$('#dReset'),
  lang:$('#dLang'),voice:$('#dVoice'),alert:$('#dAlert'),list:$('#dList'),sum:$('#dSum'),sumBar:$('#dSumBar'),sumProg:$('#dSumProg'),
  msgs:$('#dMsgs'),meds:$('#dMeds'),form:$('#dForm'),err:$('#dErr')};

/* ---------- helpers ---------- */
function pad(n){return n<10?'0'+n:''+n}
function fmt(m){var h=Math.floor(m/60);return (h%12||12)+':'+pad(m%60)+' '+(h>=12?'PM':'AM')}   // minutes -> "8:05 AM"
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function label(m){return m.name+(m.dose?' ('+m.dose+')':'')}
function dur(d){return d<60?d+' min':Math.floor(d/60)+' h '+(d%60)+' min'}
function byTime(a,b){return a.time-b.time}
function find(id){for(var i=0;i<S.meds.length;i++){if(S.meds[i].id===id)return S.meds[i]}return null}
// status: upcoming | due | taken | missed | later (added after its time today, so it starts tomorrow)
function mk(name,dose,time,stock){uid++;return{id:uid,name:name,dose:dose,time:time,stock:stock,status:'upcoming',dueAt:0,refillSent:false}}
function post(type,title,text){S.msgs.push({type:type,title:title,text:text,t:fmt(S.clock)})}

function seed(){
  uid=0;
  S={clock:475,day:1,msgs:[],meds:[mk('Metformin','500 mg',480,12),mk('Vitamin D','1000 IU',780,4),mk('Amlodipine','5 mg',1260,9)]};   // starts at 7:55 AM
  post('sys','MediTrack','Family alerts are on. You will be told about missed doses and refills.');
}

/* ---------- core events ---------- */
function remind(m){spoken.push(TXT[lang].remind(m));changed=true}       // a dose has just become due

function miss(m,how){                                                   // missed after the grace period, or skipped by the patient
  m.status='missed';changed=true;
  if(how==='skip')post('miss','Dose skipped',label(m)+', due at '+fmt(m.time)+', was skipped.');
  else post('miss','Missed dose',label(m)+', due at '+fmt(m.time)+', was not confirmed within an hour.');
}

function takeDose(m){                                                   // patient confirms: one tap, uses one tablet
  if(m.status!=='due')return;
  m.status='taken';m.stock=Math.max(0,m.stock-1);changed=true;
  if(m.stock<=REFILL_AT&&!m.refillSent){                                // low stock -> refill alert to the family
    m.refillSent=true;
    post('refill','Refill needed',m.name+' has '+m.stock+' dose'+(m.stock===1?'':'s')+' left.');
  }
  toast('Dose recorded: '+m.name);
}

function newDay(){                                                      // midnight: close the day, send a summary, reset the schedule
  S.meds.forEach(function(m){if(m.status==='due')miss(m,'auto')});
  var sched=S.meds.filter(function(m){return m.status!=='later'});
  var done=sched.filter(function(m){return m.status==='taken'}).length;
  post('sum','Daily summary','Day '+S.day+': '+done+' of '+sched.length+' doses taken.');
  S.day++;S.meds.forEach(function(m){m.status='upcoming'});changed=true;
}

function stepMinute(){                                                  // advance the demo clock by one minute and apply the rules
  S.clock++;
  if(S.clock>=1440){S.clock=0;newDay()}
  S.meds.forEach(function(m){
    if(m.status==='upcoming'&&S.clock>=m.time){m.status='due';m.dueAt=S.clock;remind(m)}
    else if(m.status==='due'&&S.clock-m.dueAt>=GRACE){miss(m,'auto')}
  });
}

function advance(n){
  for(var i=0;i<n;i++)stepMinute();
  if(changed){changed=false;renderStatic()}
  renderLive();announce();
}

/* ---------- voice and sound (only after the visitor has interacted with the demo) ---------- */
function beep(){
  if(!voiceOn||!unlocked)return;
  try{
    actx=actx||new (window.AudioContext||window.webkitAudioContext)();
    var o=actx.createOscillator(),g=actx.createGain(),t=actx.currentTime;
    o.type='sine';o.frequency.value=880;
    g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.16,t+.03);g.gain.exponentialRampToValueAtTime(.0001,t+.55);
    o.connect(g);g.connect(actx.destination);o.start(t);o.stop(t+.6);
  }catch(e){}
}
function speak(text){
  if(!voiceOn||!unlocked||!('speechSynthesis' in window))return;
  try{
    window.speechSynthesis.cancel();
    var u=new SpeechSynthesisUtterance(text);u.lang=VOICE[lang];u.rate=.9;
    window.speechSynthesis.speak(u);
  }catch(e){}
}
function announce(){if(spoken.length){beep();speak(spoken.join(' '));spoken=[]}}

/* ---------- rendering ---------- */
function renderLive(){                                                  // runs every tick: clock + reminder area
  el.time.textContent=fmt(S.clock);
  el.day.textContent='Day '+S.day;
  renderAlert();
}

function renderAlert(){
  var t=TXT[lang],due=S.meds.filter(function(m){return m.status==='due'}).sort(byTime);
  if(due.length){
    var key=due.map(function(m){return m.id}).join(',')+'|'+lang;
    if(key!==alertKey){                                                 // rebuild only when the set of due doses (or language) changes
      alertKey=key;
      el.alert.innerHTML=due.map(function(m){
        return '<div class="due" data-id="'+m.id+'">'+
          '<div class="due__top"><span class="due__bell"><svg viewBox="0 0 24 24"><path d="M6 9a6 6 0 1 1 12 0c0 6 2 7 2 7H4s2-1 2-7Z"/><path d="M10 20a2 2 0 0 0 4 0"/></svg></span><span class="due__k">'+esc(t.title)+'</span></div>'+
          '<p class="due__txt">'+esc(t.remind(m))+'</p>'+
          '<div class="due__bar" aria-hidden="true"><span></span></div>'+
          '<div class="due__btns"><button type="button" class="due__take" data-act="take" data-id="'+m.id+'">'+esc(t.take)+'</button>'+
          '<button type="button" class="due__skip" data-act="skip" data-id="'+m.id+'">'+esc(t.skip)+'</button></div></div>';
      }).join('');
    }
    $$('.due',el.alert).forEach(function(card){                         // shrink the grace-period bar as the clock runs
      var m=find(+card.getAttribute('data-id'));
      if(m)$('.due__bar span',card).style.width=Math.max(0,(GRACE-(S.clock-m.dueAt))/GRACE*100)+'%';
    });
    return;
  }
  alertKey='';
  var up=S.meds.filter(function(m){return m.status==='upcoming'}).sort(byTime)[0],msg;
  if(up)msg='<b>Next: '+esc(label(up))+'</b> at '+fmt(up.time)+', in '+dur(up.time-S.clock)+'.';
  else if(S.meds.some(function(m){return m.status==='later'}))msg='<b>No more doses today.</b> The rest start tomorrow.';
  else msg='<b>All of today\'s doses are done.</b>';
  if(!timer)msg+=' Press Start demo to run the clock.';
  el.alert.innerHTML='<div class="dnext"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg><p>'+msg+'</p></div>';
}

function renderStatic(){                                                // runs only when something changed
  var meds=S.meds.slice().sort(byTime),names={upcoming:'Upcoming',due:'Due now',taken:'Taken',missed:'Missed',later:'Tomorrow'};

  // Patient's "Today" list
  el.list.innerHTML=meds.length?meds.map(function(m){
    return '<li class="ditem" data-s="'+m.status+'"><div class="n"><b>'+esc(m.name)+'</b><small>'+esc(m.dose)+(m.dose?' · ':'')+fmt(m.time)+'</small></div><span class="st">'+names[m.status]+'</span></li>';
  }).join(''):'<li class="dempty">No medicines yet. Add one on the schedule.</li>';

  // Progress: taken out of everything scheduled today
  var sched=meds.filter(function(m){return m.status!=='later'}),done=sched.filter(function(m){return m.status==='taken'}).length;
  var pct=sched.length?Math.round(done/sched.length*100):0;
  el.sum.textContent=done+' of '+sched.length+' taken today';
  el.sumBar.style.width=pct+'%';el.sumProg.setAttribute('aria-valuenow',pct);

  // Caregiver schedule (with refill and remove buttons)
  el.meds.innerHTML=meds.length?meds.map(function(m){
    var low=m.stock<=REFILL_AT?'<span class="low">'+m.stock+' left</span>':m.stock+' left';
    return '<li class="dmed"><div><b>'+esc(m.name)+'</b><small>'+esc(m.dose)+(m.dose?' · ':'')+fmt(m.time)+' · '+low+'</small></div>'+
      '<div class="dmed__acts"><button type="button" class="mini-btn" data-act="refill" data-id="'+m.id+'" aria-label="Add 10 tablets of '+esc(m.name)+'">+10 refill</button>'+
      '<button type="button" class="mini-btn" data-act="remove" data-id="'+m.id+'" aria-label="Remove '+esc(m.name)+'">Remove</button></div></li>';
  }).join(''):'<li class="dempty">No medicines yet. Add one below.</li>';

  // Family messages: append only the new ones so earlier bubbles do not re-animate
  for(;drawnMsgs<S.msgs.length;drawnMsgs++){
    var g=S.msgs[drawnMsgs],d=document.createElement('div');
    d.className='msg'+(g.type==='miss'?' msg--miss':g.type==='refill'?' msg--refill':'');
    d.innerHTML='<b>'+esc(g.title)+'</b>'+esc(g.text)+'<small>'+esc(g.t)+'</small>';
    el.msgs.appendChild(d);
  }
  el.msgs.scrollTop=el.msgs.scrollHeight;
}

/* ---------- clock controls ---------- */
function start(){
  if(!timer)timer=setInterval(function(){advance(speed)},1000);          // one real second = `speed` demo minutes
  el.play.classList.add('is-running');el.playLabel.textContent='Pause';
}
function pause(){
  clearInterval(timer);timer=null;
  el.play.classList.remove('is-running');el.playLabel.textContent=S.clock===475&&S.day===1?'Start demo':'Resume';
  renderLive();
}
function jump(){                                                        // skip ahead to one minute before the next event
  var ev=[];
  S.meds.forEach(function(m){
    if(m.status==='upcoming'&&m.time>S.clock)ev.push(m.time);           // next dose time
    if(m.status==='due')ev.push(m.dueAt+GRACE);                         // when a pending dose would count as missed
  });
  var target=Math.min(ev.length?Math.min.apply(null,ev):1440,1440);
  if(target-1>S.clock)S.clock=target-1;
  renderLive();start();
}
function resetDemo(){
  pause();seed();drawnMsgs=0;alertKey='';changed=false;spoken=[];
  el.msgs.innerHTML='';el.playLabel.textContent='Start demo';
  renderLive();renderStatic();
}

/* ---------- interactions ---------- */
['pointerdown','keydown'].forEach(function(ev){root.addEventListener(ev,function(){unlocked=true},{passive:true})});   // browsers allow sound only after a gesture

el.play.addEventListener('click',function(){timer?pause():start()});
el.jump.addEventListener('click',jump);
el.reset.addEventListener('click',function(){resetDemo();toast('Demo reset.')});

$$('.seg button',root).forEach(function(b){
  b.addEventListener('click',function(){
    speed=+b.getAttribute('data-speed');
    $$('.seg button',root).forEach(function(o){o.setAttribute('aria-pressed',o===b)});
  });
});

el.lang.addEventListener('change',function(){                           // switch reminder language and preview the voice
  lang=el.lang.value;alertKey='';renderLive();
  unlocked=true;speak(TXT[lang].sample);
});
el.voice.addEventListener('click',function(){
  voiceOn=!voiceOn;el.voice.setAttribute('aria-checked',voiceOn);
  if(voiceOn){unlocked=true;beep();speak(TXT[lang].sample)}else if('speechSynthesis' in window){try{window.speechSynthesis.cancel()}catch(e){}}
});

root.addEventListener('click',function(e){                              // one delegated handler for take / skip / refill / remove
  var b=e.target.closest('[data-act]');if(!b)return;
  var m=find(+b.getAttribute('data-id')),act=b.getAttribute('data-act');if(!m)return;
  if(act==='take')takeDose(m);
  else if(act==='skip'&&m.status==='due')miss(m,'skip');
  else if(act==='refill'){m.stock+=10;m.refillSent=false;toast(m.name+': 10 tablets added.')}
  else if(act==='remove'){S.meds=S.meds.filter(function(x){return x!==m})}
  changed=false;renderStatic();renderLive();
});

el.form.addEventListener('submit',function(e){                          // add a medicine to the schedule
  e.preventDefault();
  var name=$('#d-name').value.trim(),dose=$('#d-dose').value.trim(),time=$('#d-time').value,stock=parseInt($('#d-stock').value,10);
  var err='';
  if(!name)err='Please enter the medicine name.';
  else if(!/^\d{2}:\d{2}$/.test(time))err='Please choose a time.';
  else if(!(stock>=1&&stock<=99))err='Tablets in stock must be between 1 and 99.';
  else if(S.meds.length>=MAX_MEDS)err='The demo holds up to '+MAX_MEDS+' medicines. Remove one first.';
  el.err.textContent=err;if(err)return;
  var mins=parseInt(time.slice(0,2),10)*60+parseInt(time.slice(3),10),m=mk(name,dose,mins,stock);
  if(mins<=S.clock)m.status='later';                                    // time already passed today: first dose is tomorrow
  S.meds.push(m);
  $('#d-name').value='';$('#d-dose').value='';
  renderStatic();renderLive();
  toast(name+' added for '+fmt(mins)+(m.status==='later'?' (starts tomorrow).':'.'));
});

seed();renderLive();renderStatic();
})();
/* ================= LIVE DEMO (end) ================= */

$('#year').textContent=new Date().getFullYear();
})();
