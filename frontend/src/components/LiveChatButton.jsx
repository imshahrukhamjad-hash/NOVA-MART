import React, { useEffect, useState } from 'react';
import { FiMessageSquare } from 'react-icons/fi';

const LiveChatButton = () => {
  const [isTawkLoaded, setIsTawkLoaded] = useState(false);

  useEffect(() => {
    // Check if Tawk.to is loaded after component mounts
    const checkTawk = () => {
      console.log('Tawk_API available:', !!window.Tawk_API);
      if (window.Tawk_API) {
        console.log('Tawk_API methods:', Object.keys(window.Tawk_API));
        setIsTawkLoaded(true);
      } else {
        setIsTawkLoaded(false);
      }
    };

    // Check immediately
    checkTawk();

    // Check after 2 seconds
    setTimeout(checkTawk, 2000);

    // Check after 5 seconds
    setTimeout(checkTawk, 5000);

    // Listen for Tawk.to load event
    if (window.Tawk_API) {
      window.Tawk_API.onLoad = function() {
        console.log('Tawk.to loaded successfully');
        setIsTawkLoaded(true);
      };
    }
  }, []);

  const handleLiveChatClick = () => {
    console.log('Live chat button clicked');
    console.log('window.Tawk_API:', window.Tawk_API);
    console.log('isTawkLoaded:', isTawkLoaded);

    // First, try the standard Tawk.to API methods
    if (window.Tawk_API && typeof window.Tawk_API.maximize === 'function') {
      console.log('Calling Tawk_API.maximize()');
      window.Tawk_API.maximize();
      return;
    } else if (window.Tawk_API && typeof window.Tawk_API.showWidget === 'function') {
      console.log('Calling Tawk_API.showWidget()');
      window.Tawk_API.showWidget();
      return;
    } else if (window.Tawk_API && typeof window.Tawk_API.toggle === 'function') {
      console.log('Calling Tawk_API.toggle()');
      window.Tawk_API.toggle();
      return;
    }

    // If API methods don't work, try to find and click the widget directly
    console.log('Trying direct DOM manipulation...');
    const tawkContainer = document.querySelector('#tawk-widget-container');
    const tawkIframe = document.querySelector('#tawk-widget-container iframe');
    const tawkButton = document.querySelector('#tawk-widget-container .widget-visible');

    console.log('tawkContainer:', tawkContainer);
    console.log('tawkIframe:', tawkIframe);
    console.log('tawkButton:', tawkButton);

    if (tawkContainer) {
      console.log('Found tawk container, trying to show it');
      tawkContainer.style.display = 'block';
      tawkContainer.style.visibility = 'visible';
      tawkContainer.style.opacity = '1';

      // Try to click the widget button
      const widgetButton = tawkContainer.querySelector('button, .tawk-button, [onclick]');
      if (widgetButton) {
        console.log('Found widget button, clicking it');
        widgetButton.click();
      } else {
        // Try to trigger the widget by dispatching events
        console.log('No direct button found, trying event dispatch');
        const event = new MouseEvent('click', { bubbles: true, cancelable: true });
        tawkContainer.dispatchEvent(event);
      }
    } else {
      console.log('No tawk container found, widget may not be loaded yet');
      // Fallback: try after a delay
      setTimeout(() => {
        console.log('Retrying after delay...');
        const retryContainer = document.querySelector('#tawk-widget-container');
        if (retryContainer) {
          console.log('Found container on retry, showing it');
          retryContainer.style.display = 'block';
          retryContainer.style.visibility = 'visible';
          retryContainer.style.opacity = '1';
        } else {
          console.log('Still no container found');
        }
      }, 3000);
    }

    // Last resort: try to manually create the chat if nothing works
    if (!tawkContainer && !window.Tawk_API) {
      console.log('No Tawk.to found, attempting manual widget creation');
      // This is a fallback that may not work due to CORS
      try {
        const script = document.createElement('script');
        script.src = 'https://embed.tawk.to/6952864e7b201a197f1075a1/1jdl5p9df';
        script.async = true;
        document.head.appendChild(script);
        script.onload = () => {
          console.log('Manual script loaded, retrying API calls');
          setTimeout(() => {
            if (window.Tawk_API && window.Tawk_API.maximize) {
              window.Tawk_API.maximize();
            }
          }, 1000);
        };
      } catch (error) {
        console.error('Failed to manually load Tawk.to:', error);
      }
    }
  };

  return (
    <button
      onClick={handleLiveChatClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-neutral-400 hover:bg-neutral-900 hover:text-white ${isTawkLoaded ? 'text-green-400' : 'text-neutral-400'}`}
      title="Live Chat Support"
    >
      <span className="text-lg">
        <FiMessageSquare />
      </span>
      <span className="font-medium text-sm">Live Chat Support</span>
      {!isTawkLoaded && <span className="ml-auto text-xs text-yellow-500">Loading...</span>}
    </button>
  );
};

export default LiveChatButton;