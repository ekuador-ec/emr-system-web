import { create } from "zustand";

interface UserStore {
  isInviteModalOpen: boolean;
  setInviteModalOpen: (isOpen: boolean) => void;
  isUsersLoaded: boolean;
  setUsersLoaded: (isLoaded: boolean) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  isInviteModalOpen: false,
  setInviteModalOpen: (isOpen) => set({ isInviteModalOpen: isOpen }),
  isUsersLoaded: false,
  setUsersLoaded: (isLoaded) => set({ isUsersLoaded: isLoaded }),
}));
