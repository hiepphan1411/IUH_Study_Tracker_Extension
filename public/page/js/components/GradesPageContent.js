/* eslint-disable no-undef */

function GradesPageContent({ keyValue }) {
    const [gradesData, setGradesData] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState(null);

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
                                    React.createElement('td', { className: 'td-giua-ky' },
                                        subject.diemGiuaKy !== null ? subject.diemGiuaKy : ''
                                    ),
                                    // Thường xuyên columns (4)
                                    subject.thuongXuyen.map((score, idx) =>
                                        React.createElement('td', {
                                            key: `tx-${idx}`,
                                            className: 'td-thuong-xuyen'
                                        }, score !== null ? score : '')
                                    ),
                                    // Thực hành columns (4)
                                    subject.thucHanh.map((score, idx) =>
                                        React.createElement('td', {
                                            key: `th-${idx}`,
                                            className: 'td-thuc-hanh'
                                        }, score !== null ? score : '')
                                    ),
                                    React.createElement('td', { className: 'td-cuoi-ky' },
                                        subject.diemCuoiKy !== null ? subject.diemCuoiKy : ''
                                    ),
                                    React.createElement('td', {
                                        className: `td-tong-ket ${getGradeClass(subject.diemTongKet)}`
                                    }, subject.diemTongKet !== null ? subject.diemTongKet : ''),
                                    React.createElement('td', { className: 'td-thang-diem-4' },
                                        subject.thangDiem4 !== null ? subject.thangDiem4 : ''
                                    ),
                                    React.createElement('td', { className: 'td-diem-chu' }, subject.diemChu || ''),
                                    React.createElement('td', { className: 'td-xep-loai' }, subject.xepLoai || ''),
                                    React.createElement('td', { className: 'td-ghi-chu' }, subject.ghiChu || ''),
                                    React.createElement('td', { className: 'td-dat' }, subject.dat || '')
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
