# Smart Watchlist

> A market watchlist that tells you what changed, how important it is, and why you should care.

## Overview

Most stock watchlists show the current price of a stock.

But when a user comes back after some time, an important question is:

**"What actually changed while I was away?"**

Smart Watchlist is built around this question.

Instead of making users check every stock, price movement, volume and news separately, the system looks at these signals and highlights the changes that deserve attention.

The goal is simple:

**Track less. Understand more.**

---

## What Problem Does It Solve?

A normal watchlist can tell you:

- Current stock price
- Price change
- Basic market information

But it does not always tell you:

- What changed since you last checked
- Whether the change is important
- Whether the movement is unusual
- Whether trading volume is higher than normal
- Whether there is relevant news behind the movement

Smart Watchlist brings these signals together in one place.

---

## Key Features

### 1. Smart Watchlist

Users can add and manage the stocks they want to follow.

The selected stocks are stored in the database so the watchlist can be used again later.

### 2. Meaningful Changes

The system checks stock movements and identifies changes that deserve attention.

Changes are grouped into different levels:

- LOW
- MEDIUM
- HIGH

For example:

- Small movement → LOW
- Noticeable movement → MEDIUM
- Large or unusual movement → HIGH

This helps users focus on important events instead of looking at every small price change.

### 3. Price Movement Detection

The system compares current and previous stock prices.

It calculates the percentage movement and identifies significant changes.

This allows the application to answer:

> "Did this stock move enough to deserve my attention?"

### 4. Anomaly Detection

Not every large movement is normal.

Smart Watchlist compares recent price movement with previous movement and detects unusual activity.

This helps identify stocks whose current movement is outside their normal range.

### 5. Trading Volume Analysis

Price alone does not always tell the complete story.

The system also checks trading volume and compares it with normal activity.

Higher-than-normal volume can indicate that something important may be happening.

### 6. Stock-Specific News

The application collects recent news related to stocks in the watchlist.

News is filtered to reduce duplicate stories and is stored for later use.

This allows users to see relevant information without searching multiple websites themselves.

### 7. News Importance

News is classified based on its importance.

The system tries to separate useful market information from less important news.

This helps reduce information overload.

### 8. Alerts

Important stock movements can generate alerts.

For example:

> TCS increased significantly.

Alerts help users quickly identify stocks that may need attention.

### 9. Reason Behind Movement

Instead of only showing:

> TCS: +5.2%

the system can provide context such as:

- Significant price movement detected
- Trading volume is above normal
- Price movement is unusually high
- Important stock-related news detected

This makes the information easier to understand.

---

## How It Works

The system follows a simple process:

User Watchlist
      |
      v
Market Data
      |
      +----> Price Movement
      |
      +----> Trading Volume
      |
      +----> Anomaly Detection
      |
      +----> Stock News
      |
      v
Meaningful Change Detection
      |
      v
Importance Level
      |
      v
Reason / Alert
      |
      v
Dashboard

##What Makes Smart Watchlist Different?

A traditional watchlist answers:

"What is the price?"

Smart Watchlist tries to answer:

"What changed, how important is it, and why should I care?"

This changes the focus from tracking stocks to understanding changes.

The project is designed to reduce the time users spend checking multiple stocks and multiple information sources.

##Technology Stack

1.Frontend: HTML, CSS, JavaScript
2.Backend: Node.js, Express.js
3.Database: SQLite
4.Market Data: Yahoo Finance
5.News: Google News RSS
6.Backend Features: REST APIs, Price history storage, Watchlist management, Alert generation, Anomaly detection, Meaningful change detection, News aggregation
and Rule-based reasoning

##System Architecture
                    Smart Watchlist
                          |
             +------------+------------+
             |                         |
          Frontend                  Backend
             |                         |
      HTML / CSS / JS             Node.js
                                       |
                                  Express.js
                                       |
             +-------------------------+----------------------+
             |                |                |              |
        Watchlist         Stock Data        News          Analysis
             |                |                |              |
             |          Yahoo Finance     Google News         |
             |                                             |
             +-------------------+-------------------------+
                                 |
                              SQLite
                                 |
                         Stored Market Data

##Data and Change Detection
The application stores historical stock information instead of only looking at the current value.
This allows the system to compare:
Previous Data
      +
Current Data
      |
      v
Change Detection
      |
      v
Is the change meaningful?
      |
      +---- No ----> Normal
      |
      +---- Yes ---> Attention Required

The system considers multiple signals instead of relying only on price.

These include:
1.Price movement
2.Trading volume
3.Historical movement
4.Unusual activity
5.Relevant news

##Example

Suppose a user is tracking TCS.

A basic watchlist might show:

TCS
Price: ₹3,850
Change: +4.8%

Smart Watchlist can provide more context:

TCS

Price movement: +4.8%
Attention: HIGH

Why?
- Significant price movement detected
- Trading volume is above normal
- Unusual price movement detected
- Relevant news detected

The user can understand the situation much faster.

#Project Structure:
Smart-Watchlist/
|
├── backend/
│   ├── server.js
│   ├── db.js
│   ├── stockService.js
│   ├── watchlistRoutes.js
│   ├── alertRoutes.js
│   ├── newsRoutes.js
│   ├── newsService.js
│   ├── anomalyService.js
│   ├── changeService.js
│   ├── reasonService.js
│   ├── monitorService.js
│   ├── aiService.js
│   ├── package.json
│   └── ...
|
├── docs/
│   └── index.html
|
└── README.md
