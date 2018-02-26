import * as d3 from 'd3';
import * as d3Tip from 'd3-tip';
import './style.css';
import * as pubsub from '../PubSub';

import * as kernel from '../Process/kernel';

import {myBrush} from '../customd3';
//console.log('.');
export class Selected{
    // Assign a parentnode for all divs
    constructor(data, width, height, yattr, plottype,check,band){
        this._rawdata = data;
        this._data = data;
        this._margin = {top: height/10, right: height/10, bottom: width/10, left: width/10};
        this._width = width;
        this._height = height;
        this._plot = d3.select("#hdPlot");
        this._y_attr = yattr;
        this._barWidth = width/20;
        this._textsize = height/20;
        this._stored = [];
        this._selected = [];
        //this._brushes = [];
        this._reg = check;
        this._brushNum = {"index":0};
        this._plottype = plottype;
        this._bandwidth = band;
        // This part is necessary when people try to call update attribute before selecting partition
        let attr = data.columns;

        let datacol = attr.length;
        let datarow = this._data.length;
        let obj = {};
        let objrange = {};
        for (let j = 0; j < datacol; j++)
            {
                obj[attr[j]] = [];
                objrange[attr[j]] = [];
            }
        for (let i = 0; i < datarow; i++) {
            for (let j = 0; j < datacol; j++) {
                obj[attr[j]].push(parseFloat(this._data[i][attr[j]]));
            }
        }
        /*
        for (let j = 0; j < datacol; j++)
        {   //console.log(obj[attr[j]]);
            objrange[attr[j]].push(Math.min(...obj[attr[j]]));
            objrange[attr[j]].push(Math.max(...obj[attr[j]]));
        }
        */
        //console.log(objrange);
        this._obj = obj;
        this._attr = attr;
        pubsub.subscribe("plotupdateattr", this.updateattr);
        pubsub.subscribe("plottypechange", this.updateplot);


        //console.log(this);
    }
    updatesize(){

        let width = this._width;
        let height = this._height;
        this._margin = {top: height/10, right: height/10, bottom: width/10, left: width/10};
        this._barWidth = width/20;
        this._textsize = height/20;

    }
    // Reconstruct the plot info
    reconstruct(){


    }
    // Update divs based on input data
    updatediv(inputnode){

        let selected;
        if(inputnode === undefined){
            selected = this._stored;
        }
        else if(inputnode.length != undefined) {
            selected = inputnode;
            if (inputnode.data._saddleind != undefined && inputnode.data._saddleind != -1)
            inputnode.data._saddleinfo =  this._rawdata[inputnode.data._saddleind];
        }
        else {
            selected = [];
            selected.push(inputnode);
            if (inputnode.data._saddleind != undefined && inputnode.data._saddleind != -1)
                inputnode.data._saddleinfo =  this._rawdata[inputnode.data._saddleind];
        }
        this._totaldata = [];
        this._objrange = {};
        //this._ind = [];
        for (let i = 0;i<selected.length;i++){
            //this._ind.push(i);
            let nodeinfo = selected[i];
            let selectdata = [];
            nodeinfo.data._total.forEach(d => {
                selectdata.push(this._rawdata[d]);
            });
            //this._data = selectdata;
            selectdata.columns = this._rawdata.columns;

            let attr = selectdata.columns;
            let datacol = attr.length;
            let datarow = selectdata.length;
            let obj = {};
            let objrange = {};
            for (let j = 0; j < datacol; j++)
                {   obj[attr[j]] = [];
                    objrange[attr[j]] = [];
                }
            for (let i = 0; i < datarow; i++) {
                for (let j = 0; j < datacol; j++) {
                    obj[attr[j]].push(parseFloat(selectdata[i][attr[j]]));
                }
            }
            for (let j = 0; j < datacol; j++)
            {   //console.log(obj[attr[j]]);
                objrange[attr[j]].push(Math.min(...obj[attr[j]]));
                objrange[attr[j]].push(Math.max(...obj[attr[j]]));
            }
            //this._obj = obj;
            if(Object.keys(this._objrange).length === 0 && this._objrange.constructor === Object)
            {
                this._objrange = objrange;
            }
            else{
                for (let ir =0;ir<datacol;ir++){
                    this._objrange[attr[ir]][0] = Math.min(this._objrange[attr[ir]][0],objrange[attr[ir]][0])
                    this._objrange[attr[ir]][1] = Math.max(this._objrange[attr[ir]][1],objrange[attr[ir]][1])
                }
            }
            this._attr = attr;
            //console.log(objrange);
            this._totaldata.push(selectdata);
            //this._totalobj.push(this._obj);
            //this._totalattr.push(this._attr);
        }
        //console.log(this);
        this.updateplot();

    }
    // remove all divs in it
    removediv(option){
        if(option === undefined)
            d3.select("#hdPlot").selectAll('div').remove();
        else
            {
                let allPlots = d3.select("#hdPlot").select("#div"+option)
                    .selectAll("svg")
                    .remove();
            }
    }
    // Update all the plots based on plot selection
    updateplot(channel, self, option){
        //console.log(option);
        let plottype;
        if (self==undefined)
        {
            if (option != undefined)
            this._plottype = option;
        plottype = this._plottype;
        this.removediv();
        //let dataFile = option;//document.getElementById('dataset').value;
        switch (plottype) {
            case "Coordinate": {
                //this.clearPlots();
                this.rawDataPlot(option);
                break;
            }
            case "BoxPlot": {
                //this.clearPlots();
                this.boxPlot(option);
                break;
            }
            case "Histogram": {
                //this.clearPlots();
                this.histogramPlot(option);
                break;
            }
            case "Pairwise": {
                //this.clearPlots();
                this.PairwisePlot(option);
                break;
            }
            case "ScatterMat": {
                //this.clearPlots();
                this.scatterMat(option);
                break;
            }
            case "AllScatter": {
                //this.clearPlots();
                this.multiscatter(option);
                break;
            }
            case "Stats": {
                break;
            }

            default:
        }
        }
        else{

            if (option != undefined)
                self._plottype = option;
            plottype = self._plottype;
            self.removediv();
            //let dataFile = option;//document.getElementById('dataset').value;
            switch (plottype) {
                case "Coordinate": {
                    //this.clearPlots();
                    self.rawDataPlot(option);
                    break;
                }
                case "BoxPlot": {
                    //this.clearPlots();
                    self.boxPlot(option);
                    break;
                }
                case "Histogram": {
                    //this.clearPlots();
                    self.histogramPlot(option);
                    break;
                }
                case "Pairwise": {
                    //this.clearPlots();
                    self.PairwisePlot(option);
                    break;
                }
                case "ScatterMat": {
                    //this.clearPlots();
                    self.scatterMat(option);
                    break;
                }
                case "AllScatter": {
                    //this.clearPlots();
                    self.multiscatter(option);
                    break;
                }
                case "Stats": {
                    break;
                }

                default:
            }

        }
    }
    // Update all the plots based on attr selection
    updateattr(channel,self,yattr){

        self._y_attr = yattr;
        self.updateplot();

    }
    //pairwisePlot
    PairwisePlot() {
        d3.selectAll('#plottip').remove();
        for(let i = 0;i<this._totaldata.length;i++){
        let data = this._totaldata[i];//this._data;
        let margin = this._margin;
        //let height = this._height - margin.top - margin.bottom;
        //let width = this._width - margin.left - margin.right;
        let height = this._height;
        let width = this._width;
        let newplot = this._plot.append("div").attr("id","div"+i).attr("class", "crystaldiv");
        let textsize = this._textsize;

        //load data as array
        let attr = data.columns;
        let datacol = attr.length;
        let datarow = data.length;


        for (let i = 0; i < datacol; i++) {
            for (let i_2 = i + 1; i_2 < datacol; i_2++) {
                if(attr[i] != this._y_attr && attr[i_2] != this._y_attr){
                    let curData = [];
                    for (let j = 0; j < datarow; j++) {
                        let curPoint = {};
                        curPoint.x = parseFloat(data[j][attr[i]]);
                        curPoint.y = parseFloat(data[j][attr[i_2]]);
                        curPoint.z = parseFloat(data[j][this._y_attr]);
                        curData.push(curPoint);
                    }

                    let x_minVal = d3.min(curData, function (d) {
                        return d.x;
                    });
                    let x_maxVal = d3.max(curData, function (d) {
                        return d.x;
                    });
                    let y_minVal = d3.min(curData, function (d) {
                        return d.y;
                    });
                    let y_maxVal = d3.max(curData, function (d) {
                        return d.y;
                    });
                    let z_minVal = d3.min(curData, function (d) {
                        return d.z;
                    });
                    let z_maxVal = d3.max(curData, function (d) {
                        return d.z;
                    });


                    let x = d3.scaleLinear()
                        .domain([x_minVal, x_maxVal])
                        //.range([0, width])
                        .range([0, width - margin.left - margin.right])
                        .nice();
                    let y = d3.scaleLinear()
                        .domain([y_minVal, y_maxVal])
                        //.range([0, height])
                        .range([height - margin.top - margin.bottom, 0])
                        .nice();

                    let colorScale = d3.scaleLinear()
                        .range(['blue', 'red'])
                        .domain([z_minVal, z_maxVal]);

                    let svg = newplot.append("svg")
                        .attr("height", height)
                        .attr("width", width);
                    let g = svg
                        .append('g')
                        .attr('id', "pairwisePlot" + i);

                    g.selectAll("circle")
                        .data(curData)
                        .enter()
                        .append("circle")
                        .attr("r",2)
                        .attr("cx", function (d) {
                            return x(d.x);
                        })
                        .attr("cy", function (d) {
                            return y(d.y);
                        })
                        .attr("transform", "translate(" + [margin.left, margin.top] + ")")
                        .attr('fill', function (d) {
                            return colorScale(d.z);
                        }).attr("class", "scattercolor");

                    let tip = d3Tip().attr('class', 'd3-tip').attr('id','plottip')
                        .direction('se')
                        .offset(function() {
                            return [0,0];
                        })
                        .html((d,ind)=>{
                            return this.tooltip_render(d,ind);

                        });
                    //console.log(curscatter);
                    //this._curscatter = curscatter;
                    g.selectAll("circle").call(tip)
                        .on('mouseover', tip.show)
                        .on('mouseout', tip.hide);

                    g
                        .append('g')
                        .attr('id', "xAxis" + i)
                        .call( d3.axisBottom(x).scale(x))
                        .attr("font-size", textsize+"px")
                        .attr("transform", "translate(" + [margin.left, height - margin.bottom] + ")");//.attr("class","label");

                    g
                        .append('g')
                        .attr('id', "yAxis" + i)
                        .call(d3.axisLeft(y).scale(y))//;
                        .attr("font-size", textsize+"px")
                        .attr("transform", "translate(" + [margin.left, margin.top] + ")");


                    svg
                        .append("text")
                        .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
                        .attr("font-size", textsize+"px")
                        //.attr("transform", "translate("+ (this._width/2) +","+(this._height-margin.bottom/3)+")")  // centre below axis
                        .attr("transform", "translate("+ (width/2) +","+(height)+")")  // centre below axis
                        .text(attr[i]);
                    svg
                        .append("text")
                        .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
                        .attr("font-size", textsize+"px")
                        //.attr("transform", "translate("+ (margin.left/3) +","+(this._height/2)+")rotate(-90)")
                        .attr("transform", "translate("+ (textsize) +","+(height/2)+")rotate(-90)")
                        .text(attr[i_2]);
                }



            }
        }
    }}

