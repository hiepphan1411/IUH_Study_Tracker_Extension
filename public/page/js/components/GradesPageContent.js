/* eslint-disable no-undef */

function GradesPageContent({ keyValue }) {
  const [gradesData, setGradesData] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [subjectTypes, setSubjectTypes] = React.useState({}); // Lưu trữ loại môn học đã chọn
  const [openDropdowns, setOpenDropdowns] = React.useState({}); // Lưu trữ trạng thái mở/đóng của các dropdown
  const [curriculumLoaded, setCurriculumLoaded] = React.useState(false);
  const [manuallyChangedSubjects, setManuallyChangedSubjects] = React.useState(
    {}
  ); // Theo dõi môn nào đã được thay đổi thủ công

  // Load curriculum data first
  React.useEffect(() => {
    const loadCurriculumData = () => {
      chrome.storage.local.get(["curriculum_json"], function (result) {
        if (chrome.runtime.lastError) {
          console.error(
            "Lỗi lấy dữ liệu chương trình khung:",
            chrome.runtime.lastError
          );
          setCurriculumLoaded(true); // Still allow the component to work
          return;
        }

        if (result.curriculum_json) {
          try {
            const curriculumDataParsed = JSON.parse(result.curriculum_json);

            // Export curriculum data to window
            window.curriculumData = curriculumDataParsed;

            // Export getCurriculumInfo function
            window.getCurriculumInfo = (subjectName) => {
              if (
                !curriculumDataParsed ||
                !Array.isArray(curriculumDataParsed)
              ) {
                return { soTLT: null, soTTH: null };
              }

              // Normalize subject name for better matching
              const normalizeSubjectName = (name) => {
                return name
                  .toLowerCase()
                  .trim()
                  .replace(/\s+/g, " ") // Replace multiple spaces with single space
                  .replace(/\*/g, "") // Remove asterisk
                  .replace(/[()]/g, "") // Remove parentheses
                  .replace(/[.,;:]/g, "") // Remove punctuation
                  .trim();
              };

              // Calculate string similarity using Levenshtein distance
              const calculateStringSimilarity = (str1, str2) => {
                const len1 = str1.length;
                const len2 = str2.length;
                const matrix = Array(len2 + 1)
                  .fill(null)
                  .map(() => Array(len1 + 1).fill(null));

                for (let i = 0; i <= len1; i++) matrix[0][i] = i;
                for (let j = 0; j <= len2; j++) matrix[j][0] = j;

                for (let j = 1; j <= len2; j++) {
                  for (let i = 1; i <= len1; i++) {
                    const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
                    matrix[j][i] = Math.min(
                      matrix[j - 1][i] + 1, // deletion
                      matrix[j][i - 1] + 1, // insertion
                      matrix[j - 1][i - 1] + cost // substitution
                    );
                  }
                }

                const distance = matrix[len2][len1];
                const maxLength = Math.max(len1, len2);
                return maxLength === 0 ? 1 : (maxLength - distance) / maxLength;
              };

              const searchName = normalizeSubjectName(subjectName);

              let bestMatch = null;
              let bestSimilarity = 0;

              for (const semester of curriculumDataParsed) {
                if (semester.monHoc && Array.isArray(semester.monHoc)) {
                  for (const subject of semester.monHoc) {
                    const subjectNameInCurriculum =
                      subject.tenMon ||
                      subject["Tên môn học"] ||
                      subject.tenMonHoc ||
                      subject.name;

                    if (subjectNameInCurriculum) {
                      const curriculumName = normalizeSubjectName(
                        subjectNameInCurriculum
                      );

                      // Exact match - highest priority
                      if (curriculumName === searchName) {
                        const soTLT =
                          subject.soTLT || subject["Số TCTL"] || null;
                        const soTTH =
                          subject.soTTH || subject["Số TCTH"] || null;
                        return {
                          soTLT: soTLT ? parseInt(soTLT) : null,
                          soTTH: soTTH ? parseInt(soTTH) : null,
                        };
                      }

                      // Enhanced matching for Tiếng Anh subjects
                      if (
                        searchName.includes("tiếng anh") &&
                        curriculumName.includes("tiếng anh")
                      ) {
                        // Phân biệt rõ ràng giữa "Tiếng Anh 1/2" và "Chứng chỉ Tiếng Anh"
                        const searchHasNumber = /tiếng anh\s+\d+/.test(
                          searchName
                        );
                        const curriculumHasNumber = /tiếng anh\s+\d+/.test(
                          curriculumName
                        );
                        const searchIsCertificate =
                          searchName.includes("chứng chỉ");
                        const curriculumIsCertificate =
                          curriculumName.includes("chứng chỉ");

                        console.log(
                          `  🔍 Tiếng Anh analysis - Search: "${searchName}" (hasNumber: ${searchHasNumber}, isCert: ${searchIsCertificate}), Curriculum: "${curriculumName}" (hasNumber: ${curriculumHasNumber}, isCert: ${curriculumIsCertificate})`
                        );
                        // Nếu cả hai đều có số (Tiếng Anh 1, Tiếng Anh 2)
                        if (searchHasNumber && curriculumHasNumber) {
                          const searchNumber =
                            searchName.match(/tiếng anh\s+(\d+)/);
                          const curriculumNumber =
                            curriculumName.match(/tiếng anh\s+(\d+)/);

                          if (
                            searchNumber &&
                            curriculumNumber &&
                            searchNumber[1] === curriculumNumber[1]
                          ) {
                            console.log(
                              `  ✅ Tiếng Anh ${searchNumber[1]} exact match found!`
                            );
                            const soTLT =
                              subject.soTLT || subject["Số TCTL"] || null;
                            const soTTH =
                              subject.soTTH || subject["Số TCTH"] || null;
                            return {
                              soTLT: soTLT ? parseInt(soTLT) : null,
                              soTTH: soTTH ? parseInt(soTTH) : null,
                            };
                          } else {
                            console.log(
                              `  ❌ Number mismatch: search=${searchNumber?.[1]} vs curriculum=${curriculumNumber?.[1]}`
                            );
                          }
                        }

                        // Nếu cả hai đều là chứng chỉ
                        if (searchIsCertificate && curriculumIsCertificate) {
                          console.log(`  ✅ Chứng chỉ Tiếng Anh match found!`);
                          const soTLT =
                            subject.soTLT || subject["Số TCTL"] || null;
                          const soTTH =
                            subject.soTTH || subject["Số TCTH"] || null;
                          return {
                            soTLT: soTLT ? parseInt(soTLT) : null,
                            soTTH: soTTH ? parseInt(soTTH) : null,
                          };
                        }

                        // Không cho match giữa "Tiếng Anh 1/2" và "Chứng chỉ Tiếng Anh"
                        if (
                          (searchHasNumber && curriculumIsCertificate) ||
                          (searchIsCertificate && curriculumHasNumber)
                        ) {
                          console.log(
                            `  ❌ Skipping cross-match between numbered and certificate Tiếng Anh`
                          );
                          continue;
                        }

                        // Skip any other Tiếng Anh matching to avoid confusion
                        console.log(
                          `  ❌ Skipping other Tiếng Anh matching to avoid confusion`
                        );
                        continue;
                      } // Partial matching
                      if (
                        curriculumName.includes(searchName) ||
                        searchName.includes(curriculumName)
                      ) {
                        const similarity = calculateStringSimilarity(
                          searchName,
                          curriculumName
                        );

                        if (similarity > bestSimilarity) {
                          bestSimilarity = similarity;
                          bestMatch = subject;
                        }
                      }

                      // Similarity matching with threshold
                      const similarity = calculateStringSimilarity(
                        searchName,
                        curriculumName
                      );
                      if (similarity > 0.8 && similarity > bestSimilarity) {
                        bestSimilarity = similarity;
                        bestMatch = subject;
                      }

                      // Special handling for common variations (không bao gồm tiếng anh vì đã xử lý riêng)
                      const specialMatches = [
                        [
                          "giáo dục quốc phòng",
                          "giáo dục quốc phòng và an ninh",
                        ],
                        ["giáo dục thể chất", "giáo dục thể chất"],
                        ["nhập môn tin học", "nhập môn tin học"],
                      ];
                      for (const [pattern1, pattern2] of specialMatches) {
                        if (
                          (curriculumName.includes(pattern1) &&
                            searchName.includes(pattern1)) ||
                          (curriculumName.includes(pattern2) &&
                            searchName.includes(pattern2))
                        ) {
                          const soTLT =
                            subject.soTLT || subject["Số TCTL"] || null;
                          const soTTH =
                            subject.soTTH || subject["Số TCTH"] || null;
                          return {
                            soTLT: soTLT ? parseInt(soTLT) : null,
                            soTTH: soTTH ? parseInt(soTTH) : null,
                          };
                        }
                      }
                    }
                  }
                }
              }

              // Return best match if found with good similarity
              if (bestMatch && bestSimilarity > 0.7) {
                const soTLT = bestMatch.soTLT || bestMatch["Số TCTL"] || null;
                const soTTH = bestMatch.soTTH || bestMatch["Số TCTH"] || null;
                return {
                  soTLT: soTLT ? parseInt(soTLT) : null,
                  soTTH: soTTH ? parseInt(soTTH) : null,
                };
              }

              // Only show warning for subjects that are not in the ignore list
              const ignoreWarnings = [
                "giáo dục quốc phòng",
                "giáo dục thể chất",
                "tiếng anh",
                "chứng chỉ tiếng anh",
              ];

              const shouldIgnoreWarning = ignoreWarnings.some((ignore) =>
                subjectName.toLowerCase().includes(ignore)
              );

              if (!shouldIgnoreWarning) {
                console.warn(`No curriculum info found for "${subjectName}"`);
              }

              return { soTLT: null, soTTH: null };
            };
            console.log("Curriculum data loaded in GradesPageContent");
            setCurriculumLoaded(true);
          } catch (error) {
            console.error("Lỗi parse curriculum data:", error);
            setCurriculumLoaded(true);
          }
        } else {
          console.log("Không có dữ liệu chương trình khung trong storage");
          setCurriculumLoaded(true);
        }
      });
    };

    loadCurriculumData();
  }, []);

  // Auto-classify subjects when both curriculum and grades data are ready
  React.useEffect(() => {
    if (curriculumLoaded && gradesData) {
      // console.log('Both curriculum and grades data ready, starting auto-classification...');
      const newSubjectTypes = {};

      gradesData.semesters.forEach((semester, semesterIndex) => {
        semester.subjects.forEach((subject, subjectIndex) => {
          const key = `${semesterIndex}-${subjectIndex}`;

          // Chỉ auto-classify những môn chưa được thay đổi thủ công
          if (!manuallyChangedSubjects[key]) {
            const autoType = getAutoSubjectType(subject.name, subject);
            // console.log(`Auto-classifying "${subject.name}" as: ${autoType}`);
            newSubjectTypes[key] = autoType;
          } else {
            // Giữ nguyên lựa chọn thủ công của người dùng
            newSubjectTypes[key] = subjectTypes[key];
            // console.log(`Keeping manual selection for "${subject.name}": ${subjectTypes[key]}`);
          }
        });
      });

      setSubjectTypes(newSubjectTypes);
      // console.log('Auto-classification completed for real data:', newSubjectTypes);
    }
  }, [curriculumLoaded, gradesData, manuallyChangedSubjects]);

  // Danh sách môn bỏ qua khi tính GPA
  const listSubjectIgnoresCalcScore = [
    "giáo dục thể chất 1",
    "giáo dục thể chất 2",
    "giáo dục quốc phòng và an ninh 1",
    "giáo dục quốc phòng và an ninh 2",
    "tiếng anh 1",
    "tiếng anh 2",
  ];

  React.useEffect(() => {
    loadGradesFromStorage();
  }, [keyValue]);

  // Close all dropdowns when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".custom-dropdown")) {
        setOpenDropdowns({});
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Hàm làm tròn điểm theo quy tắc IUH
  const roundScoreIUH = (score) => {
    if (score === null || score === undefined || isNaN(score)) return null;

    // Validate range 0-10
    if (score < 0) return 0;
    if (score > 10) return 10;

    const integerPart = Math.floor(score);
    const decimalPart = score - integerPart;

    if (decimalPart < 0.25) {
      return integerPart;
    } else if (decimalPart < 0.75) {
      return integerPart + 0.5;
    } else {
      return integerPart + 1.0;
    }
  };

  // Hàm validate điểm đầu vào
  const validateScore = (value) => {
    if (value === "" || value === null || value === undefined) {
      return { isValid: true, value: null };
    }

    // Convert Vietnamese decimal format to JS format
    const normalizedValue = value.toString().replace(",", ".");
    const numValue = parseFloat(normalizedValue);

    // Check if it's a valid number
    if (isNaN(numValue)) {
      return { isValid: false, value: null, error: "Điểm phải là số" };
    }

    // Check range 0-10
    if (numValue < 0 || numValue > 10) {
      return { isValid: false, value: null, error: "Điểm phải từ 0 đến 10" };
    }

    // Round according to IUH rules
    const roundedValue = roundScoreIUH(numValue);

    return { isValid: true, value: roundedValue };
  };

  // Hàm kiểm tra môn đặc biệt (chỉ có một cột điểm tổng kết)
  const isSpecialSubject = (subjectName, subject = null) => {
    const specialSubjects = [
      "thực tập doanh nghiệp",
      "khóa luận tốt nghiệp",
      "đồ án tốt nghiệp",
      "thực tập tốt nghiệp",
      "luận văn tốt nghiệp",
      "thực tập chuyên ngành",
      "đồ án chuyên ngành",
      "giáo dục thể chất 1",
      "giáo dục thể chất 2",
    ];

    // Kiểm tra danh sách môn đặc biệt cố định
    const isInSpecialList = specialSubjects.some((special) =>
      subjectName.toLowerCase().includes(special.toLowerCase())
    );

    if (isInSpecialList) {
      return true;
    }

    // Kiểm tra đặc biệt cho "Tiếng Anh 2" và các môn tương tự
    if (subjectName.toLowerCase().includes("tiếng anh") && subject) {
      // Kiểm tra xem có điểm giữa kỳ và thường xuyên không
      const hasGiuaKy =
        subject.diemGiuaKy !== null && subject.diemGiuaKy !== undefined;
      const hasThuongXuyen = subject.thuongXuyen.some(
        (score) => score !== null && score !== undefined
      );

      // Nếu không có điểm giữa kỳ và thường xuyên → môn đặc biệt
      if (!hasGiuaKy && !hasThuongXuyen) {
        return true;
      }
    }

    return false;
  };

  // Hàm xử lý thay đổi loại môn học
  const handleSubjectTypeChange = (semesterIndex, subjectIndex, newType) => {
    const key = `${semesterIndex}-${subjectIndex}`;

    // Cập nhật loại môn học
    setSubjectTypes((prev) => ({
      ...prev,
      [key]: newType,
    }));

    // Đánh dấu môn này đã được thay đổi thủ công
    setManuallyChangedSubjects((prev) => ({
      ...prev,
      [key]: true,
    }));

    console.log(`User manually changed subject type for ${key} to ${newType}`);
  };

  // Hàm tự động xác định loại môn dựa trên chương trình khung
  const getAutoSubjectType = (subjectName, subject = null) => {
    try {
      // Kiểm tra đặc biệt cho "Tiếng Anh" khi không có điểm giữa kỳ và thường xuyên
      if (subject && subjectName.toLowerCase().includes("tiếng anh")) {
        const hasGiuaKy =
          subject.diemGiuaKy !== null && subject.diemGiuaKy !== undefined;
        const hasThuongXuyen = subject.thuongXuyen.some(
          (score) => score !== null && score !== undefined
        );

        // Nếu không có điểm giữa kỳ và thường xuyên → môn đặc biệt (chỉ có điểm cuối kỳ)
        if (!hasGiuaKy && !hasThuongXuyen) {
          // console.log(`→ "${subjectName}" classified as SPECIAL (no midterm/regular scores)`);
          return "SPECIAL"; // Môn đặc biệt
        }
      }

      // Kiểm tra curriculum đã được load chưa
      if (!curriculumLoaded) {
        console.log("Curriculum not loaded yet, defaulting to CHUA_XAC_DINH");
        return "CHUA_XAC_DINH";
      }

      // Kiểm tra xem có dữ liệu chương trình khung không
      if (typeof window.getCurriculumInfo !== "function") {
        console.log(
          "No curriculum data available, defaulting to CHUA_XAC_DINH"
        );
        return "CHUA_XAC_DINH";
      }

      // Kiểm tra xem window.getCurriculumInfo có tồn tại không
      if (typeof window.getCurriculumInfo === "function") {
        const curriculumInfo = window.getCurriculumInfo(subjectName);
        // console.log(`Full curriculum info for "${subjectName}":`, curriculumInfo);

        if (
          curriculumInfo &&
          (curriculumInfo.soTLT !== null || curriculumInfo.soTTH !== null)
        ) {
          let soTLT = curriculumInfo.soTLT;
          let soTTH = curriculumInfo.soTTH;

          // Kiểm tra các tên thuộc tính khác có thể có
          if (soTLT === null || soTLT === undefined) {
            soTLT =
              curriculumInfo.soTinChiLyThuyet ||
              curriculumInfo.lyThuyet ||
              curriculumInfo.LT ||
              0;
          }
          if (soTTH === null || soTTH === undefined) {
            soTTH =
              curriculumInfo.soTinChiThucHanh ||
              curriculumInfo.thucHanh ||
              curriculumInfo.TH ||
              0;
          }

          // console.log(`Auto classify "${subjectName}": soTLT=${soTLT}, soTTH=${soTTH}`);

          // Xác định loại môn dựa trên soTLT và soTTH
          if (soTLT > 0 && soTTH > 0) {
            // console.log(`→ Classified as TÍCH HỢP`);
            return "TICH_HOP"; // Môn tích hợp
          } else if (soTLT === 0 && soTTH > 0) {
            // console.log(`→ Classified as THỰC HÀNH`);
            return "TH"; // Môn thực hành
          } else if (soTLT > 0 && soTTH === 0) {
            // console.log(`→ Classified as LÝ THUYẾT`);
            return "LT"; // Môn lý thuyết
          }
        } else {
          // Không tìm thấy thông tin trong chương trình khung, sử dụng logic dự phòng
          console.log(
            `No curriculum info found for "${subjectName}", defaulting to CHUA_XAC_DINH`
          );
          return "CHUA_XAC_DINH";
        }
      }
    } catch (error) {
      console.warn("Lỗi khi lấy thông tin từ chương trình khung:", error);
      return "CHUA_XAC_DINH";
    }

    console.log(
      `→ Default to CHƯA XÁC ĐỊNH for "${subjectName}" (no curriculum data or fallback)`
    );
    // Mặc định là chưa xác định nếu không có chương trình khung
    return "CHUA_XAC_DINH";
  }; // Hàm lấy loại môn học hiện tại
  const getCurrentSubjectType = (semesterIndex, subjectIndex) => {
    const key = `${semesterIndex}-${subjectIndex}`;

    // Nếu đã có trong state (từ phân loại tự động hoặc lựa chọn thủ công), sử dụng nó
    if (subjectTypes[key]) {
      return subjectTypes[key];
    }

    // Nếu chưa có, thử phân loại tự động (fallback case)
    if (
      gradesData &&
      gradesData.semesters &&
      gradesData.semesters[semesterIndex] &&
      gradesData.semesters[semesterIndex].subjects &&
      gradesData.semesters[semesterIndex].subjects[subjectIndex]
    ) {
      const subject =
        gradesData.semesters[semesterIndex].subjects[subjectIndex];
      const autoType = getAutoSubjectType(subject.name, subject);

      // Lưu kết quả tự động vào subjectTypes
      setSubjectTypes((prev) => ({
        ...prev,
        [key]: autoType,
      }));

      return autoType;
    }

    // Mặc định là Lý thuyết nếu không thể xác định
    return "LT";
  };

  // Component tạo selection button cho loại môn học
  createSubjectTypeSelector = (semesterIndex, subjectIndex) => {
    const currentType = getCurrentSubjectType(semesterIndex, subjectIndex);
    const dropdownKey = `${semesterIndex}-${subjectIndex}`;
    const isOpen = openDropdowns[dropdownKey] || false;
    const isManuallyChanged = manuallyChangedSubjects[dropdownKey] || false;

    const options = [
      {
        value: "CHUA_XAC_DINH",
        label: "N/A",
        title: "Chưa xác định loại môn (cho phép nhập tất cả cột)",
      },
      {
        value: "LT",
        label: "Lý thuyết",
        title: "Môn lý thuyết (soTLT > 0, soTTH = 0)",
      },
      {
        value: "TH",
        label: "Thực hành",
        title: "Môn thực hành (soTLT = 0, soTTH > 0)",
      },
      {
        value: "TICH_HOP",
        label: "Tích hợp",
        title: "Môn tích hợp (soTLT > 0, soTTH > 0)",
      },
      {
        value: "SPECIAL",
        label: "Đặc biệt",
        title: "Môn đặc biệt (chỉ có điểm cuối kỳ)",
      },
    ];

    // Thêm tùy chọn reset nếu môn đã được thay đổi thủ công
    if (isManuallyChanged) {
      options.push({
        value: "RESET_AUTO",
        label: "🔄 Reset về tự động",
        title: "Đặt lại về phân loại tự động theo chương trình khung",
        isReset: true,
      });
    }

    const currentOption = options.find((opt) => opt.value === currentType);

    // Function to check if dropdown should open upward
    const shouldOpenUpward = (element) => {
      if (!element) return false;

      const table = element.closest("table");
      if (!table) return false;

      const tbody = table.querySelector("tbody");
      if (!tbody) return false;

      const subjectRows = tbody.querySelectorAll("tr.subject-row");
      const totalRows = subjectRows.length;

      const currentRow = element.closest("tr.subject-row");
      if (!currentRow) return false;

      const currentIndex = Array.from(subjectRows).indexOf(currentRow);

      if (totalRows <= 3) {
        return false;
      } else if (totalRows <= 5){
        return currentIndex >= totalRows - 2;
      } else {
        return currentIndex >= totalRows - 4;
      }
    };

    const handleToggleDropdown = (event) => {
      setOpenDropdowns((prev) => {
        const isCurrentlyOpen = prev[dropdownKey];

        if (isCurrentlyOpen) {
          // Nếu dropdown hiện tại đang mở, đóng nó
          return {};
        } else {
          // Nếu dropdown hiện tại đang đóng, đóng tất cả và mở chỉ dropdown này
          return { [dropdownKey]: true };
        }
      });
    };

    const handleOptionClick = (value) => {
      if (value === "RESET_AUTO") {
        // Reset về auto-classify
        const key = `${semesterIndex}-${subjectIndex}`;

        // Xóa khỏi danh sách đã thay đổi thủ công
        setManuallyChangedSubjects((prev) => {
          const newState = { ...prev };
          delete newState[key];
          return newState;
        });

        // Tự động phân loại lại môn này
        if (
          gradesData &&
          gradesData.semesters &&
          gradesData.semesters[semesterIndex] &&
          gradesData.semesters[semesterIndex].subjects &&
          gradesData.semesters[semesterIndex].subjects[subjectIndex]
        ) {
          const subject =
            gradesData.semesters[semesterIndex].subjects[subjectIndex];
          const autoType = getAutoSubjectType(subject.name, subject);

          setSubjectTypes((prev) => ({
            ...prev,
            [key]: autoType,
          }));

          console.log(`Reset subject ${key} to auto-classify: ${autoType}`);
        }
      } else {
        handleSubjectTypeChange(semesterIndex, subjectIndex, value);
      }

      setOpenDropdowns((prev) => ({
        ...prev,
        [dropdownKey]: false,
      }));
    };

    return React.createElement(
      "td",
      {
        className: "td-subject-type",
        style: { textAlign: "center", padding: "8px", position: "relative" },
      },
      React.createElement(
        "div",
        {
          className: "custom-dropdown",
          style: {
            position: "relative",
            display: "inline-block",
            minWidth: "105px",
            maxWidth: "125px",
          },
        },
        // Custom dropdown button
        React.createElement(
          "div",
          {
            onClick: handleToggleDropdown,
            ref: (el) => {
              if (el) {
                el.dataset.dropdownKey = dropdownKey;
              }
            },
            style: {
              padding: "6px 28px 6px 12px",
              borderRadius: "6px",
              border: "none",
              outline: "none",
              backgroundColor: isOpen ? "#e2e8f0" : "#f8fafc",
              color: "#1e293b",
              fontSize: "13px",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.2s ease",
              userSelect: "none",
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            },
            title: isManuallyChanged
              ? `${
                  currentOption?.title || "Loại môn"
                } (Đã thay đổi thủ công - Click để xem tùy chọn Reset)`
              : currentOption?.title ||
                "Loại môn được xác định tự động từ chương trình khung",
          },
          React.createElement(
            "span",
            null,
            isManuallyChanged
              ? `${currentOption?.label || "Tự động"} ✏️`
              : currentOption?.label || "Tự động"
          ),
          React.createElement(
            "svg",
            {
              style: {
                width: "16px",
                height: "16px",
                transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s ease",
                position: "absolute",
                right: "8px",
              },
              fill: "none",
              viewBox: "0 0 20 20",
            },
            React.createElement("path", {
              stroke: "#6b7280",
              strokeLinecap: "round",
              strokeLinejoin: "round",
              strokeWidth: "1.5",
              d: "m6 8 4 4 4-4",
            })
          )
        ),
        // Custom dropdown menu with dynamic positioning
        isOpen &&
          React.createElement(
            "div",
            {
              ref: (el) => {
                if (el) {
                  const button = el.parentElement.querySelector(
                    '[data-dropdown-key="' + dropdownKey + '"]'
                  );
                  const openUpward = shouldOpenUpward(button);

                  if (openUpward) {
                    el.style.bottom = "100%";
                    el.style.top = "auto";
                    el.style.marginBottom = "1px";
                    el.style.marginTop = "0";
                  } else {
                    el.style.top = "100%";
                    el.style.bottom = "auto";
                    el.style.marginTop = "1px";
                    el.style.marginBottom = "0";
                  }

                  el.style.opacity = "0";
                  el.style.transform = openUpward
                    ? "translateY(5px)"
                    : "translateY(-5px)";

                  requestAnimationFrame(() => {
                    el.style.transition =
                      "opacity 0.15s ease, transform 0.15s ease";
                    el.style.opacity = "1";
                    el.style.transform = "translateY(0)";
                  });
                }
              },
              style: {
                position: "absolute",
                left: "0",
                right: "0",
                backgroundColor: "#ffffff",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                boxShadow:
                  "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                zIndex: 1000,
                overflow: "hidden",
                maxHeight: "200px",
                overflowY: "auto",
              },
            },
            options.map((option, index) =>
              React.createElement(
                "div",
                {
                  key: option.value,
                  onClick: () => handleOptionClick(option.value),
                  style: {
                    padding: "8px 10px",
                    fontSize: "13px",
                    fontWeight: option.isReset ? "bold" : "500",
                    cursor: "pointer",
                    backgroundColor:
                      option.value === currentType
                        ? "#eff6ff"
                        : option.isReset
                        ? "#f0f9ff"
                        : "#ffffff",
                    color:
                      option.value === currentType
                        ? "#1d4ed8"
                        : option.isReset
                        ? "#0369a1"
                        : "#374151",
                    transition: "background-color 0.1s ease",
                    borderTop: option.isReset ? "1px solid #e5e7eb" : "none",
                  },
                  title: option.title,
                },
                option.label
              )
            )
          )
      )
    );
  };

  const loadGradesFromStorage = async () => {
    setIsLoading(true);
    setError(null);

    // Reset trạng thái thay đổi thủ công khi load dữ liệu mới
    setManuallyChangedSubjects({});

    try {
      // Attempt to load from Chrome storage first
      if (typeof chrome !== "undefined" && chrome.storage) {
        chrome.storage.local.get(["diem_json"], (result) => {
          if (result.diem_json) {
            try {
              const storedData = JSON.parse(result.diem_json);
              const processedData = processIUHGradesData(storedData);

              // Tính toán summary cho dữ liệu thật
              if (processedData && processedData.semesters) {
                processedData.semesters.forEach((semester, index) => {
                  calculateSemesterSummary(
                    semester,
                    index,
                    processedData.semesters
                  );
                });
              }

              setGradesData(processedData);
            } catch (parseError) {
              console.error("Error parsing stored grades data:", parseError);
              loadMockData();
            }
          } else {
            console.log("No grades data found in storage, loading mock data");
            loadMockData();
          }
          setIsLoading(false);
        });
      } else {
        // Fallback to mock data if chrome storage not available
        loadMockData();
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error loading grades:", error);
      setError("Không thể tải dữ liệu điểm");
      loadMockData();
      setIsLoading(false);
    }
  };

  const loadMockData = () => {
    // Reset trạng thái thay đổi thủ công khi load mock data
    setManuallyChangedSubjects({});

    // Mock data theo format IUH từ hình ảnh
    const mockData = {
      semesters: [
        {
          name: "HK1 (2022 - 2023)",
          subjects: [
            {
              stt: 1,
              maLhp: "420300200907",
              name: "Nhập môn Tin học",
              credits: 2,
              diemGiuaKy: 7.5,
              thuongXuyen: [8.5, 8.5, null, null],
              thucHanh: [null, null, null, null, null],
              diemCuoiKy: 8.0,
              diemTongKet: 8.0,
              thangDiem4: 3.5,
              diemChu: "B+",
              xepLoai: "Khá",
              ghiChu: "",
              dat: "✓",
            },
            {
              stt: 2,
              maLhp: "420300319249",
              name: "Kỹ năng làm việc nhóm",
              credits: 2,
              diemGiuaKy: 8.5,
              thuongXuyen: [9.5, 8.0, null, null],
              thucHanh: [8.0, 8.5, 8.0, null, null],
              diemCuoiKy: 9.5,
              diemTongKet: 8.6,
              thangDiem4: 3.8,
              diemChu: "A",
              xepLoai: "Giỏi",
              ghiChu: "",
              dat: "✓",
            },
            {
              stt: 3,
              maLhp: "420300324283",
              name: "Giáo dục Quốc phòng và An ninh 1",
              credits: 4,
              diemGiuaKy: 8.5,
              thuongXuyen: [9.5, 9.5, 8.0, null],
              thucHanh: [null, null, null, null, null],
              diemCuoiKy: 7.0,
              diemTongKet: 7.9,
              thangDiem4: 3.0,
              diemChu: "B",
              xepLoai: "Khá",
              ghiChu: "",
              dat: "✓",
            },
            {
              stt: 4,
              maLhp: "420300325966",
              name: "Toán cao cấp 1",
              credits: 2,
              diemGiuaKy: 10.0,
              thuongXuyen: [9.0, 9.0, null, null],
              thucHanh: [null, null, null, null, null],
              diemCuoiKy: 9.0,
              diemTongKet: 9.3,
              thangDiem4: 4.0,
              diemChu: "A+",
              xepLoai: "Xuất sắc",
              ghiChu: "",
              dat: "✓",
            },
            {
              stt: 5,
              maLhp: "420300330741",
              name: "Giáo dục thể chất 1",
              credits: 2,
              diemGiuaKy: null,
              thuongXuyen: [null, null, null, null],
              thucHanh: [null, null, null, null, null],
              diemCuoiKy: 7.0,
              diemTongKet: 7.0,
              thangDiem4: 3.0,
              diemChu: "B",
              xepLoai: "Khá",
              ghiChu: "",
              dat: "✓",
            },
            {
              stt: 6,
              maLhp: "420300384837",
              name: "Nhập môn Lập trình",
              credits: 2,
              diemGiuaKy: 0,
              thuongXuyen: [null, null, null, null],
              thucHanh: [10.0, 9.0, 10.0, null, null],
              diemCuoiKy: 10.0,
              diemTongKet: null,
              thangDiem4: 0,
              diemChu: "F",
              xepLoai: "Kém",
              ghiChu: "Cấm thi",
              dat: "",
            },
            {
              stt: 7,
              maLhp: "420301416477",
              name: "Triết học Mác - Lênin",
              credits: 3,
              diemGiuaKy: 7.0,
              thuongXuyen: [10.0, 10.0, 9.5, null],
              thucHanh: [null, null, null, null, null],
              diemCuoiKy: 0,
              diemTongKet: 0,
              thangDiem4: 0,
              diemChu: "F",
              xepLoai: "Kém",
              ghiChu: "Cuối kỳ = 0",
              dat: "",
            },
            {
              stt: 8,
              maLhp: "420301416500",
              name: "Thực tập doanh nghiệp",
              credits: 4,
              diemGiuaKy: null,
              thuongXuyen: [null, null, null, null],
              thucHanh: [null, null, null, null, null],
              diemCuoiKy: 8.5,
              diemTongKet: 8.5,
              thangDiem4: 3.5,
              diemChu: "B+",
              xepLoai: "Khá",
              ghiChu: "",
              dat: "✓",
            },
            {
              stt: 9,
              maLhp: "420300200908",
              name: "Vật lý đại cương",
              credits: 3,
              diemGiuaKy: 8.0,
              thuongXuyen: [7.5, 8.0, null, null],
              thucHanh: [null, null, null, null, null],
              diemCuoiKy: 2.5,
              diemTongKet: null,
              thangDiem4: 0,
              diemChu: "F",
              xepLoai: "Kém",
              ghiChu: "CK < 3",
              dat: "",
            },
          ],
        },
      ],
    };

    // Set dữ liệu trước
    setGradesData(mockData);

    // Chờ curriculum data được load trước khi phân loại
    const waitForCurriculumAndClassify = () => {
      if (!curriculumLoaded) {
        console.log("Waiting for curriculum to load...");
        setTimeout(waitForCurriculumAndClassify, 500);
        return;
      }

      console.log("Starting auto classification for mock data...");
      const newSubjectTypes = {};

      mockData.semesters.forEach((semester, semesterIndex) => {
        semester.subjects.forEach((subject, subjectIndex) => {
          const key = `${semesterIndex}-${subjectIndex}`;
          const autoType = getAutoSubjectType(subject.name, subject);
          // console.log(`Subject "${subject.name}" auto-classified as: ${autoType}`);
          newSubjectTypes[key] = autoType;
        });
      });

      setSubjectTypes(newSubjectTypes);
      console.log("Auto classification completed:", newSubjectTypes);
    };

    waitForCurriculumAndClassify();
  };

  // Process raw IUH data from contentScript into our format
  const processIUHGradesData = (rawData) => {
    if (!Array.isArray(rawData)) return null;

    const semesters = rawData.map((semester, index) => ({
      name: semester.hocKy || `Học kỳ ${index + 1}`,
      subjects: semester.monHoc
        ? semester.monHoc
            .filter((subject, subIndex) => {
              // Only take actual subjects (usually index 0-6), skip summary rows
              // Summary rows have STT like "Điểm trung bình học kỳ hệ 10: ..."
              const stt = subject["STT"];
              return (
                stt &&
                !stt.includes("Điểm trung bình") &&
                !stt.includes("Tổng số") &&
                !stt.includes("Xếp loại học lực")
              );
            })
            .map((subject, subIndex) => {
              // Parse scores from IUH format
              const parseScore = (scoreStr) => {
                if (!scoreStr || scoreStr === "") {
                  return null;
                }
                // Convert Vietnamese decimal format (8,50) to JS format (8.50)
                const normalizedStr = scoreStr.toString().replace(",", ".");
                const parsed = parseFloat(normalizedStr);
                if (isNaN(parsed)) {
                  return null;
                }
                // Làm tròn đến 1 chữ số thập phân
                return Math.round(parsed * 10) / 10;
              };

              const subjectName =
                subject["Tên môn học"] || subject["Tên môn học/học phần"] || "";

              // Tạm thời đặt loại mặc định, sẽ được cập nhật sau khi curriculum load xong
              const key = `${index}-${subIndex}`;

              // Lưu loại môn mặc định vào state (sẽ được cập nhật sau)
              setSubjectTypes((prev) => ({
                ...prev,
                [key]: "CHUA_XAC_DINH", // Default to chưa xác định, will be updated after curriculum loads
              }));

              return {
                stt: subIndex + 1,
                maLhp: subject["Mã lớp học phần"] || "",
                name: subjectName,
                credits:
                  parseInt(subject["Số tín chỉ"] || subject["Tín chỉ"]) || 0,
                diemGiuaKy: parseScore(subject["Giữa kỳ"]),
                // Parse Thường xuyên columns (4 columns)
                thuongXuyen: [
                  parseScore(subject["Thường xuyên LT Hệ số 1 1"]),
                  parseScore(subject["Thường xuyên LT Hệ số 1 2"]),
                  parseScore(subject["Thường xuyên LT Hệ số 1 3"]),
                  parseScore(subject["Thường xuyên LT Hệ số 1 4"]),
                ],
                // Parse Thực hành columns (5 columns)
                thucHanh: [
                  parseScore(subject["Thực hành 1"]),
                  parseScore(subject["Thực hành 2"]),
                  parseScore(subject["Thực hành 3"]),
                  parseScore(subject["Thực hành 4"]),
                  parseScore(subject["Thực hành 5"]),
                ],
                diemCuoiKy: parseScore(subject["Cuối kỳ"]),
                diemTongKet: parseScore(subject["Điểm tổng kết"]),
                thangDiem4: parseScore(subject["Thang điểm 4"]),
                diemChu: subject["Điểm chữ"] || "",
                xepLoai: subject["Xếp loại"] || "",
                ghiChu: subject["Ghi chú"] || "",
                dat: subject["Đạt"] || "",
              };
            })
        : [],
    }));

    return { semesters: semesters };
  };

  // Hàm tính điểm từ CalculateScore.js
  const calculateScore = (score, semesterIndex, subjectIndex) => {
    const { dsDiemTK, dsDiemTH, giuaKy, cuoiKy, tinChi } = score;

    // Lấy loại môn được chọn thủ công hoặc tự động
    const subjectType = getCurrentSubjectType(semesterIndex, subjectIndex);

    let diemTongKet = 0;
    const slDiemLTKhacKhong = dsDiemTK.filter((score) => score !== 0).length;
    const slDiemTHKhacKhong = dsDiemTH.filter((score) => score !== 0).length;

    // Debug log để kiểm tra
    console.log(
      `Subject type: ${subjectType}, slDiemLTKhacKhong: ${slDiemLTKhacKhong}, slDiemTHKhacKhong: ${slDiemTHKhacKhong}`
    );
    console.log(`dsDiemTK:`, dsDiemTK);
    console.log(`dsDiemTH:`, dsDiemTH);

    if (subjectType === "TH") {
      // Môn thực hành - tính trung bình cộng của các điểm thực hành đã nhập
      const validScores = dsDiemTH.filter(
        (score) => score !== null && score !== undefined && score !== 0
      );
      if (validScores.length > 0) {
        diemTongKet =
          validScores.reduce((sum, score) => sum + score, 0) /
          validScores.length;
        console.log(
          `Practical subject calculation: ${diemTongKet} from scores:`,
          validScores
        );
      } else {
        // Nếu chưa có điểm thực hành nào, trả về null để không hiển thị kết quả
        console.log("No practical scores available");
        return {
          diemTongKet: null,
          diemTongKet4: null,
          diemChu: "",
          xepLoai: "",
          ghiChu: "",
          isDat: false,
        };
      }
    } else if (subjectType === "LT") {
      // Môn lý thuyết - chỉ dùng công thức lý thuyết
      if (slDiemLTKhacKhong > 0) {
        diemTongKet =
          ((dsDiemTK.reduce((prev, curr) => prev + curr, 0) /
            slDiemLTKhacKhong) *
            20 +
            giuaKy * 30 +
            cuoiKy * 50) /
          100;
      } else {
        // Nếu chưa có điểm thường xuyên, chỉ tính giữa kỳ và cuối kỳ
        diemTongKet = (giuaKy * 30 + cuoiKy * 70) / 100;
      }
    } else if (subjectType === "TICH_HOP" || subjectType === "CHUA_XAC_DINH") {
      // Môn tích hợp hoặc chưa xác định - kết hợp lý thuyết và thực hành
      const diemTongKetLT =
        slDiemLTKhacKhong > 0
          ? ((dsDiemTK.reduce((prev, curr) => prev + curr, 0) /
              slDiemLTKhacKhong) *
              20 +
              giuaKy * 30 +
              cuoiKy * 50) /
            100
          : (giuaKy * 30 + cuoiKy * 70) / 100;

      const validThucHanhScores = dsDiemTH.filter(
        (score) => score !== null && score !== undefined && score !== 0
      );

      if (validThucHanhScores.length > 0) {
        const diemTongKetTH =
          validThucHanhScores.reduce((sum, score) => sum + score, 0) /
          validThucHanhScores.length;
        if (tinChi === 2) {
          // Môn tích hợp 2 tín chỉ: 0.4 tín lý thuyết + 0.6 tín thực hành
          diemTongKet = diemTongKetLT * 0.4 + diemTongKetTH * 0.6;
        } else if (tinChi === 3) {
          // Môn tích hợp 3 tín chỉ: 2 tín lý thuyết + 1 tín thực hành
          diemTongKet = (diemTongKetLT * 2 + diemTongKetTH) / 3;
        } else {
          // Môn tích hợp 4+ tín chỉ: 3 tín lý thuyết + 1 tín thực hành
          diemTongKet = (diemTongKetLT * 3 + diemTongKetTH) / 4;
        }
      } else {
        // Nếu chưa có điểm thực hành, chỉ tính phần lý thuyết
        diemTongKet = diemTongKetLT;
      }
    } else {
      // Môn đặc biệt - chỉ dùng điểm cuối kỳ
      diemTongKet = cuoiKy;
    }

    const diemTongKet4 = convertScore10To4(diemTongKet);
    return {
      diemTongKet: diemTongKet,
      diemTongKet4: diemTongKet4,
      diemChu: convertScore4ToChar(diemTongKet4),
      xepLoai: convertScore4ToClassification(diemTongKet4),
      ghiChu: diemTongKet4 !== 0 ? "" : "Học lại",
      isDat: diemTongKet4 !== 0,
    };
  };

  // Hàm chuyển đổi điểm từ CalculateScore.js
  const convertScore10To4 = (score) => {
    // Làm tròn điểm đến 1 chữ số thập phân trước khi chuyển đổi
    score = Math.round(score * 10) / 10;
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

  const convertScore4ToClassificationHK = (score) => {
    // Làm tròn điểm để tránh lỗi floating point với 2 chữ số thập phân
    score = Math.round(score * 100) / 100;

    if (score >= 3.6) return "Xuất sắc";
    if (score >= 3.2) return "Giỏi";
    if (score >= 2.5) return "Khá";
    if (score >= 2.0) return "Trung bình";
    return "Kém";
  };

  // Hàm xử lý khi điểm thay đổi
  const handleScoreChange = (semesterIndex, subjectIndex, field, value) => {
    const newGradesData = { ...gradesData };
    const subject =
      newGradesData.semesters[semesterIndex].subjects[subjectIndex];
    const selectedType = getCurrentSubjectType(semesterIndex, subjectIndex);

    // Validate điểm với quy tắc IUH
    const validation = validateScore(value);
    if (!validation.isValid) {
      // Hiển thị lỗi cho user (có thể thêm toast notification sau)
      console.warn("Validation error:", validation.error);
      return;
    }

    const parsedValue = validation.value;

    // Cập nhật điểm
    if (field.startsWith("thuongXuyen")) {
      const index = parseInt(field.split("-")[1]);
      subject.thuongXuyen[index] = parsedValue;
    } else if (field.startsWith("thucHanh")) {
      const index = parseInt(field.split("-")[1]);
      subject.thucHanh[index] = parsedValue;
    } else {
      subject[field] = parsedValue;
    }

    // Xử lý tính điểm dựa trên loại môn được chọn
    if (selectedType === "SPECIAL") {
      // Môn đặc biệt: chỉ cần có điểm tổng kết (từ cột cuối kỳ)
      if (field === "diemCuoiKy" && parsedValue !== null) {
        if (parsedValue < 3 && parsedValue !== 0) {
          // Điểm cuối kỳ < 3 (nhưng không phải 0) - không đạt
          subject.diemTongKet = null;
          subject.thangDiem4 = 0;
          subject.diemChu = "F";
          subject.xepLoai = "Kém";
          subject.ghiChu = "CK < 3";
          subject.dat = "";
        } else if (parsedValue > 0) {
          subject.diemTongKet = parsedValue;
          subject.thangDiem4 = convertScore10To4(parsedValue);
          subject.diemChu = convertScore4ToChar(subject.thangDiem4);
          subject.xepLoai = convertScore4ToClassification(subject.thangDiem4);
          subject.ghiChu = subject.thangDiem4 !== 0 ? "" : "Học lại";
          subject.dat = subject.thangDiem4 !== 0 ? "✓" : "";
        } else if (parsedValue === 0) {
          // Điểm cuối kỳ = 0 - không đạt
          subject.diemTongKet = parsedValue;
          subject.thangDiem4 = 0;
          subject.diemChu = "F";
          subject.xepLoai = "Kém";
          subject.ghiChu = "CK = 0";
          subject.dat = "";
        }
      } else if (field === "diemCuoiKy" && parsedValue === null) {
        // Nếu xóa điểm cuối kỳ, reset tất cả
        subject.diemTongKet = null;
        subject.thangDiem4 = 0;
        subject.diemChu = "";
        subject.xepLoai = "";
        subject.ghiChu = "";
        subject.dat = "";
      }
    } else {
      // Logic tính điểm bình thường cho các môn khác
      const dsDiemTK = subject.thuongXuyen.filter(
        (score) => score !== null && score !== undefined
      );
      const dsDiemTH = subject.thucHanh.filter(
        (score) => score !== null && score !== undefined
      );
      const giuaKy =
        subject.diemGiuaKy !== null && subject.diemGiuaKy !== undefined
          ? subject.diemGiuaKy
          : null;
      const cuoiKy =
        subject.diemCuoiKy !== null && subject.diemCuoiKy !== undefined
          ? subject.diemCuoiKy
          : null;

      // Kiểm tra điều kiện tính điểm dựa trên loại môn
      if (selectedType === "TH") {
        // Môn thực hành - chỉ cần có ít nhất 1 điểm thực hành
        if (dsDiemTH.length > 0) {
          const scoreData = {
            dsDiemTK: subject.thuongXuyen.map((s) =>
              s !== null && s !== undefined ? s : 0
            ),
            dsDiemTH: subject.thucHanh.map((s) =>
              s !== null && s !== undefined ? s : 0
            ),
            giuaKy: giuaKy || 0,
            cuoiKy: cuoiKy || 0,
            tinChi: subject.credits,
          };

          const result = calculateScore(scoreData, semesterIndex, subjectIndex);
          subject.diemTongKet = result.diemTongKet;
          subject.thangDiem4 = result.diemTongKet4;
          subject.diemChu = result.diemChu;
          subject.xepLoai = result.xepLoai;
          subject.ghiChu = result.ghiChu;
          subject.dat = result.isDat ? "✓" : "";
        } else {
          // Chưa có điểm thực hành
          subject.diemTongKet = null;
          subject.thangDiem4 = null;
          subject.diemChu = "";
          subject.xepLoai = "";
          subject.ghiChu = "";
          subject.dat = "";
        }
      } else {
        // Môn lý thuyết, môn tích hợp, hoặc chưa xác định - cần điểm giữa kỳ và cuối kỳ
        if (giuaKy === null || giuaKy === undefined) {
          // Chưa có điểm giữa kỳ
          subject.diemTongKet = null;
          subject.thangDiem4 = null;
          subject.diemChu = "";
          subject.xepLoai = "";
          subject.ghiChu = "";
          subject.dat = "";
        } else if (giuaKy === 0) {
          // Điểm giữa kỳ = 0 (cấm thi)
          subject.diemTongKet = null;
          subject.thangDiem4 = 0;
          subject.diemChu = "F";
          subject.xepLoai = "Kém";
          subject.ghiChu = "Cấm thi";
          subject.dat = "";
        } else if (cuoiKy !== null && cuoiKy < 3) {
          // Điểm cuối kỳ < 3 - không đạt
          subject.diemTongKet = null;
          subject.thangDiem4 = 0;
          subject.diemChu = "F";
          subject.xepLoai = "Kém";
          if (cuoiKy === 0) {
            subject.ghiChu = "CK = 0";
          } else {
            subject.ghiChu = "CK < 3";
          }
          subject.dat = "";
        } else if (dsDiemTK.length >= 2 && giuaKy !== null && cuoiKy !== null) {
          const scoreData = {
            dsDiemTK: subject.thuongXuyen.map((s) =>
              s !== null && s !== undefined ? s : 0
            ),
            dsDiemTH: subject.thucHanh.map((s) =>
              s !== null && s !== undefined ? s : 0
            ),
            giuaKy: giuaKy,
            cuoiKy: cuoiKy,
            tinChi: subject.credits,
          };

          const result = calculateScore(scoreData, semesterIndex, subjectIndex);
          subject.diemTongKet = result.diemTongKet;
          subject.thangDiem4 = result.diemTongKet4;
          subject.diemChu = result.diemChu;
          subject.xepLoai = result.xepLoai;
          subject.ghiChu = result.ghiChu;
          subject.dat = result.isDat ? "✓" : "";
        }
      }
    }

    // Tính lại thống kê học kỳ cho kỳ hiện tại và tất cả các kỳ sau
    // (vì điểm tích lũy sẽ ảnh hưởng đến các kỳ sau)
    for (let i = semesterIndex; i < newGradesData.semesters.length; i++) {
      calculateSemesterSummary(
        newGradesData.semesters[i],
        i,
        newGradesData.semesters
      );
    }

    setGradesData(newGradesData);
  };

  // Tính thống kê học kỳ mở rộng theo CalculateScore.js
  const calculateSemesterSummary = (
    semester,
    semesterIndex = 0,
    allSemesters = []
  ) => {
    const validSubjects = semester.subjects.filter(
      (subject) =>
        !listSubjectIgnoresCalcScore.includes(
          subject.name.toLowerCase().trim()
        ) &&
        subject.diemTongKet !== null &&
        subject.diemTongKet !== undefined
    );

    // Chỉ tạo summary khi có ít nhất 1 môn có điểm
    if (validSubjects.length === 0) {
      semester.summary = null;
      return;
    }

    const passedSubjects = validSubjects.filter(
      (subject) => subject.diemChu && subject.diemChu !== "F"
    );

    // Tính điểm trung bình học kỳ hiện tại
    const tong10HocKy = validSubjects.reduce(
      (sum, subject) => sum + subject.diemTongKet * subject.credits,
      0
    );
    const tong4HocKy = validSubjects.reduce(
      (sum, subject) => sum + subject.thangDiem4 * subject.credits,
      0
    );
    const tongTinChiHocKy = validSubjects.reduce(
      (sum, subject) => sum + subject.credits,
      0
    );
    const tongTinChiDatHocKy = passedSubjects.reduce(
      (sum, subject) => sum + subject.credits,
      0
    );

    // Tổng số tín chỉ đã đăng ký của học kỳ hiện tại (không tính môn ignore)
    const tongTinChiDangKyHocKy = semester.subjects
      .filter(
        (subject) =>
          !listSubjectIgnoresCalcScore.includes(
            subject.name.toLowerCase().trim()
          )
      )
      .reduce((sum, subject) => sum + subject.credits, 0);

    // Tính tổng tích lũy từ tất cả các kỳ từ đầu đến kỳ hiện tại
    let tongTinChiTichLuy = 0;
    let tongTinChiDangKyTichLuy = 0;
    let tongTinChiDatTichLuy = 0;
    let tong10TichLuy = 0;
    let tong4TichLuy = 0;

    // Duyệt qua tất cả các kỳ từ đầu đến kỳ hiện tại
    for (let i = 0; i <= semesterIndex; i++) {
      const currentSemester = allSemesters[i];
      if (!currentSemester) continue;

      const currentValidSubjects = currentSemester.subjects.filter(
        (subject) =>
          !listSubjectIgnoresCalcScore.includes(
            subject.name.toLowerCase().trim()
          ) &&
          subject.diemTongKet !== null &&
          subject.diemTongKet !== undefined
      );

      const currentPassedSubjects = currentValidSubjects.filter(
        (subject) => subject.diemChu && subject.diemChu !== "F"
      );

      // Cộng dồn tín chỉ và điểm
      tongTinChiTichLuy += currentValidSubjects.reduce(
        (sum, subject) => sum + subject.credits,
        0
      );
      tongTinChiDatTichLuy += currentPassedSubjects.reduce(
        (sum, subject) => sum + subject.credits,
        0
      );
      tongTinChiDangKyTichLuy += currentSemester.subjects
        .filter(
          (subject) =>
            !listSubjectIgnoresCalcScore.includes(
              subject.name.toLowerCase().trim()
            )
        )
        .reduce((sum, subject) => sum + subject.credits, 0);

      tong10TichLuy += currentValidSubjects.reduce(
        (sum, subject) => sum + subject.diemTongKet * subject.credits,
        0
      );
      tong4TichLuy += currentValidSubjects.reduce(
        (sum, subject) => sum + subject.thangDiem4 * subject.credits,
        0
      );
    }

    semester.summary = {
      // Điểm trung bình học kỳ hiện tại
      diemTrungBinhHocKy10:
        tongTinChiHocKy > 0
          ? Math.round((tong10HocKy / tongTinChiHocKy) * 100) / 100
          : 0,
      diemTrungBinhHocKy4:
        tongTinChiHocKy > 0
          ? Math.round((tong4HocKy / tongTinChiHocKy) * 100) / 100
          : 0,

      // Điểm trung bình tích lũy (từ tất cả các kỳ)
      diemTrungBinhTichLuy10:
        tongTinChiTichLuy > 0
          ? Math.round((tong10TichLuy / tongTinChiTichLuy) * 100) / 100
          : 0,
      diemTrungBinhTichLuy4:
        tongTinChiTichLuy > 0
          ? Math.round((tong4TichLuy / tongTinChiTichLuy) * 100) / 100
          : 0,

      // Tổng số tín chỉ tích lũy (từ tất cả các kỳ)
      tongTinChiDangKy: tongTinChiDangKyTichLuy,
      tongTinChiTichLuy: tongTinChiDatTichLuy,

      // Tổng số tín chỉ đạt (chỉ tính riêng cho kỳ hiện tại)
      tongTinChiDat: tongTinChiDatHocKy,
      tongTinChiNo: tongTinChiDangKyTichLuy - tongTinChiDatTichLuy,

      // Xếp loại học lực
      xepLoaiHocKy:
        tongTinChiHocKy > 0
          ? convertScore4ToClassificationHK(
              Math.round((tong4HocKy / tongTinChiHocKy) * 100) / 100
            )
          : "",
      xepLoaiTichLuy:
        tongTinChiTichLuy > 0
          ? convertScore4ToClassificationHK(
              Math.round((tong4TichLuy / tongTinChiTichLuy) * 100) / 100
            )
          : "",
    };
  };

  // Function to calculate final grade for a subject
  const calculateFinalGrade = (subject, semesterIndex, subjectIndex) => {
    const thuongXuyen = subject.thuongXuyen.filter(
      (score) => score !== null && score !== undefined
    );
    const thucHanh = subject.thucHanh.filter(
      (score) => score !== null && score !== undefined
    );
    const giuaKy =
      subject.diemGiuaKy !== null && subject.diemGiuaKy !== undefined
        ? subject.diemGiuaKy
        : null;
    const cuoiKy =
      subject.diemCuoiKy !== null && subject.diemCuoiKy !== undefined
        ? subject.diemCuoiKy
        : null;
    const tinChi = subject.credits || 0;

    if (giuaKy === null || cuoiKy === null) {
      return {
        diemHe10: null,
        diemHe4: null,
        diemChu: "",
        xepLoai: "",
      };
    }

    // Xác định loại môn từ selection thủ công hoặc tự động
    const subjectType = getCurrentSubjectType(semesterIndex, subjectIndex);

    let diemTongKet = 0;
    const diemThuongXuyen =
      thuongXuyen.length > 0
        ? thuongXuyen.reduce((sum, score) => sum + (score || 0), 0) /
          thuongXuyen.length
        : 0;

    if (subjectType === "TH") {
      // Môn thực hành - tính trung bình cộng của các điểm thực hành đã nhập
      const validScores = thucHanh.filter(
        (score) => score !== null && score !== undefined
      );
      if (validScores.length > 0) {
        diemTongKet =
          validScores.reduce((sum, score) => sum + score, 0) /
          validScores.length;
      } else {
        return {
          diemHe10: null,
          diemHe4: null,
          diemChu: "",
          xepLoai: "",
        };
      }
    } else if (subjectType === "LT") {
      // Môn lý thuyết - chỉ dùng công thức lý thuyết
      diemTongKet = diemThuongXuyen * 0.2 + giuaKy * 0.3 + cuoiKy * 0.5;
    } else if (subjectType === "TICH_HOP") {
      // Môn tích hợp - kết hợp lý thuyết và thực hành
      const validThucHanhScores = thucHanh.filter(
        (score) => score !== null && score !== undefined
      );
      const diemLT = diemThuongXuyen * 0.2 + giuaKy * 0.3 + cuoiKy * 0.5;

      if (validThucHanhScores.length > 0) {
        const diemThucHanh =
          validThucHanhScores.reduce((sum, score) => sum + score, 0) /
          validThucHanhScores.length;
        if (tinChi === 2) {
          // Môn tích hợp 2 tín chỉ: 1 tín lý thuyết + 1 tín thực hành
          diemTongKet = (diemLT * 1 + diemThucHanh * 1) / 2;
        } else if (tinChi === 3) {
          // Môn tích hợp 3 tín chỉ: 2 tín lý thuyết + 1 tín thực hành
          diemTongKet = (diemLT * 2 + diemThucHanh) / 3;
        } else {
          // Môn tích hợp 4+ tín chỉ: 3 tín lý thuyết + 1 tín thực hành
          diemTongKet = (diemLT * 3 + diemThucHanh) / 4;
        }
      } else {
        // Nếu chưa có điểm thực hành, chỉ tính phần lý thuyết
        diemTongKet = diemLT;
      }
    } else {
      // Môn đặc biệt - chỉ dùng điểm cuối kỳ
      diemTongKet = cuoiKy;
    }

    const diemHe4 = convertScore10To4(diemTongKet);

    return {
      diemHe10: diemTongKet,
      diemHe4: diemHe4,
      diemChu: convertScore4ToChar(diemHe4),
      xepLoai: convertScore4ToClassification(diemHe4),
    };
  };

  // Function to update score and recalculate
  const updateScore = (e, scoreType, semesterIndex, subjectIndex) => {
    const newValue = e.target.textContent.trim();

    // Validate điểm trước khi xử lý
    const validation = validateScore(newValue);
    if (!validation.isValid) {
      // Hiển thị lỗi trực quan
      e.target.style.color = "#dc2626";
      e.target.style.backgroundColor = "#fef2f2";
      e.target.style.border = "1px solid #dc2626";
      e.target.title = validation.error;

      // Reset sau 3 giây
      setTimeout(() => {
        e.target.style.backgroundColor = "inherit";
        e.target.style.border = "none";
        e.target.title = "";
      }, 3000);

      return;
    }

    // Reset error styling
    e.target.style.backgroundColor = "inherit";
    e.target.style.border = "none";
    e.target.title = "";

    // Convert scoreType to field name for handleScoreChange
    let field = "";
    switch (scoreType) {
      case "gk":
        field = "diemGiuaKy";
        break;
      case "tx1":
        field = "thuongXuyen-0";
        break;
      case "tx2":
        field = "thuongXuyen-1";
        break;
      case "tx3":
        field = "thuongXuyen-2";
        break;
      case "tx4":
        field = "thuongXuyen-3";
        break;
      case "th1":
        field = "thucHanh-0";
        break;
      case "th2":
        field = "thucHanh-1";
        break;
      case "th3":
        field = "thucHanh-2";
        break;
      case "th4":
        field = "thucHanh-3";
        break;
      case "th5":
        field = "thucHanh-4";
        break;
      case "ck":
        field = "diemCuoiKy";
        break;
    }

    // Use handleScoreChange to update and recalculate
    handleScoreChange(semesterIndex, subjectIndex, field, newValue);

    // Update display with rounded value
    if (validation.value !== null) {
      const displayValue = validation.value.toFixed(1).replace(".", ",");
      e.target.textContent = displayValue;
    }

    // Update visual styling for low scores
    const numValue = validation.value;
    if (
      (numValue !== null &&
        numValue !== undefined &&
        numValue >= 0 &&
        numValue <= 5) ||
      numValue === 0
    ) {
      e.target.style.color = "#dc2626";
      e.target.style.fontWeight = "bold";
      e.target.classList.add("low-score");
    } else {
      e.target.style.color = "inherit";
      e.target.style.fontWeight = "normal";
      e.target.classList.remove("low-score");
    }
  };

  // Helper function to parse score
  const parseScore = (scoreStr) => {
    if (!scoreStr || scoreStr === "") {
      return null;
    }
    // Convert Vietnamese decimal format (8,50) to JS format (8.50)
    const normalizedStr = scoreStr.toString().replace(",", ".");
    const parsed = parseFloat(normalizedStr);
    if (isNaN(parsed)) {
      return null;
    }
    // Làm tròn đến 1 chữ số thập phân
    return Math.round(parsed * 10) / 10;
  };

  // Hàm tạo ô input có thể chỉnh sửa với logic màu đỏ cho điểm ≤ 5
  const createEditableCell = (
    value,
    scoreType,
    semesterIndex,
    subjectIndex
  ) => {
    const subject = gradesData.semesters[semesterIndex].subjects[subjectIndex];
    const selectedType = getCurrentSubjectType(semesterIndex, subjectIndex);

    // Xác định cột nào bị vô hiệu hóa dựa trên loại môn đã chọn
    const isThucHanhColumn = ["th1", "th2", "th3", "th4", "th5"].includes(
      scoreType
    );
    const isLyThuyetColumn = ["gk", "tx1", "tx2", "tx3", "tx4"].includes(
      scoreType
    );

    let isDisabled = false;

    if (selectedType === "SPECIAL") {
      // Môn đặc biệt: chỉ cho phép nhập cột cuối kỳ
      isDisabled = scoreType !== "ck";
    } else if (selectedType === "LT") {
      // Môn lý thuyết: cho phép Giữa kỳ, Thường xuyên, Cuối kỳ
      isDisabled = isThucHanhColumn;
    } else if (selectedType === "TH") {
      // Môn thực hành: chỉ cho phép các cột thực hành
      isDisabled = isLyThuyetColumn || scoreType === "ck";
    } else if (
      selectedType === "TICH_HOP" ||
      selectedType === "CHUA_XAC_DINH"
    ) {
      // Môn tích hợp hoặc chưa xác định: cho phép tất cả các cột
      isDisabled = false;
    }
    // Nếu không xác định được loại môn, cho phép tất cả

    // Parse value để hiển thị đúng format với 1 chữ số thập phân
    const numericValue = parseScore(value);
    let displayValue = "";

    // Kiểm tra value một cách chính xác để không bỏ qua số 0
    if (value !== null && value !== undefined && value !== "") {
      if (typeof value === "string") {
        displayValue = value;
      } else if (typeof value === "number") {
        // Hiển thị với 1 chữ số thập phân và dấu phẩy, bao gồm cả số 0
        displayValue = value.toFixed(1).replace(".", ",");
      }
    } else if (value === 0) {
      // Đặc biệt xử lý trường hợp value = 0
      displayValue = "0,0";
    }

    const isLowScore =
      (numericValue !== null &&
        numericValue !== undefined &&
        numericValue >= 0 &&
        numericValue <= 5) ||
      value === 0;

    return React.createElement(
      "td",
      {
        className: `${isLowScore ? "low-score" : ""} ${
          isDisabled ? "disabled-cell" : ""
        }`,
        contentEditable: !isDisabled,
        suppressContentEditableWarning: true,
        style: {
          outline: "none",
          color: isDisabled ? "#9ca3af" : isLowScore ? "#dc2626" : "inherit",
          fontWeight: isLowScore ? "bold" : "normal",
          backgroundColor: isDisabled ? "#f9fafb" : "inherit",
          cursor: isDisabled ? "not-allowed" : "text",
        },
        onBlur: (e) => {
          if (!isDisabled) {
            updateScore(e, scoreType, semesterIndex, subjectIndex);
          }
        },
        onKeyPress: (e) => {
          if (!isDisabled && e.key === "Enter") {
            e.preventDefault();
            e.target.blur();
          }
        },
        onKeyUp: (e) => {
          if (!isDisabled) {
            // Chỉ cho nhập số, dấu phẩy và dấu chấm
            const regex = /^[0-9.,]*$/;
            if (!regex.test(e.target.textContent)) {
              e.target.textContent = e.target.textContent.replace(
                /[^0-9.,]/g,
                ""
              );
            }

            // Cập nhật màu real-time khi nhập
            const currentValue = e.target.textContent.trim();
            if (currentValue !== "") {
              const numValue = parseFloat(currentValue.replace(",", "."));
              if (
                (!isNaN(numValue) && numValue >= 0 && numValue <= 5) ||
                numValue === 0
              ) {
                e.target.style.color = "#dc2626";
                e.target.style.fontWeight = "bold";
                e.target.classList.add("low-score");
              } else {
                e.target.style.color = "inherit";
                e.target.style.fontWeight = "normal";
                e.target.classList.remove("low-score");
              }
            }
          }
        },
        title: isDisabled
          ? selectedType === "SPECIAL"
            ? "Môn đặc biệt - chỉ nhập điểm cuối kỳ"
            : selectedType === "LT" && isThucHanhColumn
            ? "Môn lý thuyết - không có điểm thực hành"
            : selectedType === "TH" && (isLyThuyetColumn || scoreType === "ck")
            ? "Môn thực hành - chỉ nhập điểm thực hành"
            : "Ô nhập bị vô hiệu hóa"
          : "Nhập điểm từ 0-10. Điểm sẽ được làm tròn theo quy định IUH.",
        onInput: (e) => {
          if (!isDisabled) {
            const value = e.target.textContent.trim();
            const validation = validateScore(value);

            if (value !== "" && !validation.isValid) {
              e.target.style.color = "#dc2626";
              e.target.style.backgroundColor = "#fef2f2";
              e.target.title = validation.error;
            }
            //  else {
            //     e.target.style.backgroundColor = 'inherit';
            //     e.target.title = isDisabled ?
            //         (selectedType === 'SPECIAL' ? 'Môn đặc biệt - chỉ nhập điểm cuối kỳ' :
            //             selectedType === 'LT' && isThucHanhColumn ? 'Môn lý thuyết - không có điểm thực hành' :
            //                 selectedType === 'TH' && (isLyThuyetColumn || scoreType === 'ck') ? 'Môn thực hành - chỉ nhập điểm thực hành' :
            //                     'Ô nhập bị vô hiệu hóa') :
            //         'Nhập điểm từ 0-10. Điểm sẽ được làm tròn theo quy định IUH.';
            // }
          }
        },
      },
      displayValue
    );
  };

  // Loading state
  if (isLoading) {
    return React.createElement(
      "div",
      { className: "loading" },
      React.createElement("div", { className: "spinner" }),
      React.createElement(
        "span",
        { className: "loading-text" },
        "Đang tải dữ liệu điểm..."
      )
    );
  }

  // Error state
  if (error) {
    return React.createElement(
      "div",
      { className: "error-container" },
      React.createElement("div", { className: "error-icon" }, "⚠️"),
      React.createElement("div", { className: "error-message" }, error),
      React.createElement(
        "button",
        {
          className: "retry-button",
          onClick: loadGradesFromStorage,
        },
        "Thử lại"
      )
    );
  }

  // No data state
  if (
    !gradesData ||
    !gradesData.semesters ||
    gradesData.semesters.length === 0
  ) {
    return React.createElement(
      "div",
      { className: "no-data-container" },
      React.createElement("div", { className: "no-data-icon" }, "📊"),
      React.createElement(
        "div",
        { className: "no-data-title" },
        "Chưa có dữ liệu điểm"
      ),
      React.createElement(
        "div",
        { className: "no-data-text" },
        "Vui lòng truy cập trang tra cứu điểm IUH để lấy dữ liệu"
      )
    );
  }

  // Hàm tạo banner thông báo trạng thái chương trình khung
  const createCurriculumStatusBanner = () => {
    const hasCurriculumData = typeof window.getCurriculumInfo === "function";

    if (hasCurriculumData) {
      return React.createElement(
        "div",
        {
          style: {
            backgroundColor: "#d4edda",
            border: "1px solid #c3e6cb",
            borderRadius: "6px",
            padding: "12px 16px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "14px",
            color: "#155724",
          },
        },
        React.createElement("span", { style: { fontSize: "16px" } }, "✅"),
        React.createElement(
          "span",
          null,
          "Đã tải dữ liệu chương trình khung - Tự động phân loại môn học hoạt động"
        )
      );
    } else {
      return React.createElement(
        "div",
        {
          style: {
            backgroundColor: "#fff3cd",
            border: "1px solid #ffeaa7",
            borderRadius: "6px",
            padding: "16px 20px",
            marginBottom: "20px",
            fontSize: "14px",
            color: "#856404",
          },
        },
        React.createElement(
          "div",
          {
            style: {
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
            },
          },
          React.createElement(
            "span",
            { style: { fontSize: "20px", marginTop: "2px" } },
            "⚠️"
          ),
          React.createElement(
            "div",
            {
              style: {
                flex: 1,
              },
            },
            React.createElement(
              "h4",
              {
                style: {
                  margin: "0 0 8px 0",
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "#856404",
                },
              },
              "Chưa có dữ liệu chương trình khung"
            ),
            React.createElement(
              "p",
              {
                style: {
                  margin: "0 0 12px 0",
                  fontSize: "14px",
                  lineHeight: "1.4",
                  color: "#856404",
                },
              },
              'Để extension hoạt động tốt nhất và tự động phân loại môn học, vui lòng đăng nhập trang sv.iuh trước. Hiện tại tất cả môn học sẽ được mặc định phân loại là N/A ".'
            ),
            React.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  gap: "8px",
                  marginTop: "12px",
                },
              },
              React.createElement(
                "button",
                {
                  onClick: () => {
                    window.open(
                      "https://sv.iuh.edu.vn/chuong-trinh-khung.html?auto=true",
                      "_blank"
                    );
                    // Sau 3 giây, reload trang để kiểm tra lại
                    setTimeout(() => {
                      window.location.reload();
                    }, 3000);
                  },
                  style: {
                    backgroundColor: "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    padding: "8px 16px",
                    fontSize: "13px",
                    cursor: "pointer",
                    fontWeight: "500",
                  },
                },
                "Đăng nhập ngay"
              ),
              React.createElement(
                "button",
                {
                  onClick: () => {
                    window.location.reload();
                  },
                  style: {
                    backgroundColor: "#28a745",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    padding: "8px 16px",
                    fontSize: "13px",
                    cursor: "pointer",
                    fontWeight: "500",
                  },
                },
                "Làm mới"
              )
            )
          )
        )
      );
    }
  };

  // Main render
  return React.createElement(
    "div",
    { className: "grades-page-container" },
    // Status banner
    createCurriculumStatusBanner(),
    // Render each semester
    gradesData.semesters.map((semester, semIndex) =>
      React.createElement(
        "div",
        {
          key: `semester-${semIndex}`,
          className: "semester-container",
        },
        // Semester title
        React.createElement(
          "h3",
          { className: "semester-title" },
          semester.name
        ),

        // Main table
        React.createElement(
          "div",
          { className: "table-responsive" },
          React.createElement(
            "table",
            { className: "grades-table" },
            // Table header
            React.createElement(
              "thead",
              null,
              // Header row 1
              React.createElement(
                "tr",
                { className: "header-row-1" },
                React.createElement(
                  "th",
                  { rowSpan: 3, className: "col-stt" },
                  "STT"
                ),
                React.createElement(
                  "th",
                  { rowSpan: 3, className: "col-ma-lhp" },
                  "Mã lớp học phần"
                ),
                React.createElement(
                  "th",
                  { rowSpan: 3, className: "col-ten-mon" },
                  "Tên môn học/học phần"
                ),
                React.createElement(
                  "th",
                  { rowSpan: 3, className: "col-tin-chi" },
                  "Số tín chỉ"
                ),
                React.createElement(
                  "th",
                  { rowSpan: 3, className: "col-loai-mon" },
                  "Loại môn"
                ),
                React.createElement(
                  "th",
                  { rowSpan: 3, className: "col-giua-ky" },
                  "Giữa kỳ"
                ),
                React.createElement(
                  "th",
                  { colSpan: 4, className: "col-thuong-xuyen" },
                  "Thường xuyên"
                ),
                React.createElement(
                  "th",
                  { colSpan: 5, rowSpan: 2, className: "col-thuc-hanh" },
                  "Thực hành"
                ),
                React.createElement(
                  "th",
                  { rowSpan: 3, className: "col-cuoi-ky" },
                  "Cuối kỳ"
                ),
                React.createElement(
                  "th",
                  { rowSpan: 3, className: "col-tong-ket" },
                  "Điểm tổng kết"
                ),
                React.createElement(
                  "th",
                  { rowSpan: 3, className: "col-thang-diem-4" },
                  "Thang điểm 4"
                ),
                React.createElement(
                  "th",
                  { rowSpan: 3, className: "col-diem-chu" },
                  "Điểm chữ"
                ),
                React.createElement(
                  "th",
                  { rowSpan: 3, className: "col-xep-loai" },
                  "Xếp loại"
                ),
                React.createElement(
                  "th",
                  { rowSpan: 3, className: "col-ghi-chu" },
                  "Ghi chú"
                ),
                React.createElement(
                  "th",
                  { rowSpan: 3, className: "col-dat" },
                  "Đạt"
                )
              ),
              // Header row 2
              React.createElement(
                "tr",
                { className: "header-row-2" },
                React.createElement(
                  "th",
                  { colSpan: 4, className: "sub-header" },
                  "LT Hệ số 1"
                )
                // React.createElement('th', { colSpan: 5, className: 'sub-header' }, 'Thực hành')
              ),
              // Header row 3
              React.createElement(
                "tr",
                { className: "header-row-3" },
                React.createElement("th", { className: "tx-col" }, "1"),
                React.createElement("th", { className: "tx-col" }, "2"),
                React.createElement("th", { className: "tx-col" }, "3"),
                React.createElement("th", { className: "tx-col" }, "4"),
                React.createElement("th", { className: "th-col" }, "1"),
                React.createElement("th", { className: "th-col" }, "2"),
                React.createElement("th", { className: "th-col" }, "3"),
                React.createElement("th", { className: "th-col" }, "4"),
                React.createElement("th", { className: "th-col" }, "5")
              )
            ),

            // Table body
            React.createElement(
              "tbody",
              null,
              semester.subjects.map((subject, subIndex) =>
                React.createElement(
                  "tr",
                  {
                    key: `subject-${semIndex}-${subIndex}`,
                    className: "subject-row",
                  },
                  React.createElement(
                    "td",
                    { className: "td-stt" },
                    subject.stt
                  ),
                  React.createElement(
                    "td",
                    { className: "td-ma-lhp" },
                    subject.maLhp
                  ),
                  React.createElement(
                    "td",
                    { className: "td-ten-mon" },
                    subject.name
                  ),
                  React.createElement(
                    "td",
                    { className: "td-tin-chi" },
                    subject.credits
                  ),
                  createSubjectTypeSelector(semIndex, subIndex),
                  createEditableCell(
                    subject.diemGiuaKy,
                    "gk",
                    semIndex,
                    subIndex
                  ),
                  // Thường xuyên columns (4) - editable
                  createEditableCell(
                    subject.thuongXuyen[0],
                    "tx1",
                    semIndex,
                    subIndex
                  ),
                  createEditableCell(
                    subject.thuongXuyen[1],
                    "tx2",
                    semIndex,
                    subIndex
                  ),
                  createEditableCell(
                    subject.thuongXuyen[2],
                    "tx3",
                    semIndex,
                    subIndex
                  ),
                  createEditableCell(
                    subject.thuongXuyen[3],
                    "tx4",
                    semIndex,
                    subIndex
                  ),
                  // Thực hành columns (5) - editable
                  createEditableCell(
                    subject.thucHanh[0],
                    "th1",
                    semIndex,
                    subIndex
                  ),
                  createEditableCell(
                    subject.thucHanh[1],
                    "th2",
                    semIndex,
                    subIndex
                  ),
                  createEditableCell(
                    subject.thucHanh[2],
                    "th3",
                    semIndex,
                    subIndex
                  ),
                  createEditableCell(
                    subject.thucHanh[3],
                    "th4",
                    semIndex,
                    subIndex
                  ),
                  createEditableCell(
                    subject.thucHanh[4],
                    "th5",
                    semIndex,
                    subIndex
                  ),
                  createEditableCell(
                    subject.diemCuoiKy,
                    "ck",
                    semIndex,
                    subIndex
                  ),
                  React.createElement(
                    "td",
                    {
                      className: `td-tong-ket ${getGradeClass(
                        subject.diemTongKet
                      )}`,
                      style:
                        (subject.diemTongKet !== null &&
                          subject.diemTongKet !== undefined &&
                          subject.diemTongKet >= 0 &&
                          subject.diemTongKet <= 5) ||
                        subject.diemTongKet === 0
                          ? { color: "#dc2626", fontWeight: "bold" }
                          : {},
                    },
                    subject.diemTongKet !== null &&
                      subject.diemTongKet !== undefined
                      ? typeof subject.diemTongKet === "string"
                        ? subject.diemTongKet
                        : subject.diemTongKet.toFixed(1).replace(".", ",")
                      : ""
                  ),
                  React.createElement(
                    "td",
                    { className: "td-thang-diem-4" },
                    subject.thangDiem4 !== null &&
                      subject.thangDiem4 !== undefined
                      ? subject.thangDiem4.toFixed(1).replace(".", ",")
                      : ""
                  ),
                  React.createElement(
                    "td",
                    { className: "td-diem-chu" },
                    subject.diemChu || ""
                  ),
                  React.createElement(
                    "td",
                    { className: "td-xep-loai" },
                    subject.xepLoai || ""
                  ),
                  React.createElement(
                    "td",
                    { className: "td-ghi-chu" },
                    subject.ghiChu || ""
                  ),
                  React.createElement(
                    "td",
                    { className: "td-dat" },
                    subject.dat || ""
                  )
                )
              )
            )
          )
        ),

        // Extended Semester Summary Table - chỉ hiển thị khi có điểm tổng kết
        semester.summary &&
          semester.subjects.some(
            (subject) =>
              subject.diemTongKet !== null && subject.diemTongKet !== undefined
          ) &&
          React.createElement(
            "div",
            { className: "semester-summary-table" },
            React.createElement(
              "table",
              { className: "summary-table" },
              React.createElement(
                "tbody",
                null,
                // Điểm trung bình học kỳ
                React.createElement(
                  "tr",
                  { className: "summary-row" },
                  React.createElement(
                    "td",
                    { className: "summary-label", colSpan: 2 },
                    `Điểm trung bình học kỳ hệ 10: ${semester.summary.diemTrungBinhHocKy10
                      .toFixed(2)
                      .replace(".", ",")}`
                  ),
                  React.createElement(
                    "td",
                    { className: "summary-label", colSpan: 2 },
                    `Điểm trung bình học kỳ hệ 4: ${semester.summary.diemTrungBinhHocKy4
                      .toFixed(2)
                      .replace(".", ",")}`
                  )
                ),

                // Điểm trung bình tích lũy
                React.createElement(
                  "tr",
                  { className: "summary-row" },
                  React.createElement(
                    "td",
                    { className: "summary-label", colSpan: 2 },
                    `Điểm trung bình tích lũy hệ 10: ${semester.summary.diemTrungBinhTichLuy10
                      .toFixed(2)
                      .replace(".", ",")}`
                  ),
                  React.createElement(
                    "td",
                    { className: "summary-label", colSpan: 2 },
                    `Điểm trung bình tích lũy hệ 4: ${semester.summary.diemTrungBinhTichLuy4
                      .toFixed(2)
                      .replace(".", ",")}`
                  )
                ),

                // Tổng số tín chỉ
                React.createElement(
                  "tr",
                  { className: "summary-row" },
                  React.createElement(
                    "td",
                    { className: "summary-label", colSpan: 2 },
                    `Tổng số tín chỉ đã đăng ký: ${semester.summary.tongTinChiDangKy}`
                  ),
                  React.createElement(
                    "td",
                    { className: "summary-label", colSpan: 2 },
                    `Tổng số tín chỉ tích lũy: ${semester.summary.tongTinChiTichLuy}`
                  )
                ),

                // Tổng số tín chỉ đạt và nợ
                React.createElement(
                  "tr",
                  { className: "summary-row" },
                  React.createElement(
                    "td",
                    { className: "summary-label", colSpan: 2 },
                    `Tổng số tín chỉ đạt: ${semester.summary.tongTinChiDat}`
                  ),
                  React.createElement(
                    "td",
                    { className: "summary-label", colSpan: 2 },
                    `Tổng số tín chỉ nợ tính đến hiện tại: ${semester.summary.tongTinChiNo}`
                  )
                ),

                // Xếp loại học lực
                React.createElement(
                  "tr",
                  { className: "summary-row" },
                  React.createElement(
                    "td",
                    { className: "summary-label", colSpan: 2 },
                    `Xếp loại học lực tích lũy: ${semester.summary.xepLoaiTichLuy}`
                  ),
                  React.createElement(
                    "td",
                    { className: "summary-label", colSpan: 2 },
                    `Xếp loại học lực học kỳ: ${semester.summary.xepLoaiHocKy}`
                  )
                )
              )
            )
          )
      )
    )
  );

  // Helper function for grade coloring
  function getGradeClass(grade) {
    if (!grade) return "";
    if (grade >= 9.0) return "excellent";
    if (grade >= 8.0) return "good";
    if (grade >= 6.5) return "average";
    return "poor";
  }
}
