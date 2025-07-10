
function Layout({ children, title, isScrolled }) {
    return React.createElement(
        "div",
        { className: "layout" },
        React.createElement(Sidebar),
        React.createElement(
            "div",
            { className: "main-content" },
            !isScrolled && React.createElement(Header, { title: title }),
            React.createElement("div", { className: "content-area hide-scrollbar" }, children),
        ),
    )
}

// const SIDEBAR_ITEMS = [
//     {
//         name: "Overview",
//         icon: "📊",
//         color: "#6366f1",
//         href: "/overview",
//         onClick: () => {
//             const key = new URLSearchParams(window.location.search).get("k")
//             const baseUrl = window.location.origin + window.location.pathname.replace("/GradesPage.html", "")
//             const keyParam = key ? `?k=${encodeURIComponent(key)}` : ""
//             window.location.href = `${baseUrl}/MainPage.html${keyParam}`
//         },
//     },
//     {
//         name: "View Learning Results",
//         icon: "📚",
//         color: "#8B5CF6",
//         href: "/courses",
//         onClick: () => {
//             const key = new URLSearchParams(window.location.search).get("k")
//             const baseUrl = window.location.origin + window.location.pathname.replace("/GradesPage.html", "")
//             const keyParam = key ? `?k=${encodeURIComponent(key)}` : ""
//             window.location.href = `${baseUrl}/GradesPage.html${keyParam}`
//         },
//     },
//     {
//         name: "Study Plan",
//         icon: "📅",
//         color: "#EC4899",
//         href: "/users",
//         onClick: () => {
//             const key = new URLSearchParams(window.location.search).get('k');
//             const baseUrl = window.location.origin + window.location.pathname.replace('/GradesPage.html', '');
//             window.location.href = `${baseUrl}/StudyPlanPage.html${key ? `?k=${encodeURIComponent(key)}` : ''}`;
//         }
//     }
// ];

// function MenuIcon({ size = 24 }) {
//     return React.createElement(
//         "svg",
//         {
//             width: size,
//             height: size,
//             viewBox: "0 0 24 24",
//             fill: "none",
//             stroke: "currentColor",
//             strokeWidth: "2",
//         },
//         React.createElement("line", { x1: "3", y1: "6", x2: "21", y2: "6" }),
//         React.createElement("line", { x1: "3", y1: "12", x2: "21", y2: "12" }),
//         React.createElement("line", { x1: "3", y1: "18", x2: "21", y2: "18" }),
//     )
// }

// function Sidebar() {
//     const [isSidebarOpen, setIsSidebarOpen] = React.useState(true)

