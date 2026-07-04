# IXAI Product Vision

## 1. Core Positioning

IXAI is not a brokerage app, not a generic finance dashboard, and not a generic chatbot.

IXAI has two complementary products:

- Product A — AI Financial Media.
- Product B — AI Investment Monitoring.

Product A helps everyone understand what matters in today's market.

Product B helps every investor understand what matters to their own investments.

Workspace remains an AI Investment Monitoring System.

中文核心句：

讓 AI 全天候監控你的投資，而不是你全天候盯著市場。

英文核心句：

AI watches your investments, so you don't have to.

Always-on system sentence:

```text
IXAI is an always-on AI investment monitoring system.
It works continuously in the background, so users don't have to.
```

中文：

```text
IXAI 是全天候運作的 AI 投資監控系統。
AI 在背景持續工作，讓使用者不用全天候盯著市場。
```

IXAI is not:

- 投資平台
- 一般新聞平台
- 券商
- 自動交易系統
- 投顧
- Robo-advisor
- 單純 Chatbot

IXAI is:

- Monitoring
- Awareness
- Intelligence
- Workflow
- Risk explanation

Permanent product philosophy:

```text
The value of IXAI is not information.
The value of IXAI is relevance.
```

IXAI 的 AI 不替使用者做投資決策。

IXAI 的 AI 替使用者節省研究投資所需的大量時間。

Product value:

```text
Save hours every day by letting AI monitor your investments.
```

Source of truth:

- `docs/IXAI_PRODUCT_PHILOSOPHY.md`

## 2. Why IXAI Exists

市場上已經有很多：

- 券商 App
- 投資平台
- 新聞平台
- 財經網站
- 圖表工具
- 通用 AI 聊天工具

但多數工具不會真正理解使用者手上持有哪些資產，也不會主動替使用者把爆炸多的市場資訊過濾成「只跟我有關」的重點。

IXAI 的存在價值是：

AI 記得使用者持有哪些資產，持續監控價格、新聞、事件、FCN 風險、Portfolio 風險，並主動提醒真正重要的事情。

IXAI 不提供更多資訊作為核心價值。

IXAI 的核心價值是：

- 過濾資訊
- 找出重要資訊
- 找出與使用者真正相關的資訊
- 幫使用者節省蒐集、整理、交叉比對資訊的時間
- 讓使用者把時間留給自己的判斷與決策

At the same time, IXAI also needs a public trust and habit layer:

- Daily Brief
- Weekly Brief

These are AI Financial Media surfaces. They are not a free Workspace and not investment advice. They exist to help the public understand what matters in the market, build trust, and create a daily / weekly reason to return to IXAI.

Public Daily / Weekly Brief may reference the information organization of high-usage financial media products such as 要聞, 熱榜, 自選, 快訊, 指數, and 市場概況, but IXAI must not become another news list. Public Brief is AI Curated Financial Media. Its purpose is to identify what truly matters, not to maximize article count.

The product funnel is:

```text
Public Visitor
↓
Daily Brief
↓
Weekly Brief
↓
建立信任
↓
建立使用習慣
↓
建立 Workspace
↓
輸入資產
↓
AI Monitoring
↓
Subscription
```

## 3. Core Product Promise

使用者 input 任意資產後：

- FCN
- Crypto
- Stock
- ETF
- 未來其他資產

IXAI 必須開始建立該資產的 intelligence layer。

每一個資產都應該能連結：

- 即時價格
- 即時新聞
- 相關事件
- AI 摘要
- Portfolio impact
- FCN impact
- Risk status
- 下一步需要留意什麼

## 4. Asset Intelligence

任何資產不只是資料列，而是一個被 AI 監控的投資物件。

Asset Intelligence 應包含：

- Price
- News
- Event
- Exposure
- Related FCN
- Related Watchlist
- Risk change
- AI summary
- User-facing alert

## 5. FCN Intelligence

FCN 是 IXAI 的核心差異化能力。

每一檔 FCN 都必須被 AI 監控：

- Worst-of underlying
- KI distance
- KO readiness
- Observation calendar
- Coupon calendar
- Maturity
- Underlying price
- Underlying news
- Earnings
- Volatility
- Risk summary

AI 必須每天回答：

- 今天哪一檔 FCN 最需要注意？
- 為什麼？
- 下一個 observation / coupon / maturity 是什麼？
- 哪個 underlying 造成主要風險？

## 6. Portfolio Intelligence

IXAI 必須理解整個 Portfolio，而不是只顯示持倉清單。

Portfolio Intelligence 應回答：

- 今天 Portfolio 狀態如何？
- 哪些資產影響最大？
- 哪些新聞真的與我的持倉有關？
- 哪些 FCN 受影響？
- 哪些風險正在上升？
- 今天最重要三件事是什麼？

## 7. News Relevance Engine

IXAI 不應顯示所有新聞。

IXAI 應該：

1. 根據使用者持有資產過濾新聞
2. 根據 Portfolio / FCN exposure 排序新聞重要性
3. 將新聞轉成 AI 摘要
4. 說明該新聞和使用者哪個資產有關
5. 只推送真正重要的事情

不要做：

- 一般新聞列表
- 無關新聞推送
- 為了內容量而堆新聞

## 8. AI Monitoring System

IXAI 不是等待使用者提問的聊天工具。

IXAI 也不是使用者打開 App 才開始工作的工具。

AI 應該在背景持續工作：

```text
News
↓
Events
↓
Prices
↓
Earnings
↓
Portfolio
↓
FCN
↓
Crypto
↓
Risk
↓
AI Analysis
↓
Today Focus
↓
Telegram / Workspace
```

