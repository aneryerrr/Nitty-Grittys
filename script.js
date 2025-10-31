const {useState,useEffect,useMemo,useRef} = React;

/* ---------- constants ---------- */
const LOGO = "/logo-ng.png";
const BADGE = "Trading Journal";
const SYMBOLS = ["XAUUSD","US100","US30","EURUSD","BTCUSD","AUDCAD","USDCAD","USDJPY","GBPUSD"];
const STRATEGIES = ["Trend Line Bounce","2 Touch Point Trend Line Break","3 / 3+ Touch Point Trend Line Break","Trend Line Break & Re-test","Trend Continuation"];
const EXIT_TYPES = ["TP","SL","TP1_BE","TP1_SL","BE"];
const ACC_TYPES = ["Cent Account","Dollar Account"];
const CLIENT_ID = "579461879935-qaj9nta2pfbrn17ss5idu2k39p4joir4.apps.googleusercontent.com"; // keep working GIS

/* ---------- utils ---------- */
const r2 = (n)=>Math.round(n*100)/100;
const fmt$ = (n)=>"$"+(isFinite(n)?r2(n):0).toFixed(2);
const todayISO = ()=> {
  const d=new Date(); const tz=d.getTimezoneOffset();
  return new Date(d.getTime()-tz*60000).toISOString().slice(0,10);
};
const decodeJwt = (t)=>JSON.parse(atob(t.split(".")[1]||"{}"));
/* storage */
const USERS_KEY="ng_users_v1", CUR="ng_current_user_v1";
const loadUsers=()=>{try{return JSON.parse(localStorage.getItem(USERS_KEY)||"[]")}catch{return[]}};
const saveUsers=(u)=>{try{localStorage.setItem(USERS_KEY,JSON.stringify(u))}catch{}};
const saveCurrent=(e)=>{try{localStorage.setItem(CUR,e)}catch{}};
const getCurrent=()=>{try{return localStorage.getItem(CUR)||""}catch{return""}};
const loadState=(e)=>{if(!e)return null;try{return JSON.parse(localStorage.getItem("ng_state_"+e)||"null")}catch{return null}};
const saveState=(e,s)=>{try{localStorage.setItem("ng_state_"+e,JSON.stringify(s))}catch{}};

/* P&L helpers (kept logic) */
function perLotValueForMove(symbol,delta,accType){
  const abs=Math.abs(delta), std=(x)=>accType==="Dollar Account"?x:x/100;
  switch(symbol){
    case"US30":case"US100":return abs*std(10);
    case"XAUUSD":return abs*std(100);
    case"BTCUSD":return abs*std(1);
    case"EURUSD":case"GBPUSD":return abs/0.0001*std(10);
    case"AUDCAD":case"USDCAD":return abs/0.0001*std(7.236);
    case"USDJPY":return abs/0.01*std(6.795);
    default:return 0;
  }
}
function legPnL(sym,side,entry,exit,lot,acc){
  const v=perLotValueForMove(sym,exit-entry,acc)*(lot||0);
  const s=side==="BUY"?Math.sign(exit-entry):-Math.sign(exit-entry);
  return v*s;
}
function computeDollarPnL(t,acc){
  const has=(v)=>typeof v==="number"&&isFinite(v);
  if(has(t.exit)&&(!t.exitType||t.exitType==="TP")) return legPnL(t.symbol,t.side,t.entry,t.exit,t.lotSize,acc);
  const {entry,sl,tp1,tp2,lotSize:lot,side}=t;
  switch(t.exitType){
    case"SL": if(!has(sl))return null; return legPnL(t.symbol,side,entry,sl,lot,acc);
    case"TP": if(has(tp2))return legPnL(t.symbol,side,entry,tp2,lot,acc);
              if(has(tp1))return legPnL(t.symbol,side,entry,tp1,lot,acc); return null;
    case"TP1_BE": if(!has(tp1))return null; return (legPnL(t.symbol,side,entry,tp1,lot,acc)+0)/2;
    case"TP1_SL": if(!has(tp1)||!has(sl))return null; 
                  return (legPnL(t.symbol,side,entry,tp1,lot,acc)+legPnL(t.symbol,side,entry,sl,lot,acc))/2;
    case"BE": return 0;
    default: return null;
  }
}
const formatPnlDisplay=(acc,p)=>acc==="Cent Account" ? (r2(p*100)).toFixed(2)+" ¢" : fmt$(p);
const formatUnits=(acc,p)=>acc==="Dollar Account" ? r2(p).toFixed(2) : r2(p*100).toFixed(2);

