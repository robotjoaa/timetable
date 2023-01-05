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

function parseDate(str) {
  let tmp = str.split("_").map((e) => {
    return parseInt(e, 10);
  });
  let year = tmp[0];
  let month = tmp[1];
  let date = tmp[2];
  let shift = tmp[3]; //주말일 경우, 0 : 주간1, 1 : 주간2, 2 : 야간, 평일일 경우 2 : 야간
  return { year: year, month: month, date: date, shift: shift };
}

function getIdxOfShift(date, shift, shiftConf) {
  let idx = 0;
  let shiftLen = shiftConf.offset[date] - shiftConf.offset[date - 1];
  console.log(shiftLen);
  if (shiftLen === 3) {
    idx = shiftConf.offset[date - 1] + shift;
  } else if (shiftLen === 1) {
    idx = shiftConf.offset[date - 1];
  }
  return idx;
}

function makeDateValid(range, shiftConf) {
  let startParse = parseDate(range.start);
  let endParse = parseDate(range.end);
  let isValid = false;
  let startIdx = 0;
  let endIdx = 0;
  // is endParse after current YEAR and MONTH
  if (YEAR % 100 <= endParse.year && MONTH <= endParse.month) {
    // is startParse before current YEAR and MONTH
    if (startParse.year <= YEAR % 100 || startParse.month <= MONTH) {
      startIdx = 0;
    } else {
      // read it from json
      startIdx = getIdxOfShift(startParse.date, startParse.shift, shiftConf);
    }
    endIdx = getIdxOfShift(endParse.date, endParse.shift, shiftConf);
    isValid = true;
  }
  return { isValid: isValid, start: startIdx, end: endIdx }; //get shift index
}

function* genBlackList(ranges, shiftConf) {
  //create BlackList from ranges in constraints
  for (let i = 0; i < ranges.length; i++) {
    let validDate = makeDateValid(ranges[i], shiftConf);
    if (validDate.isValid) yield range(validDate.start, validDate.end);
  }
}

function makeBlackList(workerList, shiftConf) {
  for (let idx = 0; idx < workerList.length; idx++) {
    let cList = workerList[idx].data.constraints;
    for (let i = 0; i < cList.length; i++) {
      let ranges = cList[i].ranges;
      while (true) {
        let blackList = genBlackList(ranges, shiftConf).next();
        console.log(blackList);
        if (blackList.done) break;
      }
    }
  }
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
let wrongDict = makeWrongDict(checkResult);

createCalendar(YEAR, MONTH, COLORED_DATE, output, workerList, wrongDict);

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
