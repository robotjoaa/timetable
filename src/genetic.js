import {
  makeColorDate,
  configMonth,
  createCalendar,
  createStats,
  getName,
  getFullName,
} from "./calendar.js";

/* genetic algorithm 
1. initialize
- chromosome

2. evaluation 

3. selection

4. crossover

5. mutation
*/

/*
    평일 : 0
    금야 : 1
    주말 주간1 : 2
    주말 주간2 : 3
    주말 야간 : 4
    일요일 야간 : 5
*/
//const YEAR = 2022;
//const MONTH = 12;

const YEAR = 2023;
const MONTH = 1;

//주말을 제외한 공유일 추가
//저번 달 마지막 날(0) 공휴일 이었는지, 다음달 첫날(dateNum+1) 공휴일 인지 확인 필요
//전투휴무날 다 안 쉬는 경우에 대한 고려? => 별로 없는 경우인지
const HOLIDAY_LIST = [6, 23, 24];

function makeShiftArr(year, month) {
  let monthInfo = configMonth(year, month);
  let startDayOffset = monthInfo.offset;
  let dateNum = monthInfo.len;
  let coloredDate = makeColorDate(HOLIDAY_LIST, startDayOffset, dateNum);
  let result = [];
  let dateOffset = [];
  let currOffset = 0;
  for (let i = 0; i < coloredDate.length; i++) {
    dateOffset.push(currOffset);
    if (coloredDate[i] === 2) {
      // 주말 중
      result.push(...[2, 3, 4]);
      currOffset += 3;
    } else if (coloredDate[i] === 3) {
      // 주말 끝
      result.push(...[2, 3, 5]);
      currOffset += 3;
    } else {
      result.push(coloredDate[i]);
      currOffset += 1;
    }
  }
  dateOffset.push(currOffset);
  return { result: result, coloredDate: coloredDate, dateOffset: dateOffset };
}

const SHIFT_CONFIG = makeShiftArr(YEAR, MONTH, HOLIDAY_LIST);
const SHIFT_MASK = SHIFT_CONFIG.result;
const SHIFT_NAME = [
  "평일 야간",
  "금 야간",
  "토 주간1",
  "토 주간2",
  "토 야간",
  "일 야간",
];
const COLORED_DATE = SHIFT_CONFIG.coloredDate;
const SHIFT_LEN = SHIFT_MASK.length;
const WORKER_BIT = 4; // modified by maximum number of worker
const WORKER_NUM = 14;

function getRandInt(min, max) {
  //min 부터 max-1까지
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(min + (max - min) * Math.random());
}

class Chromosome {
  constructor(s_num, s_len, s_max) {
    this.sNum = s_num; // slot이 한 chromosome에 몇개 들어가는지 (shift 개수)
    this.sLen = s_len; // 한 slot에 몇 bit 인지
    this.sMax = s_max; // 한 slot 최댓값이 몇 인지
    this.value = Array(s_num * s_len).fill(0);
  }

  init() {
    let prob = 0.5;
    function rndFunc() {
      return Math.random() >= prob ? 1 : 0;
    }
    this.value = this.value.map(rndFunc);

    this.errorResolve();
  }

  getSlotValue(i) {
    // get i th value
    //s_len 만큼 묶어서
    let tmp = 0;
    for (let j = 0; j < this.sLen; j++) {
      tmp = (tmp << 1) + this.value[this.sLen * i + j];
    }
    return tmp;
  }

  setSlotValue(i, val) {
    //set i th value as val
    for (let j = this.sLen - 1; j >= 0; j--) {
      this.value[this.sLen * i + j] = val % 2;
      val >>= 1;
    }
  }

  printChromosome() {
    let list = [];
    for (let i = 0; i < this.sNum; i++) {
      let tmp = this.getSlotValue(i);
      list.push(tmp);
    }
    console.log(list);
  }

  errorResolve() {
    for (let i = 0; i < this.sNum; i++) {
      let tmp = this.getSlotValue(i);
      if (tmp >= this.sMax) {
        this.setSlotValue(i, getRandInt(0, this.sMax));
      }
    }
  }

  getOutput() {
    let result = [];
    for (let i = 0; i < this.sNum; i++) {
      let tmp = this.getSlotValue(i);
      result.push(tmp);
    }
    return result;
  }
}

function getWorkerInfo(jsonFile) {
  let workerData = JSON.parse(JSON.stringify(WorkerInfo));
  let result = [];
  for (let name in workerData) {
    result.push({ name: name, data: workerData[name] });
  }
  return result;
}

class Worker {
  constructor(name) {
    this.name = name;
    this.chromosome = new Chromosome(SHIFT_LEN, WORKER_BIT, WORKER_NUM);
    this.constraints = { hard: [], soft: [] };
  }
}

