const {useState,useEffect,useMemo,useRef} = React;

/* ============= Icons (glyphs) ============= */
const iconCls="h-5 w-5";
const IconUser = p => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconCls} {...p}><path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Z"/><path d="M4 20a8 8 0 0 1 16 0Z"/></svg>);
const IconLogout = p => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconCls} {...p}><path d="M9 21h4a4 4 0 0 0 4-4V7a4 4 0 0 0-4-4H9"/><path d="M16 12H3"/><path d="M7 8l-4 4 4 4"/></svg>);
const IconDownload = p => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconCls} {...p}><path d="M12 3v10"/><path d="M8 11l4 4 4-4"/><path d="M5 21h14v-4H5Z"/></svg>);
const IconUpload = p => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconCls} {...p}><path d="M12 11V1"/><path d="M16 5L12 1 8 5"/><path d="M5 23h14V13H5z"/></svg>);
const IconCalendar = p => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconCls} {...p}><path d="M8 3v4M16 3v4"/><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18"/></svg>);
const IconPlus = p => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconCls} {...p}><path d="M12 5v14M5 12h14"/></svg>);
const IconHistory = p => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconCls} {...p}><path d="M12 8v5l3 3"/><path d="M12 3a9 9 0 1 0 9 9"/><path d="M21 3v6h-6"/></svg>);
const IconSettings = p => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconCls} {...p}><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.65 1.65 0  0 0 15 19.4a1.65 1.65 0  0 0-1 .6 1.65 1.65 0  0 0-.4 1V22a2 2 0 1 1-4 0v-.1a1.65 1.65 0  0 0-.4-1 1.65 1.65 0  0 0-1-.6 1.65 1.65 0  0 0-1.82.33l-.06.06a2 2 0  1 1-2.83-2.83l.06-.06A1.65 1.65 0  0 0 4.6 15a1.65 1.65 0  0 0-.6-1 1.65 1.65 0  0 0-1-.4H2a2 2 0  1 1 0-4h.1a1.65 1.65 0  0 0 1-.4 1.65 1.65 0  0 0 .6-1 1.65 1.65 0  0 0-.33-1.82l-.06-.06A2 2 0  1 1 6.24 2.9l.06.06A1.65 1.65 0  0 0 8 4.6a1.65 1.65 0  0 0 1-.6 1.65 1.65 0  0 0 .4-1V2a2 2 0  1 1 4 0v.1c0 .38.14.74.4 1 .26.26.62.4 1 .4.62 0 1.22-.25 1.64-.68l.06-.06A2 2 0  1 1 21.1 6.24l-.06.06c-.26.26-.4.62-.4 1s.14.74.4 1c.26.26.62.4 1 .4H22a2 2 0  1 1 0 4h-.1a1.65 1.65 0  0 0-1 .4 1.65 1.65 0  0 0-.6 1Z"/></svg>);
const IconHome = p => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconCls} {...p}><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9v12h14V9"/></svg>);
const IconNotes = p => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconCls} {...p}><path d="M4 4h16v16H4z"/><path d="M8 8h8"/><path d="M8 12h8"/><path d="M8 16h4"/></svg>);
const IconX = p => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconCls} {...p}><path d="M18 6 6 18M6 6l12 12"/></svg>);

/* ============= Constants / helpers ============= */
const LOGO_PUBLIC="/logo-ng.png"; const LOGO_FALLBACK="./logo-ng.png";
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

const r2=n=>Math.round(n*100)/100;
const fmt$=n=>"$"+(isFinite(n)?r2(n):0).toFixed(2);
const todayISO=()=>{const d=new Date();const tz=d.getTimezoneOffset();return new Date(d.getTime()-tz*60000).toISOString().slice(0,10)};

const USERS_KEY="ng_users_v1"; const CURR_KEY="ng_current_user_v1";
const loadUsers=()=>{try{return JSON.parse(localStorage.getItem(USERS_KEY)||"[]")}catch{return[]}};
const saveUsers=u=>{try{localStorage.setItem(USERS_KEY,JSON.stringify(u))}catch{}};
const saveCurrent=e=>{try{localStorage.setItem(CURR_KEY,e)}catch{}};
const getCurrent=()=>{try{return localStorage.getItem(CURR_KEY)||""}catch{return""}};
const loadState=e=>{try{return JSON.parse(localStorage.getItem("ng_state_"+e)||"null")}catch{return null}};
const saveState=(e,s)=>{try{localStorage.setItem("ng_state_"+e,JSON.stringify(s))}catch{}};

/* ============= P&L engine ============= */
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
  if(t.exitType==="Trade In Progress") return null;
  const has=v=>typeof v==="number"&&isFinite(v);
  if(has(t.exit) && (!t.exitType || t.exitType==="TP"))
    return legPnL(t.symbol,t.side,t.entry,t.exit,t.lotSize,accType);
  switch(t.exitType){
    case"SL": if(!has(t.sl)) return null; return legPnL(t.symbol,t.side,t.entry,t.sl,t.lotSize,accType);
    case"TP": if(has(t.tp2)) return legPnL(t.symbol,t.side,t.entry,t.tp2,t.lotSize,accType);
              if(has(t.tp1)) return legPnL(t.symbol,t.side,t.entry,t.tp1,t.lotSize,accType); return null;
    case"TP1_BE": if(!has(t.tp1)) return null; return (legPnL(t.symbol,t.side,t.entry,t.tp1,t.lotSize,accType)+0)/2;
    case"TP1_SL": if(!has(t.tp1)||!has(t.sl)) return null;
                  return (legPnL(t.symbol,t.side,t.entry,t.tp1,t.lotSize,accType)+legPnL(t.symbol,t.side,t.entry,t.sl,t.lotSize,accType))/2;
    case"BE": return 0;
    default: return null;
  }
}
const formatPnlDisplay=(accType,v)=>accType==="Cent Account"?(r2(v*100)).toFixed(2)+" ¢":fmt$(v);
const formatUnits=(accType,v)=>accType==="Dollar Account"?r2(v).toFixed(2):r2(v*100).toFixed(2);

