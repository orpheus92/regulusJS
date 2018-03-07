import './style.css';
import {event,select,selectAll} from 'd3-selection';
import {csv,json,scaleLinear,csvParse} from 'd3';
import {drag} from 'd3-drag';
//import { event as currentEvent } from 'd3-selection';

import {pBar} from '../filter'
import {parseObj,PlotView} from '../partitionview';
import {Info} from '../info';
import {TreeView,TreeLevel} from '../treeview';
import {Slider} from '../filter';
import * as pubsub from '../PubSub';
//import {Partition} from '../process';
import {RangeFilter} from "../filter/RangeFilter";


let pInter;
let sizeInter;
let tree;
//let partition;
let loaddata;
let cnode;
let treelevel;
let check = false;
let selectindex;
let cur_node;
let cur_selection;
let filterbox;
let level;
let scale;
let band;
let measure;

let filterdata;
let dataarray;

//select('#catalog').on('click', () =>  {load("waste_Pu")});


select('#catalog')
    .on('change', function () { load(this.value);});

fetch('/catalog')
    .then( response => response.json() )
    .then( catalog => {
        catalog.unshift("");
        let l = select('#catalog').selectAll('options')
            .data(catalog);
        l.enter().append('option')
            .merge(l)
            .attr('value', d => d)
            .text(d => d);
    });