/* ---------- small UI bits ---------- */
const Icon = ({d,className})=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className||"w-5 h-5"}><path d={d}/></svg>;
const IconUser = (p)=><Icon {...p} d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5ZM4 20a8 8 0 0 1 16 0Z"/>;
const IconCal  = (p)=><svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M8 3v4M16 3v4"/><rect x="3" y="5" rx="2" width="18" height="16"/><path d="M3 10h18"/></svg>;
const IconHome = (p)=><Icon {...p} d="M3 10.5 12 3l9 7.5M5 9v12h14V9"/>;
const IconList = (p)=><Icon {...p} d="M4 6h16M4 12h16M4 18h16"/>;
const IconHist = (p)=><Icon {...p} d="M12 8v5l3 3M12 3a9 9 0 1 0 9 9M21 3v6h-6"/>;
const IconGear = (p)=><Icon {...p} d="M12 15.5a3.5 3.5 0 1 0 0-7m7.4 6.5a1.6 1.6 0 0 0 .4 1.8l.1.1a2 2 0 1 1-2.9 2.9l-.1-.1a1.6 1.6 0 0 0-1.8.4 1.6 1.6 0 0 0-.4 1V22a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-.4-1 1.6 1.6 0 0 0-1.8-.4l-.1.1a2 2 0 1 1-2.9-2.9l.1-.1a1.6 1.6 0 0 0 .4-1.8 1.6 1.6 0 0 0-1-.4H2a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1-.4 1.6 1.6 0 0 0 .4-1.8l-.1-.1A2 2 0 1 1 6.2 2.9l.1.1A1.6 1.6 0 0 0 8 4.6c.4 0 .8-.2 1-.6s.3-.7.3-1V2a2 2 0 1 1 4 0v.1c0 .4.2.8.4 1 .3.2.6.4 1 .4.6 0 1.2-.2 1.6-.7l.1-.1A2 2 0 1 1 21.1 6.2l-.1.1c-.3.2-.4.6-.4 1s.1.7.4 1c.3.3.6.4 1 .4H22a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1 .4 1.6 1.6 0 0 0-.5 1z"/>;

