# Environment Variables in VARM Signing Platform

This document explains how environment variables are managed in the VARM Signing Platform.

## Required Environment Variables

The following environment variables are required for the application to work properly:

### Frontend Configuration
- `VITE_API_BASE_URL`: The base URL for the Firebase Cloud Functions API

This can be set to:
- `http://localhost:5001/varm-signing/us-central1/api` for local development
- `https://us-central1-varm-signing.cloudfunctions.net/api` for production

### Backend Configuration (Cloud Functions)
The Airtable credentials are now only handled by the Firebase Cloud Functions backend.
These should be set using Firebase CLI:

```bash
firebase functions:config:set airtable.base_id=YOUR_BASE_ID airtable.api_key=YOUR_API_KEY
```

## Local Development

For local development, create a `.env` file in the root of your project with the following content:

```
VITE_API_BASE_URL=http://localhost:5001/varm-signing/us-central1/api
```

When developing locally, follow these steps:

1. Set up your Firebase project and functions
2. Install Firebase CLI tools: `npm install -g firebase-tools`
3. Login to Firebase: `firebase login`
4. Configure Airtable credentials for local development:
   ```
   firebase functions:config:set airtable.base_id=your_airtable_base_id airtable.api_key=your_airtable_api_key
   ```
5. Create a `.runtimeconfig.json` file in the `functions` directory for local emulation:
   ```json
   {
     "airtable": {
       "base_id": "your_airtable_base_id",
       "api_key": "your_airtable_api_key"
     }
   }
   ```
6. Start the Firebase emulator: `firebase emulators:start`
7. In another terminal, start the frontend: `npm run dev`

## CI/CD Pipeline

GitHub Actions workflows use GitHub repository secrets to set environment variables during the build process. These secrets should be configured in your GitHub repository settings:

1. Go to your repository on GitHub
2. Click on "Settings"
3. Navigate to "Secrets and variables" > "Actions"

### Required Repository Secrets

Add the following repository secrets:
   - `VITE_API_BASE_URL`: The base URL for the Firebase Cloud Functions API (e.g., `https://us-central1-varm-signing.cloudfunctions.net/api`)
   - `FIREBASE_SERVICE_ACCOUNT`: Your Firebase service account JSON (for deploying functions)
   - `AIRTABLE_BASE_ID`: Your Airtable base ID (used only by Cloud Functions)
   - `AIRTABLE_API_KEY`: Your Airtable API key (used only by Cloud Functions)

For the Firebase Functions, set environment variables in your CI/CD pipeline:

```yaml
- name: Deploy functions
  run: |
    firebase functions:config:set airtable.base_id=${{ secrets.AIRTABLE_BASE_ID }} airtable.api_key=${{ secrets.AIRTABLE_API_KEY }}
    firebase deploy --only functions
  env:
    GOOGLE_APPLICATION_CREDENTIALS: ${{ runner.temp }}/service-account.json
```

The workflows in `.github/workflows/*.yml` are configured to use these secrets during the build process.

## Environment Variables in Vite

This project uses Vite as the build tool, which has specific requirements for environment variables:

- Variables must be prefixed with `VITE_` to be accessible in the client code
- Environment variables are replaced during build time, not runtime
- They can be accessed in the code using `import.meta.env.VITE_VARIABLE_NAME`

For more information on environment variables in Vite, see the [Vite documentation](https://vitejs.dev/guide/env-and-mode.html).

## Troubleshooting

If you encounter an error related to environment variables, check the following:

1. For frontend issues (`VITE_API_BASE_URL` not found):
   - Make sure your `.env` file exists and contains the required API URL
   - For deployed versions, check that the `VITE_API_BASE_URL` GitHub secret is properly configured

2. For Cloud Functions issues (Airtable connection errors):
   - Check that Firebase Functions config is set correctly with `firebase functions:config:get`
   - For local development, verify your `.runtimeconfig.json` file has the correct Airtable credentials
   - For production, make sure you've run `firebase functions:config:set` with the correct values

## Using Environment Variables with Firebase Emulators

When using Firebase Emulators for local testing, you need to set the Airtable credentials for the Cloud Functions:

1. First, set the configuration values (only needs to be done once):
   ```bash
   firebase functions:config:set airtable.base_id=your_airtable_base_id airtable.api_key=your_airtable_api_key
   ```

2. Export the configuration to a local file for the emulator:
   ```bash
   firebase functions:config:get > functions/.runtimeconfig.json
   ```

3. Start the Firebase emulators:
   ```bash
   firebase emulators:start
   ```

4. In a separate terminal, start the frontend with the local API URL:
   ```bash
   npm run dev
   ```
