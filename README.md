# SafeStart Vehicle Inspection Platform API

A comprehensive RESTful API for managing vehicle inspections, checklists, and maintenance tracking in a multi-tenant environment.

## 🚀 Features

- **Multi-tenant Architecture**: Complete tenant isolation with company-based data segregation
- **Vehicle Management**: Full CRUD operations for vehicle fleet management
- **Inspection Workflows**: Create, manage, and track vehicle inspections
- **Checklist Templates**: Customizable inspection checklists with item management
- **Issue Tracking**: Report and track vehicle issues with severity levels
- **Real-time Notifications**: User notification system for important events
- **Audit Logging**: Comprehensive audit trail for all system actions
- **Data Export**: CSV export functionality for reports and analytics
- **JWT Authentication**: Secure authentication with role-based access control
- **Input Validation**: Robust validation using express-validator
- **Rate Limiting**: API rate limiting for security and performance

## 🛠 Tech Stack

- **Runtime**: Node.js 20
- **Framework**: Express.js
- **Database**: Supabase PostgreSQL
- **Authentication**: JWT with bcrypt
- **Validation**: express-validator
- **Security**: Helmet, CORS, Rate Limiting
- **Email**: Resend (configured)
- **SMS**: Twilio (configured)

## 📋 Prerequisites

- Node.js 20 or higher
- npm or yarn
- Supabase account and project
- Environment variables configured

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd safestart_backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Supabase Configuration
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

   # JWT Configuration
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRES_IN=24h

   # Email Configuration (Resend)
   RESEND_API_KEY=your_resend_api_key
   FROM_EMAIL=noreply@yourdomain.com

   # SMS Configuration (Twilio)
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_phone_number
   ```

4. **Database Setup**
   Run the SQL script in `src/db/script.sql` in your Supabase SQL editor to create all necessary tables.

5. **Start the server**
   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication

All protected endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Endpoints Overview

#### Authentication (`/auth`)
- `POST /register` - Register a new user
- `POST /login` - User login
- `POST /refresh` - Refresh JWT token
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password with token

#### Users (`/users`)
- `GET /me` - Get current user profile
- `GET /` - List users (Admin only)
- `PATCH /:id` - Update user profile

#### Companies (`/companies`)
- `GET /:id` - Get company details
- `PATCH /:id` - Update company details

#### Vehicles (`/vehicles`)
- `POST /` - Create a new vehicle
- `GET /` - List vehicles with filtering and pagination
- `GET /:id` - Get vehicle details
- `PATCH /:id` - Update vehicle
- `DELETE /:id` - Soft delete vehicle

#### Templates (`/templates`)
- `POST /` - Create a new checklist template
- `GET /` - List templates with filtering and pagination
- `GET /:id` - Get template with items
- `PATCH /:id` - Update template
- `DELETE /:id` - Soft delete template
- `POST /:id/items` - Add item to template
- `PATCH /:id/items/:itemId` - Update template item
- `DELETE /:id/items/:itemId` - Delete template item
- `POST /:id/items/reorder` - Reorder template items

#### Inspections (`/inspections`)
- `POST /` - Create a new inspection
- `GET /` - List inspections with filtering and pagination
- `GET /stats` - Get inspection statistics
- `GET /export/csv` - Export inspections to CSV
- `GET /:id` - Get inspection with answers
- `PATCH /:id` - Update inspection
- `POST /:id/answers` - Submit inspection answers

#### Issues (`/issues`)
- `POST /` - Create a new issue
- `GET /` - List issues with filtering and pagination
- `GET /stats` - Get issue statistics
- `GET /:id` - Get issue details
- `PATCH /:id` - Update issue
- `PATCH /:id/resolve` - Resolve issue (Admin/Supervisor only)

#### Notifications (`/notifications`)
- `GET /` - List user notifications
- `GET /unread-count` - Get unread notification count
- `PATCH /:id/read` - Mark notification as read
- `PATCH /mark-all-read` - Mark all notifications as read

### Request/Response Format

#### Standard Response Format
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data
  },
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10
  }
}
```

#### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

### Pagination

List endpoints support pagination with the following query parameters:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `sortBy` - Sort field (default: 'created_at')
- `sortOrder` - Sort direction: 'asc' or 'desc' (default: 'desc')

### Filtering

Most list endpoints support filtering with query parameters:
- `search` - Text search across relevant fields
- `status` - Filter by status
- `start_date` - Filter by start date
- `end_date` - Filter by end date

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage
- **Input Validation**: Comprehensive validation for all inputs
- **Rate Limiting**: Protection against brute force attacks
- **CORS**: Cross-origin resource sharing configuration
- **Helmet**: Security headers
- **Tenant Isolation**: Complete data isolation between companies

## 📊 Database Schema

The application uses the following main tables:
- `companies` - Company information
- `users` - User accounts with roles
- `vehicles` - Vehicle fleet management
- `checklist_templates` - Inspection templates
- `checklist_items` - Individual checklist items
- `inspections` - Vehicle inspections
- `inspection_answers` - Inspection responses
- `issues` - Vehicle issues and faults
- `notifications` - User notifications
- `audit_logs` - System audit trail

## 🚀 Deployment

### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
SUPABASE_URL=your_production_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
JWT_SECRET=your_strong_jwt_secret
RESEND_API_KEY=your_resend_api_key
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
```

### Docker Deployment
```bash
# Build Docker image
docker build -t safestart-api .

# Run container
docker run -p 5000:5000 --env-file .env safestart-api
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📝 API Examples

### Create a Vehicle
```bash
curl -X POST http://localhost:5000/api/v1/vehicles \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Truck 001",
    "license_plate": "ABC123",
    "make": "Ford",
    "model": "F-150",
    "year": 2020,
    "vin": "1FTEW1EG0JFA12345"
  }'
```

### Create an Inspection
```bash
curl -X POST http://localhost:5000/api/v1/inspections \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "vehicle_id": 1,
    "template_id": 1,
    "notes": "Daily pre-start inspection"
  }'
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Changelog

### v1.0.0
- Initial release
- Complete CRUD operations for all entities
- Multi-tenant architecture
- JWT authentication
- Audit logging
- CSV export functionality