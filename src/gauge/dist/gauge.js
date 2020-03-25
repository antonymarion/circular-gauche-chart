"use strict";
exports.__esModule = true;
var d3_1 = require("d3");
var d3_scale_chromatic_1 = require("d3-scale-chromatic");
require("./gauge.css");
var gauge_interface_1 = require("./gauge-interface");
var needle_interface_1 = require("./needle-interface");
var param_checker_1 = require("./param-checker");
/**
 * Function that checks whether the number of colors is enough for drawing specified delimiters.
 * Adds standard colors if not enough or cuts the array if there are too many of them.
 * @param arcDelimiters - array of delimiters.
 * @param arcColors - array of colors (strings).
 * @returns modified list of colors.
 */
function arcColorsModifier(arcDelimiters, arcColors) {
    if (arcDelimiters.length > arcColors.length - 1) {
        var colorDiff = arcDelimiters.length - arcColors.length + 1;
        for (var i = 0; i < colorDiff; i++) {
            arcColors.push(d3_scale_chromatic_1.schemePaired[i % d3_scale_chromatic_1.schemePaired.length]);
        }
    }
    else if (arcDelimiters.length < arcColors.length - 1) {
        arcColors = arcColors.slice(0, arcDelimiters.length + 1);
    }
    return arcColors;
}
exports.arcColorsModifier = arcColorsModifier;
/**
 * Function that checks whether value that needle points at is between 0 and 100.
 * If it is less than 0 or larger than 100, value is equated to 0 and 100 respectively.
 * @param needleValue - value at which needle points.
 * @returns modified needleValue.
 */
function needleValueModifier(needleValue) {
    return needleValue < 0 ? 0 : needleValue > 100 ? 100 : needleValue;
}
exports.needleValueModifier = needleValueModifier;
/**
 * Function that converts percentage into radians.
 * @param perc - percentage.
 * @returns value in radians.
 */
function perc2RadWithShift(perc) {
    return (perc / 100 - 0.5) * 2 * Math.PI;
}
exports.perc2RadWithShift = perc2RadWithShift;
/**
 * Function for drawing gauge arc.
 * @param svg - original svg rectangle.
 * @param chartHeight - height of gauge.
 * @param arcColors - array of colors.
 * @param outerRadius - outter radius of gauge.
 * @param arcDelimiters - array of delimiters in percentage.
 * @returns modified svg.
 */
