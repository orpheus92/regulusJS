
export function addbutton(svg, x, y, size,color, cname,data){

    svg.selectAll("."+cname).data(data,d=>{return d;}).enter()
        .append("rect").attr("class", cname)
        .attr("x", x)
        .attr("y", y)
        //.attr("dy",".9em")
        .attr("width", size)
        .attr("height", size).attr("fill", "transparent").attr("stroke",color);

    svg.selectAll("."+cname).data(data+1,d=>{return d;}).enter().append("line").attr("class", cname)
        .attr("x1", x+ size/4)
        .attr("y1", y + size/4)
        .attr("x2", x + size - size/4)
        .attr("y2", (y + size) - size/4).attr("stroke",color);

    svg.selectAll("."+cname).data(data+2,d=>{return d;}).enter().append("line").attr("class", cname)
        .attr("x1", (x + size) - size/4)
        .attr("y1", y + size/4)
        .attr("x2", x + size/4)
        .attr("y2", (y + size) - size/4).attr("stroke",color);

    /*
    svg.append("rect").attr("class", "deletebutton")
        .attr("x", (n-1)*size)
        .attr("y", 0)
        .attr("width", padding*2)
        .attr("height", padding*2).attr("fill", "transparent").attr("stroke","red");

    svg.append("line").attr("class", "deletebutton")
        .attr("x1", (n-1)*size + padding/4)
        .attr("y1", 0 + padding/4)
        .attr("x2", ((n-1)*size + padding*2) - padding/4)
        .attr("y2", (0 + padding*2) - padding/4).attr("stroke","red");

    svg.append("line").attr("class", "deletebutton")
        .attr("x1", ((n-1)*size + padding*2) - padding/4)
        .attr("y1", 0 + padding/4)
        .attr("x2", (n-1)*size + padding/4)
        .attr("y2", (0 + padding*2) - padding/4).attr("stroke","red");
    */

}