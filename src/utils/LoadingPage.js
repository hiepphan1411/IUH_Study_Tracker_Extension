// Giữ lại hàm này để đảm bảo tính tương thích ngược
export const showLoadingPage = (message) => {
  console.warn("showLoadingPage is deprecated. Use LoadingPage component with React Router instead.");
  const loadingWindow = window.open("", "_blank", "width=500,height=300");
  loadingWindow.document.write(`
    <html>
      <head>
        <title>Loading...</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            background: linear-gradient(to bottom right, #f0f4ff, #e6eaff);
            color: #333;
          }
          .loading-container {
            background: white;
            padding: 2rem;
            border-radius: 0.5rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            text-align: center;
          }
          .spinner {
            border: 4px solid rgba(0, 0, 0, 0.1);
            width: 36px;
            height: 36px;
            border-radius: 50%;
            border-left-color: #3b82f6;
            animation: spin 1s linear infinite;
            margin: 0 auto 1rem;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      </head>
      <body>
        <div class="loading-container">
          <div class="spinner"></div>
          <h2>${message || "Loading..."}</h2>
          <p>Vui lòng đợi trong giây lát...</p>
        </div>
      </body>
    </html>
  `);
  loadingWindow.document.close();
  return loadingWindow;
};
