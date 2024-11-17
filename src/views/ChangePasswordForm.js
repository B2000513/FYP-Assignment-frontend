import React, { useState } from 'react';
import useAxios from '../utils/useAxios';

const ChangePasswordForm = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);

    const axiosInstance = useAxios();

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axiosInstance.post('/profile/change-password/', {
                current_password: currentPassword,
                new_password: newPassword
            });
            setMessage({ type: 'success', text: response.data.detail });
        } catch (error) {
            const errorMsg = error.response?.data?.detail || "An error occurred. Please try again.";
            setMessage({ type: 'danger', text: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <h3 className="text-center">Change Password</h3>
            <form onSubmit={handleChangePassword} className="p-4 border rounded shadow-sm bg-light">
                <div className="form-group">
                    <label>Current Password:</label>
                    <input
                        type="password"
                        className="form-control"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group mt-3">
                    <label>New Password:</label>
                    <input
                        type="password"
                        className="form-control"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary mt-4 w-100" disabled={loading}>
                    {loading ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Changing Password...
                        </>
                    ) : (
                        "Change Password"
                    )}
                </button>
                {message && (
                    <div className={`alert alert-${message.type} mt-4`} role="alert">
                        {message.text}
                    </div>
                )}
            </form>
        </div>
    );
};

export default ChangePasswordForm;
