import type {
  CreateDayInput,
  CreateDayItemInput,
  CreateExpenseInput,
  CreateInviteInput,
  CreateTripInput,
  InviteCreateResponse,
  InvitePreview,
  ListTripsResponse,
  TripDetail,
  UpdateDayInput,
  UpdateDayItemInput,
  UpdateTripInput,
  User,
} from "@visitrip/shared";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    credentials: "include",
    headers: { "content-type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  });
  if (!res.ok) {
    let msg = `${res.status} ${res.statusText}`;
    try {
      const body = (await res.json()) as { error?: string; message?: string };
      msg = body.error ?? body.message ?? msg;
    } catch {}
    throw new ApiError(res.status, msg);
  }
  return (await res.json()) as T;
}

export const api = {
  async getSession(): Promise<User | null> {
    try {
      const data = await request<{ user: User | null } | null>("/api/auth/get-session");
      return data?.user ?? null;
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) return null;
      throw e;
    }
  },

  signIn(email: string, password: string): Promise<{ user: User }> {
    return request("/api/auth/sign-in/email", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  signUp(email: string, password: string, name: string): Promise<{ user: User }> {
    return request("/api/auth/sign-up/email", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    });
  },

  signOut(): Promise<{ success: boolean }> {
    return request("/api/auth/sign-out", { method: "POST" });
  },

  updateName(name: string): Promise<{ user: User }> {
    return request("/api/auth/update-user", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
  },

  changePassword(currentPassword: string, newPassword: string): Promise<{ user: User }> {
    return request("/api/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  deleteAccount(password: string): Promise<{ success: boolean }> {
    return request("/api/auth/delete-user", {
      method: "POST",
      body: JSON.stringify({ password }),
    });
  },

  async exportMyData(): Promise<Blob> {
    const res = await fetch("/api/me/export", { credentials: "include" });
    if (!res.ok) throw new ApiError(res.status, `${res.status} ${res.statusText}`);
    return res.blob();
  },

  listTrips(): Promise<ListTripsResponse> {
    return request("/api/trips");
  },

  getTrip(id: string): Promise<TripDetail> {
    return request(`/api/trips/${id}`);
  },

  createTrip(input: CreateTripInput): Promise<{ id: string }> {
    return request("/api/trips", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  deleteTrip(id: string): Promise<{ ok: true }> {
    return request(`/api/trips/${id}`, { method: "DELETE" });
  },

  updateTrip(id: string, patch: UpdateTripInput): Promise<{ ok: true }> {
    return request(`/api/trips/${id}`, { method: "PATCH", body: JSON.stringify(patch) });
  },

  createDay(tripId: string, input: CreateDayInput): Promise<{ id: string }> {
    return request(`/api/trips/${tripId}/days`, { method: "POST", body: JSON.stringify(input) });
  },

  updateDay(tripId: string, dayId: string, patch: UpdateDayInput): Promise<{ ok: true }> {
    return request(`/api/trips/${tripId}/days/${dayId}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
  },

  deleteDay(tripId: string, dayId: string): Promise<{ ok: true }> {
    return request(`/api/trips/${tripId}/days/${dayId}`, { method: "DELETE" });
  },

  createDayItem(tripId: string, dayId: string, input: CreateDayItemInput): Promise<{ id: string }> {
    return request(`/api/trips/${tripId}/days/${dayId}/items`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  updateDayItem(
    tripId: string,
    dayId: string,
    itemId: string,
    patch: UpdateDayItemInput,
  ): Promise<{ ok: true }> {
    return request(`/api/trips/${tripId}/days/${dayId}/items/${itemId}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
  },

  deleteDayItem(tripId: string, dayId: string, itemId: string): Promise<{ ok: true }> {
    return request(`/api/trips/${tripId}/days/${dayId}/items/${itemId}`, { method: "DELETE" });
  },

  reorderDayItems(tripId: string, dayId: string, ids: string[]): Promise<{ ok: true }> {
    return request(`/api/trips/${tripId}/days/${dayId}/items/reorder`, {
      method: "POST",
      body: JSON.stringify({ ids }),
    });
  },

  createExpense(tripId: string, input: CreateExpenseInput): Promise<{ id: string }> {
    return request(`/api/trips/${tripId}/expenses`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  deleteExpense(tripId: string, expenseId: string): Promise<{ ok: true }> {
    return request(`/api/trips/${tripId}/expenses/${expenseId}`, { method: "DELETE" });
  },

  createInvite(tripId: string, input: CreateInviteInput = {}): Promise<InviteCreateResponse> {
    return request(`/api/trips/${tripId}/invites`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  getInvite(token: string): Promise<InvitePreview> {
    return request(`/api/invites/${token}`);
  },

  acceptInvite(token: string): Promise<{ tripId: string }> {
    return request(`/api/invites/${token}/accept`, { method: "POST" });
  },
};
