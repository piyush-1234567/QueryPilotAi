
import "./Landing.css";
import { useNavigate } from "react-router-dom";
const features = [
  { icon: "▤", title: "Natural Language to SQL", text: "Ask questions in plain English" },
  { icon: "▥", title: "Works with Your Database", text: "Connect your cloud database in minutes" },
  { icon: "ϟ", title: "Self-Healing SQL", text: "Automatically fixes errors and retries" },
  { icon: "▥", title: "Query Optimization", text: "Get faster, more efficient queries" },
  { icon: "♢", title: "Safe & Secure", text: "Read-only access with enterprise-grade security" },
];

const steps = [
  ["Connect Your Database", "Securely connect your cloud database (e.g., PostgreSQL).", "▤"],
  ["Ask a Question", "Type your question in plain English.", "▢"],
  ["Get SQL & Results", "AI generates, validates, and runs SQL for you.", "✧"],
  ["Explore & Optimize", "View results, charts, and optimization suggestions.", "▥"],
];


function ProductPreview() {

  return (
    <div className="product-preview">
      <aside className="preview-sidebar">
        <div className="preview-brand"><span>▰</span> QueryPilot AI</div>
        {["New Chat", "Connect Database", "Query History", "Saved Queries", "Settings"].map((item, i) => (
          <div className={`preview-menu ${i === 0 ? "selected" : ""}`} key={item}>
            <span>{["▢", "▤", "◷", "♧", "⚙"][i]}</span>{item}
          </div>
        ))}
      </aside>

      <div className="preview-main">
        <div className="preview-question">
          <span className="avatar">●</span>
          <div>Show me total sales by month for the last year</div>
          <span className="avatar user-avatar">P</span>
        </div>

        <div className="preview-tabs">
          <span className="active-tab">Generated SQL</span>
          <span>Results</span><span>Chart</span><span>Query Analysis</span>
        </div>

        <div className="sql-code">
          <span>SELECT</span><br />
          &nbsp;&nbsp;<em>DATE_TRUNC</em>(<b>'month'</b>, order_date) AS <b>month</b>,<br />
          &nbsp;&nbsp;<em>SUM</em>(total_amount) AS <b>total_sales</b><br />
          <span>FROM</span> orders<br />
          <span>WHERE</span> order_date &gt;= <em>NOW()</em> - <b>INTERVAL '1 year'</b><br />
          <span>GROUP BY</span> month<br />
          <span>ORDER BY</span> month;
          <small>▢ Copy</small>
        </div>

        <div className="result-heading"><span>Table</span> Chart</div>
        <div className="preview-results">
          <table>
            <thead><tr><td>month</td><td>total_sales</td></tr></thead>
            <tbody>
              {[
                ["2024-01-01", "125430"],
                ["2024-02-01", "142890"],
                ["2024-03-01", "138760"],
                ["2024-04-01", "156200"],
              ].map(([month, sales]) => (
                <tr key={month}><td>{month}</td><td>{sales}</td></tr>
              ))}
            </tbody>
          </table>
          <div className="mini-chart">
            {[55, 65, 62, 60, 72, 65, 70, 77, 80, 84, 96, 100].map((height, i) => (
              <div className="chart-column" style={{ height: `${height}%` }} key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Landing() {
    const navigate = useNavigate();
  return (
    <div className="landing-page">
      <header className="navbar">
        <a className="brand" href="#home"><span className="brand-icon">▰</span> QueryPilot <b>AI</b></a>
        <nav className="nav-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#use-cases">Use Cases</a>
          <a href="#pricing">Pricing</a>
          <a href="#docs">Docs</a>
        </nav>
        <div className="nav-actions">
          <button className="sign-in"
              onClick={() => navigate("/login")}
            >Sign In
          </button>
          <button className="primary-btn"
          onClick={()=> navigate("/register")}>
            Get Started
          </button>
        </div>
      </header>

      <main id="home">
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow">✧ &nbsp; Turn Data into Answers with AI</div>
            <h1>Ask Your Database<br /><span>in Plain English</span></h1>
            <p>
              QueryPilot AI lets you chat with your data, generate accurate
              SQL, get optimized queries, and explore results instantly —
              no SQL expertise required.
            </p>
            <div className="hero-actions">
              <button className="primary-btn large-btn">Get Started Free <span>→</span></button>
              <button className="demo-btn"><span>▷</span> Watch Demo</button>
            </div>
            <div className="trust-points">
              <span>✓ No credit card required</span>
              <span>✓ Secure connection</span>
              <span>✓ Works with your cloud database</span>
            </div>
          </div>
          <ProductPreview />
        </section>

        <section className="features" id="features">
          {features.map((feature) => (
            <article className="feature" key={feature.title}>
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </article>
          ))}
        </section>

        <section className="how-section" id="how-it-works">
          <h2>How It Works</h2>
          <p className="section-subtitle">Get answers from your data in just a few steps.</p>
          <div className="steps">
            {steps.map(([title, text, icon], i) => (
              <article className="step-card" key={title}>
                <span className="step-number">{i + 1}</span>
                <span className="step-icon">{icon}</span>
                <div><h3>{title}</h3><p>{text}</p></div>
                {i < steps.length - 1 && <span className="step-arrow">→</span>}
              </article>
            ))}
          </div>
          <div className="database-strip" id="databases">
            <strong>Supported Databases</strong>
            <span className="postgres"><b>◉</b> PostgreSQL</span>
            <span className="coming-soon">🐬 MySQL <small>Coming Soon</small></span>
            <span className="coming-soon">◒ SQLite <small>Coming Soon</small></span>
            <span className="coming-soon">❄ Snowflake <small>Coming Soon</small></span>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Landing;
