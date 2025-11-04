/* global emailjs, google */
const {useState,useMemo,useEffect,useRef} = React;

/* ================= Icons ================= */
const iconCls="h-5 w-5";
const IconUser=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Z"/><path d="M4 20a8 8 0 0 1 16 0Z"/></svg>);
const IconLogout=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M9 21h4a4 4 0 0 0 4-4V7a4 4 0 0 0-4-4H9"/><path d="M16 12H3"/><path d="M7 8l-4 4 4 4"/></svg>);
const IconDownload=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M12 3v10"/><path d="M8 11l4 4 4-4"/><path d="M5 21h14v-4H5Z"/></svg>);
const IconUpload=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M12 21V11"/><path d="M8 15l4-4 4 4"/><path d="M5 10V7a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v3"/></svg>);
const IconCalendar=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M8 3v4M16 3v4"/><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18"/></svg>);
const IconPlus=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M12 5v14M5 12h14"/></svg>);
const IconHistory=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M12 8v5l3 3"/><path d="M12 3a9 9 0 1 0 9 9"/><path d="M21 3v6h-6"/></svg>);
const IconSettings=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1 .6 1.65 1.65 0 0 0-.4 1V22a2 2 0 1 1-4 0v-.1a1.65 1.65 0 0 0-.4-1 1.65 1.65 0 0 0-1-.6 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-.6-1 1.65 1.65 0 0 0-1-.4H2a2 2 0 1 1 0-4h.1a1.65 1.65 0 0 0 1-.4 1.65 1.65 0 0 0 .6-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06A2 2 0 1 1 6.24 2.9l.06.06A1.65 1.65 0 0 0 8 4.6a1.65 1.65 0 0 0 1-.6 1.65 1.65 0 0 0 .4-1V2a2 2 0 1 1 4 0v.1c0 .38.14.74.4 1 .26.26.62.4 1 .4.62 0 1.22-.25 1.64-.68l.06-.06A2 2 0 1 1 21.1 6.24l-.06.06c-.26.26-.4.62-.4 1s.14.74.4 1c.26.26.62.4 1 .4H22a2 2 0 1 1 0 4h-.1a1.65 1.65 0 0 0-1 .4 1.65 1.65 0 0 0-.6 1Z"/></svg>);
const IconHome=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9v12h14V9"/></svg>);
const IconEdit=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconCls} {...p}><path d="M12 20h9"/><path d="M16.5 3.5l4 4L7 21l-4 1 1-4Z"/></svg>);
const IconTrash=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconCls} {...p}><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/></svg>);
const IconSave=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconCls} {...p}><path d="M19 21H5a2 2 0 0 1-2-2V7l4-4h9l4 4v12a2 2 0 0 1-2 2Z"/><path d="M17 21v-8H7v8"/><path d="M7 3v4h8"/></svg>);
const IconChecklist=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconCls} {...p}><path d="m3 6 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="m3 12 2 2 4-4"/><path d="M13 18h8"/><path d="m3 18 2 2 4-4"/></svg>);
const IconTweak=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconCls} {...p}><circle cx="12" cy="12" r="9"/><path d="M8 12h8M12 8v8"/></svg>);

/* ================= Constants & utils ================= */
const LOGO_PUBLIC="/logo-ng.png"; const LOGO_FALLBACK="./logo-ng.png.png";
const SYMBOLS=["XAUUSD","US100","US30","EURUSD","BTCUSD","AUDCAD","USDCAD","USDJPY","GBPUSD"];
const STRATEGIES=[
  "Two Touch Point Trend Line Break",
  "Three Touch Point Trend Line Break",
  "Trend Line Bounce",
  "Break and Retest",
  "Trend Continuation"
];
const EXIT_TYPES=["TP","SL","TP1_BE","TP1_SL","BE","Trade In Progress"];
const ACC_TYPES=["Cent Account","Dollar Account"];

const r2=n=>Math.round(n*100)/100;
const fmt$=n=>"$"+(isFinite(n)?(Math.round(n*100)/100).toFixed(2):"0.00");
const todayISO=()=>{const d=new Date();const tz=d.getTimezoneOffset();return new Date(d.getTime()-tz*60000).toISOString().slice(0,10)};

/* Storage keys */
const USERS_KEY="ng_users_v1";
const CURR_KEY="ng_current_user_v1";
const DASH_KEY="ng_dash_order_v1";
const CUSTOM_KEY="ng_custom_v1";
const NOTES_KEY=(email)=>"ng_notes_"+email;

/* Storage helpers */
const loadUsers=()=>{try{return JSON.parse(localStorage.getItem(USERS_KEY)||"[]")}catch{return[]}};
const saveUsers=u=>{try{localStorage.setItem(USERS_KEY,JSON.stringify(u))}catch{}};
const saveCurrent=e=>{try{localStorage.setItem(CURR_KEY,e)}catch{}};
const getCurrent=()=>{try{return localStorage.getItem(CURR_KEY)||""}catch{return""}};
const loadState=e=>{try{return JSON.parse(localStorage.getItem("ng_state_"+e)||"null")}catch{return null}};
const saveState=(e,s)=>{try{localStorage.setItem("ng_state_"+e,JSON.stringify(s))}catch{}};
const loadNotes=e=>{try{return JSON.parse(localStorage.getItem(NOTES_KEY(e))||"[]")}catch{return[]}};
const saveNotes=(e,arr)=>{try{localStorage.setItem(NOTES_KEY(e),JSON.stringify(arr))}catch{}};
const loadCustom=()=>{try{return JSON.parse(localStorage.getItem(CUSTOM_KEY)||"null")}catch{return null}};
const saveCustom=v=>{try{localStorage.setItem(CUSTOM_KEY,JSON.stringify(v))}catch{}};

