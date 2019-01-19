const jsonfile = require('jsonfile');

const type = "gaussian";
const std_dev = 500;
const log = false;

// calculate(2048, 20, type);
generateFile(type);

function generateFile(type) {
  const P = [2, 4, 8, 16, 32, 64];
  const data = {};

  for (let p of P) {
    let res = [];
    for (let m = 1; m <= 2048; m++) {
      res.push([m, calculate(m, p, type)]);
    }
    data[p] = res;
  }

  jsonfile.writeFile(`data/${type}.json`, data, err => {
    if (err) console.log(err);
    else console.log("json created");
  })
}

function calculate(M, P, distribution) {
  // size is P and each element represented a memory module
  const requests = [];
  // size is P and each element represented the total waiting time
  const waitCounters = [];
  // size is P and each element represented the current waiting time
  const curWaitCounters = [];
  // size is M and 1 if the represented memory is already connected to a processing element and 0 if free.
  const memories = [];
  // size is P and each element is the mean for Gaussian Distribution
  const means = [];

  let totalRequests = 0;
  let cycles = 0;
  let prevAverageWaitingTime = null;
  let currAverageWaitingTime = null;

  for (let i = 0; i < P; i++) {
    requests.push(null);
    waitCounters.push(0);
    curWaitCounters.push(0);
  }

  if (distribution === "gaussian") {
    for (let i = 0; i < P; i++) {
      means.push(uniformDistribution(M));
    }
  }

  for (let i = 0; i < M; i++) {
    memories.push(0);
  }

  while (diff(currAverageWaitingTime, prevAverageWaitingTime)) {
    cycles++;
    prevAverageWaitingTime = currAverageWaitingTime;
    for (let i = 0; i < requests.length; i++) {
      if (!requests[i]) {
        if (distribution === "gaussian") {
          requests[i] = getNumberIngaussianDistribution(means[i], std_dev, M);
        } else if (distribution === "uniform") {
          requests[i] = uniformDistribution(M);
        } else {
          throw new Error("The distribution is invalid");
        }
      }
    }

    let priorityMap = new Map();

    for (let i = 0; i < requests.length; i++) {
      let memoryId = requests[i];
      let curWaitTime = curWaitCounters[i];
      if (!priorityMap.has(memoryId)) {
        priorityMap.set(memoryId, [i, curWaitTime]);
      } else {
        maxWaitTime = priorityMap.get(memoryId)[1];
        if (curWaitTime > maxWaitTime) {
          priorityMap.set(memoryId, [i, curWaitTime]);
        }
      }
    }

    let priorityProcessor = new Map();

    for (let memoryId of priorityMap.keys()) {
      let processor = priorityMap.get(memoryId);
      priorityProcessor.set(processor[0], memoryId);
    }

    for (let i = 0; i < requests.length; i++) {
      if (priorityProcessor.has(i)) {
        let memoryId = priorityProcessor.get(i);
        memories[memoryId] = 1;
        requests[i] = null;
        curWaitCounters[i] = 0;
        totalRequests++;
      } else {
        waitCounters[i]++;
        curWaitCounters[i]++;
      }
    }

    currAverageWaitingTime = waitCounters.reduce((acc, cur) => acc + cur) / totalRequests;

    for (let i = 0; i < memories.length; i++) {
      memories[i] = 0;
    }
  }

  if (log) {
    console.log(`final curr is ${currAverageWaitingTime} and prev is ${prevAverageWaitingTime}`);
    console.log(`totalRequests is ${totalRequests}`)
    console.log(`cycles is ${cycles}`)
  }

  return currAverageWaitingTime;
}

function uniformDistribution(memories) {
  return Math.floor(Math.random() * memories);
}

function getNumberIngaussianDistribution(mean, std_dev, total) {
 let diff = Math.round(gaussianDistribution(mean, std_dev));
 if (diff == 0) return mean;
 let direct = diff > 0 ? 1 : -1;
 for (let i = 0; i < Math.abs(diff); i++) {
   mean += direct;
   if (mean >= total) mean = 0;
   if (mean < 0) mean = total - 1;
 }
 return mean;
}

function diff(curr, prev) {
  return prev === null || (Math.abs(curr - prev) / prev) >= 2e-4;
}

function gaussianDistribution(mean, std_dev){
    return mean + (uniform2NormalDistribution() * std_dev);
}

function uniform2NormalDistribution(){
    let sum = 0.0;
    for(let i = 0; i < 12; i++){
        sum = sum + Math.random();
    }
    return sum - 6.0;
}
