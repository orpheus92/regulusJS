import * as d3 from 'd3';
import {getKeyByValue} from "./Tree";
import './style.css';
import * as pubsub from '../PubSub';

export class TreeLevel {
    constructor(){
        //this.svgBounds = d3.select("#treesvg").node().getBoundingClientRect();
        //this.xAxisWidth = 100;
        //this.yAxisHeight = 70;
        //this.g = d3.select("#treelevel");
        this.yScale = d3.scaleLinear().nice();
        //this.yScale2 = d3.scalePow().nice();
        this.yScale2 = d3.scaleLog().nice();

        d3.select("#treelevel").append("rect").attr("class", "bar");
        d3.select("#treelevel").append("text").attr("class", "levellabel");

        this.Level = "tLevel";
        this.Scale = "linear";
        pubsub.subscribe("levelchange1", this.switchLevel);

    }
    
    
    plotLevel(ctree) {
        if (ctree != undefined)
        {
            this.yScale.range([ctree.treelength, 0]);
            this.yScale2.range([ctree.treelength, 0]);

            let t = d3.transition()
                .duration(300);
            let clevel;
            switch (this.Level) {
                case "tLevel": {

                    this.yScale.domain([ctree._maxlevel, 0]);
                    // Draw Axis
                    let yAxis = d3.axisLeft()
                        .scale(this.yScale);
                    t.select("#treelevel")
                        .attr("transform", "translate(" + (ctree.translatex - 10) + "," + ctree.translatey + ")")
                        .call(yAxis);
                    //Draw Current Level
                    if (clevel === undefined)
                        clevel = parseInt(getKeyByValue(ctree.pers, ctree.pInter));

                    let cy = this.yScale(clevel);

                    d3.select(".levellabel")
                        .attr("x", 40)
                        .attr("y", -40)
                        .text("Tree Level")
                        .attr("font-size", "15px")
                        .attr("class", "levellabel")
                        .attr("fill", "blue");

                    t.select(".bar")
                        .attr("x", -5)
                        .attr("y", cy)
                        .attr("width", 10)
                        .attr("height", 5)
                        .attr("class", "bar")
                        .attr("fill", "blue");
                    break;
                }
                case "pLevel": {

                    switch (this.Scale){
                        case "linear":{
                    // Define Scale Function
                    if (ctree.pShow == undefined)
                        this.yScale.domain([ctree.pInter, 1]);
                    else
                        this.yScale.domain([ctree.pShow, 1]);
                    // Draw Axis
                    let yAxis = d3.axisLeft()
                        .scale(this.yScale);

                    t.select("#treelevel")
                        .attr("transform", "translate(" + (ctree.translatex - 10) + "," + ctree.translatey + ")")                //.transition(t)
                        .call(yAxis);

                    //Draw Current Level

                    clevel = ctree.pInter;
                    let cy = this.yScale(clevel);

                            d3.select(".levellabel")
                                .attr("x", 80)
                                .attr("y", -40)
                                .text("Persistence Level")
                                .attr("font-size", "15px")
                                .attr("class", "levellabel")
                                .attr("fill","blue");

                    t.select(".bar")//.data([clevel])
                        .attr("x", -5)
                        .attr("y", cy)
                        .attr("width", 10)
                        .attr("height", 5)
                        .attr("class", "bar")
                        .attr("fill","blue");
                    break;
                        }
                        case "log":{
                            //this.clearPlots();
                            //console.log("Draw Log");
                            if (ctree.pShow == undefined)
                                this.yScale2.domain([ctree.pInter, 1]);
                            else
                                this.yScale2.domain([ctree.pShow, 1]);

                            // Draw Axis
                            let yAxis = d3.axisLeft()
                                .scale(this.yScale2);

                            t.select("#treelevel")
                                .attr("transform", "translate(" + (ctree.translatex - 10) + "," + ctree.translatey + ")")                //.transition(t)
                                .call(yAxis);
                            //Draw Current Level
                            clevel = ctree.pInter;
                            //console.log(clevel);

                            let cy = this.yScale2(clevel);

                            t.select(".bar")//.data([clevel])
                                .attr("x", -5)
                                .attr("y", cy)
                                .attr("width", 10)
                                .attr("height", 5)
                                .attr("class", "bar")
                                .attr("fill","blue");
                            break;
                        }
                        default:
                    }
                    break;
                }

                default:
            }

            // Assign current tree to this class
            this._ctree = ctree;
        }
        else
            this.plotLevel(this._ctree)


    }

    switchLevel(channel,self,level,scale) {
        //if (level!=undefined)
        self.Level = level;
        self.Scale = scale;
        switch (self.Level) {
            case "tLevel": {
                self.plotLevel();
                break;
            }
            case "pLevel": {
                self.plotLevel();
                break;
            }

            default:
        }
    }
    
}