/* eslint-disable no-undef */
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

//Thống kê điểm số theo môn học
function SubjectGradeStatistic({ subjects }) {
  const [selectedSemester, setSelectedSemester] = React.useState("all");
  const [selectedScale, setSelectedScale] = React.useState("10");

  const semesters = React.useMemo(() => {
    if (!subjects || subjects.length === 0)
      return [{ value: "all", label: "Tất cả học kỳ" }];

    const availableSemesters = subjects.map((hocKy) => hocKy.hocKy);
    const semesterOptions = [
      { value: "all", label: "Tất cả học kỳ" },
      ...availableSemesters.map((semester) => ({
        value: semester,
        label: semester
          .replace(/HK(\d+) \((\d{4}) - (\d{4})\)/, "HK$1($2-$3)")
          .replace(/(\d{4})/g, (match) => match.slice(-2)),
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
        (hocKy) => hocKy.hocKy === selectedSemester
      );
    }

    const subjectList = [];
    filteredSubjects.forEach((hocKy) => {
      hocKy.monHoc.forEach((monHoc) => {
        const tenMonHoc = monHoc["Tên môn học"];
        const diemTongKet = monHoc["Điểm tổng kết"];
        const thangDiem4 = monHoc["Thang điểm 4"];

        if (
          tenMonHoc &&
          tenMonHoc.trim() !== "" &&
          diemTongKet &&
          diemTongKet.trim() !== ""
        ) {
          let grade = 0;
          if (selectedScale === "10") {
            grade = parseFloat(diemTongKet.replace(",", "."));
          } else {
            grade = thangDiem4
              ? parseFloat(thangDiem4.replace(",", "."))
              : convertGrade(parseFloat(diemTongKet.replace(",", ".")), "4");
          }

          subjectList.push({
            name: tenMonHoc,
            value: grade || 0,
          });
        }
      });
    });

    return subjectList.filter((item) => item.value > 0);
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
            semesters.map((semester, index) =>
              React.createElement(
                "option",
                {
                  key: semester.value || `semester-${index}`,
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
//Thống kê kết quả theo học kỳ
function StatisticsResultsBySemester({ results }) {
  const [semesterData, setSemesterData] = React.useState([]);
  const [selectedScale, setSelectedScale] = React.useState("10");

  // const convertGrade = (grade, targetScale) => {
  //   if (targetScale === "4") {
  //     if (grade >= 9) return 4.0;
  //     if (grade >= 8.5) return 3.8;
  //     if (grade >= 8) return 3.5;
  //     if (grade >= 7) return 3;
  //     return 0.0;
  //   }
  //   return grade;
  // };

  React.useEffect(() => {
    if (!results || !results.length) return;

    const formattedData = results
      .map((hocKy) => {
        const semester = hocKy.hocKy;

        const avgRow = hocKy.monHoc.find(
          (mon) => mon.STT && mon.STT.includes("Điểm trung bình học kỳ hệ")
        );

        let average = 0;

        if (avgRow) {
          if (selectedScale === "10") {
            const match = avgRow.STT.match(
              /Điểm trung bình học kỳ hệ 10: ([\d,]+)/
            );
            if (match) {
              average = parseFloat(match[1].replace(",", "."));
            }
          } else {
            const match = avgRow["Mã lớp học phần"].match(
              /Điểm trung bình học kỳ hệ 4: ([\d,]+)/
            );
            if (match) {
              average = parseFloat(match[1].replace(",", "."));
            }
          }
        }

        const shortenedName = semester
          .replace(/HK(\d+) \((\d{4}) - (\d{4})\)/, "HK$1($2-$3)")
          .replace(/(\d{4})/g, (match) => match.slice(-2));

        return {
          name: shortenedName,
          fullName: semester,
          average: average || 0,
        };
      })
      .filter((item) => item.average > 0);

    formattedData.sort((a, b) => {
      const extractSemesterInfo = (name) => {
        const match = name.match(/HK(\d+) \((\d{4}) - (\d{4})\)/);
        if (match) {
          return {
            semester: parseInt(match[1]),
            year: parseInt(match[2]),
          };
        }
        return { semester: 0, year: 0 };
      };

      const aInfo = extractSemesterInfo(a.fullName);
      const bInfo = extractSemesterInfo(b.fullName);

      if (aInfo.year !== bInfo.year) return aInfo.year - bInfo.year;
      return aInfo.semester - bInfo.semester;
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

//Thống kê tổng quan kết quả môn học
function SubjectResultStatistics({ subjects }) {
  const countSubjectsByGrade = () => {
    if (!subjects || subjects.length === 0) {
      return [];
    }

    const counts = countGradesByLetter(subjects);

    const gradeMapping = [
      { key: "A+", name: "Xuất sắc (A+)", color: "#059669" },
      { key: "A", name: "Giỏi (A)", color: "#10b981" },
      { key: "B+", name: "Khá giỏi (B+)", color: "#34d399" },
      { key: "B", name: "Khá (B)", color: "#60a5fa" },
      { key: "C+", name: "Trung bình khá (C+)", color: "#fbbf24" },
      { key: "C", name: "Trung bình (C)", color: "#f59e0b" },
      { key: "D+", name: "Trung bình yếu (D+)", color: "#f97316" },
      { key: "D", name: "Yếu (D)", color: "#ef4444" },
      { key: "F", name: "Kém (F)", color: "#dc2626" },
    ];

    const data = gradeMapping
      .map((grade) => ({
        name: grade.name,
        value: counts[grade.key] || 0,
        color: grade.color,
        grade: grade.key,
      }))
      .filter((item) => item.value > 0);

    return data;
  };

  const subjectData = countSubjectsByGrade();

  const totalSubjects = subjectData.reduce((sum, item) => sum + item.value, 0);

  return React.createElement(
    motion.div,
    {
      className: "chart-container",
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { delay: 0.3 },
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
        { className: "card-title", style: { margin: 0 } },
        "Thống kê tổng quan kết quả môn học"
      ),
      totalSubjects > 0 &&
        React.createElement(
          "div",
          {
            style: {
              fontSize: "14px",
              color: "#6b7280",
              fontWeight: "500",
              backgroundColor: "#f3f4f6",
              padding: "8px 12px",
              borderRadius: "6px",
            },
          },
          `Tổng: ${totalSubjects} môn học`
        )
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
                  label: ({ name, percent, value }) =>
                    `${name}: ${value} (${(percent * 100).toFixed(0)}%)`,
                },
                subjectData.map((entry, index) =>
                  React.createElement(Cell, {
                    key: `cell-${entry.grade}-${index}`,
                    fill: entry.color,
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
                formatter: (value, name, props) => [
                  `${value} môn học (${((value / totalSubjects) * 100).toFixed(
                    1
                  )}%)`,
                  name,
                ],
              }),
              React.createElement(Legend, {
                verticalAlign: "bottom",
                height: 36,
                iconType: "circle",
                wrapperStyle: {
                  fontSize: "12px",
                  color: "#6b7280",
                },
              })
            )
          )
        : React.createElement(
            "div",
            {
              className: "no-data-container",
              style: {
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "#9ca3af",
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
                  color: "#d1d5db",
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
              "Chưa có dữ liệu điểm chữ để hiển thị thống kê."
            )
          )
    )
  );
}
function countGradesByLetter(data) {
  const counts = {};

  data.forEach((hocKy) => {
    hocKy.monHoc.forEach((monHoc) => {
      const tenMonHoc = monHoc["Tên môn học"];
      const diemChu = monHoc["Điểm chữ"];

      if (
        tenMonHoc &&
        tenMonHoc.trim() !== "" &&
        diemChu &&
        diemChu.trim() !== ""
      ) {
        if (!counts[diemChu]) {
          counts[diemChu] = 0;
        }
        counts[diemChu]++;
      }
    });
  });

  return counts;
}

function OverviewPageContent() {
  const [loading, setLoading] = React.useState(true);
  const [subjects, setSubjects] = React.useState([]);
  const [results, setResults] = React.useState([]);

  React.useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const result = await new Promise((resolve) => {
          chrome.storage.local.get(
            ["diem_json", "diem_timestamp"],
            function (res) {
              if (chrome.runtime.lastError) {
                console.error("Lỗi khi lấy dữ liệu:", chrome.runtime.lastError);
                resolve({ diem_json: null });
                return;
              }
              resolve(res);
            }
          );
        });

        //Test lấy chương trình khung
        chrome.storage.local.get(
          ["curriculum_json", "curriculum_timestamp"],
          function (result) {
            if (chrome.runtime.lastError) {
              console.error("Lỗi lấy dữ liệu:", chrome.runtime.lastError);
              return;
            }

            if (result.curriculum_json) {
              const curriculumData = JSON.parse(result.curriculum_json);
              const timestamp = result.curriculum_timestamp;
            } else {
              console.log("Không có dữ liệu chương trình khung trong storage");
            }
          }
        );

        const diemJson = result.diem_json;

        if (diemJson) {
          const parsedData = JSON.parse(diemJson);

          const transformedSubjects = parsedData;

          // console.log("Result: ", transformedSubjects);
          // console.log("Thống kê: ", countGradesByLetter(transformedSubjects));

          setSubjects(transformedSubjects);
          setResults(transformedSubjects);
        } else {
          console.warn("Không có dữ liệu điểm được lưu.");
          setSubjects([]);
          setResults([]);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        setSubjects([]);
        setResults([]);
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
