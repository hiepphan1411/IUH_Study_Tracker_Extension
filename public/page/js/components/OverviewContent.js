const {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
  LineChart,
  Line,
  PieChart,
  Pie,
} = window.Recharts || {};

const COLORS = ["#059669", "#8B5CF6", "#059669", "#8B5CF6", "#059669"];
const PIE_COLORS = ["#6366F1", "#8B5CF6", "#EC4899"];

function SubjectGradeStatistic({ subjects }) {
  const [selectedSemester, setSelectedSemester] = React.useState("all");
  const [selectedScale, setSelectedScale] = React.useState("10");

  const semesters = React.useMemo(() => {
    const availableSemesters = [
      ...new Set(subjects.map((subject) => subject.semester)),
    ];
    const semesterOptions = [
      { value: "all", label: "Tất cả học kỳ" },
      ...availableSemesters.map((semester) => ({
        value: semester,
        label: semester.replace("_", " ").replace("-", "-"),
      })),
    ];
    return semesterOptions;
  }, [subjects]);

  const convertGrade = (grade, targetScale) => {
    if (targetScale === "4") {
      if (grade >= 9) return 4.0;
      if (grade >= 8.5) return 3.8;
      if (grade >= 8) return 3.5;
      if (grade >= 7) return 3;
      return 0.0;
    }
    return grade;
  };

  const subjectData = React.useMemo(() => {
    if (!subjects || subjects.length === 0) {
      return [];
    }

    let filteredSubjects = subjects;
    if (selectedSemester !== "all") {
      filteredSubjects = subjects.filter(
        (subject) => subject.semester === selectedSemester
      );
    }

    return filteredSubjects.map((subject) => ({
      name: subject.subject,
      value: convertGrade(subject.grade, selectedScale),
    }));
  }, [subjects, selectedSemester, selectedScale]);

  const hasData = subjectData.length > 0;
  const selectedSemesterLabel =
    semesters.find((s) => s.value === selectedSemester)?.label ||
    selectedSemester;

  const getYAxisDomain = () => {
    return selectedScale === "4" ? [0, 4] : [0, 10];
  };

  const getTooltipFormatter = () => {
    const unit = selectedScale === "4" ? "điểm (thang 4)" : "điểm (thang 10)";
    return (value) => [`${value} ${unit}`, "Điểm số"];
  };

  return React.createElement(
    motion.div,
    {
      className: "chart-container",
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { delay: 0.4 },
    },
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          flexWrap: "wrap",
          gap: "10px",
        },
      },
      React.createElement(
        "h2",
        {
          className: "card-title",
          style: { margin: 0 },
        },
        "Thống kê điểm số theo môn học"
      ),
      React.createElement(
        "div",
        {
          style: {
            display: "flex",
            gap: "15px",
            alignItems: "center",
            flexWrap: "wrap",
          },
        },
        React.createElement(
          "div",
          {
            style: { display: "flex", flexDirection: "column", gap: "5px" },
          },
          React.createElement(
            "label",
            {
              style: {
                fontSize: "12px",
                color: "#9CA3AF",
                fontWeight: "500",
              },
            },
            "Học kỳ:"
          ),
          React.createElement(
            "select",
            {
              value: selectedSemester,
              onChange: (e) => setSelectedSemester(e.target.value),
              style: {
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                backgroundColor: "#ffffff",
                color: "#374151",
                fontSize: "14px",
                fontWeight: "500",
                minWidth: "100px",
                cursor: "pointer",
                transition: "all 0.3s ease",
              },
            },
            semesters.map((semester) =>
              React.createElement(
                "option",
                {
                  key: semester.value,
                  value: semester.value,
                },
                semester.label
              )
            )
          )
        ),
        React.createElement(
          "div",
          {
            style: { display: "flex", flexDirection: "column", gap: "5px" },
          },
          React.createElement(
            "label",
            {
              style: {
                fontSize: "12px",
                color: "#9CA3AF",
                fontWeight: "500",
              },
            },
            "Thang điểm:"
          ),
          React.createElement(
            "select",
            {
              value: selectedScale,
              onChange: (e) => setSelectedScale(e.target.value),
              style: {
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                backgroundColor: "#ffffff",
                color: "#374151",
                fontSize: "14px",
                fontWeight: "500",
                minWidth: "100px",
                cursor: "pointer",
                transition: "all 0.3s ease",
              },
            },
            React.createElement("option", { value: "10" }, "Thang 10"),
            React.createElement("option", { value: "4" }, "Thang 4")
          )
        )
      )
    ),
    React.createElement(
      "div",
      {
        style: {
          height: "400px",
          width: "100%",
          minHeight: "300px",
          maxHeight: "600px",
          overflow: "hidden",
        },
      },
      hasData
        ? React.createElement(
            ResponsiveContainer,
            {
              width: "98%",
              height: "100%",
              minWidth: 0,
            },
            React.createElement(
              BarChart,
              {
                data: subjectData,
                margin: { top: 20, right: 30, left: 20, bottom: 60 },
              },
              React.createElement(CartesianGrid, {
                strokeDasharray: "3 3",
                stroke: "#4B5563",
              }),
              React.createElement(XAxis, {
                dataKey: "name",
                stroke: "#9CA3AF",
                fontSize: 12,
                angle: -45,
                textAnchor: "end",
                height: 80,
                interval: 0,
              }),
              React.createElement(YAxis, {
                stroke: "#9CA3AF",
                domain: getYAxisDomain(),
                fontSize: 12,
              }),
              React.createElement(Tooltip, {
                contentStyle: {
                  backgroundColor: "rgba(31, 41, 55, 0.8)",
                  borderColor: "#4B5563",
                  borderRadius: "8px",
                },
                itemStyle: { color: "#E5E7EB" },
                formatter: getTooltipFormatter(),
              }),
              React.createElement(Legend),
              React.createElement(Bar, {
                dataKey: "value",
                name: `Điểm số (thang ${selectedScale})`,
                fill: "#059669",
              })
            )
          )
        : React.createElement(
            "div",
            {
              style: {
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                color: "#9CA3AF",
                textAlign: "center",
              },
            },
            React.createElement(
              "div",
              {
                style: {
                  fontSize: "48px",
                  marginBottom: "16px",
                  opacity: 0.5,
                },
              },
              "📊"
            ),
            React.createElement(
              "h3",
              {
                style: {
                  fontSize: "18px",
                  marginBottom: "8px",
                  color: "#D1D5DB",
                },
              },
              "Không có dữ liệu"
            ),
            React.createElement(
              "p",
              {
                style: {
                  fontSize: "14px",
                  opacity: 0.8,
                },
              },
              selectedSemester === "all"
                ? "Chưa có dữ liệu điểm số nào."
                : `Không có dữ liệu cho ${selectedSemesterLabel}.`
            ),
            selectedSemester !== "all" &&
              React.createElement(
                "button",
                {
                  onClick: () => setSelectedSemester("all"),
                  style: {
                    marginTop: "12px",
                    padding: "8px 16px",
                    backgroundColor: "#6366F1",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "14px",
                  },
                },
                "Xem tất cả học kỳ"
              )
          )
    )
  );
}

