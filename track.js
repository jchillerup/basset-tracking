
(function() { // encapsulate using anonymous function
    // Helper functions
    
    // Generate a unique ID to refer to this specefic page load
    function uuidGenerator() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(char) {
            var r, v;
            r = Math.random() * 16 | 0;
            v = char === 'x' ? r : r & 0x3 | 0x8;
            return v.toString(16);
        });
    };
    _basset.uuid = uuidGenerator();

    // Send data to server
    function sendData() {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open("POST", "//api.basset.io/track", true);
        xmlHttp.timeout = 1000;
        // xmlHttp.ontimeout = function () { alert("Timed out!!!"); }
        xmlHttp.send(JSON.stringify(_basset));
        _basset = {uuid: _basset.uuid, apiKey: _basset.apiKey}; // reset object to avoid sending data twice
    };

    // Form listeners
    function addFormListeners() {
        var inputs = document.getElementsByTagName('input');
        var textareas = document.getElementsByTagName('textarea');
        var selects = document.getElementsByTagName('select');
        var formElems = [].concat(Array.prototype.slice.call(inputs),
                                  Array.prototype.slice.call(textareas),
                                  Array.prototype.slice.call(selects));
        for (var i = 0; i < formElems.length; ++i) {
            addEvent(formElems[i], "change", function(formElem) { // TODO: use input for detecting typing speed
                return trackFormElem(formElem);
            }(formElems[i]));
        };
    };



    // Functions for tracking
    // ----------------------

    // track context
    function trackContext() {
        _basset.context = {};
        _basset.context.url = window.location.href;
        _basset.context.referrer = document.referrer;
        sendData();
    };

    // track IP
    function trackIp(){
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() {
            if (xmlHttp.readyState == 4) {
                _basset.ip = JSON.parse(xmlHttp.responseText);
                sendData();
            }
        }
        xmlHttp.open("GET", "//api.ipify.org?format=json", true);
        xmlHttp.send(JSON.stringify(_basset));
    };

    // track form
    function trackFormElem(formElem) {
        /*
        _basset.form = {
            name: formElem.name,
            id: formElem.id,
            placeholder: formElem.placeholder,
            autocomplete: formElem.autocomplete,
            type: formElem.type
        };
        sendData();
        */
    };

    // track content
    function trackContent() {
        _basset.page = {};
        _basset.page.title = document.title;
        // This works well, but way too many prices exists on most checkout pages
        //pricePattern = /\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})/g;
        //ignoreTagsPattern = /(<(?:script|style)[\s\S]*?<\/(?:script|style)>)/g;
        //_basset.page.price = html.replace(ignoreTagsPattern, "").match(pricePattern);
        sendData();
    };

    // track fingerprint
    function trackFingerprint() {
        Fingerprint2.prototype.getAll = function(){
            var all = {};
            all.userAgent = this.userAgentKey([]);
            all.language = this.languageKey([]);
            all.colorDepth = this.colorDepthKey([]);
            all.screenResolution = this.screenResolutionKey([]);
            all.timezoneOffset = this.timezoneOffsetKey([]);
            all.sessionStorage = this.sessionStorageKey([]);
            all.localStorage = this.localStorageKey([]);
            all.indexedDb = this.indexedDbKey([]);
            all.addBehavior = this.addBehaviorKey([]);
            all.openDatabase = this.openDatabaseKey([]);
            all.cpuClass = this.cpuClassKey([]);
            all.platform = this.platformKey([]);
            all.doNotTrack = this.doNotTrackKey([]);
            all.plugins = this.pluginsKey([]);
            //all.canvas = this.canvasKey([]); left out for better performance
            //all.webgl = this.webglKey([]); left out for better performance
            all.adBlock = this.adBlockKey([]);
            all.hasLiedLanguages = this.hasLiedLanguagesKey([]);
            all.hasLiedResolution = this.hasLiedResolutionKey([]);
            all.hasLiedOs = this.hasLiedOsKey([]);
            all.hasLiedBrowser = this.hasLiedBrowserKey([]);
            all.touchSupport = this.touchSupportKey([]);
            // fonts are left out for better performance
            return all;
        }
        _basset.fingerprint = new Fingerprint2().getAll();
        sendData();
    };



    // Execute functions when the time is right
    // ----------------------------------------

    // Track context and ip right away
    trackContext();
    trackIp();

    // Start fingerprint tracking when fingerprintjs2 is loaded
    var t = document.createElement('script');
    t.type = 'text/javascript';
    t.async = true;
    t.src = '//cdn.jsdelivr.net/fingerprintjs2/0.7.1/fingerprint2.min.js';
    t.onload = function () {
        trackFingerprint();
    };
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(t, s);

    // Start content tracking and add listeners when page has loaded
    var oldOnLoad = window.onload;
    window.onload = function () {
        if (typeof window.onload != 'function') {
            oldOnLoad();
        }
        //addFormListeners();
        trackContent();
    };



    // Correct event listener queueing
    // -------------------------------

    // written by Dean Edwards, 2005
    // with input from Tino Zijdel, Matthias Miller, Diego Perini
    // http://dean.edwards.name/weblog/2005/10/add-event/
    function addEvent(element, type, handler) {
        if (element.addEventListener) {
            element.addEventListener(type, handler, false);
        } else {
            // assign each event handler a unique ID
            if (!handler.$$guid) handler.$$guid = addEvent.guid++;
            // create a hash table of event types for the element
            if (!element.events) element.events = {};
            // create a hash table of event handlers for each element/event pair
            var handlers = element.events[type];
            if (!handlers) {
                handlers = element.events[type] = {};
                // store the existing event handler (if there is one)
                if (element["on" + type]) {
                    handlers[0] = element["on" + type];
                }
            }
            // store the event handler in the hash table
            handlers[handler.$$guid] = handler;
            // assign a global event handler to do all the work
            element["on" + type] = handleEvent;
        }
    };
    // a counter used to create unique IDs
    addEvent.guid = 1;

    function handleEvent(event) {
        var returnValue = true;
        // grab the event object (IE uses a global event object)
        event = event || fixEvent(((this.ownerDocument || this.document || this).parentWindow || window).event);
        // get a reference to the hash table of event handlers
        var handlers = this.events[event.type];
        // execute each event handler
        for (var i in handlers) {
            this.$$handleEvent = handlers[i];
            if (this.$$handleEvent(event) === false) {
                returnValue = false;
            }
        }
        return returnValue;
    };

    function fixEvent(event) {
        // add W3C standard event methods
        event.preventDefault = fixEvent.preventDefault;
        event.stopPropagation = fixEvent.stopPropagation;
        return event;
    };
    fixEvent.preventDefault = function() {
        this.returnValue = false;
    };
    fixEvent.stopPropagation = function() {
        this.cancelBubble = true;
    };
})();
