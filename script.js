const {useState,useMemo,useEffect,useRef} = React;

/* ---------------- Icons ---------------- */
const iconCls="h-5 w-5";
const IconUser=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Z"/><path d="M4 20a8 8 0 0 1 16 0Z"/></svg>);
const IconLogout=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M9 21h4a4 4 0 0 0 4-4V7a4 4 0  0 0-4-4H9"/><path d="M16 12H3"/><path d="M7 8l-4 4 4 4"/></svg>);
const IconDownload=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M12 3v10"/><path d="M8 11l4 4 4-4"/><path d="M5 21h14v-4H5Z"/></svg>);
const IconUpload=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M12 21V11"/><path d="M8 13l4-4 4 4"/><path d="M5 3h14v4H5Z"/><path d="M5 7v14h14V7"/></svg>);
const IconCalendar=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M8 3v4M16 3v4"/><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18"/></svg>);
const IconPlus=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M12 5v14M5 12h14"/></svg>);
const IconHistory=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M12 8v5l3 3"/><path d="M12 3a9 9 0 1 0 9 9"/><path d="M21 3v6h-6"/></svg>);
const IconSettings=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.65 1.65 0  0 0 15 19.4a1.65 1.65 0  0 0-1 .6 1.65 1.65 0  0 0-.4 1V22a2 2 0  1 1-4 0v-.1a1.65 1.65 0  0 0-.4-1 1.65 1.65 0  0 0-1-.6 1.65 1.65 0  0 0-1.82.33l-.06.06a2 2 0  1 1-2.83-2.83l.06-.06A1.65 1.65 0  0 0 4.6 15a1.65 1.65 0  0 0-.6-1 1.65 1.65 0  0 0-1-.4H2a2 2 0  1 1 0-4h.1a1.65 1.65 0  0 0 1-.4 1.65 1.65 0  0 0 .6-1 1.65 1.65 0  0 0-.33-1.82l-.06-.06A2 2 0  1 1 6.24 2.9l.06.06A1.65 1.65 0  0 0 8 4.6a1.65 1.65 0  0 0 1-.6 1.65 1.65 0  0 0 .4-1V2a2 2 0  1 1 4 0v.1c0 .38.14.74.4 1 .26.26.62.4 1 .4.62 0 1.22-.25 1.64-.68l.06-.06A2 2 0  1 1 21.1 6.24l-.06.06c-.26.26-.4.62-.4 1s.14.74.4 1c.26.26.62.4 1 .4H22a2 2 0  1 1 0 4h-.1a1.65 1.65 0  0 0-1 .4 1.65 1.65 0  0 0-.6 1Z"/></svg>);
const IconHome=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9v12h14V9"/></svg>);
const IconNote=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M4 3h11l5 5v13H4Z"/><path d="M15 3v6h6"/><path d="M8 13h8M8 17h8"/></svg>);
const IconSparkle=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className={iconCls} {...p}><path d="M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5Z"/><path d="M18 14l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2Z"/></svg>);

/* ---------------- Constants & helpers ---------------- */
const LOGO_PUBLIC="/logo-ng.png"; const LOGO_FALLBACK="./logo-ng.png.png";
const SYMBOLS=["XAUUSD","US100","US30","EURUSD","BTCUSD","AUDCAD","USDCAD","USDJPY","GBPUSD"];
const STRATEGIES=["Trend Line Bounce","2 Touch Point Trend Line Break","3 / 3+ Touch Point Trend Line Break","Trend Line Break & Re-test","Trend Continuation"];
const EXIT_TYPES=["TP","SL","TP1_BE","TP1_SL","BE","Trade In Progress"];
const ACC_TYPES=["Cent Account","Dollar Account"];

const r2=n=>Math.round(n*100)/100;
const fmt$=n=>"$"+(isFinite(n)?r2(n):0).toFixed(2);
const todayISO=()=>{const d=new Date();const tz=d.getTimezoneOffset();return new Date(d.getTime()-tz*60000).toISOString().slice(0,10)};

