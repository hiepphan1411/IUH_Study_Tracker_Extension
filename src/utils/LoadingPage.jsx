export function showLoadingPage(message = "Đang tải dữ liệu...") {
  const htmlContent = `
  <!DOCTYPE html>
  <html lang="vi">
  <head>
  <meta charset="utf-8" />
  <title>IUH Grade Guard - Loading</title>
  <style>
    :root {
      --primary-green: #10b981;
      --emerald-light: #34d399;
      --emerald-lighter: #6ee7b7;
      --emerald-lightest: #a7f3d0;
      --dark-green: #065f46;
      --bg-light: #f0fdf4;
      --bg-gradient: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 50%, #a7f3d0 100%);
      --text-dark: #064e3b;
      --text-medium: #047857;
      --shadow-green: rgba(16, 185, 129, 0.3);
      --shadow-light: rgba(52, 211, 153, 0.2);
    }
    
    * { 
      box-sizing: border-box; 
      margin: 0; 
      padding: 0; 
    }
    
    html, body { 
      height: 100%; 
      overflow: hidden;
    }
    
    body {
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-gradient);
      color: var(--text-dark);
      font-family: 'Inter', 'SF Pro Display', system-ui, sans-serif;
      position: relative;
    }
    
    /* Animated background elements */
    body::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image: 
        radial-gradient(circle at 20% 80%, rgba(16, 185, 129, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(52, 211, 153, 0.08) 0%, transparent 50%),
        radial-gradient(circle at 40% 40%, rgba(110, 231, 183, 0.06) 0%, transparent 50%);
      animation: backgroundFloat 10s ease-in-out infinite alternate;
    }
    
    @keyframes backgroundFloat {
      0% { transform: translateX(0px) translateY(0px) rotate(0deg); }
      100% { transform: translateX(-10px) translateY(-10px) rotate(1deg); }
    }
    
    /* Floating geometric shapes */
    .floating-shape {
      position: absolute;
      opacity: 0.1;
      animation: floatAround 20s linear infinite;
    }
    
    .shape-1 {
      top: 10%;
      left: 10%;
      width: 60px;
      height: 60px;
      background: linear-gradient(45deg, var(--primary-green), var(--emerald-light));
      border-radius: 50%;
      animation-delay: 0s;
    }
    
    .shape-2 {
      top: 20%;
      right: 15%;
      width: 40px;
      height: 40px;
      background: linear-gradient(45deg, var(--emerald-light), var(--emerald-lighter));
      transform: rotate(45deg);
      animation-delay: 5s;
    }
    
    .shape-3 {
      bottom: 20%;
      left: 20%;
      width: 50px;
      height: 50px;
      background: linear-gradient(45deg, var(--emerald-lighter), var(--emerald-lightest));
      clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
      animation-delay: 10s;
    }
    
    .shape-4 {
      bottom: 30%;
      right: 10%;
      width: 35px;
      height: 35px;
      background: linear-gradient(45deg, var(--primary-green), var(--emerald-lighter));
      border-radius: 50%;
      animation-delay: 15s;
    }
    
    @keyframes floatAround {
      0% { transform: translateY(0px) rotate(0deg); }
      25% { transform: translateY(-20px) rotate(90deg); }
      50% { transform: translateY(0px) rotate(180deg); }
      75% { transform: translateY(-10px) rotate(270deg); }
      100% { transform: translateY(0px) rotate(360deg); }
    }
    
    .container {
      text-align: center;
      position: relative;
      z-index: 10;
      background: rgba(255, 255, 255, 0.4);
      backdrop-filter: blur(20px);
      border-radius: 30px;
      padding: 60px 50px;
      box-shadow: 
        0 25px 50px rgba(16, 185, 129, 0.15),
        inset 0 1px 0 rgba(255, 255, 255, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.3);
      min-width: 400px;
    }
    
    /* Main spinner container */
    .spinner-container {
      position: relative;
      width: 200px;
      height: 200px;
      margin: 0 auto 40px;
    }
    
    /* Outer rotating ring */
    .spinner-outer {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border: 6px solid transparent;
      border-top: 6px solid var(--primary-green);
      border-right: 6px solid var(--emerald-light);
      border-radius: 50%;
      animation: spinClockwise 2s linear infinite;
    }
    
    /* Middle ring */
    .spinner-middle {
      position: absolute;
      top: 20px;
      left: 20px;
      width: calc(100% - 40px);
      height: calc(100% - 40px);
      border: 4px solid transparent;
      border-bottom: 4px solid var(--emerald-light);
      border-left: 4px solid var(--emerald-lighter);
      border-radius: 50%;
      animation: spinCounterClockwise 1.5s linear infinite;
    }
    
    /* Inner ring */
    .spinner-inner {
      position: absolute;
      top: 40px;
      left: 40px;
      width: calc(100% - 80px);
      height: calc(100% - 80px);
      border: 3px solid transparent;
      border-top: 3px solid var(--emerald-lighter);
      border-right: 3px solid var(--emerald-lightest);
      border-radius: 50%;
      animation: spinClockwise 1s linear infinite;
    }
    
    /* Center core */
    .spinner-core {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, var(--primary-green), var(--emerald-light));
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 
        0 0 20px var(--shadow-green),
        inset 0 2px 4px rgba(255, 255, 255, 0.3);
      animation: corePulse 2s ease-in-out infinite alternate;
    }
    
    .spinner-core::before {
      content: '';
      width: 30px;
      height: 30px;
      background: linear-gradient(135deg, #fff, rgba(255, 255, 255, 0.8));
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    @keyframes spinClockwise {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    @keyframes spinCounterClockwise {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(-360deg); }
    }
    
    @keyframes corePulse {
      0% { 
        transform: translate(-50%, -50%) scale(1);
        box-shadow: 
          0 0 20px var(--shadow-green),
          inset 0 2px 4px rgba(255, 255, 255, 0.3);
      }
      100% { 
        transform: translate(-50%, -50%) scale(1.1);
        box-shadow: 
          0 0 30px var(--shadow-green),
          0 0 40px var(--shadow-light),
          inset 0 2px 4px rgba(255, 255, 255, 0.5);
      }
    }
    
    /* Orbiting particles */
    .particle {
      position: absolute;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      top: 50%;
      left: 50%;
      transform-origin: 0 0;
    }
    
    .particle-1 {
      background: linear-gradient(45deg, var(--primary-green), var(--emerald-light));
      box-shadow: 0 0 10px var(--primary-green);
      animation: orbitParticle 3s linear infinite;
      transform-origin: -120px 0;
    }
    
    .particle-2 {
      background: linear-gradient(45deg, var(--emerald-light), var(--emerald-lighter));
      box-shadow: 0 0 8px var(--emerald-light);
      animation: orbitParticle 4s linear infinite reverse;
      transform-origin: -140px 0;
    }
    
    .particle-3 {
      background: linear-gradient(45deg, var(--emerald-lighter), var(--emerald-lightest));
      box-shadow: 0 0 6px var(--emerald-lighter);
      animation: orbitParticle 2.5s linear infinite;
      transform-origin: -100px 0;
    }
    
    @keyframes orbitParticle {
      0% { transform: rotate(0deg) translateX(-6px); }
      100% { transform: rotate(360deg) translateX(-6px); }
    }
    
    /* Loading text */
    .loading-text {
      font-size: 24px;
      font-weight: 600;
      color: var(--text-dark);
      margin-bottom: 15px;
      animation: textFade 2s ease-in-out infinite alternate;
    }
    
    @keyframes textFade {
      0% { opacity: 0.7; }
      100% { opacity: 1; }
    }
    
    /* Progress bar */
    .progress-container {
      width: 250px;
      height: 8px;
      background: rgba(16, 185, 129, 0.2);
      border-radius: 10px;
      margin: 20px auto;
      overflow: hidden;
      position: relative;
    }
    
    .progress-bar {
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, 
        var(--primary-green) 0%, 
        var(--emerald-light) 50%, 
        var(--emerald-lighter) 100%);
      border-radius: 10px;
      transform: translateX(-100%);
      animation: progressMove 2.5s ease-in-out infinite;
      box-shadow: 0 0 10px var(--shadow-green);
    }
    
    @keyframes progressMove {
      0% { transform: translateX(-100%); }
      50% { transform: translateX(0%); }
      100% { transform: translateX(100%); }
    }
    
    /* Status dots */
    .status-dots {
      display: flex;
      justify-content: center;
      gap: 12px;
      margin-top: 25px;
    }
    
    .status-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: var(--primary-green);
      opacity: 0.3;
      animation: dotWave 1.8s ease-in-out infinite;
    }
    
    .status-dot:nth-child(1) { animation-delay: 0s; }
    .status-dot:nth-child(2) { animation-delay: 0.2s; }
    .status-dot:nth-child(3) { animation-delay: 0.4s; }
    .status-dot:nth-child(4) { animation-delay: 0.6s; }
    .status-dot:nth-child(5) { animation-delay: 0.8s; }
    
    @keyframes dotWave {
      0%, 100% { 
        opacity: 0.3; 
        transform: scale(1); 
      }
      50% { 
        opacity: 1; 
        transform: scale(1.3);
        box-shadow: 0 0 15px var(--primary-green);
      }
    }
    
    /* Responsive design */
    @media (max-width: 480px) {
      .container {
        min-width: 320px;
        padding: 40px 30px;
        margin: 20px;
      }
      
      .spinner-container {
        width: 160px;
        height: 160px;
        margin-bottom: 30px;
      }
      
      .loading-text {
        font-size: 20px;
      }
      
      .progress-container {
        width: 200px;
      }
    }
  </style>
  </head>
  <body>
    <!-- Floating shapes -->
    <div class="floating-shape shape-1"></div>
    <div class="floating-shape shape-2"></div>
    <div class="floating-shape shape-3"></div>
    <div class="floating-shape shape-4"></div>
    
    <div class="container">
      <!-- Main spinner -->
      <div class="spinner-container">
        <div class="spinner-outer"></div>
        <div class="spinner-middle"></div>
        <div class="spinner-inner"></div>
        <div class="spinner-core"></div>
        
        <!-- Orbiting particles -->
        <div class="particle particle-1"></div>
        <div class="particle particle-2"></div>
        <div class="particle particle-3"></div>
      </div>
      
      <!-- Loading content -->
      <div class="loading-text">${message}</div>
      
      <!-- Progress bar -->
      <div class="progress-container">
        <div class="progress-bar"></div>
      </div>
      
      <!-- Status dots -->
      <div class="status-dots">
        <div class="status-dot"></div>
        <div class="status-dot"></div>
        <div class="status-dot"></div>
        <div class="status-dot"></div>
        <div class="status-dot"></div>
      </div>
    </div>
    
    <script>
      // Add dynamic particle trails
      function createParticleTrail() {
        const particles = document.querySelectorAll('.particle');
        
        particles.forEach((particle, index) => {
          const trail = document.createElement('div');
          trail.style.cssText = \`
            position: absolute;
            width: 4px;
            height: 4px;
            background: \${getComputedStyle(particle).background};
            border-radius: 50%;
            opacity: 0.5;
            top: 50%;
            left: 50%;
            pointer-events: none;
            animation: trailFade 0.5s ease-out forwards;
          \`;
          
          document.querySelector('.spinner-container').appendChild(trail);
          
          setTimeout(() => trail.remove(), 500);
        });
      }
      
      // Add trail animation
      const style = document.createElement('style');
      style.textContent = \`
        @keyframes trailFade {
          0% {
            opacity: 0.5;
            transform: scale(1);
          }
          100% {
            opacity: 0;
            transform: scale(0.5);
          }
        }
      \`;
      document.head.appendChild(style);
      
      // Create particle trails periodically
      setInterval(createParticleTrail, 200);
      
      // Add dynamic glow effect to spinner core
      setInterval(() => {
        const core = document.querySelector('.spinner-core');
        core.style.boxShadow = \`
          0 0 40px var(--shadow-green),
          0 0 60px var(--shadow-light),
          inset 0 2px 4px rgba(255, 255, 255, 0.5)
        \`;
        
        setTimeout(() => {
          core.style.boxShadow = '';
        }, 300);
      }, 2000);
      
      // Random floating elements
      function createFloatingElement() {
        const element = document.createElement('div');
        element.style.cssText = \`
          position: absolute;
          width: \${Math.random() * 20 + 10}px;
          height: \${Math.random() * 20 + 10}px;
          background: linear-gradient(45deg, 
            rgba(16, 185, 129, 0.3), 
            rgba(52, 211, 153, 0.2));
          border-radius: 50%;
          top: \${Math.random() * window.innerHeight}px;
          left: \${Math.random() * window.innerWidth}px;
          opacity: 0.6;
          animation: floatUp 4s ease-out forwards;
          pointer-events: none;
          z-index: 1;
        \`;
        
        document.body.appendChild(element);
        setTimeout(() => element.remove(), 4000);
      }
      
      // Add floating animation
      const floatingStyle = document.createElement('style');
      floatingStyle.textContent = \`
        @keyframes floatUp {
          0% {
            transform: translateY(0px) scale(1);
            opacity: 0.6;
          }
          100% {
            transform: translateY(-100px) scale(0);
            opacity: 0;
          }
        }
      \`;
      document.head.appendChild(floatingStyle);
      
      // Create floating elements periodically
      setInterval(createFloatingElement, 800);
      
      // Add subtle screen shake effect during loading
      let shakeTimeout;
      function addSubtleShake() {
        const container = document.querySelector('.container');
        container.style.animation = 'subtleShake 0.1s ease-in-out';
        
        clearTimeout(shakeTimeout);
        shakeTimeout = setTimeout(() => {
          container.style.animation = '';
        }, 100);
      }
      
      // Add shake animation
      const shakeStyle = document.createElement('style');
      shakeStyle.textContent = \`
        @keyframes subtleShake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-1px); }
          75% { transform: translateX(1px); }
        }
      \`;
      document.head.appendChild(shakeStyle);
      
      // Trigger subtle shake occasionally
      setInterval(() => {
        if (Math.random() < 0.3) {
          addSubtleShake();
        }
      }, 1500);
    </script>
  </body>
  </html>
  `;

  const blob = new Blob([htmlContent], { type: "text/html" });
  const blobURL = URL.createObjectURL(blob);
  const width = 550;
  const height = 500;
  const left = (window.screen.width - width) / 2;
  const top = (window.screen.height - height) / 2;
  const loadingWindow = window.open(
    blobURL,
    "_blank",
    `width=${width},height=${height},left=${left},top=${top},resizable=no`
  );
  if (loadingWindow) {
    loadingWindow.onload = () => URL.revokeObjectURL(blobURL);
  }
  return loadingWindow;
}