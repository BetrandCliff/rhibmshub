import Link from "next/link";
import { db } from "@/lib/db";
import type { AnnouncementModel } from "@/lib/generated/prisma/models/Announcement";

export const dynamic = "force-dynamic";

const features = [
  {
    n: "01",
    title: "Teaching materials, thoughtfully shared",
    text: "Publish lecture notes for a course, a programme, or a specific academic group. Every file stays private and access is tied to the people it is meant for.",
    icon: "▤",
  },
  {
    n: "02",
    title: "The right file to the right person",
    text: "Send a document directly to a student, department, or institutional office, with permissions that make sense for the work.",
    icon: "↗",
  },
  {
    n: "03",
    title: "Supervision with a clearer path",
    text: "Keep supervisor and supervisee relationships, research milestones, and academic conversations in one considered place.",
    icon: "⌘",
  },
];

export default async function Home() {
  const announcements = await db.announcement.findMany({
    where: { isPublished: true, publishedAt: { not: null } },
    orderBy: { publishedAt: "desc" },
    take: 3,
  });
  return (
    <main className="landing">
      <header className="landing-nav wrap">
        <Link href="/" className="wordmark">
          <span className="brand-mark">R</span>
          <span>
            Rhibms<span className="wordmark-light">Hub</span>
            <small>ACADEMIC WORKSPACE</small>
          </span>
        </Link>
        <nav className="landing-links">
          <a href="#platform">Platform</a>
          <a href="#news">Latest news</a>
          <a href="#workflows">Workflows</a>
          <a href="#trust">Access & privacy</a>
        </nav>
        <div className="nav-actions">
          <Link href="/login" className="nav-login">
            Sign in
          </Link>
          <Link href="/signup" className="button button-small">
            Create an account <span>↗</span>
          </Link>
        </div>
      </header>

      <section className="hero wrap" id="platform">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="eyebrow-dot" /> BUILT FOR ACADEMIC WORK
          </div>
          <h1>
            Good academic work
            <br />
            deserves a <em>better home.</em>
          </h1>
          <p className="hero-intro">
            A private workspace for course materials, thoughtful file sharing,
            and the people guiding student research.
          </p>
          <div className="hero-cta">
            <Link href="/signup" className="button">
              Get started <span>↗</span>
            </Link>
            <Link href="/login" className="button-quiet">
              Sign in to your workspace <span>→</span>
            </Link>
          </div>
          <div className="hero-proof">
            <div className="avatar-stack">
              <i>AM</i>
              <i>KO</i>
              <i>JT</i>
              <i>+</i>
            </div>
            <span>
              For lecturers, students
              <br />
              and academic offices
            </span>
          </div>
        </div>
        <div
          className="workspace-art"
          aria-label="Preview of the RhibmsHub academic workspace"
        >
          <div className="art-glow" />
          <div className="app-window">
            <div className="app-sidebar">
              <div className="mini-brand">
                <span className="brand-mark">R</span> Rhibms<span>Hub</span>
              </div>
              <div className="app-space-label">WORKSPACE</div>
              <div className="app-nav active">
                <b>◫</b> Overview
              </div>
              <div className="app-nav">
                <b>▤</b> Course materials
              </div>
              <div className="app-nav">
                <b>↗</b> Shared with me
              </div>
              <div className="app-nav">
                <b>⌘</b> Supervision
              </div>
              <div className="sidebar-profile">
                <span className="profile-avatar">AO</span>
                <span>
                  <b>Amara Okafor</b>
                  <small>Lecturer · Science</small>
                </span>
                <span className="profile-more">···</span>
              </div>
            </div>
            <div className="app-main">
              <div className="app-top">
                <span>Monday, 12 October 2026</span>
                <span className="secure-label">
                  <i /> PRIVATE WORKSPACE
                </span>
              </div>
              <div className="app-welcome">
                <div>
                  <small>YOUR ACADEMIC DESK</small>
                  <h3>Good morning, Amara.</h3>
                  <p>Your teaching and research, in good order.</p>
                </div>
                <span className="app-weather">✳</span>
              </div>
              <div className="app-stats">
                <div>
                  <small>COURSE MATERIALS</small>
                  <b>24</b>
                  <span>Across 4 courses</span>
                </div>
                <div>
                  <small>SHARED FILES</small>
                  <b>08</b>
                  <span>For your review</span>
                </div>
                <div>
                  <small>SUPERVISEES</small>
                  <b>06</b>
                  <span>2 milestones soon</span>
                </div>
              </div>
              <div className="app-doc-head">
                <b>Recently shared materials</b>
                <span>
                  View all <i>→</i>
                </span>
              </div>
              <div className="app-doc">
                <span className="doc-icon pdf">PDF</span>
                <span>
                  <b>Research methods · Week 04</b>
                  <small>Shared with 300-level · 2 hours ago</small>
                </span>
                <span className="access-tag">COURSE GROUP</span>
              </div>
              <div className="app-doc">
                <span className="doc-icon doc">DOC</span>
                <span>
                  <b>Laboratory safety guidelines</b>
                  <small>Shared with Department Office · Yesterday</small>
                </span>
                <span className="access-tag office-tag">OFFICE</span>
              </div>
            </div>
          </div>
          <div className="floating-note">
            <span>✓</span>
            <div>
              <b>Access stays intentional</b>
              <small>Only invited people can view</small>
            </div>
          </div>
        </div>
      </section>

      <section className="trust-strip" id="trust">
        <div className="wrap trust-inner">
          <span>MADE FOR THE WAY ACADEMIA WORKS</span>
          <i />
          <p>
            One trusted place for <b>teaching</b>, <b>administration</b> &amp;{" "}
            <b>research</b>
          </p>
          <span className="trust-lock">▣ &nbsp;Private by design</span>
        </div>
      </section>

      <section className="news-section wrap" id="news">
        <div className="news-heading">
          <div>
            <div className="eyebrow">WHAT’S HAPPENING ON CAMPUS</div>
            <h2>
              Latest news &amp; <em>announcements.</em>
            </h2>
          </div>
          <span>Updates from your institution</span>
        </div>
        {announcements.length ? (
          <div className="news-grid">
            {announcements.map((item: AnnouncementModel) => (
              <article className="news-card" key={item.id}>
                <div className="news-meta">
                  <span>{item.category}</span>
                  <time>
                    {item.publishedAt?.toLocaleDateString("en", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </time>
                </div>
                <h3>{item.title}</h3>
                <p>{item.summary}</p>
                <span className="news-mark">↗</span>
              </article>
            ))}
          </div>
        ) : (
          <div className="news-empty">
            <span>✳</span>
            <div>
              <b>School news and announcements will appear here.</b>
              <p>Check back for the latest updates from your institution.</p>
            </div>
          </div>
        )}
      </section>

      <section className="features-section wrap" id="workflows">
        <div className="section-heading">
          <div>
            <div className="eyebrow">A MORE CONNECTED CAMPUS</div>
            <h2>
              Everything academic work needs.
              <br />
              <em>Nothing in the way.</em>
            </h2>
          </div>
          <p>
            Give course materials, office communication, and research
            supervision a shared foundation—while keeping access in the right
            hands.
          </p>
        </div>
        <div className="feature-grid">
          {features.map((f) => (
            <article className="feature-card" key={f.n}>
              <div className="feature-top">
                <span>{f.n} / 03</span>
                <i>{f.icon}</i>
              </div>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
              <a href="#how-it-works">
                Explore workflow <span>↗</span>
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="workflow-band" id="how-it-works">
        <div className="wrap workflow-inner">
          <div>
            <div className="eyebrow">A CLEARER WAY TO COLLABORATE</div>
            <h2>
              Share knowledge.
              <br />
              <em>Keep the context.</em>
            </h2>
            <p>
              Course notes belong with the learners who need them.
              Administrative documents belong with their intended office.
              Research guidance belongs in a relationship that lasts beyond one
              meeting.
            </p>
            <Link href="/signup" className="button button-light">
              Bring your work together <span>↗</span>
            </Link>
          </div>
          <div className="workflow-list">
            <div>
              <span>01</span>
              <i>▤</i>
              <section>
                <b>Organise course resources</b>
                <small>
                  Keep notes connected to departments, courses, and student
                  groups.
                </small>
              </section>
              <span className="workflow-arrow">↗</span>
            </div>
            <div>
              <span>02</span>
              <i>↗</i>
              <section>
                <b>Share with intention</b>
                <small>
                  Choose an individual, an office, or an academic group.
                </small>
              </section>
              <span className="workflow-arrow">↗</span>
            </div>
            <div>
              <span>03</span>
              <i>⌘</i>
              <section>
                <b>Support student research</b>
                <small>
                  Make supervision progress and next steps easier to follow.
                </small>
              </section>
              <span className="workflow-arrow">↗</span>
            </div>
          </div>
        </div>
      </section>
      <section className="closing-cta wrap">
        <div>
          <div className="eyebrow">YOUR CAMPUS, BETTER CONNECTED</div>
          <h2>
            Make space for the work
            <br />
            that moves learning forward.
          </h2>
        </div>
        <Link href="/signup" className="button">
          Create your account <span>↗</span>
        </Link>
      </section>
      <footer className="landing-footer wrap">
        <Link href="/" className="wordmark">
          <span className="brand-mark">R</span>
          <span>
            Rhibms<span className="wordmark-light">Hub</span>
            <small>ACADEMIC WORKSPACE</small>
          </span>
        </Link>
        <span>Teaching, sharing, and supervision—together.</span>
        <div>
          <Link href="/login">Sign in</Link>
          <Link href="/signup">Create account</Link>
        </div>
      </footer>
    </main>
  );
}
