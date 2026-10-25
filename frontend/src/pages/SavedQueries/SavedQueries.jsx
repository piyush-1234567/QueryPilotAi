import { useState, useEffect } from "react";
import "./SavedQueries.css";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";

function SavedQueries() {
  const [queries, setQueries] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchQueries() {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/saved-queries`,
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("access_token")}`,
            },
          }
        );

        const data = await response.json();
        if (!response.ok) throw new Error(data.detail || "Failed to load queries");

        setQueries(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchQueries();
  }, []);

  return (
    <div className="saved-page">
      <Navbar />

      <div className="saved-layout">
        <Sidebar />

        <main className="saved-main">
          <h1>Saved Queries</h1>
          <p>Your bookmarked SQL queries, all in one place.</p>

          {loading && <p>Loading saved queries...</p>}
          {error && <p className="saved-error">{error}</p>}

          {!loading && !error && queries.length === 0 && (
            <p className="saved-empty">No saved queries yet.</p>
          )}

          <div className="saved-grid">
            {queries.map((query) => (
              <article className="saved-card" key={query.id}>
                <h3>{query.question}</h3>
                <pre>{query.sql_query}</pre>
                <small>
                  Saved: {new Date(query.created_at).toLocaleString()}
                </small>
                <button
                  onClick={() =>
                    navigator.clipboard.writeText(query.sql_query)
                  }
                >
                  Copy SQL
                </button>
              </article>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

export default SavedQueries;