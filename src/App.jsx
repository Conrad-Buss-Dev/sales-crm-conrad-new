import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import {
  LayoutGrid, List as ListIcon, BarChart3, Search, Phone, ExternalLink,
  X, ChevronDown, Mail, Globe, MessageCircle, Clock, Calendar,
  Briefcase, DollarSign, TrendingUp, CheckCircle2, Trash2, AlertCircle,
  Edit2, Check, Plus, User
} from "lucide-react";

// ─── STATUS + PRIORITY CONFIG ─────────────────────────────────────────────────
const STATUSES = [
  { key: "binned leads",               label: "Binned Leads",       color: "#8a8f99", order: 0 },
  { key: "leads to call",              label: "Leads to Call",      color: "#6647f0", order: 1 },
  { key: "awaiting discovery",         label: "Awaiting Discovery", color: "#3e63dd", order: 2 },
  { key: "discovery meeting",          label: "Discovery Meeting",  color: "#0091ff", order: 3 },
  { key: "vaibility audit",            label: "Viability Audit",    color: "#12a594", order: 4 },
  { key: "proposals",                  label: "Proposals",          color: "#30a46c", order: 5 },
  { key: "quotation",                  label: "Quotation",          color: "#ffc53d", order: 6 },
  { key: "awating close meeting",      label: "Awaiting Close Mtg", color: "#f76808", order: 7 },
  { key: "closing meeting",            label: "Closing Meeting",    color: "#f76808", order: 8 },
  { key: "package selection - presla", label: "Package Selection",  color: "#e5484d", order: 9 },
  { key: "awaiting payment",           label: "Awaiting Payment",   color: "#ab4aba", order: 10 },
  { key: "awaiting signature",         label: "Awaiting Signature", color: "#ab4aba", order: 11 },
  { key: "appoint team",               label: "Appoint Team",       color: "#a18072", order: 12 },
  { key: "internal alignment",         label: "Internal Alignment", color: "#8d8d8d", order: 13 },
  { key: "handover meeting (kpi's)",   label: "Handover (KPIs)",    color: "#8d8d8d", order: 14 },
  { key: "done",                       label: "Won ✓",              color: "#008844", order: 15 },
];
const STATUS_MAP = Object.fromEntries(STATUSES.map(s => [s.key, s]));
const statusOf = k => STATUS_MAP[k] || STATUSES[0];
const PIPELINE_STAGES = STATUSES.filter(s => !["binned leads", "leads to call", "done"].includes(s.key));

const PRIORITIES = [
  { key: "urgent", label: "Urgent", color: "#f50000" },
  { key: "high",   label: "High",   color: "#f8ae00" },
  { key: "normal", label: "Normal", color: "#6fddff" },
  { key: "low",    label: "Low",    color: "#a0a5b0" },
];
const PRI_MAP = Object.fromEntries(PRIORITIES.map(p => [p.key, p]));

const BUDGET_OPTIONS = [
  "< R5 000 pm", "R5 000 – R9 999 pm", "R10 000 – R14 999 pm",
  "R15 000 – R24 999 pm", "R25 000 – R34 999 pm",
  "R35 000 – R44 999 pm", "R45 000+",
];

const NEED_OPTIONS = [
  "More Customer Leads", "More Online Sales", "Stronger Online Brand Presence",
  "Meta Ads + Google Ads", "Meta Ads (Brand Awareness)", "Google Ads and Social Media",
  "SM Management and G-Ads", "Potential Free Audit",
];

const TEAM = ["Conrad", "Tarquin"];
const AVATAR_COLORS = { Conrad: "#4338ca", Tarquin: "#b45309" };
const CU_URL = id => `https://app.clickup.com/t/${id}`;