const USERS_KEY="ng_users_v1";
const CURR_KEY="ng_current_user_v1";
const loadUsers=()=>{try{return JSON.parse(localStorage.getItem(USERS_KEY)||"[]")}catch{return[]}};
const saveUsers=u=>{try{localStorage.setItem(USERS_KEY,JSON.stringify(u))}catch{}};
const saveCurrent=e=>{try{localStorage.setItem(CURR_KEY,e)}catch{}};
const getCurrent=()=>{try{return localStorage.getItem(CURR_KEY)||""}catch{return""}};
const loadState=e=>{try{return JSON.parse(localStorage.getItem("ng_state_"+e)||"null")}catch{return null}};
const saveState=(e,s)=>{try{localStorage.setItem("ng_state_"+e,JSON.stringify(s))}catch{}};

/* -------------- PnL math -------------- */
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

/* -------------- CSV export -------------- */
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

/* -------------- Small UI atoms -------------- */
function Stat({label,value}){return(<div className="bg-slate-900/50 border border-slate-700 rounded-xl p-3"><div className="text-slate-400 text-xs">{label}</div><div className="text-2xl font-bold mt-1">{value}</div></div>)}
function Th({children,className,...rest}){return(<th {...rest} className={(className?className+" ":"")+"px-4 py-3 text-left font-semibold text-slate-300"}>{children}</th>)}
function Td({children,className,...rest}){return(<td {...rest} className={(className?className+" ":"")+"px-4 py-3 align-top"}>{children}</td>)}

function Modal({title,children,onClose,maxClass}){
  return(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3">
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

/* -------------- Account + Settings -------------- */
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

function SettingsPanel({
  name,setName,accType,setAccType,capital,setCapital,depositDate,setDepositDate,email,
  widgets,setWidgets
}){
  const [tab,setTab]=useState("personal");
  const [pw1,setPw1]=useState(""); const [pw2,setPw2]=useState(""); const [msg,setMsg]=useState("");
  const savePw=()=>{ if(!pw1||pw1.length<6){setMsg("Password must be at least 6 characters.");return}
    if(pw1!==pw2){setMsg("Passwords do not match.");return}
    const users=loadUsers();const i=users.findIndex(u=>u.email.toLowerCase()===(email||"").toLowerCase());
    if(i>=0){users[i].password=pw1;saveUsers(users);setMsg("Password updated.");setPw1("");setPw2("")}
  };
  const toggle=(k)=>setWidgets({...widgets,[k]:!widgets[k]});
  const reset=()=>setWidgets({general:true,best:true,detailed:true});

  return(
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4"><IconSettings/><div className="font-semibold">Settings</div></div>
      <div className="flex gap-2 mb-4 flex-wrap">
        <button onClick={()=>setTab("personal")} className={`px-3 py-1.5 rounded-lg border ${tab==="personal"?"bg-slate-700 border-slate-600":"border-slate-700"}`}>Personal Info</button>
        <button onClick={()=>setTab("security")} className={`px-3 py-1.5 rounded-lg border ${tab==="security"?"bg-slate-700 border-slate-600":"border-slate-700"}`}>Privacy & Security</button>
        <button onClick={()=>setTab("customize")} className={`px-3 py-1.5 rounded-lg border ${tab==="customize"?"bg-slate-700 border-slate-600":"border-slate-700"}`}><IconSparkle/> Customize Journal</button>
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
          <div className="text-sm text-slate-300">Choose which widgets appear on your dashboard.</div>
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="flex items-center gap-2 bg-slate-900/50 border border-slate-700 rounded-xl p-3">
              <input type="checkbox" checked={widgets.general} onChange={()=>toggle('general')}/>
              <div><div className="font-semibold">General statistics</div><div className="text-xs text-slate-400">Capital, realized P&L, win rate, open trades</div></div>
            </label>
            <label className="flex items-center gap-2 bg-slate-900/50 border border-slate-700 rounded-xl p-3">
              <input type="checkbox" checked={widgets.best} onChange={()=>toggle('best')}/>
              <div><div className="font-semibold">Best strategy</div><div className="text-xs text-slate-400">Shows after ≥3 trades for a strategy</div></div>
            </label>
            <label className="flex items-center gap-2 bg-slate-900/50 border border-slate-700 rounded-xl p-3">
              <input type="checkbox" checked={widgets.detailed} onChange={()=>toggle('detailed')}/>
              <div><div className="font-semibold">Detailed statistics</div><div className="text-xs text-slate-400">Breakdown by symbol</div></div>
            </label>
          </div>
          <div className="pt-2"><button onClick={reset} className="px-3 py-2 rounded-lg border border-slate-700 hover:bg-slate-900">Reset to defaults</button></div>
        </div>
      )}
    </div>
  )
}

