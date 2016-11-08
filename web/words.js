class WordVectors {
    constructor(base, data_vecs, width, height, fontSize) {
        var xex = d3.extent(data_vecs, d => d.tsne[0]);
        var yex = d3.extent(data_vecs, d => d.tsne[1]);
        var pad = 200;
        this.xScale = d3.scale.linear()
            .domain(xex)
            .range([pad, width - pad]);
        this.yScale = d3.scale.linear()
            .domain(yex)
            .range([pad, height - pad]);
        this.fontSize = fontSize;
        
        this.initialize(base);
        this.update(data_vecs);
    }

    initialize(base) {   
        this.zoom = d3.behavior.zoom()
            .x(this.xScale).y(this.yScale)
            .scaleExtent([1, 10])
            .on("zoom", () => this.render());

        this.container = d3.select(base)
            .append('g');

        this.container.append("rect")
            .attr("width", width)
            .attr("height", height)
            .style("stroke", "black")
            .style("fill", "white");
        
        this.container.call(this.zoom);
    }
    
    update(data_vecs) {
        this.data_vecs = data_vecs;
        this.render();
    }
    
    render() {
        var dots = this.container.selectAll('.dots')
                .data(this.data_vecs, d => d.word);

        
        dots.exit().remove();

        dots.transition()
            .attr("transform", d =>
                  { var scale = this.zoom.scale()*0.5;
                    if (d.marked) 
                        scale = this.zoom.scale()*5;
                    return  `translate(${this.xScale(d.tsne[0])},
                                       ${this.yScale(d.tsne[1])})
                             scale(${scale})`; });

        // Enter
        dots.enter()
            .append("text")
            .classed("dots", true)
            .classed("marked", d => d.marked)
            .style("opacity", d => d.fade)
            .text(d => d.word)
            .attr("transform",
                  d => `translate(${this.xScale(d.tsne[0])},
                                  ${this.yScale(d.tsne[1])})
                        scale(0.5)`)
            .style("font-size", `${this.font_size}pt`)
            .on("click", d => {d.marked = true;
                               this.render();});
    }
}

var width = 1300;
var height = 700;

d3.json("words.json", (error, data) => {
    new WordVectors("#wordvecs", data, width, height, 10);});


d3.json("words.json", (error, data) => {
    for (var i = 0; i < data.length; i++) {
        if (data[i].word != "know" && data[i].word != "feel" && data[i].word != "are" && data[i].word != "want" && data[i].word != "believe") {
            data[i].fade = true;

        } 
    }
    data.push({word: "RNN", vals: [0.0,0.0],
               tsne: [-5.0,8.0], marked: false});
    new WordVectors("#score", data, width, height, 30);;
});
