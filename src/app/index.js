
import './style.css';
import * as d3 from 'd3';
//import {drag} from 'd3-'
import {Crystal} from '../Crystal';
import {Info} from '../Info';
import {Tree} from '../Structure';
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
let treenode;
d3.csv('../data/Pu_TOT.csv', rawdata=> {

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
    window.plots = plots;
    //Load data in JS
    pInter = 2;
    sizeInter = 20;
    d3.json('../data/Tree_Data.json', function (error, data) {
        if (error) throw error;
        //will be updated later

        loaddata = new Info();
        let[maxp,minp] = loaddata.create(data,rawdata,pInter,sizeInter);
        partition = new Partition();
        partition.initialPartition(data);

        d3.csv('../data/Tree_Merge.csv', function (error, treedata){
            d3.json('../data/Base_Partition.json', function (error, basedata) {
                //console.log(rawdata);
                tree = new Tree(treedata,partition,basedata);
                //tree.create(pInter,sizeInter);
                tree.updateTree(pInter,sizeInter);
                console.log(tree);
                //Slider Event
                let x = d3.scaleLinear()
                    .domain([minp, maxp])
                    .range([0, 150])//size of slider and range of output, put persistence here
                    .clamp(true);
                let newslider= new Slider(d3.select("#treesvg"));
                let slider = newslider.createslider([minp, maxp]);
                console.log(slider);
                slider.curslide.call(d3.drag()
                    .on("start.interrupt", function() { slider.interrupt(); })
                    .on("start drag", function() {
                        slider.handle.attr("cx", x(x.invert(d3.event.x))); //initial position for the slider

                        pInter = x.invert(d3.event.x);

                        loaddata.update(pInter,sizeInter);
                        tree.updateTree(pInter,sizeInter);

                    }));

                d3.select('#increase')
                    .on('click', () => {
                        pInter = tree.setPersistence("increase");
                        slider.handle.attr("cx", x(pInter));
                        loaddata.update(pInter,sizeInter);
                    });
                d3.select('#decrease')
                    .on('click', () =>  {
                        pInter = tree.setPersistence("decrease");
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
                /*
                treenode.on("click", (nodeinfo)=>{
                    let timer;
                    clicks++;  //count clicks

                    if(clicks === 1) {

                        timer = setTimeout(function() {
                            window.plots.update(nodeinfo);
                            loaddata.select(nodeinfo);
                            clicks = 0;             //after action performed, reset counter

                        }, DELAY);

                    } else {

                        clearTimeout(timer);    //prevent Process-click action
                        tree.reshape(nodeinfo);
                        clicks = 0;             //after action performed, reset counter
                    }

                });
                */
                d3.select("#dataset").on('change',printPlots);
                //document.getElementById("dataset").addEventListener("change", printPlots);
                //document.getElementById("y_attr").addEventListener("change", updateAttribute);
                d3.select("#y_attr").on('change',updateAttribute);
            });
        });

    })

});


function updateDataInfo(){}
