import * as d3 from 'd3';
//import { select, selection } from 'd3';
//import * as aaaa from 'd3-transition';
//let transition = d3.transition();
//console.log(transition.sel);
//import * as d3Tip from 'd3-tip';

import './style.css';

export class Tree{
    /**
     * Creates a Tree Object
     */
    constructor(treeCSV,partition,basedata) {
        this._maxsize = 0;
        this.treewidth = 670;
        this.treelength =380;
        this.translatex = 50;
        this.translatey = 100;
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
        //console.log(this._root);
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
            .size([this.treewidth,this.treelength]);
        this._color = d3.scaleSqrt().domain([1,this._maxsize])
            //.interpolate(d3.interpolateHcl)
            .range(["#bae4b3", '#006d2c']);
        //console.log(this);
        console.log(this);
    }

    /**
     * Creates a node/edge structure and renders a tree layout based on the input data
     *
     * @param treeData an array of objects that contain parent/child information.
     */



    updateTree(ppp,sss) {
        this.pInter = ppp;
        this.sizeInter = sss;
        //console.log(this.pInter);

        this.updatemodel();
        //console.log('root = ',this._root);
        this.layout("P");
        this.render('update');
    };
    updatemodel(){
        //console.log("pInter:",this.pInter);
        //console.log("pShow:",this.pShow);
        if (this.pShow != undefined)
            nodeupdate(this._root, this.pShow,this.sizeInter);
        else
            nodeupdate(this._root, this.pInter,this.sizeInter);


        this._circlesize = this._root.descendants().length;
    };
    layout(){
        let option = document.getElementById('level').value;

        this._treefunc(this._root);

        switch (option) {
            case "tLevel": {
                break;
            }
            case "pLevel": {
                let scale = d3.scaleLinear().nice();
                scale.range([this.treelength, 0]);
                if (this.pShow === undefined)
                {
                    for (let i = 0; i < this.pers.length; i++) {
                        if (this.pInter > this.pers[i]) {
                            scale.domain([this.pers[i], 1]);
                            break;
                        }
                    }
                }
                else
                {
                    scale.domain([this.pShow, 1]);
                }
                this._root.descendants().forEach(d=>{
                    d.y = scale(d.data._persistence);
                });
                break;
                //this._root._y = 0;
                /*this._root.descendants().forEach(d=>{
                    if (d.parent!=null){
                        d._y = (d.depth<this.pers.length)?d.parent._y+this.pers[d.parent.depth]-this.pers[d.depth]:d.parent._y+this.pers[d.parent.depth];
                        d.y = this.treelength*d._y;
                    }
                });
                break;*/
            }
            case "pLevelexp": {
                let scaleexp = d3.scalePow().nice();
                scaleexp.exponent(0.1);
                scaleexp.range([this.treelength, 0]);
                if (this.pShow === undefined)
                {
                        for (let i = 0; i < this.pers.length; i++) {
                            if (this.pInter > this.pers[i]) {
                                scaleexp.domain([this.pers[i], 1]);
                                break;
                            }
                        }
                }
                else
                {
                    scaleexp.domain([this.pShow, 1]);
                }
                this._root.descendants().forEach(d=>{
                        d.y = scaleexp(d.data._persistence);
                });
                break;
            }
            default:
        }
        /*
        //onsole.log(this._root);
        //Use option to decide whether to use tree level or persistence level
        if (option === "tLevel")
            return;
        else if (option === "pLevelexp")
        {
            //console.log(this._root.descendants());
            this._root._y = 0;
            this._root.descendants().forEach((d,i)=>{
                //console.log(d);
                if (d.parent!=null){
                    //console.log(d);
                    //console.log((Math.sqrt(this.pers[d.parent.depth]-this.pers[d.depth])));
                    //console.log(this.treelength*(Math.sqrt((this.pers[d.parent.depth]-this.pers[d.depth]))));
                    //console.log(this.treelength*(((this.pers[d.parent.depth]-this.pers[d.depth]))));
                    d._y = (d.depth<this.pers.length)?d.parent._y+this.pers[d.parent.depth]-this.pers[d.depth]:d.parent._y+this.pers[d.parent.depth];
                    d.y = this.treelength*(Math.pow(d._y,10));
                    //d.y = Math.log(d.y);
                    //console.log(d._y);
                }
            });

        }
        else{
            this._root.descendants().forEach((d,i)=>{
                //console.log(d);
                if (d.parent!=null){
                    d._y = (d.depth<this.pers.length)?d.parent._y+this.pers[d.parent.depth]-this.pers[d.depth]:d.parent._y+this.pers[d.parent.depth];
                    d.y = this.treelength*d._y;

                }
            });




        }*/
    };
    render(option){
        let g = d3.select("#tree").attr("transform", "translate("+this.translatex+","+this.translatey+")");

        //if(d3.select('#treetip')!=undefined)
        //    d3.selectAll('#treetip').remove();

        let t = d3.transition()
            .duration(300);
        //Update Link

        let curlink = g.selectAll(".link");

        this._link = curlink.data(this._root.descendants().slice(1))
            .enter().insert("path")
            .attr("class", "link")
            .merge(curlink);

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
            .attr('fill',  (d)=> {
                //Intermediate Nodes
                if ((d.parent!=null)&&(d.parent.data.index === d.data.index)/*&&(d.parent.data._size== d.data._size)*/&&(d.children!=null)&&(d.children.length ==1)&&(d.x===d.parent.x))
                    return "transparent";
                //Color based on partition size
                else if(d.data._size>=this.sizeInter&&d.data._persistence>=this.pInter)
                    return this._color(d.data._size);
                //Nodes opened by users
                else if(d.viz!=undefined)//||((d.children!=undefined)&&(d.children.viz!=undefined)))
                    return this._color(d.data._size);
                else
                    //return "#969696";
                    return "#cccccc";

                /*
                else
                { if (option === 'update')
                    return  "transparent";
                  else
                    return this._color(d.data._size);
                }
                */

            })
            .attr('class',  (d)=> {
                //Intermediate Nodes
                if ((d.parent!=null)&&(d.parent.data.index === d.data.index)/*&&(d.parent.data._size== d.data._size)*/&&(d.children!=null)&&(d.children.length ==1)&&(d.x===d.parent.x))
                    return "node";
                else
                    return "node viz";

            })
            /*
            .attr("stroke", (d)=>{
                if(d.viz!=undefined)//||((d.children!=undefined)&&(d.children.viz!=undefined)))
                return "black";
                else
                    return "none";
            })
            */
            .attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")";
            });


        //console.log(this._node);
        /*
        let tip = d3Tip().attr('class', 'd3-tip').attr('id','treetip')
            .direction('se')
            .offset(function() {
                return [0,0];
            })
            .html((d)=>{
                let tooltip_data = d.data;
                //console.log(d);
                if (!((d.parent!=null)&&(d.parent.data.index === d.data.index)&&(d.children!=null)&&(d.children.length ==1)))
                    return this.tooltip_render(tooltip_data);

                return ;
            });
        //console.log(this._node);
        this._node.call(tip);
        this._node.on('mouseover', tip.show)
            .on('mouseout', tip.hide);
        */
    };
    /*
    tooltip_render(tooltip_data) {


        let text =  "<li>"+"Partition Extrema: " + tooltip_data.index;
        text += "<li>";
        text +=  "Partition Persistence: " + tooltip_data._persistence;
        text += "<li>";
        text +=  "Number of Points: " + tooltip_data._total.size;

        return text;
    }
    */
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
        // You only need two lines of code for this! No loops!
        this._node.classed(".node", true);
        this._link.classed(".link", true);
        //d3.selectAll(".node").selectAll("text").classed("selectedLabel",false);

    }
    setPersistence(option){
        //let pShow;
        if(option === "increase"){
            for (let i=this.pers.length-1; i>=0; i--) {
                if(this.pers[i]>this.pInter){
                    this.pInter = this.pers[i];

                    //console.log(this.pInter);

                    this.pShow = (i+2>1) ?this.pers[i+2]:this.pers[1];
                    break;
                }
            }
            this.updateTree(this.pInter,this.sizeInter);

        }
        else if(option === "decrease"){
            for (let i=1; i<this.pers.length; i++) {
                if(this.pers[i]<this.pInter){
                    this.pInter = this.pers[i];
                    //console.log(this.pInter);
                    this.pShow = (i+2<this.pers.length-1) ?this.pers[i+2]:this.pers[this.pers.length-1]//this.pers[i];
                    break;
                }
            }
            this.updateTree(this.pInter,this.sizeInter);
        }
        //console.log(this.pInter);
        //console.log(pShow);

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

    /*
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
    */

    reshapemodel(curnode){
        //expand
        if(curnode.children===undefined) {//  console.log(curnode);
            curnode.children = curnode._children;
            delete curnode._children;

            //Expand the collapsed nodes
            if ((curnode.data._persistence < this.pInter)||(curnode.data._size < this.sizeInter)) {
                curnode.viz = true;

                if (curnode.children != undefined) {
                    curnode.children.forEach(d => {
                        //console.log(d);
                        if (d._children === undefined) {
                            d._children = d.children;
                            delete d.children;
                        }
                        else if (d.children != undefined) {
                            d._children = [d._children, d.children];
                            delete d.children;

                        }
                    });
                }
                else
                    console.log("Coundn't Expand Anymore, Need to Decrease Persistence Level");
            }
            else
                delete curnode.viz;
        }//console.log("Expand");

        /*
        {curnode.descendants().forEach(d=>{
            if(d.id!=curnode.id) {
                if (d._children != undefined) {
                    d.children = d._children;
                    delete d._children;
                }
            }
        });}
        */
        //collapse
        else{

            if (curnode._children === undefined)
            {
                curnode._children = curnode.children;
            }
            else
                curnode._children = [curnode.children,curnode];

            delete curnode.children;
            delete curnode.viz;
            /*
            curnode.descendants().forEach(d=>{
                if(d.id!=curnode.id) {
                    if(d.children != undefined) {
                        d._children = d.children;
                        delete d.children;
                    }
                }
            });
            */

        }
    }
    reshapeTree(curnode){
        this.reshapemodel(curnode);
        this.layout();
        this.render('reshape');

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

/*
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
*/

export function nodeupdate(node, p, s){
    //Check current node, if meets the contraint, then check its children recursively
    //console.log(node.data._persistence);
    //console.log(node.data._size);
    //console.log("Enter Recursion");
    //console.log(s);
    //console.log(node);
    if (node.data._persistence<p)
    {   if (node._children === undefined)
        //node._children = (node.children!=undefined)?node.children:node._children;
            node._children = node.children;
        else if (node.children!=undefined)
            node._children.concat(node.children);
        delete node.children;
        return true;
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
    /*
        else if (node.data._size<s)
    {

    }
    */
    else {
        //console.log(node);
        //console.log('children start',node.children);
        //console.log('_children start',node._children);
        //console.log(node.children.concat(node._children));
        //node.__children =  node.children.concat(node._children);
        if (node.children === undefined)
            node.__children = node._children;
        else if (node._children === undefined)
            node.__children = node.children;
        else
            node.__children = node.children.concat(node._children);//[node.children,node._children];
        //Object.assign( node.children, node._children);//(node.children != undefined) ? node.children : node._children;
        delete node._children;
        delete node.children;
        //console.log('__children',node.__children);
        node.oldx = node.x;
        node.oldy = node.y;
        //console.log(node);
        //if (node.children != undefined)
        //let list = {};
        //console.log(node);
        if (node.__children != undefined) {
            node.__children.forEach((d, i) => {
                //console.log(d);
                //d.parent._children='ddd';
                //if size smaller than size threshold
                //console.log("type1", node.__children);
                //console.log("type2", node.__children[i]);
                //console.log(d,i);
                if (node.__children[i].data._size < s) {
                    /*
                    if (node._children === undefined) {
                        node._children = node.children[i];
                        delete node.children[i];
                    }
                    else
                        node._children = [node.children[i], node._children];
                    */
                    //console.log("if", node.__children[i].data._size);
                    //console.log("_child before", node._children);

                    //node._children = (node._children!=undefined)?Object.assign(node._children, node.__children[i]):Object.assign({},node.__children[i]);
                    if (node._children != undefined)
                    //Object.assign(node._children, node.__children[i])
                    {
                        node._children.push(node.__children[i]);
                    }
                    else {//console.log(node._children);
                        node._children = [];
                        //Array.from(node.__children[i]);//node.__children[i];
                        //Object.keys(node._children).map(key => node._children[key])
                        node._children[0] = node.__children[i];

                        //Object.assign(Array.from(node.__children[i]));
                        //Array.prototype.push(node._children, node.__children[i]);
                    }
                    //console.log("_child after", node._children);

                }
                else {
                    //console.log("else", node.__children[i].data._size);
                    //console.log("child before",node.children);
                    //node.children =(node.children!=undefined)?Object.assign(node.children, node.__children[i]):Object.assign({},node.__children[i]);
                    if (node.children != undefined) {   //console.log(node.__children[i]);
                        node.children.push(node.__children[i]);
                    }

                    //Object.assign(node.children, node.__children[i]);
                    //node.children.push(node.__children[i]);

                    else {   //console.log(node.__children[i]);
                        //console.log( Array.from(node.__children[i]));
                        //node.children = Array.from(node.__children[i]);
                        //ode.children = node.__children[i];
                        //Object.assign(node.children);
                        //Array.prototype.push(node.children, node.__children[i]);
                        node.children = [];
                        //Array.from(node.__children[i]);//node.__children[i];
                        //Object.keys(node._children).map(key => node._children[key])
                        node.children[0] = node.__children[i];


                    }
                    //console.log("child after", node.children);

                    nodeupdate(d, p, s);
                }
            });

            delete node.__children;

        }
    }


}

export function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}