/* ---------- shared components ---------- */
function Modal({title,children,onClose,classes=""}){
  return (
    <div className={"modal "+classes}>
      <div className="modal-card">
        <div className="modal-head">
          <div className="font-semibold">{title}</div>
          <button className="btn" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
const Th=({children})=><th className="text-left font-semibold text-slate-300 px-3 py-2">{children}</th>;
const Td=({children,className})=><td className={"px-3 py-2 "+(className||"")}>{children}</td>;

/* ---------- Forgot Password ---------- */
function ForgotPasswordModal({email,onClose,firstName="User"}) {
  const token = Math.random().toString(36).slice(2)+Math.random().toString(36).slice(2);
  const link = `${location.origin+location.pathname}?reset=${token}`;
  const expiry = "30 minutes";
  const body =
`Dear ${firstName},

We received a request to reset the password for your Trading Journal account. To proceed, please click the link below: 

${link}

This link will expire in ${expiry}. If you did not request a reset, please ignore this email.

Regards,
Nitty Gritty Support`;
  const openClient = ()=>{
    const mailto = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent("Password Reset")}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
  };
  const copy = ()=>navigator.clipboard?.writeText(body);
  return (
    <Modal title="Forgot Password" onClose={onClose} classes="forgot-modal">
      <div className="space-y-3">
        <div>
          <div className="text-sm text-slate-300">Account Email</div>
          <div className="mt-1 border border-slate-700 rounded-xl px-3 py-2 bg-slate-900">{email||"you@example.com"}</div>
        </div>
        <div className="text-sm text-slate-300">From: <span className="text-slate-100">support@nittygritty.com</span></div>
        <div className="text-sm text-slate-300">To: <span className="text-slate-100">{email||"recipient@example.com"}</span></div>
        <div className="border border-slate-700 rounded-xl p-3 bg-slate-900 whitespace-pre-wrap text-slate-200 text-sm">
          {body}
        </div>
        <div className="flex items-center gap-2 justify-end">
          <button className="btn" onClick={copy}>Copy Email</button>
          <button className="btn btn-primary" onClick={openClient}>Open Mail Client</button>
        </div>
      </div>
    </Modal>
  );
}

/* ---------- Login ---------- */
function LoginView({onLogin,onSignup,onForgot,initGoogle}) {
  const [mode,setMode]=useState("login");
  const [email,setEmail]=useState("");
  const [pw,setPw]=useState("");
  const [name,setName]=useState("");
  const [confirm,setConfirm]=useState("");
  const [showPw,setShowPw]=useState(false);
  const [err,setErr]=useState("");

  useEffect(()=>{initGoogle?.()},[]);

  const submit=()=>{
    setErr("");
    if(mode==="login"){
      if(!email||!pw) return setErr("Fill all fields.");
      onLogin(email,pw,setErr);
    }else{
      if(!name||!email||!pw||!confirm) return setErr("Fill all fields.");
      if(pw!==confirm) return setErr("Passwords do not match.");
      onSignup(name,email,pw,setErr);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{background:"#0b1220"}}>
      <div className="w-[92vw] max-w-md card">
        <div className="flex items-center gap-3 mb-2">
          <img src={LOGO} className="h-8 w-8" alt="logo"/>
          <div className="text-xl font-semibold">Nitty Gritty</div>
        </div>

        <p className="quote hidden-sm">“Discipline is choosing what you want most over what you want now.”</p>

        <div className="flex gap-2 my-3">
          <button onClick={()=>setMode("login")} className={"btn "+(mode==="login"?"btn-primary":"")}>Login</button>
          <button onClick={()=>setMode("signup")} className={"btn "+(mode==="signup"?"btn-primary":"")}>Sign up</button>
        </div>

        {mode==="signup" && (
          <div className="mb-3">
            <label className="text-sm text-slate-300">Name</label>
            <input className="input mt-1" value={name} onChange={e=>setName(e.target.value)}/>
          </div>
        )}

        <div className="mb-3">
          <label className="text-sm text-slate-300">Email</label>
          <input className="input mt-1" value={email} onChange={e=>setEmail(e.target.value)}/>
        </div>

        <div className="mb-4">
          <label className="text-sm text-slate-300">Password</label>
          <div className="mt-1" style={{display:"flex",gap:"8px"}}>
            <input className="input" type={showPw?"text":"password"} value={pw} onChange={e=>setPw(e.target.value)} />
            <button className="btn" onClick={()=>setShowPw(v=>!v)}>{showPw?"Hide":"Show"}</button>
          </div>
        </div>

        {mode==="signup" && (
          <div className="mb-4">
            <label className="text-sm text-slate-300">Confirm Password</label>
            <input className="input mt-1" type={showPw?"text":"password"} value={confirm} onChange={e=>setConfirm(e.target.value)} />
          </div>
        )}

        {err && <div className="text-red-400 text-sm mb-3">{err}</div>}

        <div className="flex items-center justify-between">
          <div id="googleBtn"></div>
          <button className="btn btn-primary" onClick={submit}>Continue</button>
        </div>

        <div className="mt-3 text-right">
          <button className="btn" onClick={()=>onForgot(email)}>Forgot password?</button>
        </div>
      </div>
    </div>
  );
}

/* ---------- App shell (topbar with hamburger + user at right) ---------- */
function UserMenu({onExport,onLogout}){
  const [open,setOpen]=useState(false);
  return (
    <div className="usermenu">
      <button className="iconbtn" onClick={()=>setOpen(o=>!o)}><IconUser/></button>
      {open && (
        <div className="usermenu-panel">
          <button onClick={()=>{setOpen(false);onExport();}}>Export CSV</button>
          <button onClick={()=>{setOpen(false);onLogout();}} style={{color:"#fecaca"}}>Logout</button>
        </div>
      )}
    </div>
  );
}

function TopBar({onToggle,showBadge,onExport,onLogout}){
  return (
    <div className="topbar">
      <div className="brand">
        <button className="iconbtn" onClick={onToggle} title="Toggle Sidebar"><IconList/></button>
        <img src={LOGO} className="h-7 w-7" alt="logo"/>
        <div className="name">Nitty Gritty</div>
        {showBadge && <span className="badge">{BADGE}</span>}
      </div>
      <UserMenu onExport={onExport} onLogout={onLogout}/>
    </div>
  );
}

/* ---------- Feature panels (unchanged in logic) ---------- */
const Stat=({label,value})=>(
  <div className="card">
    <div className="text-slate-400 text-xs">{label}</div>
    <div className="text-2xl font-bold mt-1">{value}</div>
  </div>
);

function GeneralStats({ trades, accType, capital, depositDate }) {
  const realized = trades.filter(t => new Date(t.date) >= new Date(depositDate) && t.exitType);
  const pnl = realized.map(t => computeDollarPnL(t, accType)).filter(v => v !== null && isFinite(v));
  const total = pnl.reduce((a,b)=>a+b,0);
  const wins = pnl.filter(v=>v>0).length;
  const losses = pnl.filter(v=>v<0).length;
  const open = trades.filter(t => !t.exitType && (t.exit===undefined || t.exit===null)).length;
  const wr = (wins+losses)>0 ? Math.round((wins/(wins+losses))*100) : 0;
  return (
    <div className="grid" style={{gridTemplateColumns:"repeat(4,minmax(0,1fr))",gap:"12px"}}>
      <Stat label="Capital" value={accType==='Cent Account' ? `${r2(capital*100).toFixed(2)} ¢` : fmt$(capital)} />
      <Stat label="Realized P&L" value={formatPnlDisplay(accType, total)} />
      <Stat label="Win Rate" value={`${wr}%`} />
      <Stat label="Open" value={open} />
    </div>
  );
}

function DetailedStats({ trades, accType }) {
  const bySym = useMemo(() => {
    const map = {};
    for (const t of trades) {
      const k = t.symbol || 'N/A';
      const v = computeDollarPnL(t, accType);
      const s = map[k] || { count:0, pnl:0 };
      s.count += 1; s.pnl += (v && isFinite(v)) ? v : 0; map[k]=s;
    }
    return Object.entries(map).map(([sym, v]) => ({ sym, count: v.count, pnl: v.pnl }));
  }, [trades, accType]);

  return (
    <div className="card">
      <div className="text-sm font-semibold mb-2">Detailed Statistics</div>
      <div className="table-wrap">
        <table className="table">
          <thead><tr><Th>Symbol</Th><Th>Trades</Th><Th>Total P&L</Th><Th>P&L (Units)</Th></tr></thead>
          <tbody>
            {bySym.map(r=>(
              <tr key={r.sym}>
                <Td>{r.sym}</Td>
                <Td>{r.count}</Td>
                <Td>{formatPnlDisplay(accType, r.pnl)}</Td>
                <Td>{formatUnits(accType, r.pnl)}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Histories({ trades, accType, onEdit, onDelete }) {
  return (
    <div className="card">
      <div className="text-sm font-semibold mb-2">Trade History</div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <Th>Date</Th><Th>Symbol</Th><Th>Side</Th><Th>Lot size</Th><Th>Entry</Th><Th>Exit</Th>
              <Th>TP1</Th><Th>TP2</Th><Th>SL</Th><Th>Exit Type</Th><Th>P&L</Th><Th>P&L (Units)</Th><Th>Status</Th><Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {trades.map(t=>{
              const v=computeDollarPnL(t,accType); const closed=!!t.exitType;
              return (
                <tr key={t.id}>
                  <Td>{t.date}</Td><Td>{t.symbol}</Td><Td>{t.side}</Td><Td>{t.lotSize}</Td>
                  <Td>{typeof t.entry==='number'?t.entry:''}</Td>
                  <Td>{typeof t.exit==='number'?t.exit:''}</Td>
                  <Td>{typeof t.tp1==='number'?t.tp1:''}</Td>
                  <Td>{typeof t.tp2==='number'?t.tp2:''}</Td>
                  <Td>{typeof t.sl==='number'?t.sl:''}</Td>
                  <Td>{t.exitType||''}</Td>
                  <Td className={v>0?'text-green-400':v<0?'text-red-400':''}>{v===null?'-':formatPnlDisplay(accType,v)}</Td>
                  <Td className={v>0?'text-green-400':v<0?'text-red-400':''}>{v===null?'-':formatUnits(accType,v)}</Td>
                  <Td>{closed?'CLOSED':'OPEN'}</Td>
                  <Td>
                    <div style={{display:"flex",gap:"8px"}}>
                      <button className="btn" onClick={()=>onEdit(t)}>Edit</button>
                      <button className="btn" style={{borderColor:"#7f1d1d",color:"#fecaca"}} onClick={()=>onDelete(t.id)}>Delete</button>
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

/* ---------- Trade modal (compact fields + colored BUY/SELL) ---------- */
function TradeModal({ initial, onClose, onSave, onDelete, accType }) {
  const i = initial || {};
  const [symbol,setSymbol]=useState(i.symbol||SYMBOLS[0]);
  const [side,setSide]=useState(i.side||"BUY");
  const [date,setDate]=useState(i.date||todayISO());
  const [lotSize,setLotSize]=useState(i.lotSize??0.01);
  const [entry,setEntry]=useState(i.entry??"");
  const [exit,setExit]=useState(i.exit??"");
  const [tp1,setTp1]=useState(i.tp1??"");
  const [tp2,setTp2]=useState(i.tp2??"");
  const [sl,setSl]=useState(i.sl??"");
  const [strategy,setStrategy]=useState(i.strategy||STRATEGIES[0]);
  const [exitType,setExitType]=useState(i.exitType||"TP");

  const num=(v)=>v===""||v===undefined||v===null?undefined:parseFloat(v);
  const draft=useMemo(()=>({
    id:i.id,date,symbol,side,lotSize:parseFloat(lotSize||0),
    entry:num(entry),exit:num(exit),tp1:num(tp1),tp2:num(tp2),sl:num(sl),
    strategy,exitType
  }),[i.id,date,symbol,side,lotSize,entry,exit,tp1,tp2,sl,strategy,exitType]);

  const preview=useMemo(()=>{
    const v=computeDollarPnL(draft,accType);
    if(v===null||!isFinite(v)) return "-";
    return `${formatPnlDisplay(accType,v)} (${formatUnits(accType,v)})`;
  },[draft,accType]);

  return (
    <Modal title={i.id?"Edit Trade":"Add Trade"} onClose={onClose}>
      <div className="grid" style={{gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:"12px"}}>
        <div>
          <div className="text-sm text-slate-300">Symbol</div>
          <select className="input mt-1" value={symbol} onChange={e=>setSymbol(e.target.value)}>{SYMBOLS.map(s=><option key={s}>{s}</option>)}</select>
        </div>
        <div>
          <div className="text-sm text-slate-300">Action</div>
          <div style={{display:"flex",gap:"8px"}} className="mt-1">
            <button className={"btn "+(side==="BUY"?"buy":"")} onClick={()=>setSide("BUY")}>BUY</button>
            <button className={"btn "+(side==="SELL"?"sell":"")} onClick={()=>setSide("SELL")}>SELL</button>
          </div>
        </div>

        <div className="field-compact">
          <div className="text-sm text-slate-300">Date</div>
          <input className="input mt-1" type="date" value={date} onChange={e=>setDate(e.target.value)}/>
        </div>
        <div className="field-compact">
          <div className="text-sm text-slate-300">Lot size</div>
          <input className="input mt-1" type="number" step="0.01" value={lotSize} onChange={e=>setLotSize(e.target.value)}/>
        </div>

        <div>
          <div className="text-sm text-slate-300">Entry price</div>
          <input className="input mt-1" type="number" step="0.0001" value={entry} onChange={e=>setEntry(e.target.value)}/>
        </div>
        <div>
          <div className="text-sm text-slate-300">Exit Price</div>
          <input className="input mt-1" type="number" step="0.0001" value={exit} onChange={e=>setExit(e.target.value)} placeholder="Leave blank for OPEN"/>
        </div>

        <div>
          <div className="text-sm text-slate-300">TP 1</div>
          <input className="input mt-1" type="number" step="0.0001" value={tp1} onChange={e=>setTp1(e.target.value)}/>
        </div>
        <div>
          <div className="text-sm text-slate-300">TP 2</div>
          <input className="input mt-1" type="number" step="0.0001" value={tp2} onChange={e=>setTp2(e.target.value)}/>
        </div>

        <div>
          <div className="text-sm text-slate-300">Stop-Loss</div>
          <input className="input mt-1" type="number" step="0.0001" value={sl} onChange={e=>setSl(e.target.value)}/>
        </div>
        <div>
          <div className="text-sm text-slate-300">Strategy</div>
          <select className="input mt-1" value={strategy} onChange={e=>setStrategy(e.target.value)}>{STRATEGIES.map(s=><option key={s}>{s}</option>)}</select>
        </div>

        <div className="field-compact">
          <div className="text-sm text-slate-300">Exit Type</div>
          <select className="input mt-1" value={exitType} onChange={e=>setExitType(e.target.value)}>{EXIT_TYPES.map(s=><option key={s}>{s}</option>)}</select>
        </div>
      </div>

      <div style={{marginTop:"14px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div className="text-sm text-slate-300">P&L preview: <span className="font-semibold">{preview}</span></div>
        <div style={{display:"flex",gap:"8px"}}>
          {i.id && <button className="btn" style={{borderColor:"#7f1d1d",color:"#fecaca"}} onClick={()=>onDelete(i.id)}>Delete</button>}
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={()=>onSave(draft)}>Save</button>
        </div>
      </div>
    </Modal>
  );
}

/* ---------- Calendar modal (smaller tiles + profit/loss color) ---------- */
function CalendarModal({ onClose, trades, accType, view, setView, month, setMonth, year, setYear, selectedDate, setSelectedDate }) {
  const monthNames=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const dayNames=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const daysInMonth=(y,m)=>new Date(y,m+1,0).getDate();
  const firstDow=(y,m)=>new Date(y,m,1).getDay();

  const tradesByDate = useMemo(()=>{
    const m={}; for(const t of trades){ (m[t.date]=m[t.date]||[]).push(t); } return m;
  },[trades]);

  const dayClass = (iso)=>{
    const items = tradesByDate[iso]||[];
    const sum = items.reduce((a,b)=> {
      const v = computeDollarPnL(b, accType);
      return a + (isFinite(v)? v : 0);
    }, 0);
    return sum>0 ? "profit" : sum<0 ? "loss" : "";
  };

  return (
    <Modal title="Calendar" onClose={onClose}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"10px"}}>
        <div style={{display:"flex",gap:"8px"}}>
          {["year","month","day"].map(v=>(
            <button key={v} className={"btn "+(view===v?"btn-primary":"")} onClick={()=>setView(v)}>{v.toUpperCase()}</button>
          ))}
        </div>
        {view!=="day" && (
          <div style={{display:"flex",gap:"8px",alignItems:"center"}}>
            <button className="btn" onClick={()=> view==="month" ? (setMonth(m=>(m+11)%12), setYear(year-(month===0?1:0))) : setYear(y=>y-1)}>◀</button>
            <div className="text-sm">{view==="month" ? `${monthNames[month]} ${year}` : year}</div>
            <button className="btn" onClick={()=> view==="month" ? (setMonth(m=>(m+1)%12), setYear(year+(month===11?1:0))) : setYear(y=>y+1)}>▶</button>
          </div>
        )}
      </div>

      {view==="year" && (
        <div className="calendar-grid-year">
          {monthNames.map((mn,i)=>(
            <div key={mn} className="calendar-box">
              <div className="font-semibold mb-1">{mn}</div>
              <div className="text-slate-400 text-sm">Trades: {trades.filter(t=>new Date(t.date).getMonth()===i && new Date(t.date).getFullYear()===year).length}</div>
              <button className="btn" style={{marginTop:"8px"}} onClick={()=>{setMonth(i);setView("month");}}>Open</button>
            </div>
          ))}
        </div>
      )}

      {view==="month" && (
        <div>
          <div className="grid" style={{gridTemplateColumns:"repeat(7,1fr)",gap:"6px",marginBottom:"4px",textAlign:"center",color:"#9aa7bf",fontSize:"12px"}}>
            {dayNames.map(d=><div key={d} className="py-1">{d}</div>)}
          </div>
          <div className="calendar-grid-month">
            {Array.from({length:firstDow(year,month)}).map((_,i)=><div key={"e"+i}/>)}
            {Array.from({length:daysInMonth(year,month)}).map((_,d)=>{
              const day=String(d+1).padStart(2,"0");
              const iso=`${year}-${String(month+1).padStart(2,"0")}-${day}`;
              const items=tradesByDate[iso]||[];
              return (
                <button key={iso} className={"daycell "+dayClass(iso)} onClick={()=>{setSelectedDate(iso);setView("day");}}>
                  <div className="daynum">{d+1}</div>
                  {items.slice(0,2).map(it=><div key={it.id} className="truncate" style={{fontSize:"11px"}}>{it.symbol} {it.side}</div>)}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {view==="day" && (
        <div>
          <div className="text-sm text-slate-300 mb-2">{selectedDate}</div>
          {(tradesByDate[selectedDate]||[]).length===0
            ? <div className="text-slate-400 text-sm">No trades this day.</div>
            : <div className="grid" style={{gap:"8px"}}>
                {(tradesByDate[selectedDate]||[]).map(t=>(
                  <div key={t.id} className="card" style={{padding:"10px"}}>
                    <div className="text-sm"><span className="text-blue-300 font-medium">{t.symbol}</span> · {t.side} · Lot {t.lotSize}</div>
                    <div className="text-sm">{typeof t.entry==='number'?fmt$(t.entry):''} → {typeof t.exit==='number'?fmt$(t.exit):''}</div>
                  </div>
                ))}
              </div>}
        </div>
      )}
    </Modal>
  );
}

/* ---------- App ---------- */
function usePersistedState(email){
  const [state,setState]=useState(()=> {
    const s=loadState(email||getCurrent());
    return s || {name:"",email:email||"",accType:ACC_TYPES[1],capital:0,depositDate:todayISO(),trades:[]};
  });
  useEffect(()=>{ if(state?.email) saveState(state.email,state); },[state]);
  return [state,setState];
}

function App(){
  const [current,setCurrent]=useState(getCurrent());
  const [users,setUsers]=useState(loadUsers());
  const [state,setState]=usePersistedState(current);
  const [page,setPage]=useState("dashboard");
  const [sidebarHidden,setSidebarHidden]=useState(false);

  const [showTrade,setShowTrade]=useState(false);
  const [editing,setEditing]=useState(null);
  const [showCal,setShowCal]=useState(false);
  const [calView,setCalView]=useState("month");
  const now=new Date(); const [calMonth,setCalMonth]=useState(now.getMonth()); const [calYear,setCalYear]=useState(now.getFullYear()); const [calSel,setCalSel]=useState(todayISO());

  const [showForgot,setShowForgot]=useState(false);
  const [forgotEmail,setForgotEmail]=useState("");

  /* Google Sign-In init (kept working) */
  const initGoogle = ()=>{
    if(!window.google || !google.accounts?.id) return;
    google.accounts.id.initialize({
      client_id: CLIENT_ID,
      callback: (resp)=>{
        try{
          const payload = decodeJwt(resp.credential||"");
          const email = (payload.email||"").toLowerCase();
          if(!email) return;
          // ensure user exists
          let list = loadUsers();
          if(!list.some(u=>u.email.toLowerCase()===email)){
            list.push({name:payload.name||"",email,password:""});
            saveUsers(list);
          }
          saveCurrent(email); setCurrent(email);
          const s = loadState(email) || {name:payload.name||"",email,accType:ACC_TYPES[1],capital:0,depositDate:todayISO(),trades:[]};
          saveState(email,s);
        }catch{}
      }
    });
    const el = document.getElementById("googleBtn");
    if(el){
      google.accounts.id.renderButton(el,{theme:"filled_black",size:"large"});
      google.accounts.id.prompt();
    }
  };

  const onExport = ()=>{
    // P&L + CSV in your template order
    const HEADERS=["date","symbol","side","lotSize","entry","exit","tp1","tp2","sl","strategy","exitType","pnl_dollars","pnl_units"];
    const esc=(v)=>v==null?"":(/[\",\n]/.test(String(v))?`"${String(v).replace(/"/g,'""')}"`:v);
    const rows = state.trades.map(t=>{
      const d = computeDollarPnL(t,state.accType); 
      return {
        date:t.date,symbol:t.symbol,side:t.side,lotSize:t.lotSize,entry:t.entry??"",exit:t.exit??"",
        tp1:t.tp1??"",tp2:t.tp2??"",sl:t.sl??"",strategy:t.strategy,exitType:t.exitType??"",
        pnl_dollars: d==null?"":r2(d), pnl_units: d==null?"":formatUnits(state.accType,d)
      };
    });
    const NL="\r\n"; const BOM="﻿"; 
    const out=[HEADERS.map(esc).join(",")].concat(rows.map(r=>HEADERS.map(h=>esc(r[h])).join(","))).join(NL);
    const blob=new Blob([BOM+out],{type:"text/csv;charset=utf-8;"}); const url=URL.createObjectURL(blob);
    const a=document.createElement("a"); a.href=url; a.download="nitty_gritty_trades.csv"; a.click(); URL.revokeObjectURL(url);
  };

  const logout=()=>{saveCurrent("");setCurrent("");};

  const login=(email,pw,setErr)=>{
    const u=users.find(x=>x.email.toLowerCase()===email.toLowerCase());
    if(!u) return setErr("No such user. Please sign up.");
    if(u.password!==pw) return setErr("Wrong password.");
    saveCurrent(u.email); setCurrent(u.email);
  };
  const signup=(name,email,pw,setErr)=>{
    if(users.some(x=>x.email.toLowerCase()===email.toLowerCase())) return setErr("Email already registered.");
    const u={name,email,password:pw}; const nu=[...users,u]; setUsers(nu); saveUsers(nu);
    const fresh={name,email,accType:ACC_TYPES[1],capital:0,depositDate:todayISO(),trades:[]}; saveState(email,fresh);
    saveCurrent(email); setCurrent(email);
  };

  const addOrUpdate=(draft)=>{
    const id=draft.id||Math.random().toString(36).slice(2);
    const arr=state.trades.slice(); const idx=arr.findIndex(t=>t.id===id);
    const rec={...draft,id}; if(idx>=0) arr[idx]=rec; else arr.unshift(rec);
    setState({...state,trades:arr}); setShowTrade(false); setEditing(null);
  };
  const delTrade=(id)=>setState({...state,trades:state.trades.filter(t=>t.id!==id)});

  // Capital shown = base capital + realized P&L since deposit date
  const realizedForCapital = state.trades
    .filter(t=>new Date(t.date)>=new Date(state.depositDate) && t.exitType)
    .map(t=>computeDollarPnL(t,state.accType)).filter(v=>v!=null && isFinite(v)).reduce((a,b)=>a+b,0);
  const effectiveCapital = state.capital + realizedForCapital;
  const openTrades = state.trades.filter(t=>!t.exitType && (t.exit==null)).length;

  if(!current){
    return <LoginView onLogin={login} onSignup={signup} onForgot={(em)=>{setForgotEmail(em||"");setShowForgot(true);}} initGoogle={initGoogle} />;
  }

  return (
    <>
      <TopBar
        onToggle={()=>setSidebarHidden(v=>!v)}
        showBadge={true}
        onExport={onExport}
        onLogout={logout}
      />
      <div className="layout">
        <div className={"sidebar "+(sidebarHidden?"hidden":"")}>
          <div className="card" style={{padding:"12px"}}>
            <div className="text-sm text-slate-300">Account Type</div>
            <div className="font-semibold mb-2">{state.accType}</div>
            <div className="text-sm text-slate-300">Capital</div>
            <div className="text-2xl font-bold mb-1">{state.accType==='Cent Account'?`${r2(effectiveCapital*100).toFixed(2)} ¢`:fmt$(effectiveCapital)}</div>
            <div className="text-xs text-slate-400">Deposit: {state.depositDate}</div>
            <div className="mt-3 text-sm text-slate-300">Open trades</div>
            <div className="text-lg font-semibold">{openTrades}</div>
            <div className="pt-2"><button className="btn" onClick={()=>setShowTrade(true)}>Add trade</button></div>
          </div>

          <div className="card" style={{padding:"12px"}}>
            <button className={"btn "+(page==="dashboard"?"btn-primary":"")} onClick={()=>setPage("dashboard")} style={{width:"100%",display:"flex",alignItems:"center",gap:"8px"}}><IconHome/>Dashboard</button>
            <div style={{height:"8px"}}/>
            <button className={"btn "+(page==="histories"?"btn-primary":"")} onClick={()=>setPage("histories")} style={{width:"100%",display:"flex",alignItems:"center",gap:"8px"}}><IconHist/>Histories</button>
            <div style={{height:"8px"}}/>
            <button className="btn" onClick={()=>{setShowCal(true);setCalView("month");}} style={{width:"100%",display:"flex",alignItems:"center",gap:"8px"}}><IconCal/>Calendar</button>
            <div style={{height:"8px"}}/>
            <button className={"btn "+(page==="settings"?"btn-primary":"")} onClick={()=>setPage("settings")} style={{width:"100%",display:"flex",alignItems:"center",gap:"8px"}}><IconGear/>Settings</button>
          </div>
        </div>

        <div className="main">
          {page==="dashboard" && (
            <div className="grid" style={{gap:"12px"}}>
              <div className="text-sm font-semibold">General statistics</div>
              <GeneralStats trades={state.trades} accType={state.accType} capital={state.capital} depositDate={state.depositDate}/>
              <DetailedStats trades={state.trades} accType={state.accType}/>
            </div>
          )}

          {page==="histories" && (
            <Histories trades={state.trades} accType={state.accType} onEdit={(t)=>{setEditing(t);setShowTrade(true);}} onDelete={delTrade}/>
          )}

          {page==="settings" && (
            <div className="card">
              <div className="text-sm font-semibold mb-3">Settings</div>
              <div className="grid" style={{gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:"12px"}}>
                <div>
                  <div className="text-sm text-slate-300">Name</div>
                  <input className="input mt-1" value={state.name} onChange={e=>setState({...state,name:e.target.value})}/>
                </div>
                <div>
                  <div className="text-sm text-slate-300">Acc Type</div>
                  <select className="input mt-1" value={state.accType} onChange={e=>setState({...state,accType:e.target.value})}>{ACC_TYPES.map(s=><option key={s}>{s}</option>)}</select>
                </div>
                <div>
                  <div className="text-sm text-slate-300">Account Capital ($)</div>
                  <input className="input mt-1" type="number" value={state.capital} onChange={e=>setState({...state,capital:parseFloat(e.target.value||"0")})}/>
                </div>
                <div className="field-compact">
                  <div className="text-sm text-slate-300">Capital Deposit Date</div>
                  <input className="input mt-1" type="date" value={state.depositDate} onChange={e=>setState({...state,depositDate:e.target.value})}/>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showTrade && (
        <TradeModal
          initial={editing}
          onClose={()=>{setShowTrade(false);setEditing(null);}}
          onSave={addOrUpdate}
          onDelete={delTrade}
          accType={state.accType}
        />
      )}

      {showCal && (
        <CalendarModal
          onClose={()=>setShowCal(false)} trades={state.trades}
          accType={state.accType}
          view={calView} setView={setCalView}
          month={calMonth} setMonth={setCalMonth}
          year={calYear} setYear={setCalYear}
          selectedDate={calSel} setSelectedDate={setCalSel}
        />
      )}

      {showForgot && (
        <ForgotPasswordModal email={forgotEmail||state.email} onClose={()=>setShowForgot(false)} firstName={state.name||"User"} />
      )}
    </>
  );
}

/* ---------- mount ---------- */
ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
