import { createCalendar } from "./calendar.js";

/* genetic algorithm 
1. initialize
- chromosome

2. evaluation 

3. selection

4. crossover

5. mutation
*/

/*
    일요일 부터 시작
    0    1   2   3    4   5    6    7   8    9    10
    일주1 일주2 일야 월야 화야 수야 목야 금야 토주1 토주2 토야
    
*/
const YEAR = 2022;
const MONTH = 12;
const SHIFT_NUM = [[0, 1, 2], [3], [4], [5], [6], [7], [8, 9, 10]];

function makeShiftArr(year, month) {
  let startDate = new Date(year, month - 1, 1);
  let e_year = year;
  let e_month = month;
  if (month == 12) {
    e_year += 1;
    e_month = 1;
  } else {
    e_month += 1;
  }

  let endDate = new Date(e_year, e_month - 1, 1);
  endDate.setDate(endDate.getDate() - 1);
  let startDay = startDate.getDay();
  let dateNum = endDate.getDate();

  let currDay = startDay;
  let result = [];
  for (let i = 0; i < dateNum; i++) {
    result.push(...SHIFT_NUM[currDay]);
    currDay++;
    if (currDay >= 7) currDay = 0;
  }
  return result;
}

const SHIFT_MASK = makeShiftArr(YEAR, MONTH);
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
createCalendar(a.getOutput(), workerList);
console.log(workerList);
