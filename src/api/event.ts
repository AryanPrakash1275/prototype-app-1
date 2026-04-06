import { apiFetch } from "./client";

export function getEvents() {
  return apiFetch("/api/events");
}
