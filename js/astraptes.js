function fusionSummary(checked) {
    if (checked) {
        var chartwidth = 600,
            chartheight = 300;
        var margin = {
                top: 20,
                right: 20,
                bottom: 30,
                left: 50
            },
            width = chartwidth - margin.left - margin.right,
            height = chartheight - margin.top - margin.bottom;

        var stock, species;
        
        // Date format for astraptes.json:  9/11/2005
        var parse = d3.time.format("%m/%d/%Y").parse;

        var x = d3.time.scale()
            .range([margin.left, width]);

        var y = d3.scale.linear()
            .range([height, margin.top]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .tickSize(-height)
            .tickSubdivide(true)
            .orient("bottom");

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");

        var line = d3.svg.line()
            .x(function(d) {
                return x(d.eclosion);
            })
            .y(function(d) {
                return y(d.wingspan);
            });

        d3.json("dat/astraptes.json", function(data) {

            // Nest stock values by symbol.
            species = d3.nest()
                .key(function(d) {
                    return d.species;
                })
                .entries(stocks = data);

            // Parse dates and numbers. We assume values are sorted by date.
            // Also compute the maximum price per symbol, needed for the y-domain.
            species.forEach(function(s) {

                s.values.forEach(function(d) {
                    d.eclosion = parse(d.eclosion);
                    d.latitude = +d.latitude;
                    d.longitude = +d.longitude;
                    d.year = +d.year;
                    d.wingspan = +d.wingspan;
                    d.elevation = +d.elevation;
                    //d.plant_species;
                    //d.plant_family;
                    //d.primary_eco;
                    //d.species;
                    //d.url_catepillar;
                    //d.url_adult;
                    //d.voucher;
                    //d.sex;
                });

                s.y_extents = d3.extent(s.values, function(d) {
                    return d.wingspan;
                });

                s.x_extents = d3.extent(s.values, function(d) {
                    return d.eclosion;
                });

                // Sort each species by eclosion data, ascending
                s.values.sort(function(a, b) {
                    return a.eclosion - b.eclosion;
                });
                
                var svg = d3.select("body").append("svg").data([s])
                    .attr("class", function(d) {
                        return d.key;
                    })
                    .attr("width", chartwidth)
                    .attr("height", chartheight)
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                x.domain(s.x_extents)
                y.domain(s.y_extents)

                svg.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0," + height + ")")
                    .call(xAxis);

                svg.append("g")
                    .attr("class", "y axis")
                    .attr("transform", "translate("+margin.left+",0)")
                    .call(yAxis)
                    .append("text")
                    .attr("transform", "rotate(-90)")
                    .attr("x", -height/2)
                    .attr("y", -margin.left)
                    .attr("dy", ".75em")
                    .style("text-anchor", "end")
                    .text("Wingspan");

                svg.append("path")
                    .datum(function(d) {
                        return d.values;
                    })
                    .attr("class", "line")
                    .attr("d", line);

                // Add a small label for the symbol name.
                svg.append("text")
                    .attr("x", width/2)
                    .attr("y", height + margin.bottom)
                    .style("text-anchor", "middle")
                    .text(function(d) {
                        return d.key
                    });
            });
        });
    }
}