/* ============= CSV helpers ============= */
function csvSafeSplit(line){
  // Split commas outside quotes.
  const out=[]; let cur=""; let q=false;
  for(let i=0;i<line.length;i++){
    const c=line[i], n=line[i+1];
    if(c === '"'){ if(q && n === '"'){ cur+='"'; i++; } else { q=!q; } }
    else if(c === ',' && !q){ out.push(cur); cur=""; }
    else cur+=c;
  }
  out.push(cur);
  return out;
}
function toCSV(rows,accType){
  const H=["Date","Symbol","Side","Lot Size","Entry","Exit","TP1","TP2","SL","Strategy","Exit Type","P&L","P&L (Units)"];
  const NL="\n"; const BOM="﻿";
  const esc=s=>{if(s===null||s===undefined)return"";const v=String(s);return /[",\n]/.test(v)?`"${v.replace(/"/g,'""')}"`:v};
  const out=[H.join(",")];
  for(const t of rows){
    const v=computeDollarPnL(t,accType);
    const row=[t.date,t.symbol,t.side,t.lotSize,(t.entry??""),(t.exit??""),(t.tp1??""),(t.tp2??""),(t.sl??""),t.strategy,(t.exitType||""),v===null?"":r2(v),v===null?"":formatUnits(accType,v)];
    out.push(row.map(esc).join(","));
  }
  return BOM+out.join(NL);
}

/* ============= Reusable small UI bits ============= */
const Th = ({children,className,...rest}) => <th {...rest} className={(className?className+" ":"")+"px-4 py-3 text-left font-semibold text-slate-300"}>{children}</th>;
const Td = ({children,className,...rest}) => <td {...rest} className={(className?className+" ":"")+"px-4 py-3 align-top"}>{children}</td>;
const Stat = ({label,value}) => (
  <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-3">
    <div className="text-slate-400 text-xs">{label}</div>
    <div className="text-2xl font-bold mt-1">{value}</div>
  </div>
);

/* ============= Modal shell ============= */
function Modal({title,children,onClose,maxClass}){
  return(
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-3">
      <div className={`relative w-[95vw] ${maxClass||"max-w-3xl"} max-h-[80vh] overflow-auto bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl`}>
        <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-slate-800/95 backdrop-blur">
          <div className="flex items-center gap-2"><IconSettings/><div className="font-semibold">{title}</div></div>
          <button onClick={onClose} className="px-3 py-1.5 rounded-lg border border-slate-600 hover:bg-slate-700">✕</button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

/* ============= Account Setup (first login) ============= */
function AccountSetupModal({state,setState,onClose}){
  const [name,setName]=useState(state.name||"");
  const [accType,setAccType]=useState(state.accType||"Dollar Account");
  const [capital,setCapital]=useState(state.capital||0);
  const [depositDate,setDepositDate]=useState(state.depositDate||todayISO());

  const save=()=>{
    setState({...state,name,accType,capital:parseFloat(capital||0),depositDate,didSetup:true});
    onClose();
  };
  return(
    <Modal title="Welcome — set up your account" onClose={onClose}>
      <div className="grid md:grid-cols-2 gap-4">
        <div><label className="text-sm text-slate-300">Name</label><input value={name} onChange={e=>setName(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
        <div>
          <label className="text-sm text-slate-300">Account Type</label>
          <select value={accType} onChange={e=>setAccType(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2">
            {ACC_TYPES.map(a=><option key={a}>{a}</option>)}
          </select>
        </div>
        <div><label className="text-sm text-slate-300">Starting Capital ($)</label><input type="number" value={capital} onChange={e=>setCapital(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
        <div><label className="text-sm text-slate-300">Deposit Date</label><input type="date" value={depositDate} onChange={e=>setDepositDate(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
      </div>
      <div className="mt-4 text-right">
        <button onClick={save} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500">Save</button>
      </div>
    </Modal>
  );
}

/* ============= Settings panel (Customize + Widgets merged) ============= */
function SettingsPanel({
  name,setName,accType,setAccType,capital,setCapital,depositDate,setDepositDate,
  email,customSymbols,setCustomSymbols,customStrategies,setCustomStrategies,
  widgets,setWidgets
}){
  const [tab,setTab]=useState("account");
  const [symToAdd,setSymToAdd]=useState("");
  const [strToAdd,setStrToAdd]=useState("");

  const addSym=()=>{const v=symToAdd.trim().toUpperCase(); if(!v) return; if(!(customSymbols||[]).includes(v)) setCustomSymbols([...(customSymbols||[]),v]); setSymToAdd("");};
  const addStr=()=>{const v=strToAdd.trim(); if(!v) return; if(!(customStrategies||[]).includes(v)) setCustomStrategies([...(customStrategies||[]),v]); setStrToAdd("");};

  const suggestions = {
    symbols: DEFAULT_SYMBOLS.filter(s=>!(customSymbols||[]).includes(s)),
    strategies: DEFAULT_STRATEGIES.filter(s=>!(customStrategies||[]).includes(s)),
  };

  return(
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4"><IconSettings/><div className="font-semibold">Settings</div></div>
      <div className="flex gap-2 mb-4 flex-wrap">
        {["account","customize","security"].map(key=>(
          <button key={key} onClick={()=>setTab(key)} className={`px-3 py-1.5 rounded-lg border ${tab===key?"bg-slate-700 border-slate-600":"border-slate-700"}`}>{key[0].toUpperCase()+key.slice(1)}</button>
        ))}
      </div>

      {tab==="account"&&(
        <div className="grid md:grid-cols-3 gap-4">
          <div><label className="text-sm text-slate-300">Name</label><input value={name} onChange={e=>setName(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
          <div><label className="text-sm text-slate-300">Account Type</label>
            <select value={accType} onChange={e=>setAccType(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2">{ACC_TYPES.map(s=><option key={s}>{s}</option>)}</select></div>
          <div><label className="text-sm text-slate-300">Capital ($)</label><input type="number" value={capital} onChange={e=>setCapital(parseFloat(e.target.value||"0"))} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
          <div><label className="text-sm text-slate-300">Capital Deposit Date</label><input type="date" value={depositDate} onChange={e=>setDepositDate(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
        </div>
      )}

      {tab==="customize"&&(
        <div className="grid md:grid-cols-2 gap-6">
          {/* Symbols */}
          <div>
            <div className="text-sm font-semibold mb-2">Symbols</div>
            <div className="flex gap-2 mb-2">
              <select className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"
                      value={symToAdd} onChange={e=>setSymToAdd(e.target.value)}>
                <option value="">Add from suggestions…</option>
                {suggestions.symbols.map(s=><option key={s} value={s}>{s}</option>)}
              </select>
              <button className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500" onClick={addSym}>Add</button>
            </div>
            <div className="flex gap-2">
              <input className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"
                     placeholder="Or type a custom symbol (e.g., US2000)" value={symToAdd} onChange={e=>setSymToAdd(e.target.value)} />
              <button className="px-3 py-2 rounded-lg border border-slate-600 hover:bg-slate-700" onClick={()=>setSymToAdd("")}>Clear</button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {(customSymbols||[]).map(s=>(<span key={s} className="badge bg-slate-900/60 border border-slate-700">{s}<button className="text-red-400" onClick={()=>setCustomSymbols((customSymbols||[]).filter(x=>x!==s))}>✕</button></span>))}
            </div>
          </div>

          {/* Strategies */}
          <div>
            <div className="text-sm font-semibold mb-2">Strategies</div>
            <div className="flex gap-2 mb-2">
              <select className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"
                      value={strToAdd} onChange={e=>setStrToAdd(e.target.value)}>
                <option value="">Add from suggestions…</option>
                {suggestions.strategies.map(s=><option key={s} value={s}>{s}</option>)}
              </select>
              <button className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500" onClick={addStr}>Add</button>
            </div>
            <div className="flex gap-2">
              <input className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"
                     placeholder="Or type a custom strategy" value={strToAdd} onChange={e=>setStrToAdd(e.target.value)} />
              <button className="px-3 py-2 rounded-lg border border-slate-600 hover:bg-slate-700" onClick={()=>setStrToAdd("")}>Clear</button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {(customStrategies||[]).map(s=>(<span key={s} className="badge bg-slate-900/60 border border-slate-700">{s}<button className="text-red-400" onClick={()=>setCustomStrategies((customStrategies||[]).filter(x=>x!==s))}>✕</button></span>))}
            </div>
          </div>

          {/* Widgets in same tab */}
          <div className="md:col-span-2">
            <div className="text-sm font-semibold mb-2">Dashboard widgets</div>
            <div className="grid md:grid-cols-3 gap-2">
              {[
                ["showGeneral","General statistics"],
                ["showBest","Best strategy (appears after ≥5 trades/strategy)"],
                ["showDetailed","Detailed statistics"],
              ].map(([k,label])=>(
                <label key={k} className="flex items-center gap-2 bg-slate-900/50 border border-slate-700 rounded-xl px-3 py-2">
                  <input type="checkbox" checked={!!widgets[k]} onChange={()=>setWidgets({...widgets,[k]:!widgets[k]})}/>
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab==="security"&&(
        <div className="text-slate-400 text-sm">
          This demo keeps passwords locally in your browser for email/password mode.
          If you signed in with Google, you can ignore this tab.
        </div>
      )}
    </div>
  );
}

/* ============= Trade modal ============= */
function TradeModal({initial,onClose,onSave,onDelete,accType,lastLotSize,customSymbols,customStrategies}){
  const i=initial||{};
  const symList = (customSymbols && customSymbols.length ? customSymbols : DEFAULT_SYMBOLS);
  const stratList= (customStrategies && customStrategies.length ? customStrategies : DEFAULT_STRATEGIES);

  const [symbol,setSymbol]=useState(i.symbol||symList[0]);
  const [side,setSide]=useState(i.side||"BUY");
  const [date,setDate]=useState(i.date||todayISO());
  const [lotSize,setLotSize]=useState(i.lotSize ?? lastLotSize ?? 0.01);
  const [entry,setEntry]=useState(i.entry??"");
  const [exit,setExit]=useState(i.exit??"");
  const [tp1,setTp1]=useState(i.tp1??"");
  const [tp2,setTp2]=useState(i.tp2??"");
  const [sl,setSl]=useState(i.sl??"");
  const [strategy,setStrategy]=useState(i.strategy||stratList[0]);
  const [exitType,setExitType]=useState(i.exitType||"TP");

  const num=v=>(v===""||v===undefined||v===null)?undefined:parseFloat(v);

  useEffect(()=>{ // auto-calc TP1/TP2 based on SL distance
    const en=num(entry), sll=num(sl);
    if(en===undefined || sll===undefined) return;
    const risk=side==="BUY"? en - sll : sll - en;
    if(risk<=0) return;
    const t1 = side==="BUY"? en + risk : en - risk;
    const t2 = side==="BUY"? en + 2*risk : en - 2*risk;
    setTp1(t1); setTp2(t2);
  },[entry,sl,side]);

  const draft=useMemo(()=>({
    id:i.id,date,symbol,side,lotSize:parseFloat(lotSize||0),
    entry:num(entry),exit:num(exit),tp1:num(tp1),tp2:num(tp2),sl:num(sl),
    strategy,exitType
  }),[i.id,date,symbol,side,lotSize,entry,exit,tp1,tp2,sl,strategy,exitType]);

  const preview=useMemo(()=>{
    const v=computeDollarPnL(draft,accType);
    if(v===null||!isFinite(v))return"-";
    return `${formatPnlDisplay(accType,v)} (${formatUnits(accType,v)})`;
  },[draft,accType]);

  return(
    <Modal title={i.id?"Edit Trade":"Add Trade"} onClose={onClose}>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <div><label className="text-sm text-slate-300">Symbol</label>
          <select value={symbol} onChange={e=>setSymbol(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2">
            {symList.map(s=><option key={s}>{s}</option>)}
          </select></div>
        <div><label className="text-sm text-slate-300">Action</label>
          <div className="mt-1 grid grid-cols-2 gap-2">{["BUY","SELL"].map(s=>(<button key={s} onClick={()=>setSide(s)} className={`px-2 py-2 rounded-lg border ${side===s ? (s==="BUY" ? "bg-green-600 border-green-500" : "bg-red-600 border-red-500") : "border-slate-700"}`}>{s}</button>))}</div></div>
        <div><label className="text-sm text-slate-300">Date</label><input type="date" value={date} onChange={e=>setDate(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
        <div><label className="text-sm text-slate-300">Lot size</label><input type="number" step="0.01" value={lotSize} onChange={e=>setLotSize(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
        <div><label className="text-sm text-slate-300">Entry price</label><input type="number" step="0.0001" value={entry} onChange={e=>setEntry(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
        <div><label className="text-sm text-slate-300">Exit price</label><input type="number" step="0.0001" value={exit} onChange={e=>setExit(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2" placeholder="Leave blank for OPEN"/></div>
        <div><label className="text-sm text-slate-300">TP 1</label><input type="number" step="0.0001" value={tp1} onChange={e=>setTp1(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
        <div><label className="text-sm text-slate-300">TP 2</label><input type="number" step="0.0001" value={tp2} onChange={e=>setTp2(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
        <div><label className="text-sm text-slate-300">Stop-Loss</label><input type="number" step="0.0001" value={sl} onChange={e=>setSl(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
        <div><label className="text-sm text-slate-300">Strategy</label><select value={strategy} onChange={e=>setStrategy(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2">{(stratList).map(s=><option key={s}>{s}</option>)}</select></div>
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
  );
}

/* ============= Full-pane Note Composer ============= */
function NoteComposer({onClose,onSave,trades}){
  const [text,setText]=useState("");
  const [date,setDate]=useState(todayISO());
  const [tradeId,setTradeId]=useState("");

  const linked = trades.find(t=>t.id===tradeId);
  const linkedChip = linked ? (
    <div className="badge bg-blue-900/30 border border-blue-700 text-blue-200">
      <span className="font-semibold">{linked.symbol}</span>
      <span>{linked.side}</span>
      <span>Lot {linked.lotSize}</span>
      <span>{linked.date}</span>
    </div>
  ) : null;

  return (
    <div className="note-full overflow-auto">
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-xl font-semibold flex items-center gap-2"><IconNotes/> New note — {date}</div>
          <button onClick={onClose} className="px-3 py-2 rounded-lg border border-slate-600 hover:bg-slate-700 flex items-center gap-2"><IconX/> Close</button>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="text-sm text-slate-300">Date</label>
            <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/>
          </div>
          <div className="md:col-span-2">
            <label className="text-sm text-slate-300">Link to a trade (optional)</label>
            <select value={tradeId} onChange={e=>setTradeId(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2">
              <option value="">— None —</option>
              {trades.map(t=><option key={t.id} value={t.id}>{`${t.date} | ${t.symbol} ${t.side} | Lot ${t.lotSize}`}</option>)}
            </select>
            {linkedChip && <div className="mt-2">{linkedChip}</div>}
          </div>
        </div>

        <textarea className="w-full h-[48vh] bg-slate-900 border border-slate-700 rounded-xl p-3" placeholder="Write your observation…" value={text} onChange={e=>setText(e.target.value)} />

        <div className="mt-4 flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-600 hover:bg-slate-700">Discard</button>
          <button onClick={()=>{onSave({date,text,tradeId:tradeId||null}); onClose();}} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500">Save</button>
        </div>
      </div>
    </div>
  );
}

/* ============= Notes Panel (list after composer closes) ============= */
function NotesPanel({notes,setNotes,trades}){
  const [openComposer,setOpenComposer]=useState(false);

  // open composer when landing on Notes (first mount)
  useEffect(()=>{ setOpenComposer(true); },[]);

  const byDate=useMemo(()=>{const m={}; for(const n of notes){(m[n.date]||(m[n.date]=[])).push(n)} return m;},[notes]);

  const save = rec => {
    const id=Math.random().toString(36).slice(2);
    setNotes([{...rec,id,createdAt:Date.now()}, ...notes]);
  };

  const remove = id => setNotes(notes.filter(n=>n.id!==id));

  return (
    <div className="relative">
      {openComposer && <NoteComposer trades={trades} onClose={()=>setOpenComposer(false)} onSave={save} />}

      {!openComposer && (
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2"><IconNotes/><div className="font-semibold">Notes</div></div>
            <button onClick={()=>setOpenComposer(true)} className="px-3 py-2 rounded-lg border border-slate-600 hover:bg-slate-700"><IconPlus/> New note</button>
          </div>
          {notes.length===0 ? (
            <div className="text-slate-400 text-sm">No notes yet.</div>
          ) : (
            <div className="space-y-2">
              {notes.map(n=>{
                const linked = n.tradeId ? trades.find(t=>t.id===n.tradeId) : null;
                return (
                  <div key={n.id} className="bg-slate-900/50 border border-slate-700 rounded-xl p-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">{n.date}</div>
                      <button className="text-red-400" onClick={()=>remove(n.id)}>Delete</button>
                    </div>
                    <div className="text-slate-300 text-sm mt-1 line-clamp-2">{n.text}</div>
                    {linked && (
                      <div className="mt-2 text-xs">
                        <span className="badge bg-blue-900/30 border border-blue-700 text-blue-200">
                          <strong>{linked.symbol}</strong> {linked.side} • Lot {linked.lotSize} • {linked.date}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ============= Calendar & History & Stats (unchanged logic, tiny tweaks) ============= */
function GeneralStats({trades,accType,capital,depositDate}){
  const realized=trades.filter(t=>new Date(t.date)>=new Date(depositDate)&&t.exitType && t.exitType !== "Trade In Progress");
  const pnl=realized.map(t=>computeDollarPnL(t,accType)).filter(v=>v!==null&&isFinite(v));
  const total=pnl.reduce((a,b)=>a+b,0); const wins=pnl.filter(v=>v>0).length; const losses=pnl.filter(v=>v<0).length;
  const open=trades.filter(t=> !t.exitType || t.exitType === "Trade In Progress").length; const wr=(wins+losses)>0?Math.round((wins/(wins+losses))*100):0;
  return(<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
    <Stat label="Capital" value={accType==='Cent Account'?`${r2((capital+total)*100).toFixed(2)} ¢`:fmt$(capital+total)}/>
    <Stat label="Realized P&L" value={formatPnlDisplay(accType,total)}/>
    <Stat label="Win Rate" value={`${wr}%`}/>
    <Stat label="Open" value={open}/>
  </div>);
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
  </div>);
}
function Histories({trades,accType,onEdit,onDelete}){
  return(<div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4">
    <div className="flex items-center justify-between mb-2"><div className="text-sm font-semibold">Trade History</div></div>
    <div className="overflow-auto"><table className="min-w-full text-sm">
      <thead><tr>
        <Th>Date</Th><Th>Symbol</Th><Th>Side</Th><Th>Lot size</Th><Th>Entry</Th><Th>Exit</Th><Th>TP1</Th><Th>TP2</Th><Th>SL</Th><Th>Strategy</Th><Th>Exit Type</Th><Th>P&L</Th><Th>P&L (Units)</Th><Th>Status</Th><Th>Actions</Th>
      </tr></thead>
      <tbody>{trades.map(t=>{
        const v=computeDollarPnL(t,accType);
        const closed=t.exitType && t.exitType!=="Trade In Progress";
        return(<tr key={t.id} className="border-t border-slate-700">
          <Td>{t.date}</Td><Td>{t.symbol}</Td><Td>{t.side}</Td><Td>{t.lotSize}</Td>
          <Td>{typeof t.entry==='number'?t.entry:''}</Td><Td>{typeof t.exit==='number'?t.exit:''}</Td>
          <Td>{typeof t.tp1==='number'?t.tp1:''}</Td><Td>{typeof t.tp2==='number'?t.tp2:''}</Td><Td>{typeof t.sl==='number'?t.sl:''}</Td>
          <Td>{t.strategy||""}</Td>
          <Td>{t.exitType||""}</Td>
          <Td className={v>0?'text-green-400':v<0?'text-red-400':''}>{v===null?'-':formatPnlDisplay(accType,v)}</Td>
          <Td className={v>0?'text-green-400':v<0?'text-red-400':''}>{v===null?'-':formatUnits(accType,v)}</Td>
          <Td>{closed?'CLOSED':'OPEN'}</Td>
          <Td>
            <div className="flex gap-2">
              <button onClick={()=>onEdit(t)} className="px-2 py-1 rounded-lg border border-slate-700 hover:bg-slate-700">✎</button>
              <button onClick={()=>onDelete(t.id)} className="px-2 py-1 rounded-lg border border-red-700 text-red-300 hover:bg-red-900/20">✕</button>
            </div>
          </Td>
        </tr>)})}</tbody>
    </table></div>
  </div>);
}

/* ============= Shell ============= */
function UserMenu({onExport,onLogout,onImport}){
  const [open,setOpen]=useState(false);
  const fileInput=useRef(null);
  return(
    <div className="relative">
      <button onClick={()=>setOpen(v=>!v)} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-700 hover:bg-slate-800"><IconUser/></button>
      {open&&(<div className="absolute right-0 mt-2 w-60 bg-slate-800 border border-slate-700 rounded-xl shadow-lg overflow-hidden z-20">
        <button onClick={()=>{setOpen(false);onExport()}} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-700"><IconDownload/>Export CSV</button>
        <button onClick={()=>{setOpen(false);fileInput.current.click()}} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-700"><IconUpload/>Import CSV</button>
        <input type="file" accept=".csv,text/csv" ref={fileInput} onChange={onImport} style={{display:'none'}} />
        <button onClick={()=>{setOpen(false);onLogout()}} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-700 text-red-300"><IconLogout/>Logout</button>
      </div>)}
    </div>
  );
}
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
  </div>);
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

/* ============= Login / Reset ============= */
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
  </div>);
}
function ResetModal({email,onClose}){
  const [e,setE]=useState(email||""); const [link,setLink]=useState(""); const [msg,setMsg]=useState(""); const [busy,setBusy]=useState(false);
  const endpoint = (typeof window!=="undefined" && window.CF_RESET_ENDPOINT) ? window.CF_RESET_ENDPOINT : null;

  const start=async ()=>{
    setMsg(""); setBusy(true);
    const users=loadUsers();const u=users.find(x=>x.email.toLowerCase()===(e||"").toLowerCase());
    if(!u){ setBusy(false); setMsg("No account for that email."); return; }
    const token=Math.random().toString(36).slice(2); const exp=Date.now()+1000*60*15; localStorage.setItem("ng_reset_"+token,JSON.stringify({email:e,exp}));
    const url=location.origin+location.pathname+"#reset="+token; setLink(url);

    if(!endpoint){ setBusy(false); setMsg("Could not send reset email through Cloudflare: Cloudflare endpoint not set. Define window.CF_RESET_ENDPOINT in index.html."); return; }

    try{
      const res=await fetch(endpoint,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ to_email:e, first_name:(u.name||"User").split(' ')[0], reset_link:url })
      });
      if(!res.ok){ const t=await res.text(); throw new Error(`Reset email failed (${res.status}) ${t}`); }
      setMsg("Reset email sent.");
    }catch(err){ setMsg(`Could not send reset email through Cloudflare: ${err.message}`); }
    finally{ setBusy(false); }
  };

  return(<Modal title="Password reset" onClose={onClose} maxClass="max-w-md">
    <div className="space-y-3">
      <div><label className="text-sm text-slate-300">Your email</label><input value={e} onChange={ev=>setE(ev.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
      <button onClick={start} disabled={busy} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-60">Send reset link</button>
      {busy && <div className="text-slate-300 text-sm">Sending via Cloudflare…</div>}
      {msg&&<div className="text-sky-400 text-sm whitespace-pre-wrap">{msg}</div>}
      {link&&<div className="text-xs break-all text-slate-300 mt-2">{link}</div>}
      <div className="text-[11px] leading-snug text-slate-400">Note: This is a client-side app; the reset token is stored on the same device where the account was created.</div>
    </div>
  </Modal>);
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
  </Modal>);
}

/* ============= State persistence hook ============= */
function usePersisted(email){
  const fresh = () => ({
    name:"",email:email||"",accType:"Dollar Account",capital:0,depositDate:todayISO(),didSetup:false,
    trades:[],notes:[],lastLotSize:0.01,
    customSymbols:[...DEFAULT_SYMBOLS],
    customStrategies:[...DEFAULT_STRATEGIES],
    widgets:{showGeneral:true,showBest:false,showDetailed:true}
  });
  const [state,setState]=useState(()=>{const s=loadState(email||getCurrent());return s||fresh()});
  useEffect(()=>{const loaded=loadState(email); setState(loaded||fresh())},[email]);
  useEffect(()=>{if(!state||!state.email)return; saveState(state.email,state)},[state]);
  return [state,setState];
}

/* ============= App ============= */
function App(){
  const [currentEmail,setCurrentEmail]=useState(getCurrent());
  const [users,setUsers]=useState(loadUsers());
  const [state,setState]=usePersisted(currentEmail);
  const [page,setPage]=useState("dashboard");

  // UI modals
  const [showTrade,setShowTrade]=useState(false); const [editItem,setEditItem]=useState(null);
  const [showCal,setShowCal]=useState(false); const now=new Date(); const [calView,setCalView]=useState("month"); const [calMonth,setCalMonth]=useState(now.getMonth()); const [calYear,setCalYear]=useState(now.getFullYear()); const [calSel,setCalSel]=useState(todayISO());
  const [collapsed,setCollapsed]=useState(false);
  const [showReset,setShowReset]=useState(false); const [resetToken,setResetToken]=useState("");
  const [showSetup,setShowSetup]=useState(false);

  // Import overlay + toast
  const [importing,setImporting]=useState(false);
  const [importMsg,setImportMsg]=useState("");

  // Handle #reset=token
  useEffect(()=>{const hash=new URLSearchParams(location.hash.slice(1));const tok=hash.get("reset"); if(tok){setResetToken(tok)}},[]);
  // First login: show setup
  useEffect(()=>{ if(currentEmail && state && !state.didSetup){ setShowSetup(true); } },[currentEmail,state?.email]);

  // Google button init
  const initGoogle=(container,onEmail)=>{
    const clientId=window.GOOGLE_CLIENT_ID;
    if(!window.google||!clientId||!container) return;
    window.google.accounts.id.initialize({
      client_id:clientId,
      callback:(resp)=>{const p=parseJwt(resp.credential); if(p&&p.email){onEmail(p.email)}},
      allowed_parent_origin: window.ALLOWED_ORIGINS,
      ux_mode:"popup",
      auto_select:false
    });
    window.google.accounts.id.renderButton(container,{theme:"outline",size:"large",text:"signin_with",shape:"pill"});
  };

  /* Export */
  const onExport=()=>{const csv=toCSV(state.trades,state.accType);const blob=new Blob([csv],{type:"text/csv;charset=utf-8;"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="Nitty_Gritty_Template_Export.csv";a.click();URL.revokeObjectURL(url)};

  /* Import — robust; append or replace */
  const onImport=(e)=>{
    const file=(e.target && e.target.files && e.target.files[0])? e.target.files[0] : null;
    if(!file) return;
    setImporting(true);
    const reader=new FileReader();
    reader.onload=(ev)=>{
      try{
        let text=ev.target.result;
        if(text.charCodeAt && text.charCodeAt(0)===0xFEFF) text=text.slice(1); // strip BOM
        const lines=text.split(/\r?\n/).filter(l=>l.trim().length>0);
        if(lines.length<2){ setImportMsg("No data rows found in CSV."); return; }

        const headers=csvSafeSplit(lines[0]).map(h=>h.trim().toLowerCase());
        const idx=(...names)=>{for(const n of names){const i=headers.indexOf(n.toLowerCase()); if(i!==-1) return i;} return -1};
        const col = {
          date: idx('date'),
          symbol: idx('symbol','instrument'),
          side: idx('side','direction'),
          lot: idx('lot size','lots','qty'),
          entry: idx('entry','entry price'),
          exit: idx('exit','exit price','close'),
          tp1: idx('tp1','tp 1'),
          tp2: idx('tp2','tp 2'),
          sl: idx('sl','stop loss','stop-loss'),
          strategy: idx('strategy'),
          exitType: idx('exit type','outcome')
        };
        const parseNum=v=>{
          if(v===undefined||v===null) return undefined;
          const t=String(v).trim().replace(/^"|"$/g,'').replace(/,/g,'');
          const n=parseFloat(t); return isNaN(n)?undefined:n;
        };

        const parsed=[];
        for(let i=1;i<lines.length;i++){
          const raw=csvSafeSplit(lines[i]);
          const get=(ix)=> ix>=0 && ix<raw.length ? raw[ix].replace(/^"|"$/g,'').replace(/""/g,'"').trim() : undefined;
          const t={
            date: get(col.date) || todayISO(),
            symbol: (get(col.symbol)||'').toUpperCase() || 'N/A',
            side: (get(col.side)||'').toUpperCase().includes('SELL')?'SELL':'BUY',
            lotSize: parseNum(get(col.lot))||0,
            entry: parseNum(get(col.entry)),
            exit: parseNum(get(col.exit)),
            tp1: parseNum(get(col.tp1)),
            tp2: parseNum(get(col.tp2)),
            sl: parseNum(get(col.sl)),
            strategy: get(col.strategy)||'',
            exitType: get(col.exitType)||'',
            id: Math.random().toString(36).slice(2)
          };
          parsed.push(t);
        }

        // Ask append/replace (simple confirm prompt to avoid extra UI)
        const replace = confirm("Import CSV: OK = REPLACE current trades, Cancel = APPEND to current trades.");
        const newTrades = replace ? parsed : [...state.trades, ...parsed];
        setState({...state,trades:newTrades});
        setImportMsg(`Imported ${parsed.length} rows (${replace?"replaced":"appended"}).`);
      }catch(err){
        setImportMsg("CSV import failed: "+err.message);
      }finally{
        setImporting(false);
        // Clear input value so the same file can be chosen again
        e.target.value="";
        setTimeout(()=>setImportMsg(""), 5000);
      }
    };
    reader.readAsText(file);
  };

  /* Auth */
  const onLogout=()=>{saveCurrent("");setCurrentEmail("")};
  const login=(email,password,setErr)=>{
    const u=users.find(x=>x.email.toLowerCase()===email.toLowerCase());
    if(!u){
      if(password==="__google__"){ // auto-provision
        const nu=[...users,{name:email.split("@")[0],email,password:""}]; setUsers(nu); saveUsers(nu);
        const fresh={name:email.split("@")[0],email,accType:"Dollar Account",capital:0,depositDate:todayISO(),didSetup:false,trades:[],notes:[],lastLotSize:0.01,customSymbols:[...DEFAULT_SYMBOLS],customStrategies:[...DEFAULT_STRATEGIES],widgets:{showGeneral:true,showBest:false,showDetailed:true}};
        saveState(email,fresh); saveCurrent(email); setCurrentEmail(email); return;
      }
      setErr("No such user. Please sign up."); return;
    }
    if(password!=="__google__" && u.password!==password){setErr("Wrong password.");return}
    saveCurrent(u.email); setCurrentEmail(u.email);
  };
  const signup=(name,email,password,setErr)=>{
    if(users.some(x=>x.email.toLowerCase()===email.toLowerCase())){setErr("Email already registered.");return}
    const u={name,email,password}; const nu=[...users,u]; setUsers(nu); saveUsers(nu);
    const fresh={name,email,accType:"Dollar Account",capital:0,depositDate:todayISO(),didSetup:false,trades:[],notes:[],lastLotSize:0.01,customSymbols:[...DEFAULT_SYMBOLS],customStrategies:[...DEFAULT_STRATEGIES],widgets:{showGeneral:true,showBest:false,showDetailed:true}};
    saveState(email,fresh); saveCurrent(email); setCurrentEmail(email);
  };
  const resetStart=()=>{setShowReset(true)};

  /* Trade CRUD */
  const addOrUpdate=(draft)=>{const id=draft.id||Math.random().toString(36).slice(2); const arr=state.trades.slice(); const idx=arr.findIndex(t=>t.id===id); const rec={...draft,id}; if(idx>=0)arr[idx]=rec; else arr.unshift(rec); setState({...state,trades:arr,lastLotSize:draft.lotSize}); setShowTrade(false); setEditItem(null)};
  const delTrade=(id)=>setState({...state,trades:state.trades.filter(t=>t.id!==id)});

  if(resetToken){return <NewPasswordModal token={resetToken} onClose={()=>{setResetToken(""); location.hash=""}}/>}
  if(!currentEmail){
    return <>
      <LoginView onLogin={login} onSignup={signup} initGoogle={initGoogle} resetStart={resetStart}/>
      {showReset&&<ResetModal email="" onClose={()=>setShowReset(false)}/>}
    </>;
  }

  const navBtn=(label,pageKey,Icon)=>(<button onClick={()=>setPage(pageKey)} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border ${page===pageKey?'bg-slate-700 border-slate-600':'border-slate-700 hover:bg-slate-800'}`}>{Icon?<Icon/>:null}<span>{label}</span></button>);
  const openTrades=state.trades.filter(t=> !t.exitType || t.exitType === "Trade In Progress").length;
  const realized=state.trades.filter(t=>new Date(t.date)>=new Date(state.depositDate)&&t.exitType && t.exitType !== "Trade In Progress").map(t=>computeDollarPnL(t,state.accType)).filter(v=>v!==null&&isFinite(v)).reduce((a,b)=>a+b,0);
  const effectiveCapital=state.capital+realized;

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
      {/* Import overlay */}
      <div className={`import-mask ${importing?'show':''}`}>
        <div className="import-card">
          <div className="text-lg font-semibold mb-1">Importing CSV…</div>
          <div className="text-sm text-slate-300">Please wait while your file is parsed and rendered.</div>
        </div>
      </div>
      {importMsg && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm">{importMsg}</div>
      )}

      <AppShell capitalPanel={capitalPanel} nav={nav} logoSrc={logoSrc}
        onToggleSidebar={()=>setCollapsed(v=>!v)} onExport={onExport} onLogout={onLogout} onImport={onImport}
        sidebarCollapsed={collapsed}>
        {page==="dashboard"&&(<div className="space-y-4">
          {state.widgets?.showGeneral && <><div className="text-sm font-semibold">General statistics</div><GeneralStats trades={state.trades} accType={state.accType} capital={state.capital} depositDate={state.depositDate}/></>}
          {state.widgets?.showBest && <BestStrategy trades={state.trades} accType={state.accType}/>}
          {state.widgets?.showDetailed && <DetailedStats trades={state.trades} accType={state.accType}/>}
        </div>)}
        {page==="histories"&&(<Histories trades={state.trades} accType={state.accType} onEdit={t=>{setEditItem(t);setShowTrade(true)}} onDelete={delTrade}/>)}
        {page==="notes"&&(<NotesPanel notes={state.notes} setNotes={notes=>setState({...state,notes})} trades={state.trades}/>)}
        {page==="settings"&&(<SettingsPanel
          name={state.name} setName={v=>setState({...state,name:v})}
          accType={state.accType} setAccType={v=>setState({...state,accType:v})}
          capital={state.capital} setCapital={v=>setState({...state,capital:v||0})}
          depositDate={state.depositDate} setDepositDate={v=>setState({...state,depositDate:v})}
          email={state.email}
          customSymbols={state.customSymbols||[]} setCustomSymbols={v=>setState({...state,customSymbols:v})}
          customStrategies={state.customStrategies||[]} setCustomStrategies={v=>setState({...state,customStrategies:v})}
          widgets={state.widgets||{showGeneral:true,showBest:false,showDetailed:true}} setWidgets={v=>setState({...state,widgets:v})}
        />)}
        {showTrade&&(<TradeModal initial={editItem} onClose={()=>{setShowTrade(false);setEditItem(null)}} onSave={addOrUpdate} onDelete={delTrade} accType={state.accType} lastLotSize={state.lastLotSize} customSymbols={state.customSymbols||DEFAULT_SYMBOLS} customStrategies={state.customStrategies||DEFAULT_STRATEGIES}/>)}
        {showCal&&(<CalendarModal onClose={()=>setShowCal(false)} trades={state.trades} view={calView} setView={setCalView} month={calMonth} setMonth={setCalMonth} year={calYear} setYear={setCalYear} selectedDate={calSel} setSelectedDate={setCalSel} accType={state.accType}/>)}
        {showReset&&(<ResetModal email="" onClose={()=>setShowReset(false)}/>)}
      </AppShell>

      {/* First-login account setup */}
      {showSetup && <AccountSetupModal state={state} setState={setState} onClose={()=>setShowSetup(false)}/>}
    </>
  );
}

