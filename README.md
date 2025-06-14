# VARM Signing Platform

A production-grade React + TypeScript application for climate-tech offer signing. This platform allows customers to view and sign their climate-tech offers in a secure, user-friendly environment.

## Features

- Real-time offer display with Airtable integration
- Secure PDF viewing and signing
- Mobile-responsive UI
- Comprehensive logging and error handling
- Firebase hosting and functions

## Environment Variables

This project requires certain environment variables to function correctly:

- `VITE_AIRTABLE_BASE_ID`: Your Airtable base ID
- `VITE_AIRTABLE_API_KEY`: Your Airtable API key

For local development, copy the `.env.example` file to `.env` and fill in your values:

```bash
cp .env.example .env
# Now edit .env with your actual values
```

For deployment with GitHub Actions, set these as repository secrets in your GitHub repo settings.

See [ENV_VARIABLES.md](ENV_VARIABLES.md) for more detailed information.

## Offer Management

The platform uses Airtable as its backend database. The Offers page (/offers) displays all available offers with their details. When an offer is signed, the status is updated in Airtable in real-time.

## Firebase Cloud Functions

The project includes Firebase Cloud Functions for server-side operations:

- `ping`: A simple function that returns "pong" (for testing connectivity)
- `getOffer`: Retrieves a specific offer by slug
- `getAllOffers`: Gets all available offers
- `signOffer`: Updates an offer's signature status

### Testing Cloud Functions Locally

To test the cloud functions locally:

```bash
cd functions
npm run serve
```

Then access the ping function at: http://localhost:5001/varm-55a88/us-central1/ping

### Continuous Integration

The project has separate CI workflows for Firebase Hosting and Firebase Functions:
- Firebase Hosting is deployed on every push to the main branch
- Firebase Functions are deployed separately when changes are detected in the `functions/` directory

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
