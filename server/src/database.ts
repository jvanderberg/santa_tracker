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

    if (date) {
      // If a specific date is requested, use the old timezone-aware logic
      const { startGMT, endGMT } = this.dateToGMTRange(date, timezone);
      query += ' WHERE sighted_at >= ? AND sighted_at < ?';
      params.push(startGMT, endGMT);
    } else {
      // Default: show sightings from the last 24 hours
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      query += ' WHERE sighted_at >= ?';
      params.push(twentyFourHoursAgo.toISOString());
    }

    const rows = this.db.prepare(query).all(...params) as SightingRow[];
    return rows.map(row => this.addAgeFields(row));
  }

  public getSightingById(id: number): Sighting | undefined {
    const row = this.db.prepare('SELECT * FROM sightings WHERE id = ?').get(id) as
      | SightingRow
      | undefined;

    return row ? this.addAgeFields(row) : undefined;
  }

  public deleteSighting(id: number): boolean {
    const stmt = this.db.prepare('DELETE FROM sightings WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
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

    // Get the offset for this specific date (handles DST correctly)
    const dateInTimezone = new Date(year, month - 1, day, 12, 0, 0); // Use noon to avoid edge cases
    const offsetMs = this.getTimezoneOffsetMs(dateInTimezone, timezone);

    // Start of day at midnight in the target timezone
    const startOfDayUTC = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    const startGMT = new Date(startOfDayUTC.getTime() + offsetMs);
    const endGMT = new Date(startGMT.getTime() + 24 * 60 * 60 * 1000);

    return {
      startGMT: startGMT.toISOString(),
      endGMT: endGMT.toISOString(),
    };
  }

  private getTimezoneOffsetMs(date: Date, timezone: string): number {
    // Get the date's representation in the target timezone
    const tzDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
    // Get the date's representation in UTC
    const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
    // The difference is the timezone offset
    return utcDate.getTime() - tzDate.getTime();
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
