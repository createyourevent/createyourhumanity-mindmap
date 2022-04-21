import PersistenceManager from "../components/PersistenceManager";

declare global {
    interface Window {
        PersistenceManager: PersistenceManager;
    }
}

export {};