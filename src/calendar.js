import { getShiftStats } from "./genetic.js";

function getWeekNum(offset, len) {
  return Math.ceil((offset - 1 + len) / 7);
}

export function configMonth(year, month) {
  let startDate = new Date(year, month - 1, 1, 0, 1);
  let e_year = year;
  let e_month = month;
  if (month == 12) {
    e_year += 1;
    e_month = 1;
  } else {
    e_month += 1;
  }
  let endDate = new Date(e_year, e_month - 1, 1, 0, 0);
  endDate.setDate(endDate.getDate() - 1);
  let startDayOffset = startDate.getDay();
  let dateNum = endDate.getDate();

  return { offset: startDayOffset, len: dateNum };
}

//0 : 평일, 1 : 주말 전, 2 : 주말 중, 3 : 주말 마지막
function processHoliday(hList, dateNum) {
  let pList = Array(dateNum).fill(0);
  for (let i = 1; i < pList.length + 1; i++) {
    if (hList.includes(i)) {
      if (hList.includes(i + 1)) {
        pList[i - 1] = 2;
      } else {
        pList[i - 1] = 3;
      }
      if (!hList.includes(i - 1) && i != 1) pList[i - 2] = 1;
    }
  }
  return pList;
}

function holidayOrders(o, p) {
  if (o === 0) {
    // o가 평일 => p 따라서
    return p;
  } else if (o === 1) {
    // o가 주말 전 => p가 주말 중, 막 이면 주말 중 아니면 주말 전
    if (p >= 2) return 2;
    else return 1;
  } else if (o === 2) {
    // o가 주말 중 => 무조건 주말 중
    return 2;
  } else if (o === 3) {
    // o가 주말 막 => p가 주말 전, 중이면 주말 중 아니면 주말 막
    if (p === 1 || p === 2) return 2;
    else return 3;
  }
}

export function makeColorDate(hList, startDayOffset, dateNum) {
  let pList = processHoliday(hList, dateNum);
  let currDay = startDayOffset;
  let oList = Array(dateNum).fill(0);
  // set oList
  for (let i = 0; i < oList.length; i++) {
    switch (currDay % 7) {
      case 0:
        oList[i] = 3;
        break;
      case 5:
        oList[i] = 1;
        break;
      case 6:
        oList[i] = 2;
        break;
    }
    currDay++;
  }
  return oList.map((o, i) => holidayOrders(o, pList[i]));
}

export function getName(workerList, i) {
  return workerList[i].name;
}

export function getFullName(workerList, i) {
  //get full name of i th worker
  let strRank = "";
  switch (workerList[i].data.rank) {
    case 0:
      strRank = "이병";
      break;
    case 1:
      strRank = "일병";
      break;
    case 2:
      strRank = "상병";
      break;
    case 3:
      strRank = "병장";
      break;
  }
  return strRank + " " + getName(workerList, i);
}

