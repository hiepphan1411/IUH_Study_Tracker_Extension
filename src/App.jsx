import "./App.css";
import { useState, useEffect } from "react";
import { guideTemplate } from "./templates/guideTemplate";

function App() {
  const [activeTab, setActiveTab] = useState("main");
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedKey = localStorage.getItem("iuh-tracker-key");
    if (savedKey) {
      setKey(savedKey);
    }
  }, []);

  useEffect(() => {
    if (key.trim()) {
      localStorage.setItem("iuh-tracker-key", key);
    }
  }, [key]);

  const validateKey = (inputKey) => {
    if (!inputKey.trim()) {
      setError("Vui lòng nhập key");
      return false;
    }
    if (inputKey.length < 10) {
      setError("Key không hợp lệ (quá ngắn)");
      return false;
    }
    setError("");

    localStorage.setItem("iuh-tracker-key", inputKey);
    return true;
  };

  const handleKeyChange = (e) => {
    const value = e.target.value;
    setKey(value);
    if (error) {
      setError("");
    }
  };

  const handleViewSchedule = async () => {
    if (!validateKey(key)) return;

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsLoading(false);

    //Xử lý xem lịch học tại đây
    const scheduleUrl = `https://sv.iuh.edu.vn/tra-cuu/lich-hoc-theo-tuan.html?k=${encodeURIComponent(
      key
    )}`;
    window.open(scheduleUrl, "_blank");
  };

  const handleViewGrades = async () => {
    if (!validateKey(key)) return;

    setIsLoading(true);

    try {
      const messageListener = (message, sender, sendResponse) => {
        if (message.type === "GRADES_SAVED") {
          console.log("Nhận được dữ liệu điểm:", message.data);

          const mainPageUrl = chrome.runtime.getURL(
            `page/MainPage.html?k=${encodeURIComponent(key)}`
          );
          chrome.tabs.create({ url: mainPageUrl });

          chrome.tabs.remove(sender.tab.id);

          chrome.runtime.onMessage.removeListener(messageListener);
          setIsLoading(false);
        }
      };

      chrome.runtime.onMessage.addListener(messageListener);

      const gradesUrl = `https://sv.iuh.edu.vn/tra-cuu/ket-qua-hoc-tap.html?k=${encodeURIComponent(
        key
      )}`;
      await chrome.tabs.create({ url: gradesUrl, active: false, pinned: true });

      setTimeout(() => {
        chrome.runtime.onMessage.removeListener(messageListener);

        const mainPageUrl = chrome.runtime.getURL(
          `page/MainPage.html?k=${encodeURIComponent(key)}`
        );
        chrome.tabs.create({ url: mainPageUrl });

        setIsLoading(false);
      }, 20000);
    } catch (error) {
      console.error("Lỗi khi mở trang:", error);
      setIsLoading(false);
    }
  };

  const handleTabClick = (tabId) => {
    if (tabId === "guide") {
      const guideWindow = window.open("", "_blank");
      guideWindow.document.write(guideTemplate);
      guideWindow.document.close();
    } else {
      setActiveTab(tabId);
    }
  };

  return (
    <div className="w-[480px] h-[380px] bg-gradient-to-br from-blue-50 to-indigo-100 p-3 overflow-hidden rounded">
      <div className="w-full h-full flex flex-col">
        <div className="bg-white rounded-xl shadow-lg p-4 mb-3 flex-shrink-0 transform transition-all duration-300 hover:shadow-xl">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-500 to-slate-600 p-2 rounded-full shadow-md transition-transform duration-300 hover:scale-110">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h1 className="text-lg font-bold text-gray-800">
              IUH Study Tracker
            </h1>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg mb-3 overflow-hidden flex-shrink-0 transform transition-all duration-300 ">
          <div className="flex border-b border-gray-200 relative">
            {[
              { id: "main", label: "Chức năng chính", active: true },
              {
                id: "guide",
                label: "Hướng dẫn lấy key",
                active: false,
                external: true,
              },
              { id: "contact", label: "Liên hệ", active: false },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`flex-1 px-4 py-3 text-xs font-medium transition-all duration-300 ease-in-out relative z-10 ${
                  activeTab === tab.id
                    ? "text-blue-600 bg-blue-50 transform scale-105"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50 "
                }`}
              >
                <span className="flex items-center justify-center">
                  {tab.label}
                  {tab.external && (
                    <svg
                      className="w-3 h-3 ml-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  )}
                </span>
                {activeTab === tab.id && !tab.external && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-600 transform origin-left animate-pulse"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-5 flex-1 overflow-y-auto transform transition-all duration-300 hover:shadow-xl">
          {activeTab === "main" && (
            <div className="space-y-4">
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">
                  Key
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={key}
                    onChange={handleKeyChange}
                    placeholder="npUdG8auRX8sVUZRemnNTSaTq2eis8LJxZo-Tvx-AN4"
                    className={`w-full px-3 py-2.5 border-2 rounded-lg focus:outline-none transition-all duration-500 text-sm transform focus:scale-105 ${
                      error
                        ? "border-red-500 focus:border-red-600 bg-red-50"
                        : "border-gray-300 focus:border-blue-500 focus:bg-blue-50"
                    }`}
                  />
                  {error && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 animate-bounce">
                      <svg
                        className="w-4 h-4 text-red-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                {error && (
                  <p className="text-red-500 text-xs mt-1 animate-pulse flex items-center transform transition-all duration-300">
                    <svg
                      className="w-3 h-3 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {error}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3 mt-4">
                <button
                  onClick={handleViewSchedule}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-lg font-semibold shadow-lg hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm hover:shadow-xl"
                >
                  {isLoading ? (
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  )}
                  Xem lịch học
                </button>

                <button
                  onClick={handleViewGrades}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-slate-500 to-slate-600 text-white px-4 py-3 rounded-lg font-semibold shadow-lg hover:from-slate-600 hover:to-slate-700 transform hover:scale-105 transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm hover:shadow-xl"
                >
                  {isLoading ? (
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  )}
                  Xem điểm
                </button>
              </div>
            </div>
          )}

          {activeTab === "contact" && (
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-gray-800 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                Liên hệ
              </h2>
              <div className="text-gray-600 text-sm space-y-3">
                <p className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500">
                  Nếu bạn gặp vấn đề hoặc cần hỗ trợ, vui lòng liên hệ:
                </p>
                <div className="space-y-2">
                  <p className="flex items-center p-2 bg-green-50 rounded-lg">
                    <svg
                      className="w-4 h-4 mr-2 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <strong>Email:</strong> support@iuh-tracker.com
                  </p>
                  <p className="flex items-center p-2 bg-purple-50 rounded-lg">
                    <svg
                      className="w-4 h-4 mr-2 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    <strong>Hotline:</strong> 0123-456-789
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
