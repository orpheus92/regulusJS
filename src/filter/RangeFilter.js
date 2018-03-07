import * as d3 from 'd3';
import './style.css';
import * as pubsub from '../PubSub';
//Persistence Barcode

export class RangeFilter{
   constructor(dataarray,rawdata)
   {    // Range for all the attributes

       this.range = {};
       this.crange = {};
       let attrs = Object.keys(dataarray);
       for (let i = 0; i<attrs.length; i++)
       {
           this.range[attrs[i]] = [Math.min(...dataarray[attrs[i]]),Math.max(...dataarray[attrs[i]])];
           this.crange[attrs[i]] = [Math.min(...dataarray[attrs[i]]),Math.max(...dataarray[attrs[i]])];
       }
       this._rawdata = rawdata;
       //this._rawdata = rawdata;
       d3.select("#RemoveRange").on('click',()=>{
           this.removefilter();
       });

       d3.select("#SetRange").on('click',()=>{
           this.updaterange();
           //plots.updatediv(crange);
       });

   }
   // Should return a set of index in the range
   updaterange() {

       let filterattr = d3.select('#RangeAttr').node().value;
       let min = parseFloat(d3.select("#mymin").node().value);
       let max = parseFloat(d3.select("#mymax").node().value);
       let range = [min,max];
       let rawdata = this._rawdata;
       // Use attr specified by plot for now, will have its own attr later;
       // Return set of index that will be used during update model to update _total, _size

        let outindex = new Set();

        if (isNaN(range[0]) && isNaN(range[1]))
            range = this.crange[filterattr];
        else
        {   // Min is not defined
            if(isNaN(range[0])){
                range[0] = this.crange[filterattr][0];
                this.crange[filterattr][1] = range[1];
            }
            // Max is not defined
            else if(isNaN(range[1])){
                range[1] = this.crange[filterattr][1];
                this.crange[filterattr][0] = range[0];
            }
            else
            {this.crange[filterattr]=range;
            }

        }

       for (let i = 0; i < rawdata.length; i++) {
           if (parseFloat(rawdata[i][filterattr]) >= range[0] && parseFloat(rawdata[i][filterattr]) <= range[1]) {
               outindex.add(i);
           }
       }
       //console.log("range", this.range)

       pubsub.publish("RFChanged",outindex,this.crange);

        return;//'' [outindex,this.crange];
   }

    removefilter(){
        let filterattr = d3.select('#RangeAttr').node().value;
        let rawdata = this._rawdata;

        this.crange[filterattr] = this.range[filterattr].slice(0);
        let range = this.crange[filterattr];
        let outindex = new Set();

        for (let i = 0; i < rawdata.length; i++) {
            if (parseFloat(rawdata[i][filterattr]) >= range[0] && parseFloat(rawdata[i][filterattr]) <= range[1]) {
                outindex.add(i);
            }
        }
        pubsub.publish("RFChanged",outindex,this.crange);
        return;
    }

}
