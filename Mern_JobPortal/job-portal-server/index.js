const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');
// Importer les routes du chatbot
const chatbotRoutes = require('./routes/chatbotRoutes');
// Ajouter l'import de Puppeteer
const puppeteer = require('puppeteer');

// Charger les variables d'environnement au tout début
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

// Vérifier si la clé API est chargée
console.log('COHERE_API_KEY:', process.env.COHERE_API_KEY ? 'Present' : 'Missing');

// Configuration CORS
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
// Supprimez cette ligne: const path = require('path');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const axios = require('axios');
// Supprimez cette ligne aussi car dotenv est déjà configuré plus haut
// require('dotenv').config();

// Configuration du port
const port = process.env.PORT || 3003;
console.log('Port configuré:', port);

// Middleware
app.use(express.json());
app.use(cors({
  origin: ["http://localhost:3003", "http://localhost:5173", "https://mern-jobportal-ckfs.onrender.com"],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Middleware pour logger les requêtes
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Body:', JSON.stringify(req.body, null, 2));
  next();
});

// Test route
app.get('/', (req, res) => {
  console.log('[TEST] Route / appelée');
  res.json({ message: 'Server is running!' });
});

// Test route pour vérifier la connexion MongoDB
app.get('/test-db', async (req, res) => {
  console.log('[TEST] Route /test-db appelée');
  try {
    const db = client.db("mernJobPortal");
    await db.command({ ping: 1 });
    console.log('[TEST] MongoDB ping réussi');
    res.json({ message: 'MongoDB connection is working!' });
  } catch (error) {
    console.error('[TEST] Error testing MongoDB connection:', error);
    res.status(500).json({ error: 'MongoDB connection failed', details: error.message });
  }
});

// Test route pour vérifier la configuration de l'API Hugging Face
app.get('/test-huggingface', async (req, res) => {
  console.log('Test Hugging Face route called');
  try {
    console.log('Checking HUGGINGFACE_API_KEY:', process.env.HUGGINGFACE_API_KEY ? 'Present' : 'Missing');
    
    if (!process.env.HUGGINGFACE_API_KEY) {
      console.error('HUGGINGFACE_API_KEY is not configured');
      return res.status(500).json({
        error: 'Configuration error',
        details: 'HUGGINGFACE_API_KEY is not configured'
      });
    }

    console.log('Testing Hugging Face API connection...');
    // Utiliser un modèle plus simple et largement disponible
    // Dans la route /test-huggingface
    const response = await axios.post(
    'https://api-inference.huggingface.co/models/gpt2',
    { inputs: 'Hello, how are you?' },
    {
    headers: {
    'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
    'Content-Type': 'application/json',
    },
    timeout: 30000,
    }
    );

    console.log('Hugging Face API test successful');
    res.json({
      status: 'success',
      message: 'Hugging Face API is configured correctly',
      response: response.data
    });
  } catch (error) {
    console.error('Error testing Hugging Face API:', error);
    res.status(500).json({
      error: 'API test failed',
      details: error.message,
      response: error.response?.data
    });
  }
});

// Test route pour vérifier la configuration de l'API Cohere
app.get('/test-cohere', async (req, res) => {
  console.log('Test Cohere route called');
  try {
    console.log('Checking COHERE_API_KEY:', process.env.COHERE_API_KEY ? 'Present' : 'Missing');
    
    // Dans la route /generate-cv-ai
    if (!process.env.COHERE_API_KEY) {
      console.error('COHERE_API_KEY is not configured');
      return res.status(500).json({ 
        error: 'Server configuration error', 
        details: 'COHERE_API_KEY is not configured' 
      });
    }

    console.log('Testing Cohere API connection...');
    
    // Initialiser le client Cohere
    const cohere = new CohereClient({ 
      token: process.env.COHERE_API_KEY,
    });

    // Test simple avec l'API Cohere
    const response = await cohere.generate({
      model: "command",
      prompt: "Écris un court paragraphe sur l'importance des CV professionnels.",
      max_tokens: 100,
      temperature: 0.7,
    });

    console.log('Cohere API test successful');
    res.json({
      status: 'success',
      message: 'Cohere API is configured correctly',
      response: response.generations[0].text
    });
  } catch (error) {
    console.error('Error testing Cohere API:', error);
    res.status(500).json({
      error: 'API test failed',
      details: error.message,
      response: error.response?.data
    });
  }
});

// MongoDB connection
const uri = "mongodb://127.0.0.1:27017/jobportal";
console.log('URI MongoDB:', uri);

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
  minPoolSize: 5,
  retryWrites: true,
  retryReads: true
});

