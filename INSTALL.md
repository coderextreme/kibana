nvm use 4.4.5
export PATH=/c/Python27/:${PATH}
npm install --python=/c/Python27/
bower install
cd  bower_components/x3dom
/c/Python27/python.exe manage.py --build production

export X3DOM=dist/x3dom-kibana.js

echo '!function() {' > ${X3DOM}
cat dist/x3dom-full.js >> ${X3DOM}
echo '  if (typeof define === "function" && define.amd) define(x3dom); else if (typeof module === "object" && module.exports) module.exports = x3dom;' >> ${X3DOM}
echo '  this.x3dom = x3dom;' >> ${X3DOM}
echo '}();' >> ${X3DOM}
#  open https://www.youtube.com/watch?v=AZbO2Y8NNS8
