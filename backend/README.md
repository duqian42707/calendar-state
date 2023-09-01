## 问题记录

问题描述：

```
WARNING: This is a development server. Do not use it in a production deployment. Use a production WSGI server instead.
```

解决方法：

```bash
pip install waitress

nohup waitress-serve --port=9020 --call main:create_app >> ./log/flask.log 2>&1 & echo $! > run.pid
```
