
import React, { useState } from 'react';
import { StudentSubmission } from '../types';

interface SubmissionFormProps {
  onSubmit: (data: StudentSubmission) => void;
}

const SubmissionForm: React.FC<SubmissionFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<StudentSubmission>({
    name: '',
    studentNumber: '',
    grade: 'Prathom 5',
    room: 'Room 1',
    videoFile: null
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('video/')) {
        setErrors(prev => ({ ...prev, videoFile: 'Please choose a video file! 📽️' }));
      } else if (file.size > 100 * 1024 * 1024) { // 100MB
        setErrors(prev => ({ ...prev, videoFile: 'The video is too big! (Max 100MB) 🎈' }));
      } else {
        setFormData(prev => ({ ...prev, videoFile: file }));
        setErrors(prev => ({ ...prev, videoFile: '' }));
      }
    }
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) newErrors.name = 'What is your name? 😊';
    if (!formData.studentNumber.trim()) newErrors.studentNumber = 'What is your number? 🔢';
    if (!formData.videoFile) newErrors.videoFile = 'Where is your video? 🎥';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-xl font-bold text-gray-700 ml-2">Your Name 🧒</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Type your name here..."
            className={`w-full p-4 rounded-3xl border-4 ${errors.name ? 'border-red-300' : 'border-blue-100'} bg-blue-50 focus:border-blue-400 outline-none transition-colors text-lg`}
          />
          {errors.name && <p className="text-red-500 text-sm font-bold ml-2">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <label className="block text-xl font-bold text-gray-700 ml-2">Student Number 🔢</label>
          <input
            type="number"
            name="studentNumber"
            value={formData.studentNumber}
            onChange={handleInputChange}
            placeholder="No."
            className={`w-full p-4 rounded-3xl border-4 ${errors.studentNumber ? 'border-red-300' : 'border-blue-100'} bg-blue-50 focus:border-blue-400 outline-none transition-colors text-lg`}
          />
          {errors.studentNumber && <p className="text-red-500 text-sm font-bold ml-2">{errors.studentNumber}</p>}
        </div>

        <div className="space-y-2">
          <label className="block text-xl font-bold text-gray-700 ml-2">Grade 🎒</label>
          <select
            name="grade"
            value={formData.grade}
            onChange={handleInputChange}
            className="w-full p-4 rounded-3xl border-4 border-pink-100 bg-pink-50 focus:border-pink-400 outline-none transition-colors text-lg appearance-none cursor-pointer"
          >
            <option value="Prathom 5">Prathom 5</option>
            <option value="Prathom 6">Prathom 6</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-xl font-bold text-gray-700 ml-2">Classroom 🏠</label>
          <select
            name="room"
            value={formData.room}
            onChange={handleInputChange}
            className="w-full p-4 rounded-3xl border-4 border-green-100 bg-green-50 focus:border-green-400 outline-none transition-colors text-lg appearance-none cursor-pointer"
          >
            <option value="Room 1">Room 1</option>
            <option value="Room 2">Room 2</option>
            <option value="Room 3">Room 3</option>
            <option value="Room 4">Room 4</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-xl font-bold text-gray-700 ml-2">Upload Your Video 🎥</label>
        <div className="relative">
          <input
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            className="hidden"
            id="video-upload"
          />
          <label
            htmlFor="video-upload"
            className={`flex flex-col items-center justify-center w-full p-8 rounded-3xl border-4 border-dashed ${errors.videoFile ? 'border-red-300 bg-red-50' : 'border-purple-200 bg-purple-50'} hover:bg-purple-100 transition-colors cursor-pointer text-center`}
          >
            <div className="text-5xl mb-3">🎬</div>
            <p className="text-lg font-bold text-purple-600">
              {formData.videoFile ? formData.videoFile.name : 'Click to select your video file'}
            </p>
            <p className="text-sm text-purple-400 mt-1">Videos up to 100MB are welcome!</p>
          </label>
          {errors.videoFile && <p className="text-red-500 text-sm font-bold mt-2 ml-2">{errors.videoFile}</p>}
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-orange-400 hover:bg-orange-500 text-white font-kids text-3xl py-6 rounded-full shadow-lg transition-all transform hover:scale-[1.02] active:scale-95 mt-4 border-b-8 border-orange-600"
      >
        SEND IT! 🚀
      </button>
    </form>
  );
};

export default SubmissionForm;
