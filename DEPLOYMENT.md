# VARM Digital Signing - Deployment Guide

This guide walks you through deploying the VARM Digital Signing application to production using Firebase Hosting and integrating with Airtable.

## 🚀 Quick Deployment (Mock Data)

If you want to deploy quickly with mock data for demonstration:

```bash
# Build and deploy to Firebase
npm run deploy
```

The app will be available at your Firebase Hosting URL (e.g., `https://varm-signing.web.app`).

## 📋 Production Deployment with Airtable

### Step 1: Set Up Airtable Base

1. **Create a new Airtable base** or use an existing one
2. **Create an "Offers" table** with the following fields:

| Field Name | Field Type | Notes |
|------------|------------|-------|
| `slug` | Single line text | Primary field, unique identifier |
| `customerName` | Single line text | Customer's full name |
| `offerAmount` | Number | Offer amount in dollars |
| `pdfUrl` | URL | Link to the offer PDF document |
| `isSigned` | Checkbox | Whether the offer has been signed |
| `signedAt` | Date & time | When the offer was signed |

3. **Add some sample data** for testing:

```
slug: test-offer-123
customerName: John Doe
offerAmount: 150000
pdfUrl: https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf
isSigned: false
signedAt: (empty)
```

### Step 2: Get Airtable Credentials

1. **Get your API key:**
   - Go to https://airtable.com/account
   - Generate a personal access token
   - Copy the token (starts with `pat...`)

2. **Get your Base ID:**
   - Go to https://airtable.com/api
   - Select your base
   - Copy the Base ID from the URL or documentation (starts with `app...`)

### Step 3: Configure Environment Variables

Create/update your `.env.local` file:

```env
# Airtable Configuration
VITE_AIRTABLE_API_KEY=pat1234567890abcdef  # Your Airtable personal access token
VITE_AIRTABLE_BASE_ID=app1234567890abcdef  # Your Airtable base ID

# API Configuration  
VITE_API_BASE_URL=https://your-region-your-project.cloudfunctions.net/api
```

### Step 4: Switch to Airtable API

Replace the mock API with the Airtable service:

1. **Open `src/api/offerApi.ts`**
2. **Replace the export** at the bottom:

```typescript
// Replace this line:
export default offerApi;

// With this:
import { airtableService } from './airtableService';
export const offerApi = airtableService;
export default airtableService;
```

### Step 5: Test Locally

```bash
# Start the development server
npm run dev

# Test with your Airtable data
open http://localhost:5175
```

### Step 6: Deploy to Production

```bash
# Build and deploy everything
npm run deploy

# Or deploy components separately:
npm run deploy:hosting  # Frontend only
npm run deploy:functions  # Backend only
```

## 🔧 Firebase Configuration

### Firebase Project Setup

If you haven't set up Firebase yet:

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase (if not already done)
firebase init

# Select:
# - Hosting
# - Functions
# - Firestore (optional)
```

### Firebase Hosting Configuration

The `firebase.json` is already configured for optimal performance:

```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

### Firebase Functions (Optional)

If you want to use Firebase Functions as an API proxy:

1. **Update `functions/src/index.ts`** to use the Airtable service
2. **Deploy functions:**

```bash
npm run deploy:functions
```

## 🌍 Custom Domain Setup

### Step 1: Add Custom Domain in Firebase Console

1. Go to your Firebase project console
2. Navigate to Hosting
3. Click "Add custom domain"
4. Follow the DNS verification steps

### Step 2: Update Environment Variables

```env
VITE_API_BASE_URL=https://api.varm.energy
```

### Step 3: Update URLs in Code

Update any hardcoded URLs to use your custom domain.

## 📊 Monitoring and Analytics

### Firebase Analytics (Optional)

Add Firebase Analytics to track usage:

```bash
# Install Firebase SDK
npm install firebase

# Add to your app (in main.tsx or App.tsx)
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = { /* your config */ };
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
```

### Error Monitoring

Consider adding error monitoring with:
- Sentry
- LogRocket  
- Firebase Crashlytics

## 🔒 Security Considerations

### Environment Variables

**Never commit sensitive data to git:**

```bash
# Add to .gitignore
.env.local
.env.production
.env
```

### Airtable API Key Security

- Use personal access tokens (not deprecated API keys)
- Rotate tokens regularly
- Restrict token permissions to minimum required

### CORS Configuration

Ensure your Firebase Functions have proper CORS:

```typescript
// In functions/src/index.ts
import * as cors from 'cors';

const corsHandler = cors({
  origin: [
    'https://varm-signing.web.app',
    'https://your-custom-domain.com'
  ]
});
```

## 🧪 Testing Production Build

### Local Testing

```bash
# Build and preview locally
npm run test:build
```

### Staging Environment

Set up a staging Firebase project:

```bash
# Use staging project
firebase use staging

# Deploy to staging
npm run deploy
```

## 📋 Deployment Checklist

### Pre-Deployment

- [ ] Airtable base is set up with correct schema
- [ ] Environment variables are configured
- [ ] API integration is tested locally
- [ ] All features work with real data
- [ ] Error handling is tested
- [ ] Mobile responsiveness is verified

### Deployment

- [ ] Code is committed to git
- [ ] Production build passes
- [ ] ESLint passes with no errors
- [ ] Firebase project is configured
- [ ] Custom domain is set up (if applicable)
- [ ] SSL certificate is active

### Post-Deployment

- [ ] Application loads correctly
- [ ] All routes work properly
- [ ] PDF viewing functions
- [ ] Signing workflow completes
- [ ] Error pages display correctly
- [ ] Mobile experience is smooth
- [ ] Analytics are tracking (if configured)

## 🔄 Continuous Deployment

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Firebase

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '20'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build
      run: npm run build:prod
      
    - name: Deploy to Firebase
      run: |
        npm install -g firebase-tools
        firebase deploy --token ${{ secrets.FIREBASE_TOKEN }}
```

## 🆘 Troubleshooting

### Common Issues

**1. "Module not found" errors**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**2. Airtable authentication errors**
- Verify API key is correct and active
- Check Base ID matches your Airtable base
- Ensure environment variables are set

**3. Build failures**
```bash
# Clean and rebuild
npm run clean
npm run build
```

**4. CORS errors in production**
- Update Firebase Functions CORS configuration
- Verify allowed origins include your domain

### Getting Help

- Check Firebase Console logs
- Review browser network tab for API errors
- Check Airtable API logs
- Verify environment variables in deployment

## 📈 Performance Optimization

### Bundle Analysis

```bash
# Analyze bundle size
npm run build
npx vite-bundle-analyzer dist
```

### Optimizations Applied

- Tree shaking with Vite
- Code splitting with React Router
- Optimized images and assets
- Efficient CSS with utility classes
- Lazy loading for non-critical components

---

## 🎯 Success Metrics

After deployment, monitor:

- Page load times < 3 seconds
- Signing completion rate > 95%
- Mobile usability score > 90
- Error rate < 1%
- User satisfaction feedback

Your VARM Digital Signing platform is now ready for production! 🚀
