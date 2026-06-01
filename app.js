var CLAUDE_FUNCTION_URL = "https://claudechat-vwvivsoxwa-ew.a.run.app";
var ACCESS_CODES = {"mikhail2026":"me","veronika2026":"her"};

// Код-экран
(function(){
  function gi(id){return document.getElementById(id);}
  var gate=gi("codeGate");
  if(!gate)return;
  var saved=localStorage.getItem("app_who");
  if(saved==="me"||saved==="her"){gate.style.display="none";window._appWho=saved;applyWho();return;}
  gate.style.display="flex";
  document.querySelector(".main") && (document.querySelector(".main").style.display="none");
  document.querySelector(".topnav") && (document.querySelector(".topnav").style.display="none");
  function tryCode(){
    var v=gi("codeInput").value.trim().toLowerCase();
    var who=ACCESS_CODES[v];
    if(who){
      localStorage.setItem("app_who",who);
      window._appWho=who;
      gate.style.display="none";
      document.querySelector(".main") && (document.querySelector(".main").style.display="");
      document.querySelector(".topnav") && (document.querySelector(".topnav").style.display="");
      applyWho();
    } else {
      gi("codeErr").textContent="Неверный код";
      gi("codeInput").value="";
    }
  }
  gi("codeBtn").onclick=tryCode;
  gi("codeInput").onkeydown=function(e){if(e.key==="Enter")tryCode();};
  var lb=gi("lockBtn");
  if(lb){lb.style.display="";lb.onclick=function(){localStorage.removeItem("app_who");location.reload();};}
})();

function applyWho(){
  var who=window._appWho||localStorage.getItem("app_who");
  if(!who)return;
  var names={me:"Oldione",her:"Вероника"};
  var wt=document.getElementById("welcomeTitle");
  if(wt)wt.textContent="Привет, "+names[who]+" 👋";
  var lb=document.getElementById("lockBtn");
  if(lb){lb.style.display="inline-flex";lb.title="Выйти ("+names[who]+")";lb.textContent="🔒 "+names[who];}
}

// Заглушки — fbInit() заменит на реальные Firestore-функции
var saveMonth = function(){};
var saveGoals = function(){};
var saveMonthDebounced = function(){};

