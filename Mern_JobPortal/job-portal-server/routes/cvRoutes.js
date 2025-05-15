const express = require('express');
const router = express.Router();

router.post('/generate-cv-ai', async (req, res) => {
  try {
    // Création d'un template de CV basique à partir des données reçues
    const cvData = req.body;
    
    const formattedCV = `
CURRICULUM VITAE

INFORMATIONS PERSONNELLES
Nom: ${cvData.fullName}
Email: ${cvData.email}
Téléphone: ${cvData.phone}
Adresse: ${cvData.address}
LinkedIn: ${cvData.linkedin}

PROFIL PROFESSIONNEL
${cvData.profile}

EXPÉRIENCE PROFESSIONNELLE
${cvData.experience}

FORMATION
${cvData.education}

COMPÉTENCES TECHNIQUES
${cvData.technicalSkills}

${cvData.languages ? `LANGUES\n${cvData.languages}` : ''}

${cvData.certifications ? `CERTIFICATIONS\n${cvData.certifications}` : ''}
    `.trim();

    res.json({ cv: formattedCV });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({
      error: 'Échec de la génération du CV',
      details: error.message
    });
  }
});

module.exports = router;