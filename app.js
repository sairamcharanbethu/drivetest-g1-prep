/* Ontario G1 Prep — static SPA. No backend, no login. Progress in localStorage only. */
(function(){
"use strict";
var LS_P="g1.progress.v1", LS_A="g1.attempts.v1";
var DATA=null, app=document.getElementById("app");

function esc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;}
function load(k,d){try{var v=localStorage.getItem(k);return v?JSON.parse(v):d;}catch(e){return d;}}
function save(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
var progress=load(LS_P,{completed:[],best:{}});       // best: {lessonId: score/5}
var attempts=load(LS_A,[]);                           // {kind,signs,rules,passed,date}
function saveProgress(){save(LS_P,progress);}
function saveAttempts(){save(LS_A,attempts);}

function lessonById(id){for(var i=0;i<DATA.lessons.length;i++)if(DATA.lessons[i].id===id)return DATA.lessons[i];return null;}
function signPool(){var p=[];DATA.lessons.forEach(function(l){if(l.section==="signs")l.questions.forEach(function(q){p.push({lesson:l.id,section:"signs",q:q});});});return p;}
function rulePool(){var p=[];DATA.lessons.forEach(function(l){if(l.section==="rules")l.questions.forEach(function(q){p.push({lesson:l.id,section:"rules",q:q});});});return p;}

function passRate(list,key){ // key: 'passed' overall or per-section helper handled by caller
  if(!list.length)return null;
  var p=0;list.forEach(function(a){if(a[key])p++;});return {n:list.length,passed:p,pct:Math.round(100*p/list.length)};
}
function sectionRate(field){ // only attempts that actually tested this section
  var list=attempts.filter(function(a){
    return field==="signs" ? (a.kind==="full"||a.kind==="signs") : (a.kind==="full"||a.kind==="rules");
  });
  if(!list.length)return null;
  var p=0;list.forEach(function(a){if(a[field]>=16)p++;});
  return {n:list.length,passed:p,pct:Math.round(100*p/list.length)};
}

/* ---------- ROUTER ---------- */
function route(){
  var h=(location.hash||"#/").replace(/^#\/?/,"");
  var parts=h.split("/");
  document.querySelectorAll("#nav a").forEach(function(a){a.classList.remove("active");});
  var navMap={ "":"home","lessons":"lessons","lesson":"lessons","mock":"mock","practice":"practice","signs":"signs","samples":"samples" };
  var nav=document.querySelector('#nav a[data-nav="'+(navMap[parts[0]]||"home")+'"]');
  if(nav)nav.classList.add("active");
  if(!DATA){app.innerHTML="<p>Loading course…</p>";return;}
  if(parts[0]===""||parts[0]==="home")return renderHome();
  if(parts[0]==="lessons")return renderLessons();
  if(parts[0]==="lesson")return renderLesson(parseInt(parts[1],10));
  if(parts[0]==="mock")return parts[1]?renderMock(parts[1]):renderMockChooser();
  if(parts[0]==="practice")return renderPractice();
  if(parts[0]==="signs")return renderSigns();
  if(parts[0]==="samples")return renderSamples();
  renderHome();
}
window.addEventListener("hashchange",route);

/* ---------- HOME / DASHBOARD ---------- */
function renderHome(){
  var done=progress.completed.length;
  var mocks=attempts.slice();
  var full=mocks.filter(function(a){return a.kind==="full";});
  var signsOnly=mocks.filter(function(a){return a.kind==="signs";});
  var rulesOnly=mocks.filter(function(a){return a.kind==="rules";});
  var fullPass=passRate(full,"passed");
  var signRate=sectionRate("signs");
  var ruleRate=sectionRate("rules");
  var bestFull=null;
  full.forEach(function(a){var t=a.signs+a.rules;if(bestFull===null||t>bestFull)bestFull=t;});
  var pct=function(r){return r?r.pct+"% ("+r.passed+"/"+r.n+")":"— no attempts yet";};
  app.innerHTML=
  '<div class="card"><h2>Your G1 dashboard</h2>'+
  '<p><span class="badge free">Unlimited free tests — no sign-up</span> <span class="badge">40 questions · 20 signs + 20 rules</span> <span class="badge">Pass = 16/20 in EACH section</span></p>'+
  '<p>The real G1 test has <strong>40 multiple-choice questions — 20 Road Signs and 20 Rules of the Road</strong>. You must score <strong>at least 16/20 (80%) in each section separately</strong>. Failing one section fails the whole test, even if your total is high. That is exactly how the mock tests below are scored.</p>'+
  '<div class="statgrid">'+
    '<div class="stat"><div class="num">'+done+' / 24</div><div class="lbl">lessons completed</div></div>'+
    '<div class="stat"><div class="num">'+mocks.length+'</div><div class="lbl">mock tests taken</div></div>'+
    '<div class="stat"><div class="num">'+(fullPass?fullPass.pct+"%":"—")+'</div><div class="lbl">full-mock pass rate'+(fullPass?" ("+fullPass.passed+"/"+fullPass.n+")":"")+'</div></div>'+
    '<div class="stat"><div class="num">'+(bestFull===null?"—":bestFull+" / 40")+'</div><div class="lbl">best full-mock score</div></div>'+
  '</div>'+
  '<p><strong>Road Signs section pass rate:</strong> '+pct(signRate)+' &nbsp;·&nbsp; <strong>Rules section pass rate:</strong> '+pct(ruleRate)+'</p>'+
  '<p class="muted">Pass rate counts every mock attempt you take in this browser (full, signs-only and rules-only). Signs-only attempts count toward the signs rate; rules-only toward the rules rate. Lesson quizzes do not count toward the mock pass rate — they build the knowledge behind it.</p>'+
  '<div class="progressbar" role="img" aria-label="Lesson progress"><div style="width:'+Math.round(100*done/24)+'%"></div></div>'+
  '<p style="margin-top:10px"><a class="btn" href="#/lessons">Start / continue lessons</a> <a class="btn secondary" href="#/mock">Take a mock test</a></p>'+
  '<p><button class="btn ghost" id="resetBtn">Reset my progress (this browser only)</button></p>'+
  '</div>'+
  '<div class="card"><h2>How the course works</h2><ol>'+
  '<li><strong>24 lessons</strong> in G1 order — each with the key points, a note on how Ontario differs from driving in India, and a 5-question quiz with instant feedback and the handbook source for every answer.</li>'+
  '<li><strong>Mock tests</strong> — full 40-question G1 mock (20 signs + 20 rules), signs-only (20) or rules-only (20). New shuffled questions every time. Unlimited retakes, free.</li>'+
  '<li><strong>Hands-on practice</strong> — a 2-second following-distance trainer, a sign shape/colour matcher, and intersection right-of-way scenarios.</li>'+
  '<li><strong>Handbook sample questions</strong> — the 8 questions printed in the handbook itself, with its answer key.</li>'+
  '</ol></div>'+
  '<div class="card"><h2>Numbers to memorise</h2><p class="muted">Every number below is from the handbook extraction. If a number is not here, it is not a G1 number you need to cram.</p>'+
  '<table class="nums"><tr><th>Number</th><th>Rule</th></tr>'+
  '<tr><td>5 seconds</td><td>Check mirrors every ~5 seconds</td></tr>'+
  '<tr><td>2 seconds</td><td>Minimum following distance (ideal conditions)</td></tr>'+
  '<tr><td>50 / 80 km/h</td><td>Default limit with no sign: 50 in towns, 80 elsewhere</td></tr>'+
  '<tr><td>150 m</td><td>Headlights visible 150 m; low beams within 150 m of oncoming traffic; U-turn needs 150 m clear view both ways</td></tr>'+
  '<tr><td>60 m</td><td>Low beams when less than 60 m behind another vehicle</td></tr>'+
  '<tr><td>20 m</td><td>Stop at least 20 m behind a school bus (from the rear)</td></tr>'+
  '<tr><td>5 m</td><td>Stop at least 5 m from the nearest rail at a railway crossing</td></tr>'+
  '<tr><td>1 m</td><td>Leave at least 1 m when passing a cyclist</td></tr>'+
  '<tr><td>2 m</td><td>Stay at least 2 m behind streetcar rear doors at a stop</td></tr>'+
  '<tr><td>3 / 9 / 15 m</td><td>No parking within 3 m of a hydrant, 9 m of an intersection (15 m if light-controlled), 15 m of a railway rail</td></tr>'+
  '<tr><td>9 / 15 points</td><td>Licence suspended at 9+ points (novice, 60 days) vs 15 points (fully licensed, 30 days); points stay 2 years</td></tr>'+
  '<tr><td>0 / 0.05 / 0.08</td><td>Zero BAC for G1/G2 and under-21s; warn range 0.05–0.079; 0.08+ is the criminal threshold (90-day ADLS)</td></tr>'+
  '<tr><td>$5,000</td><td>Report a collision to police if injuries or damage over $5,000</td></tr>'+
  '<tr><td>12 / 8 months</td><td>G1 lasts 12 months (8 with an approved driver-ed course); G2 at least 12 months; 20 months minimum total</td></tr>'+
  '<tr><td>4 years</td><td>Accompanying driver needs at least 4 years&rsquo; experience, BAC under 0.05%</td></tr>'+
  '<tr><td>Midnight–5 a.m.</td><td>G1 must not drive in these hours</td></tr>'+
  '</table></div>'+
  '<div class="card"><h2>For Naga — your Ontario path</h2><p>India is a <strong>non-reciprocating</strong> jurisdiction: there is no licence exchange. You take the G1 knowledge test, then — with up to <strong>12 months&rsquo; foreign experience credit</strong> (experience within the past 3 years, authentication letter from the RTO within the last 6 months) — you can take the G2 road test right away, then wait at least 12 months before the G road test. The G1 package is <strong>$159.75</strong> (confirm at drivetest.ca — fees change).</p></div>';
  var rb=document.getElementById("resetBtn");
  if(rb)rb.onclick=function(){if(confirm("Clear all lesson progress and mock-test history in this browser?")){progress={completed:[],best:{}};attempts=[];saveProgress();saveAttempts();renderHome();}};
}

/* ---------- LESSONS ---------- */
function renderLessons(){
  var h='<div class="card"><h2>24 lessons — the full G1 course</h2><p>Lessons 0–13 and 20–23 are <strong>Rules of the Road</strong>. Lessons 14–19 are <strong>Road Signs</strong>. Each lesson ends with a 5-question quiz. <span class="badge free">Free · unlimited retakes</span></p>';
  DATA.lessons.forEach(function(l){
    var done=progress.completed.indexOf(l.id)>=0;
    var best=progress.best[l.id];
    h+='<div class="lessonrow"><div><a href="#/lesson/'+l.id+'">Lesson '+l.id+' — '+esc(l.title)+'</a><br><span class="muted">'+(l.section==="signs"?"Road Signs":"Rules of the Road")+(best!==undefined?" · best quiz "+best+"/5":"")+'</span></div><div>'+(done?'<span class="done">✓ Done</span>':'<a class="btn ghost" href="#/lesson/'+l.id+'">Start</a>')+'</div></div>';
  });
  h+='</div>';
  app.innerHTML=h;
}

function renderLesson(id){
  var l=lessonById(id);
  if(!l){app.innerHTML='<div class="card"><p>Lesson not found.</p><p><a href="#/lessons">Back to lessons</a></p></div>';return;}
  var h='<div class="card"><p><a href="#/lessons">← All lessons</a></p><h2>Lesson '+l.id+' — '+esc(l.title)+'</h2>'+
  '<p><span class="badge">'+(l.section==="signs"?"Road Signs":"Rules of the Road")+'</span></p><h3>What to learn</h3><ul>';
  l.learning_points.forEach(function(p){h+='<li>'+esc(p)+'</li>';});
  h+='</ul>';
  if(l.india_note)h+='<div class="callout india"><h4>🇮🇳 How Ontario differs from driving in India</h4><p>'+esc(l.india_note)+'</p></div>';
  if(l.id===22)h+='<div class="callout correction"><h4>⚠️ Handbook correction — warn-range penalties</h4><p>'+esc(DATA.meta.warn_range_correction)+'</p><p class="muted">The handbook page still prints the old figures (3 days first / 7 days second). The figures above are the current ones from ontario.ca (updated June 30, 2026).</p></div>';
  h+='<h3>Lesson quiz — 5 questions</h3><p class="muted">Tap an answer to see instantly whether it is right, with the handbook source. Retake as often as you like.</p><div id="quiz"></div><div id="quizResult"></div>';
  var prev=DATA.lessons.filter(function(x){return x.id===id-1;})[0];
  var next=DATA.lessons.filter(function(x){return x.id===id+1;})[0];
  h+='<p style="margin-top:16px">'+(prev?'<a class="btn ghost" href="#/lesson/'+prev.id+'">← Lesson '+prev.id+'</a> ':"")+(next?'<a class="btn" href="#/lesson/'+next.id+'">Next: Lesson '+next.id+' →</a>':"")+'</p></div>';
  app.innerHTML=h;
  renderQuizInto(document.getElementById("quiz"),l.questions,"L"+id,function(score){
    var r=document.getElementById("quizResult");
    r.innerHTML='<div class="callout"><h4>Lesson quiz: '+score+' / 5</h4><p>'+(score===5?"Perfect — you know this lesson.":score>=4?"Good — review the one you missed above.":"Review the learning points above and retake the quiz — it is free and unlimited.")+'</p></div>';
    if(progress.completed.indexOf(id)<0){progress.completed.push(id);}
    if(progress.best[id]===undefined||score>progress.best[id])progress.best[id]=score;
    saveProgress();
  });
}

/* Generic instant-feedback quiz. qs: [{q,options,answer,source}] */
function renderQuizInto(el,qs,tag,onDone){
  var answered=0,score=0,done=false;
  el.innerHTML=qs.map(function(q,i){
    return '<div class="qblock" id="q-'+tag+'-'+i+'"><div class="qtext">'+(i+1)+'. '+esc(q.q)+'</div><div class="opts">'+
      q.options.map(function(o,j){return '<button class="opt" data-i="'+i+'" data-j="'+j+'">'+esc(o)+'</button>';}).join("")+
      '</div><div class="explain" style="display:none"></div></div>';
  }).join("");
  el.querySelectorAll(".opt").forEach(function(btn){
    btn.onclick=function(){
      var i=+btn.getAttribute("data-i"),j=+btn.getAttribute("data-j"),q=qs[i];
      var block=document.getElementById("q-"+tag+"-"+i);
      if(block.classList.contains("answered-correct")||block.classList.contains("answered-wrong"))return;
      var correct=(j===q.answer);
      block.querySelectorAll(".opt").forEach(function(b){b.disabled=true;});
      btn.classList.add(correct?"correct":"wrong");
      if(!correct)block.querySelectorAll(".opt")[q.answer].classList.add("correct");
      block.classList.add(correct?"answered-correct":"answered-wrong");
      var ex=block.querySelector(".explain");
      ex.style.display="block";
      ex.innerHTML=(correct?"<strong class='pass'>✓ Correct.</strong> ":"<strong class='fail'>✗ Not quite.</strong> Correct answer: <strong>"+esc(q.options[q.answer])+"</strong><br>")+
        '<span class="src">Source: '+esc(q.source)+'</span>';
      answered++;if(correct)score++;
      if(answered===qs.length&&!done){done=true;onDone(score);}
    };
  });
}

/* ---------- MOCK TESTS ---------- */
function renderMockChooser(){
  app.innerHTML='<div class="card"><h2>Mock tests — unlimited &amp; free</h2>'+
  '<p>Scored exactly like the real G1: <strong>16/20 (80%) in each section</strong>. A mock only counts as a pass when <em>both</em> sections pass.</p>'+
  '<p><a class="btn" href="#/mock/full">Full G1 mock — 40 questions</a></p><p class="muted">20 Road Signs + 20 Rules, sampled fresh from all 120 lesson questions and shuffled each time.</p>'+
  '<p><a class="btn secondary" href="#/mock/signs">Road Signs only — 20 questions</a></p>'+
  '<p><a class="btn secondary" href="#/mock/rules">Rules only — 20 questions</a></p>'+
  '<p><label><input type="checkbox" id="cdCheck"> Show a 30-minute countdown timer during the test (optional — the timer never submits your test for you)</label></p>'+
  '<h3>Your mock history (this browser)</h3><div id="hist"></div></div>';
  var hist=document.getElementById("hist");
  if(!attempts.length){hist.innerHTML='<p class="muted">No mock tests taken yet.</p>';}
  else{
    hist.innerHTML='<table class="nums"><tr><th>Date</th><th>Test</th><th>Signs</th><th>Rules</th><th>Result</th></tr>'+
      attempts.slice().reverse().map(function(a){
        return '<tr><td>'+esc(new Date(a.date).toLocaleString())+'</td><td>'+esc(a.kind)+'</td><td>'+a.signs+'/20</td><td>'+a.rules+'/20</td><td class="'+(a.passed?"pass":"fail")+'">'+(a.passed?"PASS":"FAIL")+'</td></tr>';
      }).join("")+'</table>';
  }
  var cd=document.getElementById("cdCheck");
  if(cd)cd.onchange=function(){try{localStorage.setItem("g1.countdown",cd.checked?"1":"0");}catch(e){}};
  try{cd.checked=localStorage.getItem("g1.countdown")==="1";}catch(e){}
}

var mock=null, mockTimer=null;
function renderMock(kind){
  var useCountdown=false;try{useCountdown=localStorage.getItem("g1.countdown")==="1";}catch(e){}
  var qs=[];
  if(kind==="full"){qs=shuffle(signPool()).slice(0,20).concat(shuffle(rulePool()).slice(0,20));}
  else if(kind==="signs"){qs=shuffle(signPool()).slice(0,20);}
  else if(kind==="rules"){qs=shuffle(rulePool()).slice(0,20);}
  else{location.hash="#/mock";return;}
  mock={kind:kind,qs:qs,idx:0,answers:[],start:Date.now(),useCountdown:useCountdown,recorded:false};
  if(mockTimer){clearInterval(mockTimer);mockTimer=null;}
  renderMockQ();
}
function fmtTime(ms){var s=Math.floor(ms/1000);return String(Math.floor(s/60)).padStart(2,"0")+":"+String(s%60).padStart(2,"0");}
function renderMockQ(){
  var m=mock,q=m.qs[m.idx];
  var total=m.qs.length;
  var sectionLabel=q.section==="signs"?"Road Signs":"Rules of the Road";
  var sectionCount=m.qs.filter(function(x){return x.section===q.section;}).length;
  var sectionIdx=m.qs.slice(0,m.idx+1).filter(function(x){return x.section===q.section;}).length;
  app.innerHTML='<div class="card"><p><a href="#/mock">← Change mock test</a> · <span class="timer" id="mtimer"></span> <span class="muted" id="mcount"></span></p>'+
  '<h2>'+(m.kind==="full"?"Full G1 mock":m.kind==="signs"?"Road Signs mock":"Rules mock")+'</h2>'+
  '<p><span class="badge">'+esc(sectionLabel)+' '+sectionIdx+' / '+sectionCount+'</span> <span class="badge">Question '+(m.idx+1)+' / '+total+'</span></p>'+
  '<div class="progressbar"><div style="width:'+Math.round(100*m.idx/total)+'%"></div></div>'+
  '<div class="qblock"><div class="qtext">'+esc(q.q.q)+'</div><div class="opts">'+
  q.q.options.map(function(o,j){return '<button class="opt" data-j="'+j+'">'+esc(o)+'</button>';}).join("")+'</div></div>'+
  '<p>'+(m.idx>0?'<button class="btn ghost" id="mprev">← Back</button> ':"")+'<span class="muted">Answer to continue — you can go back and change answers before finishing.</span></p></div>';
  var updateTimer=function(){
    var el=document.getElementById("mtimer");if(!el)return;
    var elapsed=Date.now()-m.start;
    if(m.useCountdown){var remain=30*60*1000-elapsed;
      el.textContent="⏱ "+(remain>0?fmtTime(remain):"00:00");
      var mc=document.getElementById("mcount");
      if(mc)mc.textContent=remain>0?"left of 30:00 (optional — never auto-submits)":"time is up — you can still finish";
    }else{el.textContent="⏱ "+fmtTime(elapsed)+" elapsed";}
  };
  updateTimer();mockTimer=setInterval(updateTimer,1000);
  app.querySelectorAll(".opt").forEach(function(btn){
    btn.onclick=function(){
      m.answers[m.idx]=+btn.getAttribute("data-j");
      if(m.idx+1<total){m.idx++;renderMockQ();}
      else{finishMock();}
    };
  });
  var prev=document.getElementById("mprev");
  if(prev)prev.onclick=function(){if(m.idx>0){m.idx--;renderMockQ();}};
}
function finishMock(){
  if(mockTimer){clearInterval(mockTimer);mockTimer=null;}
  var m=mock,signsScore=0,rulesScore=0,signsTotal=0,rulesTotal=0;
  m.qs.forEach(function(item,i){
    var ok=m.answers[i]===item.q.answer;
    if(item.section==="signs"){signsTotal++;if(ok)signsScore++;}
    else{rulesTotal++;if(ok)rulesScore++;}
  });
  var passed;
  if(m.kind==="full")passed=(signsScore>=16&&rulesScore>=16);
  else if(m.kind==="signs")passed=(signsScore>=16);
  else passed=(rulesScore>=16);
  if(!m.recorded){
    m.recorded=true;
    attempts.push({kind:m.kind,signs:signsScore,rules:rulesScore,passed:passed,date:new Date().toISOString()});
    saveAttempts();
  }
  var h='<div class="card"><h2>Mock test result</h2>'+
  '<p class="big '+(passed?"pass":"fail")+'">'+(passed?"✓ PASS":"✗ FAIL")+'</p>'+
  '<p>'+(m.kind==="full"?
    (passed?"You passed both sections — that is a G1 pass.":"You need 16/20 in <strong>each</strong> section. "+(signsScore<16?"Your signs score ("+signsScore+"/20) is below 16. ":"")+(rulesScore<16?"Your rules score ("+rulesScore+"/20) is below 16. ":"")+"Review the answers below, then retake — it is free and unlimited.") :
    (passed?"You passed this section.":"You need 16/20 to pass this section. Review the answers below, then retake."))+'</p>'+
  '<div class="statgrid">'+
  '<div class="stat"><div class="num">'+signsScore+' / '+signsTotal+'</div><div class="lbl">Road Signs'+(m.kind==="full"?" (need 16)":"")+'</div></div>'+
  '<div class="stat"><div class="num">'+rulesScore+' / '+rulesTotal+'</div><div class="lbl">Rules'+(m.kind==="full"?" (need 16)":"")+'</div></div>'+
  '<div class="stat"><div class="num">'+(signsScore+rulesScore)+' / '+(signsTotal+rulesTotal)+'</div><div class="lbl">Total</div></div></div>'+
  '<p><a class="btn" href="#/mock/'+m.kind+'">Retake (new shuffle)</a> <a class="btn secondary" href="#/mock">Other mock tests</a> <a class="btn ghost" href="#/">Dashboard</a></p></div>'+
  '<div class="card"><h2>Answer review</h2><p class="muted">Every question, the correct answer, and the handbook source.</p>';
  m.qs.forEach(function(item,i){
    var ok=m.answers[i]===item.q.answer;
    h+='<div class="qblock '+(ok?"answered-correct":"answered-wrong")+'"><div class="qtext">'+(i+1)+'. ['+(item.section==="signs"?"Signs":"Rules")+'] '+esc(item.q.q)+'</div>'+
    '<p>'+(ok?"<span class='pass'>✓ Your answer was correct.</span>":"<span class='fail'>✗ Your answer: "+esc(item.q.options[m.answers[i]]!==undefined?item.q.options[m.answers[i]]:"(no answer)")+"</span><br>Correct answer: <strong>"+esc(item.q.options[item.q.answer])+"</strong>")+'</p>'+
    '<div class="explain"><span class="src">Source: '+esc(item.q.source)+' · Lesson '+item.lesson+'</span></div></div>';
  });
  h+='</div>';
  app.innerHTML=h;
  window.scrollTo(0,0);
}

/* ---------- HANDS-ON PRACTICE ---------- */
function renderPractice(){
  app.innerHTML='<div class="card"><h2>Hands-on practice</h2><p class="muted">Practice aids — they train the skill behind the test questions. They are not the test itself.</p></div>'+
  '<div class="card" id="trainer2s"><h2>1 · Two-second following-distance trainer</h2>'+
  '<p>Watch the lead car (🚗). When it passes the yellow marker, start counting <em>“one-thousand-one, one-thousand-two”</em>. Your car (🚙) follows at a random gap. Tap <strong>“My car is at the marker”</strong> the instant your car reaches the yellow line. A safe gap is <strong>2 seconds or more</strong> in ideal conditions — more in rain, snow, or behind a truck.</p>'+
  '<div class="road" id="road"><div class="label">← direction of travel</div><div class="marker"></div><div class="car" id="leadCar">🚗</div><div class="you" id="yourCar">🚙</div><div class="lane"></div></div>'+
  '<p><button class="btn" id="start2s">Start the cars</button> <button class="btn secondary" id="tap2s" disabled>My car is at the marker</button></p>'+
  '<p id="gapLive" class="timer"></p><div id="gapResult"></div></div>'+
  '<div class="card" id="matcher"><h2>2 · Sign shape &amp; colour matcher</h2><p>Pick the shape and colour that matches the sign described. 8 rounds — the real test shows sign images, so shape and colour are your fastest recognition cues.</p><div id="matchBox"></div></div>'+
  '<div class="card" id="row"><h2>3 · Intersection right-of-way scenarios</h2><p>Choose who goes first in each scenario. The rule is cited after every answer.</p><div id="rowBox"></div></div>';
  wireTrainer();wireMatcher();wireROW();
}

/* --- 2-second trainer --- */
var trainerRAF=null;
function wireTrainer(){
  var startBtn=document.getElementById("start2s"),tapBtn=document.getElementById("tap2s"),
      lead=document.getElementById("leadCar"),you=document.getElementById("yourCar"),
      live=document.getElementById("gapLive"),res=document.getElementById("gapResult");
  var SPEED=24; // % of road width per second
  function reset(){if(trainerRAF)cancelAnimationFrame(trainerRAF);trainerRAF=null;lead.style.left="-12%";you.style.left="-12%";live.textContent="";res.innerHTML="";tapBtn.disabled=true;startBtn.disabled=false;}
  startBtn.onclick=function(){
    reset();startBtn.disabled=true;tapBtn.disabled=false;
    var delay=1+Math.random()*3; // true gap, 1.0–4.0 s
    var t0=performance.now(),leadPass=null,finished=false;
    var tick=function(now){
      var t=(now-t0)/1000;
      var lx=-12+SPEED*t, yx=-12+SPEED*Math.max(0,t-delay);
      lead.style.left=Math.min(lx,105)+"%";you.style.left=Math.min(yx,105)+"%";
      if(leadPass===null&&lx>=70){leadPass=now;}
      if(leadPass!==null){live.textContent="Lead car passed the marker "+((now-leadPass)/1000).toFixed(1)+" s ago — count: one-thousand-one, one-thousand-two…";}
      if(yx>105&&!finished){finished=true;tapBtn.disabled=true;startBtn.disabled=false;
        res.innerHTML='<div class="callout"><p>Your car passed the marker without a tap. The true gap was <strong>'+delay.toFixed(1)+' s</strong>. Try again — tap the instant your car reaches the yellow line.</p></div>';return;}
      trainerRAF=requestAnimationFrame(tick);
    };
    trainerRAF=requestAnimationFrame(tick);
    tapBtn.onclick=function(){
      if(finished||leadPass===null){res.innerHTML='<div class="callout"><p>The lead car has not passed the marker yet — wait for it, then count.</p></div>';return;}
      finished=true;if(trainerRAF)cancelAnimationFrame(trainerRAF);trainerRAF=null;
      var gap=(performance.now()-leadPass)/1000;
      tapBtn.disabled=true;startBtn.disabled=false;
      var verdict=gap<2?'<span class="fail">Too close — under 2 seconds.</span> In ideal conditions you need at least 2 seconds; in bad weather, behind a motorcycle or a large truck, or carrying a heavy load, leave even more.':
        gap<=3?'<span class="pass">Good gap — '+gap.toFixed(1)+' seconds.</span> That is a safe following distance in ideal conditions.':
        '<span class="pass">Generous gap — '+gap.toFixed(1)+' seconds.</span> Safe, though in traffic a very large gap invites others to cut in — 2–3 seconds is the sweet spot.';
      res.innerHTML='<div class="callout"><p class="big">'+gap.toFixed(1)+' s</p><p>'+verdict+'</p><p class="muted">True gap this run: '+delay.toFixed(1)+' s. (Your tap measures your judgement — compare it with the true gap.)</p></div>';
    };
  };
}

/* --- Sign matcher --- */
var MATCH_SIGNS=[
 {name:"STOP sign",meaning:"Come to a complete stop",shape:"octagon-red",label:"Red octagon"},
 {name:"YIELD sign",meaning:"Let traffic in the intersection go first",shape:"triangle-yield",label:"White triangle, red border"},
 {name:"School zone sign",meaning:"Slow down — school zone ahead",shape:"pentagon-school",label:"5-sided, fluorescent yellow/green"},
 {name:"Warning sign (e.g. curve ahead)",meaning:"Warns of a dangerous or unusual condition",shape:"diamond-yellow",label:"Yellow diamond"},
 {name:"Temporary condition sign (e.g. road work)",meaning:"Warns of road work, detour or lane closure",shape:"diamond-orange",label:"Orange diamond"},
 {name:"Information / direction sign",meaning:"Distances and destinations",shape:"rect-green",label:"Green rectangle"},
 {name:"Regulatory sign (e.g. speed limit)",meaning:"A direction that must be obeyed",shape:"rect-white",label:"White rectangle"},
 {name:"Slow-moving vehicle sign",meaning:"Vehicle ahead travels 40 km/h or less",shape:"triangle-slow",label:"Orange triangle, red border"}
];
function shapeHTML(kind,small){
  var map={
    "octagon-red":'<div class="shape shape-octagon">STOP</div>',
    "triangle-yield":'<div class="shape-triangle-inner"><span>YIELD</span></div>',
    "pentagon-school":'<div class="shape shape-pentagon">SCHOOL</div>',
    "diamond-yellow":'<div class="shape shape-diamond-y"><span>!</span></div>',
    "diamond-orange":'<div class="shape shape-diamond-o"><span>!</span></div>',
    "rect-green":'<div class="shape shape-rect-g">401 →</div>',
    "rect-white":'<div class="shape shape-rect-w">50</div>',
    "x-railway":'<div class="shape shape-x">✕</div>',
    "triangle-slow":'<div class="shape shape-tri-o">40</div>'
  };
  return map[kind]||"";
}
function wireMatcher(){
  var box=document.getElementById("matchBox");
  var order=shuffle(MATCH_SIGNS),round=0,score=0;
  function showRound(){
    if(round>=order.length){
      box.innerHTML='<div class="callout"><h4>Done: '+score+' / '+order.length+'</h4><p>'+(score===order.length?"Perfect — you know the sign families by shape and colour.":score>=6?"Good — review the ones you missed and run it again.":"Review the Sign Guide, then run the matcher again — it shuffles every time.")+'</p><p><button class="btn" id="matchAgain">Play again</button></p></div>';
      document.getElementById("matchAgain").onclick=function(){order=shuffle(MATCH_SIGNS);round=0;score=0;showRound();};
      return;
    }
    var target=order[round];
    var choices=shuffle(MATCH_SIGNS).slice(0,4);
    if(choices.indexOf(target)<0){choices[3]=target;choices=shuffle(choices);}
    box.innerHTML='<p><strong>Round '+(round+1)+' / '+order.length+' — score '+score+'</strong></p>'+
      '<p>Which shape and colour is the sign for: <strong>'+esc(target.meaning)+'</strong> ('+esc(target.name)+')?</p>'+
      '<div class="sign-grid">'+choices.map(function(c,i){
        return '<button class="opt" data-i="'+i+'" style="padding:10px">'+shapeHTML(c.shape)+'<br>'+esc(c.label)+'</button>';
      }).join("")+'</div><div id="matchFb"></div>';
    box.querySelectorAll(".opt").forEach(function(btn){
      btn.onclick=function(){
        var picked=choices[+btn.getAttribute("data-i")];
        var ok=picked.shape===target.shape;
        if(ok)score++;
        box.querySelectorAll(".opt").forEach(function(b){b.disabled=true;});
        btn.classList.add(ok?"correct":"wrong");
        document.getElementById("matchFb").innerHTML='<div class="explain"><strong class="'+(ok?"pass":"fail")+'">'+(ok?"✓ Correct.":"✗ Not quite.")+'</strong> The '+esc(target.name)+' is a <strong>'+esc(target.label)+'</strong> — '+esc(target.meaning)+'.</div>';
        round++;
        var nb=document.createElement("button");nb.className="btn";nb.textContent=round>=order.length?"See my score":"Next round →";
        nb.style.marginTop="10px";nb.onclick=showRound;document.getElementById("matchFb").appendChild(nb);
      };
    });
  }
  showRound();
}

/* --- Right-of-way scenarios --- */
var ROW_SCEN=[
 {title:"All-way stop — same time",
  diagram:"        ↑ North\n        |\n  West ———+——— East\n        |\n        ↓ South\n\nYou are facing North. A car facing West stops at the same moment as you.",
  q:"You and the car on your right stopped at exactly the same time. Who goes first?",
  options:["You go first — you are going straight","The car on your right goes first — you yield to the right","The larger vehicle goes first","Both go at the same time"],
  answer:1,
  rule:"All-way stop, tie: the driver on the left yields to the driver on the right. (Handbook: Driving through intersections.)"},
 {title:"Uncontrolled intersection — same time",
  diagram:"No stop signs, no lights.\nYou approach from the South, another car approaches from the East (your right) at the same time.",
  q:"Who has the right-of-way?",
  options:["You — you arrived first","The car from your right","The car from your left","Whoever honks first"],
  answer:1,
  rule:"At an uncontrolled intersection, if two vehicles arrive at the same time, the driver on the left must let the driver on the right go first."},
 {title:"Turning left across traffic",
  diagram:"You want to turn left. An oncoming car is coming straight through, and a pedestrian is crossing the street you want to turn into.",
  q:"What must you do?",
  options:["Turn quickly before the oncoming car reaches you","Wait — yield to the oncoming car and to the pedestrian","Turn, because your signal gives you the right-of-way","Turn — pedestrians must wait for turning cars"],
  answer:1,
  rule:"Turning left: wait for approaching traffic to pass and for pedestrians in or approaching your path. Signalling does NOT give you the right-of-way."},
 {title:"Pedestrian crossover",
  diagram:"A pedestrian has stepped onto a marked pedestrian crossover ahead of you. The overhead yellow lights are flashing.",
  q:"When may you drive through?",
  options:["As soon as the pedestrian is past your lane","Only when the pedestrian (and any guard) has completely crossed and is safely on the sidewalk","When the lights stop flashing, even if the pedestrian is still crossing","Immediately — crossovers are advisory only"],
  answer:1,
  rule:"At a pedestrian crossover, drivers must yield and proceed only when pedestrians have crossed and are safely on the sidewalk."}
];
function wireROW(){
  var box=document.getElementById("rowBox");
  var idx=0,score=0;
  function show(){
    if(idx>=ROW_SCEN.length){
      box.innerHTML='<div class="callout"><h4>Done: '+score+' / '+ROW_SCEN.length+'</h4><p>'+(score===ROW_SCEN.length?"Perfect — right-of-way rules are yours.":"Review the intersection lesson (Lesson 4) and try again.")+'</p><p><button class="btn" id="rowAgain">Try again</button></p></div>';
      document.getElementById("rowAgain").onclick=function(){idx=0;score=0;show();};
      return;
    }
    var s=ROW_SCEN[idx];
    box.innerHTML='<p><strong>Scenario '+(idx+1)+' / '+ROW_SCEN.length+' — '+esc(s.title)+'</strong></p><pre style="background:#f4f7fa;padding:12px;border-radius:8px;white-space:pre-wrap;font-family:inherit">'+esc(s.diagram)+'</pre>'+
    '<p><strong>'+esc(s.q)+'</strong></p><div class="opts">'+s.options.map(function(o,j){return '<button class="opt" data-j="'+j+'">'+esc(o)+'</button>';}).join("")+'</div><div id="rowFb"></div>';
    box.querySelectorAll(".opt").forEach(function(btn){
      btn.onclick=function(){
        var j=+btn.getAttribute("data-j"),ok=j===s.answer;
        if(ok)score++;
        box.querySelectorAll(".opt").forEach(function(b){b.disabled=true;});
        btn.classList.add(ok?"correct":"wrong");
        if(!ok)box.querySelectorAll(".opt")[s.answer].classList.add("correct");
        document.getElementById("rowFb").innerHTML='<div class="explain"><strong class="'+(ok?"pass":"fail")+'">'+(ok?"✓ Correct.":"✗ Not quite.")+'</strong> '+esc(s.rule)+'</div>';
        idx++;
        var nb=document.createElement("button");nb.className="btn";nb.textContent=idx>=ROW_SCEN.length?"See my score":"Next scenario →";
        nb.style.marginTop="10px";nb.onclick=show;document.getElementById("rowFb").appendChild(nb);
      };
    });
  }
  show();
}

/* ---------- SIGN GUIDE ---------- */
function renderSigns(){
  var cards=[
    {shape:"octagon-red",name:"STOP sign",mean:"Eight-sided, red, white letters. Come to a complete stop — at the stop line, else the crosswalk, else the sidewalk edge, else the intersection edge."},
    {shape:"triangle-yield",name:"YIELD sign",mean:"Triangle, white background, red border. Let traffic in the intersection or close to it go first. Stop if necessary."},
    {shape:"pentagon-school",name:"School zone sign",mean:"Five-sided, fluorescent yellow/green, black symbols. You are entering a school zone — slow down, watch for children."},
    {shape:"x-railway",name:"Railway crossing (X)",mean:"X-shaped, white, red outline. Railway tracks cross the road — slow down, look both ways, be prepared to stop."},
    {shape:"diamond-yellow",name:"Warning signs",mean:"Diamond, yellow background, black symbols. Warn of a curve, dip, narrow bridge, slippery road, deer crossing and more. An advisory-speed tab under one shows the maximum safe speed for the curve."},
    {shape:"diamond-orange",name:"Temporary condition signs",mean:"Diamond, orange background, black symbols. Road work, detours, lane closures, traffic-control people. Fines for speeding in a construction zone double when workers are present."},
    {shape:"rect-green",name:"Information / direction signs",mean:"Rectangle, green background, white letters. Distances and destinations. Freeway exit numbers are distances from the start — 401 exit 204 is 204 km from Windsor."},
    {shape:"rect-white",name:"Regulatory signs",mean:"Usually rectangular, white or black. A green circle means you may or must do the activity shown; a red circle with a line through it means it is not allowed."},
    {shape:"triangle-slow",name:"Slow-moving vehicle sign",mean:"Orange triangle, red border. The vehicle ahead travels at 40 km/h or less — farm tractors, implements and machinery."}
  ];
  app.innerHTML='<div class="card"><h2>Sign guide — shape &amp; colour</h2>'+
  '<p>The real G1 test shows sign <strong>images</strong>. The handbook text gives descriptions, not images, so this guide shows each family with its <strong>correct shape and colour</strong> — the fastest way to recognise a sign at a glance. No sign artwork here is invented as a real sign: each card is labelled with its family and meaning.</p>'+
  '<div class="sign-grid">'+cards.map(function(c){
    return '<div class="signcard">'+shapeHTML(c.shape)+'<b>'+esc(c.name)+'</b><span>'+esc(c.mean)+'</span></div>';
  }).join("")+'</div>'+
  '<h3>Quick rules</h3><ul><li>Green circle = you may or must do it. Red circle with a line = not allowed.</li><li>Yellow diamond = warning. Orange diamond = temporary (road work). Green rectangle = information/direction.</li><li>Stop = red octagon. Yield = white triangle, red border. School zone = 5-sided fluorescent yellow/green.</li></ul>'+
  '<p><a class="btn" href="#/practice">Practise matching shapes →</a> <a class="btn secondary" href="#/lessons">Sign lessons 14–19</a></p></div>';
}

/* ---------- HANDBOOK SAMPLES ---------- */
function renderSamples(){
  app.innerHTML='<div class="card"><h2>The handbook&rsquo;s own sample questions</h2><p>These 8 questions are printed verbatim in the Official MTO Driver&rsquo;s Handbook (“Test yourself — sample knowledge test questions”), with the handbook&rsquo;s answer key. They are in the real test format.</p><div id="sq"></div><div id="sqResult"></div></div>';
  renderQuizInto(document.getElementById("sq"),DATA.sample_questions,"sample",function(score){
    document.getElementById("sqResult").innerHTML='<div class="callout"><h4>Handbook samples: '+score+' / 8</h4><p>'+(score===8?"Perfect on the handbook&rsquo;s own questions.":score>=6?"Strong — review the ones you missed.":"Work through the lessons, then come back — these are free to retake.")+'</p></div>';
  });
}

/* ---------- BOOT ---------- */
fetch("data/questions.json").then(function(r){if(!r.ok)throw new Error("questions.json HTTP "+r.status);return r.json();}).then(function(d){
  DATA=d;route();
}).catch(function(e){
  app.innerHTML='<div class="card"><h2>Could not load the course data</h2><p>'+esc(e.message)+'</p><p>Check that <code>data/questions.json</code> is present next to this page.</p></div>';
});
})();
