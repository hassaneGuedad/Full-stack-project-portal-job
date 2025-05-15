/* eslint-disable react/no-unknown-property */
import React, { useState } from "react";
import PageHeader from "../components/PageHeader";
import { FaDollarSign } from "react-icons/fa";
import { useForm } from "react-hook-form";
import CreatableSelect from "react-select/creatable";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const CreateJob = () => {
  const [selectedOption, setSelectedOption] = useState(null);

  // const { user } = useContext(AuthContext);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset 
  } = useForm({
    defaultValues: {
      jobTitle: "",
      companyName: "",
      minPrice: "",
      maxPrice: "",
      salaryType: "",
      jobLocation: "",
      postingDate: "",
      experienceLevel: "",
      companyLogo: "",
      employmentType: "",
      description: ""
    }
  });

  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const response = await fetch("http://localhost:3003/post-job", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          ...data,
          skills: selectedOption ? selectedOption.map(skill => skill.value) : []
        }),
        credentials: "include"
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Erreur HTTP! statut: ${response.status}`);
      }

      const result = await response.json();
      toast.success("Offre d'emploi publiée avec succès!");
      reset();
      navigate('/my-job');
    } catch (error) {
      console.error("Erreur lors de la soumission:", error);
      toast.error("Erreur lors de la publication de l'offre d'emploi. Vérifiez que le serveur est démarré sur le port 3003.");
    }
};

  const options = [
    { value: "JavaScript", label: "JavaScript" },
    { value: "C++", label: "C++" },
    { value: "HTML", label: "HTML" },
    { value: "CSS", label: "CSS" },
    { value: "React", label: "React" },
    { value: "Node", label: "Node" },
    { value: "MongoDB", label: "MongoDB" },
    { value: "Redux", label: "Redux" },
  ];

  // console.log(watch("example"));

  return (
    <div className="max-w-screen-2xl container mx-auto xl:px-24 px-4">
      {/* <PageHeader title={"Post A Job"} path={"Create Job"} /> */}

      {/* form */}
      <div className="bg-[#FAFAFA] py-10 px-4 lg:px-16">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* 1st row */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="lg:w-1/2 w-full">
              <label className="block mb-2 text-lg">Job Title *</label>
              <input
                {...register("jobTitle", { required: "Job title is required" })}
                className="create-job-input"
                placeholder="Ex: Senior React Developer"
              />
              {errors.jobTitle && <p className="text-red-500 text-sm mt-1">{errors.jobTitle.message}</p>}
            </div>
            <div className="lg:w-1/2 w-full">
              <label className="block mb-2 text-lg">Company Name *</label>
              <input
                {...register("companyName", { required: "Company name is required" })}
                className="create-job-input"
                placeholder="Ex: Microsoft"
              />
              {errors.companyName && <p className="text-red-500 text-sm mt-1">{errors.companyName.message}</p>}
            </div>
          </div>

          {/* 2nd row */}
          <div className="create-job-flex">
            <div className="lg:w-1/2 w-full">
              <label className="block mb-2 text-lg">Minimum Salary *</label>
              <input
                type="number"
                {...register("minPrice", { 
                  required: "Minimum salary is required",
                  min: { value: 0, message: "Salary must be positive" }
                })}
                className="create-job-input"
                placeholder="Ex: 50000"
              />
              {errors.minPrice && <p className="text-red-500 text-sm mt-1">{errors.minPrice.message}</p>}
            </div>
            <div className="lg:w-1/2 w-full">
              <label className="block mb-2 text-lg">Maximum Salary *</label>
              <input
                type="number"
                {...register("maxPrice", { 
                  required: "Maximum salary is required",
                  min: { value: 0, message: "Salary must be positive" }
                })}
                className="create-job-input"
                placeholder="Ex: 100000"
              />
              {errors.maxPrice && <p className="text-red-500 text-sm mt-1">{errors.maxPrice.message}</p>}
            </div>
          </div>

          {/* 3rd row */}
          <div className="create-job-flex">
            <div className="lg:w-1/2 w-full">
              <label className="block mb-2 text-lg">Salary Type</label>
              <select {...register("salaryType")} className="create-job-input">
                <option value="">Choose your salary</option>
                <option value="Hourly">Hourly</option>
                <option value="Monthly">Monthly</option>
                <option value="Yearly">Yearly</option>
              </select>
            </div>
            <div className="lg:w-1/2 w-full">
              <label className="block mb-2 text-lg">Job Location</label>
              <input
                placeholder="Ex: New York"
                {...register("jobLocation")}
                className="create-job-input"
              />
            </div>
          </div>

          {/* 4th row */}
          <div className="create-job-flex">
            <div className="lg:w-1/2 w-full">
              <label className="block mb-2 text-lg">Job Posting Date</label>
              <input
                className="create-job-input"
                {...register("postingDate")}
                placeholder="Ex: 2023-11-03"
                type="date"
              />
            </div>

            <div className="lg:w-1/2 w-full">
              <label className="block mb-2 text-lg">Experience Level</label>
              <select
                {...register("experienceLevel")}
                className="create-job-input"
              >
                <option value="">Select Your Experience Level</option>
                <option value="Fresher">Fresher</option>
                <option value="Internship">Internship</option>
                <option value="Work remotely">Work remotely</option>
              </select>
            </div>
          </div>

          {/* 5th row */}
          <div className="">
            <label className="block mb-2 text-lg">Required Skill Sets:</label>
            <CreatableSelect
              className="create-job-input py-4"
              defaultValue={selectedOption}
              onChange={setSelectedOption}
              options={options}
              isMulti
            />
          </div>

          {/* 6th row */}
          <div className="create-job-flex">
            <div className="lg:w-1/2 w-full">
              <label className="block mb-2 text-lg">Company Logo</label>
              <input
                type="url"
                placeholder="Paste your image url: https://weshare.com/img1.jpg"
                {...register("companyLogo")}
                className="create-job-input"
              />
            </div>

            <div className="lg:w-1/2 w-full">
              <label className="block mb-2 text-lg">Employment Type</label>
              <select
                {...register("employmentType")}
                className="create-job-input"
              >
                <option value="">Select your job type</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Temporary">Temporary</option>
              </select>
            </div>
          </div>

          {/* 7th row */}
          <div className="w-full">
          <label className="block mb-2 text-lg">Job Description</label>
          <textarea
              className="w-full pl-3 py-1.5 focus:outline-none"
              rows={6}
              {...register("description")}
              placeholder="job description"
              defaultValue={"Mollit in laborum tempor Lorem incididunt irure. Aute eu ex ad sunt. Pariatur sint culpa do incididunt eiusmod eiusmod culpa. laborum tempor Lorem incididunt."}
            />
          </div>

          {/* last row */}
          <div className="w-full">
          <label className="block mb-2 text-lg">Job Posted by</label>
          <input
          type="email"
              // value={user?.email}
              className="w-full pl-3 py-1.5 focus:outline-none"
              {...register("postedBy")}
              placeholder="your email"
            />
          </div>

          <input
            type="submit"
            className="block mt-12 bg-blue text-white font-semibold px-8 py-2 rounded-sm cursor-pointer"
          />
        </form>
      </div>
    </div>
  );
};

export default CreateJob;
