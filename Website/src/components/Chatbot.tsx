// import React, { useState, useRef, useEffect } from 'react';
// import './css/Chatbot.css';
// import { v4 as uuidv4 } from 'uuid';
// import { Mic, StopCircle, Volume2, VolumeX } from 'lucide-react';

// interface Message {
//   role: 'user' | 'assistant';
//   content: string;
//   timestamp: string;
//   language?: string;
// }

// interface ChatResponse {
//   success: boolean;
//   response: string;
//   disclaimer?: string;
//   language?: string;
// }

// const API_CONFIG = {
//   BASE_URL: 'http://localhost:8000',
//   ENDPOINTS: {
//     CHAT: '/api/chatbot/chat/'
//   }
// };

// export const Chatbot: React.FC = () => {
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [inputMessage, setInputMessage] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [sessionId, setSessionId] = useState<string>('');
//   const [isListening, setIsListening] = useState(false);
//   const [isSpeaking, setIsSpeaking] = useState(false);
//   const [currentSpeakingMessage, setCurrentSpeakingMessage] = useState<number | null>(null);
  
//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const recognitionRef = useRef<any>(null);

//   // Initialize Web Speech API
//   useEffect(() => {
//     // @ts-ignore
//     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//     if (SpeechRecognition) {
//       recognitionRef.current = new SpeechRecognition();
//       recognitionRef.current.continuous = true;
//       recognitionRef.current.interimResults = true;

//       recognitionRef.current.onresult = (event: any) => {
//         const transcript = Array.from(event.results)
//           .map((result: any) => result[0])
//           .map(result => result.transcript)
//           .join('');
        
//         setInputMessage(transcript);
//       };

//       recognitionRef.current.onend = () => {
//         setIsListening(false);
//       };

//       recognitionRef.current.onerror = (event: any) => {
//         console.error('Speech recognition error:', event.error);
//         setIsListening(false);
//       };
//     }
//   }, []);

//   // Initialize session ID and load chat history
//   useEffect(() => {
//     const savedSessionId = localStorage.getItem('medical_session_id');
//     if (!savedSessionId) {
//       const newSessionId = uuidv4();
//       localStorage.setItem('medical_session_id', newSessionId);
//       setSessionId(newSessionId);
//     } else {
//       setSessionId(savedSessionId);
//     }

//     const savedChat = localStorage.getItem('medical_chat_history');
//     if (savedChat) {
//       setMessages(JSON.parse(savedChat));
//     }
//   }, []);

//   // Save chat history to localStorage
//   useEffect(() => {
//     if (messages.length > 0) {
//       localStorage.setItem('medical_chat_history', JSON.stringify(messages));
//     }
//   }, [messages]);

//   // Scroll to bottom when messages update
//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   const formatTimestamp = () => {
//     const now = new Date();
//     return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//   };

//   const toggleSpeechRecognition = () => {
//     if (isListening) {
//       recognitionRef.current?.stop();
//       setIsListening(false);
//     } else {
//       recognitionRef.current?.start();
//       setIsListening(true);
//       setInputMessage('');
//     }
//   };
//   const clearConversation = () => {
//         setMessages([]);
//         const newSessionId = uuidv4();
//         localStorage.setItem('medical_session_id', newSessionId);
//         setSessionId(newSessionId);
//         localStorage.removeItem('medical_chat_history');
//       };

//       const handleRetry = async () => {
//             if (messages.length === 0) return;
//             const lastUserMessage = messages[messages.length - 1];
//             if (lastUserMessage.role !== 'user') return;
        
//             setError(null);
//             setIsLoading(true);
        
//             try {
//               const response = await sendMessageToBackend(lastUserMessage.content);
              
//               if (response.success) {
//                 setMessages(prev => [
//                   ...prev,
//                   {
//                     role: 'assistant',
//                     content: response.response,
//                     timestamp: formatTimestamp()
//                   }
//                 ]);
//               } else {
//                 setError(response.response);
//               }
//             } catch (error) {
//               const errorMessage = error instanceof Error ? error.message : 'Failed to retry message';
//               setError(errorMessage);
//             } finally {
//               setIsLoading(false);
//             }
//           };

//   const speakMessage = async (message: string, index: number, language?: string) => {
//     if (isSpeaking && currentSpeakingMessage === index) {
//       window.speechSynthesis.cancel();
//       setIsSpeaking(false);
//       setCurrentSpeakingMessage(null);
//       return;
//     }

