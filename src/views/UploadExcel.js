import React, { useState } from 'react';
import axios from 'axios';

const UploadExcel = () => {
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState('');

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) {
            setMessage('Please select a file.');
            return;
        }

        const formData = new FormData();
        formData.append('excel_file', file);

        try {
            const response = await axios.post('/api/upload-customers/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer YOUR_ACCESS_TOKEN`, // Add this if using JWT
                },
            });
            setMessage(response.data.message);
        } catch (error) {
            setMessage(error.response?.data?.error || 'Upload failed.');
        }
    };

    return (
        <div className="p-4 bg-gray-100 rounded shadow-md">
            <h2 className="text-xl font-bold mb-4">Upload Customer Data</h2>
            <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} className="mb-2" />
            <button onClick={handleUpload} className="px-4 py-2 bg-blue-500 text-white rounded">
                Upload
            </button>
            {message && <p className="mt-2 text-red-500">{message}</p>}
        </div>
    );
};

export default UploadExcel;
