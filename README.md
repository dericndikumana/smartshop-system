# 🛒 SmartShop System

Welcome to **SmartShop**, a modern, multi-tenant Point of Sale (POS) and inventory management system designed for seamless retail operations. 

![SmartShop Banner](./public/banner-placeholder.png) <!-- Replace this with an actual image in your public folder -->

🌍 **Live Demo:** [https://smartshop-system.vercel.app](https://smartshop-system.vercel.app)

*(Note: Default credentials are not provided publicly for security reasons. Please contact the administrator for access.)*

---

## 🌟 What is SmartShop?

SmartShop is a robust, cloud-based platform built to help business owners, shop administrators, and cashiers manage their day-to-day retail operations efficiently. It supports a multi-tier hierarchy:

1. **Super Admin:** The highest level of access. Manages the global system, onboards new tenant shops, oversees all shop administrators, and tracks global system sales across the entire SaaS platform.
2. **Shop Admin:** Manages a specific shop. Can add products, manage inventory (stock in/out), configure VAT/receipt settings, onboard cashiers, and view detailed shop-specific revenue and sales reports.
3. **Cashier (Staff):** The point-of-sale operator. Can process sales, hold carts for later, search inventory, manage different currencies, and print localized receipts.

## ✨ Key Features

- 🏢 **Multi-Tenant Architecture:** Host multiple distinct shops under one unified system.
- 💰 **Multi-Currency Support:** Process sales and view revenue breakdowns in various currencies (e.g., RWF, USD, EUR) with dynamic totals.
- 📦 **Inventory Management:** Track stock levels, low-stock alerts, product categories, and barcodes.
- 🧾 **Advanced POS System:** A sleek, user-friendly cashier interface with support for VAT, discounts, cart holding, and instant receipt generation.
- 📱 **WhatsApp Integration:** Share receipts directly with customers via WhatsApp in one click.
- 🔒 **Role-Based Access Control (RBAC):** Strict security ensuring cashiers only see POS tools, while admins see analytics and configurations.
- 🎨 **Beautiful UI/UX:** Built with Tailwind CSS and Next.js, featuring dark mode, glassmorphism, smooth animations, and real-time toast notifications.
- 🛡️ **Session Management:** Real-time account suspension features that instantly log out blocked users.

---

## 📸 Screenshots

*(Feel free to upload your screenshots to the `public/docs` folder and link them here!)*

### Super Admin Dashboard
![Super Admin](./public/superadmin-placeholder.png)

### Shop Admin Analytics
![Shop Admin](./public/shopadmin-placeholder.png)

### Cashier POS Interface
![POS System](./public/pos-placeholder.png)

---

## 🛠️ Technology Stack

SmartShop is built using cutting-edge web technologies to ensure speed, security, and scalability:

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Database:** PostgreSQL (managed via [Prisma ORM](https://www.prisma.io/))
- **Authentication:** [NextAuth.js](https://next-auth.js.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Deployment:** [Vercel](https://vercel.com/)

---

## 🚀 Getting Started (Local Development)

If you'd like to run SmartShop locally for development or testing:

### Prerequisites
- Node.js (v18 or higher)
- A PostgreSQL database URL

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/dericndikumana/smartshop-system.git
   cd smartshop-system
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory and add your database URL and NextAuth secret:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/smartshop"
   NEXTAUTH_SECRET="your-super-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Run database migrations:**
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

6. **Open the app:**
   Visit `http://localhost:3000` in your browser.

---

## 📞 Support & Contact

If you have any questions, encounter issues, or need administrative access to the live deployment, please contact the **System Administrator**:

- **Phone/WhatsApp:** +250 781 096 567
- **Email:** ndikumanaderic2@gmail.com

---
*Built with ❤️ for modern retail.*
