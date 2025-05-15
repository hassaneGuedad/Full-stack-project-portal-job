import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthProvider";
import { toast } from "react-hot-toast";

const MyJobs = () => {
  const { user } = useContext(AuthContext);
  const [jobs, setJobs] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  
  // État pour le modal CV
  const [selectedCVs, setSelectedCVs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");

  // Add useEffect to fetch jobs
  useEffect(() => {
    fetchJobs();
  }, [user]);

  // Add fetchJobs function
  const fetchJobs = async () => {
    if (!user?.email) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:3003/myJobs/${user.email}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP! statut: ${response.status}`);
      }
      
      const data = await response.json();
      setJobs(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Erreur lors de la récupération des offres:', error);
      toast.error('Erreur lors du chargement des offres');
      setIsLoading(false);
    }
  };

  // Modification du useEffect pour inclure user.email dans les dépendances
  useEffect(() => {
    fetchJobs();
  }, [user?.email]);

  // Add the missing handleSearch function
  const handleSearch = () => {
    const filteredJobs = jobs.filter((job) =>
      job.jobTitle.toLowerCase().includes(searchText.toLowerCase()) ||
      job.companyName.toLowerCase().includes(searchText.toLowerCase())
    );
    setJobs(filteredJobs);
  };

  // Calcul des indices pour la pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentJobs = jobs.slice(indexOfFirstItem, indexOfLastItem);

  // Fonction pour la page suivante
  const nextPage = () => {
    if (indexOfLastItem < jobs.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Mettre également à jour l'URL dans la fonction handleDelete
  const handleDelete = (id) => {
    fetch(`http://localhost:3003/job/${id}`, {
      method: "DELETE",
      credentials: 'include'
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.acknowledged === true) {
          alert("Job Deleted Successfully!!");
          // Filter out the deleted job from the current list of jobs
          const updatedJobs = jobs.filter((job) => job._id !== id);
          // Update the jobs state with the updated list
          setJobs(updatedJobs);
        }
      });
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Fonction pour ouvrir le modal avec tous les CVs d'une offre
  const openCVsModal = (cvs, title) => {
    setSelectedCVs(Array.isArray(cvs) ? cvs : [cvs]);
    setModalTitle(title);
    setIsModalOpen(true);
  };

  // Fonction pour fermer le modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCVs([]);
  };

  // Composant Modal pour afficher les CVs
  const CVModal = () => {
    if (!isModalOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-11/12 md:w-3/4 lg:w-2/3 max-h-[90vh] overflow-hidden flex flex-col">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="text-xl font-semibold">{modalTitle}</h3>
            <button 
              onClick={closeModal}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              &times;
            </button>
          </div>
          <div className="p-6 overflow-y-auto flex-grow">
            {selectedCVs.length > 0 ? (
              <div className="space-y-8">
                {selectedCVs.map((cv, index) => (
                  <div key={index} className="border-b pb-6 mb-6 last:border-0">
                    <h4 className="font-semibold text-lg mb-4">CV #{index + 1}</h4>
                    {cv.startsWith('http') ? (
                      <div className="flex flex-col items-center">
                        <p className="mb-4">Lien vers le CV: </p>
                        <a 
                          href={cv} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-600 hover:underline"
                        >
                          {cv}
                        </a>
                      </div>
                    ) : (
                      <div dangerouslySetInnerHTML={{ __html: cv }} />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">Aucun CV disponible</p>
            )}
          </div>
          <div className="p-4 border-t flex justify-end">
            <button 
              onClick={closeModal}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-screen-2xl container mx-auto xl:px-24 px-4">
      <div className="my-jobs-container">
        <h1 className="text-center p-4 ">ALL My Jobs</h1>
        <div className="search-box p-2 text-center mb-2">
          <input
            onChange={(e) => setSearchText(e.target.value)}
            type="text"
            className="py-2 pl-3 border focus:outline-none lg:w-6/12 mb-4 w-full"
          />
          <button
            onClick={handleSearch}
            className="bg-blue text-white font-semibold px-8 py-2 rounded-sm mb-4"
          >
            Search
          </button>
        </div>

        {/* table */}
        <section className="py-1 bg-blueGray-50">
          <div className="w-full xl:w-10/12 mb-12 xl:mb-0 px-4 mx-auto mt-5">
            <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded ">
              <div className="rounded-t mb-0 px-4 py-3 border-0">
                <div className="flex md:flex-row gap-4 flex-col items-center">
                  <div className="relative w-full px-4 max-w-full flex-grow flex-1">
                    <h3 className="font-semibold text-base text-blueGray-700">
                      All Jobs
                    </h3>
                  </div>
                  <div className="relative w-full px-4 max-w-full flex-grow flex-1 text-right">
                    <Link
                      to="/post-job"
                      className="bg-indigo-500 text-white active:bg-indigo-600 text-xs font-bold uppercase px-3 py-1 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    >
                      Post A New Job
                    </Link>
                  </div>
                </div>
              </div>

              <div className="block w-full overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Job Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Company
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Candidatures
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentJobs.map((job) => (
                      <tr key={job._id}>
                        <td className="px-6 py-4">{job.jobTitle}</td>
                        <td className="px-6 py-4">{job.companyName}</td>
                        <td className="px-6 py-4">{job.jobLocation}</td>
                        <td className="px-6 py-4 space-x-2">
                          <Link to={`/jobs/${job._id}`} className="text-blue-600 hover:text-blue-900 mr-2">
                            Consulter
                          </Link>
                          <Link to={`/edit-job/${job._id}`} className="text-green-600 hover:text-green-900 mr-2">
                            Modifier
                          </Link>
                          <button
                            onClick={() => handleDelete(job._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Supprimer
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          {job.cvs && job.cvs.length > 0 ? (
                            <div>
                              <p className="font-semibold mb-2">{job.cvs.length} candidature(s)</p>
                              <button
                                onClick={() => openCVsModal(job.cvs, `Candidatures pour ${job.jobTitle}`)}
                                className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700"
                              >
                                Voir tous les CVs
                              </button>
                            </div>
                          ) : job.cv ? (
                            // Gestion des anciens jobs avec un seul CV
                            <button
                              onClick={() => openCVsModal(job.cv, `CV pour ${job.jobTitle}`)}
                              className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700"
                            >
                              Voir le CV
                            </button>
                          ) : (
                            <span className="text-gray-500">Aucun CV</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          {/* pagination */}
          <div className="flex justify-center text-black space-x-8">
            {currentPage > 1 && (
              <button onClick={prevPage} className="hover:underline">
                Previous
              </button>
            )}
            {indexOfLastItem < jobs.length && (
              <button onClick={nextPage} className="hover:underline">
                Next
              </button>
            )}
          </div>
        </section>
      </div>
      
      {/* Modal pour afficher le CV */}
      <CVModal />
    </div>
  );
};

export default MyJobs;
