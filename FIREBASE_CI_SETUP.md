# Setting Up Firebase Functions CI Deployment

To enable automated deployment of Firebase Functions via GitHub Actions, follow these steps:

> **Note:** The current CI setup uses the `--no-script` flag to skip predeploy scripts due to an issue with ESLint configuration. If you fix the ESLint issue, you can remove this flag for proper linting during deployment.

## 1. Generate a Firebase CI Token

Run the following command to generate a Firebase token for CI:

```bash
firebase login:ci
```

This will open a browser window for authentication. After authenticating, the command will output a token.

## 2. Add the Token to GitHub Secrets

1. Go to your GitHub repository
2. Navigate to Settings > Secrets and variables > Actions
3. Click on "New repository secret"
4. Name: `FIREBASE_TOKEN`
5. Value: Paste the token you received from the `firebase login:ci` command
6. Click "Add secret"

## 3. Verify Workflow Setup

The Firebase Functions deployment workflow will now run automatically when changes are pushed to the `functions/` directory on the main branch.

You can also manually trigger the workflow from the "Actions" tab in your GitHub repository.
