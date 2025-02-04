import { openDB } from "idb";
import { Dic } from "~/Helpers/Entities";

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.1.0
 */
export class DB<T> {
  public Ins: T;

  constructor(factory: () => T) {
    this.Ins = factory();
  }

  public async init() {
    return openDB(Dic.Name, 1, {
      upgrade(db) {
        db.createObjectStore(Dic.Name);
      },
    });
  }

  public async save(key: string, data = this.Ins) {
    this.Ins = data;
    const db = await this.init();
    await db.put(Dic.Name, data, key);
    db.close();
  }

  public async load(key: string) {
    const db = await this.init();
    const res = await db.get(Dic.Name, key) as T;
    if (res) {
      this.Ins = res;
    }
    db.close();
  }
}