function load(dataset){
    csv(`data/${dataset}/data.csv`, rawdata=> {
        for (let i = rawdata.columns.length-1; i>= 0; i--)
        {
            selectAll("#y_attr")
                .append("option")
                .attr("value", rawdata.columns[i])
                .text(rawdata.columns[i]);
            // Should have all attrs for range filter
            selectAll("#RangeAttr")
                .append("option")
                .attr("value", rawdata.columns[i])
                .text(rawdata.columns[i]);
            // Should have all attrs for info
            selectAll("#CompAttr")
                .append("option")
                .attr("value", rawdata.columns[i])
                .text(rawdata.columns[i]);
        }
        json(`data/${dataset}/P_Partition.json`, function (error, data) {
            if (error) throw error;
            //will be updated later


            csv(`data/${dataset}/Final_Tree.csv`, treedata=>{
                json(`data/${dataset}/Base_Partition.json`, function (error, basedata) {
                    // Convert rawdata to floats in the beginning
                    rawdata.forEach(d=>{
                        for (let i = rawdata.columns.length-1; i>= 0; i--){
                            d[rawdata.columns[i]] = parseFloat(d[rawdata.columns[i]])
                        }
                    });
                    dataarray = {};
                    // Convert data into arrays that will be used later
                    for (let j = 0; j < rawdata.columns.length; j++) {
                        dataarray[rawdata.columns[j]] = [];
                        for (let i = 0; i < rawdata.length; i++) {
                            dataarray[rawdata.columns[j]].push(rawdata[i][rawdata.columns[j]]);
                        }
                    }

                    measure = rawdata.columns[rawdata.columns.length-1];
                    // Initialize Range Filter
                    let rfilter = new RangeFilter(dataarray,rawdata);

                    // Will be changed later such that i did not depend on the DOM
                    let yattr = select("#y_attr").node().value;//document.getElementById('y_attr').value;
                    let plottype = select("#plottype").node().value;//document.getElementById('plottype').value;

                    // Plot View Constructor
                    // Plot SIZE
                    let width = 225;
                    let height = 75;
                    pInter = 0.2;
                    sizeInter = 25;
                    band = 0.1;

                    // Data View Constructor
                    loaddata = new Info();
                    // Persistence Array
                    let parr = loaddata.create(data, pInter, sizeInter,measure, dataarray);
                    //pubsub.publish("infoupdate", pInter, sizeInter);
                    // Tree
                    tree = new TreeView(treedata, data, basedata);
                    treelevel = new TreeLevel();
                    tree.updateTree(pInter, sizeInter);

                    let plots = new PlotView(rawdata, width, height, yattr, plottype,check,band,dataarray);

                    // filter Event

                    // Filterindex will get updated later during interaction

                    // Range will result from user later.

                    // Everytime this gets updated, tree should get updated, plot should get updated

                    // Initialize Slider
                    let newslider = new Slider(select("#treeslider"));
                    let slider = newslider.createslider([parr[0], parr[parr.length-1]],150);
                    let x = scaleLinear()
                        .domain([parr[0], parr[parr.length-1]])
                        .range([0, 150])//size of slider and range of output, put persistence here
                        .clamp(true);
                    slider.handle.attr("cx", x(pInter));

                    //Initialize Charts
                    let pb = new pBar(tree,data,basedata);
                    //pb.updateBar(pInter,sizeInter);
                    pubsub.publish("ParameterUpdate", pInter, sizeInter);
                    slider.curslide.call(drag()
                        .on("start drag", function () {
                            //console.log("BBB");
                            //slider.handle.attr("cx", x(pInter)); //initial position for the slider
                            slider.handle.attr("cx", x(x.invert(event.x)));
                            pInter = x.invert(event.x);
                            //loaddata.update(pInter, sizeInter);
                            //pubsub.publish("infoupdate", pInter, sizeInter);
                            //tree.updateTree(pInter, sizeInter);
                            [pInter,sizeInter] = tree.setParameter("slide", [pInter, sizeInter]);
                            // update persistence chart and size chart
                            //pb.updateBar(pInter,sizeInter);

                        })
                    );

                    select(".ppbar").call(drag()
                        .on("start drag", () => {
                                select(".ppbar").attr("x", pb.padding-2+pb.xScale(pb.xScale.invert(event.x-pb.padding+2)));
                                pInter = pb.xScale.invert(event.x-pb.padding+2)-Number.EPSILON;
                                slider.handle.attr("cx", x(pInter));

                                //pubsub.publish("infoupdate", pInter, sizeInter);
                                [pInter,sizeInter] = tree.setParameter("slide", [pInter, sizeInter]);



                        }));

                    select(".pbar").call(drag()
                        .on("start drag", ()=>{
                            select(".pbar").attr("x", pb.padding-2+pb.xScale2(pb.xScale2.invert(event.x-pb.padding+2)));
                            sizeInter = parseInt(pb.xScale2.invert(event.x-pb.padding+2));
                            //pubsub.publish("infoupdate", pInter, sizeInter);
                            [pInter,sizeInter] = tree.setParameter("slide", [pInter, sizeInter]);
                            //treelevel.plotLevel(tree);
                        }));

                    //Separate clicking from double clicking
                    select("#tree").node().onmouseover = function(event) {
                    //document.getElementById("tree").onmouseover = function(event) {

                            let clicks = 0;
                        let DELAY = 500;
                        selectAll(".node")
                            .on("click", (nodeinfo)=>{

                                console.log(event.altKey, event, this, nodeinfo);
                                if (!event.altKey)
                                {
                                    plots.storedata(nodeinfo);
                                }
                                else
                                {selectAll(".Clicked").classed("Clicked",false);
                                    plots.removedata();
                                    plots.storedata(nodeinfo);
                                }
                                let timer;
                                clicks++;  //count clicks
                                if(clicks === 1) {
                                    timer = setTimeout(function() {
                                        let selectedNodes = plots.getdata();
                                        tree.mark(selectedNodes);
                                        plots.updatediv();
                                        cnode = nodeinfo;

                                        pubsub.publish("infoselect", cnode.data, select('#CompAttr').node().value);
                                        clicks = 0;             //after action performed, reset counter

                                    }, DELAY);

                                }
                                else
                                {
                                    clearTimeout(timer);    //prevent process-click action
                                    tree.reshapeTree(nodeinfo);
                                    //treelevel.plotLevel(tree);

                                    clicks = 0;             //after action performed, reset counter
                                }
                            })
                            .on("mouseover", (nodeinfo)=>{
                                //loaddata.select(nodeinfo,document.getElementById('CompAttr').value);
                                pubsub.publish("infoselect", nodeinfo.data, select("#CompAttr").node().value);//document.getElementById('CompAttr').value);
                                if (cnode===undefined)
                                {cnode = nodeinfo;
                                    //console.log(nodeinfo);
                                }
                            })
                            .on("mouseout", (nodeinfo)=>{
                                if (cnode===undefined)
                                {cnode = nodeinfo;
                                }
                                pubsub.publish("infoselect", cnode.data, select('#CompAttr').node().value);//document.getElementById('CompAttr').value);
                            });
                    };
                    select("#level").on('change',()=>{
                        pubsub.publish("levelchange", select('#level').node().value,select('#scale').node().value);
                        });
                    select("#scale").on('change',()=>{
                        pubsub.publish("levelchange", select('#level').node().value,select('#scale').node().value);
                        });

                    select("#CompAttr").on('change',()=> {
                        if (cnode != undefined) {
                        pubsub.publish("infoselect", cnode.data, select('#CompAttr').node().value);//document.getElementById('CompAttr').value);
                        }
                    });

                    selectAll(".wb-button").on('click',()=>{
                        let option = pb.mycb();
                        // update tree plot
                        [pInter,sizeInter] = tree.setParameter(option);
                        // update persistence chart and size chart
                        //pb.updateBar(pInter,sizeInter);
                        // update plot level
                        //treelevel.plotLevel(tree);
                        // update data
                        //pubsub.publish("infoupdate", pInter,sizeInter);
                        slider.handle.attr("cx", x(pInter));
                    });

                    select('#searchP')
                        .on('click', () =>  {
                            //clear();
                            [cur_selection,cur_node,filterbox] = plots.highlight();
                            selectindex = new Set(cur_selection);//cur_selection.map(obj=>obj.index));
                            //if(selectindex!= undefined)
                            //    tree.searchchildren(selectindex, cur_node);
                            //else
                            //    console.log("No Points Selected");
                            plots.sychronize(cur_selection,cur_node,filterbox);

                        });

                    /*
                    select('#createPlot')
                        .on('click', () =>  {
                            let selectP = document.getElementById('selectP').value ;
                            [cur_selection,cur_node] = plots.highlight();

                            if(cur_selection!=undefined)
                            {selectplot.removedata();
                            selectplot.storedata(cur_selection);
                            selectplot.updatediv(selectP);
                            }

                        });

                    select("#selectP").on('change',()=>{selectplot.updatediv(document.getElementById('selectP').value)});//updateAttribute();});

                    */

                });
            });

        })

    });
}

function clear(){
    let myNode = document.getElementById("foo");
    while (myNode.firstChild) {
        myNode.removeChild(myNode.firstChild);
    }
}
