# homebridge-XiruiAir
 用于homebridge挂载西门子老的空气检测仪的插件

 1、安装homebridge；

 2、将本插件打包下载，解压缩后放到homebridge的node_modules文件夹；

 3、修改data_fetcher.js中的serialNo为你自己的设备编号，设备编号在智享西家APP的设备管理页面查看，请输入检测底座的序列号；

 4、在homebridge的config.json的accessories中增加一下配置项：
 ~~~
         {
            "accessory": "XiruiAir",
            "name": "XiruiAir",
            "interval": 30
        }
~~~
5、重启homebridge服务即可看到XiruiAir相关的配件了。
