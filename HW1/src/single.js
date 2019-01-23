uniform = JSON.parse(uniform);
_1gaussian = JSON.parse(_1gaussian);

const colors = {
  2: 'rgba(255,99,132,1)',
  4: 'rgba(255, 99, 132, 0.2)',
  8: 'rgba(54, 162, 235, 0.2)',
  16: 'rgba(255, 206, 86, 0.2)',
  32: 'rgba(75, 192, 192, 0.2)',
  64: 'rgba(153, 102, 255, 0.2)',
}

drawChart(uniform, _1gaussian);

function drawChart(uniform, _1gaussian) {
  const uniform_datasets = [];
  const gaussian_datasets = [];
  for (let p of Object.keys(uniform)) {
    let dataset = {};
    let data = [];
    for (let m of uniform[p]) {
      data.push(m[1]);
    }
    dataset.data = data;
    dataset.label = `p = ${p} uniform`;
    dataset.borderColor = colors['2'];
    dataset.backgroundColor = colors['2'];
    dataset.fill = false;
    uniform_datasets.push(dataset);
  }

  for (let p of Object.keys(_1gaussian)) {
    let dataset = {};
    let data = [];
    for (let m of _1gaussian[p]) {
      data.push(m[1]);
    }
    dataset.data = data;
    dataset.label = `p = ${p} gaussian`;
    dataset.borderColor = colors['8'];
    dataset.backgroundColor = colors['8'];
    dataset.fill = false;
    gaussian_datasets.push(dataset);
  }

  for (let i = 0; i < uniform_datasets.length; i++) {
    let id = `${Math.pow(2, i + 1)}`
    let ctx = document.getElementById(id).getContext('2d');
    let myLineChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: generateLabels(),
        datasets: [uniform_datasets[i], gaussian_datasets[i]],
      },
      options: {
        title: {
          display: true,
          text: id
        },
        scales: {
          yAxes: [{
            ticks: {
              // max: 5,
              // min: 0,
            },
            scaleLabel: {
              display: true,
              labelString: 'avg waiting time'
            }
          }],
          xAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'memories'
            }
          }]
        }
      }
    });
  }

}

function generateLabels() {
  let labels = [];
  for (let i = 1; i <= 2048; i++) {
    labels.push(i + "");
  }
  return labels;
}
