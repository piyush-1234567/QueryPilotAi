
import { useState } from "react";
import "./History.css";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";

const historyData = [
  { question: "Show total sales by month", sql: "SELECT DATE_TRUNC('month', order_date), SUM(total_amount) FROM orders GROUP BY 1;", status: "Success", date: "Oct 23, 2026 10:15 AM" },
  { question: "List all customers from Delhi", sql: "SELECT * FROM customers WHERE city = 'Delhi';", status: "Success", date: "Oct 23, 2026 09:42 AM" },
  { question: "Show orders from last 7 days", sql: "SELECT * FROM orders WHERE order_date >= CURRENT_DATE - INTERVAL '7 days';", status: "Failed", date: "Oct 22, 2026 06:30 PM" },
  { question: "Count number of users", sql: "SELECT COUNT(*) FROM users;", status: "Success", date: "Oct 22, 2026 04:12 PM" },
];

function History() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [selected, setSelected] = useState(null);

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
                      <td><code>{item.sql}</code></td>
                      <td><span className={`history-status ${item.status.toLowerCase()}`}>{item.status}</span></td>
                      <td>{item.date}</td>
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
              <pre>{selected.sql}</pre>
              <span className={`history-status ${selected.status.toLowerCase()}`}>{selected.status}</span>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

export default History;
