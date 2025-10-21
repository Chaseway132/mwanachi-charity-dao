# 🚀 Special Donations Frontend - Quick Start Guide

## 📦 What's Included

5 production-ready React components for special donations:

1. **SpecialDonationsList.tsx** - Campaign listing page
2. **SpecialDonationDetail.tsx** - Campaign detail page
3. **SpecialDonationForm.tsx** - Donation form (M-Pesa & Crypto)
4. **DonationFeed.tsx** - Real-time donation stream
5. **FundFlowChart.tsx** - Fund analytics charts

---

## 🔧 Installation

### 1. Copy Components

All components are in `charity-dao-frontend/src/components/`:

```
SpecialDonationsList.tsx
SpecialDonationDetail.tsx
SpecialDonationForm.tsx
DonationFeed.tsx
FundFlowChart.tsx
```

### 2. Install Dependencies

```bash
cd charity-dao-frontend
npm install recharts lucide-react react-toastify
```

### 3. Add Routes

Update your `App.tsx` or router:

```typescript
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SpecialDonationsList from './components/SpecialDonationsList';
import SpecialDonationDetail from './components/SpecialDonationDetail';

function App() {
  return (
    <Router>
      <Routes>
        {/* ... other routes ... */}
        <Route path="/special-donations" element={<SpecialDonationsList />} />
        <Route path="/special-donations/:id" element={<SpecialDonationDetail />} />
      </Routes>
    </Router>
  );
}
```

### 4. Add Navigation Link

Add to your navigation menu:

```typescript
<Link to="/special-donations" className="nav-link">
  🆘 Special Causes
</Link>
```

---

## 🎯 Component Overview

### SpecialDonationsList
**Route:** `/special-donations`

Displays all special donation campaigns in a grid layout.

**Features:**
- Campaign cards with progress bars
- Filter tabs (All, Active, Completed)
- Real-time updates every 30 seconds
- Responsive grid (1 col mobile, 2 col tablet, 3 col desktop)

**Props:** None (fetches data from API)

**Example:**
```typescript
<SpecialDonationsList />
```

---

### SpecialDonationDetail
**Route:** `/special-donations/:id`

Displays full campaign details with donation options.

**Features:**
- Full campaign story
- Real-time progress tracking
- Recent donations feed
- Campaign updates timeline
- Embedded donation form
- Share and blockchain verification links

**Props:** Uses URL param `:id`

**Example:**
```typescript
<SpecialDonationDetail />
```

---

### SpecialDonationForm
**Route:** Embedded in SpecialDonationDetail

Handles donations via M-Pesa and Crypto.

**Features:**
- Tab-based payment method selection
- M-Pesa STK Push integration
- Phone number validation
- Amount validation (1-150,000 KES)
- Real-time payment status polling
- Automatic blockchain recording

**Props:**
```typescript
interface SpecialDonationFormProps {
  campaignId: number;        // Campaign ID
  onSuccess: () => void;     // Callback on successful donation
}
```

**Example:**
```typescript
<SpecialDonationForm 
  campaignId={123} 
  onSuccess={() => console.log('Donation successful')}
/>
```

---

### DonationFeed
**Route:** Can be used anywhere

Real-time donation stream with animations.

**Features:**
- Live donation updates every 5 seconds
- Payment method indicators
- Relative time display
- Transaction links to PolygonScan
- Slide-in animations
- Total raised display

**Props:**
```typescript
interface DonationFeedProps {
  campaignId?: number;  // Optional: filter by campaign
  limit?: number;       // Optional: max donations to show (default: 10)
}
```

**Example:**
```typescript
// Show all donations
<DonationFeed />

// Show donations for specific campaign
<DonationFeed campaignId={123} limit={5} />
```

---

### FundFlowChart
**Route:** Can be used anywhere

Fund analytics with charts and statistics.

**Features:**
- Pie chart (M-Pesa vs Crypto)
- Bar chart (Target vs Raised)
- Summary statistics
- Real-time data updates
- Responsive charts

**Props:**
```typescript
interface FundFlowChartProps {
  campaignId?: number;  // Optional: filter by campaign
}
```

**Example:**
```typescript
// Show global fund flow
<FundFlowChart />

// Show campaign-specific fund flow
<FundFlowChart campaignId={123} />
```

---

## 🔌 API Endpoints Required

The frontend expects these backend endpoints:

### Campaigns
```
GET    /api/special-donations
GET    /api/special-donations/:id
GET    /api/special-donations/:id/donations
GET    /api/special-donations/:id/updates
```

### Donations
```
POST   /api/special-donations/:id/donate
POST   /api/donations
GET    /api/donations
GET    /api/donations/stats
```

