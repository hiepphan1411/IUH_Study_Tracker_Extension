(function () {
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
    if (!table) return;

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
          console.log(result);
        }
      );

      return true;
    }
  }

  window.addEventListener("load", () => {
    setTimeout(exportTableToJson, 2000);
  });
})();
