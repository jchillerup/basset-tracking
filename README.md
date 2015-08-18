# basset-tracking
Javascript snippet for merchants to include on their checkout web page

##Usage
1. Add the following JavaScript snippet to your checkout web page.

        <script type="text/javascript">
        
          var _basset = {apiKey: '<YOUR_API_KEY>'};
        
          (function() {
            var t = document.createElement('script');
            t.type = 'text/javascript';
            t.async = true; 
            t.src = (document.location.protocol == 'https:'? 'https' : 'http') + '://www.basset.io/track.js';
            var s = document.getElementsByTagName('script')[0];
            s.parentNode.insertBefore(t, s);
          })();
        
        </script>

2. Replace `<YOUR_API_KEY>` with your own API key.
