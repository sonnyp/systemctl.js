import { describe, afterEach, test, before, after } from "node:test";
import { Systemctl } from "./systemctl.js";

// import { writeFile, readFile } from "node:fs/promises";
// import { stringify, parse } from "ini";
// import path from "path";
// import { tmpdir } from "node:os";
import { setTimeout } from "node:timers/promises";

let systemctl = null;
let service = "re.sonny.systemctl";

// async function setupService() {
//   const service = "re.sonny.systemctl";

//   // Doesn't seem to be a problem but if it ever occurs...
//   // https://unix.stackexchange.com/questions/408840/systemd-custom-service-failed-at-step-exec-spawning-permission-denied
//   // await copyFile(
//   //   path.join(import.meta.dirname, `${service}.js`),
//   //   `/tmp/${service}.js`,
//   // );

//   const config = parse(
//     await readFile(path.join(import.meta.dirname, `${service}.ini`), "utf8"),
//   );
//   // config.Service.ExecStart = `/tmp/${service}.js`;
//   config.Service.ExecStart = path.join(import.meta.dirname, `${service}.js`);

//   const tmp_path = path.join(tmpdir(), `${service}.service`);
//   await writeFile(tmp_path, stringify(config));

//   await systemctl.link(
//     [tmp_path],
//     false, // runtime
//     false, // force
//   );
//   await systemctl.reload();

//   return service;
// }

before(async () => {
  systemctl = new Systemctl();
  await systemctl.init();
  // service = await setupService();
});

afterEach(async () => {
  // Workaround
  // Debian: "service start request repeated too quickly, refusing to start"
  // https://serverfault.com/questions/845471/service-start-request-repeated-too-quickly-refusing-to-start-limit
  // Fedora: "Failed at step EXEC spawning /.../re.sonny.systemctl.js: Permission denied"
  // looks like there is a rate limit with selinux (setenforce 0 works too)
  await setTimeout(2000);
});

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
