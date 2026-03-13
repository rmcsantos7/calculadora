import React from "react";
const { useState, useEffect, useCallback, useMemo, useRef } = React;

var DIAS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];
var HRS = [];
(function(){for(var h=8;h<=18;h++){for(var m=0;m<60;m+=10){HRS.push((h<10?"0":"")+h+":"+(m<10?"0":"")+m);if(h===18&&m===0)break}}})();
var VINCULOS_DEFAULT = ["PJ fixo", "PJ hora", "CLT", "Estagiário", "Administrativo", "Diretoria", "Coordenação", "RH", "Financeiro"];
var STATUS_PACIENTE = ["Ativo", "Aguardando Contato", "Antigo"];

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
function getEmpty() {
  return {
    salas: [], pacientes: [], sessoes: [],
    especialidades: ["Fonoaudiologia","Fisioterapia","Terapia Ocupacional","Psicologia","Psicopedagogia","Musicoterapia","Neuropsicologia","ABA","Psicomotricidade","Psicoterapia Convencional"],
    tratamentos: [
      {id:"t1",nome:"Fonoaudiologia",especialidades:["Fonoaudiologia"]},
      {id:"t2",nome:"Fisioterapia",especialidades:["Fisioterapia"]},
      {id:"t3",nome:"Terapia Ocupacional",especialidades:["Terapia Ocupacional"]},
      {id:"t4",nome:"Psicoterapia",especialidades:["Psicologia","Psicoterapia Convencional"]},
      {id:"t5",nome:"Psicopedagogia",especialidades:["Psicopedagogia"]},
      {id:"t6",nome:"Musicoterapia",especialidades:["Musicoterapia"]},
      {id:"t7",nome:"Avaliação Neuropsicológica",especialidades:["Neuropsicologia"]},
      {id:"t8",nome:"Terapia ABA",especialidades:["ABA"]},
      {id:"t9",nome:"Psicomotricidade",especialidades:["Psicomotricidade"]}
    ],
    profissionais: [
      {id:"p01",nome:"Aline Rocha da Mata",tipo:"CLT",especialidades:["ABA"],disp:{},obs:""},
      {id:"p02",nome:"Ana Paula Leite da Silva",tipo:"CLT",especialidades:["ABA"],disp:{},obs:""},
      {id:"p03",nome:"Ayla Aguado Camargo",tipo:"CLT",especialidades:["ABA"],disp:{},obs:""},
      {id:"p04",nome:"Bárbara Carvalho Monteiro",tipo:"CLT",especialidades:["ABA"],disp:{},obs:""},
      {id:"p05",nome:"Beatriz Cristina Filliettaz",tipo:"CLT",especialidades:["ABA","Psicologia"],disp:{},obs:""},
      {id:"p06",nome:"Bianca Franquilino da Silva Albuquerque",tipo:"CLT",especialidades:["ABA"],disp:{},obs:""},
      {id:"p07",nome:"Bruna Anielle Ferrari",tipo:"CLT",especialidades:["ABA","Psicologia"],disp:{},obs:""},
      {id:"p08",nome:"Camilli Vitória Alves Fernandes",tipo:"CLT",especialidades:["ABA"],disp:{},obs:""},
      {id:"p09",nome:"Carla Pinheiro Alves",tipo:"CLT",especialidades:["Fonoaudiologia"],disp:{},obs:""},
      {id:"p10",nome:"Carlos Eduardo Sousa Pimenta",tipo:"CLT",especialidades:["Psicologia"],disp:{},obs:""},
      {id:"p11",nome:"Conceição Magalhães da Silva",tipo:"CLT",especialidades:["Fonoaudiologia"],disp:{},obs:""},
      {id:"p12",nome:"Daniele de Pontes Maciel",tipo:"CLT",especialidades:["Psicopedagogia"],disp:{},obs:""},
      {id:"p13",nome:"Denise de Freitas Sanches",tipo:"CLT",especialidades:["Psicomotricidade"],disp:{},obs:""},
      {id:"p14",nome:"Eduarda Mayumi",tipo:"CLT",especialidades:["ABA"],disp:{},obs:""},
      {id:"p15",nome:"Elaine Cristina Gonçalves",tipo:"CLT",especialidades:["Fonoaudiologia"],disp:{},obs:""},
      {id:"p16",nome:"Érica Aparecida Cardoso",tipo:"CLT",especialidades:["Psicoterapia Convencional"],disp:{},obs:""},
      {id:"p17",nome:"Fernanda Cristina Quessada Gimenes",tipo:"CLT",especialidades:["ABA"],disp:{},obs:""},
      {id:"p18",nome:"Florencia Natasha Secreto Bassanelli",tipo:"CLT",especialidades:["Fonoaudiologia"],disp:{},obs:""},
      {id:"p19",nome:"Gabriela da Silva Siqueira",tipo:"CLT",especialidades:["Psicoterapia Convencional","ABA"],disp:{},obs:""},
      {id:"p20",nome:"Grasiele do Nascimento Ferraz",tipo:"CLT",especialidades:["Psicologia"],disp:{},obs:""},
      {id:"p21",nome:"Isabel Angelica dos Santos Contieri",tipo:"CLT",especialidades:["Musicoterapia"],disp:{},obs:""},
      {id:"p22",nome:"Isabela Figueira André Souza",tipo:"CLT",especialidades:["ABA"],disp:{},obs:""},
      {id:"p23",nome:"Josiane Conceição da Silva",tipo:"CLT",especialidades:["Terapia Ocupacional"],disp:{},obs:""},
      {id:"p24",nome:"Keren Jamilly Arca Soares",tipo:"CLT",especialidades:["ABA"],disp:{},obs:""},
      {id:"p25",nome:"Lana Ferreira Dourado",tipo:"CLT",especialidades:["ABA"],disp:{},obs:""},
      {id:"p26",nome:"Lenise Mitsue Melo Seino",tipo:"CLT",especialidades:["ABA"],disp:{},obs:""},
      {id:"p27",nome:"Leticia Barbosa Gouveia",tipo:"CLT",especialidades:["ABA"],disp:{},obs:""},
      {id:"p28",nome:"Leticia Cerqueira",tipo:"CLT",especialidades:["Terapia Ocupacional"],disp:{},obs:""},
      {id:"p29",nome:"Livia Sanches Correa",tipo:"CLT",especialidades:["ABA"],disp:{},obs:""},
      {id:"p30",nome:"Maira Silva Andrade",tipo:"CLT",especialidades:["Terapia Ocupacional"],disp:{},obs:""},
      {id:"p31",nome:"Maria de Fátima de Oliveira Santos",tipo:"CLT",especialidades:["Terapia Ocupacional"],disp:{},obs:""},
      {id:"p32",nome:"Maria Eduarda Araújo da Silva",tipo:"CLT",especialidades:["ABA"],disp:{},obs:""},
      {id:"p33",nome:"Maria Gabriela Oliveira da Silva",tipo:"CLT",especialidades:["Fonoaudiologia"],disp:{},obs:""},
      {id:"p34",nome:"Maria Madalena Silva Sabino",tipo:"CLT",especialidades:["Fonoaudiologia"],disp:{},obs:""},
      {id:"p35",nome:"Monica Gomes dos Santos",tipo:"CLT",especialidades:["Fonoaudiologia"],disp:{},obs:""},
      {id:"p36",nome:"Nicoli Ferreira da Silva",tipo:"CLT",especialidades:["ABA"],disp:{},obs:""},
      {id:"p37",nome:"Sabrina Fideles de Sousa",tipo:"CLT",especialidades:["ABA"],disp:{},obs:""},
      {id:"p38",nome:"Salua Said Montalbo Smaili",tipo:"CLT",especialidades:["Terapia Ocupacional"],disp:{},obs:""},
      {id:"p39",nome:"Samanta Aparecida dos Santos",tipo:"CLT",especialidades:["ABA"],disp:{},obs:""},
      {id:"p40",nome:"Sara Helena Soares Ferreira",tipo:"CLT",especialidades:["Fonoaudiologia"],disp:{},obs:""},
      {id:"p41",nome:"Sarah dos Santos Chagas",tipo:"CLT",especialidades:["ABA"],disp:{},obs:""},
      {id:"p42",nome:"Sheila Faria Carlos Nunes",tipo:"CLT",especialidades:["ABA"],disp:{},obs:""},
      {id:"p43",nome:"Silvana Lima Ferreira Curcino dos Santos",tipo:"CLT",especialidades:["ABA"],disp:{},obs:""},
      {id:"p44",nome:"Talita Vicente Henrique Mediros",tipo:"CLT",especialidades:["ABA","Psicologia"],disp:{},obs:""},
      {id:"p45",nome:"Tayná de Sousa Corrêa",tipo:"CLT",especialidades:["ABA"],disp:{},obs:""},
      {id:"p46",nome:"Taynara Cristina Silva Carvalho Oliveira",tipo:"CLT",especialidades:["ABA"],disp:{},obs:""},
      {id:"p47",nome:"Thais Almeida Gonçalves",tipo:"CLT",especialidades:["Psicomotricidade"],disp:{},obs:""},
      {id:"p48",nome:"Varléia Dias Paula",tipo:"CLT",especialidades:["Psicopedagogia"],disp:{},obs:""}
    ],
    ausencias: {},
    historicoFaltas: [],
    vinculos: VINCULOS_DEFAULT.slice(),
    prioVinculo: VINCULOS_DEFAULT.slice()
  };
}

var SK = "clinica-v8";
async function ldDB() { try { var r = localStorage.getItem(SK); return r ? JSON.parse(r) : null; } catch (e) { return null; } }
async function svDB(d) { try { localStorage.setItem(SK, JSON.stringify(d)); } catch (e) {} }

/* ── Colors ── */
var C = { bg:"#F7F6F3",cd:"#fff",pri:"#1a3a2a",prBg:"#dff5e6",acc:"#d35233",acBg:"#fce8e2",tx:"#1a1a1a",txM:"#6b7280",txL:"#a1a1aa",bd:"#e4e3de",ok:"#0d9668",okBg:"#d1fae5",wr:"#d97706",wrBg:"#fef3c7",er:"#dc2626",erBg:"#fee2e2",pp:"#7c3aed",ppBg:"#ede9fe",bl:"#2563eb",blBg:"#dbeafe",sup:"#0891b2",supBg:"#cffafe",exc:"#c026d3",excBg:"#fae8ff",tl:"#0d6efd",tlBg:"#e7f1ff" };

/* ── Micro Components ── */
function Badge(p) {
  var m = { df:{bg:C.bd,c:C.tx},ok:{bg:C.okBg,c:C.ok},wr:{bg:C.wrBg,c:C.wr},er:{bg:C.erBg,c:C.er},pp:{bg:C.ppBg,c:C.pp},bl:{bg:C.blBg,c:C.bl},ac:{bg:C.acBg,c:C.acc},pr:{bg:C.prBg,c:C.pri},sup:{bg:C.supBg,c:C.sup},exc:{bg:C.excBg,c:C.exc},tl:{bg:C.tlBg,c:C.tl} };
  var s = m[p.v || "df"] || m.df;
  return React.createElement("span", { style: { display:"inline-block",padding:"2px 10px",borderRadius:20,fontSize:11,fontWeight:700,background:s.bg,color:s.c,letterSpacing:.3,whiteSpace:"nowrap" } }, p.children);
}

function Btn(p) {
  var szs = { sm:{padding:"6px 12px",fontSize:12}, md:{padding:"8px 18px",fontSize:13} };
  var vs = { df:{background:C.bd,color:C.tx},pri:{background:C.pri,color:"#fff"},er:{background:C.erBg,color:C.er},gh:{background:"transparent",color:C.txM},ok:{background:C.ok,color:"#fff"},ac:{background:C.acc,color:"#fff"},bl:{background:C.bl,color:"#fff"} };
  var sz = szs[p.sz||"md"]||szs.md, v = vs[p.v||"df"]||vs.df;
  return React.createElement("button", { onClick:p.disabled?undefined:p.onClick, style:Object.assign({},{display:"inline-flex",alignItems:"center",gap:6,border:"none",cursor:p.disabled?"not-allowed":"pointer",fontWeight:600,borderRadius:10,opacity:p.disabled?.5:1,transition:"all .15s"},sz,v,p.style||{}) }, p.children);
}

function Inp(p) {
  return React.createElement("div",{style:{display:"flex",flexDirection:"column",gap:4}},
    p.label && React.createElement("label",{style:{fontSize:11,fontWeight:600,color:C.txM,textTransform:"uppercase",letterSpacing:.5}},p.label),
    React.createElement("input",{type:p.type||"text",value:p.value||"",onChange:function(e){p.onChange(e.target.value)},placeholder:p.placeholder||"",style:Object.assign({},{padding:"8px 12px",border:"1.5px solid "+C.bd,borderRadius:8,fontSize:13,outline:"none",background:C.bg},p.style||{})})
  );
}

