import { SubjectLike } from "rxjs";

/**
 * @author Aloento
 * @since 1.0.0
 * @version 1.0.0
 */
export const Dic = {
  Name: "SD3",
  TZ: "Europe/Berlin",
  Time: "DD MMM YY, HH:mm",
  TimeTZ: "DD MMM YYYY, HH:mm [CET]",
  Picker: "YYYY-MM-DDTHH:mm:ss"
};

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
