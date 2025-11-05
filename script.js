/* Nitty Gritty – single-file React app (v5)
   Changes in this build ONLY:
   1) Fixed import duplication (unified SheetJS parser for CSV/XLS/XLSX)
   2) Restored “Best Strategy” dashboard card
   3) Replaced Settings icon with a professional cog glyph
   Everything else is intentionally unchanged in look & behavior.
*/
const {useState,useMemo,useEffect,useRef} = React;

/* ---------- Icons ---------- */
const iconCls="h-5 w-5";
const IconUser=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Z"/><path d="M4 20a8 8 0 0 1 16 0Z"/></svg>);
const IconLogout=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M9 21h4a4 4 0 0 0 4-4V7a4 4 0 0 0-4-4H9"/><path d="M16 12H3"/><path d="M7 8l-4 4 4 4"/></svg>);
const IconDownload=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M12 3v10"/><path d="M8 11l4 4 4-4"/><path d="M5 21h14v-4H5Z"/></svg>);
const IconUpload=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M12 21V11"/><path d="M8 15l4-4 4 4"/><path d="M5 10V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3"/></svg>);
const IconCalendar=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M8 3v4M16 3v4"/><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18"/></svg>);
const IconPlus=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M12 5v14M5 12h14"/></svg>);
const IconHistory=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M12 8v5l3 3"/><path d="M12 3a9 9 0 1 0 9 9"/><path d="M21 3v6h-6"/></svg>);
/* clean professional cog glyph */
const IconSettings=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/><path d="M19.4 15a2 2 0 0 0 .33 2.15l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A2 2 0 0 0 15 19.4a2 2 0 0 0-1 .6 2 2 0 0 0-.4 1V22a2 2 0 1 1-4 0v-.1a2 2 0 0 0-.4-1 2 2 0 0 0-1-.6 2 2 0 0 0-2.15.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A2 2 0 0 0 4.6 15a2 2 0 0 0-.6-1 2 2 0 0 0-1-.4H2a2 2 0 1 1 0-4h.1a2 2 0 0 0 1-.4 2 2 0 0 0 .6-1 2 2 0 0 0-.33-2.15l-.06-.06A2 2 0 1 1 6.24 2.9l.06.06A2 2 0 0 0 8 4.6a2 2 0 0 0 1-.6 2 2 0 0 0 .4-1V2a2 2 0 1 1 4 0v.1c0 .38.14.74.4 1 .26.26.62.4 1 .4.62 0 1.22-.25 1.64-.68l.06-.06A2 2 0 1 1 21.1 6.24l-.06.06c-.26.26-.4.62-.4 1s.14.74.4 1c.26.26.62.4 1 .4H22a2 2 0 1 1 0 4h-.1a2 2 0 0 0-1 .4 2 2 0 0 0-.6 1Z"/></svg>);
const IconHome=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9v12h14V9"/></svg>);
const IconNote=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M3 7a2 2 0 0 1 2-2h8l4 4v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><path d="M13 3v4h4"/></svg>);
const IconSave=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l3 3v13a2 2 0 0 1-2 2Z"/><path d="M7 3v5h8"/><path d="M7 13h10"/><path d="M7 17h6"/></svg>);

/* ---------- Constants & Utils ---------- */
const LOGO_PUBLIC="/logo-ng.png"; // keep as previously used
const DEFAULT_SYMBOLS=["XAUUSD","US100","US30","EURUSD","BTCUSD","AUDCAD","USDCAD","USDJPY","GBPUSD"];
const DEFAULT_STRATEGIES=[
  {name:"Trend Line Bounce", color:"default"},
  {name:"2 Touch Point Trend Line Break", color:"default"},
  {name:"3 / 3+ Touch Point Trend Line Break", color:"default"},
  {name:"Trend Line Break & Re-test", color:"default"},
  {name:"Trend Continuation", color:"default"}
];
const STRAT_COLORS = { default:"", green:"text-green-400", red:"text-red-400", mustard:"text-amber-400" };
const EXIT_TYPES=["TP","SL","TP1_BE","TP1_SL","BE","Trade In Progress"];
const ACC_TYPES=["Cent Account","Dollar Account"];

const r2=n=>Math.round(n*100)/100;
const fmt$=n=>"$"+(isFinite(n)?r2(n):0).toFixed(2);
const todayISO=()=>{const d=new Date();const tz=d.getTimezoneOffset();return new Date(d.getTime()-tz*60000).toISOString().slice(0,10)};

const USERS_KEY="ng_users_v1";
const CURR_KEY="ng_current_user_v1";
const CFG_KEY =(email)=>"ng_cfg_"+email;

const loadUsers=()=>{try{return JSON.parse(localStorage.getItem(USERS_KEY)||"[]")}catch{return[]}};
const saveUsers=u=>{try{localStorage.setItem(USERS_KEY,JSON.stringify(u))}catch{}};
const saveCurrent=e=>{try{localStorage.setItem(CURR_KEY,e)}catch{}};
const getCurrent=()=>{try{return localStorage.getItem(CURR_KEY)||""}catch{return""}};
const loadState=e=>{try{return JSON.parse(localStorage.getItem("ng_state_"+e)||"null")}catch{return null}};
const saveState=(e,s)=>{try{localStorage.setItem("ng_state_"+e,JSON.stringify(s))}catch{}};
const loadCfg=(e)=>{try{return JSON.parse(localStorage.getItem(CFG_KEY(e))||"null")}catch{return null}};
const saveCfg=(e,c)=>{try{localStorage.setItem(CFG_KEY(e),JSON.stringify(c))}catch{}};

