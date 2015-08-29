npm install
bower install x3dom/x3dom#1.7.0 --save
cd  bower_components/x3dom
python manage.py --build production

X3DOM=dist/x3dom-kibana.js

echo '!function() {' > ${X3DOM}
cat dist/x3dom-full.js >> ${X3DOM}
echo '  if (typeof define === "function" && define.amd) define(x3dom); else if (typeof module === "object" && module.exports) module.exports = x3dom;' >> ${X3DOM}
echo '  this.x3dom = x3dom;' >> ${X3DOM}
echo '}();' >> ${X3DOM}
open https://www.youtube.com/watch?v=AZbO2Y8NNS8
