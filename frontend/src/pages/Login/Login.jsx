
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = e.target;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: form.email.value,
            password: form.password.value,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setError(result.detail || "Login failed");
        return;
      }

      sessionStorage.setItem("access_token", result.access_token);
      sessionStorage.setItem("display_name", result.name);
      sessionStorage.setItem("email", result.email);
      navigate("/dashboard");
    } catch {
      setError("Cannot connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <nav className="login-navbar">
        <Link to="/" className="login-brand">
          ◢QueryPilot <span>AI</span>
        </Link>
        <div className="login-nav-links">
          <a href="/#features">Features</a>
          <a href="/#how-it-works">How It Works</a>
          <a href="/#use-cases">Use Cases</a>
          <a href="/#pricing">Pricing</a>
          <a href="/#docs">Docs</a>
        </div>
        <div className="login-nav-actions">
          <Link className="login-nav-signin" to="/login">Sign In</Link>
          <Link className="login-nav-start" to="/register">Get Started</Link>
        </div>
      </nav>

      <main className="login-layout">
        <section className="login-hero">
          <div className="login-badge">✧ &nbsp; Turn Data into Answers with AI</div>
          <h1>
            Welcome Back
            <br />
            <span>Sign In to Continue.</span>
          </h1>
          <p className="login-description">
            Access your QueryPilot AI account and keep exploring your data
            with natural language.
          </p>

          <ul className="login-benefits">
            <li>Continue where you left off</li>
            <li>Your data stays secure</li>
            <li>Get instant insights with AI</li>
          </ul>

          <div className="login-preview">
            <div className="login-query">✦ &nbsp; Show me total sales by month</div>
            <div className="login-preview-content">
              <div className="login-chart">
                {[30, 45, 58, 76, 92].map((height, i) => (
                  <div key={i} style={{ height: `${height}px` }} />
                ))}
              </div>
              <div className="login-sql">
                <strong>SELECT ...</strong>
                <i /><i /><i />
              </div>
            </div>
            <div className="login-database">
              <span>▤</span>
              <p>Your Database<br />in Natural Language</p>
            </div>
          </div>
        </section>

        <section className="login-card">
          <div className="login-card-brand">
            ◢QueryPilot <span>AI</span>
          </div>
          <h2>Login to Your Account</h2>
          <p className="login-subtitle">
            Welcome back! Sign in to continue with QueryPilot AI
          </p>

          <form onSubmit={handleSubmit}>
            <label htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
            />

            <label htmlFor="login-password">Password</label>
            <div className="login-password-wrapper">
              <input
                id="login-password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="login-eye"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <div className="login-options">
              <label className="login-remember">
                <input type="checkbox" />
                Remember me
              </label>
              <button
                type="button"
                className="login-forgot"
                onClick={() => setError("Password recovery is not available yet.")}
              >
                Forgot password?
              </button>
            </div>

            {error && <p className="login-error">{error}</p>}

            <button className="login-submit" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign In  →"}
            </button>
          </form>

          <div className="login-divider"><span>OR</span></div>

          <button
            type="button"
            className="login-google"
            onClick={() => setError("Google sign-in is not configured yet.")}
          >
            <strong>G</strong> Continue with Google
          </button>

          <p className="login-register">
            Don't have an account? <Link to="/register">Create one</Link>
          </p>
        </section>
      </main>
    </div>
  );
}

export default Login;
