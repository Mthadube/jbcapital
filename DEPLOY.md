# Deploying JB Capital to Render

This guide explains how to deploy the JB Capital application to Render.

## Prerequisites

- A Render account
- Your code pushed to a GitHub repository
- MongoDB Atlas database (or any other MongoDB provider)

## Deployment Steps

### 1. Set up MongoDB Atlas (if not already done)

1. Create a MongoDB Atlas account if you don't have one
2. Create a new cluster
3. Get your MongoDB connection string

### 2. Deploy to Render

#### Option 1: Using the Dashboard

1. Log in to Render
2. Click "New +" and select "Web Service"
3. Connect your GitHub repository
4. Use the following settings:
   - **Name**: jbcapital (or your preferred name)
   - **Environment**: Node
   - **Build Command**: `npm run render-build`
   - **Start Command**: `npm start`
5. Add the following environment variables:
   - `NODE_ENV`: production
   - `PORT`: 10000
   - `MONGODB_URI`: Your MongoDB connection string
   - Add any other required environment variables
6. Click "Create Web Service"

#### Option 2: Using render.yaml (Blueprint)

1. Ensure the render.yaml file is in your repository
2. In Render, click "New +" and select "Blueprint"
3. Connect your GitHub repository
4. Follow the prompts to deploy
5. Make sure to add your `MONGODB_URI` environment variable

## Troubleshooting

- If you encounter build errors, check the build logs in Render
- If the app crashes on startup, check the logs for error messages
- Ensure your MongoDB connection string is correct and accessible from Render
- Verify that all environment variables are set correctly

## Accessing Your Deployed Application

Once deployed, your application will be available at:
`https://your-service-name.onrender.com`

## Additional Resources

- [Render Documentation](https://render.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/) 