# Student Messaging Page

Standalone messaging feature for students and professors to discuss research
opportunities. This branch contains the messaging page and its supporting
API/database code. Student/professor profile pages and profile-editing APIs
are kept on their separate feature branches.

## Features

- Find professors or students by name, research topic, department or major.
- Open or start a conversation and send messages in either direction.
- View saved conversation history, including older messages.
- Refresh incoming replies and safely retry a failed send.

[Figma messaging design](https://www.figma.com/proto/d0P8tCCwxmCInTN8C4LEjg/Main?node-id=189-288)

## Run locally

Requires Node 24 and a local PostgreSQL development database. Follow
[database setup](docs/DATABASE.md) if you have not configured one yet.

```bash
npm ci
npm run db:generate
npm run db:init
npm run db:seed
npm start
```

Open **http://127.0.0.1:8000/**. The app opens directly to Messages. Choose the
sample student or professor to demonstrate both sides. These are local demo
sessions; production authentication is not configured.

If port 8000 is occupied, run `PORT=8001 npm start` and open
**http://127.0.0.1:8001/** instead.

## Test

```bash
npm run lint
npm run typecheck
npm test
npm run test:db
PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s tests -p 'test_uml.py' -v
```

[Messaging behavior and acceptance criteria](docs/MESSAGING.md) ·
[Database setup](docs/DATABASE.md) · [UML diagrams](docs/uml/README.md)
