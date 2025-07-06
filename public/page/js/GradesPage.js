// Remove ES6 imports since we're using script tags
// Use global variables instead
const { motion, AnimatePresence } = window.Motion || {};

function Layout({ children, title }) {
    return React.createElement('div', { className: 'layout' },
        React.createElement(Sidebar),
        React.createElement('div', { className: 'main-content' },
            React.createElement(Header, { title: title }),
            React.createElement('div', { className: 'content-area hide-scrollbar' },
                children
            )
        )
    );
}

const SIDEBAR_ITEMS = [
    {
        name: "Overview",
        icon: "📊",
        color: "#6366f1",
        href: "/overview",
        onClick: () => console.log("Overview clicked")
    },
    {
        name: "View Learning Results",
        icon: "📚",
        color: "#8B5CF6",
        href: "/courses",
        onClick: () => console.log("View Learning Results clicked")
    },
    {
        name: "Study Plan",
        icon: "📅",
        color: "#EC4899",
        href: "/users",
        onClick: () => {
            const key = new URLSearchParams(window.location.search).get('k');
            if (key) {
                window.open(`https://sv.iuh.edu.vn/tra-cuu/lich-hoc-theo-tuan.html?k=${encodeURIComponent(key)}`, '_blank');
            }
        }
    }
];

function MenuIcon({ size = 24 }) {
    return React.createElement('svg', {
        width: size,
        height: size,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2"
    },
        React.createElement('line', { x1: "3", y1: "6", x2: "21", y2: "6" }),
        React.createElement('line', { x1: "3", y1: "12", x2: "21", y2: "12" }),
        React.createElement('line', { x1: "3", y1: "18", x2: "21", y2: "18" })
    );
}

function Sidebar() {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
    
    return React.createElement(motion.div, {
        className: `sidebar ${isSidebarOpen ? 'open' : 'closed'}`,
        animate: { width: isSidebarOpen ? 220 : 80 }
    },
        React.createElement('div', { className: 'sidebar-content' },
            React.createElement('div', { className: 'sidebar-header' },
                React.createElement(motion.button, {
                    whileHover: { scale: 1.1 },
                    whileTap: { scale: 0.9 },
                    onClick: () => setIsSidebarOpen(!isSidebarOpen),
                    className: 'menu-button'
                },
                    React.createElement(MenuIcon, { size: 24 })
                ),
                React.createElement(AnimatePresence, null,
                    isSidebarOpen && React.createElement(motion.h2, {
                        className: "sidebar-title fade-in",
                        initial: { opacity: 0, width: 0 },
                        animate: { opacity: 1, width: "auto" },
                        exit: { opacity: 0, width: 0 },
                        transition: { duration: 0.2, delay: 0.3 }
                    }, "IUH Study Tracker")
                )
            ),
            React.createElement('nav', { className: 'sidebar-nav' },
                SIDEBAR_ITEMS.map((item, index) =>
                    React.createElement(motion.div, {
                        key: index,
                        className: 'sidebar-item',
                        onClick: item.onClick,
                        whileHover: { scale: 1.02 },
                        whileTap: { scale: 0.98 }
                    },
                        React.createElement('span', {
                            className: "sidebar-item-icon",
                            style: { color: item.color }
                        }, item.icon),
                        React.createElement(AnimatePresence, null,
                            isSidebarOpen && React.createElement(motion.span, {
                                className: 'sidebar-item-text fade-in',
                                initial: { opacity: 0, width: 0 },
                                animate: { opacity: 1, width: "auto" },
                                exit: { opacity: 0, width: 0 },
                                transition: { duration: 0.2, delay: 0.3 }
                            }, item.name)
                        )
                    )
                )
            ),
            React.createElement('div', { className: 'sidebar-footer' },
                React.createElement(motion.button, {
                    onClick: () => window.close(),
                    className: 'back-button',
                    whileHover: { scale: 1.02 },
                    whileTap: { scale: 0.98 }
                },
                    React.createElement('span', { className: 'back-button-icon' }, '←'),
                    React.createElement(AnimatePresence, null,
                        isSidebarOpen && React.createElement(motion.span, {
                            className: 'back-button-text fade-in',
                            initial: { opacity: 0, width: 0 },
                            animate: { opacity: 1, width: "auto" },
                            exit: { opacity: 0, width: 0 },
                            transition: { duration: 0.2, delay: 0.3 }
                        }, 'Quay lại Extension')
                    )
                )
            )
        )
    );
}

