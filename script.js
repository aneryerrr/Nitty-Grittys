/* Nitty Gritty — reverted classic UI + 3 targeted fixes
   1) Import parsing dedup & proper row mapping (no repeated single row)
   2) "Best Strategy" card restored on dashboard
   3) Clean, professional Settings icon
   No other UI/feature changes
*/
const { useState, useEffect, useMemo, useRef } = React;

/* ---------- Icons (simple, consistent) ---------- */
const iconCls = "h-5 w-5";
const IconHome = (p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconCls} {...p}><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9v12h14V9"/></svg>);
const IconHistory = (p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconCls} {...p}><path d="M12 8v5l3 3"/><path d="M12 3a9 9 0 1 0 9 9"/><path d="M21 3v6h-6"/></svg>);
const IconCalendar = (p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconCls} {...p}><path d="M8 3v4M16 3v4"/><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18"/></svg>);
const IconNote = (p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconCls} {...p}><path d="M3 7a2 2 0 0 1 2-2h8l4 4v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><path d="M13 3v4h4"/></svg>);
const IconCog = (p)=>(/* clean gear */<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconCls} {...p}><circle cx="12" cy="12" r="3.5"/><path d="M19.4 15a2 2 0 0 0 .3 2.2l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a2 2 0 0 0-2.2-.3 2 2 0 0 0-1 .6 2 2 0 0 0-.4 1V22a2 2 0 1 1-4 0v-.1a2 2 0 0 0-.4-1 2 2 0 0 0-1-.6 2 2 0 0 0-2.2.3l-.1.1A2 2 0 1 1 4.2 17.3l.1-.1a2 2 0 0 0 .3-2.2 2 2 0 0 0-.6-1 2 2 0 0 0-1-.4H2a2 2 0 1 1 0-4h.1a2 2 0 0 0 1-.4 2 2 0 0 0 .6-1 2 2 0 0 0-.3-2.2l-.1-.1A2 2 0 1 1 6.2 4.2l.1.1a2 2 0 0 0 2.2.3 2 2 0 0 0 1-.6 2 2 0 0 0 .4-1V2a2 2 0 1 1 4 0v.1a2 2 0 0 0 .4 1 2 2 0 0 0 1 .6 2 2 0 0 0 2.2-.3l.1-.1A2 2 0 1 1 19.8 6l-.1.1a2 2 0 0 0-.3 2.2 2 2 0 0 0 .6 1 2 2 0 0 0 1 .4H22a2 2 0 1 1 0 4h-.1a2 2 0 0 0-1 .4 2 2 0 0 0-.6 1Z"/></svg>);
const IconPlus = (p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconCls} {...p}><path d="M12 5v14M5 12h14"/></svg>);
const IconDownload = (p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconCls} {...p}><path d="M12 3v10"/><path d="M8 11l4 4 4-4"/><path d="M5 21h14v-4H5Z"/></svg>);
const IconUpload = (p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconCls} {...p}><path d="M12 21V11"/><path d="M8 15l4-4 4 4"/><path d="M5 10V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3"/></svg>);

/* ---------- Minimal constants (unchanged UI) ---------- */
const ACC_TYPES = ["Cent Account", "Dollar Account"];
const DEFAULT_SYMBOLS = ["XAUUSD","US100","US30","EURUSD","BTCUSD","AUDCAD","USDCAD","USDJPY","GBPUSD"];
const DEFAULT_STRATEGIES = [
  { name:"Trend Line Bounce", color:"default" },
  { name:"2 Touch Point Trend Line Break", color:"default" },
  { name:"3 / 3+ Touch Point Trend Line Break", color:"default" },
  { name:"Trend Line Break & Re-test", color:"default" },
  { name:"Trend Continuation", color:"default" },
];
const EXIT_TYPES = ["TP","SL","TP1_BE","TP1_SL","BE","Trade In Progress"];
const STRAT_COLORS = { default:"", green:"text-green-400", red:"text-red-400", mustard:"text-amber-400" };

/* ---------- Utilities ---------- */
const USERS_KEY="ng_users_v1";
const CURR_KEY="ng_current_user_v1";
const CFG_KEY = (email)=>"ng_cfg_"+email;
const stateKey = (email)=>"ng_state_"+email;

