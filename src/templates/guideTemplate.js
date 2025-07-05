export const guideTemplate = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hướng dẫn lấy Key - IUH Study Tracker</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%);
      min-height: 100vh;
      padding: 1.5rem;
    }
    
    .container {
      max-width: 64rem;
      margin: 0 auto;
    }
    
    .header {
      text-align: center;
      margin-bottom: 2rem;
    }
    
    .header-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1rem;
    }
    
    .icon-circle {
      background: linear-gradient(45deg, #3b82f6, #8b5cf6);
      padding: 1rem;
      border-radius: 50%;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    }
    
    .icon-circle svg {
      width: 2rem;
      height: 2rem;
      color: white;
    }
    
    .header h1 {
      font-size: 1.875rem;
      font-weight: bold;
      color: #1f2937;
      margin-bottom: 0.5rem;
    }
    
    .header p {
      color: #6b7280;
      font-size: 1.125rem;
    }
    
    .info-box {
      border-radius: 0.5rem;
      padding: 1rem;
      margin-bottom: 2rem;
      display: flex;
      align-items: flex-start;
    }
    
    .info-box-blue {
      background-color: #eff6ff;
      border-left: 4px solid #3b82f6;
    }
    
    .info-box-yellow {
      background-color: #fefce8;
      border-left: 4px solid #f59e0b;
    }
    
    .info-box svg {
      width: 1.5rem;
      height: 1.5rem;
      margin-right: 0.75rem;
      margin-top: 0.125rem;
      flex-shrink: 0;
    }
    
    .info-box-blue svg {
      color: #2563eb;
    }
    
    .info-box-yellow svg {
      color: #d97706;
    }
    
    .info-box h3 {
      font-weight: 600;
      margin-bottom: 0.25rem;
    }
    
    .info-box-blue h3 {
      color: #1e40af;
    }
    
    .info-box-yellow h3 {
      color: #92400e;
    }
    
    .info-box p {
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }
    
    .info-box-blue p {
      color: #1d4ed8;
    }
    
    .info-box-yellow p {
      color: #a16207;
    }
    
    .steps {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    
    .step {
      background-color: #eff6ff;
      border: 2px solid #bfdbfe;
      border-radius: 1rem;
      padding: 1.5rem;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s ease;
    }
    
    .step:hover {
      transform: scale(1.02);
    }
    
    .step-content {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
    }
    
    .step-number {
      background-color: #3b82f6;
      color: white;
      border-radius: 50%;
      width: 3rem;
      height: 3rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 1.125rem;
      flex-shrink: 0;
    }
    
    .step-text {
      flex: 1;
    }
    
    .step-text h3 {
      font-size: 1.25rem;
      font-weight: bold;
      color: #1e40af;
      margin-bottom: 0.5rem;
    }
    
    .step-text > p {
      color: #374151;
      margin-bottom: 1rem;
    }
    
    .step-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .step-list li {
      display: flex;
      align-items: flex-start;
      color: #4b5563;
    }
    
    .step-list svg {
      width: 1.25rem;
      height: 1.25rem;
      color: #10b981;
      margin-right: 0.5rem;
      margin-top: 0.125rem;
      flex-shrink: 0;
    }
    
    .example {
      margin-top: 2rem;
      background-color: white;
      border-radius: 1rem;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
      padding: 1.5rem;
    }
    
    .example h3 {
      font-size: 1.25rem;
      font-weight: bold;
      color: #1f2937;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
    }
    
    .example h3 svg {
      width: 1.5rem;
      height: 1.5rem;
      color: #10b981;
      margin-right: 0.5rem;
    }
    
    .example-content {
      background-color: #f9fafb;
      padding: 1rem;
      border-radius: 0.5rem;
      border-left: 4px solid #10b981;
    }
    
    .example-content h4 {
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 0.5rem;
    }
    
    .example-content code {
      background-color: #1f2937;
      color: #10b981;
      padding: 0.5rem;
      border-radius: 0.25rem;
      font-size: 0.875rem;
      font-family: 'Courier New', monospace;
      display: block;
      word-break: break-all;
      overflow-wrap: break-word;
    }
    
    .example-content p {
      color: #4b5563;
      font-size: 0.875rem;
      margin-top: 0.5rem;
    }
    
    .highlight {
      background-color: #fef3c7;
      padding: 0.125rem 0.25rem;
      border-radius: 0.125rem;
      font-family: 'Courier New', monospace;
    }
    
    @media (max-width: 768px) {
      body {
        padding: 1rem;
      }
      
      .header h1 {
        font-size: 1.5rem;
      }
      
      .step-content {
        flex-direction: column;
        gap: 0.75rem;
      }
      
      .step-number {
        width: 2.5rem;
        height: 2.5rem;
        font-size: 1rem;
      }
      
      .example-content code {
        font-size: 0.75rem;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="header-icon">
        <div class="icon-circle">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
          </svg>
        </div>
      </div>
      <h1>Hướng dẫn lấy Key truy cập</h1>
      <p>Kết quả học tập từ trang SV IUH</p>
    </div>
    
    <!-- Quick Access Link -->
    <div class="info-box info-box-blue">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
      </svg>
      <div>
        <h3>Liên kết truy cập nhanh</h3>
        <p>👉 Trang sinh viên IUH</p>
      </div>
    </div>

    <!-- Warning Notice -->
    <div class="info-box info-box-yellow">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.747-.833-2.517 0L4.298 15.5c-.77.833.192 2.5 1.732 2.5z"></path>
      </svg>
      <div>
        <h3>Lưu ý quan trọng</h3>
        <p>Nếu sinh viên chưa khai báo số điện thoại trong mục 'Đề xuất cập nhật thông tin', cần cập nhật số điện thoại trước khi sử dụng chức năng tra cứu.</p>
      </div>
    </div>

    <!-- Steps -->
    <div class="steps">
      <!-- Step 1 -->
      <div class="step">
        <div class="step-content">
          <div class="step-number">1</div>
          <div class="step-text">
            <h3>Truy cập trang SV IUH</h3>
            <p>Truy cập vào trang tra cứu thông tin sinh viên</p>
            <ul class="step-list">
              <li>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Mở trình duyệt web
              </li>
              <li>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Truy cập trang sinh viên IUH
              </li>
              <li>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Chọn 'Chế độ dành cho phụ huynh'
              </li>
              <li>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Nhấn 'Tra cứu thông tin'
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Step 2 -->
      <div class="step">
        <div class="step-content">
          <div class="step-number">2</div>
          <div class="step-text">
            <h3>Nhập thông tin sinh viên</h3>
            <p>Điền đầy đủ các thông tin được yêu cầu</p>
            <ul class="step-list">
              <li>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Mã số sinh viên
              </li>
              <li>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Họ tên đầy đủ
              </li>
              <li>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Ngày sinh (dd/mm/yyyy)
              </li>
              <li>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Số điện thoại đã đăng ký
              </li>
              <li>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Mã bảo vệ (CAPTCHA)
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Step 3 -->
      <div class="step">
        <div class="step-content">
          <div class="step-number">3</div>
          <div class="step-text">
            <h3>Xem kết quả học tập</h3>
            <p>Điều hướng đến trang kết quả học tập</p>
            <ul class="step-list">
              <li>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Sau khi điền đúng thông tin, hệ thống hiển thị kết quả tra cứu
              </li>
              <li>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Chọn mục 'Xem điểm' để tiếp tục
              </li>
              <li>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Hệ thống sẽ điều hướng đến trang hiển thị kết quả học tập
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Step 4 -->
      <div class="step">
        <div class="step-content">
          <div class="step-number">4</div>
          <div class="step-text">
            <h3>Sao chép key từ URL</h3>
            <p>Lấy key truy cập từ thanh địa chỉ trình duyệt</p>
            <ul class="step-list">
              <li>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Quan sát thanh địa chỉ trình duyệt
              </li>
              <li>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Tìm URL có chứa tham số 'k=' trong địa chỉ
              </li>
              <li>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Sao chép chuỗi sau dấu 'k=' (ví dụ: 8k_Zf30Gv5L81suIlYeau3pKsgdRG)
              </li>
              <li>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Đây chính là key truy cập cần thiết
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Example Section -->
    <div class="example">
      <h3>
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        Ví dụ cụ thể
      </h3>
      <div class="example-content">
        <h4>URL sau khi truy cập thành công:</h4>
        <code>sv.iuh.edu.vn/tra-cuu/ket-qua-hoc-tap.html?k=8k_Zf30Gv5L81suIlYeau3pKsgdRG</code>
        <p>
          <strong>Key cần sao chép: </strong>
          <span class="highlight">8k_Zf30Gv5L81suIlYeau3pKsgdRG</span>
        </p>
      </div>
    </div>
  </div>
</body>
</html>
`