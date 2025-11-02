/* Nitty Gritty — Trading Journal (single-file React) — rev.12
   - FIX: Blank-screen crash (defensive state guards; removed undefined .includes)
   - CSV Import rebuilt:
       * robust CSV parser (quoted fields)
       * field mapping (Date, Symbol/Instrument, Side/Direction, Lot Size, Entry, Exit, TP1/TP 1, TP2/TP 2, SL/Stop Loss, Exit Type, P&L, P&L (Units), Status)
       * uses provided P&L if present, else calculates
       * progress overlay + chunked parsing for large files
   - Notes:
       * removed image upload
       * multi-notes per day supported
       * reliable save & quick-list view; details on click
       * when linking trades, shows Strategy, Status, P&L
   - Best Strategy:
       * hidden until enough data (>=5 closed trades in a strategy)
       * modern metric ring + stat line
   - Settings / Customize:
       * cleaned layout
       * choose visible dashboard widgets (General, BestStrategy, Detailed)
       * reorder widgets (Up/Down)
   - Forgot Password:
       * same UI, now posts to Cloudflare Worker endpoint (window.CF_RESET_ENDPOINT)
       * email template exactly as requested
   - Google Sign-In: unchanged
*/

const { useState, useMemo, useEffect, useRef } = React;

/* ----------------- Icons ----------------- */
const iconCls="h-5 w-5";
const IconUser=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Z"/><path d="M4 20a8 8 0 0 1 16 0Z"/></svg>);
const IconLogout=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M9 21h4a4 4 0 0 0 4-4V7a4 4 0 0 0-4-4H9"/><path d="M16 12H3"/><path d="M7 8l-4 4 4 4"/></svg>);
const IconDownload=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M12 3v10"/><path d="M8 11l4 4 4-4"/><path d="M5 21h14v-4H5Z"/></svg>);
const IconUpload=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M12 11V1"/><path d="M16 5L12 1 8 5"/><path d="M5 23h14V13H5z"/></svg>);
const IconCalendar=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M8 3v4M16 3v4"/><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18"/></svg>);
const IconPlus=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M12 5v14M5 12h14"/></svg>);
const IconHistory=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M12 8v5l3 3"/><path d="M12 3a9 9 0 1 0 9 9"/><path d="M21 3v6h-6"/></svg>);
const IconSettings=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.65 1.65 0  0 0 15 19.4a1.65 1.65 0  0 0-1 .6 1.65 1.65 0  0 0-.4 1V22a2 2 0 1 1-4 0v-.1a1.65 1.65 0  0 0-.4-1 1.65 1.65 0  0 0-1-.6 1.65 1.65 0  0 0-1.82.33l-.06.06a2 2 0  1 1-2.83-2.83l.06-.06A1.65 1.65 0  0 0 4.6 15a1.65 1.65 0  0 0-.6-1 1.65 1.65 0  0 0-1-.4H2a2 2 0  1 1 0-4h.1a1.65 1.65 0  0 0 1-.4 1.65 1.65 0  0 0 .6-1 1.65 1.65 0  0 0-.33-1.82l-.06-.06A2 2 0  1 1 6.24 2.9l.06.06A1.65 1.65 0  0 0 8 4.6a1.65 1.65 0  0 0 1-.6 1.65 1.65 0  0 0 .4-1V2a2 2 0  1 1 4 0v.1c0 .38.14.74.4 1 .26.26.62.4 1 .4.62 0 1.22-.25 1.64-.68l.06-.06A2 2 0  1 1 21.1 6.24l-.06.06c-.26.26-.4.62-.4 1s.14.74.4 1c.26.26.62.4 1 .4H22a2 2 0  1 1 0 4h-.1a1.65 1.65 0  0 0-1 .4 1.65 1.65 0  0 0-.6 1Z"/></svg>);
const IconHome=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9v12h14V9"/></svg>);
const IconNotes=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M4 4h16v16H4z"/><path d="M8 8h8"/><path d="M8 12h8"/><path d="M8 16h4"/></svg>);
const IconUp=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={iconCls} {...p}><path d="M6 15l6-6 6 6"/></svg>);
const IconDown=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={iconCls} {...p}><path d="M6 9l6 6 6-6"/></svg>);

/* ----------------- Constants + helpers ----------------- */
const LOGO_PUBLIC="/logo-ng.png"; 
const LOGO_FALLBACK="./logo-ng.png.png";
const DEFAULT_SYMBOLS=["XAUUSD","US100","US30","EURUSD","BTCUSD","AUDCAD","USDCAD","USDJPY","GBPUSD"];
const DEFAULT_STRATEGIES=[
  "Trend Line Bounce",
  "2 Touch Point Trend Line Break",
  "3 / 3+ Touch Point Trend Line Break",
  "Trend Line Break & Re-test",
  "Trend Continuation"
];
const EXIT_TYPES=["TP","SL","TP1_BE","TP1_SL","BE","Trade In Progress"];
const ACC_TYPES=["Cent Account","Dollar Account"];
const DEFAULT_WIDGETS=["General","BestStrategy","Detailed"]; // customize-able

const r2=n=>Math.round((Number(n)||0)*100)/100;
const fmt$=n=>"$"+(isFinite(n)?r2(n):0).toFixed(2);
const todayISO=()=>{const d=new Date();const tz=d.getTimezoneOffset();return new Date(d.getTime()-tz*60000).toISOString().slice(0,10)};

/* LocalStorage keys */
const USERS_KEY="ng_users_v1";
const CURR_KEY="ng_current_user_v1";
const STATE_PREFIX="ng_state_";
const RESET_PREFIX="ng_reset_";

/* LocalStorage helpers (defensive) */
const loadUsers=()=>{try{const j=localStorage.getItem(USERS_KEY);return j?JSON.parse(j):[]}catch{return[]}};
const saveUsers=u=>{try{localStorage.setItem(USERS_KEY,JSON.stringify(u))}catch{}};
const saveCurrent=e=>{try{localStorage.setItem(CURR_KEY,e||"")}catch{}};
const getCurrent=()=>{try{return localStorage.getItem(CURR_KEY)||""}catch{return""}};
const loadState=email=>{try{if(!email)return null;const j=localStorage.getItem(STATE_PREFIX+email);return j?JSON.parse(j):null}catch{return null}};
const saveState=(email,s)=>{try{if(!email)return;localStorage.setItem(STATE_PREFIX+email,JSON.stringify(s))}catch{}};

