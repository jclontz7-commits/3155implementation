const DEMO_USERNAME = "student";
const DEMO_PASSWORD = "student123";
const SESSION_KEY = "campus-portal-student";

const app = document.querySelector("#app");

const routes = {
  "#/": renderStudentLogin,
  "#/student-login": renderStudentLogin,
  "#/professor-login": renderProfessorLogin,
  "#/sign-up": renderSignUp,
  "#/student-portal": renderStudentPortal,
};

function page(content, activeRoute = "") {
  app.innerHTML = `
    <div class="page-shell">
      <header class="site-header">
        <a class="brand" href="#/" aria-label="Campus Portal home">
          <span class="brand-mark" aria-hidden="true">C</span>
          <span>Campus Portal</span>
        </a>
        <nav class="main-nav" aria-label="Main navigation">
          <a href="#/student-login"${activeRoute === "#/student-login" ? ' aria-current="page"' : ""}>Student</a>
          <a href="#/professor-login"${activeRoute === "#/professor-login" ? ' aria-current="page"' : ""}>Professor</a>
          <a href="#/sign-up"${activeRoute === "#/sign-up" ? ' aria-current="page"' : ""}>Sign up</a>
        </nav>
      </header>
      <main id="main-content">${content}</main>
      <footer class="site-footer">A simple place to start your campus day.</footer>
    </div>
  `;
}

function renderStudentLogin() {
  app.innerHTML = `
    <main class="login-screen">
      <section class="login-stack" aria-labelledby="login-title">
        <div class="login-panel">
          <h1 id="login-title">LOGIN</h1>
          <form id="student-login-form">
            <label class="visually-hidden" for="username">Username</label>
            <input id="username" name="username" type="text" placeholder="USERNAME" autocomplete="username" autocapitalize="none" required>
            <label class="visually-hidden" for="password">Password</label>
            <input id="password" name="password" type="password" placeholder="PASSWORD" autocomplete="current-password" required>
            <p id="login-error" class="login-error" role="alert" hidden>Invalid username or password.</p>
          </form>
        </div>
        <div class="login-actions">
          <a class="login-action" href="#/professor-login">Professor Login</a>
          <button class="login-action" type="submit" form="student-login-form">Student Login</button>
        </div>
        <a class="login-action signup-action" href="#/sign-up">Sign Up</a>
      </section>
    </main>
  `;

  const form = document.querySelector("#student-login-form");
  const error = document.querySelector("#login-error");

  form.addEventListener("input", () => {
    error.hidden = true;
    form.querySelectorAll("input").forEach((input) => input.removeAttribute("aria-invalid"));
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const username = String(formData.get("username")).trim().toLowerCase();
    const password = String(formData.get("password"));

    if (username !== DEMO_USERNAME || password !== DEMO_PASSWORD) {
      error.hidden = false;
      form.querySelectorAll("input").forEach((input) => input.setAttribute("aria-invalid", "true"));
      form.querySelector("#password").focus();
      return;
    }

    sessionStorage.setItem(SESSION_KEY, DEMO_USERNAME);
    window.location.hash = "#/student-portal";
  });
}

function renderProfessorLogin() {
  renderUnavailable(
    "Professor sign in",
    "Professor sign in is a separate flow and isn't included in this student login demo.",
    "#/professor-login",
  );
}

function renderSignUp() {
  renderUnavailable(
    "Create an account",
    "Account registration is a separate flow and isn't configured in this student login demo.",
    "#/sign-up",
  );
}

function renderUnavailable(title, description, activeRoute) {
  page(`
    <section class="message-card">
      <p class="eyebrow">CAMPUS PORTAL</p>
      <h1>${title}</h1>
      <p>${description}</p>
      <a class="button button-secondary" href="#/student-login">Go to student login <span aria-hidden="true">→</span></a>
    </section>
  `, activeRoute);
}

function renderStudentPortal() {
  if (sessionStorage.getItem(SESSION_KEY) !== DEMO_USERNAME) {
    window.location.hash = "#/student-login";
    return;
  }

  page(`
    <section class="portal-card">
      <div class="portal-icon" aria-hidden="true">✓</div>
      <p class="eyebrow">STUDENT PORTAL</p>
      <h1>Welcome, student.</h1>
      <p>You’re signed in to the student portal demo.</p>
      <button class="button button-secondary" id="logout-button" type="button">Log out</button>
    </section>
  `, "#/student-login");

  document.querySelector("#logout-button").addEventListener("click", () => {
    sessionStorage.removeItem(SESSION_KEY);
    window.location.hash = "#/student-login";
  });
}

function renderRoute() {
  const route = window.location.hash || "#/";
  (routes[route] || renderStudentLogin)();
}

window.addEventListener("hashchange", renderRoute);
renderRoute();
