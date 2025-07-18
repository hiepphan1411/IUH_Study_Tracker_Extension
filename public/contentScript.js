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
    setTimeout(exportTableToJson, 2000);
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

    loadWithFetch(startDate.toISOString(), 4, 0, token, () => {
      processAndSaveScheduleData();
    });
  } catch (error) {
    console.log("Lỗi khi tải dữ liệu lịch học:", error);
  }
}

// function loadWithFetch(startDate, soTuan, loaiLich, token, callback) {
//   const promises = [];

//   for (let i = 0; i < soTuan; i++) {
//     const ngay = new Date(startDate);
//     ngay.setDate(ngay.getDate() + i * 7);

//     console.log(
//       `Fetch request tuần ${i + 1}, ngày: ${ngay.toLocaleDateString()}`
//     );

//     const formData = new FormData();
//     formData.append("k", token);
//     formData.append("pNgayHienTai", ngay.toISOString());
//     formData.append("pLoaiLich", loaiLich.toString());

//     const promise = fetch("/SinhVienTraCuu/GetDanhSachLichTheoTuan", {
//       method: "POST",
//       body: formData,
//       headers: {
//         "X-Requested-With": "XMLHttpRequest",
//       },
//     })
//       .then((response) => {
//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }
//         return response.text();
//       })
//       .then((data) => {
//         window.ketQuaMang.push({
//           tuan: i + 1,
//           ngayBatDau: ngay.toISOString(),
//           duLieu: data,
//           loaiLich: loaiLich,
//         });
//         console.log(window.ketQuaMang);
//       })
//       .catch((err) => {
//         console.log(`Fetch lỗi tuần ${i + 1}:`, err);
//       });

//     promises.push(promise);
//   }
//   Promise.all(promises)
//     .then(() => {
//       if (callback) {
//         callback();
//       }
//     })
//     .catch((error) => {
//       if (callback) callback();
//     });
// }

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
  console.log("Chạy!");
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
  console.log("Chạy xongg!");
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

    console.log("Dữ liệu đã lấy: ", scheduleData);

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

// //Example lịch học
// <style>
//     .box-zoom a {
//         font-size: 11px;
//         padding: 2px 5px;
//         margin-top: 15px !important;
//         width: 100%;
//     }

//         .box-zoom a:hover {
//             background-color: #f36a5a !important;
//             border-color: red !important;
//         }

//     .box-zoom i {
//         font-size: 11px !important;
//     }
// </style>
//     <div class="table-responsive">
//         <table class="fl-table table table-bordered text-center no-footer dtr-inline" width="100%" role="grid">
//             <thead>
//                 <tr role="row">
//                     <th>Ca học</th>
//                     <th>Thứ 2<br>19/05/2025</th>
//                     <th>Thứ 3<br>20/05/2025</th>
//                     <th>Thứ 4<br>21/05/2025</th>
//                     <th>Thứ 5<br>22/05/2025</th>
//                     <th>Thứ 6<br>23/05/2025</th>
//                     <th>Thứ 7<br>24/05/2025</th>
//                     <th>Chủ nhật<br>25/05/2025</th>
//                 </tr>
//             </thead>
//             <tbody>
//                 <tr role="row">
//                     <td><b>Sáng</b></td>
//                             <td></td>
//                             <td>
//                                         <div class="content  text-left" data-bg="177762" style=text-align:left>

//                                             <b><a href="/sinh-vien/page-lhp.html?g=k_A8pDDrof_xO9scw_shI4lwVpX_6VktmjYXr2AEbB8" target="_blank">Lập tr&#236;nh ph&#226;n t&#225;n với c&#244;ng nghệ Java</a></b>

//                                             <p>DHKTPM18C - 420300214603</p>

//                                             <p>Tiết: 2 - 6<br /></p>
//                                             <p>
//                                                 <span> Phòng: H8.02</span>
//                                             </p>

//                                             <p>GV: Ch&#226;u Thị Bảo H&#224;,Trương Ho&#224;ng Duy</p>

//                                         </div>
//                                         <div class="content  text-left" data-bg="177763" style=text-align:left>

//                                             <b><a href="/sinh-vien/page-lhp.html?g=k_A8pDDrof_xO9scw_shI4lwVpX_6VktmjYXr2AEbB8" target="_blank">Lập tr&#236;nh ph&#226;n t&#225;n với c&#244;ng nghệ Java</a></b>

//                                             <p>DHKTPM18C - 420300214603</p>

//                                             <p>Tiết: 2 - 6<br /></p>
//                                             <p>
//                                                 <span> Phòng: H8.03</span>
//                                             </p>

//                                             <p>GV: Phạm Thị Quy&#234;n,Trần Thế Trung</p>

//                                         </div>
//                                         <div class="content  text-left" data-bg="177764" style=text-align:left>

//                                             <b><a href="/sinh-vien/page-lhp.html?g=k_A8pDDrof_xO9scw_shI4lwVpX_6VktmjYXr2AEbB8" target="_blank">Lập tr&#236;nh ph&#226;n t&#225;n với c&#244;ng nghệ Java</a></b>

//                                             <p>DHKTPM18C - 420300214603</p>

//                                             <p>Tiết: 2 - 6<br /></p>
//                                             <p>
//                                                 <span> Phòng: H9.02</span>
//                                             </p>

//                                             <p>GV: Nguyễn Thị Diệu Hạnh,Nguyễn Thị Hồng Lương</p>

//                                         </div>
//                                         <div class="content  text-left" data-bg="177765" style=text-align:left>

//                                             <b><a href="/sinh-vien/page-lhp.html?g=k_A8pDDrof_xO9scw_shI4lwVpX_6VktmjYXr2AEbB8" target="_blank">Lập tr&#236;nh ph&#226;n t&#225;n với c&#244;ng nghệ Java</a></b>

//                                             <p>DHKTPM18C - 420300214603</p>

//                                             <p>Tiết: 2 - 6<br /></p>
//                                             <p>
//                                                 <span> Phòng: H9.03</span>
//                                             </p>

//                                             <p>GV: Nguyễn Trọng Tiến,Phan Hồng T&#237;n</p>

//                                         </div>
//                             </td>
//                             <td></td>
//                             <td></td>
//                             <td></td>
//                             <td></td>
//                             <td></td>
//                 </tr>
//                 <tr role="row">
//                     <td><b>Chiều</b></td>
//                             <td></td>
//                             <td></td>
//                             <td></td>
//                             <td></td>
//                             <td></td>
//                             <td></td>
//                             <td>
//                                         <div class="content  text-left" style=text-align:left>

//                                             <b><a href="/sinh-vien/page-lhp.html?g=k_A8pDDrof_xO9scw_shI7uNzt1frvRVdvDgTs179w8" target="_blank">Ph&#225;t triển giao diện ứng dụng</a></b>

//                                             <p>DHKTPM18A - 420301541301</p>

//                                             <p>Tiết: 10 - 12<br /></p>
//                                             <p>
//                                                 <span> Phòng: H8.01</span>
//                                             </p>

//                                             <p>GV: Nguyễn Thị Th&#250;y Quy&#234;n,Nguyễn Trọng Tiến</p>

//                                         </div>
//                                         <div class="content  text-left" style=text-align:left>

//                                             <b><a href="/sinh-vien/page-lhp.html?g=k_A8pDDrof_xO9scw_shI7uNzt1frvRVdvDgTs179w8" target="_blank">Ph&#225;t triển giao diện ứng dụng</a></b>

//                                             <p>DHKTPM18A - 420301541301</p>

//                                             <p>Tiết: 10 - 12<br /></p>
//                                             <p>
//                                                 <span> Phòng: H8.02</span>
//                                             </p>

//                                             <p>GV: Đinh Thị Ho&#224;i Hương,Nguyễn Thị Hồng Lương</p>

//                                         </div>
//                                         <div class="content  text-left" style=text-align:left>

//                                             <b><a href="/sinh-vien/page-lhp.html?g=k_A8pDDrof_xO9scw_shI7uNzt1frvRVdvDgTs179w8" target="_blank">Ph&#225;t triển giao diện ứng dụng</a></b>

