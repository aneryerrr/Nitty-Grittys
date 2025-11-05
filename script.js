/* Nitty Gritty — Single-file React app (full build)
   Notes:
   - No features changed. Only bugfixes + legacy shim to stop handleFile crash.
   - Import reads CSV/XLS/XLSX with flexible column names.
   - “Best Strategy” restored (computed on CLOSED trades).
*/

const { useState, useEffect, useMemo, useRef } = React;

/* ---------------- Legacy shim (prevents crash if old markup calls handleFile) ---------------- */
window.__ngOpenImport = null;
window.handleFile = function() {
  try {
    if (typeof window.__ngOpenImport === "function") {
      window.__ngOpenImport();
    } else {
      console.warn("Importer not ready yet (legacy handleFile call).");
    }
  } catch (e) {
    console.warn("Legacy handleFile shim error:", e);
  }
};

/* ---------------- Icons ---------------- */
const iconCls = "h-5 w-5";
const IconUser = (p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Z"/><path d="M4 20a8 8 0 0 1 16 0Z"/></svg>);
const IconLogout=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M9 21h4a4 4 0 0 0 4-4V7a4 4 0 0 0-4-4H9"/><path d="M16 12H3"/><path d="M7 8l-4 4 4 4"/></svg>);
const IconDownload=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M12 3v10"/><path d="M8 11l4 4 4-4"/><path d="M5 21h14v-4H5Z"/></svg>);
const IconUpload=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M12 21V11"/><path d="M8 15l4-4 4 4"/><path d="M5 10V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3"/></svg>);
const IconCalendar=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M8 3v4M16 3v4"/><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18"/></svg>);
const IconPlus=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M12 5v14M5 12h14"/></svg>);
const IconHistory=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M12 8v5l3 3"/><path d="M12 3a9 9 0 1 0 9 9"/><path d="M21 3v6h-6"/></svg>);
const IconHome=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9v12h14V9"/></svg>);
/* Clean cog (visual only) */
const IconSettings=(p)=>(
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
       className={iconCls} {...p}>
    <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/>
    <path d="M19.4 15a2 2 0 0 0 .33 2.18l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A2 2 0 0 0 15 19.4a2 2 0 0 0-1 .6 2 2 0 0 0-.4 1V22a2 2 0 1 1-4 0v-.1a2 2 0 0 0-.4-1 2 2 0 0 0-1-.6 2 2 0 0 0-2.18.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A2 2 0 0 0 4.6 15a2 2 0 0 0-.6-1 2 2 0 0 0-1-.4H2a2 2 0 1 1 0-4h.1a2 2 0 0 0 1-.4 2 2 0 0 0 .6-1 2 2 0 0 0-.33-2.18l-.06-.06A2 2 0 1 1 6.24 2.9l.06.06A2 2 0 0 0 8 4.6a2 2 0 0 0 1-.6 2 2 0 0 0 .4-1V2a2 2 0 1 1 4 0v.1c0 .38.14.74.4 1 .26.26.62.4 1 .4.62 0 1.22-.25 1.64-.68l.06-.06A2 2 0 1 1 21.1 6.24l-.06.06c-.26.26-.4.62-.4 1s.14.74.4 1c.26.26.62.4 1 .4H22a2 2 0 1 1 0 4h-.1a2 2 0 0 0-1 .4 2 2 0 0 0-.6 1Z"/>
  </svg>
);

/* ---------------- Constants / helpers ---------------- */
const DEFAULT_SYMBOLS = ["XAUUSD","US100","US30","EURUSD","BTCUSD","AUDCAD","USDCAD","USDJPY","GBPUSD"];
const DEFAULT_STRATEGIES = [
  { name: "Trend Line Bounce", color: "default" },
  { name: "2 Touch Point Trend Line Break", color: "default" },
  { name: "3 / 3+ Touch Point Trend Line Break", color: "default" },
  { name: "Trend Line Break & Re-test", color: "default" },
  { name: "Trend Continuation", color: "default" }
];
const STRAT_COLORS = { default:"", green:"text-green-400", red:"text-red-400", mustard:"text-amber-400" };
const EXIT_TYPES = ["TP","SL","TP1_BE","TP1_SL","BE","Trade In Progress"];
const ACC_TYPES = ["Cent Account","Dollar Account"];

const USERS_KEY="ng_users_v1";
const CURR_KEY="ng_current_user_v1";
const STATE_KEY=(email)=>"ng_state_"+email;
const CFG_KEY=(email)=>"ng_cfg_"+email;

const r2=n=>Math.round(n*100)/100;
const fmt$=n=>"${0}".replace("0",(isFinite(n)?r2(n):0).toFixed(2));
const todayISO=()=>{const d=new Date();const tz=d.getTimezoneOffset();return new Date(d.getTime()-tz*60000).toISOString().slice(0,10)};

