# Hotel Management System - Backend API Documentation

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create .env file**
```bash
cp .env.example .env
```

4. **Configure environment variables** in `.env`:
```
PORT=3000
MONGO_URI=mongodb://localhost:27017/hotel_management
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=1d
CORS_ORIGIN=http://localhost:4200
```

5. **Start the server**
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The API will be running at `http://localhost:3000`

---

## 📋 API Endpoints Overview

### Base URL
```
http://localhost:3000/api
```

### Authentication Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login user |

### User Management (Admin only)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---|
| GET | `/users` | Get all users | Yes (Admin) |
| GET | `/users/current` | Get current logged-in user | Yes |
| GET | `/users/:id` | Get user by ID | Yes (Admin) |
| POST | `/users` | Create new user | Yes (Admin) |
| PATCH | `/users/:id` | Update user info | Yes (Admin) |
| PATCH | `/users/:id/password` | Update user password | Yes |
| DELETE | `/users/:id` | Delete user | Yes (Admin) |

### Room Management
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---|
| GET | `/rooms` | Get all rooms | Yes |
| GET | `/rooms/:id` | Get room by ID | Yes |
| POST | `/rooms` | Create new room | Yes (Admin) |
| PATCH | `/rooms/:id` | Update room | Yes (Admin) |
| DELETE | `/rooms/:id` | Delete room | Yes (Admin) |

### Guest Management
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---|
| GET | `/guests` | Get all guests | Yes (Admin, Reception) |
| GET | `/guests/:id` | Get guest by ID | Yes (Admin, Reception) |
| POST | `/guests` | Create new guest | Yes (Admin, Reception) |
| PATCH | `/guests/:id` | Update guest | Yes (Admin, Reception) |
| DELETE | `/guests/:id` | Delete guest | Yes (Admin) |

### Booking Management
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---|
| GET | `/bookings` | Get all bookings | Yes (Admin, Reception) |
| GET | `/bookings/:id` | Get booking by ID | Yes (Admin, Reception) |
| POST | `/bookings` | Create new booking | Yes (Admin, Reception) |
| PATCH | `/bookings/:id/status` | Update booking status | Yes (Admin, Reception) |

### Invoice Management
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---|
| GET | `/invoices` | Get all invoices | Yes |
| GET | `/invoices/:id` | Get invoice by ID | Yes |
| POST | `/invoices` | Create new invoice | Yes |
| PATCH | `/invoices/:id/status` | Update invoice status | Yes |
| PUT | `/invoices/:id` | Update invoice details | Yes |
| DELETE | `/invoices/:id` | Delete invoice | Yes |

### Dashboard (Admin only)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---|
| GET | `/dashboard/stats` | Get dashboard statistics | Yes (Admin) |
| GET | `/dashboard/room-status` | Get room status overview | Yes (Admin) |
| GET | `/dashboard/recent-bookings` | Get recent bookings | Yes (Admin) |

---

## 🔐 User Roles

```
r1 - Admin          (Full access)
r2 - Reception      (Booking, Guest, Room management)
r3 - Housekeeping   (Room status updates)
r4 - Guest          (View own bookings)
r5 - Accountant     (Invoice management)
```

---

## 📊 Request/Response Examples

### Register User
**POST** `/api/auth/register`

