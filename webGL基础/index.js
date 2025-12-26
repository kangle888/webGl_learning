function initShaderProgram (gl, VERTEX_SHADER_SOURCE, FRAGMENT_SHADER_SOURCE) {
  // 创建着色器
  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

  gl.shaderSource(vertexShader, VERTEX_SHADER_SOURCE); // 指定顶点着色器源码
  gl.shaderSource(fragmentShader, FRAGMENT_SHADER_SOURCE);  // 指定片元着色器源码

  // 编译着色器
  gl.compileShader(vertexShader);
  gl.compileShader(fragmentShader);

  // 创建一个程序对象
  const program = gl.createProgram();
  // 附着着色器
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);

  // 链接程序
  gl.linkProgram(program);
  // 使用程序
  gl.useProgram(program);
  return program;
}

// 平移矩阵 
function getTranslationMatrix(tx = 0, ty =0, tz =0) {
  return new Float32Array([
    1.0, 0.0, 0.0, 0.0,
    0.0, 1.0, 0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    tx, ty, tz, 1.0
  ]);
}
// 缩放矩阵
function getScaleMatrix(sx = 1, sy =1, sz =1) {
  return new Float32Array([
    sx, 0.0, 0.0, 0.0,
    0.0, sy, 0.0, 0.0,
    0.0, 0.0, sz, 0.0,
    0.0, 0.0, 0.0, 1.0
  ]);
}
// 旋转矩阵
function getRotationMatrix(deg, axis = 'z') {
  const rad = deg * Math.PI / 180;
  const cosB = Math.cos(rad);
  const sinB = Math.sin(rad);
  let matrix;
  switch(axis) {
    case 'x':
      matrix = new Float32Array([
        1.0, 0.0, 0.0, 0.0,
        0.0, cosB, sinB, 0.0,
        0.0, -sinB, cosB, 0.0,
        0.0, 0.0, 0.0, 1.0
      ]);
      break;  
    case 'y':
      matrix = new Float32Array([
        cosB, 0.0, -sinB, 0.0,
        0.0, 1.0, 0.0, 0.0,
        sinB, 0.0, cosB, 0.0,
        0.0, 0.0, 0.0, 1.0
      ]);
      break;
    case 'z':
      matrix = new Float32Array([
        cosB, sinB, 0.0, 0.0,
        -sinB, cosB, 0.0, 0.0,

        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0
      ]);
      break;
    default:
      console.log('axis error');
  } 
  return matrix;
}

// 矩阵符合函数 
function multiplyMatrices (a, b) {
  const result = new Float32Array(16);
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      let sum = 0;
      for (let k = 0; k < 4; k++) {
        sum += a[k * 4 + j] * b[i * 4 + k];
      }
      result[i * 4 + j] = sum;
    }
  }
  return result;
}