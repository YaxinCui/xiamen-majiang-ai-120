import unittest

from xiamen_mahjong_120.hand import is_winning_hand, wait_tiles, winning_pattern
from xiamen_mahjong_120.rules import XiamenRules
from xiamen_mahjong_120.tiles import WHITE_DRAGON


class HandTests(unittest.TestCase):
    def test_seventeen_tile_hand_is_five_melds_and_a_pair(self):
        hand = [0, 1, 2, 3, 4, 5, 9, 10, 11, 18, 19, 20, 24, 25, 26, 6, 6]
        self.assertTrue(
            is_winning_hand(
                hand,
                gold_tile=8,
                melds_required=5,
                allow_seven_pairs=False,
            )
        )
        self.assertEqual(
            winning_pattern(
                hand,
                gold_tile=8,
                melds_required=5,
                allow_seven_pairs=False,
            ),
            "标准和",
        )

    def test_gold_completes_a_missing_sequence(self):
        hand = [0, 1, 8, 3, 4, 5, 9, 10, 11, 18, 19, 20, 24, 25, 26, 6, 6]
        self.assertTrue(
            is_winning_hand(hand, 8, melds_required=5, allow_seven_pairs=False)
        )

    def test_wait_tiles_uses_sixteen_tile_shape(self):
        hand = [0, 1, 2, 3, 4, 5, 9, 10, 11, 18, 19, 20, 24, 25, 26, 6]
        self.assertIn(
            6,
            wait_tiles(hand, 8, melds_required=5, allow_seven_pairs=False),
        )

    def test_white_dragon_is_fixed_gold_face_proxy(self):
        hand = [0, WHITE_DRAGON, 2, 3, 4, 5, 9, 10, 11, 18, 19, 20, 24, 25, 26, 6, 6]
        self.assertTrue(
            is_winning_hand(
                hand,
                gold_tile=1,
                melds_required=5,
                allow_seven_pairs=False,
                wildcard_tiles={1},
                proxy_tile=WHITE_DRAGON,
                proxy_as=1,
            )
        )

    def test_rules_explicitly_disable_seven_pairs(self):
        self.assertFalse(XiamenRules().allow_seven_pairs)


if __name__ == "__main__":
    unittest.main()
