// const { i } = require("framer-motion/client");
/* eslint-disable */
const { motion, AnimatePresence } = window.Motion || {};

function mapTietToTime(t) {
  const m = {
    1: "06:30",
    2: "07:20",
    3: "08:10",
    4: "09:10",
    5: "10:00",
    6: "10:50",
    7: "12:30",
    8: "13:20",
    9: "14:10",
    10: "15:10",
    11: "16:00",
    12: "16:50",
    13: "18:00",
    14: "18:50",
    15: "19:50",
    16: "20:40",
  };
  return m[t] || "";
}

// Hàm đảo ngược để ánh xạ từ giờ sang tiết
function mapTimeToTiet(time) {
  const timeMap = {
    "06:30": 1,
    "07:20": 2,
    "08:10": 3,
    "09:10": 4,
    "10:00": 5,
    "10:50": 6,
    "12:30": 7,
    "13:20": 8,
    "14:10": 9,
    "15:10": 10,
    "16:00": 11,
    "16:50": 12,
    "18:00": 13,
    "18:50": 14,
    "19:50": 15,
    "20:40": 16,
  };
  return timeMap[time] || 0;
}

// Hàm cộng 50 phút vào thời gian
function addMinutesToTime(timeStr) {
  if (!timeStr) return "";
  const [hours, minutes] = timeStr.split(":").map(Number);
  let newMinutes = minutes + 50;
  let newHours = hours + Math.floor(newMinutes / 60);
  newMinutes = newMinutes % 60;
  if (newMinutes < 10) newMinutes = "0" + newMinutes;
  if (newHours >= 24) newHours -= 24; // Xử lý qua ngày mới nếu cần
  if (newHours < 10) newHours = "0" + newHours;
  return `${newHours}:${newMinutes}`;
}

function parseDate(caHoc) {
  const match = caHoc.match(/(\d{2}\/\d{2}\/\d{4})/);
  return match ? match[0] : "";
}

function splitSchedule(rows = []) {
  return rows.reduce(
    (acc, r) => {
      const isExam =
        typeof r.supervisor === "string" && r.supervisor.includes(",");
      (isExam ? acc.exams : acc.classes).push(r);
      return acc;
    },
    { classes: [], exams: [] }
  );
}

function getWeekNumber(date) {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const firstMonday = new Date(firstDayOfYear);
  while (firstMonday.getDay() !== 1) {
    firstMonday.setDate(firstMonday.getDate() + 1);
  }
  const diff = (date - firstMonday) / (1000 * 60 * 60 * 24);
  return Math.ceil(diff / 7);
}

function getWeekDates(weekNumber, year) {
  const firstDayOfYear = new Date(year, 0, 1);
  const firstMonday = new Date(firstDayOfYear);
  while (firstMonday.getDay() !== 1) {
    firstMonday.setDate(firstMonday.getDate() + 1);
  }
  const startOfWeek = new Date(firstMonday);
  startOfWeek.setDate(firstMonday.getDate() + (weekNumber - 1) * 7);

  const days = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    const formattedDate = `${date.getDate().toString().padStart(2, "0")}/${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}/${date.getFullYear()}`;
    days.push({
      date: formattedDate,
      dayName: [
        "Chủ Nhật",
        "Thứ Hai",
        "Thứ Ba",
        "Thứ Tư",
        "Thứ Năm",
        "Thứ Sáu",
        "Thứ Bảy",
      ][date.getDay()],
    });
  }
  return { days, year };
}

// App Component
function App() {
  const [currentView, setCurrentView] = React.useState("all");
  const [isLoading, setIsLoading] = React.useState(true);
  const [scheduleData, setScheduleData] = React.useState({
    classes: [],
    exams: [],
  });
  const [key, setKey] = React.useState("");
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = React.useState(false);
  const [showTodayPopup, setShowTodayPopup] = React.useState(false);
  const [todayClasses, setTodayClasses] = React.useState([]);
  const [todayExams, setTodayExams] = React.useState([]);
  const [showSettings, setShowSettings] = React.useState(false);

  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const keyFromUrl = urlParams.get("k");
    if (keyFromUrl) {
      setKey(keyFromUrl);
      localStorage.setItem("iuh-tracker-key", keyFromUrl);
    }

    loadScheduleData();
  }, []);

  const loadScheduleData = async () => {
    setIsLoading(true);
    try {
      const result = await new Promise((resolve) => {
        chrome.storage.local.get(
          ["schedule_json", "schedule_timestamp", "hide_today_popup"],
          function (res) {
            if (chrome.runtime.lastError) {
              console.log("Lỗi Chrome Storage:", chrome.runtime.lastError);
              resolve({ schedule_json: null });
              return;
            }

            resolve(res);
          }
        );
      });

      const scheduleJson = result.schedule_json;
      const hideTodayPopup = result.hide_today_popup;

      if (scheduleJson) {
        const parsedData = JSON.parse(scheduleJson);
        // console.log(parsedData);
        const lichHoc = parsedData.lichHoc || [];
        const lichThi = parsedData.lichThi || [];

        const transformedClasses = lichHoc.map((item, index) => {
          const date = parseDate(item.caHoc);
          const timeParts = item.time
            ? item.time.replace("Tiết: ", "").split(" - ")
            : ["", ""];
          const startTime = timeParts[0]
            ? mapTietToTime(parseInt(timeParts[0]))
            : "";
          let endTime = timeParts[1]
            ? mapTietToTime(parseInt(timeParts[1]))
            : "";
          if (endTime) {
            endTime = addMinutesToTime(endTime);
          }
          return {
            id: index + 1,
            subject: item.nameSubject || "Không xác định",
            supervisor: item.teacher || "Không xác định",
            date: date,
            startTime: startTime,
            endTime: endTime,
            room: item.room || "",
            className: item.class || "",
            note: item.note || "",
            // classCode: "420301767823",
            lesson: item.time || "",
            isExam: false,
          };
        });

        const transformedExams = lichThi.map((item, index) => {
          const date = parseDate(item.caHoc);
          const timeParts =
            item.time || item.lesson
              ? (item.time || item.lesson).replace("Tiết: ", "").split(" - ")
              : ["", ""];
          const startTime =
            item.startTime ||
            (timeParts[0] ? mapTietToTime(parseInt(timeParts[0])) : "");
          let endTime =
            item.endTime ||
            (timeParts[1] ? mapTietToTime(parseInt(timeParts[1])) : "");
          if (endTime) {
            endTime = addMinutesToTime(endTime);
          }
          return {
            id: index + 1,
            subject: item.nameSubject || "Không xác định",
            supervisor: item.teacher || "Không xác định",
            date: date,
            startTime: startTime,
            endTime: endTime,
            room: item.room || "",
            className: item.class || "",
            note: item.note,
            // classCode: "420301767823",
            lesson: item.time || item.lesson || "",
            isExam: true,
          };
        });

        setScheduleData({
          classes: transformedClasses,
          exams: transformedExams,
        });


        const today = new Date();
        const todayFormatted = `${today
          .getDate()
          .toString()
          .padStart(2, "0")}/${(today.getMonth() + 1)
          .toString()
          .padStart(2, "0")}/${today.getFullYear()}`;

        const todayClassItems = transformedClasses
          .filter((item) => item.date === todayFormatted)
          .sort((a, b) => {
            if (a.startTime < b.startTime) return -1;
            if (a.startTime > b.startTime) return 1;
            return 0;
          });

        const todayExamItems = transformedExams
          .filter((item) => item.date === todayFormatted)
          .sort((a, b) => {
            if (a.startTime < b.startTime) return -1;
            if (a.startTime > b.startTime) return 1;
            return 0;
          });

        setTodayClasses(todayClassItems);
        setTodayExams(todayExamItems);

        if (
          (todayClassItems.length > 0 || todayExamItems.length > 0) &&
          !hideTodayPopup
        ) {
          setShowTodayPopup(true);
        }
      } else {
        console.log("Không có dữ liệu lịch học trong Storage");
        setScheduleData({ classes: [], exams: [] });
      }
    } catch (error) {
      console.log("Lỗi khi tải dữ liệu lịch học:", error);
      setScheduleData({ classes: [], exams: [] });
    } finally {
      setIsLoading(false);
    }
  };

  const getDisplayData = () => {
    if (currentView === "all") {
      return [...scheduleData.classes, ...scheduleData.exams];
    } else if (currentView === "exams") {
      return scheduleData.exams;
    } else {
      return scheduleData.classes;
    }
  };

  const handleBackToPortal = () => {
    setIsConfirmDialogOpen(true);
    setTimeout(() => {
      setIsConfirmDialogOpen(false);
    }, 5000);
  };

  const handleHideTodayPopup = (shouldHide) => {
    setShowTodayPopup(false);

    if (shouldHide) {
      chrome.storage.local.set({ hide_today_popup: true }, function () {
        if (chrome.runtime.lastError) {
          console.log("Error saving preference:", chrome.runtime.lastError);
        }
      });
    }
  };

  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  return React.createElement(
    "div",
    { className: "app-container" },
    React.createElement(ModernHeader, {
      currentView: currentView,
      onViewChange: setCurrentView,
      onBackClick: handleBackToPortal,
      onSettingsClick: toggleSettings,
      showSettingsView: showSettings,
    }),
    React.createElement(
      "div",
      { className: "content-wrapper" },
      isLoading
        ? React.createElement(
            "div",
            { className: "loading-container" },
            React.createElement("div", { className: "spinner" }),
            React.createElement(
              "span",
              { className: "loading-text" },
              "Đang tải dữ liệu..."
            )
          )
        : showSettings
        ? React.createElement(SettingsContent, {
          onBack: toggleSettings
        })
        : React.createElement(ScheduleContent, {
            data: getDisplayData(),
            viewType: currentView,
          })
    ),
    React.createElement(ConfirmationDialog, {
      isOpen: isConfirmDialogOpen,
      onClose: () => setIsConfirmDialogOpen(false),
      onConfirm: () => window.close(),
    }),
    React.createElement(TodayClassesPopup, {
      isOpen: showTodayPopup,
      onClose: handleHideTodayPopup,
      classes: todayClasses,
      exams: todayExams,
    })
  );
}

