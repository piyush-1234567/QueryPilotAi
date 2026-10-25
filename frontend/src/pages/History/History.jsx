import "./History.css";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import { useState, useEffect } from "react";


function History() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [selected, setSelected] = useState(null);
  const [historyData, setHistoryData] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/query-history`, {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("access_token")}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load history");
        return res.json();
      })
      .then(setHistoryData)
      .catch(console.error);
  }, []);
  const filtered = historyData.filter((item) =>
    item.question.toLowerCase().includes(search.toLowerCase()) &&
    (status === "All" || item.status === status)
  );

  return (
    <div className="history-page">
      <Navbar />
      <div className="history-layout">
        <Sidebar />
        <main className="history-main">
          <div className="history-heading">
            <div>
              <h1>Query History</h1>
              <p>View and manage your previous queries.</p>
            </div>
            <input
              placeholder="Search queries..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="All">All Status</option>
              <option value="Success">Success</option>
              <option value="Failed">Failed</option>
            </select>
          </div>

          <section className="history-card">
            <div className="history-table-wrap">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>#</th><th>Question</th><th>Generated SQL</th>
                    <th>Status</th><th>Executed At</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item, index) => (
                    <tr key={item.question}>
                      <td>{index + 1}</td>
                      <td>{item.question}</td>
                      <td><code>{item.sql_query}</code></td>
                      <td><span className={`history-status ${item.status.toLowerCase()}`}>{item.status}</span></td>
                      <td>{new Date(item.created_at).toLocaleString()}</td>
                      <td>
                        <button onClick={() => setSelected(item)}>View</button>
                        <button onClick={() => {
                          sessionStorage.setItem("historyQuestion", item.question);
                          window.location.href = "/dashboard";
                        }}>▶</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && <p className="history-empty">No queries found.</p>}
            </div>
          </section>

          {selected && (
            <section className="history-card history-details">
              <div className="history-detail-heading">
                <h2>Query Details</h2>
                <button onClick={() => setSelected(null)}>✕</button>
              </div>
              <h4>Your Question</h4>
              <p>{selected.question}</p>
              <h4>Generated SQL</h4>
              <pre>{selected.sql_query}</pre>
              <span className={`history-status ${selected.status.toLowerCase()}`}>{selected.status}</span>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

export default History;
