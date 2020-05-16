export function generateProbMap(rollingItems) {
  let accProb = 0;

  const probMap = rollingItems.map((item, index) => {
    const lower = accProb;
    const upper = accProb + item.probability;
    accProb = upper;

    return { lower, upper };
  }, {});

  return probMap;
}

export function rollingWithProbMap(rollingItems, probMap) {
  const sum =
    rollingItems.reduce((sum, item) => sum + item.probability, 0) || 0;

  const score = Math.floor(Math.random() * sum);

  for (let i = 0; i < rollingItems.length; i++) {
    const { lower, upper } = probMap[i];

    if (score >= lower && score < upper) {
      return i;
    }
  }

  return rollingItems.length - 1;
}
