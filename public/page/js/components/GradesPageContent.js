/* eslint-disable no-undef */

function GradesPageContent({ keyValue }) {
    const [gradesData, setGradesData] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState(null);
    const [subjectTypes, setSubjectTypes] = React.useState({}); // Lưu trữ loại môn học đã chọn
    const [openDropdowns, setOpenDropdowns] = React.useState({}); // Lưu trữ trạng thái mở/đóng của các dropdown

    // Danh sách môn bỏ qua khi tính GPA
    const listSubjectIgnoresCalcScore = [
        'giáo dục thể chất 1',
        'giáo dục thể chất 2',
        'giáo dục quốc phòng và an ninh 1',
        'giáo dục quốc phòng và an ninh 2',
        'tiếng anh 1',
        'tiếng anh 2',
    ];

    React.useEffect(() => {
        loadGradesFromStorage();
    }, [keyValue]);

    // Close all dropdowns when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.custom-dropdown')) {
                setOpenDropdowns({});
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
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
        if (value === '' || value === null || value === undefined) {
            return { isValid: true, value: null };
        }

        // Convert Vietnamese decimal format to JS format
        const normalizedValue = value.toString().replace(',', '.');
        const numValue = parseFloat(normalizedValue);

        // Check if it's a valid number
        if (isNaN(numValue)) {
            return { isValid: false, value: null, error: 'Điểm phải là số' };
        }

        // Check range 0-10
        if (numValue < 0 || numValue > 10) {
            return { isValid: false, value: null, error: 'Điểm phải từ 0 đến 10' };
        }

        // Round according to IUH rules
        const roundedValue = roundScoreIUH(numValue);

        return { isValid: true, value: roundedValue };
    };

    // Hàm kiểm tra môn đặc biệt (chỉ có một cột điểm tổng kết)
    const isSpecialSubject = (subjectName) => {
        const specialSubjects = [
            'thực tập doanh nghiệp',
            'khóa luận tốt nghiệp',
            'đồ án tốt nghiệp',
            'thực tập tốt nghiệp',
            'luận văn tốt nghiệp',
            'thực tập chuyên ngành',
            'đồ án chuyên ngành',
            'giáo dục thể chất 1',
            'giáo dục thể chất 2'
        ];
        return specialSubjects.some(special =>
            subjectName.toLowerCase().includes(special.toLowerCase())
        );
    };

    // Hàm xử lý thay đổi loại môn học
    const handleSubjectTypeChange = (semesterIndex, subjectIndex, newType) => {
        const key = `${semesterIndex}-${subjectIndex}`;
        setSubjectTypes(prev => ({
            ...prev,
            [key]: newType
        }));

        // Có thể thêm logic tính lại điểm dựa trên loại môn học mới
        console.log(`Changed subject type for ${key} to ${newType}`);
    };

    // Hàm lấy loại môn học hiện tại
    const getCurrentSubjectType = (semesterIndex, subjectIndex) => {
        const key = `${semesterIndex}-${subjectIndex}`;
        return subjectTypes[key] || 'LT'; // Mặc định là Lý thuyết
    };

    // Component tạo selection button cho loại môn học
    const createSubjectTypeSelector = (semesterIndex, subjectIndex) => {
        const currentType = getCurrentSubjectType(semesterIndex, subjectIndex);
        const dropdownKey = `${semesterIndex}-${subjectIndex}`;
        const isOpen = openDropdowns[dropdownKey] || false;

        const options = [
            { value: 'LT', label: 'Lý thuyết', title: 'Môn lý thuyết (soTLT > 0, soTTH = 0)' },
            { value: 'TH', label: 'Thực hành', title: 'Môn thực hành (soTLT = 0, soTTH > 0)' },
            { value: 'TICH_HOP', label: 'Tích hợp', title: 'Môn tích hợp (soTLT > 0, soTTH > 0)' }
        ];

        const currentOption = options.find(opt => opt.value === currentType);

        const handleToggleDropdown = () => {
            setOpenDropdowns(prev => ({
                ...prev,
                [dropdownKey]: !prev[dropdownKey]
            }));
        };

        const handleOptionClick = (value) => {
            handleSubjectTypeChange(semesterIndex, subjectIndex, value);
            setOpenDropdowns(prev => ({
                ...prev,
                [dropdownKey]: false
            }));
        };

        return React.createElement('td', {
            className: 'td-subject-type',
            style: { textAlign: 'center', padding: '8px', position: 'relative' }
        },
            React.createElement('div', {
                className: 'custom-dropdown',
                style: {
                    position: 'relative',
                    display: 'inline-block',
                    minWidth: '105px',
                    maxWidth: '125px'
                }
            },
                // Custom dropdown button
                React.createElement('div', {
                    onClick: handleToggleDropdown,
                    style: {
                        padding: '6px 28px 6px 12px',
                        borderRadius: '6px',
                        border: 'none',
                        outline: 'none',
                        backgroundColor: isOpen ? '#e2e8f0' : '#f8fafc',
                        color: '#1e293b',
                        fontSize: '13px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        boxShadow: isOpen ? '0 4px 6px rgba(0, 0, 0, 0.1)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
                        transition: 'all 0.2s ease',
                        userSelect: 'none',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    },
                    title: currentOption?.title || 'Chọn loại môn học',
                    onMouseEnter: (e) => {
                        if (!isOpen) {
                            e.target.style.backgroundColor = '#e2e8f0';
                            e.target.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                        }
                    },
                    onMouseLeave: (e) => {
                        if (!isOpen) {
                            e.target.style.backgroundColor = '#f8fafc';
                            e.target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                        }
                    }
                },
                    React.createElement('span', null, currentOption?.label || 'Lý thuyết'),
                    React.createElement('svg', {
                        style: {
                            width: '16px',
                            height: '16px',
                            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s ease',
                            position: 'absolute',
                            right: '8px'
                        },
                        fill: 'none',
                        viewBox: '0 0 20 20'
                    },
                        React.createElement('path', {
                            stroke: '#6b7280',
                            strokeLinecap: 'round',
                            strokeLinejoin: 'round',
                            strokeWidth: '1.5',
                            d: 'm6 8 4 4 4-4'
                        })
                    )
                ),
                // Custom dropdown menu
                isOpen && React.createElement('div', {
                    style: {
                        position: 'absolute',
                        top: '100%',
                        left: '0',
                        right: '0',
                        backgroundColor: '#ffffff',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        zIndex: 1000,
                        overflow: 'hidden',
                        marginTop: '1px'
                    }
                },
                    options.map((option, index) =>
                        React.createElement('div', {
                            key: option.value,
                            onClick: () => handleOptionClick(option.value),
                            style: {
                                padding: '8px 10px',
                                fontSize: '13px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                backgroundColor: option.value === currentType ? '#eff6ff' : '#ffffff',
                                color: option.value === currentType ? '#1d4ed8' : '#374151',
                                transition: 'all 0.1s ease'
                            },
                            title: option.title,
                            onMouseEnter: (e) => {
                                if (option.value !== currentType) {
                                    e.target.style.backgroundColor = '#f9fafb';
                                }
                            },
                            onMouseLeave: (e) => {
                                if (option.value !== currentType) {
                                    e.target.style.backgroundColor = '#ffffff';
                                }
                            }
                        }, option.label)
                    )
                )
            )
        );
    };

    const loadGradesFromStorage = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Attempt to load from Chrome storage first
            if (typeof chrome !== 'undefined' && chrome.storage) {
                chrome.storage.local.get(['diem_json'], (result) => {
                    if (result.diem_json) {
                        try {
                            const storedData = JSON.parse(result.diem_json);
                            const processedData = processIUHGradesData(storedData);

                            // Tính toán summary cho dữ liệu thật
                            if (processedData && processedData.semesters) {
                                processedData.semesters.forEach((semester, index) => {
                                    calculateSemesterSummary(semester, index, processedData.semesters);
                                });
                            }

                            setGradesData(processedData);
                        } catch (parseError) {
                            console.error('Error parsing stored grades data:', parseError);
                            loadMockData();
                        }
                    } else {
                        console.log('No grades data found in storage, loading mock data');
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
            console.error('Error loading grades:', error);
            setError('Không thể tải dữ liệu điểm');
            loadMockData();
            setIsLoading(false);
        }
    };

    const loadMockData = () => {
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
                            diemGiuaKy: 7.50,
                            thuongXuyen: [8.50, 8.50, null, null],
                            thucHanh: [null, null, null, null, null],
                            diemCuoiKy: 8.00,
                            diemTongKet: 8.00,
                            thangDiem4: 3.50,
                            diemChu: "B+",
                            xepLoai: "Khá",
                            ghiChu: "",
                            dat: "✓"
                        },
                        {
                            stt: 2,
                            maLhp: "420300319249",
                            name: "Kỹ năng làm việc nhóm",
                            credits: 2,
                            diemGiuaKy: 8.50,
                            thuongXuyen: [9.50, 8.00, null, null],
                            thucHanh: [8.00, 8.50, 8.00, null, null],
                            diemCuoiKy: 9.50,
                            diemTongKet: 8.60,
                            thangDiem4: 3.80,
                            diemChu: "A",
                            xepLoai: "Giỏi",
                            ghiChu: "",
                            dat: "✓"
                        },
                        {
                            stt: 3,
                            maLhp: "420300324283",
                            name: "Giáo dục Quốc phòng và An ninh 1",
                            credits: 4,
                            diemGiuaKy: 8.50,
                            thuongXuyen: [9.50, 9.50, 8.00, null],
                            thucHanh: [null, null, null, null, null],
                            diemCuoiKy: 7.00,
                            diemTongKet: 7.90,
                            thangDiem4: 3.00,
                            diemChu: "B",
                            xepLoai: "Khá",
                            ghiChu: "",
                            dat: "✓"
                        },
                        {
                            stt: 4,
                            maLhp: "420300325966",
                            name: "Toán cao cấp 1",
                            credits: 2,
                            diemGiuaKy: 10.00,
                            thuongXuyen: [9.00, 9.00, null, null],
                            thucHanh: [null, null, null, null, null],
                            diemCuoiKy: 9.00,
                            diemTongKet: 9.30,
                            thangDiem4: 4.00,
                            diemChu: "A+",
                            xepLoai: "Xuất sắc",
                            ghiChu: "",
                            dat: "✓"
                        },
                        {
                            stt: 5,
                            maLhp: "420300330741",
                            name: "Giáo dục thể chất 1",
                            credits: 2,
                            diemGiuaKy: null,
                            thuongXuyen: [null, null, null, null],
                            thucHanh: [null, null, null, null, null],
                            diemCuoiKy: 7.00,
                            diemTongKet: 7.00,
                            thangDiem4: 3.00,
                            diemChu: "B",
                            xepLoai: "Khá",
                            ghiChu: "",
                            dat: "✓"
                        },
                        {
                            stt: 6,
                            maLhp: "420300384837",
                            name: "Nhập môn Lập trình",
                            credits: 2,
                            diemGiuaKy: 0,
                            thuongXuyen: [null, null, null, null],
                            thucHanh: [10.00, 9.00, 10.00, null, null],
                            diemCuoiKy: 10.00,
                            diemTongKet: null,
                            thangDiem4: 0,
                            diemChu: "F",
                            xepLoai: "Kém",
                            ghiChu: "Cấm thi",
                            dat: ""
                        },
                        {
                            stt: 7,
                            maLhp: "420301416477",
                            name: "Triết học Mác - Lênin",
                            credits: 3,
                            diemGiuaKy: 7.00,
                            thuongXuyen: [10.00, 10.00, 9.50, null],
                            thucHanh: [null, null, null, null, null],
                            diemCuoiKy: 0,
                            diemTongKet: 0,
                            thangDiem4: 0,
                            diemChu: "F",
                            xepLoai: "Kém",
                            ghiChu: "Cuối kỳ = 0",
                            dat: ""
                        },
                        {
                            stt: 8,
                            maLhp: "420301416500",
                            name: "Thực tập doanh nghiệp",
                            credits: 4,
                            diemGiuaKy: null,
                            thuongXuyen: [null, null, null, null],
                            thucHanh: [null, null, null, null, null],
                            diemCuoiKy: 8.50,
                            diemTongKet: 8.50,
                            thangDiem4: 3.50,
                            diemChu: "B+",
                            xepLoai: "Khá",
                            ghiChu: "",
                            dat: "✓"
                        },
                        {
                            stt: 9,
                            maLhp: "420300200908",
                            name: "Vật lý đại cương",
                            credits: 3,
                            diemGiuaKy: 8.00,
                            thuongXuyen: [7.50, 8.00, null, null],
                            thucHanh: [null, null, null, null, null],
                            diemCuoiKy: 2.50,
                            diemTongKet: null,
                            thangDiem4: 0,
                            diemChu: "F",
                            xepLoai: "Kém",
                            ghiChu: "CK < 3",
                            dat: ""
                        }
                    ]
                }
            ]
        };

        // Không tự động tính toán summary cho mock data
        // Summary sẽ được tính khi user thao tác với điểm
        setGradesData(mockData);
    };

    // Process raw IUH data from contentScript into our format
    const processIUHGradesData = (rawData) => {
        if (!Array.isArray(rawData)) return null;

        const semesters = rawData.map((semester, index) => ({
            name: semester.hocKy || `Học kỳ ${index + 1}`,
            subjects: semester.monHoc ? semester.monHoc
                .filter((subject, subIndex) => {
                    // Only take actual subjects (usually index 0-6), skip summary rows
                    // Summary rows have STT like "Điểm trung bình học kỳ hệ 10: ..."
                    const stt = subject["STT"];
                    return stt && !stt.includes("Điểm trung bình") &&
                        !stt.includes("Tổng số") && !stt.includes("Xếp loại học lực");
                })
                .map((subject, subIndex) => {
                    // Parse scores from IUH format
                    const parseScore = (scoreStr) => {
                        if (!scoreStr || scoreStr === '') {
                            return null;
                        }
                        // Convert Vietnamese decimal format (8,50) to JS format (8.50)
                        const normalizedStr = scoreStr.toString().replace(',', '.');
                        const parsed = parseFloat(normalizedStr);
                        if (isNaN(parsed)) {
                            return null;
                        }
                        // Làm tròn đến 1 chữ số thập phân
                        return Math.round(parsed * 10) / 10;
                    };

                    return {
                        stt: subIndex + 1,
                        maLhp: subject["Mã lớp học phần"] || "",
                        name: subject["Tên môn học"] || subject["Tên môn học/học phần"] || "",
                        credits: parseInt(subject["Số tín chỉ"] || subject["Tín chỉ"]) || 0,
                        diemGiuaKy: parseScore(subject["Giữa kỳ"]),
                        // Parse Thường xuyên columns (4 columns)
                        thuongXuyen: [
                            parseScore(subject["Thường xuyên LT Hệ số 1 1"]),
                            parseScore(subject["Thường xuyên LT Hệ số 1 2"]),
                            parseScore(subject["Thường xuyên LT Hệ số 1 3"]),
                            parseScore(subject["Thường xuyên LT Hệ số 1 4"])
                        ],
                        // Parse Thực hành columns (5 columns)
                        thucHanh: [
                            parseScore(subject["Thực hành 1"]),
                            parseScore(subject["Thực hành 2"]),
                            parseScore(subject["Thực hành 3"]),
                            parseScore(subject["Thực hành 4"]),
                            parseScore(subject["Thực hành 5"])
                        ],
                        diemCuoiKy: parseScore(subject["Cuối kỳ"]),
                        diemTongKet: parseScore(subject["Điểm tổng kết"]),
                        thangDiem4: parseScore(subject["Thang điểm 4"]),
                        diemChu: subject["Điểm chữ"] || "", xepLoai: subject["Xếp loại"] || "",
                        ghiChu: subject["Ghi chú"] || "",
                        dat: subject["Đạt"] || ""
                    };
                }) : []
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
        console.log(`Subject type: ${subjectType}, slDiemLTKhacKhong: ${slDiemLTKhacKhong}, slDiemTHKhacKhong: ${slDiemTHKhacKhong}`);
        console.log(`dsDiemTK:`, dsDiemTK);
        console.log(`dsDiemTH:`, dsDiemTH);

        if (subjectType === 'TH') {
            // Môn thực hành - tính trung bình cộng của các điểm thực hành đã nhập
            const validScores = dsDiemTH.filter(score => score !== null && score !== undefined && score !== 0);
            if (validScores.length > 0) {
                diemTongKet = validScores.reduce((sum, score) => sum + score, 0) / validScores.length;
                console.log(`Practical subject calculation: ${diemTongKet} from scores:`, validScores);
            } else {
                // Nếu chưa có điểm thực hành nào, trả về null để không hiển thị kết quả
                console.log('No practical scores available');
                return {
                    diemTongKet: null,
                    diemTongKet4: null,
                    diemChu: '',
                    xepLoai: '',
                    ghiChu: '',
                    isDat: false,
                };
            }
        } else if (subjectType === 'LT') {
            // Môn lý thuyết - chỉ dùng công thức lý thuyết
            if (slDiemLTKhacKhong > 0) {
                diemTongKet = ((dsDiemTK.reduce((prev, curr) => prev + curr, 0) / slDiemLTKhacKhong) * 20 + giuaKy * 30 + cuoiKy * 50) / 100;
            } else {
                // Nếu chưa có điểm thường xuyên, chỉ tính giữa kỳ và cuối kỳ
                diemTongKet = (giuaKy * 30 + cuoiKy * 70) / 100;
            }
        } else if (subjectType === 'TICH_HOP') {
            // Môn tích hợp - kết hợp lý thuyết và thực hành
            const diemTongKetLT = slDiemLTKhacKhong > 0 ?
                ((dsDiemTK.reduce((prev, curr) => prev + curr, 0) / slDiemLTKhacKhong) * 20 + giuaKy * 30 + cuoiKy * 50) / 100 :
                (giuaKy * 30 + cuoiKy * 70) / 100;

            const validThucHanhScores = dsDiemTH.filter(score => score !== null && score !== undefined && score !== 0);

            if (validThucHanhScores.length > 0) {
                const diemTongKetTH = validThucHanhScores.reduce((sum, score) => sum + score, 0) / validThucHanhScores.length;
                tinChi === 3
                    ? (diemTongKet = (diemTongKetLT * 2 + diemTongKetTH) / 3)
                    : (diemTongKet = (diemTongKetLT * 3 + diemTongKetTH) / 4);
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
            ghiChu: diemTongKet4 !== 0 ? '' : 'Học lại',
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
        if (score === 4) return 'A+';
        if (score === 3.8) return 'A';
        if (score === 3.5) return 'B+';
        if (score === 3) return 'B';
        if (score === 2.5) return 'C+';
        if (score === 2) return 'C';
        if (score === 1.5) return 'D+';
        if (score === 1) return 'D';
        return 'F';
    };

    const convertScore4ToClassification = (score) => {
        if (score === 4) return 'Xuất sắc';
        if (score === 3.8) return 'Giỏi';
        if (score >= 3) return 'Khá';
        if (score >= 2) return 'Trung bình';
        if (score >= 1) return 'Trung bình yếu';
        return 'Kém';
    };

    const convertScore4ToClassificationHK = (score) => {
        // Làm tròn điểm để tránh lỗi floating point với 2 chữ số thập phân
        score = Math.round(score * 100) / 100;

        if (score >= 3.6) return 'Xuất sắc';
        if (score >= 3.2) return 'Giỏi';
        if (score >= 2.5) return 'Khá';
        if (score >= 2.0) return 'Trung bình';
        return 'Kém';
    };

    // Hàm xử lý khi điểm thay đổi
    const handleScoreChange = (semesterIndex, subjectIndex, field, value) => {
        const newGradesData = { ...gradesData };
        const subject = newGradesData.semesters[semesterIndex].subjects[subjectIndex];
        const isSpecial = isSpecialSubject(subject.name);

        // Validate điểm với quy tắc IUH
        const validation = validateScore(value);
        if (!validation.isValid) {
            // Hiển thị lỗi cho user (có thể thêm toast notification sau)
            console.warn('Validation error:', validation.error);
            return;
        }

        const parsedValue = validation.value;

        // Cập nhật điểm
        if (field.startsWith('thuongXuyen')) {
            const index = parseInt(field.split('-')[1]);
            subject.thuongXuyen[index] = parsedValue;
        } else if (field.startsWith('thucHanh')) {
            const index = parseInt(field.split('-')[1]);
            subject.thucHanh[index] = parsedValue;
        } else {
            subject[field] = parsedValue;
        }

        // Xử lý tính điểm cho môn đặc biệt
        if (isSpecial) {
            // Với môn đặc biệt, chỉ cần có điểm tổng kết (từ cột cuối kỳ)
            if (field === 'diemCuoiKy' && parsedValue !== null) {
                if (parsedValue < 3 && parsedValue !== 0) {
                    // Điểm cuối kỳ < 3 (nhưng không phải 0) - không đạt
                    subject.diemTongKet = null;
                    subject.thangDiem4 = 0;
                    subject.diemChu = 'F';
                    subject.xepLoai = 'Kém';
                    subject.ghiChu = 'CK < 3';
                    subject.dat = '';
                } else if (parsedValue > 0) {
                    subject.diemTongKet = parsedValue;
                    subject.thangDiem4 = convertScore10To4(parsedValue);
                    subject.diemChu = convertScore4ToChar(subject.thangDiem4);
                    subject.xepLoai = convertScore4ToClassification(subject.thangDiem4);
                    subject.ghiChu = subject.thangDiem4 !== 0 ? '' : 'Học lại';
                    subject.dat = subject.thangDiem4 !== 0 ? "✓" : "";
                } else if (parsedValue === 0) {
                    // Điểm cuối kỳ = 0 - không đạt
                    subject.diemTongKet = parsedValue;
                    subject.thangDiem4 = 0;
                    subject.diemChu = 'F';
                    subject.xepLoai = 'Kém';
                    subject.ghiChu = 'CK = 0';
                    subject.dat = '';
                }
            } else if (field === 'diemCuoiKy' && parsedValue === null) {
                // Nếu xóa điểm cuối kỳ, reset tất cả
                subject.diemTongKet = null;
                subject.thangDiem4 = 0;
                subject.diemChu = '';
                subject.xepLoai = '';
                subject.ghiChu = '';
                subject.dat = '';
            }
        } else {
            // Logic tính điểm bình thường cho các môn khác
            const dsDiemTK = subject.thuongXuyen.filter(score => score !== null && score !== undefined);
            const dsDiemTH = subject.thucHanh.filter(score => score !== null && score !== undefined);
            const giuaKy = subject.diemGiuaKy !== null && subject.diemGiuaKy !== undefined ? subject.diemGiuaKy : null;
            const cuoiKy = subject.diemCuoiKy !== null && subject.diemCuoiKy !== undefined ? subject.diemCuoiKy : null;

            // Lấy loại môn học hiện tại
            const currentSubjectType = getCurrentSubjectType(semesterIndex, subjectIndex);

            // Kiểm tra điều kiện tính điểm dựa trên loại môn
            if (currentSubjectType === 'TH') {
                // Môn thực hành - chỉ cần có ít nhất 1 điểm thực hành
                if (dsDiemTH.length > 0) {
                    const scoreData = {
                        dsDiemTK: subject.thuongXuyen.map(s => s !== null && s !== undefined ? s : 0),
                        dsDiemTH: subject.thucHanh.map(s => s !== null && s !== undefined ? s : 0),
                        giuaKy: giuaKy || 0,
                        cuoiKy: cuoiKy || 0,
                        tinChi: subject.credits
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
                    subject.diemChu = '';
                    subject.xepLoai = '';
                    subject.ghiChu = '';
                    subject.dat = '';
                }
            } else {
                // Môn lý thuyết và môn tích hợp - cần điểm giữa kỳ và cuối kỳ
                if (giuaKy === null || giuaKy === undefined) {
                    // Chưa có điểm giữa kỳ
                    subject.diemTongKet = null;
                    subject.thangDiem4 = null;
                    subject.diemChu = '';
                    subject.xepLoai = '';
                    subject.ghiChu = '';
                    subject.dat = '';
                } else if (giuaKy === 0) {
                    // Điểm giữa kỳ = 0 (cấm thi)
                    subject.diemTongKet = null;
                    subject.thangDiem4 = 0;
                    subject.diemChu = 'F';
                    subject.xepLoai = 'Kém';
                    subject.ghiChu = 'Cấm thi';
                    subject.dat = '';
                } else if (cuoiKy !== null && cuoiKy < 3) {
                    // Điểm cuối kỳ < 3 - không đạt
                    subject.diemTongKet = null;
                    subject.thangDiem4 = 0;
                    subject.diemChu = 'F';
                    subject.xepLoai = 'Kém';
                    if (cuoiKy === 0) {
                        subject.ghiChu = 'CK = 0';
                    } else {
                        subject.ghiChu = 'CK < 3';
                    }
                    subject.dat = '';
                } else if (dsDiemTK.length >= 2 && giuaKy !== null && cuoiKy !== null) {
                    const scoreData = {
                        dsDiemTK: subject.thuongXuyen.map(s => s !== null && s !== undefined ? s : 0),
                        dsDiemTH: subject.thucHanh.map(s => s !== null && s !== undefined ? s : 0),
                        giuaKy: giuaKy,
                        cuoiKy: cuoiKy,
                        tinChi: subject.credits
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
            calculateSemesterSummary(newGradesData.semesters[i], i, newGradesData.semesters);
        }

        setGradesData(newGradesData);
    };

    // Tính thống kê học kỳ mở rộng theo CalculateScore.js
    const calculateSemesterSummary = (semester, semesterIndex = 0, allSemesters = []) => {
        const validSubjects = semester.subjects.filter(subject =>
            !listSubjectIgnoresCalcScore.includes(subject.name.toLowerCase().trim()) &&
            subject.diemTongKet !== null && subject.diemTongKet !== undefined
        );

        // Chỉ tạo summary khi có ít nhất 1 môn có điểm
        if (validSubjects.length === 0) {
            semester.summary = null;
            return;
        }

        const passedSubjects = validSubjects.filter(subject =>
            subject.diemChu && subject.diemChu !== 'F'
        );

        // Tính điểm trung bình học kỳ hiện tại
        const tong10HocKy = validSubjects.reduce((sum, subject) =>
            sum + (subject.diemTongKet * subject.credits), 0);
        const tong4HocKy = validSubjects.reduce((sum, subject) =>
            sum + (subject.thangDiem4 * subject.credits), 0);
        const tongTinChiHocKy = validSubjects.reduce((sum, subject) =>
            sum + subject.credits, 0);
        const tongTinChiDatHocKy = passedSubjects.reduce((sum, subject) =>
            sum + subject.credits, 0);

        // Tổng số tín chỉ đã đăng ký của học kỳ hiện tại (không tính môn ignore)
        const tongTinChiDangKyHocKy = semester.subjects
            .filter(subject => !listSubjectIgnoresCalcScore.includes(subject.name.toLowerCase().trim()))
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

            const currentValidSubjects = currentSemester.subjects.filter(subject =>
                !listSubjectIgnoresCalcScore.includes(subject.name.toLowerCase().trim()) &&
                subject.diemTongKet !== null && subject.diemTongKet !== undefined
            );

            const currentPassedSubjects = currentValidSubjects.filter(subject =>
                subject.diemChu && subject.diemChu !== 'F'
            );

            // Cộng dồn tín chỉ và điểm
            tongTinChiTichLuy += currentValidSubjects.reduce((sum, subject) => sum + subject.credits, 0);
            tongTinChiDatTichLuy += currentPassedSubjects.reduce((sum, subject) => sum + subject.credits, 0);
            tongTinChiDangKyTichLuy += currentSemester.subjects
                .filter(subject => !listSubjectIgnoresCalcScore.includes(subject.name.toLowerCase().trim()))
                .reduce((sum, subject) => sum + subject.credits, 0);

            tong10TichLuy += currentValidSubjects.reduce((sum, subject) =>
                sum + (subject.diemTongKet * subject.credits), 0);
            tong4TichLuy += currentValidSubjects.reduce((sum, subject) =>
                sum + (subject.thangDiem4 * subject.credits), 0);
        }

        semester.summary = {
            // Điểm trung bình học kỳ hiện tại
            diemTrungBinhHocKy10: tongTinChiHocKy > 0 ? Math.round((tong10HocKy / tongTinChiHocKy) * 100) / 100 : 0,
            diemTrungBinhHocKy4: tongTinChiHocKy > 0 ? Math.round((tong4HocKy / tongTinChiHocKy) * 100) / 100 : 0,

            // Điểm trung bình tích lũy (từ tất cả các kỳ)
            diemTrungBinhTichLuy10: tongTinChiTichLuy > 0 ? Math.round((tong10TichLuy / tongTinChiTichLuy) * 100) / 100 : 0,
            diemTrungBinhTichLuy4: tongTinChiTichLuy > 0 ? Math.round((tong4TichLuy / tongTinChiTichLuy) * 100) / 100 : 0,

            // Tổng số tín chỉ tích lũy (từ tất cả các kỳ)
            tongTinChiDangKy: tongTinChiDangKyTichLuy,
            tongTinChiTichLuy: tongTinChiDatTichLuy,

            // Tổng số tín chỉ đạt (chỉ tính riêng cho kỳ hiện tại)
            tongTinChiDat: tongTinChiDatHocKy,
            tongTinChiNo: tongTinChiDangKyTichLuy - tongTinChiDatTichLuy,

            // Xếp loại học lực
            xepLoaiHocKy: tongTinChiHocKy > 0 ? convertScore4ToClassificationHK(Math.round((tong4HocKy / tongTinChiHocKy) * 100) / 100) : '',
            xepLoaiTichLuy: tongTinChiTichLuy > 0 ? convertScore4ToClassificationHK(Math.round((tong4TichLuy / tongTinChiTichLuy) * 100) / 100) : ''
        };
    };

    // Function to calculate final grade for a subject
    const calculateFinalGrade = (subject, semesterIndex, subjectIndex) => {
        const thuongXuyen = subject.thuongXuyen.filter(score => score !== null && score !== undefined);
        const thucHanh = subject.thucHanh.filter(score => score !== null && score !== undefined);
        const giuaKy = subject.diemGiuaKy !== null && subject.diemGiuaKy !== undefined ? subject.diemGiuaKy : null;
        const cuoiKy = subject.diemCuoiKy !== null && subject.diemCuoiKy !== undefined ? subject.diemCuoiKy : null;
        const tinChi = subject.credits || 0;

        if (giuaKy === null || cuoiKy === null) {
            return {
                diemHe10: null,
                diemHe4: null,
                diemChu: '',
                xepLoai: ''
            };
        }

        // Xác định loại môn từ selection thủ công hoặc tự động
        const subjectType = getCurrentSubjectType(semesterIndex, subjectIndex);

        let diemTongKet = 0;
        const diemThuongXuyen = thuongXuyen.length > 0 ?
            thuongXuyen.reduce((sum, score) => sum + (score || 0), 0) / thuongXuyen.length : 0;

        if (subjectType === 'TH') {
            // Môn thực hành - tính trung bình cộng của các điểm thực hành đã nhập
            const validScores = thucHanh.filter(score => score !== null && score !== undefined);
            if (validScores.length > 0) {
                diemTongKet = validScores.reduce((sum, score) => sum + score, 0) / validScores.length;
            } else {
                return {
                    diemHe10: null,
                    diemHe4: null,
                    diemChu: '',
                    xepLoai: ''
                };
            }
        } else if (subjectType === 'LT') {
            // Môn lý thuyết - chỉ dùng công thức lý thuyết
            diemTongKet = (diemThuongXuyen * 0.2 + giuaKy * 0.3 + cuoiKy * 0.5);
        } else if (subjectType === 'TICH_HOP') {
            // Môn tích hợp - kết hợp lý thuyết và thực hành
            const validThucHanhScores = thucHanh.filter(score => score !== null && score !== undefined);
            const diemLT = (diemThuongXuyen * 0.2 + giuaKy * 0.3 + cuoiKy * 0.5);

            if (validThucHanhScores.length > 0) {
                const diemThucHanh = validThucHanhScores.reduce((sum, score) => sum + score, 0) / validThucHanhScores.length;
                if (tinChi === 3) {
                    diemTongKet = (diemLT * 2 + diemThucHanh) / 3;
                } else {
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
            xepLoai: convertScore4ToClassification(diemHe4)
        };
    };

    // Function to update score and recalculate
    const updateScore = (e, scoreType, semesterIndex, subjectIndex) => {
        const newValue = e.target.textContent.trim();

        // Validate điểm trước khi xử lý
        const validation = validateScore(newValue);
        if (!validation.isValid) {
            // Hiển thị lỗi trực quan
            e.target.style.color = '#dc2626';
            e.target.style.backgroundColor = '#fef2f2';
            e.target.style.border = '1px solid #dc2626';
            e.target.title = validation.error;

            // Reset sau 3 giây
            setTimeout(() => {
                e.target.style.backgroundColor = 'inherit';
                e.target.style.border = 'none';
                e.target.title = '';
            }, 3000);

            return;
        }

        // Reset error styling
        e.target.style.backgroundColor = 'inherit';
        e.target.style.border = 'none';
        e.target.title = '';

        // Convert scoreType to field name for handleScoreChange
        let field = '';
        switch (scoreType) {
            case 'gk':
                field = 'diemGiuaKy';
                break;
            case 'tx1':
                field = 'thuongXuyen-0';
                break;
            case 'tx2':
                field = 'thuongXuyen-1';
                break;
            case 'tx3':
                field = 'thuongXuyen-2';
                break;
            case 'tx4':
                field = 'thuongXuyen-3';
                break;
            case 'th1':
                field = 'thucHanh-0';
                break;
            case 'th2':
                field = 'thucHanh-1';
                break;
            case 'th3':
                field = 'thucHanh-2';
                break;
            case 'th4':
                field = 'thucHanh-3';
                break;
            case 'th5':
                field = 'thucHanh-4';
                break;
            case 'ck':
                field = 'diemCuoiKy';
                break;
        }

        // Use handleScoreChange to update and recalculate
        handleScoreChange(semesterIndex, subjectIndex, field, newValue);

        // Update display with rounded value
        if (validation.value !== null) {
            const displayValue = validation.value.toFixed(1).replace('.', ',');
            e.target.textContent = displayValue;
        }

        // Update visual styling for low scores
        const numValue = validation.value;
        if ((numValue !== null && numValue !== undefined && numValue >= 0 && numValue <= 5) || numValue === 0) {
            e.target.style.color = '#dc2626';
            e.target.style.fontWeight = 'bold';
            e.target.classList.add('low-score');
        } else {
            e.target.style.color = 'inherit';
            e.target.style.fontWeight = 'normal';
            e.target.classList.remove('low-score');
        }
    };

    // Helper function to parse score
    const parseScore = (scoreStr) => {
        if (!scoreStr || scoreStr === '') {
            return null;
        }
        // Convert Vietnamese decimal format (8,50) to JS format (8.50)
        const normalizedStr = scoreStr.toString().replace(',', '.');
        const parsed = parseFloat(normalizedStr);
        if (isNaN(parsed)) {
            return null;
        }
        // Làm tròn đến 1 chữ số thập phân
        return Math.round(parsed * 10) / 10;
    };

    // Hàm tạo ô input có thể chỉnh sửa với logic màu đỏ cho điểm ≤ 5
    const createEditableCell = (value, scoreType, semesterIndex, subjectIndex) => {
        const subject = gradesData.semesters[semesterIndex].subjects[subjectIndex];
        const isSpecial = isSpecialSubject(subject.name);
        const selectedType = getCurrentSubjectType(semesterIndex, subjectIndex);

        // Xác định cột nào bị vô hiệu hóa dựa trên loại môn đã chọn
        const isThucHanhColumn = ['th1', 'th2', 'th3', 'th4', 'th5'].includes(scoreType);
        const isLyThuyetColumn = ['gk', 'tx1', 'tx2', 'tx3', 'tx4'].includes(scoreType);

        let isDisabled = false;

        if (isSpecial) {
            // Môn đặc biệt: chỉ cho phép nhập cột cuối kỳ
            isDisabled = scoreType !== 'ck';
        } else if (selectedType === 'LT') {
            // Môn lý thuyết: cho phép Giữa kỳ, Thường xuyên, Cuối kỳ
            isDisabled = isThucHanhColumn;
        } else if (selectedType === 'TH') {
            // Môn thực hành: chỉ cho phép các cột thực hành
            isDisabled = isLyThuyetColumn || scoreType === 'ck';
        } else if (selectedType === 'TICH_HOP') {
            // Môn tích hợp: cho phép tất cả các cột
            isDisabled = false;
        }
        // Nếu không xác định được loại môn, cho phép tất cả

        // Parse value để hiển thị đúng format với 1 chữ số thập phân
        const numericValue = parseScore(value);
        let displayValue = '';

        // Kiểm tra value một cách chính xác để không bỏ qua số 0
        if (value !== null && value !== undefined && value !== '') {
            if (typeof value === 'string') {
                displayValue = value;
            } else if (typeof value === 'number') {
                // Hiển thị với 1 chữ số thập phân và dấu phẩy, bao gồm cả số 0
                displayValue = value.toFixed(1).replace('.', ',');
            }
        } else if (value === 0) {
            // Đặc biệt xử lý trường hợp value = 0
            displayValue = '0,0';
        }

        const isLowScore = (numericValue !== null && numericValue !== undefined && numericValue >= 0 && numericValue <= 5) || value === 0;

        return React.createElement('td', {
            className: `${isLowScore ? 'low-score' : ''} ${isDisabled ? 'disabled-cell' : ''}`,
            contentEditable: !isDisabled,
            suppressContentEditableWarning: true,
            style: {
                outline: 'none',
                color: isDisabled ? '#9ca3af' : (isLowScore ? '#dc2626' : 'inherit'),
                fontWeight: isLowScore ? 'bold' : 'normal',
                backgroundColor: isDisabled ? '#f9fafb' : 'inherit',
                cursor: isDisabled ? 'not-allowed' : 'text'
            },
            onBlur: (e) => {
                if (!isDisabled) {
                    updateScore(e, scoreType, semesterIndex, subjectIndex);
                }
            },
            onKeyPress: (e) => {
                if (!isDisabled && e.key === 'Enter') {
                    e.preventDefault();
                    e.target.blur();
                }
            },
            onKeyUp: (e) => {
                if (!isDisabled) {
                    // Chỉ cho nhập số, dấu phẩy và dấu chấm
                    const regex = /^[0-9.,]*$/;
                    if (!regex.test(e.target.textContent)) {
                        e.target.textContent = e.target.textContent.replace(/[^0-9.,]/g, '');
                    }

                    // Cập nhật màu real-time khi nhập
                    const currentValue = e.target.textContent.trim();
                    if (currentValue !== '') {
                        const numValue = parseFloat(currentValue.replace(',', '.'));
                        if ((!isNaN(numValue) && numValue >= 0 && numValue <= 5) || numValue === 0) {
                            e.target.style.color = '#dc2626';
                            e.target.style.fontWeight = 'bold';
                            e.target.classList.add('low-score');
                        } else {
                            e.target.style.color = 'inherit';
                            e.target.style.fontWeight = 'normal';
                            e.target.classList.remove('low-score');
                        }
                    }
                }
            },
            title: isDisabled ?
                (isSpecial ? 'Môn đặc biệt - chỉ nhập điểm cuối kỳ' :
                    selectedType === 'LT' && isThucHanhColumn ? 'Môn lý thuyết - không có điểm thực hành' :
                        selectedType === 'TH' && (isLyThuyetColumn || scoreType === 'ck') ? 'Môn thực hành - chỉ nhập điểm thực hành' :
                            'Ô nhập bị vô hiệu hóa') :
                'Nhập điểm từ 0-10. Điểm sẽ được làm tròn theo quy định IUH.',
            onInput: (e) => {
                if (!isDisabled) {
                    const value = e.target.textContent.trim();
                    const validation = validateScore(value);

                    if (value !== '' && !validation.isValid) {
                        e.target.style.color = '#dc2626';
                        e.target.style.backgroundColor = '#fef2f2';
                        e.target.title = validation.error;
                    } else {
                        e.target.style.backgroundColor = 'inherit';
                        e.target.title = isDisabled ?
                            (isSpecial ? 'Môn đặc biệt - chỉ nhập điểm cuối kỳ' :
                                selectedType === 'LT' && isThucHanhColumn ? 'Môn lý thuyết - không có điểm thực hành' :
                                    selectedType === 'TH' && (isLyThuyetColumn || scoreType === 'ck') ? 'Môn thực hành - chỉ nhập điểm thực hành' :
                                        'Ô nhập bị vô hiệu hóa') :
                            'Nhập điểm từ 0-10. Điểm sẽ được làm tròn theo quy định IUH.';
                    }
                }
            }
        }, displayValue);
    };

    // Loading state
    if (isLoading) {
        return React.createElement('div', { className: 'loading' },
            React.createElement('div', { className: 'spinner' }),
            React.createElement('span', { className: 'loading-text' }, 'Đang tải dữ liệu điểm...')
        );
    }

    // Error state
    if (error) {
        return React.createElement('div', { className: 'error-container' },
            React.createElement('div', { className: 'error-icon' }, '⚠️'),
            React.createElement('div', { className: 'error-message' }, error),
            React.createElement('button', {
                className: 'retry-button',
                onClick: loadGradesFromStorage
            }, 'Thử lại')
        );
    }

    // No data state
    if (!gradesData || !gradesData.semesters || gradesData.semesters.length === 0) {
        return React.createElement('div', { className: 'no-data-container' },
            React.createElement('div', { className: 'no-data-icon' }, '📊'),
            React.createElement('div', { className: 'no-data-title' }, 'Chưa có dữ liệu điểm'),
            React.createElement('div', { className: 'no-data-text' }, 'Vui lòng truy cập trang tra cứu điểm IUH để lấy dữ liệu')
        );
    }

    // Main render
    return React.createElement('div', { className: 'grades-page-container' },
        // Render each semester
        gradesData.semesters.map((semester, semIndex) =>
            React.createElement('div', {
                key: `semester-${semIndex}`,
                className: 'semester-container'
            },
                // Semester title
                React.createElement('h3', { className: 'semester-title' }, semester.name),

                // Main table
                React.createElement('div', { className: 'table-responsive' },
                    React.createElement('table', { className: 'grades-table' },
                        // Table header
                        React.createElement('thead', null,
                            // Header row 1
                            React.createElement('tr', { className: 'header-row-1' },
                                React.createElement('th', { rowSpan: 3, className: 'col-stt' }, 'STT'),
                                React.createElement('th', { rowSpan: 3, className: 'col-ma-lhp' }, 'Mã lớp học phần'),
                                React.createElement('th', { rowSpan: 3, className: 'col-ten-mon' }, 'Tên môn học/học phần'),
                                React.createElement('th', { rowSpan: 3, className: 'col-tin-chi' }, 'Số tín chỉ'),
                                React.createElement('th', { rowSpan: 3, className: 'col-loai-mon' }, 'Loại môn'),
                                React.createElement('th', { rowSpan: 3, className: 'col-giua-ky' }, 'Giữa kỳ'),
                                React.createElement('th', { colSpan: 4, className: 'col-thuong-xuyen' }, 'Thường xuyên'),
                                React.createElement('th', { colSpan: 5, className: 'col-thuc-hanh' }, 'Thực hành'),
                                React.createElement('th', { rowSpan: 3, className: 'col-cuoi-ky' }, 'Cuối kỳ'),
                                React.createElement('th', { rowSpan: 3, className: 'col-tong-ket' }, 'Điểm tổng kết'),
                                React.createElement('th', { rowSpan: 3, className: 'col-thang-diem-4' }, 'Thang điểm 4'),
                                React.createElement('th', { rowSpan: 3, className: 'col-diem-chu' }, 'Điểm chữ'),
                                React.createElement('th', { rowSpan: 3, className: 'col-xep-loai' }, 'Xếp loại'),
                                React.createElement('th', { rowSpan: 3, className: 'col-ghi-chu' }, 'Ghi chú'),
                                React.createElement('th', { rowSpan: 3, className: 'col-dat' }, 'Đạt')
                            ),
                            // Header row 2
                            React.createElement('tr', { className: 'header-row-2' },
                                React.createElement('th', { colSpan: 4, className: 'sub-header' }, 'LT Hệ số 1'),
                                React.createElement('th', { className: 'th-col' }, '1'),
                                React.createElement('th', { className: 'th-col' }, '2'),
                                React.createElement('th', { className: 'th-col' }, '3'),
                                React.createElement('th', { className: 'th-col' }, '4'),
                                React.createElement('th', { className: 'th-col' }, '5')
                            ),
                            // Header row 3
                            React.createElement('tr', { className: 'header-row-3' },
                                React.createElement('th', { className: 'tx-col' }, '1'),
                                React.createElement('th', { className: 'tx-col' }, '2'),
                                React.createElement('th', { className: 'tx-col' }, '3'),
                                React.createElement('th', { className: 'tx-col' }, '4')
                            )
                        ),

                        // Table body
                        React.createElement('tbody', null,
                            semester.subjects.map((subject, subIndex) =>
                                React.createElement('tr', {
                                    key: `subject-${semIndex}-${subIndex}`,
                                    className: 'subject-row'
                                },
                                    React.createElement('td', { className: 'td-stt' }, subject.stt),
                                    React.createElement('td', { className: 'td-ma-lhp' }, subject.maLhp),
                                    React.createElement('td', { className: 'td-ten-mon' }, subject.name),
                                    React.createElement('td', { className: 'td-tin-chi' }, subject.credits),
                                    createSubjectTypeSelector(semIndex, subIndex),
                                    createEditableCell(subject.diemGiuaKy, 'gk', semIndex, subIndex),
                                    // Thường xuyên columns (4) - editable
                                    createEditableCell(subject.thuongXuyen[0], 'tx1', semIndex, subIndex),
                                    createEditableCell(subject.thuongXuyen[1], 'tx2', semIndex, subIndex),
                                    createEditableCell(subject.thuongXuyen[2], 'tx3', semIndex, subIndex),
                                    createEditableCell(subject.thuongXuyen[3], 'tx4', semIndex, subIndex),
                                    // Thực hành columns (5) - editable
                                    createEditableCell(subject.thucHanh[0], 'th1', semIndex, subIndex),
                                    createEditableCell(subject.thucHanh[1], 'th2', semIndex, subIndex),
                                    createEditableCell(subject.thucHanh[2], 'th3', semIndex, subIndex),
                                    createEditableCell(subject.thucHanh[3], 'th4', semIndex, subIndex),
                                    createEditableCell(subject.thucHanh[4], 'th5', semIndex, subIndex),
                                    createEditableCell(subject.diemCuoiKy, 'ck', semIndex, subIndex),
                                    React.createElement('td', {
                                        className: `td-tong-ket ${getGradeClass(subject.diemTongKet)}`,
                                        style: (subject.diemTongKet !== null && subject.diemTongKet !== undefined && subject.diemTongKet >= 0 && subject.diemTongKet <= 5) || subject.diemTongKet === 0 ? { color: '#dc2626', fontWeight: 'bold' } : {}
                                    }, subject.diemTongKet !== null && subject.diemTongKet !== undefined ?
                                        (typeof subject.diemTongKet === 'string' ? subject.diemTongKet : subject.diemTongKet.toFixed(1).replace('.', ',')) : ''),
                                    React.createElement('td', { className: 'td-thang-diem-4' },
                                        subject.thangDiem4 !== null && subject.thangDiem4 !== undefined ?
                                            subject.thangDiem4.toFixed(1).replace('.', ',') : ''
                                    ),
                                    React.createElement('td', { className: 'td-diem-chu' }, subject.diemChu || ''),
                                    React.createElement('td', { className: 'td-xep-loai' }, subject.xepLoai || ''),
                                    React.createElement('td', { className: 'td-ghi-chu' }, subject.ghiChu || ''),
                                    React.createElement('td', { className: 'td-dat' }, subject.dat || '')
                                )
                            )
                        )
                    )
                ),

                // Extended Semester Summary Table - chỉ hiển thị khi có điểm tổng kết
                semester.summary && semester.subjects.some(subject =>
                    subject.diemTongKet !== null && subject.diemTongKet !== undefined
                ) && React.createElement('div', { className: 'semester-summary-table' },
                    React.createElement('table', { className: 'summary-table' },
                        React.createElement('tbody', null,
                            // Điểm trung bình học kỳ
                            React.createElement('tr', { className: 'summary-row' },
                                React.createElement('td', { className: 'summary-label', colSpan: 2 },
                                    `Điểm trung bình học kỳ hệ 10: ${semester.summary.diemTrungBinhHocKy10.toFixed(2).replace('.', ',')}`
                                ),
                                React.createElement('td', { className: 'summary-label', colSpan: 2 },
                                    `Điểm trung bình học kỳ hệ 4: ${semester.summary.diemTrungBinhHocKy4.toFixed(2).replace('.', ',')}`
                                )
                            ),

                            // Điểm trung bình tích lũy  
                            React.createElement('tr', { className: 'summary-row' },
                                React.createElement('td', { className: 'summary-label', colSpan: 2 },
                                    `Điểm trung bình tích lũy hệ 10: ${semester.summary.diemTrungBinhTichLuy10.toFixed(2).replace('.', ',')}`
                                ),
                                React.createElement('td', { className: 'summary-label', colSpan: 2 },
                                    `Điểm trung bình tích lũy hệ 4: ${semester.summary.diemTrungBinhTichLuy4.toFixed(2).replace('.', ',')}`
                                )
                            ),

                            // Tổng số tín chỉ
                            React.createElement('tr', { className: 'summary-row' },
                                React.createElement('td', { className: 'summary-label', colSpan: 2 },
                                    `Tổng số tín chỉ đã đăng ký: ${semester.summary.tongTinChiDangKy}`
                                ),
                                React.createElement('td', { className: 'summary-label', colSpan: 2 },
                                    `Tổng số tín chỉ tích lũy: ${semester.summary.tongTinChiTichLuy}`
                                )
                            ),

                            // Tổng số tín chỉ đạt và nợ
                            React.createElement('tr', { className: 'summary-row' },
                                React.createElement('td', { className: 'summary-label', colSpan: 2 },
                                    `Tổng số tín chỉ đạt: ${semester.summary.tongTinChiDat}`
                                ),
                                React.createElement('td', { className: 'summary-label', colSpan: 2 },
                                    `Tổng số tín chỉ nợ tính đến hiện tại: ${semester.summary.tongTinChiNo}`
                                )
                            ),

                            // Xếp loại học lực
                            React.createElement('tr', { className: 'summary-row' },
                                React.createElement('td', { className: 'summary-label', colSpan: 2 },
                                    `Xếp loại học lực tích lũy: ${semester.summary.xepLoaiTichLuy}`
                                ),
                                React.createElement('td', { className: 'summary-label', colSpan: 2 },
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
        if (!grade) return '';
        if (grade >= 9.0) return 'excellent';
        if (grade >= 8.0) return 'good';
        if (grade >= 6.5) return 'average';
        return 'poor';
    }
}