    tooltip_render(d,ind) {
        let text = "";
        for (let i = 0;i<this._attr.length;i++){
            //console.log(d3.select("#plot" + i).selectAll("circle"));
            text +=  "<li>"+ this._attr[i]+ ": "+ this._obj[this._attr[i]][ind];
        }
        return text;
    }
    //rawDataPlot
    rawDataPlot() {
        d3.selectAll('#plottip').remove();
        for (let i = 0;i<this._totaldata.length;i++){
        let data = this._totaldata[i];//this._data;
        let margin = this._margin;
        let height = this._height;
        let width = this._width;
        //let newplot = this._plot;
        let newplot = this._plot.append("div").attr("id","div"+i).attr("class", "crystaldiv");
        let textsize = this._textsize;
        //load data as array
        let attr = data.columns;
        let datacol = attr.length;
        let datarow = data.length;
        let obj = {};
        for (let j = 0; j < datacol; j++)
            obj[attr[j]] = [];
        for (let i = 0; i < datarow; i++) {
            for (let j = 0; j < datacol; j++) {
                obj[attr[j]].push(parseFloat(data[i][attr[j]]));
            }
        }
        //this._obj = obj;
        //this._attr = attr;
        let value = function (d) {
            return d;
        }; // data -> value

        let minVal = d3.min(obj[this._y_attr], value);
        let maxVal = d3.max(obj[this._y_attr], value);

        let yScale = d3.scaleLinear()
                .range([height - margin.top - margin.bottom, 0])
                .nice(), // value -> display
            yAxis = d3.axisLeft(yScale);
        let xScale = d3.scaleLinear()
                .range([0, width - margin.left - margin.right])
                .domain([minVal, maxVal])
                .nice(), // value -> display
            xAxis = d3.axisBottom(xScale);
        let colorScale = d3.scaleLinear()
            .range(['blue', 'red'])
            .domain([minVal, maxVal]);


        let curplot;

        for (let i = 0; i < datacol; i++) {
            if(attr[i] != this._y_attr){
                yScale.domain([d3.min(obj[attr[i]], value), d3.max(obj[attr[i]], value)]);
                let curplot = newplot.append("svg")
                    .attr('id', "plot" + i);
                curplot.data([{
                    x: obj[this._y_attr],//d3.range(n).map(function(i) { return i / n; }),
                    y: obj[attr[i]]//d3.range(n).map(function(i) { return Math.sin(4 * i * Math.PI / n) + (Math.random() - .5) / 5; })
                }]);

                curplot.attr("height", height)
                    .attr("width", width);

                curplot.append('g').attr('id', "xAxis" + i);
                curplot.append('g').attr('id', "yAxis" + i);
                //d3.selectAll("#plottip").remove();
                let curscatter = curplot.selectAll("circle")
                //.data(obj[attr[i]])
                    .data(function(d) {
                        return d3.zip(d.x, d.y); })
                    .enter()
                    .append("circle")
                    .attr("r", 2)
                    .attr("cx", function(d) { return xScale(d[0]); })
                    .attr("cy", function(d) { return yScale(d[1]); })
                    //.attr("transform", "translate(" + [margin.left, height - margin.bottom] + ")")
                    .attr("transform", "translate(" + [margin.left, margin.top] + ")")
                    .attr('fill', function (d) {
                        return colorScale(d[0]);
                    }).attr("class", "scattercolor");

                let tip = d3Tip().attr('class', 'd3-tip').attr('id','plottip')
                    .direction('se')
                    .offset(function() {
                        return [0,0];
                    })
                    .html((d,ind)=>{
                        return this.tooltip_render(d,ind);

                    });
                //console.log(curscatter);
                //this._curscatter = curscatter;
                curscatter.call(tip);
                //console.log(this._node);
                //console.log(curscatter.on('mouseover', tip.show));
                curscatter.on('mouseover', tip.show)//.attr('class',d=>{
                //console.log("Mouse Over");
                //return "highlighted";})
                    .on('mouseout', tip.hide);//.attr('fill', function (d) {
                //return colorScale(d[0]);
                //});

                //.on("mouseover", function(d,ind){tipMouseover(d,ind,attr,obj);})
                //.on("mouseout", tipMouseout);

                xAxis.scale(xScale);
                yAxis.scale(yScale);

                curplot.select("#xAxis" + i)
                    .call(xAxis)
                    .attr("font-size", textsize+"px")
                    .attr("transform", "translate(" + [margin.left, height - margin.bottom] + ")");//.attr("class","label");
                //Translate for y_val will be modified later
                curplot.select("#yAxis" + i)
                    .call(yAxis)
                    .attr("font-size", textsize+"px")
                    .attr("transform", "translate(" + [margin.left, margin.top] + ")");

                curplot
                    .append("text")
                    .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
                    .attr("transform", "translate("+ (width/2) +","+(height)+")")  // centre below axis
                    .attr("font-size", textsize+"px")
                    .text(this._y_attr);
                curplot
                    .append("text")
                    .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
                    .attr("transform", "translate("+ (textsize) +","+(height/2)+")rotate(-90)")
                    .attr("font-size", textsize+"px")
                    .text(attr[i]);



                /*
                .append("text")
                .classed("label", true)
                .attr("transform", "rotate(-90)")
                .attr("y", margin.left)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text("Ylabel");//.attr("class","label");
                */
            }


        }
    }}

