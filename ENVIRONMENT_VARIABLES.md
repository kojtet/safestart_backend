# Environment Variables

This document lists all the environment variables required for the SafeStart backend application.

## Database Configuration
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
```

## Email Configuration (Resend)
```
RESEND_API_KEY=re_your-resend-api-key
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=SafeStart
```

## SMS Configuration (Twilio)
```
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

## Frontend Configuration
```
FRONTEND_URL=https://yourdomain.com
```

## Server Configuration
```
PORT=3000
NODE_ENV=development
```

## JWT Configuration
```
JWT_ACCESS_SECRET=your-access-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_ISSUER=startup-flo
JWT_AUDIENCE=startup-flo-users
```

## Complete Example
```env
# Database
SUPABASE_URL=https://ybhyouzizpxzurjouxxg.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Email (Resend)
RESEND_API_KEY=re_dn6FtM8n_FytcGBqrFxx2gQoDLbnXHPDe
EMAIL_FROM=noreply@safestart.com
EMAIL_FROM_NAME=SafeStart

# SMS (Twilio)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Frontend
FRONTEND_URL=https://yourdomain.com

# Server
PORT=3000
NODE_ENV=development

# JWT
JWT_ACCESS_SECRET=your-access-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_ISSUER=startup-flo
JWT_AUDIENCE=startup-flo-users
```

## Setup Instructions

### Resend (Email)
1. Sign up at [resend.com](https://resend.com)
2. Create an API key
3. Add your domain for sending emails
4. Set the `RESEND_API_KEY` environment variable

### Twilio (SMS)
1. Sign up at [twilio.com](https://twilio.com)
2. Get your Account SID and Auth Token
3. Purchase a phone number
4. Set the Twilio environment variables

### JWT Secrets
Generate secure random strings for JWT secrets:
```bash
# Generate a secure random string
openssl rand -hex 64
```

## Security Notes
- Never commit environment variables to version control
- Use strong, unique secrets for JWT keys
- Rotate API keys regularly
- Use environment-specific configurations 