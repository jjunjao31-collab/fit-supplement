# FIT SUPPLEMENT — Clinical Sports Nutrition & Official Store

เว็บไซต์ให้ข้อมูลอาหารเสริมอิงหลักฐานทางวิทยาศาสตร์ (AIS / ISSN / อย. ไทย) พร้อมร้านค้าออนไลน์ครบวงจร ระบบคำนวณโปรตีนและ BMI/TDEE ระบบตะกร้าสินค้าและการตัดสต็อกแบบ Atomic Transaction และระบบจัดการหลังบ้าน RBAC 3 บทบาท (`Member`, `Staff`, `Admin`)

- **Live Production**: https://fit-supplement.vercel.app
- **Tech Stack**: Next.js 16 (App Router + Turbopack + Cache Components), React 19, TypeScript (Strict), Tailwind CSS v4, Framer Motion, Recharts, Dual-SQL (`Neon Cloud PostgreSQL` + `MySQL`), JWT (`jose`) + `bcryptjs`

## Core Features

- **Official Store (`/store`, `/store/[id]`)**: คลังสินค้า 34 รายการพร้อมเลข อย. กรองตามหมวดหมู่ แบรนด์ เป้าหมาย ช่วงราคา และสถานะสต็อก
- **Clinical Encyclopedia (`/supplements`, `/goals`, `/compare`, `/articles`, `/safety`)**: ฐานข้อมูลสารอาหารเสริมอ้างอิงงานวิจัย พร้อมตารางเปรียบเทียบและแนวทางความปลอดภัย
- **Protein & BMI/TDEE Calculator (`/calculator/protein`)**: คำนวณความต้องการโปรตีนรายวันตามเกณฑ์ ISSN พร้อมรองรับการปรับน้ำหนักตามค่า Asian BMI
- **Global Search & AI Advisor (`Ctrl+K`)**: ค้นหาสินค้า สารานุกรม และบทความได้ทุกหน้า พร้อมผู้ช่วยแนะนำเซตอาหารเสริม
- **Cart & Atomic SQL Checkout**: คำนวณราคาฝั่งเซิร์ฟเวอร์และตัดสต็อกใน SQL Transaction (`FOR UPDATE`)
- **RBAC Backoffice & Analytics (`/admin`, `/admin/users`, `/sql`)**:
  - `Member`: สั่งซื้อสินค้า สะสมแต้ม จัดการที่อยู่ และดูประวัติออเดอร์ของตัวเอง
  - `Staff`: จัดการสินค้า อัปเดตราคา/สต็อก และอัปเดตสถานะออเดอร์
  - `Admin`: สิทธิ์เต็มรูปแบบ รวมการจัดการผู้ใช้ บทบาท และดูข้อมูลตาราง SQL Inspector (`/sql`)

## Local Development

```bash
npm install
cp .env.example .env.local
npm run dev
```

เปิด http://localhost:3000

## Database Support

โค้ดใน `src/lib/db.ts` รองรับฐานข้อมูล SQL 2 รูปแบบอัตโนมัติ:
1. **Neon Cloud PostgreSQL (Production บน Vercel)**: เมื่อตั้งค่า `DATABASE_URL` หรือ `POSTGRES_URL`
2. **MySQL / TiDB Cloud (Local XAMPP)**: เมื่อไม่ได้ตั้งค่า `DATABASE_URL` (มีไฟล์ SQL Dump อยู่ที่ `data/fitsupp.sql`)
