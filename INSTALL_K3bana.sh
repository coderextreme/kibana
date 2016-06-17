nvm install "$(cat .node-version)"
export PATH=/c/Python27/:${PATH}
npm install --python=/c/Python27/
bower install
cd  bower_components/x3dom
/c/Python27/python.exe manage.py --build production
cd ../..
mkdir -p node_modules/x3dom/dist

export X3DOM=node_modules/x3dom/dist/x3dom-kibana.js

echo '!function() {' > ${X3DOM}
cat bower_components/x3dom/dist/x3dom-full.js >> ${X3DOM}
echo '  if (typeof define === "function" && define.amd) define(x3dom); else if (typeof module === "object" && module.exports) module.exports = x3dom;' >> ${X3DOM}
echo '  this.x3dom = x3dom;' >> ${X3DOM}
echo '}();' >> ${X3DOM}
#  open https://www.youtube.com/watch?v=AZbO2Y8NNS8
npm run elasticsearch
npm start
