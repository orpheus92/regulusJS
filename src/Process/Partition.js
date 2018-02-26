import './style.css';

//import * as d3 from 'd3';
export class Partition{
    //constructor for initial partitions
    constructor() {

    }
    initialPartition(Pdata){
        this.data = Pdata;

        this.pers = Object.keys(Pdata).sort(function(a,b){return parseFloat(b)-parseFloat(a)});
        //console.log(Pdata);
        this.length = this.pers.length;


    }

    update(persistence){

        this.curPar = new Object();
        this.curMerge = new Object();
        let mergeobj = new Object();
        this.curPar[this.pers[0]] = this.data[this.pers[0]];
        mergeobj['per'] = this.pers[0];
        mergeobj['parent'] = "";
        mergeobj['id'] = this.data[this.pers[0]];
        this.curMerge[this.data[this.pers[0]]]= mergeobj;//({id:this.data[this.pers[0]], value: mergeobj});

        for (let i = 1;i<this.length;i++){
            if (parseFloat(this.pers[i])>persistence)
            {this.curPar[this.pers[i]] = this.data[this.pers[i]];
                for(let j = 0;j<this.merge[this.pers[i]].length;j = j+2)
                {
                    mergeobj['per'] = this.pers[i];
                    mergeobj['parent'] = this.merge[this.pers[i]][j];
                    mergeobj['id'] = this.merge[this.pers[i]][j];
                    this.curMerge[this.merge[this.pers[i]][j]]= mergeobj;//.push({id:this.data[this.pers[i]], value: mergeobj});

                }



            }
        }

    }


}
