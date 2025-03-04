import React from "react";

const TokenNotFound = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="bg-white p-12 rounded-lg shadow-lg max-w-md w-full text-center">
        <h1 className="text-4xl font-semibold text-gray-800">Token Not Found</h1>
        <p className="mt-4 text-lg text-gray-600">
          Oops! We couldn't find the token you're looking for. Please check the
          symbol and try again.
        </p>
        <div className="mt-8">
          <a
            href="/"
            className="inline-block bg-indigo-600 text-white text-lg py-2 px-6 rounded-lg shadow-md hover:bg-indigo-700 transition duration-300"
          >
            Go Back to Home
          </a>
        </div>
      </div>
    </div>
  );
};

export default TokenNotFound;
