// server.js - Starter Express server for Week 2 assignment

// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

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

// Simple payload validation helper
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

// GET /api/products - List all products
app.get('/api/products', (req, res) => {
  res.json(products);
});

// GET /api/products/:id - Get a specific product by ID
app.get('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const product = products.find((p) => p.id === id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
});

// POST /api/products - Create a new product
app.post('/api/products', (req, res) => {
  const { valid, errors } = validateProductPayload(req.body, true);
  if (!valid) return res.status(400).json({ message: 'Invalid payload', errors });

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
});

// PUT /api/products/:id - Update an existing product
app.put('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return res.status(404).json({ message: 'Product not found' });

  const { valid, errors } = validateProductPayload(req.body, true);
  if (!valid) return res.status(400).json({ message: 'Invalid payload', errors });

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
});

// DELETE /api/products/:id - Delete a product
app.delete('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return res.status(404).json({ message: 'Product not found' });
  products.splice(index, 1);
  res.status(204).send();
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Export the app for testing purposes
module.exports = app;