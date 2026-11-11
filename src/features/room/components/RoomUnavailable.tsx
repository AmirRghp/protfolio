import styles from "./RoomPreview.module.css";

export type RoomUnavailableProps = {
  onExitToFlat?: () => void;
};

export default function RoomUnavailable({ onExitToFlat }: RoomUnavailableProps = {}) {
  return (
    <div className={styles.unavailableBox}>
      <p className={styles.message} role="status">
        The 3D view is unavailable. You can read the full portfolio below.
      </p>
      {onExitToFlat && (
        <button
          type="button"
          className={styles.unavailableActionBtn}
          onClick={onExitToFlat}
        >
          Open 2D Portfolio
        </button>
      )}
    </div>
  );
}