    scatterMat(option){
        //d3.selectAll('#plottip').remove();

        for(let iii = 0;iii<this._totaldata.length;iii++) {
            this.updatesize();
            let data = this._totaldata[iii];
            let width = this._width;
            let height = this._height;
            this._margin = {top: height/10, right: height/10, bottom: width/10, left: width/10};
            let margin = this._margin;

            let newplot = this._plot.append("div").attr("id", "div" + iii).attr("class", "crystaldiv");
            let textsize = this._textsize;

            //load data as array
            {
                //width = 960;
                let size = height,
                    padding = (margin.left+margin.right)/3;
                   padding = padding/2

                let x = d3.scaleLinear()
                    .range([padding / 2, size - padding / 2]);

                let y = d3.scaleLinear()
                    .range([size - padding / 2, padding / 2]);

                let xAxis = d3.axisBottom()
                    .scale(x)
                    .ticks(2);

                let yAxis = d3.axisLeft()
                    .scale(y)
                    .ticks(2);

                let domainByTrait = {},
                    rangeByTrait = [],
                    traits = d3.keys(data[0]).filter(d=> {
                        return d != this._y_attr;
                    }),
                    ztrait = this._y_attr,
                    n = traits.length;

                traits.forEach(trait=> {
                    domainByTrait[trait] = this._objrange[trait];/*
                        d3.extent(data, function (d) {

                        return parseFloat(d[trait]);
                    });
                    */
                });

                rangeByTrait = this._objrange[ztrait];
                    /*
                    d3.extent(data, function (d) {
                    return parseFloat(d[ztrait]);
                });
                */
                let colorScale = d3.scaleLinear()
                    .range(['blue', 'red'])
                    .domain(rangeByTrait);
                //Later

            xAxis.tickSize(-size).tickFormat(d3.format(".1e"));
            yAxis.tickSize(-size).tickFormat(d3.format(".1e"));
            let brush = myBrush()
                .on("start", brushstart)
                .on("brush", brushmove)
                .on("end", brushend)
                .extent([[padding/2, padding/2], [size-padding/2, size-padding/2]]);

            // Size of SVG declared here
                /*
                let svg = newplot.append("svg")
                    .attr("width", width+padding)
                    .attr("height", size * n + padding)
                    .append("g")
                    .attr("transform", "translate(" + padding + "," + padding  + ")");
                */
                let svg = newplot.append("svg")
                .attr("width", (size+padding) * (n-1)+4*padding)
                .attr("height", (size+padding) * (n-1)+4*padding)//size * n + padding)
                .append("g")
                .attr("transform", "translate(" + 4*padding + "," + 0 + ")");

                //console.log(halfcross(traits,traits))
                let totalblocks = halfcross(traits, traits).length;
            svg.selectAll(".x.axis")
                .data(halfcross(traits, traits))
                .enter().append("g")
                .attr("class", "x axis")
                .attr("font-size", textsize+"px")
                .attr("transform", function (d) {

                    return "translate(" + ( d.i ) * (size+padding) + "," + ((d.j-1) * (size+padding)+size) + ")";
                })
                .each(function (d) {
                    //console.log(d.j)
                    if (d.j > totalblocks / 2-1) {
                    //console.log(padding);
                    x.domain(domainByTrait[d.x]);
                    xAxis.tickValues(domainByTrait[d.x]);
                    d3.select(this).call(xAxis).selectAll("text").attr("transform", "translate("+(-padding)+","+padding*2+") rotate(-90)");
                }
                });

            svg.selectAll(".y.axis")
                .data(halfcross(traits, traits))
                .enter().append("g")
                .attr("class", "y axis")
                .attr("font-size", textsize+"px")
                .attr("transform", function (d) {

                    return "translate(" + ( d.i ) * (size+padding) + "," + (d.j-1) * (size+padding) + ")";
                })
                .each(function (d,i) {
                    //console.log(i)
                    if (d.i === 0) {

                    yAxis.tickValues(domainByTrait[d.y]);
                    y.domain(domainByTrait[d.y]);
                    d3.select(this).call(yAxis);
                    }
                });
                svg.selectAll(".tick").selectAll("text").style("font-size", 1.5*textsize+"px");
                let p_arr;
// Attach index to each data;
                p_arr = Array.from(this._stored[iii].data._total);

                let dataind = [];
                //console.log(data);
                data.forEach((obj,i) => {

                    dataind[i]=Object.assign({},obj);
                    dataind[i].index = p_arr[i];
                });
            let cell = svg.selectAll(".cell")
                .data(halfcross(traits, traits))
                .enter().append("g")
                .attr("class", "cell")
                .attr("transform", function (d) {
                    //console.log(d);
                    return "translate(" + ( d.i ) * (size+padding) + "," + (d.j-1) * (size+padding) + ")";
                })
                .each(plot);



                function plot(p,i) {
                    //console.log(i)
                    let cell = d3.select(this);

                    x.domain(domainByTrait[p.x]);
                    y.domain(domainByTrait[p.y]);

                    cell.append("rect")
                        .attr("class", "frame")
                        .attr("x", padding / 2)
                        .attr("y", padding / 2)
                        .attr("width", size - padding)
                        .attr("height", size - padding);


                    cell.selectAll("circle")
                        .data(dataind)
                        .enter().append("circle")
                        .attr("cx", function (d) { //console.log(d);
                            return x(d[p.x]);
                        })
                        .attr("cy", function (d) {
                            return y(d[p.y]);
                        })
                        .attr("r", height/60)
                        .style("fill", function (d) {

                            return colorScale(d[ztrait]);
                        });
                    // Xlable
                    cell.append("text")
                        .attr("x", size/3)
                        .attr("y", size+10)
                        //.attr("dy", ".71em")
                        .text(function (d) {
                            if (d.j > totalblocks / 2 - 1) {
                            return d.x;
                        }
                        })
                        .attr("font-size", 2*textsize+"px");

                    // Ylable
                    cell.append("text")
                        //.attr("x", -20)//size-15)
                        //.attr("y", 5)//size+10)
                        //.attr("dy", ".71em")
                        .attr("x", -size*2/3)//-padding)
                        .attr("y", -padding)
                        .attr("dy", ".71em").attr("transform", "rotate(-90)")
                        .text(function (d) {
                            if (d.i===0) {
                                return d.y;
                            }
                        })
                        .attr("font-size", 2*textsize+"px");
                        /*
                        .attr("transform", function (d) {
                            console.log(d);
                        //console.log(d, ( d.i ) * (size+padding),(d.j-1) * (size+padding));
                        //return "translate(" + (n - i - 1) * halfcross(traits, traits) + ",0)";
                        return "translate(" + ( d.i ) * (size+padding) + "," + ((d.j-1) * (size+padding)+size) + ")";
                    });
                        */
                }

                //console.log(cross(traits, traits));
            // Titles for the diagonal.
                /*
            cell.filter(function (d) {
                return d.i === d.j;
            }).append("text")
                .attr("x", padding)
                .attr("y", padding)
                .attr("dy", ".71em")
                .text(function (d) {
                    return d.x;
                })
                .attr("font-size", 2*textsize+"px");
                */
                let brushind = this._brushNum;
                cell.call(brush);
            let brushes = [];


            let brushCell;

            // Clear the previously-active brush, if any.
            function brushstart(p) {
                if (brushCell !== this) {
                    d3.select(brushCell).call(brush.move, null);
                    brushCell = this;
                    x.domain(domainByTrait[p.x]);
                    y.domain(domainByTrait[p.y]);
                }
            }

            // Highlight the selected circles.
            function brushmove(p) {
                let e = d3.brushSelection(this);

                svg.selectAll("circle").classed("hidden", function (d) {
                    return !e
                        ? false
                        : (
                            e[0][0] > x(+d[p.x]) || x(+d[p.x]) > e[1][0]
                            || e[0][1] > y(+d[p.y]) || y(+d[p.y]) > e[1][1]
                        );
                });


                /*
                if (brushes.length!=0) {
                    //console.log('visible',svg.selectAll('#visible'))
                    svg.selectAll("#visible").classed("hidden", function (d) {
                        return !e
                            ? false
                            : (
                                e[0][0] > x(+d[p.x]) || x(+d[p.x]) > e[1][0]
                                || e[0][1] > y(+d[p.y]) || y(+d[p.y]) > e[1][1]
                            );
                    });
                }
                else{
                    svg.selectAll("circle").classed("hidden", function (d) {
                        return !e
                            ? false
                            : (
                                e[0][0] > x(+d[p.x]) || x(+d[p.x]) > e[1][0]
                                || e[0][1] > y(+d[p.y]) || y(+d[p.y]) > e[1][1]
                            );
                    });
                }

                */
            }

            // If the brush is empty, select all circles.
            function brushend() {
                let e = d3.brushSelection(this);
                brushind.index = this.parentNode.parentNode.parentNode.getAttribute('id').slice(-1);

                brushes.push(e);
                //console.log(brushes);
                //console.log('hidden',svg.selectAll('.hidden'));
                svg.selectAll("#visible").attr("id",null);
                svg.selectAll(".hidden").attr("id", "visible");//"visible");
                if (e === null) {svg.selectAll(".hidden").classed("hidden", false);
                brushes = [];};
            }
            //console.log(this);
                svg.append("text")
                    .attr("x", size*n/2-3*padding)
                    .attr("y", 0)
                    .text(this._stored[iii].id)
                    .attr("font-weight", "bold")
                    .attr("font-size", 2*textsize+"px");
            }

        }

    }

