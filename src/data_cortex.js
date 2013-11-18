
(function(){

var existing_events = [];
if( 'dcQueue' in window && 'pop' in window.dcQueue )
{
    existing_events = window.dcQueue;
}

var dcQueue = {};

dcQueue._eventList = [];
dcQueue._sendTimeout = false;
dcQueue._config = {
    ready: false,
    global_props: {}
};
dcQueue._sendInFlight = false;
dcQueue.push = function(arg)
{
    function add_event(e)
    {
        if( typeof e == 'function' )
        {
            e(dcQueue);
        }
        else
        {
            if( 'type' in e && e.type == 'install' )
            {
                if( getStoredValue('dc_sent_install') )
                {
                    // already sent install, skip!
                    return;
                }
            }
            if( !('event_datetime' in e ) )
            {
                e.event_datetime = getISODateString();
            }
            dcQueue._eventList.push(e);
        }
    }

    if( 'pop' in arg )
    {
        var e;
        while( e = arg.pop() )
        {
            add_event(e);
        }
    }
    else
    {
        add_event(arg);
    }
 
    if( dcQueue._eventList.length < 100 )
    {
        if( dcQueue._sendTimeout )
        {
            window.clearTimeout(dcQueue._sendTimeout);
            dcQueue._sendTimeout = false;
        }
        dcQueue._sendTimeout = window.setTimeout(sendEvents,1000);
    }
    else
    {
        sendEvents();
    }
};
dcQueue.setup = function(config)
{
    if( !config.org )
    {
        throw "org is required on config";
    }
    if( !config.api_key )
    {
        throw "api_key is required on config";
    }
    if( !config.app_ver )
    {
        throw "app_ver is required on config";
    }
    setConfigProperties(config);
    dcQueue._config.ready = true;
    sendEvents();
};
dcQueue.updateSetup = function(config)
{
    setConfigProperties(config);
    sendEvents();
}

function setConfigProperties(params)
{
    var config = dcQueue._config
    var global_props = config.global_props;

    if( params.org )
    {
        config.org = params.org;
    }
    if( params.api_key )
    {
        global_props.api_key = params.api_key;
    }
    if( params.app_ver )
    {
        global_props.app_ver = params.app_ver;
    }
    if( params.user_tag )
    {
        global_props.user_tag = params.user_tag;
    }
    if( params.facebook_tag )
    {
        global_props.facebook_tag = params.facebook_tag;
    }
    if( params.twitter_tag )
    {
        global_props.twitter_tag = params.twitter_tag;
    }
    if( params.google_tag )
    {
        global_props.google_tag = params.google_tag;
    }
    if( params.game_center_tag )
    {
        global_props.game_center_tag = params.game_center_tag;
    }
    if( params.device_tag )
    {
        global_props.device_tag = params.device_tag;
    }
 
    if( !global_props.device_tag )
    {
        if( getStoredValue('dc_device_tag') )
        {
            global_props.device_tag = getStoredValue('dc_device_tag');
        }
        else
        {
            var device_tag = makeRandomID(62);
            setStoredValue('dc_device_tag',device_tag);
            global_props.device_tag = device_tag;
        }
    }
    setDefaultProperties(global_props);

    if( getStoredValue('__dc_url_override') )
    {
        config.track_url = getStoredValue('__dc_url_override');
    }
    else
    {
        config.track_url = "https://api.data-cortex.com/";
    }
    config.track_url += config.org + "/1/track";
    config.global_props = global_props;
    dcQueue._config = config;
}
function setDefaultProperties(global_props)
{
    function regexGet(haystack,regex,def)
    {
        var matches = haystack.match(regex);
        if( matches && matches.length > 1 )
        {
            return matches[1];
        }
        else
        {
            return def;
        }
    }

    var ua = navigator.userAgent
 
    var os = "unknown";
    var os_ver = "unknown";
    if( ua.indexOf("Win") != -1 )
    {
        os = "windows";
        os_ver = regexGet(ua,/Windows NT ([^ ;)]*)/,"unknown");
    }
    else if( ua.indexOf("iPhone OS") != -1 )
    {
        os = "ios";
        os_ver = regexGet(ua,/iPhone OS ([^ ;)]*)/,"unknown");
        os_ver = os_ver.replace(/_/g,'.');
    }
    else if( ua.indexOf("Mac OS X") != -1 )
    {
        os = "mac";
        os_ver = regexGet(ua,/Mac OS X ([^ ;)]*)/,"unknown");
        os_ver = os_ver.replace(/_/g,'.');
        os_ver = os_ver.replace(/\.0$/,'');
    }
    else if( ua.indexOf("Android") != -1 )
    {
        os = "android";
        os_ver = regexGet(ua,/Android ([^ ;)]*)/,"unknown");
        os_ver = os_ver.replace(/_/g,'.');
    }
    else if( ua.indexOf("X11") != -1 )
    {
        os = "unix";
    }
    else if( ua.indexOf("Linux") != -1 )
    {
        os = "linux";
    }
 
    var browser = "unknown";
    var browser_ver = "unknown";
    if( ua.indexOf("Chrome") != -1 )
    {
        browser = "chrome";
        browser_ver = regexGet(ua,/Chrome\/([^ ;)]*)/,"unknown");
    }
    else if( ua.indexOf("CriOS") != -1 )
    {
        browser = "chrome";
        browser_ver = regexGet(ua,/CriOS\/([^ ;)]*)/,"unknown");
    }
    else if( ua.indexOf("Firefox") != -1 )
    {
        browser = "firefox";
        browser_ver = regexGet(ua,/Firefox\/([^ ;)]*)/,"unknown");
    }
    else if( ua.indexOf("Android") != -1 )
    {
        browser = "android";
        browser_ver = regexGet(ua,/Version\/([^ ;)]*)/,"unknown");
    }
    else if( ua.indexOf("Safari") != -1 )
    {
        browser = "safari";
        browser_ver = regexGet(ua,/Version\/([^ ;)]*)/,"unknown");
    }
    else if( ua.indexOf("Trident") != -1 )
    {
        browser = "ie";
        browser_ver = regexGet(ua,/rv:([^ ;)]*)/,"unknown");
    }
    else if( ua.indexOf("MSIE") != -1 )
    {
        browser = "ie";
        browser_ver = regexGet(ua,/MSIE ([^ ;)]*)/,"unknown");
    }
 
    var device_type = "desktop";
    if( ua.indexOf("iPod") != -1 )
    {
        device_type = "ipod";
    }
    else if( ua.indexOf("iPhone") != -1 )
    {
        device_type = "iphone";
    }
    else if( ua.indexOf("iPad") != -1 )
    {
        device_type = "ipad";
    }
    else if( ua.indexOf("Android") != -1 )
    {
        if( ua.indexOf("Mobile") != -1 )
        {
            device_type = "android";
        }
        else
        {
            device_type = "android_tablet";
        }
    }
 
    global_props.os = os;
    global_props.os_ver = os_ver;
    global_props.browser = browser;
    global_props.browser_ver = browser_ver;
    global_props.device_type = device_type;
}

