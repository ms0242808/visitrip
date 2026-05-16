import { useState } from "react";
import type { Day, DayItem, Trip } from "./data/types";
import { TRIPS } from "./data/seed";
import { Icon } from "./components/Icon";
import { TabBar } from "./components/ui";
import { SignIn, SignUp, Verify } from "./screens/auth";
import { OnboardingScreen } from "./screens/onboarding";
import { TripsScreen } from "./screens/trips";
import { TripScreen } from "./screens/trip";
import { DayScreen } from "./screens/day";
import { PlaceSheet } from "./screens/place";
import { InviteSheet } from "./screens/invite";
import { NewTripSheet } from "./screens/newtrip";
import { ProfileScreen } from "./screens/profile";

type ScreenName = "signin" | "signup" | "verify" | "onboarding" | "home" | "trip" | "day" | "profile";

type Route =
  | { screen: "signin" }
  | { screen: "signup" }
  | { screen: "verify"; email: string }
  | { screen: "onboarding" }
  | { screen: "home" }
  | { screen: "trip"; tripId: string }
  | { screen: "day"; tripId: string; dayId: string }
  | { screen: "profile" };

type SheetState =
  | { kind: "place"; item: DayItem }
  | { kind: "invite"; tripId: string }
  | { kind: "newtrip" }
  | null;

const TABS: Array<{ id: string; icon: string; label: string }> = [
  { id: "trips", icon: "trips", label: "Trips" },
  { id: "map", icon: "map", label: "Discover" },
  { id: "inbox", icon: "inbox", label: "Inbox" },
  { id: "profile", icon: "user", label: "You" },
];

const TAB_BAR_SCREENS: ScreenName[] = ["home", "profile"];

export function App() {
  const [route, setRoute] = useState<Route>({ screen: "home" });
  const [sheet, setSheet] = useState<SheetState>(null);
  const [tab, setTab] = useState<string>("trips");
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const tripById = (id: string): Trip => {
    const t = TRIPS.find((x) => x.id === id);
    if (!t) throw new Error(`Unknown trip ${id}`);
    return t;
  };

  const handleTab = (next: string) => {
    setTab(next);
    if (next === "trips") setRoute({ screen: "home" });
    else if (next === "profile") setRoute({ screen: "profile" });
    else if (next === "map") showToast("Discover (mock)");
    else if (next === "inbox") showToast("Inbox (mock)");
  };

  let screen: React.ReactNode = null;
  switch (route.screen) {
    case "signin":
      screen = (
        <SignIn
          onSubmit={() => setRoute({ screen: "onboarding" })}
          onSwitch={() => setRoute({ screen: "signup" })}
          onForgot={() => showToast("Reset email sent (mock)")}
        />
      );
      break;
    case "signup":
      screen = (
        <SignUp
          onSubmit={() => setRoute({ screen: "verify", email: "mira@castellan.studio" })}
          onSwitch={() => setRoute({ screen: "signin" })}
        />
      );
      break;
    case "verify":
      screen = (
        <Verify
          email={route.email}
          onSubmit={() => setRoute({ screen: "onboarding" })}
          onBack={() => setRoute({ screen: "signup" })}
        />
      );
      break;
    case "onboarding":
      screen = <OnboardingScreen onDone={() => setRoute({ screen: "home" })} />;
      break;
    case "home":
      screen = (
        <TripsScreen
          trips={TRIPS}
          onOpen={(t: Trip) => setRoute({ screen: "trip", tripId: t.id })}
          onNew={() => setSheet({ kind: "newtrip" })}
        />
      );
      break;
    case "trip": {
      const trip = tripById(route.tripId);
      screen = (
        <TripScreen
          trip={trip}
          onBack={() => setRoute({ screen: "home" })}
          onOpenDay={(day: Day) => setRoute({ screen: "day", tripId: trip.id, dayId: day.id })}
          onShare={() => setSheet({ kind: "invite", tripId: trip.id })}
          onOpenSettings={() => showToast("Trip settings (mock)")}
        />
      );
      break;
    }
    case "day": {
      const trip = tripById(route.tripId);
      const day = trip.days.find((d) => d.id === route.dayId);
      if (!day) {
        setRoute({ screen: "trip", tripId: trip.id });
        break;
      }
      screen = (
        <DayScreen
          trip={trip}
          day={day}
          onBack={() => setRoute({ screen: "trip", tripId: trip.id })}
          onOpenPlace={(it: DayItem) => setSheet({ kind: "place", item: it })}
          onAdd={() => showToast("Add a plan (mock)")}
        />
      );
      break;
    }
    case "profile":
      screen = (
        <ProfileScreen
          onSignOut={() => setRoute({ screen: "signin" })}
          onBack={() => {
            setTab("trips");
            setRoute({ screen: "home" });
          }}
        />
      );
      break;
  }

  const hasTabBar = TAB_BAR_SCREENS.includes(route.screen);

  return (
    <div className="vt-frame">
      <div className="vt-frame__inner" data-theme="light">
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            background: "var(--vt-bg)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ flex: 1, minHeight: 0, position: "relative" }}>{screen}</div>
          {hasTabBar && <TabBar value={tab} onChange={handleTab} items={TABS} />}

          {sheet?.kind === "place" && <PlaceSheet item={sheet.item} onClose={() => setSheet(null)} />}
          {sheet?.kind === "invite" && (
            <InviteSheet trip={tripById(sheet.tripId)} onClose={() => setSheet(null)} />
          )}
          {sheet?.kind === "newtrip" && (
            <NewTripSheet
              onClose={() => setSheet(null)}
              onCreate={() => {
                setSheet(null);
                showToast("Trip created");
              }}
            />
          )}

          {toast && (
            <div className="vt-toast">
              <Icon name="check" size={16} /> {toast}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
