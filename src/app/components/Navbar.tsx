"use client";
import React, { useState, useEffect, useRef } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import Link from "next/link";

const Navbar: React.FC = () => {
  const [open, setOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const toggleMenu = () => setOpen((prev) => !prev);

  // Close menu when clicking outside or pressing Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <nav className="fixed top-0 left-0 z-50">
      {/* Menu Button */}
      <button
        className="absolute top-4 left-4 p-2 bg-gray-800 text-white rounded-lg shadow-lg hover:bg-gray-700 transition duration-300 ease-in-out"
        onClick={toggleMenu}
      >
        <MenuIcon sx={{ fontSize: "2rem" }} />
      </button>

      {/* Sidebar */}
      <div
        ref={menuRef}
        className={`fixed top-0 left-0 h-screen w-72 bg-gray-900 text-white shadow-2xl backdrop-blur-md bg-opacity-90 transform ${
          open ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out`}
      >
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 text-white text-2xl hover:text-gray-400 transition"
          onClick={() => setOpen(false)}
        >
          &times;
        </button>

        {/* Menu Items */}
        <ul className="pt-16 flex flex-col space-y-6 p-6 text-lg">
          <li>
            <Link href="/" className="hover:text-gray-400 transition">
              Home
            </Link>
          </li>
          <li>
            <Link
              href="/trendingcoins"
              className="hover:text-gray-400 transition whitespace-nowrap"
            >
              Discover Trending Coins
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
