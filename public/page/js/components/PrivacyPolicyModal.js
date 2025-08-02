/* eslint-disable no-undef */
function PrivacyPolicyModal({ isOpen, onClose }) {
  const [activeSection, setActiveSection] = React.useState("overview");
  const [modalRoot, setModalRoot] = React.useState(null);
  const ignoreScrollEvent = React.useRef(false);

  React.useEffect(() => {
    if (isOpen) {
      const root = document.createElement("div");
      root.id = "privacy-modal-root";
      root.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100vw;
        height: 100vh;
        z-index: 999999;
        pointer-events: auto;
      `;
      document.body.appendChild(root);
      document.body.style.overflow = "hidden";
      setModalRoot(root);

      return () => {
        document.body.style.overflow = "auto";
        document.body.removeChild(root);
        setModalRoot(null);
      };
    }
  }, [isOpen]);

  const sections = [
    { id: "overview", title: "Tổng quan", icon: "" },
    { id: "data-collection", title: "Thu thập dữ liệu", icon: "" },
    { id: "data-purpose", title: "Mục đích sử dụng", icon: "" },
    { id: "data-processing", title: "Xử lý dữ liệu", icon: "" },
    { id: "user-rights", title: "Quyền người dùng", icon: "" },
    { id: "data-security", title: "Bảo mật dữ liệu", icon: "" },
    { id: "data-storage", title: "Lưu trữ dữ liệu", icon: "" },
    { id: "policy-changes", title: "Thay đổi chính sách", icon: "" },
    { id: "contact", title: "Thông tin liên hệ", icon: "" },
  ];

  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    const scrollContainer = document.getElementById("modal-content-scroll");
    if (element && scrollContainer) {
      ignoreScrollEvent.current = true;
      element.scrollIntoView({ behavior: "smooth" });

      let start = null;
      const maxWait = 1000; // ms
      function checkScroll(ts) {
        if (!start) start = ts;

        const rect = element.getBoundingClientRect();
        const containerRect = scrollContainer.getBoundingClientRect();
        if (
          rect.top >= containerRect.top &&
          rect.bottom <= containerRect.bottom
        ) {
          ignoreScrollEvent.current = false;
          return;
        }
        if (ts - start > maxWait) {
          ignoreScrollEvent.current = false;
          return;
        }
        requestAnimationFrame(checkScroll);
      }
      requestAnimationFrame(checkScroll);
    }
  };

  if (!isOpen || !modalRoot) return null;

  const modalElement = React.createElement(
    "div",
    {
      style: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        zIndex: 999999,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
      },
      onClick: (e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      },
    },
    React.createElement(
      "div",
      {
        style: {
          backgroundColor: "white",
          borderRadius: "12px",
          width: "95%",
          maxWidth: "1200px",
          height: "90vh",
          display: "flex",
          overflow: "hidden",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
        },
      },
      // Sidebar
      React.createElement(
        "div",
        {
          style: {
            width: "200px",
            backgroundColor: "#f8f9fa",
            borderRight: "1px solid #e9ecef",
            display: "flex",
            flexDirection: "column",
          },
        },
        React.createElement(
          "div",
          {
            style: {
              padding: "5px",
              marginTop: "75px",
              borderBottom: "1px solid #e9ecef",
            },
          },
          React.createElement(
            "h3",
            {
              style: {
                margin: 0,
                fontSize: "18px",
                fontWeight: "600",
                color: "#333",
              },
            },
            ""
          )
        ),
        React.createElement(
          "div",
          {
            style: {
              flex: 1,
              overflowY: "auto",
              padding: "2px",
            },
          },
          sections.map((section) =>
            React.createElement(
              "div",
              {
                key: section.id,
                onClick: () => scrollToSection(section.id),
                style: {
                  padding: "12px 16px",
                  margin: "4px 0",
                  borderRadius: "8px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  backgroundColor:
                    activeSection === section.id ? "#e3f2fd" : "transparent",
                  color: activeSection === section.id ? "#1976d2" : "#666",
                  transition: "all 0.2s ease",
                },
              },
              React.createElement(
                "span",
                { style: { fontSize: "16px" } },
                section.icon
              ),
              React.createElement(
                "span",
                { style: { fontSize: "14px", fontWeight: "500" } },
                section.title
              )
            )
          )
        )
      ),
      // Main content
      React.createElement(
        "div",
        {
          style: {
            flex: 1,
            display: "flex",
            flexDirection: "column",
          },
        },
        // Header
        React.createElement(
          "div",
          {
            style: {
              padding: "20px",
              borderBottom: "1px solid #e9ecef",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            },
          },
          React.createElement(
            "div",
            null,
            React.createElement(
              "h2",
              {
                style: {
                  margin: 0,
                  fontSize: "24px",
                  fontWeight: "700",
                  color: "#333",
                },
              },
              "CHÍNH SÁCH QUYỀN RIÊNG TƯ"
            ),
            React.createElement(
              "p",
              {
                style: {
                  margin: "8px 0 0 0",
                  fontSize: "14px",
                  color: "#666",
                },
              },
              "IUH Study Tracker Extension | Ngày có hiệu lực: 30/07/2025 | Phiên bản: 1.0"
            )
          ),
          React.createElement(
            "button",
            {
              onClick: onClose,
              style: {
                background: "none",
                border: "none",
                fontSize: "32px",
                cursor: "pointer",
                color: "#666",
                padding: "8px",
                lineHeight: 1,
              },
            },
            "×"
          )
        ),
        React.createElement(
          "div",
          {
            id: "modal-content-scroll",
            style: {
              flex: 1,
              overflowY: "auto",
              padding: "30px",
            },
            onScroll: (e) => {
              if (ignoreScrollEvent.current) return;
              const scrollContainer = e.target;
              const scrollTop = scrollContainer.scrollTop;

              let currentSection = sections[0].id;

              sections.forEach((section) => {
                const element = document.getElementById(section.id);
                if (element) {
                  const elementTop =
                    element.offsetTop - scrollContainer.offsetTop;
                  if (scrollTop >= elementTop - 100) {
                    currentSection = section.id;
                  }
                }
              });

              if (currentSection !== activeSection) {
                setActiveSection(currentSection);
              }
            },
          },
          React.createElement(
            "section",
            { id: "overview", style: { marginBottom: "40px" } },
            React.createElement(
              "h3",
              {
                style: {
                  fontSize: "20px",
                  fontWeight: "600",
                  color: "#1976d2",
                  marginBottom: "20px",
                },
              },
              "TỔNG QUAN"
            ),
            React.createElement(
              "p",
              {
                style: {
                  fontSize: "16px",
                  lineHeight: "1.6",
                  color: "#333",
                  marginBottom: "20px",
                },
              },
              "Chúng tôi – nhóm phát triển tiện ích IUH Study Tracker Extension – xây dựng tiện ích này với mục tiêu hỗ trợ sinh viên Trường Đại học Công nghiệp TP.HCM (IUH) theo dõi kết quả học tập của mình một cách thuận tiện, minh bạch và hiệu quả. Thay vì phải tra cứu thủ công và tổng hợp nhiều thông tin rời rạc, tiện ích giúp bạn tự động tính toán điểm số, theo dõi tiến độ học tập và lập kế hoạch cá nhân hóa cho từng học kỳ."
            ),
            React.createElement(
              "p",
              {
                style: {
                  fontSize: "16px",
                  lineHeight: "1.6",
                  color: "#333",
                  marginBottom: "20px",
                },
              },
              "Chúng tôi cam kết không thu thập, lưu trữ hay chia sẻ bất kỳ dữ liệu cá nhân nhạy cảm nào ngoài phạm vi cần thiết để phục vụ các tính năng cốt lõi của tiện ích. Dữ liệu học tập của bạn luôn được xử lý trực tiếp trên trình duyệt, và không bao giờ bị gửi đến bất kỳ máy chủ nào, kể cả của chúng tôi."
            ),
            React.createElement(
              "p",
              {
                style: {
                  fontSize: "16px",
                  lineHeight: "1.6",
                  color: "#333",
                  marginBottom: "20px",
                },
              },
              "Bằng việc sử dụng tiện ích này, bạn đồng ý với những nguyên tắc và cam kết trong chính sách quyền riêng tư sau đây. Mục tiêu của chúng tôi là minh bạch, tôn trọng người dùng và chỉ yêu cầu những quyền tối thiểu nhất để đảm bảo tiện ích hoạt động đúng chức năng."
            ),
            React.createElement(
              "p",
              {
                style: {
                  fontSize: "16px",
                  lineHeight: "1.6",
                  color: "#e74c3c",
                  fontWeight: "600",
                  marginBottom: "20px",
                },
              },
              "Tiện ích hoàn toàn miễn phí, được phát triển vì lợi ích cộng đồng sinh viên IUH, và không có bất kỳ hoạt động thu lợi từ dữ liệu nào."
            )
          ),
          React.createElement(
            "section",
            { id: "data-collection", style: { marginBottom: "40px" } },
            React.createElement(
              "h3",
              {
                style: {
                  fontSize: "20px",
                  fontWeight: "600",
                  color: "#1976d2",
                  marginBottom: "20px",
                },
              },
              "CHÚNG TÔI SẼ THU THẬP NHỮNG THÔNG TIN NÀO?"
            ),
            React.createElement(
              "h4",
              {
                style: {
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#333",
                  marginTop: "30px",
                  marginBottom: "15px",
                },
              },
              "1.1. Dữ liệu học tập"
            ),
            React.createElement(
              "p",
              {
                style: {
                  fontSize: "16px",
                  lineHeight: "1.6",
                  color: "#333",
                  marginBottom: "15px",
                },
              },
              React.createElement(
                "strong",
                null,
                "Điểm số và kết quả học tập: "
              ),
              "Tiện ích thu thập dữ liệu từ trang Kết quả học tập (https://sv.iuh.edu.vn/tra-cuu/ket-qua-hoc-tap.html), bao gồm: mã lớp học phần, tên môn học, số tín chỉ, điểm thành phần (thường xuyên, giữa kỳ, cuối kỳ), điểm tổng kết (thang điểm 10 và điểm chữ), thang điểm 4 tương ứng, xếp loại và trạng thái (đạt / không đạt)."
            ),
            React.createElement(
              "p",
              {
                style: {
                  fontSize: "14px",
                  lineHeight: "1.6",
                  color: "#666",
                  fontStyle: "italic",
                  marginBottom: "15px",
                },
              },
              "→ Những dữ liệu này là cần thiết để tiện ích có thể tự động tính GPA, tổng hợp tiến độ học tập, và đưa ra các thống kê trực quan về kết quả học tập."
            ),
            React.createElement(
              "p",
              {
                style: {
                  fontSize: "16px",
                  lineHeight: "1.6",
                  color: "#333",
                  marginBottom: "15px",
                },
              },
              React.createElement("strong", null, "Lịch học: "),
              "Từ trang Lịch học theo tuần, tiện ích đọc các thông tin gồm: tên môn học, mã lớp học phần, ngày và ca học, phòng học, giảng viên, và lịch thi nếu có."
            ),
            React.createElement(
              "p",
              {
                style: {
                  fontSize: "14px",
                  lineHeight: "1.6",
                  color: "#666",
                  fontStyle: "italic",
                  marginBottom: "15px",
                },
              },
              "→ Dữ liệu này giúp tiện ích hiển thị lịch học dưới dạng giao diện trực quan hơn, đồng thời dữ liệu lịch học sẽ được lưu dưới local, nhằm giúp sinh viên có thể xem được lịch học có mình khi server quá tải (số lượng sinh viên truy cập đông)."
            ),
            React.createElement(
              "p",
              {
                style: {
                  fontSize: "16px",
                  lineHeight: "1.6",
                  color: "#333",
                  marginBottom: "15px",
                },
              },
              React.createElement("strong", null, "Chương trình đào tạo: "),
              "Từ trang Chương trình khung, tiện ích thu thập danh sách môn học theo từng học kỳ, mã học phần, tín chỉ lý thuyết và thực hành, nhóm môn tự chọn, và trạng thái hoàn thành."
            ),
            React.createElement(
              "p",
              {
                style: {
                  fontSize: "14px",
                  lineHeight: "1.6",
                  color: "#666",
                  fontStyle: "italic",
                  marginBottom: "15px",
                },
              },
              "→ Dữ liệu chương trình đào tạo được dùng để tiện ích gợi ý kế hoạch học kỳ tiếp theo, nhận diện môn học chưa hoàn thành, và xây dựng lộ trình học tập cá nhân."
            ),
            React.createElement(
              "p",
              {
                style: {
                  fontSize: "16px",
                  lineHeight: "1.6",
                  color: "#333",
                  marginBottom: "15px",
                },
              },
              React.createElement("strong", null, "Kế hoạch học tập cá nhân: "),
              "Bạn có thể tự chọn các môn dự định học và điểm số mục tiêu. Các dữ liệu này phục vụ cho tính năng hỗ trợ người học đặt mục tiêu cụ thể, theo dõi tiến độ và điều chỉnh kế hoạch học tập kịp thời."
            ),
            React.createElement(
              "h4",
              {
                style: {
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#333",
                  marginTop: "30px",
                  marginBottom: "15px",
                },
              },
              "1.2. Dữ liệu khảo sát"
            ),
            React.createElement(
              "p",
              {
                style: {
                  fontSize: "16px",
                  lineHeight: "1.6",
                  color: "#333",
                  marginBottom: "15px",
                },
              },
              "Tiện ích hỗ trợ tự động điền phiếu khảo sát sinh viên với giá trị mặc định: mức đánh giá 'Hài lòng' và ý kiến 'Em không có ý kiến gì thêm'. Việc này nhằm tiết kiệm thời gian cho sinh viên trong các đợt khảo sát, không lưu lại bất kỳ thông tin nào về kết quả khảo sát."
            ),
            React.createElement(
              "h4",
              {
                style: {
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#333",
                  marginTop: "30px",
                  marginBottom: "15px",
                },
              },
              "1.3. Dữ liệu kỹ thuật"
            ),
            React.createElement(
              "p",
              {
                style: {
                  fontSize: "16px",
                  lineHeight: "1.6",
                  color: "#333",
                  marginBottom: "15px",
                },
              },
              React.createElement("strong", null, "Lưu trữ cài đặt: "),
              "Tiện ích sẽ lưu các thiết lập của bạn (ví dụ: kế hoạch học tập) ngay trên trình duyệt máy tính của bạn (localStorage) để bạn không cần nhập lại mỗi khi sử dụng."
            ),
            React.createElement(
              "h4",
              {
                style: {
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#333",
                  marginTop: "30px",
                  marginBottom: "15px",
                },
              },
              "1.4. Dữ liệu KHÔNG thu thập"
            ),
            React.createElement(
              "ul",
              {
                style: {
                  fontSize: "16px",
                  lineHeight: "1.6",
                  color: "#333",
                  marginBottom: "15px",
                  paddingLeft: "20px",
                },
              },
              React.createElement(
                "li",
                { style: { marginBottom: "8px" } },
                "Mật khẩu hoặc thông tin đăng nhập của bạn."
              ),
              React.createElement(
                "li",
                { style: { marginBottom: "8px" } },
                "Thông tin cá nhân nhạy cảm như Căn cước công dân, số điện thoại, ngày sinh, địa chỉ nhà...."
              ),
              React.createElement(
                "li",
                { style: { marginBottom: "8px" } },
                "Bất kỳ thông tin nào từ các trang web khác mà bạn truy cập."
              )
            ),
            React.createElement(
              "p",
              {
                style: {
                  fontSize: "16px",
                  lineHeight: "1.6",
                  color: "#e74c3c",
                  fontWeight: "600",
                  marginBottom: "20px",
                },
              },
              "Chúng tôi KHÔNG bán, chia sẻ hay kinh doanh dữ liệu của bạn dưới mọi hình thức. Tiện ích này hoàn toàn miễn phí và không thu thập dữ liệu cho mục đích thương mại."
            )
          ),
          React.createElement(
            "section",
            { id: "data-purpose", style: { marginBottom: "40px" } },
            React.createElement(
              "h3",
              {
                style: {
                  fontSize: "20px",
                  fontWeight: "600",
                  color: "#1976d2",
                  marginBottom: "20px",
                },
              },
              "TẠI SAO TIỆN ÍCH CẦN NHỮNG THÔNG TIN NÀY?"
            ),
            React.createElement(
              "p",
              {
                style: {
                  fontSize: "16px",
                  lineHeight: "1.6",
                  color: "#333",
                  marginBottom: "20px",
                },
              },
              "Mục đích duy nhất của chúng tôi là cung cấp cho bạn những tính năng hữu ích để quản lý việc học."
            ),
            React.createElement(
              "ul",
              {
                style: {
                  fontSize: "16px",
                  lineHeight: "1.6",
                  color: "#333",
                  marginBottom: "15px",
                  paddingLeft: "20px",
                },
              },
              React.createElement(
                "li",
                { style: { marginBottom: "12px" } },
                React.createElement(
                  "strong",
                  null,
                  "Thống kê kết quả học tập: "
                ),
                "Hiển thị kết quả học tập một cách trực quan, giúp sinh viên dễ dàng theo dõi và đánh giá quá trình học tập của bản thân."
              ),
              React.createElement(
                "li",
                { style: { marginBottom: "12px" } },
                React.createElement(
                  "strong",
                  null,
                  "Để theo dõi tiến độ học tập: "
                ),
                "Thay vì phải tự tính toán, tiện ích sẽ tự động tổng hợp điểm số và cho bạn biết GPA hiện tại của mình."
              ),
              React.createElement(
                "li",
                { style: { marginBottom: "12px" } },
                React.createElement(
                  "strong",
                  null,
                  "Để quản lý thời gian biểu: "
                ),
                "Giúp bạn xem lịch học một cách nhanh chóng mà không cần qua nhiều bước phức tạp."
              ),
              React.createElement(
                "li",
                { style: { marginBottom: "12px" } },
                React.createElement(
                  "strong",
                  null,
                  "Để lên kế hoạch cho tương lai: "
                ),
                "Hỗ trợ bạn vạch ra lộ trình học tập, chọn môn và đặt mục tiêu điểm số cho các học kỳ tới."
              ),
              React.createElement(
                "li",
                { style: { marginBottom: "12px" } },
                React.createElement("strong", null, "Để tiện lợi hơn: "),
                "Tiện ích lưu lại kế hoạch của bạn ngay trên máy tính để bạn có thể xem lại bất cứ lúc nào."
              ),
              React.createElement(
                "li",
                { style: { marginBottom: "12px" } },
                React.createElement("strong", null, "Xử lý khảo sát: "),
                "Hỗ trợ tự động hóa quy trình khảo sát"
              )
            )
          ),
          React.createElement(
            "section",
            { id: "data-processing", style: { marginBottom: "40px" } },
            React.createElement(
              "h3",
              {
                style: {
                  fontSize: "20px",
                  fontWeight: "600",
                  color: "#1976d2",
                  marginBottom: "20px",
                },
              },
              "DỮ LIỆU CỦA BẠN ĐƯỢC XỬ LÝ NHƯ THẾ NÀO VÀ CÓ AN TOÀN KHÔNG?"
            ),
            React.createElement(
              "p",
              {
                style: {
                  fontSize: "16px",
                  lineHeight: "1.6",
                  color: "#e74c3c",
                  fontWeight: "600",
                  marginBottom: "20px",
                },
              },
              "Đây là phần quan trọng nhất: Toàn bộ dữ liệu của bạn được xử lý ngay trên máy tính của chính bạn và không bao giờ rời khỏi đó."
            ),
            React.createElement(
              "ul",
              {
                style: {
                  fontSize: "16px",
                  lineHeight: "1.6",
                  color: "#333",
                  marginBottom: "15px",
                  paddingLeft: "20px",
                },
              },
              React.createElement(
                "li",
                { style: { marginBottom: "12px" } },
                React.createElement(
                  "strong",
                  null,
                  "Xử lý tại chỗ (Client-side): "
                ),
                "Hãy tưởng tượng bạn dùng một ứng dụng máy tính (calculator) trên điện thoại. Mọi phép tính đều diễn ra trên điện thoại của bạn, chứ không gửi đi đâu cả. Tiện ích này hoạt động tương tự. Mọi việc tính toán GPA, sắp xếp lịch học đều được thực hiện bên trong trình duyệt của bạn."
              ),
              React.createElement(
                "li",
                { style: { marginBottom: "12px" } },
                React.createElement(
                  "strong",
                  null,
                  "KHÔNG gửi đi bất cứ đâu: "
                ),
                "Tiện ích KHÔNG gửi dữ liệu học tập hay kế hoạch của bạn về bất kỳ máy chủ (server) nào của chúng tôi hay của bên thứ ba."
              ),
              React.createElement(
                "li",
                { style: { marginBottom: "12px" } },
                React.createElement("strong", null, "KHÔNG chia sẻ với ai: "),
                "Vì chúng tôi không thu thập dữ liệu của bạn, nên chúng tôi không có gì để chia sẻ, bán hay cho thuê với bất kỳ tổ chức nào."
              ),
              React.createElement(
                "li",
                { style: { marginBottom: "12px" } },
                React.createElement(
                  "strong",
                  null,
                  "Chỉ truy cập trên sv.iuh.edu.vn: "
                ),
                "Extension chỉ hoạt động trên domain của IUH"
              ),
              React.createElement(
                "li",
                { style: { marginBottom: "12px" } },
                React.createElement("strong", null, "Quyền tối thiểu: "),
                "Chỉ yêu cầu quyền cần thiết cho chức năng"
              )
            )
          ),
          React.createElement(
            "section",
            { id: "user-rights", style: { marginBottom: "40px" } },
            React.createElement(
              "h3",
              {
                style: {
                  fontSize: "20px",
                  fontWeight: "600",
                  color: "#1976d2",
                  marginBottom: "20px",
                },
              },
              "QUYỀN CỦA NGƯỜI DÙNG"
            ),
            React.createElement(
              "h4",
              {
                style: {
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#333",
                  marginTop: "30px",
                  marginBottom: "15px",
                },
              },
              "4.1. Quyền kiểm soát"
            ),
            React.createElement(
              "ul",
              {
                style: {
                  fontSize: "16px",
                  lineHeight: "1.6",
                  color: "#333",
                  marginBottom: "15px",
                  paddingLeft: "20px",
                },
              },
              React.createElement(
                "li",
                { style: { marginBottom: "8px" } },
                React.createElement("strong", null, "Cài đặt/Gỡ cài đặt: "),
                "Người dùng có thể cài đặt hoặc gỡ extension bất cứ lúc nào"
              ),
              React.createElement(
                "li",
                { style: { marginBottom: "8px" } },
                React.createElement("strong", null, "Xóa dữ liệu: "),
                "Có thể xóa toàn bộ dữ liệu đã lưu bằng cách gỡ extension"
              ),
              React.createElement(
                "li",
                { style: { marginBottom: "8px" } },
                React.createElement("strong", null, "Tắt extension: "),
                "Có thể tắt extension mà không mất dữ liệu đã lưu"
              )
            ),
            React.createElement(
              "h4",
              {
                style: {
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#333",
                  marginTop: "30px",
                  marginBottom: "15px",
                },
              },
              "4.2. Quyền truy cập"
            ),
            React.createElement(
              "ul",
              {
                style: {
                  fontSize: "16px",
                  lineHeight: "1.6",
                  color: "#333",
                  marginBottom: "15px",
                  paddingLeft: "20px",
                },
              },
              React.createElement(
                "li",
                { style: { marginBottom: "8px" } },
                React.createElement("strong", null, "Xem dữ liệu: "),
                "Toàn quyền xem và chỉnh sửa dữ liệu cá nhân trong extension"
              )
            ),
            React.createElement(
              "h4",
              {
                style: {
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#333",
                  marginTop: "30px",
                  marginBottom: "15px",
                },
              },
              "4.3. Quyền từ chối"
            ),
            React.createElement(
              "ul",
              {
                style: {
                  fontSize: "16px",
                  lineHeight: "1.6",
                  color: "#333",
                  marginBottom: "15px",
                  paddingLeft: "20px",
                },
              },
              React.createElement(
                "li",
                { style: { marginBottom: "8px" } },
                React.createElement("strong", null, "Không bắt buộc sử dụng: "),
                "Việc sử dụng extension hoàn toàn tự nguyện"
              ),
              React.createElement(
                "li",
                { style: { marginBottom: "8px" } },
                React.createElement("strong", null, "Có thể ngừng sử dụng: "),
                "Bất cứ lúc nào mà không cần thông báo trước"
              )
            )
          ),
          React.createElement(
            "section",
            { id: "data-security", style: { marginBottom: "40px" } },
            React.createElement(
              "h3",
              {
                style: {
                  fontSize: "20px",
                  fontWeight: "600",
                  color: "#1976d2",
                  marginBottom: "20px",
                },
              },
              "BẢO MẬT DỮ LIỆU"
            ),
            React.createElement(
              "h4",
              {
                style: {
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#333",
                  marginTop: "30px",
                  marginBottom: "15px",
                },
              },
              "5.1. Bảo mật kỹ thuật"
            ),
            React.createElement(
              "ul",
              {
                style: {
                  fontSize: "16px",
                  lineHeight: "1.6",
                  color: "#333",
                  marginBottom: "15px",
                  paddingLeft: "20px",
                },
              },
              React.createElement(
                "li",
                { style: { marginBottom: "8px" } },
                React.createElement("strong", null, "Xử lý client-side: "),
                "Dữ liệu được xử lý hoàn toàn trên máy người dùng"
              ),
              React.createElement(
                "li",
                { style: { marginBottom: "8px" } },
                React.createElement("strong", null, "Không truyền qua mạng: "),
                "Dữ liệu không được gửi qua internet"
              ),
              React.createElement(
                "li",
                { style: { marginBottom: "8px" } },
                React.createElement("strong", null, "Sử dụng HTTPS: "),
                "Chỉ hoạt động trên kết nối bảo mật của IUH"
              )
            ),
            React.createElement(
              "h4",
              {
                style: {
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#333",
                  marginTop: "30px",
                  marginBottom: "15px",
                },
              },
              "5.2. Bảo vệ truy cập"
            ),
            React.createElement(
              "ul",
              {
                style: {
                  fontSize: "16px",
                  lineHeight: "1.6",
                  color: "#333",
                  marginBottom: "15px",
                  paddingLeft: "20px",
                },
              },
              React.createElement(
                "li",
                { style: { marginBottom: "8px" } },
                React.createElement("strong", null, "Quyền hạn chế: "),
                "Extension chỉ truy cập vào các trang được khai báo"
              ),
              React.createElement(
                "li",
                { style: { marginBottom: "8px" } },
                React.createElement(
                  "strong",
                  null,
                  "Không thu thập nhạy cảm: "
                ),
                "Không thu thập thông tin đăng nhập hoặc dữ liệu nhạy cảm"
              ),
              React.createElement(
                "li",
                { style: { marginBottom: "8px" } },
                React.createElement("strong", null, "Kiểm soát người dùng: "),
                "Người dùng có toàn quyền kiểm soát dữ liệu của mình"
              )
            )
          ),
          React.createElement(
            "section",
            { id: "data-storage", style: { marginBottom: "40px" } },
            React.createElement(
              "h3",
              {
                style: {
                  fontSize: "20px",
                  fontWeight: "600",
                  color: "#1976d2",
                  marginBottom: "20px",
                },
              },
              "LƯU TRỮ DỮ LIỆU"
            ),
            React.createElement(
              "h4",
              {
                style: {
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#333",
                  marginTop: "30px",
                  marginBottom: "15px",
                },
              },
              "6.1. Vị trí lưu trữ"
            ),
            React.createElement(
              "ul",
              {
                style: {
                  fontSize: "16px",
                  lineHeight: "1.6",
                  color: "#333",
                  marginBottom: "15px",
                  paddingLeft: "20px",
                },
              },
              React.createElement(
                "li",
                { style: { marginBottom: "8px" } },
                React.createElement("strong", null, "localStorage: "),
                "Dữ liệu được lưu trong localStorage của trình duyệt"
              ),
              React.createElement(
                "li",
                { style: { marginBottom: "8px" } },
                React.createElement("strong", null, "Máy tính cá nhân: "),
                "Tất cả dữ liệu chỉ tồn tại trên thiết bị của người dùng"
              ),
              React.createElement(
                "li",
                { style: { marginBottom: "8px" } },
                React.createElement("strong", null, "Không có server: "),
                "Không lưu trữ trên bất kỳ server từ xa nào"
              )
            ),
            React.createElement(
              "h4",
              {
                style: {
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#333",
                  marginTop: "30px",
                  marginBottom: "15px",
                },
              },
              "6.2. Thời gian lưu trữ"
            ),
            React.createElement(
              "ul",
              {
                style: {
                  fontSize: "16px",
                  lineHeight: "1.6",
                  color: "#333",
                  marginBottom: "15px",
                  paddingLeft: "20px",
                },
              },
              React.createElement(
                "li",
                { style: { marginBottom: "8px" } },
                React.createElement("strong", null, "Vô thời hạn: "),
                "Dữ liệu được lưu cho đến khi người dùng xóa"
              ),
              React.createElement(
                "li",
                { style: { marginBottom: "8px" } },
                React.createElement("strong", null, "Tự động xóa: "),
                "Dữ liệu sẽ bị xóa khi gỡ extension hoặc xóa dữ liệu trình duyệt"
              ),
              React.createElement(
                "li",
                { style: { marginBottom: "8px" } },
                React.createElement("strong", null, "Kiểm soát người dùng: "),
                "Người dùng có thể xóa dữ liệu bất cứ lúc nào"
              )
            ),
            React.createElement(
              "h4",
              {
                style: {
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#333",
                  marginTop: "30px",
                  marginBottom: "15px",
                },
              },
              "6.3. Sao lưu và khôi phục"
            ),
            React.createElement(
              "ul",
              {
                style: {
                  fontSize: "16px",
                  lineHeight: "1.6",
                  color: "#333",
                  marginBottom: "15px",
                  paddingLeft: "20px",
                },
              },
              React.createElement(
                "li",
                { style: { marginBottom: "8px" } },
                React.createElement("strong", null, "Không sao lưu tự động: "),
                "Extension không tự động sao lưu dữ liệu"
              ),
              React.createElement(
                "li",
                { style: { marginBottom: "8px" } },
                React.createElement("strong", null, "Khôi phục thủ công: "),
                "Người dùng cần nhập lại dữ liệu nếu bị mất"
              )
            )
          ),
          React.createElement(
            "section",
            { id: "policy-changes", style: { marginBottom: "40px" } },
            React.createElement(
              "h3",
              {
                style: {
                  fontSize: "20px",
                  fontWeight: "600",
                  color: "#1976d2",
                  marginBottom: "20px",
                },
              },
              "THAY ĐỔI CHÍNH SÁCH QUYỀN RIÊNG TƯ"
            ),
            React.createElement(
              "h4",
              {
                style: {
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#333",
                  marginTop: "30px",
                  marginBottom: "15px",
                },
              },
              "7.1. Thông báo thay đổi"
            ),
            React.createElement(
              "ul",
              {
                style: {
                  fontSize: "16px",
                  lineHeight: "1.6",
                  color: "#333",
                  marginBottom: "15px",
                  paddingLeft: "20px",
                },
              },
              React.createElement(
                "li",
                { style: { marginBottom: "8px" } },
                React.createElement("strong", null, "Cập nhật phiên bản: "),
                "Thay đổi sẽ được thông báo qua phiên bản mới của extension"
              ),
              React.createElement(
                "li",
                { style: { marginBottom: "8px" } },
                React.createElement("strong", null, "Thông báo rõ ràng: "),
                "Các thay đổi quan trọng sẽ được thông báo trong giao diện extension"
              )
            ),
            React.createElement(
              "h4",
              {
                style: {
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#333",
                  marginTop: "30px",
                  marginBottom: "15px",
                },
              },
              "7.2. Chấp nhận thay đổi"
            ),
            React.createElement(
              "ul",
              {
                style: {
                  fontSize: "16px",
                  lineHeight: "1.6",
                  color: "#333",
                  marginBottom: "15px",
                  paddingLeft: "20px",
                },
              },
              React.createElement(
                "li",
                { style: { marginBottom: "8px" } },
                React.createElement("strong", null, "Tiếp tục sử dụng: "),
                "Việc tiếp tục sử dụng extension sau khi cập nhật được coi là chấp nhận chính sách mới"
              ),
              React.createElement(
                "li",
                { style: { marginBottom: "8px" } },
                React.createElement("strong", null, "Quyền từ chối: "),
                "Người dùng có thể gỡ extension nếu không đồng ý với thay đổi"
              )
            )
          ),
          React.createElement(
            "section",
            { id: "contact", style: { marginBottom: "40px" } },
            React.createElement(
              "h3",
              {
                style: {
                  fontSize: "20px",
                  fontWeight: "600",
                  color: "#1976d2",
                  marginBottom: "20px",
                },
              },
              "\n\n\nTHÔNG TIN LIÊN HỆ"
            ),
            React.createElement(
              "h4",
              {
                style: {
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#333",
                  marginTop: "30px",
                  marginBottom: "15px",
                },
              },
              "8.1. Thông tin nhà phát triển"
            ),
            React.createElement(
              "p",
              { style: { margin: "0 0 10px 0", fontSize: "16px" } },
              React.createElement("strong", null, "Tên dự án: "),
              "IUH Study Tracker Extension"
            ),
            React.createElement(
              "p",
              { style: { margin: "0 0 10px 0", fontSize: "16px" } },
              React.createElement("strong", null, "Repository: "),
              "GitHub - hiepphan1411/IUH_Study_Tracker_Extension"
            ),
            React.createElement(
              "h4",
              {
                style: {
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#333",
                  marginTop: "30px",
                  marginBottom: "15px",
                },
              },
              "8.2. Liên hệ hỗ trợ"
            ),
            React.createElement(
              "p",
              { style: { margin: "0 0 10px 0", fontSize: "16px" } },
              React.createElement("strong", null, "Email hỗ trợ: "),
              "hgnd27811.dev@gmail.com"
            ),
            React.createElement(
              "h4",
              {
                style: {
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#333",
                  marginTop: "30px",
                  marginBottom: "15px",
                },
              },
              "8.3. Cam kết"
            ),
            React.createElement(
              "ul",
              {
                style: {
                  fontSize: "16px",
                  lineHeight: "1.6",
                  color: "#333",
                  marginBottom: "15px",
                  paddingLeft: "20px",
                },
              },
              React.createElement(
                "li",
                { style: { marginBottom: "8px" } },
                React.createElement(
                  "div",
                  null,
                  React.createElement(
                    "strong",
                    null,
                    "Phản hồi nhanh chóng và có trách nhiệm: "
                  ),
                  "Chúng tôi cam kết phản hồi mọi câu hỏi, khiếu nại hoặc đề nghị liên quan đến quyền riêng tư trong vòng 07 ngày làm việc kể từ khi nhận được yêu cầu. Người dùng có thể liên hệ thông qua địa chỉ email trong phần Thông tin liên hệ.",

                  React.createElement("br"),
                  React.createElement("br"),

                  React.createElement(
                    "strong",
                    null,
                    "Minh bạch trong mọi hoạt động: "
                  ),
                  "Chúng tôi luôn cung cấp thông tin rõ ràng, dễ hiểu và đầy đủ về cách tiện ích hoạt động, bao gồm:",
                  React.createElement(
                    "ul",
                    null,
                    React.createElement(
                      "li",
                      null,
                      "Cách tiện ích thu thập, xử lý và lưu trữ dữ liệu."
                    ),
                    React.createElement(
                      "li",
                      null,
                      "Các quyền mà tiện ích yêu cầu khi cài đặt."
                    ),
                    React.createElement(
                      "li",
                      null,
                      "Cách kiểm soát, chỉnh sửa và xóa dữ liệu đã lưu."
                    )
                  ),
                  "Mã nguồn tiện ích được công khai trên GitHub. Người dùng có thể kiểm tra để đảm bảo tiện ích không gửi dữ liệu ra ngoài hoặc theo dõi hành vi sử dụng.",

                  React.createElement("br"),
                  React.createElement("br"),

                  React.createElement(
                    "strong",
                    null,
                    "Tôn trọng quyền riêng tư người dùng: "
                  ),
                  "Tiện ích được xây dựng theo nguyên tắc 'quyền riêng tư là mặc định' (privacy by default). Mọi dữ liệu cá nhân đều được xử lý nội bộ, không thu thập thông tin nhạy cảm và luôn nằm trong tầm kiểm soát của người dùng.",

                  React.createElement("br"),
                  React.createElement("br"),

                  React.createElement("strong", null, "Cải tiến liên tục: "),
                  "Chúng tôi liên tục cải tiến tiện ích dựa trên phản hồi từ người dùng, đồng thời đảm bảo các thay đổi về bảo mật và quyền riêng tư đều được thông báo minh bạch qua bản cập nhật hoặc trong giao diện sử dụng."
                )
              )
            )
          )
        )
      )
    )
  );

  return ReactDOM.createPortal(modalElement, modalRoot);
}

window.PrivacyPolicyModal = PrivacyPolicyModal;
