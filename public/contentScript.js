/* eslint-disable */
//Lấy điểm
(function () {
  if (
    !window.location.href.toLowerCase().includes("diem") &&
    !document.getElementById("xemDiem")
  ) {
    return;
  }

  function getTableHeaders(table) {
    const thead = table.querySelector("thead");
    const rows = Array.from(thead.querySelectorAll("tr"));
    const matrix = [];
    let maxCol = 0;

    rows.forEach((row, rowIndex) => {
      let colIndex = 0;
      matrix[rowIndex] = matrix[rowIndex] || [];
      Array.from(row.children).forEach((cell) => {
        while (matrix[rowIndex][colIndex]) colIndex++;
        const rowspan = parseInt(cell.getAttribute("rowspan") || 1, 10);
        const colspan = parseInt(cell.getAttribute("colspan") || 1, 10);
        for (let i = 0; i < rowspan; i++) {
          for (let j = 0; j < colspan; j++) {
            matrix[rowIndex + i] = matrix[rowIndex + i] || [];
            matrix[rowIndex + i][colIndex + j] = {
              text: cell.innerText.trim().replace(/"/g, ""),
              cell,
              row: rowIndex,
              col: colIndex,
            };
          }
        }
        colIndex += colspan;
        if (colIndex > maxCol) maxCol = colIndex;
      });
    });

    const headers = [];
    for (let col = 0; col < maxCol; col++) {
      let parts = [];
      for (let row = 0; row < matrix.length; row++) {
        const cell = matrix[row][col];
        if (
          cell &&
          cell.text &&
          (!parts.length || cell.text !== parts[parts.length - 1])
        ) {
          parts.push(cell.text);
        }
      }
      let header = parts.join(" ").replace(/\s+/g, " ").trim();
      headers.push(header);
    }
    return headers;
  }

  function exportTableToJson() {
    const table = document.getElementById("xemDiem");
    if (!table) {
      return;
    }
    const headers = getTableHeaders(table);
    const bodyRows = Array.from(table.querySelectorAll("tbody tr"));

    const result = [];
    let currentSemester = null;

    bodyRows.forEach((tr) => {
      const cells = Array.from(tr.querySelectorAll("td"));
      const obj = {};
      cells.forEach((td, i) => {
        if (headers[i]) obj[headers[i]] = td.innerText.trim();
      });

      if (
        obj["Mã lớp học phần"] === "" ||
        obj["Mã lớp học phần"] === undefined
      ) {
        const semesterName = obj["Tên môn học"] || obj["STT"];
        if (
          currentSemester &&
          currentSemester.hocKy &&
          currentSemester.monHoc.length > 0 &&
          semesterName !== currentSemester.hocKy
        ) {
          result.push(currentSemester);
          currentSemester = null;
        }
        if (!semesterName) return;
        if (!currentSemester || semesterName !== currentSemester.hocKy) {
          currentSemester = {
            hocKy: semesterName,
            monHoc: [],
          };
        }
      } else if (currentSemester) {
        currentSemester.monHoc.push(obj);
      }
    });

    if (
      currentSemester &&
      currentSemester.hocKy &&
      currentSemester.monHoc.length > 0 &&
      (result.length === 0 ||
        currentSemester.hocKy !== result[result.length - 1].hocKy)
    ) {
      result.push(currentSemester);
    }

    if (result.length > 0) {
      chrome.storage.local.set(
        {
          diem_json: JSON.stringify(result, null, 2),
          diem_timestamp: Date.now(),
        },
        function () {
          chrome.runtime.sendMessage({
            type: "GRADES_SAVED",
            data: result,
          });
        }
      );

      return true;
    } else {
      console.log("Không có dữ liệu điểm để lưu");
    }
  }

  window.addEventListener("load", () => {
    setTimeout(exportTableToJson, 500);
  });
})();

//Lấy lịch học
if (window.location.href.includes("lich-hoc-theo-tuan.html")) {
  function checkPageConditions() {
    const conditions = {
      hasJQuery: typeof jQuery !== "undefined",
      hasKey: !!new URLSearchParams(window.location.search).get("k"),
      isReady: document.readyState === "complete",
    };
    return conditions;
  }

  let loadAttempts = 0;
  const maxLoadAttempts = 8;

  function attemptLoadSchedule() {
    loadAttempts++;
    const conditions = checkPageConditions();
    if (conditions.hasKey) {
      loadScheduleData();
      return;
    }
  }
  setTimeout(attemptLoadSchedule, 1000);
}

function loadScheduleData() {
  try {
    window.ketQuaMang = [];

    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);

    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("k");

    if (!token) {
      console.log("Không tìm thấy token");
      return;
    }

    loadWithFetch(startDate.toISOString(), 12, 0, token, () => {
      processAndSaveScheduleData();
    });
  } catch (error) {
    console.log("Lỗi khi tải dữ liệu lịch học:", error);
  }
}
function loadWithFetch(startDate, soTuan, loaiLich, token, callback) {
  const promises = [];
  const baseDate = new Date(startDate);

  for (let i = 0; i < soTuan; i++) {
    const ngay = new Date(baseDate.getTime() + i * 7 * 24 * 60 * 60 * 1000);
    const ngayISO = ngay.toISOString();

    console.log(
      `Fetch request tuần ${i + 1}, ngày: ${ngay.toLocaleDateString()}`
    );

    const formData = new FormData();
    formData.append("k", token);
    formData.append("pNgayHienTai", ngayISO);
    formData.append("pLoaiLich", loaiLich.toString());

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const promise = fetch("/SinhVienTraCuu/GetDanhSachLichTheoTuan", {
      method: "POST",
      body: formData,
      headers: {
        "X-Requested-With": "XMLHttpRequest",
      },
      signal: controller.signal,
      keepalive: true,
    })
      .then((response) => {
        clearTimeout(timeoutId);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
      })
      .then((data) => {
        const result = {
          tuan: i + 1,
          ngayBatDau: ngayISO,
          duLieu: data,
          loaiLich: loaiLich,
        };
        window.ketQuaMang.push(result);
        if (window.DEBUG_MODE) {
          console.log(window.ketQuaMang);
        }

        return result;
      })
      .catch((err) => {
        clearTimeout(timeoutId);
        return null;
      });

    promises.push(promise);
  }

  Promise.allSettled(promises)
    .then((results) => {
      const successfulResults = results
        .filter(
          (result) => result.status === "fulfilled" && result.value !== null
        )
        .map((result) => result.value);

      console.log(`Hoàn thành ${successfulResults.length}/${soTuan} requests`);

      if (callback) {
        callback(successfulResults);
      }
    })
    .catch((error) => {
      console.error("Lỗi rồi:)", error);
      if (callback) callback([]);
    });
}
function parseLichHocFromHTML(htmlString) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, "text/html");

  const headerCells = Array.from(doc.querySelectorAll("thead tr th")).slice(1);
  const rows = doc.querySelectorAll("tbody tr");
  const ketQua = [];

  rows.forEach((row, rowIndex) => {
    const caHoc = row.querySelector("td b")?.textContent.trim() || "";
    const cells = row.querySelectorAll("td");

    cells.forEach((cell, colIndex) => {
      if (colIndex === 0) return;

      const buoiHocList = cell.querySelectorAll(".content");
      buoiHocList.forEach((buoiHoc) => {
        const nameSubject =
          buoiHoc.querySelector("a")?.textContent.trim() || "";
        const paragraphs = buoiHoc.querySelectorAll("p");

        const className = paragraphs[0]?.textContent.trim() || "";
        const time = paragraphs[1]?.textContent.trim() || "";
        const room =
          paragraphs[2]?.textContent.trim().replace(/^Phòng:\s*/, "") || "";
        const teacher =
          paragraphs[3]?.textContent.trim().replace(/^GV:\s*/, "") || "";

        const type = buoiHoc.classList.contains("color-lichhoc")
          ? "lich_hoc"
          : "lich_thi";

        const rawHeader = headerCells[colIndex - 1]?.innerHTML || "";
        const thuVaNgay = rawHeader
          .replace(/<br\s*\/?>/gi, " ")
          .replace(/\s+/g, " ")
          .trim();

        if (nameSubject) {
          ketQua.push({
            caHoc: `${thuVaNgay} - ${caHoc}`,
            nameSubject,
            class: className,
            time,
            room,
            teacher,
            type,
          });
        }
      });
    });
  });
  return ketQua;
}

