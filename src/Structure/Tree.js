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
            d._persistence = (this.pers[d.Ci]!=undefined)?this.pers[d.Ci]:0;
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

        this.updatemodel();
        this.layout("P");
        this.render('update');
    };
    updatemodel(){
        //console.log("pInter:",this.pInter);
        //console.log("pShow:",this.pShow);
        if (this.pShow != undefined)
            {
                nodeupdate(this._root, this.pShow,this.sizeInter);
            }
        else
            {
                this.setParameter();
                nodeupdate(this._root, this.pShow, this.sizeInter);
            }
        this._circlesize = this._root.descendants().length;
    };
    layout(){
        let option = document.getElementById('level').value;
        let option2 = document.getElementById('scale').value;

        this._treefunc(this._root);
        //this.activelength = 0;

        switch (option) {
            case "tLevel": {
                //this._root.descendants().forEach(d => {
                //    if(d.children==undefined)
                //        this.activelength++;
                //});
                break;
            }
            case "pLevel": {
                switch (option2){
                    case "linear": {

                        let scale = d3.scaleLinear().nice();
                    scale.range([this.treelength, 0]);
                    if (this.pShow === undefined) {
                        for (let i = 0; i < this.pers.length; i++) {
                            if (this.pInter > this.pers[i]) {
                                scale.domain([this.pers[i], 1]);
                                break;
                            }
                        }
                    }
                    else {
                        scale.domain([this.pShow, 1]);
                    }
                    this._root.descendants().forEach(d => {
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
                    case "log": {
                        let scaleexp = d3.scaleLog().nice();
                        //scaleexp.exponent(0.1);
                        scaleexp.range([this.treelength, 0]);
                        if (this.pShow === undefined) {
                            for (let i = 0; i < this.pers.length; i++) {
                                if (this.pInter > this.pers[i]) {
                                    scaleexp.domain([this.pers[i], 1]);
                                    break;
                                }
                            }

                        }
                        else {
                            let plow =(this.pers[parseInt(getKeyByValue(this.pers, this.pShow))+1]!=undefined)?this.pers[parseInt(getKeyByValue(this.pers, this.pShow))+1]:this.pers[this.pers.length-1];
                            scaleexp.domain([plow, 1]);

                        }
                        this._root.descendants().forEach(d => {

                            d.y = (d.data._persistence!=0)?scaleexp(d.data._persistence):scaleexp(this.pers[this.pers.length-1]);

                        });
                        break;
                    }
                    default:
                }
            }
            default:
        }

    };
    render(option){
        d3.select("#tree").selectAll("text").remove();

        let g = d3.select("#tree").attr("transform", "translate("+this.translatex+","+this.translatey+")");

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
            .attr("d", d=> {

                if (checklowestchild(d)) {
                    let parentd = findparent(d);
                    return diagonal(d,parentd);//"M" + d.x + "," + d.y

                    //+"L" + d.parent.x + "," + d.parent.y;
                    //+ "L" + findparent(d).x + "," + findparent(d).y;
                }
            });




        // Update Node
        let curnode = g.selectAll(".node");

        this._node = curnode.data(this._root.descendants())
            .enter().append("circle")

            .attr("r",50/Math.sqrt(this._circlesize)+2)
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

        t.selectAll('.node')
            .attr("r",50/Math.sqrt(this._circlesize)+2)
            .attr('fill',  (d)=> {
                //Intermediate Nodes
                /* May be updated later

                if(d.children === undefined)
                    return "#cccccc";
                else if(d.viz!=undefined)//||((d.children!=undefined)&&(d.children.viz!=undefined)))
                    return this._color(d.data._size);
                else if ((d.parent!=null)&&(d.children!=undefined)&&(d.children.length === 1)&&(d.children[0].data.index === d.data.index))//&&(d.children!=null)&&(d.children.length ==1)&&(d.x===d.parent.x))
                    return "transparent";
                //Color based on partition size
                else //if(d.data._size>=this.sizeInter&&d.data._persistence>=this.pInter)
                    return this._color(d.data._size);
                */

               //old implementation
                if ((d.parent!=null)&&(d.children!=undefined)&&(d.children.length === 1)&&(d.children[0].data.index === d.data.index))//&&(d.children!=null)&&(d.children.length ==1)&&(d.x===d.parent.x))
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


            })
            .attr('class',  (d)=> {
                //Intermediate Nodes
                //if ((d.parent!=null)&&(d.parent.data.index === d.data.index)&&(d.children!=null)&&(d.children.length ==1)&&(d.x===d.parent.x))
                if ((d.parent!=null)&&(d.children!=undefined)&&(d.children.length === 1)&&(d.children[0].data.index === d.data.index))//&&(d.children!=null)&&(d.children.length ==1)&&(d.x===d.parent.x))

                    return "node";
                else
                    return "node viz";

            })
            .attr("stroke", (d)=>{
                if(d.children==undefined)//||((d.children!=undefined)&&(d.children.viz!=undefined)))
                return "red";

            })
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
    setParameter(option){
        //let pShow;
        if(option === "increase"){
            for (let i=this.pers.length-1; i>=0; i--) {
                if(this.pers[i]>this.pInter){
                    this.pInter = this.pers[i];
                    this.pShow = (i+1>0) ?this.pers[i+1]:this.pers[0];
                    break;
                }
            }
            this.updateTree(this.pInter,this.sizeInter);

        }
        else if(option === "decrease"){
            for (let i=1; i<this.pers.length; i++) {
                if(this.pers[i]<this.pInter){
                    this.pInter = this.pers[i];
                    this.pShow = (i+1<this.pers.length-1) ?this.pers[i+1]:this.pers[this.pers.length-1]//this.pers[i];
                    break;
                }
            }

            this.updateTree(this.pInter,this.sizeInter);
            //return this.pInter;

        }
        else if(option === "increaseS"){
            this.sizeInter = this.sizeInter + 1;
            this.updateTree(this.pInter,this.sizeInter);
            //return this.sizeInter;

        }
        else if(option === "decreaseS"){
            if (this.sizeInter >= 1){
                this.sizeInter = this.sizeInter - 1;
                this.updateTree(this.pInter, this.sizeInter);
            }

        }
        // Set pShow for initialization
        else
        {
            for (let i=0; i<this.pers.length; i++) {
                if(this.pers[i]<=this.pInter){
                    this.pInter = this.pers[i];
                    this.pShow = (i+1<this.pers.length-1) ?this.pers[i+1]:this.pers[this.pers.length-1]//this.pers[i];
                    break;
                }
            }

        }
        return [this.pInter, this.sizeInter];

    }
    /*
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
    */
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

    mark(clicked){
        //console.log("clicked:", clicked);
        d3.select("#tree").selectAll("text").remove();
        d3.select("#tree").selectAll("text")
            .data(clicked)
            .enter()
            .append("text")
            .attr("x", d=>{return d.x+50/Math.sqrt(this._circlesize)+2;})
            .attr("y", d=>{return d.y;})
            .attr("dy", ".71em")
            .text((d,i)=> {
            //console.log(i);
                return "Node"+i;
            });


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
    //console.log(node.data._persistence, p, s);
    if (node.data._persistence<p)
    {   //console.log(node.children);
        //console.log(node._children);
        if (node._children === undefined)
            {
                node._children = node.children;
            }
        else if (node.children!=undefined)
            {
                node._children = node._children.concat(node.children);
            }
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
export function findparent(node){
    //console.log("node: ", node)
    //if(node.parent === null){
    //    console.log("aaa");
    //    return node;
    //}
    if (node.parent != null)
        {
            let d = node.parent;
            //console.log("d:",d);
            if ((d.parent!=null)&&(d.children!=undefined)&&(d.children.length === 1)&&(d.children[0].data.index === d.data.index))//&&(d.children!=null)&&(d.children.length ==1)&&(d.x===d.parent.x))
                //findparent(node.parent);
                {   //console.log("In If",d.parent!=null, d.children!=undefined )
                    return findparent(d);
                }
            else if (d.parent === null)
                return d;
            else
               return d;
        }
    /*else if ((node.data.index === node.parent.data.index)&&(node.parent.children.length ===1))//(node.data._size === node.parent.data._size))
        {
            console.log("bbb");

            return findparent(node.parent);}
    else
        {
            console.log("ccc");

            return node;}
       */
    else
        return node;
}

export function checklowestchild(d){
    //if ((d.parent!=null)&&(d.children!=undefined)&&(d.children.length === 1)&&(d.children[0].data.index === d.data.index)&&(d.children[0].data._size === d.data._size))//&&(d.children!=null)&&(d.children.length ==1)&&(d.x===d.parent.x))
    //if((d.children!=undefined)&&(d.children.length===1)&&(d.children[0].data.index===d.data.index))
    if ((d.parent!=null)&&(d.children!=undefined)&&(d.children.length === 1)&&(d.children[0].data.index === d.data.index))//&&(d.children!=null)&&(d.children.length ==1)&&(d.x===d.parent.x))

    {
        return false;
    }
    else
        return true;

}

export function diagonal(source, target) {

    return "M" + source.x + "," + source.y
        //+ "C" + (source.x + target.x) / 2 + "," + source.y
        //+ " " + (source.x + target.x) / 2 + "," + target.y
        + "C" + (source.x*9/10+target.x/10)  + "," + target.y
        + " " + (source.x + target.x) / 2 + "," + target.y
        //+ "C" + (source.x*9/10+target.x/10)  + "," + (source.y+target.y)/2
        //+ " " + (source.x*9/10 + target.x/10) + "," + (target.y*9/10+source.y/10)
        + " " + target.x + "," + target.y;
}