# Project Memory

## Core
React & react-dom must remain at `18.3.1` (do not upgrade to React 19).
UI: Premium, clean, soft, familial, joyful, modern typography.
No hero sections (green banners) or scroll indicators (mouse icon) anywhere.
Never re-add 'Mes livres MCF', 'Offrir un livre...', 'Personnaliser...' to dashboard.
Edge Functions: Use `auth.getClaims(token)`, requires `verify_jwt = false`.
Never modify Supabase Edge Functions (check-subscription, create-checkout, customer-portal, cancel-subscription, reactivate-subscription, stripe-webhook) — managed manually, frontend only.

## Memories

### Design & Components
- [Family Dashboard Structure](mem://architectural-decisions/family-dashboard-tabs-structure) — 'Ma famille' profiles & 'Mes histoires' chronological grid
- [Quick Action Cards](mem://design/components/family-dashboard-quick-actions-cards) — 4 uniform pastel cards with 80x80px icons
- [Dashboard Buttons](mem://design/components/family-dashboard-buttons) — Main blue capsule, Secondary blue ghost, Logout orange/white
- [Dashboard Section Titles](mem://design/components/family-dashboard-section-titles) — Blue #2574EA, Lucide icons in light blue circle
- [Child Profile Card Layout](mem://design/components/child-profile-card-layout) — Modifier button vertical alignment, yellow birthday badge
- [Page Header Consistency](mem://design/ui-ux-principles/page-header-consistency) — text-5xl title, text-xl subtitle, pt-24 padding
- [Testimonials Carousel](mem://features/testimonials-carousel) — 3 desktop / 1 mobile cards with fixed styles & circular photos
- [Avatar Framing CSS](mem://design/components/avatar-display-framing) — object-fit: cover, object-position: center top for 16:9 AI images

### Features & Logic
- [Abonnement Access](mem://features/abonnement-public-access) — 'Abonnement' is public, login required only on plan selection
- [Relative Roles System](mem://features/relative-roles-system) — M/F role pairs, strict gender handling for baby-sitter/other
- [Avatar Enlargement Modal](mem://features/avatar-enlargement-modal) — Click avatar to open enlarged view in centered modal
- [Avatar Age Alerts](mem://features/avatar-age-alerts) — Pulse badge and ring on age thresholds for children/relatives/pets
- [Automated Age Notifications](mem://features/automated-age-notifications) — Database trigger/upsert for milestone thresholds
- [Notification System](mem://features/notification-system) — Optimistic read, explicit UI styles, route navigation
- [Realtime Avatars](mem://features/realtime-avatars) — Hybrid Supabase Realtime + Smart Polling (10s), shimmer transition
- [Avatar Regeneration Webhook](mem://features/avatar-regeneration-webhook) — n8n POST logic & previous_birth_date extraction
- [Avatar Reset Webhook](mem://features/avatar-reset-button) — 'Recommencer de zéro' n8n factory webhook logic & confirmation
- [Avatar Regeneration Signal](mem://features/avatar-regeneration-signal) — sessionStorage isRegenerating persistence

### Technical Constraints & Architecture
- [Avatar Schema](mem://database/schema/avatar-url) — nullable avatar_url column (Text) for external AI URLs
- [Dashboard Data Fetching](mem://technical-constraints/family-dashboard-data-fetching) — Explicitly include avatar_url for initial load
- [Relative Data Parsing](mem://technical-constraints/relative-data-parsing) — Parse details field safely (JSON or stringified JSON)
- [Pet Traits Serialization](mem://technical-constraints/pet-traits-serialization) — Use sanitizeTraitsCustom for JSONB corruption in forms
- [Avatar Realtime Hook](mem://technical-constraints/avatar-realtime-hook-logic) — useRealtimeAvatar local refs, stop polling at 15 attempts
- [Avatar State Truth](mem://technical-constraints/avatar-state-source-of-truth) — Shimmer activates on !avatarUrl or isRegenerating
- [Family Data Caching](mem://features/family-data-caching) — React Query staleTime 5m, gcTime 10m
- [Family Data Invalidation](mem://technical-constraints/family-data-invalidation) — Call useInvalidateFamilyData after any profile mutation
- [Dashboard Stability](mem://technical-constraints/dashboard-stability-performance) — Effects depend on user.id to prevent full auth reload
- [Auth Guard Loading State](mem://architectural-decisions/auth-guard-loading-state) — useAuth explicit isLoading prevents premature redirect

### Security
- [Backend Hardening](mem://security/backend-hardening) — SET search_path = public, edge function error sanitization
- [Book Pages RLS](mem://security/input-validation-rls-mcf-book-pages) — RLS for mcf_book_pages, input validation for priceId checkouts
- [Book Themes RLS](mem://security/rls/book-themes) — RLS restricts access to book creator only
- [Gift Orders RLS](mem://security/rls/gift-orders) — Read restricted to creator or recipient email
- [Edge Function Auth](mem://architectural-decisions/edge-function-auth-pattern) — auth.getClaims(token) verification logic