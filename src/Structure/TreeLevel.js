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
            //.range([this.svgBounds.height - this.xAxisWidth, 0]).nice();
        //console.log(this.svgBounds.height - this.xAxisWidth);
        this.Level = document.getElementById('level').value;

    }
    
    
    plotLevel(ctree) {
        if (ctree != undefined){
            this.yScale.range([ctree.treelength, 0]);
        //console.log(getKeyByValue(ctree.pers, ctree.pInter));
        let t = d3.transition()
            .duration(300);
        if (this.Level === "tLevel") {
            if (ctree.pShow != undefined)
                this.yScale.domain([getKeyByValue(ctree.pers, ctree.pShow), 0]);
            else {
                if (getKeyByValue(ctree.pers, ctree.pInter) != undefined)
                    this.yScale.domain([getKeyByValue(ctree.pers, ctree.pInter), 0]);
                else {
                    for (let i = 0; i < ctree.pers.length; i++) {
                        //console.log(i);
                        if (ctree.pInter > ctree.pers[i]) {

                            this.yScale.domain([i, 0]);
                            //console.log(i);
                            break;

                        }
                    }

                }
                /*ctree.pers.forEach((d,i)=>{
                    if (d<=ctree.pInter){
                        console.log(i);
                        this.yScale.domain(i, 0);
                        break;
                    }


            });*/


            }
            let yAxis = d3.axisLeft()
                .scale(this.yScale);
            //console.log(ctree.translatex-10);
            t.select("#treelevel")
                .attr("transform", "translate(" + (ctree.translatex - 10) + "," + ctree.translatey + ")")
                //.transition(t)
                .call(yAxis);
            //console.log(yAxis);
        }
        else {
            this.yScale.domain([ctree.pShow, 1]);

            let yAxis = d3.axisLeft()
                .scale(this.yScale);

            t.select("#treelevel")
                .attr("transform", "translate(" + (ctree.translatex - 10) + "," + ctree.translatey + ")")                //.transition(t)
                .call(yAxis);
        }
    this._ctree = ctree;
        }
        else
            this.plotLevel(this._ctree)


    }

    switchLevel() {
        this.Level = document.getElementById('level').value;
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

            default:
        }
    }
    
}