// Modern Header Component
function ModernHeader({
  currentView,
  onViewChange,
  onBackClick,
  onSettingsClick,
  showSettingsView,
}) {
  const [lastUpdated, setLastUpdated] = React.useState(null);

  const viewOptions = [
    { value: "all", label: "Tất cả lịch" },
    { value: "classes", label: "Lịch học" },
    { value: "exams", label: "Lịch thi" },
  ];

  React.useEffect(() => {
    const fetchLastUpdated = async () => {
      try {
        const result = await new Promise((resolve) => {
          chrome.storage.local.get(["schedule_timestamp"], function (res) {
            if (chrome.runtime.lastError) {
              console.log(
                "Lỗi khi lấy thời gian cập nhật:",
                chrome.runtime.lastError
              );
              resolve({ schedule_timestamp: null });
              return;
            }
            resolve(res);
          });
        });

        if (result.schedule_timestamp) {
          const updateTime = new Date(result.schedule_timestamp);
          setLastUpdated(updateTime);
        }
      } catch (error) {
        console.log("Lỗi khi lấy thời gian cập nhật:", error);
      }
    };

    fetchLastUpdated();
  }, []);

  const formattedTime = lastUpdated
    ? `${lastUpdated.getDate()}/${
        lastUpdated.getMonth() + 1
      }/${lastUpdated.getFullYear()} ${lastUpdated.getHours()}:${String(
        lastUpdated.getMinutes()
      ).padStart(2, "0")}`
    : "Chưa cập nhật";

  return React.createElement(
    "header",
    { className: "modern-header" },
    React.createElement(
      "div",
      { className: "header-left" },
      React.createElement(
        "div",
        { className: "app-logo" },
        React.createElement(
          "svg",
          {
            width: "32",
            height: "32",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            strokeWidth: "2",
            strokeLinecap: "round",
            strokeLinejoin: "round",
          },
          React.createElement("path", {
            d: "M22 10v6M2 10l10-5 10 5-10 5z",
          }),
          React.createElement("path", {
            d: "M6 12v5c3 3 9 3 12 0v-5",
          })
        ),
        React.createElement("h1", null, "IUH Grade Guard")
      )
    ),
    React.createElement(
      "div",
      { className: "header-center" },
      !showSettingsView &&
        React.createElement(
          "div",
          { className: "view-selector" },
          React.createElement(
            "select",
            {
              value: currentView,
              onChange: (e) => onViewChange(e.target.value),
              className: "view-dropdown",
            },
            viewOptions.map((option) =>
              React.createElement(
                "option",
                {
                  key: option.value,
                  value: option.value,
                },
                option.label
              )
            )
          )
        ),
      showSettingsView &&
        React.createElement("div", { className: "settings-title" }, "Cài đặt")
    ),
    React.createElement(
      "div",
      { className: "header-right" },
      React.createElement(
        "div",
        { className: "last-updated" },
        React.createElement(
          "svg",
          {
            width: "16",
            height: "16",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            strokeWidth: "2",
          },
          React.createElement("circle", { cx: "12", cy: "12", r: "10" }),
          React.createElement("polyline", { points: "12 6 12 12 16 14" })
        ),
        React.createElement("span", null, formattedTime)
      ),
      React.createElement(
        "button",
        {
          className: `nav-button settings-button ${
            showSettingsView ? "active" : ""
          }`,
          onClick: onSettingsClick,
          title: showSettingsView ? "Lịch học" : "Cài đặt",
        },
        React.createElement(
          "svg",
          {
            width: "16",
            height: "16",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            strokeWidth: "2",
          },
          showSettingsView
            ? React.createElement("path", {
                d: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
              })
            : [
                React.createElement("circle", {
                  cx: "12",
                  cy: "12",
                  r: "3",
                  key: "circle",
                }),
                React.createElement("path", {
                  d: "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z",
                  key: "path",
                }),
              ]
        )
      ),
      React.createElement(
        "button",
        {
          className: "nav-button",
          onClick: onBackClick,
        },
        React.createElement(
          "svg",
          {
            width: "16",
            height: "16",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            strokeWidth: "2",
          },
          React.createElement("path", { d: "M19 12H5" }),
          React.createElement("polyline", { points: "12 19 5 12 12 5" })
        ),
        "Thoát"
      )
    )
  );
}

