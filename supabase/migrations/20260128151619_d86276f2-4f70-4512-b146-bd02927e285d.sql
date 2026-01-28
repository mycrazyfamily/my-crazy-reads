-- Drop existing SELECT policy
DROP POLICY IF EXISTS "Can view own gift orders" ON public.gift_orders;

-- Create policy for sender: can view orders they created
CREATE POLICY "Enable read access for sender"
ON public.gift_orders
FOR SELECT
TO authenticated
USING (auth.uid() = created_by);

-- Create policy for recipient: can view orders destined to their email
CREATE POLICY "Enable read access for recipient"
ON public.gift_orders
FOR SELECT
TO authenticated
USING (recipient_email = (auth.jwt() ->> 'email'));

-- Ensure anon role has no access (RLS blocks by default, but explicitly deny)
REVOKE ALL ON public.gift_orders FROM anon;