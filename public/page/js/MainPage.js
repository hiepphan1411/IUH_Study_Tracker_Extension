/* eslint-disable */
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
        } else if (path.includes('StudyPlan.html')) {
            setCurrentPage('study-plan');
        } else {
            setCurrentPage('overview');
        }
    }, []);

    const navigateTo = (page) => {
        setCurrentPage(page);

        const baseUrl =
            window.location.origin +
            window.location.pathname
                .replace('/GradesPage.html', '')
                .replace('/MainPage.html', '')
                .replace('/StudyPlanPage.html', '');
        let newUrl = `${baseUrl}/MainPage.html${
            key ? `?k=${encodeURIComponent(key)}` : ''
        }`;
        if (page === 'grades') {
            newUrl = `${baseUrl}/GradesPage.html${
                key ? `?k=${encodeURIComponent(key)}` : ''
            }`;
        } else if (page === 'study-plan') {
            newUrl = `${baseUrl}/StudyPlanPage.html${
                key ? `?k=${encodeURIComponent(key)}` : ''
            }`;
        }

        window.history.pushState({}, '', newUrl);
    };

    const openStudyPlan = () => {
        const baseUrl =
            window.location.origin +
            window.location.pathname.replace('/MainPage.html', '');
        window.location.href = `${baseUrl}/StudyPlanPage.html${
            key ? `?k=${encodeURIComponent(key)}` : ''
        }`;
    };

    const renderCurrentPage = () => {
        switch (currentPage) {
            case 'grades':
                return React.createElement(GradesPageContent, {
                    keyValue: key,
                });
            case 'study-plan':
                return React.createElement(StudyPlanPageContent, {
                    keyValue: key,
                });
            case 'overview':
            default:
                return React.createElement(OverviewPageContent, {
                    keyValue: key,
                });
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

    return React.createElement(
        LayoutWithNavigation,
        {
            title: getPageTitle(),
            currentPage: currentPage,
            onNavigate: navigateTo,
            onOpenStudyPlan: openStudyPlan,
        },
        renderCurrentPage(),
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App));
