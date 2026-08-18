"""Explainable fixed settlement for 120-tile Xiamen Mahjong."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from .tiles import tile_name


@dataclass(frozen=True)
class ScoreBreakdown:
    base: int
    water: int
    unit: int
    multiplier: int
    per_payer: int
    total: int
    items: tuple[dict[str, Any], ...]

    def payload(self) -> dict[str, Any]:
        return {
            "mode": "new120_fixed",
            "base": self.base,
            "water": self.water,
            "unit": self.unit,
            "multiplier": self.multiplier,
            "per_payer": self.per_payer,
            "total": self.total,
            "items": list(self.items),
        }


def new120_score(player, *, gold_tile: int | None, win_type: str, rules) -> ScoreBreakdown:
    """Calculate the fixed main score plus flower/gold/kong water."""

    main_scores = {
        "discard": rules.fixed_discard_score,
        "self_draw": rules.fixed_self_draw_score,
        "travelling_gold": rules.fixed_touring_score,
        "double_travelling": rules.fixed_double_touring_score,
        "triple_travelling": rules.fixed_triple_touring_score,
        "three_gold_open": rules.fixed_three_gold_score,
        "opening_gold": rules.fixed_touring_score,
    }
    base = int(main_scores.get(win_type, rules.fixed_self_draw_score))
    items: list[dict[str, Any]] = []

    def add(label: str, amount: int, detail: str | None = None) -> None:
        if not amount:
            return
        item: dict[str, Any] = {"label": label, "water": amount}
        if detail:
            item["detail"] = detail
        items.append(item)

    add("花牌", len(player.flowers), "每张花牌 1 水")
    gold_count = player.hand.count(gold_tile) if gold_tile is not None else 0
    if win_type == "opening_gold":
        gold_count += 1
    if win_type in {"travelling_gold", "double_travelling", "triple_travelling"}:
        gold_count = max(0, gold_count - 1)
    add("真金", gold_count, "游金成立所用的那张金默认不重复计水")
    for meld in player.melds:
        representative = meld.get("value", meld["tiles"][0])
        if meld["kind"] in {"ming_kan", "add_kan"}:
            add(f"{tile_name(representative)}明杠", 1)
        elif meld["kind"] == "an_kan":
            add(f"{tile_name(representative)}暗杠", 2)

    water = sum(int(item["water"]) for item in items)
    unit = base + water
    return ScoreBreakdown(
        base=base,
        water=water,
        unit=unit,
        multiplier=1,
        per_payer=unit,
        total=unit * 3,
        items=tuple(items),
    )
