# Express.js RESTful API Assignment

This assignment focuses on building a RESTful API using Express.js, implementing proper routing, middleware, and error handling.

## Assignment Overview

You will:
1. Set up an Express.js server
2. Create RESTful API routes for a product resource
3. Implement custom middleware for logging, authentication, and validation
4. Add comprehensive error handling
5. Develop advanced features like filtering, pagination, and search

## Getting Started

1. Accept the GitHub Classroom assignment invitation
2. Clone your personal repository that was created by GitHub Classroom
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create your environment file:
   - Copy `.env.example` to `.env` and set values (see Environment Variables)
5. Run the server:
   ```bash
   npm start
   # or use auto-reload during development
   npm run dev
   ```

## Files Included

- `Week2-Assignment.md`: Detailed assignment instructions
- `server.js`: Express.js server with routes, middleware, and error handling
- `.env.example`: Example environment variables file
- `package.json`: Scripts and dependencies

## Requirements

- Node.js (v18 or higher)
- npm or yarn
- API client: curl, Postman, or Insomnia

## Environment Variables

Create a `.env` file at the project root using `.env.example` as a template.

- `PORT` (optional): Port for the HTTP server. Default: `3000`
- `API_KEY` (required for write operations): API key that must be sent via the `x-api-key` header for POST/PUT/DELETE routes. Default (if unset): `dev-secret-key`

## Running

- Start: `npm start`
- Dev (auto-reload): `npm run dev`
- Server URL: `http://localhost:3000`

## Middleware

- **JSON parser**: Parses JSON bodies via `body-parser.json()`
- **Logger**: Logs `[timestamp] METHOD URL` for each request
- **Auth**: Requires `x-api-key` for POST/PUT/DELETE
- **Validation**: Validates product payload on create/update
- **404 handler**: Returns `{ message: 'Route not found' }`
- **Global error handler**: Uniform JSON errors `{ message, details?, stack? }`

## Product Model

```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "price": 1200,
  "category": "electronics",
  "inStock": true
}
```

## API Endpoints

Base path: `http://localhost:3000`

### List products
- **GET** `/api/products`
- Query params:
  - `category` (string, optional) — filter by category
  - `page` (number, optional, default 1)
  - `limit` (number, optional, default 10)
- Response:
  ```json
  {
    "total": 3,
    "page": 1,
    "limit": 10,
    "totalPages": 1,
    "data": [ { "id": "1", "name": "Laptop", ... } ]
  }
  ```
- Examples:
  - `GET /api/products`
  - `GET /api/products?category=electronics`
  - `GET /api/products?page=1&limit=2`

### Get product by ID
- **GET** `/api/products/:id`
- Responses:
  - `200` with product JSON
  - `404` `{ "message": "Product not found" }`

### Search products by name
- **GET** `/api/products/search?name=coffee`
- Case-insensitive substring match on `name`
- Response: `200` array of matching products

### Product stats
- **GET** `/api/products/stats`
- Response:
  ```json
  {
    "countByCategory": { "electronics": 2, "kitchen": 1 },
    "total": 3
  }
  ```

### Create product
- **POST** `/api/products`
- Headers: `Content-Type: application/json`, `x-api-key: <your-key>`
- Body:
  ```json
  {
    "name": "Headphones",
    "description": "Noise-cancelling",
    "price": 199.99,
    "category": "electronics",
    "inStock": true
  }
  ```
- Responses:
  - `201` with created product
  - `400` `{"message":"Invalid payload","details":{"errors":[...]}}`
  - `401` `{"message":"Unauthorized: invalid or missing API key"}`

### Update product
- **PUT** `/api/products/:id`
- Headers: `Content-Type: application/json`, `x-api-key: <your-key>`
- Body: same schema as Create (full update)
- Responses:
  - `200` with updated product
  - `400` validation error as above
  - `401` unauthorized
  - `404` not found

### Delete product
- **DELETE** `/api/products/:id`
- Headers: `x-api-key: <your-key>`
- Responses:
  - `204` no content
  - `401` unauthorized
  - `404` not found

## Example Requests (PowerShell)

Use `curl.exe` in PowerShell (not the `curl` alias):

```powershell
# List
curl.exe "http://127.0.0.1:3000/api/products?page=1&limit=2"

# Filter
curl.exe "http://127.0.0.1:3000/api/products?category=electronics"

# Search
curl.exe "http://127.0.0.1:3000/api/products/search?name=coffee"

# Stats
curl.exe http://127.0.0.1:3000/api/products/stats

# Create (requires API key)
curl.exe -X POST http://127.0.0.1:3000/api/products -H "Content-Type: application/json" -H "x-api-key: dev-secret-key" -d "{ \"name\":\"Headphones\", \"description\":\"Noise-cancelling\", \"price\":199.99, \"category\":\"electronics\", \"inStock\":true }"

# Update (requires API key)
curl.exe -X PUT http://127.0.0.1:3000/api/products/1 -H "Content-Type: application/json" -H "x-api-key: dev-secret-key" -d "{ \"name\":\"Laptop Pro\", \"description\":\"Upgraded\", \"price\":1500, \"category\":\"electronics\", \"inStock\":true }"

# Delete (requires API key)
curl.exe -X DELETE http://127.0.0.1:3000/api/products/1 -H "x-api-key: dev-secret-key"