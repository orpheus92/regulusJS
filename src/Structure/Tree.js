import * as d3 from 'd3';
//import { select, selection } from 'd3';
//import * as aaaa from 'd3-transition';
//let transition = d3.transition();
//console.log(transition.sel);
import * as d3Tip from 'd3-tip';

import './style.css';

export class Tree{
    /**
     * Creates a Tree Object
     */
    constructor(treeCSV,partition,basedata) {
        this._maxsize = 0;

        let totalpers = [];
        partition.pers.map(function(item) {
            totalpers.push(parseFloat(item));
        });
        this.pers = totalpers;
        treeCSV.forEach(d=> {

            d.id = d.C1+ ", "+d.C2+", "+d.Ci;
            d.index = d.C1+ ", "+d.C2;
            d.par = d.P1+ ", "+d.P2+", "+d.Pi;
            d._persistence = this.pers[d.Ci];

        });
        //Children relations
        this._root = d3.stratify()
            .id(d => d.id)
            .parentId(d => d.par === ", , 0" ? '' : d.par)
            (treeCSV);
        let accum;
        this._root.descendants().forEach(d=>{
            accum = [];
            accum = getbaselevelInd(d, accum);
            //d.data.children = d.children;
            //d.data.parent = d.parent;

            d.data._baselevel = new Set(accum);
            d.data._total = new Set();
            d.data._baselevel.forEach(dd=> {
                if (basedata[dd] != null) {
                    basedata[dd].forEach(ddd=>{

                        if (!d.data._total.has(ddd))
                            d.data._total.add(ddd);
                    })
                }
            });
            d.data._size = d.data._total.size;
            this._maxsize = (this._maxsize>d.data._size)?this._maxsize :d.data._size;

        });
        this._initsize = this._root.descendants().length;
        this._alldata = treeCSV;
        this._treefunc = d3.tree()
            .size([670,330]);
        this._color = d3.scaleSqrt().domain([1,this._maxsize])
            //.interpolate(d3.interpolateHcl)
            .range(["blue", 'red']);
        //console.log(this);
    }

    /**
     * Creates a node/edge structure and renders a tree layout based on the input data
     *
     * @param treeData an array of objects that contain parent/child information.
     */