//     const utterance = new SpeechSynthesisUtterance(message);
//     if (language) {
//       utterance.lang = language;
//     }

//     utterance.onend = () => {
//       setIsSpeaking(false);
//       setCurrentSpeakingMessage(null);
//     };

//     setIsSpeaking(true);
//     setCurrentSpeakingMessage(index);
//     window.speechSynthesis.speak(utterance);
//   };

//   const sendMessageToBackend = async (query: string) => {
//     const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CHAT}`;
    
//     try {
//       const response = await fetch(url, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Accept': 'application/json',
//         },
//         credentials: 'include',
//         mode: 'cors',
//         body: JSON.stringify({ 
//           query,
//           session_id: sessionId
//         }),
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || `Server error: ${response.status}`);
//       }

//       return await response.json();
//     } catch (error) {
//       console.error('API Error:', error);
//       throw error;
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!inputMessage.trim() || isLoading) return;

//     const userMessage = inputMessage.trim();
//     setInputMessage('');
//     setIsLoading(true);
//     setError(null);

//     if (isListening) {
//       toggleSpeechRecognition();
//     }

//     const newUserMessage = {
//       role: 'user' as const,
//       content: userMessage,
//       timestamp: formatTimestamp()
//     };

//     setMessages(prev => [...prev, newUserMessage]);

//     try {
//       const response = await sendMessageToBackend(userMessage);
      
//       if (response.success) {
//         setMessages(prev => [
//           ...prev,
//           {
//             role: 'assistant',
//             content: response.response,
//             timestamp: formatTimestamp(),
//             language: response.language
//           }
//         ]);
//       } else {
//         setError(response.response);
//       }
//     } catch (error) {
//       const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
//       setError(errorMessage);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="chatbot-container">
//       <div className="chatbot-header">
//         <div className="header-icon">👨‍⚕️</div>
//         <div className="header-text">
//           <h1>SmartCare Medical Assistant</h1>
//           <span className="connection-status">
//             {error ? 'Connection Error' : 'Connected'}
//           </span>
//         </div>
//         <button 
//           onClick={clearConversation} 
//           className="clear-button"
//           title="Clear conversation and start new session"
//         >
//           🗑️
//         </button>
//       </div>

//       <div className="messages-container">
//         {messages.length === 0 ? (
//           <div className="welcome-message">
//             <h2>Hello! 👋</h2>
//             <p>I'm SmartCare, your medical assistant. I can help you with medical-related questions.</p>
//             <p className="disclaimer">
//               Note: I provide general medical information only. Always consult with a healthcare 
//               professional for specific medical advice.
//             </p>
//           </div>
//         ) : (
//           messages.map((message, index) => (
//             <div
//               key={`${message.timestamp}-${index}`}
//               className={`message-wrapper ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}
//             >
//               <div className="message">
//                 <div className="message-content">
//                   {message.content}
//                   {message.role === 'assistant' && (
//                     <button
//                       onClick={() => speakMessage(message.content, index, message.language)}
//                       className="speak-button"
//                       title={isSpeaking && currentSpeakingMessage === index ? "Stop speaking" : "Speak message"}
//                     >
//                       {isSpeaking && currentSpeakingMessage === index ? (
//                         <VolumeX className="w-4 h-4" />
//                       ) : (
//                         <Volume2 className="w-4 h-4" />
//                       )}
//                     </button>
//                   )}
//                 </div>
//                 <div className="message-timestamp">{message.timestamp}</div>
//               </div>
//             </div>
//           ))
//         )}

//         {isListening && (
//           <div className="listening-indicator">
//             <div className="listening-waves">
//               <span></span>
//               <span></span>
//               <span></span>
//               <span></span>
//               <span></span>
//             </div>
//             <p>Listening...</p>
//           </div>
//         )}

//         {isLoading && (
//           <div className="message-wrapper assistant-message">
//             <div className="message">
//               <div className="typing-indicator">
//                 <span></span>
//                 <span></span>
//                 <span></span>
//               </div>
//             </div>
//           </div>
//         )}

//         {error && (
//           <div className="error-message">
//             <p>{error}</p>
//             <button onClick={handleRetry} className="retry-button">
//               Try Again
//             </button>
//           </div>
//         )}

//         <div ref={messagesEndRef} />
//       </div>