function StatisticsResultsBySemester({ results }) {
  const [semesterData, setSemesterData] = React.useState([]);
  const [selectedScale, setSelectedScale] = React.useState("10");

  const convertGrade = (grade, targetScale) => {
    if (targetScale === "4") {
      if (grade >= 9) return 4.0;
      if (grade >= 8.5) return 3.8;
      if (grade >= 8) return 3.5;
      if (grade >= 7) return 3;
      return 0.0;
    }
    return grade;
  };

  React.useEffect(() => {
    if (!results || !results.length) return;

    const semesterAverages = {};

    results.forEach((result) => {
      const semester = result.semester;
      if (!semesterAverages[semester]) {
        semesterAverages[semester] = {
          total: 0,
          count: 0,
          name: semester,
        };
      }

      semesterAverages[semester].total += convertGrade(
        result.grade,
        selectedScale
      );
      semesterAverages[semester].count++;
    });

    const formattedData = Object.values(semesterAverages).map((semester) => ({
      name: semester.name
        .replace("HK1_2022-2023", "HK1(22-23)")
        .replace("HK2_2022-2023", "HK2(22-23)")
        .replace("HK1_2023-2024", "HK1(23-24)")
        .replace("HK2_2023-2024", "HK2(23-24)"),
      average: parseFloat((semester.total / semester.count).toFixed(2)),
    }));

    formattedData.sort((a, b) => {
      const yearA = a.name.includes("22") ? 2022 : 2023;
      const yearB = b.name.includes("22") ? 2022 : 2023;
      const semA = a.name.includes("HK1") ? 1 : 2;
      const semB = b.name.includes("HK1") ? 1 : 2;

      if (yearA !== yearB) return yearA - yearB;
      return semA - semB;
    });

    setSemesterData(formattedData);
  }, [results, selectedScale]);

  const getYAxisDomain = () => {
    return selectedScale === "4" ? [0, 4] : [0, 10];
  };

  const getTooltipFormatter = () => {
    const unit = selectedScale === "4" ? "điểm (thang 4)" : "điểm (thang 10)";
    return (value) => [`${value} ${unit}`, "Điểm trung bình"];
  };

  return React.createElement(
    motion.div,
    {
      className: "chart-container",
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { delay: 0.2 },
    },
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          flexWrap: "wrap",
          gap: "10px",
        },
      },
      React.createElement(
        "h2",
        {
          className: "card-title ",
          style: { margin: 0 },
        },
        "Thống kê kết quả theo học kỳ"
      ),
      React.createElement(
        "div",
        {
          style: { display: "flex", flexDirection: "column", gap: "5px" },
        },
        React.createElement(
          "label",
          {
            style: {
              fontSize: "12px",
              color: "#6b7280",
              fontWeight: "600",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            },
          },
          "Thang điểm:"
        ),
        React.createElement(
          "select",
          {
            value: selectedScale,
            onChange: (e) => setSelectedScale(e.target.value),
            style: {
              padding: "8px 12px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              backgroundColor: "#ffffff",
              color: "#374151",
              fontSize: "14px",
              fontWeight: "500",
              minWidth: "100px",
              cursor: "pointer",
              transition: "all 0.3s ease",
            },
          },
          React.createElement("option", { value: "10" }, "Thang 10"),
          React.createElement("option", { value: "4" }, "Thang 4")
        )
      )
    ),
    React.createElement(
      "div",
      {
        className: "chart-content",
        style: { height: "320px" },
      },
      semesterData.length > 0
        ? React.createElement(
            ResponsiveContainer,
            { width: "100%", height: "100%" },
            React.createElement(
              LineChart,
              { data: semesterData },
              React.createElement(CartesianGrid, {
                strokeDasharray: "3 3",
                stroke: "#e5e7eb",
              }),
              React.createElement(XAxis, {
                dataKey: "name",
                stroke: "#6b7280",
              }),
              React.createElement(YAxis, {
                stroke: "#6b7280",
                domain: getYAxisDomain(),
              }),
              React.createElement(Tooltip, {
                contentStyle: {
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  borderColor: "#d1d5db",
                  borderRadius: "8px",
                  boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                },
                itemStyle: { color: "#374151" },
                formatter: getTooltipFormatter(),
              }),
              React.createElement(Line, {
                type: "monotone",
                dataKey: "average",
                stroke: "#059669",
                strokeWidth: 3,
                dot: { fill: "#059669", strokeWidth: 2, r: 6 },
                activeDot: { r: 8, strokeWidth: 2 },
                name: `Điểm trung bình (thang ${selectedScale})`,
              })
            )
          )
        : React.createElement(
            "div",
            {
              className: "no-data-container",
              style: { height: "100%" },
            },
            React.createElement("p", null, "Không có dữ liệu để hiển thị")
          )
    )
  );
}

