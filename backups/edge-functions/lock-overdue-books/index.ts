import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const now = new Date()
  const today = now.toISOString().split('T')[0]

  const { error, count } = await supabase
    .from('book_requests')
    .update({
      status: 'locked',
      theme_locked: true,
      theme_locked_at: now.toISOString(),
      updated_at: now.toISOString(),
    }, { count: 'exact' })
    .in('status', ['pending_choice', 'configured'])
    .lt('personalization_deadline', today)
    .eq('is_active', true)

  if (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ success: true, locked: count ?? 0 }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  )
})