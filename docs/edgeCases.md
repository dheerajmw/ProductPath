# ProductPath — Edge Cases

Edge cases derived from [phasewise architecture](./phasewiseArchitecture.md) and [problem statement](./problemStatenment.md). Use for product rules, API design, QA, and acceptance criteria.

## How to read this document

| Column | Meaning |
|--------|---------|
| **ID** | Stable reference (`P1-01`, `X-01`, etc.) |
| **Scenario** | What can go wrong or behave unusually |
| **Expected behavior** | What the system should do |
| **Priority** | `P0` = must handle for MVP trust/safety; `P1` = should handle for MVP; `P2` = post-MVP or nice-to-have |

**Actors:** Candidate (C), Recruiter (R), Reviewer (Rev), Admin (A), System (S)

---

## Cross-cutting (all phases)

| ID | Scenario | Expected behavior | Priority |
|----|----------|-------------------|----------|
| X-01 | User signs up with email already registered | Block duplicate signup; offer password reset / login link | P0 |
| X-02 | User verifies email, then changes email before next login | Require re-verification on new email; invalidate old sessions optionally | P0 |
| X-03 | Same person creates both candidate and recruiter accounts | Allow if policy permits; clearly separate profiles; no shared verification state | P1 |
| X-04 | Account deleted or suspended mid-flow (assessment in progress, project under review) | Persist in-flight artifacts per retention policy; block new actions; show status on reactivation | P0 |
| X-05 | User loses network during multi-step flow | Resume from last saved step; no duplicate charges of attempts where applicable | P0 |
| X-06 | Concurrent sessions (two browsers) updating same profile | Last-write-wins or optimistic locking with conflict message on critical fields | P1 |
| X-07 | Role or roadmap content updated while user is mid-module | User stays on version they started OR migrate with notice; progress mapping defined | P1 |
| X-08 | Platform maintenance during timed assessment | Pause timer or invalidate attempt with free retake; log incident | P0 |
| X-09 | GDPR / data export / delete request | Export learner + assessment + project data; anonymize marketplace presence; honor delete where legal | P0 |
| X-10 | User under minimum age or restricted region | Block signup or limit marketplace per legal rules | P0 |
| X-11 | Accessibility: screen reader, keyboard-only, no video | All critical flows work without mouse/video-only content | P1 |
| X-12 | Extremely long input (bio, project description, post body) | Enforce max length; sanitize; reject or truncate with warning | P0 |
| X-13 | XSS / malicious links in free text (community, feedback) | Sanitize display; optional link warning; report flow | P0 |
| X-14 | Clock skew / user changes device timezone | Store UTC timestamps; assessment timers server-side | P0 |

---

## Phase 1: Learning foundation

### Authentication & onboarding

| ID | Scenario | Expected behavior | Priority |
|----|----------|-------------------|----------|
| P1-01 | OAuth provider returns email different from typed email | Use provider-verified email; show mismatch notice if linked manually | P1 |
| P1-02 | OAuth account already linked to another ProductPath user | Block link; suggest login to existing account | P0 |
| P1-03 | Magic link / reset token expired or reused | Single-use tokens; clear error; issue new link | P0 |
| P1-04 | Brute-force login attempts | Rate limit; CAPTCHA or lockout after threshold | P0 |
| P1-05 | User completes signup but never selects a role | Prompt on every visit; allow browse-only mode if defined | P1 |

### Role selection

| ID | Scenario | Expected behavior | Priority |
|----|----------|-------------------|----------|
| P1-06 | User wants to change product role after starting roadmap | Allow switch with warning: progress may not transfer; archive or map progress per rules | P0 |
| P1-07 | User selects role, then admin deprecates that role | Existing users retain access; new users cannot select; migration path documented | P1 |
| P1-08 | User has progress in multiple roles (if multi-role allowed later) | Separate roadmaps and progress per role; assessments tied to active role | P2 |

### Learning roadmaps & modules