/* Value per move (rough approximations matching your earlier logic) */
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
  if([symbol,side,entry,exit,lot,accType].some(v=>v===undefined||v===null||v==="")) return 0;
  const raw=perLotValueForMove(symbol,exit-entry,accType)*(lot||0);
  const s=side==="BUY"?Math.sign(exit-entry):-Math.sign(exit-entry);
  return raw*s;
}
function computeDollarPnL(t,accType){
  // Respect imported override if provided
  if (t.pnlOverride !== undefined && t.pnlOverride !== null && isFinite(t.pnlOverride)) return Number(t.pnlOverride);

  if(t.exitType === "Trade In Progress") return null;
  const has=v=>typeof v==="number"&&isFinite(v);
  const {entry,sl,tp1,tp2,lotSize:lot}=t;
  if(typeof t.exit==="number"&&(!t.exitType||t.exitType==="TP")) return legPnL(t.symbol,t.side,entry,t.exit,lot,accType);
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
function parseCSV(text){
  // Robust CSV splitter with quotes
  const rows=[]; let i=0, cur=[], field="", inQ=false;
  while(i<text.length){
    const ch=text[i];
    if(inQ){
      if(ch==='"' && text[i+1]==='"'){ field+='"'; i+=2; continue; }
      if(ch==='"' ){ inQ=false; i++; continue; }
      field+=ch; i++; continue;
    }else{
      if(ch==='"' ){ inQ=true; i++; continue; }
      if(ch===',' ){ cur.push(field); field=""; i++; continue; }
      if(ch==='\n'){ cur.push(field); field=""; rows.push(cur); cur=[]; i++; continue; }
      if(ch==='\r'){ i++; continue; }
      field+=ch; i++; continue;
    }
  }
  cur.push(field); rows.push(cur);
  // Drop possible trailing blank
  return rows.filter(r=>r.some(c=>String(c).trim()!==""));
}
const headerAliases = {
  Date: ["date"],
  Symbol: ["symbol","instrument","pair","ticker"],
  Side: ["side","direction","action","buy/sell","buy sell"],
  "Lot Size": ["lot size","lot","lotsize","size","qty","quantity"],
  Entry: ["entry","entry price","price in","open price","open"],
  Exit: ["exit","exit price","price out","close price","close"],
  TP1: ["tp1","tp 1","take profit 1"],
  TP2: ["tp2","tp 2","take profit 2"],
  SL: ["sl","stop loss","stop-loss","stop"],
  Strategy: ["strategy","setup"],
  "Exit Type": ["exit type","exit-type","outcome type"],
  "P&L": ["p&l","profit","pnl","pnl ($)","p&l ($)","profit ($)"],
  "P&L (Units)": ["p&l (units)","pnl units","units"],
  Status: ["status","state"]
};
function matchHeaderName(h){
  if(!h) return null;
  const norm = String(h).trim().toLowerCase();
  for(const key of Object.keys(headerAliases)){
    const candidates = [key, ...(headerAliases[key]||[])].map(x=>String(x).toLowerCase());
    if(candidates.includes(norm)) return key;
  }
  // try relaxed matches
  if(norm.includes("tp1")) return "TP1";
  if(norm.includes("tp 1")) return "TP1";
  if(norm.includes("tp2")) return "TP2";
  if(norm.includes("tp 2")) return "TP2";
  if(norm.includes("stop")) return "SL";
  if(norm.includes("profit")||norm.includes("p&l")||norm.includes("pnl")) return "P&L";
  return null;
}

/* ----------------- Small UI atoms ----------------- */
function Stat({label,value}){return(<div className="bg-slate-900/50 border border-slate-700 rounded-xl p-3"><div className="text-slate-400 text-xs">{label}</div><div className="text-2xl font-bold mt-1">{value}</div></div>)}
function Th({children,className,...rest}){return(<th {...rest} className={(className?className+" ":"")+"px-4 py-3 text-left font-semibold text-slate-300"}>{children}</th>)}
function Td({children,className,...rest}){return(<td {...rest} className={(className?className+" ":"")+"px-4 py-3 align-top"}>{children}</td>)}
function Modal({title,children,onClose,maxClass}){return(
  <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-3">
    <div className={`relative w-[95vw] ${maxClass||"max-w-3xl"} max-h-[80vh] overflow-auto bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl`}>
      <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-slate-800/95 backdrop-blur">
        <div className="font-semibold">{title}</div>
        <button onClick={onClose} className="px-3 py-1.5 rounded-lg border border-slate-600 hover:bg-slate-700">✕</button>
      </div>
      <div className="p-4">{children}</div>
    </div>
  </div>
)}

/* ----------------- Settings (organized + Customize) ----------------- */
function SettingsPanel({
  name,setName,accType,setAccType,capital,setCapital,depositDate,setDepositDate,email,
  customSymbols,setCustomSymbols,customStrategies,setCustomStrategies,
  widgets,setWidgets, moveWidget
}){
  const [tab,setTab]=useState("account");
  const [pw1,setPw1]=useState(""), [pw2,setPw2]=useState(""), [msg,setMsg]=useState("");
  const [newSymbol,setNewSymbol]=useState(""); const [newStrategy,setNewStrategy]=useState("");

  const addSymbol=()=>{const s=(newSymbol||"").trim(); if(s&&!customSymbols.includes(s)){setCustomSymbols([...customSymbols,s]); setNewSymbol("")}};
  const removeSymbol=(s)=>setCustomSymbols(customSymbols.filter(x=>x!==s));
  const addStrategy=()=>{const s=(newStrategy||"").trim(); if(s&&!customStrategies.includes(s)){setCustomStrategies([...customStrategies,s]); setNewStrategy("")}};
  const removeStrategy=(s)=>setCustomStrategies(customStrategies.filter(x=>x!==s));
  const savePw=()=>{ if(!pw1||pw1.length<6){setMsg("Password must be at least 6 characters.");return}
    if(pw1!==pw2){setMsg("Passwords do not match.");return}
    const users=loadUsers();const i=users.findIndex(u=>u.email.toLowerCase()===(email||"").toLowerCase());
    if(i>=0){users[i].password=pw1;saveUsers(users);setMsg("Password updated.");setPw1("");setPw2("")}
  };

  const allWidgets = ["General","BestStrategy","Detailed"];
  const toggleWidget = key => {
    if (widgets.includes(key)) setWidgets(widgets.filter(w=>w!==key));
    else setWidgets([...widgets, key]);
  };

  return(
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4"><IconSettings/><div className="font-semibold">Settings</div></div>
      <div className="flex gap-2 mb-4 flex-wrap">
        <button onClick={()=>setTab("account")} className={`px-3 py-1.5 rounded-lg border ${tab==="account"?"bg-slate-700 border-slate-600":"border-slate-700"}`}>Account Setup</button>
        <button onClick={()=>setTab("security")} className={`px-3 py-1.5 rounded-lg border ${tab==="security"?"bg-slate-700 border-slate-600":"border-slate-700"}`}>Privacy & Security</button>
        <button onClick={()=>setTab("customize")} className={`px-3 py-1.5 rounded-lg border ${tab==="customize"?"bg-slate-700 border-slate-600":"border-slate-700"}`}>Customize Journal</button>
      </div>

      {tab==="account"&&(
        <div className="space-y-4">
          <div>
            <label className="text-sm text-slate-300">Name</label>
            <input value={name||""} onChange={e=>setName(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/>
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
              <input type="number" value={Number.isFinite(capital)?capital:""} onChange={e=>setCapital(parseFloat(e.target.value||"0"))} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2" placeholder="0.00"/>
            </div>
            <div>
              <label className="text-sm text-slate-300">Capital Deposit Date</label>
              <input type="date" value={depositDate||todayISO()} onChange={e=>setDepositDate(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/>
            </div>
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
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div>
              <div className="text-sm font-semibold mb-2">Symbols</div>
              <div className="space-y-2 mb-3 max-h-44 overflow-auto pr-1">
                {(customSymbols||[]).map(s=>(
                  <div key={s} className="flex items-center justify-between bg-slate-900/50 p-2 rounded-lg">
                    <div>{s}</div>
                    <button onClick={()=>removeSymbol(s)} className="text-red-400">Remove</button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input value={newSymbol} onChange={e=>setNewSymbol(e.target.value)} className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2" placeholder="Add symbol e.g. US2000"/>
                <button onClick={addSymbol} className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500">Add</button>
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold mb-2">Strategies</div>
              <div className="space-y-2 mb-3 max-h-44 overflow-auto pr-1">
                {(customStrategies||[]).map(s=>(
                  <div key={s} className="flex items-center justify-between bg-slate-900/50 p-2 rounded-lg">
                    <div>{s}</div>
                    <button onClick={()=>removeStrategy(s)} className="text-red-400">Remove</button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input value={newStrategy} onChange={e=>setNewStrategy(e.target.value)} className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2" placeholder="Add strategy"/>
                <button onClick={addStrategy} className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500">Add</button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <div className="text-sm font-semibold mb-2">Dashboard Widgets</div>
              <div className="space-y-2">
                {["General","BestStrategy","Detailed"].map(key=>(
                  <div key={key} className="flex items-center justify-between bg-slate-900/50 p-2 rounded-lg">
                    <label className="flex items-center gap-3">
                      <input type="checkbox" checked={widgets.includes(key)} onChange={()=>toggleWidget(key)}/>
                      <span>{key}</span>
                    </label>
                    <div className="flex gap-2">
                      <button className="btn" onClick={()=>moveWidget(key,-1)}><IconUp/></button>
                      <button className="btn" onClick={()=>moveWidget(key,1)}><IconDown/></button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-xs text-slate-400 mt-2">Reorder controls affect the order they appear on the dashboard.</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ----------------- Trade Modal ----------------- */
function TradeModal({initial,onClose,onSave,onDelete,accType,lastLotSize,customSymbols=[],customStrategies=[]}){
  const i=initial||{}; 
  const [symbol,setSymbol]=useState(i.symbol||customSymbols[0]||"XAUUSD"); 
  const [side,setSide]=useState(i.side||"BUY");
  const [date,setDate]=useState(i.date||todayISO()); 
  const [lotSize,setLotSize]=useState(i.lotSize ?? lastLotSize ?? 0.01);
  const [entry,setEntry]=useState(i.entry??""); 
  const [exit,setExit]=useState(i.exit??"");
  const [tp1,setTp1]=useState(i.tp1??""); 
  const [tp2,setTp2]=useState(i.tp2??""); 
  const [sl,setSl]=useState(i.sl??"");
  const [strategy,setStrategy]=useState(i.strategy||customStrategies[0]||"Trend Line Bounce"); 
  const [exitType,setExitType]=useState(i.exitType||"TP");
  const num=v=>(v===""||v===undefined||v===null)?undefined:parseFloat(v);

  // Auto-calc TP1/TP2 from SL distance
  useEffect(()=>{
    const en = num(entry), sll = num(sl);
    if (en === undefined || sll === undefined) return;
    const risk = side === "BUY" ? en - sll : sll - en;
    if (risk <= 0) return;
    const tp1Calc = side === "BUY" ? en + risk : en - risk;
    const tp2Calc = side === "BUY" ? en + risk * 2 : en - risk * 2;
    setTp1(tp1Calc);
    setTp2(tp2Calc);
  },[entry,sl,side]);

  const draft=useMemo(()=>({
    id:i.id,
    date,
    symbol,
    side,
    lotSize:parseFloat(lotSize||0),
    entry:num(entry),
    exit:num(exit),
    tp1:num(tp1),
    tp2:num(tp2),
    sl:num(sl),
    strategy,
    exitType
  }),[i.id,date,symbol,side,lotSize,entry,exit,tp1,tp2,sl,strategy,exitType]);

  const preview=useMemo(()=>{
    const v=computeDollarPnL(draft,accType);
    if(v===null||!isFinite(v))return"-";
    return `${formatPnlDisplay(accType,v)} (${formatUnits(accType,v)})`;
  },[draft,accType]);

  return(
    <Modal title={i.id?"Edit Trade":"Add Trade"} onClose={onClose} maxClass="max-w-4xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <div><label className="text-sm text-slate-300">Symbol</label>
          <select value={symbol} onChange={e=>setSymbol(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2">
            {(customSymbols.length?customSymbols:DEFAULT_SYMBOLS).map(s=><option key={s}>{s}</option>)}
          </select>
        </div>
        <div><label className="text-sm text-slate-300">Action</label>
          <div className="mt-1 grid grid-cols-2 gap-2">
            {["BUY","SELL"].map(s=>(
              <button key={s} onClick={()=>setSide(s)} className={`px-2 py-2 rounded-lg border ${side===s ? (s==="BUY" ? "bg-green-600 border-green-500" : "bg-red-600 border-red-500") : "border-slate-700"}`}>{s}</button>
            ))}
          </div>
        </div>
        <div><label className="text-sm text-slate-300">Date</label>
          <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/>
        </div>
        <div><label className="text-sm text-slate-300">Lot size</label>
          <input type="number" step="0.01" value={lotSize} onChange={e=>setLotSize(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/>
        </div>
        <div><label className="text-sm text-slate-300">Entry price</label>
          <input type="number" step="0.0001" value={entry} onChange={e=>setEntry(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/>
        </div>
        <div><label className="text-sm text-slate-300">Exit Price</label>
          <input type="number" step="0.0001" value={exit} onChange={e=>setExit(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2" placeholder="Leave blank for OPEN"/>
        </div>
        <div><label className="text-sm text-slate-300">TP 1</label>
          <input type="number" step="0.0001" value={tp1} onChange={e=>setTp1(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/>
        </div>
        <div><label className="text-sm text-slate-300">TP 2</label>
          <input type="number" step="0.0001" value={tp2} onChange={e=>setTp2(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/>
        </div>
        <div><label className="text-sm text-slate-300">Stop-Loss</label>
          <input type="number" step="0.0001" value={sl} onChange={e=>setSl(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/>
        </div>
        <div><label className="text-sm text-slate-300">Strategy</label>
          <select value={strategy} onChange={e=>setStrategy(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2">
            {(customStrategies.length?customStrategies:DEFAULT_STRATEGIES).map(s=><option key={s}>{s}</option>)}
          </select>
        </div>
        <div><label className="text-sm text-slate-300">Exit Type</label>
          <select value={exitType} onChange={e=>setExitType(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2">
            {EXIT_TYPES.map(s=><option key={s}>{s}</option>)}
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
  );
}

/* ----------------- Calendar Modal (unchanged visual) ----------------- */
function CalendarModal({onClose,trades=[],view,setView,month,setMonth,year,setYear,selectedDate,setSelectedDate,accType}){
  const monthNames=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']; const dayNames=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const dim=(y,m)=>new Date(y,m+1,0).getDate(); const fd=(y,m)=>new Date(y,m,1).getDay();
  const byDate=useMemo(()=>{const m={};for(const t of trades){if(!t?.date) continue; m[t.date]=m[t.date]||[];m[t.date].push(t)}return m},[trades]);
  const pnlByDate=useMemo(()=>{const m={};for(const date in byDate){const ts=(byDate[date]||[]).filter(t=>t.exitType && t.exitType!=="Trade In Progress");const pnl=ts.reduce((a,t)=>a+ (computeDollarPnL(t,accType) || 0),0);m[date]=pnl}return m},[byDate,accType]);
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
            <div className="text-slate-400 text-xs mb-1">Trades: {trades.filter(t=>{const d=new Date(t.date);return d.getMonth()===i && d.getFullYear()===year}).length}</div>
            <button onClick={()=>{setMonth(i);setView('month')}} className="px-2 py-1 rounded-lg border border-slate-700 hover:bg-slate-800 text-xs">Open</button>
          </div>))}
        </div>
      )}
      {view==="month"&&(
        <div>
          <div className="grid grid-cols-7 text-center text-xs text-slate-400 mb-1">{dayNames.map(d=><div key={d} className="py-1">{d}</div>)}</div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({length:fd(year,month)}).map((_,i)=>(<div key={"e"+i}/>))}
            {Array.from({length:dim(year,month)}).map((_,d)=>{
              const day=String(d+1).padStart(2,'0');
              const dateISO=`${year}-${String(month+1).padStart(2,'0')}-${day}`;
              const items=byDate[dateISO]||[];
              const pnl=pnlByDate[dateISO]||0;
              const colorClass=pnl>0 ? 'border-green-700/60 bg-green-900/10' : pnl<0 ? 'border-red-700/60 bg-red-900/10' : items.length ? 'border-blue-700/60 bg-blue-900/10' : 'border-slate-700 bg-slate-900/30';
              return(<button key={dateISO} onClick={()=>{setSelectedDate(dateISO);setView('day')}} className={`text-left p-1 rounded-lg border ${colorClass}`}>
                <div className="text-xs text-slate-400">{d+1}</div>
                <div className={`text-xs ${pnl>0?'text-green-400':pnl<0?'text-red-400':'text-slate-400'}`}>{pnl!==0 ? formatPnlDisplay(accType,pnl) : ''}</div>
              </button>)
            })}
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
            </div>))}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

/* ----------------- Notes (no images, multi-per-day, detail on click) ----------------- */
function NotesPanel({notes,setNotes,trades=[],accType}){
  const [selectedDate,setSelectedDate]=useState(todayISO()); 
  const [text,setText]=useState(""); 
  const [tradeIds,setTradeIds]=useState([]);
  const [expanded,setExpanded]=useState(null); // which note id is open

  const byDate=useMemo(()=>{const m={};for(const n of (notes||[])){m[n.date]=m[n.date]||[];m[n.date].push(n)}return m},[notes]);

  const addNote=()=>{
    const id = Math.random().toString(36).slice(2);
    const rec = { id, date:selectedDate, text:(text||"").trim(), tradeIds:[...tradeIds] };
    const arr = Array.isArray(notes)?notes.slice():[];
    arr.push(rec);
    setNotes(arr);
    // clear inputs for next note (user can keep adding)
    setText("");
    setTradeIds([]);
  };
  const delNote=(id)=>setNotes((notes||[]).filter(n=>n.id!==id));

  const linkedDisplay = (tid) => {
    const t = (trades||[]).find(x=>x.id===tid);
    if(!t) return `Trade ${tid}`;
    const closed = t.exitType && t.exitType!=="Trade In Progress";
    const pnl = computeDollarPnL(t,accType);
    const st = closed ? "CLOSED" : "OPEN";
    return `${t.strategy||"-"} • ${st}${pnl!==null&&isFinite(pnl)?` • ${formatPnlDisplay(accType,pnl)}`:""}`;
  };

  const allNotes = (byDate[selectedDate]||[]);

  return(
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4"><IconNotes/><div className="font-semibold">Notes</div></div>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-1 space-y-3">
          <div>
            <label className="text-sm text-slate-300">Date</label>
            <input type="date" value={selectedDate} onChange={e=>setSelectedDate(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/>
          </div>
          <div>
            <label className="text-sm text-slate-300">Link to Trades</label>
            <select multiple value={tradeIds} onChange={e=>setTradeIds(Array.from(e.target.selectedOptions,o=>o.value))} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 h-28">
              {(trades||[]).map(t=><option key={t.id} value={t.id}>{`${t.date} ${t.symbol} ${t.side}`}</option>)}
            </select>
            <div className="text-xs text-slate-400 mt-1">Linked trades show strategy, status, and P&L in the details.</div>
          </div>
          <div>
            <label className="text-sm text-slate-300">Note</label>
            <textarea value={text} onChange={e=>setText(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 h-24" placeholder="Write your note..."/>
          </div>
          <button onClick={addNote} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500">Add Note</button>
        </div>

        <div className="md:col-span-2">
          <div className="text-sm font-semibold mb-2">Notes for {selectedDate}</div>
          {allNotes.length===0?(
            <div className="text-slate-400 text-sm">No notes for this date yet.</div>
          ):(
            <div className="space-y-3">
              {allNotes.map(n=>(
                <div key={n.id} className="note-item p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm truncate">{(n.text||"(no text)").slice(0,80)}{(n.text||"").length>80?"…":""}</div>
                    <div className="flex items-center gap-2">
                      <span className="badge">{n.tradeIds?.length||0} linked</span>
                      <button className="btn" onClick={()=>setExpanded(expanded===n.id?null:n.id)}>{expanded===n.id?"Hide":"View"}</button>
                      <button className="btn text-red-300" onClick={()=>delNote(n.id)}>Delete</button>
                    </div>
                  </div>
                  {expanded===n.id&&(
                    <div className="mt-3 text-sm space-y-2">
                      <div className="text-slate-300 whitespace-pre-wrap">{n.text||"(no text)"}</div>
                      {(n.tradeIds||[]).length>0&&(
                        <div className="space-y-1">
                          <div className="text-xs text-slate-400">Linked trades:</div>
                          {(n.tradeIds||[]).map(tid=>(
                            <div key={tid} className="text-xs">{linkedDisplay(tid)}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ----------------- User Menu ----------------- */
function UserMenu({onExport,onLogout,onImport}){
  const [open,setOpen]=useState(false);
  const fileInput = useRef(null);
  return(
    <div className="relative">
      <button onClick={()=>setOpen(v=>!v)} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-700 hover:bg-slate-800"><IconUser/></button>
      {open&&(<div className="absolute right-0 mt-2 w-52 bg-slate-800 border border-slate-700 rounded-xl shadow-lg overflow-hidden">
        <button onClick={()=>{setOpen(false);onExport()}} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-700"><IconDownload/>Export CSV</button>
        <button onClick={()=>{setOpen(false);fileInput.current?.click()}} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-700"><IconUpload/>Import CSV</button>
        <input type="file" accept=".csv" ref={fileInput} onChange={onImport} style={{display:'none'}} />
        <button onClick={()=>{setOpen(false);onLogout()}} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-700 text-red-300"><IconLogout/>Logout</button>
      </div>)}
    </div>
  );
}

/* ----------------- Dashboard cards ----------------- */
function GeneralStats({trades=[],accType,capital=0,depositDate}){
  const realized=(trades||[]).filter(t=>t?.date && new Date(t.date)>=new Date(depositDate) && t.exitType && t.exitType!=="Trade In Progress");
  const pnl=realized.map(t=>computeDollarPnL(t,accType)).filter(v=>v!==null&&isFinite(v));
  const total=pnl.reduce((a,b)=>a+b,0); const wins=pnl.filter(v=>v>0).length; const losses=pnl.filter(v=>v<0).length;
  const open=(trades||[]).filter(t=> !t.exitType || t.exitType === "Trade In Progress").length; 
  const wr=(wins+losses)>0?Math.round((wins/(wins+losses))*100):0;
  return(<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
    <Stat label="Capital" value={accType==='Cent Account'?`${r2(capital*100).toFixed(2)} ¢`:fmt$(capital)}/>
    <Stat label="Realized P&L" value={formatPnlDisplay(accType,total)}/>
    <Stat label="Win Rate" value={`${wr}%`}/>
    <Stat label="Open" value={open}/>
  </div>);
}

function BestStrategy({trades=[],accType,strategies=[]}){
  const closed=(trades||[]).filter(t=>t.exitType && t.exitType!=="Trade In Progress");
  const byStrat = useMemo(()=>{
    const m = {};
    (strategies||[]).forEach(s=>{m[s]={wins:0,losses:0,count:0}});
    for(const t of closed){
      const key = t.strategy || "(Unlabeled)";
      m[key] = m[key] || {wins:0,losses:0,count:0};
      const pnl = computeDollarPnL(t,accType);
      if(isFinite(pnl)){
        if(pnl>0) m[key].wins++; else if(pnl<0) m[key].losses++;
      }
      m[key].count++;
    }
    return Object.entries(m).map(([strategy,{wins,losses,count}])=>({
      strategy, count, winRate: (wins+losses)>0?Math.round((wins/(wins+losses))*100):0
    })).sort((a,b)=>b.winRate-a.winRate);
  },[trades,accType,strategies]);

  // Require enough data: >=5 closed trades
  const eligible = byStrat.filter(s=>s.count>=5);
  if(eligible.length===0) {
    return (
      <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4">
        <div className="text-sm font-semibold mb-1">Best Strategy</div>
        <div className="text-slate-400 text-sm">Not enough data yet. Add more closed trades (≥ 5 per strategy) to compute this.</div>
      </div>
    );
  }
  const best = eligible[0];
  const size=96, stroke=10, R=(size-stroke)/2, C=2*Math.PI*R;
  const dash = C - (best.winRate/100)*C;

  return(
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4 flex items-center gap-4">
      <div className="ring" style={{'--size':`${size}px`,'--stroke':stroke}}>
        <svg width={size} height={size}>
          <circle className="bg" cx={size/2} cy={size/2} r={R} strokeWidth={stroke} fill="none"/>
          <circle className="fg" cx={size/2} cy={size/2} r={R} strokeWidth={stroke} fill="none"
                  strokeDasharray={`${C} ${C}`} strokeDashoffset={dash}/>
        </svg>
      </div>
      <div>
        <div className="text-sm font-semibold mb-1">Best Strategy</div>
        <div className="text-lg">{best.strategy}</div>
        <div className="text-slate-400 text-sm">{best.winRate}% win rate • {best.count} trades</div>
      </div>
    </div>
  );
}

function DetailedStats({trades=[],accType}){
  const rows=useMemo(()=>{
    const m={};
    for(const t of (trades||[])){
      const k=t.symbol||"N/A";
      const v=computeDollarPnL(t,accType);
      const s=m[k]||{count:0,pnl:0};
      s.count+=1; s.pnl+=(v&&isFinite(v))?v:0; m[k]=s;
    }
    return Object.entries(m).map(([sym,v])=>({sym,count:v.count,pnl:v.pnl}));
  },[trades,accType]);
  return(
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4">
      <div className="text-sm font-semibold mb-2">Detailed Statistics</div>
      <div className="table-wrap"><table className="table min-w-full text-sm">
        <thead><tr><Th>Symbol</Th><Th>Trades</Th><Th>Total P&L</Th><Th>P&L (Units)</Th></tr></thead>
        <tbody>{rows.map(r=>(
          <tr key={r.sym} className="border-t border-slate-700">
            <Td>{r.sym}</Td><Td>{r.count}</Td><Td>{formatPnlDisplay(accType,r.pnl)}</Td><Td>{formatUnits(accType,r.pnl)}</Td>
          </tr>
        ))}</tbody></table></div>
    </div>
  );
}

/* ----------------- Histories (no Notes column) ----------------- */
function Histories({trades=[],accType,onEdit,onDelete}){
  return(
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-2"><div className="text-sm font-semibold">Trade History</div></div>
      <div className="table-wrap"><table className="table min-w-full text-sm">
        <thead>
          <tr>
            <Th>Date</Th><Th>Symbol</Th><Th>Side</Th><Th>Lot size</Th>
            <Th>Entry</Th><Th>Exit</Th><Th>TP1</Th><Th>TP2</Th><Th>SL</Th>
            <Th>Exit Type</Th><Th>P&L</Th><Th>P&L (Units)</Th><Th>Status</Th><Th>Actions</Th>
          </tr>
        </thead>
        <tbody>
          {(trades||[]).map(t=>{
            const v=computeDollarPnL(t,accType);
            const status = t.status || (t.exitType && t.exitType!=="Trade In Progress" ? "CLOSED" : "OPEN");
            return (
              <tr key={t.id} className="border-t border-slate-700">
                <Td>{t.date||""}</Td><Td>{t.symbol||""}</Td><Td>{t.side||""}</Td><Td>{t.lotSize??""}</Td>
                <Td>{typeof t.entry==='number'?t.entry:""}</Td><Td>{typeof t.exit==='number'?t.exit:""}</Td>
                <Td>{typeof t.tp1==='number'?t.tp1:""}</Td><Td>{typeof t.tp2==='number'?t.tp2:""}</Td><Td>{typeof t.sl==='number'?t.sl:""}</Td>
                <Td>{t.exitType||""}</Td>
                <Td className={v>0?'text-green-400':v<0?'text-red-400':''}>{v===null?'-':formatPnlDisplay(accType,v)}</Td>
                <Td className={v>0?'text-green-400':v<0?'text-red-400':''}>{v===null?'-':formatUnits(accType,v)}</Td>
                <Td>{status}</Td>
                <Td>
                  <div className="flex gap-2">
                    <button onClick={()=>onEdit(t)} className="px-2 py-1 rounded-lg border border-slate-700 hover:bg-slate-700">✎</button>
                    <button onClick={()=>onDelete(t.id)} className="px-2 py-1 rounded-lg border border-red-700 text-red-300 hover:bg-red-900/20">✕</button>
                  </div>
                </Td>
              </tr>
            );
          })}
        </tbody>
      </table></div>
    </div>
  );
}

/* ----------------- Shell ----------------- */
function Header({logoSrc,onToggleSidebar,onExport,onLogout,onImport}){
  return(
    <div className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/70 backdrop-blur">
      <div className="flex items-center gap-3">
        <button onClick={onToggleSidebar} className="px-3 py-2 rounded-lg border border-slate-700 hover:bg-slate-800">☰</button>
        <div className="flex items-center gap-3">
          <img src={logoSrc} onError={e=>{e.currentTarget.src=LOGO_FALLBACK}} className="h-7 w-7" alt="logo"/>
          <div className="font-bold">Nitty Gritty</div>
          <span className="bg-blue-900 text-xs px-2 py-0.5 rounded-md">Trading journal</span>
        </div>
      </div>
      <UserMenu onExport={onExport} onLogout={onLogout} onImport={onImport}/>
    </div>
  );
}
function AppShell({children,capitalPanel,nav,logoSrc,onToggleSidebar,onExport,onLogout,onImport,sidebarCollapsed}){
  return(<div className="min-h-screen">
    <Header logoSrc={logoSrc} onToggleSidebar={onToggleSidebar} onExport={onExport} onLogout={onLogout} onImport={onImport}/>
    <div className="flex">
      {!sidebarCollapsed&&(<div className="w-72 shrink-0 border-r border-slate-800 min-h-[calc(100vh-56px)] p-4 space-y-4">
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4">{capitalPanel}</div>
        <div className="space-y-2">{nav}</div>
      </div>)}
      <div className="flex-1 p-4 md:p-6">{children}</div>
    </div>
  </div>);
}

/* ----------------- Login + Reset (Cloudflare Worker) ----------------- */
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
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="hidden md:flex hero items-center justify-center">
        <div className="max-w-sm text-center px-6">
          <div className="text-3xl font-semibold">Trade smart. Log smarter.</div>
          <div className="mt-3 text-slate-300">“Discipline is choosing what you want most over what you want now.”</div>
        </div>
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="w-[92vw] max-w-md bg-slate-800 border border-slate-700 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <img src={LOGO_PUBLIC} onError={e=>{e.currentTarget.src=LOGO_FALLBACK}} className="h-8 w-8" alt="logo"/><div className="text-xl font-bold">Nitty Gritty</div>
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
  );
}

function ResetModal({email,onClose}){
  const [e,setE]=useState(email||""); 
  const [msg,setMsg]=useState("");
  const [sending,setSending]=useState(false);
  const [link,setLink]=useState("");

  const start=async ()=>{
    setMsg(""); setSending(true);
    // Token kept in localStorage (client-side app). Works on the same device.
    const token=Math.random().toString(36).slice(2);
    const exp=Date.now()+1000*60*15; 
    try { localStorage.setItem(RESET_PREFIX+token,JSON.stringify({email:e,exp})); } catch {}
    const url=location.origin+location.pathname+"#reset="+token; 
    setLink(url);

    // Send via Cloudflare Worker
    const endpoint = window.CF_RESET_ENDPOINT;
    const body = {
      to: e,
      subject: "Reset your Nitty Gritty password",
      text: `Dear ${e?.split('@')[0]||"User"},\n\nWe received a request to reset your password. To reset it, please click the link below:\n\n${url}\n\nIf you didn’t request this, feel free to ignore this message.\n\nBest regards,\nNitty Gritty Journal Team`,
      html: `
        <div style="font-family:Arial,sans-serif;font-size:14px;color:#0f172a">
          <p>Dear ${e?.split('@')[0]||"User"},</p>
          <p>We received a request to reset your password. To reset it, please click the link below:</p>
          <p><a href="${url}" target="_blank">${url}</a></p>
          <p>If you didn’t request this, feel free to ignore this message.</p>
          <p>Best regards,<br/>Nitty Gritty Journal Team</p>
        </div>`
    };

    try{
      if(!endpoint){ throw new Error("Cloudflare endpoint not set. Define window.CF_RESET_ENDPOINT in index.html."); }
      const res = await fetch(endpoint,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
      if(!res.ok) throw new Error(`Reset email failed (${res.status})`);
      setMsg("Reset email sent successfully. Please check your inbox (and spam).");
    }catch(err){
      setMsg("Could not send reset email through Cloudflare: "+err.message);
    }finally{
      setSending(false);
    }
  };

  return(
    <Modal title="Password reset" onClose={onClose} maxClass="max-w-md">
      <div className="space-y-3">
        <div><label className="text-sm text-slate-300">Your email</label>
          <input value={e} onChange={ev=>setE(ev.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2" placeholder="you@nittygritty.online"/>
        </div>
        <button onClick={start} disabled={sending||!e} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50">{sending?"Sending…":"Send reset link"}</button>
        {msg&&<div className="text-sky-400 text-sm">{msg}</div>}
        {link&&<div className="text-xs break-all text-slate-300 mt-2">{link}</div>}
        <div className="text-xs text-slate-500">
          Note: As this is a client-side app, the reset token is stored on the same device where the account was created.
        </div>
      </div>
    </Modal>
  );
}

function NewPasswordModal({token,onClose}){
  const recRaw=localStorage.getItem(RESET_PREFIX+token); 
  const rec=recRaw?JSON.parse(recRaw):null;
  const [pw1,setPw1]=useState(""); const [pw2,setPw2]=useState(""); const [msg,setMsg]=useState("");
  const confirm=()=>{ 
    if(!rec||Date.now()>rec.exp){setMsg("Link expired.");return}
    if(!pw1||pw1.length<6){setMsg("Password must be at least 6 characters.");return}
    if(pw1!==pw2){setMsg("Passwords do not match.");return}
    const users=loadUsers();
    const i=users.findIndex(x=>x.email.toLowerCase()===(rec.email||"").toLowerCase()); 
    if(i>=0){
      users[i].password=pw1; saveUsers(users); 
      localStorage.removeItem(RESET_PREFIX+token); 
      setMsg("Password updated. You can close this window.");
    }else{
      setMsg("No local account for that email on this device.");
    }
  };
  return(
    <Modal title="Create new password" onClose={onClose} maxClass="max-w-md">
      <div className="space-y-3">
        <div><label className="text-sm text-slate-300">New password</label><input type="password" value={pw1} onChange={e=>setPw1(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
        <div><label className="text-sm text-slate-300">Confirm password</label><input type="password" value={pw2} onChange={e=>setPw2(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
        {msg&&<div className="text-sky-400 text-sm">{msg}</div>}
        <button onClick={confirm} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500">Update</button>
      </div>
    </Modal>
  );
}

/* ----------------- Persistence hook ----------------- */
function usePersisted(email){
  const fresh = () => ({
    name:"", email:email||"", accType:ACC_TYPES[1],
    capital:0, depositDate:todayISO(), trades:[], notes:[],
    lastLotSize:0.01,
    customSymbols:[...DEFAULT_SYMBOLS],
    customStrategies:[...DEFAULT_STRATEGIES],
    dashboardWidgets:[...DEFAULT_WIDGETS]
  });
  const [state,setState]=useState(()=>{const s=loadState(email||getCurrent());return s||fresh()});
  useEffect(()=>{const loaded = loadState(email); setState(loaded || fresh())}, [email]);
  useEffect(()=>{if(state&&state.email) saveState(state.email,state)},[state]);
  return [state,setState];
}

/* ----------------- App ----------------- */
function App(){
  const [currentEmail,setCurrentEmail]=useState(getCurrent());
  const [users,setUsers]=useState(loadUsers());
  const [state,setState]=usePersisted(currentEmail);
  const [page,setPage]=useState("dashboard");
  const [showTrade,setShowTrade]=useState(false); const [editItem,setEditItem]=useState(null);
  const [showAcct,setShowAcct]=useState(false);
  const now=new Date(); 
  const [showCal,setShowCal]=useState(false); 
  const [calView,setCalView]=useState("month"); 
  const [calMonth,setCalMonth]=useState(now.getMonth()); 
  const [calYear,setCalYear]=useState(now.getFullYear()); 
  const [calSel,setCalSel]=useState(todayISO());
  const [collapsed,setCollapsed]=useState(false);
  const [showReset,setShowReset]=useState(false); 
  const [resetToken,setResetToken]=useState("");

  // Import progress overlay
  const [importing,setImporting]=useState(false);
  const [importMsg,setImportMsg]=useState("");
  const [importProgress,setImportProgress]=useState(0);

  useEffect(()=>{
    try{
      const hash = new URLSearchParams(location.hash.slice(1));
      const tok = hash.get("reset");
      if(tok){ setResetToken(tok) }
    }catch{}
  },[]);
  useEffect(()=>{ if(state && (!state.name||!state.depositDate)) setShowAcct(true) },[state?.email]);

  // GOOGLE init
  const initGoogle=(container,onEmail)=>{
    const clientId=window.GOOGLE_CLIENT_ID;
    if(!window.google||!clientId||!container) return;
    window.google.accounts.id.initialize({client_id:clientId,callback:(resp)=>{const p=parseJwt(resp.credential); if(p&&p.email){onEmail(p.email)}}});
    window.google.accounts.id.renderButton(container,{theme:"outline",size:"large",text:"signin_with",shape:"pill"});
  };

  // Derived capital (deposit + realized since deposit date)
  const openTrades=(state?.trades||[]).filter(t=> !t.exitType || t.exitType === "Trade In Progress").length;
  const realized=(state?.trades||[]).filter(t=>t?.date && new Date(t.date)>=new Date(state?.depositDate) && t.exitType && t.exitType!=="Trade In Progress")
                   .map(t=>computeDollarPnL(t,state?.accType)).filter(v=>v!==null&&isFinite(v)).reduce((a,b)=>a+b,0);
  const effectiveCapital=(Number(state?.capital)||0)+realized;

  const onExport=()=>{
    const H=["Date","Symbol","Side","Lot Size","Entry","Exit","TP1","TP2","SL","Strategy","Exit Type","P&L","P&L (Units)","Status"];
    const rows=(state?.trades||[]).map(t=>{
      const v=computeDollarPnL(t,state?.accType);
      const units=v===null?"":formatUnits(state?.accType,v);
      const dollars=v===null?"":r2(v);
      const status = t.status || (t.exitType && t.exitType!=="Trade In Progress" ? "CLOSED" : "OPEN");
      return [
        t.date||"",t.symbol||"",t.side||"",t.lotSize??"",t.entry??"",t.exit??"",
        t.tp1??"",t.tp2??"",t.sl??"",t.strategy||"",t.exitType||"",dollars,units,status
      ];
    });
    const BOM="﻿"; const csv=[H.join(",")].concat(rows.map(r=>r.map(x=>{
      const s=(x===undefined||x===null)?"":String(x);
      return /[",\n]/.test(s)?`"${s.replace(/"/g,'""')}"`:s;
    }).join(","))).join("\n");
    const blob=new Blob([BOM+csv],{type:"text/csv;charset=utf-8;"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="Nitty_Gritty_Template_Export.csv";a.click();URL.revokeObjectURL(url);
  };

  // CSV Import with progress + robust mapping
  const onImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportMsg("Parsing file… this may take a bit depending on size.");
    setImportProgress(0);

    const reader = new FileReader();
    reader.onload = (ev) => {
      try{
        let text = ev.target.result;
        if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1); // remove BOM
        const rows = parseCSV(text);
        if(rows.length<2){ throw new Error("The CSV seems empty."); }
        const headersRaw = rows[0].map(h=>String(h||"").trim());
        const headers = headersRaw.map(h=>matchHeaderName(h)||h);

        const batchSize = 1000;
        let idx = 1;
        const acc = [];
        const total = rows.length-1;

        const work = ()=>{
          const end = Math.min(idx+batchSize, rows.length);
          for(; idx<end; idx++){
            const cols = rows[idx];
            if(!cols || cols.length===0 || cols.every(c=>String(c).trim()==="")) continue;
            const rec = {};
            for(let j=0;j<headers.length;j++){
              const H = headers[j];
              let v = cols[j];
              if(v===undefined||v==="") v = undefined;
              const num = (x)=>{ const n=parseFloat(x); return isNaN(n)?undefined:n; };
              switch(H){
                case "Date": rec.date = v; break;
                case "Symbol": rec.symbol = v; break;
                case "Side": rec.side = v; break;
                case "Lot Size": rec.lotSize = num(v); break;
                case "Entry": rec.entry = num(v); break;
                case "Exit": rec.exit = num(v); break;
                case "TP1": rec.tp1 = num(v); break;
                case "TP2": rec.tp2 = num(v); break;
                case "SL": rec.sl = num(v); break;
                case "Strategy": rec.strategy = v; break;
                case "Exit Type": rec.exitType = v; break;
                case "P&L": if(v!==undefined){ rec.pnlOverride = num(v); } break;
                case "P&L (Units)": rec.pnlUnitsOverride = v; break; // informational
                case "Status": rec.status = v; break;
                default: /* ignore */ break;
              }
            }
            if(rec.date && rec.symbol){
              rec.id = Math.random().toString(36).slice(2);
              acc.push(rec);
            }
          }
          setImportProgress(Math.round((acc.length/Math.max(1,total))*100));
          if(idx<rows.length){
            setImportMsg(`Please wait… importing ${acc.length} / ${total} rows`);
            setTimeout(work,0);
          }else{
            setState(s=>({...s, trades:[...(s?.trades||[]), ...acc]}));
            setImportMsg("Finishing up…");
            setTimeout(()=>{ setImporting(false); setImportMsg(""); setImportProgress(0); }, 400);
          }
        };
        setTimeout(work,0);
      }catch(err){
        setImportMsg("Import failed: "+err.message);
        setTimeout(()=>{ setImporting(false); }, 1200);
      }
    };
    reader.readAsText(file);
  };

  const onLogout=()=>{saveCurrent("");setCurrentEmail("")};

  const login=(email,password,setErr)=>{
    const u=(users||[]).find(x=>x.email.toLowerCase()===String(email||"").toLowerCase());
    if(!u){
      if(password==="__google__"){
        const nu=[...(users||[]),{name:email.split("@")[0],email,password:""}]; 
        setUsers(nu); saveUsers(nu); 
        const fresh={name:email.split("@")[0],email,accType:ACC_TYPES[1],capital:0,depositDate:todayISO(),trades:[],notes:[],lastLotSize:0.01,customSymbols:[...DEFAULT_SYMBOLS],customStrategies:[...DEFAULT_STRATEGIES],dashboardWidgets:[...DEFAULT_WIDGETS]}; 
        saveState(email,fresh); saveCurrent(email); setCurrentEmail(email); return;
      }
      setErr("No such user. Please sign up."); return;
    }
    if(password!=="__google__" && u.password!==password){setErr("Wrong password.");return}
    setErr(""); saveCurrent(u.email); setCurrentEmail(u.email);
  };

  const signup=(name,email,password,setErr)=>{
    if((users||[]).some(x=>x.email.toLowerCase()===String(email||"").toLowerCase())){setErr("Email already registered.");return}
    const u={name,email,password}; const nu=[...(users||[]),u]; setUsers(nu); saveUsers(nu);
    const fresh={name,email,accType:ACC_TYPES[1],capital:0,depositDate:todayISO(),trades:[],notes:[],lastLotSize:0.01,customSymbols:[...DEFAULT_SYMBOLS],customStrategies:[...DEFAULT_STRATEGIES],dashboardWidgets:[...DEFAULT_WIDGETS]}; 
    saveState(email,fresh); saveCurrent(email); setCurrentEmail(email);
  };

  const resetStart=(emailGuess)=>{ setShowReset(true) };

  const addOrUpdate=(draft)=>{
    const id=draft.id||Math.random().toString(36).slice(2); 
    const arr=(state?.trades||[]).slice(); 
    const idx=arr.findIndex(t=>t.id===id); 
    const rec={...draft,id}; 
    if(idx>=0) arr[idx]=rec; else arr.unshift(rec); 
    setState({...state,trades:arr,lastLotSize:draft.lotSize}); 
    setShowTrade(false); setEditItem(null);
  };
  const delTrade=(id)=>setState({...state,trades:(state?.trades||[]).filter(t=>t.id!==id)});

  if(resetToken){return <NewPasswordModal token={resetToken} onClose={()=>{setResetToken(""); location.hash=""}}/>}
  if(!currentEmail){return (<>
    <LoginView onLogin={login} onSignup={signup} initGoogle={initGoogle} resetStart={resetStart}/>
    {showReset&&<ResetModal email="" onClose={()=>setShowReset(false)}/>}
  </>);}

  const navBtn=(label,pageKey,Icon)=>(<button onClick={()=>setPage(pageKey)} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border ${page===pageKey?'bg-slate-700 border-slate-600':'border-slate-700 hover:bg-slate-800'}`}>{Icon?<Icon/>:null}<span>{label}</span></button>);

  const logoSrc=LOGO_PUBLIC;
  const widgets = state?.dashboardWidgets || [];
  const setWidgets = (w)=>setState({...state, dashboardWidgets:w});
  const moveWidget = (key,dir)=>{
    const arr=[...(state?.dashboardWidgets||[])];
    const i=arr.indexOf(key); if(i<0) return;
    const j=i+dir; if(j<0||j>=arr.length) return;
    [arr[i],arr[j]]=[arr[j],arr[i]];
    setWidgets(arr);
  };

  const capitalPanel=(<div>
    <div className="text-sm text-slate-300">Account Type</div>
    <div className="font-semibold mb-3">{state?.accType}</div>
    <div className="text-sm text-slate-300">Capital</div>
    <div className="text-2xl font-bold mb-1">{state?.accType==='Cent Account'?`${r2(effectiveCapital*100).toFixed(2)} ¢`:fmt$(effectiveCapital)}</div>
    <div className="text-xs text-slate-400">Deposit: {state?.depositDate}</div>
    <div className="mt-3 text-sm text-slate-300">Open trades</div><div className="text-lg font-semibold">{openTrades}</div>
    <div className="pt-2"><button onClick={()=>{setEditItem(null);setShowTrade(true)}} className="w-full px-3 py-2 rounded-lg border border-slate-700 flex items-center justify-center gap-2"><IconPlus/>Add trade</button></div>
  </div>);

  const nav=(<>
    {navBtn("Dashboard","dashboard",IconHome)}
    {navBtn("Histories","histories",IconHistory)}
    {navBtn("Notes","notes",IconNotes)}
    <button onClick={()=>{setShowCal(true);setCalView("month")}} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-700 hover:bg-slate-800"><IconCalendar/>Calendar</button>
    {navBtn("Settings","settings",IconSettings)}
  </>);

  const Dashboard = () => (
    <div className="space-y-4">
      {widgets.map(key=>{
        if(key==="General") return <GeneralStats key="w-general" trades={state?.trades} accType={state?.accType} capital={state?.capital} depositDate={state?.depositDate}/>;
        if(key==="BestStrategy") return <BestStrategy key="w-best" trades={state?.trades} accType={state?.accType} strategies={state?.customStrategies}/>;
        if(key==="Detailed") return <DetailedStats key="w-detail" trades={state?.trades} accType={state?.accType}/>;
        return null;
      })}
    </div>
  );

  return(
    <AppShell capitalPanel={capitalPanel} nav={nav} logoSrc={logoSrc}
      onToggleSidebar={()=>setCollapsed(v=>!v)} onExport={onExport} onLogout={onLogout} onImport={onImport} sidebarCollapsed={collapsed}>
      
      {page==="dashboard"&&(<Dashboard/>)}
      {page==="histories"&&(<Histories trades={state?.trades} accType={state?.accType} onEdit={t=>{setEditItem(t);setShowTrade(true)}} onDelete={delTrade}/>)}
      {page==="notes"&&(<NotesPanel notes={state?.notes} setNotes={notes=>setState({...state,notes})} trades={state?.trades} accType={state?.accType}/>)}
      {page==="settings"&&(<SettingsPanel
        name={state?.name} setName={v=>setState({...state,name:v})}
        accType={state?.accType} setAccType={v=>setState({...state,accType:v})}
        capital={state?.capital} setCapital={v=>setState({...state,capital:v||0})}
        depositDate={state?.depositDate} setDepositDate={v=>setState({...state,depositDate:v})}
        email={state?.email}
        customSymbols={state?.customSymbols||[]} setCustomSymbols={v=>setState({...state,customSymbols:v})}
        customStrategies={state?.customStrategies||[]} setCustomStrategies={v=>setState({...state,customStrategies:v})}
        widgets={widgets} setWidgets={setWidgets} moveWidget={moveWidget}
      />)}

      {showTrade&&(<TradeModal initial={editItem} onClose={()=>{setShowTrade(false);setEditItem(null)}} onSave={addOrUpdate} onDelete={delTrade} accType={state?.accType} lastLotSize={state?.lastLotSize} customSymbols={state?.customSymbols||[]} customStrategies={state?.customStrategies||[]}/>)}
      {showCal&&(<CalendarModal onClose={()=>setShowCal(false)} trades={state?.trades} view={calView} setView={setCalView} month={calMonth} setMonth={setCalMonth} year={calYear} setYear={setCalYear} selectedDate={calSel} setSelectedDate={setCalSel} accType={state?.accType}/>)}
      {showAcct&&(<Modal title="Complete your account" onClose={()=>setShowAcct(false)} maxClass="max-w-lg">
        <div className="space-y-3">
          <div className="text-sm text-slate-300">Please review Account Setup in Settings.</div>
          <button onClick={()=>{setPage("settings");setShowAcct(false)}} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500">Open Settings</button>
        </div>
      </Modal>)}
      {showReset&&(<ResetModal email="" onClose={()=>setShowReset(false)}/>)}

      {/* Import overlay */}
      {importing&&(
        <div className="import-overlay">
          <div className="import-card">
            <div className="text-lg font-semibold mb-1">Importing CSV…</div>
            <div className="text-slate-300 text-sm mb-3">{importMsg || "Please wait, the import will complete soon depending on file size."}</div>
            <div className="progress-track mb-2"><div className="progress-fill" style={{width:`${importProgress}%`}}></div></div>
            <div className="text-xs text-slate-400">{importProgress}%</div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
