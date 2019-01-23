const jsonfile = require('jsonfile');

const type = "uniform";
const std_dev = 500;
const log = true;

calculate(1, 64, type);
// generateFile(type);

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

/**
 * calculate the average waiting time
 * @param {Number} M the number of the memories
 * @param {Number} P the number of the processors
 * @param {String} distribution the type of distribution(uniform of gaussian)
 */
function calculate(M, P, distribution) {
  // size is P, requests[i] = j means processor i connects to memory j
  const requests = [];
  // size is P, waitCounters[i] = j means the total waiting time for processor i is j
  const waitCounters = [];
  // size is P, waitCounters[i] = j means the current waiting time for processor i is j
  const curWaitCounters = [];
  // size is M, memories[i] = 1 means memory i connected to a processor (0 means not)
  const memories = [];
  // size is P, means[i] = j means the mean of processor i is j in Gaussian Distribution
  const means = [];

  // total number of successful requests
  let totalRequests = 0;
  // total number of cycles
  let cycles = 0;
  let prevAverageWaitingTime = null;
  let currAverageWaitingTime = null;

  // init
  for (let i = 0; i < P; i++) {
    requests.push(null);
    waitCounters.push(0);
    curWaitCounters.push(0);
  }

  for (let i = 0; i < M; i++) {
    memories.push(0);
  }

  if (distribution === "gaussian") {
    for (let i = 0; i < P; i++) {
      means.push(uniformDistribution(M));
    }
  }

/**
  * main while for calculate, the termination condition to count average wait time is
  * when the current value differs from the previous one by less than 0.02%.
  */
  while (diff(currAverageWaitingTime, prevAverageWaitingTime)) {
    cycles++;
    prevAverageWaitingTime = currAverageWaitingTime;

    // make new requests for each processor if they have just finished one
    // based on the current distribution
    for (let i = 0; i < requests.length; i++) {
      // if requests[i] == null
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

    // To avoid processing element starvation, prioritize the one waiting longestr.
    // for priorityMap, key is the memoryId, value is the processorId and curWaitTime
    let priorityMap = new Map();

    for (let i = 0; i < requests.length; i++) {
      let memoryId = requests[i];
      let curWaitTime = curWaitCounters[i];

      if (!priorityMap.has(memoryId)) {
        // if memoryId is not in priorityMap, just assign the memory to processor i
        priorityMap.set(memoryId, [i, curWaitTime]);
      } else {
        // if memoryId is in priorityMap, compare the value
        maxWaitTime = priorityMap.get(memoryId)[1];
        if (curWaitTime > maxWaitTime) {
          priorityMap.set(memoryId, [i, curWaitTime]);
        }
      }
    }

    // invert the key value pairs in priorityMap, key is processorId now
    let priorityProcessor = new Map();

    for (let memoryId of priorityMap.keys()) {
      let processor = priorityMap.get(memoryId);
      priorityProcessor.set(processor[0], memoryId);
    }

    // use the results to update the requests
    for (let i = 0; i < requests.length; i++) {
      if (priorityProcessor.has(i)) {
        // current processor has been assigned a new memory
        let memoryId = priorityProcessor.get(i);
        memories[memoryId] = 1;
        requests[i] = null;
        curWaitCounters[i] = 0;
        totalRequests++;
      } else {
        // current processor has not been assigned a new memory, add the waiting time
        waitCounters[i]++;
        curWaitCounters[i]++;
      }
    }

    // calculate the currAverageWaitingTime
    currAverageWaitingTime = waitCounters.reduce((acc, cur) => acc + cur) / totalRequests;

    // free the memories
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
  // using gaussianDistribution function generating the memory index
  let diff = Math.round(gaussianDistribution(mean, std_dev));
  // find the direction 1 or -1
  let direct = diff > 0 ? 1 : -1;
  for (let i = 0; i < Math.abs(diff); i++) {
    // add the direct diff times and guarantee the range in the 1 - totoalNumber of memeories
    mean += direct;
    if (mean >= total) mean = 0;
    if (mean < 0) mean = total - 1;
  }
  return mean;
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

function diff(curr, prev) {
  return prev === null || (Math.abs(curr - prev) / prev) >= 2e-4;
}