/* storage helpers */
const loadUsers=()=>{try{return JSON.parse(localStorage.getItem(USERS_KEY)||"[]")}catch{return[]}};
const saveUsers=(u)=>{try{localStorage.setItem(USERS_KEY,JSON.stringify(u))}catch{}};
const getCurrent=()=>{try{return localStorage.getItem(CURR_KEY)||""}catch{return""}};
const saveCurrent=(e)=>{try{localStorage.setItem(CURR_KEY,e)}catch{}};
const loadState=(e)=>{try{return JSON.parse(localStorage.getItem(STATE_KEY(e))||"null")}catch{return null}};
const saveState=(e,s)=>{try{localStorage.setItem(STATE_KEY(e),JSON.stringify(s))}catch{}};
const loadCfg=(e)=>{try{return JSON.parse(localStorage.getItem(CFG_KEY(e))||"null")}catch{return null}};
const saveCfg=(e,c)=>{try{localStorage.setItem(CFG_KEY(e),JSON.stringify(c))}catch{}};

/* ----- P&L logic (unchanged behavior) ----- */
function perLotValueForMove(symbol,delta,accType){
  const abs=Math.abs(delta); const isStd=accType==="Dollar Account"; const mult=std=>isStd?std:std/100;
  switch(symbol){
    case "US30":
    case "US100": return abs*mult(10);
    case "XAUUSD": return abs*mult(100);
    case "BTCUSD": return abs*mult(1);
    case "EURUSD":
    case "GBPUSD": { const pips=abs/0.0001; return pips*mult(10); }
    case "AUDCAD":
    case "USDCAD": { const pips=abs/0.0001; return pips*mult(7.236); }
    case "USDJPY": { const pips=abs/0.01; return pips*mult(6.795); }
    default: return 0;
  }
}
function legPnL(symbol,side,entry,exit,lot,accType){
  const raw=perLotValueForMove(symbol,exit-entry,accType)*(lot||0);
  const s=side==="BUY"?Math.sign(exit-entry):-Math.sign(exit-entry);
  return raw*s;
}
function computeDollarPnL(t,accType){
  if (typeof t.pnlOverride === "number" && isFinite(t.pnlOverride)) return t.pnlOverride;
  if (t.exitType === "Trade In Progress") return null;
  const has=n=>typeof n==="number"&&isFinite(n);
  const { entry, exit, tp1, tp2, sl, lotSize: lot } = t;
  if (has(exit) && (!t.exitType || t.exitType==="TP")) return legPnL(t.symbol,t.side,entry,exit,lot,accType);
  switch(t.exitType){
    case "SL": if(!has(sl)) return null; return legPnL(t.symbol,t.side,entry,sl,lot,accType);
    case "TP": if(has(tp2)) return legPnL(t.symbol,t.side,entry,tp2,lot,accType);
               if(has(tp1)) return legPnL(t.symbol,t.side,entry,tp1,lot,accType);
               return null;
    case "TP1_BE": if(!has(tp1)) return null; return (legPnL(t.symbol,t.side,entry,tp1,lot,accType)+0)/2;
    case "TP1_SL": if(!has(tp1)||!has(sl)) return null; return (legPnL(t.symbol,t.side,entry,tp1,lot,accType)+legPnL(t.symbol,t.side,entry,sl,lot,accType))/2;
    case "BE": return 0;
    default: return null;
  }
}
const formatUnits=(accType,v)=>accType==="Dollar Account"?r2(v).toFixed(2):r2(v*100).toFixed(2);

