const express = require('express');
const router = express.Router();
const axios = require('axios'); // Vous devrez installer axios: npm install axios

// Configuration de l'API Hugging Face
const HUGGING_FACE_API_KEY = process.env.HUGGING_FACE_API_KEY; // Remplacez par votre clé API
const HUGGING_FACE_API_URL = 'https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill';
// Vous pouvez choisir d'autres modèles comme 'gpt2', 'distilgpt2', 'EleutherAI/gpt-neo-1.3B', etc.

// Base de connaissances pour le fallback (utilisée si l'API est indisponible)
const knowledgeBase = {
  // Questions sur les offres d'emploi
  'emploi': [
    { keywords: ['trouver', 'emploi', 'job', 'offre', 'poste'], response: 'Vous pouvez trouver des offres d\'emploi en utilisant la barre de recherche sur notre page d\'accueil ou en naviguant vers "Start a search". Vous pouvez filtrer les résultats par catégorie, type d\'emploi et emplacement.' },
    { keywords: ['postuler', 'candidature', 'candidater'], response: 'Pour postuler à une offre d\'emploi, cliquez sur le bouton "Postuler" sur la page de détails de l\'offre. Vous serez redirigé vers notre générateur de CV pour créer un CV adapté à cette offre.' },
    { keywords: ['salaire', 'rémunération', 'paye'], response: 'Vous pouvez consulter les estimations de salaire pour différents postes dans la section "Salary estimate". Les offres d\'emploi affichent également la fourchette de salaire lorsque cette information est disponible.' },
  ],
  
  // Questions sur les CV
  'cv': [
    { keywords: ['créer', 'générer', 'faire', 'cv', 'curriculum'], response: 'Nous proposons deux options pour créer votre CV : "Generate CV" pour un CV standard ou "Generate CV with AI" pour un CV optimisé par intelligence artificielle.' },
    { keywords: ['ai', 'ia', 'intelligence artificielle'], response: 'Notre fonctionnalité "Generate CV with AI" utilise l\'intelligence artificielle pour créer un CV professionnel basé sur vos informations. Remplissez simplement le formulaire avec vos expériences et compétences, et notre IA générera un CV optimisé.' },
    { keywords: ['télécharger', 'pdf', 'format'], response: 'Une fois votre CV généré, vous pouvez le télécharger au format PDF en cliquant sur le bouton de téléchargement. Vous pouvez également le stocker dans notre système pour l\'utiliser lors de futures candidatures.' },
  ],
  
  // Questions sur le compte utilisateur
  'compte': [
    { keywords: ['créer', 'compte', 'inscription', 'inscrire'], response: 'Pour créer un compte, cliquez sur "Log in" en haut à droite, puis sur "Sign up". Remplissez le formulaire avec vos informations et validez votre inscription.' },
    { keywords: ['connecter', 'connexion', 'login'], response: 'Pour vous connecter, cliquez sur "Log in" en haut à droite et entrez vos identifiants.' },
    { keywords: ['mot de passe', 'oublié', 'réinitialiser'], response: 'Si vous avez oublié votre mot de passe, cliquez sur "Log in" puis sur "Forgot password". Suivez les instructions pour réinitialiser votre mot de passe.' },
  ],
  
  // Questions sur la publication d'offres d'emploi
  'publication': [
    { keywords: ['publier', 'poster', 'créer', 'offre', 'annonce'], response: 'Pour publier une offre d\'emploi, connectez-vous à votre compte et cliquez sur "Post A Job". Remplissez le formulaire avec les détails de l\'offre et soumettez-le.' },
    { keywords: ['modifier', 'éditer', 'supprimer', 'offre'], response: 'Vous pouvez gérer vos offres d\'emploi publiées dans la section "My Jobs". Là, vous pourrez les modifier, les supprimer ou voir les candidatures reçues.' },
  ],
  
  // Questions sur les entretiens d'embauche
  'entretien': [
    { keywords: ['entretien', 'embauche', 'interview', 'conseils', 'réussir'], response: 'Pour réussir un entretien d\'embauche, préparez-vous en recherchant l\'entreprise, pratiquez vos réponses aux questions courantes, préparez des exemples concrets de vos réalisations, habillez-vous professionnellement, arrivez à l\'heure, posez des questions pertinentes et envoyez un e-mail de remerciement après l\'entretien.' },
    { keywords: ['questions', 'entretien', 'interview', 'demander'], response: 'Les questions fréquentes en entretien incluent : parlez-moi de vous, pourquoi voulez-vous ce poste, quelles sont vos forces et faiblesses, où vous voyez-vous dans 5 ans, pourquoi devrions-nous vous embaucher, et avez-vous des questions pour nous.' },
    { keywords: ['stress', 'nerveux', 'calme', 'entretien'], response: 'Pour gérer le stress en entretien, pratiquez à l\'avance, utilisez des techniques de respiration, préparez-vous bien, arrivez tôt, visualisez le succès et rappelez-vous que l\'entretien est aussi une opportunité pour vous d\'évaluer l\'entreprise.' },
  ],
};