    multiscatter(){
        //d3.selectAll('#plottip').remove();

        for(let iii = 0;iii<this._totaldata.length;iii++) {
            let data = this._totaldata[iii];
            this.updatesize();
            //console.log(data);
            //console.log(this);
            //let margin = this._margin;
            let height = this._height;
            let width = this._width;
            this._margin = {top: height/10, right: height/10, bottom: width/10, left: width/10};
            let margin = this._margin;

            let newplot = this._plot.append("div").attr("id", "div" + iii).attr("class", "crystaldiv");
            let textsize = this._textsize;
            let reg = this._reg;
            let pxs,px,py,f_hat,regy;
            let [ymin,ymax] = this._objrange[this._y_attr];
            if (reg === true) {
            [px, py] = parseObj(data);
            f_hat = kernel.ImultipleRegression(px, py, kernel.fun.gaussian, this._bandwidth*(ymax-ymin));
            regy = linspace(ymin,ymax,100);
            pxs = f_hat(regy);
            }
            //console.log(pxs);
            //console.log(f_hat);

            {
                //width = 960;
                let size = height,
                    padding = (margin.left+margin.right)/3;

                let x = d3.scaleLinear()
                    .range([padding / 2, width - padding / 2]);

                let y = d3.scaleLinear()
                    .range([size - padding / 2, padding / 2]);

                let xAxis = d3.axisBottom()
                    .scale(x)
                    .ticks(2);

                let yAxis = d3.axisLeft()
                    .scale(y)
                    .ticks(2);

                let domainByTrait = {},
                    rangeByTrait = [],
                    traits = d3.keys(data[0]).filter(d=> {
                        return d != this._y_attr;
                    }),
                    ztrait = this._y_attr,
                    n = traits.length;

                traits.forEach(trait=> {
                    domainByTrait[trait] = this._objrange[trait];
                        /*
                        d3.extent(data, function (d) {
                        return parseFloat(d[trait]);
                    });
                    */
                });
                rangeByTrait = this._objrange[ztrait];
                    /*
                    d3.extent(data, function (d) {
                    return parseFloat(d[ztrait]);
                });
                */
                let colorScale = d3.scaleLinear()
                    .range(['blue', 'red'])
                    .domain(rangeByTrait);
                //xAxis.tickSize(size *n).tickFormat(d3.format(".1e"));
                //yAxis.tickSize(-size * n).tickFormat(d3.format(".1e"));
//
                xAxis.tickSize(padding/4).tickFormat(d3.format(".1e")).tickPadding(size*n-padding/4);
                yAxis.tickSize(-padding/4).tickFormat(d3.format(".1e")).tickPadding(-padding/4);


                // Size of SVG declared here

                let svg = newplot.append("svg")
                    .attr("width", width+padding)
                    .attr("height", size * n + padding)
                    .append("g")
                    .attr("transform", "translate(" + padding + "," + padding  + ")");

                x.domain(rangeByTrait);

                svg.selectAll(".x.axis")
                    .data([ztrait])
                    .enter().append("g")
                    .attr("class", "x axis")
                    .attr("font-size", textsize+"px")
                    .call(xAxis.tickValues(rangeByTrait));

                svg.selectAll(".y.axis")
                    .data(traits)
                    .enter().append("g")
                    .attr("class", "y axis")
                    .attr("font-size", textsize+"px")
                    .attr("transform", function (d, i) {
                        return "translate(0," + i * size + ")";
                    })
                    .each(function (d) {
                        y.domain(domainByTrait[d]);
                        d3.select(this).call(yAxis.tickValues(domainByTrait[d]));
                    })
                //console.log(svg.selectAll(".tick").selectAll("line"))
                svg.selectAll(".tick").selectAll("text").style("font-size", 1.5*textsize+"px");

                let p_arr = Array.from(this._stored[iii].data._total);
                let dataind = [];
                //console.log(data);
                data.forEach((obj,i) => {

                    dataind[i]=Object.assign({},obj);
                    dataind[i].index = p_arr[i];
                });
                //console.log(traits);
                let cell = svg.selectAll(".cell")
                    .data(traits)
                    .enter().append("g")
                    .attr("class", "cell")
                    .attr("transform", function (d,i) {
                        return "translate(0," + i * size + ")";
                    })
                    .each(plot);

                cell.append("text")
                    .attr("x", -size+1.5*padding)//-padding)
                    .attr("y", -padding/3)
                    .attr("dy", ".71em").attr("transform", "rotate(-90)")
                    .text(function (d) {
                        return d;
                    })
                    .attr("font-size", 2*textsize+"px");

                cell.append("text")
                    .attr("x", width/2-padding)
                    .attr("y", size+padding/3)
                    //.attr("dy", ".71em")
                    .text(d=>{if(d===traits[traits.length-1])return ztrait;})
                    .attr("font-size", 2*textsize+"px");

                function plot(p,di) {
                    //console.log(di);
                    let cell = d3.select(this);

                    x.domain(rangeByTrait);
                    y.domain(domainByTrait[p]);

                    cell.append("rect")
                        .attr("class", "frame")
                        .attr("x", padding / 2)
                        .attr("y", padding / 2)
                        .attr("width", width - padding)
                        .attr("height", size - padding);
                    //console.log(dataind);

                    //console.log(dataind);
                    //console.log(py);

                    cell.selectAll("circle")
                        .data(dataind)
                        .enter().append("circle")
                        .attr("cx", function (d) { //console.log(d);
                            //console.log(d[ztrait])
                            return x(d[ztrait]);
                            //return py[i]
                        })
                        .attr("cy", function (d) {
                            return y(d[p]);

                        })
                        .attr("r", width/200)
                        .style("fill", function (d) {

                            return colorScale(d[ztrait]);
                        });

                    // If regression is turned on
                    if (pxs!=undefined)
                    {
                        let line = d3.line()
                            .x((d,i)=> { return x(regy[i]); })
                            .y((d,i)=> { return y(pxs[i][di]); });
                        /*
                        let regpath = cell.selectAll("path")
                            .data(py,(d,i)=>{return d[i]})
                            .enter().append("path");
                        console.log(regpath);
                            regpath
                                */
                        cell.append("path")
                            .datum(regy).attr("fill", "none")
                            .attr("stroke", "black")
                            .attr("stroke-linejoin", "round")
                            .attr("stroke-linecap", "round")
                            .attr("stroke-width", 1.5)
                            .attr("d", line);
                        /*
                        let regc = cell.selectAll("circle")
                            .data(py,(d,i)=>{return d[i]})
                            .enter().append("circle");
                        console.log(regc);
                            regc.attr("cx", function (d, i) {

                                return x(py[i]);
                            })
                            .attr("cy", function (d, i) {
                                return y(pxs[i][di]);

                            })
                            .attr("r", 1)
                            .attr("fill", "black");*/
                    }
                }

                let brush = myBrush()
                    .on("start", brushstart)
                    .on("brush", brushmove)
                    .on("end", brushend)
                    .extent([[padding/2, padding/2], [width-padding/2, size-padding/2]]);

                let brushes = [];

                let brushCell;
                /*
                function newBrush(p) {
                    console.log(p);
                    let brush = myBrush()
                        .on("start", brushstart)
                        .on("brush", brushed)
                        .on("end", brushend)
                        .extent([[0, 0], [width, size]]);

                    //if(p===undefined)
                        brushes.push({id: brushes.length, brush: brush});
                    //else
                        //p.call(brush);
                    //brushes.push({id: brushes.length, brush: brush});

                    function brushstart(p) {
                        //console.log(this);
                        // your stuff here
                        //console.log(p);
                        //if (brushCell !== this) {
                            //d3.select(brushCell).call(brush.move, null);
                            //brushCell = this;
                            x.domain(rangeByTrait);
                            y.domain(domainByTrait[p]);
                        //}
                    };

                    function brushed() {
                        // your stuff here
                    }

                    function brushend() {

                        // Figure out if our latest brush has a selection
                        let lastBrushID = brushes[brushes.length - 1].id;
                        let lastBrush = document.getElementById('brush-' + lastBrushID);
                        let selection = d3.brushSelection(lastBrush);

                        // If it does, that means we need another one

                        if (selection && selection[0] !== selection[1]) {
                            //newBrush();
                            p.call(newBrush);
                            //console.log(brushes);
                        }

                        // Always draw brushes
                        drawBrushes(p);
                    }

                }

                function drawBrushes(p) {

                    let brushSelection = gBrushes
                        .selectAll('.brush')
                        .data(brushes, function (d){return d.id});

                    // Set up new brushes
                    brushSelection.enter()
                        .insert("g", '.brush')
                        .attr('class', 'brush')
                        .attr('id', function(brush){ return "brush-" + brush.id; })
                        .each(function(brushObject) {
                            //call the brush
                            brushObject.brush(d3.select(this));
                        });


                    brushSelection
                        .each(function (brushObject){
                            d3.select(this)
                                .attr('class', 'brush')
                                .selectAll('.overlay')
                                .style('pointer-events', function() {
                                    let brush = brushObject.brush;
                                    if (brushObject.id === brushes.length-1 && brush !== undefined) {
                                        return 'all';
                                    } else {
                                        return 'none';
                                    }
                                });
                        })

                    brushSelection.exit()
                        .remove();
                }
                */
                let brushind = this._brushNum;
                cell.call(brush,brushes);

                //let brushCell;

                // Clear the previously-active brush, if any.

                function brushstart(p) {
                    //console.log(brushes);
                    //console.log("Staret");
                    //brushCell = this;
                    if (brushCell != this) {
                        d3.select(brushCell).call(brush.move, null);
                        brushCell = this;//
                        x.domain(rangeByTrait);
                        y.domain(domainByTrait[p]);
                    }
                }

                // Highlight the selected circles.
                function brushmove(p) {
                    //console.log(p);
                    let e = d3.brushSelection(this);

                    svg.selectAll("circle").classed("hidden", function (d) {
                        return !e
                            ? false
                            : (
                                e[0][0] > x(+d[ztrait]) || x(+d[ztrait]) > e[1][0]
                                || e[0][1] > y(+d[p]) || y(+d[p]) > e[1][1]
                            );
                    });

                    /*
                    if (brushes.length!=0) {
                        //console.log('visible',svg.selectAll('#visible'))
                        svg.selectAll("#visible").classed("hidden", function (d) {
                            return !e
                                ? false
                                : (
                                    e[0][0] > x(+d[ztrait]) || x(+d[ztrait]) > e[1][0]
                                    || e[0][1] > y(+d[p]) || y(+d[p]) > e[1][1]
                                );
                        });
                    }
                    else{
                        svg.selectAll("circle").classed("hidden", function (d) {
                            return !e
                                ? false
                                : (
                                    e[0][0] > x(+d[ztrait]) || x(+d[ztrait]) > e[1][0]
                                    || e[0][1] > y(+d[p]) || y(+d[p]) > e[1][1]
                                );
                        });
                    }
                    */
                }

                // If the brush is empty, select all circles.
                function brushend(p) {
                    brushind.index = this.parentNode.parentNode.parentNode.getAttribute('id').slice(-1);
                    //console.log(brushind);
                    let e = d3.brushSelection(this);
                    //brushind.index = this.parentNode.parentNode.parentNode.getAttribute('id').slice(-1);
                    brushes.push(e);
                    svg.selectAll("#visible").attr("id",null);
                    svg.selectAll(".hidden").attr("id", "visible");//"visible");
                    if (e === null) {svg.selectAll(".hidden").classed("hidden", false)
                    brushes = [];
                    };
                }

                svg.append("text")
                    .attr("x", width/2-3*padding)
                    .attr("y", 0)
                    .text(this._stored[iii].id)
                    .attr("font-weight", "bold")
                    .attr("font-size", 2*textsize+"px");

            }
        }

    }

