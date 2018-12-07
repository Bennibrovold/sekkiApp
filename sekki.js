const sekki = (function() {

  const _callback = (text) => {
    console.log(text);
  }
  let canvas = {};
  let tCanvas = [];
  let object = {};
  let objects = [];
  let cBtn = 0;
  let properties = ['width','height','id'];
  let mousePos = {};
  let toolsObject = {
    "tools": ['bursh'],
    "figures": ['circle', 'cube'],
  };
  let toolsArray = [];
  let selected;
  let sizeOfObject = 5;

  const defaultSettings = (el) => {
    for(let i = 0; i < properties.length; i++) {
        el.width = 600;
        el.height = 400;
        el.id = 'canvas';
    }
    return el;
  }
  const createTools = () => {
     let tools = document.createElement('canvas');
     tools.width = 64;
     tools.height = 200;
     tools.style.float = "left";
     tools.id = 'tools';
     tools.ctx = tools.getContext("2d");
     tCanvas.push({'canvas':tools,"width":tools.width,"height":tools.height,"id":tools.id,"ctx":tools.ctx});
     document.body.appendChild(tools);
     setToolsObject(tools,toolsObject);

     tools.onclick = function(e) {
       for(let i = 0 ; i < toolsArray.length; i++) {
       if(e.x < toolsArray[i].x && e.x > toolsArray[i].x - 32  &&
          e.y > toolsArray[i].y && e.y < toolsArray[i].y + 32) {
            selected = toolsArray[i].tool;
            console.log(selected);
          }
        }
     }

  }

  const inRad = (num) => {
    return num * Math.PI / 180;
  }

  const setToolsObject = (toolsCanvas,arr) => {
    toolsCanvas.ctx.clearRect(0,0,canvas.width,canvas.height);
    for(let tools in arr) {
        for(let i = 0; i < arr[tools].length; i++) {
        toolsArray.push({"x":tCanvas[0].canvas.getBoundingClientRect().right,"y":32 * toolsArray.length + tCanvas[0].canvas.getBoundingClientRect().top,'tool':arr[tools][i]});
        }
        for(let i = 1; i <= toolsArray.length;i++) {
        toolsCanvas.ctx.beginPath();
        toolsCanvas.ctx.fontSize = "32px";
        toolsCanvas.ctx.rect(toolsCanvas.width / 2,32 * i - 32,32,32);
        toolsCanvas.ctx.stroke();
        }
      }
    }

  const setCanvasSettings = (canV) => {
    canvas.canvas = canV;
    canvas.ctx = canV.getContext("2d");
    canvas.width = canV.width;
    canvas.height = canV.height;
    return canvas;
  }

  const createCanvas = (settings) => {
    let canV = document.createElement('canvas');
    defaultSettings(canV);
    for(let setting in settings){
      if(typeof settings[setting] === "object") {
        for(let set in settings[setting]) {
           canV[setting][set] = settings[setting][set];
        }
      } else {
           canV[setting] = settings[setting];
      }
    }

    document.body.appendChild(canV);
    setCanvasSettings(canV);

    document.onmousemove = (event) => {
      if(event.x > canvas.canvas.getBoundingClientRect().right - canvas.width && event.x < canvas.canvas.getBoundingClientRect().right &&
         event.y > canvas.canvas.getBoundingClientRect().top - canvas.height && event.y < canvas.height + canvas.canvas.getBoundingClientRect().top) {
      drawByMouse(event);

      mousePos.clientX = event.clientX - canvas.canvas.getBoundingClientRect().right + canvas.canvas.width;
      mousePos.clientY = event.clientY;
      }
    }

    setInterval(drawByMouse,1000/60);

    document.onkeydown = function(e) {
      cBtn = e.keyCode;

      if (cBtn === 90) {
        objects.pop(objects.length);
      }
      if (cBtn === 67) {
        objects = [];
      }
    };

    canvas.canvas.onclick = (event) => {
      sekki.createObject(mousePos.clientX + canvas.canvas.clientLeft + canvas.canvas.clientLeft/2, mousePos.clientY + window.pageYOffset - canvas.canvas.clientTop * 2 - canvas.canvas.clientTop,selected, 0, 0, 20);
    }


    return this;
  }
  const toolsMenu = () => {

  }

  const drawTools = (arr) => {
    switch (arr.type) {
      case "cube":
      return canvas.ctx.rect(arr.x - 50, arr.y - 50, arr.width ? arr.width : 100,arr.height ? arr.height : 100);
      case "circle":
      return canvas.ctx.arc(arr.x, arr.y, arr.radius, 0, 2 * Math.PI);
      default:
      return canvas.ctx.arc(arr.x, arr.y, arr.radius, 0, 2 * Math.PI);
    }
  }

  const drawByMouse = (event) => {
    canvas.ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (objects.length > 0) {
      for (let i = 0; i < objects.length; i++) {
        canvas.ctx.beginPath();
        drawTools(objects[i]);
        canvas.ctx.stroke();
      }
    }

    canvas.ctx.beginPath();
    drawTools(drawToolsMouse());
    //canvas.ctx.arc(mousePos.clientX + 3, mousePos.clientY + window.pageYOffset - 7, 20, 0, 2 * Math.PI);
    canvas.ctx.stroke();
  }

  const drawToolsMouse = () => {
    arr = [];
    arr.x = mousePos.clientX + 3;
    arr.y = mousePos.clientY + window.pageYOffset - 6;
    arr.radius = 20;
    arr.type = selected;
    return arr;
  }

  return {
    log: function() {
      console.log(objects);
    },
    start: function(settings) {
      createTools();
      createCanvas(settings);
      object.posX = canvas.width / 2;
      object.posY = canvas.width / 2;
      object.weight = 0.01;
      object.gravity = 9.8;
    },
    createObject: function(x, y,type = 'circle', width = null, height = null, radius = null) {
      objects.push({
        "x": x,
        "y": y,
        "type": type,
        "width": width,
        "height": height,
        "radius": radius
      });
      return this;
    },
    addTools: function(params = null) {
      if (params !== null) {
        for (let param in params) {
          if (!toolsObject.hasOwnProperty(param)) {
            toolsObject[param] = param;
            toolsObject[param] = [];
            for (let i = 0; i < params[param].length; i++) {
              toolsObject[param].push(params[param][i]);
            }
          } else {
            if (typeof toolsObject[param] === "object") {
              for (let i = 0; i < params[param].length; i++) {
                if(toolsObject[param].indexOf(params[param][i]) === -1) {
                  toolsObject[param].push(params[param][i]);
                }
              }
            }
          }
        }
      }
      return this;
    },
    ToolsSettings: function(func) {
      func(tCanvas,mousePos);
      return this;
    },
    setFunction: function(func) {

    },
    changeObjectSettings: function(type,value) {
      for(let i = 0 ; i < objects.length; i++) {
        if(objects[i]['type'] === type) {
          objects[i].radius = value;
        }
      }
      return this;
    }
  }

}());


var fps = (function(sekki){

  const _callback = (text) => {
    console.log(text);
  };

  let fpsElement = document.getElementById('fps-counter');

  let createFpsCounter = function(fps) {
    return fpsElement.innerHTML = 'FPS: ' + fps;
  }

  let frameCount = function _fc(timeStart) {
    let now = performance.now();
    let duration = now - timeStart;

    if(duration < 1000) {

      _fc.counter++;

    } else {

      _fc.fps = _fc.counter;
      _fc.counter = 0;
      timeStart = now;
      createFpsCounter(_fc.fps);
    }

    requestAnimationFrame(() => frameCount(timeStart));
  }
  // fps counter
  sekki.fps = function() {
    frameCount.counter = 0;
    frameCount.fps = 0;
    frameCount(performance.now());
    setTimeout(createFpsCounter,1000);
  };

  return sekki;

}(sekki || {}));
