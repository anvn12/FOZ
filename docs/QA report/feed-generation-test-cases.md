# QA Test Cases: Feed Generation

Author: Nguyễn Hải Nam

## 1. Executive Summary

This document provides the QA Test Cases for the **Feed Generation** feature in FOZ. The test suite verifies the functional requirements for post recommendation and feed generation based on engagement metrics.

- **Feature Area**: Feed Generation
- **Functional Group**: Post Recommendation
- **Reference Documents**: 
  - README.md (Feed Generation feature description)
  - docs/1B. Project Proposal.md (Feed Generation features in FOZ)
- **Target User Roles**: Guest, Standard User, Moderator, Administrator
- **Status**: READY FOR TESTING

---

## 2. Functional Requirements

### 2.1 Core Feed Generation Requirement

From project documentation:
> "The application will generate a feed of posts based on current trends, calculated by recent engagement metrics like comment velocity and like counts. This ensures that users see content that is relevant to them, enhancing their overall experience on the platform."

### 2.2 Key Metrics for Feed Generation

- **Comment Velocity**: Rate of new comments on posts within a defined time window
- **Like Counts**: Total number of likes on posts
- **Recency Factor**: Consideration of post creation time in trend calculation
- **Trend Score**: Combined metric derived from engagement metrics

---

## 3. Detailed Test Cases

### 3.1 Feed Retrieval - Basic Functionality

| Test Case ID | Description | Preconditions | Test Steps | Expected Result | Priority |
|---|---|---|---|---|---|
| `FEED-001` | Guest user can view feed without authentication | System has posts in database | 1. Access feed endpoint as unauthenticated user<br>2. Verify response structure | Feed is returned with posts sorted by trend score<br>Status: 200 OK | High |
| `FEED-002` | Authenticated user can view personalized feed | User is logged in | 1. Access feed endpoint with valid auth token<br>2. Verify response structure | Feed is returned with posts sorted by trend score<br>Status: 200 OK | High |
| `FEED-003` | Empty feed when no posts exist | Database has no posts | 1. Access feed endpoint<br>2. Verify response structure | Empty feed array returned<br>Status: 200 OK | Medium |
| `FEED-004` | Feed pagination for large post sets | Database has 50+ posts | 1. Request feed with pagination parameters<br>2. Verify page size and structure | Correct number of posts per page<br>Proper pagination metadata | Medium |

### 3.2 Trend Score Calculation

| Test Case ID | Description | Preconditions | Test Steps | Expected Result | Priority |
|---|---|---|---|---|---|
| `FEED-TREND-001` | Posts with higher like counts appear higher in feed | Multiple posts with varying like counts | 1. Create posts with different like counts<br>2. Retrieve feed<br>3. Verify sorting order | Posts with more likes appear first | High |
| `FEED-TREND-002` | Posts with higher comment velocity appear higher in feed | Multiple posts with varying comment activity | 1. Create posts with different comment rates<br>2. Retrieve feed<br>3. Verify sorting order | Posts with higher comment velocity appear first | High |
| `FEED-TREND-003` | Trend score combines likes and comments appropriately | Posts with mixed engagement patterns | 1. Create posts with high likes/low comments and vice versa<br>2. Retrieve feed<br>3. Verify combined scoring | Trend score reflects weighted combination of metrics | High |
| `FEED-TREND-004` | Recency factor influences trend score | Posts from different time periods | 1. Create old and new posts with similar engagement<br>2. Retrieve feed<br>3. Verify time weighting | Newer posts with similar engagement may appear higher | Medium |
| `FEED-TREND-005` | Time window for trend calculation is respected | Posts with engagement outside time window | 1. Create posts with old engagement data<br>2. Retrieve feed<br>3. Verify excluded posts | Engagement outside time window doesn't affect score | Medium |

### 3.3 Feed Personalization

| Test Case ID | Description | Preconditions | Test Steps | Expected Result | Priority |
|---|---|---|---|---|---|
| `FEED-PERS-001` | Feed includes posts from users the authenticated user follows | User follows other users | 1. User follows specific users<br>2. Retrieve feed<br>3. Verify followed user posts appear | Posts from followed users are included/prioritized | Medium |
| `FEED-PERS-002` | Feed includes trending posts from all users | System has trending posts | 1. Retrieve feed<br>2. Verify post source diversity | Feed shows trending posts regardless of author | High |
| `FEED-PERS-003` | Feed respects user content preferences (if implemented) | User has set content preferences | 1. Configure user preferences<br>2. Retrieve feed<br>3. Verify content filtering | Feed prioritizes preferred content types | Low |

### 3.4 Feed Filtering and Options

| Test Case ID | Description | Preconditions | Test Steps | Expected Result | Priority |
|---|---|---|---|---|---|
| `FEED-FILTER-001` | Filter feed by time period (e.g., "Today", "This Week") | System has posts from various time periods | 1. Request feed with time filter<br>2. Verify post dates | Only posts within specified time period shown | Medium |
| `FEED-FILTER-002` | Filter feed by topic/category (if implemented) | System has categorized posts | 1. Request feed with category filter<br>2. Verify post categories | Only posts from specified category shown | Low |
| `FEED-FILTER-003` | Sort feed by different criteria (e.g., "Newest", "Most Liked") | System has posts with various metrics | 1. Request feed with sort parameter<br>2. Verify ordering | Feed sorted according to specified criteria | Medium |

### 3.5 Feed Performance and Scalability

