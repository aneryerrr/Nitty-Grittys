/* global React, ReactDOM, google */
const { useState, useEffect, useMemo } = React;

/* ========== Icons ========== */
const iconCls = "h-5 w-5";
const IconUser = (p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconCls} {...p}><path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Z"/><path d="M4 20a8 8 0 0 1 16 0Z"/></svg>);
const IconDownload=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconCls} {...p}><path d="M12 3v10"/><path d="M8 11l4 4 4-4"/><path d="M5 21h14v-4H5Z"/></svg>);
const IconLogout=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconCls} {...p}><path d="M9 21h4a4 4 0 0 0 4-4V7a4 4 0 0 0-4-4H9"/><path d="M16 12H3"/><path d="M7 8l-4 4 4 4"/></svg>);
const IconCalendar=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconCls} {...p}><path d="M8 3v4M16 3v4"/><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18"/></svg>);
const IconPlus=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconCls} {...p}><path d="M12 5v14M5 12h14"/></svg>);
const IconEdit=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconCls} {...p}><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4Z"/></svg>);
const IconSettings=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconCls} {...p}><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0  0 0-1 .6 1.65 1.65 0 0 0-.4 1V22a2 2 0 1 1-4 0v-.1a1.65 1.65 0 0 0-.4-1 1.65 1.65 0 0 0-1-.6 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0  0 0 4.6 15a1.65 1.65 0 0 0-.6-1 1.65 1.65 0  0 0-1-.4H2a2 2 0 1 1 0-4h.1a1.65 1.65 0  0 0 1-.4 1.65 1.65 0  0 0 .6-1 1.65 1.65 0  0 0-.33-1.82l-.06-.06A2 2 0 1 1 6.24 2.9l.06.06A1.65 1.65 0  0 0 8 4.6a1.65 1.65 0  0 0 1-.6 1.65 1.65 0  0 0 .4-1V2a2 2 0 1 1 4 0v.1c0 .38.14.74.4 1 .26.26.62.4 1 .4.62 0 1.22-.25 1.64-.68l.06-.06A2 2 0 1 1 21.1 6.24l-.06.06c-.26.26-.4.62-.4 1s.14.74.4 1c.26.26.62.4 1 .4H22a2 2 0 1 1 0 4h-.1a1.65 1.65 0  0 0-1 .4 1.65 1.65 0  0 0-.6 1Z"/></svg>);
const IconHome=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconCls} {...p}><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9v12h14V9"/></svg>);
const IconChevronL=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconCls} {...p}><path d="M15 6l-6 6 6 6"/></svg>);
const IconChevronR=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconCls} {...p}><path d="M9 6l6 6-6 6"/></svg>);

/* ========== Constants & helpers ========== */
const LOGO = "logo-ng.png";
const SYMBOLS = ["XAUUSD","US100","US30","EURUSD","BTCUSD","AUDCAD","USDCAD","USDJPY","GBPUSD"];
const STRATEGIES = [
  "Trend Line Bounce",
  "2 Touch Point Trend Line Break",
  "3 / 3+ Touch Point Trend Line Break",
  "Trend Line Break & Re-test",
  "Trend Continuation"
];
const EXIT_TYPES = ["TP","SL","TP1_BE","TP1_SL","BE"];
const ACC_TYPES = ["Cent Account","Dollar Account"];

const r2 = (n)=>Math.round(n*100)/100;
const fmt$=(n)=>"$"+(isFinite(n)?r2(n):0).toFixed(2);
const todayISO=()=>{const d=new Date(),tz=d.getTimezoneOffset();return new Date(d-tz*60000).toISOString().slice(0,10);};

/* Storage */
const USERS_KEY="ng_users_v1";
const CURR_KEY ="ng_current_user_v1";
const RESET_KEY="ng_pwreset_tokens_v1"; // map token -> {email,exp}

const loadUsers = ()=>{try{return JSON.parse(localStorage.getItem(USERS_KEY)||"[]")}catch{return[]}};
const saveUsers = (u)=>{try{localStorage.setItem(USERS_KEY,JSON.stringify(u))}catch{}};
const setCurr   = (e)=>{try{localStorage.setItem(CURR_KEY,e||"")}catch{}};
const getCurr   = ()=>{try{return localStorage.getItem(CURR_KEY)||""}catch{return""}};
const loadState = (e)=>{if(!e) return null; try{return JSON.parse(localStorage.getItem("ng_state_"+e)||"null")}catch{return null}};
const saveState = (e,s)=>{try{localStorage.setItem("ng_state_"+e,JSON.stringify(s))}catch{}};

const loadTokens=()=>{try{return JSON.parse(localStorage.getItem(RESET_KEY)||"{}")}catch{return{}}};
const saveTokens=(m)=>{try{localStorage.setItem(RESET_KEY,JSON.stringify(m))}catch{}};
const genToken = ()=>Math.random().toString(36).slice(2)+Math.random().toString(36).slice(2);

