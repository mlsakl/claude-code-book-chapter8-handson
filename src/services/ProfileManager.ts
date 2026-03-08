import type { ConfigStorage } from '../storage/ConfigStorage.js';
import type { ProfileKey, UserProfile } from '../types/index.js';
import { PROFILE_KEYS } from '../types/index.js';
import { ValidationError } from '../types/errors.js';

export class ProfileManager {
  constructor(private readonly storage: ConfigStorage) {}

  getProfile(): UserProfile {
    const config = this.storage.load();
    return config.profile;
  }

  setProfileField(key: ProfileKey, value: string): UserProfile {
    if (!PROFILE_KEYS.includes(key)) {
      throw new ValidationError(
        `無効なキーです: "${key}"。使用可能なキー: ${PROFILE_KEYS.join(', ')}`,
      );
    }
    if (value.trim() === '') {
      throw new ValidationError('値を空文字列にすることはできません');
    }
    const config = this.storage.load();
    config.profile[key] = value.trim();
    this.storage.save(config);
    return config.profile;
  }
}
