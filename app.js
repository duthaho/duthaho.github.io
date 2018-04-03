/*! ngryman.sh - v0.0.1-50 - 2013-05-11
 * Copyright (c) 2013 ; Licensed MIT */

(function(){function require(e,t){for(var n=[],r=e.split("/"),i,s,o=0;s=r[o++];)".."==s?n.pop():"."!=s&&n.push(s);n=n.join("/"),o=require,s=o.m[t||0],i=s[n+".js"]||s[n+"/index.js"]||s[n],r='Cannot require("'+n+'")';if(!i)throw Error(r);if(s=i.c)i=o.m[t=s][e=i.m];if(!i)throw Error(r);return i.exports||i(i,i.exports={},function(n){return o("."!=n.charAt(0)?n:e+"/../"+n,t)}),i.exports};
	require.m = [];
	require.m[0] = { "config.js": function(module, exports, require){'use strict';

		var config = {};

		/**
		 * tells if the blog is running locally or on github
		 */
		config.local = !window.location.host;

		/**
		 * tells if this is the index page
		 */
		config.home = (config.local ? /index\.html$/ : /^\/$/).test(window.location.pathname);

		module.exports = config;},
		"index.js": function(module, exports, require){'use strict';

			var config = require('./config'),
				services = require('./services');

			// track with GGA only if when hosted on github
			if (!config.local) {
				services.gga();
			}

			// retreive github projects only on home page
			if (config.home) {
				services.githubProjects();
			}
			// install disqus when scrolling at the bottom of the page, only for articles
			else {
				services.installDisqus();
			}},
		"jquery": { exports: window.$ },
		"services.js": function(module, exports, require){'use strict';

			var config = require('./config'),
				$ = require('jquery');

			/**
			 * https://gist.github.com/ngryman/5266324
			 * @param u
			 */
			function async(u) {
				var s = document.scripts[0],
					i = u.length, g;
				while (i--) {
					g = document.createElement('script');
					g.src = 'https://' + u[i] + '.js';
					s.parentNode.insertBefore(g, s);
				}
			}

			/**
			 * load gga
			 */
			function gga() {
				window._gaq = [['_setAccount', 'UA-5779130-2'], ['_trackPageview']];
				async(['google-analytics.com/ga']);
			}

			/**
			 * load disqus
			 */
			function disqus() {
				window.disqus_shortname = 'ngrymansh';
				async(['ngrymansh.disqus.com/embed']);
			}

			/**
			 * load github projects
			 */
			function githubProjects() {
				$.getJSON('https://api.github.com/users/ngryman/repos?sort=pushed', function(projects) {
					// max projects to 10 - too much is too much
					projects.length = 10;

					// projects list - builds up Prism HTML to render as a JavaScript array
					var projectsHtml = projects.map(function(project) {
						return '<span class="token string">"<a class="token md-link" href="' + project.html_url + '">' + project.name + '</a>"</span>';
					});

					// projects injection - inject it in place of the /* loading... */ placeholder
					$('.token.string').filter(function() {
						return this.innerHTML == "'loading...'";
					}).each(function(index) {
							$(this).replaceWith(projectsHtml[index]);
						});
				});
			}

			/**
			 * install disqus when scrolling at the bottom of the page
			 */
			function installDisqus() {
				var $window = $(window),
					$document = $(document);

				// when the user enters the last portion of the article, we load disqus
				$window.on('scroll', function disqusTrigger() {
					if($window.scrollTop() > $document.height() - $window.innerHeight() * 1.5) {
						disqus();
						$window.off('scroll', disqusTrigger);
					}
				});
			}

			module.exports = {
				gga: gga,
				githubProjects: githubProjects,
				installDisqus: installDisqus
			};}};
	undefined = require('index.js');
}());
