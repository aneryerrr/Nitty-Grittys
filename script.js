const {useState,useMemo,useEffect,useRef} = React;

/* ========== Icons ========== */
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

/* ========== Constants & Utils ========== */
const LOGO_PUBLIC="/logo-ng.png"; const LOGO_FALLBACK="./logo-ng.png.png";
const DEFAULT_SYMBOLS=["XAUUSD","US100","US30","EURUSD","BTCUSD","AUDCAD","USDCAD","USDJPY","GBPUSD"];
const DEFAULT_STRATEGIES=["Trend Line Bounce","2 Touch Point Trend Line Break","3 / 3+ Touch Point Trend Line Break","Trend Line Break & Re-test","Trend Continuation"];
const EXIT_TYPES=["TP","SL","TP1_BE","TP1_SL","BE","Trade In Progress"];
const ACC_TYPES=["Cent Account","Dollar Account"];
const WIDGET_KEYS = ["general","best","detail"];
const MIN_BEST_STRATEGY_TRADES = 5;

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
  if (typeof t.pnlOverride === "number" && isFinite(t.pnlOverride)) return t.pnlOverride;
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
const csvSplit = (line) => {
  const out=[]; let cur=""; let q=false;
  for (let i=0;i<line.length;i++){
    const c=line[i];
    if (c==='"' ){ if (q && line[i+1]==='"'){ cur+='"'; i++; } else { q=!q; } }
    else if (c===',' && !q){ out.push(cur); cur=""; }
    else { cur+=c; }
  }
  out.push(cur);
  return out;
};
const norm = s => (s||"").toString().trim().toLowerCase().replace(/[\s\-\_\(\)\$\.]/g,'');
const parseNum = v => {
  if (v===undefined || v===null || v==="") return undefined;
  let s = String(v).trim().replace(/[$,]/g,'');
  if (s.endsWith('¢')) s = (parseFloat(s) / 100).toString();
  const n = parseFloat(s);
  return isNaN(n) ? undefined : n;
};

/* ========== Small UI atoms ========== */
function Stat({label,value}){return(<div className="card p-3"><div className="text-slate-400 text-xs">{label}</div><div className="text-2xl font-bold mt-1">{value}</div></div>)}
function Th({children,className,...rest}){return(<th {...rest} className={(className?className+" ":"")+"px-4 py-3 text-left font-semibold text-slate-300"}>{children}</th>)}
function Td({children,className,...rest}){return(<td {...rest} className={(className?className+" ":"")+"px-4 py-3 align-top"}>{children}</td>)}
function Badge({children,className}){return <span className={`badge ${className||""}`}>{children}</span>}