function shadeColor(color, percent) {
    var R = parseInt(color.substring(1, 3), 16);
    var G = parseInt(color.substring(3, 5), 16);
    var B = parseInt(color.substring(5, 7), 16);
    R = parseInt('' + (R * (100 + percent)) / 100);
    G = parseInt('' + (G * (100 + percent)) / 100);
    B = parseInt('' + (B * (100 + percent)) / 100);
    R = R < 255 ? R : 255;
    G = G < 255 ? G : 255;
    B = B < 255 ? B : 255;
    var RR = R.toString(16).length == 1 ? '0' + R.toString(16) : R.toString(16);
    var GG = G.toString(16).length == 1 ? '0' + G.toString(16) : G.toString(16);
    var BB = B.toString(16).length == 1 ? '0' + B.toString(16) : B.toString(16);
    return '#' + RR + GG + BB;
}
function arcOutline(svg, chartHeight, offset, arcColors, outerRadius, arcDelimiters, arcOverEffect, padding, paddingColor, arcLabels, arcLabelFontSize, labelsFont) {
    arcColors.forEach(function (color, i) {
        var startAngle = perc2RadWithShift(i ? arcDelimiters[i - 1] : 0);
        var endAngle = perc2RadWithShift(arcDelimiters[i] || 100); // 100 for last arc slice
        var gaugeArc = d3_1.arc()
            .innerRadius(chartHeight)
            .outerRadius(outerRadius)
            .startAngle(startAngle)
            .endAngle(endAngle);
        var currentGradientName = 'MyCircularGradient' + i;
        var linearGradient = svg
            .append('defs')
            .append('linearGradient')
            .attr('id', currentGradientName);
        linearGradient
            .append('stop')
            .attr('offset', '0%')
            .attr('stop-color', shadeColor(color, -10))
            .append('stop')
            .attr('offset', '30%')
            .attr('stop-color', shadeColor(color, -5));
        linearGradient
            .append('stop')
            .attr('offset', '60%')
            .attr('stop-color', color);
        var innerArc = svg
            .append('path')
            .attr('d', gaugeArc)
            .attr('fill', 'url(#' + currentGradientName + ')')
            .attr('transform', 'translate(' +
            (chartHeight + offset * 2) +
            ', ' +
            (chartHeight + offset) +
            ')');
        if (arcOverEffect) {
            gaugeArc = d3_1.arc()
                .innerRadius(chartHeight)
                .outerRadius(chartHeight + chartHeight * 0.1)
                .startAngle(startAngle)
                .endAngle(endAngle);
            var outerArc_1 = svg
                .append('path')
                .attr('d', gaugeArc)
                .attr('fill', 'transparent')
                .attr('opacity', '1')
                .attr('transform', 'translate(' +
                (chartHeight + offset * 2) +
                ', ' +
                (chartHeight + offset) +
                ')');
            innerArc
                .on('mouseover', function () {
                innerArc.style('opacity', 0.8);
                outerArc_1
                    .transition()
                    .duration(50)
                    .ease(d3_1.easeLinear)
                    .attr('fill', color);
            })
                .on('mouseout', function () {
                innerArc.style('opacity', 1);
                outerArc_1
                    .transition()
                    .duration(300)
                    .ease(d3_1.easeLinear)
                    .attr('fill', 'transparent');
            });
        }
    });
    arcColors.forEach(function (color, i) {
        if (arcDelimiters[i]) {
            var endAngle = perc2RadWithShift(arcDelimiters[i]);
            if (padding && paddingColor) {
                var scale = 1.1;
                var centerX = chartHeight + offset * 2;
                var centerY = offset - chartHeight * (scale - 1);
                svg
                    .append('rect')
                    .attr('x', 0)
                    .attr('y', 0)
                    .attr('fill', paddingColor)
                    .attr('width', padding)
                    .attr('height', chartHeight * scale)
                    .attr('transform', 'translate(' +
                    centerX +
                    ',' +
                    centerY +
                    ') ' +
                    'rotate(' +
                    (endAngle * 180) / Math.PI +
                    ', ' +
                    0 +
                    ',' +
                    chartHeight * scale +
                    ')');
            }
            if (arcLabels[i]) {
                // end of arc
                var spacing = 1.07;
                var x = chartHeight +
                    offset * 2 +
                    Math.cos(endAngle - (2 * Math.PI) / 2) * (chartHeight * spacing);
                var y = chartHeight +
                    offset +
                    Math.sin(endAngle - (2 * Math.PI) / 2) * (chartHeight * spacing);
                // font size
                var fontScale = 0.09;
                arcLabelFontSize =
                    arcLabelFontSize || Math.round(chartHeight * fontScale);
                // measure text width
                var canvas = document.createElement('canvas');
                var ctx = canvas.getContext('2d');
                ctx.font = arcLabelFontSize + 'px';
                var size = ctx.measureText(arcLabels[i]);
                // calc offset:
                // labels on the left need more offset (full width)
                // labels on the top need medium offset (half width)
                // labels on the right need little to no offset
                // endAngle = -PI/2 => offset = -width
                // endAngle = PI/2 => offset = 0
                var xPadding = 15;
                var xOffset = ((endAngle - Math.PI / 2) / Math.PI) * (size.width + xPadding);
                // now place label
                svg
                    .append('text')
                    .attr('x', x + xOffset)
                    .attr('y', y)
                    .text(arcLabels[i])
                    .attr('align', 'center')
                    .attr('font-size', arcLabelFontSize + 'px')
                    .attr('font-family', labelsFont);
            }
        }
    });
}
exports.arcOutline = arcOutline;
/**
 * Function for drawing needle base.
 * @param svg - original svg rectangle.
 * @param chartHeight - height of gauge.
 * @param needleColor - color of a needle.
 * @param centralLabel - value of the central label.
 * @returns modified svg.
 */