### M-Pesa
```
POST   /api/mpesa/stk-push
POST   /api/mpesa/query-status
```

---

## 📊 Data Structures

### Campaign Object
```typescript
interface Campaign {
  id: number;
  title: string;
  beneficiaryName: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  totalDonors: number;
  deadline: number;
  verified: boolean;
  closed: boolean;
  location: string;
  category: string;
  story: string;
  contractAddress: string;
}
```

### Donation Object
```typescript
interface Donation {
  id: number;
  campaignId: number;
  amount: number;
  method: 'mpesa' | 'crypto';
  mpesaReceiptNumber?: string;
  timestamp: number;
  donor?: string;
  transactionHash?: string;
}
```

### Update Object
```typescript
interface Update {
  id: number;
  title: string;
  content: string;
  timestamp: number;
}
```

---

## 🎨 Styling

All components use **Tailwind CSS** for styling.

### Color Scheme
- **Primary:** Orange (#f97316)
- **Secondary:** Red (#ef4444)
- **Accent:** Blue (#3b82f6)
- **Background:** White (#ffffff)
- **Text:** Gray (#1f2937)

### Responsive Breakpoints
- **Mobile:** < 768px
- **Tablet:** 768px - 1024px
- **Desktop:** > 1024px

---

## 🔄 Real-Time Updates

Components auto-refresh at different intervals:

| Component | Interval |
|-----------|----------|
| SpecialDonationsList | 30 seconds |
| SpecialDonationDetail | 10 seconds |
| DonationFeed | 5 seconds |
| FundFlowChart | On mount |

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] Campaign list displays correctly
- [ ] Filter tabs work (All, Active, Completed)
- [ ] Campaign cards show correct data
- [ ] Click "View & Donate" navigates to detail page
- [ ] Campaign detail page loads
- [ ] Progress bar updates in real-time
- [ ] Donation form appears
- [ ] M-Pesa tab works
- [ ] Phone number validation works
- [ ] Amount validation works
- [ ] STK Push is triggered
- [ ] Payment status updates
- [ ] Donation feed shows new donations
- [ ] Fund flow charts display correctly
- [ ] Share button works
- [ ] PolygonScan link works

---

## 🐛 Troubleshooting

### Components not displaying
- Check that all dependencies are installed
- Verify routes are added to App.tsx
- Check browser console for errors

### API errors
- Verify backend is running on port 5000
- Check API endpoints are implemented
- Verify CORS is configured

### M-Pesa not working
- Check M-Pesa credentials in backend .env
- Verify phone number format (254...)
- Check amount is within limits (1-150,000)

### Real-time updates not working
- Check browser console for fetch errors
- Verify API endpoints are returning data
- Check network tab for failed requests

---

## 📱 Mobile Optimization

All components are fully responsive:

- ✅ Mobile-first design
- ✅ Touch-friendly buttons
- ✅ Optimized grid layouts
- ✅ Readable text sizes
- ✅ Proper spacing

---

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Environment Variables
Create `.env.production`:
```
REACT_APP_API_URL=https://your-api-domain.com
```

### Update API URLs
In components, replace:
```typescript
'http://localhost:5000/api/...'
```

With:
```typescript
`${process.env.REACT_APP_API_URL}/api/...`
```

---

## 📚 File Locations

```
charity-dao-frontend/
├─ src/
│  ├─ components/
│  │  ├─ SpecialDonationsList.tsx
│  │  ├─ SpecialDonationDetail.tsx
│  │  ├─ SpecialDonationForm.tsx
│  │  ├─ DonationFeed.tsx
│  │  └─ FundFlowChart.tsx
│  ├─ App.tsx
│  └─ index.tsx
└─ package.json
```

---

## ✅ Checklist

- [x] Components created
- [x] Styling complete
- [x] Real-time updates implemented
- [x] M-Pesa integration ready
- [x] Responsive design done
- [x] Error handling added
- [x] Loading states added
- [x] Documentation complete
- [ ] Backend routes to create
- [ ] Smart contract to deploy
- [ ] Integration testing
- [ ] Production deployment

---

## 🎉 Summary

You now have a **complete, production-ready frontend** for special donations with:

✅ 5 React components
✅ Real-time updates
✅ Beautiful UI
✅ M-Pesa integration
✅ Blockchain verification
✅ Complete transparency
✅ Responsive design
✅ Error handling

**Next Steps:**
1. Create backend routes
2. Deploy TransparencyLedger contract
3. Run integration tests
4. Deploy to production

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review component documentation
3. Check browser console for errors
4. Verify API endpoints are working

---

**Status: 🟢 FRONTEND COMPLETE - READY FOR BACKEND INTEGRATION**

Let's build the backend next! 🚀

