 "use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Candidate = { id: string; name: string; position: string; bio: string; votes: number };
type Election = {
  id: string; title: string; organization: string; description: string;
  status: "Draft" | "Open" | "Closed"; published: boolean; candidates: Candidate[];
  votedBy: string[];
};
type Role = "Super Admin" | "Organization Admin" | "Voter";

const seed: Election[] = [
  {
    id: "election-1", title: "Student Council Election 2026", organization: "Vignan Demo College",
    description: "Choose the next student council representative.", status: "Open", published: false,
    candidates: [
      { id: "c1", name: "Aarav Sharma", position: "Student President", bio: "Focused on student activities and campus clubs.", votes: 12 },
      { id: "c2", name: "Meera Rao", position: "Student President", bio: "Supports student wellbeing and academic events.", votes: 18 },
      { id: "c3", name: "Kiran Reddy", position: "Student President", bio: "Promotes volunteering and inclusive events.", votes: 9 }
    ], votedBy: []
  },
  {
    id: "election-2", title: "Tech Club Lead", organization: "Vignan Demo College",
    description: "Select a lead for the technology club.", status: "Draft", published: false,
    candidates: [
      { id: "c4", name: "Ananya Das", position: "Club Lead", bio: "Organizes coding sessions and workshops.", votes: 0 },
      { id: "c5", name: "Rohan Kumar", position: "Club Lead", bio: "Builds project teams and peer mentoring.", votes: 0 }
    ], votedBy: []
  }
];

const demoUsers: { label: string; role: Role; email: string }[] = [
  { label: "Super Admin", role: "Super Admin", email: "superadmin@demo.com" },
  { label: "Organization Admin", role: "Organization Admin", email: "admin@demo.com" },
  { label: "Voter", role: "Voter", email: "voter@demo.com" }
];