/* PnL helpers (same as before) */
function perLotValueForMove(symbol, priceDelta, accType){
  const abs=Math.abs(priceDelta), isStd=accType==="Dollar Account", mult=(x)=>isStd?x:x/100;
  switch(symbol){
    case "US30": case "US100": return abs*mult(10);
    case "XAUUSD": return abs*mult(100);
    case "BTCUSD": return abs*mult(1);
    case "EURUSD": case "GBPUSD": { const pips=abs/0.0001; return pips*mult(10); }
    case "AUDCAD": case "USDCAD": { const pips=abs/0.0001; return pips*mult(7.236); }
    case "USDJPY": { const pips=abs/0.01;   return pips*mult(6.795); }
    default: return 0;
  }
}
function legPnL(symbol, side, entry, exit, lot, accType){
  const raw = perLotValueForMove(symbol, exit-entry, accType)*(lot||0);
  const sign = side==="BUY" ? Math.sign(exit-entry) : -Math.sign(exit-entry);
  return raw*sign;
}
function computeDollarPnL(t, accType){
  if(typeof t.exit==="number" && (!t.exitType || t.exitType==="TP")){
    return legPnL(t.symbol, t.side, t.entry, t.exit, t.lotSize, accType);
  }
  const has=(v)=>typeof v==="number" && isFinite(v);
  const {entry,sl,tp1,tp2,lotSize:lot}=t;
  switch(t.exitType){
    case "SL": if(!has(sl)) return null; return legPnL(t.symbol,t.side,entry,sl,lot,accType);
    case "TP": if(has(tp2)) return legPnL(t.symbol,t.side,entry,tp2,lot,accType);
               if(has(tp1)) return legPnL(t.symbol,t.side,entry,tp1,lot,accType);
               return null;
    case "TP1_BE": if(!has(tp1)) return null; return (legPnL(t.symbol,t.side,entry,tp1,lot,accType)+0)/2;
    case "TP1_SL": if(!has(tp1)||!has(sl)) return null;
                   return (legPnL(t.symbol,t.side,entry,tp1,lot,accType)+legPnL(t.symbol,t.side,entry,sl,lot,accType))/2;
    case "BE": return 0;
    default: return null;
  }
}
const formatPnl=(accType,v)=>accType==="Cent Account"? (r2(v*100)).toFixed(2)+" ¢": fmt$(v);
const formatUnits=(accType,v)=>accType==="Dollar Account"? r2(v).toFixed(2): r2(v*100).toFixed(2);

