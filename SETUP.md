# E-Commerce Store Setup Guide

## 🎉 Your Store is Ready!

Your e-commerce platform with WhatsApp ordering is now fully functional! 

## 🚀 Features

- **Product Gallery**: Beautiful responsive product catalog
- **Product Details**: Individual product pages with full information
- **WhatsApp Integration**: One-click ordering via WhatsApp
- **Admin Dashboard**: Full CRUD operations for products
- **Authentication**: Secure login system for admin access
- **Responsive Design**: Works perfectly on all devices

## ⚙️ Important Configuration

### WhatsApp Number Setup

**IMPORTANT**: You need to configure your WhatsApp business number for the ordering feature to work.

1. Open `src/pages/ProductDetail.tsx`
2. Find line 16: `const WHATSAPP_NUMBER = '1234567890';`
3. Replace `1234567890` with your WhatsApp number (include country code, no + sign)
   - Example for US: `12025551234`
   - Example for UK: `447700900000`

## 🔐 Admin Access

To access the admin dashboard:

1. Visit your site and click "Sign In"
2. Create an account using the Sign Up tab
3. Once logged in, you'll have full access to manage products

**Note**: Email confirmation is disabled for easy testing. All signups are automatically confirmed.

## 📱 Using the Store

### For Customers:
1. Browse products on the homepage
2. Click any product to view details
3. Click "Order on WhatsApp" to start a conversation
4. The product details will be pre-filled in WhatsApp

### For Admins:
1. Log in via `/login`
2. Access admin dashboard at `/admin`
3. Add, edit, or delete products
4. Upload product images (use direct image URLs)

## 🎨 Customization

The store uses a modern teal color scheme. To customize:

- **Colors**: Edit `src/index.css` (HSL values)
- **Layout**: Modify component files in `src/pages/`
- **Hero Image**: Replace `src/assets/hero-bg.jpg`

## 📊 Database

Your products are stored in a Lovable Cloud database with:
- Automatic backups
- Row-level security
- Real-time updates

View your backend data anytime through the Lovable Cloud interface.

## 🔗 Routes

- `/` - Product gallery (public)
- `/product/:id` - Product detail page (public)
- `/login` - Authentication (public)
- `/admin` - Admin dashboard (protected)
- `/admin/new` - Add new product (protected)
- `/admin/edit/:id` - Edit product (protected)

## 💡 Tips

- Use high-quality product images (recommended: 800x800px or larger)
- Keep product names concise but descriptive
- Write compelling product descriptions
- Test the WhatsApp integration with your actual number
- Regularly backup your product data

## 🆘 Need Help?

- Check the Lovable Cloud dashboard for backend data
- Review console logs for any errors
- Ensure your WhatsApp number is correctly formatted

Enjoy your new e-commerce platform! 🎊
