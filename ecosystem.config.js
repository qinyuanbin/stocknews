module.exports = {
  apps: [
    {
      name: 'stocknews',
      script: 'dist/src/main.js',  // 编译后的入口文件
      watch: false,
      autorestart: true,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