function ChevronLeftIcon(props) {
  return React.createElement(
    "svg",
    {
      width: props.size || 20,
      height: props.size || 20,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
    },
    React.createElement("polyline", { points: "15,18 9,12 15,6" })
  );
}

function ChevronRightIcon(props) {
  return React.createElement(
    "svg",
    {
      width: props.size || 20,
      height: props.size || 20,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
    },
    React.createElement("polyline", { points: "9,18 15,12 9,6" })
  );
}

function ConfirmationDialog({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return React.createElement(
    "div",
    { className: "dialog-overlay" },
    React.createElement(
      motion.div,
      {
        className: "dialog-container",
        initial: { opacity: 0, scale: 0.8 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.8 },
        transition: { duration: 0.2 },
      },
      React.createElement(
        "div",
        { className: "dialog-content" },
        React.createElement(
          "h3",
          { className: "dialog-title" },
          "Xác nhận thoát"
        ),
        React.createElement(
          "p",
          { className: "dialog-message" },
          "Bạn có chắc chắn muốn thoát khỏi ứng dụng?"
        ),
        React.createElement(
          "div",
          { className: "dialog-actions" },
          React.createElement(
            motion.button,
            {
              className: "dialog-button cancel",
              onClick: onClose,
              whileHover: { scale: 1.05 },
              whileTap: { scale: 0.95 },
            },
            "Hủy"
          ),
          React.createElement(
            motion.button,
            {
              className: "dialog-button confirm",
              onClick: onConfirm,
              whileHover: { scale: 1.05 },
              whileTap: { scale: 0.95 },
            },
            "Thoát"
          )
        )
      )
    )
  );
}

function Item(props) {
  const { item } = props;

  return React.createElement(
    motion.div,
    {
      className: `class-item ${item.isExam ? "exam-item" : ""}`,
      style: {
        borderLeft: `3px solid ${item.isExam ? "#f59e0b" : "#3b82f6"}`,
      },
      whileHover: { scale: 1.02 },
      transition: { duration: 0.2 },
    },
    [
      React.createElement(
        "div",
        { className: "class-subject", key: "subject" },
        item.subject || "Không xác định"
      ),
      React.createElement(
        "div",
        { className: "class-name", key: "className" },
        item.className || "N/A"
      ),
      React.createElement(
        "div",
        { className: "class-lesson", key: "lesson" },
        item.lesson || "N/A"
      ),
      React.createElement(
        "div",
        { className: "class-time", key: "time" },
        `Thời gian: ${item.startTime || "N/A"} - ${item.endTime || "N/A"}`
      ),
      React.createElement(
        "div",
        { className: "class-room", key: "room" },
        `Phòng: ${item.room || "N/A"}`
      ),
      React.createElement(
        "div",
        { className: "class-teacher", key: "teacher" },
        `GV: ${item.supervisor || "Không xác định"}`
      ),
      item.note
        ? React.createElement(
            "div",
            { className: "class-note", key: "note" },
            `Ghi chú: ${item.note}`
          )
        : null,
    ]
  );
}

function TimeSlotCell(props) {
  if (!props.items || !Array.isArray(props.items)) {
    console.warn("props.items is invalid:", props.items);
    return React.createElement(
      "td",
      {
        className: `time-slot-cell ${
          props.isCurrentDay ? "current-day-cell" : ""
        }`,
      },
      null
    );
  }

  const filteredItems = props.items.filter((item) => {
    if (!item || !item.lesson) {
      console.log("Item or lesson missing:", item);
      return false;
    }

    let startTiet = 0;
    try {
      const cleanedLesson = item.lesson.replace("Tiết: ", "").trim();
      const timeParts = cleanedLesson.split(" - ");
      startTiet = parseInt(timeParts[0]) || 0;
      if (isNaN(startTiet)) {
        console.warn(
          "Invalid lesson format, setting startTiet to 0:",
          item.lesson,
          "isExam:",
          item.isExam,
          "startTime:",
          item.startTime,
          "endTime:",
          item.endTime
        );
        startTiet = item.startTime ? mapTimeToTiet(item.startTime) : 0;
      }
    } catch (error) {
      console.error("Error parsing lesson:", item.lesson, error);
      startTiet = item.startTime ? mapTimeToTiet(item.startTime) : 0;
    }

    switch (props.timeSlot) {
      case "morning":
        return startTiet >= 1 && startTiet <= 6;
      case "afternoon":
        return startTiet >= 7 && startTiet <= 12;
      case "evening":
        return startTiet >= 13 && startTiet <= 16;
      default:
        return false;
    }
  });

  return React.createElement(
    "td",
    {
      className: `time-slot-cell ${
        props.isCurrentDay ? "current-day-cell" : ""
      }`,
    },
    filteredItems.length > 0
      ? filteredItems.map((item) =>
          React.createElement(Item, {
            key: item.id || `item-${Date.now()}-${Math.random()}`,
            item: item,
          })
        )
      : React.createElement("div", { className: "no-data-cell" }, "")
  );
}

// Settings Content Component
function SettingsContent({onBack}) {
  const [refreshInterval, setRefreshInterval] = React.useState("24h");
  const [showTodayPopup, setShowTodayPopup] = React.useState(true);
  const [isSuccess, setIsSuccess] = React.useState(false);

React.useEffect(() => {
  chrome.storage.local.get(
    ["refresh_interval", "hide_today_popup"],
    function (result) {
      if (result.refresh_interval) {
        setRefreshInterval(result.refresh_interval);
      }
      setShowTodayPopup(result.hide_today_popup === undefined ? true : !result.hide_today_popup);
    }
  );
}, []);

  const handleSaveSettings = () => {
    chrome.storage.local.set(
      {
        refresh_interval: refreshInterval,
        hide_today_popup: !showTodayPopup,
      },
      function () {
        if (chrome.runtime.lastError) {
          console.log("Lỗi khi lưu cài đặt:", chrome.runtime.lastError);
        } else {
          setIsSuccess(true);
          setTimeout(() => setIsSuccess(false), 2000);
        }
      }
    );
  };

  const refreshOptions = [
    { value: "6h", label: "6 giờ" },
    { value: "12h", label: "12 giờ" },
    { value: "24h", label: "24 giờ" },
    { value: "3day", label: "3 ngày" },
  ];

  return React.createElement(
    motion.div,
    {
      className: "settings-container",
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.3 },
    },
    React.createElement(
      "div",
      { className: "settings-card" },
      React.createElement(
        "h1",
        { className: "settings-main-title" },
        "Cài đặt"
      ),

      // Phần Cài đặt thời gian làm mới
      React.createElement(
        "div",
        { className: "settings-section" },
        React.createElement(
          "div",
          { className: "settings-section-title" },
          React.createElement(
            "svg",
            {
              width: "20",
              height: "20",
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: "currentColor",
              strokeWidth: "2",
              className: "settings-section-icon",
            },
            React.createElement("circle", { cx: "12", cy: "12", r: "10" }),
            React.createElement("polyline", { points: "12 6 12 12 16 14" })
          ),
          "Thời gian làm mới dữ liệu"
        ),
        React.createElement(
          "div",
          { className: "settings-option" },
          React.createElement(
            "div",
            { className: "settings-option-text" },
            React.createElement(
              "div",
              { className: "settings-option-title" },
              "Tần suất làm mới"
            ),
            React.createElement(
              "div",
              { className: "settings-option-description" },
              "Dữ liệu lịch học sẽ được tự động cập nhật sau khoảng thời gian này"
            )
          ),
          React.createElement(
            "select",
            {
              className: "settings-select",
              value: refreshInterval,
              onChange: (e) => setRefreshInterval(e.target.value),
            },
            refreshOptions.map((option) =>
              React.createElement(
                "option",
                { value: option.value, key: option.value },
                option.label
              )
            )
          )
        )
      ),

      // Phần Cài đặt Hiển thị popup
      React.createElement(
        "div",
        { className: "settings-section" },
        React.createElement(
          "div",
          { className: "settings-section-title" },
          React.createElement(
            "svg",
            {
              width: "20",
              height: "20",
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: "currentColor",
              strokeWidth: "2",
              className: "settings-section-icon",
            },
            React.createElement("path", {
              d: "M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z",
            }),
            React.createElement("polyline", { points: "13 2 13 9 20 9" })
          ),
          "Thông báo"
        ),
        React.createElement(
          "div",
          { className: "settings-option" },
          React.createElement(
            "div",
            { className: "settings-option-text" },
            React.createElement(
              "div",
              { className: "settings-option-title" },
              "Hiển thị thông báo lịch học hôm nay"
            ),
            React.createElement(
              "div",
              { className: "settings-option-description" },
              "Khi được bật, một cửa sổ thông báo sẽ hiển thị lịch học và lịch thi của ngày hôm nay"
            )
          ),
          React.createElement(ToggleSwitchCustom, {
            isOn: showTodayPopup,
            onToggle: () => setShowTodayPopup(!showTodayPopup),
          })
        )
      ),

      // Nút lưu cài đặt
      React.createElement(
        "div",
        { className: "settings-actions" },
        React.createElement(
          "button",
          {
            className: `settings-save-button ${isSuccess ? "success" : ""}`,
            onClick: handleSaveSettings,
          },
          isSuccess ? "Đã lưu" : "Lưu cài đặt"
        )
      ),

      // Nút quay về trang lịch học
      React.createElement(
        "div",
        { className: "settings-back-section" },
        React.createElement(
          motion.button,
          {
            className: "settings-back-button",
            onClick: onBack,
            whileHover: { scale: 1.02 },
            whileTap: { scale: 0.98 },
          },
          React.createElement(
            "svg",
            {
              width: "16",
              height: "16",
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: "currentColor",
              strokeWidth: "2",
            },
            React.createElement("path", { d: "M10 19l-7-7 7-7" }),
            React.createElement("path", { d: "M3 12h18" })
          ),
          "Quay lại trang lịch học"
        )
      )
    )
  );
}

