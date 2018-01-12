
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

import {Crystal} from '../Crystal';
import {Info} from '../Info';
import {Tree,TreeLevel} from '../Structure';
import {Slider} from '../Slider';
import {updateAttribute} from "../Crystal";
import {printPlots} from "../Crystal";
import {Partition} from '../Process';

//let updateAttribute = updateAttribute();
//import {loader,setValue} from '../loader';

let pInter;
let sizeInter;
let tree;
let partition;
let loaddata;
let cnode;
let treelevel;
d3.select('#LoadFile')
    .on('click', () =>  {
        load();
    });

function load(){
    d3.csv('../data/Pu_TOT.csv', rawdata=> {
    //console.log("Raw data loaded");
    //if (error) throw error;
    //console.log(rawdata);
    for (let i = 0; i< rawdata.columns.length; i++)
    {
        d3.selectAll("#y_attr")
            .append("option")
            .attr("value", rawdata.columns[i])
            .text(rawdata.columns[i]);
    }

    let plots = new Crystal(rawdata, 600, 200);
    //window.plots = plots;
    //Load data in JS
    pInter = 0.2;
    sizeInter = 20;
    d3.json('../data/P_Partition.json', function (error, data) {
        if (error) throw error;
        //will be updated later

        loaddata = new Info();
        let[maxp,minp] = loaddata.create(data,rawdata,pInter,sizeInter);
        partition = new Partition();
        partition.initialPartition(data);

        d3.csv('../data/Final_Tree.csv', function (error, treedata){
            d3.json('../data/Base_Partition.json', function (error, basedata) {
                //console.log(rawdata);
                tree = new Tree(treedata,partition,basedata);
                treelevel = new TreeLevel();
                //tree.create(pInter,sizeInter);
                tree.updateTree(pInter,sizeInter);
                treelevel.plotLevel(tree);
                //pInter = tree.setPersistence("increase");
                //slider.handle.attr("cx", x(pInter));
                loaddata.update(pInter,sizeInter);
                //console.log(tree);
                //Slider Event
                let x = d3.scaleLinear()
                    .domain([minp, maxp])
                    .range([0, 150])//size of slider and range of output, put persistence here
                    .clamp(true);
                let newslider= new Slider(d3.select("#treesvg"));
                let slider = newslider.createslider([minp, maxp]);
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

                d3.select('#increase')
                    .on('click', () => {
                        pInter = tree.setPersistence("increase");
                        treelevel.plotLevel(tree);
                        slider.handle.attr("cx", x(pInter));
                        loaddata.update(pInter,sizeInter);
                    });
                d3.select('#decrease')
                    .on('click', () =>  {
                        pInter = tree.setPersistence("decrease");
                        treelevel.plotLevel(tree);
                        slider.handle.attr("cx", x( pInter));
                        loaddata.update(pInter,sizeInter);
                    });
                d3.select('#increaseS')
                    .on('click', () =>  {
                        sizeInter = tree.setSize("increase");
                        loaddata.update(pInter,sizeInter);
                    });
                d3.select('#decreaseS')
                    .on('click', () =>  {
                        sizeInter = tree.setSize("decrease");
                        loaddata.update(pInter,sizeInter);
                    });

                let clicks = 0;
                let DELAY = 500;
                //Separate clicking from double clicking

                document.getElementById("tree").onmouseover = function(event) {
                    //console.log(event);
                    d3.selectAll(".node.viz").on("click", (nodeinfo)=>{
                        //console.log(nodeinfo);
                    let timer;
                    clicks++;  //count clicks

                    if(clicks === 1) {

                        timer = setTimeout(function() {
                            //window.plots.update(nodeinfo);
                            plots.update(nodeinfo);
                            //console.log(nodeinfo);
                            cnode = nodeinfo;
                            loaddata.select(cnode);
                            clicks = 0;             //after action performed, reset counter

                        }, DELAY);

                    } else {

                        clearTimeout(timer);    //prevent Process-click action
                        tree.reshapeTree(nodeinfo);
                        treelevel.plotLevel(tree);

                        clicks = 0;             //after action performed, reset counter
                    }

                }).on("mouseover", (nodeinfo)=>{loaddata.select(nodeinfo);
                                                //console.log(nodeinfo);
                    }).on("mouseout", ()=>{loaddata.select(cnode);
                    });

                };
                d3.select("#level").on('change',()=>{treelevel.switchLevel();});

                d3.select("#dataset").on('change',()=>{plots.printPlots();});
                //document.getElementById("dataset").addEventListener("change", printPlots);
                //document.getElementById("y_attr").addEventListener("change", updateAttribute);
                d3.select("#y_attr").on('change',()=>{plots.updateAttribute();});
            });
        });

    })

});
}

/*
function updateDataInfo(){}
*/