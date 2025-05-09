import React, { useState, useRef, useEffect } from 'react';
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css'; // Import Cropper.js CSS

const AspectRatioCalculator: React.FC = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedAspectRatioKey, setSelectedAspectRatioKey] = useState<string>('Instagram Post (1:1)');
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cropperRef = useRef<Cropper | null>(null);

  const aspectRatios: { [key: string]: number } = {
    'Instagram Post (1:1)': 1 / 1,
    'Instagram Post (4:5)': 4 / 5,
    'Instagram Story (9:16)': 9 / 16,
    'TikTok (9:16)': 9 / 16,
    'TikTok (1:1)': 1 / 1,
    'YouTube Thumbnail (16:9)': 16 / 9,
    'Twitter Post (16:9)': 16 / 9,
    'Twitter Post (1:1)': 1 / 1,
    'Facebook Post (1.91:1)': 1.91 / 1,
    'Facebook Post (1:1)': 1 / 1,
    'Free Crop': NaN, // For free crop
  };

  useEffect(() => {
    if (uploadedImage && imgRef.current) {
      if (cropperRef.current) {
        cropperRef.current.destroy();
      }
      const cropper = new Cropper(imgRef.current, {
        aspectRatio: aspectRatios[selectedAspectRatioKey],
        viewMode: 1,
        dragMode: 'move',
        background: false,
        responsive: true,
        autoCropArea: 0.8,
        movable: true,
        zoomable: true,
        rotatable: true,
        scalable: true,
      });
      cropperRef.current = cropper;
    } else if (cropperRef.current) {
      cropperRef.current.destroy();
      cropperRef.current = null;
    }

    // Cleanup cropper instance on component unmount
    return () => {
      if (cropperRef.current) {
        cropperRef.current.destroy();
      }
    };
  }, [uploadedImage]); // Re-initialize cropper when image changes

  useEffect(() => {
    if (cropperRef.current) {
      cropperRef.current.setAspectRatio(aspectRatios[selectedAspectRatioKey]);
    }
  }, [selectedAspectRatioKey]); // Update aspect ratio when selection changes

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        setProcessedImage(null); // Reset processed image on new upload
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProcessImage = () => {
    if (!cropperRef.current || !imgRef.current?.src) return;

    // Get the cropped canvas data
    const croppedCanvas = cropperRef.current.getCroppedCanvas();
    if (!croppedCanvas) {
      alert('Could not get cropped image. Please try again.');
      return;
    }

    // Convert canvas to data URL (e.g., PNG or JPEG)
    // You can specify image quality for JPEG
    const imageFormat = uploadedImage?.startsWith('data:image/jpeg') ? 'image/jpeg' : 'image/png';
    const dataUrl = croppedCanvas.toDataURL(imageFormat);
    setProcessedImage(dataUrl);
  };

  const handleDownload = () => {
    if (!processedImage) return;
    const link = document.createElement('a');
    link.href = processedImage;
    const fileExtension = processedImage.split(';')[0].split('/')[1] || 'png';
    link.download = `instaratio_processed_${selectedAspectRatioKey.replace(/[^a-zA-Z0-9]/g, '_')}.${fileExtension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl bg-gray-900 text-white min-h-screen">
      <header className="text-center py-6">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
          InstaRatioTools
        </h1>
        <p className="text-lg text-gray-400 mt-2">Your Go-To Aspect Ratio Calculator</p>
      </header>

      <main>
        <section className="bg-gray-800 shadow-xl rounded-lg p-6 mb-8">
          <label htmlFor="imageUpload" className="block text-xl font-semibold text-gray-200 mb-3">
            1. Upload Your Image
          </label>
          <input
            type="file"
            id="imageUpload"
            accept="image/*"
            onChange={handleImageUpload}
            className="block w-full text-sm text-gray-300 file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-pink-500 file:text-white hover:file:bg-pink-600 cursor-pointer focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </section>

        {uploadedImage && (
          <section className="bg-gray-800 shadow-xl rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-200 mb-4">2. Crop & Select Ratio</h2>
            <div className="mb-6 h-96 flex justify-center items-center bg-gray-700 rounded-md overflow-hidden">
              {/* Image will be rendered here by Cropper.js */}
              <img ref={imgRef} src={uploadedImage} alt="Uploaded preview" style={{ display: 'block', maxWidth: '100%' }} />
            </div>
            
            <label htmlFor="aspectRatioSelect" className="block text-lg font-medium text-gray-200 mb-2">
              Select Aspect Ratio:
            </label>
            <select
              id="aspectRatioSelect"
              value={selectedAspectRatioKey}
              onChange={(e) => setSelectedAspectRatioKey(e.target.value)}
              className="block w-full p-3 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 text-gray-200 text-base mb-6"
            >
              {Object.keys(aspectRatios).map((ratioName) => (
                <option key={ratioName} value={ratioName}>
                  {ratioName} ({(aspectRatios[ratioName] ? aspectRatios[ratioName].toFixed(2) : 'Free')})
                </option>
              ))}
            </select>

            <button
              onClick={handleProcessImage}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
            >
              Process Image
            </button>
          </section>
        )}

        {processedImage && (
          <section className="bg-gray-800 shadow-xl rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-200 mb-4">3. Download Your Optimized Image</h2>
            <div className="flex justify-center mb-6 bg-gray-700 p-4 rounded-md">
              <img src={processedImage} alt="Processed preview" className="max-w-full max-h-96 rounded-md shadow-lg" />
            </div>
            <button
              onClick={handleDownload}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Download Image
            </button>
          </section>
        )}
      </main>

      <footer className="text-center py-8 mt-8 text-gray-500">
        <p>&copy; {new Date().getFullYear()} InstaRatioTools. All rights reserved.</p>
        <p>Built with ❤️ by Manus</p>
      </footer>
    </div>
  );
};

export default AspectRatioCalculator;

