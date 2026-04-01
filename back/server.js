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

const app = express();






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


// routes
app.use("/api/auth", authRoutes); 
app.use("/api", schoolRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/teams",   teamRoutes);
app.use("/api/student", studentRoutes);
// appliquer le limiter uniquement sur la route login
app.use("/api/auth/login", limiter); 

// routes
app.use("/api/auth", authRoutes); 
app.use("/api", schoolRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/teams",   teamRoutes);
app.use("/api/student", studentRoutes);

// route test
app.get("/", (req, res) => res.send("Backend fonctionne"));

// serveur
app.listen(3000, () => console.log("🚀 Serveur démarré sur port 3000"));