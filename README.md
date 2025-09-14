# AI Invoice Analyzer - MVP

An intelligent invoice processing application that uses AI to extract structured data from invoice images. Built with Next.js, Supabase, and Google Gemini AI.

## 🚀 Features

- **AI-Powered OCR**: Extract invoice data using Google Gemini AI
- **Drag & Drop Upload**: Easy file upload with validation
- **Structured Data Extraction**: Comprehensive invoice field extraction
- **Secure Storage**: Supabase database and file storage
- **User Authentication**: Secure login/signup with Supabase Auth
- **Dashboard**: Invoice management with search and filtering
- **Responsive Design**: Mobile-friendly with dark mode support
- **Real-time Processing**: Instant invoice analysis and display

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Authentication**: Supabase Auth
- **AI/OCR**: Google Gemini API (gemini-2.5-flash-lite)
- **Icons**: Lucide React

## 🔧 Prerequisites

Before running this application, ensure you have:

- Node.js 18+ installed
- A Supabase account and project
- A Google AI Studio account with Gemini API access
- Git for version control

## ⚡ Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd invoice-handler/invoice-scanner
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env.local` file in the `invoice-scanner` directory:

```env
# Gemini AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

```

### 4. Database Setup

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase-schema.sql`
4. Run the SQL to create tables, indexes, and Row Level Security policies

### 5. Configure Authentication

In your Supabase dashboard:
1. Go to Authentication > Settings
2. Enable email authentication
3. Configure email templates if needed
4. Set up any additional providers as required

### 6. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 📁 Project Structure

```
invoice-scanner/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── api/               # API routes
│   │   │   └── invoices/      # Invoice-related endpoints
│   │   ├── auth/              # Authentication pages
│   │   ├── dashboard/         # Dashboard page
│   │   ├── invoices/          # Invoice detail pages
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   ├── components/            # Reusable components
│   │   └── FileUpload.tsx     # File upload component
│   ├── contexts/              # React contexts
│   │   └── AuthContext.tsx    # Authentication context
│   ├── lib/                   # Utility libraries
│   │   ├── auth.ts           # Authentication helpers
│   │   ├── gemini.ts         # Gemini AI integration
│   │   └── supabase.ts       # Supabase client
│   └── types/                 # TypeScript type definitions
│       └── database.ts        # Database types
├── supabase-schema.sql        # Database schema
├── package.json               # Dependencies
└── README.md                  # This file
```

## 🔐 API Keys Setup

### Gemini API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env.local` file

### Supabase Configuration
1. Create a new project at [Supabase](https://supabase.com)
2. Go to Settings > API
3. Copy the project URL and anon key
4. Copy the service role key (keep this secret!)
5. Add all three to your `.env.local` file

## 🚦 Usage

### 1. Upload Invoice
- Visit the home page
- Drag and drop an invoice image or click to select
- Supported formats: JPG, PNG (max 5MB)
- Click "Analyze Invoice"

### 2. View Results
- After processing, you'll be redirected to the invoice detail page
- Review the extracted data
- View the original image alongside the structured data

### 3. Manage Invoices
- Visit the Dashboard to see all your invoices
- Search by company, customer, or invoice number
- Filter by status
- Click any invoice to view details

## 🛡️ Security Features

- **Row Level Security (RLS)**: Users can only access their own data
- **JWT Authentication**: Secure token-based authentication
- **File Validation**: Type and size restrictions on uploads
- **Environment Variables**: Secure API key management
- **HTTPS Enforcement**: Secure data transmission

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- Digital Ocean App Platform

## 🎯 Invoice Schema

The application extracts the following data from invoices:

- **Company Information**: Name, billing details
- **Customer Information**: Name, addresses, contact info
- **Invoice Details**: Number, dates, PO number
- **Line Items**: Description, quantity, unit price, total
- **Financial Summary**: Subtotal, tax, discounts, total due
- **Terms**: Payment terms, late fees, signatures
- **Additional**: Notes, purpose, currency

## 🔧 Troubleshooting

### Common Issues

1. **"Failed to fetch invoices"**
   - Check Supabase configuration
   - Verify RLS policies are set up correctly
   - Ensure user is authenticated

2. **"Failed to extract invoice data"**
   - Verify Gemini API key is correct
   - Check image quality and format
   - Ensure image contains readable text

3. **Authentication errors**
   - Verify Supabase auth configuration
   - Check environment variables
   - Ensure email confirmation is set up

### Debug Mode

Enable detailed logging by adding to `.env.local`:
```env
NODE_ENV=development
```

## 📚 API Documentation

### Upload Invoice
```
POST /api/invoices/upload
Content-Type: multipart/form-data
Body: file (image)
```

### Get Invoices
```
GET /api/invoices
Authorization: Bearer {token}
```

### Get Invoice Details
```
GET /api/invoices/{id}
Authorization: Bearer {token}
```
