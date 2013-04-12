var col;

$().ready(function() {

	vistaCarreras = new VistaCarreras2({el:"#carreras"});

	window.testView = vistaCarreras;


});



var VistaCarreras2 = Backbone.View.extend({
	el:"body",

	events: {
        'mouseenter .node-dot': 'mouseovernode',
        'mouseleave .node-dot': 'mouseleavenode'
    },

    mouseovernode: function(e) {
    	var selectednode= d3.select(e.target).attr("fill","yellow");
    	datum = selectednode.datum();
        $("#msg").html(datum.CARRERA + "-"+datum.INSTITUCION+" ("+datum.ACREDITACION_CARRERA+")");
        //this.tooltip.html(datum.CARRERA + "-"+datum.INSTITUCION+" ("+datum.ACREDITACION_CARRERA+")");


    },

    mouseleavenode: function(e) {
    	d3.select(e.target).attr("fill","black");
    	datum = d3.select(e.target).datum();
        $("#msg").html(".");
    },

	
	initialize: function() {
		$this = this;

		$(this.el).html("Cargando datos ...");
		d3.tsv("./oa2012sies.txt", function(d) {
			$this.datacarreras = d;
			$this.render();
		})
	},
	
	render: function() {
		$element = this.$el;

		$element.html("");

		this.tooltip = d3.select(this.el).append("div");

		// Ordenar datos por tipo de acreditación
		var data = _.sortBy(this.datacarreras, function(d) {return d.ACREDITACION_CARRERA});		

		// Incluir encabezado
		this.$el.append("<h3>Carreras de pregrado en Chile</h3>");(this.el)
		
		leyenda = d3.select(this.el).append("svg").attr("height", 20);

		leyenda.append("rect")
			.attr("y", 10)
			.attr("x", 0)
			.attr("class", "node-dot acreditada")
		    .attr("width", 8)
		    .attr("height", 8);
		    
		leyenda.append("text")
			.attr("y","20")
			.attr("x","20")
			.attr("height",20)
			.text("Acredidata");

		leyenda.append("rect")
			.attr("y", 10)
			.attr("x", 100)
			.attr("class", "node-dot noAcreditada")
		    .attr("width", 8)
		    .attr("height", 8);
		    
		leyenda.append("text")
			.attr("y","20")
			.attr("x","120")
			.attr("height",20)
			.text("No Acredidata");


	

		d3.select(this.el).append("g")
			.attr("height", 20)
			.append("text")
			.attr("id","msg")
			.attr("height",20)
			.text(".");


		// Generar arreglos con datos por tipo de institución
		var dataIP =  _.filter(data, function(d) {return d.TIPO_INSTITUCION=="INSTITUTO PROFESIONAL"});
		var dataUParticular =  _.filter(data, function(d) {return d.TIPO_INSTITUCION=="UNIVERSIDAD PARTICULAR"});
		var dataUEstatal =  _.filter(data, function(d) {return d.TIPO_INSTITUCION=="UNIVERSIDAD ESTATAL"});
		var dataCFT =  _.filter(data, function(d) {return d.TIPO_INSTITUCION=="CENTRO DE FORMACIÓN TÉCNICA"});
		var dataUParticularConAporte =  _.filter(data, function(d) {return d.TIPO_INSTITUCION=="UNIVERSIDAD PARTICULAR CON APORTE"});

		// Parámetros generales
		var width = 800
		var radious = 2.5

		// Calcular el ancho de cada grupo tipo de IE como proporción del ancho total
		var widthCFT = Math.ceil(width*dataCFT.length/data.length);
		var widthIP = Math.ceil(width*dataIP.length/data.length);
		var widthUEstatal= Math.ceil(width*dataUEstatal.length/data.length);
		var widthUParticular = Math.ceil(width*dataUParticular.length/data.length);
		var widthUParticularConAporte= Math.ceil(width*dataUParticularConAporte.length/data.length);

		// Calcular posición x de cada tipo de IE
		var uMargin = 3
		var xCFT = 0;
		var xIP = xCFT+widthCFT+uMargin;
		var xUEstatal = xIP+widthIP+uMargin;
		var xUParticularConAporte = xUEstatal+widthUEstatal+uMargin;
		var xUParticular = xUParticularConAporte+widthUParticularConAporte+uMargin;

		

		// Contenedor principal para todos los tipos de IE
		var svgRoot= d3.select(this.el).append("svg").attr("height", 550);

		// Genera el contenedor para cada tipo de IE y construyye la vista asociada
		var svgIP = svgRoot.append("svg").attr("x", xCFT).attr("class","pixelmaps CFT");
		var pixelMap = new VistaCarrerasPixelMapV({el:"svg.pixelmaps.CFT", data: dataCFT, width:widthCFT, radious:radious, label:"CFT"});

		var svgIP = svgRoot.append("svg").attr("x", xIP).attr("class","pixelmaps IP");
		var pixelMap = new VistaCarrerasPixelMapV({el:"svg.pixelmaps.IP", data: dataIP, width:widthIP, radious:radious, label:"IP"});

		var svgUEstatal = svgRoot.append("svg").attr("x", xUEstatal).attr("class","pixelmaps UEstatal");
		var pixelMap = new VistaCarrerasPixelMapV({el:"svg.pixelmaps.UEstatal", data: dataUEstatal, width:widthUEstatal, radious:radious, label:"U. Estatal"});

		var svgUParticularConAporte = svgRoot.append("svg").attr("x", xUParticularConAporte).attr("class","pixelmaps UParticularConAporte");
		var pixelMap = new VistaCarrerasPixelMapV({el:"svg.pixelmaps.UParticularConAporte", data: dataUParticularConAporte, width:widthUParticularConAporte, radious:radious, label:"U. Part.", label2:"c/Aporte"});

		var svgUParticular = svgRoot.append("svg").attr("x", xUParticular).attr("class","pixelmaps UParticular");
		var pixelMap = new VistaCarrerasPixelMapV({el:"svg.pixelmaps.UParticular", data: dataUParticular, width:widthUParticular, radious:radious, label:"U. Particular"});

		$footer = $("<div>Fuente: http://www.mifuturo.cl/images/Base_de_datos/Oferta_academica/oapregrado2012.rar (16464 registros)</div>");
		$element.append($footer);
	}



});


