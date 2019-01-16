const jsonfile = require('jsonfile');

const P = [2, 4, 8, 16, 32, 64];
const data = {};

for (let p of P) {
  let res = [];
  for (let m = 1; m <= 2048; m++) {
    res.push([m, calculate(m, p, "gaussian")]);
  }
  data[p] = res;
}

jsonfile.writeFile('gaussian.json', data, err => {
  if (err) console.log(err);
  else console.log("json created");
})

function calculate(M, P, distribution) {
  // size is P and each element represented a memory module
  const requests = [];
  // size is P and each element represented the current waiting time
  const waitCounters = [];
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
    // console.log(`curr is ${currAverageWaitingTime} and prev is ${prevAverageWaitingTime}`);
    prevAverageWaitingTime = currAverageWaitingTime;
    for (let i = 0; i < requests.length; i++) {
      if (!requests[i]) {
        if (distribution === "gaussian") {
          requests[i] = gaussianDistribution(means[i], M);
        } else if (distribution === "uniform") {
          requests[i] = uniformDistribution(M);
        } else {
          throw new Error("The distribution is invalid");
        }
      }
    }

    for (let i = 0; i < requests.length; i++) {
      let memoryId = requests[i];
      if (memories[memoryId] == 0) {
        memories[memoryId] = 1;
        requests[i] = null;
        totalRequests++;
      } else {
        waitCounters[i]++;
      }
    }

    currAverageWaitingTime = waitCounters.reduce((acc, cur) => acc + cur) / totalRequests;

    for (let i = 0; i < memories.length; i++) {
      memories[i] = 0;
    }
  }
  return currAverageWaitingTime;
  // console.log(`final curr is ${currAverageWaitingTime} and prev is ${prevAverageWaitingTime}`);
  // console.log(`totalRequests is ${totalRequests}`)
  // console.log(`cycles is ${cycles}`)
}

function uniformDistribution(memories) {
  return Math.floor(Math.random() * memories);
}

function gaussianDistribution(offset, total) {
 let u = 0, v = 0;
 while(u === 0) u = Math.random();//Converting [0,1) to (0,1)
 while(v === 0) v = Math.random();
 let diff = Math.round(Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v ));
 if (diff == 0) return offset;
 let direct = diff > 0 ? 1 : -1;
 for (let i = 0; i < Math.abs(diff); i++) {
   offset += direct;
   if (offset >= total) offset = 0;
   if (offset < 0) offset = total - 1;
 }
 return offset;
}

function diff(curr, prev) {
  return prev === null || (Math.abs(curr - prev) / prev) >= 2e-4;
}
