// ===== Basic imports =====
const {useState,useEffect,useMemo,useRef} = React;

// ===== Utilities =====
const arr = (x)=>Array.isArray(x)?x:[];
const todayISO = () => {
  const d=new Date(); const tz=d.getTimezoneOffset();
  return new Date(d.getTime()-tz*60000).toISOString().slice(0,10);
};
const r2 = (n)=>Math.round(n*100)/100;
const fmt$ = (n)=>"$"+(isFinite(n)?r2(n):0).toFixed(2);
const LOGO_SRC = "/logo-ng.png";

// ===== Constants =====
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
const BUILTIN_WIDGETS = ["GeneralStats","StrategyWinRate","DetailedStats"];

// ===== LocalStorage helpers (guarded) =====
const LS_USERS = "ng_users_v1";
const LS_CURR  = "ng_current_user_v1";
const loadJSON = (k, fallback=null) => {
  try { const raw = localStorage.getItem(k); return raw ? JSON.parse(raw) : fallback; }
  catch { return fallback; }
};
const saveJSON = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

const usersLoad = ()=> loadJSON(LS_USERS, []);
const usersSave = (u)=> saveJSON(LS_USERS, u);
const currentGet = ()=> { try { return localStorage.getItem(LS_CURR)||""; } catch { return ""; } };
const currentSet = (e)=> { try { localStorage.setItem(LS_CURR, e||""); } catch {} };

const stateKey = (email)=> "ng_state_"+(email||"__guest__");
const stateLoad = (email)=> loadJSON(stateKey(email), null);
const stateSave = (email, v)=> saveJSON(stateKey(email), v);

// ===== P&L Engine (simple + safe) =====
function perLotMoveUSD(symbol, delta, accType){
  const abs = Math.abs(Number(delta)||0); const isStd = accType==="Dollar Account";
  const mult = (std)=> isStd ? std : std/100;
  switch(symbol){
    case "US30": case "US100": return abs * mult(10);
    case "XAUUSD":              return abs * mult(100);
    case "BTCUSD":              return abs * mult(1);
    case "EURUSD": case "GBPUSD":{
      const pips = abs/0.0001; return pips * mult(10);
    }
    case "AUDCAD": case "USDCAD":{
      const pips = abs/0.0001; return pips * mult(7.236);
    }
    case "USDJPY":{
      const pips = abs/0.01; return pips * mult(6.795);
    }
    default: return 0;
  }
}
function legPnLUSD(symbol, side, entry, exit, lot, accType){
  const raw = perLotMoveUSD(symbol, (Number(exit)-Number(entry)), accType) * (Number(lot)||0);
  const sign = side==="BUY" ? Math.sign(exit-entry) : -Math.sign(exit-entry);
  return raw * (sign||0);
}
function computePnLUSD(t, accType){
  if (t.exitType==="Trade In Progress") return null;
  const {symbol,side,entry,exit,lotSize:lot,tp1,tp2,sl,exitType} = t;
  const has = (v)=> (typeof v==="number" && isFinite(v));
  if (has(exit) && (!exitType || exitType==="TP")) return legPnLUSD(symbol,side,entry,exit,lot,accType);
  switch(exitType){
    case "SL":      return has(sl)  ? legPnLUSD(symbol,side,entry,sl,lot,accType) : null;
    case "TP":      return has(tp2) ? legPnLUSD(symbol,side,entry,tp2,lot,accType)
                          : has(tp1)? legPnLUSD(symbol,side,entry,tp1,lot,accType) : null;
    case "TP1_BE":  return has(tp1) ? (legPnLUSD(symbol,side,entry,tp1,lot,accType))/2 : null;
    case "TP1_SL":  return (has(tp1)&&has(sl)) ? (legPnLUSD(symbol,side,entry,tp1,lot,accType)+legPnLUSD(symbol,side,entry,sl,lot,accType))/2 : null;
    case "BE":      return 0;
    default:        return null;
  }
}
const fmtUnits = (accType,v)=> accType==="Dollar Account" ? r2(v).toFixed(2) : r2(v*100).toFixed(2);

// ===== Safe base state + normalization =====
const baseState = (email)=>({
  name: "",
  email: email||"",
  accType: "Dollar Account",
  capital: 0,
  depositDate: todayISO(),
  trades: [],
  notes: [],
  lastLotSize: 0.01,
  customSymbols: [...DEFAULT_SYMBOLS],
  customStrategies: [...DEFAULT_STRATEGIES],
  widgets: [...BUILTIN_WIDGETS],
  customWidgets: [],
  setupComplete: false
});
const normalize = (s)=>({
  ...baseState(s?.email||""),
  ...s,
  customSymbols: arr(s?.customSymbols).length?arr(s.customSymbols):[...DEFAULT_SYMBOLS],
  customStrategies: arr(s?.customStrategies).length?arr(s.customStrategies):[...DEFAULT_STRATEGIES],
  widgets: arr(s?.widgets).length?arr(s.widgets):[...BUILTIN_WIDGETS],
  customWidgets: arr(s?.customWidgets)
});

