/**
 * MediaCloud JS SDK
 *
 * @version 1.0.0
 * @class jssdk
 */
(function () {
    var noop, MediaCloudJSSDK, Event, TransStatusWatch, onload;
    noop = function () {};

    MediaCloudJSSDK = function () {
        var iframe,
            self = this;
        this.debug = false;
        this._shakeEnable = false;
        this._event = new Event();
        this._request = function (method, params) {
            var src = 'cloudjs://' + method,
                copyParams = {};
            for (var k in params) {
                copyParams[k] = params[k];
            }
            if (copyParams) {
                for (var key in copyParams) {
                    if (copyParams.hasOwnProperty(key)) {
                        if('thumbs' == key){
                            var _thumbs=[];
                            for(var i=0;i<copyParams[key].length;i++){
                                _thumbs.push(encodeURIComponent(copyParams[key][i]))
                            }
                            copyParams[key]=_thumbs;
                        }else if('url' == key){
                            copyParams[key] = decodeURIComponent(copyParams[key])
                        }else{
                            copyParams[key] = encodeURIComponent(copyParams[key]);
                        }
                    }
                }
                src += '?params=' + JSON.stringify(copyParams);
            }
            iframe.src = src;
            self._event.trigger('request');
        };

        this._callback = function (res) {
            if (+res.errId !== 0) {
                self._event.trigger('error', res.errId);
                if (self.debug) {
                    alert('errId:' + res.errId);
                }
                return;
            }
            self._event.trigger(res.method, res.data);
        };

        this._transStatusWatch = new TransStatusWatch(this._event);

        iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.left = '-9999px';
        iframe.style.width = '0';
        iframe.style.height = '0';
        if(document.body){
            document.body.appendChild(iframe);
        }else{
            var onload = window.onload || function(){};
            window.onload = function(){
                document.body.appendChild(iframe);
                onload();
            }
        }

    };

    Event = function () {
        var _events = {},
            self = this;
        this.on = function (name, func) {
            var name = name.toLocaleLowerCase().split('.');
            type = name[1] || 'default';
            name = name[0];
            if (!_events[name]) {
                _events[name] = [];
            }
            _events[name].push({
                type: type,
                func: func
            });
            return self;
        };
        this.off = function (name) {
            var i, name = name.toLocaleLowerCase().split('.');
            type = name[1] || 'default';
            name = name[0];
            if (_events[name] && _events[name].length) {
                for (i in _events) {
                    if (i !== name) continue;
                    _events[i] = _events[i].filter(function (key, item) {
                        return (type && type !== key);
                    });
                    if (_events[i].length) {
                        delete _events[i];
                    }
                }
            }
            return self;
        };
        this.trigger = function (name, data) {
            var i, l;
            name = name.toLocaleLowerCase();
            if (!_events[name]) return;
            for (l = _events[name].length, i = l - 1; i >= 0; i--) {
                _events[name][i].func.call(null, data);
            }
            return self;
        };
    };

    TransStatusWatch = function (event) {
        var callbacks = {};
        event.on('transStatusQuery', function (data) {
            if (typeof callbacks[data.id] !== 'function') {
                return;
            }
            callbacks[data.id]({
                status: data.status
            });
            delete(callbacks[data.id]);
        })

        this.add = function (id, func) {
            callbacks[id] = func;
        }
    }

    /**
     * 浣跨敤鐜囪緝楂樼殑浜嬩欢缁戝畾鍑芥暟
     */
    function normalEventBind(event, name, callback) {
        event
            .off(name)
            .on(name, function (res) {
                callback(res);
                event.off(name);
            });
    }

    /**
     * 鑾峰彇鐢ㄦ埛鐧婚檰淇℃伅
     * @constructor
     * @param {Function} callback
     */
    MediaCloudJSSDK.prototype.userGetInfo = function (callback) {
        normalEventBind(this._event, 'userGetInfo', callback);
        this._request('userGetInfo');
    };

    /**
     * 鐧婚檰
     * @constructor
     * @param {Function} callback
     */
    MediaCloudJSSDK.prototype.userLogin = function (callback) {
        normalEventBind(this._event, 'userLogin', callback);
        this._request('userLogin');
    };

    /**
     * 鍏虫敞鍐呭灞炴€�
     */
    MediaCloudJSSDK.prototype.attentionAttr = function (_param) {
        this._request('attentionAttr',_param);
    };
    /**
     * 璺宠浆鍐呭灞炴€у垪琛�
     */
    MediaCloudJSSDK.prototype.attrDetail = function (_param) {
        this._request('attrDetail',_param);
    };

    /**
     * 璋冪敤鍘熺敓娴忚鍣ㄦ墦寮€
     * @constructor
     * @param {String} url 璁块棶URL
     */
    MediaCloudJSSDK.prototype.linkOpen = function (url) {
        this._request('linkOpen', {
            url: url
        });
    };

    /**
     * 涓€閿脊鍑哄垎浜眰
     * @constructor
     * @param {Object} option
     * @param {String} option.title     鍒嗕韩鏍囬
     * @param {String} option.content   鍒嗕韩鍐呭
     * @param {String} option.image     鍒嗕韩缂╃暐鍥�
     * @param {String} option.url       鍒嗕韩閾炬帴
     */
    MediaCloudJSSDK.prototype.sharePanel = function (option) {
        option = option || {};
        option.type = 0;
        this._request('sharePanel', option);
    };

    /**
     * 鍒嗕韩鍒板井淇�
     * @constructor
     * @param {Object} option
     * @param {String} option.title     鍒嗕韩鏍囬
     * @param {String} option.content   鍒嗕韩鍐呭
     * @param {String} option.image     鍒嗕韩缂╃暐鍥�
     * @param {String} option.url       鍒嗕韩閾炬帴
     */
    MediaCloudJSSDK.prototype.shareWeChat = function (option) {
        option = option || {};
        option.type = 22;

        this._request('sharePanel', option);
    };

    /**
     * 鍒嗕韩鍒版湅鍙嬪湀
     * @constructor
     * @param {Object} option
     * @param {String} option.title     鍒嗕韩鏍囬
     * @param {String} option.content   鍒嗕韩鍐呭
     * @param {String} option.image     鍒嗕韩缂╃暐鍥�
     * @param {String} option.url       鍒嗕韩閾炬帴
     */
    MediaCloudJSSDK.prototype.shareTimeline = function (option) {
        option = option || {};
        option.type = 23;

        this._request('sharePanel', option);
    };

    /**
     * 鍒嗕韩鍒癚Q濂藉弸
     * @constructor
     * @param {Object} option
     * @param {String} option.title     鍒嗕韩鏍囬
     * @param {String} option.content   鍒嗕韩鍐呭
     * @param {String} option.image     鍒嗕韩缂╃暐鍥�
     * @param {String} option.url       鍒嗕韩閾炬帴
     */
    MediaCloudJSSDK.prototype.shareQQMessage = function (option) {
        option = option || {};
        option.type = 24;

        this._request('sharePanel', option);
    };

    /**
     * 鍒嗕韩鍒癚Q绌洪棿
     * @constructor
     * @param {Object} option
     * @param {String} option.title     鍒嗕韩鏍囬
     * @param {String} option.content   鍒嗕韩鍐呭
     * @param {String} option.image     鍒嗕韩缂╃暐鍥�
     * @param {String} option.url       鍒嗕韩閾炬帴
     */
    MediaCloudJSSDK.prototype.shareQzone = function (option) {
        option = option || {};
        option.type = 6;

        this._request('sharePanel', option);
    };

    /**
     * 鍒嗕韩鍒板井鍗�
     * @constructor
     * @param {Object} option
     * @param {String} option.title     鍒嗕韩鏍囬
     * @param {String} option.content   鍒嗕韩鍐呭
     * @param {String} option.image     鍒嗕韩缂╃暐鍥�
     * @param {String} option.url       鍒嗕韩閾炬帴
     */
    MediaCloudJSSDK.prototype.shareWeibo = function (option) {
        option = option || {};
        option.type = 1;

        this._request('sharePanel', option);
    };

    /**
     * 鑾峰彇鍦扮悊浣嶇疆
     * @constructor
     * @param {Function} callback
     */
    MediaCloudJSSDK.prototype.locationGetInfo = function (callback) {
        normalEventBind(this._event, 'locationGetInfo', callback);
        this._request('locationGetInfo');
    };

    /**
     * 鎵撳紑鍦板浘瀵艰埅
     * @constructor
     * @param {String} latitude     缁忓害
     * @param {String} longitude    绾害
     * @param {String} address      璇︾粏鍦板潃
     * @param {Function} callback
     */
    MediaCloudJSSDK.prototype.locationMap = function (latitude, longitude, address, callback) {
        latitude = latitude.toString();
        longitude = longitude.toString();
        this._request('locationMap', {
            latitude: latitude,
            longitude: longitude,
            address: address || ''
        });
    };

    /**
     * 鑾峰彇璁惧淇℃伅
     * @constructor
     * @param {Function} callback
     */
    MediaCloudJSSDK.prototype.deviceGetInfo = function (callback) {
        normalEventBind(this._event, 'deviceGetInfo', callback);
        this._request('deviceGetInfo');
    };

    /**
     * 鑾峰彇缃戠粶淇℃伅
     * @constructor
     * @param {Function} callback
     */
    MediaCloudJSSDK.prototype.networkGetInfo = function (callback) {
        normalEventBind(this._event, 'networkGetInfo', callback);
        this._request('networkGetInfo');
    };

    /**
     * 鐩戞祴缃戠粶鐘舵€佸彉鍖�
     * 娉ㄥ唽鍚庢瘡褰撶綉缁滅姸鎬佸彉鍖栭兘浼氳Е鍙戝洖璋�
     * @constructor
     * @param {Function} callback
     */
    MediaCloudJSSDK.prototype.networkWatch = function (callback) {
        this._event.on('networkWatch', callback);
    };

    /**
     * 浜岀淮鐮佹壂鎻�
     * @constructor
     * @param {Function} callback
     */
    MediaCloudJSSDK.prototype.qrcodeScan = function (callback) {
        normalEventBind(this._event, 'qrcodeScan', callback);
        this._request('qrcodeScan');
    };

    /**
     * 棰勮鍥剧墖
     * @constructor
     * @param {Array} imgs  鍥剧墖URL闆�
     * @param {Number} id   璧峰浣嶇疆(浠�0寮€濮�)
     */
    MediaCloudJSSDK.prototype.photoPreview = function (imgs, id) {
        this._request('photoPreview', {
            imgs: imgs,
            id: id || 0
        });
    };

    /**
     * 鎵撳紑鎷嶇収/閫夋嫨鍥剧墖鍔熻兘
     * @constructor
     * @param {Number}   maxnum   鍏佽閫夋嫨鍥剧墖鐨勬渶澶у紶鏁� 1~9
     * @param {Function} callback
     */
    MediaCloudJSSDK.prototype.photoSelect = function (maxnum, callback) {
        maxnum = Math.min(9, Math.max(1, +maxnum));
        normalEventBind(this._event, 'photoSelect', callback);
        this._request('photoSelect', {
            max: maxnum
        });
    };

    /**
     * 闊抽褰曞埗
     * @constructor
     * @param {Function} callback
     */
    MediaCloudJSSDK.prototype.audioRecord = function (callback) {
        normalEventBind(this._event, 'audioRecord', callback);
        this._request('audioRecord');
    };

    /**
     * 闊抽杞爜鐘舵€佹煡璇�
     * @constructor
     * @param {String} audioId 闊抽ID(涓婁紶鍥炶皟鑾峰緱)
     * @param {Function} callback
     */
    MediaCloudJSSDK.prototype.audioStatusQuery = function (audioId, callback) {
        this._transStatusWatch.add(audioId, callback);
        this._request('transStatusQuery', {
            id: audioId
        })
    };

    /**
     * 鎷嶆憚/涓婁紶瑙嗛
     * @constructor
     * @param {Function} callback
     */
    MediaCloudJSSDK.prototype.videoSelect = function (callback) {
        var orignCallback = callback;
        callback = function (res) {
            if (res && res.status === 'complete') {
                res.thumb = 'data:image/*;base64,' + res.thumb;
            }
            orignCallback(res);
        };
        normalEventBind(this._event, 'videoSelect', callback);
        this._request('videoSelect');
    };

    /**
     * 瑙嗛杞爜鐘舵€佹煡璇�
     * @constructor
     * @param {String} videoId 瑙嗛ID(涓婁紶鍥炶皟鑾峰緱)
     * @param {Function} callback
     */
    MediaCloudJSSDK.prototype.videoStatusQuery = function (videoId, callback) {
        this._transStatusWatch.add(videoId, callback);
        this._request('transStatusQuery', {
            id: videoId
        })
    };

    /**
     * 鐩戞祴鎽囦竴鎽�
     * @constructor
     * @param {Function} callback
     */
    MediaCloudJSSDK.prototype.shakeWatch = function (callback) {
        this._event.on('shakeEnable', function (res) {
            callback(res.status);
        });
        if (!this._shakeEnable) {
            this._request('shakeEnable');
            this._shakeEnable = true;
        }
    };

    /**
     * 璺宠浆鍒扮洿鎾�
     * @constructor
     * @param string contentid 鐩存挱id
     * @param string title 鐩存挱鏍囬
     * @param string sharesiteid 鍒嗕韩鐩存挱绔欑偣id
     */
    MediaCloudJSSDK.prototype.pushLiveViewController = function (contentid, title, sharesiteid) {
        this._request('pushLiveViewController', {
            contentid: contentid,
            title: title || '',
            sharesiteid: sharesiteid || 0
        });
    };

    /**
     * 璺宠浆鍒扮數瑙嗙洿鎾�
     * @constructor
     * @param string title
     * @param int sharesiteid
     */
    MediaCloudJSSDK.prototype.pushTvStreamController = function (title, sharesiteid) {
        this._request('pushTvStreamController', {
            title: title || '',
            sharesiteid: sharesiteid || 0
        });
    };

    /**
     * 璺宠浆鍒版姤鏂�
     * @controller
     */
    MediaCloudJSSDK.prototype.pushBrokeViewController = function (title) {
        this._request('pushBrokeViewController', {
            title: title || ''
        });
    };

    /**
     * 璺宠浆鍒伴棶鏀�
     * @constructor
     */
    MediaCloudJSSDK.prototype.pushPoliticsViewController = function (title) {
        this._request('pushPoliticsViewController', {
            title: title || ''
        });
    };

    /**
     * 璺宠浆鍒颁袱寰�
     * @constructor
     */
    MediaCloudJSSDK.prototype.push2WeiViewController = function (title) {
        this._request('push2WeiViewController', {
            title: title || ''
        });
    };

    /**
     * 璺宠浆閾炬帴
     * @constructor
     */
    MediaCloudJSSDK.prototype.pushLinkViewController = function (url, title) {
        this._request('pushLinkViewController', {
            url: url || '',
            title: title || ''
        });
    };

    /**
     * 鍒ゆ柇鏄惁鏄鎴风鎵撳紑
     * @returns {boolean}
     */
    MediaCloudJSSDK.prototype.isClient = function () {

        var status = false,
            cloudIdentify = new RegExp("mediacloudclient");

        if(cloudIdentify.test(navigator.userAgent)) status = true;

        return status;

    };

    /**
     * 鑾峰彇鍔犲瘑鐢ㄦ埛鐧婚檰淇℃伅
     * @constructor
     * @param {Function} callback
     */
    MediaCloudJSSDK.prototype.userGetEncryptInfo = function (callback) {
        normalEventBind(this._event, 'userGetEncryptInfo', callback);
        this._request('userGetEncryptInfo');
    };

    /**
     * 璇煶闃呰
     */
    MediaCloudJSSDK.prototype.readContentController = function (op) {
        this._request('readContentController', {
            op: op || 1
        });
    }

    /**
     * 閲嶆柊鐧婚檰
     * @constructor
     * @param {Function} callback
     */
    MediaCloudJSSDK.prototype.reLogin = function (callback) {
        normalEventBind(this._event, 'reLogin', callback);
        this._request('reLogin');
    };

    /**
     *  鎵撳紑鏂扮殑鍐呭璇︽儏
     * @param {Object} option
     * @param {Number} option.contenid 鍐呭妯″瀷璇︽儏id
     * @param {Number} option.appid 鍐呭妯″瀷绫诲瀷id
     * @param {Number} option.siteid 鍐呭妯″瀷绔欑偣id
     */
    MediaCloudJSSDK.prototype.openContentView = function(option){
        option = option || {};
        this._request('openContentView', option);
    };

    /**
     * 鑾峰彇瀹㈡埛绔弬鏁�
     * @constructor
     * @param {Function} callback
     */
    MediaCloudJSSDK.prototype.getMobileParams = function (callback) {
        normalEventBind(this._event, 'getMobileParams', callback);
        this._request('getMobileParams');
    };

    /**
     * 涓嬭浇璧勬簮
     * @constructor
     * @param {String} url 璧勬簮鍦板潃
     */
    MediaCloudJSSDK.prototype.downloadResource = function (url, alias) {
        var u = navigator.userAgent,
            isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios缁堢

        if (this.isClient() && isIOS) {
            this._request('downloadResource', {
                url: url,
                alias: alias
            });
        } else {
            var a = document.createElement("a");

            a.style.display = "none";
            a.setAttribute("download", alias);
            a.setAttribute("href", url);
            a.click();
        }
    };

    window.mc = new MediaCloudJSSDK();
    window.mediaCloudCallback = mc._callback;
}());