function processAndSaveScheduleData() {
  try {
    if (!window.ketQuaMang || window.ketQuaMang.length === 0) {
      return;
    }

    const tatCaTietHoc = window.ketQuaMang.flatMap((tuan) =>
      parseLichHocFromHTML(tuan.duLieu)
    );

    const lichHoc = tatCaTietHoc.filter((t) => t.type === "lich_hoc");
    const lichThi = tatCaTietHoc.filter((t) => t.type === "lich_thi");

    const scheduleData = {
      lichHoc: lichHoc,
      lichThi: lichThi,
      tongSo: tatCaTietHoc.length,
      capNhatLuc: new Date().toISOString(),
    };

    chrome.storage.local.set(
      {
        schedule_json: JSON.stringify(scheduleData),
        schedule_timestamp: Date.now(),
      },
      function () {
        if (chrome.runtime.lastError) {
          console.error("Lỗi lưu dữ liệu:", chrome.runtime.lastError);
          return;
        }

        chrome.runtime.sendMessage(
          {
            type: "SCHEDULE_SAVED",
            data: scheduleData,
          },
          (response) => {
            if (chrome.runtime.lastError) {
              console.log("Lỗi", chrome.runtime.lastError.message);
            } else {
              console.log("Đã gửi message");
            }
          }
        );
      }
    );
  } catch (error) {
    console.log("Lỗi trong processAndSaveScheduleData:", error);
  }
}

