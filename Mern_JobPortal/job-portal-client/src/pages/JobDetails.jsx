import React, { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import { useParams, useNavigate } from "react-router-dom";
import { FaBriefcase } from "react-icons/fa6";
import Swal from "sweetalert2";
import { toast } from 'react-hot-toast';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cv, setCv] = useState(null);

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      const response = await fetch(`http://localhost:5002/all-jobs/${id}`);
      const data = await response.json();
      setJob(data);
      if (data.cv) {
        setCv(data.cv);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching job details:', error);
      toast.error('Erreur lors du chargement des détails du job');
      setLoading(false);
    }
  };

  const handleJobApply = async () => {
    // console.log("btn clicked")
    const { value: url } = await Swal.fire({
      input: "url",
      inputLabel: "CV or Resume URL address",
      inputPlaceholder: "Enter the URL",
    });
    if (url) {
      Swal.fire(`Entered URL: ${url}`).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
          Swal.fire("Appliction Submited Successfully!", "", "success");
        } else if (result.isDenied) {
          Swal.fire("Changes are not saved", "", "info");
        }
      });
    }
  };

  const handleApply = () => {
    navigate(`/generate-cv-ai?jobId=${id}`);
  };

  if (loading) {
    return <div className="text-center">Chargement...</div>;
  }

  if (!job) {
    return <div className="text-center">Job non trouvé</div>;
  }

  return (
    <div className="max-w-screen-2xl container mx-auto xl:px-24 px-4 py-10">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-4">{job.jobTitle}</h1>
        <p className="text-xl text-gray-600 mb-4">{job.companyName}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Détails du poste</h2>
            <div className="space-y-2">
              <p><span className="font-semibold">Localisation:</span> {job.jobLocation}</p>
              <p><span className="font-semibold">Type d'emploi:</span> {job.employmentType}</p>
              <p><span className="font-semibold">Salaire:</span> {job.salaryRange}</p>
              <p><span className="font-semibold">Date de publication:</span> {new Date(job.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Description</h2>
            <p className="text-gray-700">{job.jobDescription}</p>
          </div>
        </div>

        {cv && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">CV du candidat</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div dangerouslySetInnerHTML={{ __html: cv }} />
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleApply}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Postuler maintenant
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