    //BoxPlot
    boxPlot() {for(let i = 0;i<this._totaldata.length;i++){
        //let data = this._data;
        this.updatesize();
        let data = this._totaldata[i];//this._data;
        //console.log(data);
        //let margin = this._margin;
        //let height = this._height - margin.top - margin.bottom;
        //let width = this._width - margin.left - margin.right;
        let height = this._height;
        let width = this._width;
        this._margin = {top: height/10, right: height/10, bottom: width/10, left: width/10};
        let margin = this._margin;

        //let newplot = this._plot;
        let newplot = this._plot.append("div").attr("id","div"+i).attr("class", "crystaldiv");

        let barWidth = this._barWidth;
        let textsize = this._textsize;

        //load data as array
        let attr = data.columns;
        let datacol = attr.length;
        let datarow = data.length;
        let obj = {};
        for (let j = 0; j < datacol; j++)
            obj[attr[j]] = [];
        for (let i = 0; i < datarow; i++) {
            for (let j = 0; j < datacol; j++) {
                obj[attr[j]].push(parseFloat(data[i][attr[j]]));
            }
        }

        for (let i = 0; i < datacol ; i++) {
            let groupCount = obj[attr[i]];
            groupCount.sort(function (a, b) {
                return a - b
            });
            let record = {};
            let localMin = d3.min(groupCount);
            let localMax = d3.max(groupCount);

            record["counts"] = groupCount;
            record["quartile"] = boxQuartiles(groupCount);
            record["whiskers"] = [localMin, localMax];

            let xScale = d3.scaleLinear()
                .domain([localMin, localMax])
                .range([0, width-margin.left-margin.right]);

            let svg = newplot.append("svg")
                .attr("height", height)
                .attr("width", width);
            let g = svg
                .append('g')
                .attr('id', "boxPlot" + i)
                .attr("transform", "translate(" + [margin.left, margin.top] + ")");

            g.append("line")
                .attr("x1", xScale(record.whiskers[0]))
                .attr("y1", height / 2)
                .attr("x2", xScale(record.whiskers[1]))
                .attr("y2", height / 2)
                .attr("stroke", "#000")
                .attr("stroke-width", 1)
                .attr("fill", "none");

            g.append("rect")
                .attr("height", barWidth)
                .attr("width", xScale(record.quartile[2]) - xScale(record.quartile[0]))
                .attr("x", xScale(record.quartile[0]))
                .attr("y", height / 2 - barWidth / 2)
                .attr("fill", "green")
                .attr("stroke", "#000")
                .attr("stroke-width", 1);


            g.append("line")
                .attr("x1", xScale(record.quartile[1]))
                .attr("y1", height / 2 - barWidth / 2)
                .attr("x2", xScale(record.quartile[1]))
                .attr("y2", height / 2 + barWidth / 2)
                .attr("stroke", "#000")
                .attr("stroke-width", 1)
                .attr("fill", "none");

            g.append("text")
                .attr("x", xScale(record.quartile[0]))
                .attr("y", height / 2 + 15 + barWidth / 2)
                .text(record.quartile[0].toFixed(2))
                .attr("style", "text-anchor: middle;")
                .attr("font-size", 2*textsize+"px");
            g.append("text")
                .attr("x", xScale(record.quartile[1]))
                .attr("y", height / 2 + 15 + barWidth / 2)
                .text(record.quartile[1].toFixed(2))
                .attr("style", "text-anchor: middle;")
                .attr("font-size", 2*textsize+"px");
            g.append("text")
                .attr("x", xScale(record.quartile[2]))
                .attr("y", height / 2 + 15 + barWidth / 2)
                .text(record.quartile[2].toFixed(2))
                .attr("style", "text-anchor: middle;")
                .attr("font-size", 2*textsize+"px");
            g.append("text")
                .attr("x", xScale(record.whiskers[1]))
                .attr("y", height / 2 + 15)
                .text(record.whiskers[1].toFixed(2))
                .attr("style", "text-anchor: middle;")
                .attr("font-size", 2*textsize+"px");
            g.append("text")
                .attr("x", xScale(record.whiskers[0]))
                .attr("y", height / 2 + 15)
                .text(record.whiskers[0].toFixed(2))
                .attr("style", "text-anchor: middle;")
                .attr("font-size", 2*textsize+"px");

            svg
                .append("text")
                .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
                .attr("transform", "translate("+ (this._width/2) +","+(this._height)+")")  // centre below axis
                .attr("font-size", 2*textsize+"px")
                .text(attr[i]);



        }

        function boxQuartiles(d) {
            return [
                d3.quantile(d, .25),
                d3.quantile(d, .5),
                d3.quantile(d, .75)
            ];
        }
    }}

