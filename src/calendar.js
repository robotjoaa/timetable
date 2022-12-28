
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
    }
    if (!hList.includes(i - 1) && i != 1) pList[i - 2] = 1;
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

function makeColorDate(hList, startDayOffset, dateNum) {
  let pList = processHolida(hList, dateNum);
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


function createCalendar() {
  let table = document.createElement("table");
  let thead = document.createElement("thead");
  let tbody = document.createElement("tbody");

  table.appendChild(thead);
  table.appendChild(tbody);

  document.getElementById("body").appendChild(table);
  let dayOfWeek = "일월화수목금토";
  thead.appendChild(document.createElement("tr"));
  for (let d = 0; d < 7; d++) {
    let th_tmp = document.createElement("th");
    //th_tmp.innerHTML = "<p>"+dayOfWeek[d]+"</p>";
    th_tmp.innerHTML = dayOfWeek[d];
    thead.append(th_tmp);
  }

  let year = 2022;
  let month = 12;
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
  let weekNum = Math.ceil((startDayOffset - 1 + dateNum) / 7);


  //주말을 제외한 공유일 추가
  let holidayList = [5];
  //저번 달 마지막 날(0) 공휴일 이었는지, 다음달 첫날(dateNum+1) 공휴일 인지 확인 필요
    
  let coloredDate = makeColorDate(holidayList, startDayOffset, dateNum);

  let num = 0;
  for (let j = 0; j < weekNum; j++) {
    let tr_tmp = document.createElement("tr");
    tbody.append(tr_tmp);
    for (let i = 0; i < 7; i++) {
      let td_tmp = document.createElement("td");
      td_tmp.classList.add("date");
      
      let tmp = coloredDate[num];
      
      if(tmp === 1){
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
      td_tmp.innerHTML = "상병 나영채";
    }
  }
}

createCalendar();