//                                             <p>DHKTPM18A - 420301541301</p>

//                                             <p>Tiết: 10 - 12<br /></p>
//                                             <p>
//                                                 <span> Phòng: H8.03</span>
//                                             </p>

//                                             <p>GV: Ch&#226;u Thị Bảo H&#224;,T&#244; Kiều Trinh</p>

//                                         </div>
//                                         <div class="content  text-left" style=text-align:left>

//                                             <b><a href="/sinh-vien/page-lhp.html?g=k_A8pDDrof_xO9scw_shI7uNzt1frvRVdvDgTs179w8" target="_blank">Ph&#225;t triển giao diện ứng dụng</a></b>

//                                             <p>DHKTPM18A - 420301541301</p>

//                                             <p>Tiết: 10 - 12<br /></p>
//                                             <p>
//                                                 <span> Phòng: H9.02</span>
//                                             </p>

//                                             <p>GV: Nguyễn Thị Diệu Hạnh,Nguyễn Thị Ho&#224;ng Kh&#225;nh</p>

//                                         </div>
//                             </td>
//                 </tr>
//                 <tr role="row">
//                     <td><b>Tối</b></td>
//                             <td></td>
//                             <td></td>
//                             <td></td>
//                             <td></td>
//                             <td></td>
//                             <td></td>
//                             <td></td>
//                 </tr>
//             </tbody>
//         </table>
//     </div>
//     <div class="tableGC">
//         <ul>
//             <li>
//                 <span class="colorSTLichHoc"></span>Lịch học
//             </li>
//             <li>
//                 <span class="colorSTLichHoc" style="background-color:#92d6ff;border-color: #1da1f2"></span><label lang="lichtheotuan-lichhoconline">Lịch học trực tuyến</label>
//             </li>
//             <li>
//                 <span class="colorSTLichThi"></span>Lịch thi
//             </li>
//             <li>
//                 <span class="colorSTTamNgung"></span>Lịch tạm ngưng
//             </li>
//         </ul>
//     </div>

// <input id="firstDatePrevOffWeek" name="firstDatePrevOffWeek" type="hidden" value="12/05/2025" />
// <input id="firstDateOffWeek" name="firstDateOffWeek" type="hidden" value="19/05/2025" />
// <input id="firstDateNextOffWeek" name="firstDateNextOffWeek" type="hidden" value="26/05/2025" />

// <script type="text/javascript">
//     function joinZoom(e) {
//         var joinZoomUrl = $(e).attr('data-joinZoomUrl');
//         var joinZoomUrl2 = $(e).attr('data-joinZoomUrl2'); // using https
//         var idLichHoc = $(e).attr('data-idLichHoc');

//         if (joinZoomUrl!=null && joinZoomUrl != '') {
//             $.ajax({
//                 type: "POST",
//                 url: "/SinhVien/JoinZoomClass",
//                 data: {
//                     param: { IDLichHoc: idLichHoc}, joinUrl : joinZoomUrl
//                 },
//                 beforeSend: function () {
//                     loadingZoom();
//                 },
//                 success: function (data) {
//                     removeLoading();
//                     if (data != null && data.Code === "00") {
//                         if (data.IsUsingIFrame) {
//                             window.open(joinZoomUrl2, '_blank');
//                         } else {
//                             window.open(joinZoomUrl, '_blank');
//                         }
//                     } else {
//                         showPopUpMessage(data.Message);
//                     }
//                 },
//                 fail: function (err) {
//                     removeLoading();
//                 }
//             });
//         } else {
//             showPopUpMessage('Phòng học chưa được khởi tạo');
//         }
//     }
//     function loadingZoom() {
//         var html = '<div id="loadingMask" class="k-loading-mask" style="width: 100%;height: 100%;top: 0px;left: 0px;z-index: 100000;display: block;background-color: #607d8b2b;"><i class="fa fa-spinner fa-pulse fa-3x fa-fw" style="position:absolute;top:10px;left:50%;color:#397FAE;margin-top:20%;margin-left:-45px;font-size:90px;"></i></div>';
//         $(html).appendTo(document.body);
//     }
//     function removeLoading() {
//         $( "#loadingMask" ).remove();
//     }
//     function showPopUpMessage(message) {
//         $('<div id="boxes" style="height: inherit !important;"><div id="dialog" class="window" style="height: inherit !important;position: fixed; width:350px; top: 50%; left: 50%; transform: translate(-50%, -50%); display: block;padding-bottom: 15px;"><div class="content"></div><div class="text-center"><button onclick="closePopup()" class="btn btn-sm btn-save">Đóng</button></div></div><div id="mask" style="width: 100%; height: 100vh; display: block; opacity: 0.9;"></div></div>').appendTo(document.body);
//         $('#boxes .content').html('<b>' + message + '</b>');
//     }
// </script>
// //Example lịch học

// <style>
//     .box-zoom a {
//         font-size: 11px;
//         padding: 2px 5px;
//         margin-top: 15px !important;
//         width: 100%;
//     }

//         .box-zoom a:hover {
//             background-color: #f36a5a !important;
//             border-color: red !important;
//         }

//     .box-zoom i {
//         font-size: 11px !important;
//     }
// </style>
//     <div class="table-responsive">
//         <table class="fl-table table table-bordered text-center no-footer dtr-inline" width="100%" role="grid">
//             <thead>
//                 <tr role="row">
//                     <th>Ca học</th>
//                     <th>Thứ 2<br>28/04/2025</th>
//                     <th>Thứ 3<br>29/04/2025</th>
//                     <th>Thứ 4<br>30/04/2025</th>
//                     <th>Thứ 5<br>01/05/2025</th>
//                     <th>Thứ 6<br>02/05/2025</th>
//                     <th>Thứ 7<br>03/05/2025</th>
//                     <th>Chủ nhật<br>04/05/2025</th>
//                 </tr>
//             </thead>
//             <tbody>
//                 <tr role="row">
//                     <td><b>Sáng</b></td>
//                             <td>
//                                         <div class="content color-lichhoc text-left" data-bg="2328144" style=text-align:left>

//                                             <b><a href="/sinh-vien/page-lhp.html?g=k_A8pDDrof_xO9scw_shI3lvaeMRWqxtVF7dn9hlIcQ" target="_blank">Nhập m&#244;n an to&#224;n th&#244;ng tin</a></b>

//                                             <p>DHKTPM18A - 420300100401</p>

//                                             <p>Tiết: 1 - 3<br /></p>
//                                             <p>
//                                                 <span> Phòng: A1.02 (A (CS1))</span>
//                                             </p>

//                                             <p>GV: L&#234; Trọng Hiền</p>

//                                         </div>
//                             </td>
//                             <td>
//                                         <div class="content color-lichhoc text-left" data-bg="2262030" style=text-align:left>

//                                             <b><a href="/sinh-vien/page-lhp.html?g=k_A8pDDrof_xO9scw_shI3UKjSgo-oaw9EfDMsCYm5k" target="_blank">C&#244;ng nghệ phần mềm</a></b>

//                                             <p>DHKTPM18A - 420300111101</p>

//                                             <p>Tiết: 4 - 6<br /></p>
//                                             <p>
//                                                 <span> Phòng: A3.02 (A (CS1))</span>
//                                             </p>

//                                             <p>GV: Nguyễn Thị Hạnh</p>

//                                                 <p>Ghi chú:  </p>

//                                         </div>
//                             </td>
//                             <td></td>
//                             <td></td>
//                             <td></td>
//                             <td></td>
//                             <td></td>
//                 </tr>
//                 <tr role="row">
//                     <td><b>Chiều</b></td>
//                             <td></td>
//                             <td>
//                                         <div class="content color-lichhoc text-left" style=text-align:left>

//                                             <b><a href="/sinh-vien/page-lhp.html?g=k_A8pDDrof_xO9scw_shI4lwVpX_6VktmjYXr2AEbB8" target="_blank">Lập tr&#236;nh ph&#226;n t&#225;n với c&#244;ng nghệ Java</a></b>

