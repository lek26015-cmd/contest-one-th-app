/**
 * LINE Notify Utility
 * 
 * Sends notifications to a LINE group or user via LINE Notify API.
 */

import { getSettingFromD1 } from './d1-actions';

export async function sendLineNotification(message: string) {
  // Try to get token from D1 first, fall back to environment variable
  const d1Token = await getSettingFromD1('line_notify_token');
  const token = d1Token || process.env.LINE_NOTIFY_TOKEN;

  if (!token) {
    console.warn("LINE_NOTIFY_TOKEN is not set. Skipping notification.");
    return;
  }

  try {
    const response = await fetch("https://notify-api.line.me/api/notify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Bearer ${token}`
      },
      body: new URLSearchParams({ message })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("LINE Notify Error:", errorData);
    }
  } catch (error) {
    console.error("Failed to send LINE notification:", error);
  }
}