| ID | Scenario | Expected behavior | Priority |
|----|----------|-------------------|----------|
| P1-09 | Module marked complete without viewing required resources | Enforce completion criteria (min time, checklist, or quiz gate) | P1 |
| P1-10 | External resource link broken or returns 404 | Show stale link warning; allow report; admin can replace URL | P1 |
| P1-11 | User completes modules out of order | Allow if roadmap is non-linear; block if prerequisites defined | P1 |
| P1-12 | Module content updated after user marked complete | Optionally flag “content updated”; do not auto-revoke completion | P2 |
| P1-13 | Progress shows 100% but assessment gate not met | Distinguish “learning progress” vs “readiness”; do not imply hiring readiness | P0 |
| P1-14 | User idles on module for days | No false completion; session may expire | P1 |

### Resource library

| ID | Scenario | Expected behavior | Priority |
|----|----------|-------------------|----------|
| P1-15 | Duplicate resources across modules | Deduplicate in UI or show “already viewed” | P2 |
| P1-16 | Large file download fails mid-way | Resumable download or retry; do not mark resource consumed | P1 |
| P1-17 | Copyright / licensed content expires | Hide resource; notify affected users in active roadmaps | P1 |

### Progress tracking

| ID | Scenario | Expected behavior | Priority |
|----|----------|-------------------|----------|
| P1-18 | Progress desync (client says complete, server disagrees) | Server is source of truth; refresh UI from API | P0 |
| P1-19 | User resets account or admin resets progress | Confirm dialog; audit log; cascade rules for assessments/projects | P1 |

---

## Phase 2: Skill assessment

### Assessment hub & access

| ID | Scenario | Expected behavior | Priority |
|----|----------|-------------------|----------|
| P2-01 | User attempts assessment before completing minimum learning | Block or warn per product rules; show prerequisites | P1 |
| P2-02 | User opens assessment hub with no role selected | Redirect to role selection | P0 |
| P2-03 | Question bank empty for role | Block start; alert admin; user sees maintenance message | P0 |

### During assessment

| ID | Scenario | Expected behavior | Priority |
|----|----------|-------------------|----------|
| P2-04 | Browser tab closed mid-assessment | Attempt remains `in_progress` until timeout; resume if allowed | P0 |
| P2-05 | User refreshes page during timed section | Timer continues server-side; restore current question | P0 |
| P2-06 | User switches tabs / copy-paste detected (if proctoring) | Warn, flag attempt, or invalidate per policy | P1 |
| P2-07 | All questions answered but user does not submit | Auto-submit on timer expiry; remind before leaving | P0 |
| P2-08 | Partial save fails (API error) | Retry with backoff; do not lose answers already saved | P0 |
| P2-09 | Question has no correct answer configured (data bug) | Skip question; log error; exclude from score or fail safe | P0 |
| P2-10 | User answers same question twice due to double-click | Idempotent submit per question | P1 |

### Scoring & results

| ID | Scenario | Expected behavior | Priority |
|----|----------|-------------------|----------|
| P2-11 | Score exactly on threshold boundary | Define inclusive/exclusive rule in config; apply consistently | P0 |
| P2-12 | Role-specific section missing for role | Fail assessment gracefully; admin fix; free retake | P0 |
| P2-13 | User disputes score | Show breakdown by skill; no manual edit by user; support ticket path | P1 |
| P2-14 | Retake policy: how soon, how many attempts | Enforce cooldown and max attempts; show next available date | P0 |
| P2-15 | User retakes and scores lower | Latest attempt rules documented (best vs latest vs average) | P0 |
| P2-16 | Assessment version changes between attempts | Score against version taken; store version id on result | P0 |

### Gap analysis & history

| ID | Scenario | Expected behavior | Priority |
|----|----------|-------------------|----------|
| P2-17 | All skills above threshold (no gaps) | Recommend projects or advanced modules; clear “no gaps” state | P1 |
| P2-18 | User never takes assessment but browses recommendations | Show “complete assessment first” | P0 |
| P2-19 | History shows superseded attempts | Label active vs archived; recruiters see policy-defined view | P1 |

---

## Phase 3: Skill development

| ID | Scenario | Expected behavior | Priority |
|----|----------|-------------------|----------|
| P3-01 | Recommendations reference deleted modules | Filter invalid items; regenerate recommendations | P0 |
| P3-02 | User completes recommended module but gap unchanged | Re-assessment required to update gap analysis | P0 |
| P3-03 | User skips straight to projects without closing gaps | Allow submission but verification may fail; surface requirements | P0 |
| P3-04 | Recommendations empty (edge case: no content for skill) | Show admin alert internally; user sees “coming soon” | P1 |
| P3-05 | User completes all recommended modules twice | No infinite loop; suggest assessment retake or projects | P1 |
| P3-06 | Roadmap navigation: user on wrong role’s roadmap | Scope all URLs and APIs by `role_id` | P0 |
| P3-07 | Skill development tracking stale after new assessment | Refresh metrics on assessment completion event | P0 |

