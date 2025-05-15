import React from "react";
import { FiMapPin, FiSearch } from "react-icons/fi";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";

const Banner = ({ handleInputChange, handleLocationChange, query, locationQuery }) => {
  const responsive = {
    superLargeDesktop: {
      breakpoint: { max: 4000, min: 3000 },
      items: 1
    },
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 1
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 1
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1
    }
  };

  const images = [
    "/images/carousel/kuwait_offre.png",
    "/images/carousel/saudia_offre.jpg",
    "/images/carousel/cap_offre.png",
    "/images/carousel/emsi_offre.png",
    "/images/carousel/OP1.png"
  ];

  return (
    <div className="max-w-screen-2xl container mx-auto xl:px-24 px-4">
      <div className="md:py-20 py-14">
        <h1 className="text-5xl font-bold text-primary mb-3">
          Find your <span className="text-blue">new job</span> today
        </h1>
        <p className="text-lg text-black/70 mb-8">
          Thousands of jobs in the computer, engineering and technology sectors
          are waiting for you.
        </p>

        <form className="mb-8">
          <div className="flex justify-start md:flex-row flex-col md:gap-0 gap-4">
            <div className="relative flex md:rounded-s-md rounded shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 md:w-1/2 w-full">
              <FiSearch className="absolute top-2.5 left-2 text-gray-400" />
              <input
                type="text"
                name="position"
                id="position"
                className="block flex-1 border-0 bg-transparent py-1.5 pl-8 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                placeholder="What position are you looking for?"
                onChange={handleInputChange}
                value={query}
                aria-label="Search by position"
              />
            </div>

            <div className="relative flex md:rounded-none rounded ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 md:w-1/3 w-full">
              <FiMapPin className="absolute top-2.5 left-2 text-gray-400" />
              <input
                type="text"
                name="location"
                id="location"
                className="block flex-1 border-0 bg-transparent py-1.5 pl-8 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                placeholder="Location"
                onChange={handleLocationChange}
                value={locationQuery}
                aria-label="Search by location"
              />
            </div>

            <button
              type="submit"
              className="bg-blue py-2 px-8 text-white md:rounded-e-md md:rounded-s-none rounded"
            >
              Search
            </button>
          </div>
        </form>

        <div className="mt-8">
          <Carousel
            responsive={responsive}
            infinite={true}
            autoPlay={true}
            autoPlaySpeed={3000}
            className="z-0"
          >
            {images.map((image, index) => (
              <div key={index} className="px-2">
                <img 
                  src={image} 
                  alt={`Job Offer ${index + 1}`}
                  className="w-full h-[400px] object-cover rounded-lg"
                />
              </div>
            ))}
          </Carousel>
        </div>
      </div>
    </div>
  );
};

export default Banner;
