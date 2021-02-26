# xprovide #
模块提供工具，通过define定义模块，通过require获取模块．类似模块依赖注入工具．

## Install ##

``` shell
npm install xprovide
```

## Usage ##

``` javascript
const {Provider} = require('xprovide');

const provider = new Provider();

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
