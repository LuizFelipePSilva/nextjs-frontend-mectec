import Image from "next/image";
import styles from "./page.module.css";
import MeuComponent from "../components/MeuComponente";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <MeuComponent />

        <Image
          className={styles.logo}
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
      </main>
    </div>
  );
}