Request:
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "roleId": "r2"
}
```

Response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "username": "john_doe",
      "email": "john@example.com",
      "roleId": "r2"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Login User
**POST** `/api/auth/login`

Request:
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "username": "john_doe",
      "email": "john@example.com",
      "roleId": "r2"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Create Room
**POST** `/api/rooms`

Headers:
```
Authorization: Bearer {token}
```

Request:
```json
{
  "roomNumber": "101",
  "type": "double",
  "pricePerNight": 150,
  "capacity": 2,
  "description": "Luxury double room with ocean view"
}
```

Response:
```json
{
  "success": true,
  "message": "Room created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "roomNumber": "101",
    "type": "double",
    "pricePerNight": 150,
    "capacity": 2,
    "status": "available",
    "description": "Luxury double room with ocean view"
  }
}
```

### Create Booking
**POST** `/api/bookings`

Headers:
```
Authorization: Bearer {token}
```

Request:
```json
{
  "roomId": "507f1f77bcf86cd799439012",
  "checkInDate": "2024-06-01",
  "checkOutDate": "2024-06-05",
  "guest": {
    "fullName": "Jane Smith",
    "email": "jane@example.com",
    "phone": "+1234567890",
    "address": "123 Main St"
  },
  "status": "confirmed"
}
```

Response:
```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "room": {...},
    "guest": {...},
    "checkInDate": "2024-06-01",
    "checkOutDate": "2024-06-05",
    "status": "confirmed",
    "totalAmount": 600
  }
}
```

### Create Invoice
**POST** `/api/invoices`

Headers:
```
Authorization: Bearer {token}
```

Request:
```json
{
  "bookingId": "507f1f77bcf86cd799439013",
  "numberOfNights": 4,
  "roomCharges": 600,
  "additionalCharges": [
    {"description": "Room service", "amount": 50},
    {"description": "Wi-Fi", "amount": 10}
  ],
  "discount": 5,
  "taxPercentage": 15,
  "notes": "Standard booking"
}
```

Response:
```json
{
  "success": true,
  "message": "Invoice created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "invoiceNumber": "INV-20240601-00001",
    "status": "draft",
    "totalAmount": 691.27,
    "booking": {...},
    "guest": {...}
  }
}
```

---

## 🛠️ Middleware

### Authentication Middleware
Validates JWT token from Authorization header
```
Authorization: Bearer {token}
```

### RBAC Middleware
Restricts endpoints based on user roles
```javascript
rbac('r1', 'r2') // Only Admin and Reception can access
```

### Error Middleware
Centralized error handling with proper HTTP status codes

---

## 📝 Database Models

### User Model
```javascript
{
  username: String (required, unique),
  email: String (required, unique),
  password: String (required, hashed),
  roleId: String (default: r3)
}
```

### Room Model
```javascript
{
  roomNumber: String (required, unique),
  type: String (enum: single, double, suite, deluxe),
  pricePerNight: Number (required),
  capacity: Number (required),
  status: String (enum: available, occupied, maintenance, reserved),
  description: String
}
```

### Booking Model
```javascript
{
  guest: ObjectId (ref: Guest),
  room: ObjectId (ref: Room),
  checkInDate: Date,
  checkOutDate: Date,
  status: String (enum: pending, confirmed, checked_in, checked_out, cancelled),
  totalAmount: Number,
  createdBy: ObjectId (ref: User)
}
```

### Invoice Model
```javascript
{
  invoiceNumber: String (unique),
  booking: ObjectId (ref: Booking),
  guest: Object,
  room: Object,
  numberOfNights: Number,
  roomCharges: Number,
  additionalCharges: Array,
  subtotal: Number,
  discount: Number,
  taxPercentage: Number,
  taxAmount: Number,
  totalAmount: Number,
  status: String (enum: draft, issued, unpaid, paid, cancelled, void),
  createdBy: ObjectId (ref: User)
}
```

---

## ⚠️ Error Handling

All errors return standardized responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

### HTTP Status Codes
- `200` - OK
- `201` - Created
- `204` - No Content
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

---

## 🔒 Security Best Practices

1. **JWT Tokens**: Always sent in Authorization header
2. **Passwords**: Hashed with bcryptjs (10 salt rounds)
3. **RBAC**: Role-based access control on all protected routes
4. **CORS**: Configured for specific origins
5. **Input Validation**: All inputs validated before processing

---

## 📦 Dependencies

- `express` - Web framework
- `mongoose` - MongoDB ODM
- `jsonwebtoken` - JWT authentication
- `bcryptjs` - Password hashing
- `cors` - CORS middleware
- `dotenv` - Environment variables

---

## 🚨 Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check MONGO_URI in .env file
- Verify network connectivity

### JWT Token Errors
- Ensure token is sent in Authorization header
- Check JWT_SECRET matches between requests
- Verify token hasn't expired

### RBAC Forbidden Error
- Check user role has required permissions
- Verify role string is correct (r1, r2, etc.)

---

## 📞 Support

For issues or questions, contact the development team.

