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
        onClick: () => {
            const key = new URLSearchParams(window.location.search).get('k');
            const baseUrl = window.location.origin + window.location.pathname.replace('/StudyPlanPage.html', '');
            window.location.href = `${baseUrl}/MainPage.html${key ? `?k=${encodeURIComponent(key)}` : ''}`;
        }
    },
    {
        name: "View Learning Results",
        icon: "📚",
        color: "#8B5CF6",
        onClick: () => {
            const key = new URLSearchParams(window.location.search).get('k');
            const baseUrl = window.location.origin + window.location.pathname.replace('/StudyPlanPage.html', '');
            window.location.href = `${baseUrl}/GradesPage.html${key ? `?k=${encodeURIComponent(key)}` : ''}`;
        }
    },
    {
        name: "Study Plan",
        icon: "📅",
        color: "#EC4899",
        onClick: () => {
            const key = new URLSearchParams(window.location.search).get('k');
            const baseUrl = window.location.origin + window.location.pathname.replace('/GradesPage.html', '');
            window.location.href = `${baseUrl}/StudyPlanPage.html${key ? `?k=${encodeURIComponent(key)}` : ''}`;
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
        animate: { width: isSidebarOpen ? 230 : 80 }
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
                        className: `sidebar-item ${item.name === 'Study Plan' ? 'active' : ''}`,
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
                        }, 'Thoát')
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
                        d: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                    })
                )
            ),
            React.createElement('h1', { className: 'header-title' }, title)
        )
    );
}

