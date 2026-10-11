import fs from 'fs';
import path from 'path';

const DATA_DIR = path.resolve(process.cwd(), 'data', 'db');

function ensureDirectoryExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function generateObjectId(): string {
  const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
  const random = Array.from({ length: 16 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
  return `${timestamp}${random}`;
}

export class Collection<T extends { _id: string; [key: string]: any }> {
  private name: string;
  private filePath: string;
  private cache: T[] | null = null;

  constructor(name: string) {
    this.name = name;
    this.filePath = path.join(DATA_DIR, `${name}.json`);
  }

  private load(): T[] {
    if (this.cache !== null) {
      return this.cache;
    }
    ensureDirectoryExists();
    if (!fs.existsSync(this.filePath)) {
      this.cache = [];
      this.save();
      return this.cache;
    }
    try {
      const data = fs.readFileSync(this.filePath, 'utf-8');
      this.cache = JSON.parse(data || '[]');
      return this.cache!;
    } catch (err) {
      console.error(`Error reading collection ${this.name}:`, err);
      this.cache = [];
      return this.cache;
    }
  }

  private save(): void {
    ensureDirectoryExists();
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.cache || [], null, 2), 'utf-8');
    } catch (err) {
      console.error(`Error saving collection ${this.name}:`, err);
    }
  }

  find(predicate?: (item: T) => boolean): T[] {
    const items = this.load();
    if (!predicate) return [...items];
    return items.filter(predicate);
  }

  findOne(predicate: (item: T) => boolean): T | null {
    const items = this.load();
    const item = items.find(predicate);
    return item ? { ...item } : null;
  }

  findById(id: string): T | null {
    return this.findOne((item) => item._id === id);
  }

  create(doc: Omit<T, '_id' | 'createdAt' | 'updatedAt'> & { _id?: string }): T {
    const items = this.load();
    const now = new Date().toISOString();
    const newDoc = {
      ...doc,
      _id: doc._id || generateObjectId(),
      createdAt: now,
      updatedAt: now,
    } as unknown as T;

    items.push(newDoc);
    this.save();
    return { ...newDoc };
  }

  insertMany(docs: (Omit<T, '_id' | 'createdAt' | 'updatedAt'> & { _id?: string })[]): T[] {
    const items = this.load();
    const now = new Date().toISOString();
    const newDocs: T[] = docs.map((doc) => ({
      ...doc,
      _id: doc._id || generateObjectId(),
      createdAt: now,
      updatedAt: now,
    } as unknown as T));

    items.push(...newDocs);
    this.save();
    return [...newDocs];
  }

  findByIdAndUpdate(id: string, updates: Partial<T>): T | null {
    const items = this.load();
    const index = items.findIndex((item) => item._id === id);
    if (index === -1) return null;

    const updated = {
      ...items[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    items[index] = updated;
    this.save();
    return { ...updated };
  }

  findByIdAndDelete(id: string): boolean {
    const items = this.load();
    const initialLen = items.length;
    this.cache = items.filter((item) => item._id !== id);
    if (this.cache.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  deleteMany(predicate: (item: T) => boolean): number {
    const items = this.load();
    const toKeep = items.filter((item) => !predicate(item));
    const deletedCount = items.length - toKeep.length;
    this.cache = toKeep;
    this.save();
    return deletedCount;
  }

  count(predicate?: (item: T) => boolean): number {
    return this.find(predicate).length;
  }

  clear(): void {
    this.cache = [];
    this.save();
  }
}

// Global Collections instance
export const db = {
  users: new Collection<any>('users'),
  hostels: new Collection<any>('hostels'),
  rooms: new Collection<any>('rooms'),
  allocations: new Collection<any>('allocations'),
  applications: new Collection<any>('applications'),
  fees: new Collection<any>('fees'),
  transactions: new Collection<any>('transactions'),
  maintenance: new Collection<any>('maintenance'),
  visitors: new Collection<any>('visitors'),
  notifications: new Collection<any>('notifications'),
  auditLogs: new Collection<any>('audit_logs'),
};
