import * as d3 from 'd3';
import './style.css';

//Persistence Barcode

export class rangefilter{
   constructor(dataarray)
   {    // Range for all the attributes

       this.range = {};
       this.crange = {};
       let attrs = Object.keys(dataarray);
       for (let i = 0; i<attrs.length; i++)
       {
           this.range[attrs[i]] = [Math.min(...dataarray[attrs[i]]),Math.max(...dataarray[attrs[i]])];
           this.crange[attrs[i]] = [Math.min(...dataarray[attrs[i]]),Math.max(...dataarray[attrs[i]])];
       }
   }
   // Should return a set of index in the range
   updaterange(yattr, range, rawdata) {
        let outindex = new Set();

        if (isNaN(range[0]) && isNaN(range[1]))
            range = this.crange[yattr];
        else
        {   // Min is not defined
            if(isNaN(range[0])){
                range[0] = this.crange[yattr][0];
                this.crange[yattr][1] = range[1];
            }
            // Max is not defined
            else if(isNaN(range[1])){
                range[1] = this.crange[yattr][1];
                this.crange[yattr][0] = range[0];
            }
            else
            {this.crange[yattr]=range;
            }

        }

       for (let i = 0; i < rawdata.length; i++) {
           if (parseFloat(rawdata[i][yattr]) >= range[0] && parseFloat(rawdata[i][yattr]) <= range[1]) {
               outindex.add(i);
           }
       }
       //console.log("range", this.range)
        return outindex;
   }

    removefilter(yattr,rawdata){
        //console.log("crange", this.crange)
        this.crange[yattr] = this.range[yattr].slice(0);
        let range = this.crange[yattr];
        let outindex = new Set();

        for (let i = 0; i < rawdata.length; i++) {
            if (parseFloat(rawdata[i][yattr]) >= range[0] && parseFloat(rawdata[i][yattr]) <= range[1]) {
                outindex.add(i);
            }
        }
        return outindex;

    }

}