let isConnected = false;

async function connectWithRetry(retries = 5, delay = 5000) {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Tentative de connexion à MongoDB (${i + 1}/${retries})...`);
      await client.connect();
      isConnected = true;
      console.log("Connecté à MongoDB avec succès!");
      return true;
    } catch (error) {
      console.error(`Échec de la tentative ${i + 1}:`, error);
      if (i < retries - 1) {
        console.log(`Nouvelle tentative dans ${delay/1000} secondes...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  return false;
}

// Ajouter l'import de Cohere en haut du fichier
const { CohereClient } = require("cohere-ai");

// Fonction pour générer un CV avec Cohere AI
const generateCVWithAI = async (data) => {
  try {
    const {
      fullName,
      phone,
      email,
      address,
      profile,
      certifications,
      experience,
      technicalSkills,
      education,
      languages,
      linkedin
    } = data;

    // Construction du prompt pour l'IA
    const prompt = `Génère un CV en HTML pour une personne avec les informations suivantes :
    - Nom complet: ${fullName}
    - Téléphone: ${phone}
    - Email: ${email}
    - Adresse: ${address}
    - Profil: ${profile}
    - Expérience: ${experience}
    - Compétences techniques: ${technicalSkills}
    - Formation: ${education}
    ${certifications ? `- Certifications: ${certifications}` : ''}
    ${languages ? `- Langues: ${languages}` : ''}
    ${linkedin ? `- LinkedIn: ${linkedin}` : ''}
    
    Le CV doit être bien formaté en HTML avec des styles CSS intégrés. Utilise des sections claires pour chaque partie du CV. Assure-toi que le design est professionnel et moderne.`;

    console.log('Envoi de la requête à Cohere AI...');
    
    try {
      // Initialiser le client Cohere
      const cohere = new CohereClient({ 
        token: process.env.COHERE_API_KEY,
      });

      // Appel à l'API Cohere
      const response = await cohere.generate({
        model: "command", // ou "command-light" pour un modèle plus léger
        prompt: prompt,
        max_tokens: 2000,
        temperature: 0.7,
        k: 0,
        stop_sequences: [],
        return_likelihoods: "NONE"
      });

      let generatedHTML = response.generations[0].text;
      
      // Nettoyage de la réponse pour ne garder que le HTML
      generatedHTML = generatedHTML.replace(/```html\n?|\n?```/g, '').trim();

      // Si la réponse ne contient pas de HTML valide, on utilise un template par défaut
      if (!generatedHTML.includes('<div')) {
        console.log('La réponse de l\'IA ne contient pas de HTML valide, utilisation du template par défaut');
        generatedHTML = `
          <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2c3e50; margin-bottom: 10px;">${fullName}</h1>
              <div style="color: #34495e; margin-bottom: 10px;">
                <p>${phone} | ${email}</p>
                ${linkedin ? `<p>LinkedIn: ${linkedin}</p>` : ''}
                <p>${address}</p>
              </div>
            </div>
            <div style="margin: 20px 0; border-bottom: 1px solid #eee; padding-bottom: 10px;">
              <h2 style="color: #3498db; font-size: 1.2em; font-weight: bold; margin-bottom: 10px;">Profil</h2>
              <p>${profile}</p>
            </div>
            <div style="margin: 20px 0; border-bottom: 1px solid #eee; padding-bottom: 10px;">
              <h2 style="color: #3498db; font-size: 1.2em; font-weight: bold; margin-bottom: 10px;">Formation</h2>
              <p>${education}</p>
            </div>
            <div style="margin: 20px 0; border-bottom: 1px solid #eee; padding-bottom: 10px;">
              <h2 style="color: #3498db; font-size: 1.2em; font-weight: bold; margin-bottom: 10px;">Expérience professionnelle</h2>
              <p>${experience}</p>
            </div>
            <div style="margin: 20px 0; border-bottom: 1px solid #eee; padding-bottom: 10px;">
              <h2 style="color: #3498db; font-size: 1.2em; font-weight: bold; margin-bottom: 10px;">Compétences techniques</h2>
              <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                ${technicalSkills.split(',').map(skill => `
                  <span style="background: #3498db; color: white; padding: 5px 15px; border-radius: 15px;">
                ${skill.trim()}
                  </span>
                `).join('')}
              </div>
            </div>
            ${certifications ? `
            <div style="margin: 20px 0; border-bottom: 1px solid #eee; padding-bottom: 10px;">
              <h2 style="color: #3498db; font-size: 1.2em; font-weight: bold; margin-bottom: 10px;">Certifications</h2>
              <p>${certifications}</p>
            </div>
            ` : ''}
            ${languages ? `
            <div style="margin: 20px 0; border-bottom: 1px solid #eee; padding-bottom: 10px;">
              <h2 style="color: #3498db; font-size: 1.2em; font-weight: bold; margin-bottom: 10px;">Langues</h2>
              <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                ${languages.split(',').map(lang => `
                  <span style="background: #3498db; color: white; padding: 5px 15px; border-radius: 15px;">
                    ${lang.trim()}
                  </span>
                `).join('')}
              </div>
            </div>
            ` : ''}
          </div>
        `;
      }

      return generatedHTML;
    } catch (apiError) {
      console.error('Error calling Cohere AI API:', apiError);
      throw new Error(`Cohere AI API error: ${apiError.message}`);
    }
  } catch (error) {
    console.error('Error in generateCVWithAI:', error);
    throw new Error(`Failed to generate CV: ${error.message}`);
  }
};

