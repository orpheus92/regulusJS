import * as d3 from 'd3';

import './style.css';
import * as pubsub from '../PubSub';

let format = d3.format('.3g');

export class Info {

    constructor() {

        this.raw = d3.select("#raw");
        this.persistence = d3.select("#persistence");
        this.cper = d3.select("#cper");
        this.csize = d3.select("#csize");
        pubsub.subscribe("infoselect",this.select);
        pubsub.subscribe("infoupdate",this.update);

    }
    create(data, cpInter, csInter, measure, dataarray){
        this.measure = measure;
        this.dataarray = dataarray;
        let objrange = {};
        let attrs = Object.keys(dataarray);
        for (let i = 0; i<attrs.length; i++)
        {
            objrange[attrs[i]] = [Math.min(...dataarray[attrs[i]]),Math.max(...dataarray[attrs[i]])];
        }

        d3.select('#raw').text(d3.format(',d')(dataarray[measure].length));
        d3.select('#measure_name').text(measure);
        d3.select('#measure_range').text(`[${format(objrange[measure][0])}, ${format(objrange[measure][1])}]`);

        let cols = attrs.filter(d => d != measure).concat();
        cols.sort();
        let dims = d3.select('#dims').selectAll('li')
            .data(cols);
        dims.enter().append('li')
            .merge(dims)
            .html(d => `${d}: [${format(objrange[d][0])}, ${format(objrange[d][1])}]`);
        dims.exit().remove();

        // Use P_Partition to fetch persistence value
        let totalper = Object.keys(data).sort(function(b,a){return parseFloat(b)-parseFloat(a)}).map(x=>parseFloat(x));

        d3.select('#persistence').text(`[${format(totalper[0])}, ${format(totalper[totalper.length-1])}]`);
        d3.select('#filter_persistent').text(format(cpInter));
        d3.select('#filter_size').text(csInter);

        return(totalper);
    }

    update(channel,self,cpInter,csInter){
        d3.select('#filter_persistent').text(format(cpInter));
        d3.select('#filter_size').text(csInter);
    }

    select(channel, self, data, attr){
        //Should be changed to data not node
        if (data!=undefined) {
            let p_arr = Array.from(data._total);
            let selectionarr = p_arr.map(x=>parseFloat(self.dataarray[attr][x]));
            d3.select('#selected_size').text(data._total.size);
            d3.select('#selected_range').text(`[${format(Math.min(...selectionarr))}, ${format(Math.max(...selectionarr))}]`);
            d3.select('#selected_persistence').text(format(data._persistence));
        }


    }
}
