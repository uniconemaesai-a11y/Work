
import React from 'react';
import { StudentSubmission } from '../types';

interface VideoGalleryProps {
  submissions: StudentSubmission[];
}

const VideoGallery: React.FC<VideoGalleryProps> = ({ submissions }) => {
  return (
    <div className="space-y-12">
      <div className="text-center">
        <h2 className="text-4xl font-kids text-pink-500 mb-2">โรงภาพยนตร์กิจกรรมกีฬาสี 🎬</h2>
        <p className="text-gray-500 font-bold">รวมผลงานวิดีโอสุดเจ๋งจากเพื่อนๆ ในวันกีฬาสี 2568!</p>
      </div>

      {submissions.length === 0 ? (
        <div className="text-center py-20 bg-pink-50 rounded-[3rem] border-4 border-dashed border-pink-100">
          <p className="text-7xl mb-4">🏜️</p>
          <p className="text-2xl text-pink-300 font-bold italic">"ยังไม่มีวิดีโอเลย... มาเป็นคนแรกที่ส่งสิ!"</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {submissions.map((sub, idx) => {
            const isTopStar = sub.review && sub.review.totalScore >= 18;
            
            return (
              <div 
                key={sub.rowId || idx} 
                className={`group relative bg-white rounded-[2.5rem] overflow-hidden shadow-xl border-4 transition-all hover:-translate-y-2 hover:shadow-2xl ${isTopStar ? 'border-yellow-300 ring-4 ring-yellow-100' : 'border-pink-100 hover:border-pink-300'}`}
              >
                {/* Badge for High Scores */}
                {isTopStar && (
                  <div className="absolute top-4 left-4 z-10 bg-yellow-400 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1 animate-bounce">
                    <span>⭐</span> ผลงานยอดเยี่ยม
                  </div>
                )}

                {/* Card Header */}
                <div className={`${isTopStar ? 'bg-yellow-400' : 'bg-pink-500'} h-48 flex items-center justify-center relative overflow-hidden transition-colors`}>
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle,white_1px,transparent_1px)] bg-[length:10px_10px]"></div>
                  <span className="text-7xl group-hover:scale-125 transition-transform duration-500">
                    {isTopStar ? '🌟' : '🎥'}
                  </span>
                  
                  {/* Status Badge */}
                  {sub.review?.status === 'Graded' && !isTopStar && (
                    <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                      ตรวจแล้ว ✅
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-6 text-center">
                  <h3 className="text-xl font-bold text-gray-800 mb-2 truncate px-2">{sub.name}</h3>
                  <div className="flex justify-center gap-2 mb-6">
                    <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-xl text-xs font-bold">
                      {sub.grade === 'Prathom 5' ? 'ป.5' : 'ป.6'}
                    </span>
                    <span className="bg-green-100 text-green-600 px-3 py-1 rounded-xl text-xs font-bold">
                      {sub.room.replace('Room ', 'ห้อง ')}
                    </span>
                  </div>

                  <a 
                    href={sub.fileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`inline-block w-full text-white font-kids text-xl py-3 rounded-2xl shadow-lg transition-all border-b-4 active:border-b-0 active:translate-y-1 ${isTopStar ? 'bg-yellow-500 hover:bg-yellow-600 border-yellow-700' : 'bg-pink-500 hover:bg-pink-600 border-pink-700'}`}
                  >
                    เปิดดูวิดีโอ 📺
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-12 p-8 bg-blue-50 rounded-[3rem] border-4 border-blue-100 text-center">
        <p className="text-blue-400 font-bold">
          🌟 วิดีโอทุกตัวมีค่า! คุณครูจะทะยอยตรวจให้นะจ๊ะเด็กๆ
        </p>
      </div>
    </div>
  );
};

export default VideoGallery;