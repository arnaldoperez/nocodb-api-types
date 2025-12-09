# NocoDB API Types Generator

A lightweight utility to automatically generate TypeScript interfaces from your NocoDB project metadata. Keep your frontend or backend code type-safe and in sync with your NocoDB schema.

## Features

- 🚀 **Automatic Type Generation**: Connects to your NocoDB instance and fetches all tables and columns.
- 🔌 **Typed Axios Client**: Generates a fully typed Axios client for your project, enabling autocomplete and type safety for API calls.
- 📦 **Type Mapping**: Intelligently maps NocoDB types (Text, Number, Boolean, etc.) to TypeScript types.
- 🛠 **CLI Support**: Easy-to-use command line interface.
- 🔒 **Secure**: Uses environment variables for configuration.

## Installation

You can install this package as a dev dependency in your project:

```bash
npm install --save-dev nocodb-api-types
```

## Configuration

Create a `.env` file in the root of your project (or ensure these variables are set in your environment):

```env
NOCODB_URL=https://your-nocodb-instance.com
XC_TOKEN=your_api_token
```

> **Note**: You can generate an API token (XC-Token) from your NocoDB account settings.

## Usage

### CLI
 
 Add a script to your `package.json`:
 
 ```json
 {
   "scripts": {
     "nc-generate": "nc-generate"
   }
 }
 ```
 
 Then run:
 
 ```bash
 npm run nc-generate
 ```

 You can optionally specify the output directory:

  ```bash
  npm run nc-generate -- ./my-client-folder
  ```
 
 This will generate types and client files in the `nc-client` directory by default, or the directory you specified.
 
 ### Generated Client Usage
 
 The generator creates a typed client for each of your NocoDB bases. You can import it and use it to interact with your data.
 
 **Backend Usage (with XC-Token):**
 
 Assuming you have a base named "My Store":
 
 ```typescript
 // Import the generated client
 import { MyStoreClient } from './nc-client/my-store-client';
 
 // Initialize the client with XC-Token (for backend)
 const db = new MyStoreClient({
   baseURL: process.env.NOCODB_URL,
   xcToken: process.env.XC_TOKEN
 });
 ```

 **Frontend Usage (with XC-Auth):**

 If you are using the client in a frontend application where you have a user's auth token:

 ```typescript
  // Initialize the client with XC-Auth (for frontend)
 const db = new MyStoreClient({
   baseURL: process.env.NOCODB_URL,
   xcAuth: 'user_auth_token_here' 
 });
 ```

 **Data Operations:**

 ```typescript
 // List records
 const products = await db.Products.list({ limit: 10 });
 console.log(products.list);
 
 // Get a single record
 const product = await db.Products.get(1);
 
 // Create a record
 await db.Products.create({
   Name: 'New Product',
   Price: 99.99
 });
 
 // Update a record
 await db.Products.update(1, { Price: 89.99 });
 
 // Delete a record
 await db.Products.delete(1);
 ```

## Development

### Setup

1. Clone the repository.
2. Install dependencies: `npm install`.
3. Create a `test.env` file for integration testing.

### Testing

Run integration tests (requires `test.env`):

```bash
npm run test:integration
```

### Build

Build the project for production/npm:

```bash
npm run build
```

## Support the developer

They say developers turn coffee into code. I'm experimenting with a new runtime environment: turning beer into features! 🍺

If this tool saved you time, consider fueling the next release with a cold one:

[Buy me a beer 🍺](https://buymeacoffee.com/arnaldodev)

## License

ISC
