import { useState, useRef } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const FileUploader = () => {
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [resetCounter, setResetCounter] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(event.target.files);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!files) return;

    setUploading(true);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    try {
      const response = await axios.post("/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (!progressEvent.total) return;

          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      });

      if (response.status === 200) {
        toast.success("Files uploaded successfully!");
      } else {
        toast.error("Upload failed.");
      }
    } catch (error) {
      toast.error("Upload failed.");
    }

    setFiles(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setUploading(false);
    setResetCounter((prev) => prev + 1); // Trigger input reset
    setUploadProgress(0); // Reset progress bar
  };

  const handleReset = () => {
    setFiles(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setResetCounter((prev) => prev + 1); // Trigger input reset
    setUploadProgress(0);
  };

  return (
    <>
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col space-y-4 bg-white p-8 rounded shadow-lg"
        >
          <span className="text-lg font-medium text-gray-900">
            Upload your files
          </span>
          <input
            key={resetCounter}
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileChange}
            className="mt-1 block w-full px-3 py-2 text-sm text-gray-900 border
                     rounded-lg cursor-pointer focus:outline-none focus:border-blue-500"
          />
          {uploading && (
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}
          <div className="flex gap-4 mt-4">
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-blue-600 text-white text-base font-medium rounded-md
                     shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={uploading || !files}
            >
              {uploading ? "Uploading…" : "Upload"}
            </button>
            <button
              type="button"
              className="flex-1 px-6 py-3 bg-red-600 text-white text-base font-medium rounded-md
                     shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={uploading || !files}
              onClick={handleReset}
            >
              Reset
            </button>
          </div>
        </form>
      </div>
      <ToastContainer position="bottom-center" />
    </>
  );
};

export default FileUploader;
