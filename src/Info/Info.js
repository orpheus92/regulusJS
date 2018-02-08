import * as d3 from 'd3';

import './style.css';

export class Info {

    constructor() {

        this.raw = d3.select("#raw");//.text("rawdata");
        this.persistence = d3.select("#persistence");//.text("rawdata");
        this.sMSC = d3.select("#selected");//.text("rawdata");
        this.cper = d3.select("#cper");//.text("rawdata");
        this.csize = d3.select("#csize");//.text("rawdata");

    }
    create(data,rawdata,cpInter,csInter){

        this.rawdata = rawdata;
        this.raw.append("li").text("Total Number of Points: "+ rawdata.length);//.classed("cplabel", true);
        this.raw.append("li").text("All Attributes: "+ rawdata.columns);
        let totalper = Object.keys(data).sort(function(b,a){return b-a});
        this.maxP = totalper[totalper.length-1];
        this.minP = totalper[0];

        this.persistence.append("li")
            .attr("dy", 0)
            .attr("x",0)
            .text("Maximum Persistence: "+ this.maxP);
        this.persistence.append("li")
            .attr("dy", "1.2em") // offest by 1.2 em
            .attr("x",0)
            .text("Minimum Persistence: " + this.minP);
        this.cper.append("li").text("Current Persistence: "+ cpInter).classed("cplabel", true);
        this.csize.append("li").text("Partition Size: "+ csInter).classed("cslabel", true);
        this.sMSC.append("li").text("No Partition Selected").classed("sMSC", true);
        return([this.maxP, this.minP]);
    }

    update(cpInter,csInter){

        this.cper.selectAll(".cplabel").remove();
        this.csize.selectAll(".cslabel").remove();

        this.cper.append("li").text("Current Persistence: "+ cpInter).classed("cplabel", true);
        this.csize.append("li").text("Partition Size: "+ csInter).classed("cslabel", true);

    }

    select(snode, attr){
        if (snode!=undefined) {

            this.sMSC.selectAll(".sMSC").remove();
            let p_arr = Array.from(snode.data._total);

            let selectionarr = p_arr.map(x=>parseFloat(this.rawdata[x][attr]));

            this.sMSC
                .append("li").text("Total Points in Selected Partition: " + snode.data._total.size).classed("sMSC", true)
                .append("li").text("Minimum Index: " + p_arr[selectionarr.indexOf(Math.min(...selectionarr))]).classed("sMSC", true)
                .append("li").text("Minimum Value: " + Math.min(...selectionarr)).classed("sMSC", true)
                .append("li").text("Maximum Index: " + p_arr[selectionarr.indexOf(Math.max(...selectionarr))]).classed("sMSC", true)
                .append("li").text("Maximum Value: " + Math.max(...selectionarr)).classed("sMSC", true)
                .append("li").text("Partition Persistence: " + snode.data._persistence).classed("sMSC", true);
        }

    }
}
