import React, { useState } from 'react';
import { X, Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';

const BulkUploadModal = ({ onClose, onSuccess }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState(null); // 'success', 'error', null

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            // Validate file type
            const allowedTypes = [
                'text/csv',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            ];
            
            if (allowedTypes.includes(selectedFile.type)) {
                setFile(selectedFile);
                setUploadStatus(null);
            } else {
                alert('Please select a CSV or Excel file');
                e.target.value = '';
            }
        }
    };

    const handleUpload = async () => {
        if (!file) {
            alert('Please select a file first');
            return;
        }

        setUploading(true);
        
        try {
            // TODO: Implement actual upload logic
            // This would typically involve FormData and API call
            console.log('Uploading file:', file.name);
            
            // Simulate upload process
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            setUploadStatus('success');
            setTimeout(() => {
                onSuccess();
            }, 1500);
            
        } catch (error) {
            console.error('Upload failed:', error);
            setUploadStatus('error');
        } finally {
            setUploading(false);
        }
    };

    const handleDownloadTemplate = () => {
        // TODO: Implement template download
        console.log('Downloading template...');
        alert('Template download functionality will be implemented');
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <div className="bg-green-100 p-2 rounded-lg">
                            <Upload className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Bulk Upload Assets</h3>
                            <p className="text-sm text-gray-600">Upload multiple assets via CSV/Excel</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {uploadStatus === 'success' ? (
                        <div className="text-center py-8">
                            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">Upload Successful!</h4>
                            <p className="text-gray-600">Your assets have been uploaded successfully.</p>
                        </div>
                    ) : uploadStatus === 'error' ? (
                        <div className="text-center py-8">
                            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">Upload Failed</h4>
                            <p className="text-gray-600">There was an error uploading your file. Please try again.</p>
                        </div>
                    ) : (
                        <>
                            {/* Template Download */}
                            <div className="mb-6">
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <div className="flex items-start space-x-3">
                                        <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                                        <div className="flex-1">
                                            <h4 className="text-sm font-semibold text-blue-900 mb-1">
                                                Need a template?
                                            </h4>
                                            <p className="text-sm text-blue-700 mb-3">
                                                Download our CSV template to ensure proper formatting.
                                            </p>
                                            <button
                                                onClick={handleDownloadTemplate}
                                                className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors"
                                            >
                                                Download Template
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* File Upload */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select File
                                </label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                                    <input
                                        type="file"
                                        accept=".csv,.xlsx,.xls"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        id="file-upload"
                                    />
                                    <label
                                        htmlFor="file-upload"
                                        className="cursor-pointer flex flex-col items-center space-y-2"
                                    >
                                        <Upload className="h-8 w-8 text-gray-400" />
                                        <div>
                                            <span className="text-sm font-medium text-gray-700">
                                                {file ? file.name : 'Click to select file'}
                                            </span>
                                            <p className="text-xs text-gray-500 mt-1">
                                                CSV or Excel files only
                                            </p>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* Instructions */}
                            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                <h4 className="text-sm font-semibold text-gray-900 mb-2">Instructions:</h4>
                                <ul className="text-sm text-gray-600 space-y-1">
                                    <li>• Use the downloaded template for proper formatting</li>
                                    <li>• Ensure all required fields are filled</li>
                                    <li>• Check that asset types and statuses are valid</li>
                                    <li>• Maximum file size: 10MB</li>
                                </ul>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                {uploadStatus !== 'success' && (
                    <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        {uploadStatus !== 'error' && (
                            <button
                                onClick={handleUpload}
                                disabled={!file || uploading}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                            >
                                {uploading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        <span>Uploading...</span>
                                    </>
                                ) : (
                                    <>
                                        <Upload className="h-4 w-4" />
                                        <span>Upload Assets</span>
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BulkUploadModal;