//       <form onSubmit={handleSubmit} className="input-form">
//         <input
//           type="text"
//           value={inputMessage}
//           onChange={(e) => setInputMessage(e.target.value)}
//           placeholder="Type your medical question here..."
//           disabled={isLoading}
//           className="message-input"
//         />
//         <button
        
//           type="button"
//           onClick={toggleSpeechRecognition}
//           className={`mic-button ${isListening ? 'listening' : ''}`}
//           title={isListening ? "Stop listening" : "Start listening"}
//         >
//           {isListening ? (
//             <StopCircle className="w-5 h-5" />
//           ) : (
//             <Mic className="w-5 h-5" />
//           )}
//           <span >🎙️</span>
//         </button>
//         <button 
//           type="submit" 
//           disabled={!inputMessage.trim() || isLoading}
//           className="send-button"
//         >
//           {isLoading ? (
//             <span className="sending">Sending...</span>
//           ) : (
//             <span className="send-icon">➤</span>
//           )}
//         </button>
//       </form>
//     </div>
//   );
// };
// export default Chatbot;


import React, { useState, useRef, useEffect } from 'react';
import './css/Chatbot.css';
import { v4 as uuidv4 } from 'uuid';
import { Mic, StopCircle, Volume2, VolumeX } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  originalContent?: string;
  timestamp: string;
  language?: string;
}

interface ChatResponse {
  success: boolean;
  response: string;
  disclaimer?: string;
  language?: string;
}

const API_CONFIG = {
  BASE_URL: 'http://localhost:8000',
  ENDPOINTS: {
    CHAT: '/api/chatbot/chat/',
    TRANSLATE: '/api/translate/'  // Add your translation endpoint
  }
};

// Language detection threshold
const CONFIDENCE_THRESHOLD = 0.5;

