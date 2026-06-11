Implement a complete scalable AI-powered skill assessment system inside the ProductPath monorepo.

Project Context:

* Monorepo architecture
* apps/web → candidate platform
* apps/admin → admin dashboard
* apps/api → backend APIs
* Next.js + TypeScript + pnpm + turbo
* Prisma + PostgreSQL/Supabase
* AI-first product career platform

Goal:
Build a modular, production-grade assessment engine for:

* Product Management
* Product Design
* Product Marketing
* Product Analytics
* Product Operations

The system must support:

* adaptive AI assessments
* practical tasks
* portfolio evaluation
* anti-cheat/authenticity scoring
* personalized roadmap generation
* AI mock interviews
* skill-gap analysis

IMPORTANT:
Do NOT hardcode logic inside pages/components.
Architecture must be modular, scalable, maintainable, and future-ready.

==================================================

1. CREATE CLEAN SYSTEM ARCHITECTURE
   ==================================================

Create scalable folders:

/packages/assessment-engine
/packages/ai-evaluator
/packages/scoring-engine
/packages/authenticity-engine
/packages/question-bank
/packages/interview-engine

/apps/web/app/assessment
/apps/web/components/assessment
/apps/web/components/interview
/apps/web/components/results

/apps/api/src/modules/assessment
/apps/api/src/modules/interview
/apps/api/src/modules/scoring

/data/assessments
/data/question-bank

/types/assessment

==================================================
2. CREATE ROLE-BASED ASSESSMENT SYSTEM
======================================

Implement assessments for:

* product-management
* product-design
* product-marketing
* product-analytics
* product-operations

Each role must support:

* beginner
* intermediate
* advanced

Each assessment should contain:

* MCQs
* scenario questions
* practical tasks
* AI follow-up questioning
* portfolio review
* communication evaluation
* AI fluency evaluation

==================================================
3. CREATE QUESTION BANK SYSTEM
==============================

Create structured question bank architecture.

Example:

/data/question-bank/product-management/
beginner.ts
intermediate.ts
advanced.ts

Each question should support:

* id
* role
* difficulty
* type
* question
* expected_skills
* scoring_criteria
* followup_questions
* tags
* estimated_time

Question types:

* mcq
* case-study
* open-ended
* practical
* portfolio
* mock-interview

==================================================
4. CREATE TYPESCRIPT TYPES
==========================

Create reusable interfaces:

Assessment
AssessmentSession
Question
QuestionResponse
SkillScore
AuthenticityScore
PortfolioAnalysis
InterviewSession
RoadmapRecommendation
SkillGapAnalysis

Use strict typing everywhere.

==================================================
5. CREATE ADAPTIVE ASSESSMENT ENGINE
====================================

Build adaptive engine that:

* adjusts difficulty dynamically
* generates AI follow-up questions
* tracks weak areas
* personalizes next questions
* tracks confidence levels

Logic:

* strong answers → harder follow-ups
* weak answers → foundational checks

==================================================
6. CREATE AI EVALUATION SYSTEM
==============================

Integrate OpenAI API.

Create AI evaluator module for:

* reasoning quality
* structured thinking
* product intuition
* communication quality
* AI fluency
* portfolio depth

Implement:

* semantic scoring
* rubric-based evaluation
* structured JSON outputs
* retry/fallback handling

Create reusable prompts for:

* PM evaluation
* Design critique
* Marketing evaluation
* Analytics reasoning
* Operations workflows

==================================================
7. CREATE AUTHENTICITY / ANTI-CHEAT ENGINE
==========================================

Implement authenticity scoring system.

Track:

* typing patterns
* response timing
* copy-paste detection
* answer consistency
* behavioral anomalies
* session consistency

Create:
Authenticity Score (0–100)

Signals:

* suspiciously fast answers
* large pasted blocks
* inconsistent reasoning
* abrupt skill spikes

DO NOT block AI usage.
Instead evaluate:

* depth
* consistency
* reasoning quality

==================================================
8. CREATE PORTFOLIO ANALYZER
============================

Support:

* GitHub links
* Figma links
* Notion links
* PDF uploads

Analyze:

* project depth
* execution quality
* iteration quality
* communication clarity

Create placeholder integrations for:

* GitHub API
* Figma API

==================================================
9. CREATE MOCK INTERVIEW ENGINE
===============================

Build AI interview simulator.

Features:

* role-specific interviews
* AI follow-up questions
* behavioral interviews
* product cases
* voice-ready architecture

Support:

* text interviews initially
* future voice integration

Create:
Interview transcript system
Interview scoring system
Interview feedback generation

==================================================
10. CREATE SCORING ENGINE
=========================

Implement:

* role-specific scoring weights
* weighted skill evaluation
* readiness scoring
* confidence scoring

Output:

* Beginner
* Internship Ready
* APM Ready
* Mid-Level Ready
* Senior Ready

