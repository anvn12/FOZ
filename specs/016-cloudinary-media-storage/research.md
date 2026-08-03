# Phase 0: Research & Technical Decisions for Cloudinary Media Storage

## 1. Cloudinary Upload Architecture: Backend Signed Upload vs Unsigned Upload

- **Decision**: Backend-assisted Signed Uploads using Cloudinary Node SDK on Express server.
- **Rationale**: 
  - Signed uploads enforce authentication (`JWT`) and authorization at the Express API boundary, preventing unauthenticated guests from abusing the Cloudinary free-tier quota.
  - Server-side signed upload API accepts `multipart/form-data` file uploads, performs MIME type/size validation via Zod, uploads to Cloudinary using `cloudinary.v2.uploader.upload_stream` (or `upload`), and returns a secure HTTPS URL along with the Cloudinary `public_id`.
  - Client application never receives sensitive credentials (`CLOUDINARY_API_SECRET`).
- **Alternatives Considered**:
  - *Direct Unsigned Client Uploads*: Requires an unsigned upload preset in Cloudinary. Discarded because anyone with the cloud name and preset name could spam uploads and exhaust free-tier limits.
  - *Pre-signed Upload Signatures for Direct Browser-to-Cloudinary Uploads*: Generates signature on backend and posts directly from browser to Cloudinary. Good for huge files, but adds complex 2-step client orchestration. For standard image attachments (<5MB), backend multipart upload with streaming buffer is simpler and more secure.

## 2. Cloudinary Node.js SDK & Dependencies

- **Decision**: Use `cloudinary` Node SDK for backend streaming uploads.
- **Rationale**:
  - `cloudinary` package provides standard Node stream support (`upload_stream`) compatible with `multer` memory storage.
  - Express backend streams buffer directly to Cloudinary without writing temporary files to the Render backend's ephemeral disk.
- **Alternatives Considered**:
  - *Raw REST API fetch calls to Cloudinary upload endpoint*: Avoids adding `cloudinary` npm dependency, but manual signature calculation and multipart body building is error-prone. The `cloudinary` SDK is lightweight and standard.

## 3. Storage & Metadata Persistence Strategy

- **Decision**: Store the Cloudinary `public_id` and secure HTTPS `secure_url` in the database records (e.g. user profile `avatarUrl`, post attachment URLs or media table).
- **Rationale**:
  - `secure_url` provides direct HTTPS CDN delivery.
  - `public_id` is essential for lifecycle actions (e.g. deleting an image via `cloudinary.v2.uploader.destroy(public_id)` when a post or avatar is updated/deleted).
- **Alternatives Considered**:
  - *Storing full URL only*: Works for display, but prevents deleting assets from Cloudinary when posts are removed, causing storage bloat over time.

## 4. Image Transformation & Delivery Optimization

- **Decision**: Apply Cloudinary dynamic URL transformations (e.g., auto format `f_auto`, auto quality `q_auto`, max width constraint `w_1200,c_limit`) when serving images.
- **Rationale**:
  - Cloudinary automatically serves WebP/AVIF format based on browser support.
  - Reduces bandwidth consumption on free tiers on Vercel/Render.
- **Alternatives Considered**:
  - *Client-side canvas compression prior to upload*: Already implemented in feature `014-image-upload-compression` for frontend pre-validation. Cloudinary `f_auto,q_auto` complements frontend pre-compression for maximum optimization.

## 5. Deletion & Cleanup Strategy

- **Decision**: Implement server-side media deletion endpoint/service method using `cloudinary.v2.uploader.destroy(public_id)`.
- **Rationale**:
  - Ensures free-tier quota is reclaimed when user deletes a post or replaces profile avatar.
  - Deletion is performed asynchronously or inside database deletion hooks.
