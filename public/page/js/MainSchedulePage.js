/* eslint-disable */
const { motion, AnimatePresence } = window.Motion || {};

function mapTietToTime(t) {
    const m = {
        1: '06:30',
        2: '07:20',
        3: '08:10',
        4: '09:10',
        5: '10:00',
        6: '10:50',
        7: '12:30',
        8: '13:20',
        9: '14:10',
        10: '15:10',
        11: '16:00',
        12: '16:50',
        13: '18:00',
        14: '18:50',
        15: '19:30',
        16: '20:20',
    };
    return m[t] || '';
}

function splitSchedule(rows = []) {
    return rows.reduce(
        (acc, r) => {
            const isExam =
                typeof r.supervisor === 'string' && r.supervisor.includes(',');
            (isExam ? acc.exams : acc.classes).push(r);
            return acc;
        },
        { classes: [], exams: [] },
    );
}

function getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const firstMonday = new Date(firstDayOfYear);
    while (firstMonday.getDay() !== 1) {
        firstMonday.setDate(firstMonday.getDate() + 1);
    }
    const diff = (date - firstMonday) / (1000 * 60 * 60 * 24);
    return Math.ceil(diff / 7);
}

function getWeekDates(weekNumber, year) {
    const firstDayOfYear = new Date(year, 0, 1);
    const firstMonday = new Date(firstDayOfYear);
    while (firstMonday.getDay() !== 1) {
        firstMonday.setDate(firstMonday.getDate() + 1);
    }
    const startOfWeek = new Date(firstMonday);
    startOfWeek.setDate(firstMonday.getDate() + (weekNumber - 1) * 7);

    const days = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(
            date.getMonth() + 1
        )
            .toString()
            .padStart(2, '0')}/${date.getFullYear()}`;
        days.push({
            date: formattedDate,
            dayName: [
                'Chủ Nhật',
                'Thứ Hai',
                'Thứ Ba',
                'Thứ Tư',
                'Thứ Năm',
                'Thứ Sáu',
                'Thứ Bảy',
            ][date.getDay()],
        });
    }
    return { days, year };
}

// App Component
function App() {
    const [currentPage, setCurrentPage] = React.useState('schedule');
    const [key, setKey] = React.useState('');
    const [scheduleData, setScheduleData] = React.useState({
        classes: [],
        exams: [],
    });
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const keyParam = urlParams.get('k');
        if (keyParam) {
            setKey(keyParam);
            localStorage.setItem('iuh-tracker-key', keyParam);
        }
        setCurrentPage('schedule');

        const sampleData = [
            {
                id: 1,
                subject: 'Toán Cao Cấp',
                supervisor: 'Nguyễn Văn A',
                date: '14/07/2025',
                startTime: '07:20',
                endTime: '09:00',
                room: 'A101',
                className: 'CS101',
                classCode: 'C01',
                lesson: '1-2',
            },

            {
                id: 2,
                subject: 'Thi Vật Lý',
                supervisor: 'Nguyễn Văn B,Trần Thị C',
                date: '15/07/2025',
                startTime: '13:30',
                endTime: '15:30',
                room: 'B202',
            },

            {
                id: 3,
                subject: 'Lập Trình Java',
                supervisor: 'Lê Thị D',
                date: '16/07/2025',
                startTime: '18:30',
                endTime: '20:10',
                room: 'C303',
                className: 'IT202',
                classCode: 'C02',
                lesson: '13-14',
            },

            {
                id: 4,
                subject: 'Thi Hóa Học',
                supervisor: 'Phạm Văn E,Ngô Thị F',
                date: '17/07/2025',
                startTime: '08:10',
                endTime: '10:10',
                room: 'D404',
            },

            {
                id: 5,
                subject: 'Cơ Sở Dữ Liệu',
                supervisor: 'Trần Văn G',
                date: '18/07/2025',
                startTime: '14:20',
                endTime: '16:00',
                room: 'E505',
                className: 'DB101',
                classCode: 'C03',
                lesson: '8-9',
            },

            {
                id: 6,
                subject: 'Thi Tiếng Anh',
                supervisor: 'Hoàng Văn H,Lê Thị I',
                date: '19/07/2025',
                startTime: '19:20',
                endTime: '21:00',
                room: 'F606',
            },

            {
                id: 7,
                subject: 'Kỹ Thuật Phần Mềm',
                supervisor: 'Nguyễn Thị K',
                date: '20/07/2025',
                startTime: '09:50',
                endTime: '11:30',
                room: 'G707',
                className: 'SE301',
                classCode: 'C04',
                lesson: '5-6',
            },
        ];

        // Process sample data
        try {
            console.log('Sample scheduleData:', sampleData);
            const splitData = splitSchedule(sampleData);
            console.log('Split data:', splitData);
            setScheduleData(splitData);
        } catch (error) {
            console.error('Lỗi khi xử lý sampleData:', error);
        }
        setIsLoading(false);
    }, []);

    const navigateTo = (page) => {
        setCurrentPage(page);
    };

    const getPageTitle = () => {
        return currentPage === 'exam-schedule' ? 'Lịch Thi' : 'Lịch Học';
    };

    const renderCurrentPage = () => {
        return currentPage === 'exam-schedule'
            ? React.createElement(ExamSchedulePageContent, {
                  data: scheduleData.exams,
                  keyValue: key,
              })
            : React.createElement(SchedulePageContent, {
                  data: scheduleData.classes,
              });
    };

    return React.createElement(
        LayoutWithNavigation,
        {
            title: getPageTitle(),
            currentPage: currentPage,
            onNavigate: navigateTo,
        },
        isLoading
            ? React.createElement(
                  'div',
                  { className: 'loading-container' },
                  React.createElement('div', { className: 'spinner' }),
                  React.createElement(
                      'span',
                      { className: 'loading-text' },
                      'Đang tải dữ liệu...',
                  ),
              )
            : renderCurrentPage(),
    );
}

// Layout Components
function LayoutWithNavigation(props) {
    return React.createElement(
        'div',
        { className: 'layout' },
        React.createElement(SidebarWithNavigation, {
            currentPage: props.currentPage,
            onNavigate: props.onNavigate,
        }),
        React.createElement(
            'div',
            { className: 'main-content' },
            React.createElement(Header, { title: props.title }),
            React.createElement(
                'div',
                { className: 'content-area hide-scrollbar' },
                props.children,
            ),
        ),
    );
}

const SIDEBAR_ITEMS = [
    { name: 'Lịch Học', icon: '📅', color: '#EC4899', page: 'schedule' },
    { name: 'Lịch Thi', icon: '📝', color: '#F59E0B', page: 'exam-schedule' },
];

function MenuIcon(props) {
    return React.createElement(
        'svg',
        {
            width: props.size || 24,
            height: props.size || 24,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: 'currentColor',
            strokeWidth: '2',
        },
        React.createElement('line', { x1: '3', y1: '6', x2: '21', y2: '6' }),
        React.createElement('line', { x1: '3', y1: '12', x2: '21', y2: '12' }),
        React.createElement('line', { x1: '3', y1: '18', x2: '21', y2: '18' }),
    );
}

function SidebarWithNavigation(props) {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

    return React.createElement(
        motion.div,
        {
            className: `sidebar ${isSidebarOpen ? 'open' : 'closed'}`,
            animate: { width: isSidebarOpen ? 250 : 80 },
            transition: { duration: 0.3 },
        },
        React.createElement(
            'div',
            { className: 'sidebar-content' },
            React.createElement(
                'div',
                { className: 'sidebar-header' },
                React.createElement(
                    motion.button,
                    {
                        whileHover: { scale: 1.1 },
                        whileTap: { scale: 0.9 },
                        onClick: () => setIsSidebarOpen(!isSidebarOpen),
                        className: 'menu-button',
                    },
                    React.createElement(MenuIcon, { size: 24 }),
                ),
                React.createElement(
                    AnimatePresence,
                    null,
                    isSidebarOpen &&
                        React.createElement(
                            motion.h2,
                            {
                                className: 'sidebar-title fade-in',
                                initial: { opacity: 0, width: 0 },
                                animate: { opacity: 1, width: 'auto' },
                                exit: { opacity: 0, width: 0 },
                                transition: { duration: 0.2, delay: 0.3 },
                            },
                            'IUH Study Tracker',
                        ),
                ),
            ),
            React.createElement(
                'nav',
                { className: 'sidebar-nav' },
                SIDEBAR_ITEMS.map((item, index) =>
                    React.createElement(
                        motion.div,
                        {
                            key: index,
                            className: `sidebar-item ${
                                props.currentPage === item.page ? 'active' : ''
                            }`,
                            onClick: () => props.onNavigate(item.page),
                            whileHover: { scale: 1.02 },
                            whileTap: { scale: 0.98 },
                        },
                        React.createElement(
                            'span',
                            {
                                className: 'sidebar-item-icon',
                                style: { color: item.color },
                            },
                            item.icon,
                        ),
                        React.createElement(
                            AnimatePresence,
                            null,
                            isSidebarOpen &&
                                React.createElement(
                                    motion.span,
                                    {
                                        className: 'sidebar-item-text fade-in',
                                        initial: { opacity: 0, width: 0 },
                                        animate: { opacity: 1, width: 'auto' },
                                        exit: { opacity: 0, width: 0 },
                                        transition: {
                                            duration: 0.2,
                                            delay: 0.3,
                                        },
                                        style:
                                            props.currentPage === item.page
                                                ? {
                                                      color: item.color,
                                                      fontWeight: '600',
                                                  }
                                                : {},
                                    },
                                    item.name,
                                ),
                        ),
                    ),
                ),
            ),
            React.createElement(
                'div',
                { className: 'sidebar-footer' },
                React.createElement(
                    motion.button,
                    {
                        onClick: () => window.close(),
                        className: 'back-button',
                        whileHover: { scale: 1.02 },
                        whileTap: { scale: 0.98 },
                    },
                    React.createElement(
                        'span',
                        { className: 'back-button-icon' },
                        '←',
                    ),
                    React.createElement(
                        AnimatePresence,
                        null,
                        isSidebarOpen &&
                            React.createElement(
                                motion.span,
                                {
                                    className: 'back-button-text fade-in',
                                    initial: { opacity: 0, width: 0 },
                                    animate: { opacity: 1, width: 'auto' },
                                    exit: { opacity: 0, width: 0 },
                                    transition: { duration: 0.2, delay: 0.3 },
                                },
                                'Quay lại',
                            ),
                    ),
                ),
            ),
        ),
    );
}

function Header(props) {
    return React.createElement(
        'header',
        { className: 'header' },
        React.createElement(
            'div',
            { className: 'header-content' },
            React.createElement(
                'div',
                { className: 'header-icon' },
                React.createElement(
                    'svg',
                    {
                        fill: 'none',
                        stroke: 'currentColor',
                        viewBox: '0 0 24 24',
                    },
                    React.createElement('path', {
                        strokeLinecap: 'round',
                        strokeLinejoin: 'round',
                        strokeWidth: 2,
                        d: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
                    }),
                ),
            ),
            React.createElement(
                'h1',
                { className: 'header-title' },
                props.title,
            ),
        ),
    );
}

function ChevronLeftIcon(props) {
    return React.createElement(
        'svg',
        {
            width: props.size || 20,
            height: props.size || 20,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: 'currentColor',
            strokeWidth: '2',
        },
        React.createElement('polyline', { points: '15,18 9,12 15,6' }),
    );
}

function ChevronRightIcon(props) {
    return React.createElement(
        'svg',
        {
            width: props.size || 20,
            height: props.size || 20,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: 'currentColor',
            strokeWidth: '2',
        },
        React.createElement('polyline', { points: '9,18 15,12 9,6' }),
    );
}

function WeekNavigation(props) {
    return React.createElement(
        'div',
        { className: 'week-navigation' },
        React.createElement(
            motion.button,
            {
                className: 'nav-button',
                onClick: () => props.onWeekChange('prev'),
                whileHover: { scale: 1.05 },
                whileTap: { scale: 0.95 },
            },
            React.createElement(ChevronLeftIcon, { size: 20 }),
            React.createElement('span', null, 'Tuần trước'),
        ),
        React.createElement(
            'div',
            { className: 'current-week' },
            React.createElement('h2', null, 'Tuần'),
            React.createElement(
                'p',
                null,
                `Tháng ${props.currentMonth}, ${props.currentYear}`,
            ),
        ),
        React.createElement(
            motion.button,
            {
                className: 'nav-button',
                onClick: () => props.onWeekChange('next'),
                whileHover: { scale: 1.05 },
                whileTap: { scale: 0.95 },
            },
            React.createElement('span', null, 'Tuần sau'),
            React.createElement(ChevronRightIcon, { size: 20 }),
        ),
    );
}

function Item(props) {
    return React.createElement(
        motion.div,
        {
            className: `class-item ${props.isExam ? 'exam-item' : ''}`,
            style: {
                borderLeft: `3px solid ${props.isExam ? '#f59e0b' : '#3b82f6'}`,
            },
            whileHover: { scale: 1.02 },
            transition: { duration: 0.2 },
        },
        React.createElement(
            'div',
            { className: 'class-subject' },
            props.item.subject || 'Không xác định',
        ),
        React.createElement(
            'div',
            { className: 'class-time' },
            props.isExam
                ? `${props.item.startTime || 'N/A'} - ${
                      props.item.endTime || 'N/A'
                  }`
                : `${props.item.className || ''} - ${
                      props.item.classCode || ''
                  }`,
        ),
        React.createElement(
            'div',
            { className: 'class-room' },
            props.isExam
                ? `Phòng ${props.item.room || 'N/A'}`
                : `Tiết ${props.item.lesson || 'N/A'}`,
        ),
        !props.isExam &&
            React.createElement(
                'div',
                { className: 'class-time' },
                `${props.item.startTime || 'N/A'} - ${
                    props.item.endTime || 'N/A'
                }`,
            ),
        React.createElement(
            'div',
            { className: 'class-room' },
            `Phòng ${props.item.room || 'N/A'}`,
        ),
        React.createElement(
            'div',
            { className: 'class-teacher' },
            `GV ${props.item.supervisor || 'Không xác định'}`,
        ),
    );
}

function TimeSlotCell(props) {
    const filteredItems = props.items.filter((item) => {
        const startHour = item.startTime
            ? parseInt(item.startTime.split(':')[0])
            : 0;
        switch (props.timeSlot) {
            case 'morning':
                return startHour >= 6 && startHour < 12;
            case 'afternoon':
                return startHour >= 12 && startHour < 18;
            case 'evening':
                return startHour >= 18;
            default:
                return false;
        }
    });

    return React.createElement(
        'td',
        { className: 'time-slot-cell' },
        filteredItems.length > 0
            ? filteredItems.map((item) =>
                  React.createElement(Item, {
                      key: item.id || Math.random(),
                      item: item,
                      isExam: props.isExam,
                  }),
              )
            : null,
    );
}

function ScheduleTable(props) {
    const timeSlots = [
        { key: 'morning', label: 'Sáng' },
        { key: 'afternoon', label: 'Chiều' },
        { key: 'evening', label: 'Tối' },
    ];

    const { days, year } = getWeekDates(props.currentWeek, props.currentYear);

    return React.createElement(
        'div',
        { className: 'schedule-table-container' },
        React.createElement(
            'table',
            { className: 'schedule-table' },
            React.createElement(
                'thead',
                null,
                React.createElement(
                    'tr',
                    null,
                    React.createElement(
                        'th',
                        { className: 'time-header' },
                        'Thời gian',
                    ),
                    days.map((day) =>
                        React.createElement(
                            'th',
                            { key: day.date, className: 'day-header' },
                            React.createElement(
                                'div',
                                { className: 'day-name' },
                                day.dayName,
                            ),
                            React.createElement(
                                'div',
                                { className: 'day-date' },
                                day.date,
                            ),
                        ),
                    ),
                ),
            ),
            React.createElement(
                'tbody',
                null,
                timeSlots.map((timeSlot) =>
                    React.createElement(
                        'tr',
                        { key: timeSlot.key },
                        React.createElement(
                            'td',
                            { className: 'time-label' },
                            timeSlot.label,
                        ),
                        days.map((day) =>
                            React.createElement(TimeSlotCell, {
                                key: `${day.date}-${timeSlot.key}`,
                                items: props.data.filter(
                                    (item) => item.date === day.date,
                                ),
                                timeSlot: timeSlot.key,
                                isExam: props.isExam,
                            }),
                        ),
                    ),
                ),
            ),
        ),
    );
}

function SchedulePageContent(props) {
    const currentDate = new Date('2025-07-14');
    const initialWeek = getWeekNumber(currentDate); // Week 28 for July 14, 2025
    const [currentWeek, setCurrentWeek] = React.useState(initialWeek);
    const [currentYear, setCurrentYear] = React.useState(2025);

    const handleWeekChange = (direction) => {
        let newWeek = currentWeek;
        let newYear = currentYear;
        if (direction === 'next') {
            newWeek += 1;
            if (newWeek > 52) {
                newWeek = 1;
                newYear += 1;
            }
        } else {
            newWeek -= 1;
            if (newWeek < 1) {
                newWeek = 52;
                newYear -= 1;
            }
        }
        setCurrentWeek(newWeek);
        setCurrentYear(newYear);
    };

    const currentMonth =
        new Date(
            getWeekDates(currentWeek, currentYear)
                .days[0].date.split('/')
                .reverse()
                .join('-'),
        ).getMonth() + 1;

    return React.createElement(
        'div',
        { className: 'page-content' },
        React.createElement(
            'div',
            { className: 'schedule-container' },
            React.createElement(WeekNavigation, {
                currentWeek: currentWeek,
                currentMonth: currentMonth,
                currentYear: currentYear,
                onWeekChange: handleWeekChange,
            }),
            props.data.length > 0
                ? React.createElement(
                      motion.div,
                      {
                          initial: { opacity: 0, y: 20 },
                          animate: { opacity: 1, y: 0 },
                          transition: { duration: 0.3 },
                      },
                      React.createElement(ScheduleTable, {
                          data: props.data,
                          currentWeek: currentWeek,
                          currentYear: currentYear,
                          isExam: false,
                      }),
                  )
                : React.createElement(
                      'div',
                      { className: 'no-data' },
                      'Không có dữ liệu lịch học hoặc dữ liệu không hợp lệ.',
                  ),
        ),
    );
}

function ExamSchedulePageContent(props) {
    const currentDate = new Date('2025-07-14');
    const initialWeek = getWeekNumber(currentDate); // Week 28 for July 14, 2025
    const [currentWeek, setCurrentWeek] = React.useState(initialWeek);
    const [currentYear, setCurrentYear] = React.useState(2025);

    const handleWeekChange = (direction) => {
        let newWeek = currentWeek;
        let newYear = currentYear;
        if (direction === 'next') {
            newWeek += 1;
            if (newWeek > 52) {
                newWeek = 1;
                newYear += 1;
            }
        } else {
            newWeek -= 1;
            if (newWeek < 1) {
                newWeek = 52;
                newYear -= 1;
            }
        }
        setCurrentWeek(newWeek);
        setCurrentYear(newYear);
    };

    const currentMonth =
        new Date(
            getWeekDates(currentWeek, currentYear)
                .days[0].date.split('/')
                .reverse()
                .join('-'),
        ).getMonth() + 1;

    return React.createElement(
        'div',
        { className: 'page-content' },
        React.createElement(
            'div',
            { className: 'schedule-container' },
            React.createElement(WeekNavigation, {
                currentWeek: currentWeek,
                currentMonth: currentMonth,
                currentYear: currentYear,
                onWeekChange: handleWeekChange,
            }),
            props.data.length > 0
                ? React.createElement(
                      motion.div,
                      {
                          initial: { opacity: 0, y: 20 },
                          animate: { opacity: 1, y: 0 },
                          transition: { duration: 0.3 },
                      },
                      React.createElement(ScheduleTable, {
                          data: props.data,
                          currentWeek: currentWeek,
                          currentYear: currentYear,
                          isExam: true,
                      }),
                  )
                : React.createElement(
                      'div',
                      { className: 'no-data' },
                      'Không có dữ liệu lịch thi hoặc dữ liệu không hợp lệ.',
                  ),
        ),
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App));
