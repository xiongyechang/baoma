const protocol = `http`;
let URL = ``;
if (process.env.NODE_ENV === "development") {
  const host = `127.0.0.1`;
  const port = 9090;
  URL = `${protocol}://${host}:${port}`;
} else if (process.env.NODE_ENV === "production") {
  const host = `cs.xiongyechang.com`;
  URL = `${protocol}://${host}`;
}

//URL = `http://cs.xiongyechang.com`;
// URL = `http://47.111.130.92:9090`;

export const baseURL = URL;