| Test Case ID | Description | Preconditions | Test Steps | Expected Result | Priority |
|---|---|---|---|---|---|
| `FEED-PERF-001` | Feed response time within acceptable limits | Database has 100+ posts | 1. Measure feed endpoint response time<br>2. Verify performance threshold | Response time < 500ms (per constitution NFR) | High |
| `FEED-PERF-002` | Feed calculation doesn't block other operations | High concurrent load | 1. Simulate concurrent feed requests<br>2. Verify system stability | No blocking or performance degradation | High |
| `FEED-PERF-003` | Caching mechanism improves feed response time | Feed endpoint called repeatedly | 1. Request feed multiple times<br>2. Verify cache hit rate | Cached responses return faster | Medium |

### 3.6 Feed Data Integrity

| Test Case ID | Description | Preconditions | Test Steps | Expected Result | Priority |
|---|---|---|---|---|---|
| `FEED-DATA-001` | Feed post data includes all required fields | System has posts | 1. Retrieve feed<br>2. Verify post object structure | Each post contains id, author, body, metrics, timestamps | High |
| `FEED-DATA-002` | Feed post metrics are accurate and up-to-date | Posts with engagement | 1. Verify like/comment counts in feed<br>2. Compare with database | Metrics match actual database values | High |
| `FEED-DATA-003` | Feed excludes deleted or removed posts | Database has soft-deleted posts | 1. Create and delete posts<br>2. Retrieve feed<br>3. Verify exclusion | Deleted posts do not appear in feed | High |
| `FEED-DATA-004` | Feed excludes posts from banned/suspended users | Database has suspended user accounts | 1. Suspend user account<br>2. Retrieve feed<br>3. Verify exclusion | Posts from suspended users not shown | High |

### 3.7 Role-Based Feed Access

| Test Case ID | Description | Preconditions | Test Steps | Expected Result | Priority |
|---|---|---|---|---|---|
| `FEED-ROLE-001` | Guest users can view public feed | No authentication | 1. Access feed as guest<br>2. Verify response | Public feed returned without auth error | High |
| `FEED-ROLE-002` | Standard users can view personalized feed | User with Standard role | 1. Access feed with Standard user token<br>2. Verify response | Personalized feed returned | High |
| `FEED-ROLE-003` | Moderators can view all posts including reported ones | User with Moderator role | 1. Access feed with Moderator token<br>2. Verify content inclusion | Feed includes reported posts for review | Medium |
| `FEED-ROLE-004` | Administrators can view all posts including hidden ones | User with Administrator role | 1. Access feed with Admin token<br>2. Verify content inclusion | Feed includes all posts regardless of status | Medium |

### 3.8 Feed Error Handling

| Test Case ID | Description | Preconditions | Test Steps | Expected Result | Priority |
|---|---|---|---|---|---|
| `FEED-ERR-001` | Invalid pagination parameters handled gracefully | Feed endpoint called with invalid params | 1. Request feed with invalid page/limit<br>2. Verify error handling | Returns 422 with validation error | Medium |
| `FEED-ERR-002` | Database connection failure returns appropriate error | Database unavailable | 1. Simulate database failure<br>2. Request feed<br>3. Verify error response | Returns 503 Service Unavailable | High |
| `FEED-ERR-003` | Malformed authentication token handled properly | Invalid auth token | 1. Request feed with invalid token<br>2. Verify error response | Returns 401 Unauthorized | High |

---

## 4. Test Data Requirements

### 4.1 Test Data Sets

- **Posts with varying engagement**: Posts with 0, 1, 10, 50, 100+ likes
- **Posts with different comment velocities**: Posts with 0, 1, 5, 20+ comments per hour
- **Posts from different time periods**: Posts created minutes, hours, days, weeks ago
- **Posts from different user roles**: Posts from Standard, Moderator, Administrator users
- **Posts with different statuses**: Active, deleted, reported, hidden posts

### 4.2 Test User Accounts

- Guest (unauthenticated)
- Standard User with various engagement patterns
- Moderator account
- Administrator account
- Suspended/banned user account

---

## 5. Test Environment Setup

### 5.1 Prerequisites

- PostgreSQL database running on port 5432
- Test database `foz_test` configured
- Required test data populated
- Backend API server running
- Authentication system functional

### 5.2 Configuration

- Trend calculation time window configured
- Engagement metric weights defined
- Pagination limits set
- Cache configuration (if implemented)

---

## 6. Success Criteria

### 6.1 Functional Success

- All HIGH priority test cases pass
- At least 80% of MEDIUM priority test cases pass
- Feed generation consistently reflects engagement metrics
- All user roles can access appropriate feed content

### 6.2 Performance Success

- Feed response time < 500ms per constitution NFR
- System handles concurrent feed requests without degradation
- Trend calculation completes within acceptable time window

### 6.3 Data Integrity Success

- Feed data accurately reflects database state
- Metrics are calculated correctly
- Deleted/inappropriate content properly excluded

---

## 7. Test Execution Checklist

- [ ] Database test environment prepared
- [ ] Test data sets populated
- [ ] Test user accounts created
- [ ] Authentication system verified
- [ ] Feed generation configuration verified
- [ ] All test cases executed
- [ ] Results documented
- [ ] Performance metrics recorded
- [ ] Defects logged (if any)
- [ ] Retesting of fixes completed

---

## 8. Notes and Assumptions

### 8.1 Assumptions

- Feed generation uses engagement metrics as specified in project proposal
- Trend calculation algorithm is implemented according to design
- Time window for trend calculation is configurable
- Feed API endpoints follow the `/api/v1` routing convention

### 8.2 Known Limitations

- Test cases assume basic feed generation without advanced ML/AI recommendations
- Personalization features may be limited in initial implementation
- Some filtering options may not be available in MVP

### 8.3 Dependencies

- Post Creation feature must be functional to create test data
- User Interactions (likes, comments) must be functional to generate engagement metrics
- Authentication system must be functional for role-based testing
