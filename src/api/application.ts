import { apiFetch } from "./client";

export function applyToEvent(eventId: number, volunteerId: number) {
  return apiFetch("/api/applications", {
    method: "POST",
    body: JSON.stringify({ eventId, volunteerId }),
  });
}

export function getApplications(volunteerId: number) {
  return apiFetch(`/api/applications/volunteer/${volunteerId}`);
}