var VistaCarrerasPixelMapV = Backbone.View.extend({
	el:"svg",



	initialize: function() {
		this.data = (this.options && this.options.data) ? this.options.data : [];
		this.width = (this.options && this.options.width) ? this.options.width : 1000;
		this.radious = (this.options && this.options.radious) ? this.options.radious : 3;
		this.maxColumns = Math.floor(this.width/(this.radious*2));
		this.maxRows = Math.ceil(this.data.length/this.maxColumns);
		this.indent = (this.options && this.options.indent) ? this.options.indent : 0;
		this.label = (this.options && this.options.label) ? this.options.label : "";
		this.label2 = (this.options && this.options.label2) ? this.options.label2 : "";
		this.tooltip = $("<div>");
		this.render();
	},

	render: function() {
		var data = this.data;
		var maxColumns = this.maxColumns;
		var radious = this.radious;
		var maxRows = this.maxRows;

		var w = this.width;
		var h = maxRows*radious*2+radious;

		var svg = d3.select(this.el).attr("width", w).attr("height", h)

		label1 = svg.append("text")
			.text(this.label)
			.attr("font-family", "sans-serif")
			.attr("x", "0").attr("y", "20")
          	.attr("font-size", "10px")
            .attr("fill", "gray");

        if (this.label2) {
        	label1.attr("y", "10")
        	svg.append("text")
				.text(this.label2)
				.attr("font-family", "sans-serif")
				.attr("x", "0").attr("y", "20")
	          	.attr("font-size", "10px")
	            .attr("fill", "gray");
        }


		this.nodes = svg.selectAll("rect.node-dot")
		     .data(data, function(d) { return d.CODIGO_UNICO; })
		     .enter()
		     	.append("svg:rect")
		     	.attr("class", "node-dot")
		     	.attr("width", radious)
		     	.attr("height", radious)
		     	.attr("class", function(d) {
					var myclass = "node-dot";
					myclass += d.ACREDITACION_CARRERA=="Acreditada" ? " acreditada" : " noAcreditada";
					return myclass;
				})
		     	.attr("x", function(d, i)
		     	{
		     		var row = Math.floor(i/maxColumns);
		     		var col = i % maxColumns;
		     		var x = col*radious*2 + radious;
		     		var y = row*radious*2 + radious;
		     		return x;
		     	})
		     	.attr("y", function(d, i)
		     	{
		     		var row = Math.floor(i/maxColumns);
		     		var col = i % maxColumns;
		     		var x = col*radious*2 + radious;
		     		var y = row*radious*2 + radious;
		     		return y+20;
		     	})

		this.tooltip = svg.append("text")





	}

})
