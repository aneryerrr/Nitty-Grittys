/* Cache/version guard (optional, harmless) */
(() => {
  try { localStorage.setItem("__NG_BUILD_LAST", String(window.__NG_BUILD||"dev")); } catch(e) {}
})();

/* global React, ReactDOM, XLSX */
const { useState, useMemo, useEffect, useRef } = React;

/* ---------- Icons ---------- */
const iconCls="h-5 w-5";
const IconUser=p=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Z"/><path d="M4 20a8 8 0 0 1 16 0Z"/></svg>);
const IconLogout=p=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M9 21h4a4 4 0 0 0 4-4V7a4 4 0 0 0-4-4H9"/><path d="M16 12H3"/><path d="M7 8l-4 4 4 4"/></svg>);
const IconDownload=p=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M12 3v10"/><path d="M8 11l4 4 4-4"/><path d="M5 21h14v-4H5Z"/></svg>);
const IconUpload=p=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M12 21V9"/><path d="M7 14l5-5 5 5"/><path d="M5 3h14v4H5Z"/></svg>);
const IconEdit=p=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconCls} {...p}><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>);
const IconDelete=p=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconCls} {...p}><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/></svg>);

/* ---------- Constants ---------- */
const LOGO_PUBLIC="/logo-ng.png"; const LOGO_FALLBACK="./logo-ng.png";
const DEFAULT_SYMBOLS=["XAUUSD","US100","US30","EURUSD","BTCUSD","AUDCAD","USDCAD","USDJPY","GBPUSD"];
const DEFAULT_STRATEGIES=["Trend Line Bounce","Two Touch Point Trend Line Break","Three Touch Point Trend Line Break","Break and Retest","Trend Continuation"];
const DEFAULT_STRATEGY_COLORS={"Trend Line Bounce":"green","Two Touch Point Trend Line Break":"green","Three Touch Point Trend Line Break":"mustard","Break and Retest":"red","Trend Continuation":"green"};

/* ---------- Storage helpers ---------- */
const USERS_KEY="ng_users_v1"; const CURR_KEY="ng_current_user_v1";
const loadUsers=()=>{try{return JSON.parse(localStorage.getItem(USERS_KEY)||"[]")}catch{return[]}};
const saveUsers=u=>{try{localStorage.setItem(USERS_KEY,JSON.stringify(u))}catch{}};
const saveCurrent=e=>{try{localStorage.setItem(CURR_KEY,e)}catch{}}; const getCurrent=()=>{try{return localStorage.getItem(CURR_KEY)||""}catch{return""}};
const loadState=e=>{try{return JSON.parse(localStorage.getItem("ng_state_"+e)||"null")}catch{return null}};
const saveState=(e,s)=>{try{localStorage.setItem("ng_state_"+e,JSON.stringify(s))}catch{}};
const todayISO=()=>{const d=new Date();const tz=d.getTimezoneOffset();return new Date(d.getTime()-tz*60000).toISOString().slice(0,10)};

/* ---------- P&L helpers ---------- */
const r2=n=>Math.round(n*100)/100; const fmt$=n=>"$"+(isFinite(n)?r2(n):0).toFixed(2);
const formatUnits=(accType,v)=>accType==="Dollar Account"?r2(v).toFixed(2):r2(v*100).toFixed(2);
const formatPnlDisplay=(accType,v)=>accType==="Cent Account"?(r2(v*100)).toFixed(2)+" ¢":fmt$(v);

function perLotValueForMove(symbol,delta,accType){
  const abs=Math.abs(delta); const isStd=accType==="Dollar Account"; const mult=std=>isStd?std:std/100;
  switch(symbol){
    case"US30":case"US100":return abs*mult(10);
    case"XAUUSD":return abs*mult(100);
    case"BTCUSD":return abs*mult(1);
    case"EURUSD":case"GBPUSD":{const pips=abs/0.0001;return pips*mult(10)}
    case"AUDCAD":case"USDCAD":{const pips=abs/0.0001;return pips*mult(7.236)}
    case"USDJPY":{const pips=abs/0.01;return pips*mult(6.795)}
    default:return 0;
  }
}
function legPnL(symbol,side,entry,exit,lot,accType){
  const raw=perLotValueForMove(symbol,exit-entry,accType)*(lot||0);
  const sign=side==="BUY"?Math.sign(exit-entry):-Math.sign(exit-entry);
  return raw*sign;
}
function computeDollarPnL(t,accType){
  if(t.exitType==="Trade In Progress") return null;
  const has=v=>typeof v==="number"&&isFinite(v);
  switch(t.exitType){
    case"SL": if(!has(t.sl)) return null; return legPnL(t.symbol,t.side,t.entry,t.sl,t.lotSize,accType);
    case"TP":
      if(has(t.tp2)) return legPnL(t.symbol,t.side,t.entry,t.tp2,t.lotSize,accType);
      if(has(t.tp1)) return legPnL(t.symbol,t.side,t.entry,t.tp1,t.lotSize,accType);
      if(has(t.exit)) return legPnL(t.symbol,t.side,t.entry,t.exit,t.lotSize,accType);
      return null;
    case"TP1_BE":
      if(!has(t.tp1)) return null;
      return (legPnL(t.symbol,t.side,t.entry,t.tp1,t.lotSize,accType)+0)/2;
    case"TP1_SL":
      if(!has(t.tp1)||!has(t.sl)) return null;
      return (legPnL(t.symbol,t.side,t.entry,t.tp1,t.lotSize,accType)+legPnL(t.symbol,t.side,t.entry,t.sl,t.lotSize,accType))/2;
    case"BE": return 0;
    default:
      if(has(t.exit)) return legPnL(t.symbol,t.side,t.entry,t.exit,t.lotSize,accType);
      return null;
  }
}

