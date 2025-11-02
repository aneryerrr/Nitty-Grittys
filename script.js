const {useState,useMemo,useEffect,useRef} = React;

/* ---------------- Icons ---------------- */
const iconCls="h-5 w-5";
const IconUser=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Z"/><path d="M4 20a8 8 0 0 1 16 0Z"/></svg>);
const IconLogout=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M9 21h4a4 4 0 0 0 4-4V7a4 4 0 0 0-4-4H9"/><path d="M16 12H3"/><path d="M7 8l-4 4 4 4"/></svg>);
const IconDownload=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M12 3v10"/><path d="M8 11l4 4 4-4"/><path d="M5 21h14v-4H5Z"/></svg>);
const IconUpload=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M12 21V11"/><path d="M8 13l4-4 4 4"/><path d="M5 3h14v4H5z"/></svg>);
const IconCalendar=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M8 3v4M16 3v4"/><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18"/></svg>);
const IconPlus=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M12 5v14M5 12h14"/></svg>);
const IconHistory=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M12 8v5l3 3"/><path d="M12 3a9 9 0 1 0 9 9"/><path d="M21 3v6h-6"/></svg>);
const IconSettings=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.65 1.65 0  0 0 15 19.4a1.65 1.65 0  0 0-1 .6 1.65 1.65 0  0 0-.4 1V22a2 2 0  1 1-4 0v-.1a1.65 1.65 0  0 0-.4-1 1.65 1.65 0  0 0-1-.6 1.65 1.65 0  0 0-1.82.33l-.06.06a2 2 0  1 1-2.83-2.83l.06-.06A1.65 1.65 0  0 0 4.6 15a1.65 1.65 0  0 0-.6-1 1.65 1.65 0  0 0-1-.4H2a2 2 0  1 1 0-4h.1a1.65 1.65 0  0 0 1-.4 1.65 1.65 0  0 0 .6-1 1.65 1.65 0  0 0-.33-1.82l-.06-.06A2 2 0  1 1 6.24 2.9l.06.06A1.65 1.65 0  0 0 8 4.6a1.65 1.65 0  0 0 1-.6 1.65 1.65 0  0 0 .4-1V2a2 2 0  1 1 4 0v.1c0 .38.14.74.4 1 .26.26.62.4 1 .4.62 0 1.22-.25 1.64-.68l.06-.06A2 2 0  1 1 21.1 6.24l-.06.06c-.26.26-.4.62-.4 1s.14.74.4 1c.26.26.62.4 1 .4H22a2 2 0  1 1 0 4h-.1a1.65 1.65 0  0 0-1 .4 1.65 1.65 0  0 0-.6 1Z"/></svg>);
const IconHome=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9v12h14V9"/></svg>);
const IconNote=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M4 3h12l4 4v14H4z"/><path d="M16 3v5h5"/></svg>);

/* ---------------- Constants ---------------- */
const LOGO_PUBLIC="/logo-ng.png"; const LOGO_FALLBACK="./logo-ng.png.png";
const SYMBOLS=["XAUUSD","US100","US30","EURUSD","BTCUSD","AUDCAD","USDCAD","USDJPY","GBPUSD"];
const STRATEGIES=["Trend Line Bounce","2 Touch Point Trend Line Break","3 / 3+ Touch Point Trend Line Break","Trend Line Break & Re-test","Trend Continuation","Imported"];
const EXIT_TYPES=["TP","SL","TP1_BE","TP1_SL","BE","Trade In Progress"];
const ACC_TYPES=["Cent Account","Dollar Account"];

const r2=n=>Math.round(n*100)/100;
const fmt$=n=>"$"+(isFinite(n)?r2(n):0).toFixed(2);
const todayISO=()=>{const d=new Date();const tz=d.getTimezoneOffset();return new Date(d.getTime()-tz*60000).toISOString().slice(0,10)};

/* ---------------- Local Storage helpers ---------------- */
const USERS_KEY="ng_users_v1";
const CURR_KEY="ng_current_user_v1";
const loadUsers=()=>{try{return JSON.parse(localStorage.getItem(USERS_KEY)||"[]")}catch{return[]}};
const saveUsers=u=>{try{localStorage.setItem(USERS_KEY,JSON.stringify(u))}catch{}};
const saveCurrent=e=>{try{localStorage.setItem(CURR_KEY,e)}catch{}};
const getCurrent=()=>{try{return localStorage.getItem(CURR_KEY)||""}catch{return""}};
const loadState=e=>{try{return JSON.parse(localStorage.getItem("ng_state_"+e)||"null")}catch{return null}};
const saveState=(e,s)=>{try{localStorage.setItem("ng_state_"+e,JSON.stringify(s))}catch{}};

/* ---------------- PnL Math (with override support) ---------------- */
function perLotValueForMove(symbol,delta,accType){
  const abs=Math.abs(delta);const isStd=accType==="Dollar Account";const mult=std=>isStd?std:std/100;
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
  const s=side==="BUY"?Math.sign(exit-entry):-Math.sign(exit-entry);
  return raw*s;
}
function computeDollarPnL(t,accType){
  // Manual override if provided (including CSV-imported P&L)
  if (t && typeof t.pnlOverride === 'number' && isFinite(t.pnlOverride)) return t.pnlOverride;

  if(t.exitType === "Trade In Progress") return null;
  if(typeof t.exit==="number"&&(!t.exitType||t.exitType==="TP")) return legPnL(t.symbol,t.side,t.entry,t.exit,t.lotSize,accType);
  const has=v=>typeof v==="number"&&isFinite(v);const{entry,sl,tp1,tp2,lotSize:lot}=t;
  switch(t.exitType){
    case"SL":if(!has(sl))return null;return legPnL(t.symbol,t.side,entry,sl,lot,accType);
    case"TP":if(has(tp2))return legPnL(t.symbol,t.side,entry,tp2,lot,accType);if(has(tp1))return legPnL(t.symbol,t.side,entry,tp1,lot,accType);return null;
    case"TP1_BE":if(!has(tp1))return null;return (legPnL(t.symbol,t.side,entry,tp1,lot,accType)+0)/2;
    case"TP1_SL":if(!has(tp1)||!has(sl))return null;return (legPnL(t.symbol,t.side,entry,tp1,lot,accType)+legPnL(t.symbol,t.side,entry,sl,lot,accType))/2;
    case"BE":return 0;
    default:return null;
  }
}
const formatPnlDisplay=(accType,v)=>accType==="Cent Account"?(r2(v*100)).toFixed(2)+" ¢":fmt$(v);
const formatUnits=(accType,v)=>accType==="Dollar Account"?r2(v).toFixed(2):r2(v*100).toFixed(2);

/* ---------------- Export ---------------- */
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
function Stat({label,value}){return(<div className="bg-slate-900/50 border border-slate-700 rounded-xl p-3"><div className="text-slate-400 text-xs">{label}</div><div className="text-2xl font-bold mt-1">{value}</div></div>)}
function Th({children,className,...rest}){return(<th {...rest} className={(className?className+" ":"")+"px-4 py-3 text-left font-semibold text-slate-300"}>{children}</th>)}
function Td({children,className,...rest}){return(<td {...rest} className={(className?className+" ":"")+"px-4 py-3 align-top"}>{children}</td>)}
const num=(v)=>(v===""||v===undefined||v===null)?undefined:parseFloat(v);

