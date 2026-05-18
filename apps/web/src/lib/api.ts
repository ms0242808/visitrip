import type {
  CreateTripInput,
  ListTripsResponse,
  TripDetail,
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
};
