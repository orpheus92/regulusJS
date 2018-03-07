import * as d3 from 'd3'
export class newslider {

    constructor(inputsvg) {
        this.inputsvg = inputsvg;


    }

    createslider(range) {
        var data = [2011, 2012, 2013, 2014, 2015, 2016, 2017];

        /*
        var svg = d3.select("#slider"),
            margin = {right: 50, left: 50},
            width = +svg.attr("width") - margin.left - margin.right,
            height = +svg.attr("height");
        */

        let slider = this.inputsvg.select("#slider");

        var x = d3.scaleLinear()
            .domain(d3.extent(data))
            .range([0, width])
            .clamp(true);

        //var slider = svg.append("g")
        //    .attr("class", "slider")
        //    .attr("transform", "translate(" + margin.left + "," + height / 2 + ")");

        slider.append("line")
            .attr("class", "track")
            .attr("x1", x.range()[0])
            .attr("x2", x.range()[1])
            .attr("stroke", "#e6e8eb")
            .attr("stroke-width", "4")
            .select(function () {
                return this.parentNode.appendChild(this.cloneNode(true));
            })
            .attr("class", "track-inset")
            .select(function () {
                return this.parentNode.appendChild(this.cloneNode(true));
            })
            .attr("class", "track-overlay")
            .call(d3.drag()
                .on("start.interrupt", function () {
                    slider.interrupt();
                })
                .on("start drag", function () {
                    hue(x.invert(d3.event.x));
                }));

        slider.insert("g", ".track-overlay")
            .attr("class", "ticks")
            .selectAll("ticks")
            .data(x.ticks(data.length))
            .enter().append("text")
            .attr("x", x)
            .attr("text-anchor", "middle")
            .attr("transform", "translate(0," + 30 + ")")
            .text(function (d) {
                return d;
            })
            .exit()
            .data(x.ticks(data.length * 2))
            .enter().append("circle")
            .attr("cx", x)
            .attr("r", 3)
            .attr("fill", "#c1c7cd");

        slider.insert("g", ".track-overlay")
            .attr("class", "ticks--cirlces")
            .selectAll("ticks--ticks");

        var handle = slider.insert("circle", ".track-overlay")
            .attr("class", "handle")
            .attr("r", 9);

        let t = d3.transition()
            .duration(300);
        t.select(slider)
        //slider.transition() // Gratuitous intro!
        //.duration(750)
            .tween("hue", function () {
                var i = d3.interpolate(0, 70);
                return function (t) {
                    hue(i(t));
                };
            });
    }
}
function hue(h) {
  handle.attr("cx", x(h));
  d3.select(".text")
    .text( (Math.round(h*2)/2).toFixed(1) );
}
