---
name: process-tileset
description: 处理图片为 react-super-tilemap 可用的 tileset 格式（裁剪、透明通道、网格分割）
type: reference
---

# 图片处理技能 - Tileset 制作

用于处理图片素材，生成 react-super-tilemap 可用的 tileset。

## 功能
- 转换格式（JPEG → PNG）
- 添加透明通道（替换背景色为透明）
- 网格裁剪（按指定尺寸分割成独立 tile）
- 生成 tileset 配置文件

## 依赖
- 项目需安装 `canvas` 包：`npm install canvas --save-dev`

## 使用方式
在项目中调用此技能处理图片：
```
/process-tileset [图片路径] [tile尺寸] [背景色]
```

示例：
```
/process-tileset /path/to/tileset.png 32x32 #ffffff
```

## 输出
- `src/assets/tileset/` 目录下的裁剪后 tile 图片
- `src/data/tileset-config.js` tileset 配置文件