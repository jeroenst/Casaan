// version: 2017-01-02
    /**
    * o--------------------------------------------------------------------------------o
    * | This file is part of the RGraph package - you can learn more at:               |
    * |                                                                                |
    * |                          http://www.rgraph.net                                 |
    * |                                                                                |
    * | RGraph is licensed under the Open Source MIT license. That means that it's     |
    * | totally free to use!                                                           |
    * o--------------------------------------------------------------------------------o
    */

    RGraph = window.RGraph || {isRGraph: true};
    RGraph.SVG = RGraph.SVG || {};

// Module pattern
(function (win, doc, undefined)
{
    var RG  = RGraph,
        ua  = navigator.userAgent,
        ma  = Math,
        win = window,
        doc = document;



    RG.SVG.Bar = function (conf)
    {
        this.id               = conf.id;
        this.uid              = RG.SVG.createUID();
        this.container        = document.getElementById(this.id);
        this.svg              = RG.SVG.createSVG({container: this.container});
        this.isRGraph         = true;
        this.width            = Number(this.svg.getAttribute('width'));
        this.height           = Number(this.svg.getAttribute('height'));
        this.data             = conf.data;
        this.type             = 'bar';
        this.coords           = [];
        this.stackedBackfaces = [];
        this.colorsParsed     = false;
        this.originalColors   = {};
        this.gradientCounter  = 1;
        
        // Add this object to the ObjectRegistry
        RG.SVG.OR.add(this);
        
        this.container.style.display = 'inline-block';

        this.properties =
        {
            gutterLeft:   35,
            gutterRight:  35,
            gutterTop:    35,
            gutterBottom: 35,

            backgroundGrid:             true,
            backgroundGridColor:        '#ddd',
            backgroundGridLinewidth:    1,
            backgroundGridHlines:       true,
            backgroundGridHlinesCount:  null,
            backgroundGridVlines:       true,
            backgroundGridVlinesCount:  null,
            backgroundGridBorder:       true,
            
            // 20 colors. If you need more you need to set the colors property
            colors: [
                'red', '#0f0', '#00f', '#ff0', '#0ff', '#0f0','pink','orange','gray','black',
                'red', '#0f0', '#00f', '#ff0', '#0ff', '#0f0','pink','orange','gray','black'
            ],
            colorsSequential:     false,
            strokestyle:          'rgba(0,0,0,0)',
            
            hmargin:              3,
            hmarginGrouped:       2,

            yaxis:                true,
            yaxisTickmarks:       true,
            yaxisTickmarksLength: 3,
            yaxisColor:           'black',
            
            yaxisScale:           true,
            yaxisLabels:          null,
            yaxisLabelsOffsetx:   0,
            yaxisLabelsOffsety:   0,
            yaxisLabelsCount:     5,
            
            yaxisUnitsPre:        '',
            yaxisUnitsPost:       '',
            yaxisStrict:          false,
            yaxisDecimals:        0,
            yaxisPoint:           '.',
            yaxisThousand:        ',',
            yaxisRound:           false,
            yaxisMax:             null,
            yaxisMin:             0,
            yaxisFormatter:       null,

            xaxis:                true,
            xaxisTickmarks:       true,
            xaxisTickmarksLength: 3,
            xaxisLabels:          null,
            xaxisLabelsPosition:  'section',
            xaxisLabelsPositionEdgeTickmarksCount: null,
            xaxisColor:           'black',
            xaxisLabelsOffsetx:   0,
            xaxisLabelsOffsety:   0,
            
            labelsAbove:                  false,
            labelsAboveFont:              null,
            labelsAboveSize:              null,
            labelsAboveBold:              null,
            labelsAboveItalic:            null,
            labelsAboveColor:             null,
            labelsAboveBackground:        null,
            labelsAboveBackgroundPadding: 0,
            labelsAboveUnitsPre:          null,
            labelsAboveUnitsPost:         null,
            labelsAbovePoint:             null,
            labelsAboveThousand:          null,
            labelsAboveFormatter:         null,
            labelsAboveDecimals:          null,
            labelsAboveOffsetx:           0,
            labelsAboveOffsety:           0,
            labelsAboveHalign:            'center',
            labelsAboveValign:            'bottom',
            
            textColor:            'black',
            textFont:             'sans-serif',
            textSize:             12,
            textBold:             false,
            textItalic:           false,

            linewidth:            1,
            grouping:             'grouped',
            
            tooltips:             null,
            tooltipsOverride:     null,
            tooltipsEffect:       'fade',
            tooltipsCssClass:     'RGraph_tooltip',
            tooltipsEvent:        'click',

            highlightStroke:      'rgba(0,0,0,0)',
            highlightFill:        'rgba(255,255,255,0.7)',
            highlightLinewidth:   1,
            
            title:                '',
            titleSize:            16,
            titleX:               null,
            titleY:               null,
            titleHalign:          'center',
            titleValign:          'bottom',
            titleColor:           'black',
            titleFont:            null,
            titleBold:            false,
            titleItalic:          false,
            
            titleSubtitle:        '',
            titleSubtitleSize:    10,
            titleSubtitleX:       null,
            titleSubtitleY:       null,
            titleSubtitleHalign:  'center',
            titleSubtitleValign:  'top',
            titleSubtitleColor:   '#aaa',
            titleSubtitleFont:    null,
            titleSubtitleBold:    false,
            titleSubtitleItalic:  false,
            
            shadow:               false,
            shadowOffsetx:        2,
            shadowOffsety:        2,
            shadowBlur:           2,
            shadowOpacity:        0.25,
            
            attribution:        true,
            attributionX:       null,
            attributionY:       null,
            attributionHref:    'http://www.rgraph.net/svg/index.html',
            attributionHalign:  'right',
            attributionValign:  'bottom',
            attributionSize:    8,
            attributionColor:   'gray',
            attributionFont:    'sans-serif',
            attributionItalic:  false,
            attributionBold:    false
        };





        /**
        * "Decorate" the object with the generic effects if the effects library has been included
        */
        if (RG.SVG.FX && typeof RG.SVG.FX.decorate === 'function') {
            RG.SVG.FX.decorate(this);
        }




        var prop = this.properties;





        //
        // A setter that the constructor uses (at the end)
        // to set all of the properties
        //
        // @param string name  The name of the property to set
        // @param string value The value to set the property to
        //
        this.set = function (name, value)
        {
            if (arguments.length === 1 && typeof name === 'object') {
                for (i in arguments[0]) {
                    if (typeof i === 'string') {
                        this.set(i, arguments[0][i]);
                    }
                }
            } else {
                this.properties[name] = value;
            }

            return this;
        };








        //
        // The draw method draws the Bar chart
        //
        this.draw = function ()
        {
            // Fire the beforedraw event
            RG.SVG.fireCustomEvent(this, 'onbeforedraw');




            // Create the defs tag if necessary
            RG.SVG.createDefs(this);





            this.graphWidth  = this.width - prop.gutterLeft - prop.gutterRight;
            this.graphHeight = this.height - prop.gutterTop - prop.gutterBottom;



            /**
            * Parse the colors. This allows for simple gradient syntax
            */
            if (!this.colorsParsed) {
                this.parseColors();
                
                // Don't want to do this again
                this.colorsParsed = true;
            }



            // Go through the data and work out the maximum value
            var values = [];

            for (var i=0,max=0; i<this.data.length; ++i) {
                if (typeof this.data[i] === 'number') {
                    values.push(this.data[i]);
                
                } else if (RG.SVG.isArray(this.data[i]) && prop.grouping === 'grouped') {
                    values.push(RG.SVG.arrayMax(this.data[i]));

                } else if (RG.SVG.isArray(this.data[i]) && prop.grouping === 'stacked') {
                    values.push(RG.SVG.arraySum(this.data[i]));
                }
            }
            var max = RG.SVG.arrayMax(values);

            // A custom, user-specified maximum value
            if (typeof prop.yaxisMax === 'number') {
                max = prop.yaxisMax;
            }
            
            // Set the ymin to zero if it's szet mirror
            if (prop.yaxisMin === 'mirror' || prop.yaxisMin === 'middle' || prop.yaxisMin === 'center') {
                var mirrorScale = true;
                prop.yaxisMin   = 0;
            }


            //
            // Generate an appropiate scale
            //
            this.scale = RG.SVG.getScale({
                object:    this,
                numlabels: prop.yaxisLabelsCount,
                unitsPre:  prop.yaxisUnitsPre,
                unitsPost: prop.yaxisUnitsPost,
                max:       max,
                min:       prop.yaxisMin,
                point:     prop.yaxisPoint,
                round:     prop.yaxisRound,
                thousand:  prop.yaxisThousand,
                decimals:  prop.yaxisDecimals,
                strict:    typeof prop.yaxisMax === 'number',
                formatter: prop.yaxisFormatter
            });
                


            //
            // Get the scale a second time if the ymin should be mirored
            //
            // Set the ymin to zero if it's szet mirror
            if (mirrorScale) {
                this.scale = RG.SVG.getScale({
                    object: this,
                    numlabels: prop.yaxisLabelsCount,
                    unitsPre:  prop.yaxisUnitsPre,
                    unitsPost: prop.yaxisUnitsPost,
                    max:       this.scale.max,
                    min:       this.scale.max * -1,
                    point:     prop.yaxisPoint,
                    round:     false,
                    thousand:  prop.yaxisThousand,
                    decimals:  prop.yaxisDecimals,
                    strict:    typeof prop.yaxisMax === 'number',
                    formatter: prop.yaxisFormatter
                });
            }

            // Now the scale has been generated adopt its max value
            this.max      = this.scale.max;
            this.min      = this.scale.min;
            prop.yaxisMax = this.scale.max;
            prop.yaxisMin = this.scale.min;




            // Draw the background first
            RG.SVG.drawBackground(this);

            // Draw the bars
            this.drawBars();


            // Draw the axes over the bars
            RG.SVG.drawXAxis(this);
            RG.SVG.drawYAxis(this);
            
            
            // Draw the labelsAbove labels
            this.drawLabelsAbove();



            
            
            // Add the attribution link. If you're adding this elsewhere on your page/site
            // and you don't want it displayed then there are options available to not
            // show it.
            RG.SVG.attribution(this);




            // Add the event listener that clears the highlight rect if
            // there is any. Must be MOUSEDOWN (ie before the click event)
            var obj = this;
            document.body.addEventListener('mousedown', function (e)
            {
                RG.SVG.removeHighlight(obj);

            }, false);



            // Fire the draw event
            RG.SVG.fireCustomEvent(this, 'ondraw');




            return this;
        };








        //
        // Draws the bars
        //
        this.drawBars = function ()
        {
            var y = this.getYCoord(0);

            if (prop.shadow) {
                RG.SVG.setShadow({
                    object:  this,
                    offsetx: prop.shadowOffsetx,
                    offsety: prop.shadowOffsety,
                    blur:    prop.shadowBlur,
                    opacity: prop.shadowOpacity,
                    id:      'dropShadow'
                });
            }

            // Go through the bars
            for (var i=0,sequentialIndex=0; i<this.data.length; ++i,++sequentialIndex) {

                //
                // Regular bars
                //
                if (typeof this.data[i] === 'number') {

                    var outerSegment = this.graphWidth / this.data.length,
                        height       = ma.abs((this.data[i] / (this.max - this.min)) * this.graphHeight),
                        width        = (this.graphWidth / this.data.length) - prop.hmargin - prop.hmargin,
                        x            = prop.gutterLeft + prop.hmargin + (outerSegment * i),
                        y            = this.getYCoord(0);

                    var rect = RG.SVG.create({
                        svg: this.svg,
                        type: 'rect',
                        attr: {
                            stroke: prop.strokestyle,
                            fill: prop.colorsSequential ? (prop.colors[sequentialIndex] ? prop.colors[sequentialIndex] : prop.colors[prop.colors.length - 1]) : prop.colors[0],
                            x: x,
                            y: y - (this.data[i] >  0 ? height : 0),
                            width: width,
                            height: height,
                            'stroke-width': prop.linewidth,
                            'data-tooltip': (!RG.SVG.isNull(prop.tooltips) && prop.tooltips.length) ? prop.tooltips[i] : '',
                            'data-index': i,
                            'data-sequential-index': sequentialIndex,
                            'data-value': this.data[i],
                            filter: prop.shadow ? 'url(#dropShadow)' : ''
                        }
                    });

                    this.coords.push({
                        object: rect,
                        x:      x,
                        y:      y - (this.data[i] >  0 ? height : 0),
                        width:  width,
                        height: height
                    });







                    // Add the tooltip data- attribute
                    if (!RG.SVG.isNull(prop.tooltips) && prop.tooltips[sequentialIndex]) {

                        var obj = this;

                        //
                        // Add tooltip event listeners
                        //
                        (function (idx, seq)
                        {
                            rect['on' + prop.tooltipsEvent] = function (e)
                            {
                                // Hide any existing tooltip
                                RG.SVG.hideTooltip();

                                // Show the tooltip
                                RG.SVG.tooltip({
                                    object: obj,
                                    index: idx,
                                    group: null,
                                    sequentialIndex: seq,
                                    text: prop.tooltips[seq],
                                    event: e
                                });
                                
                                // Highlight the rect that has been clicked on
                                obj.highlight(e.target);
                            };
                            
                            rect.onmousemove = function (e)
                            {
                                e.target.style.cursor = 'pointer'
                            };
                        })(i, sequentialIndex);
                    }





                //
                // Grouped bars
                //
                } else if (RG.SVG.isArray(this.data[i]) && prop.grouping === 'grouped') {

                    var outerSegment = (this.graphWidth / this.data.length),
                        innerSegment = outerSegment - (2 * prop.hmargin);

                    // Loop through the group
                    for (var j=0; j<this.data[i].length; ++j,++sequentialIndex) {

                        var height = ma.abs((this.data[i][j] / (this.max - this.min)) * this.graphHeight),
                            width  = ( (innerSegment - ((this.data[i].length - 1) * prop.hmarginGrouped)) / this.data[i].length),
                            x      = (outerSegment * i) + prop.hmargin + prop.gutterLeft + (j * width) + ((j - 1) * prop.hmarginGrouped);
                        
                        x = prop.gutterLeft + (outerSegment * i) + (width * j) + prop.hmargin + (j * prop.hmarginGrouped);

                        var rect = RG.SVG.create({
                            svg: this.svg,
                            type: 'rect',
                            attr: {
                                stroke: prop['strokestyle'],
                                fill: (prop.colorsSequential && prop.colors[sequentialIndex]) ? prop.colors[sequentialIndex] : prop.colors[j],
                                x: x,
                                y: y - (this.data[i][j] >  0 ? height : 0),
                                width: width,
                                height: height,
                                'stroke-width': prop.linewidth,
                                'data-index': i,
                                'data-sequential-index': sequentialIndex,
                                'data-tooltip': (!RG.SVG.isNull(prop.tooltips) && prop.tooltips.length) ? prop.tooltips[sequentialIndex] : '',
                                'data-value': this.data[i][j],
                                filter: prop.shadow ? 'url(#dropShadow)' : ''
                            }
                        });
                    
                        this.coords.push({
                            object: rect,
                            x:      x,
                            y:      y - (this.data[i][j] >  0 ? height : 0),
                            width:  width,
                            height: height
                        });



                        // Add the tooltip data- attribute
                        if (!RG.SVG.isNull(prop.tooltips) && prop.tooltips[sequentialIndex]) {
                        
                            var obj = this;
    
                        
                            //
                            // Add tooltip event listeners
                            //
                            (function (idx, seq)
                            {
                                var indexes = RG.SVG.sequentialIndexToGrouped(seq, obj.data);

                                rect['on' + prop.tooltipsEvent] = function (e)
                                {
                                    // Show the tooltip
                                    RG.SVG.tooltip({
                                        object: obj,
                                        group: idx,
                                        index: indexes[1],
                                        sequentialIndex: seq,
                                        text: prop.tooltips[seq],
                                        event: e
                                    });
                                    
                                    // Highlight the rect that has been clicked on
                                    obj.highlight(e.target);
    
                                };
                                
                                rect.onmousemove = function (e)
                                {
                                    e.target.style.cursor = 'pointer'
                                };
                            })(i, sequentialIndex);
                        }
                    }

                    --sequentialIndex;
                        

                    

                //
                // Stacked charts
                //
                } else if (RG.SVG.isArray(this.data[i]) && prop.grouping === 'stacked') {

                    var section = (this.graphWidth / this.data.length);

                    
                    // Intialise the Y coordinate to the bottom gutter
                    var y = this.getYCoord(0);

                    

                    // Loop through the stack
                    for (var j=0; j<this.data[i].length; ++j,++sequentialIndex) {

                        var height  = ma.abs((this.data[i][j] / (this.max - this.min)) * this.graphHeight),
                            width   = section - (2 * prop.hmargin),
                            x       = prop.gutterLeft + (i * section) + prop.hmargin,
                            y       = y - height;

                        // If this is the first iteration of the loop and a shadow
                        // is requested draw a rect here to create it.
                        if (j === 0 && prop.shadow) {
                            
                            var fullHeight = ma.abs((RG.SVG.arraySum(this.data[i]) / (this.max - this.min)) * this.graphHeight);

                            var rect = RG.SVG.create({
                                svg: this.svg,
                                type: 'rect',
                                attr: {
                                    fill: 'white',
                                    x: x,
                                    y: this.height - prop.gutterBottom - fullHeight,
                                    width: width,
                                    height: fullHeight,
                                    'stroke-width': 0,
                                    'data-index': i,
                                    filter: 'url(#dropShadow)'
                                }
                            });
                            
                            this.stackedBackfaces[i] = rect;
                        }



                        // Create the visible bar
                        var rect = RG.SVG.create({
                            svg: this.svg,
                            type: 'rect',
                            attr: {
                                stroke: prop['strokestyle'],
                                fill: prop.colorsSequential ? (prop.colors[sequentialIndex] ? prop.colors[sequentialIndex] : prop.colors[prop.colors.length - 1]) : prop.colors[j],
                                x: x,
                                y: y,
                                width: width,
                                height: height,
                                'stroke-width': prop.linewidth,
                                'data-index': i,
                                'data-sequential-index': sequentialIndex,
                                'data-tooltip': (!RG.SVG.isNull(prop.tooltips) && prop.tooltips.length) ? prop.tooltips[sequentialIndex] : '',
                                'data-value': this.data[i][j]
                            }
                        });


                        this.coords.push({
                            object: rect,
                            x:      x,
                            y:      y,
                            width:  width,
                            height: height
                        });



                        // Add the tooltip data- attribute
                        if (!RG.SVG.isNull(prop.tooltips) && prop.tooltips[sequentialIndex]) {
                        
                            var obj = this;
    
                        
                            //
                            // Add tooltip event listeners
                            //
                            (function (idx, seq)
                            {
                                rect['on' + prop.tooltipsEvent] = function (e)
                                {

                                    var indexes = RG.SVG.sequentialIndexToGrouped(seq, obj.data);

                                    // Show the tooltip
                                    RG.SVG.tooltip({
                                        object: obj,
                                        index: indexes[1],
                                        group: idx,
                                        sequentialIndex: seq,
                                        text: prop.tooltips[seq],
                                        event: e
                                    });
                                    
                                    // Highlight the rect that has been clicked on
                                    obj.highlight(e.target);
                                };
                                
                                rect.onmousemove = function (e)
                                {
                                    e.target.style.cursor = 'pointer'
                                };
                            })(i, sequentialIndex);
                        }
                    }

                    --sequentialIndex;
                }
            }
        };








        /**
        * This function can be used to retrieve the relevant Y coordinate for a
        * particular value.
        * 
        * @param int value The value to get the Y coordinate for
        */
        this.getYCoord = function (value)
        {
            var prop = this.properties;

            if (value > this.scale.max) {
                return null;
            }

            var y, xaxispos = prop.xaxispos;

                if (value < this.scale.min) {
                    return null;
                }

                y  = ((value - this.scale.min) / (this.scale.max - this.scale.min));
                y *= (this.height - prop.gutterTop - prop.gutterBottom);
    
                y = this.height - prop.gutterBottom - y;
            //}

            return y;
        };








        /**
        * This function can be used to highlight a bar on the chart
        * 
        * @param object rect The rectangle to highlight
        */
        this.highlight = function (rect)
        {
            var x      = rect.getAttribute('x'),
                y      = rect.getAttribute('y'),
                width  = rect.getAttribute('width'),
                height = rect.getAttribute('height');
            
            var highlight = RG.SVG.create({
                svg: this.svg,
                type: 'rect',
                attr: {
                    stroke: prop.highlightStroke,
                    fill: prop.highlightFill,
                    x: x,
                    y: y,
                    width: width,
                    height: height,
                    'stroke-width': prop.highlightLinewidth
                }
            });


            if (prop.tooltipsEvent === 'mousemove') {
                highlight.addEventListener('mouseout', function (e)
                {
                    highlight.parentNode.removeChild(highlight);
                    RG.SVG.hideTooltip();

                    RG.SVG.REG.set('highlight', null);
                }, false);
            }


            // Store the highlight rect in the rebistry so
            // it can be cleared later
            RG.SVG.REG.set('highlight', highlight);
        };








        /**
        * This allows for easy specification of gradients
        */
        this.parseColors = function () 
        {
            // Save the original colors so that they can be restored when
            // the canvas is cleared
            if (!Object.keys(this.originalColors).length) {
                this.originalColors = {
                    colors:              RG.SVG.arrayClone(prop.colors),
                    backgroundGridColor: RG.SVG.arrayClone(prop.backgroundGridColor),
                    highlightFill:       RG.SVG.arrayClone(prop.highlightFill)
                }
            }

            
            // colors
            var colors = prop.colors;

            if (colors) {
                for (var i=0; i<colors.length; ++i) {
                    colors[i] = RG.SVG.parseColorLinear({
                        object: this,
                        color: colors[i]
                    });
                }
            }

            prop.backgroundGridColor = RG.SVG.parseColorLinear({object: this, color: prop.backgroundGridColor});
            prop.highlightFill       = RG.SVG.parseColorLinear({object: this, color: prop.highlightFill});
        };








        //
        // Draws the labelsAbove
        //
        this.drawLabelsAbove = function ()
        {
            // Go through the above labels
            if (prop.labelsAbove) {
                for (var i=0; i<this.coords.length; ++i) {

                    var str = RG.SVG.numberFormat({
                        object:    this,
                        num:       this.data[i].toFixed(prop.labelsAboveDecimals ),
                        prepend:   typeof prop.labelsAboveUnitsPre  === 'string'   ? prop.labelsAboveUnitsPre  : null,
                        append:    typeof prop.labelsAboveUnitsPost === 'string'   ? prop.labelsAboveUnitsPost : null,
                        point:     typeof prop.labelsAbovePoint     === 'string'   ? prop.labelsAbovePoint     : null,
                        thousand:  typeof prop.labelsAboveThousand  === 'string'   ? prop.labelsAboveThousand  : null,
                        formatter: typeof prop.labelsAboveFormatter === 'function' ? prop.labelsAboveFormatter : null
                    });

                    RG.SVG.text({
                        object:     this,
                        text:       str,
                        x:          parseFloat(this.coords[i].object.getAttribute('x')) + parseFloat(this.coords[i].object.getAttribute('width') / 2) + prop.labelsAboveOffsetx,
                        y:          parseFloat(this.coords[i].object.getAttribute('y')) - 7 + prop.labelsAboveOffsety,
                        halign:     prop.labelsAboveHalign,
                        valign:     prop.labelsAboveValign,
                        font:       prop.labelsAboveFont              || prop.textFont,
                        size:       prop.labelsAboveSize              || prop.textSize,
                        bold:       prop.labelsAboveBold              || prop.textBold,
                        italic:     prop.labelsAboveItalic            || prop.textItalic,
                        color:      prop.labelsAboveColor             || prop.textColor,
                        background: prop.labelsAboveBackground        || null,
                        padding:    prop.labelsAboveBackgroundPadding || 0
                    });
                }
            }
        };








        /**
        * Using a function to add events makes it easier to facilitate method
        * chaining
        * 
        * @param string   type The type of even to add
        * @param function func 
        */
        this.on = function (type, func)
        {
            if (type.substr(0,2) !== 'on') {
                type = 'on' + type;
            }
            
            RG.SVG.addCustomEventListener(this, type, func);
    
            return this;
        };








        //
        // Used in chaining. Runs a function there and then - not waiting for
        // the events to fire (eg the onbeforedraw event)
        // 
        // @param function func The function to execute
        //
        this.exec = function (func)
        {
            func(this);
            
            return this;
        };








        //
        // The Bar chart grow effect
        //
        this.grow = function ()
        {
            var opt      = arguments[0] || {},
                frames   = opt.frames || 30,
                frame    = 0,
                obj      = this,
                data     = [],
                height   = null,
                seq      = 0;

            //
            // Copy the data
            //
            data = RG.SVG.arrayClone(this.data);

            this.draw();

            var iterate = function ()
            {

                for (var i=0,seq=0,len=obj.coords.length; i<len; ++i, ++seq) {

                    var   multiplier = (frame / frames)
                        * RG.SVG.FX.getEasingMultiplier(frames, frame)
                        * RG.SVG.FX.getEasingMultiplier(frames, frame);
                
                
                
                
                    // TODO Go through the data and update the value according to
                    // the frame number
                    if (typeof data[i] === 'number') {

                        height      = ma.abs(obj.getYCoord(data[i]) - obj.getYCoord(0));
                        obj.data[i] = data[i] * multiplier;
                        height      = multiplier * height;
                        
                        // Set the new height on the rect
                        obj.coords[seq].object.setAttribute(
                            'height',
                            height
                        );

                        // Set the correct Y coord on the object
                        obj.coords[seq].object.setAttribute(
                            'y',
                            data[i] < 0 ? obj.getYCoord(0) : obj.getYCoord(0) - height
                        );

                    } else if (typeof data[i] === 'object') {

                        var accumulativeHeight = 0;

                        for (var j=0,len2=data[i].length; j<len2; ++j, ++seq) {

                            height         = ma.abs(obj.getYCoord(data[i][j]) - obj.getYCoord(0));
                            height         = multiplier * height;
                            obj.data[i][j] = data[i][j] * multiplier;

                            obj.coords[seq].object.setAttribute(
                                'height',
                                height
                            );

                            obj.coords[seq].object.setAttribute(
                                'y',
                                data[i][j] < 0 ? (obj.getYCoord(0) + accumulativeHeight) : (obj.getYCoord(0) - height - accumulativeHeight)
                            );
                            
                            accumulativeHeight += (prop.grouping === 'stacked' ? height : 0);
                        }

                        //
                        // Set the height and Y cooord of the backfaces if necessary
                        //
                        if (obj.stackedBackfaces[i]) {
                            obj.stackedBackfaces[i].setAttribute(
                                'height',
                                accumulativeHeight
                            );
    
                            obj.stackedBackfaces[i].setAttribute(
                                'y',
                                obj.height - prop.gutterBottom - accumulativeHeight
                            );
                        }

                        // Decrease seq by one so that it's not incremented twice
                        --seq;
                    }
                }

                if (frame++ < frames) {
                    //setTimeout(iterate, frame > 1 ? opt.delay : 200);
                    RG.SVG.FX.update(iterate);
                } else if (opt.callback) {
                    (opt.callback)(obj);
                }
            };

            iterate();
            
            return this;
        };








        //
        // Set the options that the user has provided
        //
        for (i in conf.options) {
            if (typeof i === 'string') {
                this.set(i, conf.options[i]);
            }
        }
    };
            
    return this;

// End module pattern
})(window, document);