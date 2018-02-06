import * as d3 from 'd3';
import './style.css';

//Persistence Barcode

export class pBar{
   constructor(tree,data,basedata){
       this.totalsize = tree._maxsize;
       this.basedata = basedata;
       let plist = tree.pers;
       let psize = [];
       for(let p in plist) {

           p = parseInt(p);
           //console.log(p);
           psize.push([plist[p], data[plist[p]].length]);
           if (parseInt(p) + 1 <= plist.length - 1)

           {   //console.log(p+1);
               //console.log(plist);
               //console.log(plist[p+1]);
           //console.log(data[plist[p + 1]]);
           psize.push([plist[p + 1], data[plist[p]].length]);
           }
       }

       // 2. Use the margin convention practice 
       let margin = {top: 10, right: 10, bottom: 10, left: 10},
           width = 300,//window.innerWidth - margin.left - margin.right, // Use the window's width
           height = 200;//window.innerHeight - margin.top - margin.bottom; // Use the window's height
       let padding = 40;
       this.padding = padding;
       this.width = width;
       this.height = height;
       this.margin = margin;
// The number of datapoints
       //let n = 21;

// 5. X scale will use the index of our data
       this.xScale = d3.scaleLinear()
           .domain([0, 1]) // input
           .range([0, width-padding]); // output

// 6. Y scale will use the randomly generate number
       //console.log(plist[plist.length-1]);
       this.yScale = d3.scaleLinear()
           .domain([1,psize[psize.length-1][1]]) // input
           .range([height-padding, 0]); // output
        //console.log(psize)
// 7. d3's line generator
       let line = d3.line()
           .x(d=> { return this.xScale(d[0]); }) // set the x values for the line generator
           .y(d=> { return this.yScale(d[1]); }); // set the y values for the line generator
           //.curve(d3.curveMonotoneX) // apply smoothing to the line

// 8. An array of objects of length N. Each object has key -> value pair, the key being "y" and the value is a random number
       this.dataset = psize;//= d3.range(n).map(function(d) { return {"y": d3.randomUniform(1)() } })

// 1. Add the SVG to the page and employ #2
       let svg = d3.select("#pBarcode").append("svg")
           .attr("width", width + margin.left + margin.right)
           .attr("height", height + margin.top + margin.bottom)//;
           .attr("class", "pchart");

       //.append("g")
           //.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
       //this.svg = svg;
// 3. Call the x axis in a group tag
       svg.append("g")
           .attr("class", "pxaxis")
           .attr("transform", "translate("+(padding)+"," + (height-padding+ margin.top) + ")")
           .call(d3.axisBottom(this.xScale)); // Create an axis component with d3.axisBottom
       //d3.select(".x axis").append("rect").attr("class", "pbar");
// 4. Call the y axis in a group tag
       svg.append("g")
           .attr("class", "pyaxis")
           .attr("transform", "translate("+(padding)+","+(margin.top)+")")// + height + ")")
           .call(d3.axisLeft(this.yScale)); // Create an axis component with d3.axisLeft

// 9. Append the path, bind the data, and call the line generator 
       svg.append("path")
           .datum(this.dataset) // 10. Binds data to the line
           .attr("class", "line")
           .attr("transform", "translate("+(padding)+","+margin.top+")")// + height + ")")
           .attr("d", line); // 11. Calls the line generator 

// 12. Appends a circle for each datapoint 
       svg.selectAll(".dot")
           .data(this.dataset)
           .enter().append("circle") // Uses the enter().append() method
           .attr("class", "dot") // Assign a class for styling
           .attr("cx", d=> { return this.xScale(d[0])})
           .attr("cy", d=> { return this.yScale(d[1])})//d.y) })
           .attr("r", 1)
           .attr("transform", "translate("+(padding)+","+margin.top+")");// + height + ")")

       svg.append("text")
           .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
           .attr("transform", "translate("+ (padding/3) +","+(height/2)+")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
           .text("Partitions");

       svg.append("text")
           .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
           .attr("transform", "translate("+ (width/2) +","+(height+margin.top)+")")  // centre below axis
           .text("Persistence");

       // Add Buttons
       let callback = ()=> {
           this.option = "decrease";
       }

       let btn = mybutton()
           .x(width-padding) // X Location
           .y(height) // Y Location
           .labels(["-"]) // Array of round-robin labels
           .callback(callback) // User callback on click
           .fontSize(15) // Font Size
           .color("black") // Button text color
           .fill("steelblue") // Button fill
           .fillHighlight("cyan") // Button fill when highlighted
           .opacity(0.8) // Opacity

       svg.call(btn)

       let callback2 = ()=>{
           this.option = "increase";
       }

       let btn2 = mybutton()
           .x(width) // X Location
           .y(height) // Y Location
           .labels(["+"]) // Array of round-robin labels
           .callback(callback2) // User callback on click
           .fontSize(15) // Font Size
           .color("black") // Button text color
           .fill("steelblue") // Button fill
           .fillHighlight("cyan") // Button fill when highlighted
           .opacity(0.8) // Opacity
       svg.call(btn2)

       //add persistence bar
        svg.append("rect").attr("class", "ppbar");
       this.reshape();
   }

   mycb(){
       return this.option;
   }
   reshape(){

       //console.log(this.basedata)
       //console.log(Object.keys(this.basedata).length);
       let maxsize = parseInt(this.totalsize/100);

       //let plist = this.basedata;
       let psize = new Array(maxsize);
       psize.fill(0);
       for(let key in this.basedata){
           if(this.basedata[key].length<maxsize)
               psize[this.basedata[key].length]++;
           else
               psize[maxsize-1]++;
           //p = parseInt(p);
       }
       //console.log(psize);
       for(let i=psize.length-1;i>0;i--){
           psize[i-1]=psize[i-1]+psize[i];
       }
       //console.log(psize);
       this.dataset2 = psize;
      //console.log(psize);
       this.xScale2 = d3.scaleLinear()
           .domain([0, maxsize-1]) // input
           .range([0, this.width-this.padding]); // output

// 6. Y scale will use the randomly generate number
       //console.log(plist[plist.length-1]);
       this.yScale2 = d3.scaleLinear()
           .domain([psize[maxsize-1],psize[0]]) // input
           .range([this.height-this.padding, 0]); // output

       let line = d3.line()
           .x((d,i)=> { return this.xScale2(i); }) // set the x values for the line generator
           .y(d=> { return this.yScale2(d); });

       let svg = d3.select("#pBarcode").append("svg")
       .attr("width", this.width + this.margin.left + this.margin.right)
       .attr("height", this.height + this.margin.top + this.margin.bottom)
           .attr("class", "sizechart");

       svg.append("g")
           .attr("class", "pxaxis")
           .attr("transform", "translate("+(this.padding)+"," + (this.height-this.padding+ this.margin.top) + ")")
           .call(d3.axisBottom(this.xScale2)); // Create an axis component with d3.axisBottom
       //d3.select(".x axis").append("rect").attr("class", "pbar");
// 4. Call the y axis in a group tag
       svg.append("g")
           .attr("class", "pyaxis")
           .attr("transform", "translate("+(this.padding)+","+(this.margin.top)+")")// + height + ")")
           .call(d3.axisLeft(this.yScale2)); // Create an axis component with d3.axisLeft

// 9. Append the path, bind the data, and call the line generator
       svg.append("path")
           .datum(psize) // 10. Binds data to the line
           .attr("class", "line")
           .attr("transform", "translate("+(this.padding)+","+this.margin.top+")")// + height + ")")
           .attr("d", line); // 11. Calls the line generator

// 12. Appends a circle for each datapoint
       svg.selectAll(".dot")
           .data(psize)
           .enter().append("circle") // Uses the enter().append() method
           .attr("class", "dot") // Assign a class for styling
           .attr("cx", (d,i)=> { return this.xScale2(i)})
           .attr("cy", d=> { return this.yScale2(d)})//d.y) })
           .attr("r", 1)
           .attr("transform", "translate("+(this.padding)+","+this.margin.top+")");// + height + ")")

       svg.append("text")
           .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
           .attr("transform", "translate("+ (this.padding/3) +","+(this.height/2)+")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
           .text("Partitions");

       svg.append("text")
           .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
           .attr("transform", "translate("+ (this.width/2) +","+(this.height+this.margin.top)+")")  // centre below axis
           .text("Size");

       // Add Buttons
       let callback = ()=> {
           this.option = "decreaseS";
       }

       let btn = mybutton()
           .x(this.width-this.padding) // X Location
           .y(this.height) // Y Location
           .labels(["-"]) // Array of round-robin labels
           .callback(callback) // User callback on click
           .fontSize(15) // Font Size
           .color("black") // Button text color
           .fill("steelblue") // Button fill
           .fillHighlight("cyan") // Button fill when highlighted
           .opacity(0.8) // Opacity

       svg.call(btn)

       let callback2 = ()=>{
           this.option = "increaseS";
       }

       let btn2 = mybutton()
           .x(this.width) // X Location
           .y(this.height) // Y Location
           .labels(["+"]) // Array of round-robin labels
           .callback(callback2) // User callback on click
           .fontSize(15) // Font Size
           .color("black") // Button text color
           .fill("steelblue") // Button fill
           .fillHighlight("cyan") // Button fill when highlighted
           .opacity(0.8) // Opacity
       svg.call(btn2)

       //add persistence bar
       svg.append("rect").attr("class", "pbar");

   }
   updateBar(clevel,slevel){
        //clevel = ctree.pInter;
        //console.log(this.dataset);
        let cx = this.xScale(clevel);
        let cy;
        for(let i = 0;i<this.dataset.length;i++){
            if(clevel<=this.dataset[i][0]){
                cy = this.yScale(this.dataset[i][1]);
            }
        }
        //let t = d3.transition().duration(100);
        d3.select(".ppbar")//.data([cx])
            .attr("x", cx+this.padding-2)
            .attr("y", cy+this.margin.top-2)
            .attr("width", 4)
            .attr("height", 4)
            .attr("class", "ppbar")
            .attr("fill","blue");
        //console.log(slevel);
       let cx2 = this.xScale2(slevel);
       let cy2 = this.yScale2(this.dataset2[slevel]);
       /*
       for(let i = 0;i<this.dataset.length;i++){
           if(clevel<=this.dataset[i][0]){
               cy2 = this.yScale(this.dataset[i][1]);
           }
       }
       */
       //let t = d3.transition().duration(100);
       //console.log(slevel);
       d3.select(".pbar")//.data([cx])
           .attr("x", cx2+this.padding-2)
           .attr("y", cy2+this.margin.top-2)
           .attr("width", 4)
           .attr("height", 4)
           .attr("class", "pbar")
           .attr("fill","blue");
    }


}
export function mybutton() {
    //"use strict";

    var getLongestLabel = function(sortedLabels) {
        sortedLabels.sort(function(a, b) {
            return b.length - a.length;
        })
        return sortedLabels[0]
    }
    var x = 0
    var y = 0
    var padding = 3
    var callback = function() {
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
    var updateLabels = function() {}
    var buttonGroup;

    function button(selection) {

        selection.each(function(data, i) {
            var sel = d3.select(this)
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

            updateLabels = function() {
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
                    .on("click", function() {
                        pulse = false // user discovered the button
                        callback()
                    })
                    .on("mouseover", function(d, i) {
                        pulse = false // user discovered the button
                        d3.select(this)
                            //.transition()
                            //.duration(250)
                            .style("fill", fillHighlight)
                            .attr("stroke", color)
                            .attr("stroke-width", 1)

                    })
                    .on("mouseout", function(d, i) {
                        d3.select(this)
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
            setInterval(function() {
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

    button.x = function(value) {
        if (!arguments.length) return x
        x = value;
        return button;
    }

    button.y = function(value) {
        if (!arguments.length) return y
        y = value;
        return button;
    }

    button.labels = function(value) {
        if (!arguments.length) return labels
        labels = value
        return button;
    }

    button.callback = function(value) {
        if (!arguments.length) return callback
        callback = function() {
            updateLabels()
            value()
        }
        return button;
    }

    button.fontSize = function(value) {
        if (!arguments.length) return fontSize
        fontSize = value;
        return button;
    }

    button.color = function(value) {
        if (!arguments.length) return color
        color = value;
        return button;
    }

    button.fillHighlight = function(value) {
        if (!arguments.length) return fillHighlight
        fillHighlight = value;
        return button;
    }

    button.fill = function(value) {
        if (!arguments.length) return fill
        fill = value;
        return button;
    }

    button.opacity = function(value) {
        if (!arguments.length) return opacity
        opacity = value;
        return button;
    }

    button.pulse = function(value) {
        if (!arguments.length) return pulse
        pulse = value;
        return button;
    }

    return button
}
/*
export function mybutton()// = function() {
{
    var dispatch = d3.dispatch('press', 'release');

    var padding = 5,
        radius = 5,
        stdDeviation = 5,
        offsetX = 2,
        offsetY = 2;

    function my(selection) {
        selection.each(function(d, i) {
            var g = d3.select(this)
                .attr('id', 'd3-button' + i)
                .attr('transform', 'translate(' + d.x + ',' + d.y + ')');

            var text = g.append('text').text(d.label);
            var defs = g.append('defs');
            var bbox = text.node().getBBox();
            var rect = g.insert('rect', 'text')
                .attr("x", bbox.x - padding)
                .attr("y", bbox.y - padding)
                .attr("width", bbox.width + 2*padding)
                .attr("height", bbox.height + padding)
                .attr('rx', radius)
                .attr('ry', radius)
                .on('mouseover', activate)
                .on('mouseout', deactivate)
                .on('click', toggle)

            addShadow.call(g.node(), d, i);
            addGradient.call(g.node(), d, i);
        });
    }

    function addGradient(d, i) {
        var defs = d3.select(this).select('defs');
        var gradient = defs.append('linearGradient')
            .attr('id', 'gradient' + i)
            .attr('x1', '0%')
            .attr('y1', '0%')
            .attr('x2', '0%')
            .attr('y2', '100%');

        gradient.append('stop')
            .attr('id', 'gradient-start')
            .attr('offset', '0%')

        gradient.append('stop')
            .attr('id', 'gradient-stop')
            .attr('offset', '100%')

        d3.select(this).select('rect').attr('fill', 'url(#gradient' + i + ")" );
    }

    function addShadow(d, i) {
        var defs = d3.select(this).select('defs');
        var rect = d3.select(this).select('rect').attr('filter', 'url(#dropShadow' + i + ")" );
        var shadow = defs.append('filter')
            .attr('id', 'dropShadow' + i)
            .attr('x', rect.attr('x'))
            .attr('y', rect.attr('y'))
            .attr('width', rect.attr('width') + offsetX)
            .attr('height', rect.attr('height') + offsetY)

        shadow.append('feGaussianBlur')
            .attr('in', 'SourceAlpha')
            .attr('stdDeviation', 2)

        shadow.append('feOffset')
            .attr('dx', offsetX)
            .attr('dy', offsetY);

        var merge = shadow.append('feMerge');

        merge.append('feMergeNode');
        merge.append('feMergeNode').attr('in', 'SourceGraphic');
    }

    function activate() {
        var gradient = d3.select(this.parentNode).select('linearGradient')
        d3.select(this.parentNode).select("rect").classed('active', true)
        if (!gradient.node()) return;
        gradient.select('#gradient-start').classed('active', true)
        gradient.select('#gradient-stop').classed('active', true)
    }

    function deactivate() {
        var gradient = d3.select(this.parentNode).select('linearGradient')
        d3.select(this.parentNode).select("rect").classed('active', false)
        if (!gradient.node()) return;
        gradient.select('#gradient-start').classed('active', false);
        gradient.select('#gradient-stop').classed('active', false);
    }

    function toggle(d, i) {
        if (d3.select(this).classed('pressed')) {
            release.call(this, d, i);
            deactivate.call(this, d, i);
        } else {
            press.call(this, d, i);
            activate.call(this, d, i);
        }
    }

    function press(d, i) {
        dispatch.call('press', this, d, i)
        d3.select(this).classed('pressed', true);
        var shadow = d3.select(this.parentNode).select('filter')
        if (!shadow.node()) return;
        shadow.select('feOffset').attr('dx', 0).attr('dy', 0);
        shadow.select('feGaussianBlur').attr('stdDeviation', 0);
    }

    function release(d, i) {
        dispatch.call('release', this, d, i)
        my.clear.call(this, d, i);
    }

    my.clear = function(d, i) {
        d3.select(this).classed('pressed', false);
        var shadow = d3.select(this.parentNode).select('filter')
        if (!shadow.node()) return;
        shadow.select('feOffset').attr('dx', offsetX).attr('dy', offsetY);
        shadow.select('feGaussianBlur').attr('stdDeviation', stdDeviation);
    }

    my.on = function() {
        var value = dispatch.on.apply(dispatch, arguments);
        return value === dispatch ? my : value;
    };

    return my;
}

*/