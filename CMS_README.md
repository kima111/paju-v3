# Paju Restaurant CMS

A native content management system for managing restaurant menu items and operating hours.

## Features

### 🍽️ Menu Management
- **Lunch & Dinner Menus**: Separate management for different service types
- **Complete Menu Items**: Title, description, price, category, availability
- **Real-time Updates**: Changes reflect immediately on the main website
- **Category Organization**: Appetizers, Main Courses, Side Dishes, Desserts, Beverages
- **Availability Toggle**: Enable/disable items without deleting them

### 🕒 Restaurant Hours Management
- **Weekly Schedule**: Manage hours for each day of the week
- **Service Types**: Lunch and dinner service options
- **Flexible Hours**: Set different hours for different days
- **Closed Days**: Mark days as completely closed
- **Live Display**: Hours update automatically on the main website

### 🔐 Authentication System
- **Secure Login**: JWT-based authentication with HTTP-only cookies
- **Role-based Access**: Admin and manager roles
- **Session Management**: Automatic logout and security features

## Default Credentials
- **Username**: `admin`
- **Password**: `admin123`

## Access Points

### Public Website
- **Main Site**: `/` - Customer-facing restaurant website
- **Dynamic Menu**: Displays current menu items from CMS
- **Live Hours**: Shows current operating hours

### CMS Dashboard
- **Login Page**: `/cms/login`
- **Dashboard**: `/cms/dashboard`
- **Staff Access**: Link in footer of main website

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Menu Management
- `GET /api/menu/items` - Get all menu items
- `GET /api/menu/items?menuType=lunch` - Get lunch items
- `GET /api/menu/items?menuType=dinner` - Get dinner items
- `POST /api/menu/items` - Create new menu item
- `PUT /api/menu/items/[id]` - Update menu item
- `DELETE /api/menu/items/[id]` - Delete menu item

### Restaurant Hours
- `GET /api/restaurant/hours` - Get all operating hours
- `PUT /api/restaurant/hours` - Update operating hours

## Technical Details

### Stack
- **Framework**: Next.js 15 with App Router
- **Authentication**: JWT with `jose` library
- **Password Hashing**: bcryptjs
- **Database**: In-memory storage (easily replaceable with real database)
- **Styling**: Tailwind CSS with dark theme

### Security Features
- HTTP-only cookies for token storage
- Password hashing with bcrypt
- Role-based access control
- CSRF protection via same-site cookies

## Menu Structure

### Sample Lunch Menu
- Korean Rice Bowl - $18
- Kimchi Fried Rice - $16  
- Korean Chicken Sandwich - $19

### Sample Dinner Menu
- Dry Aged New York Steak (14oz) - $65
- Whole Brazino - $58
- Seafood Jeon - $28

## Usage Instructions

### For Restaurant Staff
1. Access `/cms/login` from the main website footer
2. Login with provided credentials
3. Navigate between "Menu Management" and "Restaurant Hours" tabs
4. Add, edit, or disable menu items as needed
5. Update operating hours for different days
6. Changes appear immediately on the main website

### For Developers
1. All data is stored in `/lib/database.ts`
2. Replace in-memory storage with real database as needed
3. Extend user roles and permissions in `/lib/auth.ts`
4. Add more menu categories or fields in the database schema
5. Customize styling in the CMS components

## File Structure
```
/app
  /api
    /auth/login/route.ts
    /auth/logout/route.ts  
    /menu/items/route.ts
    /menu/items/[id]/route.ts
    /restaurant/hours/route.ts
  /cms
    /login/page.tsx
    /dashboard/page.tsx
    layout.tsx
  page.tsx (main website)

/components
  /cms
    MenuManagement.tsx
    HoursManagement.tsx
  MenuSection.tsx
  RestaurantHoursDisplay.tsx

/lib
  database.ts (data models and storage)
  auth.ts (JWT and password utilities)
```

This CMS provides a complete solution for restaurant content management with a clean, professional interface that matches the main website's aesthetic.