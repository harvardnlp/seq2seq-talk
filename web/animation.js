var mystack = stack();
    // .on("activate", activate)
    // .on("deactivate", deactivate);

// var deptree = d3.select("#deptree");
// var depsvg = deptree.append("svg");

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




var conll = "1	I	_	PRP	PRP	_	2	nsubj	_	_\n\
2	thought	_	VB	VBD	_	0	null	_	_\n\
3	it	_	PRP	PRP	_	5	nsubj	_	_\n\
4	was	_	VB	VBD	_	5	cop	_	_\n\
5	clear	_	JJ	JJ	_	2	ccomp	_	_\n\
6	,	_	,	,	_	2	punct	_	_\n\
7	but	_	CC	CC	_	2	cc	_	_\n\
8	you	_	PRP	PRP	_	9	nsubj	_	_\n\
9	know	_	VB	VBP	_	2	conj	_	_\n\
10	,	_	,	,	_	12	punct	_	_\n\
11	I	_	PRP	PRP	_	12	nsubj	_	_\n\
12	know	_	VB	VBP	_	2	ccomp	_	_\n\
13	what	_	WP	WP	_	16	dobj	_	_\n\
14	I	_	PRP	PRP	_	16	nsubj	_	_\n\
15	'm	_	VB	VBP	_	16	aux	_	_\n\
16	running	_	VB	VBG	_	12	ccomp	_	_"

console.log(conll)
var data = parseConll(conll)
svg = d3.select("#deptree");
svg.selectAll('text, path').remove();
svg.attr('width', 1500).attr('height', 500);
base = svg.append("g").attr("transform", "scale(0.5)");
treeInfo(data);
drawWords(base, data);
addTags(base, data);
drawArcs(base, data);

svg = d3.select("#deptree0");
svg.selectAll('text, path').remove();
svg.attr('width', 1500).attr('height', 500);
base = svg.append("g").attr("transform", "scale(0.5)");
treeInfo(data);
drawWords(base, data);
addTags(base, data);

const Event_list = {
    threshold_update: 'threshold_update',
    cell_hovered: 'cell_hovered',
    new_page: 'new_page',
    clear_selection:'clear_selection'
};

d3.json("draw.json", function(error, data) {
    console.log(error);

    function draw (place, size) {
        var selected = [];
        var excluded = [];
        for (var i = 0 ;i < size; ++i) {
            selected.push(i);
        }
        data.draw_data = data.draw_data.slice(0, size);
        data.selected_cells = selected;
        console.log(data);
        data.threshold = 0;
        pcplot = new PCPlot(place, 50, 50, data,// {excluded_cells: [],
                            //                   selected_cells: [1,2,3],
                            //                   brush :[0,0],
                            //                   threshold: 1,
                            //                   draw_data: [{values : [0.1,0.2,0.3,0.4], index: 1},
                            //                               {index: 2, values: [0.3,0.2,0.4,0.1]},
                            //                               {index: 3, values: [0.3,0.2,-0.4,-0.1]} ]},
                            {wordBrushScale: d3.scale.linear().domain([0,5]).range([0, 100]),
                             xScale : d3.scale.linear().domain([0,10]).range([0, 1000]),
                             yScale : d3.scale.linear().domain([1,-1]).range([0, 250]),
                             hover_event_name: Event_list.cell_hovered
                            } );
        
        
        var eventHandler = $({});
        // event_handler.bind("trigger", function() {})
        
        eventHandler.bind('cell_hovered', function (e, data) {
            d3.select(place).selectAll('.cell_' + data.cell).classed('hover', data.active);
        });
        
        pcplot.bind_event_handler(eventHandler);
        pcplot.redraw({});
        base = d3.select(place).append("g").attr("id", "b2").attr("transform", "translate("+(50 +125) +","+ (50 + 250 + 25) +")")
        update_words(d3.select("#b2"), ["I", "thought", "it", "was ", "clear", "but", "you", "know", "..."],
                     d3.scale.linear().domain([0,10]).range([0,1000]), 10);
    }
    draw("#lstm3", 200);
    draw("#lstm2", 50);
    draw("#lstm", 5);
    draw("#lstm0", 1);

    
});

// animationIM("#im2latex");

