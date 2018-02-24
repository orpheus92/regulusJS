import * as d3 from 'd3';
//import { select, selection } from 'd3';
//import * as aaaa from 'd3-transition';
//let transition = d3.transition();
//console.log(transition.sel);
//import * as d3Tip from 'd3-tip';
import * as pubsub from '../PubSub';

import './style.css';

export class Tree{
    /**
     * Creates a Tree Object
     */
    constructor(pc_relation,partition,basedata) {
        //console.log(partition);
        this._maxsize = 0;
        this.treewidth = 470;
        this.treelength =250;
        this.translatex = 30;
        this.translatey = 70;

        let totalpers = [];
        let allsaddle = [];
        partition.pers.map(function(item) {
            totalpers.push(parseFloat(item));
            allsaddle.push(parseInt(partition.data[item][partition.data[item].length-1]));
        });
        this.saddle = allsaddle;


        this.pers = totalpers;

        pc_relation.forEach(d=> {
            d.id = d.C1+ ", "+d.C2+", "+d.Ci;
            d.index = d.C1+ ", "+d.C2;
            d.level = parseInt(d.Ci);
            d.par = d.P1+ ", "+d.P2+", "+d.Pi;
            d._persistence = (this.pers[d.Ci]!=undefined)?this.pers[d.Ci]:0;
            d._saddleind = this.saddle[d.Ci];
        });

        //Children relations
        this._root = d3.stratify()
            .id(d => d.id)
            .parentId(d => d.par === ", , 0" ? '' : d.par)
            (pc_relation);
        //console.log(this._root.descendants());
        let accum;
        //console.log("oldL",this._root.descendants().length);
        //console.log(this._root.descendants());

        this._root.descendants().forEach(d=>{
            //console.log(d);
            if(d.children!=undefined)
            {

                d.children.forEach((tt,i)=>{
                    d.children[i]=getlowestleaf(tt);
                    d.children[i].parent =(d.children[i].parent.depth<d.depth)?d.children[i].parent:d;
                    //d.children[i].depth = (d.children[i].parent.depth<d.depth)?d.children[i].parent.depth+1:d.depth+1;
                    }

                );

            }
            accum = [];
            accum = getbaselevelInd(d, accum);

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
            d.data._totalinit = d.data._total;
            d.data._size = d.data._total.size;
            d.data._sizeinit = d.data._size;
            this._maxsize = (this._maxsize>d.data._size)?this._maxsize :d.data._size;
        });

        this._color = d3.scaleSqrt().domain([1,this._maxsize])
            .range(["#bae4b3", '#006d2c']);
        let svg = d3.select("#tree").attr("transform", "translate("+this.translatex+","+this.translatey+")");
        this._linkgroup = svg.append('g');
        this._nodegroup = svg.append('g');

        function getlowestleaf(node)
        {
            if(node.children!=undefined&&node.children.length===1&&node._children===undefined)//node.parent.data.index===node.data.index)
            {
                return(getlowestleaf(node.children[0]));
            }
            else {
                return node};

        }

        this._activenode = this._root.descendants();
        // Default
        this.Level = "tLevel";
        this.Scale = "linear";
        this._curselection = [];
        console.log(this);
        pubsub.subscribe("levelchange2", this.updatelevel);

    }