//     return React.createElement(
//         motion.div,
//         {
//             className: `sidebar ${isSidebarOpen ? "open" : "closed"}`,
//             animate: { width: isSidebarOpen ? 220 : 80 },
//         },
//         React.createElement(
//             "div",
//             { className: "sidebar-content" },
//             React.createElement(
//                 "div",
//                 { className: "sidebar-header" },
//                 React.createElement(
//                     motion.button,
//                     {
//                         whileHover: { scale: 1.1 },
//                         whileTap: { scale: 0.9 },
//                         onClick: () => setIsSidebarOpen(!isSidebarOpen),
//                         className: "menu-button",
//                     },
//                     React.createElement(MenuIcon, { size: 24 }),
//                 ),
//                 React.createElement(
//                     AnimatePresence,
//                     null,
//                     isSidebarOpen &&
//                     React.createElement(
//                         motion.h2,
//                         {
//                             className: "sidebar-title fade-in",
//                             initial: { opacity: 0, width: 0 },
//                             animate: { opacity: 1, width: "auto" },
//                             exit: { opacity: 0, width: 0 },
//                             transition: { duration: 0.2, delay: 0.3 },
//                         },
//                         "IUH Study Tracker",
//                     ),
//                 ),
//             ),
//             React.createElement(
//                 "nav",
//                 { className: "sidebar-nav" },
//                 SIDEBAR_ITEMS.map((item) =>
//                     React.createElement(
//                         motion.div,
//                         {
//                             key: item.name,
//                             className: "sidebar-item",
//                             onClick: item.onClick,
//                             whileHover: { scale: 1.02 },
//                             whileTap: { scale: 0.98 },
//                         },
//                         React.createElement(
//                             "span",
//                             {
//                                 className: "sidebar-item-icon",
//                                 style: { color: item.color },
//                             },
//                             item.icon,
//                         ),
//                         React.createElement(
//                             AnimatePresence,
//                             null,
//                             isSidebarOpen &&
//                             React.createElement(
//                                 motion.span,
//                                 {
//                                     className: "sidebar-item-text fade-in",
//                                     initial: { opacity: 0, width: 0 },
//                                     animate: { opacity: 1, width: "auto" },
//                                     exit: { opacity: 0, width: 0 },
//                                     transition: { duration: 0.2, delay: 0.3 },
//                                 },
//                                 item.name,
//                             ),
//                         ),
//                     ),
//                 ),
//             ),
//             React.createElement(
//                 "div",
//                 { className: "sidebar-footer" },
//                 React.createElement(
//                     motion.button,
//                     {
//                         onClick: () => window.close(),
//                         className: "back-button",
//                         whileHover: { scale: 1.02 },
//                         whileTap: { scale: 0.98 },
//                     },
//                     React.createElement("span", { className: "back-button-icon" }, "←"),
//                     React.createElement(
//                         AnimatePresence,
//                         null,
//                         isSidebarOpen &&
//                         React.createElement(
//                             motion.span,
//                             {
//                                 className: "back-button-text fade-in",
//                                 initial: { opacity: 0, width: 0 },
//                                 animate: { opacity: 1, width: "auto" },
//                                 exit: { opacity: 0, width: 0 },
//                                 transition: { duration: 0.2, delay: 0.3 },
//                             },
//                             "Quay lại Extension",
//                         ),
//                     ),
//                 ),
//             ),
//         ),
//     )
// }

function Header({ title }) {
    return React.createElement(
        "header",
        { className: "header" },
        React.createElement(
            "div",
            { className: "header-content" },
            React.createElement(
                "div",
                { className: "header-icon" },
                React.createElement(
                    "svg",
                    {
                        className: "header-icon svg",
                        fill: "none",
                        stroke: "currentColor",
                        viewBox: "0 0 24 24",
                    },
                    React.createElement("path", {
                        strokeLinecap: "round",
                        strokeLinejoin: "round",
                        strokeWidth: 2,
                        d: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
                    }),
                ),
            ),
            React.createElement("h1", { className: "header-title" }, title),
        ),
    )
}

