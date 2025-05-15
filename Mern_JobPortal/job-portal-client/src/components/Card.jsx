import {
  FiCalendar,
  FiClock,
  FiDollarSign,
  FiMapPin,
  FiSearch,
} from "react-icons/fi";
import { Link } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';

const isValidImageUrl = (url) => {
  if (!url) return false;
  return url.match(/\.(jpeg|jpg|gif|png)$/) != null;
};

// Changement de l'image par défaut pour une URL plus fiable
const defaultImage = "https://raw.githubusercontent.com/koehlersimon/fallback/master/Resources/Public/Images/placeholder.jpg";

const Card = ({ data }) => {
  const {
    jobTitle,
    companyName,
    companyLogo,
    jobLocation,
    employmentType,
    salaryType,
    experienceLevel,
    description
  } = data;

  const [showInput, setShowInput] = useState(false);
  const [cvLink, setCvLink] = useState('');
  const [loading, setLoading] = useState(false);

  const handleApplyClick = (e) => {
    e.stopPropagation(); // Prevent parent click events
    setShowInput(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`http://localhost:3003/store-cv/${data._id}`, { cv: cvLink });
      setShowInput(false);
      setCvLink('');
      alert('CV link submitted successfully!');
    } catch (err) {
      alert('Error submitting CV link');
    }
    setLoading(false);
  };

  return (
    <div className="card bg-white p-4 rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <img 
            src={isValidImageUrl(companyLogo) ? companyLogo : defaultImage} 
            alt={companyName || 'Company Logo'} 
            className="w-16 h-16 object-contain rounded-lg mr-4"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 150 150'%3E%3Crect width='150' height='150' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='14' fill='%23999'%3ELogo%3C/text%3E%3C/svg%3E";
            }}
          />
          <div>
            <h3 className="text-xl font-semibold">{jobTitle}</h3>
            <p className="text-gray-600">{companyName}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-gray-600">{jobLocation}</p>
          <p className="text-gray-600">{employmentType}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
          {salaryType}
        </span>
        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
          {experienceLevel}
        </span>
      </div>
      <p className="text-gray-700 mb-4">{description}</p>
      <div className="flex justify-between items-center mt-4">
        <Link
          to={`/jobs/${data._id}`}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Consulter
        </Link>
        <button
          type="button"
          onClick={handleApplyClick}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
        >
          Postuler
        </button>
      </div>
      
      {showInput && (
        <form onSubmit={handleSubmit} className="mt-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="url"
              placeholder="Entrez le lien de votre CV"
              value={cvLink}
              onChange={e => setCvLink(e.target.value)}
              required
              className="flex-grow p-2 border rounded"
            />
            <button 
              type="submit" 
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors disabled:bg-gray-400"
            >
              {loading ? 'Envoi...' : 'Soumettre'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Card;
