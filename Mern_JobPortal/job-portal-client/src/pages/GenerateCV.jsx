import React, { useState } from 'react';
import { PDFViewer, Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';

// Définition des styles pour le PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: '#FFFFFF'
  },
  section: {
    marginBottom: 15,
    padding: 10
  },
  header: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    marginBottom: 20
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 10,
    color: '#2c3e50'
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 10,
    color: '#3498db',
    borderBottom: '1 solid #3498db',
    paddingBottom: 5
  },
  text: {
    fontSize: 12,
    marginBottom: 5,
    lineHeight: 1.5
  },
  contactInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  experienceItem: {
    marginBottom: 10
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5
  },
  skillItem: {
    backgroundColor: '#e8f4f8',
    padding: '4 8',
    borderRadius: 4,
    fontSize: 10
  }
});

// Composant CV
const CV = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* En-tête avec informations personnelles */}
      <View style={styles.header}>
        <Text style={styles.title}>{data.fullName}</Text>
        <View style={styles.contactInfo}>
          <Text style={styles.text}>{data.email}</Text>
          <Text style={styles.text}>{data.phone}</Text>
        </View>
      </View>

      {/* Résumé professionnel */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>RÉSUMÉ PROFESSIONNEL</Text>
        <Text style={styles.text}>{data.summary}</Text>
      </View>

      {/* Expérience professionnelle */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>EXPÉRIENCE PROFESSIONNELLE</Text>
        {data.experiences.map((exp, index) => (
          <View key={index} style={styles.experienceItem}>
            <Text style={styles.text}>{exp.dates}</Text>
            <Text style={styles.text}>{exp.title} - {exp.company}</Text>
            <Text style={styles.text}>{exp.description}</Text>
          </View>
        ))}
      </View>

      {/* Formation */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>FORMATION</Text>
        {data.education.map((edu, index) => (
          <View key={index} style={styles.experienceItem}>
            <Text style={styles.text}>{edu.year}</Text>
            <Text style={styles.text}>{edu.degree} - {edu.school}</Text>
          </View>
        ))}
      </View>

      {/* Compétences */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>COMPÉTENCES</Text>
        <View style={styles.skillsContainer}>
          {data.skills.map((skill, index) => (
            <Text key={index} style={styles.skillItem}>{skill}</Text>
          ))}
        </View>
      </View>

      {/* Langues */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>LANGUES</Text>
        {data.languages.map((lang, index) => (
          <Text key={index} style={styles.text}>{lang}</Text>
        ))}
      </View>

      {/* Certifications */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>CERTIFICATIONS</Text>
        {data.certifications.map((cert, index) => (
          <Text key={index} style={styles.text}>{cert}</Text>
        ))}
      </View>
    </Page>
  </Document>
);

const GenerateCV = () => {
  const [cvData, setCvData] = useState({
    fullName: "",
    email: "",
    phone: "",
    summary: "",
    experiences: [],
    education: [],
    skills: [],
    languages: [],
    certifications: []
  });

  const [newExperience, setNewExperience] = useState({
    dates: "",
    title: "",
    company: "",
    description: ""
  });

  const [newEducation, setNewEducation] = useState({
    year: "",
    degree: "",
    school: ""
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCvData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleExperienceSubmit = (e) => {
    e.preventDefault();
    setCvData(prev => ({
      ...prev,
      experiences: [...prev.experiences, newExperience]
    }));
    setNewExperience({ dates: "", title: "", company: "", description: "" });
  };

  const handleEducationSubmit = (e) => {
    e.preventDefault();
    setCvData(prev => ({
      ...prev,
      education: [...prev.education, newEducation]
    }));
    setNewEducation({ year: "", degree: "", school: "" });
  };

  const handleSkillsChange = (e) => {
    const skills = e.target.value.split(',').map(skill => skill.trim());
    setCvData(prev => ({
      ...prev,
      skills
    }));
  };

  const handleLanguagesChange = (e) => {
    const languages = e.target.value.split(',').map(lang => lang.trim());
    setCvData(prev => ({
      ...prev,
      languages
    }));
  };

  const handleCertificationsChange = (e) => {
    const certifications = e.target.value.split(',').map(cert => cert.trim());
    setCvData(prev => ({
      ...prev,
      certifications
    }));
  };

  return (
    <div className="max-w-screen-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">Générateur de CV</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Formulaire */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="space-y-6"> {/* Changé de form à div */}
            {/* Informations personnelles */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Informations Personnelles</h2>
              <input
                type="text"
                name="fullName"
                value={cvData.fullName}
                onChange={handleInputChange}
                placeholder="Nom complet"
                className="w-full p-2 border rounded mb-2"
              />
              <input
                type="email"
                name="email"
                value={cvData.email}
                onChange={handleInputChange}
                placeholder="Email"
                className="w-full p-2 border rounded mb-2"
              />
              <input
                type="tel"
                name="phone"
                value={cvData.phone}
                onChange={handleInputChange}
                placeholder="Téléphone"
                className="w-full p-2 border rounded mb-2"
              />
              <textarea
                name="summary"
                value={cvData.summary}
                onChange={handleInputChange}
                placeholder="Résumé professionnel"
                className="w-full p-2 border rounded"
                rows="4"
              />
            </div>

            {/* Expérience professionnelle */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Expérience Professionnelle</h2>
              <div className="space-y-2">
                <input
                  type="text"
                  value={newExperience.dates}
                  onChange={(e) => setNewExperience({...newExperience, dates: e.target.value})}
                  placeholder="Dates (ex: 2020 - 2023)"
                  className="w-full p-2 border rounded"
                />
                <input
                  type="text"
                  value={newExperience.title}
                  onChange={(e) => setNewExperience({...newExperience, title: e.target.value})}
                  placeholder="Poste"
                  className="w-full p-2 border rounded"
                />
                <input
                  type="text"
                  value={newExperience.company}
                  onChange={(e) => setNewExperience({...newExperience, company: e.target.value})}
                  placeholder="Entreprise"
                  className="w-full p-2 border rounded"
                />
                <textarea
                  value={newExperience.description}
                  onChange={(e) => setNewExperience({...newExperience, description: e.target.value})}
                  placeholder="Description des responsabilités"
                  className="w-full p-2 border rounded"
                  rows="3"
                />
                <button
                  type="button"
                  onClick={handleExperienceSubmit}
                  className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors duration-300"
                >
                  Ajouter l'expérience
                </button>
              </div>
            </div>

            {/* Formation */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Formation</h2>
              <div className="space-y-2"> {/* Changé de form à div */}
                <input
                  type="text"
                  value={newEducation.year}
                  onChange={(e) => setNewEducation({...newEducation, year: e.target.value})}
                  placeholder="Année"
                  className="w-full p-2 border rounded"
                />
                <input
                  type="text"
                  value={newEducation.degree}
                  onChange={(e) => setNewEducation({...newEducation, degree: e.target.value})}
                  placeholder="Diplôme"
                  className="w-full p-2 border rounded"
                />
                <input
                  type="text"
                  value={newEducation.school}
                  onChange={(e) => setNewEducation({...newEducation, school: e.target.value})}
                  placeholder="École/Université"
                  className="w-full p-2 border rounded"
                />
                <button
                  onClick={handleEducationSubmit}
                  type="button"
                  className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors duration-300"
                >
                  Ajouter la formation
                </button>
              </div>
            </div>

            {/* Compétences */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Compétences</h2>
              <textarea
                value={cvData.skills.join(', ')}
                onChange={handleSkillsChange}
                placeholder="Compétences (séparées par des virgules)"
                className="w-full p-2 border rounded"
                rows="3"
              />
            </div>

            {/* Langues */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Langues</h2>
              <textarea
                value={cvData.languages.join(', ')}
                onChange={handleLanguagesChange}
                placeholder="Langues (séparées par des virgules)"
                className="w-full p-2 border rounded"
                rows="2"
              />
            </div>

            {/* Certifications */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Certifications</h2>
              <textarea
                value={cvData.certifications.join(', ')}
                onChange={handleCertificationsChange}
                placeholder="Certifications (séparées par des virgules)"
                className="w-full p-2 border rounded"
                rows="2"
              />
            </div>
          </div>
        </div>

        {/* Aperçu PDF */}
        <div className="h-[800px]">
          <PDFViewer style={{ width: '100%', height: '100%', border: 'none' }}>
            <CV data={cvData} />
          </PDFViewer>
          
          {/* Bouton de téléchargement */}
          <div className="mt-4">
            <PDFDownloadLink
              document={<CV data={cvData} />}
              fileName="mon-cv.pdf"
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 inline-block"
            >
              {({ blob, url, loading, error }) =>
                loading ? 'Génération du PDF...' : 'Télécharger le CV'
              }
            </PDFDownloadLink>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateCV;