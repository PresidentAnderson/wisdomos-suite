# WisdomOS 2026 — Client Onboarding Guide

## Welcome to WisdomOS

Congratulations on choosing WisdomOS for your organization's wellness and development needs. This guide will walk you through the complete onboarding process for Team, Business, and Enterprise tier deployments.

## Onboarding Timeline

### Team Tier (10-25 users): 2-3 weeks
### Business Tier (50-250 users): 4-6 weeks
### Enterprise Tier (500+ users): 8-12 weeks

## Phase 1: Kickoff & Planning (Week 1)

### Kickoff Meeting

**Attendees:**
- Your team: HR lead, IT contact, executive sponsor
- WisdomOS team: Account manager, implementation specialist, solutions architect

**Agenda:**
- Review implementation timeline
- Clarify success metrics and goals
- Technical requirements review
- User segmentation discussion
- Training schedule planning

**Deliverables:**
- Project plan with milestones
- Roles & responsibilities matrix
- Success criteria document

### Technical Setup Checklist

**IT Requirements:**
- [ ] Domain verification (for SSO)
- [ ] Email whitelist (support@wisdomos.com, noreply@wisdomos.com)
- [ ] Network access confirmation (no firewall blocks)
- [ ] SSO configuration (SAML/OAuth details if applicable)
- [ ] SCIM endpoint setup (Business/Enterprise tiers)

**Admin Setup:**
- [ ] Designated admin users (2-3 recommended)
- [ ] Organizational structure mapping
- [ ] User import file preparation (CSV format)
- [ ] Life area customization decisions

## Phase 2: Configuration (Week 2-3)

### Step 1: Admin Account Setup

Your implementation specialist will:
1. Create organization account
2. Configure edition settings
3. Set up admin users with appropriate permissions
4. Configure SSO (if applicable)

**Admin Portal Access:**
- URL: admin.wisdomos.com/[your-org]
- Initial login credentials sent via encrypted email
- Require password change on first login

### Step 2: User Import

**Two Options:**

**Option A: CSV Import (Recommended)**
Prepare CSV file with columns:
- email (required)
- first_name (required)
- last_name (required)
- department (optional)
- role (optional)
- manager_email (optional)

**Option B: SCIM Provisioning (Enterprise tier)**
- Automated sync with your identity provider
- Real-time user creation/deactivation
- Group/team mapping

**Import Process:**
1. Upload CSV via admin portal
2. Review user list (confirm accuracy)
3. Send invitation emails (staggered or all at once)
4. Monitor activation rate

### Step 3: Customize Life Areas

**Default Configuration:**
WisdomOS includes 13 pre-configured life areas:
- Health & Vitality
- Intimate Partnership
- Career & Purpose
- Financial Prosperity
- Family & Friends
- Personal Growth
- Community & Contribution
- Recreation & Adventure
- Spiritual Practice
- Physical Environment
- Leadership & Impact
- Creative Expression
- Rest & Renewal

**Customization Options (Business/Enterprise tiers):**
- Add organization-specific life areas
- Customize dimension keys
- Create industry-specific coach contexts
- Configure default signal prompts

**Recommended Customizations by Industry:**

**Tech Companies:**
- Add "Innovation & Learning" area
- Emphasize "Leadership & Impact"
- Custom dimensions: product_impact, code_quality, collaboration

**Healthcare:**
- Add "Patient Care" or "Provider Wellbeing" area
- Emphasize "Rest & Renewal" (burnout prevention)
- Custom dimensions: compassion_fatigue, work_life_balance, clinical_competence

**Education:**
- Add "Teaching Excellence" or "Student Success" area
- Emphasize "Personal Growth"
- Custom dimensions: classroom_energy, student_connection, curriculum_innovation

### Step 4: Configure Policies & Settings

**Settings to Configure:**

**User Permissions:**
- Can users create custom life areas? (Yes/No)
- Can users share assessments with managers? (Yes/No)
- Can users export their data? (Yes/No)

