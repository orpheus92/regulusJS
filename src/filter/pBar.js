import {event, select, selectAll} from 'd3-selection';

import {scaleLinear, scaleLog, axisBottom, axisLeft} from 'd3';
import {line as myline} from 'd3-shape';
import './style.css';

import * as pubsub from '../PubSub';
import {event as currentevent} from 'd3-selection';
import {drag} from 'd3-drag';

//Persistence Barcode

export class pBar {
    constructor(tree, data, basedata) {
        this.totalsize = tree._maxsize;
        this.basedata = basedata;
        let plist = Object.keys(data).sort(function (a, b) {
            return parseFloat(b) - parseFloat(a)
        });
        let psize = [];

        for (let p in plist) {

            p = parseInt(p);

            psize.push([plist[p], data[plist[p]].length]);
            if (parseInt(p) + 1 <= plist.length - 1) {
                psize.push([plist[p + 1], data[plist[p]].length]);
            }
        }

        let margin = {top: 10, right: 10, bottom: 10, left: 10},
            width = 230,//window.innerWidth - margin.left - margin.right, // Use the window's width
            height = 140;//window.innerHeight - margin.top - margin.bottom; // Use the window's height
        let padding = 30;
        this.padding = padding;
        this.width = width;
        this.height = height;
        this.margin = margin;


        this.xScale = scaleLog()//.nice()//;scaleLinear()
            .domain([Number.EPSILON, 1 + Number.EPSILON]) // input
            .range([0, width - padding]).clamp(true); // output

        this.yScale = scaleLinear()
            .domain([1, psize[psize.length - 1][1]]) // input
            .range([height - padding, 0]); // output

        let line = myline()
            .x(d => {
                return this.xScale(parseFloat(d[0]) + Number.EPSILON);
            }) // set the x values for the line generator
            .y(d => {
                return this.yScale(parseFloat(d[1]));
            }); // set the y values for the line generator

        this.dataset = psize;

        let svg = select("#pBarcode").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)//;
            .attr("class", "pchart");
        //Path for Partitions vs Persistence
        svg.append("path")
            .datum(this.dataset)
            .attr("class", "line")
            .attr("transform", "translate(" + (padding) + "," + margin.top + ")")
            .attr("d", line);
        // Axis
        svg.append("g")
            .attr("class", "pxaxis")
            .attr("transform", "translate(" + (padding) + "," + (height - padding + margin.top) + ")")
            .call(axisBottom(this.xScale));

        svg.append("g")
            .attr("class", "pyaxis")
            .attr("transform", "translate(" + (padding) + "," + (margin.top) + ")")
            .call(axisLeft(this.yScale));

        svg.selectAll(".tick").selectAll("text").style("font-size", 8 + "px");
        svg.append("text")
            .attr("text-anchor", "middle")
            .attr("transform", "translate(" + 0 + "," + (height / 2) + ")rotate(-90)")
            .text("Partitions");

        svg.append("text")
            .attr("text-anchor", "middle")
            .attr("transform", "translate(" + (width / 2) + "," + (height + margin.top) + ")")
            .text("Persistence");

        // Add Buttons
        let callback = () => {
            this.option = "decrease";
        }

        let btn = mybutton()
            .x(width - 1.5 * padding) // X Location
            .y(height) // Y Location
            .labels(["-"]) // Array of round-robin labels
            .callback(callback) // User callback on click
            .fontSize(10) // Font Size
            .color("black") // Button text color
            .fill("steelblue") // Button fill
            .fillHighlight("cyan") // Button fill when highlighted
            .opacity(0.8) // Opacity

        svg.call(btn)

        let callback2 = () => {
            this.option = "increase";
        }

        let btn2 = mybutton()
            .x(width - 0.5 * padding) // X Location
            .y(height) // Y Location
            .labels(["+"]) // Array of round-robin labels
            .callback(callback2) // User callback on click
            .fontSize(10) // Font Size
            .color("black") // Button text color
            .fill("steelblue") // Button fill
            .fillHighlight("cyan") // Button fill when highlighted
            .opacity(0.8) // Opacity
        svg.call(btn2)

        //add persistence bar
        svg.append("rect").attr("class", "ppbar");

        let maxsize = parseInt(this.totalsize / 50);

