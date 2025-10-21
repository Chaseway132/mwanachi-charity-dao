# 🧪 Backend API Testing Guide

## Quick Start

### 1. Start Backend
```bash
cd backend
npm start
```

Server runs on: `http://localhost:5000`

### 2. Test Health Check
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "Backend is running",
  "timestamp": "2025-10-21T13:00:00.000Z"
}
```

---

## 📡 API Testing Examples

### M-Pesa STK Push

**Initiate Payment:**
```bash
curl -X POST http://localhost:5000/api/mpesa/stk-push \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "254712345678",
    "amount": 100,
    "accountReference": "donation-001",
    "description": "Donation to Charity DAO"
  }'
```

**Query Payment Status:**
```bash
curl -X POST http://localhost:5000/api/mpesa/query-status \
  -H "Content-Type: application/json" \
  -d '{
    "checkoutRequestId": "ws_CO_DMZ_123456789_2025102113000000"
  }'
```

---

### Donations

**Create Donation:**
```bash
curl -X POST http://localhost:5000/api/donations \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "254712345678",
    "amount": 100,
    "proposalId": "proposal_001",
    "donorName": "John Doe",
    "mpesaTransactionId": "LHD61H5QV61",
    "mpesaReceiptNumber": "LHD61H5QV61"
  }'
```

**Get All Donations:**
```bash
curl http://localhost:5000/api/donations
```

**Get Single Donation:**
```bash
curl http://localhost:5000/api/donations/donation_1729516800000
```

**Update Donation:**
```bash
curl -X PATCH http://localhost:5000/api/donations/donation_1729516800000 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "confirmed",
    "blockchainTxHash": "0x123abc..."
  }'
```

---

### Proposals

**Create Proposal:**
```bash
curl -X POST http://localhost:5000/api/proposals \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Build Water Well in Kibera",
    "description": "We need to build a water well to serve 500 families",
    "amountRequested": 5000,
    "recipientAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f42bE",
    "creatorPhone": "254712345678",
    "category": "water"
  }'
```

**Get All Proposals:**
```bash
curl http://localhost:5000/api/proposals
```

**Get Single Proposal:**
```bash
curl http://localhost:5000/api/proposals/proposal_1729516800000
```

**Update Proposal:**
```bash
curl -X PATCH http://localhost:5000/api/proposals/proposal_1729516800000 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "voting",
    "blockchainId": "1",
    "blockchainTxHash": "0x123abc..."
  }'
```

---

### Comments

**Create Comment:**
```bash
curl -X POST http://localhost:5000/api/comments \
  -H "Content-Type: application/json" \
  -d '{
    "proposalId": "proposal_1729516800000",
    "authorPhone": "254712345678",
    "authorName": "Jane Smith",
    "content": "This is a great initiative! I support it."
  }'
```

**Get All Comments:**
```bash
curl http://localhost:5000/api/comments
```

**Get Comments for Proposal:**
```bash
curl http://localhost:5000/api/comments/proposal/proposal_1729516800000
```

**Update Comment:**
```bash
curl -X PATCH http://localhost:5000/api/comments/comment_1729516800000 \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Updated comment text",
    "likes": 5
  }'
```

**Delete Comment:**
```bash
curl -X DELETE http://localhost:5000/api/comments/comment_1729516800000
```

---

### Blockchain

**Record Donation on Blockchain:**
```bash
curl -X POST http://localhost:5000/api/blockchain/record-donation \
  -H "Content-Type: application/json" \
  -d '{
    "donorPhone": "254712345678",
    "amount": 100,
    "proposalId": "proposal_001",
    "mpesaTransactionId": "LHD61H5QV61"
  }'
```

**Create Proposal on Blockchain:**
```bash
curl -X POST http://localhost:5000/api/blockchain/create-proposal \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Build Water Well",
    "description": "Water well for 500 families",
    "amountRequested": 5000,
    "recipientAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f42bE"
  }'
```

**Vote on Proposal:**
```bash
curl -X POST http://localhost:5000/api/blockchain/vote \
  -H "Content-Type: application/json" \
  -d '{
    "proposalId": "1",
    "voterPhone": "254712345678",
    "voteChoice": "for"
  }'
```

**Check Transaction Status:**
```bash
curl http://localhost:5000/api/blockchain/tx-status/0x123abc...
```

---

## 🧪 Testing with Postman

1. Import these endpoints into Postman
2. Create environment variables:
   - `base_url` = `http://localhost:5000`
   - `phone` = `254712345678`
   - `amount` = `100`

3. Use in requests:
   ```
   {{base_url}}/api/donations
   ```

---

## 📊 Data Flow Example

### Complete Donation Flow

1. **User enters phone and amount in frontend**
   ```
   Phone: 254712345678
   Amount: 100 KES
   ```

2. **Frontend calls STK Push**
   ```
   POST /api/mpesa/stk-push
   ```

3. **M-Pesa sends prompt to user's phone**
   ```
   "Enter PIN to complete donation"
   ```

4. **User enters PIN**
   ```
   M-Pesa processes payment
   ```

5. **M-Pesa sends callback to backend**
   ```
   POST /api/mpesa/callback
   ```

6. **Backend records donation**
   ```
   POST /api/donations
   ```

7. **Backend records on blockchain**
   ```
   POST /api/blockchain/record-donation
   ```

8. **Frontend shows confirmation**
   ```
   "Donation successful! Thank you."
   ```

---

## 🐛 Debugging

### Enable Verbose Logging

Add to `server.js`:
```javascript
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});
```

### Check Port Usage

```bash
# Windows
netstat -ano | findstr :5000

# Mac/Linux
lsof -i :5000
```

### Test with Different Tools

- **curl** - Command line
- **Postman** - GUI
- **Thunder Client** - VS Code extension
- **REST Client** - VS Code extension

---

## ✅ Checklist

- [ ] Backend starts without errors
- [ ] Health check returns 200
- [ ] Can create donations
- [ ] Can create proposals
- [ ] Can create comments
- [ ] Can update records
- [ ] Can delete comments
- [ ] M-Pesa credentials configured
- [ ] Firebase configured
- [ ] Blockchain addresses configured

---

## 🆘 Common Issues

**Port 5000 already in use:**
```bash
# Kill process
taskkill /PID <PID> /F

# Or use different port
PORT=3000 npm start
```

**CORS errors:**
- Check frontend URL in CORS config
- Add to `.env`: `FRONTEND_URL=http://localhost:3000`

**M-Pesa errors:**
- Verify credentials in `.env`
- Check phone number format
- Use sandbox environment

---

## 📝 Notes

- All data is currently in-memory (resets on server restart)
- Will move to Firebase in Phase 3
- M-Pesa requires valid credentials to test
- Blockchain requires contract addresses and private key

