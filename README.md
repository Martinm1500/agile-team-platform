# Agile Team Platform

A collaborative platform designed for agile teams to communicate, organize tasks, and coordinate work in real time.

This project is a **full-stack application** built with a Java backend and a modern JavaScript frontend.

---

## 🚀 Features

* Real-time team communication
* Task and workflow organization
* Agile team collaboration tools
* REST API for client-server communication
* Real-time updates using WebSockets

---

## 📸 Screenshots

### 👥 Team Manager
> Manage your team members and view their roles within the project.

![Team Manager](images/team-manager.png)

---

### 📋 Kanban Board
> Visualize and manage tasks across columns: To Do, In Progress, Review, and Done.

![Kanban Board](images/kanban.png)

---

### 📝 Notes
> Organize knowledge, ideas, and references in a grid-based notes view.

![Notes](images/notes.png)

---

### ✏️ Note Editor
> Create and edit notes with fields for title, type, content, tags, sources, and insights.

![Note Editor](images/notes-edit.png)

---

### 💬 Text Channels & Tasks Sidebar
> Real-time text communication combined with a persistent task sidebar for quick access.

![Sidebar Tasks](images/sidebar-tasks.png)

---

## 🧱 Tech Stack

### Backend

* Java
* Spring Boot
* REST API
* WebSockets
* Maven

### Frontend

* React
* Vite
* JavaScript / TypeScript

---

## 📂 Project Structure

```
agile-team-platform
│
├── backend
│   └── Spring Boot API
│
├── frontend
│   └── React client application
│
└── README.md
```

---

## 🗄️ Database Schema

> Entity-relationship diagram showing the main tables and their relationships.

<img width="12313" height="5457" alt="database" src="https://github.com/user-attachments/assets/3f53d4d3-b124-4342-9149-0d6a8ad83e4e" />


## ⚙️ Running the Project

### 1️⃣ Clone the repository

```
git clone https://github.com/your-username/agile-team-platform.git
```

---

### 2️⃣ Run the backend

Navigate to the backend folder:

```
cd backend
```

Run the Spring Boot application:

```
./mvnw spring-boot:run
```

or in Windows:

```
mvnw.cmd spring-boot:run
```

The backend will start on:

```
http://localhost:8080
```

---

### 3️⃣ Run the frontend

Navigate to the frontend folder:

```
cd frontend
```

Install dependencies:

```
npm install
```

Start the development server:

```
npm run dev
```

The frontend will start on:

```
http://localhost:5173
```

---

## 📡 Architecture

```
React Frontend
       │
       │ REST API / WebSocket
       ▼
Spring Boot Backend
       │
       ▼
Database
```

---

## 🎯 Purpose of the Project

This project was built to explore:

* full-stack architecture
* real-time communication with WebSockets
* API design with Spring Boot
* modern frontend development with React

---

## 👨‍💻 Author

Martin Muñoz  
Backend Developer focused on building REST APIs and real-time applications using the Spring ecosystem.
