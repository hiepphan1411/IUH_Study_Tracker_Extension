/* eslint-disable no-undef */

function GradesPageContent({ keyValue }) {
    const [gradesData, setGradesData] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState(null);

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
        setGradesData({
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
                            thucHanh: [null, null, null, null],
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
                            thucHanh: [8.00, 8.50, 8.00, null],
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
                            thucHanh: [null, null, null, null],
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
                            thucHanh: [null, null, null, null],
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
                            thucHanh: [null, null, null, null],
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
                            diemGiuaKy: null,
                            thuongXuyen: [null, null, null, null],
                            thucHanh: [10.00, 9.00, 10.00, null],
                            diemCuoiKy: 10.00,
                            diemTongKet: 9.70,
                            thangDiem4: 4.00,
                            diemChu: "A+",
                            xepLoai: "Xuất sắc",
                            ghiChu: "",
                            dat: "✓"
                        },
                        {
                            stt: 7,
                            maLhp: "420301416477",
                            name: "Triết học Mác - Lênin",
                            credits: 3,
                            diemGiuaKy: 7.00,
                            thuongXuyen: [10.00, 10.00, 9.50, null],
                            thucHanh: [null, null, null, null],
                            diemCuoiKy: 7.00,
                            diemTongKet: 7.60,
                            thangDiem4: 3.00,
                            diemChu: "B",
                            xepLoai: "Khá",
                            ghiChu: "",
                            dat: "✓"
                        }
                    ]
                }
            ]
        });
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
                        return parseFloat(parsed.toFixed(2));
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
                        // Parse Thực hành columns (4 columns)
                        thucHanh: [
                            parseScore(subject["Thực hành 1"]),
                            parseScore(subject["Thực hành 2"]),
                            parseScore(subject["Thực hành 3"]),
                            parseScore(subject["Thực hành 4"])
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
    const calculateScore = (score) => {
        const { dsDiemTK, dsDiemTH, giuaKy, cuoiKy, tinChi } = score;
        let diemTongKet = 0;
        const slDiemLTKhacKhong = dsDiemTK.filter((score) => score !== 0).length;
        const slDiemTHKhacKhong = dsDiemTH.filter((score) => score !== 0).length;

        if (dsDiemTH.filter((score) => score !== 0).length === 0) {
            diemTongKet =
                ((dsDiemTK.reduce((prev, curr) => prev + curr, 0) / slDiemLTKhacKhong) * 20 + giuaKy * 30 + cuoiKy * 50) / 100;
        } else {
            const diemTongKetLT =
                ((dsDiemTK.reduce((prev, curr) => prev + curr, 0) / slDiemLTKhacKhong) * 20 + giuaKy * 30 + cuoiKy * 50) / 100;
            const diemTongKetTH = dsDiemTH.reduce((prev, curr) => prev + curr, 0) / slDiemTHKhacKhong;
            tinChi === 3
                ? (diemTongKet = (diemTongKetLT * 2 + diemTongKetTH) / 3)
                : (diemTongKet = (diemTongKetLT * 3 + diemTongKetTH) / 4);
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
        score = Number(score.toFixed(1));
        if (score >= 9) return 4;
        if (score >= 8.5) return 3.8;
        if (score >= 8) return 3.5;
        if (score >= 7) return 3;
        if (score >= 6) return 2.5;
        if (score >= 5.5) return 2;
        if (score >= 5) return 1.5;
        if (score >= 4) return 1;
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
        if (score >= 3.6) return 'Xuất sắc';
        if (score >= 3.2) return 'Giỏi';
        if (score >= 2.5) return 'Khá';
        if (score >= 2) return 'Trung bình';
        return 'Kém';
    };

    // Hàm xử lý khi điểm thay đổi
    const handleScoreChange = (semesterIndex, subjectIndex, field, value) => {
        const newGradesData = { ...gradesData };
        const subject = newGradesData.semesters[semesterIndex].subjects[subjectIndex];

        // Validate điểm
        if (value !== '' && (isNaN(value) || value < 0 || value > 10)) {
            return;
        }

        // Cập nhật điểm
        if (field.startsWith('thuongXuyen')) {
            const index = parseInt(field.split('-')[1]);
            subject.thuongXuyen[index] = value === '' ? null : parseFloat(value);
        } else if (field.startsWith('thucHanh')) {
            const index = parseInt(field.split('-')[1]);
            subject.thucHanh[index] = value === '' ? null : parseFloat(value);
        } else {
            subject[field] = value === '' ? null : parseFloat(value);
        }

        // Tính lại điểm tổng kết
        const dsDiemTK = subject.thuongXuyen.filter(score => score !== null && score !== 0);
        const dsDiemTH = subject.thucHanh.filter(score => score !== null && score !== 0);
        const giuaKy = subject.diemGiuaKy || 0;
        const cuoiKy = subject.diemCuoiKy || 0;

        // Kiểm tra điều kiện đặc biệt
        if (giuaKy === 0) {
            subject.diemTongKet = null;
            subject.thangDiem4 = 0;
            subject.diemChu = 'F';
            subject.xepLoai = 'Kém';
            subject.ghiChu = 'Cấm thi';
            subject.dat = '';
        } else if (cuoiKy < 3 && cuoiKy !== 0) {
            subject.diemTongKet = null;
            subject.thangDiem4 = 0;
            subject.diemChu = 'F';
            subject.xepLoai = 'Kém';
            subject.ghiChu = 'CK < 3';
            subject.dat = '';
        } else if (dsDiemTK.length >= 2 && giuaKy > 0 && cuoiKy > 0) {
            const scoreData = {
                dsDiemTK: subject.thuongXuyen.map(s => s || 0),
                dsDiemTH: subject.thucHanh.map(s => s || 0),
                giuaKy: giuaKy,
                cuoiKy: cuoiKy,
                tinChi: subject.credits
            };

            const result = calculateScore(scoreData);
            subject.diemTongKet = result.diemTongKet;
            subject.thangDiem4 = result.diemTongKet4;
            subject.diemChu = result.diemChu;
            subject.xepLoai = result.xepLoai;
            subject.ghiChu = result.ghiChu;
            subject.dat = result.isDat ? "✓" : "";
        }

        // Tính lại thống kê học kỳ
        calculateSemesterSummary(newGradesData.semesters[semesterIndex]);

        setGradesData(newGradesData);
    };

    // Tính thống kê học kỳ
    const calculateSemesterSummary = (semester) => {
        const validSubjects = semester.subjects.filter(subject =>
            !listSubjectIgnoresCalcScore.includes(subject.name.toLowerCase().trim()) &&
            subject.diemTongKet !== null && subject.diemTongKet !== undefined
        );

        const tong10 = validSubjects.reduce((sum, subject) =>
            sum + (subject.diemTongKet * subject.credits), 0);
        const tong4 = validSubjects.reduce((sum, subject) =>
            sum + (subject.thangDiem4 * subject.credits), 0);
        const tongTinChi = validSubjects.reduce((sum, subject) =>
            sum + subject.credits, 0);

        semester.summary = {
            diemTrungBinhHocKy10: tongTinChi > 0 ? (tong10 / tongTinChi) : 0,
            diemTrungBinhHocKy4: tongTinChi > 0 ? (tong4 / tongTinChi) : 0,
            xepLoaiHocKy: tongTinChi > 0 ? convertScore4ToClassificationHK(tong4 / tongTinChi) : ''
        };
    };

    // Function to calculate final grade for a subject
    const calculateFinalGrade = (subject) => {
        const thuongXuyen = subject.thuongXuyen.filter(score => score !== null && score !== undefined && score > 0);
        const thucHanh = subject.thucHanh.filter(score => score !== null && score !== undefined && score > 0);
        const giuaKy = subject.diemGiuaKy || 0;
        const cuoiKy = subject.diemCuoiKy || 0;
        const tinChi = subject.credits || 0;

        if (giuaKy === 0 || cuoiKy === 0) {
            return {
                diemHe10: null,
                diemHe4: null,
                diemChu: '',
                xepLoai: ''
            };
        }

        let diemTongKet = 0;
        const diemThuongXuyen = thuongXuyen.length > 0 ?
            thuongXuyen.reduce((sum, score) => sum + score, 0) / thuongXuyen.length : 0;

        if (thucHanh.length === 0) {
            // Môn lý thuyết
            diemTongKet = (diemThuongXuyen * 0.2 + giuaKy * 0.3 + cuoiKy * 0.5);
        } else {
            // Môn có thực hành
            const diemThucHanh = thucHanh.reduce((sum, score) => sum + score, 0) / thucHanh.length;
            const diemLT = (diemThuongXuyen * 0.2 + giuaKy * 0.3 + cuoiKy * 0.5);

            if (tinChi === 3) {
                diemTongKet = (diemLT * 2 + diemThucHanh) / 3;
            } else {
                diemTongKet = (diemLT * 3 + diemThucHanh) / 4;
            }
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
            case 'ck':
                field = 'diemCuoiKy';
                break;
        }

        // Use handleScoreChange to update and recalculate
        handleScoreChange(semesterIndex, subjectIndex, field, newValue);

        // Update visual styling for low scores
        const numValue = parseFloat(newValue.replace(',', '.'));
        if (!isNaN(numValue) && numValue <= 5 && numValue > 0) {
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
        return parseFloat(parsed.toFixed(2));
    };

    // Hàm tạo ô input có thể chỉnh sửa với logic màu đỏ cho điểm ≤ 5
    const createEditableCell = (value, scoreType, semesterIndex, subjectIndex) => {
        // Parse value để hiển thị đúng format
        const numericValue = parseScore(value);
        const displayValue = value ? (typeof value === 'string' ? value : value.toString().replace('.', ',')) : '';
        const isLowScore = numericValue !== null && numericValue <= 5 && numericValue > 0;

        return React.createElement('td', {
            className: isLowScore ? 'low-score' : '',
            contentEditable: true,
            suppressContentEditableWarning: true,
            style: {
                outline: 'none',
                color: isLowScore ? '#dc2626' : 'inherit',
                fontWeight: isLowScore ? 'bold' : 'normal'
            },
            onBlur: (e) => updateScore(e, scoreType, semesterIndex, subjectIndex),
            onKeyPress: (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    e.target.blur();
                }
            },
            onKeyUp: (e) => {
                // Chỉ cho nhập số, dấu phẩy và dấu chấm
                const regex = /^[0-9.,]*$/;
                if (!regex.test(e.target.textContent)) {
                    e.target.textContent = e.target.textContent.replace(/[^0-9.,]/g, '');
                }

                // Cập nhật màu real-time khi nhập
                const currentValue = e.target.textContent.trim();
                if (currentValue !== '') {
                    const numValue = parseFloat(currentValue.replace(',', '.'));
                    if (!isNaN(numValue) && numValue <= 5 && numValue > 0) {
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
                                React.createElement('th', { rowSpan: 3, className: 'col-giua-ky' }, 'Giữa kỳ'),
                                React.createElement('th', { colSpan: 4, className: 'col-thuong-xuyen' }, 'Thường xuyên'),
                                React.createElement('th', { colSpan: 4, className: 'col-thuc-hanh' }, 'Thực hành'),
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
                                React.createElement('th', { className: 'th-col' }, '4')
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
                                    createEditableCell(subject.diemGiuaKy || '', 'gk', semIndex, subIndex),
                                    // Thường xuyên columns (4) - editable
                                    createEditableCell(subject.thuongXuyen[0] || '', 'tx1', semIndex, subIndex),
                                    createEditableCell(subject.thuongXuyen[1] || '', 'tx2', semIndex, subIndex),
                                    createEditableCell(subject.thuongXuyen[2] || '', 'tx3', semIndex, subIndex),
                                    createEditableCell(subject.thuongXuyen[3] || '', 'tx4', semIndex, subIndex),
                                    // Thực hành columns (4) - editable
                                    createEditableCell(subject.thucHanh[0] || '', 'th1', semIndex, subIndex),
                                    createEditableCell(subject.thucHanh[1] || '', 'th2', semIndex, subIndex),
                                    createEditableCell(subject.thucHanh[2] || '', 'th3', semIndex, subIndex),
                                    createEditableCell(subject.thucHanh[3] || '', 'th4', semIndex, subIndex),
                                    createEditableCell(subject.diemCuoiKy || '', 'ck', semIndex, subIndex),
                                    React.createElement('td', {
                                        className: `td-tong-ket ${getGradeClass(subject.diemTongKet)}`,
                                        style: subject.diemTongKet <= 5 && subject.diemTongKet !== null ? { color: '#dc2626' } : {}
                                    }, subject.diemTongKet !== null && subject.diemTongKet !== undefined ?
                                        (typeof subject.diemTongKet === 'string' ? subject.diemTongKet : subject.diemTongKet.toFixed(2).replace('.', ',')) : ''),
                                    React.createElement('td', { className: 'td-thang-diem-4' },
                                        subject.thangDiem4 !== null && subject.thangDiem4 !== undefined ? subject.thangDiem4.toFixed(2).replace('.', ',') : ''
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

                // Semester summary
                semester.summary && React.createElement('div', { className: 'semester-summary' },
                    React.createElement('div', { className: 'summary-item' },
                        React.createElement('span', null, `Điểm trung bình học kỳ hệ 10: ${semester.summary.diemTrungBinhHocKy10.toFixed(2).replace('.', ',')}`)
                    ),
                    React.createElement('div', { className: 'summary-item' },
                        React.createElement('span', null, `Điểm trung bình học kỳ hệ 4: ${semester.summary.diemTrungBinhHocKy4.toFixed(2).replace('.', ',')}`)
                    ),
                    React.createElement('div', { className: 'summary-item' },
                        React.createElement('span', null, `Xếp loại học lực học kỳ: ${semester.summary.xepLoaiHocKy}`)
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
