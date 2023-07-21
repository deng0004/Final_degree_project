// Create the charts when the web page loads
window.addEventListener('load', onload);

function onload(event){
  chartT = createTemperatureChart();
}

// Create Temperature Chart
function createTemperatureChart() {
var chart = new Highcharts.Chart({
  chart:{
    renderTo:'chart-temperature'
  },
  series: [
    {
      name: 'MQ2 Alcohol gas',
      type: 'line',
      color: '#101D42',
      marker: {
        symbol: 'circle',
        radius: 3,
        fillColor: '#101D42',
      }
    },
    {
      name: 'MQ2 CO gas',
      type: 'line',
      color: '#00A6A6',
      marker: {
        symbol: 'square',
        radius: 3,
        fillColor: '#00A6A6',
      }
    },
    {
      name: 'MQ2 H2 gas',
      type: 'line',
      color: '#8B2635',
      marker: {
        symbol: 'triangle',
        radius: 3,
        fillColor: '#8B2635',
      }
    },
    {
      name: 'MQ2 LPG gas',
      type: 'line',
      color: '#71B48D',
      marker: {
        symbol: 'triangle-down',
        radius: 3,
        fillColor: '#71B48D',
      }
    },
    {
      name: 'MQ2 Propane gas',
      type: 'line',
      color: '#2f7ed8',
      marker: {
        symbol: 'cross',
        radius: 3,
        fillColor: '#2f7ed8',
      }
    },
    {
      name: 'MQ3 Alcohol gas',
      type: 'line',
      color: '#7186b4',
      marker: {
        symbol: 'cross',
        radius: 3,
        fillColor: '#7186b4',
      }
    },
    {
      name: 'MQ3 Benzane gas',
      type: 'line',
      color: '#7371b4',
      marker: {
        symbol: 'cross',
        radius: 3,
        fillColor: '#7371b4',
      }
    },
    {
      name: 'MQ3 CH4 gas',
      type: 'line',
      color: '#9371b4',
      marker: {
        symbol: 'cross',
        radius: 3,
        fillColor: '#9371b4',
      }
    },
    {
      name: 'MQ3 CO gas',
      type: 'line',
      color: '#2f7ed8',
      marker: {
        symbol: 'cross',
        radius: 3,
        fillColor: '#2f7ed8',
      }
    },
    {
      name: 'MQ3 Hexane gas',
      type: 'line',
      color: '#b171b4',
      marker: {
        symbol: 'cross',
        radius: 3,
        fillColor: '#b171b4',
      }
    },
    {
      name: 'MQ3 LPG gas',
      type: 'line',
      color: '#b171b4',
      marker: {
        symbol: 'cross',
        radius: 3,
        fillColor: '#b171b4',
      }
    },
    {
      name: 'MQ136 CO gas',
      type: 'line',
      color: '#b47196',
      marker: {
        symbol: 'cross',
        radius: 3,
        fillColor: '#b47196',
      }
    },
    {
      name: 'MQ136 H2S gas',
      type: 'line',
      color: '#b49971',
      marker: {
        symbol: 'cross',
        radius: 3,
        fillColor: '#b49971',
      }
    },
    {
      name: 'MQ136 NH4 gas',
      type: 'line',
      color: '#b48171',
      marker: {
        symbol: 'cross',
        radius: 3,
        fillColor: '#b48171',
      }
    }
  ],
  title: {
    text: undefined
  },
  xAxis: {
    type: 'datetime',
    dateTimeLabelFormats: { second: '%H:%M:%S' }
  },
  yAxis: {
    title: {
      text: 'Concentration, Parts Per Million (PPM)'
    }
  },
  credits: {
    enabled: false
  }
});
  return chart;
}

