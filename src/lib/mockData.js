// Mock/fallback data — used when API hasn't loaded yet
const MATTERS = [
  { id: 1, ref: "CB-2024-0042", title: "Johnson Divorce Proceeding", client: "Sarah Johnson", clientEmail: "sarah.johnson@email.com", status: "active", practice: "Family Law", attorney: "Alex Rivera", unread: 3, daysOpen: 42, nextDeadline: "Mar 15 — Financial Documents", urgency: "high", retainer: 5000, paid: 2800, nextStep: "Upload the requested financial documents so your attorney can complete the asset disclosure filing.", nextStepInternal: "Chase missing bank statements; file 12/A by March 20 or we lose the date." },
  { id: 2, ref: "CB-2024-0039", title: "Martinez Estate Planning", client: "Carlos Martinez", clientEmail: "c.martinez@email.com", status: "pending_client", practice: "Estate Planning", attorney: "Alex Rivera", unread: 0, daysOpen: 18, nextDeadline: "Mar 20 — Signature Needed", urgency: "medium", retainer: 3500, paid: 3500, nextStep: "Please sign the trust documents we sent. Everything is ready — we just need your signature.", nextStepInternal: "Docusign sent March 8. Follow up if not signed by March 14." },
  { id: 3, ref: "CB-2024-0031", title: "Chen v. Realty Group", client: "Amy Chen", clientEmail: "amy.chen@email.com", status: "active", practice: "Litigation", attorney: "Alex Rivera", unread: 2, daysOpen: 67, nextDeadline: "Apr 3 — Court Date", urgency: "high", retainer: 12000, paid: 8200, nextStep: "Your court date is confirmed for April 3 at 9:00 AM in Courtroom 4. Please arrive 30 minutes early.", nextStepInternal: "Prepare deposition summary and exhibits. Motion in limine deadline March 28." },
  { id: 4, ref: "CB-2024-0044", title: "Rodriguez Personal Injury", client: "Manuel Rodriguez", clientEmail: "m.rodriguez@email.com", status: "active", practice: "Personal Injury", attorney: "Alex Rivera", unread: 0, daysOpen: 12, nextDeadline: null, urgency: "low", retainer: 0, paid: 0, nextStep: "We are reviewing the medical records you provided. We will be in touch within 5 business days.", nextStepInternal: "Medical records received. Need to review and assess liability. Invoice overdue." },
  { id: 5, ref: "CB-2024-0047", title: "Park Business Acquisition", client: "Ji-soo Park", clientEmail: "jisoo.park@email.com", status: "intake", practice: "Corporate", attorney: "Alex Rivera", unread: 1, daysOpen: 2, nextDeadline: null, urgency: "medium", retainer: 0, paid: 0, nextStep: "We have received your inquiry and will be in touch within 1 business day to discuss your matter.", nextStepInternal: "New inquiry — needs conflict check before opening. Practice area: M&A." },
];

const MESSAGES = {
  1: [
    { id: 1, sender: "client", name: "Sarah Johnson", body: "Hi, just wanted to check in — is there any update on when the financial disclosure needs to be filed? I'm a bit worried about the deadline.", time: "9:14 AM", read: true, internal: false },
    { id: 2, sender: "attorney", name: "Alex Rivera", body: "Hi Sarah, yes — we have a deadline of March 20 to file. I need to receive your bank statements and last two years of tax returns before I can complete the form. I sent you a document request last week — were you able to find those?", time: "10:32 AM", read: true, internal: false, aiGenerated: false },
    { id: 3, sender: "client", name: "Sarah Johnson", body: "Oh yes, I have them. I'll upload them tonight. Is there a specific format needed?", time: "11:05 AM", read: true, internal: false },
    { id: 4, sender: "staff", name: "Priya Patel (Paralegal)", body: "Note: Sarah called at 2pm — confirmed she'll upload by end of day.", time: "2:18 PM", read: true, internal: true },
    { id: 5, sender: "client", name: "Sarah Johnson", body: "I just tried to upload the bank statements but I'm getting an error. Can you help?", time: "8:47 PM", read: false, internal: false },
    { id: 6, sender: "client", name: "Sarah Johnson", body: "Never mind — it worked! I uploaded everything. Please let me know if you need anything else.", time: "9:02 PM", read: false, internal: false },
  ],
  3: [
    { id: 1, sender: "client", name: "Amy Chen", body: "Hello, I got a letter from opposing counsel today. It looks like they're requesting additional discovery. Is this normal?", time: "Yesterday, 3:22 PM", read: true, internal: false },
    { id: 2, sender: "attorney", name: "Alex Rivera", body: "Hi Amy, yes — this is a standard part of the litigation process. I've reviewed the letter and will respond on your behalf. No action required from you at this time.", time: "Yesterday, 5:01 PM", read: true, internal: false, aiGenerated: true },
    { id: 3, sender: "client", name: "Amy Chen", body: "Thank you. I just want to make sure we're on track for April 3rd.", time: "Today, 8:30 AM", read: false, internal: false },
  ],
};