    histogramPlot() {for(let i = 0;i<this._totaldata.length;i++){
        this.updatesize();
        //let data = this._data;
        let data = this._totaldata[i];//this._data;
        //let margin = this._margin;
        let height = this._height;
        let width = this._width;
        this._margin = {top: height/10, right: height/10, bottom: width/10, left: width/10};
        let margin = this._margin;

        //let newplot = this._plot;
        let newplot = this._plot.append("div").attr("id","div"+i).attr("class", "crystaldiv");
        let barWidth = this._barWidth;
        let textsize = this._textsize;

        //load data as array
        let attr = data.columns;
        let datacol = attr.length;
        let datarow = data.length;

        //let numOfBins = 10;

        for (let i = 0; i < datacol; i++) {
            let curData = [];
            for (let j = 0; j < datarow; j++) {
                curData.push(parseFloat(data[j][attr[i]]));
            }
            let value = function (d) {
                return d;
            };

            let minVal = d3.min(curData, value);
            let maxVal = d3.max(curData, value);

            let x = d3.scaleLinear()
                .domain([minVal, maxVal])
                .rangeRound([0, width-margin.left-margin.right])
            let y = d3.scaleLinear()
                .range([height-margin.top-margin.bottom, 0]);

            let tickrange = d3.range(minVal, maxVal, (maxVal - minVal) / 8);

            let histogram = d3.histogram()
                .value(function (d) {
                    return d;
                })
                .domain(x.domain())
                .thresholds(tickrange);

            let bins = histogram(curData);

            y.domain([0, d3.max(bins, function (d) {
                return d.length;
            })]);

            let svg = newplot.append("svg")
            //.attr("height", this._height)
            //.attr("width", this._width);
                .attr("height", height)
                .attr("width", width);

            let g = svg.append('g')
                .attr('id', "boxPlot" + i);
            //.attr("transform", "translate(" + [margin.left, margin.top] + ")");

            g.selectAll("rect")
                .data(bins)
                .enter()
                .append("rect")
                .attr("class", "bar")
                .attr("x", margin.left)
                .attr("y", margin.top)
                .attr("transform", function (d) {
                    return "translate(" + x(d.x0) + "," + y(d.length) + ")";
                })
                .attr("width", function (d) {
                    return x(d.x1) - x(d.x0);
                })
                .attr("height", function (d) {
                    return height-margin.top-margin.bottom - y(d.length);
                })
                .style("fill", "blue")
                .style("stroke", "white")
                .style("stroke-width", 1);

            g
                .append('g')
                .attr('id', "xAxis" + i)
                .call(d3.axisBottom(x).tickValues(tickrange))
                .attr("font-size", 2*textsize+"px")
                //.attr("transform", "translate(" + [0, height] + ")");
                .attr("transform", "translate(" + [margin.left, height - margin.bottom] + ")");//.attr("class","label");

            g
                .append('g')
                .attr('id', "yAxis" + i)
                .call(d3.axisLeft(y).ticks(5))
                .attr("font-size", 2*textsize+"px")
                .attr("transform", "translate(" + [margin.left, margin.top] + ")");




            svg
                .append("text")
                .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
                .attr("font-size", 2*textsize+"px")
                //.attr("transform", "translate("+ (width/2) +","+(this._height-margin.bottom/3)+")")  // centre below axis
                .attr("transform", "translate("+ (width/2) +","+(height)+")")  // centre below axis
                .text(attr[i]);
            // svg
            //     .append("text")
            //     .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
            //     .attr("transform", "translate("+ (margin.left/2) +","+(this._height/2)+")rotate(-90)")
            //     .text("Value");
            //.attr("transform", "translate(" + [margin.left, margin.top] + ")");//.attr("class","label");;


        }
    }}

