import unittest

from openpyxl import Workbook

from engine.foco_engine.generator import _locate_table, normalize_ceco, parse_percent


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

    def test_detects_header_after_title_rows(self):
        workbook = Workbook()
        sheet = workbook.active
        sheet.title = "Prueba"
        sheet.append(["Reporte semanal"])
        sheet.append([None, None, None])
        sheet.append(["CeCo", "Año", "Semana", "Valor"])
        header_row, headers = _locate_table(sheet, ("Año", "Semana"))
        self.assertEqual(header_row, 3)
        self.assertEqual(headers["ceco"], 0)


if __name__ == "__main__":
    unittest.main()