const DOCUMENTS = {
  1: [
    { id: 1, name: "Bank Statements - Jan-Dec 2023.pdf", type: "Financial", size: "2.4 MB", uploaded: "Mar 10", by: "Sarah Johnson", aiLabel: "Financial Statement", confidence: 0.96, shared: true },
    { id: 2, name: "Tax Return 2022.pdf", type: "Financial", size: "1.1 MB", uploaded: "Mar 10", by: "Sarah Johnson", aiLabel: "Tax Document", confidence: 0.98, shared: true },
    { id: 3, name: "Tax Return 2023.pdf", type: "Financial", size: "1.3 MB", uploaded: "Mar 10", by: "Sarah Johnson", aiLabel: "Tax Document", confidence: 0.98, shared: true },
    { id: 4, name: "Retainer Agreement - Johnson.pdf", type: "Contract", size: "0.4 MB", uploaded: "Feb 28", by: "Alex Rivera", aiLabel: "Retainer Agreement", confidence: 0.99, shared: true },
    { id: 5, name: "FL 150 Income Expense Declaration.docx", type: "Court Filing", size: "0.3 MB", uploaded: "Mar 5", by: "Alex Rivera", aiLabel: "Court Filing", confidence: 0.91, shared: false },
  ],
};

const DOC_REQUESTS = {
  1: [
    { id: 1, label: "Last 2 years of bank statements", done: true },
    { id: 2, label: "Last 2 years of tax returns", done: true },
    { id: 3, label: "Mortgage statement (most recent)", done: false },
    { id: 4, label: "Retirement account statements", done: false },
    { id: 5, label: "Any business ownership documents", done: false },
  ],
};

const INVOICES = [
  { id: 1, matterId: 1, number: "INV-2024-001", desc: "Initial retainer + consultation", amount: 2800, status: "paid", date: "Feb 28", due: "Mar 7" },
  { id: 2, matterId: 1, number: "INV-2024-008", desc: "Legal services — February", amount: 1400, status: "overdue", date: "Mar 1", due: "Mar 15" },
  { id: 3, matterId: 3, number: "INV-2024-004", desc: "Discovery phase — January", amount: 3800, status: "paid", date: "Feb 15", due: "Feb 22" },
  { id: 4, matterId: 3, number: "INV-2024-009", desc: "Deposition preparation", amount: 2200, status: "sent", date: "Mar 8", due: "Mar 22" },
  { id: 5, matterId: 4, number: "INV-2024-011", desc: "Initial case evaluation", amount: 750, status: "overdue", date: "Feb 20", due: "Mar 5" },
];

const TIMELINE = {
  1: [
    { id: 1, date: "Mar 10", type: "document", icon: "file", color: "blue", text: "Client uploaded 3 financial documents (bank statements, 2x tax returns)" },
    { id: 2, date: "Mar 8", type: "update", icon: "zap", color: "purple", text: "Case update sent to client: Asset disclosure deadline confirmed for March 20" },
    { id: 3, date: "Mar 5", type: "document", icon: "file", color: "blue", text: "Document request sent to client: bank statements, tax returns, mortgage statement" },
    { id: 4, date: "Mar 1", type: "payment", icon: "dollar", color: "green", text: "Invoice INV-2024-001 paid — $2,800 received" },
    { id: 5, date: "Feb 28", type: "message", icon: "message", color: "gray", text: "Retainer agreement signed and executed" },
    { id: 6, date: "Feb 27", type: "intake", icon: "users", color: "teal", text: "Matter opened — Client portal invitation sent to Sarah Johnson" },
  ],
};

const AI_QUEUE = [
  { id: 1, matterId: 1, matterTitle: "Johnson Divorce", agent: "PlainLanguageAgent", type: "Case Update", preview: "Your attorney has reviewed the financial documents you uploaded. The asset disclosure form is now being prepared and will be filed with the court before the March 20 deadline. No action is needed from you at this time.", generated: "10 min ago" },
  { id: 2, matterId: 3, matterTitle: "Chen v. Realty", agent: "MessageDraftAgent", type: "Message Draft", preview: "Hi Amy, your court date of April 3rd is confirmed and we are fully prepared. I'll send you a preparation guide this week covering what to expect on the day and how to present yourself effectively in court.", generated: "25 min ago" },
];

const DIGEST_TEXT = `Good morning, Alex. Here's your briefing for today, Tuesday March 3rd.

You have **5 unread client messages** across 2 matters. Sarah Johnson (Johnson Divorce) sent 2 messages last night — she successfully uploaded her financial documents.

**Attention needed:**
• Johnson Divorce has 3 outstanding document requests (mortgage, retirement, business docs) — deadline in 12 days
• Chen v. Realty court date is 31 days out — motion in limine deadline is March 28
• Rodriguez matter has an overdue invoice of $750 (28 days past due)
• Park Business Acquisition needs conflict check before matter can open

**2 AI-generated items** are waiting for your approval.`;

// ─── HELPER COMPONENTS ────────────────────────────────────────────────────────

export { MATTERS, MESSAGES, DOCUMENTS, DOC_REQUESTS, INVOICES, TIMELINE, AI_QUEUE, DIGEST_TEXT };