    storedata(data){
        //console.log(data);
        if (this._stored.length===0)
        {
        //console.log(data);
        this._stored.push(data);
        if (data.data._saddleind != undefined && data.data._saddleind != -1)
            data.data._saddleinfo =  this._rawdata[data.data._saddleind];
        }
        else{
            let remove = -1;
            for (let i =0;i<this._stored.length;i++){

                if(this._stored[i].id === data.id){
                    //this._stored.splice(i,1);
                    remove = i;
                }

            }
            if(remove ==-1){
                this._stored.push(data);
                if (data.data._saddleind != undefined && data.data._saddleind != -1)
                    data.data._saddleinfo =  this._rawdata[data.data._saddleind];
            }
            else{
                this._stored.splice(remove,1);
            }
        }
    }
    removedata(){
        this._stored = [];
    }

    getdata(){
        return this._stored;
    }

    highlight(){
        //console.log(this._brushNum);
        this._selected = [];
        d3.select("#div"+this._brushNum.index).select(".cell").selectAll('circle').filter("*:not(.hidden)").each((d)=>{
            this._selected.push(d);
        });
        //console.log("highlight")
        return [this._selected, this._stored[this._brushNum.index]];

    }

}
export function cross(a, b) {
    let c = [], n = a.length, m = b.length, i, j;
    for (i = -1; ++i < n;) for (j = -1; ++j < m;) c.push({x: a[i], i: i, y: b[j], j: j});
    return c;
}

