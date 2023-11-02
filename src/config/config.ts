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
