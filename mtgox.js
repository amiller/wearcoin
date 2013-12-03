// MtGox api in javascript


var mtgox = (function(key, secret) {
    var self = this;
    self.key = key;
    self.secret = secret;
    self._currency = "BTCUSD";

    function basicOptions(path) {
        return {
            url: "https://data.mtgox.com/api/2/" + path,
            agent: false,
            headers: {
                "Content-type": "application/x-www-form-urlencoded"
            }
        };
    }

    function hmac_512(message, secret) {
        var shaObj = new jsSHA(message, "TEXT");
        var hmac = shaObj.getHMAC(secret, "B64", "SHA-512", "B64");
        return hmac;
        /*
        var hmac = CryptoJS.HmacSHA512(message, secret);
        hmac = CryptoJS.enc.Base64.stringify(hmac);
        return hmac;*/
    }

    function makeRequest(path, args, callback) {
        if (!self.key || !self.secret) {
            throw new Error("Must provide key and secret to make this API request.");
        }

        // generate a nonce
        args.nonce = 0; //= microtime.now();
        // compute the post data
        var postData = "";//querystring.stringify(args);
        // append the path to the post data
        var message = path; //+ "\0" + postData;
        // compute the sha512 signature of the message
        var sec = CryptoJS.enc.Base64.parse(self.secret);
        var hmac = hmac_512(message, secret);

        var options = basicOptions(path);

        options.type = "GET";
        options.headers["Rest-Key"] = self.key;
        options.headers["Rest-Sign"] = hmac;
        //options.success = callback;
        options.dataType = "jsonp"
        options.beforeSend = function(xhr) {
            // generate base 64 string from username + password
            xhr.setRequestHeader("Rest-Key", self.key);
            xhr.setRequestHeader("Rest-Sign", options.headers["Rest-Sign"]);
            xhr.setRequestHeader('Test', 'test');
        };

        console.info(options);
        return $.ajax(options);
    }

    self.info = function(callback) {
        makeRequest(self._currency + "/money/info", {}, callback);
    };

    return self;
});
