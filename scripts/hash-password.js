const { scrypt, randomBytes } = require("node:crypto");

let input = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => { input += chunk; });
process.stdin.on("end", () => {
  const password = input.replace(/\r?\n$/, "");
  input = "";
  if (Buffer.byteLength(password, "utf8") < 12 || Buffer.byteLength(password, "utf8") > 256) {
    console.error("Choose a password between 12 and 256 bytes.");
    process.exitCode = 1;
    return;
  }
  const salt = randomBytes(16);
  scrypt(password, salt, 64, { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }, (error, key) => {
    if (error) {
      console.error("Unable to derive password hash.");
      process.exitCode = 1;
      return;
    }
    console.log(`scrypt$${salt.toString("base64url")}$${key.toString("base64url")}`);
  });
});
