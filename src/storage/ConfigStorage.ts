import { chmodSync, existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'fs';
import { join } from 'path';
import type { Config } from '../types/index.js';

const TASK_DIR = '.task';
const CONFIG_FILE = 'config.json';

const DEFAULT_CONFIG: Config = {
  profile: {},
};

export class ConfigStorage {
  private readonly configPath: string;
  private readonly taskDir: string;

  constructor(basePath: string = process.cwd()) {
    this.taskDir = join(basePath, TASK_DIR);
    this.configPath = join(this.taskDir, CONFIG_FILE);
  }

  load(): Config {
    if (!existsSync(this.configPath)) {
      return structuredClone(DEFAULT_CONFIG);
    }
    const raw = readFileSync(this.configPath, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<Config>;
    return {
      profile: parsed.profile ?? {},
    };
  }

  save(config: Config): void {
    if (!existsSync(this.taskDir)) {
      mkdirSync(this.taskDir, { recursive: true });
    }
    // アトミック書き込み: 一時ファイルに書き込んでからリネーム
    const tmpPath = `${this.configPath}.tmp`;
    writeFileSync(tmpPath, JSON.stringify(config, null, 2), 'utf-8');
    renameSync(tmpPath, this.configPath);
    chmodSync(this.configPath, 0o600);
  }
}
