uniform = JSON.parse(uniform);
gaussian = JSON.parse(gaussian);


const colors = {
  2: 'rgba(255,99,132,1)',
  4: 'rgba(255, 99, 132, 0.2)',
  8: 'rgba(54, 162, 235, 0.2)',
  16: 'rgba(255, 206, 86, 0.2)',
  32: 'rgba(75, 192, 192, 0.2)',
  64: 'rgba(153, 102, 255, 0.2)',
}

drawChart(uniform, "uniform");
drawChart(gaussian, "gaussian");

function drawChart(arr, type) {
  const datasets = []
  for (let p of Object.keys(arr)) {
    let dataset = {};
    let data = [];
    for (let m of arr[p]) {
      data.push(m[1]);
    }
    dataset.data = data;
    dataset.label = `p = ${p}`;
    dataset.borderColor = colors[p];
    dataset.backgroundColor = colors[p];
    dataset.fill = false;
    datasets.push(dataset);
  }

  let ctx = document.getElementById(type).getContext('2d');
  let myLineChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: generateLabels(),
      datasets: datasets,
    },
    options: {
      title: {
        display: true,
        text: `${type} distribution`
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