**Privacy & Data:**
- Data retention period (default: unlimited)
- Anonymization for org-level reports (recommended: Yes)
- Manager visibility settings (default: none, optional: aggregated only)

**Notifications:**
- Daily signal reminders (default: 8 PM user timezone)
- Weekly summary emails (default: Sunday 6 PM)
- Monthly fulfillment reports (default: 1st of month)

**Branding (Pro/Business/Enterprise):**
- Upload company logo
- Set brand colors
- Customize email templates
- Custom domain (Enterprise tier)

## Phase 3: Admin Training (Week 3-4)

### Admin Certification (2-hour session)

**Modules:**
1. Admin Portal Navigation (20 min)
2. User Management & Permissions (30 min)
3. Organization Dashboard & Analytics (30 min)
4. Troubleshooting & Support (20 min)
5. Best Practices & Tips (20 min)

**Format:**
- Live virtual training (Zoom)
- Recorded for future reference
- Hands-on exercises in sandbox environment
- Q&A session

**Post-Training:**
- Admin certification badge
- Access to admin knowledge base
- Direct Slack channel with support team

## Phase 4: User Launch (Week 4-5)

### Pre-Launch Preparation

**Communication Plan:**
- Announcement email from executive sponsor
- Teaser campaign (3-5 days before launch)
- Launch day email with instructions
- Follow-up reminders (day 3, day 7)

**Sample Announcement Email:**
```
Subject: Introducing WisdomOS - Your Personal Development Partner

Hi [Team],

We're excited to announce the launch of WisdomOS, a comprehensive personal
development platform now available to all [Company] employees.

WisdomOS helps you:
• Track fulfillment across all areas of life (health, relationships, career, etc.)
• Get personalized coaching from AI coaches available 24/7
• Measure relationship capability with WE2 assessments
• Set goals and track progress over time

Getting Started:
1. Check your email for invitation (arrives [Date])
2. Create your account (takes 2 minutes)
3. Complete the 15-minute onboarding tutorial
4. Set up your first life area and talk to your coach

Questions? Join the launch webinar on [Date] or email wisdomos-support@[company].com

This is part of our commitment to your holistic wellbeing and growth.

[Executive Sponsor Name]
[Title]
```

### Launch Week Activities

**Day 1: Soft Launch**
- Invitations sent to pilot group (20-30 early adopters)
- Monitor sign-up and activation rates
- Collect initial feedback
- Fix any technical issues

**Day 3: Main Launch**
- Invitations sent to all users
- Kick-off webinar (optional, recommended)
- Support team on high alert
- Monitor activation rates

**Day 5: Follow-up**
- Reminder email to non-activated users
- Quick wins showcase (early user testimonials)
- Tips & tricks email

**Day 7: Week 1 Wrap-up**
- Activation rate report
- Top questions FAQ circulated
- Success stories highlighted

### Launch Webinar (Optional but Recommended)

**Format:** 45-minute live session
**Timing:** Lunch hour (12-12:45 PM) or after work (4-4:45 PM)
**Recording:** Yes, shared with all employees

**Agenda:**
- Welcome & why we chose WisdomOS (5 min)
- Platform overview & demo (20 min)
- Getting started walkthrough (10 min)
- Q&A (10 min)

## Phase 5: Adoption & Support (Ongoing)

### Week 2-4: Drive Adoption

**Tactics:**
- Daily tips emails (WisdomOS features)
- Manager encouragement (if appropriate)
- Office hours (live Q&A sessions)
- Early adopter spotlights
- Incentive program (optional)

**Target Metrics:**
- 60% activation (created account) by week 2
- 40% engagement (logged signals) by week 4
- 25% active users (3+ sessions/week) by week 4

### Month 2-3: Deepen Engagement

