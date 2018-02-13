import * as d3 from 'd3';
import './style.css';

//Persistence Barcode

export class rangefilter{
   constructor()
   {

   }
   // Should return a set of index in the range
   updaterange(yattr, range, rawdata){
   let outindex = new Set();

       for (let i=0;i<rawdata.length;i++){
       if (parseFloat(rawdata[i][yattr])>range[0]&&parseFloat(rawdata[i][yattr])<range[1]){
            outindex.add(i);
       }

   }
   return outindex;
   }



}
