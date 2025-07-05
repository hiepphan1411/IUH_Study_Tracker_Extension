import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';

function GradesPage() {
    const [key, setKey] = useState('');
    const [gradesData, setGradesData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
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

    return (
        <Layout title="Xem Điểm">
            <div className="p-6">
                <div className="bg-gray-800 rounded-lg p-6 mb-6">
                    <h2 className="text-2xl font-bold mb-4 text-white">Kết quả học tập</h2>
                    <p className="text-gray-300 mb-4">Key: {key}</p>
                    
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                            <span className="ml-3 text-gray-300">Đang tải dữ liệu...</span>
                        </div>
                    ) : gradesData ? (
                        <div className="space-y-6">
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-400">Không có dữ liệu để hiển thị</p>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}

export default GradesPage;