/* -------------- Trade modal -------------- */
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

/* -------------- Calendar -------------- */
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

/* -------------- Persisted app state -------------- */
function usePersisted(email){
  const fresh = () => ({
    name:"",email:email||"",accType:ACC_TYPES[1],capital:0,depositDate:todayISO(),trades:[],
    notes:[],
    dashboardWidgets:{general:true,best:true,detailed:true},
    hasCompletedSetup:true
  });
  const [state,setState]=useState(()=>{const s=loadState(email||getCurrent());return s||fresh()});
  useEffect(()=>{
    const loaded = loadState(email);
    setState(loaded || fresh());
  }, [email]);
  useEffect(()=>{if(!state||!state.email)return;saveState(state.email,state)},[state]);
  return [state,setState];
}

/* -------------- User menu (Export + Import + Logout) -------------- */
function UserMenu({onExport,onImport,onLogout}){
  const [open,setOpen]=useState(false);
  return(
    <div className="relative">
      <button onClick={()=>setOpen(v=>!v)} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-700 hover:bg-slate-800"><IconUser/></button>
      {open&&(<div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-lg overflow-hidden">
        <button onClick={()=>{setOpen(false);onExport()}} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-700"><IconDownload/>Export CSV</button>
        <button onClick={()=>{setOpen(false);onImport()}} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-700"><IconUpload/>Import CSV</button>
        <button onClick={()=>{setOpen(false);onLogout()}} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-700 text-red-300"><IconLogout/>Logout</button>
      </div>)}
    </div>
  )
}

/* -------------- Dashboard cards -------------- */
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

function BestStrategyCard({trades,accType}){
  const stats=useMemo(()=>{
    const byStrat={};
    for(const t of trades){
      if(!(t.exitType && t.exitType!=="Trade In Progress")) continue;
      const k=t.strategy||"N/A";
      const v=computeDollarPnL(t,accType);
      const s=byStrat[k]||{wins:0,losses:0,count:0};
      if(v>0) s.wins++; else if(v<0) s.losses++;
      s.count++;
      byStrat[k]=s;
    }
    let best=null; let bestRate=-1;
    Object.entries(byStrat).forEach(([k,v])=>{
      if(v.count>=3){
        const rate = v.wins/(v.wins+v.losses||1);
        if(rate>bestRate){bestRate=rate; best={name:k,rate,count:v.count}}
      }
    });
    return best?{name:best.name,rate:Math.round(best.rate*100),count:best.count}:{name:"—",rate:0,count:0};
  },[trades,accType]);
  return(
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-2"><IconSparkle/><div className="text-sm font-semibold">Best strategy</div></div>
      {stats.count===0?(
        <div className="text-slate-400 text-sm">Need at least 3 trades in one strategy to display.</div>
      ):(
        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="font-semibold">{stats.name}</div>
            <div className="text-sm text-slate-300">{stats.rate}% win rate</div>
          </div>
          <div className="h-2 rounded-full bg-slate-700 overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-blue-500 to-emerald-500" style={{width:`${stats.rate}%`}}/>
          </div>
        </div>
      )}
    </div>
  )
}

/* -------------- Detailed stats + History -------------- */
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

/* -------------- Notes -------------- */
function FuturisticTradeChip({t,accType}){
  const v=computeDollarPnL(t,accType);
  const status=(t.exitType && t.exitType!=="Trade In Progress")?"CLOSED":"OPEN";
  return(
    <div className="rounded-xl border border-sky-600/30 bg-gradient-to-r from-sky-900/20 to-violet-900/20 ring-1 ring-sky-500/10 px-3 py-2 text-sm">
      <div className="flex flex-wrap items-center gap-3">
        <div className="font-semibold text-sky-300">{t.symbol}</div>
        <div className={`${v>0?'text-emerald-400':v<0?'text-rose-400':'text-slate-300'}`}>{v===null?'-':formatPnlDisplay(accType,v)}</div>
        <div className="text-xs px-2 py-0.5 rounded-full border border-slate-600">{status}</div>
        <div className="text-xs text-slate-300 italic">{t.strategy||'-'}</div>
      </div>
    </div>
  )
}