    updateTree(ppp,sss) {
        this.pInter = ppp;
        this.sizeInter = sss;
        this.updatemodel();
        this.layout();
        this.render();
    };
    updatemodel(){
        newupdate(this._root, this.pInter,this.sizeInter);
        this._circlesize = this._root.descendants().length;
    };
    layout(){
        /*
        this._root.descendants().forEach(function(d){
            if(d.x!=null)
            {d.oldx = d.x;
            d.oldy = d.y;
            }
        }

        )*/
        //console.log(this._root.children);
        this._treefunc(this._root);
        //console.log(this._root);
    };
    render(){
        let g = d3.select("#tree").attr("transform", "translate(15,40)");

        if(d3.select('#treetip')!=undefined)
            d3.selectAll('#treetip').remove();

        let t = d3.transition()
            .duration(300);
        //Update Link

        let curlink = g.selectAll(".link");

        this._link = curlink.data(this._root.descendants().slice(1))
            .enter().insert("path")
            .attr("class", "link")
            .merge(curlink);;

        d3.selectAll('.link').data(this._root.descendants().slice(1)).exit().remove();

        t.selectAll('.link')
            .attr("d", d=>{
                return "M" + d.x + "," + d.y

                    +"L" + d.parent.x + "," + d.parent.y;
            });

        // Update Node
        let curnode = g.selectAll(".node");

        this._node = curnode.data(this._root.descendants())
            .enter().append("circle")

            .attr("r",100/Math.sqrt(this._circlesize))
            .attr("class", 'node')
            .attr("transform", function (d) {//console.log(d)
                if (d.parent != null)
                    if(d.parent.oldx!=null)
                    return "translate(" + d.parent.oldx + "," + d.parent.oldy + ")";
                //else
                    //return "translate(" + d.x + "," + d.y + ")"
            })
            .merge(curnode);

        //console.log(this._node);


            //.ease(easeLinear);
        //let t2 = d3.transition()
            //.delay(500);
        d3.selectAll('.node').data(this._root.descendants()).exit().remove();
        /*
        d3.selectAll('#newnode').attr("transform", function (d) {//console.log(d)
            if (d.parent != null)
                return "translate(" + d.parent.x + "," + d.parent.y + ")";
            else
                return "translate(" + d.x + "," + d.y + ")"
        });
        */
        t.selectAll('.node')
            .attr("r",100/Math.sqrt(this._circlesize))
            .attr('fill',  (d)=> {//console.log(d);
                //console.log(this);
                if(d.data._size>=this.sizeInter&&d.data._persistence>=this.pInter)
                    return this._color(d.data._size);
                else
                    return  "white"
            })
            .attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")";
            });


        //console.log(this._node);

        let tip = d3Tip().attr('class', 'd3-tip').attr('id','treetip')
            .direction('se')
            .offset(function() {
                return [0,0];
            })
            .html((d)=>{
                let tooltip_data = d.data;

                return this.tooltip_render(tooltip_data);

                return ;
            });
        this._node.call(tip);
        this._node.on('mouseover', tip.show)
            .on('mouseout', tip.hide);
    };

    tooltip_render(tooltip_data) {


        let text =  "<li>"+"Partition Extrema: " + tooltip_data.index;
        text += "<li>";
        text +=  "Partition Persistence: " + tooltip_data._persistence;
        text += "<li>";
        text +=  "Number of Points: " + tooltip_data._total.size;

        return text;
    }

    /**
     * Updates the highlighting in the tree based on the selected team.
     * Highlights the appropriate team nodes and labels.
     *
     * @param row a string specifying which team was selected in the table.
     */


    /**
     * Removes all highlighting from the tree.
     */
    clearTree() {
        // ******* TODO: PART VII *******

        // You only need two lines of code for this! No loops!
        this._node.classed(".node", true);
        this._link.classed(".link", true);
        //d3.selectAll(".node").selectAll("text").classed("selectedLabel",false);

    }
    setPersistence(option){
        if(option === "increase"){
            for (let i=this.pers.length-1; i>=0; i--) {
                if(this.pers[i]>this.pInter){
                    this.pInter = this.pers[i];
                    break;
                }
            }
            this.updateTree(this.pInter,this.sizeInter);

        }
        else if(option === "decrease"){
            for (let i=1; i<this.pers.length; i++) {
                if(this.pers[i]<this.pInter){
                    this.pInter = this.pers[i];
                    break;
                }
            }
            this.updateTree(this.pInter,this.sizeInter);
        }
        return this.pInter;

    }
    setSize(option){
        if(option === "increase"){
            this.sizeInter = this.sizeInter + 1;
            this.updateTree(this.pInter,this.sizeInter);
        }
        else if(option === "decrease"){
            if (this.sizeInter >= 1){
                this.sizeInter = this.sizeInter - 1;
                this.updateTree(this.pInter, this.sizeInter);
            }

        }
        return this.sizeInter;

    }

    reshape(curnode){

        d3.select("#tree").selectAll("circle").remove();
        //open
        if(curnode.children[0]._children!=undefined)
        {curnode.descendants().forEach(d=>{
            if(d.id!=curnode.id) {
                if (d._children != undefined) {
                    d.children = d._children;
                    delete d._children;
                }
            }
        });}
        //collapse
        else{
            curnode.descendants().forEach(d=>{
                if(d.id!=curnode.id) {
                    if(d.children != undefined) {
                        d._children = d.children;
                        delete d.children;
                    }
                }
            });}
        this._treefunc(this._curroot);

        let cursize = this._curroot.descendants().length;

        this._node.classed("node", true);
        this._link.classed("link", true);

        d3.selectAll(".link")
            .classed("link",d=>{
                return checknode(d);});

        d3.selectAll(".node")
            .classed("node",d=>{
                return checknode(d);});

        let g = d3.select("#tree").attr("transform", "translate(15,40)");
        g.selectAll(".link")
            //.transition()
            //.duration(500)
            .attr("d", function (d) {
                return "M" + d.x + "," + d.y
                    //+ "C" + d.x  + "," + d.y+10
                    //+ " " + d.parent.x  + "," + d.parent.y+10
                    +"L" + d.parent.x + "," + d.parent.y;
            });
        g.selectAll(".node")
            .attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")";
            }).append("circle").attr("r", Math.log(this._initsize/cursize)).attr("class","treedis");

    }

}
export function getbaselevelInd(node, accum) {
    let i;
    //console.log(node.children);
    if (node.children != null) {
        accum = accum || [];
        for (i = 0; i < node.children.length; i++) {
            accum.push(node.children[i].data.index)
            getbaselevelInd(node.children[i], accum);
        }
    }
    else
        accum.push(node.data.index);

    return accum;
}

export function pfilter(mydata,ppp){
    return (mydata.data.persistence<=ppp && mydata.data.persistence != 1)? true : false;
}
export function sizefilter(mydata,sss){
    return (mydata.data._total.size<sss)? true : false;

}
export function checknode(curnode){

    if(curnode["_children"]!=undefined){
        return false;
    }
    else if(curnode["children"]==undefined){
        return false;
    }
    else
        return true;
}
export function newupdate(node, p, s){
    //Check current node, if meets the contraint, then check its children recursively
    //console.log(node.data._persistence);
    //console.log(node.data._size);
    //console.log(p);
    //console.log(s);
    if ((node.data._persistence<p)||node.data._size<s)
    {   //node.parent._children = node.parent.children;
        //delete node.parent.children;
        node._children = (node.children!=undefined)?node.children:node._children;
        delete node.children;
        /*
        if (node.parent._children === undefined)
        {
            node.parent._children = node;
        }
        else
            node.parent._children = [node.parent._children,node];

        console.log("Delete node");
        //console.log(getKeyByValue(node.parent.children, node));
        delete node.parent.children[getKeyByValue(node.parent.children, node)];
        */

        return }
    else
    {
        node.children = (node.children!=undefined)?node.children:node._children;
        delete node._children;
        node.oldx = node.x;
        node.oldy = node.y;
        //console.log(node);
        if (node.children!=undefined)
        node.children.forEach(d=>{
            //d.parent._children='ddd';
            newupdate(d,p,s);
        });

    }



}

export function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}