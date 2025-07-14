/* eslint-disable */

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

//export
window.GradesPageContent = GradesPageContent;