import { PROFILE_KEYS } from '../../types/index.js';
import type { ProfileKey } from '../../types/index.js';
import { ValidationError } from '../../types/errors.js';
import type { ProfileManager } from '../../services/ProfileManager.js';

const LABELS: Record<ProfileKey, string> = {
  name: '氏名',
  email: 'メールアドレス',
  github: 'GitHubユーザー名',
};

export function runProfileShow(manager: ProfileManager): void {
  const profile = manager.getProfile();

  console.log('プロフィール:');
  for (const key of PROFILE_KEYS) {
    const label = LABELS[key];
    const value = profile[key] ?? '未設定';
    console.log(`  ${label}: ${value}`);
  }
}

export function runProfileSet(manager: ProfileManager, key: string, value: string): void {
  try {
    manager.setProfileField(key as ProfileKey, value);
    const label = LABELS[key as ProfileKey] ?? key;
    console.log(`プロフィールを更新しました: ${label} = ${value.trim()}`);
  } catch (error) {
    if (error instanceof ValidationError) {
      console.error(`エラー: ${error.message}`);
      process.exit(1);
    }
    throw error;
  }
}
