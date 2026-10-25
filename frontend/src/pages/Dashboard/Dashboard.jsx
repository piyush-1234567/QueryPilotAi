import { useState } from "react";
import "./Dashboard.css";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";

const examples = [
  ["Sales Analysis", "Show total sales by month for this year", "▥"],
  ["User Insights", "Top 5 users by total orders", "♙"],
  ["Product Analysis", "Most sold products", "◷"],
  ["Recent Records", "Show last 10 orders", "▤"],
];

function Dashboard() {
  
  const [question, setQuestion] = useState("");
  const [dbSchema, setDbSchema] = useState(
    () => sessionStorage.getItem("dbSchema") || ""
    );
  const [sql, setSql] = useState("");
  const [results, setResults] = useState([]);
  const [activeTab, setActiveTab] = useState("sql");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [database, setDatabase] = useState("");
  const [tableSearch, setTableSearch] = useState("");

  // No tables are shown until a cloud database is connected.
  

  async function generateSQL() {
    
    if (!question.trim()) {
      setError("Enter a question first.");
      return;
    }
    if (!dbSchema.trim()) {
      setError("Database schema is not available yet.");
      return;
    }

    setLoading(true);
    setError("");
    setResults([]);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/generate-sql`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question, db_schema: dbSchema }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "SQL generation failed");
      }

      setSql(data.sql);
      setActiveTab("sql");
    } catch (err) {
      setError(err.message || "Could not connect to the backend.");
    } finally {
      setLoading(false);
    }
  }

  async function runQuery() {
        if (!sessionStorage.getItem("dbSchema")) {
            setError("Please connect a database first.");
            return;
        }
        if (!question.trim()) {
            setError("Enter a question first.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await fetch(
            `${import.meta.env.VITE_API_URL}/execute-sql`,
            {
                method: "POST",
                headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${sessionStorage.getItem("access_token")}`
                } ,
                body: JSON.stringify({ question, db_schema: dbSchema }),
            }
            );

            const data = await response.json();
            if (!response.ok) throw new Error(data.detail || "Query failed");

            setSql(data.sql);
            setResults(data.results);
            setActiveTab("results");
        } catch (err) {
            setError(err.message || "Query execution failed.");
        } finally {
            setLoading(false);
        }
        }

  async function copySQL() {
    if (!sql) return;
    try {
      await navigator.clipboard.writeText(sql);
    } catch {
      setError("Could not copy SQL. Please copy it manually.");
    }
  }
  async function saveQuery() {
    if (!question.trim() || !dbSchema.trim()) {
      setError("Enter a question and connect a database first.");
      return;
}
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/save-query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("access_token")}`,
      },
      body: JSON.stringify({ question, db_schema: dbSchema }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || "Failed to save query");

    alert(data.message);
  } catch (err) {
    setError(err.message);
  }
}
  return (
    <div className="dashboard">
      <Navbar />

      <div className="dash-body">
        <Sidebar />

        <main className="dash-main">
          <section className="dash-heading">
            <h1>Ask Your Data</h1>
            <p>Turn your questions into SQL queries and get instant answers.</p>
          </section>

          <section className="dash-query-card">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={"✧   Ask something about your database...\ne.g. Show total sales by month"}
              rows={3}
            />
            <div className="dash-query-actions">
              <select
                aria-label="Select database"
                value={database}
                onChange={(e) => setDatabase(e.target.value)}
              >
                <option value="">Connect a cloud database</option>
              </select>
              <button
                className="dash-primary"
                onClick={generateSQL}
                disabled={loading}
              >
                {loading ? "Generating..." : "Generate SQL  →"}
              </button>
            </div>
          </section>

          <div className="dash-suggestions">
            {[
              "Show all users",
              "Total sales by month",
              "Top 5 products",
              "Count of orders",
              "Show recent records",
            ].map((item) => (
              <button key={item} onClick={() => setQuestion(item)}>
                <span>→</span> {item}
              </button>
            ))}
          </div>

          {error && <p className="dash-error">{error}</p>}

          <section className="dash-editor">
            <div className="dash-editor-toolbar">
              <div className="dash-tabs">
                <button
                  className={activeTab === "sql" ? "active" : ""}
                  onClick={() => setActiveTab("sql")}
                >
                  {"</>"} Generated SQL
                </button>
                <button
                  className={activeTab === "results" ? "active" : ""}
                  onClick={() => setActiveTab("results")}
                >
                  ▦ Results
                </button>
              </div>
              <div className="dash-editor-actions">
                <button onClick={runQuery} disabled={loading}>
                  ▷ Run Query
                </button>
                <button onClick={saveQuery} disabled={loading || !question.trim() || !dbSchema}>
                  ☆ Save Query
                </button>
                <button onClick={copySQL}>▢ Copy</button>
              </div>
            </div>

            {activeTab === "sql" ? (
              <pre className="dash-sql">
                {sql || "-- SQL will appear after a database is connected"}
              </pre>
            ) : (
              <div className="dash-results">
                {results.length > 0 ? (
                    <table className="results-table">
                        <thead>
                        <tr>
                            {Object.keys(results[0]).map((key) => (
                            <th key={key}>{key}</th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {results.map((row, i) => (
                            <tr key={i}>
                            {Object.values(row).map((value, j) => (
                                <td key={j}>{String(value ?? "")}</td>
                            ))}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    ) : (
                    <p>No results found.</p>
                    )}
              </div>
            )}
          </section>

          <section className="dash-examples">
            <h2>Try these examples</h2>
            <div className="dash-example-grid">
              {examples.map(([title, text, icon]) => (
                <button
                  className="dash-example"
                  key={title}
                  onClick={() => setQuestion(text)}
                >
                  <span className="dash-example-icon">{icon}</span>
                  <span>
                    <strong>{title}</strong>
                    <small>{text}</small>
                  </span>
                  <b className="dash-example-arrow">→</b>
                </button>
              ))}
            </div>
          </section>
        </main>

        <aside className="dash-right">
          <section className="dash-panel">
            <h3>▤ &nbsp; Database</h3>
            <select
              value={database}
              onChange={(e) => setDatabase(e.target.value)}
            >
              <option value={sessionStorage.getItem("dbName") || ""}>
                {sessionStorage.getItem("dbName") || "No database connected"}
                </option>
            </select>
            <small>Connect your own cloud database to get started.</small>
          </section>

          <section className="dash-panel">
            <h3>▦ &nbsp; Schema <span>↻</span></h3>
            <input
              placeholder="⌕  Search tables..."
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
            />
            {Object.entries(JSON.parse(dbSchema || "{}"))
                .filter(([table]) =>
                    table.toLowerCase().includes(tableSearch.toLowerCase())
                )
                .map(([table, columns]) => (
                    <div key={table}>
                    <strong>{table}</strong>
                    <p>{columns.join(", ")}</p>
                    </div>
                ))}
          </section>
        </aside>
      </div>
    </div>
  );
}

export default Dashboard;
