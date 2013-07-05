define(
[
  "dojo/_base/lang",
  "dojo/_base/json",
  "dojo/_base/url",
  "dojo/cookie",
  "dojo/Deferred",
  "dojo/io-query",
  "esri/IdentityManager"
], 
function(lang, dojoJson, Url, cookie, Deferred, ioquery, idManager) {
  
  var oAuthHelper = {
    
    portal: "http://www.arcgis.com",
    
    popupCallbackPage: window.location.protocol + "//" + 
                       window.location.host + 
                       window.location.pathname.replace(/\/[^\/]+$/, "") + 
                       "/oauth-callback.html",

    // popupCallbackPage: window.location.protocol + "//" + 
    //                    window.location.host + 
    //                    "/GitHub/quickstart-map-js/js/oAuth" + 
    //                    "/oauth-callback.html",
    
    init: function(parameters) {
      /**
       * parameters = {
       *   appId:       "<String>",
       *   portal:      "<String>", // deafult is "http://www.arcgis.com"
       *   expiration:   <Number>,  // in minutes
       *   popup:        <Boolean>
       * } 
       */
      
      lang.mixin(this, parameters);
      this.portalUrl = this.portal + "/sharing/rest";
      
      // Read OAuth response from the page url fragment if available,
      // and register with identity manager
      this.checkOAuthResponse(window.location.href, true);
      
      // Read token from cookie if available, and register
      // with identity manager
      this.checkCookie();
      
      // You don't need this if you require your users to sign-in
      // before using the app. This override helps trigger OAuth
      // flow instead of the legacy generateToken flow.
      this.overrideIdentityManager();

      this.popupCallbackPage = this.redirect_uri;  // Als - allows callback.html to live outside of current directory!
    },
    
    isSignedIn: function() {
      return !!idManager.findCredential(this.portalUrl);
    },
    
    signIn: function() {
      var deferred = (this.deferred = new Deferred());
      
      var authParameters = {
        client_id:      this.appId,
        response_type:  "token",
        expiration:     this.expiration, // in minutes. Default is 30.
        redirect_uri:   this.popup ? 
                          this.popupCallbackPage : 
                          window.location.href.replace(/#.*$/, "")
      };
      
      var authUrl = this.portal.replace(/^http:/i, "https:") + 
                    "/sharing/oauth2/authorize?" + 
                    ioquery.objectToQuery(authParameters);
  
      if (this.popup) {
        // Internet Explorer 8 throws error if windowName  
        // (second argument below) has hyphen
        window.open(
          authUrl, 
          "esrioauth", 
          "width=480,height=320,location=yes,status=yes,scrollbars=yes"
        );
      }
      else {
        window.location = authUrl;
      }
      
      return deferred;
    },
    
    signOut: function() {
      // Delete the cookie
      cookie("arcgis_auth", null, {
        expires: -1, 
        path:    "/", 
        domain:  document.domain
      });
      
      window.location.reload();
    },
    
    checkOAuthResponse: function(url, clearHash) {
      // This method will be called from popup callback page as well
      
      var oauthResponse = this.parseFragment(url);
      
      if (oauthResponse) {
        if (clearHash) { // redirection flow
          // Remove OAuth bits from the URL fragment
          window.location.hash = "";
        }

        if (oauthResponse.error) {
          var error = new Error(oauthResponse.error);
          error.details = [ oauthResponse.error_description ];
          
          if (this.deferred) {
            this.deferred.reject(error);
          }
        }
        else {
          var credential = this.registerToken(oauthResponse);

          // User checked "Keep me signed in" option
          if (oauthResponse.persist) {
            cookie("arcgis_auth", dojoJson.toJson(oauthResponse), {
              expires: new Date(oauthResponse.expires_at),
              path:    "/",
              domain:  document.domain
            });
            
            console.log("[Cookie] Write: ", cookie("arcgis_auth"));
          }
          
          if (this.deferred) {
            this.deferred.resolve(credential);
          }
        }
      }
    },
    
    checkCookie: function() {
      var ckie = cookie("arcgis_auth");

      if (ckie) {
        console.log("[Cookie] Read: ", ckie);
        
        var oauthResponse = dojoJson.fromJson(ckie);
        this.registerToken(oauthResponse);
      }
    },
    
    registerToken: function(oauthResponse) {
      // Register the access token with Identity Manager, so that
      // it can be added to all ArcGIS Online REST API requests

      idManager.registerToken({
        server:  this.portalUrl,
        userId:  oauthResponse.username,
        token:   oauthResponse.access_token,
        expires: oauthResponse.expires_at,
        ssl:     oauthResponse.ssl
      });
      
      var credential = idManager.findCredential(this.portalUrl, oauthResponse.username);
      
      console.log("Token registered with Identity Manager: ", credential);
      return credential;
    },
    
    parseFragment: function(url) {
      var urlObj = new Url(url),
          fragment = urlObj.fragment ? ioquery.queryToObject(urlObj.fragment) : null;
  
      if (fragment) {
        if (fragment.access_token) {
          console.log("[OAuth Response]: ", fragment);
          
          // Convert from String to Number
          fragment.expires_in = Number(fragment.expires_in);
          
          // Calculate universal time
          fragment.expires_at = (new Date()).getTime() + (fragment.expires_in * 1000);
          
          fragment.ssl = (fragment.ssl === "true");
        }
        else if (fragment.error) {
          console.log("[OAuth Error]: ", fragment.error, " - ", fragment.error_description);
        }
  
        return fragment;
      }
    },
    
    overrideIdentityManager: function() {
      var signInMethod = idManager.signIn,
          helper = this;
      
      idManager.signIn = function(resUrl, serverInfo, options) {
        
        return (serverInfo.server.indexOf(".arcgis.com") !== -1) ?
                  // OAuth flow
                  helper.signIn() :
                  // generateToken flow
                  signInMethod.apply(this, arguments);
      };
    }
  };
  
  window.oAuthHelper = oAuthHelper;
  
  return oAuthHelper;
});  
