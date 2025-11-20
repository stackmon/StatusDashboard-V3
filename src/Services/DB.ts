import { deleteDB, openDB } from "idb";
import { Dic } from "~/Helpers/Entities";

const DB_VERSION = 2;

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.2.0
 */
export class DB<T> {
  public Ins: T;
  private dbName: string;
  private storeName: string;

  constructor(factory: () => T) {
    this.Ins = factory();
    this.dbName = Dic.Name;
    this.storeName = Dic.Name;
  }

  public async init() {
    try {
      return openDB(this.dbName, DB_VERSION, {
        upgrade(db) {
          if (db.objectStoreNames.contains(Dic.Name)) {
            db.deleteObjectStore(Dic.Name);
          }
          db.createObjectStore(Dic.Name);
        },
      });
    } catch (error) {
      await deleteDB(this.dbName);

      return openDB(this.dbName, DB_VERSION, {
        upgrade(db) {
          db.createObjectStore(Dic.Name);
        },
      });
    }
  }

  public async save(key: string, data = this.Ins) {
    this.Ins = data;
    const db = await this.init();
    await db.put(this.storeName, data, key);
    db.close();
  }

  public async load(key: string) {
    const db = await this.init();
    const res = await db.get(this.storeName, key) as T;
    if (res) {
      this.Ins = res;
    }
    db.close();
  }
}
