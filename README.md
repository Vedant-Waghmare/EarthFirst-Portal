# 🌍 Earth First Portal

> A Salesforce-powered Community Sustainability Platform built using Experience Cloud, Apex, Lightning Web Components (LWC), and Salesforce Automation.

![Salesforce](https://img.shields.io/badge/Salesforce-CRM-blue?logo=salesforce)
![Experience Cloud](https://img.shields.io/badge/Experience-Cloud-blue)
![Apex](https://img.shields.io/badge/Apex-Programming-orange)
![LWC](https://img.shields.io/badge/Lightning-Web%20Components-purple)

---

## 📖 Overview

Earth First Portal is a community-driven sustainability platform developed on Salesforce to bridge the gap between citizens, volunteers, NGOs, and city authorities.

The platform provides a centralized portal where citizens can report environmental issues, volunteers can participate in green initiatives, organizations can manage campaigns, and administrators can monitor overall community impact through reports and dashboards.

The project demonstrates end-to-end Salesforce application development by combining declarative features with custom Apex development and Lightning Web Components.

---

## 🚀 Key Features

### 🌱 Environmental Issue Management
- Report environmental issues
- Case tracking and resolution
- Citizen notifications upon issue resolution

### 🤝 Volunteer Management
- Volunteer registration
- Participation tracking
- Reward points system
- Badge generation

### 📅 Initiative Management
- Create and manage sustainability campaigns
- Volunteer enrollment
- Attendance management
- Campaign lifecycle automation

### 🏆 Gamification
- Point-based reward system
- Volunteer leaderboard
- Achievement badges

### 🔔 Smart Notifications
- Case resolution notifications
- Volunteer achievement notifications
- Scheduled initiative reminders

### 📊 Reports & Dashboards
- Resolution statistics
- Volunteer engagement
- Initiative performance
- Community impact insights

---

# 🏗 System Architecture

```
                Experience Cloud Portal
                        │
                        ▼
        Lightning Web Components (LWC)
                        │
                        ▼
             Apex Controllers & Services
                        │
                        ▼
             Salesforce Data Model
                        │
                        ▼
      Flows • Apex Triggers • Validation Rules
                        │
                        ▼
     Reports • Dashboards • Notifications
```

The solution follows a layered architecture:

- Presentation Layer
- Business Logic Layer
- Data Layer

---

# 👥 User Roles

### 👤 Citizen

- Report environmental issues
- Track complaint status
- Provide feedback

---

### 🌿 Volunteer

- Register as volunteer
- Join initiatives
- Earn reward points
- View leaderboard

---

### 🏢 NGO / City Corporation

- Create initiatives
- Manage campaigns
- Track participation

---

### 👨‍💼 Administrator

- Monitor reports
- Analyze KPIs
- Manage users

---

# 🗂 Data Model

### Standard Objects

- Account
- Contact
- Case

### Custom Objects

- Volunteer__c
- Initiative__c
- Volunteer_Participation__c
- Feedback__c

### Relationships

- Master-Detail Relationships
- Lookup Relationships
- Junction Object
- Many-to-Many Relationships

---

# ⚙ Automation

## Declarative Automation

- Validation Rules
- Scheduled Flows
- Formula Fields
- Roll-Up Summary Fields

## Programmatic Automation

- Apex Controllers
- Apex Triggers
- Trigger Handler Pattern
- Bulkified Logic
- Dynamic SOQL
- Custom Notifications
- Exception Handling

---

# 💻 Lightning Web Components

The Experience Cloud portal consists of multiple custom LWC components providing an interactive user experience.

Major implementation includes:

- Parent-Child Communication
- @wire Services
- Imperative Apex Calls
- NavigationMixin
- Lightning Data Service
- Custom Events
- Responsive UI

---

# 🔐 Security

- Customer Community Users
- Role-Based Access
- Field Level Security (FLS)
- Apex Class Access
- Sharing Rules

---

# 🛠 Tech Stack

| Category | Technologies |
|-----------|--------------|
| Platform | Salesforce CRM |
| Frontend | Lightning Web Components (LWC), Experience Cloud |
| Backend | Apex, SOQL |
| Automation | Flows, Apex Triggers, Validation Rules |
| Database | Salesforce Objects |
| Reporting | Reports & Dashboards |
| Security | Profiles, Sharing Rules, FLS |

---

# 📚 Salesforce Concepts Implemented

✔ Standard & Custom Objects

✔ Master-Detail Relationships

✔ Lookup Relationships

✔ Junction Objects

✔ Record Types

✔ Formula Fields

✔ Roll-Up Summary Fields

✔ Validation Rules

✔ Scheduled Flows

✔ Apex Classes

✔ Apex Triggers

✔ Trigger Handler Pattern

✔ Bulkification

✔ Dynamic SOQL

✔ Experience Cloud

✔ Lightning Web Components

✔ Parent-Child Communication

✔ Custom Notifications

✔ Reports & Dashboards

---

# 🎯 Learning Outcomes

This project helped strengthen my understanding of:

- Enterprise Salesforce Development
- Cloud CRM Solutions
- Scalable Data Modeling
- Business Process Automation
- Lightning Web Components
- Apex Programming
- Experience Cloud Development
- Salesforce Security
- Enterprise Application Architecture

---

# 📸 Screenshots

> Add screenshots of:

- Home Page
- Dashboard
- Initiatives
- Leaderboard
- Report Issue
- My Profile
- Admin Dashboard

---

# 👨‍💻 Author

**Vedu**

Bachelor of Engineering (Computer Engineering)

Salesforce Developer | Cloud Enthusiast

📧 Email: your-email@example.com

💼 LinkedIn: https://linkedin.com/in/your-profile

---

## ⭐ If you found this project interesting, consider giving it a Star!
