import { SubjectLike } from "rxjs";

/**
 * @author Aloento
 * @since 1.0.0
 * @version 2.0.0
 */
export const Dic = {
  Symbol: "SD3",
  Name: process.env.SD_NAME || "T Cloud Public",
  Prod: "Status Dashboard",
  TZ: "Europe/Berlin",
  Time: "DD MMM YY, HH:mm",
  TimeTZ: "DD MMM YYYY, HH:mm [CET]",
  Picker: "YYYY-MM-DDTHH:mm"
};

/**
 * @author Aloento
 * @since 1.5.0
 * @version 1.0.0
 */
export const MDUpdatePlugins = [
  'font-bold',
  'font-italic',
  'font-underline',
  'font-strikethrough',
  'block-code-inline',
  'link',
  'clear',
  'logger',
  'mode-toggle'
];

/**
 * @author Aloento
 * @since 1.5.0
 * @version 1.0.0
 */
export const MDDecsPlugins = [
  ...MDUpdatePlugins,
  'list-unordered',
  'list-ordered',
  'block-quote',
  'block-wrap',
  'block-code-block',
  'table',
];

/**
 * @author Aloento
 * @since 1.0.0
 * @version 1.0.0
 */
export abstract class Station {
  private static readonly subjects: Map<string, SubjectLike<unknown>> = new Map();

  public static get<T extends SubjectLike<any>>(topic: string, factor?: () => T): T {
    if (!this.subjects.has(topic)) {
      if (factor) {
        const sub = factor();
        this.subjects.set(topic, sub);
        return sub;
      }

      throw new Promise((res) => {
        const i = setInterval(() => {
          const sub = this.subjects.get(topic);
          if (sub) {
            clearInterval(i);
            res(sub);
          }
        }, 100);
      });
    }

    return this.subjects.get(topic) as T;
  }

  public static delete(topic: string): void {
    this.subjects.delete(topic);
  }
}