export function createCalendar(
  year,
  month,
  coloredDate,
  output,
  workerList,
  wrongList
) {
  let divCalendar = document.getElementById(calendar);
  let calendarTitle = document.createElement("div");
  calendarTitle.id = "calendar_title";
  calendarTitle.innerHTML = (year % 100) + "년 " + month + "월 상황병 근무표";
  document.getElementById("calendar").appendChild(calendarTitle);
  let table = document.createElement("table");
  let thead = document.createElement("thead");
  let tbody = document.createElement("tbody");

  table.appendChild(thead);
  table.appendChild(tbody);

  document.getElementById("calendar").appendChild(table);
  let dayOfWeek = "일월화수목금토";
  thead.appendChild(document.createElement("tr"));
  for (let d = 0; d < 7; d++) {
    let th_tmp = document.createElement("th");
    //th_tmp.innerHTML = "<p>"+dayOfWeek[d]+"</p>";
    th_tmp.innerHTML = dayOfWeek[d];
    thead.append(th_tmp);
  }

  let monthInfo = configMonth(year, month);
  let startDayOffset = monthInfo.offset;
  let dateNum = monthInfo.len;
  let weekNum = getWeekNum(startDayOffset, dateNum);

  let num = 1;
  let nextIdx = 0;
  for (let j = 0; j < weekNum; j++) {
    let tr_tmp = document.createElement("tr");
    tbody.append(tr_tmp);
    let tmp_num = num;
    for (let i = 0; i < 7; i++) {
      let td_tmp = document.createElement("td");
      td_tmp.classList.add("date");

      let tmp = coloredDate[num - 1];

      if (tmp === 1) {
        td_tmp.classList.add("fri");
      } else if (tmp === 2) {
        td_tmp.classList.add("sat");
      } else if (tmp === 3) {
        td_tmp.classList.add("sun");
      }
      tr_tmp.appendChild(td_tmp);
      if (j == 0 && i < startDayOffset) {
        continue;
      }

      if (num > dateNum) continue;
      td_tmp.innerHTML = num;
      num += 1;
    }

    tr_tmp = document.createElement("tr");
    tbody.append(tr_tmp);
    for (let i = 0; i < 7; i++) {
      let td_tmp = document.createElement("td");
      td_tmp.classList.add("name");
      tr_tmp.appendChild(td_tmp);
      if (j == 0 && i < startDayOffset) {
        continue;
      }

      if (tmp_num > dateNum) continue;
      let tmp = coloredDate[tmp_num - 1];

      if (tmp > 1) {
        // 주말 중, 주말 막 이면
        for (let k = 0; k < 3; k++) {
          let classStr = "";
          if (k === 2) {
            if (tmp === 2) classStr = '"sat_night ';
            else classStr = '"sun_night ';
          } else {
            classStr = '"sat_morn' + (k + 1) + " ";
          }
          classStr += getName(workerList, output[nextIdx]) + '">';
          td_tmp.innerHTML +=
            "<div class=" + classStr + getFullName(workerList, output[nextIdx]);
          +"</div>";
          nextIdx += 1;
        }
      } else {
        if (tmp === 1) {
          td_tmp.innerHTML =
            '<div class="fri_night ' +
            getName(workerList, output[nextIdx]) +
            '">' +
            getFullName(workerList, output[nextIdx]);
          +"</div>";
        } else {
          td_tmp.innerHTML =
            '<div class="' +
            getName(workerList, output[nextIdx]) +
            '">' +
            getFullName(workerList, output[nextIdx]);
          +"</div>";
        }
        nextIdx += 1;
      }
      tmp_num += 1;
    }
  }
}

export function createStats(shiftMask, shiftName, output, workerList) {
  let divStats = document.createElement("div");
  divStats.id = "statistics";
  document.getElementById("body").appendChild(divStats);
  let statsTitle = document.createElement("div");
  statsTitle.id = "stats_title";
  statsTitle.innerHTML = "인원 별 근무 투입 횟수";
  document.getElementById("statistics").appendChild(statsTitle);
  let table = document.createElement("table");
  let thead = document.createElement("thead");
  let tbody = document.createElement("tbody");
  table.appendChild(thead);
  table.appendChild(tbody);
  document.getElementById("statistics").appendChild(table);
  thead.appendChild(document.createElement("tr"));
  let th_tmp = document.createElement("th");
  th_tmp.innerHTML = "관등성명";
  thead.append(th_tmp);
  for (let i = 0; i < shiftName.length; i++) {
    let th_tmp = document.createElement("th");
    th_tmp.innerHTML = shiftName[i];
    thead.append(th_tmp);
  }
  th_tmp = document.createElement("th");
  th_tmp.innerHTML = "총합";
  thead.append(th_tmp);

  let result = getShiftStats(shiftMask, output, workerList);
  for (let i = 0; i < result.length; i++) {
    let tr_tmp = document.createElement("tr");
    tbody.append(tr_tmp);
    for (let j = 0; j < 8; j++) {
      let td_tmp = document.createElement("td");
      if (j === 0) {
        let workername = getFullName(workerList, i);
        td_tmp.innerHTML = "<span>" + workername + "</span>";
        let button_tmp = document.createElement("button");
        button_tmp.classList.add("statsButton");
        let name_short = getName(workerList, i);
        button_tmp.id = name_short + "button";
        button_tmp.innerHTML = "확인";
        function tgl() {
          let tmp_button = document.getElementById(name_short + "button");
          let select_list = document.getElementsByClassName(name_short);

          if (tmp_button.innerHTML === "확인") {
            for (let k = 0; k < select_list.length; k++) {
              select_list[k].classList.add("selected");
            }
            tmp_button.innerHTML = "취소";
          } else if (tmp_button.innerHTML === "취소") {
            for (let k = 0; k < select_list.length; k++) {
              select_list[k].classList.remove("selected");
            }
            tmp_button.innerHTML = "확인";
          }
        }
        button_tmp.onclick = tgl;
        td_tmp.appendChild(button_tmp);
      } else if (j === 7) {
        td_tmp.innerHTML = result[i].reduce((a, b) => a + b, 0);
      } else {
        td_tmp.innerHTML = result[i][j - 1];
      }
      tr_tmp.append(td_tmp);
    }
  }
}
