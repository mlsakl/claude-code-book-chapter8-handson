export interface UserProfile {
  name?: string;    // 氏名
  email?: string;   // メールアドレス
  github?: string;  // GitHubユーザー名
}

export interface Config {
  profile: UserProfile;
}

export type ProfileKey = 'name' | 'email' | 'github';

export const PROFILE_KEYS: ProfileKey[] = ['name', 'email', 'github'];
