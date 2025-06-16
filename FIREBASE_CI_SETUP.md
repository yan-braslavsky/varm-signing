# Setting Up Firebase Functions CI Deployment

To enable automated deployment of Firebase Functions via GitHub Actions, follow these steps:

## Authentication Method

The CI/CD pipeline uses the Firebase service account key for authentication via the `w9jds/firebase-action` GitHub Action. This method provides secure deployment of both Firebase Hosting and Cloud Functions.

### Using Service Account Key (Recommended)

1. In the [Firebase Console](https://console.firebase.google.com/), go to Project Settings > Service accounts
2. Click "Generate new private key" to download a JSON file
3. Go to your GitHub repository
4. Navigate to Settings > Secrets and variables > Actions
5. Click on "New repository secret"
6. Name: `FIREBASE_SERVICE_ACCOUNT_VARM_55A88`
7. Value: Paste the entire contents of the downloaded JSON file
8. Click "Add secret"

#### Required IAM Permissions

The service account needs proper IAM roles to deploy functions:

1. Go to [IAM & Admin > IAM](https://console.cloud.google.com/iam-admin/iam?project=varm-55a88)
2. Find the service account being used (usually `github-action-<number>@varm-55a88.iam.gserviceaccount.com`)
3. Click the edit (pencil) icon for that service account
4. Add the following roles:
   - Firebase Admin
   - Cloud Functions Admin
   - Service Account User
   - Cloud Build Service Account
5. Click "Save"

### Alternative: Using Firebase CI Token (Legacy)

If you prefer to use a Firebase CI token instead:

1. Run the following command to generate a Firebase token for CI:

```bash
firebase login:ci
```

2. This will open a browser window for authentication. After authenticating, the command will output a token.
3. Add the token to GitHub Secrets:
   - Name: `FIREBASE_TOKEN`
   - Value: Paste the token from the `firebase login:ci` command

## 3. Verify Workflow Setup

The Firebase Functions deployment workflow will now run automatically when changes are pushed to the `functions/` directory on the main branch.

You can also manually trigger the workflow from the "Actions" tab in your GitHub repository.
