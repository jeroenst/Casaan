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

    RGraph     = window.RGraph || {isRGraph: true};
    RGraph.SVG = RGraph.SVG || {};

// Module pattern
(function (win, doc, undefined)
{
    var RG  = RGraph,
        ua  = navigator.userAgent,
        ma  = Math,
        win = window,
        doc = document;



    RG.SVG.Pie = function (conf)
    {
        this.id              = conf.id;
        this.uid             = RG.SVG.createUID();
        this.container       = document.getElementById(this.id);
        this.svg             = RG.SVG.createSVG({container: this.container});
        this.isRGraph        = true;
        this.width           = Number(this.svg.getAttribute('width'));
        this.height          = Number(this.svg.getAttribute('height'));
        this.data            = conf.data;
        this.type            = 'pie';
        this.angles          = [];
        this.colorsParsed    = false;
        this.originalColors  = {};
        this.gradientCounter = 1;
        this.nodes           = [];
        this.shadowNodes     = [];
        
        // Add this object to the ObjectRegistry
        RG.SVG.OR.add(this);
        
        // Set the DIV container to be inline-block
        this.container.style.display = 'inline-block';

        this.properties =
        {
            centerx: null,
            centery: null,
            radius:  null,
            
            gutterLeft:    35,
            gutterRight:   35,
            gutterTop:     35,
            gutterBottom:  35,
            
            colors: [
                '#f66', '#6f6', '#66f', '#ff6', '#6ff', '#ccc',
                'pink', 'orange', 'cyan', 'maroon', 'olive', 'teal'
            ],
            strokestyle:      'rgba(0,0,0,0)',
            
            margin:        3,
            
            textColor: 'black',
            textFont: 'sans-serif',
            textSize: 12,
            textBold: false,
            textItalic: false,
            labels: [],

            linewidth: 1,
            
            tooltips: null,
            tooltipsOverride: null,
            tooltipsEffect: 'fade',
            tooltipsCssClass: 'RGraph_tooltip',
            tooltipsEvent: 'click',
            
            highlightStroke: 'rgba(0,0,0,0)',
            highlightFill: 'rgba(255,255,255,0.7)',
            highlightLinewidth: 1,
            
            title: '',
            titleSize: 16,
            titleX: null,
            titleY: null,
            titleHalign: 'center',
            titleValign: 'bottom',
            titleColor:  'black',
            titleFont:   null,
            titleBold:   false,
            titleItalic: false,
            
            titleSubtitle: '',
            titleSubtitleSize: 10,
            titleSubtitleX: null,
            titleSubtitleY: null,
            titleSubtitleHalign: 'center',
            titleSubtitleValign: 'top',
            titleSubtitleColor:  '#aaa',
            titleSubtitleFont:   null,
            titleSubtitleBold:   false,
            titleSubtitleItalic: false,
            
            shadow: false,
            shadowOffsetx: 2,
            shadowOffsety: 2,
            shadowBlur: 2,
            shadowOpacity: 0.25,
            
            exploded: 0,
            roundRobinMultiplier: 1,
            
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



            // Work out the center point
            this.centerx = (this.graphWidth / 2) + prop.gutterLeft;
            this.centery = (this.graphHeight / 2) + prop.gutterTop;
            this.radius  = ma.min(this.graphWidth, this.graphHeight) / 2;



            // Allow the user to override the calculated centerx/y/radius
            this.centerx = typeof prop.centerx === 'number' ? prop.centerx : this.centerx;
            this.centery = typeof prop.centery === 'number' ? prop.centery : this.centery;
            this.radius  = typeof prop.radius  === 'number' ? prop.radius  : this.radius;
            
            //
            // Allow the centerx/centery/radius to be a plus/minus
            //
            if (typeof prop.radius === 'string' && prop.radius.match(/^\+|-\d+$/) )   this.radius  += parseFloat(prop.radius);
            if (typeof prop.centerx === 'string' && prop.centerx.match(/^\+|-\d+$/) ) this.centery += parseFloat(prop.centerx);
            if (typeof prop.centery === 'string' && prop.centery.match(/^\+|-\d+$/) ) this.centerx += parseFloat(prop.centery);


            /**
            * Parse the colors. This allows for simple gradient syntax
            * 
            * ** must be after the cx/cy/r has been calcuated **
            */
            if (!this.colorsParsed) {
                this.parseColors();
                
                // Don't want to do this again
                this.colorsParsed = true;
            }


            // Go through the data and work out the maximum value
            this.max   = RG.SVG.arrayMax(this.data);
            this.total = RG.SVG.arraySum(this.data);

            // Set the explosion to be an array if it's a number
            if (typeof prop.exploded === 'number' && prop.exploded > 0) {
                var val = prop.exploded;
    
                prop.exploded = [];
    
                for (var i=0; i<this.data.length; ++i) {
                    prop.exploded[i] = val;
                }
            }

            

            // Draw the segments
            this.drawSegments({shadow: true});



            // Draw the title and subtitle
            RG.SVG.drawTitle(this);



            // Draw the labels
            this.drawLabels();
            
            
            // Add the attribution link. If you're adding this elsewhere on your page/site
            // and you don't want it displayed then there are options available to not
            // show it.
            RG.SVG.attribution(this);


            // Add the event listener that clears the highlight if
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
        // Draws the segments
        //
        // @param bool     Whether or not this is a redraw. If this is a redraw
        //                 shadows are omitted
        //
        this.drawSegments = function (opt)
        {
            var start   = 0,
                end     = 0,
                angle   = 0,
                sum     = RG.SVG.arraySum(this.data),
                segment = 0;




            // Work out the start and end angles for the data
            for (var i=0,len=this.data.length; i<len; ++i) {
            
                var value = this.data[i] * prop.roundRobinMultiplier;

                start   = angle;
                segment = ((value / sum) * RG.SVG.TRIG.TWOPI);
                end     = start + segment;

                var explosion  = RG.SVG.TRIG.getRadiusEndPoint({
                    angle: start + (segment / 2),
                    r: prop.exploded[i]
                });

                var explosionX = explosion[1],
                    explosionY = explosion[0];


                this.angles[i] = {
                    start:   start,
                    end:     end,
                    angle:   end - start,
                    halfway: ((end - start) / 2) + start,
                    cx:      this.centerx + (parseFloat(explosionX) || 0),
                    cy:      this.centery - (parseFloat(explosionY) || 0),
                    radius:  this.radius
                };

                // Increase the angle at which we start drawing the next segment at
                angle += (end - start);
            }



            if (opt.shadow) {
                RG.SVG.setShadow({
                    object:  this,
                    offsetx: prop.shadowOffsetx,
                    offsety: prop.shadowOffsety,
                    blur:    prop.shadowBlur,
                    opacity: prop.shadowOpacity,
                    id:      'dropShadow'
                });
            }


            //
            // This loop goes thru the angles that were
            // generated above and adds them to the
            // scene
            //
            for (var i=0; i<this.angles.length; ++i) {

                var path = RG.SVG.TRIG.getArcPath({
                    cx:    this.angles[i].cx,
                    cy:    this.angles[i].cy,
                    r:     this.radius,
                    start: this.angles[i].start,
                    end:   this.angles[i].end
                });


                var arc = RG.SVG.create({
                    svg: this.svg,
                    type: 'path',
                    attr: {
                        d: path + " L {1} {2} Z".format(
                            this.angles[i].cx,
                            this.angles[i].cy
                        ),
                        fill: prop.colors[i],
                        stroke: prop.strokestyle,
                        'stroke-width': prop.linewidth,
                        'data-tooltip': (!RG.SVG.isNull(prop.tooltips) && prop.tooltips.length) ? prop.tooltips[i] : '',
                        'data-index': i,
                        'data-value': value,
                        'data-start-angle': this.angles[i].start,
                        'data-end-angle': this.angles[i].end,
                        'data-radius': this.radius,
                        filter: (prop.shadow && opt.shadow) ? 'url(#dropShadow)' : ''
                    }
                });

                // Store a reference to the node
                if (prop.shadow && opt.shadow) {
                    this.shadowNodes[i] = arc;
                } else {
                    this.nodes[i] = arc;
                }

                if (prop.tooltips && prop.tooltips[i] && (!opt.shadow || !prop.shadow)) {
                
                    // Make the tooltipsEvent default to click
                    if (prop.tooltipsEvent !== 'mousemove') {
                        prop.tooltipsEvent = 'click';
                    }

                    (function (index, obj)
                    {
                        arc.addEventListener(prop.tooltipsEvent, function (e)
                        {
                            // Show the tooltip
                            RG.SVG.tooltip({
                                object: obj,
                                index: index,
                                sequentialIndex: index,
                                text: prop.tooltips[index],
                                event: e
                            });
                            
                            // Highlight the rect that has been clicked on
                            obj.highlight(e.target);
                            
                            var highlight = RG.SVG.REG.get('highlight');
                            
                            if (prop.tooltipsEvent === 'mousemove') {
                                highlight.style.cursor = 'pointer';
                            }
                            
                        }, false);

                        // Install the event listener that changes the
                        // cursor if necessary
                        if (prop.tooltipsEvent === 'click') {
                            arc.addEventListener('mousemove', function (e)
                            {
                                e.target.style.cursor = 'pointer';
                            }, false);
                        }
                        
                    }(i, this));
                }
            }

            //
            // Redraw the segments if necessary so that they're on
            // top of any shadow
            //
            if (prop.shadow && opt.shadow) {
                this.redrawSegments();
            }
        };








        //
        // Redraw the Bars o that the bars appear above any shadow
        //
        this.redrawSegments = function ()
        {
            this.drawSegments({shadow: false});
        };








        //
        // Draw the labels
        //
        this.drawLabels = function ()
        {
            var angles = this.angles,
                prop   = this.properties,
                labels = prop.labels;

            for (var i=0; i<angles.length; ++i) {
                
                var endpoint = RG.SVG.TRIG.getRadiusEndPoint({
                    angle: angles[i].halfway - RG.SVG.TRIG.HALFPI,
                    r: angles[i].radius + 15
                });
                
                var x = endpoint[0] + angles[i].cx,
                    y = endpoint[1] + angles[i].cy,
                    valign,
                    halign;
                
                // Figure out the valign and halign based on the quadrant
                // the the center of the sgement is in.
                if (angles[i].halfway > 0 && angles[i].halfway < RG.SVG.TRIG.HALFPI) {
                    halign = 'left';
                    valign = 'bottom';
                } else if (angles[i].halfway > RG.SVG.TRIG.HALFPI && angles[i].halfway < RG.SVG.TRIG.PI) {
                    halign = 'left';
                    valign = 'top';
                } else if (angles[i].halfway > RG.SVG.TRIG.PI && angles[i].halfway < (RG.SVG.TRIG.HALFPI + RG.SVG.TRIG.PI)) {
                    halign = 'right';
                    valign = 'top';
                } else if (angles[i].halfway > (RG.SVG.TRIG.HALFPI + RG.SVG.TRIG.PI) && angles[i].halfway < RG.SVG.TRIG.TWOPI) {
                    halign = 'right';
                    valign = 'top';
                }

                RG.SVG.text({
                    object: this,
                    text: typeof labels[i] === 'string' ? labels[i] : '',
                    font: prop.textFont,
                    size: prop.textSize,
                    x: x,
                    y: y,
                    valign: valign,
                    halign: halign,
                    bold: prop.textBold,
                    italic: prop.textItalic,
                    color: prop.textColor
                });
            }
        };








        /**
        * This function can be used to highlight a segment on the chart
        * 
        * @param object segment The segment to highlight
        */
        this.highlight = function (segment)
        {
            var highlight = RG.SVG.create({
                svg: this.svg,
                type: 'path',
                attr: {
                    d: segment.getAttribute('d'),
                    fill: prop.highlightFill,
                    stroke: prop.highlightStroke,
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


            // Store the highlight rect in the registry so
            // it can be cleared later
            RG.SVG.REG.set('highlight', highlight);
        };








        /**
        * This allows for easy specification of gradients
        */
        this.parseColors = function () 
        {
            // Save the original colors so that they can be restored when the canvas is reset
            if (!Object.keys(this.originalColors).length) {
                this.originalColors = {
                    colors:        RG.SVG.arrayClone(prop.colors),
                    highlightFill: RG.SVG.arrayClone(prop.highlightFill)
                }
            }
            
            
            // colors
            var colors = prop.colors;

            if (colors) {
                for (var i=0; i<colors.length; ++i) {
                    colors[i] = RG.SVG.parseColorRadial({
                        object: this,
                        color: colors[i]
                    });
                }
            }
            
            // Highlight fill
            prop.highlightFill = RG.SVG.parseColorRadial({
                object: this,
                color: prop.highlightFill
            });
        };








        //
        // A roundRobin effect for the Pie chart
        //
        // @param object    Options for the effect
        // @param function  An optional callback function to call when
        //                  the effect is complete
        //
        this.roundRobin = function ()
        {
            var obj       = this,
                opt       = arguments[0] || {},
                data      = RG.SVG.arrayClone(this.data),
                prop      = this.properties,
                frame     = 1,
                frames    = opt.frames || 30,
                callback  = typeof opt.callback === 'function' ? opt.callback : function () {},
                dataSum   = RG.SVG.arraySum(this.data),
                textColor = prop.textColor;
            
            // Set the text color to transparent
            this.properties.textColor = 'rgba(0,0,0,0)';


            // Draw the chart first
            obj.draw();
            
            // Now get the resulting angles
            angles = RG.SVG.arrayClone(obj.angles);


            function iterator ()
            {
                prop.roundRobinMultiplier =  1 / frames * frame++;
                
                for (var i=0; i<obj.angles.length; ++i) {

                    var value = obj.data[i];



                    // NB This was an absolute git to work out for some reason.



                    obj.angles[i].start = angles[i].start * prop.roundRobinMultiplier;
                    obj.angles[i].end   = angles[i].end   * prop.roundRobinMultiplier;

                    //var segment = (((value * prop.roundRobinMultiplier) / dataSum) * RG.SVG.TRIG.TWOPI);
                    var segment = ((obj.angles[i].end - obj.angles[i].start) / 2);
                    var explodedX = ma.cos(obj.angles[i].start + segment - RG.SVG.TRIG.HALFPI) * (prop.exploded[i] || 0);
                    var explodedY = ma.sin(obj.angles[i].start + segment - RG.SVG.TRIG.HALFPI) * (prop.exploded[i] || 0);



                    var path = RG.SVG.TRIG.getArcPath({
                        cx:    obj.centerx + explodedX,
                        cy:    obj.centery + explodedY,
                        r:     obj.radius,// * prop.roundRobinMultiplier,
                        start: obj.angles[i].start,
                        end:   obj.angles[i].end
                    });
                    
                    path = path + " L {1} {2} Z".format(
                        obj.centerx + explodedX,
                        obj.centery + explodedY
                    );

                    if (obj.shadowNodes && obj.shadowNodes[i]) {
                        obj.shadowNodes[i].setAttribute('d', path);
                    }
                    obj.nodes[i].setAttribute('d', path);
                }


                if (frame <= frames) {
                    RG.SVG.FX.update(iterator);
                } else {
                    prop.textColor = textColor;

                    RG.SVG.redraw(obj.svg);

                    callback(obj);
                }
            }
            
            iterator();

            return this;
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