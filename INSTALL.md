npm install
bower install x3dom/x3dom#1.7.0 --save
cd  bower_components/x3dom
python manage.py --build production
echo "module.exports = x3dom;" >> dist/x3dom-full.js
