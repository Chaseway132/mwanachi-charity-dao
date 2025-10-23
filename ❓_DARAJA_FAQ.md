# ❓ Daraja API - Frequently Asked Questions

## 🎯 **Quick Answers**

### Q: Do I need M-Pesa bundle to test?
**A:** ❌ No! Daraja is cloud-based. No bundle needed! ✅

### Q: Will WiFi work?
**A:** ✅ Yes! WiFi works perfectly! 🌐

### Q: Do I need Safaricom WiFi?
**A:** ❌ No! Any WiFi works! 📡

### Q: What is Daraja?
**A:** Daraja = "Bridge" in Swahili. It's Safaricom's cloud API for M-Pesa. 🌉

### Q: Where is Daraja hosted?
**A:** On Safaricom's cloud servers. Accessible from anywhere. ☁️

### Q: How does Daraja connect to M-Pesa?
**A:** Daraja is Safaricom's official API. It connects directly to M-Pesa network. 🔗

### Q: Can I test from anywhere?
**A:** ✅ Yes! Any internet connection works! 🌍

### Q: Do I need to install anything?
**A:** ❌ No! It's all cloud-based! ☁️

### Q: Is Daraja free?
**A:** ✅ Yes! Sandbox is free! 💰

### Q: When do I pay?
**A:** Only in production when customers send real money. 💳

---

## 🌐 **Daraja Basics**

### What is Daraja?
- ✅ Safaricom's official M-Pesa API
- ✅ Cloud-based (no installation)
- ✅ RESTful API (standard HTTP)
- ✅ HTTPS secured
- ✅ Two environments: Sandbox & Production

### How to Access Daraja?
```
Sandbox: https://sandbox.safaricom.co.ke
Production: https://api.safaricom.co.ke
```

### What Can You Do with Daraja?
- ✅ Send STK Push
- ✅ Query payment status
- ✅ Receive callbacks
- ✅ Check balance
- ✅ Reverse transactions

---

## 🔄 **Connection Flow**

### Simple Version:
```
Your Phone (WiFi)
    ↓
Backend (Render)
    ↓
Daraja (Safaricom Cloud)
    ↓
M-Pesa Network
    ↓
Your Phone (M-Pesa SIM)
```

### Detailed Version:
```
1. You click "Send STK Push"
2. Frontend sends request to Backend (uses your WiFi)
3. Backend connects to Daraja (uses Render's internet)
4. Daraja connects to M-Pesa Network (Safaricom's network)
5. M-Pesa sends STK prompt to your phone (M-Pesa SIM)
6. You enter PIN
7. M-Pesa processes payment
8. M-Pesa sends callback to Backend
9. Backend saves to MongoDB
```

---

## 💡 **Why No M-Pesa Bundle Needed**

### Reason 1: Daraja is Cloud API
- ✅ Accessed via HTTPS
- ✅ Works like any website
- ✅ No M-Pesa network needed
- ✅ No special connection needed

### Reason 2: Backend is Cloud Server
- ✅ Render has its own internet
- ✅ Connects to Daraja independently
- ✅ Your WiFi only reaches frontend
- ✅ Backend handles Daraja connection

### Reason 3: M-Pesa SIM is Separate
- ✅ STK prompt comes via M-Pesa network
- ✅ Not via internet
- ✅ Works on any SIM with M-Pesa
- ✅ No bundle needed

---

## 🎯 **Internet Requirements**

### What You Need:
- ✅ WiFi or mobile data
- ✅ M-Pesa SIM
- ✅ That's it!

### What You DON'T Need:
- ❌ M-Pesa bundle
- ❌ M-Pesa data plan
- ❌ Safaricom WiFi
- ❌ Special network

---

## 🔐 **Security**

### Daraja Uses:
- ✅ HTTPS encryption
- ✅ OAuth 2.0 authentication
- ✅ API keys & secrets
- ✅ Timestamp validation
- ✅ Password hashing

### Your Credentials:
```
MPESA_CONSUMER_KEY=2DJeVUnEaE1Gu9p8tXp7MtmBxtmmFdete2YHgEI72eIGoGjz
MPESA_CONSUMER_SECRET=wCehryGcCLI2tPqR0N5KHT8zBPoEt8zABEtl3T62wVJ1ABKXdnlZak9nSpC8iPjq
MPESA_BUSINESS_SHORTCODE=174379
MPESA_PASSKEY=bfb279f9ba9b9d4edea5a426c7cc874b
```

### Security Notes:
- ✅ Credentials are in `.env` (not in code)
- ✅ Render environment variables are encrypted
- ✅ HTTPS protects data in transit
- ✅ OAuth tokens expire quickly

---

## 📊 **Sandbox vs Production**

| Feature | Sandbox | Production |
|---------|---------|-----------|
| URL | sandbox.safaricom.co.ke | api.safaricom.co.ke |
| Real Money | ❌ No | ✅ Yes |
| Cost | ✅ Free | ✅ Per transaction |
| Testing | ✅ Unlimited | ✅ Limited |
| Credentials | Sandbox keys | Production keys |

---

## 🚀 **Your Setup**

### Current Configuration:
```
Environment: Sandbox
Daraja URL: https://sandbox.safaricom.co.ke
Backend: https://mwanachi-charity-dao-backend.onrender.com
Frontend: https://chaseway132.github.io/mwanachi-charity-dao/
```

### What This Means:
- ✅ All connections are cloud-based
- ✅ No local installation needed
- ✅ No M-Pesa bundle needed
- ✅ WiFi works perfectly
- ✅ Ready to test!

---

## ✅ **Verification Checklist**

- [ ] WiFi is connected
- [ ] M-Pesa SIM is active
- [ ] Frontend loads
- [ ] Backend is running
- [ ] Daraja credentials are set
- [ ] Ready to test!

---

## 🎯 **Next Steps**

1. ✅ Understand Daraja connection
2. ✅ Wait for Render to redeploy
3. ✅ Test M-Pesa with WiFi
4. ✅ Check Render logs
5. ✅ Verify transaction logged

---

## 💡 **Remember**

**You don't need M-Pesa bundle!**

- ✅ Daraja is cloud-based
- ✅ Backend is cloud-based
- ✅ Only frontend needs your internet
- ✅ M-Pesa network is separate
- ✅ WiFi works perfectly!

---

**You're all set! Test M-Pesa now! 🚀**

