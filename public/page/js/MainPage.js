const { motion, AnimatePresence } = window.Motion || {};
const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } = window.Recharts || {};


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

function App() {
    const [currentPage, setCurrentPage] = React.useState('overview');
    const [key, setKey] = React.useState('');

    React.useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const keyParam = urlParams.get('k');
        if (keyParam) {
            setKey(keyParam);
        }
        
        const path = window.location.pathname;
        if (path.includes('GradesPage.html')) {
            setCurrentPage('grades');
        } else {
            setCurrentPage('overview');
        }
    }, []);

    const navigateTo = (page) => {
        setCurrentPage(page);
        
        const baseUrl = window.location.origin + window.location.pathname.replace('/GradesPage.html', '').replace('/MainPage.html', '');
        const newUrl = page === 'grades' ? 
            `${baseUrl}/GradesPage.html${key ? `?k=${encodeURIComponent(key)}` : ''}` :
            `${baseUrl}/MainPage.html${key ? `?k=${encodeURIComponent(key)}` : ''}`;
        
        window.history.pushState({}, '', newUrl);
    };

    const openStudyPlan = () => {
        const baseUrl = window.location.origin + window.location.pathname.replace('/MainPage.html', '');
        window.location.href = `${baseUrl}/StudyPlanPage.html${key ? `?k=${encodeURIComponent(key)}` : ''}`;
    };

    const renderCurrentPage = () => {
        switch (currentPage) {
            case 'grades':
                return React.createElement(GradesPageContent, { keyValue: key });
            case 'study-plan':
                return React.createElement(StudyPlanPageContent, {keyValue: key});
            case 'overview':
            default:
                return React.createElement(OverviewPageContent);
        }
    };

    const getPageTitle = () => {
        switch (currentPage) {
            case 'grades':
                return 'Xem Điểm';
            case 'study-plan':
                return 'Kế hoạch học tập';
            case 'overview':
            default:
                return 'Tổng quan';
        }
    };

    return React.createElement(LayoutWithNavigation, {
        title: getPageTitle(),
        currentPage: currentPage,
        onNavigate: navigateTo,
        onOpenStudyPlan: openStudyPlan
    }, renderCurrentPage());
}

//Common
//======================================================================================================================================
function LayoutWithNavigation({ children, title, currentPage, onNavigate, onOpenStudyPlan }) {
    return React.createElement('div', { className: 'layout' },
        React.createElement(SidebarWithNavigation, {
            currentPage: currentPage,
            onNavigate: onNavigate,
            onOpenStudyPlan: onOpenStudyPlan
        }),
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
        page: "overview"
    },
    {
        name: "View Learning Results",
        icon: "📚",
        color: "#6366f1", //#8B5CF6
        page: "grades"
    },
    {
        name: "Study Plan",
        icon: "📅",
        color: "#6366f1", //#EC4899
        page: "study-plan"
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

function SidebarWithNavigation({ currentPage, onNavigate, onOpenStudyPlan }) {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
    
    const handleItemClick = (item) => {
        if (item.page === 'study-plan') {
            onNavigate(item.page)
        } else {
            onNavigate(item.page);
        }
    };
    
    return React.createElement(motion.div, {
        className: `sidebar ${isSidebarOpen ? 'open' : 'closed'}`,
        animate: { width: isSidebarOpen ? 250 : 80 }
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
                        className: `sidebar-item ${currentPage === item.page ? 'active' : ''}`,
                        onClick: () => handleItemClick(item),
                        whileHover: { scale: 1.02 },
                        whileTap: { scale: 0.98 },
                        style: currentPage === item.page ? {
                            backgroundColor: `${item.color}20`,
                            borderLeft: `4px solid ${item.color}`,
                            borderRadius: '8px'
                        } : {}
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
                                transition: { duration: 0.2, delay: 0.3 },
                                style: currentPage === item.page ? {
                                    color: item.color,
                                    fontWeight: '600'
                                } : {}
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
                        }, 'Quay lại')
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
                        d: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
                    })
                )
            ),
            React.createElement('h1', { className: 'header-title' }, title)
        )
    );
}

//OverviewContent Logic (GUI)
//=============================================================================================================
const COLORS = ["#6366F1", "#6366F1", "#6366F1", "#6366F1", "#6366F1"];