**Activities:**
- WE2 assessment workshop (introduce relationship tracking)
- Advanced features webinar (custom coaches, integrations)
- User success stories
- Monthly fulfillment challenge

**Target Metrics:**
- 70% activation by month 2
- 50% engagement by month 3
- 30% power users (daily usage) by month 3

### Ongoing Support

**Support Channels:**

**Email Support:**
- Response time: <4 hours (business hours)
- Available: support@wisdomos.com

**Live Chat (Business/Enterprise):**
- Available: 9 AM - 6 PM ET, Monday-Friday
- Access: In-app chat widget

**Phone Support (Enterprise):**
- Available: 24/7 for critical issues
- Number: Provided to admin team

**Dedicated Slack Channel (Enterprise):**
- Direct access to support team
- Response time: <1 hour for urgent issues

**Resources:**
- Help center: help.wisdomos.com
- Video tutorials: wisdomos.com/tutorials
- Community forum: community.wisdomos.com

## Success Metrics & Reporting

### Monthly Reports (Delivered via Admin Portal)

**User Metrics:**
- Total users, active users, activation rate
- Engagement frequency (daily, weekly, monthly actives)
- Feature adoption rates

**Fulfillment Metrics:**
- Average fulfillment scores across org (anonymized)
- Top life areas (most tracked)
- Signal completion rates
- Coach conversation frequency

**Trend Analysis:**
- Month-over-month changes
- Departmental comparisons (if opted in)
- Correlation insights

### Quarterly Business Reviews (Business/Enterprise tiers)

**Attendees:** Your leadership, WisdomOS account team

**Agenda:**
- Review success metrics vs goals
- User feedback themes
- Feature requests discussion
- Optimization recommendations
- Roadmap preview (upcoming features)

**Deliverables:**
- QBR slide deck
- Action items & next steps
- Updated success plan

## Best Practices for Success

### Do's

✅ **Executive sponsorship:** Have a visible champion
✅ **Communicate value:** Explain why this matters
✅ **Start small:** Pilot with engaged group first
✅ **Celebrate wins:** Share success stories
✅ **Provide support:** Make help easily accessible
✅ **Lead by example:** Have leaders use the platform
✅ **Be patient:** Adoption takes 2-3 months

### Don'ts

❌ **Don't mandate usage:** Creates resentment
❌ **Don't track individuals:** Respect privacy
❌ **Don't rush launch:** Proper setup takes time
❌ **Don't ignore feedback:** Users will disengage
❌ **Don't under-resource:** Allocate admin time
❌ **Don't set unrealistic goals:** Aim for steady growth

## Troubleshooting Common Issues

### Low Activation Rate (<40% week 2)

**Causes:**
- Invitations went to spam
- Unclear value proposition
- Technical issues (SSO not working)

**Solutions:**
- Resend invitations from different sender
- Host live demo to show value
- Test SSO with users, fix issues
- Manager outreach to their teams

### High Churn (>15% month 2)

**Causes:**
- Onboarding too complex
- Not seeing value quickly
- Technical friction

**Solutions:**
- Simplify first-time experience
- Quick wins email campaign
- One-on-one support for churned users
- Identify and fix technical issues

### Low Engagement (<30% weekly actives)

**Causes:**
- No habit formation
- Forget to use it
- Unclear how to use it

**Solutions:**
- Daily reminder emails
- Calendar integration (block time)
- Simplified workflows
- Weekly challenges

## Next Steps

After completing this onboarding guide:

1. **Schedule kickoff meeting** with your account manager
2. **Complete technical setup checklist** with IT team
3. **Prepare user import file** (CSV or SCIM)
4. **Plan your launch communications** (announcement, webinar, etc.)
5. **Set your success metrics** (activation, engagement, fulfillment goals)

**Questions?** Contact your account manager or email onboarding@wisdomos.com

---

**We're excited to partner with you on this journey!**

**WisdomOS Customer Success Team**

**Last Updated:** October 29, 2025
