const express = require("express");
const cookieParser = require("cookie-parser");
const csrf = require("csurf");
const path = require("path");

const app = express();
const port = 3000;

// 中介層：解析表單與 Cookie
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// 啟用 CSRF 保護（透過 cookie 儲存 token）
const csrfProtection = csrf({ cookie: true });

// 設定 EJS 模板
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// 顯示表單頁
app.get("/", csrfProtection, (req, res) => {
  res.render("form", { csrfToken: req.csrfToken() });
});

app.post("/transfer", csrfProtection, (req, res) => {
  const { recipient, amount } = req.body;

  // 如果是 API 請求（Accept: application/json）
  if (req.headers.accept && req.headers.accept.includes("application/json")) {
    return res.json({ status: "success", message: "轉帳成功！" });
  }

  // 否則為一般表單請求，導向結果頁
  res.redirect(
    `/success?recipient=${encodeURIComponent(recipient)}&amount=${amount}`
  );
});

app.get("/success", (req, res) => {
  const { recipient, amount } = req.query;
  res.render("success", { recipient, amount });
});

// 錯誤處理器（處理 CSRF 等錯誤）
app.use((err, req, res, next) => {
  if (err.code === "EBADCSRFTOKEN") {
    // token 不正確或缺失時的回應
    return res.status(403).render("error", {
      message: "⚠️ CSRF 驗證失敗，請重新載入頁面後再試一次。",
    });
  }

  // 其他錯誤交給預設處理
  next(err);
});

app.listen(port, () => {
  console.log(`CSRF Demo App 運行在 http://localhost:${port}`);
});