// Route pour la génération de CV
app.post("/generate-cv-ai", async (req, res) => {
  try {
    console.log('Received CV generation request:', req.body);
    
    // Vérifier des données requises
    const requiredFields = ['fullName', 'phone', 'email', 'address', 'profile', 'experience', 'technicalSkills', 'education'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      return res.status(400).json({ 
        error: 'Missing required fields', 
        details: `The following fields are required: ${missingFields.join(', ')}` 
      });
    }

    // Vérifier de la clé API
    if (!process.env.COHERE_API_KEY) {
      console.error('COHERE_API_KEY is not configured');
      return res.status(500).json({ 
        error: 'Server configuration error', 
        details: 'COHERE_API_KEY is not configured' 
      });
    }

    const data = req.body;
    const format = req.query.format || 'html'; // Format par défaut: html, autre option: pdf
    console.log('Generating CV with data:', data, 'Format:', format);
    
    try {
      const cv = await generateCVWithAI(data);
      console.log('CV generated successfully');
      
      // Dans la route /generate-cv-ai, modifiez la partie qui gère le format PDF
      if (format === 'pdf') {
      try {
      console.log('Génération du PDF en cours...');
      const pdfBuffer = await convertHTMLToPDF(cv);
      console.log('PDF généré avec succès, taille:', pdfBuffer.length, 'octets');
      
      // Définir les en-têtes de manière plus explicite
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Length', pdfBuffer.length);
      res.setHeader('Content-Disposition', `attachment; filename="${data.fullName.replace(/\s+/g, '_')}_CV.pdf"`);
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      // Envoyer le PDF
      return res.send(pdfBuffer);
      } catch (pdfError) {
      console.error('Error converting to PDF:', pdfError);
      return res.status(500).json({ 
      error: 'Failed to generate PDF', 
      details: pdfError.message,
      stack: process.env.NODE_ENV === 'development' ? pdfError.stack : undefined
      });
      }
      }
      
      // Format HTML par défaut
      res.json({ cv });
    } catch (error) {
      console.error('Error in generateCVWithAI:', error);
      res.status(500).json({ 
        error: 'Failed to generate CV', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  } catch (error) {
    console.error('Error in /generate-cv-ai route:', error);
    res.status(500).json({ 
      error: 'Server error', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Route pour obtenir tous les jobs
app.get("/all-jobs", async (req, res) => {
  console.log("[JOBS] Route /all-jobs appelée");
  try {
    const db = client.db("mernJobPortal");
    const jobsCollection = db.collection("demoJobs");
    const jobs = await jobsCollection.find({}).sort({ createdAt: -1 }).toArray();
    console.log("[JOBS] Jobs trouvés:", jobs.length);
    res.json(jobs);
  } catch (error) {
    console.error("[JOBS] Error fetching jobs:", error);
    res.status(500).json({ error: "Failed to fetch jobs", details: error.message });
  }
});

    app.post("/post-job", async (req, res) => {
  console.log("Route /post-job appelée avec les données:", req.body);
  try {
    // Vérifier la connexion MongoDB
    if (!client) {
      console.error("MongoDB client n'est pas connecté");
      return res.status(500).json({ error: "Database connection not established" });
    }

    const db = client.db("mernJobPortal");
    console.log("Base de données sélectionnée:", db.databaseName);

    const jobsCollection = db.collection("demoJobs");
    console.log("Collection sélectionnée:", jobsCollection.collectionName);

      const body = req.body;
    console.log("Données à insérer:", body);

    // Ajouter la date de création
      body.createdAt = new Date();
    
    // Vérifier que les données requises sont présentes
    if (!body.jobTitle || !body.companyName) {
      console.error("Données manquantes:", body);
      return res.status(400).json({ 
        error: "Missing required fields",
        details: "jobTitle and companyName are required"
      });
    }

      const result = await jobsCollection.insertOne(body);
    console.log("Résultat de l'insertion:", result);

      if (result?.insertedId) {
      return res.status(200).json({
        message: "Job posted successfully",
        result: result
      });
      } else {
      console.error("Échec de l'insertion - Pas d'ID inséré");
      return res.status(500).json({
        message: "Failed to insert job",
          status: false,
        });
      }
  } catch (error) {
    console.error("Error posting job:", error);
    // Envoyer plus de détails sur l'erreur
    return res.status(500).json({ 
      error: "Failed to post job",
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

   app.get("/all-jobs/:id", async (req, res) => {
  console.log("Route /all-jobs/:id appelée avec l'ID:", req.params.id);
  try {
    const db = client.db("mernJobPortal");
    const jobsCollection = db.collection("demoJobs");
    const job = await jobsCollection.findOne({
      _id: new ObjectId(req.params.id),
    });
    res.json(job);
  } catch (error) {
    console.error("Error fetching job by ID:", error);
    res.status(500).json({ error: "Failed to fetch job" });
  }
});

  app.get("/myJobs/:email", async (req, res) => {
  console.log("Route /myJobs/:email appelée avec l'email:", req.params.email);
  try {
    const db = client.db("mernJobPortal");
    const jobsCollection = db.collection("demoJobs");
    const jobs = await jobsCollection.find({ postedBy: req.params.email }).toArray();
    res.json(jobs);
  } catch (error) {
    console.error("Error fetching jobs by email:", error);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
});

  app.delete("/job/:id", async (req, res) => {
  console.log("Route DELETE /job/:id appelée avec l'ID:", req.params.id);
  try {
    const db = client.db("mernJobPortal");
    const jobsCollection = db.collection("demoJobs");
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) };
    const result = await jobsCollection.deleteOne(filter);
    res.json(result);
  } catch (error) {
    console.error("Error deleting job:", error);
    res.status(500).json({ error: "Failed to delete job" });
  }
});

  app.patch("/update-job/:id", async (req, res) => {
  console.log("Route PATCH /update-job/:id appelée avec l'ID:", req.params.id);
  try {
    const db = client.db("mernJobPortal");
    const jobsCollection = db.collection("demoJobs");
    const id = req.params.id;
    const jobData = req.body;
    const filter = { _id: new ObjectId(id) };
    const updateDoc = {
      $set: {
        ...jobData
      },
    };
    const options = { upsert: true };
    const result = await jobsCollection.updateOne(filter, updateDoc, options);
    res.json(result);
  } catch (error) {
    console.error("Error updating job:", error);
    res.status(500).json({ error: "Failed to update job" });
  }
});

// Route pour stocker le CV avec le job
app.post("/store-cv/:jobId", async (req, res) => {
  try {
    const { jobId } = req.params;
    const { cv } = req.body;

    if (!cv) {
      return res.status(400).json({ error: 'CV is required' });
    }

    // Nettoyer les backticks s'il y en a
    const cleanCV = typeof cv === 'string' ? cv.replace(/`/g, '') : cv;

    const db = client.db("mernJobPortal");
    const jobsCollection = db.collection("demoJobs");

    // Vérifier si le document existe et créer le tableau cvs s'il n'existe pas
    const job = await jobsCollection.findOne({ _id: new ObjectId(jobId) });
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Vérifier si le CV est déjà dans le tableau cvs
    const cvExists = job.cvs && job.cvs.includes(cleanCV);
    
    if (!cvExists) {
      // Ajouter le CV au tableau de CVs et supprimer l'ancien champ cv s'il existe
      const result = await jobsCollection.updateOne(
        { _id: new ObjectId(jobId) },
        { 
          $push: { cvs: cleanCV },
          $unset: { cv: "" } // Supprimer le champ cv s'il existe
        }
      );

      if (result.modifiedCount === 0) {
        return res.status(500).json({ error: 'Failed to update job' });
      }
    } else {
      console.log('CV already exists in the cvs array');
    }

    res.json({ message: 'CV stored successfully' });
  } catch (error) {
    console.error('Error storing CV:', error);
    res.status(500).json({ error: 'Failed to store CV' });
  }
});

// Middleware pour vérifier la connexion MongoDB
app.use(async (req, res, next) => {
  if (!isConnected) {
    try {
      await connectWithRetry();
    } catch (error) {
      return res.status(503).json({ 
        error: "Service temporairement indisponible",
        details: "Impossible de se connecter à la base de données"
      });
    }
  }
  next();
});

async function run() {
  try {
    console.log('Démarrage de la fonction run()...');
    const connected = await connectWithRetry();
    if (!connected) {
      throw new Error("Impossible de se connecter à MongoDB après plusieurs tentatives");
    }
    
    const db = client.db("mernJobPortal");
    console.log("Base de données 'mernJobPortal' sélectionnée");
    
    // Exécuter la migration une seule fois
    await migrateCVs();
    
    const jobsCollection = db.collection("demoJobs");
    console.log("Collection 'demoJobs' sélectionnée");

    const indexKeys = { title: 1, category: 1 };
    const indexOptions = { name: "titleCategory" };
    await jobsCollection.createIndex(indexKeys, indexOptions);
    console.log("Index créé avec succès");

    await client.db("admin").command({ ping: 1 });
    console.log("Ping MongoDB réussi!");
  } catch (error) {
    console.error("Erreur dans run():", error);
  }
}

// Start server
console.log('Démarrage du serveur...');
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`Serveur démarré sur le port ${port}`);
  console.log(`URL du serveur: http://localhost:${port}`);
  console.log(`Test URL: http://localhost:${port}/test-db`);
  run().catch(error => {
    console.error("Erreur lors du démarrage:", error);
    process.exit(1);
  });
});

// Gestion des erreurs du serveur
server.on('error', (error) => {
  console.error('Erreur du serveur:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Le port ${port} est déjà utilisé. Veuillez choisir un autre port ou arrêter le processus qui utilise ce port.`);
  }
  process.exit(1);
});

// Gestion de la fermeture propre
process.on('SIGTERM', () => {
  console.log('SIGTERM reçu. Arrêt du serveur...');
  server.close(() => {
    console.log('Serveur arrêté.');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT reçu. Arrêt du serveur...');
  try {
  await client.close();
    console.log('Connexion MongoDB fermée');
    server.close(() => {
      console.log('Serveur arrêté.');
  process.exit(0);
    });
  } catch (error) {
    console.error('Erreur lors de la fermeture:', error);
    process.exit(1);
  }
});

// Gestion des erreurs non capturées
process.on('unhandledRejection', (error) => {
  console.error('Erreur non gérée:', error);
});

process.on('uncaughtException', (error) => {
  console.error('Exception non capturée:', error);
  process.exit(1);
});

app.use(express.static(path.join(__dirname, "../../job-portal-server/dist")));

app.get('/', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// Fonction pour migrer les CV existants vers le tableau cvs
async function migrateCVs() {
  try {
    console.log('Démarrage de la migration des CV...');
    const db = client.db("mernJobPortal");
    const jobsCollection = db.collection("demoJobs");
    
    // 1. Trouver tous les jobs qui ont un CV (qu'ils aient ou non un tableau cvs)
    const jobsWithCV = await jobsCollection.find({ 
      cv: { $exists: true }
    }).toArray();
    
    console.log(`${jobsWithCV.length} jobs à migrer`);
    
    for (const job of jobsWithCV) {
      // Nettoyer les backticks du cv
      let cleanCV = job.cv;
      if (typeof cleanCV === 'string') {
        cleanCV = cleanCV.replace(/`/g, '');
      }
      
      // Créer le tableau cvs s'il n'existe pas
      if (!job.cvs) {
        await jobsCollection.updateOne(
          { _id: job._id },
          { $set: { cvs: [] } }
        );
      }
      
      // Vérifier si le CV est déjà dans le tableau cvs
      const cvExists = job.cvs && job.cvs.includes(cleanCV);
      
      if (!cvExists) {
        // Ajouter le CV au tableau de CVs s'il n'y est pas déjà
        await jobsCollection.updateOne(
          { _id: job._id },
          { $push: { cvs: cleanCV } }
        );
      }
      
      // Supprimer l'ancien champ cv dans tous les cas
      await jobsCollection.updateOne(
        { _id: job._id },
        { $unset: { cv: "" } }
      );
    }
    
    // 2. Nettoyer les backticks dans tous les CVs existants
    const allJobs = await jobsCollection.find({
      cvs: { $exists: true }
    }).toArray();
    
    for (const job of allJobs) {
      if (job.cvs && job.cvs.length > 0) {
        const cleanedCVs = job.cvs.map(cv => {
          return typeof cv === 'string' ? cv.replace(/`/g, '') : cv;
        });
        
        // Mettre à jour avec les CVs nettoyés
        await jobsCollection.updateOne(
          { _id: job._id },
          { $set: { cvs: cleanedCVs } }
        );
      }
    }
    
    console.log(`Migration des CV terminée avec succès`);
  } catch (error) {
    console.error('Erreur lors de la migration des CV:', error);
  }
}
// Route pour exécuter la migration des CV manuellement
app.get("/migrate-cvs", async (req, res) => {
  try {
    await migrateCVs();
    res.json({ message: 'Migration des CV terminée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la migration des CV:', error);
    res.status(500).json({ error: 'Failed to migrate CVs' });
  }
});

// Fonction pour convertir HTML en PDF
async function convertHTMLToPDF(html) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Ajouter des styles de base pour s'assurer que le contenu est correctement formaté
    const htmlWithStyles = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            line-height: 1.5;
          }
          h1, h2, h3 {
            margin-top: 20px;
            margin-bottom: 10px;
          }
          p {
            margin-bottom: 10px;
          }
        </style>
      </head>
      <body>
        ${html}
      </body>
      </html>
    `;
    
    // Utiliser setContent avec un délai d'attente plus long
    await page.setContent(htmlWithStyles, { 
      waitUntil: 'networkidle0',
      timeout: 30000
    });
    
    // Attendre que tout le contenu soit chargé
    await page.waitForTimeout(1000);
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      },
      preferCSSPageSize: true
    });
    
    return pdfBuffer;
  } finally {
    await browser.close();
  }
}
// Route ping pour vérifier que le serveur est accessible
app.get('/ping', (req, res) => {
  console.log('[TEST] Route /ping appelée');
  res.status(200).json({ message: 'Server is running' });
});
app.use('/chatbot', chatbotRoutes);
