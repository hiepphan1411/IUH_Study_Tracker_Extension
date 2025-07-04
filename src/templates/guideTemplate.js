export const guideTemplate = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hướng dẫn lấy Key - IUH Study Tracker</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
  <div id="root"></div>
  <script type="module">
    import React from 'https://esm.sh/react@18'
    import ReactDOM from 'https://esm.sh/react-dom@18/client'
    
    const UserGuide = () => {
      const steps = [
        {
          id: 1,
          title: "Truy cập trang SV IUH",
          description: "Truy cập vào trang tra cứu thông tin sinh viên",
          details: [
            "Mở trình duyệt web",
            "Truy cập: https://sv.iuh.edu.vn/sinh-vien-dang-nhap.html",
            "Chọn 'Chế độ dành cho phụ huynh'",
            "Nhấn 'Tra cứu thông tin'"
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
          color: "blue"
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
          color: "blue"
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
          color: "blue"
        }
      ]

      const getColorClasses = (color) => {
        const colors = {
          blue: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-800", icon: "bg-blue-500" },
          green: { bg: "bg-green-50", border: "border-green-200", text: "text-green-800", icon: "bg-green-500" },
          purple: { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-800", icon: "bg-purple-500" },
          orange: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-800", icon: "bg-orange-500" }
        }
        return colors[color] || colors.blue
      }

      return React.createElement('div', {
        className: "min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6"
      }, [
        React.createElement('div', {
          className: "max-w-4xl mx-auto",
          key: "container"
        }, [
          // Header
          React.createElement('div', {
            className: "text-center mb-8",
            key: "header"
          }, [
            React.createElement('div', {
              className: "flex items-center justify-center mb-4",
              key: "icon-container"
            }, React.createElement('div', {
              className: "bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-full shadow-lg"
            }, React.createElement('svg', {
              className: "w-8 h-8 text-white",
              fill: "none",
              stroke: "currentColor",
              viewBox: "0 0 24 24"
            }, React.createElement('path', {
              strokeLinecap: "round",
              strokeLinejoin: "round",
              strokeWidth: 2,
              d: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            })))),
            React.createElement('h1', {
              className: "text-3xl font-bold text-gray-800 mb-2",
              key: "title"
            }, "Hướng dẫn lấy Key truy cập"),
            React.createElement('p', {
              className: "text-gray-600 text-lg",
              key: "subtitle"
            }, "Kết quả học tập từ trang SV IUH")
          ]),
          
          // Quick Access Link
          React.createElement('div', {
            className: "bg-blue-50 border-l-4 border-blue-500 p-4 mb-8 rounded-lg",
            key: "quick-access"
          }, React.createElement('div', {
            className: "flex items-start"
          }, [
            React.createElement('svg', {
              className: "w-6 h-6 text-blue-600 mt-0.5 mr-3",
              fill: "none",
              stroke: "currentColor",
              viewBox: "0 0 24 24",
              key: "link-icon"
            }, React.createElement('path', {
              strokeLinecap: "round",
              strokeLinejoin: "round",
              strokeWidth: 2,
              d: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
            })),
            React.createElement('div', {
              key: "link-content"
            }, [
              React.createElement('h3', {
                className: "text-blue-800 font-semibold",
                key: "link-title"
              }, "Liên kết truy cập nhanh"),
              React.createElement('p', {
                className: "text-blue-700 text-sm mt-1",
                key: "link-text"
              }, "👉 https://sv.iuh.edu.vn/sinh-vien-dang-nhap.html")
            ])
          ])),

          // Warning Notice
          React.createElement('div', {
            className: "bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8 rounded-lg",
            key: "warning"
          }, React.createElement('div', {
            className: "flex items-start"
          }, [
            React.createElement('svg', {
              className: "w-6 h-6 text-yellow-600 mt-0.5 mr-3",
              fill: "none",
              stroke: "currentColor",
              viewBox: "0 0 24 24",
              key: "warning-icon"
            }, React.createElement('path', {
              strokeLinecap: "round",
              strokeLinejoin: "round",
              strokeWidth: 2,
              d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.747-.833-2.517 0L4.298 15.5c-.77.833.192 2.5 1.732 2.5z"
            })),
            React.createElement('div', {
              key: "warning-content"
            }, [
              React.createElement('h3', {
                className: "text-yellow-800 font-semibold",
                key: "warning-title"
              }, "Lưu ý quan trọng"),
              React.createElement('p', {
                className: "text-yellow-700 text-sm mt-1",
                key: "warning-text"
              }, "Nếu sinh viên chưa khai báo số điện thoại trong mục 'Đề xuất cập nhật thông tin', cần cập nhật số điện thoại trước khi sử dụng chức năng tra cứu.")
            ])
          ])),

          // Steps
          React.createElement('div', {
            className: "space-y-6",
            key: "steps"
          }, steps.map((step) => {
            const colorClasses = getColorClasses(step.color)
            return React.createElement('div', {
              key: step.id,
              className: colorClasses.bg + " " + colorClasses.border + " border-2 rounded-2xl p-6 shadow-lg transform hover:scale-105 transition-all duration-300"
            }, React.createElement('div', {
              className: "flex items-start space-x-4"
            }, [
              React.createElement('div', {
                className: colorClasses.icon + " text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg flex-shrink-0",
                key: "step-number"
              }, step.id),
              React.createElement('div', {
                className: "flex-1",
                key: "step-content"
              }, [
                React.createElement('h3', {
                  className: "text-xl font-bold " + colorClasses.text + " mb-2",
                  key: "step-title"
                }, step.title),
                React.createElement('p', {
                  className: "text-gray-700 mb-4",
                  key: "step-description"
                }, step.description),
                React.createElement('ul', {
                  className: "space-y-2",
                  key: "step-details"
                }, step.details.map((detail, detailIndex) => 
                  React.createElement('li', {
                    key: detailIndex,
                    className: "flex items-start text-gray-600"
                  }, [
                    React.createElement('svg', {
                      className: "w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0",
                      fill: "none",
                      stroke: "currentColor",
                      viewBox: "0 0 24 24",
                      key: "check-icon"
                    }, React.createElement('path', {
                      strokeLinecap: "round",
                      strokeLinejoin: "round",
                      strokeWidth: 2,
                      d: "M5 13l4 4L19 7"
                    })),
                    detail
                  ])
                ))
              ])
            ]))
          })),

          // Example Section
          React.createElement('div', {
            className: "mt-8 bg-white rounded-2xl shadow-lg p-6",
            key: "example"
          }, [
            React.createElement('h3', {
              className: "text-xl font-bold text-gray-800 mb-4 flex items-center",
              key: "example-title"
            }, [
              React.createElement('svg', {
                className: "w-6 h-6 text-green-600 mr-2",
                fill: "none",
                stroke: "currentColor",
                viewBox: "0 0 24 24",
                key: "example-icon"
              }, React.createElement('path', {
                strokeLinecap: "round",
                strokeLinejoin: "round",
                strokeWidth: 2,
                d: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              })),
              "Ví dụ cụ thể"
            ]),
            React.createElement('div', {
              className: "bg-gray-50 p-4 rounded-lg border-l-4 border-green-500",
              key: "example-content"
            }, [
              React.createElement('h4', {
                className: "font-semibold text-gray-800 mb-2",
                key: "example-subtitle"
              }, "URL sau khi truy cập thành công:"),
              React.createElement('code', {
                className: "bg-gray-800 text-green-400 p-2 rounded text-sm block font-mono break-all",
                key: "example-url"
              }, "https://sv.iuh.edu.vn/tra-cuu/ket-qua-hoc-tap.html?k=8k_Zf30Gv5L81suIlYeau3pKsgdRG"),
              React.createElement('p', {
                className: "text-gray-600 text-sm mt-2",
                key: "example-note"
              }, [
                React.createElement('strong', { key: "key-label" }, "Key cần sao chép: "),
                React.createElement('span', {
                  className: "bg-yellow-200 px-1 rounded font-mono",
                  key: "key-value"
                }, "8k_Zf30Gv5L81suIlYeau3pKsgdRG")
              ])
            ])
          ])
        ])
      ])
    }

    const root = ReactDOM.createRoot(document.getElementById('root'))
    root.render(React.createElement(UserGuide))
  </script>
</body>
</html>
`