/* ----- CSV/XLS import (robust mapping) ----- */
const normKey = k => (k||'').toString().toLowerCase().replace(/[^a-z0-9]/g,'');
const toNumber = v => {
  if (v===undefined||v===null||v==='') return undefined;
  if (typeof v === 'number') return Number.isFinite(v)?v:undefined;
  let s=String(v).trim();
  if (/^[-–—]$/.test(s)) return undefined;
  if (/^\d{1,3}(\.\d{3})*,\d+$/.test(s)) s=s.replace(/\./g,'').replace(',', '.');
  else s=s.replace(/,/g,'');
  s=s.replace(/[^\d.\-]/g,'');
  if (s===''||s==='-'||s==='.') return undefined;
  const n=parseFloat(s);
  return Number.isFinite(n)?n:undefined;
};
function splitCSVLine(line){
  const out=[], n=line.length; let i=0,q=false, cur='';
  while(i<n){
    const c=line[i];
    if(q){
      if(c=='"' && line[i+1]=='"'){ cur+='"'; i+=2; continue; }
      if(c=='"'){ q=false; i++; continue; }
      cur+=c; i++; continue;
    }else{
      if(c=='"'){ q=true; i++; continue; }
      if(c==','){ out.push(cur); cur=''; i++; continue; }
      cur+=c; i++; continue;
    }
  }
  out.push(cur); return out;
}
function csvToRows(text){
  const t=text.replace(/^\uFEFF/,'');
  const lines=t.split(/\r?\n/).filter(l=>l.trim().length);
  if(!lines.length) return [];
  const headers=splitCSVLine(lines[0]).map(h=>h.trim());
  return lines.slice(1).map(line=>{
    const cells=splitCSVLine(line), o={};
    headers.forEach((h,i)=>o[h]=(cells[i]??'').trim());
    return o;
  });
}
function pick(row, aliases){
  const map={};
  for (const [k,v] of Object.entries(row||{})) map[normKey(k)]=v;
  for (const a of aliases){
    const v = map[normKey(a)];
    if (v !== undefined && v !== '') return v;
  }
  return undefined;
}
function rowsToTrades(rows){
  return rows.map(r=>{
    const date      = pick(r, ['Date','Trade Date','date']);
    const symbol    = pick(r, ['Symbol','Pair','Instrument','Asset','Ticker','symbol']);
    const sideRaw   = pick(r, ['Side','Direction','Action','Buy/Sell','Position','side']);
    const lot       = pick(r, ['Lot Size','Lots','Lot','Quantity','Qty','Size','lotsize']);
    const entry     = pick(r, ['Entry','Entry Price','Open','Open Price','entry']);
    const exit      = pick(r, ['Exit','Exit Price','Close','Close Price','exit']);
    const tp1       = pick(r, ['TP1','Take Profit 1','TP 1','tp1']);
    const tp2       = pick(r, ['TP2','Take Profit 2','TP 2','tp2']);
    const sl        = pick(r, ['SL','Stop Loss','Stop','sl']);
    const strategy  = pick(r, ['Strategy','Setup','Playbook','strategy']);
    const exitTypeR = pick(r, ['Exit Type','Status','Outcome','Result','exittype']);

    const normSide = (sideRaw||'').toString().toUpperCase().includes('SELL') ? 'SELL' : 'BUY';
    const et = (exitTypeR||'').toString().toLowerCase().replace(/\s/g,'');
    let exitType = 'Trade In Progress';
    if (['tp','takeprofit','target','tp2','tp1','tp1_be','tp1be'].includes(et)) exitType = et.startsWith('tp1') ? 'TP1_BE' : 'TP';
    if (['sl','stop','stoploss'].includes(et)) exitType = 'SL';
    if (['be','breakeven'].includes(et)) exitType = 'BE';
    if (['tp1sl','tp1_sl'].includes(et)) exitType = 'TP1_SL';
    if (['closed','done','finished'].includes(et)) exitType = 'TP';

    const id=Math.random().toString(36).slice(2);
    return {
      id,
      date: (date||todayISO()).toString().slice(0,10),
      symbol: (symbol||'').toString().toUpperCase(),
      side: normSide,
      lotSize: toNumber(lot) ?? 0.01,
      entry: toNumber(entry),
      exit: toNumber(exit),
      tp1: toNumber(tp1),
      tp2: toNumber(tp2),
      sl: toNumber(sl),
      strategy: strategy || DEFAULT_STRATEGIES[0].name,
      exitType
    };
  });
}
function toCSV(rows,accType){
  const H=["Date","Symbol","Side","Lot Size","Entry","Exit","TP1","TP2","SL","Strategy","Exit Type","P&L","P&L (Units)"];
  const NL="\n"; const BOM="﻿";
  const esc=s=>{if(s===null||s===undefined)return"";const v=String(s);return /[",\n]/.test(v)?`"${v.replace(/"/g,'""')}"`:v};
  const out=[H.join(",")];
  for(const t of rows){
    const v=computeDollarPnL(t,accType); const units=v===null?"":formatUnits(accType,v);
    const dollars=v===null?"":r2(v);
    const row=[t.date,t.symbol,t.side,t.lotSize,(t.entry??""),(t.exit??""),(t.tp1??""),(t.tp2??""),(t.sl??""),t.strategy,(t.exitType||""),dollars,units];
    out.push(row.map(esc).join(","));
  }
  return BOM+out.join(NL);
}

/* ---------------- Small UI helpers ---------------- */
function Stat({label,value,sub}){return(
  <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-3">
    <div className="text-slate-400 text-xs">{label}</div>
    <div className="text-2xl font-bold mt-1">{value}</div>
    {sub && <div className="text-xs text-slate-400 mt-1">{sub}</div>}
  </div>
)}
function Th(props){return <th {...props} className={"px-4 py-3 text-left font-semibold text-slate-300 " + (props.className||"")} />}
function Td(props){return <td {...props} className={"px-4 py-3 align-top " + (props.className||"")} />}

function Modal({title,children,onClose,maxClass}){
  return(
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-3">
      <div className={`relative w-[95vw] ${maxClass||"max-w-3xl"} max-h-[80vh] overflow-auto bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl`}>
        <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-slate-800/95 backdrop-blur">
          <div className="font-semibold">{title}</div>
          <button onClick={onClose} className="px-3 py-1.5 rounded-lg border border-slate-600 hover:bg-slate-700">✕</button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}

/* ---------------- Error Boundary ---------------- */
class ErrorBoundary extends React.Component{
  constructor(p){super(p);this.state={err:null}}
  static getDerivedStateFromError(e){return{err:e}}
  componentDidCatch(e,info){console.error("View crash:",e,info)}
  render(){
    if(this.state.err) return <div className="p-4 text-red-300 bg-red-950/30 border border-red-800 rounded-xl">Something went wrong in this view. Please hard-refresh.</div>;
    return this.props.children;
  }
}

/* ---------------- Account Setup & Settings Panels (unchanged behavior) ---------------- */
function SettingsPanel({name,setName,accType,setAccType,capital,setCapital,depositDate,setDepositDate,email,cfg,setCfg}){
  const [tab,setTab]=useState("personal");
  const [pw1,setPw1]=useState(""); const [pw2,setPw2]=useState(""); const [msg,setMsg]=useState("");
  const savePw=()=>{ if(!pw1||pw1.length<6){setMsg("Password must be at least 6 characters.");return}
    if(pw1!==pw2){setMsg("Passwords do not match.");return}
    const users=loadUsers(); const i=users.findIndex(u=>u.email.toLowerCase()===(email||"").toLowerCase());
    if(i>=0){users[i].password=pw1; saveUsers(users); setMsg("Password updated."); setPw1(""); setPw2("")}
  };
  const [symText,setSymText]=useState("");
  const [stratText,setStratText]=useState(""); const [stratColor,setStratColor]=useState("default");
  return(
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4"><IconSettings/><div className="font-semibold">Settings</div></div>
      <div className="flex gap-2 mb-4">
        <button onClick={()=>setTab("personal")} className={`px-3 py-1.5 rounded-lg border ${tab==="personal"?"bg-slate-700 border-slate-600":"border-slate-700"}`}>Account Setup</button>
        <button onClick={()=>setTab("security")} className={`px-3 py-1.5 rounded-lg border ${tab==="security"?"bg-slate-700 border-slate-600":"border-slate-700"}`}>Privacy & Security</button>
        <button onClick={()=>setTab("customize")} className={`px-3 py-1.5 rounded-lg border ${tab==="customize"?"bg-slate-700 border-slate-600":"border-slate-700"}`}>Customize Journal</button>
      </div>

      {tab==="personal"&&(
        <div className="space-y-4">
          <div>
            <label className="text-sm text-slate-300">Name</label>
            <input value={name} onChange={e=>setName(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-slate-300">Acc Type</label>
              <select value={accType} onChange={e=>setAccType(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2">
                {ACC_TYPES.map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-300">Account Capital ($)</label>
              <input type="number" value={capital} onChange={e=>setCapital(parseFloat(e.target.value||"0"))} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2" placeholder="0.00"/>
            </div>
            <div>
              <label className="text-sm text-slate-300">Capital Deposit Date</label>
              <input type="date" value={depositDate} onChange={e=>setDepositDate(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/>
            </div>
          </div>
        </div>
      )}

      {tab==="security"&&(
        <div className="space-y-3">
          <div>
            <label className="text-sm text-slate-300">New Password</label>
            <input type="password" value={pw1} onChange={e=>setPw1(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/>
          </div>
          <div>
            <label className="text-sm text-slate-300">Confirm Password</label>
            <input type="password" value={pw2} onChange={e=>setPw2(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/>
          </div>
          {msg && <div className="text-sky-400 text-sm">{msg}</div>}
          <div className="text-right">
            <button onClick={savePw} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500">Update Password</button>
          </div>
        </div>
      )}

      {tab==="customize"&&(
        <div className="space-y-6">
          <div>
            <div className="font-semibold mb-2">Symbols</div>
            <div className="flex gap-2 mb-2">
              <input value={symText} onChange={e=>setSymText(e.target.value.toUpperCase())} placeholder="e.g., XAUUSD" className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/>
              <button onClick={()=>{if(symText){setCfg(c=>({...c,symbols:[...new Set([...c.symbols, symText])] })); setSymText("");}}} className="px-3 py-2 rounded-lg border border-slate-700">Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
              { (cfg.symbols||[]).map(s=>(
                <span key={s} className="px-2 py-1 rounded-lg border border-slate-700">{s}
                  <button onClick={()=>setCfg(c=>({...c,symbols:c.symbols.filter(x=>x!==s)}))} className="ml-1 text-red-300">×</button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <div className="font-semibold mb-2">Strategies (used in dropdowns & table color)</div>
            <div className="flex gap-2 mb-2">
              <input value={stratText} onChange={e=>setStratText(e.target.value)} placeholder="Strategy name" className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/>
              <select value={stratColor} onChange={e=>setStratColor(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2">
                <option value="default">Default</option><option value="green">Green</option><option value="red">Red</option><option value="mustard">Mustard</option>
              </select>
              <button onClick={()=>{ if(stratText){ setCfg(c=>({...c,strategies:[...c.strategies,{name:stratText,color:stratColor}]})); setStratText(""); } }} className="px-3 py-2 rounded-lg border border-slate-700">Add</button>
            </div>
            <div className="space-y-2">
              {(cfg.strategies||[]).map((st,idx)=>(
                <div key={idx} className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-lg border border-slate-700 ${STRAT_COLORS[st.color]||""}`}>{st.name}</span>
                  <select value={st.color} onChange={e=>setCfg(c=>{const ns=[...c.strategies];ns[idx]={...st,color:e.target.value};return {...c,strategies:ns}})} className="bg-slate-900 border border-slate-700 rounded-xl px-2 py-1">
                    <option value="default">Default</option><option value="green">Green</option><option value="red">Red</option><option value="mustard">Mustard</option>
                  </select>
                  <button onClick={()=>setCfg(c=>({...c,strategies:c.strategies.filter((_,i)=>i!==idx)}))} className="text-red-300 px-2 py-1 rounded-lg border border-red-700">Remove</button>
                </div>
              ))}
            </div>
          </div>

          <div className="text-xs text-slate-400">Changes save automatically.</div>
        </div>
      )}
    </div>
  )
}

