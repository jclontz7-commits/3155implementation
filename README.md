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
profile model and persistent editing flow for GitHub issue #4 only. The original proposal is retained as historical analysis; the professor profile
and PostgreSQL integration are now implemented as described below.

## Professor profile with PostgreSQL

The `professor-profile` branch now includes the shared database foundation and
an implemented professor profile. After database setup and seeding, run
`npm start` and open <http://127.0.0.1:8000/#/professor-login>. Select
**Continue as sample professor**, then **My professor profile**.

View and edit profile details, change the photo, and expand published research
posts. Changes persist in PostgreSQL. The sample session is local development
only; real authentication is not implemented. Existing student demo flows
remain available. Use the Node server for professor features.

See [feature setup, behavior and tests](docs/PROFESSOR_PROFILE.md),
[database instructions](docs/DATABASE.md), and [UML diagrams](docs/uml/README.md).

## Student–professor messaging

The independent `student-professor-messaging` branch implements the messaging
story on top of the portal and shared database foundation. Run `npm ci`,
`npm run db:generate`, `npm run db:init`, `npm run db:seed`, and `npm start`.
Open <http://127.0.0.1:8000/#/messages> to choose the sample student or professor,
find a peer, send messages, and view persistent history. Use `PORT=8001 npm start`
if the professor-profile demo is already using port 8000.

[Messaging setup, acceptance criteria, and tests](docs/MESSAGING.md).
