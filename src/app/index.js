import './style.css';
//import * as kernel from 'kernel-smooth'
import {event,select,selectAll} from 'd3-selection';
import {csv,json,scaleLinear,csvParse} from 'd3';
//import {event as currentEvent} from 'd3';
import {drag} from 'd3-drag';
import { event as currentEvent } from 'd3-selection';
//d3.getEvent = () => require("d3-selection").event;

import {pBar} from '../Slider'
import {parseObj,Selected, SelectP} from '../Crystal';
import {Info} from '../Info';
import {Tree,TreeLevel} from '../Structure';
import {Slider} from '../Slider';
import * as pubsub from '../PubSub';
import {Partition} from '../Process';
import {rangefilter} from "../Slider/rangefilter";
//let updateAttribute = updateAttribute();
//import {loader,setValue} from '../loader';

let pInter;
let sizeInter;
let tree;
let partition;
let loaddata;
let cnode;
let treelevel;
let check = false;
//let filterdata;
let selectindex;
let cur_node;
let cur_selection;
let level;
let scale;
let band;
    select('#LoadFile')
    .on('click', () =>  {
        //clear();
        load();
        //console.log("dasasd")
    });

function load(){
    csv('data/data.csv', rawdata=> {
        //let a= csvParse('../data/Pu_TOT.csv');
        //console.log(a)
        //console.log(rawdata)
        let[outx,outy]=parseObj(rawdata);
        //console.log(outx,outy);

        for (let i = rawdata.columns.length-1; i>= 0; i--)
        {
            // Should have only output measures
            selectAll("#y_attr")
                .append("option")
                .attr("value", rawdata.columns[i])
                .text(rawdata.columns[i]);
            // Should have all attrs for range filter
            selectAll("#RangeAttr")
                .append("option")
                .attr("value", rawdata.columns[i])
                .text(rawdata.columns[i]);
            // Should have all attrs for Info
            selectAll("#CompAttr")
                .append("option")
                .attr("value", rawdata.columns[i])
                .text(rawdata.columns[i]);
        }
        json('../data/P_Partition.json', function (error, data) {
            if (error) throw error;
            //will be updated later

            csv('../data/Final_Tree.csv', function (error, treedata){
                json('../data/Base_Partition.json', function (error, basedata) {

                    //let func = kernel.multipleRegression(outx, outy, kernel.fun.gaussian, 0.5);

                    let yattr = document.getElementById('y_attr').value;
                    let plottype = document.getElementById('plottype').value;
                    // Plot View Constructor
                    // Plot SIZE
                    let width = 300;
                    let height = 100;
                    pInter = 0.2;
                    sizeInter = 25;
                    band = 0.1;
                    let plots = new Selected(rawdata, width, height, yattr, plottype,check,band);
                    // Load data in JS

                    let selectplot = new SelectP(rawdata, width, height);

                    // Data View Constructor
                    loaddata = new Info();
                    let [maxp, minp] = loaddata.create(data, rawdata, pInter, sizeInter);

                    // Partition
                    partition = new Partition();
                    partition.initialPartition(data);

                    // Tree
                    tree = new Tree(treedata, partition, basedata);
                    treelevel = new TreeLevel();
                    tree.updateTree(pInter, sizeInter);
                    treelevel.plotLevel(tree);

                    pubsub.publish("infoupdate", loaddata, pInter, sizeInter);
                    //Slider Event

                    // Filterindex will get updated later during interaction

                    // Range will result from user later.

                    // Everytime this gets updated, tree should get updated, plot should get updated


                    let newslider = new Slider(select("#treeslider"));
                    let slider = newslider.createslider([minp, maxp],150);
                    //let kslider = new Slider(select("#kernelslider"));
                    //let slider2 = kslider.createslider([0.0001, 1],150);



                    let x = scaleLinear()
                        .domain([minp, maxp])
                        .range([0, 150])//size of slider and range of output, put persistence here
                        .clamp(true);


                    slider.curslide.call(drag()
                            .on("start drag", function () {
                                //console.log("BBB");
                                slider.handle.attr("cx", x(pInter)); //initial position for the slider
                                pInter = x.invert(event.x);
                                //loaddata.update(pInter, sizeInter);
                                pubsub.publish("infoupdate", loaddata, pInter, sizeInter);
                                //console.log()
                                //tree.updateTree(pInter, sizeInter);
                                [pInter,sizeInter] = tree.setParameter("slide", [pInter, sizeInter]);
                                // update persistence chart and size chart
                                pb.updateBar(pInter,sizeInter);
                                // update plot level
                                treelevel.plotLevel(tree);
                            })
                    );
                    let kval = 0.1;
                    /*
                    slider2.curslide.call(drag()
                        .on("start drag", function () {

                            slider2.handle.attr("cx", x(kval)); //initial position for the slider
                            kval = x.invert(event.x);
                            plots._bandwidth = kval;
                            pubsub.publish("plotupdateattr", plots,document.getElementById('y_attr').value);


                        })
                    );
                    */
                    let pb = new pBar(tree,data,basedata);
                    pb.updateBar(pInter,sizeInter);

                    let clicks = 0;
                    let DELAY = 500;

                    //Separate clicking from double clicking



                    document.getElementById("tree").onmouseover = function(event) {
                        //let totalnode = [];
                        selectAll(".node")
                            .on("click", (nodeinfo)=>{
                                //console.log("node",nodeinfo);
                                if (event.altKey)
                                {
                                    plots.storedata(nodeinfo);
                                }
                                else
                                {selectAll(".Clicked").classed("Clicked",false);
                                    plots.removedata();
                                    plots.storedata(nodeinfo);
                                }
                                //console.log(nodeinfo);

                                let timer;
                                clicks++;  //count clicks

                                if(clicks === 1) {

                                    timer = setTimeout(function() {
                                        let clicked = plots.getdata();
                                        //console.log(clicked);
                                        tree.mark(clicked);
                                        plots.updatediv();
                                        cnode = nodeinfo;
                                        //loaddata.select(cnode,document.getElementById('CompAttr').value );
                                        pubsub.publish("infoselect", loaddata, cnode, document.getElementById('CompAttr').value);
                                        clicks = 0;             //after action performed, reset counter

                                    }, DELAY);

                                }
                                else
                                {
                                    clearTimeout(timer);    //prevent Process-click action
                                    tree.reshapeTree(nodeinfo);
                                    treelevel.plotLevel(tree);

                                    clicks = 0;             //after action performed, reset counter
                                }

                            })
                            .on("mouseover", (nodeinfo)=>{
                                //loaddata.select(nodeinfo,document.getElementById('CompAttr').value);
                                pubsub.publish("infoselect", loaddata, nodeinfo, document.getElementById('CompAttr').value);

                            })
                            .on("mouseout", ()=>{
                                //loaddata.select(cnode,document.getElementById('CompAttr').value);
                                pubsub.publish("infoselect", loaddata, cnode, document.getElementById('CompAttr').value);

                            });

                    };

                    select("#level").on('change',()=>{
                        level = document.getElementById('level').value;
                        scale = document.getElementById('scale').value;

                        pubsub.publish("levelchange1", treelevel,level,scale);
                        pubsub.publish("levelchange2", tree,level,scale);
                        });

                    select("#scale").on('change',()=>{
                        level = document.getElementById('level').value;
                        scale = document.getElementById('scale').value;

                        pubsub.publish("levelchange1", treelevel,level,scale);
                        pubsub.publish("levelchange2", tree,level,scale);
                        });

                    select("#plottype").on('change',()=>{
                        pubsub.publish("plottypechange", plots,document.getElementById('plottype').value);
                    });

                    select("#y_attr").on('change',()=>{
                        pubsub.publish("plotupdateattr", plots,document.getElementById('y_attr').value);
                    });

                    select("#CompAttr").on('change',()=> {
                        if (cnode != undefined) {
                        pubsub.publish("infoselect", loaddata, cnode, document.getElementById('CompAttr').value);
                        }
                    });


                    selectAll(".wb-button").on('click',()=>{
                        let option = pb.mycb();
                        //console.log(option);
                        // update tree plot
                        [pInter,sizeInter] = tree.setParameter(option);
                        // update persistence chart and size chart
                        pb.updateBar(pInter,sizeInter);
                        // update plot level
                        treelevel.plotLevel(tree);
                        // update data
                        pubsub.publish("infoupdate", loaddata, pInter,sizeInter);
                        slider.handle.attr("cx", x(pInter));
                    });

                    select("#SetRange").on('click',()=>{

                        //console.log('Clicked event');
                        let filterattr = document.getElementById('RangeAttr').value;
                        let min = document.getElementById("mymin").value;
                        let max = document.getElementById("mymax").value;
                        //console.log(filterattr, min, max)
                        if (filterattr!=undefined&&min!=undefined&&max!=undefined&&min < max) {
                            //console.log("Filter Set")
                            let range = [min,max];//[1,35];
                                // Use attr specified by plot for now, will have its own attr later;
                            let rfilter = new rangefilter();
                            // Return set of index that will be used during update model to update _total, _size
                            let filterindex = rfilter.updaterange(filterattr, range, rawdata);
                            tree.updatefilter(filterindex);
                            tree.layout();
                            tree.render();
                        }


                    });

                    select("#RemoveRange").on('click',()=>{
                        console.log(plots);
                            let filterindex = tree._root.data._totalinit;
                            tree.updatefilter(filterindex);
                            tree.layout();
                            tree.render();

                    });


                    select('#BrushSelect')
                        .on('click', () =>  {
                            [cur_selection,cur_node] = plots.highlight();

                            selectindex = new Set(cur_selection.map(obj=>obj.index));
                            console.log(cur_selection)


                        });

                    select('#searchC')
                        .on('click', () =>  {
                            //clear();
                            if(selectindex!= undefined)
                            tree.searchchildren(selectindex, cur_node);
                            else
                            console.log("No Points Selected");
                        });

                    select('#removeS')
                        .on('click', () =>  {
                            selectAll("#selected").attr("id", null);

                        });

                    select('#myCheck')
                        .on('click', () =>  {
                            //selectAll("#selected").attr("id", null);
                            plots._reg = !plots._reg;

                            // Will use this for now
                            pubsub.publish("plotupdateattr", plots,document.getElementById('y_attr').value);
                        });

                    select('#createPlot')
                        .on('click', () =>  {
                            let selectP = document.getElementById('selectP').value ;

                            if(cur_selection!=undefined)
                            {                                  selectplot.removedata();
                            selectplot.storedata(cur_selection);
                            selectplot.updatediv(selectP);
                            }
                        });

                    select("#selectP").on('change',()=>{selectplot.updatediv(document.getElementById('selectP').value)});//updateAttribute();});

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

/*
function parseObj(data,option){
    let outx = [];
    let outy = [];
    // This should take in object array, return 2d array x and 1d array y
    for (let i = 0;i<data.length;i++)
    {
        let curx = Object.values(data[i]).map(Number);
        let cury = curx.pop();
        //console.log(curx,cury);
        outx.push(curx);
        outy.push(cury);
    }

    return[outx,outy];

}
*/