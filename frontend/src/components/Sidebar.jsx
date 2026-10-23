import { useLocation, useNavigate } from "react-router-dom";
import "./Sidebar.css";

const menuItems = [
  { icon: "▣", label: "Ask", path: "/dashboard" },
  { icon: "◷", label: "History", path: "/history" },
  { icon: "▤", label: "Connected DB", path: "/connect-database" },
  { icon: "♧", label: "Saved Queries", path: null },
  { icon: "⚙", label: "Settings", path: null },
];

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="app-sidebar">
      {menuItems.map(({ icon, label, path }) => (
        <button
          key={label}
          className={`app-sidebar-item ${
            path === location.pathname ? "selected" : ""
          }`}
          onClick={() =>
            path ? navigate(path) : alert(`${label} is not implemented yet.`)
          }
        >
          <span>{icon}</span>
          {label}
        </button>
      ))}
    </aside>
  );
}

export default Sidebar;
