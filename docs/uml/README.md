# Professor profile UML

These are **proposed** diagrams for [issue #4](https://github.com/npant1/3155implementation/issues/4),
not an implemented database schema. See the [analysis and approval questions](../sprint2/professor-profile-proposal.md).

| Diagram | Editable source | Render |
| --- | --- | --- |
| Profile model, attributes, ownership and multiplicities | [PlantUML](professor-profile-class.puml) | [SVG](professor-profile-class.svg) |
| Authenticated text-edit/save sequence and failures | [PlantUML](professor-profile-sequence.puml) | [SVG](professor-profile-sequence.svg) |

## Reproduce the renders

Requires Python **3.9+** and Java **21+**. No database or Node.js installation
is needed. Download the official
[PlantUML 1.2026.10 JAR](https://github.com/plantuml/plantuml/releases/download/v1.2026.10/plantuml.jar)
to a directory outside the repository. The script verifies its SHA-256 against
the digest supplied by GitHub's release metadata before executing it. The JAR
is not committed. The class diagram uses the embedded Smetana layout engine;
Graphviz installation is unnecessary.

From the repository root:

```bash
python3 scripts/render_professor_uml.py --jar /path/to/plantuml.jar
python3 -m unittest discover -s tests -p 'test_professor_uml.py' -v
```

Open either SVG in a browser or VS Code preview. Both sources and their
rendered SVGs are committed. `render-manifest.json` ties output hashes to
source hashes so stale or modified artifacts fail the automated check.
Rerender after editing a `.puml` file and commit the updated manifest together
with the diagrams. The check verifies artifact integrity and valid SVG
geometry; it does not prove business requirements or future database behavior.

In environments that restrict Java execution, run the same rendering command
in a normal terminal. No credentials or environment variables are required.
