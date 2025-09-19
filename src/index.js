import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import supabase from './utils/supabase.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Test route to verify Supabase connection
app.get('/health', async (req, res) => {
  try {
    // Test Supabase connection
    const { data, error } = await supabase.from('products').select('count').limit(1);
    
    res.json({
      status: 'OK',
      message: 'One Salt API is running',
      supabase: error ? 'Error connecting to Supabase' : 'Connected to Supabase',
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        PORT: PORT,
        supabaseConfigured: !!(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL)
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'One Salt API Server',
    version: '1.0.0',
    endpoints: {
      health: '/health'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 One Salt API Server is running on http://localhost:${PORT}`);
  console.log(`🔍 Health check: http://localhost:${PORT}/health`);
  console.log(`📁 Working directory: ${process.cwd()}`);
  
  // Log environment status
  const hasSupabaseUrl = !!(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL);
  const hasSupabaseKey = !!(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY);
  
  console.log(`🔐 Supabase URL configured: ${hasSupabaseUrl}`);
  console.log(`🔑 Supabase Key configured: ${hasSupabaseKey}`);
  
  if (!hasSupabaseUrl || !hasSupabaseKey) {
    console.warn('⚠️  Warning: Supabase environment variables may not be properly configured');
    console.warn('   Expected: SUPABASE_URL (or VITE_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SERVICE_KEY)');
  }
});

export default app;