function needleBaseOutline(svg, chartHeight, offset, needleColor, centralLabel, outerNeedle) {
    // Different circle radiuses in the base of needle
    var innerGaugeRadius = centralLabel || outerNeedle ? chartHeight * 0.5 : chartHeight * 0.1;
    var gaugeArc = d3_1.arc()
        .innerRadius(innerGaugeRadius)
        .outerRadius(0)
        .startAngle(perc2RadWithShift(0))
        .endAngle(perc2RadWithShift(200));
    // White needle base if something should be written on it, gray otherwise
    svg
        .append('path')
        .attr('d', gaugeArc)
        .attr('fill', centralLabel || outerNeedle ? 'transparent' : needleColor)
        .attr('transform', 'translate(' +
        (chartHeight + offset * 2) +
        ', ' +
        (chartHeight + offset) +
        ')')
        .attr('class', 'bar');
}
exports.needleBaseOutline = needleBaseOutline;
/**
 * Function for drawing needle.
 * @param svg - original svg rectangle.
 * @param chartHeight - height of gauge.
 * @param needleColor - color of needle.
 * @param outerRadius - outer radius of gauge.
 * @param needleValue - value at which needle points.
 * @param centralLabel - value of the central label.
 * @returns modified svg.
 */
function needleOutline(svg, chartHeight, offset, needleColor, outerRadius, centralLabel, outerNeedle, needleStartValue) {
    var needleValue = needleStartValue;
    var needle = new needle_interface_1.Needle(svg, needleValue, centralLabel, chartHeight, outerRadius, offset, needleColor, outerNeedle);
    needle.setValue(needleValue);
    needle.getSelection();
    return needle;
}
exports.needleOutline = needleOutline;
/**
 * Function for drawing labels.
 * @param svg - original svg rectangle.
 * @param chartHeight - height of gauge.
 * @param outerRadius - outer radius of gauge.
 * @param rangeLabel - range labels of gauge.
 * @param centralLabel - value of the central label.
 * @returns modified svg.
 */
function labelOutline(svg, areaWidth, chartHeight, offset, outerRadius, rangeLabel, centralLabel, rangeLabelFontSize, labelsFont) {
    var arcWidth = Math.round(2 * (chartHeight - outerRadius));
    // Fonts specification (responsive to chart size)
    rangeLabelFontSize = rangeLabelFontSize || Math.round(chartHeight * 0.18);
    var realRangeFontSize = rangeLabelFontSize * 0.6; // counted empirically
    var centralLabelFontSize = rangeLabelFontSize * 1.5;
    var realCentralFontSize = centralLabelFontSize * 0.56;
    // Offsets specification (responsive to chart size)
    var leftRangeLabelOffsetX = rangeLabel[0]
        ? areaWidth / 2 -
            outerRadius -
            arcWidth / 2 -
            (realRangeFontSize * rangeLabel[0].length) / 2
        : 0;
    var rightRangeLabelOffsetX = rangeLabel[1]
        ? areaWidth / 2 +
            outerRadius +
            arcWidth / 2 -
            (realRangeFontSize * rangeLabel[1].length) / 2
        : 0;
    var rangeLabelOffsetY = offset + chartHeight + realRangeFontSize * 2;
    var centralLabelOffsetX = areaWidth / 2 - (realCentralFontSize * centralLabel.length) / 2;
    var centralLabelOffsetY = offset + chartHeight;
    svg
        .append('text')
        .attr('x', leftRangeLabelOffsetX)
        .attr('y', rangeLabelOffsetY)
        .text(rangeLabel ? rangeLabel[0] : '')
        .attr('font-size', rangeLabelFontSize + 'px')
        .attr('font-family', labelsFont);
    svg
        .append('text')
        .attr('x', rightRangeLabelOffsetX)
        .attr('y', rangeLabelOffsetY)
        .text(rangeLabel ? rangeLabel[1] : '')
        .attr('font-size', rangeLabelFontSize + 'px')
        .attr('font-family', labelsFont);
    svg
        .append('text')
        .attr('x', centralLabelOffsetX)
        .attr('y', centralLabelOffsetY)
        .text(centralLabel)
        .attr('font-size', centralLabelFontSize + 'px')
        .attr('font-family', labelsFont);
}
exports.labelOutline = labelOutline;
/**
 * Function for drawing gauge.
 * @param chartWidth: number - width of gauge.
 * @param needleValue: number - value at which an arrow points.
 * @param gaugeOptions?: string[] - object of optional parameters.
 */
