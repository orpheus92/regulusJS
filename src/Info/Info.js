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
        //console.log(data);
        this.raw.append("li").text("Total Number of Points: "+ rawdata.length);//.classed("cplabel", true);
        this.raw.append("li").text("All Attributes: "+ rawdata.columns);
        let totalper = Object.keys(data).sort(function(b,a){return b-a});
        //console.log(totalper);
        this.maxP = totalper[totalper.length-1];
        this.minP = totalper[0];
        //console.log(this.maxP);
        //console.log(this.minP);
        //console.log(totalper);
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
        //console.log("Update P");
        //this.cper.text("Current Persistence: "+ pInter).remove();

        this.cper.selectAll(".cplabel").remove();
        this.csize.selectAll(".cslabel").remove();

        //.data(ppInter);
        this.cper.append("li").text("Current Persistence: "+ cpInter).classed("cplabel", true);
        this.csize.append("li").text("Partition Size: "+ csInter).classed("cslabel", true);

    }

    select(snode){
        if (snode!=undefined) {
            //console.log("Update P");
            //this.cper.text("Current Persistence: "+ pInter).remove();
            //console.log(snode);
            this.sMSC.selectAll(".sMSC").remove();
            //this.csize.selectAll(".cslabel").remove();

            //.data(ppInter);
            //console.log(Object.values(this.rawdata[snode.data.C1]).slice(-1)[0]);
            //console.log(snode);
            this.sMSC
                .append("li").text("Total Points in Selected Partition: " + snode.data._total.size).classed("sMSC", true)
                .append("li").text("Minimum Index: " + snode.data.C1).classed("sMSC", true)
                .append("li").text("Minimum Value: " + Object.values(this.rawdata[snode.data.C1]).slice(-1)[0]).classed("sMSC", true)
                .append("li").text("Maximum Index: " + snode.data.C2).classed("sMSC", true)
                .append("li").text("Maximum Value: " + Object.values(this.rawdata[snode.data.C2]).slice(-1)[0]).classed("sMSC", true)
                .append("li").text("Partition Persistence: " + snode.data._persistence).classed("sMSC", true);
            //this.csize.append("li").text("Partition Size: "+ csInter).classed("cslabel", true);
        }

    }
}
