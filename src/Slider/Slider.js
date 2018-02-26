import * as d3 from 'd3';
import './style.css';
import {event as currentEvent} from 'd3-selection';
//import {event as currentEvent} from 'd3-selection';

//import {event as currentEvent} from 'd3-selection';


export class Slider{

constructor(inputsvg){
    this.inputsvg = inputsvg;

}

createslider(range,width){
    //console.log(range);
    //let svg = d3.select("svg"),
    //console.log("Create Slider");
    //console.log(this.inputsvg);
    //let margin = {right: 50, left: 50},
        //width = +this.inputsvg.attr("width") - margin.left - margin.right,
        //height = +this.inputsvg.attr("height");
    //console.log(this.inputsvg);
    let x = d3.scaleLinear()
    .domain([range[0], range[1]])
    .range([0, width])//size of slider and range of output, put persistence here
    .clamp(true);

    let slider = this.inputsvg;
        //.attr("class", "slider");
        slider.attr("transform", "translate(" +20 + "," + 15+ ")");
    //console.log(x.domain(), range[1]);

    //console.log(x.range());
    //console.log(slider);
    let curslide = slider.append("line")
        .attr("class", "track")
        .attr("x1", x.range()[0])
        .attr("x2", x.range()[1])
        .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
        .attr("class", "track-inset")
        .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
        .attr("class", "track-overlay");
    //console.log(x.ticks(5));
    slider.insert("g", ".track-overlay")
        .attr("class", "ticks")
        .attr("transform", "translate(0," + 18 + ")")
        .selectAll("text")
        .data(x.ticks(5)) //number of points in the slider
        .enter().append("text")
        .attr("x", x)
        .attr("text-anchor", "middle")
        .text(function(d) {return d; });

    slider.handle = slider.insert("circle", ".track-overlay")
        .attr("class", "handle")
        .attr("r", 5).attr("id","#myhandle");
    //console.log(slider);
    slider.curslide = curslide;
    return slider;


}
createbutton(){


}
}
