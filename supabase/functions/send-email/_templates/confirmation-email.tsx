import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Hr,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface ConfirmationEmailProps {
  supabase_url: string
  email_action_type: string
  redirect_to: string
  token_hash: string
  token: string
}

export const ConfirmationEmail = ({
  token,
  supabase_url,
  email_action_type,
  redirect_to,
  token_hash,
}: ConfirmationEmailProps) => (
  <Html>
    <Head />
    <Preview>Bienvenue dans l'aventure My Crazy Family !</Preview>
    <Body style={main}>
      <Container style={container}>
        <div style={mailboxIcon}>📬</div>
        
        <Heading style={h1}>
          Bienvenue dans l'aventure My Crazy Family !
        </Heading>
        
        <Text style={text}>
          Une dernière étape avant de commencer à créer des histoires magiques avec ta famille !
        </Text>
        
        <Link
          href={`${supabase_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`}
          target="_blank"
          style={button}
        >
          Confirmer mon compte
        </Link>
        
        <Text style={linkText}>
          Si le bouton ne fonctionne pas, copie ce lien dans ton navigateur :
        </Text>
        
        <Link
          href={`${supabase_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`}
          target="_blank"
          style={link}
        >
          {`${supabase_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`}
        </Link>
        
        <Hr style={hr} />
        
        <Text style={footerText}>
          Tu n'as pas créé de compte ? Tu peux ignorer cet email.
        </Text>
        
        <Text style={signature}>
          Avec ❤️ par l'équipe My Crazy Family
        </Text>
        
        <Text style={copyright}>
          © 2024 My Crazy Family. Tous droits réservés.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ConfirmationEmail

// Styles basés sur la charte graphique bleu/vert de MCF
const main = {
  backgroundColor: '#F8FAFB',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
}

const container = {
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '600px',
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
}

const mailboxIcon = {
  textAlign: 'center' as const,
  fontSize: '48px',
  marginBottom: '24px',
}

const h1 = {
  color: '#4A90E2', // MCF Primary Blue
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0 0 24px',
  textAlign: 'center' as const,
  lineHeight: '1.3',
}

const text = {
  color: '#333333',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 24px',
  textAlign: 'center' as const,
}

const button = {
  backgroundColor: '#4A90E2', // MCF Primary Blue
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '14px 28px',
  margin: '0 auto 24px',
  maxWidth: '280px',
}

const linkText = {
  color: '#666666',
  fontSize: '14px',
  lineHeight: '1.4',
  margin: '0 0 12px',
  textAlign: 'center' as const,
}

const link = {
  color: '#4A90E2', // MCF Primary Blue
  fontSize: '13px',
  textDecoration: 'underline',
  wordBreak: 'break-all' as const,
  display: 'block',
  textAlign: 'center' as const,
  margin: '0 0 24px',
}

const hr = {
  border: 'none',
  borderTop: '1px solid #E3F0FF', // MCF Gradient End (light blue)
  margin: '32px 0',
}

const footerText = {
  color: '#999999',
  fontSize: '14px',
  lineHeight: '1.4',
  margin: '0 0 16px',
  textAlign: 'center' as const,
}

const signature = {
  color: '#7BC5AE', // MCF Secondary Green
  fontSize: '16px',
  fontWeight: '500',
  margin: '0 0 12px',
  textAlign: 'center' as const,
}

const copyright = {
  color: '#AAAAAA',
  fontSize: '12px',
  margin: '0',
  textAlign: 'center' as const,
}
