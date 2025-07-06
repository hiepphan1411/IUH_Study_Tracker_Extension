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


window.StudyPlanPageContent = StudyPlanPageContent;
