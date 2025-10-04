# 🏢 Bill Blister - Complete Application Guide

## 📋 **Application Overview**

**Bill Blister** is a comprehensive **Expense Management System** designed for companies to manage employee expense claims, cash allocations, and approval workflows. It's a full-stack application with multiple interfaces:

- **🌐 Web Application** (Next.js/React)
- **⚙️ Backend API** (Node.js/Express)

---

## 🎯 **Core Purpose & Features**

### **Primary Function**
Manage the complete lifecycle of employee expense claims from submission to approval, including budget allocations and expense tracking.

### **Key Features**

#### 🔐 **Authentication & Authorization**
- **Role-based access control** (Admin, Employee, Engineer, HO Approver)
- **JWT-based authentication** with refresh tokens
- **Secure password management** with bcrypt hashing
- **User profile management**

#### 📊 **Dashboard & Analytics**
- **Real-time overview cards** (Total Claims, Pending, Approved, Rejected)
- **Interactive charts** for expense trends and allocations
- **Recent activity feed** with latest claims and approvals
- **Quick action buttons** for common tasks
- **Monthly growth tracking**

#### 💰 **Allocation Management**
- **Budget allocation** to employees by expense type
- **CRUD operations** for allocations with validation
- **Advanced filtering** by employee, expense type, and date range
- **Status tracking** (Active, Inactive, Expired)
- **Total amount calculations**

#### 📝 **Claim Submission & Management**
- **Comprehensive claim form** with all required fields
- **File upload support** for receipts (images and PDFs)
- **Real-time validation** and preview functionality
- **Status tracking** throughout the approval workflow
- **Bill number and date management**

#### ✅ **Verification & Approval Workflow**
- **Engineer verification** stage with comments and rejection reasons
- **HO Approver approval** stage with final decision
- **Complete audit trail** showing who did what and when
- **Status updates and notifications**

#### 👥 **Employee Management**
- **Complete employee profiles** with personal and professional information
- **Reporting manager assignment** and hierarchy management
- **Employee status management** (Active/Inactive)
- **Allocation and claims history** for each employee

#### 📋 **Expense Type Management**
- **CRUD operations** for expense types
- **Hierarchical categorization** (Head1/Head2)
- **Status management** (Active/Inactive)

---

## 🛠️ **Technical Architecture**

### **Frontend (Web Application)**
- **Framework**: Next.js 15.5.3 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 3.4.0
- **Animations**: Framer Motion 12.23.22
- **State Management**: Zustand 5.0.2
- **Forms**: React Hook Form + Yup validation
- **Charts**: Recharts 2.12.7
- **Icons**: Heroicons 2.1.1
- **Notifications**: React Hot Toast 2.4.1
- **HTTP Client**: Axios 1.7.7

### **Backend (API Server)**
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js 4.18.2
- **Database**: SQLite (local) / MySQL (production)
- **ORM**: Prisma 6.16.3
- **Authentication**: JWT (jsonwebtoken 9.0.2)
- **Password Hashing**: bcryptjs 2.4.3
- **Security**: Helmet 7.1.0, CORS 2.8.5
- **Validation**: express-validator 7.0.1
- **File Upload**: Multer 1.4.5
- **Rate Limiting**: express-rate-limit 7.1.5

### **Mobile Application**
- **Framework**: Flutter 3.5.2+
- **Language**: Dart
- **Architecture**: Clean Architecture with MVVM pattern
- **State Management**: StatefulWidget (local state)
- **Navigation**: Named routes with custom router
- **Dependencies**: image_picker, file_picker, permission_handler

---

## 🗄️ **Database Schema**

### **Core Models**

#### **Employee Model**
```prisma
model Employee {
  id                Int      @id @default(autoincrement())
  firstName         String   @map("first_name")
  lastName          String   @map("last_name")
  role              UserRole @default(EMPLOYEE)
  reportingManagerId Int?    @map("reporting_manager_id")
  phone             String?
  email             String   @unique
  dob               DateTime?
  status            String   @default("active")
  loginName         String   @unique @map("login_name")
  passwordHash      String   @map("password_hash")
  head1             String?
  head2             String?
  joiningDate       DateTime? @map("joining_date")
  leavingDate       DateTime? @map("leaving_date")
  country           String?
  state             String?
  city              String?
  fullAddress1      String?  @map("full_address1")
  fullAddress2      String?  @map("full_address2")
  createdAt         DateTime @default(now()) @map("created_at")
  updatedAt         DateTime @updatedAt @map("updated_at")
}
```