function sendEvents()
{
    if( !dcQueue._config.ready )
    {
        // Can't send before config does its thing
        return;
    }
    if( dcQueue._eventList.length == 0 )
    {
        return;
    }
    if( dcQueue._sendInFlight )
    {
        return;
    }
    dcQueue._sendInFlight = true;
 
    var config = dcQueue._config;
    var post_data = jQuery.extend({},config.global_props);
    post_data.events = dcQueue._eventList.splice(0,100);
 
    var json = JSON.stringify(post_data);
 
    var url = config.track_url;
    url += "?current_time=" + encodeURIComponent(getISODateString());
    jQuery.ajax({
        type: 'POST',
        url: url,
        contentType: 'application/json',
        data: json,
        processData: false,
        success: function(data)
        {
            dcQueue._sendInFlight = false;
            for( var i = 0 ; i < post_data.events.length ; ++i )
            {
                var e = post_data.events[i];
                if( 'type' in e && e.type == 'install' )
                {
                    setStoredValue('dc_sent_install',true);
                }
            }
        },
        error: function()
        {
            // put back the events we sent
            dcQueue._eventList = dcQueue._eventList.concat(post_data.events);
            dcQueue._sendInFlight = false;
        }
    });
}

function getStoredValue(key)
{
    var json;
    if( 'localStorage' in window )
    {
        json = window.localStorage[key];
    }
    else
    {
        json = getCookie(key);
    }
    if( json )
    {
        try
        {
            return JSON.parse(json);
        }
        catch(e)
        {
            return;
        }
    }
    else
    {
        return;
    }
}
function setStoredValue(key,value)
{
    var json = JSON.stringify(value);
    if( 'localStorage' in window )
    {
        window.localStorage[key] = json;
    }
    else
    {
        setCookie(key,json);
    }
}
function setCookie(key,value)
{
    var encoded_value = encodeURIComponent(value);
 
    var cookie = key + "=" + encoded_value + "; ";
    cookie += " expires=Thu, 31 Dec 2026 00:00:00; path=/";
 
    document.cookie = cookie;
}
function getCookie(find_key)
{
    var cookies = document.cookie.split(';');
 
    for( var i = 0 ; i < cookies.length ; ++i )
    {
        var cookie = cookies[i];
        var key = cookie.split('=')[0].trim();
        if( key == find_key )
        {
            var encoded_value = cookie.split('=')[1].trim();
            var value = decodeURIComponent(encoded_value);
            return value;
        }
    }
    return;
}

function makeRandomID(length)
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < length; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}
function getISODateString()
{
    function pad(number)
    {
        var r = String(number);
        if ( r.length === 1 ) {
            r = '0' + r;
        }
        return r;
    }

    var d = new Date();
    return d.getUTCFullYear()
        + '-' + pad( d.getUTCMonth() + 1 )
        + '-' + pad( d.getUTCDate() )
        + 'T' + pad( d.getUTCHours() )
        + ':' + pad( d.getUTCMinutes() )
        + ':' + pad( d.getUTCSeconds() )
        + '.' + String( (d.getUTCMilliseconds()/1000).toFixed(3) ).slice( 2, 5 )
        + 'Z';
}

window.dcQueue = dcQueue;

window.dcQueue.push(existing_events);

})();
