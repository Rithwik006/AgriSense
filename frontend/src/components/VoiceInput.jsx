import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, AlertCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function VoiceInput({
  onTranscript,
  inline = false,
  placeholder = '',
  customLang = null,
  buttonText = null
}) {
  const { currentLangObj, speechLang, t } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const recognitionRef = useRef(null);

  const activeSpeechLang = customLang || speechLang || 'en-IN';

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = activeSpeechLang;

    recognition.onstart = () => {
      setIsListening(true);
      setError('');
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          setTranscript(event.results[i][0].transcript);
        }
      }

      if (finalTranscript) {
        setTranscript(finalTranscript);
        if (onTranscript) {
          onTranscript(finalTranscript.trim());
        }
      }
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      if (event.error === 'not-allowed') {
        setError('Microphone permission blocked. Please allow mic access.');
      } else if (event.error === 'no-speech') {
        setError('No speech detected. Please speak closer to the mic.');
      } else {
        setError(`Voice error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.abort();
      } catch (err) {}
    };
  }, [activeSpeechLang, onTranscript]);

  const toggleListening = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(t('voiceNotSupported', 'Voice recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.'));
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch (err) {}
      setIsListening(false);
    } else {
      setError('');
      try {
        if (recognitionRef.current) {
          recognitionRef.current.lang = activeSpeechLang;
          recognitionRef.current.start();
        }
      } catch (err) {
        try {
          recognitionRef.current?.stop();
          setTimeout(() => recognitionRef.current?.start(), 150);
        } catch (e2) {}
      }
    }
  };

  if (inline) {
    return (
      <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
        <button
          type="button"
          onClick={toggleListening}
          title={`${t('clickToSpeak')} ${currentLangObj.native} (${activeSpeechLang})`}
          style={{
            background: isListening ? '#ef4444' : 'transparent',
            color: isListening ? '#ffffff' : 'var(--primary)',
            border: 'none',
            borderRadius: '50%',
            width: '28px',
            height: '28px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            transition: 'all 0.2s',
            boxShadow: isListening ? '0 0 10px rgba(239, 68, 68, 0.6)' : 'none',
            animation: isListening ? 'voice-pulse 1.2s infinite' : 'none'
          }}
        >
          {isListening ? <MicOff size={15} /> : <Mic size={15} />}
        </button>

        {isListening && (
          <div style={{
            position: 'absolute',
            bottom: '100%',
            right: 0,
            marginBottom: '6px',
            backgroundColor: '#1e293b',
            color: '#f8fafc',
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '11px',
            whiteSpace: 'nowrap',
            zIndex: 50,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#ef4444',
              display: 'inline-block',
              animation: 'voice-pulse 1s infinite'
            }} />
            <span>{t('listening')}: <b>{currentLangObj.native}</b></span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '4px' }}>
      <button
        type="button"
        onClick={toggleListening}
        className={`btn ${isListening ? 'btn-danger' : 'btn-secondary'} btn-sm`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: isListening ? '#dc2626' : undefined,
          color: isListening ? '#ffffff' : undefined,
          borderColor: isListening ? '#dc2626' : undefined,
          boxShadow: isListening ? '0 0 12px rgba(220, 38, 38, 0.5)' : undefined
        }}
        title={`${t('clickToSpeak')} ${currentLangObj.native}`}
      >
        <Mic size={14} style={{ animation: isListening ? 'voice-pulse 1s infinite' : 'none' }} />
        <span>
          {isListening
            ? `${t('listening')} (${currentLangObj.native})...`
            : buttonText || `${t('voiceInput')} (${currentLangObj.native})`}
        </span>
      </button>

      {error && (
        <div style={{ fontSize: '11px', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <AlertCircle size={12} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
