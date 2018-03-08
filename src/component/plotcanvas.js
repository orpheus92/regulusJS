import * as d3 from 'd3';

export function drawwithind(data, context, r, x, c, dataattr, ind, width, size, padding, yrange, e) {

    let yy = d3.scaleLinear()
        .range([size - padding, 0]);
    let indset = new Set(ind);
    //console.log(indset);
    let notset
    let inset;

    if (e === undefined) {
        notset = data.filter((dd) => {
            return !indset.has(dd.index)
        });
        inset = data.filter((dd) => {
            return indset.has(dd.index)
        });
    }
    else {
        if (e != null) {
            notset = data.filter((dd) => {
                return !indset.has(dd.index)
            });
            inset = data.filter((dd) => {
                return indset.has(dd.index)
            });
        }
        else {
            inset = data;
            notset = [];
        }
    }


    dataattr[1].forEach(d => {
        context.rect(0, 0, width - padding, size - padding);
        //context.strokeStyle = "#DCDCDC";
        context.strokeStyle = "#696969"//"#A9A9A9";
        context.lineWidth = 0.8;
        context.stroke();
        let lx, ly, lz;
        lx = dataattr[0];
        ly = d;
        lz = dataattr[0];

        yy.domain(yrange[ly]);

        notset.forEach(dd => {
            //console.log()
            let py;
            let px;
            let pz;
            if (dataattr === undefined) {
                py = point.y;
                px = point.x;
            }
            else {
                py = dd[ly];
                px = dd[lx];
                //console.log(d);

                //console.log(py);
                //pz = data[dd][lz];
            }
            let cx = x(px);
            let cy = yy(py);
            //let cl = c(pz);

            context.fillStyle = "#DCDCDC";
            context.beginPath();
            context.arc(cx, cy, r, 0, 2 * Math.PI);
            context.fill();

        })

        inset.forEach(dd => {
            //y.domain = yrange[ly];
            let py;
            let px;
            let pz;
            if (dataattr === undefined) {
                py = point.y;
                px = point.x;
            }
            else {
                py = dd[ly];
                px = dd[lx];
                pz = dd[lz];
            }
            let cx = x(px);
            let cy = yy(py);
            let cl = c(pz);

            context.fillStyle = cl;
            context.beginPath();
            context.arc(cx, cy, r, 0, 2 * Math.PI);
            context.fill();
        })

        context.translate(0, size);

    });
//context.restore();
//context.save();
}

export function drawwithind2(data, context, r, x, c, dataattr, ind, width, size, padding, yrange, e) {

    let yy = d3.scaleLinear()
        .range([size - padding, 0]);
    let xx = d3.scaleLinear()
        .range([0, size - padding]);
    let indset = new Set(ind);
    let notset;
    let inset;
    if (e === undefined) {
        notset = data.filter((dd) => {
            return !indset.has(dd.index)
        });//.map(d=>d.index);
        inset = data.filter((dd) => {
            return indset.has(dd.index)
        });
    }
    else {
        if (e != null) {
            notset = data.filter((dd) => {
                return !indset.has(dd.index)
            });//.map(d=>d.index);
            inset = data.filter((dd) => {
                return indset.has(dd.index)
            });
        }
        else {
            inset = data;
            notset = [];
        }
    }


    dataattr[1].forEach(d => {
        context.save()
        context.translate(d.i * size, (d.j - 1) * size);
        context.rect(0, 0, width - padding, size - padding);
        context.strokeStyle = "#696969";//"#A9A9A9";
        context.lineWidth = 0.8;
        context.stroke();
        let lx, ly, lz;
        lx = d.x;
        ly = d.y;
        lz = dataattr[0];
        //console.log(d.x,d.y)
        yy.domain(yrange[ly]);
        xx.domain(yrange[lx]);
        notset.forEach(dd => {
            //console.log()
            let py;
            let px;
            let pz;
            if (dataattr === undefined) {
                py = point.y;
                px = point.x;
            }
            else {
                py = dd[ly];
                px = dd[lx];

            }
            let cx = xx(px);
            let cy = yy(py);
            //let cl = c(pz);

            context.fillStyle = "#DCDCDC";
            context.beginPath();
            context.arc(cx, cy, r, 0, 2 * Math.PI);
            context.fill();

        })

        inset.forEach(dd => {
            //y.domain = yrange[ly];
            let py;
            let px;
            let pz;
            if (dataattr === undefined) {
                py = point.y;
                px = point.x;
            }
            else {
                py = dd[ly];
                px = dd[lx];
                pz = dd[lz];
            }
            let cx = xx(px);
            let cy = yy(py);
            let cl = c(pz);

            context.fillStyle = cl;
            context.beginPath();
            context.arc(cx, cy, r, 0, 2 * Math.PI);
            context.fill();
        })

        context.restore();

    });
}

export function drawpt(point, context, r, x, y, c, dataattr) {

    let py;
    let px;
    let pz;
    if (dataattr === undefined) {
        py = point.y;
        px = point.x;
    }
    else {
        py = point[dataattr[1]];
        px = point[dataattr[0]];
        pz = point[dataattr[2]];//}
    }
    let cx = x(px);
    let cy = y(py);
    let cl = c(pz);
    //console.log(colorScale(cx));

    context.fillStyle = cl
    context.beginPath();
    context.arc(cx, cy, r, 0, 2 * Math.PI);
    context.fill();
    //ctx.fillRect(cx,cy,cx+r,cy+r)
}

export function cleardraw(ctx, height, padding, n, width) {
    ctx.restore();
    ctx.translate(-padding / 2, -padding / 2);
    ctx.clearRect(0, 0, width + 3 * padding, height + 3 * padding);
    ctx.translate(padding / 2, padding / 2);
    ctx.save();

}

export function getindex(e, data, xlabel, ylabel, x, y, mypad) {
    //let seletedindex = new Set();
    /*let selectedindex = */
    //console.log(e,data,xlabel,ylabel,x,y,mypad);
    let selectedindex;
    if (e != null) {//console.log(e[0][0])
        //console.log(x(d[xlabel]))
        selectedindex = data.filter((d, i) => {
            return ((e[0][0] <= x(d[xlabel])) && (x(d[xlabel]) <= e[1][0])
                && (e[0][1] <= y(d[ylabel])) && (y(d[ylabel]) <= e[1][1]));
            //return d.index;
        }).map(dd => dd.index)
    }
    else selectedindex = [];
    return selectedindex;
}