---

## Phase 4: Proof of work

### Project selection & submission

| ID | Scenario | Expected behavior | Priority |
|----|----------|-------------------|----------|
| P4-01 | User submits project for wrong role template | Reject or warn before submit | P0 |
| P4-02 | File too large or unsupported type | Validate client and server; clear limits in UI | P0 |
| P4-03 | Virus/malware in upload | Scan in pipeline; quarantine; reject with generic message | P0 |
| P4-04 | Submission with only link (Google Doc, Figma) | Validate URL reachable; optional auth for private links | P1 |
| P4-05 | Private link reviewer cannot access | Request resubmission or public view link; reviewer notes | P0 |
| P4-06 | User submits duplicate of another user’s work (plagiarism) | Reviewer/admin flag; strike policy; hide from profile if rejected | P0 |
| P4-07 | User submits empty or placeholder content | Reviewer rejects with feedback; does not count toward verification | P0 |
| P4-08 | Multiple simultaneous drafts of same project | One active submission per project type per user | P1 |
| P4-09 | User edits submission after sending for review | Lock submission when `under_review`; allow withdraw to draft if policy allows | P0 |

### Review workflow

| ID | Scenario | Expected behavior | Priority |
|----|----------|-------------------|----------|
| P4-10 | No reviewers available (queue backlog) | SLA message; escalate to admin; do not expire user’s place in queue unfairly | P1 |
| P4-11 | Reviewer conflict of interest (knows candidate) | Reassign reviewer; conflict declaration optional | P1 |
| P4-12 | Reviewer partially completes rubric | Cannot approve until required fields filled | P0 |
| P4-13 | Approved by mistake | Admin reversal workflow; audit trail; revert verification impact | P0 |
| P4-14 | Rejection without actionable feedback | Require minimum feedback length for rejection | P1 |
| P4-15 | Resubmission after rejection | Increment version; preserve history; cap resubmissions if needed | P0 |
| P4-16 | Review SLA exceeded | Notify user and ops; optional auto-escalation | P2 |

### Post-approval

| ID | Scenario | Expected behavior | Priority |
|----|----------|-------------------|----------|
| P4-17 | User deletes account with approved project on public profile | Remove from discovery; retain anonymized audit per legal | P0 |
| P4-18 | User wants to hide approved project from recruiters | Allow visibility toggle unless required for active verification | P1 |
| P4-19 | Template instructions updated after approval | Does not invalidate approval; optional “refresh project” prompt | P2 |

---

## Phase 5: Verification

### Eligibility & rules

| ID | Scenario | Expected behavior | Priority |
|----|----------|-------------------|----------|
| P5-01 | Assessment above threshold but no approved project | State remains below Interview ready; show checklist | P0 |
| P5-02 | Approved project but assessment below threshold | Same; do not grant marketplace access | P0 |
| P5-03 | Assessment passes then later expires (freshness) | Downgrade verification state; remove or dim marketplace badge; notify user | P0 |
| P5-04 | Only project approved, then project hidden/deleted | Recalculate eligibility; may revoke verification | P0 |
| P5-05 | Threshold changed retroactively | Grandfather existing verified users OR re-evaluate with notice and grace period | P0 |
| P5-06 | User in “Emerging talent” tries marketplace | Block discovery features; explain requirements | P0 |

### Verification states

| ID | Scenario | Expected behavior | Priority |
|----|----------|-------------------|----------|
| P5-07 | Ambiguous transition Learning → Emerging | Document criteria (e.g., partial assessment or module milestone) | P1 |
| P5-08 | User meets Interview ready but not “Verified product professional” | Show correct badge; filters use correct tier | P0 |
| P5-09 | User passes reassessment but project aged out | Require project refresh or re-approval per policy | P1 |
| P5-10 | Concurrent jobs: expiry job vs new assessment completion | Transactional state update; single source of truth | P0 |