/* Best strategy widget (unchanged; defined after App uses it) */
function BestStrategy({trades,accType}){
  const closed=trades.filter(t=>t.exitType && t.exitType!=="Trade In Progress");
  if(closed.length===0) return null;
  const map={}; closed.forEach(t=>{
    const v=computeDollarPnL(t,accType);
    const k=t.strategy||"—";
    map[k]=map[k]||{w:0,l:0};
    if(v>0) map[k].w++; else if(v<0) map[k].l++;
  });
  const stats=Object.entries(map).map(([k,{w,l}])=>({strategy:k,wr:(w+l)>0?Math.round(100*w/(w+l)):0,trades:w+l})).filter(x=>x.trades>=5);
  if(stats.length===0) return null;
  stats.sort((a,b)=>b.wr-a.wr);
  const best=stats[0];
  return(
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4">
      <div className="text-sm font-semibold mb-2">Best Strategy</div>
      <div className="flex items-center justify-between">
        <div className="text-lg">{best.strategy}</div>
        <div className="text-lg font-bold">{best.wr}%</div>
      </div>
      <div className="mt-3 bg-slate-900/50 rounded-full h-2 overflow-hidden">
        <div className="bg-blue-600 h-2" style={{width:`${best.wr}%`}}></div>
      </div>
      <div className="mt-2 text-xs text-slate-400">{best.trades} trades evaluated (min 5)</div>
    </div>
  );
}

/* Calendar modal (unchanged from last) */
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
            {Array.from({length:dim(year,month)}).map((_,d)=>{const day=String(d+1).padStart(2,'0');const dateISO=`${year}-${String(month+1).padStart(2,'0')}-${day}`;const items=(byDate[dateISO]||[]);const pnl=pnlByDate[dateISO]||0;
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
          {( (byDate[selectedDate]||[]).length===0)?(<div className="text-slate-400 text-sm">No trades this day.</div>):(
            <div className="space-y-2">{(byDate[selectedDate]||[]).map(t=>(<div key={t.id} className="bg-slate-900/50 border border-slate-700 rounded-xl p-3 flex items-center justify-between">
              <div className="text-sm"><span className="text-blue-300 font-medium">{t.symbol}</span> · {t.side} · Lot {t.lotSize}</div>
              <div className="text-sm">{typeof t.entry==='number'?fmt$(t.entry):''} → {typeof t.exit==='number'?fmt$(t.exit):''}</div>
            </div>))}</div>
          )}
        </div>
      )}
    </Modal>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
