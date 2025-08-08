# OneSalt - Frontend

A modern, responsive React frontend for the OneSalt clothing store, built with Vite and Tailwind CSS.

## 🚀 Features

- **Modern React 18** with Vite for fast development
- **Responsive Design** with Tailwind CSS
- **Product Catalog** with search and filtering
- **Product Details** with color/size selection
- **Order Placement** with form validation
- **Toast Notifications** for user feedback
- **Error Boundaries** for graceful error handling
- **Loading States** with custom spinners
- **SEO Friendly** with proper meta tags

## 🛠 Tech Stack

- **React 18** - UI Framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API requests
- **React Toastify** - Toast notifications
- **Lucide React** - Beautiful icons

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Backend API running on `http://localhost:3000`

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit the `.env` file if needed:
```env
VITE_API_BASE_URL=http://localhost:3000
NODE_ENV=development
```

### 3. Start the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3001`

### 4. Build for Production

```bash
npm run build
```

### 5. Preview Production Build

```bash
npm run preview
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ErrorBoundary.jsx
│   ├── Footer.jsx
│   ├── Header.jsx
│   ├── LoadingSpinner.jsx
│   └── ProductCard.jsx
├── pages/              # Page components
│   ├── HomePage.jsx
│   ├── ProductsPage.jsx
│   ├── ProductDetailPage.jsx
│   └── ThankYouPage.jsx
├── services/           # API service functions
│   └── api.js
├── App.jsx            # Main app component
├── main.jsx          # App entry point
└── index.css         # Global styles
```

## 🎨 Design System

### Colors
- **Primary Black**: `#000000` - Main text and buttons
- **Primary White**: `#FFFFFF` - Background
- **Light Gray**: `#F5F5F5` - Card backgrounds
- **Border Gray**: `#E8E8E8` - Borders and dividers

### Components
- **Buttons**: `.btn-primary`, `.btn-secondary`
- **Cards**: `.card` with hover effects
- **Forms**: `.input-field`, `.select-field`
- **Animations**: Smooth transitions and micro-interactions

## 🌐 API Integration

The frontend connects to the backend API at `http://localhost:3000`:

- `GET /products` - Fetch all products
- `GET /products/:slug` - Fetch single product
- `POST /orders` - Create new order

## 📱 Responsive Design

The application is fully responsive with breakpoints:
- **Mobile**: Default (< 640px)
- **Tablet**: `sm:` (≥ 640px)
- **Desktop**: `md:` (≥ 768px)
- **Large**: `lg:` (≥ 1024px)

## 🎯 User Flow

1. **Home Page** - Hero section with featured products
2. **Products Page** - Browse all products with search/filter
3. **Product Detail** - View product details, select options
4. **Order Form** - Fill out customer information
5. **Thank You** - Order confirmation and next steps

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🚦 Error Handling

- **Error Boundaries** catch React errors
- **API Error Handling** with user-friendly messages
- **Form Validation** with real-time feedback
- **Loading States** for better UX

## 🎨 Customization

### Tailwind Configuration
Customize colors, fonts, and animations in `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      'primary-black': '#000000',
      'primary-white': '#FFFFFF',
      // Add your custom colors
    }
  }
}
```

### API Base URL
Update the API base URL in `src/services/api.js` if needed.

## 📦 Deployment

### Netlify
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Deploy!

### Vercel
1. Import your repository
2. Set framework preset to "Vite"
3. Deploy!

### Traditional Hosting
1. Run `npm run build`
2. Upload the `dist` folder contents to your web server

## 🐛 Troubleshooting

### Common Issues

**API Connection Issues**
- Ensure the backend is running on `http://localhost:3000`
- Check CORS configuration in the backend
- Verify API endpoints are working

**Build Issues**
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check for TypeScript errors if using TypeScript

**Styling Issues**
- Ensure Tailwind CSS is properly configured
- Check for conflicting CSS classes
- Verify PostCSS configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support, please contact:
- Email: hello@onesalt.com
- GitHub Issues: Create an issue in this repository