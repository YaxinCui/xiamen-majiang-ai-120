import json
import threading
import unittest
from http.server import ThreadingHTTPServer
from urllib.request import Request, urlopen

from xiamen_mahjong_120.web import GameStore, make_handler


class WebTests(unittest.TestCase):
    def setUp(self):
        self.server = ThreadingHTTPServer(("127.0.0.1", 0), make_handler(GameStore()))
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()
        self.base_url = f"http://127.0.0.1:{self.server.server_port}"

    def tearDown(self):
        self.server.shutdown()
        self.server.server_close()
        self.thread.join(timeout=2)

    def test_root_is_the_120_tile_lobby(self):
        with urlopen(f"{self.base_url}/") as response:
            page = response.read().decode("utf-8")
        self.assertIn("120 张厦门麻将 · 游戏大厅", page)
        self.assertIn("1 人对 3 个机器人", page)
        self.assertIn("1v1v1v1 四人验牌", page)

    def test_game_endpoint_is_120_only_and_hides_ai_hands(self):
        with urlopen(f"{self.base_url}/api/game-120") as response:
            state = json.load(response)
        self.assertEqual(state["rules"]["profile"], "new120")
        self.assertEqual(state["rules"]["tile_count"], 120)
        self.assertEqual([profile["id"] for profile in state["rule_profiles"]], ["new120"])
        self.assertTrue(all(player["hand"] is None for player in state["players"][1:]))

    def test_debug_explicitly_reveals_ai_hands(self):
        with urlopen(f"{self.base_url}/api/game-120?debug=1") as response:
            state = json.load(response)
        self.assertTrue(all(player["hand"] for player in state["players"][1:]))

    def test_new_game_and_action_endpoints_use_the_same_store(self):
        request = Request(
            f"{self.base_url}/api/game-120/new",
            data=json.dumps({"seed": 1, "reset_match": True}).encode(),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urlopen(request) as response:
            state = json.load(response)
        action = next(item for item in state["actions"] if item["kind"] == "discard")
        action_request = Request(
            f"{self.base_url}/api/game-120/action",
            data=json.dumps(action).encode(),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urlopen(action_request) as response:
            advanced = json.load(response)
        self.assertEqual(advanced["rules"]["profile"], "new120")
        self.assertNotEqual(advanced["phase"], "setup")

    def test_all_120_tile_pages_and_shared_tile_ui_are_served(self):
        expected = {
            "/play-120.html": "120 张新厦麻",
            "/play-120-four.html": "四人验牌桌",
            "/scenarios-120.html": "规则情景实验室",
            "/win-test-120.html": "真实规则验牌桌",
            "/rules-120.html": "120 张厦门麻将玩法规则",
            "/tile-ui.js": "global.MahjongTileUI",
        }
        for path, marker in expected.items():
            with self.subTest(path=path), urlopen(f"{self.base_url}{path}") as response:
                self.assertIn(marker, response.read().decode("utf-8"))

    def test_rules_page_keeps_research_sources_and_mnemonic(self):
        with urlopen(f"{self.base_url}/rules-120.html") as response:
            page = response.read().decode("utf-8")
        for marker in (
            "120 张新厦麻浓缩口诀",
            "庄十七，闲十六",
            "真金百搭，白板替面",
            "双金必游，三金先双游",
            "7429283695552482610",
            "春江茗茶馆 · 游金规则讲解",
            "厦门麻将三泉 · 游金区别",
            "厦麻-阿王 · 120 张玩法总览",
            "厦门麻将玲妹 · 算分教学",
        ):
            self.assertIn(marker, page)

    def test_real_win_check_calls_shared_backend_evaluator(self):
        request = Request(
            f"{self.base_url}/api/rules-120/check-win",
            data=json.dumps(
                {
                    "hand": [0, 1, 2, 3, 4, 5, 9, 10, 11, 12, 13, 14, 18, 19, 20, 26],
                    "draw": 26,
                    "gold_tile": 8,
                }
            ).encode(),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urlopen(request) as response:
            result = json.load(response)
        self.assertTrue(result["result"]["winning"])
        self.assertEqual(result["result"]["pattern"], "标准和")
        self.assertEqual(result["engine"]["version"], "xiamen-new-120-v1")
        self.assertFalse(result["engine"]["allow_seven_pairs"])


if __name__ == "__main__":
    unittest.main()
