import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';

const GenerateCVAI = () => {
  const { register, handleSubmit, getValues, formState: { errors } } = useForm();
  const [cvPreview, setCvPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      console.log('Sending data to server:', data);
      
      // Vérifier que le serveur est accessible
      try {
        const pingResponse = await fetch('http://localhost:3003/ping', { method: 'GET' });
        if (!pingResponse.ok) {
          throw new Error('Le serveur n\'est pas accessible');
        }
      } catch (pingError) {
        console.error('Erreur de connexion au serveur:', pingError);
        toast.error('Le serveur n\'est pas accessible. Veuillez vérifier que le serveur backend est en cours d\'exécution.');
        setIsLoading(false);
        return;
      }
      
      // Générer la version HTML uniquement
      const htmlResponse = await fetch('http://localhost:3003/generate-cv-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...data,
          language: 'french',
          format: 'professional'
        }),
      });

      if (!htmlResponse.ok) {
        const errorData = await htmlResponse.json();
        console.error('Server error details:', errorData);
        throw new Error(errorData.message || errorData.error || 'Failed to generate CV');
      }

      const htmlData = await htmlResponse.json();
      
      // Nettoyer le HTML pour éviter les problèmes de ressources externes
      let cleanHtml = htmlData.cv;
      
      // Supprimer les liens externes qui pourraient causer des problèmes
      cleanHtml = cleanHtml.replace(/<link[^>]*>/g, '');
      
      // Remplacer les URLs relatives par des URLs absolues si nécessaire
      // cleanHtml = cleanHtml.replace(/src="\//g, 'src="http://localhost:3003/');
      
      // Supprimer les scripts qui pourraient causer des problèmes
      cleanHtml = cleanHtml.replace(/<script[^>]*>[\s\S]*?<\/script>/g, '');
      
      setCvPreview(cleanHtml);

      // Stocker le CV si nécessaire
      const urlParams = new URLSearchParams(window.location.search);
      const jobId = urlParams.get('jobId');
      if (jobId && cleanHtml) {
        await storeCV(jobId, cleanHtml);
      }
      
      toast.success('CV généré avec succès!');
    } catch (error) {
      console.error('Error details:', error);
      toast.error(`Erreur: ${error.message || 'Une erreur est survenue lors de la génération du CV'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const storeCV = async (jobId, cv) => {
    try {
      const storeResponse = await fetch(`http://localhost:3003/store-cv/${jobId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ cv }),
      });

      if (!storeResponse.ok) {
        throw new Error('Failed to store CV');
      }

      toast.success('CV stocké avec succès!');
    } catch (error) {
      console.error('Error storing CV:', error);
      toast.error('Erreur lors du stockage du CV');
    }
  };

  const handleDownloadPDF = async () => {
    if (!cvPreview) {
      toast.error('No CV preview available');
      return;
    }

    try {
      setIsLoading(true);
      // Récupérer les valeurs actuelles du formulaire
      const formData = getValues();
      
      // Vérifier que le serveur est accessible
      try {
        const pingResponse = await fetch('http://localhost:3003/ping', { method: 'GET' });
        if (!pingResponse.ok) {
          throw new Error('Le serveur n\'est pas accessible');
        }
      } catch (pingError) {
        console.error('Erreur de connexion au serveur:', pingError);
        toast.error('Le serveur n\'est pas accessible. Veuillez vérifier que le serveur backend est en cours d\'exécution.');
        setIsLoading(false);
        return;
      }
      
      // Appel à l'API avec le paramètre format=pdf
      const response = await fetch('http://localhost:3003/generate-cv-ai?format=pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          language: 'french',
          format: 'professional'
        }),
        // Ajouter un timeout pour éviter que la requête ne reste bloquée indéfiniment
        signal: AbortSignal.timeout(120000) // 120 secondes de timeout
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la génération du PDF');
      }
      
      // Récupérer le blob PDF
      const blob = await response.blob();
      
      // Créer un URL pour le blob
      const url = window.URL.createObjectURL(blob);
      
      // Créer un lien temporaire pour le téléchargement
      const a = document.createElement('a');
      a.href = url;
      a.download = `${formData.fullName.replace(/\s+/g, '_')}_CV.pdf`;
      document.body.appendChild(a);
      a.click();
      
      // Nettoyer
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(`Erreur: ${error.message || 'Une erreur est survenue lors du téléchargement du PDF'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-screen-2xl container mx-auto xl:px-24 px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">Generate CV with AI</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Informations personnelles */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Informations personnelles</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-lg mb-2">Nom complet *</label>
                <input
                  {...register("fullName", { required: "Le nom complet est requis" })}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Votre nom complet"
                />
                {errors.fullName && <span className="text-red-500 text-sm">{errors.fullName.message}</span>}
              </div>

              <div>
                <label className="block text-lg mb-2">Téléphone *</label>
                <input
                  {...register("phone", { required: "Le numéro de téléphone est requis" })}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Votre numéro de téléphone"
                />
                {errors.phone && <span className="text-red-500 text-sm">{errors.phone.message}</span>}
              </div>

              <div>
                <label className="block text-lg mb-2">Email *</label>
                <input
                  type="email"
                  {...register("email", { required: "L'email est requis" })}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Votre email"
                />
                {errors.email && <span className="text-red-500 text-sm">{errors.email.message}</span>}
              </div>

              <div>
                <label className="block text-lg mb-2">LinkedIn</label>
                <input
                  {...register("linkedin")}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Votre profil LinkedIn"
                />
              </div>

              <div>
                <label className="block text-lg mb-2">Adresse *</label>
                <textarea
                  {...register("address", { required: "L'adresse est requise" })}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="2"
                  placeholder="Votre adresse complète"
                />
                {errors.address && <span className="text-red-500 text-sm">{errors.address.message}</span>}
              </div>
            </div>
          </div>

          {/* Profil */}
          <div>
            <label className="block text-lg mb-2">Profil *</label>
            <textarea
              {...register("profile", { required: "Le profil est requis" })}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="4"
              placeholder="Une brève description de votre profil professionnel"
            />
            {errors.profile && <span className="text-red-500 text-sm">{errors.profile.message}</span>}
          </div>

          {/* Certifications */}
          <div>
            <label className="block text-lg mb-2">Certifications</label>
            <textarea
              {...register("certifications")}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="4"
              placeholder="Listez vos certifications (une par ligne)"
            />
          </div>

          {/* Expérience professionnelle */}
          <div>
            <label className="block text-lg mb-2">Expérience professionnelle *</label>
            <textarea
              {...register("experience", { required: "L'expérience professionnelle est requise" })}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="6"
              placeholder="Décrivez vos expériences professionnelles (une par ligne)"
            />
            {errors.experience && <span className="text-red-500 text-sm">{errors.experience.message}</span>}
          </div>

          {/* Compétences techniques */}
          <div>
            <label className="block text-lg mb-2">Compétences techniques *</label>
            <textarea
              {...register("technicalSkills", { required: "Les compétences techniques sont requises" })}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="4"
              placeholder="Listez vos compétences techniques (séparées par des virgules)"
            />
            {errors.technicalSkills && <span className="text-red-500 text-sm">{errors.technicalSkills.message}</span>}
          </div>

          {/* Formation */}
          <div>
            <label className="block text-lg mb-2">Formation *</label>
            <textarea
              {...register("education", { required: "La formation est requise" })}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="4"
              placeholder="Décrivez votre formation (une par ligne)"
            />
            {errors.education && <span className="text-red-500 text-sm">{errors.education.message}</span>}
          </div>

          {/* Langues */}
          <div>
            <label className="block text-lg mb-2">Langues</label>
            <textarea
              {...register("languages")}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="2"
              placeholder="Listez vos langues (séparées par des virgules)"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-purple-600 text-white py-3 px-6 rounded-lg text-lg font-semibold hover:bg-purple-700 transition-colors shadow-md ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Génération en cours...' : 'Générer le CV avec AI'}
          </button>
          
          <p className="text-sm text-gray-500 mt-2 text-center">
            Notre IA analyse vos informations pour créer un CV professionnel et personnalisé
          </p>
        </form>
        
        {/* Carte d'affichage du CV */}
        {cvPreview && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden w-full max-w-3xl mx-auto">
            <div className="p-4 bg-purple-600 text-white">
              <h2 className="text-xl font-bold">Aperçu de votre CV</h2>
            </div>
            <div className="p-4">
              <div className="cv-preview overflow-auto max-h-[800px] p-6 border rounded bg-white print:max-h-none print:overflow-visible">
                <style>
                  {`
                    .cv-preview * {
                      font-family: Arial, sans-serif;
                      line-height: 1.5;
                      color: #333;
                    }
                    .cv-preview h1 {
                      font-size: 24px;
                      font-weight: bold;
                      margin-bottom: 15px;
                      color: #2c3e50;
                    }
                    .cv-preview h2 {
                      font-size: 20px;
                      font-weight: bold;
                      margin-top: 20px;
                      margin-bottom: 10px;
                      color: #3498db;
                      border-bottom: 1px solid #eee;
                      padding-bottom: 5px;
                    }
                    .cv-preview h3 {
                      font-size: 18px;
                      font-weight: bold;
                      margin-top: 15px;
                      margin-bottom: 8px;
                      color: #2c3e50;
                    }
                    .cv-preview ul {
                      padding-left: 20px;
                      margin-bottom: 15px;
                    }
                    .cv-preview li {
                      margin-bottom: 5px;
                    }
                    .cv-preview p {
                      margin-bottom: 10px;
                    }
                    .cv-preview section {
                      margin-bottom: 20px;
                    }
                    .cv-preview table {
                      width: 100%;
                      border-collapse: collapse;
                      margin-bottom: 15px;
                    }
                    .cv-preview th, .cv-preview td {
                      border: 1px solid #ddd;
                      padding: 8px;
                      text-align: left;
                    }
                    .cv-preview th {
                      background-color: #f2f2f2;
                    }
                    @media print {
                      .cv-preview {
                        padding: 0;
                        border: none;
                      }
                    }
                  `}
                </style>
                <div dangerouslySetInnerHTML={{ __html: cvPreview }} className="text-base" />
              </div>
              <div className="mt-4 flex justify-end space-x-3">
                {/* Espace pour d'éventuels boutons futurs */}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GenerateCVAI;