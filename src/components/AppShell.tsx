"use client";

import { useState } from "react";
import { useTrips } from "@/lib/useTrips";
import { buildSampleTrips } from "@/lib/sample";
import Landing from "./Landing";
import TripsDashboard from "./TripsDashboard";
import PlannerView from "./PlannerView";
import NewTripModal from "./NewTripModal";
import ConfirmDialog from "./ConfirmDialog";
import { PlaneIcon } from "./Icons";

export default function AppShell() {
  const store = useTrips();
  const { trips, active, hydrated } = store;
  const [showNew, setShowNew] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

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

  // first run — onboarding
  if (trips.length === 0) {
    return (
      <>
        <Landing
          onCreate={(name, destination) => {
            const id = store.createTrip({ name, destination });
            store.openTrip(id);
          }}
          onLoadSample={() => store.importTrips(buildSampleTrips())}
        />
        {showNew && (
          <NewTripModal
            onClose={() => setShowNew(false)}
            onCreate={(t) => {
              const id = store.createTrip(t);
              setShowNew(false);
              store.openTrip(id);
            }}
          />
        )}
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
          onBack={() => store.openTrip(null)}
          onUpdateTrip={(patch) => store.updateTrip(active.id, patch)}
          onAddActivity={(a) => store.addActivity(active.id, a)}
          onUpdateActivity={(id, patch) => store.updateActivity(active.id, id, patch)}
          onRemoveActivity={(id) => store.removeActivity(active.id, id)}
          onToggleDone={(id) => store.toggleDone(active.id, id)}
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

      {showNew && (
        <NewTripModal
          onClose={() => setShowNew(false)}
          onCreate={(t) => {
            const id = store.createTrip(t);
            setShowNew(false);
            store.openTrip(id);
          }}
        />
      )}

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
