"use client";

import { useEffect, useState } from "react";
import { useTrips } from "@/lib/useTrips";
import { buildSampleTrips } from "@/lib/sample";
import { addDays, toISODate } from "@/lib/dates";
import { type InvitePayload, clearJoinToken, decodeInvite, readJoinToken } from "@/lib/share";
import Landing from "./Landing";
import TripsDashboard from "./TripsDashboard";
import PlannerView from "./PlannerView";
import NewTripModal from "./NewTripModal";
import ConfirmDialog from "./ConfirmDialog";
import JoinScreen from "./JoinScreen";
import { PlaneIcon } from "./Icons";

const NAME_KEY = "visitrip.name";

export default function AppShell() {
  const store = useTrips();
  const { trips, active, hydrated } = store;
  const [showNew, setShowNew] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [invite, setInvite] = useState<InvitePayload | null>(null);
  const [profileName, setProfileName] = useState("");

  // detect an invite link on load and whenever the hash changes
  useEffect(() => {
    const check = () => {
      const token = readJoinToken();
      if (!token) return;
      const payload = decodeInvite(token);
      if (payload) setInvite(payload);
      else clearJoinToken();
    };
    check();
    window.addEventListener("hashchange", check);
    try {
      setProfileName(window.localStorage.getItem(NAME_KEY) ?? "");
    } catch {
      /* ignore */
    }
    return () => window.removeEventListener("hashchange", check);
  }, []);

  const changeName = (name: string) => {
    setProfileName(name);
    try {
      window.localStorage.setItem(NAME_KEY, name);
    } catch {
      /* ignore */
    }
  };

  // avoid hydration flash
  if (!hydrated) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center">
        <div className="flex items-center gap-2 text-brand">
          <PlaneIcon className="animate-pulse" />
          <span className="font-display text-lg font-bold">Visitrip</span>
        </div>
      </div>
    );
  }

  // an invite link takes priority — show the join screen
  if (invite) {
    return (
      <JoinScreen
        payload={invite}
        onAccept={() => {
          store.acceptInvite(invite);
          clearJoinToken();
          setInvite(null);
        }}
        onDecline={() => {
          clearJoinToken();
          setInvite(null);
        }}
      />
    );
  }

  const newTripModal = showNew && (
    <NewTripModal
      onClose={() => setShowNew(false)}
      onCreate={(t) => {
        const id = store.createTrip(t);
        setShowNew(false);
        store.openTrip(id);
      }}
    />
  );

  // first run — onboarding
  if (trips.length === 0) {
    return (
      <>
        <Landing
          onCreate={(name, destination) => {
            const start = toISODate(new Date());
            const id = store.createTrip({
              name,
              destination,
              startDate: start,
              endDate: addDays(start, 2),
            });
            store.openTrip(id);
          }}
          onLoadSample={() => store.importTrips(buildSampleTrips())}
        />
        {newTripModal}
      </>
    );
  }

  const deleteTarget = trips.find((t) => t.id === pendingDelete);

  return (
    <>
      {active ? (
        <PlannerView
          key={active.id}
          trip={active}
          profileName={profileName}
          onChangeProfileName={changeName}
          onBack={() => store.openTrip(null)}
          onUpdateTrip={(patch) => store.updateTrip(active.id, patch)}
          onAddActivity={(a) => store.addActivity(active.id, a)}
          onUpdateActivity={(id, patch) => store.updateActivity(active.id, id, patch)}
          onRemoveActivity={(id) => store.removeActivity(active.id, id)}
          onToggleDone={(id) => store.toggleDone(active.id, id)}
          onAddCollaborator={(c) => store.addCollaborator(active.id, c)}
          onUpdateCollaborator={(id, patch) => store.updateCollaborator(active.id, id, patch)}
          onRemoveCollaborator={(id) => store.removeCollaborator(active.id, id)}
        />
      ) : (
        <TripsDashboard
          trips={trips}
          onOpen={store.openTrip}
          onNew={() => setShowNew(true)}
          onDuplicate={store.duplicateTrip}
          onDelete={setPendingDelete}
        />
      )}

      {newTripModal}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete this trip?"
          message={`“${deleteTarget.name}” and all its plans will be removed. This can’t be undone.`}
          confirmLabel="Delete trip"
          onCancel={() => setPendingDelete(null)}
          onConfirm={() => {
            store.deleteTrip(deleteTarget.id);
            setPendingDelete(null);
          }}
        />
      )}
    </>
  );
}
