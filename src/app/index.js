import './style.css';
import * as d3 from 'd3';
import {event as currentEvent} from 'd3-selection';
//import {event as currentEvent} from 'd3-selection';
//import {drag} from 'd3-drag';
//import * as d3Tip from 'd3-tip';
//console.log(d3.dispatch);
//import {drag} from 'd3-drag'
//console.log(d3drag);
//import {event as currentEvent} from 'd3-selection';
import {pBar} from '../Slider'
import {Crystal} from '../Crystal';
import {Selected, SelectP} from '../Crystal';
import {Info} from '../Info';
import {Tree,TreeLevel} from '../Structure';
import {Slider} from '../Slider';
//import {updateAttribute} from "../Crystal";
//import {printPlots} from "../Crystal";
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
let filterdata;
let selectindex;
let cur_node;
let cur_selection;

    d3.select('#LoadFile')
    .on('click', () =>  {
        //clear();
        load();
    });

function load(){
    d3.csv('../data/Pu_TOT.csv', rawdata=> {

        for (let i = 0; i< rawdata.columns.length; i++)
        {
            d3.selectAll("#y_attr")
                .append("option")
                .attr("value", rawdata.columns[i])
                .text(rawdata.columns[i]);
            d3.selectAll("#RangeAttr")
                .append("option")
                .attr("value", rawdata.columns[i])
                .text(rawdata.columns[i]);
            d3.selectAll("#CompAttr")
                .append("option")
                .attr("value", rawdata.columns[i])
                .text(rawdata.columns[i]);
        }
        d3.json('../data/P_Partition.json', function (error, data) {
            if (error) throw error;
            //will be updated later

            d3.csv('../data/Final_Tree.csv', function (error, treedata){
                d3.json('../data/Base_Partition.json', function (error, basedata) {
                    //console.log(rawdata);
                    let yattr = document.getElementById('y_attr').value;
                    let plottype = document.getElementById('plottype').value;
                    // Plot View Constructor
                    // Plot SIZE
                    let width = 300;
                    let height = 100;
                    pInter = 0.2;
                    sizeInter = 25;
                    let plots = new Selected(rawdata, width, height, yattr, plottype);
                    // Load data in JS

                    let selectplot = new SelectP(rawdata, width, height);


                    // Data View Constructor
                    loaddata = new Info();
                    let[maxp,minp] = loaddata.create(data,rawdata,pInter,sizeInter);

                    // Partition
                    partition = new Partition();
                    partition.initialPartition(data);

                    // Tree
                    tree = new Tree(treedata,partition,basedata);
                    treelevel = new TreeLevel();
                    tree.updateTree(pInter,sizeInter);
                    treelevel.plotLevel(tree);
                    //slider.handle.attr("cx", x(pInter));
                    loaddata.update(pInter,sizeInter);
                    //Slider Event

                    // Filterindex will get updated later during interaction

                    // Range will result from user later.

                    // Everytime this gets updated, tree should get updated, plot should get updated


                    //let newslider= new Slider(d3.select("#treesvg"));
                    //let slider = newslider.createslider([minp, maxp]);
                    /*
                    slider.curslide.call(d3.drag()//d3.drag()
                        //.on("start.interrupt", function() {
                        //    console.log("AAA");
                        //    slider.interrupt(); })
                        .on("start drag", function() {console.log("BBB");
                            slider.handle.attr("cx", x(x.invert(d3.event.x))); //initial position for the slider
                            pInter = x.invert(d3.event.x);
                            loaddata.update(pInter,sizeInter);
                            tree.updateTree(pInter,sizeInter);
                        }));
                    */
                    let pb = new pBar(tree,data,basedata);
                    pb.updateBar(pInter,sizeInter);

                    let clicks = 0;
                    let DELAY = 500;

                    //Separate clicking from double clicking



                    document.getElementById("tree").onmouseover = function(event) {
                        //console.log("sasasaas");
                        let totalnode = [];
                        d3.selectAll(".node")
                            .on("click", (nodeinfo)=>{
                                //console.log("node",nodeinfo);
                                if (d3.event.ctrlKey)
                                {
                                    plots.storedata(nodeinfo);
                                    totalnode.push(nodeinfo);
                                }
                                else
                                {d3.selectAll(".Clicked").classed("Clicked",false);
                                    plots.removedata();
                                    plots.storedata(nodeinfo);
                                }
                                console.log(nodeinfo);

                                let timer;
                                clicks++;  //count clicks

                                if(clicks === 1) {

                                    timer = setTimeout(function() {
                                        let clicked = plots.getdata();
                                        tree.mark(clicked);
                                        plots.updatediv();
                                        cnode = nodeinfo;
                                        loaddata.select(cnode,document.getElementById('CompAttr').value );
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
                            .on("mouseover", (nodeinfo)=>{loaddata.select(nodeinfo,document.getElementById('CompAttr').value);})
                            .on("mouseout", ()=>{loaddata.select(cnode,document.getElementById('CompAttr').value);
                            });

                    };

                    d3.select("#level").on('change',()=>{
                        let level = document.getElementById('level').value;
                        treelevel.Level = level;
                        treelevel.switchLevel();

                        tree.Level = level;
                        tree.layout();
                        tree.render();});

                    d3.select("#scale").on('change',()=>{
                        let scale = document.getElementById('scale').value;
                        treelevel.Scale = scale;
                        treelevel.switchLevel();

                        tree.Scale = scale;
                        tree.layout();
                        tree.render();});

                    d3.select("#plottype").on('change',()=>{plots.updateplot(document.getElementById('plottype').value)});//printPlots();});

                    d3.select("#y_attr").on('change',()=>{plots.updateattr(document.getElementById('y_attr').value)});//updateAttribute();});

                    d3.select("#CompAttr").on('change',()=>{if(cnode!=undefined)
                        loaddata.select(cnode,document.getElementById('CompAttr').value );
                    });


                    d3.selectAll(".wb-button").on('click',()=>{
                        let option = pb.mycb();
                        // update tree plot
                        [pInter,sizeInter] = tree.setParameter(option);
                        // update persistence chart and size chart
                        pb.updateBar(pInter,sizeInter);
                        // update plot level
                        treelevel.plotLevel(tree);
                        // update data
                        loaddata.update(pInter,sizeInter);});

                    d3.select("#SetRange").on('click',()=>{

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

                    d3.select("#RemoveRange").on('click',()=>{
                        console.log(plots);
                            let filterindex = tree._root.data._totalinit;
                            tree.updatefilter(filterindex);
                            tree.layout();
                            tree.render();

                    });


                    d3.select('#BrushSelect')
                        .on('click', () =>  {
                            [cur_selection,cur_node] = plots.highlight();

                            selectindex = new Set(cur_selection.map(obj=>obj.index));
                            console.log(cur_selection)


                        });

                    d3.select('#searchC')
                        .on('click', () =>  {
                            //clear();
                            if(selectindex!= undefined)
                            tree.searchchildren(selectindex, cur_node);
                            else
                            console.log("No Points Selected");
                        });

                    d3.select('#removeS')
                        .on('click', () =>  {
                            d3.selectAll("#selected").attr("id", null);

                        });

                    d3.select('#createPlot')
                        .on('click', () =>  {
                            let selectP = document.getElementById('selectP').value ;

                            if(cur_selection!=undefined)
                            {                                  selectplot.removedata();
                            selectplot.storedata(cur_selection);
                            selectplot.updatediv(selectP);
                            }
                        });

                    d3.select("#selectP").on('change',()=>{selectplot.updatediv(document.getElementById('selectP').value)});//updateAttribute();});

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
function updateDataInfo(){}
*/