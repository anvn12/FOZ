# Feature Specification: Cloudinary Media Storage Integration

**Feature Branch**: `016-cloudinary-media-storage`

**Created**: 2026-08-02

**Status**: Draft

**Input**: User description: "I am currently hosting my server using Neon (for postgres), Render (for backend), Vercel (for frontend), all are free tier no card requried. I want to integrate a cloud service (Cloudinary) to my system to store my app data. Do it for me"

## Clarifications

### Session 2026-08-02

- Q: What types of application data should Cloudinary store in your architecture? → A: User media assets only (avatars, post image & video attachments)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Secure Media Upload and Storage (Priority: P1)

As an authenticated user creating content or updating my profile, I want to upload image assets (such as avatars, post media, and thread images) so that they are reliably stored in cloud media storage and rendered across the application without consuming server disk space.

**Why this priority**: Storing media assets in persistent cloud storage is fundamental for hosted free-tier backends (like Render) which have ephemeral filesystems and cannot store user-uploaded files locally.

**Independent Test**: Can be fully tested by uploading an image when creating a post or updating a user avatar, and verifying that the returned media URL displays correctly across different devices and page reloads.

**Acceptance Scenarios**:

1. **Given** an authenticated user on the post creation or profile page, **When** they select an image file and submit, **Then** the media asset is uploaded to cloud media storage and a secure, public media URL is saved and displayed in the UI.
2. **Given** a user attempting to upload an unsupported file format or a file exceeding the maximum size limit, **When** they submit the file, **Then** the system rejects the upload with a clear, user-friendly error message before consuming storage quota.

---

### User Story 2 - Media Retrieval and Optimized Delivery (Priority: P2)

As an application user viewing feeds, posts, or profiles, I want uploaded images to load quickly and reliably so that I have a smooth, performant browsing experience.

**Why this priority**: Fast image loading directly impacts user retention and engagement on free-tier hosting platforms with limited bandwidth.

**Independent Test**: Can be verified by loading a feed containing multiple posts with images and verifying that all image URLs resolve successfully from cloud storage with optimized delivery.

**Acceptance Scenarios**:

1. **Given** a user navigating to a feed or post view containing user-uploaded media, **When** the page renders, **Then** all media assets load directly from the cloud delivery network within 2 seconds.
2. **Given** a post with a previously uploaded image, **When** the image is rendered in the UI, **Then** the application uses the responsive image URL provided by cloud storage.

---

### User Story 3 - Media Deletion and Cleanup (Priority: P3)

As a content owner or administrator deleting a post or profile image, I want the associated cloud media asset to be removed or unlinked so that obsolete files do not consume storage limits unnecessarily.

**Why this priority**: Free-tier cloud storage accounts have strict storage capacity limits; managing asset lifecycle prevents quota exhaustion.

**Independent Test**: Can be tested by deleting a post with an attached image and verifying that the media link is cleared from the database and removed from active storage.

**Acceptance Scenarios**:

1. **Given** a user deleting their post containing an uploaded image, **When** the deletion is confirmed, **Then** the image entry is removed from application storage and deleted or flagged for cleanup in cloud storage.

---

### Edge Cases

- What happens when the cloud storage account reaches its free-tier storage or bandwidth limit?
- How does the system handle temporary network failure during file upload?
- What happens if a user submits a corrupted or empty file?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to upload image media assets (e.g. avatars, post attachments) directly to cloud storage.
- **FR-002**: System MUST validate file extension, MIME type, and maximum file size before initiating cloud storage upload.
- **FR-003**: System MUST store and return persistent, HTTPS-secured URLs for all uploaded media assets.
- **FR-004**: System MUST handle cloud service authentication securely using environment configuration without exposing private credentials to the client.
- **FR-005**: System MUST scope Cloudinary cloud storage usage strictly to user binary media assets (profile avatars, post images/videos, and thread media).

### Key Entities *(include if feature involves data)*

- **Media Asset**: Represents an uploaded file in cloud storage, including properties such as unique cloud identifier, secure URL, file format, size in bytes, upload timestamp, and owner reference.
- **User Profile / Post Attachment**: Existing domain entities linked to a Media Asset via its secure public URL or asset identifier.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Media uploads complete successfully in under 3 seconds for standard image sizes (under 5MB) on standard connections.
- **SC-002**: 100% of uploaded media assets are delivered over secure HTTPS URLs without broken image links across browser sessions.
- **SC-003**: Zero sensitive cloud storage credentials or private API secrets are exposed in client-side bundles or public API responses.
- **SC-004**: Application media functionality remains operational within free-tier resource bounds on hosted environments.

## Assumptions

- Free-tier Cloudinary account credentials (cloud name, API key, API secret) will be provided via environment variables in production and local environments.
- Relational database data (users, posts, threads) will remain hosted in Neon PostgreSQL, while binary media assets are stored in Cloudinary.
- Frontend assets are deployed on Vercel and backend services on Render free tiers.
