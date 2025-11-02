const {useState,useMemo,useEffect,useRef} = React;

/* ---------- Icons ---------- */
const iconCls="h-5 w-5";
const IconUser=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Z"/><path d="M4 20a8 8 0 0 1 16 0Z"/></svg>);
const IconLogout=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M9 21h4a4 4 0 0 0 4-4V7a4 4 0 0 0-4-4H9"/><path d="M16 12H3"/><path d="M7 8l-4 4 4 4"/></svg>);
const IconDownload=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M12 3v10"/><path d="M8 11l4 4 4-4"/><path d="M5 21h14v-4H5Z"/></svg>);
const IconUpload=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M12 11V1"/><path d="M16 5L12 1 8 5"/><path d="M5 23h14V13H5z"/></svg>);
const IconCalendar=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M8 3v4M16 3v4"/><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18"/></svg>);
const IconPlus=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M12 5v14M5 12h14"/></svg>);
const IconHistory=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M12 8v5l3 3"/><path d="M12 3a9 9 0 1 0 9 9"/><path d="M21 3v6h-6"/></svg>);
const IconSettings=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.65 1.65 0  0 0 15 19.4a1.65 1.65 0  0 0-1 .6 1.65 1.65 0  0 0-.4 1V22a2 2 0  1 1-4 0v-.1a1.65 1.65 0  0 0-.4-1 1.65 1.65 0  0 0-1-.6 1.65 1.65 0  0 0-1.82.33l-.06.06a2 2 0  1 1-2.83-2.83l.06-.06A1.65 1.65 0  0 0 4.6 15a1.65 1.65 0  0 0-.6-1 1.65 1.65 0  0 0-1-.4H2a2 2 0  1 1 0-4h.1a1.65 1.65 0  0 0 1-.4 1.65 1.65 0  0 0 .6-1 1.65 1.65 0  0 0-.33-1.82l-.06-.06A2 2 0  1 1 6.24 2.9l.06.06A1.65 1.65 0  0 0 8 4.6a1.65 1.65 0  0 0 1-.6 1.65 1.65 0  0 0 .4-1V2a2 2 0  1 1 4 0v.1c0 .38.14.74.4 1 .26.26.62.4 1 .4.62 0 1.22-.25 1.64-.68l.06-.06A2 2 0  1 1 21.1 6.24l-.06.06c-.26.26-.4.62-.4 1s.14.74.4 1c.26.26.62.4 1 .4H22a2 2 0  1 1 0 4h-.1a1.65 1.65 0  0 0-1 .4 1.65 1.65 0  0 0-.6 1Z"/></svg>);
const IconHome=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9v12h14V9"/></svg>);
const IconNotes=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M4 4h16v16H4z"/><path d="M8 8h8"/><path d="M8 12h8"/><path d="M8 16h4"/></svg>);

/* ---------- Constants / Utils ---------- */
const LOGO_PUBLIC="/logo-ng.png"; const LOGO_FALLBACK="./logo-ng.png.png";
const DEFAULT_SYMBOLS=["XAUUSD","US100","US30","EURUSD","BTCUSD","AUDCAD","USDCAD","USDJPY","GBPUSD"];
const DEFAULT_STRATEGIES=["Trend Line Bounce","2 Touch Point Trend Line Break","3 / 3+ Touch Point Trend Line Break","Trend Line Break & Re-test","Trend Continuation"];
const EXIT_TYPES=["TP","SL","TP1_BE","TP1_SL","BE","Trade In Progress"];
const ACC_TYPES=["Cent Account","Dollar Account"];
const WIDGET_KEYS = ["generalStats","bestStrategy","detailedStats"]; // expandable

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
  if(t.exitType === "Trade In Progress" || (!t.exitType && t.exit===undefined)) return null;
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

/* ---------- CSV helpers ---------- */
const SPLIT_RE = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/;
const unquote = v => (v==null) ? v : String(v).replace(/^"(.*)"$/,'$1').replace(/""/g,'"');
const normalize = s => (s||"").toLowerCase().replace(/\s+/g,' ').trim();

const HEADER_MAP = [
  ["date", ["date","trade date"]],
  ["symbol", ["symbol","instrument","pair","asset"]],
  ["side", ["side","direction","action","position"]],
  ["lotSize", ["lot size","lots","volume","qty"]],
  ["entry", ["entry","entry price","open price","avg entry"]],
  ["exit", ["exit","exit price","close price","avg exit"]],
  ["tp1", ["tp1","tp 1","take profit 1","tp1 exit"]],
  ["tp2", ["tp2","tp 2","take profit 2","tp2 exit"]],
  ["sl", ["sl","stop loss","stop-loss","stoploss"]],
  ["strategy", ["strategy","setup"]],
  ["exitType", ["exit type","outcome","result","status"]],
  ["pnl$", ["p&l ($)","p&l","profit","net p&l","pnl"]],
  ["pnlUnits", ["p&l (units)","units p&l","pnl units"]],
  ["notes", ["notes","comment","remarks"]],
  ["actions", ["actions"]]
];

function mapHeaders(headerRow){
  const map = {};
  headerRow.forEach((h,idx)=>{
    const hn = normalize(unquote(h));
    for(const [key,aliases] of HEADER_MAP){
      if(aliases.includes(hn)) { map[key]=idx; break; }
    }
  });
  return map;
}

