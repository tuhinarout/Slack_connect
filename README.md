# Slack Connect Application

## 📌 Objective
A full-stack web application that allows users to:
- Connect their Slack workspace using **OAuth 2.0**
- Send messages immediately to a selected Slack channel
- Schedule messages for future delivery
- Manage scheduled messages (view & cancel before sending)

---

## 🚀 Features
1. **Secure Slack Connection & Token Management**
   - OAuth 2.0 flow to connect to Slack
   - Secure storage of access & refresh tokens
   - Automatic refresh token logic to maintain continuous service without re-authentication

2. **Message Sending (Immediate & Scheduled)**
   - UI to select a Slack channel and compose a message
   - Send instantly or schedule for a future date/time
   - Backend persistence of scheduled messages and reliable delivery

3. **Scheduled Message Management**
   - List all scheduled messages
   - Cancel a scheduled message before it’s sent

---

## 🛠️ Tech Stack
**Frontend:** TypeScript, JavaScript (ES6+), React (or Vue.js/Angular)  
**Backend:** Node.js, Express.js, TypeScript  
**Database:** SQLite / LowDB / MongoDB / JSON storage  

---


