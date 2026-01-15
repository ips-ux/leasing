import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Card, Button } from './index';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private isFirebaseConfigError(): boolean {
    const errorMessage = this.state.error?.message || '';
    return (
      errorMessage.includes('invalid-api-key') ||
      errorMessage.includes('auth/') ||
      !import.meta.env.VITE_FIREBASE_API_KEY
    );
  }

  public render() {
    if (this.state.hasError) {
      if (this.isFirebaseConfigError()) {
        return (
          <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-pale-blue/20 to-lavender/20">
            <Card className="max-w-2xl">
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold mb-2">⚙️ Firebase Setup Required</h1>
                  <p className="text-black/60">
                    The Firebase configuration is missing or invalid. Let's get you set up!
                  </p>
                </div>

                <div className="bg-peach/20 border-3 border-peach p-4">
                  <p className="font-semibold mb-2">🚨 Error Details:</p>
                  <code className="text-sm font-mono block">
                    {this.state.error?.message || 'Missing Firebase configuration'}
                  </code>
                </div>

                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Quick Setup (5 minutes):</h2>

                  <ol className="space-y-3 list-decimal list-inside">
                    <li className="pl-2">
                      <span className="font-semibold">Create Firebase Project</span>
                      <br />
                      <a
                        href="https://console.firebase.google.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-black/60 hover:text-black underline ml-6"
                      >
                        console.firebase.google.com →
                      </a>
                    </li>

                    <li className="pl-2">
                      <span className="font-semibold">Enable Services</span>
                      <ul className="text-sm text-black/60 ml-6 mt-1 space-y-1">
                        <li>• Authentication (Email/Password)</li>
                        <li>• Firestore Database</li>
                      </ul>
                    </li>

                    <li className="pl-2">
                      <span className="font-semibold">Get Firebase Config</span>
                      <br />
                      <span className="text-sm text-black/60 ml-6">
                        Project Settings → Add Web App
                      </span>
                    </li>

                    <li className="pl-2">
                      <span className="font-semibold">Create <code className="font-mono bg-black/10 px-1">.env.local</code> file</span>
                      <br />
                      <span className="text-sm text-black/60 ml-6">
                        In project root with your Firebase credentials
                      </span>
                    </li>

                    <li className="pl-2">
                      <span className="font-semibold">Restart Dev Server</span>
                      <br />
                      <code className="text-sm font-mono bg-black/10 px-2 py-1 ml-6 inline-block mt-1">
                        npm run dev
                      </code>
                    </li>
                  </ol>
                </div>

                <div className="flex gap-4">
                  <Button
                    variant="primary"
                    onClick={() => window.location.reload()}
                  >
                    I've Set Up Firebase - Reload
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => window.open('FIREBASE_SETUP_GUIDE.md', '_blank')}
                  >
                    View Detailed Guide
                  </Button>
                </div>

                <div className="text-sm text-black/60 border-l-4 border-lavender pl-4">
                  <p className="font-semibold mb-1">💡 Need help?</p>
                  <p>See <code className="font-mono bg-black/10 px-1">FIREBASE_SETUP_GUIDE.md</code> for step-by-step instructions with screenshots.</p>
                </div>
              </div>
            </Card>
          </div>
        );
      }

      // Generic error fallback
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-peach/20 to-soft-yellow/20">
          <Card className="max-w-2xl">
            <div className="space-y-4">
              <h1 className="text-3xl font-bold">⚠️ Something Went Wrong</h1>
              <div className="bg-peach/20 border-3 border-peach p-4">
                <p className="font-semibold mb-2">Error:</p>
                <code className="text-sm font-mono block">
                  {this.state.error?.message || 'Unknown error'}
                </code>
              </div>
              <Button
                variant="primary"
                onClick={() => window.location.reload()}
              >
                Reload Page
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