class GeneticAlgorithm {
  constructor() {
    this.workers;
  }

  initialize() {
    this.workers = getWorkerInfo();
  }

  run() {
    return result;
  }
}
function range(start, end) {
  // start ... end
  if (end < start) return [];
  return [...Array(end - start + 1).keys()].map((i) => i + start);
}

let checkFuncList = [noCertainDate, () => {}];

function isNight(a) {
  //평야, 금야, 토주1, 토주2, 토야, 일야
  return a != 2 && a != 3;
}

function isHoliday(a) {
  return a != 0 && a != 1;
}

function parseDate(type, str) {
  let year,
    month,
    date,
    shift = 0;
  let day = -1;
  if (type === 0) {
    let tmp = str.split("_").map((e) => {
      return parseInt(e, 10);
    });
    year = tmp[0];
    month = tmp[1];
    date = tmp[2];
    shift = tmp[3]; //주말일 경우, 0 : 주간1, 1 : 주간2, 2 : 야간, 평일일 경우 2 : 야간
  } else if (type === 1) {
    //with wild card
    let tmp = str.split("_").map((e) => {
      return parseInt(e, 10);
    });
    // *_*_*_*_0~2
    year = isNaN(tmp[0]) ? YEAR % 100 : tmp[0];
    month = isNaN(tmp[1]) ? MONTH : tmp[1];
    date = isNaN(tmp[2]) ? -1 : tmp[2];
    day = isNaN(tmp[3]) ? -1 : tmp[3];

    shift = tmp[4]; // wild card not allowed
  }
  return { year: year, month: month, date: date, shift: shift, day: day };
}

function getIdxOfShift(date, shift, shiftConf) {
  // date start from 1
  let idx = 0;
  let shiftLen = shiftConf.dateOffset[date] - shiftConf.dateOffset[date - 1];
  if (shiftLen === 3) {
    idx = shiftConf.dateOffset[date - 1] + shift;
  } else if (shiftLen === 1) {
    idx = shiftConf.dateOffset[date - 1];
  }
  return idx;
}

// is y2, m2 is equal or larger than y1, m1
function compareYM(y1, m1, y2, m2) {
  let d1 = new Date(2000 + y1, m1, 1);
  let d2 = new Date(2000 + y2, m2, 1);
  return Math.sign(d2 - d1);
}

function makeDateValid(type, r, shiftConf) {
  let startParse = parseDate(type, r.start);
  let endParse = parseDate(type, r.end);
  let startIdx = 0;
  let endIdx = shiftConf.result.length - 1;
  let cmpStart = compareYM(
    startParse.year,
    startParse.month,
    YEAR % 100,
    MONTH
  );
  let cmpEnd = compareYM(YEAR % 100, MONTH, endParse.year, endParse.month);
  // is endParse after current YEAR and MONTH
  if (cmpEnd < 0) {
    return { isValid: false, list: [] };
  } else {
    if (type === 0) {
      // is startParse before current YEAR and MONTH
      if (cmpStart === 0)
        startIdx = getIdxOfShift(startParse.date, startParse.shift, shiftConf);
      if (cmpEnd === 0)
        endIdx = getIdxOfShift(endParse.date, endParse.shift, shiftConf);
      if (startIdx <= endIdx)
        return { isValid: true, list: range(startIdx, endIdx) };
    } else if (type === 1) {
      let result = [];
      if (cmpStart === 0 && cmpEnd === 0) {
        let monthInfo = configMonth(YEAR, MONTH);
        let idx_min = getIdxOfShift(
          startParse.date,
          startParse.shift,
          shiftConf
        );
        let idx_max = getIdxOfShift(endParse.date, endParse.shift, shiftConf);

        if (startParse.day === -1 && endParse.day === -1) {
          if (startParse.shift <= endParse.shift) {
            for (let i = 1; i < monthInfo.len + 1; i++) {
              startIdx = getIdxOfShift(i, startParse.shift, shiftConf);
              endIdx = getIdxOfShift(i, endParse.shift, shiftConf);
              result.push(...range(startIdx, endIdx));
            }
            return { isValid: true, list: result };
          }
        } else if (startParse.day >= 0 && endParse.day >= 0) {
          if (startParse.day === endParse.day) {
            // only work for certain day
            if (startParse.shift <= endParse.shift) {
              for (let i = 1; i < monthInfo.len + 1; i++) {
                // if ith day is on the same day with startParse.date
                let daynum = (i - 1 + monthInfo.offset) % 7;
                if (daynum === startParse.day) {
                  startIdx = getIdxOfShift(i, startParse.shift, shiftConf);
                  endIdx = getIdxOfShift(i, endParse.shift, shiftConf);
                  result.push(...range(startIdx, endIdx));
                }
              }
              return { isValid: true, list: result };
            }
          }
        }
      }
    }
  }
  return { isValid: false, list: [] };
}

