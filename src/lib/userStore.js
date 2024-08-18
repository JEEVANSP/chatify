import { create } from "zustand";
import { doc, getDoc } from "firebase/firestore";
import { db } from './firebase';

export const useUserStore = create((set) => ({
  currentUser: null,
  isLoading: true,
  fetchUserInfo: async (uid) => {
    try {
      if (!uid) {
        console.log("No UID provided");
        set({ currentUser: null, isLoading: false });
        return;
      }

      console.log(`Fetching user info for UID: ${uid}`);
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        console.log("User data:", docSnap.data());
        set({ currentUser: docSnap.data(), isLoading: false });
      } else {
        console.log("No such document!");
        set({ currentUser: null, isLoading: false });
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
      set({ currentUser: null, isLoading: false });
      throw error;  // Rethrow error to handle it outside the function if needed
    }
  },
  resetUser: () => set({ currentUser: null, isLoading: false }) 
}));