//                                             <p>DHKTPM18C - 420300214603</p>

//                                             <p>Tiết: 7 - 9<br /></p>
//                                             <p>
//                                                 <span> Phòng: H8.03 (H (CS1))</span>
//                                             </p>

//                                             <p>GV: Nguyễn Thị Ho&#224;ng Kh&#225;nh</p>

//                                         </div>
//                             </td>
//                             <td></td>
//                             <td></td>
//                             <td></td>
//                             <td></td>
//                             <td></td>
//                 </tr>
//                 <tr role="row">
//                     <td><b>Tối</b></td>
//                             <td></td>
//                             <td></td>
//                             <td></td>
//                             <td></td>
//                             <td></td>
//                             <td></td>
//                             <td></td>
//                 </tr>
//             </tbody>
//         </table>
//     </div>
//     <div class="tableGC">
//         <ul>
//             <li>
//                 <span class="colorSTLichHoc"></span>Lịch học
//             </li>
//             <li>
//                 <span class="colorSTLichHoc" style="background-color:#92d6ff;border-color: #1da1f2"></span><label lang="lichtheotuan-lichhoconline">Lịch học trực tuyến</label>
//             </li>
//             <li>
//                 <span class="colorSTLichThi"></span>Lịch thi
//             </li>
//             <li>
//                 <span class="colorSTTamNgung"></span>Lịch tạm ngưng
//             </li>
//         </ul>
//     </div>

// <input id="firstDatePrevOffWeek" name="firstDatePrevOffWeek" type="hidden" value="21/04/2025" />
// <input id="firstDateOffWeek" name="firstDateOffWeek" type="hidden" value="28/04/2025" />
// <input id="firstDateNextOffWeek" name="firstDateNextOffWeek" type="hidden" value="05/05/2025" />

// <script type="text/javascript">
//     function joinZoom(e) {
//         var joinZoomUrl = $(e).attr('data-joinZoomUrl');
//         var joinZoomUrl2 = $(e).attr('data-joinZoomUrl2'); // using https
//         var idLichHoc = $(e).attr('data-idLichHoc');

//         if (joinZoomUrl!=null && joinZoomUrl != '') {
//             $.ajax({
//                 type: "POST",
//                 url: "/SinhVien/JoinZoomClass",
//                 data: {
//                     param: { IDLichHoc: idLichHoc}, joinUrl : joinZoomUrl
//                 },
//                 beforeSend: function () {
//                     loadingZoom();
//                 },
//                 success: function (data) {
//                     removeLoading();
//                     if (data != null && data.Code === "00") {
//                         if (data.IsUsingIFrame) {
//                             window.open(joinZoomUrl2, '_blank');
//                         } else {
//                             window.open(joinZoomUrl, '_blank');
//                         }
//                     } else {
//                         showPopUpMessage(data.Message);
//                     }
//                 },
//                 fail: function (err) {
//                     removeLoading();
//                 }
//             });
//         } else {
//             showPopUpMessage('Phòng học chưa được khởi tạo');
//         }
//     }
//     function loadingZoom() {
//         var html = '<div id="loadingMask" class="k-loading-mask" style="width: 100%;height: 100%;top: 0px;left: 0px;z-index: 100000;display: block;background-color: #607d8b2b;"><i class="fa fa-spinner fa-pulse fa-3x fa-fw" style="position:absolute;top:10px;left:50%;color:#397FAE;margin-top:20%;margin-left:-45px;font-size:90px;"></i></div>';
//         $(html).appendTo(document.body);
//     }
//     function removeLoading() {
//         $( "#loadingMask" ).remove();
//     }
//     function showPopUpMessage(message) {
//         $('<div id="boxes" style="height: inherit !important;"><div id="dialog" class="window" style="height: inherit !important;position: fixed; width:350px; top: 50%; left: 50%; transform: translate(-50%, -50%); display: block;padding-bottom: 15px;"><div class="content"></div><div class="text-center"><button onclick="closePopup()" class="btn btn-sm btn-save">Đóng</button></div></div><div id="mask" style="width: 100%; height: 100vh; display: block; opacity: 0.9;"></div></div>').appendTo(document.body);
//         $('#boxes .content').html('<b>' + message + '</b>');
//     }
// </script>
//             });
//         } else {
//             showPopUpMessage('Phòng học chưa được khởi tạo');
//         }
//     }
//     function loadingZoom() {
//         var html = '<div id="loadingMask" class="k-loading-mask" style="width: 100%;height: 100%;top: 0px;left: 0px;z-index: 100000;display: block;background-color: #607d8b2b;"><i class="fa fa-spinner fa-pulse fa-3x fa-fw" style="position:absolute;top:10px;left:50%;color:#397FAE;margin-top:20%;margin-left:-45px;font-size:90px;"></i></div>';
//         $(html).appendTo(document.body);
//     }
//     function removeLoading() {
//         $( "#loadingMask" ).remove();
//     }
//     function showPopUpMessage(message) {
//         $('<div id="boxes" style="height: inherit !important;"><div id="dialog" class="window" style="height: inherit !important;position: fixed; width:350px; top: 50%; left: 50%; transform: translate(-50%, -50%); display: block;padding-bottom: 15px;"><div class="content"></div><div class="text-center"><button onclick="closePopup()" class="btn btn-sm btn-save">Đóng</button></div></div><div id="mask" style="width: 100%; height: 100vh; display: block; opacity: 0.9;"></div></div>').appendTo(document.body);
//         $('#boxes .content').html('<b>' + message + '</b>');
//     }
// </script>

//Lấy chương tình khung trong trang sv.iuh
// ...existing code...

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
      };

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
        return;
      }

      chrome.storage.local.set(
        {
          curriculum_json: JSON.stringify(curriculumData, null, 2),
          curriculum_timestamp: Date.now(),
        },
        function () {
          if (chrome.runtime.lastError) {
            console.log(
              "Lỗi lưu dữ liệu chương trình khung:",
              chrome.runtime.lastError
            );
            return;
          }

          //   chrome.runtime.sendMessage(
          //     {
          //       type: "CURRICULUM_SAVED",
          //       data: curriculumData,
          //     },
          //     (response) => {
          //       if (chrome.runtime.lastError) {
          //         console.log("Lỗi gửi message:", chrome.runtime.lastError.message);
          //       } else {
          //         console.log("Đã lưu và gửi dữ liệu chương trình khung thành công");
          //       }
          //     }
          //   );
        }
      );

      return true;
    } catch (error) {
      console.error("Lỗi trong saveCurriculumData:", error);
      return false;
    }
  }

  window.addEventListener("load", () => {
    setTimeout(() => {
      saveCurriculumData();
    }, 2000);
  });

  if (document.readyState === "complete") {
    setTimeout(() => {
      saveCurriculumData();
    }, 1000);
  }
})();