var MONTHS={
  "2026-06":{income:[],fixed:[],variable:[]}
};
var curKey="2026-06";
var data=MONTHS[curKey];
var PEOPLE={me:{name:"Oldione",color:"#2d63f5"},her:{name:"Вероника",color:"#c06b8a"}};
var filterWho="all";
var goals=[];
var archived=[];
var GSYM={RSD:"дин.",EUR:"€"};
var MN=["январь","февраль","март","апрель","май","июнь","июль","август","сентябрь","октябрь","ноябрь","декабрь"];
var SUBCOL={"Еда":["#e3efe7","#1f5e44"],"Транспорт":["#e7eef4","#33597d"],"Авто":["#f0e7da","#8a5a2b"],"Развлечения":["#f6ecd2","#8a6612"],"Дом":["#ece4ef","#6b4a7a"],"Здоровье":["#e6efe0","#4a6b2f"],"Прочее":["#ece8df","#6b6457"]};
var SUBS=Object.keys(SUBCOL);
var SUB_PAL=[["#e3eef7","#2f6bf2"],["#fce8ef","#b5468a"],["#eef4e0","#6a8a2f"],["#fdeede","#c2722e"],["#e9e6f6","#5b4bbf"],["#e0f1f0","#1f7a73"],["#f3e7e7","#9a4b4b"],["#eae7df","#6b6457"]];
var subPalIdx=0;
function colorForSub(name){if(!SUBCOL[name]){SUBCOL[name]=SUB_PAL[subPalIdx%SUB_PAL.length];subPalIdx++;}return SUBCOL[name]}
function ensureSub(name){if(SUBS.indexOf(name)===-1){var i=SUBS.indexOf("Прочее");if(i>=0)SUBS.splice(i,0,name);else SUBS.push(name);colorForSub(name);}}
function addSubcategory(){var name=prompt("Название новой подкатегории:");if(!name)return null;name=name.trim();if(!name)return null;ensureSub(name);return name}
function fillSubSelect(sel,selected){sel.innerHTML="";SUBS.forEach(function(s){var o=document.createElement("option");o.value=s;o.textContent=s;if(s===selected)o.selected=true;sel.appendChild(o)});var on=document.createElement("option");on.value="__new";on.textContent="+ новая…";sel.appendChild(on)}
Object.keys(MONTHS).forEach(function(k){(MONTHS[k].variable||[]).forEach(function(it){if(it.sub)ensureSub(it.sub)})});
var CSYM={RSD:"дин.",EUR:"€",USD:"$"};
var RATES={EUR:1,USD:1.08,RSD:117};
var base="RSD";
var nf=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:0});
var $=function(id){return document.getElementById(id)};
function rate(c){return RATES[c]||1}
function toBase(a,c){return (+a||0)/rate(c||base)*rate(base)}
function fmt(n){return nf.format(Math.round(n))+" "+CSYM[base]}
function csum(a,who){return a.reduce(function(s,x){return(!who||who==="all"||x.by===who)?s+toBase(x.a,x.cur):s},0)}
function monthName(k){var p=k.split("-");return MN[+p[1]-1]+" "+p[0]}
function shiftKey(k,d){var p=k.split("-").map(Number);var dt=new Date(p[0],p[1]-1+d,1);return dt.getFullYear()+"-"+String(dt.getMonth()+1).padStart(2,"0")}
function renderRatesNote(){
  var note=$("ratesNote");if(!note)return;
  if(base==="RSD")note.textContent="1 € ≈ "+Math.round(RATES.RSD)+" дин · 1 $ ≈ "+Math.round(RATES.RSD/RATES.USD)+" дин";
  else note.textContent="1 $ ≈ "+(1/RATES.USD).toFixed(2)+" €";
}
function fetchRates(){
  fetch("https://open.er-api.com/v6/latest/EUR").then(function(r){return r.json()}).then(function(d){
    if(d&&d.rates){RATES.EUR=1;RATES.USD=d.rates.USD||RATES.USD;RATES.RSD=d.rates.RSD||RATES.RSD;renderRatesNote();renderAll();}
  }).catch(function(){renderRatesNote();var n=$("ratesNote");if(n)n.textContent+=" · офлайн"});
}
var listIds={income:"lInc",fixed:"lFix",variable:"lVar"},totIds={income:"tInc",fixed:"tFix",variable:"tVar"};
function renderBreak(){
  var by={};data.variable.forEach(function(it){var s=it.sub||"Прочее";by[s]=(by[s]||0)+toBase(it.a,it.cur)});
  var wrap=$("varBreak");wrap.innerHTML="";
  Object.keys(by).forEach(function(s){var c=document.createElement("span");c.className="sub-chip";c.innerHTML=s+": <b>"+fmt(by[s])+"</b>";wrap.appendChild(c)});
}
function renderCat(cat,flashId){
  var ul=$(listIds[cat]);ul.innerHTML="";
  data[cat].forEach(function(it){
    if(!it.cur)it.cur=base;
    var li=document.createElement("li");li.className="item";if(flashId&&it._id===flashId)li.classList.add("flash");
    var dot=document.createElement("span");dot.className="item-dot";
    var pp=it.by&&PEOPLE[it.by];dot.style.background=pp?pp.color:"#cfc8ba";dot.title=pp?pp.name:"?";
    li.appendChild(dot);
    var l=document.createElement("input");l.className="item-label";l.value=it.l;l.oninput=function(){it.l=l.value;saveMonthDebounced();};li.appendChild(l);
    if(cat==="variable"){
      var sub=it.sub||"Прочее";ensureSub(sub);
      var ts=document.createElement("select");ts.className="item-sub";fillSubSelect(ts,sub);
      var cc=SUBCOL[sub]||SUBCOL["Прочее"];ts.style.background=cc[0];ts.style.color=cc[1];
      ts.onchange=function(){if(ts.value==="__new"){var n=addSubcategory();if(n)it.sub=n;}else{it.sub=ts.value;}renderCat("variable");totals();saveMonthDebounced();};
      li.appendChild(ts);
    }
    var a=document.createElement("input");a.className="item-amount";a.type="number";a.value=it.a;a.oninput=function(){it.a=+a.value||0;totals();if(cat==="variable")renderBreak();saveMonthDebounced();};
    var cs=document.createElement("select");cs.className="item-cur";
    ["RSD","EUR","USD"].forEach(function(o){var op=document.createElement("option");op.value=o;op.textContent=CSYM[o]===o?o:CSYM[o];if(o===it.cur)op.selected=true;cs.appendChild(op)});
    cs.onchange=function(){it.cur=cs.value;totals();if(cat==="variable")renderBreak();saveMonthDebounced();};
    var nb=document.createElement("button");nb.className="item-note-btn"+(it.note?" has-note":"");nb.title="Заметка";nb.textContent="✎";
    var d=document.createElement("button");d.className="item-del";d.textContent="×";d.onclick=function(){data[cat]=data[cat].filter(function(x){return x!==it});renderCat(cat);totals();saveMonth();};
    li.appendChild(a);li.appendChild(cs);li.appendChild(nb);li.appendChild(d);
    var wrapper=document.createElement("div");wrapper.style.cssText="display:flex;flex-direction:column";wrapper.appendChild(li);
    var nr=document.createElement("div");nr.className="item-note-row"+(it.note?" open":"");
    var ni=document.createElement("input");ni.className="item-note-input";ni.type="text";ni.placeholder="Заметка…";ni.value=it.note||"";
    ni.oninput=function(){it.note=ni.value;nb.className="item-note-btn"+(it.note?" has-note":"");saveMonthDebounced();};
    nr.appendChild(ni);wrapper.appendChild(nr);
    nb.onclick=function(){nr.classList.toggle("open");if(nr.classList.contains("open"))ni.focus()};
    ul.appendChild(wrapper);
  });
  $(totIds[cat]).textContent=fmt(csum(data[cat]));
  if(cat==="variable")renderBreak();
  if(flashId)setTimeout(function(){var f=ul.querySelector(".flash");if(f)f.classList.remove("flash")},1400);
}
function totals(){
  $("tInc").textContent=fmt(csum(data.income));$("tFix").textContent=fmt(csum(data.fixed));$("tVar").textContent=fmt(csum(data.variable));
  var inc=csum(data.income,filterWho),exp=csum(data.fixed,filterWho)+csum(data.variable,filterWho),bal=inc-exp;
  $("vInc").textContent=fmt(inc);$("vExp").textContent=fmt(exp);$("vBal").textContent=fmt(bal);
  var rt=inc>0?Math.round(bal/inc*100):0;
  $("vRate").textContent=inc>0?(bal<0?"перерасход "+Math.abs(rt)+"%":rt+"% от доходов"):"";
  // welcome sub
  var ws=$("welcomeSub");if(ws){var mn=monthName(curKey);ws.textContent=mn.charAt(0).toUpperCase()+mn.slice(1)+" · доходы "+fmt(inc)+" · расходы "+fmt(exp)}
  renderPie();
}
document.querySelectorAll(".fchip").forEach(function(b){b.onclick=function(){filterWho=b.getAttribute("data-who");document.querySelectorAll(".fchip").forEach(function(x){x.classList.toggle("active",x===b)});totals()}});
document.querySelectorAll(".bcur").forEach(function(b){b.onclick=function(){base=b.getAttribute("data-cur");document.querySelectorAll(".bcur").forEach(function(x){x.classList.toggle("active",x===b)});renderRatesNote();renderAll()}});
$("copyFixed").onclick=function(){
  var prev=MONTHS[shiftKey(curKey,-1)];
  if(!prev||!prev.fixed||!prev.fixed.length){var b=$("copyFixed");var t=b.textContent;b.textContent="в прошлом месяце пусто";setTimeout(function(){b.textContent=t},1600);return}
  if(data.fixed.length&&!confirm("Добавить обязательные из прошлого месяца?"))return;
  prev.fixed.forEach(function(x){data.fixed.push({l:x.l,a:x.a,cur:x.cur,by:x.by})});
  renderCat("fixed");totals();saveMonth();
};
var NS="http://www.w3.org/2000/svg";
var PIE_PAL=["#2d63f5","#e0552e","#1a9e6f","#e0962a","#8b5cf6","#0ea5e9","#ec4899","#6b6457","#33597d","#c06b8a"];
var expDim="what";
function expenseSlices(){
  function inF(it){return filterWho==="all"||it.by===filterWho}
  if(expDim==="who"){
    var byp={};["fixed","variable"].forEach(function(c){data[c].forEach(function(it){if(!inF(it))return;var k=it.by||"none";byp[k]=(byp[k]||0)+toBase(it.a,it.cur)})});
    return Object.keys(byp).map(function(k){return{label:PEOPLE[k]?PEOPLE[k].name:"?",value:byp[k],color:PEOPLE[k]?PEOPLE[k].color:"#ccc"}});
  }
  var m={};
  data.fixed.forEach(function(it){if(!inF(it))return;var k=it.l||"Прочее";m[k]=(m[k]||0)+toBase(it.a,it.cur)});
  data.variable.forEach(function(it){if(!inF(it))return;var k=it.sub||"Прочее";m[k]=(m[k]||0)+toBase(it.a,it.cur)});
  var keys=Object.keys(m).sort(function(a,b){return m[b]-m[a]});
  return keys.map(function(k,i){return{label:k,value:m[k],color:SUBCOL[k]?SUBCOL[k][1]:PIE_PAL[i%PIE_PAL.length]}});
}
function arcPath(cx,cy,a0,a1,RO,RI){
  function pt(r,a){return[cx+r*Math.sin(a),cy-r*Math.cos(a)]}
  var o0=pt(RO,a0),o1=pt(RO,a1),i1=pt(RI,a1),i0=pt(RI,a0),lg=(a1-a0)>Math.PI?1:0;
  return "M"+o0[0]+" "+o0[1]+" A"+RO+" "+RO+" 0 "+lg+" 1 "+o1[0]+" "+o1[1]+" L"+i1[0]+" "+i1[1]+" A"+RI+" "+RI+" 0 "+lg+" 0 "+i0[0]+" "+i0[1]+" Z";
}
function renderPie(){
  var slices=expenseSlices().filter(function(s){return s.value>0});
  var total=slices.reduce(function(s,x){return s+x.value},0);
  var svg=$("pieSvg");svg.innerHTML="";var RO=82,RI=50,cx=90,cy=90;
  if(!total){var e=document.createElementNS(NS,"circle");e.setAttribute("cx",cx);e.setAttribute("cy",cy);e.setAttribute("r",(RO+RI)/2);e.setAttribute("fill","none");e.setAttribute("stroke","var(--line)");e.setAttribute("stroke-width",RO-RI);svg.appendChild(e);}
  else if(slices.length===1){var c=document.createElementNS(NS,"circle");c.setAttribute("cx",cx);c.setAttribute("cy",cy);c.setAttribute("r",(RO+RI)/2);c.setAttribute("fill","none");c.setAttribute("stroke",slices[0].color);c.setAttribute("stroke-width",RO-RI);svg.appendChild(c);}
  else{var a=0;slices.forEach(function(s){var a1=a+s.value/total*2*Math.PI;var p=document.createElementNS(NS,"path");p.setAttribute("d",arcPath(cx,cy,a,a1,RO,RI));p.setAttribute("fill",s.color);p.setAttribute("stroke","#fff");p.setAttribute("stroke-width","2");svg.appendChild(p);a=a1;});}
  var who=filterWho==="all"?"Всего":(PEOPLE[filterWho]?PEOPLE[filterWho].name:"Всего");
  $("pieTotal").innerHTML='<span class="ec-total-lab">'+who+'</span>'+fmt(total);
  $("pieCenter").innerHTML='<span class="lab">'+who+'</span>';
  var leg=$("pieLegend");leg.innerHTML="";
  slices.forEach(function(s){
    var pct=total?Math.round(s.value/total*100):0;
    var row=document.createElement("div");row.className="leg-item";
    row.innerHTML='<span class="leg-sw" style="background:'+s.color+'"></span><span class="leg-name"></span><span class="leg-val">'+fmt(s.value)+'</span><span class="leg-pct">'+pct+'%</span>';
    row.querySelector(".leg-name").textContent=s.label;leg.appendChild(row);
  });
}
document.querySelectorAll(".ectab").forEach(function(b){b.onclick=function(){expDim=b.getAttribute("data-dim");document.querySelectorAll(".ectab").forEach(function(x){x.classList.toggle("active",x===b)});renderPie()}});
function renderAll(){renderCat("income");renderCat("fixed");renderCat("variable");totals()}
function switchMonth(d){curKey=shiftKey(curKey,d);if(!MONTHS[curKey])MONTHS[curKey]={income:[],fixed:[],variable:[]};data=MONTHS[curKey];$("monthLabel").textContent=monthName(curKey);renderAll();renderMonthProgress();renderLineChart()}
$("prevM").onclick=function(){switchMonth(-1)};
$("nextM").onclick=function(){switchMonth(1)};
document.querySelectorAll(".panel").forEach(function(p){
  var cat=p.getAttribute("data-cat");
  var al=p.querySelector(".add-label"),aa=p.querySelector(".add-amount"),ab=p.querySelector(".add-btn"),asub=p.querySelector(".add-sub"),acur=p.querySelector(".add-cur");
  if(asub){fillSubSelect(asub,"Еда");asub.onchange=function(){if(asub.value==="__new"){var n=addSubcategory();fillSubSelect(asub,n||"Еда");renderCat("variable");}};}
  function add(){var l=al.value.trim(),a=+aa.value||0;if(!l&&!a)return;var rec={l:l||"Без названия",a:a,cur:acur?acur.value:base,by:"me"};if(cat==="variable")rec.sub=(asub&&asub.value!=="__new")?asub.value:"Прочее";data[cat].push(rec);al.value="";aa.value="";renderCat(cat);totals();al.focus();saveMonth();}
  ab.onclick=add;aa.addEventListener("keydown",function(e){if(e.key==="Enter")add()});
});
var FIXED_WORDS=["аренд","ипотек","кредит","связ","интернет","подписк","страхов","коммунал","свет","газ","вода","абонемент"];
var INCOME_WORDS=["зарплат","аванс","премия","фриланс","доход","перевод"];
var SUB_WORDS={"Еда":["продукт","еда","кафе","ресторан","кофе","обед","ужин","завтрак","магазин","супермаркет","пицц","бургер"],"Авто":["бензин","заправк","парковк","авто","машин","мойк","каско","осаго"],"Транспорт":["такси","метро","автобус","трамвай","транспорт","билет","поезд","самокат"],"Развлечения":["кино","бар","игр","концерт","развлеч","подарок","клуб"],"Дом":["мебель","ремонт","уборк","посуд","быт","техник"],"Здоровье":["аптек","лекарств","врач","спорт","зал","фитнес","здоров"]};
function guessCat(label){var s=label.toLowerCase();if(INCOME_WORDS.some(function(w){return s.indexOf(w)>=0}))return "income";if(FIXED_WORDS.some(function(w){return s.indexOf(w)>=0}))return "fixed";return "variable"}
function guessSub(label){var s=label.toLowerCase();var keys=Object.keys(SUB_WORDS);for(var i=0;i<keys.length;i++){if(SUB_WORDS[keys[i]].some(function(w){return s.indexOf(w)>=0}))return keys[i]}return "Прочее"}
function parseLine(text){var parts=text.split(/[,;\n]+/),out=[];parts.forEach(function(p){var m=p.match(/^\s*(.+?)\s*(\d[\d\s]*)\s*$/);if(m){var label=m[1].trim();var amount=parseInt(m[2].replace(/\s/g,""),10);if(label&&amount)out.push({l:label,a:amount})}});return out}
var CAT_RU={income:"Доходы",fixed:"Обязательные",variable:"Переменные"};
function addMsg(text,who){var d=document.createElement("div");d.className="msg "+who;d.innerHTML=text;$("chatLog").appendChild(d);$("chatLog").scrollTop=$("chatLog").scrollHeight}
function applyItems(items){
  var report=[];
  items.forEach(function(it){
    var cat=(it.cat==="income"||it.cat==="fixed"||it.cat==="variable")?it.cat:"variable";
    var rec={l:it.l||"Без названия",a:+it.a||0,cur:(it.cur==="EUR"||it.cur==="USD"||it.cur==="RSD")?it.cur:base,by:"me",_id:"x"+Math.random()};
    if(cat==="variable"){rec.sub=it.sub||"Прочее";ensureSub(rec.sub);}
    data[cat].push(rec);renderCat(cat,rec._id);
    var tail=CAT_RU[cat];if(cat==="variable")tail+=" · "+rec.sub;
    report.push(rec.l+" "+fmt(rec.a)+" → <b>"+tail+"</b>");
  });
  totals();
  return report;
}
function handleSendLocal(text){
  var items=parseLine(text);
  if(!items.length){addMsg("Не понял суммы. Попробуй: <b>продукты 2500, такси 600</b>","bot");return}
  var mapped=items.map(function(it){var cat=guessCat(it.l);return{l:it.l.charAt(0).toUpperCase()+it.l.slice(1),a:it.a,cur:base,cat:cat,sub:guessSub(it.l)}});
  var report=applyItems(mapped);
  addMsg("Добавил в "+monthName(curKey)+":<br>"+report.join("<br>"),"bot");
}
function handleSend(){
  var text=$("chatInput").value.trim();if(!text)return;
  addMsg(text.replace(/</g,"&lt;"),"me");$("chatInput").value="";
  if(!CLAUDE_FUNCTION_URL){handleSendLocal(text);return;}
  var btn=$("sendBtn");btn.disabled=true;
  var loadId="load"+Math.random();
  addMsg("…","bot");
  var loadEl=$("chatLog").lastElementChild;
  var payload=new Blob([JSON.stringify({message:text,subs:SUBS,base:base})],{type:"application/json"});
  fetch(CLAUDE_FUNCTION_URL,{method:"POST",body:payload})
  .then(function(r){return r.json()}).then(function(d){
    loadEl.remove();
    if(!d.items||!d.items.length){addMsg("Не понял. Попробуй: <b>продукты 2500, такси 600</b>","bot");return;}
    var report=applyItems(d.items);
    addMsg("Добавил в "+monthName(curKey)+":<br>"+report.join("<br>"),"bot");
  }).catch(function(){
    loadEl.remove();
    addMsg("Ошибка соединения — попробую локально.","bot");
    handleSendLocal(text);
  }).finally(function(){btn.disabled=false;});
}
$("sendBtn").onclick=handleSend;
$("chatInput").addEventListener("keydown",function(e){if(e.key==="Enter")handleSend()});
$("photoBtn").onclick=function(){$("photoInput").click()};
$("photoInput").onchange=function(e){
  var f=e.target.files[0];if(!f)return;
  e.target.value="";
  addMsg("Чек: "+f.name,"me");
  if(!CLAUDE_FUNCTION_URL){addMsg("Чат с Claude не подключён.","bot");return;}
  var btn=$("sendBtn");btn.disabled=true;
  addMsg("…","bot");
  var loadEl=$("chatLog").lastElementChild;
  // Сжимаем через canvas.toDataURL (без вложенных FileReader — надёжнее на iOS)
  var reader=new FileReader();
  reader.onload=function(ev){
    var img=new Image();
    img.onload=function(){
      var MAX=1200,w=img.width,h=img.height;
      if(w>h){if(w>MAX){h=Math.round(h*MAX/w);w=MAX;}}
      else{if(h>MAX){w=Math.round(w*MAX/h);h=MAX;}}
      var canvas=document.createElement("canvas");canvas.width=w;canvas.height=h;
      canvas.getContext("2d").drawImage(img,0,0,w,h);
      var dataUrl=canvas.toDataURL("image/jpeg",0.65);
      var b64=dataUrl.slice(dataUrl.indexOf(",")+1);
      function doFetch(){
        var payload=new Blob([JSON.stringify({image:b64,imageType:"image/jpeg",subs:SUBS,base:base})],{type:"application/json"});
        fetch(CLAUDE_FUNCTION_URL,{method:"POST",body:payload})
        .then(function(r){return r.json()}).then(function(d){
          loadEl.remove();
          if(!d.items||!d.items.length){addMsg("Не удалось разобрать чек. Попробуй написать вручную.","bot");return;}
          var report=applyItems(d.items);
          addMsg("С чека добавил в "+monthName(curKey)+":<br>"+report.join("<br>"),"bot");
        }).catch(function(err){
          loadEl.remove();
          addMsg("Ошибка: "+err.message,"bot");
        }).finally(function(){btn.disabled=false;});
      }
      // Ждём пока страница снова в фокусе после камеры (iOS убивает fetch в фоне)
      if(document.visibilityState==="visible"){doFetch();}
      else{document.addEventListener("visibilitychange",function h(){if(document.visibilityState==="visible"){document.removeEventListener("visibilitychange",h);doFetch();}});}
    };
    img.src=ev.target.result;
  };
  reader.readAsDataURL(f);
};

