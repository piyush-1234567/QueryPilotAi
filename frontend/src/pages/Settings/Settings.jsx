import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import "./Settings.css";

function Settings() {
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState(
    sessionStorage.getItem("display_name") || ""
  );
  const [databaseType, setDatabaseType] = useState("PostgreSQL");
  const [schema, setSchema] = useState("public");
  const [message, setMessage] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const email = sessionStorage.getItem("email") || "Email not available";

  async function saveProfile(e) {
    e.preventDefault();
    setMessage("");

    if (!displayName.trim()) {
        setMessage("Name cannot be empty.");
        return;
    }

    try {
        const response = await fetch(
        `${import.meta.env.VITE_API_URL}/update-profile`,
        {
            method: "PUT",
            headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("access_token")}`,
            },
            body: JSON.stringify({ name: displayName.trim() }),
        }
        );

        const data = await response.json();

        if (!response.ok) {
        throw new Error(data.detail || "Profile update failed.");
        }

        sessionStorage.setItem("display_name", displayName.trim());
        setMessage("Profile updated successfully!");
    } catch (error) {
        setMessage(error.message || "Unable to connect to the server.");
    }
    }
  async function updatePassword(e) {
    e.preventDefault();
    setMessage("");

    if (newPassword.length < 8) {
        setMessage("Password must contain at least 8 characters.");
        return;
    }

    if (newPassword !== confirmPassword) {
        setMessage("New passwords do not match.");
        return;
    }

    try {
        const response = await fetch(
        `${import.meta.env.VITE_API_URL}/change-password`,
        {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("access_token")}`,
            },
            body: JSON.stringify({
            current_password: currentPassword,
            new_password: newPassword,
            }),
        }
        );

        const data = await response.json();

        if (!response.ok) {
        throw new Error(data.detail || "Failed to change password.");
        }

        setMessage("Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
    } catch (error) {
        setMessage(error.message || "Unable to connect to the server.");
    }
    }

  function savePreferences(e) {
    e.preventDefault();
    sessionStorage.setItem("database_type", databaseType);
    sessionStorage.setItem("default_schema", schema);
    setMessage("Database preferences saved.");
  }

  function logout() {
    sessionStorage.clear();
    navigate("/login");
  }

  async function deleteAccount() {
        setMessage("");

        try {
            const response = await fetch(
            `${import.meta.env.VITE_API_URL}/delete-account`,
            {
                method: "DELETE",
                headers: {
                Authorization: `Bearer ${sessionStorage.getItem("access_token")}`,
                },
            }
            );

            const data = await response.json();

            if (!response.ok) {
            throw new Error(data.detail || "Account deletion failed.");
            }

            sessionStorage.clear();
            navigate("/login");
        } catch (error) {
            setMessage(error.message || "Unable to connect to the server.");
        }
    }
  return (
    <div className="settings-page">
      <Navbar />

      <div className="settings-layout">
        <Sidebar />

        <main className="settings-main">
          <h1>Settings</h1>
          <p className="settings-subtitle">
            Manage your account, security and database preferences.
          </p>

          {message && <div className="settings-message">{message}</div>}

          <section className="settings-card">
            <div className="settings-info">
              <span className="settings-icon">♙</span>
              <div>
                <h2>Profile Settings</h2>
                <p>Update your personal information.</p>
              </div>
            </div>

            <form className="settings-form" onSubmit={saveProfile}>
              <label>
                Display Name
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                  required
                />
              </label>

              <label>
                Email Address
                <input value={email} disabled />
              </label>

              <button type="submit">Save Changes</button>
            </form>
          </section>

          <section className="settings-card">
            <div className="settings-info">
              <span className="settings-icon">♙</span>
              <div>
                <h2>Security</h2>
                <p>Manage your account password.</p>
              </div>
            </div>

            <form className="settings-form password-form" onSubmit={updatePassword}>
              <label>
                Current Password
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  required
                />
              </label>

              <label>
                New Password
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  required
                />
              </label>

              <label>
                Confirm New Password
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                />
              </label>

              <button type="submit">Update Password</button>
            </form>
          </section>

          <section className="settings-card">
            <div className="settings-info">
              <span className="settings-icon">▤</span>
              <div>
                <h2>Database Preferences</h2>
                <p>Set your default database preferences.</p>
              </div>
            </div>

            <form className="settings-form" onSubmit={savePreferences}>
              <label>
                Default Database Type
                <select
                  value={databaseType}
                  onChange={(e) => setDatabaseType(e.target.value)}
                >
                  <option>PostgreSQL</option>
                  <option>MySQL</option>
                  <option>SQLite</option>
                </select>
              </label>

              <label>
                Default Schema (Optional)
                <input
                  value={schema}
                  onChange={(e) => setSchema(e.target.value)}
                  placeholder="e.g. public"
                />
              </label>

              <button type="submit">Save Preferences</button>
            </form>
          </section>

          <section className="settings-card danger-card">
            <div className="settings-info">
              <span className="settings-icon danger-icon">⚠</span>
              <div>
                <h2>Danger Zone</h2>
                <p>Permanently delete your account and data.</p>
              </div>
            </div>

            <button
              className="danger-button"
              onClick={() => {
                if (window.confirm("Request account deletion?")) {
                  deleteAccount();
                }
              }}
            >
              Delete Account
            </button>

            <div className="logout-section">
              <div>
                <h2>Logout</h2>
                <p>Sign out from your account.</p>
              </div>
              <button className="logout-button" onClick={logout}>
                Logout
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default Settings;