function Header({ title }) {
    return React.createElement('header', { className: 'header' },
        React.createElement('div', { className: 'header-content' },
            React.createElement('div', { className: 'header-icon' },
                React.createElement('svg', {
                    className: 'header-icon svg',
                    fill: 'none',
                    stroke: 'currentColor',
                    viewBox: '0 0 24 24'
                },
                    React.createElement('path', {
                        strokeLinecap: 'round',
                        strokeLinejoin: 'round',
                        strokeWidth: 2,
                        d: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
                    })
                )
            ),
            React.createElement('h1', { className: 'header-title' }, title)
        )
    );
}

function GradesPage() {
    const [key, setKey] = React.useState('');
    const [gradesData, setGradesData] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(false);

    React.useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const keyParam = urlParams.get('k');
        if (keyParam) {
            setKey(keyParam);
            loadGrades(keyParam);
        }
    }, []);

    const loadGrades = async (key) => {
        setIsLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            setGradesData({
                studentInfo: {
                    name: "Họ tên",
                    studentId: "21000000",
                    class: "DHKTPM18A"
                },
                subjects: [
                    { id: 1, name: "Lập trình Java", grade: 8.5, credits: 3 },
                    { id: 2, name: "Cơ sở dữ liệu", grade: 9.0, credits: 3 },
                    { id: 3, name: "Mạng máy tính", grade: 10, credits: 2 }
                ]
            });
        } catch (error) {
            console.error('Error loading grades:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return React.createElement(Layout, { title: "Xem Điểm" },
        React.createElement('div', { className: 'page-content' },
            React.createElement('div', { className: 'card' },
                React.createElement('h2', { className: 'card-title' }, 'Kết quả học tập'),
                // React.createElement('p', { className: 'key-text' }, `Key: ${key}`),
                
                isLoading ? React.createElement('div', { className: 'loading' },
                    React.createElement('div', { className: 'spinner' }),
                    React.createElement('span', { className: 'loading-text' }, 'Đang tải dữ liệu...')
                ) : gradesData ? React.createElement('div', { className: 'info-section' },
                    React.createElement('div', { className: 'info-card' },
                        React.createElement('h3', { className: 'info-card-title' }, 'Thông tin sinh viên'),
                        React.createElement('div', { className: 'info-grid' },
                            React.createElement('div', { className: 'info-item' },
                                React.createElement('span', { className: 'info-label' }, 'Họ tên:'),
                                React.createElement('span', { className: 'info-value' }, gradesData.studentInfo.name)
                            ),
                            React.createElement('div', { className: 'info-item' },
                                React.createElement('span', { className: 'info-label' }, 'MSSV:'),
                                React.createElement('span', { className: 'info-value' }, gradesData.studentInfo.studentId)
                            ),
                            React.createElement('div', { className: 'info-item' },
                                React.createElement('span', { className: 'info-label' }, 'Lớp:'),
                                React.createElement('span', { className: 'info-value' }, gradesData.studentInfo.class)
                            )
                        )
                    ),
                    React.createElement('div', { className: 'info-card' },
                        React.createElement('h3', { className: 'info-card-title' }, 'Bảng điểm'),
                        React.createElement('div', { className: 'table-container' },
                            React.createElement('table', { className: 'grades-table' },
                                React.createElement('thead', null,
                                    React.createElement('tr', null,
                                        React.createElement('th', null, 'Môn học'),
                                        React.createElement('th', null, 'Tín chỉ'),
                                        React.createElement('th', null, 'Điểm'),
                                        React.createElement('th', null, 'Xếp loại')
                                    )
                                ),
                                React.createElement('tbody', null,
                                    gradesData.subjects.map((subject) =>
                                        React.createElement('tr', { key: subject.id },
                                            React.createElement('td', null, subject.name),
                                            React.createElement('td', null, subject.credits),
                                            React.createElement('td', { className: 'grade-value' }, subject.grade),
                                            React.createElement('td', null,
                                                React.createElement('span', {
                                                    className: `grade-badge ${
                                                        subject.grade >= 8.5 ? 'grade-excellent' :
                                                        subject.grade >= 7.0 ? 'grade-good' :
                                                        subject.grade >= 5.5 ? 'grade-average' :
                                                        'grade-poor'
                                                    }`
                                                },
                                                    subject.grade >= 8.5 ? 'Giỏi' :
                                                    subject.grade >= 7.0 ? 'Khá' :
                                                    subject.grade >= 5.5 ? 'Trung bình' : 'Yếu'
                                                )
                                            )
                                        )
                                    )
                                )
                            )
                        )
                    )
                ) : React.createElement('div', { className: 'no-data' },
                    React.createElement('p', null, 'Không có dữ liệu để hiển thị')
                )
            )
        )
    );
}

ReactDOM.render(React.createElement(GradesPage), document.getElementById('root'));


