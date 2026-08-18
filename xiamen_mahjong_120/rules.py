"""Single rule profile for the 120-tile Xiamen Mahjong project."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class XiamenRules:
    """Rules implemented by this repository.

    This is intentionally not a configurable 120/144 switch.  The older
    144-tile game belongs to a separate codebase and must not leak into this
    algorithm through fallback defaults.
    """

    profile: str = "new120"
    name: str = "120 张新厦麻"
    version: str = "xiamen-new-120-v1"
    player_count: int = 4
    tile_count: int = 120
    include_honors: bool = False
    rules_page: str = "/rules-120.html"
    scoring_mode: str = "new120_fixed"
    base_score: int = 2
    dealer_base_score: int = 2
    initial_hand_size: int = 16
    melds_required: int = 5
    dead_wall_tiles: int = 0
    allow_seven_pairs: bool = False
    gold_is_wildcard: bool = True
    gold_from_indicator_next: bool = False
    gold_discard_cannot_be_claimed: bool = True
    white_dragon_is_gold_proxy: bool = True
    white_dragon_can_form_melds: bool = True
    gold_in_hand_blocks_discard_win: bool = True
    gold_discard_self_draw_only: bool = True
    allow_chi: bool = True
    allow_concealed_kong: bool = True
    allow_added_kong: bool = True
    enable_travelling_gold: bool = True
    enable_three_gold_instant_win: bool = True
    three_gold_opening_only: bool = True
    enable_opening_gold_capture: bool = True
    enable_opening_wait: bool = False
    enable_heavenly_win: bool = False
    enable_dealer_continuation: bool = True
    all_players_pay_discard_win: bool = True
    travelling_gold_multiplier: int = 10
    double_travelling_multiplier: int = 20
    triple_travelling_multiplier: int = 80
    opening_three_gold_multiplier: int = 10
    later_three_gold_multiplier: int = 0
    opening_wait_multiplier: int = 0
    heavenly_win_multiplier: int = 0
    enable_forced_honor_follow: bool = False
    enable_complex_water_scoring: bool = False
    fixed_discard_score: int = 2
    fixed_self_draw_score: int = 4
    fixed_touring_score: int = 10
    fixed_double_touring_score: int = 20
    fixed_triple_touring_score: int = 80
    fixed_three_gold_score: int = 10

    @classmethod
    def new120(cls) -> "XiamenRules":
        return cls()

    @classmethod
    def from_profile(cls, profile: str | None) -> "XiamenRules":
        if profile in {None, "new120"}:
            return cls()
        raise ValueError(f"本仓库只支持 120 张新厦麻，收到规则档位：{profile}")

    @classmethod
    def available_profiles(cls) -> list[dict[str, str]]:
        return [
            {
                "id": "new120",
                "name": "120 张新厦麻",
                "description": "无大字；16/17 张、白板替金、固定分值与游金",
                "rules_page": "/rules-120.html",
            }
        ]

    def public_summary(self) -> list[str]:
        return [
            "4 人、120 张：108 张万筒条＋4 张白板＋8 张花；无东南西北中发",
            "庄家起手 17 张，闲家 16 张；胡牌为五组牌加一对将",
            "可吃、碰、明杠、暗杠、补杠；花牌亮出后从牌尾补一张",
            "翻出的牌本身就是真金；真金万能，白板只替代金牌原牌面",
            "手持真金不能胡别人打出的牌；打出的真金不可被吃、碰、杠或胡",
            "游金 10、双游 20、三游 80；双金必须游，三金必须双游",
            "三金倒只检查起手；牌中形成三金不直接胡，继续走双游/三游流程",
            "固定分值：平胡 2、自摸 4；花/明杠 +1，暗杠 +2；三家共同结算",
            "默认不承认七对；碰碰胡、清一色是满足五组一对后的牌型描述，不另改胡牌骨架",
        ]
