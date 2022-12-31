import {
  makeColorDate,
  configMonth,
  createCalendar,
  createStats,
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
const YEAR = 2022;
const MONTH = 12;

//주말을 제외한 공유일 추가
//저번 달 마지막 날(0) 공휴일 이었는지, 다음달 첫날(dateNum+1) 공휴일 인지 확인 필요
const HOLIDAY_LIST = [5];

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

let checkFuncList = [noCertainDate];

function isNight(a) {
  //평야, 금야, 토주1, 토주2, 토야, 일야
  return a != 2 && a != 3;
}

function makeBlackList(ranges) {
  //create BlackList from ranges in constraints
  let result = [];
  for (let i = 0; i < ranges.length; i++) {
    result.concat(range(ranges[i].start, ranges[i].end));
  }
  return result;
}

function getShiftOnDate(shiftMask, output, workerList, idx, date) {
  //returns index of shift on that date for that worker
  for (
    let i = shiftMask.dateOffset[date];
    i < shiftMask.dateOffset[date + 1];
    i++
  ) {}
}

function noCertainDate(shiftMask, output, workerList, idx, blackList) {
  //blackList에 해당하는 근무가 idx번째 근무자에게 없는지 확인
  let errorMsg = "";
  for (let b = 0; b < blackList.length; b++) {
    let shiftList = getShiftOnDate(
      shiftMask,
      output,
      workerList,
      idx,
      blackList[b]
    );
    for (let s = 0; s < shiftList.length; s++) {
      errorMsg += shiftList[s] + ", ";
    }
  }
  return errorMsg;
}

function checkWorker(shiftMask, output, workerList, idx) {
  let cList = workerList[idx].data.constraints;
  let errorMsg = "";
  let num = 0;
  for (let i = 0; i < cList.length; i++) {
    let checkFunc = checkFuncList[cList[i].type];
    let blackList = makeBlackList(cList[i].ranges);
    let checkRes = checkFunc(shiftMask, output, workerList, idx, blackList);
    if (checkRes) {
      errorMsg += num + ") " + cList[i].desc + " 위반 : " + checkRes + "\n";
      num++;
    }
  }
  return errorMsg;
}

function checkConstraints(workerList) {
  let errorBoard = document.createElement("div");
  errorBoard.classList.add("errorBoard");
  document.getElementsById("body").appendChild(errorBoard);
  for (let i = 0; i < workerList.length; i++) {
    errorBoard.innerText += checkWorker(workerList, i);
  }
}

let a = new Chromosome(SHIFT_LEN, WORKER_BIT, WORKER_NUM);
a.init();
let workerList = getWorkerInfo("worker.json");
let output = a.getOutput();

createCalendar(YEAR, MONTH, COLORED_DATE, output, workerList);

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

createStats(SHIFT_MASK, SHIFT_NAME, output, workerList);
