(function(){
    function DragImagen(nombreNodoActividad) {
        var self = this;//Para usar en los closures
        this.nodoEjercicio = document.getElementById(nombreNodoActividad);
        this.oDragTargets = [];
        this.oDragTarget = null;
        this.oDragItem = null;
        this.iClickOffsetX = undefined;
        this.iClickOffsetY = undefined;
        this.buenas = undefined;
        this.contestadas = undefined;
        this.total = this.nodoEjercicio.getElementsByClassName("DropTarget").length;
        this.MAX_INTENTOS = 1;
        this.bodyOriginal = this.nodoEjercicio.innerHTML;
        //console.log("cargado ejercicio: ", this.nodoEjercicio);
        this.iniciar = function(){
            this.oDragTarget = null;
            this.oDragItem = null;
            this.iClickOffsetX = 0;
            this.iClickOffsetY = 0;
            this.buenas = 0;
            this.contestadas = 0;
            this.revolver();
            this.SetupDragDrop();
            var destinos = this.nodoEjercicio.getElementsByClassName("DropTarget");
            for(var i = 0; i<destinos.length; i++){
                destinos[i].innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
            }
        };
        this.reiniciar = function(){
            self.nodoEjercicio.innerHTML = self.bodyOriginal;
            self.iniciar();
        };
        this.revolver = function(){
            var opciones = self.nodoEjercicio.getElementsByClassName("opciones")[0];
            var respuestas = opciones.children;
            var interior = [];
            for(var i = 0; i<respuestas.length; i++){
                interior.push(respuestas[i].outerHTML);
            }
            self.shuffle(interior);
            opciones.innerHTML = interior.join("\r\n");
        }
        this.shuffle = function(array) {
            var currentIndex = array.length, temporaryValue, randomIndex;
            // While there remain elements to shuffle...
            while (0 !== currentIndex) {
                // Pick a remaining element...
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex -= 1;
                // And swap it with the current element.
                temporaryValue = array[currentIndex];
                array[currentIndex] = array[randomIndex];
                array[randomIndex] = temporaryValue;
            }
            return array;
        }
        this.SetupDragDrop = function(){
            this.ajustarDestinos();
            var botones = this.nodoEjercicio.getElementsByClassName("Dragable");
            for(var i = 0; i<botones.length; i++){
                this.MakeDragable(botones[i]);
                botones[i].padreOriginal = botones[i].parentNode;
                botones[i].intentos = 0;
                //console.log(i+" - "+botones[i].parentNode + " - " + botones[i].padreOriginal);
            }
        };
        this.ajustarDestinos = function(){
            //this.nodoEjercicio.getElementsByClassName("opciones")[0].style.paddingTop = this.nodoEjercicio.querySelector("#externoFijo").offsetHeight+"px";
            this.oDragTargets = [];
            var destinos = this.nodoEjercicio.getElementsByClassName("DropTarget");
            for(var i = 0; i<destinos.length; i++){
                this.oDragTargets.push(this.GetObjPos(destinos[i]));
            }
        };
        this.ajustarDestinosAlResize = function(e){
            self.ajustarDestinos();
        }
        this.MakeDragable = function(oBox){
            if (this.is_touch_device()){
                oBox.ontouchstart = function(e){self.TouchStart(e)};
                oBox.ontouchmove = function(e){self.TouchMove(e)};
                oBox.ontouchend = function(e){self.TouchEnd(e)};
            }else{
                oBox.onmousemove = function(e){self.DragMove(oBox,e)};
                oBox.onmouseup = function(e){self.DragStop(oBox,e)};
                oBox.onmousedown = function(e){self.DragStart(oBox,e);return false};
            }
        };
        //Extra para deshabilitar
        this.UnmakeDragable = function(oBox){
            if (this.is_touch_device()){
                oBox.ontouchstart = null;
                oBox.ontouchmove = null;
                oBox.ontouchend = null;
            }else{
                oBox.onmousemove = null;
                oBox.onmouseup = null;
                oBox.onmousedown = null;
            }
            oBox.style.cursor = "auto";
        };
        this.is_touch_device = function() {
            return 'ontouchstart' in window;
        };
        this.TouchStart = function(e){
            self.ajustarDestinos();
            var oPos = this.GetObjPos(e.target);
            this.iClickOffsetX = e.targetTouches[0].pageX - oPos.x;
            this.iClickOffsetY = e.targetTouches[0].pageY - oPos.y;
        };
        this.DragStart = function(o,e){
            self.ajustarDestinos();
            if(!e) var e = window.event;
            this.oDragItem = o;
            if (e.offsetX){
                this.iClickOffsetX = e.offsetX;
                this.iClickOffsetY = e.offsetY;
            }else{
                var oPos = this.GetObjPos(o);
                this.iClickOffsetX = e.clientX - oPos.x;
                this.iClickOffsetY = e.clientY - oPos.y;
            }

            if (o.setCapture){
                o.setCapture();
            }else{
                this.nodoEjercicio.addEventListener ("mousemove", this.DragMove2, true);
                this.nodoEjercicio.addEventListener ("mouseup",   this.DragStop2, true);
            }
        };
        this.DragMove2 = function(e){
            self.DragMove(self.oDragItem,e);
        };
        this.DragStop2 = function(e){
            self.DragStop(self.oDragItem,e);
        };
        this.DragMove = function(o,e){
            if (this.oDragItem == null) return;

            if(!e) var e = window.event;
            var x = e.pageX - this.nodoEjercicio.clientLeft - this.iClickOffsetX;
            var y = e.pageY - this.nodoEjercicio.clientTop - this.iClickOffsetY;
            //console.log(e.pageY, this.nodoEjercicio.clientTop, this.iClickOffsetY);
            this.HandleDragMove(x,y, e.clientX - o.offsetWidth, e.clientY - o.offsetHeight);
        };
        this.HandleDragMove = function (x,y, botonX, botonY){
            this.oDragItem.style.zIndex = 1000;
            this.oDragItem.style.position = "fixed";
            this.oDragItem.style.left = botonX + "px";
            this.oDragItem.style.top = botonY + "px";

            for (var i=0; i< this.oDragTargets.length; i++){
                var oTarget = this.oDragTargets[i];
                if (oTarget.x < x && oTarget.y < y && (oTarget.x + oTarget.w) > x && (oTarget.y + oTarget.h) > y){
                    if (this.oDragTarget!=null && this.oDragTarget != oTarget.o) this.OnTargetOut();
                    this.oDragTarget = oTarget.o;
                    this.OnTargetOver();
                    return;
                }
            }
            if (this.oDragTarget){
                this.OnTargetOut();
                this.oDragTarget = null;
            }
        };
        this.TouchMove = function(e){
            e.preventDefault();
            var x = e.targetTouches[0].pageX - this.nodoEjercicio.clientLeft - this.iClickOffsetX;
            var y = e.targetTouches[0].pageY - this.nodoEjercicio.clientTop - this.iClickOffsetY;
            this.oDragItem = e.targetTouches[0].target;
            //HandleDragMove(x,y);
            //mensajear("x: "+e.targetTouches[0].clientX+", y: "+e.targetTouches[0].clientY);
            //console.log("e.targetTouches[0]: ", e.targetTouches[0]);
            this.HandleDragMove(x,y, e.targetTouches[0].clientX - this.oDragItem.offsetWidth, e.targetTouches[0].clientY - this.oDragItem.offsetHeight);
        };
        this.DragStop = function(o,e){
            if (o.releaseCapture){
                o.releaseCapture();
            }else if (this.oDragItem){
                this.nodoEjercicio.removeEventListener ("mousemove", this.DragMove2, true);
                this.nodoEjercicio.removeEventListener ("mouseup",   this.DragStop2, true);
            }
            this.HandleDragStop();
        };
        this.HandleDragStop = function(){
            //console.log("oDragTargets: ", oDragTargets);
            if (this.oDragItem == null) {
                return;
            }
            if (this.oDragTarget){
                //mensajear("oDragTarget true: "+ oDragItem.getAttribute("data-tipo") + " - " + oDragTarget.getAttribute("data-destino"));
                if(this.oDragItem.getAttribute("data-tipo") == this.oDragTarget.getAttribute("data-destino")){
                    this.oDragTarget.innerHTML = "";
                    this.oDragTarget.appendChild(this.oDragItem);
                    //mensajear("padre: "+ oDragTarget.getElementsByClassName('palomita').item(0));
                    this.OnTargetOut();
                    this.OnTargetDrop();
                    this.oDragTarget = null;
                    this.contestadas++;
                    this.buenas++;
                    this.UnmakeDragable(this.oDragItem);
                    this.oDragItem.className = "Indragable";
                    this.revisar();
                } else {
                    this.oDragItem.padreOriginal.appendChild(this.oDragItem);
                    this.oDragItem.style.position="";
                    this.oDragItem.intentos++;
                    //mensajear("intentos: "+oDragItem.intentos);
                    if(this.oDragItem.intentos >= this.MAX_INTENTOS){
                        this.UnmakeDragable(this.oDragItem);
                        this.oDragItem.style.borderColor = "red";
                        this.oDragItem.style.color = "red";
                        this.oDragItem.style.opacity = "0.5";
                        this.oDragItem.style.textDecoration = "line-through";
                        //mensajear("intentos sobrepasados: ");
                        this.contestadas++;
                        this.revisar();
                    }
                }
            } else {
                //Agregado para que regrese si no se coloca en una caja
                //mensajear("oDragTarget es falso, padre"+oDragItem.parentNode + " - original: " + oDragItem.padreOriginal);
                this.oDragItem.padreOriginal.appendChild(this.oDragItem);
                this.oDragItem.style.position="";
            }
            this.oDragItem.style.zIndex = 1;
            this.oDragItem = null;
        };
        this.revisar = function(){
            if(this.contestadas === this.total){
                var mensaje = "";
                if(this.buenas === this.total){
                    mensaje = "¡Muy bien!";
                } else {
                    mensaje = "Inténtalo de nuevo.";
                }
                var calificacion = (this.buenas/this.total)*10;
                //mensajear('Terminótodo');
                this.retroalimentar(mensaje+" Calificación: <b>"+calificacion+'</b>. Obtuviste <b>'+ this.buenas + "</b> de <b>" + this.total +'</b>.<br />');
                //<input id="botonReiniciar" type="button" value="Otra vez" onclick="self.reiniciar()">
                var input = document.createElement("input");
                input.type = "button";
                input.value = "Otra vez";
                input.addEventListener("click", self.reiniciar, false);
                self.nodoEjercicio.appendChild(input);
            }
        };
        this.TouchEnd = function(e){
            //e.target.innerHTML = "TouchEnd";
            this.HandleDragStop();
        };
        this.GetObjPos = function(obj){
            var x = 0;
            var y = 0;
            var o = obj;

            var w = obj.offsetWidth;
            var h = obj.offsetHeight;
            if (obj.offsetParent) {
                x = obj.offsetLeft;
                y = obj.offsetTop;
                while (obj = obj.offsetParent){
                    x += obj.offsetLeft;
                    y += obj.offsetTop;
                }
            }
            return {x:x, y:y, w:w, h:h, o:o};
        };
        //Drag and Drop Events
        this.OnTargetOver = function(){
            this.oDragTarget.style.border = "2px solid #4673d7";
        };
        this.OnTargetOut = function(){
            this.oDragTarget.style.border = "";
        };
        this.OnTargetDrop = function(){
            this.oDragItem.style.position="";
            if (this.is_touch_device()) this.MakeDragable(this.oDragItem);
        };
        this.mensajear = function(cadena){
            this.nodoEjercicio.querySelector("#mensajes").innerHTML = cadena;
        };
        this.retroalimentar = function(texto){
            this.nodoEjercicio.querySelector(".retroalimentacion").innerHTML = texto;
        };

        this.iniciar();
        window.addEventListener("resize", this.ajustarDestinosAlResize, false);
    }

    var dragImagen1;
    function alCargar(e){
        dragImagen1 = new DragImagen("arrastraAImagen1");
    }
    window.addEventListener("load", alCargar, false);
})();
