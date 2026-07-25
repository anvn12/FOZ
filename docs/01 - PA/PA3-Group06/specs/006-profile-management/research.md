# Research: Profile Management Avatar Storage Strategy

## Decision
User avatars will be uploaded as images, converted to Base64 data URLs on the client/server, and stored directly in the `profiles` table's `avatar_url` text column in the PostgreSQL database.

## Rationale
1. **Stateless Backend**: The Express application stays completely stateless, making deployments, scaling, and container management (e.g. Docker) simple since there are no local folders to synchronize or persist across ephemeral instances.
2. **Unified Data & Backups**: Database backups (via pg_dump or similar) automatically include all user avatars. There is no risk of orphaned files or broken links.
3. **MIME/Type Preservation**: Storing them as standard Data URLs (e.g., `data:image/png;base64,...`) makes them self-describing. The frontend can render them directly inside standard `<img>` tags without needing custom stream routes or headers.
4. **Simple API**: We can leverage existing JSON payloads or simple Base64 POST requests, keeping the API simple and avoiding complex multipart file uploads in backend middleware.

## Alternatives Considered
1. **Local Server Disk Storage (Option A)**:
   - *Why rejected*: Ephemeral hosting environments wipe out local files on deploy/restart. Synchronizing files across multiple server instances requires network file systems or persistent volumes, adding deployment complexity.
2. **Cloud/External Object Storage (Option C)**:
   - *Why rejected*: Out of scope and adds unnecessary dependencies (AWS S3, Cloudinary API keys, client configuration) for a lightweight MVP forum application.
3. **BYTEA Binary Storage in PG**:
   - *Why rejected*: Storing raw binary requires implementing a custom streaming route in Express with manual MIME-type and Cache-Control headers. Base64 in a text field is much simpler to handle in both React and Drizzle.
