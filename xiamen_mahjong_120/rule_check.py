"""Shared, explainable winning-tile evaluation used by games and test pages."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from .hand import is_winning_hand, winning_pattern
from .rules import XiamenRules
from .tiles import WHITE_DRAGON


@dataclass(frozen=True)
class WinEvaluation:
    winning: bool
    pattern: str | None
    reason: str
    checks: tuple[dict[str, Any], ...]
    expected_tile_count: int
    gold_count: int

    def payload(self) -> dict[str, Any]:
        return {
            "winning": self.winning,
            "pattern": self.pattern,
            "reason": self.reason,
            "checks": [dict(check) for check in self.checks],
            "expected_tile_count": self.expected_tile_count,
            "gold_count": self.gold_count,
        }


def evaluate_winning_tiles(
    tiles: list[int],
    *,
    rules: XiamenRules,
    gold_tile: int | None,
    meld_count: int = 0,
) -> WinEvaluation:
    """Run the same structural and new-120 restrictions used by a live game."""

    expected = rules.melds_required * 3 + 2 - meld_count * 3
    gold_count = tiles.count(gold_tile) if gold_tile is not None else 0
    count_ok = len(tiles) == expected
    checks: list[dict[str, Any]] = [
        {
            "id": "tile_count",
            "label": "本次验牌张数",
            "status": "pass" if count_ok else "fail",
            "detail": f"收到 {len(tiles)} 张，当前副露数要求 {expected} 张暗牌",
        }
    ]
    if not count_ok:
        checks.extend(
            [
                {
                    "id": "gold_limit",
                    "label": "双金普通胡限制",
                    "status": "skip",
                    "detail": "张数不符，未继续检查",
                },
                {
                    "id": "standard_shape",
                    "label": "五组牌＋一对将",
                    "status": "skip",
                    "detail": "张数不符，未调用牌形拆分",
                },
            ]
        )
        return WinEvaluation(
            False,
            None,
            f"张数不符：需要 {expected} 张，实际 {len(tiles)} 张",
            tuple(checks),
            expected,
            gold_count,
        )

    blocked_by_gold = (
        rules.scoring_mode == "new120_fixed"
        and gold_tile is not None
        and gold_count >= 2
    )
    checks.append(
        {
            "id": "gold_limit",
            "label": "双金普通胡限制",
            "status": "fail" if blocked_by_gold else "pass",
            "detail": (
                f"手中有 {gold_count} 张真金；双金必须进入游金流程"
                if blocked_by_gold
                else f"手中有 {gold_count} 张真金，可以继续检查普通胡"
            ),
        }
    )
    if blocked_by_gold:
        checks.append(
            {
                "id": "standard_shape",
                "label": "五组牌＋一对将",
                "status": "skip",
                "detail": "已被双金规则拦截，不再作为普通胡处理",
            }
        )
        return WinEvaluation(
            False,
            None,
            "双金不能按普通胡结算，必须进入游金流程",
            tuple(checks),
            expected,
            gold_count,
        )

    wildcard_tiles = (
        {gold_tile}
        if rules.gold_is_wildcard and gold_tile is not None
        else set()
    )
    proxy_tile = (
        WHITE_DRAGON
        if rules.white_dragon_is_gold_proxy
        and gold_tile is not None
        and gold_tile != WHITE_DRAGON
        else None
    )
    winning = is_winning_hand(
        tiles,
        gold_tile if rules.gold_is_wildcard else None,
        meld_count=meld_count,
        melds_required=rules.melds_required,
        allow_seven_pairs=rules.allow_seven_pairs,
        wildcard_tiles=wildcard_tiles,
        proxy_tile=proxy_tile,
        proxy_as=gold_tile,
    )
    checks.append(
        {
            "id": "standard_shape",
            "label": "五组牌＋一对将",
            "status": "pass" if winning else "fail",
            "detail": (
                "真实牌形拆分成功"
                if winning
                else "真实牌形拆分失败，不能组成五组牌＋一对将"
            ),
        }
    )
    pattern = (
        winning_pattern(
            tiles,
            gold_tile if rules.gold_is_wildcard else None,
            meld_count=meld_count,
            melds_required=rules.melds_required,
            allow_seven_pairs=rules.allow_seven_pairs,
            wildcard_tiles=wildcard_tiles,
            proxy_tile=proxy_tile,
            proxy_as=gold_tile,
        )
        if winning
        else None
    )
    return WinEvaluation(
        winning,
        pattern,
        "牌形满足当前 120 张规则" if winning else "牌形不满足当前 120 张规则",
        tuple(checks),
        expected,
        gold_count,
    )