// ===== Icons (tiny) =====
const iconCls="h-5 w-5";
const IconUser = (p)=>(<svg viewBox="0 0 24 24" className={iconCls} fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Z"/><path d="M4 20a8 8 0 0 1 16 0Z"/></svg>);
const IconPlus = (p)=>(<svg viewBox="0 0 24 24" className={iconCls} fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><path d="M12 5v14M5 12h14"/></svg>);
const IconSettings = (p)=>(<svg viewBox="0 0 24 24" className={iconCls} fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><circle cx="12" cy="12" r="3.5"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4M8 4.6A1.65 1.65 0 0 0 9 4h.1A2 2 0 1 0 9 0"/></svg>);

// ===== Tiny UI helpers =====
const Th = (p)=>(<th className={"px-4 py-2 text-left text-slate-300 "+(p.className||"")}>{p.children}</th>);
const Td = (p)=>(<td className={"px-4 py-2 "+(p.className||"")}>{p.children}</td>);
const Panel = (p)=>(<div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4">{p.children}</div>);

// ===== Auth primitives (local only; GIS optional) =====
function parseJwt(t){try{return JSON.parse(atob(t.split(".")[1]))}catch{return null}}
function useUsers(){
  const [users,setUsers]=useState(usersLoad());
  const add=(u)=>{const next=[...users,u]; setUsers(next); usersSave(next)};
  const upd=(fn)=>{const next=fn(users); setUsers(next); usersSave(next)};
  return {users,add,upd};
}

// ===== CSV import (safe, small) =====
function parseCSV(text){
  // strip BOM
  if (text.charCodeAt(0)===0xFEFF) text=text.slice(1);
  const out=[]; let i=0, field="", line=[], q=false;
  const pushField=()=>{line.push(field);field=""};
  const pushLine=()=>{out.push(line);line=[]};
  while(i<text.length){
    const c=text[i];
    if(q){
      if(c==='"' && text[i+1]==='"'){field+='"';i+=2;continue}
      if(c==='"'){q=false;i++;continue}
      field+=c;i++;continue;
    }else{
      if(c==='"'){q=true;i++;continue}
      if(c===','){pushField();i++;continue}
      if(c==='\n'){pushField();pushLine();i++;continue}
      if(c==='\r'){i++;continue}
      field+=c;i++;continue;
    }
  }
  if(field.length>0||line.length>0){pushField();pushLine()}
  return out;
}

// ===== Components =====
function LoginView({onLogin,onSignup,onReset,initGoogle}){
  const [tab,setTab]=useState("login");
  const [email,setEmail]=useState("");
  const [pw,setPw]=useState("");
  const [name,setName]=useState("");
  const [confirm,setConfirm]=useState("");
  const [err,setErr]=useState("");
  const gisRef = useRef(null);

  useEffect(()=>{
    try{
      if(window.google?.accounts?.id && window.NG_GOOGLE_CLIENT_ID && gisRef.current){
        window.google.accounts.id.initialize({
          client_id: window.NG_GOOGLE_CLIENT_ID,
          callback: (resp)=>{
            const p=parseJwt(resp.credential); if(p?.email) onLogin(p.email,"__google__",()=>{});
          }
        });
        window.google.accounts.id.renderButton(gisRef.current,{theme:"outline",size:"large",text:"signin_with",shape:"pill"});
      }
    }catch{}
  },[]);

  const submit=()=>{
    setErr("");
    if(tab==="login"){
      if(!email||!pw){setErr("Enter email & password.");return}
      onLogin(email,pw,setErr);
    }else{
      if(!name||!email||!pw||!confirm){setErr("Fill all fields.");return}
      if(pw!==confirm){setErr("Passwords do not match.");return}
      onSignup(name,email,pw,setErr);
    }
  };

  return (
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
            <img src={LOGO_SRC} className="h-8 w-8" alt="logo"/><div className="text-xl font-bold">Nitty Gritty</div>
          </div>
          <div className="flex gap-2 mb-4">
            <button onClick={()=>setTab("login")} className={`flex-1 px-3 py-2 rounded-lg border ${tab==="login"?"bg-slate-700 border-slate-600":"border-slate-700"}`}>Login</button>
            <button onClick={()=>setTab("signup")} className={`flex-1 px-3 py-2 rounded-lg border ${tab==="signup"?"bg-slate-700 border-slate-600":"border-slate-700"}`}>Sign up</button>
          </div>

          {tab==="signup" && (
            <div className="mb-3">
              <label className="text-sm text-slate-300">Name</label>
              <input value={name} onChange={e=>setName(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/>
            </div>
          )}

          <div className="mb-3">
            <label className="text-sm text-slate-300">Email</label>
            <input value={email} onChange={e=>setEmail(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/>
          </div>

          <div className="mb-2">
            <label className="text-sm text-slate-300">Password</label>
            <input type="password" value={pw} onChange={e=>setPw(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/>
          </div>

          {tab==="signup" && (
            <div className="mb-2">
              <label className="text-sm text-slate-300">Confirm password</label>
              <input type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/>
            </div>
          )}

          <div className="text-right text-sm mb-3">
            <button className="text-blue-400 hover:underline" onClick={()=>onReset(email)}>Forgot password?</button>
          </div>

          {err && <div className="text-red-400 text-sm mb-3">{err}</div>}

          <div className="flex items-center justify-between">
            <div ref={gisRef}></div>
            <button onClick={submit} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500">Continue</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== Modals =====
function Modal({title,children,onClose,maxW="max-w-3xl"}){
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3">
      <div className={`w-[95vw] ${maxW} bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl`}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
          <div className="font-semibold">{title}</div>
          <button onClick={onClose} className="px-3 py-1.5 rounded-lg border border-slate-600 hover:bg-slate-700">✕</button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

function ResetModal({email,onClose}){
  const [e,setE]=useState(email||"");
  const [msg,setMsg]=useState("");
  const [link,setLink]=useState("");

  const send = async ()=>{
    // Create client-side token so user can reset on this device
    const token = Math.random().toString(36).slice(2);
    const exp = Date.now()+15*60*1000; // 15m
    localStorage.setItem("ng_reset_"+token, JSON.stringify({email:e,exp}));
    const url = location.origin+location.pathname+"#reset="+token;
    setLink(url);

    const html = `<div style="font-family:Arial,sans-serif;font-size:14px">
      <p>Reset your Nitty Gritty password:</p>
      <p><a href="${url}">${url}</a></p>
      <p>If you didn't request this, ignore this email.</p>
    </div>`;

    try{
      const ep = (window.CF_RESET_ENDPOINT||"").trim();
      if(!ep) throw new Error("Reset endpoint not configured");
      const res = await fetch(ep,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({to:e,subject:"Reset your Nitty Gritty password",html})});
      if(!res.ok) throw new Error(`Cloudflare: ${res.status}`);
      setMsg("Reset email sent.");
    }catch(err){
      setMsg("Could not send reset email through Cloudflare: "+err.message);
    }
  };

  return (
    <Modal title="Password reset" onClose={onClose} maxW="max-w-md">
      <div className="space-y-3">
        <div>
          <label className="text-sm text-slate-300">Your email</label>
          <input value={e} onChange={ev=>setE(ev.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/>
        </div>
        <button onClick={send} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500">Send reset link</button>
        {msg && <div className="text-sky-400 text-sm">{msg}</div>}
        {link && <div className="text-xs break-all text-slate-400">{link}</div>}
        <div className="text-xs text-slate-500">Note: client-side app; token works on the same device.</div>
      </div>
    </Modal>
  );
}

function NewPasswordModal({token,onClose}){
  const rec = loadJSON("ng_reset_"+token,null);
  const [p1,setP1]=useState("");
  const [p2,setP2]=useState("");
  const [msg,setMsg]=useState("");

  const update=()=>{
    if(!rec || Date.now()>rec.exp){setMsg("Link expired.");return}
    if(!p1 || p1.length<6){setMsg("Password must be at least 6 characters.");return}
    if(p1!==p2){setMsg("Passwords do not match.");return}
    const users = usersLoad();
    const i = users.findIndex(u=>u.email.toLowerCase()===rec.email.toLowerCase());
    if(i>=0){ users[i].password=p1; usersSave(users); localStorage.removeItem("ng_reset_"+token); setMsg("Password updated. You can close this window."); }
  };

  return (
    <Modal title="Create new password" onClose={onClose} maxW="max-w-md">
      <div className="space-y-3">
        <div><label className="text-sm text-slate-300">New password</label>
          <input type="password" value={p1} onChange={e=>setP1(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
        <div><label className="text-sm text-slate-300">Confirm password</label>
          <input type="password" value={p2} onChange={e=>setP2(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
        {msg && <div className="text-sky-400 text-sm">{msg}</div>}
        <button onClick={update} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500">Update</button>
      </div>
    </Modal>
  );
}

// ===== Settings & Customise =====
function SettingsPanel({state,setState,mode,onDone}){
  const [tab,setTab]=useState("account");
  const [symIn,setSymIn]=useState("");
  const [strIn,setStrIn]=useState("");
  const [err,setErr]=useState("");

  const addSym=()=>{const v=(symIn||"").trim().toUpperCase(); if(!v) return; if(arr(state.customSymbols).includes(v)) return; setState({...state,customSymbols:[...arr(state.customSymbols),v]}); setSymIn("")};
  const addStr=()=>{const v=(strIn||"").trim(); if(!v) return; if(arr(state.customStrategies).includes(v)) return; setState({...state,customStrategies:[...arr(state.customStrategies),v]}); setStrIn("")};
  const toggleWidget=(w)=>{const set=new Set(arr(state.widgets)); set.has(w)?set.delete(w):set.add(w); setState({...state,widgets:[...set]})};

  // Simple custom % widget (supported kinds only)
  const [cwTitle,setCwTitle]=useState("");
  const [cwKind,setCwKind]=useState("ExitTypeShare");
  const [cwArg,setCwArg]=useState("TP");
  const addCustom=()=>{
    if(!cwTitle.trim()) {setErr("Title is required."); return;}
    if(cwKind==="ExitTypeShare" && !EXIT_TYPES.includes(cwArg) && cwArg!=="TP"){ setErr("Use an existing Exit Type."); return; }
    if(cwKind==="StrategyWinRateFor" && !arr(state.customStrategies).includes(cwArg)){ setErr("Strategy must exist first."); return; }
    const id="CUST_"+Math.random().toString(36).slice(2);
    setState({...state, customWidgets:[...arr(state.customWidgets), {id,kind:cwKind,arg:cwArg,title:cwTitle}]});
    setCwTitle(""); setCwKind("ExitTypeShare"); setCwArg("TP"); setErr("");
  };

  return (
    <Panel>
      <div className="flex items-center gap-2 mb-4"><IconSettings/><div className="font-semibold">{mode==="setup"?"Initial Account Setup":"Settings"}</div></div>

      <div className="flex gap-2 mb-4">
        <button onClick={()=>setTab("account")} className={`px-3 py-1.5 rounded-lg border ${tab==="account"?"bg-slate-700 border-slate-600":"border-slate-700"}`}>Account</button>
        <button onClick={()=>setTab("custom")} className={`px-3 py-1.5 rounded-lg border ${tab==="custom"?"bg-slate-700 border-slate-600":"border-slate-700"}`}>Customize Journal</button>
      </div>

      {tab==="account" ? (
        <div className="space-y-4">
          <div>
            <label className="text-sm text-slate-300">Name</label>
            <input value={state.name} onChange={e=>setState({...state,name:e.target.value})} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-slate-300">Account type</label>
              <select value={state.accType} onChange={e=>setState({...state,accType:e.target.value})} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2">
                {ACC_TYPES.map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-300">Capital ($)</label>
              <input type="number" value={state.capital} onChange={e=>setState({...state,capital:parseFloat(e.target.value||"0")})} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/>
            </div>
            <div>
              <label className="text-sm text-slate-300">Deposit date</label>
              <input type="date" value={state.depositDate} onChange={e=>setState({...state,depositDate:e.target.value})} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/>
            </div>
          </div>
          {mode==="setup" && <div className="text-right"><button onClick={onDone} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500">Continue</button></div>}
        </div>
      ) : (
        <div className="space-y-8">
          <div>
            <div className="text-sm font-semibold mb-2">Symbols</div>
            <div className="flex gap-2 mb-2">
              <input value={symIn} onChange={e=>setSymIn(e.target.value)} placeholder="E.g. XAUUSD" className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/>
              <button onClick={addSym} className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500">Add</button>
            </div>
            <div className="flex flex-wrap gap-2">{arr(state.customSymbols).map(s=>(
              <span key={s} className="badge text-xs"><span>{s}</span><button onClick={()=>setState({...state,customSymbols:arr(state.customSymbols).filter(x=>x!==s)})}>✕</button></span>
            ))}</div>
          </div>

          <div>
            <div className="text-sm font-semibold mb-2">Strategies</div>
            <div className="flex gap-2 mb-2">
              <input value={strIn} onChange={e=>setStrIn(e.target.value)} placeholder="Strategy name" className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/>
              <button onClick={addStr} className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500">Add</button>
            </div>
            <div className="flex flex-wrap gap-2">{arr(state.customStrategies).map(s=>(
              <span key={s} className="badge text-xs"><span>{s}</span><button onClick={()=>setState({...state,customStrategies:arr(state.customStrategies).filter(x=>x!==s)})}>✕</button></span>
            ))}</div>
          </div>

          <div>
            <div className="text-sm font-semibold mb-2">Dashboard widgets</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {BUILTIN_WIDGETS.map(w=>(
                <label key={w} className="flex items-center gap-2 bg-slate-900/50 border border-slate-700 rounded-xl px-3 py-2">
                  <input type="checkbox" checked={arr(state.widgets).includes(w)} onChange={()=>toggleWidget(w)}/>
                  <span>{w}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-3">
            <div className="text-sm font-semibold mb-2">Add custom % widget (supported only)</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <input value={cwTitle} onChange={e=>setCwTitle(e.target.value)} placeholder="Title" className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/>
              <select value={cwKind} onChange={e=>setCwKind(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2">
                <option value="ExitTypeShare">% by Exit Type</option>
                <option value="StrategyWinRateFor">Win rate for Strategy</option>
              </select>
              <input value={cwArg} onChange={e=>setCwArg(e.target.value)} placeholder="Arg (e.g., TP or Strategy)" className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/>
            </div>
            {err && <div className="text-red-400 text-sm mt-2">{err}</div>}
            <div className="text-right mt-2"><button onClick={addCustom} className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500">Add widget</button></div>
          </div>
        </div>
      )}
    </Panel>
  );
}

// ===== Notes (open composer first) =====
function NotesPanel({state,setState}){
  const [open,setOpen]=useState(true);
  const [date,setDate]=useState(todayISO());
  const [text,setText]=useState("");
  const [tradeIds,setTradeIds]=useState([]);
  const [editId,setEditId]=useState(null);

  const trades = arr(state.trades);

  const save=()=>{
    const id = editId || Math.random().toString(36).slice(2);
    const rec = {id,date,text,tradeIds};
    const list = arr(state.notes).slice();
    const i = list.findIndex(n=>n.id===id);
    if(i>=0) list[i]=rec; else list.unshift(rec);
    setState({...state, notes:list});
    setOpen(false); setEditId(null); setText(""); setTradeIds([]);
  };

  return (
    <Panel>
      <div className="flex items-center justify-between mb-3">
        <div className="font-semibold">Notes</div>
        {!open && <button onClick={()=>setOpen(true)} className="px-3 py-2 rounded-lg border border-slate-700 hover:bg-slate-800"><IconPlus/> Add note</button>}
      </div>

      {open ? (
        <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-3">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="text-sm text-slate-300">Date</label>
              <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/>
            </div>
            <div className="md:col-span-3">
              <label className="text-sm text-slate-300">Note</label>
              <textarea value={text} onChange={e=>setText(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 h-28" placeholder="Write your note..."/>
            </div>
          </div>

          <div className="mt-3">
            <div className="text-sm text-slate-300 mb-1">Refer to trades</div>
            <div className="max-h-40 overflow-auto grid grid-cols-1 md:grid-cols-2 gap-2">
              {trades.map(t=>{
                const checked = tradeIds.includes(t.id);
                return (
                  <label key={t.id} className={`flex items-center gap-2 p-2 rounded-lg border ${checked?'border-blue-500 bg-slate-900':'border-slate-700 bg-slate-900/40'}`}>
                    <input type="checkbox" checked={checked} onChange={(e)=>{
                      const set=new Set(tradeIds); e.target.checked?set.add(t.id):set.delete(t.id); setTradeIds([...set]);
                    }}/>
                    <span className="text-xs">{t.symbol} · {t.strategy} · {(t.exitType&&t.exitType!=="Trade In Progress")?"CLOSED":"OPEN"}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="mt-3 flex justify-between">
            <button onClick={()=>{setOpen(false); setEditId(null); setText(""); setTradeIds([]);}} className="px-4 py-2 rounded-lg border border-slate-600 hover:bg-slate-700">Close</button>
            <button onClick={save} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500">{editId?"Update":"Save"}</button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {arr(state.notes).length===0 && <div className="text-slate-400 text-sm">No notes yet.</div>}
          {arr(state.notes).map(n=>(
            <div key={n.id} className="bg-slate-900/50 border border-slate-700 rounded-xl p-3">
              <div className="text-xs text-slate-400">{n.date}</div>
              <div className="text-sm line-clamp-2">{n.text||"(empty)"}</div>
              <div className="mt-2"><button onClick={()=>{setOpen(true); setDate(n.date); setText(n.text); setTradeIds(n.tradeIds||[]); setEditId(n.id);}} className="text-blue-400">Open</button></div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

// ===== Tiny widgets =====
function GeneralStats({state}){
  const closed = arr(state.trades).filter(t=>t.exitType && t.exitType!=="Trade In Progress");
  const pnl = closed.map(t=>computePnLUSD(t,state.accType)).filter(v=>v!==null && isFinite(v));
  const total = pnl.reduce((a,b)=>a+b,0);
  const wins = pnl.filter(v=>v>0).length, losses = pnl.filter(v=>v<0).length;
  const wr = (wins+losses)>0 ? Math.round(100*wins/(wins+losses)) : 0;
  const open = arr(state.trades).filter(t=>!t.exitType || t.exitType==="Trade In Progress").length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <Panel><div className="text-slate-400 text-xs">Capital</div><div className="text-2xl font-bold">{state.accType==="Cent Account"?(r2(state.capital*100).toFixed(2)+" ¢"):fmt$(state.capital)}</div></Panel>
      <Panel><div className="text-slate-400 text-xs">Realized P&L</div><div className="text-2xl font-bold">{fmt$((total))}</div></Panel>
      <Panel><div className="text-slate-400 text-xs">Win rate</div><div className="text-2xl font-bold">{wr}%</div></Panel>
      <Panel><div className="text-slate-400 text-xs">Open trades</div><div className="text-2xl font-bold">{open}</div></Panel>
    </div>
  );
}

function StrategyWinRate({state}){
  const closed = arr(state.trades).filter(t=>t.exitType && t.exitType!=="Trade In Progress");
  if(!closed.length) return null;
  const map = {};
  arr(state.customStrategies).forEach(s=>map[s]={w:0,l:0});
  closed.forEach(t=>{
    const v = computePnLUSD(t,state.accType);
    if(!map[t.strategy]) map[t.strategy]={w:0,l:0};
    if(v>0) map[t.strategy].w++; else if(v<0) map[t.strategy].l++;
  });
  const rows = Object.entries(map).map(([k,v])=>({k,wr:(v.w+v.l)>0?Math.round(100*v.w/(v.w+v.l)):0})).sort((a,b)=>b.wr-a.wr);
  if(!rows.length) return null;
  const top = rows[0];
  return (
    <Panel>
      <div className="text-sm font-semibold mb-2">Best Strategy</div>
      <div className="flex items-center gap-3">
        <div className="text-lg">{top.k}</div>
        <div className="text-lg font-bold">{top.wr}%</div>
      </div>
      <div className="mt-2 bg-slate-900/50 h-2 rounded-full overflow-hidden"><div className="bg-blue-600 h-2" style={{width:`${top.wr}%`}}/></div>
    </Panel>
  );
}

function DetailedStats({state}){
  const rows = useMemo(()=>{
    const m={};
    arr(state.trades).forEach(t=>{
      const k=t.symbol||"N/A";
      const v=computePnLUSD(t,state.accType);
      m[k]=m[k]||{n:0,p:0}; m[k].n++; if(isFinite(v)) m[k].p+=v||0;
    });
    return Object.entries(m).map(([sym,v])=>({sym,count:v.n,pnl:v.p}));
  },[state.trades,state.accType]);

  return (
    <Panel>
      <div className="text-sm font-semibold mb-2">Detailed Statistics</div>
      <div className="overflow-auto">
        <table className="min-w-full text-sm">
          <thead><tr><Th>Symbol</Th><Th>Trades</Th><Th>Total P&L</Th><Th>P&L (Units)</Th></tr></thead>
          <tbody>
            {rows.map(r=>(
              <tr key={r.sym} className="border-t border-slate-700">
                <Td>{r.sym}</Td>
                <Td>{r.count}</Td>
                <Td>{fmt$(r.pnl)}</Td>
                <Td>{fmtUnits(state.accType,r.pnl)}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

// ===== Trade modal (minimal) =====
function TradeModal({state,setState,initial,onClose}){
  const i = initial||{};
  const [symbol,setSymbol]=useState(i.symbol||arr(state.customSymbols)[0]||"XAUUSD");
  const [side,setSide]=useState(i.side||"BUY");
  const [date,setDate]=useState(i.date||todayISO());
  const [lot,setLot]=useState(i.lotSize ?? state.lastLotSize ?? 0.01);
  const [entry,setEntry]=useState(i.entry??"");
  const [exit,setExit]=useState(i.exit??"");
  const [tp1,setTp1]=useState(i.tp1??"");
  const [tp2,setTp2]=useState(i.tp2??"");
  const [sl,setSl]=useState(i.sl??"");
  const [strategy,setStrategy]=useState(i.strategy||arr(state.customStrategies)[0]||DEFAULT_STRATEGIES[0]);
  const [exitType,setExitType]=useState(i.exitType||"TP");

  const save=()=>{
    const id = i.id || Math.random().toString(36).slice(2);
    const rec = {
      id,date,symbol,side,
      lotSize: Number(lot)||0,
      entry: entry===""?undefined:Number(entry),
      exit:  exit===""?undefined:Number(exit),
      tp1:   tp1===""?undefined:Number(tp1),
      tp2:   tp2===""?undefined:Number(tp2),
      sl:    sl===""?undefined:Number(sl),
      strategy, exitType
    };
    const list = arr(state.trades).slice();
    const idx = list.findIndex(t=>t.id===id);
    if(idx>=0) list[idx]=rec; else list.unshift(rec);
    setState({...state, trades:list, lastLotSize:rec.lotSize});
    onClose();
  };

  return (
    <Modal title={i.id?"Edit Trade":"Add Trade"} onClose={onClose}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div><label className="text-sm text-slate-300">Symbol</label>
          <select value={symbol} onChange={e=>setSymbol(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2">
            {arr(state.customSymbols).map(s=><option key={s}>{s}</option>)}
          </select></div>
        <div><label className="text-sm text-slate-300">Action</label>
          <select value={side} onChange={e=>setSide(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2">
            <option>BUY</option><option>SELL</option>
          </select></div>
        <div><label className="text-sm text-slate-300">Date</label>
          <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>

        <div><label className="text-sm text-slate-300">Lot size</label><input type="number" step="0.01" value={lot} onChange={e=>setLot(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
        <div><label className="text-sm text-slate-300">Entry</label><input type="number" step="0.0001" value={entry} onChange={e=>setEntry(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
        <div><label className="text-sm text-slate-300">Exit</label><input type="number" step="0.0001" value={exit} onChange={e=>setExit(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
        <div><label className="text-sm text-slate-300">TP1</label><input type="number" step="0.0001" value={tp1} onChange={e=>setTp1(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
        <div><label className="text-sm text-slate-300">TP2</label><input type="number" step="0.0001" value={tp2} onChange={e=>setTp2(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
        <div><label className="text-sm text-slate-300">SL</label><input type="number" step="0.0001" value={sl} onChange={e=>setSl(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
        <div><label className="text-sm text-slate-300">Strategy</label>
          <select value={strategy} onChange={e=>setStrategy(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2">
            {arr(state.customStrategies).map(s=><option key={s}>{s}</option>)}
          </select></div>
        <div><label className="text-sm text-slate-300">Exit type</label>
          <select value={exitType} onChange={e=>setExitType(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2">
            {EXIT_TYPES.map(s=><option key={s}>{s}</option>)}
          </select></div>
      </div>

      <div className="mt-4 text-right">
        <button onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-600 hover:bg-slate-700 mr-2">Cancel</button>
        <button onClick={save} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500">Save</button>
      </div>
    </Modal>
  );
}

// ===== App =====
function App(){
  // Reset link handler
  const [resetToken,setResetToken]=useState(()=>{
    const h=new URLSearchParams(location.hash.slice(1));return h.get("reset")||"";
  });

  const {users,add:usersAdd,upd:usersUpd}=useUsers();
  const [currentEmail,setCurrentEmail]=useState(currentGet());

  // Load & normalize state safely for *any* email (including empty)
  const ensureState = (email)=>{
    const saved = stateLoad(email);
    const s = normalize(saved?{...saved,email} : baseState(email));
    stateSave(email,s); // keep normalized
    return s;
  };
  const [state,setState]=useState(ensureState(currentEmail||"__guest__"));
  useEffect(()=>{ // whenever state.email changes, persist safely
    if(!state?.email) return;
    stateSave(state.email, normalize(state));
  },[state]);

  // If logged-out, avoid reading broken state by keeping a guest sandbox
  useEffect(()=>{
    if(!currentEmail){ setState(ensureState("__guest__")); }
    else { setState(ensureState(currentEmail)); }
  },[currentEmail]);

  // Auth
  const login = (email,password,setErr)=>{
    const u = users.find(x=>x.email.toLowerCase()===String(email).toLowerCase());
    if(!u){
      if(password==="__google__"){
        usersAdd({name:email.split("@")[0],email,password:""});
        stateSave(email, normalize(baseState(email)));
        currentSet(email); setCurrentEmail(email);
        return;
      }
      setErr("No such user. Please sign up."); return;
    }
    if(password!=="__google__" && u.password!==password){setErr("Wrong password.");return}
    currentSet(u.email); setCurrentEmail(u.email);
  };
  const signup = (name,email,password,setErr)=>{
    if(users.some(u=>u.email.toLowerCase()===email.toLowerCase())){setErr("Email already registered.");return}
    usersAdd({name,email,password});
    stateSave(email, normalize({...baseState(email), name}));
    currentSet(email); setCurrentEmail(email);
  };
  const logout = ()=>{currentSet(""); setCurrentEmail("");};

  // CSV export/import
  const exportCSV = ()=>{
    const H = ["Date","Symbol","Side","Lot Size","Entry","Exit","TP1","TP2","SL","Strategy","Exit Type","P&L","P&L (Units)","Status"];
    const E = (v)=>v==null?"":String(v).includes(",")?`"${String(v).replace(/"/g,'""')}"`:v;
    const out = [H.join(",")];
    arr(state.trades).forEach(t=>{
      const v = computePnLUSD(t,state.accType);
      const status = (t.exitType && t.exitType!=="Trade In Progress") ? "CLOSED" : "OPEN";
      out.push([
        t.date,t.symbol,t.side,t.lotSize,t.entry??"",t.exit??"",t.tp1??"",t.tp2??"",t.sl??"",t.strategy,t.exitType||"",
        v==null?"":r2(v), v==null?"":fmtUnits(state.accType,v), status
      ].map(E).join(","));
    });
    const csv = "﻿"+out.join("\n");
    const url = URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8;"}));
    const a = document.createElement("a"); a.href=url; a.download="Nitty_Gritty_Export.csv"; a.click(); URL.revokeObjectURL(url);
  };
  const importCSV = (e)=>{
    const f = e.target.files?.[0]; if(!f) return;
    const reader = new FileReader();
    reader.onload = (ev)=>{
      try{
        const rows = parseCSV(String(ev.target.result||""));
        if(rows.length<2){alert("No data rows."); return}
        const head = rows[0].map(h=>h.trim().toLowerCase());
        const idx = (nameList)=> head.findIndex(h=>nameList.includes(h));
        const col = {
          date: idx(["date"]),
          symbol: idx(["symbol","instrument","pair"]),
          side: idx(["side","action","direction"]),
          lot: idx(["lot size","lot","lotsize","qty"]),
          entry: idx(["entry","entryprice"]),
          exit: idx(["exit","exitprice"]),
          tp1: idx(["tp1","tp 1","takeprofit1"]),
          tp2: idx(["tp2","tp 2","takeprofit2"]),
          sl: idx(["sl","stoploss","stop"]),
          strategy: idx(["strategy"]),
          exitType: idx(["exit type","exittype","status"])
        };
        const toNum=(v)=>{const n=Number(v); return isFinite(n)?n:undefined};
        const imported=[];
        for(let r=1;r<rows.length;r++){
          const row=rows[r];
          if(!row || row.every(x=>!x || String(x).trim()==="")) continue;
          const t={
            id: Math.random().toString(36).slice(2),
            date: row[col.date]||todayISO(),
            symbol: (row[col.symbol]||"XAUUSD").toString().toUpperCase(),
            side: (row[col.side]||"BUY").toUpperCase()==="SELL"?"SELL":"BUY",
            lotSize: toNum(row[col.lot])||0.01,
            entry: toNum(row[col.entry]),
            exit:  toNum(row[col.exit]),
            tp1:   toNum(row[col.tp1]),
            tp2:   toNum(row[col.tp2]),
            sl:    toNum(row[col.sl]),
            strategy: row[col.strategy]||"Trend Line Bounce",
            exitType: row[col.exitType]||""
          };
          if(!t.exitType && t.exit!=null) t.exitType="TP";
          imported.push(t);
        }
        setState({...state, trades:[...imported, ...arr(state.trades)]});
        alert(`Imported ${imported.length} rows.`);
      }catch(err){ alert("Import failed: "+err.message); }
    };
    reader.readAsText(f);
  };

  // Setup modal on first login
  const [setupOpen,setSetupOpen]=useState(false);
  useEffect(()=>{
    if(currentEmail && !state.setupComplete){ setSetupOpen(true); }
  },[currentEmail, state.setupComplete]);

  // Reset flow from hash
  useEffect(()=>{
    const onHash=()=>{const h=new URLSearchParams(location.hash.slice(1)); setResetToken(h.get("reset")||"");};
    window.addEventListener("hashchange",onHash); return ()=>window.removeEventListener("hashchange",onHash);
  },[]);

  // ----- Views -----
  if(resetToken){
    return <NewPasswordModal token={resetToken} onClose={()=>{location.hash=""; setResetToken("");}}/>;
  }

  if(!currentEmail){
    return (
      <>
        <LoginView
          onLogin={login}
          onSignup={signup}
          onReset={(e)=>setResetOpen(true)}
        />
        {/* Reset modal can be opened after clicking the link */}
      </>
    );
  }

  // Shell
  const [page,setPage]=useState("dashboard");
  const [tradeModal,setTradeModal]=useState(null);
  const [resetOpen,setResetOpen]=useState(false);

  const navBtn = (k,label)=>(
    <button onClick={()=>setPage(k)} className={`w-full text-left px-3 py-2 rounded-lg border ${page===k?'bg-slate-700 border-slate-600':'border-slate-700 hover:bg-slate-800'}`}>{label}</button>
  );

  // Render widgets safely
  const selected = arr(state.widgets);
  const dash = (
    <div className="space-y-4">
      {selected.includes("GeneralStats") && <GeneralStats state={state}/>}
      {selected.includes("StrategyWinRate") && <StrategyWinRate state={state}/>}
      {selected.includes("DetailedStats") && <DetailedStats state={state}/>}
      {arr(state.customWidgets).map(w=>{
        if(w.kind==="ExitTypeShare"){
          const closed = arr(state.trades).filter(t=>t.exitType && t.exitType!=="Trade In Progress");
          const n = closed.length, m = closed.filter(t=>String(t.exitType).toUpperCase()==="TP").length;
          const pct = n?Math.round(100*m/n):0;
          return <Panel key={w.id}><div className="text-sm font-semibold mb-2">{w.title}</div><div className="text-lg font-bold">{pct}%</div><div className="mt-2 bg-slate-900/50 h-2 rounded-full overflow-hidden"><div className="bg-blue-600 h-2" style={{width:`${pct}%`}}/></div></Panel>
        }
        if(w.kind==="StrategyWinRateFor"){
          const closed = arr(state.trades).filter(t=>t.exitType && t.exitType!=="Trade In Progress" && t.strategy===w.arg);
          const wins = closed.filter(t=>computePnLUSD(t,state.accType)>0).length;
          const pct = closed.length?Math.round(100*wins/closed.length):0;
          return <Panel key={w.id}><div className="text-sm font-semibold mb-2">{w.title}</div><div className="text-lg font-bold">{pct}%</div><div className="mt-2 bg-slate-900/50 h-2 rounded-full overflow-hidden"><div className="bg-blue-600 h-2" style={{width:`${pct}%`}}/></div></Panel>
        }
        return null;
      })}
    </div>
  );

  const histories = (
    <Panel>
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-semibold">Trade History</div>
        <div className="flex gap-2">
          <button onClick={()=>setTradeModal({})} className="px-3 py-2 rounded-lg border border-slate-700 hover:bg-slate-800"><IconPlus/> Add</button>
          <input id="imp" type="file" accept=".csv" className="hidden" onChange={importCSV}/>
          <label htmlFor="imp" className="px-3 py-2 rounded-lg border border-slate-700 hover:bg-slate-800 cursor-pointer">Import CSV</label>
          <button onClick={exportCSV} className="px-3 py-2 rounded-lg border border-slate-700 hover:bg-slate-800">Export CSV</button>
        </div>
      </div>
      <div className="overflow-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              <Th>Date</Th><Th>Symbol</Th><Th>Side</Th><Th>Lot</Th><Th>Entry</Th><Th>Exit</Th><Th>TP1</Th><Th>TP2</Th><Th>SL</Th><Th>Strategy</Th><Th>Exit</Th><Th>P&L</Th><Th>P&L (Units)</Th><Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {arr(state.trades).map(t=>{
              const v=computePnLUSD(t,state.accType);
              const status=(t.exitType && t.exitType!=="Trade In Progress")?"CLOSED":"OPEN";
              return (
                <tr key={t.id} className="border-t border-slate-700">
                  <Td>{t.date}</Td><Td>{t.symbol}</Td><Td>{t.side}</Td><Td>{t.lotSize}</Td>
                  <Td>{t.entry??""}</Td><Td>{t.exit??""}</Td><Td>{t.tp1??""}</Td><Td>{t.tp2??""}</Td><Td>{t.sl??""}</Td><Td>{t.strategy}</Td><Td>{t.exitType||""}</Td>
                  <Td className={v>0?'text-green-400':v<0?'text-red-400':''}>{v==null?'-':fmt$((v))}</Td>
                  <Td className={v>0?'text-green-400':v<0?'text-red-400':''}>{v==null?'-':fmtUnits(state.accType,v)}</Td>
                  <Td>{status}</Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Panel>
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/70 backdrop-blur">
        <div className="flex items-center gap-3">
          <img src={LOGO_SRC} className="h-7 w-7" alt="logo"/>
          <div className="font-bold">Nitty Gritty</div>
          <span className="bg-blue-900 text-xs px-2 py-0.5 rounded-md">Trading journal</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={()=>setResetOpen(true)} className="px-3 py-2 rounded-lg border border-slate-700 hover:bg-slate-800">Reset password</button>
          <button onClick={logout} className="px-3 py-2 rounded-lg border border-slate-700 hover:bg-slate-800">Logout</button>
        </div>
      </div>

      {/* Body */}
      <div className="flex">
        <div className="w-72 shrink-0 border-r border-slate-800 min-h-[calc(100vh-56px)] p-4 space-y-4">
          <Panel>
            <div className="text-sm text-slate-300">Account Type</div>
            <div className="font-semibold mb-2">{state.accType}</div>
            <div className="text-sm text-slate-300">Capital</div>
            <div className="text-2xl font-bold mb-1">{state.accType==="Cent Account"?(r2(state.capital*100).toFixed(2)+" ¢"):fmt$(state.capital)}</div>
            <div className="text-xs text-slate-400">Deposit: {state.depositDate}</div>
            <div className="pt-3">
              <button onClick={()=>setTradeModal({})} className="w-full px-3 py-2 rounded-lg border border-slate-700 hover:bg-slate-800"><IconPlus/> Add trade</button>
            </div>
          </Panel>

          <div className="space-y-2">
            {navBtn("dashboard","Dashboard")}
            {navBtn("histories","Histories")}
            {navBtn("notes","Notes")}
            {navBtn("settings","Settings")}
          </div>
        </div>

        <div className="flex-1 p-4 md:p-6">
          {page==="dashboard" && dash}
          {page==="histories" && histories}
          {page==="notes" && <NotesPanel state={state} setState={setState}/>}
          {page==="settings" && <SettingsPanel state={state} setState={setState} mode="edit" onDone={()=>{}}/>}
        </div>
      </div>

      {tradeModal && <TradeModal state={state} setState={setState} initial={tradeModal} onClose={()=>setTradeModal(null)}/>}
      {setupOpen && <Modal title="Initial Account Setup" onClose={()=>{setSetupOpen(false); setState({...state,setupComplete:true})}}>
        <SettingsPanel state={state} setState={setState} mode="setup" onDone={()=>{setSetupOpen(false); setState({...state,setupComplete:true})}}/>
      </Modal>}
      {resetOpen && <ResetModal email={state.email} onClose={()=>setResetOpen(false)}/>}
    </div>
  );
}

// ===== Mount =====
ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
