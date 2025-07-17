
//Lấy điểm
(function () {
  if (
    !window.location.href.toLowerCase().includes("diem") &&
    !document.getElementById("xemDiem")
  ) {
    console.log("⏭️ Bỏ qua lấy điểm - không phải trang điểm");
    return;
  }

  console.log("📊 Bắt đầu xử lý trang điểm...");

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
    console.log("📋 Kiểm tra table điểm...");
    const table = document.getElementById("xemDiem");
    if (!table) {
      console.log("❌ Không tìm thấy table #xemDiem");
      return;
    }

    console.log("✅ Tìm thấy table điểm, bắt đầu export...");

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
      console.log("✅ Đã lấy được dữ liệu điểm:", result.length, "học kỳ");

      chrome.storage.local.set(
        {
          diem_json: JSON.stringify(result, null, 2),
          diem_timestamp: Date.now(),
        },
        function () {
          console.log("✅ Đã lưu điểm vào storage");
          chrome.runtime.sendMessage({
            type: "GRADES_SAVED",
            data: result,
          });
        }
      );

      return true;
    } else {
      console.log("⚠️ Không có dữ liệu điểm để lưu");
    }
  }

  window.addEventListener("load", () => {
    console.log("📋 Window loaded, sẽ export điểm sau 2 giây...");
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

  setTimeout(attemptLoadSchedule, 3000);
}

function loadScheduleData() {
  try {
    window.ketQuaMang = [];

    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);


    LoadNhieuTuan_JSON(startDate.toISOString(), 4, 0, () => {
      processAndSaveScheduleData();
    });
  } catch (error) {
    console.log("Lỗi khi tải dữ liệu lịch học:", error);
  }
}

function LoadNhieuTuan_JSON(startDateStr, soTuan = 10, loaiLich = 0, callback) {
  const startDate = new Date(startDateStr);
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("k");

  if (!token) {
    if (callback) callback();
    return;
  }
  loadWithFetch(startDate, soTuan, loaiLich, token, callback);
}

// function loadWithJQuery(startDate, soTuan, loaiLich, token, callback) {
//   const promises = [];

//   for (let i = 0; i < soTuan; i++) {
//     const ngay = new Date(startDate);
//     ngay.setDate(ngay.getDate() + i * 7);
//     const promise = jQuery
//       .ajax({
//         url: "/SinhVienTraCuu/GetDanhSachLichTheoTuan",
//         type: "POST",
//         dataType: "html",
//         data: {
//           k: token,
//           pNgayHienTai: ngay.toISOString(),
//           pLoaiLich: loaiLich,
//         },
//       })
//       .then((data) => {
//         window.ketQuaMang.push({
//           tuan: i + 1,
//           ngayBatDau: ngay.toISOString(),
//           duLieu: data,
//           loaiLich: loaiLich,
//         });
//       })
//       .fail((err) => {
//         console.log(`jQuery lỗi tuần ${i + 1}:`, err);
//       });

//     promises.push(promise);
//   }

//   jQuery.when
//     .apply(jQuery, promises)
//     .done(() => {
//       if (callback) {
//         callback();
//       }
//     })
//     .fail(() => {
//       console.error(`Lỗi jQuery`);
//       if (callback) callback();
//     });
// }

function loadWithFetch(startDate, soTuan, loaiLich, token, callback) {
  const promises = [];

  for (let i = 0; i < soTuan; i++) {
    const ngay = new Date(startDate);
    ngay.setDate(ngay.getDate() + i * 7);

    console.log(
      `Fetch request tuần ${i + 1}, ngày: ${ngay.toLocaleDateString()}`
    );

    const formData = new FormData();
    formData.append("k", token);
    formData.append("pNgayHienTai", ngay.toISOString());
    formData.append("pLoaiLich", loaiLich.toString());

    const promise = fetch("/SinhVienTraCuu/GetDanhSachLichTheoTuan", {
      method: "POST",
      body: formData,
      headers: {
        "X-Requested-With": "XMLHttpRequest",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
      })
      .then((data) => {
        window.ketQuaMang.push({
          tuan: i + 1,
          ngayBatDau: ngay.toISOString(),
          duLieu: data,
          loaiLich: loaiLich,
        });
      })
      .catch((err) => {
        console.log(`Fetch lỗi tuần ${i + 1}:`, err);
      });

    promises.push(promise);
  }

  Promise.all(promises)
    .then(() => {
      if (callback) {
        callback();
      }
    })
    .catch((error) => {
      if (callback) callback();
    });
}

function parseLichHocFromHTML(htmlString) {
  console.log(`🔄 Parse HTML, length: ${htmlString.length}`);

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

    console.log("📊 Tổng số tiết học sau parse:", tatCaTietHoc.length);

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
              console.log(
                "Lỗi",
                chrome.runtime.lastError.message
              );
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
