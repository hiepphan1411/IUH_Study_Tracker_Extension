/* eslint-disable */
function StudyPlanPageContent() {
  const [subjects, setSubjects] = React.useState([]);
  const [currentSubj, setCurrentSubj] = React.useState([]);
  const [isLoading, setLoading] = React.useState(false);
  const [summary, setSummnary] = React.useState({
    totalCredits: 0,
    cumulativeGPA: 0.0,
    cumulativeGPA4: 0.0,
    totalSubjects: 0,
    remaining: 0,
    currentRanking: "",
  });

  const [frameSubjects, setFrameSubjects] = React.useState([]);
  const [plannedSubjectsBySemester, setPlannedSubjectsBySemester] =
    React.useState([]);
  const [subjectGoals, setSubjectGoals] = React.useState({});
  const [selectedSubjects, setSelectedSubjects] = React.useState({});

  React.useEffect(() => {
    const loadDataFrame = async () => {
      setLoading(true);
      try {
        const result = await new Promise((resolve) => {
          chrome.storage.local.get(
            ["curriculum_json", "curriculum_timestamp"],
            function (res) {
              if (chrome.runtime.lastError) {
                console.error("Lỗi lấy dữ liệu:", chrome.runtime.lastError);
                resolve({ diem_json: null });
                return;
              }
              resolve(res);

              if (res.curriculum_json) {
                const curriculumData = JSON.parse(res.curriculum_json);

                //console.log("DỮ LIỆU CHƯƠNG TRÌNH KHUNG");
                //console.log(curriculumData);
              } else {
                console.log(
                  "Không có dữ liệu chương trình khung trong storage"
                );
              }
            }
          );
        });

        const curriculumJson = result.curriculum_json;

        if (curriculumJson) {
          const parsedData = JSON.parse(curriculumJson);

          //const transformedSubjects = parsedData.flatMap((item) => item.monHoc);

          //console.log("Result: ", transformedSubjects);

          setFrameSubjects(parsedData);
        } else {
          console.warn("Không có dữ liệu điểm được lưu.");
          setFrameSubjects([]);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        setFrameSubjects([]);
      } finally {
        setLoading(false);
      }
    };

    loadDataFrame();
  }, []);

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

          const excludedCodes = [
            "4203003307", //GDTC 1
            "4203003242", //GDQP 1
            "4203003306", //GDTC 2
            "4203015253", //TA1
            "4203015216", //CCTA
            "4203015254", //TA2
            "4203003354", //GDQP 2
          ];

          // Lọc các môn không nằm trong danh sách loại trừ
          const gpaSubjects = passedSubjects.filter(
            (mh) =>
              mh["Tín chỉ"] &&
              mh["Điểm tổng kết"] &&
              mh["Thang điểm 4"] &&
              !excludedCodes.includes(
                (mh["Mã lớp học phần"] || "").slice(0, -2)
              )
          );
          const totalCreditsGPA = gpaSubjects.reduce(
            (sum, item) => sum + (parseFloat(item["Tín chỉ"]) || 0),
            0
          );

          // Trung bình điểm tích lũy (10)
          const cumulativeGPA =
            gpaSubjects.length > 0
              ? (
                  gpaSubjects.reduce(
                    (sum, mh) =>
                      sum +
                      (parseFloat(mh["Điểm tổng kết"].replace(",", ".")) || 0) *
                        (parseFloat(mh["Tín chỉ"]) || 0),
                    0
                  ) / totalCreditsGPA
                ).toFixed(2)
              : "---";

          // Trung bình điểm tích lũy (4)
          const cumulativeGPA4 =
            gpaSubjects.length > 0
              ? (
                  gpaSubjects.reduce(
                    (sum, mh) =>
                      sum +
                      (parseFloat(mh["Thang điểm 4"].replace(",", ".")) || 0) *
                        (parseFloat(mh["Tín chỉ"]) || 0),
                    0
                  ) / totalCreditsGPA
                ).toFixed(2)
              : "---";

          // Số môn đã học
          const studied = allSubjects.filter((mh) => {
            const stt = mh["STT"];
            return stt && !isNaN(stt) && stt.trim() !== "";
          }).length;

          //Tổng số tín chỉ yêu cầu
          const totalCreditsRequired = frameSubjects.reduce(
            (totalSum, hocKy) => {
              const monHoc = hocKy.monHoc || [];

              const nhom0Credits = monHoc
                .filter((mon) => mon.nhomTC === "0")
                .reduce((sum, mon) => sum + (parseFloat(mon.soTC) || 0), 0);

              const nhomTCCredits = hocKy.soTCTC;

              return totalSum + nhom0Credits + nhomTCCredits;
            },
            0
          );

          // Số tín chỉ còn lại (nếu biết tổng số môn, ví dụ 162 tín chỉ)
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

          const currentSubjects = allSubjects.filter(
            (item) => item["Xếp loại"] === ""
          );

          setCurrentSubj(currentSubjects);
          setSubjects(allSubjects);
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
        }
      } catch (error) {
        console.error("Error loading data:", error);
        setSubjects([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [frameSubjects]);

  // Hàm xác định những môn chưa học
  const getUnstudiedSubjectsBySemester = React.useCallback(() => {
    if (!frameSubjects.length || !subjects.length) return [];

    const studiedSubjectCodes = subjects
      .filter((subject) => subject["Đạt"] === "Đạt")
      .map((subject) => (subject["Mã lớp học phần"] || "").slice(0, -2));

    // Lấy danh sách môn "Không Đạt" để thêm vào môn chưa học
    const failedSubjects = subjects.filter(
      (subject) => subject["Đạt"] === "Không đạt"
    );

    const unstudiedBySemester = [];

    frameSubjects.forEach((semester, semesterIndex) => {
      const unstudiedInSemester = [];

      if (semester.monHoc && Array.isArray(semester.monHoc)) {
        const normalizeSubjectName = (name) => {
          return name
            .trim()
            .replace(/\s*\*\s*$/, "")
            .toLowerCase();
        };

        // Phân loại môn theo nhóm tự chọn
        const subjectsByGroup = {};
        const mandatorySubjects = [];

        semester.monHoc.forEach((frameSubject, subjectIndex) => {
          const nhomTC = frameSubject.nhomTC || frameSubject["Nhóm TC"] || "0";

          if (nhomTC === "0") {
            mandatorySubjects.push({ ...frameSubject, subjectIndex });
          } else {
            if (!subjectsByGroup[nhomTC]) {
              subjectsByGroup[nhomTC] = [];
            }
            subjectsByGroup[nhomTC].push({ ...frameSubject, subjectIndex });
          }
        });

        // Kiểm tra môn bắt buộc (nhomTC = "0")
        mandatorySubjects.forEach((frameSubject) => {
          const subjectCode =
            frameSubject.maMon ||
            frameSubject.maHocPhan ||
            frameSubject["Mã môn"] ||
            "";
          const subjectName =
            frameSubject.tenMon || frameSubject["Tên môn học"] || "";
          const credits = parseInt(
            frameSubject.soTC || frameSubject["Số tín chỉ"] || 0
          );
          const trangThai = frameSubject.trangThai || "";

          const normalizedFrameSubjectName = normalizeSubjectName(subjectName);

          // Kiểm tra môn đó đã học và đạt chưa
          const isStudiedAndPassed =
            trangThai === "Đạt" ||
            studiedSubjectCodes.some(
              (studiedCode) => studiedCode === subjectCode
            ) ||
            subjects.some((s) => {
              const studiedSubjectName = normalizeSubjectName(
                s["Tên môn học"] || ""
              );
              return (
                studiedSubjectName === normalizedFrameSubjectName &&
                s["Đạt"] === "Đạt"
              );
            });

          // Kiểm tra có phải môn "Không Đạt" cần học lại không
          const isFailedSubject = failedSubjects.some((s) => {
            const failedSubjectName = normalizeSubjectName(
              s["Tên môn học"] || ""
            );
            const failedSubjectCode = (s["Mã lớp học phần"] || "").slice(0, -2);
            return (
              failedSubjectName === normalizedFrameSubjectName ||
              failedSubjectCode === subjectCode
            );
          });

          if (
            (!isStudiedAndPassed || isFailedSubject) &&
            subjectName &&
            credits > 0
          ) {
            unstudiedInSemester.push({
              ...frameSubject,
              semesterIndex,
              subjectIndex: frameSubject.subjectIndex,
              originalIndex: `${semesterIndex}-${frameSubject.subjectIndex}`,
              semesterName: semester.hocKy || `Học kỳ ${semesterIndex + 1}`,
              maMon: subjectCode,
              tenMon: subjectName,
              soTC: credits,
              nhomTC: "0",
              soTLT: frameSubject.soTLT || 0,
              soTTH: frameSubject.soTTH || 0,
              trangThai: isFailedSubject
                ? "Học lại"
                : frameSubject.trangThai || "Chưa học",
            });
          }
        });

        // Xử lý các nhóm tự chọn
        const soTCTC = semester.soTCTC || 0;
        let totalElectiveCreditsNeeded = soTCTC;
        const electiveGroups = Object.keys(subjectsByGroup);

        if (electiveGroups.length > 0 && soTCTC > 0) {
          // Tính toán tín chỉ tự chọn đã hoàn thành
          let completedElectiveCredits = 0;
          const completedGroups = new Set();

          // Kiểm tra từng nhóm để xem đã có môn đạt chưa
          electiveGroups.forEach((groupId) => {
            const groupSubjects = subjectsByGroup[groupId];
            let hasCompletedSubject = false;

            groupSubjects.forEach((frameSubject) => {
              const subjectCode =
                frameSubject.maMon ||
                frameSubject.maHocPhan ||
                frameSubject["Mã môn"] ||
                "";
              const subjectName =
                frameSubject.tenMon || frameSubject["Tên môn học"] || "";
              const credits = parseInt(
                frameSubject.soTC || frameSubject["Số tín chỉ"] || 0
              );
              const trangThai = frameSubject.trangThai || "";

              const normalizedFrameSubjectName =
                normalizeSubjectName(subjectName);

              const isStudiedAndPassed =
                trangThai === "Đạt" ||
                studiedSubjectCodes.some(
                  (studiedCode) => studiedCode === subjectCode
                ) ||
                subjects.some((s) => {
                  const studiedSubjectName = normalizeSubjectName(
                    s["Tên môn học"] || ""
                  );
                  return (
                    studiedSubjectName === normalizedFrameSubjectName &&
                    s["Đạt"] === "Đạt"
                  );
                });

              if (isStudiedAndPassed) {
                hasCompletedSubject = true;
                completedElectiveCredits += credits;
                completedGroups.add(groupId);
              }
            });
          });

          // Tính số tín chỉ tự chọn còn thiếu
          totalElectiveCreditsNeeded = Math.max(
            0,
            soTCTC - completedElectiveCredits
          );

          if (totalElectiveCreditsNeeded > 0) {
            electiveGroups.forEach((groupId) => {
              if (!completedGroups.has(groupId)) {
                const groupSubjects = subjectsByGroup[groupId];

                groupSubjects.forEach((frameSubject) => {
                  const subjectCode =
                    frameSubject.maMon ||
                    frameSubject.maHocPhan ||
                    frameSubject["Mã môn"] ||
                    "";
                  const subjectName =
                    frameSubject.tenMon || frameSubject["Tên môn học"] || "";
                  const trangThai = frameSubject.trangThai || "";

                  const normalizedFrameSubjectName =
                    normalizeSubjectName(subjectName);

                  const isStudiedAndPassed =
                    trangThai === "Đạt" ||
                    studiedSubjectCodes.some(
                      (studiedCode) => studiedCode === subjectCode
                    ) ||
                    subjects.some((s) => {
                      const studiedSubjectName = normalizeSubjectName(
                        s["Tên môn học"] || ""
                      );
                      return (
                        studiedSubjectName === normalizedFrameSubjectName &&
                        s["Đạt"] === "Đạt"
                      );
                    });

                  const isFailedSubject = failedSubjects.some((s) => {
                    const failedSubjectName = normalizeSubjectName(
                      s["Tên môn học"] || ""
                    );
                    const failedSubjectCode = (
                      s["Mã lớp học phần"] || ""
                    ).slice(0, -2);
                    return (
                      failedSubjectName === normalizedFrameSubjectName ||
                      failedSubjectCode === subjectCode
                    );
                  });

                  if (
                    (!isStudiedAndPassed || isFailedSubject) &&
                    subjectName &&
                    parseInt(frameSubject.soTC || 0) > 0
                  ) {
                    const credits = parseInt(frameSubject.soTC || 0);
                    const subjectCode =
                      frameSubject.maMon || frameSubject.maHocPhan || "";
                    const subjectName = frameSubject.tenMon || "";

                    unstudiedInSemester.push({
                      ...frameSubject,
                      semesterIndex,
                      subjectIndex: frameSubject.subjectIndex,
                      originalIndex: `${semesterIndex}-${frameSubject.subjectIndex}`,
                      semesterName:
                        semester.hocKy || `Học kỳ ${semesterIndex + 1}`,
                      maMon: subjectCode,
                      tenMon: subjectName,
                      soTC: credits,
                      nhomTC: groupId,
                      soTLT: frameSubject.soTLT || 0,
                      soTTH: frameSubject.soTTH || 0,
                      trangThai: isFailedSubject
                        ? "Học lại"
                        : frameSubject.trangThai || "Chưa học",
                    });
                  }
                });
              }
            });
          }
        }
      }

      // Chỉ những kì có môn chưa học
      if (unstudiedInSemester.length > 0) {
        unstudiedBySemester.push({
          semesterName: semester.hocKy || `Học kỳ ${semesterIndex + 1}`,
          semesterIndex,
          subjects: unstudiedInSemester,
          soTCTC: semester.soTCTC || 0,
        });
      }
    });

    return unstudiedBySemester;
  }, [frameSubjects, subjects]);

  React.useEffect(() => {
    const unstudiedBySemester = getUnstudiedSubjectsBySemester();
    setPlannedSubjectsBySemester(unstudiedBySemester);
  }, [getUnstudiedSubjectsBySemester]);

  // Bắt sự kiện combobox
  const handleSubjectSelection = (subjectKey, isSelected) => {
    // Kiểm tra nếu đang bỏ chọn thì không cần validate
    if (!isSelected) {
      setSelectedSubjects((prev) => ({
        ...prev,
        [subjectKey]: isSelected,
      }));
      return;
    }

    // Tìm thông tin môn học được chọn
    const selectedSubject = plannedSubjectsBySemester
      .flatMap((sem) => sem.subjects)
      .find((subj) => subj.originalIndex === subjectKey);

    if (!selectedSubject) {
      setSelectedSubjects((prev) => ({
        ...prev,
        [subjectKey]: isSelected,
      }));
      return;
    }

    // Nếu là môn tự chọn, kiểm tra số tín chỉ trong nhóm
    if (selectedSubject.nhomTC !== "0") {
      const semesterData = plannedSubjectsBySemester.find(
        (sem) => sem.semesterIndex === selectedSubject.semesterIndex
      );

      if (semesterData && semesterData.soTCTC > 0) {
        // Tính tổng tín chỉ đã chọn trong cùng nhóm tự chọn
        const currentGroupCredits = semesterData.subjects
          .filter(
            (subj) =>
              subj.nhomTC === selectedSubject.nhomTC &&
              subj.originalIndex !== subjectKey &&
              selectedSubjects[subj.originalIndex]
          )
          .reduce((sum, subj) => sum + subj.soTC, 0);

        const newTotalCredits = currentGroupCredits + selectedSubject.soTC;

        // Kiểm tra nếu vượt quá số tín chỉ yêu cầu của nhóm
        if (newTotalCredits > semesterData.soTCTC) {
          alert(
            `⚠️ Chú ý đảm bảo số tín chỉ trong nhóm tự chọn!\n\nNhóm ${
              selectedSubject.nhomTC
            } yêu cầu: ${
              semesterData.soTCTC
            } tín chỉ\nĐã chọn: ${currentGroupCredits} tín chỉ\nMôn này: ${
              selectedSubject.soTC
            } tín chỉ\nTổng sẽ là: ${newTotalCredits} tín chỉ (vượt quá ${
              newTotalCredits - semesterData.soTCTC
            } tín chỉ)\n\nVui lòng bỏ chọn môn khác trong nhóm này trước!`
          );
          return;
        }
      }
    }

    setSelectedSubjects((prev) => ({
      ...prev,
      [subjectKey]: isSelected,
    }));
  };

  // Hàm kiểm tra học kỳ đã hoàn thành chưa
  const isSemesterCompleted = React.useCallback(
    (semesterData) => {
      if (!semesterData || !semesterData.subjects) return false;

      // Kiểm tra tất cả môn bắt buộc đã được chọn
      const mandatorySubjects = semesterData.subjects.filter(
        (subj) => subj.nhomTC === "0"
      );
      const selectedMandatory = mandatorySubjects.filter(
        (subj) => selectedSubjects[subj.originalIndex]
      );

      if (selectedMandatory.length !== mandatorySubjects.length) {
        return false;
      }

      // Nếu không có yêu cầu tín chỉ tự chọn thì đã hoàn thành
      if (!semesterData.soTCTC || semesterData.soTCTC === 0) {
        return true;
      }

      // Kiểm tra tín chỉ tự chọn đã đủ chưa
      const electiveSubjects = semesterData.subjects.filter(
        (subj) => subj.nhomTC !== "0"
      );
      const selectedElectiveCredits = electiveSubjects
        .filter((subj) => selectedSubjects[subj.originalIndex])
        .reduce((sum, subj) => sum + subj.soTC, 0);

      return selectedElectiveCredits >= semesterData.soTCTC;
    },
    [selectedSubjects]
  );

  // Check input điểm
  const validateScore = (value) => {
    if (value === "" || value === null || value === undefined) {
      return { isValid: true, value: null };
    }

    const normalizedValue = value.toString().replace(",", ".");
    const numValue = parseFloat(normalizedValue);

    if (isNaN(numValue)) {
      return { isValid: false, value: null, error: "Điểm phải là số" };
    }

    if (numValue < 0 || numValue > 10) {
      return { isValid: false, value: null, error: "Điểm phải từ 0 đến 10" };
    }

    return { isValid: true, value: Math.round(numValue * 10) / 10 };
  };

  // Tính điểm tổng kết môn
  const calculateGoalScore = (subjectKey, subjectType) => {
    const goals = subjectGoals[subjectKey] || {};
    const { diemGK, tx1, tx2, tx3, tx4, th1, th2, th3, th4, th5, diemCK } =
      goals;

    if (!diemGK && !diemCK) return null;

    let diemTongKet = 0;
    const thuongXuyen = [tx1, tx2, tx3, tx4].filter(
      (s) => s !== null && s !== undefined
    );
    const thucHanh = [th1, th2, th3, th4, th5].filter(
      (s) => s !== null && s !== undefined
    );

    if (subjectType === "TH") {
      if (thucHanh.length > 0) {
        diemTongKet =
          thucHanh.reduce((sum, score) => sum + score, 0) / thucHanh.length;
      }
    } else if (subjectType === "LT") {
      if (diemGK && diemCK) {
        const diemTX =
          thuongXuyen.length > 0
            ? thuongXuyen.reduce((sum, score) => sum + score, 0) /
              thuongXuyen.length
            : 0;
        diemTongKet = diemTX * 0.2 + diemGK * 0.3 + diemCK * 0.5;
      }
    } else if (subjectType === "TICH_HOP") {
      if (diemGK && diemCK) {
        const diemTX =
          thuongXuyen.length > 0
            ? thuongXuyen.reduce((sum, score) => sum + score, 0) /
              thuongXuyen.length
            : 0;
        const diemLT = diemTX * 0.2 + diemGK * 0.3 + diemCK * 0.5;

        if (thucHanh.length > 0) {
          const diemTH =
            thucHanh.reduce((sum, score) => sum + score, 0) / thucHanh.length;
          diemTongKet = (diemLT * 3 + diemTH) / 4;
        } else {
          diemTongKet = diemLT;
        }
      }
    } else {
      diemTongKet = diemCK || 0;
    }

    return diemTongKet;
  };

  // Chuyển điểm sang hệ 4
  const convertScore10To4 = (score) => {
    if (score >= 9.0) return 4;
    if (score >= 8.5) return 3.8;
    if (score >= 8.0) return 3.5;
    if (score >= 7.0) return 3;
    if (score >= 6.0) return 2.5;
    if (score >= 5.5) return 2;
    if (score >= 5.0) return 1.5;
    if (score >= 4.0) return 1;
    return 0;
  };

  const convertScore4ToChar = (score) => {
    if (score === 4) return "A+";
    if (score === 3.8) return "A";
    if (score === 3.5) return "B+";
    if (score === 3) return "B";
    if (score === 2.5) return "C+";
    if (score === 2) return "C";
    if (score === 1.5) return "D+";
    if (score === 1) return "D";
    return "F";
  };

  const convertScore4ToClassification = (score) => {
    if (score === 4) return "Xuất sắc";
    if (score === 3.8) return "Giỏi";
    if (score >= 3) return "Khá";
    if (score >= 2) return "Trung bình";
    if (score >= 1) return "Trung bình yếu";
    return "Kém";
  };

  // Xác định loại môn
  const getSubjectType = (subject) => {
    const soTLT = subject.soTLT || 0;
    const soTTH = subject.soTTH || 0;

    if (soTLT > 0 && soTTH > 0) return "TICH_HOP";
    if (soTLT === 0 && soTTH > 0) return "TH";
    if (soTLT > 0 && soTTH === 0) return "LT";
    return "LT";
  };

  // Hàm xử lý thay đổi điểm mục tiêu
  const handleGoalScoreChange = (subjectKey, field, value) => {
    const validation = validateScore(value);

    if (!validation.isValid && value !== "") {
      alert(validation.error);
      return;
    }

    setSubjectGoals((prev) => ({
      ...prev,
      [subjectKey]: {
        ...prev[subjectKey],
        [field]: validation.value,
      },
    }));
  };

  // Tạo Edit giữa các cell trong tb
  const createGoalCell = (subjectKey, field, isEnabled) => {
    const goals = subjectGoals[subjectKey] || {};
    const value = goals[field];
    const displayValue =
      value !== null && value !== undefined
        ? value.toFixed(1).replace(".", ",")
        : "";

    return React.createElement(
      "td",
      {
        className: `goal-cell ${!isEnabled ? "disabled-cell" : ""}`,
        contentEditable: isEnabled,
        suppressContentEditableWarning: true,
        style: {
          outline: "none",
          backgroundColor: isEnabled ? "#f8fafc" : "#f3f4f6",
          color: isEnabled ? "#1e293b" : "#9ca3af",
          cursor: isEnabled ? "text" : "not-allowed",
          padding: "8px",
          textAlign: "center",
        },
        onBlur: (e) => {
          if (isEnabled) {
            const newValue = e.target.textContent.trim();
            handleGoalScoreChange(subjectKey, field, newValue);
            const validation = validateScore(newValue);
            if (validation.value !== null) {
              e.target.textContent = validation.value
                .toFixed(1)
                .replace(".", ",");
            }
          }
        },
        onKeyPress: (e) => {
          if (isEnabled && e.key === "Enter") {
            e.preventDefault();
            e.target.blur();
          }
        },
      },
      displayValue
    );
  };

  return React.createElement(
    "div",
    {
      className: "page-content",
      style: {
        color: "#fff",
        minHeight: "100vh",
        padding: 24,
      },
    },
    //Quá trình học tập
    React.createElement(
      "div",
      {
        className: "card",
        style: {
          borderRadius: 10,
          padding: 24,
          marginBottom: 24,
        },
      },
      React.createElement(
        "h2",
        {
          className: "card-title",
          style: {
            fontSize: 22,
            fontWeight: 700,
            marginBottom: 16,
            paddingBottom: 4,
            display: "inline-block",
          },
        },
        "Quá trình học tập"
      ),
      React.createElement(
        "div",
        {
          style: {
            borderRadius: 10,
            color: "#000000",
            padding: 20,
            border: "1px solid #22304a",
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
      )
    ),

    //Danh sách các môn đang học
    React.createElement(
      "div",
      {
        className: "card",
        style: {
          borderRadius: 10,
          padding: 24,
          marginBottom: 24,
        },
      },
      React.createElement(
        "h2",
        {
          className: "card-title",
          style: {
            fontSize: 22,
            fontWeight: 700,
            marginBottom: 12,
            paddingBottom: 4,
            display: "inline-block",
          },
        },
        "Danh sách các môn đang học"
      ),
      currentSubj.length === 0
        ? React.createElement(
            "div",
            {
              style: {
                borderRadius: 10,
                border: "1px solid #22304a",
                padding: 40,
                textAlign: "center",
                color: "#9ca3af",
                backgroundColor: "#1e293b",
              },
            },
            React.createElement(
              "p",
              {
                style: {
                  fontSize: 16,
                  margin: 0,
                },
              },
              "Không có môn ở trạng thái đang học"
            )
          )
        : React.createElement(
            "div",
            {
              style: {
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
                currentSubj.map((subj, idx) =>
                  React.createElement(
                    "tr",
                    {
                      key: idx,
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
                      subj["STT"]
                    ),
                    React.createElement(
                      "td",
                      {
                        style: {
                          padding: "10px 8px",
                          fontWeight: 600,
                        },
                      },
                      subj["Mã lớp học phần"]
                    ),
                    React.createElement(
                      "td",
                      { style: { padding: "10px 8px", fontWeight: 500 } },
                      subj["Tên môn học"]
                    ),
                    React.createElement(
                      "td",
                      { style: { padding: "10px 8px", fontWeight: 500 } },
                      subj["Tín chỉ"]
                    ),
                    React.createElement(
                      "td",
                      { style: { padding: "10px 8px", color: "#a5b4fc" } },
                      subj["Điểm tổng kết"]
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
                      subj["Thang điểm 4"]
                    ),
                    React.createElement(
                      "td",
                      { style: { padding: "10px 8px", color: "#a5b4fc" } },
                      subj["Xếp loại"]
                    )
                  )
                )
              )
            )
          )
    ),

    //Lập kế hoạch học tập
    React.createElement(
      "div",
      {
        className: "card",
        style: {
          borderRadius: 10,
          padding: 24,
          marginBottom: 24,
        },
      },
      React.createElement(
        "h2",
        {
          className: "card-title",
          style: {
            fontSize: 22,
            fontWeight: 700,
            marginBottom: 24,
            paddingBottom: 4,
            display: "inline-block",
          },
        },
        "Lập kế hoạch học tập (Các môn chưa học)"
      ),

      // Render những môn chưa học
      plannedSubjectsBySemester.map((semesterData, semesterIdx) => {
        const isCompleted = isSemesterCompleted(semesterData);
        return React.createElement(
          "div",
          {
            key: `semester-plan-${semesterIdx}`,
            style: { marginBottom: 40 },
          },
          React.createElement(
            "h3",
            {
              style: {
                fontSize: 18,
                fontWeight: 600,
                marginBottom: 16,
                color: isCompleted ? "#22c55e" : "#60a5fa",
                borderLeft: `4px solid ${isCompleted ? "#22c55e" : "#60a5fa"}`,
                paddingLeft: 12,
                display: "flex",
                alignItems: "center",
                gap: "8px",
              },
            },
            `${semesterData.semesterName} ${
              semesterData.soTCTC > 0
                ? `(Tự chọn: ${semesterData.soTCTC} TC)`
                : ""
            }`,
            isCompleted &&
              React.createElement(
                "span",
                {
                  style: {
                    fontSize: "16px",
                    color: "#22c55e",
                    fontWeight: "bold",
                  },
                },
                "✓ DONE"
              )
          ),
          React.createElement(
            "div",
            {
              style: {
                borderRadius: 10,
                border: "1px solid #22304a",
                overflow: "hidden",
                marginBottom: 24,
              },
            },
            React.createElement(
              "table",
              {
                style: {
                  width: "100%",
                  color: "#fff",
                  borderCollapse: "collapse",
                  fontSize: 13,
                },
              },
              React.createElement(
                "thead",
                { style: { background: "#1e293b" } },
                React.createElement(
                  "tr",
                  null,
                  React.createElement(
                    "th",
                    {
                      rowSpan: 3,
                      style: {
                        padding: "12px 8px",
                        borderBottom: "1px solid #22304a",
                        fontWeight: 600,
                        color: "#a5b4fc",
                        textAlign: "center",
                        fontSize: 13,
                      },
                    },
                    "STT"
                  ),
                  React.createElement(
                    "th",
                    {
                      rowSpan: 3,
                      style: {
                        padding: "12px 8px",
                        borderBottom: "1px solid #22304a",
                        fontWeight: 600,
                        color: "#a5b4fc",
                        textAlign: "center",
                        fontSize: 13,
                      },
                    },
                    "Dự ĐỊNH"
                  ),
                  React.createElement(
                    "th",
                    {
                      rowSpan: 3,
                      style: {
                        padding: "12px 8px",
                        borderBottom: "1px solid #22304a",
                        fontWeight: 600,
                        color: "#a5b4fc",
                        textAlign: "left",
                        fontSize: 13,
                      },
                    },
                    "MÃ MÔN"
                  ),
                  React.createElement(
                    "th",
                    {
                      rowSpan: 3,
                      style: {
                        padding: "12px 8px",
                        borderBottom: "1px solid #22304a",
                        fontWeight: 600,
                        color: "#a5b4fc",
                        textAlign: "left",
                        fontSize: 13,
                      },
                    },
                    "TÊN MÔN"
                  ),
                  React.createElement(
                    "th",
                    {
                      rowSpan: 3,
                      style: {
                        padding: "12px 8px",
                        borderBottom: "1px solid #22304a",
                        fontWeight: 600,
                        color: "#a5b4fc",
                        textAlign: "center",
                        fontSize: 13,
                      },
                    },
                    "TÍN CHỈ"
                  ),
                  React.createElement(
                    "th",
                    {
                      rowSpan: 3,
                      style: {
                        padding: "12px 8px",
                        borderBottom: "1px solid #22304a",
                        fontWeight: 600,
                        color: "#a5b4fc",
                        textAlign: "center",
                        fontSize: 13,
                      },
                    },
                    "LOẠI MÔN"
                  ),
                  React.createElement(
                    "th",
                    {
                      colSpan: 11,
                      style: {
                        padding: "12px 8px",
                        borderBottom: "1px solid #22304a",
                        fontWeight: 600,
                        color: "#a5b4fc",
                        textAlign: "center",
                        fontSize: 13,
                      },
                    },
                    "MỤC TIÊU"
                  ),
                  React.createElement(
                    "th",
                    {
                      rowSpan: 3,
                      style: {
                        padding: "12px 8px",
                        borderBottom: "1px solid #22304a",
                        fontWeight: 600,
                        color: "#a5b4fc",
                        textAlign: "center",
                        fontSize: 13,
                      },
                    },
                    "TỔNG KẾT"
                  ),
                  React.createElement(
                    "th",
                    {
                      rowSpan: 3,
                      style: {
                        padding: "12px 8px",
                        borderBottom: "1px solid #22304a",
                        fontWeight: 600,
                        color: "#a5b4fc",
                        textAlign: "center",
                        fontSize: 13,
                      },
                    },
                    "THANG 4"
                  ),
                  React.createElement(
                    "th",
                    {
                      rowSpan: 3,
                      style: {
                        padding: "12px 8px",
                        borderBottom: "1px solid #22304a",
                        fontWeight: 600,
                        color: "#a5b4fc",
                        textAlign: "center",
                        fontSize: 13,
                      },
                    },
                    "ĐIỂM CHỮ"
                  ),
                  React.createElement(
                    "th",
                    {
                      rowSpan: 3,
                      style: {
                        padding: "12px 8px",
                        borderBottom: "1px solid #22304a",
                        fontWeight: 600,
                        color: "#a5b4fc",
                        textAlign: "center",
                        fontSize: 13,
                      },
                    },
                    "XẾP LOẠI"
                  ),
                  React.createElement(
                    "th",
                    {
                      rowSpan: 3,
                      style: {
                        padding: "12px 8px",
                        borderBottom: "1px solid #22304a",
                        fontWeight: 600,
                        color: "#a5b4fc",
                        textAlign: "center",
                        fontSize: 13,
                      },
                    },
                    "GHI CHÚ"
                  ),
                  React.createElement(
                    "th",
                    {
                      rowSpan: 3,
                      style: {
                        padding: "12px 8px",
                        borderBottom: "1px solid #22304a",
                        fontWeight: 600,
                        color: "#a5b4fc",
                        textAlign: "center",
                        fontSize: 13,
                      },
                    },
                    "ĐẠT"
                  )
                ),
                React.createElement(
                  "tr",
                  null,
                  React.createElement(
                    "th",
                    {
                      rowSpan: 2,
                      style: {
                        padding: "8px",
                        borderBottom: "1px solid #22304a",
                        fontWeight: 600,
                        color: "#a5b4fc",
                        textAlign: "center",
                        fontSize: 12,
                      },
                    },
                    "GK"
                  ),
                  React.createElement(
                    "th",
                    {
                      colSpan: 4,
                      style: {
                        padding: "8px",
                        borderBottom: "1px solid #22304a",
                        fontWeight: 600,
                        color: "#a5b4fc",
                        textAlign: "center",
                        fontSize: 12,
                      },
                    },
                    "THƯỜNG XUYÊN"
                  ),
                  React.createElement(
                    "th",
                    {
                      colSpan: 5,
                      style: {
                        padding: "8px",
                        borderBottom: "1px solid #22304a",
                        fontWeight: 600,
                        color: "#a5b4fc",
                        textAlign: "center",
                        fontSize: 12,
                      },
                    },
                    "THỰC HÀNH"
                  ),
                  React.createElement(
                    "th",
                    {
                      rowSpan: 2,
                      style: {
                        padding: "8px",
                        borderBottom: "1px solid #22304a",
                        fontWeight: 600,
                        color: "#a5b4fc",
                        textAlign: "center",
                        fontSize: 12,
                      },
                    },
                    "CK"
                  )
                ),
                React.createElement(
                  "tr",
                  null,
                  ["1", "2", "3", "4"].map((num) =>
                    React.createElement(
                      "th",
                      {
                        key: `tx${num}`,
                        style: {
                          padding: "6px",
                          borderBottom: "1px solid #22304a",
                          fontWeight: 600,
                          color: "#a5b4fc",
                          textAlign: "center",
                          fontSize: 11,
                        },
                      },
                      num
                    )
                  ),
                  ["1", "2", "3", "4", "5"].map((num) =>
                    React.createElement(
                      "th",
                      {
                        key: `th${num}`,
                        style: {
                          padding: "6px",
                          borderBottom: "1px solid #22304a",
                          fontWeight: 600,
                          color: "#a5b4fc",
                          textAlign: "center",
                          fontSize: 11,
                        },
                      },
                      num
                    )
                  )
                )
              ),
              React.createElement(
                "tbody",
                null,
                semesterData.subjects.map((subject, idx) => {
                  const subjectKey = subject.originalIndex;
                  const isSelected = selectedSubjects[subjectKey] || false;
                  const subjectType = getSubjectType(subject);
                  const goalScore = calculateGoalScore(subjectKey, subjectType);
                  const score4 = goalScore
                    ? convertScore10To4(goalScore)
                    : null;

                  return React.createElement(
                    "tr",
                    {
                      key: subjectKey,
                      style: {
                        borderBottom: "1px solid #22304a",
                        background: idx % 2 === 0 ? "#20293a" : "#181f2a",
                        opacity: isSelected ? 1 : 0.6,
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
                          padding: "8px",
                          textAlign: "center",
                        },
                      },
                      React.createElement("input", {
                        type: "checkbox",
                        checked: isSelected,
                        onChange: (e) =>
                          handleSubjectSelection(subjectKey, e.target.checked),
                        style: {
                          width: "16px",
                          height: "16px",
                          cursor: "pointer",
                          accentColor: "#60a5fa",
                        },
                      })
                    ),
                    React.createElement(
                      "td",
                      { style: { padding: "10px 8px", fontWeight: 500 } },
                      subject.maMon
                    ),
                    React.createElement(
                      "td",
                      { style: { padding: "10px 8px", fontWeight: 500 } },
                      subject.tenMon
                    ),
                    React.createElement(
                      "td",
                      {
                        style: {
                          padding: "10px 8px",
                          textAlign: "center",
                          fontWeight: 500,
                        },
                      },
                      subject.soTC
                    ),
                    React.createElement(
                      "td",
                      {
                        style: {
                          padding: "10px 8px",
                          textAlign: "center",
                          fontSize: "11px",
                          color: subject.nhomTC !== "0" ? "#fbbf24" : "#a5b4fc",
                        },
                      },
                      subjectType === "TICH_HOP"
                        ? "Tích hợp"
                        : subjectType === "TH"
                        ? "Thực hành"
                        : "Lý thuyết"
                    ),
                    createGoalCell(
                      subjectKey,
                      "diemGK",
                      isSelected && subjectType !== "TH"
                    ),
                    createGoalCell(
                      subjectKey,
                      "tx1",
                      isSelected && subjectType !== "TH"
                    ),
                    createGoalCell(
                      subjectKey,
                      "tx2",
                      isSelected && subjectType !== "TH"
                    ),
                    createGoalCell(
                      subjectKey,
                      "tx3",
                      isSelected && subjectType !== "TH"
                    ),
                    createGoalCell(
                      subjectKey,
                      "tx4",
                      isSelected && subjectType !== "TH"
                    ),
                    createGoalCell(
                      subjectKey,
                      "th1",
                      isSelected &&
                        (subjectType === "TH" || subjectType === "TICH_HOP")
                    ),
                    createGoalCell(
                      subjectKey,
                      "th2",
                      isSelected &&
                        (subjectType === "TH" || subjectType === "TICH_HOP")
                    ),
                    createGoalCell(
                      subjectKey,
                      "th3",
                      isSelected &&
                        (subjectType === "TH" || subjectType === "TICH_HOP")
                    ),
                    createGoalCell(
                      subjectKey,
                      "th4",
                      isSelected &&
                        (subjectType === "TH" || subjectType === "TICH_HOP")
                    ),
                    createGoalCell(
                      subjectKey,
                      "th5",
                      isSelected &&
                        (subjectType === "TH" || subjectType === "TICH_HOP")
                    ),
                    createGoalCell(subjectKey, "diemCK", isSelected),
                    React.createElement(
                      "td",
                      {
                        style: {
                          padding: "10px 8px",
                          textAlign: "center",
                          fontWeight: 600,
                          color: goalScore
                            ? goalScore >= 8
                              ? "#22c55e"
                              : goalScore >= 6.5
                              ? "#f59e0b"
                              : "#ef4444"
                            : "#9ca3af",
                        },
                      },
                      goalScore ? goalScore.toFixed(1).replace(".", ",") : ""
                    ),
                    React.createElement(
                      "td",
                      { style: { padding: "10px 8px", textAlign: "center" } },
                      score4 ? score4.toFixed(1).replace(".", ",") : ""
                    ),
                    React.createElement(
                      "td",
                      { style: { padding: "10px 8px", textAlign: "center" } },
                      score4 ? convertScore4ToChar(score4) : ""
                    ),
                    React.createElement(
                      "td",
                      { style: { padding: "10px 8px", textAlign: "center" } },
                      score4 ? convertScore4ToClassification(score4) : ""
                    ),
                    React.createElement(
                      "td",
                      { style: { padding: "10px 8px", textAlign: "center" } },
                      subject.nhomTC !== "0"
                        ? `Tự chọn (${subject.nhomTC})`
                        : "Bắt buộc"
                    ),
                    React.createElement(
                      "td",
                      { style: { padding: "10px 8px", textAlign: "center" } },
                      score4 && score4 > 0 ? "✓" : ""
                    )
                  );
                })
              )
            )
          )
        );
      })
    )
  );
}

window.StudyPlanPageContent = StudyPlanPageContent;
