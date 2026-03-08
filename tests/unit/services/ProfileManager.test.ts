import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { ConfigStorage } from '../../../src/storage/ConfigStorage.js';
import { ProfileManager } from '../../../src/services/ProfileManager.js';
import { ValidationError } from '../../../src/types/errors.js';
import type { ProfileKey } from '../../../src/types/index.js';

describe('ProfileManager', () => {
  let tmpDir: string;
  let storage: ConfigStorage;
  let manager: ProfileManager;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'taskcli-test-'));
    storage = new ConfigStorage(tmpDir);
    manager = new ProfileManager(storage);
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  describe('getProfile()', () => {
    it('未設定時は空のプロフィールを返す', () => {
      // Given: 何も設定されていない状態

      // When: プロフィールを取得する
      const profile = manager.getProfile();

      // Then: 空のプロフィールが返る
      expect(profile).toEqual({});
    });

    it('設定済みプロフィールを返す', () => {
      // Given: nameが設定済みの状態
      manager.setProfileField('name', '山田健二');

      // When: プロフィールを取得する
      const profile = manager.getProfile();

      // Then: 設定した値が返る
      expect(profile.name).toBe('山田健二');
    });
  });

  describe('setProfileField()', () => {
    it('nameを正常に設定できる', () => {
      // Given: 有効な名前
      const name = '山田健二';

      // When: nameフィールドを設定する
      const profile = manager.setProfileField('name', name);

      // Then: 設定した値が返る
      expect(profile.name).toBe('山田健二');
    });

    it('emailを正常に設定できる', () => {
      // Given: 有効なメールアドレス
      const email = 'ken@example.com';

      // When: emailフィールドを設定する
      const profile = manager.setProfileField('email', email);

      // Then: 設定した値が返る
      expect(profile.email).toBe('ken@example.com');
    });

    it('githubを正常に設定できる', () => {
      // Given: 有効なGitHubユーザー名
      const github = 'ken-yamada';

      // When: githubフィールドを設定する
      const profile = manager.setProfileField('github', github);

      // Then: 設定した値が返る
      expect(profile.github).toBe('ken-yamada');
    });

    it('空文字列でValidationErrorをスローする', () => {
      // Given: 空文字列の値

      // When/Then: 空文字列を設定しようとするとValidationErrorをスローする
      expect(() => manager.setProfileField('name', '')).toThrow(ValidationError);
    });

    it('スペースのみの値でValidationErrorをスローする', () => {
      // Given: スペースのみの値

      // When/Then: スペースのみの値を設定しようとするとValidationErrorをスローする
      expect(() => manager.setProfileField('email', '   ')).toThrow(ValidationError);
    });

    it('無効なキーでValidationErrorをスローする', () => {
      // Given: 無効なキー（型アサーションで意図的に無効な値を渡す）
      const invalidKey = 'invalid' as ProfileKey;

      // When/Then: 無効なキーを指定するとValidationErrorをスローする
      expect(() => manager.setProfileField(invalidKey, '山田健二')).toThrow(ValidationError);
    });

    it('既存の値を上書きできる', () => {
      // Given: nameが設定済みの状態
      manager.setProfileField('name', '旧名前');

      // When: nameを別の値で上書きする
      const profile = manager.setProfileField('name', '新名前');

      // Then: 新しい値に更新されている
      expect(profile.name).toBe('新名前');
    });

    it('値の前後のスペースをトリムして保存する', () => {
      // Given: 前後にスペースのある値

      // When: スペース付きの値を設定する
      const profile = manager.setProfileField('name', '  山田健二  ');

      // Then: トリムされた値が保存される
      expect(profile.name).toBe('山田健二');
    });
  });
});
