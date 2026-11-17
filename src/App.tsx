import { useState, type FormEvent } from "react";
import applicantAvatar from "./assets/applicant-avatar.png";
import applicantRowCarlos from "./assets/applicant-row-carlos.svg";
import applicantRowEmily from "./assets/applicant-row-emily.svg";
import applicantRowSmith from "./assets/applicant-row-smith.svg";
import applicantRowStudent from "./assets/applicant-row-student.svg";
import applicantUserIcon from "./assets/applicant-user.svg";
import briefcaseIcon from "./assets/briefcase.svg";
import fileIcon from "./assets/file-icon-a.svg";
import menuIcon from "./assets/menu.svg";

const dashboardActions = [
  { id: "profile", label: "Profile", icon: "profile" },
  { id: "applicants", label: "View Applicants", icon: "search" },
  { id: "posts", label: "Posts", icon: "posts" },
  { id: "logout", label: "Log Out", icon: "logout" },
] as const;

type DashboardAction = (typeof dashboardActions)[number];
type Screen = "login" | "dashboard" | "applicants" | "applicant" | "decision";
type ApplicationStatus = "PENDING" | "ACCEPTED" | "DECLINED";

interface Applicant {
  id: string;
  name: string;
  major: string;
  concentration: string;
  academicYear: string;
  match: number;
  about: string;
  resume: {
    education: string;
    experience: string;
    skills: string[];
  };
}

interface ResearchListing {
  id: string;
  title: string;
  department: string;
  submittedAt: string;
}

interface ApplicantApplication {
  id: string;
  applicantId: string;
  listingId: string;
  submittedAt: string;
  status: ApplicationStatus;
  decisionReason?: string;
}

interface DecisionResult {
  applicantId: string;
  applicantName: string;
  listingTitle: string;
  status: Exclude<ApplicationStatus, "PENDING">;
  reason?: string;
}

const applicants: Applicant[] = [
  {
    id: "emily",
    name: "Emily Evans",
    major: "Computer Science",
    concentration: "Cybersecurity",
    academicYear: "Senior",
    match: 97,
    about:
      "I am a very interesting student who loves learning about research. I really want this research opportunity. It would help me a lot.",
    resume: {
      education: "B.S. Computer Science, Senior",
      experience: "Research assistant — Secure Systems Lab",
      skills: ["Python", "Network security", "Technical writing"],
    },
  },
  {
    id: "college-c",
    name: "College C. Student",
    major: "Computer Science",
    concentration: "Systems and Networks",
    academicYear: "Junior",
    match: 82,
    about:
      "It's me, a really cool student! I like being a really cool student! If you want a really cool student, pick me!",
    resume: {
      education: "B.S. Computer Science, Junior",
      experience: "Course project — Distributed computing",
      skills: ["Java", "Linux", "Systems administration"],
    },
  },
  {
    id: "smith",
    name: "College Student Smith",
    major: "Computer Science",
    concentration: "Systems and Networks",
    academicYear: "Freshman",
    match: 94,
    about: "Some stuff about me, very interesting student, more information.",
    resume: {
      education: "B.S. Computer Science, Freshman",
      experience: "Course project — Campus network monitor",
      skills: ["C++", "Computer networks", "Problem solving"],
    },
  },
  {
    id: "carlos",
    name: "Carlos Cernan",
    major: "Computer Science",
    concentration: "Human-Computer Interaction",
    academicYear: "Senior",
    match: 90,
    about:
      "WOW! I am such a good student, I love Computer Science and more!",
    resume: {
      education: "B.S. Computer Science, Senior",
      experience: "UX research intern — Tech Corp",
      skills: ["User research", "Prototyping", "Accessibility"],
    },
  },
];

