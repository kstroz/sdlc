import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { signIn } from '../use-cases/signIn';
import type { AuthClient, SessionStore, SignInError } from '../use-cases/signIn';

export interface SignInScreenProps {
  authClient: AuthClient;
  sessionStore: SessionStore;
  onSignedIn?: () => void;
}

const ERROR_MESSAGES: Record<SignInError, string> = {
  invalid_credentials: 'Invalid username or password.',
  network_error: 'Network error. Please try again.',
  validation_failed: 'Please enter a valid username and password.',
};

export function SignInScreen(props: SignInScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<SignInError | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit() {
    setBusy(true);
    setError(null);
    const result = await signIn(username, password, {
      authClient: props.authClient,
      sessionStore: props.sessionStore,
    });
    setBusy(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    props.onSignedIn?.();
  }

  return (
    <View>
      <TextInput
        accessibilityLabel="username"
        autoCapitalize="none"
        value={username}
        onChangeText={setUsername}
        placeholder="Username"
      />
      <TextInput
        accessibilityLabel="password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
      />
      {error !== null && <Text accessibilityRole="alert">{ERROR_MESSAGES[error]}</Text>}
      <Pressable accessibilityRole="button" disabled={busy} onPress={onSubmit}>
        <Text>Sign in</Text>
      </Pressable>
    </View>
  );
}
