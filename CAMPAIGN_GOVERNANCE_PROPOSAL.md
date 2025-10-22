# 🏛️ Campaign Governance & Authority System

## 📋 OVERVIEW

A **multi-tier governance system** for creating and approving special donation campaigns, ensuring transparency, security, and community trust.

---

## 🎯 THREE-TIER AUTHORITY MODEL

### **TIER 1: EMERGENCY AUTHORITY** ⚡
**For: Pre-approved organizations & government agencies**

**Who Can Create:**
- Registered NGOs (verified)
- Government agencies (health, disaster management)
- Verified humanitarian organizations
- Red Cross/Red Crescent

**Process:**
1. Organization applies for "Emergency Authority" status
2. Admin verifies organization credentials
3. Organization gets approved status
4. Can create campaigns immediately (auto-verified)
5. Campaigns go live instantly

**Requirements:**
- Valid registration documents
- Tax ID/NGO registration
- Bank account verification
- Insurance/liability coverage

**Advantages:**
- ✅ Fast response to emergencies
- ✅ Trusted organizations
- ✅ Reduced bureaucracy
- ✅ Immediate impact

**Example:** Red Cross creating disaster relief campaign

---

### **TIER 2: COMMUNITY AUTHORITY** 👥
**For: Community leaders & verified individuals**

**Who Can Create:**
- Community leaders (chiefs, elders)
- Verified individuals (KYC passed)
- Local organizations
- Community groups

**Process:**
1. Individual/leader creates campaign
2. Campaign enters "PENDING_APPROVAL" status
3. Community votes (24-48 hours)
4. If approved by community → Admin final review
5. Admin approves → Campaign goes live

**Requirements:**
- KYC verification (ID, phone, address)
- Community endorsement (minimum votes)
- Beneficiary verification documents
- Story/evidence documentation

**Voting Rules:**
- Minimum 10 community members vote
- 70% approval threshold
- Voting period: 24-48 hours
- Transparent voting record

**Advantages:**
- ✅ Democratic process
- ✅ Community validation
- ✅ Prevents fraud
- ✅ Builds trust

**Example:** Village chief creating campaign for school fees

---

### **TIER 3: ADMIN AUTHORITY** 👨‍💼
**For: Platform admins & owners**

**Who Can Create:**
- Platform owner
- Designated admins
- Governance committee

**Process:**
1. Admin creates campaign directly
2. Campaign goes live immediately
3. Full control over all parameters
4. Can override community decisions

**Requirements:**
- Admin credentials
- Internal verification
- Audit trail logging

**Advantages:**
- ✅ Full control
- ✅ Special cases
- ✅ Override capability
- ✅ Emergency override

**Example:** Admin creating campaign for verified case

---

## 📊 CAMPAIGN STATUS FLOW

```
DRAFT
  ↓
PENDING_APPROVAL (for Tier 2 & 3)
  ↓
COMMUNITY_VOTING (for Tier 2 only)
  ↓
ADMIN_REVIEW
  ↓
APPROVED → ACTIVE
  ↓
COMPLETED/CLOSED
```

---

## 🔐 VERIFICATION REQUIREMENTS

### **For All Campaigns:**
- ✅ Beneficiary identity verification
- ✅ Story/evidence documentation
- ✅ Target amount justification
- ✅ Deadline reasonableness
- ✅ Contact information

### **For Tier 1 (Emergency):**
- ✅ Organization credentials
- ✅ Official letterhead
- ✅ Authorized signatory

### **For Tier 2 (Community):**
- ✅ KYC documents
- ✅ Community endorsement
- ✅ Local verification
- ✅ Beneficiary relationship proof

### **For Tier 3 (Admin):**
- ✅ Internal verification
- ✅ Admin approval
- ✅ Audit trail

---

## 💾 DATABASE SCHEMA