// ─── SEED DATA (from ClickUp) ─────────────────────────────────────────────────
const SEED = [
  { id:"869dukbuh", name:"Jan - Burly Steel", status:"vaibility audit", priority:"urgent", due:1782784800000, assignees:["Conrad","Tarquin"], tags:["2.0","meta"], phone:"+27825604103", whatsapp:"https://wa.me/27825604103", email:"jan@burlysteel.co.za", website:"burlysteel.co.za", budget:"R10 000 – R14 999 pm", need:"More Customer Leads", pastMarketing:"No", yearsInBusiness:"5 years", description:"Giving more space in workshops - selling product Mezzanine Flooring.\nB2B (he has been doing door to door)\n\nBasic landing page (CTA and form)\nAds also, maybe Google\n\n3mil - 4mil per annum" },
  { id:"869dwqu9u", name:"Christophe - Ketty", status:"vaibility audit", priority:"normal", due:1782784800000, assignees:["Conrad","Tarquin"], tags:["2.0","meta"], phone:"+27836878926", whatsapp:"https://wa.me/27836878926", email:"croelofse@yahoo.com", website:"www.ketty.co.za", budget:"R10 000 – R14 999 pm", need:"More Online Sales", pastMarketing:"Nee", yearsInBusiness:"2 jaar", description:"Put funny things in the subject line.\nBrand look like Woolworths.\n\nThey actually sell the rubber band.\n\nSelling nostalgia, 35–55 age (40–60 age)\n\nSmarter\nR90k but R200k\n\nPopularising, Heritage (Education) & needs to distinguish from the uneducated.\nFunnel - Psychology and Practicality.\n\nHe knows what he wants. He wants suggestions.\n\nSelling nostalgia and happiness." },
  { id:"869dv88kb", name:"CW Pieterse - Body20", status:"quotation", priority:"urgent", due:1782871200000, assignees:["Conrad"], tags:["2.0","meta"], phone:"+27784607545", whatsapp:"https://wa.me/27784607545", email:"cwhpieterse@gmail.com", website:"www.body20.co.za", budget:"< R5 000 pm", need:"More Customer Leads", pastMarketing:"Yes, low ROI", yearsInBusiness:"11 years", description:"" },
  { id:"869dy50d7", name:"Stephan - Hello Foods (Web Design)", status:"quotation", priority:"urgent", due:1782871200000, assignees:["Conrad"], tags:["2.0"], phone:"+27716827564", whatsapp:null, email:null, website:null, budget:null, need:null, pastMarketing:null, yearsInBusiness:null, description:"" },
  { id:"869d3zddy", name:"Stephan - Genwest (site redev)", status:"quotation", priority:"low", due:1783044000000, assignees:["Conrad"], tags:["2.0"], phone:null, whatsapp:null, email:null, website:null, budget:null, need:null, pastMarketing:null, yearsInBusiness:null, description:"Website Redev\nQuote paid\n\nInspo: landrover.co.za, fabworks.com\n\nEnd of May site redev done, June to start with ads" },
  { id:"869dgy1n7", name:"Ludi - iWorkTops", status:"discovery meeting", priority:"urgent", due:1782871200000, assignees:["Conrad"], tags:["meta"], phone:"+27797474096", whatsapp:"https://wa.me/27797474096", email:"Ludi@iworktops.co.za", website:"www.iworktops.co.za", budget:"R10 000 – R14 999 pm", need:"More Customer Leads", pastMarketing:"Yes", yearsInBusiness:"6 years", description:"He is working more with B2B kitchen companies etc.\n\nAre there clientele and search volumes (are they buyers or not).\n\nBased near Lanseria (Pretoria, Centurion opposed to the East Rand, anything around N14 Highway is his area / Fourway)." },
  { id:"869dt9mfx", name:"Tanya - Thabong Wedd Venue", status:"discovery meeting", priority:"high", due:1783303200000, assignees:["Conrad"], tags:["2.0"], phone:"+27826537840", whatsapp:"https://wa.me/+27826537840", email:"info@thabongweddingvenue.co.za", website:"www.thabongweddingvenue.co.za", budget:"R10 000 – R14 999 pm", need:"More Customer Leads", pastMarketing:"No", yearsInBusiness:"25 years", description:"Thabong Wedding – Hive Digital\nTuesday, 23 June · 10:00–10:45am\nMeet: https://meet.google.com/fct-ophe-ytb" },
  { id:"869duca63", name:"Daniela – Entice Health Products", status:"discovery meeting", priority:"high", due:1783411200000, assignees:["Conrad"], tags:["2.0"], phone:"+27836292634", whatsapp:"https://wa.me/+27836292634", email:"info@enticerice.com", website:"https://www.daisyhealth.co.za/", budget:null, need:"Meta Ads + Google Ads", pastMarketing:null, yearsInBusiness:null, description:"Category: Food & Beverage\nFit Rating: STRONG FIT (35/40)\nService Recommended: Meta Ads + Google Ads\nLocation: Roodepoort, JHB\n\nNotes: Manufactures gluten-free foods for the SA market. VM received — call back scheduled. Priority: ⭐ TOP PRIORITY — Schedule call ASAP" },
  { id:"869dkdcun", name:"Greg - SafariStays", status:"discovery meeting", priority:"high", due:1783044000000, assignees:["Conrad","Tarquin"], tags:["meta","viability-audit-done"], phone:"+27797951003", whatsapp:"https://wa.me/27797951003", email:"greg@safaristays.com", website:"www.safaristays.com", budget:"R25 000 – R34 999 pm", need:"More Online Sales", pastMarketing:"No", yearsInBusiness:"3 Months", description:"" },
  { id:"869df0541", name:"Linda - EXP Realty", status:"discovery meeting", priority:"normal", due:1783044000000, assignees:["Conrad"], tags:["meta"], phone:"+27636097251", whatsapp:"https://wa.me/27636097251", email:"linda.dupreez@expsouthafrica.co.za", website:"EXP Realty SA", budget:"< R5 000 pm", need:"More Customer Leads", pastMarketing:"No", yearsInBusiness:"3 years", description:"" },
  { id:"869db4ntz", name:"Grant - Appointment Firm", status:"awaiting discovery", priority:"low", due:1782871200000, assignees:["Conrad"], tags:["meta"], phone:"+27823129047", whatsapp:"https://wa.me/+27823129047", email:"grant@launchyourbrand.co.za", website:"appointmentfirm.co.za", budget:"R10 000 – R14 999 pm", need:"More Customer Leads", pastMarketing:"No", yearsInBusiness:"21 years", description:"" },
  { id:"869cvm3nx", name:"Monique - Soleaskin", status:"awaiting discovery", priority:"low", due:1785759600000, assignees:["Conrad"], tags:["2.0"], phone:"0823950718", whatsapp:"https://wa.me/+270823950718", email:"Info@soleaskin.co.za", website:"www.soleaskin.co.za", budget:"< R5 000 pm", need:"Stronger Online Brand Presence", pastMarketing:"No", yearsInBusiness:"Registered Jun 2025, selling Mar 2026", description:"Lead Snapshot: Solea Skin – newly registered skin/beauty brand.\n\nViability Scores:\n• Overall: 6.5/10 • Google: 5.5/10 • Meta: 8/10 • LinkedIn: 1/10\n\nBest Sales Angle: Sell visual brand growth, audience building and eventual sales support rather than hard lead generation.\n\nRecommendation: Meta first. Google only later if there is clear product search intent.\n\nFinal Verdict: Promising as a Meta-first beauty brand, but needs clear positioning, creative strength and offer clarity." },
  { id:"869dy3fum", name:"Theuns - iCar Cape Town", status:"awaiting discovery", priority:"urgent", due:1782871200000, assignees:["Conrad"], tags:["2.0"], phone:"+27727695620", whatsapp:"https://wa.me/+27727695620", email:"theuns@scgroup.co.za", website:"icarcapetown.co.za", budget:"R45 000+", need:"More Customer Leads", pastMarketing:"Yes. Lots of leads. Just not quality leads.", yearsInBusiness:"1 year", description:"" },
  { id:"869dhpqf6", name:"Matthew - Onni", status:"awaiting discovery", priority:"low", due:1794967200000, assignees:["Conrad"], tags:["2.0","meta"], phone:"+27786761514", whatsapp:"https://wa.me/27786761514", email:"Matthew@onni.co.za", website:"www.onni.co.za", budget:"R15 000 – R24 999 pm", need:"More Online Sales", pastMarketing:"Yes", yearsInBusiness:"3 years", description:"" },
  { id:"869dw70x2", name:"Kuda – Feso Hair Africa", status:"awaiting discovery", priority:"normal", due:null, assignees:[], tags:[], phone:"0780188036", whatsapp:null, email:"kmupawose@gmail.com", website:"https://fesoafrica.co.za/", budget:null, need:"Meta Ads (Brand Awareness)", pastMarketing:null, yearsInBusiness:null, description:"Category: Health, Beauty & Wellness\nFit Rating: GOOD FIT (33/40)\nService Recommended: Meta Ads (Brand Awareness)\nLocation: Gauteng (GP)\n\nNotes: Call back mid March. 25/05 – send her an email at kmupawose@gmail.com" },
  { id:"869dudh79", name:"Derek – Pecanhealth Natural Products", status:"awaiting discovery", priority:"normal", due:1797904800000, assignees:[], tags:[], phone:"082 601 4063", whatsapp:null, email:"derek@pecanhealth.co.za", website:"https://www.pecanhealth.co.za/", budget:null, need:"Meta Ads + Google Ads", pastMarketing:null, yearsInBusiness:null, description:"Category: Health, Beauty & Wellness\nFit Rating: STRONG FIT (36/40)\nService: Meta Ads + Google Ads\nLocation: Gauteng\n\nConrad's Notes (22/06): Give him a call in 4–6 months, just to see the direction the company's going.\n\nAdditional: Called previously. Call again in 1 month noted 30/05." },
  { id:"869dudh11", name:"Bradley Wagemaker – Lamelle Pharma", status:"awaiting discovery", priority:"high", due:1783303200000, assignees:[], tags:[], phone:"083 625 8352", whatsapp:null, email:null, website:"https://www.lamelle.co.za/", budget:null, need:"Google Ads and Social Media", pastMarketing:null, yearsInBusiness:null, description:"Category: Health, Beauty & Wellness\nFit Rating: STRONG FIT (36/40)\nService: Meta Ads + Google Ads\nLocation: Gauteng\n\nConrad's Notes (22/06): Got the number for Bradley — there was a death in the family. Will reach out via WhatsApp tomorrow. Phone him in a week or 2.\n\nAdditional: Dayne says if no response by now, leave it." },
  { id:"869dkdj87", name:"Philip - aaaLockSmiths", status:"awating close meeting", priority:"urgent", due:1782871200000, assignees:["Conrad"], tags:["2.0","meta","viability-audit-done"], phone:"+27836500555", whatsapp:"https://wa.me/27836500555", email:"phildp888@gmail.com", website:"aaalocksmiths.co.za", budget:"R35 000 – R44 999 pm", need:"More Customer Leads", pastMarketing:"Yes, more than once – not delivering on promises", yearsInBusiness:"26 years", description:"" },
  { id:"869dpdhu4", name:"Mark - Taxi Part Centre", status:"awating close meeting", priority:"urgent", due:1782871200000, assignees:["Conrad"], tags:["2.0","meta","viability pending"], phone:"+27824432062", whatsapp:"https://wa.me/27824432062", email:"mark@caparts.co.za", website:"www.taxipartcentre.co.za", budget:"R45 000+", need:"More Online Sales", pastMarketing:"Yes years ago", yearsInBusiness:"40 years", description:"taxipart centre is the focus – TPC is a large scrap yard\n\nServices:\n1. Specialising in second hand parts, vehicle come in for stripping\n2. Rebuilt section selling rebuilt vehicles (pushes through biggest sales)\n3. New Parts Sales division\n\nTaxi bosses and associations, Fleet and staff transport\n\nSelling 15–20 re-builts, range from R200k and up.\nR5k budget on Google currently\n\nNeo: 0692944472" },
  { id:"869d6wa40", name:"Bokkie - Rusty Gate", status:"package selection - presla", priority:"normal", due:1782957600000, assignees:["Conrad"], tags:["2.0"], phone:null, whatsapp:null, email:null, website:null, budget:null, need:null, pastMarketing:null, yearsInBusiness:null, description:"" },
  { id:"869c62g0f", name:"Matthew - DAR", status:"package selection - presla", priority:"low", due:1784080800000, assignees:["Conrad"], tags:["2.0"], phone:"+27414538560", whatsapp:null, email:null, website:null, budget:null, need:null, pastMarketing:null, yearsInBusiness:null, description:"" },
  { id:"869d7cc0n", name:"Monique - OneSolar", status:"package selection - presla", priority:"low", due:1783476000000, assignees:["Conrad"], tags:["2.0"], phone:"+27827776351", whatsapp:"https://wa.me/+27827776351", email:null, website:"https://www.onesolar.co.za/", budget:null, need:"SM Management and G-Ads", pastMarketing:"No, but have been burnt by Agencies", yearsInBusiness:"16 years", description:"" },
  { id:"869c1nr4e", name:"Peter - Specs Direct", status:"proposals", priority:"low", due:1785808800000, assignees:["Conrad"], tags:["2.0"], phone:"+27828770918", whatsapp:null, email:"petesol@mweb.co.za", website:"www.specsdirect.co.za", budget:"R15 000 – R24 999 pm", need:"Potential Free Audit", pastMarketing:null, yearsInBusiness:null, description:"" },
  { id:"869bv9uyw", name:"Mahaveer Chavda - Chavda (ECommerce)", status:"done", priority:null, due:1770714000000, assignees:["Conrad"], tags:[], phone:"+27832251133", whatsapp:null, email:"mchavda@chavda.com", website:"http://www.chavda.com", budget:"R45 000+", need:"Online Sales", pastMarketing:"Yes", yearsInBusiness:"26 years", description:"Lead form submitted 13 January 2026. Sells physical products. Open to case study/testimonial." },
  ...["Ettiene - Badger Brands","Martin Brits","Brad - M&H Freight","Azwindini Mulaudzi","Byron - Outrageous Fishing","lyborn","Johannes Le Roux – The Duchess Gin","Maritz / Chris-Mari - Mathimagical","Francois Bloemhof","Angelique Cronje","Brian Sibbs","Tebogo - Onke Solutions","Trevond Woodroffe","Timothy Gavin Erasmus","Zuko","Quintin","Madelein Du Plooy","Brian Chiwayo","Lyle Eagleson","Stiven Hlavathi Mdaka","Takudzwa Irvine","Okasha Abdulkader","Ettienne","Lance Connolly","Colette - Finmap"].map((name,i) => ({ id:`binned_${i}`, name, status:"binned leads", priority:null, due:null, assignees:["Conrad"], tags:[], phone:null, whatsapp:null, email:null, website:null, budget:null, need:null, pastMarketing:null, yearsInBusiness:null, description:"" })),
];