/* ---------------- Trade Form ---------------- */
function TradeForm({cfg,onAdd}){
  const [date,setDate]=useState(todayISO());
  const [symbol,setSymbol]=useState(cfg.symbols[0]||"XAUUSD");
  const [side,setSide]=useState("BUY");
  const [lotSize,setLotSize]=useState(0.01);
  const [entry,setEntry]=useState(); const [exit,setExit]=useState();
  const [tp1,setTp1]=useState(); const [tp2,setTp2]=useState(); const [sl,setSl]=useState();
  const [strategy,setStrategy]=useState((cfg.strategies[0]||{}).name || DEFAULT_STRATEGIES[0].name);
  const [exitType,setExitType]=useState("Trade In Progress");

  const submit=()=>{
    const t={ id:Math.random().toString(36).slice(2), date, symbol, side, lotSize:parseFloat(lotSize||"0")||0, entry:toNumber(entry), exit:toNumber(exit), tp1:toNumber(tp1), tp2:toNumber(tp2), sl:toNumber(sl), strategy, exitType };
    onAdd(t);
    setEntry(undefined); setExit(undefined); setTp1(undefined); setTp2(undefined); setSl(undefined);
  };

  return(
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4">
      <div className="font-semibold mb-3 flex items-center gap-2"><IconPlus/>New Trade</div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div><label className="text-xs text-slate-400">Date</label><input type="date" value={date} onChange={e=>setDate(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
        <div><label className="text-xs text-slate-400">Symbol</label><select value={symbol} onChange={e=>setSymbol(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2">{cfg.symbols.map(s=><option key={s}>{s}</option>)}</select></div>
        <div><label className="text-xs text-slate-400">Side</label><select value={side} onChange={e=>setSide(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"><option>BUY</option><option>SELL</option></select></div>
        <div><label className="text-xs text-slate-400">Lot size</label><input type="number" step="0.01" value={lotSize} onChange={e=>setLotSize(parseFloat(e.target.value||"0"))} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
        <div><label className="text-xs text-slate-400">Entry</label><input type="number" step="0.00001" value={entry??""} onChange={e=>setEntry(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
        <div><label className="text-xs text-slate-400">Exit</label><input type="number" step="0.00001" value={exit??""} onChange={e=>setExit(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
        <div><label className="text-xs text-slate-400">TP1</label><input type="number" step="0.00001" value={tp1??""} onChange={e=>setTp1(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
        <div><label className="text-xs text-slate-400">TP2</label><input type="number" step="0.00001" value={tp2??""} onChange={e=>setTp2(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
        <div><label className="text-xs text-slate-400">SL</label><input type="number" step="0.00001" value={sl??""} onChange={e=>setSl(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
        <div><label className="text-xs text-slate-400">Strategy</label>
          <select value={strategy} onChange={e=>setStrategy(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2">
            {cfg.strategies.map(s=><option key={s.name}>{s.name}</option>)}
          </select>
        </div>
        <div><label className="text-xs text-slate-400">Exit Type</label>
          <select value={exitType} onChange={e=>setExitType(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2">
            {EXIT_TYPES.map(e=> <option key={e}>{e}</option>)}
          </select>
        </div>
        <div className="flex items-end"><button onClick={submit} className="w-full px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500">Add Trade</button></div>
      </div>
    </div>
  )
}

/* ---------------- History Table ---------------- */
function HistoryTable({trades,accType,onEdit,onDelete}){
  return(
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4">
      <div className="font-semibold mb-3">Trade History</div>
      <div className="overflow-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-slate-400">
              <Th>Date</Th><Th>Symbol</Th><Th>Side</Th><Th>Lot size</Th>
              <Th>Entry</Th><Th>Exit</Th><Th>TP1</Th><Th>TP2</Th><Th>SL</Th>
              <Th>Strategy</Th><Th>Exit Type</Th><Th>P&L</Th><Th>P&L (Units)</Th><Th>Status</Th><Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {trades.map(t=>{
              const v=computeDollarPnL(t,accType);
              const status=t.exitType==="Trade In Progress"?"OPEN":"CLOSED";
              const color= (t.exitType==="SL") ? "text-red-300" : (t.exitType?.toString().startsWith("TP")||t.exitType==="BE") ? "text-green-300":"";
              return(
                <tr key={t.id} className="tr-row">
                  <Td className="text-slate-300">{t.date}</Td>
                  <Td>{t.symbol}</Td>
                  <Td>{t.side}</Td>
                  <Td>{t.lotSize}</Td>
                  <Td>{t.entry??"-"}</Td>
                  <Td>{t.exit??"-"}</Td>
                  <Td>{t.tp1??"-"}</Td>
                  <Td>{t.tp2??"-"}</Td>
                  <Td>{t.sl??"-"}</Td>
                  <Td className="whitespace-nowrap">{t.strategy}</Td>
                  <Td className="whitespace-nowrap">{t.exitType||"-"}</Td>
                  <Td className={color}>{v===null?"-":fmt$(v)}</Td>
                  <Td className={color}>{v===null?"-":formatUnits(accType,v)}</Td>
                  <Td className="whitespace-nowrap">{status}</Td>
                  <Td className="whitespace-nowrap">
                    <button onClick={()=>onEdit(t)} className="px-2 py-1 rounded-lg border border-slate-600 hover:bg-slate-700 mr-2">✎</button>
                    <button onClick={()=>onDelete(t)} className="px-2 py-1 rounded-lg border border-red-700 text-red-300 hover:bg-red-950">✕</button>
                  </Td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ---------------- Dashboard / Stats ---------------- */
function Dashboard({state,accType}){
  const closed = state.trades.filter(t=>t.exitType!=="Trade In Progress");
  const open   = state.trades.filter(t=>t.exitType==="Trade In Progress");

  const pnlList = closed.map(t=>computeDollarPnL(t,accType)).filter(v=>v!==null&&isFinite(v));
  const totalPnl = pnlList.reduce((a,b)=>a+(b||0),0);

  const wins = pnlList.filter(v=>v>0).length;
  const losses = pnlList.filter(v=>v<0).length;
  const wr = (wins + losses) ? (wins/(wins+losses))*100 : 0;

  /* Best Strategy (by total net P&L among CLOSED) */
  const stratMap = {};
  for (const t of closed){
    const v = computeDollarPnL(t,accType);
    if (v===null||!isFinite(v)) continue;
    stratMap[t.strategy] = (stratMap[t.strategy]||0) + v;
  }
  let bestName="—", bestVal=0;
  for (const [k,v] of Object.entries(stratMap)){
    if (v > bestVal || bestName==="—"){ bestName=k; bestVal=v; }
  }

  return(
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
      <Stat label="Trades (Total)" value={state.trades.length}/>
      <Stat label="Open" value={open.length}/>
      <Stat label="Closed" value={closed.length}/>
      <Stat label="Win Rate" value={`${r2(wr).toFixed(2)}%`} sub={`${wins}W / ${losses}L`}/>
      <Stat label="Net P&L" value={fmt$(totalPnl)} sub={`${formatUnits(accType,totalPnl)} units`}/>
      <div className="lg:col-span-5 grid grid-cols-1 md:grid-cols-3 gap-3">
        <Stat label="Best Strategy" value={bestName} sub={bestName==="—"?"":"Net "+fmt$(bestVal)}/>
      </div>
    </div>
  )
}

/* ---------------- Calendar (simple grouped view) ---------------- */
function CalendarView({trades}){
  const byDate = useMemo(()=>{
    const m={}; for(const t of trades){ (m[t.date]??=[]).push(t); }
    return Object.entries(m).sort((a,b)=>a[0]<b[0]?-1:1);
  },[trades]);
  return(
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4">
      <div className="font-semibold mb-3 flex items-center gap-2"><IconCalendar/>Calendar</div>
      <div className="space-y-4">
        {byDate.map(([d,rows])=>(
          <div key={d}>
            <div className="text-slate-300 font-semibold mb-2">{d}</div>
            <div className="grid md:grid-cols-2 gap-2">
              {rows.map(r=>(
                <div key={r.id} className="p-3 rounded-xl border border-slate-700 bg-slate-900/50">
                  <div className="text-sm">{r.symbol} • {r.side} • {r.lotSize}</div>
                  <div className="text-xs text-slate-400">Entry {r.entry??"-"} | TP1 {r.tp1??"-"} | TP2 {r.tp2??"-"} | SL {r.sl??"-"}</div>
                  <div className="text-xs text-slate-400 mt-1">{r.strategy} • {r.exitType}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {byDate.length===0 && <div className="text-slate-400 text-sm">No trades yet.</div>}
      </div>
    </div>
  )
}

/* ---------------- Notes ---------------- */
function Notes({state,setState}){
  return(
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4">
      <div className="font-semibold mb-2">Notes</div>
      <textarea value={state.notes||""} onChange={e=>setState(s=>({...s,notes:e.target.value}))} className="w-full h-40 bg-slate-900 border border-slate-700 rounded-xl p-3"/>
    </div>
  )
}

/* ---------------- User Menu (Import/Export/Logout) ---------------- */
function UserMenu({onExport,onImport,onLogout}){
  const [open,setOpen]=useState(false);
  return(
    <div className="relative">
      <button onClick={()=>setOpen(v=>!v)} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-700 hover:bg-slate-800"><IconUser/></button>
      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-lg overflow-hidden">
          <button onClick={()=>{setOpen(false);onImport();}} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-700"><IconUpload/>Import (.csv/.xls/.xlsx)</button>
          <button onClick={()=>{setOpen(false);onExport();}} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-700"><IconDownload/>Export CSV</button>
          <button onClick={()=>{setOpen(false);onLogout();}} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-700 text-red-300"><IconLogout/>Logout</button>
        </div>
      )}
    </div>
  )
}

/* ---------------- App Shell ---------------- */
function Shell({title,children,onExport,onImport,onLogout}){
  return(
    <div className="min-h-full">
      <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-3 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="px-2 py-2 rounded-xl border border-slate-700 hover:bg-slate-800"><span className="text-lg">☰</span></button>
            <img src="./logo-ng.png" className="h-7 w-7 rounded-md" alt="logo"/>
            <div className="font-semibold">Nitty Gritty</div>
            <span className="ml-2 text-xs px-2 py-1 rounded-lg bg-slate-800 border border-slate-700">Trading Journal</span>
          </div>
          <div className="flex items-center gap-2">
            <UserMenu onExport={onExport} onImport={onImport} onLogout={onLogout}/>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto p-3">{children}</main>
    </div>
  )
}

/* ---------------- Login (kept simple as before) ---------------- */
function Login({onLogin}){
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [error,setError]=useState("");
  const login=()=>{
    const users=loadUsers();
    const u=users.find(u=>u.email.toLowerCase()===email.toLowerCase());
    if(!u || u.password!==password){ setError("Invalid email or password."); return; }
    saveCurrent(u.email); onLogin(u.email);
  };
  return(
    <div className="min-h-full flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-slate-800/60 border border-slate-700 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4"><IconHome/><div className="font-semibold">Sign in</div></div>
        <div className="space-y-3">
          <div><label className="text-sm text-slate-300">Email</label><input value={email} onChange={e=>setEmail(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
          <div><label className="text-sm text-slate-300">Password</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
          {error && <div className="text-red-300 text-sm">{error}</div>}
          <button onClick={login} className="w-full px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500">Sign in</button>
        </div>
        <div className="text-xs text-slate-400 mt-3">Google Sign-In button remains per your setup.</div>
      </div>
    </div>
  )
}

/* ---------------- App (state, import/export, views) ---------------- */
function usePersisted(email){
  const [state,setState]=useState(()=> loadState(email) || {
    email, name:"", accType:"Dollar Account", capital:0, depositDate: todayISO(), trades:[], notes:""
  });
  useEffect(()=>{ if(email){ const s=loadState(email); if(s) setState(s); } },[email]);
  useEffect(()=>{ if(email) saveState(email,state); },[email,state]);
  return [state,setState];
}

function App(){
  const [currentEmail,setCurrentEmail]=useState(getCurrent());
  const [state,setState]=usePersisted(currentEmail);
  const [cfg,setCfg]=useState(()=>loadCfg(currentEmail)||{symbols:DEFAULT_SYMBOLS, strategies:DEFAULT_STRATEGIES});
  useEffect(()=>{ if(currentEmail) saveCfg(currentEmail,cfg); },[cfg,currentEmail]);

  const fileInputRef = useRef(null);
  useEffect(()=>{
    if(!fileInputRef.current){
      const el=document.createElement('input'); el.type='file'; el.accept='.csv,.xls,.xlsx'; el.style.display='none';
      document.body.appendChild(el); fileInputRef.current=el;
    }
    const handler=async (e)=>{
      const f=e.target.files?.[0]; if(!f) return;
      const ext=(f.name.split('.').pop()||'').toLowerCase();
      let rows;
      if(ext==='csv'){ rows = csvToRows(await f.text()); }
      else {
        if(typeof XLSX==='undefined'){ alert('XLS/XLSX import requires SheetJS'); return; }
        const wb=XLSX.read(await f.arrayBuffer(),{type:'array'});
        const ws=wb.Sheets[wb.SheetNames[0]];
        rows=XLSX.utils.sheet_to_json(ws,{defval:''});
      }
      const trades=rowsToTrades(rows);
      setState(s=>({...s,trades:[...trades.reverse(),...s.trades]}));
    };
    fileInputRef.current.addEventListener('change',handler);
    return ()=>fileInputRef.current?.removeEventListener('change',handler);
  },[fileInputRef,setState]);

  // publish for legacy shim
  useEffect(()=>{ window.__ngOpenImport = ()=>{ if(fileInputRef.current){ fileInputRef.current.value=''; fileInputRef.current.click(); } }; },[]);

  const onAddTrade = (t)=> setState(s=>({...s,trades:[t,...s.trades]}));
  const onEditTrade = (t)=>{
    setState(s=>({...s,trades:s.trades.map(x=>x.id===t.id?t:x)}));
  };
  const onDeleteTrade = (t)=>{
    setState(s=>({...s,trades:s.trades.filter(x=>x.id!==t.id)}));
  };

  const exportCSV = ()=>{
    const csv=toCSV(state.trades, state.accType);
    const blob=new Blob([csv],{type:"text/csv;charset=utf-8;"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a'); a.href=url; a.download=`NittyGritty_${todayISO()}.csv`; document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  };
  const importFile = ()=> window.__ngOpenImport && window.__ngOpenImport();

  const logout = ()=>{ saveCurrent(""); setCurrentEmail(""); };

  // Capital computed as initial capital + P&L of CLOSED trades
  const closedPnL = useMemo(()=>{
    return state.trades
      .filter(t=>t.exitType!=="Trade In Progress")
      .map(t=>computeDollarPnL(t,state.accType))
      .filter(v=>v!==null&&isFinite(v))
      .reduce((a,b)=>a+(b||0),0);
  },[state.trades,state.accType]);
  const liveCapital = r2((state.capital||0) + closedPnL);

  if(!currentEmail) return <Login onLogin={email=>{saveCurrent(email); setCurrentEmail(email);}}/>;

  return(
    <Shell onExport={exportCSV} onImport={importFile} onLogout={logout}>
      <div className="grid grid-cols-1 gap-3">
        <Dashboard state={state} accType={state.accType}/>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="lg:col-span-2 space-y-3">
            <TradeForm cfg={cfg} onAdd={onAddTrade}/>
            <HistoryTable trades={state.trades} accType={state.accType}
              onEdit={(t)=>onEditTrade({...t})}
              onDelete={onDeleteTrade}/>
          </div>
          <div className="space-y-3">
            <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4">
              <div className="font-semibold mb-2">Account</div>
              <div className="text-sm text-slate-300">Type: <span className="font-semibold">{state.accType}</span></div>
              <div className="text-sm text-slate-300">Deposit Date: <span className="font-semibold">{state.depositDate}</span></div>
              <div className="text-sm text-slate-300 mt-1">Starting Capital: <span className="font-semibold">{fmt$(state.capital)}</span></div>
              <div className="text-sm text-slate-300">Current Capital: <span className="font-semibold">{fmt$(liveCapital)}</span></div>
            </div>
            <SettingsPanel
              name={state.name} setName={(v)=>setState(s=>({...s,name:v}))}
              accType={state.accType} setAccType={(v)=>setState(s=>({...s,accType:v}))}
              capital={state.capital} setCapital={(v)=>setState(s=>({...s,capital:v}))}
              depositDate={state.depositDate} setDepositDate={(v)=>setState(s=>({...s,depositDate:v}))}
              email={state.email||currentEmail}
              cfg={cfg} setCfg={setCfg}
            />
            <CalendarView trades={state.trades}/>
            <Notes state={state} setState={setState}/>
          </div>
        </div>
      </div>
    </Shell>
  )
}

/* ---------------- Mount ---------------- */
ReactDOM.createRoot(document.getElementById("root")).render(
  <ErrorBoundary><App/></ErrorBoundary>
);
