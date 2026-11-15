// Profile and file data stay in this browser; replace this adapter with an API
// when the portal has real student accounts and application records.
const PROFILE_DEFAULT = {
  id: 'student', name: 'Emily Evans', major: 'Computer Science',
  concentration: 'Cybersecurity', year: 'Senior',
  about: 'I am a very interesting student who loves learning about research. I really want this research opportunity. It would help me a lot.',
  photo: null, resume: null,
  applications: [
    { title: 'Opportunity 1', organization: 'Computer Science Dept.', date: 'Oct 12' },
    { title: 'Opportunity 3', organization: 'Tech Corp', date: 'Oct 08' },
    { title: 'Opportunity 4', organization: 'StartUp Inc.', date: 'Sep 28' },
  ],
};
const profileUrls = [];
function escapeProfile(value) {
  return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}
function profileFileUrl(blob) {
  const url = URL.createObjectURL(blob);
  profileUrls.push(url);
  return url;
}
function releaseProfileUrls() {
  profileUrls.splice(0).forEach(url => URL.revokeObjectURL(url));
}
window.addEventListener('hashchange', releaseProfileUrls);
let profileDatabase;
function openProfileDatabase() {
  if (!profileDatabase) profileDatabase = new Promise((resolve, reject) => {
    const request = indexedDB.open('campus-student-profiles', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('profiles', { keyPath: 'id' });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return profileDatabase;
}
async function readProfile() {
  const db = await openProfileDatabase();
  return new Promise((resolve, reject) => {
    const request = db.transaction('profiles').objectStore('profiles').get('student');
    request.onsuccess = () => resolve(request.result || structuredClone(PROFILE_DEFAULT));
    request.onerror = () => reject(request.error);
  });
}
async function saveProfile(profile) {
  const db = await openProfileDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('profiles', 'readwrite');
    transaction.objectStore('profiles').put(profile);
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}

async function renderStudentProfile() {
  if (sessionStorage.getItem(SESSION_KEY) !== DEMO_USERNAME) {
    window.location.hash = '#/student-login';
    return;
  }
  app.innerHTML = '<main class="profile-loading" aria-live="polite">Loading your profile…</main>';
  let profile;
  try { profile = await readProfile(); }
  catch {
    if (location.hash === '#/student-profile') app.innerHTML = '<main class="profile-loading"><p role="alert">Your profile could not be opened. Enable browser storage and reload to try again.</p><a href="#/student-portal">Back to portal</a></main>';
    return;
  }
  if (location.hash !== '#/student-profile') return;
  let editing = false;
  let pendingPhoto;
  let message = '';
  function draw() {
    if (location.hash !== '#/student-profile' || sessionStorage.getItem(SESSION_KEY) !== DEMO_USERNAME) return;
    releaseProfileUrls();
    app.innerHTML = `
      <div class="student-profile">
        <header class="profile-header">
          <button class="menu-toggle" aria-label="Open menu" aria-expanded="false" aria-controls="profile-nav"><img src="assets/menu.svg" alt=""></button>
          <nav id="profile-nav" aria-label="Student navigation" hidden>
            <a href="#/student-portal">Student portal</a>
            <a href="#/student-profile" aria-current="page">My profile</a>
            <a href="#/messages">Messages</a>
            <a href="#applications">Applied listings</a>
            <button id="profile-logout" type="button">Log out</button>
          </nav>
        </header>
        <main id="main-content" class="profile-main">
          <div class="profile-toolbar"><a class="profile-back" href="#/student-portal">Back</a>
            ${!editing ? '<button class="profile-edit" id="edit-profile">Edit profile</button>' : ''}</div>
          <h1>${escapeProfile(profile.name)}</h1>
          ${editing ? editMarkup() : `<div class="profile-identity">
            <img class="profile-photo" src="${profile.photo ? profileFileUrl(profile.photo) : 'assets/avatar.png'}" alt="Profile picture of ${escapeProfile(profile.name)}">
            <dl><div><dt>Major:</dt><dd>${escapeProfile(profile.major)}</dd></div>
            ${profile.concentration ? `<div><dt>Concentration:</dt><dd>${escapeProfile(profile.concentration)}</dd></div>` : ''}
            <div><dt>Year:</dt><dd>${escapeProfile(profile.year)}</dd></div></dl>
          </div><section class="profile-about" aria-labelledby="about-title"><h2 id="about-title">About Me:</h2><p>${escapeProfile(profile.about) || 'Add a short introduction using Edit profile.'}</p></section>`}
          <section class="profile-resume" aria-label="Resume"${editing ? ' hidden' : ''}>
            <img class="upload-icon" src="assets/upload.png" alt="">
            ${profile.resume ? `<div class="resume-file"><strong>${escapeProfile(profile.resume.name)}</strong><span>${Math.ceil(profile.resume.blob.size / 1024)} KB</span><a href="${profileFileUrl(profile.resume.blob)}" download="${escapeProfile(profile.resume.name)}">Download resume</a><button id="remove-resume" type="button">Remove</button></div>` : ''}
            <label class="resume-upload" for="resume-file">${profile.resume ? 'Replace Resume' : 'Upload Resume'}</label>
            <input class="visually-hidden" id="resume-file" type="file" accept=".pdf,.doc,.docx" aria-describedby="resume-hint">
            <p id="resume-hint">PDF, DOC, or DOCX · Up to 5 MB</p>
          </section>
          <p id="profile-status" class="profile-status" role="status">${escapeProfile(message)}</p>
          <section class="applied-listings" id="applications" aria-labelledby="applied-title"><h2 id="applied-title">Applied Listings</h2>
            <p class="sample-note">Sample applications for this demo</p>
            <ul>${profile.applications.length ? profile.applications.map(item => `<li><div class="listing-icon"><img src="assets/briefcase.svg" alt=""></div><div class="listing-copy"><h3>${escapeProfile(item.title)}</h3><p>${escapeProfile(item.organization)}</p></div><span>${escapeProfile(item.date)}</span></li>`).join('') : '<li>You haven’t applied for any opportunities yet.</li>'}</ul>
          </section>
        </main>
      </div>`;
    bind();
  }
  function editMarkup() {
    return `<form id="profile-form" class="profile-form">
      <label>Name<input name="name" value="${escapeProfile(profile.name)}" required maxlength="80" autocomplete="name"></label>
      <label>Major<input name="major" value="${escapeProfile(profile.major)}" required maxlength="100"></label>
      <label>Concentration (optional)<input name="concentration" value="${escapeProfile(profile.concentration)}" maxlength="100"></label>
      <label>Year in school<select name="year">${['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate', 'Other'].map(year => `<option${profile.year === year ? ' selected' : ''}>${year}</option>`).join('')}</select></label>
      <label>About Me<textarea name="about" rows="5" maxlength="1000">${escapeProfile(profile.about)}</textarea></label>
      <label>Profile picture<input id="photo-file" type="file" accept="image/png,image/jpeg,image/webp" aria-describedby="photo-hint"></label>
      <p id="photo-hint">PNG, JPG, or WebP · Up to 2 MB</p>
      <img id="photo-preview" class="profile-photo" src="${profile.photo ? profileFileUrl(profile.photo) : 'assets/avatar.png'}" alt="Profile picture preview">
      <div class="profile-form-actions"><button class="profile-save" type="submit">Save changes</button><button id="cancel-edit" type="button">Cancel</button></div>
    </form>`;
  }
  function status(text, error = false) {
    message = text;
    const output = document.querySelector('#profile-status');
    if (!output) return;
    output.textContent = text;
    output.classList.toggle('is-error', error);
  }
  function bind() {
    const menu = document.querySelector('.menu-toggle');
    menu.onclick = () => {
      const open = menu.getAttribute('aria-expanded') !== 'true';
      menu.setAttribute('aria-expanded', String(open));
      document.querySelector('#profile-nav').hidden = !open;
    };
    document.querySelector('#profile-nav a[href="#applications"]').onclick = event => {
      event.preventDefault();
      document.querySelector('#applications').scrollIntoView({ behavior: 'smooth' });
      document.querySelector('#profile-nav').hidden = true;
      menu.setAttribute('aria-expanded', 'false');
    };
    document.querySelector('#profile-logout').onclick = () => {
      sessionStorage.removeItem(SESSION_KEY);
      location.hash = '#/student-login';
    };
    const edit = document.querySelector('#edit-profile');
    if (edit) edit.onclick = () => { editing = true; pendingPhoto = undefined; draw(); document.querySelector('[name="name"]').focus(); };
    if (editing) bindEditor();
    document.querySelector('#resume-file').onchange = async event => {
      const input = event.target;
      const file = input.files[0];
      if (!file) return;
      if (!/\.(pdf|doc|docx)$/i.test(file.name) || file.size === 0 || file.size > 5 * 1024 * 1024) {
        status('Choose a nonempty PDF, DOC, or DOCX file up to 5 MB.', true); input.value = ''; return;
      }
      input.disabled = true;
      const removeButton = document.querySelector('#remove-resume');
      if (removeButton) removeButton.disabled = true;
      if (edit) edit.disabled = true;
      const next = { ...profile, resume: { name: file.name, blob: file } };
      try {
        await saveProfile(next); profile = next;
        // Preserve any unsaved form values while updating resume information.
        if (editing) status('Resume uploaded and saved. Your profile edits are still unsaved.');
        else { message = 'Resume uploaded and saved.'; draw(); }
      } catch { status('Resume could not be saved. Check available browser storage and try again.', true); }
      finally { input.disabled = false; input.value = ''; if (removeButton) removeButton.disabled = false; if (edit) edit.disabled = false; }
    };
    const remove = document.querySelector('#remove-resume');
    if (remove) remove.onclick = async () => {
      remove.disabled = true;
      document.querySelector('#resume-file').disabled = true;
      if (edit) edit.disabled = true;
      try {
        const next = { ...profile, resume: null };
        await saveProfile(next); profile = next;
        if (editing) status('Resume removed. Your profile edits are still unsaved.');
        else { message = 'Resume removed.'; draw(); }
      } catch { status('Resume could not be removed. Try again.', true); remove.disabled = false; document.querySelector('#resume-file').disabled = false; if (edit) edit.disabled = false; }
    };
  }
  function bindEditor() {
    document.querySelector('#cancel-edit').onclick = () => { editing = false; pendingPhoto = undefined; message = 'Changes canceled.'; draw(); document.querySelector('#edit-profile').focus(); };
    document.querySelector('#photo-file').onchange = async event => {
      const file = event.target.files[0];
      if (!file) return;
      if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || !file.size || file.size > 2 * 1024 * 1024) {
        status('Choose a PNG, JPG, or WebP picture up to 2 MB.', true); event.target.value = ''; return;
      }
      const url = profileFileUrl(file);
      const image = new Image();
      image.onload = () => { const preview = document.querySelector('#photo-preview'); if (!editing || !preview) return; pendingPhoto = file; preview.src = url; status('Picture ready. Save changes to keep it.'); };
      image.onerror = () => { status('This picture could not be read. Choose another image.', true); event.target.value = ''; };
      image.src = url;
    };
    document.querySelector('#profile-form').onsubmit = async event => {
      event.preventDefault();
      const form = event.currentTarget;
      const values = new FormData(form);
      const next = { ...profile };
      for (const key of ['name', 'major', 'concentration', 'year', 'about']) next[key] = String(values.get(key)).trim();
      if (!next.name || !next.major) { status('Name and major cannot be blank.', true); return; }
      if (pendingPhoto) next.photo = pendingPhoto;
      const button = form.querySelector('[type="submit"]');
      button.disabled = true;
      try { await saveProfile(next); profile = next; editing = false; message = 'Profile changes saved.'; draw(); document.querySelector('#edit-profile').focus(); }
      catch { status('Changes could not be saved. Check browser storage and try again.', true); button.disabled = false; }
    };
  }
  draw();
}