//Lấy chương tình khung trong trang sv.iuh
//Chuyển trang sang chương trình khung khi người dùng đăng nhập sv.iuh
(function () {
  if (window.location.href.includes("dashboard.html")) {
    chrome.storage.local.get(
      ["curriculum_json", "curriculum_timestamp"],
      function (result) {
        const hasCurriculumData =
          result.curriculum_json && result.curriculum_json.length > 0;
        const lastUpdate = result.curriculum_timestamp || 0;
        const now = Date.now();
        const oneDayInMs = 24 * 60 * 60 * 1000; // 24 giờ

        // Nếu chưa có dữ liệu hoặc dữ liệu quá cũ (hơn 24 giờ)
        if (!hasCurriculumData || now - lastUpdate > oneDayInMs) {
          const sessionKey = "curriculum_tab_opened";
          const hasOpenedThisSession = sessionStorage.getItem(sessionKey);

          if (!hasOpenedThisSession) {
            sessionStorage.setItem(sessionKey, "true");
            chrome.runtime.sendMessage(
              {
                type: "OPEN_CURRICULUM_TAB",
                url: "/chuong-trinh-khung.html",
              },
              (response) => {
                if (chrome.runtime.lastError) {
                  console.log(
                    "Lỗi gửi message:",
                    chrome.runtime.lastError.message
                  );
                }
              }
            );
          }
        }
      }
    );
  }
})();

