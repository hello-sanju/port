/* eslint-disable no-undef */
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const { ObjectId } = require('mongoose').Types;
const helmet = require('helmet'); // Add Helmet for security headers
const rateLimit = require('express-rate-limit'); // Add rate limiting
const morgan = require('morgan'); // Add request logging
const xss = require('xss'); // Add XSS protection
const session = require('express-session'); // Add session management (if needed)
const { Schema } = mongoose;
const requestIp = require('request-ip');
const Fingerprint2 = require('fingerprintjs2');
const useragent = require('express-useragent');

require('dotenv').config();

const app = express();
const allowedOrigins = [
  'https://sanjay-patidar.vercel.app',
    'https://eduxcel.vercel.app',

  'http://localhost:5173',
  'https://edu-back-j3mz.onrender.com/api/random-blog-titles',
    'https://edu-back-j3mz.onrender.com',

  // Add more domains if needed
];

app.use(cors({
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(requestIp.mw());
app.use(useragent.express());

// Implement rate limiting (100 requests per hour)
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 500,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Set security headers with Helmet
app.use(helmet());

// Log requests
app.use(morgan('combined'));

// Enable XSS protection
app.use((req, res, next) => {
  req.body = sanitizeRequestBody(req.body);
  next();
});


const port = process.env.PORT || 5000;
const mongoURIMyDB = process.env.MONGODB_URI_MYDB;

mongoose
  .connect(mongoURIMyDB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to MongoDB (mydb)');
  })
  .catch(error => {
    console.error('Error connecting to MongoDB (mydb):', error);
  });


  
const FrontendDevelopmentCareerSchema = new mongoose.Schema({
  title: String,
  overview: [String],
  description: [String],
  keypoints: [String],
  imageURL: [String],
  videoURL: [String],
});

// Define schema for CSS courses
const BackendDevelopmentCareerSchema = new mongoose.Schema({
  title: String,
  overview: [String],
  description: [String],
  keypoints: [String],
  imageURL: [String],
  videoURL: [String],
});

const FrontendDevelopmentCareers = mongoose.model('frontend_development_careers', FrontendDevelopmentCareerSchema);

const BackendDevelopmentCareers = mongoose.model('backend_development_careers', BackendDevelopmentCareerSchema);

// Export the models
module.exports = {
  FrontendDevelopmentCareers,
  BackendDevelopmentCareers,
  
};



 

    //new api for career blogs
  app.get('/api/:vision', async (req, res) => {
    const { vision } = req.params;
    try {
      let talkContent;
      // Fetch course content based on the provided vision
      switch (vision) {
        case 'frontend_development_careers':
          talkContent = await FrontendDevelopmentCareers.find().lean();
          break;
        case 'backend_development_careers':
          talkContent = await BackendDevelopmentCareers.find().lean();
          break;
               default:
          // Check if the vision matches any library in the database
          const library = await mydb.library(vision).find().lean();
          if (library.length > 0) {
            talkContent = library;
          } else {
            return res.status(404).json({ error: 'Vision not found' });
          }
      }
  
      if (talkContent.length > 0) {
        return res.json(talkContent);
      } else {
        return res.status(404).json({ error: 'Talk not found' });
      }
    } catch (error) {
      console.error('Error fetching course content:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  app.get('/api/careers/vision/:vision', async (req, res) => {
    try {
      const vision = req.params.vision;
      if (vision === 'all') {
        const career = await Career.find();
        res.json(career);
      } else {
        const career = await Career.find({ vision });
        res.json(career);
      }
    } catch (error) {
      console.error('Error fetching career:', error);
      res.status(500).json({ error: 'Error fetching career' });
    }
  });
  


 
app.get('/', (req, res) => {
  res.send('Welcome to My API');
});

app.listen(port, () => {
  console.log(`Server is running on :${port}`);
});

// Helper function to sanitize request body against XSS attacks
function sanitizeRequestBody(body) {
  const sanitizedBody = {};
  for (const key in body) {
    if (body.hasOwnProperty(key)) {
      sanitizedBody[key] = xss(body[key]);
    }
  }
  return sanitizedBody;
}
