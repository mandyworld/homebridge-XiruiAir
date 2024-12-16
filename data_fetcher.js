const https = require('https');

const API_URL = 'https://server.developmentservice.cn//device/realTimeData';
const HEADERS = {
  'Content-Type': 'application/json;charset=UTF-8',
  'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/16A5345f',
  'accept-language': 'zh-cn'
};
const DATA = JSON.stringify({
  serialNo: '19032970024938057162'
});

function loaddata() {
  return new Promise((resolve, reject) => {
    const options = {
      method: 'POST',
      headers: HEADERS
    };

    const req = https.request(API_URL, options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve(JSON.parse(data));
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.write(DATA);
    req.end();
  });
}

async function get_temp() {
  const data = await loaddata();
  return Math.round(data.body.RT.temp / 10);
}

async function get_humi() {
  const data = await loaddata();
  return Math.round(data.body.RT.humi / 10);
}

async function get_PM25() {
  const data = await loaddata();
  return data.body.cube.RT.pm2_5;
}

async function get_charging() {
  const data = await loaddata();
  return data.body.cube.RT.isCharging === 1 ? '已连接电源' : '未充电';
}

async function get_bat() {
  const data = await loaddata();
  return Math.round(data.body.cube.RT.Bat * 20);
}

async function get_hcho() {
  const data = await loaddata();
  const originalHCHO = data.body.cube.RT.hcho;
  console.log("Original HCHO value:", originalHCHO);
  
  // 检查原始值是否是非零数字
  if (typeof originalHCHO !== 'number' || isNaN(originalHCHO) || originalHCHO === 0) {
    console.error("HCHO value is not valid or is zero.");
    return 0;
  }

  // 转换 HCHO 值并保持小数
  const transformedHCHO = parseFloat((originalHCHO).toFixed(2));
  console.log("Transformed HCHO value:", transformedHCHO);
  return transformedHCHO;
}

// 计算AQI
function calculateAQI(pm25) {
  let AQI;
  if (pm25 <= 12) {
    AQI = ((50 - 0) / (12 - 0)) * (pm25 - 0) + 0;
  } else if (pm25 <= 35.4) {
    AQI = ((100 - 51) / (35.4 - 12.1)) * (pm25 - 12.1) + 51;
  } else if (pm25 <= 55.4) {
    AQI = ((150 - 101) / (55.4 - 35.5)) * (pm25 - 35.5) + 101;
  } else if (pm25 <= 150.4) {
    AQI = ((200 - 151) / (150.4 - 55.5)) * (pm25 - 55.5) + 151;
  } else if (pm25 <= 250.4) {
    AQI = ((300 - 201) / (250.4 - 150.5)) * (pm25 - 150.5) + 201;
  } else if (pm25 <= 350.4) {
    AQI = ((400 - 301) / (350.4 - 250.5)) * (pm25 - 250.5) + 301;
  } else if (pm25 <= 500.4) {
    AQI = ((500 - 401) / (500.4 - 350.5)) * (pm25 - 350.5) + 401;
  } else {
    AQI = 500; // 如果PM2.5超过500.4，AQI视为最大值500
  }
  return Math.round(AQI);
}

// 定时获取数据的间隔函数
function startDataFetchInterval(interval = 600000) { // 默认间隔时间为60秒
  setInterval(() => {
    loaddata()
      .then(data => {
        console.log("Fetched data:", data);
        // 在这里可以保存数据或更新传感器状态
      })
      .catch(error => {
        console.error("Error fetching data:", error);
      });
  }, interval);
}

module.exports = {
  get_temp,
  get_humi,
  get_PM25,
  get_charging,
  get_bat,
  get_hcho,
  startDataFetchInterval,
  calculateAQI // 导出计算AQI的函数
};