function gaugeChart(element, areaWidth, gaugeOptions) {
    var defaultGaugeOption = {
        hasNeedle: false,
        outerNeedle: false,
        needleColor: 'gray',
        needleStartValue: 0,
        needleUpdateSpeed: 1000,
        arcColors: [],
        arcDelimiters: [],
        arcOverEffect: true,
        arcPadding: 0,
        arcPaddingColor: undefined,
        arcLabels: [],
        arcLabelFontSize: undefined,
        rangeLabel: [],
        centralLabel: '',
        rangeLabelFontSize: undefined,
        labelsFont: 'Roboto,Helvetica Neue,sans-serif'
    };
    var _a = Object.assign(defaultGaugeOption, gaugeOptions), hasNeedle = _a.hasNeedle, needleColor = _a.needleColor, needleUpdateSpeed = _a.needleUpdateSpeed, arcColors = _a.arcColors, arcDelimiters = _a.arcDelimiters, arcOverEffect = _a.arcOverEffect, arcPadding = _a.arcPadding, arcPaddingColor = _a.arcPaddingColor, arcLabels = _a.arcLabels, arcLabelFontSize = _a.arcLabelFontSize, rangeLabel = _a.rangeLabel, centralLabel = _a.centralLabel, rangeLabelFontSize = _a.rangeLabelFontSize, labelsFont = _a.labelsFont, outerNeedle = _a.outerNeedle, needleStartValue = _a.needleStartValue;
    if (!param_checker_1.paramChecker(arcDelimiters, arcColors, rangeLabel)) {
        return;
    }
    arcColors = arcColorsModifier(arcDelimiters, arcColors);
    var offset = areaWidth * 0.075;
    var chartHeight = areaWidth * 0.5 - offset * 2;
    var chartWidth = areaWidth - offset * 2;
    var outerRadius = chartHeight * 0.75;
    var svg = d3_1.select(element)
        .append('svg')
        .attr('width', chartWidth + offset * 2)
        .attr('height', chartWidth + offset * 2);
    arcOutline(svg, chartHeight, offset, arcColors, outerRadius, arcDelimiters, arcOverEffect, arcPadding, arcPaddingColor, arcLabels, arcLabelFontSize, labelsFont);
    var needle = null;
    if (hasNeedle) {
        needle = needleOutline(svg, chartHeight, offset, needleColor, outerRadius, centralLabel, outerNeedle, needleStartValue);
        needleBaseOutline(svg, chartHeight, offset, needleColor, centralLabel, outerNeedle);
    }
    labelOutline(svg, areaWidth, chartHeight, offset, outerRadius, rangeLabel, centralLabel, rangeLabelFontSize, labelsFont);
    return new gauge_interface_1.Gauge(svg, needleUpdateSpeed, needle);
}
exports.gaugeChart = gaugeChart;
