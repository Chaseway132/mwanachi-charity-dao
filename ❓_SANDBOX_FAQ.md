# ❓ Sandbox Mode - Frequently Asked Questions

## 🎯 **Quick Answers**

### Q: Will I lose money testing M-Pesa?
**A:** ❌ No! You're in sandbox mode. No real money is involved. Your M-Pesa balance is safe! ✅

### Q: Where does the money go if payment succeeds?
**A:** Nowhere! It's all simulated. The transaction is fake, just for testing. ✅

### Q: Can I test unlimited times?
**A:** ✅ Yes! Sandbox is free and unlimited. Test as much as you want! 🎉

### Q: Will my M-Pesa balance change?
**A:** ❌ No! Your balance stays the same. It's all simulated. ✅

### Q: What happens when I go to production?
**A:** Real money will be involved. Customers will pay real money, and you'll receive it. 💳

### Q: How do I know I'm in sandbox?
**A:** Check your `.env` file:
```
MPESA_ENVIRONMENT=sandbox  ← This means sandbox
```

### Q: Can I switch to production now?
**A:** ❌ Not yet. You need production credentials from Safaricom first. 📋

### Q: How long does it take to get production credentials?
**A:** Usually 1-2 weeks after applying. 📅

### Q: Will my code work in production without changes?
**A:** ✅ Yes! Just change the environment variables. The code stays the same. 🔄

### Q: What's the commission in production?
**A:** Usually 2-3% per transaction. Example: KES 1000 → You get KES 970-980. 💰

---

## 🧪 **Sandbox Testing**

### What You CAN Do:
- ✅ Test STK Push
- ✅ Test payment success
- ✅ Test payment failure
- ✅ Test payment timeout
- ✅ Test callback handling
- ✅ Test database logging
- ✅ Test unlimited times
- ✅ Test with no cost

### What You CAN'T Do:
- ❌ Test real money deduction
- ❌ Test real money receipt
- ❌ Test bank transfers
- ❌ Test actual balance changes
- ❌ Test with real customers

---

## 💳 **Production Mode**

### What You CAN Do:
- ✅ Accept real payments
- ✅ Receive real money
- ✅ Process real transactions
- ✅ Serve real customers
- ✅ Withdraw to bank account

### What You CAN'T Do:
- ❌ Test without cost
- ❌ Test unlimited times
- ❌ Test with fake data
- ❌ Make mistakes (costs money!)

---

## 🔄 **Sandbox to Production Timeline**

### Week 1: Testing (Now)
- ✅ Test M-Pesa in sandbox
- ✅ Verify all features work
- ✅ Check database logging
- ✅ Deploy smart contracts

### Week 2-3: Credentials
- ⏳ Apply for production credentials
- ⏳ Provide business details
- ⏳ Wait for approval

### Week 4: Deployment
- ⏳ Update environment variables
- ⏳ Deploy to production
- ⏳ Final testing

### Week 5+: Go Live
- ⏳ Accept real payments
- ⏳ Receive real money
- ⏳ Scale up

---

## 💰 **Money Flow Examples**

### Sandbox (Current):
```
You: Send KES 1 STK Push
Sandbox: Simulates payment
Your Balance: KES 500 (unchanged)
Backend: Logs transaction
MongoDB: Saves record
Result: ✅ No money involved
```

### Production (Future):
```
Customer: Sends KES 1000
M-Pesa: Processes payment
Customer Balance: KES 500 (was 1500)
Your Balance: KES 980 (was 0)
Backend: Logs transaction
MongoDB: Saves record
Result: ✅ Real money transferred
```

---

## 🔐 **Security Notes**

### Sandbox:
- ✅ Safe to test
- ✅ No real money at risk
- ✅ Perfect for development
- ✅ No security concerns

### Production:
- ⚠️ Real money at risk
- ⚠️ Need security audit
- ⚠️ Need SSL/HTTPS
- ⚠️ Need proper error handling
- ⚠️ Need fraud detection

---

## 📋 **Checklist Before Going to Production**

- [ ] All sandbox tests pass
- [ ] Database logging works
- [ ] Error handling is complete
- [ ] Security audit done
- [ ] SSL/HTTPS configured
- [ ] Callback URL is HTTPS
- [ ] Production credentials obtained
- [ ] Business registered with Safaricom
- [ ] Bank account ready
- [ ] Terms & conditions ready
- [ ] Privacy policy ready
- [ ] Customer support ready

---

## 🎯 **Your Current Status**

✅ **Sandbox Mode Active**
- ✅ Testing M-Pesa integration
- ✅ No real money involved
- ✅ Your balance is safe
- ✅ All transactions are simulated
- ✅ Perfect for development

---

## 🚀 **Next Steps**

1. ✅ Test M-Pesa with your 3 SIM cards
2. ✅ Verify all transactions logged
3. ✅ Check MongoDB records
4. ✅ Deploy smart contracts
5. ⏳ Later: Apply for production credentials
6. ⏳ Later: Go live with real money

---

## 💡 **Remember**

**You're in sandbox mode. Your money is safe! Test as much as you want! 🎉**

No real money is involved. Everything is simulated. Perfect for development! ✅

---

**Keep testing! You're doing great! 🚀**

