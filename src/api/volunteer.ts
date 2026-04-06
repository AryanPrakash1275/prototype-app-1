import { apiFetch } from "./client";

export function loginVolunteer(phone: string, name: string, city: string) {
  return apiFetch("/api/volunteers/login", {
    method: "POST",
    body: JSON.stringify({ phone, name, city }),
  });
}