function* genBlackList(type, ranges, shiftConf) {
  //create BlackList from ranges in constraints
  for (let r of ranges) {
    let validDate = makeDateValid(type, r, shiftConf);
    if (validDate.isValid)
      yield {
        desc: r.desc,
        list: validDate.list,
      };
  }
}

function makeBlackList(workerList, shiftConf) {
  let result = Array(workerList.length)
    .fill(0)
    .map((_) => []);
  for (let idx = 0; idx < workerList.length; idx++) {
    let cList = workerList[idx].data.constraints;
    for (let i = 0; i < cList.length; i++) {
      let workerResult = { type: cList[i].type, list: [] };
      let ranges = cList[i].ranges;
      let blackGen = genBlackList(cList[i].type, ranges, shiftConf);
      while (true) {
        let tmp = blackGen.next();
        if (tmp.done) break;
        workerResult.list.push(tmp.value);
      }
      result[idx].push(workerResult);
    }
  }
  console.log(result);
  return result;
}

function getShiftOnDate(shiftConf, output, idx, date) {
  //returns index of shifts on that date for that worker
  let offset = shiftConf.dateOffset;
  //console.log(offset);
  //console.log(output);
  let result = [];
  for (let i = offset[date - 1]; i < offset[date]; i++) {
    //date start from 0
    if (output[i] === idx) {
      result.push(i);
    }
  }
  return result;
}

function getShiftString(shiftConf, shiftName, date, idx) {
  return date + "일 " + shiftName[shiftConf.result[idx]];
}

function noCertainDate(
  shiftConf,
  shiftName,
  output,
  workerList,
  idx,
  blackList
) {
  //blackList에 해당하는 근무가 idx번째 근무자에게 없는지 확인
  let errorMsg = "";
  let result = [];
  for (let b = 0; b < blackList.length; b++) {
    let currDate = blackList[b];
    let shiftList = getShiftOnDate(
      shiftConf,
      output,
      workerList,
      idx,
      currDate
    );
    result.push(...shiftList);
    for (let s = 0; s < shiftList.length; s++) {
      // what shift is shiftList[s]
      errorMsg +=
        getShiftString(shiftConf, shiftName, currDate, shiftList[s]) + ", ";
    }
  }
  return { msg: errorMsg, idx: result };
}

function checkWorker(shiftConf, shiftName, output, workerList, idx) {
  let cList = workerList[idx].data.constraints;
  let errorMsg = "[" + getFullName(workerList, idx) + "]\n";
  let num = 1;
  let errorIdx = [];
  for (let i = 0; i < cList.length; i++) {
    let checkFunc = checkFuncList[cList[i].type];
    let blackList = makeBlackList(cList[i].ranges);
    let checkRes = checkFunc(
      shiftConf,
      shiftName,
      output,
      workerList,
      idx,
      blackList
    );
    if (checkRes.idx.length) {
      errorIdx.push({ type: cList[i].type, idx: checkRes.idx });
      errorMsg += num + ") " + cList[i].desc + " 위반 : " + checkRes.msg + "\n";
      num++;
    }
  }
  return { msg: errorMsg, info: errorIdx };
}

function checkConstraints(shiftMask, shiftName, output, workerList) {
  let errorBoard = document.getElementById("errorBoard");
  let infoList = [];
  for (let i = 0; i < workerList.length; i++) {
    let checkResult = checkWorker(shiftMask, shiftName, output, workerList, i);
    errorBoard.innerText += checkResult.msg;
    if (checkResult.info.length) infoList.push(checkResult.info);
  }
  return infoList;
}

function makeWrongDict(checkResult) {
  //checkResult : i번째 worker가 어떤 type에 의해서 위배되는 게 몇번째 근무인지
  // 각 근무별로 위반 되는 constraints가 나오게 mapping
  let wrongDict = {};
  for (let i = 0; i < checkResult.length; i++) {
    console.log(checkResult);
    for (let j = 0; j < checkResult[i].length; j++) {
      let tmp_idx = checkResult[i][j].idx;
      let tmp_type = checkResult[i][j].type;
      for (let k = 0; k < tmp_idx.length; k++) {
        if (wrongDict[tmp_idx[k]]) {
          wrongDict[tmp_idx[k]].push(tmp_type);
          console.log("pushed");
        } else {
          wrongDict[tmp_idx[k]] = [tmp_type];
        }
      }
    }
  }
  return wrongDict;
}