#### **Allocation Model**
```prisma
model Allocation {
  id              Int             @id @default(autoincrement())
  allocationDate  DateTime        @map("allocation_date")
  empId           Int             @map("emp_id")
  expenseTypeId   Int             @map("expense_type_id")
  amount          Float
  remarks         String?
  billNumber      String?         @map("bill_number")
  billDate        DateTime?       @map("bill_date")
  fileUrl         String?         @map("file_url")
  notes           String?
  statusEng       ApprovalStatus  @default(PENDING) @map("status_eng")
  notesEng        String?         @map("notes_eng")
  statusHo        ApprovalStatus  @default(PENDING) @map("status_ho")
  notesHo         String?         @map("notes_ho")
  originalBill    Boolean         @default(false) @map("original_bill")
  createdAt       DateTime        @default(now()) @map("created_at")
  updatedAt       DateTime        @updatedAt @map("updated_at")
}
```

#### **Claim Model**
```prisma
model Claim {
  id            Int            @id @default(autoincrement())
  employeeId    Int            @map("employee_id")
  expenseTypeId Int            @map("expense_type_id")
  allocationId  Int?            @map("allocation_id")
  amount        Float
  description   String
  billNumber    String?        @map("bill_number")
  billDate      DateTime?      @map("bill_date")
  fileUrl       String?        @map("file_url")
  notes         String?
  status        ApprovalStatus @default(PENDING)
  verifiedBy    Int?           @map("verified_by")
  verifiedAt    DateTime?      @map("verified_at")
  approvedBy    Int?           @map("approved_by")
  approvedAt    DateTime?      @map("approved_at")
  rejectionReason String?      @map("rejection_reason")
  createdAt     DateTime       @default(now()) @map("created_at")
  updatedAt     DateTime       @updatedAt @map("updated_at")
}
```

### **Enums**
```prisma
enum UserRole {
  EMPLOYEE
  ENGINEER
  APPROVER
  ADMIN
}

enum ApprovalStatus {
  PENDING
  APPROVED
  REJECTED
}
```

---

## 🚀 **API Endpoints**

### **Authentication Routes** (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - Login user
- `POST /logout` - Logout user
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile
- `POST /reset-password` - Reset password
- `POST /refresh-session` - Refresh session
- `PUT /update-password` - Update password

### **Employee Routes** (`/api/employees`)
- `GET /` - Get all employees
- `GET /:id` - Get employee by ID
- `POST /` - Create new employee
- `PUT /:id` - Update employee
- `DELETE /:id` - Delete employee
- `GET /stats` - Get employee statistics

### **Allocation Routes** (`/api/allocations`)
- `GET /` - Get all allocations
- `GET /:id` - Get allocation by ID
- `POST /` - Create new allocation
- `PUT /:id` - Update allocation
- `DELETE /:id` - Delete allocation
- `GET /stats` - Get allocation statistics

### **Claim Routes** (`/api/claims`)
- `GET /` - Get all claims
- `GET /:id` - Get claim by ID
- `POST /` - Create new claim
- `PUT /:id` - Update claim
- `DELETE /:id` - Delete claim
- `POST /:id/verify` - Verify claim (Engineer)
- `POST /:id/approve` - Approve claim (HO Approver)
- `GET /stats` - Get claim statistics

### **Reports Routes** (`/api/reports`)
- `GET /dashboard` - Get dashboard statistics
- `GET /claims` - Get claims report
- `GET /allocations` - Get allocations report
- `GET /employees` - Get employee report

---

## 📱 **Frontend Pages & Components**

### **Main Pages**
1. **Login Page** (`/login`) - User authentication
2. **Dashboard** (`/dashboard`) - Main overview with stats and charts
3. **Amount Allocation** (`/amount-allocation`) - Manage budget allocations
4. **Expense Claims** (`/expense-claim`) - View and manage claims
5. **Claim Verification** (`/claim-verification`) - Engineer verification workflow
6. **Claim Approval** (`/claim-approval`) - HO Approver approval workflow
7. **Reports** (`/reports`) - Analytics and reporting
8. **Employee Management** (`/employees`) - Manage employee data

### **Key Components**
- **Layout** - Main app layout with navigation
- **Card** - Reusable card component
- **Button** - Styled button component
- **Input** - Form input component
- **StatusChip** - Status indicator component
- **EmptyState** - Empty state component
- **Modal** - Modal dialog component

---

## 🔧 **Setup Instructions**

### **Prerequisites**
- Node.js (v18 or higher)
- npm or yarn
- SQLite (for local development)
- MySQL (for production)

### **Backend Setup**
```bash
# Navigate to backend directory
cd bill-blister-backend

# Install dependencies
npm install

# Setup database
npm run setup:mysql  # For MySQL
# OR use SQLite (default)

# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# Seed database with sample data
npm run db:seed

# Start development server
npm run dev
```

### **Frontend Setup**
```bash
# Navigate to frontend directory
cd bill-blister-web

# Install dependencies
npm install

# Start development server
npm run dev
```

### **Mobile Setup**
```bash
# Navigate to root directory
cd bill-blister-app

# Install Flutter dependencies
flutter pub get

# Run on device/emulator
flutter run
```

---

## 🎨 **UI/UX Design System**

