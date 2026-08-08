import unittest

from engine.foco_engine.generator import normalize_ceco, parse_percent


class EngineTests(unittest.TestCase):
    def test_percent_with_non_breaking_space(self):
        self.assertEqual(parse_percent("58.8\xa0%"), 0.588)

    def test_decimal_ceco(self):
        self.assertEqual(normalize_ceco(38.101, decimal_code=True), "38101")

    def test_regular_ceco(self):
        self.assertEqual(normalize_ceco(38101), "38101")

    def test_blank_values(self):
        self.assertIsNone(parse_percent(""))
        self.assertIsNone(normalize_ceco(None))


if __name__ == "__main__":
    unittest.main()

