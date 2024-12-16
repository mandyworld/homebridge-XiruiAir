const { API, PlatformAccessory, CharacteristicValue } = require('homebridge');
const { get_temp, get_humi, get_PM25, get_hcho, calculateAQI, startDataFetchInterval } = require('./data_fetcher');

let Service, Characteristic;

module.exports = (homebridge) => {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory('homebridge-XiruiAir', 'XiruiAir', XiruiAirAccessory);
};

class XiruiAirAccessory {
  constructor(log, config) {
    this.log = log;
    this.name = config.name;
    this.Interval = (config.interval || 15) * 60 * 1000 || 600000; // 使用config.json中的fetchInterval配置，如果没有则使用默认值600000

    this.temperatureService = new Service.TemperatureSensor(this.name + ' Temperature', 'subtype1');
    this.temperatureService.getCharacteristic(Characteristic.CurrentTemperature)
      .on('get', this.handleTemperatureGet.bind(this));

    this.humidityService = new Service.HumiditySensor(this.name + ' Humidity', 'subtype2');
    this.humidityService.getCharacteristic(Characteristic.CurrentRelativeHumidity)
      .on('get', this.handleHumidityGet.bind(this));

    this.airQualityService = new Service.AirQualitySensor(this.name + ' Air Quality', 'subtype3');
    this.airQualityService.getCharacteristic(Characteristic.AirQuality)
      .on('get', this.handleAirQualityGet.bind(this));
    this.airQualityService.getCharacteristic(Characteristic.PM2_5Density)
      .on('get', this.handlePM25Get.bind(this));
    this.airQualityService.getCharacteristic(Characteristic.VOCDensity) // 使用CarbonDioxideLevel特性来表示HCHO
      .on('get', this.handleHCHOGet.bind(this));

    // 启动定时获取数据的功能
    startDataFetchInterval(this.Interval);
  }

  async handleTemperatureGet(callback) {
    try {
      const temp = await get_temp();
      console.log("Fetched Temperature:", temp); // 输出温度值
      callback(null, temp);
    } catch (error) {
      console.error("Error fetching temperature:", error);
      callback(error);
    }
  }

  async handleHumidityGet(callback) {
    try {
      const humidity = await get_humi();
      console.log("Fetched Humidity:", humidity); // 输出湿度值
      callback(null, humidity);
    } catch (error) {
      console.error("Error fetching humidity:", error);
      callback(error);
    }
  }

  async handlePM25Get(callback) {
    try {
      const pm25 = await get_PM25();
      console.log("Fetched PM2.5:", pm25); // 输出PM2.5值
      callback(null, pm25);
    } catch (error) {
      console.error("Error fetching PM2.5:", error);
      callback(error);
    }
  }

  async handleHCHOGet(callback) {
    try {
      const hcho = await get_hcho();
      console.log("Fetched HCHO:", hcho); // 输出HCHO值
      callback(null, hcho);
    } catch (error) {
      console.error("Error fetching HCHO:", error);
      callback(error);
    }
  }

  async handleAirQualityGet(callback) {
    try {
      const pm25 = await get_PM25();
      const aqi = calculateAQI(pm25);
      let airQuality;

      // 根据AQI值设置空气质量等级
      if (aqi <= 50) {
        airQuality = Characteristic.AirQuality.EXCELLENT;
      } else if (aqi <= 100) {
        airQuality = Characteristic.AirQuality.GOOD;
      } else if (aqi <= 150) {
        airQuality = Characteristic.AirQuality.FAIR;
      } else if (aqi <= 200) {
        airQuality = Characteristic.AirQuality.INFERIOR;
      } else {
        airQuality = Characteristic.AirQuality.POOR;
      }

      console.log("Calculated Air Quality:", airQuality); // 输出空气质量
      callback(null, airQuality);
    } catch (error) {
      console.error("Error fetching air quality:", error);
      callback(error);
    }
  }

  getServices() {
    return [
      this.temperatureService,
      this.humidityService,
      this.airQualityService
    ];
  }
}
