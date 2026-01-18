"use client";

import { useCallback, useEffect, useState } from "react";

export interface BrowserNotificationOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  requireInteraction?: boolean;
  onClick?: () => void;
}

export function useBrowserNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if browser supports notifications
    if (typeof window !== "undefined" && "Notification" in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      console.warn("Browser notifications are not supported");
      return "denied" as NotificationPermission;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    } catch (error) {
      console.error("Failed to request notification permission:", error);
      return "denied" as NotificationPermission;
    }
  }, [isSupported]);

  const showNotification = useCallback(
    async (options: BrowserNotificationOptions) => {
      if (!isSupported) {
        console.warn("Browser notifications are not supported");
        return null;
      }

      // Request permission if not granted
      let currentPermission = permission;
      if (currentPermission === "default") {
        currentPermission = await requestPermission();
      }

      if (currentPermission !== "granted") {
        console.warn("Browser notification permission not granted");
        return null;
      }

      try {
        const notification = new Notification(options.title, {
          body: options.body,
          icon: options.icon || "/elmer-icon.png",
          tag: options.tag,
          requireInteraction: options.requireInteraction,
        });

        if (options.onClick) {
          notification.onclick = () => {
            window.focus();
            options.onClick?.();
            notification.close();
          };
        }

        return notification;
      } catch (error) {
        console.error("Failed to show notification:", error);
        return null;
      }
    },
    [isSupported, permission, requestPermission]
  );

  const showJobNotification = useCallback(
    (
      type: "completed" | "failed" | "requires_attention",
      jobType: string,
      projectName?: string,
      onClick?: () => void
    ) => {
      const formattedJobType = jobType.replace(/_/g, " ");
      
      const titles: Record<typeof type, string> = {
        completed: `✅ Job Completed`,
        failed: `❌ Job Failed`,
        requires_attention: `⚠️ Attention Required`,
      };

      const bodies: Record<typeof type, string> = {
        completed: `${formattedJobType} finished successfully${projectName ? ` for ${projectName}` : ""}`,
        failed: `${formattedJobType} failed${projectName ? ` for ${projectName}` : ""}. Click to view details.`,
        requires_attention: `${formattedJobType} needs your input${projectName ? ` for ${projectName}` : ""}`,
      };

      return showNotification({
        title: titles[type],
        body: bodies[type],
        tag: `job-${type}`,
        requireInteraction: type === "failed" || type === "requires_attention",
        onClick,
      });
    },
    [showNotification]
  );

  return {
    isSupported,
    permission,
    requestPermission,
    showNotification,
    showJobNotification,
  };
}