/* CSV */
function toCSV(rows){
  if(!rows.length) return "";
  const HEADERS=["date","symbol","side","lotSize","entry","exit","tp1","tp2","sl","strategy","exitType","pnl_dollars","pnl_units"];
  const NL="\r\n", BOM="﻿";
  const esc=(v)=>{ if(v==null) return ""; const s=String(v); return /[",\n]/.test(s)?`"${s.replace(/"/g,'""')}"`:s; };
  const lines=[HEADERS.map(esc).join(",")];
  for(const r of rows) lines.push(HEADERS.map(h=>esc(r[h])).join(","));
  return BOM+lines.join(NL);
}

/* ===== UI bits ===== */
function Th(p){return <th {...p} className={"px-4 py-3 text-left font-semibold text-slate-300 "+(p.className||"")} />;}
function Td(p){return <td {...p} className={"px-4 py-3 align-top "+(p.className||"")} />;}
function Stat({label,value}){return(<div className="bg-slate-900/50 border border-slate-700 rounded-xl p-3"><div className="text-slate-400 text-xs">{label}</div><div className="text-2xl font-bold mt-1">{value}</div></div>);}

function Modal({title,children,onClose}){
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-3 ng-modal">
      <div className="relative w-[95vw] ng-card bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-auto">
        <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-slate-800/95 backdrop-blur">
          <div className="font-semibold">{title}</div>
          <button onClick={onClose} className="px-3 py-1.5 rounded-lg border border-slate-600 hover:bg-slate-700">✕</button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

/* ===== Forgot password flow (email template + reset) ===== */
function ForgotPasswordModal({ onClose }){
  const [email,setEmail]=useState("");
  const [preview,setPreview]=useState(null);
  const gen = ()=>{
    const users=loadUsers();
    const u=users.find(x=>x.email.toLowerCase()===email.toLowerCase());
    const first = (u?.name?.split(" ")[0]) || (email.split("@")[0]||"Trader");
    const token=genToken();
    const expMs=30*60*1000;  // 30 minutes
    const expiry=new Date(Date.now()+expMs);
    const tokens=loadTokens(); tokens[token]={email:u?u.email:email, exp:expiry.getTime()}; saveTokens(tokens);
    const resetLink = `${location.origin}${location.pathname}?reset=${encodeURIComponent(token)}`;
    const expiryText = "30 minutes";
    const body =
`Dear ${first},

We received a request to reset the password for your Trading Journal account. To proceed, please click the link below: 

${resetLink}

This link will expire in ${expiryText}. If you did not request a reset, please ignore this email.

Regards,
Nitty Gritty Support`;
    setPreview({resetLink, expiryText, first, token, body});
  };
  const openMail = ()=>{
    if(!preview) return;
    const subject = "Reset your Nitty Gritty password";
    const body = preview.body + "\n\n(From: support@nittygritty.com)";
    window.location.href = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };
  return (
    <Modal title="Forgot Password" onClose={onClose}>
      <div className="space-y-3">
        <div>
          <label className="text-sm text-slate-300">Account Email</label>
          <input value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@example.com"
                 className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2" />
        </div>
        {!preview ? (
          <div className="flex justify-end">
            <button onClick={gen} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500">Generate Reset Link</button>
          </div>
        ) : (
          <>
            <div className="text-sm text-slate-300">From: <b>support@nittygritty.com</b></div>
            <div className="text-sm text-slate-300">To: <b>{email}</b></div>
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm whitespace-pre-wrap">{preview.body}</div>
            <div className="flex gap-2 justify-end">
              <button onClick={()=>navigator.clipboard.writeText(preview.body)} className="px-3 py-2 rounded-lg border border-slate-700 hover:bg-slate-700">Copy Email</button>
              <button onClick={openMail} className="px-3 py-2 rounded-lg border border-slate-700 hover:bg-slate-700">Open Mail Client</button>
              <button onClick={onClose} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500">Done</button>
            </div>
            <div className="text-xs text-slate-400">Note: On static hosting, we show a preview and open your mail client to send the message.</div>
          </>
        )}
      </div>
    </Modal>
  );
}

function ResetPasswordModal({ email, token, onClose }){
  const [p1,setP1]=useState(""); const [p2,setP2]=useState(""); const [msg,setMsg]=useState("");
  const save=()=>{
    if(p1.length<6) return setMsg("Password must be at least 6 characters.");
    if(p1!==p2) return setMsg("Passwords do not match.");
    const users=loadUsers(); const i=users.findIndex(u=>u.email.toLowerCase()===email.toLowerCase());
    if(i>=0){ users[i].password=p1; saveUsers(users); }
    const tokens=loadTokens(); delete tokens[token]; saveTokens(tokens);
    setMsg("Password updated. You can close this window and log in.");
  };
  return(
    <Modal title="Set New Password" onClose={onClose}>
      <div className="space-y-3">
        <div className="text-sm text-slate-300">Email: <b>{email}</b></div>
        <input type="password" placeholder="New password" value={p1} onChange={(e)=>setP1(e.target.value)}
               className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/>
        <input type="password" placeholder="Confirm password" value={p2} onChange={(e)=>setP2(e.target.value)}
               className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/>
        {msg && <div className="text-sky-400 text-sm">{msg}</div>}
        <div className="text-right">
          <button onClick={save} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500">Save</button>
        </div>
      </div>
    </Modal>
  );
}

/* ===== Account setup & settings ===== */
function AccountSetupModal({ name,setName, accType,setAccType, capital,setCapital, depositDate,setDepositDate, onClose, email }){
  const [tab,setTab]=useState('personal'); const [pw1,setPw1]=useState(''); const [pw2,setPw2]=useState(''); const [msg,setMsg]=useState('');
  const savePassword=()=>{
    if(pw1.length<6) return setMsg('Password must be at least 6 characters.');
    if(pw1!==pw2) return setMsg('Passwords do not match.');
    const users=loadUsers(); const i=users.findIndex(u=>u.email.toLowerCase()===(email||'').toLowerCase());
    if(i>=0){ users[i].password=pw1; saveUsers(users); setMsg('Password updated.'); setPw1(''); setPw2(''); }
  };
  return(
    <Modal title="Account Setup" onClose={onClose}>
      <div className="flex gap-2 mb-4">
        <button onClick={()=>setTab('personal')} className={`px-3 py-1.5 rounded-lg border ${tab==='personal'?'bg-slate-700 border-slate-600':'border-slate-700'}`}>Personal Info</button>
        <button onClick={()=>setTab('security')} className={`px-3 py-1.5 rounded-lg border ${tab==='security'?'bg-slate-700 border-slate-600':'border-slate-700'}`}>Privacy & Security</button>
      </div>
      {tab==='personal'?(
        <div className="space-y-4">
          <div><label className="text-sm text-slate-300">Name</label>
            <input value={name} onChange={(e)=>setName(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className="text-sm text-slate-300">Acc Type</label>
              <select value={accType} onChange={(e)=>setAccType(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2">{ACC_TYPES.map(s=><option key={s}>{s}</option>)}</select></div>
            <div><label className="text-sm text-slate-300">Account Capital ($)</label>
              <input type="number" value={capital} onChange={(e)=>setCapital(parseFloat(e.target.value||'0'))} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2" placeholder="0.00"/></div>
            <div><label className="text-sm text-slate-300">Capital Deposit Date</label>
              <input type="date" value={depositDate} onChange={(e)=>setDepositDate(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
          </div>
          <div className="text-right"><button onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-700 hover:bg-slate-900">Save & Close</button></div>
        </div>
      ):(
        <div className="space-y-3">
          <div><label className="text-sm text-slate-300">New Password</label>
            <input type="password" value={pw1} onChange={(e)=>setPw1(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
          <div><label className="text-sm text-slate-300">Confirm Password</label>
            <input type="password" value={pw2} onChange={(e)=>setPw2(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
          {msg && <div className="text-sky-400 text-sm">{msg}</div>}
          <div className="text-right"><button onClick={savePassword} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500">Update Password</button></div>
        </div>
      )}
    </Modal>
  );
}

function SettingsPanel({ name,setName, accType,setAccType, capital,setCapital, depositDate,setDepositDate, email }){
  const [tab,setTab]=useState('personal'); const [pw1,setPw1]=useState(''); const [pw2,setPw2]=useState(''); const [msg,setMsg]=useState('');
  const savePassword=()=>{
    if(pw1.length<6) return setMsg('Password must be at least 6 characters.');
    if(pw1!==pw2) return setMsg('Passwords do not match.');
    const users=loadUsers(); const i=users.findIndex(u=>u.email.toLowerCase()===(email||'').toLowerCase());
    if(i>=0){ users[i].password=pw1; saveUsers(users); setMsg('Password updated.'); setPw1(''); setPw2('');}
  };
  return(
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4"><IconSettings/><div className="font-semibold">Settings</div></div>
      <div className="flex gap-2 mb-4">
        <button onClick={()=>setTab('personal')} className={`px-3 py-1.5 rounded-lg border ${tab==='personal'?'bg-slate-700 border-slate-600':'border-slate-700'}`}>Personal Info</button>
        <button onClick={()=>setTab('security')} className={`px-3 py-1.5 rounded-lg border ${tab==='security'?'bg-slate-700 border-slate-600':'border-slate-700'}`}>Privacy & Security</button>
      </div>
      {tab==='personal'?(
        <div className="space-y-4">
          <div><label className="text-sm text-slate-300">Name</label>
            <input value={name} onChange={(e)=>setName(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className="text-sm text-slate-300">Acc Type</label>
              <select value={accType} onChange={(e)=>setAccType(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2">{ACC_TYPES.map(s=><option key={s}>{s}</option>)}</select></div>
            <div><label className="text-sm text-slate-300">Account Capital ($)</label>
              <input type="number" value={capital} onChange={(e)=>setCapital(parseFloat(e.target.value||'0'))} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2" placeholder="0.00"/></div>
            <div><label className="text-sm text-slate-300">Capital Deposit Date</label>
              <input type="date" value={depositDate} onChange={(e)=>setDepositDate(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
          </div>
        </div>
      ):(
        <div className="space-y-3">
          <div><label className="text-sm text-slate-300">New Password</label>
            <input type="password" value={pw1} onChange={(e)=>setPw1(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
          <div><label className="text-sm text-slate-300">Confirm Password</label>
            <input type="password" value={pw2} onChange={(e)=>setPw2(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
          {msg && <div className="text-sky-400 text-sm">{msg}</div>}
          <div className="text-right"><button onClick={savePassword} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500">Update Password</button></div>
        </div>
      )}
    </div>
  );
}

/* ===== Trade modal ===== */
function TradeModal({ initial,onClose,onSave,onDelete, accType }){
  const i=initial||{};
  const [symbol,setSymbol]=useState(i.symbol||SYMBOLS[0]);
  const [side,setSide]=useState(i.side||'BUY');
  const [date,setDate]=useState(i.date||todayISO());
  const [lotSize,setLotSize]=useState(i.lotSize??0.01);
  const [entry,setEntry]=useState(i.entry??'');
  const [exit,setExit]=useState(i.exit??'');
  const [tp1,setTp1]=useState(i.tp1??'');
  const [tp2,setTp2]=useState(i.tp2??'');
  const [sl,setSl]=useState(i.sl??'');
  const [strategy,setStrategy]=useState(i.strategy||STRATEGIES[0]);
  const [exitType,setExitType]=useState(i.exitType||'TP');

  const num=(v)=>(v===''||v==null)?undefined:parseFloat(v);
  const draft=useMemo(()=>({
    id:i.id, date, symbol, side,
    lotSize:parseFloat(lotSize||0),
    entry:num(entry), exit:num(exit), tp1:num(tp1), tp2:num(tp2), sl:num(sl),
    strategy, exitType
  }),[i.id,date,symbol,side,lotSize,entry,exit,tp1,tp2,sl,strategy,exitType]);

  const preview=useMemo(()=>{
    const v=computeDollarPnL(draft,accType);
    if(v==null||!isFinite(v)) return '-';
    return `${formatPnl(accType,v)} (${formatUnits(accType,v)})`;
  },[draft,accType]);

  return(
    <Modal title={i.id?'Edit Trade':'Add Trade'} onClose={onClose}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="text-sm text-slate-300">Symbol</label>
          <select value={symbol} onChange={(e)=>setSymbol(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2">{SYMBOLS.map(s=><option key={s}>{s}</option>)}</select></div>
        <div><label className="text-sm text-slate-300">Action</label>
          <div className="mt-1 flex gap-2">
            <button onClick={()=>setSide('BUY')}  className={`flex-1 px-3 py-2 rounded-lg border btn-buy ${side==='BUY'?'active':''}`}>BUY</button>
            <button onClick={()=>setSide('SELL')} className={`flex-1 px-3 py-2 rounded-lg border btn-sell ${side==='SELL'?'active':''}`}>SELL</button>
          </div></div>
        <div><label className="text-sm text-slate-300">Date</label>
          <input type="date" value={date} onChange={(e)=>setDate(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
        <div><label className="text-sm text-slate-300">Lot size</label>
          <input type="number" step="0.01" value={lotSize} onChange={(e)=>setLotSize(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
        <div><label className="text-sm text-slate-300">Entry price</label>
          <input type="number" step="0.0001" value={entry} onChange={(e)=>setEntry(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
        <div><label className="text-sm text-slate-300">Exit price</label>
          <input type="number" step="0.0001" value={exit} onChange={(e)=>setExit(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2" placeholder="Leave blank for OPEN"/></div>
        <div><label className="text-sm text-slate-300">TP 1</label>
          <input type="number" step="0.0001" value={tp1} onChange={(e)=>setTp1(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
        <div><label className="text-sm text-slate-300">TP 2</label>
          <input type="number" step="0.0001" value={tp2} onChange={(e)=>setTp2(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
        <div><label className="text-sm text-slate-300">Stop-Loss</label>
          <input type="number" step="0.0001" value={sl} onChange={(e)=>setSl(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
        <div><label className="text-sm text-slate-300">Strategy</label>
          <select value={strategy} onChange={(e)=>setStrategy(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2">{STRATEGIES.map(s=><option key={s}>{s}</option>)}</select></div>
        <div><label className="text-sm text-slate-300">Exit Type</label>
          <select value={exitType} onChange={(e)=>setExitType(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2">{EXIT_TYPES.map(s=><option key={s}>{s}</option>)}</select></div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-slate-300">P&L preview: <span className="font-semibold">{preview}</span></div>
        <div className="flex items-center gap-2">
          {i.id && <button onClick={()=>onDelete(i.id)} className="px-4 py-2 rounded-lg border border-red-600 text-red-400 hover:bg-red-900/20">Delete</button>}
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-600 hover:bg-slate-700">Cancel</button>
          <button onClick={()=>onSave(draft)} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500">Save</button>
        </div>
      </div>
    </Modal>
  );
}

/* ===== Calendar (compact + colored days) ===== */
function CalendarModal({ onClose, trades, accType, view,setView, month,setMonth, year,setYear, selectedDate,setSelectedDate }){
  const monthNames=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const dayNames=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const daysInMonth=(y,m)=>new Date(y,m+1,0).getDate();
  const firstDow=(y,m)=>new Date(y,m,1).getDay();

  const byDate=useMemo(()=>{
    const m={}; for(const t of trades){ (m[t.date]??=[]).push(t); } return m;
  },[trades]);

  const dayColor=(iso)=>{
    const arr=byDate[iso]||[]; if(!arr.length) return '';
    let sum=0, any=false;
    for(const t of arr){const v=computeDollarPnL(t,accType); if(v!=null && isFinite(v)){ sum+=v; any=true; }}
    if(!any) return '';
    return sum>0? 'border-green-600 bg-green-900/10' : sum<0? 'border-red-600 bg-red-900/10' : 'border-slate-700';
  };

  return(
    <Modal title="Calendar" onClose={onClose}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex gap-2">
          {['year','month','day'].map(v=>(
            <button key={v} onClick={()=>setView(v)} className={`px-3 py-1.5 rounded-lg border ${view===v?'bg-slate-700 border-slate-600':'border-slate-700'}`}>{v.toUpperCase()}</button>
          ))}
        </div>
        {view!=='day' && (
          <div className="flex items-center gap-2">
            <button onClick={()=> view==='month'
              ? (setMonth(m=>(m+11)%12), setYear(y=> y - (month===0?1:0)))
              : setYear(y=>y-1)} className="px-2 py-1 border border-slate-700 rounded-lg"><IconChevronL/></button>
            <div className="text-sm">{view==='month'?`${monthNames[month]} ${year}`:year}</div>
            <button onClick={()=> view==='month'
              ? (setMonth(m=>(m+1)%12), setYear(y=> y + (month===11?1:0)))
              : setYear(y=>y+1)} className="px-2 py-1 border border-slate-700 rounded-lg"><IconChevronR/></button>
          </div>
        )}
      </div>

      {view==='year' && (
        <div className="ng-year-grid">
          {monthNames.map((mn,i)=>(
            <div key={mn} className="ng-month-tile">
              <div className="ng-month-title">{mn}</div>
              <div className="text-slate-400 text-xs">
                Trades: {trades.filter(t=> (new Date(t.date)).getMonth()===i && (new Date(t.date)).getFullYear()===year).length}
              </div>
              <button onClick={()=>{setMonth(i); setView('month');}}
                className="mt-2 px-3 py-1 rounded-lg border border-slate-700 hover:bg-slate-800 text-xs">Open</button>
            </div>
          ))}
        </div>
      )}

      {view==='month' && (
        <div>
          <div className="ng-month-grid text-center text-[11px] text-slate-400 mb-1">{dayNames.map(d=><div key={d} className="py-1">{d}</div>)}</div>
          <div className="ng-month-grid">
            {Array.from({length:firstDow(year,month)}).map((_,i)=><div key={'e'+i} />)}
            {Array.from({length:daysInMonth(year,month)}).map((_,d)=>{
              const day=String(d+1).padStart(2,'0');
              const iso=`${year}-${String(month+1).padStart(2,'0')}-${day}`;
              const items=byDate[iso]||[];
              const colorCls=dayColor(iso);
              return(
                <button key={iso} onClick={()=>{setSelectedDate(iso); setView('day');}}
                        className={`text-left p-1.5 rounded-lg border ${colorCls || (items.length? 'border-blue-700/60 bg-blue-900/10':'border-slate-700 bg-slate-900/30')}`}>
                  <div className="text-[11px] text-slate-400">{d+1}</div>
                  {items.slice(0,2).map(it=><div key={it.id} className="truncate text-[11px]">{it.symbol} {it.side}</div>)}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {view==='day' && (
        <div>
          <div className="text-sm text-slate-300 mb-2">{selectedDate}</div>
          {(byDate[selectedDate]||[]).length===0 ? (
            <div className="text-slate-400 text-sm">No trades this day.</div>
          ) : (
            <div className="space-y-2">
              {(byDate[selectedDate]||[]).map(t=>(
                <div key={t.id} className="bg-slate-900/50 border border-slate-700 rounded-xl p-3 flex items-center justify-between">
                  <div className="text-sm"><span className="text-blue-300 font-medium">{t.symbol}</span> · {t.side} · Lot {t.lotSize}</div>
                  <div className="text-sm">{typeof t.entry==='number'?t.entry:''} → {typeof t.exit==='number'?t.exit:''}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

/* ===== Login view (quote separate + Google button + forgot password) ===== */
function LoginView({ onLogin, onSignup, onGoogle, onForgot }){
  const [mode,setMode]=useState('login');
  const [email,setEmail]=useState(''); const [password,setPassword]=useState('');
  const [showPw,setShowPw]=useState(false); const [name,setName]=useState('');
  const [confirm,setConfirm]=useState(''); const [err,setErr]=useState('');

  /* Render Google button (popup flow) */
  useEffect(()=>{
    if(!window.google || !window.NG_GOOGLE_CLIENT_ID) return;
    google.accounts.id.initialize({
      client_id: window.NG_GOOGLE_CLIENT_ID,
      callback: (resp)=>{
        try{
          const payload = JSON.parse(atob(resp.credential.split(".")[1]));
          const email = payload.email;
          const name  = payload.name || payload.given_name || "";
          if(email){
            const users=loadUsers();
            if(!users.find(u=>u.email.toLowerCase()===email.toLowerCase())){
              users.push({name,email,password:""}); saveUsers(users);
              saveState(email,{name,email,accType:ACC_TYPES[1],capital:0,depositDate:todayISO(),trades:[]});
            }
            setCurr(email); location.replace(location.origin+location.pathname);
          }
        }catch(e){ console.error(e); setErr("Google sign-in failed."); }
      },
      ux_mode:"popup"
    });
    const btn=document.getElementById("gsi-btn");
    if(btn){ google.accounts.id.renderButton(btn,{theme:"outline",size:"large",width:220}); }
  },[]);

  const submit=()=>{
    setErr('');
    if(mode==='login'){
      if(!email || !password) return setErr('Fill all fields.');
      onLogin(email,password,setErr);
    }else{
      if(!name || !email || !password || !confirm) return setErr('Fill all fields.');
      if(password!==confirm) return setErr('Passwords do not match.');
      onSignup(name,email,password,setErr);
    }
  };

  return(
    <div className="fixed inset-0 flex items-center justify-center bg-slate-950">
      <div className="ng-login-wrap">
        <div className="ng-login-quote">
          <div className="text-4xl font-extrabold leading-tight">Trade smart.<br/>Learn smarter.</div>
          <div className="mt-3 text-slate-300 max-w-[40ch]">“Discipline is choosing what you want most over what you want now.”</div>
        </div>
        <div className="ng-login-card">
          <div className="flex items-center gap-2 mb-3">
            <img src={LOGO} className="h-8 w-8" alt="logo"/>
            <div className="text-xl font-extrabold">Nitty Gritty</div>
            <span className="ng-pill">Trading Journal</span>
          </div>
          <div className="flex gap-2 mb-4">
            <button onClick={()=>setMode('login')}  className={`flex-1 px-3 py-2 rounded-lg border ${mode==='login' ? 'bg-slate-700 border-slate-600' : 'border-slate-700'}`}>Login</button>
            <button onClick={()=>setMode('signup')} className={`flex-1 px-3 py-2 rounded-lg border ${mode==='signup'? 'bg-slate-700 border-slate-600' : 'border-slate-700'}`}>Sign up</button>
          </div>

          {mode==='signup' && (
            <div className="mb-3">
              <label className="text-sm text-slate-300">Name</label>
              <input value={name} onChange={(e)=>setName(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/>
            </div>
          )}

          <div className="mb-3">
            <label className="text-sm text-slate-300">Email</label>
            <input value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/>
          </div>

          <div className="mb-2">
            <label className="text-sm text-slate-300">Password</label>
            <div className="mt-1 flex gap-2">
              <input type={showPw?'text':'password'} value={password} onChange={(e)=>setPassword(e.target.value)} className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/>
              <button onClick={()=>setShowPw(v=>!v)} className="px-3 py-2 rounded-lg border border-slate-700">{showPw?'Hide':'Show'}</button>
            </div>
            {mode==='login' && (
              <div className="mt-2 text-right">
                <button onClick={onForgot} className="text-sm text-sky-400 hover:underline">Forgot password?</button>
              </div>
            )}
          </div>

          {mode==='signup' && (
            <div className="mb-3">
              <label className="text-sm text-slate-300">Confirm Password</label>
              <input type={showPw?'text':'password'} value={confirm} onChange={(e)=>setConfirm(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/>
            </div>
          )}

          {err && <div className="text-red-400 text-sm mb-3">{err}</div>}

          <div className="flex items-center justify-between">
            <div id="gsi-btn"></div>
            <button onClick={submit} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500">Continue</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===== General & Detailed stats ===== */
function GeneralStats({ trades,accType,capital,depositDate }){
  const realized=trades.filter(t=>new Date(t.date)>=new Date(depositDate)&&t.exitType);
  const pnl=realized.map(t=>computeDollarPnL(t,accType)).filter(v=>v!=null&&isFinite(v));
  const total=pnl.reduce((a,b)=>a+b,0);
  const wins=pnl.filter(v=>v>0).length, losses=pnl.filter(v=>v<0).length;
  const open=trades.filter(t=>!t.exitType&&(t.exit==null)).length;
  const wr=(wins+losses)>0? Math.round((wins/(wins+losses))*100) : 0;
  return(
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <Stat label="Capital" value={accType==='Cent Account'? `${r2(capital*100).toFixed(2)} ¢` : fmt$(capital)} />
      <Stat label="Realized P&L" value={formatPnl(accType,total)} />
      <Stat label="Win Rate" value={`${wr}%`} />
      <Stat label="Open" value={open} />
    </div>
  );
}
function DetailedStats({ trades,accType }){
  const bySym=useMemo(()=>{
    const m={}; for(const t of trades){ const k=t.symbol||'N/A'; const v=computeDollarPnL(t,accType); const s=m[k]||{count:0,pnl:0}; s.count++; s.pnl+=(v&&isFinite(v))?v:0; m[k]=s;}
    return Object.entries(m).map(([sym,v])=>({sym,count:v.count,pnl:v.pnl}));
  },[trades,accType]);
  return(
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4">
      <div className="text-sm font-semibold mb-2">Detailed Statistics</div>
      <div className="overflow-auto">
        <table className="min-w-full text-sm ng-table">
          <thead><tr><Th>Symbol</Th><Th>Trades</Th><Th>Total P&L</Th><Th>P&L (Units)</Th></tr></thead>
          <tbody>
            {bySym.map(r=>(
              <tr key={r.sym} className="border-t border-slate-700">
                <Td>{r.sym}</Td><Td>{r.count}</Td><Td>{formatPnl(accType,r.pnl)}</Td><Td>{formatUnits(accType,r.pnl)}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ===== History ===== */
function Histories({ trades,accType,onEdit,onDelete, toggleSidebar }){
  return(
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-semibold">Trade History</div>
        <button onClick={toggleSidebar} className="px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-700 text-xs">Toggle Sidebar</button>
      </div>
      <div className="overflow-auto">
        <table className="min-w-full text-sm ng-table">
          <thead>
            <tr>
              <Th>Date</Th><Th>Symbol</Th><Th>Side</Th><Th>Lot</Th><Th>Entry</Th><Th>Exit</Th>
              <Th>TP1</Th><Th>TP2</Th><Th>SL</Th><Th>Exit Type</Th><Th>P&L</Th><Th>P&L (Units)</Th><Th>Status</Th><Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {trades.map(t=>{
              const v=computeDollarPnL(t,accType), closed=!!t.exitType;
              return(
                <tr key={t.id} className="border-t border-slate-700">
                  <Td>{t.date}</Td><Td>{t.symbol}</Td><Td>{t.side}</Td><Td>{t.lotSize}</Td>
                  <Td>{t.entry??''}</Td><Td>{t.exit??''}</Td>
                  <Td>{t.tp1??''}</Td><Td>{t.tp2??''}</Td><Td>{t.sl??''}</Td>
                  <Td>{t.exitType||''}</Td>
                  <Td className={v>0?'text-green-400':v<0?'text-red-400':''}>{v==null?'-':formatPnl(accType,v)}</Td>
                  <Td className={v>0?'text-green-400':v<0?'text-red-400':''}>{v==null?'-':formatUnits(accType,v)}</Td>
                  <Td>{closed?'CLOSED':'OPEN'}</Td>
                  <Td>
                    <div className="flex gap-2">
                      <button onClick={()=>onEdit(t)} className="px-2 py-1 rounded-lg border border-slate-700 hover:bg-slate-700"><IconEdit/></button>
                      <button onClick={()=>onDelete(t.id)} className="px-2 py-1 rounded-lg border border-red-700 text-red-300 hover:bg-red-900/20">✕</button>
                    </div>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ===== App Shell (with collapsible sidebar like before) ===== */
function AppShell({ children, onExport,onLogout, capitalPanel, nav, sidebarHidden,setSidebarHidden }){
  return(
    <div className={`ng-shell ${sidebarHidden?'sidebar-hidden':''}`}>
      <aside className="ng-sidebar w-72 shrink-0 space-y-4">
        <div className="ng-brand">
          <img src={LOGO} className="h-8 w-8" alt="logo"/>
          <div className="ng-name text-lg">Nitty Gritty</div>
          <span className="ng-pill">Trading Journal</span>
        </div>
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4">{capitalPanel}</div>
        <div className="space-y-2">{nav}</div>
        <div className="pt-2">
          <div className="flex justify-between">
            <button onClick={()=>setSidebarHidden(v=>!v)} className="px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-700 text-xs">Hide</button>
            <UserMenu onExport={onExport} onLogout={onLogout}/>
          </div>
        </div>
      </aside>
      <main className="flex-1">
        <div className="ng-topbar flex items-center justify-between px-4 py-2">
          <button onClick={()=>setSidebarHidden(v=>!v)} className="px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-xs">Toggle Sidebar</button>
          {/* Right slot kept minimal; user menu is in sidebar */}
        </div>
        <div className="p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}

/* ===== User menu ===== */
function UserMenu({ onExport,onLogout }){
  const [open,setOpen]=useState(false);
  return(
    <div className="relative">
      <button onClick={()=>setOpen(v=>!v)} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-700 hover:bg-slate-800"><IconUser/></button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-lg overflow-hidden">
          <button onClick={()=>{setOpen(false); onExport();}} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-700"><IconDownload/>Export CSV</button>
          <button onClick={()=>{setOpen(false); onLogout();}} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-700 text-red-300"><IconLogout/>Logout</button>
        </div>
      )}
    </div>
  );
}

/* ===== App state ===== */
function usePersistedState(email){
  const [state,setState]=useState(()=>{
    const s=loadState(email||getCurr());
    return s || { name:"", email:email||"", accType:ACC_TYPES[1], capital:0, depositDate:todayISO(), trades:[] };
  });
  useEffect(()=>{ if(state?.email) saveState(state.email,state); },[state]);
  return [state,setState];
}

/* ===== App ===== */
function App(){
  const [currentEmail,setCurrentEmail]=useState(getCurr());
  const [users,setUsers]=useState(loadUsers());
  const [state,setState]=usePersistedState(currentEmail);
  const [page,setPage]=useState('dashboard');
  const [showTrade,setShowTrade]=useState(false);
  const [editItem,setEditItem]=useState(null);
  const [showAcct,setShowAcct]=useState(false);
  const [showCal,setShowCal]=useState(false);
  const [calView,setCalView]=useState('month');
  const [calMonth,setCalMonth]=useState(new Date().getMonth());
  const [calYear,setCalYear]=useState(new Date().getFullYear());
  const [calSel,setCalSel]=useState(todayISO());
  const [sidebarHidden,setSidebarHidden]=useState(false);
  const [showForgot,setShowForgot]=useState(false);
  const [resetInfo,setResetInfo]=useState(null); // {email,token}

  /* Auto-open reset password if ?reset= token present */
  useEffect(()=>{
    const url=new URL(location.href); const token=url.searchParams.get("reset");
    if(!token) return;
    const tokens=loadTokens(); const rec=tokens[token];
    if(rec && rec.exp> Date.now()){
      setResetInfo({email:rec.email, token});
    }else{
      // expired/invalid -> clean
      url.searchParams.delete("reset"); history.replaceState(null,"",url.toString());
    }
  },[]);

  useEffect(()=>{
    if(state && (!state.name || !state.depositDate)) setShowAcct(true);
  },[state?.email]);

  const openTrades=state.trades.filter(t=>!t.exitType && (t.exit==null)).length;
  const realizedForCap=state.trades.filter(t=>new Date(t.date)>=new Date(state.depositDate)&&t.exitType)
    .map(t=>computeDollarPnL(t,state.accType)).filter(v=>v!=null&&isFinite(v)).reduce((a,b)=>a+b,0);
  const effectiveCapital=state.capital+realizedForCap;

  const onExport=()=>{
    const rows=state.trades.map(t=>{
      const d=computeDollarPnL(t,state.accType);
      return {...t, pnl_dollars:d==null?"":r2(d), pnl_units:d==null?"":(state.accType==="Cent Account"?r2(d*100):r2(d))};
    });
    const csv=toCSV(rows);
    const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a'); a.href=url; a.download='nitty_gritty_trades.csv'; a.click();
    URL.revokeObjectURL(url);
  };
  const onLogout=()=>{ setCurr(""); setCurrentEmail(""); };

  const login=(email,password,setErr)=>{
    const u=users.find(x=>x.email.toLowerCase()===email.toLowerCase());
    if(!u) return setErr('No such user. Please sign up.');
    if(u.password!==password) return setErr('Wrong password.');
    setCurr(u.email); setCurrentEmail(u.email); setErr('');
  };
  const signup=(name,email,password,setErr)=>{
    if(users.some(x=>x.email.toLowerCase()===email.toLowerCase())) return setErr('Email already registered.');
    const u={name,email,password}; const nu=[...users,u]; setUsers(nu); saveUsers(nu);
    saveState(email,{name,email,accType:ACC_TYPES[1],capital:0,depositDate:todayISO(),trades:[]});
    setCurr(email); setCurrentEmail(email);
  };

  const addOrUpdateTrade=(d)=>{
    const id=d.id || Math.random().toString(36).slice(2);
    const arr=state.trades.slice(); const i=arr.findIndex(t=>t.id===id);
    const rec={...d,id}; if(i>=0) arr[i]=rec; else arr.unshift(rec);
    setState({...state,trades:arr}); setShowTrade(false); setEditItem(null);
  };
  const deleteTrade=(id)=> setState({...state,trades:state.trades.filter(t=>t.id!==id)});

  if(!currentEmail){
    return (
      <>
        <LoginView
          onLogin={login}
          onSignup={signup}
          onGoogle={()=>{}}
          onForgot={()=>setShowForgot(true)}
        />
        {showForgot && <ForgotPasswordModal onClose={()=>setShowForgot(false)} />}
      </>
    );
  }

  const navBtn=(label,key,Icon)=>(
    <button onClick={()=>setPage(key)} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border ${page===key?'bg-slate-700 border-slate-600':'border-slate-700 hover:bg-slate-800'}`}>
      {Icon?<Icon/>:null}<span>{label}</span>
    </button>
  );

  const capitalPanel=(
    <div>
      <div className="text-sm text-slate-300">Account Type</div>
      <div className="font-semibold mb-3">{state.accType}</div>
      <div className="text-sm text-slate-300">Capital</div>
      <div className="text-2xl font-extrabold mb-1">{state.accType==='Cent Account'? `${r2(effectiveCapital*100).toFixed(2)} ¢` : fmt$(effectiveCapital)}</div>
      <div className="text-xs text-slate-400">Deposit: {state.depositDate}</div>
      <div className="mt-3 text-sm text-slate-300">Open trades</div>
      <div className="text-lg font-semibold">{openTrades}</div>
      <div className="pt-2"><button onClick={()=>setShowAcct(true)} className="w-full px-3 py-2 rounded-lg border border-slate-700">Account Setup</button></div>
      <div className="pt-2"><button onClick={()=>{setEditItem(null); setShowTrade(true);}} className="w-full px-3 py-2 rounded-lg border border-slate-700 flex items-center justify-center gap-2"><IconPlus/>Add trade</button></div>
    </div>
  );

  const nav=(
    <>
      {navBtn('Dashboard','dashboard',IconHome)}
      {navBtn('Histories','histories',null)}
      <button onClick={()=>{setShowCal(true); setCalView('month');}} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-700 hover:bg-slate-800"><IconCalendar/>Calendar</button>
      {navBtn('Settings','settings',IconSettings)}
    </>
  );

  return(
    <>
      <AppShell onExport={onExport} onLogout={onLogout} capitalPanel={capitalPanel} nav={nav}
                sidebarHidden={sidebarHidden} setSidebarHidden={setSidebarHidden}>
        {page==='dashboard' && (
          <div className="space-y-4">
            <div className="text-sm font-semibold">General statistics</div>
            <GeneralStats trades={state.trades} accType={state.accType} capital={state.capital} depositDate={state.depositDate}/>
            <DetailedStats trades={state.trades} accType={state.accType}/>
          </div>
        )}
        {page==='histories' && (
          <Histories trades={state.trades} accType={state.accType}
                     onEdit={(t)=>{setEditItem(t); setShowTrade(true);}}
                     onDelete={deleteTrade}
                     toggleSidebar={()=>setSidebarHidden(v=>!v)} />
        )}
        {page==='settings' && (
          <SettingsPanel name={state.name} setName={(v)=>setState({...state,name:v})}
                         accType={state.accType} setAccType={(v)=>setState({...state,accType:v})}
                         capital={state.capital} setCapital={(v)=>setState({...state,capital:v||0})}
                         depositDate={state.depositDate} setDepositDate={(v)=>setState({...state,depositDate:v})}
                         email={state.email}/>
        )}
      </AppShell>

      {showTrade && (
        <TradeModal initial={editItem} onClose={()=>{setShowTrade(false); setEditItem(null);}}
                    onSave={addOrUpdateTrade} onDelete={deleteTrade} accType={state.accType}/>
      )}
      {showAcct && (
        <AccountSetupModal name={state.name} setName={(v)=>setState({...state,name:v})}
                           accType={state.accType} setAccType={(v)=>setState({...state,accType:v})}
                           capital={state.capital} setCapital={(v)=>setState({...state,capital:v||0})}
                           depositDate={state.depositDate} setDepositDate={(v)=>setState({...state,depositDate:v})}
                           onClose={()=>setShowAcct(false)} email={state.email}/>
      )}
      {showCal && (
        <CalendarModal onClose={()=>setShowCal(false)} trades={state.trades} accType={state.accType}
                       view={calView} setView={setCalView}
                       month={calMonth} setMonth={setCalMonth}
                       year={calYear} setYear={setCalYear}
                       selectedDate={calSel} setSelectedDate={setCalSel}/>
      )}
      {resetInfo && (
        <ResetPasswordModal email={resetInfo.email} token={resetInfo.token} onClose={()=>{ setResetInfo(null); const u=new URL(location.href); u.searchParams.delete("reset"); history.replaceState(null,"",u.toString()); }}/>
      )}
    </>
  );
}

/* Mount */
ReactDOM.createRoot(document.getElementById("root")).render(<App />);
