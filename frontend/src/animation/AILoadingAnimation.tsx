import { useEffect, useState } from 'react';

const AILoadingAnimation = () => {
  const [progress, setProgress] = useState(0);
  const [currentPhrase, setCurrentPhrase] = useState(0);

  const phrases = [
    "🧠 Analyzing your habit...",
    "📊 Creating personalized plan...",
    "✨ Generating daily tasks...",
    "🎯 Optimizing duration...",
    "🚀 Almost ready..."
  ];

  useEffect(() => {
    // Симуляція прогресу
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return prev + Math.random() * 15;
      });
    }, 1600);

    // Зміна фраз
    const phraseInterval = setInterval(() => {
      setCurrentPhrase(prev => (prev + 1) % phrases.length);
    }, 5000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(phraseInterval);
    };
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(4, 4, 21, 0.95)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      gap: '32px'
    }}>
      {/* Animated Brain Icon */}
      <div style={{
        position: 'relative',
        width: '120px',
        height: '120px'
      }}>
        {/* Outer Glow */}
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56, 67, 255, 0.3) 0%, transparent 70%)',
          animation: 'pulse 2s ease-in-out infinite'
        }} />
        
        {/* Rotating Ring */}
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            animation: 'rotate 3s linear infinite'
          }}
          viewBox="0 0 120 120"
        >
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="3"
            strokeDasharray="60 250"
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3843FF" />
              <stop offset="50%" stopColor="#8A24FF" />
              <stop offset="100%" stopColor="#FF7D7D" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center Icon */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '48px',
          animation: 'float 3s ease-in-out infinite'
        }}>
          🤖
        </div>
      </div>

      {/* Current Phrase */}
      <div style={{
        fontSize: '20px',
        fontWeight: '500',
        color: '#ffffff',
        textAlign: 'center',
        minHeight: '60px',
        display: 'flex',
        alignItems: 'center',
        animation: 'fadeInOut 2.5s ease-in-out infinite'
      }}>
        {phrases[currentPhrase]}
      </div>

      {/* Progress Bar */}
      <div style={{
        width: '300px',
        height: '4px',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${progress}%`,
          height: '100%',
          background: 'linear-gradient(90deg, #3843FF 0%, #8A24FF 50%, #FF7D7D 100%)',
          borderRadius: '8px',
          transition: 'width 0.8s ease-out',
          boxShadow: '0 0 10px rgba(56, 67, 255, 0.5)'
        }} />
      </div>

      {/* Percentage */}
      <div style={{
        fontSize: '14px',
        fontWeight: '300',
        color: 'rgba(255, 255, 255, 0.6)'
      }}>
        {Math.round(progress)}%
      </div>

      <style>{`
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes pulse {
          0%, 100% { 
            transform: scale(1);
            opacity: 0.5;
          }
          50% { 
            transform: scale(1.1);
            opacity: 0.8;
          }
        }

        @keyframes float {
          0%, 100% { 
            transform: translate(-50%, -50%) translateY(0px);
          }
          50% { 
            transform: translate(-50%, -50%) translateY(-10px);
          }
        }

        @keyframes fadeInOut {
          0%, 100% { opacity: 0; transform: translateY(10px); }
          20%, 80% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default AILoadingAnimation;