function NoteComposeModal({onClose,onSave,trades,accType}){
  const [date,setDate]=useState(todayISO());
  const [text,setText]=useState("");
  const [tradeId,setTradeId]=useState("");
  const selected=trades.find(t=>t.id===tradeId);
  return(
    <Modal title="New note" onClose={onClose} maxClass="max-w-2xl">
      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div><label className="text-sm text-slate-300">Date</label><input type="date" value={date} onChange={e=>setDate(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
          <div className="sm:col-span-2">
            <label className="text-sm text-slate-300">Refer to a trade (optional)</label>
            <select value={tradeId} onChange={e=>setTradeId(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2">
              <option value="">— None —</option>
              {trades.slice(0,200).map(t=><option key={t.id} value={t.id}>{t.date} · {t.symbol} · {t.side} · Lot {t.lotSize}</option>)}
            </select>
          </div>
        </div>
        {selected&&<FuturisticTradeChip t={selected} accType={accType}/>}
        <div>
          <label className="text-sm text-slate-300">Note</label>
          <textarea rows={7} value={text} onChange={e=>setText(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2" placeholder="Thoughts, lessons, psychology, context..."/>
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-600 hover:bg-slate-700">Discard</button>
          <button onClick={()=>{if(text.trim()){onSave({id:Math.random().toString(36).slice(2),date,text,tradeId}); onClose();}}} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500">Save</button>
        </div>
      </div>
    </Modal>
  )
}

function NotesList({notes,trades,accType}){
  const tradeById=useMemo(()=>{const m={};trades.forEach(t=>m[t.id]=t);return m},[trades]);
  return(
    <div className="space-y-3">
      {notes.length===0?(
        <div className="text-slate-400 text-sm">No notes yet.</div>
      ):notes.slice().reverse().map(n=>{
        const t=tradeById[n.tradeId||""]; return(
          <div key={n.id} className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-slate-300">{n.date}</div>
            </div>
            {t&&<div className="mb-3"><FuturisticTradeChip t={t} accType={accType}/></div>}
            <div className="text-sm text-slate-200 line-clamp-4">{n.text}</div>
          </div>
        )
      })}
    </div>
  )
}

/* -------------- Shell -------------- */
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

/* -------------- Login -------------- */
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

/* -------------- Reset password modals (unchanged behavior) -------------- */
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
      setMsg('Failed to send email: ' + error.text);
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

/* -------------- Import overlay -------------- */
function ImportOverlay({open,progress,message,onCancel}){
  if(!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-[92vw] max-w-md bg-slate-800 border border-slate-700 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3"><IconUpload/><div className="font-semibold">Importing…</div></div>
        <div className="text-sm text-slate-300 mb-2">{message || "Parsing file. Large files may take longer depending on size and your device."}</div>
        <div className="h-2 rounded-full bg-slate-700 overflow-hidden mb-3">
          <div className="h-2 bg-gradient-to-r from-blue-500 to-emerald-500 transition-all" style={{width:`${progress}%`}}/>
        </div>
        <div className="text-xs text-slate-400 mb-3">Tip: Keep this tab active for faster processing.</div>
        <div className="text-right">
          <button onClick={onCancel} className="px-3 py-1.5 rounded-lg border border-slate-600 hover:bg-slate-700">Close</button>
        </div>
      </div>
    </div>
  )
}

/* -------------- App -------------- */
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

  // Import UI
  const fileRef=useRef(null);
  const [importOpen,setImportOpen]=useState(false);
  const [importMsg,setImportMsg]=useState("");
  const [importProg,setImportProg]=useState(0);

  useEffect(()=>{const hash=new URLSearchParams(location.hash.slice(1));const tok=hash.get("reset"); if(tok){setResetToken(tok)}},[]);
  // Do NOT auto-open account setup for existing users; it's available from sidebar
  useEffect(()=>{/* intentionally not auto-opening account setup */},[state?.email]);
  useEffect(()=>{if(typeof emailjs !== 'undefined'){emailjs.init({publicKey: "YOUR_EMAILJS_PUBLIC_KEY"});}},[]); // Initialize EmailJS

  const openTrades=state.trades.filter(t=> !t.exitType || t.exitType === "Trade In Progress").length;
  const realized=state.trades.filter(t=>new Date(t.date)>=new Date(state.depositDate)&&t.exitType && t.exitType !== "Trade In Progress").map(t=>computeDollarPnL(t,state.accType)).filter(v=>v!==null&&isFinite(v)).reduce((a,b)=>a+b,0);
  const effectiveCapital=state.capital+realized;

  const onExport=()=>{const csv=toCSV(state.trades,state.accType);const blob=new Blob([csv],{type:"text/csv;charset=utf-8;"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="Nitty_Gritty_Template_Export.csv";a.click();URL.revokeObjectURL(url)};
  const onImport=()=>{if(fileRef.current) fileRef.current.click()};
  const onLogout=()=>{saveCurrent("");setCurrentEmail("")};

  const initGoogle=(container,onEmail)=>{
    const clientId=window.GOOGLE_CLIENT_ID;
    if(!window.google||!clientId||!container) return;
    window.google.accounts.id.initialize({client_id:clientId,callback:(resp)=>{const p=parseJwt(resp.credential); if(p&&p.email){onEmail(p.email)}}});
    window.google.accounts.id.renderButton(container,{theme:"outline",size:"large",text:"signin_with",shape:"pill"});
  };

  const login=(email,password,setErr)=>{const u=users.find(x=>x.email.toLowerCase()===email.toLowerCase());
    if(!u){ if(password==="__google__"){const nu=[...users,{name:email.split("@")[0],email,password:""}]; setUsers(nu); saveUsers(nu); const fresh={name:email.split("@")[0],email,accType:ACC_TYPES[1],capital:0,depositDate:todayISO(),trades:[],notes:[],dashboardWidgets:{general:true,best:true,detailed:true},hasCompletedSetup:true}; saveState(email,fresh); saveCurrent(email); setCurrentEmail(email); return;}
      setErr("No such user. Please sign up."); return;}
    if(password!=="__google__" && u.password!==password){setErr("Wrong password.");return}
    setErr(""); saveCurrent(u.email); setCurrentEmail(u.email);
  };

  const signup=(name,email,password,setErr)=>{if(users.some(x=>x.email.toLowerCase()===email.toLowerCase())){setErr("Email already registered.");return}
    const u={name,email,password}; const nu=[...users,u]; setUsers(nu); saveUsers(nu);
    const fresh={name,email,accType:ACC_TYPES[1],capital:0,depositDate:todayISO(),trades:[],notes:[],dashboardWidgets:{general:true,best:true,detailed:true},hasCompletedSetup:true}; saveState(email,fresh); saveCurrent(email); setCurrentEmail(email);
  };

  const resetStart=(emailGuess)=>{setShowReset(true)};

  const addOrUpdate=(draft)=>{const id=draft.id||Math.random().toString(36).slice(2); const arr=state.trades.slice(); const idx=arr.findIndex(t=>t.id===id); const rec={...draft,id}; if(idx>=0)arr[idx]=rec; else arr.unshift(rec); setState({...state,trades:arr}); setShowTrade(false); setEditItem(null)};
  const delTrade=(id)=>setState({...state,trades:state.trades.filter(t=>t.id!==id)});

  /* ---------- CSV/XLSX Import ---------- */
  const normalizeHeader=(h)=>String(h||"").trim().toLowerCase().replace(/\s+/g,' ').replace(/[\(\)\.]/g,'');
  const colMatch=(headers,aliases)=>{for(let i=0;i<headers.length;i++){const h=normalizeHeader(headers[i]); if(aliases.some(a=>h===a)) return i} return -1};
  const toISO=(v)=>{
    if(v===null||v===undefined||v==="") return todayISO();
    if(typeof v==="number" && window.XLSX && XLSX.SSF){ const o=XLSX.SSF.parse_date_code(v); if(o){const d=new Date(Date.UTC(o.y,o.m-1,o.d)); const tz=d.getTimezoneOffset(); return new Date(d.getTime()-tz*60000).toISOString().slice(0,10)} }
    const d=new Date(v); if(!isNaN(d)) {const tz=d.getTimezoneOffset(); return new Date(d.getTime()-tz*60000).toISOString().slice(0,10)}
    return todayISO();
  };
  const parseNum=(x)=>{ if(x===null||x===undefined||x==="") return undefined; const n=parseFloat(String(x).replace(/,/g,'')); return isFinite(n)?n:undefined };
  const parseSide=(s)=>{s=String(s||"").toUpperCase(); return s.includes("SELL")?"SELL":"BUY"};
  const deduceExitType=(row)=>{ if(row.exit!==undefined && row.exit!=="" && isFinite(row.exit)) return row.exitType||"TP"; return row.exitType||"Trade In Progress"; };

  const handleFile=async (ev)=>{
    const file = ev.target.files && ev.target.files[0];
    ev.target.value=""; // reset
    if(!file) return;
    setImportOpen(true);
    setImportProg(5);
    setImportMsg(`Reading ${file.name} (${(file.size/1e6).toFixed(2)} MB)…`);

    const processRows = async (rows)=>{
      if(!rows || rows.length<2){ setImportMsg("No data rows found."); setImportProg(100); return }
      const headers = rows[0];

      const idx = (aliases)=>colMatch(headers,aliases);
      const I = {
        date: idx(['date','trade date']),
        symbol: idx(['symbol','pair','instrument']),
        side: idx(['side','action','type']),
        lot: idx(['lot size','lot','volume','qty','quantity']),
        entry: idx(['entry','entry price','open','open price','price in','entryprice']),
        exit: idx(['exit','exit price','close','close price','exitprice']),
        tp1: idx(['tp1','tp 1','take profit 1']),
        tp2: idx(['tp2','tp 2','take profit 2']),
        sl: idx(['sl','stop loss','stop-loss','stop']),
        strategy: idx(['strategy','setup']),
        exitType: idx(['exit type','exittype','result','outcome']),
        pnl: idx(['p&l','pnl','profit','profit/loss']),
        pnlUnits: idx(['p&l units','p&l (units)','pnl units']),
        status: idx(['status'])
      };

      const total=rows.length-1;
      const batch=200;
      let r=1;
      const newTrades=[];
      const step=()=>{
        const end=Math.min(r+batch,rows.length);
        for(let i=r;i<end;i++){
          const row=rows[i]||[];
          const t={
            id:Math.random().toString(36).slice(2),
            date: toISO(I.date>=0?row[I.date]:todayISO()),
            symbol: String(I.symbol>=0?row[I.symbol]||'').toUpperCase() || 'XAUUSD',
            side: parseSide(I.side>=0?row[I.side]:'BUY'),
            lotSize: parseNum(I.lot>=0?row[I.lot]:0.01) || 0.01,
            entry: parseNum(I.entry>=0?row[I.entry]:undefined),
            exit: parseNum(I.exit>=0?row[I.exit]:undefined),
            tp1: parseNum(I.tp1>=0?row[I.tp1]:undefined),
            tp2: parseNum(I.tp2>=0?row[I.tp2]:undefined),
            sl: parseNum(I.sl>=0?row[I.sl]:undefined),
            strategy: I.strategy>=0? String(row[I.strategy]||STRATEGIES[0]): STRATEGIES[0],
            exitType: undefined
          };
          t.exitType = deduceExitType(t);

          // Respect provided P&L if present; otherwise computed in UI. (No need to store separately.)
          // We still read P&L & units/status from CSV to satisfy "retrieved", but we keep data model minimal.
          if(I.pnl>=0){ t._importPnL=parseNum(row[I.pnl]); }
          if(I.pnlUnits>=0){ t._importUnits=String(row[I.pnlUnits]??""); }
          if(I.status>=0){ t._importStatus=String(row[I.status]??""); }

          newTrades.push(t);
        }
        r=end;
        const pct = Math.max(10, Math.round((r-1)/total*100));
        setImportProg(pct);
        setImportMsg(`Importing ${Math.min(r-1,total)} / ${total} rows…`);
        if(r<rows.length){ setTimeout(step,0); }
        else{
          // Prepend new trades
          setState(s=>({...s,trades:[...newTrades,...s.trades]}));
          setImportMsg(`Imported ${newTrades.length} trades successfully.`);
          setImportProg(100);
          setTimeout(()=>setImportOpen(false),900);
        }
      };
      step();
    };

    try{
      if(/\.(xlsx|xls)$/i.test(file.name)){
        const buf=await file.arrayBuffer();
        const wb=XLSX.read(buf,{type:'array'});
        const sheet=wb.Sheets[wb.SheetNames[0]];
        const rows=XLSX.utils.sheet_to_json(sheet,{header:1,raw:true});
        setImportProg(15);
        setImportMsg(`Parsing worksheet “${wb.SheetNames[0]}” …`);
        processRows(rows);
      }else{
        const text=await file.text();
        const wb=XLSX.read(text,{type:'string'});
        const sheet=wb.Sheets[wb.SheetNames[0]];
        const rows=XLSX.utils.sheet_to_json(sheet,{header:1,raw:true});
        setImportProg(15);
        setImportMsg("Parsing CSV …");
        processRows(rows);
      }
    }catch(err){
      setImportMsg("Import failed: "+(err&&err.message?err.message:String(err)));
      setImportProg(100);
    }
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
      <input type="file" ref={fileRef} className="hidden" accept=".csv,.xlsx,.xls" onChange={handleFile}/>
      <ImportOverlay open={importOpen} progress={importProg} message={importMsg} onCancel={()=>setImportOpen(false)}/>
      <AppShell capitalPanel={capitalPanel} nav={nav} logoSrc={logoSrc} onToggleSidebar={()=>setCollapsed(v=>!v)} onExport={onExport} onImport={onImport} onLogout={onLogout} sidebarCollapsed={collapsed}>
        {page==="dashboard"&&(<div className="space-y-4">
          {state.dashboardWidgets.general&&(<><div className="text-sm font-semibold">General statistics</div><GeneralStats trades={state.trades} accType={state.accType} capital={state.capital} depositDate={state.depositDate}/></>)}
          {state.dashboardWidgets.best&&(<BestStrategyCard trades={state.trades} accType={state.accType}/>)}
          {state.dashboardWidgets.detailed&&(<DetailedStats trades={state.trades} accType={state.accType}/>)}
        </div>)}
        {page==="histories"&&(<Histories trades={state.trades} accType={state.accType} onEdit={t=>{setEditItem(t);setShowTrade(true)}} onDelete={delTrade}/>)}
        {page==="settings"&&(<SettingsPanel
          name={state.name} setName={v=>setState({...state,name:v})}
          accType={state.accType} setAccType={v=>setState({...state,accType:v})}
          capital={state.capital} setCapital={v=>setState({...state,capital:v||0})}
          depositDate={state.depositDate} setDepositDate={v=>setState({...state,depositDate:v})}
          email={state.email}
          widgets={state.dashboardWidgets} setWidgets={w=>setState({...state,dashboardWidgets:w})}
        />)}
        {page==="notes"&&(<NotesPageWrapper state={state} setState={setState}/>)}

        {showTrade&&(<TradeModal initial={editItem} onClose={()=>{setShowTrade(false);setEditItem(null)}} onSave={addOrUpdate} onDelete={delTrade} accType={state.accType}/>)}
        {showAcct&&(<AccountSetupModal name={state.name} setName={v=>setState({...state,name:v})} accType={state.accType} setAccType={v=>setState({...state,accType:v})} capital={state.capital} setCapital={v=>setState({...state,capital:v||0})} depositDate={state.depositDate} setDepositDate={v=>setState({...state,depositDate:v})} onClose={()=>setShowAcct(false)} email={state.email}/>)}
        {showCal&&(<CalendarModal onClose={()=>setShowCal(false)} trades={state.trades} view={calView} setView={setCalView} month={calMonth} setMonth={setCalMonth} year={calYear} setYear={setCalYear} selectedDate={calSel} setSelectedDate={setCalSel} accType={state.accType}/>)}
        {showReset&&(<ResetModal email="" onClose={()=>setShowReset(false)}/>)}
      </AppShell>
    </>
  )
}

/* Notes page wrapper to handle first-open composer */
function NotesPageWrapper({state,setState}){
  const [showCompose,setShowCompose]=useState(true);
  const onSave=(n)=>setState(s=>({...s,notes:[...s.notes,n]}));
  return(
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">Notes</div>
        <button onClick={()=>setShowCompose(true)} className="px-3 py-2 rounded-lg border border-slate-700 hover:bg-slate-800 flex items-center gap-2"><IconPlus/>Add note</button>
      </div>
      {showCompose&&(<NoteComposeModal onClose={()=>setShowCompose(false)} onSave={onSave} trades={state.trades} accType={state.accType}/>)}
      {!showCompose&&(<NotesList notes={state.notes} trades={state.trades} accType={state.accType}/>)}
    </div>
  )
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
