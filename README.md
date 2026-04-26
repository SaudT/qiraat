# Qiraat – Quran Recitations Platform

## 🕌 Overview

Qiraat is a mobile-first application for listening to **authentic Quran recitations**.

The goal is to create a **trusted, high-quality, distraction-free platform** where users can listen to recitations from verified reciters (sheikhs/imams).

This is NOT a social media app.
Trust, correctness, and simplicity are the highest priorities.

---

## 🎯 MVP Scope (Phase 1)

This is a **curated-only platform**:

* No public uploads yet
* Only pre-approved recitations
* Focus on listening experience

### Features:

* List recitations (feed)
* View recitation details
* Stream/play audio
* Basic user system (minimal)

---

## 🧠 Product Principles

* Trust > Growth
* Simplicity > Features
* Quality > Quantity
* No distractions (no likes/comments in MVP)

---

## 🏗️ Tech Stack

### Backend

* Python (FastAPI)
* PostgreSQL
* Clean architecture:

  * routes
  * controllers
  * services
  * models
  * schemas

### Mobile App

* React Native (Expo)
* React Navigation
* Expo AV (audio playback)

---

## 📦 Core Entity: Recitation

Fields:

* id
* title (e.g. Surah name)
* reciter_name
* audio_url
* duration
* created_at

---

## 🔊 Audio Philosophy

Audio playback is the **core experience**:

* must be smooth
* minimal controls
* distraction-free

Future:

* background playback
* downloads
* playlists

---

## 🚀 Future Phases (NOT MVP)

### Phase 2

* Controlled uploads
* Verification system

### Phase 3

* Reputation system
* Advanced discovery

---

## ⚠️ Constraints for AI (Cursor / Claude)

* Do NOT overengineer
* Do NOT generate entire app at once
* Build step-by-step
* Keep code clean and readable
* Explain briefly when needed

---

## ✅ Development Approach

Everything should be built in this order:

1. Backend foundation (FastAPI)
2. Recitation API
3. Mobile app UI
4. Audio playback
5. API integration

---

## 🧭 Goal

Build a **trusted global library of Quran recitations**
with a clean, modern, and spiritually aligned experience.
