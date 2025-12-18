import { systemBus } from "dbus.js";

export class Systemctl {
  bus = null;
  systemd_manager = null;
  service = null;
  job_removed_handlers = new Map();

  async init(bus = systemBus()) {
    if (this.systemd_manager) return;

    this.bus = bus;
    const service = bus.getService("org.freedesktop.systemd1");
    this.service = service;

    const systemd_manager = await service.getInterface(
      "/org/freedesktop/systemd1",
      "org.freedesktop.systemd1.Manager",
    );
    await systemd_manager.subscribe("JobRemoved", this.#onJobRemoved);

    await systemd_manager.Subscribe();
    this.systemd_manager = systemd_manager;
  }

  #onJobRemoved = (job_id, job_path, unit, result) => {
    // TODO: Ugly setTimeout but we are hitting an occasional race condtion without it
    // where await stopService returns the job after the relevant JobRemoved event is triggered
    // systemd warns about this
    // >  This can be achieved in a race-free manner by first subscribing to the JobRemoved() signal, then calling StartUnit() and using the returned job object to filter out unrelated JobRemoved() signals, until the desired one is received, which will then carry the result of the start operation.
    // https://www.freedesktop.org/software/systemd/man/latest/org.freedesktop.systemd1.html
    // this is exactly what we do but probably we're just too slow at returning from DBus methods
    setTimeout(() => {
      const handler = this.job_removed_handlers.get(job_path);
      if (!handler) return;

      if (result === "done") {
        handler.resolve(result);
      } else {
        handler.reject(
          new Error(
            `Job "${job_id}" for unit "${unit}" failed with result "${result}". `,
          ),
        );
      }

      this.job_removed_handlers.delete(job_path);
    });
  };

  // TODO: real async
  async deinit() {
    try {
      await this.systemd_manager?.unsubscribe("JobRemoved", this.#onJobRemoved);
    } catch {}
    this.job_removed_handlers.clear();
    this.bus?.connection.end();
    this.bus = null;
    this.systemd_manager = null;
    this.service = null;
  }

  #createJobHandler(job) {
    const handler = Promise.withResolvers();
    this.job_removed_handlers.set(job, handler);
    return handler.promise;
  }

  async restart(name) {
    const [job] = await this.systemd_manager.RestartUnit(
      normalizeUnitName(name),
      "replace",
    );
    return this.#createJobHandler(job);
  }

  async stop(name) {
    const [job] = await this.systemd_manager.StopUnit(
      normalizeUnitName(name),
      "replace",
    );
    return this.#createJobHandler(job);
  }

  async start(name) {
    const [job] = await this.systemd_manager.StartUnit(
      normalizeUnitName(name),
      "replace",
    );
    return this.#createJobHandler(job);
  }

  async link(paths = []) {
    await this.systemd_manager.LinkUnitFiles(
      paths,
      false, // runtime
      false, // force
    );
  }

  async enable(units = []) {
    await this.systemd_manager.EnableUnitFiles(
      units.map(normalizeUnitName),
      false, // runtime
      false, // force
    );
  }

  async disable(units = []) {
    await this.systemd_manager.DisableUnitFiles(
      units.map(normalizeUnitName),
      false, // runtime
    );
  }

  async reload() {
    await this.systemd_manager.Reload();
  }
}

function normalizeUnitName(name) {
  if (name.endsWith(".service")) return name;
  return name + ".service";
}
