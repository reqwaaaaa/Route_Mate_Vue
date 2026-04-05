# *RouteMate前端*

## 本地运行
```bash
# 克隆项目
git clone https://github.com/reqwaaaaa/Route_Mate_Vue.git

# 进入项目目录
cd RouteMate-Vue

# 安装依赖
rm -rf node_modules
rm -f package-lock.json   
npm cache clean --force

npm install
```

```bash
# 启动服务
npm run dev
```

Google:` http://localhost:7777`

## 发布
```bash
# 构建测试环境
npm run build:stage

# 构建生产环境
npm run build:prod
```