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
  for (let i = 0; i < coloredDate.length; i++) {
    if (coloredDate[i] === 2) {
      // 주말 중
      result.push(...[2, 3, 4]);
    } else if (coloredDate[i] === 3) {
      // 주말 끝
      result.push(...[2, 3, 5]);
    } else {
      result.push(coloredDate[i]);
    }
  }
  return { result: result, coloredDate: coloredDate };
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
      tmp = (tmp << 1) + this.value[i + j];
    }
    return tmp;
  }

  setSlotValue(i, val) {
    //set i th value as val
    for (let j = this.sLen - 1; j >= 0; j--) {
      this.value[i + j] = val % 2;
      val >>= 1;
    }
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

let a = new Chromosome(SHIFT_LEN, WORKER_BIT, WORKER_NUM);
a.init();
let workerList = getWorkerInfo("worker.json");
let output = a.getOutput();
createCalendar(YEAR, MONTH, COLORED_DATE, output, workerList);

createStats(SHIFT_MASK, SHIFT_NAME, output, workerList);