function GradesPage() {
    const [gradesData, setGradesData] = React.useState(null)
    const [isLoading, setIsLoading] = React.useState(false)
    const [isScrolled, setIsScrolled] = React.useState(false)

    React.useEffect(() => {
        const handleScroll = () => {
            const scrollTop = document.querySelector(".content-area").scrollTop
            setIsScrolled(scrollTop > 100) // Hide header after scrolling 100px
        }

        const contentArea = document.querySelector(".content-area")
        if (contentArea) {
            contentArea.addEventListener("scroll", handleScroll)
            return () => contentArea.removeEventListener("scroll", handleScroll)
        }
    }, [])

    React.useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search)
        const keyParam = urlParams.get("k")
        if (keyParam) {
            loadGrades(keyParam)
        }
    }, [])

    const loadGrades = async (key) => {
        setIsLoading(true)
        try {
            await new Promise((resolve) => setTimeout(resolve, 1000))

            setGradesData({
                studentInfo: {
                    name: "Nguyễn Văn A",
                    studentId: "21012345",
                    class: "DHKTPM18A",
                },
                semesters: [
                    {
                        name: "HK1 (2022 - 2023)",
                        subjects: [
                            {
                                stt: 1,
                                maLhp: "DHKTPM18A_NMTH",
                                name: "Nhập môn Tin học",
                                credits: 2,
                                diemGiuaKy: 8.0,
                                diemCuoiKy: 9.0,
                                diemTongKet: 8.6,
                                diemChu: "B+",
                                xepLoai: "Giỏi",
                            },
                            {
                                stt: 2,
                                maLhp: "DHKTPM18A_KNLVN",
                                name: "Kỹ năng làm việc nhóm",
                                credits: 2,
                                diemGiuaKy: 7.5,
                                diemCuoiKy: 8.5,
                                diemTongKet: 8.1,
                                diemChu: "B+",
                                xepLoai: "Giỏi",
                            },
                        ],
                        summary: {
                            diemTrungBinhHocKy10: 8.35,
                            diemTrungBinhHocKy4: 3.45,
                            diemTrungBinhTichLuy10: 8.35,
                            diemTrungBinhTichLuy4: 3.45,
                            tongSoTinChiDangKy: 4,
                            tongSoTinChiDat: 4,
                            tongSoTinChiTichLuy: 4,
                            tongSoTinChiKhongTinhDenHienTai: 0,
                            xepLoaiHocLucHocKy: "Xuất sắc",
                            xepLoaiHocLucTichLuy: "Xuất sắc",
                        },
                    },
                    {
                        name: "HK2 (2022 - 2023)",
                        subjects: [
                            {
                                stt: 3,
                                maLhp: "DHKTPM18A_LTJ",
                                name: "Lập trình Java",
                                credits: 3,
                                diemGiuaKy: 8.5,
                                diemCuoiKy: 9.0,
                                diemTongKet: 8.8,
                                diemChu: "A",
                                xepLoai: "Giỏi",
                            },
                            {
                                stt: 4,
                                maLhp: "DHKTPM18A_CSDL",
                                name: "Cơ sở dữ liệu",
                                credits: 3,
                                diemGiuaKy: 9.0,
                                diemCuoiKy: 9.5,
                                diemTongKet: 9.2,
                                diemChu: "A+",
                                xepLoai: "Xuất sắc",
                            },
                        ],
                        summary: {
                            diemTrungBinhHocKy10: 9.0,
                            diemTrungBinhHocKy4: 3.8,
                            diemTrungBinhTichLuy10: 8.7,
                            diemTrungBinhTichLuy4: 3.6,
                            tongSoTinChiDangKy: 6,
                            tongSoTinChiDat: 6,
                            tongSoTinChiTichLuy: 10,
                            tongSoTinChiKhongTinhDenHienTai: 0,
                            xepLoaiHocLucHocKy: "Xuất sắc",
                            xepLoaiHocLucTichLuy: "Xuất sắc",
                        },
                    },
                ],
                // Fallback subjects for backward compatibility
                subjects: [
                    { id: 1, name: "Lập trình Java", grade: 8.8, credits: 3 },
                    { id: 2, name: "Cơ sở dữ liệu", grade: 9.2, credits: 3 },
                    { id: 3, name: "Nhập môn Tin học", grade: 8.6, credits: 2 },
                ],
            })
        } catch (error) {
            console.error("Error loading grades:", error)
        } finally {
            setIsLoading(false)
        }
    }

    return React.createElement(
        Layout,
        { title: "Xem Điểm", isScrolled: isScrolled },
        // React.createElement('div', { className: 'page-content' },
        // React.createElement('div', { className: 'card' },
        // React.createElement('h2', { className: 'card-title' }, 'Kết quả học tập'),

        isLoading
            ? React.createElement(
                "div",
                { className: "loading" },
                React.createElement("div", { className: "spinner" }),
                React.createElement("span", { className: "loading-text" }, "Đang tải dữ liệu..."),
            )
            : gradesData
                ? React.createElement(
                    "div",
                    { className: "info-card" },
                    // React.createElement('h3', { className: 'info-card-title' }, 'Kết quả học tập'),
                    React.createElement(
                        "div",
                        { className: "table-container iuh-grades-table" },
                        React.createElement(
                            "div",
                            { className: "table-scroll-wrapper" },
                            React.createElement(
                                "table",
                                { className: "table table-bordered text-center grades-table-iuh" },
                                React.createElement(
                                    "thead",
                                    null,
                                    // Header row 1
                                    React.createElement(
                                        "tr",
                                        { className: "header-row-1" },
                                        React.createElement("th", { rowSpan: 3, className: "stt-col" }, "STT"),
                                        React.createElement("th", { rowSpan: 3, className: "malhp-col" }, "Mã lớp học phần"),
                                        React.createElement("th", { rowSpan: 3, className: "tenlhp-col" }, "Tên môn học/học phần"),
                                        React.createElement("th", { rowSpan: 3, className: "stc-col" }, "Số tín chỉ"),
                                        React.createElement("th", { rowSpan: 3, className: "giuaky-col" }, "Giữa kỳ"),
                                        React.createElement("th", { colSpan: 4, className: "thuongxuyen-col" }, "Thường xuyên"),
                                        React.createElement("th", { colSpan: 4, className: "thuchanh-col" }, "Thực hành"),
                                        React.createElement("th", { rowSpan: 3, className: "cuoiky-col" }, "Cuối kỳ"),
                                        React.createElement("th", { rowSpan: 3, className: "tongket-col" }, "Tổng kết"),
                                        React.createElement("th", { rowSpan: 3, className: "diemtinchi-col" }, "Thang điểm 4"),
                                        React.createElement("th", { rowSpan: 3, className: "diemchu-col" }, "Điểm chữ"),
                                        React.createElement("th", { rowSpan: 3, className: "xeploai-col" }, "Xếp loại"),
                                        React.createElement("th", { rowSpan: 3, className: "ghichu-col" }, "Ghi chú"),
                                    ),
                                    // Header row 2
                                    React.createElement(
                                        "tr",
                                        { className: "header-row-2" },
                                        React.createElement("th", { colSpan: 4, className: "lt-heso1" }, "LT Hệ số 1"),
                                        React.createElement("th", { rowSpan: 2, className: "th-1" }, "1"),
                                        React.createElement("th", { rowSpan: 2, className: "th-2" }, "2"),
                                        React.createElement("th", { rowSpan: 2, className: "th-3" }, "3"),
                                        React.createElement("th", { rowSpan: 2, className: "th-4" }, "4"),
                                    ),
                                    // Header row 3
                                    React.createElement(
                                        "tr",
                                        { className: "header-row-3" },
                                        React.createElement("th", { className: "hs-1" }, "1"),
                                        React.createElement("th", { className: "hs-2" }, "2"),
                                        React.createElement("th", { className: "hs-3" }, "3"),
                                        React.createElement("th", { className: "hs-4" }, "4"),
                                    ),
                                ),
                                React.createElement(
                                    "tbody",
                                    null,
                                    // Render semesters and subjects
                                    gradesData.semesters
                                        ? gradesData.semesters.flatMap((semester, semIndex) => [
                                            // Semester header row
                                            React.createElement(
                                                "tr",
                                                {
                                                    key: `semester-${semIndex}`,
                                                    className: "semester-header",
                                                },
                                                React.createElement(
                                                    "td",
                                                    {
                                                        colSpan: 17,
                                                        className: "text-left semester-title",
                                                    },
                                                    semester.name,
                                                ),
                                            ),
                                            // Subject rows for this semester
                                            ...semester.subjects.map((subject, subIndex) =>
                                                React.createElement(
                                                    "tr",
                                                    {
                                                        key: `subject-${semIndex}-${subIndex}`,
                                                        className: "subject-row",
                                                    },
                                                    React.createElement("td", { className: "stt" }, subject.stt || subIndex + 1),
                                                    React.createElement("td", { className: "ma-lhp" }, subject.maLhp || ""),
                                                    React.createElement("td", { className: "ten-mon text-left" }, subject.name),
                                                    React.createElement("td", { className: "tin-chi" }, subject.credits),
                                                    React.createElement("td", { className: "diem-giua-ky" }, subject.diemGiuaKy || ""),
                                                    // Điểm thường xuyên hệ số 1 (4 cột)
                                                    React.createElement("td", { className: "diem-hs1-1" }, subject.diemHS1_1 || ""),
                                                    React.createElement("td", { className: "diem-hs1-2" }, subject.diemHS1_2 || ""),
                                                    React.createElement("td", { className: "diem-hs1-3" }, subject.diemHS1_3 || ""),
                                                    React.createElement("td", { className: "diem-hs1-4" }, subject.diemHS1_4 || ""),
                                                    // Điểm thực hành (4 cột)
                                                    React.createElement("td", { className: "diem-th-1" }, subject.diemTH_1 || ""),
                                                    React.createElement("td", { className: "diem-th-2" }, subject.diemTH_2 || ""),
                                                    React.createElement("td", { className: "diem-th-3" }, subject.diemTH_3 || ""),
                                                    React.createElement("td", { className: "diem-th-4" }, subject.diemTH_4 || ""),
                                                    // Các cột cuối
                                                    React.createElement("td", { className: "diem-cuoi-ky" }, subject.diemCuoiKy || ""),
                                                    React.createElement(
                                                        "td",
                                                        {
                                                            className: `diem-tong-ket ${subject.diemTongKet >= 8.5
                                                                    ? "excellent"
                                                                    : subject.diemTongKet >= 7.0
                                                                        ? "good"
                                                                        : subject.diemTongKet >= 5.5
                                                                            ? "average"
                                                                            : "poor"
                                                                }`,
                                                        },
                                                        subject.diemTongKet || subject.grade || "",
                                                    ),
                                                    React.createElement("td", { className: "diem-tin-chi-4" }, subject.diemTinChi4 || ""),
                                                    React.createElement("td", { className: "diem-chu" }, subject.diemChu || ""),
                                                    React.createElement(
                                                        "td",
                                                        null,
                                                        React.createElement(
                                                            "span",
                                                            {
                                                                className: `grade-badge ${(subject.diemTongKet || subject.grade) >= 8.5
                                                                        ? "grade-excellent"
                                                                        : (subject.diemTongKet || subject.grade) >= 7.0
                                                                            ? "grade-good"
                                                                            : (subject.diemTongKet || subject.grade) >= 5.5
                                                                                ? "grade-average"
                                                                                : "grade-poor"
                                                                    }`,
                                                            },
                                                            subject.xepLoai ||
                                                            ((subject.diemTongKet || subject.grade) >= 8.5
                                                                ? "Giỏi"
                                                                : (subject.diemTongKet || subject.grade) >= 7.0
                                                                    ? "Khá"
                                                                    : (subject.diemTongKet || subject.grade) >= 5.5
                                                                        ? "Trung bình"
                                                                        : "Yếu"),
                                                        ),
                                                    ),
                                                    React.createElement("td", { className: "ghi-chu" }, subject.ghiChu || ""),
                                                ),
                                            ),
                                            // Semester summary row
                                            semester.summary
                                                ? React.createElement(
                                                    "tr",
                                                    {
                                                        key: `summary-${semIndex}`,
                                                        className: "semester-summary-row",
                                                    },
                                                    React.createElement(
                                                        "td",
                                                        {
                                                            colSpan: 12,
                                                            className: "semester-summary-cell",
                                                        },
                                                        React.createElement(
                                                            "div",
                                                            { className: "semester-summary" },
                                                            React.createElement(
                                                                "div",
                                                                { className: "summary-grid" },
                                                                React.createElement(
                                                                    "div",
                                                                    { className: "summary-column" },
                                                                    React.createElement(
                                                                        "div",
                                                                        { className: "summary-item" },
                                                                        React.createElement(
                                                                            "span",
                                                                            { className: "summary-label" },
                                                                            "Điểm TB học kỳ hệ 10:",
                                                                        ),
                                                                        React.createElement(
                                                                            "span",
                                                                            { className: "summary-value" },
                                                                            semester.summary.diemTrungBinhHocKy10,
                                                                        ),
                                                                    ),
                                                                    React.createElement(
                                                                        "div",
                                                                        { className: "summary-item" },
                                                                        React.createElement(
                                                                            "span",
                                                                            { className: "summary-label" },
                                                                            "Điểm TB học kỳ hệ 4:",
                                                                        ),
                                                                        React.createElement(
                                                                            "span",
                                                                            { className: "summary-value" },
                                                                            semester.summary.diemTrungBinhHocKy4,
                                                                        ),
                                                                    ),
                                                                    React.createElement(
                                                                        "div",
                                                                        { className: "summary-item" },
                                                                        React.createElement(
                                                                            "span",
                                                                            { className: "summary-label" },
                                                                            "Tổng số tín chỉ đăng ký:",
                                                                        ),
                                                                        React.createElement(
                                                                            "span",
                                                                            { className: "summary-value" },
                                                                            semester.summary.tongSoTinChiDangKy,
                                                                        ),
                                                                    ),
                                                                    React.createElement(
                                                                        "div",
                                                                        { className: "summary-item" },
                                                                        React.createElement(
                                                                            "span",
                                                                            { className: "summary-label" },
                                                                            "Tổng số tín chỉ đạt:",
                                                                        ),
                                                                        React.createElement(
                                                                            "span",
                                                                            { className: "summary-value" },
                                                                            semester.summary.tongSoTinChiDat,
                                                                        ),
                                                                    ),
                                                                    React.createElement(
                                                                        "div",
                                                                        { className: "summary-item" },
                                                                        React.createElement(
                                                                            "span",
                                                                            { className: "summary-label" },
                                                                            "Xếp loại học lực học kỳ:",
                                                                        ),
                                                                        React.createElement(
                                                                            "span",
                                                                            { className: "summary-value classification" },
                                                                            semester.summary.xepLoaiHocLucHocKy,
                                                                        ),
                                                                    ),
                                                                ),
                                                                React.createElement(
                                                                    "div",
                                                                    { className: "summary-column" },
                                                                    React.createElement(
                                                                        "div",
                                                                        { className: "summary-item" },
                                                                        React.createElement(
                                                                            "span",
                                                                            { className: "summary-label" },
                                                                            "Điểm TB tích lũy hệ 10:",
                                                                        ),
                                                                        React.createElement(
                                                                            "span",
                                                                            { className: "summary-value" },
                                                                            semester.summary.diemTrungBinhTichLuy10,
                                                                        ),
                                                                    ),
                                                                    React.createElement(
                                                                        "div",
                                                                        { className: "summary-item" },
                                                                        React.createElement(
                                                                            "span",
                                                                            { className: "summary-label" },
                                                                            "Điểm TB tích lũy hệ 4:",
                                                                        ),
                                                                        React.createElement(
                                                                            "span",
                                                                            { className: "summary-value" },
                                                                            semester.summary.diemTrungBinhTichLuy4,
                                                                        ),
                                                                    ),
                                                                    React.createElement(
                                                                        "div",
                                                                        { className: "summary-item" },
                                                                        React.createElement(
                                                                            "span",
                                                                            { className: "summary-label" },
                                                                            "Tổng số tín chỉ tích lũy:",
                                                                        ),
                                                                        React.createElement(
                                                                            "span",
                                                                            { className: "summary-value" },
                                                                            semester.summary.tongSoTinChiTichLuy,
                                                                        ),
                                                                    ),
                                                                    React.createElement(
                                                                        "div",
                                                                        { className: "summary-item" },
                                                                        React.createElement(
                                                                            "span",
                                                                            { className: "summary-label" },
                                                                            "Tổng số tín chỉ không tính đến hiện tại:",
                                                                        ),
                                                                        React.createElement(
                                                                            "span",
                                                                            { className: "summary-value" },
                                                                            semester.summary.tongSoTinChiKhongTinhDenHienTai || 0,
                                                                        ),
                                                                    ),
                                                                    React.createElement(
                                                                        "div",
                                                                        { className: "summary-item" },
                                                                        React.createElement(
                                                                            "span",
                                                                            { className: "summary-label" },
                                                                            "Xếp loại học lực tích lũy:",
                                                                        ),
                                                                        React.createElement(
                                                                            "span",
                                                                            { className: "summary-value classification" },
                                                                            semester.summary.xepLoaiHocLucTichLuy,
                                                                        ),
                                                                    ),
                                                                ),
                                                            ),
                                                        ),
                                                    ),
                                                )
                                                : null,
                                        ])
                                        : gradesData?.subjects?.map(renderSubjectRow),
                                ),
                            ),
                        ),
                    ),
                )
                : React.createElement(
                    "div",
                    { className: "no-data" },
                    React.createElement("p", null, "Không có dữ liệu để hiển thị"),
                ),
        // )
    )
    // );
}