/* ── ПРОГРЕСС МЕСЯЦА ── */
function renderMonthProgress(){
  var p=curKey.split("-").map(Number);
  var now=new Date();var isCur=(now.getFullYear()===p[0]&&now.getMonth()+1===p[1]);
  var daysInMonth=new Date(p[0],p[1],0).getDate();var dayNow=isCur?now.getDate():daysInMonth;
  var pct=Math.round(dayNow/daysInMonth*100);
  $("mpBar").style.width=pct+"%";$("mpLabel").textContent="День "+dayNow+" из "+daysInMonth;
  var left=daysInMonth-dayNow;
  $("mpRight").textContent=isCur?(left===0?"последний день":left+" "+plurDays(left)+" до конца"):"архивный месяц";
}
function plurDays(n){var a=n%10,b=n%100;if(a===1&&b!==11)return"день";if(a>=2&&a<=4&&(b<10||b>=20))return"дня";return"дней"}

/* ── ЛИНЕЙНЫЙ ГРАФИК ── */
function renderLineChart(){
  var svg=$("lcSvg");svg.innerHTML="";
  var keys=[];var k=curKey;for(var i=0;i<6;i++){keys.unshift(k);k=shiftKey(k,-1)}
  var incArr=[],expArr=[];
  keys.forEach(function(mk){var m=MONTHS[mk];if(!m){incArr.push(0);expArr.push(0);return}incArr.push(csum(m.income));expArr.push(csum(m.fixed)+csum(m.variable))});
  var allVals=incArr.concat(expArr).filter(function(v){return v>0});
  var maxVal=allVals.length?Math.max.apply(null,allVals)*1.18:1;
  var W=800,H=130,PX=0,PY=12;var n=keys.length;
  function xOf(i){return PX+i*(W-PX*2)/(n-1)}
  function yOf(v){return PY+(1-v/maxVal)*(H-PY*2)}
  for(var gi=0;gi<4;gi++){var gy=PY+gi*(H-PY*2)/3;var gl=document.createElementNS(NS,"line");gl.setAttribute("x1",0);gl.setAttribute("x2",W);gl.setAttribute("y1",gy);gl.setAttribute("y2",gy);gl.setAttribute("stroke","#dde4f0");gl.setAttribute("stroke-width","1");svg.appendChild(gl)}
  function makeLine(arr,color){
    var apts="M"+xOf(0)+" "+H;arr.forEach(function(v,i){apts+=" L"+xOf(i)+" "+yOf(v)});apts+=" L"+xOf(arr.length-1)+" "+H+" Z";
    var area=document.createElementNS(NS,"path");area.setAttribute("d",apts);area.setAttribute("fill",color);area.setAttribute("opacity","0.07");svg.appendChild(area);
    var pts=arr.map(function(v,i){return xOf(i)+" "+yOf(v)}).join(" L ");
    var line=document.createElementNS(NS,"polyline");line.setAttribute("points",pts);line.setAttribute("fill","none");line.setAttribute("stroke",color);line.setAttribute("stroke-width","2.5");line.setAttribute("stroke-linejoin","round");line.setAttribute("stroke-linecap","round");svg.appendChild(line);
    arr.forEach(function(v,i){
      var cx=xOf(i),cy=yOf(v);
      var c=document.createElementNS(NS,"circle");c.setAttribute("cx",cx);c.setAttribute("cy",cy);c.setAttribute("r","4.5");c.setAttribute("fill","#fff");c.setAttribute("stroke",color);c.setAttribute("stroke-width","2.2");svg.appendChild(c);
      if(v>0){var t=document.createElementNS(NS,"text");t.setAttribute("x",cx);t.setAttribute("y",cy-10);t.setAttribute("text-anchor","middle");t.setAttribute("font-size","10");t.setAttribute("font-family","Manrope,sans-serif");t.setAttribute("font-weight","700");t.setAttribute("fill",color);t.textContent=v>=1000?Math.round(v/1000)+"к":Math.round(v);svg.appendChild(t)}
    });
  }
  makeLine(incArr,"#2d63f5");makeLine(expArr,"#e0552e");
  keys.forEach(function(mk,i){var p2=mk.split("-");var lbl=MN[+p2[1]-1].slice(0,3)+" "+p2[0].slice(2);var t=document.createElementNS(NS,"text");t.setAttribute("x",xOf(i));t.setAttribute("y",H+4);t.setAttribute("text-anchor","middle");t.setAttribute("font-size","10");t.setAttribute("font-family","Manrope,sans-serif");t.setAttribute("fill","#8a96b0");t.setAttribute("font-weight","600");t.textContent=lbl;svg.appendChild(t)});
  svg.setAttribute("viewBox","0 0 "+W+" "+(H+16));
}

