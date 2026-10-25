import "./Navbar.css";

function Navbar() {
  return (
    <header className="app-navbar">
      <a href="/dashboard" className="app-navbar-brand">
        ◢ QueryPilot <b>AI</b>
      </a>

      <div className="app-navbar-actions">
        <a href="#docs">ⓘ Docs</a>
        <span className="app-navbar-avatar">
          {(sessionStorage.getItem("display_name") || "User").slice(0, 2).toUpperCase()}
        </span>
        <span>{sessionStorage.getItem("display_name") || "User"}</span>
      </div>
    </header>
  );
}

export default Navbar;