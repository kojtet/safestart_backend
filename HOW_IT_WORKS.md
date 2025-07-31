# How SafeStart Vehicle Inspection Platform Works

This document explains how each component of the SafeStart Vehicle Inspection Platform works, including the relationships between controllers, models, and routes.

## 🏗️ Architecture Overview

The platform follows a **Model-View-Controller (MVC)** pattern with clear separation of concerns:

- **Controllers**: Handle HTTP requests, validate input, and return responses
- **Models**: Manage database operations and business logic
- **Routes**: Define API endpoints and connect them to controllers
- **Middleware**: Handle authentication, validation, and security

## 🔐 Authentication System

### AuthController + AuthRoutes + UserModel

**Purpose**: Manages user authentication, registration, and password reset functionality.

**Key Features**:
- User registration with company association
- JWT-based login with role-based access
- Password reset via email tokens
- Token refresh mechanism
- Secure password hashing with bcrypt

**How It Works**:
1. **Registration**: Creates new user with hashed password and company association
2. **Login**: Validates credentials and returns JWT token with user info
3. **Password Reset**: Generates secure token, sends email, allows password update
4. **Token Refresh**: Validates existing token and issues new one

**Routes**:
- `POST /auth/register` - Create new user account
- `POST /auth/login` - Authenticate user and get token
- `POST /auth/refresh` - Refresh JWT token
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password with token

## 👥 User Management

### UserController + UserRoutes + UserModel

**Purpose**: Manages user profiles and user listing for administrators.

**Key Features**:
- Get current user profile
- List all users in company (admin only)
- Update user profile information
- Role-based access control

**How It Works**:
1. **Profile Management**: Users can view and update their own profiles
2. **User Listing**: Admins can see all users in their company
3. **Tenant Isolation**: Users can only access data from their own company

**Routes**:
- `GET /users/me` - Get current user profile
- `GET /users` - List all users (admin only)
- `PATCH /users/:id` - Update user profile

## 🏢 Company Management

### CompanyController + CompanyRoutes + CompanyModel

**Purpose**: Manages company information and settings.

**Key Features**:
- View company details
- Update company information
- Tenant isolation enforcement

**How It Works**:
1. **Company Access**: Users can only access their own company data
2. **Profile Management**: Admins can update company details
3. **Data Isolation**: Complete separation between different companies

**Routes**:
- `GET /companies/:id` - Get company details
- `PATCH /companies/:id` - Update company information

## 🚗 Vehicle Fleet Management

### VehicleController + VehicleRoutes + VehicleModel

**Purpose**: Manages the vehicle fleet for each company.

**Key Features**:
- Create, read, update, delete vehicles
- License plate validation and uniqueness
- Vehicle status tracking
- Filtering and pagination
- Soft delete functionality

**How It Works**:
1. **Vehicle Creation**: Validates license plate uniqueness within company
2. **Fleet Management**: Complete CRUD operations with company isolation
3. **Status Tracking**: Track vehicle status (active, inactive, maintenance)
4. **Search & Filter**: Find vehicles by various criteria

**Routes**:
- `POST /vehicles` - Create new vehicle
- `GET /vehicles` - List vehicles with filtering
- `GET /vehicles/:id` - Get vehicle details
- `PATCH /vehicles/:id` - Update vehicle
- `DELETE /vehicles/:id` - Soft delete vehicle

## 📋 Checklist Template Management

### TemplateController + TemplateRoutes + TemplateModel

**Purpose**: Manages customizable inspection checklists and their items.

**Key Features**:
- Create and manage inspection templates
- Add, edit, and reorder checklist items
- Template versioning and soft delete
- Item type support (yes/no, text, multiple choice)

**How It Works**:
1. **Template Creation**: Create reusable inspection templates
2. **Item Management**: Add questions with different response types
3. **Ordering**: Reorder items for logical inspection flow
4. **Soft Delete**: Templates can be deactivated without losing data

**Routes**:
- `POST /templates` - Create new template
- `GET /templates` - List templates
- `GET /templates/:id` - Get template with items
- `PATCH /templates/:id` - Update template
- `DELETE /templates/:id` - Soft delete template
- `POST /templates/:id/items` - Add template item
- `PATCH /templates/:id/items/:itemId` - Update template item
- `DELETE /templates/:id/items/:itemId` - Delete template item
- `POST /templates/:id/items/reorder` - Reorder template items

## 🔍 Inspection Workflow

### InspectionController + InspectionRoutes + InspectionModel

**Purpose**: Manages the complete vehicle inspection process.

**Key Features**:
- Create inspections from templates
- Submit inspection answers
- Track inspection status and completion
- Generate inspection reports
- CSV export functionality
- Statistical analysis

**How It Works**:
1. **Inspection Creation**: Start new inspection for specific vehicle and template
2. **Answer Submission**: Record responses to checklist items
3. **Status Tracking**: Monitor inspection progress (pending, in-progress, completed)
4. **Reporting**: Generate reports and export data
5. **Statistics**: Track inspection metrics and trends