export default function Home() {
  const [role, setRole] = useState<Role>("Voter");
  const [userEmail, setUserEmail] = useState("voter@demo.com");
  const [elections, setElections] = useState<Election[]>(seed);
  const [loaded, setLoaded] = useState(false);
  const [view, setView] = useState<"overview" | "elections" | "results">("overview");
  const [notice, setNotice] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newOrg, setNewOrg] = useState("My Organization");
  const [newDescription, setNewDescription] = useState("");
  const [candidateNames, setCandidateNames] = useState("Candidate One, Candidate Two");
  const [search, setSearch] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("civicvote-elections");
      if (saved) setElections(JSON.parse(saved) as Election[]);
    } catch { /* start with demo seed data */ }
    const savedRole = localStorage.getItem("civicvote-role") as Role | null;
    if (savedRole && ["Super Admin", "Organization Admin", "Voter"].includes(savedRole)) {
      setRole(savedRole);
      const account = demoUsers.find(u => u.role === savedRole);
      if (account) setUserEmail(account.email);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem("civicvote-elections", JSON.stringify(elections));
  }, [elections, loaded]);

  const activeCount = elections.filter(e => e.status === "Open").length;
  const totalVotes = elections.reduce((sum, e) => sum + e.candidates.reduce((s, c) => s + c.votes, 0), 0);
  const visibleElections = useMemo(
    () => elections.filter(e => `${e.title} ${e.organization}`.toLowerCase().includes(search.toLowerCase())),
    [elections, search]
  );

  function switchRole(next: Role) {
    setRole(next);
    const account = demoUsers.find(u => u.role === next)!;
    setUserEmail(account.email);
    localStorage.setItem("civicvote-role", next);
    setNotice(`Demo role switched to ${next}. This is not real authentication.`);
    setView("overview");
  }

  function createElection(event: FormEvent) {
    event.preventDefault();
    const names = candidateNames.split(",").map(n => n.trim()).filter(Boolean);
    if (!newTitle.trim() || names.length < 2) {
      setNotice("Enter an election title and at least two candidate names.");
      return;
    }
    const election: Election = {
      id: `e-${Date.now()}`, title: newTitle.trim(), organization: newOrg.trim() || "My Organization",
      description: newDescription.trim() || "Organizational election.", status: "Draft", published: false,
      candidates: names.map((name, index) => ({
        id: `c-${Date.now()}-${index}`, name, position: "Representative", bio: "Candidate profile",
        votes: 0
      })), votedBy: []
    };
    setElections(prev => [election, ...prev]);
    setShowCreate(false);
    setNewTitle(""); setNewDescription(""); setCandidateNames("Candidate One, Candidate Two");
    setNotice("Election created as Draft. Open it when you are ready to demo voting.");
    setView("elections");
  }

  function updateElection(id: string, update: Partial<Election>, message: string) {
    setElections(prev => prev.map(e => e.id === id ? { ...e, ...update } : e));
    setNotice(message);
  }

  function castVote(electionId: string, candidateId: string) {
    const election = elections.find(e => e.id === electionId);
    if (!election || election.status !== "Open") return setNotice("This election is not open.");
    if (election.votedBy.includes(userEmail)) return setNotice("This demo account has already voted in this election.");
    setElections(prev => prev.map(e => e.id !== electionId ? e : {
      ...e,
      candidates: e.candidates.map(c => c.id === candidateId ? { ...c, votes: c.votes + 1 } : c),
      votedBy: [...e.votedBy, userEmail]
    }));
    setNotice("Demo vote recorded. Remember: browser storage is not secure enough for a real election.");
  }

  function resetDemo() {
    setElections(seed);
    localStorage.removeItem("civicvote-elections");
    setNotice("Demo data reset to the original sample elections.");
    setView("overview");
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#" onClick={() => setView("overview")}>
          <span className="brand-mark">CV</span><span>Civic<span className="brand-light">Vote</span><small>SMART ELECTIONS</small></span>
        </a>
        <div className="workspace-label">WORKSPACE</div>
        <button className={`nav-item ${view === "overview" ? "selected" : ""}`} onClick={() => setView("overview")}><span>▦</span> Overview</button>
        <button className={`nav-item ${view === "elections" ? "selected" : ""}`} onClick={() => setView("elections")}><span>☷</span> Elections <span className="nav-count">{elections.length}</span></button>
        <button className={`nav-item ${view === "results" ? "selected" : ""}`} onClick={() => setView("results")}><span>▥</span> Results</button>
        <div className="sidebar-bottom">
          <div className="demo-note"><span className="dot" /> Prototype mode <p>Demo data only. Not for real elections.</p></div>
          <button className="nav-item" onClick={resetDemo}><span>↻</span> Reset demo data</button>
          <div className="profile">
            <div className="avatar">{role === "Voter" ? "V" : role === "Super Admin" ? "S" : "A"}</div>
            <div className="profile-info"><strong>{role}</strong><span>{userEmail}</span></div>
            <span className="profile-menu">•••</span>
          </div>
        </div>
      </aside>

      <section className="main-area">
        <header className="topbar">
          <div className="breadcrumb">Workspace <span>/</span> <strong>{view === "overview" ? "Overview" : view === "elections" ? "Elections" : "Results"}</strong></div>
          <div className="top-actions">
            <span className="prototype-pill"><span className="dot" /> DEMO ENVIRONMENT</span>
            <label className="role-select-label">Preview as
              <select value={role} onChange={e => switchRole(e.target.value as Role)} aria-label="Preview as role">
                {demoUsers.map(u => <option key={u.role} value={u.role}>{u.label}</option>)}
              </select>
            </label>
          </div>
        </header>

        <div className="content">
          {notice && <div className="notice" role="status"><span>{notice}</span><button onClick={() => setNotice("")} aria-label="Dismiss notification">×</button></div>}

          {view === "overview" && <>
            <div className="welcome-row">
              <div><div className="eyebrow">MONDAY, OCTOBER 19, 2026 · DEMO WORKSPACE</div><h1>Good to see you again<span className="blue">.</span></h1><p>Here&apos;s what&apos;s happening across your organization elections.</p></div>
              {role !== "Voter" && <button className="primary-btn" onClick={() => setShowCreate(true)}>＋ Create election</button>}
            </div>
            <div className="stats-grid">
              <Stat label="Total elections" value={String(elections.length).padStart(2, "0")} note="Across this workspace" icon="▤" />
              <Stat label="Currently open" value={String(activeCount).padStart(2, "0")} note="Accepting demo votes" icon="◉" />
              <Stat label="Votes recorded" value={String(totalVotes).padStart(2, "0")} note="Sample + demo votes" icon="✓" />
              <Stat label="Organizations" value="01" note="Demo organization" icon="⌂" />
            </div>
            <div className="section-heading"><div><h2>{role === "Voter" ? "Available elections" : "Election activity"}</h2><p>{role === "Voter" ? "Choose an open election to cast your demo vote." : "Manage elections and monitor participation."}</p></div><button className="text-btn" onClick={() => setView("elections")}>View all elections →</button></div>
            <ElectionList elections={visibleElections.slice(0, 3)} role={role} userEmail={userEmail} onVote={castVote} onStatus={(e, status) => updateElection(e.id, { status }, `Election status changed to ${status}.`)} onPublish={e => updateElection(e.id, { published: true }, "Results published.")} />
            <div className="bottom-grid">
              <div className="panel quick-panel"><div className="panel-heading"><div><h3>Quick actions</h3><p>Common tasks for your workspace</p></div><span className="icon-square">✦</span></div>
                {role !== "Voter" ? <button className="quick-action" onClick={() => setShowCreate(true)}><span className="quick-icon">＋</span><span><strong>Create an election</strong><small>Set up a new organizational election</small></span><b>→</b></button> : <button className="quick-action" onClick={() => setView("elections")}><span className="quick-icon">☷</span><span><strong>Browse elections</strong><small>Find an open election to participate in</small></span><b>→</b></button>}
                <button className="quick-action" onClick={() => setView("results")}><span className="quick-icon">▥</span><span><strong>View election results</strong><small>Review published election outcomes</small></span><b>→</b></button>
              </div>
              <div className="panel safety-panel"><div className="safety-icon">♧</div><h3>Your elections, organized.</h3><p>This prototype demonstrates the workflow for non-government organizations, colleges, clubs, and associations.</p><div className="safety-divider"/><div className="safety-foot"><span className="dot"/> Prototype only <span>•</span> Security not audited</div></div>
            </div>
          </>}

          {view === "elections" && <>
            <div className="welcome-row"><div><div className="eyebrow">WORKSPACE MANAGEMENT</div><h1>Elections<span className="blue">.</span></h1><p>Browse, manage, and participate in organization elections.</p></div>{role !== "Voter" && <button className="primary-btn" onClick={() => setShowCreate(true)}>＋ Create election</button>}</div>
            <div className="filter-row"><div className="search-box"><span>⌕</span><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search elections or organizations..." /></div><span className="result-count">{visibleElections.length} elections</span></div>
            <ElectionList elections={visibleElections} role={role} userEmail={userEmail} onVote={castVote} onStatus={(e, status) => updateElection(e.id, { status }, `Election status changed to ${status}.`)} onPublish={e => updateElection(e.id, { published: true }, "Results published.")} />
          </>}

          {view === "results" && <>
            <div className="welcome-row"><div><div className="eyebrow">TRANSPARENCY & REPORTING</div><h1>Election results<span className="blue">.</span></h1><p>Only elections with published results are shown to voters.</p></div></div>
            <div className="results-grid">
              {elections.filter(e => e.published || role !== "Voter").map(e => {
                const total = e.candidates.reduce((s,c) => s+c.votes, 0);
                return <div className="panel result-panel" key={e.id}><div className="result-title"><div><h3>{e.title}</h3><p>{e.organization}</p></div><Status status={e.published ? "Published" : e.status}/></div>
                  {role === "Voter" && !e.published ? <p className="muted">Results have not been published yet.</p> : <>
                    <div className="result-total"><strong>{total}</strong><span>total votes recorded</span></div>
                    {e.candidates.slice().sort((a,b) => b.votes-a.votes).map(c => <div className="bar-row" key={c.id}><div className="bar-label"><span>{c.name}</span><strong>{c.votes} <small>votes</small></strong></div><div className="bar-track"><div className="bar-fill" style={{width: `${total ? (c.votes/total)*100 : 0}%`}}/></div></div>)}
                    {role !== "Voter" && !e.published && <button className="primary-btn small" onClick={() => updateElection(e.id,{published:true},"Results published.")}>Publish results</button>}
                  </>}
                </div>
              })}
              {elections.filter(e => e.published || role !== "Voter").length === 0 && <div className="empty-state"><h3>No published results yet</h3><p>Results will appear here when an administrator publishes them.</p></div>}
            </div>
          </>}
        </div>
        <footer className="footer"><span>© 2026 CivicVote Prototype</span><span><span className="dot"/> Demo mode · Do not use for real elections</span></footer>
      </section>

      {showCreate && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setShowCreate(false); }}>
        <form className="modal" onSubmit={createElection}>
          <div className="modal-top"><div><div className="eyebrow">ELECTION SETUP</div><h2>Create an election</h2><p>Set up a sample election in your workspace.</p></div><button type="button" className="close-btn" onClick={() => setShowCreate(false)}>×</button></div>
          <label>Election name<input required value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="e.g. Student Council Election 2026"/></label>
          <label>Organization<input value={newOrg} onChange={e => setNewOrg(e.target.value)} placeholder="Organization name"/></label>
          <label>Description<textarea value={newDescription} onChange={e => setNewDescription(e.target.value)} placeholder="What is this election for?"/></label>
          <label>Candidate names <span className="field-hint">(separate with commas; at least two)</span><textarea required value={candidateNames} onChange={e => setCandidateNames(e.target.value)} /></label>
          <div className="modal-warning">New elections start as Draft. Open the election to enable demo voting.</div>
          <div className="modal-actions"><button type="button" className="secondary-btn" onClick={() => setShowCreate(false)}>Cancel</button><button type="submit" className="primary-btn">Create election</button></div>
        </form>
      </div>}
    </main>
  );
}

