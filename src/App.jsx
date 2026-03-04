import React from "react";
const { useState, useEffect, useCallback, useMemo } = React;

var DIAS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];
var HRS = ["08:00","08:50","09:40","10:30","11:20","13:00","13:50","14:40","15:30","16:20","17:10"];
var NIVEIS = ["Nível 1", "Nível 2", "Nível 3"];
var VINCULOS = ["PJ fixo", "PJ hora", "CLT", "Estagiário"];

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
function getEmpty() { return { salas: [], profissionais: [], pacientes: [], ausencias: {}, prioVinculo: ["PJ fixo", "PJ hora", "CLT", "Estagiário"] }; }

var SK = "clinica-v6";
async function ldDB() { try { if (!window.storage) return null; var r = await window.storage.get(SK); return r && r.value ? JSON.parse(r.value) : null; } catch (e) { return null; } }
async function svDB(d) { try { if (!window.storage) return; await window.storage.set(SK, JSON.stringify(d)); } catch (e) {} }

/* ── Scheduling Engine ── */
function gerarAgenda(pacs, profs, salas, aus, diaFiltro, prioV) {
  var dias = diaFiltro ? [diaFiltro] : DIAS;
  var agenda = [];
  var ocupProf = {};
  var ocupSala = {};
  var vincOrder = prioV || VINCULOS;

  var sorted = pacs.slice().sort(function(a, b) {
    var na = parseInt((a.nivel || "").replace("Nível ", "") || "0");
    var nb = parseInt((b.nivel || "").replace("Nível ", "") || "0");
    return nb - na;
  });

  dias.forEach(function(dia) {
    sorted.forEach(function(pac) {
      var grade = pac.grade || {};
      var horarios = grade[dia] || [];
      if (horarios.length === 0) return;

      horarios.forEach(function(h) {
        var alocado = false;

        var prioList = (pac.prios || []).filter(Boolean);

        var ordered = prioList.slice().sort(function(a, b) {
          var pa = profs.find(function(p) { return p.id === a; });
          var pb = profs.find(function(p) { return p.id === b; });
          if (!pa || !pb) return 0;
          var va = vincOrder.indexOf(pa.tipo); if (va === -1) va = 99;
          var vb = vincOrder.indexOf(pb.tipo); if (vb === -1) vb = 99;
          if (va !== vb) return va - vb;
          return prioList.indexOf(a) - prioList.indexOf(b);
        });

        for (var oi = 0; oi < ordered.length; oi++) {
          if (alocado) break;
          var profId = ordered[oi];
          var prof = profs.find(function(p) { return p.id === profId; });
          if (!prof) continue;
          if (aus[profId + "-" + dia]) continue;
          var profDisp = (prof.disp && prof.disp[dia]) || [];
          if (profDisp.indexOf(h) === -1) continue;
          var kProf = dia + "-" + profId + "-" + h;
          if (ocupProf[kProf]) continue;

          var salaId = pac.salaId;
          var salaObj = salas.find(function(s) { return s.id === salaId; });
          var nv = parseInt((pac.nivel || "").replace("Nível ", "") || "0");

          if (nv === 3 && salaObj && salaObj.andar === "Superior") {
            var alt = salas.find(function(s) { return s.andar === "Térreo" && !ocupSala[dia + "-" + s.id + "-" + h]; });
            if (alt) { salaId = alt.id; salaObj = alt; } else { continue; }
          }

          var kSala = dia + "-" + salaId + "-" + h;
          if (salaId && ocupSala[kSala]) continue;

          ocupProf[kProf] = true;
          if (salaId) ocupSala[kSala] = true;
          var sf = salas.find(function(s) { return s.id === salaId; });
          var isSup = (pac.nome || "").toLowerCase().indexOf("suporte") >= 0;
          agenda.push({ dia: dia, h: h, pac: pac.nome, pacId: pac.id, nivel: pac.nivel || "", prof: prof.nome, sala: sf ? "Sala " + sf.numero + " (" + sf.andar + ")" : "—", andar: sf ? sf.andar : "—", prio: prioList.indexOf(profId) + 1, isSup: isSup, isExc: false });
          alocado = true;
        }

        /* Manual allocation - fallback if no priority worked */
        if (!alocado) {
          var manualProfId = pac.alocManual && pac.alocManual[dia + "-" + h];
          if (manualProfId) {
            var mprof = profs.find(function(p) { return p.id === manualProfId; });
            if (mprof && !aus[manualProfId + "-" + dia]) {
              var mkP = dia + "-" + manualProfId + "-" + h;
              if (!ocupProf[mkP]) {
                var mSalaId = pac.salaId;
                var mkS = dia + "-" + mSalaId + "-" + h;
                if (!mSalaId || !ocupSala[mkS]) {
                  ocupProf[mkP] = true;
                  if (mSalaId) ocupSala[mkS] = true;
                  var msf = salas.find(function(s) { return s.id === mSalaId; });
                  var misSup = (pac.nome || "").toLowerCase().indexOf("suporte") >= 0;
                  agenda.push({ dia: dia, h: h, pac: pac.nome, pacId: pac.id, nivel: pac.nivel || "", prof: mprof.nome, sala: msf ? "Sala " + msf.numero + " (" + msf.andar + ")" : "—", andar: msf ? msf.andar : "—", prio: 0, isSup: misSup, isExc: false, isManual: true });
                  alocado = true;
                }
              }
            }
          }
        }

        if (!alocado) {
          agenda.push({ dia: dia, h: h, pac: pac.nome, pacId: pac.id, nivel: pac.nivel || "", prof: "SEM COBERTURA", sala: "—", andar: "—", prio: 0, isSup: false, isExc: false });
        }
      });
    });
  });

  return agenda.sort(function(a, b) {
    var da = DIAS.indexOf(a.dia), db = DIAS.indexOf(b.dia);
    if (da !== db) return da - db;
    return HRS.indexOf(a.h) - HRS.indexOf(b.h);
  });
}

/* ── Colors ── */
var C = { bg:"#F7F6F3",cd:"#fff",pri:"#1a3a2a",prBg:"#dff5e6",acc:"#d35233",acBg:"#fce8e2",tx:"#1a1a1a",txM:"#6b7280",txL:"#a1a1aa",bd:"#e4e3de",ok:"#0d9668",okBg:"#d1fae5",wr:"#d97706",wrBg:"#fef3c7",er:"#dc2626",erBg:"#fee2e2",pp:"#7c3aed",ppBg:"#ede9fe",bl:"#2563eb",blBg:"#dbeafe",sup:"#0891b2",supBg:"#cffafe",exc:"#c026d3",excBg:"#fae8ff" };

