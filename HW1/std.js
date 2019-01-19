uniform = JSON.parse(uniform);
_1gaussian = JSON.parse(_1gaussian);
_10gaussian = JSON.parse(_10gaussian);
_100gaussian = JSON.parse(_100gaussian);
_200gaussian = JSON.parse(_200gaussian);
_500gaussian = JSON.parse(_500gaussian);
Chart.defaults.global.elements.point.radius = 1;
Chart.defaults.global.elements.point.pointStyle = "line";
allInfo = {0: uniform, 1: _1gaussian, 10: _10gaussian, 100: _100gaussian, 200: _200gaussian, 500: _500gaussian};

const colors = {
  0: 'rgba(255,99,132,1)',
  1: 'rgba(255, 99, 132, 0.2)',
  10: 'rgba(54, 162, 235, 0.2)',
  100: 'rgba(255, 206, 86, 0.2)',
  200: 'rgba(75, 192, 192, 0.2)',
  500: 'rgba(153, 102, 255, 0.2)',
}

drawChart("2");
drawChart("4");
drawChart("8");
drawChart("16");
drawChart("32");
drawChart("64");

function drawChart(processorNum) {
  const datasets = []
  for (let p of Object.keys(allInfo)) {
    if (p === '0') continue;
    let dataset = {};
    let data = [];

    for (let m of allInfo[p][processorNum]) {
      data.push(m[1]);
    }
    dataset.data = data;
    dataset.label = `${p === '0' ? "uniform" : p + "_gaussian"}`;
    dataset.borderColor = colors[p];
    dataset.backgroundColor = colors[p];
    dataset.fill = false;
    datasets.push(dataset);
  }

  let ctx = document.getElementById(processorNum).getContext('2d');
  let myLineChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: generateLabels(),
      datasets: datasets,
    },
    options: {
      title: {
        display: true,
        text: `processor - ${processorNum}`,
      },
      scales: {
        yAxes: [{
          ticks: {
            max: 0.5,
            min: 0,
          }
        }]
      }
    }
  });

}

function generateLabels() {
  let labels = [];
  for (let i = 1; i <= 2048; i++) {
    labels.push(i + "");
  }
  return labels;
}
