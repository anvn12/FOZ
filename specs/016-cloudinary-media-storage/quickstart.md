# Quickstart Guide: Cloudinary Media Storage Integration

## Overview

This guide describes how to configure, test, and use the Cloudinary Media Storage Integration for uploading and serving images in FOZ.

## Environment Setup

1. **Obtain Free-Tier Cloudinary Credentials**:
   - Sign up for a free Cloudinary account at [cloudinary.com](https://cloudinary.com).
   - In your Cloudinary Dashboard, locate:
     - `Cloud Name`
     - `API Key`
     - `API Secret`

2. **Configure Environment Variables**:
   Add the following variables to `.env` (and `.env.example`):

   ```env
   # Cloudinary Media Storage Credentials
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

3. **Install Backend Dependency** (if not present):
   ```bash
   npm install cloudinary
   ```

## Development & Testing Workflow

1. **Start Local Backend Server**:
   ```bash
   npm run dev:backend
   ```

2. **Test Cloudinary Upload Endpoint**:
   Use `curl` or Postman to test uploading an image via the Express API route:

   ```bash
   curl -X POST http://localhost:4000/api/v1/upload/cloudinary \
     -H "Authorization: Bearer <your_jwt_token>" \
     -F "file=@/path/to/test-image.jpg" \
     -F "folder=avatars"
   ```

   **Expected Response**:
   ```json
   {
     "success": true,
     "data": {
       "publicId": "foz_uploads/avatars/sample_123",
       "url": "https://res.cloudinary.com/your_cloud_name/image/upload/v1600000000/foz_uploads/avatars/sample_123.jpg",
       "format": "jpg",
       "width": 800,
       "height": 600,
       "bytes": 124500,
       "resourceType": "image",
       "createdAt": "2026-08-02T23:15:00.000Z"
     }
   }
   ```

3. **Test Media Deletion Endpoint**:
   ```bash
   curl -X DELETE http://localhost:4000/api/v1/upload/cloudinary/foz_uploads%2Favatars%2Fsample_123 \
     -H "Authorization: Bearer <your_jwt_token>"
   ```

   **Expected Response**:
   ```json
   {
     "success": true,
     "result": "ok"
   }
   ```
