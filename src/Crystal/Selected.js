import * as d3 from 'd3';
import './style.css';
import * as pubsub from '../PubSub';
//import {on} from "d3-selection"
import * as kernel from '../Process/kernel';

import {myBrush} from '../customd3';

//console.log('.');
export class Selected {
    // Assign a parentnode for all divs
    constructor(data, width, height, yattr, plottype, check, band, dataarray) {
        this._rawdata = data;
        this._data = data;
        this._margin = {top: height / 10, right: height / 10, bottom: width / 10, left: width / 10};
        this._width = width;
        this._height = height;
        this._plot = d3.select("#hdPlot");
        this._y_attr = yattr;
        this._barWidth = width / 20;
        this._textsize = height / 20;
        this._stored = [];
        this._selected = [];
        //this._brushes = [];
        this._newid;
        this._reg = check;
        this._canvas = true;
        this._svg = false;
        this._brushNum = {"index": 0};
        this._plottype = plottype;
        this._bandwidth = band;
        // This part is necessary when people try to call update attribute before selecting partition
        this._allrange;
        let attr = data.columns;
        this._obj = dataarray;

        this._objrange = {};
        for (let i = 0; i<attr.length; i++)
        {
            this._objrange[attr[i]] = [Math.min(...dataarray[attr[i]]),Math.max(...dataarray[attr[i]])];
        }

        this._attr = attr;
        this._totaldata = {};
        pubsub.subscribe("plotupdateattr", this.updateattr);
        pubsub.subscribe("plottypechange", this.updateplot);

    }
    updatesize() {
        let width = this._width;
        let height = this._height;
        this._margin = {top: height / 10, right: height / 10, bottom: width / 10, left: width / 10};
        this._barWidth = width / 20;
        this._textsize = height / 20;

    }

    // Reconstruct the plot info
    reconstruct() {

    }

    storedata(data) {

        if (this._stored.length === 0) {
            this._stored.push(data);
            if (data.data._saddleind != undefined && data.data._saddleind != -1)
                data.data._saddleinfo = this._rawdata[data.data._saddleind];
        }
        else {
            // Check which node needs to be removed
            let remove = -1;
            for (let i = 0; i < this._stored.length; i++) {
                if (this._stored[i].id === data.id) {
                    remove = i;
                }
            }
            // No stored data needs to be removed, it needs to be added to the stored
            if (remove === -1) {
                this._stored.push(data);
                if (data.data._saddleind != undefined && data.data._saddleind != -1)
                    data.data._saddleinfo = this._rawdata[data.data._saddleind];
            }
            // Remove the selection from stored
            else {
                this._stored.splice(remove, 1);
            }
        }
    }

    removedata() {
        this._stored = [];
    }

    getdata() {
        return this._stored;
    }


    // Update divs based on input data
    updatediv(crange) {
        let selected;
        this._allrange = crange;
        // this._stored got updated based on selection
        // Plots should also get updated in the same way
        selected = this._stored;
        /*
        }
        else if (inputnode.length != undefined) {
            selected = inputnode;
            if (inputnode.data._saddleind != undefined && inputnode.data._saddleind != -1)
                inputnode.data._saddleinfo = this._rawdata[inputnode.data._saddleind];
        }
        else {
            selected = [];
            selected.push(inputnode);
            if (inputnode.data._saddleind != undefined && inputnode.data._saddleind != -1)
                inputnode.data._saddleinfo = this._rawdata[inputnode.data._saddleind];
        }
        */

        this._totaldata = {};
        //this._objrange = {};

        for (let i = 0; i < selected.length; i++) {
            let nodeinfo = selected[i];
            let selectdata = [];
            nodeinfo.data._total.forEach(d => {
                selectdata.push(this._rawdata[d]);
            });
            selectdata.columns = this._rawdata.columns;
            //let attr = selectdata.columns;
            //let datacol = attr.length;
            //let datarow = selectdata.length;
            /*
            let obj = {};
            let objrange = {};

            for (let j = 0; j < datacol; j++) {
                obj[attr[j]] = [];
                objrange[attr[j]] = [];
                for (let i = 0; i < datarow; i++) {
                    obj[attr[j]].push(parseFloat(selectdata[i][attr[j]]));
                }
                objrange[attr[j]] = [Math.min(...obj[attr[j]]),Math.max(...obj[attr[j]])];
            }

            if (Object.keys(this._objrange).length === 0 && this._objrange.constructor === Object) {
                this._objrange = objrange;
            }
            else {
                for (let ir = 0; ir < datacol; ir++) {
                    this._objrange[attr[ir]][0] = Math.min(this._objrange[attr[ir]][0], objrange[attr[ir]][0])
                    this._objrange[attr[ir]][1] = Math.max(this._objrange[attr[ir]][1], objrange[attr[ir]][1])
                }
            }
            this._attr = attr;
            */
            this._totaldata[nodeinfo.id] = selectdata;
        }
        this.updateplot();
    }

    // remove all divs in it
    removediv(option) {
        if (option === undefined)
            d3.select("#hdPlot").selectAll('div').remove();
        else {
            let allPlots = d3.select("#hdPlot").select("#div" + option)
                .selectAll("svg")
                .remove();
        }
    }

