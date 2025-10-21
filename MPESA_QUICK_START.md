# M-Pesa Integration - Quick Start Guide

## 🚀 Quick Start (5 minutes)

### 1. Start the Backend
```bash
cd backend
npm start
```
✅ Backend running on `http://localhost:5000`

### 2. Test the Integration
```bash
cd backend
node test-mpesa-integration.js
```
✅ All tests should pass

### 3. Use in Frontend
- Open the Charity DAO app
- Go to Donations
- Click "📱 M-Pesa" tab
- Enter phone number and amount
- Click "Send STK Push"

---

## 📱 M-Pesa Payment Flow

```
User Input
    ↓
STK Push Request
    ↓
M-Pesa Prompt on Phone
    ↓
User Enters PIN
    ↓
Payment Confirmed
    ↓
Donation Recorded
```

---

## 🔧 Configuration

### Environment Variables (.env)
```
MPESA_CONSUMER_KEY=2DJeVUnEaE1Gu9p8tXp7MtmBxtmmFdete2YHgEI72eIGoGjz
MPESA_CONSUMER_SECRET=wCehryGcCLI2tPqR0N5KHT8zBPoEt8zABEtl3T62wVJ1ABKXdnlZak9nSpC8iPjq
MPESA_BUSINESS_SHORTCODE=174379
MPESA_PASSKEY=bfb279f9ba9b9d4edea5a426c7cc874b
MPESA_ENVIRONMENT=sandbox
MPESA_CALLBACK_URL=http://localhost:5000/api/mpesa/callback
PORT=5000
NODE_ENV=development
BACKEND_URL=http://localhost:5000
```

---

## 📡 API Endpoints

### M-Pesa Endpoints
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/mpesa/stk-push` | Initiate payment |
| POST | `/api/mpesa/callback` | Handle payment callback |
| POST | `/api/mpesa/query-status` | Check payment status |

### Donation Endpoints
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/donations` | Get all donations |
| GET | `/api/donations/:id` | Get specific donation |
| POST | `/api/donations` | Create donation |
| PATCH | `/api/donations/:id` | Update donation |

### Blockchain Endpoints
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/blockchain/record-donation` | Record on blockchain |

---

## 🧪 Test Examples

### Test STK Push
```bash
curl -X POST http://localhost:5000/api/mpesa/stk-push \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "254712345678",
    "amount": 100,
    "accountReference": "TEST-001",
    "description": "Test Donation"
  }'
```

### Test Callback
```bash
curl -X POST http://localhost:5000/api/mpesa/callback \
  -H "Content-Type: application/json" \
  -d '{
    "Body": {
      "stkCallback": {
        "MerchantRequestID": "TEST-001",
        "CheckoutRequestID": "TEST-CHECKOUT-001",
        "ResultCode": 0,
        "ResultDesc": "Success",
        "CallbackMetadata": {
          "Item": [
            {"Name": "Amount", "Value": 100},
            {"Name": "MpesaReceiptNumber", "Value": "TEST-RECEIPT"},
            {"Name": "TransactionDate", "Value": "20251021150000"},
            {"Name": "PhoneNumber", "Value": "254712345678"}
          ]
        }
      }
    }
  }'
```

### Get All Donations
```bash
curl http://localhost:5000/api/donations
```

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `backend/.env` | Configuration & credentials |
| `backend/routes/mpesa.js` | M-Pesa API routes |
| `backend/utils/donationHandler.js` | Donation recording logic |
| `backend/routes/donations.js` | Donation CRUD operations |
| `backend/routes/blockchain.js` | Blockchain integration |
| `charity-dao-frontend/src/components/MPesaPaymentForm.tsx` | M-Pesa UI component |
| `charity-dao-frontend/src/components/DonationForm.tsx` | Main donation form |
| `backend/test-mpesa-integration.js` | Test suite |

---

## ✅ Checklist

- [x] M-Pesa credentials obtained
- [x] Backend configured
- [x] M-Pesa routes implemented
- [x] Donation handler created
- [x] Frontend component created
- [x] Integration completed
- [x] Tests passing
- [x] Documentation complete

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if port 5000 is in use
lsof -i :5000

# Kill process on port 5000
kill -9 <PID>

# Try again
npm start
```

### M-Pesa API errors
- Check `.env` file has correct credentials
- Verify phone number format (254XXXXXXXXX)
- Check amount is between 1-150000 KES
- Ensure backend is running

### Tests failing
```bash
# Make sure backend is running first
npm start

# In another terminal
node test-mpesa-integration.js
```

---

## 📞 Support

For issues or questions:
1. Check the logs in the terminal
2. Review `MPESA_INTEGRATION_SUMMARY.md`
3. Check `MPESA_IMPLEMENTATION_STEPS.md`
4. Review M-Pesa API documentation

---

## 🎉 You're All Set!

The M-Pesa integration is ready to use. Start the backend and begin accepting M-Pesa donations! 🚀