const loadUsers=()=>{try{return JSON.parse(localStorage.getItem(USERS_KEY)||"[]")}catch{return[]}};
const saveUsers=u=>{try{localStorage.setItem(USERS_KEY,JSON.stringify(u))}catch{}};
const saveCurrent=e=>{try{localStorage.setItem(CURR_KEY,e)}catch{}};
const getCurrent=()=>{try{return localStorage.getItem(CURR_KEY)||""}catch{return""}};
const loadState=e=>{try{return JSON.parse(localStorage.getItem(stateKey(e))||"null")}catch{return null}};
const saveState=(e,s)=>{try{localStorage.setItem(stateKey(e),JSON.stringify(s))}catch{}};
const loadCfg=(e)=>{try{return JSON.parse(localStorage.getItem(CFG_KEY(e))||"null")}catch{return null}};
const saveCfg=(e,c)=>{try{localStorage.setItem(CFG_KEY(e),JSON.stringify(c))}catch{}};

const r2=n=>Math.round(n*100)/100;
const fmt$=n=>"${}".replace("{}", (isFinite(n)?r2(n):0).toFixed(2));
const todayISO=()=>{const d=new Date(); const tz=d.getTimezoneOffset(); return new Date(d.getTime()-tz*60000).toISOString().slice(0,10)};

/* Tick/pip to $ calc (unchanged) */
function perLotValueForMove(symbol,delta,accType){
  const abs=Math.abs(delta); const isStd=accType==="Dollar Account"; const mult=std=>isStd?std:std/100;
  switch(symbol){
    case"US30":case"US100": return abs*mult(10);
    case"XAUUSD": return abs*mult(100);
    case"BTCUSD": return abs*mult(1);
    case"EURUSD":case"GBPUSD": { const pips=abs/0.0001; return pips*mult(10); }
    case"AUDCAD":case"USDCAD": { const pips=abs/0.0001; return pips*mult(7.236); }
    case"USDJPY": { const pips=abs/0.01; return pips*mult(6.795); }
    default: return 0;
  }
}
function legPnL(symbol,side,entry,exit,lot,accType){
  const raw=perLotValueForMove(symbol,exit-entry,accType)*(lot||0);
  const s = side==="BUY" ? Math.sign(exit-entry) : -Math.sign(exit-entry);
  return raw*s;
}
function computeDollarPnL(t,accType){
  if (typeof t.pnlOverride === "number" && isFinite(t.pnlOverride)) return t.pnlOverride;
  if (t.exitType==="Trade In Progress") return null;
  const has=v=>typeof v==="number"&&isFinite(v);
  if (has(t.exit) && (!t.exitType || t.exitType==="TP")) return legPnL(t.symbol,t.side,t.entry,t.exit,t.lotSize,accType);
  switch(t.exitType){
    case"SL": return has(t.sl)?legPnL(t.symbol,t.side,t.entry,t.sl,t.lotSize,accType):null;
    case"TP": return has(t.tp2)?legPnL(t.symbol,t.side,t.entry,t.tp2,t.lotSize,accType):has(t.tp1)?legPnL(t.symbol,t.side,t.entry,t.tp1,t.lotSize,accType):null;
    case"TP1_BE": return has(t.tp1)? (legPnL(t.symbol,t.side,t.entry,t.tp1,t.lotSize,accType))/2 : null;
    case"TP1_SL": return (has(t.tp1)&&has(t.sl))? (legPnL(t.symbol,t.side,t.entry,t.tp1,t.lotSize,accType)+legPnL(t.symbol,t.side,t.entry,t.sl,t.lotSize,accType))/2 : null;
    case"BE": return 0;
    default: return null;
  }
}
const formatPnlDisplay=(accType,v)=>accType==="Cent Account"?(r2(v*100)).toFixed(2)+" ¢":fmt$(v);