// Toggle Switch Custom Component
function ToggleSwitchCustom({ isOn, onToggle }) {
  return React.createElement(
    "button",
    {
      className: `relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none ${
        isOn ? "bg-indigo-600" : "bg-gray-600"
      }`,
      onClick: onToggle,
    },
    React.createElement("span", {
      className: `inline-block size-4 transform transition-transform bg-white rounded-full ${
        isOn ? "translate-x-6" : "translate-x-1"
      }`,
    })
  );
}

function ScheduleTable(props) {
  const timeSlots = [
    { key: "morning", label: "Sáng" },
    { key: "afternoon", label: "Chiều" },
    { key: "evening", label: "Tối" },
  ];

  const { days, year } = getWeekDates(props.currentWeek, props.currentYear);

  const today = new Date();
  const todayFormatted = `${today.getDate().toString().padStart(2, "0")}/${(
    today.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}/${today.getFullYear()}`;

  if (!props.data || !Array.isArray(props.data)) {
    console.warn("props.data is invalid:", props.data);
    return React.createElement(
      "div",
      { className: "schedule-table-container" },
      React.createElement("p", null, "Dữ liệu không hợp lệ.")
    );
  }

  return React.createElement(
    "div",
    { className: "schedule-table-container" },
    React.createElement(
      "table",
      { className: "schedule-table" },
      React.createElement(
        "thead",
        null,
        React.createElement(
          "tr",
          null,
          React.createElement("th", { className: "time-header" }, "Thời gian"),
          days.map((day) =>
            React.createElement(
              "th",
              {
                key: day.date,
                className: `day-header ${
                  day.date === todayFormatted ? "current-day" : ""
                }`,
              },
              React.createElement(
                "div",
                { className: "day-name" },
                day.dayName
              ),
              React.createElement("div", { className: "day-date" }, day.date)
            )
          )
        )
      ),
      React.createElement(
        "tbody",
        null,
        timeSlots.map((timeSlot) =>
          React.createElement(
            "tr",
            { key: timeSlot.key },
            React.createElement(
              "td",
              { className: "time-label" },
              timeSlot.label
            ),
            days.map((day) => {
              const filteredItems = props.data.filter(
                (item) => item && item.date && item.date === day.date
              );

              return React.createElement(TimeSlotCell, {
                key: `${day.date}-${timeSlot.key}`,
                items: filteredItems,
                timeSlot: timeSlot.key,
                isCurrentDay: day.date === todayFormatted,
              });
            })
          )
        )
      )
    )
  );
}

