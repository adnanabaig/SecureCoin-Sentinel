"use client";
import React, { useState, useEffect, useRef } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import Link from "next/link"; // Import Link from next/link

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null); // Ref to detect clicks outside the menu

  const toggleMenu = () => setOpen(!open); // Toggle the menu state

  // Close the menu when clicking outside of the menu
  const handleClickOutside = (event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setOpen(false);
    }
  };

  // Add event listener for clicking outside the menu
  useEffect(() => {
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    // Cleanup the event listener when the component unmounts or menu closes
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <nav className=" z-100 bg-gray-200 w-48 fixed top-0 left-0 ">
      <span
        className="absolute top-3 left-3 p-2 cursor-pointer"
        onClick={toggleMenu}
      >
        <MenuIcon sx={{ fontSize: "2rem", color: "white" }} />
      </span>
      {/* Menu div with ref */}
      <div
        ref={menuRef}
        className={`menu absolute top-0 left-0 h-screen  text-black transition-transform duration-300 ${
          open ? "transform translate-x-0" : "transform -translate-x-full"
        }`}
      >
        <button
          className="absolute top-2 right-2 text-black text-2xl cursor-pointer"
          onClick={() => setOpen(false)} // Close the menu when the "X" button is clicked
        >
          &times;
        </button>
        <ul className="pt-16 flex flex-col h-screen bg-gray-200 p-6 space-y-6 text-black">
          <li className="mr-6">
            <Link href="/">Home</Link>
          </li>
          <li className="mr-6">
            <Link href="/trendingcoins">Discover Trending Coins</Link>
          </li>
        </ul>
      </div>
      
    </nav>
  );
};

export default Navbar;
