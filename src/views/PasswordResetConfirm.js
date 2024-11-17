import React, { useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import useAxios from '../utils/useAxios';

const PasswordResetConfirm = () => {
    const { uid, token } = useParams();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useHistory();

    const handlePasswordResetConfirm = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            await useAxios.post(`http://127.0.0.1:8000/api/reset-password-confirm/${uid}/${token}/`, {
                new_password: newPassword,
                confirm_password: confirmPassword
            });
            setMessage("Password reset successful! Redirecting to login...");
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError("Failed to reset password. The link may be invalid or expired.");
        }
    };

    return (
        <div>
            <h2>Reset Password</h2>
            <form onSubmit={handlePasswordResetConfirm}>
                <input
                    type="password"
                    placeholder="New password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />
                <button type="submit">Reset Password</button>
            </form>
            {message && <p style={{ color: 'green' }}>{message}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default PasswordResetConfirm;