    updatelevel(channel,self,level,scale){
        self.Level = level;
        self.Scale = scale;
        self.layout();
        self.render();
    }
    updateTree(ppp,sss) {
        //console.log("updateTree")
        this.pInter = ppp;
        this.sizeInter = sss;

        this.updatemodel();
        this.layout("P");
        this.render('update');
    };
    updatemodel(){
        if (this.pShow != undefined)
            {   //console.log(this.pShow);
                nodeupdate(this._root, this.pShow,this.sizeInter);
            }
        else
            {   //console.log(this.pShow);
                this.setParameter();
                nodeupdate(this._root, this.pShow, this.sizeInter);
            }

    };
    layout(){

        mytree(this._root);
        this._activenode = this._root.descendants();
        this._circlesize = this._root.descendants().length;
        this._maxx = Math.max.apply(Math,this._activenode.map(function(o){return o.xx;}))
        let scalex = d3.scaleLinear().nice();
        scalex.domain([this._maxx,0]);
        if(this._maxx==0)
            scalex.range([this.treewidth/2, 0]);
        else
            scalex.range([this.treewidth, 0]);


        switch (this.Level) {
            case "tLevel": {
                this._maxlevel = Math.max.apply(Math,this._activenode.map(function(o){return o.y;}));

                let scaley = d3.scaleLinear().nice();
                scaley.domain([this._maxlevel,0]);
                scaley.range([this.treelength, 0]);
                this._root.descendants().forEach(d => {

                    d.y = scaley(d.y);
                    d.x = scalex(d.xx);
                    if (this._filter!=undefined){
                        d.data._total = new Set([...this._filter].filter(x=>d.data._totalinit.has(x)));
                        d.data._size = d.data._total.size;
                    }

                });
                break;
            }
            case "pLevel": {
                switch (this.Scale){
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
                        d.x = scalex(d.xx);

                        if (this._filter!=undefined){
                            d.data._total = new Set([...this._filter].filter(x=>d.data._totalinit.has(x)));
                            d.data._size = d.data._total.size;
                        }

                    });
                    break;
                }
                    case "log": {
                        let scaleexp = d3.scaleLog().nice();
                        scaleexp.range([this.treelength, 0]);
                        if (this.pShow === undefined) {
                            for (let i = 0; i < this.pers.length; i++) {
                                if (this.pInter > this.pers[i]) {
                                    scaleexp.domain([this.pers[i], 1]);
                                    //console.log(this.pers[i]);
                                    break;
                                }
                            }
                        }
                        else {
                            let plow =(this.pers[parseInt(getKeyByValue(this.pers, this.pShow))]!=undefined)?this.pers[parseInt(getKeyByValue(this.pers, this.pShow))]:this.pers[this.pers.length-1];
                            scaleexp.domain([plow, 1]);
                            //console.log(plow);
                        }
                        this._root.descendants().forEach(d => {
                            d.x = scalex(d.xx);
                            d.y = (d.data._persistence!=0)?scaleexp(d.data._persistence):scaleexp(this.pers[this.pers.length-1]);
                            if (this._filter!=undefined){
                                d.data._total = new Set([...this._filter].filter(x=>d.data._totalinit.has(x)));
                                d.data._size = d.data._total.size;
                            }
                        });
                        break;
                    }
                    default:
                }
            }
            default:
        }

    };
    render(option) {
        d3.select("#tree").selectAll("text").remove();
        let t = d3.transition()
            .duration(250).ease(d3.easeLinear);
        //Update Link
        {
            let newlink = this._linkgroup.selectAll(".link").data(this._activenode.slice(1), d=>{return d.id});
                newlink.enter().insert("path")
                .attr("class", "link").attr("d", d => {
                    if (d.parent != null)
                        if (d.parent.oldx != null) {
                            return diagonal(d.parent.oldx, d.parent.oldy, d.parent.oldx, d.parent.oldy)
                        }
                });
            newlink.exit().remove();
            t.selectAll('.link')
                .attr("d", d => {
                        return diagonal(d, d.parent);
                });
        }
        // Update Node
        {
            this._nodegroup.selectAll(".node").data(this._activenode, d=>{return d.id})
            .enter().append("circle").attr("class", 'node')
            .attr("r",15 / Math.sqrt(this._circlesize) + 1)
            .attr("transform", function (d) {
                if (d.parent != null)
                    if (d.parent.oldx != null) {
                        return "translate(" + d.parent.oldx + "," + d.parent.oldy + ")";
                }
            });

        t.selectAll('.node')
            .attr("r", 15 / Math.sqrt(this._circlesize) + 1)
            .attr('fill', (d) => {
                if (d.data._size >= this.sizeInter && d.data._persistence >= this.pInter)
                    return this._color(d.data._size);
                //Nodes opened by users
                else if (d.viz != undefined)
                    return this._color(d.data._size);
                else
                    return "#cccccc";
            })
            .attr("stroke", (d) => {
                if (d.children == undefined)
                    return "red";
            })
            .attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")";
            });

        d3.selectAll('.node').data(this._activenode,d=>{return d.id}).exit().remove();

        }

        this.mark();
    };

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


    }

    reshapeTree(curnode){
        this.reshapemodel(curnode);
        this.layout();
        this.render('reshape');

    }

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
        }
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

        }
    }


    mark(clicked) {
        //console.log(clicked);
        if (clicked != undefined) {
        this._curselection.push(clicked);
        d3.select("#tree").selectAll("text").remove();
        d3.select("#tree").selectAll("text")
            .data(clicked, d=>{return d.id})
            .enter()
            .append("text")
            .attr("x", d => {
                return d.x + 50 / Math.sqrt(this._circlesize) + 2;
            })
            .attr("y", d => {
                return d.y;
            })
            .attr("dy", ".71em")
            .text((d) => {
                return d.id;
            });

        }
        else {
            for (let i = 0; i < this._curselection.length; i++)
            {

            d3.select("#tree").selectAll("text").remove();
            d3.select("#tree").selectAll("text")
                .data(this._curselection[i], d=>{return d.id})
                .enter()
                .append("text")
                .attr("x", d => {
                    return d.x + 50 / Math.sqrt(this._circlesize) + 2;
                })
                .attr("y", d => {
                    return d.y;
                })
                .attr("dy", ".71em")
                .text((d) => {
                    return d.id;
                });
        }
        }
    }

    setParameter(option, range){
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
        else if(option === "slide"){
            let p = range[0];

            if (p>=this.pInter)
            {for (let i=this.pers.length-1; i>=0; i--) {
                if(this.pers[i]>p){
                    this.pInter = this.pers[i+1];
                    this.pShow = (i+2>0) ?this.pers[i+2]:this.pers[0];
                    break;
                }
            }}
            //slided p < pInter

            else{for (let i=1; i<this.pers.length; i++) {
                if(this.pers[i]<=p){
                    this.pInter = this.pers[i];
                    this.pShow = (i+1<this.pers.length-1) ?this.pers[i+1]:this.pers[this.pers.length-1]//this.pers[i];
                    break;
                }
            }}
            this.updateTree(this.pInter,this.sizeInter);

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

    updatefilter(filter){
        this._filter = filter;
    }
    searchchildren(selectdata, selectnode){
        //let size = [];
        //console.log(selectdata);
        //let checkset = new Set(selectdata);
        //console.log(selectnode);
        this._nodegroup.selectAll(".node").data(selectnode.descendants(), d=>{return d.id}).attr("id", d=>{
            //console.log(d);
            let intersection = new Set([...selectdata].filter(x => d.data._total.has(x)));

            return (intersection.size>0)?"selected":null;

        });

    }

}
export function getbaselevelInd(node, accum) {
    let i;
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


export function nodeupdate(node, p, s){
    //Check current node, if meets the contraint, then check its children recursively
    // Check Node Persistence

    node.oldx = node.x;
    node.oldy = node.y;
    if (node.data._persistence<p)
    {
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

        return }
    else if (node.data._size<s)
    {
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

        return }
        //Check Size/P for
    else {
        if (node.children === undefined)
            node.__children = node._children;
        else if (node._children === undefined)
            node.__children = node.children;
        else
            node.__children = node.children.concat(node._children);//[node.children,node._children];
        delete node._children;
        delete node.children;
        node.oldx = node.x;
        node.oldy = node.y;
        if (node.__children != undefined) {
            node.__children.forEach((d, i) => {
                if (node.__children[i].data._size < s)
                {
                    if (node._children != undefined)
                    {
                        node._children.push(node.__children[i]);
                    }
                    else {
                        node._children = [];
                        node._children[0] = node.__children[i];
                    }
                }
                else if(node.__children[i].data._persistence < p)
                {
                    if (node._children != undefined)
                    {
                        node._children.push(node.__children[i]);
                    }
                    else {
                        node._children = [];
                        node._children[0] = node.__children[i];
                    }
                }
                else {
                    if (node.children != undefined) {
                        node.children.push(node.__children[i]);
                    }
                    else {
                        node.children = [];
                        node.children[0] = node.__children[i];
                    }
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

    if (node.parent != null)
        {
            let d = node.parent;
            if ((d.parent!=null)&&(d.children!=undefined)&&(d.children.length === 1)&&(d.children[0].data.index === d.data.index))//&&(d.children!=null)&&(d.children.length ==1)&&(d.x===d.parent.x))
                {
                    return findparent(d);
                }
            else if (d.parent === null)
                return d;
            else
               return d;
        }
    else
        return node;
}

export function checklowestchild(d){
    if ((d.parent!=null)&&(d.children!=undefined)&&(d.children.length === 1)&&(d.children[0].data.index === d.data.index))//&&(d.children!=null)&&(d.children.length ==1)&&(d.x===d.parent.x))

    {
        return false;
    }
    else
        return true;

}

export function diagonal(source, target, arg3, arg4) {
    // If 4 args: sx, sy, tx, ty
    if (arg3 === undefined)
    {
        return "M" + source.x + "," + source.y

            //+ "C" + (source.x*9/10+target.x/10)  + "," + target.y
            //+ " " + (source.x + target.x) / 2 + "," + source.y
            + "C" + source.x + "," + (source.y + target.y) / 2
            + " " + target.x + "," +  (source.y + target.y) / 2
            + " " + target.x + "," + target.y;
    }
    else{
        return "M" + source + "," + target

            //+ "C" + (source*9/10+arg3/10)  + "," + arg4
            //+ " " + (source + arg3) / 2 + "," + arg4
            + "C" + source + "," + (target + arg4) / 2
            + " " + arg3 + "," +  (target + arg4) / 2
            + " " + arg3 + "," + arg4;
    }
}

export function mytree(node,width,height){
    layoutdfs(node,0);
    //console.log(node);
}
export function layoutdfs(node,value){
    if (node.children==undefined){
        node.xx = value;
        //console.log(node,value);
        node.y = node.depth;
        //value = value+1;
        return value;
    }
    else if(node.children.length==1)
    {
        layoutdfs(node.children[0],value);
        //if(value!=node.children[0].x)
        value = node.children[0].xx;
        node.xx = value;
        //console.log(node,value);
        node.y = node.depth;
        //console.log(value);
        //value = value + 1;
        //Problem here
        return Math.max.apply(Math,node.descendants().map(function(o){return o.xx;}));//value;
    }
    else if(node.children.length==2)
    {   if (node.children[0].data._size<=node.children[1].data._size)
        {
            value = layoutdfs(node.children[0],value);
            value = value + 1;

            node.xx = value;
            //console.log(node,value);
            node.y = node.depth;

            value = value + 1;
            value = layoutdfs(node.children[1],value);
            //value = value + 1;

            return value;
        }
        else
        {
            value = layoutdfs(node.children[1],value);
            value = value + 1;

            node.xx = value;
            //console.log(node,value);
            node.y = node.depth;

            value = value + 1;
            value = layoutdfs(node.children[0],value);
            //value = value + 1;
            return value;

        }
        //layoutdfs(node.children[0]);
        //node.x = value;
        //value = value + 1;
    }
}