    // Update all the plots based on plot selection
    updateplot(channel, self, option) {
        /
        let newplot = [];
        let plottype;

        if (self === undefined) {
            if(option!=this._plottype)
                this._plot.selectAll("div").remove();

            this._plot.selectAll("div")
                .data(Object.keys(this._totaldata),d=>{return d})
                .enter()
                .append("div")
                .attr("class", "crystaldiv")
                .attr("id", d=>{newplot.push(d);});

            this._plot.selectAll("div")
                .data(Object.keys(this._totaldata),d=>{return d})
                .exit()
                .remove();



            if (option != undefined)
                this._plottype = option;
            plottype = this._plottype;
            //this.removediv();
            switch (plottype) {
                case "BoxPlot": {
                    //this.clearPlots();
                    this.boxPlot(newplot);
                    break;
                }
                case "Histogram": {
                    //this.clearPlots();
                    this.histogramPlot(newplot);
                    break;
                }
                case "ScatterMat": {
                    //this.clearPlots();
                    this.scatterMat(newplot);
                    break;
                }
                case "AllScatter": {
                    //this.clearPlots();
                    this.multiscatter(newplot);
                    break;
                }
                case "Stats": {
                    break;
                }

                default:
            }
        }
        else {
            if(option!=self._plottype)
                self._plot.selectAll("div").remove();

            self._plot.selectAll("div")
                .data(Object.keys(self._totaldata),d=>{return d})
                .enter()
                .append("div")
                .attr("class", "crystaldiv")
                .attr("id", d=>{newplot.push(d);});

            self._plot.selectAll("div")
                .data(Object.keys(self._totaldata),d=>{return d})
                .exit()
                .remove();

            if (option != undefined)
                self._plottype = option;
            plottype = self._plottype;
            //self.removediv();

            switch (plottype) {
                case "BoxPlot": {
                    //this.clearPlots();
                    self.boxPlot(newplot);
                    break;
                }
                case "Histogram": {
                    //this.clearPlots();
                    self.histogramPlot(newplot);
                    break;
                }
                case "ScatterMat": {
                    //this.clearPlots();
                    self.scatterMat(newplot);
                    break;
                }
                case "AllScatter": {
                    //this.clearPlots();
                    self.multiscatter(newplot);
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
    updateattr(channel, self, yattr) {
        self._y_attr = yattr;
        self.updateplot();
    }


    increase() {
        this._width = this._width * 1.1;
        this._height = this._height * 1.1;
        this.updateplot();
    }
    decrease() {
        this._width = this._width * 0.9;
        this._height = this._height * 0.9;
        this.updateplot();
    }
    scatterMat(newid) {
        for (let iii = 0; iii<newid.length; iii++) {
            drawscatter(iii,this)
        }
            function drawscatter(iii,self){


            self.updatesize();
            let data = self._totaldata[newid[iii]];
            let width = self._width;
            let height = self._height;
            self._margin = {top: height / 10, right: height / 10, bottom: width / 10, left: width / 10};
            let margin = self._margin;
            //let newplot = this._plot.append("div").attr("id", "div" + iii).attr("class", "crystaldiv");
                let newplot = self._plot.selectAll("div")
                    .data([newid[iii]],d=>{return d;});
                let textsize = self._textsize;
            {
                //width = 960;
                let size = height,
                padding = (margin.left + margin.right) / 3;
                padding = padding / 2

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
                    traits = d3.keys(data[0]).filter(d => {
                        return d != self._y_attr;
                    }),
                    ztrait = self._y_attr,
                    n = traits.length;

                traits.forEach(trait => {
                    domainByTrait[trait] = self._objrange[trait];
                    /*
                                            d3.extent(data, function (d) {

                                            return parseFloat(d[trait]);
                                        });
                                        */
                });

                rangeByTrait = self._objrange[ztrait];

                let colorScale = d3.scaleLinear()
                    .range(['blue', 'red'])
                    .domain(rangeByTrait);
                //Later

                xAxis.tickSize(-size).tickFormat(d3.format(".3g"));
                xAxis.tickSize(-size).tickFormat(d3.format(".3g"));
                yAxis.tickSize(-size).tickFormat(d3.format(".3g"));


                let p_arr;
                // Attach index to each data;
                p_arr = Array.from(self._stored[iii].data._total);

                let dataind = [];

                data.forEach((obj, i) => {
                    dataind[i] = Object.assign({}, obj);
                    dataind[i].index = p_arr[i];
                });

                if(self._canvas===true) {

                    let totalplts = halfcross(traits, traits);
                    let ctx = newplot.append("canvas")
                        .attr("width", (size + padding) * (n - 1) + 10 * padding)
                        .attr("height", (size + padding) * (n - 1) + 8 * padding)
                        .node().getContext("2d");

                    ctx.translate(9 * padding, 2 * padding);
                    //console.log(totalplts)
                    for (let index = 0; index < totalplts.length; index++) {
                        let cblx = totalplts[index]
                        let transx = cblx.i;
                        let transy = cblx.j-1;
                        ctx.translate(transx*(size+padding), transy*(size+padding));
                        //let py = totalplts[index].y;
                        y.domain(domainByTrait[cblx.y]);
                        x.domain(domainByTrait[cblx.x])
                        dataind.forEach(d => {
                            //console.log(x(d[ztrait]),colorScale((d[ztrait])))
                            createplt(d, ctx, 1, cblx.x,cblx.y)
                        })//,colorScale(d[ztrait]));
                        //console.log(traits[index])
                        ctx.translate(-transx*(size+padding), -transy*(size+padding));
                    }

                    function createplt(point, context, r, px,py) {

                        let cx = x(point[px]);
                        let cy = y(point[py]);
                        let cl = colorScale(point[ztrait]);
                        //console.log(colorScale(cx));

                        context.fillStyle = cl;
                        context.beginPath();
                        context.arc(cx, cy, r, 0, 2 * Math.PI);
                        context.fill();
                        //ctx.fillRect(cx,cy,cx+r,cy+r)
                    }

                }


                    let brush = myBrush()
                    .on("start", brushstart)
                    .on("brush", brushmove)
                    .on("end", brushend)
                    .extent([[padding / 3, padding / 3], [size - padding / 3, size - padding / 3]]);

                let svg = newplot.append("svg")
                    .attr("width", (size + padding) * (n - 1) + 4 * padding)
                    .attr("height", (size + padding) * (n - 1) + 4 * padding)//size * n + padding)
                    //.append("g")
                    .attr("transform", "translate(" + 4 * padding + "," + 0 + ")");


                let totalblocks = halfcross(traits, traits).length;
                svg.selectAll(".x.axis")
                    .data(halfcross(traits, traits))
                    .enter().append("g")
                    .attr("class", "x axis")
                    .attr("font-size", textsize + "px")
                    .attr("transform", function (d) {

                        return "translate(" + (( d.i ) * (size + padding)+padding*3) + "," + ((d.j - 1) * (size + padding) + size) + ")";
                    })
                    .each(function (d) {

                        if (d.j === (traits.length - 1)) {

                            x.domain(domainByTrait[d.x]);
                            xAxis.tickValues(domainByTrait[d.x]);
                            d3.select(this).call(xAxis).selectAll("text").attr("transform", "translate(" + (-padding) + "," + padding * 2 + ") rotate(-90)");
                        }
                    });

                svg.selectAll(".y.axis")
                    .data(halfcross(traits, traits))
                    .enter().append("g")
                    .attr("class", "y axis")
                    .attr("font-size", textsize + "px")
                    .attr("transform", function (d) {

                        return "translate(" + (( d.i ) * (size + padding)+padding*3) + "," + (d.j - 1) * (size + padding) + ")";
                    })
                    .each(function (d, i) {
                        if (d.i === 0) {

                            yAxis.tickValues(domainByTrait[d.y]);
                            y.domain(domainByTrait[d.y]);
                            d3.select(this).call(yAxis);
                        }
                    });
                svg.selectAll(".tick").selectAll("text").style("font-size", 2 * textsize + "px");

                let cell = svg.selectAll(".cell")
                    .data(halfcross(traits, traits))
                    .enter().append("g")
                    .attr("class", "cell")
                    .attr("transform", function (d) {
                        //console.log(d);
                        return "translate(" + (( d.i ) * (size + padding)+padding*3) + "," + (d.j - 1) * (size + padding) + ")";
                    })
                    .each(plot);


                function plot(p, i) {
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

                    if(self._svg === true)
                    {
                    cell.selectAll("circle")
                        .data(dataind)
                        .enter().append("circle")
                        .attr("cx", function (d) { //console.log(d);
                            return x(d[p.x]);
                        })
                        .attr("cy", function (d) {
                            return y(d[p.y]);
                        })
                        .attr("r", height / 60)
                        .style("fill", function (d) {

                            return colorScale(d[ztrait]);
                        });
                    }

                    // Xlable
                    cell.append("text")
                        .attr("x", size / 3)
                        .attr("y", size + 10)
                        //.attr("dy", ".71em")
                        .text(function (d) {
                            if (d.j === (traits.length - 1)) {
                                return d.x;
                            }
                        })
                        .attr("font-size", 2 * textsize + "px");

                    // Ylable
                    cell.append("text")

                        .attr("x", -size * 2 / 3)//-padding)
                        .attr("y", -padding)
                        .attr("dy", ".71em").attr("transform", "rotate(-90)")
                        .text(function (d) {
                            if (d.i === 0) {
                                return d.y;
                            }
                        })
                        .attr("font-size", 2 * textsize + "px");
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
                let brushind = self._brushNum;
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
                    brushind.index = newid[iii];//this.parentNode.parentNode.parentNode.getAttribute('id').slice(-1);

                    brushes.push(e);
                    //console.log(brushes);
                    //console.log('hidden',svg.selectAll('.hidden'));
                    svg.selectAll("#visible").attr("id", null);
                    svg.selectAll(".hidden").attr("id", "visible");//"visible");
                    if (e === null) {
                        svg.selectAll(".hidden").classed("hidden", false);
                        brushes = [];
                    }
                    ;
                }

                //console.log(this);
                svg.append("text")
                    .attr("x", size * n / 3 -  padding)
                    .attr("y", 0)
                    .text("id: "+"("+self._stored[iii].uid+","+self._stored[iii].depth+")  "+" Size: "+self._stored[iii].data._size)
                    .attr("font-weight", "bold")
                    .attr("font-size", 2 * textsize + "px");

                svg.on("mouseover", ()=>{
                    addbutton(svg, (n-1)*(size+padding), 0, padding*2, "red", "deletebutton",[1]);
                    svg.selectAll(".deletebutton").on("click",()=>{

                        svg.remove();//console.log("I got clicked")
                        pubsub.publish("RMNode",self._stored[iii]);
                        self.stored.splice(iii,1);
                        });//.classed("deletebutton", true);
                        pubsub.publish("HighlightNode",self._stored[iii])})
                    .on("mouseleave", ()=>{
                        svg.selectAll(".deletebutton").remove()//classed("deletebutton", false);
                        pubsub.publish("UnHighlightNode",self._stored[iii]);
                        });
            }

        }

    }
    multiscatter(newid) {
        //console.log(newid);
        for (let iii = 0; iii<newid.length; iii++){
            drawscatter(iii,this)
        }

        function drawscatter(iii,self){
            let data = self._totaldata[newid[iii]];
            //console.log(data)
            self.updatesize();

            let height = self._height;
            let width = self._width;
            self._margin = {top: height / 10, right: height / 10, bottom: width / 10, left: width / 10};
            let margin = self._margin;

            let newplot = self._plot.selectAll("div")
                .data([newid[iii]],d=>{return d;});//.enter();


            //let newplot = self._plot.append("div").attr("id", "div" + iii).attr("class", "crystaldiv");
            let textsize = self._textsize;
            let reg = self._reg;
            let pxs, px, py, f_hat, regy, f_hat2, std;

            let [ymin, ymax] = [Math.min(...self._totaldata[newid[iii]].map(x=>{return x[self._y_attr]})), Math.max(...self._totaldata[newid[iii]].map(x=>{return x[self._y_attr]}))]
            //console.log(self);
            //let  = self._objrange[self._y_attr];
            //console.log(ymin,ymax);
            if (reg === true) {
                if (ymax>ymin){
                [px, py] = parseObj(data);
                f_hat = kernel.ImultipleRegression(px, py, kernel.fun.gaussian, self._bandwidth * (ymax - ymin));
                regy = linspace(ymin, ymax, 100);
                f_hat2 = kernel.averageStd(px, py, kernel.fun.gaussian, self._bandwidth * (ymax - ymin));
                pxs = f_hat(regy);
                std = f_hat2(regy, pxs);
                }
            }

            {
                //width = 960;
                let size = height,
                    padding = (margin.left + margin.right) / 3;

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
                    traits = d3.keys(data[0]).filter(d => {
                        return d != self._y_attr;
                    }),
                    ztrait = self._y_attr,
                    n = traits.length;

                traits.forEach(trait => {
                    domainByTrait[trait] = self._objrange[trait];

                });
                rangeByTrait = self._objrange[ztrait];

                let colorScale = d3.scaleLinear()
                    .range(['blue', 'red'])
                    .domain(rangeByTrait);

                xAxis.tickSize(padding / 4).tickFormat(d3.format(".3g")).tickPadding(size * n - padding / 4);
                yAxis.tickSize(-padding / 4).tickFormat(d3.format(".3g")).tickPadding(-padding / 4);

                // Size of SVG declared here

                let p_arr = Array.from(self._stored[iii].data._total);
                let dataind = [];
                data.forEach((obj, i) => {

                    dataind[i] = Object.assign({}, obj);
                    dataind[i].index = p_arr[i];
                });

                x.domain(rangeByTrait);

                if (self._canvas === true) {

                let ctx = newplot.append("canvas")
                    .attr("width", width + 3 * padding)
                    .attr("height", size * n + padding)
                    .node().getContext("2d");

                ctx.translate(3 * padding, 7 / 4 * padding);

                for (let index = 0; index < n; index++) {
                    //console.log(dataind)
                    y.domain(domainByTrait[traits[index]]);
                    dataind.forEach(d => {
                        //console.log(x(d[ztrait]),colorScale((d[ztrait])))
                        createplt(d, ctx, 1, traits[index])
                    })//,colorScale(d[ztrait]));
                    //console.log(traits[index])
                    ctx.translate(0, size);
                }

                function createplt(point, context, r, p) {

                    let cx = x(point[ztrait]);
                    let cy = y(point[p]);
                    let cl = colorScale(point[ztrait]);
                    //console.log(colorScale(cx));

                    context.fillStyle = cl
                    context.beginPath();
                    context.arc(cx, cy, r, 0, 2 * Math.PI);
                    context.fill();
                    //ctx.fillRect(cx,cy,cx+r,cy+r)
                }

                }
                let svg = newplot.append("svg")
                    .attr("width", width + padding)
                    .attr("height", size * n + padding)
                    //.append("g")
                    .attr("transform", "translate(" + padding + "," + 0 + ")");


                let cell = svg.selectAll(".cell")
                    .data(traits)
                    .enter().append("g")
                    .attr("width", width - padding)
                    .attr("height", size - padding)
                    .attr("class", "cell")
                    .attr("transform", function (d, i) {
                        return "translate("+padding+"," + ((i * size)+3/4*padding)+ ")";
                    })
                    .each(plot);
                function plot(p, di) {
                    let cell = d3.select(this);

                    x.domain(rangeByTrait);
                    y.domain(domainByTrait[p]);

                    cell.append("rect")
                        .attr("class", "frame")
                        .attr("x", padding / 2)
                        .attr("y", padding / 2)
                        .attr("width", width - padding)
                        .attr("height", size - padding);

                    if (pxs != undefined) {
                        let area = d3.area()
                            .x0((d, i) => {
                                return x(regy[i]);
                            })
                            .y0((d, i) => {
                                return y(pxs[i][di] + std[i][di] / 2);
                            })
                            .x1((d, i) => {
                                return x(regy[i]);
                            })
                            .y1((d, i) => {
                                return y(pxs[i][di] - std[i][di] / 2);
                            });
                        let line = d3.line()
                            .x((d, i) => {
                                return x(regy[i]);
                            })
                            .y((d, i) => {
                                return y(pxs[i][di]);
                            });

                        cell.insert("path")
                            .datum(regy).attr("fill", "#f1f1f1")
                            .attr("stroke", "#f1f1f1")
                            .attr("stroke-linejoin", "round")
                            .attr("stroke-linecap", "round")
                            .attr("stroke-width", 1)
                            .attr("stroke-opacity", 0.3)
                            .attr("d", area);
                        cell.append("path")
                            .datum(regy).attr("fill", "none")
                            .attr("stroke", "black")
                            .attr("stroke-linejoin", "round")
                            .attr("stroke-linecap", "round")
                            .attr("stroke-width", 1)
                            .attr("stroke-opacity", 0.7)
                            .attr("d", line);

                    }
                    if (self._svg === true){

                        cell.selectAll("circle")
                            .data(dataind)
                            .enter().append("circle")
                            .attr("cx", function (d) {
                                return x(d[ztrait]);
                            })
                            .attr("cy", function (d) {
                                return y(d[p]);

                            })
                            .attr("r", width / 200)
                            .style("fill", function (d) {

                                return colorScale(d[ztrait]);
                            });

                    }
                    //newplot.append("canvas")
/*

    */
                    // If regression is turned on

                }




                svg.selectAll(".x.axis")
                    .data([ztrait])
                    .enter().append("g")
                    .attr("class", "x axis").attr("transform", "translate(" + padding + "," + padding + ")")
                    .attr("font-size", textsize + "px")
                    .attr("transform", function (d, i) {
                        return "translate("+padding+"," + (3/4*padding)+ ")";
                    })
                    .call(xAxis.tickValues(rangeByTrait));

                svg.selectAll(".y.axis")
                    .data(traits)
                    .enter().append("g")
                    .attr("class", "y axis")
                    .attr("font-size", textsize + "px")
                    .attr("transform", function (d, i) {
                        return "translate("+padding+"," + (i * size +3/4*padding)+ ")";
                    })
                    .each(function (d) {
                        y.domain(domainByTrait[d]);
                        d3.select(this).call(yAxis.tickValues(domainByTrait[d]));
                    })
                svg.selectAll(".tick").selectAll("text").style("font-size", 2 * textsize + "px");




                cell.append("text")
                    .attr("x", -size * 2 / 3)//-padding)
                    .attr("y", -padding / 3)
                    .attr("dy", ".71em").attr("transform", "rotate(-90)")
                    .text(function (d) {
                        return d;
                    })
                    .attr("font-size", 2 * textsize + "px");

                cell.append("text")
                    .attr("x", width / 2 - padding)
                    .attr("y", size + padding / 3)
                    .text(d => {
                        if (d === traits[traits.length - 1]) return ztrait;
                    })
                    .attr("font-size", 2 * textsize + "px");

                let brush = myBrush()
                    .on("start", brushstart)
                    .on("brush", brushmove)
                    .on("end", brushend)
                    .extent([[padding / 3, padding / 3], [width - padding / 3, size - padding / 3]]);

                let brushes = [];

                let brushCell;

                let brushind = self._brushNum;
                cell.call(brush, brushes);

                function brushstart(p) {

                    if (brushCell != this) {
                        d3.select(brushCell).call(brush.move, null);
                        brushCell = this;//
                        x.domain(rangeByTrait);
                        y.domain(domainByTrait[p]);
                    }
                }

                // Highlight the selected circles.
                function brushmove(p) {
                    let e = d3.brushSelection(this);
                    svg.selectAll("circle").classed("hidden", function (d) {
                        return !e
                            ? false
                            : (
                                e[0][0] > x(+d[ztrait]) || x(+d[ztrait]) > e[1][0]
                                || e[0][1] > y(+d[p]) || y(+d[p]) > e[1][1]
                            );
                    });
                }
                // If the brush is empty, select all circles.
                function brushend(p) {
                    brushind.index = newid[iii];//this.parentNode.parentNode.parentNode.getAttribute('id').slice(-1);
                    let e = d3.brushSelection(this);
                    brushes.push(e);
                    svg.selectAll("#visible").attr("id", null);
                    svg.selectAll(".hidden").attr("id", "visible");//"visible");
                    if (e === null) {
                        svg.selectAll(".hidden").classed("hidden", false)
                        brushes = [];
                    }
                }
                svg.append("text")
                    .attr("x", width / 3 -  padding)
                    .attr("y", 0)
                    //.text(self._stored[iii].id)
                    .text("id: "+"("+self._stored[iii].uid+","+self._stored[iii].depth+")  "+" Size: "+self._stored[iii].data._size)
                    .attr("font-weight", "bold")
                    .attr("font-size", 2 * textsize + "px");
                //console.log(header)
                //svg.on("mouseover", ()=>{pubsub.publish("HighlightNode",self._stored[iii])})
                //    .on("mouseout", ()=>{pubsub.publish("UnHighlightNode",self._stored[iii])});

                svg.on("mouseover", ()=>{
                    addbutton(svg, width, 0, padding, "red", "deletebutton",[1]);
                    d3.selectAll(".deletebutton").on("click",()=>{
                        svg.remove();
                        //console.log("I got clicked");
                        pubsub.publish("RMNode",self._stored[iii]);
                        self.stored.splice(iii,1);
                    });
                    pubsub.publish("HighlightNode",self._stored[iii])})
                    .on("mouseleave", ()=>{
                        svg.selectAll(".deletebutton").remove()//classed("deletebutton", false);
                        pubsub.publish("UnHighlightNode",self._stored[iii]);
                    });
            }
            //newplot.merge(self._plot.selectAll("div"))
        }
    }
    //BoxPlot
    boxPlot(newid) {
        for (let iii = 0; iii<newid.length; iii++) {
            drawbox(iii,this)
        }

        function drawbox(iii,self){
            let format = d3.format('.3g');
            //let data = this._data;
            self.updatesize();
            let data = self._totaldata[newid[iii]];//this._data;

            let height = self._height;
            let width = self._width;
            self._margin = {top: height / 10, right: height / 10, bottom: width / 10, left: width / 10};
            let margin = self._margin;
            //console.log(height,width)

            //let newplot = this._plot;
            //let newplot = this._plot.append("div").attr("id", "div" + i).attr("class", "crystaldiv");
            let newplot = self._plot.selectAll("div")
                .data([newid[iii]],d=>{return d;});//.enter();

            let barWidth = self._barWidth;
            let textsize = self._textsize;
            let size = height,
                padding = (margin.left + margin.right) / 3;
            //load data as array
            let attr = data.columns;
            let n = attr.length;
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

            let svg = newplot.append("svg")
                .attr("width", width + padding)
                .attr("height", size * n + padding)
                //.append("g")
                .attr("transform", "translate(" + padding + "," + padding + ")");

            for (let i = 0; i < datacol; i++) {
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
                    .range([0, width - margin.left - margin.right]);

                //let svg = newplot.append("svg")
                //    .attr("height", height)
                //    .attr("width", width);

                let g = svg
                    .append('g')
                    .attr('id', "boxPlot" + i)
                    .attr("transform", "translate(" + [padding, i * size+padding] + ")");

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
                    .text(format(record.quartile[0].toFixed(2)))
                    .attr("style", "text-anchor: middle;")
                    .attr("font-size", 2 * textsize + "px");

                g.append("text")
                    .attr("x", xScale(record.quartile[1]))
                    .attr("y", height / 2 + 15 + barWidth / 2)
                    .text(format(record.quartile[1].toFixed(2)))
                    .attr("style", "text-anchor: middle;")
                    .attr("font-size", 2 * textsize + "px");

                g.append("text")
                    .attr("x", xScale(record.quartile[2]))
                    .attr("y", height / 2 + 15 + barWidth / 2)
                    .text(format(record.quartile[2].toFixed(2)))
                    .attr("style", "text-anchor: middle;")
                    .attr("font-size", 2 * textsize + "px");

                g.append("text")
                    .attr("x", xScale(record.whiskers[1]))
                    .attr("y", height / 2 + 15)
                    .text(format(record.whiskers[1].toFixed(2)))
                    .attr("style", "text-anchor: middle;")
                    .attr("font-size", 2 * textsize + "px");

                g.append("text")
                    .attr("x", xScale(record.whiskers[0]))
                    .attr("y", height / 2 + 15)
                    .text(format(record.whiskers[0].toFixed(2)))
                    .attr("style", "text-anchor: middle;")
                    .attr("font-size", 2 * textsize + "px");

                g.append("text")
                    .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
                    .attr("transform", "translate(" + (self._width / 3) + "," + 0 + ")")  // centre below axis
                    .attr("font-size", 2 * textsize + "px")
                    .text(attr[i]);


            }
            svg.append("text")
                .attr("x", width / 3 -  padding)
                .attr("y", 0)
                //.text(self._stored[iii].id)
                .text("id: "+"("+self._stored[iii].uid+","+self._stored[iii].depth+")  "+" Size: "+self._stored[iii].data._size)
                .attr("font-weight", "bold")
                .attr("font-size", 2 * textsize + "px");

            svg.on("mouseover", ()=>{
                addbutton(svg, width-padding, 0, padding, "red", "deletebutton",[1]);
                svg.selectAll(".deletebutton").on("click",()=>{
                    svg.remove();//console.log("I got clicked")
                    pubsub.publish("RMNode",self._stored[iii]);
                    self.stored.splice(iii,1);
                });
                pubsub.publish("HighlightNode",self._stored[iii])})
                .on("mouseleave", ()=>{
                    svg.selectAll(".deletebutton").remove()//classed("deletebutton", false);
                    pubsub.publish("UnHighlightNode",self._stored[iii]);
                });

            function boxQuartiles(d) {
                return [
                    d3.quantile(d, .25),
                    d3.quantile(d, .5),
                    d3.quantile(d, .75)
                ];
            }
        }

    }

    histogramPlot(newid) {
        for (let iii = 0; iii<newid.length; iii++) {
            drawhist(iii,this)
        }
        function drawhist(iii,self) {
            let format = d3.format(".3g");
            self.updatesize();
            //let data = this._data;
            let data = self._totaldata[newid[iii]];//this._data;
            //let margin = this._margin;
            let height = self._height;
            let width = self._width;
            self._margin = {top: height / 10, right: height / 10, bottom: width / 10, left: width / 10};
            let margin = self._margin;

            //let newplot = this._plot;
            //let newplot = self._plot.append("div").attr("id", "div" + i).attr("class", "crystaldiv");

            let newplot = self._plot.selectAll("div")
                .data([newid[iii]],d=>{return d;});//.enter();

            let barWidth = self._barWidth;
            let textsize = self._textsize;

            let size = height,
                padding = (margin.left + margin.right) / 3;
            //load data as array

            //load data as array
            let attr = data.columns;
            let n = attr.length;
            let datacol = attr.length;
            let datarow = data.length;

            //let numOfBins = 10;
            let svg = newplot.append("svg")
                .attr("width", width + padding)
                .attr("height", size * n + padding)
                //.append("g")
                .attr("transform", "translate(" + padding + "," + padding + ")");

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
                    .rangeRound([0, width - margin.left - margin.right])
                let y = d3.scaleLinear()
                    .range([height - margin.top - margin.bottom, 0]);

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

                let g = svg
                    .append('g')
                    .attr('id', "histPlot" + i)
                    .attr("transform", "translate(" + [padding, i * size+padding] + ")");

                //let g = svg.append('g')
                //    .attr('id', "boxPlot" + i);
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
                        return height - margin.top - margin.bottom - y(d.length);
                    })
                    .style("fill", "blue")
                    .style("stroke", "white")
                    .style("stroke-width", 1);

                g
                    .append('g')
                    .attr('id', "xAxis" + i)
                    .call(d3.axisBottom(x).tickValues(tickrange).tickFormat(d3.format(".2g")))
                    .attr("font-size", 2 * textsize + "px")
                    //.attr("transform", "translate(" + [0, height] + ")");
                    .attr("transform", "translate(" + [margin.left, height - margin.bottom] + ")");//.attr("class","label");

                g
                    .append('g')
                    .attr('id', "yAxis" + i)
                    .call(d3.axisLeft(y).ticks(4).tickFormat(d3.format(".2g")))
                    .attr("font-size", 2 * textsize + "px")
                    .attr("transform", "translate(" + [margin.left, margin.top] + ")");


                g
                    .append("text")
                    .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
                    .attr("font-size", 2 * textsize + "px")
                    //.attr("transform", "translate("+ (width/2) +","+(this._height-margin.bottom/3)+")")  // centre below axis
                    .attr("transform", "translate(" + (width / 2) + "," + padding/2 + ")")  // centre below axis
                    .text(attr[i]);
                // svg
                //     .append("text")
                //     .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
                //     .attr("transform", "translate("+ (margin.left/2) +","+(this._height/2)+")rotate(-90)")
                //     .text("Value");
                //.attr("transform", "translate(" + [margin.left, margin.top] + ")");//.attr("class","label");;


            }

            svg.append("text")
                .attr("x", width / 3 - padding)
                .attr("y", 0)
                //.text(self._stored[iii].id)
                .text("id: "+"("+self._stored[iii].uid+","+self._stored[iii].depth+")  "+" Size: "+self._stored[iii].data._size)
                .attr("font-weight", "bold")
                .attr("font-size", 2 * textsize + "px");

            svg.on("mouseover", ()=>{
                addbutton(svg, width, 0, padding, "red", "deletebutton",[1]);
                svg.selectAll(".deletebutton").on("click",()=>{
                    svg.remove();//console.log("I got clicked")
                    pubsub.publish("RMNode",self._stored[iii]);
                    self.stored.splice(iii,1);
                });
                pubsub.publish("HighlightNode",self._stored[iii])})
                .on("mouseleave", ()=>{
                    svg.selectAll(".deletebutton").remove()//classed("deletebutton", false);
                    pubsub.publish("UnHighlightNode",self._stored[iii]);
                });

        }
    }


    highlight() {

        this._selected = [];
        let newplot = this._plot.selectAll("div").data([this._brushNum.index],d=>{return d;})
        newplot.select(".cell").selectAll('circle').filter("*:not(.hidden)").each((d) => {
            this._selected.push(d);
        });

        let snode;
        //console.log(this._stored)
        this._stored.forEach(d=>{//console.log(d);
            if(d.id === this._brushNum.index)
                snode = d;
        });
        return [this._selected, snode];

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
        for (j = i; ++j < m;) {//console.log("i",i,"j",j);
            c.push({x: a[i], i: i, y: b[j], j: j});
        }
    //console.log(c);
    return c;
}

export function parseObj(data, option) {
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
    } else {
        for (let i = 0; i < data.length; i++) {
            let curx = Object.values(data[i]).map(Number);
            //console.log(curx);
            curx.pop();
            //console.log(curx);

            let cury = curx.pop();
            //console.log(curx,cury);
            outx.push(curx);
            outy.push(cury);
        }
    }
    return [outx, outy];

}

function linspace(a, b, n) {
    if (typeof n === "undefined") n = Math.max(Math.round(b - a) + 1, 1);
    if (n < 2) {
        return n === 1 ? [a] : [];
    }
    let i, ret = Array(n);
    n--;
    for (i = n; i >= 0; i--) {
        ret[i] = (i * b + (n - i) * a) / n;
    }
    return ret;
}

function d3CloseButton () {

    var size = 20,
        x = 0,
        y = 0,
        rx = 0,
        ry = 0,
        isCircle = false,
        isBorderShown = false,
        borderStrokeWidth = 1.5,
        crossStrokeWidth = 1.5,
        g,
        event;

    function button (selection) {

        //Styling for the border of the button
        var buttonStyle = {
                "fill-opacity": 0,
                "stroke-width": borderStrokeWidth,
                "stroke": (isBorderShown)? "none" : "red" },
            //for the cross
            crossStyle = {
                "stroke-width": crossStrokeWidth,
                "stroke": "red"
            },
            r = size / 2,
            ofs = size / 6,
            cross;

        g = selection.append("g").on("click", event);
        cross = g.append("g");

        if (isCircle) {
            g.append("circle")
                .attr("cx", x)
                .attr("cy", y)
                .attr("r", r)
                .style(buttonStyle);

            cross.append("line")
                .attr("x1", x - r + ofs)
                .attr("y1", y)
                .attr("x2", x + r - ofs)
                .attr("y2", y);

            cross.append("line")
                .attr("x1", x)
                .attr("y1", y - r + ofs)
                .attr("x2", x)
                .attr("y2", y + r - ofs);

            // Make '+' to 'x'
            cross.attr("transform", "rotate (45," + x + "," + y + ")");

        } else {
            g.append("rect")
                .attr("x", x)
                .attr("y", y)
                .attr("rx", rx)
                .attr("ry", ry)
                .attr("width", size)
                .attr("height", size)
                .style(buttonStyle);

            cross.append("line")
                .attr("x1", x + ofs)
                .attr("y1", y + ofs)
                .attr("x2", (x + size) - ofs)
                .attr("y2", (y + size) - ofs);

            cross.append("line")
                .attr("x1", (x + size) - ofs)
                .attr("y1", y + ofs)
                .attr("x2", x + ofs)
                .attr("y2", (y + size) - ofs);
        }

        cross.style(crossStyle)

    }

    button.x = function (val) {
        x = val;
        return button;
    }

    button.y = function (val) {
        y = val;
        return button;
    }

    button.size = function (val) {
        size = val;
        return button;
    }

    button.rx = function (val) {
        rx = val;
        return button;
    }

    button.ry = function (val) {
        ry = val;
        return button;
    }

    button.borderStrokeWidth = function (val) {
        borderStrokeWidth = val;
        return button;
    }

    button.crossStrokeWidth = function (val) {
        crossStrokeWidth = val;
        return button;
    }

    //If true, the border of the button becomes a circle instead of a rectangle
    button.isCircle = function (val) {
        isCircle = val;
        return button;
    }

    button.isBorderShown = function (val) {
        isBorderShown = val;
        return button;
    }

    button.clickEvent = function (val) {
        event = val;
        return button;
    }

    //Remove the whole button if one already exists
    button.remove = function () {
        if (g) {
            g.remove();
            g = undefined;
        }

        return button;
    }

    return button;
}

function addbutton(svg, x, y, size,color, cname,data){

    svg.selectAll("."+cname).data(data,d=>{return d;}).enter()
        .append("rect").attr("class", cname)
        .attr("x", x)
        .attr("y", y)
        //.attr("dy",".9em")
        .attr("width", size)
        .attr("height", size).attr("fill", "transparent").attr("stroke",color);

    svg.selectAll("."+cname).data(data+1,d=>{return d;}).enter().append("line").attr("class", cname)
        .attr("x1", x+ size/4)
        .attr("y1", y + size/4)
        .attr("x2", x + size - size/4)
        .attr("y2", (y + size) - size/4).attr("stroke",color);

    svg.selectAll("."+cname).data(data+2,d=>{return d;}).enter().append("line").attr("class", cname)
        .attr("x1", (x + size) - size/4)
        .attr("y1", y + size/4)
        .attr("x2", x + size/4)
        .attr("y2", (y + size) - size/4).attr("stroke",color);

    /*
    svg.append("rect").attr("class", "deletebutton")
        .attr("x", (n-1)*size)
        .attr("y", 0)
        .attr("width", padding*2)
        .attr("height", padding*2).attr("fill", "transparent").attr("stroke","red");

    svg.append("line").attr("class", "deletebutton")
        .attr("x1", (n-1)*size + padding/4)
        .attr("y1", 0 + padding/4)
        .attr("x2", ((n-1)*size + padding*2) - padding/4)
        .attr("y2", (0 + padding*2) - padding/4).attr("stroke","red");

    svg.append("line").attr("class", "deletebutton")
        .attr("x1", ((n-1)*size + padding*2) - padding/4)
        .attr("y1", 0 + padding/4)
        .attr("x2", (n-1)*size + padding/4)
        .attr("y2", (0 + padding*2) - padding/4).attr("stroke","red");
    */

}