import Head from "next/head";
import styles from "@/styles/Home.module.css";
import dynamic from 'next/dynamic';
const MapComponent = dynamic(() => import('../components/Map'), {
  ssr: false
});

export default function Home() {
  return (
    <>
      <div>
      <Head>
        <title>Drone Pilot Mapping</title>
        <meta name="description" content="Map of Drone Flying Pilots" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main >
        <h1 className={styles.title}>
          Drone Pilot Mapping
        </h1>
        <MapComponent />
      </main>
    </div>
    </>
  );
}
