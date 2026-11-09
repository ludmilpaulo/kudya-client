import AsyncStorage from '@react-native-async-storage/async-storage';

export type OnboardingVertical = 'app' | 'food' | 'groceries';

const key = (vertical: OnboardingVertical) => `kudya:onboarding:${vertical}`;

export async function hasCompletedOnboarding(vertical: OnboardingVertical): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(key(vertical))) === 'done';
  } catch {
    return false;
  }
}

export async function markOnboardingDone(vertical: OnboardingVertical): Promise<void> {
  try {
    await AsyncStorage.setItem(key(vertical), 'done');
  } catch {
    // Not fatal: the user just sees onboarding again next time.
  }
}