ReactDOM.render(React.createElement(GradesPage), document.getElementById("root"))

function renderSubjectRow(subject, index) {
    return React.createElement(
        "tr",
        {
            key: subject.id || index,
            className: "subject-row",
        },
        React.createElement("td", { className: "stt" }, subject.stt || index + 1),
        React.createElement("td", { className: "ma-lhp" }, subject.maLhp || ""),
        React.createElement("td", { className: "ten-mon text-left" }, subject.name),
        React.createElement("td", { className: "tin-chi" }, subject.credits),
        React.createElement("td", { className: "diem-giua-ky" }, subject.diemGiuaKy || ""),
        React.createElement("td", { className: "diem-hs1-1" }, ""),
        React.createElement("td", { className: "diem-hs1-2" }, ""),
        React.createElement("td", { className: "diem-hs1-3" }, ""),
        React.createElement("td", { className: "diem-hs1-4" }, ""),
        React.createElement("td", { className: "diem-th-1" }, ""),
        React.createElement("td", { className: "diem-th-2" }, ""),
        React.createElement("td", { className: "diem-th-3" }, ""),
        React.createElement("td", { className: "diem-th-4" }, ""),
        React.createElement("td", { className: "diem-cuoi-ky" }, subject.diemCuoiKy || ""),
        React.createElement(
            "td",
            {
                className: `diem-tong-ket ${subject.grade >= 8.5 ? "excellent" : subject.grade >= 7.0 ? "good" : subject.grade >= 5.5 ? "average" : "poor"
                    }`,
            },
            subject.grade,
        ),
        React.createElement("td", { className: "diem-tin-chi-4" }, ""),
        React.createElement("td", { className: "diem-chu" }, ""),
        React.createElement(
            "td",
            null,
            React.createElement(
                "span",
                {
                    className: `grade-badge ${subject.grade >= 8.5
                            ? "grade-excellent"
                            : subject.grade >= 7.0
                                ? "grade-good"
                                : subject.grade >= 5.5
                                    ? "grade-average"
                                    : "grade-poor"
                        }`,
                },
                subject.grade >= 8.5 ? "Giỏi" : subject.grade >= 7.0 ? "Khá" : subject.grade >= 5.5 ? "Trung bình" : "Yếu",
            ),
        ),
        React.createElement("td", { className: "ghi-chu" }, ""),
    )
}

ReactDOM.render(React.createElement(GradesPage), document.getElementById("root"))