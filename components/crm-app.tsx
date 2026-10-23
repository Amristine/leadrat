"use client";

import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  Activity, ArrowRight, BarChart3, Bell, Building2, CalendarClock, CalendarDays, Check,
  CheckCircle2, ChevronDown, CircleHelp, ClipboardList, Clock3, Download, Eye, Home,
  LayoutDashboard, Mail, Menu, MessageCircle, MoreHorizontal, MapPin, Phone, Plus, Search,
  Settings, SlidersHorizontal, Sparkles, Target, Trash2, TrendingUp, UserRound, Users, X
} from "lucide-react";
import type { Activity as LeadActivity, Campaign, Lead, LeadSource, LeadStatus, Property, SiteVisit, Task, TeamMember } from "@/lib/types";
import { localStore } from "@/lib/local-store";

type Page = "Dashboard" | "Manage Leads" | "Properties" | "Follow-ups" | "Site Visits" | "Campaigns" | "Team" | "Reports" | "Settings";
type ModalKind = "lead" | "property" | "task" | "visit" | "member" | "campaign" | null;
const pages: { name: Page; icon: typeof LayoutDashboard; group: "workspace" | "management" }[] = [
  { name: "Dashboard", icon: LayoutDashboard, group: "workspace" }, { name: "Manage Leads", icon: Users, group: "workspace" },
  { name: "Properties", icon: Building2, group: "workspace" }, { name: "Follow-ups", icon: CalendarClock, group: "workspace" },
  { name: "Site Visits", icon: MapPin, group: "workspace" }, { name: "Campaigns", icon: Sparkles, group: "workspace" },
  { name: "Team", icon: UserRound, group: "management" }, { name: "Reports", icon: BarChart3, group: "management" },
  { name: "Settings", icon: Settings, group: "management" },
];
const statuses: LeadStatus[] = ["New", "Contacted", "Visit Scheduled", "Negotiation", "Booked", "Lost"];
const sources: LeadSource[] = ["Website", "99acres", "Magicbricks", "Facebook Ads", "Referral", "Walk-in", "Instagram"];
const agents = ["Unassigned", "Priya Mehta", "Arjun Rao", "Sneha Patil", "Kabir Nair"];
const budgets = ["Below ₹50L", "₹50L–₹75L", "₹75L–₹1Cr", "₹1Cr–₹2Cr", "₹2Cr+"];
const propertyTypes = ["1 BHK Apartment", "2 BHK Apartment", "3 BHK Apartment", "Villa", "Commercial", "Plot"];
const uid = (prefix: string) => prefix + "-" + Math.random().toString(36).slice(2, 8).toUpperCase();
const initials = (name: string) => name.split(/\s+/).slice(0, 2).map((part) => part[0] ?? "").join("").toUpperCase();
const statusClass = (status: string) => status.toLowerCase().replaceAll(" ", "-");
const todayLabel = () => new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long" }).format(new Date());
const fmtMoney = (n: number) => "₹" + n.toLocaleString("en-IN");
function exportFile(name: string, content: string, type = "text/plain;charset=utf-8") {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a"); a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url);
}
function csvCell(value: string | number) { return '"' + String(value ?? "").replaceAll('"', '""') + '"'; }

