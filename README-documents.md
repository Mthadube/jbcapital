# Document Management System

## Overview

The document management system allows users to upload, view, download, and manage their documents within the JB Capital application. Documents are stored in a structured manner and can be categorized and filtered for easy access.

## Components

The document management system consists of the following components:

1. **DocumentUploader**: Handles file selection and upload, including drag and drop functionality
2. **DocumentViewer**: Displays document information and provides view/download functionality
3. **DocumentPreview**: Provides a preview modal for viewing documents
4. **DocumentList**: Lists all documents with search, filter, and sort capabilities
5. **DocumentsManager**: Orchestrates the document upload and listing components

## File Storage

Documents are stored in the `/public/documents/` directory. In a production environment, these would be stored in a more secure location such as a cloud storage service. The file paths are stored in the database for reference.

## Document Types

The system supports various document types:
- PDF Documents
- Images (JPG, JPEG, PNG)
- Word Documents (DOC, DOCX)
- Spreadsheets (XLS, XLSX)

## Verification Status

Documents have one of the following verification statuses:
- **Pending**: Document has been uploaded but not yet verified
- **Verified**: Document has been reviewed and verified
- **Rejected**: Document has been rejected during verification

## Integration

The document management system is integrated with the user profile in the "Documents" tab. Users can:
1. View all their uploaded documents
2. Search and filter documents
3. Upload new documents
4. View document details and verification status
5. View and download documents

## Future Enhancements

Potential future enhancements for the document management system:
- Document expiration notifications
- Automatic document verification using OCR
- Document sharing functionality
- Document versioning
- Secure document storage with encryption
- Document signing capabilities 