import React, { useEffect, useState } from "react";
import Banner from "../components/Banner";
import Sidebar from "../Sidebar/Sidebar";
import Jobs from "./Jobs";
import Card from "../components/Card";
import Newsletter from "../components/Newsletter";

const Home = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      let retries = 3;
      
      while (retries > 0) {
        try {
          console.log(`Tentative de récupération des jobs (${4-retries}/3)...`);
          const response = await fetch('http://localhost:3003/all-jobs');
          console.log("Response status:", response.status);
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          console.log("Jobs data received:", data);
          setJobs(data);
          setIsLoading(false);
          return; // Succès, on sort de la fonction
        } catch (error) {
          console.error(`Erreur lors de la tentative ${4-retries}:`, error);
          retries--;
          
          if (retries === 0) {
            console.error("Échec après 3 tentatives");
            setIsLoading(false);
            // Optionally set an error state here
          } else {
            // Attendre 1 seconde avant de réessayer
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }
    };

    fetchJobs();
  }, []);

  // ----------- Input Filter -----------
  const [query, setQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState(""); // Ajout de l'état pour la recherche par location
  
  const handleInputChange = (event) => {
    setQuery(event.target.value);
  };
  
  const handleLocationChange = (event) => { // Ajout du gestionnaire pour la recherche par location
    setLocationQuery(event.target.value);
  };

  const filteredItems = jobs.filter(
    (job) => job.jobTitle.toLowerCase().indexOf(query.toLowerCase()) !== -1
  );

  // ----------- Radio Filtering -----------
  const handleChange = (event) => {
    setSelectedCategory(event.target.value);
    // console.log(event.target.value);
  };

  // ------------ Button Filtering -----------
  const handleClick = (event) => {
    setSelectedCategory(event.target.value);
  };

  // Function to calculate the index range for the current page
  const calculatePageRange = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return { startIndex, endIndex };
  };

  // Function to handle next page
  const nextPage = () => {
    if (currentPage < Math.ceil(filteredItems.length / itemsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Function to handle previous page
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const filteredData = (jobs, selected, query, locationQuery) => {
    let filteredJobs = jobs;
    // Filtering Input Items

    console.log(filteredItems);
    if (query) {
      filteredJobs = filteredItems;
    }

    // Applying selected filter
    if (selected) {
      console.log(selected);

      filteredJobs = filteredJobs.filter(
        ({
          jobLocation,
          salaryType,
          experienceLevel,
          maxPrice,
          postingDate,
          employmentType,
        }) =>
          jobLocation.toLowerCase() === selected.toLowerCase() ||
          postingDate === selected ||
          parseInt(maxPrice) <= parseInt(selected) ||
          salaryType.toLowerCase() === selected.toLowerCase() ||
          experienceLevel.toLowerCase() === selected.toLowerCase() ||
          employmentType.toLowerCase() === selected.toLowerCase()
      );
      console.log(filteredJobs);
    }

    // Slice the data based on the current page
    const { startIndex, endIndex } = calculatePageRange();
    filteredJobs = filteredJobs.slice(startIndex, endIndex);

    return filteredJobs.map((data, i) => <Card key={i} data={data} />);
  };

  const result = filteredData(jobs, selectedCategory, query, locationQuery);

  return (
    <div>
      <Banner 
        query={query} 
        locationQuery={locationQuery} 
        handleInputChange={handleInputChange} 
        handleLocationChange={handleLocationChange} 
      />

      {/* main content */}
      <div className="bg-[#FAFAFA] md:grid grid-cols-4 gap-8 lg:px-24 px-4 py-12">
        <div className="bg-white p-4 rounded">
          <Sidebar handleChange={handleChange} handleClick={handleClick} />
        </div>
        <div className="col-span-2 bg-white p-4 rounded">
          {isLoading ? ( // Loading indicator
            <p className="font-medium">Loading...</p>
          ) : result.length > 0 ? (
            <Jobs result={result} />
          ) : (
            <>
              <h3 className="text-lg font-bold mb-2">{result.length} Jobs</h3>
              <p>No data found</p>
            </>
          )}

          {/* pagination block here */}

          {result.length > 0 ? (
            <div className="flex justify-center mt-4 space-x-8">
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className="hover:underline"
              >
                Previous
              </button>
              <span className="mx-2">
                Page {currentPage} of{" "}
                {Math.ceil(filteredItems.length / itemsPerPage)}
              </span>
              <button
                onClick={nextPage}
                disabled={
                  currentPage === Math.ceil(filteredItems.length / itemsPerPage)
                }
                className="hover:underline"
              >
                Next
              </button>
            </div>
          ) : (
            ""
          )}
        </div>
        <div className="bg-white p-4 rounded">
          <Newsletter />
        </div>
      </div>
    </div>
  );
};

export default Home;
