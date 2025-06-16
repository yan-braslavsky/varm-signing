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

## 3. Deployment Configuration

The workflow is configured to deploy both Firebase Functions and Hosting when changes are pushed to the main branch.

### Deployment Specifics

The deployment command in the workflow uses specific flags to ensure smooth CI/CD:

```yaml
- name: Deploy to Firebase
  uses: w9jds/firebase-action@master
  with:
    args: deploy --only functions:default,hosting --non-interactive
  env:
    GCP_SA_KEY: ${{ secrets.FIREBASE_SERVICE_ACCOUNT_VARM_55A88 }}
    PROJECT_ID: varm-55a88
```

- `--only functions:default,hosting`: Deploys only the default functions codebase and hosting, avoiding deployment of other Firebase services
- `--non-interactive`: Ensures the deployment doesn't wait for any user input, which is essential for CI environments

### Handling Permission Issues

If you encounter permission errors during deployment:

1. **Firebase Extensions Error**: If you see errors related to Firebase Extensions permissions, it's often because the service account doesn't have the right permissions for this service. Our current workflow avoids this by only deploying the services we need.

2. **Function Deployment Error**: If Cloud Functions deployment fails with permission errors, verify that your service account has all the required roles mentioned above.

3. **IAM Propagation**: After adding IAM roles, changes can take up to 5-10 minutes to propagate in Google Cloud.

You can also manually trigger the workflow from the "Actions" tab in your GitHub repository.