Create radar-chart compatible output structure.

==================================================
11. CREATE ROADMAP RECOMMENDATION ENGINE
========================================

Generate personalized roadmap recommendations based on:

* weak skills
* target role
* target companies
* assessment performance

Integrate with roadmap data system already created.

Output:

* recommended topics
* suggested projects
* learning resources
* interview focus areas

==================================================
12. CREATE DATABASE SCHEMA
==========================

Create Prisma schema for:

* users
* assessments
* sessions
* responses
* scores
* interviews
* portfolios
* roadmap progress
* authenticity logs

Ensure scalability.

==================================================
13. CREATE FRONTEND UI SYSTEM
=============================

Build modular UI:

* assessment dashboard
* assessment player
* timer system
* question renderer
* progress tracker
* AI interview chat UI
* result dashboard
* radar charts
* skill-gap visualization
* roadmap recommendations

Use reusable components.

==================================================
14. CREATE ADMIN PANEL
======================

Inside apps/admin:

* question management
* assessment analytics
* user performance
* AI scoring review
* authenticity monitoring
* roadmap analytics

==================================================
15. CREATE API ARCHITECTURE
===========================

Create scalable APIs for:

* start assessment
* submit answer
* generate follow-up
* calculate score
* generate roadmap
* portfolio analysis
* interview generation

Use modular service architecture.

==================================================
16. CREATE FUTURE-READY ARCHITECTURE
====================================

Design system to support future:

* voice interviews
* live collaboration
* recruiter dashboards
* AI mentors
* benchmarking
* enterprise analytics
* CMS integration
* vector memory
* multi-model AI routing

==================================================
17. CREATE DOCUMENTATION
========================

Generate:

* architecture.md
* assessment-flow.md
* scoring-system.md
* ai-evaluation.md
* anti-cheat.md
* roadmap-engine.md

==================================================
18. IMPLEMENTATION RULES
========================

* Keep code modular
* Avoid massive files
* Use clean architecture
* Reuse components
* Use TypeScript strictly
* Separate logic from UI
* Avoid hardcoding
* Keep future scalability in mind
* Do not modify unrelated code

==================================================
19. FINAL OUTPUT
================

After implementation provide:

* all files created
* all files modified
* architecture explanation
* assessment flow explanation
* AI evaluation pipeline
* anti-cheat logic
* scalability decisions
* future extensibility notes
* setup instructions
* required environment variables
* required APIs/services





==================================================
20. EXTERNAL SERVICES & OFFICIAL SOURCES
========================================

Use official SDKs/APIs only.

AI / LLM APIs:

* OpenAI API
  https://platform.openai.com/docs

Optional Future Models:

* Anthropic Claude
  https://docs.anthropic.com/
* Google Gemini
  https://ai.google.dev/

Authentication:

* Clerk
  https://clerk.com/docs

Database / Backend:

* Supabase
  https://supabase.com/docs
* PostgreSQL
  https://www.postgresql.org/docs/

ORM:

* Prisma
  https://www.prisma.io/docs

Analytics:

* PostHog
  https://posthog.com/docs

Charts / Visualization:

* Recharts
  https://recharts.org/

File Uploads:

* UploadThing
  https://docs.uploadthing.com/

Portfolio Integrations:

* GitHub API
  https://docs.github.com/en/rest
* Figma API
  https://www.figma.com/developers/api

Voice / Interview APIs (future-ready placeholders only):

* Deepgram
  https://developers.deepgram.com/docs
* ElevenLabs
  https://elevenlabs.io/docs

Queue / Background Jobs:

* BullMQ
  https://docs.bullmq.io/

Validation:

* Zod
  https://zod.dev/

State Management:

* Zustand
  https://zustand-demo.pmnd.rs/

UI Components:

* shadcn/ui
  https://ui.shadcn.com/

Tables:

* TanStack Table
  https://tanstack.com/table/latest

Forms:

* React Hook Form
  https://react-hook-form.com/

Animations:

* Framer Motion
  https://www.framer.com/motion/

Markdown Rendering:

* react-markdown
  https://github.com/remarkjs/react-markdown

Code Editor (for SQL/Product Analytics tasks):

* Monaco Editor
  https://microsoft.github.io/monaco-editor/

PDF Parsing:

* pdf-parse
  https://www.npmjs.com/package/pdf-parse

Environment Variables Needed:

* OPENAI_API_KEY
* DATABASE_URL
* NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
* CLERK_SECRET_KEY
* SUPABASE_URL
* SUPABASE_ANON_KEY
* POSTHOG_KEY
* UPLOADTHING_SECRET
* GITHUB_TOKEN
* FIGMA_ACCESS_TOKEN

Implementation Notes:

* Create integration abstraction layers for all external services.
* Avoid vendor lock-in.
* Use service adapters/interfaces.
* Add retry + fallback handling for AI calls.
* Keep APIs modular for future multi-model routing.
