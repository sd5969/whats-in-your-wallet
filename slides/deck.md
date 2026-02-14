---
title: Vibecoding Lessons from My First Project
subtitle: Building a MERN app in minutes, production in days
---

# Vibecoding: What I Learned in My First Project

- Built a full MERN app in <10 minutes after a 5+ year gap
- Context: Enterprise OpenAI Codex licenses just rolled out
- Goal: solve a real wallet problem fast, then harden it

Presenter: Sanjit Dutta
Date: Feb 2026
Takeaway: Vibecoding compresses the first 10% of delivery to minutes.

---

# The Problem + The Demo

**Problem:** credit card rewards changes are breaking my wallet setup

**Solution:** a tool to test card portfolios and spend routing scenarios

**Demo:** add a screenshot and link to the live app

- Demo link: `https://lnkd.in/ew2dtgms`
- Repo for bugs: `https://lnkd.in/ejAyzACp`

![Demo screenshot](assets/demo-screenshot.png)
Takeaway: Real pain + real demo = instant buy‑in.

---

# Timeline: Speed vs. Production Reality

- **10 minutes:** working MVP
- **1 day (intermittent):** refine UX and logic
- **A few days (intermittent):** production hardening

Key takeaway: vibecoding accelerates starts, not finishes

![Timeline graphic](assets/timeline.png)
Takeaway: Minutes to build, days to make it durable.

---

# What Worked (and Why It Worked)

- Clear technical language kept Codex on track
- Fundamentals still mattered: CSS, Express.js, NoSQL, deployment
- Treat Codex like an SDE1: fast, helpful, needs direction and review
- Architecture decisions still drive extensibility (Codex makes many of them)

**Stack:** MERN + OpenAI Codex + local storage session

![Stack graphic](assets/stack.png)
Takeaway: Fundamentals + clear prompts compound speed.

---

# Why Vibecoding Alone Isn’t Production-Safe

- No `.gitignore` by default → easy to commit `.env` secrets
- Codex suggested a complex deploy path; a local session was simpler
- Dead code + legacy artifacts (e.g., vestigial Mongo) accumulate
- Debug loops can dig deeper holes, increasing tech debt

**Guardrails I’d enforce next time:**
- Secrets scanning + linting
- Minimal architecture review up front
- Explicit acceptance tests before deploy

![Failure/guardrails graphic](assets/guardrails.png)
Takeaway: Without guardrails, speed becomes fragility.

---

# Disclaimer: This Deck Was Vibecoded

- Built with the same workflow as the app (Codex + light human review)
- Design iterations were prompted, generated, and refined in minutes
- Final structure, takeaways, and edits are still mine

Takeaway: If the deck is good, credit the human review.

---

# What I Learned About the Card / Churning Game

- For NYC‑sized rent, **Bilt is hard to beat** on pure points value
- Rent points tend to dominate the portfolio economics
- The right “everyday” card matters less once rent is optimized

Takeaway: Maxing Bilt for rent usually wins when rent is large.