### Badge & display

| ID | Scenario | Expected behavior | Priority |
|----|----------|-------------------|----------|
| P5-11 | User shares profile screenshot with forged badge | Public pages server-rendered badge; optional verify link | P2 |
| P5-12 | Expired badge still cached on CDN | Short TTL on profile; `verified_until` in API | P1 |

---

## Phase 6: Talent marketplace

### Recruiter verification & access

| ID | Scenario | Expected behavior | Priority |
|----|----------|-------------------|----------|
| P6-01 | Recruiter signup with personal email only | Require company verification or manual approval | P0 |
| P6-02 | Fake recruiter / staffing spam | Verification queue; rate limits on interest; report/block | P0 |
| P6-03 | Recruiter verified then leaves company | Re-verify domain; suspend search if failed | P1 |
| P6-04 | Recruiter account shared across team | Seat-based access or org model (post-MVP); audit actions per user | P2 |

### Discovery & search

| ID | Scenario | Expected behavior | Priority |
|----|----------|-------------------|----------|
| P6-05 | Search with zero results | Empty state; suggest broadening filters | P1 |
| P6-06 | Search returns unverified candidate (data leak) | API only returns candidates meeting discovery tier | P0 |
| P6-07 | Candidate opts out of discovery while verified | Respect privacy flag; hidden from search | P0 |
| P6-08 | Stale assessment shown on profile | Show `assessed_on` and freshness warning to recruiter | P0 |
| P6-09 | Filter gaming (keyword stuffing in profile) | Rank on structured skills/scores, not free text only | P1 |

### Interest requests & connection

| ID | Scenario | Expected behavior | Priority |
|----|----------|-------------------|----------|
| P6-10 | Recruiter sends interest; candidate never responds | Expire request; recruiter notified; no contact leak | P0 |
| P6-11 | Candidate accepts then blocks recruiter | Contact already shared—document policy; block future messages | P1 |
| P6-12 | Candidate declines interest | Notify recruiter without exposing reason unless candidate adds one | P0 |
| P6-13 | Duplicate interest from same recruiter | Idempotent or show existing thread | P1 |
| P6-14 | Recruiter spam: 100 interests in an hour | Rate limit per recruiter; flag account | P0 |
| P6-15 | Candidate at max open opportunities | Queue or reject new interest with message | P1 |
| P6-16 | Verification lapses after accept but before contact unlock | Policy: honor accept OR revoke unlock—define and implement | P0 |
| P6-17 | Wrong contact details displayed | Verified email/phone from profile; user can update with re-verify | P0 |

### Opportunities management

| ID | Scenario | Expected behavior | Priority |
|----|----------|-------------------|----------|
| P6-18 | Opportunity closed/filled but still listed | Mark closed; hide from candidate feed | P1 |
| P6-19 | Candidate applies to role that mismatches their ProductPath role | Warn recruiter; still allow if both parties agree | P2 |

---

## Phase 7: Community

| ID | Scenario | Expected behavior | Priority |
|----|----------|-------------------|----------|
| P7-01 | Post contains hate speech / harassment | Report; mod queue; hide; strike user | P0 |
| P7-02 | User deletes post with many comments | Soft-delete or cascade per policy; preserve mod audit | P1 |
| P7-03 | Comment thread nesting too deep | Max depth; flatten or collapse | P2 |
| P7-04 | Like spam / bot engagement | Rate limit; anomaly detection | P1 |
| P7-05 | Sharing unapproved project as if verified | Label “not verified”; link to official project record | P0 |
| P7-06 | Interview experience reveals identifiable employer without consent | Guidelines; redact option; report | P1 |
| P7-07 | User not verified posts hiring solicitation | Restrict or label; anti-spam rules | P1 |
| P7-08 | Cross-post same content repeatedly | Duplicate detection or cooldown | P1 |
| P7-09 | Blocked user views blocker’s public posts | Hide interactions both ways | P1 |
| P7-10 | Media fails moderation async after publish | Remove post; notify author | P0 |

---

## Lifecycle & cross-phase

### Candidate lifecycle

