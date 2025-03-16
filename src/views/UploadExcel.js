import React, { useState } from 'react';
import useAxios from '../utils/useAxios';
import { Box, Button, Typography, Alert, Input } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const UploadExcel = () => {
    const { axiosInstance } = useAxios();  // ✅ Use axiosInstance instead of manually importing axios
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState(false);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) {
            setMessage('Please select a file.');
            setError(true);
            return;
        }

        const formData = new FormData();
        formData.append('excel_file', file);

        try {
            const response = await axiosInstance.post('/upload/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setMessage(response.data.message);
            console.log("Uploaded file:", file); 
            setError(false);
        } catch (error) {
            setMessage(error.response?.data?.error || 'Upload failed.');
            setError(true);
        }
    };

    return (
        <Box sx={{ p: 4, backgroundColor: '#f9f9f9', borderRadius: 2, boxShadow: 3 }}>
            <Typography variant="h5" fontWeight="bold" mb={2}>
                Upload Customer Data
            </Typography>

            <Input 
                type="file"
                inputProps={{ accept: '.xlsx, .xls , .csv' }}
                onChange={handleFileChange}
                sx={{ mb: 2 }}
                fullWidth
            />

            <Button 
                variant="contained"
                color="primary"
                onClick={handleUpload}
                startIcon={<CloudUploadIcon />}
                fullWidth
                sx={{ mt: 1 }}
            >
                Upload
            </Button>

            {message && (
                <Alert severity={error ? "error" : "success"} sx={{ mt: 2 }}>
                    {message}
                </Alert>
            )}
        </Box>
    );
};

export default UploadExcel;
