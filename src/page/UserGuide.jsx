import React from 'react'

function UserGuide() {
  const steps = [
    {
      id: 1,
      title: "Truy cập trang SV IUH",
      description: "Truy cập vào trang tra cứu thông tin sinh viên",
      details: [
        "Mở trình duyệt web",
        "Truy cập vào trang: https://sv.iuh.edu.vn/sinh-vien-dang-nhap.html",
        "Chọn 'Chế độ dành cho phụ huynh'",
        "Nhấn vào 'Tra cứu thông tin'"
      ],
      color: "blue"
    },
    {
      id: 2,
      title: "Nhập thông tin sinh viên",
      description: "Điền đầy đủ các thông tin được yêu cầu",
      details: [
        "Mã số sinh viên",
        "Họ tên đầy đủ",
        "Ngày sinh (dd/mm/yyyy)",
        "Số điện thoại đã đăng ký",
        "Mã bảo vệ (CAPTCHA)"
      ],
      color: "green"
    },
    {
      id: 3,
      title: "Xem kết quả học tập",
      description: "Điều hướng đến trang kết quả học tập",
      details: [
        "Sau khi điền đúng thông tin, hệ thống hiển thị kết quả tra cứu",
        "Chọn mục 'Xem điểm' để tiếp tục",
        "Hệ thống sẽ điều hướng đến trang hiển thị kết quả học tập"
      ],
      color: "purple"
    },
    {
      id: 4,
      title: "Sao chép key từ URL",
      description: "Lấy key truy cập từ thanh địa chỉ trình duyệt",
      details: [
        "Quan sát thanh địa chỉ trình duyệt",
        "Tìm URL có dạng: https://sv.iuh.edu.vn/tra-cuu/ket-qua-hoc-tap.html?k=...",
        "Sao chép chuỗi sau dấu 'k=' (ví dụ: 8k_Zf30Gv5L81suIlYeau3pKsgdRG)",
        "Đây chính là key truy cập cần thiết"
      ],
      color: "orange"
    }
  ]

  const getColorClasses = (color) => {
    const colors = {
      blue: {
        bg: "bg-blue-50",
        border: "border-blue-200",
        text: "text-blue-800",
        icon: "bg-blue-500"
      },
      green: {
        bg: "bg-green-50",
        border: "border-green-200",
        text: "text-green-800",
        icon: "bg-green-500"
      },
      purple: {
        bg: "bg-purple-50",
        border: "border-purple-200",
        text: "text-purple-800",
        icon: "bg-purple-500"
      },
      orange: {
        bg: "bg-orange-50",
        border: "border-orange-200",
        text: "text-orange-800",
        icon: "bg-orange-500"
      }
    }
    return colors[color] || colors.blue
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">

        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-full shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Hướng dẫn lấy Key truy cập</h1>
          <p className="text-gray-600 text-lg">Kết quả học tập từ trang SV IUH</p>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8 rounded-lg">
          <div className="flex items-start">
            <svg className="w-6 h-6 text-yellow-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.747-.833-2.517 0L4.298 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <h3 className="text-yellow-800 font-semibold">Lưu ý quan trọng</h3>
              <p className="text-yellow-700 text-sm mt-1">
                Nếu sinh viên chưa khai báo số điện thoại trong mục "Đề xuất cập nhật thông tin", cần cập nhật số điện thoại trước khi sử dụng chức năng tra cứu.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8 rounded-lg">
          <div className="flex items-start">
            <svg className="w-6 h-6 text-blue-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <div>
              <h3 className="text-blue-800 font-semibold">Liên kết truy cập nhanh</h3>
              <p className="text-blue-700 text-sm mt-1">
                👉 <a href="https://sv.iuh.edu.vn/sinh-vien-dang-nhap.html" target="_blank" rel="noopener noreferrer" className="font-mono underline hover:text-blue-900">https://sv.iuh.edu.vn/sinh-vien-dang-nhap.html</a>
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {steps.map((step, index) => {
            const colorClasses = getColorClasses(step.color)
            return (
              <div
                key={step.id}
                className={`${colorClasses.bg} ${colorClasses.border} border-2 rounded-2xl p-6 shadow-lg transform hover:scale-105 transition-all duration-300`}
              >
                <div className="flex items-start space-x-4">

                  <div className={`${colorClasses.icon} text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg flex-shrink-0`}>
                    {step.id}
                  </div>
                  
                  <div className="flex-1">

                    <h3 className={`text-xl font-bold ${colorClasses.text} mb-2`}>
                      {step.title}
                    </h3>
                    
                    <p className="text-gray-700 mb-4">
                      {step.description}
                    </p>
 
                    <ul className="space-y-2">
                      {step.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="flex items-start text-gray-600">
                          <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <svg className="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Ví dụ cụ thể
          </h3>
          <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-green-500">
            <h4 className="font-semibold text-gray-800 mb-2">URL sau khi truy cập thành công:</h4>
            <code className="bg-gray-800 text-green-400 p-2 rounded text-sm block font-mono break-all">
              https://sv.iuh.edu.vn/tra-cuu/ket-qua-hoc-tap.html?k=8k_Zf30Gv5L81suIlYeau3pKsgdRG
            </code>
            <p className="text-gray-600 text-sm mt-2">
              <strong>Key cần sao chép:</strong> <span className="bg-yellow-200 px-1 rounded font-mono">8k_Zf30Gv5L81suIlYeau3pKsgdRG</span>
            </p>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <svg className="w-6 h-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Mẹo và lưu ý
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Thông tin chính xác</h4>
              <p className="text-blue-700 text-sm">Đảm bảo nhập đúng tất cả thông tin cá nhân như đã đăng ký với nhà trường.</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">Số điện thoại</h4>
              <p className="text-green-700 text-sm">Cập nhật số điện thoại trong hệ thống trước khi thực hiện tra cứu.</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-semibold text-purple-800 mb-2">Bảo mật key</h4>
              <p className="text-purple-700 text-sm">Key có thời hạn sử dụng, không chia sẻ với người khác.</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <h4 className="font-semibold text-orange-800 mb-2">Sao chép chính xác</h4>
              <p className="text-orange-700 text-sm">Chỉ sao chép phần sau dấu "k=" trong URL, không bao gồm ký tự khác.</p>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <svg className="w-6 h-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Câu hỏi thường gặp
          </h3>
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-semibold text-gray-800">Key có thời hạn bao lâu?</h4>
              <p className="text-gray-600 text-sm">Key thường có thời hạn ngắn, nên sử dụng ngay sau khi lấy được.</p>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-semibold text-gray-800">Không thể tra cứu thông tin?</h4>
              <p className="text-gray-600 text-sm">Kiểm tra lại thông tin cá nhân và đảm bảo số điện thoại đã được cập nhật trong hệ thống.</p>
            </div>
            <div className="border-l-4 border-purple-500 pl-4">
              <h4 className="font-semibold text-gray-800">Không thấy key trong URL?</h4>
              <p className="text-gray-600 text-sm">Đảm bảo đã vào đúng trang "Xem điểm" và kiểm tra thanh địa chỉ trình duyệt.</p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-gray-600">
          <p>© 2024 IUH Study Tracker Extension - Hướng dẫn lấy key truy cập</p>
        </div>
      </div>
    </div>
  )
}

export default UserGuide
