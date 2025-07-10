function StudyPlanPageContent({ keyValue }) {
  const [subjects, setSubjects] = React.useState([]);
  const [results, setResults] = React.useState([]);
  const [isLoading, setLoading] = React.useState(false);
  const [summary, setSummnary] = React.useState({
    totalCredits: 0,
    cumulativeGPA: 0.0,
    cumulativeGPA4: 0.0,
    totalSubjects: 0,
    remaining: 0,
    currentRanking: "",
  });

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

        const diemJson = result.diem_json;

        if (diemJson) {
          const parsedData = JSON.parse(diemJson);

          console.log(parsedData);
          const allSubjects = parsedData.flatMap((item) => item.monHoc);

          //Array các môn đạt, hoặc không F
          const passedSubjects = allSubjects.filter(
            (item) => item["Đạt"] === "Đạt" || item["Xếp loại"] !== "F"
          );

          //Tổng tín chỉ đã học
          const totalCredits = passedSubjects.reduce(
            (sum, item) => sum + (parseFloat(item["Tín chỉ"]) || 0),
            0
          );

          // Trung bình điểm tích lũy (10)
          const gpaSubjects = passedSubjects.filter(
            (mh) => mh["Điểm tổng kết"] && mh["Tín chỉ"]
          );
          const cumulativeGPA =
            gpaSubjects.length > 0
              ? (
                  gpaSubjects.reduce(
                    (sum, mh) =>
                      sum +
                      (parseFloat(mh["Điểm tổng kết"].replace(",", ".")) || 0) *
                        (parseFloat(mh["Tín chỉ"]) || 0),
                    0
                  ) / totalCredits
                ).toFixed(2)
              : "---";

          // Trung bình điểm tích lũy (4)
          const gpa4Subjects = passedSubjects.filter(
            (mh) => mh["Thang điểm 4"]
          );
          const cumulativeGPA4 =
            gpa4Subjects.length > 0
              ? (
                  gpa4Subjects.reduce(
                    (sum, mh) =>
                      sum +
                      (parseFloat(mh["Thang điểm 4"].replace(",", ".")) || 0) *
                        (parseFloat(mh["Tín chỉ"]) || 0),
                    0
                  ) / totalCredits
                ).toFixed(2)
              : "---";

          // Số môn đã học
          const studied = allSubjects.length;

          // Số môn còn lại (nếu biết tổng số môn, ví dụ 162 tín chỉ)
          const totalCreditsRequired = 162;
          const remaining = totalCreditsRequired - totalCredits;

          // Xếp loại học lực (dựa theo cumulativeGPA4)
          let ranking = "---";
          if (cumulativeGPA4 !== "---") {
            const gpa4 = parseFloat(cumulativeGPA4);
            if (gpa4 >= 3.6) ranking = "Xuất sắc";
            else if (gpa4 >= 3.2) ranking = "Giỏi";
            else if (gpa4 >= 2.5) ranking = "Khá";
            else if (gpa4 >= 2.0) ranking = "Trung bình";
            else ranking = "Yếu";
          }

          const transformedSubjects = parsedData;

          setSubjects(transformedSubjects);
          setResults(transformedSubjects);
          setSummnary({
            totalCredits: `${totalCredits}/${totalCreditsRequired}`,
            cumulativeGPA: cumulativeGPA,
            cumulativeGPA4: cumulativeGPA4,
            totalSubjects: studied,
            remaining: remaining,
            currentRanking: ranking,
          });
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
    {
      className: "page-content",
      style: {
        color: "#fff",
        background: "#181f2a",
        minHeight: "100vh",
        padding: 24,
      },
    },
    React.createElement(
      "div",
      {
        className: "card",
        style: {
          background: "#20293a",
          borderRadius: 10,
          padding: 24,
          marginBottom: 24,
          border: "1px solid #22304a",
        },
      },
      React.createElement(
        "h2",
        {
          style: {
            color: "#60a5fa",
            fontSize: 22,
            fontWeight: 700,
            marginBottom: 16,
            borderBottom: "2px solid #2563eb",
            paddingBottom: 4,
            display: "inline-block",
          },
        },
        "Learning progress"
      ),
      React.createElement(
        "div",
        {
          style: {
            background: "#181f2a",
            borderRadius: 10,
            padding: 20,
            border: "1px solid #22304a",
            marginBottom: 24,
          },
        },
        React.createElement(
          "ul",
          {
            style: {
              listStyle: "none",
              padding: 0,
              margin: 0,
              fontSize: 15,
              lineHeight: "2",
            },
          },
          React.createElement(
            "li",
            null,
            "Tổng số tính chỉ đã hoàn thành: ",
            React.createElement("b", null, summary.totalCredits)
          ),
          React.createElement(
            "li",
            null,
            "Trung bình điểm tính lũy (10-point scale): ",
            React.createElement("b", null, summary.cumulativeGPA)
          ),
          React.createElement(
            "li",
            null,
            "Trung bình điểm tích lũy (4-point scale): ",
            React.createElement("b", null, summary.cumulativeGPA4)
          ),
          React.createElement(
            "li",
            null,
            "Số môn đã học: ",
            React.createElement("b", null, summary.totalSubjects)
          ),
          React.createElement(
            "li",
            null,
            "Số tín chỉ còn lại: ",
            React.createElement("b", null, summary.remaining)
          ),
          React.createElement(
            "li",
            null,
            "Xếp loại hiện tại: ",
            React.createElement("b", null, summary.currentRanking)
          )
        )
      ),
      React.createElement(
        "h2",
        {
          style: {
            color: "#60a5fa",
            fontSize: 20,
            fontWeight: 700,
            marginBottom: 12,
            borderBottom: "2px solid #2563eb",
            paddingBottom: 4,
            display: "inline-block",
          },
        },
        "List of subjects currently studied"
      ),
      React.createElement(
        "div",
        {
          style: {
            background: "#181f2a",
            borderRadius: 10,
            border: "1px solid #22304a",
            overflow: "hidden",
          },
        },
        React.createElement(
          "table",
          {
            style: {
              width: "100%",
              color: "#fff",
              borderCollapse: "collapse",
              fontSize: 15,
            },
          },
          React.createElement(
            "thead",
            { style: { background: "#1e293b" } },
            React.createElement(
              "tr",
              null,
              [
                "STT",
                "MÃ HỌC PHẦN",
                "TÊN MÔN",
                "TÍN CHỈ",
                "ĐIỂM TỔNG KẾT",
                "THANG 4",
                "XẾP LOẠI",
              ].map((header, idx) =>
                React.createElement(
                  "th",
                  {
                    key: idx,
                    style: {
                      padding: "12px 8px",
                      borderBottom: "1px solid #22304a",
                      fontWeight: 600,
                      color: "#a5b4fc",
                      textAlign: idx === 0 ? "center" : "left",
                      fontSize: 13,
                      letterSpacing: 0.5,
                    },
                  },
                  header
                )
              )
            )
          ),
          React.createElement(
            "tbody",
            null,
            subjects.map((subj, idx) =>
              React.createElement(
                "tr",
                {
                  key: subj.id,
                  style: {
                    borderBottom: "1px solid #22304a",
                    background: idx % 2 === 0 ? "#20293a" : "#181f2a",
                  },
                },
                React.createElement(
                  "td",
                  {
                    style: {
                      textAlign: "center",
                      padding: "10px 8px",
                      fontWeight: 600,
                      color: "#60a5fa",
                    },
                  },
                  idx + 1
                ),
                React.createElement(
                  "td",
                  {
                    style: {
                      padding: "10px 8px",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    },
                  },
                  React.createElement("img", {
                    src: subj.avatar,
                    alt: subj.author,
                    style: {
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      marginRight: 8,
                      border: "2px solid #334155",
                    },
                  }),
                  React.createElement(
                    "span",
                    { style: { fontWeight: 600 } },
                    subj.author
                  )
                ),
                React.createElement(
                  "td",
                  { style: { padding: "10px 8px", fontWeight: 500 } },
                  subj.course
                ),
                React.createElement(
                  "td",
                  { style: { padding: "10px 8px", color: "#a5b4fc" } },
                  subj.type
                ),
                React.createElement(
                  "td",
                  {
                    style: {
                      padding: "10px 8px",
                      color: "#fbbf24",
                      fontWeight: 600,
                    },
                  },
                  subj.price
                ),
                React.createElement(
                  "td",
                  { style: { padding: "10px 8px", color: "#a5b4fc" } },
                  subj.date
                ),
                React.createElement(
                  "td",
                  { style: { padding: "10px 8px", textAlign: "center" } },
                  React.createElement(
                    "span",
                    {
                      style: {
                        cursor: "pointer",
                        marginRight: 8,
                        color: "#60a5fa",
                      },
                      title: "Edit",
                    },
                    React.createElement("svg", {
                      width: 16,
                      height: 16,
                      fill: "none",
                      stroke: "currentColor",
                      strokeWidth: 2,
                      strokeLinecap: "round",
                      strokeLinejoin: "round",
                      viewBox: "0 0 24 24",
                      style: { verticalAlign: "middle" },
                      children: React.createElement("path", {
                        d: "M15.232 5.232l3.536 3.536M9 11l6 6M3 17v4h4l12-12a2 2 0 0 0-2.828-2.828L3 17z",
                      }),
                    })
                  ),
                  React.createElement(
                    "span",
                    {
                      style: { cursor: "pointer", color: "#ef4444" },
                      title: "Delete",
                    },
                    React.createElement("svg", {
                      width: 16,
                      height: 16,
                      fill: "none",
                      stroke: "currentColor",
                      strokeWidth: 2,
                      strokeLinecap: "round",
                      strokeLinejoin: "round",
                      viewBox: "0 0 24 24",
                      style: { verticalAlign: "middle" },
                      children: React.createElement("path", {
                        d: "M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",
                      }),
                    })
                  )
                )
              )
            )
          )
        )
      )
    )
  );
}

window.StudyPlanPageContent = StudyPlanPageContent;