function WeekNavigation(props) {
  const [isExpanded, setIsExpanded] = React.useState(true);

  const now = new Date();
  const currentWeekNumber = getWeekNumber(now);
  const currentYear = now.getFullYear();

  const isCurrentWeek =
    props.currentWeek === currentWeekNumber &&
    props.currentYear === currentYear;

  const disabledButtonStyle = {
    opacity: 0.4,
    cursor: "not-allowed",
    backgroundColor: "rgba(100, 100, 100, 0.1)",
    color: "#999",
    boxShadow: "none",
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return React.createElement(
    motion.div,
    {
      className: `week-navigation-sidebar ${
        isExpanded ? "expanded" : "collapsed"
      }`,
      animate: {
        width: isExpanded ? "200px" : "50px",
      },
      transition: { duration: 0.3 },
    },
    React.createElement(
      "div",
      { className: "toggle-button-container" },
      React.createElement(
        motion.button,
        {
          className: "toggle-nav-button",
          onClick: toggleExpand,
          whileHover: { scale: 1.1 },
          whileTap: { scale: 0.95 },
          title: isExpanded ? "Thu gọn" : "Mở rộng",
        },
        isExpanded
          ? React.createElement(
              "svg",
              {
                width: "20",
                height: "20",
                viewBox: "0 0 24 24",
                fill: "none",
                stroke: "currentColor",
                strokeWidth: "2",
              },
              React.createElement("polyline", { points: "15,6 9,12 15,18" })
            )
          : React.createElement(
              "svg",
              {
                width: "20",
                height: "20",
                viewBox: "0 0 24 24",
                fill: "none",
                stroke: "currentColor",
                strokeWidth: "2",
              },
              React.createElement("polyline", { points: "9,6 15,12 9,18" })
            )
      )
    ),
    React.createElement(
      AnimatePresence,
      null,
      isExpanded &&
        React.createElement(
          motion.div,
          {
            className: "week-nav-content",
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 },
            transition: { duration: 0.2 },
          },
          React.createElement(
            "div",
            { className: "month-year-display" },
            React.createElement(
              "span",
              { className: "month-year-label" },
              `Tháng ${props.currentMonth}, ${props.currentYear}`
            ),
            props.isPrevDisabled || props.isNextDisabled
              ? React.createElement(
                  "div",
                  {
                    className: "data-range-notice",
                    style: {
                      fontSize: "0.75rem",
                      color: "#ff9800",
                      marginTop: "4px",
                      fontStyle: "italic",
                    },
                  },
                  "Truy cập sv.iuh để xem thêm!"
                )
              : null
          ),
          React.createElement(
            "div",
            { className: "week-nav-buttons" },
            React.createElement(
              motion.button,
              {
                className: `nav-button prev-week ${
                  props.isPrevDisabled ? "disabled" : ""
                }`,
                onClick: () =>
                  !props.isPrevDisabled && props.onWeekChange("prev"),
                whileHover: !props.isPrevDisabled ? { scale: 1.05 } : {},
                whileTap: !props.isPrevDisabled ? { scale: 0.95 } : {},
                disabled: props.isPrevDisabled,
                title: props.isPrevDisabled
                  ? "Không có dữ liệu cho tuần trước"
                  : "Xem tuần trước",
                style: props.isPrevDisabled ? disabledButtonStyle : {},
              },
              React.createElement(ChevronLeftIcon, { size: 20 }),
              React.createElement("span", null, "Tuần trước")
            ),
            React.createElement(
              motion.button,
              {
                className: `nav-button current-week-button ${
                  isCurrentWeek ? "disabled" : ""
                }`,
                onClick: () => !isCurrentWeek && props.onWeekChange("current"),
                whileHover: !isCurrentWeek ? { scale: 1.05 } : {},
                whileTap: !isCurrentWeek ? { scale: 0.95 } : {},
                disabled: isCurrentWeek,
                title: isCurrentWeek
                  ? "Đang ở tuần hiện tại"
                  : "Quay về tuần hiện tại",
                style: isCurrentWeek ? disabledButtonStyle : {},
              },
              React.createElement(
                "span",
                {
                  style: {
                    display: "flex",
                    alignItems: "center",
                  },
                },
                React.createElement(
                  "svg",
                  {
                    width: "16",
                    height: "16",
                    viewBox: "0 0 24 24",
                    fill: "none",
                    stroke: "currentColor",
                    strokeWidth: "2",
                    style: { marginRight: "5px" },
                  },
                  React.createElement("circle", {
                    cx: "12",
                    cy: "12",
                    r: "10",
                  }),
                  React.createElement("polyline", {
                    points: "12 6 12 12 16 14",
                  })
                ),
                "Tuần hiện tại"
              )
            ),
            React.createElement(
              motion.button,
              {
                className: `nav-button next-week ${
                  props.isNextDisabled ? "disabled" : ""
                }`,
                onClick: () =>
                  !props.isNextDisabled && props.onWeekChange("next"),
                whileHover: !props.isNextDisabled ? { scale: 1.05 } : {},
                whileTap: !props.isNextDisabled ? { scale: 0.95 } : {},
                disabled: props.isNextDisabled,
                title: props.isNextDisabled
                  ? "Không có dữ liệu cho tuần sau"
                  : "Xem tuần sau",
                style: props.isNextDisabled ? disabledButtonStyle : {},
              },
              React.createElement("span", null, "Tuần sau"),
              React.createElement(ChevronRightIcon, { size: 20 })
            )
          )
        )
    ),
    !isExpanded &&
      React.createElement(
        "div",
        { className: "collapsed-controls" },
        React.createElement(
          motion.button,
          {
            className: `mini-nav-button ${
              props.isPrevDisabled ? "disabled" : ""
            }`,
            onClick: () => !props.isPrevDisabled && props.onWeekChange("prev"),
            whileHover: !props.isPrevDisabled ? { scale: 1.1 } : {},
            whileTap: !props.isPrevDisabled ? { scale: 0.9 } : {},
            disabled: props.isPrevDisabled,
            title: "Tuần trước",
            style: props.isPrevDisabled ? disabledButtonStyle : {},
          },
          React.createElement(ChevronLeftIcon, { size: 16 })
        ),
        React.createElement(
          motion.button,
          {
            className: `mini-nav-button current-week ${
              isCurrentWeek ? "disabled" : ""
            }`,
            onClick: () => !isCurrentWeek && props.onWeekChange("current"),
            whileHover: !isCurrentWeek ? { scale: 1.1 } : {},
            whileTap: !isCurrentWeek ? { scale: 0.9 } : {},
            disabled: isCurrentWeek,
            title: isCurrentWeek
              ? "Đang ở tuần hiện tại"
              : "Quay về tuần hiện tại",
            style: isCurrentWeek ? disabledButtonStyle : {},
          },
          React.createElement(
            "svg",
            {
              width: "16",
              height: "16",
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: "currentColor",
              strokeWidth: "2",
            },
            React.createElement("circle", { cx: "12", cy: "12", r: "10" }),
            React.createElement("polyline", { points: "12 6 12 12 16 14" })
          )
        ),
        React.createElement(
          motion.button,
          {
            className: `mini-nav-button ${
              props.isNextDisabled ? "disabled" : ""
            }`,
            onClick: () => !props.isNextDisabled && props.onWeekChange("next"),
            whileHover: !props.isNextDisabled ? { scale: 1.1 } : {},
            whileTap: !props.isNextDisabled ? { scale: 0.9 } : {},
            disabled: props.isNextDisabled,
            title: "Tuần sau",
            style: props.isNextDisabled ? disabledButtonStyle : {},
          },
          React.createElement(ChevronRightIcon, { size: 16 })
        )
      )
  );
}