/* PnL helpers */
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

/* CSV helpers */
function toCSV(rows,accType){
  const H=["Date","Symbol","Side","Lot Size","Entry","Exit","TP1","TP2","SL","Strategy","Exit Type","P&L","P&L (Units)"];
  const NL="\n"; const BOM="﻿";
  const esc=s=>{if(s===null||s===undefined)return"";const v=String(s);return /[",\n]/.test(v)?`"${v.replace(/"/g,'""')}"`:v};
  const out=[H.join(",")];
  for(const t of rows){
    const v=computeDollarPnL(t,accType); 
    const units=v===null?"":formatUnits(accType,v);
    const dollars=v===null?"":r2(v);
    const row=[t.date,t.symbol,t.side,t.lotSize,(t.entry??""),(t.exit??""),(t.tp1??""),(t.tp2??""),(t.sl??""),t.strategy,(t.exitType||""),dollars,units];
    out.push(row.map(esc).join(","));
  }
  return BOM+out.join(NL);
}
function parseCSV(text){
  // very small CSV parser handling quotes / commas / newlines
  const rows=[];let i=0,f=text;let cell="";let row=[];let inQ=false;
  while(i<f.length){
    const c=f[i++];
    if(inQ){
      if(c==='"' && f[i]==='"'){cell+='"';i++}
      else if(c==='"'){inQ=false}
      else cell+=c;
    }else{
      if(c===','){row.push(cell);cell=""}
      else if(c==='"\r' || c==='"' ){inQ=true}
      else if(c==='\n' || c==='\r'){ if(!(row.length===0 && cell==="")){row.push(cell);rows.push(row);row=[];cell=""} }
      else cell+=c;
    }
  }
  if(cell.length || row.length) {row.push(cell); rows.push(row)}
  // Trim BOM on first cell
  if(rows[0] && rows[0][0]) rows[0][0]=rows[0][0].replace(/^\uFEFF/,'');
  return rows;
}

/* ================= Shared UI ================= */
function Stat({label,value,draggableProps}){return(
  <div {...draggableProps} className={"dash-draggable bg-slate-900/50 border border-slate-700 rounded-xl p-3 select-none"}>
    <div className="text-slate-400 text-xs">{label}</div>
    <div className="text-2xl font-bold mt-1">{value}</div>
  </div>
)}
function Th({children,className,...rest}){return(<th {...rest} className={(className?className+" ":"")+"px-4 py-3 text-left font-semibold text-slate-300"}>{children}</th>)}
function Td({children,className,...rest}){return(<td {...rest} className={(className?className+" ":"")+"px-4 py-3 align-top"}>{children}</td>)}

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

/* ================= Settings (Account Setup modal + Settings page) ================= */
// (unchanged from previous message, omitted for brevity)
/* -- START settings components -- */
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
function SettingsPanel({name,setName,accType,setAccType,capital,setCapital,depositDate,setDepositDate,email}){
  const [tab,setTab]=useState("personal"); const [pw1,setPw1]=useState(""); const [pw2,setPw2]=useState(""); const [msg,setMsg]=useState("");
  const savePw=()=>{ if(!pw1||pw1.length<6){setMsg("Password must be at least 6 characters.");return}
    if(pw1!==pw2){setMsg("Passwords do not match.");return}
    const users=loadUsers();const i=users.findIndex(u=>u.email.toLowerCase()===(email||"").toLowerCase());
    if(i>=0){users[i].password=pw1;saveUsers(users);setMsg("Password updated.");setPw1("");setPw2("")}
  };
  return(
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4"><IconSettings/><div className="font-semibold">Settings</div></div>
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
        </div>
      ):(
        <div className="space-y-3">
          <div><label className="text-sm text-slate-300">New Password</label><input type="password" value={pw1} onChange={e=>setPw1(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
          <div><label className="text-sm text-slate-300">Confirm Password</label><input type="password" value={pw2} onChange={e=>setPw2(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
          {msg&&<div className="text-sky-400 text-sm">{msg}</div>}
          <div className="text-right"><button onClick={savePw} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500">Update Password</button></div>
        </div>
      )}
    </div>
  )
}
/* -- END settings components -- */

/* ================= Trades modal ================= */
function TradeModal({initial,onClose,onSave,onDelete,accType}){
  const i=initial||{}; const [symbol,setSymbol]=useState(i.symbol||SYMBOLS[0]); const [side,setSide]=useState(i.side||"BUY");
  const [date,setDate]=useState(i.date||todayISO()); const [lotSize,setLotSize]=useState(i.lotSize??0.01);
  const [entry,setEntry]=useState(i.entry??""); const [exit,setExit]=useState(i.exit??"");
  const [tp1,setTp1]=useState(i.tp1??""); const [tp2,setTp2]=useState(i.tp2??""); const [sl,setSl]=useState(i.sl??"");
  const [strategy,setStrategy]=useState(i.strategy||STRATEGIES[0]); const [exitType,setExitType]=useState(i.exitType||"TP");
  const num=v=>(v===""||v===undefined||v===null)?undefined:parseFloat(v);
  const draft=useMemo(()=>({id:i.id,date,symbol,side,lotSize:parseFloat(lotSize||0),entry:num(entry),exit:num(exit),tp1:num(tp1),tp2:num(tp2),sl:num(sl),strategy,exitType}),[i.id,date,symbol,side,lotSize,entry,exit,tp1,tp2,sl,strategy,exitType]);
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

/* ================= Calendar ================= */
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
          {monthNames.map((mn,i)=>(
            <button key={mn}
              onClick={()=>{setMonth(i);setView('month')}}
              className="text-left bg-slate-900/50 border border-slate-700 hover:bg-slate-800 rounded-lg p-2">
              <div className="font-semibold mb-1">{mn}</div>
              <div className="text-slate-400 text-xs">Trades: {trades.filter(t=>(new Date(t.date)).getMonth()===i&&(new Date(t.date)).getFullYear()===year).length}</div>
            </button>
          ))}
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
              <div className="text-sm">{typeof t.entry==='number'?t.entry:''} → {typeof t.exit==='number'?t.exit:''}</div>
            </div>))}</div>
          )}
        </div>
      )}
    </Modal>
  )
}

/* ================= Notes (rich content + reference trade select) ================= */
function RichToolbar({exec,setSize,size}){
  return (
    <div className="flex items-center gap-2 border border-slate-700 rounded-lg px-2 py-1 bg-slate-900">
      <button onClick={()=>exec('bold')} className="px-2 py-1 rounded hover:bg-slate-800 font-bold">B</button>
      <button onClick={()=>exec('italic')} className="px-2 py-1 rounded hover:bg-slate-800 italic">I</button>
      <button onClick={()=>exec('underline')} className="px-2 py-1 rounded hover:bg-slate-800 underline">U</button>
      <select value={size} onChange={e=>setSize(e.target.value)} className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm">
        <option value="14px">Text</option>
        <option value="18px">H4</option>
        <option value="22px">H3</option>
        <option value="26px">H2</option>
      </select>
    </div>
  );
}
function NoteModal({note,onClose,onSave,tradesForDate}){
  const [title,setTitle]=useState(note?.title||"");
  const [date,setDate]=useState(note?.date||todayISO());
  const [items,setItems]=useState(note?.items||[]);
  const [content,setContent]=useState(note?.content||"");
  const [refTradeId,setRefTradeId]=useState(note?.refTradeId||"");

  const editorRef=useRef(null);
  const [fontSize,setFontSize]=useState("14px");
  const exec=(cmd)=>document.execCommand(cmd,false,null);
  useEffect(()=>{ if(editorRef.current){editorRef.current.innerHTML=content} },[]);

  const [localTrades,setLocalTrades]=useState(tradesForDate(date));
  useEffect(()=>{ setLocalTrades(tradesForDate(date)); },[date, tradesForDate]);

  const addItem=()=>setItems(a=>[...a,{id:Math.random().toString(36).slice(2),text:"",done:false}]);
  const setText=(id,txt)=>setItems(a=>a.map(i=>i.id===id?{...i,text:txt}:i));
  const toggle=(id)=>setItems(a=>a.map(i=>i.id===id?{...i,done:!i.done}:i));
  const remove=(id)=>setItems(a=>a.filter(i=>i.id!==id));
  const save=()=>onSave({
    ...note,
    id:note?.id||Math.random().toString(36).slice(2),
    title,date,items,
    content: editorRef.current?.innerHTML || "",
    refTradeId
  });

  return(
    <Modal title={note?"Edit note":"New note"} onClose={onClose} maxClass="max-w-4xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-3">
          <div><label className="text-sm text-slate-300">Title</label>
            <input className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2" value={title} onChange={e=>setTitle(e.target.value)}/>
          </div>

          <div className="space-y-2">
            <div className="text-sm text-slate-300">Content</div>
            <RichToolbar exec={exec} size={fontSize} setSize={(v)=>{setFontSize(v); if(editorRef.current){editorRef.current.style.fontSize=v}}}/>
            <div
              ref={editorRef}
              onInput={(e)=>setContent(e.currentTarget.innerHTML)}
              className="min-h-[180px] bg-slate-900 border border-slate-700 rounded-xl p-3 focus:outline-none"
              contentEditable
              style={{fontSize:fontSize}}
            />
          </div>

          <div>
            <div className="flex items-center gap-2 text-sm text-slate-300 mb-2"><IconChecklist/>Checklist</div>
            <div className="space-y-2">
              {items.map(i=>(
                <div key={i.id} className="flex items-center gap-2">
                  <input type="checkbox" checked={i.done} onChange={()=>toggle(i.id)} className="h-5 w-5"/>
                  <input className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2" value={i.text} onChange={e=>setText(i.id,e.target.value)} placeholder="Write item..."/>
                  <button onClick={()=>remove(i.id)} className="px-2 py-2 rounded-lg border border-red-700 text-red-300 hover:bg-red-900/20"><IconTrash/></button>
                </div>
              ))}
              <button onClick={addItem} className="px-3 py-2 rounded-lg border border-slate-700 hover:bg-slate-800 flex items-center gap-2"><IconPlus/>Add checklist item</button>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div><label className="text-sm text-slate-300">Date</label>
            <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/>
          </div>

          <div>
            <div className="text-sm text-slate-300 mb-2">Reference Trade (optional)</div>
            <div className="space-y-2 max-h-64 overflow-auto">
              {localTrades.map(t=>(
                <label key={t.id} className="flex items-start gap-2 bg-slate-900/50 border border-slate-700 rounded-lg p-2 text-xs cursor-pointer">
                  <input type="radio" name="refTrade" checked={refTradeId===t.id} onChange={()=>setRefTradeId(t.id)} />
                  <div>
                    <div className="font-medium">{t.symbol} · {t.side} · Lot {t.lotSize}</div>
                    <div>{t.entry??""} → {t.exit??""}</div>
                  </div>
                </label>
              ))}
              {localTrades.length===0 && <div className="text-slate-400 text-xs">No trades on this date.</div>}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end gap-2">
        <button onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-600 hover:bg-slate-700">Discard</button>
        <button onClick={save} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500"><IconSave/> Save</button>
      </div>
    </Modal>
  )
}
function NotesView({email,trades}){
  const [notes,setNotes]=useState(()=>loadNotes(email));
  const [editing,setEditing]=useState(null);
  const [open,setOpen]=useState(false);
  const byDate=useMemo(()=>{const m={};for(const t of trades){m[t.date]=m[t.date]||[];m[t.date].push(t)}return m},[trades]);

  const tradesForDate=(d)=>byDate[d]||[];
  const save=(n)=>{const arr=[...notes];const i=arr.findIndex(x=>x.id===n.id); if(i>=0)arr[i]=n; else arr.unshift(n); setNotes(arr); saveNotes(email,arr); setOpen(false); setEditing(null)};
  const del=(id)=>{const arr=notes.filter(n=>n.id!==id); setNotes(arr); saveNotes(email,arr)};

  return(
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold">Notes</div>
        <button onClick={()=>{setEditing(null);setOpen(true)}} className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 flex items-center gap-2"><IconPlus/> New note</button>
      </div>
      <div className="space-y-2">
        {notes.length===0 && <div className="text-slate-400 text-sm">No notes yet.</div>}
        {notes.map(n=>(
          <div key={n.id} className="bg-slate-900/50 border border-slate-700 rounded-xl p-3 flex items-start justify-between">
            <div className="pr-4">
              <div className="text-sm font-semibold">{n.title||"(Untitled)"}</div>
              <div className="text-xs text-slate-400">{n.date}</div>
              {n.refTradeId && <div className="text-xs mt-1 text-blue-300">Linked to trade: {n.refTradeId.slice(0,6)}…</div>}
              {n.content && <div className="mt-2" dangerouslySetInnerHTML={{__html:n.content}}/>}
              {n.items?.length>0 && (
                <ul className="mt-2 space-y-1 text-sm">
                  {n.items.map(it=>(
                    <li key={it.id} className="flex items-center gap-2">
                      <input type="checkbox" checked={it.done} readOnly className="h-4 w-4"/>
                      <span className={it.done?"line-through text-slate-400":""}>{it.text}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={()=>{setEditing(n);setOpen(true)}} className="px-2 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-700" title="Edit"><IconEdit/></button>
              <button onClick={()=>del(n.id)} className="px-2 py-1.5 rounded-lg border border-red-700 text-red-300 hover:bg-red-900/20" title="Delete"><IconTrash/></button>
            </div>
          </div>
        ))}
      </div>
      {open && <NoteModal note={editing} onClose={()=>{setOpen(false);setEditing(null)}} onSave={save} tradesForDate={tradesForDate}/>}
    </div>
  )
}

/* ================= Histories (single header + correct columns) ================= */
const ALL_COLS = [
  {key:"date", label:"Date"},
  {key:"symbol", label:"Symbol"},
  {key:"side", label:"Side"},
  {key:"lot", label:"Lot"},
  {key:"entry", label:"Entry"},
  {key:"exit", label:"Exit"},
  {key:"exitType", label:"Exit Type"},
  {key:"status", label:"Status"},
  {key:"pnl", label:"P&L"},
  {key:"units", label:"P&L (Units)"},
  {key:"actions", label:""}
];
function Histories({trades,accType,onEdit,onDelete,visibleCols}){
  const colSet = ALL_COLS.filter(c=>visibleCols.includes(c.key) || c.key==="actions");
  const rowColor = (v) => {
    if(v===null || !isFinite(v)) return "";
    if(Math.abs(v) < 1e-9) return "text-amber-400";
    return v>0 ? "text-green-400" : "text-red-400";
  };
  return(
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3"><div className="text-sm font-semibold">Trade History</div></div>
      <div className="overflow-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700">
              {colSet.map(c=><Th key={c.key}>{c.label}</Th>)}
            </tr>
          </thead>
          <tbody>
            {trades.map(t=>{
              const v=computeDollarPnL(t,accType);
              const closed= t.exitType && t.exitType !== "Trade In Progress";
              return (
                <tr key={t.id} className="border-b border-slate-800">
                  {colSet.map(c=>{
                    switch(c.key){
                      case "date": return <Td key={c.key}>{t.date}</Td>;
                      case "symbol": return <Td key={c.key}>{t.symbol}</Td>;
                      case "side": return <Td key={c.key}>{t.side}</Td>;
                      case "lot": return <Td key={c.key}>{t.lotSize}</Td>;
                      case "entry": return <Td key={c.key}>{typeof t.entry==='number'?t.entry:''}</Td>;
                      case "exit": return <Td key={c.key}>{typeof t.exit==='number'?t.exit:''}</Td>;
                      case "exitType": return <Td key={c.key}>{t.exitType||""}</Td>;
                      case "status": return <Td key={c.key}>{closed?'CLOSED':'OPEN'}</Td>;
                      case "pnl": return <Td key={c.key} className={rowColor(v)}>{v===null?'-':formatPnlDisplay(accType,v)}</Td>;
                      case "units": return <Td key={c.key} className={rowColor(v)}>{v===null?'-':formatUnits(accType,v)}</Td>;
                      case "actions": return (
                        <Td key={c.key}>
                          <div className="flex items-center gap-2">
                            <button onClick={()=>onEdit(t)} className="px-2 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-700" title="Edit"><IconEdit/></button>
                            <button onClick={()=>onDelete(t.id)} className="px-2 py-1.5 rounded-lg border border-red-700 text-red-300 hover:bg-red-900/20" title="Delete"><IconTrash/></button>
                          </div>
                        </Td>
                      );
                    }
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ================= Detailed Statistics (RESTORED) ================= */
function DetailedStats({trades,accType}){
  const bySymbol=useMemo(()=>{
    const m={};
    for(const t of trades){
      if(!(t.exitType && t.exitType !== "Trade In Progress")) continue;
      const v=computeDollarPnL(t,accType);
      if(v===null || !isFinite(v)) continue;
      m[t.symbol]=(m[t.symbol]||0)+v;
    }
    return m;
  },[trades,accType]);
  const symbols=Object.keys(bySymbol).sort();
  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4">
      <div className="text-sm font-semibold mb-2">Detailed Statistics</div>
      <div className="overflow-auto">
        <table className="min-w-[380px] text-sm">
          <thead>
            <tr className="border-b border-slate-700">
              <Th>Symbol</Th>
              <Th>P&L (Units)</Th>
            </tr>
          </thead>
          <tbody>
            {symbols.length===0 ? (
              <tr><Td colSpan={2} className="text-slate-400">No closed trades yet.</Td></tr>
            ) : symbols.map(sym=>{
              const v=bySymbol[sym];
              const cls=v>0?"text-green-400":v<0?"text-red-400":"text-amber-400";
              return (
                <tr key={sym} className="border-b border-slate-800">
                  <Td>{sym}</Td>
                  <Td className={cls}>{formatUnits(accType,v)}</Td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ================= Header + Shell ================= */
function Header({logoSrc,onToggleSidebar,onExport,onImport,onLogout}){
  return(<div className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/70 backdrop-blur">
    <div className="flex items-center gap-3">
      <button onClick={onToggleSidebar} className="px-3 py-2 rounded-lg border border-slate-700 hover:bg-slate-800">☰</button>
      <div className="flex items-center gap-3">
        <img src={logoSrc} onError={e=>{e.currentTarget.src=LOGO_FALLBACK}} className="h-7 w-7"/>
        <div className="font-bold">Nitty Gritty</div>
        <span className="bg-blue-900 text-xs px-2 py-0.5 rounded-md">Trading Journal</span>
      </div>
    </div>
    <UserMenu onExport={onExport} onImport={onImport} onLogout={onLogout}/>
  </div>)
}
function UserMenu({onExport,onImport,onLogout}){
  const [open,setOpen]=useState(false);
  return(
    <div className="relative">
      <button onClick={()=>setOpen(v=>!v)} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-700 hover:bg-slate-800"><IconUser/></button>
      {open&&(<div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-lg overflow-hidden">
        <button onClick={()=>{setOpen(false);onImport()}} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-700"><IconUpload/>Import CSV</button>
        <button onClick={()=>{setOpen(false);onExport()}} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-700"><IconDownload/>Export CSV</button>
        <button onClick={()=>{setOpen(false);onLogout()}} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-700 text-red-300"><IconLogout/>Logout</button>
      </div>)}
    </div>
  )
}
function AppShell({children,capitalPanel,nav,logoSrc,onToggleSidebar,onExport,onImport,onLogout,sidebarCollapsed}){
  return(<div className="min-h-screen">
    <Header logoSrc={logoSrc} onToggleSidebar={onToggleSidebar} onExport={onExport} onImport={onImport} onLogout={onLogout}/>
    <div className="flex">
      {!sidebarCollapsed&&(<div className="w-72 shrink-0 border-r border-slate-800 min-h-[calc(100vh-56px)] p-4 space-y-4">
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4">{capitalPanel}</div>
        <div className="space-y-2">{nav}</div>
      </div>)}
      <div className="flex-1 p-4 md:p-6">{children}</div>
    </div>
  </div>)
}

/* ================= Auth (Login + Forgot) – unchanged core ================= */
function parseJwt(token){try{return JSON.parse(atob(token.split('.')[1]))}catch{return null}}
function LoginView({onLogin,onSignup,initGoogle,resetStart}){
  const [mode,setMode]=useState("login");
  const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [showPw,setShowPw]=useState(false);
  const [name,setName]=useState(""); const [confirm,setConfirm]=useState(""); const [err,setErr]=useState("");
  const googleDiv=useRef(null);
  useEffect(()=>{initGoogle(googleDiv.current,(payloadEmail)=>{setErr(""); onLogin(payloadEmail,"__google__",()=>{})})},[]);
  const submit=()=>{setErr(""); if(mode==="login"){if(!email||!password)return setErr("Fill all fields."); onLogin(email,password,setErr)}
    else{if(!name||!email||!password||!confirm)return setErr("Fill all fields."); if(password!==confirm)return setErr("Passwords do not match."); onSignup(name,email,password,setErr)}};
  return(
    <div className="min-h-screen grid md:grid-cols-2 login-bg">
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
    </div>
  )
}
function ResetModal({email,onClose}){ 
  const [e,setE]=useState(email||""); const [link,setLink]=useState(""); const [msg,setMsg]=useState("");
  const start=async ()=>{const users=loadUsers();const u=users.find(x=>x.email.toLowerCase()===e.toLowerCase());if(!u){setMsg("No account for that email.");return}
    const token=Math.random().toString(36).slice(2); const exp=Date.now()+1000*60*15; localStorage.setItem("ng_reset_"+token,JSON.stringify({email:e,exp}));
    const url=location.origin+location.pathname+"#reset="+token; setLink(url); 
    const first_name = (u.name||e).split(' ')[0];
    const reset_link = url;
    const expiry_time = "15 minutes";
    const templateParams = { to_email: e, first_name, reset_link, expiry_time };
    try {
      await emailjs.send('service_66nh71a', 'template_067iydk', templateParams); 
      setMsg('Reset email sent successfully. Check your inbox (or spam).');
    } catch (error) {
      setMsg('Failed to send email: ' + (error?.text || 'Unknown error')); 
    }
  }
  return(<Modal title="Password reset" onClose={onClose} maxClass="max-w-md">
    <div className="space-y-3">
      <div><label className="text-sm text-slate-300">Your email</label><input value={e} onChange={ev=>setE(ev.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
      <button onClick={start} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500">Send reset link</button>
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

/* ================= State & Customize ================= */
function usePersisted(email){
  const fresh = () => ({name:"",email:email||"",accType:ACC_TYPES[1],capital:0,depositDate:todayISO(),trades:[]});
  const [state,setState]=useState(()=>{const s=loadState(email||getCurrent());return s||fresh()});
  useEffect(()=>{const loaded = loadState(email);setState(loaded || fresh());}, [email]);
  useEffect(()=>{if(!state||!state.email)return;saveState(state.email,state)},[state]);
  return [state,setState];
}
const DEFAULT_CUSTOM = { visibleCols: ["date","symbol","side","lot","entry","exit","exitType","status","pnl","units"] };
function CustomizePanel({prefs,setPrefs}){
  const toggle=(k)=> setPrefs(cur=>{
    const v = new Set(cur.visibleCols);
    if(v.has(k)) v.delete(k); else v.add(k);
    const next = { ...cur, visibleCols: Array.from(v) };
    saveCustom(next); return next;
  });
  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4"><IconTweak/><div className="font-semibold">Customize Journal</div></div>
      <div className="text-sm text-slate-300 mb-2">History Columns</div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {ALL_COLS.filter(c=>c.key!=="actions").map(c=>(
          <label key={c.key} className="flex items-center gap-2 bg-slate-900/50 border border-slate-700 rounded-lg p-2">
            <input type="checkbox" checked={prefs.visibleCols.includes(c.key)} onChange={()=>toggle(c.key)} />
            <span>{c.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

/* ================= Best Strategy (long card) ================= */
function BestStrategySection({trades,accType}){
  const stats=useMemo(()=>{
    const byStrat={};
    for(const t of trades){
      if(!(t.exitType && t.exitType !== "Trade In Progress")) continue;
      const v=computeDollarPnL(t,accType); if(v===null||!isFinite(v)) continue;
      const s=(t.strategy||"N/A");
      byStrat[s]=byStrat[s]||{pnl:0,count:0,wins:0,losses:0};
      byStrat[s].pnl+=v; byStrat[s].count++; if(v>0)byStrat[s].wins++; else if(v<0) byStrat[s].losses++;
    }
    const rows=Object.entries(byStrat).map(([name,o])=>({name,...o,wr:o.count?(Math.round((o.wins/(o.wins+o.losses))*100)):0}));
    rows.sort((a,b)=> b.wr - a.wr || b.count - a.count);
    return rows;
  },[trades,accType]);
  const top=stats[0];
  const wr=top?top.wr:0;
  const R=80, C=2*Math.PI*R/2; 
  const progress = Math.max(0, Math.min(100, wr))/100;
  const dash = `${C*progress} ${C}`;
  return(
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4 mt-4">
      <div className="text-sm font-semibold mb-2">Best Strategy</div>
      {top?(
        <div className="flex items-center gap-6">
          <svg width="200" height="120" viewBox="0 0 200 120">
            <path d={`M20,100 A80,80 0 0 1 180,100`} fill="none" stroke="#334155" strokeWidth="14" />
            <path d={`M20,100 A80,80 0 0 1 180,100`} fill="none" stroke="currentColor" strokeWidth="14" strokeLinecap="round"
                  style={{strokeDasharray:dash}} className={wr>=50?"text-green-400":"text-amber-400"} />
            <text x="100" y="95" textAnchor="middle" fontSize="20" fill="currentColor" className="text-slate-200">{wr}%</text>
          </svg>
          <div>
            <div className="text-lg font-semibold">{top.name}</div>
            <div className="text-sm mt-1">Trades: {top.count} · Wins: {top.wins} · Losses: {top.losses}</div>
            <div className={"text-sm mt-1 "+(top.pnl>0?"text-green-400":top.pnl<0?"text-red-400":"text-amber-400")}>Total P&L: {formatPnlDisplay(accType,top.pnl)}</div>
          </div>
        </div>
      ):<div className="text-slate-400 text-sm">No closed trades yet.</div>}
    </div>
  );
}

/* ================= App ================= */
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
  const [prefs,setPrefs]=useState(()=>loadCustom()||DEFAULT_CUSTOM);

  const initialOrder = ()=>{try{const j=JSON.parse(localStorage.getItem(DASH_KEY)||"null");return j||["capital","realized","winrate","open"]}catch{return ["capital","realized","winrate","open"]}};
  const [dashOrder,setDashOrder]=useState(initialOrder);
  useEffect(()=>{localStorage.setItem(DASH_KEY,JSON.stringify(dashOrder))},[dashOrder]);

  useEffect(()=>{const hash=new URLSearchParams(location.hash.slice(1));const tok=hash.get("reset"); if(tok){setResetToken(tok)}},[]);
  useEffect(()=>{if(state&&(!state.name||!state.depositDate)) setShowAcct(true)},[state?.email]);
  useEffect(()=>{if(typeof emailjs !== 'undefined'){emailjs.init({publicKey: "qQucnU6BE7h1zb5Ex"});}},[]); 

  const openTrades=state.trades.filter(t=> !t.exitType || t.exitType === "Trade In Progress").length;
  const realizedVal=state.trades.filter(t=>new Date(t.date)>=new Date(state.depositDate)&&t.exitType && t.exitType !== "Trade In Progress").map(t=>computeDollarPnL(t,state.accType)).filter(v=>v!==null&&isFinite(v)).reduce((a,b)=>a+b,0);
  const effectiveCapital=state.capital+realizedVal;

  // Export + Import
  const onExport=()=>{const csv=toCSV(state.trades,state.accType);const blob=new Blob([csv],{type:"text/csv;charset=utf-8;"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="Nitty_Gritty_Template_Export.csv";a.click();URL.revokeObjectURL(url)};
  const fileRef=useRef(null);
  const onImport=()=>fileRef.current && fileRef.current.click();
  const handleFile=(e)=>{
    const f=e.target.files[0]; if(!f) return;
    const reader=new FileReader();
    reader.onload=()=>{ try{
      const text=String(reader.result||"");
      const rows=parseCSV(text);
      const H=rows.shift()||[];
      const idx=(h)=>H.findIndex(x=>String(x).trim().toLowerCase()===h.toLowerCase());
      const col={
        date: idx("date"),
        symbol: idx("symbol"),
        side: idx("side"),
        lot: idx("lot size"),
        entry: idx("entry"),
        exit: idx("exit"),
        tp1: idx("tp1"),
        tp2: idx("tp2"),
        sl: idx("sl"),
        strategy: idx("strategy"),
        exitType: idx("exit type"),
      };
      const imported=[];
      for(const r of rows){
        if(!r.length) continue;
        const get=(i)=> i>=0 && i<r.length ? r[i] : "";
        const num=(v)=> v==="" ? undefined : parseFloat(v);
        const t={
          id: Math.random().toString(36).slice(2),
          date: String(get(col.date) || todayISO()),
          symbol: String(get(col.symbol) || "XAUUSD"),
          side: String(get(col.side) || "BUY"),
          lotSize: num(get(col.lot)) || 0.01,
          entry: num(get(col.entry)),
          exit: num(get(col.exit)),
          tp1: num(get(col.tp1)),
          tp2: num(get(col.tp2)),
          sl: num(get(col.sl)),
          strategy: String(get(col.strategy) || STRATEGIES[0]),
          exitType: String(get(col.exitType) || "")
        };
        imported.push(t);
      }
      const merged=[...imported.reverse(), ...state.trades]; // newest first if CSV sorted oldest->newest
      setState({...state,trades:merged});
      e.target.value="";
      alert("CSV imported successfully.");
    }catch(err){console.error(err); alert("Import failed. Please verify the CSV headers match the export template.");}
    };
    reader.readAsText(f);
  };
  const onLogout=()=>{saveCurrent("");setCurrentEmail("")};

  const initGoogle=(container,onEmail)=>{
    const clientId=window.GOOGLE_CLIENT_ID;
    if(!window.google||!clientId||!container) return;
    window.google.accounts.id.initialize({client_id:clientId,callback:(resp)=>{const p=parseJwt(resp.credential); if(p&&p.email){onEmail(p.email)}}});
    window.google.accounts.id.renderButton(container,{theme:"outline",size:"large",text:"signin_with",shape:"pill"});
  };

  const login=(email,password,setErr)=>{let u=users.find(x=>x.email.toLowerCase()===email.toLowerCase());
    if(!u){
      if(password==="__google__" || password){
        const nameGuess=email.split("@")[0];
        u={name:nameGuess,email,password:password==="__google__"?"":password};
        const nu=[...users,u]; setUsers(nu); saveUsers(nu);
        const fresh={name:nameGuess,email,accType:ACC_TYPES[1],capital:0,depositDate:todayISO(),trades:[]}; saveState(email,fresh);
      } else { setErr("No such user. Please sign up."); return; }
    }else{
      if(password!=="__google__" && u.password!==password){setErr("Wrong password.");return}
    }
    setErr(""); saveCurrent(email); setCurrentEmail(email);
  };
  const signup=(name,email,password,setErr)=>{if(users.some(x=>x.email.toLowerCase()===email.toLowerCase())){setErr("Email already registered.");return}
    const u={name,email,password}; const nu=[...users,u]; setUsers(nu); saveUsers(nu);
    const fresh={name,email,accType:ACC_TYPES[1],capital:0,depositDate:todayISO(),trades:[]}; saveState(email,fresh); saveCurrent(email); setCurrentEmail(email);
  };
  const resetStart=()=>{setShowReset(true)};

  const addOrUpdate=(draft)=>{const id=draft.id||Math.random().toString(36).slice(2); const arr=state.trades.slice(); const idx=arr.findIndex(t=>t.id===id); const rec={...draft,id}; if(idx>=0)arr[idx]=rec; else arr.unshift(rec); setState({...state,trades:arr}); setShowTrade(false); setEditItem(null)};
  const delTrade=(id)=>setState({...state,trades:state.trades.filter(t=>t.id!==id)});

  if(resetToken){return <NewPasswordModal token={resetToken} onClose={()=>{setResetToken(""); location.hash=""}}/>}
  if(!currentEmail){return <>
    <LoginView onLogin={login} onSignup={signup} initGoogle={initGoogle} resetStart={resetStart}/>
    {showReset&&<ResetModal email="" onClose={()=>setShowReset(false)}/>}
  </>}

  const navBtn=(label,pageKey,Icon)=>(<button onClick={()=>setPage(pageKey)} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border ${page===pageKey?'bg-slate-700 border-slate-600':'border-slate-700 hover:bg-slate-800'}`}>{Icon?<Icon/>:null}<span>{label}</span></button>);

  const capitalPanel=(<div>
    <div className="text-sm text-slate-300">Account Type</div><div className="font-semibold mb-3">{state.accType}</div>
    <div className="text-sm text-slate-300">Capital</div><div className="text-2xl font-bold mb-1">{state.accType==='Cent Account'?`${r2(effectiveCapital*100).toFixed(2)} ¢`:fmt$(effectiveCapital)}</div>
    <div className="text-xs text-slate-400">Deposit: {state.depositDate}</div>
    <div className="mt-3 text-sm text-slate-300">Open trades</div><div className="text-lg font-semibold">{openTrades}</div>
    <div className="pt-2"><button onClick={()=>{setEditItem(null);setShowTrade(true)}} className="w-full px-3 py-2 rounded-lg border border-slate-700 flex items-center justify-center gap-2"><IconPlus/>Add trade</button></div>
  </div>);

  const nav=(<>
    {navBtn("Dashboard","dashboard",IconHome)}
    {navBtn("Histories","histories",IconHistory)}
    <button onClick={()=>{setShowCal(true);setCalView("month")}} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-700 hover:bg-slate-800"><IconCalendar/>Calendar</button>
    {navBtn("Notes","notes",IconChecklist)}
    {navBtn("Customize Journal","customize",IconTweak)}
    {navBtn("Settings","settings",IconSettings)}
  </>);

  const logoSrc=LOGO_PUBLIC;

  const dragSrcId = useRef(null);
  const onDragStart=(id)=> (e)=>{dragSrcId.current=id; e.dataTransfer.effectAllowed="move"};
  const onDragOver=(id)=> (e)=>{e.preventDefault(); e.currentTarget.classList.add("drag-over")};
  const onDragLeave=(id)=> (e)=>{e.currentTarget.classList.remove("drag-over")};
  const onDrop=(id)=> (e)=>{
    e.preventDefault(); e.currentTarget.classList.remove("drag-over");
    const src=dragSrcId.current; if(!src||src===id) return;
    const arr=[...dashOrder];
    const a=arr.indexOf(src), b=arr.indexOf(id);
    if(a<0||b<0) return;
    arr.splice(b,0,arr.splice(a,1)[0]);
    setDashOrder(arr);
  };

  const dashCards = {
    capital: <Stat label="Capital" value={state.accType==='Cent Account'?`${r2(effectiveCapital*100).toFixed(2)} ¢`:fmt$(effectiveCapital)} />,
    realized: <Stat label="Realized P&L" value={formatPnlDisplay(state.accType,realizedVal)} />,
    winrate: (()=>{const rt=state.trades.filter(t=>new Date(t.date)>=new Date(state.depositDate)&&t.exitType && t.exitType !== "Trade In Progress"); const vals=rt.map(t=>computeDollarPnL(t,state.accType)).filter(v=>v!==null&&isFinite(v)); const wr=vals.length?Math.round((vals.filter(v=>v>0).length/vals.length)*100):0; return <Stat label="Win Rate" value={`${wr}%`} />})(),
    open: <Stat label="Open Trades" value={openTrades} />
  };

  return(
    <AppShell capitalPanel={capitalPanel} nav={nav} logoSrc={logoSrc}
              onToggleSidebar={()=>setCollapsed(v=>!v)}
              onExport={onExport}
              onImport={onImport}
              onLogout={onLogout}
              sidebarCollapsed={collapsed}>
      {page==="dashboard"&&(
        <div className="space-y-4">
          <div className="text-sm font-semibold">General statistics</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {dashOrder.map(id=>(
              <div key={id}
                   className="dash-dropzone"
                   draggable
                   onDragStart={onDragStart(id)}
                   onDragOver={onDragOver(id)}
                   onDragLeave={onDragLeave(id)}
                   onDrop={onDrop(id)}>
                {React.cloneElement(dashCards[id], {draggableProps:{draggable:true}})}
              </div>
            ))}
          </div>

          <DetailedStats trades={state.trades} accType={state.accType}/>
          <BestStrategySection trades={state.trades} accType={state.accType}/>
        </div>
      )}

      {page==="histories"&&(<Histories trades={state.trades} accType={state.accType} onEdit={t=>{setEditItem(t);setShowTrade(true)}} onDelete={delTrade} visibleCols={prefs.visibleCols}/>)}
      {page==="notes"&&(<NotesView email={state.email} trades={state.trades}/>)}
      {page==="customize"&&(<CustomizePanel prefs={prefs} setPrefs={setPrefs}/>)}
      {page==="settings"&&(<SettingsPanel name={state.name} setName={v=>setState({...state,name:v})} accType={state.accType} setAccType={v=>setState({...state,accType:v})} capital={state.capital} setCapital={v=>setState({...state,capital:v||0})} depositDate={state.depositDate} setDepositDate={v=>setState({...state,depositDate:v})} email={state.email}/>)}

      {showTrade&&(<TradeModal initial={editItem} onClose={()=>{setShowTrade(false);setEditItem(null)}} onSave={addOrUpdate} onDelete={delTrade} accType={state.accType}/>)}
      {showAcct&&(<AccountSetupModal name={state.name} setName={v=>setState({...state,name:v})} accType={state.accType} setAccType={v=>setState({...state,accType:v})} capital={state.capital} setCapital={v=>setState({...state,capital:v||0})} depositDate={state.depositDate} setDepositDate={v=>setState({...state,depositDate:v})} onClose={()=>setShowAcct(false)} email={state.email}/>)}
      {showCal&&(<CalendarModal onClose={()=>setShowCal(false)} trades={state.trades} view={calView} setView={setCalView} month={calMonth} setMonth={setCalMonth} year={calYear} setYear={setCalYear} selectedDate={calSel} setSelectedDate={setCalSel} accType={state.accType}/>)}
      {showReset&&(<ResetModal email="" onClose={()=>setShowReset(false)}/>)}

      {/* Hidden file input for Import CSV */}
      <input type="file" accept=".csv,text/csv" ref={fileRef} onChange={handleFile} className="hidden"/>
    </AppShell>
  )
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
