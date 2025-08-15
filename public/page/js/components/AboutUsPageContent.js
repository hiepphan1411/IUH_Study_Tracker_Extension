/* eslint-disable */

function AboutUsPageContent() {
  const [rating, setRating] = React.useState(0);
  const [hoverRating, setHoverRating] = React.useState(0);
  const [feedback, setFeedback] = React.useState("");
  const [showPrivacyPolicy, setShowPrivacyPolicy] = React.useState(false);

  const teamMembers = [
    {
      name: "Nguyễn Thị Mỹ Duyên",
      avatar: "../../../image/members/Duyen.png",
    },
    {
      name: "Huỳnh Thanh Giang",
      avatar: "../../../image/members/Zang.png",
    },
    {
      name: "Hồ Quang Nhân",
      avatar: "../../../image/members/Nhan.png",
    },
    {
      name: "Phan Phước Hiệp",
      avatar: "../../../image/members/Hip.png",
    },
  ];

  const handleRatingClick = (value) => {
    setRating(value);
  };

  const handleSubmitFeedback = () => {
    if (rating === 0) {
      alert("Vui lòng chọn số sao đánh giá!");
      return;
    }

    const feedbackData = {
      rating,
      feedback,
      timestamp: new Date().toISOString(),
    };

    const satisfactionLevel =
      {
        5: "Rất hài lòng",
        4: "Hài lòng",
        3: "Bình thường",
        2: "Không hài lòng",
        1: "Rất không hài lòng",
      }[rating] || "Không xác định";

    const subject = "FEEDBACK VỀ EXTENSION IUH Grade Guard";
    const emailBody = `
=== FEEDBACK VỀ EXTENSION IUH GRADE GUARD ===

Đánh giá: ${rating}/5 sao
Mức độ hài lòng: ${satisfactionLevel}

💬 Nội dung phản hồi:
${feedback || "Không có nội dung phản hồi cụ thể"}

Thời gian gửi: ${new Date(feedbackData.timestamp).toLocaleString("vi-VN")}

---
Gửi từ IUH Grade Guard Extension
  `.trim();

    try {
      if (typeof chrome !== "undefined" && chrome.storage) {
        chrome.storage.local.get(["user_feedbacks"], (result) => {
          const existing = result.user_feedbacks || [];
          existing.push(feedbackData);
          chrome.storage.local.set({ user_feedbacks: existing });
        });
      } else {
        const existing = JSON.parse(
          localStorage.getItem("user_feedbacks") || "[]"
        );
        existing.push(feedbackData);
        localStorage.setItem("user_feedbacks", JSON.stringify(existing));
      }
      setRating(0);
      setFeedback("");
      // Mở Gmail compose URL
      const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=hgnd27811.dev@gmail.com&su=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(emailBody)}`;

      window.open(gmailComposeUrl, "_blank");

    } catch (error) {
      console.log("Lỗi khi mở email:", error);

      // const confirmManualSend = confirm(
      //   "Không thể mở Gmail tự động.\n\n" +
      //     "Bạn có muốn sao chép thông tin để gửi email thủ công không?\n\n" +
      //     "Nhấn 'OK' để sao chép thông tin email vào clipboard."
      // );

//       if (confirmManualSend) {
//         const manualEmailContent = `
// Email: hgnd27811.dev@gmail.com
// Tiêu đề: ${subject}

// 📄 Nội dung:
// ${emailBody}
//       `.trim();

//         if (navigator.clipboard?.writeText) {
//           navigator.clipboard
//             .writeText(manualEmailContent)
//             .then(() => {
//               alert(
//                 "📋 Đã sao chép thông tin email vào clipboard!\n\n" +
//                   "Bạn có thể mở Gmail hoặc ứng dụng email và dán (Ctrl+V) để gửi."
//               );
//               setRating(0);
//               setFeedback("");
//             })
//             .catch(() => {
//               showManualEmailInfo(manualEmailContent);
//             });
//         } else {
//           showManualEmailInfo(manualEmailContent);
//         }
//       }
    }

    // Hàm fallback nếu không sao chép được
    // function showManualEmailInfo(content) {
    //   alert(
    //     "Vui lòng sao chép thông tin sau để gửi email thủ công:\n\n" +
    //       content +
    //       "\n\n" +
    //       "Bạn có thể select all (Ctrl+A) và copy (Ctrl+C) từ console log."
    //   );
    //   console.log("=== THÔNG TIN EMAIL FEEDBACK ===");
    //   console.log(content);
    //   console.log("=== KẾT THÚC ===");
    //   setRating(0);
    //   setFeedback("");
    // }
  };

  const handleClearForm = () => {
    setRating(0);
    setFeedback("");
    setHoverRating(0);
  };

  const handlePrivacyPolicy = () => {
    setShowPrivacyPolicy(true);
    document.body.style.overflow = "hidden";
  };
  React.useEffect(() => {
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);
  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((star) => {
      return React.createElement(
        "span",
        {
          key: star,
          className: "star",
          style: {
            fontSize: "24px",
            color: star <= (hoverRating || rating) ? "#fbbf24" : "#d1d5db",
            cursor: "pointer",
            margin: "0 2px",
            transition: "color 0.2s ease",
          },
          onClick: () => handleRatingClick(star),
          onMouseEnter: () => setHoverRating(star),
          onMouseLeave: () => setHoverRating(0),
        },
        "★"
      );
    });
  };

  return React.createElement(
    "div",
    {
      className: "page-content",
      style: {
        color: "#fff",
        minHeight: "100vh",
        padding: "24px",
      },
    },
    React.createElement(
      "div",
      {
        className: "semester-title",
        style: {
          borderRadius: "12px",
          padding: "32px",
          marginBottom: "24px",
        },
      },
      React.createElement(
        "h1",
        {
          style: {
            fontSize: "32px",
            fontWeight: "700",
            marginBottom: "16px",
            textAlign: "center",
          },
        },
        "🎓 IUH Grade Guard"
      ),
      React.createElement(
        "p",
        {
          style: {
            fontSize: "18px",
            lineHeight: "1.6",
            textAlign: "center",
            opacity: 0.9,
          },
        },
        "Tiện ích hỗ trợ sinh viên Trường Đại học Công Nghiệp TP. Hồ Chí Minh trong việc theo dõi, trực quan hóa kết quả học tập, tính toán điểm số và lập kế hoạch học tập hiệu quả theo từng học kỳ."
      )
    ),

    React.createElement(
      "div",
      {
        className: "card",
        style: {
          borderRadius: "12px",
          padding: "24px",
          marginBottom: "24px",
        },
      },
      React.createElement(
        "h2",
        {
          className: "card-title",
          style: {
            fontSize: "24px",
            fontWeight: "700",
            marginBottom: "20px",
            color: "#3b82f6",
          },
        },
        "Các chức năng chính"
      ),
      React.createElement(
        "div",
        {
          style: {
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "16px",
          },
        },
        [
          {
            icon: "📊",
            title: "Overview",
            description:
              "Trực quan hóa kết quả học tập thông qua biểu đồ sinh động, giúp sinh viên nắm bắt tổng thể quá trình học của mình.",
          },
          {
            icon: "📚",
            title: "View Learning Results",
            description:
              "Hiển thị bảng điểm học tập theo từng học kỳ. Tại đây, sinh viên có thể tính điểm quá trình để xây dựng chiến lược học phù hợp cho từng môn học.",
          },
          {
            icon: "📅",
            title: "Study Plan",
            description:
              "Cho phép xem tổng điểm đã tích lũy và lập kế hoạch học tập cho các học phần trong tương lai, từ đó định hướng mục tiêu rõ ràng hơn.",
          },
        ].map((feature, index) =>
          React.createElement(
            "div",
            {
              key: index,
              style: {
                background: "#f8fafc",
                borderRadius: "8px",
                padding: "16px",
                border: "1px solid #e2e8f0",
              },
            },
            React.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "8px",
                },
              },
              React.createElement(
                "span",
                {
                  style: { fontSize: "20px", marginRight: "8px" },
                },
                feature.icon
              ),
              React.createElement(
                "h3",
                {
                  style: {
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#1e293b",
                    margin: 0,
                  },
                },
                feature.title
              )
            ),
            React.createElement(
              "p",
              {
                style: {
                  fontSize: "14px",
                  color: "#64748b",
                  lineHeight: "1.5",
                  margin: 0,
                },
              },
              feature.description
            )
          )
        )
      )
    ),

    React.createElement(
      "div",
      {
        className: "card",
        style: {
          borderRadius: "12px",
          padding: "24px",
          marginBottom: "24px",
        },
      },
      React.createElement(
        "h2",
        {
          className: "card-title",
          style: {
            fontSize: "24px",
            fontWeight: "700",
            marginBottom: "16px",
            color: "#ef4444",
          },
        },
        "Hướng dẫn sử dụng"
      ),
      React.createElement(
        "div",
        {
          style: {
            textAlign: "center",
            padding: "20px",
          },
        },
        React.createElement(
          "a",
          {
            href: "https://youtube.com",
            target: "_blank",
            style: {
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "#ef4444",
              color: "white",
              padding: "12px 24px",
              borderRadius: "8px",
              textDecoration: "none",
              fontSize: "16px",
              fontWeight: "600",
              transition: "background-color 0.3s ease",
            },
            onMouseOver: (e) => (e.target.style.backgroundColor = "#dc2626"),
            onMouseOut: (e) => (e.target.style.backgroundColor = "#ef4444"),
          },
          "Xem hướng dẫn trên YouTube"
        )
      )
    ),

    React.createElement(
      "div",
      {
        className: "card",
        style: {
          borderRadius: "12px",
          padding: "24px",
          marginBottom: "24px",
        },
      },
      React.createElement(
        "h2",
        {
          className: "card-title",
          style: {
            fontSize: "24px",
            fontWeight: "700",
            marginBottom: "16px",
            color: "#6366f1",
          },
        },
        "🔒 Chính sách bảo mật"
      ),
      React.createElement(
        "p",
        {
          style: {
            fontSize: "16px",
            color: "#64748b",
            marginBottom: "20px",
            lineHeight: "1.5",
          },
        },
        "Chúng tôi cam kết bảo vệ quyền riêng tư và dữ liệu của bạn. Tìm hiểu cách chúng tôi thu thập, sử dụng và bảo vệ thông tin của bạn."
      ),
      React.createElement(
        "div",
        {
          style: {
            textAlign: "center",
            padding: "20px",
          },
        },
        React.createElement(
          "button",
          {
            onClick: handlePrivacyPolicy,
            style: {
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "#059669",
              color: "white",
              padding: "12px 24px",
              borderRadius: "8px",
              border: "none",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "background-color 0.3s ease",
            },
          },
          "Xem chính sách bảo mật"
        )
      )
    ),

    React.createElement(
      "div",
      {
        className: "card",
        style: {
          borderRadius: "12px",
          padding: "24px",
          marginBottom: "24px",
        },
      },
      React.createElement(
        "h2",
        {
          className: "card-title",
          style: {
            fontSize: "24px",
            fontWeight: "700",
            marginBottom: "20px",
            color: "#8b5cf6",
          },
        },
        "👥 Nhóm phát triển"
      ),
      React.createElement(
        "div",
        {
          style: {
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
          },
        },
        teamMembers.map((member, index) =>
          React.createElement(
            "div",
            {
              key: index,
              style: {
                background: "#f8fafc",
                borderRadius: "8px",
                padding: "16px",
                textAlign: "center",
                border: "1px solid #e2e8f0",
              },
            },
            React.createElement("img", {
              src: member.avatar,
              alt: member.name,
              style: {
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                objectFit: "cover",
                marginBottom: "12px",
              },
            }),
            React.createElement(
              "h3",
              {
                style: {
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "#1e293b",
                  margin: 0,
                },
              },
              member.name
            )
          )
        )
      )
    ),

    React.createElement(
      "div",
      {
        className: "card",
        style: {
          borderRadius: "12px",
          padding: "24px",
        },
      },
      React.createElement(
        "h2",
        {
          className: "card-title",
          style: {
            fontSize: "24px",
            fontWeight: "700",
            marginBottom: "16px",
            color: "#059669",
          },
        },
        "Feedback"
      ),
      React.createElement(
        "p",
        {
          style: {
            fontSize: "16px",
            color: "#64748b",
            marginBottom: "20px",
            lineHeight: "1.5",
          },
        },
        "Hãy cho chúng tôi phản hồi và đóng góp của bạn. Chúng tôi vẫn luôn theo dõi và lắng nghe những đóng góp của bạn để góp phần cải thiện tiện ích này."
      ),

      React.createElement(
        "div",
        {
          style: { marginBottom: "20px" },
        },
        React.createElement(
          "label",
          {
            style: {
              display: "block",
              fontSize: "16px",
              fontWeight: "600",
              color: "#374151",
              marginBottom: "8px",
            },
          },
          "Đánh giá:"
        ),
        React.createElement(
          "div",
          {
            style: {
              display: "flex",
              alignItems: "center",
              gap: "8px",
            },
          },
          renderStars(),
          React.createElement(
            "span",
            {
              style: {
                marginLeft: "8px",
                color: "#6b7280",
                fontSize: "14px",
              },
            },
            rating > 0 ? `${rating}/5 sao` : "Chọn số sao"
          )
        )
      ),

      React.createElement(
        "div",
        {
          style: { marginBottom: "20px" },
        },
        React.createElement(
          "label",
          {
            style: {
              display: "block",
              fontSize: "16px",
              fontWeight: "600",
              color: "#374151",
              marginBottom: "8px",
            },
          },
          "Phản hồi:"
        ),
        React.createElement("textarea", {
          value: feedback,
          onChange: (e) => setFeedback(e.target.value),
          placeholder: "Chia sẻ ý kiến, góp ý của bạn sau khi trải nghiệm...",
          style: {
            width: "100%",
            minHeight: "100px",
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #d1d5db",
            fontSize: "14px",
            fontFamily: "inherit",
            resize: "vertical",
            outline: "none",
            transition: "border-color 0.2s ease",
          },
          onFocus: (e) => (e.target.style.borderColor = "#3b82f6"),
          onBlur: (e) => (e.target.style.borderColor = "#d1d5db"),
        })
      ),

      React.createElement(
        "div",
        {
          style: {
            display: "flex",
            gap: "12px",
            justifyContent: "flex-end",
          },
        },
        React.createElement(
          "button",
          {
            onClick: handleClearForm,
            style: {
              padding: "10px 20px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              background: "white",
              color: "#374151",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.2s ease",
            },
            onMouseOver: (e) => {
              e.target.style.backgroundColor = "#f9fafb";
              e.target.style.borderColor = "#9ca3af";
            },
            onMouseOut: (e) => {
              e.target.style.backgroundColor = "white";
              e.target.style.borderColor = "#d1d5db";
            },
          },
          "Làm mới"
        ),
        React.createElement(
          "button",
          {
            onClick: handleSubmitFeedback,
            style: {
              padding: "10px 20px",
              borderRadius: "8px",
              border: "none",
              background: "#059669",
              color: "white",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              transition: "background-color 0.2s ease",
            },
            onMouseOver: (e) => (e.target.style.backgroundColor = "#047857"),
            onMouseOut: (e) => (e.target.style.backgroundColor = "#059669"),
          },
          "Gửi phản hồi"
        )
      ),

      // Add Privacy Policy Modal at the end
      showPrivacyPolicy &&
        React.createElement(PrivacyPolicyModal, {
          isOpen: showPrivacyPolicy,
          onClose: () => {
            setShowPrivacyPolicy(false);
            document.body.style.overflow = "auto";
          },
        })
    )
  );
}

window.AboutUsPageContent = AboutUsPageContent;
