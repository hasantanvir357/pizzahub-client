# 🍕 PizzaHub — Online Pizza Ordering & Multi-Vendor Platform (Client)

PizzaHub is a modern, full-stack food ordering and restaurant management web application built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and **ShadCN UI**. It supports seamless multi-role workflows for **Customers**, **Vendors (Kitchen Partners)**, and **Admins**, complete with Google OAuth, persistent shopping cart, single/bulk checkout, and Stripe-powered vendor subscriptions.

---

## 🌐 Live Links
- **Live Client URL:** `https://your-pizzahub-client.vercel.app` *(Replace after Vercel deploy)*
- **Live Server API URL:** `https://your-pizzahub-server.onrender.com` *(Replace after Render/Vercel deploy)*

---

## ✨ Key Features

### 👤 Customer Experience
- **Menu Discovery & Filtering:** Browse handcrafted pizzas by category, search dynamically, view detailed ingredients, sizes (`Regular`, `Medium`, `Large`), and customer ratings.
- **Interactive Shopping Cart:** Slide-over Cart Drawer with real-time item count badges, quantity adjustments, item deletion, individual item checkout, and full-cart checkout.
- **Dedicated Checkout Flow:** Protected `/checkout` page supporting both single-item and bulk-cart orders with delivery address validation.
- **Wishlist & Reviews:** Save favorite pizzas to a personal wishlist and submit 1–5 star ratings and reviews on menu items.
- **Order Tracking & Analytics:** View real-time order status updates and personal order spending analytics in the Customer Dashboard.

### 👨‍🍳 Vendor (Kitchen Partner) Panel
- **Menu Management:** Create, view, and manage custom pizza listings with image uploads (ImgBB integration).
- **Freemium Tier Enforcement:** Free plan vendors can list up to **3 active menu items** with clear upgrade prompts.
- **Stripe Premium Subscription:** Seamless upgrade to **Premium ($19.99/mo)** via Stripe Checkout to unlock unlimited menu items and featured placement.
- **Kitchen Order Fulfillment:** Track incoming customer orders and update preparation/delivery statuses.

### 🛡️ Admin Panel
- **Menu Moderation:** Approve or reject newly submitted vendor pizza items before they go public.
- **User & Role Management:** Promote or demote users across `Customer`, `Vendor`, and `Admin` roles, or block/unblock accounts with self-protection safeguards.
- **Platform Analytics & Read-Only Transactions:** Monitor platform-wide orders, revenue metrics, and immutable Stripe/payment transaction logs.

---

## 🛠️ Tech Stack
- **Framework:** Next.js 16 (App Router), React, TypeScript
- **Styling & UI:** Tailwind CSS, ShadCN UI, Lucide Icons, Framer Motion
- **Authentication:** Better Auth (Google OAuth) + Custom JWT Role Synchronization
- **Payments:** Stripe Checkout
- **Image Hosting:** ImgBB API

---

## 🔐 Demo Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `hasantanvir357@gmail.com` | `Admin@123` *(or Google Sign-In)* |
| **Vendor** | `vendor@gmail.com` | `Vendor@123` |
| **Customer** | `customer@gmail.com` | `Customer@123` |

---

## 🚀 Local Setup & Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/your-username/pizzahub-client.git](https://github.com/your-username/pizzahub-client.git)
   cd pizzahub-client
