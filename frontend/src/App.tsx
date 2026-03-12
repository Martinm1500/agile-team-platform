// src/App.tsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import PrincipalView from "./components/PrincipalView";
import Auth from "./components/Auth/Auth";
import "./App.css";
import { useAppDispatch, useAppSelector } from "./hooks/redux";
import {
  initializeAuth,
  getCurrentUser,
  refreshToken,
  logout,
} from "./features/auth/authSlice";
import {
  disconnectStomp,
  subscribeGeneralAsync,
  setTokenExpiredHandler,
  handleTokenExpiredFromServer,
} from "./features/messages/stompService";
import { addNotification } from "./features/notifications/notificationSlice";
import type { Notification } from "./types";
import type { StompSubscription } from "@stomp/stompjs";
import type { IncomingMessageNotification } from "./features/messages/conversationTypes";
import type { RootState } from "./store";
import { useContacts } from "./features/contacts/useContacts";
import { handleIncomingMessageNotification } from "./features/messages/conversationSlice";
import { useStomp } from "./features/messages/useStomp";
import { StompProvider } from "./features/messages/StompProvider";
import Spinner from "./components/Spinner";
import { store } from "./store";

type AuthUser = NonNullable<RootState["auth"]["user"]>;
interface AuthenticatedContentProps {
  user: AuthUser;
  onLogout: () => void;
}

const AuthenticatedContent = React.memo(
  ({ user, onLogout }: AuthenticatedContentProps) => {
    const dispatch = useAppDispatch();
    const accessToken = useAppSelector((state) => state.auth.accessToken);
    const { loadContacts } = useContacts(user.id);
    const [contactsLoaded, setContactsLoaded] = useState(false);
    const hasLoadedContactsRef = useRef(false);

    useEffect(() => {
      if (hasLoadedContactsRef.current) return;
      const load = async () => {
        try {
          await loadContacts();
          hasLoadedContactsRef.current = true;
        } catch (error) {
          console.error("Error loading contacts:", error);
        } finally {
          setContactsLoaded(true);
        }
      };
      load();
    }, [loadContacts]);

    const { isConnected, connect } = useStomp();

    useEffect(() => {
      if (!contactsLoaded) return;
      if (!isConnected) {
        connect();
      }

      let notificationSub: StompSubscription | undefined;
      let messageSub: StompSubscription | undefined;
      let errorSub: StompSubscription | undefined;

      const setupSubscriptions = async () => {
        if (!isConnected) return;

        notificationSub = await subscribeGeneralAsync(
          "/user/queue/notifications",
          (msg) => {
            try {
              const notification = JSON.parse(msg.body) as Notification;
              dispatch(addNotification(notification));
            } catch (error) {
              console.error("Error parsing notification:", error);
            }
          },
        );

        messageSub = await subscribeGeneralAsync(
          "/user/queue/messages",
          (msg) => {
            try {
              const notif = JSON.parse(msg.body) as IncomingMessageNotification;
              dispatch(handleIncomingMessageNotification(notif));
            } catch (error) {
              console.error("Error parsing message notification:", error);
            }
          },
        );

        errorSub = await subscribeGeneralAsync(
          "/user/queue/errors",
          async (msg) => {
            try {
              const error = JSON.parse(msg.body) as {
                code: string;
                message: string;
              };
              console.warn("⚠️ Server error received:", error);

              if (error.code === "TOKEN_EXPIRED") {
                console.warn("🔑 Token expired - attempting refresh and reconnect...");
                await handleTokenExpiredFromServer();
              }
            } catch (e) {
              console.error("Error parsing server error message:", e);
            }
          },
        );
      };

      setupSubscriptions();

      return () => {
        notificationSub?.unsubscribe();
        messageSub?.unsubscribe();
        errorSub?.unsubscribe();
      };
    }, [contactsLoaded, isConnected, connect, dispatch, accessToken]);

    return <PrincipalView currentUser={user} onLogout={onLogout} />;
  },
);

AuthenticatedContent.displayName = "AuthenticatedContent";

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, loading, user, accessToken } = useAppSelector(
    (state) => state.auth,
  );

  const hasInitializedAuth = useRef(false);
  const hasFetchedUser = useRef(false);
  const isFetchingUser = useRef(false);

  useEffect(() => {
    const tokenExpiredHandler = async () => {
      console.log("🔄 Refreshing token after server TOKEN_EXPIRED...");
      try {
        await store.dispatch(refreshToken()).unwrap();
        console.log("✅ Token refreshed successfully");
      } catch (e) {
        console.error("❌ Refresh failed, logging out:", e);
        store.dispatch(logout());
        disconnectStomp();
        throw e;
      }
    };

    setTokenExpiredHandler(tokenExpiredHandler);
  }, []);

  useEffect(() => {
    if (hasInitializedAuth.current) return;
    console.log("🔄 Initializing auth...");
    dispatch(initializeAuth());
    hasInitializedAuth.current = true;
  }, [dispatch]);

  useEffect(() => {
    if (hasFetchedUser.current || !accessToken || isFetchingUser.current) return;

    const fetchUser = async () => {
      isFetchingUser.current = true;
      console.log("👤 Fetching current user...");
      try {
        await dispatch(getCurrentUser()).unwrap();
        console.log("✅ Current user fetched successfully");
        hasFetchedUser.current = true;
      } catch {
        console.warn("⚠️ Failed to fetch user, trying refresh token...");
        try {
          await dispatch(refreshToken()).unwrap();
          console.log("🔄 Token refreshed, retrying user fetch...");
          const retryResult = await dispatch(getCurrentUser()).unwrap();
          if (retryResult) {
            console.log("✅ User fetched after refresh");
            hasFetchedUser.current = true;
          } else {
            throw new Error("User fetch failed after refresh");
          }
        } catch {
          console.error("❌ Failed to refresh token, logging out...");
          dispatch(logout());
          disconnectStomp();
        }
      } finally {
        isFetchingUser.current = false;
      }
    };

    fetchUser();
  }, [dispatch, accessToken]);

  const handleLogout = useCallback(() => {
    console.log("🚪 Logging out...");
    dispatch(logout());
    disconnectStomp();
  }, [dispatch]);

  if (loading || (isAuthenticated && !user)) {
    return <Spinner />;
  }

  return (
    <div className="app">
      {!isAuthenticated ? (
        <Auth
          onAuthSuccess={() => {
            hasFetchedUser.current = false;
            dispatch(getCurrentUser());
          }}
        />
      ) : (
        <StompProvider>
          <AuthenticatedContent user={user!} onLogout={handleLogout} />
        </StompProvider>
      )}
    </div>
  );
};

export default App;