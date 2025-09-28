# 🎓 Facesmash - College Edition

A full-stack web application that allows users to vote and compare college students in a fun, interactive way. Built with React, Node.js, Express, and MongoDB.

## 🌟 Features

- **Interactive Voting System**: Side-by-side comparison of student photos with click-to-vote functionality
- **Gender Filtering**: Filter comparisons by male, female, or view all students
- **Real-time Statistics**: View total votes, student counts, and top-voted students
- **Responsive Design**: Mobile-friendly interface with smooth animations using Tailwind CSS
- **Modern UI**: Beautiful glass-morphism effects and gradient backgrounds
- **Instagram Integration**: Optional Instagram profile links for students
- **Admin Features**: Add, update, and manage student data
- **Data Validation**: Comprehensive input validation and error handling
- **Rate Limiting**: Built-in protection against spam voting
- **Tailwind CSS**: Modern utility-first CSS framework for rapid UI development

## 🏗️ Project Structure

```
facesmash-ui/
├── README.md
├── backend/                 # Node.js + Express API
│   ├── config/
│   │   └── database.js     # MongoDB connection
│   ├── middleware/
│   │   └── validation.js   # Input validation & rate limiting
│   ├── models/
│   │   └── Student.js      # Student data model
│   ├── routes/
│   │   └── students.js     # API endpoints
│   ├── scripts/
│   │   ├── seedDatabase.js      # Sample data seeding
│   │   └── addRealStudents.js   # CSV import for real data
│   ├── .env                     # Environment variables
│   ├── package.json
│   └── server.js                # Main server file
└── frontend/               # React application
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── App.js          # Main React component
    │   ├── index.js        # React entry point
    │   └── index.css       # Styling
    └── package.json
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

### 1. Clone and Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd facesmash-ui

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies (includes Tailwind CSS)
cd ../frontend
npm install
```

**Note**: The frontend now uses Tailwind CSS for styling. All dependencies including Tailwind, Autoprefixer, and PostCSS are automatically installed.

### 2. Environment Configuration

Create a `.env` file in the `backend` directory:

```env
# Environment variables
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/facesmash

# For MongoDB Atlas (cloud):
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/facesmash?retryWrites=true&w=majority
```

### 3. Database Setup

```bash
cd backend

# Seed the database with sample students
npm run seed

# Or start with an empty database and add real students later
```

### 4. Run the Application

```bash
# Terminal 1: Start the backend server
cd backend
npm run dev        # Development mode with auto-restart
# or
npm start         # Production mode

# Terminal 2: Start the frontend
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📝 Adding Real Student Data

### Method 1: CSV Import (Recommended)

1. Create a CSV file with the following format:

```csv
rollNumber,imageUrl,gender,instagramId
CS21001,https://example.com/student1.jpg,male,john_doe
CS21002,https://example.com/student2.jpg,female,jane_smith
CS21003,https://example.com/student3.jpg,male,
```

2. Import the data:

```bash
cd backend
node scripts/addRealStudents.js path/to/your/students.csv
```

### Method 2: API Endpoint

Send POST requests to `http://localhost:5000/api/students`:

```json
{
  "rollNumber": "CS21001",
  "imageUrl": "https://example.com/student.jpg",
  "gender": "male",
  "instagramId": "student_instagram"
}
```

### Image URL Requirements

- Must be a valid HTTP/HTTPS URL
- Should end with .jpg, .jpeg, .png, .gif, or .webp
- Images should be publicly accessible
- Recommended size: 300x400 pixels for best display

**Note**: If using Terabox links, ensure they are direct image URLs, not sharing links.

## 🔌 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Endpoints

#### Get Random Students
```http
GET /students/random?gender=male&count=2
```

**Query Parameters:**
- `gender` (optional): `male`, `female`, `other`
- `count` (optional): Number of students (1-10, default: 2)

**Response:**
```json
{
  "success": true,
  "students": [
    {
      "_id": "...",
      "rollNumber": "CS21001",
      "imageUrl": "https://...",
      "gender": "male",
      "upvotes": 5,
      "instagramId": "john_doe"
    }
  ],
  "filter": "male"
}
```

#### Vote for Student
```http
POST /students/vote
Content-Type: application/json

{
  "studentId": "mongodb_object_id"
}
```

#### Get All Students (Admin)
```http
GET /students?page=1&limit=20&gender=male&sortBy=upvotes&sortOrder=desc
```

#### Add New Student
```http
POST /students
Content-Type: application/json

{
  "rollNumber": "CS21001",
  "imageUrl": "https://example.com/image.jpg",
  "gender": "male",
  "instagramId": "optional_instagram"
}
```

