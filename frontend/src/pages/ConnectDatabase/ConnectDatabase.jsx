import { useState } from "react";

import "./ConnectDatabase.css";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";


function ConnectDatabase() {
  
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e) {
  e.preventDefault();
  setLoading(true);
  setMessage("");
  
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/connect-database`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connection_url: url }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Connection failed");
    }

    sessionStorage.setItem("dbSchema", JSON.stringify(data.schema));
    sessionStorage.setItem("dbName", data.database);
    setMessage(JSON.stringify(data.schema, null, 2));
  } catch (error) {
    setMessage(error.message);
  } finally {
    setLoading(false);
  }
}
async function disconnectDatabase() {
  try {
    await fetch(`${import.meta.env.VITE_API_URL}/disconnect-database`, {
      method: "POST",
    });

    sessionStorage.removeItem("dbSchema");
    sessionStorage.removeItem("dbName");
    setUrl("");
    setMessage("Database disconnected.");
  } catch {
    setMessage("Failed to disconnect database.");
  }
}
  

  return (
    <div className="connect-app">
       <Navbar />

      <div className="connect-layout">
        <Sidebar />

        <main className="connect-main">
          <div className="connect-heading">
            <h1>Connect Database</h1>
            <p>Connect your cloud database to start asking questions in natural language.</p>
          </div>

          <section className="connect-form-card">
            <div className="connect-steps">
              <span className="current">1 <b>Connection Details</b></span>
              <i />
              <span>2 <b>Test Connection</b></span>
              <i />
              <span>3 <b>Ready to Query</b></span>
            </div>

            <div className="connect-title">
              <div className="connect-db-icon">▤</div>
              <div>
                <h2>PostgreSQL Connection</h2>
                <p>Enter your cloud PostgreSQL connection URL to connect your database.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <label htmlFor="connection-url">Connection URL</label>
              <input
                id="connection-url"
                type="password"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="postgresql://user:password@host:5432/database"
                required
              />

              <div className="connect-example">
                <strong>ⓘ &nbsp; Example connection URL</strong>
                <code>postgresql://myuser:mypassword@db.example.com:5432/mydatabase</code>
              </div>

              <button className="connect-test" disabled={loading}>
                {loading ? "Testing..." : "▷  Test Connection"}
              </button>
              <button 
                    type="button" 
                    onClick={disconnectDatabase}
                    className="connect-disconnect"
                    >
                    
                Disconnect Database
              </button>
            </form>

            {message && <p className="connect-message">{message}</p>}

            <p className="connect-footnote">
              🔒 &nbsp; Never share your database credentials publicly.
            </p>
          </section>
        </main>

        <aside className="connect-right">
          <section className="connect-info quick">
            <h3>ϟ &nbsp; Quick &amp; Secure</h3>
            <p>Connect your cloud PostgreSQL database and start querying with AI.</p>
          </section>

          <section className="connect-info providers">
            <h3>▤ &nbsp; Supported Providers</h3>
            <p>🟢 &nbsp; Neon</p>
            <p>🟩 &nbsp; Supabase</p>
            <p>⬛ &nbsp; Render</p>
            <p>🟦 &nbsp; AWS RDS</p>
            <p>☁️ &nbsp; Google Cloud SQL</p>
            <p>🐘 &nbsp; Any PostgreSQL cloud provider</p>
          </section>

          <section className="connect-info safe">
            <h3>🛡️ &nbsp; Your Data Stays Safe</h3>
            <p>Use a dedicated, least-privilege database account for QueryPilot AI.</p>
          </section>
        </aside>
      </div>
    </div>
  );
}

export default ConnectDatabase;