function coerceSide(v){
  const s = String(v||"").toLowerCase();
  if(["buy","long","b"].includes(s)) return "BUY";
  if(["sell","short","s"].includes(s)) return "SELL";
  return v||"";
}
function coerceExitType(v){
  const s = String(v||"").toLowerCase();
  if(["tp","take profit"].some(x=>s.includes(x))) return "TP";
  if(["sl","stop"].some(x=>s.includes(x))) return "SL";
  if(["be","break even","breakeven"].some(x=>s.includes(x))) return "BE";
  if(["in progress","open","running"].some(x=>s.includes(x))) return "Trade In Progress";
  return v||"";
}
function parseNum(v){
  if(v===undefined||v===null||String(v).trim()==="") return undefined;
  const n = Number(String(v).replace(/[^0-9.\-]/g,""));
  return isNaN(n) ? undefined : n;
}

/* ---------- Small UI atoms ---------- */
function Stat({label,value}){return(<div className="bg-slate-900/50 border border-slate-700 rounded-xl p-3"><div className="text-slate-400 text-xs">{label}</div><div className="text-2xl font-bold mt-1">{value}</div></div>)}
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

/* ---------- Settings (reorganized + widget editor) ---------- */
function SettingsPanel({
  name,setName,accType,setAccType,capital,setCapital,depositDate,setDepositDate,email,
  customSymbols,setCustomSymbols,customStrategies,setCustomStrategies,
  dashboardWidgets,setDashboardWidgets
}){
  const [tab,setTab]=useState("account");
  const [pw1,setPw1]=useState(""); const [pw2,setPw2]=useState(""); const [msg,setMsg]=useState("");
  const [symbolInput,setSymbolInput]=useState(""); const [strategyInput,setStrategyInput]=useState("");

  const savePw=()=>{ if(!pw1||pw1.length<6){setMsg("Password must be at least 6 characters.");return}
    if(pw1!==pw2){setMsg("Passwords do not match.");return}
    const users=loadUsers();const i=users.findIndex(u=>u.email.toLowerCase()===(email||"").toLowerCase());
    if(i>=0){users[i].password=pw1;saveUsers(users);setMsg("Password updated.");setPw1("");setPw2("")}
  };
  const toggleWidget=(key)=> setDashboardWidgets(prev=>({...prev,[key]:!prev[key]}));
  const addSymbol=()=>{if(symbolInput.trim()){setCustomSymbols(prev=>[...prev,symbolInput.trim()]);setSymbolInput("")}}
  const addStrategy=()=>{if(strategyInput.trim()){setCustomStrategies(prev=>[...prev,strategyInput.trim()]);setStrategyInput("")}}
  const removeSymbol=(s)=> setCustomSymbols(prev=>prev.filter(x=>x!==s));
  const removeStrategy=(s)=> setCustomStrategies(prev=>prev.filter(x=>x!==s));

  return(
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4"><IconSettings/><div className="font-semibold">Settings</div></div>
      <div className="flex gap-2 mb-4 flex-wrap">
        <button onClick={()=>setTab("account")} className={`px-3 py-1.5 rounded-lg border ${tab==="account"?"bg-slate-700 border-slate-600":"border-slate-700"}`}>Account</button>
        <button onClick={()=>setTab("security")} className={`px-3 py-1.5 rounded-lg border ${tab==="security"?"bg-slate-700 border-slate-600":"border-slate-700"}`}>Security</button>
        <button onClick={()=>setTab("customize")} className={`px-3 py-1.5 rounded-lg border ${tab==="customize"?"bg-slate-700 border-slate-600":"border-slate-700"}`}>Customize Journal</button>
      </div>

      {tab==="account"&&(
        <div className="space-y-4">
          <div><label className="text-sm text-slate-300">Name</label><input value={name} onChange={e=>setName(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className="text-sm text-slate-300">Acc Type</label>
              <select value={accType} onChange={e=>setAccType(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2">{ACC_TYPES.map(s=><option key={s}>{s}</option>)}</select>
            </div>
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
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="text-sm font-semibold mb-2">Symbols</div>
            <div className="flex flex-wrap gap-2 mb-3">{customSymbols.map(s=>(<span key={s} className="chip">{s}<button onClick={()=>removeSymbol(s)} className="text-red-400">✕</button></span>))}</div>
            <div className="flex gap-2">
              <input value={symbolInput} onChange={e=>setSymbolInput(e.target.value)} placeholder="Add symbol..." className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/>
              <button onClick={addSymbol} className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500">Add</button>
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold mb-2">Strategies</div>
            <div className="flex flex-wrap gap-2 mb-3">{customStrategies.map(s=>(<span key={s} className="chip">{s}<button onClick={()=>removeStrategy(s)} className="text-red-400">✕</button></span>))}</div>
            <div className="flex gap-2">
              <input value={strategyInput} onChange={e=>setStrategyInput(e.target.value)} placeholder="Add strategy..." className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/>
              <button onClick={addStrategy} className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500">Add</button>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="text-sm font-semibold mb-2">Dashboard Widgets</div>
            <div className="grid sm:grid-cols-3 gap-2">
              {WIDGET_KEYS.map(key=>(
                <label key={key} className="flex items-center gap-2 bg-slate-900/50 border border-slate-700 rounded-xl px-3 py-2">
                  <input type="checkbox" checked={!!dashboardWidgets[key]} onChange={()=>toggleWidget(key)} />
                  <span className="capitalize">{key.replace(/([A-Z])/g," $1")}</span>
                </label>
              ))}
            </div>
            <div className="text-xs text-slate-400 mt-2">Toggle to add/remove widgets on the dashboard.</div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ---------- Trade Modal ---------- */
function TradeModal({initial,onClose,onSave,onDelete,accType,lastLotSize,customSymbols,customStrategies}){
  const i=initial||{}; const [symbol,setSymbol]=useState(i.symbol||customSymbols[0]); const [side,setSide]=useState(i.side||"BUY");
  const [date,setDate]=useState(i.date||todayISO()); const [lotSize,setLotSize]=useState(i.lotSize ?? lastLotSize ?? 0.01);
  const [entry,setEntry]=useState(i.entry??""); const [exit,setExit]=useState(i.exit??"");
  const [tp1,setTp1]=useState(i.tp1??""); const [tp2,setTp2]=useState(i.tp2??""); const [sl,setSl]=useState(i.sl??"");
  const [strategy,setStrategy]=useState(i.strategy||customStrategies[0]); const [exitType,setExitType]=useState(i.exitType||"TP");
  const num=v=>(v===""||v===undefined||v===null)?undefined:parseFloat(v);

  useEffect(()=>{
    const en = num(entry);
    const sll = num(sl);
    if (en === undefined || sll === undefined) return;
    const risk = side === "BUY" ? en - sll : sll - en;
    if (risk <= 0) return;
    const tp1Calc = side === "BUY" ? en + risk : en - risk;
    const tp2Calc = side === "BUY" ? en + risk * 2 : en - risk * 2;
    setTp1(tp1Calc);
    setTp2(tp2Calc);
  },[entry,sl,side]);

  const draft=useMemo(()=>({id:i.id,date,symbol,side,lotSize:parseFloat(lotSize||0),entry:num(entry),exit:num(exit),tp1:num(tp1),tp2:num(tp2),sl:num(sl),strategy,exitType}),[i.id,date,symbol,side,lotSize,entry,exit,tp1,tp2,sl,strategy,exitType]);
  const preview=useMemo(()=>{const v=computeDollarPnL(draft,accType);if(v===null||!isFinite(v))return"-";return`${formatPnlDisplay(accType,v)} (${formatUnits(accType,v)})`},[draft,accType]);

  return(
    <Modal title={i.id?"Edit Trade":"Add Trade"} onClose={onClose} maxClass="max-w-4xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <div><label className="text-sm text-slate-300">Symbol</label><select value={symbol} onChange={e=>setSymbol(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2">{customSymbols.map(s=><option key={s}>{s}</option>)}</select></div>
        <div><label className="text-sm text-slate-300">Action</label><div className="mt-1 grid grid-cols-2 gap-2">{["BUY","SELL"].map(s=>(<button key={s} onClick={()=>setSide(s)} className={`px-2 py-2 rounded-lg border ${side===s ? (s==="BUY" ? "bg-green-600 border-green-500" : "bg-red-600 border-red-500") : "border-slate-700"}`}>{s}</button>))}</div></div>
        <div><label className="text-sm text-slate-300">Date</label><input type="date" value={date} onChange={e=>setDate(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
        <div><label className="text-sm text-slate-300">Lot size</label><input type="number" step="0.01" value={lotSize} onChange={e=>setLotSize(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
        <div><label className="text-sm text-slate-300">Entry price</label><input type="number" step="0.0001" value={entry} onChange={e=>setEntry(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
        <div><label className="text-sm text-slate-300">Exit Price</label><input type="number" step="0.0001" value={exit} onChange={e=>setExit(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2" placeholder="Leave blank for OPEN"/></div>
        <div><label className="text-sm text-slate-300">TP 1</label><input type="number" step="0.0001" value={tp1} onChange={e=>setTp1(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
        <div><label className="text-sm text-slate-300">TP 2</label><input type="number" step="0.0001" value={tp2} onChange={e=>setTp2(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
        <div><label className="text-sm text-slate-300">Stop-Loss</label><input type="number" step="0.0001" value={sl} onChange={e=>setSl(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
        <div><label className="text-sm text-slate-300">Strategy</label><select value={strategy} onChange={e=>setStrategy(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2">{customStrategies.map(s=><option key={s}>{s}</option>)}</select></div>
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

/* ---------- Calendar (unchanged) ---------- */
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

/* ---------- Notes (images removed, better save, compact list) ---------- */
function NotesPanel({notes,setNotes,trades,accType}){
  const [selectedDate,setSelectedDate]=useState(todayISO());
  const [text,setText]=useState("");
  const [tradeIds,setTradeIds]=useState([]);
  const [editId,setEditId]=useState(null);

  const byDate=useMemo(()=>{const m={};for(const n of notes){m[n.date]=m[n.date]||[];m[n.date].push(n)}return m},[notes]);
  const addOrUpdateNote=()=>{
    const id=editId||Math.random().toString(36).slice(2);
    const arr=[...notes];
    const idx=arr.findIndex(n=>n.id===id);
    const rec={id,date:selectedDate,text,tradeIds};
    if(idx>=0) arr[idx]=rec; else arr.push(rec);
    setNotes(arr); // parent uses functional setState to persist reliably
    setText(""); setTradeIds([]); setEditId(null);
  };
  const delNote=(id)=> setNotes(notes.filter(n=>n.id!==id));
  const editNote=(n)=>{setSelectedDate(n.date); setText(n.text); setTradeIds(n.tradeIds||[]); setEditId(n.id)};

  // Helper: preview for a linked trade
  const tradePreview = (tid)=>{
    const t = trades.find(x=>x.id===tid);
    if(!t) return null;
    const v = computeDollarPnL(t,accType);
    const status = (t.exitType && t.exitType!=="Trade In Progress") ? "CLOSED" : "OPEN";
    return <span className="chip">{t.symbol} · {t.strategy || "-"} · {status} · {v===null?"-":formatPnlDisplay(accType,v)}</span>;
  };

  return(
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4"><IconNotes/><div className="font-semibold">Notes</div></div>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <div><label className="text-sm text-slate-300">Date</label><input type="date" value={selectedDate} onChange={e=>setSelectedDate(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
          <div className="mt-3"><label className="text-sm text-slate-300">Note</label><textarea value={text} onChange={e=>setText(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 h-28"/></div>
          <div className="mt-3"><label className="text-sm text-slate-300">Link to Trades</label>
            <select multiple value={tradeIds} onChange={e=>setTradeIds(Array.from(e.target.selectedOptions,o=>o.value))} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2">
              {trades.map(t=><option key={t.id} value={t.id}>{`${t.date} ${t.symbol} ${t.side}`}</option>)}
            </select>
          </div>
          <button onClick={addOrUpdateNote} className="mt-3 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500">{editId?"Update":"Add"} Note</button>
        </div>

        <div>
          <div className="text-sm font-semibold mb-2">Notes on {selectedDate}</div>
          <div className="space-y-3">
            {(byDate[selectedDate]||[]).map(n=>(
              <div key={n.id} className="bg-slate-900/50 border border-slate-700 rounded-xl p-3">
                <details>
                  <summary className="cursor-pointer text-sm">{n.text.slice(0,80) || "(empty)"}{n.text.length>80?"…":""}</summary>
                  <div className="text-sm mt-2">{n.text||"(empty)"}</div>
                  {n.tradeIds&&n.tradeIds.length>0&&(
                    <div className="mt-2 flex flex-wrap gap-2">
                      {n.tradeIds.map(tid=><span key={tid}>{tradePreview(tid)}</span>)}
                    </div>
                  )}
                  <div className="flex gap-2 mt-3">
                    <button onClick={()=>editNote(n)} className="text-blue-400">Edit</button>
                    <button onClick={()=>delNote(n.id)} className="text-red-400">Delete</button>
                  </div>
                </details>
              </div>
            ))}
            {((byDate[selectedDate]||[]).length===0)&&(<div className="text-slate-400 text-sm">No notes for this date.</div>)}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- User menu with Import/Export ---------- */
function UserMenu({onExport,onLogout,onImport}){
  const [open,setOpen]=useState(false);
  const fileInput = useRef(null);
  return(
    <div className="relative">
      <button onClick={()=>setOpen(v=>!v)} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-700 hover:bg-slate-800"><IconUser/></button>
      {open&&(<div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-lg overflow-hidden">
        <button onClick={()=>{setOpen(false);onExport()}} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-700"><IconDownload/>Export CSV</button>
        <button onClick={()=>{setOpen(false);fileInput.current.click()}} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-700"><IconUpload/>Import CSV</button>
        <input type="file" accept=".csv" ref={fileInput} onChange={onImport} style={{display: 'none'}} />
        <button onClick={()=>{setOpen(false);onLogout()}} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-700 text-red-300"><IconLogout/>Logout</button>
      </div>)}
    </div>
  )
}

/* ---------- General Stats ---------- */
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

/* ---------- Best Strategy (threshold + modern metric) ---------- */
function BestStrategy({trades,accType,strategies,thresholdCount=5,thresholdWR=55}){
  const closed=trades.filter(t=>t.exitType && t.exitType !== "Trade In Progress");
  const stats=useMemo(()=>{
    const m=new Map();
    for(const s of strategies) m.set(s,{w:0,l:0,c:0});
    for(const t of closed){
      const pnl = computeDollarPnL(t,accType);
      const b = m.get(t.strategy)||{w:0,l:0,c:0};
      b.c++; if(pnl>0) b.w++; else if(pnl<0) b.l++;
      m.set(t.strategy,b);
    }
    const rows=[...m.entries()].map(([strategy,{w,l,c}])=>{
      const wr = (w+l)>0? Math.round(100*w/(w+l)) : 0;
      return {strategy,w,l,c,wr};
    }).filter(r=>r.c>=thresholdCount && r.wr>=thresholdWR).sort((a,b)=>b.wr-a.wr || b.c-a.c);
    return rows;
  },[trades,accType,strategies,thresholdCount,thresholdWR]);

  if(stats.length===0) return null;
  const best=stats[0];

  return(
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4">
      <div className="text-sm font-semibold mb-2">Best Strategy</div>
      <div className="flex items-center gap-4">
        <div className="relative h-20 w-20">
          <svg viewBox="0 0 36 36" className="h-20 w-20">
            <path d="M18 2 a 16 16 0 1 1 0 32 a 16 16 0 1 1 0 -32" fill="none" stroke="#1f2937" strokeWidth="4"/>
            <path d="M18 2 a 16 16 0 1 1 0 32" fill="none" stroke="url(#g1)" strokeWidth="4" strokeDasharray={`${best.wr},100`} />
            <defs><linearGradient id="g1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#60a5fa"/><stop offset="100%" stopColor="#22d3ee"/></linearGradient></defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-lg font-bold">{best.wr}%</div>
        </div>
        <div>
          <div className="text-lg font-semibold">{best.strategy}</div>
          <div className="text-slate-400 text-sm">{best.c} trades · {best.w} wins / {best.l} losses</div>
        </div>
      </div>
    </div>
  )
}

/* ---------- Detailed Stats ---------- */
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

/* ---------- Histories (Notes column removed) ---------- */
function Histories({trades,accType,onEdit,onDelete}){
  return(<div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4">
    <div className="flex items-center justify-between mb-2"><div className="text-sm font-semibold">Trade History</div></div>
    <div className="overflow-auto"><table className="min-w-full text-sm">
      <thead><tr>
        <Th>Date</Th><Th>Symbol</Th><Th>Side</Th><Th>Lot size</Th><Th>Entry</Th><Th>Exit</Th>
        <Th>TP1</Th><Th>TP2</Th><Th>SL</Th><Th>Exit Type</Th><Th>P&L</Th><Th>P&L (Units)</Th><Th>Status</Th><Th>Actions</Th>
      </tr></thead>
      <tbody>{trades.map(t=>{
        const v=computeDollarPnL(t,accType);
        const closed= t.exitType && t.exitType !== "Trade In Progress";
        return(<tr key={t.id} className="border-t border-slate-700">
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

/* ---------- Header / Shell ---------- */
function Header({logoSrc,onToggleSidebar,onExport,onLogout,onImport}){
  return(<div className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/70 backdrop-blur">
    <div className="flex items-center gap-3">
      <button onClick={onToggleSidebar} className="px-3 py-2 rounded-lg border border-slate-700 hover:bg-slate-800">☰</button>
      <div className="flex items-center gap-3">
        <img src={logoSrc} onError={e=>{e.currentTarget.src=LOGO_FALLBACK}} className="h-7 w-7"/>
        <div className="font-bold">Nitty Gritty</div>
        <span className="bg-blue-900 text-xs px-2 py-0.5 rounded-md">Trading journal</span>
      </div>
    </div>
    <UserMenu onExport={onExport} onLogout={onLogout} onImport={onImport}/>
  </div>)
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
  </div>)
}

/* ---------- Login + Reset (Cloudflare-based) ---------- */
function parseJwt(token){try{return JSON.parse(atob(token.split('.')[1]))}catch{return null}}

function ResetModal({email,onClose}){
  const [e,setE]=useState(email||""); 
  const [msg,setMsg]=useState("");
  const [progress,setProgress]=useState("");

  const start=async ()=>{
    setMsg(""); setProgress("Requesting reset…");
    try{
      const res = await fetch(`${window.CLOUDFLARE_API_BASE}/request-reset`,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          email:e,
          // Worker uses this to build the link inside your domain:
          siteBase:"https://nittygritty.online"
        })
      });
      if(!res.ok){ const t = await res.text(); throw new Error(t||"Request failed"); }
      setProgress("");
      setMsg("Reset email sent. Check your inbox.");
    }catch(err){
      setProgress("");
      setMsg(`Failed to send reset: ${err.message||err}`);
    }
  };

  return(<Modal title="Password reset" onClose={onClose} maxClass="max-w-md">
    <div className="space-y-3">
      <div><label className="text-sm text-slate-300">Your email</label><input value={e} onChange={ev=>setE(ev.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
      <button onClick={start} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500">Send reset link</button>
      {progress&&<div className="text-slate-300 text-sm">{progress}</div>}
      {msg&&<div className="text-sky-400 text-sm">{msg}</div>}
    </div>
  </Modal>)
}

function NewPasswordModal({token,onClose}){
  const [ok,setOk]=useState(false);
  const [pw1,setPw1]=useState(""); const [pw2,setPw2]=useState(""); const [msg,setMsg]=useState("");

  useEffect(()=>{
    (async()=>{
      try{
        const r = await fetch(`${window.CLOUDFLARE_API_BASE}/verify-reset?token=${encodeURIComponent(token)}`);
        setOk(r.ok);
      }catch{ setOk(false); }
    })();
  },[token]);

  const confirm=async()=>{
    if(!ok){setMsg("Link invalid or expired.");return}
    if(!pw1||pw1.length<6){setMsg("Password must be at least 6 characters.");return}
    if(pw1!==pw2){setMsg("Passwords do not match.");return}

    try{
      // Consume token server-side (invalidate) – optional but recommended:
      await fetch(`${window.CLOUDFLARE_API_BASE}/consume-reset`,{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({token})
      });

      // Update local store password for the referenced email (the Worker includes email in token state)
      const r = await fetch(`${window.CLOUDFLARE_API_BASE}/token-email?token=${encodeURIComponent(token)}`);
      if(!r.ok){setMsg("Unable to resolve token email.");return}
      const {email} = await r.json();
      const users=loadUsers();const i=users.findIndex(x=>x.email.toLowerCase()===String(email||"").toLowerCase());
      if(i>=0){users[i].password=pw1;saveUsers(users); setMsg("Password updated.");}
      else { setMsg("Account not found in this browser."); }
    }catch(err){
      setMsg("Error finalizing reset.");
    }
  };

  return(<Modal title="Create new password" onClose={onClose} maxClass="max-w-md">
    <div className="space-y-3">
      {!ok&&<div className="text-red-400 text-sm">Validating link…</div>}
      <div><label className="text-sm text-slate-300">New password</label><input type="password" value={pw1} onChange={e=>setPw1(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
      <div><label className="text-sm text-slate-300">Confirm password</label><input type="password" value={pw2} onChange={e=>setPw2(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
      {msg&&<div className="text-sky-400 text-sm">{msg}</div>}
      <button onClick={confirm} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500">Update</button>
    </div>
  </Modal>)
}

function LoginView({onLogin,onSignup,initGoogle,resetOpen}){
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
        <div className="text-right text-sm mb-4"><button onClick={()=>resetOpen(email)} className="text-blue-400 hover:underline">Forgot password?</button></div>
        {mode==="signup"&&(<div className="mb-4"><label className="text-sm text-slate-300">Confirm Password</label><input type={showPw?"text":"password"} value={confirm} onChange={e=>setConfirm(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>)}
        {err&&<div className="text-red-400 text-sm mb-3">{err}</div>}
        <div className="flex items-center justify-between">
          <div ref={googleDiv}></div>
          <button onClick={submit} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500">Continue</button>
        </div>
      </div>
    </div>
  </div>)
}

/* ---------- App ---------- */
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
  const [importUI,setImportUI]=useState({visible:false,text:"",pct:0});

  useEffect(()=>{const hash=new URLSearchParams(location.hash.slice(1));const tok=hash.get("reset"); if(tok){setResetToken(tok)}},[]);
  useEffect(()=>{if(state&&(!state.name||!state.depositDate)) setShowAcct(true)},[state?.email]);

  // optional: preload Turnstile or other CF widgets if you add later

  const openTrades=state.trades.filter(t=> !t.exitType || t.exitType === "Trade In Progress").length;
  const realized=state.trades.filter(t=>new Date(t.date)>=new Date(state.depositDate)&&t.exitType && t.exitType !== "Trade In Progress").map(t=>computeDollarPnL(t,state.accType)).filter(v=>v!==null&&isFinite(v)).reduce((a,b)=>a+b,0);
  const effectiveCapital=state.capital+realized;

  const toCSV=(rows,accType)=>{
    const H=["Date","Symbol","Side","Lot Size","Entry","Exit","TP1","TP2","SL","Strategy","Exit Type","P&L ($)","P&L (Units)"];
    const NL="\n", BOM="﻿";
    const esc=s=>{if(s===null||s===undefined)return"";const v=String(s);return /[",\n]/.test(v)?`"${v.replace(/"/g,'""')}"`:v};
    const out=[H.join(",")];
    for(const t of rows){
      const v=computeDollarPnL(t,accType); const units=v===null?"":formatUnits(accType,v);
      const dollars=v===null?"":r2(v);
      const row=[t.date,t.symbol,t.side,t.lotSize,(t.entry??""),(t.exit??""),(t.tp1??""),(t.tp2??""),(t.sl??""),t.strategy,(t.exitType||""),dollars,units];
      out.push(row.map(esc).join(","));
    }
    return BOM+out.join(NL);
  };

  const onExport=()=>{const csv=toCSV(state.trades,state.accType);const blob=new Blob([csv],{type:"text/csv;charset=utf-8;"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="Nitty_Gritty_Template_Export.csv";a.click();URL.revokeObjectURL(url)};

  // --- CSV Import (robust + progress overlay, compute P&L if missing) ---
  const showImportOverlay=(text,pct)=>{setImportUI({visible:true,text,pct});document.getElementById("import-overlay").style.display="flex";document.getElementById("impbar").style.width=`${pct}%`;document.getElementById("imptext").textContent=text;}
  const hideImportOverlay=()=>{setImportUI({visible:false,text:"",pct:0});document.getElementById("import-overlay").style.display="none";}

  const onImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      let text = ev.target.result;
      if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1); // remove BOM
      const lines = text.split(/\r?\n/).filter(l=>l.trim().length>0);
      if (lines.length < 2) return;

      // User-facing notice for large files
      showImportOverlay("Please wait, importing… Large files can take a few minutes.", 2);

      const headers = lines[0].split(SPLIT_RE);
      const map = mapHeaders(headers);

      const newTrades = [];
      const total = lines.length-1;
      const batchSize = 500;
      for(let i=1;i<lines.length;i++){
        const line = lines[i];
        if(!line.trim()) continue;
        const cols = line.split(SPLIT_RE).map(unquote);
        const get = key => cols[map[key]];

        const t = {};
        t.date = get("date") || todayISO();
        t.symbol = get("symbol") || "";
        t.side = coerceSide(get("side")||"");
        t.lotSize = parseNum(get("lotSize")) ?? 0.01;
        t.entry = parseNum(get("entry"));
        t.exit = parseNum(get("exit"));
        t.tp1 = parseNum(get("tp1"));
        t.tp2 = parseNum(get("tp2"));
        t.sl = parseNum(get("sl"));
        t.strategy = get("strategy") || "";
        t.exitType = coerceExitType(get("exitType") || "");
        const statusHint = (get("exitType")||get("actions")||"").toLowerCase();
        if(!t.exitType){
          if(statusHint.includes("open")) t.exitType = "Trade In Progress";
          else if(t.exit!==undefined) t.exitType="TP";
        }
        if(!t.exitType && t.exit===undefined) t.exitType="Trade In Progress";

        // P&L: prefer CSV value if present, else compute
        const csvPnl = parseNum(get("pnl$"));
        const pnlUnits = parseNum(get("pnlUnits"));
        if(csvPnl!==undefined && isFinite(csvPnl)){
          t._importPnl = csvPnl; // store for display; computeDollarPnL will still compute but we will override in table
        } else {
          t._importPnl = null;
        }
        t._importUnits = (pnlUnits!==undefined && isFinite(pnlUnits)) ? pnlUnits : null;

        if (t.date && t.symbol) {
          t.id = Math.random().toString(36).slice(2);
          newTrades.push(t);
        }

        // progress chunking
        if(i%batchSize===0){ 
          const pct = Math.min(98, Math.round(100*i/lines.length));
          showImportOverlay(`Processing ${i}/${lines.length} rows…`, pct);
          await new Promise(r=>setTimeout(r,0)); // yield to UI
        }
      }
      // Merge and close overlay
      setState(s=>({...s, trades:[...s.trades, ...newTrades]}));
      showImportOverlay("Finalizing…", 99);
      setTimeout(()=>hideImportOverlay(), 400);
    };
    reader.readAsText(file);
  };

  const onLogout=()=>{saveCurrent("");setCurrentEmail("")};

  const initGoogle=(container,onEmail)=>{
    const clientId=window.GOOGLE_CLIENT_ID;
    if(!window.google||!clientId||!container) return;
    window.google.accounts.id.initialize({client_id:clientId,callback:(resp)=>{const p=parseJwt(resp.credential); if(p&&p.email){onEmail(p.email)}}});
    window.google.accounts.id.renderButton(container,{theme:"outline",size:"large",text:"signin_with",shape:"pill"});
  };

  const login=(email,password,setErr)=>{const u=users.find(x=>x.email.toLowerCase()===email.toLowerCase());
    if(!u){ if(password==="__google__"){const nu=[...users,{name:email.split("@")[0],email,password:""}]; setUsers(nu); saveUsers(nu); const fresh={name:email.split("@")[0],email,accType:ACC_TYPES[1],capital:0,depositDate:todayISO(),trades:[],notes:[],lastLotSize:0.01,customSymbols:DEFAULT_SYMBOLS,customStrategies:DEFAULT_STRATEGIES,dashboardWidgets:{generalStats:true,bestStrategy:true,detailedStats:true}}; saveState(email,fresh); saveCurrent(email); setCurrentEmail(email); return;}
      setErr("No such user. Please sign up."); return;}
    if(password!=="__google__" && u.password!==password){setErr("Wrong password.");return}
    setErr(""); saveCurrent(u.email); setCurrentEmail(u.email);
  };

  const signup=(name,email,password,setErr)=>{if(users.some(x=>x.email.toLowerCase()===email.toLowerCase())){setErr("Email already registered.");return}
    const u={name,email,password}; const nu=[...users,u]; setUsers(nu); saveUsers(nu);
    const fresh={name,email,accType:ACC_TYPES[1],capital:0,depositDate:todayISO(),trades:[],notes:[],lastLotSize:0.01,customSymbols:DEFAULT_SYMBOLS,customStrategies:DEFAULT_STRATEGIES,dashboardWidgets:{generalStats:true,bestStrategy:true,detailedStats:true}}; saveState(email,fresh); saveCurrent(email); setCurrentEmail(email);
  };

  const addOrUpdate=(draft)=>{const id=draft.id||Math.random().toString(36).slice(2); const arr=state.trades.slice(); const idx=arr.findIndex(t=>t.id===id); const rec={...draft,id}; if(idx>=0)arr[idx]=rec; else arr.unshift(rec); setState(s=>({...s,trades:arr,lastLotSize:draft.lotSize})); setShowTrade(false); setEditItem(null)};
  const delTrade=(id)=>setState(s=>({...s,trades:s.trades.filter(t=>t.id!==id)}));

  const navBtn=(label,pageKey,Icon)=>(<button onClick={()=>setPage(pageKey)} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border ${page===pageKey?'bg-slate-700 border-slate-600':'border-slate-700 hover:bg-slate-800'}`}>{Icon?<Icon/>:null}<span>{label}</span></button>);

  if(resetToken){return <NewPasswordModal token={resetToken} onClose={()=>{setResetToken(""); location.hash=""}}/>}
  if(!currentEmail){
    return (<>
      <LoginView onLogin={login} onSignup={signup} initGoogle={initGoogle} resetOpen={()=>setShowReset(true)}/>
      {showReset&&<ResetModal email="" onClose={()=>setShowReset(false)}/>}
      {/* Import overlay root (also used when not logged in if user triggers import) */}
      <div id="import-overlay">
        <div className="import-card">
          <div className="text-lg font-semibold mb-2">Importing CSV…</div>
          <div id="imptext" className="text-slate-300 text-sm mb-3">Please wait, importing…</div>
          <div className="progress"><div id="impbar"></div></div>
        </div>
      </div>
    </>);
  }

  const logoSrc=LOGO_PUBLIC;
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
    {navBtn("Notes","notes",IconNotes)}
    <button onClick={()=>{setShowCal(true);setCalView("month")}} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-700 hover:bg-slate-800"><IconCalendar/>Calendar</button>
    {navBtn("Settings","settings",IconSettings)}
  </>);

  return(<AppShell capitalPanel={capitalPanel} nav={nav} logoSrc={logoSrc} onToggleSidebar={()=>setCollapsed(v=>!v)} onExport={onExport} onLogout={onLogout} onImport={onImport} sidebarCollapsed={collapsed}>
    {page==="dashboard"&&(<div className="space-y-4">
      <div className="text-sm font-semibold">Dashboard</div>
      {state.dashboardWidgets?.generalStats && <GeneralStats trades={state.trades} accType={state.accType} capital={state.capital} depositDate={state.depositDate}/>}
      {state.dashboardWidgets?.bestStrategy && <BestStrategy trades={state.trades} accType={state.accType} strategies={state.customStrategies}/>}
      {state.dashboardWidgets?.detailedStats && <DetailedStats trades={state.trades} accType={state.accType}/>}
    </div>)}

    {page==="histories"&&(<Histories trades={state.trades} accType={state.accType} onEdit={t=>{setEditItem(t);setShowTrade(true)}} onDelete={delTrade}/>)}

    {page==="notes"&&(<NotesPanel notes={state.notes} setNotes={(notes)=>setState(s=>({...s,notes}))} trades={state.trades} accType={state.accType}/>)}

    {page==="settings"&&(<SettingsPanel
      name={state.name} setName={v=>setState(s=>({...s,name:v}))}
      accType={state.accType} setAccType={v=>setState(s=>({...s,accType:v}))}
      capital={state.capital} setCapital={v=>setState(s=>({...s,capital:v||0}))}
      depositDate={state.depositDate} setDepositDate={v=>setState(s=>({...s,depositDate:v}))}
      email={state.email}
      customSymbols={state.customSymbols} setCustomSymbols={v=>setState(s=>({...s,customSymbols:v}))}
      customStrategies={state.customStrategies} setCustomStrategies={v=>setState(s=>({...s,customStrategies:v}))}
      dashboardWidgets={state.dashboardWidgets || {generalStats:true,bestStrategy:true,detailedStats:true}}
      setDashboardWidgets={(dw)=>setState(s=>({...s,dashboardWidgets:dw}))}
    />)}

    {showTrade&&(<TradeModal initial={editItem} onClose={()=>{setShowTrade(false);setEditItem(null)}} onSave={addOrUpdate} onDelete={delTrade} accType={state.accType} lastLotSize={state.lastLotSize} customSymbols={state.customSymbols} customStrategies={state.customStrategies}/>)}
    {showCal&&(<CalendarModal onClose={()=>setShowCal(false)} trades={state.trades} view={calView} setView={setCalView} month={calMonth} setMonth={setCalMonth} year={calYear} setYear={setCalYear} selectedDate={calSel} setSelectedDate={setCalSel} accType={state.accType}/>)}
    {showReset&&(<ResetModal email="" onClose={()=>setShowReset(false)}/>)}

    {/* Import overlay root */}
    <div id="import-overlay">
      <div className="import-card">
        <div className="text-lg font-semibold mb-2">Importing CSV…</div>
        <div id="imptext" className="text-slate-300 text-sm mb-3">Please wait, importing… Large files can take a few minutes.</div>
        <div className="progress"><div id="impbar"></div></div>
      </div>
    </div>
  </AppShell>)
}

/* ---------- Persistence hook (augmented with widgets) ---------- */
function usePersisted(email){
  const fresh = () => ({
    name:"",email:email||"",accType:ACC_TYPES[1],capital:0,depositDate:todayISO(),
    trades:[],notes:[],lastLotSize:0.01,
    customSymbols:DEFAULT_SYMBOLS,customStrategies:DEFAULT_STRATEGIES,
    dashboardWidgets:{generalStats:true,bestStrategy:true,detailedStats:true}
  });
  const [state,setState]=useState(()=>{const s=loadState(email||getCurrent());return s||fresh()});
  useEffect(()=>{const loaded = loadState(email);setState(loaded || fresh())}, [email]);
  useEffect(()=>{if(!state||!state.email) return; saveState(state.email,state)},[state]);
  return [state,setState];
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
