import { describe, test, before, after } from "node:test";
import { Systemctl } from "./systemctl.js";

let systemctl = null;
let service = "re.sonny.systemctl";

before(async () => {
  systemctl = new Systemctl();
  await systemctl.init();
});

// afterEach(async () => {
// // Workaround
// // Debian: "service start request repeated too quickly, refusing to start"
// // https://serverfault.com/questions/845471/service-start-request-repeated-too-quickly-refusing-to-start-limit
// // Fedora: "Failed at step EXEC spawning /.../re.sonny.systemctl.js: Permission denied"
// // looks like there is a rate limit with selinux
//   await setTimeout(2000);
// // we don't need this thanks to setenforce 0 in Makefile
// // but I leave it as documenation
// });

describe("stop", async () => {
  test("stops a started service", async () => {
    await systemctl.start(service);
    await systemctl.stop(service);
  });

  test("stops a stopped service", async () => {
    await systemctl.stop(service);
    await systemctl.stop(service);
  });
});

describe("start", async () => {
  await test("starts a stopped service", async () => {
    await systemctl.stop(service);
    await systemctl.start(service);
  });

  await test("starts a started service", async () => {
    await systemctl.start(service);
    await systemctl.restart(service);
  });
});

describe("restart", async () => {
  test("restarts a stopped service", async () => {
    await systemctl.stop(service);
    await systemctl.restart(service);
  });

  test("restarts a started service", async () => {
    await systemctl.start(service);
    await systemctl.restart(service);
  });
});

describe("enable", async () => {
  test("enables a disabled service", async () => {
    await systemctl.disable([service]);
    await systemctl.enable([service]);
  });

  test("enables an enabled service", async () => {
    await systemctl.enable([service]);
    await systemctl.enable([service]);
  });
});

describe("disable", async () => {
  test("disables a disabled service", async () => {
    await systemctl.disable([service]);
    await systemctl.disable([service]);
  });

  test("disables an enabled service", async () => {
    await systemctl.enable([service]);
    await systemctl.disable([service]);
  });
});

test("reloads", async () => {
  await systemctl.reload();
});

after(async () => {
  await systemctl.deinit();
  systemctl = null;
});
