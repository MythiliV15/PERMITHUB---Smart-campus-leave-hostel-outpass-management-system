# 🛡️ PermitHub — College Permission Automation System

[![Spring Boot](https://img.shields.io/badge/Backend-Spring%20Boot%203.2-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/Frontend-React%2018-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![MySQL](https://img.shields.io/badge/Database-MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

PermitHub is a comprehensive, enterprise-grade digital solution designed to automate and streamline student permission workflows in educational institutions. It replaces manual paper-based processes with a secure, hierarchical approval system for Leaves, OD (On-Duty), and Outpasses.

---

## 🚀 Key Features

- **⚡ Hierarchical Approvals**: Intelligent routing through Mentors, Class Advisors, HODs, Wardens, AOs, and Principals.
- **📱 WhatsApp Integration**: Tokenized, non-login approval links for parents via Twilio/Fast2SMS.
- **🛡️ QR Gate Pass**: Real-time QR code generation and scanning for security personnel to track entries/exits.
- **📊 Smart Leave Tracking**: Automated leave balance management per student per semester.
- **📎 Bulk Operations**: Excel-based bulk onboarding for students and faculty data.
- **🔔 Real-time Notifications**: Instant in-app alerts for pending requests and approval status updates.
- **🧪 API Documentation**: Integrated Swagger/OpenAPI UI for easy backend exploration.

---

## 📸 Screenshots

| Dashboard | Outpass Request | QR Scanner |
| :---: | :---: | :---: |
| ![Dashboard Placeholder](https://via.placeholder.com/400x250?text=Dashboard+UI) | ![Request Placeholder](https://via.placeholder.com/400x250?text=Request+Flow) | ![QR Scanner Placeholder](https://via.placeholder.com/400x250?text=QR+Gate+Pass) |

---

## 🏗️ System Architecture

### Approval Workflows

#### 1. Outpass Workflow (The most secure)
```mermaid
graph TD
    A[Student Request] --> B[Mentor Approval]
    B --> C[Parent WhatsApp Link]
    C --> D[Class Advisor]
    D --> E[Warden Approval]
    E --> F[AO / Principal]
    F --> G[QR Code Generated]
    G --> H[Security Scan & Exit]
```

#### 2. Leave & OD Workflow
```mermaid
graph LR
    S[Student] --> M[Mentor]
    M --> CA[Class Advisor]
    CA --> HOD[HOD Approval]
    HOD --> P[Parent Notified]
```

---

## 🛠️ Technical Stack

- **Backend**: Java 17, Spring Boot 3.2, Spring Security (JWT), Spring Data JPA, Hibernate, Maven.
- **Frontend**: React 18, Vite, Redux Toolkit, Tailwind CSS, Axios, Lucide Icons.
- **Database**: MySQL 8.0+.
- **Third-Party**: Twilio (WhatsApp/SMS), ZXing (QR Codes), Apache POI (Excel).

---

## ⚙️ Setup & Installation

### 1. Prerequisites
- JDK 17+
- Node.js 18+
- MySQL 8.0+
- Maven 3.8+

### 2. Database Configuration
```sql
CREATE DATABASE smart_permithub;
-- Use the database/schema.sql file to seed initial data
```

### 3. Backend Setup
```bash
cd backend
# Create a .env file with the following keys:
DB_URL=jdbc:mysql://localhost:3306/smart_permithub?createDatabaseIfNotExist=true
DB_USERNAME=root
DB_PASSWORD=your_password
JWT_SECRET=your_super_secret_key
MAIL_USERNAME=your_email
MAIL_PASSWORD=your_app_password

mvn clean install
mvn spring-boot:run
```

### 4. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 🐳 Docker Deployment

The project includes Docker support for easy deployment on platforms like Render, Railway, or DigitalOcean.

**Backend (Render/Generic):**
```bash
docker build -t permithub-backend ./backend
```

**Frontend:**
```bash
docker build -t permithub-frontend ./frontend
```

---

## 🔑 Default Accounts

| Role | Email | Password |
| :--- | :--- | :--- |
| **HOD / Admin** | `hod.cse@college.edu` | `Admin@123` |
| **Faculty** | `faculty.priya@college.edu` | `Admin@123` |
| **Student** | `2k22it31@kiot.ac.in` | `Admin@123` |
| **Security** | `security@college.edu` | `Admin@123` |

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing
Contributions are welcome! Please open an issue or submit a pull request for any improvements.

---
⭐ **If you find this project helpful, give it a star on GitHub!**
