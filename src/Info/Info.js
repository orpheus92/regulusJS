import * as d3 from 'd3';

import './style.css';
import * as pubsub from '../PubSub';
import {parseObj} from "../Crystal/Selected";

export class Info {

    constructor() {

        this.raw = d3.select("#raw");//.text("rawdata");
        this.persistence = d3.select("#persistence");//.text("rawdata");
        this.sMSC = d3.select("#selected");//.text("rawdata");
        this.cper = d3.select("#cper");//.text("rawdata");
        this.csize = d3.select("#csize");//.text("rawdata");
        pubsub.subscribe("infoselect",this.select);
        pubsub.subscribe("infoupdate",this.update);

    }
    create(data,rawdata,cpInter,csInter, measure){
        this.measure = measure;
        this.rawdata = rawdata;
        let attr = rawdata.columns;
        let datacol = rawdata.columns.length;
        let datarow = rawdata.length;
        let obj = {};
        let objrange = {};
        let format = d3.format(".3e")
        for (let j = 0; j < datacol; j++)
        {   obj[attr[j]] = [];
            objrange[attr[j]] = [];
        }
        for (let i = 0; i < datarow; i++) {
            for (let j = 0; j < datacol; j++) {
                obj[attr[j]].push(parseFloat(rawdata[i][attr[j]]));
            }
        }
        //console.log(obj);

        for (let j = 0; j < datacol; j++)
        {   //console.log(obj[attr[j]]);
            objrange[attr[j]].push(Math.min(...obj[attr[j]]));
            objrange[attr[j]].push(Math.max(...obj[attr[j]]));
        }
        let scroll= d3.select("#attrcontent");//.node().scrollTop;//.append("svg")

        this.raw.append("li").text("Total Points: "+ rawdata.length)//.attr("font-weight","bold");//.classed("cplabel", true);
        //this.raw.append("text").text("Attributes: ").attr("dy", "4.2em") ;
        if(objrange[measure][0].toString().length>4)
            scroll.append("li").text("Measure:   "+measure + ": ["+format(objrange[measure][0])+","+format(objrange[measure][1])+"]");
        else
            scroll.append("li").text("Measure:   "+measure + ": ["+objrange[measure][0]+","+objrange[measure][1]+"]");

        scroll.append("li").text("Input Attributes:   ");
        rawdata.columns.forEach(d=>{
            if(d!=measure)
            {
                if(objrange[d][0].toString().length>4)
                    scroll.append("li").text(d+": ["+format(objrange[d][0])+" , "+format(objrange[d][1])+"]")
                else
                    scroll.append("li").text(d+": ["+objrange[d][0]+" , "+objrange[d][1]+"]")
            }
        });

        let totalper = Object.keys(data).sort(function(b,a){return parseFloat(b)-parseFloat(a)});
        this.maxP = totalper[totalper.length-1];
        this.minP = totalper[0];

        this.persistence.append("li")
            .attr("dy", 0)
            .attr("x",0)
            .text("Max Persistence: "+ this.maxP);
        this.persistence.append("li")
            .attr("dy", "1.2em") // offest by 1.2 em
            .attr("x",0)
            .text("Min Persistence: " + this.minP);
        this.cper.append("li").text("Current Persistence: "+ cpInter).classed("cplabel", true);
        this.csize.append("li").text("Partition Size: "+ csInter).classed("cslabel", true);
        this.sMSC.append("li").text("No Partition Selected").classed("sMSC", true);
        return([this.maxP, this.minP]);
    }

    update(channel,self,cpInter,csInter){
        self.cper.selectAll(".cplabel").remove();
        self.csize.selectAll(".cslabel").remove();
        self.cper.append("li").text("Current Persistence: "+ cpInter).classed("cplabel", true);
        self.csize.append("li").text("Partition Size: "+ csInter).classed("cslabel", true);

    }

    select(channel, self, snode, attr){
        if (snode!=undefined) {
            //console.log(snode);
            self.sMSC.selectAll(".sMSC").remove();
            let p_arr = Array.from(snode.data._total);

            let selectionarr = p_arr.map(x=>parseFloat(self.rawdata[x][attr]));

            self.sMSC
                .append("li").text("Points in Selected Partition: " + snode.data._total.size).classed("sMSC", true)
                //.append("li").text("Minimum Index: " + p_arr[selectionarr.indexOf(Math.min(...selectionarr))]).classed("sMSC", true)
                .append("li").text("Minimum: " + Math.min(...selectionarr)).classed("sMSC", true)
                //.append("li").text("Maximum Index: " + p_arr[selectionarr.indexOf(Math.max(...selectionarr))]).classed("sMSC", true)
                .append("li").text("Maximum: " + Math.max(...selectionarr)).classed("sMSC", true)
                .append("li").text("Persistence: " + snode.data._persistence).classed("sMSC", true)
                .append("li").text("Saddle Info: " ).classed("sMSC", true);
        }

        function parseObj(data,option) {
            let outx = [];
            let outy = [];
            if (option == undefined)
            // This should take in object array, return 2d array x and 1d array y
            {

                for (let i = 0; i < data.length; i++) {
                    let curx = Object.values(data[i]).map(Number);
                    let cury = curx.pop();
                    outx.push(curx);
                    outy.push(cury);
                }
            }else{for (let i = 0; i < data.length; i++) {
                let curx = Object.values(data[i]).map(Number);
                curx.pop();
                let cury = curx.pop();
                outx.push(curx);
                outy.push(cury);
            }}
            return[outx,outy];

        }

    }
}
