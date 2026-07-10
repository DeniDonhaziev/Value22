import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Camera } from 'lucide-react';
import { imageToDataUrl } from '../utils/imageToDataUrl';

interface ImageUploadProps {
  onImageUpload: (imageUrl: string) => void;
  currentImage?: string;
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageUpload, currentImage, className = '' }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Пожалуйста, выберите изображение');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Размер файла не должен превышать 5MB');
      return;
    }

    setIsUploading(true);
    setError('');
    setUploadProgress(0);

    try {
      const dataUrl = await imageToDataUrl(file);
      onImageUpload(dataUrl);
      setUploadProgress(100);
    } catch (error: any) {
      console.error('Ошибка обработки изображения:', error);
      setError(error.message || 'Ошибка загрузки изображения');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      await uploadFile(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const openCamera = () => {
    cameraInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 ${
          isUploading
            ? 'border-primary-500 bg-primary-50'
            : currentImage
            ? 'border-green-500 bg-green-50'
            : 'border-gray-300 bg-gray-50 hover:border-primary-400 hover:bg-primary-50'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {currentImage ? (
          <div className="space-y-4">
            <div className="relative inline-block">
              <img
                src={currentImage}
                alt="Загруженное изображение"
                className="w-32 h-32 object-cover rounded-lg shadow-lg"
              />
              <button
                onClick={() => onImageUpload('')}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-green-600 font-medium">Изображение загружено</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                <Upload className="w-8 h-8 text-primary-600" />
              </div>
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900 mb-2">
                Загрузите изображение товара
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Перетащите файл сюда или нажмите кнопку ниже
              </p>
            </div>

            {/* Upload Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={openFileDialog}
                disabled={isUploading}
                className="flex items-center justify-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                <ImageIcon className="w-4 h-4" />
                <span>Выбрать файл</span>
              </button>
              
              <button
                onClick={openCamera}
                disabled={isUploading}
                className="flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <Camera className="w-4 h-4" />
                <span>Сделать фото</span>
              </button>
            </div>

            {/* File Info */}
            <div className="text-xs text-gray-400">
              Поддерживаемые форматы: JPG, PNG, GIF (до 5MB)
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {isUploading && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Загружаем изображение...</p>
              {uploadProgress > 0 && (
                <div className="w-32 bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