        let psize2 = new Array(maxsize);
        psize2.fill(0);
        for (let key in this.basedata) {
            if (this.basedata[key].length < maxsize)
                psize2[this.basedata[key].length]++;
            else
                psize2[maxsize - 1]++;
        }
        for (let i = psize2.length - 1; i > 0; i--) {
            psize2[i - 1] = psize2[i - 1] + psize2[i];
        }
        this.dataset2 = psize2;
        this.xScale2 = scaleLinear()
            .domain([0, maxsize - 1]) // input
            .range([0, width - padding]).clamp(true); // output


        this.yScale2 = scaleLinear()
            .domain([psize2[maxsize - 1], psize2[0]]) // input
            .range([height - padding, 0]); // output

        let line2 = myline()
            .x((d, i) => {
                return this.xScale2(i);
            })
            .y(d => {
                return this.yScale2(d);
            });

        let svg2 = select("#pBarcode").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .attr("class", "sizechart");

        svg2.append("path")
            .datum(psize2)
            .attr("class", "line")
            .attr("transform", "translate(" + (padding) + "," + margin.top + ")")
            .attr("d", line2);

        svg2.append("g")
            .attr("class", "pxaxis")
            .attr("transform", "translate(" + (padding) + "," + (height - padding + margin.top) + ")")
            .call(axisBottom(this.xScale2));

        svg2.append("g")
            .attr("class", "pyaxis")
            .attr("transform", "translate(" + (padding) + "," + (margin.top) + ")")
            .call(axisLeft(this.yScale2));

        svg2.selectAll(".tick").selectAll("text").style("font-size", 8 + "px");


        svg2.append("text")
            .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
            .attr("transform", "translate(" + 0 + "," + (height / 2) + ")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
            .text("Partitions");

        svg2.append("text")
            .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
            .attr("transform", "translate(" + (width / 2) + "," + (height + margin.top) + ")")  // centre below axis
            .text("Size");

        // Add Buttons
        let callback3 = () => {
            this.option = "decreaseS";
        }

        let btn3 = mybutton()
            .x(width - 1.5 * padding) // X Location
            .y(height) // Y Location
            .labels(["-"]) // Array of round-robin labels
            .callback(callback3) // User callback on click
            .fontSize(10) // Font Size
            .color("black") // Button text color
            .fill("steelblue") // Button fill
            .fillHighlight("cyan") // Button fill when highlighted
            .opacity(0.8) // Opacity

        svg2.call(btn3)

        let callback4 = () => {
            this.option = "increaseS";
        }

        let btn4 = mybutton()
            .x(width - 0.5 * padding) // X Location
            .y(height) // Y Location
            .labels(["+"]) // Array of round-robin labels
            .callback(callback4) // User callback on click
            .fontSize(10) // Font Size
            .color("black") // Button text color
            .fill("steelblue") // Button fill
            .fillHighlight("cyan") // Button fill when highlighted
            .opacity(0.8) // Opacity
        svg2.call(btn4)

        //add persistence bar
        svg2.append("rect").attr("class", "pbar");

        let self = this;
        pubsub.subscribe("ParameterUpdate", self.updateBar.bind(self));
    }

    mycb() {
        return this.option;
    }

    /*
    reshape(){



    }
    */
    updateBar(msg, clevel, slevel) {

        let cx = this.xScale(clevel + Number.EPSILON);
        let cy;
        for (let i = 0; i < this.dataset.length; i++) {
            if (clevel <= this.dataset[i][0]) {
                cy = this.yScale(this.dataset[i][1]);
            }
        }
        select(".ppbar")//.data([cx])
            .attr("x", cx + this.padding - 2)
            .attr("y", this.margin.top - 2)
            .attr("width", 4)
            .attr("height", this.height - this.margin.top - this.margin.bottom)
            .attr("class", "ppbar")
            .attr("fill", "blue")
            .attr("opacity", "0.5");
        //console.log(slevel);
        let cx2;
        if (slevel < this.dataset2.length)
            cx2 = this.xScale2(slevel);
        else
            cx2 = this.xScale2(this.dataset2.length - 1);

        // Set a cap for Size Filter Chart
        //console.log(slevel)
        let cy2;
        if (slevel < this.dataset2.length)
            cy2 = this.yScale2(this.dataset2[slevel]);
        else
            cy2 = this.yScale2(this.dataset2[this.dataset2.length - 1]);


        select(".pbar")//.data([cx])
            .attr("x", cx2 + this.padding - 2)
            .attr("y", this.margin.top - 2)
            .attr("width", 4)
            .attr("height", this.height - this.margin.top - this.margin.bottom)
            .attr("class", "pbar")
            .attr("fill", "blue")
            .attr("opacity", "0.5");
    }

}