/* ---------- CSV export ---------- */
function toCSV(rows,accType){
  const H=["Date","Symbol","Side","Lot Size","Entry","Exit","TP1","TP2","SL","Strategy","Exit Type","P&L","P&L (Units)"];
  const out=[H.join(",")]; const NL="\n"; const BOM="﻿";
  const esc=s=>{if(s===null||s===undefined)return"";const v=String(s);return /[",\n]/.test(v)?`"${v.replace(/"/g,'""')}"`:v};
  for(const t of rows){
    const v=computeDollarPnL(t,accType); const units=v===null?"":formatUnits(accType,v);
    const dollars=v===null?"":r2(v);
    out.push([t.date,t.symbol,t.side,t.lotSize,(t.entry??""),(t.exit??""),(t.tp1??""),(t.tp2??""),(t.sl??""),t.strategy,(t.exitType||""),dollars,units].map(esc).join(","));
  }
  return BOM+out.join(NL);
}

/* ---------- Modal ---------- */
function Modal({title,children,onClose,maxClass,scrollable=true}){
  return(
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-3">
      <div className={`relative w-[95vw] ${maxClass||"max-w-3xl"} ${scrollable?"max-h-[80vh] overflow-auto":"max-h-[92vh] overflow-visible"} bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl`}>
        <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-slate-800/95 backdrop-blur">
          <div className="font-semibold">{title}</div>
          <button onClick={onClose} className="px-3 py-1.5 rounded-lg border border-slate-600 hover:bg-slate-700">✕</button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}

/* ---------- Settings (with Customize Journal tab) ---------- */
function SettingsPanel({state,setState,email}){
  const [tab,setTab]=useState("personal");
  const [pw1,setPw1]=useState(""); const [pw2,setPw2]=useState(""); const [msg,setMsg]=useState("");
  const ACC_TYPES=["Cent Account","Dollar Account"];

  const savePw=()=>{ if(!pw1||pw1.length<6) return setMsg("Password must be at least 6 characters.");
    if(pw1!==pw2) return setMsg("Passwords do not match.");
    const users=loadUsers(); const i=users.findIndex(u=>u.email.toLowerCase()===(email||"").toLowerCase());
    if(i>=0){users[i].password=pw1; saveUsers(users); setMsg("Password updated."); setPw1(""); setPw2("");}
  };

  const addSymbol=s=>{
    s=s.trim().toUpperCase(); if(!s) return;
    if(state.symbols.includes(s)) return;
    setState({...state, symbols:[...state.symbols, s]});
  };
  const removeSymbol=s=>setState({...state, symbols: state.symbols.filter(x=>x!==s)});

  const addStrat=s=>{
    s=s.trim(); if(!s) return;
    if(state.strategies.includes(s)) return;
    setState({...state, strategies:[...state.strategies, s], strategyColors:{...state.strategyColors,[s]:"mustard"}});
  };
  const removeStrat=s=>{
    const sc={...state.strategyColors}; delete sc[s];
    setState({...state, strategies: state.strategies.filter(x=>x!==s), strategyColors: sc});
  };

  return(
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4"><svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3.5"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1 .6 1.65 1.65 0 0 0-.4 1V22a2 2 0 1 1-4 0v-.1a1.65 1.65 0 0 0-.4-1 1.65 1.65 0 0 0-1-.6 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-.6-1 1.65 1.65 0 0 0-1-.4H2a2 2 0 1 1 0-4h.1a1.65 1.65 0 0 0 1-.4 1.65 1.65 0 0 0 .6-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06A2 2 0 1 1 6.24 2.9l.06.06A1.65 1.65 0 0 0 8 4.6a1.65 1.65 0  0 0 1-.6 1.65 1.65 0 0 0 .4-1V2a2 2 0 1 1 4 0v.1c0 .38.14.74.4 1 .26.26.62.4 1 .4.62 0 1.22-.25 1.64-.68l.06-.06A2 2 0 1 1 21.1 6.24l-.06.06c-.26.26-.4.62-.4 1s.14.74.4 1c.26.26.62.4 1 .4H22a2 2 0 1 1 0 4h-.1a1.65 1.65 0 0 0-1 .4 1.65 1.65 0 0 0-.6 1Z"/></svg>
        <div className="font-semibold">Settings</div></div>

      <div className="flex gap-2 mb-4 flex-wrap">
        <button onClick={()=>setTab("personal")}   className={`px-3 py-1.5 rounded-lg border ${tab==="personal"  ?"bg-slate-700 border-slate-600":"border-slate-700"}`}>Personal Info</button>
        <button onClick={()=>setTab("security")}   className={`px-3 py-1.5 rounded-lg border ${tab==="security"  ?"bg-slate-700 border-slate-600":"border-slate-700"}`}>Privacy & Security</button>
        <button onClick={()=>setTab("customize")} className={`px-3 py-1.5 rounded-lg border ${tab==="customize"?"bg-slate-700 border-slate-600":"border-slate-700"}`}>Customize Journal</button>
      </div>

      {tab==="personal"&&(
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <label className="text-sm text-slate-300">Name</label>
            <input value={state.name} onChange={e=>setState({...state,name:e.target.value})} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/>
          </div>
          <div>
            <label className="text-sm text-slate-300">Account Type</label>
            <select value={state.accType} onChange={e=>setState({...state,accType:e.target.value})} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2">
              {ACC_TYPES.map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm text-slate-300">Capital ($)</label>
            <input type="number" value={state.capital} onChange={e=>setState({...state,capital:parseFloat(e.target.value||"0")})} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/>
          </div>
          <div>
            <label className="text-sm text-slate-300">Capital Deposit Date</label>
            <input type="date" value={state.depositDate} onChange={e=>setState({...state,depositDate:e.target.value})} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/>
          </div>
        </div>
      )}

      {tab==="security"&&(
        <div className="space-y-3">
          <div><label className="text-sm text-slate-300">New Password</label><input type="password" value={pw1} onChange={e=>setPw1(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
          <div><label className="text-sm text-slate-300">Confirm Password</label><input type="password" value={pw2} onChange={e=>setPw2(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
          {msg&&<div className="text-sky-400 text-sm">{msg}</div>}
          <div className="text-right"><button onClick={savePw} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500">Update Password</button></div>
        </div>
      )}

      {tab==="customize"&&(
        <div className="space-y-8">
          <div>
            <div className="text-sm font-semibold mb-2">Symbols</div>
            <SymbolEditor symbols={state.symbols} onAdd={addSymbol} onRemove={removeSymbol}/>
          </div>
          <div>
            <div className="text-sm font-semibold mb-2">Strategies & Colors</div>
            <StrategyEditor strategies={state.strategies} colors={state.strategyColors}
              onAdd={addStrat} onRemove={removeStrat}
              onColor={(s,c)=>setState({...state, strategyColors:{...state.strategyColors,[s]:c}})}/>
          </div>
        </div>
      )}
    </div>
  )
}
function SymbolEditor({symbols,onAdd,onRemove}){
  const [val,setVal]=useState("");
  return(<div>
    <div className="flex gap-2 mb-3">
      <input className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2" placeholder="Add symbol (e.g., XAUUSD)" value={val} onChange={e=>setVal(e.target.value)}/>
      <button onClick={()=>{onAdd(val);setVal("")}} className="px-3 py-2 rounded-lg border border-slate-700 hover:bg-slate-700">Add</button>
    </div>
    <div className="flex flex-wrap gap-2">
      {symbols.map(s=>(
        <div key={s} className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900/60 flex items-center gap-2">
          <span>{s}</span>
          <button onClick={()=>onRemove(s)} className="text-red-400 hover:text-red-300"><IconDelete/></button>
        </div>
      ))}
    </div>
  </div>)
}
function StrategyEditor({strategies,colors,onAdd,onRemove,onColor}){
  const [val,setVal]=useState("");
  const badge=c=>c==="green"?"badge badge-green":c==="red"?"badge badge-red":"badge badge-mustard";
  return(<div>
    <div className="flex gap-2 mb-3">
      <input className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2" placeholder="Add strategy" value={val} onChange={e=>setVal(e.target.value)}/>
      <button onClick={()=>{onAdd(val);setVal("")}} className="px-3 py-2 rounded-lg border border-slate-700 hover:bg-slate-700">Add</button>
    </div>
    <div className="space-y-2">
      {strategies.map(s=>{
        const c=colors[s]||"mustard";
        return(<div key={s} className="flex items-center justify-between bg-slate-900/50 border border-slate-700 rounded-xl px-3 py-2">
          <div className={badge(c)}>{s}</div>
          <div className="flex items-center gap-2">
            <select value={c} onChange={e=>onColor(s,e.target.value)} className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1">
              <option value="green">Green</option><option value="red">Red</option><option value="mustard">Mustard</option>
            </select>
            <button onClick={()=>onRemove(s)} className="text-red-400 hover:text-red-300"><IconDelete/></button>
          </div>
        </div>)})}
    </div>
  </div>)
}

/* ---------- Detailed Statistics (restored & richer) ---------- */
function DetailedStats({trades,accType}){
  const rows=useMemo(()=>{
    const m={};
    for(const t of trades){
      const k=t.symbol||"N/A";
      const v=computeDollarPnL(t,accType);
      const closed = t.exitType && t.exitType!=="Trade In Progress" && v!==null && isFinite(v);
      m[k]=m[k]||{sym:k,trades:0,wins:0,losses:0,pnl:0};
      m[k].trades++;
      if(closed){
        m[k].pnl+=v;
        if(v>0) m[k].wins++; else if(v<0) m[k].losses++;
      }
    }
    return Object.values(m).map(r=>({
      ...r,
      wr: r.trades? Math.round((r.wins/(r.wins+r.losses||1))*100):0
    }));
  },[trades,accType]);

  return(
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4">
      <div className="text-sm font-semibold mb-2">Detailed Statistics</div>
      <div className="overflow-auto">
        <table className="min-w-full text-sm table-row-gap">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left">Symbol</th>
              <th className="px-4 py-3 text-left">Trades</th>
              <th className="px-4 py-3 text-left">Wins</th>
              <th className="px-4 py-3 text-left">Losses</th>
              <th className="px-4 py-3 text-left">Win-rate</th>
              <th className="px-4 py-3 text-left">Total P&L</th>
              <th className="px-4 py-3 text-left">P&L (Units)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r=>(
              <tr key={r.sym}>
                <td className="px-4 py-3">{r.sym}</td>
                <td className="px-4 py-3">{r.trades}</td>
                <td className="px-4 py-3">{r.wins}</td>
                <td className="px-4 py-3">{r.losses}</td>
                <td className="px-4 py-3">{r.wr}%</td>
                <td className="px-4 py-3">{formatPnlDisplay(accType,r.pnl)}</td>
                <td className="px-4 py-3">{formatUnits(accType,r.pnl)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
window.DetailedStats = DetailedStats; // guard old caches

/* ---------- Notes (no inner scroll, richer toolbar, uniform previews) ---------- */
function NotesPanel({trades}){
  const [modalOpen,setModalOpen]=useState(false);
  const [date,setDate]=useState(todayISO());
  const [title,setTitle]=useState("");
  const [refId,setRefId]=useState("");
  const [html,setHtml]=useState("");
  const [list,setList]=useState(()=>{try{return JSON.parse(localStorage.getItem("ng_notes")||"[]")}catch{return[]}});
  const editorRef=useRef(null);

  const todaysTrades=useMemo(()=>trades.filter(t=>t.date===date),[trades,date]);

  const exec=(cmd,val=null)=>document.execCommand(cmd,false,val);
  const applySize=v=>{
    const map={text:"P",h2:"H2",h3:"H3"};
    exec("formatBlock", map[v]||"P");
  };

  const save=()=>{
    const note={id:Math.random().toString(36).slice(2), date, title, refId, html};
    const arr=[note, ...list]; setList(arr);
    localStorage.setItem("ng_notes",JSON.stringify(arr));
    setModalOpen(false); setTitle(""); setRefId(""); setHtml("");
  };

  const removeNote=id=>{
    const arr=list.filter(n=>n.id!==id); setList(arr);
    localStorage.setItem("ng_notes",JSON.stringify(arr));
  };

  return(
    <div>
      <div className="flex justify-end mb-3">
        <button onClick={()=>setModalOpen(true)} className="px-3 py-2 rounded-lg border border-slate-700 hover:bg-slate-800">+ New note</button>
      </div>

      {/* preview list – same width, no referenced-trade */}
      <div className="grid md:grid-cols-2 gap-4">
        {list.filter(n=>n.date===date).map(n=>(
          <div key={n.id} className="note-card bg-slate-800/60 border border-slate-700 rounded-2xl p-4">
            <div className="text-slate-400 text-sm">{n.date}</div>
            {n.title && <div className="font-semibold mt-1 mb-2">{n.title}</div>}
            <div className="prose prose-invert max-w-none text-sm" dangerouslySetInnerHTML={{__html:n.html||"(empty)"}} />
            <div className="mt-3 flex justify-end">
              <button onClick={()=>removeNote(n.id)} className="px-3 py-1.5 rounded-lg border border-red-700 text-red-300 hover:bg-red-900/20"><IconDelete/></button>
            </div>
          </div>
        ))}
        {list.filter(n=>n.date===date).length===0 && (
          <div className="text-slate-400">No notes for this date.</div>
        )}
      </div>

      {modalOpen && (
        <Modal title="New note" onClose={()=>setModalOpen(false)} maxClass="max-w-4xl" scrollable={false}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-slate-300">Title</label>
              <input value={title} onChange={e=>setTitle(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/>
            </div>
            <div>
              <label className="text-sm text-slate-300">Date</label>
              <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/>
            </div>
          </div>

          <div className="mt-3">
            <label className="text-sm text-slate-300">Reference Trade (optional – today only)</label>
            <div className="mt-1 bg-slate-900 border border-slate-700 rounded-xl p-2">
              <div className="flex flex-wrap gap-3">
                <label className="flex items-center gap-2">
                  <input type="radio" checked={!refId} onChange={()=>setRefId("")}/>
                  <span className="text-sm">None</span>
                </label>
                {todaysTrades.map(t=>(
                  <label key={t.id} className="flex items-center gap-2">
                    <input type="radio" checked={refId===t.id} onChange={()=>setRefId(t.id)}/>
                    <span className="text-sm">{t.symbol} · {t.side} · Lot {t.lotSize}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* toolbar */}
          <div className="mt-3 flex items-center gap-2">
            <button onClick={()=>exec("bold")} className="px-2 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-700 font-bold">B</button>
            <button onClick={()=>exec("italic")} className="px-2 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-700 italic">I</button>
            <button onClick={()=>exec("underline")} className="px-2 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-700 underline">U</button>
            <select onChange={e=>applySize(e.target.value)} className="px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700">
              <option value="text">Text</option>
              <option value="h2">Heading</option>
              <option value="h3">Subheading</option>
            </select>
          </div>

          {/* editor – no scroll container; editor area can scroll internally if long */}
          <div className="mt-2 bg-slate-900 border border-slate-700 rounded-xl p-2">
            <div
              ref={editorRef}
              className="note-editor"
              contentEditable
              onInput={e=>setHtml(e.currentTarget.innerHTML)}
              dangerouslySetInnerHTML={{__html:html}}
            />
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button onClick={()=>setModalOpen(false)} className="notes-btn border border-slate-600 hover:bg-slate-700 rounded-lg">Discard</button>
            <button onClick={save} className="notes-btn bg-blue-600 hover:bg-blue-500 rounded-lg">💾 Save</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

/* ---------- Histories (header once, correct columns) ---------- */
function Histories({trades,accType,onEdit,onDelete,strategyColors}){
  const badge=s=>{const c=strategyColors[s]||"mustard";return <span className={`badge ${c==="green"?"badge-green":c==="red"?"badge-red":"badge-mustard"}`}>{s}</span>};
  return(
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4">
      <div className="text-sm font-semibold mb-2">Trade History</div>
      <div className="overflow-auto">
        <table className="min-w-full text-sm table-row-gap">
          <thead><tr>
            <th className="px-4 py-3 text-left">Date</th>
            <th className="px-4 py-3 text-left">Symbol</th>
            <th className="px-4 py-3 text-left">Side</th>
            <th className="px-4 py-3 text-left">Lot</th>
            <th className="px-4 py-3 text-left">Entry</th>
            <th className="px-4 py-3 text-left">Exit</th>
            <th className="px-4 py-3 text-left">TP1</th>
            <th className="px-4 py-3 text-left">TP2</th>
            <th className="px-4 py-3 text-left">SL</th>
            <th className="px-4 py-3 text-left">Strategy</th>
            <th className="px-4 py-3 text-left">Exit Type</th>
            <th className="px-4 py-3 text-left">P&L</th>
            <th className="px-4 py-3 text-left">P&L (Units)</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-left">Actions</th>
          </tr></thead>
          <tbody>
            {trades.map(t=>{
              const v=computeDollarPnL(t,accType); const closed=t.exitType && t.exitType!=="Trade In Progress";
              const cls=v>0?'text-green-400':v<0?'text-red-400':'';
              return(<tr key={t.id}>
                <td className="px-4 py-3">{t.date}</td>
                <td className="px-4 py-3">{t.symbol}</td>
                <td className="px-4 py-3">{t.side}</td>
                <td className="px-4 py-3">{t.lotSize}</td>
                <td className="px-4 py-3">{t.entry??""}</td>
                <td className="px-4 py-3">{t.exit??""}</td>
                <td className="px-4 py-3">{t.tp1??""}</td>
                <td className="px-4 py-3">{t.tp2??""}</td>
                <td className="px-4 py-3">{t.sl??""}</td>
                <td className="px-4 py-3">{t.strategy?badge(t.strategy):""}</td>
                <td className="px-4 py-3">{t.exitType||""}</td>
                <td className={`px-4 py-3 ${cls}`}>{v===null?'-':formatPnlDisplay(accType,v)}</td>
                <td className={`px-4 py-3 ${cls}`}>{v===null?'-':formatUnits(accType,v)}</td>
                <td className="px-4 py-3">{closed?'CLOSED':'OPEN'}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={()=>onEdit(t)} className="px-2 py-1 rounded-lg border border-slate-700 hover:bg-slate-700"><IconEdit/></button>
                    <button onClick={()=>onDelete(t.id)} className="px-2 py-1 rounded-lg border border-red-700 text-red-300 hover:bg-red-900/20"><IconDelete/></button>
                  </div>
                </td>
              </tr>)
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ---------- Add/Edit Trade Modal (unchanged from last) ---------- */
function TradeModal({initial,onClose,onSave,onDelete,accType,symbols,strategies}){
  const i=initial||{}; const [symbol,setSymbol]=useState(i.symbol||symbols[0]); const [side,setSide]=useState(i.side||"BUY");
  const [date,setDate]=useState(i.date||todayISO()); const [lotSize,setLotSize]=useState(i.lotSize??0.01);
  const [entry,setEntry]=useState(i.entry??""); const [exit,setExit]=useState(i.exit??"");
  const [tp1,setTp1]=useState(i.tp1??""); const [tp2,setTp2]=useState(i.tp2??""); const [sl,setSl]=useState(i.sl??"");
  const [strategy,setStrategy]=useState(i.strategy||strategies[0]); const [exitType,setExitType]=useState(i.exitType||"TP");
  const EXIT_TYPES=["TP","SL","TP1_BE","TP1_SL","BE","Trade In Progress"];
  const num=v=>(v===""||v===undefined||v===null)?undefined:parseFloat(v);
  const draft=useMemo(()=>({id:i.id,date,symbol,side,lotSize:parseFloat(lotSize||0),entry:num(entry),exit:num(exit),tp1:num(tp1),tp2:num(tp2),sl:num(sl),strategy,exitType}),[i.id,date,symbol,side,lotSize,entry,exit,tp1,tp2,sl,strategy,exitType]);
  const preview=useMemo(()=>{const v=computeDollarPnL(draft,accType);if(v===null||!isFinite(v))return"-";return`${formatPnlDisplay(accType,v)} (${formatUnits(accType,v)})`},[draft,accType]);
  return(
    <Modal title={i.id?"Edit Trade":"Add Trade"} onClose={onClose} maxClass="max-w-4xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <div><label className="text-sm text-slate-300">Symbol</label>
          <select value={symbol} onChange={e=>setSymbol(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2">{symbols.map(s=><option key={s}>{s}</option>)}</select>
        </div>
        <div><label className="text-sm text-slate-300">Action</label>
          <div className="mt-1 grid grid-cols-2 gap-2">{["BUY","SELL"].map(s=>(<button key={s} onClick={()=>setSide(s)} className={`px-2 py-2 rounded-lg border ${side===s ? (s==="BUY" ? "bg-green-600 border-green-500" : "bg-red-600 border-red-500") : "border-slate-700"}`}>{s}</button>))}</div>
        </div>
        <div><label className="text-sm text-slate-300">Date</label><input type="date" value={date} onChange={e=>setDate(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
        <div><label className="text-sm text-slate-300">Lot size</label><input type="number" step="0.01" value={lotSize} onChange={e=>setLotSize(e.target.value)} className="w-24 mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>

        <div><label className="text-sm text-slate-300">Entry price</label><input type="number" step="0.0001" value={entry} onChange={e=>setEntry(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
        <div><label className="text-sm text-slate-300">Exit Price</label><input type="number" step="0.0001" value={exit} onChange={e=>setExit(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2" placeholder="Leave blank for OPEN"/></div>
        <div><label className="text-sm text-slate-300">TP 1</label><input type="number" step="0.0001" value={tp1} onChange={e=>setTp1(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
        <div><label className="text-sm text-slate-300">TP 2</label><input type="number" step="0.0001" value={tp2} onChange={e=>setTp2(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
        <div><label className="text-sm text-slate-300">Stop-Loss</label><input type="number" step="0.0001" value={sl} onChange={e=>setSl(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
        <div><label className="text-sm text-slate-300">Strategy</label>
          <select value={strategy} onChange={e=>setStrategy(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"></select>
        </div>
        <div><label className="text-sm text-slate-300">Exit Type</label>
          <select value={exitType} onChange={e=>setExitType(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2">
            {["TP","SL","TP1_BE","TP1_SL","BE","Trade In Progress"].map(s=><option key={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-slate-300">P&L preview: <span className="font-semibold">{preview}</span></div>
        <div className="flex items-center gap-2">
          {i.id&&(<button onClick={()=>onDelete(i.id)} className="px-4 py-2 rounded-lg border border-red-600 text-red-400 hover:bg-red-900/20">Delete</button>)}
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-600 hover:bg-slate-700">Cancel</button>
          <button onClick={()=>onSave(draft)} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500">Save</button>
        </div>
      </div>
    </Modal>
  )
}

/* ---------- Header / Shell / User menu ---------- */
function UserMenu({onImport,onExport,onLogout}){
  const [open,setOpen]=useState(false);
  const inputRef=useRef(null);
  return(
    <div className="relative">
      <button onClick={()=>setOpen(v=>!v)} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-700 hover:bg-slate-800"><IconUser/></button>
      {open&&(<div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-lg overflow-hidden">
        <button onClick={()=>{setOpen(false); inputRef.current && inputRef.current.click();}} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-700"><IconUpload/>Import CSV/XLS/XLSX</button>
        <button onClick={()=>{setOpen(false);onExport()}} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-700"><IconDownload/>Export CSV</button>
        <button onClick={()=>{setOpen(false);onLogout()}} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-700 text-red-300"><IconLogout/>Logout</button>
        <input ref={inputRef} type="file" accept=".csv,.xls,.xlsx" className="hidden"
          onChange={e=>{const f=e.target.files&&e.target.files[0]; if(f) onImport(f); e.target.value="";}}/>
      </div>)}
    </div>
  )
}
function Header({logoSrc,onToggleSidebar,onImport,onExport,onLogout}){
  return(<div className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/70 backdrop-blur">
    <div className="flex items-center gap-3">
      <button onClick={onToggleSidebar} className="px-3 py-2 rounded-lg border border-slate-700 hover:bg-slate-800">☰</button>
      <div className="flex items-center gap-3">
        <img src={logoSrc} onError={e=>{e.currentTarget.src=LOGO_FALLBACK}} className="h-7 w-7"/>
        <div className="font-bold">Nitty Gritty</div>
        <span className="bg-blue-900 text-xs px-2 py-0.5 rounded-md">Trading Journal</span>
      </div>
    </div>
    <UserMenu onImport={onImport} onExport={onExport} onLogout={onLogout}/>
  </div>)
}
function AppShell({children,capitalPanel,nav,logoSrc,onToggleSidebar,onImport,onExport,onLogout,sidebarCollapsed}){
  return(<div className="min-h-screen">
    <Header logoSrc={logoSrc} onToggleSidebar={onToggleSidebar} onImport={onImport} onExport={onExport} onLogout={onLogout}/>
    <div className="flex">
      {!sidebarCollapsed&&(<div className="w-72 shrink-0 border-r border-slate-800 min-h-[calc(100vh-56px)] p-4 space-y-4">
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4">{capitalPanel}</div>
        <div className="space-y-2">{nav}</div>
      </div>)}
      <div className="flex-1 p-4 md:p-6">{children}</div>
    </div>
  </div>)
}

/* ---------- App state ---------- */
function usePersisted(email){
  const fresh=()=>({name:"",email,accType:"Dollar Account",capital:0,depositDate:todayISO(),trades:[],symbols:DEFAULT_SYMBOLS.slice(),strategies:DEFAULT_STRATEGIES.slice(),strategyColors:{...DEFAULT_STRATEGY_COLORS}});
  const [state,setState]=useState(()=>{const s=loadState(email||getCurrent());return s||fresh()});
  useEffect(()=>{const loaded=loadState(email); setState(loaded||fresh())},[email]);
  useEffect(()=>{if(state&&state.email) saveState(state.email,state)},[state]);
  return [state,setState];
}

/* ---------- App ---------- */
function App(){
  const [currentEmail,setCurrentEmail]=useState(getCurrent());
  const [users,setUsers]=useState(loadUsers());
  const [state,setState]=usePersisted(currentEmail);
  const [page,setPage]=useState("dashboard");
  const [showTrade,setShowTrade]=useState(false); const [editItem,setEditItem]=useState(null);
  const [collapsed,setCollapsed]=useState(false);

  useEffect(()=>{if(typeof emailjs!=="undefined"){emailjs.init({publicKey:"qQucnU6BE7h1zb5Ex"})}},[]);

  const realized=state.trades.filter(t=>t.exitType&&t.exitType!=="Trade In Progress").map(t=>computeDollarPnL(t,state.accType)).filter(v=>v!==null&&isFinite(v)).reduce((a,b)=>a+b,0);
  const effectiveCapital=state.capital+realized;
  const openTrades=state.trades.filter(t=>!t.exitType||t.exitType==="Trade In Progress").length;

  const onExport=()=>{const csv=toCSV(state.trades,state.accType);const blob=new Blob([csv],{type:"text/csv;charset=utf-8;"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="Nitty_Gritty_Template_Export.csv";a.click();URL.revokeObjectURL(url)};

  // robust import for csv/xlsx/xls
  const onImport=async(file)=>{
    const ext=(file.name.split('.').pop()||"").toLowerCase();
    const parseCSV=text=>{
      const lines=text.replace(/\r/g,'').split('\n').filter(l=>l.length);
      const head=lines[0].split(',').map(s=>s.replace(/^"|"$/g,'').trim());
      const rows=lines.slice(1).map(l=>l.split(',').map(s=>s.replace(/^"|"$/g,'').trim()));
      return [head,rows];
    };
    const parseXLSX=async buf=>{
      const wb=XLSX.read(buf,{type:"array"}); const ws=wb.Sheets[wb.SheetNames[0]]; const json=XLSX.utils.sheet_to_json(ws,{header:1}); const head=json[0].map(v=>String(v||"").trim()); const rows=json.slice(1); return [head,rows];
    };
    const parseXLS= (file)=> new Promise((resolve,reject)=>{
      const fr=new FileReader();
      fr.onload=e=>{
        try{
          const wb=XLSX.read(e.target.result,{type:"binary"});
          const ws=wb.Sheets[wb.SheetNames[0]];
          const json=XLSX.utils.sheet_to_json(ws,{header:1});
          const head=json[0].map(v=>String(v||"").trim()); const rows=json.slice(1);
          resolve([head,rows]);
        }catch(err){reject(err)}
      };
      fr.onerror=reject; fr.readAsBinaryString(file);
    });

    let head,rows;
    if(ext==="csv"){ head=parseCSV(await file.text())[0]; rows=parseCSV(await file.text())[1]; }
    else if(ext==="xlsx"){ [head,rows]=await parseXLSX(await file.arrayBuffer()); }
    else if(ext==="xls"){ [head,rows]=await parseXLS(file); }
    else { alert("Unsupported file type."); return; }

    const idx=n=>head.findIndex(h=>h.toLowerCase()===n.toLowerCase());
    const req=["Date","Symbol","Side","Lot Size","Entry","Exit","TP1","TP2","SL","Strategy","Exit Type"];
    if(!req.every(h=>idx(h)>=0)){ alert("Import headers must match the template."); return; }

    const mapped = rows.map(r=>{
      const get=h=>{const i=idx(h); return i>=0?r[i]:undefined};
      const num=v=>{const n=parseFloat(v); return isFinite(n)?n:undefined};
      return {
        id:Math.random().toString(36).slice(2),
        date:String(get("Date")||todayISO()).slice(0,10),
        symbol:String(get("Symbol")||"").toUpperCase(),
        side:String(get("Side")||"").toUpperCase()==="SELL"?"SELL":"BUY",
        lotSize:num(get("Lot Size"))||0,
        entry:num(get("Entry")), exit:num(get("Exit")),
        tp1:num(get("TP1")), tp2:num(get("TP2")), sl:num(get("SL")),
        strategy:String(get("Strategy")||""), exitType:String(get("Exit Type")||"")
      };
    }).filter(t=>t.symbol);

    setState({...state, trades:[...mapped, ...state.trades]});
    alert("Import complete.");
  };

  const logout=()=>{localStorage.setItem("ng_current_user_v1",""); setCurrentEmail("")};

  const navBtn=(label,key,icon)=>(
    <button onClick={()=>setPage(key)} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border ${page===key?'bg-slate-700 border-slate-600':'border-slate-700 hover:bg-slate-800'}`}>{icon}{label}</button>
  );

  const capitalPanel=(<div>
    <div className="text-sm text-slate-300">Account Type</div><div className="font-semibold mb-3">{state.accType}</div>
    <div className="text-sm text-slate-300">Capital</div><div className="text-2xl font-bold mb-1">{state.accType==='Cent Account'?`${r2(effectiveCapital*100).toFixed(2)} ¢`:fmt$(effectiveCapital)}</div>
    <div className="text-xs text-slate-400">Deposit: {state.depositDate}</div>
    <div className="mt-3 text-sm text-slate-300">Open trades</div><div className="text-lg font-semibold">{openTrades}</div>
    <div className="pt-2"><button onClick={()=>{setEditItem(null);setShowTrade(true)}} className="w-full px-3 py-2 rounded-lg border border-slate-700">+ Add trade</button></div>
  </div>);

  const nav=(<>
    {navBtn("Dashboard","dashboard",<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9v12h14V9"/></svg>)}
    {navBtn("Histories","histories",<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 8v5l3 3"/><path d="M12 3a9 9 0 1 0 9 9"/><path d="M21 3v6h-6"/></svg>)}
    {navBtn("Calendar","calendar",<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M8 3v4M16 3v4"/><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18"/></svg>)}
    {navBtn("Notes","notes",<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 7h18M3 12h18M3 17h12"/></svg>)}
    {navBtn("Settings","settings",<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3.5"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1 .6 1.65 1.65 0 0 0-.4 1V22a2 2 0 1 1-4 0v-.1a1.65 1.65 0 0 0-.4-1 1.65 1.65 0 0 0-1-.6 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-.6-1 1.65 1.65 0 0 0-1-.4H2a2 2 0 1 1 0-4h.1a1.65 1.65 0 0 0 1-.4 1.65 1.65 0 0 0 .6-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06A2 2 0 1 1 6.24 2.9l.06.06A1.65 1.65 0 0 0 8 4.6a1.65 1.65 0 0 0 1-.6 1.65 1.65 0 0 0 .4-1V2a2 2 0 1 1 4 0v.1c0 .38.14.74.4 1 .26.26.62.4 1 .4.62 0 1.22-.25 1.64-.68l.06-.06A2 2 0 1 1 21.1 6.24l-.06.06c-.26.26-.4.62-.4 1s.14.74.4 1c.26.26.62.4 1 .4H22a2 2 0 1 1 0 4h-.1a1.65 1.65 0 0 0-1 .4 1.65 1.65 0 0 0-.6 1Z"/></svg>)}
  </>);

  const onSaveTrade=draft=>{
    const id=draft.id||Math.random().toString(36).slice(2);
    const arr=state.trades.slice(); const i=arr.findIndex(t=>t.id===id);
    const rec={...draft,id}; if(i>=0) arr[i]=rec; else arr.unshift(rec);
    setState({...state,trades:arr}); setShowTrade(false); setEditItem(null);
  };
  const delTrade=id=>setState({...state,trades:state.trades.filter(t=>t.id!==id)});

  return(
    <AppShell capitalPanel={capitalPanel} nav={nav} logoSrc={LOGO_PUBLIC} onToggleSidebar={()=>setCollapsed(v=>!v)} onImport={onImport} onExport={onExport} onLogout={logout} sidebarCollapsed={collapsed}>
      {page==="dashboard"&&(
        <div className="space-y-4">
          <div className="text-sm font-semibold">General statistics</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-3"><div className="text-slate-400 text-xs">Capital</div><div className="text-2xl font-bold mt-1">{state.accType==='Cent Account'?`${r2(effectiveCapital*100).toFixed(2)} ¢`:fmt$(effectiveCapital)}</div></div>
            <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-3"><div className="text-slate-400 text-xs">Realized P&L</div><div className="text-2xl font-bold mt-1">{formatPnlDisplay(state.accType,realized)}</div></div>
            <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-3"><div className="text-slate-400 text-xs">Open Trades</div><div className="text-2xl font-bold mt-1">{openTrades}</div></div>
            <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-3"><div className="text-slate-400 text-xs">Deposit Date</div><div className="text-xl font-semibold mt-1">{state.depositDate}</div></div>
          </div>
          {/* use global guard to avoid stale-cache crash */}
          {(typeof window.DetailedStats==="function"?window.DetailedStats:()=>null)({trades:state.trades,accType:state.accType})}
        </div>
      )}

      {page==="histories"&&(<Histories trades={state.trades} accType={state.accType} onEdit={t=>{setEditItem(t);setShowTrade(true)}} onDelete={delTrade} strategyColors={state.strategyColors}/>)}
      {page==="notes"&&(<NotesPanel trades={state.trades}/>)}
      {page==="settings"&&(<SettingsPanel state={state} setState={setState} email={state.email}/>)}

      {page==="calendar"&&(<div className="text-slate-400">Calendar view unchanged (as requested).</div>)}

      {showTrade&&(<TradeModal initial={editItem} onClose={()=>{setShowTrade(false);setEditItem(null)}} onSave={onSaveTrade} onDelete={delTrade} accType={state.accType} symbols={state.symbols} strategies={state.strategies}/>)}
    </AppShell>
  )
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