/* ---------- CSV <-> trades ---------- */
const HEADER_MAP = {
  "Date":"date","Symbol":"symbol","Side":"side","Lot Size":"lotSize",
  "Entry":"entry","Exit":"exit","TP1":"tp1","TP2":"tp2","SL":"sl",
  "Strategy":"strategy","Exit Type":"exitType"
};
function rowsToTrades(rows){
  // Build a fresh object per row; normalize names; ignore fully-blank rows.
  const out = [];
  for (const r of rows){
    const hasAny = Object.values(r).some(v => String(v??"").trim()!=="");
    if (!hasAny) continue;

    const t={};
    for (const [H,K] of Object.entries(HEADER_MAP)){
      t[K] = r[H] ?? r[H.toLowerCase()] ?? r[H.replace(/\s/g,'')] ?? '';
    }
    const num=v=>(v===''||v==null)?undefined:parseFloat(v);
    out.push({
      id: Math.random().toString(36).slice(2),
      date: t.date || todayISO(),
      symbol: String(t.symbol||'').toUpperCase(),
      side: (String(t.side||'BUY').toUpperCase()==='SELL')?'SELL':'BUY',
      lotSize: num(t.lotSize)||0.01,
      entry: num(t.entry),
      exit:  num(t.exit),
      tp1:   num(t.tp1),
      tp2:   num(t.tp2),
      sl:    num(t.sl),
      strategy: t.strategy || DEFAULT_STRATEGIES[0].name,
      exitType: t.exitType || "Trade In Progress",
    });
  }
  // Light dedup signature to prevent the "same row repeated 1000x" issue
  const seen = new Set();
  return out.filter(t=>{
    const sig = [t.date,t.symbol,t.side,t.lotSize,t.entry,t.exit,t.tp1,t.tp2,t.sl,t.strategy,t.exitType].join("|");
    if (seen.has(sig)) return false; seen.add(sig); return true;
  });
}
function toCSV(trades,accType){
  const cols=["Date","Symbol","Side","Lot Size","Entry","Exit","TP1","TP2","SL","Strategy","Exit Type","P&L ($)"];
  const lines=[cols.join(",")];
  trades.forEach(t=>{
    const pnl=computeDollarPnL(t,accType);
    lines.push([
      t.date,t.symbol,t.side,t.lotSize??"",t.entry??"",t.exit??"",t.tp1??"",t.tp2??"",t.sl??"",t.strategy??"",t.exitType??"",
      isFinite(pnl)?r2(pnl):""
    ].map(v=>v==null?"":String(v)).join(","));
  });
  return lines.join("\r\n");
}