**Routes**:
- `POST /inspections` - Create new inspection
- `GET /inspections` - List inspections with filtering
- `GET /inspections/stats` - Get inspection statistics
- `GET /inspections/export/csv` - Export inspections to CSV
- `GET /inspections/:id` - Get inspection with answers
- `PATCH /inspections/:id` - Update inspection
- `POST /inspections/:id/answers` - Submit inspection answers

## ⚠️ Issue Tracking

### IssueController + IssueRoutes + IssueModel

**Purpose**: Manages vehicle fault reporting and resolution.

**Key Features**:
- Report vehicle issues with severity levels
- Track issue resolution status
- Photo attachment support
- Resolution notes and tracking
- Statistical reporting

**How It Works**:
1. **Issue Reporting**: Drivers can report vehicle problems
2. **Severity Classification**: Issues categorized as low, medium, or critical
3. **Resolution Tracking**: Admins/supervisors can resolve issues
4. **Photo Evidence**: Support for photo attachments
5. **Status Monitoring**: Track from reported to resolved

**Routes**:
- `POST /issues` - Create new issue
- `GET /issues` - List issues with filtering
- `GET /issues/stats` - Get issue statistics
- `GET /issues/:id` - Get issue details
- `PATCH /issues/:id` - Update issue
- `PATCH /issues/:id/resolve` - Resolve issue (admin/supervisor only)

## 🔔 Notification System

### NotificationController + NotificationRoutes + NotificationModel

**Purpose**: Manages user notifications for important events.

**Key Features**:
- Real-time notifications
- Read/unread status tracking
- Notification types and categories
- Bulk operations

**How It Works**:
1. **Notification Creation**: System generates notifications for events
2. **Status Tracking**: Track read/unread status
3. **User-specific**: Notifications are company and user-specific
4. **Bulk Operations**: Mark all notifications as read

**Routes**:
- `GET /notifications` - List user notifications
- `GET /notifications/unread-count` - Get unread count
- `PATCH /notifications/:id/read` - Mark notification as read
- `PATCH /notifications/mark-all-read` - Mark all as read

## 🔒 Security & Middleware

### Authentication Middleware

**Purpose**: Protects routes and validates user sessions.

**How It Works**:
1. **Token Validation**: Verifies JWT tokens on protected routes
2. **User Context**: Attaches user information to request object
3. **Role Checking**: Validates user permissions for specific actions
4. **Company Isolation**: Ensures users only access their company's data

### Validation Middleware

**Purpose**: Validates input data before processing.

**How It Works**:
1. **Input Sanitization**: Cleans and validates request data
2. **Schema Validation**: Ensures data matches expected format
3. **Error Handling**: Returns detailed validation errors
4. **Security**: Prevents malicious input

## 📊 Data Flow Examples

### Creating a Vehicle Inspection

1. **Route**: `POST /inspections`
2. **Controller**: `InspectionController.createInspection()`
3. **Validation**: Check vehicle and template exist, belong to company
4. **Model**: `InspectionModel.createInspection()` - Save to database
5. **Audit**: Log the action via `auditLogger`
6. **Response**: Return inspection with answers

### Reporting a Vehicle Issue

1. **Route**: `POST /issues`
2. **Controller**: `IssueController.createIssue()`
3. **Validation**: Verify vehicle belongs to user's company
4. **Model**: `IssueModel.createIssue()` - Save issue to database
5. **Notification**: Create notification for supervisors
6. **Audit**: Log the action
7. **Response**: Return complete issue details

### Exporting Inspection Data

1. **Route**: `GET /inspections/export/csv`
2. **Controller**: `InspectionController.exportInspections()`
3. **Model**: `InspectionModel.listInspections()` - Get filtered data
4. **Utility**: `exportUtils.exportToCSV()` - Generate CSV
5. **Audit**: Log the export action
6. **Response**: Return CSV file for download

## 🔄 Multi-Tenant Architecture

**How Tenant Isolation Works**:

1. **Company ID**: Every user belongs to a company
2. **Data Filtering**: All queries include `company_id` filter
3. **Access Control**: Users can only access their company's data
4. **Audit Logging**: All actions are logged with company context

**Example**:
```javascript
// In VehicleModel.listVehicles()
const { data } = await supabase
  .from('vehicles')
  .select('*')
  .eq('company_id', companyId) // Ensures tenant isolation
```

## 📈 Performance & Scalability

**Optimizations Implemented**:

1. **Pagination**: All list endpoints support pagination
2. **Filtering**: Efficient database queries with filters
3. **Indexing**: Database indexes on frequently queried fields
4. **Caching**: Ready for Redis integration
5. **Rate Limiting**: Protection against abuse

## 🔧 Error Handling

**Comprehensive Error Management**:

1. **Validation Errors**: Detailed field-specific error messages
2. **Database Errors**: Graceful handling of database issues
3. **Authentication Errors**: Clear unauthorized access messages
4. **Business Logic Errors**: Meaningful error responses
5. **Global Error Handler**: Catches and logs all unhandled errors

This architecture ensures the SafeStart platform is secure, scalable, and maintainable while providing a robust foundation for vehicle inspection management. 