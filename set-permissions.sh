#!/bin/bash

# Sets the permissions needed by OpenShift

chgrp -R 0 /var/log/nginx && chmod -R g=u /var/log/nginx
chgrp -R 0 /var/lib/nginx && chmod -R g=u /var/lib/nginx
chgrp -R 0 /usr/local/etc && chmod -R g=u /usr/local/etc

# Setting permissions excluding node_modules (to speedup the execution)
shopt -s extglob
chgrp -R 0 /entando-code/strapi-code/!(node_modules) && chmod -R g=u /entando-code/strapi-code/!(node_modules)
shopt -u extglob
