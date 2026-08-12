# 马马 MAMA 网站发布说明

当前已作为 Candy Coin 的独立子网站发布，网站地址为：

`https://cai-jiahang.github.io/candy-coin/mama-color-lab/`

## 第一次发布

1. 登录 GitHub，打开 `https://github.com/new`。
2. Repository name 填写 `mama-color-lab`。
3. Visibility 选择 `Public`，然后创建仓库。
4. 进入仓库，选择 `Add file`、`Upload files`。
5. 将本文件夹内的文件全部上传到仓库根目录。不要上传外层 ZIP，也不要让 `index.html` 再套一层文件夹。
6. 提交文件后，进入 `Settings`、`Pages`。
7. 在 `Build and deployment` 中将 Source 设为 `Deploy from a branch`。
8. Branch 选择 `main`，文件夹选择 `/(root)`，点击 `Save`。
9. 等待一至五分钟后访问上方网址。

仓库根目录至少应看到：

```text
index.html
.nojekyll
README.md
assets/
```

## 后续调整

更新本地文件后，在 GitHub 仓库中重新上传同名文件并提交。GitHub Pages 会自动更新，网址保持不变。

## 接入 Candy Coin

建议在 Candy Coin 中增加一张“马马 MAMA”作品卡片，封面使用 `assets/images/hero.webp`，按钮链接到：

`https://cai-jiahang.github.io/mama-color-lab/`

这种方式可以让两个项目独立维护，也不会因为更新马马页面而影响 Candy Coin 主站。
