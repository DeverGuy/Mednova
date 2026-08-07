'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { db } from '@/lib/db';
import { 
  Mic, 
  MicOff, 
  Send, 
  Volume2, 
  Bot, 
  User, 
  Info, 
  Sparkles,
  AlertTriangle,
  HeartHandshake
} from 'lucide-react';

export default function ChatbotPage() {
  const { language, t } = useLanguage();
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: language === 'kn' 
        ? 'ನಮಸ್ಕಾರ, ನಾನು ಮೆಡ್ನೋವಾ ಧ್ವನಿ ಸಹಾಯಕ. ನಿಮಗೆ ಏನು ಸಹಾಯ ಬೇಕು? ನಿಮ್ಮ ರೋಗಲಕ್ಷಣಗಳನ್ನು ತಿಳಿಸಲು ಕೆಳಗಿನ ಮೈಕ್ ಅನ್ನು ಒತ್ತಿ ಮಾತನಾಡಿ.'
        : 'Hello, I am the MEDNOVA voice assistant. How can I assist you today? Press the mic below to speak your symptoms.',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [chatLanguage, setChatLanguage] = useState(language); // 'en' | 'kn'
  
  // Waveform canvas ref
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  // Web Speech API references
  const recognitionRef = useRef(null);

  useEffect(() => {
    setChatLanguage(language);
  }, [language]);

  // Synchronize initial welcome message when language changes
  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        sender: 'bot',
        text: chatLanguage === 'kn' 
          ? 'ನಮಸ್ಕಾರ, ನಾನು ಮೆಡ್ನೋವಾ ಧ್ವನಿ ಸಹಾಯಕ. ನಿಮಗೆ ಏನು ಸಹಾಯ ಬೇಕು? ನಿಮ್ಮ ರೋಗಲಕ್ಷಣಗಳನ್ನು ತಿಳಿಸಲು ಕೆಳಗಿನ ಮೈಕ್ ಅನ್ನು ಒತ್ತಿ ಮಾತನಾಡಿ.'
          : 'Hello, I am the MEDNOVA voice assistant. How can I assist you today? Press the mic below to speak your symptoms.',
        timestamp: new Date()
      }
    ]);
  }, [chatLanguage]);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      
      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        handleSendMessage(transcript);
      };

      rec.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = rec;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  // Waveform Animation logic (draws a beautiful sine wave)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let phase = 0;

    const drawWave = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = isRecording ? '#ef4444' : '#0d9488'; // Red if recording, teal if idle
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      
      ctx.beginPath();
      const amplitude = isRecording ? 25 : 4; // Higher waves when recording
      const frequency = isRecording ? 0.08 : 0.02;

      for (let x = 0; x < canvas.width; x++) {
        const y = canvas.height / 2 + Math.sin(x * frequency + phase) * amplitude * Math.sin(x * 0.015);
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // Additional sub wave for premium feel
      ctx.beginPath();
      ctx.strokeStyle = isRecording ? 'rgba(239, 68, 68, 0.4)' : 'rgba(13, 148, 136, 0.3)';
      ctx.lineWidth = 1.5;
      for (let x = 0; x < canvas.width; x++) {
        const y = canvas.height / 2 + Math.cos(x * (frequency * 0.8) - phase) * (amplitude * 0.7) * Math.sin(x * 0.015);
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      phase += isRecording ? 0.25 : 0.05;
      animationRef.current = requestAnimationFrame(drawWave);
    };

    drawWave();

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [isRecording]);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not fully supported in this browser. Please type your query in the text box below.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setInputText('');
      recognitionRef.current.lang = chatLanguage === 'kn' ? 'kn-IN' : 'en-US';
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    }
  };

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    handleSendMessage(inputText);
    setInputText('');
  };

  // Conversational response logic matching medical query
  const handleSendMessage = (textToSend) => {
    const userMsg = {
      id: Math.random().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);

    // Simulate AI clinical bot response
    setTimeout(() => {
      const botText = getClinicalAdvice(textToSend, chatLanguage);
      const botMsg = {
        id: Math.random().toString(),
        sender: 'bot',
        text: botText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
      
      // Perform text-to-speech
      speakResponse(botText, chatLanguage);
    }, 1000);
  };

  const speakResponse = (text, lang) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      // Stop current talking
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'kn' ? 'kn-IN' : 'en-US';
      
      // Locate Kannada voice if available
      if (lang === 'kn') {
        const voices = window.speechSynthesis.getVoices();
        const knVoice = voices.find(v => v.lang.includes('kn') || v.lang.includes('IN'));
        if (knVoice) utterance.voice = knVoice;
      }
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const getClinicalAdvice = (query, lang) => {
    const q = query.toLowerCase();
    
    // Kannada Response logic
    if (lang === 'kn') {
      if (q.includes('ಜ್ವರ') || q.includes('fever') || q.includes('ಟೆಂಪರೇಚರ್')) {
        if (q.includes('ಉಸಿರಾಟ') || q.includes('breath') || q.includes('ದಮ್ಮು')) {
          return 'ಎಚ್ಚರಿಕೆ! ಜ್ವರ ಮತ್ತು ಉಸಿರಾಟದ ತೊಂದರೆ ಇರುವುದು ನ್ಯುಮೋನಿಯಾ ಅಥವಾ ತೀವ್ರ ಶ್ವಾಸಕೋಶದ ಸೋಂಕಿನ ಲಕ್ಷಣವಾಗಿರಬಹುದು. ರೋಗಿಯನ್ನು ತಕ್ಷಣ ಹತ್ತಿರದ ಪ್ರಾಥಮಿಕ ಆರೋಗ್ಯ ಕೇಂದ್ರಕ್ಕೆ (PHC) ಕರೆದೊಯ್ಯಿರಿ. ರೋಗಿಯ SpO2 ಮಟ್ಟವನ್ನು ಪರಿಶೀಲಿಸಿ.';
        }
        return 'ಸಾಮಾನ್ಯ ಜ್ವರದ ಆರೈಕೆ ಮಾಹಿತಿ: ೧. ರೋಗಿಗೆ ಸಾಕಷ್ಟು ನೀರು ಮತ್ತು ಗಂಜಿ ನೀಡಿ. ೨. ಹಸಿರು ಎಲೆಕೋಸು ಅಥವಾ ಬಟ್ಟೆಯನ್ನು ತಣ್ಣೀರಿನಲ್ಲಿ ಅದ್ದಿ ಹಣೆ ಮತ್ತು ಮೈ ಒರೆಸಿ (Cold Sponging). ೩. ವೈದ್ಯರ ಸಲಹೆಯಂತೆ ಪ್ಯಾರಸಿಟಮಾಲ್ ಮಾತ್ರೆ ನೀಡಿ. ಜ್ವರ ೩ ದಿನಗಳಿಗಿಂತ ಹೆಚ್ಚು ಇದ್ದರೆ PHC ಗೆ ಭೇಟಿ ನೀಡಿ.';
      }
      if (q.includes('ವಾಂತಿ') || q.includes('ಬೇಧಿ') || q.includes('vomit') || q.includes('diarrhea')) {
        return 'ಭೇದಿ ಮತ್ತು ವಾಂತಿ ನಿಯಂತ್ರಣಕ್ಕೆ ಪರಿಹಾರ: ೧. ತಕ್ಷಣ ORS (ಓಆರ್ಎಸ್) ದ್ರಾವಣವನ್ನು ತಯಾರಿಸಿ ಕುಡಿಸಿ. ೨. ಒಂದು ಲೀಟರ್ ಕುದಿಸಿ ಆರಿಸಿದ ನೀರಿಗೆ ಒಂದು ಪ್ಯಾಕೆಟ್ ORS ಪುಡಿಯನ್ನು ಬೆರೆಸಿ. ೩. ಎಳನೀರು ಅಥವಾ ತಿಳಿ ಮಜ್ಜಿಗೆಯನ್ನು ನೀಡಿ. ಮೂತ್ರ ವಿಸರ್ಜನೆ ಕಡಿಮೆಯಾದರೆ ತಕ್ಷಣ PHC ಗೆ ಕರೆದೊಯ್ಯಿರಿ.';
      }
      if (q.includes('ಎದೆ ನೋವು') || q.includes('chest pain')) {
        return 'ಅಪಾಯದ ಮುನ್ನೆಚ್ಚರಿಕೆ! ಎದೆ ನೋವು ಹೃದಯಕ್ಕೆ ಸಂಬಂಧಿಸಿದ ತುರ್ತು ಪರಿಸ್ಥಿತಿಯಾಗಿರಬಹುದು. ರೋಗಿಯನ್ನು ಚಲಿಸದಂತೆ ನೆಟ್ಟಗೆ ಕುಳ್ಳಿರಿಸಿ, ತಕ್ಷಣ ಆಂಬ್ಯುಲೆನ್ಸ್ ಕರೆ ಮಾಡಿ ಸಮೀಪದ ಜಿಲ್ಲಾ ಆಸ್ಪತ್ರೆಗೆ ರೆಫರ್ ಮಾಡಿ.';
      }
      return 'ನಾನು ನಿಮ್ಮ ವಿವರಗಳನ್ನು ಸ್ವೀಕರಿಸಿದ್ದೇನೆ. ಸಾಮಾನ್ಯ ಆರೋಗ್ಯ ಸಲಹೆಗಾಗಿ ಸಾಕಷ್ಟು ವಿಶ್ರಾಂತಿ ಮತ್ತು ಬಿಸಿ ನೀರು ಕುಡಿಯಿರಿ. ಲಕ್ಷಣಗಳು ತೀವ್ರವಾಗಿದ್ದರೆ ದಯವಿಟ್ಟು ಕನಕಪುರ PHC ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ.';
    }

    // English Response logic
    if (q.includes('fever') || q.includes('temperature')) {
      if (q.includes('breath') || q.includes('cough') || q.includes('lung')) {
        return 'WARNING! High fever combined with rapid breathing suggests severe acute respiratory infection (SARI) or pneumonia. Check SpO2 immediately. If SpO2 is below 90%, initiate an EMERGENCY referral to the District Hospital immediately.';
      }
      return 'Fever Care Guidelines: 1. Keep the patient hydrated with ORS, coconut water, or clean fluids. 2. Apply cold sponges to the forehead and body to reduce temperature. 3. Administer Paracetamol as prescribed by the PHC doctor. If fever persists over 3 days, visit the PHC for a malaria/dengue blood test.';
    }
    if (q.includes('diarrhea') || q.includes('vomit') || q.includes('loose motion')) {
      return 'Dehydration Safeguards: 1. Start ORS therapy immediately (1 sachet dissolved in 1 liter of clean water). 2. Give frequent small sips to avoid triggering vomiting. 3. Continue breastfeeding if treating an infant. Watch for red flags like sunken eyes or lethargy.';
    }
    if (q.includes('chest pain') || q.includes('heart attack')) {
      return 'CRITICAL EMERGENCY! Severe chest pain requires immediate medical attention. Do not allow the patient to walk. Refer them to the nearest District Hospital with active Cardiologist cover (e.g. Shimoga District Hospital).';
    }
    return 'Thank you for reporting. Keep the patient comfortable and monitor vital signs. If you note rapid breathing, chest indrawing, or a sudden drop in oxygen levels, start the Guided Triage wizard to register a referral ticket.';
  };

  return (
    <div className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8 flex flex-col h-[calc(100vh-4rem)]">
      
      {/* Visual Header card */}
      <div className="bg-white border border-slate-200 p-4 rounded-t-2xl shadow-sm flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 bg-teal-50 rounded-xl border border-teal-100 text-teal-600 flex items-center justify-center">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-800">{t('chat_title')}</h1>
            <p className="text-[10px] text-slate-500 font-bold">{t('chat_sub')}</p>
          </div>
        </div>

        {/* Local language selection in chatbot */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setChatLanguage('en')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
              chatLanguage === 'en' ? 'bg-teal-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600'
            }`}
          >
            English
          </button>
          <button
            onClick={() => setChatLanguage('kn')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
              chatLanguage === 'kn' ? 'bg-teal-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600'
            }`}
          >
            ಕನ್ನಡ
          </button>
        </div>
      </div>

      {/* Messages body stream (scrollable container) */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-white border-x border-slate-200 space-y-4 min-h-0">
        {messages.map((msg) => {
          const isBot = msg.sender === 'bot';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 max-w-[85%] ${isBot ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
            >
              {/* Profile Avatar */}
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border ${
                isBot ? 'bg-teal-50 border-teal-100 text-teal-600' : 'bg-slate-100 border-slate-200 text-slate-600'
              }`}>
                {isBot ? <Bot className="h-4.5 w-4.5" /> : <User className="h-4.5 w-4.5" />}
              </div>

              {/* Message block bubble */}
              <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                isBot 
                  ? 'bg-slate-50 border border-slate-150 text-slate-800 rounded-tl-none font-medium' 
                  : 'bg-teal-600 text-white rounded-tr-none font-semibold shadow-sm'
              }`}>
                <p>{msg.text}</p>
                <span className={`block text-[9px] mt-1.5 text-right ${isBot ? 'text-slate-400' : 'text-teal-200'}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Waveform Visualization area */}
      <div className="bg-slate-50 border-x border-slate-200 px-6 py-2 flex flex-col items-center shrink-0">
        <canvas
          ref={canvasRef}
          width="320"
          height="50"
          className="w-full max-w-[400px] h-[40px] opacity-80"
          aria-label={t('chat_wave_label')}
        />
        {isRecording && (
          <span className="text-[10px] font-bold text-red-600 animate-pulse uppercase tracking-wider">
            {t('chat_listening')}
          </span>
        )}
      </div>

      {/* Input panel block at bottom */}
      <div className="bg-slate-50 border border-slate-200 p-4 rounded-b-2xl shrink-0">
        <div className="flex items-center gap-3">
          
          {/* Main Record Microphone Button */}
          <button
            onClick={toggleRecording}
            className={`h-12 w-12 rounded-full flex items-center justify-center border transition-all shadow-md transform active:scale-90 cursor-pointer ${
              isRecording 
                ? 'bg-red-500 border-red-600 text-white animate-pulse' 
                : 'bg-teal-600 border-teal-700 text-white hover:bg-teal-700'
            }`}
            title={isRecording ? t('chat_rec_stop') : t('chat_rec_start')}
          >
            {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </button>

          {/* Text input form fallback */}
          <form onSubmit={handleTextSubmit} className="flex-1 flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={t('chat_placeholder')}
              className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-teal-500"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="bg-slate-800 hover:bg-slate-900 text-white px-4 rounded-xl flex items-center justify-center transition-colors disabled:opacity-40 cursor-pointer min-h-[44px]"
            >
              <Send className="h-4.5 w-4.5" />
            </button>
          </form>

        </div>

        {/* Guidelines alert tip */}
        <div className="mt-3 flex items-start gap-1.5 bg-teal-50/50 border border-teal-100 p-2 rounded-lg text-[10px] font-semibold text-teal-800 leading-normal">
          <HeartHandshake className="h-4 w-4 shrink-0 text-teal-600" />
          <span>
            <strong>Remedial tip</strong>: For infants with high fever, avoid using cold tap water direct sponges, use lukewarm water instead. For chest pain red flag, keep patient calm and avoid stairs.
          </span>
        </div>
      </div>

    </div>
  );
}
