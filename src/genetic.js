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
var year = 2022;
var month = 12;
const SHIFT_NUM = [[0, 1, 2], [3], [4], [5], [6], [7], [8, 9, 10]];

function makeShiftArr(year, month) {
  let startDate = new Date(year, month - 1, 1);

  if (month == 12) {
    year += 1;
    month = 1;
  } else {
    month += 1;
  }

  let endDate = new Date(year, month - 1, 1);
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

const SHIFT_MASK = makeShiftArr(year, month);
const SHIFT_LEN = SHIFT_MASK.length;

class Chromosome {
  constructor(len) {
    this.len = len;
    this.value = Array(len).fill(0);
  }

  init() {
    let prob = 0.5;
    function rndFunc() {
      return Math.random() >= prob ? 1 : 0;
    }
    this.value = this.value.map(rndFunc);
  }
}

function getWorkerInfo(jsonFile) {
  let workerData = JSON.parse(JSON.stringify(WorkerInfo));
  return workerData;
}

class Worker {
  constructor(name) {
    this.name = name;
    this.chromosome = new Chromosome(SHIFT_LEN);
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
