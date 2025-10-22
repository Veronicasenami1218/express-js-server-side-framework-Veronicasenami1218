// server.js - Starter Express server for Week 2 assignment

// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

// Custom error classes
class ApiError extends Error {
  constructor(statusCode, message, details = undefined) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode || 500;
    this.details = details;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

class NotFoundError extends ApiError {
  constructor(message = 'Resource not found', details) {
    super(404, message, details);
  }
}

class ValidationError extends ApiError {
  constructor(message = 'Validation failed', details) {
    super(400, message, details);
  }
}

// Async wrapper utility (for future async handlers)
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;
// Middleware setup
app.use(bodyParser.json());

// Sample in-memory products database
let products = [
  {
    id: '1',
    name: 'Laptop',
    description: 'High-performance laptop with 16GB RAM',
    price: 1200,
    category: 'electronics',
    inStock: true
  },
  {
    id: '2',
    name: 'Smartphone',
    description: 'Latest model with 128GB storage',
    price: 800,
    category: 'electronics',
    inStock: true
  },
  {
    id: '3',
    name: 'Coffee Maker',
    description: 'Programmable coffee maker with timer',
    price: 50,
    category: 'kitchen',
    inStock: false
  }
];

// Root route
app.get('/', (req, res) => {
    res.send('Hello World');
  });

  // Logger middleware (method, URL, timestamp)
  function logger(req, res, next) {
    const ts = new Date().toISOString();
    console.log(`[${ts}] ${req.method} ${req.originalUrl}`);
    next();
  }
  app.use(logger);

  // Authentication middleware via x-api-key header
  function requireApiKey(req, res, next) {
    const apiKey = req.header('x-api-key');
    const expected = process.env.API_KEY || 'dev-secret-key';
    if (!apiKey || apiKey !== expected) {
      return next(new ApiError(401, 'Unauthorized: invalid or missing API key'));
    }
    next();
  }

  // Validation helpers and function
  const isString = (v) => typeof v === 'string' && v.trim() !== '';
  const isNumber = (v) => typeof v === 'number' && !Number.isNaN(v);
  const isBoolean = (v) => typeof v === 'boolean';

  function validateProductPayload(body, requireAll = true) {
    const errors = [];
    const { name, description, price, category, inStock } = body ?? {};
    if (requireAll || 'name' in body) {
      if (!isString(name)) errors.push('name must be a non-empty string');
    }
    if (requireAll || 'description' in body) {
      if (!isString(description)) errors.push('description must be a non-empty string');
    }
    if (requireAll || 'price' in body) {
      if (!isNumber(price)) errors.push('price must be a number');
    }
    if (requireAll || 'category' in body) {
      if (!isString(category)) errors.push('category must be a non-empty string');
    }
    if (requireAll || 'inStock' in body) {
      if (!isBoolean(inStock)) errors.push('inStock must be a boolean');
    }
    return { valid: errors.length === 0, errors };
  }

  // Validation middleware
  function validateCreate(req, res, next) {
    const { valid, errors } = validateProductPayload(req.body, true);
    if (!valid) return next(new ValidationError('Invalid payload', { errors }));
    next();
  }

  function validateUpdate(req, res, next) {
    const { valid, errors } = validateProductPayload(req.body, true);
    if (!valid) return next(new ValidationError('Invalid payload', { errors }));
    next();
  }

// GET /api/products - List all products
app.get('/api/products', (req, res) => {
  res.json(products);
});
// GET /api/products/:id - Get a specific product by ID
app.get('/api/products/:id', (req, res, next) => {
  try {
    const { id } = req.params;
    const product = products.find((p) => p.id === id);
    if (!product) return next(new NotFoundError('Product not found'));
    res.json(product);
  } catch (err) {
    next(err);
  }
});

// POST /api/products - Create a new product
app.post('/api/products', requireApiKey, validateCreate, (req, res, next) => {
  try {
    const { name, description, price, category, inStock } = req.body;
    const newProduct = {
      id: uuidv4(),
      name: name.trim(),
      description: description.trim(),
      price,
      category: category.trim(),
      inStock
    };
    products.push(newProduct);
    res.status(201).json(newProduct);
  } catch (err) {
    next(err);
  }
});

// PUT /api/products/:id - Update an existing product
app.put('/api/products/:id', requireApiKey, validateUpdate, (req, res, next) => {
  try {
    const { id } = req.params;
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) return next(new NotFoundError('Product not found'));
    const { name, description, price, category, inStock } = req.body;
    const updated = {
      id,
      name: name.trim(),
      description: description.trim(),
      price,
      category: category.trim(),
      inStock
    };
    products[index] = updated;
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/products/:id - Delete a product
app.delete('/api/products/:id', requireApiKey, (req, res, next) => {
  try {
    const { id } = req.params;
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) return next(new NotFoundError('Product not found'));
    products.splice(index, 1);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// 404 handler for unmatched routes
app.use((req, res, next) => {
  next(new NotFoundError('Route not found'));
});

// Global error handler (must be last)
/* eslint-disable no-unused-vars */
app.use((err, req, res, next) => {
  const status = err?.statusCode || 500;
  const payload = {
    message: err?.message || 'Internal Server Error',
  };
  if (err?.details) payload.details = err.details;
  // Basic stack in development for easier debugging
  if (process.env.NODE_ENV !== 'production' && err?.stack) {
    payload.stack = err.stack;
  }
  res.status(status).json(payload);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Export the app for testing purposes
module.exports = app;