// ─── UTILITIES ────────────────────────────────────────────────────────────────
const fmtDate = ts => ts ? new Date(ts).toLocaleDateString("en-ZA",{day:"numeric",month:"short",year:"numeric"}) : null;
const toDateInput = ts => ts ? new Date(ts).toISOString().slice(0,10) : "";
const fromDateInput = s => s ? new Date(s).getTime() : null;
const isOverdue = ts => ts && ts < Date.now();
const newId = () => "new_" + Math.random().toString(36).slice(2,9);

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [tasks, setTasks] = useState(SEED);
  const [view, setView] = useState("list");
  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [dragId, setDragId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("active");

  const selectedTask = useMemo(() => tasks.find(t => t.id === selectedId), [tasks, selectedId]);

  const filtered = useMemo(() => {
    let list = tasks;
    if (statusFilter === "active") list = list.filter(t => !["binned leads","done"].includes(t.status));
    else if (statusFilter === "binned") list = list.filter(t => t.status === "binned leads");
    else if (statusFilter === "done") list = list.filter(t => t.status === "done");
    if (q) {
      const query = q.toLowerCase();
      list = list.filter(t =>
        t.name.toLowerCase().includes(query) ||
        (t.email||"").toLowerCase().includes(query) ||
        (t.phone||"").includes(q) ||
        (t.need||"").toLowerCase().includes(query)
      );
    }
    return list;
  }, [tasks, q, statusFilter]);

  const updateTask = useCallback((id, patch) => {
    setTasks(ts => ts.map(t => t.id === id ? {...t, ...patch} : t));
  }, []);

  const addTask = () => {
    const t = {
      id: newId(), name: "New Lead", status: "awaiting discovery", priority: "normal",
      due: null, assignees: ["Conrad"], tags: [],
      phone: null, whatsapp: null, email: null, website: null,
      budget: null, need: null, pastMarketing: null, yearsInBusiness: null, description: "",
    };
    setTasks(ts => [t, ...ts]);
    setSelectedId(t.id);
  };

  const deleteTask = id => {
    setTasks(ts => ts.filter(t => t.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const stats = useMemo(() => {
    const active = tasks.filter(t => !["binned leads","done"].includes(t.status));
    const won = tasks.filter(t => t.status === "done").length;
    const binned = tasks.filter(t => t.status === "binned leads").length;
    return { total: tasks.length, active: active.length, won, binned,
      winRate: (won + binned) ? Math.round(won / (won + binned) * 100) : 0 };
  }, [tasks]);

  const byStatus = useMemo(() => {
    const m = {};
    STATUSES.forEach(s => m[s.key] = []);
    filtered.forEach(t => { (m[t.status] ||= []).push(t); });
    return m;
  }, [filtered]);

  return (
    <div style={S.root}>
      <style>{CSS}</style>

      {/* TOP BAR */}
      <div style={S.topbar}>
        <div style={S.topbarLeft}>
          <div style={S.logo}>C</div>
          <div>
            <div style={S.appName}>Sales CRM (Conrad)</div>
            <div style={S.appSub}>{stats.active} active · {stats.total} total</div>
          </div>
        </div>
        <div style={S.topbarRight}>
          <div style={S.viewTabs}>
            {[["list","List",ListIcon],["board","Board",LayoutGrid],["dashboard","Dashboard",BarChart3]].map(([k,l,I]) => (
              <button key={k} className={`vtab${view===k?" vtab-on":""}`} onClick={() => setView(k)}>
                <I size={14}/>{l}
              </button>
            ))}
          </div>
          <button className="add-btn" onClick={addTask}>
            <Plus size={14}/> New Lead
          </button>
        </div>
      </div>

      {/* TOOLBAR */}
      <div style={S.toolbar}>
        <div style={S.searchBox}>
          <Search size={14} color="#9096a2"/>
          <input style={S.searchInput} placeholder="Search name, email, phone, need…" value={q}
            onChange={e => setQ(e.target.value)}/>
          {q && <X size={14} color="#9096a2" style={{cursor:"pointer"}} onClick={() => setQ("")}/>}
        </div>
        <div style={S.filterGroup}>
          {[["active","Active pipeline"],["all","All"],["binned","Binned"],["done","Won"]].map(([k,l]) => (
            <button key={k} className={`chip${statusFilter===k?" chip-on":""}`} onClick={() => setStatusFilter(k)}>{l}</button>
          ))}
        </div>
        <div style={S.counter}>{filtered.length} leads</div>
      </div>

      {/* MAIN */}
      <div style={S.main}>
        {view === "list" && <ListView byStatus={byStatus} onOpen={setSelectedId} onUpdate={updateTask}/>}
        {view === "board" && <BoardView byStatus={byStatus} onOpen={setSelectedId} dragId={dragId} setDragId={setDragId} onUpdate={updateTask} statusFilter={statusFilter}/>}
        {view === "dashboard" && <DashboardView stats={stats} tasks={filtered} byStatus={byStatus} onOpen={setSelectedId}/>}
      </div>

      {/* DRAWER */}
      {selectedTask && (
        <TaskDrawer task={selectedTask} onClose={() => setSelectedId(null)} onUpdate={updateTask} onDelete={deleteTask}/>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LIST VIEW
// ═══════════════════════════════════════════════════════════════════════════════
function ListView({ byStatus, onOpen, onUpdate }) {
  const groups = STATUSES.filter(s => (byStatus[s.key]||[]).length > 0);
  return (
    <div style={{display:"flex",flexDirection:"column",gap:24}}>
      {groups.map(s => (
        <div key={s.key}>
          <div style={S.groupHead}>
            <span style={{...S.stagePill, background: s.color}}/>
            <span style={S.groupTitle}>{s.label}</span>
            <span style={S.groupBadge}>{byStatus[s.key].length}</span>
          </div>
          <div style={S.listTable}>
            <div style={S.listHeader}>
              <span style={{flex:1}}>Name</span>
              <span style={S.col140}>Status</span>
              <span style={S.col110}>Due</span>
              <span style={S.col90}>Priority</span>
              <span style={S.col140}>Budget</span>
              <span style={S.col150}>Phone</span>
              <span style={S.col80}>Assignee</span>
              <span style={S.col40}></span>
            </div>
            {byStatus[s.key].map(t => (
              <ListRow key={t.id} task={t} onOpen={onOpen} onUpdate={onUpdate}/>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ListRow({ task: t, onOpen, onUpdate }) {
  const st = statusOf(t.status);
  const pri = t.priority ? PRI_MAP[t.priority] : null;
  const overdue = isOverdue(t.due);
  return (
    <div style={S.listRow} className="list-row">
      <span style={S.rowName} onClick={() => onOpen(t.id)}>{t.name}</span>
      <span style={S.col140}>
        <PickerDropdown
          value={t.status}
          options={STATUSES.map(s => ({key:s.key, label:s.label, color:s.color}))}
          onChange={v => onUpdate(t.id, {status: v})}
          render={() => (
            <span style={{...S.statusBadge, background:st.color+"1a", color:st.color, border:`1px solid ${st.color}44`}}>
              <span style={{width:7,height:7,borderRadius:7,background:st.color,display:"inline-block"}}/>
              <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{st.label}</span>
              <ChevronDown size={10} style={{flexShrink:0}}/>
            </span>
          )}
        />
      </span>
      <span style={S.col110}>
        <DateEditor value={t.due} onChange={v => onUpdate(t.id, {due: v})} overdue={overdue}/>
      </span>
      <span style={S.col90}>
        <PickerDropdown
          value={t.priority}
          options={[{key:null,label:"None",color:"#c2c6cf"}, ...PRIORITIES]}
          onChange={v => onUpdate(t.id, {priority: v})}
          render={() => (
            pri
              ? <span style={{...S.priBadge, color:pri.color, border:`1px solid ${pri.color}44`}}>{pri.label}</span>
              : <span style={S.emptyChip}>—</span>
          )}
        />
      </span>
      <span style={S.col140}>
        <PickerDropdown
          value={t.budget}
          options={[{key:null,label:"—"}, ...BUDGET_OPTIONS.map(b => ({key:b,label:b}))]}
          onChange={v => onUpdate(t.id, {budget: v})}
          render={() => <span style={S.cellSoft}>{t.budget || "—"}</span>}
        />
      </span>
      <span style={S.col150}>
        <TextEditor value={t.phone} onChange={v => onUpdate(t.id, {phone: v})} placeholder="—"
          render={v => v
            ? <a href={`tel:${v}`} style={S.phoneLink} onClick={e=>e.stopPropagation()}>
                <Phone size={11} color="#9096a2"/>{v}
              </a>
            : <span style={S.emptyChip}>—</span>
          }/>
      </span>
      <span style={S.col80}><Avatars who={t.assignees}/></span>
      <span style={S.col40}>
        <a href={CU_URL(t.id)} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()}>
          <ExternalLink size={13} color="#c2c6cf"/>
        </a>
      </span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// BOARD VIEW
// ═══════════════════════════════════════════════════════════════════════════════
function BoardView({ byStatus, onOpen, dragId, setDragId, onUpdate, statusFilter }) {
  const cols = statusFilter === "active" ? PIPELINE_STAGES
    : statusFilter === "binned" ? STATUSES.filter(s => s.key === "binned leads")
    : statusFilter === "done" ? STATUSES.filter(s => s.key === "done")
    : STATUSES;
  return (
    <div style={S.boardScroll}>
      <div style={S.board}>
        {cols.map(s => {
          const cards = byStatus[s.key] || [];
          return (
            <div key={s.key}
              style={{...S.col, border: dragId ? `2px dashed ${s.color}55` : "2px solid transparent"}}
              onDragOver={e => e.preventDefault()}
              onDrop={() => { if (dragId) onUpdate(dragId, {status: s.key}); setDragId(null); }}>
              <div style={S.colHead}>
                <span style={{...S.stagePill, background:s.color}}/>
                <span style={S.colTitle}>{s.label}</span>
                <span style={S.colBadge}>{cards.length}</span>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {cards.map(t => (
                  <div key={t.id} draggable
                    onDragStart={() => setDragId(t.id)}
                    onDragEnd={() => setDragId(null)}
                    style={{...S.boardCard, opacity: dragId===t.id ? 0.4 : 1}}
                    onClick={() => onOpen(t.id)}>
                    <div style={S.boardCardName}>{t.name}</div>
                    {t.budget && <div style={S.cardMeta}><DollarSign size={11}/>{t.budget}</div>}
                    {t.phone && <div style={S.cardMeta}><Phone size={11}/>{t.phone}</div>}
                    <div style={S.boardCardFoot}>
                      <Avatars who={t.assignees}/>
                      {t.due && <span style={{fontSize:11, color: isOverdue(t.due)?"#e5484d":"#9096a2"}}>{fmtDate(t.due)}</span>}
                    </div>
                    {t.tags.length > 0 && (
                      <div style={{display:"flex", gap:5, marginTop:8, flexWrap:"wrap"}}>
                        {t.tags.map(tag => <span key={tag} style={S.tag}>{tag}</span>)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DASHBOARD VIEW
// ═══════════════════════════════════════════════════════════════════════════════
function DashboardView({ stats, tasks, byStatus, onOpen }) {
  const maxPipeline = Math.max(1, ...PIPELINE_STAGES.map(s => (byStatus[s.key]||[]).length));
  const hotDeals = tasks.filter(t =>
    ["awating close meeting","closing meeting","package selection - presla","quotation","proposals"].includes(t.status)
  ).sort((a,b) => statusOf(b.status).order - statusOf(a.status).order);
  const overdue = tasks.filter(t => isOverdue(t.due) && !["done","binned leads"].includes(t.status));
  return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      <div style={S.kpiRow}>
        {[
          {icon:TrendingUp, label:"Active pipeline", value:stats.active, color:"#3e63dd"},
          {icon:CheckCircle2, label:"Won", value:stats.won, color:"#008844"},
          {icon:TrendingUp, label:"Win rate", value:stats.winRate+"%", color:"#ffc53d"},
          {icon:Trash2, label:"Binned", value:stats.binned, color:"#8a8f99"},
          {icon:AlertCircle, label:"Overdue", value:overdue.length, color:"#e5484d"},
        ].map(({icon:I,label,value,color}) => (
          <div key={label} style={S.kpiCard}>
            <div style={{...S.kpiIcon, background:color+"18", color}}><I size={20}/></div>
            <div>
              <div style={S.kpiVal}>{value}</div>
              <div style={S.kpiLabel}>{label}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={S.dashGrid}>
        <div style={S.dashCard}>
          <div style={S.dashCardTitle}>Pipeline Funnel</div>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {PIPELINE_STAGES.map(s => {
              const n = (byStatus[s.key]||[]).length;
              return (
                <div key={s.key} style={S.funnelRow}>
                  <span style={S.funnelLabel}>{s.label}</span>
                  <div style={S.funnelTrack}>
                    <div style={{...S.funnelBar, width:`${(n/maxPipeline)*100}%`, background:s.color, minWidth: n?28:0}}>
                      {n>0 && <span style={S.funnelNum}>{n}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div style={S.dashCard}>
          <div style={S.dashCardTitle}>Hot Deals — Close Now</div>
          {hotDeals.length === 0 && <div style={S.emptyHint}>No hot deals</div>}
          <div style={{display:"flex",flexDirection:"column"}}>
            {hotDeals.map(t => {
              const st = statusOf(t.status);
              return (
                <div key={t.id} style={S.hotRow} className="hot-row" onClick={() => onOpen(t.id)}>
                  <span style={{width:8,height:8,borderRadius:8,background:st.color,flexShrink:0}}/>
                  <span style={{flex:1,fontWeight:500,fontSize:13}}>{t.name}</span>
                  {t.budget && <span style={S.hotBudget}>{t.budget}</span>}
                  <ExternalLink size={13} color="#c2c6cf"/>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {overdue.length > 0 && (
        <div style={S.dashCard}>
          <div style={{...S.dashCardTitle, color:"#e5484d"}}>⚠ Overdue Tasks</div>
          <div style={{display:"flex",flexDirection:"column"}}>
            {overdue.map(t => (
              <div key={t.id} style={S.hotRow} className="hot-row" onClick={() => onOpen(t.id)}>
                <AlertCircle size={13} color="#e5484d"/>
                <span style={{flex:1,fontWeight:500,fontSize:13}}>{t.name}</span>
                <span style={{fontSize:11.5,color:"#e5484d",fontWeight:600}}>{fmtDate(t.due)}</span>
                <ExternalLink size={13} color="#c2c6cf"/>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TASK DRAWER — every field editable
// ═══════════════════════════════════════════════════════════════════════════════
function TaskDrawer({ task: t, onClose, onUpdate, onDelete }) {
  const st = statusOf(t.status);
  const pri = t.priority ? PRI_MAP[t.priority] : null;
  const overdue = isOverdue(t.due);
  const [editingName, setEditingName] = useState(false);
  const [nameVal, setNameVal] = useState(t.name);
  const [editingDesc, setEditingDesc] = useState(false);
  const [descVal, setDescVal] = useState(t.description);
  const [tagVal, setTagVal] = useState("");

  useEffect(() => {
    setNameVal(t.name); setEditingName(false);
    setDescVal(t.description); setEditingDesc(false);
    setTagVal("");
  }, [t.id]);

  const saveName = () => {
    onUpdate(t.id, {name: nameVal.trim() || "Untitled"});
    setEditingName(false);
  };
  const saveDesc = () => {
    onUpdate(t.id, {description: descVal});
    setEditingDesc(false);
  };
  const addTag = () => {
    const v = tagVal.trim();
    if (!v || t.tags.includes(v)) { setTagVal(""); return; }
    onUpdate(t.id, {tags: [...t.tags, v]});
    setTagVal("");
  };
  const removeTag = tag => onUpdate(t.id, {tags: t.tags.filter(x => x !== tag)});
  const toggleAssignee = person => {
    onUpdate(t.id, {
      assignees: t.assignees.includes(person)
        ? t.assignees.filter(x => x !== person)
        : [...t.assignees, person]
    });
  };

  return (
    <div style={S.drawerOverlay} onClick={onClose}>
      <div style={S.drawer} onClick={e => e.stopPropagation()}>

        {/* HEADER */}
        <div style={S.drawerHead}>
          <div style={{flex:1, minWidth:0}}>
            {editingName ? (
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                <input value={nameVal} onChange={e => setNameVal(e.target.value)}
                  onKeyDown={e => { if (e.key==="Enter") saveName(); if (e.key==="Escape") setEditingName(false); }}
                  style={S.nameInput} autoFocus/>
                <button className="icon-btn" onClick={saveName}><Check size={15} color="#008844"/></button>
                <button className="icon-btn" onClick={() => { setNameVal(t.name); setEditingName(false); }}><X size={15} color="#e5484d"/></button>
              </div>
            ) : (
              <div style={{display:"flex",gap:8,alignItems:"center"}} className="editable-name" onClick={() => setEditingName(true)}>
                <span style={S.drawerTitle}>{t.name}</span>
                <Edit2 size={13} color="#c2c6cf" className="edit-icon"/>
              </div>
            )}
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center",flexShrink:0}}>
            <a href={CU_URL(t.id)} target="_blank" rel="noreferrer" className="cu-link">
              ClickUp <ExternalLink size={12}/>
            </a>
            <button className="icon-btn" onClick={onClose}><X size={18}/></button>
          </div>
        </div>

        {/* META ROW */}
        <div style={S.metaRow}>
          <PickerDropdown
            value={t.status}
            options={STATUSES.map(s => ({key:s.key, label:s.label, color:s.color}))}
            onChange={v => onUpdate(t.id, {status: v})}
            width={240}
            render={() => (
              <span style={{...S.statusBig, background:st.color+"1a", color:st.color, border:`1px solid ${st.color}44`}}>
                <span style={{width:9,height:9,borderRadius:9,background:st.color}}/>
                {st.label} <ChevronDown size={13}/>
              </span>
            )}
          />
          <PickerDropdown
            value={t.priority}
            options={[{key:null,label:"No priority",color:"#c2c6cf"}, ...PRIORITIES]}
            onChange={v => onUpdate(t.id, {priority: v})}
            render={() => (
              pri
                ? <span style={{...S.priBadgeBig, color:pri.color, border:`1px solid ${pri.color}44`}}>{pri.label} priority <ChevronDown size={11}/></span>
                : <span style={S.priBadgeBig}>Set priority <ChevronDown size={11}/></span>
            )}
          />
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <Calendar size={13} color={overdue ? "#e5484d" : "#9096a2"}/>
            <DateEditor value={t.due} onChange={v => onUpdate(t.id, {due: v})} overdue={overdue} large/>
          </div>
        </div>

        {/* BODY: two columns */}
        <div style={S.drawerBody}>
          {/* LEFT */}
          <div style={S.drawerLeft}>
            <Section title="Contact">
              <EditRow icon={Phone} label="Phone">
                <TextEditor value={t.phone} onChange={v => onUpdate(t.id, {phone: v})} placeholder="Add phone"
                  render={v => v ? <a href={`tel:${v}`} style={S.editLink}>{v}</a> : <span style={S.editEmpty}>Add phone</span>}/>
              </EditRow>
              <EditRow icon={MessageCircle} label="WhatsApp">
                <TextEditor value={t.whatsapp} onChange={v => onUpdate(t.id, {whatsapp: v})} placeholder="Add WhatsApp URL"
                  render={v => v ? <a href={v} target="_blank" rel="noreferrer" style={S.editLink}>Open WhatsApp</a> : <span style={S.editEmpty}>Add WhatsApp</span>}/>
              </EditRow>
              <EditRow icon={Mail} label="Email">
                <TextEditor value={t.email} onChange={v => onUpdate(t.id, {email: v})} placeholder="Add email"
                  render={v => v ? <a href={`mailto:${v}`} style={S.editLink}>{v}</a> : <span style={S.editEmpty}>Add email</span>}/>
              </EditRow>
              <EditRow icon={Globe} label="Website">
                <TextEditor value={t.website} onChange={v => onUpdate(t.id, {website: v})} placeholder="Add website"
                  render={v => v ? <a href={v.startsWith("http")?v:`https://${v}`} target="_blank" rel="noreferrer" style={S.editLink}>{v}</a> : <span style={S.editEmpty}>Add website</span>}/>
              </EditRow>
            </Section>

            <Section title="Prospect Details">
              <EditRow icon={DollarSign} label="Budget">
                <PickerDropdown
                  value={t.budget}
                  options={[{key:null,label:"—"}, ...BUDGET_OPTIONS.map(b => ({key:b,label:b}))]}
                  onChange={v => onUpdate(t.id, {budget: v})}
                  render={() => t.budget ? <span style={S.editVal}>{t.budget}</span> : <span style={S.editEmpty}>Set budget</span>}
                />
              </EditRow>
              <EditRow icon={Briefcase} label="Need">
                <PickerDropdown
                  value={t.need}
                  options={[{key:null,label:"—"}, ...NEED_OPTIONS.map(n => ({key:n,label:n}))]}
                  onChange={v => onUpdate(t.id, {need: v})}
                  render={() => t.need ? <span style={S.editVal}>{t.need}</span> : <span style={S.editEmpty}>Set need</span>}
                />
              </EditRow>
              <EditRow icon={Clock} label="In business">
                <TextEditor value={t.yearsInBusiness} onChange={v => onUpdate(t.id, {yearsInBusiness: v})}
                  render={v => v ? <span style={S.editVal}>{v}</span> : <span style={S.editEmpty}>How long?</span>}/>
              </EditRow>
              <EditRow icon={TrendingUp} label="Past marketing">
                <TextEditor value={t.pastMarketing} onChange={v => onUpdate(t.id, {pastMarketing: v})} multiline
                  render={v => v ? <span style={S.editVal}>{v}</span> : <span style={S.editEmpty}>Note past marketing</span>}/>
              </EditRow>
            </Section>

            <Section title="Assignees">
              <div style={{display:"flex",flexWrap:"wrap",gap:8,paddingTop:2}}>
                {TEAM.map(person => {
                  const on = t.assignees.includes(person);
                  return (
                    <button key={person} className={`assignee-chip${on?" assignee-on":""}`} onClick={() => toggleAssignee(person)}>
                      <span style={{
                        width:20,height:20,borderRadius:20, background:AVATAR_COLORS[person],
                        color:"#fff",fontSize:10,fontWeight:700,
                        display:"grid",placeItems:"center"
                      }}>{person[0]}</span>
                      {person}
                    </button>
                  );
                })}
              </div>
            </Section>

            <Section title="Tags">
              <div style={{display:"flex",flexWrap:"wrap",gap:6,paddingTop:2}}>
                {t.tags.map(tag => (
                  <span key={tag} style={S.tagEditable} className="tag-edit">
                    {tag}
                    <X size={11} style={{cursor:"pointer",marginLeft:4}} onClick={() => removeTag(tag)}/>
                  </span>
                ))}
                <input value={tagVal} onChange={e => setTagVal(e.target.value)}
                  onKeyDown={e => { if (e.key==="Enter") addTag(); }}
                  onBlur={addTag}
                  placeholder="+ Add tag"
                  style={S.tagInput}/>
              </div>
            </Section>

            <div style={S.dangerZone}>
              <button className="danger-btn" onClick={() => { if (window.confirm(`Delete "${t.name}"?`)) onDelete(t.id); }}>
                <Trash2 size={13}/> Delete lead
              </button>
            </div>
          </div>

          {/* RIGHT */}
          <div style={S.drawerRight}>
            <Section title="Notes & Description">
              {editingDesc ? (
                <div>
                  <textarea value={descVal} onChange={e => setDescVal(e.target.value)}
                    style={S.descTextarea} autoFocus
                    placeholder="Add notes about this lead…"/>
                  <div style={{display:"flex",gap:8,marginTop:10,justifyContent:"flex-end"}}>
                    <button className="btn-secondary" onClick={() => { setDescVal(t.description); setEditingDesc(false); }}>Cancel</button>
                    <button className="btn-primary" onClick={saveDesc}>Save</button>
                  </div>
                </div>
              ) : (
                <div className="desc-box" onClick={() => setEditingDesc(true)}>
                  {t.description ? (
                    <div style={S.descBox}>{t.description}</div>
                  ) : (
                    <div style={S.descEmpty}>Click to add notes…</div>
                  )}
                  <div className="desc-edit-hint">
                    <Edit2 size={11}/> Click to edit
                  </div>
                </div>
              )}
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// REUSABLE EDIT PRIMITIVES
// ═══════════════════════════════════════════════════════════════════════════════
function TextEditor({ value, onChange, render, placeholder, multiline }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value || "");
  useEffect(() => setVal(value || ""), [value]);

  if (editing) {
    const commonProps = {
      value: val,
      onChange: e => setVal(e.target.value),
      onBlur: () => { onChange(val.trim() || null); setEditing(false); },
      onKeyDown: e => {
        if (e.key === "Enter" && !multiline) { onChange(val.trim() || null); setEditing(false); }
        if (e.key === "Escape") { setVal(value || ""); setEditing(false); }
      },
      autoFocus: true,
      placeholder,
      style: S.textInput,
    };
    return multiline
      ? <textarea {...commonProps} rows={2} style={{...S.textInput, minHeight:60,resize:"vertical"}}/>
      : <input {...commonProps}/>;
  }
  return (
    <span onClick={e => { e.stopPropagation(); setEditing(true); }} className="text-editor" style={{cursor:"pointer",display:"inline-block",minWidth:60}}>
      {render ? render(value) : (value || placeholder)}
    </span>
  );
}

function DateEditor({ value, onChange, overdue, large }) {
  const [editing, setEditing] = useState(false);
  if (editing) {
    return (
      <input type="date" defaultValue={toDateInput(value)} autoFocus
        onBlur={e => { onChange(fromDateInput(e.target.value)); setEditing(false); }}
        onKeyDown={e => { if (e.key === "Escape") setEditing(false); }}
        style={S.dateInput}/>
    );
  }
  return (
    <span onClick={e => { e.stopPropagation(); setEditing(true); }}
      style={{
        cursor:"pointer",
        display:"inline-flex",alignItems:"center",gap:4,
        color: overdue ? "#e5484d" : "#5c6270",
        fontSize: large ? 13 : 12.5,
        fontWeight: overdue ? 600 : 400,
      }}>
      {overdue && !large && <AlertCircle size={11}/>}
      {value ? fmtDate(value) : <span style={{color:"#c2c6cf"}}>Set date</span>}
    </span>
  );
}

function PickerDropdown({ value, options, onChange, render, width = 220 }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    if (open) document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);
  return (
    <span style={{position:"relative",display:"inline-block"}} ref={ref}>
      <span onClick={e => { e.stopPropagation(); setOpen(!open); }} style={{display:"inline-block",cursor:"pointer"}}>
        {render()}
      </span>
      {open && (
        <div style={{...S.picker, width}}>
          {options.map(o => (
            <div key={String(o.key)}
              className="picker-item"
              style={{...S.pickerItem, ...(o.key===value ? {background:"#f1f2f5",fontWeight:600} : {})}}
              onClick={() => { onChange(o.key); setOpen(false); }}>
              {o.color && <span style={{width:8,height:8,borderRadius:8,background:o.color,flexShrink:0}}/>}
              <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{o.label}</span>
            </div>
          ))}
        </div>
      )}
    </span>
  );
}

function Section({ title, children }) {
  return (
    <div style={S.section}>
      <div style={S.sectionTitle}>{title}</div>
      <div style={S.sectionBody}>{children}</div>
    </div>
  );
}

function EditRow({ icon: Icon, label, children }) {
  return (
    <div style={S.editRow}>
      <div style={S.editLabel}>
        <Icon size={13} color="#9096a2"/>
        <span>{label}</span>
      </div>
      <div style={S.editValue}>{children}</div>
    </div>
  );
}

function Avatars({ who = [], size = 24 }) {
  if (!who.length) return <span style={{color:"#c2c6cf",fontSize:13}}>—</span>;
  return (
    <span style={{display:"flex"}}>
      {who.map((w,i) => (
        <span key={w} title={w} style={{
          width:size, height:size, borderRadius:size, background:AVATAR_COLORS[w]||"#666",
          color:"#fff", fontSize:Math.round(size*0.45), fontWeight:700,
          display:"grid", placeItems:"center",
          border:"2px solid #fff", marginLeft: i ? -size*0.3 : 0
        }}>{w[0]}</span>
      ))}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STYLES  — reviewed for consistent, generous spacing
// ═══════════════════════════════════════════════════════════════════════════════
const S = {
  root: { fontFamily:"'Inter',system-ui,sans-serif", background:"#f7f8fa", minHeight:"100vh", color:"#1c1f26", fontSize:13.5 },

  // Top bar — 20px vertical padding, 24px horizontal
  topbar: { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"18px 24px", background:"#fff", borderBottom:"1px solid #e9ebef", position:"sticky", top:0, zIndex:100, gap:16, flexWrap:"wrap" },
  topbarLeft: { display:"flex", alignItems:"center", gap:14 },
  topbarRight: { display:"flex", alignItems:"center", gap:12 },
  logo: { width:40,height:40,borderRadius:10,background:"linear-gradient(135deg,#3e63dd,#6366f1)",color:"#fff",display:"grid",placeItems:"center",fontWeight:700,fontSize:18,flexShrink:0 },
  appName: { fontSize:15,fontWeight:700,letterSpacing:-0.2 },
  appSub: { fontSize:12,color:"#9096a2",marginTop:3 },
  viewTabs: { display:"flex",gap:2,background:"#f1f2f5",padding:3,borderRadius:9 },

  // Toolbar — matched vertical rhythm
  toolbar: { display:"flex", alignItems:"center", gap:14, padding:"14px 24px", background:"#fff", borderBottom:"1px solid #e9ebef", flexWrap:"wrap" },
  searchBox: { display:"flex",alignItems:"center",gap:9,background:"#f1f2f5",border:"1px solid #e4e7eb",borderRadius:9,padding:"8px 13px",minWidth:260 },
  searchInput: { border:"none",outline:"none",fontSize:13,flex:1,background:"transparent",color:"#1c1f26" },
  filterGroup: { display:"flex",gap:6 },
  counter: { marginLeft:"auto",fontSize:12.5,color:"#9096a2",fontWeight:500 },

  // Main content — 24px around
  main: { padding:"24px" },

  // Group heading — 12px gap to table
  groupHead: { display:"flex",alignItems:"center",gap:9,marginBottom:12,paddingLeft:2 },
  stagePill: { width:4,height:16,borderRadius:3,flexShrink:0 },
  groupTitle: { fontSize:14,fontWeight:600 },
  groupBadge: { fontSize:11.5,color:"#9096a2",background:"#eef0f3",padding:"2px 9px",borderRadius:10,fontWeight:600 },

  // List table — 14px vertical padding on rows, 18px horizontal
  listTable: { background:"#fff",border:"1px solid #e9ebef",borderRadius:12,overflow:"visible" },
  listHeader: { display:"flex",alignItems:"center",gap:12,padding:"12px 20px",borderBottom:"1px solid #e9ebef",fontSize:11.5,fontWeight:600,color:"#9096a2",textTransform:"uppercase",letterSpacing:0.3,userSelect:"none",background:"#fafbfc" },
  listRow: { display:"flex",alignItems:"center",gap:12,padding:"14px 20px",borderBottom:"1px solid #f4f5f7",transition:"background .1s" },
  rowName: { flex:1, fontWeight:500, cursor:"pointer", color:"#1c1f26", fontSize:13.5 },

  // Column widths (bigger to breathe)
  col40: { width:32,flexShrink:0,textAlign:"right" },
  col80: { width:80,flexShrink:0 },
  col90: { width:90,flexShrink:0 },
  col110: { width:110,flexShrink:0 },
  col140: { width:150,flexShrink:0 },
  col150: { width:160,flexShrink:0 },

  // Badges — 6px vertical padding, 10px horizontal
  statusBadge: { display:"inline-flex",alignItems:"center",gap:5,padding:"4px 9px",borderRadius:6,fontSize:11.5,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap",maxWidth:"100%" },
  priBadge: { display:"inline-flex",fontSize:11.5,fontWeight:600,padding:"3px 9px",borderRadius:6,background:"transparent",cursor:"pointer" },
  emptyChip: { color:"#c2c6cf",fontSize:12.5 },
  cellSoft: { fontSize:12.5,color:"#5c6270",cursor:"pointer" },
  phoneLink: { color:"#1c1f26", textDecoration:"none", display:"inline-flex", alignItems:"center", gap:5, fontSize:12.5 },

  // Picker dropdown
  picker: { position:"absolute",top:"calc(100% + 4px)",left:0,zIndex:300,background:"#fff",border:"1px solid #e9ebef",borderRadius:10,boxShadow:"0 10px 32px rgba(0,0,0,.12)",padding:6,maxHeight:280,overflowY:"auto" },
  pickerItem: { display:"flex",alignItems:"center",gap:9,padding:"8px 11px",borderRadius:7,cursor:"pointer",fontSize:13,color:"#1c1f26" },

  // Board — generous spacing
  boardScroll: { overflowX:"auto",paddingBottom:12 },
  board: { display:"flex",gap:14,minWidth:"min-content",alignItems:"flex-start",padding:"2px" },
  col: { width:260,flexShrink:0,background:"#f1f2f5",borderRadius:12,padding:12,minHeight:100 },
  colHead: { display:"flex",alignItems:"center",gap:8,padding:"4px 4px 12px" },
  colTitle: { fontSize:12.5,fontWeight:600,flex:1 },
  colBadge: { fontSize:11,color:"#9096a2",fontWeight:600 },
  boardCard: { background:"#fff",border:"1px solid #e9ebef",borderRadius:9,padding:"12px 13px",cursor:"pointer",boxShadow:"0 1px 3px rgba(0,0,0,.04)",transition:"transform .1s,box-shadow .1s" },
  boardCardName: { fontWeight:500, fontSize:13, lineHeight:1.35, marginBottom:9 },
  boardCardFoot: { display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:9 },
  cardMeta: { display:"flex",alignItems:"center",gap:5,fontSize:11.5,color:"#5c6270",marginTop:4 },
  tag: { fontSize:10.5,padding:"2px 7px",borderRadius:5,background:"#eef0f3",color:"#5c6270",fontWeight:500 },

  // Dashboard — generous card padding
  kpiRow: { display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:14 },
  kpiCard: { display:"flex",alignItems:"center",gap:14,background:"#fff",border:"1px solid #e9ebef",borderRadius:12,padding:"20px 22px" },
  kpiIcon: { width:44,height:44,borderRadius:11,display:"grid",placeItems:"center",flexShrink:0 },
  kpiVal: { fontSize:26,fontWeight:700,letterSpacing:-0.5,lineHeight:1 },
  kpiLabel: { fontSize:12,color:"#8a8f99",marginTop:5 },
  dashGrid: { display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(360px,1fr))",gap:16 },
  dashCard: { background:"#fff",border:"1px solid #e9ebef",borderRadius:12,padding:"20px 22px" },
  dashCardTitle: { fontSize:14,fontWeight:600,marginBottom:16 },
  funnelRow: { display:"flex",alignItems:"center",gap:14 },
  funnelLabel: { width:160,fontSize:12.5,color:"#5c6270",flexShrink:0 },
  funnelTrack: { flex:1,background:"#f1f2f5",borderRadius:6,height:24 },
  funnelBar: { height:24,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"flex-end",paddingRight:8,transition:"width .4s" },
  funnelNum: { color:"#fff",fontSize:12,fontWeight:700 },
  hotRow: { display:"flex",alignItems:"center",gap:11,padding:"12px 4px",borderBottom:"1px solid #f1f2f5",cursor:"pointer" },
  hotBudget: { fontSize:11.5,color:"#5c6270",fontWeight:500,background:"#f1f2f5",padding:"3px 8px",borderRadius:5 },
  emptyHint: { color:"#9096a2",fontSize:13,padding:"12px 0" },

  // Drawer — much more spacing
  drawerOverlay: { position:"fixed",inset:0,background:"rgba(0,0,0,.4)",zIndex:500,display:"flex",justifyContent:"flex-end" },
  drawer: { width:"min(760px,95vw)",background:"#fff",height:"100%",overflowY:"auto",boxShadow:"-4px 0 32px rgba(0,0,0,.15)",display:"flex",flexDirection:"column" },
  drawerHead: { display:"flex",gap:14,padding:"22px 26px 18px",borderBottom:"1px solid #e9ebef",alignItems:"flex-start" },
  drawerTitle: { fontSize:18,fontWeight:700,letterSpacing:-0.3,lineHeight:1.3 },
  metaRow: { display:"flex",alignItems:"center",gap:14,padding:"14px 26px",borderBottom:"1px solid #f1f2f5",flexWrap:"wrap",background:"#fafbfc" },
  drawerBody: { display:"flex",flex:1,overflow:"hidden" },
  drawerLeft: { flex:"0 0 320px",borderRight:"1px solid #f1f2f5",overflowY:"auto" },
  drawerRight: { flex:1,overflowY:"auto",minWidth:0 },

  // Sections — 22px vertical padding, 24px horizontal
  section: { padding:"22px 24px",borderBottom:"1px solid #f4f5f7" },
  sectionTitle: { fontSize:10.5,fontWeight:700,textTransform:"uppercase",letterSpacing:0.7,color:"#9096a2",marginBottom:14 },
  sectionBody: { display:"flex",flexDirection:"column",gap:12 },

  // Edit row — clean 2-col
  editRow: { display:"flex",gap:14,alignItems:"flex-start" },
  editLabel: { display:"flex",alignItems:"center",gap:6,width:100,flexShrink:0,fontSize:12,color:"#9096a2",marginTop:4 },
  editValue: { flex:1,minWidth:0,fontSize:13,color:"#1c1f26",wordBreak:"break-word" },
  editLink: { fontSize:13,color:"#3e63dd",textDecoration:"none",wordBreak:"break-word" },
  editVal: { fontSize:13,color:"#1c1f26" },
  editEmpty: { fontSize:12.5,color:"#c2c6cf",fontStyle:"italic" },

  // Inputs
  textInput: { border:"1px solid #3e63dd",borderRadius:6,padding:"5px 8px",fontSize:13,outline:"none",width:"100%",fontFamily:"inherit" },
  nameInput: { fontSize:18,fontWeight:700,border:"1px solid #3e63dd",borderRadius:7,padding:"5px 10px",outline:"none",flex:1,fontFamily:"inherit" },
  dateInput: { border:"1px solid #3e63dd",borderRadius:6,padding:"4px 7px",fontSize:12.5,outline:"none",fontFamily:"inherit" },
  descTextarea: { width:"100%",minHeight:180,padding:14,border:"1px solid #3e63dd",borderRadius:9,fontSize:13,lineHeight:1.6,outline:"none",fontFamily:"inherit",resize:"vertical" },

  // Meta row badges — larger
  statusBig: { display:"inline-flex",alignItems:"center",gap:7,padding:"7px 13px",borderRadius:9,fontSize:13,fontWeight:600,cursor:"pointer" },
  priBadgeBig: { display:"inline-flex",alignItems:"center",gap:5,padding:"6px 11px",borderRadius:8,fontSize:12.5,fontWeight:600,cursor:"pointer",color:"#5c6270",border:"1px solid #e4e7eb" },

  // Description
  descBox: { fontSize:13,lineHeight:1.7,color:"#2c3038",whiteSpace:"pre-wrap",wordBreak:"break-word",background:"#f8f9fb",borderRadius:9,padding:16,minHeight:80,cursor:"pointer" },
  descEmpty: { color:"#9096a2",fontSize:13,fontStyle:"italic",padding:16,background:"#f8f9fb",borderRadius:9,textAlign:"center",cursor:"pointer" },

  // Tag editable
  tagEditable: { fontSize:11.5,padding:"4px 8px",borderRadius:6,background:"#eef0f3",color:"#5c6270",fontWeight:500,display:"inline-flex",alignItems:"center",gap:2 },
  tagInput: { border:"1px dashed #d4d7dd",background:"transparent",borderRadius:6,padding:"4px 8px",fontSize:11.5,outline:"none",color:"#5c6270",width:100,fontFamily:"inherit" },

  // Danger zone
  dangerZone: { padding:"20px 24px",borderTop:"1px solid #f4f5f7" },
};

// ═══════════════════════════════════════════════════════════════════════════════
// CSS
// ═══════════════════════════════════════════════════════════════════════════════
const CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', system-ui, sans-serif; }

  ::-webkit-scrollbar { width: 8px; height: 8px; }
  ::-webkit-scrollbar-thumb { background: #d4d7dd; border-radius: 8px; }
  ::-webkit-scrollbar-thumb:hover { background: #b6bac3; }

  .vtab {
    display:flex; align-items:center; gap:7px;
    border:none; background:transparent;
    padding:8px 14px; border-radius:7px;
    font-size:13px; font-weight:500; color:#5c6270; cursor:pointer;
    transition: background .12s, color .12s;
    font-family: inherit;
  }
  .vtab:hover { color:#1c1f26; }
  .vtab-on { background:#fff; color:#1c1f26; box-shadow: 0 1px 2px rgba(0,0,0,.06); }

  .add-btn {
    display:flex; align-items:center; gap:6px;
    background:#3e63dd; color:#fff; border:none;
    padding:9px 16px; border-radius:8px;
    font-size:13px; font-weight:600; cursor:pointer;
    font-family: inherit;
    transition: background .15s;
  }
  .add-btn:hover { background:#2f52c9; }

  .chip {
    border:1px solid #e4e7eb; background:#fff;
    padding:7px 14px; border-radius:20px;
    font-size:12.5px; font-weight:500; color:#5c6270; cursor:pointer;
    transition: all .12s;
    font-family: inherit;
  }
  .chip:hover { border-color:#c2c6cf; color:#1c1f26; }
  .chip-on { background:#3e63dd; color:#fff; border-color:#3e63dd; }
  .chip-on:hover { background:#2f52c9; }

  .list-row:hover { background:#fafbff; }
  .list-row:last-child { border-bottom: none; }

  .picker-item:hover { background:#f1f2f5; }

  .boardCard:hover { transform: translateY(-1px); box-shadow: 0 3px 8px rgba(0,0,0,.08); }

  .hot-row:hover { background:#fafbff; }
  .hot-row:last-child { border-bottom: none; }

  .icon-btn {
    background:none; border:none; cursor:pointer;
    padding:6px; border-radius:6px;
    display:flex; align-items:center; justify-content:center;
    transition: background .12s;
  }
  .icon-btn:hover { background:#f1f2f5; }

  .editable-name { cursor:pointer; padding:4px 6px; margin:-4px -6px; border-radius:6px; transition: background .12s; }
  .editable-name:hover { background:#f4f5f7; }
  .editable-name .edit-icon { opacity:0; transition: opacity .12s; }
  .editable-name:hover .edit-icon { opacity:1; }

  .cu-link {
    display:flex; align-items:center; gap:5px;
    font-size:12px; color:#3e63dd; text-decoration:none;
    padding:7px 12px; border:1px solid #3e63dd44;
    border-radius:7px; white-space:nowrap; font-weight:500;
    transition: background .12s;
  }
  .cu-link:hover { background:#3e63dd0a; }

  .assignee-chip {
    display:flex; align-items:center; gap:8px;
    padding:6px 12px 6px 6px; border-radius:20px;
    border:1px solid #e4e7eb; background:#fff;
    font-size:12.5px; font-weight:500; color:#5c6270; cursor:pointer;
    transition: all .12s;
    font-family: inherit;
  }
  .assignee-chip:hover { border-color:#c2c6cf; }
  .assignee-on { background:#eef0ff; border-color:#3e63dd66; color:#1c1f26; }

  .tag-edit:hover { background:#e0e3e8; }

  .text-editor { padding:2px 4px; margin:-2px -4px; border-radius:5px; transition: background .12s; }
  .text-editor:hover { background:#f4f5f7; }

  .desc-box { position:relative; }
  .desc-box .desc-edit-hint {
    position:absolute; top:10px; right:10px;
    font-size:10.5px; color:#9096a2;
    display:flex; align-items:center; gap:4px;
    background:#fff; padding:3px 7px; border-radius:5px;
    opacity:0; transition: opacity .15s;
    pointer-events:none;
  }
  .desc-box:hover .desc-edit-hint { opacity:1; }

  .btn-primary {
    background:#3e63dd; color:#fff; border:none;
    padding:8px 16px; border-radius:7px;
    font-size:12.5px; font-weight:600; cursor:pointer;
    font-family: inherit;
  }
  .btn-primary:hover { background:#2f52c9; }
  .btn-secondary {
    background:#fff; color:#5c6270; border:1px solid #e4e7eb;
    padding:8px 16px; border-radius:7px;
    font-size:12.5px; font-weight:600; cursor:pointer;
    font-family: inherit;
  }
  .btn-secondary:hover { background:#f4f5f7; }

  .danger-btn {
    display:flex; align-items:center; gap:6px;
    background:transparent; color:#e5484d; border:1px solid #e5484d44;
    padding:8px 14px; border-radius:7px;
    font-size:12.5px; font-weight:600; cursor:pointer;
    font-family: inherit;
    transition: all .12s;
  }
  .danger-btn:hover { background:#e5484d0a; border-color:#e5484d; }

  input:focus-visible, textarea:focus-visible, button:focus-visible, a:focus-visible {
    outline: 2px solid #3e63dd; outline-offset: 1px;
  }
`;
