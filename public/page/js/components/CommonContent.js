/* eslint-disable no-undef */
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

// Navigation
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
        color: "#ffffff",
        page: "overview"
    },
    {
        name: "View Learning Results",
        icon: "📚",
        color: "#ffffff",
        page: "grades"
    },
    {
        name: "Study Plan",
        icon: "📅",
        color: "#ffffff",
        page: "study-plan"
    },
    {
        name: "About Us",
        icon: "ℹ️",
        color: "#ffffff",
        page: "about"
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

// Sidebar
function SidebarWithNavigation({ currentPage, onNavigate, onOpenStudyPlan }) {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

    const handleItemClick = (item) => {
        if (item.page === 'study-plan') {
            onNavigate(item.page)
        } else {
            onNavigate(item.page);
        }
        // setIsSidebarOpen(false);
    };

    return React.createElement(motion.div, {
        className: `sidebar ${isSidebarOpen ? 'open' : 'closed'}`,
        animate: { width: isSidebarOpen ? 225 : 80 }
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
                isSidebarOpen && React.createElement(motion.h2, {
                    className: "sidebar-title fade-in",
                    initial: { opacity: 0, width: 0 },
                    animate: {
                        opacity: isSidebarOpen ? 1 : 0,
                        width: isSidebarOpen ? "auto" : 0
                    },
                    transition: {
                        duration: 0.3,
                        ease: "easeInOut"
                    },
                    style: {
                        overflow: 'hidden',
                        whiteSpace: 'nowrap'
                    }
                }, "IUH Study Tracker")
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
                        isSidebarOpen && React.createElement(motion.span, {
                            className: 'sidebar-item-text fade-in',
                            initial: { opacity: 0, width: 0 },
                            animate: {
                                opacity: isSidebarOpen ? 1 : 0,
                                width: isSidebarOpen ? "auto" : 0
                            },
                            transition: {
                                duration: 0.3,
                                ease: "easeInOut"
                            },
                            style: {
                                overflow: 'hidden',
                                whiteSpace: 'nowrap',
                                ...(currentPage === item.page ? {
                                    color: item.color,
                                    fontWeight: '600'
                                } : {})
                            }
                        }, item.name)
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
                    isSidebarOpen && React.createElement(motion.span, {
                        className: 'back-button-text fade-in',
                        initial: { opacity: 0, width: 0 },
                        animate: {
                            opacity: isSidebarOpen ? 1 : 0,
                            width: isSidebarOpen ? "auto" : 0
                        },
                        transition: {
                            duration: 0.3,
                            ease: "easeInOut"
                        },
                        style: {
                            overflow: 'hidden',
                            whiteSpace: 'nowrap'
                        }
                    }, 'Thoát')
                )
            )
        )
    );
}

// Header Component
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

window.LayoutWithNavigation = LayoutWithNavigation;
window.Layout = Layout;
window.Header = Header;
window.SidebarWithNavigation = SidebarWithNavigation;
window.MenuIcon = MenuIcon;
window.SIDEBAR_ITEMS = SIDEBAR_ITEMS;
