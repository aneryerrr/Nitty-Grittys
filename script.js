const {useState,useMemo,useEffect,useRef} = React;

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

const LOGO_PUBLIC="/logo-ng.png"; const LOGO_FALLBACK="./logo-ng.png.png";
const DEFAULT_SYMBOLS=["XAUUSD","US100","US30","EURUSD","BTCUSD","AUDCAD","USDCAD","USDJPY","GBPUSD"];
const DEFAULT_STRATEGIES=["Trend Line Bounce","2 Touch Point Trend Line Break","3 / 3+ Touch Point Trend Line Break","Trend Line Break & Re-test","Trend Continuation"];
const EXIT_TYPES=["TP","SL","TP1_BE","TP1_SL","BE","Trade In Progress"];
const ACC_TYPES=["Cent Account","Dollar Account"];

const r2=n=>Math.round(n*100)/100;
const fmt$=n=>"$"+(isFinite(n)?r2(n):0).toFixed(2);
const todayISO=()=>{const d=new Date();const tz=d.getTimezoneOffset();return new Date(d.getTime()-tz*60000).toISOString().slice(0,10)};

/* ----------------- Storage helpers ----------------- */
const USERS_KEY="ng_users_v1";
const CURR_KEY="ng_current_user_v1";
const loadUsers=()=>{try{return JSON.parse(localStorage.getItem(USERS_KEY)||"[]")}catch{return[]}};
const saveUsers=u=>{try{localStorage.setItem(USERS_KEY,JSON.stringify(u))}catch{}};
const saveCurrent=e=>{try{localStorage.setItem(CURR_KEY,e)}catch{}};
const getCurrent=()=>{try{return localStorage.getItem(CURR_KEY)||""}catch{return""}};
const loadState=e=>{try{return JSON.parse(localStorage.getItem("ng_state_"+e)||"null")}catch{return null}};
const saveState=(e,s)=>{try{localStorage.setItem("ng_state_"+e,JSON.stringify(s))}catch{}};

/* ----------------- P&L math ----------------- */
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
const formatUnits=(accType,v,override)=>{
  if (override !== undefined && override !== null && override !== "") return String(override);
  return accType==="Dollar Account"?r2(v).toFixed(2):r2(v*100).toFixed(2);
};

/* ----------------- CSV utils ----------------- */
const headerAliases = {
  Date:['Date','date','Trade Date'],
  Symbol:['Symbol','Instrument','Pair','Ticker'],
  Side:['Side','Direction','Action'],
  LotSize:['Lot Size','Lots','Qty','Quantity'],
  Entry:['Entry','Entry Price','Entry price','Open'],
  Exit:['Exit','Exit Price','Exit price','Close'],
  TP1:['TP1','TP 1','Take Profit 1'],
  TP2:['TP2','TP 2','Take Profit 2'],
  SL:['SL','Stop Loss','Stop-Loss'],
  Strategy:['Strategy','Setup','Playbook'],
  ExitType:['Exit Type','ExitType','Outcome','Outcome Type'],
  PnL:['P&L','P&L ($)','PnL','Profit','Profit ($)'],
  Units:['P&L (Units)','Units','Pips','Points'],
  Status:['Status','Trade Status']
};
function normalizeHeaders(hs){
  const map={};
  for(const [norm,alts] of Object.entries(headerAliases)){
    for(const h of hs){
      if(alts.map(a=>a.toLowerCase()).includes(h.trim().toLowerCase())){map[norm]=h;break;}
    }
  }
  return map;
}
function parseCSV(text){
  // Simple RFC4180-ish parser
  const rows=[]; let i=0, field='', row=[], inQ=false;
  const pushField=()=>{row.push(field);field=''};
  const pushRow=()=>{rows.push(row);row=[]};
  while(i<text.length){
    const c=text[i];
    if(inQ){
      if(c==='"' && text[i+1]==='"'){field+='"'; i+=2; continue;}
      if(c==='"' ){inQ=false;i++;continue;}
      field+=c; i++; continue;
    }else{
      if(c==='\"'){inQ=true;i++;continue;}
      if(c===','){pushField();i++;continue;}
      if(c==='\n'){pushField();pushRow();i++;continue;}
      if(c==='\r'){i++;continue;}
      field+=c; i++; continue;
    }
  }
  if(field!==''||row.length){pushField();pushRow()}
  return rows;
}
function toNumberOr(s){
  if(s===undefined||s===null||s==='') return undefined;
  const n=parseFloat(String(s).replace(/[^0-9\.\-]/g,'')); return isNaN(n)?undefined:n;
}

/* ----------------- Small UI atoms ----------------- */
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