function SubjectResultStatistics({ subjects }) {
  const countSubjectsByGrade = () => {
    if (!subjects || subjects.length === 0) {
      return [];
    }

    const counts = {
      A: 0,
      B: 0,
      C: 0,
    };

    subjects.forEach((subject) => {
      if (subject.grade >= 8.5) counts.A++;
      else if (subject.grade >= 7.0) counts.B++;
      else counts.C++;
    });

    const data = [
      { name: "Giỏi (A)", value: counts.A },
      { name: "Khá (B)", value: counts.B },
      { name: "Trung bình (C)", value: counts.C },
    ];

    return data.filter((item) => item.value > 0);
  };

  const subjectData = countSubjectsByGrade();

  return React.createElement(
    motion.div,
    {
      className: "chart-container",
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { delay: 0.3 },
    },
    React.createElement(
      "h2",
      { className: "card-title" },
      "Thống kê tổng quan kết quả môn học"
    ),
    React.createElement(
      "div",
      {
        className: "chart-content",
        style: { height: "320px" },
      },
      subjectData.length > 0
        ? React.createElement(
            ResponsiveContainer,
            { width: "100%", height: "100%" },
            React.createElement(
              PieChart,
              null,
              React.createElement(
                Pie,
                {
                  data: subjectData,
                  cx: "50%",
                  cy: "50%",
                  labelLine: false,
                  outerRadius: 80,
                  fill: "#8884d8",
                  dataKey: "value",
                  label: ({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`,
                },
                subjectData.map((entry, index) =>
                  React.createElement(Cell, {
                    key: `cell-${index}`,
                    fill: ["#059669", "#10b981", "#34d399"][index % 3],
                  })
                )
              ),
              React.createElement(Tooltip, {
                contentStyle: {
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  borderColor: "#d1d5db",
                  borderRadius: "8px",
                  boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                },
                itemStyle: { color: "#374151" },
                formatter: (value) => [`${value} môn học`, null],
              }),
              React.createElement(Legend)
            )
          )
        : React.createElement(
            "div",
            {
              className: "no-data-container",
              style: { height: "100%" },
            },
            React.createElement("p", null, "Không có dữ liệu để hiển thị")
          )
    )
  );
}

function OverviewPageContent() {
  const [loading, setLoading] = React.useState(true);
  const [subjects, setSubjects] = React.useState([]);
  const [results, setResults] = React.useState([]);

  React.useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const subjectsData = [
          {
            subject: "Lập trình phân tán với Công nghệ Java",
            grade: 9,
            semester: "HK1_2022-2023",
          },
          {
            subject: "Hệ thống và Công nghệ Web",
            grade: 9.5,
            semester: "HK1_2022-2023",
          },
          { subject: "Cơ sở dữ liệu", grade: 8.5, semester: "HK2_2022-2023" },
          { subject: "Mạng máy tính", grade: 7.5, semester: "HK2_2022-2023" },
          {
            subject: "Phát triển ứng dụng Web",
            grade: 8.0,
            semester: "HK1_2023-2024",
          },
          {
            subject: "Trí tuệ nhân tạo",
            grade: 9.2,
            semester: "HK1_2023-2024",
          },
        ];

        setSubjects(subjectsData);
        setResults(subjectsData);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return React.createElement(
    "div",
    { className: "page-content" },
    loading
      ? React.createElement(
          "div",
          { className: "loading" },
          React.createElement("div", { className: "spinner" }),
          React.createElement(
            "span",
            { className: "loading-text" },
            "Đang tải dữ liệu..."
          )
        )
      : React.createElement(
          "div",
          { className: "dashboard-grid" },
          React.createElement(
            "div",
            {
              className: "dashboard-row",
              style: {
                display: "flex",
                gap: "20px",
                marginBottom: "20px",
                flexWrap: "wrap",
              },
            },
            React.createElement(
              "div",
              {
                className: "card dashboard-item",
                style: { flex: "1", minWidth: "400px" },
              },
              React.createElement(StatisticsResultsBySemester, {
                results: results,
              })
            ),
            React.createElement(
              "div",
              {
                className: "card dashboard-item",
                style: { flex: "1", minWidth: "400px" },
              },
              React.createElement(SubjectResultStatistics, {
                subjects: subjects,
              })
            )
          ),
          React.createElement(
            "div",
            { className: "card" },
            React.createElement(SubjectGradeStatistic, { subjects: subjects })
          )
        )
  );
}

window.SubjectGradeStatistic = SubjectGradeStatistic;
window.StatisticsResultsBySemester = StatisticsResultsBySemester;
window.SubjectResultStatistics = SubjectResultStatistics;
window.OverviewPageContent = OverviewPageContent;
window.StatisticsResultsBySemester = StatisticsResultsBySemester;
window.SubjectResultStatistics = SubjectResultStatistics;
window.OverviewPageContent = OverviewPageContent;
