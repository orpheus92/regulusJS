import * as d3 from 'd3';
import './style.css';

//Persistence Barcode

export class rangefilter{
   constructor()
   {

   }
   // Should return a set of index in the range
   updaterange(yattr, range, rawdata){
   //console.log(rawdata);
   let outindex = new Set();

       for (let i=0;i<rawdata.length;i++){
       if (parseFloat(rawdata[i][yattr])>range[0]&&parseFloat(rawdata[i][yattr])<range[1]){
            outindex.add(i);
       }

   }
   return outindex;
   }
   mycb(){
       return this.option;
   }
   reshape(){

       //console.log(this.basedata)
       //console.log(Object.keys(this.basedata).length);
       let maxsize = parseInt(this.totalsize/100);

       //let plist = this.basedata;
       let psize = new Array(maxsize);
       psize.fill(0);
       for(let key in this.basedata){
           if(this.basedata[key].length<maxsize)
               psize[this.basedata[key].length]++;
           else
               psize[maxsize-1]++;
           //p = parseInt(p);
       }
       //console.log(psize);
       for(let i=psize.length-1;i>0;i--){
           psize[i-1]=psize[i-1]+psize[i];
       }
       //console.log(psize);
       this.dataset2 = psize;
      //console.log(psize);
       this.xScale2 = d3.scaleLinear()
           .domain([0, maxsize-1]) // input
           .range([0, this.width-this.padding]); // output

// 6. Y scale will use the randomly generate number
       //console.log(plist[plist.length-1]);
       this.yScale2 = d3.scaleLinear()
           .domain([psize[maxsize-1],psize[0]]) // input
           .range([this.height-this.padding, 0]); // output

       let line = d3.line()
           .x((d,i)=> { return this.xScale2(i); }) // set the x values for the line generator
           .y(d=> { return this.yScale2(d); });

       let svg = d3.select("#pBarcode").append("svg")
       .attr("width", this.width + this.margin.left + this.margin.right)
       .attr("height", this.height + this.margin.top + this.margin.bottom)
           .attr("class", "sizechart");

       svg.append("g")
           .attr("class", "pxaxis")
           .attr("transform", "translate("+(this.padding)+"," + (this.height-this.padding+ this.margin.top) + ")")
           .call(d3.axisBottom(this.xScale2)); // Create an axis component with d3.axisBottom
       //d3.select(".x axis").append("rect").attr("class", "pbar");
// 4. Call the y axis in a group tag
       svg.append("g")
           .attr("class", "pyaxis")
           .attr("transform", "translate("+(this.padding)+","+(this.margin.top)+")")// + height + ")")
           .call(d3.axisLeft(this.yScale2)); // Create an axis component with d3.axisLeft

// 9. Append the path, bind the data, and call the line generator
       svg.append("path")
           .datum(psize) // 10. Binds data to the line
           .attr("class", "line")
           .attr("transform", "translate("+(this.padding)+","+this.margin.top+")")// + height + ")")
           .attr("d", line); // 11. Calls the line generator

// 12. Appends a circle for each datapoint
       svg.selectAll(".dot")
           .data(psize)
           .enter().append("circle") // Uses the enter().append() method
           .attr("class", "dot") // Assign a class for styling
           .attr("cx", (d,i)=> { return this.xScale2(i)})
           .attr("cy", d=> { return this.yScale2(d)})//d.y) })
           .attr("r", 1)
           .attr("transform", "translate("+(this.padding)+","+this.margin.top+")");// + height + ")")

       svg.append("text")
           .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
           .attr("transform", "translate("+ (this.padding/3) +","+(this.height/2)+")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
           .text("Partitions");

       svg.append("text")
           .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
           .attr("transform", "translate("+ (this.width/2) +","+(this.height+this.margin.top)+")")  // centre below axis
           .text("Size");

       // Add Buttons
       let callback = ()=> {
           this.option = "decreaseS";
       }

       let btn = mybutton()
           .x(this.width-this.padding) // X Location
           .y(this.height) // Y Location
           .labels(["-"]) // Array of round-robin labels
           .callback(callback) // User callback on click
           .fontSize(15) // Font Size
           .color("black") // Button text color
           .fill("steelblue") // Button fill
           .fillHighlight("cyan") // Button fill when highlighted
           .opacity(0.8) // Opacity

       svg.call(btn)

       let callback2 = ()=>{
           this.option = "increaseS";
       }

       let btn2 = mybutton()
           .x(this.width) // X Location
           .y(this.height) // Y Location
           .labels(["+"]) // Array of round-robin labels
           .callback(callback2) // User callback on click
           .fontSize(15) // Font Size
           .color("black") // Button text color
           .fill("steelblue") // Button fill
           .fillHighlight("cyan") // Button fill when highlighted
           .opacity(0.8) // Opacity
       svg.call(btn2)

       //add persistence bar
       svg.append("rect").attr("class", "pbar");

   }
   updateBar(clevel,slevel){

        let cx = this.xScale(clevel);
        let cy;
        for(let i = 0;i<this.dataset.length;i++){
            if(clevel<=this.dataset[i][0]){
                cy = this.yScale(this.dataset[i][1]);
            }
        }
        d3.select(".ppbar")//.data([cx])
            .attr("x", cx+this.padding-2)
            .attr("y", cy+this.margin.top-2)
            .attr("width", 4)
            .attr("height", 4)
            .attr("class", "ppbar")
            .attr("fill","blue");
        //console.log(slevel);
       let cx2 = this.xScale2(slevel);
       let cy2 = this.yScale2(this.dataset2[slevel]);
       /*
       for(let i = 0;i<this.dataset.length;i++){
           if(clevel<=this.dataset[i][0]){
               cy2 = this.yScale(this.dataset[i][1]);
           }
       }
       */
       //let t = d3.transition().duration(100);
       //console.log(slevel);
       d3.select(".pbar")//.data([cx])
           .attr("x", cx2+this.padding-2)
           .attr("y", cy2+this.margin.top-2)
           .attr("width", 4)
           .attr("height", 4)
           .attr("class", "pbar")
           .attr("fill","blue");
    }


}