/* ----------------- Settings (organized + widgets) ----------------- */
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
  const WidgetToggle = ({id,label})=>(
    <label className="flex items-center justify-between bg-slate-900/50 border border-slate-700 rounded-xl px-3 py-2">
      <span>{label}</span>
      <input type="checkbox" checked={!!widgets[id]} onChange={e=>setWidgets({...widgets,[id]:e.target.checked})}/>
    </label>
  );
  return(
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4"><IconSettings/><div className="font-semibold">Settings</div></div>
      <div className="flex gap-2 mb-4">
        <button onClick={()=>setTab("account")} className={`px-3 py-1.5 rounded-lg border ${tab==="account"?"bg-slate-700 border-slate-600":"border-slate-700"}`}>Account</button>
        <button onClick={()=>setTab("security")} className={`px-3 py-1.5 rounded-lg border ${tab==="security"?"bg-slate-700 border-slate-600":"border-slate-700"}`}>Security</button>
        <button onClick={()=>setTab("customize")} className={`px-3 py-1.5 rounded-lg border ${tab==="customize"?"bg-slate-700 border-slate-600":"border-slate-700"}`}>Customize Journal</button>
      </div>

      {tab==="account" && (
        <div className="space-y-4">
          <div><label className="text-sm text-slate-300">Name</label><input value={name} onChange={e=>setName(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className="text-sm text-slate-300">Acc Type</label>
              <select value={accType} onChange={e=>setAccType(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2">{ACC_TYPES.map(s=><option key={s}>{s}</option>)}</select>
            </div>
            <div><label className="text-sm text-slate-300">Account Capital ($)</label>
              <input type="number" value={capital} onChange={e=>setCapital(parseFloat(e.target.value||"0"))} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2" placeholder="0.00"/>
            </div>
            <div><label className="text-sm text-slate-300">Capital Deposit Date</label>
              <input type="date" value={depositDate} onChange={e=>setDepositDate(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/>
            </div>
          </div>
        </div>
      )}

      {tab==="security" && (
        <div className="space-y-3">
          <div><label className="text-sm text-slate-300">New Password</label><input type="password" value={pw1} onChange={e=>setPw1(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
          <div><label className="text-sm text-slate-300">Confirm Password</label><input type="password" value={pw2} onChange={e=>setPw2(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
          {msg&&<div className="text-sky-400 text-sm">{msg}</div>}
          <div className="text-right"><button onClick={savePw} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500">Update Password</button></div>
        </div>
      )}

      {tab==="customize" && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Symbols */}
          <div className="space-y-3">
            <div className="text-sm font-semibold">Symbols</div>
            <div className="grid grid-cols-2 gap-2">{customSymbols.map(s=>(
              <div key={s} className="tag"><span>{s}</span><button className="text-red-400" onClick={()=>removeSymbol(s)}>✕</button></div>
            ))}</div>
            <div className="flex gap-2">
              <input value={newSymbol} onChange={e=>setNewSymbol(e.target.value)} className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/>
              <button onClick={addSymbol} className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500">Add</button>
            </div>
          </div>

          {/* Strategies */}
          <div className="space-y-3">
            <div className="text-sm font-semibold">Strategies</div>
            <div className="space-y-2 max-h-44 overflow-auto pr-1">{customStrategies.map(s=>(
              <div key={s} className="flex items-center justify-between bg-slate-900/50 border border-slate-700 rounded-xl px-3 py-2">
                <span className="truncate">{s}</span>
                <button onClick={()=>removeStrategy(s)} className="text-red-400">Remove</button>
              </div>
            ))}</div>
            <div className="flex gap-2">
              <input value={newStrategy} onChange={e=>setNewStrategy(e.target.value)} className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/>
              <button onClick={addStrategy} className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500">Add</button>
            </div>
          </div>

          {/* Dashboard widgets */}
          <div className="md:col-span-2 space-y-3">
            <div className="text-sm font-semibold">Dashboard Widgets</div>
            <div className="grid md:grid-cols-3 gap-3">
              <WidgetToggle id="general" label="General Statistics"/>
              <WidgetToggle id="best" label="Best Strategy"/>
              <WidgetToggle id="detailed" label="Detailed Statistics"/>
            </div>
            <div className="text-xs text-slate-400">Toggle widgets to add/remove them from the dashboard.</div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ----------------- Trade modal ----------------- */
function TradeModal({initial,onClose,onSave,onDelete,accType,lastLotSize,customSymbols,customStrategies}){
  const i=initial||{}; const [symbol,setSymbol]=useState(i.symbol||customSymbols[0]); const [side,setSide]=useState(i.side||"BUY");
  const [date,setDate]=useState(i.date||todayISO()); const [lotSize,setLotSize]=useState(i.lotSize ?? lastLotSize ?? 0.01);
  const [entry,setEntry]=useState(i.entry??""); const [exit,setExit]=useState(i.exit??"");
  const [tp1,setTp1]=useState(i.tp1??""); const [tp2,setTp2]=useState(i.tp2??""); const [sl,setSl]=useState(i.sl??"");
  const [strategy,setStrategy]=useState(i.strategy||customStrategies[0]); const [exitType,setExitType]=useState(i.exitType||"Trade In Progress");
  const num=v=>(v===""||v===undefined||v===null)?undefined:parseFloat(v);
  useEffect(()=>{ // auto-calc TP1/TP2 from SL for 1R/2R preview
    const en=num(entry), sll=num(sl); if(en===undefined||sll===undefined) return; const risk=side==="BUY"?en-sll:sll-en; if(risk<=0) return;
    const tp1Calc=side==="BUY"?en+risk:en-risk; const tp2Calc=side==="BUY"?en+risk*2:en-risk*2; setTp1(tp1Calc); setTp2(tp2Calc);
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

/* ----------------- Calendar ----------------- */
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
                <div className={`text-xs ${pnl>0?'text-green-400':pnl<0?'text-red-400':'text-slate-400'}`}>{pnl!==0 ? fmt$(pnl) : ''}</div>
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

/* ----------------- Notes (no images, multi-note/day, compact list) ----------------- */
function NoteDetailModal({note,onClose,trades,accType}){
  const linked=(note.tradeIds||[]).map(id=>trades.find(t=>t.id===id)).filter(Boolean);
  return (
    <Modal title="Note" onClose={onClose} maxClass="max-w-2xl">
      <div className="space-y-3">
        <div className="text-slate-400 text-xs">{note.date}</div>
        <div className="whitespace-pre-wrap">{note.text}</div>
        {linked.length>0 && (
          <div>
            <div className="text-sm font-semibold mt-2 mb-1">Referenced trades</div>
            <div className="space-y-2">
              {linked.map(t=>{
                const v=computeDollarPnL(t,accType);
                const closed = t.exitType && t.exitType !== "Trade In Progress";
                return (
                  <div key={t.id} className="bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-sm flex flex-wrap items-center gap-3">
                    <span className="text-blue-300">{t.symbol}</span>
                    <span className="ng-badge">{t.strategy||"—"}</span>
                    <span className={v>0?'text-green-400':v<0?'text-red-400':'text-slate-300'}>
                      {v===null?'-':formatPnlDisplay(accType,v)} ({v===null?'-':formatUnits(accType,v,t.unitsOverride)})
                    </span>
                    <span className="text-slate-400">Status: {closed?'CLOSED':'OPEN'}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
function NotesPanel({notes,setNotes,trades}){
  const [selectedDate,setSelectedDate]=useState(todayISO());
  const [text,setText]=useState("");
  const [tradeIds,setTradeIds]=useState([]);
  const [detail,setDetail]=useState(null);

  const byDate=useMemo(()=>{const m={};for(const n of notes){m[n.date]=m[n.date]||[];m[n.date].push(n)}return m},[notes]);

  const addNote=()=>{const id=Math.random().toString(36).slice(2); const rec={id,date:selectedDate,text:text.trim(),tradeIds}; if(!rec.text){return;}
    setNotes(prev=>[...prev,rec]); setText(""); setTradeIds([]); // allow moving on to next note immediately
  };
  const delNote=(id)=>setNotes(prev=>prev.filter(n=>n.id!==id));

  return(
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4"><IconNotes/><div className="font-semibold">Notes</div></div>
      <div className="grid md:grid-cols-2 gap-6">
        {/* Composer */}
        <div className="space-y-3">
          <div><label className="text-sm text-slate-300">Date</label><input type="date" value={selectedDate} onChange={e=>setSelectedDate(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
          <div><label className="text-sm text-slate-300">Note</label><textarea value={text} onChange={e=>setText(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 h-28" placeholder="Write your observation..."/></div>
          <div>
            <label className="text-sm text-slate-300">Link to Trades</label>
            <select multiple value={tradeIds} onChange={e=>setTradeIds(Array.from(e.target.selectedOptions,o=>o.value))} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 h-28">
              {trades.map(t=><option key={t.id} value={t.id}>{`${t.date} ${t.symbol} ${t.side}`}</option>)}
            </select>
          </div>
          <button onClick={addNote} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500">Add Note</button>
        </div>
        {/* Compact browser */}
        <div>
          <div className="text-sm font-semibold mb-2">Notes Browser</div>
          <div className="space-y-3 max-h-[420px] overflow-auto pr-1">
            {Object.keys(byDate).sort().reverse().map(d=>(
              <div key={d} className="bg-slate-900/50 border border-slate-700 rounded-xl p-3">
                <div className="text-xs text-slate-400 mb-2">{d}</div>
                <div className="space-y-2">
                  {byDate[d].map(n=>{
                    const preview=n.text.length>90?n.text.slice(0,90)+"…":n.text;
                    return (
                      <div key={n.id} className="flex items-center justify-between">
                        <button className="text-left flex-1 mr-2 hover:underline" onClick={()=>setDetail(n)}>{preview}</button>
                        <button className="text-red-400" onClick={()=>delNote(n.id)}>Delete</button>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
            {Object.keys(byDate).length===0 && <div className="text-slate-400 text-sm">No notes yet.</div>}
          </div>
        </div>
      </div>
      {detail && <NoteDetailModal note={detail} onClose={()=>setDetail(null)} trades={trades} accType={"Dollar Account" /* overridden below */} />}
    </div>
  )
}

/* ----------------- Persisted app state ----------------- */
function usePersisted(email){
  const fresh = () => ({
    name:"",email:email||"",accType:ACC_TYPES[1],capital:0,depositDate:todayISO(),
    trades:[],notes:[],lastLotSize:0.01,
    customSymbols:DEFAULT_SYMBOLS,customStrategies:DEFAULT_STRATEGIES,
    widgets:{general:true,best:true,detailed:true}
  });
  const [state,setState]=useState(()=>{const s=loadState(email||getCurrent());return s||fresh()});
  useEffect(()=>{const loaded=loadState(email); setState(loaded||fresh())},[email]);
  useEffect(()=>{if(!state||!state.email) return; saveState(state.email,state)},[state]);
  return [state,setState];
}

/* ----------------- User menu + import/export ----------------- */
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

/* ----------------- Dashboard widgets ----------------- */
function GeneralStats({trades,accType,capital,depositDate}){
  const realized=trades.filter(t=>new Date(t.date)>=new Date(depositDate)&&t.exitType && t.exitType !== "Trade In Progress");
  const pnlVals=realized.map(t=>computeDollarPnL(t,accType)).filter(v=>v!==null&&isFinite(v));
  const total=pnlVals.reduce((a,b)=>a+b,0); const wins=pnlVals.filter(v=>v>0).length; const losses=pnlVals.filter(v=>v<0).length;
  const open=trades.filter(t=> !t.exitType || t.exitType === "Trade In Progress").length; const wr=(wins+losses)>0?Math.round((wins/(wins+losses))*100):0;
  return(<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
    <Stat label="Capital" value={accType==='Cent Account'?`${r2((capital+total)*100).toFixed(2)} ¢`:fmt$(capital+total)}/>
    <Stat label="Realized P&L" value={formatPnlDisplay(accType,total)}/>
    <Stat label="Win Rate" value={`${wr}%`}/>
    <Stat label="Open" value={open}/>
  </div>)
}

function BestStrategy({trades,accType,customStrategies}){
  const closed=trades.filter(t=>t.exitType && t.exitType !== "Trade In Progress");
  const agg=useMemo(()=>{
    const m={}; customStrategies.forEach(s=>m[s]={wins:0,losses:0,total:0});
    closed.forEach(t=>{const pnl=computeDollarPnL(t,accType); if(!isFinite(pnl)) return; const k=t.strategy||"—"; if(!m[k]) m[k]={wins:0,losses:0,total:0}; m[k].total++; if(pnl>0) m[k].wins++; else if(pnl<0) m[k].losses++;});
    const rows=Object.entries(m).map(([k,v])=>({strategy:k,trades:v.total,winRate:(v.wins+v.losses)>0?Math.round((v.wins/(v.wins+v.losses))*100):0}));
    return rows.filter(r=>r.trades>=3 && (r.winRate>0 || r.trades>0)).sort((a,b)=>b.winRate-a.winRate);
  },[trades,accType,customStrategies]);
  if(agg.length===0) return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4">
      <div className="text-sm font-semibold mb-2">Best Strategy</div>
      <div className="text-slate-400 text-sm">—</div>
    </div>
  );
  const best=agg[0];
  return(
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4 flex items-center gap-4">
      <div className="gauge" style={{"--p":best.winRate} }>
        <div>{best.winRate}%</div>
      </div>
      <div className="flex-1">
        <div className="text-sm font-semibold mb-1">Best Strategy</div>
        <div className="text-lg">{best.strategy}</div>
        <div className="text-xs text-slate-400 mt-1">{best.trades} closed trades · win rate over strategies with ≥3 trades</div>
        <div className="mt-2 bg-slate-900/50 rounded-full h-2"><div className="bg-blue-600 h-2 rounded-full" style={{width:`${best.winRate}%`}}></div></div>
      </div>
    </div>
  )
}

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

/* ----------------- History (no Notes column) ----------------- */
function Histories({trades,accType,onEdit,onDelete}){
  return(<div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4">
    <div className="flex items-center justify-between mb-2"><div className="text-sm font-semibold">Trade History</div></div>
    <div className="overflow-auto"><table className="min-w-full text-sm">
      <thead><tr>
        <Th>Date</Th><Th>Symbol</Th><Th>Side</Th><Th>Lot size</Th><Th>Entry</Th><Th>Exit</Th>
        <Th>TP1</Th><Th>TP2</Th><Th>SL</Th><Th>Exit Type</Th>
        <Th>P&L</Th><Th>P&L (Units)</Th><Th>Status</Th><Th>Actions</Th>
      </tr></thead>
      <tbody>{trades.map(t=>{
        const v=computeDollarPnL(t,accType);
        const closed = t.status ? String(t.status).toUpperCase()==="CLOSED" : (t.exitType && t.exitType !== "Trade In Progress");
        return (<tr key={t.id} className="border-top border-slate-700">
          <Td>{t.date}</Td><Td>{t.symbol}</Td><Td>{t.side}</Td><Td>{t.lotSize}</Td>
          <Td>{typeof t.entry==='number'?t.entry:''}</Td><Td>{typeof t.exit==='number'?t.exit:''}</Td>
          <Td>{typeof t.tp1==='number'?t.tp1:''}</Td><Td>{typeof t.tp2==='number'?t.tp2:''}</Td><Td>{typeof t.sl==='number'?t.sl:''}</Td>
          <Td>{t.exitType||""}</Td>
          <Td className={v>0?'text-green-400':v<0?'text-red-400':''}>{v===null?'-':formatPnlDisplay(accType,v)}</Td>
          <Td className={v>0?'text-green-400':v<0?'text-red-400':''}>{v===null?'-':formatUnits(accType,v,t.unitsOverride)}</Td>
          <Td>{closed?'CLOSED':'OPEN'}</Td>
          <Td><div className="flex gap-2">
            <button onClick={()=>onEdit(t)} className="px-2 py-1 rounded-lg border border-slate-700 hover:bg-slate-700">✎</button>
            <button onClick={()=>onDelete(t.id)} className="px-2 py-1 rounded-lg border border-red-700 text-red-300 hover:bg-red-900/20">✕</button>
          </div></Td>
        </tr>)
      })}</tbody></table></div>
  </div>)
}

/* ----------------- Header/Shell ----------------- */
function UserMenuWrapper({onExport,onLogout,onImport}){return <UserMenu onExport={onExport} onLogout={onLogout} onImport={onImport}/>;}
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
    <UserMenuWrapper onExport={onExport} onLogout={onLogout} onImport={onImport}/>
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

/* ----------------- Auth views (Google + Cloudflare reset) ----------------- */
function parseJwt(token){try{return JSON.parse(atob(token.split('.')[1]))}catch{return null}}
function ResetModal({email,onClose}){
  const [e,setE]=useState(email||""); const [msg,setMsg]=useState(""); const [busy,setBusy]=useState(false);
  const start=async ()=>{
    setMsg("Preparing secure reset link…"); setBusy(true);
    try{
      const res=await fetch((window.RESET_API_BASE||"")+"/request-reset",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:e})});
      if(!res.ok){setMsg("Reset request failed. Check API route.");}
      else{setMsg("If an account exists, a reset email will arrive shortly. Keep this window open until you receive it.");}
    }catch(err){setMsg("Network error contacting reset service.");}
    setBusy(false);
  };
  return(<Modal title="Password reset" onClose={onClose} maxClass="max-w-md">
    <div className="space-y-3">
      <div><label className="text-sm text-slate-300">Your email</label><input value={e} onChange={ev=>setE(ev.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
      <button onClick={start} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500" disabled={busy}>{busy?"Sending…":"Send reset link"}</button>
      {msg&&<div className="text-sky-400 text-sm">{msg}</div>}
    </div>
  </Modal>)
}
function NewPasswordModal({token,onClose}){
  const [pw1,setPw1]=useState(""); const [pw2,setPw2]=useState(""); const [msg,setMsg]=useState(""); const [email,setEmail]=useState("");
  useEffect(()=>{
    (async ()=>{
      try{
        const res=await fetch((window.RESET_API_BASE||"")+"/verify-reset?token="+encodeURIComponent(token));
        if(res.ok){const j=await res.json(); setEmail(j.email||""); setMsg("Token verified. Enter a new password.");}
        else setMsg("Invalid or expired link.");
      }catch{setMsg("Unable to verify link.");}
    })();
  },[token]);
  const confirm=async ()=>{
    if(!email){setMsg("Invalid or expired link.");return}
    if(!pw1||pw1.length<6){setMsg("Password must be at least 6 characters.");return}
    if(pw1!==pw2){setMsg("Passwords do not match.");return}
    // Update local user store
    const users=loadUsers();const i=users.findIndex(x=>x.email.toLowerCase()===email.toLowerCase()); if(i>=0){users[i].password=pw1;saveUsers(users);}
    try{await fetch((window.RESET_API_BASE||"")+"/consume-reset",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token})});}catch{}
    setMsg("Password updated. You can close this window.");
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

/* ----------------- Import progress overlay ----------------- */
function ImportOverlay({open,meta,percent,onClose}){
  if(!open) return null;
  return (
    <div className="ng-overlay">
      <div className="ng-card">
        <div className="text-lg font-semibold mb-2">Importing trades</div>
        <div className="text-sm text-slate-300 mb-3">Please wait. Large files can take time to process depending on file size and browser performance.</div>
        {meta && <div className="text-xs text-slate-400 mb-2">Rows detected: {meta.rows} · Estimated size: {meta.sizeMB} MB</div>}
        <div className="ng-progress mb-3"><span style={{width:`${percent}%`}}/></div>
        <div className="text-xs text-slate-400">Progress: {Math.floor(percent)}%</div>
        <div className="text-right mt-4"><button className="px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800" onClick={onClose}>Hide</button></div>
      </div>
    </div>
  );
}

/* ----------------- App ----------------- */
function App(){
  const [currentEmail,setCurrentEmail]=useState(getCurrent());
  const [users,setUsers]=useState(loadUsers());
  const [state,setState]=usePersisted(currentEmail);
  const [page,setPage]=useState("dashboard");
  const [showTrade,setShowTrade]=useState(false); const [editItem,setEditItem]=useState(null);
  const [showCal,setShowCal]=useState(false); const now=new Date(); const [calView,setCalView]=useState("month"); const [calMonth,setCalMonth]=useState(now.getMonth()); const [calYear,setCalYear]=useState(now.getFullYear()); const [calSel,setCalSel]=useState(todayISO());
  const [collapsed,setCollapsed]=useState(false);
  const [showReset,setShowReset]=useState(false); const [resetToken,setResetToken]=useState("");

  // Import overlay state
  const [importOpen,setImportOpen]=useState(false);
  const [importMeta,setImportMeta]=useState(null);
  const [importPct,setImportPct]=useState(0);

  useEffect(()=>{const hash=new URLSearchParams(location.hash.slice(1));const tok=hash.get("reset"); if(tok){setResetToken(tok)}},[]);
  useEffect(()=>{if(state&&(!state.name||!state.depositDate)) setPage("settings")},[state?.email]);

  const openTrades=state.trades.filter(t=> !t.exitType || t.exitType === "Trade In Progress").length;
  const realized=state.trades.filter(t=>new Date(t.date)>=new Date(state.depositDate)&&t.exitType && t.exitType !== "Trade In Progress").map(t=>computeDollarPnL(t,state.accType)).filter(v=>v!==null&&isFinite(v)).reduce((a,b)=>a+b,0);
  const effectiveCapital=state.capital+realized;

  const toCSV=(rows,accType)=>{
    const H=["Date","Symbol","Side","Lot Size","Entry","Exit","TP1","TP2","SL","Strategy","Exit Type","P&L","P&L (Units)"];
    const NL="\n"; const BOM="﻿";
    const esc=s=>{if(s===null||s===undefined)return"";const v=String(s);return /[",\n]/.test(v)?`"${v.replace(/"/g,'""')}"`:v};
    const out=[H.join(",")];
    for(const t of rows){
      const v=computeDollarPnL(t,accType); const units=t.unitsOverride!==undefined?t.unitsOverride:(v===null?"":formatUnits(accType,v));
      const dollars=t.pnlOverride!==undefined?t.pnlOverride:(v===null?"":r2(v));
      const row=[t.date,t.symbol,t.side,t.lotSize,(t.entry??""),(t.exit??""),(t.tp1??""),(t.tp2??""),(t.sl??""),t.strategy,(t.exitType||""),dollars,units];
      out.push(row.map(esc).join(","));
    }
    return BOM+out.join(NL);
  };

  const onExport=()=>{const csv=toCSV(state.trades,state.accType);const blob=new Blob([csv],{type:"text/csv;charset=utf-8;"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="Nitty_Gritty_Template_Export.csv";a.click();URL.revokeObjectURL(url)};

  const mapRowToTrade=(headers, row)=>{
    const get = (norm) => {
      const h = headers[norm]; if(!h) return undefined; const idx = rawHeads.indexOf(h); return idx>=0 ? row[idx] : undefined;
    };
    // rawHeads closure defined at caller
  };

  // Robust import with progress + full field support
  const onImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    setImportOpen(true);
    setImportMeta({rows:"—",sizeMB: (file.size/1048576).toFixed(2)});
    setImportPct(2);
    reader.onload = (ev) => {
      let text = ev.target.result;
      if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1); // remove BOM
      const rows = parseCSV(text);
      if (rows.length < 2) { setImportPct(100); return; }
      const rawHeads = rows[0].map(h=>String(h));
      const headerMap = normalizeHeaders(rawHeads);
      const trades = [];
      let i = 1;
      setImportMeta({rows: rows.length-1, sizeMB:(file.size/1048576).toFixed(2)});
      const chunk = ()=>{
        const start=i; const end=Math.min(rows.length, i+400);
        for(; i<end; i++){
          const r = rows[i]; if(!r || r.every(c=>String(c||"").trim()==="")) continue;
          const pick = (norm)=>{const h=headerMap[norm]; if(!h) return undefined; const idx=rawHeads.findIndex(x=>x===h); return idx>=0 ? r[idx] : undefined;};
          const toNum = (norm)=>toNumberOr(pick(norm));
          const t = {
            id: Math.random().toString(36).slice(2),
            date: (pick("Date")||"").toString().slice(0,10),
            symbol: pick("Symbol)"), // placeholder to fix right after
          };
        }
      };
      // Build trades with alias mapping
      const makeTrades = ()=>{
        const result=[];
        for(let r=1;r<rows.length;r++){
          const row=rows[r]; if(!row || row.every(c=>String(c||"").trim()==="")) continue;
          const pick = (norm)=>{const h=headerMap[norm]; if(!h) return undefined; const idx=rawHeads.findIndex(x=>x===h); return idx>=0 ? row[idx] : undefined;};
          const t = {
            id: Math.random().toString(36).slice(2),
            date: (pick("Date")||"").toString().slice(0,10),
            symbol: (pick("Symbol")||"").toString().toUpperCase(),
            side: (pick("Side")||"").toString().toUpperCase(),
            lotSize: toNumberOr(pick("LotSize"))||0,
            entry: toNumberOr(pick("Entry")),
            exit: toNumberOr(pick("Exit")),
            tp1: toNumberOr(pick("TP1")),
            tp2: toNumberOr(pick("TP2")),
            sl: toNumberOr(pick("SL")),
            strategy: (pick("Strategy")||"").toString(),
            exitType: (pick("ExitType")||"").toString(),
            status: (pick("Status")||"").toString().toUpperCase()
          };
          const pnlCol = pick("PnL"); const unitsCol = pick("Units");
          if(pnlCol!==undefined && pnlCol!==null && String(pnlCol).trim()!==""){ t.pnlOverride = toNumberOr(pnlCol); }
          if(unitsCol!==undefined && unitsCol!==null && String(unitsCol).trim()!==""){ t.unitsOverride = unitsCol; }
          // derive status if not present
          if(!t.status){ t.status = (t.exitType && t.exitType !== "Trade In Progress") ? "CLOSED" : "OPEN"; }
          // normalize Exit Type for open trades
          if(t.status==="OPEN" && (!t.exitType || t.exitType==="")) t.exitType="Trade In Progress";
          result.push(t);
        }
        return result;
      };

      // Process in chunks to keep UI responsive
      const total = rows.length-1;
      let processed=0;
      const batchSize=500;
      const out=[];
      (function loop(idx){
        if(idx>=rows.length){ setState({...state, trades:[...state.trades, ...out]}); setImportPct(100); return; }
        const next=Math.min(idx+batchSize, rows.length);
        const slice=[rows[0], ...rows.slice(idx,next)];
        const rawHeadsLocal = slice[0].map(h=>String(h));
        const headerMapLocal = normalizeHeaders(rawHeadsLocal);
        for(let r=1;r<slice.length;r++){
          const row=slice[r]; if(!row || row.every(c=>String(c||"").trim()==="")) continue;
          const pick = (norm)=>{const h=headerMapLocal[norm]; if(!h) return undefined; const idx=rawHeadsLocal.findIndex(x=>x===h); return idx>=0 ? row[idx] : undefined;};
          const t = {
            id: Math.random().toString(36).slice(2),
            date: (pick("Date")||"").toString().slice(0,10),
            symbol: (pick("Symbol")||"").toString().toUpperCase(),
            side: (pick("Side")||"").toString().toUpperCase(),
            lotSize: toNumberOr(pick("LotSize"))||0,
            entry: toNumberOr(pick("Entry")),
            exit: toNumberOr(pick("Exit")),
            tp1: toNumberOr(pick("TP1")),
            tp2: toNumberOr(pick("TP2")),
            sl: toNumberOr(pick("SL")),
            strategy: (pick("Strategy")||"").toString(),
            exitType: (pick("ExitType")||"").toString(),
            status: (pick("Status")||"").toString().toUpperCase()
          };
          const pnlCol = pick("PnL"); const unitsCol = pick("Units");
          if(pnlCol!==undefined && pnlCol!==null && String(pnlCol).trim()!==""){ t.pnlOverride = toNumberOr(pnlCol); }
          if(unitsCol!==undefined && unitsCol!==null && String(unitsCol).trim()!==""){ t.unitsOverride = unitsCol; }
          if(!t.status){ t.status = (t.exitType && t.exitType !== "Trade In Progress") ? "CLOSED" : "OPEN"; }
          if(t.status==="OPEN" && (!t.exitType || t.exitType==="")) t.exitType="Trade In Progress";
          out.push(t);
          processed++;
        }
        setImportPct(Math.min(99, Math.floor((processed/total)*100)));
        setTimeout(()=>loop(next),0);
      })(1);
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
    if(!u){ if(password==="__google__"){const nu=[...users,{name:email.split("@")[0],email,password:""}]; setUsers(nu); saveUsers(nu); const fresh={name:email.split("@")[0],email,accType:ACC_TYPES[1],capital:0,depositDate:todayISO(),trades:[],notes:[],lastLotSize:0.01,customSymbols:DEFAULT_SYMBOLS,customStrategies:DEFAULT_STRATEGIES,widgets:{general:true,best:true,detailed:true}}; saveState(email,fresh); saveCurrent(email); setCurrentEmail(email); return;}
      setErr("No such user. Please sign up."); return;}
    if(password!=="__google__" && u.password!==password){setErr("Wrong password.");return}
    setErr(""); saveCurrent(u.email); setCurrentEmail(u.email);
  };

  const signup=(name,email,password,setErr)=>{if(users.some(x=>x.email.toLowerCase()===email.toLowerCase())){setErr("Email already registered.");return}
    const u={name,email,password}; const nu=[...users,u]; setUsers(nu); saveUsers(nu);
    const fresh={name,email,accType:ACC_TYPES[1],capital:0,depositDate:todayISO(),trades:[],notes:[],lastLotSize:0.01,customSymbols:DEFAULT_SYMBOLS,customStrategies:DEFAULT_STRATEGIES,widgets:{general:true,best:true,detailed:true}}; saveState(email,fresh); saveCurrent(email); setCurrentEmail(email);
  };

  const addOrUpdate=(draft)=>{const id=draft.id||Math.random().toString(36).slice(2); const arr=state.trades.slice(); const idx=arr.findIndex(t=>t.id===id); const rec={...draft,id}; if(idx>=0)arr[idx]=rec; else arr.unshift(rec); setState({...state,trades:arr,lastLotSize:draft.lotSize}); setShowTrade(false); setEditItem(null)};
  const delTrade=(id)=>setState({...state,trades:state.trades.filter(t=>t.id!==id)});

  if(resetToken){return <NewPasswordModal token={resetToken} onClose={()=>{setResetToken(""); location.hash=""}}/>}
  if(!currentEmail){return <>
    <LoginView onLogin={login} onSignup={signup} initGoogle={initGoogle} resetStart={()=>setShowReset(true)}/>
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
    {navBtn("Notes","notes",IconNotes)}
    <button onClick={()=>{setShowCal(true);setCalView("month")}} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-700 hover:bg-slate-800"><IconCalendar/>Calendar</button>
    {navBtn("Settings","settings",IconSettings)}
  </>);

  const logoSrc=LOGO_PUBLIC;

  return(
    <>
      <AppShell capitalPanel={capitalPanel} nav={nav} logoSrc={logoSrc} onToggleSidebar={()=>setCollapsed(v=>!v)} onExport={onExport} onLogout={()=>{saveCurrent("");setCurrentEmail("")}} onImport={onImport} sidebarCollapsed={collapsed}>
        {page==="dashboard"&&(<div className="space-y-4">
          {state.widgets?.general && <><div className="text-sm font-semibold">General statistics</div><GeneralStats trades={state.trades} accType={state.accType} capital={state.capital} depositDate={state.depositDate}/></>}
          {state.widgets?.best && <BestStrategy trades={state.trades} accType={state.accType} customStrategies={state.customStrategies}/>}
          {state.widgets?.detailed && <DetailedStats trades={state.trades} accType={state.accType}/>}
        </div>)}
        {page==="histories"&&(<Histories trades={state.trades} accType={state.accType} onEdit={t=>{setEditItem(t);setShowTrade(true)}} onDelete={delTrade}/>)}
        {page==="notes"&&(<NotesPanel notes={state.notes} setNotes={notes=>setState({...state,notes})} trades={state.trades}/>)}
        {page==="settings"&&(<SettingsPanel
          name={state.name} setName={v=>setState({...state,name:v})}
          accType={state.accType} setAccType={v=>setState({...state,accType:v})}
          capital={state.capital} setCapital={v=>setState({...state,capital:v||0})}
          depositDate={state.depositDate} setDepositDate={v=>setState({...state,depositDate:v})}
          email={state.email}
          customSymbols={state.customSymbols} setCustomSymbols={v=>setState({...state,customSymbols:v})}
          customStrategies={state.customStrategies} setCustomStrategies={v=>setState({...state,customStrategies:v})}
          widgets={state.widgets||{general:true,best:true,detailed:true}} setWidgets={v=>setState({...state,widgets:v})}
        />)}
        {showTrade&&(<TradeModal initial={editItem} onClose={()=>{setShowTrade(false);setEditItem(null)}} onSave={addOrUpdate} onDelete={delTrade} accType={state.accType} lastLotSize={state.lastLotSize} customSymbols={state.customSymbols} customStrategies={state.customStrategies}/>)}
        {showCal&&(<CalendarModal onClose={()=>setShowCal(false)} trades={state.trades} view={calView} setView={setCalView} month={calMonth} setMonth={setCalMonth} year={calYear} setYear={setCalYear} selectedDate={calSel} setSelectedDate={setCalSel} accType={state.accType}/>)}
      </AppShell>
      <ImportOverlay open={importOpen} meta={importMeta} percent={importPct} onClose={()=>setImportOpen(false)}/>
      {showReset&&<ResetModal email="" onClose={()=>setShowReset(false)}/>}
    </>
  )
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
