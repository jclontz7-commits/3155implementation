# Campus Portal

A buildless HTML, CSS, and JavaScript student portal.

Run `python3 -m http.server 8000` from this directory and open
`http://localhost:8000`. Sign in with **student / student123**, select
**View my profile**, then use **Edit profile** or **Upload Resume**.
The profile is also available at `#/student-profile` after sign-in.

Students can edit their name, major, concentration, year, introduction, and
picture. Save commits edits; Cancel discards them. Profile pictures accept
PNG, JPEG, and WebP up to 2 MB. Resumes accept PDF, DOC, and DOCX up to 5 MB,
with download, replace, and remove controls. Files must be nonempty.

This is a local demo: profile fields and file blobs persist in IndexedDB on
the current browser and origin. Signing out retains the profile for the next
demo session; clearing site data removes it. There is no server upload,
production authentication, or application API. Applied listings and the
initial Emily Evans profile are sample records from the Figma reference.
`readProfile` and `saveProfile` in `profile.js` are the storage integration
points for a future authenticated backend.

The student profile follows the provided Figma frame (14:114), with local
Figma exports in `assets/`. Editing controls and file feedback extend the
reference. The existing login flow is preserved.

## Sprint 2: professor profile proposal

The professor-profile analysis and proposed data model are documented in
[docs/sprint2/professor-profile-proposal.md](docs/sprint2/professor-profile-proposal.md).
[PlantUML sources and rendered diagrams](docs/uml/README.md) cover the proposed
profile model and persistent editing flow for GitHub issue #4 only. These are
proposals awaiting team approval and database selection; no professor backend,
ORM, or database configuration has been implemented.