const listings: ResearchListing[] = [
  { id: "opportunity-1", title: "Opportunity 1", department: "Computer Science Dept.", submittedAt: "Oct 12" },
  { id: "opportunity-2", title: "Opportunity 2", department: "Computer Science Dept.", submittedAt: "Oct 12" },
  { id: "opportunity-3", title: "Opportunity 3", department: "Tech Corp", submittedAt: "Oct 08" },
  { id: "opportunity-4", title: "Opportunity 4", department: "StartUp Inc.", submittedAt: "Sep 28" },
  { id: "opportunity-5", title: "Opportunity 5", department: "Tech Corp", submittedAt: "Oct 08" },
  { id: "opportunity-6", title: "Opportunity 6", department: "StartUp Inc.", submittedAt: "Sep 28" },
  { id: "opportunity-7", title: "Opportunity 7", department: "Tech Corp", submittedAt: "Oct 08" },
  { id: "opportunity-8", title: "Opportunity 8", department: "Computer Science Dept.", submittedAt: "Oct 12" },
  { id: "opportunity-12", title: "Opportunity 12", department: "Tech Corp", submittedAt: "Oct 08" },
  { id: "opportunity-13", title: "Opportunity 13", department: "StartUp Inc.", submittedAt: "Sep 28" },
  { id: "opportunity-21", title: "Opportunity 21", department: "StartUp Inc.", submittedAt: "Sep 28" },
];

const applicationSeeds = [
  { applicantId: "emily", listingIds: ["opportunity-1", "opportunity-3", "opportunity-4"] },
  { applicantId: "college-c", listingIds: ["opportunity-8", "opportunity-12", "opportunity-21"] },
  { applicantId: "smith", listingIds: ["opportunity-3", "opportunity-7", "opportunity-13"] },
  { applicantId: "carlos", listingIds: ["opportunity-2", "opportunity-5", "opportunity-6"] },
];

const initialApplications: ApplicantApplication[] = applicationSeeds.flatMap(
  ({ applicantId, listingIds }) =>
    listingIds.map((listingId) => ({
      id: `${applicantId}-${listingId}`,
      applicantId,
      listingId,
      submittedAt:
        listings.find((listing) => listing.id === listingId)?.submittedAt ?? "",
      status: "PENDING" as const,
    })),
);

const applicantRowArtwork: Record<string, string> = {
  emily: applicantRowEmily,
  "college-c": applicantRowStudent,
  smith: applicantRowSmith,
  carlos: applicantRowCarlos,
};

