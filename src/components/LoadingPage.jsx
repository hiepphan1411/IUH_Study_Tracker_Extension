import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const LoadingPage = ({
  message = "Đang tải dữ liệu...",
  estimatedTime = 7,
  timeoutDuration = 15,
  onTimeout = 15,
  onLoading = 15,
}) => {
  const [remainingTime, setRemainingTime] = useState(estimatedTime);
  const [particles, setParticles] = useState([]);
  const [isTimeout, setIsTimeout] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const navigate = useNavigate();
  useEffect(() => {
    if (onLoading && typeof onLoading === "function") {
      onLoading();
    }
  }, []);
  useEffect(() => {
    const elapsedInterval = setInterval(() => {
      setElapsedTime((prev) => prev + 0.1);
    }, 100);

    if (timeoutDuration && elapsedTime >= timeoutDuration && !isTimeout) {
      setIsTimeout(true);
      if (onTimeout) {
        onTimeout();
      }
      clearInterval(elapsedInterval);
      return;
    }

    // Countdown timer
    const timeInterval = setInterval(() => {
      if (!isTimeout) {
        setRemainingTime((prev) => {
          const newTime = prev - 0.1;
          return newTime <= 0 ? 0 : newTime;
        });
      }
    }, 100);

    // Create floating particles
    const createParticle = () => {
      const particle = {
        id: Date.now() + Math.random(),
        x: Math.random() * 100,
        y: 100,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.8 + 0.2,
        speed: Math.random() * 2 + 1,
        color: Math.random() > 0.5 ? "#10b981" : "#34d399",
      };

      setParticles((prev) => [...prev.slice(-20), particle]);
    };

    const particleInterval = setInterval(createParticle, 150);

    // Animate particles
    const animateParticles = () => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            y: p.y - p.speed,
            opacity: p.opacity - 0.01,
          }))
          .filter((p) => p.y > -10 && p.opacity > 0)
      );
    };

    const animationInterval = setInterval(animateParticles, 50);

    return () => {
      clearInterval(elapsedInterval);
      clearInterval(timeInterval);
      clearInterval(particleInterval);
      clearInterval(animationInterval);
    };
  }, [
    remainingTime,
    estimatedTime,
    timeoutDuration,
    elapsedTime,
    isTimeout,
    onTimeout,
    onLoading,
  ]);

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.8; transform: scale(1.1); }
    }

    @keyframes wave {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(200%); }
    }

    @keyframes glow {
      0%, 100% { 
        box-shadow: 0 0 20px rgba(16, 185, 129, 0.4),
                   0 0 40px rgba(16, 185, 129, 0.2),
                   inset 0 0 20px rgba(16, 185, 129, 0.1);
      }
      50% { 
        box-shadow: 0 0 30px rgba(16, 185, 129, 0.6),
                   0 0 60px rgba(16, 185, 129, 0.3),
                   inset 0 0 30px rgba(16, 185, 129, 0.2);
      }
    }

    @keyframes float-bg {
      0% { transform: translateY(0px) rotate(0deg) scale(1); opacity: 0.05; }
      33% { transform: translateY(-15px) rotate(120deg) scale(1.1); opacity: 0.1; }
      66% { transform: translateY(10px) rotate(240deg) scale(0.9); opacity: 0.15; }
      100% { transform: translateY(0px) rotate(360deg) scale(1); opacity: 0.05; }
    }

    @keyframes progress-shine {
      0% { left: -100%; opacity: 0; }
      50% { opacity: 1; }
      100% { left: 100%; opacity: 0; }
    }

    @keyframes dot-bounce {
      0%, 80%, 100% { transform: scale(1) translateY(0); opacity: 0.7; }
      40% { transform: scale(1.4) translateY(-8px); opacity: 1; }
    }

    @keyframes ripple {
      0% { transform: scale(0.8); opacity: 0.8; }
      50% { transform: scale(1.2); opacity: 0.4; }
      100% { transform: scale(2); opacity: 0; }
    }

    @keyframes orbitalSpin {
      0% { transform: rotate(0deg) translateX(60px) rotate(0deg); }
      100% { transform: rotate(360deg) translateX(60px) rotate(-360deg); }
    }

    @keyframes sparkle {
      0%, 100% { opacity: 0; transform: scale(0); }
      50% { opacity: 1; transform: scale(1); }
    }

    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-5px); }
      75% { transform: translateX(5px); }
    }

    @keyframes fadeIn {
      0% { opacity: 0; transform: scale(0.8); }
      100% { opacity: 1; transform: scale(1); }
    }

    @keyframes errorPulse {
      0%, 100% { background-color: #ef4444; }
      50% { background-color: #dc2626; }
    }

    @keyframes circleProgress {
      0% {
        stroke-dasharray: 0 283;
      }
      100% {
        stroke-dasharray: 283 0;
      }
    }
    
    @keyframes circleSpin {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }
    
    .loading-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 50%, #a7f3d0 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Inter', sans-serif;
      overflow: hidden;
      z-index: 9999;
    }

    .background-elements {
      position: absolute;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }

    .bg-circle {
      position: absolute;
      border-radius: 50%;
      background: linear-gradient(45deg, rgba(16, 185, 129, 0.08), rgba(52, 211, 153, 0.05));
      border: 1px solid rgba(16, 185, 129, 0.1);
      animation: float-bg 20s infinite ease-in-out;
    }

    .bg-circle:nth-child(1) {
      width: 400px;
      height: 400px;
      top: -100px;
      left: -100px;
      animation-delay: 0s;
    }

    .bg-circle:nth-child(2) {
      width: 300px;
      height: 300px;
      top: 50%;
      right: -80px;
      animation-delay: -7s;
    }

    .bg-circle:nth-child(3) {
      width: 200px;
      height: 200px;
      top: 20%;
      left: 75%;
      animation-delay: -14s;
    }

    .bg-circle:nth-child(4) {
      width: 150px;
      height: 150px;
      bottom: 20%;
      left: 10%;
      animation-delay: -3s;
    }

    .bg-circle:nth-child(5) {
      width: 100px;
      height: 100px;
      top: 10%;
      left: 20%;
      animation-delay: -10s;
    }

    .floating-particles {
      position: absolute;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }

    .particle {
      position: absolute;
      border-radius: 50%;
      pointer-events: none;
    }

    .content-wrapper {
      position: relative;
      text-align: center;
      z-index: 10;
      background: rgba(255, 255, 255, 0.25);
      backdrop-filter: blur(20px);
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 32px;
      padding: 60px 50px;
      box-shadow: 
        0 25px 50px rgba(0, 0, 0, 0.1),
        0 0 0 1px rgba(255, 255, 255, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.4);
      min-width: 400px;
    }

    .spinner-section {
      position: relative;
      margin-bottom: 50px;
    }

    .spinner-container {
      position: relative;
      width: 140px;
      height: 140px;
      margin: 0 auto;
    }

    .spinner-ring {
      position: absolute;
      border-radius: 50%;
      border: 4px solid transparent;
    }

    .spinner-outer {
      width: 140px;
      height: 140px;
      border-top: 4px solid #059669;
      border-right: 4px solid rgba(5, 150, 105, 0.3);
      border-bottom: 4px solid rgba(5, 150, 105, 0.1);
      animation: spin 3s linear infinite;
      filter: drop-shadow(0 0 10px rgba(5, 150, 105, 0.3));
    }

    .spinner-middle {
      width: 100px;
      height: 100px;
      top: 20px;
      left: 20px;
      border-top: 4px solid #10b981;
      border-right: 4px solid rgba(16, 185, 129, 0.4);
      border-bottom: 4px solid rgba(16, 185, 129, 0.1);
      animation: spin 2s linear infinite reverse;
      filter: drop-shadow(0 0 8px rgba(16, 185, 129, 0.4));
    }

    .spinner-inner {
      width: 60px;
      height: 60px;
      top: 40px;
      left: 40px;
      border-top: 4px solid #34d399;
      border-right: 4px solid rgba(52, 211, 153, 0.5);
      border-bottom: 4px solid rgba(52, 211, 153, 0.2);
      animation: spin 1.5s linear infinite;
      filter: drop-shadow(0 0 6px rgba(52, 211, 153, 0.5));
    }

    .spinner-center {
      position: absolute;
      width: 20px;
      height: 20px;
      top: 60px;
      left: 60px;
      background: linear-gradient(45deg, #059669, #10b981, #34d399);
      border-radius: 50%;
      animation: pulse 2s infinite;
      box-shadow: 0 0 15px rgba(16, 185, 129, 0.6);
    }

    .orbital-dots {
      position: absolute;
      width: 140px;
      height: 140px;
    }

    .orbital-dot {
      position: absolute;
      width: 8px;
      height: 8px;
      background: linear-gradient(45deg, #10b981, #34d399);
      border-radius: 50%;
      box-shadow: 0 0 10px rgba(16, 185, 129, 0.6);
      animation: orbitalSpin 4s linear infinite;
    }

    .orbital-dot:nth-child(1) { animation-delay: 0s; }
    .orbital-dot:nth-child(2) { animation-delay: -1s; }
    .orbital-dot:nth-child(3) { animation-delay: -2s; }
    .orbital-dot:nth-child(4) { animation-delay: -3s; }

    .ripple-effects {
      position: absolute;
      width: 140px;
      height: 140px;
    }

    .ripple {
      position: absolute;
      width: 100%;
      height: 100%;
      border: 2px solid rgba(16, 185, 129, 0.4);
      border-radius: 50%;
      animation: ripple 3s infinite;
    }

    .ripple:nth-child(2) { animation-delay: 1s; }
    .ripple:nth-child(3) { animation-delay: 2s; }

    .sparkles {
      position: absolute;
      width: 200px;
      height: 200px;
      top: -30px;
      left: -30px;
    }

    .sparkle {
      position: absolute;
      width: 4px;
      height: 4px;
      background: #34d399;
      border-radius: 50%;
      animation: sparkle 2s infinite;
    }

    .sparkle:nth-child(1) { top: 20%; left: 10%; animation-delay: 0s; }
    .sparkle:nth-child(2) { top: 30%; right: 15%; animation-delay: 0.5s; }
    .sparkle:nth-child(3) { bottom: 25%; left: 20%; animation-delay: 1s; }
    .sparkle:nth-child(4) { bottom: 30%; right: 10%; animation-delay: 1.5s; }
    .sparkle:nth-child(5) { top: 15%; left: 50%; animation-delay: 0.3s; }
    .sparkle:nth-child(6) { bottom: 15%; left: 50%; animation-delay: 0.8s; }

    .progress-text {
      color: #047857;
      font-size: 1.75rem;
      font-weight: 700;
      letter-spacing: 0.5px;
      animation: textGlow 3s infinite;
      text-align: center;
      margin-bottom: 35px;
    }

    .circular-progress {
      width: 120px;
      height: 120px;
      margin: 0 auto 30px;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .circular-progress svg {
      position: absolute;
      width: 100%;
      height: 100%;
      transform: rotate(-90deg);
      animation: circleSpin 4s linear infinite;
      filter: drop-shadow(0 0 8px rgba(16, 185, 129, 0.4));
    }
    
    .progress-circle {
      fill: none;
      stroke-width: 8;
      stroke-linecap: round;
    }
    
    .progress-circle-bg {
      stroke: rgba(255, 255, 255, 0.3);
    }
    
    .progress-circle-value {
      stroke: #10b981;
      stroke-dasharray: 283;
      stroke-dashoffset: 0;
      animation: circleProgress 3s ease-in-out infinite alternate;
    }
    
    .circle-glow {
      position: absolute;
      width: 85%;
      height: 85%;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 70%);
      animation: pulse 2s infinite;
    }

    .status-dots {
      display: flex;
      justify-content: center;
      gap: 12px;
    }

    .status-dot {
      width: 10px;
      height: 10px;
      background: linear-gradient(45deg, #10b981, #34d399);
      border-radius: 50%;
      animation: dot-bounce 1.8s infinite;
      box-shadow: 0 0 8px rgba(16, 185, 129, 0.4);
    }

    .status-dot:nth-child(1) { animation-delay: -0.4s; }
    .status-dot:nth-child(2) { animation-delay: -0.3s; }
    .status-dot:nth-child(3) { animation-delay: -0.2s; }
    .status-dot:nth-child(4) { animation-delay: -0.1s; }
    .status-dot:nth-child(5) { animation-delay: 0s; }

    @media (max-width: 768px) {
      .content-wrapper {
        padding: 40px 30px;
        margin: 20px;
        min-width: 320px;
      }
      
      .loading-text {
        font-size: 1.5rem;
      }
      
      .progress-container {
        width: 280px;
      }
      
      .spinner-container {
        width: 120px;
        height: 120px;
      }
      
      .spinner-outer {
        width: 120px;
        height: 120px;
      }
      
      .spinner-middle {
        width: 85px;
        height: 85px;
        top: 17.5px;
        left: 17.5px;
      }
      
      .spinner-inner {
        width: 50px;
        height: 50px;
        top: 35px;
        left: 35px;
      }
      
      .spinner-center {
        top: 52px;
        left: 52px;
      }

      .circular-progress {
        width: 100px;
        height: 100px;
      }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="loading-container">
        <div className="background-elements">
          <div className="bg-circle"></div>
          <div className="bg-circle"></div>
          <div className="bg-circle"></div>
          <div className="bg-circle"></div>
          <div className="bg-circle"></div>
        </div>

        <div className="floating-particles">
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="particle"
              style={{
                left: `${particle.x}%`,
                bottom: `${particle.y}%`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                backgroundColor: particle.color,
                opacity: particle.opacity,
                boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
              }}
            />
          ))}
        </div>

        <div className="content-wrapper">
          {isTimeout ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
              {/* Backdrop with blur effect */}
              <div
                className="absolute inset-0 backdrop-blur-sm"
                // onClick={closeErrorModal}
              ></div>

              {/* Modal Container */}
              <div className="relative z-10 w-full max-w-md transform transition-all duration-300 ease-out animate-fade-in-down">
                {/* Main Modal */}
                <div
                  className="rounded-2xl shadow-2xl overflow-hidden border border-green-200/50"
                  style={{
                    background:
                      "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 50%, #a7f3d0 100%)",
                  }}
                >
                  <div className="px-6 pt-6 pb-4">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-red-500/10 backdrop-blur-sm flex items-center justify-center ring-2 ring-red-500/20">
                          <svg
                            className="w-6 h-6 text-red-600 animate-pulse"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                            />
                          </svg>
                        </div>
                        {/* Animated ring */}
                        <div className="absolute inset-0 rounded-full border-2 border-red-500/30 animate-ping"></div>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 tracking-tight">
                          Thông báo lỗi
                        </h3>
                        <p className="text-sm text-gray-600/80 mt-1">
                          Có sự cố xảy ra
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="px-6 pb-2">
                    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/50 shadow-sm">
                      <p className="text-gray-700 text-sm leading-relaxed">
                        Vui lòng kiểm tra key, internet và thử lại sau.
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="px-6 pb-6 pt-4">
                    <button
                      onClick={() => navigate("/")}
                      className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-red-500/30 active:scale-[0.98]"
                    >
                      <span className="flex items-center justify-center space-x-2">
                        <span>Đóng</span>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </span>
                    </button>
                  </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute -top-1 -right-1 w-20 h-20 bg-gradient-to-br from-green-300/20 to-emerald-400/20 rounded-full blur-xl"></div>
                <div className="absolute -bottom-1 -left-1 w-16 h-16 bg-gradient-to-tr from-green-400/20 to-teal-300/20 rounded-full blur-lg"></div>
              </div>
            </div>
          ) : (
            <>
              <div className="spinner-section">
                <div className="spinner-container">
                  <div className="ripple-effects">
                    <div className="ripple"></div>
                    <div className="ripple"></div>
                    <div className="ripple"></div>
                  </div>

                  <div className="sparkles">
                    <div className="sparkle"></div>
                    <div className="sparkle"></div>
                    <div className="sparkle"></div>
                    <div className="sparkle"></div>
                    <div className="sparkle"></div>
                    <div className="sparkle"></div>
                  </div>

                  <div className="orbital-dots">
                    <div className="orbital-dot"></div>
                    <div className="orbital-dot"></div>
                    <div className="orbital-dot"></div>
                    <div className="orbital-dot"></div>
                  </div>

                  <div className="spinner-ring spinner-outer"></div>
                  <div className="spinner-ring spinner-middle"></div>
                  <div className="spinner-ring spinner-inner"></div>
                  <div className="spinner-center"></div>
                </div>
              </div>

              <div className="progress-text">{message}</div>

              {/* <div className="circular-progress">
                <div className="circle-glow"></div>
                <svg viewBox="0 0 100 100">
                  <circle 
                    className="progress-circle progress-circle-bg" 
                    cx="50" 
                    cy="50" 
                    r="45"
                  />
                  <circle 
                    className="progress-circle progress-circle-value" 
                    cx="50" 
                    cy="50" 
                    r="45"
                  />
                </svg>
              </div> */}

              <div className="status-dots">
                <div className="status-dot"></div>
                <div className="status-dot"></div>
                <div className="status-dot"></div>
                <div className="status-dot"></div>
                <div className="status-dot"></div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default LoadingPage;
//test