export default function CRMApp() {
  const [page, setPage] = useState<Page>("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [visits, setVisits] = useState<SiteVisit[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [ready, setReady] = useState(false);
  const [search, setSearch] = useState("");
  const [leadStatus, setLeadStatus] = useState("");
  const [leadSource, setLeadSource] = useState("");
  const [propertySearch, setPropertySearch] = useState("");
  const [propertyTypeFilter, setPropertyTypeFilter] = useState("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [modal, setModal] = useState<ModalKind>(null);
  const [toast, setToast] = useState("");
  const [settingsTab, setSettingsTab] = useState("Workspace");
  const [workspaceName, setWorkspaceName] = useState("Acme Realty");
  const [workspaceEmail, setWorkspaceEmail] = useState("hello@acmerealty.example");
  const [currency, setCurrency] = useState("INR — Indian Rupee (₹)");
  const [notifications, setNotifications] = useState({ reminders: true, newLeads: true, daily: false });

  useEffect(() => {
    setLeads(localStore.loadLeads()); setProperties(localStore.loadProperties()); setTasks(localStore.loadTasks());
    setVisits(localStore.loadVisits()); setTeam(localStore.loadTeam()); setCampaigns(localStore.loadCampaigns()); setReady(true);
  }, []);
  useEffect(() => { if (ready) localStore.saveLeads(leads); }, [leads, ready]);
  useEffect(() => { if (ready) localStore.saveProperties(properties); }, [properties, ready]);
  useEffect(() => { if (ready) localStore.saveTasks(tasks); }, [tasks, ready]);
  useEffect(() => { if (ready) localStore.saveVisits(visits); }, [visits, ready]);
  useEffect(() => { if (ready) localStore.saveTeam(team); }, [team, ready]);
  useEffect(() => { if (ready) localStore.saveCampaigns(campaigns); }, [campaigns, ready]);
  useEffect(() => { if (!toast) return; const timer = window.setTimeout(() => setToast(""), 2600); return () => window.clearTimeout(timer); }, [toast]);

  const filteredLeads = useMemo(() => leads.filter((lead) => {
    const q = search.trim().toLowerCase();
    const matches = !q || [lead.name, lead.phone, lead.email, lead.area, lead.id, lead.propertyType].some((v) => v.toLowerCase().includes(q));
    return matches && (!leadStatus || lead.status === leadStatus) && (!leadSource || lead.source === leadSource);
  }), [leads, search, leadStatus, leadSource]);
  const filteredProperties = useMemo(() => properties.filter((property) => {
    const q = propertySearch.toLowerCase();
    return (!q || [property.name, property.location, property.type, property.configuration].some((v) => v.toLowerCase().includes(q))) && (!propertyTypeFilter || property.type === propertyTypeFilter);
  }), [properties, propertySearch, propertyTypeFilter]);

  const notify = (message: string) => setToast(message);
  const go = (next: Page) => { setPage(next); setSidebarOpen(false); setSearch(""); setLeadStatus(""); setLeadSource(""); };
  const patchLead = (updated: Lead) => setLeads((current) => current.map((lead) => lead.id === updated.id ? updated : lead));
  const addActivity = (lead: Lead, title: string, description: string): LeadActivity => ({ id: uid("ACT"), title, description, date: "Just now" });
  const createLead = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim(); if (!name) return;
    const lead: Lead = {
      id: uid("LD"), name, phone: String(form.get("phone") ?? "").trim(), email: String(form.get("email") ?? "").trim(),
      source: String(form.get("source") ?? "Website"), budget: String(form.get("budget") ?? budgets[1]),
      propertyType: String(form.get("propertyType") ?? propertyTypes[1]), area: String(form.get("area") ?? "").trim() || "Not specified",
      status: "New", agent: "Unassigned", nextFollowUp: "Not scheduled", notes: String(form.get("notes") ?? "").trim(),
      createdAt: "Just now", activity: [{ id: uid("ACT"), title: "Lead created", description: "Added to workspace", date: "Just now" }],
    };
    setLeads((current) => [lead, ...current]); setModal(null); setPage("Manage Leads"); setSearch(""); notify("Lead created successfully");
  };
  const createProperty = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    const property: Property = { id: uid("PR"), name: String(form.get("name")), type: String(form.get("type")), location: String(form.get("location")), price: String(form.get("price")), configuration: String(form.get("configuration")), availableUnits: Number(form.get("units") || 1), status: Number(form.get("units") || 1) < 6 ? "Limited units" : "Available", color: "sage" };
    setProperties((current) => [property, ...current]); setModal(null); setPage("Properties"); notify("Property added to inventory");
  };
  const createTask = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    const task: Task = { id: uid("TK"), title: String(form.get("title")), description: String(form.get("description") || ""), due: String(form.get("due") || "Today"), kind: String(form.get("kind") || "Call") as Task["kind"], leadName: String(form.get("leadName") || "—"), completed: false };
    setTasks((current) => [task, ...current]); setModal(null); setPage("Follow-ups"); notify("Follow-up task created");
  };
  const createVisit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    const visit: SiteVisit = { id: uid("SV"), leadName: String(form.get("leadName")), propertyName: String(form.get("propertyName")), date: String(form.get("date")), agent: String(form.get("agent")), status: "Pending" };
    setVisits((current) => [visit, ...current]); setModal(null); setPage("Site Visits"); notify("Site visit scheduled");
  };
  const createMember = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const form = new FormData(event.currentTarget); const name = String(form.get("name"));
    setTeam((current) => [{ id: uid("TM"), name, role: String(form.get("role")), initials: initials(name), leads: 0, visits: 0, bookings: 0, target: 0 }, ...current]);
    setModal(null); setPage("Team"); notify("Team member added to demo workspace");
  };
  const createCampaign = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    const campaign: Campaign = { id: uid("CP"), name: String(form.get("name")), channel: String(form.get("channel")), startDate: String(form.get("startDate") || new Date().toISOString().slice(0, 10)), budget: Number(form.get("budget") || 0), status: "Active" };
    setCampaigns(current => [campaign, ...current]); setModal(null); setPage("Campaigns"); notify("Campaign created");
  };
  const exportLeads = () => {
    const header = ["ID", "Name", "Phone", "Email", "Source", "Budget", "Property", "Area", "Status", "Agent", "Follow-up"];
    const rows = filteredLeads.map((l) => [l.id,l.name,l.phone,l.email,l.source,l.budget,l.propertyType,l.area,l.status,l.agent,l.nextFollowUp]);
    exportFile("leadrat-leads.csv", [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n"), "text/csv;charset=utf-8;");
    notify("Lead CSV exported");
  };
  const exportReport = () => {
    const report = ["LeadRat workspace report", "Generated: " + new Date().toLocaleString(), "", "Leads: " + leads.length, "New: " + leads.filter((l) => l.status === "New").length, "Contacted: " + leads.filter((l) => l.status === "Contacted").length, "Site visits: " + visits.length, "Bookings: " + leads.filter((l) => l.status === "Booked").length, "Properties: " + properties.length, "Open tasks: " + tasks.filter((t) => !t.completed).length, "", "Demo workspace — figures reflect locally stored records."].join("\n");
    exportFile("leadrat-report.txt", report); notify("Report exported");
  };
  const toggleTask = (id: string) => setTasks((current) => current.map((task) => task.id === id ? { ...task, completed: !task.completed } : task));
  const updateVisitStatus = (id: string, status: SiteVisit["status"]) => setVisits((current) => current.map((visit) => visit.id === id ? { ...visit, status } : visit));
  const deleteLead = (id: string) => { setLeads((current) => current.filter((lead) => lead.id !== id)); setSelectedLead(null); notify("Lead deleted"); };
  const resetDemo = () => { if (!window.confirm("Reset all locally saved data to the original demo records?")) return; localStorage.removeItem("leadrat:v1:leads"); localStorage.removeItem("leadrat:v1:properties"); localStorage.removeItem("leadrat:v1:tasks"); localStorage.removeItem("leadrat:v1:visits"); localStorage.removeItem("leadrat:v1:team"); localStorage.removeItem("leadrat:v1:campaigns"); setLeads(localStore.loadLeads()); setProperties(localStore.loadProperties()); setTasks(localStore.loadTasks()); setVisits(localStore.loadVisits()); setTeam(localStore.loadTeam()); setCampaigns(localStore.loadCampaigns()); notify("Demo data reset"); };

  const pageTitle = page === "Manage Leads" ? "Manage leads" : page;
  const headingActions = page === "Dashboard" ? <><button className="btn secondary" onClick={exportReport}><Download size={15}/> Export report</button><button className="btn primary" onClick={() => setModal("lead")}><Plus size={16}/> Add lead</button></>
    : page === "Manage Leads" ? <><button className="btn secondary" onClick={exportLeads}><Download size={15}/> Export CSV</button><button className="btn primary" onClick={() => setModal("lead")}><Plus size={16}/> Add lead</button></>
    : page === "Properties" ? <button className="btn primary" onClick={() => setModal("property")}><Plus size={16}/> Add property</button>
    : page === "Follow-ups" ? <button className="btn primary" onClick={() => setModal("task")}><Plus size={16}/> New task</button>
    : page === "Site Visits" ? <button className="btn primary" onClick={() => setModal("visit")}><Plus size={16}/> Schedule visit</button>
    : page === "Campaigns" ? <button className="btn primary" onClick={() => setModal("campaign")}><Plus size={16}/> New campaign</button>
    : page === "Team" ? <button className="btn primary" onClick={() => setModal("member")}><Plus size={16}/> Add member</button>
    : page === "Reports" ? <button className="btn secondary" onClick={exportReport}><Download size={15}/> Export report</button> : null;

  return <div className="app-shell">
    <aside className={"sidebar " + (sidebarOpen ? "sidebar-open" : "")}>
      <button className="brand" onClick={() => go("Dashboard")}><span className="brand-symbol">L</span><span className="brand-word">lead<span>rat</span><small>REAL ESTATE CRM</small></span></button>
      <button className="workspace-switch"><span className="workspace-avatar">A</span><span className="workspace-label"><b>{workspaceName}</b><small>Workspace</small></span><ChevronDown size={15}/></button>
      <div className="nav-caption">WORKSPACE</div>
      <nav className="nav-list">{pages.filter((item) => item.group === "workspace").map((item) => <NavButton key={item.name} item={item} active={page === item.name} onClick={() => go(item.name)} count={item.name === "Manage Leads" ? leads.filter((l) => l.status === "New").length : undefined}/>)}</nav>
      <div className="nav-caption management-caption">MANAGEMENT</div>
      <nav className="nav-list">{pages.filter((item) => item.group === "management").map((item) => <NavButton key={item.name} item={item} active={page === item.name} onClick={() => go(item.name)}/>)}</nav>
      <div className="sidebar-bottom"><div className="help-card"><span className="help-icon"><CircleHelp size={16}/></span><span><b>Need a hand?</b><small>Explore your workspace</small></span><ArrowRight size={14}/></div><div className="sidebar-user"><span className="user-avatar">RS</span><span className="user-meta"><b>Raj Singh</b><small>Administrator</small></span><button className="icon-plain" aria-label="More profile actions" onClick={() => notify("Profile settings will be available after authentication is connected")}><MoreHorizontal size={19}/></button></div></div>
    </aside>
    <main className="main-area">
      <header className="topbar"><button className="mobile-menu" onClick={() => setSidebarOpen((open) => !open)} aria-label="Toggle navigation"><Menu size={19}/></button><div className="breadcrumbs"><span>Workspace</span><span className="crumb-slash">/</span><b>{pageTitle}</b></div><div className="topbar-actions"><label className="global-search"><Search size={16}/><input value={search} onChange={(e) => { setSearch(e.target.value); if (e.target.value && page !== "Manage Leads") setPage("Manage Leads"); }} placeholder="Search leads, phone, area…"/><kbd>⌘ K</kbd></label><button className="top-icon" aria-label="Help" onClick={() => notify("Help center coming soon")}><CircleHelp size={17}/></button><button className="top-icon notification-button" aria-label="Notifications" onClick={() => go("Follow-ups")}><Bell size={17}/><i/></button><span className="top-user-avatar">RS</span></div></header>
      <section className="page-content">
        <div className="page-heading"><div><div className="eyebrow">ACME REALTY / WORKSPACE</div><h1>{page === "Dashboard" ? "Good morning, Raj" : pageTitle}<span className="heading-emoji">{page === "Dashboard" ? " 👋" : ""}</span></h1><p>{page === "Dashboard" ? "Here’s what’s happening with your property business today." : pageDescription(page)}</p></div><div className="heading-actions">{headingActions}</div></div>
        {!ready ? <div className="loading-panel">Preparing your workspace…</div> : <>
          {page === "Dashboard" && <Dashboard leads={leads} tasks={tasks} visits={visits} onOpenLead={setSelectedLead} onGo={go} onNewTask={() => setModal("task")}/>}
          {page === "Manage Leads" && <LeadsPage leads={filteredLeads} allCount={leads.length} search={search} setSearch={setSearch} status={leadStatus} setStatus={setLeadStatus} source={leadSource} setSource={setLeadSource} onOpenLead={setSelectedLead} onBulkStatus={(ids, status) => setLeads(current => current.map(lead => ids.includes(lead.id) ? {...lead, status, activity:[{id:uid("ACT"),title:"Status updated",description:"Bulk status update",date:"Just now"},...lead.activity]} : lead))} onExport={exportLeads} onAdd={() => setModal("lead")} onDelete={deleteLead}/>}
          {page === "Properties" && <PropertiesPage properties={filteredProperties} search={propertySearch} setSearch={setPropertySearch} typeFilter={propertyTypeFilter} setTypeFilter={setPropertyTypeFilter} onAdd={() => setModal("property")} onDelete={(id) => {setProperties((current) => current.filter((p) => p.id !== id));notify("Property removed from inventory");}}/>}
          {page === "Follow-ups" && <TasksPage tasks={tasks} onToggle={toggleTask} onAdd={() => setModal("task")}/>}
          {page === "Site Visits" && <VisitsPage visits={visits} onStatus={updateVisitStatus} onAdd={() => setModal("visit")}/>}
          {page === "Campaigns" && <CampaignsPage leads={leads} campaigns={campaigns} onAdd={() => setModal("campaign")} onDelete={(id) => {setCampaigns(current => current.filter(c => c.id !== id));notify("Campaign deleted");}}/>}
          {page === "Team" && <TeamPage team={team} onAdd={() => setModal("member")}/>}
          {page === "Reports" && <ReportsPage leads={leads} visits={visits} properties={properties} tasks={tasks} onExport={exportReport}/>}
          {page === "Settings" && <SettingsPage tab={settingsTab} setTab={setSettingsTab} name={workspaceName} setName={setWorkspaceName} email={workspaceEmail} setEmail={setWorkspaceEmail} currency={currency} setCurrency={setCurrency} notifications={notifications} setNotifications={setNotifications} onReset={resetDemo} onSave={() => notify("Settings saved in this browser session")}/>}
        </>}
      </section>
    </main>
    {selectedLead && <LeadDrawer lead={selectedLead} properties={properties} onClose={() => setSelectedLead(null)} onSave={(updated) => {patchLead(updated);setSelectedLead(updated);notify("Lead details updated");}} onDelete={deleteLead} onAddTask={(lead) => {setSelectedLead(null);setModal("task");setTimeout(() => { const input = document.querySelector<HTMLInputElement>("#task-lead-name"); if (input) input.value = lead.name; }, 0);}}/>}
    {modal && <Modal kind={modal} leads={leads} properties={properties} onClose={() => setModal(null)} onLead={createLead} onProperty={createProperty} onTask={createTask} onVisit={createVisit} onMember={createMember} onCampaign={createCampaign}/>}
    {toast && <div className="toast" role="status"><CheckCircle2 size={17}/>{toast}</div>}
  </div>;
}

function NavButton({ item, active, onClick, count }: { item: {name: Page; icon: typeof LayoutDashboard}; active: boolean; onClick: () => void; count?: number }) {
  const Icon = item.icon;
  return <button className={"nav-item " + (active ? "active" : "")} onClick={onClick}><Icon size={17} strokeWidth={1.8}/><span>{item.name}</span>{count !== undefined && count > 0 && <em>{count}</em>}</button>;
}
function pageDescription(page: Page) {
  const descriptions: Record<Page,string> = {
    Dashboard:"Your real estate business at a glance.", "Manage Leads":"Capture, organize, and convert every enquiry.",
    Properties:"Manage inventory and match the right home to every buyer.", "Follow-ups":"Stay on top of calls, reminders, and customer meetings.",
    "Site Visits":"Schedule property tours and track customer attendance.", Campaigns:"Understand where enquiries come from and what converts.",
    Team:"See agent activity, lead distribution, and progress towards targets.", Reports:"Measure lead quality, pipeline health, and sales performance.",
    Settings:"Configure your workspace and manage your preferences.",
  }; return descriptions[page];
}
function StatCard({ title, value, note, trend, icon: Icon, tone = "green" }: {title:string;value:string|number;note:string;trend?:string;icon:typeof Users;tone?:string}) {
  return <article className="stat-card"><div className="stat-top"><span>{title}</span><span className={"stat-icon "+tone}><Icon size={17}/></span></div><div className="stat-value">{value}</div><div className="stat-note">{trend && <span className={trend.startsWith("↘") ? "trend-down" : "trend-up"}>{trend}</span>}<span>{note}</span></div></article>;
}
function Dashboard({leads,tasks,visits,onOpenLead,onGo,onNewTask}:{leads:Lead[];tasks:Task[];visits:SiteVisit[];onOpenLead:(lead:Lead)=>void;onGo:(page:Page)=>void;onNewTask:()=>void}) {
  const booked = leads.filter((l) => l.status === "Booked").length;
  const openTasks = tasks.filter((t) => !t.completed);
  const stages: {label:LeadStatus;count:number;color:string}[] = [
    {label:"New",count:leads.filter((l)=>l.status==="New").length,color:"#2b705a"},
    {label:"Contacted",count:leads.filter((l)=>l.status==="Contacted").length,color:"#8eb8a4"},
    {label:"Visit Scheduled",count:leads.filter((l)=>l.status==="Visit Scheduled").length,color:"#e5b17f"},
    {label:"Negotiation",count:leads.filter((l)=>l.status==="Negotiation").length,color:"#a994c8"},
  ];
  const total = stages.reduce((sum,s)=>sum+s.count,0) || 1;
  return <>
    <div className="stats-grid">
      <StatCard title="Total leads" value={leads.length} note="in your workspace" trend="↗ Live" icon={Users}/>
      <StatCard title="New enquiries" value={leads.filter((l)=>l.status==="New").length} note="need first contact" icon={Sparkles} tone="orange"/>
      <StatCard title="Site visits" value={visits.length} note="scheduled visits" trend="↗ Active" icon={MapPin} tone="blue"/>
      <StatCard title="Bookings" value={booked} note="confirmed in CRM" icon={Home} tone="purple"/>
    </div>
    <div className="dashboard-grid">
      <section className="panel"><PanelHeading title="Lead activity" subtitle="Sample enquiry trend across the month" right={<select className="select-control" defaultValue="30 days"><option>30 days</option><option>7 days</option><option>90 days</option></select>}/><LeadTrendChart/><div className="panel-foot"><span>Local demo data</span><span><b>{leads.length}</b> saved lead records</span></div></section>
      <section className="panel"><PanelHeading title="Lead pipeline" subtitle="Leads by current stage" right={<button className="icon-button" onClick={()=>onGo("Manage Leads")} aria-label="View leads"><ArrowRight size={16}/></button>}/><div className="pipeline-layout"><div className="donut-chart" style={{background:stageGradient(stages,total)}}><div className="donut-inner"><b>{leads.length}</b><span>Total leads</span></div></div><div className="pipeline-legend">{stages.map((stage)=><div className="pipeline-row" key={stage.label}><i style={{background:stage.color}}/><span>{stage.label}</span><b>{stage.count}</b></div>)}</div></div><div className="panel-foot"><span>Booked leads</span><b>{booked}</b></div></section>
    </div>
    <div className="dashboard-grid lower-grid">
      <section className="panel panel-no-pad"><PanelHeading title="Recent leads" subtitle="The latest enquiries in your workspace" right={<div className="inline-actions"><button className="btn secondary btn-small" onClick={()=>onGo("Manage Leads")}>View all</button><button className="btn primary btn-small" onClick={()=>onGo("Manage Leads")}><Plus size={14}/> Manage</button></div>}/><LeadTable leads={[...leads].slice(0,5)} onOpen={onOpenLead} compact/><div className="panel-foot pad-foot"><span>Showing {Math.min(5,leads.length)} recent leads</span><button className="text-button" onClick={()=>onGo("Manage Leads")}>All leads <ArrowRight size={13}/></button></div></section>
      <section className="panel"><PanelHeading title="Today's follow-ups" subtitle="Your next actions" right={<button className="text-button" onClick={()=>onGo("Follow-ups")}>View schedule <ArrowRight size={13}/></button>}/>{openTasks.length ? <div className="activity-list">{openTasks.slice(0,4).map((task)=><div className="activity-item" key={task.id}><span className="activity-icon">{task.kind==="Site visit"?<MapPin size={15}/>:task.kind==="Email"?<Mail size={15}/>:<Phone size={15}/>}</span><div className="activity-copy"><b>{task.title}</b><p>{task.description}</p><small>{task.due}</small></div></div>)}</div>:<EmptyState title="All caught up" text="There are no open follow-ups right now."/>}<div className="panel-foot"><span>{openTasks.length} open tasks</span><button className="text-button" onClick={onNewTask}><Plus size={13}/> New task</button></div></section>
    </div>
  </>;
}
function stageGradient(stages:{count:number;color:string}[],total:number) {
  let pos=0; const parts=stages.map((stage)=>{const start=pos;pos+=stage.count/total*100;return stage.color+" "+start+"% "+pos+"%";});
  if(pos<100)parts.push("#e1e9e4 "+pos+"% 100%");
  return "conic-gradient("+parts.join(",")+")";
}
function LeadTrendChart() {
  const values=[24,31,28,42,37,50,45,62,57,72,66,84];
  return <div className="trend-chart"><div className="chart-y-labels"><span>100</span><span>75</span><span>50</span><span>25</span><span>0</span></div><div className="chart-area"><div className="chart-grid-lines"><i/><i/><i/><i/><i/></div><svg viewBox="0 0 600 200" preserveAspectRatio="none" aria-label="Illustrative lead trend"><defs><linearGradient id="leadArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#347b62" stopOpacity=".18"/><stop offset="100%" stopColor="#347b62" stopOpacity="0"/></linearGradient></defs><path d={"M "+values.map((v,i)=>(i*600/(values.length-1))+" "+(190-v*1.7)).join(" L ")+" L 600 200 L 0 200 Z"} fill="url(#leadArea)"/><path d={"M "+values.map((v,i)=>(i*600/(values.length-1))+" "+(190-v*1.7)).join(" L ")} fill="none" stroke="#347b62" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg><div className="chart-x-labels">{["01 Oct","03 Oct","05 Oct","07 Oct","09 Oct","11 Oct","13 Oct","15 Oct","17 Oct","19 Oct","21 Oct","23 Oct"].map((d)=><span key={d}>{d}</span>)}</div></div></div>;
}
function PanelHeading({title,subtitle,right}:{title:string;subtitle:string;right?:ReactNode}){return <div className="panel-heading"><div><h2>{title}</h2><p>{subtitle}</p></div>{right&&<div className="panel-heading-right">{right}</div>}</div>}
function LeadTable({leads,onOpen,compact=false,onDelete}:{leads:Lead[];onOpen:(lead:Lead)=>void;compact?:boolean;onDelete?:(id:string)=>void}) {
  return <div className="table-scroll"><table className="data-table"><thead><tr>{!compact&&<th><input aria-label="Select all leads" type="checkbox"/></th>}<th>Lead</th><th>Interested in</th><th>Source</th><th>Status</th><th>Assigned to</th><th>Next follow-up</th>{!compact&&<th/>}</tr></thead><tbody>{leads.map((lead)=><tr key={lead.id}>{!compact&&<td><input type="checkbox" aria-label={"Select "+lead.name}/></td>}<td><button className="lead-cell" onClick={()=>onOpen(lead)}><span className="mini-avatar">{initials(lead.name)}</span><span><b>{lead.name}</b><small>{lead.phone}</small></span></button></td><td><span className="table-main">{lead.propertyType}</span><small className="table-sub">{lead.area}</small></td><td><span className="source-chip">{lead.source}</span></td><td><StatusBadge status={lead.status}/></td><td>{lead.agent}</td><td>{lead.nextFollowUp}</td>{!compact&&<td><button className="icon-button tiny" onClick={()=>onOpen(lead)} aria-label={"View "+lead.name}><Eye size={14}/></button></td>}</tr>)}</tbody></table>{leads.length===0&&<EmptyState title="No leads found" text="Try changing your filters or add a new lead."/>}</div>;
}
function StatusBadge({status}:{status:string}){return <span className={"status-badge status-"+statusClass(status)}><i/>{status}</span>}
function EmptyState({title,text}:{title:string;text:string}){return <div className="empty-state"><span><ClipboardList size={21}/></span><b>{title}</b><p>{text}</p></div>}
function LeadsPage({leads,allCount,search,setSearch,status,setStatus,source,setSource,onOpenLead,onBulkStatus,onExport,onAdd,onDelete}:{leads:Lead[];allCount:number;search:string;setSearch:(s:string)=>void;status:string;setStatus:(s:string)=>void;source:string;setSource:(s:string)=>void;onOpenLead:(lead:Lead)=>void;onBulkStatus:(ids:string[],status:LeadStatus)=>void;onExport:()=>void;onAdd:()=>void;onDelete:(id:string)=>void}) {
  const [selected,setSelected]=useState<string[]>([]);
  const toggleAll=(checked:boolean)=>setSelected(checked?leads.map(l=>l.id):[]);
  const bulkStatus=(value:LeadStatus)=>{if(!selected.length)return;onBulkStatus(selected,value);setSelected([])};
  return <section className="panel panel-no-pad"><div className="panel-heading panel-heading-pad"><PanelHeading title={"All leads · "+allCount} subtitle="Manage enquiries, track intent, and keep every follow-up visible." right={<button className="btn secondary btn-small" onClick={onExport}><Download size={14}/> Export CSV</button>}/></div><div className="filters-row"><label className="search-box"><Search size={15}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, phone, area…"/>{search&&<button onClick={()=>setSearch("")} aria-label="Clear search"><X size={14}/></button>}</label><select className="select-control" value={status} onChange={e=>setStatus(e.target.value)}><option value="">All statuses</option>{statuses.map(s=><option key={s}>{s}</option>)}</select><select className="select-control" value={source} onChange={e=>setSource(e.target.value)}><option value="">All sources</option>{sources.map(s=><option key={s}>{s}</option>)}</select><button className="btn secondary btn-small" onClick={()=>{setSearch("");setStatus("");setSource("");}}><SlidersHorizontal size={14}/> Reset</button><button className="btn primary btn-small" onClick={onAdd}><Plus size={14}/> Add lead</button></div>{selected.length>0&&<div className="bulk-toolbar"><span>{selected.length} selected</span><select className="select-control" defaultValue="" onChange={e=>{if(e.target.value)bulkStatus(e.target.value as LeadStatus)}}><option value="" disabled>Change status…</option>{statuses.map(s=><option key={s}>{s}</option>)}</select><button className="text-button" onClick={()=>setSelected([])}>Clear selection</button></div>}<div className="table-scroll"><table className="data-table"><thead><tr><th><input type="checkbox" checked={leads.length>0&&selected.length===leads.length} onChange={e=>toggleAll(e.target.checked)} aria-label="Select all visible leads"/></th><th>Lead</th><th>Interested in</th><th>Source</th><th>Status</th><th>Assigned to</th><th>Next follow-up</th><th>View</th></tr></thead><tbody>{leads.map(lead=><tr key={lead.id}><td><input type="checkbox" checked={selected.includes(lead.id)} onChange={e=>setSelected(old=>e.target.checked?[...old,lead.id]:old.filter(id=>id!==lead.id))} aria-label={"Select "+lead.name}/></td><td><button className="lead-cell" onClick={()=>onOpenLead(lead)}><span className="mini-avatar">{initials(lead.name)}</span><span><b>{lead.name}</b><small>{lead.phone}</small></span></button></td><td><span className="table-main">{lead.propertyType}</span><small className="table-sub">{lead.area}</small></td><td><span className="source-chip">{lead.source}</span></td><td><StatusBadge status={lead.status}/></td><td>{lead.agent}</td><td>{lead.nextFollowUp}</td><td><button className="icon-button tiny" onClick={()=>onOpenLead(lead)} aria-label={"Open "+lead.name}><Eye size={14}/></button><button className="icon-button tiny danger-icon" onClick={()=>onDelete(lead.id)} aria-label={"Delete "+lead.name}><Trash2 size={14}/></button></td></tr>)}</tbody></table>{leads.length===0&&<EmptyState title="No leads found" text="Try changing your filters or add a new lead."/>}</div><div className="table-footer"><span>Showing {leads.length} of {allCount} leads</span><span className="local-note">Saved in this browser</span></div></section>;
}
function PropertiesPage({properties,search,setSearch,typeFilter,setTypeFilter,onAdd,onDelete}:{properties:Property[];search:string;setSearch:(s:string)=>void;typeFilter:string;setTypeFilter:(s:string)=>void;onAdd:()=>void;onDelete:(id:string)=>void}) {
  return <><div className="inventory-toolbar"><label className="search-box"><Search size={15}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search properties or locations…"/></label><select className="select-control" value={typeFilter} onChange={e=>setTypeFilter(e.target.value)}><option value="">All property types</option><option>Residential</option><option>Commercial</option><option>Gated community</option></select><span className="result-count">{properties.length} properties</span><button className="btn primary" onClick={onAdd}><Plus size={15}/> Add property</button></div><div className="property-grid">{properties.map(property=><article className="property-card" key={property.id}><div className={"property-art art-"+property.color}><span className="art-building"><Building2 size={35}/></span><span className="art-tag">{property.type}</span><button className="property-delete" onClick={()=>onDelete(property.id)} aria-label={"Delete "+property.name}><Trash2 size={14}/></button></div><div className="property-body"><div className="property-title-row"><h3>{property.name}</h3><StatusBadge status={property.status}/></div><p className="property-location"><MapPin size={13}/>{property.location}</p><div className="property-price">{property.price}</div><div className="property-footer"><span>{property.configuration}</span><b>{property.availableUnits} units available</b></div></div></article>)}</div>{properties.length===0&&<EmptyState title="No properties match" text="Change your filters or add a property."/>}</>;
}
function TasksPage({tasks,onToggle,onAdd}:{tasks:Task[];onToggle:(id:string)=>void;onAdd:()=>void}) {
  const [filter,setFilter]=useState<"All"|"Open"|"Completed">("Open");
  const visible=tasks.filter(t=>filter==="All"||(filter==="Open"?!t.completed:t.completed));
  return <div className="content-grid"><section className="panel"><PanelHeading title="My task list" subtitle="Check tasks off as you complete them" right={<button className="btn primary btn-small" onClick={onAdd}><Plus size={14}/> New task</button>}/><div className="segmented">{(["Open","All","Completed"] as const).map(s=><button key={s} className={filter===s?"selected":""} onClick={()=>setFilter(s)}>{s}{s==="Open"?" · "+tasks.filter(t=>!t.completed).length:""}</button>)}</div><div className="task-list">{visible.map(task=><div className={"task-row "+(task.completed?"task-complete":"")} key={task.id}><button className={"task-checkbox "+(task.completed?"checked":"")} onClick={()=>onToggle(task.id)} aria-label={task.completed?"Mark task open":"Complete task"}>{task.completed&&<Check size={13}/>}</button><span className="task-kind">{task.kind==="Site visit"?<MapPin size={16}/>:task.kind==="Email"?<Mail size={16}/>:task.kind==="Meeting"?<CalendarDays size={16}/>:<Phone size={16}/>}</span><div className="task-copy"><b>{task.title}</b><p>{task.description}</p><small>{task.leadName}</small></div><span className="task-due"><Clock3 size={13}/>{task.due}</span><button className="icon-button tiny" onClick={()=>onToggle(task.id)} aria-label="Toggle completion"><Check size={14}/></button></div>)}</div>{visible.length===0&&<EmptyState title="Nothing here" text="No tasks in this filter."/>}</section><section className="panel"><PanelHeading title="Task overview" subtitle="Progress across your follow-ups"/><div className="task-summary"><div><span>Completed</span><b>{tasks.filter(t=>t.completed).length} / {tasks.length}</b><div className="progress-track"><i style={{width:(tasks.length?tasks.filter(t=>t.completed).length/tasks.length*100:0)+"%"}}/></div></div>{(["Call","Site visit","Email","Meeting"] as const).map(kind=><div key={kind}><span>{kind}s</span><b>{tasks.filter(t=>t.kind===kind&&!t.completed).length} open</b><div className="progress-track"><i style={{width:(tasks.filter(t=>t.kind===kind).length/Math.max(1,tasks.length)*100)+"%"}}/></div></div>)}</div></section></div>;
}
function VisitsPage({visits,onStatus,onAdd}:{visits:SiteVisit[];onStatus:(id:string,status:SiteVisit["status"])=>void;onAdd:()=>void}) {
  return <section className="panel panel-no-pad"><div className="panel-heading panel-heading-pad"><PanelHeading title="Upcoming site visits" subtitle="Coordinate property tours and customer attendance." right={<button className="btn primary btn-small" onClick={onAdd}><Plus size={14}/> Schedule visit</button>}/></div><div className="table-scroll"><table className="data-table"><thead><tr><th>Lead</th><th>Property</th><th>Date & time</th><th>Assigned agent</th><th>Status</th><th>Update</th></tr></thead><tbody>{visits.map(visit=><tr key={visit.id}><td><b>{visit.leadName}</b></td><td>{visit.propertyName}</td><td><CalendarClock size={13} className="inline-icon"/>{visit.date}</td><td>{visit.agent}</td><td><StatusBadge status={visit.status}/></td><td><select className="select-control compact-select" value={visit.status} onChange={e=>onStatus(visit.id,e.target.value as SiteVisit["status"])}>{(["Pending","Confirmed","Completed","Cancelled"] as const).map(s=><option key={s}>{s}</option>)}</select></td></tr>)}</tbody></table></div>{visits.length===0&&<EmptyState title="No visits scheduled" text="Schedule a visit when a buyer is ready to tour a property."/>}<div className="table-footer"><span>{visits.filter(v=>v.status==="Confirmed").length} confirmed · {visits.filter(v=>v.status==="Pending").length} pending</span><span className="local-note">Local demo schedule</span></div></section>;
}
function CampaignsPage({leads,campaigns,onAdd,onDelete}:{leads:Lead[];campaigns:Campaign[];onAdd:()=>void;onDelete:(id:string)=>void}) {
  const counts=sources.map(source=>({source,count:leads.filter(l=>l.source===source).length,booked:leads.filter(l=>l.source===source&&l.status==="Booked").length})).sort((a,b)=>b.count-a.count);
  const max=Math.max(1,...counts.map(c=>c.count));
  return <><div className="stats-grid"><StatCard title="Tracked leads" value={leads.length} note="across all sources" icon={Target}/><StatCard title="Campaigns" value={campaigns.length} note="saved in workspace" icon={Sparkles} tone="blue"/><StatCard title="Booked from sources" value={leads.filter(l=>l.status==="Booked").length} note="based on current leads" icon={CheckCircle2} tone="purple"/><StatCard title="Lead sources" value={sources.length} note="available categories" icon={Activity} tone="orange"/></div><section className="panel"><PanelHeading title="Lead source performance" subtitle="Volume and bookings by acquisition channel" right={<button className="btn primary btn-small" onClick={onAdd}><Plus size={14}/> New campaign</button>}/><div className="source-performance">{counts.map(c=><div className="source-performance-row" key={c.source}><div className="source-name"><span>{c.source}</span><small>{c.booked} booked</small></div><div className="progress-track"><i style={{width:(c.count/max*100)+"%"}}/></div><b>{c.count}</b></div>)}</div><p className="footnote">This view uses the lead source field. Advertising spend and cost per lead require campaign spend data or an ad-platform integration.</p></section><section className="panel campaign-table-panel"><PanelHeading title="Campaign records" subtitle="Campaigns created in this browser workspace" right={<span className="local-note">{campaigns.length} campaigns</span>}/><div className="table-scroll"><table className="data-table"><thead><tr><th>Campaign</th><th>Channel</th><th>Start date</th><th>Budget</th><th>Status</th><th/></tr></thead><tbody>{campaigns.map(c=><tr key={c.id}><td><b>{c.name}</b><small className="table-sub">{c.id}</small></td><td>{c.channel}</td><td>{c.startDate}</td><td>{fmtMoney(c.budget)}</td><td><StatusBadge status={c.status}/></td><td><button className="icon-button tiny danger-icon" onClick={()=>onDelete(c.id)} aria-label={"Delete "+c.name}><Trash2 size={14}/></button></td></tr>)}</tbody></table></div>{campaigns.length===0&&<EmptyState title="No campaigns yet" text="Create a campaign to start organizing acquisition activity."/>}</section></>;
}
function TeamPage({team,onAdd}:{team:TeamMember[];onAdd:()=>void}) {
  return <><div className="stats-grid"><StatCard title="Team members" value={team.length} note="in this workspace" icon={Users}/><StatCard title="Leads assigned" value={team.reduce((s,m)=>s+m.leads,0)} note="sample team metric" icon={Target} tone="blue"/><StatCard title="Site visits" value={team.reduce((s,m)=>s+m.visits,0)} note="sample team metric" icon={MapPin} tone="orange"/><StatCard title="Bookings" value={team.reduce((s,m)=>s+m.bookings,0)} note="sample team metric" icon={CheckCircle2} tone="purple"/></div><section className="panel panel-no-pad"><div className="panel-heading panel-heading-pad"><PanelHeading title="Sales team" subtitle="Review agent assignments and activity." right={<button className="btn primary btn-small" onClick={onAdd}><Plus size={14}/> Add member</button>}/></div><div className="table-scroll"><table className="data-table"><thead><tr><th>Team member</th><th>Role</th><th>Leads contacted</th><th>Site visits</th><th>Bookings</th><th>Target progress</th></tr></thead><tbody>{team.map(m=><tr key={m.id}><td><div className="lead-cell"><span className="mini-avatar">{m.initials}</span><span><b>{m.name}</b><small>{m.id}</small></span></div></td><td>{m.role}</td><td>{m.leads}</td><td>{m.visits}</td><td><b>{m.bookings}</b></td><td><div className="mini-progress"><i style={{width:Math.min(100,m.target)+"%"}}/></div><small className="table-sub">{m.target}% target</small></td></tr>)}</tbody></table></div></section></>;
}
function ReportsPage({leads,visits,properties,tasks,onExport}:{leads:Lead[];visits:SiteVisit[];properties:Property[];tasks:Task[];onExport:()=>void}) {
  const rate=leads.length?Math.round(leads.filter(l=>l.status==="Booked").length/leads.length*100):0;
  const reports=[{title:"Lead source report",desc:"Compare channel volume and booking contribution.",value:String(new Set(leads.map(l=>l.source)).size),unit:"active sources",icon:Target},{title:"Pipeline conversion",desc:"Share of saved leads marked as booked.",value:rate+"%",unit:"lead-to-booking",icon:TrendingUp},{title:"Agent activity",desc:"Review team, visits, and task completion.",value:String(visits.length),unit:"scheduled visits",icon:Users}];
  return <><div className="stats-grid"><StatCard title="Lead-to-booking" value={rate+"%"} note="based on current records" icon={TrendingUp}/><StatCard title="Open follow-ups" value={tasks.filter(t=>!t.completed).length} note="tasks still to do" icon={CalendarClock} tone="orange"/><StatCard title="Property inventory" value={properties.length} note="listed properties" icon={Building2} tone="blue"/><StatCard title="Visit completion" value={visits.filter(v=>v.status==="Completed").length} note="completed visits" icon={CheckCircle2} tone="purple"/></div><div className="report-grid">{reports.map(r=>{const Icon=r.icon;return <article className="report-card" key={r.title}><span className="report-icon"><Icon size={18}/></span><h3>{r.title}</h3><p>{r.desc}</p><div className="report-metric">{r.value}<small>{r.unit}</small></div><button className="text-button" onClick={onExport}>Export report <ArrowRight size={13}/></button></article>})}</div><section className="panel report-table-panel"><PanelHeading title="Lead funnel" subtitle="Current distribution across lifecycle stages"/><div className="funnel-list">{statuses.map((status)=>{const n=leads.filter(l=>l.status===status).length;return <div className="funnel-row" key={status}><span>{status}</span><div className="progress-track"><i style={{width:(n/Math.max(1,leads.length)*100)+"%"}}/></div><b>{n}</b></div>})}</div><p className="footnote">Metrics are calculated from locally stored demo records. Historical conversion and financial revenue require dated events and deal values.</p></section></>;
}
function SettingsPage({tab,setTab,name,setName,email,setEmail,currency,setCurrency,notifications,setNotifications,onReset,onSave}:{tab:string;setTab:(s:string)=>void;name:string;setName:(s:string)=>void;email:string;setEmail:(s:string)=>void;currency:string;setCurrency:(s:string)=>void;notifications:{reminders:boolean;newLeads:boolean;daily:boolean};setNotifications:(n:{reminders:boolean;newLeads:boolean;daily:boolean})=>void;onReset:()=>void;onSave:()=>void}) {
  const tabs=["Workspace","Lead management","Notifications","Integrations","Permissions"];
  return <div className="settings-layout"><nav className="settings-tabs">{tabs.map(t=><button className={tab===t?"selected":""} key={t} onClick={()=>setTab(t)}>{t}</button>)}</nav><section className="panel settings-panel">{tab==="Workspace"?<><PanelHeading title="Workspace settings" subtitle="Manage basic details for your real estate business."/><form className="settings-form" onSubmit={e=>{e.preventDefault();onSave();}}><label>Workspace name<input value={name} onChange={e=>setName(e.target.value)} required/></label><label>Business email<input value={email} onChange={e=>setEmail(e.target.value)} type="email" required/></label><label>Time zone<select defaultValue="Asia/Kolkata"><option value="Asia/Kolkata">Asia/Kolkata (IST, UTC+5:30)</option><option value="UTC">UTC</option></select></label><label>Default currency<select value={currency} onChange={e=>setCurrency(e.target.value)}><option>INR — Indian Rupee (₹)</option><option>USD — US Dollar ($)</option><option>AED — UAE Dirham</option></select></label><button className="btn primary" type="submit">Save preferences</button></form></>:tab==="Notifications"?<><PanelHeading title="Notifications" subtitle="Choose which reminders should be visible in your workspace."/><div className="settings-options">{([{key:"reminders",title:"Follow-up reminders",desc:"Remind agents before a task is due."},{key:"newLeads",title:"New lead alerts",desc:"Notify the assigned agent when a new lead is created."},{key:"daily",title:"Daily summary",desc:"Show a summary of activity each morning."}] as const).map(item=><label className="setting-toggle" key={item.key}><span><b>{item.title}</b><small>{item.desc}</small></span><input type="checkbox" checked={notifications[item.key]} onChange={e=>setNotifications({...notifications,[item.key]:e.target.checked})}/></label>)}</div><button className="btn primary" onClick={onSave}>Save preferences</button></>:tab==="Lead management"?<><PanelHeading title="Lead management" subtitle="Default rules for your lead workflow."/><div className="settings-options"><div className="setting-toggle"><span><b>Default lead status</b><small>New enquiries enter the pipeline as New.</small></span><span className="status-badge status-new">New</span></div><div className="setting-toggle"><span><b>Lead source tracking</b><small>Track the source entered on each lead.</small></span><span className="status-badge status-contacted">Enabled</span></div><div className="setting-toggle"><span><b>Duplicate detection</b><small>Phone and email checks need server-side enforcement in production.</small></span><span className="status-badge status-visit-scheduled">Demo only</span></div></div></>:tab==="Integrations"?<><PanelHeading title="Integrations" subtitle="Connect channels when you are ready to configure API credentials."/><div className="integration-list">{[["WhatsApp Business","Message customers and manage opt-in communication.","Not connected",MessageCircle],["Property portals","Capture leads from supported portals and campaigns.","Not connected",Building2],["Email & calendar","Sync meeting invitations and follow-up events.","Not connected",CalendarDays],["Calling provider","Log call outcomes and activity history.","Not connected",Phone]].map(([title,desc,status,Icon])=>{const I=Icon as typeof Phone;return <div className="integration-row" key={String(title)}><span className="integration-icon"><I size={17}/></span><span><b>{String(title)}</b><small>{String(desc)}</small></span><span className="status-badge status-lost">{String(status)}</span></div>})}</div><p className="footnote">No integrations are connected in this version. Credentials should be stored server-side when the backend phase begins.</p></>:<><PanelHeading title="Permissions" subtitle="Roles to implement before inviting real users."/><div className="role-list">{[["Administrator","Full workspace configuration and team management."],["Sales manager","Lead assignment, pipeline oversight, and reports."],["Sales agent","Assigned leads, tasks, notes, and site visits."]].map(([role,desc])=><div className="setting-toggle" key={role}><span><b>{role}</b><small>{desc}</small></span><span className="status-badge status-visit-scheduled">Plan only</span></div>)}</div><p className="footnote">This UI is not an access-control system. Real authorization must be enforced by the backend and database policies.</p></>}<div className="settings-reset"><div><b>Demo workspace data</b><small>Reset browser-saved demo records to the original examples.</small></div><button className="btn danger" onClick={onReset}>Reset demo data</button></div></section></div>;
}
function LeadDrawer({lead,properties,onClose,onSave,onDelete,onAddTask}:{lead:Lead;properties:Property[];onClose:()=>void;onSave:(lead:Lead)=>void;onDelete:(id:string)=>void;onAddTask:(lead:Lead)=>void}) {
  const [draft,setDraft]=useState<Lead>(lead);
  useEffect(()=>setDraft(lead),[lead]);
  const change=(field:"status"|"agent"|"phone"|"email"|"area"|"budget"|"propertyType"|"nextFollowUp"|"notes",value:string)=>setDraft(current=>({...current,[field]:value} as Lead));
  return <div className="drawer-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}><aside className="lead-drawer" role="dialog" aria-modal="true" aria-label={"Lead details for "+lead.name}><div className="drawer-header"><div><span className="eyebrow">LEAD PROFILE · {lead.id}</span><h2>{lead.name}</h2><p>{lead.phone}</p></div><button className="icon-button" onClick={onClose} aria-label="Close lead details"><X size={17}/></button></div><div className="drawer-person"><span className="drawer-avatar">{initials(lead.name)}</span><div><b>{lead.email || "No email provided"}</b><small>Added {lead.createdAt} · Source: {lead.source}</small></div></div><div className="drawer-stats"><div><small>Budget</small><b>{lead.budget}</b></div><div><small>Interested in</small><b>{lead.propertyType}</b></div></div><form className="drawer-form" onSubmit={e=>{e.preventDefault();onSave({...draft,activity:[{id:uid("ACT"),title:"Lead updated",description:"Lead details or follow-up updated",date:"Just now"},...draft.activity]});}}><label>Lead status<select value={draft.status} onChange={e=>change("status",e.target.value)}>{statuses.map(s=><option key={s}>{s}</option>)}</select></label><label>Assigned agent<select value={draft.agent} onChange={e=>change("agent",e.target.value)}>{agents.map(a=><option key={a}>{a}</option>)}</select></label><label>Phone number<input value={draft.phone} onChange={e=>change("phone",e.target.value)}/></label><label>Email address<input type="email" value={draft.email} onChange={e=>change("email",e.target.value)}/></label><label>Preferred area<input value={draft.area} onChange={e=>change("area",e.target.value)}/></label><label>Budget<select value={draft.budget} onChange={e=>change("budget",e.target.value)}>{budgets.map(b=><option key={b}>{b}</option>)}</select></label><label>Interested in<select value={draft.propertyType} onChange={e=>change("propertyType",e.target.value)}>{propertyTypes.map(t=><option key={t}>{t}</option>)}</select></label><label>Next follow-up<input value={draft.nextFollowUp} onChange={e=>change("nextFollowUp",e.target.value)} placeholder="e.g. Tomorrow, 11:30 AM"/></label><label>Notes<textarea value={draft.notes} onChange={e=>change("notes",e.target.value)} rows={3}/></label><div className="drawer-actions"><button type="button" className="btn secondary" onClick={()=>onAddTask(lead)}><CalendarClock size={14}/> Create task</button><button type="submit" className="btn primary">Save changes</button></div></form><div className="timeline-section"><PanelHeading title="Activity timeline" subtitle="Recent lead activity"/>{lead.activity.map(a=><div className="timeline-item" key={a.id}><span className="timeline-dot"/><div><b>{a.title}</b><p>{a.description}</p><small>{a.date}</small></div></div>)}</div><button className="delete-lead" onClick={()=>{if(window.confirm("Delete "+lead.name+" from this browser workspace?"))onDelete(lead.id);}}><Trash2 size={14}/> Delete lead</button></aside></div>;
}
function Modal({kind,leads,properties,onClose,onLead,onProperty,onTask,onVisit,onMember,onCampaign}:{kind:Exclude<ModalKind,null>;leads:Lead[];properties:Property[];onClose:()=>void;onLead:(e:FormEvent<HTMLFormElement>)=>void;onProperty:(e:FormEvent<HTMLFormElement>)=>void;onTask:(e:FormEvent<HTMLFormElement>)=>void;onVisit:(e:FormEvent<HTMLFormElement>)=>void;onMember:(e:FormEvent<HTMLFormElement>)=>void;onCampaign:(e:FormEvent<HTMLFormElement>)=>void}) {
  const titles:Record<Exclude<ModalKind,null>,string>={lead:"Add a new lead",property:"Add a property",task:"Create a follow-up",visit:"Schedule a site visit",member:"Add a team member",campaign:"Create a campaign"};
  const submit:Record<Exclude<ModalKind,null>,(e:FormEvent<HTMLFormElement>)=>void>={lead:onLead,property:onProperty,task:onTask,visit:onVisit,member:onMember,campaign:onCampaign};
  return <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className="modal-heading"><div><span className="eyebrow">LEADRAT WORKSPACE</span><h2 id="modal-title">{titles[kind]}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close dialog"><X size={17}/></button></div>
    <form onSubmit={submit[kind]}>
      {kind==="lead"&&<><div className="form-grid"><Field label="Full name" name="name" required placeholder="e.g. Aditi Sharma"/><Field label="Phone number" name="phone" required placeholder="+91 98765 43210"/><Field label="Email address" name="email" type="email" placeholder="name@example.com"/><SelectField label="Lead source" name="source" options={sources}/><SelectField label="Budget" name="budget" options={budgets}/><SelectField label="Interested in" name="propertyType" options={propertyTypes}/><Field label="Preferred area" name="area" placeholder="e.g. Thane West"/></div><label className="form-label">Notes<textarea name="notes" rows={3} placeholder="Preferred location, timeline, requirements…"/></label></>}
      {kind==="property"&&<div className="form-grid"><Field label="Property / project name" name="name" required placeholder="e.g. Greenwood Heights"/><SelectField label="Property type" name="type" options={["Residential","Commercial","Gated community"]}/><Field label="Location" name="location" required placeholder="Area, city"/><Field label="Starting price" name="price" required placeholder="e.g. ₹85 Lakh onwards"/><Field label="Configuration" name="configuration" required placeholder="e.g. 2 & 3 BHK"/><Field label="Available units" name="units" type="number" required placeholder="12"/></div>}
      {kind==="task"&&<><div className="form-grid"><Field label="Task title" name="title" required placeholder="Call buyer about pricing"/><SelectField label="Task type" name="kind" options={["Call","Site visit","Email","Meeting"]}/><Field label="Due date / time" name="due" required placeholder="Tomorrow, 11:30 AM"/><SelectField label="Related lead" name="leadName" options={["—",...leads.map(l=>l.name)]}/></div><label className="form-label">Description<textarea name="description" rows={3} placeholder="What needs to happen?"/></label></>}
      {kind==="visit"&&<div className="form-grid"><SelectField label="Lead" name="leadName" options={leads.map(l=>l.name)} required/><SelectField label="Property" name="propertyName" options={properties.map(p=>p.name)} required/><Field label="Date & time" name="date" required placeholder="Oct 25, 11:30 AM"/><SelectField label="Assigned agent" name="agent" options={agents.filter(a=>a!=="Unassigned")}/></div>}
      {kind==="member"&&<div className="form-grid"><Field label="Full name" name="name" required placeholder="Team member name"/><Field label="Email address" name="email" required type="email" placeholder="name@company.com"/><SelectField label="Role" name="role" options={["Sales Executive","Senior Sales Executive","Sales Manager","Relationship Manager"]}/></div>}
      {kind==="campaign"&&<div className="form-grid"><Field label="Campaign name" name="name" required placeholder="Monsoon Home Offers"/><SelectField label="Channel" name="channel" options={["Meta Ads","Google Ads","99acres","Magicbricks","Email","Referral"]}/><Field label="Start date" name="startDate" type="date"/><Field label="Budget (₹)" name="budget" type="number" placeholder="25000"/></div>}
      <div className="modal-footer"><button type="button" className="btn secondary" onClick={onClose}>Cancel</button><button type="submit" className="btn primary">{kind==="lead"?"Create lead":kind==="property"?"Add property":kind==="task"?"Create task":kind==="visit"?"Schedule visit":kind==="member"?"Add member":"Save campaign"} <ArrowRight size={14}/></button></div>
    </form>
  </section></div>;
}
function Field({label,name,required=false,placeholder="",type="text"}:{label:string;name:string;required?:boolean;placeholder?:string;type?:string}){return <label className="form-label">{label}<input name={name} type={type} required={required} placeholder={placeholder}/></label>}
function SelectField({label,name,options,required=false}:{label:string;name:string;options:string[];required?:boolean}){return <label className="form-label">{label}<select name={name} required={required}>{options.map(option=><option key={option} value={option}>{option}</option>)}</select></label>}
