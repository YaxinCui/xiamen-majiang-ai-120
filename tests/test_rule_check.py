import unittest

from xiamen_mahjong_120.rule_check import evaluate_winning_tiles
from xiamen_mahjong_120.rules import XiamenRules


class RuleCheckTests(unittest.TestCase):
    def setUp(self):
        self.rules = XiamenRules()

    def test_standard_hand_passes_shared_evaluator(self):
        tiles = [0, 1, 2, 3, 4, 5, 9, 10, 11, 12, 13, 14, 18, 19, 20, 26, 26]
        result = evaluate_winning_tiles(tiles, rules=self.rules, gold_tile=8)
        self.assertTrue(result.winning)
        self.assertEqual(result.pattern, "标准和")
        self.assertTrue(all(check["status"] == "pass" for check in result.checks))

    def test_double_gold_is_blocked_before_structural_win(self):
        tiles = [0, 1, 2, 3, 4, 5, 9, 10, 11, 12, 13, 14, 18, 19, 20, 26, 26]
        result = evaluate_winning_tiles(tiles, rules=self.rules, gold_tile=26)
        self.assertFalse(result.winning)
        self.assertIn("必须进入游金", result.reason)
        self.assertEqual(result.checks[-1]["status"], "skip")

    def test_white_dragon_is_fixed_gold_face_proxy(self):
        tiles = [0, 33, 2, 3, 4, 5, 9, 10, 11, 12, 13, 14, 18, 19, 20, 26, 26]
        result = evaluate_winning_tiles(tiles, rules=self.rules, gold_tile=1)
        self.assertTrue(result.winning)

    def test_pong_and_clean_suit_currently_report_standard_pattern(self):
        pong = [1, 1, 1, 13, 13, 13, 25, 25, 25, 5, 5, 5, 17, 17, 17, 8, 8]
        clean = [9, 10, 11, 11, 12, 13, 12, 13, 14, 14, 15, 16, 15, 16, 17, 17, 17]
        self.assertEqual(evaluate_winning_tiles(pong, rules=self.rules, gold_tile=0).pattern, "标准和")
        self.assertEqual(evaluate_winning_tiles(clean, rules=self.rules, gold_tile=8).pattern, "标准和")


if __name__ == "__main__":
    unittest.main()
