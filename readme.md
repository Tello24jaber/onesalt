# One Salt - Backend API

A robust Node.js + Express backend API for the One Salt clothing store, integrated with Supabase for data storage.

## 🚀 Features

- **Product Management**: Fetch all products or get individual products by slug
- **Order Processing**: Create customer orders with validation and sanitization
- **Admin Dashboard**: Protected admin endpoints for order management
- **Security**: Input sanitization, CORS, Helmet protection, and admin authentication
- **Error Handling**: Comprehensive error handling with detailed responses
- **Logging**: Request logging with Morgan
- **Validation**: Robust input validation and UUID checking

## 📋 API Endpoints

### Public Endpoints

- `GET /` - API status and information
- `GET /health` - Health check endpoint
- `GET /products` - Fetch all products
- `GET /products/:slug` - Fetch product by slug
- `POST /orders` - Create a new order

### Admin Endpoints (Protected)

- `GET /admin/orders` - Fetch all orders (requires admin token)

## 🛠 Installation & Setup

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account and project

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd one-salt-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your actual values:
   ```env
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ADMIN_TOKEN=your-secure-admin-token-here
   PORT=3000
   NODE_ENV=development
   ```

4. **Database Setup**
   
   Make sure your Supabase database has the following tables:
   
   **Products Table:**
   ```sql
   CREATE TABLE products (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     name TEXT NOT NULL,
     slug TEXT UNIQUE NOT NULL,
     description TEXT,
     price NUMERIC NOT NULL,
     images TEXT[],
     colors TEXT[],
     sizes TEXT[],
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```
   
   **Orders Table:**
   ```sql
   CREATE TABLE orders (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     name TEXT NOT NULL,
     phone TEXT NOT NULL,
     address TEXT NOT NULL,
     city TEXT NOT NULL,
     product_id UUID REFERENCES products(id),
     product_name TEXT NOT NULL,
     color TEXT NOT NULL,
     size TEXT NOT NULL,
     notes TEXT,
     status TEXT DEFAULT 'pending',
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

5. **Start the server**
   ```bash
   # Development mode (with nodemon)
   npm run dev
   
   # Production mode
   npm start
   ```

The server will be running at `http://localhost:3000`

## 🌐 API Usage Examples

### Fetch All Products
```bash
curl -X GET http://localhost:3000/products
```

### Fetch Product by Slug
```bash
curl -X GET http://localhost:3000/products/cool-t-shirt
```

### Create an Order
```bash
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "phone": "+1234567890",
    "address": "123 Main St",
    "city": "New York",
    "product_id": "123e4567-e89b-12d3-a456-426614174000",
    "product_name": "Cool T-Shirt",
    "color": "Blue",
    "size": "M",
    "notes": "Please call before delivery"
  }'
```

### Get All Orders (Admin)
```bash
curl -X GET http://localhost:3000/admin/orders \
  -H "Authorization: Bearer your-admin-token-here"
```

## 🚀 Deployment to Render

1. **Create a new Web Service on Render**
   - Connect your GitHub repository
   - Use the following settings:
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`

2. **Set Environment Variables**
   
   In your Render dashboard, add these environment variables:
   ```
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ADMIN_TOKEN=your-secure-admin-token-here
   NODE_ENV=production
   ```

3. **Deploy**
   - Render will automatically build and deploy your application
   - Your API will be available at `https://your-app-name.onrender.com`

### Production Considerations

- Update CORS origins in `index.js` to match your frontend domain
- Use strong, unique tokens for `ADMIN_TOKEN`
- Monitor your Supabase usage and upgrade plan if needed
- Set up proper logging and monitoring

## 🔧 Project Structure

```
one-salt-backend/
├── config/
│   └── supabaseClient.js    # Supabase client configuration
├── controllers/
│   ├── productsController.js # Product-related logic
│   └── ordersController.js   # Order-related logic
├── middleware/
│   ├── auth.js              # Admin authentication
│   └── validation.js        # Input validation & sanitization
├── routes/
│   ├── products.js          # Product routes
│   ├── orders.js            # Order routes
│   └── admin.js             # Admin routes
├── .env.example             # Environment variables template
├── index.js                 # Main application file
├── package.json             # Dependencies and scripts
└── README.md               # Documentation
```

## 🛡 Security Features

- **Input Sanitization**: All user inputs are escaped to prevent XSS attacks
- **UUID Validation**: Product IDs are validated for proper UUID format
- **Admin Authentication**: Protected admin endpoints with Bearer token auth
- **CORS Protection**: Configurable CORS settings for different environments
- **Helmet**: Security headers automatically applied
- **Rate Limiting**: Built-in Express rate limiting capabilities

## 📝 Error Handling

The API returns consistent error responses:

```json
{
  "error": "Error Type",
  "message": "Detailed error message",
  "missingFields": ["field1", "field2"] // For validation errors
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add some feature'`
4. Push to branch: `git push origin feature-name`
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please contact the development team or create an issue in the repository.