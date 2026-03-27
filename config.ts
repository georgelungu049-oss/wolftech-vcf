// =============================================================
//  WOLFTECH VCF — YOUR SETTINGS (edit this file to set up)
// =============================================================
//
//  This is the ONLY file you need to change before deploying.
//
//  DATABASE_URL
//    A PostgreSQL connection string. Get one for free at:
//      → https://neon.tech        (recommended, works great with Vercel)
//      → https://supabase.com
//      → https://railway.app
//    It will look like:
//      postgresql://username:password@host/database?sslmode=require
//
//  ADMIN_PIN
//    The password to log in to your admin panel at /admin
//    Change this to anything you want (numbers or letters)
//
//  CONTACT_TARGET
//    How many contacts need to be collected before the VCF
//    download button unlocks on the public page.
//    You can also change this anytime from the /admin panel.
//
// =============================================================

export const config = {
  DATABASE_URL: "postgresql://your_user:your_password@your_host/your_db?sslmode=require",

  ADMIN_PIN: "wolf906",

  CONTACT_TARGET: 50,
};