#### Get Statistics
```http
GET /students/stats
```

#### Update Student (Admin)
```http
PUT /students/:id
Content-Type: application/json

{
  "instagramId": "new_instagram_handle"
}
```

#### Deactivate Student
```http
DELETE /students/:id
```

## 🗄️ Database Schema

### Student Model

```javascript
{
  rollNumber: String,        // Required, unique
  imageUrl: String,          // Required, valid image URL
  upvotes: Number,           // Default: 0
  gender: String,            // Required: 'male', 'female', 'other'
  instagramId: String,       // Optional
  isActive: Boolean,         // Default: true
  createdAt: Date,          // Auto-generated
  updatedAt: Date           // Auto-generated
}
```

## 🎨 Frontend Features

### User Interface
- **Modern Design**: Built with Tailwind CSS for a clean, professional look
- **Glass Morphism**: Beautiful glass effects with backdrop blur
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Smooth Animations**: CSS transitions, hover effects, and custom animations
- **Visual Feedback**: Loading states, voting animations, error messages
- **Statistics Dashboard**: Real-time vote counts and leaderboards
- **Dark Theme**: Elegant gradient backgrounds with optimal contrast

### Key Components
- Modern glass-effect filter buttons with icons
- Side-by-side student comparison with hover effects
- Vote recording with animated feedback
- Statistics panel with top-voted students and medals
- Comprehensive error handling and retry mechanisms
- Responsive grid layouts that adapt to screen size

### Tailwind CSS Integration
- **Utility-First**: Fast development with utility classes
- **Custom Components**: Reusable glass-effect and button components
- **Custom Colors**: Extended color palette for success, danger, and primary themes
- **Animations**: Custom keyframe animations for smooth interactions
- **Responsive**: Mobile-first responsive design with breakpoint utilities

## 🛡️ Security Features

- **Input Validation**: Server-side validation for all inputs
- **Rate Limiting**: Prevents spam voting
- **Error Handling**: Comprehensive error responses
- **Data Sanitization**: Clean and validate all user inputs
- **CORS Protection**: Configured for secure cross-origin requests

## 🚀 Deployment

### Backend Deployment (e.g., Heroku, Railway, DigitalOcean)

1. Set environment variables:
   ```
   NODE_ENV=production
   MONGODB_URI=your_production_mongodb_uri
   PORT=5000
   ```

2. Build command: `npm install`
3. Start command: `npm start`

### Frontend Deployment (e.g., Netlify, Vercel)

1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```

2. Deploy the `build` folder

3. Set environment variable:
   ```
   REACT_APP_API_URL=https://your-backend-url.com/api
   ```

### MongoDB Setup

#### Option 1: MongoDB Atlas (Cloud - Recommended)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in your `.env` file

#### Option 2: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/facesmash`

## 🧪 Testing

### Test the API
```bash
# Check if server is running
curl http://localhost:5000/health

# Get random students
curl http://localhost:5000/api/students/random

# Get statistics
curl http://localhost:5000/api/students/stats
```

### Test the Frontend
1. Open http://localhost:3000
2. Check if images load properly
3. Test voting functionality
4. Try gender filters
5. View statistics

## 🔧 Troubleshooting

### Common Issues

**1. "Cannot connect to database"**
- Check MongoDB is running
- Verify `MONGODB_URI` in `.env` file
- Ensure network connectivity for MongoDB Atlas

**2. "Images not loading"**
- Verify image URLs are accessible
- Check for CORS issues with image hosts
- Ensure URLs end with proper image extensions

**3. "API calls failing"**
- Check backend server is running on port 5000
- Verify frontend proxy configuration
- Check browser network tab for errors

**4. "No students found for comparison"**
- Run the database seeding script
- Check if students exist in database
- Verify gender filter settings

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
```

## 📊 Performance Optimization

- **Database Indexing**: Indexes on frequently queried fields
- **Image Optimization**: Recommend compressed images
- **Caching**: Consider adding Redis for frequent queries
- **CDN**: Use CDN for static assets in production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🎯 Future Enhancements

- [ ] User authentication and profiles
- [ ] Advanced filtering options
- [ ] Real-time notifications
- [ ] Mobile app development
- [ ] Advanced analytics dashboard
- [ ] Social media integration
- [ ] Batch image upload
- [ ] Admin dashboard
- [ ] Vote history tracking
- [ ] Tournament-style competitions

## 🙋‍♂️ Support

If you encounter any issues or have questions:

1. Check the troubleshooting section above
2. Look at existing GitHub issues
3. Create a new issue with detailed information
4. Include error messages and steps to reproduce

---

**Happy Voting! 🎉**
#   f a c e s m a s h _ I I T B H U  
 