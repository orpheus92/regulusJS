
import './style.css';
import * as d3 from 'd3';

import {Crystal} from '../Crystal';
import {Info} from '../Info';
import {Tree} from '../Structure';
import {Slider} from '../Slider';

//import {loader,setValue} from '../loader';

import {Partition} from '../Process';

//import simple from '../../data/test.csv';
//import simple2 from '../../data/test.csv';
//import {Plots} from './Plot';
//import {Crystal} from './Crystal.js';
//import * as d3 from 'd3';
//read data;
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
        tree = new Tree();
        loaddata = new Info();
        let[maxp,minp] = loaddata.create(data,rawdata,pInter,sizeInter);
        partition = new Partition();
        partition.initialPartition(data);

        d3.csv('../data/Tree_Merge.csv', function (error, treedata){
            d3.json('../data/Base_Partition.json', function (error, basedata) {
                //console.log(rawdata);
                treenode = tree.create(treedata, partition.pers, basedata,pInter,sizeInter,partition);
                tree.updateTree(pInter,sizeInter);

                //Slider Event
                let x = d3.scaleLinear()
                    .domain([minp, maxp])
                    .range([0, 150])//size of slider and range of output, put persistence here
                    .clamp(true);
                let newslider= new Slider(d3.select("#treesvg"));
                let slider = newslider.createslider([minp, maxp]);

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
                        pInter = tree.increasePersistence(pInter);
                        slider.handle.attr("cx", x(pInter));
                        loaddata.update(pInter,sizeInter);
                    });
                d3.select('#decrease')
                    .on('click', () =>  {
                        pInter = tree.decreasePersistence(pInter);
                        slider.handle.attr("cx", x( pInter));
                        loaddata.update(pInter,sizeInter);
                    });
                d3.select('#increaseS')
                    .on('click', () =>  {
                        sizeInter = tree.increaseSize();
                        loaddata.update(pInter,sizeInter);
                    });
                d3.select('#decreaseS')
                    .on('click', () =>  {
                        sizeInter = tree.decreaseSize();
                        loaddata.update(pInter,sizeInter);
                    });

                let clicks = 0;
                let DELAY = 500;
                //Separate clicking from double clicking
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



            });
        });

    })

});


function updateDataInfo(){}