/* ── Micro Components ── */
function Badge(p) {
  var m = { df:{bg:C.bd,c:C.tx},ok:{bg:C.okBg,c:C.ok},wr:{bg:C.wrBg,c:C.wr},er:{bg:C.erBg,c:C.er},pp:{bg:C.ppBg,c:C.pp},bl:{bg:C.blBg,c:C.bl},ac:{bg:C.acBg,c:C.acc},pr:{bg:C.prBg,c:C.pri},sup:{bg:C.supBg,c:C.sup},exc:{bg:C.excBg,c:C.exc} };
  var s = m[p.v || "df"] || m.df;
  return React.createElement("span", { style: { display:"inline-block",padding:"2px 10px",borderRadius:20,fontSize:11,fontWeight:700,background:s.bg,color:s.c,letterSpacing:.3,whiteSpace:"nowrap" } }, p.children);
}

function Btn(p) {
  var szs = { sm:{padding:"6px 12px",fontSize:12}, md:{padding:"8px 18px",fontSize:13} };
  var vs = { df:{background:C.bd,color:C.tx},pri:{background:C.pri,color:"#fff"},er:{background:C.erBg,color:C.er},gh:{background:"transparent",color:C.txM},ok:{background:C.ok,color:"#fff"},ac:{background:C.acc,color:"#fff"} };
  var sz = szs[p.sz||"md"]||szs.md, v = vs[p.v||"df"]||vs.df;
  return React.createElement("button", { onClick:p.disabled?undefined:p.onClick, style:Object.assign({},{display:"inline-flex",alignItems:"center",gap:6,border:"none",cursor:p.disabled?"not-allowed":"pointer",fontWeight:600,borderRadius:10,opacity:p.disabled?.5:1},sz,v,p.style||{}) }, p.children);
}

function Inp(p) {
  return React.createElement("div",{style:{display:"flex",flexDirection:"column",gap:4}},
    p.label && React.createElement("label",{style:{fontSize:11,fontWeight:600,color:C.txM,textTransform:"uppercase",letterSpacing:.5}},p.label),
    React.createElement("input",{value:p.value||"",onChange:function(e){p.onChange(e.target.value)},placeholder:p.placeholder||"",style:Object.assign({},{padding:"8px 12px",border:"1.5px solid "+C.bd,borderRadius:8,fontSize:13,outline:"none",background:C.bg},p.style||{})})
  );
}

function Sel(p) {
  var opts = p.options||[];
  return React.createElement("div",{style:{display:"flex",flexDirection:"column",gap:4}},
    p.label && React.createElement("label",{style:{fontSize:11,fontWeight:600,color:C.txM,textTransform:"uppercase",letterSpacing:.5}},p.label),
    React.createElement("select",{value:p.value||"",onChange:function(e){p.onChange(e.target.value)},style:{padding:"8px 12px",border:"1.5px solid "+C.bd,borderRadius:8,fontSize:13,outline:"none",background:C.bg,cursor:"pointer"}},
      p.placeholder && React.createElement("option",{value:""},p.placeholder),
      opts.map(function(o){return typeof o==="string"?React.createElement("option",{key:o,value:o},o):React.createElement("option",{key:o.value,value:o.value},o.label)})
    )
  );
}

function Crd(p) { return React.createElement("div",{onClick:p.onClick,style:Object.assign({},{background:C.cd,borderRadius:14,border:"1px solid "+C.bd,padding:20,boxShadow:"0 1px 3px rgba(0,0,0,.04)"},p.style||{})},p.children); }