使用者登入時，應該看到 AI 已經整理好的結果，而不是等待 AI 開始分析。

IXAI 應該主動監控：

- 價格
- 新聞
- 事件
- FCN observation
- coupon
- maturity
- KI / KO risk
- watchlist movement
- portfolio concentration
- market regime

AI 應每天主動產出：

- Today Focus
- Morning Brief
- Risk Alerts
- FCN Watch
- Portfolio Impact
- News relevance summary

## 8.1 Notification Philosophy

V16 第一階段通知不急著做 App Push。

Telegram 是第一個外部通知通道，因為它符合目前使用者已經建立的 monitoring workflow。

通知範例：

- FCN observation tomorrow.
- FCN KI distance approaching.
- Underlying earnings tonight.
- TSLA large move affects 3 FCNs.
- BTC volatility rising.
- Today Focus Top 3 ready.

每一則提醒都必須回答：

```text
Why does this matter to my investments?
這件事為什麼跟我的投資有關？
```

## 8.2 SaaS Strategy

IXAI 不應急著收費。

短期策略是先開放主要功能給使用者試用，找到 Wow Moment。

Wow Moment:

```text
原來 AI 可以每天幫我省下看盤、看新聞、追 FCN 的時間。
```

收費應等待：

- 使用者願意每天回來。
- Workspace 真的提供個人化監控價值。
- Telegram / AI Monitoring 產生留存。
- FCN monitoring 有明顯不可取代性。

## 9. Product Differentiation

Brokerage:

- 執行交易
- 顯示持倉
- 不主動理解新聞與 FCN 風險

News platforms:

- 提供大量新聞
- 不知道使用者持有哪些資產

Chart platforms:

- 提供圖表
- 不會主動解讀使用者 Portfolio

Generic AI chat:

- 可以回答問題
- 但不會持續記得與監控使用者資產

IXAI:

- 知道使用者持有哪些資產
- 將市場資訊與使用者持倉連結
- 主動過濾、摘要、提醒
- 以 FCN / Portfolio / Risk / News 為核心建立 AI monitoring workflow

## 10. Product Principles

未來所有功能必須符合：

1. Daily / Weekly 是否讓 public user 每天 / 每週更清楚市場真正重要的是什麼？
2. Workspace 是否讓 AI 更了解使用者持有什麼？
3. Workspace 是否讓 AI 更能主動監控？
4. 是否讓使用者少看無關新聞？
5. 是否能將新聞、價格、風險與持倉連結？
6. 是否能讓使用者更快知道今天該注意什麼？
7. 是否避免投顧、交易建議、自動下單與保證收益？

Daily / Weekly:

- 不是 Workspace 免費版。
- 是 AI Financial Media。
- 回答「今天市場發生什麼？」
- 不能依賴使用者 Portfolio。

Workspace:

- 不是新聞閱讀器。
- 是 AI Investment Monitoring。
- 回答「今天哪些事情影響我的投資？」
- 必須依賴使用者 Portfolio。

## 11. Compliance Boundary

IXAI 是：

- monitoring
- awareness
- intelligence
- workflow
- risk explanation

IXAI 不是：

- broker
- trading system
- signal seller
- robo-advisor
- discretionary manager
- investment advisory service without proper license

禁止產品語氣：

- 買進
- 賣出
- 保證
- 必漲
- 必跌
- 自動下單
- 我建議你買

允許產品語氣：

- 需要留意
- 風險上升
- 受到影響
- 建議查看
- 下一個觀察日
- 目前資料顯示
- 這不是投資建議

## 12. V16 Direction

V16 應以此文件與 `docs/V16_PRODUCT_STRATEGY.md` 為核心。

V16 正式拆成兩條主線：

- V16A — AI Financial Media
- V16B — AI Investment Monitoring

V16A 核心方向：

- Editorial Intelligence Foundation
- Market Intelligence
- Content Quality
- Media Growth
- Daily Brief 2.0
- Weekly Brief 2.0
- AI Curated Financial Media

V16B 核心要求：

- Always-On AI Monitoring：AI 在背景持續監控，不是等使用者打開 App 才開始。
- Telegram-first Notification：Telegram 是第一階段 AI Monitoring 外部通知通道。
- Global First：股票、ETF、Crypto、FCN、未來資產都必須以多市場、多地區、多資料來源為前提，不可硬寫單一市場假設。
- FCN First Differentiation：FCN 是 IXAI 的核心差異化能力，FCN Intelligence 是主監控系統之一，不是 Portfolio 的附屬小功能。
- Crypto-Native Intelligence：Crypto 需要自己的即時價格、新聞、on-chain、交易所、token unlock、ETF、治理與波動監控模型，不可直接套用股票模型。
- Event Intelligence：AI 不只監控現在，也要監控未來；財報、觀察日、配息日、maturity、macro calendar、token unlock、exchange events 都應納入投資監控。
- Asset-Centric Relevance：每一則新聞、事件、提醒、摘要都必須回答「這件事為什麼跟我的投資有關？」

優先方向：

1. Asset Intelligence
2. FCN Intelligence
3. Portfolio Intelligence
4. News Relevance Engine
5. AI Monitoring Feed
6. Today Focus
7. Copilot Suggested Questions
8. Observation / Coupon Calendar
9. Event Intelligence
10. Crypto-Native Intelligence

V16 的規劃來源：

- `docs/V16_PRODUCT_STRATEGY.md`
- `docs/V16_AI_MONITORING_PLATFORM.md`
