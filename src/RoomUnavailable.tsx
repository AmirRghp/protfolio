import styles from "./RoomPreview.module.css";

export default function RoomUnavailable() {
  return <p className={styles.message}>The 3D view is unavailable. You can read the full portfolio below.</p>;
}
