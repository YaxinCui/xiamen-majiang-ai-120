# xiamen-mahjong-ai-120

120 张“新厦麻”的独立规则、算法与网页验证项目。它不是 144 张老厦麻的配置档，
也不会在运行时切换到 144 张规则。

## 当前包含

- 服务端权威的 1 人对 3 个启发式机器人牌局
- 120 张牌墙、16/17 张发牌、补花、开金、白板替金、吃碰杠
- 抢金、起手三金倒、游金、双游、三游及固定主分＋水结算
- 与正式牌局共用判胡函数的“真实规则验牌桌”
- 四人同屏前端验牌桌、七个逐步教学情景和完整规则页面
- 多轮抖音/公开资料核验记录与双游、三游流程中间稿

## 本地启动

只依赖 Python 标准库：

```bash
cd /Users/cui/Desktop/xiamen-mahjong-ai-120
python3 scripts/serve_web_game.py
```

默认地址为 <http://127.0.0.1:8766/>。主要页面：

- `/`：120 张游戏大厅
- `/play-120.html`：1v3 真实牌局
- `/play-120-four.html`：四人同屏验牌（目前为前端实验室）
- `/win-test-120.html`：调用正式后端判胡的固定牌例测试
- `/scenarios-120.html`：逐步教学模拟
- `/rules-120.html`：规则说明与来源

运行测试：

```bash
python3 -m unittest discover -s tests -v
```

## 代码结构

- `xiamen_mahjong_120/rules.py`：唯一的 120 张规则配置与实现边界
- `xiamen_mahjong_120/game.py`：服务端牌局状态机
- `xiamen_mahjong_120/hand.py`、`rule_check.py`：牌形拆解与可解释判胡
- `xiamen_mahjong_120/scoring.py`：固定主分和水钱结算
- `xiamen_mahjong_120/agents.py`：当前启发式 Teacher 机器人
- `web_game_static/`：游戏、规则和验证页面，共用 `tile-ui.js`
- `RULES_RESEARCH.md`：规则证据、分歧与实现取舍
- `AGENTS.md`、`HANDOFF.md`：后续智能体的工作约束与交接状态

## 已知边界

- 当前机器人是确定性的启发式策略，不是 Ubuntu 训练主机上的模型；本仓库尚未包含
  模型权重、训练管线或远程主机凭据。
- 1v3 和真实验牌桌使用后端规则；四人验牌桌与情景实验室仍以交互演示为主。
- 后端已判断“五组＋一对”的基础胡牌，但尚未把碰碰胡、清一色识别为独立附加牌型，
  也未给它们追加房规分值。
- 七对不属于本仓库默认规则。抢杠、尾八熟张、尾四禁游、暗游截明游等仍是可选房规，
  在取得更稳定证据前不应静默加入核心算法。

规则依据和来源链接见 [RULES_RESEARCH.md](RULES_RESEARCH.md)。
