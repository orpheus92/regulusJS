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
        //console.log(plist);
        //console.log(data);
        for (let p in plist) {
            //console.log(p);
            //p = parseInt(p);
            psize.push([parseFloat(plist[p]), data[plist[p]].length-1]);
            //if (parseInt(p) + 1 <= plist.length - 1) {
            //    psize.push([plist[p + 1], data[plist[p]].length]);
            //}
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
            .domain([psize[0][1], psize[psize.length - 1][1]]) // input
            .range([height - padding, 0]); // output
        //console.log(psize);

        let line = myline()
            .x((d,i) => {//console.log("i = ",i, 'd= ', d);//, psize[i][0]);
                return this.xScale(parseFloat(d[0]) + Number.EPSILON);
            }) // set the x values for the line generator
            .y((d,i) => {
                return this.yScale(parseFloat(d[1]));
            }); // set the y values for the line generator

        this.dataset = psize;

        let svg = select(".pchart");//.attr("transform", "translate(" + (padding) + "," + margin.top + ")");

        // Persistence Chart
        let myplt = svg.selectAll(".line").data([this.dataset]);

        myplt.enter()
            .append("path")
            .merge(myplt)
            .attr("class", "line")
            .attr("transform", "translate(" + (3*padding/2) + "," + margin.top + ")")
            .attr("d", line);

        myplt.exit().remove();
        // Axis
        let xaxis = svg.selectAll('.pxaxis').data([0]);
            xaxis
            .enter()
            .append("g")
            .merge(xaxis)
            .attr("class", "pxaxis")
            .attr("transform", "translate(" + (3*padding/2) + "," + (height - padding + margin.top) + ")")
            .call(axisBottom(this.xScale));

        xaxis.exit().remove();

        let yaxis = svg.selectAll('.pyaxis').data([0]);
        yaxis.enter()
            .append("g")
            .merge(yaxis)
            .attr("class", "pyaxis")
            .attr("transform", "translate(" + (3*padding/2) + "," + (margin.top) + ")")
            .call(axisLeft(this.yScale));

        yaxis.exit().remove();

        svg.selectAll(".tick").selectAll("text").style("font-size", 8 + "px");

        let ylabel =svg.selectAll('.ylabel').data([0]);

        ylabel.enter()
            .append("text")
            .merge(ylabel)
            .attr("class","ylabel")
            .attr("text-anchor", "middle")
            .attr("transform", "translate(" + padding/2 + "," + (height / 2) + ")rotate(-90)")
            .text("Partitions");

        let xlabel = svg.selectAll('.xlabel').data([1]);
        xlabel.enter()
            .append("text")
            .merge(xlabel)
            .attr("class","xlabel")
            .attr("text-anchor", "middle")
            .attr("transform", "translate(" + (width / 2) + "," + (height + margin.top) + ")")
            .text("Persistence");

        // Add Buttons
        let callback = () => {
            this.option = "decrease";
        }

        let btn = mybutton()
            .x(width - padding) // X Location
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
            .x(width) // X Location
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
        let handle = svg.selectAll(".ppbar")
            .data([0]);

        handle.enter()
            .append("rect")
            .merge(handle)
            .attr("class", "ppbar");

        handle.exit().remove();

        let maxsize = parseInt(this.totalsize / 50);
        //console.log(maxsize);
        let psize2 = new Array(maxsize);
        psize2.fill(0);
        //console.log(this.basedata);
        for (let key in this.basedata) {
           //console.log(key);
            if (this.basedata[key].length < maxsize)
                psize2[this.basedata[key].length-1]++;
            else
                psize2[maxsize - 1]++;
        }
        //console.log(psize2);
        for (let i = psize2.length - 1; i > 0; i--) {
            psize2[i - 1] = psize2[i - 1] + psize2[i];
        }
        this.dataset2 = psize2;
        //console.log(psize2);
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

        let svg2 = select(".sizechart");
            //.append("svg")
            //.attr("width", width + margin.left + margin.right)
            //.attr("height", height + margin.top + margin.bottom)
            //.attr("class", "sizechart");

        let myplt2 =svg2.selectAll(".line").data([psize2]);
            //.datum(psize2)
        myplt2.enter().append("path")
            .merge(myplt2)
            .attr("class", "line")
            .attr("transform", "translate(" + (3*padding/2) + "," + margin.top + ")")
            .attr("d", line2);

        myplt2.exit().remove();

        let xaxis2 = svg2.selectAll('.pxaxis').data([0]);
        xaxis2.enter()
            .append("g")
            .merge(xaxis2)
            .attr("class", "pxaxis")
            .attr("transform", "translate(" + (3*padding/2) + "," + (height - padding + margin.top) + ")")
            .call(axisBottom(this.xScale2));

        xaxis2.exit().remove();

        let yaxis2 = svg2.selectAll('.pyaxis').data([0]);
        yaxis2.enter()
            .append("g")
            .merge(yaxis2)
            .attr("class", "pyaxis")
            .attr("transform", "translate(" + (3*padding/2) + "," + (margin.top) + ")")
            .call(axisLeft(this.yScale2));

        yaxis2.exit().remove();

        svg2.selectAll(".tick").selectAll("text").style("font-size", 8 + "px");


        let ylabel2 = svg2.selectAll('.ylabel').data([0]);

        ylabel2.enter()
            .append("text")
            .merge(ylabel2)
            .attr("class", "ylabel")
            .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
            .attr("transform", "translate(" + (padding/2) + "," + (height / 2) + ")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
            .text("Partitions");

        ylabel2.exit().remove();

        let xlabel2 = svg2.selectAll('.xlabel').data([0]);

        xlabel2.enter()
            .append("text")
            .merge(xlabel2)
            .attr("class", "xlabel")
            .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
            .attr("transform", "translate(" + (width / 2) + "," + (height + margin.top) + ")")  // centre below axis
            .text("Size");

        xlabel2.exit().remove();

        // Add Buttons
        let callback3 = () => {
            this.option = "decreaseS";
        }

        let btn3 = mybutton()
            .x(width - padding) // X Location
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
            .x(width) // X Location
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
        let handle2 = svg2.selectAll(".pbar").data([0]);

        handle2.enter()
            .append("rect")
            .merge(handle2)
            .attr("class", "pbar");

        handle2.exit().remove();

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
            .attr("x", cx + this.padding*3/2 - 2)
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
            .attr("x", cx2 + this.padding*3/2 - 2)
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