export function mybutton() {
    //"use strict";

    var getLongestLabel = function (sortedLabels) {
        sortedLabels.sort(function (a, b) {
            return b.length - a.length;
        })
        return sortedLabels[0]
    }
    var x = 0
    var y = 0
    var padding = 3
    var callback = function () {
        updateLabels()
        console.log("button clicked...");
    }
    var labels = ["Button State", "Another State"]
    var pointer = -1
    var longestLabel = getLongestLabel(labels)
    var fontSize = "80%"
    var color = "white"
    var fill = "red"
    var fillHighlight = "orange"
    var pulse = true
    var opacity = 0.8
    var updateLabels = function () {
    }
    var buttonGroup;

    function button(selection) {

        selection.each(function (data, i) {
            var sel = select(this)
            buttonGroup = sel.append("g").attr("class", "wb-button")
            var rect = buttonGroup.append("rect")
            var text = buttonGroup.append("text")

            text.attr("pointer-events", "none")
                .attr("text-anchor", "left")
                .attr("alignment-baseline", "hanging")
                .style("user-select", "none")
                .style("cursor", "pointer")
                .style("font-size", fontSize)
                .style("fill", color)
                .attr("transform", "translate(" + padding + "," + padding + ")")

            updateLabels = function () {
                // setup text label with X's to avoid problems with non
                // mono fonts and the bounding boxes
                longestLabel = getLongestLabel(labels.slice())
                text.text(longestLabel)
                var bbox = text.node().getBBox();
                // create the rect
                rect
                    .attr("x", bbox.x)
                    .attr("y", bbox.y)
                    .attr("width", bbox.width + padding * 2)
                    .attr("height", bbox.height + padding * 2)
                    .attr("ry", 5).attr("rx", 5)
                    .style("cursor", "pointer")
                    .style("fill", fill)
                    .style("fill-opacity", opacity)
                    .on("click", function () {
                        pulse = false // user discovered the button
                        callback()
                    })
                    .on("mouseover", function (d, i) {
                        pulse = false // user discovered the button
                        select(this)
                        //.transition()
                        //.duration(250)
                            .style("fill", fillHighlight)
                            .attr("stroke", color)
                            .attr("stroke-width", 1)

                    })
                    .on("mouseout", function (d, i) {
                        select(this)
                        //.transition()
                        // .duration(250)
                            .style("fill", fill)
                            .attr("stroke-width", 0)
                    })

                var rectBbox = rect.node().getBBox()
                buttonGroup.attr("transform", "translate(" + x + "," +
                    (y - rectBbox.y) + ")")
                // reset the label
                pointer = (pointer + 1) % labels.length
                text.text(labels[pointer])
                bbox = text.node().getBBox()
                // move bounding box so text is centered
                var diff = rectBbox.width - bbox.width
                rect.attr("transform", "translate(" +
                    (-diff / 2 + padding) + ",0)")
                // move button to original location
                buttonGroup.attr("transform", "translate(" +
                    (x + diff / 2) + "," + y + ")")
            }
            updateLabels()
            setInterval(function () {
                if (!pulse) {
                    return
                }
                rect
                //.transition()
                // .duration(500)
                    .style("fill", fillHighlight)
                    .attr("stroke", color)
                    .attr("stroke-width", 1)
                    //.transition()
                    //.duration(500)
                    .style("fill", fill)
                    .attr("stroke-width", 0)
            }, 5000);

        })
    }

    button.x = function (value) {
        if (!arguments.length) return x
        x = value;
        return button;
    }

    button.y = function (value) {
        if (!arguments.length) return y
        y = value;
        return button;
    }

    button.labels = function (value) {
        if (!arguments.length) return labels
        labels = value
        return button;
    }

    button.callback = function (value) {
        if (!arguments.length) return callback
        callback = function () {
            updateLabels()
            value()
        }
        return button;
    }

    button.fontSize = function (value) {
        if (!arguments.length) return fontSize
        fontSize = value;
        return button;
    }

    button.color = function (value) {
        if (!arguments.length) return color
        color = value;
        return button;
    }

    button.fillHighlight = function (value) {
        if (!arguments.length) return fillHighlight
        fillHighlight = value;
        return button;
    }

    button.fill = function (value) {
        if (!arguments.length) return fill
        fill = value;
        return button;
    }

    button.opacity = function (value) {
        if (!arguments.length) return opacity
        opacity = value;
        return button;
    }

    button.pulse = function (value) {
        if (!arguments.length) return pulse
        pulse = value;
        return button;
    }

    return button
}
