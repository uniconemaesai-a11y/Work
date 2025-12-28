
import React, { useState, useCallback, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import SubmissionForm from './components/SubmissionForm';
import SuccessView from './components/SuccessView';
import LoadingView from './components/LoadingView';
import TeacherView from './components/TeacherView';
import TeacherLogin from './components/TeacherLogin';
import DashboardView from './components/DashboardView';
import VideoGallery from './components/VideoGallery';
import ResultChecker from './components/ResultChecker';
import Navigation from './components/Navigation';
import { AppStatus, AppView, StudentSubmission, RubricReview } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.STUDENT);
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [lastSubmissionName, setLastSubmissionName] = useState<string>('');
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [isTeacher, setIsTeacher] = useState(false);
  const [teacherName, setTeacherName] = useState('');
  const [rubricCriteria, setRubricCriteria] = useState<any[]>([]);
  
  const gasUrl = 'https://script.google.com/macros/s/AKfycbwt_PZNAxiM5j21McfSrUts-4y_vqoF1vb0fwRHQ3PEwG9jJPH1gM7eUw1PRaxhnDdB_Q/exec';

  const fetchAPI = async (action: string, data: any = {}) => {
    try {
      const response = await fetch(gasUrl, {
        method: 'POST',
        body: JSON.stringify({ action, data }),
      });
      return await response.json();
    } catch (e) {
      setErrorMessage("ไม่สามารถเชื่อมต่อระบบหลังบ้านได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต! 🔌");
      setStatus(AppStatus.ERROR);
      return null;
    }
  };

  const fetchSubmissions = useCallback(async () => {
    setStatus(AppStatus.LOADING_DATA);
    const res = await fetchAPI('list');
    if (res && res.success) {
      setSubmissions(res.data || []);
      setStatus(AppStatus.IDLE);
    } else {
      setStatus(AppStatus.IDLE);
    }
  }, []);

  const fetchRubric = useCallback(async () => {
    const res = await fetchAPI('get_rubric');
    if (res && res.success) setRubricCriteria(res.data || []);
  }, []);

  useEffect(() => { fetchRubric(); }, [fetchRubric]);

  useEffect(() => {
    if (currentView === AppView.TEACHER || currentView === AppView.DASHBOARD || currentView === AppView.GALLERY || currentView === AppView.RESULT) {
      if (!isTeacher && currentView === AppView.TEACHER) setCurrentView(AppView.TEACHER_LOGIN);
      else fetchSubmissions();
    }
  }, [currentView, isTeacher, fetchSubmissions]);

  const handleSubmit = useCallback(async (data: StudentSubmission) => {
    if (!data.videoFile) return;
    setStatus(AppStatus.UPLOADING);
    setLastSubmissionName(data.name);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Data = e.target?.result?.toString().split(',')[1];
      const res = await fetchAPI('upload', {
        name: data.name,
        studentNumber: data.studentNumber,
        grade: data.grade,
        room: data.room,
        fileData: base64Data,
        fileName: data.videoFile?.name,
        mimeType: data.videoFile?.type
      });

      if (res && res.success) setStatus(AppStatus.SUCCESS);
      else if (res) { setErrorMessage(res.message); setStatus(AppStatus.ERROR); }
    };
    reader.readAsDataURL(data.videoFile);
  }, []);

  const handleTeacherLogin = async (username: string, pin: string) => {
    setStatus(AppStatus.LOADING_DATA);
    const res = await fetchAPI('login', { username, pin });
    setStatus(AppStatus.IDLE);
    if (res && res.success) {
      setIsTeacher(true);
      setTeacherName(res.teacherName);
      setCurrentView(AppView.TEACHER);
    } else alert(res?.message || "ชื่อผู้ใช้หรือรหัส PIN ไม่ถูกต้อง!");
  };

  const handleUpdateGrade = async (rowId: number, rubricData: any) => {
    const res = await fetchAPI('grade', { rowId, ...rubricData });
    if (res && res.success) { fetchSubmissions(); return true; }
    return false;
  };

  const generateAIFeedback = async (studentName: string, rubric: RubricReview): Promise<string> => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `คุณเป็นคุณครูระดับประถม กำลังเขียนคำชมและแนะนำภาษาไทยให้นักเรียนชื่อ "${studentName}"
คะแนนรวม: ${rubric.totalScore}/20
- ความถูกต้อง: ${rubric.contentAccuracy}
- การมีส่วนร่วม: ${rubric.participation}
- การนำเสนอ: ${rubric.presentation}
- วินัย: ${rubric.discipline}
เขียน 2-4 ประโยคที่ใจดีและให้กำลังใจนักเรียนอย่างมาก`;

      const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
      return response.text || "ทำได้ดีมากจ้ะ!";
    } catch (e) { return "ทำได้ดีมากจ้ะ! ตั้งใจพัฒนาต่อไปนะ"; }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center pt-[80px] pb-10 px-4 relative">
      {/* Slim Vibrant Sticky Header (Height max 60px) */}
      <header className="fixed top-0 left-0 right-0 h-[60px] bg-white/70 backdrop-blur-lg z-50 flex items-center justify-between px-6 border-b border-white/40 header-glow shadow-sm">
        <div className="flex items-center gap-3">
          <img src="https://img2.pic.in.th/-23.png" alt="Logo" className="h-[40px] w-auto animate-pulse" />
          <h1 className="text-lg md:text-xl font-kids text-rainbow leading-none">
            ระบบส่งงาน กิจกรรมกีฬาสีภายใน 2568
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-2 bg-white/50 px-4 py-1.5 rounded-full border border-white/80 shadow-inner">
            <span className="text-lg">🏅</span>
            <p className="text-xs font-bold bg-gradient-to-r from-indigo-500 to-pink-500 bg-clip-text text-transparent uppercase tracking-wider">Sports Day 2025</p>
          </div>
          <span className="text-2xl hidden sm:block">🌈</span>
        </div>
      </header>

      <Navigation currentView={currentView} setView={setCurrentView} />

      <main className="w-full max-w-5xl bg-white/85 backdrop-blur-sm rounded-[3rem] shadow-xl p-6 md:p-10 border-4 border-white/60 relative min-h-[500px] mb-12">
        {status === AppStatus.LOADING_DATA && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-md z-50 flex flex-col items-center justify-center rounded-[2.8rem]">
            <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin"></div>
            <p className="mt-4 font-bold text-indigo-500">กำลังโหลดจ้า... 📦</p>
          </div>
        )}

        <div className="animate-in fade-in slide-in-from-bottom-2 duration-400">
          {currentView === AppView.STUDENT && (
            <>
              {status === AppStatus.IDLE && <SubmissionForm onSubmit={handleSubmit} />}
              {status === AppStatus.UPLOADING && <LoadingView studentName={lastSubmissionName} />}
              {status === AppStatus.SUCCESS && <SuccessView onReset={() => setStatus(AppStatus.IDLE)} />}
              {status === AppStatus.ERROR && (
                <div className="text-center py-10">
                  <div className="text-7xl mb-6">🙀</div>
                  <h2 className="text-3xl font-kids text-red-500 mb-4">อุ๊ย! ผิดพลาด</h2>
                  <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">{errorMessage}</p>
                  <button onClick={() => setStatus(AppStatus.IDLE)} className="bg-indigo-500 text-white font-bold py-4 px-10 rounded-full text-xl shadow-lg border-b-4 border-indigo-700">ลองใหม่นะ 🔄</button>
                </div>
              )}
            </>
          )}

          {currentView === AppView.RESULT && <ResultChecker submissions={submissions} />}
          {currentView === AppView.TEACHER_LOGIN && <TeacherLogin onLogin={handleTeacherLogin} />}
          {currentView === AppView.TEACHER && (
            <TeacherView submissions={submissions} onUpdate={fetchSubmissions} handleUpdateGrade={handleUpdateGrade} rubricCriteria={rubricCriteria} teacherName={teacherName} onGenerateAIFeedback={generateAIFeedback} />
          )}
          {currentView === AppView.GALLERY && <VideoGallery submissions={submissions} />}
          {currentView === AppView.DASHBOARD && <DashboardView submissions={submissions} />}
        </div>
      </main>
      
      <footer className="py-3 px-8 bg-white/30 backdrop-blur-sm rounded-full border border-white/40 text-indigo-400 text-sm font-bold text-center shadow-sm">
        Krukai@copy righe 2025
      </footer>
    </div>
  );
};

export default App;