import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const AllJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await fetch('http://localhost:5002/all-jobs');
      const data = await response.json();
      setJobs(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Erreur lors du chargement des jobs');
      setLoading(false);
    }
  };

  const handleApply = async (jobId) => {
    // Rediriger vers la page de génération de CV avec l'ID du job
    window.location.href = `/generate-cv-ai?jobId=${jobId}`;
  };

  return (
    <div className="max-w-screen-2xl container mx-auto xl:px-24 px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">Tous les jobs</h1>
      
      {loading ? (
        <div className="text-center">Chargement...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <div key={job._id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-semibold mb-2">{job.jobTitle}</h2>
              <p className="text-gray-600 mb-2">{job.companyName}</p>
              <p className="text-gray-500 mb-4">{job.jobLocation}</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {job.employmentType && (
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {job.employmentType}
                  </span>
                )}
                {job.salaryRange && (
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                    {job.salaryRange}
                  </span>
                )}
              </div>

              <div className="flex justify-between items-center mt-4">
                <Link
                  to={`/jobs/${job._id}`}  // C'est le bon format
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                >
                  Consulter
                </Link>
                <button
                  onClick={() => handleApply(job._id)}
                  className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
                >
                  Postuler
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllJobs;