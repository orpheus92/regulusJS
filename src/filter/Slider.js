import * as d3 from 'd3';
import './style.css';
import {event as currentEvent} from 'd3-selection';
//import {event as currentEvent} from 'd3-selection';

//import {event as currentEvent} from 'd3-selection';


export class Slider{

constructor(){
    this._treeslider = d3.select('#treeslider');//inputsvg;

}

createslider(range,width){

    let x = d3.scaleLinear()
    .domain([range[0], range[1]])
    .range([0, width])//size of slider and range of output, put persistence here
    .clamp(true);

    //let slider = this.inputsvg;
        //.attr("class", "slider");
    let slider = this._treeslider.attr("transform", "translate(" +20 + "," + 15+ ")");

    let curslider = slider.selectAll(".track").data([0])
    //curslider.enter()
        .enter()
        .append("line")
        //.merge(curslider)
        .attr("class", "track")
        .attr("x1", x.range()[0])
        .attr("x2", x.range()[1])
        .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
        .attr("class", "track-inset")
        .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
        .attr("class", "track-overlay");


    //console.log(x.ticks(5));
    /*
    let group = slider.selectAll(".ticks").data([0]);

    group.enter()
        .insert("g", ".track-overlay")
        .merge(group)
        .attr("class", "ticks")
        .attr("transform", "translate(0," + 18 + ")");

    group.selectAll("text")
        .data(x.ticks(5)) //number of points in the slider
        .enter().append("text")
        .attr("x", x)
        .attr("text-anchor", "middle")
        .text(function(d) {return d; });
       */

    slider.selectAll(".ticks").data([0])
        .enter()
        .insert("g", ".track-overlay")
        .attr("class", "ticks")
        .attr("transform", "translate(0," + 18 + ")")
        .selectAll("text")
        .data(x.ticks(5)) //number of points in the slider
        .enter().append("text")
        .attr("x", x)
        .attr("text-anchor", "middle")
        .text(function(d) {return d; });

    slider.handle = slider.selectAll(".handle").data([0])
        .enter()
        .insert("circle", ".track-overlay")
        .attr("class", "handle")
        .attr("r", 5).attr("id","#myhandle");

    slider.handle.exit().remove();
    //console.log(slider);
    slider.curslider = curslider;
    return slider;


}
createbutton(){


}
}
