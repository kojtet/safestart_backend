# SafeStart API Documentation

## Overview
SafeStart is a comprehensive vehicle inspection platform that helps companies manage vehicle safety, maintenance, and compliance through systematic inspections and issue tracking.

## Base URL
```
http://localhost:3000/api/v1
```

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Getting Started

### 1. Bootstrap Admin (First Time Setup)
Before using the API, you need to create the initial admin user and company.

**Endpoint:** `POST /auth/bootstrap-admin`

**Request Body:**
```json
{
  "company_name": "SafeStart Company",
  "company_address": "123 Safety Street, City, State 12345",
  "company_phone": "+1234567890",
  "company_email": "info@safestart.com",
  "admin_full_name": "Admin User",
  "admin_email": "admin@safestart.com",
  "admin_password": "admin123456",
  "admin_phone": "+1234567890"
}
```

**Response:**
```json
{
  "message": "Admin user and company created successfully",
  "token": "jwt_token_here",
  "user": {
    "id": "user_uuid",
    "full_name": "Admin User",
    "email": "admin@safestart.com",
    "role": "admin",
    "company_id": "company_uuid"
  },
  "company": {
    "id": "company_uuid",
    "name": "SafeStart Company",
    "address": "123 Safety Street, City, State 12345",
    "phone": "+1234567890",
    "email": "info@safestart.com"
  }
}
```

### 2. Login
**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "admin@safestart.com",
  "password": "admin123456"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_uuid",
    "full_name": "Admin User",
    "email": "admin@safestart.com",
    "role": "admin",
    "company_id": "company_uuid"
  }
}
```

## API Endpoints

### Authentication
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/bootstrap-admin` | Create initial admin user and company | No |
| POST | `/auth/register` | Register new user | Yes (Admin) |
| POST | `/auth/login` | User login | No |
| POST | `/auth/refresh` | Refresh access token | No |
| POST | `/auth/forgot-password` | Request password reset | No |
| POST | `/auth/reset-password` | Reset password with token | No |

### Users
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/users/me` | Get current user profile | Yes |
| GET | `/users` | List all users in company | Yes |

### Vehicles
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/vehicles` | Create new vehicle | Yes |
| GET | `/vehicles` | List all vehicles | Yes |
| GET | `/vehicles/:id` | Get vehicle by ID | Yes |
| PATCH | `/vehicles/:id` | Update vehicle | Yes |
| DELETE | `/vehicles/:id` | Delete vehicle | Yes |

### Inspections
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/inspections` | Create new inspection | Yes |
| GET | `/inspections` | List all inspections | Yes |
| GET | `/inspections/stats` | Get inspection statistics | Yes |
| GET | `/inspections/export/csv` | Export inspections to CSV | Yes |
| GET | `/inspections/:id` | Get inspection by ID | Yes |
| PATCH | `/inspections/:id` | Update inspection | Yes |

### Issues
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/issues` | Create new issue | Yes |
| GET | `/issues` | List all issues | Yes |
| GET | `/issues/stats` | Get issue statistics | Yes |
| GET | `/issues/:id` | Get issue by ID | Yes |
| PATCH | `/issues/:id` | Update issue | Yes |
| PATCH | `/issues/:id/resolve` | Resolve issue | Yes |

### Templates
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/templates` | Create new template | Yes |
| GET | `/templates` | List all templates | Yes |
| GET | `/templates/:id` | Get template by ID | Yes |
| PATCH | `/templates/:id` | Update template | Yes |
| DELETE | `/templates/:id` | Delete template | Yes |
| POST | `/templates/:id/items` | Add item to template | Yes |
| PATCH | `/templates/:id/items/:itemId` | Update template item | Yes |
| DELETE | `/templates/:id/items/:itemId` | Delete template item | Yes |
| POST | `/templates/:id/items/reorder` | Reorder template items | Yes |

### Companies
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/companies/:id` | Get company details | Yes |
| PATCH | `/companies/:id` | Update company | Yes |