| ID | Scenario | Expected behavior | Priority |
|----|----------|-------------------|----------|
| L-01 | Skip learning → assessment only | Allow if product permits; gaps may be large | P1 |
| L-02 | Skip assessment → submit project | Allow submit; verification blocked | P0 |
| L-03 | Verify → lapse → still receiving recruiter interest | New interests blocked or show expired badge on accept | P0 |
| L-04 | User retrains in Phase 3 while marketplace active | Marketplace visibility follows verification rules continuously | P0 |
| L-05 | Long inactive user returns after 12 months | Onboarding refresh; reassessment prompt; stale badge handling | P1 |

### Recruiter lifecycle

| ID | Scenario | Expected behavior | Priority |
|----|----------|-------------------|----------|
| L-06 | Recruiter searches before verification complete | Block search; show verification status | P0 |
| L-07 | Recruiter bookmarks candidate who later loses verification | Show status change on bookmark | P1 |
| L-08 | Hire completed off-platform | Optional feedback loop; no automatic state change | P2 |

### Admin & operations

| ID | Scenario | Expected behavior | Priority |
|----|----------|-------------------|----------|
| L-09 | Manual override of verification | Admin role with audit log; reason required | P0 |
| L-10 | Bulk import of learning content breaks module order | Validation on publish; rollback | P1 |
| L-11 | Reviewer workforce strike / mass unassigned reviews | Re-queue submissions; extend SLA | P1 |

---

## Security, abuse & trust

| ID | Scenario | Expected behavior | Priority |
|----|----------|-------------------|----------|
| S-01 | Shared assessment answers leaked online | Rotate question subsets; rate limit retakes; anomaly detection | P1 |
| S-02 | Bot signups | CAPTCHA, email verify, device fingerprinting (proportionate) | P0 |
| S-03 | Candidate buys fake project approval | Multi-reviewer sampling; audit; revoke verification | P0 |
| S-04 | Recruiter scrapes entire candidate database | Pagination caps; ToS; technical rate limits | P0 |
| S-05 | SSRF via project URL submission | URL allowlist; no internal network fetch | P0 |
| S-06 | IDOR on project/submission IDs | AuthZ check on every resource | P0 |

---

## MVP boundary (explicitly out of scope — document anyway)

| ID | Scenario | Expected behavior | Priority |
|----|----------|-------------------|----------|
| M-01 | User expects AI mentor during learning | Show “not available”; link to resources | P2 |
| M-02 | User expects AI project review | Human review only; set expectations in UI | P1 |
| M-03 | User requests mock interview | Redirect to community or future waitlist | P2 |
| M-04 | User asks for resume export from platform | Manual profile sections only; no resume builder | P2 |

---

## Test matrix (quick reference)

| Phase | P0 count (approx.) | Critical domains |
|-------|-------------------|------------------|
| Cross-cutting | 8+ | Auth, safety, data |
| Phase 1 | 4+ | Role switch, progress truth |
| Phase 2 | 10+ | Timer, retakes, scoring |
| Phase 3 | 4+ | Recommendations vs reassessment |
| Phase 4 | 10+ | Review integrity, uploads |
| Phase 5 | 8+ | Eligibility, expiry |
| Phase 6 | 10+ | Trust, interest flow, privacy |
| Phase 7 | 4+ | Moderation, misrepresentation |
| Lifecycle / Security | 10+ | Cross-phase gates, IDOR |

---

## Resolved product decisions

Locked for MVP in [implementation plan — prerequisites](./implementationPlan.md#prerequisites-locked-for-mvp):

| Edge case | Policy ID | Decision |
|-----------|-----------|----------|
| P1-06 Role change | D-01 | Switch allowed; archive prior role progress; active role only for proof |
| P1-08 Multi-role | D-12 | Single active role for MVP |
| P2-01 Assessment before learning | D-05 | Warn under 50% roadmap; block under 25% |
| P2-15 Retake scoring | D-02 | Latest passing attempt within freshness window |
| P5-03 Assessment expiry | D-03 | 180-day freshness; downgrade until reassessment |
| P5-05 Threshold retroactivity | D-07 | Grandfather + 30-day grace + email |
| P5-08 Marketplace tier | D-08, D-09 | `interview_ready` gates discovery (70% overall, 50% skill floor, 1 approved project) |
| P6-16 Interest after lapse | D-06 | Block new interest; honor accepted connections |

For full rules and config defaults, see the implementation plan prerequisites section.
