
var g_dc_api_key = false;

function docReady()
{
    if( 'dc_api_key' in window.localStorage )
    {
        g_dc_api_key = window.localStorage['dc_api_key'];
        $('#api_key').val(g_dc_api_key);
    }

    window.dcQueue = window.dcQueue || [];
    
    dcQueue.push({
        'type': 'install',
        'kingdom': 'install_king',
        'phylum': 'install_phy',
        'class': 'install_class',
    });

    dcQueue.push({
        'type': 'usage',
        'kingdom': 'usage_king',
        'phylum': 'usage_phy',
        'class': 'usage_class',
    });
    
    dcQueue.push(dcReady);
}
$(document).ready(docReady);

function dcReady()
{
    if( g_dc_api_key )
    {
        dcQueue.setup({
            api_key: g_dc_api_key,
            org: "example",
            app_ver: "0.1"
        });
    }
}

function saveApiKey()
{
    var api_key = $('#api_key').val();
    if( api_key.length > 0 )
    {
        g_dc_api_key = api_key;
        window.localStorage['dc_api_key'] = api_key;
        dcQueue.push(dcReady);
    }
    else
    {
        window.alert("Please enter a valid API Key.");
    }
}

function sendLevelStart()
{
    var level = $('#level_num').val();
    var level_name = $('#level_name').val();
    dcQueue.push({
        'type': 'event',
        'kingdom': 'game_action',
        'phylum': 'game_start',
        'class': 'context',
        'order': level,
        'species': level_name
    });
}
function sendLevelFailure()
{
    var level = $('#level_num').val();
    var level_name = $('#level_name').val();
    dcQueue.push({
        'type': 'event',
        'kingdom': 'game_action',
        'phylum': 'fail',
        'class': 'context',
        'order': level,
        'species': level_name
    });
}
function sendLevelSuccess()
{
    var level = $('#level_num').val();
    var level_name = $('#level_name').val();
    dcQueue.push({
        'type': 'event',
        'kingdom': 'game_action',
        'phylum': 'success',
        'class': 'context',
        'order': level,
        'species': level_name
    });
}
function linkFacebook()
{
    var fb_id = $('#fb_id').val();
    
    if( fb_id.length > 0 )
    {
        dcQueue.updateSetup({
            facebook_tag: fb_id
        });
        // Link track is optional
        dcQueue.push({
            'type': 'link',
            'facebook_tag': fb_id
        });
    }
    else
    {
        window.alert("Please enter a facebook id.");
    }
}
function sendFacebookMessage()
{
    var fb_id = $('#fb_id').val();
    var to_fb_list = $('#to_fb_list').val();
    if( fb_id.length == 0 || to_fb_list.length == 0 )
    {
        window.alert("Please enter a facebook id and to_list with at least one item.");
    }
    else
    {
        var to_list = to_fb_list.split(',');
        dcQueue.push({
            'type': 'message_send',
            'network': 'facebook',
            'channel': 'feed',
            'from_tag': fb_id,
            'to_list': to_list
        });
    }
}
function sendFacebookClick()
{
    var fb_id = $('#fb_id').val();
    var from_fb_id = $('#from_fb_id').val();
    if( fb_id.length == 0 || from_fb_id.length == 0 )
    {
        window.alert("Please enter a facebook id and from_fb_id.");
    }
    else
    {
        var to_list = to_fb_list.split(',');
        dcQueue.push({
            'type': 'message_click',
            'network': 'facebook',
            'channel': 'feed',
            'from_tag': from_fb_id,
            'to_tag': fb_id
        });
    }
}
function sendExperimentEnroll()
{
    var experiment_name = $('#experiment_name').val();
    var variant_name = $('#variant_name').val();
    if( experiment_name.length == 0 || variant_name.length == 0 )
    {
        window.alert("Please enter a experiment name and variant.");
    }
    else
    {
        dcQueue.push({
            'type': 'experiment',
            'experiment_name': experiment_name,
            'variant_name': variant_name
        });
    }
}
function sendExperimentDisenroll()
{
    var experiment_name = $('#experiment_name').val();
    if( experiment_name.length == 0 )
    {
        window.alert("Please enter a experiment name to disenroll.");
    }
    else
    {
        dcQueue.push({
            'type': 'experiment',
            'experiment_name': experiment_name,
            'variant_name': false
        });
    }
}
function sendEconomy()
{
    var spend_amount = $('#spend_amount').val();
    var spend_currency = $('#spend_currency').val();
    var spend_type = $('#spend_type').val();
    if( spend_amount.length == 0 || spend_currency.length == 0 )
    {
        window.alert("Please enter a spend amount and currency.");
    }
    else
    {
        var event = {
            'type': 'economy',
            'spend_amount': spend_amount,
            'spend_currency': spend_currency
        };
        if( spend_type.length > 0 )
        {
            event.spend_type = spend_type;
        }
        dcQueue.push(event);
    }
}

function debugClear()
{
    window.localStorage.clear();
}