/* ── ЦЕЛИ (dot-ring) ── */
function gfmt(n,c){return nf.format(Math.round(n))+" "+(c==="EUR"?"€":"дин.")}
var GOAL_C=2*Math.PI*54;
function gSaved(g){if(typeof g.s==="number")return g.s;return (g.s&&g.s.me||0)+(g.s&&g.s.her||0);}
function gNorm(g){if(typeof g.s==="number"){g.s={me:g.s,her:0};}}
function renderGoals(){
  var wrap=$("gList");wrap.innerHTML="";
  if(!goals.length){wrap.innerHTML='<p style="color:rgba(255,255,255,.45);font-size:14px">Активных целей нет.</p>';return}
  goals.forEach(function(g){
    gNorm(g);
    var saved=gSaved(g);
    var pct=g.t>0?Math.min(100,saved/g.t*100):0;
    var left=Math.max(0,g.t-saved);
    var done=g.t>0&&saved>=g.t;
    var meLen=g.t>0?Math.min(GOAL_C,GOAL_C*(g.s.me||0)/g.t):0;
    var herLen=g.t>0?Math.min(GOAL_C-meLen,GOAL_C*(g.s.her||0)/g.t):0;
    var meCol=PEOPLE.me.color;var herCol=PEOPLE.her.color;
    var actions=done
      ? '<button class="goal-archive-btn">В архив ✓</button>'
      : '<div class="goal-actions">'+
          '<div class="goal-who">'+
            '<button class="gwho active" data-who="me">'+PEOPLE.me.name+'</button>'+
            '<button class="gwho" data-who="her">'+PEOPLE.her.name+'</button>'+
          '</div>'+
          '<div class="goal-actions-row">'+
            '<input class="goal-add-input" type="number" placeholder="Сумма">'+
            '<button class="goal-add-btn">+</button>'+
          '</div>'+
        '</div>';
    var el=document.createElement("div");el.className="goal-card"+(done?" done":"");
    el.innerHTML='<button class="goal-del">×</button>'+
      '<div class="goal-name"></div>'+
      '<div class="dot-ring">'+
        '<svg width="130" height="130" viewBox="0 0 130 130" style="transform:rotate(-90deg)">'+
          '<circle cx="65" cy="65" r="54" class="ring-track"/>'+
          (meLen>0?'<circle cx="65" cy="65" r="54" class="ring-fill" stroke-dasharray="'+meLen+' '+GOAL_C+'" stroke-dashoffset="0" stroke="'+meCol+'"/>':'')+
          (herLen>0?'<circle cx="65" cy="65" r="54" class="ring-fill" stroke-dasharray="'+herLen+' '+GOAL_C+'" stroke-dashoffset="'+(-meLen)+'" stroke="'+herCol+'"/>':'')+
        '</svg>'+
        '<div class="ctr"><span class="pct">'+Math.round(pct)+'<small>%</small></span></div>'+
      '</div>'+
      '<div class="goal-stats">'+
        '<div>'+
          '<span class="lab">Накоплено</span>'+
          '<span class="val in">'+gfmt(saved,g.c)+'</span>'+
          '<div class="goal-contrib">'+
            '<span style="color:'+meCol+'">'+PEOPLE.me.name+' '+gfmt(g.s.me||0,g.c)+'</span>'+
            '<span style="color:'+herCol+'">'+PEOPLE.her.name+' '+gfmt(g.s.her||0,g.c)+'</span>'+
          '</div>'+
        '</div>'+
        '<div style="text-align:right"><span class="lab">Осталось</span><span class="val left">'+gfmt(left,g.c)+'</span></div>'+
      '</div>'+actions;
    el.querySelector(".goal-name").textContent=g.n;
    el.querySelector(".goal-del").onclick=function(){goals=goals.filter(function(x){return x!==g});renderGoals();saveGoals();};
    if(done){
      el.querySelector(".goal-archive-btn").onclick=function(){
        archived.unshift({n:g.n,s:saved,c:g.c,closed:monthName(curKey)});
        goals=goals.filter(function(x){return x!==g});
        renderGoals();renderArchive();saveGoals();
      };
    }else{
      var gi=el.querySelector(".goal-add-input");
      var activeWho="me";
      el.querySelectorAll(".gwho").forEach(function(b){
        b.onclick=function(){activeWho=b.getAttribute("data-who");el.querySelectorAll(".gwho").forEach(function(x){x.classList.toggle("active",x===b);});};
      });
      function addc(){var v=+gi.value||0;if(!v)return;g.s[activeWho]=(g.s[activeWho]||0)+v;gi.value="";renderGoals();saveGoals();}
      el.querySelector(".goal-add-btn").onclick=addc;gi.addEventListener("keydown",function(e){if(e.key==="Enter")addc();});
    }
    wrap.appendChild(el);
  });
}
function renderArchive(){
  $("arcCount").textContent=archived.length?archived.length+" закрыто":"";
  var list=$("arcList");list.innerHTML="";
  if(!archived.length){list.innerHTML='<p class="arc-empty">Пока пусто.</p>';return}
  archived.forEach(function(a){
    var el=document.createElement("div");el.className="arc-item";
    el.innerHTML='<span class="arc-check">✓</span><span class="arc-name"></span><span class="arc-sum">'+gfmt(a.s,a.c)+'</span><span class="arc-month">закрыто '+a.closed+'</span>';
    el.querySelector(".arc-name").textContent=a.n;list.appendChild(el);
  });
}
$("gAdd").onclick=function(){var n=$("gName").value.trim(),t=+$("gTarget").value||0,c=$("gCur").value;if(!n)return;goals.push({n:n,t:t,s:{me:0,her:0},c:c});$("gName").value="";$("gTarget").value="";renderGoals();saveGoals();};

