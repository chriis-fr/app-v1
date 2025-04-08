# App-v1

## Environment Setup

This project requires environment variables to be set up correctly. Follow these steps to configure your environment:

1. Copy the `.env.example` file in the root directory to `.env` and update the values with your actual credentials.
2. Copy the `server/.env.example` file to `server/.env` and update the values with your actual database credentials.

### Required Environment Variables

#### Root Directory (.env)
- `SESSION_SECRET`: Secret key for session encryption
- `MONGODB_URI`: MongoDB connection string
- `VITE_CALENDLY_USERNAME`: Your Calendly username
- `PORT`: Server port (default: 5000)
- `JWT_SECRET`: Secret key for JWT token generation

#### Server Directory (server/.env)
- `MONGODB_URI`: MongoDB connection string
- `DATABASE_URL`: Database connection string (same as MONGODB_URI for MongoDB)

## Security Notes

- Never commit your actual `.env` files to version control
- Keep your database credentials secure
- The `.gitignore` file is configured to exclude sensitive files from being committed

## Development

```bash
# Install dependencies
npm i
bun i #faster

# Start development server
npm run dev
```

## Production

```bash
# Build for production
npm run build

# Start production server
npm start
``` 