function SubjectGradeStatistic({ subjects }) {
    const [selectedSemester, setSelectedSemester] = React.useState('all');
    const [selectedScale, setSelectedScale] = React.useState('10'); 
    
    const semesters = React.useMemo(() => {
        const availableSemesters = [...new Set(subjects.map(subject => subject.semester))];
        const semesterOptions = [
            { value: 'all', label: 'Tất cả học kỳ' },
            ...availableSemesters.map(semester => ({
                value: semester,
                label: semester.replace('_', ' ').replace('-', '-')
            }))
        ];
        return semesterOptions;
    }, [subjects]);
    
    const convertGrade = (grade, targetScale) => {
        if (targetScale === '4') {
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
        if (selectedSemester !== 'all') {
            filteredSubjects = subjects.filter(subject => 
                subject.semester === selectedSemester
            );
        }
        
        return filteredSubjects.map(subject => ({
            name: subject.subject,
            value: convertGrade(subject.grade, selectedScale)
        }));
    }, [subjects, selectedSemester, selectedScale]);
    
    const hasData = subjectData.length > 0;
    const selectedSemesterLabel = semesters.find(s => s.value === selectedSemester)?.label || selectedSemester;
    
    const getYAxisDomain = () => {
        return selectedScale === '4' ? [0, 4] : [0, 10];
    };
    
    const getTooltipFormatter = () => {
        const unit = selectedScale === '4' ? 'điểm (thang 4)' : 'điểm (thang 10)';
        return (value) => [`${value} ${unit}`, "Điểm số"];
    };
    
    return React.createElement(motion.div, {
        className: "chart-container",
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { delay: 0.4 }
    },
        React.createElement('div', {
            style: { 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '20px',
                flexWrap: 'wrap',
                gap: '10px'
            }
        },
            React.createElement('h2', { 
                className: "chart-title",
                style: { margin: 0 }
            }, "Thống kê điểm số theo môn học"),
            React.createElement('div', {
                style: { 
                    display: 'flex', 
                    gap: '15px',
                    alignItems: 'center'
                }
            },
                React.createElement('div', {
                    style: { display: 'flex', flexDirection: 'column', gap: '5px' }
                },
                    React.createElement('label', {
                        style: { 
                            fontSize: '12px', 
                            color: '#9CA3AF',
                            fontWeight: '500'
                        }
                    }, "Học kỳ:"),
                    React.createElement('select', {
                        value: selectedSemester,
                        onChange: (e) => setSelectedSemester(e.target.value),
                        style: {
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: '1px solid #4B5563',
                            backgroundColor: '#374151',
                            color: '#E5E7EB',
                            fontSize: '14px',
                            minWidth: '150px'
                        }
                    },
                        semesters.map(semester =>
                            React.createElement('option', {
                                key: semester.value,
                                value: semester.value
                            }, semester.label)
                        )
                    )
                ),
                React.createElement('div', {
                    style: { display: 'flex', flexDirection: 'column', gap: '5px' }
                },
                    React.createElement('label', {
                        style: { 
                            fontSize: '12px', 
                            color: '#9CA3AF',
                            fontWeight: '500'
                        }
                    }, "Thang điểm:"),
                    React.createElement('select', {
                        value: selectedScale,
                        onChange: (e) => setSelectedScale(e.target.value),
                        style: {
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: '1px solid #4B5563',
                            backgroundColor: '#374151',
                            color: '#E5E7EB',
                            fontSize: '14px',
                            minWidth: '100px'
                        }
                    },
                        React.createElement('option', { value: '10' }, "Thang 10"),
                        React.createElement('option', { value: '4' }, "Thang 4")
                    )
                )
            )
        ),
        React.createElement('div', { 
            className: "chart-content",
            style: { height: '320px' }
        },
            hasData ? React.createElement(ResponsiveContainer, null,
                React.createElement(BarChart, { data: subjectData },
                    React.createElement(CartesianGrid, { 
                        strokeDasharray: "3 3", 
                        stroke: "#4B5563" 
                    }),
                    React.createElement(XAxis, { 
                        dataKey: "name", 
                        stroke: "#9CA3AF" 
                    }),
                    React.createElement(YAxis, { 
                        stroke: "#9CA3AF",
                        domain: getYAxisDomain()
                    }),
                    React.createElement(Tooltip, {
                        contentStyle: {
                            backgroundColor: "rgba(31, 41, 55, 0.8)",
                            borderColor: "#4B5563",
                            borderRadius: "8px"
                        },
                        itemStyle: { color: "#E5E7EB" },
                        formatter: getTooltipFormatter()
                    }),
                    React.createElement(Legend),
                    React.createElement(Bar, { 
                        dataKey: "value", 
                        name: `Điểm số (thang ${selectedScale})`
                    },
                        subjectData.map((entry, index) =>
                            React.createElement(Cell, {
                                key: `cell-${index}`,
                                fill: COLORS[index % COLORS.length]
                            })
                        )
                    )
                )
            ) : React.createElement('div', {
                style: {
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    color: '#9CA3AF',
                    textAlign: 'center'
                }
            },
                React.createElement('div', {
                    style: {
                        fontSize: '48px',
                        marginBottom: '16px',
                        opacity: 0.5
                    }
                }, '📊'),
                React.createElement('h3', {
                    style: {
                        fontSize: '18px',
                        marginBottom: '8px',
                        color: '#D1D5DB'
                    }
                }, 'Không có dữ liệu'),
                React.createElement('p', {
                    style: {
                        fontSize: '14px',
                        opacity: 0.8
                    }
                }, selectedSemester === 'all' ? 
                    'Chưa có dữ liệu điểm số nào.' : 
                    `Không có dữ liệu cho ${selectedSemesterLabel}.`
                ),
                selectedSemester !== 'all' && React.createElement('button', {
                    onClick: () => setSelectedSemester('all'),
                    style: {
                        marginTop: '12px',
                        padding: '8px 16px',
                        backgroundColor: '#6366F1',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px'
                    }
                }, 'Xem tất cả học kỳ')
            )
        )
    );
}