```javascript
Campaign {
  id: number,
  title: string,
  description: string,
  beneficiaryName: string,
  beneficiaryPhone: string,
  beneficiaryIdHash: string,
  
  // Authority & Status
  authorityTier: 'emergency' | 'community' | 'admin',
  status: 'draft' | 'pending' | 'voting' | 'approved' | 'active' | 'completed' | 'rejected',
  createdBy: address,
  createdByType: 'organization' | 'individual' | 'admin',
  
  // Verification
  verified: boolean,
  verifiedBy: address,
  verifiedAt: timestamp,
  verificationDocuments: [ipfsHash],
  
  // Community Voting (Tier 2)
  votingStarted: timestamp,
  votingEnded: timestamp,
  votesFor: number,
  votesAgainst: number,
  voters: [address],
  
  // Financial
  targetAmount: number,
  currentAmount: number,
  totalDonors: number,
  
  // Timeline
  deadline: timestamp,
  createdAt: timestamp,
  closedAt: timestamp,
  
  // Transparency
  updates: [Update],
  donations: [Donation],
  auditTrail: [AuditLog]
}
```

---

## 🔄 WORKFLOW EXAMPLES

### **Example 1: Emergency Authority (Red Cross)**
```
1. Red Cross logs in
2. Creates campaign: "Flood Relief - Kisumu"
3. Fills form with details
4. Uploads verification documents
5. Clicks "Create Campaign"
6. ✅ Campaign goes LIVE immediately
7. Donations start flowing
8. Red Cross posts updates
```

### **Example 2: Community Authority (Village Chief)**
```
1. Chief creates campaign: "School Fees for Orphans"
2. Fills form with beneficiary details
3. Uploads ID, school letter, etc.
4. Clicks "Submit for Approval"
5. Campaign enters PENDING_APPROVAL
6. Community members vote (24 hours)
7. 75% vote YES
8. Admin reviews and approves
9. ✅ Campaign goes LIVE
10. Donations start
```

### **Example 3: Admin Authority (Platform Owner)**
```
1. Admin logs in
2. Creates campaign: "Verified Emergency Case"
3. Fills all details
4. Clicks "Create Campaign (Admin)"
5. ✅ Campaign goes LIVE immediately
6. Full control over all aspects
```

---

## 🛡️ FRAUD PREVENTION

### **Checks & Balances:**
- ✅ KYC verification for all creators
- ✅ Community voting for Tier 2
- ✅ Admin review for all campaigns
- ✅ Beneficiary verification
- ✅ Document verification
- ✅ Audit trail for all actions
- ✅ Blockchain recording
- ✅ Regular audits

### **Red Flags:**
- ❌ Unrealistic target amounts
- ❌ Suspicious beneficiary info
- ❌ Missing documentation
- ❌ Community rejection
- ❌ Duplicate campaigns
- ❌ Suspicious creator history

---

## 📱 FRONTEND COMPONENTS NEEDED

1. **Campaign Creation Form** (different for each tier)
2. **Community Voting Interface**
3. **Admin Dashboard** (approve/reject campaigns)
4. **Verification Document Upload**
5. **Campaign Status Tracker**
6. **Audit Trail Viewer**

---

## 🚀 IMPLEMENTATION PHASES

### **Phase 1: Admin Authority** (Week 1)
- Admin can create campaigns
- Basic verification
- Campaign management

### **Phase 2: Emergency Authority** (Week 2)
- Organization registration
- Pre-approval system
- Auto-verification

### **Phase 3: Community Authority** (Week 3)
- Community voting system
- KYC verification
- Democratic approval

### **Phase 4: Advanced Features** (Week 4)
- Audit trails
- Advanced analytics
- Fraud detection

---

## ✅ BENEFITS

✅ **Transparency** - All actions recorded on blockchain
✅ **Security** - Multiple verification layers
✅ **Speed** - Emergency campaigns go live instantly
✅ **Trust** - Community validation
✅ **Accountability** - Audit trails
✅ **Flexibility** - Multiple authority levels
✅ **Scalability** - Can handle growth
✅ **Compliance** - Meets regulatory requirements

---

## 🎯 RECOMMENDATION

**Start with Tier 3 (Admin Authority)** for MVP, then add:
1. Tier 1 (Emergency) - for partner organizations
2. Tier 2 (Community) - for democratic participation

This gives you **immediate control** while building toward **community governance**.

---

**Ready to implement this system?** Let me know which tier you want to start with! 🚀