/* ========== Modal ========== */
function Modal({title,children,onClose,maxClass}){
  return(
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-3">
      <div className={`relative w-[95vw] ${maxClass||"max-w-3xl"} max-h-[80vh] overflow-auto card`}>
        <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-slate-800/95 backdrop-blur">
          <div className="font-semibold">{title}</div>
          <button onClick={onClose} className="btn">✕</button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}

/* ========== Settings (organized + widgets) ========== */
function SettingsPanel({
  name,setName,accType,setAccType,capital,setCapital,depositDate,setDepositDate,email,
  customSymbols,setCustomSymbols,customStrategies,setCustomStrategies,
  widgets,setWidgets
}){
  const [tab,setTab]=useState("account");
  const [pw1,setPw1]=useState(""); const [pw2,setPw2]=useState(""); const [msg,setMsg]=useState("");
  const [newSymbol,setNewSymbol]=useState(""); const [newStrategy,setNewStrategy]=useState("");

  const addSymbol=()=>{if(newSymbol.trim()){setCustomSymbols([...customSymbols,newSymbol.trim().toUpperCase()]);setNewSymbol("")}}
  const removeSymbol=(s)=>setCustomSymbols(customSymbols.filter(x=>x!==s));
  const addStrategy=()=>{if(newStrategy.trim()){setCustomStrategies([...customStrategies,newStrategy.trim()]);setNewStrategy("")}}
  const removeStrategy=(s)=>setCustomStrategies(customStrategies.filter(x=>x!==s));
  const savePw=()=>{ if(!pw1||pw1.length<6){setMsg("Password must be at least 6 characters.");return}
    if(pw1!==pw2){setMsg("Passwords do not match.");return}
    const users=loadUsers();const i=users.findIndex(u=>u.email.toLowerCase()===(email||"").toLowerCase());
    if(i>=0){users[i].password=pw1;saveUsers(users);setMsg("Password updated.");setPw1("");setPw2("")}
  };

  return(
    <div className="card p-6">
      <div className="flex items-center gap-2 mb-4"><IconSettings/><div className="font-semibold">Settings</div></div>
      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={()=>setTab("account")} className={`btn ${tab==="account"?"bg-slate-700 border-slate-600":""}`}>Account Setup</button>
        <button onClick={()=>setTab("security")} className={`btn ${tab==="security"?"bg-slate-700 border-slate-600":""}`}>Privacy & Security</button>
        <button onClick={()=>setTab("customize")} className={`btn ${tab==="customize"?"bg-slate-700 border-slate-600":""}`}>Customize Journal</button>
      </div>

      {tab==="account"&&(
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
        <div className="grid gap-6 md:grid-cols-2">
          {/* Symbols / Strategies */}
          <div className="space-y-6">
            <div>
              <div className="text-sm font-semibold mb-2">Symbols</div>
              <div className="space-y-2 mb-3 max-h-40 overflow-auto">{customSymbols.map(s=>(
                <div key={s} className="flex items-center justify-between bg-slate-900/50 p-2 rounded-lg">
                  <div>{s}</div>
                  <button onClick={()=>removeSymbol(s)} className="text-red-400">Remove</button>
                </div>
              ))}</div>
              <div className="flex gap-2">
                <input value={newSymbol} onChange={e=>setNewSymbol(e.target.value)} className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2" placeholder="e.g., NAS100"/>
                <button onClick={addSymbol} className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500">Add</button>
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold mb-2">Strategies</div>
              <div className="space-y-2 mb-3 max-h-40 overflow-auto">{customStrategies.map(s=>(
                <div key={s} className="flex items-center justify-between bg-slate-900/50 p-2 rounded-lg">
                  <div>{s}</div>
                  <button onClick={()=>removeStrategy(s)} className="text-red-400">Remove</button>
                </div>
              ))}</div>
              <div className="flex gap-2">
                <input value={newStrategy} onChange={e=>setNewStrategy(e.target.value)} className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2" placeholder="e.g., Break & Retest"/>
                <button onClick={addStrategy} className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500">Add</button>
              </div>
            </div>
          </div>

          {/* Dashboard widgets */}
          <div>
            <div className="text-sm font-semibold mb-2">Dashboard Widgets</div>
            <div className="space-y-2">
              <label className="flex items-center justify-between bg-slate-900/50 p-3 rounded-lg">
                <span>General Statistics</span>
                <input type="checkbox" checked={!!widgets.general} onChange={e=>setWidgets({...widgets,general:e.target.checked})}/>
              </label>
              <label className="flex items-center justify-between bg-slate-900/50 p-3 rounded-lg">
                <span>Best Strategy</span>
                <input type="checkbox" checked={!!widgets.best} onChange={e=>setWidgets({...widgets,best:e.target.checked})}/>
              </label>
              <label className="flex items-center justify-between bg-slate-900/50 p-3 rounded-lg">
                <span>Detailed Statistics</span>
                <input type="checkbox" checked={!!widgets.detail} onChange={e=>setWidgets({...widgets,detail:e.target.checked})}/>
              </label>
            </div>
            <div className="text-xs text-slate-400 mt-3">Only supported widgets are shown.</div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ========== Trade modal ========== */
function TradeModal({initial,onClose,onSave,onDelete,accType,lastLotSize,customSymbols,customStrategies}){
  const i=initial||{}; const [symbol,setSymbol]=useState(i.symbol||customSymbols[0]); const [side,setSide]=useState(i.side||"BUY");
  const [date,setDate]=useState(i.date||todayISO()); const [lotSize,setLotSize]=useState(i.lotSize ?? lastLotSize ?? 0.01);
  const [entry,setEntry]=useState(i.entry??""); const [exit,setExit]=useState(i.exit??"");
  const [tp1,setTp1]=useState(i.tp1??""); const [tp2,setTp2]=useState(i.tp2??""); const [sl,setSl]=useState(i.sl??"");
  const [strategy,setStrategy]=useState(i.strategy||customStrategies[0]); const [exitType,setExitType]=useState(i.exitType||"TP");
  const num=v=>(v===""||v===undefined||v===null)?undefined:parseFloat(v);
  useEffect(()=>{
    const en=num(entry), sll=num(sl); if (en===undefined||sll===undefined) return;
    const risk=side==="BUY"?en-sll:sll-en; if (risk<=0) return;
    const t1=side==="BUY"?en+risk:en-risk; const t2=side==="BUY"?en+risk*2:en-risk*2;
    setTp1(t1); setTp2(t2);
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
        <div><label className="text-sm text-slate-300">Strategy</label><select value={strategy} onChange={e=>setStrategy(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"></select></div>
        <div><label className="text-sm text-slate-300">Exit Type</label><select value={exitType} onChange={e=>setExitType(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2">{EXIT_TYPES.map(s=><option key={s}>{s}</option>)}</select></div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-slate-300">P&L preview: <span className="font-semibold">{preview}</span></div>
        <div className="flex items-center gap-2">
          {i.id&&(<button onClick={()=>onDelete(i.id)} className="px-4 py-2 rounded-lg border border-red-600 text-red-300 hover:bg-red-900/20">Delete</button>)}
          <button onClick={onClose} className="btn">Cancel</button>
          <button onClick={()=>onSave(draft)} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500">Save</button>
        </div>
      </div>
    </Modal>
  )
}

/* ========== Calendar (unchanged visuals) ========== */
function CalendarModal({onClose,trades,view,setView,month,setMonth,year,setYear,selectedDate,setSelectedDate,accType}){
  const monthNames=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']; const dayNames=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const dim=(y,m)=>new Date(y,m+1,0).getDate(); const fd=(y,m)=>new Date(y,m,1).getDay();
  const byDate=useMemo(()=>{const m={};for(const t of trades){m[t.date]=m[t.date]||[];m[t.date].push(t)}return m},[trades]);
  const pnlByDate=useMemo(()=>{const m={};for(const date in byDate){const ts=byDate[date].filter(t=>{const st=(t.status||"").toUpperCase(); return st==="CLOSED" || (t.exitType && t.exitType!=="Trade In Progress")});const pnl=ts.reduce((a,t)=>{const v=computeDollarPnL(t,accType);return a+(v||0)},0);m[date]=pnl}return m},[byDate,accType]);
  return(
    <Modal title="Calendar" onClose={onClose} maxClass="max-w-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex gap-2">{['year','month','day'].map(v=>(<button key={v} onClick={()=>setView(v)} className={`btn ${view===v?'bg-slate-700 border-slate-600':''}`}>{v.toUpperCase()}</button>))}</div>
        {view!=="day"&&(<div className="flex items-center gap-2">
          <button onClick={()=>view==='month'?(setMonth(m=>(m+11)%12),setYear(year-(month===0?1:0))):setYear(year-1)} className="btn">&lt;</button>
          <div className="text-sm">{view==='month'?`${monthNames[month]} ${year}`:year}</div>
          <button onClick={()=>view==='month'?(setMonth(m=>(m+1)%12),setYear(year+(month===11?1:0))):setYear(year+1)} className="btn">&gt;</button>
        </div>)}
      </div>
      {view==="year"&&(
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {monthNames.map((mn,i)=>(<div key={mn} className="bg-slate-900/50 border border-slate-700 rounded-lg p-1 text-sm">
            <div className="font-semibold mb-1">{mn}</div>
            <div className="text-slate-400 text-xs mb-1">Trades: {trades.filter(t=>(new Date(t.date)).getMonth()===i&&(new Date(t.date)).getFullYear()===year).length}</div>
            <button onClick={()=>{setMonth(i);setView('month')}} className="btn text-xs">Open</button>
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

/* ========== Notes (reworked) ========== */
function TradeChip({t,accType}){
  const v=(typeof t.pnlOverride==="number")?t.pnlOverride:computeDollarPnL(t,accType)||0;
  const status=(t.status||((t.exitType && t.exitType!=="Trade In Progress")?"CLOSED":"OPEN")).toUpperCase();
  const clr=v>0?'text-green-300':v<0?'text-red-300':'text-slate-300';
  return (
    <div className="flex items-center justify-between bg-slate-900/60 border border-slate-700 rounded-xl px-3 py-2">
      <div className="flex items-center gap-2">
        <Badge className="bg-blue-900/50">{t.symbol}</Badge>
        <Badge className={t.side==="BUY"?"bg-green-900/40":"bg-red-900/40"}>{t.side}</Badge>
        <Badge className="bg-slate-700/60">{t.strategy||"—"}</Badge>
      </div>
      <div className={`text-sm font-semibold ${clr}`}>{formatPnlDisplay(accType,v)} · <span className="text-slate-300">{status}</span></div>
    </div>
  );
}

function NotesPanel({notes,setNotes,trades,accType}){
  const [mode,setMode]=useState("compose"); // 'compose' or 'list'
  const [selectedDate,setSelectedDate]=useState(todayISO());
  const [text,setText]=useState("");
  const [tradeIds,setTradeIds]=useState([]);
  const [editId,setEditId]=useState(null);

  const byDate=useMemo(()=>{const m={};for(const n of notes){m[n.date]=m[n.date]||[];m[n.date].push(n)}return m},[notes]);

  const resetCompose=()=>{setSelectedDate(todayISO()); setText(""); setTradeIds([]); setEditId(null);}
  const addOrUpdateNote=()=>{const id=editId||Math.random().toString(36).slice(2);
    const rec={id,date:selectedDate,text,tradeIds:[...tradeIds]};
    const arr=[...notes]; const idx=arr.findIndex(n=>n.id===id);
    if(idx>=0) arr[idx]=rec; else arr.push(rec);
    setNotes(arr);
    resetCompose();
    setMode("list");
  };
  const discard=()=>{resetCompose(); setMode("list");}
  const editNote=(n)=>{setSelectedDate(n.date); setText(n.text); setTradeIds(n.tradeIds||[]); setEditId(n.id); setMode("compose");}
  const delNote=(id)=>setNotes(notes.filter(n=>n.id!==id));

  return(
    <div className="grid place-items-center">
      {/* Make notes area visually a bit smaller */}
      <div className="w-[92vw] max-w-3xl">
        {mode==="compose"?(
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="font-semibold">New Note</div>
              <button onClick={()=>setMode("list")} className="btn">Close</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <label className="text-sm text-slate-300">Date</label>
                <input type="date" value={selectedDate} onChange={e=>setSelectedDate(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-slate-300">Link Trades</label>
                <select multiple value={tradeIds} onChange={e=>setTradeIds(Array.from(e.target.selectedOptions,o=>o.value))} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 h-28">
                  {trades.map(t=><option key={t.id} value={t.id}>{`${t.date} · ${t.symbol} · ${t.side}`}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label className="text-sm text-slate-300">Note</label>
              <textarea value={text} onChange={e=>setText(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 h-36" placeholder="Write your observation..."/>
            </div>

            {/* Referred trades preview */}
            {tradeIds.length>0&&(
              <div className="mt-4 space-y-2">
                <div className="text-sm font-semibold">Referred Trades</div>
                <div className="grid gap-2">{tradeIds.map(id=>{
                  const t=trades.find(x=>x.id===id); if(!t) return null;
                  return <TradeChip key={id} t={t} accType={accType}/>
                })}</div>
              </div>
            )}

            <div className="flex justify-end gap-2 mt-6">
              <button onClick={discard} className="btn">Discard</button>
              <button onClick={addOrUpdateNote} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500">{editId?"Save":"Save"}</button>
            </div>
          </div>
        ):(
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Notes</div>
              <button onClick={()=>{resetCompose(); setMode("compose")}} className="btn"><IconPlus/> New</button>
            </div>
            {/* Notes list with previews */}
            <div className="space-y-3">
              {notes.length===0 ? (<div className="text-slate-400 text-sm">No notes yet.</div>) : notes.slice().reverse().map(n=>(
                <div key={n.id} className="card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-slate-300">{n.date}</div>
                    <div className="flex gap-2">
                      <button onClick={()=>editNote(n)} className="btn">Edit</button>
                      <button onClick={()=>delNote(n.id)} className="px-3 py-2 rounded-lg border border-red-700 text-red-300 hover:bg-red-900/20">Delete</button>
                    </div>
                  </div>
                  <div className="text-sm line-clamp-3">{n.text}</div>
                  {n.tradeIds&&n.tradeIds.length>0&&(
                    <div className="mt-2 grid gap-2">
                      {n.tradeIds.map(id=>{
                        const t=trades.find(x=>x.id===id); if(!t) return null;
                        return <TradeChip key={id} t={t} accType={accType}/>
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ========== Header / Shell ========== */
function UserMenu({onExport,onLogout,onImport}){
  const [open,setOpen]=useState(false);
  const fileInput = useRef(null);
  return(
    <div className="relative">
      <button onClick={()=>setOpen(v=>!v)} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-700 hover:bg-slate-800"><IconUser/></button>
      {open&&(<div className="absolute right-0 mt-2 w-52 bg-slate-800 border border-slate-700 rounded-xl shadow-lg overflow-hidden">
        <button onClick={()=>{setOpen(false);onExport()}} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-700"><IconDownload/>Export CSV</button>
        <button onClick={()=>{setOpen(false);fileInput.current.click()}} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-700"><IconUpload/>Import CSV</button>
        <input type="file" accept=".csv" ref={fileInput} onChange={onImport} style={{display:'none'}} />
        <button onClick={()=>{setOpen(false);onLogout()}} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-700 text-red-300"><IconLogout/>Logout</button>
      </div>)}
    </div>
  )
}
function Header({logoSrc,onToggleSidebar,onExport,onLogout,onImport}){
  return(<div className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/70 backdrop-blur">
    <div className="flex items-center gap-3">
      <button onClick={onToggleSidebar} className="btn">☰</button>
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
        <div className="card p-4">{capitalPanel}</div>
        <div className="space-y-2">{nav}</div>
      </div>)}
      <div className="flex-1 p-4 md:p-6">{children}</div>
    </div>
  </div>)
}

/* ========== Dashboard widgets ========== */
function GeneralStats({trades,accType,capital,depositDate}){
  const realized=trades.filter(t=>new Date(t.date)>=new Date(depositDate)&&((t.status||"").toUpperCase()==="CLOSED" || (t.exitType && t.exitType!=="Trade In Progress")));
  const pnl=realized.map(t=>computeDollarPnL(t,accType)).filter(v=>v!==null&&isFinite(v));
  const total=pnl.reduce((a,b)=>a+b,0); const wins=pnl.filter(v=>v>0).length; const losses=pnl.filter(v=>v<0).length;
  const open=trades.filter(t=>((t.status||"").toUpperCase()!=="CLOSED") && !(t.exitType && t.exitType!=="Trade In Progress")).length; const wr=(wins+losses)>0?Math.round((wins/(wins+losses))*100):0;
  return(<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
    <Stat label="Capital" value={accType==='Cent Account'?`${r2(capital*100).toFixed(2)} ¢`:fmt$(capital)}/>
    <Stat label="Realized P&L" value={formatPnlDisplay(accType,total)}/>
    <Stat label="Win Rate" value={`${wr}%`}/>
    <Stat label="Open" value={open}/>
  </div>)
}
function StrategyWinRate({trades,accType,customStrategies}){
  const closed=trades.filter(t=>((t.status||"").toUpperCase()==="CLOSED") || (t.exitType && t.exitType!=="Trade In Progress"));
  const stats=useMemo(()=>{
    const m=new Map(customStrategies.map(s=>[s,{wins:0,losses:0}]));
    closed.forEach(t=>{
      const pnl=computeDollarPnL(t,accType);
      if (!m.has(t.strategy)) m.set(t.strategy||"—",{wins:0,losses:0});
      if (pnl>0) m.get(t.strategy||"—").wins++; else if (pnl<0) m.get(t.strategy||"—").losses++;
    });
    return Array.from(m.entries()).map(([strategy,{wins,losses}])=>{
      const total=wins+losses;
      return {strategy,winRate: total>0?Math.round((wins/total)*100):0,total};
    }).filter(x=>x.total>=MIN_BEST_STRATEGY_TRADES).sort((a,b)=>b.winRate-a.winRate);
  },[trades,accType,customStrategies]);
  if (!stats.length) return null;
  const best=stats[0];
  return(
    <div className="card p-4">
      <div className="text-sm font-semibold mb-2">Best Strategy</div>
      <div className="flex items-center justify-between">
        <div className="text-lg">{best.strategy}</div>
        <div className="text-3xl font-extrabold">{best.winRate}%</div>
      </div>
      <div className="mt-2 bg-slate-900/50 rounded-full h-2">
        <div className="h-2 rounded-full" style={{width:`${best.winRate}%`, background:'linear-gradient(90deg,#22d3ee,#0ea5e9)'}}></div>
      </div>
      <div className="text-xs text-slate-400 mt-2">Based on {best.total} trades (min {MIN_BEST_STRATEGY_TRADES}).</div>
    </div>
  )
}
function DetailedStats({trades,accType}){
  const rows=useMemo(()=>{const m={};for(const t of trades){const k=t.symbol||"N/A";const v=computeDollarPnL(t,accType);const s=m[k]||{count:0,pnl:0};s.count+=1;s.pnl+=(v&&isFinite(v))?v:0;m[k]=s}return Object.entries(m).map(([sym,v])=>({sym,count:v.count,pnl:v.pnl}))},[trades,accType]);
  return(<div className="card p-4">
    <div className="text-sm font-semibold mb-2">Detailed Statistics</div>
    <div className="overflow-auto"><table className="min-w-full text-sm"><thead><tr><Th>Symbol</Th><Th>Trades</Th><Th>Total P&L</Th><Th>P&L (Units)</Th></tr></thead>
      <tbody>{rows.map(r=>(
        <tr key={r.sym} className="border-t border-slate-700">
          <Td>{r.sym}</Td><Td>{r.count}</Td><Td>{formatPnlDisplay(accType,r.pnl)}</Td><Td>{formatUnits(accType,r.pnl)}</Td>
        </tr>))}</tbody></table></div>
  </div>)
}

/* ========== Histories (no notes column; prefer imported P&L; status from CSV when present) ========== */
function Histories({trades,accType,onEdit,onDelete}){
  return(<div className="card p-4">
    <div className="flex items-center justify-between mb-2"><div className="text-sm font-semibold">Trade History</div></div>
    <div className="overflow-auto"><table className="min-w-full text-sm">
      <thead><tr>
        <Th>Date</Th><Th>Symbol</Th><Th>Side</Th><Th>Lot size</Th><Th>Entry</Th><Th>Exit</Th><Th>TP1</Th><Th>TP2</Th><Th>SL</Th><Th>Exit Type</Th><Th>P&L</Th><Th>P&L (Units)</Th><Th>Status</Th><Th>Actions</Th>
      </tr></thead>
      <tbody>{trades.map(t=>{
        const v = (typeof t.pnlOverride==="number" && isFinite(t.pnlOverride)) ? t.pnlOverride : computeDollarPnL(t,accType);
        const units = (typeof t.unitsOverride==="number" && isFinite(t.unitsOverride)) ? t.unitsOverride : (v===null?null:(accType==="Dollar Account"?r2(v):r2(v*100)));
        const status=(t.status||((t.exitType && t.exitType!=="Trade In Progress")?"CLOSED":"OPEN")).toUpperCase();
        return(<tr key={t.id} className="border-top border-slate-700">
          <Td>{t.date}</Td><Td>{t.symbol}</Td><Td>{t.side}</Td><Td>{t.lotSize}</Td>
          <Td>{typeof t.entry==='number'?t.entry:''}</Td><Td>{typeof t.exit==='number'?t.exit:''}</Td>
          <Td>{typeof t.tp1==='number'?t.tp1:''}</Td><Td>{typeof t.tp2==='number'?t.tp2:''}</Td><Td>{typeof t.sl==='number'?t.sl:''}</Td>
          <Td>{t.exitType||""}</Td>
          <Td className={v>0?'text-green-400':v<0?'text-red-400':''}>{v===null?'-':formatPnlDisplay(accType,v)}</Td>
          <Td className={v>0?'text-green-400':v<0?'text-red-400':''}>{units===null?'-':units.toFixed(2)}</Td>
          <Td>{status}</Td>
          <Td><div className="flex gap-2">
            <button onClick={()=>onEdit(t)} className="px-2 py-1 rounded-lg border border-slate-700 hover:bg-slate-700">✎</button>
            <button onClick={()=>onDelete(t.id)} className="px-2 py-1 rounded-lg border border-red-700 text-red-300 hover:bg-red-900/20">✕</button>
          </div></Td>
        </tr>)})}</tbody></table></div>
  </div>)
}

/* ========== Login / Reset ========== */
function parseJwt(token){try{return JSON.parse(atob(token.split('.')[1]))}catch{return null}}
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
      <div className="w-[92vw] max-w-md card p-6">
        <div className="flex items-center gap-3 mb-4">
          <img src={LOGO_PUBLIC} onError={e=>{e.currentTarget.src=LOGO_FALLBACK}} className="h-8 w-8"/><div className="text-xl font-bold">Nitty Gritty</div>
        </div>
        <div className="flex gap-2 mb-4">
          <button onClick={()=>setMode("login")} className={`btn flex-1 ${mode==="login"?"bg-slate-700 border-slate-600":""}`}>Login</button>
          <button onClick={()=>setMode("signup")} className={`btn flex-1 ${mode==="signup"?"bg-slate-700 border-slate-600":""}`}>Sign up</button>
        </div>
        {mode==="signup"&&(<div className="mb-3"><label className="text-sm text-slate-300">Name</label><input value={name} onChange={e=>setName(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>)}
        <div className="mb-3"><label className="text-sm text-slate-300">Email</label><input value={email} onChange={e=>setEmail(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
        <div className="mb-2">
          <label className="text-sm text-slate-300">Password</label>
          <div className="mt-1 flex gap-2">
            <input type={showPw?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/>
            <button onClick={()=>setShowPw(v=>!v)} className="btn">{showPw?"Hide":"Show"}</button>
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
function ResetModal({email,onClose,onReset}){
  const [e,setE]=useState(email||""); const [link,setLink]=useState(""); const [msg,setMsg]=useState("");
  const start=async ()=>{const users=loadUsers();const u=users.find(x=>x.email.toLowerCase()===e.toLowerCase());if(!u){setMsg("No account for that email.");return}
    const token=Math.random().toString(36).slice(2); const exp=Date.now()+1000*60*15; localStorage.setItem("ng_reset_"+token,JSON.stringify({email:e,exp}));
    const url=location.origin+location.pathname+"#reset="+token; setLink(url); 
    const first_name = (u.name||"").split(' ')[0] || "User";
    const templateParams = { to_email: e, first_name, reset_link: url, expiry_time: "15 minutes" };
    try {
      await emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams);
      setMsg('Reset email sent successfully.');
    } catch (error) {
      setMsg('Failed to send email: ' + (error?.text||''));
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

/* ========== Import progress overlay ========== */
function ImportOverlay({visible,progress,message}){
  if(!visible) return null;
  return (
    <div className="import-overlay">
      <div className="import-panel">
        <div className="flex items-center gap-3">
          <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity=".2" strokeWidth="4"/><path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="4"/></svg>
          <div className="font-semibold">Importing your trades…</div>
        </div>
        <div className="text-xs text-slate-300 mt-2">{message || "Please wait. Large files can take a few minutes. Keep this tab open."}</div>
        <div className="progress-wrap">
          <div className="progress-bar" style={{width:`${Math.min(100,Math.round(progress*100))}%`}}></div>
        </div>
      </div>
    </div>
  );
}

/* ========== App ========== */
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
  const [importing,setImporting]=useState(false); const [importProgress,setImportProgress]=useState(0); const [importMsg,setImportMsg]=useState("");

  useEffect(()=>{const hash=new URLSearchParams(location.hash.slice(1));const tok=hash.get("reset"); if(tok){setResetToken(tok)}},[]);
  useEffect(()=>{if(state&&(!state.name||!state.depositDate)) setShowAcct(true)},[state?.email]);
  useEffect(()=>{if(typeof emailjs !== 'undefined'){emailjs.init({publicKey: "YOUR_EMAILJS_PUBLIC_KEY"});}},[]); // Initialize EmailJS

  // dashboard effective capital (realized after deposit date)
  const realized=state.trades.filter(t=>new Date(t.date)>=new Date(state.depositDate)&&(((t.status||"").toUpperCase()==="CLOSED") || (t.exitType && t.exitType!=="Trade In Progress"))).map(t=>computeDollarPnL(t,state.accType)).filter(v=>v!==null&&isFinite(v)).reduce((a,b)=>a+b,0);
  const openTrades=state.trades.filter(t=>((t.status||"").toUpperCase()!=="CLOSED") && !(t.exitType && t.exitType!=="Trade In Progress")).length;
  const effectiveCapital=state.capital+realized;

  const onExport=()=>{const csv=toCSV(state.trades,state.accType);const blob=new Blob([csv],{type:"text/csv;charset=utf-8;"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="Nitty_Gritty_Template_Export.csv";a.click();URL.revokeObjectURL(url)};

  // Robust CSV import with progress, chunked parsing, header normalization
  const onImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      let text = ev.target.result;
      if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1); // remove BOM
      const lines = text.split(/\r?\n/).filter(x=>x!==undefined);
      if (lines.length < 1) return;

      const headerCells = csvSplit(lines[0]);
      const headerIndex = {};
      headerCells.forEach((h,i)=> headerIndex[norm(h)] = i);

      const idx = (aliases) => {
        for (const a of aliases) { const j=headerIndex[norm(a)]; if (j!==undefined) return j; }
        return undefined;
      };

      const map = {
        date: idx(["date","trade date"]),
        symbol: idx(["symbol","instrument","pair"]),
        side: idx(["side","direction","action"]),
        lot: idx(["lot size","lotsize","lot","volume"]),
        entry: idx(["entry","entry price","open price"]),
        exit: idx(["exit","exit price","close price"]),
        tp1: idx(["tp1","take profit 1","tp 1"]),
        tp2: idx(["tp2","take profit 2","tp 2"]),
        sl: idx(["sl","stoploss","stop loss"]),
        strategy: idx(["strategy"]),
        exitType: idx(["exit type","exittype"]),
        pnl: idx(["p&l","pl","profit","pnl"]),
        units: idx(["p&l (units)","pnl (units)","units","p&lunits"]),
        status: idx(["status"]),
        actions: idx(["actions"]) // stored if present, not rendered
      };

      const totalLines = lines.length - 1;
      const chunkSize = 500;
      let i = 1;
      const newTrades = [];

      setImporting(true);
      setImportMsg("Please wait, your file is being processed. This can take a few minutes for large files.");

      const step = () => {
        const start = i;
        const end = Math.min(lines.length, start + chunkSize);
        for (; i < end; i++) {
          const line = lines[i];
          if (!line || !line.trim()) continue;
          const cells = csvSplit(line);

          const get = (idx) => idx===undefined ? undefined : cells[idx];
          const num = (idx) => parseNum(get(idx));

          const t = {
            id: Math.random().toString(36).slice(2),
            date: get(map.date) || todayISO(),
            symbol: (get(map.symbol)||"").toString().toUpperCase() || "N/A",
            side: (get(map.side)||"BUY").toString().toUpperCase(),
            lotSize: num(map.lot) ?? 0,
            entry: num(map.entry),
            exit: num(map.exit),
            tp1: num(map.tp1),
            tp2: num(map.tp2),
            sl: num(map.sl),
            strategy: get(map.strategy) || "",
            exitType: get(map.exitType) || "",
            status: (get(map.status)||"").toString().toUpperCase() || undefined,
            // store but UI buttons override "actions"
            actionsRaw: get(map.actions)
          };

          const pnlOv = num(map.pnl);
          if (pnlOv!==undefined) t.pnlOverride = pnlOv;
          const unitsOv = num(map.units);
          if (unitsOv!==undefined) t.unitsOverride = unitsOv;

          // If status missing, infer
          if (!t.status) {
            t.status = (t.exitType && t.exitType!=="Trade In Progress") ? "CLOSED" : "OPEN";
          }
          newTrades.push(t);
        }

        setImportProgress(newTrades.length / Math.max(1,totalLines));

        if (i < lines.length) {
          setTimeout(step, 0);
        } else {
          setState({...state, trades:[...state.trades, ...newTrades]});
          setImportMsg("Finalizing import and updating your history board…");
          setTimeout(()=>{ setImporting(false); setImportProgress(0); setImportMsg(""); }, 300);
        }
      };
      step();
    };
    reader.readAsText(file);
  };

  const onLogout=()=>{saveCurrent("");setCurrentEmail("")};

  const persistUserEvent = async (payload) => {
    try {
      if (window.NG_USERS_WEBHOOK_URL) {
        await fetch(window.NG_USERS_WEBHOOK_URL, {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload)});
      } else if (typeof emailjs!=="undefined") {
        await emailjs.send('YOUR_SERVICE_ID','YOUR_USER_EVENT_TEMPLATE_ID', payload);
      }
    } catch {}
  };

  const initGoogle=(container,onEmail)=>{
    const clientId=window.GOOGLE_CLIENT_ID;
    if(!window.google||!clientId||!container) return;
    window.google.accounts.id.initialize({client_id:clientId,callback:async (resp)=>{
      const p=parseJwt(resp.credential); if(p&&p.email){await persistUserEvent({event:"login", provider:"google", email:p.email, ts:new Date().toISOString()}); onEmail(p.email)}
    }});
    window.google.accounts.id.renderButton(container,{theme:"outline",size:"large",text:"signin_with",shape:"pill"});
  };

  const login=async (email,password,setErr)=>{const u=users.find(x=>x.email.toLowerCase()===email.toLowerCase());
    if(!u){ if(password==="__google__"){const nu=[...users,{name:email.split("@")[0],email,password:""}]; setUsers(nu); saveUsers(nu);
        const fresh={name:email.split("@")[0],email,accType:ACC_TYPES[1],capital:0,depositDate:todayISO(),trades:[],notes:[],lastLotSize:0.01,customSymbols:DEFAULT_SYMBOLS,customStrategies:DEFAULT_STRATEGIES,widgets:{general:true,best:true,detail:true}};
        saveState(email,fresh); saveCurrent(email); setCurrentEmail(email);
        await persistUserEvent({event:"signup", provider:"google", email, ts:new Date().toISOString()});
        return;
      }
      setErr("No such user. Please sign up."); return;}
    if(password!=="__google__" && u.password!==password){setErr("Wrong password.");return}
    setErr(""); saveCurrent(u.email); setCurrentEmail(u.email);
    await persistUserEvent({event:"login", provider:"password", email, ts:new Date().toISOString()});
  };

  const signup=async (name,email,password,setErr)=>{if(users.some(x=>x.email.toLowerCase()===email.toLowerCase())){setErr("Email already registered.");return}
    const u={name,email,password}; const nu=[...users,u]; setUsers(nu); saveUsers(nu);
    const fresh={name,email,accType:ACC_TYPES[1],capital:0,depositDate:todayISO(),trades:[],notes:[],lastLotSize:0.01,customSymbols:DEFAULT_SYMBOLS,customStrategies:DEFAULT_STRATEGIES,widgets:{general:true,best:true,detail:true}};
    saveState(email,fresh); saveCurrent(email); setCurrentEmail(email);
    await persistUserEvent({event:"signup", provider:"password", email, name, ts:new Date().toISOString()});
  };

  const resetStart=(emailGuess)=>{setShowReset(true)};

  const addOrUpdate=(draft)=>{const id=draft.id||Math.random().toString(36).slice(2); const arr=state.trades.slice(); const idx=arr.findIndex(t=>t.id===id); const rec={...draft,id}; if(idx>=0)arr[idx]=rec; else arr.unshift(rec); setState({...state,trades:arr,lastLotSize:draft.lotSize}); setShowTrade(false); setEditItem(null)};
  const delTrade=(id)=>setState({...state,trades:state.trades.filter(t=>t.id!==id)});

  if(resetToken){return <NewPasswordModal token={resetToken} onClose={()=>{setResetToken(""); location.hash=""}}/>}
  if(!currentEmail){return <><LoginView onLogin={login} onSignup={signup} initGoogle={initGoogle} resetStart={resetStart}/>{showReset&&<ResetModal email="" onClose={()=>setShowReset(false)}/>}</>}

  // When entering Notes tab, open compose for current day
  useEffect(()=>{
    if(page==="notes"){
      // no-op: NotesPanel opens compose by default
    }
  },[page]);

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
    {navBtn("Notes","notes",IconSettings)}
    <button onClick={()=>{setShowCal(true);setCalView("month")}} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-700 hover:bg-slate-800"><IconCalendar/>Calendar</button>
    {navBtn("Settings","settings",IconSettings)}
  </>);

  const logoSrc=LOGO_PUBLIC;

  return(
    <>
      <ImportOverlay visible={importing} progress={importProgress} message={importMsg}/>
      <AppShell capitalPanel={capitalPanel} nav={nav} logoSrc={logoSrc} onToggleSidebar={()=>setCollapsed(v=>!v)} onExport={onExport} onLogout={onLogout} onImport={onImport} sidebarCollapsed={collapsed}>
        {page==="dashboard"&&(<div className="space-y-4">
          {state.widgets?.general!==false && <><div className="text-sm font-semibold">General statistics</div><GeneralStats trades={state.trades} accType={state.accType} capital={state.capital} depositDate={state.depositDate}/></>}
          {state.widgets?.best!==false && <StrategyWinRate trades={state.trades} accType={state.accType} customStrategies={state.customStrategies}/>}
          {state.widgets?.detail!==false && <DetailedStats trades={state.trades} accType={state.accType}/>}
        </div>)}
        {page==="histories"&&(<Histories trades={state.trades} accType={state.accType} onEdit={t=>{setEditItem(t);setShowTrade(true)}} onDelete={delTrade}/>)}
        {page==="notes"&&(<NotesPanel notes={state.notes} setNotes={notes=>setState({...state,notes})} trades={state.trades} accType={state.accType}/>)}
        {page==="settings"&&(<SettingsPanel
          name={state.name} setName={v=>setState({...state,name:v})}
          accType={state.accType} setAccType={v=>setState({...state,accType:v})}
          capital={state.capital} setCapital={v=>setState({...state,capital:v||0})}
          depositDate={state.depositDate} setDepositDate={v=>setState({...state,depositDate:v})}
          email={state.email}
          customSymbols={state.customSymbols} setCustomSymbols={v=>setState({...state,customSymbols:v})}
          customStrategies={state.customStrategies} setCustomStrategies={v=>setState({...state,customStrategies:v})}
          widgets={state.widgets||{general:true,best:true,detail:true}} setWidgets={w=>setState({...state,widgets:w})}
        />)}

        {showTrade&&(<TradeModal initial={editItem} onClose={()=>{setShowTrade(false);setEditItem(null)}} onSave={addOrUpdate} onDelete={delTrade} accType={state.accType} lastLotSize={state.lastLotSize} customSymbols={state.customSymbols} customStrategies={state.customStrategies}/>)}
        {showCal&&(<CalendarModal onClose={()=>setShowCal(false)} trades={state.trades} view={calView} setView={setCalView} month={calMonth} setMonth={setCalMonth} year={calYear} setYear={setCalYear} selectedDate={calSel} setSelectedDate={setCalSel} accType={state.accType}/>)}
        {showReset&&(<ResetModal email="" onClose={()=>setShowReset(false)}/>)}
      </AppShell>
    </>
  )
}

/* ========== CSV export (unchanged order expected by this app) ========== */
function toCSV(rows,accType){
  const H=["Date","Symbol","Side","Lot Size","Entry","Exit","TP1","TP2","SL","Strategy","Exit Type","P&L","P&L (Units)","Status"];
  const NL="\n"; const BOM="﻿";
  const esc=s=>{if(s===null||s===undefined)return"";const v=String(s);return /[",\n]/.test(v)?`"${v.replace(/"/g,'""')}"`:v};
  const out=[H.join(",")];
  for(const t of rows){
    const v=(typeof t.pnlOverride==="number" && isFinite(t.pnlOverride))?t.pnlOverride:computeDollarPnL(t,accType);
    const units=(typeof t.unitsOverride==="number" && isFinite(t.unitsOverride))?t.unitsOverride:(v===null?undefined:(accType==="Dollar Account"?r2(v):r2(v*100)));
    const row=[t.date,t.symbol,t.side,t.lotSize,(t.entry??""),(t.exit??""),(t.tp1??""),(t.tp2??""),(t.sl??""),t.strategy,(t.exitType||""),(v===null?"":r2(v)),(units===undefined?"":units),(t.status||((t.exitType&&t.exitType!=="Trade In Progress")?"CLOSED":"OPEN"))];
    out.push(row.map(esc).join(","));
  }
  return BOM+out.join(NL);
}

/* ========== Persisted state hook ========== */
function usePersisted(email){
  const fresh = () => ({name:"",email:email||"",accType:ACC_TYPES[1],capital:0,depositDate:todayISO(),trades:[],notes:[],lastLotSize:0.01,customSymbols:DEFAULT_SYMBOLS,customStrategies:DEFAULT_STRATEGIES,widgets:{general:true,best:true,detail:true}});
  const [state,setState]=useState(()=>{const s=loadState(email||getCurrent());return s||fresh()});
  useEffect(()=>{const loaded = loadState(email); setState(loaded || fresh());}, [email]);
  useEffect(()=>{if(!state||!state.email)return; saveState(state.email,state)},[state]);
  return [state,setState];
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
