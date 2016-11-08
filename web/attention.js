function tr(x, y) {
    return `translate(${x},${y})`;
}


function line(fn) {
    return (selection => {
        selection.each(function (d, i) {
            xy = fn(d, i);
            d3.select(this).attr({x1: xy[0],
                                  y1: xy[1],
                                  x2: xy[2],
                                  y2: xy[3]});
        });
    });
}

function min_pt(scale) {
    return scale.range()[0];
}

function max_pt(scale) {
    return scale.range()[1];
}

function span(scale) {
    return scale.range()[1] - scale.range()[0];
}


function step(scale) {
    return scale(1) - scale(0);
}

function ignore_symbols(sym) {
    return (sym == "\\mathrm" || sym == "\\bf" || sym == "{" || sym == "}" || sym == "_" || sym == "^")
}

class Attention {
    constructor(base) {
        var margin = {top: 100, right: 10, bottom: 100, left: 10};
        
        this.width = 1500 - margin.left - margin.right;
        this.height = 700 - margin.top - margin.bottom;
        this.rows = 4;
        
        this.container = d3.select(base)
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", tr(margin.left, margin.right));
    }
        
    makeScales(imHeight, imWidth, cols) {
        this.imHeight = imHeight;
        this.imWidth = imWidth;
        this.cols = cols;
        
        this.xScale = d3.scale.linear()
            .domain([0, this.cols])
            .range([0, this.width]);
        
        this.yScale = d3.scale.linear()
            .domain([0, this.rows])
            .range([0, this.height]);

        var scale =  this.width / this.imWidth;
        var imageStartX = 0; 
        var imageStartY = 175;

        this.xImSteps = this.imWidth / 8;
        this.yImSteps = this.imHeight / 8;

        this.yImScale = d3.scale.linear()
                .domain([0, this.yImSteps])
                .range([imageStartY, imageStartY + this.imHeight *scale]);
        this.xImScale = d3.scale.linear()
                .domain([0, this.xImSteps])
                .range([imageStartX, imageStartX + this.imWidth * scale]);
    }

    show(data) {
        this.data = data;
        for (var i  = 0; i < this.data.words.length; i++) {
            this.data.words[i].num = i;
        }
        var img = new Image();
        var that = this;
        
        img.onload = function() {            
            that.makeScales(this.height, this.width, data.words.length);
            that.render();
        }
        img.src = `img/${data.img}`;
    }


    renderImage() {
        var base = this.base.selectAll("g.image")
            .data(d => [d])
            .enter()
            .append("g")
            .classed("image", true);
        
        for (var i = 0; i <= this.yImSteps; i++) {
            base.insert("line", ":first-child")
                .classed("grid_line", true)
                .call(line((d,j) => [min_pt(this.xImScale),
                                     this.yImScale(i),
                                     max_pt(this.xImScale),
                                     this.yImScale(i)]));
        }
        
        for (var i = 0; i <= this.xImSteps; i++) {
            base.insert("line", ":first-child")
                .classed("grid_line", true)
                .call(line((d,j) =>
                           [this.xImScale(i),
                            min_pt(this.yImScale),
                            this.xImScale(i),
                            max_pt(this.yImScale)]));
        }

        base.insert("image", ":first-child")
            .attr("xlink:href", d => `img/${d.img}`)
            .attr("x", min_pt(this.xImScale))
            .attr("y", min_pt(this.yImScale))
            .attr("width", span(this.xImScale) )
            .attr("height", span(this.yImScale));

    }

    renderHeatMap(focus) {
        if (ignore_symbols(this.data.words[focus].word))
            return;
        
        var base = this.base.selectAll("rect")
                .data(this.data.words[focus].scores,
                      d => `${d.row} ${d.col}`);
        
        base.enter()
            .append("rect")
            .attr("width", step(this.xImScale))
            .attr("height", step(this.yImScale))
            .attr("x", d => this.xImScale(d.col-1))
            .attr("y", d => this.yImScale(d.row-1));
         
        base.exit().remove();
        
        base.style("fill", "red")
            .transition()
            .duration(100)
            .style("opacity", d => d.score / 2);
    }


    renderText(cutoff) {
        var base = this.base.selectAll("g.words")
                .data(d => d.words.slice(0, cutoff), d => d.num);
        
        // Update
        base.selectAll("text")
            .transition()
            .duration(200)
            .style("font-weight", "normal")
            .style("font-size", "25px")
            .attr("transform", d =>
                  tr(this.xScale(d.num), this.yScale(1)) + "rotate(-50)")  
            .text(d => d.word);

        // Enter
        var base_ent = base.enter()
                .append("g")
                .classed("words", true);

        base_ent.append("text")
            .classed("latex", true)
            .classed("active", true)
            .attr("transform", (d, i) => tr(this.xScale(i), this.yScale(1)))
            .on("mouseover", d => this.renderHeatMap(d.num + 1))
            .style("opacity", 0)
            .text(d => d.word)
            .transition()
            .delay(100)
            .style("opacity", 1);

        base_ent.append("line")
            .classed("latex_pointer", true)
            .classed("blank", d => ignore_symbols(d.word))
            .call(line((d, i) => [this.xScale(i),
                                this.yScale(1) + 10,
                                this.xImScale(d.exp_col - 0.5),
                                this.yImScale(d.exp_row - 0.5)]));
        
    }

    
    render() {
        this.base = this.container
            .selectAll("g.base")
            .data([this.data], d => d.img);
        
        this.base.enter()
            .append("g").classed("base", true);
        this.base.exit().remove();
        
        this.renderImage();
    }
}



d3.json("vis.json", (error, data) => {
    all_data = data;
    var im = 10;
    var cur = 0;
    var atten = new Attention("#im2latex");


    
    var show = (im, cur) => {
        atten.show(all_data[im]);
        cur = 0;
    
    };
    d3.select("#im2latexbuttons").insert("a", ":first-child").text("next").on("click", () => { im++; show(im); return false;} );
    d3.select("#im2latexbuttons").insert("a", ":first-child").text("last").on("click", () => { im--; show(im); return false;} );
    show(im);
    setInterval(() => { cur++;
                        atten.renderText(cur);
                        atten.renderHeatMap(cur);},
                500);

});

var width = 1300;
var height = 700;
