# Portfolio Website (Vanilla HTML/CSS/JS)

เว็บไซต์พอร์ตโฟลิโอแบบหน้าเดียว (ภาษาไทย) 

## โครงสร้างไฟล์

- `index.html` โครงหน้าเว็บหลัก
- `assets/css/styles.css` ระบบสไตล์, responsive, motion
- `assets/js/content.js` แหล่งข้อมูลกลางของเว็บไซต์ (แก้คอนเทนต์ที่ไฟล์นี้)
- `assets/js/main.js` render ข้อมูลและพฤติกรรมหน้าเว็บ
- `assets/img/` โฟลเดอร์เก็บรูปภาพ/ไอคอน

## วิธีแก้คอนเทนต์

แก้ข้อมูลทั้งหมดได้จากไฟล์นี้:

- `assets/js/content.js`

โครงสร้างหลักที่ใช้:

```js
siteContent = {
  profile: { name, role, intro, location },
  hero: { primaryCtaLabel, secondaryCtaLabel },
  skills: [{ name, level }],
  projects: [{ title, summary, tech: [], demoUrl, repoUrl, imageAlt }],
  experience: [{ period, title, org, details }],
  contact: { email, phone, social: [{ label, url }] }
};
```

## รันในเครื่อง (ตัวอย่าง)

จากโฟลเดอร์ `portfolio` สามารถใช้ static server ได้ เช่น:

```bash
python3 -m http.server 8080
```

แล้วเปิด `http://localhost:8080`

## Deploy บน Netlify

1. Push โค้ดขึ้น Git repository
2. เข้า Netlify แล้วเลือก **Add new site** > **Import from Git**
3. ตั้งค่า publish directory เป็น:

```text
portfolio
```

4. Deploy site
5. ทดสอบส่งฟอร์มที่หน้า Contact
6. ตรวจข้อความที่ส่งใน Netlify Dashboard > **Forms**

## Netlify Form ที่ใช้งาน

ใน `index.html` ฟอร์มถูกตั้งค่าไว้แล้วด้วย:

- `data-netlify="true"`
- hidden input `form-name`
- fields: `name`, `email`, `message`

หลัง submit สำเร็จ จะ redirect กลับหน้าเดิมพร้อม hash `#contact-success`

## หมายเหตุ

- เว็บไซต์นี้เป็น Light theme only
- รองรับ mobile/tablet/desktop
- มี motion แบบ subtle และรองรับ `prefers-reduced-motion`