function Mdl(p) {
  if(!p.open) return null;
  return React.createElement("div",{onClick:p.onClose,style:{position:"fixed",top:0,left:0,right:0,bottom:0,zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,.4)"}},
    React.createElement("div",{onClick:function(e){e.stopPropagation()},style:{background:C.cd,borderRadius:18,padding:28,width:p.wide?"94%":"540px",maxWidth:p.wide?1100:540,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,.15)"}},
      React.createElement("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}},
        React.createElement("h3",{style:{margin:0,fontSize:18,fontWeight:700}},p.title),
        React.createElement(Btn,{v:"gh",sz:"sm",onClick:p.onClose},"✕")
      ),
      p.children
    )
  );
}

/* Day-Hour Grid for professional availability */
function DayGrid(p) {
  var val = p.value||{}, color = p.color||C.pri;
  function tog(d,h){var c=Object.assign({},val);if(!c[d])c[d]=[];if(c[d].indexOf(h)>=0)c[d]=c[d].filter(function(x){return x!==h});else c[d]=c[d].concat(h).sort(function(a,b){return HRS.indexOf(a)-HRS.indexOf(b)});p.onChange(c)}
  function togAll(d){var c=Object.assign({},val);c[d]=(c[d]||[]).length===HRS.length?[]:HRS.slice();p.onChange(c)}
  return React.createElement("div",{style:{overflowX:"auto"}},
    React.createElement("table",{style:{width:"100%",borderCollapse:"collapse",fontSize:11}},
      React.createElement("thead",null,React.createElement("tr",null,
        React.createElement("th",null,""),
        DIAS.map(function(d){return React.createElement("th",{key:d,onClick:function(){togAll(d)},style:{padding:"4px 2px",textAlign:"center",color:C.txL,fontWeight:600,cursor:"pointer",fontSize:10}},d.slice(0,3))})
      )),
      React.createElement("tbody",null,HRS.map(function(h){
        return React.createElement("tr",{key:h},
          React.createElement("td",{style:{padding:"2px 6px",color:C.txM,fontFamily:"monospace",fontSize:10}},h),
          DIAS.map(function(d){var a=(val[d]||[]).indexOf(h)>=0;return React.createElement("td",{key:d,style:{padding:2,textAlign:"center"}},
            React.createElement("div",{onClick:function(){tog(d,h)},style:{width:26,height:26,borderRadius:6,display:"inline-flex",alignItems:"center",justifyContent:"center",cursor:"pointer",background:a?color:"#eeedea",color:a?"#fff":C.txL,fontWeight:700,fontSize:9,border:a?"none":"1px solid "+C.bd}},a?"✓":"")
          )})
        )
      }))
    )
  );
}

/* Patient Schedule Grid - day x hour */
function PatientGrade(p) {
  var val = p.value || {};
  function tog(d, h) {
    var c = Object.assign({}, val);
    if (!c[d]) c[d] = [];
    if (c[d].indexOf(h) >= 0) c[d] = c[d].filter(function(x) { return x !== h; });
    else c[d] = c[d].concat(h).sort(function(a,b){return HRS.indexOf(a)-HRS.indexOf(b)});
    p.onChange(c);
  }
  function togAll(d) {
    var c = Object.assign({}, val);
    c[d] = (c[d] || []).length === HRS.length ? [] : HRS.slice();
    p.onChange(c);
  }
  var totalSlots = Object.values(val).reduce(function(a,b){return a+b.length},0);

  return React.createElement("div", null,
    React.createElement("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}},
      React.createElement("label",{style:{fontSize:11,fontWeight:600,color:C.txM,textTransform:"uppercase",letterSpacing:.5}},"Grade Dia × Horário"),
      React.createElement(Badge,{v:totalSlots>0?"pr":"df"},totalSlots+" atendimento(s)/sem")
    ),
    React.createElement("div",{style:{overflowX:"auto"}},
      React.createElement("table",{style:{width:"100%",borderCollapse:"collapse",fontSize:11}},
        React.createElement("thead",null,React.createElement("tr",null,
          React.createElement("th",{style:{padding:"4px 6px",textAlign:"left",fontSize:10,color:C.txL}},""),
          DIAS.map(function(d){return React.createElement("th",{key:d,onClick:function(){togAll(d)},style:{padding:"4px 2px",textAlign:"center",color:C.txL,fontWeight:600,cursor:"pointer",fontSize:10}},d.slice(0,3))})
        )),
        React.createElement("tbody",null,HRS.map(function(h){
          return React.createElement("tr",{key:h},
            React.createElement("td",{style:{padding:"2px 6px",color:C.txM,fontFamily:"monospace",fontSize:10}},h),
            DIAS.map(function(d){
              var a=(val[d]||[]).indexOf(h)>=0;
              return React.createElement("td",{key:d,style:{padding:2,textAlign:"center"}},
                React.createElement("div",{onClick:function(){tog(d,h)},style:{width:26,height:26,borderRadius:6,display:"inline-flex",alignItems:"center",justifyContent:"center",cursor:"pointer",background:a?C.pri:"#eeedea",color:a?"#fff":C.txL,fontWeight:700,fontSize:9,border:a?"none":"1px solid "+C.bd}},a?"✓":"")
              )
            })
          )
        }))
      )
    )
  );
}

function ReorderList(p) {
  var items = p.items||[];
  function mv(i,dir){var a=items.slice();var j=i+dir;if(j<0||j>=a.length)return;var t=a[i];a[i]=a[j];a[j]=t;p.onChange(a)}
  return React.createElement("div",{style:{display:"flex",flexDirection:"column",gap:6}},
    items.map(function(it,i){return React.createElement("div",{key:it,style:{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",background:C.bg,borderRadius:8,border:"1px solid "+C.bd}},
      React.createElement("span",{style:{fontSize:13,fontWeight:800,color:C.pri,width:20}},(i+1)+"ª"),
      React.createElement("span",{style:{flex:1,fontSize:13,fontWeight:600}},it),
      React.createElement(Btn,{v:"gh",sz:"sm",onClick:function(){mv(i,-1)},disabled:i===0},"▲"),
      React.createElement(Btn,{v:"gh",sz:"sm",onClick:function(){mv(i,1)},disabled:i===items.length-1},"▼")
    )})
  );
}

var NAV = [
  {id:"dashboard",icon:"📊",lb:"Dashboard"},{id:"agenda",icon:"📅",lb:"Agenda"},
  {id:"pacientes",icon:"👶",lb:"Pacientes"},{id:"profissionais",icon:"👩‍⚕️",lb:"Profissionais"},
  {id:"salas",icon:"🏠",lb:"Salas"},{id:"ausencias",icon:"🚫",lb:"Faltas"},
  {id:"config",icon:"⚙️",lb:"Configurações"}
];

/* ══════════════════════════════ MAIN APP ══════════════════════════════ */
function App() {
  var s = function(init) { return useState(init); };
  var sd = s(getEmpty), data = sd[0], setData = sd[1];
  var sl = s(true), loading = sl[0], setLoading = sl[1];
  var st = s("dashboard"), tab = st[0], setTab = st[1];
  var sf = s(null), diaF = sf[0], setDiaF = sf[1];
  var sm = s(null), modal = sm[0], setModal = sm[1];
  var se = s(null), edit = se[0], setEdit = se[1];
  var ss = s(""), search = ss[0], setSearch = ss[1];
  var sr = s(null), resolver = sr[0], setResolver = sr[1];
  var sfProf = s(""), filtProf = sfProf[0], setFiltProf = sfProf[1];
  var sfPac = s(""), filtPac = sfPac[0], setFiltPac = sfPac[1];
  /* resolver = {dia, h, pacId, pacNome} */

  useEffect(function() { ldDB().then(function(d) { if(d) setData(Object.assign({},getEmpty(),d)); setLoading(false); }); }, []);
  var persist = useCallback(function(nd) { setData(nd); svDB(nd); }, []);

  var agenda = useMemo(function() { return gerarAgenda(data.pacientes,data.profissionais,data.salas,data.ausencias||{},diaF,data.prioVinculo); }, [data,diaF]);
  var conflitos = agenda.filter(function(a){return a.prof==="SEM COBERTURA"});
  var totalOk = agenda.filter(function(a){return a.prof!=="SEM COBERTURA"}).length;
  var ausN = Object.values(data.ausencias||{}).filter(Boolean).length;

  function savePac(p){var ex=data.pacientes.find(function(x){return x.id===p.id});var np=ex?data.pacientes.map(function(x){return x.id===p.id?p:x}):data.pacientes.concat(Object.assign({},p,{id:uid()}));persist(Object.assign({},data,{pacientes:np}));setModal(null);setEdit(null)}
  function delPac(id){persist(Object.assign({},data,{pacientes:data.pacientes.filter(function(x){return x.id!==id})}))}
  function saveProf(p){var ex=data.profissionais.find(function(x){return x.id===p.id});var np=ex?data.profissionais.map(function(x){return x.id===p.id?p:x}):data.profissionais.concat(Object.assign({},p,{id:uid()}));persist(Object.assign({},data,{profissionais:np}));setModal(null);setEdit(null)}
  function delProf(id){persist(Object.assign({},data,{profissionais:data.profissionais.filter(function(x){return x.id!==id})}))}
  function saveSala(sv){var ex=data.salas.find(function(x){return x.id===sv.id});var ns=ex?data.salas.map(function(x){return x.id===sv.id?sv:x}):data.salas.concat(Object.assign({},sv,{id:uid()}));persist(Object.assign({},data,{salas:ns}));setModal(null);setEdit(null)}
  function delSala(id){persist(Object.assign({},data,{salas:data.salas.filter(function(x){return x.id!==id})}))}
  function togAus(pid,dia){var a=Object.assign({},data.ausencias||{});a[pid+"-"+dia]=!a[pid+"-"+dia];persist(Object.assign({},data,{ausencias:a}))}
  function clrAus(){persist(Object.assign({},data,{ausencias:{}}))}
  function closeM(){setModal(null);setEdit(null)}

  function getProfsDisponiveis(dia, hora) {
    var aus = data.ausencias || {};
    var ocupados = {};
    agenda.forEach(function(a) {
      if (a.dia === dia && a.h === hora && a.prio > 0) {
        var prof = data.profissionais.find(function(p) { return p.nome === a.prof; });
        if (prof) ocupados[prof.id] = true;
      }
    });
    return data.profissionais.filter(function(prof) {
      if (aus[prof.id + "-" + dia]) return false;
      var disp = (prof.disp && prof.disp[dia]) || [];
      if (disp.indexOf(hora) === -1) return false;
      if (ocupados[prof.id]) return false;
      return true;
    });
  }

  function alocarManual(pacId, dia, hora, profId) {
    var pac = data.pacientes.find(function(p) { return p.id === pacId; });
    if (!pac) return;
    var newPac = Object.assign({}, pac);
    if (!newPac.alocManual) newPac.alocManual = {};
    newPac.alocManual[dia + "-" + hora] = profId;
    var np = data.pacientes.map(function(p) { return p.id === pacId ? newPac : p; });
    persist(Object.assign({}, data, { pacientes: np }));
    setResolver(null);
  }

  function exportCSV(){
    var hdr=["Dia","Horário","Paciente","Nível","Status","Profissional","Sala","Andar","Prioridade"];
    var rows=agenda.map(function(a){return[a.dia,a.h,a.pac,a.nivel,a.isSup?"SUP.OP.":a.isManual?"MANUAL":"AT",a.prof,a.sala,a.andar,a.isManual?"Man.":(a.prio||"N/A")]});
    var csv=[hdr].concat(rows).map(function(r){return r.map(function(c){return'"'+c+'"'}).join(",")}).join("\n");
    var b=new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8;"});var u=URL.createObjectURL(b);var a=document.createElement("a");a.href=u;a.download="agenda.csv";a.click();
  }

  if(loading) return React.createElement("div",{style:{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",color:C.txM}},"Carregando...");

  /* ── Sidebar ── */
  var sidebar = React.createElement("div",{style:{width:210,background:C.pri,padding:"24px 0",display:"flex",flexDirection:"column",flexShrink:0,position:"sticky",top:0,height:"100vh"}},
    React.createElement("div",{style:{padding:"0 18px",marginBottom:32}},
      React.createElement("div",{style:{fontSize:20,fontWeight:800,color:"#fff"}},"📋 Agenda"),
      React.createElement("div",{style:{fontSize:10,color:"rgba(255,255,255,.4)",marginTop:2}},"Calculadora Clínica")
    ),
    React.createElement("nav",{style:{flex:1}},
      NAV.map(function(n){
        var cnt=null;
        if(n.id==="pacientes"&&data.pacientes.length>0)cnt=data.pacientes.length;
        if(n.id==="profissionais"&&data.profissionais.length>0)cnt=data.profissionais.length;
        if(n.id==="salas"&&data.salas.length>0)cnt=data.salas.length;
        return React.createElement("div",{key:n.id,onClick:function(){setTab(n.id);setSearch("")},style:{display:"flex",alignItems:"center",gap:10,padding:"10px 18px",cursor:"pointer",background:tab===n.id?"rgba(255,255,255,.12)":"transparent",color:tab===n.id?"#fff":"rgba(255,255,255,.5)",borderRight:tab===n.id?"3px solid "+C.acc:"3px solid transparent",fontSize:13,fontWeight:tab===n.id?700:500}},
          React.createElement("span",{style:{fontSize:15}},n.icon), n.lb,
          cnt&&React.createElement("span",{style:{marginLeft:"auto",fontSize:10,background:"rgba(255,255,255,.15)",padding:"1px 7px",borderRadius:10}},cnt),
          n.id==="ausencias"&&ausN>0&&React.createElement("span",{style:{marginLeft:"auto",fontSize:10,background:"rgba(255,80,80,.6)",padding:"1px 7px",borderRadius:10,color:"#fff"}},ausN)
        )
      })
    )
  );

  /* ── Dashboard ── */
  function rDash(){
    var stats=[{l:"Pacientes",v:data.pacientes.length,i:"👶",c:C.pri,b:C.prBg},{l:"Profissionais",v:data.profissionais.length,i:"👩‍⚕️",c:C.pp,b:C.ppBg},{l:"Atendimentos",v:totalOk,i:"✅",c:C.ok,b:C.okBg},{l:"Sem cobertura",v:conflitos.length,i:"⚠️",c:C.er,b:C.erBg}];
    return React.createElement("div",null,
      React.createElement("h2",{style:{fontSize:24,fontWeight:800,marginBottom:4}},"Dashboard"),
      React.createElement("p",{style:{color:C.txM,fontSize:13,marginBottom:24}},"Visão geral da semana"),
      React.createElement("div",{style:{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:24}},
        stats.map(function(x,i){return React.createElement(Crd,{key:i,style:{display:"flex",alignItems:"center",gap:12}},
          React.createElement("div",{style:{width:42,height:42,borderRadius:12,background:x.b,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}},x.i),
          React.createElement("div",null,React.createElement("div",{style:{fontSize:22,fontWeight:800,color:x.c}},x.v),React.createElement("div",{style:{fontSize:11,color:C.txM,fontWeight:600}},x.l))
        )})
      ),
      data.pacientes.length===0&&data.profissionais.length===0&&React.createElement(Crd,{style:{textAlign:"center",padding:40,border:"2px dashed "+C.bd}},
        React.createElement("div",{style:{fontSize:48,marginBottom:12}},"🚀"),
        React.createElement("h3",{style:{margin:"0 0 8px",fontWeight:700}},"Comece cadastrando!"),
        React.createElement("p",{style:{color:C.txM,fontSize:13,marginBottom:16}},"Salas → Profissionais → Pacientes"),
        React.createElement("div",{style:{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}},
          React.createElement(Btn,{v:"df",onClick:function(){setTab("salas")}},"🏠 Salas"),
          React.createElement(Btn,{v:"pri",onClick:function(){setTab("profissionais")}},"👩‍⚕️ Profissionais"),
          React.createElement(Btn,{v:"ac",onClick:function(){setTab("pacientes")}},"👶 Pacientes")
        )
      ),
      conflitos.length>0&&React.createElement(Crd,{style:{marginTop:16,borderLeft:"4px solid "+C.er}},
        React.createElement("h4",{style:{margin:"0 0 8px",fontSize:14,fontWeight:700,color:C.er}},"⚠️ Sem cobertura"),
        React.createElement("div",{style:{display:"flex",flexWrap:"wrap",gap:6}},conflitos.slice(0,12).map(function(c,i){return React.createElement(Badge,{key:i,v:"er"},c.dia+" "+c.h+" — "+c.pac)}))
      )
    );
  }

  /* ── Agenda ── */
  function rAgenda(){
    var hdrs=["Horário","Paciente","Nível","Status","Profissional","Sala","Andar","Prio."];
    return React.createElement("div",null,
      React.createElement("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}},
        React.createElement("div",null,
          React.createElement("h2",{style:{fontSize:24,fontWeight:800,margin:0}},"Agenda Gerada"),
          React.createElement("p",{style:{color:C.txM,fontSize:12,margin:"4px 0 0"}},
            React.createElement(Badge,{v:"pr"},"AT"), " Atendimento  ",
            React.createElement(Badge,{v:"sup"},"SUP"), " Suporte  ",
            React.createElement(Badge,{v:"wr"},"MAN"), " Manual"
          )
        ),
        React.createElement(Btn,{v:"ok",onClick:exportCSV},"⬇ CSV")
      ),
      React.createElement("div",{style:{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}},
        React.createElement(Btn,{v:!diaF?"pri":"df",sz:"sm",onClick:function(){setDiaF(null)}},"Semana"),
        DIAS.map(function(d){return React.createElement(Btn,{key:d,v:diaF===d?"pri":"df",sz:"sm",onClick:function(){setDiaF(d)}},d)})
      ),
      React.createElement("div",{style:{display:"flex",gap:12,marginBottom:20,flexWrap:"wrap"}},
        React.createElement(Sel,{label:"Filtrar Profissional",value:filtProf,onChange:setFiltProf,options:data.profissionais.map(function(p){return{value:p.nome,label:p.nome}}),placeholder:"Todos"}),
        React.createElement(Sel,{label:"Filtrar Paciente",value:filtPac,onChange:setFiltPac,options:data.pacientes.map(function(p){return{value:p.nome,label:p.nome}}),placeholder:"Todos"}),
        (filtProf||filtPac)&&React.createElement("div",{style:{display:"flex",alignItems:"flex-end"}},
          React.createElement(Btn,{v:"gh",sz:"sm",onClick:function(){setFiltProf("");setFiltPac("")}},"✕ Limpar filtros")
        )
      ),
      data.pacientes.length===0?React.createElement(Crd,{style:{textAlign:"center",padding:40}},React.createElement("p",{style:{color:C.txM}},"Cadastre dados primeiro"))
      :DIAS.filter(function(d){return!diaF||d===diaF}).map(function(dia){
        var its=agenda.filter(function(a){
          if(a.dia!==dia) return false;
          if(filtProf && a.prof!==filtProf) return false;
          if(filtPac && a.pac!==filtPac) return false;
          return true;
        });
        if(!its.length)return null;
        return React.createElement("div",{key:dia,style:{marginBottom:24}},
          React.createElement("div",{style:{display:"flex",alignItems:"center",gap:10,marginBottom:10}},
            React.createElement("h3",{style:{margin:0,fontSize:16,fontWeight:700}},dia),
            React.createElement(Badge,{v:"pr"},its.length)
          ),
          React.createElement(Crd,{style:{padding:0,overflow:"hidden"}},
            React.createElement("table",{style:{width:"100%",borderCollapse:"collapse",fontSize:12}},
              React.createElement("thead",null,React.createElement("tr",{style:{borderBottom:"2px solid "+C.bd}},
                hdrs.map(function(h){return React.createElement("th",{key:h,style:{padding:"10px 12px",textAlign:"left",fontSize:10,fontWeight:700,color:C.txL,textTransform:"uppercase"}},h)})
              )),
              React.createElement("tbody",null,its.map(function(it,i){
                var bg=it.prof==="SEM COBERTURA"?C.erBg:it.isSup?"#e8fafa":it.isManual?"#fef9ee":i%2===0?"#fff":C.bg;
                var statusV=it.isSup?"sup":it.isManual?"wr":"pr";
                var statusTxt=it.isSup?"SUP.OP.":it.isManual?"MANUAL":"AT";
                return React.createElement("tr",{key:i,style:{borderBottom:"1px solid "+C.bd,background:bg}},
                  React.createElement("td",{style:{padding:"9px 12px",fontFamily:"monospace",fontWeight:600,fontSize:11}},it.h),
                  React.createElement("td",{style:{padding:"9px 12px",fontWeight:600,color:it.isSup?C.sup:C.tx}},it.pac),
                  React.createElement("td",{style:{padding:"9px 12px"}},it.nivel?React.createElement(Badge,{v:it.nivel==="Nível 3"?"er":it.nivel==="Nível 2"?"wr":"ok"},it.nivel):React.createElement("span",{style:{color:C.txL}},"—")),
                  React.createElement("td",{style:{padding:"9px 12px"}},React.createElement(Badge,{v:statusV},statusTxt)),
                  React.createElement("td",{style:{padding:"9px 12px",fontWeight:it.prof==="SEM COBERTURA"?700:500,color:it.prof==="SEM COBERTURA"?C.er:C.tx}},
                    it.prof==="SEM COBERTURA"
                      ? React.createElement("div",{style:{display:"flex",alignItems:"center",gap:8}},
                          React.createElement("span",null,"⚠️ SEM COBERTURA"),
                          React.createElement(Btn,{v:"ac",sz:"sm",onClick:function(){setResolver({dia:it.dia,h:it.h,pacId:it.pacId,pacNome:it.pac})}},"🔍 Resolver")
                        )
                      : it.prof
                  ),
                  React.createElement("td",{style:{padding:"9px 12px",color:C.txM,fontSize:11}},it.sala),
                  React.createElement("td",{style:{padding:"9px 12px"}},it.andar!=="—"?React.createElement(Badge,{v:it.andar==="Térreo"?"pr":"ac"},it.andar):React.createElement("span",{style:{color:C.txL}},"—")),
                  React.createElement("td",{style:{padding:"9px 12px"}},it.isManual?React.createElement("span",{style:{display:"inline-flex",alignItems:"center",justifyContent:"center",width:30,height:26,borderRadius:8,fontSize:9,fontWeight:800,background:C.wrBg,color:C.wr}},"MAN"):it.prio>0?React.createElement("span",{style:{display:"inline-flex",alignItems:"center",justifyContent:"center",width:26,height:26,borderRadius:8,fontSize:11,fontWeight:800,background:it.prio===1?C.okBg:it.prio===2?C.wrBg:C.erBg,color:it.prio===1?C.ok:it.prio===2?C.wr:C.er}},it.prio+"ª"):React.createElement("span",{style:{color:C.er,fontWeight:700}},"—"))
                )
              }))
            )
          )
        )
      })
    );
  }

  /* ── Pacientes ── */
  function rPacs(){
    var fil=data.pacientes.filter(function(p){return!search||p.nome.toLowerCase().indexOf(search.toLowerCase())>=0});
    return React.createElement("div",null,
      React.createElement("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}},
        React.createElement("div",null,React.createElement("h2",{style:{fontSize:24,fontWeight:800,margin:0}},"Pacientes"),React.createElement("p",{style:{color:C.txM,fontSize:13,margin:"4px 0 0"}},data.pacientes.length+" cadastrado(s)")),
        React.createElement("div",{style:{display:"flex",gap:8}},
          React.createElement(Btn,{v:"df",onClick:function(){setEdit({nome:"Suporte Operacional",nivel:"",salaId:"",grade:{},prios:["","",""],excepcionais:[],obs:""});setModal("pac")}},"+ Suporte Op."),
          React.createElement(Btn,{v:"pri",onClick:function(){setEdit({nome:"",nivel:"Nível 1",salaId:"",grade:{},prios:["","",""],excepcionais:[],obs:""});setModal("pac")}},"+ Paciente")
        )
      ),
      data.pacientes.length>3&&React.createElement(Inp,{placeholder:"Buscar...",value:search,onChange:setSearch,style:{marginBottom:16,width:"100%"}}),
      data.pacientes.length===0?React.createElement(Crd,{style:{textAlign:"center",padding:40,border:"2px dashed "+C.bd}},React.createElement("p",{style:{color:C.txM,fontWeight:600}},"Nenhum paciente"))
      :React.createElement("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:14}},
        fil.map(function(pac){
          var pn=(pac.prios||[]).map(function(pid){var p=data.profissionais.find(function(x){return x.id===pid});return p?p.nome:"—"});
          var isSup=(pac.nome||"").toLowerCase().indexOf("suporte")>=0;
          var sObj=data.salas.find(function(s){return s.id===pac.salaId});
          var totalSlots=Object.values(pac.grade||{}).reduce(function(a,b){return a+b.length},0);
          var diasStr=Object.keys(pac.grade||{}).filter(function(d){return(pac.grade[d]||[]).length>0}).map(function(d){return d.slice(0,3)+": "+(pac.grade[d]||[]).join(", ")}).join(" | ")||"—";

          return React.createElement(Crd,{key:pac.id,style:{cursor:"pointer",borderLeft:isSup?"4px solid "+C.sup:"none"},onClick:function(){setEdit(Object.assign({},pac,{prios:(pac.prios||["","",""]).slice(),excepcionais:(pac.excepcionais||[]).slice(),grade:JSON.parse(JSON.stringify(pac.grade||{}))}));setModal("pac")}},
            React.createElement("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}},
              React.createElement("div",null,
                React.createElement("div",{style:{fontSize:15,fontWeight:700,color:isSup?C.sup:C.tx}},pac.nome),
                React.createElement("div",{style:{display:"flex",gap:6,marginTop:4,flexWrap:"wrap"}},
                  isSup?React.createElement(Badge,{v:"sup"},"Suporte"):pac.nivel&&React.createElement(Badge,{v:pac.nivel==="Nível 3"?"er":pac.nivel==="Nível 2"?"wr":"ok"},pac.nivel),
                  sObj&&React.createElement(Badge,null,"Sala "+sObj.numero),
                  React.createElement(Badge,{v:"df"},totalSlots+" atend/sem")
                )
              ),
              React.createElement(Btn,{v:"er",sz:"sm",onClick:function(e){e.stopPropagation();delPac(pac.id)}},"🗑")
            ),
            React.createElement("div",{style:{fontSize:10,color:C.txM,lineHeight:1.7}},
              React.createElement("div",null,diasStr),
              React.createElement("div",null,React.createElement("b",null,"1ª ")," ",pn[0]," · ",React.createElement("b",null,"2ª ")," ",pn[1]," · ",React.createElement("b",null,"3ª ")," ",pn[2])
            )
          )
        })
      )
    );
  }

  /* ── Profissionais ── */
  function rProfs(){
    var fil=data.profissionais.filter(function(p){return!search||p.nome.toLowerCase().indexOf(search.toLowerCase())>=0});
    return React.createElement("div",null,
      React.createElement("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}},
        React.createElement("div",null,React.createElement("h2",{style:{fontSize:24,fontWeight:800,margin:0}},"Profissionais"),React.createElement("p",{style:{color:C.txM,fontSize:13,margin:"4px 0 0"}},data.profissionais.length+" cadastrado(s)")),
        React.createElement(Btn,{v:"pri",onClick:function(){setEdit({nome:"",tipo:"CLT",disp:{},obs:""});setModal("prof")}},"+ Novo")
      ),
      data.profissionais.length>3&&React.createElement(Inp,{placeholder:"Buscar...",value:search,onChange:setSearch,style:{marginBottom:16,width:"100%"}}),
      data.profissionais.length===0?React.createElement(Crd,{style:{textAlign:"center",padding:40,border:"2px dashed "+C.bd}},React.createElement("p",{style:{color:C.txM}},"Nenhum profissional"))
      :React.createElement("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:14}},
        fil.map(function(prof){
          var tot=Object.values(prof.disp||{}).reduce(function(a,b){return a+b.length},0);
          var vv=prof.tipo==="PJ fixo"?"pp":prof.tipo==="PJ hora"?"bl":prof.tipo==="Estagiário"?"wr":"df";
          return React.createElement(Crd,{key:prof.id,style:{cursor:"pointer"},onClick:function(){setEdit(Object.assign({},prof,{disp:JSON.parse(JSON.stringify(prof.disp||{}))}));setModal("prof")}},
            React.createElement("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}},
              React.createElement("div",null,
                React.createElement("div",{style:{fontSize:15,fontWeight:700}},prof.nome),
                React.createElement("div",{style:{display:"flex",gap:6,marginTop:4}},React.createElement(Badge,{v:vv},prof.tipo),React.createElement(Badge,null,tot+" slots/sem"))
              ),
              React.createElement(Btn,{v:"er",sz:"sm",onClick:function(e){e.stopPropagation();delProf(prof.id)}},"🗑")
            ),
            React.createElement("div",{style:{fontSize:11,color:C.txM}},DIAS.map(function(d){var h=(prof.disp&&prof.disp[d]||[]).length;return h?d.slice(0,3)+": "+h+"h":null}).filter(Boolean).join(" · ")||"Sem disponibilidade")
          )
        })
      )
    );
  }

  /* ── Salas ── */
  function rSalas(){
    return React.createElement("div",null,
      React.createElement("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}},
        React.createElement("div",null,React.createElement("h2",{style:{fontSize:24,fontWeight:800,margin:0}},"Salas"),React.createElement("p",{style:{color:C.txM,fontSize:13,margin:"4px 0 0"}},data.salas.length+" sala(s)")),
        React.createElement(Btn,{v:"pri",onClick:function(){setEdit({numero:"",andar:"Térreo"});setModal("sala")}},"+ Nova Sala")
      ),
      data.salas.length===0?React.createElement(Crd,{style:{textAlign:"center",padding:40,border:"2px dashed "+C.bd}},React.createElement("p",{style:{color:C.txM}},"Nenhuma sala"))
      :React.createElement("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:14}},
        data.salas.map(function(s){return React.createElement(Crd,{key:s.id,style:{cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"},onClick:function(){setEdit(Object.assign({},s));setModal("sala")}},
          React.createElement("div",null,React.createElement("div",{style:{fontSize:16,fontWeight:700,marginBottom:4}},"Sala "+s.numero),React.createElement(Badge,{v:s.andar==="Térreo"?"pr":"ac"},s.andar),s.descricao?React.createElement("div",{style:{fontSize:11,color:C.txM,marginTop:4}},s.descricao):null),
          React.createElement(Btn,{v:"er",sz:"sm",onClick:function(e){e.stopPropagation();delSala(s.id)}},"🗑")
        )})
      )
    );
  }

  /* ── Ausências ── */
  function rAus(){
    return React.createElement("div",null,
      React.createElement("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}},
        React.createElement("div",null,React.createElement("h2",{style:{fontSize:24,fontWeight:800,margin:0}},"Faltas"),React.createElement("p",{style:{color:C.txM,fontSize:13,margin:"4px 0 0"}},"Marque quem faltou — agenda recalcula sem mexer nos demais")),
        ausN>0&&React.createElement(Btn,{v:"er",sz:"sm",onClick:clrAus},"Limpar faltas ("+ausN+")"),
        function(){
          var manCount = data.pacientes.reduce(function(t,p){return t+Object.keys(p.alocManual||{}).length},0);
          if(manCount>0) return React.createElement(Btn,{v:"ac",sz:"sm",onClick:function(){
            var np=data.pacientes.map(function(p){var c=Object.assign({},p);delete c.alocManual;return c});
            persist(Object.assign({},data,{pacientes:np}));
          },style:{marginLeft:8}},"Limpar manuais ("+manCount+")");
          return null;
        }()
      ),
      data.profissionais.length===0?React.createElement(Crd,{style:{textAlign:"center",padding:40}},React.createElement("p",{style:{color:C.txM}},"Cadastre profissionais"))
      :React.createElement(Crd,{style:{padding:0,overflow:"hidden"}},
        React.createElement("table",{style:{width:"100%",borderCollapse:"collapse",fontSize:13}},
          React.createElement("thead",null,React.createElement("tr",{style:{borderBottom:"2px solid "+C.bd}},
            React.createElement("th",{style:{padding:"12px 16px",textAlign:"left",fontSize:10,fontWeight:700,color:C.txL,textTransform:"uppercase"}},"Profissional"),
            DIAS.map(function(d){return React.createElement("th",{key:d,style:{padding:"12px 8px",textAlign:"center",fontSize:10,fontWeight:700,color:C.txL,textTransform:"uppercase"}},d.slice(0,3))})
          )),
          React.createElement("tbody",null,data.profissionais.map(function(prof){
            return React.createElement("tr",{key:prof.id,style:{borderBottom:"1px solid "+C.bd}},
              React.createElement("td",{style:{padding:"10px 16px",fontWeight:600}},prof.nome),
              DIAS.map(function(d){var a=(data.ausencias||{})[prof.id+"-"+d];return React.createElement("td",{key:d,style:{padding:8,textAlign:"center"}},
                React.createElement("div",{onClick:function(){togAus(prof.id,d)},style:{width:36,height:36,borderRadius:10,display:"inline-flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontWeight:700,fontSize:14,background:a?C.er:"#eeedea",color:a?"#fff":C.txL,border:a?"none":"1.5px solid "+C.bd}},a?"✗":"✓")
              )})
            )
          }))
        )
      )
    );
  }

  /* ── Config ── */
  function rConf(){
    return React.createElement("div",null,
      React.createElement("h2",{style:{fontSize:24,fontWeight:800,marginBottom:4}},"Configurações"),
      React.createElement(Crd,{style:{marginBottom:20}},
        React.createElement("h4",{style:{margin:"0 0 8px",fontWeight:700}},"Prioridade por Vínculo"),
        React.createElement("p",{style:{color:C.txM,fontSize:12,marginBottom:14}},"Primeiro tipo é alocado antes."),
        React.createElement(ReorderList,{items:data.prioVinculo||VINCULOS,onChange:function(v){persist(Object.assign({},data,{prioVinculo:v}))}})
      ),
      React.createElement(Crd,{style:{borderLeft:"4px solid "+C.er}},
        React.createElement("h4",{style:{margin:"0 0 8px",fontWeight:700,color:C.er}},"Zona de Perigo"),
        React.createElement(Btn,{v:"er",onClick:function(){persist(getEmpty())}},"🔄 Resetar")
      )
    );
  }

  /* ── Modals ── */
  function rModals(){
    return React.createElement(React.Fragment,null,
      /* Paciente */
      React.createElement(Mdl,{open:modal==="pac",onClose:closeM,title:edit&&edit.id?"Editar Paciente":"Novo Paciente",wide:true},
        edit&&React.createElement("div",null,
          React.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,marginBottom:18}},
            React.createElement(Inp,{label:"Nome",value:edit.nome,onChange:function(v){setEdit(Object.assign({},edit,{nome:v}))},placeholder:"Ex: Lucas"}),
            React.createElement(Sel,{label:"Nível",value:edit.nivel||"",onChange:function(v){setEdit(Object.assign({},edit,{nivel:v}))},options:[{value:"",label:"Nenhum (Suporte)"}].concat(NIVEIS)}),
            React.createElement(Sel,{label:"Sala Fixa",value:edit.salaId||"",onChange:function(v){setEdit(Object.assign({},edit,{salaId:v}))},options:data.salas.map(function(s){return{value:s.id,label:"Sala "+s.numero+" ("+s.andar+")"}}),placeholder:"Selecionar"})
          ),
          React.createElement("div",{style:{marginBottom:18}},
            React.createElement(Inp,{label:"Observações",value:edit.obs||"",onChange:function(v){setEdit(Object.assign({},edit,{obs:v}))},placeholder:"Anotações"})
          ),
          React.createElement("div",{style:{marginBottom:18}},
            React.createElement("label",{style:{fontSize:11,fontWeight:600,color:C.txM,textTransform:"uppercase",letterSpacing:.5,display:"block",marginBottom:8}},"Prioridade de Profissionais (1ª, 2ª, 3ª)"),
            React.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}},
              [0,1,2].map(function(i){return React.createElement(Sel,{key:i,label:(i+1)+"ª Opção",value:(edit.prios||[])[i]||"",onChange:function(v){var p=(edit.prios||["","",""]).slice();p[i]=v;setEdit(Object.assign({},edit,{prios:p}))},options:data.profissionais.map(function(p){return{value:p.id,label:p.nome}}),placeholder:"Selecionar"})})
            )
          ),
          React.createElement("div",{style:{marginBottom:18}},
            React.createElement(PatientGrade,{value:edit.grade||{},onChange:function(v){setEdit(Object.assign({},edit,{grade:v}))}})
          ),
          React.createElement("div",{style:{display:"flex",gap:10,justifyContent:"flex-end"}},
            React.createElement(Btn,{v:"df",onClick:closeM},"Cancelar"),
            React.createElement(Btn,{v:"pri",onClick:function(){savePac(edit)},disabled:!edit.nome},"Salvar")
          )
        )
      ),
      /* Profissional */
      React.createElement(Mdl,{open:modal==="prof",onClose:closeM,title:edit&&edit.id?"Editar Profissional":"Novo Profissional",wide:true},
        edit&&React.createElement("div",null,
          React.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:18}},
            React.createElement(Inp,{label:"Nome",value:edit.nome,onChange:function(v){setEdit(Object.assign({},edit,{nome:v}))},placeholder:"Ex: Ana"}),
            React.createElement(Sel,{label:"Vínculo",value:edit.tipo,onChange:function(v){setEdit(Object.assign({},edit,{tipo:v}))},options:VINCULOS.map(function(v){return{value:v,label:v}})})
          ),
          React.createElement("div",{style:{marginBottom:18}},React.createElement(Inp,{label:"Observações",value:edit.obs||"",onChange:function(v){setEdit(Object.assign({},edit,{obs:v}))}})),
          React.createElement("div",{style:{marginBottom:18}},
            React.createElement("label",{style:{fontSize:11,fontWeight:600,color:C.txM,textTransform:"uppercase",letterSpacing:.5,display:"block",marginBottom:8}},"Disponibilidade"),
            React.createElement("p",{style:{fontSize:11,color:C.txL,marginBottom:8}},"Clique nos horários. Clique no dia para marcar todos."),
            React.createElement(DayGrid,{value:edit.disp||{},onChange:function(v){setEdit(Object.assign({},edit,{disp:v}))},color:(edit.tipo||"").indexOf("PJ")>=0?C.pp:edit.tipo==="Estagiário"?C.wr:C.bl})
          ),
          React.createElement("div",{style:{display:"flex",gap:10,justifyContent:"flex-end"}},
            React.createElement(Btn,{v:"df",onClick:closeM},"Cancelar"),
            React.createElement(Btn,{v:"pri",onClick:function(){saveProf(edit)},disabled:!edit.nome},"Salvar")
          )
        )
      ),
      /* Sala */
      React.createElement(Mdl,{open:modal==="sala",onClose:closeM,title:edit&&edit.id?"Editar Sala":"Nova Sala"},
        edit&&React.createElement("div",null,
          React.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}},
            React.createElement(Inp,{label:"Número",value:edit.numero||"",onChange:function(v){setEdit(Object.assign({},edit,{numero:v}))},placeholder:"1, 2, 3..."}),
            React.createElement(Sel,{label:"Andar",value:edit.andar,onChange:function(v){setEdit(Object.assign({},edit,{andar:v}))},options:["Térreo","Superior"]})
          ),
          React.createElement("div",{style:{marginBottom:20}},
            React.createElement(Inp,{label:"Descrição",value:edit.descricao||"",onChange:function(v){setEdit(Object.assign({},edit,{descricao:v}))},placeholder:"Ex: Sala sensorial, sala de atendimento..."})
          ),
          React.createElement("div",{style:{display:"flex",gap:10,justifyContent:"flex-end"}},
            React.createElement(Btn,{v:"df",onClick:closeM},"Cancelar"),
            React.createElement(Btn,{v:"pri",onClick:function(){saveSala(edit)},disabled:!edit.numero},"Salvar")
          )
        )
      ),

      /* Resolver - Alocar profissional disponível */
      React.createElement(Mdl,{open:!!resolver,onClose:function(){setResolver(null)},title:"Resolver — Alocar Profissional"},
        resolver&&function(){
          var disponiveis = getProfsDisponiveis(resolver.dia, resolver.h);
          return React.createElement("div",null,
            React.createElement("div",{style:{marginBottom:20,padding:14,background:C.erBg,borderRadius:10}},
              React.createElement("div",{style:{fontSize:13,fontWeight:700,color:C.er,marginBottom:4}},"⚠️ Sem cobertura"),
              React.createElement("div",{style:{fontSize:13,color:C.tx}},
                React.createElement("b",null,"Paciente: "),resolver.pacNome," — ",
                React.createElement("b",null,resolver.dia)," às ",React.createElement("b",null,resolver.h)
              )
            ),
            React.createElement("h4",{style:{margin:"0 0 12px",fontSize:14,fontWeight:700}},
              "Profissionais disponíveis (",disponiveis.length,")"
            ),
            disponiveis.length===0
              ? React.createElement("div",{style:{padding:20,textAlign:"center",color:C.txM,background:C.bg,borderRadius:10}},
                  React.createElement("div",{style:{fontSize:28,marginBottom:8}},"😕"),
                  React.createElement("p",{style:{fontWeight:600}},"Nenhum profissional disponível neste horário"),
                  React.createElement("p",{style:{fontSize:12,color:C.txL}},"Todos estão ocupados, ausentes ou sem disponibilidade para "+resolver.dia+" "+resolver.h)
                )
              : React.createElement("div",{style:{display:"flex",flexDirection:"column",gap:8}},
                  disponiveis.map(function(prof){
                    var tot=Object.values(prof.disp||{}).reduce(function(a,b){return a+b.length},0);
                    var vincV=prof.tipo==="PJ fixo"?"pp":prof.tipo==="PJ hora"?"bl":prof.tipo==="Estagiário"?"wr":"df";
                    return React.createElement("div",{key:prof.id,style:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:14,background:C.bg,borderRadius:10,border:"1px solid "+C.bd}},
                      React.createElement("div",{style:{display:"flex",alignItems:"center",gap:10}},
                        React.createElement("div",null,
                          React.createElement("div",{style:{fontSize:14,fontWeight:700}},prof.nome),
                          React.createElement("div",{style:{display:"flex",gap:6,marginTop:4}},
                            React.createElement(Badge,{v:vincV},prof.tipo),
                            React.createElement(Badge,null,tot+" slots/sem")
                          )
                        )
                      ),
                      React.createElement(Btn,{v:"ok",sz:"sm",onClick:function(){alocarManual(resolver.pacId,resolver.dia,resolver.h,prof.id)}},"✓ Alocar")
                    )
                  })
                ),
            React.createElement("div",{style:{display:"flex",justifyContent:"flex-end",marginTop:16}},
              React.createElement(Btn,{v:"df",onClick:function(){setResolver(null)}},"Fechar")
            )
          );
        }()
      )
    );
  }

  /* ── RENDER ── */
  var content = null;
  if(tab==="dashboard")content=rDash();
  else if(tab==="agenda")content=rAgenda();
  else if(tab==="pacientes")content=rPacs();
  else if(tab==="profissionais")content=rProfs();
  else if(tab==="salas")content=rSalas();
  else if(tab==="ausencias")content=rAus();
  else if(tab==="config")content=rConf();

  return React.createElement("div",{style:{display:"flex",minHeight:"100vh",background:C.bg,fontFamily:"'Outfit',system-ui,sans-serif"}},
    React.createElement("link",{href:"https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap",rel:"stylesheet"}),
    sidebar,
    React.createElement("div",{style:{flex:1,padding:28,overflowY:"auto",maxHeight:"100vh"}},content),
    rModals()
  );
}

export default App;
