# Chains ERP - Enterprise Resource Planning System

## 🚀 Overview
Chains ERP is a modern, modular enterprise resource planning system built with TypeScript, React, and Prisma. The system is designed to be flexible, secure, and scalable, with a focus on industry-specific needs and compliance requirements.

## 🎯 Core Principles
- **Zero Pre-seeding**: The system starts completely empty. All data is created through the application by users.
- **Industry-First Design**: Module recommendations and configurations are tailored to specific industries.
- **Strict Access Control**: Hierarchical access system with clear separation of concerns.
- **Legal Compliance**: Built-in support for country-specific legal requirements and tax regulations.

## 🏗 Architecture

### Backend (server/)
- **TypeScript + Express**: Robust API server with type safety
- **Prisma + MongoDB**: Modern database ORM with MongoDB for flexibility
- **Authentication**: Session-based auth with Passport.js
- **Module System**: Dynamic module loading and access control

### Frontend (client/)
- **React + TypeScript**: Modern UI with type safety
- **Tailwind CSS**: Utility-first styling
- **Shadcn/ui**: High-quality, accessible components
- **Module-based Routing**: Dynamic route loading based on user access

## 🔐 Access Control Hierarchy

### 1. Organization Owner
- Full access to all modules
- Can create module admins
- Manages organization settings
- Access to compact sidebar

### 2. Module Admin
- Access limited to assigned module
- Manages module-specific settings
- Cannot access other modules
- No access to compact sidebar

### 3. Regular Employee
- Basic access to assigned modules
- Limited to specific actions
- No administrative capabilities

## 📦 Module System

### Primary Module (Always Included)
- **Accounting**: Core financial management
  - Required for all organizations
  - Cannot be disabled
  - Foundation for other modules

### Industry-Specific Recommendations
```typescript
const industryModules = {
  technology: ['project', 'inventory', 'hr', 'crm'],
  manufacturing: ['inventory', 'manufacturing', 'warehouse', 'procurement'],
  retail: ['pos', 'inventory', 'crm', 'ecommerce'],
  healthcare: ['hr', 'inventory', 'crm', 'compliance'],
  finance: ['accounting', 'blockchain', 'compliance', 'analytics'],
  // ... more industries
};
```

### Module Selection Rules
1. Accounting is automatically included
2. Organizations can select up to 2 additional modules
3. Total maximum: 3 modules (1 primary + 2 additional)
4. Modules are recommended based on industry

## 🌍 Legal Compliance

### Organization Settings
```typescript
settings: {
  legalCompliance: {
    country: string;
    taxJurisdiction: string;
    fiscalYearStart: string;
    currency: string;
  }
}
```

### Country-Specific Features
- Tax calculations
- Legal requirements
- Currency handling
- Regional compliance

## 🚦 Application Flow

### 1. Organization Creation
```typescript
POST /api/organization
{
  name: string;
  industry: string;
  country: string;
  selectedModules: string[]; // Max 2 additional modules
}
```

### 2. User Management
```typescript
POST /api/mongodb/users
{
  username: string;
  email: string;
  role: 'owner' | 'admin' | 'employee';
  department: string;
  // ... other user fields
}
```

### 3. Module Access
```typescript
// Automatically handled based on role
moduleAccess: {
  create: activeModules.map(module => ({
    module,
    access: 'read_write' | 'read'
  }))
}
```

## 🔒 Security Features

### 1. Authentication
- Session-based authentication
- Secure password hashing
- Role-based access control

### 2. Module Access
- Middleware-based access control
- Role-specific permissions
- Module-level restrictions

### 3. Data Protection
- Input validation
- Type safety
- Secure data handling

## 🛠 Development

### Prerequisites
- Node.js 18+
- MongoDB
- TypeScript
- pnpm

### Setup
```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

## ⚠️ Important Notes

1. **NO SEEDING**: The system starts empty. All data must be created through the application.
2. **Module Limits**: Strict enforcement of 3-module limit (1 primary + 2 additional).
3. **Access Control**: Clear separation between owner, admin, and employee roles.
4. **Legal Compliance**: Country-specific settings are required for proper operation.

## 🎯 Design Decisions

### Why No Seeding?
- Clean slate for each installation
- Prevents unwanted data
- Forces proper setup through UI
- Better security

### Why Module Limits?
- Focused functionality
- Better performance
- Clearer user experience
- Easier maintenance

### Why Industry-Specific?
- Tailored solutions
- Better user experience
- Relevant features
- Efficient operations

## 📚 API Documentation

### Organization Endpoints
- `POST /api/organization`: Create organization
- `GET /api/organization/settings`: Get settings
- `PATCH /api/organization/settings`: Update settings

### User Endpoints
- `POST /api/mongodb/users`: Create user
- `GET /api/mongodb/users`: List users
- `PUT /api/mongodb/users/:id`: Update user

### Module Endpoints
- `GET /api/modules/access`: Check module access
- `POST /api/modules/configure`: Configure module

## 🚨 Error Handling

### Common Errors
- Module limit exceeded
- Invalid role assignment
- Access denied
- Invalid module selection

### Error Responses
```typescript
{
  error: string;
  code: string;
  details?: any;
}
```

## 🔄 Database Schema

### Organization
```typescript
{
  id: string;
  name: string;
  industry: string;
  country: string;
  activeModules: string[];
  maxModules: number;
  settings: {
    legalCompliance: {
      country: string;
      taxJurisdiction: string;
      fiscalYearStart: string;
      currency: string;
    }
  }
}
```

### User
```typescript
{
  id: string;
  username: string;
  email: string;
  role: string;
  department: string;
  organizationId: string;
  isOwner: boolean;
  moduleAccess: {
    module: string;
    access: string;
  }[];
}
```

## 🎨 UI Components

### Layout
- Compact sidebar (owner only)
- Module-specific dashboards
- Role-based navigation
- Responsive design

### Features
- Dark/light mode
- Responsive tables
- Dynamic forms
- Real-time updates

## 🔍 Monitoring

### Available Scripts
- `check-users.ts`: Database state check
- No seeding scripts
- No data manipulation scripts

## 📈 Future Improvements

1. **Module Marketplace**
   - Additional module purchases
   - Third-party integrations
   - Custom module development

2. **Enhanced Compliance**
   - More country support
   - Automated tax calculations
   - Legal requirement updates

3. **Advanced Analytics**
   - Business intelligence
   - Performance metrics
   - Custom reports

## ⚖️ License
Proprietary - All rights reserved 