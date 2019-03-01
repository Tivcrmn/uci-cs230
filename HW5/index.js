let total = 0;

for (let i = 0; i < 1000; i++) {
  total += simulation(5);
}

console.log(`average time is ${total / 1000} cycles in 1000 trials`);

function simulation(numOfProcessor) {
  let cycle = 0;                    // the current cycles
  let totalUnits = 0;               // the totalUnits in all processors
  const P = [];                     // the current load unit in each processors
  const nextCycleForBalance = [];   // the next cycle to balance load units for each processor

  for (let i = 0; i < numOfProcessor; i++) {
    // init
    P[i] = random(10, 1000);
    nextCycleForBalance[i] = random(100, 1000);
    totalUnits += P[i];
  }

  while (!isBalanced(P, numOfProcessor, totalUnits)) {
    for (let i = 0; i < numOfProcessor; i++) {
      if (nextCycleForBalance[i] == cycle) {
        // traverse each processor, if it in a balance cycle, then balance
        let prev = trans(i - 1, numOfProcessor);
        let next = trans(i + 1, numOfProcessor);
        // the current processor will first balance prev, then if possible, balance next
        if (P[i] > P[next]) {
          let transLoad = Math.floor((P[i] - P[next]) / 2);
          P[i] -= transLoad;
          P[next] += transLoad;
        }
        if (P[i] > P[prev]) {
          let transLoad = Math.floor((P[i] - P[prev]) / 2);
          P[i] -= transLoad;
          P[prev] += transLoad;
        }
        // generate next balance cycle
        nextCycleForBalance[i] += random(100, 1000);
      }
    }
    cycle++;
  }
  console.log(`${cycle} cycles are used for converge to balance`);
  return cycle;
}

function random(left, right) {
  let c = right - left + 1;
	return Math.floor(Math.random() * c + left);
}

function trans(i, numOfProcessor) {
  // the processors are ring
  if (i < 0) return numOfProcessor - 1;
  if (i >= numOfProcessor) return 0;
  return i;
}

function getBaseLog(x, y) {
  return Math.log(y) / Math.log(x);
}

function isBalanced(P, numOfProcessor, totalUnits) {
  // init the l and h
  let l = 10000, h = -1;
  for (let i = 0; i < numOfProcessor; i++) {
    if (P[i] < l) l = P[i];
    if (P[i] > h) h = P[i];
    if (h - l > Math.floor(getBaseLog(10, numOfProcessor) * 7 * totalUnits / numOfProcessor / 100)) {
      return false;
    }
  }
  return true;
}
