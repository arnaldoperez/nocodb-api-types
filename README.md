# NocoDB API Types Generator

A lightweight utility to automatically generate TypeScript interfaces from your NocoDB project metadata. Keep your frontend or backend code type-safe and in sync with your NocoDB schema.

## Features

- 🚀 **Automatic Type Generation**: Connects to your NocoDB instance and fetches all tables and columns.
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
    "generate:types": "noco-gen"
  }
}
```

Then run:

```bash
npm run generate:types
```

This will generate a file at `src/types/noco-generated.ts` containing interfaces for all your tables.

### Example Output

If you have a table named `Users` with columns `Name` (Text) and `Age` (Number), the generator will produce:

```typescript
// Table: Users (users)
export interface Users {
  Name?: string;
  Age?: number;
  // ... other columns
}
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

## GitHub Actions

This repository includes a GitHub Action to automatically publish to npm when you push to the `main` branch.

1.  Go to your GitHub repository settings.
2.  Navigate to **Secrets and variables** > **Actions**.
3.  Create a new repository secret named `NPM_TOKEN` with your npm automation token.

## License

ISC
