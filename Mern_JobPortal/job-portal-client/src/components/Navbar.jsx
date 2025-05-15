/* eslint-disable react/no-unknown-property */
import React, { useContext, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { FaBarsStaggered, FaXmark, FaMoon, FaSun, FaUser, FaEnvelope, FaGear } from "react-icons/fa6";
import { AuthContext } from "../context/AuthProvider";
import { ThemeContext } from "../context/ThemeProvider";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { user, logOut } = useContext(AuthContext);
  const { darkMode, toggleTheme } = useContext(ThemeContext);
  
  const handleLogout = () => {
    logOut()
      .then(() => {
        // Sign-out successful.
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // menu toggle btn
  const handleMenuToggler = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  // profile menu toggle
  const handleProfileMenuToggler = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };
  
  const navItems = [
    { path: "/", title: "Start a search" },
    { path: "/my-job", title: "My Jobs" },
    { path: "/salary", title: "Salary estimate" },
    { path: "/post-job", title: "Post A Job" },
    { path: "/generate-cv", title: "Generate CV" },
    { path: "/generate-cv-ai", title: "Generate CV with AI" },
  ];
  return (
    <header className="max-w-screen-2xl container mx-auto xl:px-24 px-4">
      <nav className="flex justify-between items-center py-6">
        <a href="/" className="flex items-center gap-2 text-2xl">
          <img 
            src="/images/logo_job_portal_emsi.png" 
            alt="JobPortal EMSI Logo" 
            className="h-28 w-auto" // Changé de h-10 à h-16 pour un logo plus grand
          />
        </a>

        {/* nav items */}
        <ul className="hidden md:flex gap-12">
          {navItems.map(({ path, title }) => (
            <li key={path} className="text-base text-primary">
              <NavLink
                to={path}
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                {title}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* sign up signout btn */}
        <div className="text-base text-primary font-medium space-x-5 hidden lg:block">
          {user ? (
            <>
              <div className="flex gap-4 items-center relative">
                <div className="flex -space-x-2 overflow-hidden cursor-pointer" onClick={handleProfileMenuToggler}>
                  {user?.photoURL ? (
                    <img
                      className="inline-block h-10 w-10 rounded-full ring-2 ring-white"
                      src={user?.photoURL}
                      alt=""
                    />
                  ) : (
                    <img
                      className="inline-block h-10 w-10 rounded-full ring-2 ring-white"
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                      alt=""
                    />
                  )}
                </div>
                
                {/* Profile dropdown menu */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 top-12 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border">
                    {user?.email && (
                      <div className="px-4 py-2 text-sm text-gray-700 border-b flex items-center">
                        <FaEnvelope className="mr-2" />
                        {user.email}
                      </div>
                    )}
                    
                    <div className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center">
                      <FaUser className="mr-2" />
                      <Link to="/profile">Mon profil</Link>
                    </div>
                    
                    <div className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center justify-between border-b">
                      <div className="flex items-center">
                        <FaGear className="mr-2" />
                        Paramètres
                      </div>
                    </div>
                    
                    <div className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center justify-between border-b" onClick={toggleTheme}>
                      <div className="flex items-center">
                        {darkMode ? <FaSun className="mr-2" /> : <FaMoon className="mr-2" />}
                        {darkMode ? "Mode clair" : "Mode sombre"}
                      </div>
                    </div>
                    
                    <div className="px-4 py-2 text-sm text-red-600 hover:bg-gray-100 cursor-pointer" onClick={handleLogout}>
                      Déconnexion
                    </div>
                  </div>
                )}
                
                <button onClick={handleLogout} className="py-2 px-5 border rounded hover:bg-blue hover:text-white">Log out</button>
              </div>
            </>
          ) : (
            <>
              {" "}
              <Link to="/login" className="py-2 px-5 border rounded">
                Log in
              </Link>
              <Link
                to="/sign-up"
                className="bg-blue py-2 px-5 text-white rounded"
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        {/* mobile menu */}
        <div className="md:hidden block">
          <button onClick={handleMenuToggler}>
            {isMenuOpen ? (
              <>
                <FaXmark className="w-5 h-5 text-primary/75" />
              </>
            ) : (
              <>
                <FaBarsStaggered className="w-5 h-5 text-primary/75" />
              </>
            )}
          </button>
        </div>
      </nav>

      {/* mobile menu items */}
      <div
        className={`px-4 bg-black py-5 rounded-sm ${
          isMenuOpen ? "" : "hidden"
        }`}
      >
        <ul>
          {navItems.map(({ path, title }) => (
            <li
              key={path}
              className="text-base text-white first:text-white py-1"
            >
              <NavLink
                onClick={handleMenuToggler}
                to={path}
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                {title}
              </NavLink>
            </li>
          ))}

          <li className="text-white py-1">
            <Link to="login">Log in</Link>
          </li>
        </ul>
      </div>
    </header>
  );
};

export default Navbar;
