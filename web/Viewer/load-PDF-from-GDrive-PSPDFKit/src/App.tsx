import React, { useState, useEffect, useRef } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import PSPDFKit from 'pspdfkit';
import { saveBlobToFile } from './fileSaver';

const App: React.FC = () => {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<PSPDFKit.Instance | null>(null);
  const fileIdRef = useRef<string | null>(null);
  const fileNameRef = useRef<string | null>(null);

  const login = useGoogleLogin({
    scope: 'https://www.googleapis.com/auth/drive.file',
    onSuccess: async (tokenResponse) => {
      console.log('Login Success:', tokenResponse);
      const { access_token } = tokenResponse;
      setAccessToken(access_token);

      try {
        const response = await axios.get('https://www.googleapis.com/drive/v3/files', {
          headers: { Authorization: `Bearer ${access_token}` },
          params: { pageSize: 10, fields: 'files(id, name, mimeType)' },
        });

        console.log('Files fetched successfully:', response.data);

        if (response.data.files.length > 0) {
          const file = response.data.files[1];
          console.log(`Loading file: ${file.name}, File ID: ${file.id}`);
          fileIdRef.current = file.id;
          fileNameRef.current = file.name;

          if (file.mimeType === 'application/pdf') {
            const fileResponse = await axios.get(`https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`, {
              headers: { Authorization: `Bearer ${access_token}` },
              responseType: 'blob',
            });

            const fileBlob = fileResponse.data;
            const fileURL = URL.createObjectURL(fileBlob);
            setFileUrl(fileURL);
            console.log(fileURL);
          } else {
            console.log('The file is not a PDF.');
          }
        } else {
          console.log('No files found in Google Drive.');
        }
      } catch (error) {
        console.error('Error fetching files:', error);
      }
    },
    onError: (error) => {
      console.error('Login Failed:', error);
    },
  });

  const saveDocument = async () => {
    const container = containerRef.current;

    if (container && fileUrl && accessToken && fileIdRef.current) {
      try {
        const instance = instanceRef.current;

        if (instance) {
          const arrayBuffer = await instance.exportPDF();
          const pdfBlob = new Blob([arrayBuffer], { type: 'application/pdf' });

          const metadata = { name: fileNameRef.current, mimeType: 'application/pdf' };
          const formData = new FormData();
          formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
          formData.append('file', pdfBlob);

          console.log(`Updating file: ${fileIdRef.current}`);
          console.log('Access Token:', accessToken);
          console.log("Blob Value", pdfBlob);
          console.log("Array Buffer Value: ", arrayBuffer);
          //--------------------  
          // Call the function to save the file locally - just to make sure that blob data is correct and creating the pdf correctly with the updated annotation.
          console.log(saveBlobToFile(pdfBlob, `C:\\Users\\narashiman\\Downloads\\outpout_GDrive.pdf`));
          //--------------------
          //The following code is used to upload the data back to the GDrive on the same fileID, for bigger files we may have to use the multipart instead of media. 
          const response = await axios.patch(
            `https://www.googleapis.com/upload/drive/v3/files/${fileIdRef.current}?uploadType=media`,
            formData,
            {
              headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'media/related' },
            }
          );
          console.log('File updated successfully:', response.data);
          //--------------------
        } else {
          console.error('PSPDFKit instance not found');
        }
      } catch (error) {
        console.error('Error uploading file:', error.response?.data || error.message);
        console.error('Full error response:', error.response);
      }
    }
  };

  useEffect(() => {
    const loadPSPDFKit = async () => {
      const container = containerRef.current;

      if (fileUrl && container) {
        try {
          if (PSPDFKit) PSPDFKit.unload(container);

          const instance = await PSPDFKit.load({
            licenseKey: import.meta.env.VITE_PSPDFKIT_LICENSE_KEY,
            container,
            document: fileUrl,
            baseUrl: `${window.location.protocol}//${window.location.host}/`,
          });

          instanceRef.current = instance;
          console.log('PSPDFKit loaded');
        } catch (error) {
          console.error('Error loading PSPDFKit', error);
        }
      }
    };

    loadPSPDFKit();

    return () => {
      if (containerRef.current && PSPDFKit) PSPDFKit.unload(containerRef.current);
    };
  }, [fileUrl]);

  return (
    <div className="App">
      <h1>Google Drive File List</h1>
      <button onClick={() => { setAccessToken(null); login(); }}>Login with Google</button>
      <div ref={containerRef} style={{ width: '100%', height: '80vh' }}></div>
      {fileUrl && <button onClick={saveDocument}>Save to Google Drive</button>}
    </div>
  );
};

export default App;
