# SCL-90 Web Application TODO

## Phase 1: Core Assessment (Completed)
- [x] Basic homepage layout with modern medical aesthetic
- [x] 90-item questionnaire with Likert scale responses
- [x] Real-time progress tracking
- [x] Result calculation and display
- [x] CSV export functionality
- [x] Privacy protection notice

## Phase 2: Database & Backend (Completed)
- [x] Upgrade to web-db-user template
- [x] Design database schema for assessments
- [x] Create sclAssessments table for storing responses and scores
- [x] Create sclAnalyticsSummary table for aggregated statistics
- [x] Implement database migrations with drizzle-kit
- [x] Create query helpers in server/db.ts

## Phase 3: tRPC API Routes (Completed)
- [x] Implement assessment.save endpoint (protected)
- [x] Implement assessment.getHistory endpoint (protected)
- [x] Implement analytics.getOverview endpoint (public)
- [x] Implement analytics.getByPeriod endpoint (public)
- [x] Add input validation with Zod
- [x] Write vitest tests for all endpoints

## Phase 4: Analytics Dashboard (Completed)
- [x] Create Analytics.tsx component
- [x] Implement key metrics display (total assessments, users, avg scores)
- [x] Create trend chart (line chart showing recent assessments)
- [x] Create factor distribution pie chart
- [x] Create period analysis bar chart (daily/weekly/monthly)
- [x] Add navigation between Home and Analytics pages
- [x] Implement responsive design

## Phase 5: Frontend Integration (In Progress)
- [x] Integrate assessment.save into Home.tsx to persist results to database
- [ ] Add loading states and error handling for API calls
- [ ] Implement assessment history view for logged-in users
- [ ] Add user profile/account settings page
- [ ] Create data export with detailed statistics
- [x] Smart jump to first unanswered question on submit
- [x] Reduce fixed header/footer height on mobile
- [x] Fix option button sizing consistency on mobile
- [x] Restrict public access to assessment page only (hide analytics from non-admin)
- [x] Update privacy statement to reflect actual data collection practices
- [ ] Verify data persistence in database after submission
- [x] Implement responsive sticky header that collapses on scroll (mobile only)
- [x] Remove login requirement for assessment submission (allow anonymous results)

## Phase 6: Research Features (Planned)
- [ ] Implement anonymous assessment mode
- [ ] Create researcher dashboard for data aggregation
- [ ] Add filtering and sorting to analytics
- [ ] Implement data download for researchers (CSV/JSON)
- [ ] Add multi-language support (English)

## Phase 7: Deployment & Polish (Planned)
- [ ] Performance optimization
- [ ] SEO improvements
- [ ] Accessibility audit and fixes
- [ ] Security review and hardening
- [ ] Documentation and user guide
- [ ] Publish to production

## Known Limitations
- Analytics data is currently empty (requires actual assessment submissions)
- No researcher authentication/authorization yet
- Limited to Chinese language
- No email notifications for new submissions
