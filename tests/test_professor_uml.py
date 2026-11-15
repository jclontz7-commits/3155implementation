"""Checks for the proposal artifacts; these do not test a database or runtime UI."""
import hashlib
import json
from pathlib import Path
import unittest
import xml.etree.ElementTree as ET

UML = Path(__file__).resolve().parents[1] / 'docs' / 'uml'


class ProfessorDiagramTests(unittest.TestCase):
    def test_rendered_diagrams_match_committed_source(self):
        manifest = json.loads((UML / 'professor-render-manifest.json').read_text())
        expected = {'professor-profile-class.puml', 'professor-profile-sequence.puml'}
        self.assertEqual(set(manifest['artifacts']), expected)
        for name, hashes in manifest['artifacts'].items():
            with self.subTest(diagram=name):
                source = UML / name
                svg = source.with_suffix('.svg')
                self.assertEqual(hashlib.sha256(source.read_bytes()).hexdigest(),
                                 hashes['source_sha256'], 'Source changed: rerender diagrams')
                self.assertEqual(hashlib.sha256(svg.read_bytes()).hexdigest(),
                                 hashes['svg_sha256'], 'Rendered file changed: rerender diagrams')
                root = ET.parse(svg).getroot()
                self.assertEqual(root.tag, '{http://www.w3.org/2000/svg}svg')
                self.assertGreater(float(root.attrib['width'].removesuffix('px')), 0)
                self.assertGreater(float(root.attrib['height'].removesuffix('px')), 0)
                text = ' '.join(root.itertext())
                self.assertNotIn('Syntax Error', text)
                self.assertIn('implemented', text.lower())
                self.assertIn('ProfessorProfile', text)


if __name__ == '__main__':
    unittest.main()
