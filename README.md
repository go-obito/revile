## Revile

Revile is a single-owner blog with MongoDB-backed posts and a server-authenticated writing desk.

## Getting Started

1. Copy `.env.example` to `.env.local`.
2. Set `MONGODB_URI` to your MongoDB connection string, choose an `AUTH_SECRET` with a long, random value, and add your `IMAGEKIT_PUBLIC_KEY` and `IMAGEKIT_PRIVATE_KEY` from ImageKit.
3. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

On the first visit to `/sign-in`, create the sole owner account. The account is stored in MongoDB with a bcrypt password hash; later visits can only sign in.

Published posts are visible on `/`. Drafts and all post mutations require the server-verified admin session.

Article and cover images upload directly to ImageKit. The browser receives a short-lived upload signature from the authenticated server; the ImageKit private key remains server-only.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
