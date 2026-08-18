import unittest

from xiamen_mahjong_120.game import XiamenMahjongGame
from xiamen_mahjong_120.rules import XiamenRules
from xiamen_mahjong_120.tiles import BASE_TILE_COUNT, WHITE_DRAGON, base_wall


class GameTests(unittest.TestCase):
    def test_wall_contains_only_suits_white_and_flowers(self):
        wall = base_wall(include_honors=False)
        self.assertEqual(len(wall), 120)
        self.assertEqual(wall.count(WHITE_DRAGON), 4)
        self.assertFalse(any(27 <= tile < WHITE_DRAGON for tile in wall))

    def test_deal_is_sixteen_tiles_plus_dealer_draw(self):
        game = XiamenMahjongGame(seed=1, rules=XiamenRules(), dealer=0)
        physical_tiles = [
            tile
            for player in game.players
            for tile in [*player.hand, *player.flowers]
        ] + [*game.wall, game.gold_indicator]
        self.assertEqual(len(physical_tiles), 120)
        self.assertFalse(any(27 <= tile < WHITE_DRAGON for tile in physical_tiles))
        self.assertEqual(sum(len(player.hand) for player in game.players), 65)
        self.assertTrue(
            all(
                len(player.hand) == (17 if player.seat == game.current_player else 16)
                for player in game.players
            )
        )
        self.assertEqual(game.gold_indicator, game.gold_tile)

    def test_double_gold_cannot_win_as_an_ordinary_hand(self):
        game = XiamenMahjongGame(seed=20260815)
        game.gold_tile = 8
        game.players[0].hand = [
            0, 1, 2, 3, 4, 5, 9, 10, 11, 18, 19, 20, 24, 25, 26, 8, 8
        ]
        self.assertFalse(game._can_win(0))

    def test_available_tour_upgrade_is_forced(self):
        game = XiamenMahjongGame(seed=20260816)
        game.gold_tile = 8
        five_melds = [0, 1, 2, 3, 4, 5, 9, 10, 11, 18, 19, 20, 24, 25, 26]
        game.phase = "discard"
        game.current_player = 0
        game.tour_state = {"owner": 0, "level": 1, "locked": False, "remaining": []}
        game.players[0].hand = [*five_melds, 8, 8]
        self.assertTrue(game._can_advance_tour(0))
        self.assertEqual({a["kind"] for a in game._turn_actions(0)}, {"advance_tour"})

    def test_later_third_gold_is_not_three_gold_down(self):
        game = XiamenMahjongGame(seed=1, dealer=0)
        game.gold_tile = 8
        game.phase = "discard"
        game.first_turn_pending.add(1)
        game.players[1].hand = [8, 8, *range(14)]
        game.wall = [8, *game.wall]
        game._start_turn(1)
        self.assertNotEqual(game.phase, "over")
        self.assertIsNone(game.win_type)

    def test_fixed_scoring_is_main_score_plus_water(self):
        game = XiamenMahjongGame(seed=20260814)
        game.gold_tile = 8
        for player in game.players:
            player.score = 0
        winner = game.players[1]
        winner.hand = [
            0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 18, 19, 20, 26, 26
        ]
        winner.flowers = [34, 35]
        winner.melds = []
        game._finish_win(1, "self_draw")
        self.assertEqual(game.score_breakdown["mode"], "new120_fixed")
        self.assertEqual(game.score_breakdown["base"], 4)
        self.assertEqual(game.score_breakdown["water"], 3)
        self.assertEqual(game.score_breakdown["per_payer"], 7)
        self.assertEqual(winner.score, 21)

    def test_public_state_hides_ai_hands_by_default(self):
        game = XiamenMahjongGame(seed=7)
        state = game.public_state()
        self.assertEqual(len(state["players"][0]["hand"]), state["players"][0]["hand_count"])
        self.assertTrue(all(player["hand"] is None for player in state["players"][1:]))
        self.assertLess(state["gold_tile"]["id"], BASE_TILE_COUNT)

    def test_complete_game_reaches_settlement(self):
        game = XiamenMahjongGame(seed=120)
        steps = 0
        while game.phase != "over" and steps < 350:
            actions = game.human_actions()
            self.assertTrue(actions)
            action = next(
                (item for item in actions if item["kind"] in {"hu", "advance_tour"}),
                next((item for item in actions if item["kind"] == "discard"), actions[0]),
            )
            game.apply_human_action(action)
            steps += 1
        self.assertEqual(game.phase, "over")
        self.assertLess(steps, 350)


if __name__ == "__main__":
    unittest.main()
