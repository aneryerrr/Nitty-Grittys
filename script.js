const { useState, useMemo, useEffect, useRef } = React;

/* ------------ constants / helpers (unchanged look & feel) ------------ */
const LOGO_PUBLIC = "/logo-ng.png";
const LOGO_FALLBACK = "./logo-ng.png";

const DEFAULT_SYMBOLS = ["XAUUSD","US100","US30","EURUSD","BTCUSD","AUDCAD","USDCAD","USDJPY","GBPUSD"];
const DEFAULT_STRATEGIES = [
  "Trend Line Bounce",
  "2 Touch Point Trend Line Break",
  "3 / 3+ Touch Point Trend Line Break",
  "Trend Line Break & Re-test",
  "Trend Continuation"
];
const EXIT_TYPES = ["TP","SL","TP1_BE","TP1_SL","BE","Trade In Progress"];
const ACC_TYPES = ["Cent Account","Dollar Account"];
const ORANGE_CLASS = "text-amber-400";
const STRAT_COLORS = { none:"", green:"text-green-400", red:"text-red-400", mustard:"text-amber-400" };

const r2 = n => Math.round(n*100)/100;
const fmt$ = n => "$" + (isFinite(n)?r2(n):0).toFixed(2);
const todayISO = () => {
  const d = new Date(); const tz = d.getTimezoneOffset();
  return new Date(d.getTime()-tz*60000).toISOString().slice(0,10);
};
const toISO = (v) => {
  if(!v) return todayISO();
  const s = String(v).trim();
  if(/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const d = new Date(s);
  if(!isNaN(d)) {
    const t = new Date(d.getTime()-d.getTimezoneOffset()*60000);
    return t.toISOString().slice(0,10);
  }
  return todayISO();
};

/* ------------------ storage ------------------ */
const USERS_KEY="ng_users_v2";
const CURR_KEY="ng_current_user_v1";
const loadUsers=()=>{ try{return JSON.parse(localStorage.getItem(USERS_KEY)||"[]")}catch{return[]} };
const saveUsers=u=>{ try{localStorage.setItem(USERS_KEY,JSON.stringify(u))}catch{} };
const saveCurrent=e=>{ try{localStorage.setItem(CURR_KEY,e)}catch{} };
const getCurrent=()=>{ try{return localStorage.getItem(CURR_KEY)||""}catch{return""} };
const loadState=e=>{ try{return JSON.parse(localStorage.getItem("ng_state_"+e)||"null")}catch{return null} };
const saveState=(e,s)=>{ try{localStorage.setItem("ng_state_"+e,JSON.stringify(s))}catch{} };

/* ------------------ P&L ------------------ */
function perLotValueForMove(symbol,delta,accType){
  const abs=Math.abs(delta); const std=accType==="Dollar Account";
  const mult=(usd)=>std?usd:usd/100;
  switch(symbol){
    case "US30": case "US100": return abs * mult(10);
    case "XAUUSD": return abs * mult(100);
    case "BTCUSD": return abs * mult(1);
    case "EURUSD": case "GBPUSD": { const pips=abs/0.0001; return pips*mult(10); }
    case "AUDCAD": case "USDCAD": { const pips=abs/0.0001; return pips*mult(7.236); }
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
  if(typeof t.manualPnL === "number" && isFinite(t.manualPnL)) return t.manualPnL;
  if(t.exitType==="Trade In Progress") return null;
  const has=v=>typeof v==="number" && isFinite(v);
  const {entry,exit,tp1,tp2,sl,lotSize:lot}=t;
  if(has(exit) && (!t.exitType || t.exitType==="TP")) return legPnL(t.symbol,t.side,entry,exit,lot,accType);
  switch(t.exitType){
    case "SL": if(!has(sl)) return null; return legPnL(t.symbol,t.side,entry,sl,lot,accType);
    case "TP":
      if(has(tp2)) return legPnL(t.symbol,t.side,entry,tp2,lot,accType);
      if(has(tp1)) return legPnL(t.symbol,t.side,entry,tp1,lot,accType);
      return null;
    case "TP1_BE":
      if(!has(tp1)) return null;
      return (legPnL(t.symbol,t.side,entry,tp1,lot,accType)+0)/2;
    case "TP1_SL":
      if(!has(tp1)||!has(sl)) return null;
      return (legPnL(t.symbol,t.side,entry,tp1,lot,accType)+legPnL(t.symbol,t.side,entry,sl,lot,accType))/2;
    case "BE": return 0;
    default: return null;
  }
}
const formatPnlDisplay=(accType,v)=>accType==="Cent Account"?(r2(v*100)).toFixed(2)+" ¢":fmt$(v);
const formatUnits=(accType,v)=>accType==="Dollar Account"?r2(v).toFixed(2):r2(v*100).toFixed(2);

/* ------------------ CSV/XLS helpers ------------------ */
function toCSV(rows,accType){
  const H=["Date","Symbol","Side","Lot Size","Entry","Exit","TP1","TP2","SL","Strategy","Exit Type","P&L","P&L (Units)"];
  const esc=s=>{ if(s===null||s===undefined) return ""; const v=String(s); return /[",\n]/.test(v)?`"${v.replace(/"/g,'""')}"`:v; };
  const out=[H.join(",")];
  for(const t of rows){
    const v=computeDollarPnL(t,accType); const units=v===null?"":formatUnits(accType,v);
    const dollars=v===null?"":r2(v);
    const row=[t.date,t.symbol,t.side,t.lotSize,(t.entry??""),(t.exit??""),(t.tp1??""),(t.tp2??""),(t.sl??""),t.strategy,(t.exitType||""),dollars,units];
    out.push(row.map(esc).join(","));
  }
  return "﻿"+out.join("\n");
}
function parseCSVRaw(text){
  const lines=[]; let inQ=false, cur="";
  const push=()=>{lines[lines.length-1].push(cur); cur="";};
  const open=()=>{lines.push([])};
  open();
  for(const ch of text.replace(/\r/g,"")){
    if(ch==='"'){ inQ=!inQ; continue; }
    if(ch===',' && !inQ){ push(); continue; }
    if(ch==='\n' && !inQ){ push(); open(); continue; }
    cur+=ch;
  }
  push();
  if(lines.length && lines[lines.length-1].length===1 && lines[lines.length-1][0]==="") lines.pop();
  return lines.filter(r=>r.some(c=>String(c).trim()!==""));
}
function tableFromArray(rows){
  if(!rows.length) return [];
  const header=rows[0].map(h=>String(h).trim().toLowerCase());
  const idx=(...names)=>{for(const n of names){const i=header.indexOf(n); if(i>-1) return i} return -1};
  const iDate=idx("date");
  const iSymbol=idx("symbol","pair","instrument");
  const iSide=idx("side","action");
  const iLot=idx("lot size","lots","quantity");
  const iEntry=idx("entry","entry price","entryprice");
  const iExit=idx("exit","exit price","exitprice");
  const iTp1=idx("tp1","tp 1","take profit 1");
  const iTp2=idx("tp2","tp 2","take profit 2");
  const iSl=idx("sl","stop","stop loss","stop-loss");
  const iStrategy=idx("strategy");
  const iExitType=idx("exit type","exittype");
  const iPnL=idx("p&l","pnl","profit");
  const iStatus=idx("status");

  const data=[];
  for(let r=1;r<rows.length;r++){
    const row=rows[r]; if(!row || !row.length) continue;
    const get=i=> i>-1 ? row[i] : "";
    const num=v=>{const n=parseFloat(String(v).replace(/[^0-9.\-]/g,"")); return isNaN(n)?undefined:n};
    const sideV=String(get(iSide)||"BUY").toUpperCase().includes("SEL")?"SELL":"BUY";
    const symbol=String(get(iSymbol)||"").trim().toUpperCase() || "XAUUSD";
    const lot=num(get(iLot)) ?? 0.01;
    const entry=num(get(iEntry)); const exit=num(get(iExit));
    const tp1=num(get(iTp1)); const tp2=num(get(iTp2)); const sl=num(get(iSl));
    const strategy=String(get(iStrategy)||DEFAULT_STRATEGIES[0]);
    const exitTypeRaw=String(get(iExitType)||"").toUpperCase();
    const statusRaw=String(get(iStatus)||"").toUpperCase();
    const exitType = exitTypeRaw || (statusRaw==="OPEN" || (!exit && !exitTypeRaw) ? "Trade In Progress" : "TP");
    const manualPnL = (get(iPnL)!=="" && get(iPnL)!=null) ? num(get(iPnL)) : undefined;
    data.push({
      id: Math.random().toString(36).slice(2),
      date: toISO(get(iDate)||todayISO()),
      symbol, side: sideV, lotSize: lot,
      entry, exit, tp1, tp2, sl,
      strategy, exitType,
      ...(typeof manualPnL==="number" && isFinite(manualPnL) ? {manualPnL} : {})
    });
  }
  return data;
}
function importFromCSVText(text){ return tableFromArray(parseCSVRaw(text)); }
async function importFromExcel(file){
  const ab = await file.arrayBuffer();
  const wb = XLSX.read(ab, {type:"array"});
  const ws = wb.Sheets[wb.SheetNames[0]];
  const csv = XLSX.utils.sheet_to_csv(ws);
  return importFromCSVText(csv);
}

/* ------------------ icons (kept as before) ------------------ */
const iconCls="h-5 w-5";
const IconUser=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Z"/><path d="M4 20a8 8 0  0 1 16 0Z"/></svg>);
const IconLogout=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M9 21h4a4 4 0 0 0 4-4V7a4 4 0 0 0-4-4H9"/><path d="M16 12H3"/><path d="M7 8l-4 4 4 4"/></svg>);
const IconDownload=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M12 3v10"/><path d="M8 11l4 4 4-4"/><path d="M5 21h14v-4H5Z"/></svg>);
const IconUpload=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M12 21V11"/><path d="M8 13l4-4 4 4"/><path d="M5 21h14v-4H5Z"/></svg>); /* same import icon */
const IconSettings=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1 .6 1.65 1.65 0 0 0-.4 1V22a2 2 0 1 1-4 0v-.1a1.65 1.65 0 0 0-.4-1 1.65 1.65 0 0 0-1-.6 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-.6-1 1.65 1.65 0 0 0-1-.4H2a2 2 0 1 1 0-4h.1a1.65 1.65 0 0 0 1-.4 1.65 1.65 0 0 0 .6-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06A2 2 0 1 1 6.24 2.9l.06.06A1.65 1.65 0 0 0 8 4.6a1.65 1.65 0 0 0 1-.6 1.65 1.65 0 0 0 .4-1V2a2 2 0 1 1 4 0v.1c0 .38.14.74.4 1 .26.26.62.4 1 .4.62 0 1.22-.25 1.64-.68l.06-.06A2 2 0 1 1 21.1 6.24l-.06.06c-.26.26-.4.62-.4 1s.14.74.4 1c.26.26.62.4 1 .4H22a2 2 0 1 1 0 4h-.1a1.65 1.65 0 0 0-1 .4 1.65 1.65 0 0 0-.6 1Z"/></svg>);
const IconHome=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9v12h14V9"/></svg>);
const IconHistory=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M12 8v5l3 3"/><path d="M12 3a9 9 0 1 0 9 9"/><path d="M21 3v6h-6"/></svg>);
const IconGrip=(p)=>(<svg viewBox="0 0 24 24" fill="currentColor" className={iconCls} {...p}><circle cx="6" cy="7" r="1"/><circle cx="12" cy="7" r="1"/><circle cx="18" cy="7" r="1"/><circle cx="6" cy="13" r="1"/><circle cx="12" cy="13" r="1"/><circle cx="18" cy="13" r="1"/></svg>);
const IconPlus=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M12 5v14M5 12h14"/></svg>);
const IconNote=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className={iconCls} {...p}><path d="M3 7a2 2 0 0 1 2-2h8l6 6v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><path d="M13 3v6h6"/></svg>);

/* ------------------ table helpers ------------------ */
const Th=({children,className,...rest})=>(<th {...rest} className={(className?className+" ":"")+"px-4 py-3 text-left font-semibold text-slate-300"}>{children}</th>);
const Td=({children,className,...rest})=>(<td {...rest} className={(className?className+" ":"")+"px-4 py-3 align-top"}>{children}</td>);
const Tag=({children,className})=>(<span className={`tag ${className||"border-slate-600 text-slate-300"}`}>{children}</span>);
const Stat=({label,value})=>(
  <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-3">
    <div className="text-slate-400 text-xs">{label}</div>
    <div className="text-2xl font-bold mt-1">{value}</div>
  </div>
);

/* ------------------ header/shell ------------------ */
const UserMenu=({onExport,onImport,onLogout})=>{
  const [open,setOpen]=useState(false);
  return(
    <div className="relative">
      <button onClick={()=>setOpen(v=>!v)} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-700 hover:bg-slate-800"><IconUser/></button>
      {open&&(
        <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-lg overflow-hidden">
          <button onClick={()=>{setOpen(false);onExport()}} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-700"><IconDownload/>Export CSV</button>
          <button onClick={()=>{setOpen(false);onImport()}} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-700"><IconUpload/>Import CSV/XLS</button>
          <button onClick={()=>{setOpen(false);onLogout()}} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-700 text-red-300"><IconLogout/>Logout</button>
        </div>
      )}
    </div>
  );
};
const Header=({logoSrc,onToggleSidebar,onExport,onImport,onLogout})=>(
  <div className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/70 backdrop-blur">
    <div className="flex items-center gap-3">
      <button onClick={onToggleSidebar} className="px-3 py-2 rounded-lg border border-slate-700 hover:bg-slate-800">☰</button>
      <div className="flex items-center gap-3">
        <img src={logoSrc} onError={e=>{e.currentTarget.src=LOGO_FALLBACK}} className="h-7 w-7"/>
        <div className="font-bold">Nitty Gritty</div>
        <span className="bg-blue-900 text-xs px-2 py-0.5 rounded-md">Trading Journal</span>
      </div>
    </div>
    <UserMenu onExport={onExport} onImport={onImport} onLogout={onLogout}/>
  </div>
);
const AppShell=({children,capitalPanel,nav,logoSrc,onToggleSidebar,onExport,onImport,onLogout,sidebarCollapsed})=>(
  <div className="min-h-screen">
    <Header logoSrc={logoSrc} onToggleSidebar={onToggleSidebar} onExport={onExport} onImport={onImport} onLogout={onLogout}/>
    <div className="flex">
      {!sidebarCollapsed&&(
        <div className="w-72 shrink-0 border-r border-slate-800 min-h-[calc(100vh-56px)] p-4 space-y-4">
          <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4">{capitalPanel}</div>
          <div className="space-y-2">{nav}</div>
        </div>
      )}
      <div className="flex-1 p-4 md:p-6">{children}</div>
    </div>
  </div>
);

/* ------------------ login (only page that is dark-blue) ------------------ */
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
      <div className="hidden md:flex login-hero items-center justify-center">
        <div className="max-w-sm text-center px-6">
          <div className="text-3xl font-semibold text-slate-100">Trade smart. Log smarter.</div>
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
          {mode==="signup"&&(<div className="mb-3"><label className="text-sm text-slate-300">Name</label><input value={name} onChange={e=>setName(e.target.value)} className="w-full mt-1 input"/></div>)}
          <div className="mb-3"><label className="text-sm text-slate-300">Email</label><input value={email} onChange={e=>setEmail(e.target.value)} className="w-full mt-1 input"/></div>
          <div className="mb-2">
            <label className="text-sm text-slate-300">Password</label>
            <div className="mt-1 flex gap-2">
              <input type={showPw?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} className="flex-1 input"/>
              <button onClick={()=>setShowPw(v=>!v)} className="btn">{showPw?"Hide":"Show"}</button>
            </div>
          </div>
          <div className="text-right text-sm mb-4"><button onClick={()=>resetStart(email)} className="text-blue-400 hover:underline">Forgot password?</button></div>
          {mode==="signup"&&(<div className="mb-4"><label className="text-sm text-slate-300">Confirm Password</label><input type={showPw?"text":"password"} value={confirm} onChange={e=>setConfirm(e.target.value)} className="w-full mt-1 input"/></div>)}
          {err&&<div className="text-red-400 text-sm mb-3">{err}</div>}
          <div className="flex items-center justify-between">
            <div id="googleDiv" ref={googleDiv}></div>
            <button onClick={submit} className="btn btn-primary">Continue</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------ dashboard widgets (unchanged layout) ------------------ */
function GeneralStats({trades,accType,capital,depositDate}){
  const realized=trades.filter(t=>new Date(t.date)>=new Date(depositDate)&&t.exitType&&t.exitType!=="Trade In Progress");
  const pnl=realized.map(t=>computeDollarPnL(t,accType)).filter(v=>v!==null&&isFinite(v));
  const total=pnl.reduce((a,b)=>a+b,0);
  const wins=pnl.filter(v=>v>0).length; const losses=pnl.filter(v=>v<0).length;
  const open=trades.filter(t=>!t.exitType||t.exitType==="Trade In Progress").length;
  const wr=(wins+losses)>0?Math.round((wins/(wins+losses))*100):0;
  return(<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
    <Stat label="Capital" value={accType==='Cent Account'?`${r2(capital*100).toFixed(2)} ¢`:fmt$(capital)}/>
    <Stat label="Realized P&L" value={formatPnlDisplay(accType,total)}/>
    <Stat label="Win Rate" value={`${wr}%`}/>
    <Stat label="Open" value={open}/>
  </div>);
}
function BestStrategy({trades,accType,colors}){
  const stats=useMemo(()=>{
    const map={};
    for(const t of trades){
      if(!(t.exitType && t.exitType!=="Trade In Progress")) continue;
      const v=computeDollarPnL(t,accType); if(v===null) continue;
      const s=t.strategy||"N/A"; map[s]=map[s]||{count:0,wins:0};
      map[s].count++; if(v>0) map[s].wins++;
    }
    return Object.entries(map).map(([name,st])=>({name,count:st.count,wr:st.count?Math.round(100*st.wins/st.count):0}));
  },[trades,accType]);

  const eligible=stats.filter(s=>s.count>=3).sort((a,b)=>b.wr-a.wr);
  if(!eligible.length) return (<div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4">Best strategy will appear after at least 3 trades per strategy.</div>);
  const best=eligible[0]; const colorClass=STRAT_COLORS[colors?.[best.name]||"none"]||"";
  return(
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4">
      <div className="text-sm font-semibold mb-2">Best Strategy</div>
      <div className={`text-3xl font-bold ${colorClass}`}>{best.name}</div>
      <div className="text-slate-300 mt-1">{best.wr}% win rate · {best.count} trades</div>
    </div>
  );
}
function DetailedStats({trades,accType}){
  const rows=useMemo(()=>{const m={};for(const t of trades){const k=t.symbol||"N/A";const v=computeDollarPnL(t,accType);const s=m[k]||{count:0,pnl:0};s.count+=1;s.pnl+=(v&&isFinite(v))?v:0;m[k]=s}return Object.entries(m).map(([sym,v])=>({sym,count:v.count,pnl:v.pnl}))},[trades,accType]);
  return(
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4">
      <div className="text-sm font-semibold mb-2">Detailed Statistics</div>
      <div className="overflow-auto"><table className="min-w-full text-sm table"><thead><tr><Th>Symbol</Th><Th>Trades</Th><Th>Total P&L</Th><Th>P&L (Units)</Th></tr></thead>
        <tbody>{rows.map(r=>(
          <tr key={r.sym} className="border-t border-slate-700">
            <Td>{r.sym}</Td><Td>{r.count}</Td><Td>{formatPnlDisplay(accType,r.pnl)}</Td><Td>{formatUnits(accType,r.pnl)}</Td>
          </tr>))}</tbody></table></div>
    </div>
  );
}

/* ------------------ histories (BE = mustard) ------------------ */
function Histories({trades,accType,onEdit,onDelete,strategyColors}){
  return(
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-2"><div className="text-sm font-semibold">Trade History</div></div>
      <div className="overflow-auto"><table className="min-w-full text-sm table">
        <thead><tr><Th>Date</Th><Th>Symbol</Th><Th>Side</Th><Th>Lot size</Th><Th>Entry</Th><Th>Exit</Th><Th>TP1</Th><Th>TP2</Th><Th>SL</Th><Th>Strategy</Th><Th>Exit Type</Th><Th>P&L</Th><Th>P&L (Units)</Th><Th>Status</Th><Th>Actions</Th></tr></thead>
        <tbody>{trades.map(t=>{
          const v=computeDollarPnL(t,accType);
          const closed=t.exitType && t.exitType!=="Trade In Progress";
          const pnlClass = v===0 ? ORANGE_CLASS : v>0 ? 'text-green-400' : v<0 ? 'text-red-400' : '';
          const stratClass = STRAT_COLORS[strategyColors?.[t.strategy] || "none"] || "";
          return(
            <tr key={t.id} className="border-top border-slate-700">
              <Td>{t.date}</Td><Td>{t.symbol}</Td><Td>{t.side}</Td><Td>{t.lotSize}</Td>
              <Td>{typeof t.entry==='number'?t.entry:''}</Td><Td>{typeof t.exit==='number'?t.exit:''}</Td>
              <Td>{typeof t.tp1==='number'?t.tp1:''}</Td><Td>{typeof t.tp2==='number'?t.tp2:''}</Td><Td>{typeof t.sl==='number'?t.sl:''}</Td>
              <Td><span className={stratClass}>{t.strategy}</span></Td>
              <Td>{t.exitType||""}</Td>
              <Td className={pnlClass}>{v===null?'-':formatPnlDisplay(accType,v)}</Td>
              <Td className={pnlClass}>{v===null?'-':formatUnits(accType,v)}</Td>
              <Td>{closed?'CLOSED':'OPEN'}</Td>
              <Td><div className="flex gap-2">
                <button onClick={()=>onEdit(t)} className="px-2 py-1 rounded-lg border border-slate-700 hover:bg-slate-700">✎</button>
                <button onClick={()=>onDelete(t.id)} className="px-2 py-1 rounded-lg border border-red-700 text-red-300 hover:bg-red-900/20">✕</button>
              </div></Td>
            </tr>
          );
        })}</tbody></table></div>
    </div>
  );
}

/* ------------------ trade modal (Lot size where it was, under its title) ------------------ */
function TradeModal({initial,onClose,onSave,onDelete,accType,symbols,strategies}){
  const i=initial||{};
  const [symbol,setSymbol]=useState(i.symbol||symbols[0]||"XAUUSD");
  const [side,setSide]=useState(i.side||"BUY");
  const [date,setDate]=useState(i.date||todayISO());
  const [lotSize,setLotSize]=useState(i.lotSize??0.01);  // under its own title
  const [entry,setEntry]=useState(i.entry??"");
  const [exit,setExit]=useState(i.exit??"");
  const [tp1,setTp1]=useState(i.tp1??"");
  const [tp2,setTp2]=useState(i.tp2??"");
  const [sl,setSl]=useState(i.sl??"");
  const [strategy,setStrategy]=useState(i.strategy||strategies[0]||DEFAULT_STRATEGIES[0]);
  const [exitType,setExitType]=useState(i.exitType||"TP");
  const [manualPnL,setManualPnL]=useState((typeof i.manualPnL==="number" && isFinite(i.manualPnL)) ? i.manualPnL : "");

  const num=v=>(v===""||v===undefined||v===null)?undefined:parseFloat(v);
  const draft=useMemo(()=>({
    id:i.id, date, symbol, side, lotSize:parseFloat(lotSize||0),
    entry:num(entry), exit:num(exit), tp1:num(tp1), tp2:num(tp2), sl:num(sl),
    strategy, exitType, ...(manualPnL!==""?{manualPnL:parseFloat(manualPnL)}:{})
  }),[i.id,date,symbol,side,lotSize,entry,exit,tp1,tp2,sl,strategy,exitType,manualPnL]);

  const preview=useMemo(()=>{
    const v=computeDollarPnL(draft,accType);
    if(v===null||!isFinite(v)) return "-";
    return `${formatPnlDisplay(accType,v)} (${formatUnits(accType,v)})`;
  },[draft,accType]);

  return(
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-3">
      <div className="relative w-[95vw] max-w-4xl max-h-[80vh] overflow-auto bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-slate-800/95 backdrop-blur">
          <div className="font-semibold">{i.id?"Edit Trade":"Add Trade"}</div>
          <button onClick={onClose} className="px-3 py-1.5 rounded-lg border border-slate-600 hover:bg-slate-700">✕</button>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-3">
            <div><label className="text-sm text-slate-300">Lot size</label><input type="number" step="0.01" value={lotSize} onChange={e=>setLotSize(e.target.value)} className="w-full mt-1 input"/></div>
            <div><label className="text-sm text-slate-300">Date</label><input type="date" value={date} onChange={e=>setDate(e.target.value)} className="w-full mt-1 input"/></div>
            <div><label className="text-sm text-slate-300">Symbol</label><select value={symbol} onChange={e=>setSymbol(e.target.value)} className="w-full mt-1 select">{symbols.map(s=><option key={s}>{s}</option>)}</select></div>
            <div><label className="text-sm text-slate-300">Action</label><div className="mt-1 grid grid-cols-2 gap-2">{["BUY","SELL"].map(s=>(<button key={s} onClick={()=>setSide(s)} className={`px-2 py-2 rounded-lg border ${side===s ? (s==="BUY" ? "bg-green-600 border-green-500" : "bg-red-600 border-red-500") : "border-slate-700"}`}>{s}</button>))}</div></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            <div><label className="text-sm text-slate-300">Entry price</label><input type="number" step="0.0001" value={entry} onChange={e=>setEntry(e.target.value)} className="w-full mt-1 input"/></div>
            <div><label className="text-sm text-slate-300">Exit Price</label><input type="number" step="0.0001" value={exit} onChange={e=>setExit(e.target.value)} className="w-full mt-1 input" placeholder="Leave blank for OPEN"/></div>
            <div><label className="text-sm text-slate-300">TP 1</label><input type="number" step="0.0001" value={tp1} onChange={e=>setTp1(e.target.value)} className="w-full mt-1 input"/></div>
            <div><label className="text-sm text-slate-300">TP 2</label><input type="number" step="0.0001" value={tp2} onChange={e=>setTp2(e.target.value)} className="w-full mt-1 input"/></div>
            <div><label className="text-sm text-slate-300">Stop-Loss</label><input type="number" step="0.0001" value={sl} onChange={e=>setSl(e.target.value)} className="w-full mt-1 input"/></div>
            <div><label className="text-sm text-slate-300">Strategy</label><select value={strategy} onChange={e=>setStrategy(e.target.value)} className="w-full mt-1 select">{strategies.map(s=><option key={s}>{s}</option>)}</select></div>
            <div><label className="text-sm text-slate-300">Exit Type</label><select value={exitType} onChange={e=>setExitType(e.target.value)} className="w-full mt-1 select">{EXIT_TYPES.map(s=><option key={s}>{s}</option>)}</select></div>
            <div><label className="text-sm text-slate-300">P&L override (optional)</label><input type="number" step="0.01" value={manualPnL} onChange={e=>setManualPnL(e.target.value)} className="w-full mt-1 input" placeholder="Leave blank to auto-calc"/></div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-slate-300">P&L preview: <span className="font-semibold">{preview}</span></div>
            <div className="flex items-center gap-2">
              {i.id&&(<button onClick={()=>onDelete(i.id)} className="px-4 py-2 rounded-lg border border-red-600 text-red-400 hover:bg-red-900/20">Delete</button>)}
              <button onClick={onClose} className="px-4 py-2 rounded-lg btn">Cancel</button>
              <button onClick={()=>onSave(draft)} className="px-4 py-2 rounded-lg btn btn-primary">Save</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------ notes (simple checklist, list view) ------------------ */
function NoteComposer({date,setDate,html,setHtml,refTradeId,setRefTradeId,tradesForDate,onClose,onSave}){
  const boxRef=useRef(null);
  useEffect(()=>{ if(boxRef.current) boxRef.current.innerHTML = html || "" },[]);
  const exec=(cmd,val=null)=>document.execCommand(cmd,false,val);
  const addChecklist=()=>{
    if(!boxRef.current) return;
    const line=document.createElement("div");
    line.innerHTML=`<label style="display:flex;gap:.5rem;align-items:center;margin:.25rem 0;"><input type="checkbox"><span contenteditable="true">Checklist item</span></label>`;
    boxRef.current.appendChild(line);
  };
  const save=()=>{ const content=boxRef.current?boxRef.current.innerHTML:""; onSave({date,html:content,refTradeId}); };
  return(
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-3">
      <div className="relative w-[95vw] max-w-3xl max-h-[80vh] overflow-auto bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-slate-800/95">
          <div className="font-semibold">New Note</div>
          <button onClick={onClose} className="px-3 py-1.5 rounded-lg border border-slate-600 hover:bg-slate-700">✕</button>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <div>
              <label className="text-sm text-slate-300">Date</label>
              <input type="date" value={date} onChange={e=>{setDate(e.target.value); setRefTradeId("");}} className="w-full mt-1 input"/>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm text-slate-300">Reference Trade (same date)</label>
              <select value={refTradeId} onChange={e=>setRefTradeId(e.target.value)} className="w-full mt-1 select">
                <option value="">None</option>
                {tradesForDate.map(t=>(<option key={t.id} value={t.id}>{`${t.symbol} · ${(t.exitType && t.exitType!=="Trade In Progress")?"CLOSED":"OPEN"} · ${t.strategy}`}</option>))}
              </select>
            </div>
          </div>

          <div className="flex gap-2 mb-2">
            <button className="btn" onClick={()=>exec("bold")}>B</button>
            <button className="btn" onClick={()=>exec("italic")}><i>I</i></button>
            <button className="btn" onClick={()=>exec("underline")}><u>U</u></button>
            <button className="btn" onClick={addChecklist}>Checklist</button>
          </div>

          <div ref={boxRef} contentEditable className="note-editor"></div>

          <div className="mt-4 text-right">
            <button onClick={onClose} className="px-4 py-2 rounded-lg btn mr-2">Discard</button>
            <button onClick={save} className="px-4 py-2 rounded-lg btn btn-primary">Save Note</button>
          </div>
        </div>
      </div>
    </div>
  );
}
function NotesTab({notes,setNotes,trades}){
  const [composing,setComposing]=useState(false);
  const [date,setDate]=useState(todayISO());
  const [html,setHtml]=useState("");
  const [refTradeId,setRefTradeId]=useState("");
  const tradesForDate=useMemo(()=>trades.filter(t=>t.date===date),[trades,date]);

  const saveNote=({date,html,refTradeId})=>{
    const id=Math.random().toString(36).slice(2);
    setNotes([{id,date,html,refTradeId},...notes]);
    setComposing(false); setHtml(""); setRefTradeId("");
  };
  const editNote=(n)=>{ setDate(n.date); setHtml(n.html); setRefTradeId(n.refTradeId||""); setComposing(true); setNotes(notes.filter(x=>x.id!==n.id)); };

  return(
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold flex items-center gap-2"><IconNote/> Notes</div>
        <button onClick={()=>{setDate(todayISO());setHtml("");setRefTradeId("");setComposing(true)}} className="px-3 py-2 rounded-lg border border-slate-700"><IconPlus/> New Note</button>
      </div>

      {composing && <NoteComposer date={date} setDate={setDate} html={html} setHtml={setHtml} refTradeId={refTradeId} setRefTradeId={setRefTradeId} tradesForDate={tradesForDate} onClose={()=>setComposing(false)} onSave={saveNote}/>}

      <ul className="space-y-2">
        {notes.length===0 && <li className="text-slate-400 text-sm">No notes yet.</li>}
        {notes.map(n=>{
          const ref = trades.find(t=>t.id===n.refTradeId);
          const pnl = ref ? computeDollarPnL(ref,"Dollar Account") : null;
          return (
            <li key={n.id} className="note-row">
              <div className="flex items-center justify-between">
                <div className="meta">{n.date}{ref && <> · <span className="text-sky-300">{ref.symbol}</span> · <span className={pnl===0?ORANGE_CLASS: pnl>0?'text-green-400':'text-red-400'}>{pnl===0?"BE":formatUnits("Dollar Account",pnl)}</span></>}</div>
                <div className="actions">
                  <button onClick={()=>editNote(n)} className="text-xs">Edit</button>
                </div>
              </div>
              <div className="text-sm leading-6 mt-1" dangerouslySetInnerHTML={{__html:n.html}} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ------------------ customize journal (smaller editor chips) ------------------ */
function EditableList({items,setItems,placeholder}){
  const [val,setVal]=useState("");
  const add=()=>{const v=(val||"").trim(); if(!v) return; if(items.includes(v)) return; setItems([...items,v]); setVal("")};
  const remove=i=>setItems(items.filter((_,idx)=>idx!==i));
  return(
    <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-3">
      <div className="flex gap-2 mb-3">
        <input value={val} onChange={e=>setVal(e.target.value)} placeholder={placeholder} className="flex-1 input"/>
        <button onClick={add} className="btn">Add</button>
      </div>
      <div className="flex flex-wrap gap-2">{items.map((s,i)=>(
        <span key={s+i} className="px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs flex items-center gap-2">{s}
          <button onClick={()=>remove(i)} className="text-red-300 border border-red-700 rounded px-1">x</button>
        </span>
      ))}</div>
    </div>
  );
}
function EditableStrategyList({items,setItems,colors,onColorChange}){
  const [val,setVal]=useState("");
  const add=()=>{const v=(val||"").trim(); if(!v) return; if(items.includes(v)) return; setItems([...items,v]); setVal("")};
  const remove=i=>setItems(items.filter((_,idx)=>idx!==i));
  const ColorSel=({name})=>(
    <select value={colors?.[name]||"none"} onChange={e=>onColorChange(name,e.target.value)} className="select text-xs">
      <option value="none">Default</option><option value="green">Green</option><option value="red">Red</option><option value="mustard">Mustard Orange</option>
    </select>
  );
  return(
    <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-3 space-y-2">
      <div className="flex gap-2 mb-3">
        <input value={val} onChange={e=>setVal(e.target.value)} placeholder="Add strategy" className="flex-1 input"/>
        <button onClick={add} className="btn">Add</button>
      </div>
      {items.map((s,i)=>(
        <div key={s+i} className="editor-chip">
          <span>{s}</span>
          <div className="flex items-center gap-2">
            <ColorSel name={s}/>
            <button onClick={()=>remove(i)} className="text-red-300 border border-red-700 rounded px-2 py-1 text-xs">Remove</button>
          </div>
        </div>
      ))}
    </div>
  );
}
function CustomizeJournal({settings,setSettings,availableSymbols,setAvailableSymbols,availableStrategies,setAvailableStrategies}){
  const [order,setOrder]=useState(settings.dashboardOrder||["best","general","detailed"]);
  useEffect(()=>{ setSettings({...settings, dashboardOrder: order}); },[order]);

  const move=(from,to)=>{
    if(from===to) return;
    const arr=[...order]; const [m]=arr.splice(from,1); arr.splice(to,0,m); setOrder(arr);
  };
  const updateStrategyColor=(name,color)=>{ const map={...(settings.strategyColors||{})}; map[name]=color; setSettings({...settings,strategyColors:map}); };

  const items = [
    {key:"best", label:"Best Strategy"},
    {key:"general", label:"General Stats"},
    {key:"detailed", label:"Detailed Stats"},
    ...(settings.customBoxes||[]).map(b=>({key:b.id,label:b.title}))
  ];

  return(
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 space-y-6">
      <div>
        <div className="font-semibold mb-2">Dashboard Widgets (drag to reorder)</div>
        <div className="grid sm:grid-cols-2 gap-2">
          {order.map((k,idx)=>{
            const item = items.find(i=>i.key===k) || {key:k,label:k};
            return (
              <div key={k} className="editor-chip"
                draggable
                onDragStart={e=>{e.dataTransfer.setData("text/plain",String(idx));}}
                onDragOver={e=>e.preventDefault()}
                onDrop={e=>{const from=parseInt(e.dataTransfer.getData("text/plain")); move(from, idx);}}>
                <span className="grip">⋮⋮</span>
                <span>{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <div className="font-semibold mb-2">Symbols (Edit list)</div>
          <EditableList items={availableSymbols} setItems={setAvailableSymbols} placeholder="Add symbol e.g. XAUUSD"/>
        </div>
        <div>
          <div className="font-semibold mb-2">Strategies (Edit list + color)</div>
          <EditableStrategyList items={availableStrategies} setItems={setAvailableStrategies} colors={settings.strategyColors||{}} onColorChange={updateStrategyColor}/>
        </div>
      </div>
    </div>
  );
}

/* ------------------ settings page with tabs restored ------------------ */
function SettingsPage({state,setState}){
  const [tab,setTab]=useState("account"); // account | privacy | customize

  const setSettings=(s)=>setState({...state,settings:s});
  const setAvailableSymbols=(s)=>setState({...state,availableSymbols:s});
  const setAvailableStrategies=(s)=>setState({...state,availableStrategies:s});

  return(
    <div className="space-y-4">
      <div className="flex gap-2">
        <button onClick={()=>setTab("account")} className={`px-3 py-2 rounded-lg border ${tab==="account"?"bg-slate-700 border-slate-600":"border-slate-700"}`}>Account Setup</button>
        <button onClick={()=>setTab("privacy")} className={`px-3 py-2 rounded-lg border ${tab==="privacy"?"bg-slate-700 border-slate-600":"border-slate-700"}`}>Privacy & Security</button>
        <button onClick={()=>setTab("customize")} className={`px-3 py-2 rounded-lg border ${tab==="customize"?"bg-slate-700 border-slate-600":"border-slate-700"}`}>Customize Journal</button>
      </div>

      {tab==="account" && (
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 space-y-4">
          <div><label className="text-sm text-slate-300">Name</label><input value={state.name} onChange={e=>setState({...state,name:e.target.value})} className="w-full mt-1 input"/></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className="text-sm text-slate-300">Acc Type</label><select value={state.accType} onChange={e=>setState({...state,accType:e.target.value})} className="w-full mt-1 select">{ACC_TYPES.map(s=><option key={s}>{s}</option>)}</select></div>
            <div><label className="text-sm text-slate-300">Account Capital ($)</label><input type="number" value={state.capital} onChange={e=>setState({...state,capital:parseFloat(e.target.value||"0")})} className="w-full mt-1 input" placeholder="0.00"/></div>
            <div><label className="text-sm text-slate-300">Capital Deposit Date</label><input type="date" value={state.depositDate} onChange={e=>setState({...state,depositDate:e.target.value})} className="w-full mt-1 input"/></div>
          </div>
        </div>
      )}

      {tab==="privacy" && (
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 space-y-3">
          <div className="font-semibold">Password</div>
          <PasswordChanger email={state.email}/>
          <div className="text-xs text-slate-400 mt-2">
            (Note: without a backend, accounts are local to the browser. Google sign-in identifies the same email, but data lives in this browser’s storage.)
          </div>
        </div>
      )}

      {tab==="customize" && (
        <CustomizeJournal
          settings={state.settings} setSettings={setSettings}
          availableSymbols={state.availableSymbols} setAvailableSymbols={setAvailableSymbols}
          availableStrategies={state.availableStrategies} setAvailableStrategies={setAvailableStrategies}
        />
      )}
    </div>
  );
}
function PasswordChanger({email}){
  const [pw1,setPw1]=useState(""); const [pw2,setPw2]=useState(""); const [msg,setMsg]=useState("");
  const savePw=()=>{ if(!pw1||pw1.length<6){setMsg("Password must be at least 6 characters.");return}
    if(pw1!==pw2){setMsg("Passwords do not match.");return}
    const users=loadUsers(); const i=users.findIndex(u=>u.email.toLowerCase()===(email||"").toLowerCase());
    if(i>=0){users[i].password=pw1; saveUsers(users); setMsg("Password updated."); setPw1(""); setPw2("")}
  };
  return(
    <div className="grid md:grid-cols-3 gap-3">
      <div><label className="text-sm text-slate-300">New Password</label><input type="password" value={pw1} onChange={e=>setPw1(e.target.value)} className="w-full mt-1 input"/></div>
      <div><label className="text-sm text-slate-300">Confirm Password</label><input type="password" value={pw2} onChange={e=>setPw2(e.target.value)} className="w-full mt-1 input"/></div>
      <div className="flex items-end"><button onClick={savePw} className="btn btn-primary w-full">Update Password</button></div>
      {msg&&<div className="text-sky-400 text-sm md:col-span-3">{msg}</div>}
    </div>
  );
}

/* ------------------ app ------------------ */
function App(){
  const [currentEmail,setCurrentEmail]=useState(getCurrent());
  const [users,setUsers]=useState(loadUsers());

  const useFresh=(email)=>({
    name: email.split("@")[0],
    email,
    accType: ACC_TYPES[1],
    capital: 0,
    depositDate: todayISO(),
    trades: [],
    notes: [],
    settings: { dashboardOrder:["best","general","detailed"], customBoxes:[], strategyColors:{} },
    availableSymbols:[...DEFAULT_SYMBOLS],
    availableStrategies:[...DEFAULT_STRATEGIES],
  });

  const [state,setState]=useState(()=>{const e=currentEmail||getCurrent(); const s=e?loadState(e):null; return s || (currentEmail?useFresh(currentEmail):null)});

  useEffect(()=>{ if(!currentEmail) return; const loaded=loadState(currentEmail); setState(loaded || useFresh(currentEmail)); },[currentEmail]);
  useEffect(()=>{ if(state?.email){ saveState(state.email,state) } },[state]);

  const [page,setPage]=useState("dashboard");
  const [showTrade,setShowTrade]=useState(false); const [editItem,setEditItem]=useState(null);
  const [collapsed,setCollapsed]=useState(false);
  const [showReset,setShowReset]=useState(false);

  const realized=state?.trades.filter(t=>new Date(t.date)>=new Date(state.depositDate)&&t.exitType&&t.exitType!=="Trade In Progress").map(t=>computeDollarPnL(t,state.accType)).filter(v=>v!==null&&isFinite(v)).reduce((a,b)=>a+b,0)||0;
  const openTrades=state?.trades.filter(t=>!t.exitType||t.exitType==="Trade In Progress").length||0;
  const effectiveCapital=(state?.capital||0)+realized;

  const onExport=()=>{const csv=toCSV(state.trades,state.accType);const blob=new Blob([csv],{type:"text/csv;charset=utf-8;"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="Nitty_Gritty_Template_Export.csv";a.click();URL.revokeObjectURL(url)};
  const onImport=()=>{const input=document.createElement("input");input.type="file";input.accept=".csv,.xls,.xlsx";input.onchange=async e=>{
      const file=e.target.files[0]; if(!file) return;
      const ext = (file.name.split('.').pop()||"").toLowerCase();
      let newTrades=[];
      if(ext==="csv"){ const text=await file.text(); newTrades=importFromCSVText(text); }
      else { newTrades=await importFromExcel(file); } // .xls/.xlsx
      const merged=[...newTrades.map(t=>({...t,id:Math.random().toString(36).slice(2)})),...state.trades];
      setState({...state,trades:merged});
    }; input.click();};

  const onLogout=()=>{ saveCurrent(""); setCurrentEmail(""); };
  const initGoogle=(container,onEmail)=>{
    const clientId=window.GOOGLE_CLIENT_ID; if(!window.google||!clientId||!container) return;
    window.google.accounts.id.initialize({client_id:clientId,callback:(resp)=>{try{const p=JSON.parse(atob(resp.credential.split('.')[1])); if(p&&p.email){ onEmail(p.email); }}catch{}}});
    window.google.accounts.id.renderButton(container,{theme:"outline",size:"large",text:"signin_with",shape:"pill"});
  };
  const login=(email,password,setErr)=>{
    const u=users.find(x=>x.email.toLowerCase()===email.toLowerCase());
    if(!u){
      if(password==="__google__"){
        const freshUser={name:email.split("@")[0],email,password:""};
        const nu=[...users,freshUser]; setUsers(nu); saveUsers(nu);
        const fresh=useFresh(email); saveState(email,fresh); saveCurrent(email); setCurrentEmail(email); return;
      }
      setErr("No such user. Please sign up."); return;
    }
    if(password!=="__google__" && u.password!==password){setErr("Wrong password.");return}
    setErr(""); saveCurrent(u.email); setCurrentEmail(u.email);
  };
  const signup=(name,email,password,setErr)=>{
    if(users.some(x=>x.email.toLowerCase()===email.toLowerCase())){setErr("Email already registered.");return}
    const u={name,email,password}; const nu=[...users,u]; setUsers(nu); saveUsers(nu);
    const fresh=useFresh(email); saveState(email,fresh); saveCurrent(email); setCurrentEmail(email);
  };
  const resetStart=()=>{ setShowReset(true); };

  const addOrUpdate=(draft)=>{ const id=draft.id||Math.random().toString(36).slice(2); const arr=state.trades.slice(); const idx=arr.findIndex(t=>t.id===id); const rec={...draft,id}; if(idx>=0)arr[idx]=rec; else arr.unshift(rec); setState({...state,trades:arr}); setShowTrade(false); setEditItem(null); };
  const delTrade=(id)=>setState({...state,trades:state.trades.filter(t=>t.id!==id)});

  if(!currentEmail){ return <><LoginView onLogin={login} onSignup={signup} initGoogle={initGoogle} resetStart={resetStart}/></>; }

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
    <button onClick={()=>setPage("notes")} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border ${page==="notes"?'bg-slate-700 border-slate-600':'border-slate-700 hover:bg-slate-800'}`}><IconNote/>Notes</button>
    {navBtn("Settings","settings",IconSettings)}
  </>);

  const logoSrc=LOGO_PUBLIC;

  const renderWidget=(key)=> {
    if(key==="general") return <div key={key} className="card"><GeneralStats trades={state.trades} accType={state.accType} capital={state.capital} depositDate={state.depositDate}/></div>;
    if(key==="best") return <div key={key} className="card"><BestStrategy trades={state.trades} accType={state.accType} colors={state.settings.strategyColors}/></div>;
    if(key==="detailed") return <div key={key} className="card"><DetailedStats trades={state.trades} accType={state.accType}/></div>;
    const box=state.settings.customBoxes?.find(b=>b.id===key);
    if(box) return <div key={key} className="card"><div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4"><div className="text-sm font-semibold mb-2">{box.title}</div><div className="text-slate-300">{box.content||"Empty"}</div></div></div>;
    return null;
  };

  return(
    <AppShell capitalPanel={capitalPanel} nav={nav} logoSrc={logoSrc} onToggleSidebar={()=>setCollapsed(v=>!v)} onExport={onExport} onImport={onImport} onLogout={onLogout} sidebarCollapsed={collapsed}>

      {page==="dashboard"&&(
        <div className="space-y-4">
          {/* Keep outline as before: Best, General, Detailed (order can be customized in settings) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {["best","general"].map(renderWidget)}
          </div>
          <div className="grid grid-cols-1 gap-4">
            {["detailed"].map(renderWidget)}
          </div>
        </div>
      )}

      {page==="histories"&&(
        <Histories trades={state.trades} accType={state.accType} onEdit={t=>{setEditItem(t);setShowTrade(true)}} onDelete={id=>delTrade(id)} strategyColors={state.settings.strategyColors}/>
      )}

      {page==="notes"&&(
        <NotesTab notes={state.notes} setNotes={(n)=>setState({...state,notes:n})} trades={state.trades}/>
      )}

      {page==="settings"&&(
        <SettingsPage state={state} setState={setState}/>
      )}

      {showTrade&&(
        <TradeModal
          initial={editItem}
          onClose={()=>{setShowTrade(false);setEditItem(null)}}
          onSave={addOrUpdate}
          onDelete={id=>delTrade(id)}
          accType={state.accType}
          symbols={state.availableSymbols}
          strategies={state.availableStrategies}
        />
      )}
    </AppShell>
  );
}

/* ------------------ mount ------------------ */
ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