function OverviewPageContent() {
    const [loading, setLoading] = React.useState(true);
    const [subjects, setSubjects] = React.useState([]);

    React.useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                setSubjects([
                    { subject: "Lập trình phân tán với Công nghệ Java", grade: 9, semester: "HK1_2022-2023" },
                    { subject: "Hệ thống và Công nghệ Web", grade: 9.5, semester: "HK1_2022-2023" },
                    { subject: "Cơ sở dữ liệu", grade: 8.5, semester: "HK2_2022-2023" },
                    { subject: "Mạng máy tính", grade: 7.5, semester: "HK2_2022-2023" },
                    { subject: "Phát triển ứng dụng Web", grade: 8.0, semester: "HK1_2023-2024" },
                    { subject: "Trí tuệ nhân tạo", grade: 9.2, semester: "HK1_2023-2024" }
                ]);
            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    return React.createElement('div', { className: 'page-content' },
        React.createElement('div', { className: 'card' },
            loading ? React.createElement('div', { className: 'loading' },
                React.createElement('div', { className: 'spinner' }),
                React.createElement('span', { className: 'loading-text' }, 'Đang tải dữ liệu...')
            ) : React.createElement('div', { className: 'dashboard-content' },
                // React.createElement(StatisticsResultsBySemester, {results: results}),

                React.createElement(SubjectGradeStatistic, { subjects: subjects })
            )
        )
    );
}


function GradesPageContent({ keyValue }) {
    const [gradesData, setGradesData] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(false);

    React.useEffect(() => {
        if (keyValue) {
            loadGrades(keyValue);
        }
    }, [keyValue]);

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

    return React.createElement('div', { className: 'page-content' },
        React.createElement('div', { className: 'card' },
            React.createElement('h2', { className: 'card-title' }, 'Kết quả học tập'),
            React.createElement('p', { className: 'key-text' }, `Key: ${keyValue}`),
            
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
    );
}

//StudyPlanPageContent Logic (GUI)
//=============================================================================================================
function StudyPlanPageContent({ keyValue }) {
    const [studyPlanData, setStudyPlanData] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(false);

    React.useEffect(() => {
        if (keyValue) {
            loadStudyPlan(keyValue);
        }
    }, [keyValue]);

    const loadStudyPlan = async (key) => {
        setIsLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            setStudyPlanData({
                semesters: [
                    { id: 1, name: "Học kỳ 1", subjects: [] },
                    { id: 2, name: "Học kỳ 2", subjects: [] }
                ]
            });
        } catch (error) {
            console.error('Error loading study plan:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return React.createElement('div', { className: 'page-content' },
        React.createElement('div', { className: 'card' },
            React.createElement('h2', { className: 'card-title' }, 'Kế hoạch học tập'),
            React.createElement('p', { className: 'key-text' }, `Key: ${keyValue}`),
            
            isLoading ? React.createElement('div', { className: 'loading' },
                React.createElement('div', { className: 'spinner' }),
                React.createElement('span', { className: 'loading-text' }, 'Đang tải dữ liệu...')
            ) : studyPlanData ? React.createElement('div', { className: 'study-plan-content' },
                React.createElement('p', null, 'Kế hoạch học tập')
            ) : React.createElement('div', { className: 'no-data' },
                React.createElement('p', null, 'Không có dữ liệu để hiển thị')
            )
        )
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App));