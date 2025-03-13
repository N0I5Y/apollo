import React, { useState } from "react";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api"; // Fallback for local dev

function App() {
  // State variables
  const [resume, setResume] = useState(null);
  const [jobDescription, setJobDescription] = useState(null);
  const [extractedResumeText, setExtractedResumeText] = useState("");
  const [extractedJDText, setExtractedJDText] = useState("");
  const [enhancedResume, setEnhancedResume] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [popupContent, setPopupContent] = useState(null);
  const [jdUploadType, setJdUploadType] = useState("file");

  // Handle file upload and text extraction
  const handleFileUpload = async (event, setter, setExtractedText, endpoint, key) => {
    const file = event.target.files[0];
    setter(file);
    const formData = new FormData();
    formData.append(key, file); // Ensure the key matches the backend

    try {
      const response = await axios.post(`${API_BASE_URL}/${endpoint}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setExtractedText(response.data.extracted_text || "")
    } catch (err) {
      setError("Failed to extract text. Please try again.");
    }
  };

  // Handle form submission for resume enhancement
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate if both files are uploaded
    if (!extractedResumeText || (!extractedJDText && jdUploadType === "file")) {
      setError("Please upload both Resume and Job Description first.");
      setLoading(false);
      return;
    }

    // Prepare request body
    const requestBody = {
      resume_text: extractedResumeText,
      job_description: jdUploadType === "text" ? extractedJDText : extractedJDText,
      prompt: `${prompt}:

Resume:
{resume}

Job Description:
{job_description}`,
    };

    try {
      // Send request to enhance resume
      const response = await axios.post(`${API_BASE_URL}/enhance_resume/`, requestBody, {
        headers: { "Content-Type": "application/json" },
      });
      setEnhancedResume(response.data); // Store full response object
    } catch (err) {
      setError("Failed to enhance the resume. Please try again.");
    }

    setLoading(false);
  };

  // Handle popup display
  const openPopup = (content) => {
    setPopupContent(content);
  };

  const closePopup = () => {
    setPopupContent(null);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">TOM AND JERRY</h1>
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-md">
        {/* Resume Upload */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Upload Resume</label>
          <input
            type="file"
            onChange={(e) => handleFileUpload(e, setResume, setExtractedResumeText, "upload_resume", "resume")}
            className="border rounded w-full py-2 px-3"
            required
          />
        </div>
        {/* Job Description Upload Option */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Job Description Upload Type</label>
          <select
            value={jdUploadType}
            onChange={(e) => setJdUploadType(e.target.value)}
            className="border rounded w-full py-2 px-3"
          >
            <option value="file">Upload JD as a File</option>
            <option value="text">Enter JD as Text</option>
          </select>
        </div>

        {/* Job Description File Upload */}
        {jdUploadType === "file" && (
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Upload Job Description</label>
          <input
            type="file"
            onChange={(e) => handleFileUpload(e, setJobDescription, setExtractedJDText, "upload_jd", "job_description")}
            className="border rounded w-full py-2 px-3"
            required
          />
        </div>
        )}

        {/* Job Description Text Input */}
        {jdUploadType === "text" && (
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Enter Job Description</label>
            <textarea
              placeholder="Paste the job description here..."
              value={extractedJDText}
              onChange={(e) => setExtractedJDText(e.target.value)}
              className="border rounded w-full py-2 px-3 h-32"
              required
            />
          </div>
        )}

        {/* Prompt Input */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Enter the prompt</label>
          <input
            placeholder='Enter custom prompt'
            type="text"
            value={prompt}
            onChange={({ target }) => setPrompt(target.value)}
            className="border rounded w-full py-2 px-3"
          />
        </div>
        {/* Submit Button */}
        <button
          type="submit"
          className="bg-blue-500 text-white font-bold py-2 px-4 rounded w-full"
          disabled={loading}
        >
          {loading ? "Processing..." : "Enhance Resume"}
        </button>
      </form>
      {/* Error Message */}
      {error && <p className="text-red-500">{error}</p>}
      {/* Buttons to Show Enhanced Resume Options */}
      {enhancedResume && (
        <div className="flex gap-4 mt-6">
          {Object.keys(enhancedResume).map((key) => (
            <button
              key={key}
              className="bg-gray-600 text-white py-2 px-4 rounded"
              onClick={() => openPopup(enhancedResume[key])}
            >
              {key}
            </button>
          ))}
        </div>
      )}
      {/* Popup Modal */}
      {popupContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-lg w-3/4 h-3/4 overflow-auto">
            <button className="bg-red-500 text-white px-3 py-1 rounded absolute top-2 right-2" onClick={closePopup}>
              Close
            </button>
            <pre className="whitespace-pre-wrap text-gray-700">{popupContent}</pre>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
