import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { ConfigStorage } from '../../../src/storage/ConfigStorage.js';

describe('ConfigStorage', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'taskcli-test-'));
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  describe('load()', () => {
    it('ファイルが存在しない場合はデフォルト値を返す', () => {
      const storage = new ConfigStorage(tmpDir);
      const config = storage.load();

      expect(config).toEqual({ profile: {} });
    });

    it('既存ファイルの内容を正しく返す', () => {
      const taskDir = join(tmpDir, '.task');
      mkdirSync(taskDir);
      writeFileSync(
        join(taskDir, 'config.json'),
        JSON.stringify({ profile: { name: '山田健二', email: 'ken@example.com' } }),
        'utf-8',
      );

      const storage = new ConfigStorage(tmpDir);
      const config = storage.load();

      expect(config.profile.name).toBe('山田健二');
      expect(config.profile.email).toBe('ken@example.com');
    });

    it('profileフィールドが欠落している場合は空のprofileを返す', () => {
      const taskDir = join(tmpDir, '.task');
      mkdirSync(taskDir);
      writeFileSync(join(taskDir, 'config.json'), JSON.stringify({}), 'utf-8');

      const storage = new ConfigStorage(tmpDir);
      const config = storage.load();

      expect(config.profile).toEqual({});
    });
  });

  describe('save()', () => {
    it('ファイルに正しく書き込む', () => {
      const storage = new ConfigStorage(tmpDir);
      storage.save({ profile: { name: '鈴木美咲' } });

      const saved = storage.load();
      expect(saved.profile.name).toBe('鈴木美咲');
    });

    it('.task/ ディレクトリを自動作成する', () => {
      // tmpDir に .task/ はまだ存在しない
      const storage = new ConfigStorage(tmpDir);
      storage.save({ profile: { github: 'suzuki-misaki' } });

      const saved = storage.load();
      expect(saved.profile.github).toBe('suzuki-misaki');
    });
  });
});
