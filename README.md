# Professor Dashboard and Student Login UI

A responsive React and TypeScript login screen based on the [Figma login design](https://www.figma.com/proto/d0P8tCCwxmCInTN8C4LEjg/Main?node-id=1-2&page-id=0%3A1). It is the starting point for the [Student Login user story (#1)](https://github.com/npant1/3155implementation/issues/1).

## Install

Install [Node.js](https://nodejs.org/) and npm, then install the project dependencies:

```sh
npm install
```

## Run locally

Start the Vite development server:

```sh
npm run dev
```

Open the local URL printed in the terminal.

## Features

The login screen provides username and password fields and separate Professor Login, Student Login, and Sign Up actions. Choosing Professor Login opens the professor dashboard, which follows the approved Figma Professor Home screen and includes dashboard search, a navigation menu, and Profile, View Applicants, Posts, and Log Out shortcuts. View Applicants opens a listing-grouped applicant queue with listing filters, individual profiles, applied-listing status, and a sample resume preview. Professors can accept an application or decline it with a required reason; a decision summary is shown afterward, and denial reasons remain visible on the profile.

**This is a local UI demo.** Applicant profiles, resume previews, and applications use sample data. Decisions are kept in page state and reset on refresh; they are not saved to the database. Authentication and student sign-in/sign-up remain unconnected, and the required login fields are not checked against an account.

## Test

Run the TypeScript check and production build:

```sh
npm run build
```

To manually smoke-test the current UI:

1. Run `npm run dev` and open the local URL.
2. Try submitting either login action with the fields empty; the browser should require the fields.
3. Enter any username and password, then choose Professor Login; the dashboard should open.
4. Choose View Applicants; verify applicants are grouped by listing and that the listing filter and search narrow the results.
5. Open an applicant profile, inspect their applied listings and sample resume preview, and select an application to review.
6. Accept an application; verify the accepted result screen and status on the profile. For another application, decline it with a reason and verify that the reason appears on both the result screen and profile.
7. Open the navigation menu and choose Log Out; the login screen should return. Student Login and Sign Up should display messages that those features are not connected.

These checks verify the local UI only; they do not verify credentials or backend behavior.

## PostgreSQL persistence foundation

The data model and Prisma repository are separate from the React UI. The application service is ready for a trusted backend caller, but the application API and login/signup flow are not connected: do not pass a student ID from browser-controlled input. Choose and implement an authentication provider before exposing application operations.

Each developer needs Node.js/npm and Docker Desktop with its daemon running:

1. Copy `.env.example` to `.env` and replace the local PostgreSQL password with a private development password. `.env` is ignored by Git; never commit it or use production credentials here.
2. Start the local database with `npm run db:start`.
3. Generate the typed Prisma client and apply the checked-in development migration with `npm run db:migrate`.
4. Run `npm test` and `npm run build`.

Commit schema changes together with their generated `prisma/migrations/` files. Use `npm ci` to install the lockfile-consistent toolchain; do not use `prisma db push` to bypass migration history. Run database integration tests only against a local test database with the migrations applied. Set `TEST_DATABASE_URL` to that database's connection string; the test uses unique fixtures and cleans them up. Never point tests or local migrations at production. The team should review migrations before applying them in shared or production environments.

The generated Prisma client is ignored and can be recreated with `npm run prisma:generate`. Local database data is stored in the Compose `postgres-data` volume; `npm run db:stop` stops the container without deleting that data.
