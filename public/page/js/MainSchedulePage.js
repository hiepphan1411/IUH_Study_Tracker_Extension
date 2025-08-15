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
    15: "19:30",
    16: "20:20",
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
    "19:30": 15,
    "20:20": 16,
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
          ["schedule_json", "schedule_timestamp"],
          function (res) {
            if (chrome.runtime.lastError) {
              console.error("Lỗi Chrome Storage:", chrome.runtime.lastError);
              resolve({ schedule_json: null });
              return;
            }

            resolve(res);
          }
        );
      });

      const scheduleJson = result.schedule_json;

      if (scheduleJson) {
        const parsedData = JSON.parse(scheduleJson);
        console.log(parsedData);
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
            // classCode: "420301767823",
            lesson: item.time || item.lesson || "",
            isExam: true,
          };
        });

        // console.log("Transformed classes:", transformedClasses);
        // console.log("Transformed exams:", transformedExams);
        setScheduleData({
          classes: transformedClasses,
          exams: transformedExams,
        });
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

  return React.createElement(
    "div",
    { className: "app-container" },
    React.createElement(ModernHeader, {
      currentView: currentView,
      onViewChange: setCurrentView,
      onBackClick: handleBackToPortal,
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
        : React.createElement(ScheduleContent, {
            data: getDisplayData(),
            viewType: currentView,
          })
    ),
    React.createElement(ConfirmationDialog, {
      isOpen: isConfirmDialogOpen,
      onClose: () => setIsConfirmDialogOpen(false),
      onConfirm: () => window.close(),
    })
  );
}

// Modern Header Component
function ModernHeader({ currentView, onViewChange, onBackClick }) {
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
      )
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
  return React.createElement(
    motion.div,
    {
      className: `class-item ${props.item.isExam ? "exam-item" : ""}`,
      style: {
        borderLeft: `3px solid ${props.item.isExam ? "#f59e0b" : "#3b82f6"}`,
      },
      whileHover: { scale: 1.02 },
      transition: { duration: 0.2 },
    },
    React.createElement(
      "div",
      { className: "class-subject" },
      `${props.item.subject || "Không xác định"}`
    ),
    React.createElement(
      "div",
      { className: "class-name" },
      `${props.item.className || "N/A"}`
    ),
    React.createElement(
      "div",
      { className: "class-lesson" },
      `${props.item.lesson || "N/A"}`
    ),
    React.createElement(
      "div",
      { className: "class-time" },
      `Thời gian: ${props.item.startTime || "N/A"} - ${
        props.item.endTime || "N/A"
      }`
    ),
    React.createElement(
      "div",
      { className: "class-room" },
      `Phòng: ${props.item.room || "N/A"}`
    ),
    React.createElement(
      "div",
      { className: "class-teacher" },
      `GV: ${props.item.supervisor || "Không xác định"}`
    )
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

    // console.log(
    //   "Extracted startTiet for item:",
    //   startTiet,
    //   "isExam:",
    //   item.isExam,
    //   "original lesson:",
    //   item.lesson
    // );

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

  // Calculate the current week number to compare with props.currentWeek
  const now = new Date();
  const currentWeekNumber = getWeekNumber(now);
  const currentYear = now.getFullYear();

  // Check if we're on the current week
  const isCurrentWeek =
    props.currentWeek === currentWeekNumber &&
    props.currentYear === currentYear;

  // Styles for disabled buttons
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
    console.log("minDate: " + mondayThisWeek);
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
    console.log("MaxDate: " + mondayThisWeek);
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

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(React.createElement(App));