// Fonction pour trouver la meilleure réponse
const findBestResponse = (message) => {
  const normalizedMessage = message.toLowerCase();
  let bestMatch = { score: 0, response: null };
  
  // Parcourir toutes les catégories et leurs questions
  Object.values(knowledgeBase).forEach(category => {
    category.forEach(item => {
      const matchScore = item.keywords.reduce((score, keyword) => {
        return normalizedMessage.includes(keyword.toLowerCase()) ? score + 1 : score;
      }, 0);
      
      if (matchScore > bestMatch.score) {
        bestMatch = { score: matchScore, response: item.response };
      }
    });
  });
  
  // Si aucune correspondance n'est trouvée ou score trop faible
  if (bestMatch.score < 1) {
    return "Je suis désolé, je ne peux répondre qu'aux questions concernant les offres d'emploi, les CV, et l'utilisation de notre plateforme. Pourriez-vous reformuler votre question ?";
  }
  
  return bestMatch.response;
};

// Fonction pour obtenir une réponse de l'IA via Hugging Face
async function getAIResponse(message) {
  try {
    // Contexte spécifique pour guider le modèle
    const contextPrompt = "Tu es un assistant virtuel pour un portail d'emploi. Tu aides les utilisateurs à trouver des emplois, créer des CV, préparer des entretiens d'embauche et utiliser la plateforme. Sois concis, professionnel et utile.";
    
    const fullPrompt = `${contextPrompt}\n\nUtilisateur: ${message}\n\nAssistant:`;
    
    const response = await axios.post(
      HUGGING_FACE_API_URL,
      { inputs: fullPrompt },
      {
        headers: {
          'Authorization': `Bearer ${HUGGING_FACE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Extraction de la réponse selon le format retourné par le modèle
    let aiResponse = '';
    if (Array.isArray(response.data)) {
      // Certains modèles retournent un tableau
      aiResponse = response.data[0].generated_text;
    } else if (response.data.generated_text) {
      // D'autres retournent un objet avec generated_text
      aiResponse = response.data.generated_text;
    } else {
      // Si le format est différent, utiliser la réponse brute
      aiResponse = JSON.stringify(response.data);
    }
    
    // Nettoyer la réponse pour extraire uniquement la partie après "Assistant:"
    const assistantPrefix = "Assistant:";
    if (aiResponse.includes(assistantPrefix)) {
      aiResponse = aiResponse.split(assistantPrefix)[1].trim();
    }
    
    return aiResponse || "Je suis désolé, je n'ai pas pu générer une réponse appropriée.";
  } catch (error) {
    console.error('Erreur avec l\'API Hugging Face:', error);
    // En cas d'erreur avec l'API, utiliser la base de connaissances locale
    return findBestResponse(message);
  }
}

// Route pour traiter les messages du chatbot
router.post('/', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Le message est requis' });
    }
    
    // Utiliser l'IA pour générer une réponse
    const response = await getAIResponse(message);
    res.json({ response });
  } catch (error) {
    console.error('Erreur dans la route chatbot:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;