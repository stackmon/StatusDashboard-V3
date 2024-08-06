import dayjs from "dayjs";

/**
 * @author Aloento
 * @since 1.0.0
 * @version 1.0.0
 */
const enum ANSI {
  black = 30,
  black_hl = 90,
  balck_bg = 40,
  black_bg_hl = 100,

  red = 31,
  red_hl = 91,
  red_bg = 41,
  red_bg_hl = 101,

  green = 32,
  green_hl = 92,
  green_bg = 42,
  green_bg_hl = 102,

  yellow = 33,
  yellow_hl = 93,
  yellow_bg = 43,
  yellow_bg_hl = 103,

  blue = 34,
  blue_hl = 94,
  blue_bg = 44,
  blue_bg_hl = 104,

  magenta = 35,
  magenta_hl = 95,
  magenta_bg = 45,
  magenta_bg_hl = 105,

  cyan = 36,
  cyan_hl = 96,
  cyan_bg = 46,
  cyan_bg_hl = 106,

  white = 37,
  white_hl = 97,
  white_bg = 47,
  white_bg_hl = 107,

  default = 39,
  default_bg = 49,
};

type level = "error" | "warn" | "info" | "debug" | "throw";

/**
 * @author Aloento
 * @since 1.0.0
 * @version 1.0.0
 */
export class Logger {
  public readonly namespace;

  public readonly info;
  public readonly error;
  public readonly warn;
  public readonly debug;
  public readonly throw;

  public constructor(...namespace: string[]) {
    this.namespace = namespace.join(" > ");

    this.error = console.error.bind(this,
      this.baseColor(
        ANSI.red_bg_hl,
        "error"
      ), "\n\t");

    this.warn = console.warn.bind(this,
      this.baseColor(
        ANSI.yellow_bg_hl,
        "warn"
      ), "\n\t");

    this.info = console.info.bind(this,
      this.baseColor(
        ANSI.blue_bg_hl,
        "info"
      ), "\n\t");

    this.debug = console.debug.bind(this,
      this.baseColor(
        ANSI.green_bg_hl,
        "debug"
      ), "\n\t");

    this.throw = console.log.bind(this,
      this.baseColor(
        ANSI.magenta_bg_hl,
        "throw"
      ),
      "↓ The Following Error is Thrown ↓"
    );
  }

  public With(...names: string[]): Logger {
    return new Logger(this.namespace, ...names);
  }

  private baseColor(color: ANSI, level: level): string {
    return `\x1b[${color};${ANSI.black};1m ${level.toUpperCase()} `
      + `\x1b[0m\x1b[${ANSI.black_bg_hl};${ANSI.white_hl}m ${dayjs().format("YY-M-D H:m:s")} `
      + `\x1b[1m\x1b[${ANSI.balck_bg};${ANSI.white_hl}m ${this.namespace} `;
  }
}

/**
 * @author Aloento
 * @since 1.0.0
 * @version 1.0.0
 */
export interface ICompLog {
  ParentLog: Logger
}
