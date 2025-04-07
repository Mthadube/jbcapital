# JB Capital Application

A financial services application for loan management and user document processing.

## MongoDB Integration

This application now uses MongoDB Atlas for data persistence. The connection string is configured in the `.env` file.

## Environment Variables

This application requires several environment variables to function properly. These should be set in a `.env` file at the root of the project. An example file (`.env.example`) is provided for reference.

```
# Google Maps API Key for Places Autocomplete
VITE_GOOGLE_MAPS_API_KEY="your_google_maps_api_key"

# MongoDB Connection String
MONGODB_URI="your_mongodb_connection_string"
MONGODB_DB_NAME="your_database_name"

# Twilio credentials
VITE_TWILIO_ACCOUNT_SID="your_twilio_account_sid"
VITE_TWILIO_AUTH_TOKEN="your_twilio_auth_token"
VITE_TWILIO_PHONE_NUMBER="your_twilio_phone_number"
```

## Setup Instructions

1. Install dependencies for the client:

```bash
npm install
```

2. Install dependencies for the server:

```bash
npm run server:install
```

Or use the combined setup command:

```bash
npm run setup
```

## Running the Application

To run the client and server concurrently:

```bash
npm run dev:all
```

Or run them separately:

- Client: `npm run dev`
- Server: `npm run server`

## Admin Login

The application automatically creates an admin user in MongoDB at startup:

- Email: `admin@jbcapital.com`
- Password: `admin123`

If you encounter the error "Admin user not found in database", please ensure:
1. The MongoDB server is running (`npm run server`)
2. Refresh the page and try again

## MongoDB Setup

1. The MongoDB connection is configured in the `.env` file:

```
MONGODB_URI="your_mongodb_connection_string"
MONGODB_DB_NAME="jbcapital"
```

2. Initialize database:
   - Login as an admin user
   - Navigate to the "Database" tab in the admin dashboard
   - Click "Check Connection" to verify the MongoDB connection
   - Click "Migrate Data" to populate the database with initial data

## Deployment to Render

This application is configured for deployment on Render. The `render.yaml` file provides the necessary configuration. To deploy:

1. Connect your GitHub repository to Render
2. Create a new Web Service selecting the `main` branch
3. Set the environment variables in the Render dashboard (see `.env.example` for required variables)
4. Deploy the service

Note: The application is set up to use the `render-build` script for building and the `start` script for running in production.

## Security Notes

- **Never commit sensitive credentials** to the repository. All sensitive information should be in environment variables.
- The application now has enhanced security for phone verification using OTP codes.
- The `.gitignore` file is configured to exclude all environment files except `.env.example`.

## Application Structure

- `/src` - React frontend code
- `/server` - MongoDB backend code
  - `/models` - Mongoose models for data entities
  - `/routes` - API routes for CRUD operations

## Technologies Used

- **Frontend**: React, TypeScript, ShadcnUI
- **Backend**: Node.js, Express
- **Database**: MongoDB Atlas (cloud-hosted)
- **Authentication**: Basic authentication with localStorage persistence
- **SMS/Verification**: Twilio API for SMS messages and phone verification

## Features

- User management
- Loan application and management
- Document upload and verification
- Admin dashboard with data analytics
- Persistent data storage with MongoDB
- Document management system with upload, preview, and verification
- Phone number verification with OTP
- Dark mode support in admin dashboard

## API Endpoints

- `/api/users` - User management
- `/api/loans` - Loan management
- `/api/documents` - Document management
- `/api/applications` - Application management
- `/api/migrate-data` - Data migration utility
- `/api/health` - API health check

## Document Management

For detailed information about the document management system, see [README-documents.md](README-documents.md).

## Project info

**URL**: https://lovable.dev/projects/66bcc46d-504a-4335-b8eb-58922b9e6a2e

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/66bcc46d-504a-4335-b8eb-58922b9e6a2e) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with .

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/66bcc46d-504a-4335-b8eb-58922b9e6a2e) and click on Share -> Publish.

## I want to use a custom domain - is that possible?

We don't support custom domains (yet). If you want to deploy your project under your own domain then we recommend using Netlify. Visit our docs for more details: [Custom domains](https://docs.lovable.dev/tips-tricks/custom-domain/)
