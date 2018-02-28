import './style.css';

export class Partition{
    constructor() {

    }
    initialPartition(Pdata){
        this.data = Pdata;

        this.pers = Object.keys(Pdata).sort(function(a,b){return parseFloat(b)-parseFloat(a)});

        this.length = this.pers.length;

    }

}
