let element = document.querySelector('#gaugeArea')

let gaugeOptions = {
  // needle options
  hasNeedle: false,
  outerNeedle: false,
  needleColor: 'gray',
  needleStartValue: 10,
  needleUpdateSpeed: 1000,
  // arc options
  arcColors: ['rgb(24,175,0)', 'rgb(279,0,0)'],
  arcDelimiters: [80],
  arcPadding: 0,
  arcPaddingColor: 'red',
  arcLabels: ['35'],
  arcLabelFontSize: false,
  centralLabel: '175',
  rangeLabelFontSize: false,
  labelsFont: 'Consolas',
}

GaugeChart.gaugeChart(element, 400, gaugeOptions).updateNeedle(50)