function StudyPlanPage() {
    const [key, setKey] = React.useState('');
    const [studyPlanData, setStudyPlanData] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [selectedWeek, setSelectedWeek] = React.useState(1);

    React.useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const keyParam = urlParams.get('k');
        if (keyParam) {
            setKey(keyParam);
            loadStudyPlan(keyParam);
        }
    }, []);

    const loadStudyPlan = async (key) => {
        setIsLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            setStudyPlanData({
                studentInfo: {
                    name: "Nguyễn Văn A",
                    studentId: "21000000",
                    class: "DHKTPM18A"
                },
                weeks: [
                    {
                        week: 1,
                        startDate: "2024-01-08",
                        endDate: "2024-01-14",
                        subjects: [
                            {
                                id: 1,
                                name: "Lập trình phân tán với Công nghệ Java",
                                time: "07:00 - 09:00",
                                day: "Thứ 2",
                                room: "A1.101",
                                teacher: "GV. Nguyễn Văn B"
                            },
                            {
                                id: 2,
                                name: "Hệ thống và Công nghệ Web",
                                time: "09:00 - 11:00",
                                day: "Thứ 3",
                                room: "B2.205",
                                teacher: "GV. Trần Thị C"
                            },
                            {
                                id: 3,
                                name: "Phát triển ứng dụng di động",
                                time: "13:00 - 15:00",
                                day: "Thứ 4",
                                room: "C3.301",
                                teacher: "GV. Lê Văn D"
                            }
                        ]
                    },
                    {
                        week: 2,
                        startDate: "2024-01-15",
                        endDate: "2024-01-21",
                        subjects: [
                            {
                                id: 4,
                                name: "Lập trình phân tán với Công nghệ Java",
                                time: "07:00 - 09:00",
                                day: "Thứ 2",
                                room: "A1.101",
                                teacher: "GV. Nguyễn Văn B"
                            },
                            {
                                id: 5,
                                name: "Hệ thống và Công nghệ Web",
                                time: "09:00 - 11:00",
                                day: "Thứ 3",
                                room: "B2.205",
                                teacher: "GV. Trần Thị C"
                            }
                        ]
                    }
                ]
            });
        } catch (error) {
            console.error('Error loading study plan:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const openExternalStudyPlan = () => {
        if (key) {
            window.open(`https://sv.iuh.edu.vn/tra-cuu/lich-hoc-theo-tuan.html?k=${encodeURIComponent(key)}`, '_blank');
        }
    };

    const currentWeekData = studyPlanData?.weeks.find(week => week.week === selectedWeek);

    return React.createElement(Layout, { title: "Kế hoạch học tập" },
        React.createElement('div', { className: 'page-content' },
            React.createElement('div', { className: 'card' },
                React.createElement('div', { className: 'card-header' },
                    React.createElement('h2', { className: 'card-title' }, 'Lịch học theo tuần'),
                    React.createElement('button', {
                        className: 'external-link-button',
                        onClick: openExternalStudyPlan,
                        title: 'Xem trên trang chính thức'
                    }, '🔗 Xem trên trang chính thức')
                ),
                React.createElement('p', { className: 'key-text' }, `Key: ${key}`),
                
                isLoading ? React.createElement('div', { className: 'loading' },
                    React.createElement('div', { className: 'spinner' }),
                    React.createElement('span', { className: 'loading-text' }, 'Đang tải dữ liệu...')
                ) : studyPlanData ? React.createElement('div', { className: 'study-plan-content' },
                    React.createElement('div', { className: 'info-card' },
                        React.createElement('h3', { className: 'info-card-title' }, 'Thông tin sinh viên'),
                        React.createElement('div', { className: 'info-grid' },
                            React.createElement('div', { className: 'info-item' },
                                React.createElement('span', { className: 'info-label' }, 'Họ tên:'),
                                React.createElement('span', { className: 'info-value' }, studyPlanData.studentInfo.name)
                            ),
                            React.createElement('div', { className: 'info-item' },
                                React.createElement('span', { className: 'info-label' }, 'MSSV:'),
                                React.createElement('span', { className: 'info-value' }, studyPlanData.studentInfo.studentId)
                            ),
                            React.createElement('div', { className: 'info-item' },
                                React.createElement('span', { className: 'info-label' }, 'Lớp:'),
                                React.createElement('span', { className: 'info-value' }, studyPlanData.studentInfo.class)
                            )
                        )
                    ),
                    React.createElement('div', { className: 'week-selector' },
                        React.createElement('h3', { style: { marginBottom: '10px' } }, 'Chọn tuần:'),
                        React.createElement('div', { className: 'week-buttons' },
                            studyPlanData.weeks.map(week =>
                                React.createElement('button', {
                                    key: week.week,
                                    className: `week-button ${selectedWeek === week.week ? 'active' : ''}`,
                                    onClick: () => setSelectedWeek(week.week)
                                }, `Tuần ${week.week}`)
                            )
                        )
                    ),
                    currentWeekData && React.createElement('div', { className: 'week-schedule' },
                        React.createElement('h3', { className: 'week-title' }, 
                            `Tuần ${currentWeekData.week} (${currentWeekData.startDate} - ${currentWeekData.endDate})`
                        ),
                        React.createElement('div', { className: 'schedule-grid' },
                            currentWeekData.subjects.map(subject =>
                                React.createElement('div', { key: subject.id, className: 'schedule-item' },
                                    React.createElement('div', { className: 'schedule-day' }, subject.day),
                                    React.createElement('div', { className: 'schedule-time' }, subject.time),
                                    React.createElement('div', { className: 'schedule-subject' }, subject.name),
                                    React.createElement('div', { className: 'schedule-room' }, subject.room),
                                    React.createElement('div', { className: 'schedule-teacher' }, subject.teacher)
                                )
                            )
                        )
                    )
                ) : React.createElement('div', { className: 'no-data' },
                    React.createElement('p', null, 'Không có dữ liệu để hiển thị'),
                    React.createElement('button', {
                        className: 'external-link-button',
                        onClick: openExternalStudyPlan,
                        style: { marginTop: '10px' }
                    }, 'Xem trên trang chính thức')
                )
            )
        )
    );
}

ReactDOM.render(React.createElement(StudyPlanPage), document.getElementById('root'));
