import "./Register.css";

function Register() {
  const handleSubmit = async (e) => {
  e.preventDefault();

  const form = e.target;
  const data = {
    name: form.fullName.value,
    email: form.email.value,
    password: form.password.value,
  };

  try {
    const response = await fetch(
    `${import.meta.env.VITE_API_URL}/register`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );

    const result = await response.json();

    if (!response.ok) {
      alert(result.detail || "Registration failed");
      return;
    }

    alert("Registration successful!");
    form.reset();
  } catch {
    alert("Cannot connect to the server. Is the backend running?");
  }
};


  return (
    <div className="register-page">
      <header className="register-navbar">
        <a href="/" className="register-logo">
          ◢ QueryPilot <span>AI</span>
        </a>

        <nav>
          <a href="/#features">Features</a>
          <a href="/#how-it-works">How It Works</a>
          <a href="/#use-cases">Use Cases</a>
          <a href="/#pricing">Pricing</a>
          <a href="/#docs">Docs</a>
        </nav>

        <div className="register-nav-actions">
          <button onClick={() => (window.location.href = "/login")}>
            Sign In
          </button>
          <button className="register-primary">Get Started</button>
        </div>
      </header>

      <main className="register-content">
        <section className="register-intro">
          <div className="register-badge">
            ✧ &nbsp; Turn Data into Answers with AI
          </div>

          <h1>
            Create Your Account
            <br />
            <span>Get Started.</span>
          </h1>

          <p>
            Join QueryPilot AI and start querying your data in plain English —
            no SQL expertise required.
          </p>

          <ul>
            <li>✓ &nbsp; Free to get started</li>
            <li>✓ &nbsp; Connect your database securely</li>
            <li>✓ &nbsp; Generate insights instantly</li>
          </ul>

          <div className="register-illustration">
            <div className="illustration-question">
              ✦ &nbsp; Show me total sales by month
            </div>
            <div className="illustration-chart">
              {[25, 38, 48, 68, 85].map((height, i) => (
                <div key={i} style={{ height: `${height}%` }} />
              ))}
            </div>
            <div className="illustration-sql">
              <strong>SELECT ...</strong>
              <div />
              <div />
              <div />
            </div>
          </div>
        </section>

        <section className="register-card">
          <div className="card-logo">
            ◢ QueryPilot <span>AI</span>
          </div>

          <h2>Create Your Account</h2>
          <p className="register-subtitle">
            Start your journey with QueryPilot AI
          </p>

          <form onSubmit={handleSubmit}>
            <label htmlFor="fullName">Full Name</label>
            <input
              id="fullName" 
              name="fullName"
              type="text"
              placeholder="Enter your full name"
              autoComplete="name"
              required
            />

            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
            />

            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Create a password"
              autoComplete="new-password"
              minLength={8}
              required
            />

            <div className="password-hints">
              <span>○ &nbsp; At least 8 characters</span>
              <span>○ &nbsp; Includes a number</span>
              <span>○ &nbsp; Includes a special character</span>
            </div>

            <button className="create-account-btn" type="submit">
              Create Account <span>→</span>
            </button>
          </form>

          <div className="register-divider"><span>OR</span></div>

          <div className="register-social">
            <button type="button" disabled>🌐 &nbsp; Continue with Google</button>
            <button type="button" disabled>● &nbsp; Continue with GitHub</button>
          </div>

          <p className="register-footer">
            Already have an account?{" "}
            <a href="/login">Sign in</a>
          </p>
        </section>
      </main>
    </div>
  );
}


export default Register;