(function () {
  if (!window.location.href.includes("chuong-trinh-khung.html")) {
    return;
  }

  function parseCurriculumData() {
    const table = document.querySelector("#viewChuongTrinhKhung table");
    if (!table) {
      return null;
    }

    const result = [];
    const tbody = table.querySelectorAll("tbody");

    tbody.forEach((body) => {
      const semesterHeader = body.querySelector(".row-head:first-child");
      if (!semesterHeader) return;

      const semesterText = semesterHeader
        .querySelector("td")
        ?.textContent?.trim();
      if (!semesterText) return;

      const semester = {
        hocKy: semesterText,
        monHoc: [],
        soTCTC: 0,
      };

      const tuChonDiv = body.querySelector('div[lang="ctk-hptuchon"]');
      if (tuChonDiv) {
        const tuChonRow = tuChonDiv.closest("tr");
        if (tuChonRow) {
          const tcCell = tuChonRow.querySelector("td:nth-child(2) span");
          if (tcCell) {
            const tcValue = tcCell.textContent?.trim();
            semester.soTCTC = parseInt(tcValue) || 0;
          }
        }
      }

      const subjectRows = body.querySelectorAll("tr:not(.row-head)");

      subjectRows.forEach((row) => {
        const cells = row.querySelectorAll("td");
        if (cells.length < 10) return;

        const stt = cells[0]?.textContent?.trim();
        if (!stt || isNaN(parseInt(stt))) return;

        const tenMonElement = cells[1]?.querySelector("div");
        const tenMon = tenMonElement?.textContent?.trim().replace(/\s+/g, " ");
        if (!tenMon) return;

        const maHocPhan = cells[2]?.querySelector("div")?.textContent?.trim();
        const soTC = cells[4]?.querySelector("div")?.textContent?.trim();
        const soTLT = cells[5]?.querySelector("div")?.textContent?.trim();
        const soTTH = cells[6]?.querySelector("div")?.textContent?.trim();
        const nhomTC = cells[7]?.querySelector("div")?.textContent?.trim();
        const soTCBB = cells[8]?.querySelector("div")?.textContent?.trim();

        let trangThai = "Chưa học";
        const statusCell = cells[9]?.querySelector("div");
        if (statusCell) {
          const hasCheck = statusCell.querySelector(".check");
          if (hasCheck) {
            trangThai = "Đạt";
          } else {
            trangThai = "Chưa học";
          }
        }

        const monHoc = {
          tenMon: tenMon || "",
          maHocPhan: maHocPhan || "",
          soTC: soTC || "0",
          soTLT: soTLT || "0",
          soTTH: soTTH || "0",
          nhomTC: nhomTC || "0",
          soTCBB: soTCBB || "",
          trangThai: trangThai,
        };

        semester.monHoc.push(monHoc);
      });

      if (semester.monHoc.length > 0) {
        result.push(semester);
      }
    });

    return result;
  }

  function saveCurriculumData() {
    try {
      const curriculumData = parseCurriculumData();

      if (!curriculumData || curriculumData.length === 0) {
        return false;
      }

      chrome.storage.local.set(
        {
          curriculum_json: JSON.stringify(curriculumData, null, 2),
          curriculum_timestamp: Date.now(),
        },
        function () {
          if (chrome.runtime.lastError) {
            return;
          }
        }
      );

      return true;
    } catch (error) {
      console.error("Lỗi trong saveCurriculumData:", error);
      return false;
    }
  }
  // Kiểm tra xem có phải tab được mở tự động không
  const urlParams = new URLSearchParams(window.location.search);
  const isAutoOpened =
    urlParams.get("auto") === "true";
  window.addEventListener("load", () => {
    setTimeout(() => {
      const success = saveCurriculumData();

      if (isAutoOpened) {
        setTimeout(() => {
          window.close();
        }, 500);
      }
    }, 500);
  });

  if (document.readyState === "complete") {
    setTimeout(() => {
      const success = saveCurriculumData();

      if ( isAutoOpened) {
        setTimeout(() => {
          window.close();
        }, 500);
      }
    }, 500);
  }
})();

//Tự động điền khảo sát
(function () {
  "use strict";

  if (window.location.href.includes("chi-tiet-phieu-khao-sat.html")) {
    const autoFillSurvey = () => {
      try {
        document.querySelectorAll(".group-cautraloi").forEach((group) => {
          const liItem = group.children[4];
          if (liItem && liItem.children[0] && liItem.children[0].children[0]) {
            liItem.children[0].children[0].checked = true;
          }
        });

        // Điền ý kiến
        const yKienInput = document.querySelector(".input-ykien");
        if (yKienInput) {
          yKienInput.value = "Em không có ý kiến gì thêm";
        }

        // Gửi khảo sát
        const submitBtn = document.querySelector("#btnGui");
        if (submitBtn) {
          submitBtn.click();
        }
      } catch (error) {
        return;
      }
    };

    if (document.readyState === "complete") {
      setTimeout(autoFillSurvey, 1000);
    } else {
      window.addEventListener("load", () => {
        setTimeout(autoFillSurvey, 1000);
      });
    }
  } else if (window.location.href.includes("khao-sat.html")) {
    const survey = document.querySelector(".title");
    if (survey) {
      survey.click();
    } else {
      const dashboardLink = document.querySelector('a[href="/dashboard.html"]');
      if (dashboardLink) {
        dashboardLink.click();
      }
    }
  }
})();
