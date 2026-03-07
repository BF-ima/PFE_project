require("dotenv").config();     //chargement des variables d’environnement depuis le fichier .env
const express = require("express"); // framework web pour Node.js
const helmet = require("helmet");  
const rateLimit = require("express-rate-limit"); 
const cookieParser = require("cookie-parser"); 
const morgan = require("morgan"); // middleware de journalisation des requêtes HTTP
const cors = require("cors"); 
const studentRoutes = require("./routes/studentRoutes");
const projectRoutes = require("./routes/projectRoutes");
const authRoutes = require("./routes/authRoutes");
const teamRoutes=require("./routes/teamRoutes")
const wishRoutes=require("./routes/wishRoutes")
const deliverableRoutes=require("./routes/deliverableRoutes")


const app = express();

// middlewares
app.use("/api/projects",projectRoutes);
app.use("/api/student", studentRoutes);
app.use(express.json());        // pour lire req.body JSON
app.use(cookieParser());        // pour lire cookies
app.use(helmet());              // sécurité headers HTTP
app.use(morgan("dev"));         // logs des requêtes
app.use(cors({
  origin: 'http://localhost:5173', // Your React app
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// limiter les tentatives login
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 min
  max: 5                      // max 5 tentatives
});

// appliquer le limiter uniquement sur la route login
app.use("/api/auth/login", limiter); 

// routes
app.use("/api/auth", authRoutes); 

// route test
app.get("/", (req, res) => res.send("Backend fonctionne"));
app.use("/uploads",express.static("uploads"))

app.use("/api/teams",teamRoutes)
app.use("/api/wishes",wishRoutes)
app.use("/api/deliverables",deliverableRoutes)


// serveur
app.listen(3000, () => console.log("🚀 Serveur démarré sur port 3000"));