let a = new Chromosome(SHIFT_LEN, WORKER_BIT, WORKER_NUM);
a.init();
let workerList = getWorkerInfo("worker.json");

//let output = a.getOutput();

let output = [
  14, 13, 6, 11, 7, 12, 5, 14, 12, 2, 12, 11, 7, 7, 14, 5, 5, 3, 2, 6, 14, 5, 3,
  11, 2, 6, 3, 11, 7, 6, 5, 11, 13, 5, 3, 11, 11, 9, 14, 10, 8, 2, 7, 6, 7, 4,
  3, 9, 5, 4, 3, 3, 2, 8, 2, 14,
];

let blackList = makeBlackList(workerList, SHIFT_CONFIG);
/*
let checkResult = checkConstraints(
  SHIFT_CONFIG,
  SHIFT_NAME,
  output,
  workerList
);
*/
//let wrongDict = makeWrongDict(checkResult);

createCalendar(YEAR, MONTH, COLORED_DATE, output, workerList);

// get ith div and color that div
// date of that ith shift

function idxToDate(shiftConf, idx) {
  for (let i = 1; i < shiftConf.dateOffset.length; i++) {
    if (shiftConf.dateOffset[i] > idx) {
      return { date: i - 1, offset: idx - shiftConf.dateOffset[i - 1] };
    }
  }
  return undefined;
}

function getDivOfRange(shiftConf, start, end) {
  let td_list = document.getElementsByClassName("name");
  let startDate = idxToDate(shiftConf, start);
  let endDate = idxToDate(shiftConf, end);
  if (startDate === undefined || endDate === undefined) {
    return undefined;
  }
  let div_list = [];
  for (let date = startDate.date; date <= endDate.date; date++) {
    let tmp = td_list[date].querySelectorAll("div");
    if (date === startDate.date) {
      for (let i = startDate.offset; i < tmp.length; i++) {
        div_list.push(tmp[i]);
      }
    } else if (date === endDate.date) {
      for (let i = 0; i <= endDate.offset; i++) {
        div_list.push(tmp[i]);
      }
    } else {
      div_list.push(...tmp);
    }
  }
  return div_list;
}

// modify calendar with blackList
function colorConst(shiftConf, workerList, blackList, i) {
  // get div of that worker
  let name_short = getName(workerList, i);

  let tmp_black = blackList[i];
  let errorBoard = document.getElementById("errorBoard");
  let const_div = document.createElement("div");
  const_div.classList.add("constraints", name_short);
  const_div.innerText = "[" + name_short + "]";

  errorBoard.appendChild(const_div);
  for (let b of tmp_black) {
    if (b.type === 0 && b.list.length != 0) {
      for (let c of b.list) {
        let select_list = getDivOfRange(
          shiftConf,
          c.list[0],
          c.list[c.list.length - 1]
        );

        let button = document.createElement("button");
        button.classList.add("type" + b.type);
        button.id = name_short + "constbtn";
        button.val = 0;
        button.innerHTML =
          c.desc +
          " : " +
          (idxToDate(shiftConf, c.list[0]).date + 1) +
          "~" +
          (idxToDate(shiftConf, c.list[c.list.length - 1]).date + 1);
        function toggle(btn, type) {
          if (btn.val === 0) {
            for (let div of select_list) {
              div.classList.add(type);
            }
            btn.val = 1;
          } else if (btn.val === 1) {
            for (let div of select_list) {
              div.classList.remove(type);
            }
            btn.val = 0;
          }
        }
        button.onclick = function () {
          toggle(button, "hardConst");
        };
        const_div.appendChild(button);
      }
    }
  }
}

for (let i = 0; i < workerList.length; i++) {
  colorConst(SHIFT_CONFIG, workerList, blackList, i);
  compareConst(SHIFT_CONFIG, workerList, blackList, i);
}

function compareConst(shiftConf, workerList, blackList, i) {
  let tmp_black = blackList[i];
  let name_short = getName(workerList, i);
  for (let b of tmp_black) {
    if (b.type === 0 && b.list.length != 0) {
      for (let c of b.list) {
        let select_list = getDivOfRange(
          shiftConf,
          c.list[0],
          c.list[c.list.length - 1]
        );
        for (let div of select_list) {
          if (div.classList.contains(name_short)) {
            div.classList.add("wrong");
          }
        }
      }
    }
  }
}

export function getShiftStats(shiftMask, output, workerList) {
  let result = Array(workerList.length);
  for (let i = 0; i < result.length; i++) {
    result[i] = Array(6).fill(0);
  }
  for (let i = 0; i < output.length; i++) {
    result[output[i]][shiftMask[i]] += 1;
  }
  return result;
}

//need edit, save calendar mode
//createStats(SHIFT_MASK, SHIFT_NAME, output, workerList);
