# Sprint 2: professor profile proposal

**Status: awaiting team approval and database selection.** Scope is GitHub
[issue #4, Professor Profile](https://github.com/npant1/3155implementation/issues/4).
No ORM, schema, migration, database configuration, new runtime feature, or
production database change is included in this proposal.

## Evidence and current state

Reviewed on November 15, 2026:

- Reference repository: [npant1/3155implementation](https://github.com/npant1/3155implementation).
- Reference `main`: `app.js` renders six hardcoded research listings. Fields
  are `title`, `department`, `faculty`, `description`, `areas`, `posted`,
  `deadline`, and `commitment`. There is no database or backend. The README
  documents the login demo as well; current main code is a listings page.
- Working `professor-profile` branch, baseline `b6125e5`: `app.js` implements
  the student login/portal and placeholder professor login; `profile.js`
  implements **student** profile editing and browser-local IndexedDB.
  Despite the branch/commit name, no professor profile implementation exists.
  Existing source and local student data are preserved.
- [Figma professor-profile frame 59:276](https://www.figma.com/proto/d0P8tCCwxmCInTN8C4LEjg/Main?node-id=59-276)
  was examined through Figma MCP. It shows name, photo, degree, education,
  research areas, biography, email, virtual office, office hours, and Back.
  Posted listings are required by the issue but absent from this Figma frame.
- Issue #4 requires easy navigation, a professor description, posted job
  listings, and a place to edit the profile. Detailed field validation,
  privacy, authentication, and persistence acceptance criteria are missing.
- GitHub Issues were readable. Project board metadata could not be read:
  CLI authorization lacks `read:project`. Sprint assignment and board status
  are unverified; this proposal does not assign or close any issue.

The technology stack is HTML5, CSS3, and browser JavaScript, with no package
manifest, backend framework, ORM, migration system, automated test runner,
or lint command. Python serves the static demo. Existing IndexedDB code is
student-specific and mixes persistence and interface logic; it is not a
shared professor database and will not be reused as an authentication layer.

## Scope and acceptance mapping

| Issue #4 requirement | Proposed behavior | Validation after approval |
| --- | --- | --- |
| Easy navigation | Professor hub/profile link, clear Back action | Open profile from professor entry point and return |
| Professor description | View degree, education, research interests, biography, contact fields | Render populated and missing optional fields |
| Posted job listings | Read published posts belonging to the profile owner | Filter by immutable owner ID; show empty/error/loading states |
| Place to edit | Owner-only editor with Save and Cancel | Save confirmed values, Cancel discards edits; errors retain input |

Only professor-profile work is proposed. Student profiles/resumes, account
registration, messaging, applicant review, research search, and post creation
remain owned by their separate issues. Viewing posted summaries is part of
this profile; defining or implementing the post persistence schema is not.

## Proposed profile model

The [class diagram](../uml/professor-profile-class.svg) and its
[PlantUML source](../uml/professor-profile-class.puml) define a proposed
`ProfessorProfile` aggregate, optional `ProfileImage` value object, and two
external references. They are not descriptions of an existing ORM.

| Attribute | Proposed type and constraint | Evidence / assumption |
| --- | --- | --- |
| id | UUID, primary identity | Stable identity proposed |
| userId | Required unique authentication-provider ID | Owner authorization proposed; auth provider unselected |
| displayName | Trimmed nonblank string, maximum 80 characters | Figma name; limit proposed |
| degree | Optional string, maximum 200 | Figma degree |
| department | Optional string, maximum 120 | Listings use department; profile field proposed |
| education | Optional text, maximum 2,000 | Figma education |
| about | Optional text, maximum 5,000 | Figma professor biography is much longer than student biography |
| researchAreas | List of up to 20 distinct nonblank strings, maximum 100 each | Figma interests; list limits proposed |
| contactEmail | Optional valid email | Figma contact; separate from sign-in identity |
| virtualOfficeUrl | Optional HTTPS URL | Figma Zoom link; provider-neutral field |
| officeHours | Optional string, maximum 500 | Figma office hours; free text until scheduling requirements exist |
| photo | Zero or one ProfileImage | Figma avatar; upload/edit support proposed |
| updatedAt | Server-generated UTC instant | Proposed audit metadata |
| version | Positive integer, initially 1, increment per successful update | Proposed concurrency control |

`ProfileImage` contains a private object `storageKey`, `originalName`,
`mediaType`, and `sizeBytes`. Proposed allowed formats are PNG, JPEG, and WebP,
with nonempty content and a 2 MiB limit. It is a value object, not a promise
of a separate SQL table. File bytes would live in object storage, not in a
public URL or authentication record; storage provider and retention remain
unselected. Only display a signed/authorized image URL returned by the data
layer. Check actual decoded content as well as the claimed media type.

An authenticated professor owns zero or one profile and zero or more posts.
Every persisted profile has exactly one owner. Roles and accounts are external
contracts, not new account tables in this feature. The profile reads published
`PostedOpportunitySummary` objects using that owner's immutable `userId`.
The summary includes the existing main listing fields plus `id`,
`professorUserId`, and `status`. The diagram does not claim that these IDs
already exist in main. Matching by faculty display name would be unreliable.
Post ownership IDs and a stable query API must be agreed with the post team.

No cascade deletion of a professor's posts is implied. Profile removal,
account deletion, archival, and referential-deletion policies need review.

## Proposed persistent user story

**As a professor, I can edit my own profile and see the saved information when
I return.** This extends issue #4 with persistence acceptance criteria for team
approval. The [sequence diagram](../uml/professor-profile-sequence.svg) and
[source](../uml/professor-profile-sequence.puml) show owner authorization,
validation, conditional version updates, conflicts, storage errors, and
success only after commit.

The UI would call `getMyProfile()` and
`updateMyProfile(fields, expectedVersion)` through a separate data-access
adapter. A trusted service derives `userId` from the authenticated session;
it must never trust an owner ID submitted by the browser. Validate allowlisted
fields in the service. The update must atomically match the expected version
and preserve the old profile on failure. These function names are proposed
interfaces, not functions already present in the repository.

Initial profile creation, photo upload/replacement, and the published-post
query need separate methods and tests after approval. Photo replacement must
not delete the previous object until its replacement reference commits;
failed uploads require cleanup. The diagram intentionally covers text editing
only, rather than pretending object storage and database writes share one
transaction.

## Database decision requested

**Which database does the team want to use?** No selection has been applied.

| Choice | Proposed access approach | Team implications |
| --- | --- | --- |
| PostgreSQL (recommended for shared team data) | A small authenticated Node.js/TypeScript service with Prisma ORM | Adds a backend/runtime; versioned migrations and local development databases |
| SQLite for local demonstration | An authenticated server-side service with a compatible Prisma release | A local file is not automatically a shared multi-user database; hosting and migration path require agreement |
| Firebase Firestore | Typed document models/converters and Firebase SDK; Firebase Auth and rules | No relational ORM; use emulator tests, explicit document validation, security rules, and versioned indexes |

Prisma supports relational databases; its currently documented releases have
different database coverage. Select and pin a supported version only after
the database choice, rather than installing an arbitrary latest version.
See [Prisma supported databases](https://www.prisma.io/docs/orm/supported-databases)
and [Prisma v7 database support](https://www.prisma.io/docs/orm/v7/core-concepts/supported-databases).
Firestore uses documents and collections rather than SQL tables; see its
[data model](https://firebase.google.com/docs/firestore/data-model),
[typed custom-object conversions](https://firebase.google.com/docs/firestore/manage-data/add-data),
and [Local Emulator Suite](https://firebase.google.com/docs/emulator-suite).
These are recommendations; neither stack is configured here.

## Team setup plan after approval

1. Agree on database, authentication provider, profile visibility, owner IDs,
   and whether a backend is allowed in this static application.
2. Pin runtime/dependency versions and commit the dependency lockfile.
3. Generate `.env.example` containing placeholders for the chosen system.
   Exclude real `.env` files, service-account keys, local database files,
   uploads, and dependency caches through `.gitignore`. Database configuration
   and ignore-rule changes are deferred until approval, per the task gate.
4. Each member creates a local `.env` using credentials obtained privately;
   never put secrets into browser scripts, screenshots, issues, or docs.
   Prefer individual development databases or an emulator and synthetic data.
5. Commit schema migrations, or Firestore model/rules/index changes, together
   with the feature. Members apply the same versioned changes to their own
   development environment; do not manually drift shared schemas.
6. Keep development, test, and production configuration distinct. Test resets
   must target disposable databases/emulators. Production changes require
   explicit review and approval.

There are no generated credentials, connection strings, or live access steps
in this proposal. The hardcoded student login pair is an existing demo fixture,
not professor authentication. No database is initialized or contacted.

## Assumptions requiring team review

- A professor has one profile and a stable authenticated ID. Can someone have
  both student and professor roles? Which auth system will issue IDs?
- Which fields are required, and is contact information public or signed-in
  only? Public-profile access requires a separate read authorization policy.
- Are editing the photo, department, education, research areas, and contact
  fields approved, or should editing be limited to the issue's description?
- Confirm proposed length/file limits, owner-only edits, version conflicts,
  and whether initial profile creation is self-service.
- Posted lists show published posts only. Should the owner also see drafts?
  Who supplies stable post IDs, professor IDs, and the query adapter?
- Define post ordering/pagination, profile deletion and file retention, and
  whether virtual-office links may use domains beyond Zoom.
- Figma has professor contact fields but no posted-list section in frame
  59:276. Approve where that section belongs before implementing it.

## Validation and remaining phases

This commit contains analysis and rendered proposal diagrams only. Automated
checks verify that committed SVGs match their PlantUML source hashes, parse as
SVG, are not PlantUML error images, and have nonempty geometry. The renderer
also validates PlantUML syntax. See [render instructions](../uml/README.md).
No lint command exists in the source branch. Runtime, data-access, integration,
and database operation tests are deferred with implementation, not reported
as passed.

After approval, add tests for profile load/create/update, restart persistence,
required/invalid fields, access by another owner, unauthorized access,
concurrent updates, service/storage failures, image replacement, and correct
published-post ownership/empty/error states. Verify the finished code against
both diagrams and revise them in the same change.

Approval is required before phases 3–6 (ORM/models, migrations, database setup,
feature integration, and runtime/database tests). The requested `.env.example`
and concrete database setup instructions depend on that choice. This is a
reviewable design proposal, not a completed persistence implementation.
