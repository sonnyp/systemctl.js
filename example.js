import { Systemctl } from "./systemctl.js";

const systemctl = new Systemctl();
await systemctl.init();

await systemctl.start("sshd");
await systemctl.stop("sshd");
await systemctl.disable(["sshd"]);
await systemctl.enable(["sshd"]);
await systemctl.reload();