### Notifications
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/notifications` | List notifications | Yes |
| GET | `/notifications/unread-count` | Get unread count | Yes |
| PATCH | `/notifications/:id/read` | Mark as read | Yes |
| PATCH | `/notifications/mark-all-read` | Mark all as read | Yes |

## Data Models

### User
```json
{
  "id": "uuid",
  "company_id": "uuid",
  "full_name": "string",
  "email": "string",
  "role": "admin|supervisor|driver|mechanic",
  "phone": "string (optional)",
  "is_active": "boolean",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### Vehicle
```json
{
  "id": "uuid",
  "company_id": "uuid",
  "name": "string",
  "type": "truck|car|van|bus|other",
  "make": "string",
  "model": "string",
  "year": "integer",
  "license_plate": "string",
  "vin": "string",
  "color": "string",
  "fuel_type": "gasoline|diesel|electric|hybrid",
  "mileage": "integer",
  "status": "active|maintenance|inactive",
  "description": "string (optional)",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### Inspection
```json
{
  "id": "uuid",
  "vehicle_id": "uuid",
  "template_id": "uuid (optional)",
  "inspector_id": "uuid",
  "type": "prestart|scheduled|maintenance",
  "status": "scheduled|in_progress|completed|cancelled",
  "scheduled_date": "datetime",
  "due_date": "datetime",
  "started_date": "datetime (optional)",
  "completed_date": "datetime (optional)",
  "description": "string (optional)",
  "notes": "string (optional)",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### Issue
```json
{
  "id": "uuid",
  "vehicle_id": "uuid",
  "title": "string",
  "description": "string",
  "priority": "low|medium|high|critical",
  "category": "safety|mechanical|electrical|cosmetic",
  "status": "open|in_progress|resolved|closed",
  "reported_by": "uuid",
  "assigned_to": "uuid (optional)",
  "location": "string (optional)",
  "resolution_notes": "string (optional)",
  "resolved_by": "uuid (optional)",
  "resolved_at": "datetime (optional)",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### Template
```json
{
  "id": "uuid",
  "company_id": "uuid",
  "name": "string",
  "description": "string (optional)",
  "type": "prestart|scheduled|maintenance",
  "category": "safety|maintenance|compliance",
  "is_active": "boolean",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### Template Item
```json
{
  "id": "uuid",
  "template_id": "uuid",
  "question": "string",
  "type": "boolean|text|number|select",
  "required": "boolean",
  "order": "integer",
  "category": "string (optional)",
  "options": "array (optional, for select type)",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### Company
```json
{
  "id": "uuid",
  "name": "string",
  "address": "string (optional)",
  "phone": "string (optional)",
  "email": "string (optional)",
  "website": "string (optional)",
  "industry": "string (optional)",
  "size": "small|medium|large (optional)",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### Notification
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "title": "string",
  "message": "string",
  "type": "info|warning|error|success",
  "is_read": "boolean",
  "data": "object (optional)",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

## Error Responses

### Validation Error (400)
```json
{
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email address"
    }
  ]
}
```

### Authentication Error (401)
```json
{
  "message": "Invalid credentials."
}
```

### Authorization Error (403)
```json
{
  "message": "Access denied. Insufficient permissions."
}
```

### Not Found Error (404)
```json
{
  "message": "Resource not found."
}
```

### Conflict Error (409)
```json
{
  "message": "Email already in use."
}
```

### Server Error (500)
```json
{
  "message": "Server error."
}
```

## Rate Limiting
- Authentication endpoints: 5 requests per 15 minutes
- All other endpoints: 100 requests per 15 minutes

## Environment Variables
See `ENVIRONMENT_VARIABLES.md` for complete list of required environment variables.

## Postman Collection
Import `SafeStart_API.postman_collection.json` into Postman for a complete set of pre-configured requests.

## Testing the API

### 1. Start the server
```bash
npm install
npm run dev
```

### 2. Bootstrap admin user
```bash
curl -X POST http://localhost:3000/api/v1/auth/bootstrap-admin \
  -H "Content-Type: application/json" \
  -d '{
    "company_name": "Test Company",
    "admin_full_name": "Admin User",
    "admin_email": "admin@test.com",
    "admin_password": "password123"
  }'
```

### 3. Login and get token
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "password123"
  }'
```

### 4. Use token for authenticated requests
```bash
curl -X GET http://localhost:3000/api/v1/users/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
``` 