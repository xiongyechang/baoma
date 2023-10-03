/*
 * @Author: your name
 * @Date: 2021-08-07 14:48:11
 * @LastEditTime: 2022-01-10 22:58:18
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \baoma\src\config\config.js
 */
const protocol = `http`;
let URL = ``;
if (process.env.NODE_ENV === "development") {
  const host = `127.0.0.1`;
  const port = 8888;
  URL = `${protocol}://${host}:${port}`;
} else if (process.env.NODE_ENV === "production") {
  const host = `cs.xiongyechang.com`;
  URL = `${protocol}://${host}`;
}

// URL = `http://cs.xiongyechang.com`;

export const baseURL = URL;