/* ---------------- Modals ---------------- */
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

/* Account setup (unchanged visually) */
function AccountSetupModal({name,setName,accType,setAccType,capital,setCapital,depositDate,setDepositDate,onClose,email}){
  const [tab,setTab]=useState("personal");
  const [pw1,setPw1]=useState(""); const [pw2,setPw2]=useState(""); const [msg,setMsg]=useState("");
  const savePw=()=>{ if(!pw1||pw1.length<6){setMsg("Password must be at least 6 characters.");return}
    if(pw1!==pw2){setMsg("Passwords do not match.");return}
    const users=loadUsers(); const i=users.findIndex(u=>u.email.toLowerCase()===(email||"").toLowerCase());
    if(i>=0){users[i].password=pw1; saveUsers(users); setMsg("Password updated."); setPw1(""); setPw2("")}
  };
  return(
    <Modal title="Account Setup" onClose={onClose} maxClass="max-w-2xl">
      <div className="flex gap-2 mb-4">
        <button onClick={()=>setTab("personal")} className={`px-3 py-1.5 rounded-lg border ${tab==="personal"?"bg-slate-700 border-slate-600":"border-slate-700"}`}>Personal Info</button>
        <button onClick={()=>setTab("security")} className={`px-3 py-1.5 rounded-lg border ${tab==="security"?"bg-slate-700 border-slate-600":"border-slate-700"}`}>Privacy & Security</button>
      </div>
      {tab==="personal"?(
        <div className="space-y-4">
          <div><label className="text-sm text-slate-300">Name</label><input value={name} onChange={e=>setName(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className="text-sm text-slate-300">Acc Type</label><select value={accType} onChange={e=>setAccType(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2">{ACC_TYPES.map(s=><option key={s}>{s}</option>)}</select></div>
            <div><label className="text-sm text-slate-300">Account Capital ($)</label><input type="number" value={capital} onChange={e=>setCapital(parseFloat(e.target.value||"0"))} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2" placeholder="0.00"/></div>
            <div><label className="text-sm text-slate-300">Capital Deposit Date</label><input type="date" value={depositDate} onChange={e=>setDepositDate(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
          </div>
          <div className="text-right"><button onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-700 hover:bg-slate-900">Save & Close</button></div>
        </div>
      ):(
        <div className="space-y-3">
          <div><label className="text-sm text-slate-300">New Password</label><input type="password" value={pw1} onChange={e=>setPw1(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
          <div><label className="text-sm text-slate-300">Confirm Password</label><input type="password" value={pw2} onChange={e=>setPw2(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
          {msg&&<div className="text-sky-400 text-sm">{msg}</div>}
          <div className="text-right"><button onClick={savePw} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500">Update Password</button></div>
        </div>
      )}
    </Modal>
  )
}

/* Settings (adds Customize tab with DnD + toggles) */
function SettingsPanel({
  name,setName,accType,setAccType,capital,setCapital,depositDate,setDepositDate,email,
  widgets,setWidgets, order, setOrder
}){
  const [tab,setTab]=useState("personal"); 
  const [pw1,setPw1]=useState(""); const [pw2,setPw2]=useState(""); const [msg,setMsg]=useState("");
  const savePw=()=>{ if(!pw1||pw1.length<6){setMsg("Password must be at least 6 characters.");return}
    if(pw1!==pw2){setMsg("Passwords do not match.");return}
    const users=loadUsers();const i=users.findIndex(u=>u.email.toLowerCase()===(email||"").toLowerCase());
    if(i>=0){users[i].password=pw1;saveUsers(users);setMsg("Password updated.");setPw1("");setPw2("")}
  };
  const widgetLabels = { general: "General statistics", best: "Best strategy", detailed: "Detailed statistics" };
  const [dragIdx,setDragIdx]=useState(null);
  const toggle=(k)=> setWidgets({...widgets, [k]: !widgets[k]});
  const reset=()=> setWidgets({general:true,best:true,detailed:true});
  const onDragOver=(e,i)=>{e.preventDefault(); if(dragIdx===null||dragIdx===i)return; const next=[...order]; const [m]=next.splice(dragIdx,1); next.splice(i,0,m); setOrder(next); setDragIdx(i);};
  const onDrop=()=>setDragIdx(null);

  return(
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4"><IconSettings/><div className="font-semibold">Settings</div></div>
      <div className="flex gap-2 mb-4">
        <button onClick={()=>setTab("personal")} className={`px-3 py-1.5 rounded-lg border ${tab==="personal"?"bg-slate-700 border-slate-600":"border-slate-700"}`}>Personal Info</button>
        <button onClick={()=>setTab("security")} className={`px-3 py-1.5 rounded-lg border ${tab==="security"?"bg-slate-700 border-slate-600":"border-slate-700"}`}>Privacy & Security</button>
        <button onClick={()=>setTab("customize")} className={`px-3 py-1.5 rounded-lg border ${tab==="customize"?"bg-slate-700 border-slate-600":"border-slate-700"}`}>Customize Journal</button>
      </div>

      {tab==="personal"&&(
        <div className="space-y-4">
          <div><label className="text-sm text-slate-300">Name</label><input value={name} onChange={e=>setName(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className="text-sm text-slate-300">Acc Type</label><select value={accType} onChange={e=>setAccType(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2">{ACC_TYPES.map(s=><option key={s}>{s}</option>)}</select></div>
            <div><label className="text-sm text-slate-300">Account Capital ($)</label><input type="number" value={capital} onChange={e=>setCapital(parseFloat(e.target.value||"0"))} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2" placeholder="0.00"/></div>
            <div><label className="text-sm text-slate-300">Capital Deposit Date</label><input type="date" value={depositDate} onChange={e=>setDepositDate(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
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
        <div className="space-y-4">
          <div className="text-sm text-slate-300">Drag to reorder your dashboard. Toggle visibility per widget.</div>
          <ul className="space-y-2">
            {order.map((k,i)=>(
              <li key={k}
                  draggable
                  onDragStart={()=>setDragIdx(i)}
                  onDragOver={(e)=>onDragOver(e,i)}
                  onDrop={onDrop}
                  className="flex items-center justify-between bg-slate-900/50 border border-slate-700 rounded-xl p-3">
                <div className="flex items-center gap-3">
                  <span className="cursor-grab select-none">⋮⋮</span>
                  <span className="font-medium">{widgetLabels[k]}</span>
                </div>
                <label className="flex items-center gap-2 text-xs">
                  <input type="checkbox" checked={widgets[k]} onChange={()=>toggle(k)}/>
                  <span>Show</span>
                </label>
              </li>
            ))}
          </ul>
          <div className="flex gap-2 pt-2">
            <button onClick={()=>setOrder(['general','best','detailed'])} className="px-3 py-2 rounded-lg border border-slate-700 hover:bg-slate-900">Reset order</button>
            <button onClick={reset} className="px-3 py-2 rounded-lg border border-slate-700 hover:bg-slate-900">Reset visibility</button>
          </div>
        </div>
      )}
    </div>
  )
}

/* Trade modal (adds P&L override input) */
function TradeModal({initial,onClose,onSave,onDelete,accType}){
  const i=initial||{}; const [symbol,setSymbol]=useState(i.symbol||SYMBOLS[0]); const [side,setSide]=useState(i.side||"BUY");
  const [date,setDate]=useState(i.date||todayISO()); const [lotSize,setLotSize]=useState(i.lotSize??0.01);
  const [entry,setEntry]=useState(i.entry??""); const [exit,setExit]=useState(i.exit??"");
  const [tp1,setTp1]=useState(i.tp1??""); const [tp2,setTp2]=useState(i.tp2??""); const [sl,setSl]=useState(i.sl??"");
  const [strategy,setStrategy]=useState(i.strategy||STRATEGIES[0]); const [exitType,setExitType]=useState(i.exitType||"TP");
  const [pnlOverride,setPnlOverride]=useState(i.pnlOverride ?? "");
  const draft=useMemo(()=>({id:i.id,date,symbol,side,lotSize:parseFloat(lotSize||0),entry:num(entry),exit:num(exit),tp1:num(tp1),tp2:num(tp2),sl:num(sl),strategy,exitType,pnlOverride:num(pnlOverride)}),[i.id,date,symbol,side,lotSize,entry,exit,tp1,tp2,sl,strategy,exitType,pnlOverride]);
  const preview=useMemo(()=>{const v=computeDollarPnL(draft,accType);if(v===null||!isFinite(v))return"-";return`${formatPnlDisplay(accType,v)} (${formatUnits(accType,v)})`},[draft,accType]);

  return(
    <Modal title={i.id?"Edit Trade":"Add Trade"} onClose={onClose} maxClass="max-w-4xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <div><label className="text-sm text-slate-300">Symbol</label><select value={symbol} onChange={e=>setSymbol(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2">{SYMBOLS.map(s=><option key={s}>{s}</option>)}</select></div>
        <div><label className="text-sm text-slate-300">Action</label><div className="mt-1 grid grid-cols-2 gap-2">{["BUY","SELL"].map(s=>(<button key={s} onClick={()=>setSide(s)} className={`px-2 py-2 rounded-lg border ${side===s ? (s==="BUY" ? "bg-green-600 border-green-500" : "bg-red-600 border-red-500") : "border-slate-700"}`}>{s}</button>))}</div></div>
        <div><label className="text-sm text-slate-300">Date</label><input type="date" value={date} onChange={e=>setDate(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
        <div><label className="text-sm text-slate-300">Lot size</label><input type="number" step="0.01" value={lotSize} onChange={e=>setLotSize(e.target.value)} className="w-24 mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
        <div><label className="text-sm text-slate-300">Entry price</label><input type="number" step="0.0001" value={entry} onChange={e=>setEntry(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
        <div><label className="text-sm text-slate-300">Exit Price</label><input type="number" step="0.0001" value={exit} onChange={e=>setExit(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2" placeholder="Leave blank for OPEN"/></div>
        <div><label className="text-sm text-slate-300">TP 1</label><input type="number" step="0.0001" value={tp1} onChange={e=>setTp1(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
        <div><label className="text-sm text-slate-300">TP 2</label><input type="number" step="0.0001" value={tp2} onChange={e=>setTp2(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
        <div><label className="text-sm text-slate-300">Stop-Loss</label><input type="number" step="0.0001" value={sl} onChange={e=>setSl(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
        <div><label className="text-sm text-slate-300">Strategy</label><select value={strategy} onChange={e=>setStrategy(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2">{STRATEGIES.map(s=><option key={s}>{s}</option>)}</select></div>
        <div><label className="text-sm text-slate-300">Exit Type</label><select value={exitType} onChange={e=>setExitType(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2">{EXIT_TYPES.map(s=><option key={s}>{s}</option>)}</select></div>
        <div><label className="text-sm text-slate-300">P&L override ($, optional)</label><input type="number" step="0.01" value={pnlOverride??""} onChange={e=>setPnlOverride(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2" placeholder="Leave blank to auto-calc"/></div>
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

/* Calendar modal (unchanged functionally) */
function CalendarModal({onClose,trades,view,setView,month,setMonth,year,setYear,selectedDate,setSelectedDate,accType}){
  const monthNames=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']; const dayNames=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const dim=(y,m)=>new Date(y,m+1,0).getDate(); const fd=(y,m)=>new Date(y,m,1).getDay();
  const byDate=useMemo(()=>{const m={};for(const t of trades){m[t.date]=m[t.date]||[];m[t.date].push(t)}return m},[trades]);
  const pnlByDate=useMemo(()=>{const m={};for(const date in byDate){const ts=byDate[date].filter(t=>t.exitType && t.exitType !== "Trade In Progress");const pnl=ts.reduce((a,t)=>a+ (computeDollarPnL(t,accType) || 0),0);m[date]=pnl}return m},[byDate,accType]);
  return(
    <Modal title="Calendar" onClose={onClose} maxClass="max-w-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex gap-2">{['year','month','day'].map(v=>(<button key={v} onClick={()=>setView(v)} className={`px-3 py-1.5 rounded-lg border ${view===v?'bg-slate-700 border-slate-600':'border-slate-700'}`}>{v.toUpperCase()}</button>))}</div>
        {view!=="day"&&(<div className="flex items-center gap-2">
          <button onClick={()=>view==='month'?(setMonth(m=>(m+11)%12),setYear(year-(month===0?1:0))):setYear(year-1)} className="px-2 py-1 border border-slate-700 rounded-lg">&lt;</button>
          <div className="text-sm">{view==='month'?`${monthNames[month]} ${year}`:year}</div>
          <button onClick={()=>view==='month'?(setMonth(m=>(m+1)%12),setYear(year+(month===11?1:0))):setYear(year+1)} className="px-2 py-1 border border-slate-700 rounded-lg">&gt;</button>
        </div>)}
      </div>
      {view==="year"&&(
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {monthNames.map((mn,i)=>(<div key={mn} className="bg-slate-900/50 border border-slate-700 rounded-lg p-1 text-sm">
            <div className="font-semibold mb-1">{mn}</div>
            <div className="text-slate-400 text-xs mb-1">Trades: {trades.filter(t=>(new Date(t.date)).getMonth()===i&&(new Date(t.date)).getFullYear()===year).length}</div>
            <button onClick={()=>{setMonth(i);setView('month')}} className="px-2 py-1 rounded-lg border border-slate-700 hover:bg-slate-800 text-xs">Open</button>
          </div>))}
        </div>
      )}
      {view==="month"&&(
        <div>
          <div className="grid grid-cols-7 text-center text-xs text-slate-400 mb-1">{dayNames.map(d=><div key={d} className="py-1">{d}</div>)}</div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({length:fd(year,month)}).map((_,i)=>(<div key={"e"+i}/>))}
            {Array.from({length:dim(year,month)}).map((_,d)=>{const day=String(d+1).padStart(2,'0');const dateISO=`${year}-${String(month+1).padStart(2,'0')}-${day}`;const items=byDate[dateISO]||[];const pnl=pnlByDate[dateISO]||0;
              const colorClass=pnl>0 ? 'border-green-700/60 bg-green-900/10' : pnl<0 ? 'border-red-700/60 bg-red-900/10' : items.length ? 'border-blue-700/60 bg-blue-900/10' : 'border-slate-700 bg-slate-900/30';
              return(<button key={dateISO} onClick={()=>{setSelectedDate(dateISO);setView('day')}} className={`text-left p-1 rounded-lg border ${colorClass}`}>
                <div className="text-xs text-slate-400">{d+1}</div>
                <div className={`text-xs ${pnl>0?'text-green-400':pnl<0?'text-red-400':'text-slate-400'}`}>{pnl!==0 ? formatPnlDisplay(accType,pnl) : ''}</div>
              </button>)})}
          </div>
        </div>
      )}
      {view==="day"&&(
        <div>
          <div className="text-sm text-slate-300 mb-2">{selectedDate}</div>
          {(byDate[selectedDate]||[]).length===0?(<div className="text-slate-400 text-sm">No trades this day.</div>):(
            <div className="space-y-2">{(byDate[selectedDate]||[]).map(t=>(<div key={t.id} className="bg-slate-900/50 border border-slate-700 rounded-xl p-3 flex items-center justify-between">
              <div className="text-sm"><span className="text-blue-300 font-medium">{t.symbol}</span> · {t.side} · Lot {t.lotSize}</div>
              <div className="text-sm">{typeof t.entry==='number'?fmt$(t.entry):''} → {typeof t.exit==='number'?fmt$(t.exit):''}</div>
            </div>))}</div>
          )}
        </div>
      )}
    </Modal>
  )
}

/* Best Strategy Card */
function BestStrategyCard({trades,accType}){
  const stats = useMemo(()=>{
    const by = {};
    for(const t of trades){
      if(!t.exitType || t.exitType==="Trade In Progress") continue;
      const s = t.strategy || "Imported";
      const v = computeDollarPnL(t,accType);
      if (v===null || !isFinite(v)) continue;
      if(!by[s]) by[s] = {cnt:0,wins:0,losses:0};
      by[s].cnt++;
      if(v>0) by[s].wins++; else if(v<0) by[s].losses++;
    }
    let best = null;
    for(const k of Object.keys(by)){
      const o=by[k]; if(o.cnt<3) continue;
      const wr = o.cnt ? Math.round((o.wins/o.cnt)*100) : 0;
      if(!best || wr>best.wr) best = {name:k, ...o, wr};
    }
    return best;
  },[trades,accType]);

  return(
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4">
      <div className="text-sm font-semibold mb-2">Best strategy</div>
      {!stats ? (
        <div className="text-slate-400 text-sm">Not enough data yet. Enter at least <span className="font-semibold">3 trades</span> for a strategy.</div>
      ) : (
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold">{stats.name}</div>
            <div className="text-slate-400 text-sm">Trades: {stats.cnt} · Wins: {stats.wins} · Losses: {stats.losses}</div>
          </div>
          <div className="text-3xl font-extrabold text-blue-300">{stats.wr}%</div>
        </div>
      )}
    </div>
  )
}

/* Notes */
function NoteComposeModal({onClose,onSave,trades,accType}){
  const [text,setText]=useState("");
  const [refs,setRefs]=useState([]);
  const addRef=(id)=>{ if(!id) return; if(refs.includes(id)) return; setRefs([...refs,id]); }
  const removeRef=(id)=> setRefs(refs.filter(r=>r!==id));
  const refTrade=(id)=>trades.find(t=>t.id===id);

  return(
    <Modal title="New note" onClose={onClose} maxClass="max-w-3xl">
      <div className="space-y-3">
        <textarea rows={6} value={text} onChange={e=>setText(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2" placeholder="Write your trading thoughts for today..." />
        <div>
          <div className="text-sm text-slate-300 mb-1">Attach a trade</div>
          <div className="flex gap-2">
            <select className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"
              onChange={e=>addRef(e.target.value)} defaultValue="">
              <option value="" disabled>Select from history…</option>
              {trades.slice(0,50).map(t=><option key={t.id} value={t.id}>{t.date} · {t.symbol} · {t.side} · lot {t.lotSize}</option>)}
            </select>
          </div>
        </div>

        {refs.length>0 && (
          <div className="space-y-2">
            {refs.map(id=>{
              const t = refTrade(id); if(!t) return null;
              const v = computeDollarPnL(t,accType);
              const closed = t.exitType && t.exitType!=="Trade In Progress";
              return (
                <div key={id} className="glow-card flex items-center justify-between">
                  <div className="text-sm">
                    <div className="font-semibold text-blue-300">{t.symbol}</div>
                    <div className={`${v>0?'text-green-400':v<0?'text-red-400':'text-slate-300'} text-sm`}>
                      {v===null?'-':formatPnlDisplay(accType,v)} · {closed?'CLOSED':'OPEN'}
                    </div>
                    <div className="text-slate-400 text-xs">Strategy: {t.strategy || '—'}</div>
                  </div>
                  <button onClick={()=>removeRef(id)} className="px-2 py-1 rounded-lg border border-slate-700 hover:bg-slate-800">Remove</button>
                </div>
              )
            })}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-600 hover:bg-slate-700">Discard</button>
          <button onClick={()=>onSave({id:Math.random().toString(36).slice(2), date:todayISO(), text, refs, createdAt:Date.now()})} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500">Save</button>
        </div>
      </div>
    </Modal>
  )
}
function NotesView({notes,trades,accType,onAdd,onDelete}){
  const [compose,setCompose]=useState(true); // open compose when entering Notes
  return(
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold">Notes</div>
        {!compose && <button onClick={()=>setCompose(true)} className="px-3 py-2 rounded-lg border border-slate-700 hover:bg-slate-800"><IconPlus/> New</button>}
      </div>
      {compose ? (
        <NoteComposeModal onClose={()=>setCompose(false)} onSave={(n)=>{onAdd(n); setCompose(false)}} trades={trades} accType={accType}/>
      ) : (
        <div className="space-y-3">
          {notes.length===0 ? (
            <div className="text-slate-400 text-sm">No notes yet. Click <span className="font-semibold">New</span> to write your first note.</div>
          ) : notes.slice().sort((a,b)=>b.createdAt-a.createdAt).map(n=>(
            <div key={n.id} className="bg-slate-900/50 border border-slate-700 rounded-xl p-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">{n.date}</div>
                <button onClick={()=>onDelete(n.id)} className="px-2 py-1 rounded-lg border border-red-700 text-red-300 hover:bg-red-900/20">Delete</button>
              </div>
              <div className="text-slate-200 text-sm mt-1 line-clamp-4 whitespace-pre-wrap">{n.text}</div>
              {n.refs?.length>0 && (
                <div className="mt-2 grid md:grid-cols-2 gap-2">
                  {n.refs.map(id=>{
                    const t=trades.find(x=>x.id===id); if(!t) return null;
                    const v = computeDollarPnL(t,accType); const closed = t.exitType && t.exitType!=="Trade In Progress";
                    return (
                      <div key={id} className="glow-card">
                        <div className="text-xs text-slate-400">{t.date}</div>
                        <div className="font-semibold text-blue-300">{t.symbol}</div>
                        <div className={`${v>0?'text-green-400':v<0?'text-red-400':'text-slate-300'} text-sm`}>
                          {v===null?'-':formatPnlDisplay(accType,v)} · {closed?'CLOSED':'OPEN'}
                        </div>
                        <div className="text-slate-400 text-xs">Strategy: {t.strategy || '—'}</div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* User menu with Export + Import + Logout */
function UserMenu({onExport,onImportClick,onLogout}){
  const [open,setOpen]=useState(false);
  return(
    <div className="relative">
      <button onClick={()=>setOpen(v=>!v)} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-700 hover:bg-slate-800"><IconUser/></button>
      {open&&(<div className="absolute right-0 mt-2 w-52 bg-slate-800 border border-slate-700 rounded-xl shadow-lg overflow-hidden">
        <button onClick={()=>{setOpen(false);onExport()}} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-700"><IconDownload/>Export CSV</button>
        <button onClick={()=>{setOpen(false);onImportClick()}} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-700"><IconUpload/>Import CSV</button>
        <button onClick={()=>{setOpen(false);onLogout()}} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-700 text-red-300"><IconLogout/>Logout</button>
      </div>)}
    </div>
  )
}

/* General stats (unchanged) */
function GeneralStats({trades,accType,capital,depositDate}){
  const realized=trades.filter(t=>new Date(t.date)>=new Date(depositDate)&&t.exitType && t.exitType !== "Trade In Progress");
  const pnl=realized.map(t=>computeDollarPnL(t,accType)).filter(v=>v!==null&&isFinite(v));
  const total=pnl.reduce((a,b)=>a+b,0); const wins=pnl.filter(v=>v>0).length; const losses=pnl.filter(v=>v<0).length;
  const open=trades.filter(t=> !t.exitType || t.exitType === "Trade In Progress").length; const wr=(wins+losses)>0?Math.round((wins/(wins+losses))*100):0;
  return(<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
    <Stat label="Capital" value={accType==='Cent Account'?`${r2(capital*100).toFixed(2)} ¢`:fmt$(capital)}/>
    <Stat label="Realized P&L" value={formatPnlDisplay(accType,total)}/>
    <Stat label="Win Rate" value={`${wr}%`}/>
    <Stat label="Open" value={open}/>
  </div>)
}

/* Detailed stats (unchanged) */
function DetailedStats({trades,accType}){
  const rows=useMemo(()=>{const m={};for(const t of trades){const k=t.symbol||"N/A";const v=computeDollarPnL(t,accType);const s=m[k]||{count:0,pnl:0};s.count+=1;s.pnl+=(v&&isFinite(v))?v:0;m[k]=s}return Object.entries(m).map(([sym,v])=>({sym,count:v.count,pnl:v.pnl}))},[trades,accType]);
  return(<div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4">
    <div className="text-sm font-semibold mb-2">Detailed Statistics</div>
    <div className="overflow-auto"><table className="min-w-full text-sm"><thead><tr><Th>Symbol</Th><Th>Trades</Th><Th>Total P&L</Th><Th>P&L (Units)</Th></tr></thead>
      <tbody>{rows.map(r=>(
        <tr key={r.sym} className="border-t border-slate-700">
          <Td>{r.sym}</Td><Td>{r.count}</Td><Td>{formatPnlDisplay(accType,r.pnl)}</Td><Td>{formatUnits(accType,r.pnl)}</Td>
        </tr>))}</tbody></table></div>
  </div>)
}

/* Histories (unchanged layout) */
function Histories({trades,accType,onEdit,onDelete}){
  return(<div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4">
    <div className="flex items-center justify-between mb-2"><div className="text-sm font-semibold">Trade History</div></div>
    <div className="overflow-auto"><table className="min-w-full text-sm">
      <thead><tr><Th>Date</Th><Th>Symbol</Th><Th>Side</Th><Th>Lot size</Th><Th>Entry</Th><Th>Exit</Th><Th>TP1</Th><Th>TP2</Th><Th>SL</Th><Th>Exit Type</Th><Th>P&L</Th><Th>P&L (Units)</Th><Th>Status</Th><Th>Actions</Th></tr></thead>
      <tbody>{trades.map(t=>{const v=computeDollarPnL(t,accType);const closed= t.exitType && t.exitType !== "Trade In Progress";return(<tr key={t.id} className="border-t border-slate-700">
        <Td>{t.date}</Td><Td>{t.symbol}</Td><Td>{t.side}</Td><Td>{t.lotSize}</Td>
        <Td>{typeof t.entry==='number'?t.entry:''}</Td><Td>{typeof t.exit==='number'?t.exit:''}</Td>
        <Td>{typeof t.tp1==='number'?t.tp1:''}</Td><Td>{typeof t.tp2==='number'?t.tp2:''}</Td><Td>{typeof t.sl==='number'?t.sl:''}</Td>
        <Td>{t.exitType||""}</Td>
        <Td className={v>0?'text-green-400':v<0?'text-red-400':''}>{v===null?'-':formatPnlDisplay(accType,v)}</Td>
        <Td className={v>0?'text-green-400':v<0?'text-red-400':''}>{v===null?'-':formatUnits(accType,v)}</Td>
        <Td>{closed?'CLOSED':'OPEN'}</Td>
        <Td><div className="flex gap-2">
          <button onClick={()=>onEdit(t)} className="px-2 py-1 rounded-lg border border-slate-700 hover:bg-slate-700">✎</button>
          <button onClick={()=>onDelete(t.id)} className="px-2 py-1 rounded-lg border border-red-700 text-red-300 hover:bg-red-900/20">✕</button>
        </div></Td>
      </tr>)})}</tbody></table></div>
  </div>)
}

/* Header/AppShell */
function Header({logoSrc,onToggleSidebar,onExport,onImportClick,onLogout}){
  return(<div className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/70 backdrop-blur">
    <div className="flex items-center gap-3">
      <button onClick={onToggleSidebar} className="px-3 py-2 rounded-lg border border-slate-700 hover:bg-slate-800">☰</button>
      <div className="flex items-center gap-3">
        <img src={logoSrc} onError={e=>{e.currentTarget.src=LOGO_FALLBACK}} className="h-7 w-7"/>
        <div className="font-bold">Nitty Gritty</div>
        <span className="bg-blue-900 text-xs px-2 py-0.5 rounded-md">Trading Journal</span>
      </div>
    </div>
    <UserMenu onExport={onExport} onImportClick={onImportClick} onLogout={onLogout}/>
  </div>)
}
function AppShell({children,capitalPanel,nav,logoSrc,onToggleSidebar,onExport,onImportClick,onLogout,sidebarCollapsed}){
  return(<div className="min-h-screen">
    <Header logoSrc={logoSrc} onToggleSidebar={onToggleSidebar} onExport={onExport} onImportClick={onImportClick} onLogout={onLogout}/>
    <div className="flex">
      {!sidebarCollapsed&&(<div className="w-72 shrink-0 border-r border-slate-800 min-h-[calc(100vh-56px)] p-4 space-y-4">
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4">{capitalPanel}</div>
        <div className="space-y-2">{nav}</div>
      </div>)}
      <div className="flex-1 p-4 md:p-6">{children}</div>
    </div>
  </div>)
}

/* LoginView (unchanged) */
function LoginView({onLogin,onSignup,initGoogle,resetStart}){
  const [mode,setMode]=useState("login");
  const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [showPw,setShowPw]=useState(false);
  const [name,setName]=useState(""); const [confirm,setConfirm]=useState(""); const [err,setErr]=useState("");
  const googleDiv=useRef(null);
  useEffect(()=>{initGoogle(googleDiv.current,(payloadEmail)=>{setErr(""); onLogin(payloadEmail,"__google__",()=>{})})},[]);
  const submit=()=>{setErr(""); if(mode==="login"){if(!email||!password)return setErr("Fill all fields."); onLogin(email,password,setErr)}
    else{if(!name||!email||!password||!confirm)return setErr("Fill all fields."); if(password!==confirm)return setErr("Passwords do not match."); onSignup(name,email,password,setErr)}};
  return(<div className="min-h-screen grid md:grid-cols-2">
    <div className="hidden md:flex hero items-center justify-center">
      <div className="max-w-sm text-center px-6">
        <div className="text-3xl font-semibold">Trade smart. Log smarter.</div>
        <div className="mt-3 text-slate-300">“Discipline is choosing what you want most over what you want now.”</div>
      </div>
    </div>
    <div className="flex items-center justify-center p-6">
      <div className="w-[92vw] max-w-md bg-slate-800 border border-slate-700 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <img src={LOGO_PUBLIC} onError={e=>{e.currentTarget.src=LOGO_FALLBACK}} className="h-8 w-8"/><div className="text-xl font-bold">Nitty Gritty</div>
        </div>
        <div className="flex gap-2 mb-4">
          <button onClick={()=>setMode("login")} className={`flex-1 px-3 py-2 rounded-lg border ${mode==="login"?"bg-slate-700 border-slate-600":"border-slate-700"}`}>Login</button>
          <button onClick={()=>setMode("signup")} className={`flex-1 px-3 py-2 rounded-lg border ${mode==="signup"?"bg-slate-700 border-slate-600":"border-slate-700"}`}>Sign up</button>
        </div>
        {mode==="signup"&&(<div className="mb-3"><label className="text-sm text-slate-300">Name</label><input value={name} onChange={e=>setName(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>)}
        <div className="mb-3"><label className="text-sm text-slate-300">Email</label><input value={email} onChange={e=>setEmail(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
        <div className="mb-2">
          <label className="text-sm text-slate-300">Password</label>
          <div className="mt-1 flex gap-2">
            <input type={showPw?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/>
            <button onClick={()=>setShowPw(v=>!v)} className="px-3 py-2 rounded-lg border border-slate-700">{showPw?"Hide":"Show"}</button>
          </div>
        </div>
        <div className="text-right text-sm mb-4"><button onClick={()=>resetStart(email)} className="text-blue-400 hover:underline">Forgot password?</button></div>
        {mode==="signup"&&(<div className="mb-4"><label className="text-sm text-slate-300">Confirm Password</label><input type={showPw?"text":"password"} value={confirm} onChange={e=>setConfirm(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>)}
        {err&&<div className="text-red-400 text-sm mb-3">{err}</div>}
        <div className="flex items-center justify-between">
          <div id="googleDiv" ref={googleDiv}></div>
          <button onClick={submit} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500">Continue</button>
        </div>
      </div>
    </div>
  </div>)
}

/* Reset modals (unchanged except messaging text) */
function parseJwt(token){try{return JSON.parse(atob(token.split('.')[1]))}catch{return null}}
function ResetModal({email,onClose,onReset}){
  const [e,setE]=useState(email||""); const [link,setLink]=useState(""); const [msg,setMsg]=useState("");
  const start=async ()=>{const users=loadUsers();const u=users.find(x=>x.email.toLowerCase()===e.toLowerCase());if(!u){setMsg("No account for that email.");return}
    const token=Math.random().toString(36).slice(2); const exp=Date.now()+1000*60*15; localStorage.setItem("ng_reset_"+token,JSON.stringify({email:e,exp}));
    const url=location.origin+location.pathname+"#reset="+token; setLink(url); 
    const first_name = u.name.split(' ')[0];
    const reset_link = url;
    const expiry_time = "15 minutes";
    const templateParams = { to_email: e, first_name, reset_link, expiry_time };
    try {
      await emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams);
      setMsg('Reset email sent successfully.');
    } catch (error) {
      setMsg('Failed to send email: ' + (error?.text || 'EmailJS error'));
    }
  }
  return(<Modal title="Password reset" onClose={onClose} maxClass="max-w-md">
    <div className="space-y-3">
      <div><label className="text-sm text-slate-300">Your email</label><input value={e} onChange={ev=>setE(ev.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
      <button onClick={start} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500">Send reset link</button>
      <div className="text-slate-400 text-xs">Please wait — the email will arrive shortly.</div>
      {msg&&<div className="text-sky-400 text-sm">{msg}</div>}
      {link&&<div className="text-xs break-all text-slate-300 mt-2">{link}</div>}
    </div>
  </Modal>)
}
function NewPasswordModal({token,onClose}){
  const recRaw=localStorage.getItem("ng_reset_"+token); const rec=recRaw?JSON.parse(recRaw):null;
  const [pw1,setPw1]=useState(""); const [pw2,setPw2]=useState(""); const [msg,setMsg]=useState("");
  const confirm=()=>{ if(!rec||Date.now()>rec.exp){setMsg("Link expired.");return}
    if(!pw1||pw1.length<6){setMsg("Password must be at least 6 characters.");return}
    if(pw1!==pw2){setMsg("Passwords do not match.");return}
    const users=loadUsers();const i=users.findIndex(x=>x.email.toLowerCase()===rec.email.toLowerCase()); if(i>=0){users[i].password=pw1;saveUsers(users); localStorage.removeItem("ng_reset_"+token); setMsg("Password updated. You can close this window.");}
  };
  return(<Modal title="Create new password" onClose={onClose} maxClass="max-w-md">
    <div className="space-y-3">
      <div><label className="text-sm text-slate-300">New password</label><input type="password" value={pw1} onChange={e=>setPw1(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
      <div><label className="text-sm text-slate-300">Confirm password</label><input type="password" value={pw2} onChange={e=>setPw2(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
      {msg&&<div className="text-sky-400 text-sm">{msg}</div>}
      <button onClick={confirm} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500">Update</button>
    </div>
  </Modal>)
}

/* Import Modal */
function ImportModal({onClose,progress,message,details}) {
  return (
    <Modal title="Importing… " onClose={onClose} maxClass="max-w-lg">
      <div className="space-y-3">
        <div className="text-sm text-slate-300">{message || "Please wait — the import may take a few minutes depending on file size."}</div>
        <div className="progress-wrap">
          <div className="progress-bar" style={{width: `${progress||0}%`}}></div>
        </div>
        {details && <div className="text-xs text-slate-400">{details}</div>}
      </div>
    </Modal>
  );
}

/* Persistence hook (adds dashboard + notes) */
function usePersisted(email){
  const fresh = () => ({
    name:"",email:email||"",accType:ACC_TYPES[1],capital:0,depositDate:todayISO(),
    trades:[],
    notes:[],
    dashboardWidgets:{general:true,best:true,detailed:true},
    dashboardOrder:['general','best','detailed']
  });
  const [state,setState]=useState(()=>{const s=loadState(email||getCurrent());return s||fresh()});
  useEffect(()=>{
    const loaded = loadState(email);
    if (loaded) {
      if (!loaded.dashboardOrder) loaded.dashboardOrder = ['general','best','detailed'];
      if (!loaded.dashboardWidgets) loaded.dashboardWidgets = {general:true,best:true,detailed:true};
      if (loaded.dashboardWidgets.best === undefined) loaded.dashboardWidgets.best = true;
      if (!loaded.notes) loaded.notes = [];
      setState(loaded);
    } else {
      setState(fresh());
    }
  }, [email]);
  useEffect(()=>{if(!state||!state.email)return;saveState(state.email,state)},[state]);
  return [state,setState];
}

/* App */
function App(){
  const [currentEmail,setCurrentEmail]=useState(getCurrent());
  const [users,setUsers]=useState(loadUsers());
  const [state,setState]=usePersisted(currentEmail);
  const [page,setPage]=useState("dashboard");
  const [showTrade,setShowTrade]=useState(false); const [editItem,setEditItem]=useState(null);
  const [showAcct,setShowAcct]=useState(false);
  const [showCal,setShowCal]=useState(false); const now=new Date(); const [calView,setCalView]=useState("month"); const [calMonth,setCalMonth]=useState(now.getMonth()); const [calYear,setCalYear]=useState(now.getFullYear()); const [calSel,setCalSel]=useState(todayISO());
  const [collapsed,setCollapsed]=useState(false);
  const [showReset,setShowReset]=useState(false); const [resetToken,setResetToken]=useState("");

  // Import
  const [importing,setImporting]=useState(false);
  const [importProgress,setImportProgress]=useState(0);
  const [importMsg,setImportMsg]=useState("");
  const [importDetails,setImportDetails]=useState("");
  const fileRef = useRef(null);

  useEffect(()=>{const hash=new URLSearchParams(location.hash.slice(1));const tok=hash.get("reset"); if(tok){setResetToken(tok)}},[]);
  useEffect(()=>{if(state&&(!state.name||!state.depositDate)) setShowAcct(false) /* no auto-popup for returning users */},[state?.email]);
  useEffect(()=>{if(typeof emailjs !== 'undefined'){emailjs.init({publicKey: "YOUR_EMAILJS_PUBLIC_KEY"});}},[]);

  const openTrades=state.trades.filter(t=> !t.exitType || t.exitType === "Trade In Progress").length;
  const realized=state.trades.filter(t=>new Date(t.date)>=new Date(state.depositDate)&&t.exitType && t.exitType !== "Trade In Progress").map(t=>computeDollarPnL(t,state.accType)).filter(v=>v!==null&&isFinite(v)).reduce((a,b)=>a+b,0);
  const effectiveCapital=state.capital+realized;

  const onExport=()=>{const csv=toCSV(state.trades,state.accType);const blob=new Blob([csv],{type:"text/csv;charset=utf-8;"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="Nitty_Gritty_Template_Export.csv";a.click();URL.revokeObjectURL(url)};

  const onLogout=()=>{saveCurrent("");setCurrentEmail("")};

  const initGoogle=(container,onEmail)=>{
    const clientId=window.GOOGLE_CLIENT_ID;
    if(!window.google||!clientId||!container) return;
    window.google.accounts.id.initialize({client_id:clientId,callback:(resp)=>{const p=parseJwt(resp.credential); if(p&&p.email){onEmail(p.email)}}});
    window.google.accounts.id.renderButton(container,{theme:"outline",size:"large",text:"signin_with",shape:"pill"});
  };

  const login=(email,password,setErr)=>{const u=users.find(x=>x.email.toLowerCase()===email.toLowerCase());
    if(!u){ if(password==="__google__"){const nu=[...users,{name:email.split("@")[0],email,password:""}]; setUsers(nu); saveUsers(nu); const fresh={name:email.split("@")[0],email,accType:ACC_TYPES[1],capital:0,depositDate:todayISO(),trades:[],notes:[],dashboardWidgets:{general:true,best:true,detailed:true},dashboardOrder:['general','best','detailed']}; saveState(email,fresh); saveCurrent(email); setCurrentEmail(email); return;}
      setErr("No such user. Please sign up."); return;}
    if(password!=="__google__" && u.password!==password){setErr("Wrong password.");return}
    setErr(""); saveCurrent(u.email); setCurrentEmail(u.email);
  };

  const signup=(name,email,password,setErr)=>{if(users.some(x=>x.email.toLowerCase()===email.toLowerCase())){setErr("Email already registered.");return}
    const u={name,email,password}; const nu=[...users,u]; setUsers(nu); saveUsers(nu);
    const fresh={name,email,accType:ACC_TYPES[1],capital:0,depositDate:todayISO(),trades:[],notes:[],dashboardWidgets:{general:true,best:true,detailed:true},dashboardOrder:['general','best','detailed']}; saveState(email,fresh); saveCurrent(email); setCurrentEmail(email);
  };

  const resetStart=()=>{setShowReset(true)};

  const addOrUpdate=(draft)=>{const id=draft.id||Math.random().toString(36).slice(2); const arr=state.trades.slice(); const idx=arr.findIndex(t=>t.id===id); const rec={...draft,id}; if(idx>=0)arr[idx]=rec; else arr.unshift(rec); setState({...state,trades:arr}); setShowTrade(false); setEditItem(null)};
  const delTrade=(id)=>setState({...state,trades:state.trades.filter(t=>t.id!==id)});

  // Import handlers
  const onImportClick=()=> fileRef.current?.click();

  const normalize = s => String(s||"").trim().toLowerCase().replace(/[^a-z0-9]+/g,'');
  const toISO = (v) => {
    if (!v) return todayISO();
    if (v instanceof Date && !isNaN(v)) return v.toISOString().slice(0,10);
    const n = +v;
    if (!isNaN(n) && n > 25569) { // Excel date (days since 1899-12-30)
      const d = new Date(Math.round((n - 25569) * 86400 * 1000));
      return d.toISOString().slice(0,10);
    }
    const d = new Date(v);
    return isNaN(d) ? todayISO() : d.toISOString().slice(0,10);
  };
  const parseSide = (s) => (String(s).toUpperCase().includes('SELL')?'SELL':'BUY');

  const importFile = async (file) => {
    setImporting(true); setImportProgress(5);
    setImportMsg("Please wait — the import will be successful in a few minutes based on file size.");
    setImportDetails(`Reading ${file.name} …`);

    const buf = await file.arrayBuffer();
    setImportProgress(20);
    const wb = XLSX.read(buf, {type:'array'});
    const firstSheet = wb.SheetNames[0];
    const sheet = wb.Sheets[firstSheet];
    const rows = XLSX.utils.sheet_to_json(sheet, {defval:'', raw:false, cellDates:true});
    setImportDetails(`Parsing ${rows.length} rows …`);

    // header map
    const keys = Object.keys(rows[0]||{});
    const N = {};
    for (const k of keys) N[normalize(k)] = k;

    const pick = (cands) => {
      for(const c of cands){ const nn = normalize(c); if (N[nn]) return N[nn]; }
      // fall back by approximate
      for(const k of keys){ if (cands.some(c=>normalize(k).includes(normalize(c)))) return k; }
      return null;
    };

    const K = {
      date: pick(['date','orderdate','tradedate','time']),
      symbol: pick(['symbol','pair','instrument']),
      side: pick(['side','action','type','buysell']),
      lot: pick(['lot size','lotsize','lot','size','quantity','qty']),
      entry: pick(['entry','entryprice','price in','pricein','open']),
      exit: pick(['exit','exitprice','price out','priceout','close']),
      tp1: pick(['tp1','takeprofit1','tp 1']),
      tp2: pick(['tp2','takeprofit2','tp 2']),
      sl: pick(['sl','stoploss','stop loss','stop']),
      exittype: pick(['exit type','exittype','reason','status']),
      pnl: pick(['p&l','pnl','profit','loss','pnl$','p&l$','pnlusd'])
    };

    const out = [];
    const total = rows.length || 1;
    rows.forEach((row, idx) => {
      const I = K;
      const t = {
        id: Math.random().toString(36).slice(2),
        date: toISO(I.date?row[I.date]:todayISO()),
        // FIXED the ternary bug here:
        symbol: String(I.symbol ? (row[I.symbol] || '') : '').toUpperCase() || 'XAUUSD',
        side: parseSide(I.side ? row[I.side] : 'BUY'),
        lotSize: num(I.lot ? row[I.lot] : 0.01) ?? 0.01,
        entry: num(I.entry ? row[I.entry] : undefined),
        exit: num(I.exit ? row[I.exit] : undefined),
        tp1: num(I.tp1 ? row[I.tp1] : undefined),
        tp2: num(I.tp2 ? row[I.tp2] : undefined),
        sl: num(I.sl ? row[I.sl] : undefined),
        strategy: "Imported",
        exitType: (I.exittype ? String(row[I.exittype]).trim() : "") || (row[I.exit] ? "TP" : "Trade In Progress")
      };
      if (I.pnl) {
        const imp = num(row[I.pnl]);
        if (imp !== undefined) t.pnlOverride = imp; // allow editing later, used by computeDollarPnL
      }
      out.push(t);
      if (idx % 50 === 0) setImportProgress(20 + Math.round(75 * (idx/total)));
    });

    setState(s=>({...s,trades:[...out.reverse(),...s.trades]})); // prepend imported
    setImportProgress(100);
    setImportDetails(`Imported ${out.length} trades.`);
    setTimeout(()=>{ setImporting(false); setImportProgress(0); setImportMsg(""); setImportDetails(""); }, 800);
  };

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    importFile(f);
  };

  if(resetToken){return <NewPasswordModal token={resetToken} onClose={()=>{setResetToken(""); location.hash=""}}/>}
  if(!currentEmail){return <><LoginView onLogin={login} onSignup={signup} initGoogle={initGoogle} resetStart={resetStart}/>{showReset&&<ResetModal email="" onClose={()=>setShowReset(false)}/>}</>}

  const navBtn=(label,pageKey,Icon)=>(<button onClick={()=>setPage(pageKey)} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border ${page===pageKey?'bg-slate-700 border-slate-600':'border-slate-700 hover:bg-slate-800'}`}>{Icon?<Icon/>:null}<span>{label}</span></button>);

  const capitalPanel=(<div>
    <div className="text-sm text-slate-300">Account Type</div><div className="font-semibold mb-3">{state.accType}</div>
    <div className="text-sm text-slate-300">Capital</div><div className="text-2xl font-bold mb-1">{state.accType==='Cent Account'?`${r2(effectiveCapital*100).toFixed(2)} ¢`:fmt$(effectiveCapital)}</div>
    <div className="text-xs text-slate-400">Deposit: {state.depositDate}</div>
    <div className="mt-3 text-sm text-slate-300">Open trades</div><div className="text-lg font-semibold">{openTrades}</div>
    <div className="pt-2"><button onClick={()=>setShowAcct(true)} className="w-full px-3 py-2 rounded-lg border border-slate-700">Account Setup</button></div>
    <div className="pt-2"><button onClick={()=>{setEditItem(null);setShowTrade(true)}} className="w-full px-3 py-2 rounded-lg border border-slate-700 flex items-center justify-center gap-2"><IconPlus/>Add trade</button></div>
  </div>);

  const nav=(<>
    {navBtn("Dashboard","dashboard",IconHome)}
    {navBtn("Histories","histories",IconHistory)}
    <button onClick={()=>{setShowCal(true);setCalView("month")}} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-700 hover:bg-slate-800"><IconCalendar/>Calendar</button>
    {navBtn("Notes","notes",IconNote)}
    {navBtn("Settings","settings",IconSettings)}
  </>);

  const logoSrc=LOGO_PUBLIC;

  return(
    <>
      <input type="file" ref={fileRef} onChange={handleFileChange} accept=".csv,.xlsx,.xls" hidden />
      {importing && <ImportModal onClose={()=>setImporting(false)} progress={importProgress} message={importMsg} details={importDetails}/>}
      <AppShell capitalPanel={capitalPanel} nav={nav} logoSrc={logoSrc} onToggleSidebar={()=>setCollapsed(v=>!v)} onExport={onExport} onImportClick={onImportClick} onLogout={onLogout} sidebarCollapsed={collapsed}>
        {page==="dashboard"&&(
          <div className="space-y-4">
            {state.dashboardOrder.map(k => state.dashboardWidgets[k] && (
              k==='general' ? (
                <div key="general">
                  <div className="text-sm font-semibold">General statistics</div>
                  <GeneralStats trades={state.trades} accType={state.accType} capital={state.capital} depositDate={state.depositDate}/>
                </div>
              ) : k==='best' ? (
                <BestStrategyCard key="best" trades={state.trades} accType={state.accType}/>
              ) : (
                <DetailedStats key="detailed" trades={state.trades} accType={state.accType}/>
              )
            ))}
          </div>
        )}
        {page==="histories"&&(<Histories trades={state.trades} accType={state.accType} onEdit={t=>{setEditItem(t);setShowTrade(true)}} onDelete={delTrade}/>)}
        {page==="notes"&&(<NotesView notes={state.notes} trades={state.trades} accType={state.accType} onAdd={(n)=>setState({...state,notes:[n,...state.notes]})} onDelete={(id)=>setState({...state,notes:state.notes.filter(x=>x.id!==id)})}/>)}
        {page==="settings"&&(<SettingsPanel
          name={state.name} setName={v=>setState({...state,name:v})}
          accType={state.accType} setAccType={v=>setState({...state,accType:v})}
          capital={state.capital} setCapital={v=>setState({...state,capital:v||0})}
          depositDate={state.depositDate} setDepositDate={v=>setState({...state,depositDate:v})}
          email={state.email}
          widgets={state.dashboardWidgets} setWidgets={w=>setState({...state,dashboardWidgets:w})}
          order={state.dashboardOrder} setOrder={o=>setState({...state,dashboardOrder:o})}
        />)}

        {showTrade&&(<TradeModal initial={editItem} onClose={()=>{setShowTrade(false);setEditItem(null)}} onSave={addOrUpdate} onDelete={delTrade} accType={state.accType}/>)}
        {showAcct&&(<AccountSetupModal name={state.name} setName={v=>setState({...state,name:v})} accType={state.accType} setAccType={v=>setState({...state,accType:v})} capital={state.capital} setCapital={v=>setState({...state,capital:v||0})} depositDate={state.depositDate} setDepositDate={v=>setState({...state,depositDate:v})} onClose={()=>setShowAcct(false)} email={state.email}/>)}
        {showCal&&(<CalendarModal onClose={()=>setShowCal(false)} trades={state.trades} view={calView} setView={setCalView} month={calMonth} setMonth={setCalMonth} year={calYear} setYear={setCalYear} selectedDate={calSel} setSelectedDate={setCalSel} accType={state.accType}/>)}
        {showReset&&(<ResetModal email="" onClose={()=>setShowReset(false)}/>)}
      </AppShell>
    </>
  )
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
