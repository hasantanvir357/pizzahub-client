This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

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

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

## Challenge Implementation Notes

### Advanced search, filtering and sorting

The browse menu page (`src/app/(public)/menu/page.tsx`) builds its request from
the search box, category pills, the location filter and the sort dropdown. All
filters are sent to the Express API as query parameters on `GET /api/menu`:

| Parameter | Example | Purpose |
| --- | --- | --- |
| `search` | `?search=pepperoni` | Advanced search across pizza name, toppings and restaurant name (debounced 300 ms). |
| `category` | `?category=Veggie%20Delight` | Category filter; omitted when `All` is selected. |
| `location` | `?location=Dhaka` | Location / kitchen filter; omitted when `All Locations` is selected. |
| `sort` | `?sort=price_asc` or `?sort=price_desc` | Price sorting: ascending (`price_asc`) or descending (`price_desc`). |

Example: `GET /api/menu?search=chicken&category=Classic%20Pizza&location=Dhaka&sort=price_asc`

On the client the same list is also filtered by location and sorted by
`price` in a `useMemo`, so changing the **Sort by Price** dropdown
(`Default`, `Price: Low to High`, `Price: High to Low`) updates the grid
instantly even if the backend ignores the `sort` parameter. Location options
are derived from the menu data (`location` field, falling back to
`restaurantName`).

### Express JWT verification and role-based authorization

The API protects private endpoints with a middleware chain:

1. `verifyToken` reads the `Authorization: Bearer <token>` header, verifies the
   JWT signature/expiry and attaches the decoded user to `req.user`. Requests
   with a missing or invalid token are rejected before reaching the handler.
2. `verifyAdmin`, `verifyVendor` and `verifyCustomer` run after `verifyToken`
   and check `req.user.role`. Admin-only routes (menu approval, user blocking,
   all orders) use `verifyAdmin`; vendor routes (adding/managing menu items and
   subscription) use `verifyVendor`; customer routes (placing orders, favorites,
   profile orders) use `verifyCustomer`.

The client sends the token automatically via `getToken()` (the
`pizzahub_token` cookie set at login). Route guards complement the middleware:
`proxy.ts` guards full document loads to `/dashboard`, the dashboard layout
waits for session hydration before redirecting, and `/menu/[id]` redirects
logged-out visitors to `/sign-in`.

---

## Testing Instructions & Stripe Test Card

1. Install dependencies and start the app:

   ```bash
   npm install
   npm run dev
   ```

2. Open [http://localhost:3000](http://localhost:3000). Browse the menu, try
   the search/category/location filters, the **Sort by Price** dropdown and the
   Sun/Moon toggle in the navbar. Save pizzas with the heart icon and open
   **Dashboard → My Favorites** (customer account) to review or remove them.

3. Sign in with a **customer** account to check out. Only orders whose status
   is `Pending` show a **Cancel Order** button; cancelling asks for a reason
   and confirmation before calling `PATCH /api/orders/:id/cancel`.

4. For card payments use the Stripe test card below. No real charge is made:

   | Field | Test value |
   | --- | --- |
   | Card number | `4242 4242 4242 4242` |
   | Expiry date | `12/28` (any future date in `MM/YY` format) |
   | CVC | `123` (any 3 digits) |

