
// ==UserScript==
// @name                pg_skip_steamQ
// @description         skip steam queue
// @version             2
// @namespace           https://github.com/preslly/pg_ssq
// @updateURL           https://github.com/preslly/pg_ssq/blob/master/pg_ssQ.user.js
// @icon                https://store.steampowered.com/favicon.ico
// @match               https://store.steampowered.com/explore*
// @grant               none
// ==/UserScript==

var DiscoveryQueueModal, GenerateQueue = function( queueNumber )
{
	if( DiscoveryQueueModal )
	{
		DiscoveryQueueModal.Dismiss();
	}

	DiscoveryQueueModal = ShowBlockingWaitDialog( 'Generating the queue...', 'Generating new discovery queue #' + ++queueNumber );

	jQuery.post( 'https://store.steampowered.com/explore/generatenewdiscoveryqueue', { sessionid: g_sessionID, queuetype: 0 } ).done( function( data )
	{
		var requests = [], done = 0, errorShown;

		for( var i = 0; i < data.queue.length; i++ )
		{
			var request = jQuery.post( 'https://store.steampowered.com/app/10', { appid_to_clear_from_queue: data.queue[ i ], sessionid: g_sessionID } );

			request.done( function()
			{
				if( errorShown )
				{
					return;
				}

				DiscoveryQueueModal.Dismiss();
				DiscoveryQueueModal = ShowBlockingWaitDialog( 'Exploring the queue...', 'Request ' + ++done + ' of ' + data.queue.length );
			} );

			request.fail( function()
			{
				errorShown = true;

				setTimeout( () => GenerateQueue( queueNumber - 1 ), 1000 );

				DiscoveryQueueModal.Dismiss();
				DiscoveryQueueModal = ShowConfirmDialog( 'Error', 'Failed to clear queue item #' + ++done + '. Trying again in a second.', 'Try again' );
			} );

			requests.push( request );
		}

		jQuery.when.apply( jQuery, requests ).done( function()
		{
			DiscoveryQueueModal.Dismiss();

			if( queueNumber < 1 )
			{
				GenerateQueue( queueNumber );
			}
			else
			{
				DiscoveryQueueModal = ShowConfirmDialog( 'Done', 'Queue has been explored ' + queueNumber + ' times', 'Reload the page' ).done( function() {
					ShowBlockingWaitDialog( 'Reloading the page' );
					window.location.reload();
				});
			}
		} );
	} ).fail( function()
	{
		setTimeout( () => GenerateQueue( queueNumber - 1 ), 1000 );

		DiscoveryQueueModal.Dismiss();
		DiscoveryQueueModal = ShowBlockingWaitDialog( 'Error', 'Failed to generate new queue #' + queueNumber + '. Trying again in a second.' );
	} );
};

var buttonContainer = document.createElement( 'div' );
buttonContainer.className = 'discovery_queue_customize_ctn';
buttonContainer.innerHTML = '<div class="btnv6_blue_hoverfade btn_medium" id="js-cheat-queue"><span>Cheat the queue</span></div><span>Discover the queue to get the sale cards</span>';

var container = document.querySelector( '.discovery_queue_customize_ctn' );
container.parentNode.insertBefore( buttonContainer, container );

var button = document.getElementById( 'js-cheat-queue' );

button.addEventListener( 'click', function( )
{
	GenerateQueue( 0 );
}, false );