### **Color Palette**
- **Primary**: Navy Blue (#1e3a8a)
- **Secondary**: Light Blue (#3b82f6)
- **Success**: Green (#10b981)
- **Warning**: Orange (#f59e0b)
- **Error**: Red (#ef4444)
- **Background**: Light Gray (#f8fafc)
- **Surface**: White (#ffffff)

### **Typography**
- **Headings**: Inter font family
- **Body**: System font stack
- **Sizes**: Responsive scale (sm, base, lg, xl, 2xl, 3xl)

### **Components**
- **Cards**: Rounded corners, subtle shadows
- **Buttons**: Multiple variants (primary, secondary, outline)
- **Forms**: Clean inputs with validation states
- **Charts**: Interactive with hover effects
- **Animations**: Smooth transitions with Framer Motion

---

## 🔐 **Security Features**

### **Authentication**
- JWT tokens with expiration
- Secure password hashing with bcrypt
- Role-based access control
- Protected routes and middleware

### **Data Protection**
- Input validation and sanitization
- SQL injection prevention (Prisma ORM)
- CORS configuration
- Rate limiting
- Helmet security headers

### **File Upload Security**
- File type validation
- Size limits
- Secure file storage
- Virus scanning (optional)

---

## 📊 **Sample Data**

### **Default Users**
- **Admin**: `admin@billblister.com` / `password123`
- **Engineer**: `engineer@billblister.com` / `password123`
- **HO Approver**: `approver@billblister.com` / `password123`
- **Employee**: `saloni.jadav@billblister.com` / `password123`

### **Expense Types**
- Travel & Transportation
- Meals & Entertainment
- Office Supplies
- Communication
- Training & Development
- Miscellaneous

---

## 🚀 **Deployment Options**

### **Development**
- Local SQLite database
- Development servers on localhost
- Hot reloading enabled

### **Production**
- MySQL/PostgreSQL database
- Environment variables for configuration
- SSL/HTTPS enabled
- Production build optimization

### **Cloud Deployment**
- **Frontend**: Vercel, Netlify, AWS S3
- **Backend**: Heroku, AWS EC2, DigitalOcean
- **Database**: AWS RDS, Google Cloud SQL, PlanetScale

---

## 📈 **Performance Optimizations**

### **Frontend**
- Next.js App Router for better performance
- Image optimization
- Code splitting
- Lazy loading
- Caching strategies

### **Backend**
- Database indexing
- Query optimization
- Caching with Redis (optional)
- Compression middleware
- Rate limiting

---

## 🔄 **Workflow Process**

### **1. Allocation Process**
1. Admin creates budget allocation for employee
2. Allocation is assigned to specific expense type
3. Employee can view their allocations
4. Allocation can be used for claims

### **2. Claim Process**
1. Employee submits expense claim
2. Claim includes receipt upload
3. Engineer verifies the claim
4. HO Approver gives final approval
5. Claim status is updated throughout

### **3. Approval Workflow**
1. **Pending** - Initial submission
2. **Verified** - Engineer approval
3. **Approved** - HO Approver approval
4. **Rejected** - With reason

---

## 🛠️ **Development Tools**

### **Code Quality**
- ESLint for code linting
- Prettier for code formatting
- TypeScript for type safety
- Jest for testing

### **Database Management**
- Prisma Studio for database GUI
- Database migrations
- Seed scripts for sample data

### **API Testing**
- Postman collection included
- API documentation
- Health check endpoints

---

## 📚 **Additional Resources**

### **Documentation Files**
- `README.md` - Main project documentation
- `QUICK_START.md` - Quick setup guide
- `PROJECT_DOCUMENTATION.txt` - Detailed project info
- `MYSQL_SETUP_GUIDE.md` - Database setup guide

### **Configuration Files**
- `package.json` - Dependencies and scripts
- `prisma/schema.prisma` - Database schema
- `tailwind.config.ts` - Styling configuration
- `next.config.ts` - Next.js configuration

---

## 🎯 **Key Benefits**

### **For Organizations**
- **Streamlined Process**: Digital expense management
- **Cost Control**: Budget allocation and tracking
- **Transparency**: Complete audit trail
- **Efficiency**: Automated approval workflows
- **Compliance**: Proper documentation and receipts

### **For Employees**
- **Easy Submission**: Simple claim forms
- **Mobile Access**: Submit claims on the go
- **Real-time Status**: Track claim progress
- **Receipt Management**: Digital receipt storage
- **Quick Approvals**: Faster processing

### **For Managers**
- **Dashboard Overview**: Real-time insights
- **Approval Control**: Manage approval workflows
- **Reporting**: Comprehensive analytics
- **Budget Management**: Track allocations
- **Team Management**: Employee oversight

---

This comprehensive guide provides everything you need to understand, set up, and recreate the Bill Blister application. The system is designed to be scalable, secure, and user-friendly for modern expense management needs.
