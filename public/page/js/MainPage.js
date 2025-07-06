const { motion, AnimatePresence } = window.Motion || {};
const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } = window.Recharts || {};

console.log("Có chạy!!!")
console.log('Window.Recharts:', window.Recharts);
console.log('Window.Motion:', window.Motion);
console.log('React:', typeof React);
console.log('ReactDOM:', typeof ReactDOM);
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
        onClick: () => {
            const key = new URLSearchParams(window.location.search).get('k');
            const baseUrl = window.location.origin + window.location.pathname.replace('/MainPage.html', '');
            window.location.href = `${baseUrl}/MainPage.html${key ? `?k=${encodeURIComponent(key)}` : ''}`;
        }
    },
    {
        name: "View Learning Results",
        icon: "📚",
        color: "#8B5CF6",
        href: "/courses",
        onClick: () => {
            const key = new URLSearchParams(window.location.search).get('k');
            const baseUrl = window.location.origin + window.location.pathname.replace('/MainPage.html', '');
            window.location.href = `${baseUrl}/GradesPage.html${key ? `?k=${encodeURIComponent(key)}` : ''}`;
        }
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
                        d: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
                    })
                )
            ),
            React.createElement('h1', { className: 'header-title' }, title)
        )
    );
}

const COLORS = ["#6366F1", "#8B5CF6", "#EC4899", "#10B981", "#F59E0B"];

function ColUserNewStatistic({ users }) {
    const monthlyUserData = React.useMemo(() => {
        if (!users || users.length === 0) {
            return [];
        }
        
        const monthCounts = {};
        const months = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", 
                        "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", 
                        "Tháng 11", "Tháng 12"];
        
        months.forEach(month => {
            monthCounts[month] = 0;
        });
        
        users.forEach(user => {
            const createdAt = new Date(user.createdAt);
            const monthIndex = createdAt.getMonth(); 
            const monthName = months[monthIndex];
            monthCounts[monthName]++;
        });
      
        return Object.keys(monthCounts)
            .filter(month => monthCounts[month] > 0)
            .map(month => ({
                name: month,
                value: monthCounts[month]
            }));
    }, [users]);
    
    return React.createElement('div', {
        className: "chart-container"
    },
        React.createElement('h2', { 
            className: "chart-title" 
        }, "Thống kê người dùng mới"),
        React.createElement('div', { className: "chart-content" },
            React.createElement('div', { className: "simple-chart" },
                monthlyUserData.map((item, index) =>
                    React.createElement('div', {
                        key: index,
                        className: "chart-bar",
                        style: { 
                            height: `${(item.value / Math.max(...monthlyUserData.map(d => d.value))) * 200}px`,
                            backgroundColor: COLORS[index % COLORS.length]
                        }
                    },
                        React.createElement('div', { className: "chart-bar-label" }, item.name),
                        React.createElement('div', { className: "chart-bar-value" }, item.value)
                    )
                )
            )
        )
    );
}

function MainPage() {
    const [loading, setLoading] = React.useState(true);
    const [users, setUsers] = React.useState([]);

    React.useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Sample data
                setUsers([
                    { id: 1, createdAt: "2024-01-15" },
                    { id: 2, createdAt: "2024-02-20" },
                    { id: 3, createdAt: "2024-03-10" },
                    { id: 4, createdAt: "2024-03-25" },
                    { id: 5, createdAt: "2024-04-05" },
                    { id: 6, createdAt: "2024-04-15" },
                    { id: 7, createdAt: "2024-05-01" },
                    { id: 8, createdAt: "2024-05-20" },
                    { id: 9, createdAt: "2024-06-10" },
                    { id: 10, createdAt: "2024-07-05" }
                ]);
            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    return React.createElement(Layout, { title: "Tổng quan" },
        React.createElement('div', { className: 'page-content' },
            React.createElement('div', { className: 'card' },
                loading ? React.createElement('div', { className: 'loading' },
                    React.createElement('div', { className: 'spinner' }),
                    React.createElement('span', { className: 'loading-text' }, 'Đang tải dữ liệu...')
                ) : React.createElement('div', { className: 'dashboard-content' },
                    React.createElement(ColUserNewStatistic, { users: users })
                )
            )
        )
    );
}

ReactDOM.render(React.createElement(MainPage), document.getElementById('root'));