function ActionIcon({ icon }: { icon: DashboardAction["icon"] }) {
  if (icon === "profile") {
    return (
      <svg aria-hidden="true" className="dashboard-icon" viewBox="0 0 48 48">
        <circle cx="24" cy="13" r="8" />
        <path d="M7.5 42v-4.5A10.5 10.5 0 0 1 18 27h12a10.5 10.5 0 0 1 10.5 10.5V42" />
      </svg>
    );
  }

  if (icon === "search") {
    return (
      <svg aria-hidden="true" className="dashboard-icon" viewBox="0 0 48 48">
        <circle cx="21" cy="21" r="16" />
        <path d="m33 33 11 11" />
      </svg>
    );
  }

  if (icon === "posts") {
    return (
      <svg aria-hidden="true" className="dashboard-icon" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r="20" />
        <path d="M24 13v22M13 24h22" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className="dashboard-icon" viewBox="0 0 48 48">
      <path d="M20 5H9a4 4 0 0 0-4 4v30a4 4 0 0 0 4 4h11" />
      <path d="M22 24h21m-9-9 9 9-9 9" />
    </svg>
  );
}

function ApplicantHeader({
  menuOpen,
  onMenuToggle,
  search,
  onSearchChange,
  onAction,
}: {
  menuOpen: boolean;
  onMenuToggle: () => void;
  search: string;
  onSearchChange: (value: string) => void;
  onAction: (action: DashboardAction) => void;
}) {
  return (
    <>
      <header className="dashboard-header">
        <button
          aria-controls="professor-navigation"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          className="menu-button"
          onClick={onMenuToggle}
          type="button"
        >
          <img alt="" height="44" src={menuIcon} width="44" />
        </button>
        <label className="visually-hidden" htmlFor="applicant-search">
          Search applicants and research listings
        </label>
        <input
          autoComplete="off"
          className="dashboard-search"
          id="applicant-search"
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="SEARCH"
          type="search"
          value={search}
        />
      </header>
      {menuOpen && (
        <NavigationMenu onAction={onAction} />
      )}
    </>
  );
}

function NavigationMenu({ onAction }: { onAction: (action: DashboardAction) => void }) {
  return (
    <nav aria-label="Professor navigation" className="dashboard-menu" id="professor-navigation">
      {dashboardActions.map((action) => (
        <button key={action.id} onClick={() => onAction(action)} type="button">
          {action.label}
        </button>
      ))}
    </nav>
  );
}

function StatusBadge({ status }: { status: ApplicationStatus }) {
  const label = status === "DECLINED" ? "Declined" : status.toLowerCase();
  return <span className={`status-badge status-${status.toLowerCase()}`}>{label}</span>;
}

function App() {
  const [message, setMessage] = useState("");
  const [screen, setScreen] = useState<Screen>("login");
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [listingFilter, setListingFilter] = useState("all");
  const [applications, setApplications] = useState(initialApplications);
  const [selectedApplicantId, setSelectedApplicantId] = useState<string | null>(null);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [showDeclineForm, setShowDeclineForm] = useState(false);
  const [decisionReason, setDecisionReason] = useState("");
  const [decisionError, setDecisionError] = useState("");
  const [decisionResult, setDecisionResult] = useState<DecisionResult | null>(null);
  const [showResume, setShowResume] = useState(false);

  function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const submitter = event.nativeEvent instanceof SubmitEvent
      ? event.nativeEvent.submitter
      : null;
    const role = submitter instanceof HTMLButtonElement
      ? submitter.value
      : null;

    if (role !== "Professor" && role !== "Student") {
      setMessage("Choose Professor Login or Student Login.");
      return;
    }

    if (role === "Professor") {
      setMessage("");
      setScreen("dashboard");
      return;
    }

    setMessage("Student sign-in is not connected yet.");
  }

  function handleDashboardAction(action: DashboardAction) {
    setMenuOpen(false);

    if (action.id === "logout") {
      setScreen("login");
      setSearch("");
      setMessage("You have left the professor dashboard. Authentication is not connected.");
      return;
    }

    if (action.id === "applicants") {
      setScreen("applicants");
      setSearch("");
      setMessage("");
      return;
    }

    setMessage(`${action.label} is not available yet.`);
  }

  function openApplicant(application: ApplicantApplication) {
    setSelectedApplicantId(application.applicantId);
    setSelectedApplicationId(application.id);
    setShowDeclineForm(false);
    setDecisionReason("");
    setDecisionError("");
    setShowResume(false);
    setScreen("applicant");
    setMenuOpen(false);
  }

  function returnToApplicants() {
    setScreen("applicants");
    setMenuOpen(false);
    setShowDeclineForm(false);
    setShowResume(false);
  }

  function saveDecision(status: "ACCEPTED" | "DECLINED", reason?: string) {
    const activeApplication = applications.find(
      (application) => application.id === selectedApplicationId,
    );
    const applicant = applicants.find(
      (candidate) => candidate.id === selectedApplicantId,
    );
    const listing = listings.find(
      (researchListing) => researchListing.id === activeApplication?.listingId,
    );

    if (!activeApplication || !applicant || !listing) {
      setDecisionError("Select an application before recording a decision.");
      return;
    }

    setApplications((currentApplications) =>
      currentApplications.map((application) =>
        application.id === activeApplication.id
          ? {
              ...application,
              status,
              ...(reason ? { decisionReason: reason } : {}),
            }
          : application,
      ),
    );
    setDecisionResult({
      applicantId: applicant.id,
      applicantName: applicant.name,
      listingTitle: listing.title,
      status,
      ...(reason ? { reason } : {}),
    });
    setShowDeclineForm(false);
    setDecisionReason("");
    setDecisionError("");
    setScreen("decision");
  }

  function handleDeclineSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const reason = decisionReason.trim();
    if (!reason) {
      setDecisionError("Enter a reason before declining this application.");
      return;
    }
    saveDecision("DECLINED", reason);
  }

  const selectedApplicant = applicants.find(
    (applicant) => applicant.id === selectedApplicantId,
  ) ?? null;
  const selectedApplication = applications.find(
    (application) => application.id === selectedApplicationId,
  ) ?? null;
  const applicantApplications = selectedApplicant
    ? applications.filter((application) => application.applicantId === selectedApplicant.id)
    : [];
  const activeListing = selectedApplication
    ? listings.find((listing) => listing.id === selectedApplication.listingId)
    : undefined;
  const normalizedSearch = search.trim().toLowerCase();
  const applicantGroups = listings
    .filter((listing) => listingFilter === "all" || listing.id === listingFilter)
    .map((listing) => ({
      listing,
      applications: applications.filter((application) => {
        if (application.listingId !== listing.id) {
          return false;
        }
        const applicant = applicants.find(
          (candidate) => candidate.id === application.applicantId,
        );
        return Boolean(
          applicant &&
            `${applicant.name} ${applicant.major} ${listing.title} ${listing.department} ${application.status}`
              .toLowerCase()
              .includes(normalizedSearch),
        );
      }),
    }))
    .filter((group) => group.applications.length > 0);

  if (screen === "login") {
    return (
      <main className="page">
        <section className="login-frame" aria-labelledby="login-title">
          <form className="login-form" onSubmit={handleLogin}>
            <div className="login-panel">
              <h1 id="login-title">LOGIN</h1>
              <div className="fields">
                <label className="visually-hidden" htmlFor="username">Username</label>
                <input autoComplete="username" id="username" name="username" placeholder="USERNAME" required />
                <label className="visually-hidden" htmlFor="password">Password</label>
                <input autoComplete="current-password" id="password" name="password" placeholder="PASSWORD" required type="password" />
              </div>
            </div>
            <div className="actions" aria-label="Sign in options">
              <button className="action-button" name="role" type="submit" value="Professor">
                Professor Login
              </button>
              <button className="action-button" name="role" type="submit" value="Student">
                Student Login
              </button>
            </div>
            <button
              className="action-button signup-button"
              onClick={() => setMessage("Sign-up is not connected yet.")}
              type="button"
            >
              Sign Up
            </button>
            <p aria-live="polite" className="status-message">{message}</p>
          </form>
        </section>
      </main>
    );
  }

  if (screen === "dashboard") {
    const visibleActions = dashboardActions.filter((action) =>
      action.label.toLowerCase().includes(search.trim().toLowerCase()),
    );

    return (
      <main className="dashboard">
        <h1 className="visually-hidden">Professor dashboard</h1>
        <header className="dashboard-header">
          <button
            aria-controls="professor-navigation"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            className="menu-button"
            onClick={() => setMenuOpen((isOpen) => !isOpen)}
            type="button"
          >
            <img alt="" height="44" src={menuIcon} width="44" />
          </button>
          <label className="visually-hidden" htmlFor="dashboard-search">Search dashboard actions</label>
          <input
            autoComplete="off"
            className="dashboard-search"
            id="dashboard-search"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="SEARCH"
            type="search"
            value={search}
          />
        </header>
        {menuOpen && <NavigationMenu onAction={handleDashboardAction} />}
        <section aria-label="Professor dashboard shortcuts" className="dashboard-grid">
          {visibleActions.map((action) => (
            <button
              className="dashboard-tile"
              key={action.id}
              onClick={() => handleDashboardAction(action)}
              type="button"
            >
              <ActionIcon icon={action.icon} />
              <span>{action.label}</span>
            </button>
          ))}
          {visibleActions.length === 0 && (
            <p className="dashboard-empty">No dashboard actions match your search.</p>
          )}
        </section>
        <p aria-live="polite" className="dashboard-message">{message}</p>
      </main>
    );
  }

  if (screen === "applicants") {
    return (
      <main className="applicant-screen">
        <ApplicantHeader
          menuOpen={menuOpen}
          onAction={handleDashboardAction}
          onMenuToggle={() => setMenuOpen((isOpen) => !isOpen)}
          onSearchChange={setSearch}
          search={search}
        />
        <section aria-labelledby="applicant-list-title" className="applicant-content">
          <h1 id="applicant-list-title">Applicant Information</h1>
          <div className="applicant-filter">
            <label htmlFor="listing-filter">Filter by research listing</label>
            <select
              id="listing-filter"
              onChange={(event) => setListingFilter(event.target.value)}
              value={listingFilter}
            >
              <option value="all">All research listings</option>
              {listings.map((listing) => (
                <option key={listing.id} value={listing.id}>
                  {listing.title} · {listing.department}
                </option>
              ))}
            </select>
          </div>
          <div aria-live="polite" className="applicant-groups">
            {applicantGroups.map(({ listing, applications: listingApplications }) => (
              <section aria-labelledby={`group-${listing.id}`} className="applicant-group" key={listing.id}>
                <div className="applicant-group-heading">
                  <div>
                    <h2 id={`group-${listing.id}`}>{listing.title}</h2>
                    <p>{listing.department}</p>
                  </div>
                  <span>{listingApplications.length} {listingApplications.length === 1 ? "applicant" : "applicants"}</span>
                </div>
                <ul className="applicant-list">
                  {listingApplications.map((application) => {
                    const applicant = applicants.find(
                      (candidate) => candidate.id === application.applicantId,
                    );
                    if (!applicant) {
                      return null;
                    }
                    return (
                      <li key={application.id}>
                        <button
                          aria-label={`View ${applicant.name}'s profile for ${listing.title}`}
                          className={`applicant-row ${applicant.id === "emily" ? "has-photo" : ""}`}
                          onClick={() => openApplicant(application)}
                          type="button"
                        >
                          <img
                            alt=""
                            className="applicant-row-art"
                            src={applicantRowArtwork[applicant.id]}
                          />
                          {applicant.id === "emily" ? (
                            <img alt="" className="applicant-avatar" src={applicantAvatar} />
                          ) : (
                            <span className="applicant-icon-wrap">
                              <img alt="" className="applicant-row-user" src={applicantUserIcon} />
                            </span>
                          )}
                          <span className="applicant-row-name">{applicant.name}</span>
                          <StatusBadge status={application.status} />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
            {applicantGroups.length === 0 && (
              <p className="applicant-empty">No applicants match this listing or search.</p>
            )}
          </div>
          <button className="back-button applicant-list-back" onClick={() => setScreen("dashboard")} type="button">
            Back
          </button>
        </section>
      </main>
    );
  }

  if (screen === "applicant" && selectedApplicant) {
    return (
      <main className="applicant-screen">
        <ApplicantHeader
          menuOpen={menuOpen}
          onAction={handleDashboardAction}
          onMenuToggle={() => setMenuOpen((isOpen) => !isOpen)}
          onSearchChange={setSearch}
          search={search}
        />
        <section aria-labelledby="applicant-name" className="applicant-detail">
          <button className="back-button" onClick={returnToApplicants} type="button">
            Back
          </button>
          <h1 id="applicant-name">{selectedApplicant.name}</h1>
          <div className="applicant-profile">
            <img
              alt={`${selectedApplicant.name} profile`}
              className="applicant-profile-avatar"
              src={applicantAvatar}
            />
            <div className="applicant-facts">
              <p>Match: {selectedApplicant.match}/100</p>
              <p>Major: {selectedApplicant.major}</p>
              <p>Concentration: {selectedApplicant.concentration}</p>
              <p>Year: {selectedApplicant.academicYear}</p>
            </div>
          </div>
          <div className="applicant-bio-resume">
            <section className="about-section">
              <h2>About Me</h2>
              <p>{selectedApplicant.about}</p>
            </section>
            <section aria-labelledby="resume-heading" className="resume-section">
              <h2 id="resume-heading">Resume</h2>
              <button
                aria-label={`View ${selectedApplicant.name}'s resume`}
                className="resume-preview-button"
                onClick={() => setShowResume(true)}
                type="button"
              >
                <img alt="" src={fileIcon} />
                <span>View resume</span>
              </button>
            </section>
          </div>
          <section aria-labelledby="decision-heading" className="application-decision">
            <h2 id="decision-heading">Review application</h2>
            <label htmlFor="decision-listing">Research listing</label>
            <select
              id="decision-listing"
              onChange={(event) => setSelectedApplicationId(event.target.value)}
              value={selectedApplicationId ?? ""}
            >
              {applicantApplications.map((application) => {
                const listing = listings.find(
                  (researchListing) => researchListing.id === application.listingId,
                );
                return (
                  <option key={application.id} value={application.id}>
                    {listing?.title ?? "Research listing"} — {listing?.department ?? ""}
                  </option>
                );
              })}
            </select>
            {selectedApplication && activeListing && (
              <p className="decision-listing-status">
                Status for {activeListing.title}: <StatusBadge status={selectedApplication.status} />
              </p>
            )}
            {selectedApplication?.status === "PENDING" ? (
              <div className="decision-actions">
                <button className="accept-button" onClick={() => saveDecision("ACCEPTED")} type="button">
                  Accept applicant
                </button>
                <button
                  className="decline-button"
                  onClick={() => {
                    setShowDeclineForm(true);
                    setDecisionReason("");
                    setDecisionError("");
                  }}
                  type="button"
                >
                  Decline applicant
                </button>
              </div>
            ) : null}
            {decisionError && !showDeclineForm && (
              <p aria-live="polite" className="decision-error">{decisionError}</p>
            )}
            {showDeclineForm && selectedApplication?.status === "PENDING" && (
              <form className="decline-form" onSubmit={handleDeclineSubmit}>
                <label htmlFor="decline-reason">Reason for declining this applicant</label>
                <textarea
                  autoFocus
                  id="decline-reason"
                  onChange={(event) => {
                    setDecisionReason(event.target.value);
                    if (event.target.value.trim()) {
                      setDecisionError("");
                    }
                  }}
                  placeholder="Share a clear, respectful reason."
                  required
                  rows={4}
                  value={decisionReason}
                />
                {decisionError && <p aria-live="polite" className="decision-error">{decisionError}</p>}
                <div className="decision-actions">
                  <button className="accept-button" type="submit">Submit decision</button>
                  <button className="secondary-button" onClick={() => setShowDeclineForm(false)} type="button">
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </section>
          <section aria-labelledby="applied-listings-title" className="applied-listings">
            <h2 id="applied-listings-title">Applied Listings</h2>
            <ul>
              {applicantApplications.map((application) => {
                const listing = listings.find(
                  (researchListing) => researchListing.id === application.listingId,
                );
                if (!listing) {
                  return null;
                }
                return (
                  <li className="listing-card" key={application.id}>
                    <span className="listing-icon">
                      <img alt="" src={briefcaseIcon} />
                    </span>
                    <div className="listing-card-copy">
                      <strong>{listing.title}</strong>
                      <span>{listing.department}</span>
                      {application.status === "DECLINED" && application.decisionReason && (
                        <p><strong>Reason for denial:</strong> {application.decisionReason}</p>
                      )}
                    </div>
                    <div className="listing-card-meta">
                      <StatusBadge status={application.status} />
                      <time>{application.submittedAt}</time>
                    </div>
                    {application.status === "PENDING" && (
                      <button
                        aria-label={`Review ${listing.title} application`}
                        className="listing-review-button"
                        onClick={() => setSelectedApplicationId(application.id)}
                        type="button"
                      >
                        Review
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
          {showResume && (
            <div className="modal-backdrop" onClick={() => setShowResume(false)}>
              <section
                aria-labelledby="resume-modal-title"
                aria-modal="true"
                className="resume-dialog"
                onClick={(event) => event.stopPropagation()}
                role="dialog"
              >
                <div className="resume-dialog-heading">
                  <div>
                    <p>Applicant resume</p>
                    <h2 id="resume-modal-title">{selectedApplicant.name}</h2>
                  </div>
                  <button aria-label="Close resume" onClick={() => setShowResume(false)} type="button">
                    ×
                  </button>
                </div>
                <p className="resume-sample-note">Sample resume preview</p>
                <section>
                  <h3>Education</h3>
                  <p>{selectedApplicant.resume.education}</p>
                </section>
                <section>
                  <h3>Experience</h3>
                  <p>{selectedApplicant.resume.experience}</p>
                </section>
                <section>
                  <h3>Skills</h3>
                  <ul>
                    {selectedApplicant.resume.skills.map((skill) => <li key={skill}>{skill}</li>)}
                  </ul>
                </section>
              </section>
            </div>
          )}
        </section>
      </main>
    );
  }

  if (screen === "decision" && decisionResult) {
    const accepted = decisionResult.status === "ACCEPTED";
    return (
      <main className="applicant-screen">
        <ApplicantHeader
          menuOpen={menuOpen}
          onAction={handleDashboardAction}
          onMenuToggle={() => setMenuOpen((isOpen) => !isOpen)}
          onSearchChange={setSearch}
          search={search}
        />
        <section aria-labelledby="decision-result-title" className="decision-result">
          <button className="back-button" onClick={returnToApplicants} type="button">Back</button>
          <div className={`decision-result-mark ${accepted ? "result-accepted" : "result-declined"}`} aria-hidden="true">
            {accepted ? "✓" : "×"}
          </div>
          <p className="decision-result-eyebrow">Application decision</p>
          <h1 id="decision-result-title">
            Applicant {accepted ? "accepted" : "declined"}
          </h1>
          <p className="decision-result-summary">
            <strong>{decisionResult.applicantName}</strong> was {accepted ? "accepted" : "declined"} for{" "}
            <strong>{decisionResult.listingTitle}</strong>.
          </p>
          <div className="decision-result-card">
            <p><span>Applicant</span><strong>{decisionResult.applicantName}</strong></p>
            <p><span>Research listing</span><strong>{decisionResult.listingTitle}</strong></p>
            <p><span>Decision</span><StatusBadge status={decisionResult.status} /></p>
            {!accepted && decisionResult.reason && (
              <p className="result-reason"><span>Reason for denial</span><strong>{decisionResult.reason}</strong></p>
            )}
          </div>
          <div className="decision-result-actions">
            <button className="accept-button" onClick={returnToApplicants} type="button">
              Back to applicants
            </button>
            <button
              className="secondary-button"
              onClick={() => {
                setSelectedApplicantId(decisionResult.applicantId);
                setScreen("applicant");
              }}
              type="button"
            >
              View applicant profile
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="applicant-screen">
      <ApplicantHeader
        menuOpen={menuOpen}
        onAction={handleDashboardAction}
        onMenuToggle={() => setMenuOpen((isOpen) => !isOpen)}
        onSearchChange={setSearch}
        search={search}
      />
      <section aria-live="polite" className="applicant-content">
        <h1>Applicant Information</h1>
        <p className="applicant-empty">Select an applicant to view their profile.</p>
        <button className="back-button" onClick={returnToApplicants} type="button">Back</button>
      </section>
    </main>
  );
}

export default App;
