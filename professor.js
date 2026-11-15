// Professor views use the server API; no database credentials or identity IDs live here.
let professorEpoch = 0;
window.addEventListener('hashchange', () => { professorEpoch += 1; });
const professorEscape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

async function professorApi(path, options = {}) {
  let response;
  try { response = await fetch(path, { credentials: 'same-origin', ...options }); }
  catch { throw new Error('Could not reach the profile server. Run npm start and try again.'); }
  let result;
  try { result = await response.json(); }
  catch { throw new Error('The professor profile requires the Node server. Run npm start instead of the static Python server.'); }
  if (!response.ok) {
    const error = new Error(result.message || 'Your request could not be completed.');
    error.status = response.status;
    error.issues = result.issues || [];
    throw error;
  }
  return result;
}

function renderProfessorSignIn() {
  page(`<section class="message-card professor-entry" aria-labelledby="professor-login-title">
    <p class="eyebrow">PROFESSOR PORTAL</p><h1 id="professor-login-title">Your research starts here.</h1>
    <p>View your profile, update your information, and see your published research opportunities.</p>
    <p class="professor-demo-note">Local development demo · Uses the fictional, seeded professor account. This is not a real account sign-in.</p>
    <button class="button professor-primary" id="professor-sign-in">Continue as sample professor</button>
    <p id="professor-entry-status" class="professor-status" role="status"></p>
    <a href="#/student-login">Back to student login</a>
  </section>`, '#/professor-login');
  const epoch = professorEpoch;
  document.querySelector('#professor-sign-in').onclick = async event => {
    event.target.disabled = true;
    try {
      await professorApi('/api/dev-professor-session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
      if (epoch === professorEpoch) location.hash = '#/professor-portal';
    } catch (error) {
      if (epoch !== professorEpoch) return;
      document.querySelector('#professor-entry-status').textContent = error.message;
      event.target.disabled = false;
    }
  };
}

async function renderProfessorPortal() {
  const epoch = professorEpoch;
  page('<p class="professor-loading" role="status">Loading your professor portal…</p>', '#/professor-login');
  try {
    const { profile, posts } = await professorApi('/api/professor/profile');
    if (epoch !== professorEpoch) return;
    page(`<section class="portal-card professor-entry"><p class="eyebrow">PROFESSOR PORTAL</p>
      <h1>Welcome, ${professorEscape(profile.displayName)}.</h1><p>You have ${posts.length} published research ${posts.length === 1 ? 'opportunity' : 'opportunities'}.</p>
      <a class="button professor-primary" href="#/professor-profile">My professor profile</a>
      <a class="button button-secondary" href="#/messages">Messages</a>
      <button class="button button-secondary" id="professor-home-logout">Log out</button>
      <p class="professor-demo-note">Local sample-professor session</p><p id="home-status" role="status"></p></section>`, '#/professor-login');
    document.querySelector('#professor-home-logout').onclick = async () => {
      try { await professorApi('/api/professor/logout', { method: 'POST' }); if (epoch === professorEpoch) location.hash = '#/professor-login'; }
      catch (error) { if (epoch === professorEpoch) document.querySelector('#home-status').textContent = error.message; }
    };
  } catch (error) {
    if (epoch !== professorEpoch) return;
    if (error.status === 401) { location.hash = '#/professor-login'; return; }
    page(`<section class="message-card"><h1>Portal unavailable</h1><p role="alert">${professorEscape(error.message)}</p><a href="#/professor-login">Return to professor sign-in</a></section>`, '#/professor-login');
  }
}

async function renderProfessorProfile() {
  const epoch = professorEpoch;
  const current = () => epoch === professorEpoch && location.hash === '#/professor-profile';
  app.innerHTML = '<main id="main-content" class="profile-loading" role="status">Loading your professor profile…</main>';
  let profile, posts;
  let editing = false;
  let notice = '';
  try { ({ profile, posts } = await professorApi('/api/professor/profile')); }
  catch (error) {
    if (!current()) return;
    if (error.status === 401) { location.hash = '#/professor-login'; return; }
    app.innerHTML = `<main id="main-content" class="profile-loading"><h1>Profile unavailable</h1><p role="alert">${professorEscape(error.message)}</p><button id="retry-professor">Try again</button><a href="#/professor-portal">Back to portal</a></main>`;
    document.querySelector('#retry-professor').onclick = renderProfessorProfile;
    return;
  }
  if (!current()) return;
  function status(message, error = false) {
    if (!current()) return;
    const output = document.querySelector('#professor-status');
    if (!output) return;
    output.textContent = message;
    output.classList.toggle('is-error', error);
  }
  function input(label, name, max, type = 'text') {
    return `<label for="prof-${name}">${label}<input id="prof-${name}" name="${name}" type="${type}" maxlength="${max}" value="${professorEscape(profile[name])}"${name === 'displayName' ? ' required autocomplete="name"' : ''}></label>`;
  }
  function textarea(label, name, max, value = profile[name]) {
    return `<label for="prof-${name}">${label}<textarea id="prof-${name}" name="${name}" rows="${name === 'about' ? 8 : 3}" maxlength="${max}">${professorEscape(value)}</textarea></label>`;
  }
  function editor() {
    return `<form id="professor-editor" class="profile-form professor-form" aria-label="Edit professor profile">
      ${input('Name', 'displayName', 80)}${input('Degree', 'degree', 200)}${input('Department', 'department', 120)}
      ${textarea('Education', 'education', 2000)}${textarea('About Me', 'about', 5000)}
      ${textarea('Research areas (one per line, up to 20)', 'researchAreas', 2020, profile.researchAreas.join('\n'))}
      ${input('Contact email (optional)', 'contactEmail', 254, 'email')}
      ${input('Virtual office HTTPS link (optional)', 'virtualOfficeUrl', 2048, 'url')}
      ${textarea('Office hours', 'officeHours', 500)}
      <div class="profile-form-actions"><button class="profile-save" type="submit">Save changes</button><button id="cancel-professor-edit" type="button">Cancel</button></div>
      <p>Your changes are saved to PostgreSQL when you select Save changes.</p></form>`;
  }
  function draw() {
    if (!current()) return;
    app.innerHTML = `<div class="student-profile professor-screen">
      <header class="profile-header"><button class="menu-toggle" id="professor-menu" aria-label="Open professor navigation" aria-expanded="false" aria-controls="professor-nav"><img src="assets/professor-menu.svg" alt=""></button>
      <nav id="professor-nav" class="professor-nav" aria-label="Professor navigation" hidden><a href="#/professor-portal">Professor portal</a><a href="#/professor-profile" aria-current="page">My profile</a><a href="#/messages">Messages</a><button id="professor-posts-nav">Published opportunities</button><button id="professor-logout">Log out</button></nav></header>
      <main id="main-content" class="profile-main"><div class="profile-toolbar"><a class="profile-back" href="#/professor-portal">Back</a>${editing ? '' : '<button class="profile-edit" id="edit-professor">Edit profile</button>'}</div>
      <h1>${professorEscape(profile.displayName)}</h1>
      ${editing ? editor() : `<div class="professor-identity"><img class="profile-photo" src="${professorEscape(profile.photo?.url || 'assets/professor-avatar.png')}" alt="Professor profile picture"><div><p>Degree: ${professorEscape(profile.degree || 'Not added')}</p>${profile.department ? `<p>${professorEscape(profile.department)}</p>` : ''}</div></div>
      <div class="professor-picture"><label for="professor-photo">Change picture</label><input class="visually-hidden" id="professor-photo" type="file" accept="image/png,image/jpeg,image/webp" aria-describedby="professor-photo-hint"><span id="professor-photo-hint">PNG, JPEG, WebP · Up to 2 MB</span></div>
      <section class="professor-about" aria-labelledby="professor-about-title"><h2 id="professor-about-title">About Me:</h2>${profile.education ? `<h3>Education</h3><p>${professorEscape(profile.education)}</p>` : ''}
      ${profile.researchAreas.length ? `<h3>Research Areas</h3><p>${profile.researchAreas.map(professorEscape).join(', ')}</p>` : ''}
      <h3>About</h3><p>${professorEscape(profile.about || 'No biography added yet. Select Edit profile to introduce yourself.')}</p></section>
      <section class="professor-contact" aria-labelledby="professor-contact-title"><h2 id="professor-contact-title">Contact:</h2><dl><dt>Email</dt><dd>${profile.contactEmail ? `<a href="mailto:${professorEscape(profile.contactEmail)}">${professorEscape(profile.contactEmail)}</a>` : 'Not added'}</dd><dt>Virtual office</dt><dd>${safeOffice(profile.virtualOfficeUrl)}</dd><dt>Office hours</dt><dd>${professorEscape(profile.officeHours || 'Not added')}</dd></dl></section>`}
      <p id="professor-status" class="profile-status" role="status" aria-live="polite">${professorEscape(notice)}</p>
      <section class="applied-listings professor-posts" id="professor-posts" aria-labelledby="professor-posts-title"><h2 id="professor-posts-title">Posted Research Opportunities</h2><p class="sample-note">${posts.length} published ${posts.length === 1 ? 'opportunity' : 'opportunities'}</p>
      ${posts.length ? `<ul>${posts.map(post => `<li><details><summary>${professorEscape(post.title)}</summary><p>${professorEscape(post.description)}</p>${post.duration ? `<p>Duration: ${professorEscape(post.duration)}</p>` : ''}${post.hoursMin ? `<p>${post.hoursMin}–${post.hoursMax} hours per week</p>` : ''}<p>Deadline: ${professorEscape(new Date(post.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }))}</p></details></li>`).join('')}</ul>` : '<p class="professor-empty">You haven’t published any research opportunities yet.</p>'}</section>
      <p class="professor-demo-note">Local sample-professor session · Data saved in PostgreSQL</p></main></div>`;
    bind();
  }
  function safeOffice(url) {
    try { if (url && new URL(url).protocol === 'https:') return `<a href="${professorEscape(url)}" target="_blank" rel="noopener noreferrer">Open virtual office ↗</a>`; } catch { /* Treat malformed data as missing. */ }
    return 'Not added';
  }
  function bind() {
    const menu = document.querySelector('#professor-menu');
    menu.onclick = () => {
      const open = menu.getAttribute('aria-expanded') !== 'true';
      menu.setAttribute('aria-expanded', String(open)); document.querySelector('#professor-nav').hidden = !open;
    };
    document.querySelector('#professor-posts-nav').onclick = () => {
      document.querySelector('#professor-posts').scrollIntoView({ behavior: 'smooth' });
      document.querySelector('#professor-nav').hidden = true; menu.setAttribute('aria-expanded', 'false');
    };
    document.querySelector('#professor-logout').onclick = async () => {
      try { await professorApi('/api/professor/logout', { method: 'POST' }); if (current()) location.hash = '#/professor-login'; }
      catch (error) { status(error.message, true); }
    };
    if (!editing) {
      document.querySelector('#edit-professor').onclick = () => { editing = true; notice = ''; draw(); document.querySelector('[name="displayName"]').focus(); };
      document.querySelector('#professor-photo').onchange = async event => {
        const file = event.target.files[0]; if (!file) return;
        if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || !file.size || file.size > 2097152) {
          status('Choose a nonempty PNG, JPEG, or WebP picture up to 2 MB.', true); event.target.value = ''; return;
        }
        event.target.disabled = true; document.querySelector('#edit-professor').disabled = true;
        status('Saving picture…');
        try {
          const result = await professorApi('/api/professor/photo', { method: 'POST', headers: { 'Content-Type': file.type, 'X-File-Name': encodeURIComponent(file.name), 'X-Profile-Version': String(profile.version) }, body: file });
          profile = result.profile; notice = 'Profile picture saved.'; draw();
        } catch (error) {
          status(error.status === 409 ? `${error.message} Reload the profile to see the latest version.` : error.message, true);
          if (current()) { event.target.disabled = false; event.target.value = ''; document.querySelector('#edit-professor').disabled = false; }
        }
      };
      return;
    }
    document.querySelector('#cancel-professor-edit').onclick = () => { editing = false; notice = 'Changes canceled.'; draw(); document.querySelector('#edit-professor').focus(); };
    document.querySelector('#professor-editor').onsubmit = async event => {
      event.preventDefault();
      const form = event.currentTarget;
      const values = new FormData(form);
      const payload = {};
      for (const name of ['displayName', 'degree', 'department', 'education', 'about', 'contactEmail', 'virtualOfficeUrl', 'officeHours']) payload[name] = String(values.get(name)).trim();
      if (!payload.displayName) { status('Name is required.', true); form.elements.displayName.focus(); return; }
      payload.contactEmail ||= null; payload.virtualOfficeUrl ||= null;
      payload.researchAreas = String(values.get('researchAreas')).split('\n').map(v => v.trim()).filter(Boolean);
      payload.expectedVersion = profile.version;
      form.querySelectorAll('input, textarea, button').forEach(control => { control.disabled = true; });
      status('Saving changes…');
      form.querySelectorAll('[aria-invalid]').forEach(input => input.removeAttribute('aria-invalid'));
      try {
        const result = await professorApi('/api/professor/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        profile = result.profile; editing = false; notice = 'Profile changes saved.'; draw();
        if (current()) document.querySelector('#edit-professor').focus();
      } catch (error) {
        if (!current()) return;
        if (error.status === 401) { location.hash = '#/professor-login'; return; }
        for (const issue of error.issues || []) form.elements.namedItem(issue.field)?.setAttribute('aria-invalid', 'true');
        status(error.status === 409 ? `${error.message} Your edits are still here. Copy them before reloading.` : [error.message, ...(error.issues || []).map(issue => `${issue.field}: ${issue.message}`)].join(' '), true);
        form.querySelectorAll('input, textarea, button').forEach(control => { control.disabled = false; });
        form.querySelector('[aria-invalid]')?.focus();
        if (error.status === 409) {
          const reload = document.createElement('button');
          reload.type = 'button'; reload.textContent = 'Reload latest profile (discards these edits)';
          reload.onclick = renderProfessorProfile;
          document.querySelector('#professor-status').append(' ', reload);
        }
      }
    };
  }
  draw();
}
