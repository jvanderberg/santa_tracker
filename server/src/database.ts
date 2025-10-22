import BetterSqlite3 from 'better-sqlite3';
import { Sighting, SightingInput, SightingRow } from './types';

export class Database {
  private db: BetterSqlite3.Database;

  constructor(dbPath: string = 'sightings.db') {
    this.db = new BetterSqlite3(dbPath);
    this.initializeTable();
  }

  private initializeTable(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS sightings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        sighted_at TEXT NOT NULL,
        reported_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        details TEXT
      )
    `);
  }

  public tableExists(tableName: string): boolean {
    const result = this.db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?")
      .get(tableName);
    return result !== undefined;
  }

  public createSighting(input: SightingInput): Sighting {
    const stmt = this.db.prepare(`
      INSERT INTO sightings (latitude, longitude, sighted_at, details, reported_at)
      VALUES (?, ?, ?, ?, ?)
    `);

    const now = new Date().toISOString();
    const result = stmt.run(input.latitude, input.longitude, input.sighted_at, input.details, now);

    const row = this.db
      .prepare('SELECT * FROM sightings WHERE id = ?')
      .get(result.lastInsertRowid) as SightingRow;

    return this.addAgeFields(row);
  }

  public getSightings(date?: string, timezone: string = 'America/Chicago'): Sighting[] {
    let query = 'SELECT * FROM sightings';
    const params: string[] = [];

    // Default to today's date if no date provided
    const dateToUse = date || this.getTodayInTimezone(timezone);

    // Convert local date to GMT range
    const { startGMT, endGMT } = this.dateToGMTRange(dateToUse, timezone);
    query += ' WHERE sighted_at >= ? AND sighted_at < ?';
    params.push(startGMT, endGMT);

    const rows = this.db.prepare(query).all(...params) as SightingRow[];
    return rows.map(row => this.addAgeFields(row));
  }

  public getSightingById(id: number): Sighting | undefined {
    const row = this.db.prepare('SELECT * FROM sightings WHERE id = ?').get(id) as
      | SightingRow
      | undefined;

    return row ? this.addAgeFields(row) : undefined;
  }

  private addAgeFields(row: SightingRow): Sighting {
    const now = new Date();
    const sightedAt = new Date(row.sighted_at);
    const reportedAt = new Date(row.reported_at);

    const sighted_age = Math.floor((now.getTime() - sightedAt.getTime()) / (1000 * 60));
    const reported_age = Math.floor((now.getTime() - reportedAt.getTime()) / (1000 * 60));

    return {
      ...row,
      sighted_age,
      reported_age,
    };
  }

  private dateToGMTRange(
    localDate: string,
    timezone: string
  ): { startGMT: string; endGMT: string } {
    // Parse the local date (YYYY-MM-DD)
    const [year, month, day] = localDate.split('-').map(Number);

    // Create date at midnight in the specified timezone
    // For America/Chicago: CST is UTC-6, CDT is UTC-5
    // We'll approximate with UTC-6 for now (can be improved with proper timezone library)
    const offsetHours = this.getTimezoneOffset(timezone);

    // Start of day in local time -> GMT
    const startLocal = new Date(Date.UTC(year, month - 1, day, -offsetHours, 0, 0, 0));
    const endLocal = new Date(Date.UTC(year, month - 1, day, -offsetHours + 24, 0, 0, 0));

    return {
      startGMT: startLocal.toISOString(),
      endGMT: endLocal.toISOString(),
    };
  }

  private getTimezoneOffset(timezone: string): number {
    // Simple mapping for America/Chicago
    // In production, use a library like 'luxon' or 'date-fns-tz'
    if (timezone === 'America/Chicago') {
      return -6; // CST offset (ignoring DST for now)
    }
    return 0; // UTC default
  }

  private getTodayInTimezone(timezone: string): string {
    // Get current date in the specified timezone
    const today = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const parts = formatter.formatToParts(today);
    const year = parts.find(p => p.type === 'year')?.value;
    const month = parts.find(p => p.type === 'month')?.value;
    const day = parts.find(p => p.type === 'day')?.value;
    return `${year}-${month}-${day}`;
  }

  public close(): void {
    this.db.close();
  }
}
