import * as d3 from 'd3';
import {getKeyByValue} from "./Tree";
import './style.css';
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
        //.range([this.svgBounds.height - this.xAxisWidth, 0]).nice();
        //console.log(this.svgBounds.height - this.xAxisWidth);
        this.Level = document.getElementById('level').value;
        this.Scale = document.getElementById('scale').value;

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
                    // Define Scale Function
                    if (ctree.pShow != undefined)
                        this.yScale.domain([parseInt(getKeyByValue(ctree.pers, ctree.pShow))+1, 0]);
                    else {
                        if (getKeyByValue(ctree.pers, ctree.pInter) != undefined)
                            this.yScale.domain([getKeyByValue(ctree.pers, ctree.pInter), 0]);
                        else {
                            for (let i = 0; i < ctree.pers.length; i++) {
                                if (ctree.pInter > ctree.pers[i]) {
                                    this.yScale.domain([i, 0]);
                                    clevel = i;
                                    //console.log(clevel);
                                    break;
                                }
                            }

                        }

                    }
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

                    t.select(".bar")//.data([clevel])
                        .attr("x", -5)
                        .attr("y", cy)
                        .attr("width", 10)
                        .attr("height", 5)
                        .attr("class", "bar")
                        .attr("fill","blue");
                    break;
                }
                case "pLevel": {
                    //console.log(this.Scale);
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
                /*
                case "pLevellog": {
                    //this.clearPlots();
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
                */
                default:
            }

            // Assign current tree to this class
            this._ctree = ctree;
        }
        else
            this.plotLevel(this._ctree)


    }

    switchLevel() {
        this.Level = document.getElementById('level').value;
        this.Scale = document.getElementById('scale').value;
        //console.log(this.Level,this.Scale);
        // = data
        switch (this.Level) {
            case "tLevel": {
                //this.clearPlots();
                this.plotLevel();
                break;
            }
            case "pLevel": {
                //this.clearPlots();
                this.plotLevel();
                break;
            }
            /*
            case "pLevellog": {
                //this.clearPlots();
                this.plotLevel();
                break;
            }
            */
            default:
        }
    }
    
}