/* Tick/pip → $ approximation (unchanged behavior) */
function perLotValueForMove(symbol,delta,accType){
  const abs=Math.abs(delta);const isStd=accType==="Dollar Account";const mult=std=>isStd?std:std/100;
  switch(symbol){
    case"US30":case"US100":return abs*mult(10);        // index points
    case"XAUUSD":return abs*mult(100);                 // $1 move ≈ $100/lot
    case"BTCUSD":return abs*mult(1);                   // coarse approx
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

/* CSV header map */
const HEADER_MAP = {
  "Date":"date","Symbol":"symbol","Side":"side","Lot Size":"lotSize",
  "Entry":"entry","Exit":"exit","TP1":"tp1","TP2":"tp2","SL":"sl",
  "Strategy":"strategy","Exit Type":"exitType"
};
function rowsToTrades(rows){
  return rows.map(r=>{
    const t={};
    for(const [H,K] of Object.entries(HEADER_MAP)){
      t[K] = r[H] ?? r[H.toLowerCase()] ?? r[H.replace(/\s/g,'')] ?? '';
    }
    const num=v=>(v===''||v==null)?undefined:parseFloat(v);
    t.id = Math.random().toString(36).slice(2);
    t.date = t.date || todayISO();
    t.symbol = String(t.symbol||'').toUpperCase();
    t.side = (String(t.side||'BUY').toUpperCase()==='SELL')?'SELL':'BUY';
    t.lotSize = num(t.lotSize)||0.01;
    t.entry=num(t.entry); t.exit=num(t.exit);
    t.tp1=num(t.tp1); t.tp2=num(t.tp2); t.sl=num(t.sl);
    t.strategy = t.strategy || DEFAULT_STRATEGIES[0].name;
    t.exitType = t.exitType || "Trade In Progress";
    return t;
  });
}
function toCSV(trades,accType){
  const cols=["Date","Symbol","Side","Lot Size","Entry","Exit","TP1","TP2","SL","Strategy","Exit Type","P&L ($)"];
  const lines=[cols.join(",")];
  trades.forEach(t=>{
    const pnl=computeDollarPnL(t,accType);
    const row=[t.date,t.symbol,t.side,t.lotSize??"",t.entry??"",t.exit??"",t.tp1??"",t.tp2??"",t.sl??"",t.strategy??"",t.exitType??"",isFinite(pnl)?r2(pnl):""];
    lines.push(row.map(v=>v==null?"":String(v)).join(","));
  });
  return lines.join("\r\n");
}

/* ---------- Small UI helpers ---------- */
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

/* ---------- Error Boundary ---------- */
class ErrorBoundary extends React.Component{
  constructor(p){super(p);this.state={err:null}}
  static getDerivedStateFromError(e){return{err:e}}
  componentDidCatch(e,info){console.error("View crash:",e,info)}
  render(){ if(this.state.err) return <div className="p-4 text-red-300 bg-red-950/30 border border-red-800 rounded-xl">Something went wrong in this view. Please reload or go back.</div>;
    return this.props.children;
  }
}

/* ---------- Account Setup Modal ---------- */
function AccountSetupModal({name,setName,accType,setAccType,capital,setCapital,depositDate,setDepositDate,onClose,email}){
  return(
    <Modal title="Account Setup" onClose={onClose} maxClass="max-w-2xl">
      <div className="space-y-4">
        <div><label className="text-sm text-slate-300">Name</label><input value={name} onChange={e=>setName(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><label className="text-sm text-slate-300">Acc Type</label><select value={accType} onChange={e=>setAccType(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2">{ACC_TYPES.map(s=><option key={s}>{s}</option>)}</select></div>
          <div><label className="text-sm text-slate-300">Account Capital ($)</label><input type="number" value={capital} onChange={e=>setCapital(parseFloat(e.target.value||"0"))} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2" placeholder="0.00"/></div>
          <div><label className="text-sm text-slate-300">Capital Deposit Date</label><input type="date" value={depositDate} onChange={e=>setDepositDate(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
        </div>
        <div className="text-right"><button onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-700 hover:bg-slate-900">Save & Close</button></div>
      </div>
    </Modal>
  )
}

/* ---------- Settings Panel ---------- */
function SettingsPanel({name,setName,accType,setAccType,capital,setCapital,depositDate,setDepositDate,email,cfg,setCfg}){
  const [tab,setTab]=useState("personal");
  const [pw1,setPw1]=useState(""); const [pw2,setPw2]=useState(""); const [msg,setMsg]=useState("");
  const savePw=()=>{ if(!pw1||pw1.length<6){setMsg("Password must be at least 6 characters.");return}
    if(pw1!==pw2){setMsg("Passwords do not match.");return}
    const users=loadUsers();const i=users.findIndex(u=>u.email.toLowerCase()===(email||"").toLowerCase());
    if(i>=0){users[i].password=pw1;saveUsers(users);setMsg("Password updated.");setPw1("");setPw2("")}
  };
  const [symText,setSymText]=useState("");
  const [stratText,setStratText]=useState(""); const [stratColor,setStratColor]=useState("default");
  return(
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4"><IconSettings/><div className="font-semibold">Settings</div></div>
      <div className="flex gap-2 mb-4">
        <button onClick={()=>setTab("personal")} className={`px-3 py-1.5 rounded-lg border ${tab==="personal"?"bg-slate-700 border-slate-600":"border-slate-700"}`}>Account Setup</button>
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
        <div className="space-y-6">
          <div>
            <div className="font-semibold mb-2">Symbols</div>
            <div className="flex gap-2 mb-2">
              <input value={symText} onChange={e=>setSymText(e.target.value.toUpperCase())} placeholder="e.g., XAUUSD" className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/>
              <button onClick={()=>{if(symText){const n={...cfg,symbols:[...new Set([...cfg.symbols,symText])]};setCfg(n);}}} className="px-3 py-2 rounded-lg border border-slate-700">Add</button>
            </div>
            <div className="flex flex-wrap gap-2">{cfg.symbols.map(s=>(<span key={s} className="px-2 py-1 rounded-lg border border-slate-700">{s} <button onClick={()=>{const n={...cfg,symbols:cfg.symbols.filter(x=>x!==s)};setCfg(n)}} className="ml-1 text-red-300">×</button></span>))}</div>
          </div>
          <div>
            <div className="font-semibold mb-2">Strategies (color used in tables)</div>
            <div className="flex gap-2 mb-2">
              <input value={stratText} onChange={e=>setStratText(e.target.value)} placeholder="Strategy name" className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/>
              <select value={stratColor} onChange={e=>setStratColor(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2">
                <option value="default">Default</option>
                <option value="green">Green</option>
                <option value="red">Red</option>
                <option value="mustard">Mustard orange</option>
              </select>
              <button onClick={()=>{if(stratText){const n={...cfg,strategies:[...cfg.strategies,{name:stratText,color:stratColor}]};setCfg(n);}}} className="px-3 py-2 rounded-lg border border-slate-700">Add</button>
            </div>
            <div className="space-y-2">
              {cfg.strategies.map((st,idx)=>(
                <div key={idx} className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-lg border border-slate-700 ${STRAT_COLORS[st.color]||""}`}>{st.name}</span>
                  <select value={st.color} onChange={e=>{const ns=[...cfg.strategies];ns[idx]={...st,color:e.target.value};setCfg({...cfg,strategies:ns})}} className="bg-slate-900 border border-slate-700 rounded-xl px-2 py-1">
                    <option value="default">Default</option><option value="green">Green</option><option value="red">Red</option><option value="mustard">Mustard</option>
                  </select>
                  <button onClick={()=>{const n={...cfg,strategies:cfg.strategies.filter((_,i)=>i!==idx)};setCfg(n)}} className="text-red-300 px-2 py-1 rounded-lg border border-red-700">Remove</button>
                </div>
              ))}
            </div>
          </div>
          <div className="text-xs text-slate-400">Changes save automatically.</div>
        </div>
      )}
    </div>
  )
}

/* ---------- Trade Modal ---------- */
function TradeModal({initial,onClose,onSave,onDelete,accType,symbols,strategies}){
  const [draft,setDraft]=useState(()=>initial?{...initial}:{date:todayISO(),symbol:symbols[0]||"XAUUSD",side:"BUY",lotSize:0.01,entry:undefined,exit:undefined,tp1:undefined,tp2:undefined,sl:undefined,exitType:"Trade In Progress",strategy:strategies[0]?.name||"Trend Line Bounce"});
  const hasId=!!initial?.id;
  const change=(k,v)=>setDraft(d=>({...d,[k]:v}));
  const isValid=()=>!!draft.symbol && !!draft.side && draft.lotSize>0 && !!draft.date;
  return(
    <Modal title={hasId?"Edit Trade":"Add Trade"} onClose={onClose}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div><div className="text-xs text-slate-300">Date</div><input type="date" value={draft.date} onChange={e=>change("date",e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
        <div><div className="text-xs text-slate-300">Symbol</div><select value={draft.symbol} onChange={e=>change("symbol",e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2">{symbols.map(s=><option key={s}>{s}</option>)}</select></div>
        <div><div className="text-xs text-slate-300">Side</div><select value={draft.side} onChange={e=>change("side",e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"><option>BUY</option><option>SELL</option></select></div>
        <div><div className="text-xs text-slate-300">Lot size</div><input type="number" step="0.01" value={draft.lotSize} onChange={e=>change("lotSize",parseFloat(e.target.value||"0"))} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
        <div><div className="text-xs text-slate-300">Entry</div><input type="number" step="0.00001" value={draft.entry??""} onChange={e=>change("entry",parseFloat(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
        <div><div className="text-xs text-slate-300">Exit</div><input type="number" step="0.00001" value={draft.exit??""} onChange={e=>change("exit",parseFloat(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
        <div><div className="text-xs text-slate-300">TP1</div><input type="number" step="0.00001" value={draft.tp1??""} onChange={e=>change("tp1",parseFloat(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
        <div><div className="text-xs text-slate-300">TP2</div><input type="number" step="0.00001" value={draft.tp2??""} onChange={e=>change("tp2",parseFloat(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
        <div><div className="text-xs text-slate-300">SL</div><input type="number" step="0.00001" value={draft.sl??""} onChange={e=>change("sl",parseFloat(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
        <div><div className="text-xs text-slate-300">Exit Type</div><select value={draft.exitType} onChange={e=>change("exitType",e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2">{EXIT_TYPES.map(s=><option key={s}>{s}</option>)}</select></div>
        <div className="md:col-span-2"><div className="text-xs text-slate-300">Strategy</div><select value={draft.strategy} onChange={e=>change("strategy",e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2">{strategies.map(s=><option key={s.name}>{s.name}</option>)}</select></div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-slate-400 text-sm">
          P&L preview:&nbsp;
          {(()=>{const v=computeDollarPnL(draft,accType);return v===null?"—":formatPnlDisplay(accType,v)})()}
        </div>
        <div className="flex gap-2">
          {hasId&&<button onClick={()=>{onDelete(draft.id);onClose();}} className="px-3 py-2 rounded-lg border border-red-700 text-red-300">Delete</button>}
          <button disabled={!isValid()} onClick={()=>{onSave(draft);onClose();}} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50"><IconSave className="inline mr-1"/>Save</button>
        </div>
      </div>
    </Modal>
  )
}

/* ---------- Calendar Modal (compact) ---------- */
function CalendarModal({onClose,trades,view,setView,month,setMonth,year,setYear,selectedDate,setSelectedDate,accType}){
  const start=new Date(year,month,1); const end=new Date(year,month+1,0);
  const weeks=[];
  let cursor=new Date(year,month,1-start.getDay());
  while(cursor<=new Date(year,month,end.getDate()+(6-end.getDay()))){
    const row=[];
    for(let i=0;i<7;i++){
      const iso=new Date(cursor).toISOString().slice(0,10);
      const dayTrades=trades.filter(t=>t.date===iso);
      row.push({d:new Date(cursor),iso,dayTrades});
      cursor.setDate(cursor.getDate()+1);
    }
    weeks.push(row);
  }
  return(
    <Modal title="Calendar" onClose={onClose} maxClass="max-w-5xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex gap-2">
          <button onClick={()=>{if(month===0){setYear(year-1);setMonth(11)}else setMonth(month-1)}} className="px-3 py-1.5 rounded-lg border border-slate-700">Prev</button>
          <button onClick={()=>{if(month===11){setYear(year+1);setMonth(0)}else setMonth(month+1)}} className="px-3 py-1.5 rounded-lg border border-slate-700">Next</button>
        </div>
        <div className="text-sm">{new Date(year,month).toLocaleString(undefined,{month:"long",year:"numeric"})}</div>
        <div/>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d=><div key={d} className="text-xs text-slate-400">{d}</div>)}
        {weeks.flat().map(cell=>{
          const inMonth=cell.d.getMonth()===month;
          return(
            <div key={cell.iso} className={`min-h-[90px] p-2 rounded-lg border ${inMonth?'border-slate-700 bg-slate-900/50':'border-transparent bg-slate-900/20'} ${cell.iso===selectedDate?'ring-2 ring-sky-500':''}`} onClick={()=>setSelectedDate(cell.iso)}>
              <div className="text-xs mb-1 text-slate-400">{cell.d.getDate()}</div>
              <div className="space-y-1">
                {cell.dayTrades.slice(0,3).map(t=><div key={t.id} className={`text-[11px] truncate ${computeDollarPnL(t,accType)>0?'text-green-400':computeDollarPnL(t,accType)<0?'text-red-400':'text-amber-300'}`}>{t.symbol} · {t.side}</div>)}
              </div>
            </div>
          )
        })}
      </div>
      <div className="mt-4">
        <div className="font-semibold mb-2">Trades on {selectedDate}</div>
        <div className="space-y-1">
          {trades.filter(t=>t.date===selectedDate).map(t=><div key={t.id} className="text-sm">{t.symbol} {t.side} · {formatPnlDisplay(accType,computeDollarPnL(t,accType)??0)}</div>)}
          {!trades.some(t=>t.date===selectedDate)&&<div className="text-slate-400 text-sm">No trades</div>}
        </div>
      </div>
    </Modal>
  )
}

/* ---------- Notes ---------- */
function NoteModal({initial,onClose,onSave}){
  const [txt,setTxt]=useState(initial?.text||"");
  return(
    <Modal title={initial?"Edit Note":"Add Note"} onClose={onClose}>
      <textarea value={txt} onChange={e=>setTxt(e.target.value)} rows={8} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3"/>
      <div className="text-right mt-3">
        <button className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500" onClick={()=>{onSave({id:initial?.id||Math.random().toString(36).slice(2),text:txt});onClose();}}>Save</button>
      </div>
    </Modal>
  )
}
function NotesPanel({trades}){
  const email=getCurrent(); const key="ng_notes_"+email;
  const [notes,setNotes]=useState(()=>{try{return JSON.parse(localStorage.getItem(key)||"[]")}catch{return[]}});
  const [show,setShow]=useState(false); const [edit,setEdit]=useState(null);
  useEffect(()=>{localStorage.setItem(key,JSON.stringify(notes))},[notes]);
  return(
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4"><div className="font-semibold">Notes</div><button className="px-3 py-1.5 rounded-lg border border-slate-700" onClick={()=>{setEdit(null);setShow(true)}}><IconPlus className="inline mr-1"/>Add</button></div>
      <div className="space-y-2">
        {notes.map(n=><div key={n.id} className="p-3 rounded-lg border border-slate-700 bg-slate-900/40">
          <div className="text-sm whitespace-pre-wrap">{n.text}</div>
          <div className="text-right mt-2">
            <button className="text-sky-400 mr-3" onClick={()=>{setEdit(n);setShow(true)}}>Edit</button>
            <button className="text-red-300" onClick={()=>setNotes(notes.filter(x=>x.id!==n.id))}>Delete</button>
          </div>
        </div>)}
        {!notes.length&&<div className="text-sm text-slate-400">No notes yet.</div>}
      </div>
      {show&&<NoteModal initial={edit} onClose={()=>setShow(false)} onSave={(n)=>{const arr=[...notes];const i=arr.findIndex(x=>x.id===n.id);if(i>=0)arr[i]=n;else arr.unshift(n);setNotes(arr)}}/>}
    </div>
  )
}

/* ---------- Histories ---------- */
function Histories({trades,accType,onEdit,onDelete,strategies}){
  const cols=["Date","Symbol","Side","Lot","Entry","Exit","TP1","TP2","SL","Strategy","Exit","P&L"];
  return(
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-700 font-semibold">Histories</div>
      <div className="overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-900/60">
            <tr>
              {cols.map(c=><Th key={c}>{c}</Th>)}
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {trades.map((t,i)=>{
              const pnl=computeDollarPnL(t,accType);
              const stratColor = strategies.find(s=>s.name===t.strategy)?.color || "default";
              return(
                <tr key={t.id} className="tr-row">
                  <Td>{t.date}</Td>
                  <Td>{t.symbol}</Td>
                  <Td className={t.side==="BUY"?"text-green-400":"text-red-400"}>{t.side}</Td>
                  <Td>{t.lotSize}</Td>
                  <Td>{t.entry??""}</Td>
                  <Td>{t.exit??""}</Td>
                  <Td>{t.tp1??""}</Td>
                  <Td>{t.tp2??""}</Td>
                  <Td>{t.sl??""}</Td>
                  <Td className={`${STRAT_COLORS[stratColor]||""}`}>{t.strategy}</Td>
                  <Td>{t.exitType||"Trade In Progress"}</Td>
                  <Td className={`${pnl>0?'text-green-400':pnl<0?'text-red-400':'text-amber-300'}`}>{pnl===null?"—":formatPnlDisplay(accType,pnl)}</Td>
                  <Td>
                    <div className="flex gap-2">
                      <button className="px-2 py-1 rounded-lg border border-slate-700" onClick={()=>onEdit(t)}>Edit</button>
                      <button className="px-2 py-1 rounded-lg border border-red-700 text-red-300" onClick={()=>onDelete(t.id)}>Delete</button>
                    </div>
                  </Td>
                </tr>
              )
            })}
            {!trades.length&&(
              <tr><Td colSpan={cols.length+1}><div className="text-slate-400 py-6">No trades yet.</div></Td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ---------- Stats ---------- */
function GeneralStats({trades,accType,capital,depositDate}){
  const since = useMemo(()=>trades.filter(t=>new Date(t.date)>=new Date(depositDate)),[trades,depositDate]);
  const realized = useMemo(()=>since.map(t=>computeDollarPnL(t,accType)).filter(v=>v!==null&&isFinite(v)).reduce((a,b)=>a+b,0),[since,accType]);
  const wins = useMemo(()=>since.filter(t=>{const v=computeDollarPnL(t,accType);return v!==null&&v>0}).length,[since,accType]);
  const losses = useMemo(()=>since.filter(t=>{const v=computeDollarPnL(t,accType);return v!==null&&v<0}).length,[since,accType]);
  const totalDone = wins+losses;
  const winRate = totalDone?Math.round((wins/totalDone)*100):0;
  const open = useMemo(()=>trades.filter(t=>!t.exitType || t.exitType==="Trade In Progress").length,[trades]);
  return(
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      <Stat label="Capital (effective)" value={accType==='Cent Account'?`${r2((capital+realized)*100).toFixed(2)} ¢`:fmt$(capital+realized)}/>
      <Stat label="Realized P&L" value={formatPnlDisplay(accType,realized)}/>
      <Stat label="Wins" value={wins}/>
      <Stat label="Losses" value={losses}/>
      <Stat label="Win rate" value={`${winRate}%`}/>
      <Stat label="Open trades" value={open}/>
    </div>
  )
}
function DetailedStats({trades,accType}){
  const bySym=useMemo(()=>{
    const m=new Map();
    for(const t of trades){
      const p=computeDollarPnL(t,accType);
      if(p===null) continue;
      const r=m.get(t.symbol)||{pnl:0,cnt:0};
      r.pnl+=p;r.cnt++;m.set(t.symbol,r);
    }
    return [...m.entries()].sort((a,b)=>b[1].pnl-a[1].pnl);
  },[trades,accType]);
  return(
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4">
      <div className="text-sm font-semibold mb-2">Detailed statistics</div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {bySym.map(([sym,v])=>(<div key={sym} className="bg-slate-900/40 border border-slate-700 rounded-xl p-3">
          <div className="text-slate-300 text-xs mb-1">{sym}</div>
          <div className={`text-lg font-semibold ${v.pnl>0?'text-green-400':v.pnl<0?'text-red-400':'text-amber-300'}`}>{formatPnlDisplay(accType,v.pnl)}</div>
          <div className="text-slate-400 text-xs">Trades: {v.cnt}</div>
        </div>))}
        {!bySym.length&&<div className="text-sm text-slate-400">No closed trades yet.</div>}
      </div>
    </div>
  )
}

/* ---------- Best Strategy (restored) ---------- */
function BestStrategy({trades,accType,strategies}){
  const data = useMemo(()=>{
    const map = new Map();
    for(const t of trades){
      const v = computeDollarPnL(t,accType);
      if(v===null || !isFinite(v)) continue;
      const key = t.strategy || "N/A";
      const rec = map.get(key) || {count:0,wins:0,pnl:0};
      rec.count += 1; rec.pnl += v; if(v>0) rec.wins += 1;
      map.set(key,rec);
    }
    const rows = [...map.entries()].map(([name,rec])=>({
      name, ...rec, winRate: rec.count? Math.round((rec.wins/rec.count)*100):0,
      color: (strategies.find(s=>s.name===name)?.color)||"default"
    }));
    rows.sort((a,b)=> b.wins - a.wins || b.winRate - a.winRate || b.pnl - a.pnl);
    return rows[0] || null;
  },[trades,accType,strategies]);
  if(!data) return null;
  const pct = Math.max(0, Math.min(100, data.winRate));
  const R=60, C=2*Math.PI*R, val = (pct/100)*C;
  return(
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4">
      <div className="text-sm font-semibold mb-2">Best Strategy</div>
      <div className="flex items-center gap-6">
        <svg width="160" height="100" viewBox="0 0 160 100">
          <g transform="translate(20,90)">
            <path d={`M0 0 A ${R} ${R} 0 1 1 ${2*R} 0`} fill="none" stroke="#1f2937" strokeWidth="10" />
            <path d={`M0 0 A ${R} ${R} 0 1 1 ${2*R} 0`} fill="none" stroke="#0ea5e9" strokeWidth="10" strokeDasharray={`${val} ${C-val}`} strokeLinecap="round"/>
            <text x="60" y="-10" textAnchor="middle" className="svg-text" fill="#e5e7eb" fontSize="18" fontWeight="700">{pct}%</text>
          </g>
        </svg>
        <div>
          <div className={`text-lg font-semibold ${STRAT_COLORS[data.color]||""}`}>{data.name}</div>
          <div className="text-slate-300 text-sm">Win rate: {pct}% · Trades: {data.count}</div>
          <div className={`text-sm ${data.pnl>0?'text-green-400':data.pnl<0?'text-red-400':'text-amber-400'}`}>P&L: {formatPnlDisplay(accType,data.pnl)}</div>
        </div>
      </div>
    </div>
  )
}

/* ---------- App Shell ---------- */
function UserMenu({name,email,onLogout}){
  return(
    <div className="flex items-center gap-3">
      <img src={LOGO_PUBLIC} onError={(e)=>{e.currentTarget.src="./logo-ng.png"}} alt="logo" className="h-6 w-6 rounded-md"/>
      <div className="text-sm">
        <div className="font-semibold leading-tight">{name||email}</div>
        <div className="text-slate-400 text-[11px] leading-tight">{email}</div>
      </div>
      <button onClick={onLogout} className="ml-2 px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800"><IconLogout className="inline mr-1"/>Logout</button>
    </div>
  )
}
function Header({onExport,onImport,onLogout,name,email}){
  return(
    <div className="sticky top-0 z-20 bg-slate-900/80 backdrop-blur border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-3 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={LOGO_PUBLIC} onError={(e)=>{e.currentTarget.src="./logo-ng.png"}} className="h-8 w-8 rounded-xl" alt="logo"/>
          <div className="text-lg font-semibold">Nitty Gritty</div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onExport} className="px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800"><IconDownload className="inline mr-1"/>Export</button>
          <button onClick={onImport} className="px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800"><IconUpload className="inline mr-1"/>Import</button>
          <UserMenu name={name} email={email} onLogout={onLogout}/>
        </div>
      </div>
    </div>
  )
}
function AppShell({children,nav,capitalPanel,logoSrc,onToggleSidebar,onExport,onImport,onLogout,sidebarCollapsed}){
  const state=usePersisted(getCurrent())[0];
  return(
    <div className="min-h-full">
      <Header onExport={onExport} onImport={onImport} onLogout={onLogout} name={state?.name} email={state?.email}/>
      <div className="max-w-7xl mx-auto px-3 py-4 grid grid-cols-12 gap-4">
        <aside className={`${sidebarCollapsed?'col-span-2':'col-span-3'} space-y-4`}>
          <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4">{capitalPanel}</div>
          <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-2">{nav}</div>
        </aside>
        <main className={`${sidebarCollapsed?'col-span-10':'col-span-9'} space-y-4`}>
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
      </div>
    </div>
  )
}

/* ---------- Auth Views ---------- */
function ResetModal({email:onEmail,onClose}){
  const [email,setEmail]=useState(onEmail||"");
  const [msg,setMsg]=useState("");
  const send=async()=>{
    try{
      if(typeof emailjs!=="undefined"){
        await emailjs.send("service_default","template_reset",{to_email:email,reset_link:location.origin+"#reset=dummytoken"});
        setMsg("Reset email sent (demo).");
      }else setMsg("EmailJS not available");
    }catch(e){setMsg("Failed to send");}
  };
  return(
    <Modal title="Reset Password" onClose={onClose}>
      <div className="space-y-3">
        <input className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2" placeholder="your@email.com" value={email} onChange={e=>setEmail(e.target.value)}/>
        <div className="text-right"><button onClick={send} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500">Send reset link</button></div>
        {msg&&<div className="text-sm text-sky-400">{msg}</div>}
      </div>
    </Modal>
  )
}
function NewPasswordModal({token,onClose}){
  const [pw1,setPw1]=useState(""); const [pw2,setPw2]=useState("");
  return(
    <Modal title="Set New Password" onClose={onClose}>
      <div className="space-y-3">
        <input type="password" value={pw1} onChange={e=>setPw1(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2" placeholder="New password"/>
        <input type="password" value={pw2} onChange={e=>setPw2(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2" placeholder="Confirm password"/>
        <div className="text-right">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500">Save</button>
        </div>
      </div>
    </Modal>
  )
}
function LoginView({onLogin,onSignup,initGoogle,resetStart}){
  const [tab,setTab]=useState("login");
  const googleDiv=useRef(null);
  useEffect(()=>{initGoogle(googleDiv.current,(email)=>onLogin(email,"__google__",()=>{}))},[]);
  const [name,setName]=useState(""); const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [err,setErr]=useState("");
  return(
    <div className="min-h-screen hero">
      <div className="min-h-screen bg-slate-950/70">
        <div className="max-w-7xl mx-auto px-3 py-10">
          <div className="max-w-xl mx-auto bg-slate-900/70 border border-slate-700 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <img src={LOGO_PUBLIC} onError={(e)=>{e.currentTarget.src="./logo-ng.png"}} className="h-8 w-8 rounded-xl"/>
              <div className="text-xl font-semibold">Nitty Gritty</div>
            </div>
            <div className="flex gap-2 mb-4">
              <button onClick={()=>setTab("login")} className={`px-3 py-1.5 rounded-lg border ${tab==="login"?"bg-slate-700 border-slate-600":"border-slate-700"}`}>Login</button>
              <button onClick={()=>setTab("signup")} className={`px-3 py-1.5 rounded-lg border ${tab==="signup"?"bg-slate-700 border-slate-600":"border-slate-700"}`}>Sign up</button>
            </div>
            {tab==="login"&&(
              <div className="space-y-3">
                <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/>
                <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/>
                {err&&<div className="text-sm text-red-300">{err}</div>}
                <div className="flex items-center justify-between">
                  <button onClick={()=>onLogin(email,password,setErr)} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500">Login</button>
                  <button onClick={resetStart} className="text-sm text-sky-400">Forgot password?</button>
                </div>
                <div className="my-3 text-slate-400 text-center text-sm">or</div>
                <div ref={googleDiv} />
              </div>
            )}
            {tab==="signup"&&(
              <div className="space-y-3">
                <input value={name} onChange={e=>setName(e.target.value)} placeholder="Name" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/>
                <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/>
                <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/>
                {err&&<div className="text-sm text-red-300">{err}</div>}
                <div className="text-right"><button onClick={()=>onSignup(name,email,password,setErr)} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500">Create account</button></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------- App ---------- */
function usePersisted(email){
  const fresh = () => ({name:"",email:email||"",accType:ACC_TYPES[1],capital:0,depositDate:todayISO(),trades:[]});
  const [state,setState]=React.useState(()=>{const s=loadState(email||getCurrent());return s||fresh()});
  React.useEffect(()=>{const loaded = loadState(email); setState(loaded || fresh());}, [email]);
  React.useEffect(()=>{if(!state||!state.email)return; saveState(state.email,state)},[state]);
  return [state,setState];
}

function App(){
  const [currentEmail,setCurrentEmail]=useState(getCurrent());
  const [users,setUsers]=useState(loadUsers());
  const [state,setState]=usePersisted(currentEmail);
  const [cfg,setCfg]=useState(()=>loadCfg(currentEmail)||{symbols:DEFAULT_SYMBOLS,strategies:DEFAULT_STRATEGIES});
  useEffect(()=>{if(state?.email) saveCfg(state.email,cfg)},[cfg,state?.email]);
  const [page,setPage]=useState("dashboard");
  const [showTrade,setShowTrade]=useState(false); const [editItem,setEditItem]=useState(null);
  const [showAcct,setShowAcct]=useState(false);
  const [showCal,setShowCal]=useState(false); const now=new Date(); const [calView,setCalView]=useState("month"); const [calMonth,setCalMonth]=useState(now.getMonth()); const [calYear,setCalYear]=useState(now.getFullYear()); const [calSel,setCalSel]=useState(todayISO());
  const [collapsed,setCollapsed]=useState(false);
  const [showReset,setShowReset]=useState(false); const [resetToken,setResetToken]=useState("");

  useEffect(()=>{const hash=new URLSearchParams(location.hash.slice(1));const tok=hash.get("reset"); if(tok){setResetToken(tok)}},[]);
  useEffect(()=>{if(state&&(!state.name||!state.depositDate)) setShowAcct(true)},[state?.email]);
  useEffect(()=>{if(typeof emailjs !== 'undefined'){emailjs.init({publicKey: "qQucnU6BE7h1zb5Ex"});}},[]);

  const onExport=()=>{const csv=toCSV(state.trades,state.accType);const blob=new Blob([csv],{type:"text/csv;charset=utf-8;"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="Nitty_Gritty_Template_Export.csv";a.click();URL.revokeObjectURL(url)};

  /* ---- Import (FIX): single SheetJS path for CSV/XLS/XLSX ---- */
  const __importEl = (window.__ngImportEl ||= (() => {
    const el = document.createElement('input');
    el.type = 'file';
    el.accept = '.csv,.xls,.xlsx';
    el.style.display = 'none';
    document.body.appendChild(el);
    return el;
  })());
  function openImportDialog(){ __importEl.value = ''; __importEl.click(); }
  if (!__importEl.__ngBound){
    __importEl.addEventListener('change', async (e)=>{
      const f = e.target.files?.[0]; if(!f) return;
      const name = f.name.toLowerCase();
      let wb;
      if (name.endsWith('.csv')) {
        const txt = await f.text();
        wb = XLSX.read(txt, { type:'string' });
      } else {
        const ab = await f.arrayBuffer();
        wb = XLSX.read(ab, { type:'array' });
      }
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { defval:'', raw:false });
      const trades = rowsToTrades(rows);
      setState(s => ({ ...s, trades: [...trades.reverse(), ...s.trades] }));
    });
    __importEl.__ngBound = true;
  }

  const onLogout=()=>{saveCurrent("");setCurrentEmail("")};
  const initGoogle=(container,onEmail)=>{
    const clientId=window.GOOGLE_CLIENT_ID;
    if(!window.google||!clientId||!container) return;
    window.google.accounts.id.initialize({client_id:clientId,callback:(resp)=>{try{const p=JSON.parse(atob(resp.credential.split('.')[1])); if(p&&p.email){onEmail(p.email)}}catch{}}});
    window.google.accounts.id.renderButton(container,{theme:"outline",size:"large",text:"signin_with",shape:"pill"});
  };
  const login=(email,password,setErr)=>{const u=users.find(x=>x.email.toLowerCase()===email.toLowerCase());
    if(!u){ if(password==="__google__"){const nu=[...users,{name:email.split("@")[0],email,password:""}]; setUsers(nu); saveUsers(nu); const fresh={name:email.split("@")[0],email,accType:ACC_TYPES[1],capital:0,depositDate:todayISO(),trades:[]}; saveState(email,fresh); saveCurrent(email); setCfg({symbols:DEFAULT_SYMBOLS,strategies:DEFAULT_STRATEGIES}); return;}
      setErr("No such user. Please sign up."); return;}
    if(password!=="__google__" && u.password!==password){setErr("Wrong password.");return}
    setErr(""); saveCurrent(u.email); setCurrentEmail(u.email); setCfg(loadCfg(u.email)||{symbols:DEFAULT_SYMBOLS,strategies:DEFAULT_STRATEGIES});
  };
  const signup=(name,email,password,setErr)=>{if(users.some(x=>x.email.toLowerCase()===email.toLowerCase())){setErr("Email already registered.");return}
    const u={name,email,password}; const nu=[...users,u]; setUsers(nu); saveUsers(nu);
    const fresh={name,email,accType:ACC_TYPES[1],capital:0,depositDate:todayISO(),trades:[]}; saveState(email,fresh); saveCurrent(email); setCurrentEmail(email);
    setCfg({symbols:DEFAULT_SYMBOLS,strategies:DEFAULT_STRATEGIES});
  };
  const resetStart=()=>{setShowReset(true)};

  const addOrUpdate=(draft)=>{const id=draft.id||Math.random().toString(36).slice(2); const arr=state.trades.slice(); const idx=arr.findIndex(t=>t.id===id); const rec={...draft,id}; if(idx>=0)arr[idx]=rec; else arr.unshift(rec); setState({...state,trades:arr})};
  const delTrade=(id)=>setState({...state,trades:state.trades.filter(t=>t.id!==id)});

  const openTrades=state.trades.filter(t=> !t.exitType || t.exitType === "Trade In Progress").length;
  const realized=state.trades
      .filter(t=>new Date(t.date)>=new Date(state.depositDate)&&t.exitType && t.exitType !== "Trade In Progress")
      .map(t=>computeDollarPnL(t,state.accType))
      .filter(v=>v!==null&&isFinite(v))
      .reduce((a,b)=>a+b,0);
  const effectiveCapital=state.capital+realized;

  if(resetToken){return <NewPasswordModal token={resetToken} onClose={()=>{setResetToken(""); location.hash=""}}/>}
  if(!currentEmail){return <><LoginView onLogin={login} onSignup={signup} initGoogle={initGoogle} resetStart={resetStart}/>{showReset&&<ResetModal email="" onClose={()=>setShowReset(false)}/>}</>}

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
    {navBtn("Notes","notes",IconNote)}
    {navBtn("Settings","settings",IconSettings)}
  </>);

  return(
    <AppShell capitalPanel={capitalPanel} nav={nav}
      onToggleSidebar={()=>setCollapsed(v=>!v)} onExport={onExport} onImport={openImportDialog} onLogout={()=>{saveCurrent("");setCurrentEmail("")}} sidebarCollapsed={collapsed}>
      {page==="dashboard"&&(<div className="space-y-4">
        <div className="text-sm font-semibold">General statistics</div>
        <GeneralStats trades={state.trades} accType={state.accType} capital={state.capital} depositDate={state.depositDate}/>
        <DetailedStats trades={state.trades} accType={state.accType}/>
        <BestStrategy trades={state.trades} accType={state.accType} strategies={cfg.strategies}/>
      </div>)}
      {page==="histories"&&(<Histories trades={state.trades} accType={state.accType} onEdit={t=>{setEditItem(t);setShowTrade(true)}} onDelete={delTrade} strategies={cfg.strategies}/>)}
      {page==="notes"&&(<NotesPanel trades={state.trades}/>)}
      {page==="settings"&&(<SettingsPanel
        name={state.name} setName={v=>setState({...state,name:v})}
        accType={state.accType} setAccType={v=>setState({...state,accType:v})}
        capital={state.capital} setCapital={v=>setState({...state,capital:v||0})}
        depositDate={state.depositDate} setDepositDate={v=>setState({...state,depositDate:v})}
        email={state.email}
        cfg={cfg} setCfg={(n)=>{setCfg(n); saveCfg(state.email,n)}}
      />)}
      {showTrade&&(<TradeModal initial={editItem} onClose={()=>{setShowTrade(false);setEditItem(null)}} onSave={addOrUpdate} onDelete={delTrade} accType={state.accType} symbols={cfg.symbols} strategies={cfg.strategies}/>)}
      {showAcct&&(<AccountSetupModal name={state.name} setName={v=>setState({...state,name:v})} accType={state.accType} setAccType={v=>setState({...state,accType:v})} capital={state.capital} setCapital={v=>setState({...state,capital:v||0})} depositDate={state.depositDate} setDepositDate={v=>setState({...state,depositDate:v})} onClose={()=>setShowAcct(false)} email={state.email}/>)}
      {showCal&&(<CalendarModal onClose={()=>setShowCal(false)} trades={state.trades} view={calView} setView={setCalView} month={calMonth} setMonth={setCalMonth} year={calYear} setYear={setCalYear} selectedDate={calSel} setSelectedDate={setCalSel} accType={state.accType}/>)}
      {showReset&&(<ResetModal email="" onClose={()=>setShowReset(false)}/>)}
    </AppShell>
  )
}

/* -------- Mount -------- */
ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
