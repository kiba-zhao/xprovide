# xprovide #
模块提供工具，通过define定义模块，通过require获取模块．类似模块依赖注入工具．

## Install ##

``` shell
npm install xprovide
```

## Usage ##
xprovide支持[xboot](https://github.com/kiba-zhao/xboot)引导方式下，作为项目插件使用．在[xboot](https://github.com/kiba-zhao/xboot)引导加载`xboot.js`文件时，能够通过[xboot](https://github.com/kiba-zhao/xboot)加载使用项目，项目引擎及项目插件下的`xprovide.js`文件．

``` javascript
// {cwd}/xprovide.js
// {cwd}/node_modules/{xxx engine}/xprovide.js
// {cwd}/node_modules/{xxx plugin}/xprovide.js

module.exports = (provider) =>{
    
    // 定义模块
    provider.define("id",["dep1","opt_dep1?"],(dep1,optDep1)=>{
        //　构建生成模块
        const model = {a:1,b:true,c:dep1,dd:optDep1};
        return model;
    });
    
    // 使用模块
    provide.require(["id"],(model)=>{
        console.log(model);
    });
};
```

## Documentations ##
使用`jsdoc`生成注释文档

``` shell
git clone https://github.com/kiba-zhao/xprovide.git
cd xprovide
npm install
npm run docs
open docs/index.html
```
n
## License ##
[MIT](LICENSE)