// Unified Schedule Content component
function ScheduleContent({ data, viewType }) {
  const currentDate = new Date();
  const initialWeek = getWeekNumber(currentDate);
  const [currentWeek, setCurrentWeek] = React.useState(initialWeek);
  const [currentYear, setCurrentYear] = React.useState(
    currentDate.getFullYear()
  );

  // Calculate min and max dates for available data
  const minDate = React.useMemo(() => {
    const now = new Date();
    const day = now.getDay();
    const mondayThisWeek = new Date(now);
    const diffToMonday = (day + 6) % 7;
    mondayThisWeek.setDate(now.getDate() - diffToMonday);
    mondayThisWeek.setHours(0, 0, 0, 0);

    mondayThisWeek.setDate(mondayThisWeek.getDate() - 7);
    return mondayThisWeek;
  }, []);

  const maxDate = React.useMemo(() => {
    const now = new Date();
    const day = now.getDay();
    const mondayThisWeek = new Date(now);
    const diffToMonday = (day + 6) % 7;
    mondayThisWeek.setDate(now.getDate() - diffToMonday);
    mondayThisWeek.setHours(0, 0, 0, 0);

    mondayThisWeek.setDate(mondayThisWeek.getDate() - 8 + 5 * 7);
    return mondayThisWeek;
  }, []);

  const handleWeekChange = (direction) => {
    if (direction === "current") {
      const now = new Date();
      setCurrentWeek(getWeekNumber(now));
      setCurrentYear(now.getFullYear());
      return;
    }

    let newWeek = currentWeek;
    let newYear = currentYear;
    if (direction === "next") {
      newWeek += 1;
      if (newWeek > 52) {
        newWeek = 1;
        newYear += 1;
      }
    } else {
      newWeek -= 1;
      if (newWeek < 1) {
        newWeek = 52;
        newYear -= 1;
      }
    }
    setCurrentWeek(newWeek);
    setCurrentYear(newYear);
  };

  const currentMonth =
    new Date(
      getWeekDates(currentWeek, currentYear)
        .days[0].date.split("/")
        .reverse()
        .join("-")
    ).getMonth() + 1;

  //Xử lý nút hiện tại
  const { days } = getWeekDates(currentWeek, currentYear);
  const firstDayOfWeek = new Date(days[0].date.split("/").reverse().join("-"));
  const lastDayOfWeek = new Date(days[6].date.split("/").reverse().join("-"));

  firstDayOfWeek.setHours(0, 0, 0, 0);
  lastDayOfWeek.setHours(0, 0, 0, 0);

  console.log("FirstDate: " + firstDayOfWeek);

  const isPrevDisabled = firstDayOfWeek <= minDate;
  const isNextDisabled = lastDayOfWeek >= maxDate;

  let statusText = "Không có dữ liệu";
  if (viewType === "all") {
    statusText = "Không có dữ liệu lịch học/thi.";
  } else if (viewType === "exams") {
    statusText = "Không có dữ liệu lịch thi.";
  } else {
    statusText = "Không có dữ liệu lịch học.";
  }

  return React.createElement(
    "div",
    { className: "schedule-content" },
    React.createElement(
      "div",
      { className: "schedule-layout" },
      React.createElement(WeekNavigation, {
        currentWeek,
        currentMonth,
        currentYear,
        isPrevDisabled,
        isNextDisabled,
        onWeekChange: handleWeekChange,
      }),
      React.createElement(
        "div",
        { className: "schedule-main-area" },
        React.createElement(
          motion.div,
          {
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: 0.3 },
            className: "schedule-table-wrapper full-height",
          },
          React.createElement(ScheduleTable, {
            data,
            currentWeek,
            currentYear,
          })
        )
      )
    )
  );
}

