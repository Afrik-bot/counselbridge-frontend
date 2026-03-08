import { useState, useEffect, useRef } from "react";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --navy: #060D1A;
    --navy-2: #0A1628;
    --navy-3: #0F2240;
    --blue: #2563EB;
    --blue-light: #3B82F6;
    --blue-glow: rgba(37,99,235,0.15);
    --gold: #C9A84C;
    --gold-light: #E2C47A;
    --white: #FFFFFF;
    --gray-100: #F1F5F9;
    --gray-400: #94A3B8;
    --gray-500: #64748B;
    --serif: 'Cormorant Garamond', Georgia, serif;
    --sans: 'DM Sans', system-ui, sans-serif;
  }

  html { scroll-behavior: smooth; }

  body {
    background: var(--navy);
    color: var(--white);
    font-family: var(--sans);
    overflow-x: hidden;
    line-height: 1.6;
  }

  /* \u2500\u2500 NOISE TEXTURE OVERLAY \u2500\u2500 */
  body::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.035'/%3E%3C/svg%3E");
    pointer-events: none;
    z-index: 1000;
    opacity: 0.4;
  }

  /* \u2500\u2500 NAV \u2500\u2500 */
  nav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    padding: 20px 48px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    transition: all 0.4s ease;
  }

  nav.scrolled {
    background: rgba(6,13,26,0.85);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(255,255,255,0.06);
    padding: 14px 48px;
  }

  .nav-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
  }

  .nav-logo-icon {
    width: 36px;
    height: 36px;
    background: var(--blue);
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
  }

  .nav-logo-text {
    font-family: var(--serif);
    font-size: 22px;
    font-weight: 600;
    color: white;
    letter-spacing: -0.02em;
  }

  .nav-links {
    display: flex;
    align-items: center;
    gap: 36px;
    list-style: none;
  }

  .nav-links a {
    color: rgba(255,255,255,0.6);
    text-decoration: none;
    font-size: 14px;
    font-weight: 500;
    transition: color 0.2s;
    letter-spacing: 0.01em;
  }

  .nav-links a:hover { color: white; }

  .nav-cta {
    background: var(--blue);
    color: white !important;
    padding: 9px 22px;
    border-radius: 8px;
    font-weight: 600 !important;
    font-size: 14px !important;
    transition: all 0.2s !important;
  }

  .nav-cta:hover {
    background: var(--blue-light) !important;
    transform: translateY(-1px);
  }

  /* \u2500\u2500 HERO \u2500\u2500 */
  .hero {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 120px 24px 80px;
    position: relative;
    overflow: hidden;
  }

  .hero-bg {
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse 80% 60% at 50% 40%, rgba(37,99,235,0.12) 0%, transparent 70%),
                radial-gradient(ellipse 40% 40% at 20% 80%, rgba(201,168,76,0.06) 0%, transparent 60%),
                radial-gradient(ellipse 60% 50% at 80% 20%, rgba(37,99,235,0.08) 0%, transparent 60%);
  }

  .hero-grid {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
    background-size: 60px 60px;
    mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%);
  }

  .hero-content {
    position: relative;
    z-index: 2;
    max-width: 860px;
    margin: 0 auto;
  }

  .hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(37,99,235,0.12);
    border: 1px solid rgba(37,99,235,0.3);
    color: #93C5FD;
    padding: 6px 16px;
    border-radius: 100px;
    font-size: 13px;
    font-weight: 500;
    margin-bottom: 32px;
    letter-spacing: 0.02em;
    animation: fadeUp 0.8s ease both;
  }

  .hero-badge-dot {
    width: 6px;
    height: 6px;
    background: #3B82F6;
    border-radius: 50%;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.8); }
  }

  .hero-title {
    font-family: var(--serif);
    font-size: clamp(52px, 7vw, 88px);
    font-weight: 300;
    line-height: 1.05;
    letter-spacing: -0.03em;
    margin-bottom: 28px;
    animation: fadeUp 0.8s ease 0.1s both;
  }

  .hero-title em {
    font-style: italic;
    color: var(--gold-light);
  }

  .hero-title strong {
    font-weight: 600;
    display: block;
  }

  .hero-subtitle {
    font-size: 18px;
    color: rgba(255,255,255,0.55);
    max-width: 560px;
    margin: 0 auto 44px;
    line-height: 1.7;
    font-weight: 300;
    animation: fadeUp 0.8s ease 0.2s both;
  }

  .hero-actions {
    display: flex;
    gap: 14px;
    justify-content: center;
    flex-wrap: wrap;
    animation: fadeUp 0.8s ease 0.3s both;
  }

  .btn-primary {
    background: var(--blue);
    color: white;
    padding: 14px 32px;
    border-radius: 10px;
    font-size: 15px;
    font-weight: 600;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s;
    border: none;
    cursor: pointer;
    font-family: var(--sans);
    box-shadow: 0 0 40px rgba(37,99,235,0.3);
  }

  .btn-primary:hover {
    background: var(--blue-light);
    transform: translateY(-2px);
    box-shadow: 0 0 60px rgba(37,99,235,0.4);
  }

  .btn-ghost {
    background: rgba(255,255,255,0.06);
    color: rgba(255,255,255,0.8);
    padding: 14px 32px;
    border-radius: 10px;
    font-size: 15px;
    font-weight: 500;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s;
    border: 1px solid rgba(255,255,255,0.1);
    cursor: pointer;
    font-family: var(--sans);
  }

  .btn-ghost:hover {
    background: rgba(255,255,255,0.1);
    transform: translateY(-2px);
  }

  .hero-stats {
    display: flex;
    justify-content: center;
    gap: 48px;
    margin-top: 72px;
    padding-top: 48px;
    border-top: 1px solid rgba(255,255,255,0.07);
    animation: fadeUp 0.8s ease 0.5s both;
    flex-wrap: wrap;
  }

  .hero-stat-value {
    font-family: var(--serif);
    font-size: 36px;
    font-weight: 600;
    color: white;
    letter-spacing: -0.03em;
  }

  .hero-stat-label {
    font-size: 13px;
    color: rgba(255,255,255,0.4);
    margin-top: 4px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  /* \u2500\u2500 FEATURES \u2500\u2500 */
  .section {
    padding: 120px 24px;
    max-width: 1200px;
    margin: 0 auto;
  }

  .section-label {
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--blue-light);
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .section-label::before {
    content: '';
    display: inline-block;
    width: 24px;
    height: 1px;
    background: var(--blue-light);
  }

  .section-title {
    font-family: var(--serif);
    font-size: clamp(36px, 4vw, 56px);
    font-weight: 400;
    line-height: 1.1;
    letter-spacing: -0.02em;
    margin-bottom: 20px;
  }

  .section-title em { font-style: italic; color: var(--gold-light); }

  .section-subtitle {
    font-size: 17px;
    color: rgba(255,255,255,0.5);
    max-width: 560px;
    line-height: 1.7;
    font-weight: 300;
    margin-bottom: 72px;
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2px;
    background: rgba(255,255,255,0.04);
    border-radius: 20px;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,0.06);
  }

  .feature-card {
    background: var(--navy-2);
    padding: 36px 32px;
    transition: background 0.3s;
    position: relative;
    overflow: hidden;
  }

  .feature-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(37,99,235,0.5), transparent);
    opacity: 0;
    transition: opacity 0.3s;
  }

  .feature-card:hover { background: rgba(15,34,64,0.8); }
  .feature-card:hover::before { opacity: 1; }

  .feature-icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    margin-bottom: 20px;
    background: rgba(37,99,235,0.12);
    border: 1px solid rgba(37,99,235,0.2);
  }

  .feature-title {
    font-family: var(--serif);
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 10px;
    letter-spacing: -0.01em;
  }

  .feature-desc {
    font-size: 14px;
    color: rgba(255,255,255,0.45);
    line-height: 1.7;
    font-weight: 300;
  }

  /* \u2500\u2500 AI SECTION \u2500\u2500 */
  .ai-section {
    padding: 0 24px 120px;
  }

  .ai-inner {
    max-width: 1200px;
    margin: 0 auto;
    background: linear-gradient(135deg, var(--navy-3) 0%, rgba(37,99,235,0.08) 100%);
    border-radius: 28px;
    border: 1px solid rgba(37,99,235,0.2);
    padding: 72px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 72px;
    align-items: center;
    position: relative;
    overflow: hidden;
  }

  .ai-inner::before {
    content: '';
    position: absolute;
    top: -100px;
    right: -100px;
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%);
  }

  .ai-zone {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 18px;
    border-radius: 12px;
    margin-bottom: 12px;
    border: 1px solid;
    transition: transform 0.2s;
  }

  .ai-zone:hover { transform: translateX(4px); }

  .ai-zone-1 { background: rgba(5,150,105,0.08); border-color: rgba(5,150,105,0.2); }
  .ai-zone-2 { background: rgba(37,99,235,0.08); border-color: rgba(37,99,235,0.2); }
  .ai-zone-3 { background: rgba(201,168,76,0.08); border-color: rgba(201,168,76,0.2); }

  .ai-zone-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .ai-zone-label {
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.04em;
  }

  .ai-zone-desc {
    font-size: 13px;
    color: rgba(255,255,255,0.45);
    margin-left: auto;
  }

  /* \u2500\u2500 PRICING \u2500\u2500 */
  .pricing-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    margin-top: 0;
  }

  .pricing-card {
    background: var(--navy-2);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 20px;
    padding: 36px 32px;
    position: relative;
    transition: transform 0.3s, border-color 0.3s;
  }

  .pricing-card:hover {
    transform: translateY(-4px);
    border-color: rgba(37,99,235,0.3);
  }

  .pricing-card.featured {
    background: linear-gradient(135deg, var(--navy-3) 0%, rgba(37,99,235,0.1) 100%);
    border-color: rgba(37,99,235,0.4);
    box-shadow: 0 0 60px rgba(37,99,235,0.12);
  }

  .pricing-badge {
    position: absolute;
    top: -12px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--blue);
    color: white;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 4px 14px;
    border-radius: 100px;
    white-space: nowrap;
  }

  .pricing-plan {
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.4);
    margin-bottom: 16px;
  }

  .pricing-price {
    font-family: var(--serif);
    font-size: 52px;
    font-weight: 600;
    letter-spacing: -0.03em;
    line-height: 1;
    margin-bottom: 6px;
  }

  .pricing-price sup {
    font-size: 24px;
    font-weight: 400;
    vertical-align: super;
    margin-right: 2px;
  }

  .pricing-period {
    font-size: 13px;
    color: rgba(255,255,255,0.35);
    margin-bottom: 28px;
  }

  .pricing-divider {
    height: 1px;
    background: rgba(255,255,255,0.07);
    margin-bottom: 28px;
  }

  .pricing-feature {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    color: rgba(255,255,255,0.65);
    margin-bottom: 12px;
    font-weight: 300;
  }

  .pricing-check {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: rgba(5,150,105,0.15);
    border: 1px solid rgba(5,150,105,0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 10px;
  }

  .pricing-cta {
    width: 100%;
    margin-top: 32px;
    padding: 13px 0;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    font-family: var(--sans);
    text-align: center;
    text-decoration: none;
    display: block;
  }

  .pricing-cta-primary {
    background: var(--blue);
    color: white;
    border: none;
    box-shadow: 0 0 30px rgba(37,99,235,0.25);
  }

  .pricing-cta-primary:hover {
    background: var(--blue-light);
    transform: translateY(-1px);
  }

  .pricing-cta-ghost {
    background: transparent;
    color: rgba(255,255,255,0.7);
    border: 1px solid rgba(255,255,255,0.12);
  }

  .pricing-cta-ghost:hover {
    background: rgba(255,255,255,0.06);
    transform: translateY(-1px);
  }

  /* \u2500\u2500 FOOTER \u2500\u2500 */
  footer {
    border-top: 1px solid rgba(255,255,255,0.06);
    padding: 48px 24px;
    text-align: center;
  }

  .footer-inner {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 20px;
  }

  .footer-copy {
    font-size: 13px;
    color: rgba(255,255,255,0.25);
  }

  .footer-links {
    display: flex;
    gap: 28px;
    list-style: none;
  }

  .footer-links a {
    font-size: 13px;
    color: rgba(255,255,255,0.3);
    text-decoration: none;
    transition: color 0.2s;
  }

  .footer-links a:hover { color: rgba(255,255,255,0.7); }

  /* \u2500\u2500 ANIMATIONS \u2500\u2500 */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .fade-up {
    opacity: 0;
    transform: translateY(32px);
    transition: opacity 0.7s ease, transform 0.7s ease;
  }

  .fade-up.visible {
    opacity: 1;
    transform: translateY(0);
  }

  /* \u2500\u2500 RESPONSIVE \u2500\u2500 */
  @media (max-width: 900px) {
    nav { padding: 16px 24px; }
    nav.scrolled { padding: 12px 24px; }
    .nav-links { display: none; }
    .features-grid { grid-template-columns: 1fr; }
    .pricing-grid { grid-template-columns: 1fr; }
    .ai-inner { grid-template-columns: 1fr; padding: 40px 28px; gap: 40px; }
    .hero-stats { gap: 28px; }
  }
`;

const features = [
  { icon: "⚖", title: "Matter Management", desc: "Organize every case with structured timelines, document requests, and real-time status tracking — all in one place." },
  { icon: "🔒", title: "Secure Messaging", desc: "End-to-end encrypted client communication with internal notes, read receipts, and complete message history." },
  { icon: "🤖", title: "AI Draft Assistant", desc: "Generate professional client messages in seconds. Every AI output requires attorney approval before sending." },
  { icon: "📄", title: "Document Hub", desc: "AI-powered document classification, version control, and secure client upload portal with access controls." },
  { icon: "💳", title: "Integrated Billing", desc: "Create invoices, send payment links, and track retainer balances — with Stripe-powered online payments." },
  { icon: "📹", title: "Video Consultations", desc: "Built-in HD video calls with screen sharing, in-call chat, and AI-generated post-meeting summaries." },
];

const plans = [
  {
    name: "Solo",
    price: "49",
    period: "per month",
    features: ["1 attorney", "Up to 25 active matters", "Client portal", "Secure messaging", "Document management", "Basic AI drafting"],
    cta: "Start free trial",
    featured: false,
  },
  {
    name: "Firm",
    price: "149",
    period: "per month",
    features: ["Up to 5 attorneys", "Unlimited matters", "Everything in Solo", "AI approval workflow", "Video consultations", "Stripe billing", "Priority support"],
    cta: "Start free trial",
    featured: true,
  },
  {
    name: "Enterprise",
    price: "399",
    period: "per month",
    features: ["Unlimited attorneys", "Unlimited matters", "Everything in Firm", "Custom AI agents", "SSO & MFA", "Dedicated onboarding", "SLA guarantee"],
    cta: "Contact sales",
    featured: false,
  },
];

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const observerRef = useRef(null);

  useEffect(() => {
    const el = document.getElementById("cb-landing-styles");
    if (!el) {
      const s = document.createElement("style");
      s.id = "cb-landing-styles";
      s.textContent = css;
      document.head.appendChild(s);
    }

    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);

    observerRef.current = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.1, rootMargin: "0px 0px -60px 0px" }
    );

    document.querySelectorAll(".fade-up").forEach((el) => observerRef.current.observe(el));

    return () => {
      window.removeEventListener("scroll", handleScroll);
      observerRef.current?.disconnect();
    };
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "var(--navy)", fontFamily: "var(--sans)" }}>
      <style>{css}</style>

      {/* NAV */}
      <nav className={scrolled ? "scrolled" : ""}>
        <a href="#" className="nav-logo">
          <div className="nav-logo-icon">⚖</div>
          <span className="nav-logo-text">CounselBridge</span>
        </a>
        <ul className="nav-links">
          <li><a href="#features">Features</a></li>
          <li><a href="#ai">AI Tools</a></li>
          <li><a href="#pricing">Pricing</a></li>
          <li><a href="/app" className="nav-cta">Get Started &rarr;</a></li>
        </ul>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-grid" />
        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            Now with AI-powered client communication
          </div>

          <h1 className="hero-title">
            The legal platform<br />
            <em>built for</em> <strong>modern attorneys</strong>
          </h1>

          <p className="hero-subtitle">
            CounselBridge gives solo attorneys and boutique firms a complete client portal — with AI drafting, secure messaging, video calls, and integrated billing.
          </p>

          <div className="hero-actions">
            <a href="/app" className="btn-primary">
              Start free 14-day trial &rarr;
            </a>
            <a href="#features" className="btn-ghost">
              See how it works
            </a>
          </div>

          <div className="hero-stats">
            {[["14-day", "Free trial"], ["5 min", "Setup time"], ["SOC 2", "Compliant"], ["256-bit", "Encryption"]].map(([val, label]) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div className="hero-stat-value">{val}</div>
                <div className="hero-stat-label">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="section" id="features">
        <div className="fade-up">
          <div className="section-label">Platform</div>
          <h2 className="section-title">Everything your practice needs,<br /><em>nothing it doesn't</em></h2>
          <p className="section-subtitle">Built specifically for attorneys who want to spend less time on administration and more time practicing law.</p>
        </div>

        <div className="features-grid fade-up">
          {features.map((f) => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <div className="feature-title">{f.title}</div>
              <div className="feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* AI SECTION */}
      <section className="ai-section" id="ai">
        <div className="ai-inner fade-up">
          <div>
            <div className="section-label">AI Tools</div>
            <h2 className="section-title" style={{ fontSize: "clamp(32px,3.5vw,48px)", marginBottom: 16 }}>
              AI that knows<br /><em>its place</em>
            </h2>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, fontWeight: 300, marginBottom: 32 }}>
              CounselBridge AI operates in three zones. It automates what's safe, flags what needs your eye, and stays completely out of legal strategy — because that's your job.
            </p>
            <a href="/app" className="btn-primary" style={{ display: "inline-flex" }}>
              Explore AI features &rarr;
            </a>
          </div>

          <div style={{ position: "relative", zIndex: 2 }}>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 16 }}>AI Compliance Zones</div>
            {[
              { zone: "1", label: "Zone 1 — Automated", desc: "Informational only", color: "#059669", dot: "#34D399" },
              { zone: "2", label: "Zone 2 — Attorney Review", desc: "Requires your approval", color: "#2563EB", dot: "#60A5FA" },
              { zone: "3", label: "Zone 3 — Human Only", desc: "Legal advice & strategy", color: "#C9A84C", dot: "#E2C47A" },
            ].map((z) => (
              <div key={z.zone} className={`ai-zone ai-zone-${z.zone}`} style={{ borderColor: z.color + "33", background: z.color + "12" }}>
                <div className="ai-zone-dot" style={{ background: z.dot }} />
                <span className="ai-zone-label" style={{ color: z.dot }}>{z.label}</span>
                <span className="ai-zone-desc">{z.desc}</span>
              </div>
            ))}
            <div style={{ marginTop: 20, padding: "14px 18px", background: "rgba(255,255,255,0.04)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.07)", fontSize: 13, color: "rgba(255,255,255,0.35)", lineHeight: 1.6 }}>
              🔒 Every AI output is logged, timestamped, and tied to the approving attorney — creating a complete audit trail.
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="section" id="pricing">
        <div className="fade-up" style={{ marginBottom: 56 }}>
          <div className="section-label">Pricing</div>
          <h2 className="section-title">Simple, transparent<br /><em>pricing</em></h2>
          <p className="section-subtitle">No setup fees. No per-client charges. Cancel anytime. All plans include a 14-day free trial.</p>
        </div>

        <div className="pricing-grid fade-up">
          {plans.map((plan) => (
            <div key={plan.name} className={`pricing-card ${plan.featured ? "featured" : ""}`}>
              {plan.featured && <div className="pricing-badge">Most Popular</div>}
              <div className="pricing-plan">{plan.name}</div>
              <div className="pricing-price">
                <sup>$</sup>{plan.price}
              </div>
              <div className="pricing-period">{plan.period}</div>
              <div className="pricing-divider" />
              {plan.features.map((f) => (
                <div key={f} className="pricing-feature">
                  <div className="pricing-check">✓</div>
                  {f}
                </div>
              ))}
              <a
                href="/app"
                className={`pricing-cta ${plan.featured ? "pricing-cta-primary" : "pricing-cta-ghost"}`}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>

        <div className="fade-up" style={{ marginTop: 40, textAlign: "center", fontSize: 14, color: "rgba(255,255,255,0.3)" }}>
          All plans include SSL encryption, SOC 2 compliance, automatic backups, and 99.9% uptime SLA.
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-inner">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div className="nav-logo-icon" style={{ width: 28, height: 28, fontSize: 14 }}>⚖</div>
            <span style={{ fontFamily: "var(--serif)", fontSize: 18, color: "rgba(255,255,255,0.7)" }}>CounselBridge</span>
          </div>
          <div className="footer-copy">&copy; {new Date().getFullYear()} CounselBridge &middot; counselbridge.me</div>
          <ul className="footer-links">
            <li><a href="#">Privacy</a></li>
            <li><a href="#">Terms</a></li>
            <li><a href="#">Security</a></li>
            <li><a href="/app">Login</a></li>
          </ul>
        </div>
      </footer>
    </div>
  );
}
