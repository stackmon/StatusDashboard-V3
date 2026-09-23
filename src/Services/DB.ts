import { deleteDB, openDB } from "idb";
import { Dic } from "~/Helpers/Entities";

const DB_VERSION = 2;

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.3.0
 */
export class DB<T> {
  public Ins: T;
  public SavedAt: Date | null = null;
  private dbName: string;
  private storeName: string;

  constructor(factory: () => T) {
    this.Ins = factory();
    this.dbName = Dic.Symbol;
    this.storeName = Dic.Symbol;
  }

  public async init() {
    try {
      return openDB(this.dbName, DB_VERSION, {
        upgrade(db) {
          if (db.objectStoreNames.contains(Dic.Symbol)) {
            db.deleteObjectStore(Dic.Symbol);
          }
          db.createObjectStore(Dic.Symbol);
        },
      });
    } catch (error) {
      await deleteDB(this.dbName);

      return openDB(this.dbName, DB_VERSION, {
        upgrade(db) {
          db.createObjectStore(Dic.Symbol);
        },
      });
    }
  }

  public async save(key: string, data = this.Ins) {
    this.Ins = data;
    this.SavedAt = new Date();
    const db = await this.init();
    await db.put(this.storeName, data, key);
    await db.put(this.storeName, this.SavedAt, `${key}:SavedAt`);
    db.close();
  }

  public async load(key: string) {
    const db = await this.init();
    const res = await db.get(this.storeName, key) as T;

    if (res) {
      const savedAt = await db.get(this.storeName, `${key}:SavedAt`) as Date | undefined;
      this.Ins = res;
      this.SavedAt = savedAt ?? null;
    }

    db.close();
  }
}