/* ── ЭКСПОРТ CSV ── */
$("exportBtn").onclick=function(){
  var rows=[["Месяц","Категория","Подкатегория","Название","Сумма","Валюта","Кто","Заметка"]];
  var mn=monthName(curKey);
  ["income","fixed","variable"].forEach(function(cat){
    var catRu={income:"Доходы",fixed:"Обязательные",variable:"Переменные"}[cat];
    data[cat].forEach(function(it){rows.push([mn,catRu,it.sub||"",it.l,it.a,it.cur,PEOPLE[it.by]?PEOPLE[it.by].name:"",it.note||""])});
  });
  var csv=rows.map(function(r){return r.map(function(c){return'"'+String(c).replace(/"/g,'""')+'"'}).join(",")}).join("\n");
  var blob=new Blob(["﻿"+csv],{type:"text/csv;charset=utf-8"});
  var a2=document.createElement("a");a2.href=URL.createObjectURL(blob);a2.download="budget_"+curKey+".csv";a2.click();
};

/* ── НАВИГАЦИЯ ── */
document.querySelectorAll(".nav-pill").forEach(function(b){
  b.onclick=function(){
    document.querySelectorAll(".nav-pill").forEach(function(x){x.classList.remove("active")});
    b.classList.add("active");
    var target=b.getAttribute("data-scroll");
    if(target==="top"){window.scrollTo({top:0,behavior:"smooth"});}
    else{var el=document.getElementById(target);if(el)el.scrollIntoView({behavior:"smooth",block:"start"});}
  };
});

$("monthLabel").textContent=monthName(curKey);
renderRatesNote();fetchRates();
renderAll();renderGoals();renderArchive();
renderMonthProgress();renderLineChart();
applyWho();
addMsg("Привет! Напиши что купили — например <b>кофе 350, продукты 2400</b> — и я добавлю.","bot");

/* ── FIREBASE AUTH + FIRESTORE ── */
function fbInit(){
  var FB=window.FB;
  var _unsub,_saveTimer;

  function cleanRec(r){
    var c={l:r.l||"",a:+r.a||0,cur:r.cur||base,by:r.by||"me"};
    if(r.sub)c.sub=r.sub;
    if(r.note)c.note=r.note;
    return c;
  }

  saveMonth=function(){
    if(!window.FB)return;
    FB.setDoc(["households",FB.HID,"months",curKey],{
      income:data.income.map(cleanRec),
      fixed:data.fixed.map(cleanRec),
      variable:data.variable.map(cleanRec)
    }).catch(function(e){console.warn("saveMonth:",e.code);});
  };

  saveMonthDebounced=function(){clearTimeout(_saveTimer);_saveTimer=setTimeout(saveMonth,700);};

  saveGoals=function(){
    if(!window.FB)return;
    FB.setDoc(["households",FB.HID,"meta","goals"],{goals:goals,archived:archived})
      .catch(function(e){console.warn("saveGoals:",e.code);});
  };

  function attachSnapshot(key){
    if(_unsub)_unsub();
    _unsub=FB.onSnap(["households",FB.HID,"months",key],function(snap){
      if(!snap.exists())return;
      var d=snap.data();
      MONTHS[key]={income:d.income||[],fixed:d.fixed||[],variable:d.variable||[]};
      (MONTHS[key].variable||[]).forEach(function(it){if(it.sub)ensureSub(it.sub);});
      if(key===curKey){data=MONTHS[key];renderAll();}
    },function(err){console.warn("snapshot:",err.code);});
  }

  function loadGoals(){
    FB.getDoc(["households",FB.HID,"meta","goals"]).then(function(snap){
      if(snap.exists()){var d=snap.data();if(d.goals)goals=d.goals;if(d.archived)archived=d.archived;}
      renderGoals();renderArchive();
    });
  }

  var _origSwitch=switchMonth;
  switchMonth=function(d){_origSwitch(d);attachSnapshot(curKey);};

  attachSnapshot(curKey);
  loadGoals();
}

if(window.FB){fbInit();}
else{document.addEventListener("firebase-ready",fbInit,{once:true});}