export const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string>('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentSpeakingMessage, setCurrentSpeakingMessage] = useState<number | null>(null);
  const [detectedLanguage, setDetectedLanguage] = useState<string>('en');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Web Speech API with language detection
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      // Enable automatic language detection
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.maxAlternatives = 1;

      recognitionRef.current.onresult = async (event: any) => {
        const lastResult = event.results[event.results.length - 1];
        if (lastResult.isFinal) {
          const transcript = lastResult[0].transcript;
          const confidence = lastResult[0].confidence;
          
          if (confidence > CONFIDENCE_THRESHOLD) {
            setInputMessage(transcript);
            const detectedLang = await detectLanguage(transcript);
            setDetectedLanguage(detectedLang);
            
            // Auto-submit if confidence is high enough
            if (confidence > 0.8) {
              handleSubmit(new Event('submit') as any);
            }
          }
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setError('Speech recognition error. Please try again.');
      };
    }
  }, []);

  // Initialize session and load chat history
  useEffect(() => {
    const savedSessionId = localStorage.getItem('medical_session_id');
    if (!savedSessionId) {
      const newSessionId = uuidv4();
      localStorage.setItem('medical_session_id', newSessionId);
      setSessionId(newSessionId);
    } else {
      setSessionId(savedSessionId);
    }

    const savedChat = localStorage.getItem('medical_chat_history');
    if (savedChat) {
      setMessages(JSON.parse(savedChat));
    }
  }, []);

  // Save chat history
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('medical_chat_history', JSON.stringify(messages));
    }
  }, [messages]);

  // Auto-scroll
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Detect language using the translation API
  const detectLanguage = async (text: string): Promise<string> => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TRANSLATE}detect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });
      const data = await response.json();
      return data.language;
    } catch (error) {
      console.error('Language detection error:', error);
      return 'en'; // Default to English on error
    }
  };

  // Translate text using the translation API
  const translateText = async (text: string, targetLanguage: string): Promise<string> => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TRANSLATE}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text,
          target_language: targetLanguage 
        }),
      });
      const data = await response.json();
      return data.translated_text;
    } catch (error) {
      console.error('Translation error:', error);
      return text; // Return original text on error
    }
  };

  const formatTimestamp = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const toggleSpeechRecognition = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
      setInputMessage('');
    }
  };

  const speakMessage = async (message: string, index: number, language?: string) => {
    if (isSpeaking && currentSpeakingMessage === index) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setCurrentSpeakingMessage(null);
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(message);
    
    // Set language for speech synthesis
    if (language) {
      utterance.lang = language;
    } else {
      utterance.lang = detectedLanguage;
    }

    // Get available voices and try to find a matching voice for the language
    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find(voice => voice.lang.startsWith(utterance.lang));
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onend = () => {
      setIsSpeaking(false);
      setCurrentSpeakingMessage(null);
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsSpeaking(false);
      setCurrentSpeakingMessage(null);
    };

    setIsSpeaking(true);
    setCurrentSpeakingMessage(index);
    window.speechSynthesis.speak(utterance);
  };

  const sendMessageToBackend = async (query: string) => {
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CHAT}`;
    
    try {
      // First, translate the query to English if it's not in English
      let translatedQuery = query;
      if (detectedLanguage !== 'en') {
        translatedQuery = await translateText(query, 'en');
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        mode: 'cors',
        body: JSON.stringify({ 
          query: translatedQuery,
          session_id: sessionId,
          original_language: detectedLanguage
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      const data = await response.json();

      // Translate the response back to the original language if needed
      if (detectedLanguage !== 'en') {
        data.response = await translateText(data.response, detectedLanguage);
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    if (isListening) {
      toggleSpeechRecognition();
    }

    const newUserMessage = {
      role: 'user' as const,
      content: userMessage,
      originalContent: userMessage,
      timestamp: formatTimestamp(),
      language: detectedLanguage
    };

    setMessages(prev => [...prev, newUserMessage]);

    try {
      const response = await sendMessageToBackend(userMessage);
      
      if (response.success) {
        const newAssistantMessage = {
          role: 'assistant' as const,
          content: response.response,
          originalContent: response.original_response,
          timestamp: formatTimestamp(),
          language: detectedLanguage
        };

        setMessages(prev => [...prev, newAssistantMessage]);

        // Auto-speak the response if we were in listening mode
        if (isListening) {
          speakMessage(response.response, messages.length, detectedLanguage);
        }
      } else {
        setError(response.response);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Rest of your component's JSX remains the same, but update the message rendering:
  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <div className="header-icon">👨‍⚕️</div>
        <div className="header-text">
          <h1>SmartCare Medical Assistant</h1>
          <span className="connection-status">
            {error ? 'Connection Error' : `Connected (${detectedLanguage.toUpperCase()})`}
          </span>
        </div>
        <button 
          onClick={() => {
            setMessages([]);
            localStorage.removeItem('medical_chat_history');
          }} 
          className="clear-button"
          title="Clear conversation"
        >
          🗑️
        </button>
      </div>

      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="welcome-message">
            <h2>Hello! 👋</h2>
            <p>I'm SmartCare, your multilingual medical assistant. I can help you with medical-related questions in your preferred language.</p>
            <p className="disclaimer">
              Note: I provide general medical information only. Always consult with a healthcare 
              professional for specific medical advice.
            </p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`message-wrapper ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}
            >
              <div className="message">
                <div className="message-content">
                  {message.content}
                  {message.role === 'assistant' && (
                    <button
                      onClick={() => speakMessage(message.content, index, message.language)}
                      className="speak-button"
                      title={isSpeaking && currentSpeakingMessage === index ? "Stop speaking" : "Speak message"}
                    >
                      {isSpeaking && currentSpeakingMessage === index ? (
                        <VolumeX className="w-4 h-4" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
                <div className="message-info">
                  <span className="message-language">{message.language?.toUpperCase()}</span>
                  <span className="message-timestamp">{message.timestamp}</span>
                </div>
              </div>
            </div>
          ))
        )}

        {isListening && (
          <div className="listening-indicator">
            <div className="listening-waves">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <p>Listening ({detectedLanguage.toUpperCase()})...</p>
          </div>
        )}

        {isLoading && (
          <div className="message-wrapper assistant-message">
            <div className="message">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={() => setError(null)} className="retry-button">
              Try Again
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="input-form">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={`Type your medical question in any language...`}
          disabled={isLoading}
          className="message-input"
        />
        <button
          type="button"
          onClick={toggleSpeechRecognition}
          className={`mic-button ${isListening ? 'listening' : ''}`}
          title={isListening ? "Stop listening" : "Start voice input"}
        >
          {isListening ? (
            <StopCircle className="w-5 h-5" />
          ) : (
            <Mic className="w-5 h-5" />
          )}
        </button>
        <button 
          type="submit" 
          disabled={!inputMessage.trim() || isLoading}
          className="send-button"
        >
          {isLoading ? '...' : '➤'}
        </button>
      </form>
    </div>
  );
};

export default Chatbot;