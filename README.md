# 🚀 Product Hunt - Social Project Showcase Platform

A full-stack web application for showcasing, discovering, and voting on innovative projects. Built with React, Node.js, Express, and MongoDB.

## ✨ Features

- 🎯 **Project Showcase** - Browse and discover new projects
- 👍 **Voting System** - Upvote your favorite projects
- 💬 **Feedback System** - Submit feedback with email notifications
- 👥 **Friends & Messaging** - Connect with other users
- 💾 **Save Projects** - Bookmark projects for later
- 📧 **Email Notifications** - Get notifications for important updates
- 🌙 **Dark/Light Theme** - Toggle between themes
- 👤 **User Profiles** - Customize your profile with avatar and bio
- 🔐 **Authentication** - Secure JWT-based authentication
- 📱 **Responsive Design** - Works on desktop and mobile devices

## 🛠️ Tech Stack

### Frontend
- **React** - UI library
- **CSS3** - Styling with custom components
- **Context API** - State management

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Nodemailer** - Email sending
- **Multer** - File upload handling
- **CORS** - Cross-origin resource sharing

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v14 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) (running on localhost:)
- npm or yarn package manager

## 🚀 Installation & Setup

### Backend Setup

1. Navigate to the backend directory:
```bash
cd "Product Hunt\backend"
```

2. Install dependencies including nodemailer:
```bash
npm install nodemailer
```

3. Create a `.env` file in the backend directory with your configuration:
```env
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASSWORD=your_gmail_app_password

MONGODB_URI=mongodb://localhost:/myapp

JWT_SECRET=your_jwt_secret_key
```

**Note:** For Gmail, you need to:
- Enable 2-factor authentication on your Google account
- Generate an App Password at https://myaccount.google.com/apppasswords
- Use the generated 16-character password in `EMAIL_PASSWORD`

4. Start the backend server:
```bash
node server.js
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. In a new terminal, navigate to the frontend directory:
```bash
cd "Product Hunt\frontend"
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## 📦 Running the Application

Make sure MongoDB is running, then follow these steps:

### Terminal 1 - Backend:
```bash
cd "Product Hunt\backend"
npm install nodemailer
node server.js
```

### Terminal 2 - Frontend:
```bash
cd "Product Hunt\frontend"
npm install
npm start
```

Then open your browser and navigate to `http://localhost:3000`

## 📁 Project Structure

```
Product Hunt/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── contexts/
│   │   ├── services/
│   │   └── index.js
│   └── package.json
├── backend/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   ├── uploads/
│   ├── server.js
│   ├── .env
│   └── package.json
└── README.md
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Users
- `GET /api/users/me` - Get current user
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/change-password` - Change password
- `POST /api/users/request-email-change` - Request email change
- `PUT /api/users/verify-email-change` - Verify email change

### Feedback
- `POST /api/feedback` - Submit feedback

### Friends
- `GET /api/friends` - Get friends list
- `POST /api/friends/request/:userId` - Send friend request
- `PUT /api/friends/request/:requestId/accept` - Accept friend request
- `DELETE /api/friends/:userId` - Remove friend

### Messages
- `GET /api/messages/:friendId` - Get messages with friend
- `POST /api/messages/:friendId` - Send message

## 🔐 Environment Variables

Create a `.env` file in the backend directory:

```env
# Gmail Configuration
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# MongoDB
MONGODB_URI=mongodb://localhost:27017/myapp

# JWT
JWT_SECRET=your_secret_key_here
```

## 📧 Email Configuration

The application uses Gmail SMTP for sending emails. To set it up:

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Step Verification if not already enabled
3. Go to [App Passwords](https://myaccount.google.com/apppasswords)
4. Select "Mail" and "Windows Computer"
5. Copy the 16-character password
6. Add it to your `.env` file as `EMAIL_PASSWORD`

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `net start MongoDB` (Windows)
- Check if MongoDB is listening on localhost:27017

### Email Sending Not Working
- Verify Gmail app password in `.env` file
- Check 2-factor authentication is enabled
- Look for error logs in the backend console

### Frontend Can't Connect to Backend
- Ensure backend is running on http://localhost:5000
- Check CORS settings in backend
- Verify network connectivity between frontend and backend

## 📝 License

This project is open source and available (i give you permission to take if you want)

## 👨‍💻 Author

Me Zurab Shengelia

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For support, please open an issue in the repository.

---

**Happy coding! 🎉**
