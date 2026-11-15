# UML diagrams

| Diagram | Source | Render |
| --- | --- | --- |
| Implemented professor-profile model (shared-schema subset) | [PlantUML](professor-profile-class.puml) | [SVG](professor-profile-class.svg) |
| Implemented professor-profile save flow | [PlantUML](professor-profile-sequence.puml) | [SVG](professor-profile-sequence.svg) |
| Complete shared database model | [PlantUML](shared-data-class.puml) | [SVG](shared-data-class.svg) |
| Messaging send/history flow | [PlantUML](messaging-sequence.puml) | [SVG](messaging-sequence.svg) |
| Shared application submission data-access flow | [PlantUML](application-sequence.puml) | [SVG](application-sequence.svg) |

Use Python 3.9+, Java 21+ and the official
[PlantUML 1.2026.10 JAR](https://github.com/plantuml/plantuml/releases/download/v1.2026.10/plantuml.jar)
outside the repository. The render scripts verify its pinned checksum.
Smetana handles class layouts; Graphviz is unnecessary.

```bash
python3 scripts/generate-uml.py
python3 scripts/render-uml.py --jar /path/to/plantuml.jar
python3 scripts/render_professor_uml.py --jar /path/to/plantuml.jar
PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s tests -p 'test*uml.py' -v
```

The shared manifest is `render-manifest.json`; professor-specific diagrams use
`professor-render-manifest.json`. Commit sources, SVGs, and matching manifests
together. Shared class checks detect drift from Prisma; artifact checks detect
stale renders. See [database setup](../DATABASE.md) and
[professor-profile implementation](../PROFESSOR_PROFILE.md).
