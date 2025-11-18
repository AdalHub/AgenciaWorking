// src/components/IntercomMessenger.tsx
import { useEffect, useState } from 'react';
import Intercom from '@intercom/messenger-js-sdk';

type PublicUser = {
  id: number;
  email: string;
  name?: string;
  created_at?: string;
};

export default function IntercomMessenger() {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initIntercom = async () => {
      try {
        // Check if user is logged in
        const res = await fetch('/api/user_auth.php?action=me', {
          credentials: 'include',
        });
        const data = await res.json();
        const loggedInUser = data.user;

        if (loggedInUser) {
          setUser(loggedInUser);

          // Convert created_at to Unix timestamp (seconds)
          let createdAtTimestamp: number | undefined;
          if (loggedInUser.created_at) {
            const date = new Date(loggedInUser.created_at);
            createdAtTimestamp = Math.floor(date.getTime() / 1000);
          }

          // Initialize Intercom with user data
          Intercom({
            app_id: 'kpogh08f',
            user_id: String(loggedInUser.id),
            name: loggedInUser.name || undefined,
            email: loggedInUser.email,
            created_at: createdAtTimestamp,
          });
        } else {
          // Initialize Intercom for anonymous visitors
          Intercom({
            app_id: 'kpogh08f',
          });
        }

        setInitialized(true);
      } catch (err) {
        console.error('Failed to initialize Intercom', err);
        // Still initialize for anonymous visitors even if user check fails
        try {
          Intercom({
            app_id: 'kpogh08f',
          });
          setInitialized(true);
        } catch (initErr) {
          console.error('Failed to initialize Intercom for anonymous users', initErr);
        }
      }
    };

    initIntercom();
  }, []);

  // Update Intercom when user changes
  useEffect(() => {
    if (!initialized) return;

    if (user) {
      let createdAtTimestamp: number | undefined;
      if (user.created_at) {
        const date = new Date(user.created_at);
        createdAtTimestamp = Math.floor(date.getTime() / 1000);
      }

      Intercom({
        app_id: 'kpogh08f',
        user_id: String(user.id),
        name: user.name || undefined,
        email: user.email,
        created_at: createdAtTimestamp,
      });
    } else {
      Intercom({
        app_id: 'kpogh08f',
      });
    }
  }, [user, initialized]);

  // This component doesn't render anything visible
  return null;
}

