require("dotenv").config();     //chargement des variables d’environnement depuis le fichier .env
const express = require("express"); // framework web pour Node.js
const helmet = require("helmet");  
const rateLimit = require("express-rate-limit"); 
const cookieParser = require("cookie-parser"); 
const morgan = require("morgan"); // middleware de journalisation des requêtes HTTP
const cors = require("cors"); 

const authRoutes = require("./routes/authRoutes");
const schoolRoutes = require("./routes/schoolRoutes");
const projectRoutes = require("./routes/projectRoutes");
const teamRoutes    = require("./routes/teamRoutes");
const studentRoutes = require("./routes/studentRoutes");
const userRoutes = require("./routes/userRoutes");
const wishRoutes = require("./routes/wishRoutes");
const meetingRoutes = require('./routes/meetingRoutes');
const soutenanceRoutes = require("./routes/soutenanceRoutes");
const deliverableDeadline = require('./routes/deliverableDeadlineRoutes');


const path = require('path');





const app = express();


app.set('etag', false); // ✅ disables 304 caching

// middlewares
app.use(express.json());        // pour lire req.body JSON
app.use(cookieParser());        // pour lire cookies
app.use(helmet());              // sécurité headers HTTP
app.use(morgan("dev"));         // logs des requêtes
app.use(cors({
  credentials: true
}));

// limiter les tentatives login
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 min
  max: 5                      // max 5 tentatives
});


app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// TEMPORARY DEBUG — remove after fixing
app.use((req, res, next) => {
  console.log(`→ ${req.method} ${req.url}`);
  next();
});

// appliquer le limiter uniquement sur la route login
app.use("/api/auth/login", limiter); 

// routes
app.use("/api/auth", authRoutes); 
app.use("/api", schoolRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/teams",   teamRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/user", userRoutes);
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/announcements", require("./routes/announcementRoutes"));
app.use("/api/invitations",   require("./routes/invitationRoutes"));
app.use("/api/wishes",   wishRoutes);
app.use("/api/messages", require("./routes/messageRoutes"));
app.use("/api/distribution", require("./routes/distributionRoutes"));
app.use("/api/deadline", require("./routes/deadlineRoutes"));
app.use("/api/documents", require("./routes/documentRoutes"));
app.use('/api/meetings', meetingRoutes);
app.use("/api", soutenanceRoutes);
app.use("/api/deliverable-deadlines", deliverableDeadline);




app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: err.message || 'Erreur serveur' });
});

// serveur
app.listen(3000, () => console.log("🚀 Serveur démarré sur port 3000"));