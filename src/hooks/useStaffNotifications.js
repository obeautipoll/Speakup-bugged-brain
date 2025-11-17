import { useEffect, useMemo, useRef, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../firebase/firebase";

const LS_KEY = "staff_notifications_last_seen";

const getLastSeen = () => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const n = Number(raw);
    return Number.isFinite(n) ? n : 0;
  } catch { return 0; }
};

const setLastSeen = (ms) => {
  try {
    const prev = getLastSeen();
    const next = Math.max(Number(prev) || 0, Number(ms) || 0);
    localStorage.setItem(LS_KEY, String(next));
  } catch {}
};

const toMs = (val) => {
  if (!val) return 0;
  try {
    if (typeof val?.toDate === "function") {
      const t = val.toDate()?.getTime?.();
      return Number.isFinite(t) ? t : 0;
    }
  } catch {}
  if (typeof val === "number") return Number.isFinite(val) ? val : 0;
  const t = Date.parse(val);
  return Number.isFinite(t) ? t : 0;
};

export function useStaffNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastSeenAt, setLastSeenAt] = useState(getLastSeen());

  const prevRef = useRef(new Map());
  const initialLoadRef = useRef(true);
  const [staffRole, setStaffRole] = useState("");

  // Determine staff role from localStorage ("staff" or "kasama")
  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const role = (user?.role || "").toLowerCase();
      if (role === "staff" || role === "kasama") setStaffRole(role);
      else setStaffRole("");
    } catch { setStaffRole(""); }
  }, []);

  useEffect(() => {
    setLoading(true);
    setNotifications([]);
    prevRef.current = new Map();
    initialLoadRef.current = true;

    if (!staffRole) { setLoading(false); return; }

    const qRole = query(collection(db, "complaints"), where("assignedRole", "==", staffRole));
    const unsub = onSnapshot(qRole, (snapshot) => {
      // Initial load: backfill assignment + feedback since last seen
      if (initialLoadRef.current) {
        const since = getLastSeen();
        const initial = [];
        snapshot.docs.forEach((doc) => {
          const d = doc.data() || {};
          const assignmentMs = toMs(d.assignmentUpdatedAt);
          if (assignmentMs > 0) {
            initial.push({
              id: `${doc.id}::assignment::${assignmentMs}`,
              type: "assignment",
              complaintId: doc.id,
              category: d.category || "",
              title: "New assigned complaint",
              date: assignmentMs,
            });
          }

          const feedbackHistory = Array.isArray(d.feedbackHistory) ? d.feedbackHistory : [];
          let lastFeedbackMs = 0;
          if (feedbackHistory.length) {
            lastFeedbackMs = toMs(feedbackHistory[feedbackHistory.length - 1]?.date);
          }
          const feedbackMs = Math.max(lastFeedbackMs, toMs(d.feedbackUpdatedAt));
          if ((d.Feedback || feedbackHistory.length > 0) && feedbackMs > 0) {
            initial.push({
              id: `${doc.id}::feedback::${feedbackMs}`,
              type: "feedback",
              complaintId: doc.id,
              category: d.category || "",
              title: "New feedback from admin",
              date: feedbackMs,
            });
          }

          prevRef.current.set(doc.id, {
            feedbackCount: feedbackHistory.length,
            assignedRole: d.assignedRole,
            feedbackValue: d.Feedback || "",
          });
        });

        if (initial.length) {
          initial.sort((a,b)=>b.date-a.date);
          setNotifications(initial.slice(0, 100));
        }
        initialLoadRef.current = false;
        setLoading(false);
        return;
      }

      // Realtime changes
      const newNotifs = [];
      snapshot.docChanges().forEach((change) => {
        const id = change.doc.id;
        const d = change.doc.data() || {};
        const prev = prevRef.current.get(id) || { feedbackCount: 0, assignedRole: undefined, feedbackValue: "" };

        const nowMs = Date.now();

        // Treat ADDED as a new assignment into this role
        if (change.type === "added") {
          newNotifs.push({
            id: `${id}::assignment::${nowMs}`,
            type: "assignment",
            complaintId: id,
            category: d.category || "",
            title: "New assigned complaint",
            date: nowMs,
          });
        }

        // Feedback change
        const feedbackHistory = Array.isArray(d.feedbackHistory) ? d.feedbackHistory : [];
        const feedbackCount = feedbackHistory.length;
        const feedbackValue = d.Feedback || "";
        if (
          change.type === "modified" &&
          (feedbackCount > (prev.feedbackCount || 0) || (feedbackValue && feedbackValue !== (prev.feedbackValue || "")))
        ) {
          let dateMs = nowMs;
          const last = feedbackHistory[feedbackHistory.length - 1];
          if (last?.date) {
            const t = Date.parse(last.date);
            if (Number.isFinite(t)) dateMs = t;
          }
          newNotifs.push({
            id: `${id}::feedback::${feedbackCount}-${dateMs}`,
            type: "feedback",
            complaintId: id,
            category: d.category || "",
            title: "New feedback from admin",
            date: dateMs,
          });
        }

        prevRef.current.set(id, { feedbackCount, assignedRole: d.assignedRole, feedbackValue });
      });

      if (newNotifs.length) {
        setNotifications((prev) => {
          const merged = [...newNotifs, ...prev];
          return merged.slice(0, 100);
        });
      }
    }, () => setLoading(false));

    return () => { try { unsub && unsub(); } catch {} };
  }, [staffRole]);

  const unreadCount = useMemo(() => notifications.reduce((acc,n)=> (n.date>lastSeenAt?acc+1:acc), 0), [notifications, lastSeenAt]);

  const markAllSeen = () => {
    const now = Date.now();
    setLastSeen(now);
    setLastSeenAt((p)=> Math.max(p, now));
  };
  const markSeenUpTo = (ms) => {
    const v = Number(ms)||0;
    setLastSeen(v);
    setLastSeenAt((p)=> Math.max(p, v));
  };

  return { notifications, loading, unreadCount, lastSeenAt, markAllSeen, markSeenUpTo };
}

export default useStaffNotifications;