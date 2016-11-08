

var margin = {top: 100, right: 10, bottom: 100, left: 10},
    width = 1500 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom;

var rows = 4;



function trans(x, y) {
    return "translate("+ x + "," + y + ")";
}

var all_data 

function animationIM(base) {
    var svg = d3.select(base) //.style("text-align", "center").insert("svg", ":first-child")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    function make_text(data, id, img_width, img_height, focus, num) {
        var cols = data[0].words.length;
        
        var xScale = d3.scale.linear()
            .domain([0, cols])
            .range([0, width]);
        
        var yScale = d3.scale.linear()
            .domain([0, rows])
            .range([0, height]);
        var xMapScale, yMapScale;

        var base = svg.selectAll("g.base")
            .data([data[0]], function(d) {  return d.img;})

        var base_ent = base.enter()
            .append("g").attr("class", "base");

        base.exit().remove();
        
        var g = base.selectAll("g")
        g = g.data(function(d){return d.words.slice(0, num);},
               function(d, i) {return d.word + " " + d.num;} );

        var g2 = g.enter()
            .append("g");
        g.exit().remove();
        
        scale =  width / img_width;
        imageStartX = 0; 
        imageStartY = 175;
        diffY = 6;
        diffX = 8;
        var yImScale = d3.scale.linear()
            .domain([0, img_height/8])
            .range([imageStartY, imageStartY + img_height *scale]);
        var xImScale = d3.scale.linear()
            .domain([0, img_width/8])
            .range([imageStartX, imageStartX + img_width * scale]);
        
        g.selectAll("text")
            .transition()
            .duration(200)
            .style("font-weight", "normal")
            .style("font-size", "25")
            .attr("transform", function(d, i) {
                return "translate("+ xScale(d.num)+ "," + yScale(1)+ ") " + "rotate(-50)";})  
        
            .text(function(d) {return d.word;} );
     
        g2
            .append("text")
            // .attr("dx", function(d, i) { return xScale(i); } )
            // .attr("dy", function(d, i) { return yScale(1); })
            .attr("transform", function(d, i) {return "translate("+ xScale(i)+ "," + yScale(1)+ ")";})  
            .on("mouseover", function(d) {
                make_text(data, id, img_width, img_height, d.scores);
            })

            .style("opacity", 0)
            .style("font-size", "80")
            .text(function(d) {return d.word;} )
            .transition()
            .delay(100)
            .style("opacity", 1)

        

        
        
        g2.append("line")
            .style("opacity", 0.6) 
            .style("stroke", function (d) { return "grey";
                                            
                
                                          } )
            .style("display", function(d) {
                if (d.word == "\\mathrm" || d.word == "\\bf" || d.word == "{" || d.word == "}" || d.word == "_" || d.word == "^") {
                    return "none";
                } else {
                    return "block";
                }
            }
                  )
            .attr("x1", function(d, i) { return xScale(i); })
            .attr("y1", function(d, i) { return yScale(1) + 10; })
            .attr("x2", function(d, i) { return xImScale(d.exp_col -0.5); })
            .attr("y2", function(d, i) { return yImScale(d.exp_row - 0.5); });


        var b = base.selectAll("rect")
            .data(focus, function(d) { return d.row + "" + d.col;} );


        
        b.enter()
            .append("rect")
            .attr("width", xImScale(1) - xImScale(0))
            .attr("height", yImScale(1) - yImScale(0))
            .attr("x", function(d) { return xImScale(d.col-1);})
            .attr("y", function(d) { return yImScale(d.row-1);});
         
        b.exit().remove();
        b.style("fill", "red")
            .transition().duration(100)
            .style("opacity", function(d) {return d.score/2;} );
        
        b.exit().remove();

        
        for (var i = 0; i <= img_height/8; i++) {
            base_ent.insert("line", ":first-child")
                .attr("x1", xImScale(0))
                .attr("y1", yImScale(i))
                .attr("x2", xImScale(img_width/8))
                .attr("y2", yImScale(i))
                .style("stroke", "black")
                .style("opacity", "0.1")
        }
        
        for (var i = 0; i <= img_width/8; i++) {
            base_ent.insert("line", ":first-child")
                .attr("y1", yImScale(0))
                .attr("x1", xImScale(i))
                .attr("y2", yImScale(img_height/8))
                .attr("x2", xImScale(i))
                .style("stroke", "grey")
                .style("opacity", "0.1")
        }
        
        
        base_ent.insert("image", ":first-child")
            .attr("xlink:href", function(d){return "img/" + d.img;})
            .attr("x", xImScale(0))
            .attr("y", yImScale(0))
            .attr("width", img_width *scale )
            .attr("height", img_height * scale);
        
        
        
    }
   
    function show(im_num) {
        var img = new Image();
        var im_num2 = im_num
        global_im_num = im_num;
        img.onload = function() {
            var w = this.width
            var h = this.height
            function call(num) {
                var d = all_data[im_num].words[num-1]
                if (d.word == "{") {
                    focus = [all_data[im_num].words[num].scores];
                } else {
                    focus = [d.scores]
                }
                d.num = num -1;
                make_text([all_data[im_num]], im_num, w, h, [].concat.apply([], focus), num);
                if (num < 50 && global_im_num == im_num2) {
                    setTimeout(function() {call(num+1);}, 300);
                }
            }
            call(1);
        }
        img.src = "img/" + all_data[im_num].img;
        
    }
    
    d3.json("vis.json", function(error, data) {
        all_data = data        
        var cur = 10;
        show(cur);
        d3.select("#im2latexbuttons").insert("a", ":first-child").text("next").on("click", function() { cur++; show(cur); return false;} );

        d3.select("#im2latexbuttons").insert("a", ":first-child").text("  ").on("click", function() { cur--; show(cur); return false;} );
        d3.select("#im2latexbuttons").insert("a", ":first-child").text("last").on("click", function() { cur--; show(cur); return false;} );
    });
}