function Stat({ label, value, note, icon }: { label: string; value: string; note: string; icon: string }) {
  return <div className="stat-card"><div className="stat-top"><span>{label}</span><span className="stat-icon">{icon}</span></div><div className="stat-value">{value}</div><div className="stat-note"><span className="mini-check">↗</span>{note}</div></div>;
}
function Status({ status }: { status: string }) {
  const cls = status.toLowerCase().replaceAll(" ", "-");
  return <span className={`status status-${cls}`}><span/> {status}</span>;
}
function ElectionList({ elections, role, userEmail, onVote, onStatus, onPublish }: {
  elections: Election[]; role: Role; userEmail: string;
  onVote: (electionId: string, candidateId: string) => void;
  onStatus: (election: Election, status: Election["status"]) => void;
  onPublish: (election: Election) => void;
}) {
  if (!elections.length) return <div className="empty-state"><h3>No elections found</h3><p>Create an election or try a different search.</p></div>;
  return <div className="election-list">{elections.map(e => {
    const total = e.candidates.reduce((s,c) => s+c.votes,0);
    const alreadyVoted = e.votedBy.includes(userEmail);
    return <article className="election-card" key={e.id}>
      <div className="election-main"><div className="election-symbol">▤</div><div className="election-info"><div className="election-title-row"><h3>{e.title}</h3><Status status={e.published ? "Published" : e.status}/></div><p>{e.organization} <span>·</span> {e.description}</p><div className="election-meta"><span>♙ {e.candidates.length} candidates</span><span>◉ {total} votes</span></div></div></div>
      {role === "Voter" ? <div className="candidate-area">
        {e.status !== "Open" ? <div className="inline-info">{e.published ? "Results are published." : "Voting is not currently open."}</div> : alreadyVoted ? <div className="inline-info success">✓ You have voted in this demo election.</div> : <div className="candidate-options"><span className="candidate-prompt">Choose a candidate to cast your demo vote:</span>{e.candidates.map(c => <button className="candidate-btn" key={c.id} onClick={() => onVote(e.id,c.id)}><span className="candidate-avatar">{c.name.charAt(0)}</span><span>{c.name}<small>{c.position}</small></span><b>Vote →</b></button>)}</div>}
        {e.published && <div className="inline-info">Results are available in the Results tab.</div>}
      </div> : <div className="admin-actions">
        <label className="status-control">Status <select value={e.status} onChange={ev => onStatus(e, ev.target.value as Election["status"])}><option>Draft</option><option>Open</option><option>Closed</option></select></label>
        {!e.published && <button className="secondary-btn small" onClick={() => onPublish(e)}>Publish results</button>}
      </div>}
    </article>;
  })}</div>;
}
