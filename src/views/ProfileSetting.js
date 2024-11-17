import React, { useContext, useState, useEffect } from 'react';
import useAxios from '../utils/useAxios';
import { useHistory } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import Swal from 'sweetalert2';
import ChangePasswordForm from './ChangePasswordForm';

const ProfileSettings = () => {
  const axiosInstance = useAxios();
  const { authTokens } = useContext(AuthContext);
  const history = useHistory();

  const [profileData, setProfileData] = useState({
    full_name: "",
    bio: "",
    verified: false,
    image: null,
    imageUrl: null,
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch the profile data only once on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axiosInstance.get("/profile/");
        const data = response.data;

        setProfileData({
          full_name: data.full_name,
          bio: data.bio,
          verified: data.verified,
          image: null,
          imageUrl: data.image,
        });

        if (data.image) {
          setImagePreview(data.image);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching profile data:", error);
        setLoading(false);
      }
    };

    fetchProfile();
  }, []); // Empty array ensures it only runs once

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    setProfileData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : type === "file" ? files[0] : value,
    }));

    if (type === "file" && files.length > 0) {
      setImagePreview(URL.createObjectURL(files[0]));
    }
  };

  const updateProfile = async () => {
    try {
      const formData = new FormData();
      formData.append("full_name", profileData.full_name);
      formData.append("bio", profileData.bio);
      formData.append("verified", profileData.verified);

      
       // If a new image is uploaded, append it to the form data
       if (profileData.image) {
        formData.append("image", profileData.image);
      }

      const response = await axiosInstance.put("/profile/update", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setProfileData((prevData) => ({
        ...prevData,
        imageUrl: response.data.image,
      }));

      // If a new image was uploaded, update the image preview
      if (response.data.image) {
        setImagePreview(response.data.image); // Update preview with new image URL
      }

      Swal.fire({
        icon: 'success',
        title: 'Profile updated successfully!',
        showConfirmButton: false,
        timer: 2000,
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Failed to update profile',
        text: 'Please try again.',
        confirmButtonText: 'Okay',
      });
      console.error("Failed to update profile:", error);
    }
  };

  if (!authTokens) {
    history.push("/login");
    return null;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container my-5">
      <h1 className="text-center mb-4">Update Profile</h1>
      <div className="card p-4 shadow-sm mx-auto" style={{ maxWidth: "500px" }}>
        <h2 className="card-title mb-4">Edit Profile</h2>
        <form onSubmit={(e) => { e.preventDefault(); updateProfile(); }}>
          <div className="mb-3">
            <label htmlFor="full_name" className="form-label">Full Name</label>
            <input
              type="text"
              name="full_name"
              className="form-control"
              value={profileData.full_name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="bio" className="form-label">Bio</label>
            <textarea
              name="bio"
              className="form-control"
              value={profileData.bio}
              onChange={handleChange}
              placeholder="Tell something about yourself"
              rows="3"
              required
            />
          </div>
            
        

          <button type="submit" className="btn btn-primary w-100">Save Changes</button>
        </form>
        <ChangePasswordForm />
      </div>
    </div>
  );
};

export default ProfileSettings;