function Sel(p) {
  var opts = p.options||[];
  return React.createElement("div",{style:{display:"flex",flexDirection:"column",gap:4}},
    p.label && React.createElement("label",{style:{fontSize:11,fontWeight:600,color:C.txM,textTransform:"uppercase",letterSpacing:.5}},p.label),
    React.createElement("select",{value:p.value||"",onChange:function(e){p.onChange(e.target.value)},style:{padding:"8px 12px",border:"1.5px solid "+C.bd,borderRadius:8,fontSize:13,outline:"none",background:C.bg,cursor:"pointer"}},
      p.placeholder!==false && React.createElement("option",{value:""},p.placeholder||"Selecionar"),
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

/* Multi-select chips */
function MultiChip(p) {
  var selected = p.value || [];
  var options = p.options || [];
  function tog(val) {
    if (selected.indexOf(val) >= 0) p.onChange(selected.filter(function(v){return v!==val}));
    else p.onChange(selected.concat(val));
  }
  return React.createElement("div",{style:{display:"flex",flexDirection:"column",gap:4}},
    p.label && React.createElement("label",{style:{fontSize:11,fontWeight:600,color:C.txM,textTransform:"uppercase",letterSpacing:.5}},p.label),
    React.createElement("div",{style:{display:"flex",flexWrap:"wrap",gap:6}},
      options.map(function(o){
        var val = typeof o === "string" ? o : o.value;
        var lbl = typeof o === "string" ? o : o.label;
        var active = selected.indexOf(val) >= 0;
        return React.createElement("div",{key:val,onClick:function(){tog(val)},style:{
          padding:"5px 12px",borderRadius:20,fontSize:12,fontWeight:600,cursor:"pointer",
          background:active?C.pri:"#eeedea",color:active?"#fff":C.txM,
          border:active?"1.5px solid "+C.pri:"1.5px solid "+C.bd,transition:"all .15s"
        }},lbl);
      })
    )
  );
}

/* Disponibilidade Editor — faixas de horário livres por dia */
function DispEditor(p) {
  /* value format: { "Segunda": [{ini:"08:00",fim:"08:50"}, ...], ... } */
  var val = p.value||{};
  function addFaixa(dia){
    var c=Object.assign({},val);
    if(!c[dia])c[dia]=[];
    c[dia]=c[dia].concat({ini:"08:00",fim:"08:50"});
    p.onChange(c);
  }
  function updFaixa(dia,idx,field,v){
    var c=Object.assign({},val);
    c[dia]=c[dia].map(function(f,i){if(i===idx){var n=Object.assign({},f);n[field]=v;return n}return f});
    p.onChange(c);
  }
  function delFaixa(dia,idx){
    var c=Object.assign({},val);
    c[dia]=c[dia].filter(function(_,i){return i!==idx});
    if(c[dia].length===0) delete c[dia];
    p.onChange(c);
  }
  function calcMinDia(faixas){
    return (faixas||[]).reduce(function(acc,f){
      var p1=f.ini.split(":"),p2=f.fim.split(":");
      var m1=parseInt(p1[0])*60+parseInt(p1[1]),m2=parseInt(p2[0])*60+parseInt(p2[1]);
      return acc+Math.max(0,m2-m1);
    },0);
  }
  function fmtMin(m){var h=Math.floor(m/60);var mm=m%60;return h+"h"+(mm>0?mm+"m":"")}
  var totalMin=DIAS.reduce(function(a,d){return a+calcMinDia(val[d])},0);

  return React.createElement("div",null,
    React.createElement("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}},
      React.createElement("span",{style:{fontSize:12,fontWeight:700,color:C.pri}},"Total semanal: "+fmtMin(totalMin))
    ),
    DIAS.map(function(dia){
      var faixas=val[dia]||[];
      var minDia=calcMinDia(faixas);
      return React.createElement("div",{key:dia,style:{marginBottom:10,padding:10,background:C.bg,borderRadius:8,border:"1px solid "+C.bd}},
        React.createElement("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:faixas.length>0?8:0}},
          React.createElement("span",{style:{fontSize:12,fontWeight:700}},dia,minDia>0?React.createElement("span",{style:{fontWeight:400,color:C.txM,marginLeft:6,fontSize:11}},"("+fmtMin(minDia)+")"):null),
          React.createElement(Btn,{v:"pri",sz:"sm",onClick:function(){addFaixa(dia)}},"+ Horário")
        ),
        faixas.map(function(f,idx){
          return React.createElement("div",{key:idx,style:{display:"flex",gap:8,alignItems:"center",marginBottom:4}},
            React.createElement("select",{value:f.ini,onChange:function(e){updFaixa(dia,idx,"ini",e.target.value)},style:{padding:"5px 8px",border:"1px solid "+C.bd,borderRadius:6,fontSize:12,background:"#fff"}},
              HRS.map(function(h){return React.createElement("option",{key:h,value:h},h)})
            ),
            React.createElement("span",{style:{fontSize:11,color:C.txM}},"às"),
            React.createElement("select",{value:f.fim,onChange:function(e){updFaixa(dia,idx,"fim",e.target.value)},style:{padding:"5px 8px",border:"1px solid "+C.bd,borderRadius:6,fontSize:12,background:"#fff"}},
              HRS.filter(function(h){return h>f.ini}).map(function(h){return React.createElement("option",{key:h,value:h},h)})
            ),
            React.createElement(Btn,{v:"er",sz:"sm",onClick:function(){delFaixa(dia,idx)}},"✕")
          );
        })
      );
    })
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
  {id:"dashboard",icon:"📊",lb:"Dashboard"},
  {id:"sessoes",icon:"📅",lb:"Sessões"},
  {id:"pacientes",icon:"👶",lb:"Pacientes"},
  {id:"profissionais",icon:"👩‍⚕️",lb:"Profissionais"},
  {id:"tratamentos",icon:"💊",lb:"Tratamentos"},
  {id:"salas",icon:"🏠",lb:"Salas"},
  {id:"vinculos",icon:"🏷️",lb:"Vínculos"},
  {id:"ausencias",icon:"🚫",lb:"Faltas"},
  {id:"config",icon:"⚙️",lb:"Configurações"}
];

/* ══════════════════════════════ MAIN APP ══════════════════════════════ */
function App() {
  var sd = useState(getEmpty), data = sd[0], setData = sd[1];
  var sl = useState(true), loading = sl[0], setLoading = sl[1];
  var st = useState("dashboard"), tab = st[0], setTab = st[1];
  var sm = useState(null), modal = sm[0], setModal = sm[1];
  var se = useState(null), edit = se[0], setEdit = se[1];
  var ss = useState(""), search = ss[0], setSearch = ss[1];
  var sImp = useState(null), importMode = sImp[0], setImportMode = sImp[1];
  var sImpTxt = useState(""), importTxt = sImpTxt[0], setImportTxt = sImpTxt[1];
  var sMsg = useState(null), toast = sMsg[0], setToast = sMsg[1];
  var sNewVinc = useState(""), newVinc = sNewVinc[0], setNewVinc = sNewVinc[1];
  var fileRef = useRef(null);

  useEffect(function() { ldDB().then(function(d) {
    if(d) {
      var def = getEmpty();
      var merged = Object.assign({},def,d);
      if(!merged.sessoes) merged.sessoes=[];
      /* Merge new especialidades without losing existing */
      var existEsp = merged.especialidades||[];
      def.especialidades.forEach(function(e){ if(existEsp.indexOf(e)<0) existEsp.push(e); });
      merged.especialidades = existEsp;
      /* Merge new tratamentos without losing existing */
      var existTratIds = (merged.tratamentos||[]).map(function(t){return t.id});
      def.tratamentos.forEach(function(t){ if(existTratIds.indexOf(t.id)<0) merged.tratamentos.push(t); });
      /* If no profissionais exist yet, use defaults from planilha */
      if(!merged.profissionais||merged.profissionais.length===0) merged.profissionais=def.profissionais;
      /* Merge vinculos: keep existing, add new defaults */
      if(!merged.vinculos) merged.vinculos=def.vinculos;
      else { def.vinculos.forEach(function(v){ if(merged.vinculos.indexOf(v)<0) merged.vinculos.push(v); }); }
      if(!merged.historicoFaltas) merged.historicoFaltas=[];
      /* Migrate legacy disp format: ["08:00","08:50",...] → [{ini:"08:00",fim:"08:50"},...] */
      (merged.profissionais||[]).forEach(function(prof){
        if(!prof.disp) return;
        DIAS.forEach(function(dia){
          var arr = prof.disp[dia];
          if(!arr || arr.length===0) return;
          if(typeof arr[0]==="string"){
            /* Convert consecutive slots to ranges. Each slot is 50min. */
            arr.sort();
            var ranges=[];
            var i=0;
            while(i<arr.length){
              var start=arr[i];
              var end=arr[i];
              /* Group consecutive slots (next slot starts within 50min) */
              while(i+1<arr.length){
                var curParts=arr[i].split(":");var nextParts=arr[i+1].split(":");
                var curMin=parseInt(curParts[0])*60+parseInt(curParts[1]);
                var nextMin=parseInt(nextParts[0])*60+parseInt(nextParts[1]);
                if(nextMin-curMin<=50){end=arr[i+1];i++}else break;
              }
              /* End time = last slot + 50min */
              var ep=end.split(":");var em=parseInt(ep[0])*60+parseInt(ep[1])+50;
              var eh=Math.floor(em/60);var emin=em%60;
              var fimStr=(eh<10?"0":"")+eh+":"+(emin<10?"0":"")+emin;
              ranges.push({ini:start,fim:fimStr});
              i++;
            }
            prof.disp[dia]=ranges;
          }
        });
      });
      setData(merged);
    }
    setLoading(false);
  }); }, []);
  var persist = useCallback(function(nd) { setData(nd); svDB(nd); }, []);

  function showToast(msg){ setToast(msg); setTimeout(function(){ setToast(null); }, 3000); }

  /* ── CRUD helpers ── */
  function savePac(p){var ex=data.pacientes.find(function(x){return x.id===p.id});var np=ex?data.pacientes.map(function(x){return x.id===p.id?p:x}):data.pacientes.concat(Object.assign({},p,{id:uid()}));persist(Object.assign({},data,{pacientes:np}));setModal(null);setEdit(null)}
  function delPac(id){persist(Object.assign({},data,{pacientes:data.pacientes.filter(function(x){return x.id!==id}),sessoes:data.sessoes.filter(function(s){return s.pacienteId!==id})}))}
  function saveProf(p){
    var ex=data.profissionais.find(function(x){return x.id===p.id});
    var np=ex?data.profissionais.map(function(x){return x.id===p.id?p:x}):data.profissionais.concat(Object.assign({},p,{id:uid()}));
    var ns = data.sessoes;
    /* Se desligou profissional, sessões confirmadas com ele → aguardando */
    if(p.dataDesligamento && ex && !ex.dataDesligamento){
      ns = data.sessoes.map(function(s){
        if(s.profissionalId===p.id && s.status==="confirmado"){
          return Object.assign({},s,{profissionalId:"",status:"aguardando"});
        }
        return s;
      });
      showToast("⚠️ Profissional desligado — sessões passaram para 'Aguardando'");
    }
    persist(Object.assign({},data,{profissionais:np,sessoes:ns}));setModal(null);setEdit(null);
  }
  function delProf(id){
    /* Se deletar prof, sessões confirmadas com ele passam para Aguardando */
    var ns = data.sessoes.map(function(s){ if(s.profissionalId===id){ return Object.assign({},s,{profissionalId:"",status:"aguardando"}); } return s; });
    persist(Object.assign({},data,{profissionais:data.profissionais.filter(function(x){return x.id!==id}),sessoes:ns}));
  }
  function saveSala(sv){var ex=data.salas.find(function(x){return x.id===sv.id});var ns=ex?data.salas.map(function(x){return x.id===sv.id?sv:x}):data.salas.concat(Object.assign({},sv,{id:uid()}));persist(Object.assign({},data,{salas:ns}));setModal(null);setEdit(null)}
  function delSala(id){persist(Object.assign({},data,{salas:data.salas.filter(function(x){return x.id!==id})}))}
  function saveTrat(t){var ex=data.tratamentos.find(function(x){return x.id===t.id});var nt=ex?data.tratamentos.map(function(x){return x.id===t.id?t:x}):data.tratamentos.concat(Object.assign({},t,{id:uid()}));persist(Object.assign({},data,{tratamentos:nt}));setModal(null);setEdit(null)}
  function delTrat(id){persist(Object.assign({},data,{tratamentos:data.tratamentos.filter(function(x){return x.id!==id})}))}

  /* ── Sessão CRUD ── */
  function saveSessao(s){
    var ex=data.sessoes.find(function(x){return x.id===s.id});
    /* Se tem profissional E sala → confirmado, senão → aguardando */
    var status = (s.profissionalId && s.salaId) ? "confirmado" : "aguardando";
    var ns = Object.assign({},s,{status:status});
    var arr=ex?data.sessoes.map(function(x){return x.id===s.id?ns:x}):data.sessoes.concat(Object.assign({},ns,{id:uid()}));
    persist(Object.assign({},data,{sessoes:arr}));setModal(null);setEdit(null);
  }
  function delSessao(id){persist(Object.assign({},data,{sessoes:data.sessoes.filter(function(x){return x.id!==id})}))}

  /* ── Ausência com impacto nas sessões ── */
  function togAus(pid,dia){
    var a=Object.assign({},data.ausencias||{});
    var key = pid+"-"+dia;
    var willBeAbsent = !a[key];
    a[key] = willBeAbsent;
    if(!willBeAbsent) { a[key]=false; }

    var ns = data.sessoes.slice();
    if(willBeAbsent){
      /* Profissional vai faltar: sessões confirmadas com ele nesse dia → aguardando */
      ns = ns.map(function(s){
        if(s.profissionalId===pid && s.dia===dia && s.status==="confirmado"){
          return Object.assign({},s,{profissionalId:"",status:"aguardando"});
        }
        return s;
      });
      var affected = ns.filter(function(s){return s.dia===dia && s.profissionalId==="" && s.status==="aguardando"}).length;
      if(affected > 0){
        showToast("⚠️ "+affected+" sessão(ões) passaram para 'Aguardando Profissional' neste dia!");
      }
    }
    /* Registrar no histórico de faltas */
    var hist = (data.historicoFaltas||[]).slice();
    if(willBeAbsent){
      var prof = data.profissionais.find(function(p){return p.id===pid});
      hist.push({id:uid(),profissionalId:pid,profissionalNome:prof?prof.nome:"",dia:dia,dataRegistro:new Date().toISOString().slice(0,10),horaRegistro:new Date().toTimeString().slice(0,5)});
    }
    persist(Object.assign({},data,{ausencias:a,sessoes:ns,historicoFaltas:hist}));
  }
  function clrAus(){persist(Object.assign({},data,{ausencias:{}}))}

  /* ── Get available profs for a session context ── */
  function getProfsParaSessao(sessao) {
    if(!sessao) return [];
    var trat = data.tratamentos.find(function(t){return t.id===sessao.tratamentoId});
    var especsNeeded = trat ? (trat.especialidades||[]) : [];
    var aus = data.ausencias || {};

    return data.profissionais.filter(function(prof){
      /* Filter desligados and blocked from sessions */
      if(prof.dataDesligamento) return false;
      if(prof.bloqSessao) return false;
      /* Filter by specialty match */
      if(especsNeeded.length > 0){
        var profEspecs = prof.especialidades || [];
        var match = especsNeeded.some(function(e){ return profEspecs.indexOf(e)>=0; });
        if(!match) return false;
      }
      /* Filter by absence */
      if(sessao.dia && aus[prof.id+"-"+sessao.dia]) return false;
      /* Filter by availability: prof must have a time range covering the session */
      if(sessao.dia && sessao.horaInicio){
        var profDisp = (prof.disp && prof.disp[sessao.dia]) || [];
        if(profDisp.length > 0){
          var hasRange = profDisp.some(function(faixa){
            if(typeof faixa==="string") return faixa <= sessao.horaInicio; /* legacy */
            return faixa.ini <= sessao.horaInicio && faixa.fim >= (sessao.horaFim||sessao.horaInicio);
          });
          if(!hasRange) return false;
        }
      }
      /* Check if prof is already booked at this time on this day */
      var busy = data.sessoes.some(function(s){
        if(s.id === sessao.id) return false;
        if(s.profissionalId !== prof.id) return false;
        if(s.dia !== sessao.dia) return false;
        if(s.status !== "confirmado") return false;
        /* Time overlap check */
        if(sessao.horaInicio && sessao.horaFim && s.horaInicio && s.horaFim){
          return s.horaInicio < sessao.horaFim && s.horaFim > sessao.horaInicio;
        }
        return false;
      });
      if(busy) return false;
      return true;
    });
  }

  /* Sort profs: patient priorities first, then others */
  function sortProfsForPatient(profs, pacienteId) {
    var pac = data.pacientes.find(function(p){return p.id===pacienteId});
    var prios = pac ? (pac.prios||[]).filter(Boolean) : [];
    return profs.slice().sort(function(a,b){
      var ai = prios.indexOf(a.id);
      var bi = prios.indexOf(b.id);
      if(ai>=0 && bi>=0) return ai-bi;
      if(ai>=0) return -1;
      if(bi>=0) return 1;
      return a.nome.localeCompare(b.nome);
    });
  }

  /* ── Import CSV/text ── */
  function handleImport(type) {
    var lines = importTxt.trim().split("\n").filter(function(l){return l.trim()});
    if(lines.length === 0){ showToast("Nenhum dado encontrado"); return; }

    if(type === "pacientes") {
      /* Expected: Nome;Nível;Obs */
      var newPacs = lines.map(function(line){
        var parts = line.split(/[;\t,]/).map(function(s){return s.trim()});
        return { id:uid(), nome:parts[0]||"", nivel:parts[1]||"Nível 1", obs:parts[2]||"", prios:["","",""], grade:{} };
      }).filter(function(p){return p.nome});
      persist(Object.assign({},data,{pacientes:data.pacientes.concat(newPacs)}));
      showToast("✅ "+newPacs.length+" paciente(s) importado(s)!");
    } else {
      /* Profissionais: Nome;Vínculo;Especialidades(sep por |);Disponibilidade;Obs
         Disponibilidade format: Dia=H1,H2,H3|Dia=H1,H2
         Ex: Segunda=08:00,08:50,09:40|Terça=13:00,13:50
         Shortcuts: Dia=MANHA (08:00-11:20), Dia=TARDE (13:00-17:10), Dia=INTEGRAL (all)
      */
      var MANHA_HRS = ["08:00","08:50","09:40","10:30","11:20"];
      var TARDE_HRS = ["13:00","13:50","14:40","15:30","16:20","17:10"];
      var ALL_HRS = MANHA_HRS.concat(TARDE_HRS);
      var DIA_MAP = {"seg":"Segunda","ter":"Terça","qua":"Quarta","qui":"Quinta","sex":"Sexta",
        "segunda":"Segunda","terca":"Terça","terça":"Terça","quarta":"Quarta","quinta":"Quinta","sexta":"Sexta"};

      function parseDisp(str){
        if(!str) return {};
        var disp = {};
        var blocos = str.split("|");
        blocos.forEach(function(bloco){
          bloco = bloco.trim();
          if(!bloco) return;
          var eqIdx = bloco.indexOf("=");
          if(eqIdx < 0) return;
          var diaRaw = bloco.substring(0, eqIdx).trim().toLowerCase();
          var hrsRaw = bloco.substring(eqIdx + 1).trim().toUpperCase();
          var dia = DIA_MAP[diaRaw] || bloco.substring(0, eqIdx).trim();
          /* Validate dia */
          if(DIAS.indexOf(dia) < 0) return;
          var hrs;
          if(hrsRaw === "MANHA" || hrsRaw === "MANHÃ") hrs = MANHA_HRS.slice();
          else if(hrsRaw === "TARDE") hrs = TARDE_HRS.slice();
          else if(hrsRaw === "INTEGRAL" || hrsRaw === "TUDO" || hrsRaw === "ALL") hrs = ALL_HRS.slice();
          else hrs = hrsRaw.split(",").map(function(h){return h.trim()}).filter(function(h){return ALL_HRS.indexOf(h)>=0});
          if(hrs.length > 0) disp[dia] = hrs;
        });
        return disp;
      }

      var newProfs = lines.map(function(line){
        var parts = line.split(/[;\t]/).map(function(s){return s.trim()});
        var especs = (parts[2]||"").split("|").map(function(s){return s.trim()}).filter(Boolean);
        var disp = parseDisp(parts[3]||"");
        return { id:uid(), nome:parts[0]||"", tipo:parts[1]||"CLT", especialidades:especs, obs:parts[4]||"", disp:disp };
      }).filter(function(p){return p.nome});
      persist(Object.assign({},data,{profissionais:data.profissionais.concat(newProfs)}));
      showToast("✅ "+newProfs.length+" profissional(is) importado(s)!");
    }
    setImportMode(null);
    setImportTxt("");
  }

  function handleFileUpload(type, e) {
    var file = e.target.files[0];
    if(!file) return;
    var reader = new FileReader();
    reader.onload = function(ev){
      setImportTxt(ev.target.result);
    };
    reader.readAsText(file);
  }

  function closeM(){setModal(null);setEdit(null)}

  /* ── Stats ── */
  var totalSessoes = data.sessoes.length;
  var sessoesConfirmadas = data.sessoes.filter(function(s){return s.status==="confirmado"}).length;
  var sessoesAguardando = data.sessoes.filter(function(s){return s.status==="aguardando"}).length;
  var ausN = Object.values(data.ausencias||{}).filter(Boolean).length;

  function exportCSV(){
    var hdr=["Dia","Hora Início","Hora Fim","Paciente","Tratamento","Profissional","Status","Sala"];
    var rows=data.sessoes.map(function(s){
      var pac=data.pacientes.find(function(p){return p.id===s.pacienteId});
      var prof=data.profissionais.find(function(p){return p.id===s.profissionalId});
      var trat=data.tratamentos.find(function(t){return t.id===s.tratamentoId});
      var sala=data.salas.find(function(sl){return sl.id===s.salaId});
      return[s.dia||"",s.horaInicio||"",s.horaFim||"",pac?pac.nome:"",trat?trat.nome:"",prof?prof.nome:"Aguardando",s.status==="confirmado"?"Confirmado":"Aguardando",sala?"Sala "+sala.numero:""];
    });
    var csv=[hdr].concat(rows).map(function(r){return r.map(function(c){return'"'+c+'"'}).join(",")}).join("\n");
    var b=new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8;"});var u=URL.createObjectURL(b);var a=document.createElement("a");a.href=u;a.download="sessoes.csv";a.click();
  }

  if(loading) return React.createElement("div",{style:{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",color:C.txM}},"Carregando...");

  /* ── Sidebar ── */
  var sidebar = React.createElement("div",{style:{width:220,background:C.pri,padding:"24px 0",display:"flex",flexDirection:"column",flexShrink:0,position:"sticky",top:0,height:"100vh"}},
    React.createElement("div",{style:{padding:"0 18px",marginBottom:32}},
      React.createElement("div",{style:{fontSize:20,fontWeight:800,color:"#fff"}},"📋 Agenda"),
      React.createElement("div",{style:{fontSize:10,color:"rgba(255,255,255,.4)",marginTop:2}},"Calculadora Clínica v2")
    ),
    React.createElement("nav",{style:{flex:1}},
      NAV.map(function(n){
        var cnt=null;
        if(n.id==="sessoes")cnt=totalSessoes||null;
        if(n.id==="pacientes"&&data.pacientes.length>0)cnt=data.pacientes.length;
        if(n.id==="profissionais"&&data.profissionais.length>0)cnt=data.profissionais.length;
        if(n.id==="salas"&&data.salas.length>0)cnt=data.salas.length;
        if(n.id==="tratamentos")cnt=data.tratamentos.length||null;
        if(n.id==="vinculos")cnt=(data.vinculos||[]).length||null;
        return React.createElement("div",{key:n.id,onClick:function(){setTab(n.id);setSearch("")},style:{display:"flex",alignItems:"center",gap:10,padding:"10px 18px",cursor:"pointer",background:tab===n.id?"rgba(255,255,255,.12)":"transparent",color:tab===n.id?"#fff":"rgba(255,255,255,.5)",borderRight:tab===n.id?"3px solid "+C.acc:"3px solid transparent",fontSize:13,fontWeight:tab===n.id?700:500}},
          React.createElement("span",{style:{fontSize:15}},n.icon), n.lb,
          cnt&&React.createElement("span",{style:{marginLeft:"auto",fontSize:10,background:"rgba(255,255,255,.15)",padding:"1px 7px",borderRadius:10}},cnt),
          n.id==="ausencias"&&ausN>0&&React.createElement("span",{style:{marginLeft:"auto",fontSize:10,background:"rgba(255,80,80,.6)",padding:"1px 7px",borderRadius:10,color:"#fff"}},ausN),
          n.id==="sessoes"&&sessoesAguardando>0&&React.createElement("span",{style:{marginLeft:"auto",fontSize:10,background:"rgba(255,180,0,.7)",padding:"1px 7px",borderRadius:10,color:"#fff"}},sessoesAguardando)
        )
      })
    )
  );

  /* ── Dashboard ── */
  function rDash(){
    var stats=[
      {l:"Pacientes",v:data.pacientes.length,i:"👶",c:C.pri,b:C.prBg},
      {l:"Profissionais",v:data.profissionais.length,i:"👩‍⚕️",c:C.pp,b:C.ppBg},
      {l:"Sessões",v:totalSessoes,i:"📅",c:C.bl,b:C.blBg},
      {l:"Confirmadas",v:sessoesConfirmadas,i:"✅",c:C.ok,b:C.okBg},
      {l:"Aguardando",v:sessoesAguardando,i:"⏳",c:C.wr,b:C.wrBg},
      {l:"Faltas",v:ausN,i:"🚫",c:C.er,b:C.erBg}
    ];
    return React.createElement("div",null,
      React.createElement("h2",{style:{fontSize:24,fontWeight:800,marginBottom:4}},"Dashboard"),
      React.createElement("p",{style:{color:C.txM,fontSize:13,marginBottom:24}},"Visão geral da clínica"),
      React.createElement("div",{style:{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:24}},
        stats.map(function(x,i){return React.createElement(Crd,{key:i,style:{display:"flex",alignItems:"center",gap:12}},
          React.createElement("div",{style:{width:42,height:42,borderRadius:12,background:x.b,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}},x.i),
          React.createElement("div",null,React.createElement("div",{style:{fontSize:22,fontWeight:800,color:x.c}},x.v),React.createElement("div",{style:{fontSize:11,color:C.txM,fontWeight:600}},x.l))
        )})
      ),
      data.pacientes.length===0&&data.profissionais.length===0&&React.createElement(Crd,{style:{textAlign:"center",padding:40,border:"2px dashed "+C.bd}},
        React.createElement("div",{style:{fontSize:48,marginBottom:12}},"🚀"),
        React.createElement("h3",{style:{margin:"0 0 8px",fontWeight:700}},"Comece cadastrando!"),
        React.createElement("p",{style:{color:C.txM,fontSize:13,marginBottom:16}},"1. Tratamentos → 2. Profissionais → 3. Pacientes → 4. Sessões"),
        React.createElement("div",{style:{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}},
          React.createElement(Btn,{v:"df",onClick:function(){setTab("tratamentos")}},"💊 Tratamentos"),
          React.createElement(Btn,{v:"pri",onClick:function(){setTab("profissionais")}},"👩‍⚕️ Profissionais"),
          React.createElement(Btn,{v:"ac",onClick:function(){setTab("pacientes")}},"👶 Pacientes"),
          React.createElement(Btn,{v:"bl",onClick:function(){setTab("sessoes")}},"📅 Sessões")
        )
      ),
      sessoesAguardando>0&&React.createElement(Crd,{style:{marginTop:16,borderLeft:"4px solid "+C.wr}},
        React.createElement("h4",{style:{margin:"0 0 8px",fontSize:14,fontWeight:700,color:C.wr}},"⏳ Sessões Aguardando Profissional"),
        React.createElement("div",{style:{display:"flex",flexWrap:"wrap",gap:6}},
          data.sessoes.filter(function(s){return s.status==="aguardando"}).slice(0,12).map(function(s){
            var pac=data.pacientes.find(function(p){return p.id===s.pacienteId});
            var trat=data.tratamentos.find(function(t){return t.id===s.tratamentoId});
            return React.createElement(Badge,{key:s.id,v:"wr"},(s.dia||"")+" "+(s.horaInicio||"")+" — "+(pac?pac.nome:"?")+" ("+(trat?trat.nome:"")+")");
          })
        )
      ),
      /* ── Painel Disponibilidade dos Profissionais ── */
      data.profissionais.length>0&&React.createElement(Crd,{style:{marginTop:24,overflowX:"auto"}},
        React.createElement("h4",{style:{margin:"0 0 12px",fontSize:15,fontWeight:700,color:C.pri}},"👩‍⚕️ Disponibilidade dos Profissionais"),
        React.createElement("table",{style:{width:"100%",borderCollapse:"collapse",fontSize:12}},
          React.createElement("thead",null,
            React.createElement("tr",{style:{background:C.prBg}},
              React.createElement("th",{style:{padding:"8px 10px",textAlign:"left",borderBottom:"2px solid "+C.bd,fontWeight:700,position:"sticky",left:0,background:C.prBg,minWidth:160}},"Profissional"),
              DIAS.map(function(d){return React.createElement("th",{key:d,style:{padding:"8px 6px",textAlign:"center",borderBottom:"2px solid "+C.bd,fontWeight:700,minWidth:100}},d.slice(0,3))}),
              React.createElement("th",{style:{padding:"8px 6px",textAlign:"center",borderBottom:"2px solid "+C.bd,fontWeight:700,minWidth:80}},"Total/Sem")
            )
          ),
          React.createElement("tbody",null,
            data.profissionais.filter(function(p){return !p.dataDesligamento}).map(function(prof,idx){
              var aus = data.ausencias||{};
              var totalDispMin=0, totalSessMin=0;
              var diasInfo = DIAS.map(function(d){
                var faixas = (prof.disp&&prof.disp[d])||[];
                var dispMin = faixas.reduce(function(acc,f){
                  if(!f.ini||!f.fim) return acc;
                  var p1=f.ini.split(":"),p2=f.fim.split(":");
                  return acc+Math.max(0,(parseInt(p2[0])*60+parseInt(p2[1]))-(parseInt(p1[0])*60+parseInt(p1[1])));
                },0);
                totalDispMin+=dispMin;
                var sessDia = data.sessoes.filter(function(s){return s.profissionalId===prof.id&&s.dia===d});
                var sessMin = sessDia.reduce(function(acc,s){
                  if(!s.horaInicio||!s.horaFim) return acc;
                  var a1=s.horaInicio.split(":"),a2=s.horaFim.split(":");
                  return acc+Math.max(0,(parseInt(a2[0])*60+parseInt(a2[1]))-(parseInt(a1[0])*60+parseInt(a1[1])));
                },0);
                totalSessMin+=sessMin;
                var isAus = aus[prof.id+"-"+d];
                var faixasTxt = faixas.map(function(f){return f.ini+"-"+f.fim}).join(", ");
                return {dispMin:dispMin,sessCount:sessDia.length,sessMin:sessMin,isAus:isAus,faixasTxt:faixasTxt};
              });
              function fmtH(m){if(m===0)return"-";var h=Math.floor(m/60);var mm=m%60;return h+"h"+(mm>0?mm+"m":"")}
              var ocup = totalDispMin>0?Math.round(totalSessMin/totalDispMin*100):0;
              var ocupColor = ocup>=90?C.er:ocup>=70?C.wr:C.ok;
              return React.createElement("tr",{key:prof.id,style:{background:idx%2===0?"#fff":"#fafaf8",borderBottom:"1px solid "+C.bd}},
                React.createElement("td",{style:{padding:"6px 10px",fontWeight:600,position:"sticky",left:0,background:idx%2===0?"#fff":"#fafaf8",whiteSpace:"nowrap"}},
                  prof.nome,
                  prof.bloqSessao&&React.createElement("span",{style:{color:C.er,fontSize:10,marginLeft:4}},"🚫")
                ),
                diasInfo.map(function(di,j){
                  var bg = di.isAus?"#fee2e2":di.dispMin===0?"#f3f4f6":"transparent";
                  return React.createElement("td",{key:j,style:{padding:"6px",textAlign:"center",background:bg,verticalAlign:"top"}},
                    di.isAus
                      ?React.createElement("span",{style:{color:C.er,fontWeight:700,fontSize:11}},"Ausente")
                      :di.dispMin===0
                        ?React.createElement("span",{style:{color:C.txL,fontSize:10}},"-")
                        :React.createElement("div",null,
                          React.createElement("div",{style:{fontSize:10,color:C.txM}},di.faixasTxt),
                          React.createElement("div",{style:{fontSize:11,fontWeight:600,marginTop:2}},
                            di.sessCount+" sess",
                            React.createElement("span",{style:{color:C.txM,fontWeight:400}}," ("+fmtH(di.sessMin)+")")
                          )
                        )
                  );
                }),
                React.createElement("td",{style:{padding:"6px",textAlign:"center"}},
                  React.createElement("div",{style:{fontWeight:700,fontSize:12}},fmtH(totalDispMin)),
                  React.createElement("div",{style:{fontSize:11,color:ocupColor,fontWeight:700}},ocup+"%"," ocup.")
                )
              );
            })
          )
        )
      )
    );
  }

  /* ── Sessões ── */
  function rSessoes(){
    var fil = data.sessoes.filter(function(s){
      if(!search) return true;
      var pac = data.pacientes.find(function(p){return p.id===s.pacienteId});
      var prof = data.profissionais.find(function(p){return p.id===s.profissionalId});
      var q = search.toLowerCase();
      return (pac&&pac.nome.toLowerCase().indexOf(q)>=0)||(prof&&prof.nome.toLowerCase().indexOf(q)>=0)||(s.dia||"").toLowerCase().indexOf(q)>=0;
    });
    /* Sort by day then time */
    fil.sort(function(a,b){
      var da=DIAS.indexOf(a.dia),db=DIAS.indexOf(b.dia);
      if(da!==db) return da-db;
      return (a.horaInicio||"").localeCompare(b.horaInicio||"");
    });

    return React.createElement("div",null,
      React.createElement("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}},
        React.createElement("div",null,
          React.createElement("h2",{style:{fontSize:24,fontWeight:800,margin:0}},"Sessões"),
          React.createElement("p",{style:{color:C.txM,fontSize:13,margin:"4px 0 0"}},
            totalSessoes+" total · ",sessoesConfirmadas," confirmada(s) · ",sessoesAguardando," aguardando"
          )
        ),
        React.createElement("div",{style:{display:"flex",gap:8}},
          React.createElement(Btn,{v:"ok",onClick:exportCSV},"⬇ CSV"),
          React.createElement(Btn,{v:"pri",onClick:function(){
            setEdit({pacienteId:"",dia:"Segunda",horaInicio:"08:00",horaFim:"08:50",tratamentoId:"",profissionalId:"",salaId:"",obs:"",status:"aguardando"});
            setModal("sessao");
          }},"+ Nova Sessão")
        )
      ),
      data.sessoes.length>3&&React.createElement(Inp,{placeholder:"Buscar por paciente, profissional ou dia...",value:search,onChange:setSearch,style:{marginBottom:16,width:"100%"}}),
      data.sessoes.length===0
        ?React.createElement(Crd,{style:{textAlign:"center",padding:40,border:"2px dashed "+C.bd}},
          React.createElement("div",{style:{fontSize:48,marginBottom:12}},"📅"),
          React.createElement("h3",{style:{margin:"0 0 8px",fontWeight:700}},"Nenhuma sessão agendada"),
          React.createElement("p",{style:{color:C.txM,fontSize:13}},"Crie sessões para agendar pacientes com profissionais")
        )
        :DIAS.map(function(dia){
          var diaItems = fil.filter(function(s){return s.dia===dia});
          if(diaItems.length===0) return null;
          return React.createElement("div",{key:dia,style:{marginBottom:24}},
            React.createElement("div",{style:{display:"flex",alignItems:"center",gap:10,marginBottom:10}},
              React.createElement("h3",{style:{margin:0,fontSize:16,fontWeight:700}},dia),
              React.createElement(Badge,{v:"pr"},diaItems.length+" sessão(ões)")
            ),
            React.createElement(Crd,{style:{padding:0,overflow:"hidden"}},
              React.createElement("table",{style:{width:"100%",borderCollapse:"collapse",fontSize:12}},
                React.createElement("thead",null,React.createElement("tr",{style:{borderBottom:"2px solid "+C.bd}},
                  ["Horário","Paciente","Tratamento","Profissional","Status","Sala","Ações"].map(function(h){
                    return React.createElement("th",{key:h,style:{padding:"10px 12px",textAlign:"left",fontSize:10,fontWeight:700,color:C.txL,textTransform:"uppercase"}},h);
                  })
                )),
                React.createElement("tbody",null,diaItems.map(function(s,i){
                  var pac=data.pacientes.find(function(p){return p.id===s.pacienteId});
                  var prof=data.profissionais.find(function(p){return p.id===s.profissionalId});
                  var trat=data.tratamentos.find(function(t){return t.id===s.tratamentoId});
                  var sala=data.salas.find(function(sl){return sl.id===s.salaId});
                  var isAguardando = s.status==="aguardando";
                  var semProf = !s.profissionalId;
                  var semSala = !s.salaId;
                  var bg = isAguardando?C.wrBg:i%2===0?"#fff":C.bg;

                  return React.createElement("tr",{key:s.id,style:{borderBottom:"1px solid "+C.bd,background:bg}},
                    React.createElement("td",{style:{padding:"9px 12px",fontFamily:"monospace",fontWeight:600,fontSize:11}},(s.horaInicio||"")+" às "+(s.horaFim||"")),
                    React.createElement("td",{style:{padding:"9px 12px",fontWeight:600}},pac?pac.nome:"—"),
                    React.createElement("td",{style:{padding:"9px 12px"}},trat?React.createElement(Badge,{v:"pp"},trat.nome):React.createElement("span",{style:{color:C.txL}},"—")),
                    React.createElement("td",{style:{padding:"9px 12px",fontWeight:semProf?700:500,color:semProf?C.wr:C.tx}},
                      semProf
                        ?React.createElement("span",{style:{color:C.wr}},"⏳ Aguardando")
                        :prof?prof.nome:"—"
                    ),
                    React.createElement("td",{style:{padding:"9px 12px"}},
                      isAguardando
                        ?React.createElement("div",{style:{display:"flex",flexDirection:"column",gap:2}},
                          semProf&&React.createElement(Badge,{v:"wr"},"Aguard. Profissional"),
                          semSala&&React.createElement(Badge,{v:"ac"},"Aguard. Sala")
                        )
                        :React.createElement(Badge,{v:"ok"},"Confirmado")
                    ),
                    React.createElement("td",{style:{padding:"9px 12px",color:semSala?C.wr:C.txM,fontSize:11,fontWeight:semSala?700:400}},sala?"Sala "+sala.numero:React.createElement("span",{style:{color:C.wr}},"⏳ Sem sala")),
                    React.createElement("td",{style:{padding:"9px 12px"}},
                      React.createElement("div",{style:{display:"flex",gap:4}},
                        React.createElement(Btn,{v:"df",sz:"sm",onClick:function(){
                          setEdit(Object.assign({},s));
                          setModal("sessao");
                        }},"✏️")
                      )
                    )
                  );
                }))
              )
            )
          );
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
          React.createElement(Btn,{v:"df",onClick:function(){setImportMode("pacientes")}},"📥 Importar"),
          React.createElement(Btn,{v:"pri",onClick:function(){setEdit({nome:"",nivel:"Nível 1",obs:"",convenio:"",sessoesLiberadas:{},prios:["","",""],status:"Ativo"});setModal("pac")}},"+ Paciente")
        )
      ),
      data.pacientes.length>3&&React.createElement(Inp,{placeholder:"Buscar...",value:search,onChange:setSearch,style:{marginBottom:16,width:"100%"}}),
      data.pacientes.length===0?React.createElement(Crd,{style:{textAlign:"center",padding:40,border:"2px dashed "+C.bd}},React.createElement("p",{style:{color:C.txM,fontWeight:600}},"Nenhum paciente"))
      :React.createElement("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:14}},
        fil.map(function(pac){
          var pn=(pac.prios||[]).map(function(pid){var p=data.profissionais.find(function(x){return x.id===pid});return p?p.nome:"—"});
          var sesCount = data.sessoes.filter(function(s){return s.pacienteId===pac.id}).length;
          return React.createElement(Crd,{key:pac.id,style:{cursor:"pointer"},onClick:function(){setEdit(Object.assign({},pac,{prios:(pac.prios||["","",""]).slice(),sessoesLiberadas:JSON.parse(JSON.stringify(pac.sessoesLiberadas||{}))}));setModal("pac")}},
            React.createElement("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}},
              React.createElement("div",null,
                React.createElement("div",{style:{fontSize:15,fontWeight:700}},pac.nome),
                React.createElement("div",{style:{display:"flex",gap:6,marginTop:4,flexWrap:"wrap"}},
                  React.createElement(Badge,{v:(pac.status||"Ativo")==="Ativo"?"ok":(pac.status||"Ativo")==="Aguardando Contato"?"wr":"df"},pac.status||"Ativo"),
                  pac.nivel&&React.createElement(Badge,{v:pac.nivel==="Nível 3"?"er":pac.nivel==="Nível 2"?"wr":"ok"},pac.nivel),
                  pac.convenio&&React.createElement(Badge,{v:"tl"},pac.convenio),
                  React.createElement(Badge,{v:"bl"},sesCount+" sessão(ões)"),
                  function(){var sl=pac.sessoesLiberadas||{};var total=Object.values(sl).reduce(function(a,b){return a+(parseInt(b)||0)},0);return total>0?React.createElement(Badge,{v:"pp"},total+" liberada(s)"):null}()
                )
              ),
              null
            ),
            React.createElement("div",{style:{fontSize:10,color:C.txM,lineHeight:1.7}},
              React.createElement("div",null,React.createElement("b",null,"Prioridades: "),pn[0]," · ",pn[1]," · ",pn[2]),
              /* Show sessões liberadas summary */
              function(){
                var sl = pac.sessoesLiberadas||{};
                var parts = Object.keys(sl).filter(function(k){return sl[k]}).map(function(k){
                  var t=data.tratamentos.find(function(x){return x.id===k});
                  var agd=data.sessoes.filter(function(s){return s.pacienteId===pac.id&&s.tratamentoId===k}).length;
                  return (t?t.nome:k)+": "+agd+"/"+(sl[k]);
                });
                return parts.length>0?React.createElement("div",null,React.createElement("b",null,"Liberadas: "),parts.join(" · ")):null;
              }(),
              pac.obs&&React.createElement("div",{style:{marginTop:2,fontStyle:"italic"}},pac.obs)
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
        React.createElement("div",{style:{display:"flex",gap:8}},
          React.createElement(Btn,{v:"df",onClick:function(){setImportMode("profissionais")}},"📥 Importar"),
          React.createElement(Btn,{v:"pri",onClick:function(){setEdit({nome:"",tipo:"CLT",especialidades:[],disp:{},obs:"",dataAdmissao:"",dataDesligamento:""});setModal("prof")}},"+ Novo")
        )
      ),
      data.profissionais.length>3&&React.createElement(Inp,{placeholder:"Buscar...",value:search,onChange:setSearch,style:{marginBottom:16,width:"100%"}}),
      data.profissionais.length===0?React.createElement(Crd,{style:{textAlign:"center",padding:40,border:"2px dashed "+C.bd}},React.createElement("p",{style:{color:C.txM}},"Nenhum profissional"))
      :React.createElement("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:14}},
        fil.map(function(prof){
          /* Calcular horas por dia e total semanal */
          var horasPorDia = {};
          var totalMinSem = 0;
          function calcMinFaixas(faixas){
            return (faixas||[]).reduce(function(acc,f){
              if(!f.ini||!f.fim) return acc;
              if(typeof f==="string") return acc+50; /* legacy slot compat */
              var p1=f.ini.split(":"),p2=f.fim.split(":");
              var m1=parseInt(p1[0])*60+parseInt(p1[1]),m2=parseInt(p2[0])*60+parseInt(p2[1]);
              return acc+Math.max(0,m2-m1);
            },0);
          }
          DIAS.forEach(function(d){
            var faixas = prof.disp&&prof.disp[d]||[];
            var mins = calcMinFaixas(faixas);
            totalMinSem += mins;
            if(mins > 0) horasPorDia[d] = mins;
          });
          function fmtMin(m){var h=Math.floor(m/60);var mm=m%60;return h+"h"+(mm>0?mm+"m":"")}
          var vv=prof.tipo==="PJ fixo"?"pp":prof.tipo==="PJ hora"?"bl":prof.tipo==="Estagiário"?"wr":"df";
          var especs = (prof.especialidades||[]).join(", ")||"Nenhuma especialidade";
          var isDesligado = !!prof.dataDesligamento;
          var faltasProf = (data.historicoFaltas||[]).filter(function(f){return f.profissionalId===prof.id}).length;
          return React.createElement(Crd,{key:prof.id,style:{cursor:"pointer",opacity:isDesligado?0.5:1},onClick:function(){setEdit(Object.assign({},prof,{especialidades:(prof.especialidades||[]).slice(),disp:JSON.parse(JSON.stringify(prof.disp||{}))}));setModal("prof")}},
            React.createElement("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}},
              React.createElement("div",null,
                React.createElement("div",{style:{fontSize:15,fontWeight:700}},prof.nome),
                React.createElement("div",{style:{display:"flex",gap:6,marginTop:4,flexWrap:"wrap"}},
                  isDesligado&&React.createElement(Badge,{v:"er"},"Desligado"),
                  prof.bloqSessao&&React.createElement(Badge,{v:"er"},"🚫 Bloq. Sessões"),
                  React.createElement(Badge,{v:vv},prof.tipo),
                  React.createElement(Badge,{v:"bl"},fmtMin(totalMinSem)+"/sem"),
                  faltasProf>0&&React.createElement(Badge,{v:"er"},faltasProf+" falta(s)"),
                  prof.dataAdmissao&&React.createElement(Badge,{v:"ok"},"Adm: "+prof.dataAdmissao)
                )
              ),
              null
            ),
            React.createElement("div",{style:{fontSize:11,color:C.txM,marginBottom:4}},
              React.createElement("b",null,"Especialidades: "),especs
            ),
            null
          )
        })
      )
    );
  }

  /* ── Tratamentos ── */
  function rTratamentos(){
    return React.createElement("div",null,
      React.createElement("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}},
        React.createElement("div",null,
          React.createElement("h2",{style:{fontSize:24,fontWeight:800,margin:0}},"Tratamentos"),
          React.createElement("p",{style:{color:C.txM,fontSize:13,margin:"4px 0 0"}},data.tratamentos.length+" tratamento(s)")
        ),
        React.createElement(Btn,{v:"pri",onClick:function(){setEdit({nome:"",especialidades:[]});setModal("trat")}},"+ Novo Tratamento")
      ),
      React.createElement("div",{style:{marginBottom:20}},
        React.createElement(Crd,null,
          React.createElement("h4",{style:{margin:"0 0 10px",fontWeight:700,fontSize:14}},"Especialidades Disponíveis"),
          React.createElement("p",{style:{color:C.txM,fontSize:12,marginBottom:10}},"Estas especialidades podem ser atribuídas a profissionais e tratamentos."),
          React.createElement("div",{style:{display:"flex",flexWrap:"wrap",gap:6}},
            (data.especialidades||[]).map(function(e){
              return React.createElement(Badge,{key:e,v:"pp"},e);
            })
          ),
          React.createElement("div",{style:{display:"flex",gap:8,marginTop:12,alignItems:"flex-end"}},
            React.createElement(Inp,{label:"Nova Especialidade",value:search,onChange:setSearch,placeholder:"Ex: ABA"}),
            React.createElement(Btn,{v:"pri",sz:"sm",onClick:function(){
              if(search.trim() && (data.especialidades||[]).indexOf(search.trim())<0){
                persist(Object.assign({},data,{especialidades:(data.especialidades||[]).concat(search.trim())}));
                setSearch("");
              }
            },style:{marginBottom:0}},"+ Adicionar")
          )
        )
      ),
      data.tratamentos.length===0
        ?React.createElement(Crd,{style:{textAlign:"center",padding:40,border:"2px dashed "+C.bd}},React.createElement("p",{style:{color:C.txM}},"Nenhum tratamento"))
        :React.createElement("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:14}},
          data.tratamentos.map(function(trat){
            return React.createElement(Crd,{key:trat.id,style:{cursor:"pointer"},onClick:function(){setEdit(Object.assign({},trat,{especialidades:(trat.especialidades||[]).slice()}));setModal("trat")}},
              React.createElement("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}},
                React.createElement("div",null,
                  React.createElement("div",{style:{fontSize:15,fontWeight:700,marginBottom:6}},trat.nome),
                  React.createElement("div",{style:{display:"flex",flexWrap:"wrap",gap:4}},
                    (trat.especialidades||[]).map(function(e){return React.createElement(Badge,{key:e,v:"pp"},e)})
                  ),
                  (trat.especialidades||[]).length===0&&React.createElement("span",{style:{fontSize:11,color:C.txL}},"Nenhuma especialidade vinculada")
                ),
                null
              )
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
          null
        )})
      )
    );
  }

  /* ── Ausências ── */
  function rAus(){
    return React.createElement("div",null,
      React.createElement("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,flexWrap:"wrap",gap:10}},
        React.createElement("div",null,
          React.createElement("h2",{style:{fontSize:24,fontWeight:800,margin:0}},"Faltas"),
          React.createElement("p",{style:{color:C.txM,fontSize:13,margin:"4px 0 0"}},"Marque quem faltou — sessões confirmadas passam automaticamente para 'Aguardando Profissional'")
        ),
        ausN>0&&React.createElement(Btn,{v:"er",sz:"sm",onClick:clrAus},"Limpar faltas ("+ausN+")")
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
              React.createElement("td",{style:{padding:"10px 16px",fontWeight:600}},
                React.createElement("div",null,prof.nome),
                React.createElement("div",{style:{fontSize:10,color:C.txM}},(prof.especialidades||[]).join(", "))
              ),
              DIAS.map(function(d){
                var a=(data.ausencias||{})[prof.id+"-"+d];
                /* Check if prof has confirmed sessions this day */
                var hasSessions = data.sessoes.some(function(s){return s.profissionalId===prof.id && s.dia===d && s.status==="confirmado"});
                return React.createElement("td",{key:d,style:{padding:8,textAlign:"center"}},
                  React.createElement("div",{onClick:function(){togAus(prof.id,d)},style:{width:36,height:36,borderRadius:10,display:"inline-flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontWeight:700,fontSize:14,background:a?C.er:"#eeedea",color:a?"#fff":C.txL,border:a?"none":"1.5px solid "+(hasSessions?C.ok:C.bd),position:"relative"}},
                    a?"✗":"✓",
                    hasSessions&&!a&&React.createElement("div",{style:{position:"absolute",top:-3,right:-3,width:8,height:8,borderRadius:4,background:C.ok}})
                  )
                );
              })
            )
          }))
        )
      )
    );
  }

  /* ── Vínculos ── */
  function rVinculos(){
    var vinculos = data.vinculos || VINCULOS_DEFAULT;
    return React.createElement("div",null,
      React.createElement("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}},
        React.createElement("div",null,
          React.createElement("h2",{style:{fontSize:24,fontWeight:800,margin:0}},"Vínculos"),
          React.createElement("p",{style:{color:C.txM,fontSize:13,margin:"4px 0 0"}},vinculos.length+" tipo(s) de vínculo")
        )
      ),
      React.createElement(Crd,{style:{marginBottom:20}},
        React.createElement("div",{style:{display:"flex",gap:8,marginBottom:16,alignItems:"flex-end"}},
          React.createElement(Inp,{label:"Novo Vínculo",value:newVinc,onChange:setNewVinc,placeholder:"Ex: Temporário"}),
          React.createElement(Btn,{v:"pri",sz:"sm",onClick:function(){
            if(newVinc.trim() && vinculos.indexOf(newVinc.trim())<0){
              var nv = vinculos.concat(newVinc.trim());
              persist(Object.assign({},data,{vinculos:nv}));
              setNewVinc("");
              showToast("Vínculo adicionado!");
            }
          },style:{marginBottom:0}},"+ Adicionar")
        ),
        React.createElement("div",{style:{display:"flex",flexDirection:"column",gap:6}},
          vinculos.map(function(v){
            var count = data.profissionais.filter(function(p){return p.tipo===v}).length;
            return React.createElement("div",{key:v,style:{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:C.bg,borderRadius:8,border:"1px solid "+C.bd}},
              React.createElement("span",{style:{flex:1,fontSize:13,fontWeight:600}},v),
              React.createElement(Badge,{v:"bl"},count+" profissional(is)"),
              React.createElement(Btn,{v:"er",sz:"sm",disabled:count>0,onClick:function(){
                if(count>0){showToast("Não é possível remover: "+count+" profissional(is) usam este vínculo");return}
                var nv = vinculos.filter(function(x){return x!==v});
                var np = (data.prioVinculo||[]).filter(function(x){return x!==v});
                persist(Object.assign({},data,{vinculos:nv,prioVinculo:np}));
                showToast("Vínculo removido!");
              }},"🗑")
            );
          })
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
        React.createElement("p",{style:{color:C.txM,fontSize:12,marginBottom:14}},"Primeiro tipo é priorizado."),
        React.createElement(ReorderList,{items:data.prioVinculo||data.vinculos||VINCULOS_DEFAULT,onChange:function(v){persist(Object.assign({},data,{prioVinculo:v}))}})
      ),
      React.createElement(Crd,{style:{marginBottom:20}},
        React.createElement("h4",{style:{margin:"0 0 8px",fontWeight:700}},"Backup dos Dados"),
        React.createElement("p",{style:{color:C.txM,fontSize:12,marginBottom:14}},"Exporte todos os dados cadastrados em um arquivo JSON."),
        React.createElement(Btn,{v:"primary",onClick:function(){
          var json = JSON.stringify(data, null, 2);
          var blob = new Blob([json], {type: "application/json"});
          var url = URL.createObjectURL(blob);
          var a = document.createElement("a");
          a.href = url;
          a.download = "clinica-backup-" + new Date().toISOString().slice(0,10) + ".json";
          a.click();
          URL.revokeObjectURL(url);
          showToast("Backup exportado com sucesso!");
        }},"📥 Exportar Dados (JSON)")
      ),
      React.createElement(Crd,{style:{marginBottom:20,borderLeft:"4px solid "+C.bl}},
        React.createElement("h4",{style:{margin:"0 0 8px",fontWeight:700,color:C.bl}},"Importar Sessões (JSON)"),
        React.createElement("p",{style:{color:C.txM,fontSize:12,marginBottom:14}},"Importe sessões, pacientes e salas a partir de um arquivo JSON gerado pelo script de importação."),
        React.createElement("input",{ref:fileRef,type:"file",accept:".json",style:{display:"none"},onChange:function(e){
          var file=e.target.files[0];if(!file)return;
          var reader=new FileReader();
          reader.onload=function(ev){
            try{
              var imp=JSON.parse(ev.target.result);
              var nd=Object.assign({},data);
              /* Merge pacientes (skip duplicates by name) */
              var existNames=(nd.pacientes||[]).map(function(p){return p.nome.toLowerCase()});
              var newPacs=(imp.pacientes||[]).filter(function(p){return existNames.indexOf(p.nome.toLowerCase())<0});
              nd.pacientes=(nd.pacientes||[]).concat(newPacs);
              /* Merge salas (skip duplicates by numero) */
              var existNums=(nd.salas||[]).map(function(s){return s.numero});
              var newSalas=(imp.salas||[]).filter(function(s){return existNums.indexOf(s.numero)<0});
              nd.salas=(nd.salas||[]).concat(newSalas);
              /* Merge new tratamentos */
              var existTratIds=(nd.tratamentos||[]).map(function(t){return t.id});
              (imp.tratamentos||imp.newTratamentos||[]).forEach(function(t){if(existTratIds.indexOf(t.id)<0)nd.tratamentos.push(t)});
              /* Replace sessoes (remove old imported, add new) */
              nd.sessoes=imp.sessoes||[];
              persist(nd);
              showToast("✅ Importado: "+(imp.sessoes||[]).length+" sessões, "+newPacs.length+" pacientes, "+newSalas.length+" salas");
            }catch(err){showToast("❌ Erro ao importar: "+err.message)}
          };
          reader.readAsText(file);
          e.target.value="";
        }}),
        React.createElement(Btn,{v:"bl",onClick:function(){fileRef.current&&fileRef.current.click()}},"📂 Selecionar Arquivo JSON")
      ),
      React.createElement(Crd,{style:{borderLeft:"4px solid "+C.er}},
        React.createElement("h4",{style:{margin:"0 0 8px",fontWeight:700,color:C.er}},"Zona de Perigo"),
        React.createElement(Btn,{v:"er",onClick:function(){persist(getEmpty())}},"🔄 Resetar Tudo")
      )
    );
  }

  /* ── Modals ── */
  function rModals(){
    /* Available profs for session edit */
    var availProfs = [];
    var isPrioProf = {};
    var salaConflito = null;
    if(edit && modal==="sessao"){
      availProfs = getProfsParaSessao(edit);
      availProfs = sortProfsForPatient(availProfs, edit.pacienteId);
      var pac = data.pacientes.find(function(p){return p.id===edit.pacienteId});
      var prios = pac ? (pac.prios||[]).filter(Boolean) : [];
      prios.forEach(function(pid){ isPrioProf[pid]=true; });
      /* Check sala conflict */
      if(edit.salaId && edit.dia && edit.horaInicio && edit.horaFim){
        salaConflito = data.sessoes.find(function(s){
          if(s.id===edit.id) return false;
          if(s.salaId!==edit.salaId) return false;
          if(s.dia!==edit.dia) return false;
          return s.horaInicio < edit.horaFim && s.horaFim > edit.horaInicio;
        });
      }
    }

    return React.createElement(React.Fragment,null,
      /* Toast */
      toast&&React.createElement("div",{style:{position:"fixed",bottom:24,right:24,zIndex:2000,padding:"14px 24px",background:C.pri,color:"#fff",borderRadius:12,fontSize:13,fontWeight:600,boxShadow:"0 8px 30px rgba(0,0,0,.2)",maxWidth:400}},toast),

      /* Sessão */
      React.createElement(Mdl,{open:modal==="sessao",onClose:closeM,title:edit&&edit.id?"Editar Sessão":"Nova Sessão",wide:true},
        edit&&React.createElement("div",null,
          React.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:18}},
            React.createElement(Sel,{label:"Paciente",value:edit.pacienteId,onChange:function(v){setEdit(Object.assign({},edit,{pacienteId:v}))},options:data.pacientes.map(function(p){return{value:p.id,label:p.nome+(p.nivel?" ("+p.nivel+")":"")}}),placeholder:"Selecionar paciente"}),
            React.createElement(Sel,{label:"Dia da Semana",value:edit.dia,onChange:function(v){setEdit(Object.assign({},edit,{dia:v}))},options:DIAS,placeholder:false})
          ),
          React.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,marginBottom:18}},
            React.createElement(Sel,{label:"Hora Início",value:edit.horaInicio,onChange:function(v){setEdit(Object.assign({},edit,{horaInicio:v}))},options:HRS.map(function(h){return{value:h,label:h}}),placeholder:false}),
            React.createElement(Sel,{label:"Hora Fim",value:edit.horaFim,onChange:function(v){setEdit(Object.assign({},edit,{horaFim:v}))},options:HRS.filter(function(h){return h>(edit.horaInicio||"08:00")}).map(function(h){return{value:h,label:h}}),placeholder:false}),
            React.createElement(Sel,{label:"Tratamento",value:edit.tratamentoId,onChange:function(v){setEdit(Object.assign({},edit,{tratamentoId:v,profissionalId:""}))},options:data.tratamentos.map(function(t){return{value:t.id,label:t.nome}}),placeholder:"Selecionar tratamento"})
          ),
          /* Info de sessões liberadas */
          function(){
            if(!edit.pacienteId || !edit.tratamentoId) return null;
            var pac = data.pacientes.find(function(p){return p.id===edit.pacienteId});
            if(!pac) return null;
            var sl = pac.sessoesLiberadas||{};
            var max = parseInt(sl[edit.tratamentoId])||0;
            if(max===0) return null;
            var trat = data.tratamentos.find(function(t){return t.id===edit.tratamentoId});
            var agd = data.sessoes.filter(function(s){return s.pacienteId===edit.pacienteId && s.tratamentoId===edit.tratamentoId && (!edit.id || s.id!==edit.id)}).length;
            var over = agd >= max;
            return React.createElement("div",{style:{padding:12,background:over?C.erBg:C.blBg,borderRadius:10,marginBottom:18,border:"1px solid "+(over?C.er+"44":C.bl+"44")}},
              React.createElement("div",{style:{fontSize:12,fontWeight:700,color:over?C.er:C.bl}},
                over?"⚠️ Limite atingido! ":"ℹ️ ",
                (trat?trat.nome:"")," — ",pac.convenio?pac.convenio+": ":"",
                "Liberadas: ",max," · Agendadas: ",agd,over?" (esta sessão excede o limite)":""
              )
            );
          }(),
          React.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:18}},
            React.createElement("div",null,
              React.createElement("label",{style:{fontSize:11,fontWeight:600,color:C.txM,textTransform:"uppercase",letterSpacing:.5,display:"block",marginBottom:4}},"Profissional"),
              availProfs.length>0
                ?React.createElement("select",{value:edit.profissionalId||"",onChange:function(e){setEdit(Object.assign({},edit,{profissionalId:e.target.value}))},style:{padding:"8px 12px",border:"1.5px solid "+C.bd,borderRadius:8,fontSize:13,outline:"none",background:C.bg,cursor:"pointer",width:"100%"}},
                  React.createElement("option",{value:""},"— Sem profissional (Aguardando) —"),
                  availProfs.map(function(prof){
                    var isPrio = isPrioProf[prof.id];
                    return React.createElement("option",{key:prof.id,value:prof.id},(isPrio?"⭐ ":"")+prof.nome+" ("+prof.tipo+")"+(isPrio?" — Prioritário":""));
                  })
                )
                :React.createElement("div",{style:{padding:12,background:C.wrBg,borderRadius:8,fontSize:12,color:C.wr}},
                  edit.tratamentoId
                    ?"Nenhum profissional disponível com a especialidade necessária neste horário. A sessão será salva como 'Aguardando Profissional Disponível'."
                    :"Selecione um tratamento para filtrar profissionais."
                )
            ),
            React.createElement(Sel,{label:"Sala",value:edit.salaId||"",onChange:function(v){setEdit(Object.assign({},edit,{salaId:v}))},options:data.salas.map(function(s){
              var ocupada=edit.dia&&edit.horaInicio&&edit.horaFim&&data.sessoes.some(function(ss){
                if(ss.id===edit.id)return false;if(ss.salaId!==s.id)return false;if(ss.dia!==edit.dia)return false;
                return ss.horaInicio<edit.horaFim&&ss.horaFim>edit.horaInicio;
              });
              return{value:s.id,label:"Sala "+s.numero+" ("+s.andar+")"+(ocupada?" — OCUPADA":"")}
            }),placeholder:"Opcional"})
          ),
          salaConflito&&function(){
            var pacC=data.pacientes.find(function(p){return p.id===salaConflito.pacienteId});
            var salaC=data.salas.find(function(s){return s.id===salaConflito.salaId});
            return React.createElement("div",{style:{padding:12,background:C.erBg,borderRadius:10,marginBottom:18,border:"1px solid "+C.er+"44"}},
              React.createElement("div",{style:{fontSize:13,fontWeight:700,color:C.er}},"⚠️ Sala "+(salaC?salaC.numero:"")+" já está ocupada!"),
              React.createElement("div",{style:{fontSize:12,color:C.er,marginTop:4}},
                (pacC?pacC.nome:"Outra sessão")+" — "+salaConflito.dia+" "+salaConflito.horaInicio+"–"+salaConflito.horaFim
              )
            );
          }(),
          (edit.profissionalId===""||!edit.salaId)&&edit.tratamentoId&&React.createElement("div",{style:{padding:14,background:C.wrBg,borderRadius:10,marginBottom:18}},
            React.createElement("div",{style:{fontSize:13,fontWeight:700,color:C.wr,marginBottom:4}},"⏳ Status: Aguardando"),
            edit.profissionalId===""&&React.createElement("div",{style:{fontSize:12,color:C.wr}},"• Sem profissional — sessão ficará como 'Aguardando Profissional Disponível'."),
            !edit.salaId&&React.createElement("div",{style:{fontSize:12,color:C.wr}},"• Sem sala — sessão ficará como 'Aguardando Sala Disponível'.")
          ),
          React.createElement("div",{style:{marginBottom:18}},
            React.createElement(Inp,{label:"Observações",value:edit.obs||"",onChange:function(v){setEdit(Object.assign({},edit,{obs:v}))}})
          ),
          React.createElement("div",{style:{display:"flex",gap:10,justifyContent:"space-between"}},
            edit.id?React.createElement(Btn,{v:"er",onClick:function(){if(confirm("Tem certeza que deseja excluir esta sessão?")){delSessao(edit.id);closeM()}}},"🗑 Excluir"):React.createElement("div",null),
            React.createElement("div",{style:{display:"flex",gap:10}},
              React.createElement(Btn,{v:"df",onClick:closeM},"Cancelar"),
              React.createElement(Btn,{v:"pri",onClick:function(){saveSessao(edit)},disabled:!edit.pacienteId||!edit.dia||!edit.horaInicio||!edit.horaFim},"Salvar Sessão")
            )
          )
        )
      ),

      /* Paciente */
      React.createElement(Mdl,{open:modal==="pac",onClose:closeM,title:edit&&edit.id?"Editar Paciente":"Novo Paciente",wide:true},
        edit&&React.createElement("div",null,
          React.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:14,marginBottom:18}},
            React.createElement(Inp,{label:"Nome",value:edit.nome,onChange:function(v){setEdit(Object.assign({},edit,{nome:v}))},placeholder:"Ex: Lucas"}),
            React.createElement(Sel,{label:"Nível",value:edit.nivel||"",onChange:function(v){setEdit(Object.assign({},edit,{nivel:v}))},options:["Nível 1","Nível 2","Nível 3"]}),
            React.createElement(Inp,{label:"Convênio",value:edit.convenio||"",onChange:function(v){setEdit(Object.assign({},edit,{convenio:v}))},placeholder:"Ex: Unimed, Amil..."}),
            React.createElement(Sel,{label:"Status",value:edit.status||"Ativo",onChange:function(v){setEdit(Object.assign({},edit,{status:v}))},options:STATUS_PACIENTE,placeholder:false})
          ),
          React.createElement("div",{style:{marginBottom:18}},
            React.createElement(Inp,{label:"Observações",value:edit.obs||"",onChange:function(v){setEdit(Object.assign({},edit,{obs:v}))},placeholder:"Anotações"})
          ),
          /* Sessões liberadas por tratamento */
          React.createElement("div",{style:{marginBottom:18}},
            React.createElement("label",{style:{fontSize:11,fontWeight:600,color:C.txM,textTransform:"uppercase",letterSpacing:.5,display:"block",marginBottom:4}},"Sessões Liberadas pelo Convênio"),
            React.createElement("p",{style:{fontSize:11,color:C.txL,marginBottom:8}},"Informe quantas sessões o convênio libera para cada tratamento. Esse valor aparece ao criar sessões como referência."),
            React.createElement("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:8}},
              data.tratamentos.map(function(trat){
                var liberadas = (edit.sessoesLiberadas||{})[trat.id]||"";
                /* Count how many sessions already scheduled for this patient+treatment */
                var agendadas = data.sessoes.filter(function(s){return s.pacienteId===edit.id && s.tratamentoId===trat.id}).length;
                var maxNum = parseInt(liberadas)||0;
                var overLimit = maxNum > 0 && agendadas >= maxNum;
                return React.createElement("div",{key:trat.id,style:{padding:"8px 10px",background:overLimit?C.erBg:liberadas?C.prBg:C.bg,borderRadius:8,border:"1px solid "+(overLimit?C.er:liberadas?C.pri+"44":C.bd)}},
                  React.createElement("div",{style:{fontSize:11,fontWeight:600,color:overLimit?C.er:C.tx,marginBottom:4}},trat.nome),
                  React.createElement("div",{style:{display:"flex",alignItems:"center",gap:6}},
                    React.createElement("input",{type:"number",min:"0",value:liberadas,onChange:function(e){
                      var sl=Object.assign({},edit.sessoesLiberadas||{});
                      sl[trat.id]=e.target.value;
                      setEdit(Object.assign({},edit,{sessoesLiberadas:sl}));
                    },placeholder:"—",style:{width:50,padding:"4px 6px",border:"1px solid "+C.bd,borderRadius:6,fontSize:12,textAlign:"center",background:"#fff"}}),
                    React.createElement("span",{style:{fontSize:10,color:overLimit?C.er:C.txM}},agendadas>0?agendadas+"/"+( maxNum||"∞")+" agendada(s)":"")
                  )
                );
              })
            )
          ),
          React.createElement("div",{style:{marginBottom:18}},
            React.createElement("label",{style:{fontSize:11,fontWeight:600,color:C.txM,textTransform:"uppercase",letterSpacing:.5,display:"block",marginBottom:8}},"Prioridade de Profissionais (1ª, 2ª, 3ª)"),
            React.createElement("p",{style:{fontSize:11,color:C.txL,marginBottom:8}},"Esses profissionais aparecerão primeiro (com ⭐) na seleção de profissional ao criar sessões."),
            React.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}},
              [0,1,2].map(function(i){return React.createElement(Sel,{key:i,label:(i+1)+"ª Opção",value:(edit.prios||[])[i]||"",onChange:function(v){var p=(edit.prios||["","",""]).slice();p[i]=v;setEdit(Object.assign({},edit,{prios:p}))},options:data.profissionais.map(function(p){return{value:p.id,label:p.nome}}),placeholder:"Selecionar"})})
            )
          ),
          React.createElement("div",{style:{display:"flex",gap:10,justifyContent:"space-between"}},
            edit.id?React.createElement(Btn,{v:"er",onClick:function(){if(confirm("Tem certeza que deseja excluir este paciente?")){delPac(edit.id);closeM()}}},"🗑 Excluir"):React.createElement("div",null),
            React.createElement("div",{style:{display:"flex",gap:10}},
              React.createElement(Btn,{v:"df",onClick:closeM},"Cancelar"),
              React.createElement(Btn,{v:"pri",onClick:function(){savePac(edit)},disabled:!edit.nome},"Salvar")
            )
          )
        )
      ),

      /* Profissional */
      React.createElement(Mdl,{open:modal==="prof",onClose:closeM,title:edit&&edit.id?"Editar Profissional":"Novo Profissional",wide:true},
        edit&&React.createElement("div",null,
          React.createElement("div",{style:{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",gap:14,marginBottom:18}},
            React.createElement(Inp,{label:"Nome",value:edit.nome,onChange:function(v){setEdit(Object.assign({},edit,{nome:v}))},placeholder:"Ex: Ana"}),
            React.createElement(Sel,{label:"Vínculo",value:edit.tipo,onChange:function(v){setEdit(Object.assign({},edit,{tipo:v}))},options:(data.vinculos||VINCULOS_DEFAULT).map(function(v){return{value:v,label:v}})}),
            React.createElement(Inp,{label:"Data Admissão",type:"date",value:edit.dataAdmissao||"",onChange:function(v){setEdit(Object.assign({},edit,{dataAdmissao:v}))}}),
            React.createElement(Inp,{label:"Data Desligamento",type:"date",value:edit.dataDesligamento||"",onChange:function(v){setEdit(Object.assign({},edit,{dataDesligamento:v}))}})
          ),
          React.createElement("div",{style:{marginBottom:18}},
            React.createElement(MultiChip,{label:"Especialidades",value:edit.especialidades||[],onChange:function(v){setEdit(Object.assign({},edit,{especialidades:v}))},options:data.especialidades||[]})
          ),
          React.createElement("div",{style:{marginBottom:18}},React.createElement(Inp,{label:"Observações",value:edit.obs||"",onChange:function(v){setEdit(Object.assign({},edit,{obs:v}))}})),
          React.createElement("div",{style:{display:"flex",alignItems:"center",gap:10,marginBottom:18,padding:"10px 14px",background:edit.bloqSessao?C.erBg:C.scBg,borderRadius:10,border:"1px solid "+(edit.bloqSessao?C.er+"44":C.sc+"44"),cursor:"pointer"},onClick:function(){setEdit(Object.assign({},edit,{bloqSessao:!edit.bloqSessao}))}},
            React.createElement("div",{style:{width:40,height:22,borderRadius:11,background:edit.bloqSessao?C.er:C.sc,position:"relative",transition:"background .2s"}},
              React.createElement("div",{style:{width:18,height:18,borderRadius:9,background:"#fff",position:"absolute",top:2,left:edit.bloqSessao?20:2,transition:"left .2s"}})
            ),
            React.createElement("div",null,
              React.createElement("div",{style:{fontSize:13,fontWeight:600,color:edit.bloqSessao?C.er:C.sc}},edit.bloqSessao?"🚫 Bloqueado para sessões":"✅ Disponível para sessões"),
              React.createElement("div",{style:{fontSize:11,color:C.txL}},edit.bloqSessao?"Esta pessoa NÃO aparecerá como opção ao criar sessões":"Esta pessoa aparecerá normalmente nas opções de sessão")
            )
          ),
          React.createElement("div",{style:{marginBottom:18}},
            React.createElement("label",{style:{fontSize:11,fontWeight:600,color:C.txM,textTransform:"uppercase",letterSpacing:.5,display:"block",marginBottom:8}},"Disponibilidade"),
            React.createElement("p",{style:{fontSize:11,color:C.txL,marginBottom:8}},"Adicione faixas de horário para cada dia."),
            React.createElement(DispEditor,{value:edit.disp||{},onChange:function(v){setEdit(Object.assign({},edit,{disp:v}))}})
          ),
          /* Histórico de faltas */
          function(){
            if(!edit.id) return null;
            var faltas = (data.historicoFaltas||[]).filter(function(f){return f.profissionalId===edit.id});
            if(faltas.length===0) return null;
            return React.createElement("div",{style:{marginBottom:18}},
              React.createElement("label",{style:{fontSize:11,fontWeight:600,color:C.txM,textTransform:"uppercase",letterSpacing:.5,display:"block",marginBottom:8}},"Histórico de Faltas ("+faltas.length+")"),
              React.createElement("div",{style:{maxHeight:150,overflowY:"auto",background:C.bg,borderRadius:8,border:"1px solid "+C.bd,padding:8}},
                faltas.slice().reverse().map(function(f){
                  return React.createElement("div",{key:f.id,style:{display:"flex",gap:8,alignItems:"center",padding:"4px 0",borderBottom:"1px solid "+C.bd,fontSize:11}},
                    React.createElement(Badge,{v:"er"},f.dia),
                    React.createElement("span",{style:{color:C.txM}},"Registrado em "+f.dataRegistro+" às "+f.horaRegistro)
                  );
                })
              )
            );
          }(),
          React.createElement("div",{style:{display:"flex",gap:10,justifyContent:"space-between"}},
            edit.id?React.createElement(Btn,{v:"er",onClick:function(){if(confirm("Tem certeza que deseja excluir este profissional?")){delProf(edit.id);closeM()}}},"🗑 Excluir"):React.createElement("div",null),
            React.createElement("div",{style:{display:"flex",gap:10}},
              React.createElement(Btn,{v:"df",onClick:closeM},"Cancelar"),
              React.createElement(Btn,{v:"pri",onClick:function(){saveProf(edit)},disabled:!edit.nome},"Salvar")
            )
          )
        )
      ),

      /* Tratamento */
      React.createElement(Mdl,{open:modal==="trat",onClose:closeM,title:edit&&edit.id?"Editar Tratamento":"Novo Tratamento"},
        edit&&React.createElement("div",null,
          React.createElement("div",{style:{marginBottom:18}},
            React.createElement(Inp,{label:"Nome do Tratamento",value:edit.nome,onChange:function(v){setEdit(Object.assign({},edit,{nome:v}))},placeholder:"Ex: Fonoaudiologia"})
          ),
          React.createElement("div",{style:{marginBottom:18}},
            React.createElement(MultiChip,{label:"Especialidades Necessárias",value:edit.especialidades||[],onChange:function(v){setEdit(Object.assign({},edit,{especialidades:v}))},options:data.especialidades||[]})
          ),
          React.createElement("div",{style:{display:"flex",gap:10,justifyContent:"space-between"}},
            edit.id?React.createElement(Btn,{v:"er",onClick:function(){if(confirm("Tem certeza que deseja excluir este tratamento?")){delTrat(edit.id);closeM()}}},"🗑 Excluir"):React.createElement("div",null),
            React.createElement("div",{style:{display:"flex",gap:10}},
              React.createElement(Btn,{v:"df",onClick:closeM},"Cancelar"),
              React.createElement(Btn,{v:"pri",onClick:function(){saveTrat(edit)},disabled:!edit.nome},"Salvar")
            )
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
            React.createElement(Inp,{label:"Descrição",value:edit.descricao||"",onChange:function(v){setEdit(Object.assign({},edit,{descricao:v}))},placeholder:"Ex: Sala sensorial..."})
          ),
          React.createElement("div",{style:{display:"flex",gap:10,justifyContent:"space-between"}},
            edit.id?React.createElement(Btn,{v:"er",onClick:function(){if(confirm("Tem certeza que deseja excluir esta sala?")){delSala(edit.id);closeM()}}},"🗑 Excluir"):React.createElement("div",null),
            React.createElement("div",{style:{display:"flex",gap:10}},
              React.createElement(Btn,{v:"df",onClick:closeM},"Cancelar"),
              React.createElement(Btn,{v:"pri",onClick:function(){saveSala(edit)},disabled:!edit.numero},"Salvar")
            )
          )
        )
      ),

      /* Import Modal */
      React.createElement(Mdl,{open:!!importMode,onClose:function(){setImportMode(null);setImportTxt("")},title:"Importar "+(importMode==="pacientes"?"Pacientes":"Profissionais"),wide:true},
        function(){
          var codeStyle={background:"#1a1a2e",color:"#e2e8f0",padding:"14px 16px",borderRadius:10,fontSize:11,fontFamily:"'Courier New',monospace",lineHeight:1.8,overflowX:"auto",whiteSpace:"pre",position:"relative"};
          var tagStyle={display:"inline-block",padding:"1px 7px",borderRadius:4,fontSize:10,fontWeight:700,marginRight:4};
          var fieldTag=function(label,color){return React.createElement("span",{style:Object.assign({},tagStyle,{background:color+"22",color:color})},label)};
          var sepStyle={color:"#f59e0b",fontWeight:800};
          var sep=React.createElement("span",{style:sepStyle}," ; ");
          var pipe=React.createElement("span",{style:{color:"#f472b6",fontWeight:800}}," | ");

          var EXEMPLO_PAC = "João Silva;Nível 2;Paciente novo\nMaria Souza;Nível 1;\nPedro Santos;Nível 3;Cadeirante";
          var EXEMPLO_PROF = "Ana Costa;CLT;Fonoaudiologia|Psicologia;Seg=MANHA|Ter=INTEGRAL|Qua=08:00,08:50,09:40;Atende manhãs\nCarlos Lima;PJ fixo;Fisioterapia;Seg=INTEGRAL|Ter=INTEGRAL|Qua=INTEGRAL|Qui=INTEGRAL|Sex=INTEGRAL;\nJulia Ramos;PJ hora;Terapia Ocupacional|Musicoterapia;Seg=TARDE|Qua=TARDE;Só tardes\nRenata Dias;Estagiário;Psicologia;Seg=MANHA|Ter=MANHA|Qua=MANHA;Em formação";

          function copyExample(){
            var txt = importMode==="pacientes" ? EXEMPLO_PAC : EXEMPLO_PROF;
            setImportTxt(txt);
            showToast("📋 Exemplo copiado para o campo!");
          }

          return React.createElement("div",null,
            /* ── FORMATO ── */
            React.createElement("div",{style:{padding:16,background:C.blBg,borderRadius:12,marginBottom:16,border:"1px solid "+C.bl+"33"}},
              React.createElement("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}},
                React.createElement("div",{style:{fontSize:14,fontWeight:700,color:C.bl}},"📋 Formato dos Campos"),
                React.createElement(Btn,{v:"bl",sz:"sm",onClick:copyExample},"📄 Usar Exemplo")
              ),

              importMode==="pacientes"
                /* ── PACIENTE FORMAT ── */
                ?React.createElement("div",null,
                  React.createElement("div",{style:{fontSize:12,color:C.tx,marginBottom:10}},"Uma linha por paciente, campos separados por ",React.createElement("code",{style:{background:"#f59e0b22",padding:"1px 5px",borderRadius:3,fontWeight:700,color:"#f59e0b"}},";")),
                  /* Field tags */
                  React.createElement("div",{style:{display:"flex",gap:4,flexWrap:"wrap",marginBottom:12}},
                    fieldTag("1. Nome","#2563eb"),
                    fieldTag("2. Nível","#0d9668"),
                    fieldTag("3. Observações","#6b7280")
                  ),
                  /* Visual code block */
                  React.createElement("div",{style:codeStyle},
                    React.createElement("div",{style:{color:"#64748b",marginBottom:6,fontSize:10}},"# Estrutura:"),
                    React.createElement("div",null,
                      React.createElement("span",{style:{color:"#60a5fa"}},"Nome"),sep,
                      React.createElement("span",{style:{color:"#34d399"}},"Nível"),sep,
                      React.createElement("span",{style:{color:"#94a3b8"}},"Observações")
                    ),
                    React.createElement("div",{style:{color:"#64748b",marginTop:10,marginBottom:6,fontSize:10}},"# Exemplos:"),
                    React.createElement("div",null,
                      React.createElement("span",{style:{color:"#60a5fa"}},"João Silva"),sep,
                      React.createElement("span",{style:{color:"#34d399"}},"Nível 2"),sep,
                      React.createElement("span",{style:{color:"#94a3b8"}},"Paciente novo")
                    ),
                    React.createElement("div",null,
                      React.createElement("span",{style:{color:"#60a5fa"}},"Maria Souza"),sep,
                      React.createElement("span",{style:{color:"#34d399"}},"Nível 1"),sep
                    ),
                    React.createElement("div",null,
                      React.createElement("span",{style:{color:"#60a5fa"}},"Pedro Santos"),sep,
                      React.createElement("span",{style:{color:"#34d399"}},"Nível 3"),sep,
                      React.createElement("span",{style:{color:"#94a3b8"}},"Cadeirante")
                    )
                  ),
                  React.createElement("div",{style:{marginTop:10,padding:"8px 12px",background:"#f0fdf4",borderRadius:8,border:"1px solid #bbf7d0"}},
                    React.createElement("div",{style:{fontSize:11,color:C.ok}},
                      React.createElement("b",null,"Níveis aceitos: "),"Nível 1, Nível 2, Nível 3"
                    )
                  )
                )

                /* ── PROFISSIONAL FORMAT ── */
                :React.createElement("div",null,
                  React.createElement("div",{style:{fontSize:12,color:C.tx,marginBottom:10}},"Uma linha por profissional, campos separados por ",React.createElement("code",{style:{background:"#f59e0b22",padding:"1px 5px",borderRadius:3,fontWeight:700,color:"#f59e0b"}},";")),
                  /* Field tags */
                  React.createElement("div",{style:{display:"flex",gap:4,flexWrap:"wrap",marginBottom:12}},
                    fieldTag("1. Nome","#2563eb"),
                    fieldTag("2. Vínculo","#7c3aed"),
                    fieldTag("3. Especialidades","#0d9668"),
                    fieldTag("4. Disponibilidade","#d35233"),
                    fieldTag("5. Observações","#6b7280")
                  ),
                  /* Visual code block */
                  React.createElement("div",{style:codeStyle},
                    React.createElement("div",{style:{color:"#64748b",marginBottom:6,fontSize:10}},"# Estrutura:"),
                    React.createElement("div",null,
                      React.createElement("span",{style:{color:"#60a5fa"}},"Nome"),sep,
                      React.createElement("span",{style:{color:"#a78bfa"}},"Vínculo"),sep,
                      React.createElement("span",{style:{color:"#34d399"}},"Espec1"),pipe,React.createElement("span",{style:{color:"#34d399"}},"Espec2"),sep,
                      React.createElement("span",{style:{color:"#fb923c"}},"Dia=HORÁRIOS"),pipe,React.createElement("span",{style:{color:"#fb923c"}},"Dia=HORÁRIOS"),sep,
                      React.createElement("span",{style:{color:"#94a3b8"}},"Obs")
                    ),
                    React.createElement("div",{style:{color:"#64748b",marginTop:12,marginBottom:6,fontSize:10}},"# Exemplos completos:"),
                    React.createElement("div",{style:{marginBottom:4}},
                      React.createElement("span",{style:{color:"#60a5fa"}},"Ana Costa"),sep,
                      React.createElement("span",{style:{color:"#a78bfa"}},"CLT"),sep,
                      React.createElement("span",{style:{color:"#34d399"}},"Fonoaudiologia"),pipe,React.createElement("span",{style:{color:"#34d399"}},"Psicologia"),sep,
                      React.createElement("span",{style:{color:"#fb923c"}},"Seg=MANHA"),pipe,React.createElement("span",{style:{color:"#fb923c"}},"Ter=INTEGRAL"),pipe,React.createElement("span",{style:{color:"#fb923c"}},"Qua=08:00,08:50,09:40"),sep,
                      React.createElement("span",{style:{color:"#94a3b8"}},"Atende manhãs")
                    ),
                    React.createElement("div",{style:{marginBottom:4}},
                      React.createElement("span",{style:{color:"#60a5fa"}},"Carlos Lima"),sep,
                      React.createElement("span",{style:{color:"#a78bfa"}},"PJ fixo"),sep,
                      React.createElement("span",{style:{color:"#34d399"}},"Fisioterapia"),sep,
                      React.createElement("span",{style:{color:"#fb923c"}},"Seg=INTEGRAL"),pipe,React.createElement("span",{style:{color:"#fb923c"}},"Ter=INTEGRAL"),pipe,React.createElement("span",{style:{color:"#fb923c"}},"Qua=INTEGRAL"),sep
                    ),
                    React.createElement("div",{style:{marginBottom:4}},
                      React.createElement("span",{style:{color:"#60a5fa"}},"Julia Ramos"),sep,
                      React.createElement("span",{style:{color:"#a78bfa"}},"PJ hora"),sep,
                      React.createElement("span",{style:{color:"#34d399"}},"Terapia Ocupacional"),pipe,React.createElement("span",{style:{color:"#34d399"}},"Musicoterapia"),sep,
                      React.createElement("span",{style:{color:"#fb923c"}},"Seg=TARDE"),pipe,React.createElement("span",{style:{color:"#fb923c"}},"Qua=TARDE"),sep,
                      React.createElement("span",{style:{color:"#94a3b8"}},"Só tardes")
                    ),
                    React.createElement("div",null,
                      React.createElement("span",{style:{color:"#60a5fa"}},"Renata Dias"),sep,
                      React.createElement("span",{style:{color:"#a78bfa"}},"Estagiário"),sep,
                      React.createElement("span",{style:{color:"#34d399"}},"Psicologia"),sep,
                      React.createElement("span",{style:{color:"#fb923c"}},"Seg=MANHA"),pipe,React.createElement("span",{style:{color:"#fb923c"}},"Ter=MANHA"),pipe,React.createElement("span",{style:{color:"#fb923c"}},"Qua=MANHA"),sep,
                      React.createElement("span",{style:{color:"#94a3b8"}},"Em formação")
                    )
                  ),
                  /* Reference cards */
                  React.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:12}},
                    React.createElement("div",{style:{padding:"10px 12px",background:"#fef3c7",borderRadius:8,border:"1px solid #fde68a"}},
                      React.createElement("div",{style:{fontSize:11,fontWeight:700,color:"#92400e",marginBottom:4}},"⏰ Atalhos de Horário"),
                      React.createElement("div",{style:{fontSize:10,color:"#92400e",lineHeight:1.7}},
                        React.createElement("div",null,React.createElement("code",{style:{background:"#92400e22",padding:"1px 4px",borderRadius:3}},"MANHA")," → 08:00, 08:50, 09:40, 10:30, 11:20"),
                        React.createElement("div",null,React.createElement("code",{style:{background:"#92400e22",padding:"1px 4px",borderRadius:3}},"TARDE")," → 13:00, 13:50, 14:40, 15:30, 16:20, 17:10"),
                        React.createElement("div",null,React.createElement("code",{style:{background:"#92400e22",padding:"1px 4px",borderRadius:3}},"INTEGRAL")," → Manhã + Tarde completos")
                      )
                    ),
                    React.createElement("div",{style:{padding:"10px 12px",background:"#ede9fe",borderRadius:8,border:"1px solid #ddd6fe"}},
                      React.createElement("div",{style:{fontSize:11,fontWeight:700,color:"#5b21b6",marginBottom:4}},"📌 Referências"),
                      React.createElement("div",{style:{fontSize:10,color:"#5b21b6",lineHeight:1.7}},
                        React.createElement("div",null,React.createElement("b",null,"Vínculos: "),"CLT, PJ fixo, PJ hora, Estagiário"),
                        React.createElement("div",null,React.createElement("b",null,"Dias: "),"Seg, Ter, Qua, Qui, Sex"),
                        React.createElement("div",null,React.createElement("b",null,"Separadores: "),React.createElement("code",{style:{background:"#5b21b622",padding:"1px 4px",borderRadius:3}},";")," entre campos, ",React.createElement("code",{style:{background:"#5b21b622",padding:"1px 4px",borderRadius:3}},"|")," entre valores")
                      )
                    )
                  )
                )
            ),

            /* ── FILE UPLOAD ── */
            React.createElement("div",{style:{marginBottom:18}},
              React.createElement("label",{style:{fontSize:11,fontWeight:600,color:C.txM,textTransform:"uppercase",letterSpacing:.5,display:"block",marginBottom:6}},"Carregar arquivo (.csv, .txt)"),
              React.createElement("input",{type:"file",accept:".csv,.txt,.tsv",onChange:function(e){handleFileUpload(importMode,e)},style:{fontSize:12,marginBottom:12}})
            ),

            /* ── TEXTAREA ── */
            React.createElement("div",{style:{marginBottom:18}},
              React.createElement("label",{style:{fontSize:11,fontWeight:600,color:C.txM,textTransform:"uppercase",letterSpacing:.5,display:"block",marginBottom:6}},"Ou cole/edite os dados aqui"),
              React.createElement("textarea",{value:importTxt,onChange:function(e){setImportTxt(e.target.value)},rows:8,style:{width:"100%",padding:12,border:"1.5px solid "+C.bd,borderRadius:8,fontSize:12,fontFamily:"'Courier New',monospace",outline:"none",background:C.bg,resize:"vertical",lineHeight:1.7}})
            ),

            /* ── PREVIEW ── */
            importTxt.trim()&&React.createElement("div",{style:{marginBottom:18,padding:14,background:"#f0fdf4",borderRadius:10,border:"1px solid #bbf7d0"}},
              React.createElement("div",{style:{fontSize:12,fontWeight:700,color:C.ok,marginBottom:8}},"👀 Preview — "+importTxt.trim().split("\n").filter(function(l){return l.trim()}).length+" linha(s) detectada(s)"),
              React.createElement("div",{style:{fontSize:11,color:C.tx,maxHeight:120,overflowY:"auto"}},
                importTxt.trim().split("\n").filter(function(l){return l.trim()}).slice(0,5).map(function(line,i){
                  var parts = line.split(/[;\t]/).map(function(s){return s.trim()});
                  return React.createElement("div",{key:i,style:{padding:"4px 0",borderBottom:"1px solid #d1fae5",display:"flex",gap:6,alignItems:"center"}},
                    React.createElement("span",{style:{fontWeight:700,color:C.ok,minWidth:20}},(i+1)+"."),
                    React.createElement("span",{style:{fontWeight:600}},parts[0]||"—"),
                    parts[1]&&React.createElement(Badge,{v:"df"},parts[1]),
                    importMode==="profissionais"&&parts[2]&&React.createElement(Badge,{v:"pp"},parts[2].split("|").length+" espec."),
                    importMode==="profissionais"&&parts[3]&&React.createElement(Badge,{v:"ac"},parts[3].split("|").length+" dia(s)")
                  )
                }),
                importTxt.trim().split("\n").filter(function(l){return l.trim()}).length>5&&React.createElement("div",{style:{padding:"4px 0",color:C.txM,fontStyle:"italic"}},"... e mais "+(importTxt.trim().split("\n").filter(function(l){return l.trim()}).length-5)+" linha(s)")
              )
            ),

            /* ── ACTIONS ── */
            React.createElement("div",{style:{display:"flex",gap:10,justifyContent:"flex-end"}},
              React.createElement(Btn,{v:"df",onClick:function(){setImportMode(null);setImportTxt("")}},"Cancelar"),
              React.createElement(Btn,{v:"pri",onClick:function(){handleImport(importMode)},disabled:!importTxt.trim()},"Importar "+(importTxt.trim()?importTxt.trim().split("\n").filter(function(l){return l.trim()}).length+" registro(s)":""))
            )
          );
        }()
      )
    );
  }

  /* ── RENDER ── */
  var content = null;
  if(tab==="dashboard")content=rDash();
  else if(tab==="sessoes")content=rSessoes();
  else if(tab==="pacientes")content=rPacs();
  else if(tab==="profissionais")content=rProfs();
  else if(tab==="tratamentos")content=rTratamentos();
  else if(tab==="salas")content=rSalas();
  else if(tab==="vinculos")content=rVinculos();
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