//Data sample
{
  /* <div class="col-md-10 col-xs-12">
    <div class="box-df">
        <div class="portlet">
            <div class="portlet-title">
                <div class="caption">
                    <span class="caption-subject bold" lang="ctk-pagetitle">Chương tr&#236;nh khung</span>
                </div>
                <div class="actions">
                    
                    <a href="javascript:;" class="btn btn-action" id="btn_InCongNo" onclick="PrintElem($('#id-chuong-trinh-khung'))" lang="ctk-btnIn">
                        <i class="fa fa-print" aria-hidden="true"></i>
                        In
                    </a>
                    <a href="javascript:;" class="btn btn-action" id="OpenAccordionAll">
                        <span class="glyphicon glyphicon-collapse-down" aria-hidden="true"></span>
                    </a>
                    <a href="javascript:;" class="btn btn-action" id="full-table">
                        <span class="glyphicon glyphicon-resize-full" aria-hidden="true"></span>
                    </a>
                </div>
            </div>
            <div class="portlet-body">
                <div class="clearfix"></div>
                <div class="table-responsive">
                    <div id="viewChuongTrinhKhung">
                        <table class="table-custom table table-bordered text-center no-footer dtr-inline" width="100%" role="grid">
                            <thead>
                                <tr role="row">
                                    <th class="sorting_disabled">STT</th>
                                    
                                    <th class="sorting_disabled" width="20%" lang="ctk-tenmhhp">Tên môn học/Học phần</th>
                                    <th class="sorting_disabled" lang="ctk-mahp">Mã Học phần</th>
                                        <th class="sorting_disabled tooltip" langid="ctk-mhghichu-title_1" title="<b>Học phần</b>: học trước (a), tiên quyết (b), song hành (c)">Học phần</th>

                                    <th class="sorting_disabled" lang="ctk-stc">Số TC</th>

                                        <th class="sorting_disabled" lang="ctk-sotietlt">Số tiết LT</th>
                                        <th class="sorting_disabled" lang="ctk-sotietth">Số tiết TH</th>



                                    <th class="sorting_disabled" lang="ctk-nhomtuchon">Nhóm <br /> tự chọn</th>
                                    <th class="sorting_disabled" lang="ctk-sotcnhombatbuoc">Số TC bắt buộc <br /> của nhóm</th>
                                    <th class="sorting_disabled" lang="ctk-pass">Đạt</th>
                                                                    </tr>
                            </thead>
                                        <tbody>
                                                <tr role="row" class="row-head row-head-hover" data-toggle="collapse" data-target=".tr-row-1">
                                                    <td colspan="4" class="text-center"><span lang="ctk-hocky">Học kỳ</span> 1</td>
                                                    <td class="text-center"><span class="">11</span></td>
                                                    <td colspan="5"></td>
                                                </tr>
                                                    <tr role="row" class="row-head tr-row-1 collapse ">
                                                        <td colspan="4" class="text-left">
                                                            <div class="tr-row-1 collapse " lang="ctk-hpbatbuoc">Học phần bắt buộc</div>
                                                        </td>
                                                        <td class="text-center"><span class="tr-row-1 collapse ">11</span></td>
                                                        <td colspan="5"></td>
                                                    </tr>
                                                        <tr class="tr-row-1 collapse  colorSTLichHoc">
                                                            <td>
                                                                <div class="tr-row-1 collapse ">1</div>
                                                            </td>
                                                            
                                                            <td class="text-left">
                                                                <div class="tr-row-1 collapse ">
                                                                    Nhập m&#244;n Tin học 
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div class="tr-row-1 collapse ">4203002009</div>
                                                            </td>
                                                                <td>


                                                                </td>

                                                            <td>
                                                                <div class="tr-row-1 collapse ">2</div>
                                                            </td>
                                                                <td>
                                                                    <div class="tr-row-1 collapse ">30</div>
                                                                </td>
                                                                <td>
                                                                    <div class="tr-row-1 collapse ">0</div>
                                                                </td>


                                                            <td>
                                                                <div class="tr-row-1 collapse ">
                                                                    0
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div class="tr-row-1 collapse ">
                                                                    
                                                                </div>
                                                            </td>
                                                            <td>
                                                                        <div class="tr-row-1 collapse ">
                                                                            <div class="check"></div>
                                                                        </div>
                                                            </td>
                                                                                                                    </tr>
                                                        <tr class="tr-row-1 collapse  colorSTLichHoc">
                                                            <td>
                                                                <div class="tr-row-1 collapse ">2</div>
                                                            </td>
                                                            
                                                            <td class="text-left">
                                                                <div class="tr-row-1 collapse ">
                                                                    Kỹ năng l&#224;m việc nh&#243;m
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div class="tr-row-1 collapse ">4203003192</div>
                                                            </td>
                                                                <td>


                                                                </td>

                                                            <td>
                                                                <div class="tr-row-1 collapse ">2</div>
                                                            </td>
                                                                <td>
                                                                    <div class="tr-row-1 collapse ">30</div>
                                                                </td>
                                                                <td>
                                                                    <div class="tr-row-1 collapse ">0</div>
                                                                </td>


                                                            <td>
                                                                <div class="tr-row-1 collapse ">
                                                                    0
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div class="tr-row-1 collapse ">
                                                                    
                                                                </div>
                                                            </td>
                                                            <td>
                                                                        <div class="tr-row-1 collapse ">
                                                                            <div class="check"></div>
                                                                        </div>
                                                            </td>
                                                                                                                    </tr>
                                                        <tr class="tr-row-1 collapse  colorSTLichHoc">
                                                            <td>
                                                                <div class="tr-row-1 collapse ">3</div>
                                                            </td>
                                                            
                                                            <td class="text-left">
                                                                <div class="tr-row-1 collapse ">
                                                                    Gi&#225;o dục Quốc ph&#242;ng v&#224; An ninh 1
                                                                        <span style="color:red;font-weight:bold"> *</span>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div class="tr-row-1 collapse ">4203003242</div>
                                                            </td>
                                                                <td>


                                                                </td>

                                                            <td>
                                                                <div class="tr-row-1 collapse ">4</div>
                                                            </td>
                                                                <td>
                                                                    <div class="tr-row-1 collapse ">60</div>
                                                                </td>
                                                                <td>
                                                                    <div class="tr-row-1 collapse ">0</div>
                                                                </td>


                                                            <td>
                                                                <div class="tr-row-1 collapse ">
                                                                    0
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div class="tr-row-1 collapse ">
                                                                    
                                                                </div>
                                                            </td>
                                                            <td>
                                                                        <div class="tr-row-1 collapse ">
                                                                            <div class="check"></div>
                                                                        </div>
                                                            </td>
                                                                                                                    </tr>
                                                        <tr class="tr-row-1 collapse  colorSTLichHoc">
                                                            <td>
                                                                <div class="tr-row-1 collapse ">4</div>
                                                            </td>
                                                            
                                                            <td class="text-left">
                                                                <div class="tr-row-1 collapse ">
                                                                    To&#225;n cao cấp 1
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div class="tr-row-1 collapse ">4203003259</div>
                                                            </td>
                                                                <td>


                                                                </td>

                                                            <td>
                                                                <div class="tr-row-1 collapse ">2</div>
                                                            </td>
                                                                <td>
                                                                    <div class="tr-row-1 collapse ">30</div>
                                                                </td>
                                                                <td>
                                                                    <div class="tr-row-1 collapse ">0</div>
                                                                </td>


                                                            <td>
                                                                <div class="tr-row-1 collapse ">
                                                                    0
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div class="tr-row-1 collapse ">
                                                                    
                                                                </div>
                                                            </td>
                                                            <td>
                                                                        <div class="tr-row-1 collapse ">
                                                                            <div class="check"></div>
                                                                        </div>
                                                            </td>
                                                                                                                    </tr>
                                                        <tr class="tr-row-1 collapse  colorSTLichHoc">
                                                            <td>
                                                                <div class="tr-row-1 collapse ">5</div>
                                                            </td>
                                                            
                                                            <td class="text-left">
                                                                <div class="tr-row-1 collapse ">
                                                                    Gi&#225;o dục thể chất 1
                                                                        <span style="color:red;font-weight:bold"> *</span>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div class="tr-row-1 collapse ">4203003307</div>
                                                            </td>
                                                                <td>


                                                                </td>

                                                            <td>
                                                                <div class="tr-row-1 collapse ">2</div>
                                                            </td>
                                                                <td>
                                                                    <div class="tr-row-1 collapse ">0</div>
                                                                </td>
                                                                <td>
                                                                    <div class="tr-row-1 collapse ">60</div>
                                                                </td>


                                                            <td>
                                                                <div class="tr-row-1 collapse ">
                                                                    0
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div class="tr-row-1 collapse ">
                                                                    
                                                                </div>
                                                            </td>
                                                            <td>
                                                                        <div class="tr-row-1 collapse ">
                                                                            <div class="check"></div>
                                                                        </div>
                                                            </td>
                                                                                                                    </tr>
                                                        <tr class="tr-row-1 collapse  colorSTLichHoc">
                                                            <td>
                                                                <div class="tr-row-1 collapse ">6</div>
                                                            </td>
                                                            
                                                            <td class="text-left">
                                                                <div class="tr-row-1 collapse ">
                                                                    Nhập m&#244;n Lập tr&#236;nh
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div class="tr-row-1 collapse ">4203003848</div>
                                                            </td>
                                                                <td>


                                                                </td>

                                                            <td>
                                                                <div class="tr-row-1 collapse ">2</div>
                                                            </td>
                                                                <td>
                                                                    <div class="tr-row-1 collapse ">0</div>
                                                                </td>
                                                                <td>
                                                                    <div class="tr-row-1 collapse ">60</div>
                                                                </td>


                                                            <td>
                                                                <div class="tr-row-1 collapse ">
                                                                    0
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div class="tr-row-1 collapse ">
                                                                    
                                                                </div>
                                                            </td>
                                                            <td>
                                                                        <div class="tr-row-1 collapse ">
                                                                            <div class="check"></div>
                                                                        </div>
                                                            </td>
                                                                                                                    </tr>
                                                        <tr class="tr-row-1 collapse  colorSTLichHoc">
                                                            <td>
                                                                <div class="tr-row-1 collapse ">7</div>
                                                            </td>
                                                            
                                                            <td class="text-left">
                                                                <div class="tr-row-1 collapse ">
                                                                    Triết học M&#225;c - L&#234;nin
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div class="tr-row-1 collapse ">4203014164</div>
                                                            </td>
                                                                <td>


                                                                </td>

                                                            <td>
                                                                <div class="tr-row-1 collapse ">3</div>
                                                            </td>
                                                                <td>
                                                                    <div class="tr-row-1 collapse ">45</div>
                                                                </td>
                                                                <td>
                                                                    <div class="tr-row-1 collapse ">0</div>
                                                                </td>


                                                            <td>
                                                                <div class="tr-row-1 collapse ">
                                                                    0
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div class="tr-row-1 collapse ">
                                                                    
                                                                </div>
                                                            </td>
                                                            <td>
                                                                        <div class="tr-row-1 collapse ">
                                                                            <div class="check"></div>
                                                                        </div>
                                                            </td>
                                                                                                                    </tr>
                                                        <tr class="tr-row-1 collapse  ">
                                                            <td>
                                                                <div class="tr-row-1 collapse ">8</div>
                                                            </td>
                                                            
                                                            <td class="text-left">
                                                                <div class="tr-row-1 collapse ">
                                                                    Chứng chỉ Tiếng Anh
                                                                        <span style="color:red;font-weight:bold"> *</span>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div class="tr-row-1 collapse ">4203015216</div>
                                                            </td>
                                                                <td>


                                                                </td>

                                                            <td>
                                                                <div class="tr-row-1 collapse ">0</div>
                                                            </td>
                                                                <td>
                                                                    <div class="tr-row-1 collapse ">0</div>
                                                                </td>
                                                                <td>
                                                                    <div class="tr-row-1 collapse ">0</div>
                                                                </td>


                                                            <td>
                                                                <div class="tr-row-1 collapse ">
                                                                    0
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div class="tr-row-1 collapse ">
                                                                    
                                                                </div>
                                                            </td>
                                                            <td>
                                                            </td>
                                                                                                                    </tr>
                                                <tr>
                                                    <td colspan="10" style="padding:2px !important"></td>
                                                </tr>

                                        </tbody>
                                        <tbody>
                                                <tr role="row" class="row-head row-head-hover" data-toggle="collapse" data-target=".tr-row-2">
                                                    <td colspan="4" class="text-center"><span lang="ctk-hocky">Học kỳ</span> 2</td>
                                                    <td class="text-center"><span class="">12</span></td>
                                                    <td colspan="5"></td>
                                                </tr>
                                                    <tr role="row" class="row-head tr-row-2 collapse ">
                                                        <td colspan="4" class="text-left">
                                                            <div class="tr-row-2 collapse " lang="ctk-hpbatbuoc">Học phần bắt buộc</div>
                                                        </td>
                                                        <td class="text-center"><span class="tr-row-2 collapse ">9</span></td>
                                                        <td colspan="5"></td>
                                                    </tr>
                                                        <tr class="tr-row-2 collapse  colorSTLichHoc">
                                                            <td>
                                                                <div class="tr-row-2 collapse ">1</div>
                                                            </td>
                                                            
                                                            <td class="text-left">
                                                                <div class="tr-row-2 collapse ">
                                                                    Kỹ thuật lập tr&#236;nh
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div class="tr-row-2 collapse ">4203000941</div>
                                                            </td>
                                                                <td>
                                                                        <div class="tr-row-2 collapse ">
                                                                            <div class="tooltip" langid="ctk-hoctruoc-title_1" title="Học phần học trước">003848<span class="cl-red">(a)</span></div>
                                                                        </div>


                                                                </td>

                                                            <td>
                                                                <div class="tr-row-2 collapse ">3</div>
                                                            </td>
                                                                <td>
                                                                    <div class="tr-row-2 collapse ">30</div>
                                                                </td>
                                                                <td>
                                                                    <div class="tr-row-2 collapse ">30</div>
                                                                </td>


                                                            <td>
                                                                <div class="tr-row-2 collapse ">
                                                                    0
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div class="tr-row-2 collapse ">
                                                                    
                                                                </div>
                                                            </td>
                                                            <td>
                                                                        <div class="tr-row-2 collapse ">
                                                                            <div class="check"></div>
                                                                        </div>
                                                            </td>
                                                                                                                    </tr>
                                                        <tr class="tr-row-2 collapse  colorSTLichHoc">
                                                            <td>
                                                                <div class="tr-row-2 collapse ">2</div>
                                                            </td>
                                                            
                                                            <td class="text-left">
                                                                <div class="tr-row-2 collapse ">
                                                                    Hệ thống M&#225;y t&#237;nh
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div class="tr-row-2 collapse ">4203002137</div>
                                                            </td>
                                                                <td>


                                                                </td>

                                                            <td>
                                                                <div class="tr-row-2 collapse ">4</div>
                                                            </td>
                                                                <td>
                                                                    <div class="tr-row-2 collapse ">45</div>
                                                                </td>
                                                                <td>
                                                                    <div class="tr-row-2 collapse ">30</div>
                                                                </td>


                                                            <td>
                                                                <div class="tr-row-2 collapse ">
                                                                    0
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div class="tr-row-2 collapse ">
                                                                    
                                                                </div>
                                                            </td>
                                                            <td>
                                                                        <div class="tr-row-2 collapse ">
                                                                            <div class="check"></div>
                                                                        </div>
                                                            </td>
                                                                                                                    </tr>
                                                        <tr class="tr-row-2 collapse  colorSTLichHoc">
                                                            <td>
                                                                <div class="tr-row-2 collapse ">3</div>
                                                            </td>
                                                            
                                                            <td class="text-left">
                                                                <div class="tr-row-2 collapse ">
                                                                    Gi&#225;o dục thể chất 2
                                                                        <span style="color:red;font-weight:bold"> *</span>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div class="tr-row-2 collapse ">4203003306</div>
                                                            </td>
                                                                <td>


                                                                </td>

                                                            <td>
                                                                <div class="tr-row-2 collapse ">2</div>
                                                            </td>
                                                                <td>
                                                                    <div class="tr-row-2 collapse ">0</div>
                                                                </td>
                                                                <td>
                                                                    <div class="tr-row-2 collapse ">60</div>
                                                                </td>


                                                            <td>
                                                                <div class="tr-row-2 collapse ">
                                                                    0
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div class="tr-row-2 collapse ">
                                                                    
                                                                </div>
                                                            </td>
                                                            <td>
                                                                        <div class="tr-row-2 collapse ">
                                                                            <div class="check"></div>
                                                                        </div>
                                                            </td>
                                                                                                                    </tr>
                                                        <tr class="tr-row-2 collapse  colorSTLichHoc">
                                                            <td>
                                                                <div class="tr-row-2 collapse ">4</div>
                                                            </td>
                                                            
                                                            <td class="text-left">
                                                                <div class="tr-row-2 collapse ">
                                                                    Gi&#225;o dục quốc ph&#242;ng v&#224; an ninh 2
                                                                        <span style="color:red;font-weight:bold"> *</span>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div class="tr-row-2 collapse ">4203003354</div>
                                                            </td>
                                                                <td>


                                                                </td>

                                                            <td>
                                                                <div class="tr-row-2 collapse ">4</div>
                                                            </td>
                                                                <td>
                                                                    <div class="tr-row-2 collapse ">30</div>
                                                                </td>
                                                                <td>
                                                                    <div class="tr-row-2 collapse ">60</div>
                                                                </td>


                                                            <td>
                                                                <div class="tr-row-2 collapse ">
                                                                    0
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div class="tr-row-2 collapse ">
                                                                    
                                                                </div>
                                                            </td>
                                                            <td>
                                                                        <div class="tr-row-2 collapse ">
                                                                            <div class="check"></div>
                                                                        </div>
                                                            </td>
                                                                                                                    </tr>
                                                        <tr class="tr-row-2 collapse  colorSTLichHoc">
                                                            <td>
                                                                <div class="tr-row-2 collapse ">5</div>
                                                            </td>
                                                            
                                                            <td class="text-left">
                                                                <div class="tr-row-2 collapse ">
                                                                    Kinh tế ch&#237;nh trị M&#225;c - L&#234;nin
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div class="tr-row-2 collapse ">4203014165</div>
                                                            </td>
                                                                <td>


                                                                </td>

                                                            <td>
                                                                <div class="tr-row-2 collapse ">2</div>
                                                            </td>
                                                                <td>
                                                                    <div class="tr-row-2 collapse ">30</div>
                                                                </td>
                                                                <td>
                                                                    <div class="tr-row-2 collapse ">0</div>
                                                                </td>


                                                            <td>
                                                                <div class="tr-row-2 collapse ">
                                                                    0
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div class="tr-row-2 collapse ">
                                                                    
                                                                </div>
                                                            </td>
                                                            <td>
                                                                        <div class="tr-row-2 collapse ">
                                                                            <div class="check"></div>
                                                                        </div>
                                                            </td>
                                                                                                                    </tr>
                                                        <tr class="tr-row-2 collapse  colorSTLichHoc">
                                                            <td>
                                                                <div class="tr-row-2 collapse ">6</div>
                                                            </td>
                                                            
                                                            <td class="text-left">
                                                                <div class="tr-row-2 collapse ">
                                                                    Tiếng Anh 1
                                                                        <span style="color:red;font-weight:bold"> *</span>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div class="tr-row-2 collapse ">4203015253</div>
                                                            </td>
                                                                <td>


                                                                </td>

                                                            <td>
                                                                <div class="tr-row-2 collapse ">3</div>
                                                            </td>
                                                                <td>
                                                                    <div class="tr-row-2 collapse ">45</div>
                                                                </td>
                                                                <td>
                                                                    <div class="tr-row-2 collapse ">0</div>
                                                                </td>


                                                            <td>
                                                                <div class="tr-row-2 collapse ">
                                                                    0
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div class="tr-row-2 collapse ">
                                                                    
                                                                </div>
                                                            </td>
                                                            <td>
                                                                        <div class="tr-row-2 collapse ">
                                                                            <div class="check"></div>
                                                                        </div>
                                                            </td>
                                                                                                                    </tr>
                                                    <tr role="row" class="row-head tr-row-2 collapse ">
                                                        <td colspan="4" class="text-left">
                                                            <div class="tr-row-2 collapse " lang="ctk-hptuchon">Học phần tự chọn</div>
                                                        </td>
                                                        <td class="text-center"><span class="tr-row-2 collapse ">3</span></td>
                                                        <td colspan="5"></td>
                                                    </tr>
                                                        <tr class="tr-row-2 collapse  ">
                                                            <td>
                                                                <div class="tr-row-2 collapse ">7</div>
                                                            </td>
                                                            
                                                            <td class="text-left">
                                                                <div class="tr-row-2 collapse ">
                                                                    To&#225;n ứng dụng
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div class="tr-row-2 collapse ">4203003193</div>
                                                            </td>
                                                                <td>


                                                                </td>

                                                            <td>
                                                                <div class="tr-row-2 collapse ">3</div>
                                                            </td>
                                                                <td>
                                                                    <div class="tr-row-2 collapse ">45</div>
                                                                </td>
                                                                <td>
                                                                    <div class="tr-row-2 collapse ">0</div>
                                                                </td>


                                                            <td>
                                                                <div class="tr-row-2 collapse ">
                                                                    1
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div class="tr-row-2 collapse ">
                                                                    3
                                                                </div>
                                                            </td>
                                                            <td>
                                                            </td>
                                                                                                                    </tr>
                                                        <tr class="tr-row-2 collapse  ">
                                                            <td>
                                                                <div class="tr-row-2 collapse ">8</div>
                                                            </td>
                                                            
                                                            <td class="text-left">
                                                                <div class="tr-row-2 collapse ">
                                                                    H&#224;m phức v&#224; ph&#233;p biến đổi Laplace
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div class="tr-row-2 collapse ">4203003240</div>
                                                            </td>
                                                                <td>


                                                                </td>

                                                            <td>
                                                                <div class="tr-row-2 collapse ">3</div>
                                                            </td>
                                                                <td>
                                                                    <div class="tr-row-2 collapse ">45</div>
                                                                </td>
                                                                <td>
                                                                    <div class="tr-row-2 collapse ">0</div>
                                                                </td>


                                                            <td>
                                                                <div class="tr-row-2 collapse ">
                                                                    1
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div class="tr-row-2 collapse ">
                                                                    3
                                                                </div>
                                                            </td>
                                                            <td>
                                                            </td>
                                                                                                                    </tr>
                                                        <tr class="tr-row-2 collapse  colorSTLichHoc">
                                                            <td>
                                                                <div class="tr-row-2 collapse ">9</div>
                                                            </td>
                                                            
                                                            <td class="text-left">
                                                                <div class="tr-row-2 collapse ">
                                                                    Phương ph&#225;p t&#237;nh
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div class="tr-row-2 collapse ">4203003320</div>
                                                            </td>
                                                                <td>


                                                                </td>

                                                            <td>
                                                                <div class="tr-row-2 collapse ">3</div>
                                                            </td>
                                                                <td>
                                                                    <div class="tr-row-2 collapse ">45</div>
                                                                </td>
                                                                <td>
                                                                    <div class="tr-row-2 collapse ">0</div>
                                                                </td>


                                                            <td>
                                                                <div class="tr-row-2 collapse ">
                                                                    1
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div class="tr-row-2 collapse ">
                                                                    3
                                                                </div>
                                                            </td>
                                                            <td>
                                                                        <div class="tr-row-2 collapse ">
                                                                            <div class="check"></div>
                                                                        </div>
                                                            </td>
                                                                                                                    </tr>
                                                        <tr class="tr-row-2 collapse  ">
                                                            <td>
                                                                <div class="tr-row-2 collapse ">10</div>
                                                            </td>
                                                            
                                                            <td class="text-left">
                                                                <div class="tr-row-2 collapse ">
                                                                    Vật l&#253; đại cương
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div class="tr-row-2 collapse ">4203003345</div>
                                                            </td>
                                                                <td>


                                                                </td>

                                                            <td>
                                                                <div class="tr-row-2 collapse ">3</div>
                                                            </td>
                                                                <td>
                                                                    <div class="tr-row-2 collapse ">45</div>
                                                                </td>
                                                                <td>
                                                                    <div class="tr-row-2 collapse ">0</div>
                                                                </td>


                                                            <td>
                                                                <div class="tr-row-2 collapse ">
                                                                    1
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div class="tr-row-2 collapse ">
                                                                    3
                                                                </div>
                                                            </td>
                                                            <td>
                                                            </td>
                                                                                                                    </tr>
                                                        <tr class="tr-row-2 collapse  ">
                                                            <td>
                                                                <div class="tr-row-2 collapse ">11</div>
                                                            </td>
                                                            
                                                            <td class="text-left">
                                                                <div class="tr-row-2 collapse ">
                                                                    Logic học
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div class="tr-row-2 collapse ">4203003395</div>
                                                            </td>
                                                                <td>


                                                                </td>

                                                            <td>
                                                                <div class="tr-row-2 collapse ">3</div>
                                                            </td>
                                                                <td>
                                                                    <div class="tr-row-2 collapse ">45</div>
                                                                </td>
                                                                <td>
                                                                    <div class="tr-row-2 collapse ">0</div>
                                                                </td>


                                                            <td>
                                                                <div class="tr-row-2 collapse ">
                                                                    1
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div class="tr-row-2 collapse ">
                                                                    3
                                                                </div>
                                                            </td>
                                                            <td>
                                                            </td>
                                                                                                                    </tr>
                                                <tr>
                                                    <td colspan="10" style="padding:2px !important"></td>
                                                </tr>

                                        </tbody>
                                        <tbody>
                                                <tr role="row" class="row-head row-head-hover" data-toggle="collapse" data-target=".tr-row-3">
                                                    <td colspan="4" class="text-center"><span lang="ctk-hocky">Học kỳ</span> 3</td>
                                                    <td class="text-center"><span class="">19</span></td>
                                                    <td colspan="5"></td>
                                                </tr>
                                                    <tr role="row" class="row-head tr-row-3 collapse ">
                                                        <td colspan="4" class="text-left">
                                                            <div class="tr-row-3 collapse " lang="ctk-hpbatbuoc">Học phần bắt buộc</div>
                                                        </td>
                                                        <td class="text-center"><span class="tr-row-3 collapse ">16</span></td>
                                                        <td colspan="5"></td>
                                                    </tr>
                                                        <tr class="tr-row-3 collapse  colorSTLichHoc">
                                                            <td>
                                                                <div class="tr-row-3 collapse ">1</div>
                                                            </td>
                                                            
                                                            <td class="text-left">
                                                                <div class="tr-row-3 collapse ">
                                                                    Cấu tr&#250;c rời rạc
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div class="tr-row-3 collapse ">4203000901</div>
                                                            </td>
                                                                <td>


                                                                </td>

                                                            <td>
                                                                <div class="tr-row-3 collapse ">3</div>
                                                            </td>
                                                                <td>
                                                                    <div class="tr-row-3 collapse ">45</div>
                                                                </td>
                                                                <td>
                                                                    <div class="tr-row-3 collapse ">0</div>
                                                                </td>


                                                            <td>
                                                                <div class="tr-row-3 collapse ">
                                                                    0
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div class="tr-row-3 collapse ">
                                                                    
                                                                </div>
                                                            </td>
                                                            <td>
                                                                        <div class="tr-row-3 collapse ">
                                                                            <div class="check"></div>
                                                                        </div>
                                                            </td>
                                                                                                                    </tr>
                                                        <tr class="tr-row-3 collapse  colorSTLichHoc">
                                                            <td>
                                                                <div class="tr-row-3 collapse ">2</div>
                                                            </td>
                                                            
                                                            <td class="text-left">
                                                                <div class="tr-row-3 collapse ">
                                                                    Cấu tr&#250;c dữ liệu v&#224; giải thuật
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div class="tr-row-3 collapse ">4203000942</div>
                                                            </td>
                                                                <td>
                                                                        <div class="tr-row-3 collapse ">
                                                                            <div class="tooltip" langid="ctk-hoctruoc-title_2" title="Học phần học trước">003848<span class="cl-red">(a)</span></div>
                                                                        </div>


                                                                </td>

                                                            <td>
                                                                <div class="tr-row-3 collapse ">4</div>
                                                            </td>
                                                                <td>
                                                                    <div class="tr-row-3 collapse ">45</div>
                                                                </td>
                                                                <td>
                                                                    <div class="tr-row-3 collapse ">30</div>
                                                                </td>


                                                            <td>
                                                                <div class="tr-row-3 collapse ">
                                                                    0
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div class="tr-row-3 collapse ">
                                                                    
                                                                </div>
                                                            </td>
                                                            <td>
                                                                        <div class="tr-row-3 collapse ">
                                                                            <div class="check"></div>
                                                                        </div>
                                                            </td>
                                                                                                                    </tr>
                                                        <tr class="tr-row-3 collapse  colorSTLichHoc">
                                                            <td>
                                                                <div class="tr-row-3 collapse ">3</div>
                                                            </td>
                                                            
                                                            <td class="text-left">
                                                                <div class="tr-row-3 collapse ">
                                                                    Hệ cơ sở dữ liệu
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div class="tr-row-3 collapse ">4203001146</div>
                                                            </td>
                                                                <td>
                                                                        <div class="tr-row-3 collapse ">
                                                                            <div class="tooltip" langid="ctk-hoctruoc-title_3" title="Học phần học trước">002009<span class="cl-red">(a)</span></div>
                                                                        </div>


                                                                </td>

                                                            <td>
                                                                <div class="tr-row-3 collapse ">4</div>
                                                            </td>
                                                                <td>
                                                                    <div class="tr-row-3 collapse ">45</div>
                                                                </td>
                                                                <td>
                                                                    <div class="tr-row-3 collapse ">30</div>
                                                                </td>


                                                            <td>
                                                                <div class="tr-row-3 collapse ">
                                                                    0
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div class="tr-row-3 collapse ">
                                                                    
                                                                </div>
                                                            </td>
                                                            <td>
                                                                        <div class="tr-row-3 collapse ">
                                                                            <div class="check"></div>
                                                                        </div>
                                                            </td>
                                                                                                                    </tr>
                                                        <tr class="tr-row-3 collapse  colorSTLichHoc">
                                                            <td>
                                                                <div class="tr-row-3 collapse ">4</div>
                                                            </td>
                                                            
                                                            <td class="text-left">
                                                                <div class="tr-row-3 collapse ">
                                                                    To&#225;n cao cấp 2
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div class="tr-row-3 collapse ">4203003288</div>
                                                            </td>
                                                                <td>


                                                                </td>

                                                            <td>
                                                                <div class="tr-row-3 collapse ">2</div>
                                                            </td>
                                                                <td>
                                                                    <div class="tr-row-3 collapse ">30</div>
                                                                </td>
                                                                <td>
                                                                    <div class="tr-row-3 collapse ">0</div>
                                                                </td>


                                                            <td>
                                                                <div class="tr-row-3 collapse ">
                                                                    0
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div class="tr-row-3 collapse ">
                                                                    
                                                                </div>
                                                            </td>
                                                            <td>
                                                                        <div class="tr-row-3 collapse ">
                                                                            <div class="check"></div>
                                                                        </div>
                                                            </td>
                                                                                                                    </tr>
                                                        <tr class="tr-row-3 collapse  colorSTLichHoc">
                                                            <td>
                                                                <div class="tr-row-3 collapse ">5</div>
                                                            </td>
                                                            
                                                            <td class="text-left">
                                                                <div class="tr-row-3 collapse ">
                                                                    Lập tr&#236;nh hướng đối tượng
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div class="tr-row-3 collapse ">4203003591</div>
                                                            </td>
                                                                <td>
                                                                        <div class="tr-row-3 collapse ">
                                                                            <div class="tooltip" langid="ctk-hoctruoc-title_5" title="Học phần học trước">003848<span class="cl-red">(a)</span></div>
                                                                        </div>


                                                                </td>

                                                            <td>
                                                                <div class="tr-row-3 collapse ">3</div>
                                                            </td>
                                                                <td>
                                                                    <div class="tr-row-3 collapse ">30</div>
                                                                </td>
                                                                <td>
                                                                    <div class="tr-row-3 collapse ">30</div>
                                                                </td>


                                                            <td>
                                                                <div class="tr-row-3 collapse ">
                                                                    0
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div class="tr-row-3 collapse ">
                                                                    
                                                                </div>
                                                            </td>
                                                            <td>
                                                                        <div class="tr-row-3 collapse ">
                                                                            <div class="check"></div>
                                                                        </div>
                                                            </td>
                                                                                                                    </tr>
                                                        <tr class="tr-row-3 collapse  colorSTLichHoc">
                                                            <td>
                                                                <div class="tr-row-3 collapse ">6</div>
                                                            </td>
                                                            
                                                            <td class="text-left">
                                                                <div class="tr-row-3 collapse ">
                                                                    Tiếng Anh 2
                                                                        <span style="color:red;font-weight:bold"> *</span>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div class="tr-row-3 collapse ">4203015254</div>
                                                            </td>
                                                                <td>


                                                                </td>

                                                            <td>
                                                                <div class="tr-row-3 collapse ">3</div>
                                                            </td>
                                                                <td>
                                                                    <div class="tr-row-3 collapse ">45</div>
                                                                </td>
                                                                <td>
                                                                    <div class="tr-row-3 collapse ">0</div>
                                                                </td>


                                                            <td>
                                                                <div class="tr-row-3 collapse ">
                                                                    0
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div class="tr-row-3 collapse ">
                                                                    
                                                                </div>
                                                            </td>
                                                            <td>
                                                                        <div class="tr-row-3 collapse ">
                                                                            <div class="check"></div>
                                                                        </div>
                                                            </td>
                                                                                                                    </tr>
                                                    <tr role="row" class="row-head tr-row-3 collapse ">
                                                        <td colspan="4" class="text-left">
                                                            <div class="tr-row-3 collapse " lang="ctk-hptuchon">Học phần tự chọn</div>
                                                        </td>
                                                        <td class="text-center"><span class="tr-row-3 collapse ">3</span></td>
                                                        <td colspan="5"></td>
                                                    </tr>
                                                        <tr class="tr-row-3 collapse  ">
                                                            <td>
                                                                <div class="tr-row-3 collapse ">7</div>
                                                            </td>
                                                            
                                                            <td class="text-left">
                                                                <div class="tr-row-3 collapse ">
                                                                    Địa l&#253; kinh tế
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div class="tr-row-3 collapse ">4203001103</div>
                                                            </td>
                                                                <td>


                                                                </td>

                                                            <td>
                                                                <div class="tr-row-3 collapse ">3</div>
                                                            </td>
                                                                <td>
                                                                    <div class="tr-row-3 collapse ">45</div>
                                                                </td>
                                                                <td>
                                                                    <div class="tr-row-3 collapse ">0</div>
                                                                </td>


                                                            <td>
                                                                <div class="tr-row-3 collapse ">
                                                                    1
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div class="tr-row-3 collapse ">
                                                                    3
                                                                </div>
                                                            </td>
                                                            <td>
                                                            </td>
                                                                                                                    </tr>
                                                        <tr class="tr-row-3 collapse  ">
                                                            <td>
                                                                <div class="tr-row-3 collapse ">8</div>
                                                            </td>
                                                            
                                                            <td class="text-left">
                                                                <div class="tr-row-3 collapse ">
                                                                    Kỹ năng x&#226;y dựng kế hoạch
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div class="tr-row-3 collapse ">4203003197</div>
                                                            </td>
                                                                <td>


                                                                </td>

                                                            <td>
                                                                <div class="tr-row-3 collapse ">3</div>
                                                            </td>
                                                                <td>
                                                                    <div class="tr-row-3 collapse ">45</div>
                                                                </td>
                                                                <td>
                                                                    <div class="tr-row-3 collapse ">0</div>
                                                                </td>


                                                            <td>
                                                                <div class="tr-row-3 collapse ">
                                                                    1
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div class="tr-row-3 collapse ">
                                                                    3
                                                                </div>
                                                            </td>
                                                            <td>
                                                            </td>
                                                                                                                    </tr>
                                                        <tr class="tr-row-3 collapse  colorSTLichHoc">
                                                            <td>
                                                                <div class="tr-row-3 collapse ">9</div>
                                                            </td>
                                                            
                                                            <td class="text-left">
                                                                <div class="tr-row-3 collapse ">
                                                                    M&#244;i trường v&#224; con người
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div class="tr-row-3 collapse ">4203003206</div>
                                                            </td>
                                                                <td>


                                                                </td>

                                                            <td>
                                                                <div class="tr-row-3 collapse ">3</div>
                                                            </td>
                                                                <td>
                                                                    <div class="tr-row-3 collapse ">45</div>
                                                                </td>
                                                                <td>
                                                                    <div class="tr-row-3 collapse ">0</div>
                                                                </td>


                                                            <td>
                                                                <div class="tr-row-3 collapse ">
                                                                    1
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div class="tr-row-3 collapse ">
                                                                    3
                                                                </div>
                                                            </td>
                                                            <td>
                                                                        <div class="tr-row-3 collapse ">
                                                                            <div class="check"></div>
                                                                        </div>
                                                            </td>
                                                                                                                    </tr>
                                                        <tr class="tr-row-3 collapse  ">
                                                            <td>
                                                                <div class="tr-row-3 collapse ">10</div>
                                                            </td>
                                                            
                                                            <td class="text-left">
                                                                <div class="tr-row-3 collapse ">
                                                                    C&#244;ng nghệ th&#244;ng tin trong chuyển đổi số
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div class="tr-row-3 collapse ">4203015296</div>
                                                            </td>
                                                                <td>


                                                                </td>

                                                            <td>
                                                                <div class="tr-row-3 collapse ">3</div>
                                                            </td>
                                                                <td>
                                                                    <div class="tr-row-3 collapse ">45</div>
                                                                </td>
                                                                <td>
                                                                    <div class="tr-row-3 collapse ">0</div>
                                                                </td>


                                                            <td>
                                                                <div class="tr-row-3 collapse ">
                                                                    1
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div class="tr-row-3 collapse ">
                                                                    3
                                                                </div>
                                                            </td>
                                                            <td>
                                                            </td>
                                                                                                                    </tr>
                                                        <tr class="tr-row-3 collapse  ">
                                                            <td>
                                                                <div class="tr-row-3 collapse ">11</div>
                                                            </td>
                                                            
                                                            <td class="text-left">
                                                                <div class="tr-row-3 collapse ">
                                                                    Ứng dụng h&#243;a học trong C&#244;ng nghiệp
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div class="tr-row-3 collapse ">4203015299</div>
                                                            </td>
                                                                <td>


                                                                </td>

                                                            <td>
                                                                <div class="tr-row-3 collapse ">3</div>
                                                            </td>
                                                                <td>
                                                                    <div class="tr-row-3 collapse ">45</div>
                                                                </td>
                                                                <td>
                                                                    <div class="tr-row-3 collapse ">0</div>
                                                                </td>


                                                            <td>
                                                                <div class="tr-row-3 collapse ">
                                                                    1
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div class="tr-row-3 collapse ">
                                                                    3
                                                                </div>
                                                            </td>
                                                            <td>
                                                            </td>
                                                                                                                    </tr>
                                                        <tr class="tr-row-3 collapse  ">
                                                            <td>
                                                                <div class="tr-row-3 collapse ">12</div>
                                                            </td>
                                                            
                                                            <td class="text-left">
                                                                <div class="tr-row-3 collapse ">
                                                                    Ứng dụng 5S v&#224; Kaizen trong sản xuất
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div class="tr-row-3 collapse ">4203015300</div>
                                                            </td>
                                                                <td>


                                                                </td>

                                                            <td>
                                                                <div class="tr-row-3 collapse ">3</div>
                                                            </td>
                                                                <td>
                                                                    <div class="tr-row-3 collapse ">45</div>
                                                                </td>
                                                                <td>
                                                                    <div class="tr-row-3 collapse ">0</div>
                                                                </td>


                                                            <td>
                                                                <div class="tr-row-3 collapse ">
                                                                    1
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div class="tr-row-3 collapse ">
                                                                    3
                                                                </div>
                                                            </td>
                                                            <td>
                                                            </td>
                                                                                                                    </tr>
                                                <tr>
                                                    <td colspan="10" style="padding:2px !important"></td>
                                                </tr>

                                        </tbody> */
}
