const inherits = require('util').inherits;

module.exports = (homebridge) => {
  const { Characteristic } = homebridge.hap;

  // 定义自定义的 Characteristic
  Characteristic.CustomHCHO = function() {
    Characteristic.call(this, 'HCHO Level', '00001000-0000-1000-8000-0026BB765291');
    this.setProps({
      format: Characteristic.Formats.FLOAT,
      unit: 'ppm',
      minValue: 0,
      maxValue: 100,
      minStep: 0.01,
      perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
    });
    this.value = this.getDefaultValue();
    console.log("CustomHCHO characteristic defined in custom_characteristics.js");
  };
  inherits(Characteristic.CustomHCHO, Characteristic);
  Characteristic.CustomHCHO.UUID = '00001000-0000-1000-8000-0026BB765291';
};
