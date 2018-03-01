import './style.css';
import {event,select,selectAll} from 'd3-selection';
import {csv,json,scaleLinear,csvParse} from 'd3';
import {drag} from 'd3-drag';
//import { event as currentEvent } from 'd3-selection';

import {pBar} from '../Slider'
import {parseObj,Selected, SelectP} from '../Crystal';
import {Info} from '../Info';
import {Tree,TreeLevel} from '../Structure';
import {Slider} from '../Slider';
import * as pubsub from '../PubSub';
//import {Partition} from '../Process';
import {rangefilter} from "../Slider/rangefilter";


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
let level;
let scale;
let band;
let measure;

let filterdata;
let dataarray;


// select('#catalog')
// .on('click', () =>  {load("waste_Pu")});

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
            // Should have all attrs for Info
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
                    let rfilter = new rangefilter(dataarray);

                    // Will be changed later such that i did not depend on the DOM
                    let yattr = document.getElementById('y_attr').value;
                    let plottype = document.getElementById('plottype').value;

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

                    // Tree
                    tree = new Tree(treedata, data, basedata);
                    treelevel = new TreeLevel();
                    tree.updateTree(pInter, sizeInter);
                    treelevel.plotLevel(tree);

                    pubsub.publish("infoupdate", loaddata, pInter, sizeInter);

                    let plots = new Selected(rawdata, width, height, yattr, plottype,check,band,dataarray);

                    // Slider Event

                    // Filterindex will get updated later during interaction

                    // Range will result from user later.

                    // Everytime this gets updated, tree should get updated, plot should get updated

                    let newslider = new Slider(select("#treeslider"));
                    let slider = newslider.createslider([parr[0], parr[parr.length-1]],150);
                    let x = scaleLinear()
                        .domain([parr[0], parr[parr.length-1]])
                        .range([0, 150])//size of slider and range of output, put persistence here
                        .clamp(true);
                    slider.handle.attr("cx", x(pInter));

                    slider.curslide.call(drag()
                            .on("start drag", function () {
                                //console.log("BBB");
                                //slider.handle.attr("cx", x(pInter)); //initial position for the slider
                                slider.handle.attr("cx", x(x.invert(event.x)));
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
                    let pb = new pBar(tree,data,basedata);
                    pb.updateBar(pInter,sizeInter);
                    select(".ppbar").call(drag()
                        .on("start drag", ()=>{
                            select(".ppbar").attr("x", pb.padding-2+pb.xScale(pb.xScale.invert(event.x-pb.padding+2)));
                            pInter = pb.xScale.invert(event.x)-Number.EPSILON;
                            pubsub.publish("infoupdate", loaddata, pInter, sizeInter);

                            [pInter,sizeInter] = tree.setParameter("slide", [pInter, sizeInter]);
                            slider.handle.attr("cx", x(pInter));
                            treelevel.plotLevel(tree);

                        }));

                        select(".pbar").call(drag()
                            .on("start drag", ()=>{
                            select(".pbar").attr("x", pb.padding-2+pb.xScale2(pb.xScale2.invert(event.x-pb.padding+2)));
                            sizeInter = parseInt(pb.xScale2.invert(event.x-pb.padding+2));
                            pubsub.publish("infoupdate", loaddata, pInter, sizeInter);
                            [pInter,sizeInter] = tree.setParameter("slide", [pInter, sizeInter]);
                            treelevel.plotLevel(tree);
                        }));

                    let clicks = 0;
                    let DELAY = 500;

                    //Separate clicking from double clicking
                    document.getElementById("tree").onmouseover = function(event) {

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

                                        pubsub.publish("infoselect", loaddata, cnode.data, document.getElementById('CompAttr').value);
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
                                pubsub.publish("infoselect", loaddata, nodeinfo.data, document.getElementById('CompAttr').value);
                                if (cnode===undefined)
                                {cnode = nodeinfo;
                                    //console.log(nodeinfo);
                                }
                            })
                            .on("mouseout", (nodeinfo)=>{
                                if (cnode===undefined)
                                {cnode = nodeinfo;
                                }
                                pubsub.publish("infoselect", loaddata, cnode.data, document.getElementById('CompAttr').value);

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
                        pubsub.publish("infoselect", loaddata, cnode.data, document.getElementById('CompAttr').value);
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
                        let min = parseFloat(document.getElementById("mymin").value);
                        let max = parseFloat(document.getElementById("mymax").value);
                        let range = [min,max];
                            // Use attr specified by plot for now, will have its own attr later;
                            // Return set of index that will be used during update model to update _total, _size
                        let [filterindex,crange] = rfilter.updaterange(filterattr, range, rawdata);
                            tree.updatefilter(filterindex);
                            tree.layout();
                            tree.render();
                        plots.updatediv(crange);
                        //}
                    });

                    select("#RemoveRange").on('click',()=>{
                        let filterattr = document.getElementById('RangeAttr').value;
                        let filterindex = rfilter.removefilter(filterattr,rawdata);
                            tree.updatefilter(filterindex);
                            tree.layout();
                            tree.render();
                        plots.updatediv();
                    });

                    /*
                    select('#BrushSelect')
                        .on('click', () =>  {

                            console.log(cur_selection)


                        });
                    */
                    select('#searchC')
                        .on('click', () =>  {
                            //clear();
                            [cur_selection,cur_node] = plots.highlight();

                            selectindex = new Set(cur_selection.map(obj=>obj.index));
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
                            plots._reg = !plots._reg;

                            // Will use this for now
                            pubsub.publish("plotupdateattr", plots,document.getElementById('y_attr').value);
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
                    select("#plus").on('click',()=>{
                        plots.increase();
                    })

                    select("#minus").on('click',()=>{

                        plots.decrease();
                    })
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