/* ---------- Small UI helpers (unchanged visual style) ---------- */
function Th({children,className}){return(<th className={`px-4 py-3 text-left font-semibold text-slate-300 ${className||""}`}>{children}</th>)}
function Td({children,className}){return(<td className={`px-4 py-3 align-top ${className||""}`}>{children}</td>)}
function Stat({label,value}){return(<div className="bg-slate-900/50 border border-slate-700 rounded-xl p-3"><div className="text-slate-400 text-xs">{label}</div><div className="text-2xl font-bold mt-1">{value}</div></div>)}
function Modal({title,children,onClose}){
  return(
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-3">
      <div className="relative w-[95vw] max-w-3xl max-h-[80vh] overflow-auto bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-slate-800">
          <div className="font-semibold">{title}</div>
          <button onClick={onClose} className="px-3 py-1.5 rounded-lg border border-slate-600 hover:bg-slate-700">✕</button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}

/* ---------- Views (same layout) ---------- */
function Header({onExport,onImport,user,onLogout}){
  return(
    <div className="bg-slate-900 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-3 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="./logo-ng.png" className="h-8 w-8 rounded-xl" alt="logo"/>
          <div className="text-lg font-semibold">Nitty Gritty</div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onExport} className="px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800"><IconDownload className="inline mr-1"/>Export</button>
          <button onClick={onImport} className="px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800"><IconUpload className="inline mr-1"/>Import</button>
          <div className="ml-2 text-sm">
            <div className="font-semibold leading-tight">{user.name||user.email}</div>
            <div className="text-slate-400 text-[11px] leading-tight">{user.email}</div>
          </div>
          <button onClick={onLogout} className="ml-2 px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800">Logout</button>
        </div>
      </div>
    </div>
  );
}
const NavBtn = ({label,active,onClick,Icon})=>(
  <button onClick={onClick} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border ${active?'bg-slate-700 border-slate-600':'border-slate-700 hover:bg-slate-800'}`}>
    {Icon ? <Icon/> : null}<span>{label}</span>
  </button>
);

function SettingsPanel({state,setState,cfg,setCfg}){
  const [tab,setTab]=useState("personal");
  const [pw1,setPw1]=useState(""); const [pw2,setPw2]=useState(""); const [msg,setMsg]=useState("");
  const users=loadUsers();
  const savePw=()=>{
    if(!pw1||pw1.length<6){setMsg("Password must be at least 6 characters.");return}
    if(pw1!==pw2){setMsg("Passwords do not match.");return}
    const i=users.findIndex(u=>u.email.toLowerCase()===state.email.toLowerCase());
    if(i>=0){users[i].password=pw1;saveUsers(users);setMsg("Password updated.");setPw1("");setPw2("")}
  };
  const [symText,setSymText]=useState("");
  const [stratText,setStratText]=useState(""); const [stratColor,setStratColor]=useState("default");

  return(
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4"><IconCog/><div className="font-semibold">Settings</div></div>
      <div className="flex gap-2 mb-4">
        <button onClick={()=>setTab("personal")} className={`px-3 py-1.5 rounded-lg border ${tab==="personal"?"bg-slate-700 border-slate-600":"border-slate-700"}`}>Account Setup</button>
        <button onClick={()=>setTab("security")} className={`px-3 py-1.5 rounded-lg border ${tab==="security"?"bg-slate-700 border-slate-600":"border-slate-700"}`}>Privacy & Security</button>
        <button onClick={()=>setTab("customize")} className={`px-3 py-1.5 rounded-lg border ${tab==="customize"?"bg-slate-700 border-slate-600":"border-slate-700"}`}>Customize Journal</button>
      </div>

      {tab==="personal"&&(
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><div className="text-sm text-slate-300">Name</div><input value={state.name} onChange={e=>setState({...state,name:e.target.value})} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
          <div><div className="text-sm text-slate-300">Acc Type</div><select value={state.accType} onChange={e=>setState({...state,accType:e.target.value})} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2">{ACC_TYPES.map(s=><option key={s}>{s}</option>)}</select></div>
          <div><div className="text-sm text-slate-300">Capital ($)</div><input type="number" value={state.capital} onChange={e=>setState({...state,capital:parseFloat(e.target.value||"0")})} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
          <div className="md:col-span-3"><div className="text-sm text-slate-300">Deposit Date</div><input type="date" value={state.depositDate} onChange={e=>setState({...state,depositDate:e.target.value})} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
        </div>
      )}

      {tab==="security"&&(
        <div className="space-y-3">
          <div><div className="text-sm text-slate-300">New Password</div><input type="password" value={pw1} onChange={e=>setPw1(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
          <div><div className="text-sm text-slate-300">Confirm Password</div><input type="password" value={pw2} onChange={e=>setPw2(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
          {msg&&<div className="text-sky-400 text-sm">{msg}</div>}
          <div className="text-right"><button onClick={savePw} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500">Update Password</button></div>
        </div>
      )}

      {tab==="customize"&&(
        <div className="space-y-6">
          <div>
            <div className="font-semibold mb-2">Symbols</div>
            <div className="flex gap-2 mb-2">
              <input value={symText} onChange={e=>setSymText(e.target.value.toUpperCase())} className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2" placeholder="XAUUSD"/>
              <button onClick={()=>{ if(symText){ const n={...cfg,symbols:[...new Set([...cfg.symbols,symText])]}; setCfg(n); saveCfg(state.email,n); setSymText(""); }}} className="px-3 py-2 rounded-lg border border-slate-700">Add</button>
            </div>
            <div className="flex flex-wrap gap-2">{cfg.symbols.map(s=><span key={s} className="px-2 py-1 rounded-lg border border-slate-700">{s} <button onClick={()=>{const n={...cfg,symbols:cfg.symbols.filter(x=>x!==s)}; setCfg(n); saveCfg(state.email,n);}} className="ml-1 text-red-300">×</button></span>)}</div>
          </div>
          <div>
            <div className="font-semibold mb-2">Strategies</div>
            <div className="flex gap-2 mb-2">
              <input value={stratText} onChange={e=>setStratText(e.target.value)} className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2" placeholder="Strategy name"/>
              <select value={stratColor} onChange={e=>setStratColor(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2">
                <option value="default">Default</option><option value="green">Green</option><option value="red">Red</option><option value="mustard">Mustard</option>
              </select>
              <button onClick={()=>{ if(stratText){ const n={...cfg,strategies:[...cfg.strategies,{name:stratText,color:stratColor}]}; setCfg(n); saveCfg(state.email,n); setStratText(""); }}} className="px-3 py-2 rounded-lg border border-slate-700">Add</button>
            </div>
            <div className="space-y-2">
              {cfg.strategies.map((st,i)=>(
                <div key={i} className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-lg border border-slate-700 ${STRAT_COLORS[st.color]||""}`}>{st.name}</span>
                  <select value={st.color} onChange={e=>{const ns=[...cfg.strategies]; ns[i]={...st,color:e.target.value}; const n={...cfg,strategies:ns}; setCfg(n); saveCfg(state.email,n);}} className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1">
                    <option value="default">Default</option><option value="green">Green</option><option value="red">Red</option><option value="mustard">Mustard</option>
                  </select>
                  <button onClick={()=>{const n={...cfg,strategies:cfg.strategies.filter((_,k)=>k!==i)}; setCfg(n); saveCfg(state.email,n);}} className="text-red-300 px-2 py-1 rounded-lg border border-red-700">Remove</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Histories({trades,accType,onEdit,onDelete,cfg}){
  const cols=["Date","Symbol","Side","Lot","Entry","Exit","TP1","TP2","SL","Strategy","Exit","P&L"];
  return(
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-700 font-semibold">Histories</div>
      <div className="overflow-auto scrollbar">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-900/60">
            <tr>
              {cols.map(c=><Th key={c}>{c}</Th>)}
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {trades.map(t=>{
              const pnl=computeDollarPnL(t,accType);
              const sc = (cfg.strategies.find(s=>s.name===t.strategy)?.color)||"default";
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
                  <Td className={`${STRAT_COLORS[sc]||""}`}>{t.strategy}</Td>
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
            {!trades.length&&(<tr><Td colSpan={cols.length+1}><div className="text-slate-400 py-6">No trades yet.</div></Td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* Best Strategy — restored, compact */
function BestStrategy({trades,accType,cfg}){
  const top = useMemo(()=>{
    const m=new Map();
    for(const t of trades){
      const v=computeDollarPnL(t,accType);
      if(v===null||!isFinite(v)) continue;
      const key=t.strategy||"N/A";
      const rec=m.get(key)||{count:0,wins:0,pnl:0};
      rec.count++; rec.pnl+=v; if(v>0) rec.wins++; m.set(key,rec);
    }
    const rows=[...m.entries()].map(([name,rec])=>({name,...rec,winRate:rec.count?Math.round((rec.wins/rec.count)*100):0,color:(cfg.strategies.find(s=>s.name===name)?.color)||"default"}));
    rows.sort((a,b)=> b.wins - a.wins || b.winRate - a.winRate || b.pnl - a.pnl);
    return rows[0]||null;
  },[trades,accType,cfg]);
  if(!top) return null;

  const pct = Math.max(0,Math.min(100,top.winRate));
  const R=48, C=2*Math.PI*R, val=(pct/100)*C;

  return(
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4">
      <div className="text-sm font-semibold mb-2">Best Strategy</div>
      <div className="flex items-center gap-4">
        <svg width="130" height="90" viewBox="0 0 130 90">
          <g transform="translate(10,75)">
            <path d={`M0 0 A ${R} ${R} 0 1 1 ${2*R} 0`} fill="none" stroke="#1f2937" strokeWidth="10"/>
            <path d={`M0 0 A ${R} ${R} 0 1 1 ${2*R} 0`} fill="none" stroke="#0ea5e9" strokeWidth="10" strokeDasharray={`${val} ${C-val}`} strokeLinecap="round"/>
            <text x="48" y="-8" textAnchor="middle" className="svg-text" fill="#e5e7eb" fontSize="16" fontWeight="700">{pct}%</text>
          </g>
        </svg>
        <div>
          <div className={`text-base font-semibold ${STRAT_COLORS[top.color]||""}`}>{top.name}</div>
          <div className="text-slate-300 text-sm">Win rate: {pct}% · Trades: {top.count}</div>
          <div className={`text-sm ${top.pnl>0?'text-green-400':top.pnl<0?'text-red-400':'text-amber-400'}`}>P&L: {formatPnlDisplay(accType,top.pnl)}</div>
        </div>
      </div>
    </div>
  )
}

/* ---------- Auth, App shell, Calendar, Notes — unchanged behavior/feel ---------- */
function TradeModal({initial,onClose,onSave,onDelete,accType,symbols,cfg}){
  const [d,setD]=useState(()=>initial?{...initial}:{date:todayISO(),symbol:symbols[0]||"XAUUSD",side:"BUY",lotSize:0.01,entry:undefined,exit:undefined,tp1:undefined,tp2:undefined,sl:undefined,exitType:"Trade In Progress",strategy:cfg.strategies[0]?.name||"Trend Line Bounce"});
  const change=(k,v)=>setD(x=>({...x,[k]:v}));
  const hasId=!!initial?.id;
  return(
    <Modal title={hasId?"Edit Trade":"Add Trade"} onClose={onClose}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div><div className="text-xs text-slate-300">Date</div><input type="date" value={d.date} onChange={e=>change("date",e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
        <div><div className="text-xs text-slate-300">Symbol</div><select value={d.symbol} onChange={e=>change("symbol",e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2">{symbols.map(s=><option key={s}>{s}</option>)}</select></div>
        <div><div className="text-xs text-slate-300">Side</div><select value={d.side} onChange={e=>change("side",e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"><option>BUY</option><option>SELL</option></select></div>
        <div><div className="text-xs text-slate-300">Lot</div><input type="number" step="0.01" value={d.lotSize} onChange={e=>change("lotSize",parseFloat(e.target.value||"0"))} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
        <div><div className="text-xs text-slate-300">Entry</div><input type="number" step="0.00001" value={d.entry??""} onChange={e=>change("entry",parseFloat(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
        <div><div className="text-xs text-slate-300">Exit</div><input type="number" step="0.00001" value={d.exit??""} onChange={e=>change("exit",parseFloat(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
        <div><div className="text-xs text-slate-300">TP1</div><input type="number" step="0.00001" value={d.tp1??""} onChange={e=>change("tp1",parseFloat(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
        <div><div className="text-xs text-slate-300">TP2</div><input type="number" step="0.00001" value={d.tp2??""} onChange={e=>change("tp2",parseFloat(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
        <div><div className="text-xs text-slate-300">SL</div><input type="number" step="0.00001" value={d.sl??""} onChange={e=>change("sl",parseFloat(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
        <div className="md:col-span-2"><div className="text-xs text-slate-300">Strategy</div><select value={d.strategy} onChange={e=>change("strategy",e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2">{cfg.strategies.map(s=><option key={s.name}>{s.name}</option>)}</select></div>
        <div><div className="text-xs text-slate-300">Exit Type</div><select value={d.exitType} onChange={e=>change("exitType",e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2">{EXIT_TYPES.map(x=><option key={x}>{x}</option>)}</select></div>
      </div>
      <div className="mt-4 text-right">
        {hasId&&<button onClick={()=>{onDelete(d.id);onClose();}} className="px-3 py-2 rounded-lg border border-red-700 text-red-300 mr-2">Delete</button>}
        <button onClick={()=>{onSave({...d});onClose();}} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500">Save</button>
      </div>
    </Modal>
  )
}

function GeneralStats({trades,accType,capital,depositDate}){
  const since = useMemo(()=>trades.filter(t=>new Date(t.date)>=new Date(depositDate)),[trades,depositDate]);
  const realized = useMemo(()=>since.map(t=>computeDollarPnL(t,accType)).filter(v=>v!==null&&isFinite(v)).reduce((a,b)=>a+b,0),[since,accType]);
  const wins = useMemo(()=>since.filter(t=>{const v=computeDollarPnL(t,accType);return v!==null&&v>0}).length,[since,accType]);
  const losses = useMemo(()=>since.filter(t=>{const v=computeDollarPnL(t,accType);return v!==null&&v<0}).length,[since,accType]);
  const totalDone = wins+losses;
  const winRate = totalDone?Math.round((wins/totalDone)*100):0;
  const open = useMemo(()=>trades.filter(t=>!t.exitType||t.exitType==="Trade In Progress").length,[trades]);
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

function CalendarModal({onClose,trades,accType}){
  const now=new Date();
  const [month,setMonth]=useState(now.getMonth());
  const [year,setYear]=useState(now.getFullYear());
  const [selectedDate,setSelectedDate]=useState(todayISO());

  const start=new Date(year,month,1); const end=new Date(year,month+1,0);
  const weeks=[]; let cursor=new Date(year,month,1-start.getDay());
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
    <Modal title="Calendar" onClose={onClose}>
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

function NotesPanel(){
  const email=getCurrent(); const key="ng_notes_"+email;
  const [notes,setNotes]=useState(()=>{try{return JSON.parse(localStorage.getItem(key)||"[]")}catch{return[]}});
  useEffect(()=>{localStorage.setItem(key,JSON.stringify(notes))},[notes]);
  const [show,setShow]=useState(false); const [edit,setEdit]=useState(null);
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
      {show&&(<Modal title={edit?"Edit Note":"Add Note"} onClose={()=>setShow(false)}>
        <textarea defaultValue={edit?.text||""} id="__note_ta" rows={8} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3"/>
        <div className="text-right mt-3">
          <button className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500" onClick={()=>{
            const val=document.getElementById("__note_ta").value;
            const n={id:edit?.id||Math.random().toString(36).slice(2),text:val};
            setNotes((arr)=>{const a=[...arr]; const i=a.findIndex(x=>x.id===n.id); if(i>=0) a[i]=n; else a.unshift(n); return a;});
            setShow(false);
          }}>Save</button>
        </div>
      </Modal>)}
    </div>
  )
}

/* ---------- App ---------- */
function App(){
  const [users,setUsers]=useState(loadUsers());
  const [email,setEmail]=useState(getCurrent());
  const fresh = (e)=>({name:e.split("@")[0],email:e,accType:"Dollar Account",capital:0,depositDate:todayISO(),trades:[]});
  const [state,setState]=useState(()=>loadState(email)|| (email?fresh(email):null));
  const [cfg,setCfg]=useState(()=>email?(loadCfg(email)||{symbols:DEFAULT_SYMBOLS,strategies:DEFAULT_STRATEGIES}):{symbols:DEFAULT_SYMBOLS,strategies:DEFAULT_STRATEGIES});
  const [page,setPage]=useState("dashboard");
  const [showTrade,setShowTrade]=useState(false); const [edit,setEdit]=useState(null);
  const [showCal,setShowCal]=useState(false);

  useEffect(()=>{ if(email && !state){ const s = loadState(email)||fresh(email); setState(s); } },[email]);
  useEffect(()=>{ if(state?.email) saveState(state.email,state) },[state]);
  useEffect(()=>{ if(state?.email) saveCfg(state.email,cfg) },[cfg,state?.email]);

  /* EmailJS init (no UI impact) */
  useEffect(()=>{ if(typeof emailjs!=="undefined" && window.EMAILJS_PUBLIC_KEY){ emailjs.init({publicKey:window.EMAILJS_PUBLIC_KEY}); } },[]);

  const onLogout=()=>{saveCurrent(""); setEmail(""); setState(null);};
  const initGoogle=(node,cb)=>{
    if(!node || !window.google) return;
    window.google.accounts.id.initialize({client_id:window.GOOGLE_CLIENT_ID,callback:(resp)=>{try{const p=JSON.parse(atob(resp.credential.split('.')[1])); if(p?.email) cb(p.email);}catch{}}});
    window.google.accounts.id.renderButton(node,{theme:"outline",size:"large",text:"signin_with",shape:"pill"});
  };
  const Login=()=>{
    const gref=useRef(null);
    useEffect(()=>{initGoogle(gref.current,(m)=>{ let u=users.find(x=>x.email.toLowerCase()===m.toLowerCase()); if(!u){u={name:m.split("@")[0],email:m,password:""}; const nu=[...users,u]; setUsers(nu); saveUsers(nu);} saveCurrent(m); setEmail(m); setState(loadState(m)||fresh(m)); setCfg(loadCfg(m)||{symbols:DEFAULT_SYMBOLS,strategies:DEFAULT_STRATEGIES}); });},[]);
    const [em,setEm]=useState(""); const [pw,setPw]=useState(""); const [err,setErr]=useState("");
    return(
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md bg-slate-900/70 border border-slate-700 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <img src="./logo-ng.png" className="h-8 w-8 rounded-xl" alt="logo"/>
            <div className="text-xl font-semibold">Nitty Gritty</div>
          </div>
          <div className="space-y-3">
            <input value={em} onChange={e=>setEm(e.target.value)} placeholder="Email" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/>
            <input type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="Password" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/>
            {err&&<div className="text-sm text-red-300">{err}</div>}
            <div className="flex items-center justify-between">
              <button onClick={()=>{
                const u=users.find(x=>x.email.toLowerCase()===em.toLowerCase());
                if(!u){setErr("No such user. Please sign up with Google once."); return;}
                if(u.password!==pw){setErr("Wrong password."); return;}
                setErr(""); saveCurrent(u.email); setEmail(u.email); setState(loadState(u.email)||fresh(u.email)); setCfg(loadCfg(u.email)||{symbols:DEFAULT_SYMBOLS,strategies:DEFAULT_STRATEGIES});
              }} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500">Login</button>
              <span className="text-slate-400 text-sm">or</span>
              <div ref={gref}></div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if(!email || !state) return <Login/>;

  /* Export */
  const onExport=()=>{const csv=toCSV(state.trades,state.accType); const blob=new Blob([csv],{type:"text/csv;charset=utf-8;"}); const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download="Nitty_Gritty_Template_Export.csv"; a.click(); URL.revokeObjectURL(url);};

  /* Import (FIXED): single handler, correct row mapping, no repeated single row */
  const inputEl = (window.__ngImportEl ||= (()=>{const el=document.createElement("input"); el.type="file"; el.accept=".csv,.xls,.xlsx"; el.style.display="none"; document.body.appendChild(el); return el;})());
  function openImport(){ inputEl.value=""; inputEl.click(); }
  if (!inputEl.__ngBound){
    inputEl.addEventListener("change", async (e)=>{
      const f = e.target.files?.[0]; if(!f) return;
      let wb;
      if (f.name.toLowerCase().endsWith(".csv")){
        const txt = await f.text();
        wb = XLSX.read(txt, { type:"string" });
      }else{
        wb = XLSX.read(await f.arrayBuffer(), { type:"array" });
      }
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { defval:"", raw:true, blankrows:false });
      const trades = rowsToTrades(rows);
      setState(s=>({...s, trades:[...trades.reverse(), ...s.trades]}));
    });
    inputEl.__ngBound = true;
  }

  /* Derived stats for left panel */
  const openTrades = state.trades.filter(t=>!t.exitType||t.exitType==="Trade In Progress").length;
  const realized = state.trades
    .filter(t=>new Date(t.date)>=new Date(state.depositDate) && t.exitType && t.exitType!=="Trade In Progress")
    .map(t=>computeDollarPnL(t,state.accType))
    .filter(v=>v!==null&&isFinite(v))
    .reduce((a,b)=>a+b,0);
  const effectiveCapital = state.capital + realized;

  return(
    <div className="min-h-full">
      <Header onExport={onExport} onImport={openImport} user={state} onLogout={onLogout}/>
      <div className="max-w-7xl mx-auto px-3 py-4 grid grid-cols-12 gap-4">
        {/* Left column (unchanged layout) */}
        <aside className="col-span-3 space-y-4">
          <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4">
            <div className="text-sm text-slate-300">Account Type</div>
            <div className="font-semibold mb-3">{state.accType}</div>
            <div className="text-sm text-slate-300">Capital</div>
            <div className="text-2xl font-bold mb-1">{state.accType==='Cent Account'?`${r2(effectiveCapital*100).toFixed(2)} ¢`:fmt$(effectiveCapital)}</div>
            <div className="text-xs text-slate-400">Deposit: {state.depositDate}</div>
            <div className="mt-3 text-sm text-slate-300">Open trades</div>
            <div className="text-lg font-semibold">{openTrades}</div>
            <div className="pt-2"><button onClick={()=>{setEdit(null);setShowTrade(true)}} className="w-full px-3 py-2 rounded-lg border border-slate-700 flex items-center justify-center gap-2"><IconPlus/>Add trade</button></div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-2">
            <NavBtn label="Dashboard" active={page==="dashboard"} onClick={()=>setPage("dashboard")} Icon={IconHome}/>
            <NavBtn label="Histories" active={page==="histories"} onClick={()=>setPage("histories")} Icon={IconHistory}/>
            <button onClick={()=>setShowCal(true)} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-700 hover:bg-slate-800"><IconCalendar/><span>Calendar</span></button>
            <NavBtn label="Notes" active={page==="notes"} onClick={()=>setPage("notes")} Icon={IconNote}/>
            <NavBtn label="Settings" active={page==="settings"} onClick={()=>setPage("settings")} Icon={IconCog}/>
          </div>
        </aside>

        {/* Main column */}
        <main className="col-span-9 space-y-4">
          {page==="dashboard"&&(
            <>
              <div className="text-sm font-semibold">General statistics</div>
              <GeneralStats trades={state.trades} accType={state.accType} capital={state.capital} depositDate={state.depositDate}/>
              {/* Restored Best Strategy (small, unobtrusive) */}
              <BestStrategy trades={state.trades} accType={state.accType} cfg={cfg}/>
            </>
          )}

          {page==="histories"&&(
            <Histories trades={state.trades} accType={state.accType}
              onEdit={(t)=>{setEdit(t);setShowTrade(true)}}
              onDelete={(id)=>setState({...state,trades:state.trades.filter(x=>x.id!==id)})}
              cfg={cfg}/>
          )}

          {page==="notes"&&(<NotesPanel/>)}

          {page==="settings"&&(<SettingsPanel state={state} setState={setState} cfg={cfg} setCfg={setCfg}/>)}
        </main>
      </div>

      {showTrade&&(
        <TradeModal initial={edit} onClose={()=>{setShowTrade(false);setEdit(null);}}
          onSave={(n)=>{const id=n.id||Math.random().toString(36).slice(2); setState(s=>{const arr=[...s.trades]; const i=arr.findIndex(t=>t.id===id); const rec={...n,id}; if(i>=0) arr[i]=rec; else arr.unshift(rec); return {...s,trades:arr};});}}
          onDelete={(id)=>setState(s=>({...s,trades:s.trades.filter(t=>t.id!==id)}))}
          accType={state.accType} symbols={cfg.symbols} cfg={cfg}
        />
      )}

      {showCal&&(<CalendarModal onClose={()=>setShowCal(false)} trades={state.trades} accType={state.accType}/>)}
    </div>
  )
}

/* ---------- Mount ---------- */
ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