export function halfcross(a, b) {
    let c = [], n = a.length, m = b.length, i, j;
    for (i = -1; ++i < n;)
        for (j = i; ++j < m;)
            {//console.log("i",i,"j",j);
                c.push({x: a[i], i: i, y: b[j], j: j});
            }
            //console.log(c);
    return c;
}
export function parseObj(data,option) {
    let outx = [];
    let outy = [];
    if (option == undefined)
    // This should take in object array, return 2d array x and 1d array y
    {

    for (let i = 0; i < data.length; i++) {
        let curx = Object.values(data[i]).map(Number);
        let cury = curx.pop();
        //console.log(curx,cury);
        outx.push(curx);
        outy.push(cury);
    }
}else{for (let i = 0; i < data.length; i++) {
        let curx = Object.values(data[i]).map(Number);
        //console.log(curx);
        curx.pop();
        //console.log(curx);

        let cury = curx.pop();
        //console.log(curx,cury);
        outx.push(curx);
        outy.push(cury);
    }}
    return[outx,outy];

}

function linspace(a,b,n) {
    if(typeof n === "undefined") n = Math.max(Math.round(b-a)+1,1);
    if(n<2) { return n===1?[a]:[]; }
    let i,ret = Array(n);
    n--;
    for(i=n;i>=0;i--) { ret[i] = (i*b+(n-i)*a)/n; }
    return ret;
}
