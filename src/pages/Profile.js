import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/Profile.css";

const Profile = () => {
  const [image, setImage] = useState(null);
  const [profileData, setProfileData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleFileChange = (e) => {
    setImage(e.target.files[0]);
    setError(null); // Clear any previous error when a new file is selected
    setSuccessMessage(null); // Clear previous success message
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) {
      setError("Please select an image to upload.");
      return;
    }

    try {
      const presignedUrlResponse = await axios.post(
        "https://wz14xjvd3k.execute-api.us-east-1.amazonaws.com/dev/get-presigned-url",
        {
          fileType: image.type,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const { uploadUrl, fileUrl } = presignedUrlResponse.data;

      await axios.put(uploadUrl, image, {
        headers: {
          "Content-Type": image.type,
        },
      });

      await axios.patch(
        "https://wz14xjvd3k.execute-api.us-east-1.amazonaws.com/dev/profile",
        { profileImageUrl: fileUrl },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setSuccessMessage("Profile picture updated successfully!");
      setError(null); // Clear previous error message
      setImage(null); // Clear the file input
      fetchProfile(); // Reload profile data
    } catch (error) {
      setError("Error uploading profile picture. Please try again.");
      setSuccessMessage(null); // Clear success message on error
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await axios.get(
        "https://wz14xjvd3k.execute-api.us-east-1.amazonaws.com/dev/profile",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setProfileData(response.data);
    } catch (error) {
      setError("Error fetching profile data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="profile-container">
      <h2>123</h2>
      <div className="profile-info">
        <img
          src={profileData.profileImageUrl || "default-avatar.png"}
          alt="Profile"
          className="profile-image"
        />
        <h3>{profileData.name}</h3>
      </div>
      <form onSubmit={handleSubmit}>
        {error && <div className="error">{error}</div>}
        {successMessage && <div className="success">{successMessage}</div>}
        <input type="file" accept="image/*" onChange={handleFileChange} />
        <button type="submit">Update Profile Picture</button>
      </form>
    </div>
  );
};

export default Profile;
