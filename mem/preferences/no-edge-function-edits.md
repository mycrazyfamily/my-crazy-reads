---
name: No Edge Function edits
description: Never modify Supabase Edge Functions — frontend only
type: constraint
---
Never modify Supabase Edge Functions: check-subscription, create-checkout, customer-portal, cancel-subscription, reactivate-subscription, stripe-webhook. They are managed manually. Make only frontend code changes. **Why:** user manages these functions outside of Lovable.