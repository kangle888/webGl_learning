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
function getTranslationMatrix (tx = 0, ty = 0, tz = 0) {
  return new Float32Array([
    1.0, 0.0, 0.0, 0.0,
    0.0, 1.0, 0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    tx, ty, tz, 1.0
  ]);
}
// 缩放矩阵
function getScaleMatrix (sx = 1, sy = 1, sz = 1) {
  return new Float32Array([
    sx, 0.0, 0.0, 0.0,
    0.0, sy, 0.0, 0.0,
    0.0, 0.0, sz, 0.0,
    0.0, 0.0, 0.0, 1.0
  ]);
}
// 旋转矩阵
function getRotationMatrix (deg, axis = 'z') {
  const rad = deg * Math.PI / 180;
  const cosB = Math.cos(rad);
  const sinB = Math.sin(rad);
  let matrix;
  switch (axis) {
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



// 归一化函数 
function normalize (arr) {
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    sum += arr[i] * arr[i];
  }
  const middle = Math.sqrt(sum);
  for (let i = 0; i < arr.length; i++) {
    arr[i] = arr[i] / middle;
  }
}

// 叉积函数 获取法向量
function crossProduct (a, b) {
  return new Float32Array([
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0]
  ]);
}

// 点积函数 获取投影长度
function dotProduct (a, b) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += a[i] * b[i];
  }
  return sum;
}

// 向量差
function vectorSubtraction (a, b) {
  return new Float32Array([
    a[0] - b[0],
    a[1] - b[1],
    a[2] - b[2]
  ]);
}
// 视图矩阵获取
function getViewMatrix (eyex, eyey, eyez, lookAtx, lookAty, lookAtz, upx, upy, upz) {
  // 视点
  const eye = new Float32Array([eyex, eyey, eyez]);
  // 目标点
  const lookAt = new Float32Array([lookAtx, lookAty, lookAtz]);
  // 上方向
  const up = new Float32Array([upx, upy, upz]);

  // 确定z轴方向
  let zAxis = vectorSubtraction(eye, lookAt);
  normalize(zAxis);
  normalize(up);

  // 确定x轴方向
  let xAxis = crossProduct(up, zAxis);
  normalize(xAxis);

  // 确定y轴方向
  let yAxis = crossProduct(zAxis, xAxis);
  normalize(yAxis);
  return new Float32Array([
    xAxis[0], yAxis[0], zAxis[0], 0,
    xAxis[1], yAxis[1], zAxis[1], 0,
    xAxis[2], yAxis[2], zAxis[2], 0,
    -dotProduct(xAxis, eye), -dotProduct(yAxis, eye), -dotProduct(zAxis, eye), 1
  ]);
}

// 正交投影矩阵
function getOrthoMatrix (left, right, bottom, top, near, far) {
  const lr = 1 / (right - left);
  const bt = 1 / (top - bottom);
  const nf = 1 / (near - far);
  return new Float32Array([
    2 * lr, 0.0, 0.0, 0.0,
    0.0, 2 * bt, 0.0, 0.0,
    0.0, 0.0, 2 * nf, 0.0,
    -(right + left) * lr, -(top + bottom) * bt, (far + near) * nf, 1.0
  ]);
}

// 投影正射投影矩阵
function getOrthoMatrix (left, right, bottom, top, near, far) {
  return new Float32Array([
    2 / (right - left), 0, 0, 0,
    0, 2 / (top - bottom), 0, 0,
    0, 0, -2 / (far - near), 0,
    -(right + left) / (right - left),
    -(top + bottom) / (top - bottom),
    -(far + near) / (far - near),
    1
  ]);
}