// Today Popup
function TodayClassesPopup({ isOpen, onClose, classes, exams }) {
  const [doNotShowAgain, setDoNotShowAgain] = React.useState(false);

  if (!isOpen) return null;

  const today = new Date();
  const dayNames = [
    "Chủ Nhật",
    "Thứ Hai",
    "Thứ Ba",
    "Thứ Tư",
    "Thứ Năm",
    "Thứ Sáu",
    "Thứ Bảy",
  ];
  const dayName = dayNames[today.getDay()];
  const dayFormatted = `${dayName}, ${today.getDate()}/${
    today.getMonth() + 1
  }/${today.getFullYear()}`;

  const handleClose = () => {
    onClose(doNotShowAgain);
  };

  return React.createElement(
    "div",
    { className: "today-popup-overlay" },
    React.createElement(
      motion.div,
      {
        className: "today-popup-container",
        initial: { opacity: 0, y: -50 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -50 },
        transition: { type: "spring", damping: 25, stiffness: 300 },
      },
      React.createElement(
        "div",
        { className: "today-popup-header" },
        React.createElement("h2", null, "Lịch học & thi hôm nay"),
        React.createElement(
          "button",
          {
            className: "today-popup-close",
            onClick: handleClose,
            "aria-label": "Đóng",
          },
          "×"
        )
      ),
      React.createElement(
        "div",
        { className: "today-popup-date" },
        React.createElement(
          "div",
          { className: "today-date-icon" },
          React.createElement(
            "svg",
            {
              width: "24",
              height: "24",
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: "currentColor",
              strokeWidth: "2",
            },
            React.createElement("rect", {
              x: "3",
              y: "4",
              width: "18",
              height: "18",
              rx: "2",
              ry: "2",
            }),
            React.createElement("line", {
              x1: "16",
              y1: "2",
              x2: "16",
              y2: "6",
            }),
            React.createElement("line", { x1: "8", y1: "2", x2: "8", y2: "6" }),
            React.createElement("line", {
              x1: "3",
              y1: "10",
              x2: "21",
              y2: "10",
            })
          )
        ),
        React.createElement("span", null, dayFormatted)
      ),
      classes.length === 0 && exams.length === 0
        ? React.createElement(
            "div",
            { className: "today-popup-no-classes" },
            React.createElement(
              "svg",
              {
                width: "64",
                height: "64",
                viewBox: "0 0 24 24",
                fill: "none",
                stroke: "currentColor",
                strokeWidth: "1",
                className: "today-no-classes-icon",
              },
              React.createElement("circle", { cx: "12", cy: "12", r: "10" }),
              React.createElement("path", { d: "M8 14s1.5 2 4 2 4-2 4-2" }),
              React.createElement("line", {
                x1: "9",
                y1: "9",
                x2: "9.01",
                y2: "9",
              }),
              React.createElement("line", {
                x1: "15",
                y1: "9",
                x2: "15.01",
                y2: "9",
              })
            ),
            React.createElement("p", null, "Hôm nay không có lịch học hoặc thi")
          )
        : React.createElement(
            "div",
            { className: "today-popup-content" },
            classes.length > 0 &&
              React.createElement(
                React.Fragment,
                null,
                React.createElement(
                  "div",
                  { className: "today-section-header" },
                  React.createElement(
                    "svg",
                    {
                      width: "18",
                      height: "18",
                      viewBox: "0 0 24 24",
                      fill: "none",
                      stroke: "currentColor",
                      strokeWidth: "2",
                      className: "today-section-icon",
                    },
                    React.createElement("path", {
                      d: "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z",
                    })
                  ),
                  React.createElement("h3", null, "Lịch học")
                ),
                React.createElement(
                  "div",
                  { className: "today-classes-list" },
                  classes.map((item, index) =>
                    React.createElement(
                      motion.div,
                      {
                        key: `today-class-${index}`,
                        className: "today-class-item",
                        initial: { opacity: 0, x: -20 },
                        animate: { opacity: 1, x: 0 },
                        transition: { delay: index * 0.1 },
                      },
                      React.createElement(
                        "div",
                        { className: "today-class-time" },
                        React.createElement(
                          "div",
                          { className: "today-time-indicator" },
                          React.createElement(
                            "svg",
                            {
                              width: "16",
                              height: "16",
                              viewBox: "0 0 24 24",
                              fill: "none",
                              stroke: "currentColor",
                              strokeWidth: "2",
                            },
                            React.createElement("circle", {
                              cx: "12",
                              cy: "12",
                              r: "10",
                            }),
                            React.createElement("polyline", {
                              points: "12 6 12 12 16 14",
                            })
                          )
                        ),
                        React.createElement(
                          "span",
                          null,
                          `${item.startTime} - ${item.endTime}`
                        )
                      ),
                      React.createElement(
                        "div",
                        { className: "today-class-details" },
                        React.createElement("h3", null, item.subject),
                        React.createElement(
                          "div",
                          { className: "today-class-info" },
                          React.createElement(
                            "span",
                            { className: "today-class-room" },
                            React.createElement(
                              "svg",
                              {
                                width: "14",
                                height: "14",
                                viewBox: "0 0 24 24",
                                fill: "none",
                                stroke: "currentColor",
                                strokeWidth: "2",
                              },
                              React.createElement("path", {
                                d: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
                              }),
                              React.createElement("polyline", {
                                points: "9 22 9 12 15 12 15 22",
                              })
                            ),
                            `Phòng: ${item.room}`
                          )
                        ),
                        React.createElement(
                          "div",
                          { className: "today-class-lesson" },
                          React.createElement(
                            "svg",
                            {
                              width: "14",
                              height: "14",
                              viewBox: "0 0 24 24",
                              fill: "none",
                              stroke: "currentColor",
                              strokeWidth: "2",
                            },
                            React.createElement("rect", {
                              x: "3",
                              y: "3",
                              width: "18",
                              height: "18",
                              rx: "2",
                              ry: "2",
                            }),
                            React.createElement("line", {
                              x1: "9",
                              y1: "9",
                              x2: "15",
                              y2: "9",
                            }),
                            React.createElement("line", {
                              x1: "9",
                              y1: "15",
                              x2: "15",
                              y2: "15",
                            }),
                            React.createElement("line", {
                              x1: "9",
                              y1: "12",
                              x2: "15",
                              y2: "12",
                            })
                          ),
                          item.lesson.replace("Tiết: ", "Tiết ")
                        )
                      )
                    )
                  )
                ),
                exams.length > 0 &&
                  React.createElement(
                    React.Fragment,
                    null,
                    React.createElement(
                      "div",
                      { className: "today-section-header today-exam-section" },
                      React.createElement(
                        "svg",
                        {
                          width: "18",
                          height: "18",
                          viewBox: "0 0 24 24",
                          fill: "none",
                          stroke: "currentColor",
                          strokeWidth: "2",
                          className: "today-section-icon",
                        },
                        React.createElement("path", {
                          d: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7",
                        }),
                        React.createElement("path", {
                          d: "M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
                        })
                      ),
                      React.createElement("h3", null, "Lịch thi")
                    ),
                    React.createElement(
                      "div",
                      { className: "today-classes-list" },
                      exams.map((item, index) =>
                        React.createElement(
                          motion.div,
                          {
                            key: `today-exam-${index}`,
                            className: "today-class-item today-exam-item",
                            initial: { opacity: 0, x: -20 },
                            animate: { opacity: 1, x: 0 },
                            transition: {
                              delay: (classes.length + index) * 0.1,
                            },
                          },
                          React.createElement(
                            "div",
                            { className: "today-class-time" },
                            React.createElement(
                              "div",
                              { className: "today-time-indicator exam-time" },
                              React.createElement(
                                "svg",
                                {
                                  width: "16",
                                  height: "16",
                                  viewBox: "0 0 24 24",
                                  fill: "none",
                                  stroke: "currentColor",
                                  strokeWidth: "2",
                                },
                                React.createElement("circle", {
                                  cx: "12",
                                  cy: "12",
                                  r: "10",
                                }),
                                React.createElement("polyline", {
                                  points: "12 6 12 12 16 14",
                                })
                              )
                            ),
                            React.createElement(
                              "span",
                              null,
                              `${item.startTime} - ${item.endTime}`
                            )
                          ),
                          React.createElement(
                            "div",
                            { className: "today-class-details" },
                            React.createElement("h3", null, item.subject),
                            React.createElement(
                              "div",
                              { className: "today-class-info" },
                              React.createElement(
                                "span",
                                { className: "today-class-room" },
                                React.createElement(
                                  "svg",
                                  {
                                    width: "14",
                                    height: "14",
                                    viewBox: "0 0 24 24",
                                    fill: "none",
                                    stroke: "currentColor",
                                    strokeWidth: "2",
                                  },
                                  React.createElement("path", {
                                    d: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
                                  }),
                                  React.createElement("polyline", {
                                    points: "9 22 9 12 15 12 15 22",
                                  })
                                ),
                                `Phòng: ${item.room}`
                              ),
                              React.createElement(
                                "span",
                                { className: "today-class-teacher" },
                                React.createElement(
                                  "svg",
                                  {
                                    width: "14",
                                    height: "14",
                                    viewBox: "0 0 24 24",
                                    fill: "none",
                                    stroke: "currentColor",
                                    strokeWidth: "2",
                                  },
                                  React.createElement("path", {
                                    d: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2",
                                  }),
                                  React.createElement("circle", {
                                    cx: "12",
                                    cy: "7",
                                    r: "4",
                                  })
                                ),
                                item.supervisor
                              )
                            ),
                            React.createElement(
                              "div",
                              { className: "today-class-lesson" },
                              React.createElement(
                                "svg",
                                {
                                  width: "14",
                                  height: "14",
                                  viewBox: "0 0 24 24",
                                  fill: "none",
                                  stroke: "currentColor",
                                  strokeWidth: "2",
                                },
                                React.createElement("rect", {
                                  x: "3",
                                  y: "3",
                                  width: "18",
                                  height: "18",
                                  rx: "2",
                                  ry: "2",
                                }),
                                React.createElement("line", {
                                  x1: "9",
                                  y1: "9",
                                  x2: "15",
                                  y2: "9",
                                }),
                                React.createElement("line", {
                                  x1: "9",
                                  y1: "15",
                                  x2: "15",
                                  y2: "15",
                                }),
                                React.createElement("line", {
                                  x1: "9",
                                  y1: "12",
                                  x2: "15",
                                  y2: "12",
                                })
                              ),
                              item.lesson.replace("Tiết: ", "Tiết ")
                            ),
                            React.createElement(
                              "div",
                              { className: "today-exam-badge" },
                              "Thi"
                            )
                          )
                        )
                      )
                    )
                  )
              ),
            React.createElement(
              "div",
              { className: "today-popup-footer" },
              React.createElement(
                "label",
                { className: "today-popup-checkbox" },
                React.createElement("input", {
                  type: "checkbox",
                  checked: doNotShowAgain,
                  onChange: (e) => setDoNotShowAgain(e.target.checked),
                }),
                React.createElement("span", { className: "checkmark" }),
                "Không hiển thị lại"
              ),
              React.createElement(
                motion.button,
                {
                  className: "today-popup-button",
                  onClick: handleClose,
                  whileHover: { scale: 1.05 },
                  whileTap: { scale: 0.95 },
                },
                "Đóng"
              )
            )
          )
    )
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(React.createElement(App));

// Add CSS to head
const todayPopupStyles = document.createElement("style");
todayPopupStyles.textContent = `
.today-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(3px);
}

.today-popup-container {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 550px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.today-popup-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e1e4e8;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #065f46 0%, #4966e7 100%);
  color: white;
}

.today-popup-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.today-popup-close {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.today-popup-close:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.today-popup-date {
  padding: 12px 20px;
  display: flex;
  align-items: center;
  background-color: #f7f9fc;
  border-bottom: 1px solid #e1e4e8;
  color: #444;
  font-weight: 500;
}

.today-date-icon {
  margin-right: 10px;
  color: #6366f1;
}

.today-popup-content {
  padding: 0;
  overflow-y: auto;
  max-height: 50vh;
}

.today-section-header {
  display: flex;
  align-items: center;
  padding: 10px 20px;
  background-color: #f0f4ff;
  border-bottom: 1px solid #e1e4e8;
}

.today-exam-section {
  background-color: #fff8f0;
  border-top: 1px solid #e1e4e8;
  margin-top: 5px;
}

.today-section-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #4b5563;
}

.today-section-icon {
  margin-right: 8px;
  color: #6366f1;
}

.today-exam-section .today-section-icon {
  color: #f59e0b;
}

.today-classes-list {
  padding: 0;
}

.today-class-item {
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: flex-start;
  transition: background-color 0.2s;
}

.today-class-item:hover {
  background-color: #f7f9fc;
}

.today-exam-item {
  background-color: #fff8f0;
}

.today-exam-item:hover {
  background-color: #fff4e6;
}

.today-class-time {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 16px;
  min-width: 80px;
}

.today-time-indicator {
  color: #6366f1;
  margin-bottom: 5px;
}

.exam-time {
  color: #f59e0b;
}

.today-class-time span {
  font-size: 0.85rem;
  color: #666;
  white-space: nowrap;
}

.today-class-details {
  flex: 1;
  position: relative;
}

.today-class-details h3 {
  margin: 0 0 8px 0;
  font-size: 1rem;
  color: #333;
  padding-right: 40px;
}

.today-class-info {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 5px;
}

.today-class-room, .today-class-teacher {
  display: flex;
  align-items: center;
}

.today-class-room svg, .today-class-teacher svg {
  margin-right: 5px;
  opacity: 0.7;
}

.today-class-lesson {
  font-size: 0.8rem;
  color: #6b7280;
  display: flex;
  align-items: center;
}

.today-class-lesson svg {
  margin-right: 5px;
  opacity: 0.7;
}

.today-exam-badge {
  position: absolute;
  top: 0;
  right: 0;
  background-color: #f59e0b;
  color: white;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 12px;
}

.today-popup-footer {
  padding: 16px 20px;
  border-top: 1px solid #e1e4e8;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f7f9fc;
}

.today-popup-checkbox {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  color: #555;
  cursor: pointer;
  user-select: none;
  position: relative;
  padding-left: 30px;
}

.today-popup-checkbox input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkmark {
  position: absolute;
  top: 0;
  left: 0;
  height: 20px;
  width: 20px;
  background-color: #fff;
  border: 2px solid #d1d5db;
  border-radius: 4px;
}

.today-popup-checkbox:hover input ~ .checkmark {
  border-color: #818cf8;
}

.today-popup-checkbox input:checked ~ .checkmark {
  background-color: #6366f1;
  border-color: #6366f1;
}

.checkmark:after {
  content: "";
  position: absolute;
  display: none;
}

.today-popup-checkbox input:checked ~ .checkmark:after {
  display: block;
  left: 6px;
  top: 2px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.today-popup-button {
  background-color: #6366f1;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.today-popup-button:hover {
  background-color: #4f46e5;
}

.today-popup-no-classes {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px;
  color: #666;
  text-align: center;
}

.today-no-classes-icon {
  color: #d1d5db;
  margin-bottom: 16px;
}

.settings-button {
  margin-right: 8px;
  padding: 6px;
  height: 32px;
  width: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
}

.settings-button svg {
  color: #666;
}

.settings-button:hover svg {
  color: #4f46e5;
}

.settings-button.active {
  background-color: #6366f1;
}

.settings-button.active svg {
  color: #fff;
}

.settings-title {
  font-size: 1.1rem;
  font-weight: 500;
  color: #444;
}

.settings-container {
  max-width: 800px;
  margin: 20px auto;
  padding: 0 20px;
}

.settings-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 24px;
  margin-bottom: 20px;
}

.settings-section-title {
  margin: 0 0 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e7eb;
  font-size: 1.1rem;
  color: #374151;
  display: flex;
  align-items: center;
}

.settings-section-icon {
  margin-right: 8px;
  color: #6366f1;
}

.settings-option {
  display: flex;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid #f3f4f6;
}

.settings-option:last-child {
  border-bottom: none;
}

.settings-switch {
  position: relative;
  display: inline-block;
  width: 46px;
  height: 24px;
  margin-right: 16px;
  flex-shrink: 0;
}

.settings-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.switch-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 24px;
}

.switch-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .switch-slider {
  background-color: #6366f1;
}

input:checked + .switch-slider:before {
  transform: translateX(22px);
}

.settings-option-text {
  flex: 1;
}

.settings-option-title {
  font-weight: 500;
  color: #374151;
  margin-bottom: 2px;
}

.settings-option-description {
  font-size: 0.85rem;
  color: #6b7280;
}

.settings-range {
  flex-direction: column;
  align-items: flex-start;
}

.settings-range .settings-option-text {
  margin-bottom: 12px;
  width: 100%;
}

.settings-slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #e5e7eb;
  outline: none;
  -webkit-appearance: none;
}

.settings-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #6366f1;
  cursor: pointer;
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-top: 6px;
  font-size: 0.75rem;
  color: #6b7280;
}

.settings-actions {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}

.settings-save-button {
  background-color: #6366f1;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 20px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.2s;
}

.settings-save-button:hover {
  background-color: #4f46e5;
}

.settings-save-button:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.settings-save-button.success {
  background-color: #10b981;
}

.settings-info {
  text-align: center;
  color: #6b7280;
  font-size: 0.85rem;
  margin-top: 40px;
}

.settings-info p {
  margin: 5px 0;
}

@media (max-width: 640px) {
  .today-popup-container {
    width: 95%;
  }
  
  .today-class-time {
    min-width: 60px;
  }
  
  .today-popup-footer {
    flex-direction: column;
    gap: 16px;
  }

  .settings-container {
    padding: 0 12px;
  }
  
  .settings-card {
    padding: 16px;
  }
  
  .settings-option {
    padding: 12px 0;
  }
}
`;
document.head.appendChild(todayPopupStyles);
