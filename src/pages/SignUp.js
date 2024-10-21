import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/SignUp.css";

const SignUp = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    profileImage: null,
  });

  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      profileImage: e.target.files[0],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Step 1: Request a pre-signed URL from the backend
      const presignedUrlResponse = await axios.post(
        "https://wz14xjvd3k.execute-api.us-east-1.amazonaws.com/dev/get-presigned-url",
        {
          fileType: formData.profileImage.type,
        }
      );

      const { uploadUrl, fileUrl } = presignedUrlResponse.data;

      // Step 2: Upload the profile image directly to S3
      await axios.put(uploadUrl, formData.profileImage, {
        headers: {
          "Content-Type": formData.profileImage.type,
        },
      });

      // Step 3: Submit the form data to the backend along with the file URL
      const signupData = {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        profileImageUrl: fileUrl,
      };

      await axios.post(
        "https://wz14xjvd3k.execute-api.us-east-1.amazonaws.com/dev/signup",
        signupData
      );

      setSuccessMessage("Sign-up successful!"); // Set the success message
      setFormData({ email: "", password: "", name: "", profileImage: null }); // Clear form data
      navigate("/login");
    } catch (error) {
      console.error(error);
      setError(
        error.response
          ? error.response.data.message
          : "An error occurred. Please try again."
      );
    }
  };

  return (
    <div className="signup-container">
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        {error && <p className="error">{error}</p>}
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          required
        />
        <button type="submit">Sign Up</button>
      </form>
      {successMessage && <p className="success-message">{successMessage}</p>}{" "}
      {/* Display success message */}
    </div>
  );
};

export default SignUp;
