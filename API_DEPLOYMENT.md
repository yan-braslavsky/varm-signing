# Deploying the VARM Signing Platform API

This document provides instructions for deploying the VARM Signing Platform API using Firebase Cloud Functions.

## Prerequisites

- Firebase CLI installed (`npm install -g firebase-tools`)
- Firebase project created
- Proper permissions to deploy Firebase Functions

## Setup

### 1. Set Firebase Environment Variables

Before deployment, you need to set the Airtable configuration and API authentication in Firebase:

```bash
# Set Airtable credentials
firebase functions:config:set airtable.base_id="your_airtable_base_id" airtable.api_key="your_airtable_api_key"

# Set API security key (for endpoints that require authentication)
firebase functions:config:set api.key="your_secure_api_key"
```

### 2. Local Development

For local development with the Firebase Emulator:

1. Create a `.runtimeconfig.json` file in the `functions` directory:

```json
{
  "airtable": {
    "base_id": "your_airtable_base_id",
    "api_key": "your_airtable_api_key"
  },
  "api": {
    "key": "your_secure_api_key"
  }
}
```

2. Start the Firebase Emulator:

```bash
npm run emulators:functions
```

3. Update your frontend `.env` file to point to the local emulator:

```
VITE_API_BASE_URL=http://localhost:5001/varm-signing/us-central1/api
```

### 3. Deployment

To deploy the Cloud Functions:

```bash
npm run deploy:functions
```

Or deploy everything (frontend and functions):

```bash
npm run deploy:all
```

## API Endpoints

Once deployed, your API will be available at:

```
https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/api
```

The following endpoints are available:

- `GET /offer/:slug` - Get offer details
- `POST /offer/:slug/sign` - Sign an offer
- `GET /offers` - Get all offers

## Testing Your API

You can test your API using curl:

```bash
# Get an offer
curl https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/api/offer/test-offer-123

# Sign an offer
curl -X POST https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/api/offer/test-offer-123/sign

# Get all offers (requires API key)
curl -H "x-api-key: your_secure_api_key" https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/api/offers
```

## Security Considerations

### Authentication

The API implements several security measures:

1. **API Key Authentication**: The `/offers` endpoint (which returns all offers) is protected with an API key. 
   To access this endpoint, include the API key in the request header:
   
   ```
   x-api-key: your_secure_api_key
   ```

2. **CORS Protection**: API requests are restricted to allowed origins configured in `config.ts`.

3. **Firebase Auth (Optional)**: The codebase includes support for Firebase Authentication, 
   which can be enabled by uncommenting the relevant middleware in `index.ts`.

### Additional Security Recommendations

- Configure proper CORS settings in `config.ts` to restrict access to your domains
- Consider adding rate limiting for production use
- For highly sensitive operations, consider implementing additional authentication methods
- Store API keys and credentials securely, and rotate them periodically

## Troubleshooting

If you encounter issues:

1. Check the Firebase Function logs:

```bash
firebase functions:log
```

2. Verify your environment variables are set correctly:

```bash
firebase functions:config:get
```

3. For local development issues, ensure your `.runtimeconfig.json` is properly configured
