const vertexShaderSource = fetch('vertexShader.glsl').then(r => r.text());
const fragmentShaderSource = fetch('fragmentShader.glsl').then(r => r.text());

Promise.all([vertexShaderSource, fragmentShaderSource])
  .then(([vertexShaderSource, fragmentShaderSource]) => {
    const canvas = document.getElementById("glCanvas");
    const gl = canvas.getContext("webgl");
    if (!gl) {
      alert("Unable to initialize WebGL. Your browser may not support it.");
      return;
    }

    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(program));
      return;
    }

    const vertices = [
      -0.5, 0.5,
      -0.5, -0.5,
      0.5, -0.5,
      0.5, 0.5,
    ];
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);

    const positionAttributeLocation = gl.getAttribLocation(program, "aVertexPosition");
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLE_FAN, 0, vertices.length / 2);
  });
